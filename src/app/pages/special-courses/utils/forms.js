import dayjs from 'dayjs';
import { fromApiDateTime, toApiDateTime } from '@/app/lib/dateTime';

export const EMPTY_FORM = {
  textbookId: undefined,
  textbookName: '',
  teacher: '',
  saleBeginAt: undefined,
  saleEndAt: undefined,
  type: '1',
  beginAt: undefined,
  endAt: undefined,
  orgAmt: undefined,
  amt: undefined,
  num: undefined,
  chatNo: '',
  iconDetail: '',
  iconTicket: '',
  status: '1',
};

export const INITIAL_FILTERS = {
  startTime: undefined,
  endTime: undefined,
};

export const INITIAL_QUERY = {
  startTime: '',
  endTime: '',
  pageNum: 1,
  pageSize: 20,
};

export const PAGE_SIZE_OPTIONS = [20, 50, 100];

export const COURSE_STATUS_OPTIONS = [
  { value: '1', label: '正常' },
  { value: '2', label: '下架' },
];

export const COURSE_TYPE_OPTIONS = [
  { value: '1', label: '统一开课' },
  { value: '2', label: '购买生效' },
];

export function buildPayload(values, { allowTextbookIdEdit }) {
  const payload = {
    textbookName: values.textbookName.trim(),
    teacher: values.teacher.trim(),
    saleBeginAt: toApiDateTime(values.saleBeginAt),
    saleEndAt: toApiDateTime(values.saleEndAt),
    type: Number(values.type),
    orgAmt: Math.round(Number(values.orgAmt) * 100),
    amt: Math.round(Number(values.amt) * 100),
    num: Number(values.num),
    chatNo: values.chatNo?.trim() || '',
    iconDetail: values.iconDetail?.trim() || '',
    iconTicket: values.iconTicket?.trim() || '',
    status: Number(values.status),
  };

  if (allowTextbookIdEdit) {
    payload.textbookId = Number(values.textbookId);
  }

  if (Number(values.type) === 1) {
    payload.beginAt = toApiDateTime(values.beginAt);
    payload.endAt = toApiDateTime(values.endAt);
  } else {
    payload.beginAt = '';
    payload.endAt = '';
  }

  return payload;
}

export function validateSpecialCourseForm(values) {
  if (
    !values.textbookId ||
    !values.textbookName?.trim() ||
    !values.teacher?.trim() ||
    !values.saleBeginAt ||
    !values.saleEndAt ||
    values.orgAmt === undefined ||
    values.amt === undefined ||
    values.num === undefined
  ) {
    return '请完整填写课程、教师、预售时间、金额和数量';
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

export function normalizeSpecialCourseFormValues(course) {
  if (!course) {
    return { ...EMPTY_FORM };
  }

  return {
    textbookId: String(course.textbookId || ''),
    textbookName: course.textbookName || '',
    teacher: course.teacher || '',
    saleBeginAt: course.saleBeginAt ? dayjs(fromApiDateTime(course.saleBeginAt)) : undefined,
    saleEndAt: course.saleEndAt ? dayjs(fromApiDateTime(course.saleEndAt)) : undefined,
    type: String(course.type ?? '1'),
    beginAt: course.beginAt ? dayjs(fromApiDateTime(course.beginAt)) : undefined,
    endAt: course.endAt ? dayjs(fromApiDateTime(course.endAt)) : undefined,
    orgAmt:
      course.orgAmt !== undefined && course.orgAmt !== null
        ? Number((Number(course.orgAmt) / 100).toFixed(2))
        : undefined,
    amt:
      course.amt !== undefined && course.amt !== null
        ? Number((Number(course.amt) / 100).toFixed(2))
        : undefined,
    num: course.num !== undefined && course.num !== null ? Number(course.num) : undefined,
    chatNo: course.chatNo || '',
    iconDetail: course.iconDetail || '',
    iconTicket: course.iconTicket || '',
    status: String(course.status ?? '1'),
  };
}

export function buildSpecialCourseSearchFilters(values) {
  return {
    startTime: toApiDateTime(values.startTime),
    endTime: toApiDateTime(values.endTime),
  };
}
