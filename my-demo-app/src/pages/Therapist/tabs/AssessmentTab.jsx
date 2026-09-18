import React, { useState, useEffect } from 'react';
import { Save, Loader, AlertCircle, ClipboardList } from 'lucide-react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const inputStyle = { width: '100%', padding: '0.65rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 };
const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' };
const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

export default function AssessmentTab({ episode, clinicId }) {
  const { user } = useAuth();
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    chief_complaint: '', history_of_complaint: '', onset_date: '',
    mechanism_of_injury: '', previous_treatment: '',
    posture_observation: '', gait_observation: '', palpation_findings: '',
    pain_score_rest: '', pain_score_activity: '',
    functional_limitations: '', special_tests: '',
    clinical_impression: '', precautions: '', contraindications: '',
    baseline_summary: '', assessment_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get(`/records/episodes/${episode.id}/assessment`);
        if (data.initial) {
          setExisting(data.initial);
          setForm(f => ({ ...f, ...data.initial }));
        }
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, [episode.id]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (isReassessment = false) => {
    if (!form.chief_complaint.trim()) { setError('Chief complaint is required'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const result = await api.post(`/records/episodes/${episode.id}/assessment`, {
        ...form, clinicId, is_reassessment: isReassessment,
        objective_measures: {},
      });
      setExisting(result);
      setSuccess(isReassessment ? 'Reassessment saved!' : 'Initial assessment saved!');
    } catch (err) { setError(err?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div>
      {existing && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: '#166534' }}>
          <ClipboardList size={16} />
          Initial assessment recorded on {new Date(existing.created_at).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}. You can save a new reassessment below.
        </div>
      )}

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', color: '#991b1b', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={16} /> {error}</div>}
      {success && <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '0.75rem 1rem', color: '#166534', marginBottom: '1rem', fontSize: '0.85rem' }}>{success}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Header */}
        <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Subjective — Patient History</h3>
        </div>

        <div>
          <label style={labelStyle}>Chief Complaint <span style={{ color: '#dc2626' }}>*</span></label>
          <textarea value={form.chief_complaint} onChange={set('chief_complaint')} rows={2} style={inputStyle} placeholder="Primary reason for consultation…" />
        </div>

        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>Onset Date</label>
            <input type="date" value={form.onset_date} onChange={set('onset_date')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Assessment Date</label>
            <input type="date" value={form.assessment_date} onChange={set('assessment_date')} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>History of Complaint</label>
          <textarea value={form.history_of_complaint} onChange={set('history_of_complaint')} rows={3} style={inputStyle} placeholder="Describe onset, aggravating/relieving factors, previous episodes…" />
        </div>

        <div>
          <label style={labelStyle}>Mechanism of Injury</label>
          <input value={form.mechanism_of_injury} onChange={set('mechanism_of_injury')} style={inputStyle} placeholder="How did the injury occur?" />
        </div>

        <div>
          <label style={labelStyle}>Previous Treatment</label>
          <textarea value={form.previous_treatment} onChange={set('previous_treatment')} rows={2} style={inputStyle} placeholder="Any previous physiotherapy, surgery, or relevant treatment…" />
        </div>

        {/* Objective */}
        <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', marginTop: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Objective — Clinical Findings</h3>
        </div>

        <div>
          <label style={labelStyle}>Posture Observation</label>
          <textarea value={form.posture_observation} onChange={set('posture_observation')} rows={2} style={inputStyle} placeholder="Postural deviations, muscle imbalances observed…" />
        </div>

        <div>
          <label style={labelStyle}>Gait Observation</label>
          <input value={form.gait_observation} onChange={set('gait_observation')} style={inputStyle} placeholder="Describe gait pattern, deviations…" />
        </div>

        <div>
          <label style={labelStyle}>Palpation Findings</label>
          <textarea value={form.palpation_findings} onChange={set('palpation_findings')} rows={2} style={inputStyle} placeholder="Tenderness, swelling, temperature changes…" />
        </div>

        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>Pain Score (Rest) 0–10</label>
            <input type="number" min={0} max={10} value={form.pain_score_rest} onChange={set('pain_score_rest')} style={inputStyle} placeholder="0" />
          </div>
          <div>
            <label style={labelStyle}>Pain Score (Activity) 0–10</label>
            <input type="number" min={0} max={10} value={form.pain_score_activity} onChange={set('pain_score_activity')} style={inputStyle} placeholder="0" />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Functional Limitations</label>
          <textarea value={form.functional_limitations} onChange={set('functional_limitations')} rows={2} style={inputStyle} placeholder="Activities the patient cannot perform or has difficulty with…" />
        </div>

        <div>
          <label style={labelStyle}>Special Tests</label>
          <textarea value={form.special_tests} onChange={set('special_tests')} rows={2} style={inputStyle} placeholder="Orthopaedic / neurological special tests and results…" />
        </div>

        {/* Assessment / Plan */}
        <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', marginTop: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Assessment & Baseline</h3>
        </div>

        <div>
          <label style={labelStyle}>Clinical Impression</label>
          <textarea value={form.clinical_impression} onChange={set('clinical_impression')} rows={3} style={inputStyle} placeholder="Diagnosis / clinical reasoning…" />
        </div>

        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>Precautions</label>
            <textarea value={form.precautions} onChange={set('precautions')} rows={2} style={inputStyle} placeholder="List any precautions…" />
          </div>
          <div>
            <label style={labelStyle}>Contraindications</label>
            <textarea value={form.contraindications} onChange={set('contraindications')} rows={2} style={inputStyle} placeholder="Absolute or relative contraindications…" />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Baseline Summary</label>
          <textarea value={form.baseline_summary} onChange={set('baseline_summary')} rows={2} style={inputStyle} placeholder="Overall baseline status — used as reference for progress tracking…" />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          {existing && (
            <button onClick={() => submit(true)} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.25rem', background: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: '0.88rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              <Save size={15} /> Save Reassessment
            </button>
          )}
          <button onClick={() => submit(false)} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: '0.88rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
            {existing ? 'Update Assessment' : 'Save Initial Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
}
