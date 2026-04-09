import { Button, Card, Descriptions, Image, Popconfirm, Space, Table, Typography } from 'antd';
import { createSubjectResourceColumns } from '../configs/tableColumns';
import type { SubjectDetailRecord, SubjectResourceRecord } from '../types';

type SubjectDetailCardProps = {
  loading: boolean;
  detailRecord: SubjectDetailRecord | null;
  topicId: string;
  detailResources: SubjectResourceRecord[];
  submitting: boolean;
  actionSubmitting: boolean;
  onBack: () => void;
  onEdit: (record: SubjectDetailRecord) => void;
  onRefresh: () => void | Promise<void>;
  onDelete: (record: SubjectDetailRecord) => void | Promise<void>;
};

export function SubjectDetailCard({
  loading,
  detailRecord,
  topicId,
  detailResources,
  submitting,
  actionSubmitting,
  onBack,
  onEdit,
  onRefresh,
  onDelete,
}: SubjectDetailCardProps) {
  return (
    <Card
      title="题目详情"
      extra={
        <Space wrap>
          <Button onClick={onBack}>返回列表</Button>
          {detailRecord ? (
            <Button type="primary" onClick={() => onEdit(detailRecord)}>
              编辑题目
            </Button>
          ) : null}
        </Space>
      }
    >
      {loading ? <Typography.Text type="secondary">数据加载中...</Typography.Text> : null}
      {!loading && !detailRecord ? <Typography.Text type="secondary">未找到题目详情</Typography.Text> : null}
      {!loading && detailRecord ? (
        <Space orientation="vertical" size={20} style={{ width: '100%' }}>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Topic ID">{detailRecord.id || topicId || '-'}</Descriptions.Item>
            <Descriptions.Item label="关卡 ID">{detailRecord.customsPassId ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="关卡名称">{detailRecord.customsPassName || '-'}</Descriptions.Item>
            <Descriptions.Item label="题目顺序">{detailRecord.sort ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{detailRecord.createdAt || '-'}</Descriptions.Item>
            <Descriptions.Item label="题目内容" span={2}>
              {detailRecord.sourceIds || '-'}
            </Descriptions.Item>
          </Descriptions>

          {detailRecord.sceneGraph && detailRecord.sceneGraph !== 'null' ? (
            <div>
              <Typography.Title level={5}>场景图</Typography.Title>
              <Image width={160} src={detailRecord.sceneGraph} alt={detailRecord.customsPassName || 'scene'} />
            </div>
          ) : null}

          <Space wrap>
            <Button onClick={onRefresh}>刷新详情</Button>
            <Button onClick={() => onEdit(detailRecord)}>编辑</Button>
            <Popconfirm
              title={`确认删除题目 ${detailRecord.sourceIds || detailRecord.id} 吗？`}
              okText="确认"
              cancelText="取消"
              onConfirm={() => onDelete(detailRecord)}
              disabled={submitting || actionSubmitting}
            >
              <Button danger disabled={submitting || actionSubmitting}>
                删除
              </Button>
            </Popconfirm>
          </Space>

          <Table
            rowKey={(resource, index) => `${resource.id || resource.text || 'resource'}-${index}`}
            columns={createSubjectResourceColumns()}
            dataSource={detailResources}
            pagination={false}
            locale={{ emptyText: '暂无资源明细' }}
          />
        </Space>
      ) : null}
    </Card>
  );
}
