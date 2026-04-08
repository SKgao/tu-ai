export const EMPTY_COURSE_BAG_FORM = {
  id: undefined,
  title: '',
  icon: '',
  sort: undefined,
};

export function normalizeCourseBagFormValues(bag) {
  if (!bag) {
    return { ...EMPTY_COURSE_BAG_FORM };
  }

  return {
    id: Number(bag.id),
    title: bag.title || '',
    icon: bag.icon || '',
    sort: bag.sort !== undefined && bag.sort !== null ? Number(bag.sort) : undefined,
  };
}
