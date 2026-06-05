import React, { useState } from 'react';
import { User, Phone, Save, AlertCircle, Loader, XCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function PatientProfile() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    phone: user?.phone || '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [deactivating, setDeactivating] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await api.put('/users/me', {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });
      await refreshUser();
      setMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMsg({ type: 'error', text: err?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      setMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await api.put('/users/me/password', passwordForm);
      setMsg({ type: 'success', text: 'Password updated successfully.' });
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err?.message || 'Failed to update password.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to deactivate your account? This will prevent you from logging in until reactivated.")) return;
    setDeactivating(true);
    try {
      await api.delete('/users/me'); // Assuming DELETE /users/me deactivates the user
      alert('Your account has been deactivated.');
      await logout();
      navigate('/');
    } catch (err) {
      setMsg({ type: 'error', text: err?.message || 'Failed to deactivate account.' });
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="animate-in" style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your personal information and account security.</p>
        </div>
      </div>

      {msg.text && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: 12, display: 'flex', gap: '0.75rem', alignItems: 'center', background: msg.type === 'error' ? '#fef2f2' : '#f0fdf4', color: msg.type === 'error' ? '#991b1b' : '#166534', border: `1px solid ${msg.type === 'error' ? '#fca5a5' : '#86efac'}` }}>
          {msg.type === 'error' ? <AlertCircle size={20} /> : <Save size={20} />}
          <div>{msg.text}</div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        
        {/* Personal Info */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="#2563eb" /> Personal Information
          </h2>
          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">First Name</label>
              <input type="text" className="form-input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input type="text" className="form-input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">Email <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Cannot be changed)</span></label>
              <input type="email" className="form-input" value={user?.email} disabled style={{ background: '#f8fafc', color: '#64748b' }} />
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '0.5rem' }}>
              {saving ? <Loader size={16} className="spin" /> : <Save size={16} />} Save Changes
            </button>
          </form>
        </div>

        {/* Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={18} color="#8b5cf6" /> Change Password
            </h2>
            <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} required />
              </div>
              <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '0.5rem', background: '#8b5cf6' }}>
                {saving ? <Loader size={16} className="spin" /> : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="card" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <XCircle size={18} /> Danger Zone
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#7f1d1d', marginBottom: '1rem', lineHeight: 1.5 }}>
              Deactivating your account will disable your login access and hide your profile. Any upcoming bookings might be affected.
            </p>
            <button onClick={handleDeactivate} disabled={deactivating} className="btn-primary" style={{ background: '#ef4444', width: '100%' }}>
              {deactivating ? 'Deactivating...' : 'Deactivate My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
