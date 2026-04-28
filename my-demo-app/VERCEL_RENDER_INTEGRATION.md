# Vercel ↔ Render Integration Setup Guide

**Frontend:** React (Vite) on Vercel  
**Backend:** Node.js Express on Render  
**Database:** PostgreSQL on Supabase  
**Status:** Ready for Production Deployment

---

## 📋 Overview

```
┌──────────────────────────────────┐
│   Vercel Frontend (React/Vite)   │
│   https://physiobook.vercel.app/ │
└──────────────┬───────────────────┘
               │ HTTP Requests
               │ (CORS enabled)
               ▼
┌──────────────────────────────────┐
│  Render Backend (Express/Node)   │
│ https://physiobook-api.onrender.com │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│   Supabase PostgreSQL Database   │
│      (Managed in the cloud)      │
└──────────────────────────────────┘
```

---

## 🚀 Step 1: Verify Frontend is Ready

### **1.1 Check Frontend Configuration**

**File:** `my-demo-app/.env.local`

```env
# ← Must have correct Render backend URL
VITE_BACKEND_URL=https://physiobook-api-jvye.onrender.com

# ← Optional: Only if using Supabase real-time
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**✅ Verify:**
- Backend URL points to Render deployment
- URL is correct (check Render dashboard)
- No trailing slashes

---

## 🛠️ Step 2: Update Backend CORS for Vercel

### **2.1 Get Your Vercel Frontend URL**

1. Go to: https://vercel.com/dashboard
2. Find your Physiobook project
3. Copy the URL (e.g., `https://physiobook-chi.vercel.app/`)

### **2.2 Update Backend CORS Origins**

**In Render Dashboard:**

1. Go to: https://dashboard.render.com/
2. Select **physiobook-api** service
3. Click **Environment**
4. Edit `CORS_ORIGINS` variable

**Current:**
```
http://localhost:3000,https://app.physiobook.com
```

**Update to:**
```
http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://physiobook-chi.vercel.app
```

**Replace `physiobook-chi.vercel.app` with your actual Vercel URL**

### **2.3 Redeploy Backend**

```bash
# Option 1: Automatic (recommended)
# Push to GitHub → Render auto-deploys

# Option 2: Manual
# In Render Dashboard → Click "Trigger deploy"
```

**Wait for deployment to complete (2-3 minutes)**

---

## 📝 Step 3: Configure Frontend for Vercel

### **3.1 Update Frontend Environment Variables**

**Create file:** `my-demo-app/.env.production`

```env
# Production Backend URL
VITE_BACKEND_URL=https://physiobook-api-jvye.onrender.com

# Optional: Supabase for real-time features
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Commit and push:**
```bash
cd my-demo-app
git add .env.production
git commit -m "Add production environment configuration for Vercel"
git push
```

### **3.2 Vercel Deployment Configuration**

**File:** `my-demo-app/vercel.json` (already exists)

Verify it contains:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_BACKEND_URL": "@vite_backend_url"
  }
}
```

### **3.3 Add Vercel Environment Variables**

**In Vercel Dashboard:**

1. Go to: https://vercel.com/dashboard
2. Select your Physiobook project
3. Settings → Environment Variables
4. Add:

```
Name: VITE_BACKEND_URL
Value: https://physiobook-api-jvye.onrender.com
Environments: Production, Preview, Development
```

Optional - Add Supabase variables if using real-time:
```
Name: VITE_SUPABASE_URL
Value: https://your-project.supabase.co
Environments: Production, Preview, Development

Name: VITE_SUPABASE_ANON_KEY
Value: your-anon-key-here
Environments: Production, Preview, Development
```

---

## ✅ Step 4: Verify Connection

### **4.1 Test Backend Health**

```bash
# Open browser and visit:
https://physiobook-api-jvye.onrender.com/health

# Expected response:
{
  "status": "ok",
  "service": "physiobook-api",
  "version": "1.0.0",
  "timestamp": "2026-04-27T10:00:00Z"
}
```

**If not working:**
- Check Render dashboard logs
- Verify backend is deployed
- Check database connection

### **4.2 Test Frontend-Backend Connection**

1. Deploy frontend to Vercel (push to GitHub)
2. Wait for Vercel deployment to complete
3. Go to: `https://your-vercel-url/test`
4. Click **Backend Tab** → **Check Backend Health**

**Expected:** ✅ Backend is responding

**If error:**
- Check browser console for error details
- Verify CORS origins in backend
- Check if API URL is correct in .env

### **4.3 Full Integration Test**

**Go to:** `https://your-vercel-url/test`

Run these tests in order:

1. **Backend Tab**
   - [ ] Health Check → Should pass ✅
   - [ ] CORS Check → Should pass ✅
   - [ ] Full Diagnostic → All tests pass ✅

2. **Auth Tab**
   - [ ] Register new user → Success ✅
   - [ ] Login → Token received ✅
   - [ ] Get Current User → User data returned ✅

3. **Clinics Tab**
   - [ ] Get All Clinics → Clinic list returned ✅
   - [ ] Get Clinic Details → Full details returned ✅

4. **Bookings Tab**
   - [ ] Get My Bookings → List returned ✅

**If all tests pass:** ✅ **Full integration is successful!**

---

## 🔍 Troubleshooting

### **Issue: CORS Error "No Access-Control-Allow-Origin Header"**

**Causes:**
1. Backend CORS_ORIGINS doesn't include frontend URL
2. Backend not redeployed after CORS change
3. Frontend URL contains extra characters (trailing slash, port, etc.)

