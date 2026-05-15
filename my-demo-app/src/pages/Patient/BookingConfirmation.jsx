import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, User, Copy, ArrowRight, MessageSquare } from 'lucide-react';

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const st = location.state || {};
  const booking = st.booking || {};
  const primaryColor = st.primaryColor || '#2563eb';

  const reference = booking.reference || booking.id?.slice(0, 8)?.toUpperCase() || 'N/A';

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };
  const formatTime = (t) => {
    if (!t) return 'N/A';
    const [h, m] = t.split(':').map(Number);
    return `${((h % 12) || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const modeLabel = { clinic: 'Clinic Visit', home: 'Home Visit', online: 'Online Video Call' }[booking.visit_mode] || booking.visit_mode || 'Clinic Visit';

  const copyRef = () => {
    navigator.clipboard?.writeText(reference);
  };

  return (
    <div className="patient-page">
      <main className="patient-main" style={{ maxWidth: 560, paddingTop: '2rem' }}>

        {/* Success icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <CheckCircle size={36} color="#16a34a" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>Booking Submitted!</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Your appointment is <strong style={{ color: '#f59e0b' }}>pending</strong> and will be confirmed by the clinic shortly.
          </p>
        </div>

        {/* Reference */}
        <div style={{ background: `${primaryColor}08`, border: `1.5px solid ${primaryColor}30`, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.25rem' }}>Booking Reference</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: primaryColor, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {reference}
            <button onClick={copyRef} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }} title="Copy">
              <Copy size={14} />
            </button>
          </div>
        </div>

        {/* Details card */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '1px solid #e2e8f0' }}>Appointment Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
              <Calendar size={16} color={primaryColor} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600 }}>{formatDate(booking.booked_date)}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{formatTime(booking.booked_time)} · {booking.duration_minutes || 30} minutes</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
              <MapPin size={16} color={primaryColor} style={{ flexShrink: 0 }} />
              <span>{modeLabel}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
              <User size={16} color={primaryColor} style={{ flexShrink: 0 }} />
              <span>{booking.assignedTherapist ? `${booking.assignedTherapist.first_name || ''} ${booking.assignedTherapist.last_name || ''}`.trim() : 'Therapist will be assigned'}</span>
            </div>
          </div>
        </div>

        {/* What's next */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>What happens next?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: primaryColor, fontWeight: 700, flexShrink: 0 }}>1.</span>
              <span>The clinic will review and <strong>confirm</strong> your booking.</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: primaryColor, fontWeight: 700, flexShrink: 0 }}>2.</span>
              <span>You'll receive a <strong>confirmation email</strong> with full details.</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: primaryColor, fontWeight: 700, flexShrink: 0 }}>3.</span>
              <span>You can <strong>chat with your therapist</strong> to discuss pre-therapy preparations.</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: primaryColor, fontWeight: 700, flexShrink: 0 }}>4.</span>
              <span>Attend your session and <strong>pay at the clinic</strong>.</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: primaryColor, fontWeight: 700, flexShrink: 0 }}>5.</span>
              <span>After the session, you can <strong>leave a review</strong> for your therapist.</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/book/my-bookings')} className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '0.85rem', background: primaryColor }}>
            <Calendar size={15} /> View My Bookings <ArrowRight size={14} />
          </button>
          <button onClick={() => navigate('/')} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}>
            ← Back to Home
          </button>
        </div>
      </main>
    </div>
  );
}
