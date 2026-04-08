import { http } from '@/app/lib/http';
import { compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listGrades(payload = {}) {
  const response = await http.post('grade/list', compactPayload(payload));
  return response.data?.data || [];
}

export async function createGrade(name) {
  const response = await http.post('grade/add', name);
  return response.data;
}

export async function updateGrade(payload) {
  const response = await http.post('grade/update', compactPayload(payload));
  return response.data;
}

export async function removeGrade(id) {
  const response = await http.get(`grade/version/delete/${id}`);
  return response.data;
}

export async function listVersions() {
  const response = await http.get('book/version/list');
  return response.data?.data || [];
}

export async function createVersion(name) {
  const response = await http.post('book/version/add', name);
  return response.data;
}

export async function updateVersion(payload) {
  const response = await http.post('book/version/update', compactPayload(payload));
  return response.data;
}

export async function removeVersion(id) {
  const response = await http.get(`book/version/delete/${id}`);
  return response.data;
}

export async function listBooks(payload = {}) {
  const response = await http.post('book/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function createBook(payload) {
  const response = await http.post('book/add', compactPayload(payload));
  return response.data;
}

export async function updateBook(payload) {
  const response = await http.post('book/update', compactPayload(payload));
  return response.data;
}

export async function removeBook(id) {
  const response = await http.post('book/delete', id);
  return response.data;
}

export async function lockBook(payload) {
  const response = await http.post(
    `book/lock?textbookId=${payload.textbookId}&canLock=${payload.canLock}`,
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
