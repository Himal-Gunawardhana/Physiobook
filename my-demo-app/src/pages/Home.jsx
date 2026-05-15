import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Building2, Stethoscope, User, Search, Star, MapPin,
  ArrowRight, CalendarCheck, Zap, CheckCircle, Clock, Globe, Filter,
  ChevronDown, Briefcase, Award, Phone,
} from 'lucide-react';
import api from '../lib/api';

/* ── Particles ─────────────────────────────────────────── */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener('resize', resize);
    const dots = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.4, vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28, a: Math.random() * 0.4 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width; if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height; if (d.y > canvas.height) d.y = 0;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,179,255,${d.a})`; ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
        const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
        if (dist < 100) { ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(99,179,255,${0.08 * (1 - dist / 100)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ── Star Rating ───────────────────────────────────────── */
function Stars({ rating = 0, size = 13 }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
          color={i <= Math.round(rating) ? '#f59e0b' : '#cbd5e1'} />
      ))}
      <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: 4 }}>{Number(rating).toFixed(1)}</span>
    </div>
  );
}

/* ── Section Title ─────────────────────────────────────── */
function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eff6ff', padding: '0.4rem 1rem', borderRadius: 99, fontSize: '0.82rem', fontWeight: 600, color: '#2563eb', marginBottom: '0.75rem' }}>
        <Icon size={14} /> {subtitle}
      </div>
      <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h2>
    </div>
  );
}

/* ── Specializations ───────────────────────────────────── */
const SPECIALIZATIONS = [
  'All', 'Sports Injury', 'Orthopedic', 'Neurological', 'Pediatric',
  'Geriatric', 'Cardiopulmonary', 'Manual Therapy', 'Rehabilitation',
];

/* ── Home ──────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [tab, setTab] = useState('clinics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cData, tData] = await Promise.all([
          api.get('/clinics?limit=50').catch(() => ({ rows: [] })),
          api.get('/clinics/therapists?limit=50').catch(() => ({ rows: [] })),
        ]);
        setClinics(cData?.rows || cData || []);
        setTherapists(tData?.rows || tData || []);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const filteredClinics = (Array.isArray(clinics) ? clinics : []).filter(c => {
    if (search && !c.name?.toLowerCase().includes(search.toLowerCase()) && !c.city?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredTherapists = (Array.isArray(therapists) ? therapists : []).filter(t => {
    if (search && !`${t.first_name} ${t.last_name}`.toLowerCase().includes(search.toLowerCase()) && !t.specialization?.toLowerCase().includes(search.toLowerCase())) return false;
    if (specFilter !== 'All' && !t.specialization?.toLowerCase().includes(specFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e2e8f0', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Nav */}
      <header className="home-nav">
        <div className="home-nav-brand"><Activity size={15} /> PHYSIOBOOK</div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>Browse</button>
          <button onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)', border: 'none', color: '#fff', fontSize: '0.82rem', padding: '0.5rem 1.1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Sign In</button>
        </div>
      </header>

      {/* Hero */}
      <section className="home-hero">
        <Particles />
        <div className="home-orb home-orb-left" />
        <div className="home-orb home-orb-right" />
        <h1 className="home-headline">
          Find Your Perfect{' '}<span className="home-headline-accent">Physiotherapist</span>
        </h1>
        <p className="home-subheadline">
          Browse clinics, compare therapists, check prices and book appointments — all in one place.
        </p>
        <button onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}
          style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg,#2563eb,#3b82f6)', border: 'none', color: '#fff', padding: '0.85rem 2.2rem', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(37,99,235,0.4)', transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}>
          <Search size={16} /> Explore Now <ArrowRight size={14} />
        </button>
      </section>

      {/* Stats Bar */}
      <section style={{ background: 'linear-gradient(135deg,#1e3a5f,#0f172a)', padding: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem,5vw,4rem)', flexWrap: 'wrap', padding: '0 1rem' }}>
          {[
            { n: clinics.length || '0', l: 'Registered Clinics', icon: Building2 },
            { n: therapists.length || '0', l: 'Physiotherapists', icon: Stethoscope },
            { n: '24/7', l: 'Online Booking', icon: Clock },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa' }}>{s.n}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <s.icon size={12} /> {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse Section */}
      <section id="browse" style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(2rem,5vw,4rem) 1rem' }}>
        <SectionTitle icon={Search} title="Browse Clinics & Therapists" subtitle="DISCOVER" />

        {/* Search + Filter Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search clinics, therapists, or specialties..."
              style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 10, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
          {/* Tab toggle */}
          <div style={{ display: 'flex', background: '#1e293b', borderRadius: 10, border: '1px solid #334155', overflow: 'hidden' }}>
            {['clinics', 'therapists'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '0.7rem 1.2rem', background: tab === t ? '#2563eb' : 'transparent', color: tab === t ? '#fff' : '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', textTransform: 'capitalize' }}>
                {t === 'clinics' ? <><Building2 size={13} style={{ marginRight: 4, marginBottom: -2 }} />Clinics</> : <><Stethoscope size={13} style={{ marginRight: 4, marginBottom: -2 }} />Therapists</>}
              </button>
            ))}
          </div>
        </div>

        {/* Specialization filter (therapists tab) */}
        {tab === 'therapists' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {SPECIALIZATIONS.map(s => (
              <button key={s} onClick={() => setSpecFilter(s)}
                style={{ padding: '0.4rem 0.9rem', borderRadius: 99, border: specFilter === s ? '1px solid #3b82f6' : '1px solid #334155', background: specFilter === s ? '#1e3a5f' : '#0f172a', color: specFilter === s ? '#60a5fa' : '#94a3b8', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading...</div>
        ) : tab === 'clinics' ? (
          /* ── Clinics Grid ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
            {filteredClinics.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>No clinics found.</div>
            ) : filteredClinics.map(c => (
              <div key={c.id}
                onClick={() => navigate(`/book?${c.slug}`)}
                style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(37,99,235,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = ''; }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {c.logo_url ? <img src={c.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 size={22} color="rgba(255,255,255,0.8)" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} /> {c.city || 'Location not set'}
                    </div>
                  </div>
                </div>
                {/* Body */}
                <div style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{c.team_count || 0} therapist{c.team_count !== 1 ? 's' : ''}</span>
                    <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: 99, fontWeight: 600 }}>Online</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {c.phone && <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} /> {c.phone}</span>}
                    <span style={{ fontSize: '0.82rem', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Book Now <ArrowRight size={12} /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Therapists Grid ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
            {filteredTherapists.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>No therapists found.</div>
            ) : filteredTherapists.map(t => (
              <div key={t.id}
                onClick={() => navigate(`/book?${t.clinic_slug}`)}
                style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(139,92,246,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#5b21b6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0, overflow: 'hidden' }}>
                    {t.avatar_url ? <img src={t.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <>{t.first_name?.[0]}{t.last_name?.[0]}</>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.first_name} {t.last_name}</div>
                    <Stars rating={t.rating} size={12} />
                  </div>
                </div>
                {t.specialization && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#1e1b4b', color: '#a78bfa', padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>{t.specialization}</span>
                  </div>
                )}
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={11} /> {t.experience_years || 0} yrs exp</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={11} /> {t.clinic_name || 'Clinic'}</span>
                </div>
                {t.clinic_city && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} /> {t.clinic_city}</div>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section style={{ background: '#0f172a', padding: 'clamp(2rem,5vw,3rem) 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionTitle icon={Zap} title="Why Physiobook?" subtitle="FEATURES" />
          <div className="home-features">
            {[
              { Icon: Zap, color: '#f59e0b', title: 'Auto-Assign', desc: 'Best-rated therapist chosen instantly.' },
              { Icon: CalendarCheck, color: '#60a5fa', title: 'Live Slots', desc: 'Real-time availability as bookings arrive.' },
              { Icon: Star, color: '#34d399', title: 'Feedback Loop', desc: 'Patient ratings improve quality.' },
              { Icon: Globe, color: '#c084fc', title: 'Multi-Branch', desc: 'One admin, multiple locations.' },
            ].map(({ Icon, color, title, desc }) => (
              <div key={title} className="home-feature-item">
                <div className="home-feature-icon" style={{ background: `${color}1a` }}><Icon size={15} color={color} /></div>
                <div><div className="home-feature-title">{title}</div><div className="home-feature-desc">{desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section style={{ padding: 'clamp(2rem,5vw,4rem) 1rem', maxWidth: 1100, margin: '0 auto' }}>
        <SectionTitle icon={User} title="Join the Platform" subtitle="GET STARTED" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem' }}>
          {[
            { id: 'clinic', icon: Building2, label: 'Clinic Owner', desc: 'Manage staff, bookings, services & payments.', path: '/register/clinic', gradient: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', glow: 'rgba(37,99,235,0.4)' },
            { id: 'therapist', icon: Stethoscope, label: 'Physiotherapist', desc: 'View schedule, write notes, chat with patients.', path: '/register/therapist', gradient: 'linear-gradient(135deg,#5b21b6,#8b5cf6)', glow: 'rgba(124,58,237,0.4)' },
            { id: 'patient', icon: User, label: 'Patient', desc: 'Browse clinics, pick therapist, book instantly.', path: '/register/patient', gradient: 'linear-gradient(135deg,#047857,#10b981)', glow: 'rgba(5,150,105,0.4)' },
          ].map(r => {
            const Icon = r.icon;
            return (
              <div key={r.id} style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${r.glow}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ background: r.gradient, padding: '1.5rem', textAlign: 'center' }}>
                  <Icon size={32} color="rgba(255,255,255,0.9)" />
                  <h3 style={{ margin: '0.75rem 0 0.25rem', fontSize: '1.15rem', fontWeight: 700 }}>{r.label}</h3>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1rem' }}>{r.desc}</p>
                  <button onClick={() => navigate(r.path)}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 10, border: 'none', background: r.gradient, color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: `0 4px 14px ${r.glow}` }}>
                    Create Account <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Login Section */}
      <section id="login-section" style={{ background: '#0f172a', padding: 'clamp(2rem,5vw,3.5rem) 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <SectionTitle icon={Clock} title="Already have an account?" subtitle="SIGN IN" />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Clinic Admin', path: '/login/clinic', gradient: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', icon: Building2 },
              { label: 'Therapist', path: '/login/therapist', gradient: 'linear-gradient(135deg,#5b21b6,#8b5cf6)', icon: Stethoscope },
              { label: 'Patient', path: '/login/patient', gradient: 'linear-gradient(135deg,#047857,#10b981)', icon: User },
            ].map(b => {
              const Icon = b.icon;
              return (
                <button key={b.label} onClick={() => navigate(b.path)}
                  style={{ background: b.gradient, border: 'none', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'transform 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}>
                  <Icon size={15} /> {b.label} <ArrowRight size={13} />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        Physiobook — Sri Lanka's Modern Physiotherapy Booking Platform
      </footer>
    </div>
  );
}
