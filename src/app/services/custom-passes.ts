import { type ApiEntityList, type ApiEnvelope, type ApiListResult, http } from '@/app/lib/http';
import { compactPayload, createUploadFormData, type RequestOptions, type RequestPayload } from '@/app/lib/request';

export async function listSubjects(): Promise<ApiEntityList> {
  const response = await http.get<ApiEnvelope<{ data?: ApiEntityList }>>('pass/subject');
  return response.data?.data?.data || [];
}

export async function listCustomPasses(payload: RequestPayload & { textbookId: string | number }): Promise<ApiEnvelope<ApiListResult>> {
  const response = await http.get<ApiEnvelope<ApiListResult>>(`pass/list/${payload.textbookId}`, {
    params: compactPayload(payload),
  });
  return response.data || {};
}

export async function createCustomPass(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('pass/add', compactPayload(payload));
  return response.data;
}

export async function updateCustomPass(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('pass/update', compactPayload(payload));
  return response.data;
}

export async function removeCustomPass(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>('pass/delete', {
    params: compactPayload(payload),
  });
  return response.data;
}

export async function addSingleSubject(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('subject/add/one', compactPayload(payload));
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
