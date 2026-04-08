import { http } from '@/app/lib/http';
import { compactPayload } from '@/app/lib/request';

export async function listMemberInfos(payload = {}) {
  const response = await http.post('member/list', compactPayload(payload));
  return response.data?.data || {};
}
