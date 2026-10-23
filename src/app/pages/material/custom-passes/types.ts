import type { UploadProps } from 'antd';

export type UploadRequestOptions = Parameters<NonNullable<UploadProps['customRequest']>>[0];

export type CustomPassRecord = {
  id: number | string;
  title?: string;
  tmpTitle?: string;
  icon?: string;
  sort?: number | string;
  textbookId?: number | string;
  createdAt?: string;
} & Record<string, unknown>;

export type CustomPassSubjectOption = {
  id: number | string;
  name?: string;
} & Record<string, unknown>;

export type CustomPassQuery = {
  textbookId: string;
  pageNum: number;
  pageSize: number;
};

export type CustomPassListResult = {
  data?: CustomPassRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type CustomPassFormValues = {
  id?: number;
  textbookId?: number;
  title: string;
  tmpTitle: string;
  icon?: string;
  sort?: number;
};

export type TopicFormValues = {
  customsPassId?: string;
  sourceIds: string;
  sort?: number;
  showIndex?: string;
  icon?: string;
  audio?: string;
  sceneGraph?: string;
  sentenceAudio?: string;
  subject?: string;
};

export type TopicUploadField = 'icon' | 'audio' | 'sentenceAudio' | 'sceneGraph';

export type TopicUploadOption = {
  field: TopicUploadField;
  label: string;
  accept: string;
};

export type CustomPassUploadTarget = 'pass' | 'topic';

export type TopicUploadHandler = (
  options: UploadRequestOptions,
  field: TopicUploadField,
  target: CustomPassUploadTarget,
) => void | Promise<void>;
