import { listMemberFeedback, listMembers } from '@/app/services/members';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import {
  INITIAL_FEEDBACK_QUERY,
  INITIAL_MEMBER_QUERY,
  buildFeedbackSearchFilters,
  buildMemberSearchFilters,
} from '../utils/forms';

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
    memberTable.applyFilters(buildMemberSearchFilters(filters));
  }

  function searchFeedback(filters) {
    feedbackTable.applyFilters(buildFeedbackSearchFilters(filters));
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
