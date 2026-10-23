import { create } from 'zustand';
import { getErrorMessage } from '@/app/lib/errors';
import { getMyMenus, type MenuApiNode } from '@/app/services/system/menus';

export type MenuNode = {
  id: number;
  parentId: number;
  name: string;
  menuName: string;
  path: string;
  icon: string;
  menuScope: number;
  url: string;
  status: number;
  sortValue: number;
  children: MenuNode[];
};

type MenuState = {
  items: MenuNode[];
  loading: boolean;
  loaded: boolean;
  loadedFor: string;
  error: string;
  ensure: (userId?: number | string) => Promise<void>;
  reload: () => Promise<void>;
  clear: () => void;
};

function normalizeNodes(nodes: MenuApiNode[] | undefined): MenuNode[] {
  return (nodes || []).map((node) => ({
    ...node,
    children: normalizeNodes(node.children),
  }));
}

async function loadMenus(): Promise<{ items: MenuNode[]; error: string }> {
  try {
    const tree = await getMyMenus();
    return { items: normalizeNodes(tree), error: '' };
  } catch (error) {
    return { items: [], error: getErrorMessage(error, '菜单加载失败') };
  }
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  loadedFor: '',
  error: '',
  async ensure(userId) {
    const userKey = String(userId ?? 'current');
    if (get().loaded && get().loadedFor === userKey) {
      return;
    }
    if (get().loading) {
      return;
    }

    set({ loading: true, error: '' });
    const result = await loadMenus();
    set({
      items: result.items,
      error: result.error,
      loading: false,
      loaded: !result.error,
      loadedFor: userKey,
    });
  },
  async reload() {
    set({ loading: true, error: '' });
    const result = await loadMenus();
    set({
      items: result.items,
      error: result.error,
      loading: false,
      loaded: !result.error,
    });
  },
  clear() {
    set({ items: [], loading: false, loaded: false, loadedFor: '', error: '' });
  },
}));
