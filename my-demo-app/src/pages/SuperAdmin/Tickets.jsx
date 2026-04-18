import React, { useState } from 'react';
import { MessageSquare, CheckCircle, Clock, AlertCircle, PlusCircle, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

const INIT_TICKETS = [
  { id: 'TKT-001', clinic: 'Elite Physio — Downtown', query: 'Unable to access payment reports for March. Dashboard shows loading indefinitely.', status: 'open', priority: 'high', created: '14 Apr 2024', updates: ['Query received and saved.', 'Ticket opened — assigned to support team.'] },
  { id: 'TKT-002', clinic: 'North Branch Physio', query: 'Staff member account was deactivated accidentally. Need to restore access.', status: 'in_progress', priority: 'medium', created: '12 Apr 2024', updates: ['Query received and saved.', 'Ticket opened.', 'Followed up — checking with admin panel team.'] },
  { id: 'TKT-003', clinic: 'City Center Rehab', query: 'Subscription renewal failed. Payment gateway returned error code 402.', status: 'resolved', priority: 'high', created: '8 Apr 2024', updates: ['Query received.', 'Ticket opened.', 'Followed up with billing team.', 'Issue resolved — subscription renewed manually.'] },
  { id: 'TKT-004', clinic: 'Elite Physio — North Branch', query: 'Fast-track booking page not showing on patient portal after publishing.', status: 'open', priority: 'low', created: '17 Apr 2024', updates: ['Query received and saved.'] },
];

const STATUS_MAP = {
  open:        { label: 'Open',        bg: '#fef3c7', color: '#92400e', icon: <Clock size={11} /> },
  in_progress: { label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8', icon: <AlertCircle size={11} /> },
  resolved:    { label: 'Resolved',    bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={11} /> },
};
const PRIORITY_MAP = {
  high:   { label: 'High',   color: '#ef4444' },
  medium: { label: 'Medium', color: '#f59e0b' },
  low:    { label: 'Low',    color: '#10b981' },
};

const FLOW = ['Query received', 'Query saved', 'Ticket opened', 'Followed up', 'Ticket solved'];

export default function Tickets() {
  const [tickets, setTickets] = useState(INIT_TICKETS);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [newModal, setNewModal] = useState(false);
  const [newForm, setNewForm] = useState({ clinic: '', query: '', priority: 'medium' });

  const advance = (id) => {
    setTickets(ts => ts.map(t => {
      if (t.id !== id) return t;
      const nextUpdates = [...t.updates, FLOW[t.updates.length] || 'Issue resolved.'];
      const newStatus = nextUpdates.length >= 5 ? 'resolved' : nextUpdates.length >= 3 ? 'in_progress' : 'open';
      return { ...t, updates: nextUpdates, status: newStatus };
    }));
  };

  const createTicket = () => {
    if (!newForm.clinic || !newForm.query) return;
    const t = { id: `TKT-${String(tickets.length + 1).padStart(3,'0')}`, clinic: newForm.clinic, query: newForm.query, status: 'open', priority: newForm.priority, created: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), updates: ['Query received and saved.'] };
    setTickets(ts => [t, ...ts]);
    setNewForm({ clinic: '', query: '', priority: 'medium' });
    setNewModal(false);
  };

  const shown = tickets.filter(t => (filter === 'all' || t.status === filter) && (!search || t.clinic.toLowerCase().includes(search.toLowerCase()) || t.query.toLowerCase().includes(search.toLowerCase())));

  return (
    <div style={{ padding: '1rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem', fontWeight: 800, color: '#0f172a', fontSize: '1.4rem' }}>Support Tickets</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Manage clinic queries from received to resolved.</p>
        </div>
        <button onClick={() => setNewModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.2rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
          <PlusCircle size={16} /> New Ticket
        </button>
      </div>

      {/* Stats */}
      {[['Open', tickets.filter(t=>t.status==='open').length, '#fef3c7', '#92400e'],
        ['In Progress', tickets.filter(t=>t.status==='in_progress').length, '#dbeafe', '#1d4ed8'],
        ['Resolved', tickets.filter(t=>t.status==='resolved').length, '#dcfce7', '#166534'],
      ].map(([label, count, bg, color]) => (
        <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: bg, color, borderRadius: 10, padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 700, marginRight: '0.75rem', marginBottom: '1rem' }}>
          {label}: {count}
        </span>
      ))}

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…" style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        {['all', 'open', 'in_progress', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1.5px solid', borderColor: filter === f ? '#f59e0b' : '#e2e8f0', background: filter === f ? '#fef3c7' : '#fff', color: filter === f ? '#92400e' : '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {shown.map(t => {
          const s = STATUS_MAP[t.status];
          const p = PRIORITY_MAP[t.priority];
          const isExp = expanded === t.id;
          return (
            <div key={t.id} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <div style={{ padding: '1.1rem 1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }} onClick={() => setExpanded(isExp ? null : t.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>{t.id}</span>
                    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>{s.icon}{s.label}</span>
                    <span style={{ color: p.color, fontSize: '0.75rem', fontWeight: 700 }}>● {p.label} Priority</span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.88rem', marginBottom: '0.2rem' }}>{t.clinic}</div>
                  <div style={{ color: '#64748b', fontSize: '0.83rem', lineHeight: 1.4 }}>{t.query.slice(0, 80)}{t.query.length > 80 ? '…' : ''}</div>
                </div>
                {isExp ? <ChevronUp size={18} color="#94a3b8" style={{ flexShrink: 0 }} /> : <ChevronDown size={18} color="#94a3b8" style={{ flexShrink: 0 }} />}
              </div>

              {isExp && (
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '1rem 1.25rem', background: '#fafcff' }}>
                  <p style={{ margin: '0 0 1rem', color: '#374151', fontSize: '0.88rem', lineHeight: 1.6 }}>{t.query}</p>

                  {/* Timeline */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Progress Timeline</div>
                    {FLOW.map((step, i) => {
                      const done2 = i < t.updates.length;
                      return (
                        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: done2 ? '#10b981' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {done2 && <CheckCircle size={11} color="#fff" />}
                          </div>
                          <span style={{ fontSize: '0.82rem', color: done2 ? '#0f172a' : '#94a3b8', fontWeight: done2 ? 600 : 400 }}>{step}</span>
                        </div>
                      );
                    })}
                  </div>

                  {t.status !== 'resolved' && (
                    <button onClick={() => advance(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                      <MessageSquare size={14} /> {t.updates.length < 3 ? 'Open Ticket' : t.updates.length < 4 ? 'Follow Up' : 'Mark Solved'}
                    </button>
                  )}
                  <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#94a3b8' }}>Created: {t.created}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Ticket Modal */}
      {newModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 440, width: '100%' }}>
            <h3 style={{ margin: '0 0 1.25rem', color: '#0f172a' }}>Open New Ticket</h3>
            <input value={newForm.clinic} onChange={e => setNewForm(f => ({ ...f, clinic: e.target.value }))} placeholder="Clinic name…" style={{ width: '100%', padding: '0.7rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem', marginBottom: '0.75rem', boxSizing: 'border-box' }} />
            <textarea value={newForm.query} onChange={e => setNewForm(f => ({ ...f, query: e.target.value }))} placeholder="Describe the clinic's query…" rows={4} style={{ width: '100%', padding: '0.7rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical', marginBottom: '0.75rem', boxSizing: 'border-box' }} />
            <select value={newForm.priority} onChange={e => setNewForm(f => ({ ...f, priority: e.target.value }))} style={{ width: '100%', padding: '0.7rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setNewModal(false)} style={{ flex: 1, padding: '0.8rem', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={createTicket} style={{ flex: 1, padding: '0.8rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Create Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
