import React, { useState } from 'react';
import { CreditCard, CheckCircle, AlertTriangle, ChevronDown, RefreshCw } from 'lucide-react';

const CLINICS = [
  { id: 'c1', name: 'Elite Physio — Downtown', plan: 'professional', expires: '30 Jun 2024', status: 'active', revenue: 'LKR 485,000', bookings: 142 },
  { id: 'c2', name: 'Elite Physio — North Branch', plan: 'starter', expires: '15 May 2024', status: 'active', revenue: 'LKR 127,000', bookings: 38 },
  { id: 'c3', name: 'City Center Rehab', plan: 'enterprise', expires: '31 Dec 2024', status: 'active', revenue: 'LKR 1,240,000', bookings: 389 },
  { id: 'c4', name: 'Sunrise Physio', plan: 'starter', expires: '2 Apr 2024', status: 'expired', revenue: 'LKR 45,000', bookings: 12 },
];

const PLANS = {
  starter:      { label: 'Starter',      bg: '#dbeafe', color: '#1d4ed8', price: 'LKR 2,990/mo' },
  professional: { label: 'Professional', bg: '#ede9fe', color: '#7c3aed', price: 'LKR 7,990/mo' },
  enterprise:   { label: 'Enterprise',   bg: '#fef3c7', color: '#92400e', price: 'LKR 18,990/mo' },
};

export default function Subscriptions() {
  const [clinics, setClinics] = useState(CLINICS);
  const [editing, setEditing] = useState(null);
  const [newPlan, setNewPlan] = useState('');
  const [toast, setToast] = useState(null);

  const savePlan = (id) => {
    setClinics(cs => cs.map(c => c.id === id ? { ...c, plan: newPlan, status: 'active' } : c));
    setEditing(null);
    const name = clinics.find(c => c.id === id)?.name;
    setToast(`Subscription updated for ${name}`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 860, margin: '0 auto' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#0f172a', color: '#fff', borderRadius: 12, padding: '0.9rem 1.5rem', fontWeight: 600, zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <CheckCircle size={16} color="#10b981" /> {toast}
        </div>
      )}

      <h2 style={{ margin: '0 0 0.25rem', fontWeight: 800, color: '#0f172a', fontSize: '1.4rem' }}>Subscriptions</h2>
      <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>Manage subscription plans for all registered clinics.</p>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {Object.entries(PLANS).map(([key, plan]) => (
          <div key={key} style={{ background: '#fff', borderRadius: 14, padding: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <span style={{ display: 'inline-block', background: plan.bg, color: plan.color, borderRadius: 6, padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>{plan.label}</span>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a' }}>{clinics.filter(c => c.plan === key).length}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>clinics</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.2rem' }}>{plan.price}</div>
          </div>
        ))}
      </div>

      {/* Clinic Table */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
              {['Clinic', 'Plan', 'Expires', 'Revenue', 'Bookings', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clinics.map((c, i) => {
              const plan = PLANS[c.plan];
              const isExp = c.status === 'expired';
              return (
                <tr key={c.id} style={{ borderBottom: i < clinics.length-1 ? '1px solid #f1f5f9' : 'none', background: isExp ? '#fff8f8' : '#fff' }}>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{c.name}</div>
                  </td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <span style={{ background: plan.bg, color: plan.color, borderRadius: 6, padding: '0.25rem 0.6rem', fontSize: '0.78rem', fontWeight: 700 }}>{plan.label}</span>
                  </td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: isExp ? '#ef4444' : '#374151', fontWeight: isExp ? 700 : 400 }}>
                      {isExp && <AlertTriangle size={13} color="#ef4444" />} {c.expires}
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{c.revenue}</td>
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: '#374151' }}>{c.bookings}</td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    {editing === c.id ? (
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <select value={newPlan} onChange={e => setNewPlan(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1.5px solid #e2e8f0', borderRadius: 6, fontFamily: 'inherit', fontSize: '0.82rem' }}>
                          {Object.keys(PLANS).map(k => <option key={k} value={k}>{PLANS[k].label}</option>)}
                        </select>
                        <button onClick={() => savePlan(c.id)} style={{ padding: '0.4rem 0.7rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Save</button>
                        <button onClick={() => setEditing(null)} style={{ padding: '0.4rem 0.7rem', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditing(c.id); setNewPlan(c.plan); }} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', background: isExp ? '#fee2e2' : '#eff6ff', color: isExp ? '#991b1b' : '#2563eb', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>
                        <RefreshCw size={12} /> {isExp ? 'Renew' : 'Update Plan'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
