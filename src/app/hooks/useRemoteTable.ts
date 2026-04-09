import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

type RemoteTableQuery = {
  pageNum: number;
  pageSize: number;
} & Record<string, unknown>;

type QueryPatch<TQuery extends RemoteTableQuery> =
  | Partial<TQuery>
  | ((current: TQuery) => Partial<TQuery>);

type UseRemoteTableOptions<TQuery extends RemoteTableQuery, TResult, TItem> = {
  initialQuery: TQuery;
  request: (query: TQuery) => Promise<TResult>;
  getItems?: (result: TResult) => TItem[] | undefined;
  getTotalCount?: (result: TResult, items: TItem[]) => number;
  enabled?: boolean;
  onError?: (message: string, error: unknown) => void;
};

type ReloadResult<TResult, TItem> = {
  data: TItem[];
  totalCount: number;
  result?: TResult;
};

type UseRemoteTableResult<TQuery extends RemoteTableQuery, TResult, TItem> = {
  query: TQuery;
  setQuery: Dispatch<SetStateAction<TQuery>>;
  patchQuery: (nextPatch: QueryPatch<TQuery>) => void;
  applyFilters: (nextFilters: QueryPatch<TQuery>) => void;
  setPageNum: (pageNum: number) => void;
  setPageSize: (pageSize: number) => void;
  data: TItem[];
  setData: Dispatch<SetStateAction<TItem[]>>;
  totalCount: number;
  setTotalCount: Dispatch<SetStateAction<number>>;
  totalPages: number;
  loading: boolean;
  error: string;
  reload: (nextQuery?: TQuery) => Promise<ReloadResult<TResult, TItem>>;
};

function resolveItems<TResult, TItem>(
  result: TResult,
  getItems?: (result: TResult) => TItem[] | undefined,
): TItem[] {
  const items = getItems ? getItems(result) : (result as { data?: TItem[] })?.data;
  return Array.isArray(items) ? items : [];
}

function resolveTotalCount<TResult, TItem>(
  result: TResult,
  items: TItem[],
  getTotalCount?: (result: TResult, items: TItem[]) => number,
): number {
  if (getTotalCount) {
    return getTotalCount(result, items);
  }

  if (typeof (result as { totalCount?: number })?.totalCount === 'number') {
    return (result as { totalCount: number }).totalCount;
  }

  return items.length;
}

export function useRemoteTable<TQuery extends RemoteTableQuery, TResult, TItem = TResult extends { data?: infer TData }
  ? TData extends Array<infer TEntry>
    ? TEntry
    : never
  : never>({
  initialQuery,
  request,
  getItems,
  getTotalCount,
  enabled = true,
  onError,
}: UseRemoteTableOptions<TQuery, TResult, TItem>): UseRemoteTableResult<TQuery, TResult, TItem> {
  const [query, setQuery] = useState<TQuery>(initialQuery);
  const [data, setData] = useState<TItem[]>([]);
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
    async (nextQuery = query): Promise<ReloadResult<TResult, TItem>> => {
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
        const message =
          requestError instanceof Error && requestError.message ? requestError.message : '列表加载失败';
        setError(message);
        onErrorRef.current?.(message, requestError);
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

    void reload().catch(() => {});
  }, [enabled, reload]);

  const patchQuery = useCallback((nextPatch: QueryPatch<TQuery>) => {
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

  const applyFilters = useCallback((nextFilters: QueryPatch<TQuery>) => {
    startTransition(() => {
      setQuery((current) => {
        const filters = typeof nextFilters === 'function' ? nextFilters(current) : nextFilters;
        return {
          ...current,
          ...filters,
          pageNum: 1,
          pageSize:
            typeof filters.pageSize === 'number' ? filters.pageSize : current.pageSize,
        };
      });
    });
  }, []);

  const setPageNum = useCallback(
    (pageNum: number) => {
      patchQuery({ pageNum } as Partial<TQuery>);
    },
    [patchQuery],
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      patchQuery({
        pageNum: 1,
        pageSize,
      } as Partial<TQuery>);
    },
    [patchQuery],
  );

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
