import { useCallback, useState } from 'react';

const EMPTY_FEEDBACK = {
  type: '',
  text: '',
};

export function useFeedbackState(initialValue = EMPTY_FEEDBACK) {
  const [feedback, setFeedback] = useState(initialValue);

  const showError = useCallback((text) => {
    setFeedback({
      type: 'error',
      text,
    });
  }, []);

  const showSuccess = useCallback((text) => {
    setFeedback({
      type: 'success',
      text,
    });
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(EMPTY_FEEDBACK);
  }, []);

  return {
    feedback,
    setFeedback,
    showError,
    showSuccess,
    clearFeedback,
  };
}
