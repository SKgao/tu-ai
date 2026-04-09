import { type ApiEntityList, type ApiEnvelope, http } from '@/app/lib/http';
import { compactPayload, createUploadFormData, type RequestOptions, type RequestPayload } from '@/app/lib/request';

export async function listCourseBagActivities(id: string | number): Promise<ApiEntityList> {
  const response = await http.get<ApiEnvelope<ApiEntityList>>(`course/active/list/${id}`);
  return response.data?.data || [];
}

export async function listCourseOptions(): Promise<ApiEntityList> {
  const response = await http.post<ApiEnvelope<ApiEntityList>>('course/list/down', {});
  return response.data?.data || [];
}

export async function createCourseBagActivity(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('course/active/add', compactPayload(payload));
  return response.data;
}

export async function updateCourseBagActivity(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('course/active/update', compactPayload(payload));
  return response.data;
}

export async function removeCourseBagActivity(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`course/active/del/${id}`);
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
