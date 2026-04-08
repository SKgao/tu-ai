import { useCallback, useRef, useState } from 'react';

const DEFAULT_UPLOAD_STATE = {
  uploading: false,
  message: '',
};

export function useUploadState(initialState = DEFAULT_UPLOAD_STATE) {
  const initialStateRef = useRef(initialState);
  const [uploadState, setUploadState] = useState(initialStateRef.current);

  const resetUploadState = useCallback(() => {
    setUploadState(initialStateRef.current);
  }, []);

  const setUploading = useCallback((fileName, message) => {
    setUploadState({
      uploading: true,
      message: message || `${fileName} 上传中...`,
    });
  }, []);

  const setUploadSuccess = useCallback((message = '上传成功') => {
    setUploadState({
      uploading: false,
      message,
    });
  }, []);

  const setUploadError = useCallback((message = '上传失败') => {
    setUploadState({
      uploading: false,
      message,
    });
  }, []);

  return {
    uploadState,
    setUploadState,
    resetUploadState,
    setUploading,
    setUploadSuccess,
    setUploadError,
  };
}
