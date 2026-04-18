import React, { useState } from 'react';
import { Building2, Users, TrendingUp, Shield, Bell, Globe, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const VIOLATIONS_INIT = [
  { id: 1, clinic: 'Healing Hands Physio', user: 'receptionist@hh.com', action: 'Attempted to access billing module', time: '14 Apr 2024, 09:32 AM', resolved: false },
  { id: 2, clinic: 'Motion Rehab', user: 'staff@motionrehab.com', action: 'Multiple failed login attempts (5)', time: '12 Apr 2024, 11:15 PM', resolved: false },
  { id: 3, clinic: 'Elite Physio Center', user: 'unknown', action: 'API token used from unrecognised IP', time: '10 Apr 2024, 02:44 AM', resolved: true },
];

const CLINICS_DATA = [
  { id: 1, name: 'Elite Physio Center', subdomain: 'elite.physiobook.app', owner: 'Dr. A. Roberts', plan: 'Professional', active: true, revenue: 'LKR 2.4M' },
  { id: 2, name: 'Motion Rehab', subdomain: 'motionrehab.physiobook.app', owner: 'S. Davis', plan: 'Starter', active: true, revenue: 'LKR 840K' },
  { id: 3, name: 'Healing Hands Physio', subdomain: 'healinghands.physiobook.app', owner: 'Dr. K. Fernando', plan: 'Professional', active: false, revenue: 'LKR 1.1M' },
];

export default function SuperAdminOverview() {
  const [violations, setViolations] = useState(VIOLATIONS_INIT);
  const [tab, setTab] = useState('clinics');

  const dismiss = (id) => setViolations(vs => vs.map(v => v.id === id ? { ...v, resolved: true } : v));
  const unresolvedCount = violations.filter(v => !v.resolved).length;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Overview</h1>
          <p className="page-subtitle">Platform-wide analytics, clinic management, and system health.</p>
        </div>
        <span className="badge badge-green" style={{ fontSize: '0.85rem', padding: '0.4rem 0.875rem' }}>
          <CheckCircle size={13} /> All Systems Operational
        </span>
      </div>

      {/* Platform Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
        {[
          { label: 'Total Clinics',     value: '12',      Icon: Building2,  color: '#2563eb' },
          { label: 'Active Patients',   value: '4,832',   Icon: Users,      color: '#10b981' },
          { label: 'Monthly Revenue',   value: 'LKR 28M', Icon: TrendingUp, color: '#f59e0b' },
          { label: 'Uptime This Month', value: '99.97%',  Icon: Shield,     color: '#8b5cf6' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value" style={{ fontSize: '1.75rem' }}>{value}</div>
              </div>
              <div style={{ background: `${color}15`, padding: '0.6rem', borderRadius: 10 }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link to="/superadmin/tickets" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: '#fef3c7', color: '#92400e', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
          🎫 Support Tickets
        </Link>
        <Link to="/superadmin/subscriptions" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: '#ede9fe', color: '#7c3aed', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
          💳 Subscriptions
        </Link>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          ['clinics', '🏥 Clinics'],
          ['violations', `⚠️ Violations${unresolvedCount > 0 ? ` (${unresolvedCount})` : ''}`],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: '0.55rem 1.1rem', border: '1.5px solid', borderColor: tab === key ? '#f59e0b' : '#e2e8f0', background: tab === key ? '#fef3c7' : '#fff', color: tab === key ? '#92400e' : '#64748b', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'violations' ? (
        <div className="card">
          <h2 style={{ fontSize: '1.05rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} color="#ef4444" /> Access Violations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {violations.map(v => (
              <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1rem', background: v.resolved ? '#f8fafc' : '#fff8f8', border: `1px solid ${v.resolved ? '#e2e8f0' : '#fecaca'}`, borderRadius: 12, gap: '1rem', flexWrap: 'wrap', opacity: v.resolved ? 0.65 : 1 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{v.clinic}</span>
                    {v.resolved
                      ? <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 20, padding: '0.15rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}>Access Denied → Resolved</span>
                      : <span style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 20, padding: '0.15rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}>⛔ Access Denied</span>
                    }
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.83rem' }}>User: <strong>{v.user}</strong></div>
                  <div style={{ color: '#374151', fontSize: '0.85rem', marginTop: '0.2rem' }}>{v.action}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.2rem' }}>{v.time}</div>
                </div>
                {!v.resolved && (
                  <button onClick={() => dismiss(v.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    <X size={13} /> Dismiss
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Registered Clinics</h2>
              <button className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.4rem 0.875rem' }}>+ Onboard Clinic</button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Clinic</th><th>Subdomain</th><th>Owner</th><th>Plan</th><th>Revenue</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {CLINICS_DATA.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700 }}>{c.name}</td>
                      <td style={{ fontSize: '0.8rem' }}><span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#2563eb' }}><Globe size={11} />{c.subdomain}</span></td>
                      <td>{c.owner}</td>
                      <td><span className={`badge ${c.plan === 'Professional' ? 'badge-purple' : 'badge-blue'}`}>{c.plan}</span></td>
                      <td style={{ fontWeight: 600 }}>{c.revenue}</td>
                      <td><span className={`badge ${c.active ? 'badge-green' : 'badge-amber'}`}>{c.active ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.05rem', margin: '0 0 1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} color="#f59e0b" /> System Alerts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { type: 'warning', text: 'Healing Hands Physio subscription expires in 7 days.' },
                { type: 'info',    text: 'New clinic application from Peak Sports Rehab pending review.' },
                { type: 'success', text: 'Server storage at 42% — all systems healthy.' },
              ].map(({ type, text }) => {
                const colors = { warning: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' }, info: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' }, success: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' } };
                const c = colors[type];
                return <div key={text} style={{ padding: '0.75rem', background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: '0.83rem', color: c.color, lineHeight: 1.5 }}>{text}</div>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
