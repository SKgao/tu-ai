import { useCallback, useState } from 'react';

export function useConfirmAction({ showSuccess, showError }) {
  const [submitting, setSubmitting] = useState(false);

  const runAction = useCallback(async ({
    action,
    confirmText = '',
    successMessage = '',
    errorMessage = '操作失败',
    afterSuccess,
  }) => {
    if (confirmText && !window.confirm(confirmText)) {
      return false;
    }

    setSubmitting(true);
    try {
      const result = await action();

      if (successMessage) {
        showSuccess?.(successMessage);
      }

      await afterSuccess?.(result);
      return true;
    } catch (error) {
      showError?.(error?.message || errorMessage);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [showError, showSuccess]);

  return {
    submitting,
    runAction,
  };
}
