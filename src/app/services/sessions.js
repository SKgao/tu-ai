import { http } from '@/app/lib/http';
import { compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listCustomPasses(payload) {
  const response = await http.get(`pass/list/${payload.textbookId}`, {
    params: compactPayload(payload),
  });
  return response.data || {};
}

export async function listSessions(textbookId) {
  const response = await http.get(`/session/list/${textbookId}`);
  return response.data?.data || [];
}

export async function createSession(payload) {
  const response = await http.post('session/add', compactPayload(payload));
  return response.data;
}

export async function updateSession(payload) {
  const response = await http.post('session/update', compactPayload(payload));
  return response.data;
}

export async function removeSession(id) {
  const response = await http.get(`/session/delete/${id}`);
  return response.data;
}

export async function changeSessionStatus(payload) {
  const response = await http.post(
    `session/changeStatus?id=${payload.id}&status=${payload.status}`,
    payload,
  );
  return response.data;
}

export async function bindCustomPassToSession(payload) {
  const response = await http.post(
    `session/bind?textbookId=${payload.textbookId}&sessionId=${payload.sessionId}&customPassId=${payload.customPassId}`,
    payload,
  );
  return response.data;
}

export async function listSessionCustomPasses(payload) {
  const response = await http.post(
    `session/custom/list?textbookId=${payload.textbookId}&sessionId=${payload.sessionId}`,
    payload,
  );
  return response.data?.data || [];
}

export async function unbindSessionCustomPass(id) {
  const response = await http.get(`session/unbind/${id}`);
  return response.data;
}

export async function changeSessionCustomSort(payload) {
  const response = await http.post(`session/change/sort?id=${payload.id}&sort=${payload.sort}`, payload);
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
