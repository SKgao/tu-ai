import { http } from '@/app/lib/http';
import { appendQuery, compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listCourseBags() {
  const response = await http.get('bag/list');
  return response.data?.data || [];
}

export async function createCourseBag(payload) {
  const response = await http.post(appendQuery('bag/add', payload), compactPayload(payload));
  return response.data;
}

export async function updateCourseBag(payload) {
  const response = await http.post(appendQuery('bag/update', payload), compactPayload(payload));
  return response.data;
}

export async function changeCourseBagStatus(payload) {
  const response = await http.post(
    appendQuery('bag/changeStatus', payload),
    compactPayload(payload),
  );
  return response.data;
}

export async function removeCourseBag(id) {
  const response = await http.get(`bag/delete/${id}`);
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
