import { create } from 'zustand';
import type { ApiEntity, ApiEntityList } from '@/app/lib/http';
import { listActivityOptions } from '@/app/services/activities';
import { listMemberLevelOptions, listMemberLevels } from '@/app/services/member-levels';
import { listSpecialCourseOptions } from '@/app/services/special-courses';

type ResourceState<T extends ApiEntity = ApiEntity> = {
  items: T[];
  loading: boolean;
  loaded: boolean;
  error: string;
};

type ResourceOptions = {
  force?: boolean;
};

type ResourceKey =
  | 'memberLevels'
  | 'memberLevelOptions'
  | 'activityOptions'
  | 'courseOptions';

type MemberCommerceOptionsState = {
  memberLevels: ResourceState;
  memberLevelOptions: ResourceState;
  activityOptions: ResourceState;
  courseOptions: ResourceState;
  ensureMemberLevels: (options?: ResourceOptions) => Promise<ApiEntityList>;
  ensureMemberLevelOptions: (options?: ResourceOptions) => Promise<ApiEntityList>;
  ensureActivityOptions: (options?: ResourceOptions) => Promise<ApiEntityList>;
  ensureCourseOptions: (options?: ResourceOptions) => Promise<ApiEntityList>;
  refreshMemberLevels: () => Promise<ApiEntityList>;
  refreshMemberLevelOptions: () => Promise<ApiEntityList>;
  refreshActivityOptions: () => Promise<ApiEntityList>;
  refreshCourseOptions: () => Promise<ApiEntityList>;
  ensureOrderFilterOptions: (options?: ResourceOptions) => Promise<void>;
  ensureActivityFilterOptions: (options?: ResourceOptions) => Promise<void>;
  refreshMemberLevelResources: () => Promise<void>;
  refreshOrderFilterOptions: () => Promise<void>;
  refreshActivityFilterOptions: () => Promise<void>;
  invalidateMemberLevelResources: () => void;
  invalidateActivityResources: () => void;
  invalidateCourseResources: () => void;
  invalidate: (keys: ResourceKey | ResourceKey[]) => void;
};

type StoreSetState = (
  partial:
    | Partial<MemberCommerceOptionsState>
    | ((state: MemberCommerceOptionsState) => Partial<MemberCommerceOptionsState>),
) => void;

type StoreGetState = () => MemberCommerceOptionsState;

function createResourceState<T extends ApiEntity = ApiEntity>(): ResourceState<T> {
  return {
    items: [],
    loading: false,
    loaded: false,
    error: '',
  };
}

function normalizeItems<T extends ApiEntity>(items: unknown): T[] {
  return Array.isArray(items) ? (items as T[]) : [];
}

/**
 * 每个 key 的在途请求与请求序号。
 *
 * 旧实现有两个缺陷，这里一并修掉：
 *  1. `if (loading) return items` 排在 `force` 之前 → 首屏未加载完时
 *     调用 `{ force: true }` 会直接拿到旧数据（新建的选项不出现）。
 *  2. 并发调用会重复发请求（无在途去重）。
 *
 * 现在的语义：非强制调用复用同一个在途请求；强制调用一定重新发起；
 * 用序号保证只有最新一次请求能写状态，避免先发后到的响应覆盖新数据。
 */
const inflightRequests = new Map<ResourceKey, Promise<unknown>>();
const requestIds = new Map<ResourceKey, number>();

async function loadResource<T extends ApiEntity>(
  set: StoreSetState,
  get: StoreGetState,
  key: ResourceKey,
  request: () => Promise<T[]>,
  options: ResourceOptions = {},
): Promise<T[]> {
  const { force = false } = options;
  const resource = get()[key];

  // 有缓存且不强制刷新 → 直接复用
  if (resource.loaded && !force) {
    return resource.items as T[];
  }

  // 正在加载且不强制 → 复用在途请求，避免并发重复请求
  const existing = inflightRequests.get(key);
  if (existing && !force) {
    return existing as Promise<T[]>;
  }

  const currentId = (requestIds.get(key) ?? 0) + 1;
  requestIds.set(key, currentId);

  set((state) => ({
    [key]: {
      ...state[key],
      loading: true,
      error: '',
    },
  }));

  const pending = (async () => {
    try {
      const items = normalizeItems<T>(await request());

      // 只有最新那次请求允许写状态
      if (currentId === requestIds.get(key)) {
        set(() => ({
          [key]: {
            items,
            loading: false,
            loaded: true,
            error: '',
          },
        }));
      }

      return items;
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : '选项加载失败';

      if (currentId === requestIds.get(key)) {
        set((state) => ({
          [key]: {
            ...state[key],
            loading: false,
            error: message,
          },
        }));
      }

      throw error;
    } finally {
      if (currentId === requestIds.get(key)) {
        inflightRequests.delete(key);
      }
    }
  })();

  inflightRequests.set(key, pending);
  return pending;
}

