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

async function loadResource<T extends ApiEntity>(
  set: StoreSetState,
  get: StoreGetState,
  key: ResourceKey,
  request: () => Promise<T[]>,
  options: ResourceOptions = {},
): Promise<T[]> {
  const { force = false } = options;
  const resource = get()[key];

  if (resource.loading) {
    return resource.items as T[];
  }

  if (resource.loaded && !force) {
    return resource.items as T[];
  }

  set((state) => ({
    [key]: {
      ...state[key],
      loading: true,
      error: '',
    },
  }));

  try {
    const items = normalizeItems<T>(await request());
    set(() => ({
      [key]: {
        items,
        loading: false,
        loaded: true,
        error: '',
      },
    }));
    return items;
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : '选项加载失败';
    set((state) => ({
      [key]: {
        ...state[key],
        loading: false,
        error: message,
      },
    }));
    throw error;
  }
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
    set((state) => {
      const nextState: Partial<MemberCommerceOptionsState> = {};
      targetKeys.forEach((key) => {
        if (state[key]) {
          nextState[key] = createResourceState();
        }
      });
      return nextState;
    });
  },
}));
