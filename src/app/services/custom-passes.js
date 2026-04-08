import { http } from '@/app/lib/http';
import { compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listSubjects() {
  const response = await http.get('pass/subject');
  return response.data?.data?.data || [];
}

export async function listCustomPasses(payload) {
  const response = await http.get(`pass/list/${payload.textbookId}`, {
    params: compactPayload(payload),
  });
  return response.data || {};
}

export async function createCustomPass(payload) {
  const response = await http.post('pass/add', compactPayload(payload));
  return response.data;
}

export async function updateCustomPass(payload) {
  const response = await http.post('pass/update', compactPayload(payload));
  return response.data;
}

export async function removeCustomPass(payload) {
  const response = await http.get('pass/delete', {
    params: compactPayload(payload),
  });
  return response.data;
}

export async function addSingleSubject(payload) {
  const response = await http.post('subject/add/one', compactPayload(payload));
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
