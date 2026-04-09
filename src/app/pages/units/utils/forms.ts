import { toApiDateTime } from '@/app/lib/dateTime';
import type {
  UnitFormValues,
  UnitQuery,
  UnitRecord,
  UnitSearchValues,
} from '../types';

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const EMPTY_UNIT_FORM: UnitFormValues = {
  id: undefined,
  text: '',
  icon: '',
  textBookId: undefined,
  sort: undefined,
};

export function normalizeUnitFormValues(unit?: UnitRecord | null): UnitFormValues {
  if (!unit) {
    return { ...EMPTY_UNIT_FORM };
  }

  return {
    id: Number(unit.id),
    text: unit.text || '',
    icon: unit.icon || '',
    textBookId: unit.textBookId ? String(unit.textBookId) : undefined,
    sort: unit.sort !== undefined && unit.sort !== null ? Number(unit.sort) : undefined,
  };
}

export function buildUnitSearchFilters(
  values: UnitSearchValues = {},
): Pick<UnitQuery, 'startTime' | 'endTime' | 'textBookId'> {
  return {
    startTime: toApiDateTime(values.startTime),
    endTime: toApiDateTime(values.endTime),
    textBookId: values.textBookId || '',
  };
}
