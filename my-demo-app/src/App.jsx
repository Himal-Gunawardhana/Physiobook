import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import './styles/global.css';

// Auth
import Login    from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Patient
import ClinicLanding from './pages/Patient/ClinicLanding';
import SelectTime    from './pages/Patient/SelectTime';
import Checkout      from './pages/Patient/Checkout';

// Clinic Admin
import ClinicAdminDashboard from './pages/ClinicAdmin/Dashboard';
import ClinicAdminStaff     from './pages/ClinicAdmin/StaffManagement';
import ClinicAdminServices  from './pages/ClinicAdmin/Services';
import ClinicAdminSettings  from './pages/ClinicAdmin/Settings';
import ClinicAdminPayments  from './pages/ClinicAdmin/Payments';
import ClinicAdminBookingPage from './pages/ClinicAdmin/BookingPage';
import ClinicAdminAccount   from './pages/ClinicAdmin/Account';

// Therapist
import TherapistSchedule from './pages/Therapist/Schedule';
import TherapistChat     from './pages/Therapist/PatientChat';

// Super Admin
import SuperAdminOverview from './pages/SuperAdmin/Overview';

// Home
import Home from './pages/Home';

/* ── Shared demo clinics controlled by the Admin layout ── */
const DEMO_CLINICS = [
  { id: 'c1', name: 'Elite Physio — Downtown' },
  { id: 'c2', name: 'Elite Physio — North Branch' },
];

function DashboardLayout({ role }) {
  const [activeClinic,   setActiveClinic]   = useState(DEMO_CLINICS[0]);
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Overlay (mobile) */}
      <div
        className={`menu-overlay ${isSidebarOpen ? 'overlay-open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        role={role}
        activeClinic={activeClinic}
        setActiveClinic={setActiveClinic}
        clinics={DEMO_CLINICS}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Mobile top bar */}
        <header className="mobile-header">
          <button
            className="menu-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="mobile-header-title">Physiobook</span>
          {role === 'clinic' && (
            <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: 'auto', maxWidth: '140px', overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeClinic.name}
            </span>
          )}
        </header>

        {/* Page content */}
        <main className="dashboard-content">
          <Outlet context={{ activeClinic }} />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"         element={<Home />} />

        {/* Auth */}
        <Route path="/login/:role"    element={<Login />} />
        <Route path="/register/:role" element={<Register />} />

        {/* Patient public flow */}
        <Route path="/book"          element={<ClinicLanding />} />
        <Route path="/book/time"     element={<SelectTime />} />
        <Route path="/book/checkout" element={<Checkout />} />

        {/* Clinic Admin */}
        <Route path="/clinic" element={<DashboardLayout role="clinic" />}>
          <Route index              element={<ClinicAdminDashboard />} />
          <Route path="staff"       element={<ClinicAdminStaff />} />
          <Route path="services"    element={<ClinicAdminServices />} />
          <Route path="payments"    element={<ClinicAdminPayments />} />
          <Route path="booking-page" element={<ClinicAdminBookingPage />} />
          <Route path="account"     element={<ClinicAdminAccount />} />
          <Route path="settings"    element={<ClinicAdminSettings />} />
        </Route>

        {/* Therapist */}
        <Route path="/therapist" element={<DashboardLayout role="therapist" />}>
          <Route index      element={<TherapistSchedule />} />
          <Route path="chat" element={<TherapistChat />} />
        </Route>

        {/* Super Admin */}
        <Route path="/superadmin" element={<DashboardLayout role="superadmin" />}>
          <Route index element={<SuperAdminOverview />} />
        </Route>
      </Routes>
    </Router>
  );
}
