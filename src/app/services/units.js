import { http } from '@/app/lib/http';
import { compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listBooks(payload = {}) {
  const response = await http.post('book/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function listUnits(payload) {
  const response = await http.post('unit/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function createUnit(payload) {
  const response = await http.post('unit/add', compactPayload(payload));
  return response.data;
}

export async function updateUnit(payload) {
  const response = await http.post('unit/update', compactPayload(payload));
  return response.data;
}

export async function removeUnit(id) {
  const response = await http.get(`unit/del/${id}`);
  return response.data;
}

export async function lockUnit(payload) {
  const response = await http.post(
    `unit/lock?unitId=${payload.unitId}&canLock=${payload.canLock}`,
    payload,
  );
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
