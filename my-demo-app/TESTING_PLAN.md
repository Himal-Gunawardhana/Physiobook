# Testing Plan - Physiobook Frontend Integration

**Document Type:** QA Testing Guide
**Frontend Version:** 1.0.0
**Target Backend:** Render Deployment

---

## 🧪 Testing Overview

The frontend includes a **Test Page** (`http://localhost:5173/test`) that validates backend integration. This guide explains how to use it and what to test.

---

## ✅ Pre-Testing Checklist

- [ ] Backend deployed to Render
- [ ] CORS enabled for `http://localhost:5173`
- [ ] PostgreSQL database ready
- [ ] All environment variables configured
- [ ] Frontend running locally (`npm run dev`)

---

## 🛠️ Test Page Guide

### **Accessing the Test Page**
1. Start frontend: `npm run dev`
2. Navigate to: `http://localhost:5173/test`
3. You should see tabs: Auth, Backend, Clinics, Bookings, Supabase

### **Test Page Features**

#### **1. Backend Tab - Health Check**
```
Tests: GET /health or GET /api/v1/clinics

Expected Result: ✅ Backend is responding

What it shows:
- Backend is reachable
- API is listening
- Basic connectivity works
```

#### **2. Backend Tab - CORS Check**
```
Tests: OPTIONS request to backend

Expected Result: ✅ CORS headers present
- Access-Control-Allow-Origin: http://localhost:5173
- Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Access-Control-Allow-Headers: Content-Type, Authorization
```

#### **3. Auth Tab - Register**
```
Tests: POST /api/v1/auth/register

Test Data:
- First Name: John
- Last Name: Doe
- Email: test@example.com
- Password: SecurePass123

Expected Result: 
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "role": "patient"
  }
}

Token should be stored in localStorage
```

#### **4. Auth Tab - Login**
```
Tests: POST /api/v1/auth/login

Test Data:
- Email: test@example.com (from previous register)
- Password: SecurePass123

Expected Result: Token returned and stored
```

#### **5. Auth Tab - Get Current User**
```
Tests: GET /api/v1/users/me

Expected Result:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  }
}

Note: Requires valid token from login
```

#### **6. Clinics Tab - List All Clinics**
```
Tests: GET /api/v1/clinics

Expected Result:
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

Note: Requires auth token
```

#### **7. Clinics Tab - Get Clinic by ID**
```
Tests: GET /api/v1/clinics/:clinicId

Use clinic ID from previous clinic list response

Expected Result: Detailed clinic object with services and hours
```

#### **8. Bookings Tab - List User Bookings**
```
Tests: GET /api/v1/bookings

Expected Result:
{
  "success": true,
  "data": [
    {
      "id": "booking-uuid",
      "appointmentDate": "2026-05-10",
      "status": "confirmed"
    }
  ]
}

Note: Initially empty for new user
```

#### **9. Backend Tab - Custom Endpoint Tester**
```
Test ANY endpoint directly:

1. Select HTTP method (GET, POST, PUT, PATCH, DELETE)
2. Enter endpoint path: /api/v1/your-endpoint
3. Optionally enter JSON body
4. Click "Test Custom Endpoint"

Useful for testing endpoints not in default tabs
```

#### **10. Supabase Tab - Connection Test**
```
Tests Supabase (optional real-time database)

Expected Result:
- ✅ Connected if VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set
- ❌ Error if credentials missing
```

---

## 📋 Complete Test Scenario

Follow this flow to test the entire application:

### **Step 1: Health Check** (5 minutes)
```
1. Open /test page
2. Go to "Backend" tab
3. Click "Check Backend Health"

✅ PASS: See "Backend is running"
❌ FAIL: See "Failed to fetch" → CORS issue, check backend
```

