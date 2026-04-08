import { http } from '@/app/lib/http';
import { compactPayload, createUploadFormData } from '@/app/lib/request';

export async function listBooks(payload = {}) {
  const response = await http.post('book/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function listSourceMaterials(payload = {}) {
  const response = await http.post('source/list', compactPayload(payload));
  return response.data?.data || {};
}

export async function createSourceMaterial(payload) {
  const response = await http.post('source/add', compactPayload(payload));
  return response.data;
}

export async function updateSourceMaterial(payload) {
  const response = await http.post('source/update', compactPayload(payload));
  return response.data;
}

export async function removeSourceMaterial(id) {
  const response = await http.get(`source/delete/${id}`);
  return response.data;
}

export async function batchRemoveSourceMaterials(ids) {
  const response = await http.post('source/delete/batch', ids);
  return response.data;
}

export async function batchDownloadSourceMaterialAudio(ids) {
  const response = await http.post('source/audio/down/batch', ids);
  return response.data;
}

export async function batchSyncSourceMaterials(ids) {
  const response = await http.post('test/send2line/source', ids);
  return response.data;
}

export async function importSubjectSources(payload) {
  const response = await http.post('subject/source/import', compactPayload(payload));
  return response.data?.data || '';
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
