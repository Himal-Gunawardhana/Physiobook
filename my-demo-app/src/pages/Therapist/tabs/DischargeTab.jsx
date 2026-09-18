import React, { useState, useEffect } from 'react';
import { Save, Loader, AlertCircle, CheckCircle, LogOut } from 'lucide-react';
import api from '../../../lib/api';

const inputStyle = { width: '100%', padding: '0.65rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 };
const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' };

const DISCHARGE_REASONS = [
  { value: 'goals_achieved',      label: 'Goals Achieved' },
  { value: 'patient_request',     label: 'Patient Request' },
  { value: 'non_compliance',      label: 'Non-compliance / DNT' },
  { value: 'referral_elsewhere',  label: 'Referred Elsewhere' },
  { value: 'clinically_plateaued',label: 'Clinically Plateaued' },
  { value: 'other',               label: 'Other' },
];

export default function DischargeTab({ episode, clinicId, onDischarged }) {
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    discharge_date: new Date().toISOString().split('T')[0],
    discharge_reason_type: 'goals_achieved',
    discharge_reason: '',
    final_pain_score: '',
    goals_achieved: '',
    goals_not_achieved: '',
    remaining_limitations: '',
    recommendations: '',
    follow_up_plan: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get(`/records/episodes/${episode.id}/discharge`);
        if (data) { setExisting(data); setForm(f => ({ ...f, ...data })); }
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, [episode.id]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.discharge_reason.trim()) { setError('Discharge reason is required'); return; }
    if (!window.confirm('Are you sure you want to discharge this patient? This will close the treatment episode.')) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const result = await api.post(`/records/episodes/${episode.id}/discharge`, { ...form, clinicId });
      setExisting(result);
      setSuccess('Patient discharged successfully. Episode closed.');
      onDischarged && onDischarged();
    } catch (err) { setError(err?.message || 'Failed to discharge'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {existing && (
        <div style={{ background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <CheckCircle size={20} color="#0369a1" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#0c4a6e', marginBottom: '0.25rem' }}>Episode Discharged</div>
            <div style={{ fontSize: '0.85rem', color: '#0369a1' }}>
              Discharged on {new Date(existing.discharge_date).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })}.
              This episode is now closed and read-only.
            </div>
          </div>
        </div>
      )}

      {!existing && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.85rem', color: '#92400e' }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <span>Completing a discharge summary will <strong>close this treatment episode</strong> and mark it as completed. This action cannot be undone through the normal UI.</span>
        </div>
      )}

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', color: '#991b1b', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={16} /> {error}</div>}
      {success && <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '0.75rem 1rem', color: '#166534', fontSize: '0.85rem' }}>{success}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', opacity: existing ? 0.7 : 1, pointerEvents: existing ? 'none' : 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Discharge Date</label>
            <input type="date" value={form.discharge_date} onChange={set('discharge_date')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Reason for Discharge</label>
            <select value={form.discharge_reason_type} onChange={set('discharge_reason_type')} style={inputStyle}>
              {DISCHARGE_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Discharge Summary <span style={{ color: '#dc2626' }}>*</span></label>
          <textarea value={form.discharge_reason} onChange={set('discharge_reason')} rows={3} style={inputStyle}
            placeholder="Provide a summary of the reason for discharge, overall course of treatment…" />
        </div>

        <div>
          <label style={labelStyle}>Final Pain Score (0–10)</label>
          <input type="number" min={0} max={10} value={form.final_pain_score} onChange={set('final_pain_score')} style={{ ...inputStyle, maxWidth: 120 }} placeholder="0" />
        </div>

        <div>
          <label style={labelStyle}>Goals Achieved</label>
          <textarea value={form.goals_achieved} onChange={set('goals_achieved')} rows={2} style={inputStyle} placeholder="List goals that were successfully achieved…" />
        </div>

        <div>
          <label style={labelStyle}>Goals Not Achieved</label>
          <textarea value={form.goals_not_achieved} onChange={set('goals_not_achieved')} rows={2} style={inputStyle} placeholder="Goals that were not fully achieved and reasons…" />
        </div>

        <div>
          <label style={labelStyle}>Remaining Limitations</label>
          <textarea value={form.remaining_limitations} onChange={set('remaining_limitations')} rows={2} style={inputStyle} placeholder="Any functional limitations remaining at discharge…" />
        </div>

        <div>
          <label style={labelStyle}>Recommendations</label>
          <textarea value={form.recommendations} onChange={set('recommendations')} rows={2} style={inputStyle} placeholder="Ongoing self-management, activity guidance, further referral if needed…" />
        </div>

        <div>
          <label style={labelStyle}>Follow-up Plan</label>
          <textarea value={form.follow_up_plan} onChange={set('follow_up_plan')} rows={2} style={inputStyle} placeholder="Recommended follow-up timing and instructions…" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={submit} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <LogOut size={15} />}
            Discharge Patient & Close Episode
          </button>
        </div>
      </div>
    </div>
  );
}