### **Step 2: User Registration** (5 minutes)
```
1. Go to "Auth" tab
2. Fill register form:
   - First Name: TestUser
   - Last Name: Demo
   - Email: testuser@demo.com
   - Password: DemoPass123
3. Click "Register"

✅ PASS: Token stored, see success message
❌ FAIL: Check error message
   - "Email already exists" → Use different email
   - "Invalid password" → Password needs uppercase, number
   - "Server error" → Backend issue
```

### **Step 3: User Login** (5 minutes)
```
1. Go to "Auth" tab
2. Fill login form:
   - Email: testuser@demo.com
   - Password: DemoPass123
3. Click "Login"

✅ PASS: New token stored
❌ FAIL: "Invalid email or password" → Check credentials
```

### **Step 4: Get Current User** (5 minutes)
```
1. Go to "Auth" tab
2. Click "Get Current User"

✅ PASS: See user details (email, firstName, lastName)
❌ FAIL: 
   - "401 Unauthorized" → Token missing or invalid
   - "404 Not Found" → Endpoint path wrong
```

### **Step 5: List Clinics** (5 minutes)
```
1. Go to "Clinics" tab
2. Click "Get All Clinics"

✅ PASS: See clinic list with names, cities, services
❌ FAIL:
   - Empty list → Database has no clinics
   - "401 Unauthorized" → Token issue
   - "404 Not Found" → Endpoint doesn't exist
```

### **Step 6: Get Clinic Details** (5 minutes)
```
1. From previous clinic list, copy clinic ID
2. Go to "Clinics" tab
3. Paste clinic ID in "Get Clinic" field
4. Click "Get Clinic Details"

✅ PASS: See full clinic details (address, hours, services)
❌ FAIL: "404 Not Found" → Clinic doesn't exist
```

### **Step 7: Get Available Slots** (5 minutes)
```
1. From clinic details, note a therapist ID
2. Go to "Backend" tab → "Custom Endpoint Tester"
3. Method: GET
4. Endpoint: /api/v1/bookings/slots?therapistId=THERAPIST_ID&date=2026-05-10&serviceDuration=60
5. Click "Test Custom Endpoint"

✅ PASS: See list of available slots (startTime, endTime, isAvailable)
❌ FAIL:
   - Empty list → Therapist has no availability
   - "400 Bad Request" → Missing query parameters
   - "404 Not Found" → Endpoint wrong
```

### **Step 8: Create Booking** (5 minutes)
```
1. Go to "Backend" tab → "Custom Endpoint Tester"
2. Method: POST
3. Endpoint: /api/v1/bookings
4. Body:
{
  "clinicId": "clinic-uuid",
  "therapistId": "therapist-uuid",
  "serviceId": "service-uuid",
  "appointmentDate": "2026-05-10",
  "startTime": "10:00",
  "endTime": "11:00"
}
5. Click "Test Custom Endpoint"

✅ PASS: See booking ID, status "confirmed"
❌ FAIL:
   - "Slot not available" → Choose different time
   - "Invalid date" → Use future date
   - "400 Bad Request" → Check JSON format
   - "Missing required field" → Check all fields present
```

### **Step 9: Get User Bookings** (5 minutes)
```
1. Go to "Bookings" tab
2. Click "Get My Bookings"

✅ PASS: See booking created in previous step
❌ FAIL: Empty list → Booking not created properly
```

### **Step 10: Full Diagnostic** (2 minutes)
```
1. Go to "Backend" tab
2. Click "Run Full Diagnostic"

✅ PASS: All tests pass (✅ symbols)
❌ FAIL: See which tests failed, troubleshoot individually
```

---

## 🚨 Troubleshooting Guide

### **"Failed to fetch" Error**
```
Causes:
1. Backend not running → Start backend server
2. CORS not enabled → Add http://localhost:5173 to CORS origins
3. Wrong backend URL → Check VITE_BACKEND_URL in .env.local

Solution:
- Check backend logs for errors
- Verify CORS configuration in app.js
- Ensure Render deployment is running
```

