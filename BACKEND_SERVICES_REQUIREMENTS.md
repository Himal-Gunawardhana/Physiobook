# Backend API Requirements - Services, Equipment & Packages Tab

## Overview
The frontend Services/Equipment/Packages management tab requires proper CRUD endpoints with correct data serialization. Current issues: data not persisting on update, edit values not populating, responses not matching expectations.

---

## 1. EQUIPMENT MANAGEMENT

### 1.1 GET - List All Equipment
**Endpoint:** `GET /api/v1/clinics/{clinicId}/equipment`

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "name": "Laser Therapy Unit",
      "qty": 2,
      "quantity": 2,
      "status": "Active",
      "portable": false,
      "clinic_id": "uuid-string",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Field Details:**
- `id` (string, UUID): Unique identifier
- `name` (string): Equipment name (e.g., "Laser Therapy Unit")
- `qty` OR `quantity` (integer): Current quantity in stock
- `status` (string): One of `Active`, `Needs Maintenance`, `Inactive`
- `portable` (boolean): `true` for home visit capable, `false` for clinic only
- `clinic_id` (string, UUID): Which clinic owns this equipment

### 1.2 POST - Create Equipment
**Endpoint:** `POST /api/v1/clinics/{clinicId}/equipment`

**Request Body:**
```json
{
  "name": "Laser Therapy Unit",
  "qty": 2,
  "status": "Active",
  "portable": false
}
```

**Response:** Same as GET single item (return created equipment with all fields)

### 1.3 PUT - Update Equipment
**Endpoint:** `PUT /api/v1/equipment/{id}` OR `PUT /api/v1/clinics/{clinicId}/equipment/{id}`

**Request Body:**
```json
{
  "qty": 3,
  "status": "Needs Maintenance",
  "portable": true
}
```

**Response:** Return updated equipment with ALL fields populated (name, id, qty, status, portable, etc.)

**⚠️ CRITICAL:** When updating, return the COMPLETE updated object, not just the fields that changed.

### 1.4 DELETE - Remove Equipment
**Endpoint:** `DELETE /api/v1/clinics/{clinicId}/equipment/{id}`

**Response:**
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

---

## 2. SERVICES MANAGEMENT

### 2.1 GET - List All Services
**Endpoint:** `GET /api/v1/clinics/{clinicId}/services`

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "name": "Laser Therapy Session",
      "duration": "30 min",
      "type": "Clinical",
      "staff": "Physiotherapist",
      "required_staff": "Physiotherapist",
      "equipment": "Laser Unit",
      "required_equipment": "Laser Unit",
      "clinic_id": "uuid-string",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Field Details:**
- `id` (string, UUID): Unique identifier
- `name` (string): Service name (e.g., "Laser Therapy Session")
- `duration` (string): Session duration (e.g., "30 min", "1 hour")
- `type` (string): One of `Clinical`, `External`
- `staff` OR `required_staff` (string): Required staff type. One of:
  - `Physiotherapist`
  - `Doctor`
  - `Specialized Physio`
  - `Physio + Nurse`
- `equipment` OR `required_equipment` (string): Equipment needed or `None`
- `clinic_id` (string, UUID): Which clinic provides this service

### 2.2 POST - Create Service
**Endpoint:** `POST /api/v1/clinics/{clinicId}/services`

**Request Body:**
```json
{
  "name": "Laser Therapy Session",
  "duration": "30 min",
  "type": "Clinical",
  "staff": "Physiotherapist",
  "equipment": "Laser Unit"
}
```

**Response:** Return created service with ALL fields

### 2.3 PUT - Update Service
**Endpoint:** `PUT /api/v1/services/{id}` OR `PUT /api/v1/clinics/{clinicId}/services/{id}`

**Request Body:**
```json
{
  "name": "Laser Therapy Session",
  "duration": "45 min",
  "type": "Clinical",
  "staff": "Physiotherapist",
  "equipment": "Laser Unit"
}
```

**Response:** Return updated service with ALL fields populated

**⚠️ CRITICAL:** Return complete object with all fields (id, name, duration, type, staff, equipment, clinic_id, timestamps)

### 2.4 DELETE - Remove Service
**Endpoint:** `DELETE /api/v1/clinics/{clinicId}/services/{id}`

**Response:**
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

---

## 3. PACKAGES MANAGEMENT

### 3.1 GET - List All Packages
**Endpoint:** `GET /api/v1/clinics/{clinicId}/packages`

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "name": "10× Post-Natal Rehab",
      "includes": "10 Post-Natal Sessions",
      "description": "10 Post-Natal Sessions",
      "base_price": 25000,
      "base": 25000,
      "discount_percent": 15,
      "discount": 15,
      "fast": true,
      "is_fast_track": true,
      "clinic_id": "uuid-string",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Field Details:**
