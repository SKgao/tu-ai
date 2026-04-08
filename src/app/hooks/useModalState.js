import { useCallback, useState } from 'react';

function resolveState(factory, payload) {
  return typeof factory === 'function' ? factory(payload) : factory;
}

export function useModalState({
  initialMode = 'create',
  createState,
  editState,
  onOpenCreate,
  onOpenEdit,
  onClose,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(() => resolveState(createState));

  const updateForm = useCallback((key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const openCreate = useCallback(() => {
    const nextForm = resolveState(createState);
    setMode('create');
    setForm(nextForm);
    setIsOpen(true);
    onOpenCreate?.(nextForm);
  }, [createState, onOpenCreate]);

  const openEdit = useCallback((payload) => {
    const nextForm = resolveState(editState, payload);
    setMode('edit');
    setForm(nextForm);
    setIsOpen(true);
    onOpenEdit?.(payload, nextForm);
  }, [editState, onOpenEdit]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  return {
    isOpen,
    mode,
    form,
    setForm,
    setIsOpen,
    setMode,
    updateForm,
    openCreate,
    openEdit,
    close,
  };
}
