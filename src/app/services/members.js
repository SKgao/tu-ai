import { http } from '@/app/lib/http';
import { compactPayload } from '@/app/lib/request';

export async function listMembers(payload = {}) {
  const response = await http.post('member/all/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function listMemberFeedback(payload = {}) {
  const response = await http.post('member/feed/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function enableMember(userId) {
  const response = await http.get(`member/startup/${userId}`);
  return response.data;
}

export async function disableMember(userId) {
  const response = await http.get(`member/forbidden/${userId}`);
  return response.data;
}

export async function grantMemberVip(payload) {
  const response = await http.post('member/vip/add', compactPayload(payload));
  return response.data;
}
