# Fix Backend Connection - CORS Error

## The Problem

```
Frontend: http://localhost:5174 (running locally)
Backend: https://physiobook-api-jvye.onrender.com (running on Render)

Browser blocks request because:
- Frontend and backend are on different domains
- Backend CORS headers don't allow localhost:5174
- Error: "Failed to fetch"
```

## The Solution

You need to **add localhost:5174 to the backend's CORS whitelist** in Render.

---

## Step-by-Step Fix

### **Step 1: Go to Render Dashboard**
Open: https://dashboard.render.com/

### **Step 2: Select Your Backend Service**
- Click "physiobook-api" service
- Click the "Environment" tab

### **Step 3: Find or Create CORS_ORIGINS Variable**

Look for an environment variable named `CORS_ORIGINS`

**If it exists:**
- Copy the current value
- Add `http://localhost:5174` to the list

**If it doesn't exist:**
- Click "Add Environment Variable"
- Name: `CORS_ORIGINS`
- Value: See below

### **Step 4: Set the Correct Value**

Set `CORS_ORIGINS` to:
```
http://localhost:5173,http://localhost:3000,http://localhost:5174,http://127.0.0.1:5173
```

**IMPORTANT: No trailing slashes! No spaces!**

### **Step 5: Save and Redeploy**
- Click "Save"
- Render will automatically redeploy (takes 2-3 minutes)
- Wait for status to show "Live"

### **Step 6: Test Again**
- Refresh browser: http://localhost:5174/test
- Click "Backend Health" again
- Should now show ✅ **Backend is healthy and responding**

---

## If You Don't Have Render Access

If you don't have access to the Render dashboard, contact whoever deployed the backend and ask them to:

1. Go to Render dashboard
2. Select physiobook-api service
3. Go to Environment tab
4. Add/Update CORS_ORIGINS to include: `http://localhost:5174`
5. Save and let it redeploy

---

## How to Verify CORS is Fixed

**Command 1: Test health endpoint (should work)**
```bash
curl -s https://physiobook-api-jvye.onrender.com/health | jq .
```
Expected: `{"status":"ok","service":"physiobook-api","version":"1.0.0"}`

**Command 2: Test CORS headers (after fix)**
```bash
curl -s -X OPTIONS "https://physiobook-api-jvye.onrender.com/api/v1/clinics" \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: GET" \
  -v 2>&1 | grep -E "access-control-allow"
```
Expected after fix:
```
< access-control-allow-origin: http://localhost:5174
< access-control-allow-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
< access-control-allow-headers: Content-Type,Authorization,X-Refresh-Token
```

---

## Troubleshooting

**Still getting CORS error?**
1. Check CORS_ORIGINS was saved in Render
2. Check Render deployment completed (status shows "Live")
3. Wait 2-3 minutes after saving
4. Clear browser cache (Ctrl+Shift+Delete) and refresh

**Still getting "Failed to fetch"?**
1. Run command 1 above to verify health endpoint works
2. Check if backend is actually deployed and running
3. Verify the backend URL is correct: https://physiobook-api-jvye.onrender.com

---

## What Happens After Fix

Once CORS is enabled:

✅ Test page health check will pass  
✅ All API endpoints will be accessible  
✅ Frontend can register/login users  
✅ Frontend can fetch clinic data  
✅ Frontend can create bookings  
✅ All test page diagnostics will pass  

---

## Next Steps

1. **Update CORS_ORIGINS in Render** (critical!)
2. **Wait 2-3 minutes** for redeploy
3. **Refresh test page**: http://localhost:5174/test
4. **Click "Check Backend Health"** again
5. Should see ✅ **Backend is healthy and responding**

Do this now and let me know when it's done!
