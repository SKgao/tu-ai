import { type ApiEntityList, type ApiEnvelope, type ApiListResult, http } from '@/app/lib/http';
import { compactPayload, createUploadFormData, type RequestOptions, type RequestPayload } from '@/app/lib/request';

export async function listCustomPasses(payload: RequestPayload & { textbookId: string | number }): Promise<ApiEnvelope<ApiListResult>> {
  const response = await http.get<ApiEnvelope<ApiListResult>>(`pass/list/${payload.textbookId}`, {
    params: compactPayload(payload),
  });
  return response.data || {};
}

export async function listSessions(textbookId: number): Promise<ApiEntityList> {
  const response = await http.get<ApiEnvelope<ApiEntityList>>(`/session/list/${textbookId}`);
  return response.data?.data || [];
}

export async function createSession(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('session/add', compactPayload(payload));
  return response.data;
}

export async function updateSession(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('session/update', compactPayload(payload));
  return response.data;
}

export async function removeSession(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`/session/delete/${id}`);
  return response.data;
}

export async function changeSessionStatus(payload: { id: number; status: number }): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>(
    `session/changeStatus?id=${payload.id}&status=${payload.status}`,
    payload,
  );
  return response.data;
}

export async function bindCustomPassToSession(payload: {
  textbookId: number;
  sessionId: number;
  customPassId: number;
}): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>(
    `session/bind?textbookId=${payload.textbookId}&sessionId=${payload.sessionId}&customPassId=${payload.customPassId}`,
    payload,
  );
  return response.data;
}

export async function listSessionCustomPasses(payload: {
  textbookId: number;
  sessionId: number;
}): Promise<ApiEntityList> {
  const response = await http.post<ApiEnvelope<ApiEntityList>>(
    `session/custom/list?textbookId=${payload.textbookId}&sessionId=${payload.sessionId}`,
    payload,
  );
  return response.data?.data || [];
}

export async function unbindSessionCustomPass(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`session/unbind/${id}`);
  return response.data;
}

export async function changeSessionCustomSort(payload: { id: number; sort: number }): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>(`session/change/sort?id=${payload.id}&sort=${payload.sort}`, payload);
  return response.data;
}

export async function uploadAsset(file: Blob, options: RequestOptions = {}): Promise<string> {
  const response = await http.post<ApiEnvelope<string>>('file/upload', createUploadFormData(file), {
    ...options,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...((options.headers as Record<string, string> | undefined) || {}),
    },
  });

  return response.data?.data || '';
}
