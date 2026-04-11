import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Star, ArrowLeft, ArrowRight, Zap } from 'lucide-react';

const THERAPISTS = [
  { id: 1, name: 'Dr. Sarah Smith', spec: 'Sports Therapy',   rank: 'Expert L3',     exp: 12, rating: 4.9, available: true  },
  { id: 2, name: 'Dr. Mark Allen',  spec: 'Post-Op Rehab',    rank: 'Senior L2',     exp: 8,  rating: 4.7, available: true  },
  { id: 3, name: 'Dr. Emma Jones',  spec: 'Pre/Post-Natal',   rank: 'Specialist L1', exp: 5,  rating: 4.8, available: false },
];

const SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
const UNAVAILABLE = ['11:00 AM', '01:00 PM'];

const MODES = [
  { id: 'clinic', label: '🏥 Clinic',  desc: 'Visit us in-person' },
  { id: 'home',   label: '🏠 Home',    desc: 'We visit your location' },
  { id: 'online', label: '💻 Online',  desc: 'Video consultation' },
];

export default function SelectTime() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const service     = location.state?.service    || { name: 'General Session', equipment: 'None' };
  const isFastTrack = location.state?.isFastTrack || false;

  const [mode,         setMode]        = useState('clinic');
  const [therapistId,  setTherapistId] = useState('auto');
  const [slot,         setSlot]        = useState(null);
  const [hasEquip,     setHasEquip]    = useState(false);
  const [allocating,   setAllocating]  = useState(false);

  const requiresEquip  = service.equipment && service.equipment !== 'None';
  const homeBlocked    = mode === 'home' && requiresEquip && !hasEquip;
  const canContinue    = slot && !homeBlocked;

  const handleContinue = () => {
    if (!canContinue) return;
    const modeLabel = { clinic: 'Clinic Visit', home: 'Home Visit', online: 'Online Video Call' }[mode];

    let chosenTherapist;
    if (therapistId === 'auto') {
      setAllocating(true);
      chosenTherapist = [...THERAPISTS].filter(t => t.available).sort((a, b) =>
        b.rating !== a.rating ? b.rating - a.rating : b.exp - a.exp
      )[0];
      setTimeout(() => {
        navigate('/book/checkout', { state: {
          serviceName:       service.name,
          servicePrice:      service.price || 3500,
          visitMode:         modeLabel,
          assignedTherapist: `${chosenTherapist.name} (Auto-Assigned)`,
          assignedEquipment: mode === 'home' ? 'Patient-Provided' : (requiresEquip ? service.equipment : 'Standard Room'),
          slot,
        }});
      }, 1200);
    } else {
      chosenTherapist = THERAPISTS.find(t => t.id === therapistId);
      navigate('/book/checkout', { state: {
        serviceName:       service.name,
        servicePrice:      service.price || 3500,
        visitMode:         modeLabel,
        assignedTherapist: chosenTherapist.name,
        assignedEquipment: mode === 'home' ? 'Patient-Provided' : (requiresEquip ? service.equipment : 'Standard Room'),
        slot,
      }});
    }
  };

  return (
    <div className="patient-page">
      <header className="patient-header">
        <Link to="/book" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <span className="patient-header-logo">Book Appointment</span>
        <div />
      </header>

      <main className="patient-main">
        {/* Service banner */}
        <div style={{ background: isFastTrack ? 'linear-gradient(135deg, #0369a1, #0284c7)' : 'linear-gradient(135deg, #1e3a8a, #2563eb)', borderRadius: 14, padding: '1.25rem 1.5rem', color: 'white', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isFastTrack && <Zap size={24} color="#fbbf24" />}
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.2rem' }}>Booking for</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{service.name}</div>
            {isFastTrack && <div style={{ fontSize: '0.82rem', opacity: 0.85, marginTop: '0.15rem' }}>Express booking — just pick a time slot below.</div>}
            {requiresEquip && !isFastTrack && <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.2rem' }}>⚠ Requires {service.equipment}</div>}
          </div>
        </div>

        <div className="booking-layout">
          {/* Left — options */}
          <div className="booking-left">

            {/* Visit Mode */}
            {!isFastTrack && (
              <div>
                <h3 style={{ fontSize: '0.97rem', fontWeight: 700, marginBottom: '0.75rem' }}>Select Visit Mode</h3>
                <div className="mode-grid">
                  {MODES.map(m => (
                    <button key={m.id} className={`mode-btn ${mode === m.id ? 'selected' : ''}`} onClick={() => setMode(m.id)}>
                      <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{m.label.split(' ')[0]}</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>{m.label.split(' ').slice(1).join(' ')}</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>{m.desc}</div>
                    </button>
                  ))}
                </div>

                {mode === 'home' && requiresEquip && (
                  <div style={{ marginTop: '0.875rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '1rem' }}>
                    <p style={{ fontSize: '0.88rem', color: '#991b1b', marginBottom: '0.6rem' }}>
                      <strong>Important:</strong> This service requires <strong>{service.equipment}</strong> which cannot be transported. Home visits are only available if you already own this equipment.
                    </p>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={hasEquip} onChange={e => setHasEquip(e.target.checked)} style={{ marginTop: 2 }} />
                      <span style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>
                        I confirm I have an operational <strong>{service.equipment}</strong> at my home.
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Therapist Selection */}
            {!isFastTrack && (
              <div>
                <h3 style={{ fontSize: '0.97rem', fontWeight: 700, marginBottom: '0.75rem' }}>Choose Therapist</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {/* Auto-assign */}
                  <div
                    className={`therapist-card-select ${therapistId === 'auto' ? 'selected' : ''}`}
                    onClick={() => setTherapistId('auto')}
                    style={{ borderColor: therapistId === 'auto' ? '#2563eb' : '#bfdbfe' }}
                  >
                    <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: '0.2rem' }}>✨ Auto-Assign Best Match</div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>We'll pair you with the highest-rated available specialist for your time slot.</div>
                  </div>

                  {THERAPISTS.map(t => (
                    <div
                      key={t.id}
                      className={`therapist-card-select ${therapistId === t.id ? 'selected' : ''} ${!t.available ? '' : ''}`}
                      onClick={() => t.available && setTherapistId(t.id)}
                      style={{ opacity: t.available ? 1 : 0.5, cursor: t.available ? 'pointer' : 'not-allowed' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.3rem' }}>{t.spec}</div>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.45rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>
                            {t.rank} · {t.exp} yrs
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem' }}>
                            <Star size={13} fill="#f59e0b" /> {t.rating}
                          </span>
                          {!t.available && <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>Unavailable</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — time slots */}
          <div className="booking-right">
            <h3 style={{ fontSize: '0.97rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              {isFastTrack ? '⚡ Select Your Time' : 'Select Time Slot'}
            </h3>
            <div className="time-grid">
              {SLOTS.map(s => (
                <button
                  key={s}
                  className={`time-slot ${slot === s ? 'selected' : ''} ${UNAVAILABLE.includes(s) ? 'unavailable' : ''}`}
                  onClick={() => !UNAVAILABLE.includes(s) && setSlot(s)}
                  disabled={UNAVAILABLE.includes(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {slot && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>Booking Summary</div>
                  <div style={{ color: '#475569' }}>📅 {slot} · {isFastTrack ? 'Clinic Visit' : (mode.charAt(0).toUpperCase() + mode.slice(1))}</div>
                  {therapistId === 'auto' ? (
                    <div style={{ color: '#475569' }}>👤 Auto-assigning best therapist…</div>
                  ) : (
                    <div style={{ color: '#475569' }}>👤 {THERAPISTS.find(t => t.id === therapistId)?.name}</div>
                  )}
                </div>

                {homeBlocked && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.83rem', color: '#991b1b' }}>
                    ⛔ Please confirm you have the required equipment to enable Home Visit booking.
                  </div>
                )}

                <button
                  className="btn-primary"
                  onClick={handleContinue}
                  disabled={!canContinue || allocating}
                  style={{
                    width: '100%', justifyContent: 'center', padding: '0.875rem',
                    fontSize: '1rem', background: (!canContinue || allocating) ? '#94a3b8' : '#2563eb',
                    cursor: (!canContinue || allocating) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {allocating ? '⚡ Allocating best match…' : <>Continue to Payment <ArrowRight size={16} /></>}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
