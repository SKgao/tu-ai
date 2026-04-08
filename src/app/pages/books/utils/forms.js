export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const EMPTY_BOOK_FORM = {
  id: undefined,
  name: '',
  icon: '',
  gradeId: undefined,
  bookVersionId: undefined,
  status: undefined,
};

export const EMPTY_RESOURCE_FORM = {
  id: undefined,
  name: '',
  sortValue: undefined,
};

export function normalizeBookFormValues(book) {
  if (!book) {
    return { ...EMPTY_BOOK_FORM };
  }

  return {
    id: Number(book.id),
    name: book.name || '',
    icon: book.icon || '',
    gradeId: book.gradeId ? String(book.gradeId) : undefined,
    bookVersionId: book.bookVersionId ? String(book.bookVersionId) : undefined,
    status: book.status !== undefined && book.status !== null ? Number(book.status) : undefined,
  };
}

export function normalizeResourceFormValues(type, item) {
  if (!item) {
    return { ...EMPTY_RESOURCE_FORM };
  }

  return {
    id: Number(item.id),
    name: type === 'grade' ? item.gradeName || '' : item.name || '',
    sortValue:
      type === 'grade' && item.status !== undefined && item.status !== null
        ? Number(item.status)
        : undefined,
  };
}
