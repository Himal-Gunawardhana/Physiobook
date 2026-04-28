# Backend Requirements for Physiobook Frontend Integration

**Document Type:** Backend Team Guidelines
**Frontend Version:** 1.0.0
**Created:** April 27, 2026

---

## 🎯 Overview

This document outlines what the **Physiobook Frontend (React/Vite)** expects from the backend API. Follow these requirements to ensure seamless integration.

---

## ✅ Core Requirements

### **1. API Base Path**
```
https://physiobook-api-jvye.onrender.com/api/v1
```

**All endpoints MUST be prefixed with `/api/v1/`**

### **2. CORS Configuration**
**REQUIRED:** Enable CORS for the following origins:
```
- http://localhost:5173      (Local development)
- http://localhost:3000      (Alternative local)
- http://127.0.0.1:5173      (Localhost IP)
- https://your-frontend.com  (Production URL - add as needed)
```

**CORS Headers Required:**
```
Access-Control-Allow-Origin: [origin]
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Refresh-Token
Access-Control-Allow-Credentials: true
```

### **3. Authentication (JWT)**
- **Method:** Bearer Token in Authorization header
- **Format:** `Authorization: Bearer <token>`
- **Token Should Contain:**
  - User ID
  - User email
  - User role
  - Expiration time (recommend 1 hour)

**Example Login Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  }
}
```

### **4. Status Codes**
Use standard HTTP status codes:
```
200 OK              - Success
201 Created         - Resource created
400 Bad Request     - Invalid input
401 Unauthorized    - Missing/invalid token
403 Forbidden       - Insufficient permissions
404 Not Found       - Resource not found
409 Conflict        - Duplicate resource
500 Server Error    - Internal error
```

### **5. Response Format**
All API responses should be **JSON**:

**Success Response:**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "message": "User-friendly message"
}
```

---

## 📋 Required Endpoints

### **Authentication Endpoints** (`/auth`)

#### **POST /auth/register**
**Purpose:** Register new user
```
Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890" (optional),
  "password": "SecurePass123"
}

Response (201 Created):
{
  "success": true,
  "accessToken": "...",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "role": "patient"
  }
}

Validations Required:
- Email must be valid and unique
- Password min 8 chars, uppercase, lowercase, number
- First/Last name required
```

#### **POST /auth/login**
**Purpose:** Authenticate user
```
Request:
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200 OK):
{
  "success": true,
  "accessToken": "...",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

#### **POST /auth/logout** ⭐ (Protected)
**Purpose:** Logout user
```
Request: (no body)
Headers: Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### **POST /auth/refresh** ⭐ (Protected)
**Purpose:** Refresh access token
```
Request: (no body)
Headers: Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "accessToken": "new_token_here"
}
```

---

### **User Endpoints** (`/users`)

#### **GET /users/me** ⭐ (Protected)
**Purpose:** Get current user profile
```
Response (200 OK):
{
  "success": true,
  "data": {
    "id": "...",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient",
    "phone": "+1234567890",
    "avatar": "https://...",
    "createdAt": "2026-04-27T10:00:00Z"
  }
}
```

#### **PUT /users/me** ⭐ (Protected)
**Purpose:** Update user profile
```
Request:
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+9876543210"
}

Response (200 OK):
{
  "success": true,
  "data": { /* updated user */ }
}
```

---

### **Clinic Endpoints** (`/clinics`)

#### **GET /clinics** ⭐ (Protected)
**Purpose:** List all clinics (user can browse)
```
Query Parameters:
- page=1 (optional)
- limit=10 (optional)
- search=name (optional)
- city=New York (optional)

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "clinic-uuid",
      "name": "Elite Physio - Downtown",
      "email": "clinic@example.com",
      "phone": "+1234567890",
      "addressLine1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA",
      "image": "https://...",
      "services": [
        {
          "id": "service-uuid",
          "name": "Physical Therapy",
          "description": "...",
          "duration": 60,
          "price": 100.00
        }
      ],
      "operatingHours": {
        "Monday": { "start": "09:00", "end": "18:00" },
        "Tuesday": { "start": "09:00", "end": "18:00" },
        // ... other days
      }
    }
  ]
}
```

#### **GET /clinics/:clinicId** ⭐ (Protected)
**Purpose:** Get clinic details
```
Response (200 OK):
{
  "success": true,
  "data": { /* same as above */ }
}
```

