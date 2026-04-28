# Integration Checklist - Frontend ↔ Backend Setup

**Purpose:** Step-by-step checklist to ensure frontend and backend are properly integrated
**Created:** April 27, 2026
**Status:** Ready for Backend Team

---

## 📋 Pre-Integration Checklist

### **Backend Prerequisites**
- [ ] Code pushed to GitHub
- [ ] Environment variables configured:
  - [ ] `DATABASE_URL` (PostgreSQL)
  - [ ] `REDIS_URL` (optional)
  - [ ] `CORS_ORIGINS` (set to: `http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173`)
  - [ ] `JWT_SECRET` (secure random string)
  - [ ] Other service keys (Stripe, SendGrid, etc.)
- [ ] Dependencies installed
- [ ] Database migrations run
- [ ] Seed data created (optional but helpful)

### **Frontend Prerequisites**
- [ ] Code pushed to GitHub
- [ ] Dependencies installed: `npm install`
- [ ] `.env.local` created with:
  - [ ] `VITE_BACKEND_URL=https://physiobook-api-jvye.onrender.com`
  - [ ] `VITE_SUPABASE_URL` (optional)
  - [ ] `VITE_SUPABASE_ANON_KEY` (optional)
- [ ] Dev server running: `npm run dev`

---

## 🚀 Deployment & Integration Steps

### **Step 1: Deploy Backend to Render** (10 minutes)

#### **1.1 Connect GitHub Repository**
```
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo (physiobook-api)
4. Confirm authorization
```

#### **1.2 Configure Environment Variables**
```
In Render Dashboard:

Environment: production

Variables:
DATABASE_URL = [PostgreSQL connection string]
REDIS_URL = [Redis connection string]
JWT_SECRET = [Generate secure key]
NODE_ENV = production
PORT = (auto-assigned)
CORS_ORIGINS = http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
API_VERSION = v1
LOG_LEVEL = info
```

#### **1.3 Deploy**
```
- Select "Deploy"
- Wait for build (2-5 minutes)
- Check logs for errors
- Note deployment URL: https://physiobook-api-xxxx.onrender.com
```

**✅ Verification:**
```
curl https://physiobook-api-xxxx.onrender.com/health
# Should return: { "status": "ok" }
```

---

### **Step 2: Verify CORS Configuration** (5 minutes)

#### **2.1 Check Backend CORS Settings**
```javascript
// In backend/src/app.js, should have:

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token']
}));
```

#### **2.2 Test CORS from Frontend**
```
1. Open frontend: http://localhost:5173
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Run:

fetch('https://physiobook-api-xxxx.onrender.com/api/v1/clinics', {
  method: 'OPTIONS',
  headers: {
    'Access-Control-Request-Method': 'GET'
  }
}).then(r => {
  console.log('CORS Status:', r.status);
  console.log('CORS Headers:', r.headers);
})
```

**✅ Expected Output:**
```
CORS Status: 200
CORS Headers contains:
  access-control-allow-origin: http://localhost:5173
  access-control-allow-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
```

---

### **Step 3: Update Frontend Backend URL** (2 minutes)

#### **3.1 Update .env.local**
```env
# In my-demo-app/.env.local

VITE_BACKEND_URL=https://physiobook-api-xxxx.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
```

#### **3.2 Restart Frontend Dev Server**
```bash
# In my-demo-app directory
npm run dev

# Should see:
# ➜  Local:   http://localhost:5173/
```

---

### **Step 4: Test API Connectivity** (10 minutes)

#### **4.1 Run Test Page - Backend Tab**

**Open:** `http://localhost:5173/test`

1. **Check Backend Health**
   ```
   Expected: ✅ Backend is responding
   ```

2. **Check CORS**
   ```
   Expected: ✅ CORS headers present
   ```

3. **Full Diagnostic**
   ```
   Expected: All tests pass ✅
   ```

**If Health Check Fails:**
```
Troubleshoot:
1. Backend URL correct in .env.local?
2. Backend deployed successfully?
3. Backend logs show errors?
4. CORS configured?
5. Network connectivity from frontend to backend?

Check console for detailed error message
```

