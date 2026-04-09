export type LearningRecord = {
  textbookName?: string;
  unitName?: string;
  partName?: string;
  sessionName?: string;
  createdAt?: string;
} & Record<string, unknown>;

export type LearningRecordQuery = {
  pageNum: number;
  pageSize: number;
};

export type LearningRecordListResult = {
  data?: LearningRecord[];
  totalCount?: number;
} & Record<string, unknown>;
