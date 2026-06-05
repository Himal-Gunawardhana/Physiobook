import React, { useState, useEffect, useCallback } from 'react';
import { Send, FileText, Loader, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function PatientChatDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [bookings, setBookingsList] = useState([]);
  const [activeId, setActiveId] = useState(null); // booking_id
  const [input, setInput] = useState('');
  const [chats, setChats] = useState({});
  const [unreadMap, setUnreadMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch list of bookings the patient has
      const bookingsData = await api.get('/bookings/my?limit=100');
      const bookings = Array.isArray(bookingsData) ? bookingsData : bookingsData?.rows ?? [];

      // Group by booking ID
      const bookingMap = {};
      bookings.forEach(booking => {
        bookingMap[booking.id] = {
          id: booking.id,
          name: booking.therapist_name || booking.clinic_name || 'Therapist',
          condition: booking.service_name || 'Service',
          date: booking.booked_date ? new Date(booking.booked_date).toLocaleDateString('en-LK') : '',
          lastMsg: booking.updated_at ? new Date(booking.updated_at).toLocaleDateString('en-LK') : 'No messages',
          avatar: (booking.therapist_name || booking.clinic_name || 'T').split(' ').map(n => n[0]).join('').toUpperCase(),
          unread: 0,
        };
      });

      const list = Object.values(bookingMap);
      setBookingsList(list);

      if (list.length > 0) {
        if (location.state?.bookingId && bookingMap[location.state.bookingId]) {
          setActiveId(location.state.bookingId);
        } else {
          setActiveId(list[0].id);
        }
      }

      const emptyChats = {};
      const emptyUnread = {};
      list.forEach(b => {
        emptyChats[b.id] = [];
        emptyUnread[b.id] = 0;
      });
      setChats(emptyChats);
      setUnreadMap(emptyUnread);
    } catch (err) {
      setError(err?.message || 'Failed to load booking conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectChat = (id) => {
    setActiveId(id);
    setUnreadMap(u => ({ ...u, [id]: 0 }));
  };

  const active = bookings.find(b => b.id === activeId);

  useEffect(() => {
    if (!activeId || !user) return;
    
    let cancelled = false;
    
    api.get(`/conversations/${activeId}/messages`)
    .then(msgs => {
      if (cancelled || !msgs) return;
      const formattedMsgs = msgs.map(m => ({
        id: m.id,
        from: m.sender_id === user.id ? 'patient' : 'therapist',
        text: m.content,
        time: new Date(m.created_at).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' }),
      }));
      setChats(prev => ({ ...prev, [activeId]: formattedMsgs }));
    }).catch(err => {
      if (!cancelled) console.error('Failed to load messages', err);
    });

    return () => { cancelled = true; };
  }, [activeId, user]);

  const msgs = chats[activeId] || [];
  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  const send = async () => {
    if (!input.trim() || !activeId) return;

    setSending(true);
    try {
      const msg = await api.post(`/conversations/${activeId}/messages`, {
        content: input.trim(),
      });

      const newMsg = {
        id: msg.id,
        from: 'patient',
        text: msg.content,
        time: new Date(msg.created_at).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' }),
      };

      setChats(prev => ({
        ...prev,
        [activeId]: [...(prev[activeId] || []), newMsg],
      }));

      setInput('');
    } catch (err) {
      setError(`Failed to send message: ${err?.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-in" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        <Loader size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        Loading your conversations...
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Therapist Chat
            {totalUnread > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>{totalUnread}</span>}
          </h1>
          <p className="page-subtitle">Communicate securely with your therapists.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '1rem', color: '#991b1b', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 220px)', minHeight: 480, display: 'flex' }}>
        {/* Bookings list */}
        <div style={{ width: 280, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #e2e8f0' }}>
            <input type="text" placeholder="Search chats…" className="form-input" style={{ fontSize: '0.85rem', padding: '0.5rem 0.875rem' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {bookings.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                <FileText size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
                <p>No conversations yet.</p>
              </div>
            ) : (
              bookings.map(b => (
                <div
                  key={b.id}
                  onClick={() => selectChat(b.id)}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    cursor: 'pointer',
                    background: activeId === b.id ? '#eff6ff' : 'white',
                    borderBottom: '1px solid #f1f5f9',
                    borderLeft: activeId === b.id ? '3px solid #2563eb' : '3px solid transparent',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', color: '#1e40af', flexShrink: 0 }}>
                    {b.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.87rem' }}>{b.name}</span>
                      {unreadMap[b.id] > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>{unreadMap[b.id]}</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.condition} • {b.date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        {activeId && active ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Header */}
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.97rem' }}>{active.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{active.condition}</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {msgs.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem', marginTop: '2rem' }}>
                  No messages yet. Send a message to your therapist.
                </div>
              )}
              {msgs.map(m => (
                <div key={m.id} style={{ maxWidth: '75%', alignSelf: m.from === 'patient' ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      background: m.from === 'patient' ? '#2563eb' : 'white',
                      color: m.from === 'patient' ? 'white' : '#0f172a',
                      padding: '0.75rem 1rem',
                      borderRadius: m.from === 'patient' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      border: m.from === 'therapist' ? '1px solid #e2e8f0' : 'none',
                    }}
                  >
                    {m.text}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem', textAlign: m.from === 'patient' ? 'right' : 'left' }}>
                    {m.time}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Type a message…"
                className="form-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                style={{ flex: 1 }}
                disabled={sending}
              />
              <button className="btn-primary" onClick={send} disabled={sending} style={{ padding: '0 1rem', flexShrink: 0, opacity: sending ? 0.7 : 1 }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <div style={{ textAlign: 'center' }}>
              <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
              <p>Select a booking to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
