# Physiobook - API Data Requirements Quick Reference

## 📊 Dashboard Data by Role

### CLINIC ADMIN Dashboard
| Data | Endpoint | Type | Key Fields |
|------|----------|------|-----------|
| Dashboard Stats | `GET /dashboard/stats` | Object | `today_revenue`, `today_appointments`, `active_therapists`, `avg_rating` |
| Today's Bookings | `GET /bookings/today` | Array | `id`, `patient_name`, `appointment_date`, `appointment_time`, `status`, `duration_minutes`, `total_price` |
| Clinic Settings | `GET /clinic/settings` | Object | `clinic_name`, `clinic_email`, `address`, `working_hours_start`, `working_hours_end`, `notifications` |
| Services List | `GET /clinic/services` | Array | `id`, `name`, `price`, `duration_minutes`, `description` |
| Equipment List | `GET /clinic/equipment` | Array | `id`, `name`, `quantity`, `status`, `maintenance_due` |
| Packages List | `GET /clinic/packages` | Array | `id`, `name`, `price`, `sessions_count`, `discount_percent` |
| Staff Members | `GET /clinic/staff` | Array | `id`, `name`, `specialization`, `experience_years`, `rating`, `status`, `availability` |
| Team Members | `GET /clinic/team` | Array | `id`, `name`, `email`, `role`, `status`, `last_login`, `joined_date` |

### THERAPIST Dashboard (Schedule)
| Data | Endpoint | Type | Key Fields |
|------|----------|------|-----------|
| Today's Sessions | `GET /bookings/my?date=today` | Array | `id`, `patient_name`, `appointment_date`, `appointment_time`, `service`, `status`, `duration_minutes` |
| Session Stats | `GET /bookings/my/stats` | Object | `today`, `week`, `month`, `total_sessions`, `avg_rating`, `completion_rate` |
| My Availability | `GET /staff/me/availability` | Object | `Monday...Sunday` with `start_time`, `end_time`, `break_start`, `break_end`, `available` |
| My Patients | `GET /therapist/patients` | Array | `id`, `name`, `phone`, `conditions`, `total_sessions`, `status` |

### PATIENT Dashboard (Browse/Book)
| Data | Endpoint | Type | Key Fields |
|------|----------|------|-----------|
| All Clinics | `GET /clinics` | Array | `id`, `name`, `address`, `phone`, `rating`, `reviews_count`, `is_open`, `working_hours` |
| Clinic Services | `GET /clinics/:id/services` | Array | `id`, `name`, `description`, `price`, `duration_minutes` |
| Clinic Packages | `GET /clinics/:id/packages` | Array | `id`, `name`, `price`, `sessions_count`, `discount_percent` |
| My Bookings | `GET /bookings/my` | Array | `id`, `clinic_name`, `therapist_name`, `service_name`, `appointment_date`, `appointment_time`, `status`, `total_price` |

### SUPER ADMIN Dashboard (Overview)
| Data | Endpoint | Type | Key Fields |
|------|----------|------|-----------|
| System Stats | `GET /admin/stats` | Object | `total_clinics`, `total_users`, `active_bookings`, `monthly_revenue`, `system_uptime`, `total_therapists` |
| All Clinics | `GET /admin/clinics` | Array | `id`, `name`, `owner_name`, `status`, `subscription_status`, `therapists_count`, `monthly_revenue` |
| Violations | `GET /admin/violations` | Array | `id`, `clinic_id`, `clinic_name`, `violation_type`, `severity`, `description`, `resolved` |
| System Alerts | `GET /admin/alerts` | Array | `id`, `type`, `title`, `message`, `severity`, `resolved` |
| Subscriptions | `GET /admin/subscriptions` | Array | `id`, `clinic_id`, `clinic_name`, `plan`, `price`, `status`, `therapists_allowed` |
| Support Tickets | `GET /admin/tickets` | Array | `id`, `clinic_id`, `subject`, `status`, `priority`, `created_at` |

---

## 🔐 User Profile Data at Login

All users receive this from `POST /auth/login` or `POST /auth/refresh`:

```
id                  UUID
firstName           String
lastName            String
email               String
phone               String (optional)
role                One of: [patient, clinic_admin, therapist, super_admin]
clinic_id           UUID (required for clinic_admin & therapist)
avatar              URL (optional)
created_at          ISO Timestamp
```

**IMPORTANT:** Must validate `role` is one of the 4 valid values, then route to correct dashboard using `ROLE_ROUTES` mapping:
- `patient` → `/book`
- `clinic_admin` → `/clinic`
- `therapist` → `/therapist`
- `super_admin` → `/superadmin`

---

## 📝 Common API Response Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Failed to load dashboard" | Endpoint returning 404 or 500 | Check endpoint URL exists and returns correct status code |
| "Cannot read property 'X' of undefined" | Missing required field in response | Ensure all fields from spec are included |
| Data shows as "undefined" | Field name mismatch | Use exact field names from specification |
| Empty arrays/lists | Endpoint returns null or wraps data incorrectly | Return raw array `[...]` not `{ data: [...] }` |
| Wrong data type error | Number as string, string as number, etc. | Validate data types: numbers as `123`, not `"123"` |
| CORS errors | Frontend can't reach backend | Add proper CORS headers to backend responses |
| 401 Unauthorized | Missing or invalid JWT token | Ensure token is in Authorization header: `Bearer token_here` |

---

## 🎯 Endpoint Response Formats Checklist

When implementing each endpoint, verify:

