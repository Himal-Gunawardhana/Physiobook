import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Eye, Save, Palette, Clock, MapPin, Phone, Star, Lock, AlertCircle, Loader } from 'lucide-react';
import api from '../../lib/api';

const PRESET_THEMES = [
  { id: 'blue',   label: 'Ocean Blue',  primary: '#2563eb', bg: '#eff6ff' },
  { id: 'green',  label: 'Fresh Mint',  primary: '#10b981', bg: '#f0fdf4' },
  { id: 'purple', label: 'Royal Plum',  primary: '#8b5cf6', bg: '#faf5ff' },
  { id: 'amber',  label: 'Warm Sunset', primary: '#f59e0b', bg: '#fffbeb' },
  { id: 'rose',   label: 'Soft Rose',   primary: '#e11d48', bg: '#fff1f2' },
  { id: 'slate',  label: 'Midnight',    primary: '#334155', bg: '#f8fafc' },
];

/* ── Live preview ─────────────────────────────────────────────────────────── */
function BookingPagePreview({ config, services = [], packages = [] }) {
  const { clinicName, tagline, primaryColor, bgColor, phone, address, showRatings, showPrices, showFastTrack, heroMessage } = config;

  // Split packages: fast-track vs regular
  const fastTrackPkgs = packages.filter(p => p.is_fast_track && p.is_active !== false);
  const regularPkgs   = packages.filter(p => !p.is_fast_track && p.is_active !== false);
  const activeServices = services.filter(s => s.is_active !== false);

  const formatDuration = (mins) => {
    if (!mins) return '';
    return mins >= 60 ? `${Math.floor(mins/60)}h${mins%60 ? ` ${mins%60}m` : ''}` : `${mins} min`;
  };

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', fontFamily: 'Inter, sans-serif', fontSize: '13px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <div style={{ background: primaryColor || '#2563eb', color: 'white', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: '1rem' }}>{clinicName || 'Your Clinic Name'}</span>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem', opacity: 0.9 }}>
          {address && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><MapPin size={10}/> {address}</span>}
          {phone   && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Phone size={10}/> {phone}</span>}
        </div>
      </div>
      <div style={{ background: bgColor || '#eff6ff', padding: '1.5rem 1.25rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
          {heroMessage || 'What do you need help with?'}
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>{tagline || 'Book your physiotherapy appointment online.'}</p>
      </div>
      <div style={{ padding: '1rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 380, overflowY: 'auto' }}>

        {/* Fast-Track Packages — always on top */}
        {showFastTrack && fastTrackPkgs.map(pkg => (
          <div key={pkg.id} style={{ background: `${(primaryColor||'#2563eb')}12`, border: `1.5px solid ${(primaryColor||'#2563eb')}40`, borderRadius: 8, padding: '0.6rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: primaryColor || '#2563eb' }}>⚡ {pkg.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {pkg.session_count} session{pkg.session_count > 1 ? 's' : ''}
                {pkg.discount_percent > 0 && <> · <span style={{ color: '#10b981', fontWeight: 600 }}>{pkg.discount_percent}% off</span></>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {showPrices && <span style={{ fontSize: '0.82rem', fontWeight: 700, color: primaryColor || '#2563eb' }}>LKR {Number(pkg.price).toLocaleString()}</span>}
              <span style={{ background: primaryColor || '#2563eb', color: 'white', padding: '0.25rem 0.5rem', borderRadius: 5, fontSize: '0.7rem', fontWeight: 600 }}>Quick Book</span>
            </div>
          </div>
        ))}

        {/* Fallback fast-track if none defined but toggle is on */}
        {showFastTrack && fastTrackPkgs.length === 0 && (
          <div style={{ background: `${(primaryColor||'#2563eb')}12`, border: `1.5px solid ${(primaryColor||'#2563eb')}40`, borderRadius: 8, padding: '0.6rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: primaryColor || '#2563eb' }}>⚡ Fast-Track Walk-in</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Express booking — choose time only</div>
            </div>
            <span style={{ background: primaryColor || '#2563eb', color: 'white', padding: '0.25rem 0.5rem', borderRadius: 5, fontSize: '0.7rem', fontWeight: 600 }}>Quick Book</span>
          </div>
        )}

        {/* Services */}
        {activeServices.length > 0 && (
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.35rem 0 0.1rem', marginTop: activeServices.length > 0 && (showFastTrack) ? '0.25rem' : 0 }}>Services</div>
        )}
        {activeServices.map(s => (
          <div key={s.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.6rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{s.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {s.duration_minutes && <><Clock size={9} style={{ marginRight: 2, marginBottom: -1 }}/>{formatDuration(s.duration_minutes)}</>}
                {s.description && <> · {s.description.length > 40 ? s.description.slice(0,40) + '…' : s.description}</>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {showPrices && s.price > 0 && <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>LKR {Number(s.price).toLocaleString()}</span>}
              <span style={{ background: primaryColor || '#2563eb', color: 'white', padding: '0.25rem 0.5rem', borderRadius: 5, fontSize: '0.7rem', fontWeight: 600 }}>Book</span>
            </div>
          </div>
        ))}

        {/* Regular Packages */}
        {regularPkgs.length > 0 && (
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.35rem 0 0.1rem', marginTop: '0.25rem' }}>Packages</div>
        )}
        {regularPkgs.map(pkg => (
          <div key={pkg.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.6rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{pkg.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {pkg.session_count} session{pkg.session_count > 1 ? 's' : ''}
                {pkg.discount_percent > 0 && <> · <span style={{ color: '#10b981', fontWeight: 600 }}>{pkg.discount_percent}% off</span></>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {showPrices && <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>LKR {Number(pkg.price).toLocaleString()}</span>}
              <span style={{ background: primaryColor || '#2563eb', color: 'white', padding: '0.25rem 0.5rem', borderRadius: 5, fontSize: '0.7rem', fontWeight: 600 }}>Book</span>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {activeServices.length === 0 && regularPkgs.length === 0 && fastTrackPkgs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
            No services or packages yet. Add them in the Services tab.
          </div>
        )}
      </div>
      {showRatings && (
        <div style={{ padding: '0.625rem 1.25rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#64748b' }}>
          {[1,2,3,4,5].map(i => <Star key={i} size={11} fill="#f59e0b" color="#f59e0b" />)}
          <span>Patient reviews will show here</span>
        </div>
      )}
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function canEditName(lastChangedAt) {
  if (!lastChangedAt) return true;
  const daysSince = (Date.now() - new Date(lastChangedAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= 30;
}

function daysUntilNameEditable(lastChangedAt) {
  if (!lastChangedAt) return 0;
  const daysSince = (Date.now() - new Date(lastChangedAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.ceil(30 - daysSince);
}

/* ── Main Component ─────────────────────────────────────────────────────────── */
export default function BookingPage() {
  const { activeClinic } = useOutletContext() ?? {};
  const clinicId = activeClinic?.id;

  const [config, setConfig] = useState({
    clinicName:     '',
    tagline:        '',
    heroMessage:    '',
    address:        '',
    phone:          '',
    primaryColor:   '#2563eb',
    bgColor:        '#eff6ff',
    showRatings:    false,
    showPrices:     true,
    showFastTrack:  true,
    allowHomeVisit: false,
    allowOnline:    false,
  });

  const [nameLastChanged, setNameLastChanged] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');
  const [toast,    setToast]    = useState('');
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const update = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));
  const applyPreset = (p) => { update('primaryColor', p.primary); update('bgColor', p.bg); };

  /* Load portal config + clinic details */
  const load = useCallback(async () => {
    if (!clinicId) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      // Load portal config (theme / feature toggles)
      const portalData = await api.get(`/clinics/${clinicId}/portal-config`);
      // Load clinic basic info (name, address, phone)
      const clinicData = await api.get(`/clinics/${clinicId}`);
      // Load real services & packages
      const [svcData, pkgData] = await Promise.all([
        api.get(`/clinics/${clinicId}/services`).catch(() => []),
        api.get(`/clinics/${clinicId}/packages`).catch(() => []),
      ]);
      setServices(Array.isArray(svcData) ? svcData : svcData?.services ?? []);
      setPackages(Array.isArray(pkgData) ? pkgData : pkgData?.packages ?? []);

      setConfig(prev => ({
        ...prev,
        clinicName:    clinicData?.name    || '',
        address:       clinicData?.address || clinicData?.city || '',
        phone:         clinicData?.phone   || '',
        // Portal config overrides
        tagline:       portalData?.tagline       ?? prev.tagline,
        heroMessage:   portalData?.heroMessage   ?? prev.heroMessage,
        primaryColor:  portalData?.primaryColor  ?? prev.primaryColor,
        bgColor:       portalData?.bgColor       ?? prev.bgColor,
        showRatings:   portalData?.showRatings   ?? prev.showRatings,
        showPrices:    portalData?.showPrices    ?? prev.showPrices,
        showFastTrack: portalData?.showFastTrack ?? prev.showFastTrack,
        allowHomeVisit:portalData?.allowHomeVisit?? prev.allowHomeVisit,
        allowOnline:   portalData?.allowOnline   ?? prev.allowOnline,
      }));

      // Track when clinic name was last changed (from portal config)
      if (portalData?.clinicNameLastChanged) {
        setNameLastChanged(portalData.clinicNameLastChanged);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load booking page config.');
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  /* Save */
  const save = async () => {
    if (!clinicId) return;
    setSaving(true); setError('');
    try {
      const nameEditable = canEditName(nameLastChanged);

      // 1. Save portal config (theme, toggles, tagline)
      await api.put(`/clinics/${clinicId}/portal-config`, {
        tagline:        config.tagline,
        heroMessage:    config.heroMessage,
        primaryColor:   config.primaryColor,
        bgColor:        config.bgColor,
        showRatings:    config.showRatings,
        showPrices:     config.showPrices,
        showFastTrack:  config.showFastTrack,
        allowHomeVisit: config.allowHomeVisit,
        allowOnline:    config.allowOnline,
        ...(nameEditable ? { clinicNameLastChanged: new Date().toISOString() } : {}),
      });

      // 2. Save clinic name/address/phone if name is editable or fields other than name changed
      const clinicUpdate = {
        address: config.address || undefined,
        phone:   config.phone   || undefined,
      };
      if (nameEditable && config.clinicName.trim()) {
        clinicUpdate.name = config.clinicName.trim();
        setNameLastChanged(new Date().toISOString());
      }
      await api.put(`/clinics/${clinicId}`, clinicUpdate);

      setSaved(true);
      showToast('Booking page published!');
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const nameEditable = canEditName(nameLastChanged);
  const daysLeft = daysUntilNameEditable(nameLastChanged);
  const slug = activeClinic?.slug || '';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '6rem', color: '#64748b' }}>
        <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="animate-in">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#0f172a', color: '#fff', borderRadius: 12, padding: '0.9rem 1.5rem', fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', fontSize: '0.9rem' }}>
          {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Booking Page Designer</h1>
          <p className="page-subtitle">Customise how your clinic's public booking page looks to patients.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href={`/book?clinic=${clinicId}`} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <Eye size={15} /> Preview
          </a>
          <button className="btn-primary" onClick={save} disabled={saving} style={{ background: saved ? '#10b981' : '#2563eb', opacity: saving ? 0.75 : 1 }}>
            {saving ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }}/> Saving…</> : <><Save size={15}/> {saved ? 'Published!' : 'Publish Changes'}</>}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.875rem 1.25rem', color: '#991b1b', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertCircle size={16}/> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── Controls ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Clinic Identity */}
          <div className="card">
            <h3 style={{ fontSize: '0.97rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
              Clinic Identity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Clinic Name — locked for 30 days after each change */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Clinic Name</label>
                  {!nameEditable && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
                      <Lock size={12}/> Editable in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <input
                  className="form-input"
                  value={config.clinicName}
                  onChange={e => update('clinicName', e.target.value)}
                  placeholder="Enter your clinic name"
                  disabled={!nameEditable}
                  style={{ opacity: nameEditable ? 1 : 0.6, cursor: nameEditable ? 'text' : 'not-allowed', background: nameEditable ? '' : '#f8fafc' }}
                />
                {nameEditable && (
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                    ⚠️ Clinic name can only be changed once every 30 days.
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">Hero Heading</label>
                <input className="form-input" value={config.heroMessage} onChange={e => update('heroMessage', e.target.value)} placeholder="e.g. What do you need help with?" />
              </div>
              <div>
                <label className="form-label">Tagline / Subtitle</label>
                <input className="form-input" value={config.tagline} onChange={e => update('tagline', e.target.value)} placeholder="e.g. Professional physiotherapy for every stage of life." />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Location</label>
                  <input className="form-input" value={config.address} onChange={e => update('address', e.target.value)} placeholder="City / Area" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={config.phone} onChange={e => update('phone', e.target.value)} placeholder="+94 77 123 4567" />
                </div>
              </div>
            </div>
          </div>

          {/* Colour Theme */}
          <div className="card">
            <h3 style={{ fontSize: '0.97rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
              <Palette size={15} style={{ marginRight: '0.4rem', marginBottom: -2 }}/>
              Colour Theme
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
              {PRESET_THEMES.map(p => (
                <button key={p.id} onClick={() => applyPreset(p)} style={{
                  padding: '0.6rem', borderRadius: 8,
                  border: config.primaryColor === p.primary ? '2.5px solid #0f172a' : '1.5px solid #e2e8f0',
                  cursor: 'pointer', background: p.bg,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', transition: 'all 0.15s',
                }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: p.primary }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569' }}>{p.label}</span>
                </button>
              ))}
            </div>
            <div>
              <label className="form-label">Custom Primary Colour</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="color" value={config.primaryColor} onChange={e => update('primaryColor', e.target.value)} style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', borderRadius: 6 }} />
                <code style={{ fontSize: '0.85rem', color: '#475569' }}>{config.primaryColor}</code>
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
                { key: 'showPrices',     label: 'Show service prices on the booking page',       icon: '💰' },
                { key: 'showRatings',    label: 'Display clinic star rating & review count',      icon: '⭐' },
                { key: 'showFastTrack',  label: 'Show ⚡ Fast-Track express booking option',      icon: '⚡' },
                { key: 'allowHomeVisit', label: 'Allow patients to select Home Visit mode',       icon: '🏠' },
                { key: 'allowOnline',    label: 'Allow patients to book Online consultations',    icon: '💻' },
              ].map(({ key, label, icon }) => (
                <label key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '1rem' }}>
                  <span style={{ fontSize: '0.88rem', color: '#475569' }}>{icon} {label}</span>
                  <div onClick={() => update(key, !config[key])} style={{
                    width: 44, height: 24, borderRadius: 99,
                    background: config[key] ? config.primaryColor : '#e2e8f0',
                    position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      position: 'absolute', top: 3, left: config[key] ? 23 : 3,
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── Live Preview ── */}
        <div style={{ position: 'sticky', top: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <h3 style={{ fontSize: '0.97rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Eye size={15}/> Live Preview
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Updates as you type</span>
          </div>
          <BookingPagePreview config={config} services={services} packages={packages} />
          {clinicId && (
            <div style={{ marginTop: '1rem', padding: '0.875rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: '0.82rem', color: '#166534' }}>
              ✅ Live at: <strong><a href={`${window.location.origin}/book?clinic=${clinicId}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>{window.location.host}/book?clinic={clinicId}</a></strong>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
