import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listInviteRecords } from '@/app/services/invite-count';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { PageTableCard } from '@/app/components/PageTableCard';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { usePaginationState } from '@/app/hooks/usePaginationState';
import { createInviteColumns } from './configs/tableColumns';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function InviteCountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const { feedback, showError } = useFeedbackState();
  const [inviteList, setInviteList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const totalCount = inviteList.length;
  const { pageNum, pageSize, totalPages, setPageNum, setPageSize } = usePaginationState({
    initialPageNum: 1,
    initialPageSize: 10,
    totalCount,
  });
  const columns = useMemo(() => createInviteColumns(), []);

  useEffect(() => {
    async function loadInviteList() {
      setLoading(true);
      try {
        const data = await listInviteRecords(Number(userId));
        setInviteList(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        showError(error?.message || '邀请明细加载失败');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadInviteList();
    } else {
      setInviteList([]);
      setLoading(false);
    }
  }, [userId]);

  const pagedInviteList = useMemo(() => {
    const startIndex = (pageNum - 1) * pageSize;
    return inviteList.slice(startIndex, startIndex + pageSize);
  }, [inviteList, pageNum, pageSize]);

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">邀请明细</h2>
          <p className="page-copy">这一页对应旧版 `inviteCount` 模块，展示当前用户的邀请用户列表。</p>
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
        title="邀请用户列表"
        totalCount={totalCount}
        columns={columns}
        data={pagedInviteList}
        rowKey={(row, index) => `${row.tutuNumber || 'invite'}-${index}`}
        loading={loading}
        pagination={{
          pageNum,
          pageSize,
          totalPages,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onPageChange: setPageNum,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
}
