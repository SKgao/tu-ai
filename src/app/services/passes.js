import { http } from '@/app/lib/http';
import { compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listPasses(payload) {
  const response = await http.get(`pass/list/${payload.partsId}`, {
    params: compactPayload(payload),
  });
  return response.data || {};
}

export async function listSubjects() {
  const response = await http.get('pass/subject');
  return response.data?.data?.data || [];
}

export async function createPass(payload) {
  const response = await http.post('pass/add', compactPayload(payload));
  return response.data;
}

export async function updatePass(payload) {
  const response = await http.post('pass/update', compactPayload(payload));
  return response.data;
}

export async function removePass(id) {
  const response = await http.get(`pass/delete/${id}`);
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
