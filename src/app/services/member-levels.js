import { http } from '@/app/lib/http';
import { compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listMemberLevels() {
  const response = await http.get('member/level/list');
  return response.data?.data || [];
}

export async function listMemberLevelOptions() {
  const response = await http.get('member/level/list/combox');
  return response.data?.data || [];
}

export async function createMemberLevel(payload) {
  const response = await http.post('member/level/add', compactPayload(payload));
  return response.data;
}

export async function updateMemberLevel(payload) {
  const response = await http.post('member/level/update', compactPayload(payload));
  return response.data;
}

export async function removeMemberLevel(userLevel) {
  const response = await http.get(`member/level/delete/${userLevel}`);
  return response.data;
}

export async function uploadAsset(file, options = {}) {
  const response = await http.post('file/upload', createUploadFormData(file), {
    ...options,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(options.headers || {}),
    },
  });

  return response.data?.data || '';
}
