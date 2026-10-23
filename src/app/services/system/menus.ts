import { type ApiEnvelope, type ApiListResult, http } from '@/app/lib/http';
import { compactPayload, type RequestPayload } from '@/app/lib/request';

export type MenuApiNode = {
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
  children?: MenuApiNode[];
};

export type UserMenuAuthResult = {
  tree: MenuApiNode[];
  checkedIds: number[];
  isSuperAdmin: boolean;
};

export async function listMenus(payload: RequestPayload = {}): Promise<ApiListResult> {
  const response = await http.post<ApiEnvelope<ApiListResult>>('menu/list', compactPayload(payload));
  return response.data?.data || {};
}

/** 当前用户可见的侧边栏菜单树。 */
export async function getMyMenus(): Promise<MenuApiNode[]> {
  const response = await http.post<ApiEnvelope<MenuApiNode[]>>('menu/my', {});
  return response.data?.data || [];
}

/** 菜单管理用的完整菜单树（含停用菜单）。 */
export async function getMenuTree(): Promise<MenuApiNode[]> {
  const response = await http.post<ApiEnvelope<MenuApiNode[]>>('menu/tree', {});
  return response.data?.data || [];
}

/** 某个用户的授权菜单树 + 已勾选节点。 */
export async function getUserMenuAuth(userId: number): Promise<UserMenuAuthResult> {
  const response = await http.post<ApiEnvelope<UserMenuAuthResult>>('menu/user', { userId });
  return response.data?.data || { tree: [], checkedIds: [], isSuperAdmin: false };
}

/** 保存某个用户的可见菜单。 */
export async function setUserMenuAuth(
  userId: number,
  menuIds: number[],
): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('menu/user/update', { userId, menuIds });
  return response.data;
}

export async function createMenu(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('menu/add', compactPayload(payload));
  return response.data;
}

export async function updateMenu(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('menu/update', compactPayload(payload));
  return response.data;
}

export async function removeMenu(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('menu/delete', id);
  return response.data;
}
