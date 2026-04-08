import { useState } from 'react';

const INITIAL_UPLOAD_STATE = {
  uploading: false,
  progress: 0,
  message: '',
  status: 'idle',
};

function buildUploadMessage(fileName, progress) {
  if (!progress) {
    return `${fileName} 上传中...`;
  }

  return `${fileName} 上传中 (${progress}%)`;
}

export function useFileUpload({ uploadRequest }) {
  const [uploadState, setUploadState] = useState(INITIAL_UPLOAD_STATE);

  function resetUploadState(message = '') {
    setUploadState({
      ...INITIAL_UPLOAD_STATE,
      message,
    });
  }

  async function upload(file, options = {}) {
    const {
      onSuccess,
      successMessage,
      errorMessage,
      uploadingMessage,
    } = options;

    setUploadState({
      uploading: true,
      progress: 0,
      message: uploadingMessage || `${file.name} 上传中...`,
      status: 'uploading',
    });

    try {
      const result = await uploadRequest(file, {
        onUploadProgress: (event) => {
          if (!event?.total) {
            return;
          }

          const progress = Math.min(99, Math.round((event.loaded / event.total) * 100));
          setUploadState({
            uploading: true,
            progress,
            message: buildUploadMessage(file.name, progress),
            status: 'uploading',
          });
        },
      });

      if (onSuccess) {
        await onSuccess(result, file);
      }

      setUploadState({
        uploading: false,
        progress: 100,
        message: successMessage || `${file.name} 上传成功`,
        status: 'success',
      });

      return result;
    } catch (error) {
      setUploadState({
        uploading: false,
        progress: 0,
        message: error?.message || errorMessage || '上传失败',
        status: 'error',
      });
      throw error;
    }
  }

  return {
    uploadState,
    upload,
    resetUploadState,
  };
}
