import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Loader, AlertCircle, User } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import EpisodeStatusBadge from '../../components/records/EpisodeStatusBadge';

const AssessmentTab    = lazy(() => import('./tabs/AssessmentTab'));
const TreatmentPlanTab = lazy(() => import('./tabs/TreatmentPlanTab'));
const SessionsTab      = lazy(() => import('./tabs/SessionsTab'));
const ProgressTab      = lazy(() => import('./tabs/ProgressTab'));
const DocumentsTab     = lazy(() => import('./tabs/DocumentsTab'));
const DischargeTab     = lazy(() => import('./tabs/DischargeTab'));

const TABS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'assessment',label: 'Assessment' },
  { id: 'plan',      label: 'Treatment Plan' },
  { id: 'sessions',  label: 'Sessions' },
  { id: 'progress',  label: 'Progress' },
  { id: 'documents', label: 'Documents' },
  { id: 'discharge', label: 'Discharge' },
];

function OverviewTab({ episode, patient, sessions, goals, lastReview }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
      {/* Episode Summary */}
      <div style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: '#fff', borderRadius: 14, padding: '1.5rem', gridColumn: '1 / -1' }}>
        <div style={{ fontSize: '0.78rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Active Episode</div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{episode.title}</div>
        {episode.condition && <div style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '0.25rem' }}>{episode.condition}</div>}
        {episode.affected_region && <div style={{ fontSize: '0.82rem', opacity: 0.7, marginTop: '0.2rem' }}>{episode.affected_region} {episode.affected_side && `· ${episode.affected_side}`}</div>}
        <div style={{ marginTop: '1rem', fontSize: '0.82rem', opacity: 0.8 }}>
          Started {new Date(episode.start_date).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      {[
        { label: 'Sessions Completed', value: sessions.length, color: '#dbeafe', textColor: '#1e40af' },
        { label: 'Goals Set', value: goals.length, color: '#dcfce7', textColor: '#166534' },
        { label: 'Last Session', value: sessions[0] ? new Date(sessions[0].session_date).toLocaleDateString('en-LK') : 'None yet', color: '#ede9fe', textColor: '#5b21b6' },
      ].map(stat => (
        <div key={stat.label} style={{ background: stat.color, borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: stat.textColor, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{stat.label}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.textColor }}>{stat.value}</div>
        </div>
      ))}

      {/* Episode Notes */}
      {episode.episode_notes && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Episode Notes</div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>{episode.episode_notes}</p>
        </div>
      )}
    </div>
  );
}

