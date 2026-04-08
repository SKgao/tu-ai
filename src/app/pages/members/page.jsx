import React, { useEffect, useMemo, useState } from 'react';
import { App, Card, Form, Table, Tabs, Typography, Space } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { disableMember, enableMember, grantMemberVip } from '@/app/services/members';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { useFormModal } from '@/app/hooks/useFormModal';
import { useMemberManagementData } from './hooks/useMemberManagementData';
import { createMemberColumns, createMemberFeedbackColumns } from './configs/tableColumns';
import { MemberFeedbackSearchForm } from './components/MemberFeedbackSearchForm';
import { MemberSearchForm } from './components/MemberSearchForm';
import { VipGrantModal } from './components/VipGrantModal';
import {
  selectMemberLevelOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';
import {
  INITIAL_FEEDBACK_FILTERS,
  INITIAL_MEMBER_FILTERS,
  PAGE_SIZE_OPTIONS,
  toMemberLevelSelectOptions,
} from './utils/forms';

export function MemberManagementPage() {
  const { message, modal } = App.useApp();
  const [memberSearchForm] = Form.useForm();
  const [feedbackSearchForm] = Form.useForm();
  const [vipForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('members');
  const [vipSubmitting, setVipSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const levelOptions = useMemberCommerceOptionsStore(selectMemberLevelOptions);
  const ensureMemberLevelOptions = useMemberCommerceOptionsStore(
    (state) => state.ensureMemberLevelOptions,
  );
  const vipModal = useFormModal({
    submitting: vipSubmitting,
    onOpenEdit: (member) => {
      vipForm.setFieldsValue({
        userId: String(member.tutuNumber || member.userId || ''),
        realName: member.realName || '',
        userLevel: undefined,
      });
    },
    onClose: () => {
      vipForm.resetFields();
    },
  });
  const memberLevelOptions = useMemo(() => toMemberLevelSelectOptions(levelOptions), [levelOptions]);
  const { memberTable, feedbackTable, searchMembers, searchFeedback, reloadCurrentTab } =
    useMemberManagementData({
      activeTab,
      onError: (errorMessage) => message.error(errorMessage),
    });

  useEffect(() => {
    ensureMemberLevelOptions().catch((error) => {
      message.error(error?.message || '会员等级列表加载失败');
    });
  }, [ensureMemberLevelOptions, message]);

  function handleMemberSearch(values) {
    searchMembers(values);
  }

  function handleFeedbackSearch(values) {
    searchFeedback(values);
  }

  function handleMemberReset() {
    memberSearchForm.resetFields();
    searchMembers({
      ...INITIAL_MEMBER_FILTERS,
    });
  }

  function handleFeedbackReset() {
    feedbackSearchForm.resetFields();
    searchFeedback({
      ...INITIAL_FEEDBACK_FILTERS,
    });
  }

  async function handleMemberStatus(member, type) {
    const actionText = type === 'enable' ? '启用' : '禁用';

    modal.confirm({
      title: `确认${actionText}用户 ${member.realName || member.tutuNumber} 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        setActionSubmitting(true);
        try {
          await (type === 'enable' ? enableMember(member.userId) : disableMember(member.userId));
          message.success(`${actionText}成功`);
          await reloadCurrentTab().catch(() => {});
        } catch (error) {
          message.error(error?.message || `${actionText}失败`);
          throw error;
        } finally {
          setActionSubmitting(false);
        }
      },
    });
  }

  async function handleVipSubmit(values) {
    setVipSubmitting(true);
    try {
      await grantMemberVip({
        userId: Number(values.userId),
        userLevel: Number(values.userLevel),
      });
      message.success('会员开通成功');
      vipModal.setOpen(false);
      await reloadCurrentTab().catch(() => {});
    } catch (error) {
      message.error(error?.message || '会员开通失败');
    } finally {
      setVipSubmitting(false);
    }
  }

  const memberColumns = useMemo(
    () =>
      createMemberColumns({
        onOpenVip: vipModal.openEdit,
        onMemberStatus: handleMemberStatus,
        submitting: vipSubmitting || actionSubmitting,
      }),
    [actionSubmitting, vipModal.openEdit, vipSubmitting],
  );
  const feedbackColumns = useMemo(() => createMemberFeedbackColumns(), []);

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="会员管理"
        description="这一页对应旧版 `member` 模块，先按新版 antd 组件重构标签页筛选、表格和开通会员弹窗。"
      />

      <PageToolbarCard>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'members',
              label: '用户列表',
              children: (
                <>
                  <MemberSearchForm
                    form={memberSearchForm}
                    loading={memberTable.loading}
                    levelOptions={memberLevelOptions}
                    onSearch={handleMemberSearch}
                    onReset={handleMemberReset}
                    onRefresh={() => reloadCurrentTab().catch(() => {})}
                  />
                  <Table
                    rowKey={(row) => row.userId || row.tutuNumber}
                    columns={memberColumns}
                    dataSource={memberTable.data}
                    loading={memberTable.loading}
                    scroll={{ x: 2200 }}
                    pagination={buildAntdTablePagination({
                      query: memberTable.query,
                      totalCount: memberTable.totalCount,
                      pageSizeOptions: PAGE_SIZE_OPTIONS,
                      setPageNum: memberTable.setPageNum,
                      setPageSize: memberTable.setPageSize,
                    })}
                  />
                </>
              ),
            },
            {
              key: 'feedback',
              label: '反馈信息',
              children: (
                <>
                  <MemberFeedbackSearchForm
                    form={feedbackSearchForm}
                    loading={feedbackTable.loading}
                    onSearch={handleFeedbackSearch}
                    onReset={handleFeedbackReset}
                    onRefresh={() => reloadCurrentTab().catch(() => {})}
                  />
                  <Table
                    rowKey={(row, index) => `${row.tutuNumber || 'feedback'}-${index}`}
                    columns={feedbackColumns}
                    dataSource={feedbackTable.data}
                    loading={feedbackTable.loading}
                    scroll={{ x: 960 }}
                    pagination={buildAntdTablePagination({
                      query: feedbackTable.query,
                      totalCount: feedbackTable.totalCount,
                      pageSizeOptions: PAGE_SIZE_OPTIONS,
                      setPageNum: feedbackTable.setPageNum,
                      setPageSize: feedbackTable.setPageSize,
                    })}
                  />
                </>
              ),
            },
          ]}
        />
      </PageToolbarCard>

      <VipGrantModal
        open={vipModal.open}
        form={vipForm}
        submitting={vipSubmitting}
        levelOptions={memberLevelOptions}
        onCancel={vipModal.close}
        onSubmit={handleVipSubmit}
      />
    </div>
  );
}
