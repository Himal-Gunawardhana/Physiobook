# Email/Prompt Template for Backend Team

---

## SUBJECT: Physiobook Backend API Data Requirements - URGENT

Dear Backend Team,

We need to align the backend API responses with the frontend implementation. The frontend is currently showing "Failed to load dashboard" errors because the API is not returning the required data in the correct format.

### Current Situation
- Frontend is ready and deployed
- All API endpoints exist but are returning incomplete or incorrectly formatted data
- This is blocking user dashboard functionality for all 4 roles

### What We Need
Please review the attached documents:
1. **BACKEND_DATA_REQUIREMENTS.md** - Complete specification with all endpoints
2. **API_QUICK_REFERENCE.md** - Quick lookup tables

### Immediate Action Items

#### 1. User Login Response (CRITICAL)
When users log in via `POST /auth/login` or refresh via `POST /auth/refresh`, return:

```json
{
  "token": "jwt_token_string_here",
  "user": {
    "id": "user_uuid",
    "firstName": "String",
    "lastName": "String",
    "email": "String",
    "phone": "String",
    "role": "patient OR clinic_admin OR therapist OR super_admin",
    "clinic_id": "clinic_uuid OR null",
    "avatar": "url_string OR null",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**CRITICAL:** The `role` field MUST be one of the 4 exact values above. Frontend uses this to route users:
- `patient` → `/book`
- `clinic_admin` → `/clinic`  
- `therapist` → `/therapist`
- `super_admin` → `/superadmin`

#### 2. Clinic Admin Dashboard (BLOCKING CLINIC ADMINS)
Implement these 3 endpoints for clinic admin dashboard:

**GET /dashboard/stats**
```json
{
  "today_revenue": 45000,
  "today_appointments": 8,
  "active_therapists": 3,
  "avg_rating": 4.7
}
```

**GET /bookings/today**
```json
[
  {
    "id": "uuid",
    "patient_name": "John Doe",
    "patient_phone": "+94712345678",
    "service": "Initial Assessment",
    "appointment_date": "2025-01-21",
    "appointment_time": "10:00",
    "duration_minutes": 45,
    "status": "pending",
    "total_price": 3500
  }
]
```

**GET /clinic/settings**
```json
{
  "clinic_id": "uuid",
  "clinic_name": "Elite Physio Center",
  "clinic_email": "info@elite.com",
  "clinic_phone": "+94712345678",
  "address": "123 Main Street",
  "city": "Colombo",
  "postal_code": "00600",
  "country": "Sri Lanka",
  "notifications": {
    "booking_email": true,
    "cancellation_alerts": true,
    "daily_summary": false,
    "staff_changes": true,
    "equipment_alerts": true,
    "refund_alerts": true
  }
}
```

#### 3. Therapist Schedule (BLOCKING THERAPISTS)
Implement these endpoints:

**GET /bookings/my?date=today**
```json
[
  {
    "id": "uuid",
    "patient_name": "John Doe",
    "patient_phone": "+94712345678",
    "service": "Initial Assessment",
    "appointment_date": "2025-01-21",
    "appointment_time": "10:00",
    "duration_minutes": 45,
    "status": "confirmed",
    "notes": "First time patient"
  }
]
```

**GET /bookings/my/stats**
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

**GET /staff/me/availability**
```json
{
  "Monday": {
    "start_time": "09:00",
    "end_time": "17:00",
    "break_start": "13:00",
    "break_end": "14:00",
    "available": true
  },
  "Tuesday": { ... },
  ... (6 more days)
}
```

#### 4. Patient Browse/Book (BLOCKING PATIENTS)
Implement these endpoints:

**GET /clinics**
```json
[
  {
    "id": "uuid",
    "name": "Elite Physio Center",
    "address": "123 Main Street, Colombo",
    "phone": "+94712345678",
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

**GET /clinics/:clinic_id/services**
```json
[
  {
    "id": "uuid",
    "name": "Initial Assessment",
    "description": "45-minute evaluation",
    "price": 3500,
    "duration_minutes": 45,
    "therapist_required": true
  }
]
```

**GET /bookings/my**
```json
[
  {
    "id": "uuid",
    "clinic_name": "Elite Physio Center",
    "therapist_name": "Dr. Priya Sharma",
    "service_name": "Initial Assessment",
    "appointment_date": "2025-02-01",
    "appointment_time": "10:00",
    "duration_minutes": 45,
    "status": "confirmed",
    "total_price": 3500
  }
]
```

#### 5. Super Admin Overview (BLOCKING SUPER ADMIN)
Implement these endpoints:

**GET /admin/stats**
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

**GET /admin/clinics**
```json
[
  {
    "id": "uuid",
    "name": "Elite Physio Center",
    "owner_name": "Dr. John Smith",
    "email": "owner@elite.com",
    "status": "active",
    "subscription_status": "active",
    "subscription_expires": "2025-12-31",
    "therapists_count": 5,
    "total_bookings": 245,
    "monthly_revenue": 125000
  }
]
```

**GET /admin/violations**
```json
[
  {
    "id": "uuid",
    "clinic_id": "uuid",
    "clinic_name": "Elite Physio Center",
    "violation_type": "unpaid_invoice",
    "severity": "high",
    "description": "Outstanding payment for 3 months",
    "created_at": "2025-01-15T10:30:00Z",
    "resolved": false
  }
]
```

**GET /admin/alerts**
```json
[
  {
    "id": "uuid",
    "type": "system_alert",
    "title": "High server load detected",
    "message": "CPU usage at 85%",
    "severity": "warning",
    "created_at": "2025-01-21T15:30:00Z",
    "resolved": false
  }
]
```

---

### Implementation Checklist

**Priority 1 - Core (This Week):**
- [ ] `POST /auth/login` - Returns correct user object with role field
- [ ] `POST /auth/refresh` - Returns correct user object
- [ ] `GET /users/me` - Returns authenticated user profile
- [ ] `GET /dashboard/stats` - Returns 4 required metrics
- [ ] `GET /bookings/today` - Returns today's bookings array
- [ ] `GET /clinic/settings` - Returns clinic configuration

**Priority 2 - Role Features (Next Week):**
- [ ] `GET /clinic/staff` - Staff list with availability
- [ ] `GET /clinic/services` - Services list
- [ ] `GET /clinic/equipment` - Equipment list  
- [ ] `GET /clinic/packages` - Packages list
- [ ] `GET /clinic/team` - Team members list
- [ ] `GET /bookings/my?date=today` - Therapist's appointments
- [ ] `GET /bookings/my/stats` - Therapist statistics
- [ ] `GET /staff/me/availability` - Therapist availability
- [ ] `GET /clinics` - All clinics for patients
- [ ] `GET /clinics/:id/services` - Clinic services for patients
- [ ] `GET /bookings/my` - Patient's bookings

**Priority 3 - Admin Features (Following Week):**
- [ ] `GET /admin/stats` - System statistics
- [ ] `GET /admin/clinics` - All clinics
- [ ] `GET /admin/violations` - System violations
- [ ] `GET /admin/alerts` - System alerts

---

### Important Notes for Backend Team

1. **Response Format:** Return raw JSON arrays `[...]` not wrapped objects. ❌ Wrong: `{ "data": [...] }` ✅ Correct: `[...]`

2. **Field Names:** Use exact field names from specification. Don't change to camelCase if spec says snake_case.

3. **Data Types:**
   - Numbers as `123`, not `"123"`
   - Booleans as `true/false`, not `"true"/"false"`
   - Dates as ISO 8601: `2025-01-21T10:00:00Z`
   - Null values as `null`, not empty string `""`

4. **Required Fields:** All fields in the JSON examples above MUST be present. Do NOT omit fields.

5. **Status Codes:**
   - `200` - Success
   - `400` - Bad request
   - `401` - Unauthorized (invalid token)
   - `403` - Forbidden (no permission)
   - `404` - Not found
   - `500` - Server error

6. **Error Response Format:**
   ```json
   {
     "error": "Descriptive error message here"
   }
   ```

7. **Authentication:** All endpoints except `/auth/*` require JWT token in header:
   ```
   Authorization: Bearer your_jwt_token_here
   ```

8. **Timestamps:** All date/time fields must be ISO 8601 format:
   ```
   2025-01-21T10:00:00Z
   ```

---

### Testing Protocol

After implementation, please test each endpoint:

```bash
# Test login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Should return:
# {
#   "token": "jwt...",
#   "user": { "id": "...", "firstName": "...", "role": "..." }
# }

# Test authenticated endpoint
curl -X GET http://localhost:5000/api/v1/dashboard/stats \
  -H "Authorization: Bearer jwt_token_here"

# Should return:
# {
#   "today_revenue": 45000,
#   "today_appointments": 8,
#   "active_therapists": 3,
#   "avg_rating": 4.7
# }
```

---

### References

- **Complete Specification:** See attached `BACKEND_DATA_REQUIREMENTS.md`
- **Quick Lookup:** See attached `API_QUICK_REFERENCE.md`
- **Frontend Code:** React 18 + Vite 6.4.2, uses `api.get()`, `api.post()`, etc. in `/src/lib/api.js`
- **Frontend API Base URL:** `/api/v1/` (configured in api.js)

---

### Timeline

- **By End of Week:** Priority 1 endpoints (core auth + clinic dashboard)
- **By End of Next Week:** Priority 2 endpoints (all role features)
- **By End of Following Week:** Priority 3 endpoints (admin features)

Once these are implemented, all "Failed to load" errors will be resolved and users can fully use their dashboards.

### Questions?

Please refer to the attached specification documents. They contain all endpoint details, response formats, and field requirements.

---

**Sent by:** Frontend Team  
**Date:** January 2025  
**Urgency:** High - Blocking all dashboard functionality  
**Status:** Awaiting backend API implementation
