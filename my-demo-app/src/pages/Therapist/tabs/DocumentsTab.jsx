import React, { useState, useEffect } from 'react';
import { Upload, FileText, Eye, EyeOff, Loader, AlertCircle, Download } from 'lucide-react';
import api from '../../../lib/api';

const DOC_CATEGORIES = [
  { value: 'referral',    label: 'Referral Letter' },
  { value: 'report',      label: 'Medical Report' },
  { value: 'prescription',label: 'Prescription' },
  { value: 'scan_image',  label: 'Scan / Image' },
  { value: 'consent',     label: 'Consent Form' },
  { value: 'other',       label: 'Other' },
];

const CAT_COLORS = {
  referral: '#dbeafe', report: '#ede9fe', prescription: '#dcfce7',
  scan_image: '#fef3c7', consent: '#fce7f3', other: '#f1f5f9',
};

export default function DocumentsTab({ episode, clinicId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ category: 'other', description: '', is_patient_visible: false });
  const [file, setFile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get(`/records/episodes/${episode.id}/documents`);
        setDocuments(data.documents || []);
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, [episode.id]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleUpload = async () => {
    if (!file) { setError('Please select a file'); return; }
    setUploading(true); setError('');
    try {
      // For MVP, send file metadata. In production, use FormData + multer on backend.
      const doc = await api.post(`/records/episodes/${episode.id}/documents`, {
        clinicId,
        file_name: file.name,
        file_url: URL.createObjectURL(file), // placeholder — replace with S3 URL in production
        file_size_bytes: file.size,
        mime_type: file.type,
        ...form,
      });
      setDocuments(d => [doc, ...d]);
      setFile(null);
      setForm({ category: 'other', description: '', is_patient_visible: false });
    } catch (err) { setError(err?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const toggleVisibility = async (doc) => {
    try {
      const updated = await api.patch(`/records/documents/${doc.id}/visibility`, {
        is_patient_visible: !doc.is_patient_visible, clinicId,
      });
      setDocuments(ds => ds.map(d => d.id === doc.id ? { ...d, is_patient_visible: updated.is_patient_visible } : d));
    } catch (err) { setError(err?.message || 'Failed to update visibility'); }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.75rem 1rem', color: '#991b1b', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={16} /> {error}</div>}

      {/* Upload Form */}
      <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: 14, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={16} /> Upload Document
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>Select File</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={e => setFile(e.target.files[0])}
              style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>Category</label>
            <select value={form.category} onChange={set('category')} style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', background: '#fff' }}>
              {DOC_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>Description</label>
          <input value={form.description} onChange={set('description')} placeholder="Optional document description…"
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#374151', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_patient_visible} onChange={e => setForm(f => ({ ...f, is_patient_visible: e.target.checked }))} />
            <Eye size={14} /> Visible to patient
          </label>
          <button onClick={handleUpload} disabled={uploading || !file}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', background: file ? '#2563eb' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: file ? 'pointer' : 'not-allowed' }}>
            {uploading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
            Upload
          </button>
        </div>
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', border: '1.5px dashed #e2e8f0', borderRadius: 12 }}>
          <FileText size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
          <p style={{ margin: 0 }}>No documents uploaded yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {documents.map(doc => {
            const catConfig = DOC_CATEGORIES.find(c => c.value === doc.category);
            return (
              <div key={doc.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: CAT_COLORS[doc.category] || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={18} color="#2563eb" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.file_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                      {catConfig?.label} · {doc.uploader_first} {doc.uploader_last} · {new Date(doc.created_at).toLocaleDateString('en-LK')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => toggleVisibility(doc)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.7rem', background: doc.is_patient_visible ? '#dcfce7' : '#f1f5f9', color: doc.is_patient_visible ? '#166534' : '#64748b', border: 'none', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    {doc.is_patient_visible ? <><Eye size={11} /> Patient Visible</> : <><EyeOff size={11} /> Internal</>}
                  </button>
                  <a href={doc.file_url} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.7rem', background: '#eff6ff', color: '#2563eb', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                    <Download size={11} /> View
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
