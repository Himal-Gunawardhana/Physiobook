import React from 'react';

const STATUS_CONFIG = {
  draft:     { label: 'Draft',      bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
  active:    { label: 'Active',     bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
  on_hold:   { label: 'On Hold',    bg: '#fef3c7', text: '#92400e', dot: '#d97706' },
  completed: { label: 'Completed',  bg: '#ede9fe', text: '#5b21b6', dot: '#7c3aed' },
  cancelled: { label: 'Cancelled',  bg: '#fee2e2', text: '#991b1b', dot: '#dc2626' },
};

export default function EpisodeStatusBadge({ status, size = 'md' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const padding = size === 'sm' ? '0.2rem 0.5rem' : '0.3rem 0.7rem';
  const fontSize = size === 'sm' ? '0.72rem' : '0.8rem';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      background: cfg.bg, color: cfg.text,
      padding, borderRadius: 20, fontSize, fontWeight: 600,
      letterSpacing: '0.01em', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}
