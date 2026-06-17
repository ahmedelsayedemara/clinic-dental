# Firestore Schema — Clinic App

## Overview

The schema is designed for fast search across 50,000+ patient records using denormalized search fields and Firestore composite indexes. Primary search axes: **patient name**, **mobile number**, and **file number**.

---

## Collections

### 1. `patients`

Each document represents a patient record. The `id` is the Firestore auto-generated document ID.

#### Document Shape

```json
{
  "id": "auto-generated",
  
  // --- Personal Info ---
  "fullName": "أحمد محمد علي",
  "nameLower": "أحمد محمد علي",          // fullName.toLowerCase().trim() — indexed
  "mobile": "0501234567",                  // indexed
  "address": "الرياض، حي النزهة",
  "dateOfBirth": "1985-03-15T00:00:00.000Z",
  "gender": "male",                        // "male" | "female"
  "notes": "ملاحظات عامة",

  // --- Archive / Physical File Location ---
  "fileNumber": "2024-001",               // indexed
  "archiveYear": 2024,
  "archiveMonth": 3,

  // --- Medical ---
  "medicalHistory": "ضغط الدم، حساسية من البنسلين",
  "diagnosis": "التهاب لثة حاد",
  "treatmentPlan": "تنظيف أسنان + علاج اللثة",

  // --- Search Fields (denormalized) ---
  "searchKeywords": [
    "أ", "أح", "أحم", "أحمد",
    "م", "مح", "محم", "محمد",
    "أحمد محمد", "أحمد محمد علي",
    "0501234567",
    "2024-001"
  ],

  // --- Metadata ---
  "createdAt": "2024-03-15T10:00:00.000Z",
  "updatedAt": "2024-03-15T10:00:00.000Z",
  "createdBy": "firebase-auth-uid"
}
```

#### Search Strategy

1. **Name search**: Generate all prefix tokens from `fullName` (Arabic + English) into `searchKeywords[]`. Query: `where('searchKeywords', 'array-contains', token)`.
2. **Mobile search**: Include `mobile` string in `searchKeywords[]`.
3. **File number search**: Include `fileNumber.toLowerCase()` in `searchKeywords[]`.
4. **Combined**: A single `array-contains` query covers all three axes simultaneously since tokens from all fields are merged into one array.

#### Subcollection: `patients/{patientId}/visits`

**Storage decision: subcollection (not top-level)**
- Visits are always queried in the context of a single patient — there is no global "all visits across all patients" screen.
- Co-location means a `getVisitsForPatient` query touches a single Firestore shard; reads cost exactly N documents, never fanning out.
- Security rules can scope to `match /patients/{patientId}/visits/{visitId}` — no need for a `patientId` filter field on a top-level collection.
- Contrast with `appointments`: those need cross-patient ordering by date (global tab + dashboard), which is impossible from a subcollection → appointments stay top-level.

```json
{
  "id": "auto-generated",
  "patientId": "parent-patient-doc-id",

  "visitDate": "2024-03-15T10:00:00.000Z",
  "diagnosis": "التهاب لثة",
  "treatmentPerformed": "تنظيف أسنان بالموجات الفوقية الصوتية",
  "notes": "يعود بعد أسبوعين للمتابعة",

  "amountTotal": 300,
  "amountPaid": 150,
  "amountDue": 150,
  "paymentStatus": "partial",

  "createdAt": "2024-03-15T10:00:00.000Z",
  "updatedAt": "2024-03-15T10:00:00.000Z",
  "createdBy": "firebase-auth-uid"
}
```

`paymentStatus` is derived on write from `amountTotal` and `amountPaid`:
- `"unpaid"` — no amount paid or total is zero
- `"partial"` — paid > 0 but paid < total
- `"paid"` — paid >= total

**Required index** (visits subcollection, ordered list):
```json
{
  "collectionGroup": "visits",
  "queryScope": "COLLECTION_GROUP",
  "fields": [
    { "fieldPath": "patientId", "order": "ASCENDING" },
    { "fieldPath": "visitDate", "order": "DESCENDING" }
  ]
}
```
A simpler `orderBy('visitDate', 'desc')` inside a subcollection query does not require a composite index, but deploying the above collection-group index enables future cross-patient analytics if needed.

#### Subcollection: `patients/{patientId}/attachments`

**Storage decision: subcollection (not top-level)**
Attachments are always queried in the context of a single patient. Co-location with the parent patient document keeps security rules tight (`match /patients/{patientId}/attachments/{attachmentId}`) and avoids the need for a `patientId` filter on a top-level collection.

**Firebase Storage path convention:**
```
patients/{patientId}/attachments/{uuid}_{fileName}
```
`uuid` is a short random+timestamp string generated client-side to guarantee uniqueness when the same file name is uploaded twice.

