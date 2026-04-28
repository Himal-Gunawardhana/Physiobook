# Backend Production Setup Guide (Render + Vercel)

**Backend:** Node.js Express API  
**Hosting:** Render  
**Frontend:** React (Vite) on Vercel  
**Database:** PostgreSQL (Supabase)  
**Cache:** Redis (Upstash)  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Vercel Frontend URL](#vercel-frontend-url)
3. [Environment Variables](#environment-variables)
4. [CORS Configuration](#cors-configuration)
5. [Render Deployment](#render-deployment)
6. [Database Setup](#database-setup)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

- Backend repository pushed to GitHub
- Vercel frontend deployed (get URL from Vercel dashboard)
- Supabase account with PostgreSQL database
- Upstash Redis account (optional but recommended)
- Stripe account (for payments)
- SendGrid account (for email)

---

## 🔗 Vercel Frontend URL

**Get your Vercel URL:**

1. Go to: https://vercel.com/dashboard
2. Find your Physiobook project
3. Copy the **URL** at the top
4. Format: `https://your-project-name.vercel.app/`

**Example:** `https://physiobook-chi.vercel.app/`

**Keep this URL handy** - You'll need it for CORS configuration

---

## 🔐 Environment Variables

All of these go in your **Render Environment** section.

### **1. Application Settings**

```
NODE_ENV=production
API_VERSION=v1
PORT=4000
```

### **2. CORS Origins (CRITICAL!)**

```
CORS_ORIGINS=https://physiobook-chi.vercel.app,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

**Replace `physiobook-chi.vercel.app` with your actual Vercel URL**

⚠️ **Important:**
- No trailing slashes
- Separate multiple origins with commas
- Include localhost URLs for local development/testing
- Format: `https://yourproject.vercel.app` (NOT `https://yourproject.vercel.app/`)

### **3. JWT Configuration**

Generate strong random strings (use `openssl rand -base64 32` for each):

```
JWT_ACCESS_SECRET=YOUR_STRONG_SECRET_MIN_64_CHARS_HERE
JWT_REFRESH_SECRET=YOUR_ANOTHER_STRONG_SECRET_MIN_64_CHARS_HERE
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### **4. Database (PostgreSQL via Supabase)**

Get these from: https://app.supabase.com → Settings → Database

```
DATABASE_URL=postgresql://user:password@host:5432/database_name?sslmode=require
```

Or individual settings:
```
DB_HOST=db.xxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=postgres
DB_SSL=true
```

### **5. Redis (Cache/Session)**

Get these from: https://console.upstash.com

```
REDIS_URL=redis://default:password@host:port
```

Or individual settings:
```
REDIS_HOST=your-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_password_here
```

### **6. Stripe (Payments)**

Get from: https://dashboard.stripe.com/apikeys

```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### **7. SendGrid (Email)**

Get from: https://app.sendgrid.com/settings/api_keys

```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@physiobook.com
```

### **8. AWS (File Upload - Optional)**

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key_id
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name
```

### **9. Logging**

```
LOG_LEVEL=info
```

### **Summary - Copy-Paste Template**

```
# Application
NODE_ENV=production
API_VERSION=v1
PORT=4000

# CORS (Replace with your Vercel URL!)
CORS_ORIGINS=https://physiobook-chi.vercel.app,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# JWT
JWT_ACCESS_SECRET=REPLACE_WITH_STRONG_RANDOM_STRING_MIN_64_CHARS
JWT_REFRESH_SECRET=REPLACE_WITH_ANOTHER_RANDOM_STRING_MIN_64_CHARS
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database - Supabase
DATABASE_URL=postgresql://user:password@db.xxx.supabase.co:5432/postgres?sslmode=require

# Redis - Upstash
REDIS_URL=redis://default:password@your-host.upstash.io:6379

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@physiobook.com

# Logging
LOG_LEVEL=info
```

---

## 🌐 CORS Configuration (Critical!)

### **What is CORS?**

CORS (Cross-Origin Resource Sharing) allows your frontend to make requests to your backend. Without proper CORS configuration, the frontend will get "Failed to fetch" errors.

### **Why It Matters**

- ❌ **Without CORS:** Vercel frontend cannot call Render backend
- ✅ **With CORS:** Requests are allowed and work perfectly

### **How to Configure**

**Step 1:** Identify your frontend URL
```
Example: https://physiobook-chi.vercel.app/
```

**Step 2:** Add to CORS_ORIGINS
```
CORS_ORIGINS=https://physiobook-chi.vercel.app,http://localhost:5173
```

**Step 3:** Make sure NO trailing slashes
```
✅ Correct:   https://physiobook-chi.vercel.app
❌ Wrong:     https://physiobook-chi.vercel.app/
```

**Step 4:** Deploy to Render
- Render auto-deploys when environment changes

**Step 5:** Test CORS
```bash
curl -X OPTIONS https://your-backend-url/api/v1/clinics \
  -H "Origin: https://your-frontend-url" \
  -v
```

Should return:
```
access-control-allow-origin: https://your-frontend-url
access-control-allow-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
```

---

## 🚀 Render Deployment

### **Option 1: Automatic Deployment (Recommended)**

1. **Connect GitHub Repository**
   - Go to: https://dashboard.render.com/
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select physiobook-backend repository

2. **Configure Service**
   - **Name:** physiobook-api
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build` (if applicable)
   - **Start Command:** `node server.js` or `npm start`
   - **Region:** Choose closest to your users

3. **Add Environment Variables**
   - Click "Advanced" → "Add Environment Variable"
   - Add all variables from [Environment Variables](#environment-variables) section
   - **CRITICAL:** Set CORS_ORIGINS correctly!

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-5 minutes)
   - Note your deployment URL (e.g., `https://physiobook-api-xxxx.onrender.com`)

5. **Auto-Deployments (Optional)**
   - Enable "Auto-Deploy" to redeploy on every GitHub push

### **Option 2: Manual Redeploy**

After making backend changes:
```bash
# Push to GitHub
git push

# In Render Dashboard:
# 1. Select service
# 2. Click "Manual Deploy"
# 3. Choose branch and deploy
```

### **Verify Deployment**

```bash
# Test health endpoint
curl https://your-backend-url/health

# Should return:
{
  "status": "ok",
  "service": "physiobook-api",
  "version": "1.0.0",
  "timestamp": "2026-04-27T10:00:00Z"
}
```

---

## 📦 Database Setup

### **PostgreSQL (Supabase)**

1. **Create Supabase Project**
   - Go to: https://supabase.com/
   - Create new project
   - Note the **Connection String**

2. **Run Migrations**
   ```bash
   # In backend directory
   npm run migrate:up
   # or
   node migrations/run.js
   ```

3. **Seed Data (Optional)**
   ```bash
   npm run seed
   # or
   node migrations/seed.js
   ```

### **Redis (Upstash)**

1. **Create Redis Database**
   - Go to: https://console.upstash.com/
   - Create new database
   - Get **Redis URL**

2. **No setup needed** - Redis is ready to use

---

## ✅ Verification Checklist

### **Backend Checklist**

- [ ] Backend repository on GitHub
- [ ] Render deployment created
- [ ] All environment variables set (especially CORS_ORIGINS!)
- [ ] Health endpoint responds: `https://your-backend-url/health`
- [ ] Database migrations completed
- [ ] Redis connection working
- [ ] Logs show no errors

### **Frontend + Backend Connection**

- [ ] Vercel frontend deployed
- [ ] Test page accessible at `https://your-frontend-url/test`
- [ ] Health check passes on test page ✅
- [ ] CORS validation passes ✅
- [ ] Can register new user ✅
- [ ] Can login ✅
- [ ] Can browse clinics ✅
- [ ] No CORS errors in browser console ✅

---

## 🔍 Troubleshooting

### **Issue: CORS Error "No 'Access-Control-Allow-Origin' Header"**

**Causes:**
1. CORS_ORIGINS doesn't include frontend URL
2. URL has trailing slash or wrong format
3. Render not redeployed after CORS change

**Fix:**
```bash
# 1. Check Render dashboard → Environment Variables
# 2. Verify CORS_ORIGINS format:
#    ✅ https://yourproject.vercel.app
#    ❌ https://yourproject.vercel.app/

# 3. Manually trigger redeploy in Render

# 4. Wait 2-3 minutes and test again
```

### **Issue: "Failed to fetch" Error**

**Causes:**
1. Backend URL is wrong
2. Backend is down/not deployed
3. Network connectivity issue

**Fix:**
```bash
# Test backend directly
curl https://your-backend-url/health

# If no response:
# 1. Check Render dashboard → Logs
# 2. Verify backend is deployed and running
# 3. Check if app crashed (look for error messages)
```

### **Issue: 401 Unauthorized**

**Causes:**
1. JWT token invalid
2. JWT secret mismatch between deployments
3. Token expired

**Fix:**
```bash
# Check JWT secrets are set in Render
# Re-login to get new token
# Check token is in localStorage
```

### **Issue: 500 Internal Server Error**

**Causes:**
1. Database connection failed
2. Redis connection failed
3. Unhandled error in code

**Fix:**
```bash
# Check Render logs for error message
# Verify DATABASE_URL is correct
# Verify REDIS_URL is correct
# Check all environment variables are set
```

### **Issue: Database Connection Failed**

**Causes:**
1. DATABASE_URL is wrong
2. Database is down
3. Database credentials incorrect

**Fix:**
```bash
# Verify DATABASE_URL format:
# postgresql://user:password@host:port/database?sslmode=require

# Test connection:
# psql "your-database-url"

# Or use Supabase console to verify database is running
```

---

## 📞 Quick Reference URLs

| Service | URL |
|---------|-----|
| **Render Dashboard** | https://dashboard.render.com/ |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Supabase Console** | https://app.supabase.com/ |
| **Upstash Console** | https://console.upstash.com/ |
| **Stripe Dashboard** | https://dashboard.stripe.com/ |
| **SendGrid Accounts** | https://app.sendgrid.com/ |

---

## 📚 Related Documentation

- [VERCEL_RENDER_INTEGRATION.md](./VERCEL_RENDER_INTEGRATION.md) - Integration guide
- [BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md) - API specifications
- [BACKEND_RESTRUCTURING_GUIDE.md](./BACKEND_RESTRUCTURING_GUIDE.md) - Backend setup
- [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) - Integration steps

---

## 🎉 Success Indicators

Your backend is **production-ready** when:

✅ Render deployment successful  
✅ Health endpoint responds  
✅ CORS validation passes  
✅ Database migrations completed  
✅ All environment variables set  
✅ Frontend can connect to backend  
✅ No errors in Render logs  
✅ Test page shows all green ✅  

---

**Backend Setup Guide Version:** 1.0.0  
**Last Updated:** April 27, 2026  
**Status:** Production Ready