export const selectOrderFilterOptions = (state: MemberCommerceOptionsState) => ({
  memberLevelOptions: state.memberLevelOptions.items,
  activityOptions: state.activityOptions.items,
  courseOptions: state.courseOptions.items,
});

export const selectCourseOptions = (state: MemberCommerceOptionsState) => state.courseOptions.items;

export const selectMemberLevelOptions = (state: MemberCommerceOptionsState) => state.memberLevelOptions.items;

export const selectActivityFormOptions = (state: MemberCommerceOptionsState) => ({
  activityOptions: state.activityOptions.items,
  memberLevels: state.memberLevels.items,
});

export const useMemberCommerceOptionsStore = create<MemberCommerceOptionsState>((set, get) => ({
  memberLevels: createResourceState(),
  memberLevelOptions: createResourceState(),
  activityOptions: createResourceState(),
  courseOptions: createResourceState(),

  ensureMemberLevels(options) {
    return loadResource(set, get, 'memberLevels', listMemberLevels, options);
  },

  ensureMemberLevelOptions(options) {
    return loadResource(set, get, 'memberLevelOptions', listMemberLevelOptions, options);
  },

  ensureActivityOptions(options) {
    return loadResource(set, get, 'activityOptions', listActivityOptions, options);
  },

  ensureCourseOptions(options) {
    return loadResource(set, get, 'courseOptions', listSpecialCourseOptions, options);
  },

  refreshMemberLevels() {
    return get().ensureMemberLevels({ force: true });
  },

  refreshMemberLevelOptions() {
    return get().ensureMemberLevelOptions({ force: true });
  },

  refreshActivityOptions() {
    return get().ensureActivityOptions({ force: true });
  },

  refreshCourseOptions() {
    return get().ensureCourseOptions({ force: true });
  },

  async ensureOrderFilterOptions(options) {
    await Promise.all([
      get().ensureMemberLevelOptions(options),
      get().ensureActivityOptions(options),
      get().ensureCourseOptions(options),
    ]);
  },

  async ensureActivityFilterOptions(options) {
    await Promise.all([get().ensureActivityOptions(options), get().ensureMemberLevels(options)]);
  },

  async refreshMemberLevelResources() {
    await Promise.all([get().refreshMemberLevels(), get().refreshMemberLevelOptions()]);
  },

  async refreshOrderFilterOptions() {
    await Promise.all([
      get().refreshMemberLevelOptions(),
      get().refreshActivityOptions(),
      get().refreshCourseOptions(),
    ]);
  },

  async refreshActivityFilterOptions() {
    await Promise.all([get().refreshActivityOptions(), get().refreshMemberLevels()]);
  },

  invalidateMemberLevelResources() {
    get().invalidate(['memberLevels', 'memberLevelOptions']);
  },

  invalidateActivityResources() {
    get().invalidate('activityOptions');
  },

  invalidateCourseResources() {
    get().invalidate('courseOptions');
  },

  invalidate(keys) {
    const targetKeys = Array.isArray(keys) ? keys : [keys];
    // 同时作废在途请求，避免失效后旧响应又把数据写回来
    targetKeys.forEach((key) => {
      requestIds.set(key, (requestIds.get(key) ?? 0) + 1);
      inflightRequests.delete(key);
    });
    set((state) => {
      const nextState: Partial<MemberCommerceOptionsState> = {};
      targetKeys.forEach((key) => {
        if (state[key]) {
          // 只标记失效，**保留既有 items**：
          // 若这里清空，写操作成功后下拉会有一段时间是空列表（等重新请求返回）。
          // 保留旧数据 + loaded=false，既有 UI 不闪，下一次 ensure 会重新拉取。
          nextState[key] = {
            ...state[key],
            loaded: false,
            error: '',
          };
        }
      });
      return nextState;
    });
  },
}));
