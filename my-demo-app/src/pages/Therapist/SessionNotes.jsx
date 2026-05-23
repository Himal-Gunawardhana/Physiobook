import React, { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, PlusCircle, Clock, Save, X, Loader, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

export default function SessionNotes() {
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [booking, setBooking] = useState(null);
  const [notes, setNotes] = useState([]);
  const [sessionState, setSessionState] = useState('idle');
  const [showAdd, setShowAdd] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load list of all bookings for the therapist
  const loadBookings = useCallback(async () => {
    setLoadingBookings(true);
    setError('');

    try {
      const bookingsData = await api.get('/bookings/my?limit=100');
      const bookingsList = Array.isArray(bookingsData) ? bookingsData : bookingsData?.rows ?? [];
      setBookings(bookingsList);

      // Auto-select first booking if available
      if (bookingsList.length > 0 && !selectedBookingId) {
        setSelectedBookingId(bookingsList[0].id);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load bookings.');
    } finally {
      setLoadingBookings(false);
    }
  }, [selectedBookingId]);

  // Load details for selected booking
  const loadBookingDetails = useCallback(async () => {
    if (!selectedBookingId) return;

    setLoadingDetails(true);
    setError('');

    try {
      // Fetch booking details
      const bookingData = await api.get(`/bookings/${selectedBookingId}`);
      setBooking(bookingData);

      // Fetch session notes for this booking
      try {
        const notesData = await api.get(`/session-notes?bookingId=${selectedBookingId}`);
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
      setLoadingDetails(false);
    }
  }, [selectedBookingId]);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    loadBookingDetails();
  }, [selectedBookingId]);

  const saveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;

    setSaving(true);
    try {
      // Post note to API
      await api.post('/session-notes', {
        bookingId: selectedBookingId,
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

  // Map booking status to display label and colors
  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: { label: 'Pending', bg: '#fef3c7', text: '#92400e', icon: '⏳' },
      confirmed: { label: 'Confirmed', bg: '#dbeafe', text: '#1e40af', icon: '✓' },
      in_progress: { label: 'In Progress', bg: '#dcfce7', text: '#166534', icon: '🟢' },
      completed: { label: 'Completed', bg: '#f3e8ff', text: '#6b21a8', icon: '✓' },
      cancelled: { label: 'Cancelled', bg: '#fee2e2', text: '#991b1b', icon: '✕' },
      no_show: { label: 'No Show', bg: '#fee2e2', text: '#991b1b', icon: '✕' },
      refund_requested: { label: 'Refund Requested', bg: '#fef3c7', text: '#92400e', icon: '💰' },
    };
    return statusMap[status] || { label: status, bg: '#f3f4f6', text: '#374151', icon: 'ℹ' };
  };

  const handleSessionStateChange = async (newStatus) => {
    if (!booking) return;

    try {
      setSaving(true);
      const response = await api.patch(`/bookings/${selectedBookingId}/status`, { status: newStatus });
      
      // Update local booking with new status
      setBooking(prev => ({ ...prev, status: newStatus }));
      
      // Update sessionState based on new status
      if (newStatus === 'in_progress') {
        setSessionState('active');
      } else if (newStatus === 'completed') {
        setSessionState('complete');
      } else {
        setSessionState('idle');
      }
    } catch (err) {
      setError(`Failed to update session state: ${err?.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loadingBookings) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        <Loader size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        Loading your patients...
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Session Notes & Clinical Records</h1>
          <p className="page-subtitle">Select a patient to view booking details and document clinical findings.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '1rem', color: '#991b1b', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', margin: '1.5rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 220px)', minHeight: 480, display: 'flex' }}>
        {/* Patient/Booking List */}
        <div style={{ width: 280, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #e2e8f0' }}>
            <input type="text" placeholder="Search patients…" className="form-input" style={{ fontSize: '0.85rem', padding: '0.5rem 0.875rem' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {bookings.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                <FileText size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
                <p>No patients booked yet.</p>
              </div>
            ) : (
              bookings.map(b => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBookingId(b.id)}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    cursor: 'pointer',
                    background: selectedBookingId === b.id ? '#eff6ff' : 'white',
                    borderBottom: '1px solid #f1f5f9',
                    borderLeft: selectedBookingId === b.id ? '3px solid #2563eb' : '3px solid transparent',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', color: '#1e40af', flexShrink: 0 }}>
                    {(b.patient_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.87rem', color: '#0f172a' }}>{b.patient_name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.service_name || 'Service'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                      {new Date(b.booked_date).toLocaleDateString('en-LK')} · {b.booked_time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Booking Details and Notes */}
        {selectedBookingId && !loadingDetails && booking ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
            {/* Active Booking Card */}
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: 0, padding: '1.5rem', color: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session Details</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{booking.patient_name}</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.2rem' }}>{booking.service_name}</div>
                  <div style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.4rem' }}>
                    <Clock size={13} style={{ display: 'inline', marginRight: 4 }} />
                    {booking.booked_time} · {booking.duration_minutes} min · {new Date(booking.booked_date).toLocaleDateString('en-LK')}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* CANCELLED / NO_SHOW - Show as badge only */}
                  {(booking.status === 'cancelled' || booking.status === 'no_show') && (() => {
                    const statusDisplay = getStatusDisplay(booking.status);
                    return (
                      <div style={{ background: statusDisplay.bg, color: statusDisplay.text, borderRadius: 10, padding: '0.7rem 1.25rem', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textAlign: 'center', justifyContent: 'center' }}>
                        {statusDisplay.icon} {statusDisplay.label}
                      </div>
                    );
                  })()}
                  
                  {/* PENDING - Show status badge */}
                  {booking.status === 'pending' && (() => {
                    const statusDisplay = getStatusDisplay('pending');
                    return (
                      <div style={{ background: statusDisplay.bg, color: statusDisplay.text, borderRadius: 10, padding: '0.7rem 1.25rem', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {statusDisplay.icon} {statusDisplay.label}
                      </div>
                    );
                  })()}
                  
                  {/* CONFIRMED - Show "Begin Session" button */}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleSessionStateChange('in_progress')}
                      disabled={saving}
                      style={{ padding: '0.7rem 1.25rem', background: '#fff', color: '#7c3aed', borderRadius: 10, border: 'none', fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap', opacity: saving ? 0.7 : 1 }}
                    >
                      ▶ Begin Session
                    </button>
                  )}
                  
                  {/* IN_PROGRESS - Show "Session Completed" button */}
                  {booking.status === 'in_progress' && (
                    <button
                      onClick={() => handleSessionStateChange('completed')}
                      disabled={saving}
                      style={{ padding: '0.7rem 1.25rem', background: '#10b981', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap', opacity: saving ? 0.7 : 1 }}
                    >
                      <CheckCircle size={14} style={{ display: 'inline', marginRight: 4 }} />
                      Complete Session
                    </button>
                  )}
                  
                  {/* COMPLETED / REFUND_REQUESTED - Show status badge with note about patient actions */}
                  {(booking.status === 'completed' || booking.status === 'refund_requested') && (() => {
                    const statusDisplay = getStatusDisplay(booking.status);
                    return (
                      <div style={{ background: statusDisplay.bg, color: statusDisplay.text, borderRadius: 10, padding: '0.7rem 1.25rem', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textAlign: 'center', justifyContent: 'center' }}>
                        {statusDisplay.icon} {statusDisplay.label}
                      </div>
                    );
                  })()}
                </div>
              </div>
              {booking.status === 'in_progress' && (
                <div style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}>
                  🟢 Session is in progress — document your clinical notes below.
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {/* Add Note Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
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
              
              {/* Session Completed Info */}
              {booking.status === 'completed' && (
                <div style={{ background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '1rem', marginTop: '1.5rem', fontSize: '0.88rem', color: '#1e40af' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Session Completed ✓</div>
                  <p style={{ margin: 0, lineHeight: 1.5 }}>The patient can now confirm this booking and then choose to request a refund or write a review on your therapist profile.</p>
                </div>
              )}
            </div>
          </div>
        ) : loadingDetails ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <div style={{ textAlign: 'center' }}>
              <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
              <p>Select a patient to view details and add clinical notes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
