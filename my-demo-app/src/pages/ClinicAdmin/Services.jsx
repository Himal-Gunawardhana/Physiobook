import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2, Calendar, Users, Settings2, X, Monitor, Package, Activity, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../lib/api';

const TABS = [
  { id:'equipment', label:'Equipment', Icon:Monitor },
  { id:'services',  label:'Services',  Icon:Activity },
  { id:'packages',  label:'Packages',  Icon:Package },
];

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: wide ? 600 : 480 }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoadBlock({ loading, error, children }) {
  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:'4rem', color:'#64748b' }}><Loader size={28} style={{ animation:'spin 1s linear infinite' }}/></div>;
  if (error)   return <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:12, padding:'1.5rem', color:'#991b1b' }}><AlertCircle size={18} style={{ display:'inline', marginRight:'0.5rem' }}/>{error}</div>;
  return children;
}

export default function Services() {
  const { activeClinic } = useOutletContext() ?? {};
  const clinicId = activeClinic?.id;

  const [tab, setTab] = useState('equipment');

  // Equipment
  const [equipment, setEquipment] = useState([]);
  const [eqLoading, setEqLoading] = useState(true);
  const [eqError,   setEqError]   = useState('');
  const [eqModal,   setEqModal]   = useState(null);
  const [eqForm,    setEqForm]    = useState({ name:'', qty:1, status:'Active', portable:false });
  const [eqSaving,  setEqSaving]  = useState(false);

  // Services
  const [services,  setServices]  = useState([]);
  const [svcLoading,setSvcLoading]= useState(true);
  const [svcError,  setSvcError]  = useState('');
  const [svcModal,  setSvcModal]  = useState(null);
  const [svcForm,   setSvcForm]   = useState({ name:'', description:'', duration:'', staff:'', equipment:'None', type:'Clinical', price:'' });
  const [svcSaving, setSvcSaving] = useState(false);

  // Packages
  const [packages,  setPackages]  = useState([]);
  const [pkgLoading,setPkgLoading]= useState(true);
  const [pkgError,  setPkgError]  = useState('');
  const [pkgModal,  setPkgModal]  = useState(null);
  const [pkgForm,   setPkgForm]   = useState({ name:'', includes:'', description:'', base:'', discount:0, fast:false, sessions:1 });
  const [pkgSaving, setPkgSaving] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteConfirmType, setDeleteConfirmType] = useState(null);

  // Load equipment
  const loadEq = useCallback(async () => {
    if (!clinicId) return;
    setEqLoading(true); setEqError('');
    try {
      const data = await api.get(`/clinics/${clinicId}/equipment`);
      const list = Array.isArray(data) ? data : data?.equipment ?? [];
      // Only show active (non-soft-deleted) equipment
      setEquipment(list.filter(e => e.is_active !== false));
    }
    catch (err) { setEqError(err?.message || 'Failed to load equipment.'); }
    finally { setEqLoading(false); }
  }, [clinicId]);

  // Load services
  const loadSvc = useCallback(async () => {
    if (!clinicId) return;
    setSvcLoading(true); setSvcError('');
    try {
      const data = await api.get(`/clinics/${clinicId}/services`);
      const list = Array.isArray(data) ? data : data?.services ?? [];
      setServices(list.filter(s => s.is_active !== false));
    }
    catch (err) { setSvcError(err?.message || 'Failed to load services.'); }
    finally { setSvcLoading(false); }
  }, [clinicId]);

  // Load packages
  const loadPkg = useCallback(async () => {
    if (!clinicId) return;
    setPkgLoading(true); setPkgError('');
    try {
      const data = await api.get(`/clinics/${clinicId}/packages`);
      setPackages(Array.isArray(data) ? data : data?.packages ?? []);
    }
    catch (err) { setPkgError(err?.message || 'Failed to load packages.'); }
    finally { setPkgLoading(false); }
  }, [clinicId]);

  useEffect(() => {
    if (!clinicId) return;
    loadEq(); loadSvc(); loadPkg();
  }, [clinicId, loadEq, loadSvc, loadPkg]);

  // Equipment CRUD
  const addEq = async () => {
    if (!eqForm.name || !clinicId) return;
    setEqSaving(true);
    try {
      const payload = {
        name: eqForm.name,
        quantity: eqForm.qty ? +eqForm.qty : undefined,
        is_portable: eqForm.portable || false,
        status_equipment: eqForm.status_equipment || 'active'
      };
      const created = await api.post(`/clinics/${clinicId}/equipment`, payload);
      setEquipment(prev => [...prev, created]);
      setEqModal(null);
      showToast('Equipment added.');
    } catch (err) { showToast(`Error: ${err?.message}`); }
    finally { setEqSaving(false); }
  };

  const saveEqEdit = async (id) => {
    setEqSaving(true);
    const target = equipment.find(e => e.id === id);
    if (!target) return;
    try {
      const payload = {
        name: eqForm.name ?? target.name,
        quantity: eqForm.qty ? +eqForm.qty : (target.qty ? +target.qty : undefined),
        is_portable: eqForm.portable ?? target.portable ?? false,
        status_equipment: eqForm.status_equipment ?? target.status_equipment ?? 'active'
      };
      const updated = await api.put(`/clinics/${clinicId}/equipment/${id}`, payload);
      setEquipment(prev => prev.map(e => e.id === id ? updated : e));
      setEqModal(null);
      showToast('Equipment updated.');
    } catch (err) { showToast(`Error: ${err?.message}`); }
    finally { setEqSaving(false); }
  };

  const deleteEq = async (id) => {
    try { 
      await api.delete(`/clinics/${clinicId}/equipment/${id}`); 
      setEquipment(prev => prev.filter(e => e.id !== id)); 
      setDeleteConfirm(null);
      showToast('Equipment removed.'); 
    }
    catch (err) { showToast(`Error: ${err?.message}`); }
  };

  // Service CRUD
  const addSvc = async () => {
    if (!svcForm.name || !clinicId) return;
    setSvcSaving(true);
    try {
      const payload = {
        name: svcForm.name,
        description: svcForm.description || undefined,
        duration_minutes: svcForm.duration ? parseInt(svcForm.duration) : undefined,
        price: svcForm.price ? +svcForm.price : undefined,
        requires_equipment: svcForm.equipment === 'None' ? undefined : svcForm.equipment,
      };
      const created = await api.post(`/clinics/${clinicId}/services`, payload);
      setServices(prev => [...prev, created]);
      setSvcModal(null);
      showToast('Service added.');
    } catch (err) { showToast(`Error: ${err?.message}`); }
    finally { setSvcSaving(false); }
  };

  const deleteSvc = async (id) => {
    try { 
      await api.delete(`/clinics/${clinicId}/services/${id}`); 
      setServices(prev => prev.filter(s => s.id !== id)); 
      setDeleteConfirm(null);
      showToast('Service removed.'); 
    }
    catch (err) { showToast(`Error: ${err?.message}`); }
  };

  const saveSvcEdit = async (id) => {
    setSvcSaving(true);
    const target = services.find(s => s.id === id);
    if (!target) return;
    try {
      const payload = {
        name: target.name,
        description: target.description || undefined,
        duration_minutes: target.duration_minutes ? parseInt(target.duration_minutes) : undefined,
        price: target.price ? +target.price : undefined,
        requires_equipment: (target.requires_equipment === 'None' ? undefined : target.requires_equipment) || undefined,
      };
      const updated = await api.put(`/clinics/${clinicId}/services/${id}`, payload);
      setServices(prev => prev.map(s => s.id === id ? updated : s));
      setSvcModal(null);
      showToast('Service updated.');
    } catch (err) { showToast(`Error: ${err?.message}`); }
    finally { setSvcSaving(false); }
  };

  // Package CRUD
  const addPkg = async () => {
    if (!pkgForm.name || !clinicId) return;
    setPkgSaving(true);
    try {
      const payload = {
        name: pkgForm.name,
        session_count: pkgForm.sessions ? +pkgForm.sessions : undefined,
        price: pkgForm.base ? +pkgForm.base : undefined,
        discount_percent: pkgForm.discount ? +pkgForm.discount : 0,
        is_fast_track: pkgForm.fast || false,
        description: pkgForm.description || pkgForm.includes || undefined
      };
      const created = await api.post(`/clinics/${clinicId}/packages`, payload);
      setPackages(prev => [...prev, created]);
      setPkgModal(null);
      showToast('Package created.');
    } catch (err) { showToast(`Error: ${err?.message}`); }
    finally { setPkgSaving(false); }
  };

  const savePkgEdit = async (id) => {
    setPkgSaving(true);
    try {
      const payload = {
        name: pkgForm.name,
        session_count: pkgForm.sessions ? +pkgForm.sessions : undefined,
        price: pkgForm.base ? +pkgForm.base : undefined,
        discount_percent: pkgForm.discount ? +pkgForm.discount : 0,
        is_fast_track: pkgForm.fast || false,
        description: pkgForm.description || pkgForm.includes || undefined
      };
      const updated = await api.put(`/clinics/${clinicId}/packages/${id}`, payload);
      setPackages(prev => prev.map(p => p.id === id ? updated : p));
      setPkgModal(null);
      showToast('Package updated.');
    } catch (err) { showToast(`Error: ${err?.message}`); }
    finally { setPkgSaving(false); }
  };

  const deletePkg = async (id) => {
    try { 
      await api.delete(`/clinics/${clinicId}/packages/${id}`); 
      setPackages(prev => prev.filter(p => p.id !== id)); 
      setDeleteConfirm(null);
      showToast('Package removed.'); 
    }
    catch (err) { showToast(`Error: ${err?.message}`); }
  };

  const finalPrice = (base, disc) => Math.round((base || 0) * (1 - (disc || 0) / 100));
  const editSvcTarget = services.find(s => s.id === svcModal);

  return (
    <div className="animate-in">
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, background:'#0f172a', color:'#fff', borderRadius:12, padding:'0.9rem 1.5rem', fontWeight:600, zIndex:9999, boxShadow:'0 4px 20px rgba(0,0,0,0.2)', fontSize:'0.9rem' }}>
          {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Services, Equipment &amp; Packages</h1>
          <p className="page-subtitle">Configure what your clinic offers and the resources each service requires.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.625rem 1.1rem', fontWeight:600, fontSize:'0.88rem', background:'none', border:'none', cursor:'pointer', color: tab===id?'#2563eb':'#64748b', borderBottom: tab===id?'2.5px solid #2563eb':'2.5px solid transparent', marginBottom:'-2px', transition:'all 0.15s' }}>
            <Icon size={15}/> {label}
          </button>
        ))}
      </div>

      {/* Equipment Tab */}
      {tab === 'equipment' && (
        <div className="card animate-in">
          <div className="section-header-row">
            <h2 style={{ fontSize:'1.05rem', margin:0 }}>Clinic Equipment Inventory</h2>
            <button className="btn-primary" style={{ fontSize:'0.85rem', padding:'0.5rem 1rem' }}
              onClick={() => { setEqForm({ name:'', qty:1, status_equipment:'active', portable:false }); setEqModal('add'); }}>
              <Plus size={14}/> Add Equipment
            </button>
          </div>
          <LoadBlock loading={eqLoading} error={eqError}>
            {equipment.length === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'#94a3b8' }}>No equipment added yet.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Equipment Name</th><th>Qty</th><th>Portability</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {equipment.map(eq => (
                      <tr key={eq.id}>
                        <td style={{ fontWeight:600 }}>{eq.name}</td>
                        <td>{eq.qty || eq.quantity} unit{(eq.qty||eq.quantity)>1?'s':''}</td>
                        <td><span className={`badge ${eq.portable?'badge-purple':'badge-blue'}`}>{eq.portable?'🏠 Portable':'🏥 Clinic Only'}</span></td>
                        <td><span className={`badge ${eq.status_equipment==='active'?'badge-green':eq.status_equipment==='need maintenance'?'badge-amber':'badge-red'}`}>{eq.status_equipment === 'active' ? '✅ Active' : eq.status_equipment === 'need maintenance' ? '🔧 Needs Maintenance' : '⛔ Inactive'}</span></td>
                        <td style={{ display:'flex', gap:'0.5rem' }}>
                          <button onClick={() => { setEqForm({ ...eq, qty:eq.qty||eq.quantity, status_equipment:eq.status_equipment||'active' }); setEqModal(eq.id); }} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.4rem 0.75rem', background:'white', border:'1px solid #e2e8f0', borderRadius:7, cursor:'pointer', fontSize:'0.82rem', fontWeight:600 }}>
                            <Settings2 size={13}/> Edit
                          </button>
                          <button onClick={() => { setDeleteConfirm(eq.id); setDeleteConfirmType('equipment'); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', padding:'0.4rem' }}>
                            <Trash2 size={15}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </LoadBlock>
          <div style={{ marginTop:'1.5rem', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, padding:'1rem 1.25rem', display:'flex', gap:'0.75rem', alignItems:'center', fontSize:'0.9rem' }}>
            <Users size={18} color="#2563eb"/>
            <span style={{ color:'#1d4ed8' }}>To manage doctor and physiotherapist availability, visit <strong>Staff Management</strong> in the sidebar.</span>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {tab === 'services' && (
        <div className="card animate-in">
          <div className="section-header-row">
            <div>
              <h2 style={{ fontSize:'1.05rem', margin:'0 0 0.25rem' }}>Treatments &amp; Service Requirements</h2>
              <p style={{ color:'#64748b', fontSize:'0.875rem', margin:0 }}>Map each service to its required staff and equipment.</p>
            </div>
            <button className="btn-primary" style={{ fontSize:'0.85rem', padding:'0.5rem 1rem', flexShrink:0 }}
              onClick={() => { setSvcForm({ name:'', description:'', duration:'', staff:'', equipment:'None', type:'Clinical', price:'' }); setSvcModal('add'); }}>
              <Plus size={14}/> Add Service
            </button>
          </div>
          <LoadBlock loading={svcLoading} error={svcError}>
            {services.length === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'#94a3b8' }}>No services configured yet.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {services.map(svc => (
                  <div key={svc.id} style={{ padding:'1.25rem', border:'1px solid #e2e8f0', borderRadius:10, background:'#fafafa', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap' }}>
                    <div style={{ flex:1, minWidth:250 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
                        <strong style={{ fontSize:'1rem', color:'#1e293b' }}>{svc.name}</strong>
                        {svc.price && <span className='badge badge-green' style={{ fontSize:'0.75rem' }}>LKR {Number(svc.price).toLocaleString()}</span>}
                      </div>
                      {svc.description && <p style={{ margin:'0 0 0.5rem', fontSize:'0.85rem', color:'#64748b' }}>{svc.description}</p>}
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'0.75rem', fontSize:'0.9rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'#475569' }}>
                          <span style={{ fontSize:'1rem' }}>⏱</span>
                          <div>
                            <div style={{ fontSize:'0.75rem', color:'#94a3b8' }}>Duration</div>
                            <div style={{ fontWeight:500, color:'#1e293b' }}>{svc.duration_minutes ? `${svc.duration_minutes} min` : '—'}</div>
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'#475569' }}>
                          <span style={{ fontSize:'1rem' }}>🔧</span>
                          <div>
                            <div style={{ fontSize:'0.75rem', color:'#94a3b8' }}>Equipment</div>
                            <div style={{ fontWeight:500, color:'#1e293b' }}>{svc.requires_equipment || 'None'}</div>
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'#475569' }}>
                          <span style={{ fontSize:'1rem' }}>💰</span>
                          <div>
                            <div style={{ fontSize:'0.75rem', color:'#94a3b8' }}>Currency</div>
                            <div style={{ fontWeight:500, color:'#1e293b' }}>{svc.currency || 'LKR'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
                      <button onClick={() => setSvcModal(svc.id)} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.5rem 0.85rem', background:'white', border:'1px solid #e2e8f0', borderRadius:7, cursor:'pointer', fontSize:'0.85rem', fontWeight:600, color:'#2563eb', transition:'all 0.2s' }} onMouseEnter={e => e.target.style.background='#eff6ff'} onMouseLeave={e => e.target.style.background='white'}>
                        <Settings2 size={14}/> Edit
                      </button>
                      <button onClick={() => { setDeleteConfirm(svc.id); setDeleteConfirmType('service'); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', padding:'0.5rem', transition:'all 0.2s', fontSize:'0.9rem' }} onMouseEnter={e => e.target.style.opacity='0.7'} onMouseLeave={e => e.target.style.opacity='1'}>
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </LoadBlock>
        </div>
      )}

      {/* Packages Tab */}
      {tab === 'packages' && (
        <div className="animate-in">
          <div className="section-header-row">
            <div>
              <h2 style={{ fontSize:'1.05rem', margin:'0 0 0.25rem' }}>Long-Term &amp; Express Packages</h2>
              <p style={{ color:'#64748b', fontSize:'0.875rem', margin:0 }}>Packages marked ⚡ Fast-Track appear on the patient portal as a simplified booking option.</p>
            </div>
            <button className="btn-primary" style={{ fontSize:'0.85rem', padding:'0.5rem 1rem', flexShrink:0 }}
              onClick={() => { setPkgForm({ name:'', includes:'', description:'', base:'', discount:0, fast:false, sessions:1 }); setPkgModal('add'); }}>
              <Plus size={14}/> New Package
            </button>
          </div>
          <LoadBlock loading={pkgLoading} error={pkgError}>
            {packages.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:14, padding:'3rem', textAlign:'center', color:'#94a3b8', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>No packages yet.</div>
            ) : (
              <div className="package-grid">
                {packages.map(pkg => {
                  const isFast = pkg.is_fast_track || pkg.fast;
                  const base = Number(pkg.price || pkg.base_price || pkg.base || 0);
                  const disc = Number(pkg.discount_percent || pkg.discount || 0);
                  const sessions = pkg.session_count || 1;
                  return (
                    <div key={pkg.id} style={{ border:`2px solid ${isFast?'#38bdf8':'#e2e8f0'}`, borderRadius:14, overflow:'hidden', background: isFast ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' : 'white', boxShadow: isFast ? '0 4px 16px rgba(56,189,248,0.15)' : '0 1px 4px rgba(0,0,0,0.05)', position:'relative' }}>
                      {isFast && <div style={{ position:'absolute', top:12, right:12, background:'linear-gradient(135deg, #0ea5e9, #2563eb)', color:'white', padding:'0.25rem 0.65rem', borderRadius:20, fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.03em', boxShadow:'0 2px 8px rgba(14,165,233,0.3)' }}>⚡ FAST-TRACK</div>}
                      <div style={{ padding:'1.25rem', background: isFast ? 'transparent' : '#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
                        <h3 style={{ margin:'0 0 0.3rem', fontSize:'1rem' }}>{pkg.name}</h3>
                        <p style={{ margin:0, fontSize:'0.82rem', color:'#64748b' }}>{pkg.description || pkg.includes}</p>
                        <div style={{ marginTop:'0.5rem', display:'flex', gap:'0.5rem' }}>
                          <span className='badge badge-blue' style={{ fontSize:'0.72rem' }}>{sessions} session{sessions > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.88rem', color:'#64748b' }}>
                          <span>Base Price</span>
                          <span style={{ textDecoration: disc>0?'line-through':'none' }}>LKR {base.toLocaleString()}</span>
                        </div>
                        {disc > 0 && (
                          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.88rem' }}>
                            <span style={{ color:'#16a34a', fontWeight:600 }}>Discount</span>
                            <span style={{ color:'#16a34a', fontWeight:600 }}>{disc}% off</span>
                          </div>
                        )}
                        <div style={{ height:1, background:'#e2e8f0', margin:'0.25rem 0' }}/>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontWeight:700, fontSize:'1.05rem', color: isFast ? '#0369a1' : '#1e293b' }}>LKR {finalPrice(base, disc).toLocaleString()}</span>
                          <div style={{ display:'flex', gap:'0.5rem' }}>
                            <button onClick={() => { setPkgForm({ name: pkg.name, includes: pkg.description || pkg.includes, description: pkg.description || pkg.includes, base: base, discount: disc, fast: isFast, sessions: sessions }); setPkgModal(pkg.id); }} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.4rem 0.75rem', background:'white', border:'1px solid #e2e8f0', borderRadius:7, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, color:'#2563eb', transition:'all 0.2s' }} onMouseEnter={e => e.target.style.background='#eff6ff'} onMouseLeave={e => e.target.style.background='white'}>
                              <Settings2 size={14}/> Edit
                            </button>
                            <button onClick={() => { setDeleteConfirm(pkg.id); setDeleteConfirmType('package'); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', padding:'0.5rem', transition:'all 0.2s', fontSize:'0.9rem' }} onMouseEnter={e => e.target.style.opacity='0.7'} onMouseLeave={e => e.target.style.opacity='1'}>
                              <Trash2 size={15}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </LoadBlock>
        </div>
      )}

      {/* Add Equipment Modal */}
      {eqModal === 'add' && (
        <Modal title="Add New Equipment" onClose={() => setEqModal(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div><label className="form-label">Equipment Name</label>
              <input className="form-input" placeholder="e.g. Laser Therapy Unit" value={eqForm.name} onChange={e => setEqForm(p => ({...p,name:e.target.value}))}/></div>
            <div style={{ display:'flex', gap:'1rem' }}>
              <div style={{ flex:1 }}><label className="form-label">Quantity</label>
                <input type="number" className="form-input" min={1} value={eqForm.qty} onChange={e => setEqForm(p => ({...p,qty:e.target.value}))}/></div>
              <div style={{ flex:1 }}><label className="form-label">Status</label>
                <select className="form-input" value={eqForm.status_equipment} onChange={e => setEqForm(p => ({...p,status_equipment:e.target.value}))}>
                  <option value="active">Active</option><option value="need maintenance">Needs Maintenance</option><option value="inactive">Inactive</option>
                </select></div>
            </div>
            <div><label className="form-label">Portability</label>
              <select className="form-input" value={String(eqForm.portable)} onChange={e => setEqForm(p => ({...p,portable:e.target.value==='true'}))}>
                <option value="false">🏥 Clinic Only</option><option value="true">🏠 Portable (Home Visits)</option>
              </select></div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setEqModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={addEq} disabled={eqSaving}>
              {eqSaving ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Saving…</> : 'Add Equipment'}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Equipment Modal */}
      {eqModal && eqModal !== 'add' && equipment.find(e => e.id === eqModal) && (
        <Modal title={`Edit — ${equipment.find(e => e.id === eqModal)?.name}`} onClose={() => setEqModal(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div><label className="form-label">Quantity</label>
              <input type="number" className="form-input" min={1} value={eqForm.qty} 
                onChange={e => setEqForm(p => ({...p,qty:e.target.value}))}/></div>
            <div><label className="form-label">Status</label>
              <select className="form-input" value={eqForm.status_equipment} onChange={e => setEqForm(p => ({...p,status_equipment:e.target.value}))}>
                <option value="active">Active</option><option value="need maintenance">Needs Maintenance</option><option value="inactive">Inactive</option>
              </select></div>
            <div><label className="form-label">Portability</label>
              <select className="form-input" value={String(eqForm.portable)} onChange={e => setEqForm(p => ({...p,portable:e.target.value==='true'}))}>
                <option value="false">🏥 Clinic Only</option><option value="true">🏠 Portable (Home Visits)</option>
              </select></div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setEqModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={() => saveEqEdit(eqModal)} disabled={eqSaving}>
              {eqSaving ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Saving…</> : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {/* Add Service Modal */}
      {svcModal === 'add' && (
        <Modal title="Add New Service" onClose={() => setSvcModal(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div><label className="form-label">Service Name</label>
              <input className="form-input" placeholder="e.g. Laser Therapy" value={svcForm.name} onChange={e => setSvcForm(p => ({...p,name:e.target.value}))}/></div>
            <div><label className="form-label">Description</label>
              <input className="form-input" placeholder="e.g. Standard 45-minute therapy session" value={svcForm.description} onChange={e => setSvcForm(p => ({...p,description:e.target.value}))}/></div>
            <div style={{ display:'flex', gap:'1rem' }}>
              <div style={{ flex:1 }}><label className="form-label">Duration (minutes)</label>
                <input type="number" className="form-input" placeholder="45" min={1} value={svcForm.duration} onChange={e => setSvcForm(p => ({...p,duration:e.target.value}))}/></div>
              <div style={{ flex:1 }}><label className="form-label">Price (LKR)</label>
                <input type="number" className="form-input" placeholder="3500" min={0} value={svcForm.price} onChange={e => setSvcForm(p => ({...p,price:e.target.value}))}/></div>
            </div>
            <div><label className="form-label">Required Equipment</label>
              <select className="form-input" value={svcForm.equipment} onChange={e => setSvcForm(p => ({...p,equipment:e.target.value}))}>
                <option value="None">None (Standard Room)</option>
                {equipment.map(e => <option key={e.id}>{e.name}</option>)}
              </select></div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setSvcModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={addSvc} disabled={svcSaving}>
              {svcSaving ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Saving…</> : 'Add Service'}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Service Modal */}
      {svcModal && svcModal !== 'add' && editSvcTarget && (
        <Modal title={`Edit — ${editSvcTarget.name}`} onClose={() => setSvcModal(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div><label className="form-label">Service Name</label>
              <input className="form-input" value={editSvcTarget.name||''}
                onChange={e => setServices(prev => prev.map(s => s.id===svcModal?{...s,name:e.target.value}:s))}/></div>
            <div><label className="form-label">Description</label>
              <input className="form-input" placeholder="Brief description" value={editSvcTarget.description||''}
                onChange={e => setServices(prev => prev.map(s => s.id===svcModal?{...s,description:e.target.value}:s))}/></div>
            <div style={{ display:'flex', gap:'1rem' }}>
              <div style={{ flex:1 }}><label className="form-label">Duration (minutes)</label>
                <input type="number" className="form-input" placeholder="45" min={1} value={editSvcTarget.duration_minutes||''}
                  onChange={e => setServices(prev => prev.map(s => s.id===svcModal?{...s,duration_minutes:e.target.value}:s))}/></div>
              <div style={{ flex:1 }}><label className="form-label">Price (LKR)</label>
                <input type="number" className="form-input" placeholder="3500" min={0} value={editSvcTarget.price||''}
                  onChange={e => setServices(prev => prev.map(s => s.id===svcModal?{...s,price:e.target.value}:s))}/></div>
            </div>
            <div><label className="form-label">Required Equipment</label>
              <select className="form-input" value={editSvcTarget.requires_equipment||'None'}
                onChange={e => setServices(prev => prev.map(s => s.id===svcModal?{...s,requires_equipment:e.target.value}:s))}>
                <option value="None">None (Standard Room)</option>
                {equipment.map(e => <option key={e.id}>{e.name}</option>)}
              </select></div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setSvcModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={() => saveSvcEdit(svcModal)} disabled={svcSaving}>
              {svcSaving ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Saving…</> : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {/* Create Package Modal */}
      {pkgModal === 'add' && (
        <Modal title="Create New Package" onClose={() => setPkgModal(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div><label className="form-label">Package Name</label>
              <input className="form-input" placeholder="e.g. 10× Post-Natal Rehab" value={pkgForm.name} onChange={e => setPkgForm(p => ({...p,name:e.target.value}))}/></div>
            <div><label className="form-label">What's Included</label>
              <input className="form-input" placeholder="e.g. 10 Post-Natal Sessions" value={pkgForm.includes} onChange={e => setPkgForm(p => ({...p,includes:e.target.value}))}/></div>
            <div style={{ display:'flex', gap:'1rem' }}>
              <div style={{ flex:1 }}><label className="form-label">Sessions</label>
                <input type="number" className="form-input" placeholder="5" min={1} value={pkgForm.sessions} onChange={e => setPkgForm(p => ({...p,sessions:e.target.value}))}/></div>
              <div style={{ flex:1 }}><label className="form-label">Base Price (LKR)</label>
                <input type="number" className="form-input" placeholder="25000" value={pkgForm.base} onChange={e => setPkgForm(p => ({...p,base:e.target.value}))}/></div>
              <div style={{ flex:1 }}><label className="form-label">Discount %</label>
                <input type="number" className="form-input" placeholder="15" min={0} max={100} value={pkgForm.discount} onChange={e => setPkgForm(p => ({...p,discount:e.target.value}))}/></div>
            </div>
            <div>
              <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer' }}>
                <input type="checkbox" checked={pkgForm.fast} onChange={e => setPkgForm(p => ({...p,fast:e.target.checked}))}/>
                <span className="form-label" style={{ margin:0 }}>⚡ Mark as Fast-Track (simple time-only booking for patients)</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setPkgModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={addPkg} disabled={pkgSaving}>
              {pkgSaving ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Creating…</> : 'Create Package'}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Package Modal */}
      {pkgModal && pkgModal !== 'add' && packages.find(p => p.id === pkgModal) && (
        <Modal title={`Edit — ${packages.find(p => p.id === pkgModal)?.name}`} onClose={() => setPkgModal(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div><label className="form-label">Package Name</label>
              <input className="form-input" placeholder="e.g. 3-Session Bundle" value={pkgForm.name} onChange={e => setPkgForm(p => ({...p,name:e.target.value}))}/></div>
            <div><label className="form-label">Description</label>
              <input className="form-input" placeholder="What's included" value={pkgForm.includes||pkgForm.description||''} onChange={e => setPkgForm(p => ({...p,includes:e.target.value,description:e.target.value}))}/></div>
            <div style={{ display:'flex', gap:'1rem' }}>
              <div style={{ flex:1 }}><label className="form-label">Sessions</label>
                <input type="number" className="form-input" placeholder="5" min={1} value={pkgForm.sessions||''} onChange={e => setPkgForm(p => ({...p,sessions:e.target.value}))}/></div>
              <div style={{ flex:1 }}><label className="form-label">Base Price (LKR)</label>
                <input type="number" className="form-input" placeholder="25000" value={pkgForm.base} onChange={e => setPkgForm(p => ({...p,base:e.target.value}))}/></div>
              <div style={{ flex:1 }}><label className="form-label">Discount %</label>
                <input type="number" className="form-input" placeholder="15" min={0} max={100} value={pkgForm.discount} onChange={e => setPkgForm(p => ({...p,discount:e.target.value}))}/></div>
            </div>
            <div>
              <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer' }}>
                <input type="checkbox" checked={pkgForm.fast} onChange={e => setPkgForm(p => ({...p,fast:e.target.checked}))}/>
                <span className="form-label" style={{ margin:0 }}>⚡ Mark as Fast-Track (simple time-only booking for patients)</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setPkgModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={() => savePkgEdit(pkgModal)} disabled={pkgSaving}>
              {pkgSaving ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Saving…</> : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal title="Confirm Deletion" onClose={() => { setDeleteConfirm(null); setDeleteConfirmType(null); }}>
          <div style={{ padding:'1rem 0' }}>
            <p style={{ color:'#475569', fontSize:'0.95rem', marginBottom:'0.5rem' }}>
              Are you sure you want to delete this {deleteConfirmType === 'equipment' ? 'equipment' : deleteConfirmType === 'package' ? 'package' : 'service'}?
            </p>
            <p style={{ color:'#94a3b8', fontSize:'0.9rem', margin:0 }}>This action cannot be undone.</p>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => { setDeleteConfirm(null); setDeleteConfirmType(null); }}>Cancel</button>
            <button style={{ background:'#ef4444', color:'white', border:'none', padding:'0.5rem 1rem', borderRadius:7, fontWeight:600, cursor:'pointer', fontSize:'0.9rem' }} 
              onClick={() => {
                if (deleteConfirmType === 'equipment') deleteEq(deleteConfirm);
                else if (deleteConfirmType === 'package') deletePkg(deleteConfirm);
                else deleteSvc(deleteConfirm);
              }}>
              Delete {deleteConfirmType === 'equipment' ? 'Equipment' : deleteConfirmType === 'package' ? 'Package' : 'Service'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
