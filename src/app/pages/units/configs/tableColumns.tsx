import { Link } from 'react-router-dom';
import { Button, Image, Popconfirm, Space, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import type { UnitRecord } from '../types';

type CreateUnitColumnsOptions = {
  bookMap: Map<string, string | undefined>;
  textbookId?: string;
  onEdit: (unit: UnitRecord) => void;
  onToggleLock: (unit: UnitRecord) => void | Promise<void>;
  onDelete: (unit: UnitRecord) => void | Promise<void>;
  submitting: boolean;
  actionSubmitting: boolean;
};

function isUnlocked(value: UnitRecord['canLock']): boolean {
  return Number(value) === 1;
}

export function createUnitColumns({
  bookMap,
  textbookId,
  onEdit,
  onToggleLock,
  onDelete,
  submitting,
  actionSubmitting,
}: CreateUnitColumnsOptions): TableColumnsType<UnitRecord> {
  return [
    { title: '单元名', dataIndex: 'text', render: (value) => value || '-' },
    {
      title: '封面图',
      dataIndex: 'icon',
      render: (value, record) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={value}
            alt={record.text || 'unit'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '教材',
      dataIndex: 'textBookName',
      render: (_value, record) =>
        record.textBookName ||
        bookMap.get(String(record.textBookId || '')) ||
        (record.textBookId ? String(record.textBookId) : '-') ||
        '-',
    },
    { title: '排序', dataIndex: 'sort', render: (value) => value ?? '-' },
    {
      title: '锁定状态',
      dataIndex: 'canLock',
      render: (value) => <Tag color={isUnlocked(value) ? 'success' : 'warning'}>{isUnlocked(value) ? '已解锁' : '已锁定'}</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt', render: (value) => value || '-' },
    {
      title: '详情',
      key: 'details',
      render: (_, unit) =>
        unit.id ? (
          <Link
            to={`/parts?unitId=${unit.id}&textBookId=${unit.textBookId || textbookId || ''}`}
            className="ant-btn ant-btn-link"
          >
            查看 Part
          </Link>
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, unit) => (
        <Space size="small" wrap>
          <Button type="link" onClick={() => onEdit(unit)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => onToggleLock(unit)}
            disabled={submitting || actionSubmitting}
            style={{ paddingInline: 0 }}
          >
            {isUnlocked(unit.canLock) ? '锁定' : '解锁'}
          </Button>
          <Popconfirm
            title={`确认删除单元 ${unit.text || unit.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(unit)}
            disabled={submitting || actionSubmitting}
          >
            <Button type="link" danger disabled={submitting || actionSubmitting} style={{ paddingInline: 0 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
