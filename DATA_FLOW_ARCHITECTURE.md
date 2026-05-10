# Physiobook Data Flow Architecture

## User Authentication & Data Loading Flow

### 1️⃣ LOGIN FLOW
```
User enters credentials
    ↓
POST /auth/login
    ↓
Backend validates email + password
    ↓
Backend returns:
{
  token: "jwt_token",
  user: {
    id, firstName, lastName, email, phone,
    role: "patient|clinic_admin|therapist|super_admin",
    clinic_id (if applicable),
    avatar, created_at
  }
}
    ↓
Frontend stores token in memory (tokenStore)
    ↓
Frontend validates role is valid: [patient, clinic_admin, therapist, super_admin]
    ↓
Frontend routes user to dashboard based on role:
  patient → /book
  clinic_admin → /clinic
  therapist → /therapist
  super_admin → /superadmin
```

---

## 2️⃣ CLINIC ADMIN WORKFLOW

```
┌─────────────────────────────────────────────────────────┐
│              CLINIC ADMIN DASHBOARD (/clinic)           │
└─────────────────────────────────────────────────────────┘
                         ↓
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    Overview          Services          Staff
    (/clinic/)        (/clinic/...)     (/clinic/...)
        ↓                ↓                ↓
   ┌────────────┐  ┌──────────────┐  ┌──────────────┐
   │ Dashboard  │  │  Services    │  │ Staff Mgmt   │
   │ Stats      │  │  Equipment   │  │ Availability │
   │ Bookings   │  │  Packages    │  │              │
   └────────────┘  └──────────────┘  └──────────────┘
   Calls:          Calls:            Calls:
   - GET /        - GET /clinic/    - GET /clinic/
     dashboard/     services          staff
     stats        - GET /clinic/    - GET /staff/:id/
   - GET /          equipment        availability
     bookings/    - GET /clinic/    - PUT /staff/:id/
     today          packages          availability
                  - POST/PATCH/     - POST /clinic/
   Account        DELETE endpoints    staff
   (/clinic/                       - DELETE /clinic/
   account)                          staff/:id
   ↓
   User Profile
   Team Members
   Settings
   Calls:
   - GET /users/me
   - GET /clinic/team
   - GET /clinic/settings
   - POST /clinic/team/invite
   - DELETE /clinic/team/:id
   - PATCH /clinic/team/:id
   - PUT /clinic/settings
```

### Data Required for Clinic Admin at Page Load

| Page | Endpoint(s) | Data Returned | Used For |
|------|-----------|---------------|----------|
| **Dashboard** | `/dashboard/stats`<br>`/bookings/today` | Revenue, appointments, therapists, rating<br>List of today's bookings | Show KPIs and today's schedule |
| **Services** | `/clinic/services`<br>`/clinic/equipment`<br>`/clinic/packages` | List of services<br>List of equipment<br>List of packages | Create/edit/delete services, equipment, packages |
| **Staff** | `/clinic/staff` | List of staff with specialization, rating, availability | Add/manage physiotherapist staff and their schedules |
| **Account** | `/users/me`<br>`/clinic/team` | Current user profile<br>List of team members | Display profile and manage team access |
| **Settings** | `/clinic/settings` | Clinic name, email, phone, address, notifications, hours | Edit clinic configuration and notification preferences |

---

## 3️⃣ THERAPIST WORKFLOW

```
┌─────────────────────────────────────────────────────────┐
│              THERAPIST DASHBOARD (/therapist)           │
└─────────────────────────────────────────────────────────┘
                         ↓
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    Schedule          Patients         Session Notes
   (/therapist/)    (/therapist/...)  (/therapist/...)
        ↓                ↓                ↓
   ┌────────────┐  ┌──────────────┐  ┌──────────────┐
   │ Today's    │  │ Patient List │  │ Session      │
   │ Appts      │  │ Chat         │  │ Notes        │
   │ Stats      │  │              │  │              │
   │ Availability│  │              │  │              │
   └────────────┘  └──────────────┘  └──────────────┘
   Calls:          Calls:            Calls:
   - GET /        - GET /therapist/ - GET /therapist/
     bookings/      patients         sessions
     my?date=    - Chat API       - POST /therapist/
     today                          sessions
   - GET /        - Others         - PATCH /
     bookings/                        therapist/
     my/stats                        sessions/:id
   - GET /staff/
     me/
     availability
   - PUT /staff/
     me/
     availability
```

