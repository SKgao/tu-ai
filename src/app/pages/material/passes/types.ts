export type PassRecord = {
  id: number | string;
  title?: string;
  icon?: string;
  customerNumber?: number | string;
  sort?: number | string;
  totalScore?: number | string;
  createdAt?: string;
  partsId?: number | string;
  subject?: number | string;
} & Record<string, unknown>;

export type PassSubjectOption = {
  id: number | string;
  name?: string;
} & Record<string, unknown>;

export type PassQuery = {
  partsId: string;
  pageNum: number;
  pageSize: number;
};

export type PassListResult = {
  data?: PassRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type PassFormValues = {
  id?: number;
  title: string;
  icon: string;
  partsId?: number;
  sort?: number;
  subject?: string;
};
