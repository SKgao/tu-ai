import { http } from '@/app/lib/http';
import { compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listSubjects() {
  const response = await http.get('pass/subject');
  return response.data?.data?.data || [];
}

export async function addSingleSubject(payload) {
  const response = await http.post('subject/add/one', compactPayload(payload));
  return response.data;
}

export async function listSubjectRecords(payload = {}) {
  const response = await http.post('subject/subject/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function getSubjectRecordDetail(topicId) {
  const response = await http.get(`subject/decs/${topicId}`);
  return response.data?.data || null;
}

export async function updateSubjectRecord(payload) {
  const response = await http.post('subject/subject/update', compactPayload(payload));
  return response.data;
}

export async function removeSubjectRecord(id) {
  const response = await http.get(`subject/delete/${id}`);
  return response.data;
}

export async function batchRemoveSubjectRecords(ids) {
  const response = await http.post('subject/delete/batch', ids);
  return response.data;
}

export async function createSubjectScenePic(payload) {
  const response = await http.post(
    `subject/upload/pic?id=${payload.id}&scenePic=${payload.scenePic}`,
    payload,
  );
  return response.data;
}

export async function updateSubjectScenePic(payload) {
  const response = await http.post(
    `subject/upload/pic/update?id=${payload.id}&scenePic=${payload.scenePic}`,
    payload,
  );
  return response.data;
}

export async function removeSubjectScenePic(id) {
  const response = await http.get(`subject/del/pic/${id}`);
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
