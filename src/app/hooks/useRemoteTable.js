import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const requestRef = useRef(request);
  const getItemsRef = useRef(getItems);
  const getTotalCountRef = useRef(getTotalCount);
  const onErrorRef = useRef(onError);

  requestRef.current = request;
  getItemsRef.current = getItems;
  getTotalCountRef.current = getTotalCount;
  onErrorRef.current = onError;

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
        const result = await requestRef.current(nextQuery);
        const nextItems = resolveItems(result, getItemsRef.current);
        const nextTotalCount = resolveTotalCount(result, nextItems, getTotalCountRef.current);

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
        if (onErrorRef.current) {
          onErrorRef.current(message, requestError);
        }
        throw requestError;
      } finally {
        setLoading(false);
      }
    },
    [enabled, query],
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

  const patchQuery = useCallback((nextPatch) => {
    startTransition(() => {
      setQuery((current) => {
        const patch = typeof nextPatch === 'function' ? nextPatch(current) : nextPatch;
        return {
          ...current,
          ...patch,
        };
      });
    });
  }, []);

  const applyFilters = useCallback((nextFilters) => {
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
  }, []);

  const setPageNum = useCallback((pageNum) => {
    patchQuery({ pageNum });
  }, [patchQuery]);

  const setPageSize = useCallback((pageSize) => {
    patchQuery({
      pageNum: 1,
      pageSize,
    });
  }, [patchQuery]);

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