#### **GET /clinics/:clinicId/services** ⭐ (Protected)
**Purpose:** Get clinic services
```
Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "service-uuid",
      "name": "Physical Therapy",
      "description": "Full body PT assessment",
      "duration": 60,
      "price": 100.00,
      "therapists": ["therapist-id-1", "therapist-id-2"]
    }
  ]
}
```

---

### **Staff Endpoints** (`/staff`)

#### **GET /staff** ⭐ (Protected - Admin/Receptionist only)
**Purpose:** List clinic staff
```
Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "therapist-uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@clinic.com",
      "specialization": "Physical Therapy",
      "licenseNumber": "PT12345",
      "isActive": true
    }
  ]
}
```

#### **GET /staff/therapists/:therapistId/availability** ⭐ (Protected)
**Purpose:** Get therapist availability for a specific date
```
Query Parameters:
- date=2026-05-01 (required, format: YYYY-MM-DD)

Response (200 OK):
{
  "success": true,
  "data": {
    "therapistId": "...",
    "date": "2026-05-01",
    "availability": [
      {
        "startTime": "09:00",
        "endTime": "10:00",
        "isAvailable": true
      },
      {
        "startTime": "10:00",
        "endTime": "11:00",
        "isAvailable": false,
        "reason": "Already booked"
      }
    ]
  }
}
```

---

### **Booking Endpoints** (`/bookings`)

#### **GET /bookings** ⭐ (Protected)
**Purpose:** List user's bookings
```
Query Parameters:
- page=1 (optional)
- limit=10 (optional)
- status=confirmed (optional)

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "booking-uuid",
      "clinicId": "clinic-uuid",
      "clinicName": "Elite Physio",
      "therapistId": "therapist-uuid",
      "therapistName": "Jane Smith",
      "serviceId": "service-uuid",
      "serviceName": "Physical Therapy",
      "appointmentDate": "2026-05-10",
      "startTime": "10:00",
      "endTime": "11:00",
      "status": "confirmed",
      "notes": "Patient notes",
      "paymentStatus": "paid",
      "createdAt": "2026-04-27T10:00:00Z"
    }
  ]
}
```

#### **GET /bookings/slots** ⭐ (Protected)
**Purpose:** Get available appointment slots
```
Query Parameters (ALL REQUIRED):
- therapistId=uuid
- date=2026-05-10 (YYYY-MM-DD)
- serviceDuration=60 (in minutes)

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "startTime": "09:00",
      "endTime": "10:00",
      "isAvailable": true
    },
    {
      "startTime": "10:00",
      "endTime": "11:00",
      "isAvailable": true
    },
    {
      "startTime": "11:00",
      "endTime": "12:00",
      "isAvailable": false,
      "reason": "Booked"
    }
  ]
}
```

#### **POST /bookings** ⭐ (Protected)
**Purpose:** Create new booking
```
Request:
{
  "clinicId": "clinic-uuid",
  "therapistId": "therapist-uuid",
  "serviceId": "service-uuid",
  "appointmentDate": "2026-05-10",
  "startTime": "10:00",
  "endTime": "11:00"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "status": "confirmed",
    "appointmentDate": "2026-05-10",
    "startTime": "10:00",
    "endTime": "11:00"
  }
}

Validations:
- Date must be in future
- Slot must be available
- User must have valid payment method (if paid booking)
```

#### **GET /bookings/:bookingId** ⭐ (Protected)
**Purpose:** Get booking details
```
Response (200 OK):
{
  "success": true,
  "data": { /* booking object */ }
}
```

#### **PATCH /bookings/:bookingId/status** ⭐ (Protected - Admin/Therapist only)
**Purpose:** Update booking status
```
Request:
{
  "status": "completed"
}

Valid statuses:
- confirmed
- cancelled
- completed
- no_show

Response (200 OK):
{
  "success": true,
  "data": { /* updated booking */ }
}
```

---

### **Payment Endpoints** (`/payments`)

#### **GET /payments** ⭐ (Protected)
**Purpose:** List user's payments
```
Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "payment-uuid",
      "bookingId": "booking-uuid",
      "amount": 100.00,
      "currency": "USD",
      "status": "completed",
      "paymentMethod": "card",
      "createdAt": "2026-04-27T10:00:00Z"
    }
  ]
}
```

