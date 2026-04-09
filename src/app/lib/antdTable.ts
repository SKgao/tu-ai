import type { TablePaginationConfig } from 'antd';

type PaginationQuery = {
  pageNum: number;
  pageSize: number;
};

type BuildAntdTablePaginationOptions<TQuery extends PaginationQuery> = {
  query: TQuery;
  totalCount: number;
  pageSizeOptions: number[];
  setPageNum: (pageNum: number) => void;
  setPageSize: (pageSize: number) => void;
};

export function buildAntdTablePagination<TQuery extends PaginationQuery>({
  query,
  totalCount,
  pageSizeOptions,
  setPageNum,
  setPageSize,
}: BuildAntdTablePaginationOptions<TQuery>): TablePaginationConfig {
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
    onShowSizeChange: (_current, pageSize) => {
      if (pageSize !== query.pageSize) {
        setPageSize(pageSize);
      }
    },
  };
}
