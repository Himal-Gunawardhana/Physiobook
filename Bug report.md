# Physiobook — Patient Flow Bug Report

## ✅ Fixed Bugs (5)

---

### BUG-01 · Checkout skipped — redirected to MyBookings instead of Confirmation
**File:** [Checkout.jsx](file:///c:/Users/User/Documents/it%20self/v3/front%20end/Physiobook/my-demo-app/src/pages/Patient/Checkout.jsx)

**Root cause:** After `api.post('/bookings', ...)` succeeded, the code navigated to `/book/my-bookings` passing only `newBookingId`. The `/book/confirmation` page was being completely skipped, and even if it was visited directly, it would show `N/A` for all fields because no `booking` object was passed.

**Fix:** Changed navigation target to `/book/confirmation` with the full `booking` object in state so the confirmation page can render all appointment details.

---

### BUG-02 · Registration in BookingGate doesn't log the user in
**File:** [BookingGate.jsx](file:///c:/Users/User/Documents/it%20self/v3/front%20end/Physiobook/my-demo-app/src/pages/Patient/BookingGate.jsx)

**Root cause:** The `register()` function in `AuthContext` deliberately does **not** set a token or user (by design, to force email verification on other portals). However, for the patient booking flow, this meant a patient who just registered was immediately redirected with **no session**, landing on the MyBookings "please sign in" dead-end.

**Fix:** After `register()`, automatically call `login(email, password)` so the patient is authenticated immediately. This is safe for patient accounts which don't require email verification before booking.

---

### BUG-03 · SelectTime infinite re-render loop
**File:** [SelectTime.jsx](file:///c:/Users/User/Documents/it%20self/v3/front%20end/Physiobook/my-demo-app/src/pages/Patient/SelectTime.jsx)

**Root cause:** The slots `useEffect` had `therapistAvailability` in its dependency array. When a therapist was selected, the availability effect would load data → update `therapistAvailability` → trigger the slots effect → load slots → which itself (if slots-empty) would re-render → re-trigger availability… causing repeated API calls.

**Fix:** Removed `therapistAvailability` from the slots `useEffect` dependencies. The slots effect already reads `therapistAvailability` inside its body — it doesn't need to re-run *because* availability changed; it re-runs when `therapistId` or `selectedDate` changes (which is the correct trigger).

---

### BUG-04 · Login.jsx always sends patients to MyBookings, ignoring returnTo
**File:** [Login.jsx](file:///c:/Users/User/Documents/it%20self/v3/front%20end/Physiobook/my-demo-app/src/pages/Auth/Login.jsx)

**Root cause:** The post-login redirect had `if (backendRole === 'patient') navigate('/book/my-bookings')` unconditionally, meaning even when `location.state.returnTo` pointed to `/book/checkout` with `bookingState` attached, it was ignored. Applied to both the regular login and 2FA paths.

**Fix:** Check `location.state.returnTo` first. If it's `/book/checkout` with a `bookingState`, navigate there with the booking state restored. Otherwise fall through to `returnTo` generically, then default to `/book/my-bookings` for patients.

---

### BUG-05 · Feedback page has hardcoded therapist name & missing clinicRating in API
**File:** [Feedback.jsx](file:///c:/Users/User/Documents/it%20self/v3/front%20end/Physiobook/my-demo-app/src/pages/Patient/Feedback.jsx)

**Root cause:** (a) The subtitle read "Your session with Dr. Aisha Perera" — a hardcoded placeholder that will appear for every patient, every session. (b) `clinicRating` was collected in the UI but never sent to `api.post('/feedback', ...)` — only `therapistRating` was submitted.

**Fix:** Replaced hardcoded name with a generic description. Added `clinicRating` to the API payload.

---

## 🔍 Additional Bugs Identified (NOT fixed)

---

### BUG-06 · ClinicLanding slug parsing is fragile
**File:** [ClinicLanding.jsx](file:///c:/Users/User/Documents/it%20self/v3/front%20end/Physiobook/my-demo-app/src/pages/Patient/ClinicLanding.jsx#L63)

**Root cause:** The slug is extracted from the URL using:
```js
const slug = location.search?.replace('?', '').split('&')[0];
```
This works for `/book?myClinic` but breaks if the URL has a real query string like `/book?clinic_slug=abc&ref=email`. It would also return `clinic_slug=abc` (the raw param) instead of just `abc`. Should use `URLSearchParams` instead.

**Recommended fix:**
```js
const params = new URLSearchParams(location.search);
const slug = params.get('slug') || location.search?.replace('?', '').split('&')[0];
```

---

### BUG-07 · `BookingConfirmation` shows `N/A` for therapist when auto-assigned
**File:** [BookingConfirmation.jsx](file:///c:/Users/User/Documents/it%20self/v3/front%20end/Physiobook/my-demo-app/src/pages/Patient/BookingConfirmation.jsx#L73)

**Root cause:**
```jsx
{booking.assignedTherapist
  ? `${booking.assignedTherapist.first_name || ''} ${booking.assignedTherapist.last_name || ''}`.trim()
  : 'Therapist will be assigned'}
```
If the booking API response uses a different field name (e.g. `therapist`, `therapist_name`, `therapist_id`), this silently shows "Therapist will be assigned" even when one was assigned. The API response shape is not validated.

**Recommended fix:** Add fallback field names: `booking.assignedTherapist || booking.therapist` and also check `booking.therapist_name`.

---

### BUG-08 · `MyBookings` `formatTime` doesn't handle `HH:MM:SS` time strings
**File:** [MyBookings.jsx](file:///c:/Users/User/Documents/it%20self/v3/front%20end/Physiobook/my-demo-app/src/pages/Patient/MyBookings.jsx#L93-L97)

**Root cause:**
```js
const formatTime = (t) => {
  if (!t) return '—';
  if (t.includes('T')) return new Date(t).toLocaleTimeString(...);
  return t; // ← returns raw "14:30:00" string without formatting
};
```
When the backend returns `booked_time` as `"14:30:00"` (plain time string without `T`), it falls through and displays the raw string `14:30:00` instead of `02:30 PM`.

**Recommended fix:**
```js
if (t.match(/^\d{2}:\d{2}/)) {
  const [h, m] = t.split(':').map(Number);
  return `${((h % 12) || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
```

---

### BUG-09 · `SelectTime` passes full `therapists` array in router state (performance/size issue)
**File:** [SelectTime.jsx](file:///c:/Users/User/Documents/it%20self/v3/front%20end/Physiobook/my-demo-app/src/pages/Patient/SelectTime.jsx#L32)

**Root cause:** The therapists array (potentially large, with profile image URLs and all fields) is stored in `location.state` and re-passed through every navigation step: `ClinicLanding → SelectTime → Checkout`. React Router state is serialized and can cause issues with large payloads, especially in some browsers that limit session history state size.

**Recommended fix:** Store only the `clinicId`/`clinicSlug` and fetch therapists fresh in `SelectTime` via the API rather than passing them through state. This also keeps the data more current.

---

### BUG-10 · `Checkout.jsx` error handler redirects to `/book/register` for all patient/auth errors
**File:** [Checkout.jsx](file:///c:/Users/User/Documents/it%20self/v3/front%20end/Physiobook/my-demo-app/src/pages/Patient/Checkout.jsx#L87-L91)

**Root cause:**
```js
if (errorMsg.toLowerCase().includes('patient') || errorMsg.toLowerCase().includes('authentication')) {
  navigate('/login/patient', ...);
}
```
This redirects to `/login/patient` (the role-based login page) but the patient booking flow uses `/book/register` (BookingGate). Sending the user to `/login/patient` drops them into the generic login portal with no context about continuing the booking.

**Recommended fix:** Change the redirect to `/book/register` with a `pendingBooking` sessionStorage save (consistent with the non-authenticated `submit()` check earlier in the same function).

---

### BUG-11 · `AuthContext` refresh retry runs after component unmount
**File:** [AuthContext.jsx](file:///c:/Users/User/Documents/it%20self/v3/front%20end/Physiobook/my-demo-app/src/context/AuthContext.jsx#L66-L74)

**Root cause:** The retry logic uses `setTimeout(attemptSessionRestore, delay)` but the `cancelled` flag is only checked at the *start* of each attempt, not inside the timeout scheduling call. If the component is unmounted between when `setTimeout` is called and when it fires, `cancelled` becomes `true` but the `return` inside the `if (!cancelled)` block never runs because the closure has already captured the old `cancelled = false` value at retry scheduling time.

**Recommended fix:** Move the `cancelled` check to *before* calling `attemptSessionRestore` inside the `setTimeout` callback:
```js
setTimeout(() => { if (!cancelled) attemptSessionRestore(); }, delay);
```
