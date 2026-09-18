import React, { useState, useEffect } from 'react';
import { Plus, Save, Loader, AlertCircle, Target, Trash2 } from 'lucide-react';
import api from '../../../lib/api';
import GoalCard from '../../../components/records/GoalCard';

const inputStyle = { width: '100%', padding: '0.65rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' };

const emptyGoal = { goal_type: 'short_term', description: '', metric_name: '', baseline_value: '', target_value: '', target_date: '', is_patient_visible: true };
const emptyPlan = { interventions: '', frequency_per_week: '', session_duration_mins: 60, expected_duration_weeks: '', home_program: '', patient_education: '', next_review_date: '' };

export default function TreatmentPlanTab({ episode, clinicId }) {
  const [goals, setGoals] = useState([]);
  const [plan, setPlan] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState(emptyGoal);
  const [planForm, setPlanForm] = useState(emptyPlan);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [goalsData, planData] = await Promise.all([
          api.get(`/records/episodes/${episode.id}/goals`),
          api.get(`/records/episodes/${episode.id}/plan`),
        ]);
        setGoals(goalsData.goals || []);
        if (planData.current) { setPlan(planData.current); setPlanForm(planData.current); }
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, [episode.id]);

  const setG = k => e => setGoalForm(f => ({ ...f, [k]: e.target.value }));
  const setP = k => e => setPlanForm(f => ({ ...f, [k]: e.target.value }));

  const addGoal = async () => {
    if (!goalForm.description.trim()) return;
    setSaving(true); setError('');
    try {
      const g = await api.post(`/records/episodes/${episode.id}/goals`, { ...goalForm, clinicId });
      setGoals(gs => [...gs, g]);
      setGoalForm(emptyGoal);
      setShowGoalForm(false);
    } catch (err) { setError(err?.message || 'Failed to add goal'); }
    finally { setSaving(false); }
  };

  const updateGoalStatus = async (goalId, status) => {
    try {
      const updated = await api.put(`/records/goals/${goalId}`, { status });
      setGoals(gs => gs.map(g => g.id === goalId ? { ...g, ...updated } : g));
    } catch (err) { setError(err?.message || 'Failed to update goal'); }
  };

  const savePlan = async () => {
    if (!planForm.interventions.trim()) { setError('Interventions field is required'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const saved = await api.post(`/records/episodes/${episode.id}/plan`, { ...planForm, clinicId });
      setPlan(saved); setSuccess('Treatment plan saved!');
    } catch (err) { setError(err?.message || 'Failed to save plan'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', color: '#991b1b', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={16} /> {error}</div>}
      {success && <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '0.75rem 1rem', color: '#166534', fontSize: '0.85rem' }}>{success}</div>}

      {/* Goals */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={18} color="#2563eb" /> Rehabilitation Goals
          </h3>
          <button onClick={() => setShowGoalForm(!showGoalForm)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
            <Plus size={14} /> Add Goal
          </button>
        </div>

        {showGoalForm && (
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div>
                <label style={labelStyle}>Goal Type</label>
                <select value={goalForm.goal_type} onChange={setG('goal_type')} style={inputStyle}>
                  <option value="short_term">Short-term</option>
                  <option value="long_term">Long-term</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Target Date</label>
                <input type="date" value={goalForm.target_date} onChange={setG('target_date')} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Goal Description <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea value={goalForm.description} onChange={setG('description')} rows={2} style={inputStyle} placeholder="Describe the measurable rehabilitation goal…" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
              <div>
                <label style={labelStyle}>Metric Name</label>
                <input value={goalForm.metric_name} onChange={setG('metric_name')} style={inputStyle} placeholder="e.g. Knee Flexion ROM" />
              </div>
              <div>
                <label style={labelStyle}>Baseline Value</label>
                <input value={goalForm.baseline_value} onChange={setG('baseline_value')} style={inputStyle} placeholder="e.g. 60°" />
              </div>
              <div>
                <label style={labelStyle}>Target Value</label>
                <input value={goalForm.target_value} onChange={setG('target_value')} style={inputStyle} placeholder="e.g. 120°" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="goal-visible" checked={goalForm.is_patient_visible} onChange={e => setGoalForm(f => ({ ...f, is_patient_visible: e.target.checked }))} />
              <label htmlFor="goal-visible" style={{ fontSize: '0.85rem', color: '#374151' }}>Visible to patient in My Recovery</label>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowGoalForm(false)} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: 8, color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addGoal} disabled={saving} style={{ padding: '0.5rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                {saving ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Add Goal'}
              </button>
            </div>
          </div>
        )}

        {goals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', border: '1.5px dashed #e2e8f0', borderRadius: 12, fontSize: '0.9rem' }}>
            No goals set yet. Add short and long-term goals above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {goals.map(g => (
              <div key={g.id}>
                <GoalCard goal={g} />
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  {['not_started', 'in_progress', 'achieved', 'not_achieved'].map(s => (
                    <button key={s} onClick={() => updateGoalStatus(g.id, s)}
                      style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', fontWeight: 600, background: g.status === s ? '#0f172a' : '#f1f5f9', color: g.status === s ? '#fff' : '#475569', border: 'none', borderRadius: 20, cursor: 'pointer', textTransform: 'capitalize' }}>
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Treatment Plan */}
      <div>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
          Treatment Plan {plan && <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>v{plan.version_number}</span>}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Interventions / Treatment Approach <span style={{ color: '#dc2626' }}>*</span></label>
            <textarea value={planForm.interventions} onChange={setP('interventions')} rows={3} style={inputStyle} placeholder="Planned physiotherapy interventions, modalities and techniques…" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Sessions/Week</label>
              <input type="number" min={1} max={7} value={planForm.frequency_per_week} onChange={setP('frequency_per_week')} style={inputStyle} placeholder="3" />
            </div>
            <div>
              <label style={labelStyle}>Duration (min)</label>
              <input type="number" value={planForm.session_duration_mins} onChange={setP('session_duration_mins')} style={inputStyle} placeholder="60" />
            </div>
            <div>
              <label style={labelStyle}>Expected Weeks</label>
              <input type="number" value={planForm.expected_duration_weeks} onChange={setP('expected_duration_weeks')} style={inputStyle} placeholder="6" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Home Program</label>
            <textarea value={planForm.home_program} onChange={setP('home_program')} rows={3} style={inputStyle} placeholder="Home exercises, activity modifications, self-management strategies…" />
          </div>

          <div>
            <label style={labelStyle}>Patient Education</label>
            <textarea value={planForm.patient_education} onChange={setP('patient_education')} rows={2} style={inputStyle} placeholder="Education points to discuss with patient (posture, ergonomics, etc.)…" />
          </div>

          <div>
            <label style={labelStyle}>Next Review Date</label>
            <input type="date" value={planForm.next_review_date} onChange={setP('next_review_date')} style={{ ...inputStyle, width: 'auto', maxWidth: 220 }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={savePlan} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: '0.88rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
              {plan ? 'Update Plan (New Version)' : 'Save Treatment Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
