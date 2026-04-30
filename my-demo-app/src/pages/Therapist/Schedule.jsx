import React, { useState, useEffect, useCallback } from 'react';
import { User, Calendar, Star, CheckCircle, Clock, Mail, X, FileText, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function TherapistSchedule() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [profile,       setProfile]       = useState(null);
  const [appointments,  setAppointments]  = useState([]);
  const [weekStats,     setWeekStats]     = useState({ today:0, week:0 });
  const [availability,  setAvailability]  = useState({});
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [scheduleEdited,setScheduleEdited]= useState(false);
  const [savingAvail,   setSavingAvail]   = useState(false);
  const [toast,         setToast]         = useState(null);
  const [newBooking,    setNewBooking]     = useState(null); // latest unread assignment

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [me, todayData, avail] = await Promise.all([
        api.get('/users/me'),
        api.get('/bookings/my?date=today'),
        api.get('/staff/me/availability').catch(() => ({})),
      ]);
      setProfile(me);
      const appts = Array.isArray(todayData) ? todayData : todayData?.bookings ?? [];
      setAppointments(appts);

      // Try to get week stats
      try {
        const weekData = await api.get('/bookings/my/stats');
        setWeekStats({ today: weekData.today ?? appts.length, week: weekData.week ?? 0 });
      } catch {
        setWeekStats({ today: appts.length, week: 0 });
      }

      setAvailability(avail || {});

      // Check for newest assigned booking not yet seen
      if (appts.length > 0) {
        const latest = [...appts].sort((a,b) => new Date(b.created_at||0) - new Date(a.created_at||0))[0];
        if (latest && !sessionStorage.getItem(`seen_booking_${latest.id}`)) {
          setNewBooking(latest);
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to load schedule.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const dismissBanner = () => {
    if (newBooking) sessionStorage.setItem(`seen_booking_${newBooking.id}`, '1');
    setNewBooking(null);
  };

  const startSession = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/start`);
      setAppointments(prev => prev.map(a => a.id === bookingId ? { ...a, status:'in_progress' } : a));
      showToast('Session started.');
    } catch (err) {
      showToast(`Error: ${err?.message}`);
    }
  };

  const saveAvailability = async () => {
    setSavingAvail(true);
    try {
      await api.put('/staff/me/availability', availability);
      showToast('Schedule saved.');
      setScheduleEdited(false);
    } catch (err) {
      showToast(`Error: ${err?.message}`);
    } finally {
      setSavingAvail(false);
    }
  };

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.name || profile.email
    : user?.email || 'Therapist';

  return (
    <div className="animate-in">
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, background:'#0f172a', color:'#fff', borderRadius:12, padding:'0.9rem 1.5rem', fontWeight:600, zIndex:9999, boxShadow:'0 4px 20px rgba(0,0,0,0.2)', fontSize:'0.9rem' }}>
          {toast}
        </div>
      )}

      {/* New Booking Banner */}
      {newBooking && (
        <div style={{ background:'linear-gradient(135deg, #dcfce7, #d1fae5)', border:'1.5px solid #86efac', borderRadius:14, padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'flex-start', gap:'0.75rem', position:'relative' }}>
          <Mail size={22} color="#16a34a" style={{ flexShrink:0, marginTop:2 }}/>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, color:'#14532d', fontSize:'0.95rem', marginBottom:'0.2rem' }}>
              📩 New Booking Assigned
            </div>
            <div style={{ color:'#166534', fontSize:'0.85rem', lineHeight:1.5 }}>
              <strong>{newBooking.patient_name || 'A patient'}</strong> has been assigned to you for <strong>{newBooking.service_name || 'a session'}</strong>
              {newBooking.booked_date ? ` on ${new Date(newBooking.booked_date).toLocaleDateString('en-LK')}` : ''}{newBooking.booked_time ? ` at ${newBooking.booked_time}` : ''}.
            </div>
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.6rem' }}>
              <button onClick={() => navigate('/therapist/notes')} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.4rem 0.85rem', background:'#16a34a', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:'0.82rem' }}>
                <FileText size={13}/> Open Session Notes
              </button>
              <button onClick={dismissBanner} style={{ padding:'0.4rem 0.85rem', background:'rgba(255,255,255,0.6)', color:'#374151', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer', fontSize:'0.82rem' }}>
                Dismiss
              </button>
            </div>
          </div>
          <button onClick={dismissBanner} style={{ background:'none', border:'none', cursor:'pointer', color:'#86efac', padding:0, flexShrink:0 }}><X size={16}/></button>
        </div>
      )}

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'4rem', color:'#64748b' }}>
          <Loader size={28} style={{ animation:'spin 1s linear infinite' }}/>
        </div>
      ) : error ? (
        <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:12, padding:'1.5rem', color:'#991b1b', marginBottom:'1.5rem' }}>
          <AlertCircle size={18} style={{ display:'inline', marginRight:'0.5rem' }}/>{error}
        </div>
      ) : (
        <>
          {/* Profile Banner */}
          <div className="card profile-banner" style={{ marginBottom:'1.5rem', background:'linear-gradient(to right, #eff6ff, #f8fafc)', border:'1px solid #bfdbfe' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'#bfdbfe', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <User size={28} color="#1e40af"/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <h2 style={{ margin:'0 0 0.3rem', fontSize:'1.25rem' }}>{displayName}</h2>
              <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', fontSize:'0.875rem' }}>
                {profile?.specialization && <span style={{ color:'#64748b' }}>🩺 {profile.specialization}</span>}
                {profile?.experience_years && <span style={{ color:'#64748b' }}>💼 {profile.experience_years} Years Experience</span>}
                {profile?.rating && (
                  <span style={{ display:'flex', alignItems:'center', gap:'0.2rem', color:'#f59e0b', fontWeight:700 }}>
                    <Star size={13} fill="#f59e0b"/> {Number(profile.rating).toFixed(1)} Rating
                  </span>
                )}
              </div>
            </div>
            <div className="profile-banner-stats">
              <div className="stat-card" style={{ textAlign:'center', padding:'0.75rem 1.25rem', minWidth:100 }}>
                <div className="stat-label">Today</div>
                <div className="stat-value" style={{ fontSize:'1.5rem' }}>{weekStats.today}</div>
                <div style={{ fontSize:'0.75rem', color:'#64748b' }}>sessions</div>
              </div>
              <div className="stat-card" style={{ textAlign:'center', padding:'0.75rem 1.25rem', minWidth:100 }}>
                <div className="stat-label">This Week</div>
                <div className="stat-value" style={{ fontSize:'1.5rem' }}>{weekStats.week}</div>
                <div style={{ fontSize:'0.75rem', color:'#64748b' }}>sessions</div>
              </div>
            </div>
          </div>

          <div className="schedule-grid">
            {/* Today's Appointments */}
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', paddingBottom:'0.75rem', borderBottom:'1px solid #e2e8f0' }}>
                <h2 style={{ fontSize:'1rem', margin:0 }}>Today's Appointments</h2>
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                  <span style={{ fontSize:'0.82rem', color:'#64748b' }}>
                    {new Date().toLocaleDateString('en-LK', { weekday:'long', month:'short', day:'numeric' })}
                  </span>
                  <button onClick={load} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b' }}>
                    <RefreshCw size={14}/>
                  </button>
                </div>
              </div>

              {appointments.length === 0 ? (
                <div style={{ textAlign:'center', padding:'2rem', color:'#94a3b8' }}>
                  <Calendar size={32} style={{ marginBottom:'0.5rem', opacity:0.4 }}/>
                  <p style={{ margin:0 }}>No appointments scheduled for today.</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                  {appointments.map((appt, i) => {
                    const colors = ['#2563eb','#10b981','#8b5cf6','#f59e0b','#ef4444'];
                    const bc = colors[i % colors.length];
                    return (
                      <div key={appt.id} style={{ display:'flex', gap:'1rem', padding:'1rem', borderLeft:`4px solid ${bc}`, background:'#f8fafc', borderRadius:'0 10px 10px 0' }}>
                        <div style={{ paddingRight:'0.875rem', borderRight:'1px solid #e2e8f0', minWidth:80, flexShrink:0 }}>
                          <div style={{ fontWeight:700, fontSize:'0.9rem' }}>{appt.booked_time || '—'}</div>
                          <div style={{ fontSize:'0.78rem', color:'#64748b', marginTop:'0.15rem' }}>{appt.duration_minutes ? `${appt.duration_minutes} min` : '—'}</div>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:700, marginBottom:'0.2rem' }}>{appt.patient_name || appt.patient?.name || '—'}</div>
                          <div style={{ fontSize:'0.82rem', color:'#64748b', marginBottom:'0.5rem' }}>{appt.service_name || appt.service?.name || '—'}</div>
                          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                            {appt.status !== 'in_progress' && appt.status !== 'completed' && (
                              <button className="btn-primary" style={{ padding:'0.3rem 0.7rem', fontSize:'0.78rem' }} onClick={() => startSession(appt.id)}>
                                <CheckCircle size={12}/> Start Session
                              </button>
                            )}
                            {appt.status === 'in_progress' && (
                              <span className="badge badge-blue">In Session</span>
                            )}
                            {appt.status === 'completed' && (
                              <span className="badge badge-green">Completed</span>
                            )}
                            <button className="btn-ghost" style={{ padding:'0.3rem 0.7rem', fontSize:'0.78rem' }}
                              onClick={() => navigate('/therapist/notes', { state: { bookingId: appt.id } })}>
                              View Records
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Availability Manager */}
            <div className="card" style={{ height:'fit-content' }}>
              <h2 style={{ fontSize:'1rem', margin:'0 0 0.75rem', paddingBottom:'0.75rem', borderBottom:'1px solid #e2e8f0' }}>
                <Calendar size={15} style={{ display:'inline', marginRight:'0.4rem', marginBottom:-2 }}/>
                Weekly Availability
              </h2>
              <p style={{ fontSize:'0.82rem', color:'#64748b', marginBottom:'1rem' }}>Your schedule syncs with the clinic booking portal.</p>

              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1.25rem' }}>
                {DAYS.map(day => {
                  const key = day.toLowerCase();
                  const entry = availability[key] || { enabled: day !== 'Wednesday', hours:'09:00 – 17:00' };
                  return (
                    <div key={day} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.4rem 0' }}>
                      <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontSize:'0.87rem', opacity: entry.enabled===false ? 0.5 : 1 }}>
                        <input type="checkbox" checked={entry.enabled !== false}
                          onChange={e => {
                            setAvailability(prev => ({ ...prev, [key]: { ...entry, enabled: e.target.checked } }));
                            setScheduleEdited(true);
                          }}
                        /> {day}
                      </label>
                      <span style={{ fontSize:'0.8rem', color: entry.enabled===false ? '#ef4444' : '#2563eb', fontWeight:500 }}>
                        {entry.enabled === false ? 'Off' : (entry.hours || '09:00 – 17:00')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                className={scheduleEdited ? 'btn-primary' : 'btn-ghost'}
                style={{ width:'100%', justifyContent:'center' }}
                onClick={scheduleEdited ? saveAvailability : undefined}
                disabled={savingAvail}
              >
                {savingAvail ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Saving…</> : scheduleEdited ? 'Save Schedule ✓' : 'No Changes'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
