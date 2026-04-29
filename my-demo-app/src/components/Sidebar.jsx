import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Building2, Users, Settings, Activity,
  Calendar, MessageSquare, PieChart, ShieldCheck,
  Package, X, LogOut, CreditCard, Globe, UserCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ role, activeClinic, setActiveClinic, clinics, isSidebarOpen, setIsSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  let navGroups = [];
  let brand = 'Physiobook';
  let Icon = Activity;
  let brandColor = '#2563eb';

  if (role === 'clinic') {
    Icon = Building2;
    brandColor = '#2563eb';
    navGroups = [
      {
        label: 'Management',
        items: [
          { name: 'Overview',            path: '/clinic',              icon: PieChart,  end: true },
          { name: 'Staff Management',    path: '/clinic/staff',        icon: Users },
          { name: 'Services & Packages', path: '/clinic/services',     icon: Package },
          { name: 'Payments & Refunds',  path: '/clinic/payments',     icon: CreditCard },
          { name: 'Booking Page',        path: '/clinic/booking-page', icon: Globe },
        ],
      },
      {
        label: 'Account',
        items: [
          { name: 'Account & Users', path: '/clinic/account',  icon: UserCircle },
          { name: 'Settings',        path: '/clinic/settings', icon: Settings },
        ],
      },
    ];
  } else if (role === 'therapist') {
    Icon = Activity;
    brandColor = '#8b5cf6';
    navGroups = [
      {
        label: 'Navigation',
        items: [
          { name: 'My Schedule',   path: '/therapist',       icon: Calendar,      end: true },
          { name: 'Session Notes', path: '/therapist/notes', icon: FileText },
          { name: 'Patient Chats', path: '/therapist/chat',  icon: MessageSquare },
        ],
      },
    ];
  } else if (role === 'superadmin') {
    Icon = ShieldCheck;
    brandColor = '#f59e0b';
    navGroups = [
      {
        label: 'Platform',
        items: [
          { name: 'System Overview', path: '/superadmin',               icon: PieChart,      end: true },
          { name: 'Support Tickets', path: '/superadmin/tickets',       icon: MessageSquare },
          { name: 'Subscriptions',   path: '/superadmin/subscriptions', icon: CreditCard },
        ],
      },
    ];
  }

  const close = () => { if (isSidebarOpen) setIsSidebarOpen(false); };

  const handleLogout = async () => {
    close();
    await logout();
    navigate('/');
  };

  return (
    <div className={`dashboard-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>

      {/* Brand */}
      <div className="sidebar-brand" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Icon size={22} color={brandColor} />
          <span style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 800 }}>{brand}</span>
        </div>
        {isSidebarOpen && (
          <button className="menu-btn" onClick={close} aria-label="Close menu">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Clinic Switcher */}
      {role === 'clinic' && activeClinic && (
        <div className="sidebar-clinic-switcher">
          <div className="form-label" style={{ padding: '0 0.25rem', marginBottom: '0.35rem' }}>Active Clinic</div>
          <select
            className="sidebar-clinic-select"
            value={activeClinic.id}
            onChange={(e) => {
              const c = clinics?.find(c => c.id === e.target.value);
              if (c) setActiveClinic(c);
            }}
          >
            {clinics?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation Groups */}
      <nav style={{ flex: 1 }}>
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="sidebar-section-label">{group.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
              {group.items.map(item => {
                const ItemIcon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={close}
                  >
                    <ItemIcon size={17} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {user && (
          <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.5rem', fontSize: '0.82rem', color: '#64748b', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>
              {user.first_name} {user.last_name}
            </div>
            <div style={{ opacity: 0.7 }}>{user.email}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', color: '#ef4444' }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
