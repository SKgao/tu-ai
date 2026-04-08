import React, { useEffect, useMemo, useState } from 'react';
import { listCourseOrders } from '@/app/services/course-orders';
import { FeedbackBanner } from '@/app/components/FeedbackBanner';
import { PageTableCard } from '@/app/components/PageTableCard';
import { useFeedbackState } from '@/app/hooks/useFeedbackState';
import { useRemoteTable } from '@/app/hooks/useRemoteTable';
import { createCourseOrderColumns } from './configs/tableColumns';
import {
  selectCourseOptions,
  useMemberCommerceOptionsStore,
} from '@/app/stores/memberCommerceOptions';

const INITIAL_FILTERS = {
  tutuNumber: '',
  orderNo: '',
  payType: '',
  orderStatus: '',
  textbookId: '',
};

const INITIAL_QUERY = {
  ...INITIAL_FILTERS,
  pageNum: 1,
  pageSize: 10,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const PAY_TYPE_OPTIONS = [
  { value: '', label: '全部' },
  { value: '1', label: '微信' },
  { value: '2', label: '支付宝' },
];

const ORDER_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: '1', label: '待支付' },
  { value: '2', label: '已支付' },
  { value: '3', label: '用户取消' },
  { value: '4', label: '超时关闭' },
];

export function CourseOrderManagementPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const { feedback, showError } = useFeedbackState();
  const courseOptions = useMemberCommerceOptionsStore(selectCourseOptions);
  const ensureCourseOptions = useMemberCommerceOptionsStore((state) => state.ensureCourseOptions);
  const columns = useMemo(() => createCourseOrderColumns(), []);
  const {
    query,
    data: orders,
    totalCount,
    totalPages,
    loading,
    applyFilters,
    setPageNum,
    setPageSize,
    reload,
  } = useRemoteTable({
    initialQuery: INITIAL_QUERY,
    request: listCourseOrders,
    getItems: (result) => result?.data,
    getTotalCount: (result) => result?.totalCount || 0,
    onError: (message) => showError(message || '精品课程订单列表加载失败'),
  });

  useEffect(() => {
    ensureCourseOptions().catch((error) => {
      showError(error?.message || '课程筛选项加载失败');
    });
  }, []);

  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSearch() {
    applyFilters({
      ...filters,
      tutuNumber: filters.tutuNumber.trim(),
      orderNo: filters.orderNo.trim(),
    });
  }

  return (
    <div className="page-stack">
      <section className="page-stack__hero">
        <div>
          <span className="app-badge">Legacy Rewrite</span>
          <h2 className="page-title">精品课程订单</h2>
          <p className="page-copy">
            这一页对应旧版 `courseOrder` 模块，保留精品课程订单列表和核心筛选能力。
          </p>
        </div>
      </section>

      <FeedbackBanner feedback={feedback} />

      <section className="surface-card">
        <div className="toolbar-grid toolbar-grid--books">
          <label className="form-field">
            <span>图图号</span>
            <input
              value={filters.tutuNumber}
              onChange={(event) => updateFilter('tutuNumber', event.target.value)}
              placeholder="输入图图号"
            />
          </label>
          <label className="form-field">
            <span>订单号</span>
            <input
              value={filters.orderNo}
              onChange={(event) => updateFilter('orderNo', event.target.value)}
              placeholder="输入订单号"
            />
          </label>
          <label className="form-field">
            <span>支付类型</span>
            <select value={filters.payType} onChange={(event) => updateFilter('payType', event.target.value)}>
              {PAY_TYPE_OPTIONS.map((item) => (
                <option key={item.value || 'all'} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>支付状态</span>
            <select
              value={filters.orderStatus}
              onChange={(event) => updateFilter('orderStatus', event.target.value)}
            >
              {ORDER_STATUS_OPTIONS.map((item) => (
                <option key={item.value || 'all'} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>精品课程</span>
            <select
              value={filters.textbookId}
              onChange={(event) => updateFilter('textbookId', event.target.value)}
            >
              <option value="">全部</option>
              {courseOptions.map((item) => (
                <option key={item.textbookId} value={String(item.textbookId)}>
                  {item.textbookName}
                </option>
              ))}
            </select>
          </label>
          <div className="toolbar-actions">
            <button type="button" className="app-button app-button--primary" onClick={handleSearch}>
              搜索
            </button>
            <button
              type="button"
              className="app-button app-button--ghost"
              onClick={() => reload().catch(() => {})}
              disabled={loading}
            >
              {loading ? '刷新中...' : '刷新'}
            </button>
          </div>
        </div>
      </section>

      <PageTableCard
        title="精品课程订单列表"
        totalCount={totalCount}
        columns={columns}
        data={orders}
        rowKey={(row) => row.orderNo || row.id}
        loading={loading}
        minWidth={1480}
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
