import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Lock } from 'lucide-react';

export default function Checkout() {
  const location = useLocation();
  const { serviceName, servicePrice, visitMode, assignedTherapist, assignedEquipment, slot } = location.state || {};
  const [done, setDone] = useState(false);

  const name    = serviceName       || 'General Session';
  const price   = servicePrice      || 3500;
  const mode    = visitMode         || 'Clinic Visit';
  const therapist = assignedTherapist || 'Dr. Sarah Smith';
  const equipment = assignedEquipment || 'Standard Room';
  const time    = slot              || '10:00 AM';

  if (done) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: 440 }}>
        <div style={{ width: 64, height: 64, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={32} color="#16a34a" />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Booking Confirmed!</h2>
        <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>
          Your <strong>{mode}</strong> appointment for <strong>{name}</strong> at <strong>{time}</strong> is confirmed.
        </p>
        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Assigned to: <strong>{therapist}</strong>. A confirmation has been sent to your email.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/book" className="btn-primary">Book Another</Link>
          <Link to="/" className="btn-ghost">Go to Portal</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="patient-page">
      <header className="patient-header">
        <Link to="/book/time" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <span className="patient-header-logo">Checkout</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
          <Lock size={12} /> Secure
        </span>
      </header>

      <main className="patient-main" style={{ maxWidth: 600 }}>
        {/* Order Summary Card */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            Order Summary
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.15rem' }}>{time} · {mode}</div>
            </div>
            <span style={{ fontWeight: 700 }}>LKR {price.toLocaleString()}</span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.875rem', marginTop: '0.875rem', fontSize: '0.875rem', color: '#475569' }}>
            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Allocated Resources</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div>👤 {therapist}</div>
              <div>🔧 {equipment}</div>
              <div>📍 {mode}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px solid #e2e8f0' }}>
            <span>Total</span>
            <span style={{ color: '#2563eb' }}>LKR {price.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Card */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Payment Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Cardholder Name</label>
              <input type="text" placeholder="John Doe" className="form-input" />
            </div>
            <div>
              <label className="form-label">Card Number</label>
              <input type="text" placeholder="4242 4242 4242 4242" className="form-input" maxLength={19} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Expiry</label>
                <input type="text" placeholder="MM / YY" className="form-input" maxLength={7} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">CVC</label>
                <input type="text" placeholder="123" className="form-input" maxLength={3} />
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => setDone(true)}
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              <Lock size={15} /> Pay LKR {price.toLocaleString()}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              🔒 Payments are encrypted and secure. This is a demo — no real charge.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
