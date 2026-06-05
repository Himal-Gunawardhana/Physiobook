import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Wifi, LogIn, Loader, AlertCircle, Phone, Star } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

/* ── Loading Skeleton ─────────────────────────────────── */
function Skeleton({ w = '100%', h = 16, r = 6, mb = 0 }) {
  return (
    <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: mb }} />
  );
}

function BookingPageSkeleton() {
  return (
    <div className="patient-page">
      <div style={{ padding: '1rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
        <Skeleton w={180} h={20} mb={4} /><Skeleton w={120} h={12} />
      </div>
      <div style={{ padding: '2rem 1.25rem', textAlign: 'center', background: '#eff6ff' }}>
        <Skeleton w={280} h={24} r={8} mb={8} /><Skeleton w={220} h={14} />
      </div>
      <div style={{ padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}><Skeleton w="60%" h={14} mb={6} /><Skeleton w="80%" h={10} mb={4} /><Skeleton w={80} h={10} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Skeleton w={70} h={16} /><Skeleton w={60} h={32} r={8} /></div>
          </div>
        ))}
      </div>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

const modeBadge = (icon, label) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
    {icon} {label}
  </span>
);

export default function ClinicLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [clinic,       setClinic]       = useState(null);
  const [portalConfig, setPortalConfig] = useState(null);
  const [services,     setServices]     = useState([]);
  const [packages,     setPackages]     = useState([]);
  const [therapists,   setTherapists]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const searchParams = new URLSearchParams(location.search);
        let clinicId = searchParams.get('clinic');
        
        // Extract slug from URL: /book?clinic_slug or /book?slug=clinic_slug
        let slug = searchParams.get('slug');
        if (!slug && !clinicId && location.search) {
          const firstKey = location.search.replace('?', '').split('&')[0];
          if (!firstKey.includes('=')) {
            slug = firstKey;
          }
        }

        let data;
        if (slug) {
          // Load by slug
          data = await api.get(`/clinics/slug/${slug}`);
        } else if (clinicId) {
          // Load by ID
          data = await api.get(`/clinics/${clinicId}`);
          const [svcData, pkgData, pcData, therapistData] = await Promise.all([
            api.get(`/clinics/${clinicId}/services`).catch(() => []),
            api.get(`/clinics/${clinicId}/packages`).catch(() => []),
            api.get(`/clinics/${clinicId}/portal-config`).catch(() => ({})),
            api.get(`/clinics/therapists?clinicId=${clinicId}`).catch(() => []),
          ]);
          data.services = Array.isArray(svcData) ? svcData : svcData?.services ?? [];
          data.packages = Array.isArray(pkgData) ? pkgData : pkgData?.packages ?? [];
          data.portalConfig = pcData || {};
          data.therapists = Array.isArray(therapistData) ? therapistData : therapistData?.data ?? therapistData?.therapists ?? [];
        } else {
          // Fallback: load first clinic
          const list = await api.get('/clinics?limit=1');
          const firstId = (list?.rows || list)?.[0]?.id;
          if (!firstId) throw new Error('No clinics available');
          data = await api.get(`/clinics/${firstId}`);
          // Also load services/packages separately for ID-based lookup
          const [svcData, pkgData, pcData, therapistData] = await Promise.all([
            api.get(`/clinics/${firstId}/services`).catch(() => []),
            api.get(`/clinics/${firstId}/packages`).catch(() => []),
            api.get(`/clinics/${firstId}/portal-config`).catch(() => ({})),
            api.get(`/clinics/therapists?clinicId=${firstId}`).catch(() => []),
          ]);
          data.services = Array.isArray(svcData) ? svcData : svcData?.services ?? [];
          data.packages = Array.isArray(pkgData) ? pkgData : pkgData?.packages ?? [];
          data.portalConfig = pcData || {};
          data.therapists = Array.isArray(therapistData) ? therapistData : therapistData?.data ?? therapistData?.therapists ?? [];
        }

        if (cancelled) return;
        setClinic(data);
        setPortalConfig(data.portalConfig || {});
        setServices(data.services || []);
        setPackages(data.packages || []);
        setTherapists(data.therapists || []);
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || 'Failed to load clinic');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [location.search]);

  if (loading) return <BookingPageSkeleton />;

  if (error) {
    return (
      <div className="patient-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <AlertCircle size={48} color="#ef4444" />
        <h2 style={{ fontWeight: 700, color: '#0f172a' }}>Clinic Not Found</h2>
        <p style={{ color: '#64748b', textAlign: 'center', maxWidth: 400 }}>{error}</p>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '0.5rem' }}>← Back to Home</button>
      </div>
    );
  }

  const pc = portalConfig || {};
  const primaryColor = pc.primaryColor || '#2563eb';
  const bgColor = pc.bgColor || '#eff6ff';
  const showPrices = pc.showPrices !== false;
  const showFastTrack = pc.showFastTrack !== false;
  const showRatings = pc.showRatings || false;

  const fastTrackPkgs = packages.filter(p => p.is_fast_track && p.is_active !== false);
  const regularPkgs = packages.filter(p => !p.is_fast_track && p.is_active !== false);
  const activeServices = services.filter(s => s.is_active !== false);

  const formatDuration = (mins) => {
    if (!mins) return '';
    return mins >= 60 ? `${Math.floor(mins/60)}h${mins%60 ? ` ${mins%60}m` : ''}` : `${mins} min`;
  };

  return (
    <div className="patient-page">
      {/* Auth prompt banner */}
      {!isLoggedIn && (
        <div style={{ background: `linear-gradient(135deg, ${bgColor}, #fff)`, borderBottom: '1px solid #bfdbfe', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <LogIn size={18} color={primaryColor} />
            <span style={{ color: '#1e40af', fontWeight: 600, fontSize: '0.88rem' }}>Register or Log in to Book — it only takes 30 seconds</span>
          </div>
          <button onClick={() => navigate('/book/register')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: primaryColor, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Sign In / Register <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Header — customized with portal config */}
      <header style={{ background: primaryColor, color: '#fff', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {clinic?.logo_url && (
            <img src={clinic.logo_url} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', background: 'rgba(255,255,255,0.2)' }} />
          )}
          <Link to="/" style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', textDecoration: 'none' }}>
            {clinic?.name || 'Clinic'}
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.82rem', opacity: 0.9 }}>
          {clinic?.address && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={12} /> {clinic.address}</span>}
          {clinic?.city && !clinic?.address && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={12} /> {clinic.city}</span>}
          {clinic?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Phone size={12} /> {clinic.phone}</span>}
        </div>
      </header>

      {/* Hero — customized */}
      <div style={{ background: bgColor, padding: '2rem 1.25rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
          {pc.heroMessage || 'What do you need help with?'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          {pc.tagline || 'Book your physiotherapy appointment online.'}
        </p>
      </div>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem 1.25rem' }}>

        {/* Fast-Track Packages */}
        {showFastTrack && fastTrackPkgs.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            {fastTrackPkgs.map(pkg => (
              <div key={pkg.id} style={{ background: `${primaryColor}0a`, border: `1.5px solid ${primaryColor}30`, borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 16px ${primaryColor}20`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: primaryColor }}>⚡ {pkg.name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
                    {pkg.description || `${pkg.session_count} session${pkg.session_count > 1 ? 's' : ''}`}
                    {pkg.discount_percent > 0 && <> · <span style={{ color: '#10b981', fontWeight: 600 }}>{pkg.discount_percent}% off</span></>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  {showPrices && <span style={{ fontWeight: 800, fontSize: '1.05rem', color: primaryColor }}>LKR {Number(pkg.price).toLocaleString()}</span>}
                  <Link to="/book/time" state={{ service: pkg, isFastTrack: true, clinicId: clinic?.id, clinicSlug: clinic?.slug, primaryColor, therapists }}
                    className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.87rem', background: primaryColor, textDecoration: 'none' }}>
                    ⚡ Quick Book <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Services */}
        {activeServices.length > 0 && (
          <>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Services</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {activeServices.map(s => (
                <div key={s.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = primaryColor + '60'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{s.name}</h3>
                      {s.requires_equipment && (
                        <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '0.72rem', fontWeight: 600, padding: '0.1rem 0.5rem', borderRadius: 4, flexShrink: 0 }}>
                          Needs: {s.requires_equipment}
                        </span>
                      )}
                    </div>
                    {s.description && <p style={{ color: '#64748b', margin: '0 0 0.4rem', fontSize: '0.88rem' }}>{s.description}</p>}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {s.duration_minutes && modeBadge(<Clock size={11} />, formatDuration(s.duration_minutes))}
                      {modeBadge(<MapPin size={11} />, 'Clinic')}
                      {modeBadge(<Wifi size={11} />, 'Online')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    {showPrices && s.price > 0 && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>LKR {Number(s.price).toLocaleString()}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>per session</div>
                      </div>
                    )}
                    <Link to="/book/time" state={{ service: s, clinicId: clinic?.id, clinicSlug: clinic?.slug, primaryColor, therapists }}
                      className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.87rem', background: primaryColor, textDecoration: 'none' }}>
                      Book <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Regular Packages */}
        {regularPkgs.length > 0 && (
          <>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Packages</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {regularPkgs.map(p => (
                <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.2rem', color: '#0f172a' }}>{p.name}</h3>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>
                      {p.description || `${p.session_count} session${p.session_count > 1 ? 's' : ''}`}
                      {p.discount_percent > 0 && <> · <span style={{ color: '#10b981', fontWeight: 600 }}>{p.discount_percent}% off</span></>}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    {showPrices && <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>LKR {Number(p.price).toLocaleString()}</span>}
                    <Link to="/book/time" state={{ service: p, clinicId: clinic?.id, clinicSlug: clinic?.slug, primaryColor, therapists }}
                      className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.87rem', background: primaryColor, textDecoration: 'none' }}>
                      Select <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {activeServices.length === 0 && fastTrackPkgs.length === 0 && regularPkgs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>This clinic hasn't published services yet.</p>
            <button onClick={() => navigate('/')} className="btn-ghost">← Browse Other Clinics</button>
          </div>
        )}
      </main>
    </div>
  );
}
