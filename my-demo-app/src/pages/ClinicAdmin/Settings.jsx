import React, { useState, useEffect } from 'react';
import { Save, Bell, AlertCircle, Loader } from 'lucide-react';
import api from '../../lib/api';

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
          <h1 className="page-title">Notification Settings</h1>
          <p className="page-subtitle">Manage how and when your clinic receives alerts.</p>
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

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#fefce8', padding: '0.5rem', borderRadius: 8 }}><Bell size={18} color="#f59e0b" /></div>
          <h2 style={{ fontSize: '1rem', margin: 0 }}>Notifications</h2>
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem', lineHeight: 1.4 }}>
          <input 
            type="checkbox" 
            checked={notifications.bookingEmail} 
            onChange={e => setNotifications({ ...notifications, bookingEmail: e.target.checked })}
            style={{ marginTop: 3 }} 
          />
          <span style={{ fontSize: '0.9rem', color: '#475569' }}>Email confirmation for each new booking</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem', lineHeight: 1.4 }}>
          <input 
            type="checkbox" 
            checked={notifications.smsReminder}
            onChange={e => setNotifications({ ...notifications, smsReminder: e.target.checked })}
            style={{ marginTop: 3 }} 
          />
          <span style={{ fontSize: '0.9rem', color: '#475569' }}>SMS reminder 2 hours before appointment</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem', lineHeight: 1.4 }}>
          <input 
            type="checkbox" 
            checked={notifications.dailyReport}
            onChange={e => setNotifications({ ...notifications, dailyReport: e.target.checked })}
            style={{ marginTop: 3 }} 
          />
          <span style={{ fontSize: '0.9rem', color: '#475569' }}>Daily revenue summary report</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', lineHeight: 1.4 }}>
          <input 
            type="checkbox" 
            checked={notifications.equipmentAlert}
            onChange={e => setNotifications({ ...notifications, equipmentAlert: e.target.checked })}
            style={{ marginTop: 3 }} 
          />
          <span style={{ fontSize: '0.9rem', color: '#475569' }}>Alert when equipment needs maintenance</span>
        </label>
      </div>
    </div>
  );
}

