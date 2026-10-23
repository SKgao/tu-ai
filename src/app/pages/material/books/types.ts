import type { Dayjs } from 'dayjs';

export type BookTabKey = 'book' | 'grade' | 'version';
export type ResourceType = Exclude<BookTabKey, 'book'>;

export type GradeRecord = {
  id: number | string;
  gradeName?: string;
  status?: number | string | null;
} & Record<string, unknown>;

export type VersionRecord = {
  id: number | string;
  name?: string;
  memo?: string;
} & Record<string, unknown>;

export type BookRecord = {
  id: number | string;
  name?: string;
  icon?: string;
  gradeId?: number | string;
  gradeName?: string;
  bookVersionId?: number | string;
  bookVersionName?: string;
  createdAt?: string;
  status?: number | string | null;
  canLock?: number | string | null;
} & Record<string, unknown>;

export type BookQuery = {
  startTime: string;
  endTime: string;
  gradeId: string;
  bookVersionId: string;
  pageNum: number;
  pageSize: number;
};

export type BookListResult = {
  data?: BookRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type BookSearchValues = {
  startTime?: Dayjs;
  endTime?: Dayjs;
  gradeId?: string;
  bookVersionId?: string;
};

export type BookFormValues = {
  id?: number;
  name: string;
  icon?: string;
  gradeId?: string;
  bookVersionId?: string;
  status?: number;
};

export type ResourceFormValues = {
  id?: number;
  name: string;
  sortValue?: number;
};
