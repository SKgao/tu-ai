import { http } from '@/app/lib/http';
import { compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listCourseBagActivities(id) {
  const response = await http.get(`course/active/list/${id}`);
  return response.data?.data || [];
}

export async function listCourseOptions() {
  const response = await http.post('course/list/down', {});
  return response.data?.data || [];
}

export async function createCourseBagActivity(payload) {
  const response = await http.post('course/active/add', compactPayload(payload));
  return response.data;
}

export async function updateCourseBagActivity(payload) {
  const response = await http.post('course/active/update', compactPayload(payload));
  return response.data;
}

export async function removeCourseBagActivity(id) {
  const response = await http.get(`course/active/del/${id}`);
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
