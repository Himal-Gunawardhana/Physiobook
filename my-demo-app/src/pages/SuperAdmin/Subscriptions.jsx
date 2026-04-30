import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, CheckCircle, AlertTriangle, RefreshCw, Loader, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

const PLANS = {
  starter:      { label:'Starter',      bg:'#dbeafe', color:'#1d4ed8', price:'LKR 2,990/mo' },
  professional: { label:'Professional', bg:'#ede9fe', color:'#7c3aed', price:'LKR 7,990/mo' },
  enterprise:   { label:'Enterprise',   bg:'#fef3c7', color:'#92400e', price:'LKR 18,990/mo' },
};

export default function Subscriptions() {
  const [clinics,  setClinics]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [editing,  setEditing]  = useState(null);
  const [newPlan,  setNewPlan]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await api.get('/admin/subscriptions');
      setClinics(Array.isArray(data) ? data : data?.subscriptions ?? data?.clinics ?? []);
    } catch (err) {
      setError(err?.message || 'Failed to load subscriptions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const savePlan = async (id) => {
    setSaving(true);
    try {
      await api.patch(`/admin/subscriptions/${id}`, { plan: newPlan, status:'active' });
      const name = clinics.find(c => c.id === id)?.name;
      setClinics(cs => cs.map(c => c.id === id ? { ...c, subscription_plan: newPlan, plan: newPlan, status:'active' } : c));
      setEditing(null);
      showToast(`Subscription updated for ${name}`);
    } catch (err) {
      showToast(`Error: ${err?.message || 'Failed to update.'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding:'1rem', maxWidth:860, margin:'0 auto' }}>
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, background:'#0f172a', color:'#fff', borderRadius:12, padding:'0.9rem 1.5rem', fontWeight:600, zIndex:9999, display:'flex', alignItems:'center', gap:'0.5rem', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
          <CheckCircle size={16} color="#10b981"/> {toast}
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.25rem' }}>
        <h2 style={{ margin:0, fontWeight:800, color:'#0f172a', fontSize:'1.4rem' }}>Subscriptions</h2>
        <button onClick={load} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.45rem 0.875rem', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:8, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, color:'#374151' }}>
          <RefreshCw size={14}/>
        </button>
      </div>
      <p style={{ margin:'0 0 1.5rem', color:'#64748b', fontSize:'0.9rem' }}>Manage subscription plans for all registered clinics.</p>

      {/* Summary by plan */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {Object.entries(PLANS).map(([key, plan]) => (
          <div key={key} style={{ background:'#fff', borderRadius:14, padding:'1.1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', textAlign:'center' }}>
            <span style={{ display:'inline-block', background:plan.bg, color:plan.color, borderRadius:6, padding:'0.25rem 0.65rem', fontSize:'0.78rem', fontWeight:700, marginBottom:'0.4rem' }}>{plan.label}</span>
            <div style={{ fontWeight:800, fontSize:'1.4rem', color:'#0f172a' }}>
              {clinics.filter(c => (c.subscription_plan||c.plan||'').toLowerCase() === key).length}
            </div>
            <div style={{ color:'#64748b', fontSize:'0.8rem' }}>clinics</div>
            <div style={{ color:'#94a3b8', fontSize:'0.75rem', marginTop:'0.2rem' }}>{plan.price}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'4rem', color:'#64748b' }}>
          <Loader size={28} style={{ animation:'spin 1s linear infinite' }}/>
        </div>
      ) : error ? (
        <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:12, padding:'1.5rem', color:'#991b1b' }}>
          <AlertCircle size={18} style={{ display:'inline', marginRight:'0.5rem' }}/>{error}
        </div>
      ) : clinics.length === 0 ? (
        <div style={{ background:'#fff', borderRadius:16, padding:'3rem', textAlign:'center', color:'#94a3b8', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
          No clinics found.
        </div>
      ) : (
        <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc', borderBottom:'2px solid #f1f5f9' }}>
                {['Clinic','Plan','Expires','Revenue','Bookings','Actions'].map(h => (
                  <th key={h} style={{ padding:'0.9rem 1rem', textAlign:'left', fontSize:'0.8rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clinics.map((c, i) => {
                const planKey = (c.subscription_plan || c.plan || 'starter').toLowerCase();
                const plan = PLANS[planKey] || PLANS.starter;
                const isExp = c.subscription_status === 'expired' || c.status === 'expired';
                const expiresAt = c.subscription_expires_at || c.expires;
                return (
                  <tr key={c.id} style={{ borderBottom: i < clinics.length-1 ? '1px solid #f1f5f9' : 'none', background: isExp ? '#fff8f8' : '#fff' }}>
                    <td style={{ padding:'0.9rem 1rem' }}>
                      <div style={{ fontWeight:700, color:'#0f172a', fontSize:'0.9rem' }}>{c.name}</div>
                      {c.owner_name && <div style={{ fontSize:'0.78rem', color:'#64748b' }}>{c.owner_name}</div>}
                    </td>
                    <td style={{ padding:'0.9rem 1rem' }}>
                      <span style={{ background:plan.bg, color:plan.color, borderRadius:6, padding:'0.25rem 0.6rem', fontSize:'0.78rem', fontWeight:700 }}>{plan.label}</span>
                    </td>
                    <td style={{ padding:'0.9rem 1rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.35rem', fontSize:'0.85rem', color: isExp ? '#ef4444' : '#374151', fontWeight: isExp ? 700 : 400 }}>
                        {isExp && <AlertTriangle size={13} color="#ef4444"/>}
                        {expiresAt ? new Date(expiresAt).toLocaleDateString('en-LK') : '—'}
                      </div>
                    </td>
                    <td style={{ padding:'0.9rem 1rem', fontSize:'0.85rem', fontWeight:600, color:'#0f172a' }}>
                      {c.total_revenue ? `LKR ${Number(c.total_revenue).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding:'0.9rem 1rem', fontSize:'0.85rem', color:'#374151' }}>
                      {c.total_bookings ?? '—'}
                    </td>
                    <td style={{ padding:'0.9rem 1rem' }}>
                      {editing === c.id ? (
                        <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                          <select value={newPlan} onChange={e => setNewPlan(e.target.value)} style={{ padding:'0.4rem 0.6rem', border:'1.5px solid #e2e8f0', borderRadius:6, fontFamily:'inherit', fontSize:'0.82rem' }}>
                            {Object.keys(PLANS).map(k => <option key={k} value={k}>{PLANS[k].label}</option>)}
                          </select>
                          <button onClick={() => savePlan(c.id)} disabled={saving} style={{ padding:'0.4rem 0.7rem', background:'#10b981', color:'#fff', border:'none', borderRadius:6, fontWeight:700, cursor:'pointer', fontSize:'0.8rem' }}>
                            {saving ? <Loader size={12} style={{ animation:'spin 1s linear infinite' }}/> : 'Save'}
                          </button>
                          <button onClick={() => setEditing(null)} style={{ padding:'0.4rem 0.7rem', background:'#f1f5f9', color:'#64748b', border:'none', borderRadius:6, cursor:'pointer', fontSize:'0.8rem' }}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditing(c.id); setNewPlan(planKey); }} style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.4rem 0.8rem', background: isExp ? '#fee2e2' : '#eff6ff', color: isExp ? '#991b1b' : '#2563eb', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer', fontSize:'0.82rem' }}>
                          <RefreshCw size={12}/> {isExp ? 'Renew' : 'Update Plan'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
