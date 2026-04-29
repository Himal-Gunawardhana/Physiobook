# Physiobook

Modern physiotherapy clinic booking platform.

## Stack

- **Frontend**: React + Vite, deployed on [Vercel](https://vercel.com)
- **Backend API**: Node.js, deployed on [Render](https://physiobook-api-jvye.onrender.com)

## Local Development

```bash
cd my-demo-app
npm install
npm run dev
```

Vite proxy forwards `/api/*` and `/health` to the Render backend — no CORS issues locally.

## Production (Vercel)

Vercel proxy rewrites handle `/api/*` and `/health` → Render backend. No environment variables required for the API connection.

## Roles

| Portal | URL |
|--------|-----|
| Patient Booking | `/book` |
| Clinic Admin | `/clinic` |
| Therapist | `/therapist` |
| Super Admin | `/superadmin` |
| API Test Dashboard | `/test` |
