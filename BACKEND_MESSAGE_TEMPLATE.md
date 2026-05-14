# Message Template for Backend Team

---

**Subject: URGENT: Fix Services/Equipment/Packages API - Data Persistence Broken**

Hi Backend Team,

We have critical bugs in the Services, Equipment, and Packages management tab. The CRUD operations are failing because the API responses don't include all required fields.

## The Problem
When users edit equipment/services/packages, the changes aren't saving and edit modals don't pre-fill with existing values. This is because PUT endpoints return incomplete data.

## Required Fixes

### 1. Equipment Updates - PUT /api/v1/equipment/{id}
**Current:** Returning incomplete/null fields
**Fix Needed:** Return the COMPLETE updated equipment object:
```json
{
  "id": "uuid",
  "name": "string",
  "qty": number,
  "status": "Active|Needs Maintenance|Inactive",
  "portable": boolean
}
```

### 2. Services Updates - PUT /api/v1/services/{id}
**Current:** Missing required_staff, required_equipment fields
**Fix Needed:** Return complete object with BOTH field name variants:
```json
{
  "id": "uuid",
  "name": "string",
  "duration": "string",
  "type": "Clinical|External",
  "staff": "value",
  "required_staff": "value",
  "equipment": "value",
  "required_equipment": "value"
}
```

### 3. Packages Updates - PUT /api/v1/clinics/{clinicId}/packages/{id}
**Current:** Missing field aliases (base_price, discount_percent, is_fast_track)
**Fix Needed:** Return complete object with BOTH field names:
```json
{
  "id": "uuid",
  "name": "string",
  "includes": "string",
  "description": "string",
  "base": number,
  "base_price": number,
  "discount": number,
  "discount_percent": number,
  "fast": boolean,
  "is_fast_track": boolean
}
```

## Key Requirements
1. ALL PUT endpoints must return the COMPLETE updated object with every field
2. Support field name aliases for backward compatibility (qty/quantity, staff/required_staff, etc.)
3. All GET endpoints must return complete objects too
4. Response format: `{ success: true, data: { ...object } }`
5. Include timestamps (created_at, updated_at)

## Detailed Documentation
See attached files:
- BACKEND_SERVICES_REQUIREMENTS.md (comprehensive)
- BACKEND_FIXES_SUMMARY.md (quick reference)

## Acceptance Criteria
- Edit modal populates with previous values ✓
- Update saves changes ✓
- List reflects updated values ✓
- No null/missing fields in responses ✓

Please prioritize this as it blocks the entire Services/Equipment/Packages feature.

Thanks!

---

Feel free to copy this message and send directly to your backend team.
