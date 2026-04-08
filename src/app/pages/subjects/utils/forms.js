import { toApiDateTime } from '@/app/lib/dateTime';

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const EMPTY_SUBJECT_FORM = {
  id: undefined,
  customsPassId: undefined,
  customsPassName: '',
  sourceIds: '',
  sort: undefined,
  showIndex: '',
  subject: undefined,
  icon: '',
  audio: '',
  sentenceAudio: '',
  sceneGraph: '',
  originalSceneGraph: '',
};

export function isScenePassId(value) {
  return String(value) === '2' || String(value) === '8';
}

export function buildSearch(searchParams, updates = {}, removals = []) {
  const nextSearch = new URLSearchParams(searchParams);
  removals.forEach((key) => nextSearch.delete(key));
  Object.entries(updates).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) {
      nextSearch.delete(key);
      return;
    }
    nextSearch.set(key, String(value));
  });
  const result = nextSearch.toString();
  return result ? `?${result}` : '';
}

export function buildSubjectSearchFilters(values = {}, routeCustomsPassId = '') {
  return {
    startTime: toApiDateTime(values.startTime),
    endTime: toApiDateTime(values.endTime),
    customsPassId: routeCustomsPassId.trim(),
    customsPassName: values.customsPassName?.trim() || '',
    sourceIds: values.sourceIds?.trim() || '',
  };
}

export function normalizeSubjectFormValues(record, routeCustomsPassId) {
  if (!record) {
    return {
      ...EMPTY_SUBJECT_FORM,
      customsPassId: routeCustomsPassId || undefined,
    };
  }

  return {
    ...EMPTY_SUBJECT_FORM,
    id: Number(record.id),
    customsPassId: String(record.customsPassId || routeCustomsPassId || ''),
    customsPassName: record.customsPassName || '',
    sourceIds: record.sourceIds || '',
    sort: record.sort !== undefined && record.sort !== null ? Number(record.sort) : undefined,
    sceneGraph: record.sceneGraph && record.sceneGraph !== 'null' ? String(record.sceneGraph) : '',
    originalSceneGraph: record.sceneGraph && record.sceneGraph !== 'null' ? String(record.sceneGraph) : '',
  };
}
