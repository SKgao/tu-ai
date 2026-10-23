export type CourseOrderRecord = {
  id?: number | string;
  tutuNumber?: string | number;
  realName?: string;
  itemName?: string;
  orderNo?: string;
  orderAmount?: number | string;
  payTypeName?: string;
  orderStatusDesc?: string;
  payTime?: string;
  outNo?: string;
  cancelReason?: string;
  activityName?: string;
  createdAt?: string;
} & Record<string, unknown>;

export type CourseOrderFilterValues = {
  tutuNumber?: string;
  orderNo?: string;
  payType?: string;
  orderStatus?: string;
  textbookId?: string;
};

export type CourseOrderQuery = {
  tutuNumber: string;
  orderNo: string;
  payType: string;
  orderStatus: string;
  textbookId: string;
  pageNum: number;
  pageSize: number;
};

export type CourseOrderListResult = {
  data?: CourseOrderRecord[];
  totalCount?: number;
} & Record<string, unknown>;
