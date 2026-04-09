import { type ApiEnvelope, http } from '@/app/lib/http';
import { compactPayload, createUploadFormData, type RequestPayload } from '@/app/lib/request';

type UserPayload = RequestPayload;

type UserIdPayload = {
  id: number;
};

export async function listUsers(payload: UserPayload = {}): Promise<Record<string, unknown>> {
  const response = await http.post<ApiEnvelope<Record<string, unknown>>>('user/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function listRoles(payload: UserPayload = {}): Promise<Record<string, unknown>[]> {
  const response = await http.post<ApiEnvelope<Record<string, unknown>[]>>('role/list', compactPayload(payload));
  return response.data?.data || [];
}

export async function createUser(payload: UserPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('user/add', compactPayload(payload));
  return response.data;
}

export async function updateUser(payload: UserPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('user/update', compactPayload(payload));
  return response.data;
}

export async function deleteUser(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('user/delete', { id } satisfies UserIdPayload);
  return response.data;
}

export async function forbidUser(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('user/forbidden', { id } satisfies UserIdPayload);
  return response.data;
}

export async function enableUser(id: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('user/using', { id } satisfies UserIdPayload);
  return response.data;
}

export async function uploadFile(file: Blob, options: Record<string, unknown> = {}): Promise<string> {
  const response = await http.post<ApiEnvelope<string>>('file/upload', createUploadFormData(file), {
    ...options,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...((options.headers as Record<string, string> | undefined) || {}),
    },
  });

  return response.data?.data || '';
}
