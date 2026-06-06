import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  UserPlus, X, Star, Calendar, Loader, AlertCircle,
  RefreshCw, Search, Mail, CheckCircle, UserCheck, Clock, Send, Download
} from 'lucide-react';
import api from '../../lib/api';
import AvailabilityImportModal from '../../components/AvailabilityImportModal';

/* ── Small helpers ─────────────────────────────────────────────── */
function Stars({ rating }) {
  return (
    <span style={{ display:'flex', alignItems:'center', gap:'0.2rem', color:'#f59e0b', fontWeight:700, fontSize:'0.87rem' }}>
      <Star size={13} fill="#f59e0b"/> {Number(rating).toFixed(1)}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = { Available:'badge-green', 'In Session':'badge-blue', 'On Leave':'badge-amber', Pending:'badge-amber' };
  return <span className={`badge ${map[status]||'badge-blue'}`}>{status}</span>;
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ ...(wide ? { maxWidth: 560 } : {}), overflow: 'visible' }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Step indicator ─────────────────────────────────────────────── */
function StepBar({ step }) {
  const steps = ['Search', 'Invite', 'Confirm'];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:'1.5rem' }}>
      {steps.map((label, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <React.Fragment key={label}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.3rem' }}>
              <div style={{
                width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:700, fontSize:'0.85rem',
                background: done ? '#10b981' : active ? '#2563eb' : '#e2e8f0',
                color: (done || active) ? '#fff' : '#94a3b8',
                transition:'all 0.2s',
              }}>
                {done ? <CheckCircle size={16}/> : num}
              </div>
              <span style={{ fontSize:'0.7rem', fontWeight:600, color: active ? '#2563eb' : done ? '#10b981' : '#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex:1, height:2, background: step > num ? '#10b981' : '#e2e8f0', margin:'0 0.5rem', marginBottom:'1.25rem', transition:'background 0.3s' }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────── */
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function StaffManagement() {
  const [staff,        setStaff]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [availModal,   setAvailModal]   = useState(null);
  const [availability, setAvailability] = useState({});
  const [savingAvail,  setSavingAvail]  = useState(false);
  const [toast,        setToast]        = useState(null);
  const [importModal,  setImportModal]  = useState(null); // { staffId, clinicId, therapistUserId, therapistName, profileAvailability }
  const [clinicId,     setClinicId]     = useState(null);
  const { activeClinic } = useOutletContext();

  // Onboarding wizard
  const [wizardOpen,   setWizardOpen]   = useState(false);
  const [wizStep,      setWizStep]      = useState(1);

  // Step 1 – search
  const [searchEmail,  setSearchEmail]  = useState('');
  const [searching,    setSearching]    = useState(false);
  const [searchResult, setSearchResult] = useState(null); // { found: bool, user?: {...}, invited?: bool }
  const [searchError,  setSearchError]  = useState('');

  // Step 2 – invite
  const [sending,      setSending]      = useState(false);
  const [inviteSent,   setInviteSent]   = useState(false);

  // Step 3 – confirm add
  const [addSpec,      setAddSpec]      = useState('');
  const [addExp,       setAddExp]       = useState('');
  const [adding,       setAdding]       = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const q = activeClinic?.id ? `?clinic_id=${activeClinic.id}` : '';
      const data = await api.get(`/staff${q}`);
      setStaff(Array.isArray(data) ? data : data?.staff ?? []);
      
      // Also fetch clinic info to get clinicId
      const clinicData = await api.get('/clinics/mine/status').catch(() => ({}));
      if (clinicData.clinic?.id) {
        setClinicId(clinicData.clinic.id);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load staff.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Wizard helpers */
  const openWizard = () => {
    setWizardOpen(true); setWizStep(1);
    setSearchEmail(''); setSearchResult(null); setSearchError('');
    setInviteSent(false); setAddSpec(''); setAddExp('');
  };
  const closeWizard = () => setWizardOpen(false);

  /* Step 2 – send invite email */
  const handleSendInvite = async () => {
    setSending(true);
    try {
      // POST /staff/onboarding/invite  → sends onboarding email
      await api.post('/staff/onboarding/invite', { email: searchEmail.trim() });
      setInviteSent(true);
      showToast(`Invite sent to ${searchEmail}`);
    } catch (err) {
      showToast(err?.message || 'Failed to send invite.', 'error');
    } finally {
      setSending(false);
    }
  };

  /* Step 3 – confirm add therapist to clinic */
  const handleConfirmAdd = async () => {
    setAdding(true);
    try {
      // POST /staff — directly add an existing user to the clinic
      const created = await api.post('/staff', {
        email: searchEmail.trim(),
        firstName: searchResult?.firstName || '',
        lastName: searchResult?.lastName || '',
        roleInClinic: 'therapist',
        specialization: addSpec || undefined,
        experienceYears: addExp ? +addExp : undefined,
      });
      
      setStaff(prev => [...prev, created]);
      
      // Show import modal if profile availability is available
      if (created && created.profileAvailability && clinicId) {
        setImportModal({
          staffId: created.id,
          clinicId: clinicId,
          therapistUserId: searchResult?.userId || created.user_id,
          therapistName: `${created.firstName || created.first_name} ${created.lastName || created.last_name}`.trim(),
          profileAvailability: created.profileAvailability,
        });
        closeWizard();
      } else {
        closeWizard();
        showToast('Physiotherapist added to your clinic!');
      }
    } catch (err) {
      showToast(err?.message || 'Failed to add therapist.', 'error');
    } finally {
      setAdding(false);
    }
  };

  /* Availability modal */
  const openAvail = async (id) => {
    setAvailModal(id);
    try {
      const data = await api.get(`/staff/${id}/availability`);
      setAvailability(data || {});
    } catch { setAvailability({}); }
  };

  const saveAvail = async () => {
    setSavingAvail(true);
    try {
      await api.put(`/staff/${availModal}/availability`, availability);
      showToast('Schedule saved.');
      setAvailModal(null);
    } catch (err) {
      showToast(err?.message || 'Failed to save schedule.', 'error');
    } finally {
      setSavingAvail(false);
    }
  };

  const target = staff.find(s => s.id === availModal);
  const avgRating = staff.length
    ? (staff.reduce((a, s) => a + Number(s.rating || 0), 0) / staff.length).toFixed(1) : '—';

  /* ── Wizard modal content ──────────────────────────────────────── */

  // Live email search state
  const [suggestions,    setSuggestions]    = useState([]);
  const [showDropdown,   setShowDropdown]   = useState(false);
  const [searchTimer,    setSearchTimer]    = useState(null);
  const [selectedUser,   setSelectedUser]   = useState(null); // full user from suggestion

  const handleEmailChange = (val) => {
    setSearchEmail(val);
    setSearchResult(null);
    setSearchError('');
    setSelectedUser(null);

    // Clear previous timer
    if (searchTimer) clearTimeout(searchTimer);

    if (val.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Debounce: search after 300ms of no typing
    const timer = setTimeout(async () => {
      try {
        const results = await api.get(`/staff/onboarding/search?q=${encodeURIComponent(val.trim())}`);
        setSuggestions(Array.isArray(results) ? results : []);
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    setSearchTimer(timer);
  };

  const selectSuggestion = (user) => {
    setSearchEmail(user.fullEmail);
    setSelectedUser(user);
    setShowDropdown(false);
    setSuggestions([]);
    // Auto-lookup
    setSearchResult({
      exists: true,
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.fullEmail,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isActive: true,
    });
  };

  // Direct lookup for typed email (when user presses Enter or Search)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    setSearching(true); setSearchResult(null); setSearchError(''); setShowDropdown(false);
    try {
      const data = await api.post('/staff/onboarding/lookup', { email: searchEmail.trim() });
      setSearchResult(data);
    } catch (err) {
      setSearchError(err?.message || 'Search failed. Try again.');
    } finally {
      setSearching(false);
    }
  };

  const renderWizard = () => {
    /* Step 1 */
    if (wizStep === 1) {
      const isExistingTherapist = searchResult?.exists && searchResult?.role === 'therapist';
      const isExistingOther = searchResult?.exists && searchResult?.role !== 'therapist';
      const isNotFound = searchResult && !searchResult.exists;

      return (
        <>
          <StepBar step={1}/>
          <p style={{ fontSize:'0.9rem', color:'#64748b', marginBottom:'1.25rem' }}>
            Start typing the physiotherapist's email to search. If they're already on the platform
            you can add them directly; otherwise we'll send an invite.
          </p>

          {/* Search with live dropdown */}
          <div style={{ position:'relative', marginBottom:'1rem' }}>
            <form onSubmit={handleSearch} style={{ display:'flex', gap:'0.5rem' }}>
              <div style={{ flex:1, position:'relative' }}>
                <input
                  type="email" className="form-input" placeholder="Start typing email..."
                  value={searchEmail}
                  onChange={e => handleEmailChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  autoComplete="off"
                  style={{ width:'100%' }}
                />

                {/* Dropdown suggestions */}
                {showDropdown && suggestions.length > 0 && (
                  <div style={{
                    position:'absolute', top:'100%', left:0, right:0, zIndex:100,
                    background:'#fff', border:'1px solid #e2e8f0', borderRadius:10,
                    boxShadow:'0 8px 32px rgba(0,0,0,0.12)', marginTop:4,
                    maxHeight:240, overflowY:'auto',
                  }}>
                    {suggestions.map((user, i) => (
                      <button
                        key={user.userId || i}
                        type="button"
                        onMouseDown={() => selectSuggestion(user)}
                        style={{
                          display:'flex', alignItems:'center', gap:'0.75rem',
                          width:'100%', padding:'0.75rem 1rem', background:'transparent',
                          border:'none', cursor:'pointer', textAlign:'left',
                          borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                          transition:'background 0.15s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg, #dbeafe, #e0e7ff)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'0.8rem', fontWeight:700, color:'#4338ca' }}>
                          {(user.firstName?.[0] || '').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase()}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:600, fontSize:'0.88rem', color:'#0f172a' }}>
                            {user.firstName} {user.lastName}
                          </div>
                          <div style={{ fontSize:'0.78rem', color:'#94a3b8' }}>
                            {user.email} · {user.role}
                          </div>
                        </div>
                        <span style={{ padding:'0.15rem 0.5rem', borderRadius:12, fontSize:'0.7rem', fontWeight:600, background: user.role === 'therapist' ? '#dcfce7' : '#f0f9ff', color: user.role === 'therapist' ? '#166534' : '#1d4ed8' }}>
                          {user.role === 'therapist' ? 'Therapist' : 'Patient'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="btn-primary" disabled={searching} style={{ whiteSpace:'nowrap' }}>
                {searching ? <Loader size={15} style={{ animation:'spin 1s linear infinite' }}/> : <><Search size={15}/> Search</>}
              </button>
            </form>
          </div>

          {searchError && (
            <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'0.75rem 1rem', color:'#991b1b', fontSize:'0.875rem', display:'flex', gap:'0.5rem', alignItems:'center' }}>
              <AlertCircle size={15}/> {searchError}
            </div>
          )}

          {/* Results */}
          {isExistingTherapist && (
            <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:12, padding:'1rem 1.25rem', marginTop:'0.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.5rem' }}>
                <UserCheck size={18} color="#16a34a"/>
                <span style={{ fontWeight:700, color:'#16a34a' }}>Registered Physiotherapist Found</span>
              </div>
              <p style={{ fontSize:'0.87rem', color:'#15803d', margin:0 }}>
                <strong>{searchResult.firstName} {searchResult.lastName}</strong> ({searchEmail}) is already
                registered as a physiotherapist. You can add them directly to your clinic.
              </p>
              <div className="modal-footer" style={{ paddingTop:'1rem', paddingBottom:0 }}>
                <button className="btn-ghost" onClick={closeWizard}>Cancel</button>
                <button className="btn-primary" onClick={() => setWizStep(3)}>
                  Add to Clinic →
                </button>
              </div>
            </div>
          )}

          {isExistingOther && (
            <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:12, padding:'1rem 1.25rem', marginTop:'0.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.5rem' }}>
                <AlertCircle size={18} color="#d97706"/>
                <span style={{ fontWeight:700, color:'#d97706' }}>Account Exists — Not a Therapist</span>
              </div>
              <p style={{ fontSize:'0.87rem', color:'#92400e', margin:0 }}>
                This email is registered but not as a physiotherapist. Send them an onboarding
                invite so they can join as a therapist.
              </p>
              <div className="modal-footer" style={{ paddingTop:'1rem', paddingBottom:0 }}>
                <button className="btn-ghost" onClick={closeWizard}>Cancel</button>
                <button className="btn-primary" style={{ background:'#d97706' }} onClick={() => setWizStep(2)}>
                  <Send size={14}/> Send Invite →
                </button>
              </div>
            </div>
          )}

          {isNotFound && (
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12, padding:'1rem 1.25rem', marginTop:'0.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.5rem' }}>
                <Mail size={18} color="#2563eb"/>
                <span style={{ fontWeight:700, color:'#1d4ed8' }}>No Account Found</span>
              </div>
              <p style={{ fontSize:'0.87rem', color:'#1e40af', margin:0 }}>
                <strong>{searchEmail}</strong> doesn't have a Physiobook account yet. Send them an
                onboarding invite to sign up as a physiotherapist.
              </p>
              <div className="modal-footer" style={{ paddingTop:'1rem', paddingBottom:0 }}>
                <button className="btn-ghost" onClick={closeWizard}>Cancel</button>
                <button className="btn-primary" onClick={() => setWizStep(2)}>
                  <Send size={14}/> Send Invite →
                </button>
              </div>
            </div>
          )}
        </>
      );
    }

    /* Step 2 – invite */
    if (wizStep === 2) {
      return (
        <>
          <StepBar step={2}/>
          {!inviteSent ? (
            <>
              <div style={{ textAlign:'center', padding:'1rem 0 1.5rem' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#2563eb,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
                  <Mail size={28} color="#fff"/>
                </div>
                <h4 style={{ margin:'0 0 0.5rem', fontWeight:700, color:'#0f172a', fontSize:'1.1rem' }}>Send Onboarding Invite</h4>
                <p style={{ color:'#64748b', fontSize:'0.9rem', margin:0 }}>
                  An email will be sent to <strong>{searchEmail}</strong> with a link to register as a
                  physiotherapist. Once they sign up, come back here to add them.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn-ghost" onClick={() => setWizStep(1)}>← Back</button>
                <button className="btn-primary" onClick={handleSendInvite} disabled={sending}>
                  {sending
                    ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Sending…</>
                    : <><Send size={14}/> Send Invite</>}
                </button>
              </div>
            </>
          ) : (
            /* Invite sent confirmation */
            <div style={{ textAlign:'center', padding:'1rem 0 1.5rem' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
                <CheckCircle size={28} color="#fff"/>
              </div>
              <h4 style={{ margin:'0 0 0.5rem', fontWeight:700, color:'#0f172a', fontSize:'1.1rem' }}>Invite Sent!</h4>
              <p style={{ color:'#64748b', fontSize:'0.9rem', marginBottom:'1.5rem' }}>
                An email was sent to <strong>{searchEmail}</strong>. Once they register and verify their
                account, search for them again to add them to your clinic.
              </p>
              <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:10, padding:'0.875rem', fontSize:'0.85rem', color:'#166534', marginBottom:'1.25rem' }}>
                <Clock size={14} style={{ display:'inline', marginRight:'0.4rem' }}/>
                Come back after the physiotherapist has signed up to complete the process.
              </div>
              <button className="btn-primary" style={{ width:'100%', justifyContent:'center' }} onClick={closeWizard}>
                Done
              </button>
            </div>
          )}
        </>
      );
    }

    /* Step 3 – confirm add */
    if (wizStep === 3) {
      return (
        <>
          <StepBar step={3}/>
          <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:10, padding:'0.875rem 1rem', marginBottom:'1.25rem', display:'flex', gap:'0.5rem', alignItems:'center' }}>
            <UserCheck size={16} color="#16a34a"/>
            <span style={{ fontSize:'0.87rem', color:'#15803d', fontWeight:500 }}>
              Adding <strong>{searchResult?.user?.firstName} {searchResult?.user?.lastName}</strong> ({searchEmail})
            </span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div>
              <label className="form-label">Specialization</label>
              <input className="form-input" placeholder="e.g. Sports Therapy, Back Pain" value={addSpec} onChange={e => setAddSpec(e.target.value)}/>
            </div>
            <div>
              <label className="form-label">Experience (years) <span style={{ color:'#94a3b8', fontWeight:400 }}>(optional)</span></label>
              <input type="number" className="form-input" min={0} value={addExp} onChange={e => setAddExp(e.target.value)}/>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setWizStep(1)}>← Back</button>
            <button className="btn-primary" onClick={handleConfirmAdd} disabled={adding}>
              {adding
                ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Adding…</>
                : <><UserPlus size={14}/> Confirm & Add</>}
            </button>
          </div>
        </>
      );
    }
  }

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div className="animate-in">
      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', top:20, right:20, borderRadius:12,
          padding:'0.9rem 1.5rem', fontWeight:600, zIndex:9999,
          boxShadow:'0 4px 20px rgba(0,0,0,0.2)', fontSize:'0.9rem',
          background: toast.type === 'error' ? '#ef4444' : '#0f172a',
          color:'#fff',
        }}>
          {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Manage physiotherapist availability and track performance.</p>
        </div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <button onClick={load} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.45rem 0.875rem', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:8, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, color:'#374151' }}>
            <RefreshCw size={14}/>
          </button>
          <button className="btn-primary" onClick={openWizard}>
            <UserPlus size={16}/> Add Physiotherapist
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom:'1.5rem' }}>
        {[
          { label:'Total Staff',   value: staff.length },
          { label:'Available Now', value: staff.filter(s => s.status === 'Available').length },
          { label:'In Session',    value: staff.filter(s => s.status === 'In Session').length },
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
            <div style={{ textAlign:'center', padding:'3rem' }}>
              <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>👨‍⚕️</div>
              <p style={{ color:'#64748b', fontWeight:600 }}>No staff members yet.</p>
              <p style={{ color:'#94a3b8', fontSize:'0.875rem' }}>Click "Add Physiotherapist" to onboard your first therapist.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Specialization</th><th>Experience</th><th>Rating</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...staff].sort((a, b) => Number(b.rating||0) - Number(a.rating||0)).map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight:700 }}>{s.name || `${s.firstName||s.first_name||''} ${s.lastName||s.last_name||''}`.trim()}</div>
                        <div style={{ fontSize:'0.78rem', color:'#94a3b8' }}>{s.email}</div>
                      </td>
                      <td style={{ color:'#475569' }}>{s.specialization || s.spec || '—'}</td>
                      <td>{s.experience_years ?? s.exp ?? '—'} yrs</td>
                      <td><Stars rating={s.rating||0}/></td>
                      <td><StatusBadge status={s.status}/></td>
                      <td>
                        <button onClick={() => {
                          if (clinicId) {
                            setImportModal({
                              staffId: s.id,
                              clinicId: clinicId,
                              therapistUserId: s.user_id,
                              therapistName: s.name || `${s.firstName||s.first_name||''} ${s.lastName||s.last_name||''}`.trim(),
                              profileAvailability: null, // Will be fetched
                            });
                          }
                        }} style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.35rem 0.7rem', background:'white', border:'1px solid #e2e8f0', borderRadius:7, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, color:'#10b981' }}>
                          <Download size={13}/> Import
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

      {/* Availability Import Modal */}
      {importModal && (
        <AvailabilityImportModal
          isOpen={!!importModal}
          onClose={() => setImportModal(null)}
          onSuccess={(result) => {
            showToast('✨ Availability imported successfully!');
            // Update staff in list
            setStaff(prev => prev.map(s => s.id === importModal.staffId ? { ...s, ...result } : s));
          }}
          staffId={importModal.staffId}
          clinicId={importModal.clinicId}
          therapistUserId={importModal.therapistUserId}
          therapistName={importModal.therapistName}
          profileAvailability={importModal.profileAvailability}
        />
      )}

      {/* Onboarding Wizard */}
      {wizardOpen && (
        <Modal title="Onboard Physiotherapist" onClose={closeWizard} wide>
          {renderWizard()}
        </Modal>
      )}

      {/* Availability Modal */}
      {availModal && target && (
        <Modal
          title={`Availability — ${target.name || `${target.firstName||target.first_name||''} ${target.lastName||target.last_name||''}`.trim()}`}
          onClose={() => setAvailModal(null)}
        >
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
    </div>
  );
}
