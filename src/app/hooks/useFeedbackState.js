import { useState } from 'react';

const EMPTY_FEEDBACK = {
  type: '',
  text: '',
};

export function useFeedbackState(initialValue = EMPTY_FEEDBACK) {
  const [feedback, setFeedback] = useState(initialValue);

  function showError(text) {
    setFeedback({
      type: 'error',
      text,
    });
  }

  function showSuccess(text) {
    setFeedback({
      type: 'success',
      text,
    });
  }

  function clearFeedback() {
    setFeedback(EMPTY_FEEDBACK);
  }

  return {
    feedback,
    setFeedback,
    showError,
    showSuccess,
    clearFeedback,
  };
}
