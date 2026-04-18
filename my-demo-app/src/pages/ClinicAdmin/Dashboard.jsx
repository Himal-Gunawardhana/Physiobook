import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrendingUp, Users, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, Bell } from 'lucide-react';

const INIT_BOOKINGS = [
  { id: 1, patient: 'John Doe',     service: 'Initial Assessment',   therapist: 'Dr. Sarah Smith', time: '10:00 AM', status: 'pending' },
  { id: 2, patient: 'Jane Roe',     service: 'Follow-up Session',    therapist: 'Dr. Mark Allen',  time: '11:30 AM', status: 'confirmed' },
  { id: 3, patient: 'Ali Hassan',   service: 'Short Wave Diathermy', therapist: 'Dr. Emma Jones',  time: '01:00 PM', status: 'pending' },
  { id: 4, patient: 'Maria Garcia', service: 'Post-Natal Exercises', therapist: 'Dr. Sarah Smith', time: '02:30 PM', status: 'confirmed' },
  { id: 5, patient: 'David Lee',    service: 'Chest Physiotherapy',  therapist: 'Dr. Mark Allen',  time: '04:00 PM', status: 'cancelled' },
];

const STATUS = {
  confirmed: { cls: 'badge-green', label: 'Confirmed', Icon: CheckCircle },
  pending:   { cls: 'badge-amber', label: 'Pending',   Icon: Clock },
  cancelled: { cls: 'badge-red',   label: 'Cancelled', Icon: AlertCircle },
};

export default function ClinicDashboard() {
  const { activeClinic } = useOutletContext();
  const [bookings, setBookings] = useState(INIT_BOOKINGS);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');

  const confirm = (id) => {
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
    const b = bookings.find(b => b.id === id);
    setToast(`✅ Booking confirmed for ${b?.patient} — therapist notified by email`);
    setTimeout(() => setToast(null), 3500);
  };

  const shown = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const pending = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="animate-in">
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#0f172a', color: '#fff', borderRadius: 12, padding: '0.9rem 1.5rem', fontWeight: 600, zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: 360, fontSize: '0.9rem' }}>
          {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">{activeClinic?.name}</h1>
          <p className="page-subtitle">Dashboard Overview — Today, {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {pending > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fef3c7', color: '#92400e', borderRadius: 10, padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700 }}>
            <Bell size={15} /> {pending} booking{pending > 1 ? 's' : ''} pending confirmation
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {[
          { label: "Today's Revenue",     value: 'LKR 42,800', delta: '+12% vs yesterday',   Icon: DollarSign, color: '#10b981' },
          { label: 'Appointments Today',  value: '14',          delta: '3 remaining',          Icon: Calendar,   color: '#2563eb' },
          { label: 'Active Therapists',   value: '5',           delta: '1 on leave',           Icon: Users,      color: '#8b5cf6' },
          { label: 'Avg. Session Rating', value: '4.8 ★',       delta: 'Based on 32 reviews',  Icon: TrendingUp, color: '#f59e0b' },
        ].map(({ label, value, delta, Icon, color }) => (
          <div key={label} className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value" style={{ fontSize: '1.75rem' }}>{value}</div>
                <div className="stat-delta">{delta}</div>
              </div>
              <div style={{ background: `${color}15`, padding: '0.6rem', borderRadius: 10 }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Today's Bookings</h2>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.35rem 0.75rem', border: '1.5px solid', borderColor: filter === f ? '#2563eb' : '#e2e8f0', background: filter === f ? '#eff6ff' : '#fff', color: filter === f ? '#2563eb' : '#64748b', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Service</th>
                <th>Therapist</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(b => {
                const s = STATUS[b.status] || STATUS.pending;
                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.patient}</td>
                    <td>{b.service}</td>
                    <td>{b.therapist}</td>
                    <td style={{ fontWeight: 500, color: '#2563eb' }}>{b.time}</td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td>
                      {b.status === 'pending' ? (
                        <button onClick={() => confirm(b.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          <CheckCircle size={12} /> Confirm
                        </button>
                      ) : b.status === 'confirmed' ? (
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 7, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          <DollarSign size={12} /> Collect Payment
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
