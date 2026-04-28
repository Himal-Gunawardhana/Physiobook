# 🚀 Physiobook Deployment - Quick Reference

**Use this checklist to quickly verify everything is configured correctly**

---

## ⚡ 5-Minute Setup Summary

### **Frontend (Vercel)**

```bash
✅ Step 1: Push to GitHub
git add .
git commit -m "Production ready"
git push

✅ Step 2: Deploy to Vercel
# Via: vercel.com/dashboard
# Select project → Click "Deploy"

✅ Step 3: Add Environment Variables (Vercel Dashboard)
VITE_BACKEND_URL = https://physiobook-api-xxxx.onrender.com

✅ Step 4: Get Your Vercel URL
# Example: https://physiobook-chi.vercel.app/
```

### **Backend (Render)**

```bash
✅ Step 1: Set Up Render Service
# Via: render.com/dashboard
# GitHub repo → New Web Service

✅ Step 2: Add Critical Environment Variables
CORS_ORIGINS = https://physiobook-chi.vercel.app,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

JWT_ACCESS_SECRET = (random 64+ chars)
JWT_REFRESH_SECRET = (random 64+ chars)

DATABASE_URL = (from Supabase)
REDIS_URL = (from Upstash)

✅ Step 3: Deploy
# Render auto-deploys on GitHub push

✅ Step 4: Get Your Backend URL
# Example: https://physiobook-api-xxxx.onrender.com
```

---

## 📋 Pre-Deployment Verification

### **Frontend Files to Check**

```
✅ my-demo-app/.env.local
   - Has correct Render backend URL
   
✅ my-demo-app/vercel.json
   - Properly configured
   
✅ my-demo-app/package.json
   - All dependencies installed
   
✅ my-demo-app/src/utils/testApi.js
   - API paths use /api/v1/
   
✅ my-demo-app/src/pages/TestPage.jsx
   - Test page exists and loads
```

### **Backend Files to Check**

```
✅ backend/src/app.js
   - CORS middleware configured
   - Default origins include localhost
   - Environment variables loaded
   
✅ backend/.env
   - All critical variables set
   - JWT secrets are strong
   - Database URL correct
   - CORS_ORIGINS includes frontend URL
   
✅ backend/server.js
   - Express app properly initialized
   - Routes mounted at /api/v1/
   
✅ backend/package.json
   - All dependencies listed
   - Start script correct
```

---

## 🧪 Quick Verification Tests

### **Test 1: Backend Health (30 seconds)**

```bash
# In browser, visit:
https://physiobook-api-xxxx.onrender.com/health

# Expected response:
{
  "status": "ok",
  "service": "physiobook-api",
  "version": "1.0.0"
}

✅ PASS = Backend is running
❌ FAIL = Check Render deployment
```

### **Test 2: Frontend Loads (30 seconds)**

```bash
# In browser, visit:
https://your-project.vercel.app/

# Expected: React app loads

✅ PASS = Frontend is deployed
❌ FAIL = Check Vercel deployment
```

### **Test 3: Test Page Access (30 seconds)**

```bash
# In browser, visit:
https://your-project.vercel.app/test

# Expected: Test page loads with tabs

✅ PASS = Routing works
❌ FAIL = Check Vercel build logs
```

### **Test 4: Backend Connection (1 minute)**

```bash
On Test Page:
1. Click "Backend" tab
2. Click "Check Backend Health"

✅ PASS = Backend is responding
❌ FAIL = Check CORS configuration
```

### **Test 5: Full Integration (5 minutes)**

```bash
On Test Page:
1. Backend Tab → Full Diagnostic
2. Auth Tab → Register new user
3. Auth Tab → Login
4. Clinics Tab → Get All Clinics
5. Bookings Tab → Get My Bookings

✅ ALL PASS = Full integration success!
```

---

## 🔍 CORS Troubleshooting (Most Common Issue)

### **Symptom:** "Failed to fetch" or CORS error

### **Fix in 60 seconds:**

