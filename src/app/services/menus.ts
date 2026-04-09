import { type ApiEnvelope, type ApiListResult, http } from '@/app/lib/http';
import { compactPayload, type RequestPayload } from '@/app/lib/request';

export async function listMenus(payload: RequestPayload = {}): Promise<ApiListResult> {
  const response = await http.post<ApiEnvelope<ApiListResult>>('menu/list', compactPayload(payload));
  return response.data?.data || {};
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
