import dayjs from 'dayjs';
import { fromApiDateTime, toApiDateTime } from '@/app/lib/dateTime';
import type {
  ActivityFormValues,
  ActivityQuery,
  ActivityRecord,
  ActivitySearchValues,
} from '../types';

export const EMPTY_ACTIVITY_FORM: ActivityFormValues = {
  id: undefined,
  title: '',
  content: '',
  icon: '',
  activeMoney: undefined,
  activityType: '1',
  itemId: undefined,
  activeExpireDays: undefined,
  beginAt: undefined,
  endAt: undefined,
  url: '',
};

export const INITIAL_FILTERS: ActivitySearchValues = {
  startTime: undefined,
  endTime: undefined,
  id: undefined,
};

export const INITIAL_QUERY: ActivityQuery = {
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
] as const;

export function normalizeActivityFormValues(activity?: ActivityRecord | null): ActivityFormValues {
  if (!activity) {
    return { ...EMPTY_ACTIVITY_FORM };
  }

  return {
    id: Number(activity.id),
    title: String(activity.title || ''),
    content: String(activity.content || ''),
    icon: String(activity.icon || ''),
    activeMoney:
      activity.activeMoney !== undefined && activity.activeMoney !== null
        ? Number((Number(activity.activeMoney) / 100).toFixed(2))
        : undefined,
    activityType: String(activity.activityType ?? '1'),
    itemId:
      activity.itemId !== undefined && activity.itemId !== null ? String(activity.itemId) : undefined,
    activeExpireDays:
      activity.activeExpireDays !== undefined && activity.activeExpireDays !== null
        ? Number(activity.activeExpireDays)
        : undefined,
    beginAt: activity.beginAt ? dayjs(fromApiDateTime(activity.beginAt)) : undefined,
    endAt: activity.endAt ? dayjs(fromApiDateTime(activity.endAt)) : undefined,
    url: String(activity.url || ''),
  };
}

export function buildActivitySearchFilters(values: ActivitySearchValues): Partial<ActivityQuery> {
  return {
    startTime: toApiDateTime(values.startTime),
    endTime: toApiDateTime(values.endTime),
    id: values.id || '',
  };
}

export function validateActivityForm(values: ActivityFormValues): string {
  if (!values.title?.trim() || !values.beginAt || !values.endAt) {
    return '请填写活动标题并选择开始/结束时间';
  }

  const beginAt = dayjs(values.beginAt);
  const endAt = dayjs(values.endAt);

  if (beginAt.isAfter(endAt)) {
    return '活动开始时间不能大于结束时间';
  }

  const isPurchaseActivity = String(values.activityType) === '1';
  if (isPurchaseActivity && !values.itemId) {
    return '购买活动必须选择参与活动商品';
  }

  return '';
}

export function buildActivityPayload(
  values: ActivityFormValues,
  modalMode: string,
): Record<string, string | number | undefined> {
  const beginAt = dayjs(values.beginAt);
  const endAt = dayjs(values.endAt);
  const isPurchaseActivity = String(values.activityType) === '1';
  const diffDays = Math.floor(endAt.diff(beginAt, 'day', true));

  return {
    title: values.title.trim(),
    content: values.content?.trim() || '',
    icon: values.icon?.trim() || '',
    url: values.url?.trim() || '',
    activityType: Number(values.activityType || '1'),
    beginAt: toApiDateTime(values.beginAt),
    endAt: toApiDateTime(values.endAt),
    activeExpireDays:
      modalMode === 'create'
        ? diffDays
        : values.activeExpireDays
          ? Number(values.activeExpireDays)
          : undefined,
    itemId: isPurchaseActivity && values.itemId ? Number(values.itemId) : undefined,
    activeMoney:
      isPurchaseActivity && values.activeMoney !== undefined
        ? Math.round(Number(values.activeMoney) * 100)
        : undefined,
  };
}
