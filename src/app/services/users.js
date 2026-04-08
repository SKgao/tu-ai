import { http } from '@/app/lib/http';
import { compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listUsers(payload) {
  const response = await http.post('user/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function listRoles(payload = {}) {
  const response = await http.post('role/list', compactPayload(payload));
  return response.data?.data || [];
}

export async function createUser(payload) {
  const response = await http.post('user/add', compactPayload(payload));
  return response.data;
}

export async function updateUser(payload) {
  const response = await http.post('user/update', compactPayload(payload));
  return response.data;
}

export async function deleteUser(id) {
  const response = await http.post('user/delete', id);
  return response.data;
}

export async function forbidUser(id) {
  const response = await http.post('user/forbidden', id);
  return response.data;
}

export async function enableUser(id) {
  const response = await http.post('user/using', id);
  return response.data;
}

export async function uploadFile(file, options = {}) {
  const response = await http.post('file/upload', createUploadFormData(file), {
    ...options,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(options.headers || {}),
    },
  });

  return response.data?.data || '';
}