- `id` (string, UUID): Unique identifier
- `name` (string): Package name (e.g., "10× Post-Natal Rehab")
- `includes` OR `description` (string): What's included in the package
- `base_price` OR `base` (number): Base price in LKR (currency)
- `discount_percent` OR `discount` (number): Discount percentage (0-100)
- `fast` OR `is_fast_track` (boolean): Whether to show as fast-track option
- `clinic_id` (string, UUID): Which clinic offers this package

### 3.2 POST - Create Package
**Endpoint:** `POST /api/v1/clinics/{clinicId}/packages`

**Request Body:**
```json
{
  "name": "10× Post-Natal Rehab",
  "includes": "10 Post-Natal Sessions",
  "base_price": 25000,
  "discount_percent": 15,
  "fast": true
}
```

**Response:** Return created package with ALL fields

### 3.3 PUT - Update Package
**Endpoint:** `PUT /api/v1/clinics/{clinicId}/packages/{id}`

**Request Body:**
```json
{
  "name": "10× Post-Natal Rehab",
  "includes": "10 Post-Natal Sessions",
  "base_price": 27000,
  "discount_percent": 12,
  "fast": true
}
```

**Response:** Return updated package with ALL fields

**⚠️ CRITICAL:** Return complete object with all fields (id, name, includes, base_price, discount_percent, fast, clinic_id, timestamps)

### 3.4 DELETE - Remove Package
**Endpoint:** `DELETE /api/v1/clinics/{clinicId}/packages/{id}`

**Response:**
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

---

## 4. KEY REQUIREMENTS & CRITICAL ISSUES

### 4.1 Data Serialization ⚠️
**Current Issue:** Frontend receives partial data or null values

**Fix Required:**
- ALL GET/POST/PUT endpoints must return the COMPLETE object with every field populated
- No partial responses or null fields
- Include timestamps (created_at, updated_at)
- Include the clinic_id for reference

### 4.2 Field Name Aliases
Backend should support BOTH field names in responses (for backward compatibility):
- `qty` AND `quantity` for equipment
- `staff` AND `required_staff` for services
- `equipment` AND `required_equipment` for services
- `base` AND `base_price` for packages
- `discount` AND `discount_percent` for packages
- `fast` AND `is_fast_track` for packages

### 4.3 Response Wrapper Format
All endpoints should follow this format:
```json
{
  "success": true,
  "data": { /* the actual resource(s) */ }
}
```

On error:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Human readable error"
}
```

### 4.4 Validation Rules
- Equipment name: required, non-empty string
- Equipment qty: positive integer
- Equipment status: must be one of `Active`, `Needs Maintenance`, `Inactive`
- Equipment portable: boolean
- Service name: required, non-empty string
- Service type: must be one of `Clinical`, `External`
- Service staff: must be one of listed options or null
- Package name: required, non-empty string
- Package base_price: positive number
- Package discount_percent: 0-100 range

### 4.5 Clinic ID Authorization
- All endpoints must verify clinic_id ownership
- User should only be able to CRUD their own clinic's resources
- Return 403 Forbidden if user tries to access another clinic's data

---

## 5. TESTING CHECKLIST

- [ ] Create equipment → returns complete object with all fields
- [ ] Update equipment qty → returns updated object with new qty + all other fields
- [ ] Update equipment status → returns updated object with new status + all fields
- [ ] Update equipment portable → returns updated object with portable value + all fields
- [ ] Edit modal opens with previous values pre-filled
- [ ] Delete equipment with confirmation → item removed from list
- [ ] Create service → returns complete object
- [ ] Update service → returns updated object with ALL fields (name, duration, type, staff, equipment)
- [ ] Edit modal opens with service details pre-filled
- [ ] Delete service with confirmation → item removed
- [ ] Create package → returns complete object
- [ ] Update package price/discount → returns updated object
- [ ] Edit modal opens with package details pre-filled
- [ ] Delete package with confirmation → item removed

---

## 6. EXAMPLE WORKING FLOW

**User clicks Edit Equipment:**
1. Frontend shows current equipment data in edit modal
2. User changes qty from 2 to 3
3. Frontend sends: `PUT /equipment/{id}` with `{ qty: 3, status: "Active", portable: false }`
4. Backend updates database
5. Backend returns: Complete updated equipment object (including id, name, qty: 3, status, portable, etc.)
6. Frontend updates state with returned object
7. Modal closes, list shows updated qty

**Current Problem:** Step 5 is returning incomplete/null data, so step 6 fails.

---

## 7. ADDITIONAL NOTES

- Ensure all timestamps are ISO 8601 format
- Clinic ID should be preserved in responses for reference
- Consider adding pagination for large equipment/service lists
- Add proper error messages for validation failures
- Log all CREATE/UPDATE/DELETE operations for audit trail
