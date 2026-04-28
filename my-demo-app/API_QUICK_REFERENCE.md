# Physiobook API - Quick Reference Guide

**API Base URL:** `https://physiobook-api-jvye.onrender.com/api/v1`

---

## 🔐 Authentication

All requests require the `Authorization: Bearer <token>` header (except `/auth/*` endpoints).

```bash
# Store token from login response
token=$(curl -X POST /auth/login | jq -r '.accessToken')

# Use in requests
curl -H "Authorization: Bearer $token" /api/v1/users/me
```

---

## 📋 All Endpoints

### **Authentication**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login user |
| POST | `/auth/logout` | ✅ | Logout user |
| POST | `/auth/refresh` | ✅ | Refresh token |

### **Users**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | ✅ | Get current user |
| PUT | `/users/me` | ✅ | Update current user |

### **Clinics**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/clinics` | ✅ | List all clinics |
| GET | `/clinics/:id` | ✅ | Get clinic details |
| GET | `/clinics/:id/services` | ✅ | Get clinic services |

### **Staff**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/staff` | ✅ | List clinic staff |
| GET | `/staff/therapists/:id/availability` | ✅ | Get therapist availability |

### **Bookings**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/bookings` | ✅ | List user bookings |
| GET | `/bookings/slots` | ✅ | Get available slots |
| POST | `/bookings` | ✅ | Create booking |
| GET | `/bookings/:id` | ✅ | Get booking details |
| PATCH | `/bookings/:id/status` | ✅ | Update booking status |

### **Payments**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/payments` | ✅ | List payments |
| POST | `/payments/intent` | ✅ | Create payment intent |

### **Communications**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/communications/conversations` | ✅ | List conversations |
| POST | `/communications/conversations` | ✅ | Create conversation |
| GET | `/communications/conversations/:id/messages` | ✅ | Get messages |
| POST | `/communications/conversations/:id/messages` | ✅ | Send message |

---

## 💡 Common Requests

### **Register User**
```javascript
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

// Response
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "user": { "id": "...", "email": "john@example.com", "role": "patient" }
}
```

### **Login**
```javascript
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

// Response
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "user": { "id": "...", "email": "john@example.com" }
}
```

### **Get Current User**
```javascript
GET /users/me
Authorization: Bearer eyJhbGc...

// Response
{
  "success": true,
  "data": {
    "id": "...",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  }
}
```

### **List Clinics**
```javascript
GET /clinics?page=1&limit=10&search=elite
Authorization: Bearer eyJhbGc...

// Response
{
  "success": true,
  "data": [
    {
      "id": "clinic-uuid",
      "name": "Elite Physio",
      "city": "New York",
      "services": [...]
    }
  ]
}
```

### **Get Available Slots**
```javascript
GET /bookings/slots?therapistId=therapist-uuid&date=2026-05-10&serviceDuration=60
Authorization: Bearer eyJhbGc...

// Response
{
  "success": true,
  "data": [
    { "startTime": "09:00", "endTime": "10:00", "isAvailable": true },
    { "startTime": "10:00", "endTime": "11:00", "isAvailable": false }
  ]
}
```

### **Create Booking**
```javascript
POST /bookings
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "clinicId": "clinic-uuid",
  "therapistId": "therapist-uuid",
  "serviceId": "service-uuid",
  "appointmentDate": "2026-05-10",
  "startTime": "10:00",
  "endTime": "11:00"
}

// Response
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "status": "confirmed",
    "appointmentDate": "2026-05-10"
  }
}
```

---

## 🧪 cURL Examples

### **Login**
```bash
curl -X POST https://physiobook-api-jvye.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### **Get Clinics (with token)**
```bash
curl -X GET https://physiobook-api-jvye.onrender.com/api/v1/clinics \
  -H "Authorization: Bearer eyJhbGc..."
```

### **Create Booking**
```bash
curl -X POST https://physiobook-api-jvye.onrender.com/api/v1/bookings \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "clinicId": "clinic-uuid",
    "therapistId": "therapist-uuid",
    "serviceId": "service-uuid",
    "appointmentDate": "2026-05-10",
    "startTime": "10:00",
    "endTime": "11:00"
  }'
```

---

## 📊 Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Get new token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Check endpoint path |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Try again later |

---

## 🔍 Query Parameters

### **Pagination**
```
?page=1&limit=10
```

### **Filtering**
```
?status=confirmed
?search=elite
?city=New York
```

### **Sorting** (if supported)
```
?sort=createdAt&order=desc
```

---

## ⚠️ Common Errors

```javascript
// Invalid credentials
{
  "success": false,
  "error": "Invalid email or password"
}

// Token expired
{
  "success": false,
  "error": "Token expired",
  "code": "TOKEN_EXPIRED"
}

// Not found
{
  "success": false,
  "error": "Clinic not found"
}

// Validation error
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Invalid email format"
  }
}
```

---

## 🔄 Token Flow

```
1. User submits login credentials
   POST /auth/login

2. Backend returns accessToken
   Response: { "accessToken": "...", "user": {...} }

3. Frontend stores token in localStorage
   localStorage.setItem('physiobook_auth_token', token)

4. Frontend includes token in all subsequent requests
   Authorization: Bearer <token>

5. If token expires, use refresh endpoint
   POST /auth/refresh
   Response: { "accessToken": "new_token" }

6. Update stored token
   localStorage.setItem('physiobook_auth_token', newToken)
```

---

## 🚀 Testing Checklist

- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Token is returned from login
- [ ] Token is stored in localStorage
- [ ] Token is included in Authorization header
- [ ] Can fetch clinics
- [ ] Can get clinic details
- [ ] Can get available slots
- [ ] Can create booking
- [ ] Can fetch own bookings

---

**Quick Reference Version:** 1.0
**Last Updated:** April 27, 2026
