import React, { useState } from 'react';
import { UserPlus, X, Star, Calendar } from 'lucide-react';

const STAFF = [
  { id: 1, name: 'Dr. Sarah Smith', role: 'Physiotherapist', spec: 'Sports Therapy',   rank: 'Expert Level 3',      exp: 12, rating: 4.9, status: 'Available' },
  { id: 2, name: 'Dr. Mark Allen',  role: 'Physiotherapist', spec: 'Post-Op Rehab',    rank: 'Senior Level 2',      exp: 8,  rating: 4.7, status: 'In Session' },
  { id: 3, name: 'Dr. Emma Jones',  role: 'Physiotherapist', spec: 'Pre/Post-Natal',   rank: 'Specialist Level 1',  exp: 5,  rating: 4.8, status: 'Available' },
  { id: 4, name: 'Dr. James Lee',   role: 'Doctor',           spec: 'General Practice', rank: 'Senior Level 2',      exp: 9,  rating: 4.6, status: 'Available' },
  { id: 5, name: 'Dr. Priya Nair',  role: 'Doctor',           spec: 'Orthopaedics',     rank: 'Expert Level 3',      exp: 14, rating: 4.9, status: 'On Leave'  },
];

function Stars({ rating }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.87rem' }}>
      <Star size={13} fill="#f59e0b" /> {rating}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = { Available: 'badge-green', 'In Session': 'badge-blue', 'On Leave': 'badge-amber' };
  return <span className={`badge ${map[status] || 'badge-blue'}`}>{status}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function StaffManagement() {
  const [staff, setStaff]         = useState(STAFF);
  const [availModal, setAvailModal] = useState(null); // staff id
  const [addModal, setAddModal]   = useState(false);
  const [form, setForm]           = useState({ name: '', role: 'Physiotherapist', spec: '', exp: '', rating: '4.5', status: 'Available' });

  const addStaff = () => {
    if (!form.name) return;
    setStaff(prev => [...prev, { ...form, id: Date.now(), rank: 'Level 1', exp: +form.exp, rating: +form.rating }]);
    setAddModal(false);
  };

  const target = staff.find(s => s.id === availModal);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Manage therapist availability, track performance metrics used by the auto-allocation engine.</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm({ name:'',role:'Physiotherapist',spec:'',exp:'',rating:'4.5',status:'Available' }); setAddModal(true); }}>
          <UserPlus size={16} /> Add Staff Member
        </button>
      </div>

      {/* Performance summary */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Staff',       value: staff.length },
          { label: 'Available Now',     value: staff.filter(s => s.status === 'Available').length },
          { label: 'In Session',        value: staff.filter(s => s.status === 'In Session').length },
          { label: 'Avg. Rating',       value: (staff.reduce((a, s) => a + s.rating, 0) / staff.length).toFixed(1) + ' ★' },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ fontSize: '1.75rem' }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Patient Rating</th>
                <th>Auto-Rank</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.sort((a, b) => b.rating !== a.rating ? b.rating - a.rating : b.exp - a.exp).map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700 }}>{s.name}</td>
                  <td>
                    <span className={`badge ${s.role === 'Doctor' ? 'badge-purple' : 'badge-blue'}`}>{s.role}</span>
                  </td>
                  <td style={{ color: '#475569' }}>{s.spec}</td>
                  <td>{s.exp} yrs</td>
                  <td><Stars rating={s.rating} /></td>
                  <td>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>{s.rank}</span>
                  </td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    <button
                      onClick={() => setAvailModal(s.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.7rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#2563eb' }}
                    >
                      <Calendar size={13} /> Schedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Availability Modal */}
      {availModal && target && (
        <Modal title={`Availability — ${target.name}`} onClose={() => setAvailModal(null)}>
          <p style={{ fontSize: '0.87rem', color: '#64748b', marginBottom: '1rem' }}>
            Set weekly working hours. Changes sync with the booking engine.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day, i) => (
              <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', minWidth: 100 }}>
                  <input type="checkbox" defaultChecked={i < 5} /> {day}
                </label>
                <input type="text" defaultValue={i === 5 ? '09:00 - 13:00' : '09:00 - 17:00'} className="form-input" style={{ width: 150, fontSize: '0.85rem', padding: '0.4rem 0.75rem' }} />
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setAvailModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={() => setAvailModal(null)}>Save Schedule</button>
          </div>
        </Modal>
      )}

      {/* Add Staff Modal */}
      {addModal && (
        <Modal title="Add Staff Member" onClose={() => setAddModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Dr. Amara Silva" value={form.name} onChange={e => setForm(p => ({...p,name:e.target.value}))} /></div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}><label className="form-label">Role</label>
                <select className="form-input" value={form.role} onChange={e => setForm(p => ({...p,role:e.target.value}))}>
                  <option>Physiotherapist</option><option>Doctor</option>
                </select></div>
              <div style={{ flex: 1 }}><label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm(p => ({...p,status:e.target.value}))}>
                  <option>Available</option><option>On Leave</option>
                </select></div>
            </div>
            <div><label className="form-label">Specialization</label>
              <input className="form-input" placeholder="e.g. Sports Therapy" value={form.spec} onChange={e => setForm(p => ({...p,spec:e.target.value}))} /></div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}><label className="form-label">Experience (yrs)</label>
                <input type="number" className="form-input" min={0} value={form.exp} onChange={e => setForm(p => ({...p,exp:e.target.value}))} /></div>
              <div style={{ flex: 1 }}><label className="form-label">Initial Rating</label>
                <input type="number" className="form-input" min={1} max={5} step={0.1} value={form.rating} onChange={e => setForm(p => ({...p,rating:e.target.value}))} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={addStaff}>Add Staff</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
