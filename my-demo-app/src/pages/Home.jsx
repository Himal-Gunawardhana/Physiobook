import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Building2, Stethoscope, ShieldCheck, ArrowRight } from 'lucide-react';
import '../styles/global.css';

const portals = [
  {
    to: '/login/patient',
    cls: 'patient-card',
    Icon: Activity,
    title: 'Patient Portal',
    desc: 'Book appointments, track recovery, and communicate with your physiotherapist.',
    cta: 'Book Appointment',
  },
  {
    to: '/login/clinic',
    cls: 'clinic-card',
    Icon: Building2,
    title: 'Clinic Owner',
    desc: 'Manage staff, availability, services, packages, and multi-branch operations.',
    cta: 'Manage Clinic',
  },
  {
    to: '/login/therapist',
    cls: 'therapist-card',
    Icon: Stethoscope,
    title: 'Physiotherapist',
    desc: 'View your schedule, chat with patients, and manage your clinical notes.',
    cta: 'View Schedule',
  },
  {
    to: '/login/superadmin',
    cls: 'superadmin-card',
    Icon: ShieldCheck,
    title: 'Super Admin',
    desc: 'System-wide analytics, clinic onboarding, and platform management.',
    cta: 'System Overview',
  },
];

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Activity size={32} color="#60a5fa" />
        </div>
        <h1 className="home-title">Physiobook</h1>
        <p className="home-subtitle">
          All-in-one clinic management & patient booking platform. Select a portal to get started.
        </p>

        <div className="portal-grid">
          {portals.map(({ to, cls, Icon, title, desc, cta }) => (
            <Link key={to} to={to} className={`portal-card ${cls}`}>
              <Icon className="portal-icon" />
              <div>
                <h2>{title}</h2>
                <p>{desc}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#60a5fa', fontSize: '0.87rem', fontWeight: 600, marginTop: 'auto' }}>
                {cta} <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>

        <p style={{ color: '#475569', fontSize: '0.82rem', marginTop: '2.5rem' }}>
          Demo platform — all data is simulated. No real payments or medical advice.
        </p>
      </div>
    </div>
  );
}
