import type { Dayjs } from 'dayjs';
import type { useMultiUploadState } from '@/app/hooks/useMultiUploadState';

export type SpecialCourseRecord = {
  id?: number | string;
  textbookId?: number | string;
  textbookName?: string;
  teacher?: string;
  status?: number | string;
  type?: number | string;
  saleBeginAt?: string;
  saleEndAt?: string;
  beginAt?: string;
  endAt?: string;
  orgAmt?: number | string;
  amt?: number | string;
  num?: number | string;
  chatNo?: string;
  iconDetail?: string;
  iconTicket?: string;
} & Record<string, unknown>;

export type SpecialCourseQuery = {
  startTime: string;
  endTime: string;
  pageNum: number;
  pageSize: number;
};

export type SpecialCourseListResult = {
  data?: SpecialCourseRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type SpecialCourseBookOption = {
  id: number | string;
  name?: string;
} & Record<string, unknown>;

export type SpecialCourseBookListResult = {
  data?: SpecialCourseBookOption[];
  totalCount?: number;
} & Record<string, unknown>;

export type SpecialCourseFormValues = {
  textbookId?: string;
  textbookName: string;
  teacher: string;
  saleBeginAt?: Dayjs;
  saleEndAt?: Dayjs;
  type?: string;
  beginAt?: Dayjs;
  endAt?: Dayjs;
  orgAmt?: number;
  amt?: number;
  num?: number;
  chatNo?: string;
  iconDetail?: string;
  iconTicket?: string;
  status?: string;
};

export type SpecialCourseSearchValues = {
  startTime?: Dayjs;
  endTime?: Dayjs;
};

export type SpecialCourseSelectOption = {
  value: string;
  label: string;
};

export type SpecialCourseUploadField = 'iconDetail' | 'iconTicket';

export type SpecialCourseUploadState = ReturnType<
  typeof useMultiUploadState<SpecialCourseUploadField>
>['uploadState'];
