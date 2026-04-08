import { http } from '@/app/lib/http';
import { compactPayload } from '@/app/lib/request';

export async function listMenus(payload) {
  const response = await http.post('menu/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function createMenu(payload) {
  const response = await http.post('menu/add', compactPayload(payload));
  return response.data;
}

export async function updateMenu(payload) {
  const response = await http.post('menu/update', compactPayload(payload));
  return response.data;
}

export async function removeMenu(id) {
  const response = await http.post('menu/delete', id);
  return response.data;
}
