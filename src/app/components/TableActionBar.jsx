import React from 'react';

export function TableActionBar({ children }) {
  return <div className="table-actions">{children}</div>;
}

export function TableActionButton({
  children,
  onClick,
  disabled = false,
  danger = false,
  type = 'button',
}) {
  return (
    <button
      type={type}
      className={danger ? 'text-button text-button--danger' : 'text-button'}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
