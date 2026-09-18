import React, { useState, useEffect } from 'react';
import { Activity, Target, FileText, Download, Loader, AlertCircle, ChevronDown, ChevronRight, Heart, TrendingUp, Dumbbell } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import GoalCard from '../../components/records/GoalCard';
import ProgressChart from '../../components/records/ProgressChart';
import EpisodeStatusBadge from '../../components/records/EpisodeStatusBadge';

const DOC_CAT_LABELS = {
  referral: 'Referral', report: 'Report', prescription: 'Prescription',
  scan_image: 'Scan', consent: 'Consent', other: 'Document',
};

export default function PatientRecords() {
  const { user } = useAuth();
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpId, setSelectedEpId] = useState(null);
  const [recovery, setRecovery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEpDropdown, setShowEpDropdown] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);

  // Load episodes
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const data = await api.get('/records/my/episodes');
        setEpisodes(data.episodes || []);
        const active = (data.episodes || []).find(e => e.status === 'active') || (data.episodes || [])[0];
        if (active) setSelectedEpId(active.id);
      } catch (err) { setError(err?.message || 'Failed to load your records.'); }
      finally { setLoading(false); }
    })();
  }, [user]);

  // Load recovery details for selected episode
  useEffect(() => {
    if (!selectedEpId) return;
    setRecoveryLoading(true); setRecovery(null);
    (async () => {
      try {
        const data = await api.get(`/records/my/episodes/${selectedEpId}/recovery`);
        setRecovery(data);
      } catch (err) { setError(err?.message || 'Failed to load episode details.'); }
      finally { setRecoveryLoading(false); }
    })();
  }, [selectedEpId]);

  const selectedEp = episodes.find(e => e.id === selectedEpId);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem', color: '#94a3b8' }}>
      <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div className="animate-in">
      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', borderRadius: 20, padding: '2rem 2.5rem', marginBottom: '2rem', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.75, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
              My Recovery
            </div>
            <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 800 }}>
              {user?.first_name ? `Hello, ${user.first_name}` : 'Your Recovery Dashboard'}
            </h1>
            {selectedEp && (
              <div style={{ opacity: 0.85, fontSize: '1rem', fontWeight: 500, marginTop: '0.4rem' }}>
                {selectedEp.episode_title || selectedEp.title} · <span style={{ opacity: 0.7 }}>{selectedEp.clinic_name}</span>
              </div>
            )}
          </div>
          {/* Episode Selector */}
          {episodes.length > 1 && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowEpDropdown(!showEpDropdown)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                Switch Episode <ChevronDown size={15} />
              </button>
              {showEpDropdown && (
                <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 240, overflow: 'hidden' }}>
                  {episodes.map(ep => (
                    <button key={ep.id} onClick={() => { setSelectedEpId(ep.id); setShowEpDropdown(false); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.875rem 1rem', border: 'none', background: ep.id === selectedEpId ? '#eff6ff' : '#fff', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem', marginBottom: '0.2rem' }}>{ep.episode_title || ep.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <EpisodeStatusBadge status={ep.status} size="sm" />
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{ep.clinic_name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '1rem', color: '#991b1b', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={16} /> {error}</div>}

      {episodes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Activity size={48} style={{ opacity: 0.15, margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No Active Recovery Programme</h3>
          <p style={{ color: '#64748b', margin: 0 }}>Your physiotherapist will add your treatment details here once your programme begins.</p>
        </div>
      ) : recoveryLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}><Loader size={28} style={{ animation: 'spin 1s linear infinite' }} /></div>
      ) : recovery && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.875rem' }}>
            {[
              { label: 'Sessions Done', value: recovery.sessions?.length || 0, icon: <Activity size={18} />, color: '#dbeafe', text: '#1e40af' },
              { label: 'Goals Set', value: recovery.goals?.length || 0, icon: <Target size={18} />, color: '#dcfce7', text: '#166534' },
              { label: 'Metrics Tracked', value: recovery.metrics?.length || 0, icon: <TrendingUp size={18} />, color: '#ede9fe', text: '#5b21b6' },
              { label: 'Documents', value: recovery.documents?.length || 0, icon: <FileText size={18} />, color: '#fef3c7', text: '#92400e' },
            ].map(s => (
              <div key={s.label} style={{ background: s.color, borderRadius: 14, padding: '1.1rem', textAlign: 'center' }}>
                <div style={{ color: s.text, marginBottom: '0.3rem', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.text }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: s.text, opacity: 0.75 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Physio + Plan info */}
          {(selectedEp?.physio_first || recovery.current_plan) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {selectedEp?.physio_first && (
                <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1e40af' }}>
                    {selectedEp.physio_first?.[0]}{selectedEp.physio_last?.[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Your Physiotherapist</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>{selectedEp.physio_first} {selectedEp.physio_last}</div>
                  </div>
                </div>
              )}
              {recovery.current_plan && (
                <div className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.5rem' }}>Your Programme</div>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    {recovery.current_plan.frequency_per_week && <span><strong>{recovery.current_plan.frequency_per_week}×/week</strong> · </span>}
                    {recovery.current_plan.session_duration_mins && <span>{recovery.current_plan.session_duration_mins} min sessions</span>}
                  </div>
                  {recovery.current_plan.next_review_date && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                      Next review: <strong>{new Date(recovery.current_plan.next_review_date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Goals */}
          {recovery.goals?.length > 0 && (
            <div>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={20} color="#2563eb" /> Your Goals
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.875rem' }}>
                {recovery.goals.map(g => <GoalCard key={g.id} goal={g} />)}
              </div>
            </div>
          )}

          {/* Progress */}
          {recovery.metrics?.length > 0 && (
            <div>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} color="#7c3aed" /> Progress Tracking
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.875rem' }}>
                {recovery.metrics.map(m => <ProgressChart key={m.id} metric={m} readings={m.readings || []} />)}
              </div>
            </div>
          )}

          {/* Home Program / Exercises */}
          {(recovery.current_plan?.home_program || recovery.sessions?.some(s => s.exercises_prescribed)) && (
            <div>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Dumbbell size={20} color="#16a34a" /> Home Exercises
              </h2>
              <div className="card" style={{ padding: '1.25rem' }}>
                {recovery.current_plan?.home_program && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Your Home Programme</div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{recovery.current_plan.home_program}</p>
                  </div>
                )}
                {recovery.sessions?.filter(s => s.exercises_prescribed).slice(0, 3).map(s => (
                  <div key={s.id} style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                      From session {new Date(s.session_date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{s.exercises_prescribed}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sessions */}
          {recovery.sessions?.length > 0 && (
            <div>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={20} color="#dc2626" /> Session History
              </h2>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {recovery.sessions.map((s, i) => (
                  <div key={s.id}>
                    <button onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1rem 1.25rem', background: 'none', border: 'none', borderBottom: i < recovery.sessions.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                          {new Date(s.session_date).toLocaleDateString('en-LK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.1rem' }}>with {s.physio_first} {s.physio_last}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {s.pain_score_post !== null && (
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {s.pain_score_pre !== null && <span style={{ fontSize: '0.73rem', background: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.5rem', borderRadius: 20, fontWeight: 600 }}>Pre: {s.pain_score_pre}</span>}
                            <span style={{ fontSize: '0.73rem', background: '#dcfce7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: 20, fontWeight: 600 }}>Post: {s.pain_score_post}</span>
                          </div>
                        )}
                        {expandedSession === s.id ? <ChevronDown size={16} color="#94a3b8" /> : <ChevronRight size={16} color="#94a3b8" />}
                      </div>
                    </button>
                    {expandedSession === s.id && s.summary && (
                      <div style={{ padding: '0.75rem 1.25rem 1rem', background: '#f8fafc', borderBottom: i < recovery.sessions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.65 }}>{s.summary}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {recovery.documents?.length > 0 && (
            <div>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="#ea580c" /> Shared Documents
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                {recovery.documents.map(doc => (
                  <a key={doc.id} href={doc.file_url} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem 1.25rem', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={18} color="#2563eb" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.file_name}</div>
                      <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '0.1rem' }}>
                        {DOC_CAT_LABELS[doc.category] || 'Document'} · {new Date(doc.created_at).toLocaleDateString('en-LK')}
                      </div>
                    </div>
                    <Download size={14} color="#2563eb" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Discharge */}
          {recovery.discharge && (
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1.5px solid #86efac', borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ fontWeight: 700, color: '#166534', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🎉</span> Congratulations — Treatment Completed
              </div>
              <div style={{ fontSize: '0.88rem', color: '#166534', lineHeight: 1.6 }}>
                <strong>Discharged:</strong> {new Date(recovery.discharge.discharge_date).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              {recovery.discharge.goals_achieved && <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: '#166534', lineHeight: 1.6 }}><strong>Goals achieved:</strong> {recovery.discharge.goals_achieved}</p>}
              {recovery.discharge.recommendations && <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: '#166534', lineHeight: 1.6 }}><strong>Recommendations:</strong> {recovery.discharge.recommendations}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
