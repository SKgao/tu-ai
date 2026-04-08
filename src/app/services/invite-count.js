import { http } from '@/app/lib/http';

export async function listInviteRecords(userId) {
  const response = await http.post('member/invite/list', userId);
  return response.data || {};
}
