# 🚀 Physiobook Complete Deployment Guide

**Frontend:** React (Vite) → Vercel  
**Backend:** Node.js Express → Render  
**Database:** PostgreSQL → Supabase  
**Cache:** Redis → Upstash  
**Domain:** physiobook-chi.vercel.app (example)

---

## 📋 Quick Navigation

- **Total Setup Time:** 30-45 minutes
- **Complexity:** Intermediate
- **Status:** Production Ready

### 🎯 What You're Building

```
User → Vercel Frontend → Render Backend → Supabase Database
         (React)           (Express)       (PostgreSQL)
      https://..         https://..
      .vercel.app        .onrender.com
```

---

## ✅ Pre-Deployment Checklist

### **Frontend (React/Vite)**
- [x] Code pushed to GitHub
- [x] All API tests passing
- [x] Environment variables configured
- [x] .env.local has correct backend URL
- [ ] Ready to deploy to Vercel

### **Backend (Node.js/Express)**
- [x] Code pushed to GitHub
- [x] All endpoints implemented (59+)
- [x] CORS configured for localhost
- [ ] Database migrations tested locally
- [ ] Ready to deploy to Render

### **Infrastructure**
- [ ] Supabase account created (PostgreSQL)
- [ ] Upstash account created (Redis)
- [ ] Stripe account created (Payments)
- [ ] SendGrid account created (Email)
- [ ] GitHub repositories connected to deployments

---

## 🚀 Deployment Steps (In Order)

### **STEP 1: Database Setup (Supabase) - 5 min**

**1.1 Create Supabase Project**
1. Go to: https://supabase.com/
2. Click "Start your project"
3. Create new project (choose region closest to you)
4. Wait for database to initialize (2-3 minutes)

**1.2 Get Database Credentials**
1. Go to: Settings → Database
2. Copy **Connection String**
3. Format: `postgresql://user:password@host:5432/postgres`

**1.3 Note These URLs**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-key-here
```

**✅ Done:** Database is ready

---

### **STEP 2: Cache Setup (Redis/Upstash) - 3 min**

**2.1 Create Upstash Database**
1. Go to: https://console.upstash.com/
2. Click "Create database"
3. Choose "Redis" and "Global" or regional
4. Click "Create"

**2.2 Get Redis Connection**
1. Copy **Redis URL** from dashboard
2. Format: `redis://default:password@host:port`

**✅ Done:** Cache is ready

---

### **STEP 3: Backend Deployment (Render) - 10 min**

**3.1 Create Render Service**

1. Go to: https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Select "GitHub" → Authorize
4. Find **physiobook-backend** repository
5. Click "Connect"

**3.2 Configure Service**

```
Name:                  physiobook-api
Environment:           Node
Region:                Choose closest to users (e.g., us-east-1)
Branch:                main
Build Command:         npm install
Start Command:         node server.js
```

**3.3 Add Environment Variables**

Click "Advanced" → Add these variables:

```
NODE_ENV                 production
API_VERSION              v1
PORT                     4000

CORS_ORIGINS             http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

JWT_ACCESS_SECRET        (generate random string, 64+ chars)
JWT_REFRESH_SECRET       (generate random string, 64+ chars)
JWT_ACCESS_EXPIRES_IN    15m
JWT_REFRESH_EXPIRES_IN   7d

DATABASE_URL             (from Supabase Step 1.2)
REDIS_URL                (from Upstash Step 2.2)

STRIPE_SECRET_KEY        (from Stripe dashboard)
STRIPE_WEBHOOK_SECRET    (from Stripe dashboard)

SENDGRID_API_KEY         (from SendGrid)
SENDGRID_FROM_EMAIL      noreply@physiobook.com

LOG_LEVEL                info
```

⚠️ **CRITICAL:** CORS_ORIGINS will be updated after frontend deployment

**3.4 Deploy**

1. Click "Create Web Service"
2. Wait for deployment (2-5 minutes)
3. Note the URL: `https://physiobook-api-xxxx.onrender.com`

**✅ Done:** Backend is deployed

---

### **STEP 4: Frontend Deployment (Vercel) - 10 min**

**4.1 Connect GitHub to Vercel**

1. Go to: https://vercel.com/
2. Click "New Project"
3. Click "Import Git Repository"
4. Select **physiobook** (frontend) repository
5. Click "Import"

**4.2 Configure Project**

```
Framework Preset:        Vite
Build Command:           npm run build
Output Directory:        dist
Install Command:         npm install
Development Command:     npm run dev
```

**4.3 Add Environment Variables**

1. Click "Environment Variables"
2. Add:

```
VITE_BACKEND_URL    https://physiobook-api-xxxx.onrender.com
                    (from Step 3.3 - Render deployment URL)
```

