import { useState } from 'react';

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

  function updateForm(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openCreate() {
    const nextForm = resolveState(createState);
    setMode('create');
    setForm(nextForm);
    setIsOpen(true);
    onOpenCreate?.(nextForm);
  }

  function openEdit(payload) {
    const nextForm = resolveState(editState, payload);
    setMode('edit');
    setForm(nextForm);
    setIsOpen(true);
    onOpenEdit?.(payload, nextForm);
  }

  function close() {
    setIsOpen(false);
    onClose?.();
  }

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
