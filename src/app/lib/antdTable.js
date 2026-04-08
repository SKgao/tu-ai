export function buildAntdTablePagination({
  query,
  totalCount,
  pageSizeOptions,
  setPageNum,
  setPageSize,
}) {
  return {
    current: query.pageNum,
    pageSize: query.pageSize,
    total: totalCount,
    showSizeChanger: true,
    pageSizeOptions: pageSizeOptions.map(String),
    showTotal: (total) => `共 ${total} 条记录`,
    onChange: (page, pageSize) => {
      if (pageSize !== query.pageSize) {
        setPageSize(pageSize);
        return;
      }

      if (page !== query.pageNum) {
        setPageNum(page);
      }
    },
    onShowSizeChange: (_, pageSize) => {
      if (pageSize !== query.pageSize) {
        setPageSize(pageSize);
      }
    },
  };
}
