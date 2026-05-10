import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import './styles/global.css';
import api from './lib/api';
import { useAuth } from './context/AuthContext';

// Auth
import Login       from './pages/Auth/Login';
import Register    from './pages/Auth/Register';
import VerifyEmail    from './pages/Auth/VerifyEmail';
import AcceptInvite  from './pages/Auth/AcceptInvite';

// Patient
import ClinicLanding      from './pages/Patient/ClinicLanding';
import SelectTime         from './pages/Patient/SelectTime';
import Checkout           from './pages/Patient/Checkout';
import BookingGate        from './pages/Patient/BookingGate';
import BookingConfirmation from './pages/Patient/BookingConfirmation';
import Feedback           from './pages/Patient/Feedback';
import MyBookings         from './pages/Patient/MyBookings';

// Clinic Admin
import ClinicAdminDashboard  from './pages/ClinicAdmin/Dashboard';
import ClinicAdminStaff      from './pages/ClinicAdmin/StaffManagement';
import ClinicAdminServices   from './pages/ClinicAdmin/Services';
import ClinicAdminSettings   from './pages/ClinicAdmin/Settings';
import ClinicAdminPayments   from './pages/ClinicAdmin/Payments';
import ClinicAdminBookingPage from './pages/ClinicAdmin/BookingPage';
import ClinicAdminAccount    from './pages/ClinicAdmin/Account';

// Therapist
import TherapistSchedule     from './pages/Therapist/Schedule';
import TherapistChat         from './pages/Therapist/PatientChat';
import TherapistSessionNotes from './pages/Therapist/SessionNotes';

// Super Admin
import SuperAdminOverview      from './pages/SuperAdmin/Overview';
import SuperAdminTickets       from './pages/SuperAdmin/Tickets';
import SuperAdminSubscriptions from './pages/SuperAdmin/Subscriptions';

// Home
import Home from './pages/Home';
import TestPage from './pages/TestPage';

/* ── Clinic Setup Screen ──────────────────────────────────────────────────── */
function ClinicSetupScreen({ user, onCreated }) {
  const [form, setForm] = useState({ name: '', email: user?.email || '', phone: '', address: '', city: '' });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError('Clinic name and email are required.'); return; }
    setSaving(true); setError('');
    try {
      const created = await api.post('/clinics', {
        name: form.name.trim(), email: form.email.trim(),
        phone: form.phone.trim() || undefined, address: form.address.trim() || undefined, city: form.city.trim() || undefined,
      });
      onCreated(created);
    } catch (err) {
      setError(err?.message || 'Failed to create clinic. Please try again.');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 60%, #f5f3ff 100%)', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.12)', padding: '3rem 2.5rem', maxWidth: 520, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem' }}>🏥</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>Set Up Your Clinic</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Welcome, <strong>{user?.first_name || user?.firstName || 'there'}!</strong> Fill in your clinic details to unlock the full dashboard.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.875rem 1rem', color: '#991b1b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Clinic Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input className="form-input" placeholder="e.g. Sunshine Physiotherapy Centre" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="form-label">Clinic Email <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="email" className="form-input" placeholder="clinic@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Phone <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
              <input type="tel" className="form-input" placeholder="+94 77 123 4567" value={form.phone} onChange={set('phone')} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">City <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
              <input className="form-input" placeholder="Colombo" value={form.city} onChange={set('city')} />
            </div>
          </div>
          <div>
            <label className="form-label">Address <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
            <input className="form-input" placeholder="123 Main Street" value={form.address} onChange={set('address')} />
          </div>
          <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem', opacity: saving ? 0.75 : 1 }}>
            {saving ? '⏳ Creating Clinic…' : '🚀 Create My Clinic'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: '#94a3b8' }}>You can edit all clinic details later in Settings.</p>
      </div>
    </div>
  );
}

