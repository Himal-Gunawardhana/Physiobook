# Physiobook Frontend (Demo App) - Complete Documentation

**For: Backend Development Team**
**Version:** 1.0.0
**Last Updated:** April 27, 2026

---

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Routes & Pages](#routes--pages)
5. [User Roles & Flows](#user-roles--flows)
6. [API Integration](#api-integration)
7. [Testing & Development](#testing--development)
8. [Environment Configuration](#environment-configuration)

---

## 🏗️ Architecture Overview

### **What is This App?**
A **multi-role healthcare booking system** frontend for Physiobook - a physiotherapy clinic booking platform. It's built with React (Vite) and connects to a Node.js/Express backend.

### **Core Purpose**
- **Patients** can browse clinics and book physiotherapy appointments
- **Clinic Admins** manage staff, services, bookings, and payments
- **Therapists** view schedules, chat with patients, and take notes
- **Super Admins** manage the entire platform (clinics, subscriptions, tickets)

### **Architecture Diagram**

```
┌─────────────────────────────────────────────────────────┐
│            PHYSIOBOOK FRONTEND (React + Vite)           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐ │
│  │  Auth   │  │ Patient  │  │ Clinic  │  │Therapist │ │
│  │  Pages  │  │  Pages   │  │ Admin   │  │  Pages   │ │
│  └────┬────┘  └────┬─────┘  └────┬────┘  └────┬─────┘ │
│       │            │             │             │       │
│       └────────────┴─────────────┴─────────────┘       │
│                    │                                    │
│         ┌──────────▼──────────┐                        │
│         │   Test Page (🧪)    │                        │
│         │  (API Testing Tool) │                        │
│         └──────────┬──────────┘                        │
│                    │                                    │
└────────────────────┼────────────────────────────────────┘
                     │
                     │ HTTP Requests
                     │ (/api/v1/*)
                     ▼
      ┌──────────────────────────────┐
      │   BACKEND (Express + Node)   │
      │   https://physiobook-api... │
      │   (Deployed on Render)       │
      └──────────────────────────────┘
                     │
         ┌───────────┴────────────┐
         │                        │
         ▼                        ▼
    PostgreSQL             Redis Cache
    (Database)             (Real-time)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Build Tool** | Vite | 6.3.5 |
| **Framework** | React | 19.1.0 |
| **Routing** | React Router | 6.30.3 |
| **HTTP Client** | Fetch API (built-in) | - |
| **Database Client** | Supabase JS | 2.39.3 |
| **Icons** | Lucide React | 1.8.0 |
| **Styling** | CSS (custom) | - |
| **Linting** | ESLint | 9.25.0 |

---

## 📂 Project Structure

```
my-demo-app/
├── src/
│   ├── pages/                      # All page components
│   │   ├── Auth/
│   │   │   ├── Login.jsx          # User login (all roles)
│   │   │   └── Register.jsx       # User registration
│   │   ├── Patient/
│   │   │   ├── ClinicLanding.jsx      # Browse clinics
│   │   │   ├── SelectTime.jsx         # Choose appointment time
│   │   │   ├── Checkout.jsx           # Payment & booking confirmation
│   │   │   ├── BookingGate.jsx        # Patient booking entry
│   │   │   ├── BookingConfirmation.jsx # Success screen
│   │   │   ├── Feedback.jsx           # Post-appointment feedback
│   │   │   └── MyBookings.jsx         # View all bookings
│   │   ├── ClinicAdmin/
│   │   │   ├── Dashboard.jsx       # Admin home page
│   │   │   ├── StaffManagement.jsx # Manage therapists/staff
│   │   │   ├── Services.jsx        # Manage clinic services
│   │   │   ├── Payments.jsx        # View revenue & payments
│   │   │   ├── BookingPage.jsx     # Manage bookings
│   │   │   ├── Account.jsx         # Clinic profile
│   │   │   └── Settings.jsx        # Clinic settings
│   │   ├── Therapist/
│   │   │   ├── Schedule.jsx        # View daily schedule
│   │   │   ├── PatientChat.jsx     # Chat with patients
│   │   │   └── SessionNotes.jsx    # Take clinical notes
│   │   ├── SuperAdmin/
│   │   │   ├── Overview.jsx        # Platform overview
│   │   │   ├── Subscriptions.jsx   # Manage subscriptions
│   │   │   └── Tickets.jsx         # Support tickets
│   │   ├── Home.jsx                # Landing page
│   │   └── TestPage.jsx            # 🧪 API Testing Dashboard
│   ├── components/
│   │   └── Sidebar.jsx             # Navigation sidebar
│   ├── config/
│   │   └── supabase.js             # Supabase client setup
│   ├── utils/
│   │   └── testApi.js              # API testing utilities
│   ├── styles/
│   │   ├── global.css              # Global styles
│   │   ├── auth.css                # Auth page styles
│   │   └── test.css                # Test page styles
│   ├── assets/                     # Images, icons
│   ├── App.jsx                     # Main app component (routing)
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Index styles
├── public/                         # Static files
├── .env.local                      # Environment variables (local)
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
├── eslint.config.js                # Linting rules
├── TEST_PAGE_README.md             # Test page documentation
└── README.md                       # Project readme
```

---

## 🛣️ Routes & Pages

### **Public Routes** (No Authentication Required)
```
GET  /                    → Home page
GET  /test                → API Test Dashboard (🧪)
```

### **Auth Routes**
```
GET  /login/:role         → Login page (role: patient, clinic, therapist, superadmin)
GET  /register/:role      → Registration page
```

### **Patient Routes**
```
GET  /book                    → Browse clinics
GET  /book/register           → Patient booking entry
GET  /book/time               → Select appointment time
GET  /book/checkout           → Payment & confirmation
GET  /book/confirmation       → Booking success
GET  /book/feedback           → Post-appointment feedback
GET  /book/my-bookings        → View my appointments
```

### **Clinic Admin Routes** (Protected)
```
GET  /clinic                  → Dashboard (home)
GET  /clinic/staff            → Staff management
GET  /clinic/services         → Service management
GET  /clinic/payments         → Revenue & payments
GET  /clinic/booking-page     → Manage bookings
GET  /clinic/account          → Clinic profile
GET  /clinic/settings         → Clinic settings
```

### **Therapist Routes** (Protected)
```
GET  /therapist               → Schedule (home)
GET  /therapist/chat          → Chat with patients
GET  /therapist/notes         → Clinical notes
```

### **Super Admin Routes** (Protected)
```
GET  /superadmin              → Overview (home)
GET  /superadmin/tickets      → Support tickets
GET  /superadmin/subscriptions → Manage subscriptions
```

---

## 👥 User Roles & Flows

### **1. PATIENT Flow**
```
1. Visit /book → Browse clinics
2. Select clinic → View therapists & services
3. Choose date/time → /book/time
4. Review & pay → /book/checkout
5. Confirm → /book/confirmation
6. Receive confirmation email
7. View bookings → /book/my-bookings
8. Post-appointment feedback → /book/feedback
```

### **2. CLINIC ADMIN Flow**
```
1. Login at /login/clinic
2. Dashboard → /clinic (overview)
3. Manage staff → /clinic/staff
4. Manage services → /clinic/services
5. View/manage bookings → /clinic/booking-page
6. View payments → /clinic/payments
7. Manage clinic info → /clinic/account
8. Clinic settings → /clinic/settings
```

### **3. THERAPIST Flow**
```
1. Login at /login/therapist
2. View schedule → /therapist (daily view)
3. Chat with patients → /therapist/chat
4. Take notes → /therapist/notes
```

### **4. SUPER ADMIN Flow**
```
1. Login at /login/superadmin
2. Platform overview → /superadmin
3. Manage subscriptions → /superadmin/subscriptions
4. Support tickets → /superadmin/tickets
```

---

## 🔌 API Integration

### **Backend URL**
```
https://physiobook-api-jvye.onrender.com/api/v1
```

### **API Base Path**
All requests are made to: `/api/v1/{endpoint}`

### **Authentication**
- **Method:** JWT Bearer Token
- **Header:** `Authorization: Bearer <token>`
- **Stored in:** LocalStorage (`physiobook_auth_token`)
- **Auto-included:** All requests (except auth endpoints)

### **Example API Calls**

**1. Register User**
```
POST /api/v1/auth/register
Headers: Content-Type: application/json
Body: {
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**2. Login**
```
POST /api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  "email": "john@example.com",
  "password": "SecurePass123"
}
Response: {
  "accessToken": "eyJhbGc...",
  "user": { "id": "...", "email": "...", "role": "..." }
}
```

**3. Get All Clinics**
```
GET /api/v1/clinics
Headers: Authorization: Bearer <token>
Response: [
  { "id": "c1", "name": "Elite Physio", "city": "New York", ... }
]
```

**4. Get Available Slots**
```
GET /api/v1/bookings/slots?therapistId=t1&date=2026-05-01&serviceDuration=60
Headers: Authorization: Bearer <token>
Response: [
  { "startTime": "09:00", "endTime": "10:00" },
  { "startTime": "10:00", "endTime": "11:00" }
]
```

**5. Create Booking**
```
POST /api/v1/bookings
Headers: 
  - Authorization: Bearer <token>
  - Content-Type: application/json
Body: {
  "clinicId": "c1",
  "therapistId": "t1",
  "serviceId": "s1",
  "appointmentDate": "2026-05-01",
  "startTime": "09:00",
  "endTime": "10:00"
}
```

### **Endpoints Used by Frontend**

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/auth/register` | POST | Register new user | ❌ |
| `/auth/login` | POST | User login | ❌ |
| `/auth/logout` | POST | User logout | ✅ |
| `/users/me` | GET | Get current user | ✅ |
| `/users/me` | PUT | Update profile | ✅ |
| `/clinics` | GET | List all clinics | ✅ |
| `/clinics/:id` | GET | Get clinic details | ✅ |
| `/clinics/:id/services` | GET | Get clinic services | ✅ |
| `/staff` | GET | List clinic staff | ✅ |
| `/staff/therapists/:id/availability` | GET | Get therapist availability | ✅ |
| `/bookings` | GET | List user bookings | ✅ |
| `/bookings/slots` | GET | Get available slots | ✅ |
| `/bookings` | POST | Create booking | ✅ |
| `/bookings/:id` | GET | Get booking details | ✅ |
| `/bookings/:id/status` | PATCH | Update booking status | ✅ |
| `/payments` | GET | List payments | ✅ |
| `/communications/conversations` | GET | Get conversations | ✅ |
| `/communications/conversations` | POST | Create conversation | ✅ |
| `/communications/conversations/:id/messages` | GET | Get chat messages | ✅ |
| `/communications/conversations/:id/messages` | POST | Send message | ✅ |

---

## 🧪 Testing & Development

### **Test Page** (`/test`)
The frontend includes a **comprehensive API testing dashboard** at `/test`

**Features:**
- ✅ Auth testing (register, login, get user)
- ✅ Backend health check
- ✅ CORS verification
- ✅ Clinic endpoints testing
- ✅ Booking endpoints testing
- ✅ Custom endpoint tester
- ✅ Supabase connection test
- ✅ Full diagnostic report

**How to Use:**
1. Run: `npm run dev`
2. Go to: `http://localhost:5173/test`
3. Test each feature as needed

---

## 🔧 Environment Configuration

### **.env.local File**
```env
# Supabase (Optional - for real-time features)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Backend
VITE_BACKEND_URL=https://physiobook-api-jvye.onrender.com
```

### **Environment Variables in Code**
```javascript
// Accessed via: import.meta.env.VITE_*
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
```

---

## 📊 Data Models

### **User**
```javascript
{
  id: UUID,
  email: string,
  password: string (hashed),
  firstName: string,
  lastName: string,
  phone: string (optional),
  role: 'patient' | 'clinic_admin' | 'therapist' | 'super_admin',
  avatar: string (URL, optional),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **Clinic**
```javascript
{
  id: UUID,
  name: string,
  email: string,
  phone: string,
  addressLine1: string,
  addressLine2: string (optional),
  city: string,
  state: string,
  postalCode: string,
  country: string,
  operatingHours: {
    Monday: { start: "09:00", end: "18:00" },
    // ... other days
  },
  services: Service[],
  staff: StaffMember[],
  subscriptionStatus: 'active' | 'inactive',
  createdAt: timestamp
}
```

### **Booking**
```javascript
{
  id: UUID,
  clinicId: UUID,
  patientId: UUID,
  therapistId: UUID,
  serviceId: UUID,
  appointmentDate: date,
  startTime: time,
  endTime: time,
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show',
  paymentId: UUID (optional),
  notes: string (optional),
  createdAt: timestamp
}
```

### **Payment**
```javascript
{
  id: UUID,
  bookingId: UUID,
  amount: decimal,
  currency: string (default: USD),
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  stripePaymentId: string,
  createdAt: timestamp
}
```

---

## 🚀 Development Workflow

### **Local Development**
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

### **Deployment**
Frontend is ready to deploy to:
- Vercel (recommended - config file included)
- Netlify
- GitHub Pages
- Any static hosting

---

## 🔒 Security Notes

1. **JWT Token Storage:** LocalStorage (consider using HttpOnly cookies for production)
2. **CORS:** Enabled for localhost during development
3. **Password Requirements:** Min 8 chars, uppercase, lowercase, number
4. **API Authentication:** All protected routes require valid JWT token
5. **HTTPS Required:** In production, all API calls must use HTTPS

---

## 📞 Support & Resources

### **Test Page Documentation**
See `TEST_PAGE_README.md` for detailed testing instructions

### **Troubleshooting**
| Issue | Solution |
|-------|----------|
| **Backend not responding** | Check backend health test on /test page |
| **CORS errors** | Backend CORS origins need to include frontend URL |
| **Auth token not saving** | Check browser LocalStorage |
| **API returning 401** | Token expired - login again |
| **API returning 404** | Check endpoint path and API version (/api/v1/) |

---

## ✅ Frontend Ready For:

- ✅ API Integration (all endpoints)
- ✅ User Authentication (all roles)
- ✅ Booking Management (creation, viewing, updates)
- ✅ Payment Integration (ready for Stripe)
- ✅ Real-time Chat (WebSocket ready)
- ✅ File Upload (avatar, documents)
- ✅ Responsive Design (mobile, tablet, desktop)
- ✅ Error Handling (with user feedback)

---

## 📝 Next Steps for Backend Team

1. ✅ Enable CORS for `http://localhost:5173`
2. ✅ Ensure all auth endpoints return JWT token
3. ✅ Verify all API endpoints return correct data format
4. ✅ Test pagination (if applicable)
5. ✅ Setup email notifications
6. ✅ Configure Stripe webhook (for payments)
7. ✅ Setup WebSocket for real-time features

---

**Document Version:** 1.0
**Last Updated:** April 27, 2026
**Contact:** Backend Development Team
