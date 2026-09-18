import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Loader, AlertCircle, ChevronRight, Calendar, UserCheck, Flag } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import EpisodeStatusBadge from '../../components/records/EpisodeStatusBadge';

export default function PatientRecordsAdmin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const clinicId = user?.clinic_id;

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!clinicId) return;
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ search, ...(statusFilter && { status: statusFilter }), limit: 100 }).toString();
        const data = await api.get(`/records/clinic/${clinicId}/patients?${params}`);
        setPatients(data.patients || []);
      } catch (err) { setError(err?.message || 'Failed to load records'); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timeout);
  }, [clinicId, search, statusFilter]);

  const reviewOverdue = (p) => {
    if (!p.last_booking_date) return false;
    const daysSince = Math.floor((Date.now() - new Date(p.last_booking_date)) / (1000 * 60 * 60 * 24));
    return daysSince > 30 && p.episode_status === 'active';
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Records</h1>
          <p className="page-subtitle">View and manage clinical records across all patients in your clinic.</p>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Patients', value: patients.length, color: '#dbeafe', text: '#1e40af' },
          { label: 'Active Episodes', value: patients.filter(p => p.episode_status === 'active').length, color: '#dcfce7', text: '#166534' },
          { label: 'Completed', value: patients.filter(p => p.episode_status === 'completed').length, color: '#ede9fe', text: '#5b21b6' },
          { label: 'Review Due', value: patients.filter(reviewOverdue).length, color: '#fef3c7', text: '#92400e' },
        ].map(s => (
          <div key={s.label} style={{ background: s.color, borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.text }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: s.text, opacity: 0.75 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.875rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setLoading(true); }} placeholder="Search by name or email…"
            className="form-input" style={{ paddingLeft: '2.4rem', width: '100%' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '0.6rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: '0.88rem', color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '1rem', color: '#991b1b', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={16} /> {error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}><Loader size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} /></div>
      ) : patients.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Users size={48} style={{ opacity: 0.15, margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No Patients Found</h3>
          <p style={{ color: '#64748b', margin: 0 }}>Patient records appear here when bookings are made at your clinic.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Patient', 'Assigned Physio', 'Episode', 'Status', 'Last Session', 'Next Appt', ''].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.73rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map(p => {
                  const overdue = reviewOverdue(p);
                  return (
                    <tr key={p.patient_id}
                      onClick={() => navigate(`/clinic/patient-records/${p.patient_id}`)}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          {overdue && <Flag size={14} color="#d97706" title="Review overdue (>30 days)" />}
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>{p.first_name} {p.last_name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', color: '#374151' }}>
                        {p.physio_first ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <UserCheck size={13} color="#2563eb" /> {p.physio_first} {p.physio_last}
                          </div>
                        ) : <span style={{ color: '#cbd5e1' }}>Unassigned</span>}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', color: '#334155', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.episode_title || <span style={{ color: '#cbd5e1' }}>—</span>}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        {p.episode_status ? <EpisodeStatusBadge status={p.episode_status} size="sm" /> : <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>No Episode</span>}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                        {p.last_booking_date ? new Date(p.last_booking_date).toLocaleDateString('en-LK') : '—'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: p.next_booking_date ? '#2563eb' : '#cbd5e1' }}>
                        {p.next_booking_date ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Calendar size={13} /> {new Date(p.next_booking_date).toLocaleDateString('en-LK')}
                          </div>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}><ChevronRight size={16} color="#94a3b8" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
