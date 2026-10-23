export type MemberLevelRecord = {
  userLevel: number | string;
  levelName?: string;
  explainInfo?: string;
  exprieDays?: number | string | null;
  orgMoney?: number | string | null;
  needMoney?: number | string | null;
  icon?: string;
} & Record<string, unknown>;

export type MemberLevelFormValues = {
  userLevel?: number;
  levelName: string;
  explainInfo?: string;
  exprieDays?: number;
  orgMoney?: number;
  needMoney?: number;
  icon?: string;
};
