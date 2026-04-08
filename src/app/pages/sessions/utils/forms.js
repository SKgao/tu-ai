export const EMPTY_SESSION_FORM = {
  id: undefined,
  textbookId: undefined,
  title: '',
  icon: '',
  sort: undefined,
};

export function normalizeSessionFormValues(session, textbookId) {
  if (!session) {
    return {
      ...EMPTY_SESSION_FORM,
      textbookId: textbookId ? Number(textbookId) : undefined,
    };
  }

  return {
    id: Number(session.id),
    textbookId: textbookId ? Number(textbookId) : undefined,
    title: session.title || '',
    icon: session.icon || '',
    sort: session.sort !== undefined && session.sort !== null ? Number(session.sort) : undefined,
  };
}
