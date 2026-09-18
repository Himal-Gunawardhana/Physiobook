import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Inline SVG sparkline + metric summary.
 * readings: array of { value, measured_at }
 */
export default function ProgressChart({ metric, readings = [], height = 80 }) {
  const sorted = useMemo(() => [...readings].sort((a, b) => new Date(a.measured_at) - new Date(b.measured_at)), [readings]);

  const values = sorted.map(r => parseFloat(r.value));
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const W = 220;
  const H = height;
  const PAD = 8;

  const points = values.map((v, i) => {
    const x = PAD + (i / Math.max(values.length - 1, 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - minV) / range) * (H - PAD * 2);
    return `${x},${y}`;
  }).join(' ');

  const baseline = parseFloat(metric.baseline_value);
  const current = parseFloat(metric.current_value);
  const target = parseFloat(metric.target_value);
  const delta = !isNaN(baseline) && !isNaN(current) ? current - baseline : null;

  const TrendIcon = delta === null ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const trendColor = delta === null ? '#94a3b8' : delta > 0 ? '#16a34a' : '#dc2626';

  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
      padding: '1rem 1.25rem', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{metric.metric_name}</div>
          {metric.unit && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{metric.unit}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: trendColor, fontSize: '0.82rem', fontWeight: 600 }}>
          <TrendIcon size={14} />
          {delta !== null ? (
            <span>{delta > 0 ? '+' : ''}{delta.toFixed(1)}</span>
          ) : (
            <span>—</span>
          )}
        </div>
      </div>

      {/* Sparkline */}
      {values.length >= 2 ? (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id={`grad-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Area fill */}
          <polyline
            points={`${PAD},${H} ${points} ${W - PAD},${H}`}
            fill={`url(#grad-${metric.id})`}
            stroke="none"
          />
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Dots */}
          {points.split(' ').map((pt, i) => {
            const [x, y] = pt.split(',');
            return (
              <circle key={i} cx={x} cy={y} r="3.5" fill="#fff" stroke="#2563eb" strokeWidth="2" />
            );
          })}
        </svg>
      ) : (
        <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '0.8rem' }}>
          Not enough data to display trend
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
        {!isNaN(baseline) && (
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.1rem' }}>Baseline</div>
            <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>{baseline}</div>
          </div>
        )}
        {!isNaN(current) && (
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.1rem' }}>Current</div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{current}</div>
          </div>
        )}
        {!isNaN(target) && (
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.1rem' }}>Target</div>
            <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.9rem' }}>{target}</div>
          </div>
        )}
        {metric.current_date && (
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.1rem' }}>Last Updated</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {new Date(metric.current_date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