### Data Required for Therapist at Page Load

| Page | Endpoint(s) | Data Returned | Used For |
|------|-----------|---------------|----------|
| **Schedule** | `/bookings/my?date=today`<br>`/bookings/my/stats`<br>`/staff/me/availability` | Today's appointments<br>Session stats (today, week, month, total)<br>My availability schedule | Show today's schedule, statistics, and manage availability |
| **Patients** | `/therapist/patients` | List of assigned patients with contact info | View patient list and communicate |
| **Session Notes** | `/therapist/sessions` | List of past sessions | Create/view session notes |

---

## 4️⃣ PATIENT WORKFLOW

```
┌─────────────────────────────────────────────────────────┐
│         PATIENT BOOKING (/book & related)               │
└─────────────────────────────────────────────────────────┘
                         ↓
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    Browse            My Bookings     Feedback
   Clinics         (/book/...)       (/book/...)
        ↓                ↓                ↓
   ┌────────────┐  ┌──────────────┐  ┌──────────────┐
   │ Clinic     │  │ My Bookings  │  │ Rate        │
   │ Selection  │  │ List         │  │ Therapist   │
   │ Services   │  │ Status       │  │ & Service   │
   │ Booking    │  │ Cancel       │  │              │
   └────────────┘  └──────────────┘  └──────────────┘
   Calls:          Calls:            Calls:
   - GET /        - GET /bookings/  - POST /
     clinics       my               bookings/:id/
   - GET /        - POST /bookings  feedback
     clinics/:id/  - PATCH /
     services      bookings/:id
   - GET /        - DELETE /
     clinics/:id/  bookings/:id
     packages
   - POST /
     bookings
```

### Data Required for Patient at Page Load

| Page | Endpoint(s) | Data Returned | Used For |
|------|-----------|---------------|----------|
| **Browse Clinics** | `/clinics`<br>`/clinics/:id/services`<br>`/clinics/:id/packages` | List of all clinics<br>Services offered<br>Packages available | Browse and select clinic, view services, make booking |
| **My Bookings** | `/bookings/my` | List of patient's bookings with status | View upcoming appointments and history |
| **Feedback** | `/bookings/:id` | Booking details | Submit review and rating |

---

## 5️⃣ SUPER ADMIN WORKFLOW

```
┌─────────────────────────────────────────────────────────┐
│         SUPER ADMIN DASHBOARD (/superadmin)             │
└─────────────────────────────────────────────────────────┘
                         ↓
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    Overview         Subscriptions      Tickets
  (/superadmin/)   (/superadmin/...)  (/superadmin/...)
        ↓                ↓                ↓
   ┌────────────┐  ┌──────────────┐  ┌──────────────┐
   │ System     │  │ All Clinic   │  │ Support      │
   │ Stats      │  │ Plans        │  │ Tickets      │
   │ All Clinics│  │ Subscriptions│  │ Issues       │
   │ Violations │  │ Status       │  │              │
   │ Alerts     │  │              │  │              │
   └────────────┘  └──────────────┘  └──────────────┘
   Calls:          Calls:            Calls:
   - GET /admin/  - GET /admin/    - GET /admin/
     stats         subscriptions      tickets
   - GET /admin/  - POST /admin/   - PATCH /admin/
     clinics       subscriptions/    tickets/:id
   - GET /admin/   :id/suspend
     violations  - Others
   - GET /admin/
     alerts
   - PATCH /admin/
     violations/:id/
     resolve
```

### Data Required for Super Admin at Page Load

| Page | Endpoint(s) | Data Returned | Used For |
|------|-----------|---------------|----------|
| **Overview** | `/admin/stats`<br>`/admin/clinics`<br>`/admin/violations`<br>`/admin/alerts` | System-wide stats<br>List of all clinics<br>Compliance violations<br>System alerts | Monitor system health and clinic status |
| **Subscriptions** | `/admin/subscriptions` | All clinic subscriptions, plans, status | Manage subscription plans and renewals |
| **Tickets** | `/admin/tickets` | Support tickets from clinics | Manage customer support |

---

