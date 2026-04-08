import { http } from '@/app/lib/http';
import { appendQuery, compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listCourseBags() {
  const response = await http.get('bag/list');
  return response.data?.data || [];
}

export async function createCourseBagCourse(payload) {
  const response = await http.post(appendQuery('course/add', payload), compactPayload(payload));
  return response.data;
}

export async function updateCourseBagCourse(payload) {
  const response = await http.post(appendQuery('course/update', payload), compactPayload(payload));
  return response.data;
}

export async function changeCourseBagCourseStatus(payload) {
  const response = await http.get(appendQuery('course/changeStatus', payload));
  return response.data;
}

export async function removeCourseBagCourse(id) {
  const response = await http.get(`course/delete/${id}`);
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
