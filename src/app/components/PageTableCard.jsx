import React from 'react';
import { AppPagination } from '@/app/components/AppPagination';
import { AppTable } from '@/app/components/AppTable';

export function PageTableCard({
  title,
  totalCount,
  columns,
  data,
  rowKey,
  loading,
  loadingText,
  emptyText,
  minWidth,
  headerActions,
  pagination,
}) {
  return (
    <section className="surface-card surface-card--table">
      <div className="section-header">
        <div>
          <h3 className="section-title">{title}</h3>
          <p className="section-meta">共 {totalCount} 条记录</p>
        </div>
        {headerActions}
      </div>

      <AppTable
        columns={columns}
        data={data}
        rowKey={rowKey}
        loading={loading}
        loadingText={loadingText}
        emptyText={emptyText}
        minWidth={minWidth}
      />

      {pagination ? <AppPagination {...pagination} loading={loading} /> : null}
    </section>
  );
}
