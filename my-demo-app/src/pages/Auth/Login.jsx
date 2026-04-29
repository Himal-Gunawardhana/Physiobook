import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Activity, Building2, Stethoscope, ShieldCheck, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import { useAuth, ROLE_ROUTES } from '../../context/AuthContext';

const ROLE_CONFIG = {
  patient:    { label: 'Patient',         Icon: Activity,    color: '#10b981', backendRole: 'patient',      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', desc: 'Access your bookings and health records.' },
  clinic:     { label: 'Clinic Admin',    Icon: Building2,   color: '#2563eb', backendRole: 'clinic_admin', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', desc: 'Manage your clinic operations and staff.' },
  therapist:  { label: 'Physiotherapist', Icon: Stethoscope, color: '#8b5cf6', backendRole: 'therapist',    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', desc: 'View schedules and patient notes.' },
  superadmin: { label: 'Super Admin',     Icon: ShieldCheck, color: '#f59e0b', backendRole: 'super_admin',  gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', desc: 'Platform-wide control and analytics.' },
};

export default function Login() {
  const { role }    = useParams();
  const navigate    = useNavigate();
  const { login }   = useAuth();

  const cfg  = ROLE_CONFIG[role] || ROLE_CONFIG.patient;
  const Icon = cfg.Icon;

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  // 2FA state
  const [needs2FA,      setNeeds2FA]      = useState(false);
  const [partialToken,  setPartialToken]  = useState('');
  const [otpCode,       setOtpCode]       = useState('');
  const { verify2fa } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);

      if (result.requiresTwoFa) {
        setPartialToken(result.partialToken);
        setNeeds2FA(true);
        setLoading(false);
        return;
      }

      // Redirect based on actual role from backend
      const dest = ROLE_ROUTES[result.user?.role] ?? '/';
      navigate(dest);
    } catch (err) {
      setError(err?.error?.message || err?.message || 'Login failed. Check your credentials.');
      setLoading(false);
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await verify2fa(partialToken, otpCode);
      const dest = ROLE_ROUTES[result.user?.role] ?? '/';
      navigate(dest);
    } catch (err) {
      setError(err?.error?.message || err?.message || 'Invalid code. Try again.');
      setLoading(false);
    }
  };

  // Guest shortcut — navigate to the portal without auth
  const guestDest = ROLE_ROUTES[cfg.backendRole] ?? '/';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Left panel */}
      <div style={{ flex: 1, background: cfg.gradient, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Icon size={72} color="rgba(255,255,255,0.9)" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem' }}>{cfg.label}</h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.88, maxWidth: 360, lineHeight: 1.6 }}>{cfg.desc}</p>
          <div style={{ marginTop: '2.5rem', padding: '1rem 2rem', background: 'rgba(255,255,255,0.12)', borderRadius: 12, fontSize: '0.88rem' }}>
            Physiobook · Clinic Management Platform
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {needs2FA ? (
            /* ── 2FA Screen ── */
            <>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Two-Factor Auth</h2>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>Enter the 6-digit code from your authenticator app.</p>
              <form onSubmit={handle2FA} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  placeholder="000000" value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="form-input" style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.4em' }}
                  autoFocus required
                />
                {error && <ErrorBox msg={error} />}
                <SubmitBtn loading={loading} label="Verify Code" color={cfg.color} />
              </form>
            </>
          ) : (
            /* ── Login Screen ── */
            <>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Welcome back</h2>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>Sign in to your <strong>{cfg.label}</strong> account</p>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label className="form-label">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPwd ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" className="form-input" style={{ paddingRight: '2.5rem' }} required />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && <ErrorBox msg={error} />}

                <SubmitBtn loading={loading} label={`Sign In as ${cfg.label}`} color={cfg.color} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} /> or
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                </div>

                <button type="button" onClick={() => navigate(guestDest)} className="btn-ghost"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                  Continue as Guest →
                </button>
              </form>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.87rem' }}>
                <Link to={`/register/${role}`} style={{ color: cfg.color, fontWeight: 600 }}>Create an account</Link>
                <Link to="/" style={{ color: '#64748b' }}>← All Portals</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', color: '#991b1b', fontSize: '0.875rem' }}>
      <AlertCircle size={16} style={{ flexShrink: 0 }} /> {msg}
    </div>
  );
}

function SubmitBtn({ loading, label, color }) {
  return (
    <button type="submit" disabled={loading} className="btn-primary"
      style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem', background: color, opacity: loading ? 0.75 : 1, gap: '0.5rem' }}>
      {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Please wait…</> : label}
    </button>
  );
}
