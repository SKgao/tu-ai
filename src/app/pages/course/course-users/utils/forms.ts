import type {
  CourseUserFormValues,
  CourseUserQuery,
  CourseUserSearchValues,
  CourseUserSexOption,
} from '../types';

export const EMPTY_COURSE_USER_FORM: CourseUserFormValues = {
  realName: '',
  mobile: '',
  sex: '1',
  payAmt: undefined,
  textbookId: undefined,
};

export const INITIAL_COURSE_USER_FILTERS: CourseUserSearchValues = {
  textbookId: undefined,
  tutuNumber: '',
  mobile: '',
  realName: '',
  sex: undefined,
};

export const COURSE_USER_SEX_OPTIONS: CourseUserSexOption[] = [
  { value: '1', label: '男' },
  { value: '2', label: '女' },
];

export function buildCourseUserSearchFilters(
  values: CourseUserSearchValues = {},
): Pick<CourseUserQuery, 'textbookId' | 'tutuNumber' | 'mobile' | 'realName' | 'sex'> {
  return {
    textbookId: values.textbookId || '',
    tutuNumber: values.tutuNumber?.trim() || '',
    mobile: values.mobile?.trim() || '',
    realName: values.realName?.trim() || '',
    sex: values.sex || '',
  };
}