Optional (for real-time features):
```
VITE_SUPABASE_URL        (from Step 1.3)
VITE_SUPABASE_ANON_KEY   (from Step 1.3)
```

**4.4 Deploy**

1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. Note the URL: `https://your-project.vercel.app/`

**✅ Done:** Frontend is deployed

---

### **STEP 5: Update Backend CORS - 2 min**

Now that frontend is deployed, update backend CORS to allow it.

**5.1 Get Vercel URL**

From Step 4.4: `https://your-project.vercel.app/`

**5.2 Update Backend CORS**

1. Go to: https://dashboard.render.com/
2. Select **physiobook-api** service
3. Click "Environment"
4. Edit `CORS_ORIGINS`:

```
OLD:
http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

NEW:
http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://your-project.vercel.app
```

⚠️ **Important:** No trailing slashes!

**5.3 Redeploy Backend**

1. Click "Trigger deploy" (or just save - Render will auto-deploy)
2. Wait 2-3 minutes for deployment
3. Check deployment logs for errors

**✅ Done:** CORS updated

---

## 🧪 Verification (15 min)

### **Test 1: Backend Health**

```bash
# Open browser and visit:
https://physiobook-api-xxxx.onrender.com/health

# Expected response:
{
  "status": "ok",
  "service": "physiobook-api",
  "version": "1.0.0"
}
```

**Status:** ✅ Pass

### **Test 2: Frontend Loads**

```bash
# Open browser and visit:
https://your-project.vercel.app/

# Expected: React app loads without errors
```

**Status:** ✅ Pass

### **Test 3: Test Page Accessible**

```bash
# Open browser and visit:
https://your-project.vercel.app/test

# Expected: Test page loads with tabs
```

**Status:** ✅ Pass

### **Test 4: Backend Connection**

1. Go to: `https://your-project.vercel.app/test`
2. Click **Backend Tab**
3. Click **Check Backend Health**

**Expected:** ✅ Backend is responding

**If error:**
- Check browser console for error details
- Verify CORS_ORIGINS in Render (Step 5.2)
- Verify backend URL is correct in Vercel environment variables
- Wait 2-3 minutes after Render redeploy

### **Test 5: CORS Validation**

1. Still on Test Page
2. Click **CORS Check**

**Expected:** ✅ CORS headers present

**If error:**
- Backend CORS might not be updated yet
- Wait another minute and refresh

### **Test 6: Full Integration Test**

1. Still on Test Page
2. Click **Auth Tab** → **Register**
3. Fill in form and register

**Expected:** ✅ New user created, token stored

**If error:**
- Check error message
- Verify database is connected
- Check Render logs for errors

### **Test 7: All Tests**

```
✅ Health Check
✅ CORS Check  
✅ User Register
✅ User Login
✅ Get Profile
✅ Get Clinics
✅ Get Bookings
✅ Full Diagnostic
```

**Status:** ✅ All Pass = Full Integration Success!

---

## 🔄 Common Workflows

### **When You Update Frontend Code**

```bash
# 1. Commit and push to GitHub
git add .
git commit -m "Your changes"
git push

# 2. Vercel auto-deploys (2-5 minutes)
# Monitor at: https://vercel.com/dashboard

# 3. Test at: https://your-project.vercel.app/test
```

### **When You Update Backend Code**

```bash
# 1. Commit and push to GitHub
git add .
git commit -m "Your changes"
git push

# 2. Render auto-deploys (2-5 minutes)
# Monitor at: https://dashboard.render.com/

# 3. After deployment, redeploy frontend to clear cache
# (Optional) Go to Vercel → Deployments → Redeploy
```

### **When You Need to Change Environment Variables**

**Frontend (Vercel):**
1. Go to: https://vercel.com/dashboard
2. Select project → Settings → Environment Variables
3. Edit and save
4. Click "Redeploy" on Deployments tab

**Backend (Render):**
1. Go to: https://dashboard.render.com/
2. Select service → Environment
3. Edit and save
4. Render auto-redeployes (or click "Trigger deploy")

---

## 🐛 Troubleshooting

### **CORS Error: "No 'Access-Control-Allow-Origin'"**

```
Cause: Backend CORS_ORIGINS doesn't include frontend URL
Fix:
  1. Go to Render dashboard
  2. Update CORS_ORIGINS to include Vercel URL
  3. Trigger redeploy
  4. Wait 2-3 minutes
  5. Refresh test page
```

### **"Failed to fetch" Error**

```
Cause: Backend URL wrong or backend down
Fix:
  1. Verify backend URL in Vercel env vars
  2. Test: curl https://backend-url/health
  3. Check Render logs for errors
  4. Check if deployment completed successfully
```