**Firestore metadata document shape:**
```json
{
  "id": "auto-generated",
  "patientId": "parent-patient-doc-id",
  "type": "image",
  "fileName": "xray-2024-03.jpg",
  "storagePath": "patients/abc123/attachments/x7f3t9_xray-2024-03.jpg",
  "downloadUrl": "https://firebasestorage.googleapis.com/...",
  "mimeType": "image/jpeg",
  "sizeBytes": 245760,
  "createdAt": "2024-03-15T10:00:00.000Z",
  "createdBy": "firebase-auth-uid"
}
```

**`type` union:** `"image" | "xray" | "pdf"`

**Ordering:** documents are fetched `orderBy('createdAt', 'desc')` — newest first. No composite index needed for a single-field descending sort within a subcollection.

**Storage rules:** see `storage.rules` at repo root. Authenticated staff can read/write under `patients/{patientId}/attachments/**`. Uploads are limited to 20 MB and must be `image/*` or `application/pdf`.

---

### 2. `appointments`

Top-level collection for clinic appointments (not a subcollection — allows querying all appointments across patients by date for the global Appointments tab and Dashboard widget).

**Storage decision: top-level collection**
- The Appointments tab needs `where('dateTime', '>=', now) orderBy('dateTime', 'asc')` across ALL patients — impossible from a patient subcollection.
- The Dashboard "upcoming appointments" widget calls the same query with a small `limit`.
- `patientName` is denormalized to avoid joins when rendering list rows.
- Hard-delete is available but cancel is preferred (status → `'cancelled'`) to preserve audit history.

```json
{
  "id": "auto-generated",
  "patientId": "patient-doc-id",
  "patientName": "أحمد محمد علي",

  "dateTime": "2024-03-20T09:00:00.000Z",
  "status": "pending",
  "notes": "فحص دوري",

  "reminderAt": "2024-03-20T08:30:00.000Z",
  "reminderId": "notifee-trigger-notification-id",

  "createdAt": "2024-03-15T10:00:00.000Z",
  "updatedAt": "2024-03-15T10:00:00.000Z",
  "createdBy": "firebase-auth-uid"
}
```

`status` union: `"pending" | "confirmed" | "cancelled" | "completed"`

`reminderId` stores the Notifee trigger notification ID so it can be cancelled when the appointment is rescheduled, cancelled, or deleted.

---

### 3. `users`

Staff/admin accounts. Populated by `FirebaseProvider` on first login.

```json
{
  "uid": "firebase-auth-uid",             // document ID matches Firebase Auth UID
  "email": "doctor@clinic.com",
  "displayName": "د. محمد أحمد",
  "photoURL": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "patients",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "searchKeywords", "arrayConfig": "CONTAINS" },
        { "fieldPath": "nameLower", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "patients",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "nameLower", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "dateTime", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "patientId", "order": "ASCENDING" },
        { "fieldPath": "dateTime", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "dateTime", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "patientId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "visits",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "patientId", "order": "ASCENDING" },
        { "fieldPath": "visitDate", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": [
    {
      "collectionGroup": "patients",
      "fieldPath": "searchKeywords",
      "indexes": [
        { "order": "ASCENDING", "queryScope": "COLLECTION" },
        { "arrayConfig": "CONTAINS", "queryScope": "COLLECTION" }
      ]
    }
  ]
}
```

---

## `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Users collection — own profile only
    match /users/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }

    // Patients — all authenticated staff can read/write
    match /patients/{patientId} {
      allow read, write: if isAuthenticated();

      // Subcollections: visits and attachments
      match /visits/{visitId} {
        allow read, write: if isAuthenticated();
      }
      match /attachments/{attachmentId} {
        allow read, write: if isAuthenticated();
      }
    }

    // Appointments — all authenticated staff can read/write
    match /appointments/{appointmentId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

---

## Scalability Notes for 50,000+ Records

1. **`searchKeywords` array size**: Each patient generates ~50–200 tokens. At 50K patients × 200 tokens × ~10 bytes = ~100 MB — well within Firestore limits.
2. **Query cost**: `array-contains` on a single indexed field with `limit(20)` reads exactly `limit` documents regardless of total collection size — O(results), not O(collection).
3. **Pagination**: Use `startAfter(lastDocSnapshot)` with `orderBy('nameLower')` for cursor-based pagination across large result sets.
4. **Write cost**: Each add/update requires rebuilding `searchKeywords`. For 50K records this is a one-time batch migration; ongoing writes are fast.
5. **TTL / archiving**: Consider a `isArchived: boolean` field + Firestore TTL policy for records older than N years.
