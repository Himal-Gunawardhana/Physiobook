import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Star, MessageCircle, RefreshCw, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

const BOOKINGS = [
  { id: 'PB-2024-0042', service: 'Lower Back Rehabilitation', therapist: 'Dr. Aisha Perera', date: '20 Apr 2024', time: '10:00 AM', status: 'pending', amount: 'LKR 4,500', mode: 'Clinic Visit' },
  { id: 'PB-2024-0038', service: 'Sports Injury Recovery', therapist: 'Mr. Kamal Fernando', date: '15 Apr 2024', time: '2:00 PM', status: 'confirmed', amount: 'LKR 5,200', mode: 'Home Visit' },
  { id: 'PB-2024-0031', service: 'Neck & Shoulder Therapy', therapist: 'Dr. Aisha Perera', date: '8 Apr 2024', time: '11:00 AM', status: 'completed', amount: 'LKR 3,800', mode: 'Clinic Visit' },
  { id: 'PB-2024-0024', service: 'Post-Op Rehabilitation', therapist: 'Mr. Kamal Fernando', date: '1 Apr 2024', time: '9:00 AM', status: 'completed', amount: 'LKR 6,000', mode: 'Online' },
];

const STATUS = {
  pending:   { label: 'Pending', bg: '#fef3c7', color: '#92400e', icon: <Clock size={12} /> },
  confirmed: { label: 'Confirmed', bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={12} /> },
  completed: { label: 'Completed', bg: '#ede9fe', color: '#5b21b6', icon: <Star size={12} /> },
  cancelled: { label: 'Cancelled', bg: '#fee2e2', color: '#991b1b', icon: <AlertCircle size={12} /> },
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [refundModal, setRefundModal] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundDone, setRefundDone] = useState(false);

  const filtered = filter === 'all' ? BOOKINGS : BOOKINGS.filter(b => b.status === filter);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>My Bookings</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Manage and track all your physiotherapy sessions</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: '#fff', padding: '0.4rem', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {['all', 'pending', 'confirmed', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ flex: 1, padding: '0.5rem 0.25rem', borderRadius: 8, border: 'none', background: filter === f ? '#2563eb' : 'transparent', color: filter === f ? '#fff' : '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem', textTransform: 'capitalize', transition: 'all 0.2s' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Booking cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(b => {
            const s = STATUS[b.status];
            return (
              <div key={b.id} style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{b.service}</div>
                    <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.1rem' }}>{b.therapist}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: s.bg, color: s.color, borderRadius: 20, padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 700 }}>
                    {s.icon} {s.label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.83rem' }}><Calendar size={13} />{b.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.83rem' }}><Clock size={13} />{b.time}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.83rem' }}>{b.amount}</span>
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {b.status === 'confirmed' && (
                    <>
                      <button onClick={() => setRefundModal(b)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                        <RefreshCw size={13} /> Ask Refund
                      </button>
                      <button onClick={() => navigate('/book/feedback')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                        <CheckCircle size={13} /> Complete Session
                      </button>
                    </>
                  )}
                  {b.status === 'completed' && (
                    <button onClick={() => navigate('/book/feedback')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem', background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                      <Star size={13} /> Leave Feedback
                    </button>
                  )}
                  <button style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem', background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                    <MessageCircle size={13} /> Message Therapist
                  </button>
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', color: '#94a3b8', fontSize: '0.78rem' }}>{b.id} <ChevronRight size={14} /></span>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => navigate('/book')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.5rem auto 0', padding: '0.9rem 2rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
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
                <p style={{ color: '#64748b', margin: '0 0 1.25rem' }}>The clinic will review your refund request and respond within 24 hours.</p>
                <button onClick={() => { setRefundModal(null); setRefundDone(false); setRefundReason(''); }} style={{ width: '100%', padding: '0.8rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Done</button>
              </div>
            ) : (
              <>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>Request Refund</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1rem' }}>Booking: <strong>{refundModal.id}</strong> — {refundModal.service}</p>
                <textarea value={refundReason} onChange={e => setRefundReason(e.target.value)} placeholder="Reason for refund…" rows={3} style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem', marginBottom: '1rem', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setRefundModal(null)} style={{ flex: 1, padding: '0.8rem', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setRefundDone(true)} disabled={!refundReason.trim()} style={{ flex: 1, padding: '0.8rem', background: refundReason.trim() ? '#ef4444' : '#fca5a5', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: refundReason.trim() ? 'pointer' : 'not-allowed' }}>Submit</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
