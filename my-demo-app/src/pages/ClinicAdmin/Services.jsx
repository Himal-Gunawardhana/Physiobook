import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Users, Settings2, X, Monitor, Package, Activity } from 'lucide-react';

/* ── Data ── */
const initEquipment = [
  { id: 1, name: 'Short Wave Diathermy Unit',        qty: 2, status: 'Active',            portable: false },
  { id: 2, name: 'Continues Passive Motion Machine', qty: 1, status: 'Active',            portable: false },
  { id: 3, name: 'Suctioning Machine',               qty: 3, status: 'Needs Maintenance', portable: true  },
  { id: 4, name: 'Tilting Bed',                      qty: 2, status: 'Active',            portable: false },
  { id: 5, name: 'Infra-Red Lamp',                   qty: 4, status: 'Active',            portable: true  },
  { id: 6, name: 'Portable Physio Kit',              qty: 6, status: 'Active',            portable: true  },
];

const initServices = [
  { id: 1, name: 'Infra-Red Radiation',                     duration: '30 min', staff: 'Physiotherapist',    equipment: 'Infra-Red Lamp',                 type: 'Clinical'  },
  { id: 2, name: 'Posture Analysis & Exercise Prescription',duration: '45 min', staff: 'Doctor',             equipment: 'None',                           type: 'Clinical'  },
  { id: 3, name: 'Rehabilitation Exercise Programme',       duration: '60 min', staff: 'Physiotherapist',    equipment: 'Gym Area',                       type: 'Clinical'  },
  { id: 4, name: 'Short Wave Diathermy',                    duration: '30 min', staff: 'Physiotherapist',    equipment: 'Short Wave Diathermy Unit',      type: 'Clinical'  },
  { id: 5, name: 'Continues Passive Motion',                duration: '45 min', staff: 'Physiotherapist',    equipment: 'CPM Machine',                    type: 'Clinical'  },
  { id: 6, name: 'Chest Physio + Suctioning',               duration: '60 min', staff: 'Physio + Nurse',     equipment: 'Suctioning Machine',             type: 'Clinical'  },
  { id: 7, name: 'Tilting Bed Sessions',                    duration: '45 min', staff: 'Physiotherapist',    equipment: 'Tilting Bed',                    type: 'Clinical'  },
  { id: 8, name: 'Home Visits',                             duration: '90 min', staff: 'Physiotherapist',    equipment: 'Portable Physio Kit',            type: 'External'  },
  { id: 9, name: 'Pre-Natal Exercises',                     duration: '45 min', staff: 'Specialized Physio', equipment: 'Mat / Exercise Balls',           type: 'Clinical'  },
  { id:10, name: 'Post-Natal Exercises',                    duration: '45 min', staff: 'Specialized Physio', equipment: 'Mat / Exercise Balls',           type: 'Clinical'  },
  { id:11, name: 'Kinesio Taping',                          duration: '30 min', staff: 'Physiotherapist',    equipment: 'Tape',                           type: 'Clinical'  },
  { id:12, name: 'Paediatric Rehabilitation',               duration: '60 min', staff: 'Specialized Physio', equipment: 'Paediatric Equipment',           type: 'Clinical'  },
];

const initPackages = [
  { id: 1, name: 'Post-Natal Full Recovery',      includes: '10× Post-Natal Sessions',        base: 24000, discount: 15, fast: false },
  { id: 2, name: 'Chest Clearing Weekly Bundle',  includes: '5× Chest Physio + Suction',       base: 12000, discount: 10, fast: false },
  { id: 3, name: '⚡ Fast-Track Express Booking', includes: 'Standard clinic session (time-only)', base: 3500, discount: 0, fast: true },
];

const TABS = [
  { id: 'equipment', label: 'Equipment',   Icon: Monitor },
  { id: 'services',  label: 'Services',    Icon: Activity },
  { id: 'packages',  label: 'Packages',    Icon: Package },
];

