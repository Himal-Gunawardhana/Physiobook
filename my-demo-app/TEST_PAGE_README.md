# Test Page Documentation

## Overview
A comprehensive testing dashboard for verifying your Physiobook backend (Render) and Supabase database connectivity.

**Access the test page at:** `http://localhost:5173/test` (or your deployed URL + `/test`)

---

## Features

### 🏥 Backend Tests
- **Health Check**: Verifies your Render backend is running
- **CORS Test**: Checks if CORS is properly configured
- **Custom Endpoint Testing**: Test any API endpoint with custom methods and payloads

### 🗄️ Supabase Tests
- **Connection Test**: Verifies Supabase connection
- **Auth Test**: Test login with email/password
- **Table Query**: Query any Supabase table

---

## Setup Instructions

### 1. Install Dependencies
```bash
cd my-demo-app
npm install
```

### 2. Configure Supabase Credentials
Create or update `.env.local` in the `my-demo-app` directory:

```env
# Get these from https://app.supabase.com → Settings → API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Already configured
VITE_BACKEND_URL=https://physiobook-api-jvye.onrender.com
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open Test Page
Navigate to `http://localhost:5173/test`

---

## Using the Test Page

### Backend Tests

#### Health Check
- Tests if your Render backend is accessible
- Looks for a `/api/health` endpoint
- Returns backend status and response

#### CORS Test
- Sends an OPTIONS request to verify CORS headers
- Useful for debugging cross-origin issues

#### Custom Endpoint Testing
1. Enter the API endpoint path (e.g., `/api/clinics`)
2. Select HTTP method (GET, POST, PUT, DELETE)
3. Optionally add JSON body for POST/PUT requests
4. Click "Test Custom Endpoint"
5. View the response with status code and data

### Supabase Tests

#### Connection Test
- Verifies your Supabase credentials are correct
- Tests basic database connectivity
- Checks if environment variables are properly set

#### Auth Test
- Tests Supabase authentication with real credentials
- Enter email and password for any existing user
- Returns user information if successful

#### Query Table
- Tests reading data from Supabase tables
- Enter the table name (e.g., `users`, `clinics`, `bookings`)
- Returns up to 5 rows from the table
- Useful for verifying data structure

---

## Example Test Scenarios

### Scenario 1: Verify Backend is Running
1. Go to Test Page
2. Click "🏥 Test Backend Health"
3. ✓ Success = Backend is reachable
4. ✗ Error = Check Render deployment or URL

### Scenario 2: Test API Endpoint
1. Go to Backend Tests section
2. Enter endpoint: `/api/clinics`
3. Select method: `GET`
4. Click "Test Custom Endpoint"
5. View returned clinic data

### Scenario 3: Verify Supabase Connection
1. Go to Supabase Tests section
2. Click "🔌 Test Supabase Connection"
3. ✓ Success = Credentials are correct
4. ✗ Error = Check `.env.local` configuration

### Scenario 4: Query a Table
1. Go to Supabase Tests section
2. Enter table name (e.g., `clinics`)
3. Click "Query Table"
4. View sample data from that table

---

## Troubleshooting

### Backend Tests Fail
- ✓ Verify Render deployment is active
- ✓ Check backend URL in test page (should be `https://physiobook-api-jvye.onrender.com`)
- ✓ Verify CORS is enabled in your backend
- ✓ Check browser console for more details

### Supabase Tests Fail
- ✓ Verify `.env.local` exists in `my-demo-app` directory
- ✓ Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- ✓ Get credentials from: `https://app.supabase.com` → Your Project → Settings → API
- ✓ Restart dev server after adding/changing `.env.local`

### "Missing Supabase credentials" Error
- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Click Settings → API
- Copy the Project URL and Anon Key
- Add them to `.env.local`
- Restart dev server

### Table Query Returns Empty
- ✓ Verify table name is correct
- ✓ Check table exists in your Supabase database
- ✓ Verify RLS (Row Level Security) policies allow reads
- ✓ Check that the table actually contains data

---

## Files Structure

```
my-demo-app/
├── .env.local                 # Supabase configuration
├── src/
│   ├── config/
│   │   └── supabase.js       # Supabase client setup
│   ├── utils/
│   │   └── testApi.js        # Test utility functions
│   ├── pages/
│   │   └── TestPage.jsx      # Main test page component
│   ├── styles/
│   │   └── test.css          # Test page styles
│   └── App.jsx               # Updated with /test route
```

---

## API Response Format

All test results follow this format:
```json
{
  "success": true,           // Whether the test passed
  "status": 200,            // HTTP status code
  "message": "Success",     // Human-readable message
  "data": { ... },          // Response data
  "error": null,            // Error message if failed
  "timestamp": "12:34:56"   // When the test ran
}
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `VITE_BACKEND_URL` | Render backend URL | `https://physiobook-api-jvye.onrender.com` |

---

## Tips & Best Practices

1. **Test in Order**: Always test backend health first, then Supabase connection
2. **Check Browser Console**: DevTools (F12) shows detailed error messages
3. **Use Custom Endpoints**: Test each API route individually to isolate issues
4. **Verify Data**: Use table queries to confirm data structure
5. **Test After Deployment**: Rerun tests after deploying changes
6. **Keep Logs**: Note timestamps of successful tests for debugging

---

## Next Steps

After successful tests:
1. Integrate API calls into your components using the test results as reference
2. Update `testApi.js` with additional endpoints as needed
3. Create error handling based on test scenarios
4. Remove test page from production (optional)

---

## Support

If tests fail:
1. Check the error message in the result box
2. Verify environment configuration
3. Check backend logs on Render dashboard
4. Check Supabase logs in the Supabase dashboard
5. Review browser DevTools console for additional details

