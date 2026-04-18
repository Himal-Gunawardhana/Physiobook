import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Mail, MessageCircle, Calendar, ArrowRight } from 'lucide-react';

const BOOKING = {
  ref: 'PB-2024-0042',
  service: 'Lower Back Rehabilitation',
  therapist: 'Dr. Aisha Perera',
  date: 'Saturday, 20 April 2024',
  time: '10:00 AM – 11:00 AM',
  mode: 'Clinic Visit',
  price: 'LKR 4,500',
  paymentMethod: 'Pay at Clinic',
};

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const patient = JSON.parse(sessionStorage.getItem('pb_patient') || '{"name":"Patient","email":"you@example.com"}');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Status Banner */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: '#fef3c7', borderRadius: '50%', marginBottom: '1rem' }}>
            <Clock size={32} color="#f59e0b" />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#fef3c7', color: '#92400e', borderRadius: 20, padding: '0.35rem 1rem', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Clock size={12} /> BOOKING PENDING
          </div>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Booking Request Received!</h1>
          <p style={{ margin: 0, color: '#64748b', lineHeight: 1.6 }}>
            Your booking is <strong>pending confirmation</strong> from {BOOKING.therapist}. You'll be notified once it's confirmed.
          </p>
        </div>

        {/* Email notice */}
        <div style={{ background: '#dcfce7', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Mail size={20} color="#16a34a" />
          <div>
            <div style={{ fontWeight: 700, color: '#14532d', fontSize: '0.9rem' }}>Confirmation Email Sent</div>
            <div style={{ color: '#166534', fontSize: '0.82rem' }}>Sent to {patient.email}</div>
          </div>
        </div>

        {/* Booking Details */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Booking Details</h3>
          {[
            { label: 'Reference', value: BOOKING.ref },
            { label: 'Service', value: BOOKING.service },
            { label: 'Therapist', value: BOOKING.therapist },
            { label: 'Date', value: BOOKING.date, icon: <Calendar size={14} /> },
            { label: 'Time', value: BOOKING.time, icon: <Clock size={14} /> },
            { label: 'Visit Mode', value: BOOKING.mode },
            { label: 'Amount', value: BOOKING.price },
            { label: 'Payment', value: BOOKING.paymentMethod },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b', fontSize: '0.88rem' }}>{row.label}</span>
              <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>{row.icon}{row.value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/book/my-bookings')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.9rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
          >
            <Calendar size={18} /> View My Bookings <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/book')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.9rem', background: 'transparent', color: '#2563eb', border: '1.5px solid #2563eb', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
          >
            <MessageCircle size={18} /> Message Your Therapist (Optional)
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
          You can cancel or reschedule from My Bookings up to 24hrs before the session.
        </p>
      </div>
    </div>
  );
}
