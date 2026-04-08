import React from 'react';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

export function AppPagination({
  pageNum,
  pageSize,
  totalPages,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  loading = false,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="pagination-bar">
      <div className="section-meta">
        第 {Math.min(pageNum, totalPages)} / {totalPages} 页
      </div>
      <div className="pagination-controls">
        <select
          value={pageSize}
          onChange={(event) => {
            onPageSizeChange(Number(event.target.value));
          }}
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              每页 {option} 条
            </option>
          ))}
        </select>
        <button
          type="button"
          className="app-button app-button--ghost"
          disabled={pageNum <= 1 || loading}
          onClick={() => onPageChange(pageNum - 1)}
        >
          上一页
        </button>
        <button
          type="button"
          className="app-button app-button--ghost"
          disabled={pageNum >= totalPages || loading}
          onClick={() => onPageChange(pageNum + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  );
}
