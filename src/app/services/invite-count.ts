import { type ApiEnvelope, type ApiListResult, http } from '@/app/lib/http';

export async function listInviteRecords(userId: number): Promise<ApiEnvelope<ApiListResult>> {
  const response = await http.post<ApiEnvelope<ApiListResult>>('member/invite/list', userId);
  return response.data || {};
}
