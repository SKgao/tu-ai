import { http } from '@/app/lib/http';
import { compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listSpecialCourses(payload = {}) {
  const response = await http.post('course/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function listBoughtSpecialCourses(userId) {
  const response = await http.get(`course/course/list/${userId}`);
  return response.data?.data || [];
}

export async function createSpecialCourse(payload) {
  const response = await http.post('course/add', compactPayload(payload));
  return response.data;
}

export async function updateSpecialCourse(payload) {
  const response = await http.post('course/update', compactPayload(payload));
  return response.data;
}

export async function removeSpecialCourse(textbookId) {
  const response = await http.get(`course/delete/${textbookId}`);
  return response.data;
}

export async function upSpecialCourse(textbookId) {
  const response = await http.get(`course/up/${textbookId}`);
  return response.data;
}

export async function downSpecialCourse(textbookId) {
  const response = await http.get(`course/down/${textbookId}`);
  return response.data;
}

export async function listBooks(payload = {}) {
  const response = await http.post('book/list', compactPayload(payload));
  return response.data?.data || {};
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
