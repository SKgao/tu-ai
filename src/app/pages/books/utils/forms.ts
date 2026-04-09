import type {
  BookFormValues,
  BookRecord,
  ResourceFormValues,
  ResourceType,
  VersionRecord,
  GradeRecord,
} from '../types';

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const EMPTY_BOOK_FORM: BookFormValues = {
  id: undefined,
  name: '',
  icon: '',
  gradeId: undefined,
  bookVersionId: undefined,
  status: undefined,
};

export const EMPTY_RESOURCE_FORM: ResourceFormValues = {
  id: undefined,
  name: '',
  sortValue: undefined,
};

export function normalizeBookFormValues(book?: BookRecord | null): BookFormValues {
  if (!book) {
    return { ...EMPTY_BOOK_FORM };
  }

  return {
    id: Number(book.id),
    name: String(book.name || ''),
    icon: String(book.icon || ''),
    gradeId: book.gradeId ? String(book.gradeId) : undefined,
    bookVersionId: book.bookVersionId ? String(book.bookVersionId) : undefined,
    status: book.status !== undefined && book.status !== null ? Number(book.status) : undefined,
  };
}

export function normalizeResourceFormValues(
  type: ResourceType,
  item?: GradeRecord | VersionRecord | null,
): ResourceFormValues {
  if (!item) {
    return { ...EMPTY_RESOURCE_FORM };
  }

  return {
    id: Number(item.id),
    name: type === 'grade' ? String((item as GradeRecord).gradeName || '') : String(item.name || ''),
    sortValue:
      type === 'grade' && item.status !== undefined && item.status !== null
        ? Number(item.status)
        : undefined,
  };
}
