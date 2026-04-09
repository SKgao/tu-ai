import { type ApiEnvelope, type ApiListResult, http } from '@/app/lib/http';
import { compactPayload, createUploadFormData, type RequestOptions, type RequestPayload } from '@/app/lib/request';

export async function listBooks(payload: RequestPayload = {}): Promise<ApiListResult> {
  const response = await http.post<ApiEnvelope<ApiListResult>>('book/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function listSourceMaterials(payload: RequestPayload = {}): Promise<ApiListResult> {
  const response = await http.post<ApiEnvelope<ApiListResult>>('source/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function createSourceMaterial(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('source/add', compactPayload(payload));
  return response.data;
}

export async function updateSourceMaterial(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('source/update', compactPayload(payload));
  return response.data;
}

export async function removeSourceMaterial(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`source/delete/${id}`);
  return response.data;
}

export async function batchRemoveSourceMaterials(ids: number[]): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('source/delete/batch', ids);
  return response.data;
}

export async function batchDownloadSourceMaterialAudio(ids: number[]): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('source/audio/down/batch', ids);
  return response.data;
}

export async function batchSyncSourceMaterials(ids: number[]): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('test/send2line/source', ids);
  return response.data;
}

export async function importSubjectSources(payload: RequestPayload): Promise<string> {
  const response = await http.post<ApiEnvelope<string>>('subject/source/import', compactPayload(payload));
  return response.data?.data || '';
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
