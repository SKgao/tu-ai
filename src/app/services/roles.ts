import { type ApiEntityList, type ApiEnvelope, http } from '@/app/lib/http';
import { type RequestPayload } from '@/app/lib/request';

export async function listRoles(keyword = ''): Promise<ApiEntityList> {
  const response = await http.post<ApiEnvelope<ApiEntityList>>('role/list', keyword || '');
  return response.data?.data || [];
}

export async function createRole(name: string): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('role/add', name);
  return response.data;
}

export async function removeRole(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('role/delete', id);
  return response.data;
}

export async function getRoleMenus(id: number): Promise<ApiEntityList> {
  const response = await http.get<ApiEnvelope<ApiEntityList>>(`role/menus/${id}`, {
    params: { id },
  });
  return response.data?.data || [];
}

export async function setRoleAuthorities(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('role/setAuthority', payload);
  return response.data;
}
