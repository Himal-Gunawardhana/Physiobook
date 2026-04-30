import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, X, Star, Calendar, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../lib/api';

function Stars({ rating }) {
  return (
    <span style={{ display:'flex', alignItems:'center', gap:'0.2rem', color:'#f59e0b', fontWeight:700, fontSize:'0.87rem' }}>
      <Star size={13} fill="#f59e0b"/> {Number(rating).toFixed(1)}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = { Available:'badge-green', 'In Session':'badge-blue', 'On Leave':'badge-amber' };
  return <span className={`badge ${map[status]||'badge-blue'}`}>{status}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const BLANK_FORM = { name:'', role:'Physiotherapist', spec:'', exp:'', rating:'4.5', status:'Available' };

export default function StaffManagement() {
  const [staff,       setStaff]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [saving,      setSaving]      = useState(false);
  const [availModal,  setAvailModal]  = useState(null);
  const [addModal,    setAddModal]    = useState(false);
  const [form,        setForm]        = useState(BLANK_FORM);
  const [availability,setAvailability]= useState({});
  const [savingAvail, setSavingAvail] = useState(false);
  const [toast,       setToast]       = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await api.get('/staff');
      setStaff(Array.isArray(data) ? data : data?.staff ?? []);
    } catch (err) {
      setError(err?.message || 'Failed to load staff.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addStaff = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const created = await api.post('/staff', { ...form, experience_years: +form.exp, initial_rating: +form.rating });
      setStaff(prev => [...prev, created]);
      setAddModal(false);
      showToast('Staff member added.');
    } catch (err) {
      showToast(`Error: ${err?.message || 'Failed to add staff.'}`);
    } finally {
      setSaving(false);
    }
  };

  const openAvail = async (id) => {
    setAvailModal(id);
    try {
      const data = await api.get(`/staff/${id}/availability`);
      setAvailability(data || {});
    } catch (_) { setAvailability({}); }
  };

  const saveAvail = async () => {
    setSavingAvail(true);
    try {
      await api.put(`/staff/${availModal}/availability`, availability);
      showToast('Schedule saved.');
      setAvailModal(null);
    } catch (err) {
      showToast(`Error: ${err?.message || 'Failed to save schedule.'}`);
    } finally {
      setSavingAvail(false);
    }
  };

  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const target = staff.find(s => s.id === availModal);
  const avgRating = staff.length ? (staff.reduce((a,s) => a + Number(s.rating||0), 0) / staff.length).toFixed(1) : '—';

  return (
    <div className="animate-in">
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, background:'#0f172a', color:'#fff', borderRadius:12, padding:'0.9rem 1.5rem', fontWeight:600, zIndex:9999, boxShadow:'0 4px 20px rgba(0,0,0,0.2)', fontSize:'0.9rem' }}>
          {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Manage therapist availability and track performance metrics.</p>
        </div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <button onClick={load} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.45rem 0.875rem', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:8, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, color:'#374151' }}>
            <RefreshCw size={14}/>
          </button>
          <button className="btn-primary" onClick={() => { setForm(BLANK_FORM); setAddModal(true); }}>
            <UserPlus size={16}/> Add Staff Member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom:'1.5rem' }}>
        {[
          { label:'Total Staff',   value: staff.length },
          { label:'Available Now', value: staff.filter(s => s.status==='Available').length },
          { label:'In Session',    value: staff.filter(s => s.status==='In Session').length },
          { label:'Avg. Rating',   value: `${avgRating} ★` },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ fontSize:'1.75rem' }}>{value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'4rem', color:'#64748b' }}>
          <Loader size={28} style={{ animation:'spin 1s linear infinite' }}/>
        </div>
      ) : error ? (
        <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:12, padding:'1.5rem', color:'#991b1b' }}>
          <AlertCircle size={18} style={{ display:'inline', marginRight:'0.5rem' }}/>{error}
        </div>
      ) : (
        <div className="card">
          {staff.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'#94a3b8' }}>No staff members yet. Add one above.</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Role</th><th>Specialization</th><th>Experience</th><th>Rating</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...staff].sort((a,b) => Number(b.rating||0) - Number(a.rating||0)).map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight:700 }}>{s.name || `${s.first_name||''} ${s.last_name||''}`.trim()}</td>
                      <td><span className={`badge ${s.role==='Doctor'?'badge-purple':'badge-blue'}`}>{s.role}</span></td>
                      <td style={{ color:'#475569' }}>{s.specialization || s.spec || '—'}</td>
                      <td>{s.experience_years ?? s.exp ?? '—'} yrs</td>
                      <td><Stars rating={s.rating||0}/></td>
                      <td><StatusBadge status={s.status}/></td>
                      <td>
                        <button onClick={() => openAvail(s.id)} style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.35rem 0.7rem', background:'white', border:'1px solid #e2e8f0', borderRadius:7, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, color:'#2563eb' }}>
                          <Calendar size={13}/> Schedule
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Availability Modal */}
      {availModal && target && (
        <Modal title={`Availability — ${target.name || `${target.first_name||''} ${target.last_name||''}`.trim()}`} onClose={() => setAvailModal(null)}>
          <p style={{ fontSize:'0.87rem', color:'#64748b', marginBottom:'1rem' }}>
            Set weekly working hours. Changes sync with the booking engine.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {DAYS.map(day => {
              const key = day.toLowerCase();
              const entry = availability[key] || {};
              return (
                <div key={day} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', minWidth:110 }}>
                    <input type="checkbox" checked={entry.enabled !== false}
                      onChange={e => setAvailability(prev => ({ ...prev, [key]: { ...entry, enabled: e.target.checked } }))}
                    /> {day}
                  </label>
                  <input type="text" value={entry.hours || '09:00 – 17:00'}
                    onChange={e => setAvailability(prev => ({ ...prev, [key]: { ...entry, hours: e.target.value } }))}
                    className="form-input" style={{ width:150, fontSize:'0.85rem', padding:'0.4rem 0.75rem' }}
                  />
                </div>
              );
            })}
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setAvailModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={saveAvail} disabled={savingAvail}>
              {savingAvail ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Saving…</> : 'Save Schedule'}
            </button>
          </div>
        </Modal>
      )}

      {/* Add Staff Modal */}
      {addModal && (
        <Modal title="Add Staff Member" onClose={() => setAddModal(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div><label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Dr. Amara Silva" value={form.name} onChange={e => setForm(p => ({...p,name:e.target.value}))}/>
            </div>
            <div style={{ display:'flex', gap:'1rem' }}>
              <div style={{ flex:1 }}><label className="form-label">Role</label>
                <select className="form-input" value={form.role} onChange={e => setForm(p => ({...p,role:e.target.value}))}>
                  <option>Physiotherapist</option><option>Doctor</option>
                </select>
              </div>
              <div style={{ flex:1 }}><label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm(p => ({...p,status:e.target.value}))}>
                  <option>Available</option><option>On Leave</option>
                </select>
              </div>
            </div>
            <div><label className="form-label">Specialization</label>
              <input className="form-input" placeholder="e.g. Sports Therapy" value={form.spec} onChange={e => setForm(p => ({...p,spec:e.target.value}))}/>
            </div>
            <div style={{ display:'flex', gap:'1rem' }}>
              <div style={{ flex:1 }}><label className="form-label">Experience (yrs)</label>
                <input type="number" className="form-input" min={0} value={form.exp} onChange={e => setForm(p => ({...p,exp:e.target.value}))}/>
              </div>
              <div style={{ flex:1 }}><label className="form-label">Initial Rating</label>
                <input type="number" className="form-input" min={1} max={5} step={0.1} value={form.rating} onChange={e => setForm(p => ({...p,rating:e.target.value}))}/>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={addStaff} disabled={saving}>
              {saving ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Adding…</> : 'Add Staff'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
