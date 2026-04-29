import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, Activity, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BookingGate() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, register } = useAuth();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);

  // Preserve booking state so patient continues after auth
  const nextState = location.state;

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        const [first, ...rest] = form.firstName.trim().split(' ');
        await register({
          firstName: first || form.firstName,
          lastName:  rest.join(' ') || 'Patient',
          email:     form.email,
          password:  form.password,
          role:      'patient',
        });
      }
      setDone(true);
      setTimeout(() => navigate('/book/time', { state: nextState }), 1000);
    } catch (err) {
      setError(err?.error?.message || err?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: '#2563eb', borderRadius: '50%', marginBottom: '1rem' }}>
            <Activity size={28} color="#fff" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ margin: '0.4rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Sign in to continue booking your session' : 'Register to book your physio session'}
          </p>
        </div>

        {done ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>
              {mode === 'login' ? 'Signed In!' : 'Account Created!'}
            </h3>
            <p style={{ color: '#64748b', margin: 0 }}>Redirecting to your booking…</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            {/* Toggle */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: '1.5rem' }}>
              {['login', 'register'].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); }}
                  style={{ flex: 1, padding: '0.55rem', borderRadius: 8, border: 'none', background: mode === m ? '#fff' : 'transparent', color: mode === m ? '#2563eb' : '#64748b', fontWeight: mode === m ? 700 : 500, cursor: 'pointer', fontSize: '0.9rem', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input name="name" value={form.firstName} onChange={set('firstName')} placeholder="Sarah Johnson" required style={inputStyle} />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required minLength={8} style={inputStyle} />
                </div>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.7rem 0.9rem', color: '#991b1b', fontSize: '0.83rem' }}>
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} /> {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                {loading
                  ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Please wait…</>
                  : <>{mode === 'login' ? 'Sign In & Continue' : 'Register & Continue'} <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.4rem',
  border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
};
