import React, { useState, useEffect } from 'react';
import { Plus, Save, Lock, Loader, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import api from '../../../lib/api';

const inputStyle = { width: '100%', padding: '0.65rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' };

const emptyForm = {
  session_date: new Date().toISOString().split('T')[0],
  subjective: '', objective: '', assessment: '', plan: '',
  treatment_applied: '', exercises_prescribed: '',
  patient_response: '', pain_score_pre: '', pain_score_post: '',
  next_session_plan: '', patient_summary: '', bookingId: '',
};

function SessionCard({ session, onFinalize }) {
  const isFinalized = session.status === 'finalized';
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1.25rem', borderLeft: `4px solid ${isFinalized ? '#8b5cf6' : '#f59e0b'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
            {new Date(session.session_date).toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.1rem' }}>
            {session.therapist_first} {session.therapist_last}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {session.pain_score_pre !== null && <span style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.5rem', borderRadius: 20, fontWeight: 600 }}>Pre: {session.pain_score_pre}/10</span>}
          {session.pain_score_post !== null && <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: 20, fontWeight: 600 }}>Post: {session.pain_score_post}/10</span>}
          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 20, fontWeight: 600, background: isFinalized ? '#ede9fe' : '#fef3c7', color: isFinalized ? '#5b21b6' : '#92400e', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {isFinalized ? <><Lock size={11} /> Finalized</> : <>Draft</>}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
        {session.subjective && <div><strong style={{ color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>S</strong><p style={{ margin: '0.25rem 0 0', color: '#334155', lineHeight: 1.5 }}>{session.subjective}</p></div>}
        {session.objective && <div><strong style={{ color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>O</strong><p style={{ margin: '0.25rem 0 0', color: '#334155', lineHeight: 1.5 }}>{session.objective}</p></div>}
        {session.assessment && <div><strong style={{ color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>A</strong><p style={{ margin: '0.25rem 0 0', color: '#334155', lineHeight: 1.5 }}>{session.assessment}</p></div>}
        {session.plan && <div><strong style={{ color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>P</strong><p style={{ margin: '0.25rem 0 0', color: '#334155', lineHeight: 1.5 }}>{session.plan}</p></div>}
      </div>

      {session.treatment_applied && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', fontSize: '0.83rem' }}>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Treatment: </span>
          <span style={{ color: '#334155' }}>{session.treatment_applied}</span>
        </div>
      )}

      {!isFinalized && (
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => onFinalize(session.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
            <Lock size={13} /> Finalize Note
          </button>
        </div>
      )}
    </div>
  );
}

export default function SessionsTab({ episode, clinicId }) {
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get(`/records/episodes/${episode.id}/sessions`);
        setSessions(data.sessions || []);
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, [episode.id]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const saveSession = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const session = await api.post(`/records/episodes/${episode.id}/sessions`, { ...form, clinicId });
      setSessions(s => [session, ...s]);
      setForm(emptyForm);
      setShowForm(false);
      setSuccess('Session note saved as draft.');
    } catch (err) { setError(err?.message || 'Failed to save session'); }
    finally { setSaving(false); }
  };

  const finalizeSession = async (sessionId) => {
    try {
      const updated = await api.post(`/records/sessions/${sessionId}/finalize`, { clinicId });
      setSessions(s => s.map(sess => sess.id === sessionId ? { ...sess, status: 'finalized' } : sess));
    } catch (err) { setError(err?.message || 'Failed to finalize'); }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Session Records ({sessions.length})</h3>
        <button onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
          <Plus size={14} /> New Session Note
        </button>
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', color: '#991b1b', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={16} /> {error}</div>}
      {success && <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '0.75rem 1rem', color: '#166534', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}><CheckCircle size={16} /> {success}</div>}

      {showForm && (
        <div style={{ background: '#f8fafc', border: '1.5px solid #ede9fe', borderRadius: 14, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '0.95rem' }}>New Session SOAP Note</h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Session Date</label>
              <input type="date" value={form.session_date} onChange={set('session_date')} style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={labelStyle}>Pain Before</label>
                <input type="number" min={0} max={10} value={form.pain_score_pre} onChange={set('pain_score_pre')} style={inputStyle} placeholder="0–10" />
              </div>
              <div>
                <label style={labelStyle}>Pain After</label>
                <input type="number" min={0} max={10} value={form.pain_score_post} onChange={set('pain_score_post')} style={inputStyle} placeholder="0–10" />
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>S — Subjective (Patient's report)</label>
            <textarea value={form.subjective} onChange={set('subjective')} rows={2} style={inputStyle} placeholder="What the patient reports — pain, function, changes since last visit…" />
          </div>
          <div>
            <label style={labelStyle}>O — Objective (Clinical findings)</label>
            <textarea value={form.objective} onChange={set('objective')} rows={2} style={inputStyle} placeholder="ROM, strength, posture, palpation, special tests today…" />
          </div>
          <div>
            <label style={labelStyle}>A — Assessment (Clinical reasoning)</label>
            <textarea value={form.assessment} onChange={set('assessment')} rows={2} style={inputStyle} placeholder="Interpretation, progress vs. baseline, response to treatment…" />
          </div>
          <div>
            <label style={labelStyle}>P — Plan (Next steps)</label>
            <textarea value={form.plan} onChange={set('plan')} rows={2} style={inputStyle} placeholder="Planned interventions, exercises, frequency for next session…" />
          </div>
          <div>
            <label style={labelStyle}>Treatment Applied</label>
            <textarea value={form.treatment_applied} onChange={set('treatment_applied')} rows={2} style={inputStyle} placeholder="Manual therapy, electrotherapy, taping, education applied today…" />
          </div>
          <div>
            <label style={labelStyle}>Exercises Prescribed</label>
            <textarea value={form.exercises_prescribed} onChange={set('exercises_prescribed')} rows={2} style={inputStyle} placeholder="Exercise name, sets × reps × duration (one per line)…" />
          </div>
          <div>
            <label style={labelStyle}>Patient Response</label>
            <textarea value={form.patient_response} onChange={set('patient_response')} rows={2} style={inputStyle} placeholder="Patient's response during/after treatment…" />
          </div>
          <div>
            <label style={labelStyle}>Patient-Visible Summary <span style={{ color: '#94a3b8', fontWeight: 400 }}>(shown in My Recovery)</span></label>
            <textarea value={form.patient_summary} onChange={set('patient_summary')} rows={2} style={inputStyle} placeholder="A brief, patient-friendly summary of today's session…" />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '0.55rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: 8, color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button onClick={saveSession} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.25rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />} Save Draft
            </button>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', border: '1.5px dashed #e2e8f0', borderRadius: 12 }}>
          <FileText size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <p style={{ margin: 0 }}>No session notes yet. Create the first one above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {sessions.map(s => <SessionCard key={s.id} session={s} onFinalize={finalizeSession} />)}
        </div>
      )}
    </div>
  );
}
