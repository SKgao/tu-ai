export type MenuRecord = {
  id: number;
  menuName?: string;
  name?: string;
  parentId?: number | string;
  sortValue?: number | string;
  path?: string;
  icon?: string;
  menuScope?: number | string;
  url?: string;
  status?: number | string;
  createdAt?: string;
  updatedAt?: string;
  children?: MenuRecord[];
} & Record<string, unknown>;

export type MenuQuery = {
  menuName: string;
  pageNum: number;
  pageSize: number;
};

export type MenuListResult = {
  data?: MenuRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type MenuFormValues = {
  id?: number;
  menuName: string;
  parentId: number;
  sortValue: number;
  path: string;
  icon: string;
  menuScope: string;
  url: string;
  status: string;
};

export type MenuSearchValues = {
  menuName?: string;
};

export type MenuSelectOption = {
  value: string;
  label: string;
};

export type MenuParentOption = {
  value: number;
  label: string;
  disabled?: boolean;
};
