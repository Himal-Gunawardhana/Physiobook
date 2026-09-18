import React, { useState, useEffect } from 'react';
import { Plus, Save, Loader, AlertCircle, TrendingUp } from 'lucide-react';
import api from '../../../lib/api';
import ProgressChart from '../../../components/records/ProgressChart';

const METRIC_TYPES = [
  { value: 'pain_score',      label: 'Pain Score (VAS)',   unit: '/10' },
  { value: 'rom_degrees',     label: 'Range of Motion',   unit: 'degrees' },
  { value: 'strength_grade',  label: 'Strength Grade',    unit: '/5 MRC' },
  { value: 'balance_score',   label: 'Balance Score',     unit: 'sec / score' },
  { value: 'functional_score',label: 'Functional Score',  unit: 'score' },
  { value: 'custom',          label: 'Custom Metric',     unit: '' },
];

const inputStyle = { width: '100%', padding: '0.6rem 0.7rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' };

const emptyForm = { metric_name: '', metric_type: 'pain_score', unit: '/10', baseline_value: '', target_value: '', current_value: '', is_patient_visible: true };

export default function ProgressTab({ episode, clinicId }) {
  const [metrics, setMetrics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [updateValues, setUpdateValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get(`/records/episodes/${episode.id}/metrics`);
        setMetrics(data.metrics || []);
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, [episode.id]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const onTypeChange = e => {
    const t = METRIC_TYPES.find(m => m.value === e.target.value) || METRIC_TYPES[0];
    setForm(f => ({ ...f, metric_type: t.value, unit: t.unit }));
  };

  const addMetric = async () => {
    if (!form.metric_name.trim()) { setError('Metric name is required'); return; }
    setSaving(true); setError('');
    try {
      const m = await api.post(`/records/episodes/${episode.id}/metrics`, { ...form, clinicId });
      setMetrics(ms => [...ms, { ...m, readings: [] }]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) { setError(err?.message || 'Failed to add metric'); }
    finally { setSaving(false); }
  };

  const updateMetric = async (metricId, metricName) => {
    const value = updateValues[metricId];
    if (!value) return;
    try {
      await api.post(`/records/episodes/${episode.id}/metrics`, { metric_name: metricName, current_value: value, clinicId });
      // Refresh
      const data = await api.get(`/records/episodes/${episode.id}/metrics`);
      setMetrics(data.metrics || []);
      setUpdateValues(v => ({ ...v, [metricId]: '' }));
    } catch (err) { setError(err?.message || 'Failed to update'); }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} color="#2563eb" /> Progress Metrics
        </h3>
        <button onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
          <Plus size={14} /> Add Metric
        </button>
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', color: '#991b1b', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={16} /> {error}</div>}

      {showForm && (
        <div style={{ background: '#f8fafc', border: '1.5px solid #dbeafe', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={labelStyle}>Metric Type</label>
              <select value={form.metric_type} onChange={onTypeChange} style={inputStyle}>
                {METRIC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Metric Name <span style={{ color: '#dc2626' }}>*</span></label>
              <input value={form.metric_name} onChange={set('metric_name')} style={inputStyle} placeholder="e.g. Knee Flexion Left" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={labelStyle}>Baseline Value</label>
              <input type="number" step="0.1" value={form.baseline_value} onChange={set('baseline_value')} style={inputStyle} placeholder="e.g. 60" />
            </div>
            <div>
              <label style={labelStyle}>Current Value</label>
              <input type="number" step="0.1" value={form.current_value} onChange={set('current_value')} style={inputStyle} placeholder="e.g. 75" />
            </div>
            <div>
              <label style={labelStyle}>Target Value</label>
              <input type="number" step="0.1" value={form.target_value} onChange={set('target_value')} style={inputStyle} placeholder="e.g. 120" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Unit</label>
            <input value={form.unit} onChange={set('unit')} style={{ ...inputStyle, maxWidth: 160 }} placeholder="e.g. degrees, kg, /10" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="metric-visible" checked={form.is_patient_visible} onChange={e => setForm(f => ({ ...f, is_patient_visible: e.target.checked }))} />
            <label htmlFor="metric-visible" style={{ fontSize: '0.85rem', color: '#374151' }}>Visible to patient</label>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: 8, color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button onClick={addMetric} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              {saving ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />} Add Metric
            </button>
          </div>
        </div>
      )}

      {metrics.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', border: '1.5px dashed #e2e8f0', borderRadius: 12 }}>
          <TrendingUp size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <p style={{ margin: 0 }}>No progress metrics yet. Add measurable outcomes to track patient progress.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {metrics.map(m => (
            <div key={m.id}>
              <ProgressChart metric={m} readings={m.readings || []} />
              {/* Quick update */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number" step="0.1"
                  value={updateValues[m.id] || ''}
                  onChange={e => setUpdateValues(v => ({ ...v, [m.id]: e.target.value }))}
                  placeholder="New reading…"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={() => updateMetric(m.id, m.metric_name)}
                  style={{ padding: '0.55rem 0.875rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  + Record
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
