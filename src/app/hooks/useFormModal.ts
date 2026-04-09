import { useCallback, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export type FormModalMode = 'create' | 'edit' | (string & {});

export type UseFormModalOptions<TRecord = unknown> = {
  initialMode?: FormModalMode;
  submitting?: boolean;
  onOpenCreate?: () => void;
  onOpenEdit?: (record: TRecord) => void;
  onClose?: () => void;
};

export type UseFormModalResult<TRecord = unknown> = {
  open: boolean;
  mode: FormModalMode;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setMode: Dispatch<SetStateAction<FormModalMode>>;
  openCreate: () => void;
  openEdit: (record: TRecord) => void;
  close: () => boolean;
};

export function useFormModal<TRecord = unknown>(
  {
    initialMode = 'create',
    submitting = false,
    onOpenCreate,
    onOpenEdit,
    onClose,
  }: UseFormModalOptions<TRecord> = {},
): UseFormModalResult<TRecord> {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<FormModalMode>(initialMode);

  const openCreate = useCallback(() => {
    setMode('create');
    onOpenCreate?.();
    setOpen(true);
  }, [onOpenCreate]);

  const openEdit = useCallback(
    (record: TRecord) => {
      setMode('edit');
      onOpenEdit?.(record);
      setOpen(true);
    },
    [onOpenEdit],
  );

  const close = useCallback(() => {
    if (submitting) {
      return false;
    }

    onClose?.();
    setOpen(false);
    return true;
  }, [onClose, submitting]);

  return {
    open,
    mode,
    setOpen,
    setMode,
    openCreate,
    openEdit,
    close,
  };
}
