import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Button, Card, Table, Typography } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { buildAntdTablePagination } from '@/app/lib/antdTable';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { listLearningRecords } from '@/app/services/learning-record';
import { createLearningRecordColumns } from './configs/tableColumns';
import type {
  LearningRecord,
  LearningRecordListResult,
  LearningRecordQuery,
} from './types';

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
  } = useRemoteTable<LearningRecordQuery, LearningRecordListResult, LearningRecord>({
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
  }, [message, userId]);

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="学习记录"
        description="这一页对应旧版 `learningRecord` 模块，展示当前用户的学习轨迹。"
      />

      <PageToolbarCard>
        <div className="toolbar-grid toolbar-grid--compact">
          <Typography.Text type="secondary">当前图图号: {userId || '-'}</Typography.Text>
          <Button onClick={() => navigate(-1)}>返回上一层</Button>
        </div>
      </PageToolbarCard>

      <Card title="学习记录列表" extra={<Typography.Text type="secondary">共 {totalCount} 条记录</Typography.Text>}>
        <Table<LearningRecord>
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
