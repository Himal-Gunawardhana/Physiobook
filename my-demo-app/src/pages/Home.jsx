import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Building2, Stethoscope, User,
  ArrowRight, CalendarCheck, Star,
  Zap, CheckCircle, Clock, Globe,
} from 'lucide-react';

/* ── Particles ─────────────────────────────────────────── */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const dots = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      a: Math.random() * 0.4 + 0.1,
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
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(99,179,255,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

/* ── Data ──────────────────────────────────────────────── */
const ROLES = [
  {
    id: 'clinic', icon: Building2, label: 'Clinic Owner',
    tagline: 'Run your clinic smarter',
    desc: 'Manage staff, bookings, services, payments and multi-branch operations.',
    loginPath: '/login/clinic', registerPath: '/register/clinic',
    gradient: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
    glow: 'rgba(37,99,235,0.5)',
    features: ['Staff scheduling', 'Payment tracking', 'Service management'],
  },
  {
    id: 'therapist', icon: Stethoscope, label: 'Physiotherapist',
    tagline: 'Focus on healing, not paperwork',
    desc: 'View your schedule, write SOAP notes, and chat with patients.',
    loginPath: '/login/therapist', registerPath: '/register/therapist',
    gradient: 'linear-gradient(135deg,#5b21b6,#8b5cf6)',
    glow: 'rgba(124,58,237,0.5)',
    features: ['Daily schedule view', 'SOAP clinical notes', 'Patient messaging'],
  },
  {
    id: 'patient', icon: User, label: 'Patient',
    tagline: 'Book in minutes, not days',
    desc: 'Browse clinics, pick a therapist, choose a slot and confirm instantly.',
    loginPath: '/login/patient', registerPath: '/register/patient',
    primaryAction: '/book',
    gradient: 'linear-gradient(135deg,#047857,#10b981)',
    glow: 'rgba(5,150,105,0.5)',
    features: ['Browse clinics', 'Auto-assign therapist', 'Track appointments'],
  },
];

const FEATURES = [
  { Icon: Zap,           color: '#f59e0b', title: 'Auto-Assign',      desc: 'Best-rated therapist chosen instantly.' },
  { Icon: CalendarCheck, color: '#60a5fa', title: 'Live Slots',       desc: 'Real-time availability as bookings arrive.' },
  { Icon: Star,          color: '#34d399', title: 'Feedback Loop',    desc: 'Patient ratings improve quality.' },
  { Icon: Globe,         color: '#c084fc', title: 'Multi-Branch',     desc: 'One admin, multiple locations.' },
];

/* ── Home page ─────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-root">

      {/* Nav */}
      <header className="home-nav">
        <div className="home-nav-brand">
          <Activity size={15} />
          PHYSIOBOOK · v2.0
        </div>
      </header>

      {/* Hero */}
      <section className="home-hero">
        <Particles />
        <div className="home-orb home-orb-left" />
        <div className="home-orb home-orb-right" />

        <h1 className="home-headline">
          Modern Physiotherapy{' '}
          <span className="home-headline-accent">Booking Platform</span>
        </h1>
        <p className="home-subheadline">
          Replace WhatsApp chaos with a professional, end-to-end system for clinics, therapists &amp; patients.
        </p>
      </section>

      {/* Role Cards */}
      <section className="home-cards-section">
        <p className="home-cards-label">Choose your role</p>
        <div className="home-cards-grid">
          {ROLES.map(r => <RoleCard key={r.id} role={r} navigate={navigate} />)}
        </div>
      </section>

      {/* Feature strip */}
      <section className="home-features">
        {FEATURES.map(({ Icon, color, title, desc }) => (
          <div key={title} className="home-feature-item">
            <div className="home-feature-icon" style={{ background: `${color}1a` }}>
              <Icon size={15} color={color} />
            </div>
            <div>
              <div className="home-feature-title">{title}</div>
              <div className="home-feature-desc">{desc}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="home-footer">
        Physiobook — Demo platform · No real payments or medical advice
      </footer>
    </div>
  );
}

/* ── Role Card ─────────────────────────────────────────── */
function RoleCard({ role, navigate }) {
  const Icon = role.icon;
  return (
    <div
      className="role-card"
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = `0 20px 50px ${role.glow}`;
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
      }}
    >
      {/* Header */}
      <div className="role-card-header" style={{ background: role.gradient }}>
        <div className="role-card-top">
          <div className="role-card-icon"><Icon size={20} color="#fff" /></div>
          <span className="role-card-badge">{role.id}</span>
        </div>
        <h2 className="role-card-title">{role.label}</h2>
        <p className="role-card-tagline">{role.tagline}</p>
      </div>

      {/* Body */}
      <div className="role-card-body">
        <p className="role-card-desc">{role.desc}</p>
        <ul className="role-card-features">
          {role.features.map(f => (
            <li key={f}>
              <CheckCircle size={11} color="#34d399" style={{ flexShrink: 0 }} />
              {f}
            </li>
          ))}
        </ul>
        <div className="role-card-actions">
          <button
            className="role-btn-primary"
            style={{ background: role.gradient, boxShadow: `0 4px 14px ${role.glow}` }}
            onClick={() => navigate(role.loginPath)}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
          >
            {role.id === 'patient'
              ? <><User size={13} /> Sign In / Browse Clinics</>
              : <><Clock size={13} /> Sign In to Dashboard <ArrowRight size={12} /></>}
          </button>
          <button
            className="role-btn-ghost"
            onClick={() => navigate(role.primaryAction || role.registerPath)}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}
          >
            {role.id === 'patient' ? 'Create Account & Book →' : 'Create New Account →'}
          </button>
        </div>
      </div>
    </div>
  );
}
