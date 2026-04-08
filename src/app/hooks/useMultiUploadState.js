import { useCallback, useMemo, useState } from 'react';

function createInitialState(keys) {
  return keys.reduce((accumulator, key) => {
    accumulator[key] = {
      uploading: false,
      message: '',
    };
    return accumulator;
  }, {});
}

export function useMultiUploadState(keys) {
  const normalizedKeys = useMemo(() => [...keys], [keys]);
  const initialState = useMemo(() => createInitialState(normalizedKeys), [normalizedKeys]);
  const [uploadState, setUploadState] = useState(initialState);

  const resetUploadState = useCallback(() => {
    setUploadState(initialState);
  }, [initialState]);

  const setUploading = useCallback((key, fileName, message) => {
    setUploadState((current) => ({
      ...current,
      [key]: {
        uploading: true,
        message: message || `${fileName} 上传中...`,
      },
    }));
  }, []);

  const setUploadSuccess = useCallback((key, message = '上传成功') => {
    setUploadState((current) => ({
      ...current,
      [key]: {
        uploading: false,
        message,
      },
    }));
  }, []);

  const setUploadError = useCallback((key, message = '上传失败') => {
    setUploadState((current) => ({
      ...current,
      [key]: {
        uploading: false,
        message,
      },
    }));
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
