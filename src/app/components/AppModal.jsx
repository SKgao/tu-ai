import React, { useEffect } from 'react';

function getModalCardClassName(size) {
  if (size === 'lg') {
    return 'modal-card modal-card--lg';
  }

  return 'modal-card';
}

export function AppModal({
  title,
  description,
  size = 'default',
  onClose,
  children,
  closeOnBackdrop = true,
  closeOnEscape = true,
  closeDisabled = false,
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!closeOnEscape || closeDisabled) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeDisabled, closeOnEscape, onClose]);

  function requestClose() {
    if (closeDisabled) {
      return;
    }

    onClose?.();
  }

  function handleBackdropClick() {
    if (!closeOnBackdrop) {
      return;
    }

    requestClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        className={getModalCardClassName(size)}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-card__header">
          <div>
            <h3>{title}</h3>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="icon-button" onClick={requestClose} disabled={closeDisabled}>
            关闭
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
