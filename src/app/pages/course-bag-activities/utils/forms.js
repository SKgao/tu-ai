import dayjs from 'dayjs';
import { fromApiDateTime, toApiDateTime } from '@/app/lib/dateTime';

export const EMPTY_FORM = {
  id: undefined,
  textbookId: undefined,
  textbookName: '',
  saleBeginAt: undefined,
  saleEndAt: undefined,
  presaleDays: undefined,
  teacher: '',
  status: '1',
  type: '1',
  beginAt: undefined,
  endAt: undefined,
  courseDays: undefined,
  orgAmt: undefined,
  amt: undefined,
  num: undefined,
  chatNo: '',
  iconDetail: '',
  iconTicket: '',
};

export const COURSE_BAG_ACTIVITY_STATUS_OPTIONS = [
  { value: '1', label: '正常' },
  { value: '2', label: '下架' },
];

export const COURSE_BAG_ACTIVITY_TYPE_OPTIONS = [
  { value: '1', label: '统一开课' },
  { value: '2', label: '购买生效' },
  { value: '3', label: '闯关解锁' },
];

export function normalizeCourseBagActivityFormValues(activity) {
  if (!activity) {
    return { ...EMPTY_FORM };
  }

  return {
    id: Number(activity.id || 0) || undefined,
    textbookId: activity.textbookId ? String(activity.textbookId) : undefined,
    textbookName: activity.textbookName || '',
    saleBeginAt: activity.saleBeginAt ? dayjs(fromApiDateTime(activity.saleBeginAt)) : undefined,
    saleEndAt: activity.saleEndAt ? dayjs(fromApiDateTime(activity.saleEndAt)) : undefined,
    presaleDays: undefined,
    teacher: activity.teacher || '',
    status: String(activity.status ?? '1'),
    type: String(activity.type ?? '1'),
    beginAt: activity.beginAt ? dayjs(fromApiDateTime(activity.beginAt)) : undefined,
    endAt: activity.endAt ? dayjs(fromApiDateTime(activity.endAt)) : undefined,
    courseDays: undefined,
    orgAmt:
      activity.orgAmt !== undefined && activity.orgAmt !== null
        ? Number((Number(activity.orgAmt) / 100).toFixed(2))
        : undefined,
    amt:
      activity.amt !== undefined && activity.amt !== null
        ? Number((Number(activity.amt) / 100).toFixed(2))
        : undefined,
    num: activity.num !== undefined && activity.num !== null ? Number(activity.num) : undefined,
    chatNo: activity.chatNo || '',
    iconDetail: activity.iconDetail || '',
    iconTicket: activity.iconTicket || '',
  };
}

export function isIntegerValue(value) {
  return /^\d+$/.test(String(value));
}

export function validateCreateCourseBagActivityForm(values) {
  if (
    values.id === undefined ||
    !values.textbookId ||
    !values.saleBeginAt ||
    values.presaleDays === undefined ||
    !values.teacher?.trim() ||
    values.orgAmt === undefined ||
    values.amt === undefined ||
    values.num === undefined
  ) {
    return '请完整填写活动 ID、课程、预售时间、教师、金额和数量';
  }

  if (!isIntegerValue(values.id) || !isIntegerValue(values.textbookId)) {
    return '活动 ID 和课程 ID 必须为整数';
  }

  if (!isIntegerValue(values.presaleDays)) {
    return '预售持续天数必须为整数';
  }

  if (Number(values.type) === 1) {
    if (!values.beginAt || values.courseDays === undefined) {
      return '统一开课模式必须填写开课时间和持续天数';
    }

    if (!isIntegerValue(values.courseDays)) {
      return '开课持续天数必须为整数';
    }
  }

  if (Number.isNaN(Number(values.orgAmt)) || Number.isNaN(Number(values.amt))) {
    return '金额必须为数字';
  }

  if (!isIntegerValue(values.num)) {
    return '课程数量必须为整数';
  }

  return '';
}

export function validateEditCourseBagActivityForm(values) {
  if (
    values.id === undefined ||
    !values.saleBeginAt ||
    !values.saleEndAt ||
    !values.teacher?.trim() ||
    values.orgAmt === undefined ||
    values.amt === undefined ||
    values.num === undefined
  ) {
    return '请完整填写活动时间、教师、金额和数量';
  }

  if (Number.isNaN(Number(values.orgAmt)) || Number.isNaN(Number(values.amt))) {
    return '金额必须为数字';
  }

  if (!isIntegerValue(values.num)) {
    return '课程数量必须为整数';
  }

  const saleBeginAt = dayjs(values.saleBeginAt);
  const saleEndAt = dayjs(values.saleEndAt);

  if (saleBeginAt.isAfter(saleEndAt)) {
    return '预售开始时间不能大于预售结束时间';
  }

  if (Number(values.type) === 1) {
    if (!values.beginAt || !values.endAt) {
      return '统一开课模式必须填写开课和结课时间';
    }

    const beginAt = dayjs(values.beginAt);
    const endAt = dayjs(values.endAt);

    if (beginAt.isAfter(endAt)) {
      return '开课时间不能大于结课时间';
    }
  }

  return '';
}

export function buildCreateCourseBagActivityPayload(values) {
  const saleBeginAt = dayjs(values.saleBeginAt);
  const payload = {
    id: Number(values.id),
    textbookId: Number(values.textbookId),
    saleBeginAt: toApiDateTime(values.saleBeginAt),
    saleEndAt: saleBeginAt.add(Number(values.presaleDays), 'day').format('YYYY-MM-DD HH:mm:ss'),
    teacher: values.teacher.trim(),
    status: Number(values.status),
    type: Number(values.type),
    orgAmt: Math.round(Number(values.orgAmt) * 100),
    amt: Math.round(Number(values.amt) * 100),
    num: Number(values.num),
    chatNo: values.chatNo?.trim() || '',
    iconDetail: values.iconDetail?.trim() || '',
    iconTicket: values.iconTicket?.trim() || '',
  };

  if (Number(values.type) === 1) {
    const beginAt = dayjs(values.beginAt);
    payload.beginAt = toApiDateTime(values.beginAt);
    payload.endAt = beginAt.add(Number(values.courseDays), 'day').format('YYYY-MM-DD HH:mm:ss');
  } else {
    payload.beginAt = '';
    payload.endAt = '';
  }

  return payload;
}

export function buildEditCourseBagActivityPayload(values) {
  const payload = {
    id: Number(values.id),
    textbookName: values.textbookName?.trim() || '',
    teacher: values.teacher.trim(),
    saleBeginAt: toApiDateTime(values.saleBeginAt),
    saleEndAt: toApiDateTime(values.saleEndAt),
    status: Number(values.status),
    type: Number(values.type),
    orgAmt: Math.round(Number(values.orgAmt) * 100),
    amt: Math.round(Number(values.amt) * 100),
    num: Number(values.num),
    chatNo: values.chatNo?.trim() || '',
    iconDetail: values.iconDetail?.trim() || '',
    iconTicket: values.iconTicket?.trim() || '',
  };

  if (Number(values.type) === 1) {
    payload.beginAt = toApiDateTime(values.beginAt);
    payload.endAt = toApiDateTime(values.endAt);
  } else {
    payload.beginAt = '';
    payload.endAt = '';
  }

  return payload;
}
