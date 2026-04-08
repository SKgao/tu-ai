import { startTransition, useEffect, useMemo, useState } from 'react';

export function usePaginationState({ initialPageNum = 1, initialPageSize = 10, totalCount = 0 }) {
  const [pagination, setPagination] = useState({
    pageNum: initialPageNum,
    pageSize: initialPageSize,
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / (pagination.pageSize || 1))),
    [pagination.pageSize, totalCount],
  );

  useEffect(() => {
    if (pagination.pageNum <= totalPages) {
      return;
    }

    startTransition(() => {
      setPagination((current) => ({
        ...current,
        pageNum: totalPages,
      }));
    });
  }, [pagination.pageNum, totalPages]);

  function setPageNum(pageNum) {
    startTransition(() => {
      setPagination((current) => ({
        ...current,
        pageNum,
      }));
    });
  }

  function setPageSize(pageSize) {
    startTransition(() => {
      setPagination((current) => ({
        ...current,
        pageNum: 1,
        pageSize,
      }));
    });
  }

  return {
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
    pagination,
    setPagination,
    setPageNum,
    setPageSize,
    totalPages,
  };
}
