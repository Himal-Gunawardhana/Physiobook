import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, CheckCircle, Activity } from 'lucide-react';

export default function Feedback() {
  const navigate = useNavigate();
  const [clinicRating, setClinicRating] = useState(0);
  const [therapistRating, setTherapistRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const RatingStars = ({ value, onChange, label }) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{label}</div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => onChange(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', transition: 'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.25)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Star size={32} fill={n <= value ? '#f59e0b' : 'none'} color={n <= value ? '#f59e0b' : '#cbd5e1'} />
          </button>
        ))}
      </div>
      {value > 0 && (
        <div style={{ marginTop: '0.3rem', fontSize: '0.82rem', color: '#64748b' }}>
          {['','Poor','Fair','Good','Very Good','Excellent!'][value]}
        </div>
      )}
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '3rem 2rem', textAlign: 'center', maxWidth: 420, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <CheckCircle size={56} color="#10b981" style={{ marginBottom: '1rem' }} />
        <h2 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontWeight: 800 }}>Feedback Published!</h2>
        <p style={{ color: '#64748b', margin: '0 0 1.5rem' }}>Thank you for helping us improve. Your ratings have been shared with the clinic and your therapist.</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <div style={{ background: '#fef3c7', borderRadius: 12, padding: '0.75rem 1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#92400e' }}>{'⭐'.repeat(clinicRating)}</div>
            <div style={{ fontSize: '0.78rem', color: '#78350f', marginTop: '0.2rem' }}>Clinic</div>
          </div>
          <div style={{ background: '#ede9fe', borderRadius: 12, padding: '0.75rem 1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4c1d95' }}>{'⭐'.repeat(therapistRating)}</div>
            <div style={{ fontSize: '0.78rem', color: '#5b21b6', marginTop: '0.2rem' }}>Therapist</div>
          </div>
        </div>
        <button onClick={() => navigate('/book/my-bookings')} style={{ display: 'block', width: '100%', marginTop: '1.5rem', padding: '0.9rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
          Back to My Bookings
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: '#f59e0b', borderRadius: '50%', marginBottom: '1rem' }}>
            <Star size={28} color="#fff" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Leave Your Feedback</h1>
          <p style={{ margin: '0.4rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Your session with Dr. Aisha Perera is complete. How was your experience?</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <RatingStars value={clinicRating} onChange={setClinicRating} label="Rate the Clinic" />
          <RatingStars value={therapistRating} onChange={setTherapistRating} label="Rate the Therapist" />

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Comments (optional)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us about your experience…"
              rows={4}
              style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={() => { if (clinicRating && therapistRating) setSubmitted(true); }}
            disabled={!clinicRating || !therapistRating}
            style={{ width: '100%', padding: '0.9rem', background: (!clinicRating || !therapistRating) ? '#cbd5e1' : '#2563eb', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', cursor: (!clinicRating || !therapistRating) ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
          >
            Submit Feedback
          </button>
          <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.82rem', color: '#94a3b8' }}>Please rate both clinic and therapist to submit.</p>
        </div>
      </div>
    </div>
  );
}
