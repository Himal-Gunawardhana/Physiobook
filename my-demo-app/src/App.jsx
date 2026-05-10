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

// Test
import TestPage from './pages/TestPage';

function DashboardLayout({ role }) {
  const { user, loading, dashboardRoute } = useAuth();
  const [clinics,        setClinics]        = useState([]);
  const [activeClinic,   setActiveClinic]   = useState(null);
  const [clinicsLoading, setClinicsLoading] = useState(true);
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(false);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to={`/login/${role}`} replace />;
  }

  // Validate user role matches the dashboard they're accessing
  if (!loading && user) {
    // Map role param to expected backend role
    const expectedRoles = {
      clinic: 'clinic_admin',
      therapist: 'therapist',
      superadmin: 'super_admin',
      patient: 'patient',
    };
    const expectedRole = expectedRoles[role];
    
    if (expectedRole && user.role !== expectedRole) {
      console.warn(`User role mismatch. User role: ${user.role}, Expected: ${expectedRole}, Dashboard: ${role}`);
      // Redirect to the user's correct dashboard
      const correctRoute = dashboardRoute || '/';
      return <Navigate to={correctRoute} replace />;
    }
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1rem', color: '#64748b' }}>Loading...</div>
      </div>
    );
  }

  useEffect(() => {
    if (role !== 'clinic' || !user) {
      setClinicsLoading(false);
      return;
    }
    setClinicsLoading(true);
    (async () => {
      try {
        const data = await api.get('/clinics/mine');
        const list = Array.isArray(data) ? data : data?.clinics ?? [];
        setClinics(list);
        if (list.length > 0) setActiveClinic(list[0]);
      } catch {
        // not authorised or no clinics yet — still unblock render
      } finally {
        setClinicsLoading(false);
      }
    })();
  }, [role, user]);

  return (
    <div className="dashboard-layout">
      <div
        className={`menu-overlay ${isSidebarOpen ? 'overlay-open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <Sidebar
        role={role}
        activeClinic={activeClinic}
        setActiveClinic={setActiveClinic}
        clinics={clinics}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <header className="mobile-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <span className="mobile-header-title">Physiobook</span>
          {role === 'clinic' && activeClinic && (
            <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: 'auto', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeClinic.name}
            </span>
          )}
        </header>
        <main className="dashboard-content">
          {clinicsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem', color: '#64748b', gap: '1rem' }}>
              <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
              <span style={{ fontSize: '0.9rem' }}>Loading clinic data…</span>
            </div>
          ) : (
            <Outlet context={{ activeClinic, clinics }} />
          )}
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
