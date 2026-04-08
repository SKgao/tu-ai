export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const EMPTY_PASS_FORM = {
  id: undefined,
  title: '',
  icon: '',
  partsId: undefined,
  sort: undefined,
  subject: undefined,
};

export function normalizePassFormValues(pass, partsId) {
  if (!pass) {
    return {
      ...EMPTY_PASS_FORM,
      partsId: partsId ? Number(partsId) : undefined,
    };
  }

  return {
    id: Number(pass.id),
    title: pass.title || '',
    icon: pass.icon || '',
    partsId: pass.partsId !== undefined && pass.partsId !== null ? Number(pass.partsId) : undefined,
    sort: pass.sort !== undefined && pass.sort !== null ? Number(pass.sort) : undefined,
    subject: pass.subject !== undefined && pass.subject !== null ? String(pass.subject) : undefined,
  };
}
