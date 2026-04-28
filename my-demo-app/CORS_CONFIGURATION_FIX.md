# CORS Configuration Fix

## Current Issue
Backend is running on Render at: `https://physiobook-api-jvye.onrender.com`
Frontend is running on: `http://localhost:5174` (port 5173 was in use)

Backend CORS configuration doesn't include localhost:5174, causing preflight failures.

## Solution

### **For Development (Local Testing)**

The backend's default CORS configuration should include localhost origins. However, if it doesn't, you have two options:

#### **Option A: Update Backend Environment Variable (If you have Render access)**

Go to: https://dashboard.render.com/

1. Select your `physiobook-api` service
2. Click "Environment" 
3. Find or create the `CORS_ORIGINS` variable
4. Set it to:
```
http://localhost:5173,http://localhost:3000,http://localhost:5174,http://127.0.0.1:5173
```
5. Click "Save"
6. Render will automatically redeploy

**Wait 2-3 minutes for deployment to complete**

#### **Option B: Use Port 5173 Instead**

Kill the current dev server and run on a different port:
```bash
# Kill the server
# Then restart on port 5173:
npm run dev -- --port 5173
```

However, if 5173 is in use by another process, you need to:
```bash
# Find what's using port 5173
lsof -i :5173

# Kill that process if needed
kill -9 <PID>
```

### **For Production (Vercel Deployment)**

Once you deploy to Vercel, you'll get a URL like:
```
https://physiobook-chi.vercel.app
```

Then update CORS_ORIGINS in Render to:
```
http://localhost:5173,http://localhost:3000,http://localhost:5174,http://127.0.0.1:5173,https://physiobook-chi.vercel.app
```

## Testing After Fix

After updating CORS, test with:

```bash
# Test CORS preflight
curl -X OPTIONS "https://physiobook-api-jvye.onrender.com/api/v1/clinics" \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

Should return: `HTTP/2 200` with CORS headers

Or simply open: **http://localhost:5174/test** and it should work

## What's Happening

1. Browser sends preflight OPTIONS request to backend
2. Backend checks if origin is in CORS_ORIGINS whitelist
3. If yes → returns CORS headers → browser allows request
4. If no → returns 403 → browser blocks request

Your frontend can't make requests to backend until CORS is fixed.

## Quick Status Check

✅ Backend health endpoint: https://physiobook-api-jvye.onrender.com/health
❌ Frontend CORS to backend: http://localhost:5174/test (blocked by CORS)

## Next Steps

1. **Option A:** Update CORS_ORIGINS in Render (recommended)
2. **Wait 2-3 minutes** for Render to redeploy  
3. **Test:** Open http://localhost:5174/test
4. **Run diagnostics:** Click "Backend" tab → "Full Diagnostic"
5. All tests should now pass ✅
