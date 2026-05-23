import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Star, ArrowLeft, ArrowRight, Zap, Calendar, Loader, AlertCircle, User } from 'lucide-react';
import api from '../../lib/api';
import TimeSlotDragSelector from '../../components/TimeSlotDragSelector';

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

  const [therapists] = useState(location.state?.therapists || []);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [therapistAvailability, setTherapistAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const requiresEquip = service.requires_equipment && service.requires_equipment !== 'None';
  const homeBlocked   = mode === 'home' && requiresEquip && !hasEquip;
  const canContinue   = slot && !homeBlocked;
  const duration      = service.duration_minutes || 30;

  // Min/Max dates for the date picker
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate  = new Date(); maxDate.setDate(maxDate.getDate() + 60);
  const minDateStr = tomorrow.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const getSelectedDayName = () => {
    const date = new Date(`${selectedDate}T00:00:00`);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = ((hour % 12) || 12).toString().padStart(2, '0');
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const formatAvailabilityLabel = (availability) => {
    if (!availability?.available) return 'Off';
    return `${formatTime(availability.start_time)} - ${formatTime(availability.end_time)}`;
  };

  const selectedDayName = getSelectedDayName();
  const selectedDayAvailability = therapistAvailability?.[selectedDayName];
  const selectedDayWindowLabel = formatAvailabilityLabel(selectedDayAvailability);

  // Load available slots when date or therapist changes
  useEffect(() => {
    if (!clinicId || !selectedDate) return;
    
    // Check if therapist is available on this day (if specific therapist selected)
    if (therapistId !== 'auto' && therapistAvailability) {
      const dayName = getSelectedDayName();
      const dayAvailability = therapistAvailability[dayName];
      if (!dayAvailability?.available) {
        // Therapist not available on this day
        setSlots([]);
        setSlot(null);
        return;
      }
    }
    
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
  }, [clinicId, selectedDate, duration, therapistId, therapistAvailability]);

  useEffect(() => {
    if (therapistId === 'auto') {
      setTherapistAvailability(null);
      return;
    }

    const therapist = therapists.find((t) => t.id === therapistId);
    if (!therapist?.id) {
      setTherapistAvailability(null);
      return;
    }

    setLoadingAvailability(true);
    // Use user_id if available, fall back to id for the public-availability API
    const userId = therapist.user_id || therapist.id;
    api.get(`/staff/${userId}/public-availability`)
      .then((data) => {
        console.log('Therapist availability loaded:', data);
        setTherapistAvailability(data?.availability || null);
      })
      .catch((err) => {
        console.error('Error loading therapist availability:', err);
        setTherapistAvailability(null);
      })
      .finally(() => setLoadingAvailability(false));
  }, [therapistId, therapists]);

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

  const formatDate = (d) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };
  const formatSlot = (s) => {
    if (!s) return '';
    const [h, m] = s.split(':').map(Number);
    const ap = h >= 12 ? 'PM' : 'AM';
    return `${((h % 12) || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ap}`;
  };

  return (
    <div className="patient-page" style={{ overflow: 'hidden' }}>
      <header className="patient-header">
        <Link to={clinicSlug ? `/book?${clinicSlug}` : '/book'} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.9rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <span className="patient-header-logo" style={{ color: primaryColor }}>Book Appointment</span>
        <div />
      </header>

      <main className="patient-main" style={{ maxWidth: 920, overflow: 'visible' }}>
        {/* Service banner */}
        <div className="booking-banner" style={{ background: isFastTrack ? 'linear-gradient(135deg, #0369a1, #0284c7)' : `linear-gradient(135deg, ${primaryColor}cc, ${primaryColor})`, borderRadius: 14, padding: '1.25rem 1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.75rem' }}>
          {isFastTrack && <Zap size={24} color="#fbbf24" />}
          <div>
            <div style={{ fontSize: '0.78rem', opacity: 0.8, marginBottom: '0.15rem' }}>Booking for</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{service.name || 'Service'}</div>
            {service.price > 0 && <div style={{ fontSize: '0.82rem', opacity: 0.85, marginTop: '0.1rem' }}>LKR {Number(service.price).toLocaleString()} · {duration} min</div>}
            {isFastTrack && <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.1rem' }}>Express booking — pick a date and time below.</div>}
            {requiresEquip && !isFastTrack && <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.15rem' }}>⚠ Requires {service.requires_equipment}</div>}
          </div>
        </div>

        {/* 2-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>

            {/* Date Picker */}
            <div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a' }}>
                <Calendar size={15} color={primaryColor} /> Select Date
              </h3>
              <input type="date" value={selectedDate}
                min={minDateStr} max={maxDateStr}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 10, border: `1.5px solid ${primaryColor}40`, background: '#fff', color: '#0f172a', fontSize: '0.92rem', fontWeight: 600, fontFamily: 'inherit', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = primaryColor}
                onBlur={e => e.target.style.borderColor = `${primaryColor}40`} />
              {selectedDate && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: '#64748b' }}>
                  📅 {formatDate(selectedDate)}
                </div>
              )}
            </div>

            {/* Visit Mode */}
            {!isFastTrack && (
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.6rem', color: '#0f172a' }}>Select Visit Mode</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                  {MODES.map(m => (
                    <button key={m.id} onClick={() => setMode(m.id)}
                      style={{ padding: '0.7rem 0.4rem', borderRadius: 10, border: mode === m.id ? `2px solid ${primaryColor}` : '1.5px solid #e2e8f0', background: mode === m.id ? `${primaryColor}08` : '#fff', color: mode === m.id ? primaryColor : '#64748b', fontWeight: 600, fontSize: '0.82rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <div style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{m.label.split(' ')[0]}</div>
                      <div style={{ fontSize: '0.72rem' }}>{m.desc}</div>
                    </button>
                  ))}
                </div>
                {mode === 'home' && requiresEquip && (
                  <div style={{ marginTop: '0.75rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.85rem' }}>
                    <p style={{ fontSize: '0.82rem', color: '#991b1b', marginBottom: '0.5rem', margin: 0 }}>
                      <strong>Important:</strong> Requires <strong>{service.requires_equipment}</strong>.
                    </p>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', marginTop: '0.4rem' }}>
                      <input type="checkbox" checked={hasEquip} onChange={e => setHasEquip(e.target.checked)} style={{ marginTop: 2 }} />
                      <span style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>I confirm I have this equipment at home.</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Therapist Selection */}
            {!isFastTrack && (
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.6rem', color: '#0f172a' }}>Choose Therapist</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 300, overflowY: 'auto' }}>
                  {/* Auto-assign option */}
                  <div onClick={() => setTherapistId('auto')}
                    style={{ padding: '0.75rem 1rem', borderRadius: 10, border: therapistId === 'auto' ? `2px solid ${primaryColor}` : '1.5px solid #e2e8f0', background: therapistId === 'auto' ? `${primaryColor}08` : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <div style={{ fontWeight: 700, color: primaryColor, fontSize: '0.88rem', marginBottom: '0.15rem' }}>✨ Auto-Assign Best Match</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Highest-rated available specialist</div>
                  </div>

                  {therapists.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '0.75rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                      No therapists found for this clinic.
                    </div>
                  ) : therapists.map(t => (
                    <div key={t.id} onClick={() => setTherapistId(t.id)}
                      style={{ padding: '0.75rem 1rem', borderRadius: 10, border: therapistId === t.id ? `2px solid ${primaryColor}` : '1.5px solid #e2e8f0', background: therapistId === t.id ? `${primaryColor}08` : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{t.first_name} {t.last_name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>{t.specialization || 'General Physiotherapy'}</div>
                          <span style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600 }}>
                            {t.experience_years || 0} yrs exp
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                          <Star size={12} fill="#f59e0b" /> {Number(t.rating || 0).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Time Slots */}
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.6rem', color: '#0f172a' }}>
              {isFastTrack ? '⚡ Select Your Time' : 'Available Time Slots'}
            </h3>

            {therapistId !== 'auto' && (
              <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>Therapist Availability</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatDate(selectedDate)}</div>
                </div>

                {loadingAvailability ? (
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Loading therapist schedule...</div>
                ) : therapistAvailability ? (() => {
                  const dayAvailability = selectedDayAvailability;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', padding: '0.7rem 0.85rem', borderRadius: 10, background: dayAvailability?.available ? '#ecfdf5' : '#f8fafc', border: `1px solid ${dayAvailability?.available ? '#a7f3d0' : '#e2e8f0'}` }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedDayName}</span>
                        <span style={{ color: dayAvailability?.available ? '#047857' : '#64748b', fontWeight: 600 }}>
                          {selectedDayWindowLabel}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {dayAvailability?.available
                          ? 'Only time slots inside this window are shown below.'
                          : 'The selected therapist is not available on this date.'}
                      </div>
                    </div>
                  );
                })() : (
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>No public availability found for this therapist.</div>
                )}
              </div>
            )}

            {loadingSlots ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
                <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>Loading available slots...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                <AlertCircle size={22} style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.82rem' }}>{error}</p>
              </div>
            ) : (therapistId !== 'auto' && therapistAvailability && !therapistAvailability[selectedDayName]?.available) ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0' }}>
                <Calendar size={28} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.88rem', margin: '0 0 0.25rem', fontWeight: 600 }}>Therapist not available</p>
                <p style={{ fontSize: '0.78rem', margin: 0 }}>Choose a different date.</p>
              </div>
            ) : slots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0' }}>
                <Calendar size={28} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.88rem', margin: '0 0 0.25rem', fontWeight: 600 }}>No slots available</p>
                <p style={{ fontSize: '0.78rem', margin: 0 }}>Try a different date or therapist.</p>
              </div>
            ) : (
              <div style={{ padding: '0.85rem', borderRadius: 12, border: `1px solid ${primaryColor}40`, background: '#f0fdf4' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                  Available time slots
                </div>

                <TimeSlotDragSelector
                  slots={slots}
                  duration={duration}
                  selectedDate={selectedDate}
                  onSelectSlot={(slotTime) => {
                    setSlot(slotTime);
                  }}
                  primaryColor={primaryColor}
                  startHour={6}
                  endHour={22}
                />
              </div>
            )}

            {/* Booking Summary */}
            {slot && (
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', marginBottom: '0.85rem', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Booking Summary</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: '#475569' }}>
                    <div>📅 {formatDate(selectedDate)}</div>
                    <div>🕐 {formatSlot(slot)} · {duration} min</div>
                    <div>📍 {isFastTrack ? 'Clinic Visit' : { clinic: 'Clinic Visit', home: 'Home Visit', online: 'Online Call' }[mode]}</div>
                    <div>👤 {therapistId === 'auto' ? 'Auto-assigning best therapist…' : `${therapists.find(t => t.id === therapistId)?.first_name} ${therapists.find(t => t.id === therapistId)?.last_name}`}</div>
                    {service.price > 0 && <div>💰 LKR {Number(service.price).toLocaleString()}</div>}
                  </div>
                </div>

                {homeBlocked && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.7rem', marginBottom: '0.85rem', fontSize: '0.8rem', color: '#991b1b' }}>
                    ⛔ Please confirm you have the required equipment.
                  </div>
                )}

                <button onClick={handleContinue} disabled={!canContinue || allocating}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem', border: 'none', borderRadius: 12, fontSize: '0.95rem', fontWeight: 700, color: '#fff', background: (!canContinue || allocating) ? '#94a3b8' : primaryColor, cursor: (!canContinue || allocating) ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                  {allocating ? '⚡ Allocating best match…' : <>Continue to Checkout <ArrowRight size={16} /></>}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Responsive: stack columns on mobile */}
      <style>{`
        @media (max-width: 700px) {
          .patient-main > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
