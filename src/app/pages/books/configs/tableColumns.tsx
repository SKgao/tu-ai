import { Link } from 'react-router-dom';
import { Button, Image, Popconfirm, Space, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { renderCopyableIdValue } from '@/app/components/CopyableIdText';
import type { BookRecord, GradeRecord, ResourceType, VersionRecord } from '../types';

type CreateBookColumnsOptions = {
  onEdit: (book: BookRecord) => void;
  onToggleLock: (book: BookRecord) => void | Promise<void>;
  onDelete: (book: BookRecord) => void | Promise<void>;
  submitting: boolean;
};

type ResourceRecord = GradeRecord | VersionRecord;

type CreateResourceColumnsOptions = {
  resourceType: ResourceType;
  onEdit: (type: ResourceType, item?: ResourceRecord) => void;
  onDelete: (type: ResourceType, item: ResourceRecord) => void | Promise<void>;
  submitting: boolean;
};

export function createBookColumns({
  onEdit,
  onToggleLock,
  onDelete,
  submitting,
}: CreateBookColumnsOptions): TableColumnsType<BookRecord> {
  return [
    { title: '教材名', dataIndex: 'name', render: (value) => String(value || '-') },
    {
      title: '封面',
      dataIndex: 'icon',
      render: (value, record) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={String(value)}
            alt={String(record.name || 'book')}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '年级',
      dataIndex: 'gradeName',
      render: (_value, record) => String(record.gradeName || record.gradeId || '-'),
    },
    {
      title: '教材版本',
      dataIndex: 'bookVersionName',
      render: (_value, record) => String(record.bookVersionName || record.bookVersionId || '-'),
    },
    { title: '创建时间', dataIndex: 'createdAt', render: (value) => String(value || '-') },
    { title: '年级顺序', dataIndex: 'status', render: (value) => String(value ?? '-') },
    {
      title: '锁定状态',
      dataIndex: 'canLock',
      render: (value) => (
        <Tag color={Number(value) === 1 ? 'success' : 'warning'}>
          {Number(value) === 1 ? '已解锁' : '已锁定'}
        </Tag>
      ),
    },
    {
      title: '详情',
      key: 'details',
      render: (_value, book) => (
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
      render: (_value, book) => (
        <Space size="small" wrap>
          <Button type="link" onClick={() => onEdit(book)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => onToggleLock(book)}
            disabled={submitting}
            style={{ paddingInline: 0 }}
          >
            {Number(book.canLock) === 1 ? '锁定' : '解锁'}
          </Button>
          <Popconfirm
            title={`确认删除教材 ${book.name || book.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(book)}
            disabled={submitting}
          >
            <Button type="link" danger disabled={submitting} style={{ paddingInline: 0 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}

export function createResourceColumns({
  resourceType,
  onEdit,
  onDelete,
  submitting,
}: CreateResourceColumnsOptions): TableColumnsType<ResourceRecord> {
  return [
    { title: 'ID', dataIndex: 'id', render: (value) => renderCopyableIdValue(value) },
    {
      title: resourceType === 'grade' ? '年级名称' : '教材版本名称',
      dataIndex: resourceType === 'grade' ? 'gradeName' : 'name',
      render: (value) => String(value || '-'),
    },
    {
      title: resourceType === 'grade' ? '年级顺序' : '备注',
      dataIndex: resourceType === 'grade' ? 'status' : 'memo',
      render: (_value, record) =>
        resourceType === 'grade'
          ? String((record as GradeRecord).status ?? '-')
          : '版本资源',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_value, item) => (
        <Space size="small" wrap>
          <Button
            type="link"
            onClick={() => onEdit(resourceType, item)}
            style={{ paddingInline: 0 }}
          >
            编辑
          </Button>
          <Popconfirm
            title={`确认删除 ${
              resourceType === 'grade'
                ? (item as GradeRecord).gradeName || item.id
                : item.name || item.id
            } 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(resourceType, item)}
            disabled={submitting}
          >
            <Button type="link" danger disabled={submitting} style={{ paddingInline: 0 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
