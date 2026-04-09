import type { Dayjs } from 'dayjs';

export type UnitRecord = {
  id: number | string;
  text?: string;
  icon?: string;
  textBookId?: number | string;
  textBookName?: string;
  sort?: number | string;
  canLock?: number | string;
  createdAt?: string;
} & Record<string, unknown>;

export type UnitBookOption = {
  id: number | string;
  name?: string;
} & Record<string, unknown>;

export type UnitQuery = {
  startTime: string;
  endTime: string;
  textBookId: string;
  pageNum: number;
  pageSize: number;
};

export type UnitListResult = {
  data?: UnitRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type UnitBookListResult = {
  data?: UnitBookOption[];
  totalCount?: number;
} & Record<string, unknown>;

export type UnitSearchValues = {
  startTime?: Dayjs;
  endTime?: Dayjs;
  textBookId?: string;
};

export type UnitFormValues = {
  id?: number;
  text: string;
  icon?: string;
  textBookId?: string;
  sort?: number;
};
