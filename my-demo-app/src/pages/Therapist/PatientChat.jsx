import React, { useState, useEffect, useCallback } from 'react';
import { Send, Plus, FileText, Loader, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function PatientChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
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
      // Fetch list of patients the therapist has bookings with
      const bookingsData = await api.get('/bookings/my?limit=100');
      const bookings = Array.isArray(bookingsData) ? bookingsData : bookingsData?.rows ?? [];

      // Extract unique patients from bookings
      const patientMap = {};
      bookings.forEach(booking => {
        if (!patientMap[booking.patient_id]) {
          patientMap[booking.patient_id] = {
            id: booking.patient_id,
            name: booking.patient_name || 'Unknown Patient',
            condition: booking.service_name || 'Service',
            lastMsg: booking.updated_at ? new Date(booking.updated_at).toLocaleDateString('en-LK') : 'No messages',
            avatar: (booking.patient_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase(),
            unread: 0,
          };
        }
      });

      const patientList = Object.values(patientMap);
      setPatients(patientList);

      if (patientList.length > 0) {
        setActiveId(patientList[0].id);
      }

      // Initialize empty chats
      const emptyChats = {};
      patientList.forEach(p => {
        emptyChats[p.id] = [];
      });
      setChats(emptyChats);

      // Initialize unread map
      const emptyUnread = {};
      patientList.forEach(p => {
        emptyUnread[p.id] = 0;
      });
      setUnreadMap(emptyUnread);
    } catch (err) {
      setError(err?.message || 'Failed to load patients.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectPatient = (id) => {
    setActiveId(id);
    setUnreadMap(u => ({ ...u, [id]: 0 }));
  };

  useEffect(() => {
    if (!activeId || !user) return;
    
    let cancelled = false;
    
    api.post('/communications/conversations', {
      patientId: activeId,
      therapistId: user.id
    }).then(convo => {
      if (cancelled) return;
      setActiveConversationId(convo.id);
      return api.get(`/communications/conversations/${convo.id}/messages`);
    }).then(msgs => {
      if (cancelled || !msgs) return;
      const formattedMsgs = msgs.map(m => ({
        id: m.id,
        from: m.sender_id === user.id ? 'therapist' : 'patient',
        text: m.body,
        time: new Date(m.created_at).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' }),
      }));
      setChats(prev => ({ ...prev, [activeId]: formattedMsgs }));
    }).catch(err => {
      if (!cancelled) console.error('Failed to load messages', err);
    });

    return () => { cancelled = true; };
  }, [activeId, user]);

  const active = patients.find(p => p.id === activeId);
  const msgs = chats[activeId] || [];
  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  const send = async () => {
    if (!input.trim() || !activeId || !activeConversationId) return;

    setSending(true);
    try {
      const msg = await api.post(`/communications/conversations/${activeConversationId}/messages`, {
        body: input.trim(),
        messageType: 'text'
      });

      const newMsg = {
        id: msg.id,
        from: 'therapist',
        text: msg.body,
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
        Loading patient conversations...
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Patient Chats & Records
            {totalUnread > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>{totalUnread}</span>}
          </h1>
          <p className="page-subtitle">Communicate securely with your patients. Unread messages are highlighted.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '1rem', color: '#991b1b', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', margin: '1.5rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 220px)', minHeight: 480, display: 'flex' }}>
        {/* Patient list */}
        <div style={{ width: 260, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #e2e8f0' }}>
            <input type="text" placeholder="Search patients…" className="form-input" style={{ fontSize: '0.85rem', padding: '0.5rem 0.875rem' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {patients.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                <FileText size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
                <p>No patient conversations yet.</p>
              </div>
            ) : (
              patients.map(p => (
                <div
                  key={p.id}
                  onClick={() => selectPatient(p.id)}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    cursor: 'pointer',
                    background: activeId === p.id ? '#eff6ff' : 'white',
                    borderBottom: '1px solid #f1f5f9',
                    borderLeft: activeId === p.id ? '3px solid #2563eb' : '3px solid transparent',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', color: '#1e40af', flexShrink: 0 }}>
                    {p.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.87rem' }}>{p.name}</span>
                      {unreadMap[p.id] > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>{unreadMap[p.id]}</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.condition}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>{p.lastMsg}</div>
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
              <button
                className="btn-primary"
                onClick={() => navigate('/therapist/notes')}
                style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}
              >
                <Plus size={13} /> Add Clinical Note
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {msgs.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem', marginTop: '2rem' }}>
                  No messages yet. Start the conversation.
                </div>
              )}
              {msgs.map(m => (
                <div key={m.id} style={{ maxWidth: '75%', alignSelf: m.from === 'therapist' ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      background: m.from === 'therapist' ? '#2563eb' : 'white',
                      color: m.from === 'therapist' ? 'white' : '#0f172a',
                      padding: '0.75rem 1rem',
                      borderRadius: m.from === 'therapist' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      border: m.from === 'patient' ? '1px solid #e2e8f0' : 'none',
                    }}
                  >
                    {m.text}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem', textAlign: m.from === 'therapist' ? 'right' : 'left' }}>
                    {m.time}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Type a message or share an exercise link…"
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
              <p>Select a patient to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
