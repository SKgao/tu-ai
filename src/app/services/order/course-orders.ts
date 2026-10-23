import { type ApiEnvelope, type ApiListResult, http } from '@/app/lib/http';
import { compactPayload, type RequestPayload } from '@/app/lib/request';

export async function listCourseOrders(payload: RequestPayload = {}): Promise<ApiListResult> {
  const response = await http.post<ApiEnvelope<ApiListResult>>('course/order/list', compactPayload(payload));
  return response.data?.data || {};
}
