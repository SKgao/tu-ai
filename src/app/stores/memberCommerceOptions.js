import { create } from 'zustand';
import { listActivityOptions } from '@/app/services/activities';
import { listCourseOptions } from '@/app/services/course-bag-activities';
import { listMemberLevelOptions, listMemberLevels } from '@/app/services/member-levels';

function createResourceState() {
  return {
    items: [],
    loading: false,
    loaded: false,
    error: '',
  };
}

function normalizeItems(items) {
  return Array.isArray(items) ? items : [];
}

async function loadResource(set, get, key, request, options = {}) {
  const { force = false } = options;
  const resource = get()[key];

  if (resource.loading) {
    return resource.items;
  }

  if (resource.loaded && !force) {
    return resource.items;
  }

  set((state) => ({
    [key]: {
      ...state[key],
      loading: true,
      error: '',
    },
  }));

  try {
    const items = normalizeItems(await request());
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
    const message = error?.message || '选项加载失败';
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

export const selectOrderFilterOptions = (state) => ({
  memberLevelOptions: state.memberLevelOptions.items,
  activityOptions: state.activityOptions.items,
  courseOptions: state.courseOptions.items,
});

export const selectCourseOptions = (state) => state.courseOptions.items;

export const selectMemberLevelOptions = (state) => state.memberLevelOptions.items;

export const selectActivityFormOptions = (state) => ({
  activityOptions: state.activityOptions.items,
  memberLevels: state.memberLevels.items,
});

export const useMemberCommerceOptionsStore = create((set, get) => ({
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
    return loadResource(set, get, 'courseOptions', listCourseOptions, options);
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
      const nextState = {};
      targetKeys.forEach((key) => {
        if (state[key]) {
          nextState[key] = createResourceState();
        }
      });
      return nextState;
    });
  },
}));
