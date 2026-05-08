import React, { useState, useEffect, useCallback } from 'react';
import { Save, Palette, Bell, Shield, AlertCircle, Loader } from 'lucide-react';
import api from '../../lib/api';

export default function Settings() {
  const [clinicName, setClinicName] = useState('');
  const [color, setColor] = useState('#2563eb');
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
        const data = await api.get('/clinic/settings');
        setClinicName(data.clinic_name || '');
        setColor(data.primary_color || '#2563eb');
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
    if (!clinicName.trim()) {
      setError('Clinic name is required.');
      return;
    }
    setSaving(true);
    try {
      await api.put('/clinic/settings', {
        clinic_name: clinicName,
        primary_color: color,
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
          <h1 className="page-title">Clinic Settings & Branding</h1>
          <p className="page-subtitle">Customize your clinic's name, theme, and notification preferences.</p>
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

      <div className="settings-grid">

        {/* Clinic Branding */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#faf5ff', padding: '0.5rem', borderRadius: 8 }}><Palette size={18} color="#8b5cf6" /></div>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Clinic Branding</h2>
          </div>
          
          <label className="form-label">Clinic Name</label>
          <input 
            type="text" 
            value={clinicName} 
            onChange={e => setClinicName(e.target.value)}
            placeholder="Enter your clinic name" 
            className="form-input" 
            style={{ marginBottom: '1rem' }} 
            maxLength={100}
          />
          
          <label className="form-label">Primary Brand Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <input 
              type="color" 
              value={color} 
              onChange={e => setColor(e.target.value)}
              style={{ width: 48, height: 48, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 8 }} 
            />
            <div>
              <code style={{ fontSize: '0.87rem', color: '#475569' }}>{color}</code>
              <div style={{ display: 'flex', marginTop: '0.3rem', gap: '0.4rem' }}>
                {['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'].map(c => (
                  <button 
                    key={c} 
                    onClick={() => setColor(c)} 
                    style={{ width: 20, height: 20, background: c, border: color === c ? '2px solid #0f172a' : '2px solid transparent', borderRadius: 4, cursor: 'pointer' }} 
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div style={{ padding: '0.75rem', background: color + '18', borderRadius: 8, border: `1px solid ${color}40`, fontSize: '0.85rem', color: '#0f172a' }}>
            Preview: <strong style={{ color }}>Book Now</strong> button and header will use this color.
          </div>
        </div>

        {/* Notifications */}
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

        {/* Security */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#fef2f2', padding: '0.5rem', borderRadius: 8 }}><Shield size={18} color="#ef4444" /></div>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Security</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Current Password</label>
              <input type="password" placeholder="••••••••" className="form-input" />
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input type="password" placeholder="••••••••" className="form-input" />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input type="password" placeholder="••••••••" className="form-input" />
            </div>
            <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
              Update Password
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
