import React, { useState, useEffect } from 'react';
import { Save, Bell, AlertCircle, Loader, Wifi, WifiOff, ShieldAlert, Trash2, Power, CheckCircle2, XCircle } from 'lucide-react';
import api, { tokenStore } from '../../lib/api';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    bookingEmail: true,
    smsReminder: true,
    dailyReport: false,
    equipmentAlert: true,
  });

  // Clinic status state
  const [clinicStatus, setClinicStatus] = useState('online');
  const [isActive, setIsActive] = useState(true);

  // Modal state
  const [modal, setModal] = useState(null); // 'offline' | 'deactivate' | 'delete'
  const [modalPassword, setModalPassword] = useState('');
  const [modalReason, setModalReason] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  // Load clinic settings
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await api.get('/clinics/settings');
        if (data.notifications) {
          setNotifications({
            bookingEmail: data.notifications.booking_email !== false,
            smsReminder: data.notifications.sms_reminder !== false,
            dailyReport: data.notifications.daily_report === true,
            equipmentAlert: data.notifications.equipment_alert !== false,
          });
        }
        setClinicStatus(data.clinic_status || 'online');
        setIsActive(data.is_active !== false);
      } catch (err) {
        setError('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/clinics/settings', {
        notifications: {
          booking_email: notifications.bookingEmail,
          sms_reminder: notifications.smsReminder,
          daily_report: notifications.dailyReport,
          equipment_alert: notifications.equipmentAlert,
        },
      });
      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setModalPassword('');
    setModalReason('');
    setModalError('');
    setConfirmText('');
    setModalLoading(false);
  };

  const handleToggleOnline = async () => {
    const newStatus = clinicStatus === 'online' ? 'offline' : 'online';
    if (newStatus === 'offline') {
      setModal('offline');
      return;
    }
    // Going online - no confirmation needed
    try {
      setModalLoading(true);
      await api.put('/clinics/settings/online-status', { status: 'online' });
      setClinicStatus('online');
      setModalLoading(false);
    } catch (err) {
      setError(err?.message || 'Failed to update status.');
      setModalLoading(false);
    }
  };

  const confirmGoOffline = async () => {
    setModalError('');
    setModalLoading(true);
    try {
      await api.put('/clinics/settings/online-status', { status: 'offline', reason: modalReason || 'Temporarily closed' });
      setClinicStatus('offline');
      closeModal();
    } catch (err) {
      setModalError(err?.message || 'Failed to go offline.');
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!modalPassword) { setModalError('Password is required.'); return; }
    setModalError('');
    setModalLoading(true);
    try {
      await api.put('/clinics/settings/deactivate', { password: modalPassword, reason: modalReason || 'Deactivated by owner' });
      setIsActive(false);
      setClinicStatus('offline');
      closeModal();
    } catch (err) {
      setModalError(err?.message || 'Failed to deactivate.');
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!modalPassword) { setModalError('Password is required.'); return; }
    if (confirmText !== 'DELETE MY CLINIC') { setModalError('Please type "DELETE MY CLINIC" to confirm.'); return; }
    setModalError('');
    setModalLoading(true);
    try {
      const token = tokenStore.get();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/v1/clinics/settings/delete-account', {
        method: 'DELETE',
        headers,
        credentials: 'include',
        body: JSON.stringify({ password: modalPassword, reason: modalReason || 'Account permanently deleted by owner' }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error?.message || json?.message || 'Delete failed.');
      }
      closeModal();
      window.dispatchEvent(new Event('auth:logout'));
    } catch (err) {
      setModalError(err?.message || 'Failed to delete account.');
    } finally {
      setModalLoading(false);
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
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinic Settings</h1>
          <p className="page-subtitle">Manage notifications, clinic status, and account options.</p>
        </div>
        <button className="btn-primary" onClick={save} disabled={saving} style={{ background: saved ? '#10b981' : '#2563eb', opacity: saving ? 0.75 : 1 }}>
          <Save size={16} /> {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* ── Notification Settings ─────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#fefce8', padding: '0.5rem', borderRadius: 8 }}><Bell size={18} color="#f59e0b" /></div>
          <h2 style={{ fontSize: '1rem', margin: 0 }}>Notifications</h2>
        </div>
        {[
          { key: 'bookingEmail', label: 'Email confirmation for each new booking' },
          { key: 'smsReminder', label: 'SMS reminder 2 hours before appointment' },
          { key: 'dailyReport', label: 'Daily revenue summary report' },
          { key: 'equipmentAlert', label: 'Alert when equipment needs maintenance' },
        ].map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem', lineHeight: 1.4 }}>
            <input type="checkbox" checked={notifications[key]} onChange={e => setNotifications({ ...notifications, [key]: e.target.checked })} style={{ marginTop: 3 }} />
            <span style={{ fontSize: '0.9rem', color: '#475569' }}>{label}</span>
          </label>
        ))}
      </div>

      {/* ── Clinic Online Status ──────────────────────────────────── */}
      <div className="card" style={{ marginTop: '1.5rem', border: clinicStatus === 'offline' ? '1px solid #fbbf24' : '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: clinicStatus === 'online' ? '#ecfdf5' : '#fffbeb', padding: '0.5rem', borderRadius: 8 }}>
            {clinicStatus === 'online' ? <Wifi size={18} color="#10b981" /> : <WifiOff size={18} color="#f59e0b" />}
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Clinic Online Status</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
              {clinicStatus === 'online' ? 'Your clinic is visible and accepting bookings.' : 'Your clinic is temporarily offline. Patients cannot see or book your clinic.'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: clinicStatus === 'online' ? '#f0fdf4' : '#fffbeb', borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            {clinicStatus === 'online'
              ? <><CheckCircle2 size={20} color="#16a34a" /><span style={{ fontWeight: 600, color: '#16a34a' }}>Online</span></>
              : <><XCircle size={20} color="#d97706" /><span style={{ fontWeight: 600, color: '#d97706' }}>Offline</span></>
            }
          </div>
          <button
            onClick={handleToggleOnline}
            disabled={modalLoading || !isActive}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', cursor: isActive ? 'pointer' : 'not-allowed',
              fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
              background: clinicStatus === 'online' ? '#fbbf24' : '#10b981', color: clinicStatus === 'online' ? '#78350f' : '#fff',
            }}
          >
            {clinicStatus === 'online' ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
        {clinicStatus === 'online' && (
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.75rem', lineHeight: 1.5 }}>
            Taking your clinic offline will temporarily hide it from patients. Existing bookings are not affected. You can come back online at any time.
          </p>
        )}
      </div>

      {/* ── Danger Zone ───────────────────────────────────────────── */}
      <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '2px solid #fecaca' }}>
        <h2 style={{ fontSize: '1.1rem', color: '#dc2626', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={20} /> Danger Zone
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1.5rem' }}>
          These actions are serious and may affect all staff and patients associated with your clinic.
        </p>

        {/* Deactivate Clinic */}
        <div style={{ border: '1px solid #fca5a5', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.25rem', color: '#1e293b' }}>Deactivate Clinic</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Suspend your clinic temporarily. All future bookings will be cancelled. Staff and patients will lose access. Your data will be preserved and you can request reactivation from support.
              </p>
            </div>
            <button
              onClick={() => setModal('deactivate')}
              disabled={!isActive}
              style={{
                padding: '0.55rem 1.25rem', borderRadius: 8, border: '1px solid #f97316', background: 'transparent',
                color: '#f97316', fontWeight: 600, fontSize: '0.85rem', cursor: isActive ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s', opacity: isActive ? 1 : 0.5,
              }}
            >
              <Power size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              {isActive ? 'Deactivate Clinic' : 'Already Deactivated'}
            </button>
          </div>
        </div>

        {/* Delete Account */}
        <div style={{ border: '1px solid #dc2626', borderRadius: 12, padding: '1.25rem', background: '#fef2f2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.25rem', color: '#1e293b' }}>Delete Clinic Account</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Permanently close your clinic. This will deactivate your account, cancel all bookings, and block all access. <strong>Your data is retained in the system but you will not be able to log in.</strong> Contact support to reverse this.
              </p>
            </div>
            <button
              onClick={() => setModal('delete')}
              disabled={!isActive}
              style={{
                padding: '0.55rem 1.25rem', borderRadius: 8, border: 'none', background: isActive ? '#dc2626' : '#94a3b8',
                color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: isActive ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
              }}
            >
              <Trash2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={closeModal}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 480, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'fadeIn 0.2s ease-out',
          }}>
            {/* Go Offline Modal */}
            {modal === 'offline' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#fffbeb', padding: '0.6rem', borderRadius: 10 }}><WifiOff size={22} color="#f59e0b" /></div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Take Clinic Offline?</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Your clinic will be hidden from patients and no new bookings can be made. Existing bookings will not be affected. You can go back online at any time.
                </p>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Reason (optional)</label>
                <textarea value={modalReason} onChange={e => setModalReason(e.target.value)} placeholder="e.g., Holiday closure, renovations..." rows={2}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem', resize: 'vertical', marginBottom: '1rem', boxSizing: 'border-box' }} />
                {modalError && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{modalError}</p>}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={closeModal} style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                  <button onClick={confirmGoOffline} disabled={modalLoading} style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', opacity: modalLoading ? 0.7 : 1 }}>
                    {modalLoading ? 'Processing...' : 'Go Offline'}
                  </button>
                </div>
              </>
            )}

            {/* Deactivate Modal */}
            {modal === 'deactivate' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#fff7ed', padding: '0.6rem', borderRadius: 10 }}><Power size={22} color="#f97316" /></div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Deactivate Clinic</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                  This will <strong>suspend your clinic</strong>. All future bookings will be cancelled and all staff/patients will lose access. Your data will be safely preserved.
                </p>
                <p style={{ fontSize: '0.8rem', color: '#f97316', background: '#fff7ed', padding: '0.6rem 0.8rem', borderRadius: 8, marginBottom: '1rem' }}>
                  ⚠️ To reactivate, you'll need to contact Physiobook support.
                </p>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Reason (optional)</label>
                <textarea value={modalReason} onChange={e => setModalReason(e.target.value)} placeholder="Why are you deactivating?" rows={2}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem', resize: 'vertical', marginBottom: '1rem', boxSizing: 'border-box' }} />
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Confirm your password</label>
                <input type="password" value={modalPassword} onChange={e => setModalPassword(e.target.value)} placeholder="Enter your password"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem', marginBottom: '1rem', boxSizing: 'border-box' }} />
                {modalError && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{modalError}</p>}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={closeModal} style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                  <button onClick={confirmDeactivate} disabled={modalLoading || !modalPassword} style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', background: '#f97316', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', opacity: (modalLoading || !modalPassword) ? 0.6 : 1 }}>
                    {modalLoading ? 'Processing...' : 'Deactivate Clinic'}
                  </button>
                </div>
              </>
            )}

            {/* Delete Account Modal */}
            {modal === 'delete' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#fef2f2', padding: '0.6rem', borderRadius: 10 }}><Trash2 size={22} color="#dc2626" /></div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#dc2626' }}>Delete Clinic Account</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                  This will <strong>permanently close</strong> your clinic. All bookings will be cancelled, all staff and patient access will be revoked, and your account will be locked.
                </p>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', color: '#991b1b', margin: 0, lineHeight: 1.5 }}>
                    🚨 <strong>Your data will NOT be deleted</strong> — it will remain in our systems. However, you and your staff will be completely locked out. Only Physiobook support can reverse this action.
                  </p>
                </div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Reason (optional)</label>
                <textarea value={modalReason} onChange={e => setModalReason(e.target.value)} placeholder="Why are you deleting?" rows={2}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem', resize: 'vertical', marginBottom: '1rem', boxSizing: 'border-box' }} />
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Confirm your password</label>
                <input type="password" value={modalPassword} onChange={e => setModalPassword(e.target.value)} placeholder="Enter your password"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem', marginBottom: '1rem', boxSizing: 'border-box' }} />
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#dc2626', marginBottom: '0.4rem' }}>Type "DELETE MY CLINIC" to confirm</label>
                <input type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="DELETE MY CLINIC"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #fecaca', fontSize: '0.85rem', marginBottom: '1rem', boxSizing: 'border-box', fontFamily: 'monospace' }} />
                {modalError && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{modalError}</p>}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={closeModal} style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                  <button onClick={confirmDelete} disabled={modalLoading || !modalPassword || confirmText !== 'DELETE MY CLINIC'} style={{
                    padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                    opacity: (modalLoading || !modalPassword || confirmText !== 'DELETE MY CLINIC') ? 0.5 : 1,
                  }}>
                    {modalLoading ? 'Processing...' : 'Permanently Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