/* ── Dashboard Layout ─────────────────────────────────────────────────────── */
function DashboardLayout({ role }) {
  const { user, loading, dashboardRoute } = useAuth();
  const [clinics,        setClinics]        = useState([]);
  const [activeClinic,   setActiveClinic]   = useState(null);
  const [clinicsLoading, setClinicsLoading] = useState(true);
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(false);

  if (!loading && !user) return <Navigate to={`/login/${role}`} replace />;

  if (!loading && user) {
    const expectedRoles = { clinic: 'clinic_admin', therapist: 'therapist', superadmin: 'super_admin', patient: 'patient' };
    const expectedRole = expectedRoles[role];
    if (expectedRole && user.role !== expectedRole) return <Navigate to={dashboardRoute || '/'} replace />;
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#64748b' }}>Loading...</div></div>;
  }

  useEffect(() => {
    if (role !== 'clinic' || !user) { setClinicsLoading(false); return; }
    setClinicsLoading(true);
    (async () => {
      try {
        const data = await api.get('/clinics/mine');
        const list = Array.isArray(data) ? data : data?.clinics ?? [];
        setClinics(list);
        if (list.length > 0) setActiveClinic(list[0]);
      } catch { /* no clinics yet */ } finally { setClinicsLoading(false); }
    })();
  }, [role, user]);

  if (clinicsLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#64748b' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span>Loading your clinic…</span>
      </div>
    );
  }

  // No clinic yet — let them create one
  if (role === 'clinic' && !activeClinic) {
    return <ClinicSetupScreen user={user} onCreated={(clinic) => { setClinics([clinic]); setActiveClinic(clinic); }} />;
  }

  return (
    <div className="dashboard-layout">
      <div className={`menu-overlay ${isSidebarOpen ? 'overlay-open' : ''}`} onClick={() => setIsSidebarOpen(false)} />
      <Sidebar role={role} activeClinic={activeClinic} setActiveClinic={setActiveClinic} clinics={clinics} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <header className="mobile-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
          <span className="mobile-header-title">Physiobook</span>
          {role === 'clinic' && activeClinic && (
            <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: 'auto', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeClinic.name}</span>
          )}
        </header>
        <main className="dashboard-content">
          <Outlet context={{ activeClinic, clinics }} />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<TestPage />} />

        {/* Auth */}
        <Route path="/login/:role"    element={<Login />} />
        <Route path="/register/:role" element={<Register />} />
        <Route path="/verify-email"   element={<VerifyEmail />} />
        <Route path="/accept-invite"  element={<AcceptInvite />} />

        {/* Patient public flow */}
        <Route path="/book"              element={<ClinicLanding />} />
        <Route path="/book/register"     element={<BookingGate />} />
        <Route path="/book/time"         element={<SelectTime />} />
        <Route path="/book/checkout"     element={<Checkout />} />
        <Route path="/book/confirmation" element={<BookingConfirmation />} />
        <Route path="/book/feedback"     element={<Feedback />} />
        <Route path="/book/my-bookings"  element={<MyBookings />} />

        {/* Clinic Admin */}
        <Route path="/clinic" element={<DashboardLayout role="clinic" />}>
          <Route index               element={<ClinicAdminDashboard />} />
          <Route path="staff"        element={<ClinicAdminStaff />} />
          <Route path="services"     element={<ClinicAdminServices />} />
          <Route path="payments"     element={<ClinicAdminPayments />} />
          <Route path="booking-page" element={<ClinicAdminBookingPage />} />
          <Route path="account"      element={<ClinicAdminAccount />} />
          <Route path="settings"     element={<ClinicAdminSettings />} />
        </Route>

        {/* Therapist */}
        <Route path="/therapist" element={<DashboardLayout role="therapist" />}>
          <Route index        element={<TherapistSchedule />} />
          <Route path="chat"  element={<TherapistChat />} />
          <Route path="notes" element={<TherapistSessionNotes />} />
        </Route>

        {/* Super Admin (also accessible via /admin shortcut) */}
        <Route path="/superadmin" element={<DashboardLayout role="superadmin" />}>
          <Route index                element={<SuperAdminOverview />} />
          <Route path="tickets"       element={<SuperAdminTickets />} />
          <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
        </Route>
        <Route path="/admin" element={<DashboardLayout role="superadmin" />}>
          <Route index                element={<SuperAdminOverview />} />
          <Route path="tickets"       element={<SuperAdminTickets />} />
          <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
        </Route>

      </Routes>
    </Router>
  );
}
