export type PartRecord = {
  id: number | string;
  title?: string;
  icon?: string;
  tips?: string;
  sort?: number | string;
  canLock?: number | string;
  unitsId?: number | string;
} & Record<string, unknown>;

export type PartQuery = {
  unitId: string;
  pageNum: number;
  pageSize: number;
};

export type PartListResult = {
  data?: PartRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type PartFormValues = {
  id?: number;
  title: string;
  icon?: string;
  unitsId?: number;
  tips?: string;
  sort?: number;
  canLock?: string;
};

export type PartLockOption = {
  value: string;
  label: string;
};
