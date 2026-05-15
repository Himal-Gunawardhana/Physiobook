import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Building2, Stethoscope, User, Search, Star, MapPin,
  ArrowRight, CalendarCheck, Zap, CheckCircle, Clock, Globe, Phone, Briefcase,
} from 'lucide-react';
import api from '../lib/api';

/* ── Particles (subtle on light bg) ───────────────────── */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener('resize', resize);
    const dots = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.4, vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2, a: Math.random() * 0.25 + 0.05,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width; if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height; if (d.y > canvas.height) d.y = 0;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37,99,235,${d.a})`; ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
        const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
        if (dist < 100) { ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(37,99,235,${0.06 * (1 - dist / 100)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ── Star Rating ───────────────────────────────────────── */
function Stars({ rating = 0, size = 12 }) {
  return (
    <div style={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
          color={i <= Math.round(rating) ? '#f59e0b' : '#d1d5db'} />
      ))}
      <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: 4 }}>{Number(rating).toFixed(1)}</span>
    </div>
  );
}

/* ── Specializations ───────────────────────────────────── */
const SPECS = ['All', 'Sports Injury', 'Orthopedic', 'Neurological', 'Pediatric', 'Geriatric', 'Cardiopulmonary', 'Manual Therapy', 'Rehabilitation'];

/* ── Role cards data (original design) ─────────────────── */
const ROLES = [
  { id: 'clinic', icon: Building2, label: 'Clinic Owner', tagline: 'Run your clinic smarter',
    desc: 'Manage staff, bookings, services, payments and multi-branch operations.',
    loginPath: '/login/clinic', registerPath: '/register/clinic',
    gradient: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', glow: 'rgba(37,99,235,0.5)',
    features: ['Staff scheduling', 'Payment tracking', 'Service management'] },
  { id: 'therapist', icon: Stethoscope, label: 'Physiotherapist', tagline: 'Focus on healing, not paperwork',
    desc: 'View your schedule, write SOAP notes, and chat with patients.',
    loginPath: '/login/therapist', registerPath: '/register/therapist',
    gradient: 'linear-gradient(135deg,#5b21b6,#8b5cf6)', glow: 'rgba(124,58,237,0.5)',
    features: ['Daily schedule view', 'SOAP clinical notes', 'Patient messaging'] },
  { id: 'patient', icon: User, label: 'Patient', tagline: 'Book in minutes, not days',
    desc: 'Browse clinics, pick a therapist, choose a slot and confirm instantly.',
    loginPath: '/login/patient', registerPath: '/register/patient', primaryAction: '/book',
    gradient: 'linear-gradient(135deg,#047857,#10b981)', glow: 'rgba(5,150,105,0.5)',
    features: ['Browse clinics', 'Auto-assign therapist', 'Track appointments'] },
];

const FEATURES = [
  { Icon: Zap, color: '#f59e0b', title: 'Auto-Assign', desc: 'Best-rated therapist chosen instantly.' },
  { Icon: CalendarCheck, color: '#3b82f6', title: 'Live Slots', desc: 'Real-time availability as bookings arrive.' },
  { Icon: Star, color: '#10b981', title: 'Feedback Loop', desc: 'Patient ratings improve quality.' },
  { Icon: Globe, color: '#8b5cf6', title: 'Multi-Branch', desc: 'One admin, multiple locations.' },
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
    (async () => {
      setLoading(true);
      try {
        const [c, t] = await Promise.all([
          api.get('/clinics?limit=50').catch(() => ({ rows: [] })),
          api.get('/clinics/therapists?limit=50').catch(() => ({ rows: [] })),
        ]);
        setClinics(c?.rows || c || []);
        setTherapists(t?.rows || t || []);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const fClinics = (Array.isArray(clinics) ? clinics : []).filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase())
  );
  const fTherapists = (Array.isArray(therapists) ? therapists : []).filter(t => {
    const name = `${t.first_name} ${t.last_name}`.toLowerCase();
    if (search && !name.includes(search.toLowerCase()) && !t.specialization?.toLowerCase().includes(search.toLowerCase())) return false;
    if (specFilter !== 'All' && !t.specialization?.toLowerCase().includes(specFilter.toLowerCase())) return false;
    return true;
  });

  const S = { page: { minHeight: '100vh', background: '#fff', color: '#0f172a', fontFamily: "'Inter','Segoe UI',sans-serif" } };

  return (
    <div style={S.page}>

      {/* ─── Nav ─── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e7eb', padding: '0 clamp(1rem,3vw,2rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.88rem', color: '#1e40af', letterSpacing: '0.04em' }}>
          <Activity size={16} /> PHYSIOBOOK
        </div>
        <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500, padding: '0.4rem 0.8rem', borderRadius: 6 }}>
            Browse
          </button>
          <button onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: '#2563eb', border: 'none', color: '#fff', fontSize: '0.82rem', padding: '0.5rem 1.1rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Get Started
          </button>
        </nav>
      </header>

      {/* ─── Hero ─── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg,#eff6ff 0%,#ffffff 100%)', padding: 'clamp(3rem,8vw,5rem) 1rem clamp(2rem,5vw,3.5rem)', textAlign: 'center' }}>
        <Particles />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 1rem', color: '#0f172a' }}>
            Find Your Perfect{' '}<span style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Physiotherapist</span>
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem,2vw,1.15rem)', color: '#64748b', maxWidth: 520, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Browse clinics, compare therapists, check prices and book appointments — all in one place.
          </p>
          <button onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)', border: 'none', color: '#fff', padding: '0.85rem 2rem', borderRadius: 12, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 6px 24px rgba(37,99,235,0.3)', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}>
            <Search size={16} /> Explore Clinics & Therapists <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section style={{ background: '#f8fafc', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '1.25rem 1rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 'clamp(2rem,6vw,5rem)', flexWrap: 'wrap' }}>
          {[
            { n: clinics.length || '—', l: 'Clinics', icon: Building2, c: '#2563eb' },
            { n: therapists.length || '—', l: 'Therapists', icon: Stethoscope, c: '#7c3aed' },
            { n: '24/7', l: 'Online Booking', icon: Clock, c: '#059669' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c }}>{s.n}</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <s.icon size={12} /> {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Browse Section ─── */}
      <section id="browse" style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(2rem,5vw,3.5rem) 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', padding: '0.35rem 0.9rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, color: '#2563eb', marginBottom: '0.6rem' }}>
            <Search size={12} /> DISCOVER
          </span>
          <h2 style={{ fontSize: 'clamp(1.3rem,3vw,1.75rem)', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0 0' }}>Browse Clinics & Therapists</h2>
        </div>

        {/* Search + Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clinics, therapists or specialties..."
              style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.3rem', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', color: '#0f172a', fontSize: '0.88rem', outline: 'none', transition: 'border 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
          </div>
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {['clinics', 'therapists'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '0.65rem 1.2rem', background: tab === t ? '#2563eb' : 'transparent', color: tab === t ? '#fff' : '#64748b', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5 }}>
                {t === 'clinics' ? <><Building2 size={13} />Clinics</> : <><Stethoscope size={13} />Therapists</>}
              </button>
            ))}
          </div>
        </div>

        {/* Spec filter chips */}
        {tab === 'therapists' && (
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {SPECS.map(s => (
              <button key={s} onClick={() => setSpecFilter(s)}
                style={{ padding: '0.35rem 0.85rem', borderRadius: 99, border: `1px solid ${specFilter === s ? '#3b82f6' : '#e2e8f0'}`, background: specFilter === s ? '#eff6ff' : '#fff', color: specFilter === s ? '#2563eb' : '#64748b', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Loading...</div>
        ) : tab === 'clinics' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
            {fClinics.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No clinics found.</div>
            ) : fClinics.map(c => (
              <div key={c.id} onClick={() => navigate(`/book?${c.slug}`)}
                style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(37,99,235,0.1)'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                <div style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 10, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {c.logo_url ? <img src={c.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 size={20} color="rgba(255,255,255,0.85)" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{c.name}</div>
                    {c.city && <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> {c.city}</div>}
                  </div>
                </div>
                <div style={{ padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#6b7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Stethoscope size={11} /> {c.team_count || 0} therapists</span>
                    {c.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Phone size={11} /> {c.phone}</span>}
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>Book <ArrowRight size={12} /></span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: '1rem' }}>
            {fTherapists.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No therapists found.</div>
            ) : fTherapists.map(t => (
              <div key={t.id} onClick={() => navigate(`/book?${t.clinic_slug}`)}
                style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1.1rem', cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor = '#c4b5fd'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0, overflow: 'hidden' }}>
                    {t.avatar_url ? <img src={t.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <>{t.first_name?.[0]}{t.last_name?.[0]}</>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>{t.first_name} {t.last_name}</div>
                    <Stars rating={t.rating} />
                  </div>
                </div>
                {t.specialization && (
                  <span style={{ display: 'inline-block', background: '#f5f3ff', color: '#6d28d9', padding: '0.18rem 0.6rem', borderRadius: 99, fontSize: '0.73rem', fontWeight: 600, marginBottom: '0.45rem' }}>{t.specialization}</span>
                )}
                <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Briefcase size={11} /> {t.experience_years || 0} yrs</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Building2 size={11} /> {t.clinic_name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Features ─── */}
      <section style={{ background: '#f8fafc', borderTop: '1px solid #e5e7eb', padding: 'clamp(2rem,5vw,3rem) 1rem' }}>
        <div className="home-features" style={{ maxWidth: 900, margin: '0 auto' }}>
          {FEATURES.map(({ Icon, color, title, desc }) => (
            <div key={title} className="home-feature-item">
              <div className="home-feature-icon" style={{ background: `${color}15` }}><Icon size={15} color={color} /></div>
              <div><div className="home-feature-title">{title}</div><div className="home-feature-desc">{desc}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Role Cards (original design) ─── */}
      <section id="roles" className="home-cards-section" style={{ background: '#0a0e1a' }}>
        <p className="home-cards-label">Choose your role</p>
        <div className="home-cards-grid">
          {ROLES.map(r => <RoleCard key={r.id} role={r} navigate={navigate} />)}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="home-footer">
        Physiobook — Sri Lanka's Modern Physiotherapy Booking Platform
      </footer>
    </div>
  );
}

/* ── Role Card (original design) ───────────────────────── */
function RoleCard({ role, navigate }) {
  const Icon = role.icon;
  return (
    <div className="role-card"
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${role.glow}`; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}>
      <div className="role-card-header" style={{ background: role.gradient }}>
        <div className="role-card-top">
          <div className="role-card-icon"><Icon size={20} color="#fff" /></div>
          <span className="role-card-badge">{role.id}</span>
        </div>
        <h2 className="role-card-title">{role.label}</h2>
        <p className="role-card-tagline">{role.tagline}</p>
      </div>
      <div className="role-card-body">
        <p className="role-card-desc">{role.desc}</p>
        <ul className="role-card-features">
          {role.features.map(f => (
            <li key={f}><CheckCircle size={11} color="#34d399" style={{ flexShrink: 0 }} />{f}</li>
          ))}
        </ul>
        <div className="role-card-actions">
          <button className="role-btn-primary"
            style={{ background: role.gradient, boxShadow: `0 4px 14px ${role.glow}` }}
            onClick={() => navigate(role.loginPath)}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; }}>
            {role.id === 'patient'
              ? <><User size={13} /> Sign In / Browse Clinics</>
              : <><Clock size={13} /> Sign In to Dashboard <ArrowRight size={12} /></>}
          </button>
          <button className="role-btn-ghost"
            onClick={() => navigate(role.primaryAction || role.registerPath)}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}>
            {role.id === 'patient' ? 'Create Account & Book →' : 'Create New Account →'}
          </button>
        </div>
      </div>
    </div>
  );
}
