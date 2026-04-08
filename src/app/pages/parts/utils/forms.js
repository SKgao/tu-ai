export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const EMPTY_PART_FORM = {
  id: undefined,
  title: '',
  icon: '',
  unitsId: undefined,
  tips: '',
  sort: undefined,
  canLock: '1',
};

export const PART_LOCK_OPTIONS = [
  { value: '1', label: '已解锁' },
  { value: '2', label: '已锁定' },
];

export function normalizePartFormValues(part, unitId) {
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
