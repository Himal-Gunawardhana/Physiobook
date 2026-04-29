import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Wifi, LogIn, Loader, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

// Fallback demo data while the backend loads (or if no clinic services exist yet)
const FALLBACK_SERVICES = [
  { id: 1, name: 'Initial Assessment',              description: 'Comprehensive 45-min evaluation by a specialist.',        price: 3500, duration_minutes: 45, requires_equipment: null },
  { id: 2, name: 'Short Wave Diathermy Therapy',    description: 'Deep heat treatment for chronic pain relief.',            price: 2800, duration_minutes: 30, requires_equipment: 'Short Wave Diathermy Unit' },
  { id: 3, name: 'Rehabilitation Exercise Programme',description: 'Guided exercise plan to rebuild strength.',              price: 3000, duration_minutes: 60, requires_equipment: null },
  { id: 4, name: 'Chest Physiotherapy & Drainage',  description: 'Airway clearance therapy with postural drainage.',       price: 4000, duration_minutes: 60, requires_equipment: 'Suctioning Machine' },
  { id: 5, name: 'Pre-Natal Exercises',             description: 'Safe pregnancy exercise program.',                        price: 2500, duration_minutes: 45, requires_equipment: null },
  { id: 6, name: 'Post-Natal Recovery',             description: 'Postpartum rehabilitation and core recovery.',            price: 2500, duration_minutes: 45, requires_equipment: null },
  { id: 7, name: 'Follow-up Session',               description: 'Standard 30-min progress check & treatment.',            price: 2200, duration_minutes: 30, requires_equipment: null },
];

const FALLBACK_PACKAGES = [
  { id: 101, name: '⚡ Fast-Track Walk-in',    description: 'Express booking — pick a time, we handle the rest.', price: 2200, is_fast_track: true },
  { id: 102, name: 'Post-Natal Full Recovery', description: '10 sessions with 15% long-term discount applied.',   price: 21250, is_fast_track: false },
];

// Use the first clinic from backend (or env override)
const DEFAULT_CLINIC_ID = import.meta.env.VITE_DEFAULT_CLINIC_ID || null;

const modeBadge = (icon, label) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
    {icon} {label}
  </span>
);

export default function ClinicLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [clinic,   setClinic]   = useState(null);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Step 1: get clinic list to find the first active clinic
        let clinicId = DEFAULT_CLINIC_ID;

        if (!clinicId) {
          const data = await api.get('/clinics?limit=1');
          const list = Array.isArray(data) ? data : data?.clinics ?? [];
          clinicId = list[0]?.id;
        }

        if (!clinicId) throw new Error('No clinics found');

        // Step 2: fetch clinic details + services + packages in parallel
        const [clinicData, svcData, pkgData] = await Promise.all([
          api.get(`/clinics/${clinicId}`),
          api.get(`/clinics/${clinicId}/services`),
          api.get(`/clinics/${clinicId}/packages`),
        ]);

        if (cancelled) return;

        setClinic(clinicData);
        const svcs = Array.isArray(svcData) ? svcData : svcData?.services ?? [];
        const pkgs = Array.isArray(pkgData) ? pkgData : pkgData?.packages ?? [];

        setServices(svcs.length ? svcs : FALLBACK_SERVICES);
        setPackages(pkgs.length ? pkgs : FALLBACK_PACKAGES);
      } catch (err) {
        if (cancelled) return;
        console.warn('Using fallback data:', err?.message || err);
        setServices(FALLBACK_SERVICES);
        setPackages(FALLBACK_PACKAGES);
        setError('');  // Not a blocking error — fallback data is shown
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="patient-page">
      {/* Auth prompt banner */}
      {!isLoggedIn && (
        <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderBottom: '1px solid #bfdbfe', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <LogIn size={18} color="#2563eb" />
            <span style={{ color: '#1e40af', fontWeight: 600, fontSize: '0.88rem' }}>Register or Log in to Book — it only takes 30 seconds</span>
          </div>
          <button onClick={() => navigate('/book/register')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Sign In / Register <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="patient-header">
        <Link to="/" className="patient-header-logo">
          {clinic?.name || 'Elite Physio Center'}
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          {clinic?.city && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> {clinic.city}</span>}
          {clinic?.operating_hours?.weekdays && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={13} /> {clinic.operating_hours.weekdays}</span>
          )}
        </div>
      </header>

      <main className="patient-main">
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
            What do you need help with?
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Select a service below to choose your time slot, therapist, and visit mode.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#64748b' }}>
            <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Services */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '3rem' }}>
              {services.map(s => (
                <div key={s.id} className="service-card">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{s.name}</h3>
                      {s.requires_equipment && (
                        <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '0.72rem', fontWeight: 600, padding: '0.1rem 0.5rem', borderRadius: 4, flexShrink: 0 }}>
                          Needs: {s.requires_equipment}
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#64748b', margin: '0 0 0.5rem', fontSize: '0.88rem' }}>{s.description}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {modeBadge(<Clock size={11} />, `${s.duration_minutes} min`)}
                      {modeBadge(<MapPin size={11} />, 'Clinic')}
                      {modeBadge(<Wifi size={11} />, 'Online')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>LKR {Number(s.price || 0).toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>per session</div>
                    </div>
                    <Link
                      to="/book/time"
                      state={{ service: s, clinicId: clinic?.id }}
                      className="btn-primary"
                      style={{ padding: '0.55rem 1rem', fontSize: '0.87rem' }}
                    >
                      Book <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Packages */}
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.35rem' }}>Express & Long-Term Packages</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Curated packages offered by the clinic, including simplified Fast-Track bookings.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {packages.map(p => (
                <div key={p.id} className="service-card"
                  style={{ background: p.is_fast_track ? 'linear-gradient(to right, #f0f9ff, #fff)' : 'white', borderColor: p.is_fast_track ? '#bae6fd' : '#e2e8f0' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.3rem', color: p.is_fast_track ? '#0369a1' : '#0f172a' }}>{p.name}</h3>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>{p.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: p.is_fast_track ? '#0369a1' : '#0f172a' }}>LKR {Number(p.price || 0).toLocaleString()}</div>
                    </div>
                    <Link
                      to="/book/time"
                      state={{ service: p, isFastTrack: p.is_fast_track, clinicId: clinic?.id }}
                      className="btn-primary"
                      style={{ padding: '0.55rem 1rem', fontSize: '0.87rem', background: p.is_fast_track ? '#0284c7' : '#2563eb' }}
                    >
                      {p.is_fast_track ? '⚡ Quick Book' : 'Select'} <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
