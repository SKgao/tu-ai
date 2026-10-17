import { create } from 'zustand';
import { getErrorMessage } from '@/app/lib/errors';

/**
 * 字典/选项类数据的通用缓存 store。
 *
 * 适用对象：被多个页面各自 mount 全量拉取、只用于下拉选项的数据
 * （教材、题型、课程包、角色、会员等级……）。
 * **不适用于**各页自己的分页表格数据。
 *
 * 这里修掉了旧版 `memberCommerceOptions` 的两个缺陷：
 *
 * 1. **`force` 不再被 `loading` 挡掉**
 *    旧实现把 `if (loading) return items` 放在 `force` 判断之前，
 *    导致首屏还没加载完时调用 `{ force: true }` 会直接拿到旧数据。
 *    现在：非强制调用复用同一个在途请求（去重），强制调用一定重新发起。
 *
 * 2. **`invalidate` 会真正生效**
 *    失效只把 `loaded` 置回 false，交给下一次 `ensure()` 惰性重取，
 *    避免为「当前没人看的字典」立刻发请求。
 *
 * 另外用请求序号保证「只有最新一次请求能写状态」，避免先发后到的响应
 * 覆盖新数据（与 `useRemoteTable` 的竞态处理保持一致）。
 */

export type DictionaryOptions = {
  force?: boolean;
};

export type DictionaryStoreState<TItem> = {
  items: TItem[];
  loading: boolean;
  loaded: boolean;
  error: string;
  /** 确保数据已加载；`force: true` 会强制重新拉取 */
  ensure: (options?: DictionaryOptions) => Promise<TItem[]>;
  /** 标记缓存失效，下一次 ensure 会重新拉取 */
  invalidate: () => void;
};

/** 字典项的基础形状：大多数选项字典都是 id + name */
export type DictionaryOption = {
  id: number | string;
  name?: string;
} & Record<string, unknown>;

export type DictionaryStore<TItem> = ReturnType<typeof create<DictionaryStoreState<TItem>>>;

export function createDictionaryStore<TItem>(config: {
  /** 用于报错文案，例如「教材列表」 */
  label: string;
  fetcher: () => Promise<TItem[]>;
}) {
  const { label, fetcher } = config;

  // 每个 store 实例各自持有：在途请求 + 请求序号
  let inflight: Promise<TItem[]> | null = null;
  let requestId = 0;

  return create<DictionaryStoreState<TItem>>((set, get) => ({
    items: [],
    loading: false,
    loaded: false,
    error: '',

    async ensure(options = {}) {
      const { force = false } = options;
      const state = get();

      // 有缓存且不强制 → 直接返回
      if (state.loaded && !force) {
        return state.items;
      }

      // 正在加载且不强制 → 复用同一个在途请求，避免并发重复请求
      if (inflight && !force) {
        return inflight;
      }

      const currentId = requestId + 1;
      requestId = currentId;

      set({ loading: true, error: '' });

      const pending = (async () => {
        try {
          const items = await fetcher();

          // 只有最新那次请求允许写状态，过期响应直接丢弃
          if (currentId === requestId) {
            set({ items, loading: false, loaded: true, error: '' });
          }

          return items;
        } catch (error) {
          if (currentId === requestId) {
            set({
              loading: false,
              error: getErrorMessage(error, `${label}加载失败`),
            });
          }

          throw error;
        } finally {
          if (currentId === requestId) {
            inflight = null;
          }
        }
      })();

      inflight = pending;
      return pending;
    },

    invalidate() {
      set({ loaded: false, error: '' });
    },
  }));
}
