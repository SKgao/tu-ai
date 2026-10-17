import type { PartFormValues, PartLockOption, PartRecord } from '../types';

export const EMPTY_PART_FORM: PartFormValues = {
  id: undefined,
  title: '',
  icon: '',
  unitsId: undefined,
  tips: '',
  sort: undefined,
  canLock: '1',
};

export const PART_LOCK_OPTIONS: PartLockOption[] = [
  { value: '1', label: '已解锁' },
  { value: '2', label: '已锁定' },
];

export function normalizePartFormValues(part: PartRecord | null, unitId: string): PartFormValues {
  if (!part) {
    return {
      ...EMPTY_PART_FORM,
      unitsId: unitId ? Number(unitId) : undefined,
    };
  }

  return {
    id: Number(part.id),
    title: part.title || '',
    icon: part.icon || '',
    unitsId: part.unitsId !== undefined && part.unitsId !== null ? Number(part.unitsId) : undefined,
    tips: part.tips || '',
    sort: part.sort !== undefined && part.sort !== null ? Number(part.sort) : undefined,
    canLock: String(part.canLock ?? 1),
  };
}
