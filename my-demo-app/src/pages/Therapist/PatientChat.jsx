import React, { useState } from 'react';
import { Send, Plus, FileText } from 'lucide-react';

const PATIENTS = [
  { id: 1, name: 'John Doe',    condition: 'Shoulder Impingement',   lastMsg: '2 hours ago', avatar: 'JD', unread: 2 },
  { id: 2, name: 'Jane Roe',    condition: 'Post-ACL Reconstruction', lastMsg: 'Yesterday',   avatar: 'JR', unread: 1 },
  { id: 3, name: 'Ali Hassan',  condition: 'Chest Physiotherapy',    lastMsg: '2 days ago',  avatar: 'AH', unread: 0 },
];

const MESSAGES = {
  1: [
    { id: 1, from: 'patient',   text: 'Hi Dr. Smith, my shoulder feels much better after this week\'s exercises.', time: '10:20 AM' },
    { id: 2, from: 'therapist', text: 'Great progress! Keep doing the external rotation stretches twice daily.', time: '10:45 AM' },
    { id: 3, from: 'patient',   text: 'Still a slight pinch when I raise my arm fully overhead though.', time: '11:02 AM' },
    { id: 4, from: 'patient',   text: 'Should I book a follow-up sooner?', time: '11:04 AM' },
  ],
  2: [
    { id: 1, from: 'patient', text: 'When can I start running again?', time: '09:30 AM' },
  ],
  3: [],
};

export default function PatientChat() {
  const [activeId, setActiveId]   = useState(1);
  const [input, setInput]         = useState('');
  const [chats, setChats]         = useState(MESSAGES);
  const [unreadMap, setUnreadMap] = useState({ 1: 2, 2: 1, 3: 0 });

  const selectPatient = (id) => {
    setActiveId(id);
    setUnreadMap(u => ({ ...u, [id]: 0 })); // mark as read
  };

  const active = PATIENTS.find(p => p.id === activeId);
  const msgs   = chats[activeId] || [];
  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);



  const send = () => {
    if (!input.trim()) return;
    setChats(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), { id: Date.now(), from: 'therapist', text: input.trim(), time: 'Just now' }] }));
    setInput('');
  };

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

      <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 220px)', minHeight: 480, display: 'flex' }}>
        {/* Patient list */}
        <div style={{ width: 260, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #e2e8f0' }}>
            <input type="text" placeholder="Search patients…" className="form-input" style={{ fontSize: '0.85rem', padding: '0.5rem 0.875rem' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {PATIENTS.map(p => (
              <div
                key={p.id}
                onClick={() => selectPatient(p.id)}
                style={{
                  display: 'flex', gap: '0.75rem', padding: '0.875rem 1rem', cursor: 'pointer',
                  background: activeId === p.id ? '#eff6ff' : 'white',
                  borderBottom: '1px solid #f1f5f9', borderLeft: activeId === p.id ? '3px solid #2563eb' : '3px solid transparent'
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
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.97rem' }}>{active?.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{active?.condition}</div>
            </div>
            <button className="btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
              <Plus size={13} /> Add Clinical Note
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {msgs.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem', marginTop: '2rem' }}>No messages yet. Start the conversation.</div>
            )}
            {msgs.map(m => (
              <div key={m.id} style={{ maxWidth: '75%', alignSelf: m.from === 'therapist' ? 'flex-end' : 'flex-start' }}>
                <div style={{ background: m.from === 'therapist' ? '#2563eb' : 'white', color: m.from === 'therapist' ? 'white' : '#0f172a', padding: '0.75rem 1rem', borderRadius: m.from === 'therapist' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', fontSize: '0.88rem', lineHeight: 1.5, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: m.from === 'patient' ? '1px solid #e2e8f0' : 'none' }}>
                  {m.text}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem', textAlign: m.from === 'therapist' ? 'right' : 'left' }}>{m.time}</div>
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
            />
            <button className="btn-primary" onClick={send} style={{ padding: '0 1rem', flexShrink: 0 }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
