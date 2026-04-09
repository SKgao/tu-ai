import { type ApiEnvelope, http } from '@/app/lib/http';
import { compactPayload, type RequestPayload } from '@/app/lib/request';

export async function listMemberInfos(payload: RequestPayload = {}): Promise<Record<string, unknown>> {
  const response = await http.post<ApiEnvelope<Record<string, unknown>>>('member/list', compactPayload(payload));
  return response.data?.data || {};
}
