import { type ApiEntityList, type ApiEnvelope, type ApiListResult, http } from '@/app/lib/http';
import {
  compactPayload,
  createUploadFormData,
  type RequestOptions,
  type RequestPayload,
} from '@/app/lib/request';

export async function listGrades(payload: RequestPayload = {}): Promise<ApiEntityList> {
  const response = await http.post<ApiEnvelope<ApiEntityList>>('grade/list', compactPayload(payload));
  return response.data?.data || [];
}

export async function createGrade(name: string): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('grade/add', name);
  return response.data;
}

export async function updateGrade(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('grade/update', compactPayload(payload));
  return response.data;
}

export async function removeGrade(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`grade/version/delete/${id}`);
  return response.data;
}

export async function listVersions(): Promise<ApiEntityList> {
  const response = await http.get<ApiEnvelope<ApiEntityList>>('book/version/list');
  return response.data?.data || [];
}

export async function createVersion(name: string): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('book/version/add', name);
  return response.data;
}

export async function updateVersion(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('book/version/update', compactPayload(payload));
  return response.data;
}

export async function removeVersion(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`book/version/delete/${id}`);
  return response.data;
}

export async function listBooks(payload: RequestPayload = {}): Promise<ApiListResult> {
  const response = await http.post<ApiEnvelope<ApiListResult>>('book/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function createBook(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('book/add', compactPayload(payload));
  return response.data;
}

export async function updateBook(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('book/update', compactPayload(payload));
  return response.data;
}

export async function removeBook(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('book/delete', id);
  return response.data;
}

export async function lockBook(payload: { textbookId: number; canLock: number }): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>(
    `book/lock?textbookId=${payload.textbookId}&canLock=${payload.canLock}`,
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
