import React, { useState, useEffect, useCallback } from 'react';
import { User, Calendar, Star, CheckCircle, Mail, X, FileText, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import TherapistProfileAvailability from '../../components/TherapistProfileAvailability';

export default function TherapistSchedule() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [weekStats, setWeekStats] = useState({ today: 0, week: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [newBooking, setNewBooking] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [me, upcomingData] = await Promise.all([
        api.get('/users/me'),
        api.get('/bookings/my'),
      ]);

      setProfile(me);

      const allAppts = Array.isArray(upcomingData) ? upcomingData : upcomingData?.bookings ?? [];
      
      // Filter to show only upcoming and current bookings (not completed or cancelled)
      const futureAppts = allAppts.filter(appt => {
        const apptDate = new Date(appt.booked_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return apptDate >= today && (appt.status === 'confirmed' || appt.status === 'in_progress');
      }).sort((a, b) => new Date(a.booked_date) - new Date(b.booked_date));

      setAppointments(futureAppts);

      try {
        const weekData = await api.get('/bookings/my/stats');
        setWeekStats({ today: weekData.today ?? 0, week: weekData.week ?? 0 });
      } catch {
        setWeekStats({ today: 0, week: 0 });
      }

      if (futureAppts.length > 0) {
        const latest = [...futureAppts].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0];
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

  useEffect(() => {
    load();
  }, [load]);

  const dismissBanner = () => {
    if (newBooking) sessionStorage.setItem(`seen_booking_${newBooking.id}`, '1');
    setNewBooking(null);
  };

  const startSession = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/start`);
      setAppointments((prev) => prev.map((a) => (a.id === bookingId ? { ...a, status: 'in_progress' } : a)));
      showToast('Session started.');
    } catch (err) {
      showToast(`Error: ${err?.message}`);
    }
  };

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.name || profile.email
    : user?.email || 'Therapist';

  return (
    <div className="animate-in">
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: '#0f172a',
            color: '#fff',
            borderRadius: 12,
            padding: '0.9rem 1.5rem',
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            fontSize: '0.9rem',
          }}
        >
          {toast}
        </div>
      )}

      {newBooking && (
        <div
          style={{
            background: 'linear-gradient(135deg, #dcfce7, #d1fae5)',
            border: '1.5px solid #86efac',
            borderRadius: 14,
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            position: 'relative',
          }}
        >
          <Mail size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: '#14532d', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
              📩 New Booking Assigned
            </div>
            <div style={{ color: '#166534', fontSize: '0.85rem', lineHeight: 1.5 }}>
              <strong>{newBooking.patient_name || 'A patient'}</strong> has been assigned to you for <strong>{newBooking.service_name || 'a session'}</strong>
              {newBooking.booked_date ? ` on ${new Date(newBooking.booked_date).toLocaleDateString('en-LK')}` : ''}
              {newBooking.booked_time ? ` at ${newBooking.booked_time}` : ''}.
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
              <button
                onClick={() => navigate('/therapist/notes')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.85rem',
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                <FileText size={13} /> Open Session Notes
              </button>
              <button
                onClick={dismissBanner}
                style={{
                  padding: '0.4rem 0.85rem',
                  background: 'rgba(255,255,255,0.6)',
                  color: '#374151',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
          <button onClick={dismissBanner} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86efac', padding: 0, flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#64748b' }}>
          <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '1.5rem', color: '#991b1b', marginBottom: '1.5rem' }}>
          <AlertCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
          {error}
        </div>
      ) : (
        <>
          <div className="card profile-banner" style={{ marginBottom: '1.5rem', background: 'linear-gradient(to right, #eff6ff, #f8fafc)', border: '1px solid #bfdbfe' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={28} color="#1e40af" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: '0 0 0.3rem', fontSize: '1.25rem' }}>{displayName}</h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                {profile?.specialization && <span style={{ color: '#64748b' }}>🩺 {profile.specialization}</span>}
                {profile?.experience_years && <span style={{ color: '#64748b' }}>💼 {profile.experience_years} Years Experience</span>}
                {profile?.rating && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 700 }}>
                    <Star size={13} fill="#f59e0b" /> {Number(profile.rating).toFixed(1)} Rating
                  </span>
                )}
              </div>
            </div>
            <div className="profile-banner-stats">
              <div className="stat-card" style={{ textAlign: 'center', padding: '0.75rem 1.25rem', minWidth: 100 }}>
                <div className="stat-label">Today</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{weekStats.today}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>sessions</div>
              </div>
              <div className="stat-card" style={{ textAlign: 'center', padding: '0.75rem 1.25rem', minWidth: 100 }}>
                <div className="stat-label">This Week</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{weekStats.week}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>sessions</div>
              </div>
            </div>
          </div>

          <div className="schedule-grid">
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1rem', margin: 0 }}>Upcoming Appointments</h2>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button 
                    onClick={() => navigate('/therapist/booking-history')}
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.82rem',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e5e7eb';
                      e.target.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f3f4f6';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  >
                    📋 View History
                  </button>
                  <button onClick={load} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {appointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  <Calendar size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                  <p style={{ margin: 0 }}>No upcoming appointments scheduled.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {appointments.map((appt, index) => {
                    const colors = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
                    const borderColor = colors[index % colors.length];
                    const apptDate = new Date(appt.booked_date);
                    const dateStr = apptDate.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' });

                    return (
                      <div key={appt.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderLeft: `4px solid ${borderColor}`, background: '#f8fafc', borderRadius: '0 10px 10px 0' }}>
                        <div style={{ paddingRight: '0.875rem', borderRight: '1px solid #e2e8f0', minWidth: 80, flexShrink: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{appt.booked_time || '—'}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>{dateStr}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{appt.duration_minutes ? `${appt.duration_minutes} min` : '—'}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{appt.patient_name || appt.patient?.name || '—'}</div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem' }}>{appt.service_name || appt.service?.name || '—'}</div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {appt.status !== 'in_progress' && appt.status !== 'completed' && (
                              <button className="btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.78rem' }} onClick={() => startSession(appt.id)}>
                                <CheckCircle size={12} /> Start Session
                              </button>
                            )}
                            {appt.status === 'in_progress' && <span className="badge badge-blue">In Session</span>}
                            {appt.status === 'completed' && <span className="badge badge-green">Completed</span>}
                            <button className="btn-ghost" style={{ padding: '0.3rem 0.7rem', fontSize: '0.78rem' }} onClick={() => navigate('/therapist/notes', { state: { bookingId: appt.id } })}>
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
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <TherapistProfileAvailability therapistId={user?.id} />
          </div>
        </>
      )}
    </div>
  );
}
