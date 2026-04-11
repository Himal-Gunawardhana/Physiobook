import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Activity, Building2, Stethoscope, ShieldCheck } from 'lucide-react';

const ROLE_CONFIG = {
  patient:    { label: 'Patient',         Icon: Activity,    color: '#10b981', desc: 'Start booking physiotherapy appointments today.' },
  clinic:     { label: 'Clinic Owner',    Icon: Building2,   color: '#2563eb', desc: 'Set up your clinic profile and manage your team.' },
  therapist:  { label: 'Physiotherapist', Icon: Stethoscope, color: '#8b5cf6', desc: 'Join as a certified physiotherapist.' },
  superadmin: { label: 'Super Admin',     Icon: ShieldCheck,  color: '#f59e0b', desc: 'Admin access to the platform.' },
};

const ROLE_DEST = {
  patient: '/book', clinic: '/clinic', therapist: '/therapist', superadmin: '/superadmin'
};

const bannerColors = {
  patient:    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  clinic:     'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  therapist:  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
  superadmin: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
};

export default function Register() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const cfg  = ROLE_CONFIG[role] || ROLE_CONFIG.patient;
  const dest = ROLE_DEST[role]   || '/';
  const Icon = cfg.Icon;

  const handle = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate(dest); }, 900);
  };

  const roleFields = () => {
    if (role === 'clinic') return (
      <>
        <div>
          <label className="form-label">Clinic Name</label>
          <input type="text" placeholder="e.g. Apex Physiotherapy" className="form-input" required />
        </div>
        <div>
          <label className="form-label">Registration Number</label>
          <input type="text" placeholder="e.g. REG-12345" className="form-input" required />
        </div>
      </>
    );
    if (role === 'therapist') return (
      <>
        <div>
          <label className="form-label">License Number</label>
          <input type="text" placeholder="e.g. PHY-9876" className="form-input" required />
        </div>
        <div>
          <label className="form-label">Primary Specialization</label>
          <select className="form-input" required>
            <option value="">Select specialization…</option>
            <option>Sports Injury</option>
            <option>Neurological</option>
            <option>Orthopedic</option>
            <option>Post-Natal / Pre-Natal</option>
            <option>Geriatric</option>
          </select>
        </div>
      </>
    );
    if (role === 'patient') return (
      <div>
        <label className="form-label">Date of Birth</label>
        <input type="date" className="form-input" required />
      </div>
    );
    return null;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Left panel */}
      <div style={{
        flex: 1,
        background: bannerColors[role] || bannerColors.patient,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '3rem', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Icon size={72} color="rgba(255,255,255,0.9)" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem' }}>Join Physiobook</h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.88, maxWidth: 360, lineHeight: 1.6 }}>{cfg.desc}</p>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
            Create Account
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            Register as a <strong>{cfg.label}</strong>
          </p>

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label className="form-label">Full Name</label>
              <input type="text" placeholder="John Doe" className="form-input" required />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input type="email" placeholder="you@example.com" className="form-input" required />
            </div>
            {roleFields()}
            <div>
              <label className="form-label">Password</label>
              <input type="password" placeholder="Create a strong password" className="form-input" required />
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <input type="password" placeholder="Repeat password" className="form-input" required />
            </div>

            <button
              type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem', background: cfg.color, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>

            <button
              type="button" onClick={() => navigate(dest)} className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
            >
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
