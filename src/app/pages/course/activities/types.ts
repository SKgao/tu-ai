import type { Dayjs } from 'dayjs';

export type ActivityRecord = {
  id: number | string;
  title?: string;
  content?: string;
  icon?: string;
  activeMoney?: number | string | null;
  status?: number | string | null;
  activityType?: number | string | null;
  itemId?: number | string | null;
  activeExpireDays?: number | string | null;
  beginAt?: string;
  endAt?: string;
  createdAt?: string;
  url?: string;
} & Record<string, unknown>;

export type ActivityOptionRecord = {
  id: number | string;
  title?: string;
} & Record<string, unknown>;

export type MemberLevelOption = {
  userLevel: number | string;
  levelName?: string;
} & Record<string, unknown>;

export type ActivitySearchValues = {
  startTime?: Dayjs;
  endTime?: Dayjs;
  id?: string;
};

export type ActivityQuery = {
  startTime: string;
  endTime: string;
  id: string;
  pageNum: number;
  pageSize: number;
};

export type ActivityFormValues = {
  id?: number;
  title: string;
  content?: string;
  icon?: string;
  activeMoney?: number;
  activityType?: string;
  itemId?: string;
  activeExpireDays?: number;
  beginAt?: Dayjs;
  endAt?: Dayjs;
  url?: string;
};

export type ActivityListResult = {
  data?: ActivityRecord[];
  totalCount?: number;
} & Record<string, unknown>;
