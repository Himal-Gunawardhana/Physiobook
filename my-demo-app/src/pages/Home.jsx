import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Building2, Stethoscope, User,
  ArrowRight, CalendarCheck, Star, ShieldCheck,
  Zap, CheckCircle, Clock, Globe,
} from 'lucide-react';

/* ── Animated particle dots ─────────────────────────────── */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const dots = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.5,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      a: Math.random() * 0.55 + 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,179,255,${d.a})`;
        ctx.fill();
      });
      // draw connecting lines
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(99,179,255,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ── Role card config ────────────────────────────────────── */
const ROLES = [
  {
    id: 'clinic',
    icon: Building2,
    label: 'Clinic Owner',
    tagline: 'Run your clinic smarter',
    desc: 'Manage staff, bookings, services, payments and multi-branch operations from a single dashboard.',
    loginPath: '/login/clinic',
    registerPath: '/register/clinic',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
    glow: 'rgba(37,99,235,0.45)',
    accentDark: '#1e40af',
    features: ['Staff scheduling', 'Payment tracking', 'Service management'],
  },
  {
    id: 'therapist',
    icon: Stethoscope,
    label: 'Physiotherapist',
    tagline: 'Focus on healing, not paperwork',
    desc: 'View your daily schedule, write SOAP session notes, and communicate with patients in one place.',
    loginPath: '/login/therapist',
    registerPath: '/register/therapist',
    gradient: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #8b5cf6 100%)',
    glow: 'rgba(124,58,237,0.45)',
    accentDark: '#4c1d95',
    features: ['Daily schedule view', 'Clinical notes (SOAP)', 'Patient messaging'],
  },
  {
    id: 'patient',
    icon: User,
    label: 'Patient',
    tagline: 'Book in minutes, not days',
    desc: 'Browse clinics, choose your therapist, pick a time slot, and book your physio session instantly.',
    loginPath: '/login/patient',
    registerPath: '/register/patient',
    primaryAction: '/book',
    gradient: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
    glow: 'rgba(5,150,105,0.45)',
    accentDark: '#065f46',
    features: ['Browse clinics', 'Auto-assign therapist', 'Track appointments'],
  },
];

const STATS = [
  { value: '3 Roles', label: 'Role-based access' },
  { value: '< 2 min', label: 'Average booking time' },
  { value: '100%', label: 'CORS-free production' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #060b18 0%, #0d1f45 40%, #0c1a38 70%, #060b18 100%)', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>

      {/* ── Admin pill (top right) ── */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
        <button
          onClick={() => navigate('/superadmin')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, color: '#fbbf24', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; }}
        >
          <ShieldCheck size={13} /> Admin
        </button>
      </div>

      {/* ── Hero section ── */}
      <section style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem 3rem', overflow: 'hidden' }}>
        <Particles />

        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Brand badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '0.45rem 1.1rem', color: '#93c5fd', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '2rem', backdropFilter: 'blur(8px)' }}>
          <Activity size={13} />
          PHYSIOBOOK &nbsp;·&nbsp; v2.0 Live
        </div>

        {/* Headline */}
        <h1 style={{ margin: '0 0 1.25rem', fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, textAlign: 'center', maxWidth: 820, letterSpacing: '-0.02em' }}>
          Modern Physiotherapy{' '}
          <span style={{ background: 'linear-gradient(90deg, #60a5fa 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Booking Platform
          </span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', lineHeight: 1.7, textAlign: 'center', maxWidth: 580, margin: '0 0 3rem' }}>
          Replace WhatsApp chaos with a professional, end-to-end system for clinics, therapists, and patients.
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.1rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll cue */}
        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.8rem' }}>
          <span>Choose your role below</span>
          <div style={{ width: 1.5, height: 36, background: 'linear-gradient(to bottom, #475569, transparent)' }} />
        </div>
      </section>

      {/* ── Role Cards ── */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 5vw, 2rem)', maxWidth: 1280, margin: '0 auto' }}>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '2.5rem' }}>
          Sign in or register as
        </p>

        {/* 3-column card grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(1rem, 3vw, 1.75rem)' }}>
          {ROLES.map(role => <RoleCard key={role.id} role={role} navigate={navigate} />)}
        </div>
      </section>

      {/* ── Feature strip ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '3rem 1.5rem', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {[
            { Icon: Zap,          color: '#f59e0b', title: 'Smart Auto-Assign',    desc: 'Best-rated available therapist chosen automatically.' },
            { Icon: CalendarCheck, color: '#60a5fa', title: 'Real-time Slots',      desc: 'Live availability updated as bookings come in.' },
            { Icon: Star,          color: '#34d399', title: 'Session Feedback',     desc: 'Patient ratings help improve service quality.' },
            { Icon: Globe,         color: '#c084fc', title: 'Multi-Branch Support', desc: 'One admin, multiple clinic locations.' },
          ].map(({ Icon, color, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{title}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer note ── */}
      <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: '#334155', fontSize: '0.77rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        Physiobook — Demo platform · No real payments or medical advice · &nbsp;
        <button onClick={() => navigate('/superadmin')} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.77rem', textDecoration: 'underline' }}>
          Admin access
        </button>
      </div>
    </div>
  );
}

/* ── Role Card component ─────────────────────────────────── */
function RoleCard({ role, navigate }) {
  const Icon = role.icon;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = `0 24px 60px ${role.glow}`;
        e.currentTarget.style.border = `1px solid rgba(255,255,255,0.15)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
      }}
    >
      {/* Gradient header */}
      <div style={{ background: role.gradient, padding: '2.25rem 2rem 2rem', position: 'relative', overflow: 'hidden' }}>
        {/* Sheen */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          {/* Icon */}
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={28} color="#fff" />
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(255,255,255,0.12)', padding: '0.25rem 0.7rem', borderRadius: 20 }}>
            {role.id}
          </span>
        </div>

        <h2 style={{ margin: '1.25rem 0 0.35rem', fontSize: 'clamp(1.3rem, 3vw, 1.65rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, position: 'relative', zIndex: 1 }}>
          {role.label}
        </h2>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
          {role.tagline}
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: '1.75rem 2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.65 }}>
          {role.desc}
        </p>

        {/* Feature list */}
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {role.features.map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#cbd5e1', fontSize: '0.83rem' }}>
              <CheckCircle size={14} color="#34d399" style={{ flexShrink: 0 }} /> {f}
            </li>
          ))}
        </ul>

        {/* CTA buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {/* Primary: login */}
          <button
            onClick={() => navigate(role.loginPath)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', background: role.gradient, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', boxShadow: `0 4px 20px ${role.glow}`, transition: 'filter 0.2s', letterSpacing: '-0.01em' }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            {role.id === 'patient' ? (
              <><User size={16} /> Sign In / Browse Clinics</>
            ) : (
              <><Clock size={16} /> Sign In to Dashboard <ArrowRight size={15} /></>
            )}
          </button>

          {/* Secondary: register */}
          <button
            onClick={() => navigate(role.primaryAction || role.registerPath)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            {role.id === 'patient' ? 'Create Account & Book →' : 'Create New Account →'}
          </button>
        </div>
      </div>
    </div>
  );
}
