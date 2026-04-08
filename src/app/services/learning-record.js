import { http } from '@/app/lib/http';
import { compactPayload } from '@/app/lib/request';

export async function listLearningRecords(payload = {}) {
  const response = await http.post('member/pass/record', compactPayload(payload));
  return response.data?.data || {};
}
