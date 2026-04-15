import { type ApiEntityList, type ApiEnvelope, type ApiListResult, http } from '@/app/lib/http';
import { compactPayload, createUploadFormData, type RequestOptions, type RequestPayload } from '@/app/lib/request';

export async function listSpecialCourses(payload: RequestPayload = {}): Promise<ApiListResult> {
  const response = await http.post<ApiEnvelope<ApiListResult>>('special-course/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function listBoughtSpecialCourses(userId: string | number): Promise<ApiEntityList> {
  const response = await http.get<ApiEnvelope<ApiEntityList>>(`special-course/member/${userId}`);
  return response.data?.data || [];
}

export async function createSpecialCourse(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('special-course/add', compactPayload(payload));
  return response.data;
}

export async function updateSpecialCourse(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('special-course/update', compactPayload(payload));
  return response.data;
}

export async function removeSpecialCourse(textbookId: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`special-course/delete/${textbookId}`);
  return response.data;
}

export async function upSpecialCourse(textbookId: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`special-course/up/${textbookId}`);
  return response.data;
}

export async function downSpecialCourse(textbookId: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`special-course/down/${textbookId}`);
  return response.data;
}

export async function listSpecialCourseOptions(): Promise<ApiEntityList> {
  const response = await http.post<ApiEnvelope<ApiEntityList>>('special-course/options', {});
  return response.data?.data || [];
}

export async function listBooks(payload: RequestPayload = {}): Promise<ApiListResult> {
  const response = await http.post<ApiEnvelope<ApiListResult>>('book/list', compactPayload(payload));
  return response.data?.data || {};
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
