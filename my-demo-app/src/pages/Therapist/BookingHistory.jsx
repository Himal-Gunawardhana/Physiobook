import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Calendar, Loader, AlertCircle, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function BookingHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await api.get('/bookings/my');
      const allBookings = Array.isArray(data) ? data : data?.bookings ?? [];
      setBookings(allBookings);
    } catch (err) {
      setError(err?.message || 'Failed to load booking history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.booked_date) - new Date(a.booked_date);
    } else if (sortBy === 'date-asc') {
      return new Date(a.booked_date) - new Date(b.booked_date);
    }
    return 0;
  });

  const statusColors = {
    confirmed: { bg: '#dbeafe', text: '#1e40af', label: 'Confirmed' },
    completed: { bg: '#dcfce7', text: '#15803d', label: 'Completed' },
    cancelled: { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' },
    in_progress: { bg: '#fef3c7', text: '#b45309', label: 'In Progress' },
    no_show: { bg: '#f3e8ff', text: '#6b21a8', label: 'No Show' },
  };

  return (
    <div className="animate-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/therapist/schedule')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#2563eb',
            fontWeight: 600,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ArrowLeft size={18} /> Back to Schedule
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem', fontWeight: 800 }}>Booking History</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            View all your past and completed bookings
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
              <Filter size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: '#fff',
              }}
            >
              <option value="all">All Bookings</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: '#fff',
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: '#64748b' }}>
            <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : error ? (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '1.5rem', color: '#991b1b', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>{error}</div>
          </div>
        ) : sortedBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem', color: '#94a3b8' }}>
            <Calendar size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>No bookings found</p>
            {filterStatus !== 'all' && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>
                Try adjusting the filter
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {sortedBookings.map((booking, index) => {
              const colors = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
              const borderColor = colors[index % colors.length];
              const bookingDate = new Date(booking.booked_date);
              const dateStr = bookingDate.toLocaleDateString('en-LK', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
              const statusInfo = statusColors[booking.status] || { bg: '#f3f4f6', text: '#374151', label: 'Unknown' };

              return (
                <div
                  key={booking.id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1.25rem',
                    borderLeft: `4px solid ${borderColor}`,
                    background: '#f8fafc',
                    borderRadius: '0 10px 10px 0',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ paddingRight: '1rem', borderRight: '1px solid #e2e8f0', minWidth: 90, flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{booking.booked_time || '—'}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>{dateStr}</div>
                    {booking.duration_minutes && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.1rem' }}>
                        {booking.duration_minutes} min
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                      {booking.patient_name || booking.patient?.name || '—'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      {booking.service_name || booking.service?.name || '—'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.35rem 0.8rem',
                          borderRadius: 6,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          background: statusInfo.bg,
                          color: statusInfo.text,
                        }}
                      >
                        {statusInfo.label}
                      </span>
                      {booking.notes && (
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          📝 Notes available
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      onClick={() =>
                        navigate('/therapist/notes', {
                          state: { bookingId: booking.id },
                        })
                      }
                      style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.78rem',
                        background: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
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
                      View Notes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
