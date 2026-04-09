import { type ApiEnvelope, http } from '@/app/lib/http';
import { compactPayload, type RequestPayload } from '@/app/lib/request';

export async function listMembers(payload: RequestPayload = {}): Promise<Record<string, unknown>> {
  const response = await http.post<ApiEnvelope<Record<string, unknown>>>('member/all/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function listMemberFeedback(payload: RequestPayload = {}): Promise<Record<string, unknown>> {
  const response = await http.post<ApiEnvelope<Record<string, unknown>>>('member/feed/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function enableMember(userId: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`member/startup/${userId}`);
  return response.data;
}

export async function disableMember(userId: number): Promise<ApiEnvelope<boolean>> {
  const response = await http.get<ApiEnvelope<boolean>>(`member/forbidden/${userId}`);
  return response.data;
}

export async function grantMemberVip(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('member/vip/add', compactPayload(payload));
  return response.data;
}
