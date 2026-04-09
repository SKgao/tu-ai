import { type ApiEnvelope, http } from '@/app/lib/http';
import { compactPayload, createUploadFormData, type RequestPayload } from '@/app/lib/request';

export async function listMemberLevels(): Promise<Record<string, unknown>[]> {
  const response = await http.get<ApiEnvelope<Record<string, unknown>[]>>('member/level/list');
  return response.data?.data || [];
}

export async function listMemberLevelOptions(): Promise<Record<string, unknown>[]> {
  const response = await http.get<ApiEnvelope<Record<string, unknown>[]>>('member/level/list/combox');
  return response.data?.data || [];
}

export async function createMemberLevel(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('member/level/add', compactPayload(payload));
  return response.data;
}

export async function updateMemberLevel(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('member/level/update', compactPayload(payload));
  return response.data;
}

export async function removeMemberLevel(userLevel: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`member/level/delete/${userLevel}`);
  return response.data;
}

export async function uploadAsset(file: Blob, options: Record<string, unknown> = {}): Promise<string> {
  const response = await http.post<ApiEnvelope<string>>('file/upload', createUploadFormData(file), {
    ...options,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...((options.headers as Record<string, string> | undefined) || {}),
    },
  });

  return response.data?.data || '';
}
