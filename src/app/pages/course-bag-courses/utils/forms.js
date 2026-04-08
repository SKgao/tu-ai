export const EMPTY_COURSE_BAG_COURSE_FORM = {
  id: undefined,
  name: '',
  icon: '',
  sort: undefined,
};

export function normalizeCourseBagCourseFormValues(course) {
  if (!course) {
    return { ...EMPTY_COURSE_BAG_COURSE_FORM };
  }

  return {
    id: Number(course.id),
    name: course.name || '',
    icon: course.icon || '',
    sort: course.sort !== undefined && course.sort !== null ? Number(course.sort) : undefined,
  };
}
