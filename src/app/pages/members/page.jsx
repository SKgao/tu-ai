import React, { useEffect, useMemo, useState } from 'react';
import {
  disableMember,
  enableMember,
  grantMemberVip,
} from '@/app/services/members';
import { AppModal } from '@/app/components/AppModal';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { ModalActions } from '@/app/components/ModalActions';
import { PageHero } from '@/app/components/PageHero';
import { PageTableCard } from '@/app/components/PageTableCard';
import { useConfirmAction } from '@/app/hooks/useConfirmAction';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useModalState } from '@/app/hooks/useModalState';
import { useModalSubmit } from '@/app/hooks/useModalSubmit';
import { useMemberManagementData } from './hooks/useMemberManagementData';
import { createMemberColumns, createMemberFeedbackColumns } from './configs/tableColumns';
import {
  selectMemberLevelOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const EMPTY_VIP_FORM = {
  userId: '',
  realName: '',
  userLevel: '',
};

const INITIAL_MEMBER_FILTERS = {
  registerStartTime: '',
  registerEndTime: '',
  payStartTime: '',
  payEndTime: '',
  expireStartTime: '',
  expireEndTime: '',
  userLevelIds: [],
  tutuNumber: '',
  mobile: '',
  sex: '',
  hasSetPassword: '',
  sortInvite: '',
  sortUserId: '',
};

const INITIAL_FEEDBACK_FILTERS = {
  startTime: '',
  endTime: '',
  tutuNumber: '',
  mobile: '',
};

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      className={active ? 'tab-chip tab-chip--active' : 'tab-chip'}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function VipModal({ form, levels, submitting, onClose, onChange, onSubmit }) {
  return (
    <AppModal
      title="开通会员"
      description={`给 ${form.realName || form.userId || '当前用户'} 开通会员等级。`}
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field form-field--full">
            <span>会员等级</span>
            <select
              value={form.userLevel}
              onChange={(event) => onChange('userLevel', event.target.value)}
            >
              <option value="">请选择会员等级</option>
              {levels.map((item) => (
                <option key={item.userLevel} value={String(item.userLevel)}>
                  {item.levelName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ModalActions
          onCancel={onClose}
          submitting={submitting}
          submitText="确认开通"
        />
      </form>
    </AppModal>
  );
}

export function MemberManagementPage() {
  const [activeTab, setActiveTab] = useState('members');
  const [memberFilters, setMemberFilters] = useState(INITIAL_MEMBER_FILTERS);
  const [feedbackFilters, setFeedbackFilters] = useState(INITIAL_FEEDBACK_FILTERS);
  const { feedback, showError, showSuccess } = useFeedbackState();
  const { submitting: modalSubmitting, submit: submitModal } = useModalSubmit({
    showSuccess,
    showError,
  });
  const { submitting: actionSubmitting, runAction } = useConfirmAction({
    showSuccess,
    showError,
  });
  const levelOptions = useMemberCommerceOptionsStore(selectMemberLevelOptions);
  const ensureMemberLevelOptions = useMemberCommerceOptionsStore(
    (state) => state.ensureMemberLevelOptions,
  );
  const {
    isOpen: vipModalOpen,
    form: vipForm,
    updateForm: updateVipForm,
    openEdit: openVipModal,
    close: closeVipModal,
  } = useModalState({
    createState: () => ({ ...EMPTY_VIP_FORM }),
    editState: (member) => ({
      userId: String(member.tutuNumber || member.userId || ''),
      realName: member.realName || '',
      userLevel: '',
    }),
  });
  const { memberTable, feedbackTable, searchMembers, searchFeedback, reloadCurrentTab } =
    useMemberManagementData({
      activeTab,
      onError: showError,
    });

  const memberColumns = useMemo(
    () =>
      createMemberColumns({
        onOpenVip: openVipModal,
        onMemberStatus: handleMemberStatus,
        submitting: modalSubmitting || actionSubmitting,
      }),
    [actionSubmitting, modalSubmitting],
  );
  const feedbackColumns = useMemo(() => createMemberFeedbackColumns(), []);

  const activeTable = activeTab === 'members' ? memberTable : feedbackTable;

  useEffect(() => {
    ensureMemberLevelOptions().catch((error) => {
      showError(error?.message || '会员等级列表加载失败');
    });
  }, []);

  function updateMemberFilter(key, value) {
    setMemberFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateFeedbackFilter(key, value) {
    setFeedbackFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSearch() {
    if (activeTab === 'members') {
      searchMembers(memberFilters);
      return;
    }

    searchFeedback(feedbackFilters);
  }

  async function handleMemberStatus(member, type) {
    const actionText = type === 'enable' ? '启用' : '禁用';
    await runAction({
      confirmText: `确认${actionText}用户 ${member.realName || member.tutuNumber} 吗？`,
      action: () => (type === 'enable' ? enableMember(member.userId) : disableMember(member.userId)),
      successMessage: `${actionText}成功`,
      errorMessage: `${actionText}失败`,
      afterSuccess: async () => {
        await reloadCurrentTab().catch(() => {});
      },
    });
  }

  async function handleVipSubmit(event) {
    event.preventDefault();

    if (!vipForm.userLevel) {
      showError('请选择会员等级');
      return;
    }

    await submitModal({
      action: () =>
        grantMemberVip({
          userId: Number(vipForm.userId),
          userLevel: Number(vipForm.userLevel),
        }),
      successMessage: '会员开通成功',
      errorMessage: '会员开通失败',
      close: closeVipModal,
      afterSuccess: async () => {
        await reloadCurrentTab().catch(() => {});
      },
    });
  }

  return (
    <div className="page-stack">
      <PageHero
        title="会员管理"
        copy="这一页对应旧版 `member` 模块，当前把用户列表、反馈信息与会员操作统一收口到页面级数据 hooks。"
      />

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="tab-row">
          <TabButton active={activeTab === 'members'} onClick={() => setActiveTab('members')}>
            用户列表
          </TabButton>
          <TabButton active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')}>
            反馈信息
          </TabButton>
        </div>

        {activeTab === 'members' ? (
          <>
            <div className="toolbar-grid toolbar-grid--books">
              <label className="form-field">
                <span>注册开始时间</span>
                <input
                  type="datetime-local"
                  value={memberFilters.registerStartTime}
                  onChange={(event) => updateMemberFilter('registerStartTime', event.target.value)}
                />
              </label>
              <label className="form-field">
                <span>注册结束时间</span>
                <input
                  type="datetime-local"
                  value={memberFilters.registerEndTime}
                  onChange={(event) => updateMemberFilter('registerEndTime', event.target.value)}
                />
              </label>
              <label className="form-field">
                <span>会员开始时间</span>
                <input
                  type="datetime-local"
                  value={memberFilters.payStartTime}
                  onChange={(event) => updateMemberFilter('payStartTime', event.target.value)}
                />
              </label>
              <label className="form-field">
                <span>会员结束时间</span>
                <input
                  type="datetime-local"
                  value={memberFilters.payEndTime}
                  onChange={(event) => updateMemberFilter('payEndTime', event.target.value)}
                />
              </label>
              <label className="form-field">
                <span>到期开始时间</span>
                <input
                  type="datetime-local"
                  value={memberFilters.expireStartTime}
                  onChange={(event) => updateMemberFilter('expireStartTime', event.target.value)}
                />
              </label>
              <label className="form-field">
                <span>到期结束时间</span>
                <input
                  type="datetime-local"
                  value={memberFilters.expireEndTime}
                  onChange={(event) => updateMemberFilter('expireEndTime', event.target.value)}
                />
              </label>
              <label className="form-field">
                <span>会员等级</span>
                <select
                  multiple
                  className="app-multiselect"
                  value={memberFilters.userLevelIds}
                  onChange={(event) =>
                    updateMemberFilter(
                      'userLevelIds',
                      Array.from(event.target.selectedOptions).map((option) => option.value),
                    )
                  }
                >
                  {levelOptions.map((item) => (
                    <option key={item.userLevel} value={String(item.userLevel)}>
                      {item.levelName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>图图号</span>
                <input
                  value={memberFilters.tutuNumber}
                  onChange={(event) => updateMemberFilter('tutuNumber', event.target.value)}
                  placeholder="输入图图号"
                />
              </label>
              <label className="form-field">
                <span>手机号</span>
                <input
                  value={memberFilters.mobile}
                  onChange={(event) => updateMemberFilter('mobile', event.target.value)}
                  placeholder="输入手机号"
                />
              </label>
              <label className="form-field">
                <span>性别</span>
                <select
                  value={memberFilters.sex}
                  onChange={(event) => updateMemberFilter('sex', event.target.value)}
                >
                  <option value="">全部</option>
                  <option value="1">男</option>
                  <option value="2">女</option>
                </select>
              </label>
              <label className="form-field">
                <span>是否设置密码</span>
                <select
                  value={memberFilters.hasSetPassword}
                  onChange={(event) => updateMemberFilter('hasSetPassword', event.target.value)}
                >
                  <option value="">全部</option>
                  <option value="1">是</option>
                  <option value="2">否</option>
                </select>
              </label>
              <label className="form-field">
                <span>图图号排序</span>
                <select
                  value={memberFilters.sortUserId}
                  onChange={(event) => updateMemberFilter('sortUserId', event.target.value)}
                >
                  <option value="">默认</option>
                  <option value="1">升序</option>
                  <option value="0">降序</option>
                </select>
              </label>
              <label className="form-field">
                <span>邀请人数排序</span>
                <select
                  value={memberFilters.sortInvite}
                  onChange={(event) => updateMemberFilter('sortInvite', event.target.value)}
                >
                  <option value="">默认</option>
                  <option value="1">升序</option>
                  <option value="0">降序</option>
                </select>
              </label>
            </div>
            <div className="toolbar-grid toolbar-grid--compact subject-toolbar-actions">
              <div className="section-meta">共 {memberTable.totalCount} 个用户</div>
              <div className="toolbar-actions">
                <button type="button" className="app-button app-button--primary" onClick={handleSearch}>
                  搜索
                </button>
                <button
                  type="button"
                  className="app-button app-button--ghost"
                  onClick={() => reloadCurrentTab().catch(() => {})}
                  disabled={activeTable.loading}
                >
                  {activeTable.loading ? '刷新中...' : '刷新'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="toolbar-grid toolbar-grid--units">
              <label className="form-field">
                <span>开始时间</span>
                <input
                  type="datetime-local"
                  value={feedbackFilters.startTime}
                  onChange={(event) => updateFeedbackFilter('startTime', event.target.value)}
                />
              </label>
              <label className="form-field">
                <span>结束时间</span>
                <input
                  type="datetime-local"
                  value={feedbackFilters.endTime}
                  onChange={(event) => updateFeedbackFilter('endTime', event.target.value)}
                />
              </label>
              <label className="form-field">
                <span>图图号</span>
                <input
                  value={feedbackFilters.tutuNumber}
                  onChange={(event) => updateFeedbackFilter('tutuNumber', event.target.value)}
                  placeholder="输入图图号"
                />
              </label>
              <label className="form-field">
                <span>手机号</span>
                <input
                  value={feedbackFilters.mobile}
                  onChange={(event) => updateFeedbackFilter('mobile', event.target.value)}
                  placeholder="输入手机号"
                />
              </label>
            </div>
            <div className="toolbar-grid toolbar-grid--compact subject-toolbar-actions">
              <div className="section-meta">共 {feedbackTable.totalCount} 条反馈</div>
              <div className="toolbar-actions">
                <button type="button" className="app-button app-button--primary" onClick={handleSearch}>
                  搜索
                </button>
                <button
                  type="button"
                  className="app-button app-button--ghost"
                  onClick={() => reloadCurrentTab().catch(() => {})}
                  disabled={activeTable.loading}
                >
                  {activeTable.loading ? '刷新中...' : '刷新'}
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <PageTableCard
        title={activeTab === 'members' ? '用户列表' : '反馈信息'}
        totalCount={activeTable.totalCount}
        columns={activeTab === 'members' ? memberColumns : feedbackColumns}
        data={activeTab === 'members' ? memberTable.data : feedbackTable.data}
        rowKey={
          activeTab === 'members'
            ? (row) => row.userId || row.tutuNumber
            : (row, index) => `${row.tutuNumber || 'feedback'}-${index}`
        }
        loading={activeTable.loading}
        minWidth={activeTab === 'members' ? 2200 : 960}
        pagination={{
          pageNum: activeTable.query.pageNum,
          pageSize: activeTable.query.pageSize,
          totalPages: activeTable.totalPages,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onPageChange: activeTable.setPageNum,
          onPageSizeChange: activeTable.setPageSize,
        }}
      />

      {vipModalOpen ? (
        <VipModal
          form={vipForm}
          levels={levelOptions}
          submitting={modalSubmitting}
          onClose={closeVipModal}
          onChange={updateVipForm}
          onSubmit={handleVipSubmit}
        />
      ) : null}
    </div>
  );
}
