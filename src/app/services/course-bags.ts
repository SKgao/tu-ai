import { type ApiEntityList, type ApiEnvelope, http } from '@/app/lib/http';
import {
  appendQuery,
  compactPayload,
  createUploadFormData,
  type RequestOptions,
  type RequestPayload,
} from '@/app/lib/request';

export async function listCourseBags(): Promise<ApiEntityList> {
  const response = await http.get<ApiEnvelope<ApiEntityList>>('bag/list');
  return response.data?.data || [];
}

export async function createCourseBag(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>(appendQuery('bag/add', payload), compactPayload(payload));
  return response.data;
}

export async function updateCourseBag(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>(appendQuery('bag/update', payload), compactPayload(payload));
  return response.data;
}

export async function changeCourseBagStatus(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>(appendQuery('bag/changeStatus', payload), compactPayload(payload));
  return response.data;
}

export async function removeCourseBag(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`bag/delete/${id}`);
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
