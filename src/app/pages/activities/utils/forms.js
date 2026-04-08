import dayjs from 'dayjs';
import { fromApiDateTime, toApiDateTime } from '@/app/lib/dateTime';

export const EMPTY_ACTIVITY_FORM = {
  id: undefined,
  title: '',
  content: '',
  icon: '',
  activeMoney: undefined,
  status: '1',
  itemId: undefined,
  activeExpireDays: undefined,
  beginAt: undefined,
  endAt: undefined,
  url: '',
};

export const INITIAL_FILTERS = {
  startTime: undefined,
  endTime: undefined,
  id: undefined,
};

export const INITIAL_QUERY = {
  startTime: '',
  endTime: '',
  id: '',
  pageNum: 1,
  pageSize: 10,
};

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const ACTIVITY_TYPE_OPTIONS = [
  { value: '1', label: '购买活动' },
  { value: '2', label: '分享活动' },
];

export function normalizeActivityFormValues(activity) {
  if (!activity) {
    return { ...EMPTY_ACTIVITY_FORM };
  }

  return {
    id: Number(activity.id),
    title: activity.title || '',
    content: activity.content || '',
    icon: activity.icon || '',
    activeMoney:
      activity.activeMoney !== undefined && activity.activeMoney !== null
        ? Number((Number(activity.activeMoney) / 100).toFixed(2))
        : undefined,
    status: String(activity.status ?? '1'),
    itemId:
      activity.itemId !== undefined && activity.itemId !== null ? String(activity.itemId) : undefined,
    activeExpireDays:
      activity.activeExpireDays !== undefined && activity.activeExpireDays !== null
        ? Number(activity.activeExpireDays)
        : undefined,
    beginAt: activity.beginAt ? dayjs(fromApiDateTime(activity.beginAt)) : undefined,
    endAt: activity.endAt ? dayjs(fromApiDateTime(activity.endAt)) : undefined,
    url: activity.url || '',
  };
}

export function buildActivitySearchFilters(values) {
  return {
    startTime: toApiDateTime(values.startTime),
    endTime: toApiDateTime(values.endTime),
    id: values.id || '',
  };
}

export function validateActivityForm(values) {
  if (!values.title?.trim() || !values.beginAt || !values.endAt) {
    return '请填写活动标题并选择开始/结束时间';
  }

  const beginAt = dayjs(values.beginAt);
  const endAt = dayjs(values.endAt);

  if (beginAt.isAfter(endAt)) {
    return '活动开始时间不能大于结束时间';
  }

  const isPurchaseActivity = String(values.status) === '1';
  if (isPurchaseActivity && !values.itemId) {
    return '购买活动必须选择参与活动商品';
  }

  return '';
}

export function buildActivityPayload(values, modalMode) {
  const beginAt = dayjs(values.beginAt);
  const endAt = dayjs(values.endAt);
  const isPurchaseActivity = String(values.status) === '1';
  const diffDays = Math.floor(endAt.diff(beginAt, 'day', true));

  return {
    title: values.title.trim(),
    content: values.content?.trim() || '',
    icon: values.icon?.trim() || '',
    url: values.url?.trim() || '',
    status: Number(values.status),
    beginAt: toApiDateTime(values.beginAt),
    endAt: toApiDateTime(values.endAt),
    activeExpireDays:
      modalMode === 'create' ? diffDays : values.activeExpireDays ? Number(values.activeExpireDays) : undefined,
    itemId: isPurchaseActivity && values.itemId ? Number(values.itemId) : undefined,
    activeMoney:
      isPurchaseActivity && values.activeMoney !== undefined
        ? Math.round(Number(values.activeMoney) * 100)
        : undefined,
  };
}
