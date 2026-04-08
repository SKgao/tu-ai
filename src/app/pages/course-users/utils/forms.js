export const EMPTY_COURSE_USER_FORM = {
  realName: '',
  mobile: '',
  sex: '1',
  payAmt: undefined,
  textbookId: undefined,
};

export const INITIAL_COURSE_USER_FILTERS = {
  textbookId: undefined,
  tutuNumber: '',
  mobile: '',
  realName: '',
  sex: undefined,
};

export const COURSE_USER_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const COURSE_USER_SEX_OPTIONS = [
  { value: '1', label: '男' },
  { value: '2', label: '女' },
];

export function buildCourseUserSearchFilters(values) {
  return {
    textbookId: values.textbookId || '',
    tutuNumber: values.tutuNumber?.trim() || '',
    mobile: values.mobile?.trim() || '',
    realName: values.realName?.trim() || '',
    sex: values.sex || '',
  };
}
