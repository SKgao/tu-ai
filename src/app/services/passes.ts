import { type ApiEntityList, type ApiEnvelope, type ApiListResult, http } from '@/app/lib/http';
import { compactPayload, createUploadFormData, type RequestOptions, type RequestPayload } from '@/app/lib/request';

export async function createPass(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('pass/add', compactPayload(payload));
  return response.data;
}

export async function listPasses(payload: RequestPayload = {}): Promise<ApiListResult> {
  const response = await http.get<ApiEnvelope<ApiListResult>>(`pass/list/${payload.partsId ?? ''}`, {
    params: compactPayload(payload),
  });
  return response.data?.data || {};
}

export async function updatePass(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('pass/update', compactPayload(payload));
  return response.data;
}

export async function removePass(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`pass/delete/${id}`);
  return response.data;
}

export async function listSubjects(): Promise<ApiEntityList> {
  const response = await http.get<ApiEnvelope<{ data?: ApiEntityList }>>('pass/subject');
  return response.data?.data?.data || [];
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
