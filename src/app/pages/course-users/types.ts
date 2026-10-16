export type CourseUserRecord = {
  textbookId?: number | string;
  textbookName?: string;
  tutuNumber?: string | number;
  mobile?: string | number;
  realName?: string;
  sex?: number | string;
  payAmt?: number | string;
  buyAt?: string;
  beginAt?: string;
  endAt?: string;
} & Record<string, unknown>;

export type CourseUserBookOption = {
  textbookId?: number | string;
  textbookName?: string;
} & Record<string, unknown>;

export type CourseUserSexOption = {
  value: string;
  label: string;
};

export type CourseUserQuery = {
  pageNum: number;
  pageSize: number;
  textbookId: string;
  tutuNumber: string;
  mobile: string;
  realName: string;
  sex: string;
};

export type CourseUserListResult = {
  data?: CourseUserRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type CourseUserFormValues = {
  realName: string;
  mobile: string;
  sex: string;
  payAmt?: number;
  textbookId?: string;
};

export type CourseUserSearchValues = {
  textbookId?: string;
  tutuNumber?: string;
  mobile?: string;
  realName?: string;
  sex?: string;
};
