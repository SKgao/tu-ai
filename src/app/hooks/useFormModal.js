import { useCallback, useState } from 'react';

export function useFormModal({
  initialMode = 'create',
  submitting = false,
  onOpenCreate,
  onOpenEdit,
  onClose,
} = {}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(initialMode);

  const openCreate = useCallback(() => {
    setMode('create');
    onOpenCreate?.();
    setOpen(true);
  }, [onOpenCreate]);

  const openEdit = useCallback(
    (record) => {
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
