import type { Dayjs } from 'dayjs';

export type MemberTabKey = 'members' | 'feedback';

export type MemberStatusAction = 'enable' | 'disable';

export type MemberRecord = {
  userId?: number | string;
  tutuNumber?: string | number;
  realName?: string;
  icon?: string;
  inviteCount?: number | string;
  userLevelName?: string;
  channel?: number | string;
  hasBuyTextbook?: number | string;
  payTime?: string;
  exprieTime?: string;
  userMoney?: number | string;
  mobile?: string | number;
  email?: string;
  birthday?: string;
  sex?: number | string;
  hasSetPassword?: number | string;
  createdAt?: string;
  bookVersionName?: string;
  textbookNamePractice?: string;
} & Record<string, unknown>;

export type MemberFeedbackRecord = {
  tutuNumber?: string | number;
  mobile?: string | number;
  content?: string;
  createdAt?: string;
} & Record<string, unknown>;

export type MemberQuery = {
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
  sex: string;
  hasSetPassword: string;
  sortInvite: string;
  sortUserId: string;
};

export type MemberFeedbackQuery = {
  pageNum: number;
  pageSize: number;
  startTime: string;
  endTime: string;
  tutuNumber: string;
  mobile: string;
};

export type MemberListResult = {
  data?: MemberRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type MemberFeedbackListResult = {
  data?: MemberFeedbackRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type MemberSearchValues = {
  registerStartTime?: Dayjs;
  registerEndTime?: Dayjs;
  payStartTime?: Dayjs;
  payEndTime?: Dayjs;
  expireStartTime?: Dayjs;
  expireEndTime?: Dayjs;
  userLevelIds?: string[];
  tutuNumber?: string;
  mobile?: string;
  sex?: string;
  hasSetPassword?: string;
  sortInvite?: string;
  sortUserId?: string;
};

export type MemberFeedbackSearchValues = {
  startTime?: Dayjs;
  endTime?: Dayjs;
  tutuNumber?: string;
  mobile?: string;
};

export type VipGrantFormValues = {
  userId: string;
  userLevel?: string;
};

export type MemberLevelSelectOption = {
  value: string;
  label: string;
};

export type MemberSelectOption = {
  value: string;
  label: string;
};
