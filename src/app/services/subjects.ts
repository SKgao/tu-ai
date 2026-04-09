import { type ApiEntity, type ApiEntityList, type ApiEnvelope, type ApiListResult, http } from '@/app/lib/http';
import { compactPayload, createUploadFormData, type RequestOptions, type RequestPayload } from '@/app/lib/request';

export async function listSubjects(): Promise<ApiEntityList> {
  const response = await http.get<ApiEnvelope<{ data?: ApiEntityList }>>('pass/subject');
  return response.data?.data?.data || [];
}

export async function addSingleSubject(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('subject/add/one', compactPayload(payload));
  return response.data;
}

export async function listSubjectRecords(payload: RequestPayload = {}): Promise<ApiListResult> {
  const response = await http.post<ApiEnvelope<ApiListResult>>('subject/subject/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function getSubjectRecordDetail(topicId: string | number): Promise<ApiEntity | null> {
  const response = await http.get<ApiEnvelope<ApiEntity>>(`subject/decs/${topicId}`);
  return response.data?.data || null;
}

export async function updateSubjectRecord(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('subject/subject/update', compactPayload(payload));
  return response.data;
}

export async function removeSubjectRecord(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`subject/delete/${id}`);
  return response.data;
}

export async function batchRemoveSubjectRecords(ids: number[]): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('subject/delete/batch', ids);
  return response.data;
}

export async function createSubjectScenePic(payload: { id: number; scenePic: string }): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>(
    `subject/upload/pic?id=${payload.id}&scenePic=${payload.scenePic}`,
    payload,
  );
  return response.data;
}

export async function updateSubjectScenePic(payload: { id: number; scenePic: string }): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>(
    `subject/upload/pic/update?id=${payload.id}&scenePic=${payload.scenePic}`,
    payload,
  );
  return response.data;
}

export async function removeSubjectScenePic(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`subject/del/pic/${id}`);
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