**Solution:**
```bash
1. Check Render dashboard → Environment Variables
2. Verify CORS_ORIGINS includes your Vercel URL
3. Trigger redeploy in Render
4. Wait 2-3 minutes for deployment
5. Test again
```

### **Issue: "Failed to fetch" or Network Error**

**Causes:**
1. Backend URL is wrong
2. Backend is down
3. Network connectivity issue

**Solution:**
```bash
# Test backend directly
curl https://physiobook-api-jvye.onrender.com/health

# If no response:
# 1. Check Render dashboard
# 2. Check if backend is deployed
# 3. Check app logs for errors
```

### **Issue: 401 Unauthorized on Protected Endpoints**

**Causes:**
1. Token not stored in localStorage
2. Token is invalid/expired
3. Authorization header not being sent

**Solution:**
```bash
# In browser console:
localStorage.getItem('physiobook_auth_token')

# Should return a token. If not:
1. Login again
2. Check localStorage is enabled
3. Verify token is being stored
```

### **Issue: 404 Not Found on Endpoints**

**Causes:**
1. Wrong endpoint path
2. API endpoint doesn't exist
3. Typo in URL

**Solution:**
```bash
# Verify endpoint path starts with /api/v1/
# Example: /api/v1/clinics (correct)
# Not: /clinics (wrong)
# Not: /api/clinics (wrong)

# Check BACKEND_REQUIREMENTS.md for exact paths
```

---

## 📊 Configuration Checklist

### **Frontend (Vercel)**

- [ ] `.env.production` created with correct backend URL
- [ ] `vercel.json` configured properly
- [ ] Vercel environment variables set:
  - [ ] VITE_BACKEND_URL
  - [ ] VITE_SUPABASE_URL (optional)
  - [ ] VITE_SUPABASE_ANON_KEY (optional)
- [ ] Frontend deployed to Vercel
- [ ] Test page loads at `/test` route

### **Backend (Render)**

- [ ] Backend deployed to Render
- [ ] CORS_ORIGINS includes Vercel URL
- [ ] Environment variables set:
  - [ ] JWT_ACCESS_SECRET
  - [ ] JWT_REFRESH_SECRET
  - [ ] DATABASE_URL (Supabase)
  - [ ] REDIS_URL (Upstash/Redis)
  - [ ] STRIPE_SECRET_KEY (if using payments)
  - [ ] STRIPE_WEBHOOK_SECRET (if using payments)
  - [ ] CORS_ORIGINS
- [ ] Database migrations completed
- [ ] Health endpoint responds at `/health`

### **Verification**

- [ ] Health check passes ✅
- [ ] CORS validation passes ✅
- [ ] User registration works ✅
- [ ] User login works ✅
- [ ] Clinic list works ✅
- [ ] Test page shows all green ✅
- [ ] No CORS errors in browser console ✅

---

## 🔄 Deployment Workflow

### **When You Make Changes:**

**Frontend Changes:**
```bash
# In my-demo-app directory
git add .
git commit -m "Your changes"
git push

# Vercel auto-deploys (2-5 minutes)
# Check: https://vercel.com/dashboard → Recent deployments
```

**Backend Changes:**
```bash
# In backend directory
git add .
git commit -m "Your changes"
git push

# Render auto-deploys (2-5 minutes)
# Check: https://dashboard.render.com → Deployments
```

---

## 📱 Testing Different Scenarios

### **Scenario 1: First-Time User Registration**

```javascript
1. Visit Vercel frontend URL
2. Click Register
3. Fill in details and register
4. Verify email (check inbox)
5. Login with new credentials
6. Should see dashboard
```

### **Scenario 2: Browse Clinics & Book Appointment**

```javascript
1. Login as patient
2. Go to /book
3. Browse available clinics
4. Select a clinic and service
5. Choose date and time
6. Complete booking
7. Verify in My Bookings
```

### **Scenario 3: Admin Functions**

```javascript
1. Login as clinic admin
2. View dashboard
3. Manage staff
4. View bookings
5. Manage services
```

---

## 🛡️ Security Checklist

- [ ] CORS only allows your domains
- [ ] JWT secrets are strong (64+ characters)
- [ ] Database credentials are in environment variables
- [ ] Stripe keys are in environment variables
- [ ] HTTPS is enforced in production
- [ ] Password reset emails work
- [ ] 2FA setup is optional but available
- [ ] Rate limiting is enabled
- [ ] Input validation on all endpoints

---

## 📞 Troubleshooting Contacts

**Vercel Issues:** https://vercel.com/support  
**Render Issues:** https://render.com/docs  
**Supabase Issues:** https://supabase.com/docs

---

## 🎉 Success Criteria

Your Vercel ↔ Render integration is successful when:

✅ Frontend loads from Vercel  
✅ Test page is accessible at `/test`  
✅ Health check passes  
✅ CORS validation passes  
✅ User registration works  
✅ User login works  
✅ Can browse clinics  
✅ Can create bookings  
✅ No CORS errors in console  
✅ All test page tests pass  

---

## 📚 Related Documentation

- [FRONTEND_DOCUMENTATION.md](./FRONTEND_DOCUMENTATION.md) - Frontend architecture
- [BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md) - Backend specifications
- [BACKEND_RESTRUCTURING_GUIDE.md](./BACKEND_RESTRUCTURING_GUIDE.md) - Backend setup guide
- [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) - Step-by-step integration
- [TESTING_PLAN.md](./TESTING_PLAN.md) - Testing procedures
- [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) - API endpoint reference

---

**Integration Guide Version:** 1.0.0  
**Last Updated:** April 27, 2026  
**Status:** Production Ready
