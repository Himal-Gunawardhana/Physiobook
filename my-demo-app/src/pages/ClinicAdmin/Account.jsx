import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Bell, LogOut, Edit2, Save, Building2,
  Eye, EyeOff, Trash2, AlertTriangle, CheckCircle, X, Loader, AlertCircle
} from 'lucide-react';
import api from '../../lib/api';

// Maps backend role_in_clinic → display label
const ROLE_MAP = {
  clinic_admin: 'Owner',
  manager: 'Manager',
  receptionist: 'Receptionist',
  view_only: 'View Only',
  therapist: 'Therapist',
};
const ROLE_DISPLAY = (r) => ROLE_MAP[r] || r;
const ASSIGNABLE_ROLES = ['manager', 'receptionist', 'view_only'];

function ConfirmModal({ title, message, danger, onConfirm, onClose }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ color: danger ? '#ef4444' : '#0f172a' }}>
            {danger && <AlertTriangle size={17} style={{ display: 'inline', marginRight: '0.4rem', marginBottom: -2 }} />}
            {title}
          </h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{message}</p>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onConfirm} style={{ background: danger ? '#ef4444' : '#2563eb' }}>
            {danger ? 'Yes, proceed' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InviteModal({ onClose, onInvite }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('receptionist');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;
    setSaving(true);
    setError('');
    try {
      await onInvite({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), roleInClinic: role });
      onClose();
    } catch (err) {
      setError(err?.error?.message || err?.message || 'Failed to send invitation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title">Invite Team Member</h3>
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.65rem', color: '#991b1b', fontSize: '0.82rem' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label">First Name</label>
              <input className="form-input" placeholder="e.g. Nimasha" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input className="form-input" placeholder="e.g. Perera" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@clinic.com" />
          </div>
          <div>
            <label className="form-label">Assign Role</label>
            <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
              {ASSIGNABLE_ROLES.map(r => <option key={r} value={r}>{ROLE_DISPLAY(r)}</option>)}
            </select>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
              {role === 'manager' && '• Full access to settings, team management, and bookings'}
              {role === 'receptionist' && '• Can manage bookings, view patients, handle check-ins'}
              {role === 'view_only' && '• Read-only access to dashboard and reports'}
            </div>
          </div>
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '0.75rem', fontSize: '0.82rem', color: '#0369a1' }}>
            📧 An invitation email with login credentials will be sent to this address.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleInvite} disabled={!firstName.trim() || !lastName.trim() || !email.trim() || saving}>
            {saving ? <>Sending...</> : 'Send Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Account() {
  const navigate = useNavigate();
  const [profile,          setProfile]          = useState(null);
  const [team,             setTeam]             = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [editProfile,      setEditProfile]      = useState(false);
  const [showPwd,          setShowPwd]          = useState(false);
  const [confirm,          setConfirm]          = useState(null);
  const [inviteOpen,       setInviteOpen]       = useState(false);
  const [toast,            setToast]            = useState('');
  const [notifications,    setNotifications]    = useState({
    newBooking:     true,
    cancellation:   true,
    dailySummary:   false,
    staffChanges:   true,
    equipment:      true,
    refunds:        true
  });
  const [currentPwd,       setCurrentPwd]       = useState('');
  const [newPwd,           setNewPwd]           = useState('');
  const [confirmPwd,       setConfirmPwd]       = useState('');
  const [pwdError,         setPwdError]         = useState('');
  const [pwdSuccess,       setPwdSuccess]       = useState('');
  const [pwdSaving,        setPwdSaving]        = useState(false);
  const [profileSaving,    setProfileSaving]    = useState(false);

  // 2FA state
  const [tfaStep,     setTfaStep]     = useState(false);
  const [tfaCode,     setTfaCode]     = useState('');
  const [tfaError,    setTfaError]    = useState('');
  const [tfaSending,  setTfaSending]  = useState(false);

  // Clinic state
  const [clinicInfo,   setClinicInfo]   = useState({ name: '', city: '', phone: '', address: '' });
  const [clinicLogo,   setClinicLogo]   = useState(null);
  const [logoFile,     setLogoFile]     = useState(null);
  const [clinicSaving, setClinicSaving] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Load profile, team, and clinic
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const profileData = await api.get('/users/me');
        setProfile(profileData);

        // Load team using the proper staff endpoint
        const clinicId = profileData.clinic_id;
        if (clinicId) {
          try {
            const staffData = await api.get(`/clinics/${clinicId}/staff`);
            setTeam(Array.isArray(staffData) ? staffData : staffData?.rows ?? []);
          } catch (_) { setTeam([]); }

          try {
            const cData = await api.get(`/clinics/${clinicId}`);
            setClinicInfo({
              name:    cData.name || '',
              city:    cData.city || '',
              phone:   cData.phone || '',
              address: cData.address || '',
            });
            if (cData.logo_url) setClinicLogo(cData.logo_url);
          } catch (_) {}
        }
      } catch (err) {
        setError(err?.message || 'Failed to load account information.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {}
    navigate('/');
  };

  const removeUser = async (staffId) => {
    const clinicId = profile?.clinic_id;
    if (!clinicId) return;
    try {
      await api.delete(`/clinics/${clinicId}/staff/${staffId}`);
      setTeam(prev => prev.filter(u => u.id !== staffId));
      showToast('User removed successfully.');
    } catch (err) {
      showToast(`Error: ${err?.error?.message || err?.message || 'Failed to remove user.'}`);
    }
    setConfirm(null);
  };

  const toggleStatus = async (staffId) => {
    const clinicId = profile?.clinic_id;
    if (!clinicId) return;
    try {
      const user = team.find(u => u.id === staffId);
      const newStatus = user?.status === 'available' ? 'on_leave' : 'available';
      await api.put(`/clinics/${clinicId}/staff/${staffId}`, { status: newStatus });
      setTeam(prev => prev.map(u => u.id === staffId ? { ...u, status: newStatus } : u));
      showToast(`User ${newStatus === 'available' ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      showToast(`Error: ${err?.error?.message || err?.message || 'Failed to update status.'}`);
    }
  };

  const updateMemberRole = async (staffId, newRole) => {
    const clinicId = profile?.clinic_id;
    if (!clinicId) return;
    try {
      await api.put(`/clinics/${clinicId}/staff/${staffId}`, { roleInClinic: newRole });
      setTeam(prev => prev.map(u => u.id === staffId ? { ...u, role_in_clinic: newRole } : u));
      showToast(`Role updated to ${ROLE_DISPLAY(newRole)}.`);
    } catch (err) {
      showToast(`Error: ${err?.error?.message || err?.message || 'Failed to update role.'}`);
    }
  };

  const inviteUser = async (data) => {
    const clinicId = profile?.clinic_id;
    if (!clinicId) throw Object.assign(new Error('No clinic linked to your account'), {});
    const result = await api.post(`/clinics/${clinicId}/staff`, data);
    // Reload team list from backend
    try {
      const staffData = await api.get(`/clinics/${clinicId}/staff`);
      setTeam(Array.isArray(staffData) ? staffData : staffData?.rows ?? []);
    } catch (_) {}
    showToast('Invitation sent!');
    return result;
  };

  const handlePasswordChange = async () => {
    setPwdError('');
    setPwdSuccess('');
    
    if (!currentPwd.trim() || !newPwd.trim() || !confirmPwd.trim()) {
      setPwdError('All password fields are required.');
      return;
    }
    
    if (newPwd.length < 8) {
      setPwdError('New password must be at least 8 characters.');
      return;
    }
    
    if (!/[A-Z]/.test(newPwd)) {
      setPwdError('Password must contain at least one uppercase letter.');
      return;
    }
    
    if (!/[0-9]/.test(newPwd)) {
      setPwdError('Password must contain at least one number.');
      return;
    }
    
    if (!/[!@#$%^&*]/.test(newPwd)) {
      setPwdError('Password must contain at least one special character (!@#$%^&*).');
      return;
    }
    
    if (newPwd !== confirmPwd) {
      setPwdError('New passwords do not match.');
      return;
    }
    
    setPwdSaving(true);
    try {
      await api.post('/auth/change-password', { 
        currentPassword: currentPwd, 
        newPassword: newPwd 
      });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setPwdSuccess('Password updated successfully!');
      showToast('Password updated successfully!');
    } catch (err) {
      setPwdError(err?.error?.message || err?.message || 'Failed to update password.');
    } finally {
      setPwdSaving(false);
    }
  };

  // 2FA handlers
  const handleSend2faCode = async () => {
    setTfaSending(true);
    setTfaError('');
    try {
      await api.post('/auth/2fa/send-code');
      setTfaStep(true);
    } catch (err) {
      setTfaError(err?.error?.message || err?.message || 'Failed to send code.');
    } finally {
      setTfaSending(false);
    }
  };

  const handleVerify2fa = async () => {
    setTfaSending(true);
    setTfaError('');
    try {
      await api.post('/auth/2fa/verify-email', { code: tfaCode });
      setProfile(prev => ({ ...prev, two_fa_enabled: true }));
      setTfaStep(false);
      setTfaCode('');
      showToast('Two-factor authentication enabled!');
    } catch (err) {
      setTfaError(err?.error?.message || err?.message || 'Invalid code.');
    } finally {
      setTfaSending(false);
    }
  };

  const handleDisable2fa = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication?')) return;
    setTfaSending(true);
    setTfaError('');
    try {
      await api.post('/auth/2fa/disable');
      setProfile(prev => ({ ...prev, two_fa_enabled: false }));
      showToast('Two-factor authentication disabled.');
    } catch (err) {
      setTfaError(err?.error?.message || err?.message || 'Failed to disable 2FA.');
    } finally {
      setTfaSending(false);
    }
  };

  // ── Profile Save (user data) ──────────────────────────────────────────
  const handleProfileUpdate = async () => {
    setProfileSaving(true);
    try {
      await api.put('/users/me', {
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone || null,
      });
      showToast('Profile updated successfully!');
      setEditProfile(false);
    } catch (err) {
      showToast(`Error: ${err?.error?.message || err?.message || 'Failed to update profile.'}`);
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Logo upload handler ───────────────────────────────────────────────
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Error: Logo must be under 2MB.');
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setClinicLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Clinic Save (clinic data under clinicId) ──────────────────────────
  const handleClinicSave = async () => {
    setClinicSaving(true);
    try {
      const clinicId = profile?.clinic_id;
      if (!clinicId) { showToast('Error: No clinic linked to your account.'); setClinicSaving(false); return; }

      const payload = {
        name: clinicInfo.name,
        city: clinicInfo.city,
        phone: clinicInfo.phone,
        address: clinicInfo.address,
      };

      // If a new logo file was selected, convert to base64 data URL and send as logoUrl
      if (logoFile) {
        payload.logoUrl = clinicLogo; // base64 data URL from reader
      }

      await api.put(`/clinics/${clinicId}`, payload);
      showToast('Clinic info saved!');
      setLogoFile(null); // clear pending file
    } catch (err) {
      showToast(`Error: ${err?.error?.message || err?.message || 'Failed to save clinic info.'}`);
    } finally {
      setClinicSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: '#64748b' }}>
        <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 99, fontSize: '0.88rem', fontWeight: 600, zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
          <CheckCircle size={15} color="#10b981" /> {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Account & Users</h1>
          <p className="page-subtitle">Manage your profile, team members, notifications, and session.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

        {/* Profile Card */}
        {profile && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '0.97rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} /> My Profile
              </h2>
              <button onClick={() => setEditProfile(p => !p)} className="btn-ghost" style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}>
                <Edit2 size={13} /> {editProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#1e40af', flexShrink: 0, overflow: 'hidden' }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <>{profile.first_name?.[0]}{profile.last_name?.[0]}</>
                }
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{profile.first_name} {profile.last_name}</div>
                <span className="badge badge-purple">{profile.role === 'clinic_admin' ? 'Clinic Admin' : profile.role}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">First Name</label>
                  <input 
                    className="form-input" 
                    value={profile.first_name || ''} 
                    onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                    disabled={!editProfile} 
                    style={{ opacity: editProfile ? 1 : 0.7 }} 
                  />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input 
                    className="form-input" 
                    value={profile.last_name || ''} 
                    onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                    disabled={!editProfile} 
                    style={{ opacity: editProfile ? 1 : 0.7 }} 
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={profile.email || ''} 
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }} 
                />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2, display: 'block' }}>Email cannot be changed</span>
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input 
                  className="form-input" 
                  value={profile.phone || ''} 
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!editProfile} 
                  style={{ opacity: editProfile ? 1 : 0.7 }}
                  placeholder="+94 7X XXX XXXX"
                />
              </div>
              {editProfile && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-primary" onClick={handleProfileUpdate} disabled={profileSaving} style={{ flex: 1, justifyContent: 'center' }}>
                    {profileSaving ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={14} /> Save Changes</>}
                  </button>
                  <button className="btn-ghost" onClick={() => setEditProfile(false)} style={{ flex: 1, justifyContent: 'center' }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Security Card */}
        <div className="card">
          <h2 style={{ fontSize: '0.97rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.875rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={16} /> Security & Password
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {pwdError && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem', color: '#991b1b', fontSize: '0.85rem' }}>
                {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '0.75rem', color: '#166534', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} /> {pwdSuccess}
              </div>
            )}
            <div>
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPwd ? 'text' : 'password'} 
                  className="form-input" 
                  placeholder="••••••••" 
                  value={currentPwd}
                  onChange={e => setCurrentPwd(e.target.value)}
                  style={{ paddingRight: '2.5rem' }} 
                />
                <button onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
              />
            </div>
            <button 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handlePasswordChange}
              disabled={pwdSaving}
            >
              {pwdSaving ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : 'Update Password'}
            </button>
          </div>

          {/* 2FA Section */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Two-Factor Authentication</div>
              {profile?.two_fa_enabled && (
                <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>
                  ✓ Enabled
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.875rem' }}>
              {profile?.two_fa_enabled
                ? 'Your account is protected with email-based 2FA. A verification code will be sent to your email on each login.'
                : 'Add an extra layer of security. We\'ll send a verification code to your email when you log in.'}
            </div>

            {/* 2FA Error/Success */}
            {tfaError && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.65rem', color: '#991b1b', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                {tfaError}
              </div>
            )}

            {!profile?.two_fa_enabled ? (
              <>
                {!tfaStep ? (
                  <button
                    className="btn-ghost"
                    style={{ width: '100%', justifyContent: 'center', borderColor: '#10b981', color: '#16a34a' }}
                    onClick={handleSend2faCode}
                    disabled={tfaSending}
                  >
                    {tfaSending ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sending code...</> : <><Shield size={14} /> Enable 2FA via Email</>}
                  </button>
                ) : (
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#0369a1', margin: '0 0 0.75rem', fontWeight: 500 }}>
                      📧 A 6-digit code was sent to <strong>{profile?.email}</strong>. Enter it below:
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={tfaCode}
                        onChange={e => setTfaCode(e.target.value.replace(/\D/g, ''))}
                        className="form-input"
                        style={{ flex: 1, textAlign: 'center', fontSize: '1.3rem', letterSpacing: '0.3em', fontWeight: 700 }}
                        autoFocus
                      />
                      <button
                        className="btn-primary"
                        onClick={handleVerify2fa}
                        disabled={tfaCode.length !== 6 || tfaSending}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {tfaSending ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Verify'}
                      </button>
                    </div>
                    <button
                      onClick={() => { setTfaStep(false); setTfaCode(''); setTfaError(''); }}
                      style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem' }}
                    >
                      ← Cancel
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'center', borderColor: '#fca5a5', color: '#ef4444' }}
                onClick={handleDisable2fa}
                disabled={tfaSending}
              >
                {tfaSending ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Disabling...</> : 'Disable 2FA'}
              </button>
            )}
          </div>
        </div>

        {/* Notifications Card */}
        <div className="card">
          <h2 style={{ fontSize: '0.97rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.875rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={16} /> Notification Preferences
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { label: 'New booking confirmation (email)', key: 'newBooking' },
              { label: 'Booking cancellation alerts',       key: 'cancellation' },
              { label: 'Daily revenue summary report',      key: 'dailySummary' },
              { label: 'Staff availability changes',         key: 'staffChanges' },
              { label: 'Equipment maintenance due',          key: 'equipment' },
              { label: 'Refund processed alerts',            key: 'refunds' },
            ].map(({ label, key }) => (
              <label key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.875rem', color: '#475569' }}>{label}</span>
                <div onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))} style={{ width: 40, height: 22, borderRadius: 99, background: notifications[key] ? '#2563eb' : '#e2e8f0', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: notifications[key] ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* Team Members */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '0.97rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Team & User Access Control</h2>
            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>Manage who has access to this clinic's admin panel.</p>
          </div>
          <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }} onClick={() => setInviteOpen(true)}>
            + Invite User
          </button>
        </div>

        {team.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>No team members yet. Start by inviting a colleague!</p>
            <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }} onClick={() => setInviteOpen(true)}>
              + Invite First Team Member
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.map(u => {
                  const isOwner = u.role_in_clinic === 'clinic_admin';
                  const statusLabel = u.status === 'available' ? 'Active' : u.status === 'on_leave' ? 'On Leave' : u.status === 'in_session' ? 'In Session' : u.status;
                  const statusClass = u.status === 'available' ? 'badge-green' : u.status === 'in_session' ? 'badge-amber' : 'badge-red';
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.first_name} {u.last_name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{u.email}</div>
                      </td>
                      <td>
                        {isOwner ? (
                          <span className="badge badge-purple">Owner</span>
                        ) : (
                          <select
                            value={u.role_in_clinic || 'view_only'}
                            className="form-input"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', width: 'auto', minWidth: 120 }}
                            onChange={e => updateMemberRole(u.id, e.target.value)}
                          >
                            {ASSIGNABLE_ROLES.map(r => <option key={r} value={r}>{ROLE_DISPLAY(r)}</option>)}
                            {u.role_in_clinic === 'therapist' && <option value="therapist">Therapist</option>}
                          </select>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td>
                        {!isOwner && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => toggleStatus(u.id)}
                              className="btn-ghost"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                            >
                              {u.status === 'available' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => setConfirm({ type: 'remove', data: u })}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.3rem' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sign Out */}
      <div className="card" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Sign Out</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>You will be redirected to the portal selection screen.</div>
        </div>
        <button
          onClick={() => setConfirm({ type: 'logout' })}
          className="btn-ghost"
          style={{ borderColor: '#fca5a5', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <LogOut size={15} /> Sign Out of Physiobook
        </button>
      </div>

      {/* Modals */}
      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onInvite={inviteUser} />}

      {confirm?.type === 'remove' && (
        <ConfirmModal
          title="Remove User"
          message={`Remove ${confirm.data.first_name} ${confirm.data.last_name} from this clinic? They will lose all access immediately.`}
          danger
          onConfirm={() => { removeUser(confirm.data.id); setConfirm(null); }}
          onClose={() => setConfirm(null)}
        />
      )}

      {confirm?.type === 'logout' && (
        <ConfirmModal
          title="Sign Out"
          message="Are you sure you want to sign out of the Physiobook admin panel?"
          onConfirm={handleLogout}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
