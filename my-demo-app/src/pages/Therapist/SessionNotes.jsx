import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, CheckCircle, PlusCircle, Clock, User, Save, X } from 'lucide-react';

const ACTIVE_BOOKING = {
  patient: 'Rangi Perera',
  service: 'Lower Back Rehabilitation',
  time: '10:00 AM – 11:00 AM',
  sessionNumber: 3,
  totalSessions: 8,
};

const SAVED_NOTES = [
  { id: 1, title: 'Initial Assessment', content: 'Patient reports L4/L5 disc issue. Pain score 7/10. Limited flexion.', date: '1 Apr 2024' },
  { id: 2, title: 'Session 2 Progress', content: 'Pain score reduced to 5/10. Added resistance exercises. Good compliance.', date: '8 Apr 2024' },
];

export default function SessionNotes() {
  const [sessionState, setSessionState] = useState('idle'); // idle | active | complete
  const [notes, setNotes] = useState(SAVED_NOTES);
  const [showAdd, setShowAdd] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const saveNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    setNotes(n => [...n, { id: Date.now(), title: noteTitle, content: noteContent, date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }]);
    setNoteTitle(''); setNoteContent('');
    setShowAdd(false);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 740, margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 0.25rem', fontWeight: 800, color: '#0f172a', fontSize: '1.4rem' }}>Session Notes</h2>
      <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>Document clinical findings and complete sessions.</p>

      {/* Active Booking Card */}
      <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: 16, padding: '1.5rem', color: '#fff', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Session</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{ACTIVE_BOOKING.patient}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.2rem' }}>{ACTIVE_BOOKING.service}</div>
            <div style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.4rem' }}><Clock size={13} style={{ display: 'inline', marginRight: 4 }} />{ACTIVE_BOOKING.time} &nbsp;·&nbsp; Session {ACTIVE_BOOKING.sessionNumber} of {ACTIVE_BOOKING.totalSessions}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sessionState === 'idle' && (
              <button onClick={() => setSessionState('active')} style={{ padding: '0.7rem 1.25rem', background: '#fff', color: '#7c3aed', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                ▶ Begin Session
              </button>
            )}
            {sessionState === 'active' && (
              <button onClick={() => setSessionState('complete')} style={{ padding: '0.7rem 1.25rem', background: '#10b981', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                <CheckCircle size={14} style={{ display: 'inline', marginRight: 4 }} />Session Completed
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

      {/* Add Note Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>Clinical Notes</h3>
        <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
          <PlusCircle size={15} /> Add Note
        </button>
      </div>

      {/* Add Note Form */}
      {showAdd && (
        <div style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '1rem', border: '1.5px solid #ede9fe' }}>
          <input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Note title…" style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.92rem', marginBottom: '0.75rem', outline: 'none', boxSizing: 'border-box' }} />
          <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Clinical observation, treatment applied, patient response…" rows={4} style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.92rem', resize: 'vertical', outline: 'none', marginBottom: '0.75rem', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowAdd(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 1rem', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}><X size={14} /> Cancel</button>
            <button onClick={saveNote} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 1.25rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}><Save size={14} /> Save Note</button>
          </div>
        </div>
      )}

      {/* Notes List */}
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
    </div>
  );
}
