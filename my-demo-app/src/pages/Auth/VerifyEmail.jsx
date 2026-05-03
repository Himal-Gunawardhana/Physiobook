import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import api from '../../lib/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const token           = searchParams.get('token');

  const [status,  setStatus]  = useState('loading'); // 'loading' | 'success' | 'error' | 'no-token'
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) { setStatus('no-token'); return; }

    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified! You can now log in.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err?.message || err?.error?.message || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  // Auto-redirect to login after success
  useEffect(() => {
    if (status !== 'success') return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); navigate('/login/patient'); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      fontFamily: 'Inter, sans-serif',
      padding: '1rem',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        padding: '3rem 2.5rem',
        maxWidth: 440,
        width: '100%',
        textAlign: 'center',
      }}>

        {/* Logo */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <Mail size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Physiobook
          </h1>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <>
            <Loader size={48} color="#2563eb" style={{ animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Verifying your email…
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Please wait a moment.</p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <CheckCircle size={56} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
              Email Verified! ✅
            </h2>
            <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {message}
            </p>
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: 10,
              padding: '0.875rem',
              color: '#166534',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}>
              Redirecting to login in <strong>{countdown}</strong> seconds…
            </div>
            <Link to="/login/patient" style={{
              display: 'block',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff',
              padding: '0.875rem',
              borderRadius: 10,
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '1rem',
            }}>
              Log In Now →
            </Link>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <XCircle size={56} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
              Verification Failed
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {message}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/register/patient" style={{
                display: 'block',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: '#fff',
                padding: '0.875rem',
                borderRadius: 10,
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '0.95rem',
              }}>
                Register Again
              </Link>
              <Link to="/" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none' }}>
                ← Back to Home
              </Link>
            </div>
          </>
        )}

        {/* No token */}
        {status === 'no-token' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <XCircle size={56} color="#f59e0b" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
              Invalid Link
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              This verification link is missing a token. Please use the link sent to your email.
            </p>
            <Link to="/" style={{ color: '#2563eb', fontWeight: 600 }}>← Back to Home</Link>
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
