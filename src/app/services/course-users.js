import { http } from '@/app/lib/http';
import { compactPayload } from '@/app/lib/request';

export async function listCourseUsers(payload = {}) {
  const response = await http.post('course/user/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function createCourseUser(payload) {
  const response = await http.post('member/add', compactPayload(payload));
  return response.data;
}
