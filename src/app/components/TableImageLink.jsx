import React from 'react';

export function TableImageLink({ src, alt }) {
  if (!src) {
    return <span className="table-muted">无</span>;
  }

  return (
    <a href={src} target="_blank" rel="noreferrer" className="avatar-link">
      <img src={src} alt={alt} className="avatar-thumb" />
    </a>
  );
}
