import type { Dayjs } from 'dayjs';
import type { useMultiUploadState } from '@/app/hooks/useMultiUploadState';

export type CourseBagActivityRecord = {
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

export type CourseBagActivityListResult = {
  data?: CourseBagActivityRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type CourseBagActivityUploadField = 'iconDetail' | 'iconTicket';

export type CourseBagActivityUploadState = ReturnType<
  typeof useMultiUploadState<CourseBagActivityUploadField>
>['uploadState'];

export type CourseBagActivityFormValues = {
  id?: number;
  textbookId?: string;
  textbookName?: string;
  saleBeginAt?: Dayjs;
  saleEndAt?: Dayjs;
  presaleDays?: number;
  teacher?: string;
  status?: string;
  type?: string;
  beginAt?: Dayjs;
  endAt?: Dayjs;
  courseDays?: number;
  orgAmt?: number;
  amt?: number;
  num?: number;
  chatNo?: string;
  iconDetail?: string;
  iconTicket?: string;
};

export type CourseBagOption = {
  textbookId: string;
  textbookName: string;
};

export type CourseBagActivitySelectOption = {
  value: string;
  label: string;
};
