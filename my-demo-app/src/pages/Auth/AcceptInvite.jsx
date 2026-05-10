import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Stethoscope, CheckCircle, AlertCircle, Loader,
  Eye, EyeOff, ArrowRight
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

/* Password strength checker */
function PwCheck({ valid, label }) {
  return (
    <li style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.8rem', color: valid ? '#10b981' : '#94a3b8' }}>
      <span style={{ fontWeight:700 }}>{valid ? '✓' : '○'}</span> {label}
    </li>
  );
}

export default function AcceptInvite() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const { login }  = useAuth();

  // Token from link — e.g. /accept-invite?token=xxx&email=yyy
  const token      = params.get('token');
  const emailParam = params.get('email') || '';

  const [verifying,  setVerifying]  = useState(true);   // validate token on mount
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const [form,    setForm]    = useState({ firstName:'', lastName:'', phone:'', password:'', confirm:'' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);

  const [pwv, setPwv] = useState({ len:false, upper:false, num:false, special:false });

  /* Validate invite token on mount */
  useEffect(() => {
    if (!token) {
      setTokenError('Invalid or missing invite link. Please ask your clinic admin to resend the invite.');
      setVerifying(false);
      return;
    }
    (async () => {
      try {
        // GET /staff/onboarding/verify-invite?token=xxx
        await api.get(`/staff/onboarding/verify-invite?token=${encodeURIComponent(token)}`);
        setTokenValid(true);
      } catch (err) {
        setTokenError(err?.message || 'This invite link is invalid or has expired.');
      } finally {
        setVerifying(false);
      }
    })();
  }, [token]);

  const set = (field) => (e) => {
    const v = e.target.value;
    setForm(f => ({ ...f, [field]: v }));
    if (field === 'password') {
      setPwv({
        len:     v.length >= 8,
        upper:   /[A-Z]/.test(v),
        num:     /[0-9]/.test(v),
        special: /[!@#$%^&*]/.test(v),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!Object.values(pwv).every(Boolean)) { setError('Password does not meet all requirements.'); return; }
    if (form.password !== form.confirm)      { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      // POST /staff/onboarding/register  → creates therapist account + links to clinic
      await api.post('/staff/onboarding/register', {
        token,
        firstName: form.firstName,
        lastName:  form.lastName,
        phone:     form.phone || undefined,
        password:  form.password,
      });
      setDone(true);
    } catch (err) {
      setError(err?.message || 'Registration failed. The invite may have expired.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading token verification ── */
  if (verifying) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc' }}>
        <div style={{ textAlign:'center', color:'#64748b' }}>
          <Loader size={32} style={{ animation:'spin 1s linear infinite', marginBottom:'1rem' }}/>
          <p>Verifying your invite link…</p>
        </div>
      </div>
    );
  }

  /* ── Invalid token ── */
  if (!tokenValid) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', padding:'1rem' }}>
        <div style={{ background:'#fff', borderRadius:20, boxShadow:'0 20px 60px rgba(0,0,0,0.1)', padding:'3rem 2.5rem', maxWidth:440, width:'100%', textAlign:'center' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
            <AlertCircle size={32} color="#ef4444"/>
          </div>
          <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'#0f172a', marginBottom:'0.75rem' }}>Invite Link Invalid</h2>
          <p style={{ color:'#64748b', lineHeight:1.7, marginBottom:'1.5rem' }}>{tokenError}</p>
          <Link to="/" style={{ display:'inline-block', padding:'0.75rem 2rem', background:'#2563eb', color:'#fff', borderRadius:10, fontWeight:700, textDecoration:'none' }}>
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  /* ── Registration success ── */
  if (done) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#f0f9ff,#e0f2fe)', padding:'1rem' }}>
        <div style={{ background:'#fff', borderRadius:20, boxShadow:'0 20px 60px rgba(0,0,0,0.1)', padding:'3rem 2.5rem', maxWidth:440, width:'100%', textAlign:'center' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
            <CheckCircle size={40} color="#fff"/>
          </div>
          <h2 style={{ fontSize:'1.6rem', fontWeight:800, color:'#0f172a', marginBottom:'0.75rem' }}>You're All Set!</h2>
          <p style={{ color:'#64748b', lineHeight:1.7, marginBottom:'0.5rem' }}>
            Your physiotherapist account has been created. Please check your email to verify your account,
            then you can log in.
          </p>
          <div style={{ background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:10, padding:'0.875rem', color:'#6d28d9', fontSize:'0.85rem', marginBottom:'1.5rem' }}>
            📧 Verification email sent to <strong>{emailParam}</strong>
          </div>
          <Link
            to="/login/therapist"
            style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.875rem 2rem', background:'#8b5cf6', color:'#fff', borderRadius:10, fontWeight:700, textDecoration:'none' }}
          >
            Go to Therapist Login <ArrowRight size={16}/>
          </Link>
        </div>
      </div>
    );
  }

  /* ── Registration form ── */
  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', fontFamily:'Inter,sans-serif' }}>
      {/* Left banner */}
      <div style={{ background:'linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'3rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 30% 40%,rgba(255,255,255,0.15) 0%,transparent 60%)' }}/>
        <div style={{ position:'relative', zIndex:1, color:'#fff' }}>
          <Stethoscope size={72} color="rgba(255,255,255,0.9)" style={{ marginBottom:'1.5rem' }}/>
          <h1 style={{ fontSize:'2.5rem', fontWeight:800, margin:'0 0 1rem' }}>Join as a Physiotherapist</h1>
          <p style={{ fontSize:'1.05rem', opacity:0.88, maxWidth:360, lineHeight:1.6 }}>
            Your clinic has invited you to join Physiobook. Set up your account to start managing
            sessions, schedules, and patient care.
          </p>
          <div style={{ marginTop:'2rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {['Manage your weekly schedule', 'View patient bookings', 'Write clinical session notes', 'Chat with patients securely'].map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.9rem', opacity:0.9 }}>
                <CheckCircle size={16} color="rgba(255,255,255,0.8)"/> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem 2rem', overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:440 }}>
          <h2 style={{ fontSize:'1.75rem', fontWeight:800, color:'#0f172a', marginBottom:'0.4rem' }}>Complete Your Profile</h2>
          <p style={{ color:'#64748b', marginBottom:'1.75rem' }}>
            Setting up account for <strong style={{ color:'#8b5cf6' }}>{emailParam || 'your email'}</strong>
          </p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'flex', gap:'1rem' }}>
              <div style={{ flex:1 }}>
                <label className="form-label">First Name</label>
                <input className="form-input" placeholder="John" value={form.firstName} onChange={set('firstName')} required/>
              </div>
              <div style={{ flex:1 }}>
                <label className="form-label">Last Name</label>
                <input className="form-input" placeholder="Doe" value={form.lastName} onChange={set('lastName')} required/>
              </div>
            </div>

            <div>
              <label className="form-label">Email</label>
              <input className="form-input" value={emailParam} disabled style={{ background:'#f8fafc', color:'#94a3b8' }}/>
            </div>

            <div>
              <label className="form-label">Phone <span style={{ color:'#94a3b8', fontWeight:400 }}>(optional)</span></label>
              <input type="tel" className="form-input" placeholder="+94 77 123 4567" value={form.phone} onChange={set('phone')}/>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'} className="form-input"
                  placeholder="Create a strong password" value={form.password}
                  onChange={set('password')} required
                  style={{ paddingRight:'2.75rem' }}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:0 }}>
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop:'0.75rem', padding:'0.75rem', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:6 }}>
                  <p style={{ fontSize:'0.72rem', fontWeight:700, color:'#475569', marginBottom:'0.4rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>Requirements:</p>
                  <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                    <PwCheck valid={pwv.len}     label="At least 8 characters"/>
                    <PwCheck valid={pwv.upper}   label="Uppercase letter (A-Z)"/>
                    <PwCheck valid={pwv.num}     label="Number (0-9)"/>
                    <PwCheck valid={pwv.special} label="Special character (!@#$%^&*)"/>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required/>
            </div>

            {error && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'0.75rem 1rem', color:'#991b1b', fontSize:'0.875rem' }}>
                <AlertCircle size={16} style={{ flexShrink:0 }}/> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width:'100%', justifyContent:'center', padding:'0.875rem', fontSize:'1rem', marginTop:'0.25rem', background:'#8b5cf6', opacity: loading ? 0.75 : 1 }}>
              {loading ? <><Loader size={16} style={{ animation:'spin 1s linear infinite' }}/> Creating Account…</> : 'Create Therapist Account'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.85rem', color:'#94a3b8' }}>
            Already have an account? <Link to="/login/therapist" style={{ color:'#8b5cf6', fontWeight:600 }}>Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