- ✅ **Status Code:** 200 for success, appropriate error codes otherwise
- ✅ **Field Names:** Exact match to specification (snake_case or camelCase consistency)
- ✅ **Data Types:** Numbers, booleans, dates in correct format
- ✅ **Required Fields:** All specified fields must be present (no omissions)
- ✅ **Array Format:** Return `[...]` not `{ data: [...] }`
- ✅ **Error Format:** Return `{ "error": "message" }` with appropriate status code
- ✅ **Timestamps:** ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
- ✅ **Null Values:** Use `null` for missing optional fields, don't omit them
- ✅ **Pagination:** If applicable, include `total`, `page`, `limit` in response

---

## 🚨 Critical Fields That Break Frontend

If these fields are missing, frontend will crash:

### Clinic Admin
- `dashboard/stats`: `today_revenue`, `today_appointments`, `active_therapists`, `avg_rating`
- `bookings/today`: `id`, `status`, `appointment_date`, `appointment_time`
- `clinic/settings`: `clinic_name`, `notifications` object
- `clinic/staff`: `id`, `name`, `specialization`, `status`, `availability`

### Therapist
- `bookings/my`: `id`, `patient_name`, `service`, `appointment_date`, `appointment_time`, `status`
- `bookings/my/stats`: `today`, `week`, `month`, `avg_rating`
- `staff/me/availability`: Days of week with `start_time`, `end_time`, `available`

### Patient
- `clinics`: `id`, `name`, `address`, `rating`, `is_open`
- `clinics/:id/services`: `id`, `name`, `price`, `duration_minutes`
- `bookings/my`: `id`, `clinic_name`, `service_name`, `appointment_date`, `status`

### Super Admin
- `admin/stats`: `total_clinics`, `total_users`, `active_bookings`, `monthly_revenue`
- `admin/clinics`: `id`, `name`, `status`, `subscription_status`, `therapists_count`
- `admin/violations`: `id`, `clinic_id`, `violation_type`, `severity`, `resolved`

---

## 🔗 Complete API Endpoint List

### Auth
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `POST /auth/2fa/verify` - 2FA verification

### Users
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update profile
- `POST /users/me/change-password` - Change password

### Clinic Admin (starts with `/clinic` or `/dashboard`)
- `GET /dashboard/stats` - Dashboard statistics
- `GET /bookings/today` - Today's bookings
- `GET /clinic/settings` - Clinic settings
- `PUT /clinic/settings` - Update settings
- `GET /clinic/services` - List services
- `POST /clinic/services` - Create service
- `PATCH /clinic/services/:id` - Update service
- `DELETE /clinic/services/:id` - Delete service
- `GET /clinic/equipment` - List equipment
- `POST /clinic/equipment` - Add equipment
- `DELETE /clinic/equipment/:id` - Delete equipment
- `GET /clinic/packages` - List packages
- `POST /clinic/packages` - Create package
- `PATCH /clinic/packages/:id` - Update package
- `DELETE /clinic/packages/:id` - Delete package
- `GET /clinic/staff` - List staff
- `POST /clinic/staff` - Add staff member
- `PATCH /clinic/staff/:id` - Update staff
- `DELETE /clinic/staff/:id` - Remove staff
- `GET /staff/:id/availability` - Get staff availability
- `PUT /staff/:id/availability` - Update availability
- `GET /clinic/team` - List team members
- `POST /clinic/team/invite` - Invite team member
- `PATCH /clinic/team/:id` - Update team member
- `DELETE /clinic/team/:id` - Remove team member
- `PATCH /bookings/:id/confirm` - Confirm booking

### Therapist
- `GET /bookings/my?date=today` - Today's appointments
- `GET /bookings/my/stats` - Session statistics
- `GET /staff/me/availability` - My availability
- `PUT /staff/me/availability` - Update my availability
- `GET /therapist/patients` - List my patients
- `GET /therapist/sessions` - List sessions
- `POST /therapist/sessions` - Create session notes
- `PATCH /therapist/sessions/:id` - Update session notes

### Patient
- `GET /clinics` - List all clinics
- `GET /clinics/:clinic_id/services` - Get clinic services
- `GET /clinics/:clinic_id/packages` - Get clinic packages
- `GET /bookings/my` - My bookings
- `POST /bookings` - Create booking
- `PATCH /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking
- `POST /bookings/:id/feedback` - Submit feedback

### Super Admin (starts with `/admin`)
- `GET /admin/stats` - System statistics
- `GET /admin/clinics` - All clinics
- `GET /admin/violations` - Violations
- `GET /admin/alerts` - System alerts
- `PATCH /admin/violations/:id/resolve` - Resolve violation
- `GET /admin/subscriptions` - All subscriptions
- `POST /admin/subscriptions/:id/suspend` - Suspend subscription
- `GET /admin/tickets` - Support tickets
- `PATCH /admin/tickets/:id` - Update ticket

---

## 💡 Implementation Order

Recommend implementing endpoints in this order to enable full functionality:

### Phase 1: Core Authentication (Highest Priority)
1. `POST /auth/login` - User login
2. `POST /auth/refresh` - Session restoration
3. `GET /users/me` - Get current user profile

### Phase 2: Clinic Admin Features
4. `GET /dashboard/stats` - Dashboard stats
5. `GET /bookings/today` - Today's bookings
6. `GET /clinic/settings` - Clinic configuration
7. `GET /clinic/services` - List services
8. `GET /clinic/staff` - List staff

### Phase 3: Additional Features
9. `GET /clinic/equipment` - Equipment management
10. `GET /clinic/packages` - Package management
11. `GET /clinic/team` - Team management

### Phase 4: Other Roles
12. Therapist endpoints (`/bookings/my`, `/staff/me/availability`)
13. Patient endpoints (`/clinics`, `/bookings/my`)
14. Super Admin endpoints (`/admin/stats`, `/admin/clinics`)

---

**Created:** January 2025
**Last Updated:** January 2025
**For:** Physiobook Frontend Development Team
