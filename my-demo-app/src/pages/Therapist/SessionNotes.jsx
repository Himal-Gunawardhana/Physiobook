import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, PlusCircle, Clock, User, Save, X, Loader, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

export default function SessionNotes() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingId = location.state?.bookingId;

  const [booking, setBooking] = useState(null);
  const [notes, setNotes] = useState([]);
  const [sessionState, setSessionState] = useState('idle');
  const [showAdd, setShowAdd] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (!bookingId) {
        setError('No booking selected. Please select a booking from the history.');
        setLoading(false);
        return;
      }

      // Fetch booking details
      const bookingData = await api.get(`/bookings/${bookingId}`);
      setBooking(bookingData);

      // Fetch session notes for this booking
      try {
        const notesData = await api.get(`/session-notes?bookingId=${bookingId}`);
        const notesList = Array.isArray(notesData) ? notesData : notesData?.notes ?? [];
        setNotes(notesList);
      } catch (err) {
        // If notes endpoint doesn't exist yet, start with empty array
        setNotes([]);
      }

      // Determine session state based on booking status
      if (bookingData.status === 'in_progress') {
        setSessionState('active');
      } else if (bookingData.status === 'completed') {
        setSessionState('complete');
      } else {
        setSessionState('idle');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;

    setSaving(true);
    try {
      // Post note to API
      await api.post('/session-notes', {
        bookingId,
        title: noteTitle.trim(),
        content: noteContent.trim(),
      });

      // Add to local state
      setNotes(n => [
        ...n,
        {
          id: Date.now(),
          title: noteTitle,
          content: noteContent,
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        },
      ]);

      setNoteTitle('');
      setNoteContent('');
      setShowAdd(false);
    } catch (err) {
      setError(`Failed to save note: ${err?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSessionStateChange = async (newState) => {
    if (!booking) return;

    try {
      setSaving(true);
      let newStatus = 'confirmed';

      if (newState === 'active') {
        newStatus = 'in_progress';
      } else if (newState === 'complete') {
        newStatus = 'completed';
      }

      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      setSessionState(newState);
    } catch (err) {
      setError(`Failed to update session state: ${err?.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!bookingId) {
    return (
      <div style={{ padding: '1rem', maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '2rem auto' }} />
        <h2 style={{ margin: '1rem 0 0.5rem', color: '#0f172a' }}>No Booking Selected</h2>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>Please select a booking from your schedule or history to view and edit session notes.</p>
        <button onClick={() => navigate('/therapist/schedule')} className="btn-primary" style={{ margin: '0 auto' }}>
          Back to Schedule
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        <Loader size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        Loading session details...
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 740, margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 0.25rem', fontWeight: 800, color: '#0f172a', fontSize: '1.4rem' }}>Session Notes</h2>
      <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>Document clinical findings and complete sessions.</p>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '1rem', color: '#991b1b', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>{error}</div>
        </div>
      )}

      {/* Active Booking Card */}
      {booking && (
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: 16, padding: '1.5rem', color: '#fff', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Session</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{booking.patient_name}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.2rem' }}>{booking.service_name}</div>
              <div style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.4rem' }}>
                <Clock size={13} style={{ display: 'inline', marginRight: 4 }} />
                {booking.booked_time} · {booking.duration_minutes} min · {new Date(booking.booked_date).toLocaleDateString('en-LK')}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sessionState === 'idle' && (
                <button
                  onClick={() => handleSessionStateChange('active')}
                  disabled={saving}
                  style={{ padding: '0.7rem 1.25rem', background: '#fff', color: '#7c3aed', borderRadius: 10, border: 'none', fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap', opacity: saving ? 0.7 : 1 }}
                >
                  ▶ Begin Session
                </button>
              )}
              {sessionState === 'active' && (
                <button
                  onClick={() => handleSessionStateChange('complete')}
                  disabled={saving}
                  style={{ padding: '0.7rem 1.25rem', background: '#10b981', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap', opacity: saving ? 0.7 : 1 }}
                >
                  <CheckCircle size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Session Completed
                </button>
              )}
              {sessionState === 'complete' && (
                <div style={{ background: '#dcfce7', color: '#166534', borderRadius: 10, padding: '0.7rem 1.25rem', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle size={14} /> Session Done
                </div>
              )}
            </div>
          </div>
          {sessionState === 'active' && (
            <div style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}>
              🟢 Session is in progress — document your clinical notes below.
            </div>
          )}
        </div>
      )}

      {/* Add Note Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>Clinical Notes</h3>
        <button
          onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          <PlusCircle size={15} /> Add Note
        </button>
      </div>

      {/* Add Note Form */}
      {showAdd && (
        <div style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '1rem', border: '1.5px solid #ede9fe' }}>
          <input
            value={noteTitle}
            onChange={e => setNoteTitle(e.target.value)}
            placeholder="Note title…"
            style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.92rem', marginBottom: '0.75rem', outline: 'none', boxSizing: 'border-box' }}
          />
          <textarea
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            placeholder="Clinical observation, treatment applied, patient response…"
            rows={4}
            style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.92rem', resize: 'vertical', outline: 'none', marginBottom: '0.75rem', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowAdd(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 1rem', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={saveNote}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 1.25rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
          <FileText size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <p>No notes yet. Add your first clinical note above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notes.map(note => (
            <div key={note.id} style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={15} color="#8b5cf6" />
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{note.title}</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{note.date}</span>
              </div>
              <p style={{ margin: 0, color: '#374151', fontSize: '0.88rem', lineHeight: 1.6 }}>{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
