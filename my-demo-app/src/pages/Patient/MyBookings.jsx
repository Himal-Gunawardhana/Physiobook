import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Star, MessageCircle, RefreshCw, CheckCircle, AlertCircle, ChevronRight, Loader } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const STATUS = {
  pending:          { label: 'Pending',    bg: '#fef3c7', color: '#92400e', icon: <Clock size={12} /> },
  confirmed:        { label: 'Confirmed',  bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={12} /> },
  in_progress:      { label: 'In Session', bg: '#dbeafe', color: '#1e40af', icon: <Clock size={12} /> },
  completed:        { label: 'Completed',  bg: '#ede9fe', color: '#5b21b6', icon: <Star size={12} /> },
  cancelled:        { label: 'Cancelled',  bg: '#fee2e2', color: '#991b1b', icon: <AlertCircle size={12} /> },
  refund_requested: { label: 'Refund Req', bg: '#fef9c3', color: '#713f12', icon: <RefreshCw size={12} /> },
};

export default function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [filter,       setFilter]       = useState('all');
  const [refundModal,  setRefundModal]  = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading,setRefundLoading]= useState(false);
  const [refundDone,   setRefundDone]   = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get('/bookings?limit=50');
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : data?.bookings ?? [];
        setBookings(rows);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load bookings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const submitRefund = async () => {
    if (!refundReason.trim()) return;
    setRefundLoading(true);
    try {
      // Find payment for this booking and request refund
      await api.post(`/payments/${refundModal.payment_id || refundModal.id}/refund`, { reason: refundReason });
      // Update local status
      setBookings(bs => bs.map(b => b.id === refundModal.id ? { ...b, status: 'refund_requested' } : b));
      setRefundDone(true);
    } catch (err) {
      alert(err?.message || 'Failed to submit refund.');
    } finally {
      setRefundLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatTime = (t) => {
    if (!t) return '—';
    if (t.includes('T')) return new Date(t).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' });
    return t;
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <AlertCircle size={40} color="#ef4444" />
        <p style={{ color: '#64748b' }}>Please <button onClick={() => navigate('/book/register')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>sign in</button> to view your bookings.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>My Bookings</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Manage and track all your physiotherapy sessions</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: '#fff', padding: '0.4rem', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexWrap: 'wrap' }}>
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ flex: 1, minWidth: 70, padding: '0.5rem 0.25rem', borderRadius: 8, border: 'none', background: filter === f ? '#2563eb' : 'transparent', color: filter === f ? '#fff' : '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem', textTransform: 'capitalize', transition: 'all 0.2s' }}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#64748b' }}>
            <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : error ? (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '1.5rem', textAlign: 'center', color: '#991b1b' }}>
            <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} />
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: '3rem', textAlign: 'center', color: '#64748b', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Calendar size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p style={{ margin: 0 }}>No {filter !== 'all' ? filter : ''} bookings found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(b => {
              const s = STATUS[b.status] || STATUS.pending;
              return (
                <div key={b.id} style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{b.service_name || b.service?.name || 'Session'}</div>
                      <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.1rem' }}>{b.therapist_name || b.therapist?.name || '—'}</div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: s.bg, color: s.color, borderRadius: 20, padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 700 }}>
                      {s.icon} {s.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.83rem' }}><Calendar size={13} />{formatDate(b.booked_date)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.83rem' }}><Clock size={13} />{formatTime(b.booked_time)}</span>
                    {b.amount && <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.83rem' }}>LKR {Number(b.amount).toLocaleString()}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(b.status === 'confirmed' || b.status === 'completed') && (
                      <button onClick={() => { setRefundModal(b); setRefundDone(false); setRefundReason(''); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                        <RefreshCw size={13} /> Ask Refund
                      </button>
                    )}
                    {b.status === 'completed' && (
                      <button onClick={() => navigate('/book/feedback', { state: { bookingId: b.id } })}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem', background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                        <Star size={13} /> Leave Feedback
                      </button>
                    )}
                    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', color: '#94a3b8', fontSize: '0.78rem' }}>
                      {b.reference || b.id?.slice(0, 8)} <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={() => navigate('/book')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.5rem auto 0', padding: '0.9rem 2rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
          Book Another Session
        </button>
      </div>

      {/* Refund Modal */}
      {refundModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 400, width: '100%' }}>
            {refundDone ? (
              <div style={{ textAlign: 'center' }}>
                <CheckCircle size={40} color="#10b981" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>Refund Requested</h3>
                <p style={{ color: '#64748b', margin: '0 0 1.25rem' }}>The clinic will review and respond within 24 hours.</p>
                <button onClick={() => setRefundModal(null)} style={{ width: '100%', padding: '0.8rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Done</button>
              </div>
            ) : (
              <>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>Request Refund</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1rem' }}>{refundModal.service_name || 'Session'}</p>
                <textarea value={refundReason} onChange={e => setRefundReason(e.target.value)} placeholder="Reason for refund…" rows={3}
                  style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem', marginBottom: '1rem', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setRefundModal(null)} style={{ flex: 1, padding: '0.8rem', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={submitRefund} disabled={!refundReason.trim() || refundLoading}
                    style={{ flex: 1, padding: '0.8rem', background: refundReason.trim() ? '#ef4444' : '#fca5a5', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: refundReason.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    {refundLoading ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : 'Submit'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
