import React from 'react';

export function PageHero({ title, copy, badge = 'Legacy Rewrite' }) {
  return (
    <section className="page-stack__hero">
      <div>
        <span className="app-badge">{badge}</span>
        <h2 className="page-title">{title}</h2>
        <p className="page-copy">{copy}</p>
      </div>
    </section>
  );
}
