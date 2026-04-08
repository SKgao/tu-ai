import { http } from '@/app/lib/http';

export async function listRoles(keyword = '') {
  const response = await http.post('role/list', keyword || '');
  return response.data?.data || [];
}

export async function createRole(name) {
  const response = await http.post('role/add', name);
  return response.data;
}

export async function removeRole(id) {
  const response = await http.post('role/delete', id);
  return response.data;
}

export async function getRoleMenus(id) {
  const response = await http.get(`role/menus/${id}`, {
    params: { id },
  });
  return response.data?.data || [];
}

export async function setRoleAuthorities(payload) {
  const response = await http.post('role/setAuthority', payload);
  return response.data;
}
