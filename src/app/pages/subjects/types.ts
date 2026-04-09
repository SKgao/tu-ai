import type { Dayjs } from 'dayjs';

export type SubjectRecord = {
  id: number | string;
  unitsName?: string;
  partsTips?: string;
  partsTitle?: string;
  customsPassId?: number | string;
  customsPassName?: string;
  sourceIds?: string;
  sort?: number | string;
  createdAt?: string;
  sceneGraph?: string;
} & Record<string, unknown>;

export type SubjectResourceRecord = {
  id?: number | string;
  text?: string;
  icon?: string;
  audio?: string;
} & Record<string, unknown>;

export type SubjectDetailRecord = SubjectRecord & {
  sourceVOS?: SubjectResourceRecord[];
};

export type SubjectTypeOption = {
  id: number | string;
  name?: string;
} & Record<string, unknown>;

export type SubjectQuery = {
  startTime: string;
  endTime: string;
  customsPassId: string;
  customsPassName: string;
  sourceIds: string;
  pageNum: number;
  pageSize: number;
};

export type SubjectListResult = {
  data?: SubjectRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type SubjectSearchValues = {
  startTime?: Dayjs;
  endTime?: Dayjs;
  customsPassName?: string;
  sourceIds?: string;
};

export type SubjectFormValues = {
  id?: number;
  customsPassId?: string;
  customsPassName: string;
  sourceIds: string;
  sort?: number;
  showIndex: string;
  subject?: string;
  icon: string;
  audio: string;
  sentenceAudio: string;
  sceneGraph: string;
  originalSceneGraph: string;
};

export type SubjectUploadField = 'icon' | 'audio' | 'sentenceAudio' | 'sceneGraph';
