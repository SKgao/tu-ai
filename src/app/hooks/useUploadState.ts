import { useCallback, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type UploadState = {
  uploading: boolean;
  message: string;
};

type UseUploadStateResult = {
  uploadState: UploadState;
  setUploadState: Dispatch<SetStateAction<UploadState>>;
  resetUploadState: () => void;
  setUploading: (fileName: string, message?: string) => void;
  setUploadSuccess: (message?: string) => void;
  setUploadError: (message?: string) => void;
};

const DEFAULT_UPLOAD_STATE: UploadState = {
  uploading: false,
  message: '',
};

export function useUploadState(initialState: UploadState = DEFAULT_UPLOAD_STATE): UseUploadStateResult {
  const initialStateRef = useRef(initialState);
  const [uploadState, setUploadState] = useState<UploadState>(initialStateRef.current);

  const resetUploadState = useCallback(() => {
    setUploadState(initialStateRef.current);
  }, []);

  const setUploading = useCallback((fileName: string, message?: string) => {
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
