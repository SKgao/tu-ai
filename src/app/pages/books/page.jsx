import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  Upload,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { toApiDateTime } from '@/app/lib/dateTime';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import {
  createBook,
  createGrade,
  createVersion,
  listBooks,
  listGrades,
  listVersions,
  lockBook,
  removeBook,
  removeGrade,
  removeVersion,
  updateBook,
  updateGrade,
  updateVersion,
  uploadAsset,
} from '@/app/services/books';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const EMPTY_BOOK_FORM = {
  id: undefined,
  name: '',
  icon: '',
  gradeId: undefined,
  bookVersionId: undefined,
  status: undefined,
};

const EMPTY_RESOURCE_FORM = {
  id: undefined,
  name: '',
  sortValue: undefined,
};

function normalizeBookFormValues(book) {
  if (!book) {
    return { ...EMPTY_BOOK_FORM };
  }

  return {
    id: Number(book.id),
    name: book.name || '',
    icon: book.icon || '',
    gradeId: book.gradeId ? String(book.gradeId) : undefined,
    bookVersionId: book.bookVersionId ? String(book.bookVersionId) : undefined,
    status: book.status !== undefined && book.status !== null ? Number(book.status) : undefined,
  };
}

function normalizeResourceFormValues(type, item) {
  if (!item) {
    return { ...EMPTY_RESOURCE_FORM };
  }

  return {
    id: Number(item.id),
    name: type === 'grade' ? item.gradeName || '' : item.name || '',
    sortValue:
      type === 'grade' && item.status !== undefined && item.status !== null ? Number(item.status) : undefined,
  };
}

