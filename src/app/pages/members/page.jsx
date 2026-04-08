import React, { useEffect, useMemo, useState } from 'react';
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
} from 'antd';
import { disableMember, enableMember, grantMemberVip } from '@/app/services/members';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { useMemberManagementData } from './hooks/useMemberManagementData';
import { createMemberColumns, createMemberFeedbackColumns } from './configs/tableColumns';
import {
  selectMemberLevelOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const INITIAL_MEMBER_FILTERS = {
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

const INITIAL_FEEDBACK_FILTERS = {
  startTime: undefined,
  endTime: undefined,
  tutuNumber: '',
  mobile: '',
};

const SEX_OPTIONS = [
  { value: '1', label: '男' },
  { value: '2', label: '女' },
];

const YES_NO_OPTIONS = [
  { value: '1', label: '是' },
  { value: '2', label: '否' },
];

const SORT_OPTIONS = [
  { value: '1', label: '升序' },
  { value: '0', label: '降序' },
];

export function MemberManagementPage() {
  const { message, modal } = App.useApp();
  const [memberSearchForm] = Form.useForm();
  const [feedbackSearchForm] = Form.useForm();
  const [vipForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('members');
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [vipSubmitting, setVipSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const levelOptions = useMemberCommerceOptionsStore(selectMemberLevelOptions);
  const ensureMemberLevelOptions = useMemberCommerceOptionsStore(
    (state) => state.ensureMemberLevelOptions,
  );
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

  function openVipModal(member) {
    vipForm.setFieldsValue({
      userId: String(member.tutuNumber || member.userId || ''),
      realName: member.realName || '',
      userLevel: undefined,
    });
    setVipModalOpen(true);
  }

  function closeVipModal() {
    if (vipSubmitting) {
      return;
    }

    setVipModalOpen(false);
  }

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
      setVipModalOpen(false);
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
        onOpenVip: openVipModal,
        onMemberStatus: handleMemberStatus,
        submitting: vipSubmitting || actionSubmitting,
      }),
    [actionSubmitting, vipSubmitting],
  );
  const feedbackColumns = useMemo(() => createMemberFeedbackColumns(), []);

  const activeTable = activeTab === 'members' ? memberTable : feedbackTable;

  return (
    <div className="page-stack">
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            会员管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版 `member` 模块，先按新版 antd 组件重构标签页筛选、表格和开通会员弹窗。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'members',
              label: '用户列表',
              children: (
                <>
                  <Form
                    form={memberSearchForm}
                    layout="vertical"
                    initialValues={INITIAL_MEMBER_FILTERS}
                    onFinish={handleMemberSearch}
                  >
                    <div className="toolbar-grid toolbar-grid--books">
                      <Form.Item label="注册开始时间" name="registerStartTime">
                        <DatePicker showTime style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="注册结束时间" name="registerEndTime">
                        <DatePicker showTime style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="会员开始时间" name="payStartTime">
                        <DatePicker showTime style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="会员结束时间" name="payEndTime">
                        <DatePicker showTime style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="到期开始时间" name="expireStartTime">
                        <DatePicker showTime style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="到期结束时间" name="expireEndTime">
                        <DatePicker showTime style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="会员等级" name="userLevelIds">
                        <Select
                          mode="multiple"
                          allowClear
                          placeholder="请选择会员等级"
                          options={levelOptions.map((item) => ({
                            value: String(item.userLevel),
                            label: item.levelName,
                          }))}
                        />
                      </Form.Item>
                      <Form.Item label="图图号" name="tutuNumber">
                        <Input allowClear placeholder="输入图图号" />
                      </Form.Item>
                      <Form.Item label="手机号" name="mobile">
                        <Input allowClear placeholder="输入手机号" />
                      </Form.Item>
                      <Form.Item label="性别" name="sex">
                        <Select allowClear placeholder="全部" options={SEX_OPTIONS} />
                      </Form.Item>
                      <Form.Item label="是否设置密码" name="hasSetPassword">
                        <Select allowClear placeholder="全部" options={YES_NO_OPTIONS} />
                      </Form.Item>
                      <Form.Item label="图图号排序" name="sortUserId">
                        <Select allowClear placeholder="默认" options={SORT_OPTIONS} />
                      </Form.Item>
                      <Form.Item label="邀请人数排序" name="sortInvite">
                        <Select allowClear placeholder="默认" options={SORT_OPTIONS} />
                      </Form.Item>
                      <Form.Item label=" ">
                        <Space wrap>
                          <Button type="primary" htmlType="submit" loading={activeTable.loading}>
                            搜索
                          </Button>
                          <Button onClick={handleMemberReset} disabled={activeTable.loading}>
                            重置
                          </Button>
                          <Button onClick={() => reloadCurrentTab().catch(() => {})} loading={activeTable.loading}>
                            刷新
                          </Button>
                        </Space>
                      </Form.Item>
                    </div>
                  </Form>
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
                  <Form
                    form={feedbackSearchForm}
                    layout="vertical"
                    initialValues={INITIAL_FEEDBACK_FILTERS}
                    onFinish={handleFeedbackSearch}
                  >
                    <div className="toolbar-grid toolbar-grid--units">
                      <Form.Item label="开始时间" name="startTime">
                        <DatePicker showTime style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="结束时间" name="endTime">
                        <DatePicker showTime style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item label="图图号" name="tutuNumber">
                        <Input allowClear placeholder="输入图图号" />
                      </Form.Item>
                      <Form.Item label="手机号" name="mobile">
                        <Input allowClear placeholder="输入手机号" />
                      </Form.Item>
                      <Form.Item label=" ">
                        <Space wrap>
                          <Button type="primary" htmlType="submit" loading={activeTable.loading}>
                            搜索
                          </Button>
                          <Button onClick={handleFeedbackReset} disabled={activeTable.loading}>
                            重置
                          </Button>
                          <Button onClick={() => reloadCurrentTab().catch(() => {})} loading={activeTable.loading}>
                            刷新
                          </Button>
                        </Space>
                      </Form.Item>
                    </div>
                  </Form>
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
      </Card>

      <Modal
        title="开通会员"
        open={vipModalOpen}
        onCancel={closeVipModal}
        onOk={() => vipForm.submit()}
        okText="确认开通"
        cancelText="取消"
        confirmLoading={vipSubmitting}
        mask={{ closable: !vipSubmitting }}
        keyboard={!vipSubmitting}
      >
        <Typography.Paragraph type="secondary">
          给 {vipForm.getFieldValue('realName') || vipForm.getFieldValue('userId') || '当前用户'} 开通会员等级。
        </Typography.Paragraph>
        <Form form={vipForm} layout="vertical" onFinish={handleVipSubmit}>
          <Form.Item name="userId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label="会员等级"
            name="userLevel"
            rules={[{ required: true, message: '请选择会员等级' }]}
          >
            <Select
              placeholder="请选择会员等级"
              options={levelOptions.map((item) => ({
                value: String(item.userLevel),
                label: item.levelName,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
