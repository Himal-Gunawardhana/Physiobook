import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Bell, LogOut, Edit2, Save,
  Eye, EyeOff, Trash2, AlertTriangle, CheckCircle, X, Loader, AlertCircle
} from 'lucide-react';
import api from '../../lib/api';

const ROLES = ['Owner', 'Manager', 'Receptionist', 'View Only'];

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Receptionist');
  const [saving, setSaving] = useState(false);

  const handleInvite = async () => {
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    try {
      await onInvite(name, email, role);
      setName('');
      setEmail('');
      setRole('Receptionist');
      onClose();
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
          <div>
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="e.g. Nimasha Perera" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@clinic.com" />
          </div>
          <div>
            <label className="form-label">Assign Role</label>
            <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.filter(r => r !== 'Owner').map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '0.75rem', fontSize: '0.82rem', color: '#0369a1' }}>
            📧 An invitation email will be sent to this address with a secure setup link.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleInvite} disabled={!name.trim() || !email.trim() || saving}>
            {saving ? <>Saving...</> : 'Send Invitation'}
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
  const [pwdSaving,        setPwdSaving]        = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Load profile and team
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [profileData, teamData] = await Promise.all([
          api.get('/users/me'),
          api.get('/clinic/team')
        ]);
        setProfile(profileData);
        setTeam(Array.isArray(teamData) ? teamData : teamData?.team ?? []);
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

  const removeUser = async (id) => {
    try {
      await api.delete(`/clinic/team/${id}`);
      setTeam(prev => prev.filter(u => u.id !== id));
      showToast('User removed successfully.');
    } catch (err) {
      showToast(`Error: ${err?.message || 'Failed to remove user.'}`);
    }
    setConfirm(null);
  };

  const toggleStatus = async (id) => {
    try {
      const user = team.find(u => u.id === id);
      const newStatus = user?.status === 'Active' ? 'Inactive' : 'Active';
      await api.patch(`/clinic/team/${id}`, { status: newStatus });
      setTeam(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      showToast(`User ${newStatus.toLowerCase()}.`);
    } catch (err) {
      showToast(`Error: ${err?.message || 'Failed to update status.'}`);
    }
  };

  const inviteUser = async (name, email, role) => {
    try {
      await api.post('/clinic/team/invite', { name, email, role });
      setTeam(prev => [...prev, { id: Date.now(), name, email, role, status: 'Pending', lastLogin: 'Never' }]);
      showToast('Invitation sent!');
    } catch (err) {
      showToast(`Error: ${err?.message || 'Failed to send invitation.'}`);
      throw err;
    }
  };

  const handlePasswordChange = async () => {
    setPwdError('');
    
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
      showToast('Password updated successfully!');
    } catch (err) {
      setPwdError(err?.message || 'Failed to update password.');
    } finally {
      setPwdSaving(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await api.put('/users/me', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email
      });
      showToast('Profile updated successfully!');
      setEditProfile(false);
    } catch (err) {
      showToast(`Error: ${err?.message || 'Failed to update profile.'}`);
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
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#1e40af', flexShrink: 0 }}>
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{profile.firstName} {profile.lastName}</div>
                <span className="badge badge-purple">{profile.role === 'clinic_admin' ? 'Clinic Admin' : profile.role}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">First Name</label>
                <input 
                  className="form-input" 
                  value={profile.firstName || ''} 
                  onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                  disabled={!editProfile} 
                  style={{ opacity: editProfile ? 1 : 0.7 }} 
                />
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input 
                  className="form-input" 
                  value={profile.lastName || ''} 
                  onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                  disabled={!editProfile} 
                  style={{ opacity: editProfile ? 1 : 0.7 }} 
                />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={profile.email || ''} 
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  disabled={!editProfile} 
                  style={{ opacity: editProfile ? 1 : 0.7 }} 
                />
              </div>
              {editProfile && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-primary" onClick={handleProfileUpdate} style={{ flex: 1, justifyContent: 'center' }}>
                    <Save size={14} /> Save Changes
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
              {pwdSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Two-Factor Authentication</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.875rem' }}>Add an extra layer of security to your account with 2FA.</div>
            <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', borderColor: '#10b981', color: '#16a34a' }}>Enable 2FA</button>
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
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{u.email}</div>
                    </td>
                    <td>
                      {u.role === 'Owner' ? (
                        <span className="badge badge-purple">{u.role}</span>
                      ) : (
                        <select
                          defaultValue={u.role}
                          className="form-input"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', width: 'auto', minWidth: 120 }}
                          onChange={e => setTeam(prev => prev.map(x => x.id === u.id ? { ...x, role: e.target.value } : x))}
                          disabled={u.role === 'Owner'}
                        >
                          {ROLES.filter(r => r !== 'Owner').map(r => <option key={r}>{r}</option>)}
                        </select>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'Active' ? 'badge-green' : u.status === 'Pending' ? 'badge-amber' : 'badge-red'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{u.lastLogin || 'Never'}</td>
                    <td>
                      {u.role !== 'Owner' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => toggleStatus(u.id)}
                            className="btn-ghost"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                          >
                            {u.status === 'Active' ? 'Deactivate' : 'Activate'}
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
                ))}
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
          message={`Remove ${confirm.data.name} from this clinic? They will lose all access immediately.`}
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
