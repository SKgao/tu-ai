import type { Dayjs } from 'dayjs';
import type { UploadFile } from 'antd';

export type SourceMaterialRecord = {
  id: number | string;
  textbookId?: number | string;
  text?: string;
  icon?: string;
  audio?: string;
  translation?: string;
  explainsArray?: string;
  createdAt?: string;
} & Record<string, unknown>;

export type SourceMaterialBookOption = {
  id: number | string;
  name?: string;
} & Record<string, unknown>;

export type SourceMaterialQuery = {
  startTime: string;
  endTime: string;
  text: string;
  openLike: '' | 1;
  pageNum: number;
  pageSize: number;
};

export type SourceMaterialListResult = {
  data?: SourceMaterialRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type SourceMaterialBookListResult = {
  data?: SourceMaterialBookOption[];
  totalCount?: number;
} & Record<string, unknown>;

export type SourceMaterialSearchValues = {
  startTime?: Dayjs;
  endTime?: Dayjs;
  text?: string;
  fuzzySearch?: boolean;
};

export type SourceMaterialFormValues = {
  id?: number;
  textbookId?: string;
  text: string;
  icon?: string;
  audio?: string;
  translation?: string;
  explainsArray?: string;
};

export type ImportSourceMaterialFormValues = {
  textbookId?: string;
  audioArray: UploadFile[];
  imageArray: UploadFile[];
  sentensArray: UploadFile[];
};
