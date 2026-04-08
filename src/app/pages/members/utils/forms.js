import { toApiDateTime } from '@/app/lib/dateTime';

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const INITIAL_MEMBER_FILTERS = {
  registerStartTime: undefined,
  registerEndTime: undefined,
  payStartTime: undefined,
  payEndTime: undefined,
  expireStartTime: undefined,
  expireEndTime: undefined,
  userLevelIds: [],
  tutuNumber: '',
  mobile: '',
  sex: undefined,
  hasSetPassword: undefined,
  sortInvite: undefined,
  sortUserId: undefined,
};

export const INITIAL_FEEDBACK_FILTERS = {
  startTime: undefined,
  endTime: undefined,
  tutuNumber: '',
  mobile: '',
};

export const INITIAL_MEMBER_QUERY = {
  pageNum: 1,
  pageSize: 10,
  userLevelIds: [],
  expireStartTime: '',
  expireEndTime: '',
  payStartTime: '',
  payEndTime: '',
  registerStartTime: '',
  registerEndTime: '',
  tutuNumber: '',
  mobile: '',
  sex: '',
  hasSetPassword: '',
  sortInvite: '',
  sortUserId: '',
};

export const INITIAL_FEEDBACK_QUERY = {
  pageNum: 1,
  pageSize: 10,
  startTime: '',
  endTime: '',
  tutuNumber: '',
  mobile: '',
};

export const SEX_OPTIONS = [
  { value: '1', label: '男' },
  { value: '2', label: '女' },
];

export const YES_NO_OPTIONS = [
  { value: '1', label: '是' },
  { value: '2', label: '否' },
];

export const SORT_OPTIONS = [
  { value: '1', label: '升序' },
  { value: '0', label: '降序' },
];

export function buildMemberSearchFilters(filters) {
  return {
    userLevelIds: filters.userLevelIds.map((item) => Number(item)),
    expireStartTime: toApiDateTime(filters.expireStartTime),
    expireEndTime: toApiDateTime(filters.expireEndTime),
    payStartTime: toApiDateTime(filters.payStartTime),
    payEndTime: toApiDateTime(filters.payEndTime),
    registerStartTime: toApiDateTime(filters.registerStartTime),
    registerEndTime: toApiDateTime(filters.registerEndTime),
    tutuNumber: filters.tutuNumber.trim(),
    mobile: filters.mobile.trim(),
    sex: filters.sex,
    hasSetPassword: filters.hasSetPassword,
    sortInvite: filters.sortInvite,
    sortUserId: filters.sortUserId,
  };
}

export function buildFeedbackSearchFilters(filters) {
  return {
    startTime: toApiDateTime(filters.startTime),
    endTime: toApiDateTime(filters.endTime),
    tutuNumber: filters.tutuNumber.trim(),
    mobile: filters.mobile.trim(),
  };
}

export function toMemberLevelSelectOptions(levelOptions) {
  return levelOptions.map((item) => ({
    value: String(item.userLevel),
    label: item.levelName,
  }));
}
