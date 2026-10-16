export type SessionRecord = {
  id: number | string;
  title?: string;
  icon?: string;
  sort?: number | string;
  status?: number | string;
  textbookId?: number | string;
} & Record<string, unknown>;

export type SessionListResult = {
  data?: SessionRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type CustomPassOption = {
  id: number | string;
  title?: string;
} & Record<string, unknown>;

export type CustomPassListResult = {
  data?: CustomPassOption[];
  totalCount?: number;
} & Record<string, unknown>;

export type BoundCustomPassRecord = {
  id: number | string;
  customTitle?: string;
  title?: string;
  icon?: string;
  sort?: number | string;
} & Record<string, unknown>;

export type SessionFormValues = {
  id?: number;
  textbookId?: number;
  title: string;
  icon?: string;
  sort?: number;
};

export type SelectedSession = {
  id: number | string;
  title?: string;
};

export type SessionBindSelections = Record<string, string>;
