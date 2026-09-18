import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Loader, AlertCircle, ChevronRight, Calendar } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import EpisodeStatusBadge from '../../components/records/EpisodeStatusBadge';

export default function MyPatients() {
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
    (async () => {
      try {
        const params = new URLSearchParams({ search, ...(statusFilter && { status: statusFilter }) }).toString();
        const data = await api.get(`/records/clinic/${clinicId}/patients${params ? `?${params}` : ''}`);
        setPatients(data.patients || []);
      } catch (err) { setError(err?.message || 'Failed to load patients'); }
      finally { setLoading(false); }
    })();
  }, [clinicId, search, statusFilter]);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Patients</h1>
          <p className="page-subtitle">Manage clinical records and treatment episodes for your assigned patients.</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.875rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients…"
            className="form-input" style={{ paddingLeft: '2.4rem', width: '100%' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '0.6rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: '0.88rem', color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '1rem', color: '#991b1b', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={16} /> {error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}><Loader size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} /><p>Loading your patients…</p></div>
      ) : patients.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Users size={48} style={{ opacity: 0.15, margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No Patients Found</h3>
          <p style={{ color: '#64748b', margin: 0 }}>Patients appear here once they have a confirmed booking with you.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr auto', gap: '1rem', padding: '0.75rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <span>Patient</span>
            <span>Active Episode</span>
            <span>Status</span>
            <span>Last Session</span>
            <span>Next Appt</span>
            <span></span>
          </div>
          {patients.map(p => (
            <button key={p.patient_id} onClick={() => navigate(`/therapist/patients/${p.patient_id}`)}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr auto', gap: '1rem', padding: '1rem 1.25rem', background: '#fff', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', textAlign: 'left', width: '100%', alignItems: 'center', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              {/* Patient */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #bfdbfe, #c4b5fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', color: '#1e40af', flexShrink: 0 }}>
                  {p.first_name?.[0]}{p.last_name?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{p.first_name} {p.last_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.email}</div>
                </div>
              </div>
              {/* Episode */}
              <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.episode_title || <span style={{ color: '#cbd5e1' }}>No episode</span>}
              </div>
              {/* Status */}
              <div>{p.episode_status ? <EpisodeStatusBadge status={p.episode_status} size="sm" /> : <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>—</span>}</div>
              {/* Last session */}
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {p.last_booking_date ? new Date(p.last_booking_date).toLocaleDateString('en-LK') : '—'}
              </div>
              {/* Next appt */}
              <div style={{ fontSize: '0.82rem', color: p.next_booking_date ? '#2563eb' : '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {p.next_booking_date ? <><Calendar size={13} />{new Date(p.next_booking_date).toLocaleDateString('en-LK')}</> : '—'}
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
