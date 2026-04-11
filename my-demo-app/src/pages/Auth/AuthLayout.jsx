import React from 'react';
import { Activity, Building2, Stethoscope, ShieldCheck } from 'lucide-react';
import '../../styles/auth.css';

const roleConfig = {
  patient: {
    icon: Activity,
    title: 'Patient Portal',
    description: 'Book appointments, view your recovery progress, and stay connected with your therapist seamlessly.',
  },
  clinic: {
    icon: Building2,
    title: 'Clinic Workspace',
    description: 'Manage bookings, staff availability, and set up your custom clinic branding and experience.',
  },
  therapist: {
    icon: Stethoscope,
    title: 'Therapist Dashboard',
    description: 'Manage patient schedules, communicate securely, and build effective recovery programs.',
  },
  superadmin: {
    icon: ShieldCheck,
    title: 'Admin Command',
    description: 'System-wide analytics, comprehensive clinic management, and overall platform control.',
  }
};

export default function AuthLayout({ children, role = 'patient' }) {
  const config = roleConfig[role] || roleConfig.patient;
  const Icon = config.icon;

  return (
    <div className="auth-container">
      <div className={`auth-banner ${role}`}>
        <div className="banner-content">
          <Icon className="banner-icon" />
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
      </div>
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}
