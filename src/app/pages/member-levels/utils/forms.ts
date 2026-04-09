import type { MemberLevelFormValues, MemberLevelRecord } from '../types';

export const EMPTY_LEVEL_FORM: MemberLevelFormValues = {
  userLevel: undefined,
  levelName: '',
  explainInfo: '',
  exprieDays: undefined,
  orgMoney: undefined,
  needMoney: undefined,
  icon: '',
};

export function toAmountCent(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  return Math.round(Number(value) * 100);
}

export function fromAmountCent(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  return Number((Number(value) / 100).toFixed(2));
}

export function normalizeMemberLevelFormValues(level?: MemberLevelRecord | null): MemberLevelFormValues {
  if (!level) {
    return { ...EMPTY_LEVEL_FORM };
  }

  return {
    userLevel: Number(level.userLevel),
    levelName: String(level.levelName || ''),
    explainInfo: String(level.explainInfo || ''),
    exprieDays:
      level.exprieDays !== undefined && level.exprieDays !== null ? Number(level.exprieDays) : undefined,
    orgMoney: fromAmountCent(level.orgMoney),
    needMoney: fromAmountCent(level.needMoney),
    icon: String(level.icon || ''),
  };
}
