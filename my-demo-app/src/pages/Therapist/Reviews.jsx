import React, { useState, useEffect, useCallback } from 'react';
import { Star, Loader, AlertCircle, MessageSquare, TrendingUp, Award, User } from 'lucide-react';
import api from '../../lib/api';

function StarRating({ rating, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: '0.15rem' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size} fill={s <= rating ? '#f59e0b' : 'none'} color={s <= rating ? '#f59e0b' : '#d1d5db'} />
      ))}
    </div>
  );
}

export default function TherapistReviews() {
  const [data, setData] = useState({ reviews: [], total: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get(`/staff/me/reviews?page=${page}&limit=${limit}`);
      setData(result);
    } catch (err) {
      setError(err?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(data.total / limit) || 1;

  // Rating breakdown
  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: data.reviews.filter(rev => rev.rating === r).length,
  }));

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Reviews</h1>
          <p className="page-subtitle">See what patients say about their experience with you.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.25rem' }}>
            {data.averageRating > 0 ? data.averageRating.toFixed(1) : '—'}
          </div>
          <StarRating rating={Math.round(data.averageRating)} size={16} />
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.4rem' }}>Average Rating</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#2563eb', marginBottom: '0.25rem' }}>
            {data.total}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <MessageSquare size={14} color="#64748b" />
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Total Reviews</span>
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', marginBottom: '0.25rem' }}>
            {data.total > 0 ? Math.round((data.reviews.filter(r => r.rating >= 4).length / data.reviews.length) * 100) : 0}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <TrendingUp size={14} color="#64748b" />
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Satisfaction</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: '#64748b' }}>
          <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#991b1b' }}>
          <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} />
          <p>{error}</p>
        </div>
      ) : data.reviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Award size={28} color="#93c5fd" />
          </div>
          <h3 style={{ margin: '0 0 0.5rem', color: '#475569' }}>No reviews yet</h3>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
            Reviews will appear here after patients rate their sessions with you.
          </p>
        </div>
      ) : (
        <>
          {/* Review List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.reviews.map(review => (
              <div key={review.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {review.patient_avatar
                        ? <img src={review.patient_avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                        : <User size={18} color="#2563eb" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{review.patient_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        {review.service_name && <>{review.service_name} · </>}
                        {new Date(review.created_at).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                {review.comment && (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, paddingLeft: '3.25rem' }}>
                    "{review.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>← Prev</button>
              <span style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#64748b' }}>
                Page {page} of {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