#### **POST /payments/intent** ⭐ (Protected)
**Purpose:** Create payment intent (for Stripe)
```
Request:
{
  "bookingId": "booking-uuid",
  "amount": 100.00,
  "currency": "USD"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx#secret_yyy",
    "amount": 100.00
  }
}
```

---

### **Communication Endpoints** (`/communications`)

#### **GET /communications/conversations** ⭐ (Protected)
**Purpose:** Get user's conversations
```
Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "conversation-uuid",
      "participantId": "user-uuid",
      "participantName": "Jane Smith",
      "lastMessage": "See you next week!",
      "lastMessageTime": "2026-04-27T15:30:00Z"
    }
  ]
}
```

#### **POST /communications/conversations** ⭐ (Protected)
**Purpose:** Create/get conversation
```
Request:
{
  "participantId": "user-uuid"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "id": "conversation-uuid"
  }
}
```

#### **GET /communications/conversations/:conversationId/messages** ⭐ (Protected)
**Purpose:** Get conversation messages
```
Query Parameters:
- limit=50 (optional)

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "message-uuid",
      "senderId": "user-uuid",
      "senderName": "Jane Smith",
      "content": "Hi there!",
      "timestamp": "2026-04-27T10:00:00Z",
      "isRead": true
    }
  ]
}
```

#### **POST /communications/conversations/:conversationId/messages** ⭐ (Protected)
**Purpose:** Send message
```
Request:
{
  "content": "Hello! I have a question..."
}

Response (201 Created):
{
  "success": true,
  "data": {
    "id": "message-uuid",
    "content": "...",
    "timestamp": "..."
  }
}
```

---

## 🔒 Security Checklist

- [ ] CORS configured for frontend URL
- [ ] All protected routes require valid JWT token
- [ ] Passwords hashed (bcrypt recommended)
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (sanitize inputs)
- [ ] Rate limiting on auth endpoints
- [ ] HTTPS enforced in production
- [ ] JWT token expiration set
- [ ] Refresh token mechanism implemented
- [ ] Request validation on all endpoints
- [ ] Error messages don't leak sensitive info

---

## 🧪 Testing Checklist

Use the **Test Page** (`/test`) on the frontend to verify:

- [ ] **Backend Health** - Can reach backend
- [ ] **CORS Test** - CORS headers are correct
- [ ] **Register** - New users can be created
- [ ] **Login** - Users can authenticate
- [ ] **Get Clinics** - Can fetch clinic list
- [ ] **Get Clinic Details** - Can fetch individual clinic
- [ ] **Get Services** - Can fetch clinic services
- [ ] **Get Available Slots** - Can fetch booking slots
- [ ] **Create Booking** - Can create appointment
- [ ] **Get My Bookings** - Can fetch user bookings

---

## 📞 Common Integration Issues

| Issue | Solution |
|-------|----------|
| **CORS Error** | Add frontend URL to CORS origins |
| **401 Unauthorized** | Ensure JWT token is in Authorization header |
| **Token Invalid** | Check token expiration and signature |
| **404 Not Found** | Verify endpoint path includes `/api/v1/` |
| **Validation Error** | Check request body matches schema |
| **Email Already Exists** | Return 409 Conflict with error message |

---

## 📚 Additional Notes

### **Database Requirements**
- PostgreSQL or similar relational DB
- Support for UUIDs
- Support for timestamps (created_at, updated_at)
- Support for JSONB (for storing complex data)

### **Cache Requirements** (Optional but Recommended)
- Redis for caching clinic data
- Redis for session management
- Cache clinic list (1 hour TTL)
- Cache therapist availability (5 minute TTL)

### **Real-time Features** (Optional)
- WebSocket support for live chat
- Socket.io or ws library
- Real-time booking notifications

### **Email Notifications** (Highly Recommended)
- Send confirmation email after booking
- Send reminder 24 hours before appointment
- Send receipt after payment
- Use SendGrid, AWS SES, or similar

---

## ✅ Verification Steps

1. **Deploy backend to Render**
2. **Enable CORS** for `http://localhost:5173`
3. **Test with `/test` page** on frontend
4. **Verify all endpoints** are working
5. **Check response formats** match expected schema
6. **Test error handling** (invalid token, wrong data, etc.)
7. **Load test** concurrent users
8. **Security audit** CORS, authentication, validation

---

**Document Version:** 1.0
**Last Updated:** April 27, 2026
**Backend Team Contact:** [Your contact info]
