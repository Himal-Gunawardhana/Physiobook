import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Wifi, LogIn } from 'lucide-react';

const services = [
  { id: 1, name: 'Initial Assessment',               desc: 'Comprehensive 45-min evaluation by a specialist.', price: 3500, dur: '45 min', equipment: 'None' },
  { id: 2, name: 'Short Wave Diathermy Therapy',       desc: 'Deep heat treatment for chronic pain relief.',       price: 2800, dur: '30 min', equipment: 'Short Wave Diathermy Unit' },
  { id: 3, name: 'Rehabilitation Exercise Programme',  desc: 'Guided exercise plan to rebuild strength.',          price: 3000, dur: '60 min', equipment: 'None' },
  { id: 4, name: 'Chest Physiotherapy & Drainage',     desc: 'Airway clearance therapy with postural drainage.',   price: 4000, dur: '60 min', equipment: 'Suctioning Machine' },
  { id: 5, name: 'Pre-Natal Exercises',                desc: 'Safe pregnancy exercise program.',                   price: 2500, dur: '45 min', equipment: 'None' },
  { id: 6, name: 'Post-Natal Recovery',               desc: 'Postpartum rehabilitation and core recovery.',        price: 2500, dur: '45 min', equipment: 'None' },
  { id: 7, name: 'Follow-up Session',                  desc: 'Standard 30-min progress check & treatment.',        price: 2200, dur: '30 min', equipment: 'None' },
];

const packages = [
  { id: 101, name: '⚡ Fast-Track Walk-in',    desc: 'Express booking — pick a time, we handle the rest.',    price: 2200, fast: true },
  { id: 102, name: 'Post-Natal Full Recovery', desc: '10 sessions with 15% long-term discount applied.',      price: 21250, fast: false },
];

const modeBadge = (icon, label) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
    {icon} {label}
  </span>
);

export default function ClinicLanding() {
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem('pb_patient');

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

        <Link to="/" className="patient-header-logo">Elite Physio Center</Link>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> Colombo 07</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={13} /> Mon – Sat, 9am – 5pm</span>
        </div>
      </header>

      <main className="patient-main">
        {/* Hero */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
            What do you need help with?
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Select a service below to choose your time slot, therapist, and visit mode.
          </p>
        </div>

        {/* Services */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '3rem' }}>
          {services.map(s => (
            <div key={s.id} className="service-card">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{s.name}</h3>
                  {s.equipment !== 'None' && (
                    <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '0.72rem', fontWeight: 600, padding: '0.1rem 0.5rem', borderRadius: 4, flexShrink: 0 }}>
                      Needs: {s.equipment}
                    </span>
                  )}
                </div>
                <p style={{ color: '#64748b', margin: '0 0 0.5rem', fontSize: '0.88rem' }}>{s.desc}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {modeBadge(<Clock size={11}/>, s.dur)}
                  {modeBadge(<MapPin size={11}/>, 'Clinic')}
                  {modeBadge(<Wifi size={11}/>, 'Online')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>LKR {s.price.toLocaleString()}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>per session</div>
                </div>
                <Link to="/book/time" state={{ service: s }} className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.87rem' }}>
                  Book <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Express Packages */}
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.35rem' }}>Express & Long-Term Packages</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Curated packages offered by the clinic, including simplified Fast-Track bookings.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {packages.map(p => (
            <div key={p.id} className="service-card" style={{ background: p.fast ? 'linear-gradient(to right, #f0f9ff, #fff)' : 'white', borderColor: p.fast ? '#bae6fd' : '#e2e8f0' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.3rem', color: p.fast ? '#0369a1' : '#0f172a' }}>{p.name}</h3>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>{p.desc}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: p.fast ? '#0369a1' : '#0f172a' }}>LKR {p.price.toLocaleString()}</div>
                </div>
                <Link
                  to="/book/time"
                  state={{ service: p, isFastTrack: p.fast }}
                  className="btn-primary"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.87rem', background: p.fast ? '#0284c7' : '#2563eb' }}
                >
                  {p.fast ? '⚡ Quick Book' : 'Select'} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
