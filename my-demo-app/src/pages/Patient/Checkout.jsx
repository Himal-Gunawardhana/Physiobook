import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Lock, Clock, CreditCard, Building2 } from 'lucide-react';

export default function Checkout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { serviceName, servicePrice, visitMode, assignedTherapist, assignedEquipment, slot } = location.state || {};

  const name      = serviceName      || 'General Session';
  const price     = servicePrice     || 3500;
  const mode      = visitMode        || 'Clinic Visit';
  const therapist = assignedTherapist || 'Dr. Sarah Smith';
  const equipment = assignedEquipment || 'Standard Room';
  const time      = slot             || '10:00 AM';

  const [payNow, setPayNow] = useState(true);

  const submit = () => {
    navigate('/book/confirmation');
  };

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

        {/* Booking status notice */}
        <div style={{ background: '#fef3c7', border: '1.5px solid #fde68a', borderRadius: 12, padding: '0.9rem 1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Clock size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#78350f', fontSize: '0.88rem' }}>Booking will be Pending until confirmed by clinic</div>
            <div style={{ color: '#92400e', fontSize: '0.8rem', marginTop: '0.1rem' }}>You'll receive a confirmation email once the clinic approves your booking.</div>
          </div>
        </div>

        {/* Order Summary */}
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

        {/* Payment Option */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Payment Method</h3>

          {/* Toggle */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { val: true,  Icon: CreditCard,  label: 'Pay Now Online', sub: 'Instant confirmation' },
              { val: false, Icon: Building2,   label: 'Pay at Clinic',  sub: 'Booking stays pending' },
            ].map(({ val, Icon, label, sub }) => (
              <button key={String(val)} onClick={() => setPayNow(val)} style={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.85rem 1rem', border: `2px solid ${payNow === val ? '#2563eb' : '#e2e8f0'}`, borderRadius: 12, background: payNow === val ? '#eff6ff' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                <Icon size={18} color={payNow === val ? '#2563eb' : '#94a3b8'} />
                <div>
                  <div style={{ fontWeight: 700, color: payNow === val ? '#1d4ed8' : '#374151', fontSize: '0.88rem' }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', color: payNow === val ? '#3b82f6' : '#94a3b8', marginTop: '0.1rem' }}>{sub}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Card fields (only when paying now) */}
          {payNow ? (
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
            </div>
          ) : (
            <div style={{ background: '#fef3c7', borderRadius: 10, padding: '0.9rem 1rem', fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
              💡 You'll pay at the clinic reception on arrival. Your booking will remain <strong>Pending</strong> until the clinic confirms it.
            </div>
          )}

          <button
            className="btn-primary"
            onClick={submit}
            style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', marginTop: '1.25rem' }}
          >
            {payNow ? <><Lock size={15} /> Pay LKR {price.toLocaleString()} & Submit</> : <><Clock size={15} /> Submit Booking (Pending)</>}
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', margin: '0.5rem 0 0' }}>
            🔒 {payNow ? 'Payments are encrypted and secure. This is a demo — no real charge.' : 'Booking Pending — confirmation required from the clinic.'}
          </p>
        </div>
      </main>
    </div>
  );
}
