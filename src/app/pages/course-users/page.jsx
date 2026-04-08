import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createCourseUser, listCourseUsers } from '@/app/services/course-users';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { createCourseUserColumns } from './configs/tableColumns';
import {
  selectCourseOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';

const EMPTY_FORM = {
  realName: '',
  mobile: '',
  sex: '1',
  payAmt: undefined,
  textbookId: undefined,
};

const INITIAL_FILTERS = {
  textbookId: undefined,
  tutuNumber: '',
  mobile: '',
  realName: '',
  sex: undefined,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const SEX_OPTIONS = [
  { value: '1', label: '男' },
  { value: '2', label: '女' },
];

function normalizeSearchValues(values) {
  return {
    textbookId: values.textbookId || '',
    tutuNumber: values.tutuNumber?.trim() || '',
    mobile: values.mobile?.trim() || '',
    realName: values.realName?.trim() || '',
    sex: values.sex || '',
  };
}

export function CourseUserManagementPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const routeTutuNumber = searchParams.get('tutuNumber') || '';
  const books = useMemberCommerceOptionsStore(selectCourseOptions);
  const ensureCourseOptions = useMemberCommerceOptionsStore((state) => state.ensureCourseOptions);
  const columns = useMemo(() => createCourseUserColumns(), []);
  const {
    query,
    data: users,
    totalCount,
    loading,
    applyFilters,
    patchQuery,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: {
      pageNum: 1,
      pageSize: 10,
      textbookId: '',
      tutuNumber: routeTutuNumber,
      mobile: '',
      realName: '',
      sex: '',
    },
    request: listCourseUsers,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '已买课程列表加载失败'),
  });

  useEffect(() => {
    searchForm.setFieldsValue({
      ...INITIAL_FILTERS,
      tutuNumber: routeTutuNumber,
    });
    patchQuery({
      tutuNumber: routeTutuNumber,
      pageNum: 1,
    });
  }, [patchQuery, routeTutuNumber, searchForm]);

  useEffect(() => {
    ensureCourseOptions().catch((error) => {
      message.error(error?.message || '精品课程列表加载失败');
    });
  }, [ensureCourseOptions, message]);

  function openCreateModal() {
    modalForm.setFieldsValue(EMPTY_FORM);
    setModalOpen(true);
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setModalOpen(false);
  }

  function handleSearch(values) {
    applyFilters(normalizeSearchValues(values));
  }

  function handleReset() {
    searchForm.setFieldsValue({
      ...INITIAL_FILTERS,
      tutuNumber: routeTutuNumber,
    });
    applyFilters({
      textbookId: '',
      tutuNumber: routeTutuNumber,
      mobile: '',
      realName: '',
      sex: '',
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  async function handleSubmit(values) {
    setSubmitting(true);
    try {
      await createCourseUser({
        realName: values.realName.trim(),
        mobile: values.mobile.trim(),
        sex: Number(values.sex),
        payAmt: Math.round(Number(values.payAmt) * 100),
        textbookId: Number(values.textbookId),
      });
      message.success('精品课程开通成功');
      setModalOpen(false);
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || '精品课程开通失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            已买课程
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版 `courseUser` 模块，先按新版 antd 组件重构筛选、列表和开通课程弹窗。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <Form
          form={searchForm}
          layout="vertical"
          initialValues={{
            ...INITIAL_FILTERS,
            tutuNumber: routeTutuNumber,
          }}
          onFinish={handleSearch}
        >
          <div className="toolbar-grid toolbar-grid--books">
            <Form.Item label="精品课程" name="textbookId">
              <Select
                allowClear
                placeholder="全部"
                options={books.map((item) => ({
                  value: String(item.textbookId),
                  label: item.textbookName,
                }))}
              />
            </Form.Item>
            <Form.Item label="图图号" name="tutuNumber">
              <Input allowClear placeholder="输入图图号" />
            </Form.Item>
            <Form.Item label="手机号" name="mobile">
              <Input allowClear placeholder="输入手机号" />
            </Form.Item>
            <Form.Item label="用户名" name="realName">
              <Input allowClear placeholder="输入用户名" />
            </Form.Item>
            <Form.Item label="性别" name="sex">
              <Select allowClear placeholder="全部" options={SEX_OPTIONS} />
            </Form.Item>
            <Form.Item label=" ">
              <Space wrap>
                <Button type="primary" htmlType="submit" loading={loading}>
                  搜索
                </Button>
                <Button onClick={handleReset} disabled={loading}>
                  重置
                </Button>
                <Button type="primary" ghost icon={<PlusOutlined />} onClick={openCreateModal}>
                  开通精品课程
                </Button>
                {routeTutuNumber ? (
                  <Button onClick={() => navigate(-1)}>
                    返回上一层
                  </Button>
                ) : null}
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card
        title="已买课程列表"
        extra={
          <Space>
            <Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>
            <Button onClick={() => reload().catch(() => {})} loading={loading}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          rowKey={(row, index) => `${row.tutuNumber || 'course-user'}-${index}`}
          columns={columns}
          dataSource={users}
          loading={loading}
          scroll={{ x: 1120 }}
          pagination={buildAntdTablePagination({
            query,
            totalCount,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            setPageNum,
            setPageSize,
          })}
        />
      </Card>

      <Modal
        title="开通精品课程"
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => modalForm.submit()}
        okText="确认开通"
        cancelText="取消"
        confirmLoading={submitting}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          补齐旧版 `courseUser` 里的开通课程能力。
        </Typography.Paragraph>
        <Form
          form={modalForm}
          layout="vertical"
          initialValues={EMPTY_FORM}
          onFinish={handleSubmit}
        >
          <div className="form-grid">
            <Form.Item
              label="用户名"
              name="realName"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
              label="手机号"
              name="mobile"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^[1][0-9]{10}$/, message: '请输入合法手机号' },
              ]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item label="性别" name="sex" rules={[{ required: true, message: '请选择性别' }]}>
              <Select options={SEX_OPTIONS} />
            </Form.Item>
            <Form.Item
              label="付款金额"
              name="payAmt"
              rules={[
                { required: true, message: '请输入付款金额' },
                { type: 'number', min: 0, message: '付款金额必须为数字' },
              ]}
            >
              <Space.Compact block>
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入付款金额"
                />
                <div className="compact-addon">元</div>
              </Space.Compact>
            </Form.Item>
            <Form.Item
              label="精品课程"
              name="textbookId"
              className="form-field--full"
              rules={[{ required: true, message: '请选择精品课程' }]}
            >
              <Select
                placeholder="请选择精品课程"
                options={books.map((item) => ({
                  value: String(item.textbookId),
                  label: item.textbookName,
                }))}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
