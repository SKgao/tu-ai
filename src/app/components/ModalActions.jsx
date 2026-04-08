import React from 'react';

export function ModalActions({
  onCancel,
  submitting = false,
  submitText = '提交',
  submittingText = '提交中...',
  cancelText = '取消',
  submitDisabled = false,
}) {
  return (
    <div className="modal-actions">
      <button type="button" className="app-button app-button--ghost" onClick={onCancel}>
        {cancelText}
      </button>
      <button
        type="submit"
        className="app-button app-button--primary"
        disabled={submitting || submitDisabled}
      >
        {submitting ? submittingText : submitText}
      </button>
    </div>
  );
}