export function BookManagementPage() {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState('book');
  const [searchForm] = Form.useForm();
  const [bookForm] = Form.useForm();
  const [resourceForm] = Form.useForm();
  const [grades, setGrades] = useState([]);
  const [versions, setVersions] = useState([]);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookModalMode, setBookModalMode] = useState('create');
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceType, setResourceType] = useState('grade');
  const [submitting, setSubmitting] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    uploading: false,
    message: '',
  });
  const iconValue = Form.useWatch('icon', bookForm);
  const resourceId = Form.useWatch('id', resourceForm);
  const {
    query,
    data: books,
    totalCount,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: {
      startTime: '',
      endTime: '',
      gradeId: '',
      bookVersionId: '',
      pageNum: 1,
      pageSize: 10,
    },
    request: listBooks,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '教材列表加载失败'),
  });

  async function loadGradesData() {
    const data = await listGrades();
    setGrades(Array.isArray(data) ? data : []);
  }

  async function loadVersionsData() {
    const data = await listVersions();
    setVersions(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    async function loadResources() {
      setResourceLoading(true);
      try {
        await Promise.all([loadGradesData(), loadVersionsData()]);
      } catch (error) {
        message.error(error?.message || '基础资源加载失败');
      } finally {
        setResourceLoading(false);
      }
    }

    loadResources();
  }, []);

  function resetUploadState() {
    setUploadState({
      uploading: false,
      message: '',
    });
  }

  function openCreateBookModal() {
    setBookModalMode('create');
    resetUploadState();
    bookForm.setFieldsValue({ ...EMPTY_BOOK_FORM });
    setBookModalOpen(true);
  }

  function openEditBookModal(book) {
    setBookModalMode('edit');
    resetUploadState();
    bookForm.setFieldsValue(normalizeBookFormValues(book));
    setBookModalOpen(true);
  }

  function closeBookModal() {
    if (submitting) {
      return;
    }

    setBookModalOpen(false);
  }

  function openResourceModal(type, item) {
    setResourceType(type);
    resourceForm.setFieldsValue(normalizeResourceFormValues(type, item));
    setResourceModalOpen(true);
  }

  function closeResourceModal() {
    if (submitting) {
      return;
    }

    setResourceModalOpen(false);
  }

  function handleBookSearch(values) {
    applyFilters({
      startTime: toApiDateTime(values.startTime),
      endTime: toApiDateTime(values.endTime),
      gradeId: values.gradeId || '',
      bookVersionId: values.bookVersionId || '',
    });
  }

  function handleBookReset() {
    searchForm.resetFields();
    applyFilters({
      startTime: '',
      endTime: '',
      gradeId: '',
      bookVersionId: '',
      pageNum: 1,
      pageSize: query.pageSize,
    });
  }

  async function refreshActiveTab() {
    try {
      if (activeTab === 'book') {
        setResourceLoading(true);
        await Promise.all([
          reload().catch(() => {}),
          loadGradesData(),
          loadVersionsData(),
        ]);
        setResourceLoading(false);
        return;
      }

      setResourceLoading(true);
      if (activeTab === 'grade') {
        await loadGradesData();
        setResourceLoading(false);
        return;
      }

      await loadVersionsData();
      setResourceLoading(false);
    } catch (error) {
      message.error(error?.message || '数据加载失败');
      setResourceLoading(false);
    }
  }

  async function handleUpload({ file, onError, onSuccess }) {
    setUploadState({
      uploading: true,
      message: `${file.name} 上传中...`,
    });

    try {
      const url = await uploadAsset(file);
      bookForm.setFieldValue('icon', url);
      setUploadState({
        uploading: false,
        message: '上传成功，已自动写入封面地址',
      });
      onSuccess?.({ url });
    } catch (error) {
      const errorMessage = error?.message || '上传失败';
      setUploadState({
        uploading: false,
        message: errorMessage,
      });
      message.error(errorMessage);
      onError?.(error);
    }
  }

  async function handleBookSubmit(values) {
    if (!values.name?.trim() || !values.gradeId || !values.bookVersionId) {
      message.error('请填写教材名称并选择年级、教材版本');
      return;
    }

    const payload = {
      name: values.name.trim(),
      icon: values.icon?.trim() || '',
      gradeId: Number(values.gradeId),
      bookVersionId: Number(values.bookVersionId),
    };

    setSubmitting(true);
    try {
      if (bookModalMode === 'create') {
        await createBook(payload);
      } else {
        await updateBook({
          ...payload,
          id: Number(values.id),
          status: values.status ?? undefined,
        });
      }

      message.success(bookModalMode === 'create' ? '教材创建成功' : '教材更新成功');
      setBookModalOpen(false);
      await Promise.all([
        reload().catch(() => {}),
        loadGradesData(),
        loadVersionsData(),
      ]);
    } catch (error) {
      message.error(error?.message || '教材提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResourceSubmit(values) {
    if (!values.name?.trim()) {
      message.error(`请输入${resourceType === 'grade' ? '年级' : '教材版本'}名称`);
      return;
    }

    setSubmitting(true);
    try {
      if (resourceType === 'grade') {
        if (values.id) {
          await updateGrade({
            id: Number(values.id),
            gradeName: values.name.trim(),
            status: values.sortValue ?? undefined,
          });
        } else {
          await createGrade(values.name.trim());
        }

        await loadGradesData();
      } else {
        if (values.id) {
          await updateVersion({
            id: Number(values.id),
            name: values.name.trim(),
          });
        } else {
          await createVersion(values.name.trim());
        }

        await loadVersionsData();
      }

      message.success(
        resourceType === 'grade'
          ? values.id
            ? '年级更新成功'
            : '年级创建成功'
          : values.id
            ? '教材版本更新成功'
            : '教材版本创建成功',
      );
      setResourceModalOpen(false);
    } catch (error) {
      message.error(error?.message || '资源提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteBook(book) {
    setActionSubmitting(true);
    try {
      await removeBook(book.id);
      message.success('教材已删除');
      if (books.length === 1 && query.pageNum > 1) {
        setPageNum(query.pageNum - 1);
      } else {
        await reload().catch(() => {});
      }
    } catch (error) {
      message.error(error?.message || '教材删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleToggleBookLock(book) {
    setActionSubmitting(true);
    try {
      await lockBook({
        textbookId: book.id,
        canLock: book.canLock === 1 ? 2 : 1,
      });
      message.success(book.canLock === 1 ? '教材已锁定' : '教材已解锁');
      await reload().catch(() => {});
    } catch (error) {
      message.error(error?.message || '教材锁定状态更新失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  async function handleDeleteResource(type, item) {
    setActionSubmitting(true);
    try {
      if (type === 'grade') {
        await removeGrade(item.id);
        message.success('年级已删除');
        await loadGradesData();
      } else {
        await removeVersion(item.id);
        message.success('教材版本已删除');
        await loadVersionsData();
      }
    } catch (error) {
      message.error(error?.message || '删除失败');
    } finally {
      setActionSubmitting(false);
    }
  }

  const bookColumns = useMemo(
    () => [
      { title: '教材名', dataIndex: 'name', render: (value) => value || '-' },
      {
        title: '封面',
        dataIndex: 'icon',
        render: (value, record) =>
          value ? (
            <Image
              width={52}
              height={52}
              style={{ borderRadius: 16, objectFit: 'cover' }}
              src={value}
              alt={record.name || 'book'}
            />
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      },
      { title: '年级', dataIndex: 'gradeName', render: (_, record) => record.gradeName || record.gradeId || '-' },
      {
        title: '教材版本',
        dataIndex: 'bookVersionName',
        render: (_, record) => record.bookVersionName || record.bookVersionId || '-',
      },
      { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
      { title: '年级顺序', dataIndex: 'status', render: (value) => value ?? '-' },
      {
        title: '锁定状态',
        dataIndex: 'canLock',
        render: (value) => <Tag color={value === 1 ? 'success' : 'warning'}>{value === 1 ? '已解锁' : '已锁定'}</Tag>,
      },
      {
        title: '详情',
        key: 'details',
        render: (_, book) => (
          <Space size="small" wrap>
            <Link to={`/units?textbookId=${book.id}`} className="ant-btn ant-btn-link">
              查看单元
            </Link>
            <Link to={`/sessions?textbookId=${book.id}`} className="ant-btn ant-btn-link">
              查看大关卡
            </Link>
            <Link to={`/custom-passes?textbookId=${book.id}`} className="ant-btn ant-btn-link">
              查看小关卡
            </Link>
          </Space>
        ),
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, book) => (
          <Space size="small" wrap>
            <Button type="link" onClick={() => openEditBookModal(book)} style={{ paddingInline: 0 }}>
              编辑
            </Button>
            <Button
              type="link"
              onClick={() => handleToggleBookLock(book)}
              disabled={submitting || actionSubmitting}
              style={{ paddingInline: 0 }}
            >
              {book.canLock === 1 ? '锁定' : '解锁'}
            </Button>
            <Popconfirm
              title={`确认删除教材 ${book.name || book.id} 吗？`}
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDeleteBook(book)}
              disabled={submitting || actionSubmitting}
            >
              <Button type="link" danger disabled={submitting || actionSubmitting} style={{ paddingInline: 0 }}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [actionSubmitting, submitting],
  );

  const resourceColumns = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id' },
      {
        title: activeTab === 'grade' ? '年级名称' : '教材版本名称',
        dataIndex: activeTab === 'grade' ? 'gradeName' : 'name',
        render: (value) => value || '-',
      },
      {
        title: activeTab === 'grade' ? '年级顺序' : '备注',
        dataIndex: activeTab === 'grade' ? 'status' : 'memo',
        render: (_, record) => (activeTab === 'grade' ? record.status ?? '-' : '版本资源'),
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, item) => (
          <Space size="small" wrap>
            <Button
              type="link"
              onClick={() => openResourceModal(activeTab, item)}
              style={{ paddingInline: 0 }}
            >
              编辑
            </Button>
            <Popconfirm
              title={`确认删除 ${activeTab === 'grade' ? item.gradeName || item.id : item.name || item.id} 吗？`}
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDeleteResource(activeTab, item)}
              disabled={submitting || actionSubmitting}
            >
              <Button type="link" danger disabled={submitting || actionSubmitting} style={{ paddingInline: 0 }}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [actionSubmitting, activeTab, submitting],
  );

  return (
    <div className="page-stack">
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            教材管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页整合了旧版的教材、年级、教材版本三个 tab，并保留封面上传、锁定和资源维护能力。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'book', label: '教材管理' },
            { key: 'grade', label: '年级管理' },
            { key: 'version', label: '教材版本' },
          ]}
        />

        {activeTab === 'book' ? (
          <Form form={searchForm} layout="vertical" onFinish={handleBookSearch}>
            <div className="toolbar-grid toolbar-grid--books">
              <Form.Item label="开始时间" name="startTime">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="结束时间" name="endTime">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="年级" name="gradeId">
                <Select
                  allowClear
                  placeholder="全部"
                  options={grades.map((item) => ({
                    value: String(item.id),
                    label: item.gradeName,
                  }))}
                />
              </Form.Item>
              <Form.Item label="教材版本" name="bookVersionId">
                <Select
                  allowClear
                  placeholder="全部"
                  options={versions.map((item) => ({
                    value: String(item.id),
                    label: item.name,
                  }))}
                />
              </Form.Item>
              <Form.Item label=" ">
                <Space wrap>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    搜索
                  </Button>
                  <Button onClick={handleBookReset} disabled={loading}>
                    重置
                  </Button>
                  <Button type="primary" ghost icon={<PlusOutlined />} onClick={openCreateBookModal}>
                    添加教材
                  </Button>
                </Space>
              </Form.Item>
            </div>
          </Form>
        ) : (
          <div className="toolbar-grid toolbar-grid--compact">
            <Typography.Text type="secondary">
              {activeTab === 'grade'
                ? '维护年级基础数据，供教材和课程配置引用。'
                : '维护教材版本基础数据，供教材录入时选择。'}
            </Typography.Text>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openResourceModal(activeTab)}>
              {activeTab === 'grade' ? '添加年级' : '添加教材版本'}
            </Button>
          </div>
        )}
      </Card>

      <Card
        title={activeTab === 'book' ? '教材列表' : activeTab === 'grade' ? '年级列表' : '教材版本列表'}
        extra={
          <Space>
            <Typography.Text type="secondary">
              {activeTab === 'book'
                ? `共 ${totalCount} 条教材记录`
                : activeTab === 'grade'
                  ? `共 ${grades.length} 个年级`
                  : `共 ${versions.length} 个教材版本`}
            </Typography.Text>
            <Button onClick={() => refreshActiveTab()} loading={activeTab === 'book' ? loading : resourceLoading}>
              刷新
            </Button>
          </Space>
        }
      >
        {activeTab === 'book' ? (
          <Table
            rowKey="id"
            columns={bookColumns}
            dataSource={books}
            loading={loading}
            scroll={{ x: 1460 }}
            pagination={buildAntdTablePagination({
              query,
              totalCount,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              setPageNum,
              setPageSize,
            })}
          />
        ) : (
          <Table
            rowKey="id"
            columns={resourceColumns}
            dataSource={activeTab === 'grade' ? grades : versions}
            loading={resourceLoading}
            pagination={false}
          />
        )}
      </Card>

      <Modal
        title={bookModalMode === 'create' ? '新增教材' : '编辑教材'}
        open={bookModalOpen}
        onCancel={closeBookModal}
        onOk={() => bookForm.submit()}
        okText={bookModalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        confirmLoading={submitting}
        width={720}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          统一维护教材名称、封面、年级和教材版本。
        </Typography.Paragraph>
        <Form form={bookForm} layout="vertical" initialValues={EMPTY_BOOK_FORM} onFinish={handleBookSubmit}>
          <div className="form-grid">
            {bookModalMode === 'edit' ? (
              <Form.Item label="教材 ID" name="id">
                <InputNumber disabled style={{ width: '100%' }} />
              </Form.Item>
            ) : null}
            <Form.Item label="教材名称" name="name" rules={[{ required: true, message: '请输入教材名称' }]}>
              <Input placeholder="请输入教材名称" />
            </Form.Item>
            <Form.Item label="年级" name="gradeId" rules={[{ required: true, message: '请选择年级' }]}>
              <Select
                placeholder="请选择年级"
                options={grades.map((item) => ({
                  value: String(item.id),
                  label: item.gradeName,
                }))}
              />
            </Form.Item>
            <Form.Item label="教材版本" name="bookVersionId" rules={[{ required: true, message: '请选择教材版本' }]}>
              <Select
                placeholder="请选择教材版本"
                options={versions.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
              />
            </Form.Item>
            {bookModalMode === 'edit' ? (
              <Form.Item label="年级顺序" name="status">
                <InputNumber precision={0} style={{ width: '100%' }} placeholder="可选，数字" />
              </Form.Item>
            ) : null}
            <Form.Item label="封面图地址" name="icon" className="form-field--full">
              <Input placeholder="可直接粘贴图片 URL" />
            </Form.Item>
            <Form.Item label="上传封面" className="form-field--full">
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                <Upload
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                  customRequest={handleUpload}
                  disabled={uploadState.uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploadState.uploading}>
                    上传教材封面
                  </Button>
                </Upload>
                <Typography.Text type="secondary">
                  {uploadState.uploading ? '上传中...' : uploadState.message || '支持上传教材封面'}
                </Typography.Text>
                {iconValue ? (
                  <Image
                    width={96}
                    height={96}
                    style={{ borderRadius: 20, objectFit: 'cover' }}
                    src={iconValue}
                    alt="教材封面"
                  />
                ) : null}
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          resourceType === 'grade'
            ? resourceId
              ? '编辑年级'
              : '新增年级'
            : resourceId
              ? '编辑教材版本'
              : '新增教材版本'
        }
        open={resourceModalOpen}
        onCancel={closeResourceModal}
        onOk={() => resourceForm.submit()}
        okText={resourceId ? '保存' : '创建'}
        cancelText="取消"
        confirmLoading={submitting}
        width={600}
        mask={{ closable: !submitting }}
        keyboard={!submitting}
      >
        <Typography.Paragraph type="secondary">
          维护基础资源，供教材管理和后续业务页使用。
        </Typography.Paragraph>
        <Form form={resourceForm} layout="vertical" initialValues={EMPTY_RESOURCE_FORM} onFinish={handleResourceSubmit}>
          <div className="form-grid">
            {resourceId ? (
              <Form.Item label="资源 ID" name="id">
                <InputNumber disabled style={{ width: '100%' }} />
              </Form.Item>
            ) : null}
            <Form.Item
              label={resourceType === 'grade' ? '年级名称' : '教材版本名称'}
              name="name"
              className="form-field--full"
              rules={[{ required: true, message: `请输入${resourceType === 'grade' ? '年级' : '教材版本'}名称` }]}
            >
              <Input placeholder={`请输入${resourceType === 'grade' ? '年级' : '教材版本'}名称`} />
            </Form.Item>
            {resourceType === 'grade' ? (
              <Form.Item label="排序字段" name="sortValue">
                <InputNumber precision={0} style={{ width: '100%' }} placeholder="可选，数字" />
              </Form.Item>
            ) : null}
          </div>
        </Form>
      </Modal>
    </div>
  );
}
