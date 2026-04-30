import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrendingUp, Users, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, Bell, Loader, RefreshCw } from 'lucide-react';
import api from '../../lib/api';

const STATUS = {
  confirmed:  { cls: 'badge-green',  label: 'Confirmed',  Icon: CheckCircle },
  pending:    { cls: 'badge-amber',  label: 'Pending',    Icon: Clock },
  cancelled:  { cls: 'badge-red',    label: 'Cancelled',  Icon: AlertCircle },
  completed:  { cls: 'badge-purple', label: 'Completed',  Icon: CheckCircle },
  in_progress:{ cls: 'badge-blue',   label: 'In Session', Icon: Clock },
};

export default function ClinicDashboard() {
  const { activeClinic } = useOutletContext();
  const [bookings,   setBookings]   = useState([]);
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [toast,      setToast]      = useState(null);
  const [filter,     setFilter]     = useState('all');
  const [confirming, setConfirming] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const q = activeClinic?.id ? `?clinic_id=${activeClinic.id}` : '';
      const [bData, sData] = await Promise.all([
        api.get(`/bookings/today${q}`),
        api.get(`/dashboard/stats${q}`),
      ]);
      setBookings(Array.isArray(bData) ? bData : bData?.bookings ?? []);
      setStats(sData);
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, [activeClinic?.id]);

  useEffect(() => { load(); }, [load]);

  const confirm = async (id) => {
    setConfirming(id);
    try {
      await api.patch(`/bookings/${id}/confirm`);
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
      const b = bookings.find(b => b.id === id);
      showToast(`Booking confirmed for ${b?.patient_name || 'patient'}`);
    } catch (err) {
      showToast(`Error: ${err?.message || 'Failed to confirm.'}`);
    } finally {
      setConfirming(null);
    }
  };

  const shown = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const pending = bookings.filter(b => b.status === 'pending').length;

  const statCards = stats ? [
    { label: "Today's Revenue",    value: `LKR ${Number(stats.today_revenue||0).toLocaleString()}`, delta: stats.revenue_delta||'', Icon: DollarSign, color: '#10b981' },
    { label: 'Appointments Today', value: stats.today_appointments ?? bookings.length, delta: `${stats.remaining??0} remaining`, Icon: Calendar, color: '#2563eb' },
    { label: 'Active Therapists',  value: stats.active_therapists ?? '—', delta: `${stats.on_leave??0} on leave`, Icon: Users, color: '#8b5cf6' },
    { label: 'Avg. Rating',        value: stats.avg_rating ? `${Number(stats.avg_rating).toFixed(1)} ★` : '—', delta: stats.rating_count ? `${stats.rating_count} reviews` : '', Icon: TrendingUp, color: '#f59e0b' },
  ] : [];

  return (
    <div className="animate-in">
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, background:'#0f172a', color:'#fff', borderRadius:12, padding:'0.9rem 1.5rem', fontWeight:600, zIndex:9999, boxShadow:'0 4px 20px rgba(0,0,0,0.2)', maxWidth:360, fontSize:'0.9rem' }}>
          {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">{activeClinic?.name || 'Dashboard'}</h1>
          <p className="page-subtitle">Dashboard Overview — Today, {new Date().toLocaleDateString('en-LK', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' }}>
          {pending > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'#fef3c7', color:'#92400e', borderRadius:10, padding:'0.5rem 1rem', fontSize:'0.85rem', fontWeight:700 }}>
              <Bell size={15}/> {pending} pending
            </div>
          )}
          <button onClick={load} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.45rem 0.875rem', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:8, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, color:'#374151' }}>
            <RefreshCw size={14}/> Refresh
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
          {statCards.length > 0 && (
            <div className="stats-grid" style={{ marginBottom:'2rem' }}>
              {statCards.map(({ label, value, delta, Icon, color }) => (
                <div key={label} className="stat-card" style={{ borderLeft:`4px solid ${color}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div className="stat-label">{label}</div>
                      <div className="stat-value" style={{ fontSize:'1.75rem' }}>{value}</div>
                      {delta && <div className="stat-delta">{delta}</div>}
                    </div>
                    <div style={{ background:`${color}15`, padding:'0.6rem', borderRadius:10 }}>
                      <Icon size={20} color={color}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
              <h2 style={{ fontSize:'1.1rem', margin:0 }}>Today's Bookings</h2>
              <div className="filter-pills">
                {['all','pending','confirmed','cancelled'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding:'0.35rem 0.75rem', border:'1.5px solid', borderColor: filter===f?'#2563eb':'#e2e8f0', background: filter===f?'#eff6ff':'#fff', color: filter===f?'#2563eb':'#64748b', borderRadius:8, fontSize:'0.78rem', fontWeight:600, cursor:'pointer', textTransform:'capitalize' }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {shown.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3rem', color:'#94a3b8' }}>
                <Calendar size={36} style={{ marginBottom:'0.75rem', opacity:0.4 }}/>
                <p style={{ margin:0 }}>No bookings for today.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th><th>Service</th><th>Therapist</th><th>Time</th><th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map(b => {
                      const s = STATUS[b.status] || STATUS.pending;
                      return (
                        <tr key={b.id}>
                          <td style={{ fontWeight:600 }}>{b.patient_name || b.patient?.name || '—'}</td>
                          <td>{b.service_name || b.service?.name || '—'}</td>
                          <td>{b.therapist_name || b.therapist?.name || '—'}</td>
                          <td style={{ fontWeight:500, color:'#2563eb' }}>{b.booked_time || '—'}</td>
                          <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                          <td>
                            {b.status === 'pending' ? (
                              <button onClick={() => confirm(b.id)} disabled={confirming===b.id} style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.35rem 0.75rem', background:'#10b981', color:'#fff', border:'none', borderRadius:7, fontSize:'0.8rem', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', opacity: confirming===b.id ? 0.7 : 1 }}>
                                {confirming===b.id ? <Loader size={12} style={{ animation:'spin 1s linear infinite' }}/> : <CheckCircle size={12}/>}
                                {confirming===b.id ? 'Wait…' : 'Confirm'}
                              </button>
                            ) : b.status === 'confirmed' ? (
                              <span style={{ color:'#10b981', fontSize:'0.82rem', fontWeight:600 }}>✓ Confirmed</span>
                            ) : (
                              <span style={{ color:'#94a3b8', fontSize:'0.82rem' }}>—</span>
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
        </>
      )}
    </div>
  );
}
