import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';

function resolveItems(result, getItems) {
  const items = getItems ? getItems(result) : result?.data;
  return Array.isArray(items) ? items : [];
}

function resolveTotalCount(result, items, getTotalCount) {
  if (getTotalCount) {
    return getTotalCount(result, items);
  }

  if (typeof result?.totalCount === 'number') {
    return result.totalCount;
  }

  return items.length;
}

export function useRemoteTable({
  initialQuery,
  request,
  getItems,
  getTotalCount,
  enabled = true,
  onError,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState('');

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / (query.pageSize || 1))),
    [query.pageSize, totalCount],
  );

  const reload = useCallback(
    async (nextQuery = query) => {
      if (!enabled) {
        setData([]);
        setTotalCount(0);
        setLoading(false);
        setError('');
        return {
          data: [],
          totalCount: 0,
        };
      }

      setLoading(true);
      try {
        const result = await request(nextQuery);
        const nextItems = resolveItems(result, getItems);
        const nextTotalCount = resolveTotalCount(result, nextItems, getTotalCount);

        setData(nextItems);
        setTotalCount(nextTotalCount);
        setError('');

        return {
          data: nextItems,
          totalCount: nextTotalCount,
          result,
        };
      } catch (requestError) {
        const message = requestError?.message || '列表加载失败';
        setError(message);
        if (onError) {
          onError(message, requestError);
        }
        throw requestError;
      } finally {
        setLoading(false);
      }
    },
    [enabled, getItems, getTotalCount, onError, query, request],
  );

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setTotalCount(0);
      setLoading(false);
      setError('');
      return;
    }

    reload().catch(() => {});
  }, [enabled, reload]);

  function patchQuery(nextPatch) {
    startTransition(() => {
      setQuery((current) => {
        const patch = typeof nextPatch === 'function' ? nextPatch(current) : nextPatch;
        return {
          ...current,
          ...patch,
        };
      });
    });
  }

  function applyFilters(nextFilters) {
    startTransition(() => {
      setQuery((current) => {
        const filters = typeof nextFilters === 'function' ? nextFilters(current) : nextFilters;
        return {
          ...current,
          ...filters,
          pageNum: 1,
          pageSize: filters?.pageSize ?? current.pageSize,
        };
      });
    });
  }

  function setPageNum(pageNum) {
    patchQuery({ pageNum });
  }

  function setPageSize(pageSize) {
    patchQuery({
      pageNum: 1,
      pageSize,
    });
  }

  return {
    query,
    setQuery,
    patchQuery,
    applyFilters,
    setPageNum,
    setPageSize,
    data,
    setData,
    totalCount,
    setTotalCount,
    totalPages,
    loading,
    error,
    reload,
  };
}
