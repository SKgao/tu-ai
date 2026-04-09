import { type ApiEnvelope, type ApiListResult, http } from '@/app/lib/http';
import { compactPayload, createUploadFormData, type RequestOptions, type RequestPayload } from '@/app/lib/request';

export async function listBooks(payload: RequestPayload = {}): Promise<ApiListResult> {
  const response = await http.post<ApiEnvelope<ApiListResult>>('book/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function listUnits(payload: RequestPayload = {}): Promise<ApiListResult> {
  const response = await http.post<ApiEnvelope<ApiListResult>>('unit/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function createUnit(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('unit/add', compactPayload(payload));
  return response.data;
}

export async function updateUnit(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('unit/update', compactPayload(payload));
  return response.data;
}

export async function removeUnit(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`unit/del/${id}`);
  return response.data;
}

export async function lockUnit(payload: { unitId: number; canLock: number }): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>(
    `unit/lock?unitId=${payload.unitId}&canLock=${payload.canLock}`,
    payload,
  );
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
