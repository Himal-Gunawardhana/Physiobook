import React, { useState, useEffect, useCallback } from 'react';
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
  const [svcForm,   setSvcForm]   = useState({ name:'', duration:'', staff:'', equipment:'None', type:'Clinical' });
  const [svcSaving, setSvcSaving] = useState(false);

  // Packages
  const [packages,  setPackages]  = useState([]);
  const [pkgLoading,setPkgLoading]= useState(true);
  const [pkgError,  setPkgError]  = useState('');
  const [pkgModal,  setPkgModal]  = useState(null);
  const [pkgForm,   setPkgForm]   = useState({ name:'', includes:'', base:'', discount:0, fast:false });
  const [pkgSaving, setPkgSaving] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Load equipment
  const loadEq = useCallback(async () => {
    setEqLoading(true); setEqError('');
    try { setEquipment(await api.get('/equipment')); }
    catch (err) { setEqError(err?.message || 'Failed to load equipment.'); }
    finally { setEqLoading(false); }
  }, []);

  // Load services
  const loadSvc = useCallback(async () => {
    setSvcLoading(true); setSvcError('');
    try { setServices(await api.get('/services')); }
    catch (err) { setSvcError(err?.message || 'Failed to load services.'); }
    finally { setSvcLoading(false); }
  }, []);

  // Load packages
  const loadPkg = useCallback(async () => {
    setPkgLoading(true); setPkgError('');
    try { setPackages(await api.get('/packages')); }
    catch (err) { setPkgError(err?.message || 'Failed to load packages.'); }
    finally { setPkgLoading(false); }
  }, []);

  useEffect(() => { loadEq(); loadSvc(); loadPkg(); }, [loadEq, loadSvc, loadPkg]);

  // Equipment CRUD
  const addEq = async () => {
    if (!eqForm.name) return;
    setEqSaving(true);
    try {
      const created = await api.post('/equipment', { ...eqForm, qty: +eqForm.qty });
      setEquipment(prev => [...prev, created]);
      setEqModal(null);
      showToast('Equipment added.');
    } catch (err) { showToast(`Error: ${err?.message}`); }
    finally { setEqSaving(false); }
  };

  const deleteEq = async (id) => {
    try { await api.delete(`/equipment/${id}`); setEquipment(prev => prev.filter(e => e.id !== id)); showToast('Equipment removed.'); }
    catch (err) { showToast(`Error: ${err?.message}`); }
  };

  // Service CRUD
  const addSvc = async () => {
    if (!svcForm.name) return;
    setSvcSaving(true);
    try {
      const created = await api.post('/services', svcForm);
      setServices(prev => [...prev, created]);
      setSvcModal(null);
      showToast('Service added.');
    } catch (err) { showToast(`Error: ${err?.message}`); }
    finally { setSvcSaving(false); }
  };

  const deleteSvc = async (id) => {
    try { await api.delete(`/services/${id}`); setServices(prev => prev.filter(s => s.id !== id)); showToast('Service removed.'); }
    catch (err) { showToast(`Error: ${err?.message}`); }
  };

  const saveSvcEdit = async (id) => {
    setSvcSaving(true);
    const target = services.find(s => s.id === id);
    if (!target) return;
    try {
      const updated = await api.put(`/services/${id}`, target);
      setServices(prev => prev.map(s => s.id === id ? updated : s));
      setSvcModal(null);
      showToast('Service updated.');
    } catch (err) { showToast(`Error: ${err?.message}`); }
    finally { setSvcSaving(false); }
  };

  // Package CRUD
  const addPkg = async () => {
    if (!pkgForm.name) return;
    setPkgSaving(true);
    try {
      const created = await api.post('/packages', { ...pkgForm, base_price: +pkgForm.base, discount_percent: +pkgForm.discount });
      setPackages(prev => [...prev, created]);
      setPkgModal(null);
      showToast('Package created.');
    } catch (err) { showToast(`Error: ${err?.message}`); }
    finally { setPkgSaving(false); }
  };

  const deletePkg = async (id) => {
    try { await api.delete(`/packages/${id}`); setPackages(prev => prev.filter(p => p.id !== id)); showToast('Package removed.'); }
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
              onClick={() => { setEqForm({ name:'', qty:1, status:'Active', portable:false }); setEqModal('add'); }}>
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
                        <td><span className={`badge ${eq.status==='Active'?'badge-green':'badge-amber'}`}>{eq.status}</span></td>
                        <td><button onClick={() => deleteEq(eq.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}><Trash2 size={15}/></button></td>
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
              onClick={() => { setSvcForm({ name:'', duration:'', staff:'', equipment:'None', type:'Clinical' }); setSvcModal('add'); }}>
              <Plus size={14}/> Add Service
            </button>
          </div>
          <LoadBlock loading={svcLoading} error={svcError}>
            {services.length === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'#94a3b8' }}>No services configured yet.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {services.map(svc => (
                  <div key={svc.id} style={{ padding:'1rem 1.25rem', border:'1px solid #e2e8f0', borderRadius:10, background:'#fafafa', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                    <div style={{ flex:1, minWidth:200 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.35rem', flexWrap:'wrap' }}>
                        <strong style={{ fontSize:'0.97rem' }}>{svc.name}</strong>
                        <span className={`badge ${svc.type==='External'?'badge-purple':'badge-blue'}`} style={{ fontSize:'0.7rem' }}>{svc.type}</span>
                      </div>
                      <div style={{ display:'flex', gap:'1rem', fontSize:'0.82rem', color:'#64748b', flexWrap:'wrap' }}>
                        <span>⏱ {svc.duration}</span>
                        <span>👤 {svc.required_staff || svc.staff || '—'}</span>
                        <span>🔧 {svc.required_equipment || svc.equipment || 'None'}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
                      <button onClick={() => setSvcModal(svc.id)} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.4rem 0.75rem', background:'white', border:'1px solid #e2e8f0', borderRadius:7, cursor:'pointer', fontSize:'0.82rem', fontWeight:600 }}>
                        <Settings2 size={13}/> Edit
                      </button>
                      <button onClick={() => deleteSvc(svc.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', padding:'0.4rem' }}>
                        <Trash2 size={15}/>
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
              onClick={() => { setPkgForm({ name:'', includes:'', base:'', discount:0, fast:false }); setPkgModal('add'); }}>
              <Plus size={14}/> New Package
            </button>
          </div>
          <LoadBlock loading={pkgLoading} error={pkgError}>
            {packages.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:14, padding:'3rem', textAlign:'center', color:'#94a3b8', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>No packages yet.</div>
            ) : (
              <div className="package-grid">
                {packages.map(pkg => {
                  const base = pkg.base_price || pkg.base || 0;
                  const disc = pkg.discount_percent || pkg.discount || 0;
                  return (
                    <div key={pkg.id} style={{ border:`2px solid ${pkg.fast||pkg.is_fast_track?'#bae6fd':'#e2e8f0'}`, borderRadius:14, overflow:'hidden', background:'white', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                      <div style={{ padding:'1.25rem', background: pkg.fast||pkg.is_fast_track?'#f0f9ff':'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
                        <h3 style={{ margin:'0 0 0.3rem', fontSize:'1rem' }}>{pkg.name}</h3>
                        <p style={{ margin:0, fontSize:'0.82rem', color:'#64748b' }}>{pkg.description || pkg.includes}</p>
                      </div>
                      <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.88rem', color:'#64748b' }}>
                          <span>Base Price</span>
                          <span style={{ textDecoration: disc>0?'line-through':'none' }}>LKR {Number(base).toLocaleString()}</span>
                        </div>
                        {disc > 0 && (
                          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.88rem' }}>
                            <span style={{ color:'#16a34a', fontWeight:600 }}>Discount</span>
                            <span style={{ color:'#16a34a', fontWeight:600 }}>{disc}% off</span>
                          </div>
                        )}
                        <div style={{ height:1, background:'#e2e8f0', margin:'0.25rem 0' }}/>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontWeight:700, fontSize:'1rem' }}>LKR {finalPrice(base, disc).toLocaleString()}</span>
                          <button onClick={() => deletePkg(pkg.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}><Trash2 size={15}/></button>
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
                <select className="form-input" value={eqForm.status} onChange={e => setEqForm(p => ({...p,status:e.target.value}))}>
                  <option>Active</option><option>Needs Maintenance</option><option>Inactive</option>
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

      {/* Add Service Modal */}
      {svcModal === 'add' && (
        <Modal title="Add New Service" onClose={() => setSvcModal(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div><label className="form-label">Service Name</label>
              <input className="form-input" placeholder="e.g. Laser Therapy" value={svcForm.name} onChange={e => setSvcForm(p => ({...p,name:e.target.value}))}/></div>
            <div style={{ display:'flex', gap:'1rem' }}>
              <div style={{ flex:1 }}><label className="form-label">Duration</label>
                <input className="form-input" placeholder="30 min" value={svcForm.duration} onChange={e => setSvcForm(p => ({...p,duration:e.target.value}))}/></div>
              <div style={{ flex:1 }}><label className="form-label">Type</label>
                <select className="form-input" value={svcForm.type} onChange={e => setSvcForm(p => ({...p,type:e.target.value}))}>
                  <option>Clinical</option><option>External</option>
                </select></div>
            </div>
            <div><label className="form-label">Required Staff</label>
              <select className="form-input" value={svcForm.staff} onChange={e => setSvcForm(p => ({...p,staff:e.target.value}))}>
                <option value="">Select staff type…</option>
                <option>Physiotherapist</option><option>Doctor</option><option>Specialized Physio</option><option>Physio + Nurse</option>
              </select></div>
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
            <div><label className="form-label">Required Staff</label>
              <select className="form-input" value={editSvcTarget.required_staff||editSvcTarget.staff||''}
                onChange={e => setServices(prev => prev.map(s => s.id===svcModal?{...s,required_staff:e.target.value}:s))}>
                <option>Physiotherapist</option><option>Doctor</option><option>Specialized Physio</option><option>Physio + Nurse</option>
              </select></div>
            <div><label className="form-label">Required Equipment</label>
              <select className="form-input" value={editSvcTarget.required_equipment||editSvcTarget.equipment||'None'}
                onChange={e => setServices(prev => prev.map(s => s.id===svcModal?{...s,required_equipment:e.target.value}:s))}>
                <option value="None">None (Standard Room)</option>
                {equipment.map(e => <option key={e.id}>{e.name}</option>)}
              </select></div>
            <div><label className="form-label">Session Duration</label>
              <input type="text" className="form-input" value={editSvcTarget.duration||''}
                onChange={e => setServices(prev => prev.map(s => s.id===svcModal?{...s,duration:e.target.value}:s))}/></div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setSvcModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={() => saveSvcEdit(svcModal)} disabled={svcSaving}>
              {svcSaving ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Saving…</> : 'Save Requirements'}
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
              {pkgSaving ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Saving…</> : 'Create Package'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
