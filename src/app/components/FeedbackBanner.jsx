import React from 'react';

export function FeedbackBanner({ feedback }) {
  if (!feedback?.text) {
    return null;
  }

  return (
    <section
      className={feedback.type === 'error' ? 'feedback-banner feedback-banner--error' : 'feedback-banner'}
    >
      {feedback.text}
    </section>
  );
}
