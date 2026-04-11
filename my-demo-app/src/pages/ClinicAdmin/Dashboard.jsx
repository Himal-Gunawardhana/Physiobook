import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrendingUp, Users, Calendar, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const recentBookings = [
  { id: 1, patient: 'John Doe',      service: 'Initial Assessment',             therapist: 'Dr. Sarah Smith', time: '10:00 AM', status: 'confirmed' },
  { id: 2, patient: 'Jane Roe',      service: 'Follow-up Session',              therapist: 'Dr. Mark Allen',  time: '11:30 AM', status: 'confirmed' },
  { id: 3, patient: 'Ali Hassan',    service: 'Short Wave Diathermy',           therapist: 'Dr. Emma Jones',  time: '01:00 PM', status: 'pending' },
  { id: 4, patient: 'Maria Garcia',  service: 'Post-Natal Exercises',           therapist: 'Dr. Sarah Smith', time: '02:30 PM', status: 'confirmed' },
  { id: 5, patient: 'David Lee',     service: 'Chest Physiotherapy',            therapist: 'Dr. Mark Allen',  time: '04:00 PM', status: 'cancelled' },
];

const STATUS = {
  confirmed: { cls: 'badge-green',  label: 'Confirmed', Icon: CheckCircle },
  pending:   { cls: 'badge-amber',  label: 'Pending',   Icon: Clock },
  cancelled: { cls: 'badge-red',    label: 'Cancelled', Icon: AlertCircle },
};

export default function ClinicDashboard() {
  const { activeClinic } = useOutletContext();

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{activeClinic?.name}</h1>
          <p className="page-subtitle">Dashboard Overview — Today, {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {[
          { label: "Today's Revenue",     value: 'LKR 42,800', delta: '+12% vs yesterday', Icon: DollarSign, color: '#10b981' },
          { label: 'Appointments Today',  value: '14',          delta: '3 remaining',       Icon: Calendar,   color: '#2563eb' },
          { label: 'Active Therapists',   value: '5',           delta: '1 on leave',        Icon: Users,      color: '#8b5cf6' },
          { label: 'Avg. Session Rating', value: '4.8 ★',       delta: 'Based on 32 reviews', Icon: TrendingUp, color: '#f59e0b' },
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

      {/* Recent Bookings */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Today's Bookings</h2>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{recentBookings.length} total</span>
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
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(b => {
                const s = STATUS[b.status] || STATUS.pending;
                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.patient}</td>
                    <td>{b.service}</td>
                    <td>{b.therapist}</td>
                    <td style={{ fontWeight: 500, color: '#2563eb' }}>{b.time}</td>
                    <td>
                      <span className={`badge ${s.cls}`}>{s.label}</span>
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
