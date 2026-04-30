import React, { useState } from 'react';
import {
  DollarSign, RefreshCcw, CheckCircle, Clock, XCircle,
  Search, Download, ChevronDown, AlertTriangle, CreditCard
} from 'lucide-react';

/* ── Demo Data ── */
const TRANSACTIONS = [
  { id: 'TXN-001', date: '2026-04-11', patient: 'John Doe',   service: 'Initial Assessment',             amount: 3500,  method: 'Card',        status: 'paid'    },
  { id: 'TXN-002', date: '2026-04-11', patient: 'Jane Roe',   service: 'Follow-up Session',              amount: 2200,  method: 'Card',        status: 'paid'    },
  { id: 'TXN-003', date: '2026-04-11', patient: 'Ali Hassan', service: 'Short Wave Diathermy',           amount: 2800,  method: 'Cash',        status: 'pending' },
  { id: 'TXN-004', date: '2026-04-10', patient: 'Maria G.',   service: 'Post-Natal Recovery',            amount: 2500,  method: 'Card',        status: 'refunded'},
  { id: 'TXN-005', date: '2026-04-10', patient: 'David Lee',  service: 'Chest Physiotherapy & Drainage', amount: 4000,  method: 'Bank Transfer',status: 'paid'   },
  { id: 'TXN-006', date: '2026-04-09', patient: 'Sara Peiris',service: 'Rehabilitation Programme',       amount: 3000,  method: 'Card',        status: 'paid'    },
  { id: 'TXN-007', date: '2026-04-09', patient: 'Nimal Silva', service: 'Follow-up Session',             amount: 2200,  method: 'Cash',        status: 'failed'  },
];

const STATUS_MAP = {
  paid:     { cls: 'badge-green',  label: 'Paid',     Icon: CheckCircle },
  pending:  { cls: 'badge-amber',  label: 'Pending',  Icon: Clock },
  refunded: { cls: 'badge-purple', label: 'Refunded', Icon: RefreshCcw },
  failed:   { cls: 'badge-red',    label: 'Failed',   Icon: XCircle },
};

function RefundModal({ txn, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState(txn.amount);
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title">Process Refund</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '0.875rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.87rem', color: '#92400e' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          Refunds are processed back to the original payment method within 3–5 business days.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div className="form-label">Transaction</div>
            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600 }}>
              {txn.id} — {txn.patient} — {txn.service}
            </div>
          </div>

          <div>
            <label className="form-label">Refund Amount (LKR)</label>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={e => setAmount(Math.min(+e.target.value, txn.amount))}
              max={txn.amount}
            />
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
              Maximum refundable: LKR {txn.amount.toLocaleString()}
            </div>
          </div>

          <div>
            <label className="form-label">Reason for Refund</label>
            <select className="form-input" value={reason} onChange={e => setReason(e.target.value)}>
              <option value="">Select a reason…</option>
              <option>Appointment cancelled by clinic</option>
              <option>Duplicate payment</option>
              <option>Patient dissatisfied with service</option>
              <option>Therapist unavailable</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={() => reason && onConfirm(txn.id, amount, reason)}
            style={{ background: '#ef4444' }}
            disabled={!reason}
          >
            <RefreshCcw size={14} /> Confirm Refund
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Payments() {
  const [txns,      setTxns]      = useState(TRANSACTIONS);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('all');
  const [refundTxn, setRefundTxn] = useState(null);

  const filtered = txns.filter(t => {
    const matchSearch = t.patient.toLowerCase().includes(search.toLowerCase()) ||
      t.service.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.status === filter;
    return matchSearch && matchFilter;
  });

  const totalRevenue  = txns.filter(t => t.status === 'paid').reduce((a, t) => a + t.amount, 0);
  const totalRefunded = txns.filter(t => t.status === 'refunded').reduce((a, t) => a + t.amount, 0);
  const totalPending  = txns.filter(t => t.status === 'pending').reduce((a, t) => a + t.amount, 0);

  const handleRefund = (id) => {
    setTxns(prev => prev.map(t => t.id === id ? { ...t, status: 'refunded' } : t));
    setRefundTxn(null);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments & Refunds</h1>
          <p className="page-subtitle">Track all transactions, collect outstanding payments, and process refunds.</p>
        </div>
        <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
        {[
          { label: 'Collected Revenue',  value: `LKR ${totalRevenue.toLocaleString()}`,  sub: `${txns.filter(t=>t.status==='paid').length} transactions`,    color: '#10b981', Icon: DollarSign },
          { label: 'Pending Collection', value: `LKR ${totalPending.toLocaleString()}`,  sub: `${txns.filter(t=>t.status==='pending').length} awaiting`,       color: '#f59e0b', Icon: Clock },
          { label: 'Total Refunded',     value: `LKR ${totalRefunded.toLocaleString()}`, sub: `${txns.filter(t=>t.status==='refunded').length} refunded`,      color: '#8b5cf6', Icon: RefreshCcw },
          { label: 'Failed Payments',    value: txns.filter(t=>t.status==='failed').length, sub: 'require follow-up',                                            color: '#ef4444', Icon: XCircle },
        ].map(({ label, value, sub, color, Icon }) => (
          <div key={label} className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{value}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>{sub}</div>
              </div>
              <div style={{ background: `${color}18`, padding: '0.6rem', borderRadius: 10 }}>
                <Icon size={18} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
        <div className="filter-row">
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search patient, service, or ID…"
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-pills">
            {['all', 'paid', 'pending', 'refunded', 'failed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.45rem 0.875rem',
                  borderRadius: 99,
                  border: '1.5px solid',
                  borderColor: filter === f ? '#2563eb' : '#e2e8f0',
                  background: filter === f ? '#eff6ff' : 'white',
                  color: filter === f ? '#2563eb' : '#64748b',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Patient</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const s = STATUS_MAP[t.status];
                return (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#475569' }}>{t.id}</td>
                    <td style={{ color: '#64748b', fontSize: '0.88rem' }}>{t.date}</td>
                    <td style={{ fontWeight: 600 }}>{t.patient}</td>
                    <td style={{ color: '#475569', fontSize: '0.88rem' }}>{t.service}</td>
                    <td style={{ fontWeight: 700 }}>LKR {t.amount.toLocaleString()}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: '#475569' }}>
                        <CreditCard size={12} /> {t.method}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${s.cls}`}>{s.label}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
                        {t.status === 'pending' && (
                          <button
                            className="btn-primary"
                            style={{ padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}
                            onClick={() => setTxns(prev => prev.map(x => x.id === t.id ? { ...x, status: 'paid' } : x))}
                          >
                            Mark Paid
                          </button>
                        )}
                        {t.status === 'paid' && (
                          <button
                            onClick={() => setRefundTxn(t)}
                            style={{ padding: '0.3rem 0.7rem', fontSize: '0.78rem', background: 'none', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 6, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <RefreshCcw size={11} /> Refund
                          </button>
                        )}
                        {t.status === 'failed' && (
                          <button
                            className="btn-ghost"
                            style={{ padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}
                          >
                            Retry
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No transactions match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {refundTxn && (
        <RefundModal
          txn={refundTxn}
          onClose={() => setRefundTxn(null)}
          onConfirm={(id) => handleRefund(id)}
        />
      )}
    </div>
  );
}
