import { useCallback, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { UploadState } from '@/app/hooks/useUploadState';

type MultiUploadState<TKey extends string> = Record<TKey, UploadState>;

type UseMultiUploadStateResult<TKey extends string> = {
  uploadState: MultiUploadState<TKey>;
  setUploadState: Dispatch<SetStateAction<MultiUploadState<TKey>>>;
  resetUploadState: () => void;
  setUploading: (key: TKey, fileName: string, message?: string) => void;
  setUploadSuccess: (key: TKey, message?: string) => void;
  setUploadError: (key: TKey, message?: string) => void;
};

function createInitialState<TKey extends string>(keys: readonly TKey[]): MultiUploadState<TKey> {
  return keys.reduce(
    (accumulator, key) => {
      accumulator[key] = {
        uploading: false,
        message: '',
      };
      return accumulator;
    },
    {} as MultiUploadState<TKey>,
  );
}

export function useMultiUploadState<TKey extends string>(
  keys: readonly TKey[],
): UseMultiUploadStateResult<TKey> {
  const normalizedKeys = useMemo(() => [...keys], [keys]);
  const initialState = useMemo(
    () => createInitialState(normalizedKeys),
    [normalizedKeys],
  );
  const [uploadState, setUploadState] = useState<MultiUploadState<TKey>>(initialState);

  const resetUploadState = useCallback(() => {
    setUploadState(initialState);
  }, [initialState]);

  const setUploading = useCallback((key: TKey, fileName: string, message?: string) => {
    setUploadState((current) => ({
      ...current,
      [key]: {
        uploading: true,
        message: message || `${fileName} 上传中...`,
      },
    }));
  }, []);

  const setUploadSuccess = useCallback((key: TKey, message = '上传成功') => {
    setUploadState((current) => ({
      ...current,
      [key]: {
        uploading: false,
        message,
      },
    }));
  }, []);

  const setUploadError = useCallback((key: TKey, message = '上传失败') => {
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
