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
  const { login, logout: logoutFn }   = useAuth();

  const cfg  = ROLE_CONFIG[role] || ROLE_CONFIG.patient;
  const Icon = cfg.Icon;

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [roleMismatch, setRoleMismatch] = useState(null); // { label, portal }

  const [needs2FA,      setNeeds2FA]      = useState(false);
  const [partialToken,  setPartialToken]  = useState('');
  const [otpCode,       setOtpCode]       = useState('');
  const { verify2fa } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setRoleMismatch(null);
    setLoading(true);
    try {
      const result = await login(email, password, cfg.backendRole);
      if (result.requiresTwoFa) {
        setPartialToken(result.partialToken);
        setNeeds2FA(true);
        setLoading(false);
        return;
      }
      // Use backend role from result user object for proper routing
      const backendRole = result.user?.role;
      console.log('Login successful. Backend role:', backendRole, 'User:', result.user);
      
      if (!backendRole) {
        console.error('No role returned from backend. Full response:', result);
        throw new Error('User role not returned from server');
      }
      
      // ── ROLE MISMATCH CHECK (frontend safety net) ──────────────────
      // If the user logged in from the wrong portal, block it immediately
      if (backendRole !== cfg.backendRole) {
        // Logout immediately so they don't stay authenticated on wrong portal
        try { await logoutFn(); } catch (_) {}

        const ROLE_LABELS = { patient: 'Patient', clinic_admin: 'Clinic Admin', therapist: 'Physiotherapist', super_admin: 'Super Admin' };
        const ROLE_PORTALS = { patient: '/login/patient', clinic_admin: '/login/clinic', therapist: '/login/therapist', super_admin: '/login/superadmin' };
        const actualLabel = ROLE_LABELS[backendRole] || backendRole;
        const portal = ROLE_PORTALS[backendRole] || '/';

        setRoleMismatch({ label: actualLabel, portal });
        setError(`This account is registered as a ${actualLabel}. Please sign in from the ${actualLabel} portal.`);
        setLoading(false);
        return;
      }

      // Validate role is one of the expected values
      const validRoles = ['patient', 'clinic_admin', 'therapist', 'super_admin'];
      if (!validRoles.includes(backendRole)) {
        console.error(`Invalid role returned: ${backendRole}. Valid roles:`, validRoles);
        throw new Error(`Invalid user role: ${backendRole}. Please contact support.`);
      }
      
      const dest = ROLE_ROUTES[backendRole];
      if (!dest) {
        console.error(`No route found for role: ${backendRole}. Available routes:`, Object.keys(ROLE_ROUTES), 'ROLE_ROUTES:', ROLE_ROUTES);
        alert(`Error: Unknown role "${backendRole}". Please contact support.`);
        navigate('/');
      } else {
        console.log(`Navigating to ${dest} for role ${backendRole}`);
        // Clear pending verification data after successful login
        localStorage.removeItem('pending_verification_backend_role');
        localStorage.removeItem('pending_verification_frontend_role');
        navigate(dest);
      }
    } catch (err) {
      const msg = err?.error?.message || err?.message || 'Login failed. Check your credentials.';
      // Check for role mismatch from backend
      const correctPortal = err?.error?.correctPortal || err?.correctPortal;
      const actualRole = err?.error?.actualRole || err?.actualRole;
      if (correctPortal && actualRole) {
        const ROLE_LABELS = { patient: 'Patient', clinic_admin: 'Clinic Admin', therapist: 'Physiotherapist', super_admin: 'Super Admin' };
        setRoleMismatch({ label: ROLE_LABELS[actualRole] || actualRole, portal: correctPortal });
      }
      setError(msg);
      setLoading(false);
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await verify2fa(partialToken, otpCode);
      console.log('2FA successful. Role:', result.user?.role);
      
      const backendRole = result.user?.role;
      if (!backendRole) {
        throw new Error('User role not returned from server after 2FA');
      }
      
      const validRoles = ['patient', 'clinic_admin', 'therapist', 'super_admin'];
      if (!validRoles.includes(backendRole)) {
        console.error(`Invalid role after 2FA: ${backendRole}`);
        throw new Error(`Invalid user role: ${backendRole}`);
      }
      
      const dest = ROLE_ROUTES[backendRole];
      if (!dest) {
        console.error(`No route found for 2FA role: ${backendRole}`);
        navigate('/');
      } else {
        console.log(`2FA: Navigating to ${dest} for role ${backendRole}`);
        // Clear pending verification data after successful 2FA
        localStorage.removeItem('pending_verification_backend_role');
        localStorage.removeItem('pending_verification_frontend_role');
        navigate(dest);
      }
    } catch (err) {
      setError(err?.error?.message || err?.message || 'Invalid code. Try again.');
      setLoading(false);
    }
  };

  const guestDest = ROLE_ROUTES[cfg.backendRole] ?? '/';

  return (
    <div className="auth-split" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Left panel — hidden on mobile via CSS */}
      <div className="auth-split-left" style={{ background: cfg.gradient }}>
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
      <div className="auth-split-right">
        <div style={{ width: '100%', maxWidth: 400 }}>

          {needs2FA ? (
            <>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Email Verification</h2>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>We've sent a 6-digit verification code to your email. Check your inbox and enter it below.</p>
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

                {roleMismatch && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: '#1e40af', margin: '0 0 0.75rem', fontWeight: 500 }}>
                      This account belongs to the <strong>{roleMismatch.label}</strong> portal.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(roleMismatch.portal)}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.5rem', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
                    >
                      Go to {roleMismatch.label} Login →
                    </button>
                  </div>
                )}

                <SubmitBtn loading={loading} label={`Sign In as ${cfg.label}`} color={cfg.color} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} /> or
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                </div>

                {role === 'patient' && (
                  <button type="button" onClick={() => navigate(guestDest)} className="btn-ghost"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                    Continue as Guest →
                  </button>
                )}
              </form>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.87rem', flexWrap: 'wrap', gap: '0.5rem' }}>
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