---

### **Step 5: Test Authentication Flow** (10 minutes)

#### **5.1 User Registration**

**Open:** `http://localhost:5173/test` → Auth Tab

```
Fill:
- First Name: TestUser
- Last Name: Demo
- Email: test+TIMESTAMP@example.com
- Password: DemoPass123

Click: Register

Expected Result:
✅ Success message
✅ Token stored in localStorage
✅ Can see token in DevTools → Application → Local Storage → physiobook_auth_token
```

**If Registration Fails:**
```
Check error message:
- "Email already exists" → Use different email
- "Invalid password" → Password needs uppercase + number + 8+ chars
- "Database error" → Backend database issue
- "CORS error" → CORS not configured
```

#### **5.2 User Login**

```
Fill:
- Email: test+TIMESTAMP@example.com
- Password: DemoPass123

Click: Login

Expected Result:
✅ New token generated
✅ Token updated in localStorage
```

#### **5.3 Get Current User**

```
Click: Get Current User

Expected Result:
✅ Returns user details:
{
  "id": "...",
  "email": "test+TIMESTAMP@example.com",
  "firstName": "TestUser",
  "lastName": "Demo",
  "role": "patient"
}
```

---

### **Step 6: Test Clinic Endpoints** (10 minutes)

#### **6.1 List Clinics**

**Open:** `http://localhost:5173/test` → Clinics Tab

```
Click: Get All Clinics

Expected Result:
✅ Returns clinic list with:
{
  "id": "clinic-uuid",
  "name": "Elite Physio",
  "city": "New York",
  "services": [...]
}
```

**If Empty List:**
```
Cause: No clinic seed data

Solution:
1. Add clinics to database via backend
2. Or create via admin endpoint
3. Verify database connection working
```

#### **6.2 Get Clinic Details**

```
From clinic list, copy clinic ID

Click: Get Clinic Details
Paste ID in field

Expected Result:
✅ Returns full clinic details:
- Address
- Operating hours
- Services list
- Staff information
```

---

### **Step 7: Test Booking Flow** (15 minutes)

#### **7.1 Get Available Slots**

**Open:** `http://localhost:5173/test` → Backend Tab → Custom Endpoint Tester

```
Method: GET
Endpoint: /api/v1/bookings/slots?therapistId=THERAPIST_ID&date=2026-05-10&serviceDuration=60

Expected Result:
✅ Returns slot array:
[
  { "startTime": "09:00", "endTime": "10:00", "isAvailable": true },
  { "startTime": "10:00", "endTime": "11:00", "isAvailable": false }
]
```

**If Error:**
```
Check:
- therapistId is valid UUID
- date format is YYYY-MM-DD
- serviceDuration is number (minutes)
- Therapist exists in database
```

#### **7.2 Create Booking**

```
Method: POST
Endpoint: /api/v1/bookings
Body: {
  "clinicId": "clinic-uuid",
  "therapistId": "therapist-uuid",
  "serviceId": "service-uuid",
  "appointmentDate": "2026-05-10",
  "startTime": "10:00",
  "endTime": "11:00"
}

Expected Result:
✅ Returns:
{
  "id": "booking-uuid",
  "status": "confirmed",
  "appointmentDate": "2026-05-10"
}
```

**If Conflict Error:**
```
Cause: Selected slot already booked

Solution:
- Choose different time from available slots
- Verify therapist availability
```

#### **7.3 Get User Bookings**

```
Click: Get My Bookings (Bookings tab)

Expected Result:
✅ Returns list including booking created above:
[
  {
    "id": "booking-uuid",
    "appointmentDate": "2026-05-10",
    "status": "confirmed",
    "clinicName": "Elite Physio"
  }
]
```

---

### **Step 8: Verify Response Formats** (5 minutes)

#### **8.1 Check Auth Response**

```
Response should include:
{
  "success": true,
  "accessToken": "...",
  "user": {
    "id": "uuid",
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "role": "..."
  }
}

✅ Verify:
- success is boolean
- accessToken is string
- user object has all fields
- No extra fields causing frontend errors
```