## 🔄 SESSION RESTORATION FLOW

When user refreshes page or reopens app:

```
App mounts
    ↓
AuthContext useEffect runs
    ↓
POST /auth/refresh (with httpOnly refresh cookie)
    ↓
Backend validates refresh token
    ↓
Backend returns:
{
  token: "new_jwt_token",
  user: {
    id, firstName, lastName, email,
    role, clinic_id, avatar, created_at
  }
}
    ↓
Frontend stores new token in memory
    ↓
GET /users/me to fetch latest profile
    ↓
User remains logged in, session restored
    ↓
Dashboard component loads role-specific data
```

---

## ⚠️ Error Handling Flow

```
Page component mounts
    ↓
useEffect hooks call API endpoints
    ↓
API returns data OR error
    ↓
IF SUCCESS:
  ├─ setLoading(false)
  ├─ setData(response)
  └─ Render data
    ↓
IF ERROR:
  ├─ setLoading(false)
  ├─ setError("Failed to load dashboard.")
  └─ Show red error box
    ↓
User sees: "Failed to load dashboard."
    ↓
SOLUTION: Check backend API
  ├─ Is endpoint returning correct status code (200)?
  ├─ Does response have all required fields?
  ├─ Are field names spelled correctly?
  ├─ Are data types correct (number vs string)?
  └─ Is Authorization header being sent?
```

---

## 📊 Data Dependency Tree

```
LOGIN
  ↓
JWT Token stored
  ↓
GET /users/me
  ↓
  ├─ role = "clinic_admin"
  │  ↓
  │  └─ /clinic/dashboard
  │     ├─ GET /dashboard/stats
  │     ├─ GET /bookings/today
  │     ├─ GET /clinic/settings
  │     ├─ GET /clinic/services
  │     ├─ GET /clinic/equipment
  │     ├─ GET /clinic/packages
  │     ├─ GET /clinic/staff
  │     ├─ GET /clinic/team
  │     └─ GET /users/me (for profile)
  │
  ├─ role = "therapist"
  │  ↓
  │  └─ /therapist/schedule
  │     ├─ GET /bookings/my?date=today
  │     ├─ GET /bookings/my/stats
  │     ├─ GET /staff/me/availability
  │     └─ GET /therapist/patients
  │
  ├─ role = "patient"
  │  ↓
  │  └─ /book (patient booking)
  │     ├─ GET /clinics
  │     ├─ GET /clinics/:id/services
  │     ├─ GET /clinics/:id/packages
  │     └─ GET /bookings/my
  │
  └─ role = "super_admin"
     ↓
     └─ /superadmin/overview
        ├─ GET /admin/stats
        ├─ GET /admin/clinics
        ├─ GET /admin/violations
        ├─ GET /admin/alerts
        ├─ GET /admin/subscriptions
        └─ GET /admin/tickets
```

---

## 🎯 Critical Success Factors

### For Backend Team:
1. ✅ All endpoints return correct HTTP status codes (200 for success)
2. ✅ All required fields present in response
3. ✅ All field names match specification exactly
4. ✅ All data types correct (number, string, boolean, object, array)
5. ✅ All timestamps in ISO 8601 format
6. ✅ JWT token validation working on all endpoints

### For Frontend Team:
1. ✅ All API calls use correct endpoint URLs
2. ✅ All error states handled with user-friendly messages
3. ✅ Loading states shown while fetching data
4. ✅ Console logs show API responses for debugging
5. ✅ Browser DevTools Network tab shows successful requests

---

## 🚀 Deployment Readiness Checklist

- [ ] Backend: All 5 Priority 1 endpoints returning correct data
- [ ] Backend: All 11 Priority 2 endpoints returning correct data
- [ ] Backend: All 6 Priority 3 endpoints returning correct data
- [ ] Frontend: All pages loading without "Failed to load" errors
- [ ] Testing: Manual testing of all 4 role dashboards
- [ ] Testing: Session restoration works (page refresh)
- [ ] Testing: Error handling displays correct messages
- [ ] Documentation: Backend team has copy of this specification
- [ ] Monitoring: Error tracking enabled in production
- [ ] Monitoring: API response times tracked

---

**Created:** January 2025  
**For:** Physiobook Frontend & Backend Teams  
**Last Updated:** January 2025
