import { type ApiEntityList, type ApiEnvelope, type ApiListResult, http } from '@/app/lib/http';
import { compactPayload, createUploadFormData, type RequestOptions, type RequestPayload } from '@/app/lib/request';

export async function listActivities(payload: RequestPayload = {}): Promise<ApiListResult> {
  const response = await http.post<ApiEnvelope<ApiListResult>>('activity/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function listActivityOptions(): Promise<ApiEntityList> {
  const response = await http.get<ApiEnvelope<ApiEntityList>>('activity/list/combox');
  return response.data?.data || [];
}

export async function createActivity(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('activity/add', compactPayload(payload));
  return response.data;
}

export async function updateActivity(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('activity/update', compactPayload(payload));
  return response.data;
}

export async function removeActivity(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`activity/delete/${id}`);
  return response.data;
}

export async function changeActivityStatus(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('activity/change/status', compactPayload(payload));
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
