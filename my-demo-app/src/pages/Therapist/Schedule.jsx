import React, { useState } from 'react';
import { User, Calendar, Star, CheckCircle, Clock } from 'lucide-react';

const APPOINTMENTS = [
  { id: 1, time: '10:00 AM', dur: '45 min', patient: 'John Doe',    service: 'Initial Assessment',        borderColor: '#2563eb' },
  { id: 2, time: '11:30 AM', dur: '30 min', patient: 'Jane Roe',    service: 'Follow-up Session',          borderColor: '#10b981' },
  { id: 3, time: '02:00 PM', dur: '60 min', patient: 'Ali Hassan',  service: 'Rehab Exercise Programme',   borderColor: '#8b5cf6' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = { Monday: '09:00 – 17:00', Tuesday: '09:00 – 17:00', Wednesday: 'Off', Thursday: '10:00 – 18:00', Friday: '09:00 – 15:00', Saturday: '09:00 – 13:00' };

export default function TherapistSchedule() {
  const [scheduleEdited, setScheduleEdited] = useState(false);

  return (
    <div className="animate-in">
      {/* Profile Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(to right, #eff6ff, #f8fafc)', border: '1px solid #bfdbfe', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={28} color="#1e40af" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: '0 0 0.3rem', fontSize: '1.25rem' }}>Dr. Sarah Smith</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
            <span className="badge badge-blue">Expert Level 3</span>
            <span style={{ color: '#64748b' }}>💼 12 Years Experience</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 700 }}>
              <Star size={13} fill="#f59e0b" /> 4.9 Patient Rating
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="stat-card" style={{ textAlign: 'center', padding: '0.75rem 1.25rem', minWidth: 100 }}>
            <div className="stat-label">Today</div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>3</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>sessions</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center', padding: '0.75rem 1.25rem', minWidth: 100 }}>
            <div className="stat-label">This Week</div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>17</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>sessions</div>
          </div>
        </div>
      </div>

      <div className="schedule-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 300px', gap: '1.5rem' }}>
        {/* Today's agenda */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Today's Appointments</h2>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {new Date().toLocaleDateString('en-LK', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {APPOINTMENTS.map((appt, i) => (
              <div key={appt.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderLeft: `4px solid ${appt.borderColor}`, background: '#f8fafc', borderRadius: '0 10px 10px 0' }}>
                <div style={{ paddingRight: '0.875rem', borderRight: '1px solid #e2e8f0', minWidth: 80, flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{appt.time}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>{appt.dur}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{appt.patient}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem' }}>{appt.service}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}>
                      <CheckCircle size={12} /> Start Session
                    </button>
                    <button className="btn-ghost" style={{ padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}>View Records</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Availability Manager */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '1rem', margin: '0 0 0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            <Calendar size={15} style={{ display: 'inline', marginRight: '0.4rem', marginBottom: -2 }} />
            Weekly Availability
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>Your schedule syncs with the clinic booking portal.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {DAYS.map(day => {
              const isOff = HOURS[day] === 'Off';
              return (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', opacity: isOff ? 0.5 : 1 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.87rem' }}>
                    <input type="checkbox" defaultChecked={!isOff} onChange={() => setScheduleEdited(true)} />
                    {day}
                  </label>
                  <span style={{ fontSize: '0.8rem', color: isOff ? '#ef4444' : '#2563eb', fontWeight: 500 }}>
                    {HOURS[day]}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            className={scheduleEdited ? 'btn-primary' : 'btn-ghost'}
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setScheduleEdited(false)}
          >
            {scheduleEdited ? 'Save Schedule ✓' : 'No Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
