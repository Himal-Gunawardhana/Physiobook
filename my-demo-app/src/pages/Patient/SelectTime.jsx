import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Star, ArrowLeft, ArrowRight, Zap, Calendar, Loader, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

const MODES = [
  { id: 'clinic', label: '🏥 Clinic',  desc: 'Visit us in-person' },
  { id: 'home',   label: '🏠 Home',    desc: 'We visit your location' },
  { id: 'online', label: '💻 Online',  desc: 'Video consultation' },
];

export default function SelectTime() {
  const navigate = useNavigate();
  const location = useLocation();
  const service     = location.state?.service    || {};
  const isFastTrack = location.state?.isFastTrack || false;
  const clinicId    = location.state?.clinicId;
  const clinicSlug  = location.state?.clinicSlug;
  const primaryColor = location.state?.primaryColor || '#2563eb';

  const [mode,        setMode]        = useState('clinic');
  const [therapistId, setTherapistId] = useState('auto');
  const [slot,        setSlot]        = useState(null);
  const [hasEquip,    setHasEquip]    = useState(false);
  const [allocating,  setAllocating]  = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const [therapists, setTherapists] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingTherapists, setLoadingTherapists] = useState(false);
  const [error, setError] = useState('');

  const requiresEquip = service.requires_equipment && service.requires_equipment !== 'None';
  const homeBlocked   = mode === 'home' && requiresEquip && !hasEquip;
  const canContinue   = slot && !homeBlocked;
  const duration      = service.duration_minutes || 30;

  // Load therapists
  useEffect(() => {
    if (!clinicId) return;
    setLoadingTherapists(true);
    api.get(`/clinics/${clinicId}/staff`).then(data => {
      const list = (Array.isArray(data) ? data : data?.rows ?? [])
        .filter(t => t.role_in_clinic === 'therapist' && t.status === 'available');
      setTherapists(list);
    }).catch(() => setTherapists([])).finally(() => setLoadingTherapists(false));
  }, [clinicId]);

  // Load available slots when date changes
  useEffect(() => {
    if (!clinicId || !selectedDate) return;
    setLoadingSlots(true); setSlot(null); setError('');
    const params = new URLSearchParams({ clinicId, date: selectedDate, serviceDuration: duration });
    if (therapistId !== 'auto') params.set('therapistId', therapistId);
    api.get(`/availability/slots?${params}`).then(data => {
      const s = data?.slots || (Array.isArray(data) ? data : []);
      setSlots(s);
    }).catch(err => {
      setSlots([]);
      setError(err?.message || 'Failed to load slots');
    }).finally(() => setLoadingSlots(false));
  }, [clinicId, selectedDate, duration, therapistId]);

  const handleContinue = () => {
    if (!canContinue) return;
    setAllocating(true);
    const modeLabel = { clinic: 'Clinic Visit', home: 'Home Visit', online: 'Online Video Call' }[mode];
    const chosenTherapist = therapistId !== 'auto' ? therapists.find(t => t.id === therapistId) : null;

    setTimeout(() => {
      navigate('/book/checkout', { state: {
        service, clinicId, clinicSlug, primaryColor,
        visitMode:     mode,
        visitModeLabel: modeLabel,
        therapistId:   therapistId === 'auto' ? null : therapistId,
        therapistName: chosenTherapist ? `${chosenTherapist.first_name} ${chosenTherapist.last_name}` : 'Auto-Assigned',
        slot,
        bookedDate:    selectedDate,
        isFastTrack,
        hasEquipment:  mode === 'home' ? hasEquip : undefined,
      }});
    }, therapistId === 'auto' ? 800 : 0);
  };

  // Date options (next 14 days)
  const dateOptions = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    dateOptions.push(d.toISOString().split('T')[0]);
  }
  const formatDate = (d) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  const formatSlot = (s) => {
    const [h, m] = s.split(':').map(Number);
    const ap = h >= 12 ? 'PM' : 'AM';
    return `${((h % 12) || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ap}`;
  };

  return (
    <div className="patient-page">
      <header className="patient-header">
        <Link to={clinicSlug ? `/book?${clinicSlug}` : '/book'} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <span className="patient-header-logo">Book Appointment</span>
        <div />
      </header>

      <main className="patient-main">
        {/* Service banner */}
        <div className="booking-banner" style={{ background: isFastTrack ? `linear-gradient(135deg, #0369a1, #0284c7)` : `linear-gradient(135deg, ${primaryColor}cc, ${primaryColor})` }}>
          {isFastTrack && <Zap size={24} color="#fbbf24" />}
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.2rem' }}>Booking for</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{service.name || 'Service'}</div>
            {isFastTrack && <div style={{ fontSize: '0.82rem', opacity: 0.85, marginTop: '0.15rem' }}>Express booking — just pick a time slot below.</div>}
            {requiresEquip && !isFastTrack && <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.2rem' }}>⚠ Requires {service.requires_equipment}</div>}
          </div>
        </div>

        <div className="booking-layout">
          {/* Left — options */}
          <div className="booking-left">

            {/* Date Selection */}
            <div>
              <h3 style={{ fontSize: '0.97rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={15} /> Select Date
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {dateOptions.map(d => (
                  <button key={d} onClick={() => setSelectedDate(d)}
                    style={{ padding: '0.5rem 0.85rem', borderRadius: 8, border: selectedDate === d ? `2px solid ${primaryColor}` : '1px solid #e2e8f0',
                      background: selectedDate === d ? `${primaryColor}10` : '#fff', color: selectedDate === d ? primaryColor : '#475569',
                      fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', flexShrink: 0 }}>
                    {formatDate(d)}
                  </button>
                ))}
              </div>
            </div>

            {/* Visit Mode */}
            {!isFastTrack && (
              <div>
                <h3 style={{ fontSize: '0.97rem', fontWeight: 700, marginBottom: '0.75rem' }}>Select Visit Mode</h3>
                <div className="mode-grid">
                  {MODES.map(m => (
                    <button key={m.id} className={`mode-btn ${mode === m.id ? 'selected' : ''}`} onClick={() => setMode(m.id)}
                      style={mode === m.id ? { borderColor: primaryColor, background: `${primaryColor}08` } : {}}>
                      <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{m.label.split(' ')[0]}</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>{m.label.split(' ').slice(1).join(' ')}</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>{m.desc}</div>
                    </button>
                  ))}
                </div>
                {mode === 'home' && requiresEquip && (
                  <div style={{ marginTop: '0.875rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '1rem' }}>
                    <p style={{ fontSize: '0.88rem', color: '#991b1b', marginBottom: '0.6rem' }}>
                      <strong>Important:</strong> This service requires <strong>{service.requires_equipment}</strong>. Home visits are only available if you already own this equipment.
                    </p>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={hasEquip} onChange={e => setHasEquip(e.target.checked)} style={{ marginTop: 2 }} />
                      <span style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>I confirm I have an operational <strong>{service.requires_equipment}</strong> at my home.</span>
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
                  <div className={`therapist-card-select ${therapistId === 'auto' ? 'selected' : ''}`}
                    onClick={() => setTherapistId('auto')}
                    style={{ borderColor: therapistId === 'auto' ? primaryColor : '#bfdbfe' }}>
                    <div style={{ fontWeight: 700, color: primaryColor, marginBottom: '0.2rem' }}>✨ Auto-Assign Best Match</div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>We'll pair you with the highest-rated available specialist.</div>
                  </div>
                  {loadingTherapists ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /></div>
                  ) : therapists.map(t => (
                    <div key={t.id}
                      className={`therapist-card-select ${therapistId === t.id ? 'selected' : ''}`}
                      onClick={() => setTherapistId(t.id)}
                      style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.first_name} {t.last_name}</div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.3rem' }}>{t.specialization || 'General'}</div>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.45rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>
                            {t.experience_years || 0} yrs exp
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem' }}>
                            <Star size={13} fill="#f59e0b" /> {Number(t.rating || 0).toFixed(1)}
                          </span>
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

            {loadingSlots ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Loading available slots...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem' }}>{error}</p>
              </div>
            ) : slots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <p style={{ fontSize: '0.88rem', marginBottom: '0.25rem' }}>No available slots for this date.</p>
                <p style={{ fontSize: '0.8rem' }}>Try selecting a different date or therapist.</p>
              </div>
            ) : (
              <div className="time-grid">
                {slots.map(s => (
                  <button key={s}
                    className={`time-slot ${slot === s ? 'selected' : ''}`}
                    onClick={() => setSlot(s)}
                    style={slot === s ? { borderColor: primaryColor, background: `${primaryColor}10`, color: primaryColor } : {}}>
                    {formatSlot(s)}
                  </button>
                ))}
              </div>
            )}

            {slot && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>Booking Summary</div>
                  <div style={{ color: '#475569' }}>📅 {formatDate(selectedDate)} · {formatSlot(slot)} · {isFastTrack ? 'Clinic Visit' : (mode.charAt(0).toUpperCase() + mode.slice(1))}</div>
                  <div style={{ color: '#475569' }}>👤 {therapistId === 'auto' ? 'Auto-assigning best therapist…' : `${therapists.find(t => t.id === therapistId)?.first_name} ${therapists.find(t => t.id === therapistId)?.last_name}`}</div>
                  {service.price > 0 && <div style={{ color: '#475569' }}>💰 LKR {Number(service.price).toLocaleString()}</div>}
                </div>

                {homeBlocked && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.83rem', color: '#991b1b' }}>
                    ⛔ Please confirm you have the required equipment to enable Home Visit booking.
                  </div>
                )}

                <button className="btn-primary" onClick={handleContinue} disabled={!canContinue || allocating}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem',
                    background: (!canContinue || allocating) ? '#94a3b8' : primaryColor,
                    cursor: (!canContinue || allocating) ? 'not-allowed' : 'pointer' }}>
                  {allocating ? '⚡ Allocating best match…' : <>Continue to Checkout <ArrowRight size={16} /></>}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