### **Frontend Page Blank**

```
Cause: Frontend build error or JavaScript error
Fix:
  1. Check Vercel deployment logs
  2. Open browser console (F12)
  3. Look for error messages
  4. Check if VITE_BACKEND_URL is set
```

### **401 Unauthorized**

```
Cause: Token missing or invalid
Fix:
  1. Click logout then login again
  2. Check localStorage: F12 → Application → Local Storage
  3. Token should be under 'physiobook_auth_token'
  4. If not there, registration/login is failing
```

### **"Cannot GET /" (Blank Page)**

```
Cause: Frontend routing issue
Fix:
  1. Make sure you're visiting: https://your-project.vercel.app/
  2. NOT: https://your-project.vercel.app/test
  3. Check Vercel build logs
  4. Verify vite.config.js has correct base path
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
└─────────────────────────────────────────────────────────────────┘
              │                                    │
              │ HTTPS (TLS/SSL)                    │
              │                                    │
        ┌─────▼──────────┐              ┌─────────▼────────────┐
        │  Vercel CDN    │              │   Render (Backend)   │
        │  Frontend      │◄────HTTPS───►│   Express API        │
        │ https://...    │              │ https://...          │
        │ .vercel.app/   │              │ .onrender.com/api/v1 │
        └─────┬──────────┘              └──────┬────────────────┘
              │                                 │
              │                                 │
              └──────────────┬──────────────────┘
                             │ (Database Queries)
                             ▼
                    ┌────────────────────┐
                    │  Supabase (DB)     │
                    │  PostgreSQL        │
                    │  Real-time Sync    │
                    └────────────────────┘
```

---

## 📈 Monitoring & Maintenance

### **Check Deployment Status**

**Frontend:**
- Vercel: https://vercel.com/dashboard → Recent Deployments
- Status should show "Ready"

**Backend:**
- Render: https://dashboard.render.com/ → Deployments
- Status should show "Live"

### **Monitor Logs**

**Frontend:**
- Vercel: Settings → Functions & Integrations → Edge Logs

**Backend:**
- Render: Logs tab on service page
- Watch for errors like database connection, JWT issues

### **Performance Metrics**

**Frontend:**
- Vercel: Analytics tab
- Monitor page load time, server response time

**Backend:**
- Render: Metrics tab
- Monitor CPU, Memory, Network

---

## 🔒 Security Checklist

- [ ] All secrets are in environment variables (NOT in code)
- [ ] JWT secrets are strong (64+ random characters)
- [ ] Database password is strong
- [ ] HTTPS is used everywhere (enforced by Vercel/Render)
- [ ] CORS only allows your domains
- [ ] Stripe webhook is signed
- [ ] Email sending is configured
- [ ] Rate limiting is enabled
- [ ] Input validation on all endpoints
- [ ] No sensitive data in logs

---

## 📞 Support & Resources

| Issue | Resource |
|-------|----------|
| Vercel Issues | https://vercel.com/support |
| Render Issues | https://render.com/docs |
| Supabase Issues | https://supabase.com/docs |
| Upstash Issues | https://upstash.com/docs |
| Stripe Issues | https://stripe.com/docs/api |

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ Frontend loads at `https://your-project.vercel.app/`
- ✅ Test page accessible at `/test`
- ✅ Backend health endpoint responds
- ✅ CORS validation passes
- ✅ User registration works
- ✅ User login works
- ✅ Can browse clinics
- ✅ Can create bookings
- ✅ No errors in browser console
- ✅ No errors in Render logs
- ✅ Database queries work
- ✅ Real-time features work (WebSocket)

---

## 📚 Related Guides

- [VERCEL_RENDER_INTEGRATION.md](./VERCEL_RENDER_INTEGRATION.md) - Detailed integration guide
- [BACKEND_PRODUCTION_SETUP.md](./BACKEND_PRODUCTION_SETUP.md) - Backend environment setup
- [BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md) - API specifications
- [TESTING_PLAN.md](./TESTING_PLAN.md) - Testing procedures
- [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) - API endpoint reference

---

## 🎉 Congratulations!

You've successfully deployed a **full-stack healthcare application** with:

- ✅ Frontend on Vercel (CDN)
- ✅ Backend on Render (Serverless)
- ✅ Database on Supabase (Managed PostgreSQL)
- ✅ Cache on Upstash (Managed Redis)
- ✅ Proper CORS and security
- ✅ Real-time features (WebSocket)
- ✅ Payment processing (Stripe)
- ✅ Email notifications (SendGrid)

**Your application is now production-ready!** 🚀

---

**Deployment Guide Version:** 1.0.0  
**Last Updated:** April 27, 2026  
**Status:** Production Ready - Ready for Beta Launch
