# URGENT: Backend API Fixes Needed - Services/Equipment/Packages CRUD

## Problem
The Services, Equipment, and Packages management tab has critical data persistence issues:
- Edit modal values don't populate from database
- Updates don't save properly
- API responses missing required fields

## Root Cause
Backend API responses are incomplete - missing fields that frontend expects.

---

## EQUIPMENT API Requirements

### GET /api/v1/clinics/{clinicId}/equipment
Must return complete objects:
```json
{
  "id": "uuid",
  "name": "string",
  "qty": number,
  "status": "Active|Needs Maintenance|Inactive",
  "portable": boolean
}
```

### POST /api/v1/clinics/{clinicId}/equipment
Request: `{ name, qty, status, portable }`
Response: Complete equipment object with ALL fields

### PUT /api/v1/equipment/{id}
Request: `{ qty, status, portable }`
Response: **MUST INCLUDE ALL FIELDS** (id, name, qty, status, portable)
- This is where the bug is - returning incomplete data

### DELETE /api/v1/clinics/{clinicId}/equipment/{id}
Response: `{ success: true }`

---

## SERVICES API Requirements

### GET /api/v1/clinics/{clinicId}/services
Return complete objects with BOTH field name variants:
```json
{
  "id": "uuid",
  "name": "string",
  "duration": "string",
  "type": "Clinical|External",
  "staff": "string OR null",
  "required_staff": "string OR null",
  "equipment": "string OR null",
  "required_equipment": "string OR null"
}
```

### POST /api/v1/clinics/{clinicId}/services
Request: `{ name, duration, type, staff, equipment }`
Response: Complete service object with ALL fields

### PUT /api/v1/services/{id}
Request: Full service object with name, duration, type, staff, equipment
Response: **MUST INCLUDE ALL FIELDS** (id, name, duration, type, staff, equipment)
- Critical: Return all field variants (staff AND required_staff, equipment AND required_equipment)

### DELETE /api/v1/clinics/{clinicId}/services/{id}
Response: `{ success: true }`

---

## PACKAGES API Requirements

### GET /api/v1/clinics/{clinicId}/packages
Return complete objects with field aliases:
```json
{
  "id": "uuid",
  "name": "string",
  "includes": "string",
  "description": "string",
  "base_price": number,
  "base": number,
  "discount_percent": number,
  "discount": number,
  "fast": boolean,
  "is_fast_track": boolean
}
```

### POST /api/v1/clinics/{clinicId}/packages
Request: `{ name, includes, base_price, discount_percent, fast }`
Response: Complete package object with ALL fields

### PUT /api/v1/clinics/{clinicId}/packages/{id}
Request: `{ name, includes, base_price, discount_percent, fast }`
Response: **MUST INCLUDE ALL FIELDS** including both field aliases
- Return: base AND base_price, discount AND discount_percent, fast AND is_fast_track

### DELETE /api/v1/clinics/{clinicId}/packages/{id}
Response: `{ success: true }`

---

## Critical Issues to Fix

1. **Update Endpoints Return Incomplete Data**
   - PUT /equipment/{id} - returning null/missing fields
   - PUT /services/{id} - missing required_staff/required_equipment
   - PUT /packages/{id} - missing field aliases

2. **Field Name Inconsistencies**
   - Support BOTH field names in responses:
     - qty AND quantity
     - staff AND required_staff
     - equipment AND required_equipment
     - base AND base_price
     - discount AND discount_percent
     - fast AND is_fast_track

3. **Response Format**
   - All responses should include the COMPLETE object
   - Include id, timestamps, all fields - not just the updated fields
   - Wrap in: `{ success: true, data: { ...object } }`

4. **Authorization**
   - Verify clinic ownership on all operations
   - Return 403 if user accesses another clinic's resources

---

## Testing Criteria

After fixes, test this flow:
1. Create equipment → verify ALL fields returned
2. Edit equipment (change qty) → verify UPDATE returns complete object with new qty + old fields
3. Edit modal opens → old values should be pre-filled (meaning response had all data)
4. Delete → item removed from list
5. Same for services and packages

---

## Impact
Without these fixes, the entire Services/Equipment/Packages management is broken. Users cannot:
- Edit and save equipment status/quantity/portability
- Edit and save service details
- Edit and save package prices/discounts
- See previous values in edit modals
