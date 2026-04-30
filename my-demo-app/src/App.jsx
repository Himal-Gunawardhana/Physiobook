import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import './styles/global.css';
import api from './lib/api';
import { useAuth } from './context/AuthContext';

// Auth
import Login    from './pages/Auth/Login';
import Register from './pages/Auth/Register';

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
  const { user } = useAuth();
  const [clinics,       setClinics]       = useState([]);
  const [activeClinic,  setActiveClinic]  = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (role !== 'clinic') return;
    (async () => {
      try {
        const data = await api.get('/clinics/mine');
        const list = Array.isArray(data) ? data : data?.clinics ?? [];
        setClinics(list);
        if (list.length > 0) setActiveClinic(list[0]);
      } catch {
        // If not authorised or no clinics, leave empty
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
