import type { Dayjs } from 'dayjs';

export type MemberInfoRecord = {
  userId?: number | string;
  tutuNumber?: string | number;
  realName?: string;
  icon?: string;
  userLevelName?: string;
  hasBuyTextbook?: number | string;
  payTime?: string;
  exprieTime?: string;
  createdAt?: string;
} & Record<string, unknown>;

export type MemberInfoQuery = {
  pageNum: number;
  pageSize: number;
  userLevelIds: number[];
  expireStartTime: string;
  expireEndTime: string;
  payStartTime: string;
  payEndTime: string;
  registerStartTime: string;
  registerEndTime: string;
  tutuNumber: string;
  mobile: string;
};

export type MemberInfoListResult = {
  data?: MemberInfoRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type MemberInfoSearchValues = {
  registerStartTime?: Dayjs;
  registerEndTime?: Dayjs;
  payStartTime?: Dayjs;
  payEndTime?: Dayjs;
  expireStartTime?: Dayjs;
  expireEndTime?: Dayjs;
  userLevelIds?: string[];
  tutuNumber?: string;
  mobile?: string;
};

export type MemberLevelFilterOption = {
  userLevel: string;
  levelName: string;
};
