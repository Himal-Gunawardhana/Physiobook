import React, { useState, useEffect, useCallback } from 'react';
import {
  User, Mail, Phone, Award, GraduationCap, Briefcase, Star, Save,
  Plus, X, Loader, AlertCircle, CheckCircle, Building2, FileText
} from 'lucide-react';
import api from '../../lib/api';

export default function TherapistProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(false);

  // Editable fields
  const [form, setForm] = useState({});
  const [newCert, setNewCert] = useState('');
  const [newQual, setNewQual] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/staff/me/profile');
      setProfile(data);
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        bio: data.bio || '',
        specialization: data.specialization || '',
        experienceYears: data.experienceYears || 0,
        certifications: data.certifications || [],
        qualifications: data.qualifications || [],
      });
    } catch (err) {
      setError(err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.put('/staff/me/profile', form);
      setProfile(updated);
      setEditing(false);
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(err?.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addCert = () => {
    if (!newCert.trim()) return;
    setForm(p => ({ ...p, certifications: [...p.certifications, newCert.trim()] }));
    setNewCert('');
  };
  const removeCert = (i) => setForm(p => ({ ...p, certifications: p.certifications.filter((_, idx) => idx !== i) }));

  const addQual = () => {
    if (!newQual.trim()) return;
    setForm(p => ({ ...p, qualifications: [...p.qualifications, newQual.trim()] }));
    setNewQual('');
  };
  const removeQual = (i) => setForm(p => ({ ...p, qualifications: p.qualifications.filter((_, idx) => idx !== i) }));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, color: '#64748b' }}>
        <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#991b1b' }}>
        <AlertCircle size={32} style={{ marginBottom: '1rem' }} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: toast.type === 'error' ? '#dc2626' : '#10b981', color: '#fff', borderRadius: 12, padding: '0.9rem 1.5rem', fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your professional profile, certifications, and qualifications.</p>
        </div>
        {!editing ? (
          <button className="btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-ghost" onClick={() => { setEditing(false); load(); }}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff, #f8fafc)', border: '1px solid #bfdbfe', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 800, flexShrink: 0 }}>
            {(profile.firstName?.[0] || '').toUpperCase()}{(profile.lastName?.[0] || '').toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.3rem' }}>{profile.firstName} {profile.lastName}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={14} /> {profile.email}</span>
              {profile.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={14} /> {profile.phone}</span>}
              {profile.clinicName && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Building2 size={14} /> {profile.clinicName}</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {profile.specialization && (
                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
                  🩺 {profile.specialization}
                </span>
              )}
              {profile.experienceYears > 0 && (
                <span style={{ background: '#f0fdf4', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
                  💼 {profile.experienceYears} yrs experience
                </span>
              )}
              {profile.rating > 0 && (
                <span style={{ background: '#fffbeb', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Star size={12} fill="#f59e0b" color="#f59e0b" /> {profile.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Personal Info */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="#2563eb" /> Personal Information
          </h3>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">First Name</label>
                  <input className="form-input" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Last Name</label>
                  <input className="form-input" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+94 77 123 4567" />
              </div>
              <div>
                <label className="form-label">Specialization</label>
                <input className="form-input" value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} placeholder="e.g. Sports Physiotherapy" />
              </div>
              <div>
                <label className="form-label">Years of Experience</label>
                <input type="number" className="form-input" value={form.experienceYears} onChange={e => setForm(p => ({ ...p, experienceYears: parseInt(e.target.value) || 0 }))} min="0" />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div><span style={{ color: '#94a3b8', width: 120, display: 'inline-block' }}>Name:</span> <strong>{profile.firstName} {profile.lastName}</strong></div>
              <div><span style={{ color: '#94a3b8', width: 120, display: 'inline-block' }}>Email:</span> {profile.email}</div>
              <div><span style={{ color: '#94a3b8', width: 120, display: 'inline-block' }}>Phone:</span> {profile.phone || '—'}</div>
              <div><span style={{ color: '#94a3b8', width: 120, display: 'inline-block' }}>Specialization:</span> {profile.specialization || '—'}</div>
              <div><span style={{ color: '#94a3b8', width: 120, display: 'inline-block' }}>Experience:</span> {profile.experienceYears || 0} years</div>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="#8b5cf6" /> Bio
          </h3>
          {editing ? (
            <textarea className="form-input" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              placeholder="Tell patients about yourself, your approach to physiotherapy, and what makes you unique..."
              rows={6} style={{ resize: 'vertical' }} />
          ) : (
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
              {profile.bio || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No bio added yet. Click "Edit Profile" to add one.</span>}
            </p>
          )}
        </div>

        {/* Certifications */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="#f59e0b" /> Certifications
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>{form.certifications?.length || 0}</span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: editing ? '1rem' : 0 }}>
            {(editing ? form.certifications : profile.certifications || []).map((cert, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '0.35rem 0.75rem', borderRadius: 20, fontSize: '0.82rem', fontWeight: 500 }}>
                <Award size={12} /> {cert}
                {editing && <button onClick={() => removeCert(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 0 }}><X size={12} /></button>}
              </span>
            ))}
            {(editing ? form.certifications : profile.certifications || []).length === 0 && (
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>No certifications added</span>
            )}
          </div>
          {editing && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="form-input" value={newCert} onChange={e => setNewCert(e.target.value)} placeholder="e.g. BPT, DPT, CSCS"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCert())} style={{ flex: 1 }} />
              <button onClick={addCert} className="btn-primary" style={{ padding: '0.5rem 0.75rem' }}><Plus size={16} /></button>
            </div>
          )}
        </div>

        {/* Qualifications */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={18} color="#10b981" /> Qualifications
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>{form.qualifications?.length || 0}</span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: editing ? '1rem' : 0 }}>
            {(editing ? form.qualifications : profile.qualifications || []).map((qual, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ecfdf5', border: '1px solid #86efac', color: '#166534', padding: '0.35rem 0.75rem', borderRadius: 20, fontSize: '0.82rem', fontWeight: 500 }}>
                <GraduationCap size={12} /> {qual}
                {editing && <button onClick={() => removeQual(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 0 }}><X size={12} /></button>}
              </span>
            ))}
            {(editing ? form.qualifications : profile.qualifications || []).length === 0 && (
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>No qualifications added</span>
            )}
          </div>
          {editing && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="form-input" value={newQual} onChange={e => setNewQual(e.target.value)} placeholder="e.g. BSc Physiotherapy, MSc Sports Medicine"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addQual())} style={{ flex: 1 }} />
              <button onClick={addQual} className="btn-primary" style={{ padding: '0.5rem 0.75rem' }}><Plus size={16} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