#### **8.2 Check Clinic Response**

```
Response should include:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "city": "string",
      "services": [...]
    }
  ]
}

✅ Verify:
- success is boolean
- data is array or object
- All required fields present
```

#### **8.3 Check Error Response**

```
Test with invalid clinic ID:
GET /api/v1/clinics/invalid-id

Expected:
{
  "success": false,
  "error": "Clinic not found",
  "message": "The requested clinic does not exist"
}

✅ Verify:
- success is false
- error message is clear
- status code is 404
- No stack trace exposed
```

---

## 🔍 Integration Testing Matrix

| Component | Test | Status | Issues |
|-----------|------|--------|--------|
| **Health Check** | Backend responding | ⏳ | |
| **CORS** | Headers present | ⏳ | |
| **Auth Register** | New user creation | ⏳ | |
| **Auth Login** | Token generation | ⏳ | |
| **Auth Token** | Stored in localStorage | ⏳ | |
| **Get User** | Current user profile | ⏳ | |
| **List Clinics** | Clinic retrieval | ⏳ | |
| **Get Clinic** | Clinic details | ⏳ | |
| **Get Slots** | Availability calculation | ⏳ | |
| **Create Booking** | Appointment creation | ⏳ | |
| **Get Bookings** | User booking list | ⏳ | |
| **Error Handling** | 404 responses | ⏳ | |
| **Validation** | Bad input handling | ⏳ | |
| **Token Expiry** | Refresh mechanism | ⏳ | |

---

## 🚨 Quick Troubleshooting

### **Frontend Can't Connect to Backend**
```
1. Check backend URL in .env.local
2. Verify backend is running: curl https://backend-url/health
3. Check browser console for errors
4. Verify CORS configuration
5. Check network tab for failed requests
```

### **CORS Error: No 'Access-Control-Allow-Origin' Header**
```
1. Add frontend URL to CORS_ORIGINS env var
2. Verify CORS middleware in app.js
3. Check CORS_ORIGINS env var is set
4. Restart backend after env change
5. Clear browser cache
```

### **Token Not Stored**
```
1. Check localStorage is enabled
2. Verify registration/login returns token
3. Check browser DevTools → Application → Local Storage
4. Token should be under key: 'physiobook_auth_token'
```

### **404 Not Found on Endpoints**
```
1. Verify endpoint path starts with /api/v1/
2. Check endpoint is implemented
3. Verify path matches exactly (case-sensitive)
4. Check backend has route defined
```

### **401 Unauthorized**
```
1. Verify user is logged in
2. Check token is in localStorage
3. Verify token is in Authorization header
4. Token might be expired - login again
5. Check JWT_SECRET matches between frontend/backend
```

---

## ✅ Final Verification Checklist

Before marking integration complete:

**Backend**
- [ ] Deployed to Render
- [ ] Environment variables configured
- [ ] CORS enabled for localhost:5173
- [ ] Database connected
- [ ] All endpoints implemented
- [ ] Response formats correct
- [ ] Error handling proper
- [ ] Logs accessible

**Frontend**
- [ ] .env.local has correct backend URL
- [ ] Dev server running
- [ ] Test page accessible
- [ ] All tests passing
- [ ] localStorage working
- [ ] Token persisted

**Integration**
- [ ] Health check passes ✅
- [ ] CORS validation passes ✅
- [ ] User registration works ✅
- [ ] User login works ✅
- [ ] Clinic list works ✅
- [ ] Bookings work ✅
- [ ] All error codes correct ✅
- [ ] Response formats match docs ✅

---

## 📞 Support & Escalation

**If Testing Fails:**

1. **Check test page** for specific error message
2. **Review backend logs** on Render dashboard
3. **Verify environment variables** are set
4. **Consult BACKEND_REQUIREMENTS.md** for endpoint details
5. **Use API_QUICK_REFERENCE.md** for examples

---

**Integration Checklist Version:** 1.0
**Last Updated:** April 27, 2026
**Backend Team:** Use this to ensure full integration
