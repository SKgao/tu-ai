import { type ApiEnvelope, type ApiListResult, http } from '@/app/lib/http';
import { compactPayload, type RequestPayload } from '@/app/lib/request';

export async function listCourseUsers(payload: RequestPayload = {}): Promise<ApiListResult> {
  const response = await http.post<ApiEnvelope<ApiListResult>>('course/user/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function createCourseUser(payload: RequestPayload): Promise<ApiEnvelope<boolean>> {
  const response = await http.post<ApiEnvelope<boolean>>('member/add', compactPayload(payload));
  return response.data;
}
