import { Button, Image, Popconfirm, Space, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import type { SourceMaterialRecord } from '../types';

type CreateSourceMaterialColumnsOptions = {
  onEdit: (item: SourceMaterialRecord) => void;
  onDelete: (item: SourceMaterialRecord) => void | Promise<void>;
  submitting: boolean;
  actionSubmitting: boolean;
};

export function createSourceMaterialColumns({
  onEdit,
  onDelete,
  submitting,
  actionSubmitting,
}: CreateSourceMaterialColumnsOptions): TableColumnsType<SourceMaterialRecord> {
  return [
    { title: '素材内容', dataIndex: 'text', render: (value) => String(value || '-') },
    {
      title: '素材图标',
      dataIndex: 'icon',
      render: (value, item) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={String(value)}
            alt={String(item.text || 'source')}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '素材音频',
      dataIndex: 'audio',
      render: (value) =>
        value ? (
          <audio controls src={String(value)} className="subject-audio" />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    { title: '单次释义', dataIndex: 'translation', render: (value) => String(value || '[]') },
    { title: '多次释义', dataIndex: 'explainsArray', render: (value) => String(value || '[]') },
    { title: '创建时间', dataIndex: 'createdAt', render: (value) => String(value || '-') },
    {
      title: '操作',
      key: 'actions',
      render: (_value, item) => (
        <Space size="small" wrap>
          <Button type="link" onClick={() => onEdit(item)} style={{ paddingInline: 0 }}>
            编辑
          </Button>
          <Popconfirm
            title={`确认删除素材 ${item.text || item.id} 吗？`}
            okText="确认"
            cancelText="取消"
            onConfirm={() => onDelete(item)}
            disabled={submitting || actionSubmitting}
          >
            <Button
              type="link"
              danger
              disabled={submitting || actionSubmitting}
              style={{ paddingInline: 0 }}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
