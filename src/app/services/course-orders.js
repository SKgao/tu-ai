import { http } from '@/app/lib/http';
import { compactPayload } from '@/app/lib/request';

export async function listCourseOrders(payload = {}) {
  const response = await http.post('course/order/list', compactPayload(payload));
  return response.data?.data || {};
}