### **"401 Unauthorized" Error**
```
Causes:
1. Token missing → Login first
2. Token invalid → Token malformed
3. Token expired → Login again
4. Wrong token format → Should be "Bearer token"

Solution:
- Check localStorage has 'physiobook_auth_token'
- Verify token format in browser DevTools
- Re-login if token expired
```

### **"404 Not Found" Error**
```
Causes:
1. Wrong endpoint path → Should start with /api/v1/
2. Endpoint doesn't exist → Backend not implemented
3. Typo in path → Check spelling

Solution:
- Verify endpoint path matches documentation
- Check API endpoint is implemented
- Test with other endpoints first
```

### **"400 Bad Request" Error**
```
Causes:
1. Invalid JSON format
2. Missing required fields
3. Invalid data type (string vs number)

Solution:
- Check request JSON format
- Verify all required fields present
- Check data types match schema
```

### **Empty Lists (No Clinics, No Bookings)**
```
Causes:
1. Database is empty → No seed data
2. Filtering is wrong → Query params filtering out results
3. Data not created → Need to create test data first

Solution:
- Add seed data to database
- Check query parameters
- Create test records via test page
```

### **Email Already Exists**
```
Cause: Trying to register with existing email

Solution:
- Use different email for testing
- Delete user from database if needed
- Use timestamp in email: test+TIMESTAMP@example.com
```

---

## 📊 Test Coverage Matrix

| Component | Test | Status | Notes |
|-----------|------|--------|-------|
| **Auth** | Register | ✅ | Form validation, duplicate email |
| **Auth** | Login | ✅ | Valid/invalid credentials |
| **Auth** | Get User | ✅ | Token required, user data |
| **Clinics** | List | ✅ | Pagination, search filters |
| **Clinics** | Get Detail | ✅ | Services, hours, staff |
| **Bookings** | List Slots | ✅ | Date format, availability |
| **Bookings** | Create | ✅ | Validation, conflict handling |
| **Bookings** | Get My Bookings | ✅ | User filtering |
| **Payments** | Create Intent | ⏳ | Stripe integration |
| **Comms** | Get Messages | ⏳ | Chat functionality |
| **WebSocket** | Real-time | ⏳ | Live chat (future) |

---

## 🔄 Regression Testing

After any backend changes:

```
1. Run Full Diagnostic (1 minute)
2. Test Auth Flow (register → login → get user)
3. Test Booking Flow (clinics → slots → create booking)
4. Check all response formats
5. Verify error messages clear
```

---

## ✨ Success Criteria

All tests are **PASSING** when:

- ✅ Health check returns 200 OK
- ✅ CORS headers are present
- ✅ Registration creates new user
- ✅ Login returns valid token
- ✅ Token is stored in localStorage
- ✅ Protected endpoints require token
- ✅ Clinic list returns results
- ✅ Slots calculation is correct
- ✅ Bookings are created successfully
- ✅ User bookings are retrievable
- ✅ All error messages are clear
- ✅ Response formats match documentation

---

## 📝 Test Report Template

```
Test Date: 2026-04-27
Backend Version: 1.0.0
Frontend Version: 1.0.0
Tester: [Name]

PASSED TESTS:
- ✅ Health Check
- ✅ CORS
- ✅ User Registration
- ✅ User Login
- ✅ Get Current User

FAILED TESTS:
- ❌ Create Booking (Slot conflict)

BLOCKERS:
- Payment endpoint returns 500 error

NOTES:
- Database seed data needed for clinics
- Token expires in 1 hour as expected
```

---

## 🎯 Next Steps

After all tests pass:

1. ✅ Load testing (concurrent users)
2. ✅ Security testing (XSS, SQL injection)
3. ✅ Performance testing (response times)
4. ✅ Integration testing (all features together)
5. ✅ UAT with real users
6. ✅ Production deployment

---

**Testing Guide Version:** 1.0
**Last Updated:** April 27, 2026
**Contact:** QA Team
