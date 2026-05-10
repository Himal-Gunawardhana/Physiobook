# Physiobook Backend Data Requirements - Frontend Implementation Guide

## Overview
This document specifies **exactly what data** the frontend requires from the backend for each user role and page to function properly. Follow these specifications to avoid "Failed to load" errors.

---

## Part 1: User Profile Data (REQUIRED AT LOGIN)

All users receive this data after successful login via `POST /auth/login` and `POST /auth/refresh`:

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+94712345678",
    "role": "clinic_admin",
    "avatar": "https://api.example.com/avatars/john.jpg",
    "clinic_id": "clinic_uuid",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Fields Required:
- **id**: User UUID (unique identifier)
- **firstName**: User's first name (string)
- **lastName**: User's last name (string)
- **email**: User's email address (string)
- **phone**: User's phone number (string, optional)
- **role**: One of `[patient, clinic_admin, therapist, super_admin]`
- **avatar**: URL to user's profile picture (optional but recommended)
- **clinic_id**: Clinic identifier (required for clinic_admin, therapist; null for patient, super_admin)
- **created_at**: ISO timestamp of account creation

---

## Part 2: Role-Specific Data Requirements

### 🏥 CLINIC ADMIN ROLE

#### On Login, call: `GET /users/me`
**Response structure:**
```json
{
  "id": "admin_uuid",
  "firstName": "Admin",
  "lastName": "Name",
  "email": "admin@clinic.com",
  "phone": "+94712345678",
  "role": "clinic_admin",
  "clinic_id": "clinic_uuid",
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Dashboard Page: `GET /clinic/dashboard` or `GET /dashboard/stats`
**Response structure:**
```json
{
  "today_revenue": 45000,
  "today_appointments": 8,
  "active_therapists": 3,
  "avg_rating": 4.7,
  "pending_bookings": 2,
  "total_staff": 5,
  "clinic_status": "active",
  "subscription_status": "active"
}
```
**OR split into two endpoints:**
- `GET /bookings/today` - Returns array of today's bookings
- `GET /dashboard/stats` - Returns stats object above

### Services & Equipment Page: `GET /clinic/services`, `GET /clinic/equipment`, `GET /clinic/packages`
**Services response:**
```json
[
  {
    "id": "service_uuid",
    "name": "Initial Assessment",
    "description": "45-minute evaluation",
    "price": 3500,
    "duration_minutes": 45,
    "active": true,
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

**Equipment response:**
```json
[
  {
    "id": "equipment_uuid",
    "name": "Short Wave Diathermy Unit",
    "quantity": 2,
    "status": "active",
    "purchase_date": "2024-06-15",
    "maintenance_due": "2026-06-15"
  }
]
```

**Packages response:**
```json
[
  {
    "id": "package_uuid",
    "name": "Post-Natal Full Recovery",
    "description": "10 sessions with discount",
    "price": 21250,
    "sessions_count": 10,
    "discount_percent": 15
  }
]
```

### Staff Management Page: `GET /clinic/staff`
**Response structure:**
```json
[
  {
    "id": "staff_uuid",
    "name": "Dr. Priya Sharma",
    "specialization": "Sports Physiotherapy",
    "experience_years": 5,
    "rating": 4.8,
    "status": "available",
    "joining_date": "2023-06-01",
    "qualifications": ["BSc PT", "MSc Sports Rehab"],
    "availability": {
      "Monday": { "start": "09:00", "end": "17:00", "break": "13:00-14:00" },
      "Tuesday": { "start": "09:00", "end": "17:00", "break": "13:00-14:00" },
      ...
    }
  }
]
```

### Account & Users Page: `GET /clinic/team`
**Response structure:**
```json
[
  {
    "id": "user_uuid",
    "name": "Team Member Name",
    "email": "member@clinic.com",
    "role": "therapist",
    "status": "active",
    "last_login": "2025-01-20T15:30:00Z",
    "joined_date": "2025-01-01T10:00:00Z"
  }
]
```

### Settings Page: `GET /clinic/settings`
**Response structure:**
```json
{
  "clinic_id": "clinic_uuid",
  "clinic_name": "Elite Physio Center",
  "clinic_email": "info@elite.com",
  "clinic_phone": "+94712345678",
  "address": "123 Main Street, City",
  "city": "Colombo",
  "postal_code": "00600",
  "country": "Sri Lanka",
  "registration_number": "REG123456",
  "notifications": {
    "booking_email": true,
    "cancellation_alerts": true,
    "daily_summary": false,
    "staff_changes": true,
    "equipment_alerts": true,
    "refund_alerts": true
  },
  "color_theme": "#2563eb",
  "working_hours_start": "09:00",
  "working_hours_end": "18:00"
}
```

---

### 👨‍⚕️ THERAPIST ROLE

#### On Login, call: `GET /users/me`
**Response structure:**
```json
{
  "id": "therapist_uuid",
  "firstName": "Priya",
  "lastName": "Sharma",
  "email": "priya@clinic.com",
  "phone": "+94712345678",
  "role": "therapist",
  "clinic_id": "clinic_uuid",
  "specialization": "Sports Physiotherapy",
  "qualifications": ["BSc PT", "MSc Sports Rehab"],
  "rating": 4.8,
  "created_at": "2023-06-01T10:00:00Z"
}
```

### Schedule Page: `GET /bookings/my?date=today`
**Response structure:**
```json
[
  {
    "id": "booking_uuid",
    "patient_name": "John Doe",
    "patient_phone": "+94712345678",
    "service": "Initial Assessment",
    "appointment_date": "2025-01-21",
    "appointment_time": "10:00",
    "duration_minutes": 45,
    "status": "confirmed",
    "notes": "First time patient, knee pain"
  }
]
```

### Schedule Page: `GET /bookings/my/stats`
**Response structure:**
```json
{
  "today": 4,
  "week": 18,
  "month": 72,
  "total_sessions": 245,
  "avg_rating": 4.8,
  "completion_rate": 98.5
}
```

### Schedule Page: `GET /staff/me/availability`
**Response structure:**
```json
{
  "Monday": {
    "start_time": "09:00",
    "end_time": "17:00",
    "break_start": "13:00",
    "break_end": "14:00",
    "available": true
  },
  "Tuesday": {
    "start_time": "09:00",
    "end_time": "17:00",
    "break_start": "13:00",
    "break_end": "14:00",
    "available": true
  },
  ...
}
```

### Patient Chat Page: `GET /therapist/patients`
**Response structure:**
```json
[
  {
    "id": "patient_uuid",
    "name": "John Doe",
    "phone": "+94712345678",
    "conditions": ["Knee pain", "Osteoarthritis"],
    "last_session": "2025-01-20T14:30:00Z",
    "total_sessions": 12,
    "status": "active"
  }
]
```

### Session Notes Page: `GET /therapist/sessions`
**Response structure:**
```json
[
  {
    "id": "session_uuid",
    "patient_id": "patient_uuid",
    "patient_name": "John Doe",
    "date": "2025-01-20",
    "time": "14:30",
    "duration_minutes": 45,
    "notes": "Patient showed improvement in range of motion...",
    "findings": "ROM improved by 15 degrees",
    "treatment_given": "Manual therapy, exercises",
    "created_at": "2025-01-20T15:30:00Z"
  }
]
```

---

### 👤 PATIENT ROLE

#### On Login, no additional data required immediately
**Profile stored from login:**
```json
{
  "id": "patient_uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+94712345678",
  "role": "patient",
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Booking/Clinic Landing Page: `GET /clinics`
**Response structure:**
```json
[
  {
    "id": "clinic_uuid",
    "name": "Elite Physio Center",
    "email": "info@elite.com",
    "phone": "+94712345678",
    "address": "123 Main Street, Colombo",
    "city": "Colombo",
    "rating": 4.7,
    "reviews_count": 145,
    "is_open": true,
    "working_hours": {
      "start": "09:00",
      "end": "18:00"
    }
  }
]
```

### Services: `GET /clinics/:clinic_id/services`
**Response structure:**
```json
[
  {
    "id": "service_uuid",
    "name": "Initial Assessment",
    "description": "Comprehensive 45-minute evaluation",
    "price": 3500,
    "duration_minutes": 45,
    "therapist_required": true
  }
]
```

### Packages: `GET /clinics/:clinic_id/packages`
**Response structure:**
```json
[
  {
    "id": "package_uuid",
    "name": "Post-Natal Full Recovery",
    "price": 21250,
    "sessions_count": 10,
    "discount_percent": 15
  }
]
```

### My Bookings: `GET /bookings/my`
**Response structure:**
```json
[
  {
    "id": "booking_uuid",
    "clinic_name": "Elite Physio Center",
    "therapist_name": "Dr. Priya Sharma",
    "service_name": "Initial Assessment",
    "appointment_date": "2025-02-01",
    "appointment_time": "10:00",
    "duration_minutes": 45,
    "status": "confirmed",
    "total_price": 3500,
    "notes": ""
  }
]
```

### Feedback Page: `GET /bookings/:booking_id`
**Response structure:**
```json
{
  "id": "booking_uuid",
  "clinic_name": "Elite Physio Center",
  "therapist_name": "Dr. Priya Sharma",
  "service_name": "Initial Assessment",
  "appointment_date": "2025-01-20",
  "appointment_time": "10:00",
  "status": "completed",
  "total_price": 3500,
  "duration_minutes": 45
}
```

---

### 🛡️ SUPER ADMIN ROLE

#### On Login, call: `GET /users/me`
**Response structure:**
```json
{
  "id": "admin_uuid",
  "firstName": "Super",
  "lastName": "Admin",
  "email": "admin@physiobook.com",
  "role": "super_admin",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Overview Page: `GET /admin/stats`
**Response structure:**
```json
{
  "total_clinics": 24,
  "total_users": 456,
  "active_bookings": 78,
  "monthly_revenue": 1250000,
  "system_uptime": 99.8,
  "new_clinics_month": 3,
  "total_therapists": 89
}
```

### Overview Page: `GET /admin/clinics`
**Response structure:**
```json
[
  {
    "id": "clinic_uuid",
    "name": "Elite Physio Center",
    "owner_name": "Dr. John Smith",
    "email": "owner@elite.com",
    "status": "active",
    "subscription_status": "active",
    "subscription_expires": "2025-12-31",
    "therapists_count": 5,
    "total_bookings": 245,
    "monthly_revenue": 125000,
    "created_at": "2023-06-15T00:00:00Z"
  }
]
```

### Overview Page: `GET /admin/violations`
**Response structure:**
```json
[
  {
    "id": "violation_uuid",
    "clinic_id": "clinic_uuid",
    "clinic_name": "Elite Physio Center",
    "violation_type": "unpaid_invoice",
    "severity": "high",
    "description": "Outstanding payment for 3 months",
    "created_at": "2025-01-15T10:30:00Z",
    "resolved": false
  }
]
```

### Overview Page: `GET /admin/alerts`
**Response structure:**
```json
[
  {
    "id": "alert_uuid",
    "type": "system_alert",
    "title": "High server load detected",
    "message": "CPU usage at 85%",
    "severity": "warning",
    "created_at": "2025-01-21T15:30:00Z",
    "resolved": false
  }
]
```

### Subscriptions Page: `GET /admin/subscriptions`
**Response structure:**
```json
[
  {
    "id": "subscription_uuid",
    "clinic_id": "clinic_uuid",
    "clinic_name": "Elite Physio Center",
    "plan": "professional",
    "price": 5000,
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "status": "active",
    "therapists_allowed": 10,
    "therapists_used": 5
  }
]
```

### Tickets/Support Page: `GET /admin/tickets`
**Response structure:**
```json
[
  {
    "id": "ticket_uuid",
    "clinic_id": "clinic_uuid",
    "clinic_name": "Elite Physio Center",
    "subject": "Payment issue",
    "status": "open",
    "priority": "high",
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-21T14:30:00Z"
  }
]
```

---

## Part 3: API Endpoints Summary

### Authentication Endpoints
```
POST   /auth/login              → Login user, return token + user data
POST   /auth/register           → Register new user
POST   /auth/refresh            → Refresh token, return token + user data
POST   /auth/logout             → Logout user
POST   /auth/2fa/verify         → Verify 2FA code
```

### User Profile Endpoints (All Roles)
```
GET    /users/me                → Get logged-in user's profile
PATCH  /users/me                → Update profile
GET    /users/me/avatar         → Get avatar
POST   /users/me/change-password → Change password
```

### Clinic Admin Endpoints
```
GET    /clinic/dashboard        → Dashboard stats
GET    /dashboard/stats         → Alternative stats endpoint
GET    /bookings/today          → Today's bookings
GET    /clinic/settings         → Get clinic settings
PUT    /clinic/settings         → Update clinic settings
GET    /clinic/services         → List services
POST   /clinic/services         → Create service
PATCH  /clinic/services/:id     → Update service
DELETE /clinic/services/:id     → Delete service
GET    /clinic/equipment        → List equipment
POST   /clinic/equipment        → Add equipment
DELETE /clinic/equipment/:id    → Delete equipment
GET    /clinic/packages         → List packages
POST   /clinic/packages         → Create package
PATCH  /clinic/packages/:id     → Update package
DELETE /clinic/packages/:id     → Delete package
GET    /clinic/staff            → List staff
POST   /clinic/staff            → Add staff
PATCH  /clinic/staff/:id        → Update staff
DELETE /clinic/staff/:id        → Remove staff
GET    /staff/:id/availability  → Get staff availability
PUT    /staff/:id/availability  → Update staff availability
GET    /clinic/team             → List team members
POST   /clinic/team/invite      → Invite team member
PATCH  /clinic/team/:id         → Update team member
DELETE /clinic/team/:id         → Remove team member
PATCH  /bookings/:id/confirm    → Confirm booking
```

### Therapist Endpoints
```
GET    /users/me                → Get profile
GET    /bookings/my?date=today  → Get today's appointments
GET    /bookings/my/stats       → Get session statistics
GET    /staff/me/availability   → Get my availability
PUT    /staff/me/availability   → Update my availability
GET    /therapist/patients      → List my patients
GET    /therapist/sessions      → List my sessions
POST   /therapist/sessions      → Create session notes
PATCH  /therapist/sessions/:id  → Update session notes
GET    /bookings/:id/notes      → Get booking notes
```

### Patient Endpoints
```
GET    /users/me                → Get profile
GET    /clinics                 → List all clinics
GET    /clinics/:clinic_id/services   → Get clinic services
GET    /clinics/:clinic_id/packages   → Get clinic packages
GET    /bookings/my             → My bookings
POST   /bookings                → Create booking
PATCH  /bookings/:id            → Update booking
DELETE /bookings/:id            → Cancel booking
POST   /bookings/:id/feedback   → Submit feedback
```

### Super Admin Endpoints
```
GET    /users/me                → Get profile
GET    /admin/stats             → System statistics
GET    /admin/clinics           → All clinics
GET    /admin/violations        → Compliance violations
GET    /admin/alerts            → System alerts
PATCH  /admin/violations/:id/resolve → Resolve violation
GET    /admin/subscriptions     → All subscriptions
POST   /admin/subscriptions/:id/suspend → Suspend subscription
GET    /admin/tickets           → Support tickets
PATCH  /admin/tickets/:id       → Update ticket
```

---

## Part 4: Data Validation Rules

### Required Fields Per Role

**CLINIC ADMIN User:**
- ✅ id, firstName, lastName, email, role, clinic_id
- ✅ Dashboard: today_revenue, today_appointments, active_therapists, avg_rating
- ✅ Services: id, name, price, duration_minutes
- ✅ Equipment: id, name, quantity, status
- ✅ Staff: id, name, specialization, experience_years, status
- ✅ Team: id, name, email, role, status

**THERAPIST User:**
- ✅ id, firstName, lastName, email, role, clinic_id, specialization
- ✅ Appointments: id, patient_name, service, appointment_date, appointment_time, status
- ✅ Availability: Days with start_time, end_time, available flag

**PATIENT User:**
- ✅ id, firstName, lastName, email, role
- ✅ Clinics: id, name, address, rating
- ✅ Bookings: id, clinic_name, therapist_name, service_name, appointment_date, status

**SUPER ADMIN User:**
- ✅ id, firstName, lastName, email, role
- ✅ Stats: total_clinics, total_users, active_bookings, monthly_revenue
- ✅ Clinics: id, name, owner_name, status, subscription_status, therapists_count
- ✅ Violations: id, clinic_id, clinic_name, violation_type, severity, resolved

---

## Part 5: Backend Prompt/Specification

**GIVE THIS PROMPT TO YOUR BACKEND TEAM:**

---

### 📋 BACKEND DATA DELIVERY SPECIFICATION

Dear Backend Team,

Please implement the following API endpoints to support the Physiobook frontend. Each endpoint must return the exact data structure specified below, with all required fields populated. Missing or incorrect data will cause "Failed to load" errors on the frontend.

#### Authentication Response (POST /auth/login, POST /auth/refresh)
When a user logs in or refreshes their session, return:
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string (optional)",
    "role": "one of: patient, clinic_admin, therapist, super_admin",
    "clinic_id": "uuid (required for clinic_admin & therapist, null for others)",
    "avatar": "url (optional)",
    "created_at": "iso_timestamp"
  }
}
```

#### GET /users/me (All Roles)
Return the authenticated user's full profile including role-specific fields:
- **Clinic Admin:** Add clinic_id, clinic_name
- **Therapist:** Add clinic_id, specialization, qualifications, rating
- **Patient:** Keep basic fields only
- **Super Admin:** No additional fields needed

#### GET /clinic/dashboard or GET /dashboard/stats (Clinic Admin)
Return dashboard statistics object:
```json
{
  "today_revenue": "integer (LKR)",
  "today_appointments": "integer",
  "active_therapists": "integer",
  "avg_rating": "float (0-5)",
  "pending_bookings": "integer (optional)",
  "total_staff": "integer (optional)",
  "clinic_status": "string",
  "subscription_status": "string"
}
```

#### GET /bookings/today (Clinic Admin)
Return array of today's bookings:
```json
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "patient_name": "string",
    "patient_phone": "string",
    "service": "string",
    "therapist_name": "string",
    "appointment_date": "date",
    "appointment_time": "time (HH:MM)",
    "duration_minutes": "integer",
    "status": "one of: pending, confirmed, cancelled, completed, in_progress",
    "notes": "string (optional)",
    "total_price": "integer"
  }
]
```

#### GET /clinic/settings (Clinic Admin)
Return clinic configuration and preferences:
```json
{
  "clinic_id": "uuid",
  "clinic_name": "string",
  "clinic_email": "string",
  "clinic_phone": "string",
  "address": "string",
  "city": "string",
  "postal_code": "string",
  "country": "string",
  "registration_number": "string",
  "color_theme": "hex_color",
  "working_hours_start": "time (HH:MM)",
  "working_hours_end": "time (HH:MM)",
  "notifications": {
    "booking_email": "boolean",
    "cancellation_alerts": "boolean",
    "daily_summary": "boolean",
    "staff_changes": "boolean",
    "equipment_alerts": "boolean",
    "refund_alerts": "boolean"
  }
}
```

#### GET /clinic/services, /clinic/equipment, /clinic/packages (Clinic Admin)
Services:
```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "price": "integer",
    "duration_minutes": "integer",
    "active": "boolean",
    "created_at": "iso_timestamp"
  }
]
```

Equipment:
```json
[
  {
    "id": "uuid",
    "name": "string",
    "quantity": "integer",
    "status": "one of: active, maintenance, retired",
    "purchase_date": "date",
    "maintenance_due": "date"
  }
]
```

Packages:
```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "price": "integer",
    "sessions_count": "integer",
    "discount_percent": "integer"
  }
]
```

#### GET /clinic/staff (Clinic Admin)
Return list of staff members with availability:
```json
[
  {
    "id": "uuid",
    "name": "string",
    "specialization": "string",
    "experience_years": "integer",
    "rating": "float (0-5)",
    "qualifications": ["array of strings"],
    "status": "one of: available, on_leave, in_session",
    "joining_date": "date",
    "availability": {
      "Monday": { "start": "09:00", "end": "17:00", "break": "13:00-14:00" },
      "Tuesday": { ... },
      ... (6 more days)
    }
  }
]
```

#### GET /clinic/team (Clinic Admin)
Return team members with access to clinic:
```json
[
  {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "one of: therapist, clinic_admin, staff",
    "status": "one of: active, inactive, pending_invite",
    "last_login": "iso_timestamp (nullable)",
    "joined_date": "iso_timestamp"
  }
]
```

#### POST /clinic/team/invite (Clinic Admin)
Accept request with:
```json
{
  "name": "string",
  "email": "string",
  "role": "string"
}
```
Return created team member object with id.

#### GET /bookings/my?date=today (Therapist)
Return today's appointments for therapist:
```json
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "patient_name": "string",
    "patient_phone": "string",
    "service": "string",
    "appointment_date": "date",
    "appointment_time": "time",
    "duration_minutes": "integer",
    "status": "string",
    "notes": "string (optional)"
  }
]
```

#### GET /bookings/my/stats (Therapist)
Return session statistics:
```json
{
  "today": "integer",
  "week": "integer",
  "month": "integer",
  "total_sessions": "integer",
  "avg_rating": "float",
  "completion_rate": "float (0-100)"
}
```

#### GET /staff/me/availability (Therapist)
Return availability schedule:
```json
{
  "Monday": { "start_time": "09:00", "end_time": "17:00", "break_start": "13:00", "break_end": "14:00", "available": true },
  "Tuesday": { ... },
  ... (6 more days)
}
```

#### GET /clinics (Patient)
Return list of all clinics:
```json
[
  {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "rating": "float (0-5)",
    "reviews_count": "integer",
    "is_open": "boolean",
    "working_hours": {
      "start": "time",
      "end": "time"
    }
  }
]
```

#### GET /clinics/:clinic_id/services (Patient)
Return services offered by clinic:
```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "price": "integer (LKR)",
    "duration_minutes": "integer",
    "therapist_required": "boolean"
  }
]
```

#### GET /bookings/my (Patient)
Return patient's bookings:
```json
[
  {
    "id": "uuid",
    "clinic_name": "string",
    "therapist_name": "string",
    "service_name": "string",
    "appointment_date": "date",
    "appointment_time": "time",
    "duration_minutes": "integer",
    "status": "one of: pending, confirmed, cancelled, completed",
    "total_price": "integer"
  }
]
```

#### GET /admin/stats (Super Admin)
Return system-wide statistics:
```json
{
  "total_clinics": "integer",
  "total_users": "integer",
  "active_bookings": "integer",
  "monthly_revenue": "integer",
  "system_uptime": "float (0-100)",
  "new_clinics_month": "integer",
  "total_therapists": "integer"
}
```

#### GET /admin/clinics (Super Admin)
Return list of all clinics with details:
```json
[
  {
    "id": "uuid",
    "name": "string",
    "owner_name": "string",
    "email": "string",
    "status": "one of: active, suspended, inactive",
    "subscription_status": "one of: active, expired, suspended",
    "subscription_expires": "date",
    "therapists_count": "integer",
    "total_bookings": "integer",
    "monthly_revenue": "integer",
    "created_at": "iso_timestamp"
  }
]
```

#### GET /admin/violations (Super Admin)
Return compliance violations:
```json
[
  {
    "id": "uuid",
    "clinic_id": "uuid",
    "clinic_name": "string",
    "violation_type": "string",
    "severity": "one of: low, medium, high, critical",
    "description": "string",
    "created_at": "iso_timestamp",
    "resolved": "boolean"
  }
]
```

#### GET /admin/alerts (Super Admin)
Return system alerts:
```json
[
  {
    "id": "uuid",
    "type": "one of: system_alert, security_alert, billing_alert",
    "title": "string",
    "message": "string",
    "severity": "one of: info, warning, critical",
    "created_at": "iso_timestamp",
    "resolved": "boolean"
  }
]
```

### Important Notes:
1. **Always return data in the exact structure above** - Frontend expects specific field names and data types
2. **Include all required fields** - Missing fields will cause "undefined" errors and "Failed to load" messages
3. **Use ISO timestamps** for all date/time fields (YYYY-MM-DDTHH:MM:SSZ)
4. **Return arrays as arrays**, not objects with array properties (unless specified as wrapping object)
5. **Handle errors gracefully** - Return appropriate HTTP status codes (400, 401, 403, 404, 500)
6. **Include error messages** in response body: `{ "error": "descriptive error message" }`
7. **Use consistent field naming** - Use snake_case for API fields, frontend will access them as provided
8. **Validate all input** - Ensure email formats, phone numbers, prices, etc. are valid
9. **Implement proper authentication** - All endpoints except /auth/* require valid JWT token in Authorization header
10. **Return null/empty arrays** instead of omitting fields - Frontend expects field to exist

This specification ensures the frontend will display data correctly without errors. Please implement these exact endpoints and data structures.

---

## Part 6: Debugging Tips

If "Failed to load" errors occur:

1. **Check endpoint URL** - Ensure `/api/v1/` prefix is correct in both frontend and backend
2. **Check response structure** - Use browser DevTools → Network tab → click failed request → Preview tab
3. **Check status codes** - Should be 200 for success, not 404 or 500
4. **Check required fields** - All fields in specification above must be present
5. **Check data types** - Numbers should be numbers, not strings; booleans should be true/false, not "true"/"false"
6. **Check authentication** - Ensure JWT token is being sent in Authorization header
7. **Check CORS** - If requests are blocked, frontend can't reach backend
8. **Add console logs** - Frontend logs exact API calls and responses in browser console for debugging

---

**Last Updated:** January 2025
**Frontend Version:** React 18+ with Vite 6.4.2
**API Version:** v1
