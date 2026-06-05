import React, { useState, useEffect } from 'react';
import { FileText, Calendar, User, Download, AlertCircle, Loader } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function PatientRecords() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    
    (async () => {
      try {
        const data = await api.get(`/clinical-notes/${user.id}`);
        if (!cancelled) setNotes(Array.isArray(data) ? data : data?.notes || []);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Failed to load records.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  if (loading) {
    return (
      <div className="animate-in" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        <Loader size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        Loading your medical records...
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Records</h1>
          <p className="page-subtitle">View clinical notes and attachments shared by your therapists.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '1rem', color: '#991b1b', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      {notes.length === 0 && !error ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
          <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontSize: '1.1rem' }}>No Records Found</h3>
          <p style={{ margin: 0 }}>You don't have any clinical notes or records shared with you yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notes.map(note => (
            <div key={note.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 600, marginBottom: '0.25rem' }}>
                    <Calendar size={16} color="#2563eb" />
                    {new Date(note.booked_date || note.created_at).toLocaleDateString('en-LK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                    <User size={14} /> Therapist: {note.therapist_name || 'Therapist'}
                  </div>
                </div>
                {note.booking_reference && (
                  <div style={{ background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                    Ref: {note.booking_reference}
                  </div>
                )}
              </div>
              
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', border: '1px solid #e2e8f0' }}>
                {note.note_text}
              </div>

              {note.attachment_url && (
                <div style={{ marginTop: '1rem' }}>
                  <a href={note.attachment_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', background: '#eff6ff', padding: '0.5rem 0.8rem', borderRadius: 8 }}>
                    <Download size={16} /> Download Attachment
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
