import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Activity, Building2, Stethoscope, ShieldCheck, AlertCircle, Loader } from 'lucide-react';
import { useAuth, ROLE_ROUTES } from '../../context/AuthContext';

const ROLE_CONFIG = {
  patient:    { label: 'Patient',         Icon: Activity,    color: '#10b981', backendRole: 'patient',      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', desc: 'Start booking physiotherapy appointments today.' },
  clinic:     { label: 'Clinic Admin',    Icon: Building2,   color: '#2563eb', backendRole: 'clinic_admin', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', desc: 'Set up your clinic profile and manage your team.' },
  therapist:  { label: 'Physiotherapist', Icon: Stethoscope, color: '#8b5cf6', backendRole: 'therapist',    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', desc: 'Join as a certified physiotherapist.' },
  superadmin: { label: 'Super Admin',     Icon: ShieldCheck, color: '#f59e0b', backendRole: 'super_admin',  gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', desc: 'Admin access to the platform.' },
};

// Map URL role → backend role string
const BACKEND_ROLE = {
  patient:    'patient',
  clinic:     'clinic_admin',
  therapist:  'therapist',
  superadmin: 'super_admin',
};

export default function Register() {
  const { role }       = useParams();
  const navigate       = useNavigate();
  const { register }   = useAuth();

  const cfg  = ROLE_CONFIG[role] || ROLE_CONFIG.patient;
  const Icon = cfg.Icon;

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (form.password !== form.confirm) {
      setFieldErrors({ confirm: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        password:  form.password,
        role:      BACKEND_ROLE[role] || 'patient',
      };

      const result = await register(payload);
      const dest = ROLE_ROUTES[result.user?.role] ?? '/';
      navigate(dest);
    } catch (err) {
      // Handle Zod validation errors from backend
      if (err?.error?.details) {
        const fe = {};
        err.error.details.forEach(d => { fe[d.field] = d.message; });
        setFieldErrors(fe);
      }
      setError(err?.error?.message || err?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const guestDest = ROLE_ROUTES[cfg.backendRole] ?? '/';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Left banner */}
      <div style={{ flex: 1, background: cfg.gradient, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Icon size={72} color="rgba(255,255,255,0.9)" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem' }}>Join Physiobook</h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.88, maxWidth: 360, lineHeight: 1.6 }}>{cfg.desc}</p>
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Create Account</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Register as a <strong>{cfg.label}</strong></p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">First Name</label>
                <input className="form-input" placeholder="John" value={form.firstName} onChange={set('firstName')} required />
                {fieldErrors.firstName && <FieldError msg={fieldErrors.firstName} />}
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">Last Name</label>
                <input className="form-input" placeholder="Doe" value={form.lastName} onChange={set('lastName')} required />
                {fieldErrors.lastName && <FieldError msg={fieldErrors.lastName} />}
              </div>
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              {fieldErrors.email && <FieldError msg={fieldErrors.email} />}
            </div>

            <div>
              <label className="form-label">Password <span style={{ color: '#94a3b8', fontWeight: 400 }}>(min 8 chars, upper + lower + number)</span></label>
              <input type="password" className="form-input" placeholder="Create a strong password" value={form.password} onChange={set('password')} required minLength={8} />
              {fieldErrors.password && <FieldError msg={fieldErrors.password} />}
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
              {fieldErrors.confirm && <FieldError msg={fieldErrors.confirm} />}
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', color: '#991b1b', fontSize: '0.875rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', marginTop: '0.25rem', background: cfg.color, opacity: loading ? 0.75 : 1, gap: '0.5rem' }}>
              {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating Account…</> : 'Create Account'}
            </button>

            <button type="button" onClick={() => navigate(guestDest)} className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
              Continue as Guest →
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.87rem' }}>
            <Link to={`/login/${role}`} style={{ color: cfg.color, fontWeight: 600 }}>Already have an account?</Link>
            <Link to="/" style={{ color: '#64748b' }}>← All Portals</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldError({ msg }) {
  return <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.25rem' }}>{msg}</p>;
}
