import { Button, Image, Popconfirm, Space, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import type { SubjectRecord, SubjectResourceRecord } from '../types';

type CreateSubjectColumnsOptions = {
  enableSceneColumn: boolean;
  onEdit: (record: SubjectRecord) => void;
  onView: (record: SubjectRecord) => void;
  onDelete: (record: SubjectRecord) => void | Promise<void>;
  submitting: boolean;
  actionSubmitting: boolean;
};

export function createSubjectColumns({
  enableSceneColumn,
  onEdit,
  onView,
  onDelete,
  submitting,
  actionSubmitting,
}: CreateSubjectColumnsOptions): TableColumnsType<SubjectRecord> {
  const columns: TableColumnsType<SubjectRecord> = [
    { title: '单元名称', dataIndex: 'unitsName', render: (value) => value || '-' },
    { title: 'Part 描述', dataIndex: 'partsTips', render: (value) => value || '-' },
    { title: 'Part 标题', dataIndex: 'partsTitle', render: (value) => value || '-' },
    { title: '关卡名称', dataIndex: 'customsPassName', render: (value) => value || '-' },
    { title: '题目内容', dataIndex: 'sourceIds', render: (value) => value || '-' },
    { title: '题目顺序', dataIndex: 'sort', render: (value) => value ?? '-' },
  ];

  if (enableSceneColumn) {
    columns.push({
      title: '场景图',
      dataIndex: 'sceneGraph',
      render: (value, record) =>
        value && value !== 'null' ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={value}
            alt={record.customsPassName || 'scene'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    });
  }

  columns.push({
    title: '操作',
    key: 'actions',
    render: (_, record) => (
      <Space size="small" wrap>
        <Button type="link" onClick={() => onEdit(record)} style={{ paddingInline: 0 }}>
          编辑
        </Button>
        <Button type="link" onClick={() => onView(record)} style={{ paddingInline: 0 }}>
          查看详情
        </Button>
        <Popconfirm
          title={`确认删除题目 ${record.sourceIds || record.id} 吗？`}
          okText="确认"
          cancelText="取消"
          onConfirm={() => onDelete(record)}
          disabled={submitting || actionSubmitting}
        >
          <Button type="link" danger disabled={submitting || actionSubmitting} style={{ paddingInline: 0 }}>
            删除
          </Button>
        </Popconfirm>
      </Space>
    ),
  });

  return columns;
}

export function createSubjectResourceColumns(): TableColumnsType<SubjectResourceRecord> {
  return [
    { title: '资源文本', dataIndex: 'text', render: (value) => value || '-' },
    {
      title: '图片',
      dataIndex: 'icon',
      render: (value, resource) =>
        value ? (
          <Image
            width={52}
            height={52}
            style={{ borderRadius: 16, objectFit: 'cover' }}
            src={value}
            alt={resource.text || 'resource'}
          />
        ) : (
          <Typography.Text type="secondary">无</Typography.Text>
        ),
    },
    {
      title: '音频',
      dataIndex: 'audio',
      render: (value) =>
        value ? <audio controls src={value} className="subject-audio" /> : <Typography.Text type="secondary">无</Typography.Text>,
    },
  ];
}