/* ── Reusable Modal ── */
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: wide ? 600 : 480 }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Services() {
  const [tab, setTab] = useState('equipment');
  const [equipment, setEquipment] = useState(initEquipment);
  const [services,  setServices]  = useState(initServices);
  const [packages,  setPackages]  = useState(initPackages);

  // Modal state
  const [eqModal,  setEqModal]  = useState(null); // 'add' | id
  const [svcModal, setSvcModal] = useState(null); // 'add' | id
  const [pkgModal, setPkgModal] = useState(null); // 'add'

  // Form state
  const [eqForm, setEqForm]   = useState({ name: '', qty: 1, status: 'Active', portable: false });
  const [svcForm, setSvcForm] = useState({ name: '', duration: '', staff: '', equipment: 'None', type: 'Clinical' });
  const [pkgForm, setPkgForm] = useState({ name: '', includes: '', base: '', discount: 0, fast: false });

  /* ── Equipment actions ── */
  const addEq = () => {
    if (!eqForm.name) return;
    setEquipment(prev => [...prev, { ...eqForm, id: Date.now(), qty: +eqForm.qty }]);
    setEqModal(null);
  };
  const deleteEq = (id) => setEquipment(prev => prev.filter(e => e.id !== id));

  /* ── Service actions ── */
  const addSvc = () => {
    if (!svcForm.name) return;
    setServices(prev => [...prev, { ...svcForm, id: Date.now() }]);
    setSvcModal(null);
  };
  const deleteSvc = (id) => setServices(prev => prev.filter(s => s.id !== id));
  const editSvcTarget = services.find(s => s.id === svcModal);

  /* ── Package actions ── */
  const addPkg = () => {
    if (!pkgForm.name) return;
    setPackages(prev => [...prev, { ...pkgForm, id: Date.now(), base: +pkgForm.base, discount: +pkgForm.discount }]);
    setPkgModal(null);
  };
  const deletePkg = (id) => setPackages(prev => prev.filter(p => p.id !== id));

  const finalPrice = (base, discount) => Math.round(base * (1 - discount/100));

  return (
    <div className="animate-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Services, Equipment & Packages</h1>
          <p className="page-subtitle">Configure what your clinic offers and the resources each service requires.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.625rem 1.1rem',
              fontWeight: 600, fontSize: '0.88rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: tab === id ? '#2563eb' : '#64748b',
              borderBottom: tab === id ? '2.5px solid #2563eb' : '2.5px solid transparent',
              marginBottom: '-2px', transition: 'all 0.15s',
            }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── Equipment Tab ── */}
      {tab === 'equipment' && (
        <div className="card animate-in">
          <div className="section-header-row">
            <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Clinic Equipment Inventory</h2>
            <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              onClick={() => { setEqForm({ name: '', qty: 1, status: 'Active', portable: false }); setEqModal('add'); }}>
              <Plus size={14} /> Add Equipment
            </button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Equipment Name</th><th>Qty</th><th>Portability</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {equipment.map(eq => (
                  <tr key={eq.id}>
                    <td style={{ fontWeight: 600 }}>{eq.name}</td>
                    <td>{eq.qty} unit{eq.qty > 1 ? 's' : ''}</td>
                    <td>
                      <span className={`badge ${eq.portable ? 'badge-purple' : 'badge-blue'}`}>
                        {eq.portable ? '🏠 Portable' : '🏥 Clinic Only'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${eq.status === 'Active' ? 'badge-green' : 'badge-amber'}`}>{eq.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setEqModal(eq.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'#2563eb',fontSize:'0.82rem',fontWeight:600 }}>Schedule</button>
                        <button onClick={() => deleteEq(eq.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'#ef4444' }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem' }}>
            <Users size={18} color="#2563eb" />
            <span style={{ color: '#1d4ed8' }}>To manage doctor and physiotherapist availability, visit <strong>Staff Management</strong> in the sidebar.</span>
          </div>
        </div>
      )}

      {/* ── Services Tab ── */}
      {tab === 'services' && (
        <div className="card animate-in">
          <div className="section-header-row">
            <div>
              <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.25rem' }}>Treatments & Service Requirements</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Map each service to its required staff and equipment to prevent scheduling conflicts.</p>
            </div>
            <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', flexShrink: 0 }}
              onClick={() => { setSvcForm({ name: '', duration: '', staff: '', equipment: 'None', type: 'Clinical' }); setSvcModal('add'); }}>
              <Plus size={14} /> Add Service
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {services.map(svc => (
              <div key={svc.id} className="svc-item-row" style={{ padding: '1rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fafafa' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.97rem' }}>{svc.name}</strong>
                    <span className={`badge ${svc.type === 'External' ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '0.7rem' }}>{svc.type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap' }}>
                    <span>⏱ {svc.duration}</span>
                    <span>👤 {svc.staff}</span>
                    <span>🔧 {svc.equipment}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button onClick={() => setSvcModal(svc.id)} style={{ display:'flex',alignItems:'center',gap:'0.35rem',padding:'0.4rem 0.75rem',background:'white',border:'1px solid #e2e8f0',borderRadius:7,cursor:'pointer',fontSize:'0.82rem',fontWeight:600 }}>
                    <Settings2 size={13} /> Edit
                  </button>
                  <button onClick={() => deleteSvc(svc.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'#ef4444',padding:'0.4rem' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Packages Tab ── */}
      {tab === 'packages' && (
        <div className="animate-in">
          <div className="section-header-row">
            <div>
              <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.25rem' }}>Long-Term & Express Packages</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Packages marked ⚡ Fast-Track appear on the patient portal as a simplified booking option.</p>
            </div>
            <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', flexShrink: 0 }}
              onClick={() => { setPkgForm({ name: '', includes: '', base: '', discount: 0, fast: false }); setPkgModal('add'); }}>
              <Plus size={14} /> New Package
            </button>
          </div>
          <div className="package-grid">
            {packages.map(pkg => (
              <div key={pkg.id} style={{ border: `2px solid ${pkg.fast ? '#bae6fd' : '#e2e8f0'}`, borderRadius: 14, overflow: 'hidden', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '1.25rem', background: pkg.fast ? '#f0f9ff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 0.3rem', fontSize: '1rem' }}>{pkg.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>{pkg.includes}</p>
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b' }}>
                    <span>Base Price</span>
                    <span style={{ textDecoration: pkg.discount > 0 ? 'line-through' : 'none' }}>LKR {pkg.base.toLocaleString()}</span>
                  </div>
                  {pkg.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>Discount</span>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>{pkg.discount}% off</span>
                    </div>
                  )}
                  <div style={{ height: 1, background: '#e2e8f0', margin: '0.25rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>LKR {finalPrice(pkg.base, pkg.discount).toLocaleString()}</span>
                    <button onClick={() => deletePkg(pkg.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'#ef4444' }}><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add Equipment Modal ── */}
      {eqModal === 'add' && (
        <Modal title="Add New Equipment" onClose={() => setEqModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label className="form-label">Equipment Name</label>
              <input className="form-input" placeholder="e.g. Laser Therapy Unit" value={eqForm.name} onChange={e => setEqForm(p => ({...p,name:e.target.value}))} /></div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}><label className="form-label">Quantity</label>
                <input type="number" className="form-input" min={1} value={eqForm.qty} onChange={e => setEqForm(p => ({...p,qty:e.target.value}))} /></div>
              <div style={{ flex: 1 }}><label className="form-label">Status</label>
                <select className="form-input" value={eqForm.status} onChange={e => setEqForm(p => ({...p,status:e.target.value}))}>
                  <option>Active</option><option>Needs Maintenance</option><option>Inactive</option>
                </select></div>
            </div>
            <div>
              <label className="form-label">Portability</label>
              <select className="form-input" value={eqForm.portable} onChange={e => setEqForm(p => ({...p,portable:e.target.value === 'true'}))}>
                <option value="false">🏥 Clinic Only</option>
                <option value="true">🏠 Portable (Home Visits)</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setEqModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={addEq}>Add Equipment</button>
          </div>
        </Modal>
      )}

      {/* Schedule modal for existing equipment */}
      {eqModal && eqModal !== 'add' && (() => {
        const eq = equipment.find(e => e.id === eqModal);
        return eq ? (
          <Modal title={`Schedule — ${eq.name}`} onClose={() => setEqModal(null)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={day !== 'Saturday'} /> {day}
                  </label>
                  <input type="text" defaultValue={day === 'Saturday' ? '09:00 - 13:00' : '09:00 - 17:00'} className="form-input" style={{ width: 150, fontSize: '0.85rem' }} />
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setEqModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => setEqModal(null)}>Save Schedule</button>
            </div>
          </Modal>
        ) : null;
      })()}

      {/* ── Add Service Modal ── */}
      {svcModal === 'add' && (
        <Modal title="Add New Service" onClose={() => setSvcModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label className="form-label">Service Name</label>
              <input className="form-input" placeholder="e.g. Laser Therapy" value={svcForm.name} onChange={e => setSvcForm(p => ({...p,name:e.target.value}))} /></div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}><label className="form-label">Duration</label>
                <input className="form-input" placeholder="30 min" value={svcForm.duration} onChange={e => setSvcForm(p => ({...p,duration:e.target.value}))} /></div>
              <div style={{ flex: 1 }}><label className="form-label">Type</label>
                <select className="form-input" value={svcForm.type} onChange={e => setSvcForm(p => ({...p,type:e.target.value}))}>
                  <option>Clinical</option><option>External</option>
                </select></div>
            </div>
            <div><label className="form-label">Required Staff</label>
              <select className="form-input" value={svcForm.staff} onChange={e => setSvcForm(p => ({...p,staff:e.target.value}))}>
                <option value="">Select staff type…</option>
                <option>Physiotherapist</option><option>Doctor</option>
                <option>Specialized Physio</option><option>Physio + Nurse</option>
              </select></div>
            <div><label className="form-label">Required Equipment</label>
              <select className="form-input" value={svcForm.equipment} onChange={e => setSvcForm(p => ({...p,equipment:e.target.value}))}>
                <option value="None">None (Standard Room)</option>
                {initEquipment.map(e => <option key={e.id}>{e.name}</option>)}
              </select></div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setSvcModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={addSvc}>Add Service</button>
          </div>
        </Modal>
      )}

      {/* Edit Service Requirements Modal */}
      {svcModal && svcModal !== 'add' && editSvcTarget && (
        <Modal title={`Edit — ${editSvcTarget.name}`} onClose={() => setSvcModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label className="form-label">Required Staff</label>
              <select className="form-input" defaultValue={editSvcTarget.staff}>
                <option>Physiotherapist</option><option>Doctor</option>
                <option>Specialized Physio</option><option>Physio + Nurse</option>
              </select></div>
            <div><label className="form-label">Required Equipment</label>
              <select className="form-input" defaultValue={editSvcTarget.equipment}>
                <option value="None">None (Standard Room)</option>
                {initEquipment.map(e => <option key={e.id}>{e.name}</option>)}
              </select></div>
            <div><label className="form-label">Session Duration</label>
              <input type="text" defaultValue={editSvcTarget.duration} className="form-input" /></div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setSvcModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={() => setSvcModal(null)}>Save Requirements</button>
          </div>
        </Modal>
      )}

      {/* ── Create Package Modal ── */}
      {pkgModal === 'add' && (
        <Modal title="Create New Package" onClose={() => setPkgModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label className="form-label">Package Name</label>
              <input className="form-input" placeholder="e.g. 10× Post-Natal Rehab" value={pkgForm.name} onChange={e => setPkgForm(p => ({...p,name:e.target.value}))} /></div>
            <div><label className="form-label">What's Included</label>
              <input className="form-input" placeholder="e.g. 10 Post-Natal Sessions" value={pkgForm.includes} onChange={e => setPkgForm(p => ({...p,includes:e.target.value}))} /></div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}><label className="form-label">Base Price (LKR)</label>
                <input type="number" className="form-input" placeholder="25000" value={pkgForm.base} onChange={e => setPkgForm(p => ({...p,base:e.target.value}))} /></div>
              <div style={{ flex: 1 }}><label className="form-label">Discount %</label>
                <input type="number" className="form-input" placeholder="15" min={0} max={100} value={pkgForm.discount} onChange={e => setPkgForm(p => ({...p,discount:e.target.value}))} /></div>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={pkgForm.fast} onChange={e => setPkgForm(p => ({...p,fast:e.target.checked}))} />
                <span className="form-label" style={{ margin: 0 }}>⚡ Mark as Fast-Track (simple time-only booking for patients)</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setPkgModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={addPkg}>Create Package</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