export default function PatientWorkspace() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const clinicId = user?.clinic_id;

  const [patient, setPatient] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [activeEpisodeId, setActiveEpisodeId] = useState(null);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewEpisode, setShowNewEpisode] = useState(false);
  const [newEpForm, setNewEpForm] = useState({ title: '', condition: '', affected_region: '', affected_side: 'bilateral', start_date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    (async () => {
      try {
        const [profileData, epData] = await Promise.all([
          api.get(`/records/patients/${patientId}/profile?clinicId=${clinicId}`),
          api.get(`/records/patients/${patientId}/episodes?clinicId=${clinicId}`),
        ]);
        setPatient(profileData.user);
        setEpisodes(epData.episodes || []);
        const active = (epData.episodes || []).find(e => e.status === 'active') || (epData.episodes || [])[0];
        if (active) setActiveEpisodeId(active.id);
      } catch (err) { setError(err?.message || 'Failed to load patient data'); }
      finally { setLoading(false); }
    })();
  }, [patientId, clinicId]);

  useEffect(() => {
    if (!activeEpisodeId) return;
    const ep = episodes.find(e => e.id === activeEpisodeId);
    setActiveEpisode(ep || null);
    // Load overview data
    (async () => {
      try {
        const [sData, gData] = await Promise.all([
          api.get(`/records/episodes/${activeEpisodeId}/sessions`),
          api.get(`/records/episodes/${activeEpisodeId}/goals`),
        ]);
        setSessions(sData.sessions || []);
        setGoals(gData.goals || []);
      } catch (_) {}
    })();
  }, [activeEpisodeId, episodes]);

  const createEpisode = async () => {
    if (!newEpForm.title.trim()) return;
    try {
      // Get staff id from clinic_staff
      const staffData = await api.get(`/staff/clinic/${clinicId}`);
      const myStaff = (staffData.staff || staffData || []).find(s => s.user_id === user?.id);
      const ep = await api.post('/records/episodes', {
        ...newEpForm, patientId, clinicId,
        primaryTherapistStaffId: myStaff?.id,
      });
      setEpisodes(es => [ep, ...es]);
      setActiveEpisodeId(ep.id);
      setShowNewEpisode(false);
      setNewEpForm({ title: '', condition: '', affected_region: '', affected_side: 'bilateral', start_date: new Date().toISOString().split('T')[0] });
    } catch (err) { setError(err?.message || 'Failed to create episode'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: '#94a3b8' }}>
      <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/therapist/patients')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.875rem', background: '#f1f5f9', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', color: '#374151', cursor: 'pointer' }}>
          <ArrowLeft size={15} /> My Patients
        </button>
        {patient && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
              {patient.first_name?.[0]}{patient.last_name?.[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{patient.first_name} {patient.last_name}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{patient.email}</div>
            </div>
          </div>
        )}
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', color: '#991b1b', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={16} /> {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.25rem', flex: 1, minHeight: 0 }}>
        {/* Episode Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Episodes</span>
            <button onClick={() => setShowNewEpisode(!showNewEpisode)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.65rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={12} /> New
            </button>
          </div>

          {showNewEpisode && (
            <div style={{ background: '#f8fafc', border: '1.5px solid #dbeafe', borderRadius: 10, padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <input value={newEpForm.title} onChange={e => setNewEpForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Episode title *" style={{ width: '100%', padding: '0.5rem 0.65rem', border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              <input value={newEpForm.condition} onChange={e => setNewEpForm(f => ({ ...f, condition: e.target.value }))}
                placeholder="Condition / diagnosis" style={{ width: '100%', padding: '0.5rem 0.65rem', border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              <input value={newEpForm.affected_region} onChange={e => setNewEpForm(f => ({ ...f, affected_region: e.target.value }))}
                placeholder="Affected region" style={{ width: '100%', padding: '0.5rem 0.65rem', border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={() => setShowNewEpisode(false)}
                  style={{ flex: 1, padding: '0.45rem', background: '#f1f5f9', border: 'none', borderRadius: 7, fontSize: '0.78rem', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Cancel</button>
                <button onClick={createEpisode}
                  style={{ flex: 1, padding: '0.45rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Create</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {episodes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.82rem' }}>No episodes yet</div>
            )}
            {episodes.map(ep => (
              <button key={ep.id} onClick={() => setActiveEpisodeId(ep.id)}
                style={{
                  textAlign: 'left', padding: '0.75rem 0.875rem', borderRadius: 10,
                  background: activeEpisodeId === ep.id ? '#eff6ff' : '#fff',
                  border: activeEpisodeId === ep.id ? '1.5px solid #bfdbfe' : '1.5px solid #e2e8f0',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep.title}</div>
                <EpisodeStatusBadge status={ep.status} size="sm" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Tab Bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', flexShrink: 0 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.875rem 1.1rem', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? '#2563eb' : '#64748b',
                  borderBottom: activeTab === tab.id ? '2.5px solid #2563eb' : '2.5px solid transparent',
                  whiteSpace: 'nowrap', transition: 'all 0.15s',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {!activeEpisode ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <User size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p>Select or create a treatment episode to begin.</p>
              </div>
            ) : (
              <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>}>
                {activeTab === 'overview'   && <OverviewTab episode={activeEpisode} patient={patient} sessions={sessions} goals={goals} />}
                {activeTab === 'assessment' && <AssessmentTab episode={activeEpisode} clinicId={clinicId} />}
                {activeTab === 'plan'       && <TreatmentPlanTab episode={activeEpisode} clinicId={clinicId} />}
                {activeTab === 'sessions'   && <SessionsTab episode={activeEpisode} clinicId={clinicId} />}
                {activeTab === 'progress'   && <ProgressTab episode={activeEpisode} clinicId={clinicId} />}
                {activeTab === 'documents'  && <DocumentsTab episode={activeEpisode} clinicId={clinicId} />}
                {activeTab === 'discharge'  && <DischargeTab episode={activeEpisode} clinicId={clinicId} onDischarged={() => setActiveTab('overview')} />}
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
