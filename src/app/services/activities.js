import { http } from '@/app/lib/http';
import { compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listActivities(payload = {}) {
  const response = await http.post('activity/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function listActivityOptions() {
  const response = await http.get('activity/list/combox');
  return response.data?.data || [];
}

export async function createActivity(payload) {
  const response = await http.post('activity/add', compactPayload(payload));
  return response.data;
}

export async function updateActivity(payload) {
  const response = await http.post('activity/update', compactPayload(payload));
  return response.data;
}

export async function removeActivity(id) {
  const response = await http.get(`activity/delete/${id}`);
  return response.data;
}

export async function changeActivityStatus(payload) {
  const response = await http.post('activity/change/status', compactPayload(payload));
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
