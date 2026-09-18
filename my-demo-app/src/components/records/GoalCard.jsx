import React from 'react';
import { CheckCircle, TrendingUp, Clock, XCircle } from 'lucide-react';

const GOAL_CONFIG = {
  not_started:  { label: 'Not Started', color: '#94a3b8', Icon: Clock,        barColor: '#e2e8f0' },
  in_progress:  { label: 'In Progress', color: '#2563eb', Icon: TrendingUp,   barColor: '#2563eb' },
  achieved:     { label: 'Achieved',    color: '#16a34a', Icon: CheckCircle,   barColor: '#16a34a' },
  not_achieved: { label: 'Not Achieved',color: '#dc2626', Icon: XCircle,       barColor: '#dc2626' },
};

function calcProgress(baseline, current, target) {
  const b = parseFloat(baseline);
  const c = parseFloat(current);
  const t = parseFloat(target);
  if (isNaN(b) || isNaN(c) || isNaN(t) || t === b) return 0;
  const pct = ((c - b) / (t - b)) * 100;
  return Math.max(0, Math.min(100, pct));
}

export default function GoalCard({ goal, compact = false }) {
  const cfg = GOAL_CONFIG[goal.status] || GOAL_CONFIG.not_started;
  const { Icon } = cfg;
  const progress = calcProgress(goal.baseline_value, goal.current_value, goal.target_value);
  const hasMetric = goal.metric_name && (goal.baseline_value || goal.target_value);

  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: compact ? '0.875rem 1rem' : '1.25rem',
      border: '1px solid #e2e8f0', transition: 'box-shadow 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: hasMetric ? '0.75rem' : 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {goal.goal_type === 'long_term' ? 'Long-term' : 'Short-term'}
            </span>
          </div>
          <p style={{ margin: 0, fontWeight: 600, color: '#0f172a', fontSize: compact ? '0.88rem' : '0.95rem', lineHeight: 1.4 }}>
            {goal.description}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: `${cfg.color}15`, color: cfg.color, padding: '0.3rem 0.65rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          <Icon size={12} />
          {cfg.label}
        </div>
      </div>

      {hasMetric && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.4rem' }}>
            <span>{goal.metric_name}</span>
            {goal.current_value && (
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                Current: <strong>{goal.current_value}</strong>
                {goal.target_value && <span style={{ color: '#94a3b8' }}> / {goal.target_value}</span>}
              </span>
            )}
          </div>
          <div style={{ height: 7, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${cfg.barColor}88, ${cfg.barColor})`,
              transition: 'width 0.6s ease',
            }} />
          </div>
          {goal.target_date && (
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.3rem', textAlign: 'right' }}>
              Target: {new Date(goal.target_date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
