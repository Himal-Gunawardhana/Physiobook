import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Lock, Clock, Building2, Loader, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const st = location.state || {};

  const service       = st.service       || {};
  const clinicId      = st.clinicId;
  const clinicSlug    = st.clinicSlug;
  const primaryColor  = st.primaryColor  || '#2563eb';
  const visitMode     = st.visitMode     || 'clinic';
  const visitModeLabel= st.visitModeLabel|| 'Clinic Visit';
  const therapistId   = st.therapistId;
  const therapistName = st.therapistName || 'Auto-Assigned';
  const slot          = st.slot;
  const bookedDate    = st.bookedDate;
  const isFastTrack   = st.isFastTrack;
  const hasEquipment  = st.hasEquipment;

  const name  = service.name  || 'Session';
  const price = service.price || 0;

  const [payNow, setPayNow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [notes, setNotes]     = useState('');

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };
  const formatSlot = (s) => {
    if (!s) return 'N/A';
    const [h, m] = s.split(':').map(Number);
    return `${((h % 12) || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const submit = async () => {
    // Must be logged in
    if (!user) {
      // Save booking state and redirect to BookingGate (patient auth page)
      sessionStorage.setItem('pendingBooking', JSON.stringify(location.state));
      navigate('/book/register', { state: { returnTo: '/book/checkout', bookingState: location.state } });
      return;
    }

    if (!clinicId || !service.id || !bookedDate || !slot) {
      setError('Missing booking details. Please go back and select a service and time.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('[Checkout] Submitting booking with user:', user);
      const booking = await api.post('/bookings', {
        clinicId,
        serviceId:   service.id,
        packageId:   service.package_id || null,
        visitMode,
        bookedDate,
        bookedTime:  slot,
        therapistId: therapistId || null,
        payNow:      false, // Always pay at clinic for now
        notes:       notes.trim() || null,
        patientConfirmedEquipment: hasEquipment || false,
      });

      console.log('[Checkout] Booking created:', booking);
      
      // Navigate to confirmation page with the booking details
      navigate('/book/confirmation', { state: {
        booking,
        primaryColor,
      }});
    } catch (err) {
      console.error('[Checkout] Error creating booking:', err);
      const errorMsg = err?.error?.message || err?.message || 'Failed to create booking. Please try again.';
      
      // If patient ID is missing, redirect to login
      if (errorMsg.toLowerCase().includes('patient') || errorMsg.toLowerCase().includes('authentication')) {
        sessionStorage.setItem('pendingBooking', JSON.stringify(location.state));
        navigate('/login/patient', { state: { returnTo: '/book/checkout', bookingState: location.state } });
        return;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-page">
      <header className="patient-header">
        <Link to="/book/time" state={location.state} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <span className="patient-header-logo">Checkout</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
          <Lock size={12} /> Secure
        </span>
      </header>

      <main className="patient-main" style={{ maxWidth: 600 }}>

        {/* Auth notice */}
        {!user && (
          <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 12, padding: '0.9rem 1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Lock size={18} color={primaryColor} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.88rem' }}>Login required to complete booking</div>
              <div style={{ color: '#3b82f6', fontSize: '0.8rem', marginTop: '0.1rem' }}>You'll be asked to sign in or register when you submit.</div>
            </div>
          </div>
        )}

        {/* Booking status notice */}
        <div style={{ background: '#fef3c7', border: '1.5px solid #fde68a', borderRadius: 12, padding: '0.9rem 1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Clock size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#78350f', fontSize: '0.88rem' }}>Booking will be Pending until confirmed by clinic</div>
            <div style={{ color: '#92400e', fontSize: '0.8rem', marginTop: '0.1rem' }}>You'll receive a confirmation email once the clinic approves your booking.</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '0.9rem 1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <div style={{ color: '#991b1b', fontSize: '0.88rem' }}>{error}</div>
          </div>
        )}

        {/* Order Summary */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            Order Summary
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.15rem' }}>
                {formatDate(bookedDate)} · {formatSlot(slot)} · {visitModeLabel}
              </div>
            </div>
            {price > 0 && <span style={{ fontWeight: 700 }}>LKR {Number(price).toLocaleString()}</span>}
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.875rem', marginTop: '0.875rem', fontSize: '0.875rem', color: '#475569' }}>
            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Allocated Resources</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div>👤 {therapistName}</div>
              <div>📍 {visitModeLabel}</div>
              {service.duration_minutes && <div>⏱ {service.duration_minutes} minutes</div>}
            </div>
          </div>
          {price > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px solid #e2e8f0' }}>
              <span>Total</span>
              <span style={{ color: primaryColor }}>LKR {Number(price).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Additional Notes (Optional)</h3>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="form-input"
            placeholder="Any symptoms, concerns, or instructions for the therapist..."
            style={{ minHeight: 80, resize: 'vertical' }} />
        </div>

        {/* Payment */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Payment Method</h3>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <button onClick={() => setPayNow(false)} style={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.85rem 1rem', border: `2px solid ${!payNow ? primaryColor : '#e2e8f0'}`, borderRadius: 12, background: !payNow ? `${primaryColor}08` : '#fff', cursor: 'pointer', textAlign: 'left' }}>
              <Building2 size={18} color={!payNow ? primaryColor : '#94a3b8'} />
              <div>
                <div style={{ fontWeight: 700, color: !payNow ? primaryColor : '#374151', fontSize: '0.88rem' }}>Pay at Clinic</div>
                <div style={{ fontSize: '0.75rem', color: !payNow ? primaryColor : '#94a3b8', marginTop: '0.1rem' }}>Pay at reception on arrival</div>
              </div>
            </button>
          </div>

          <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '0.9rem 1rem', fontSize: '0.85rem', color: '#166534', lineHeight: 1.5 }}>
            💡 You'll pay at the clinic reception on arrival. Your booking will remain <strong>Pending</strong> until the clinic confirms it.
          </div>

          <button className="btn-primary" onClick={submit} disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', marginTop: '1.25rem', background: loading ? '#94a3b8' : primaryColor }}>
            {loading ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : <><Clock size={15} /> Submit Booking</>}
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', margin: '0.5rem 0 0' }}>
            🔒 Booking Pending — confirmation required from the clinic.
          </p>
        </div>
      </main>
    </div>
  );
}
