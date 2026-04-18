import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Building2, Stethoscope, ShieldCheck, ArrowRight, CalendarCheck, Star, Globe, ChevronRight } from 'lucide-react';
import '../styles/global.css';

const portals = [
  { to: '/clinic',       cls: 'clinic-card',     Icon: Building2,   title: 'Clinic Owner',       desc: 'Manage staff, services, payments, and multi-branch operations.', cta: 'Manage Clinic' },
  { to: '/therapist',    cls: 'therapist-card',   Icon: Stethoscope, title: 'Physiotherapist',    desc: 'View schedule, add session notes, and chat with patients.', cta: 'View Schedule' },
  { to: '/superadmin',   cls: 'superadmin-card',  Icon: ShieldCheck, title: 'Super Admin',        desc: 'System analytics, clinic onboarding, tickets & subscriptions.', cta: 'System Overview' },
];

const FEATURES = [
  { icon: <CalendarCheck size={22} color="#2563eb" />, title: 'Smart Booking', desc: 'Auto-assign therapists based on availability and rating' },
  { icon: <Star size={22} color="#f59e0b" />, title: 'Patient Feedback', desc: 'Rate clinics and therapists after every session' },
  { icon: <Globe size={22} color="#10b981" />, title: 'Custom Portals', desc: 'Every clinic gets a branded public booking page' },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-container" style={{ padding: 0, minHeight: '100vh', background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #0f172a 100%)' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem 2rem', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '0.4rem 1rem', color: '#93c5fd', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.12)' }}>
          <Activity size={13} /> Physiobook by ITSELF
        </div>
        <h1 style={{ margin: '0 0 1rem', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: '#ffffff', lineHeight: 1.15 }}>
          Modern Physiotherapy<br />
          <span style={{ background: 'linear-gradient(90deg, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Booking Platform</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.7, margin: '0 0 2rem' }}>
          Replace WhatsApp bookings with a professional, end-to-end system.<br />
          Book, manage, and grow — all in one place.
        </p>

        {/* Primary CTA — "Visit Clinic Website / Click on Book" (Before us moment) */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            id="btn-book-now"
            onClick={() => navigate('/book')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 2rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
          >
            Book Your Session <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/book/my-bookings')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 2rem', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
          >
            <CalendarCheck size={18} /> My Bookings
          </button>
        </div>
      </div>

      {/* Feature pills */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', padding: '0 1rem 2.5rem', flexWrap: 'wrap' }}>
        {FEATURES.map(f => (
          <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '0.9rem 1.25rem', maxWidth: 240 }}>
            {f.icon}
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.88rem' }}>{f.title}</div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.1rem' }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Role portals */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem 1.5rem 1.5rem' }}>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '1.25rem' }}>Portal Access</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', maxWidth: 860, margin: '0 auto' }}>
          {portals.map(({ to, cls, Icon, title, desc, cta }) => (
            <Link key={to} to={to} className={`portal-card ${cls}`}>
              <Icon className="portal-icon" />
              <div>
                <h2>{title}</h2>
                <p>{desc}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#60a5fa', fontSize: '0.87rem', fontWeight: 600, marginTop: 'auto' }}>
                {cta} <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
        <p style={{ color: '#334155', fontSize: '0.8rem', textAlign: 'center', marginTop: '2rem' }}>
          Demo platform — all data is simulated. No real payments or medical advice.
        </p>
      </div>
    </div>
  );
}
