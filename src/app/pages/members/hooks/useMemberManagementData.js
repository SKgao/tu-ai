import dayjs from 'dayjs';
import { listMemberFeedback, listMembers } from '@/app/services/members';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';

const INITIAL_MEMBER_QUERY = {
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

const INITIAL_FEEDBACK_QUERY = {
  pageNum: 1,
  pageSize: 10,
  startTime: '',
  endTime: '',
  tutuNumber: '',
  mobile: '',
};

function toApiDateTime(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '';
}

export function useMemberManagementData({ activeTab, onError }) {
  const memberTable = useRemoteTable({
    initialQuery: INITIAL_MEMBER_QUERY,
    request: listMembers,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    enabled: activeTab === 'members',
    onError: (message) => onError(message || '会员列表加载失败'),
  });

  const feedbackTable = useRemoteTable({
    initialQuery: INITIAL_FEEDBACK_QUERY,
    request: listMemberFeedback,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    enabled: activeTab === 'feedback',
    onError: (message) => onError(message || '反馈列表加载失败'),
  });

  function searchMembers(filters) {
    memberTable.applyFilters({
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
    });
  }

  function searchFeedback(filters) {
    feedbackTable.applyFilters({
      startTime: toApiDateTime(filters.startTime),
      endTime: toApiDateTime(filters.endTime),
      tutuNumber: filters.tutuNumber.trim(),
      mobile: filters.mobile.trim(),
    });
  }

  async function reloadCurrentTab() {
    if (activeTab === 'members') {
      return memberTable.reload();
    }

    return feedbackTable.reload();
  }

  return {
    memberTable,
    feedbackTable,
    searchMembers,
    searchFeedback,
    reloadCurrentTab,
  };
}
