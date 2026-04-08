import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listLearningRecords } from '@/app/services/learning-record';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { PageTableCard } from '@/app/components/PageTableCard';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { createLearningRecordColumns } from './configs/tableColumns';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function LearningRecordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const { feedback, showError } = useFeedbackState();
  const columns = useMemo(() => createLearningRecordColumns(), []);
  const {
    query,
    data: records,
    totalCount,
    totalPages,
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
    onError: (message) => showError(message || '学习记录加载失败'),
  });

  useEffect(() => {
    if (!userId) {
      showError('缺少用户 ID，无法加载学习记录');
    }
  }, [userId]);

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">学习记录</h2>
          <p className="page-copy">这一页对应旧版 `learningRecord` 模块，展示当前用户的学习轨迹。</p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="toolbar-grid toolbar-grid--compact">
          <div className="section-meta">当前图图号: {userId || '-'}</div>
          <div className="toolbar-actions">
            <button type="button" className="app-button app-button--ghost" onClick={() => navigate(-1)}>
              返回上一层
            </button>
          </div>
        </div>
      </section>

      <PageTableCard
        title="学习记录列表"
        totalCount={totalCount}
        columns={columns}
        data={records}
        rowKey={(row, index) => `${row.textbookName || 'record'}-${index}`}
        loading={loading}
        pagination={{
          pageNum: query.pageNum,
          pageSize: query.pageSize,
          totalPages,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onPageChange: setPageNum,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
}
