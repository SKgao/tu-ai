import { http } from '@/app/lib/http';
import { compactPayload } from '@/app/lib/request';

export async function listOrders(payload = {}) {
  const response = await http.post('order/list', compactPayload(payload));
  return response.data?.data || {};
}
