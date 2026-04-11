import React from 'react';
import { Building2, Users, TrendingUp, Shield, Bell, Globe, CheckCircle } from 'lucide-react';

const clinics = [
  { id: 1, name: 'Elite Physio Center',        subdomain: 'elite.physiobook.itselfcare.com',          owner: 'Dr. A. Roberts',  plan: 'Professional', active: true,  revenue: 'LKR 2.4M' },
  { id: 2, name: 'Motion Rehab',               subdomain: 'motionrehab.physiobook.itselfcare.com',     owner: 'S. Davis',        plan: 'Starter',       active: true,  revenue: 'LKR 840K'  },
  { id: 3, name: 'Healing Hands Physio',        subdomain: 'healinghands.physiobook.itselfcare.com',   owner: 'Dr. K. Fernando', plan: 'Professional', active: false, revenue: 'LKR 1.1M' },
];

export default function SuperAdminOverview() {
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
          { label: 'Total Clinics',        value: '12',      Icon: Building2,  color: '#2563eb' },
          { label: 'Active Patients',      value: '4,832',   Icon: Users,      color: '#10b981' },
          { label: 'Monthly Revenue',      value: 'LKR 28M', Icon: TrendingUp, color: '#f59e0b' },
          { label: 'Uptime This Month',    value: '99.97%',  Icon: Shield,     color: '#8b5cf6' },
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

      {/* Recent Activity + Alerts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Clinic table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Registered Clinics</h2>
            <button className="btn-primary" style={{ fontSize: '0.82rem', padding: '0.4rem 0.875rem' }}>+ Onboard Clinic</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Clinic</th>
                  <th>Subdomain</th>
                  <th>Owner</th>
                  <th>Plan</th>
                  <th>Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                    <td style={{ fontSize: '0.8rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#2563eb' }}>
                        <Globe size={11} /> {c.subdomain}
                      </span>
                    </td>
                    <td>{c.owner}</td>
                    <td>
                      <span className={`badge ${c.plan === 'Professional' ? 'badge-purple' : 'badge-blue'}`}>{c.plan}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.revenue}</td>
                    <td>
                      <span className={`badge ${c.active ? 'badge-green' : 'badge-amber'}`}>{c.active ? 'Active' : 'Inactive'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts */}
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
              return (
                <div key={text} style={{ padding: '0.75rem', background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: '0.83rem', color: c.color, lineHeight: 1.5 }}>
                  {text}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
