export type OrderRecord = {
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

export type OrderFilterValues = {
  tutuNumber?: string;
  orderNo?: string;
  itemId?: string;
  payType?: string;
  orderStatus?: string;
  activityId?: string;
  textbookId?: string;
};

export type OrderQuery = {
  tutuNumber: string;
  orderNo: string;
  itemId: string;
  payType: string;
  orderStatus: string;
  activityId: string;
  textbookId: string;
  pageNum: number;
  pageSize: number;
};

export type OrderListResult = {
  data?: OrderRecord[];
  totalCount?: number;
} & Record<string, unknown>;
