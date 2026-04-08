import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Button, Card, Space, Table, Typography } from 'antd';
import { listLearningRecords } from '@/app/services/learning-record';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { createLearningRecordColumns } from './configs/tableColumns';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function LearningRecordPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const columns = useMemo(() => createLearningRecordColumns(), []);
  const {
    query,
    data: records,
    totalCount,
    loading,
    setPageNum,
    setPageSize,
  } = useRemoteTable({
    initialQuery: {
      pageNum: 1,
      pageSize: 10,
    },
    enabled: Boolean(userId),
    request: async (currentQuery) =>
      listLearningRecords({
        userId: Number(userId),
        pageNum: currentQuery.pageNum,
        pageSize: currentQuery.pageSize,
      }),
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (errorMessage) => message.error(errorMessage || '学习记录加载失败'),
  });

  useEffect(() => {
    if (!userId) {
      message.error('缺少用户 ID，无法加载学习记录');
    }
  }, [userId]);

  return (
    <div className="page-stack">
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            学习记录
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            这一页对应旧版 `learningRecord` 模块，展示当前用户的学习轨迹。
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card>
        <div className="toolbar-grid toolbar-grid--compact">
          <Typography.Text type="secondary">当前图图号: {userId || '-'}</Typography.Text>
          <Button onClick={() => navigate(-1)}>返回上一层</Button>
        </div>
      </Card>

      <Card title="学习记录列表" extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}>
        <Table
          rowKey={(row, index) => `${row.textbookName || 'record'}-${index}`}
          columns={columns}
          dataSource={records}
          loading={loading}
          scroll={{ x: 880 }}
          pagination={buildAntdTablePagination({
            query,
            totalCount,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            setPageNum,
            setPageSize,
          })}
        />
      </Card>
    </div>
  );
}