```bash
1. Get your Vercel URL
   https://your-project.vercel.app/

2. Go to Render Dashboard
   https://dashboard.render.com/

3. Select "physiobook-api" service

4. Click "Environment"

5. Find CORS_ORIGINS variable

6. Update it to:
   http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://your-project.vercel.app

7. Save

8. Wait 2-3 minutes for redeploy

9. Refresh test page

10. Test again
```

**Key Points:**
- No trailing slashes!
- Separate origins with commas
- Include localhost for dev testing

---

## 📱 Environment Variables Checklist

### **Frontend (Vercel Dashboard)**

```
□ VITE_BACKEND_URL = https://physiobook-api-xxxx.onrender.com
□ VITE_SUPABASE_URL = (optional)
□ VITE_SUPABASE_ANON_KEY = (optional)
```

### **Backend (Render Dashboard)**

```
□ NODE_ENV = production
□ API_VERSION = v1
□ CORS_ORIGINS = [your-vercel-url + localhost URLs]
□ JWT_ACCESS_SECRET = [strong random string]
□ JWT_REFRESH_SECRET = [strong random string]
□ DATABASE_URL = [from Supabase]
□ REDIS_URL = [from Upstash]
□ STRIPE_SECRET_KEY = [from Stripe]
□ STRIPE_WEBHOOK_SECRET = [from Stripe]
□ SENDGRID_API_KEY = [from SendGrid]
```

---

## 🚨 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| **CORS Error** | Update CORS_ORIGINS in Render with your Vercel URL, no trailing slash |
| **404 Not Found** | Verify endpoint starts with `/api/v1/` |
| **401 Unauthorized** | Re-login to get new token, check localStorage |
| **"Failed to fetch"** | Check backend is deployed, verify CORS, check network tab |
| **Blank page** | Check Vercel build logs, open browser console for errors |
| **Database error** | Verify DATABASE_URL in Render, test connection |
| **500 error** | Check Render logs, verify all env vars are set |

---

## 📊 Deployment Status Checklist

### **Frontend (Vercel)**

- [ ] Repository connected to Vercel
- [ ] Latest code pushed to GitHub
- [ ] Deployment shows "Ready"
- [ ] URL is accessible
- [ ] Test page loads at `/test`
- [ ] No build errors in logs

### **Backend (Render)**

- [ ] Repository connected to Render
- [ ] Latest code pushed to GitHub
- [ ] Deployment shows "Live"
- [ ] URL is accessible
- [ ] Health endpoint responds
- [ ] No errors in logs
- [ ] CORS_ORIGINS updated with Vercel URL

### **Integration**

- [ ] Frontend can reach backend
- [ ] CORS validation passes
- [ ] User registration works
- [ ] User login works
- [ ] API requests work
- [ ] No console errors

---

## 🔗 Quick Links

**Your Deployment URLs:**

```
Frontend: https://your-project.vercel.app/
Backend:  https://physiobook-api-xxxx.onrender.com/
Test Page: https://your-project.vercel.app/test

Dashboard URLs:
Vercel:   https://vercel.com/dashboard
Render:   https://dashboard.render.com/
Supabase: https://app.supabase.com/
Upstash:  https://console.upstash.com/
```

---

## ✅ Final Verification

**Before considering deployment complete, verify:**

```
✅ Frontend loads without errors
✅ Backend health endpoint responds
✅ CORS validation passes
✅ User can register
✅ User can login
✅ User can browse clinics
✅ User can create bookings
✅ No CORS errors in console
✅ No 404 errors on API calls
✅ No 401 errors (unless testing auth)
✅ Test page shows all green ✅
```

**All green?** 🎉 **Deployment is successful!**

---

## 📞 Need Help?

- **Check Logs:** Vercel dashboard & Render dashboard
- **Browser Console:** Press F12, check for errors
- **Test Page:** Go to `/test` for diagnostic info
- **Backend API Docs:** See BACKEND_REQUIREMENTS.md
- **Integration Guide:** See VERCEL_RENDER_INTEGRATION.md

---

**Quick Reference Version:** 1.0.0  
**Last Updated:** April 27, 2026

Print this out and keep it handy! 📌
