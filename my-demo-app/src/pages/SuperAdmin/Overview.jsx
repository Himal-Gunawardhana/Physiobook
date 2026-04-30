import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Users, TrendingUp, Shield, Bell, Globe, CheckCircle, AlertTriangle, X, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

export default function SuperAdminOverview() {
  const [stats,      setStats]      = useState(null);
  const [clinics,    setClinics]    = useState([]);
  const [violations, setViolations] = useState([]);
  const [alerts,     setAlerts]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [tab,        setTab]        = useState('clinics');
  const [toast,      setToast]      = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [s, c, v, a] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/clinics'),
        api.get('/admin/violations'),
        api.get('/admin/alerts').catch(() => []),
      ]);
      setStats(s);
      setClinics(Array.isArray(c) ? c : c?.clinics ?? []);
      setViolations(Array.isArray(v) ? v : v?.violations ?? []);
      setAlerts(Array.isArray(a) ? a : a?.alerts ?? []);
    } catch (err) {
      setError(err?.message || 'Failed to load system overview.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const dismiss = async (id) => {
    try {
      await api.patch(`/admin/violations/${id}/resolve`);
      setViolations(vs => vs.map(v => v.id === id ? { ...v, resolved: true } : v));
    } catch (err) {
      showToast(`Error: ${err?.message}`);
    }
  };

  const unresolvedCount = violations.filter(v => !v.resolved).length;

  const statCards = stats ? [
    { label:'Total Clinics',     value: stats.total_clinics ?? clinics.length, Icon: Building2,  color:'#2563eb' },
    { label:'Active Patients',   value: stats.active_patients ? Number(stats.active_patients).toLocaleString() : '—', Icon: Users, color:'#10b981' },
    { label:'Monthly Revenue',   value: stats.monthly_revenue ? `LKR ${Number(stats.monthly_revenue).toLocaleString()}` : '—', Icon: TrendingUp, color:'#f59e0b' },
    { label:'Uptime This Month', value: stats.uptime ? `${stats.uptime}%` : '—', Icon: Shield, color:'#8b5cf6' },
  ] : [];

  return (
    <div className="animate-in">
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, background:'#0f172a', color:'#fff', borderRadius:12, padding:'0.9rem 1.5rem', fontWeight:600, zIndex:9999, boxShadow:'0 4px 20px rgba(0,0,0,0.2)', fontSize:'0.9rem' }}>
          {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">System Overview</h1>
          <p className="page-subtitle">Platform-wide analytics, clinic management, and system health.</p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
          <span className="badge badge-green" style={{ fontSize:'0.85rem', padding:'0.4rem 0.875rem' }}>
            <CheckCircle size={13}/> All Systems Operational
          </span>
          <button onClick={load} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.45rem 0.875rem', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:8, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, color:'#374151' }}>
            <RefreshCw size={14}/>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'4rem', color:'#64748b' }}>
          <Loader size={28} style={{ animation:'spin 1s linear infinite' }}/>
        </div>
      ) : error ? (
        <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:12, padding:'1.5rem', color:'#991b1b', marginBottom:'1.5rem' }}>
          <AlertCircle size={18} style={{ display:'inline', marginRight:'0.5rem' }}/>{error}
        </div>
      ) : (
        <>
          {/* Platform Stats */}
          {statCards.length > 0 && (
            <div className="stats-grid" style={{ marginBottom:'1.75rem' }}>
              {statCards.map(({ label, value, Icon, color }) => (
                <div key={label} className="stat-card" style={{ borderLeft:`4px solid ${color}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div className="stat-label">{label}</div>
                      <div className="stat-value" style={{ fontSize:'1.75rem' }}>{value}</div>
                    </div>
                    <div style={{ background:`${color}15`, padding:'0.6rem', borderRadius:10 }}>
                      <Icon size={20} color={color}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick links */}
          <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
            <Link to="/superadmin/tickets" style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.55rem 1rem', background:'#fef3c7', color:'#92400e', borderRadius:10, fontWeight:700, fontSize:'0.85rem', textDecoration:'none' }}>
              🎫 Support Tickets
            </Link>
            <Link to="/superadmin/subscriptions" style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.55rem 1rem', background:'#ede9fe', color:'#7c3aed', borderRadius:10, fontWeight:700, fontSize:'0.85rem', textDecoration:'none' }}>
              💳 Subscriptions
            </Link>
          </div>

          {/* Tab selector */}
          <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.25rem' }}>
            {[['clinics','🏥 Clinics'],['violations',`⚠️ Violations${unresolvedCount>0?` (${unresolvedCount})`:''}`]].map(([key,label]) => (
              <button key={key} onClick={() => setTab(key)} style={{ padding:'0.55rem 1.1rem', border:'1.5px solid', borderColor: tab===key?'#f59e0b':'#e2e8f0', background: tab===key?'#fef3c7':'#fff', color: tab===key?'#92400e':'#64748b', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:'0.875rem' }}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'violations' ? (
            <div className="card">
              <h2 style={{ fontSize:'1.05rem', margin:'0 0 1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <AlertTriangle size={16} color="#ef4444"/> Access Violations
              </h2>
              {violations.length === 0 ? (
                <div style={{ textAlign:'center', padding:'2rem', color:'#94a3b8' }}>No violations recorded.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                  {violations.map(v => (
                    <div key={v.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'1rem', background: v.resolved?'#f8fafc':'#fff8f8', border:`1px solid ${v.resolved?'#e2e8f0':'#fecaca'}`, borderRadius:12, gap:'1rem', flexWrap:'wrap', opacity: v.resolved?0.65:1 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.3rem', flexWrap:'wrap' }}>
                          <span style={{ fontWeight:700, color:'#0f172a', fontSize:'0.88rem' }}>{v.clinic_name || v.clinic}</span>
                          {v.resolved
                            ? <span style={{ background:'#dcfce7', color:'#166534', borderRadius:20, padding:'0.15rem 0.6rem', fontSize:'0.75rem', fontWeight:700 }}>Resolved</span>
                            : <span style={{ background:'#fee2e2', color:'#991b1b', borderRadius:20, padding:'0.15rem 0.6rem', fontSize:'0.75rem', fontWeight:700 }}>⛔ Active</span>
                          }
                        </div>
                        <div style={{ color:'#64748b', fontSize:'0.83rem' }}>User: <strong>{v.user_email || v.user}</strong></div>
                        <div style={{ color:'#374151', fontSize:'0.85rem', marginTop:'0.2rem' }}>{v.action}</div>
                        <div style={{ color:'#94a3b8', fontSize:'0.78rem', marginTop:'0.2rem' }}>{v.created_at ? new Date(v.created_at).toLocaleString('en-LK') : v.time}</div>
                      </div>
                      {!v.resolved && (
                        <button onClick={() => dismiss(v.id)} style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.4rem 0.8rem', background:'#f1f5f9', color:'#374151', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer', fontSize:'0.82rem', whiteSpace:'nowrap' }}>
                          <X size={13}/> Dismiss
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'1.5rem', alignItems:'start' }}>
              <div className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
                  <h2 style={{ fontSize:'1.05rem', margin:0 }}>Registered Clinics</h2>
                </div>
                {clinics.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'2rem', color:'#94a3b8' }}>No clinics registered.</div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead><tr><th>Clinic</th><th>Plan</th><th>Status</th></tr></thead>
                      <tbody>
                        {clinics.map(c => (
                          <tr key={c.id}>
                            <td>
                              <div style={{ fontWeight:700 }}>{c.name}</div>
                              {c.subdomain && <div style={{ fontSize:'0.78rem', color:'#2563eb', display:'flex', alignItems:'center', gap:'0.2rem' }}><Globe size={10}/>{c.subdomain}</div>}
                            </td>
                            <td><span className={`badge ${c.subscription_plan==='professional'||c.plan==='Professional'?'badge-purple':'badge-blue'}`}>{c.subscription_plan||c.plan||'—'}</span></td>
                            <td><span className={`badge ${c.is_active||c.active?'badge-green':'badge-amber'}`}>{c.is_active||c.active?'Active':'Inactive'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {alerts.length > 0 && (
                <div className="card" style={{ height:'fit-content' }}>
                  <h2 style={{ fontSize:'1.05rem', margin:'0 0 1rem', paddingBottom:'0.75rem', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <Bell size={16} color="#f59e0b"/> System Alerts
                  </h2>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                    {alerts.map((a, i) => {
                      const type = a.type || 'info';
                      const colors = { warning:{ bg:'#fef3c7', color:'#92400e', border:'#fde68a' }, info:{ bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe' }, success:{ bg:'#dcfce7', color:'#166534', border:'#bbf7d0' } };
                      const c = colors[type] || colors.info;
                      return <div key={i} style={{ padding:'0.75rem', background:c.bg, border:`1px solid ${c.border}`, borderRadius:8, fontSize:'0.83rem', color:c.color, lineHeight:1.5 }}>{a.message || a.text}</div>;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
