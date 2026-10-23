import { listMemberFeedback, listMembers } from '@/app/services/member/members';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import {
  INITIAL_FEEDBACK_QUERY,
  INITIAL_MEMBER_QUERY,
  buildFeedbackSearchFilters,
  buildMemberSearchFilters,
} from '../utils/forms';
import type {
  MemberFeedbackListResult,
  MemberFeedbackQuery,
  MemberFeedbackRecord,
  MemberFeedbackSearchValues,
  MemberListResult,
  MemberQuery,
  MemberRecord,
  MemberSearchValues,
  MemberTabKey,
} from '../types';

type UseMemberManagementDataOptions = {
  activeTab: MemberTabKey;
  onError: (message?: string) => void;
};

export function useMemberManagementData({ activeTab, onError }: UseMemberManagementDataOptions) {
  const memberTable = useRemoteTable<MemberQuery, MemberListResult, MemberRecord>({
    initialQuery: INITIAL_MEMBER_QUERY,
    request: async (currentQuery) => (await listMembers(currentQuery)) as MemberListResult,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    enabled: activeTab === 'members',
    onError: (message) => onError(message || '会员列表加载失败'),
  });

  const feedbackTable = useRemoteTable<MemberFeedbackQuery, MemberFeedbackListResult, MemberFeedbackRecord>({
    initialQuery: INITIAL_FEEDBACK_QUERY,
    request: async (currentQuery) => (await listMemberFeedback(currentQuery)) as MemberFeedbackListResult,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    enabled: activeTab === 'feedback',
    onError: (message) => onError(message || '反馈列表加载失败'),
  });

  function searchMembers(filters: MemberSearchValues): void {
    memberTable.applyFilters(buildMemberSearchFilters(filters));
  }

  function searchFeedback(filters: MemberFeedbackSearchValues): void {
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
