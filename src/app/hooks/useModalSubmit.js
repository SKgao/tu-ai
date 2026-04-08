import { useCallback, useState } from 'react';

export function useModalSubmit({ showSuccess, showError }) {
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async ({
    action,
    successMessage = '',
    errorMessage = '提交失败',
    close,
    afterSuccess,
  }) => {
    setSubmitting(true);
    try {
      const result = await action();

      if (successMessage) {
        showSuccess?.(successMessage);
      }

      close?.();
      await afterSuccess?.(result);
      return result;
    } catch (error) {
      showError?.(error?.message || errorMessage);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [showError, showSuccess]);

  return {
    submitting,
    submit,
  };
}
