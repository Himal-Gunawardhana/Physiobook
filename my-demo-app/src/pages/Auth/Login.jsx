import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Activity, Building2, Stethoscope, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const ROLE_CONFIG = {
  patient:    { label: 'Patient',        Icon: Activity,   color: '#10b981', gradient: 'from-emerald-500 to-teal-600', desc: 'Access your bookings and health records.' },
  clinic:     { label: 'Clinic Owner',   Icon: Building2,  color: '#2563eb', gradient: 'from-blue-500 to-blue-700',    desc: 'Manage your clinic operations and staff.' },
  therapist:  { label: 'Physiotherapist',Icon: Stethoscope,color: '#8b5cf6', gradient: 'from-violet-500 to-purple-700',desc: 'View schedules and patient notes.' },
  superadmin: { label: 'Super Admin',    Icon: ShieldCheck,color: '#f59e0b', gradient: 'from-amber-500 to-orange-600', desc: 'Platform-wide control and analytics.' },
};

const ROLE_DEST = {
  patient: '/book', clinic: '/clinic', therapist: '/therapist', superadmin: '/superadmin'
};

export default function Login() {
  const { role }   = useParams();
  const navigate   = useNavigate();
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

  const cfg  = ROLE_CONFIG[role] || ROLE_CONFIG.patient;
  const dest = ROLE_DEST[role]   || '/';
  const Icon = cfg.Icon;

  const go = (dest) => navigate(dest);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); go(dest); }, 900);
  };

  const bannerColors = {
    patient:    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    clinic:     'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    therapist:  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    superadmin: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Left panel */}
      <div style={{
        flex: 1,
        background: bannerColors[role] || bannerColors.patient,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 60%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Icon size={72} color="rgba(255,255,255,0.9)" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem' }}>
            {cfg.label}
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.88, maxWidth: 360, lineHeight: 1.6 }}>
            {cfg.desc}
          </p>
          <div style={{ marginTop: '2.5rem', padding: '1rem 2rem', background: 'rgba(255,255,255,0.12)', borderRadius: 12, fontSize: '0.88rem' }}>
            Physiobook · Clinic Management Platform
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1,
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
            Welcome back
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            Sign in to your <strong>{cfg.label}</strong> account
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label className="form-label">Email Address</label>
              <input type="email" placeholder="you@example.com" className="form-input" required />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem', background: cfg.color, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in…' : `Sign In as ${cfg.label}`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              or
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            <button
              type="button"
              onClick={() => go(dest)}
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
            >
              Continue as Guest →
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.87rem' }}>
            <Link to={`/register/${role}`} style={{ color: cfg.color, fontWeight: 600 }}>
              Create an account
            </Link>
            <Link to="/" style={{ color: '#64748b' }}>
              ← All Portals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
