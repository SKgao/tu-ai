import { http } from '@/app/lib/http';
import { compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listParts(payload) {
  const response = await http.post('part/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function createPart(payload) {
  const response = await http.post('part/add', compactPayload(payload));
  return response.data;
}

export async function updatePart(payload) {
  const response = await http.post('part/update', compactPayload(payload));
  return response.data;
}

export async function removePart(id) {
  const response = await http.get(`part/del/${id}`);
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
