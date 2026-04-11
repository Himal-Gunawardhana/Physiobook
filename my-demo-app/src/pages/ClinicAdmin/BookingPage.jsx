import React, { useState } from 'react';
import { Eye, Save, Palette, Clock, MapPin, Phone, Globe, Star, ArrowRight, Zap, RefreshCw } from 'lucide-react';

const PRESET_THEMES = [
  { id: 'blue',   label: 'Ocean Blue',  primary: '#2563eb', bg: '#eff6ff' },
  { id: 'green',  label: 'Fresh Mint',  primary: '#10b981', bg: '#f0fdf4' },
  { id: 'purple', label: 'Royal Plum',  primary: '#8b5cf6', bg: '#faf5ff' },
  { id: 'amber',  label: 'Warm Sunset', primary: '#f59e0b', bg: '#fffbeb' },
  { id: 'rose',   label: 'Soft Rose',   primary: '#e11d48', bg: '#fff1f2' },
  { id: 'slate',  label: 'Midnight',    primary: '#334155', bg: '#f8fafc' },
];

// Live preview mini-component
function BookingPagePreview({ config }) {
  const { clinicName, tagline, primaryColor, bgColor, phone, address, showRatings, showPrices, heroMessage } = config;
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', fontFamily: 'Inter, sans-serif', fontSize: '13px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      {/* Preview header */}
      <div style={{ background: primaryColor, color: 'white', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: '1rem' }}>{clinicName || 'Your Clinic'}</span>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem', opacity: 0.9 }}>
          {address && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><MapPin size={10}/> {address}</span>}
          {phone   && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Phone size={10}/> {phone}</span>}
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: bgColor, padding: '1.5rem 1.25rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
          {heroMessage || 'What do you need help with?'}
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>{tagline || 'Book your physiotherapy appointment online.'}</p>
      </div>

      {/* Sample service cards */}
      <div style={{ padding: '1rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {[
          { name: 'Initial Assessment', price: 3500, dur: '45 min' },
          { name: 'Follow-up Session',  price: 2200, dur: '30 min' },
        ].map(s => (
          <div key={s.name} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.6rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{s.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}><Clock size={9} style={{ marginRight: 2, marginBottom: -1 }}/>{s.dur}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {showPrices && <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>LKR {s.price.toLocaleString()}</span>}
              <span style={{ background: primaryColor, color: 'white', padding: '0.25rem 0.5rem', borderRadius: 5, fontSize: '0.7rem', fontWeight: 600 }}>Book</span>
            </div>
          </div>
        ))}

        {/* Fast track preview */}
        <div style={{ background: `${primaryColor}12`, border: `1.5px solid ${primaryColor}40`, borderRadius: 8, padding: '0.6rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: primaryColor }}>⚡ Fast-Track Walk-in</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Express booking — choose time only</div>
          </div>
          <span style={{ background: primaryColor, color: 'white', padding: '0.25rem 0.5rem', borderRadius: 5, fontSize: '0.7rem', fontWeight: 600 }}>Quick Book</span>
        </div>
      </div>

      {showRatings && (
        <div style={{ padding: '0.625rem 1.25rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#64748b' }}>
          <Star size={11} fill="#f59e0b" color="#f59e0b" />
          <Star size={11} fill="#f59e0b" color="#f59e0b" />
          <Star size={11} fill="#f59e0b" color="#f59e0b" />
          <Star size={11} fill="#f59e0b" color="#f59e0b" />
          <Star size={11} fill="#f59e0b" color="#f59e0b" />
          <span>4.9 · 124 patient reviews</span>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  const [config, setConfig] = useState({
    clinicName:   'Elite Physio Center',
    tagline:      'Professional physiotherapy care for every stage of life.',
    heroMessage:  'What do you need help with?',
    address:      'Colombo 07',
    phone:        '+94 11 234 5678',
    primaryColor: '#2563eb',
    bgColor:      '#eff6ff',
    showRatings:  true,
    showPrices:   true,
    showFastTrack: true,
    allowHomeVisit: true,
    allowOnline: true,
  });

  const [saved, setSaved] = useState(false);

  const update = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  const applyPreset = (preset) => {
    update('primaryColor', preset.primary);
    update('bgColor', preset.bg);
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Booking Page Designer</h1>
          <p className="page-subtitle">Customize how your clinic's public booking page looks and behaves for patients.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href="/book" target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <Eye size={15} /> Preview
          </a>
          <button className="btn-primary" onClick={save} style={{ background: saved ? '#10b981' : '#2563eb' }}>
            <Save size={15} /> {saved ? 'Saved!' : 'Publish Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Clinic Identity */}
          <div className="card">
            <h3 style={{ fontSize: '0.97rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
              Clinic Identity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Clinic Name</label>
                <input className="form-input" value={config.clinicName} onChange={e => update('clinicName', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Hero Heading</label>
                <input className="form-input" value={config.heroMessage} onChange={e => update('heroMessage', e.target.value)} placeholder="What do you need help with?" />
              </div>
              <div>
                <label className="form-label">Tagline / Subtitle</label>
                <input className="form-input" value={config.tagline} onChange={e => update('tagline', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Location</label>
                  <input className="form-input" value={config.address} onChange={e => update('address', e.target.value)} placeholder="City / Area" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={config.phone} onChange={e => update('phone', e.target.value)} placeholder="+94 11 …" />
                </div>
              </div>
            </div>
          </div>

          {/* Theme Colors */}
          <div className="card">
            <h3 style={{ fontSize: '0.97rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
              <Palette size={15} style={{ marginRight: '0.4rem', marginBottom: -2 }} />
              Colour Theme
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
              {PRESET_THEMES.map(p => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  style={{
                    padding: '0.6rem',
                    borderRadius: 8,
                    border: config.primaryColor === p.primary ? '2.5px solid #0f172a' : '1.5px solid #e2e8f0',
                    cursor: 'pointer',
                    background: p.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: p.primary }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569' }}>{p.label}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Primary Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="color" value={config.primaryColor} onChange={e => update('primaryColor', e.target.value)} style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', borderRadius: 6 }} />
                  <code style={{ fontSize: '0.85rem', color: '#475569' }}>{config.primaryColor}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="card">
            <h3 style={{ fontSize: '0.97rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
              Page Features
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { key: 'showPrices',    label: 'Show service prices on the booking page',        icon: '💰' },
                { key: 'showRatings',   label: 'Display clinic star rating & review count',       icon: '⭐' },
                { key: 'showFastTrack', label: 'Show ⚡ Fast-Track express booking option',       icon: '⚡' },
                { key: 'allowHomeVisit',label: 'Allow patients to select Home Visit mode',        icon: '🏠' },
                { key: 'allowOnline',   label: 'Allow patients to book Online consultations',     icon: '💻' },
              ].map(({ key, label, icon }) => (
                <label key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '1rem' }}>
                  <span style={{ fontSize: '0.88rem', color: '#475569' }}>{icon} {label}</span>
                  <div
                    onClick={() => update(key, !config[key])}
                    style={{
                      width: 44, height: 24, borderRadius: 99,
                      background: config[key] ? config.primaryColor : '#e2e8f0',
                      position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      position: 'absolute', top: 3, left: config[key] ? 23 : 3,
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div style={{ position: 'sticky', top: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <h3 style={{ fontSize: '0.97rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Eye size={15} /> Live Preview
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Updates as you type</span>
          </div>
          <BookingPagePreview config={config} />
          <div style={{ marginTop: '1rem', padding: '0.875rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: '0.82rem', color: '#166534' }}>
            ✅ Your live booking page is available at: <strong>elite.physiobook.itselfcare.com</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
