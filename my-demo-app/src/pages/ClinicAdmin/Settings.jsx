import React, { useState } from 'react';
import { Save, Globe, Palette, Bell, Shield } from 'lucide-react';

export default function Settings() {
  const [subdomain, setSubdomain] = useState('elite');
  const [color, setColor]         = useState('#2563eb');
  const [saved, setSaved]         = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinic Settings & Branding</h1>
          <p className="page-subtitle">Customize your clinic's public URL, theme, and notification preferences.</p>
        </div>
        <button className="btn-primary" onClick={save} style={{ background: saved ? '#10b981' : '#2563eb' }}>
          <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="settings-grid">

        {/* Subdomain */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#eff6ff', padding: '0.5rem', borderRadius: 8 }}><Globe size={18} color="#2563eb" /></div>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Subdomain</h2>
          </div>
          <label className="form-label">Your Clinic URL</label>
          <div style={{ display: 'flex', marginBottom: '0.75rem' }}>
            <input
              type="text"
              value={subdomain}
              onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="form-input"
              style={{ borderRadius: '8px 0 0 8px', borderRight: 'none' }}
            />
            <span style={{ padding: '0.75rem 0.875rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0 8px 8px 0', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              .physiobook.itselfcare.com
            </span>
          </div>
          {subdomain && (
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '0.75rem', fontSize: '0.85rem', color: '#0369a1' }}>
              🌐 <strong>{subdomain}.physiobook.itselfcare.com</strong>
            </div>
          )}
        </div>

        {/* Branding */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#faf5ff', padding: '0.5rem', borderRadius: 8 }}><Palette size={18} color="#8b5cf6" /></div>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Branding</h2>
          </div>
          <label className="form-label">Clinic Name</label>
          <input type="text" defaultValue="Elite Physio Center" className="form-input" style={{ marginBottom: '1rem' }} />
          <label className="form-label">Primary Brand Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              style={{ width: 48, height: 48, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 8 }} />
            <div>
              <code style={{ fontSize: '0.87rem', color: '#475569' }}>{color}</code>
              <div style={{ display: 'flex', marginTop: '0.3rem', gap: '0.4rem' }}>
                {['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'].map(c => (
                  <button key={c} onClick={() => setColor(c)} style={{ width: 20, height: 20, background: c, border: color === c ? '2px solid #0f172a' : '2px solid transparent', borderRadius: 4, cursor: 'pointer' }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: color + '18', borderRadius: 8, border: `1px solid ${color}40`, fontSize: '0.85rem', color: '#0f172a' }}>
            Preview: <strong style={{ color }}>Book Now</strong> button and header will use this color.
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#fefce8', padding: '0.5rem', borderRadius: 8 }}><Bell size={18} color="#f59e0b" /></div>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Notifications</h2>
          </div>
          {[
            { label: 'Email confirmation for each new booking', checked: true },
            { label: 'SMS reminder 2 hours before appointment', checked: true },
            { label: 'Daily revenue summary report', checked: false },
            { label: 'Alert when equipment needs maintenance', checked: true },
          ].map(({ label, checked }) => (
            <label key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem', lineHeight: 1.4 }}>
              <input type="checkbox" defaultChecked={checked} style={{ marginTop: 3 }} />
              <span style={{ fontSize: '0.9rem', color: '#475569' }}>{label}</span>
            </label>
          ))}
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
