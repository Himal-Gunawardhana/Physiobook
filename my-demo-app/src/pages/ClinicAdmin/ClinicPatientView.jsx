import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Loader, AlertCircle, FileText, Calendar, ClipboardList } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import EpisodeStatusBadge from '../../components/records/EpisodeStatusBadge';
import DocumentsTab from '../Therapist/tabs/DocumentsTab';

export default function ClinicPatientView() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const clinicId = user?.clinic_id;

  const [patient, setPatient] = useState(null);
  const [profile, setProfile] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [staff, setStaff] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeEpId, setActiveEpId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reassigning, setReassigning] = useState(false);
  const [selectedPhysio, setSelectedPhysio] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [profileData, epData, staffData] = await Promise.all([
          api.get(`/records/patients/${patientId}/profile?clinicId=${clinicId}`),
          api.get(`/records/patients/${patientId}/episodes?clinicId=${clinicId}`),
          api.get(`/staff/clinic/${clinicId}`),
        ]);
        setPatient(profileData.user);
        setProfile(profileData.profile);
        const eps = epData.episodes || [];
        setEpisodes(eps);
        const active = eps.find(e => e.status === 'active') || eps[0];
        if (active) setActiveEpId(active.id);
        setStaff(staffData?.staff || staffData || []);
      } catch (err) { setError(err?.message || 'Failed to load patient'); }
      finally { setLoading(false); }
    })();
  }, [patientId, clinicId]);

  useEffect(() => {
    if (!activeEpId) return;
    (async () => {
      try {
        const data = await api.get(`/records/episodes/${activeEpId}/sessions`);
        setSessions(data.sessions || []);
      } catch (_) {}
    })();
  }, [activeEpId]);

  const reassign = async () => {
    if (!selectedPhysio || !activeEpId) return;
    setReassigning(true); setError(''); setSuccess('');
    try {
      await api.post(`/records/episodes/${activeEpId}/reassign`, {
        newTherapistStaffId: selectedPhysio, clinicId,
        notes: 'Reassigned by clinic admin',
      });
      setSuccess('Physiotherapist reassigned successfully.');
      // Refresh episodes
      const data = await api.get(`/records/patients/${patientId}/episodes?clinicId=${clinicId}`);
      setEpisodes(data.episodes || []);
    } catch (err) { setError(err?.message || 'Failed to reassign'); }
    finally { setReassigning(false); }
  };

  const activeEpisode = episodes.find(e => e.id === activeEpId);
  const TABS = [{ id: 'overview', label: 'Overview' }, { id: 'sessions', label: 'Sessions' }, { id: 'documents', label: 'Documents' }];

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}><Loader size={32} style={{ animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div className="animate-in">
      {/* Back + Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/clinic/patient-records')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.875rem', background: '#f1f5f9', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151', cursor: 'pointer' }}>
          <ArrowLeft size={15} /> Patient Records
        </button>
        {patient && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
              {patient.first_name?.[0]}{patient.last_name?.[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{patient.first_name} {patient.last_name}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{patient.email} {patient.phone && `· ${patient.phone}`}</div>
            </div>
          </div>
        )}
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', color: '#991b1b', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={16} /> {error}</div>}
      {success && <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '0.75rem 1rem', color: '#166534', marginBottom: '1rem', fontSize: '0.85rem' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left Column — Episodes + Reassignment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>Treatment Episodes</div>
            {episodes.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>No episodes yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {episodes.map(ep => (
                  <button key={ep.id} onClick={() => setActiveEpId(ep.id)}
                    style={{ textAlign: 'left', padding: '0.65rem 0.75rem', borderRadius: 9, background: activeEpId === ep.id ? '#eff6ff' : '#f8fafc', border: activeEpId === ep.id ? '1.5px solid #bfdbfe' : '1.5px solid #e2e8f0', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a', marginBottom: '0.3rem' }}>{ep.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <EpisodeStatusBadge status={ep.status} size="sm" />
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(ep.start_date).toLocaleDateString('en-LK')}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reassign Physio */}
          {activeEpisode && activeEpisode.status === 'active' && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserCheck size={14} /> Assign Physiotherapist
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.75rem' }}>
                Current: <strong style={{ color: '#0f172a' }}>{activeEpisode.physio_first ? `${activeEpisode.physio_first} ${activeEpisode.physio_last}` : 'Unassigned'}</strong>
              </p>
              <select value={selectedPhysio} onChange={e => setSelectedPhysio(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', marginBottom: '0.625rem' }}>
                <option value="">Select physiotherapist…</option>
                {staff.filter(s => s.role_in_clinic === 'therapist' || s.role === 'therapist').map(s => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                ))}
              </select>
              <button onClick={reassign} disabled={reassigning || !selectedPhysio}
                style={{ width: '100%', padding: '0.6rem', background: selectedPhysio ? '#2563eb' : '#e2e8f0', color: selectedPhysio ? '#fff' : '#94a3b8', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: selectedPhysio ? 'pointer' : 'not-allowed' }}>
                {reassigning ? 'Reassigning…' : 'Reassign'}
              </button>
            </div>
          )}

          {/* Clinical Profile Summary */}
          {profile && (
            <div className="card" style={{ padding: '1.25rem', fontSize: '0.82rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>Clinical Profile</div>
              {[['Allergies', profile.allergies], ['Precautions', profile.precautions], ['Medications', profile.current_medications], ['Referring Clinician', profile.referring_clinician]].filter(([_, v]) => v).map(([label, val]) => (
                <div key={label} style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 600, color: '#374151' }}>{label}</div>
                  <div style={{ color: '#64748b', marginTop: '0.15rem' }}>{val}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column — Tab Content */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ padding: '0.875rem 1.1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === t.id ? 700 : 500, color: activeTab === t.id ? '#2563eb' : '#64748b', borderBottom: activeTab === t.id ? '2.5px solid #2563eb' : '2.5px solid transparent' }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '1.5rem' }}>
            {!activeEpisode ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Select an episode on the left.</div>
            ) : activeTab === 'overview' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { label: 'Sessions', value: sessions.length, color: '#dbeafe', text: '#1e40af' },
                    { label: 'Last Session', value: sessions[0] ? new Date(sessions[0].session_date).toLocaleDateString('en-LK') : '—', color: '#dcfce7', text: '#166534' },
                    { label: 'Episode Start', value: new Date(activeEpisode.start_date).toLocaleDateString('en-LK'), color: '#ede9fe', text: '#5b21b6' },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.color, borderRadius: 10, padding: '0.875rem', textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: s.text }}>{s.value}</div>
                      <div style={{ fontSize: '0.72rem', color: s.text, opacity: 0.8 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Recent Sessions</div>
                  {sessions.slice(0, 5).map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                        <Calendar size={13} color="#2563eb" />
                        {new Date(s.session_date).toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short' })}
                        <span style={{ color: '#94a3b8' }}>· {s.therapist_first} {s.therapist_last}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: 20, background: s.status === 'finalized' ? '#ede9fe' : '#fef3c7', color: s.status === 'finalized' ? '#5b21b6' : '#92400e', fontWeight: 600 }}>{s.status}</span>
                    </div>
                  ))}
                  {sessions.length === 0 && <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>No sessions recorded yet.</p>}
                </div>
              </div>
            ) : activeTab === 'sessions' ? (
              <div>
                {sessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No session records.</div>
                ) : sessions.map(s => (
                  <div key={s.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', marginBottom: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>{new Date(s.session_date).toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <EpisodeStatusBadge status={s.status} size="sm" />
                    </div>
                    {s.subjective && <p style={{ margin: '0 0 0.25rem', fontSize: '0.83rem', color: '#334155' }}><strong>S:</strong> {s.subjective}</p>}
                    {s.objective && <p style={{ margin: '0 0 0.25rem', fontSize: '0.83rem', color: '#334155' }}><strong>O:</strong> {s.objective}</p>}
                    {s.assessment && <p style={{ margin: '0 0 0.25rem', fontSize: '0.83rem', color: '#334155' }}><strong>A:</strong> {s.assessment}</p>}
                    {s.plan && <p style={{ margin: 0, fontSize: '0.83rem', color: '#334155' }}><strong>P:</strong> {s.plan}</p>}
                  </div>
                ))}
              </div>
            ) : activeTab === 'documents' ? (
              <DocumentsTab episode={activeEpisode} clinicId={clinicId} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
