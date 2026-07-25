# AccessEasy Combined Production Test Cases Suite (Flow-Wise & Tab-Wise)

This document contains a consolidated verification suite for the AccessEasy application. It includes:
- **Section 1: End-to-End Core Business Flows**: Deep-dives into critical cross-component user journeys (Auth, Scanners, Visitor Registrations, etc.).
- **Section 2: Sidebar Tab-Wise Page Validations**: Quick validation checklists for all 13 pages linked in the side navigation bar.

Each test is mapped to its corresponding **UI Verification**, **API Response Validation**, and **Load & Performance Test Cases**.

---

# SECTION 1: E2E Business Flows

## 🔄 Flow 1: Authentication & Session Security

### 🖥️ UI Verification Cases
#### UI-1.1: Mobile OTP Form Validation
- **Action**: Load `/login`, type an alphabetical string in the mobile number field, then type `12345`.
- **Assertion**: Input field accepts numeric inputs only. Character limit is capped at 10-15 digits. If invalid, the validation message `"Please enter a valid mobile number"` triggers inline.
#### UI-1.2: Dark/Light Mode Inactivity Lock Overlay
- **Action**: Manually manipulate activity time to exceed 15 mins.
- **Assertion**:
  - A modal overlay is appended directly to the `<body>` element.
  - Backdrop is set to blurred (`backdrop-filter: blur(6px)`).
  - Background styling switches dynamically matching dark mode (`linear-gradient(145deg, #18181b, #09090b)`).
  - All navigation buttons are covered and keyboard shortcuts are ignored.

### 🔌 API Response Validation Cases
#### API-1.1: Generate Phone OTP Response Assertions
- **Endpoint**: `POST ${VITE_KN_API_URL}/auth-service`
- **Request Payload**:
  ```json
  {
    "action": "generate-otp",
    "phone": "9876543210",
    "userApp": "accesseasy"
  }
  ```
- **Assertions**:
  - Response status code must be `200 OK`.
  - JSON Response schema assertion:
    ```json
    {
      "success": true,
      "otp_session_uuid": "string (UUIDv4)"
    }
    ```
#### API-1.2: Verify OTP Validation & Token Receipt
- **Endpoint**: `POST ${VITE_KN_API_URL}/auth-service`
- **Request Payload**:
  ```json
  {
    "action": "verify-otp",
    "phone": "9876543210",
    "otp": "123456",
    "sessionUuid": "c2b64d0d-2ea3-4fae-a23c-f458e0a169b1"
  }
  ```
- **Assertions**:
  - Status code is `200 OK`.
  - JSON Response must match the token profile:
    ```json
    {
      "success": true,
      "token": "string (JWT)",
      "userData": {
        "id": "string/number",
        "first_name": "string",
        "last_name": "string",
        "email": "string",
        "role": {
          "name": "string"
        }
      }
    }
    ```
  - If invalid OTP, must return `400 Bad Request` or `200` with `success: false` and message `"OTP verification failed"`.

### 🚀 Load & Performance Test (k6 Script)
- **Goal**: Simulate peak hours logins where thousands of employees check in simultaneously.
- **Execution Target**: 200 virtual users (VUs) ramping up to 500 VUs over 2 minutes, maintaining load for 5 minutes.
- **k6 Simulation Script**:
  ```javascript
  import http from 'k6/http';
  import { check, sleep } from 'k6';

  export const options = {
    stages: [
      { duration: '1m', target: 200 }, // ramp up
      { duration: '3m', target: 200 }, // sustain
      { duration: '1m', target: 0 },   // cool down
    ],
    thresholds: {
      http_req_duration: ['p(95)<800'], // 95% of requests must complete under 800ms
    },
  };

  export default function () {
    const url = 'https://api-kn.fieldseasy.com/auth-service';
    const payload = JSON.stringify({
      action: 'generate-otp',
      phone: '919876543210',
      userApp: 'accesseasy'
    });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(url, payload, params);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'has session uuid': (r) => JSON.parse(r.body).otp_session_uuid !== undefined,
    });
    sleep(1);
  }
  ```

---

## 🔍 Flow 2: Security & Authorization Key Scanner (Guard Portal)

### 🖥️ UI Verification Cases
#### UI-2.1: Scanner Feedback Screen States
- **Action**: Trigger QR scanned responses.
- **Assertion**:
  - **Success State**: Display a fullscreen emerald overlay (`bg-emerald-600`), verify employee photo, name, and access level render clearly. Display a physical checkmark animation.
  - **Deactivated State**: Display a crimson overlay (`bg-rose-600`), verify warning text reads `"This token is invalid, expired, or holds insufficient clearance."`.
#### UI-2.2: Camera Access Error Message Layout
- **Action**: Block camera permissions in browser settings, then reload `/dashboard/authorize`.
- **Assertion**: UI switches container to black background, displays `<VideoOff />` SVG icon, and displays instructions to enable camera settings.

### 🔌 API Response Validation Cases
#### API-2.1: Fetch Valid QR Token Schema
- **Endpoint**: `GET ${VITE_API_URL}/items/qrgenerate?filter[qrcode][_eq]=...`
- **Assertions**:
  - Status code is `200 OK`.
  - JSON response contains necessary employee structure:
    ```json
    {
      "data": [
        {
          "id": "number",
          "qrcode": "string",
          "qraccess": true,
          "expires_at": "string (ISO8601)",
          "employeeId": {
            "id": "number",
            "firstName": "string",
            "lastName": "string",
            "dateOfLeaving": "string (date or null)",
            "access_level": {
              "status": "string (active | inactive)"
            }
          }
        }
      ]
    }
    ```
#### API-2.2: Live Security Log Write Assertion
- **Endpoint**: `POST ${VITE_API_URL}/items/logs`
- **Request Payload**:
  ```json
  {
    "tenant": "tenant-uuid",
    "employeeId": 12,
    "ValidLogs": "authorized",
    "action": "in",
    "mode": "throughApp",
    "date": "2026-06-18",
    "timeStamp": "22:22:30"
  }
  ```
- **Assertions**:
  - Status code is `201 Created` or `200 OK`.
  - Response body contains the assigned log ID.

### 🚀 Load & Performance Test
- **Goal**: Simulate gate entries with continuous scans on shift changes.
- **k6 Simulation Script**:
  ```javascript
  import http from 'k6/http';
  import { check, sleep } from 'k6';

  export const options = {
    vus: 50, // 50 concurrent security gates checking keys
    duration: '3m',
    thresholds: {
      http_req_duration: ['p(99)<1200'], // 99% of scans verified under 1.2s
    },
  };

  export default function () {
    const token = 'MOCK_BEARER_JWT_TOKEN';
    const params = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    // Simulate reading a QR token from gate
    const url = 'https://api.fieldseasy.com/items/qrgenerate?filter[qrcode][_eq]=TEST_TOKEN_XYZ&fields=*,employeeId.*';
    const res = http.get(url, params);
    
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
    
    // Post security entry log
    const logUrl = 'https://api.fieldseasy.com/items/logs';
    const payload = JSON.stringify({
      tenant: 'tenant-1234',
      employeeId: 44,
      ValidLogs: 'authorized',
      action: 'in',
      mode: 'throughApp',
      date: '2026-06-18',
      timeStamp: '18:00:00'
    });
    const logRes = http.post(logUrl, payload, params);
    check(logRes, {
      'log logged': (r) => r.status === 200 || r.status === 201
    });

    sleep(0.5); // Scan every 500ms
  }
  ```

---

## 📋 Flow 3: Branded Visitor Portals & Check-in

### 🖥️ UI Verification Cases
#### UI-3.1: Form Fields Customizer Toggle Logic
- **Action**: Navigate to Portal Builder, disable "Photo Capture" toggle.
- **Assertion**:
  - Photo upload section opacity drops to `60%`.
  - Nested "Required" toggle switches off and becomes disabled.
  - Preview link updates dynamically.
#### UI-3.2: Mobile Check-in Form Validations
- **Action**: On public registration page `/visit/:id`, skip the Aadhar input field when configured as required.
- **Assertion**: On focus loss or submit click, input border displays `vp-input-error` outline (red color) and displays warning text `"Government ID is required"`.

### 🔌 API Response Validation Cases
#### API-3.1: File Upload Handler Response (Selfies/ID proof)
- **Endpoint**: `POST ${VITE_API_URL}/files`
- **Request Format**: Multipart Form Data (`file` binary parameter)
- **Assertions**:
  - Status code is `200 OK` or `201 Created`.
  - JSON response must supply file ID:
    ```json
    {
      "data": {
        "id": "uuid-string-of-uploaded-file",
        "filename_download": "string"
      }
    }
    ```
#### API-3.2: Visitor Registration Knative Endpoint
- **Endpoint**: `POST ${VITE_KN_API_URL}/visitor-portal-flow/visitor`
- **Request Payload**:
  ```json
  {
    "personName": "Tester Visitor",
    "mobileNumber": "9876543210",
    "email": "visitor@test.com",
    "startDate": "2026-06-18",
    "endDate": "2026-06-18",
    "startTime": "22:22:00",
    "endTime": "23:59:59",
    "status": "active",
    "quantity": 1,
    "tenant": { "tenantId": "t-100" },
    "portalId": 5,
    "photo": "uuid-file-id"
  }
  ```
- **Assertions**:
  - Status code is `200 OK` or `201 Created`.
  - Response must return generated QR string:
    ```json
    {
      "status": "SUCCESS",
      "data": {
        "id": "number/string",
        "qrToken": "string (encrypted token or visitor json)"
      }
    }
    ```

### 🚀 Load & Performance Test
- **Goal**: Simulate high volume visitor registrations during a corporate conference or event.
- **k6 Simulation Script**:
  ```javascript
  import http from 'k6/http';
  import { check, sleep } from 'k6';

  export const options = {
    stages: [
      { duration: '30s', target: 50 }, // ramp up
      { duration: '2m', target: 100 }, // sustained peak load
      { duration: '30s', target: 0 },  // ramp down
    ],
    thresholds: {
      http_req_failed: ['rate<0.01'],    // less than 1% errors
      http_req_duration: ['p(95)<1500'], // 95% of registrations complete within 1.5s
    },
  };

  export default function () {
    const url = 'https://api-kn.fieldseasy.com/visitor-portal-flow/visitor';
    const payload = JSON.stringify({
      personName: `LoadTest-Visitor-${__VU}-${__ITER}`,
      mobileNumber: `9000000${__VU}`,
      email: `load-${__VU}@test.com`,
      startDate: '2026-06-18',
      endDate: '2026-06-18',
      startTime: '09:00:00',
      endTime: '23:59:00',
      status: 'active',
      quantity: 1,
      tenant: { tenantId: 'tenant-99' },
      portalId: 10
    });
    
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(url, payload, params);
    
    check(res, {
      'visitor created': (r) => r.status === 200 && JSON.parse(r.body).status === 'SUCCESS',
    });
    
    sleep(1);
  }
  ```

---

## 🔑 Flow 4: Employee Credentials & NFC (My Access)

### 🖥️ UI Verification Cases
#### UI-4.1: Render QR Key Display
- **Action**: Select "Generate New Key".
- **Assertion**:
  - Spinner displays while fetching new token values.
  - Image element updates with base64 encoded source (`data:image/png;base64...`).
  - Key expiry countdown or status switches to "Active" display.
#### UI-4.2: RFID Management Card Revocation
- **Action**: Click the revocation ("X") button on an active RFID card indicator.
- **Assertion**:
  - Standard alert confirmation pops up: `"Are you sure you want to revoke this RFID card?"`.
  - If cancelled, UI does not update. If confirmed, card layout updates back to input layout.

### 🔌 API Response Validation Cases
#### API-4.1: Retrieve User Profile (personalModule) details
- **Endpoint**: `GET ${VITE_API_URL}/items/personalModule?filter[assignedUser][_eq]=...`
- **Assertions**:
  - Status code is `200 OK`.
  - Schema contains card number and access level mappings:
    ```json
    {
      "data": [
        {
          "id": "number",
          "card_number": "string | null",
          "assignedAccessLevel": {
            "id": "number",
            "accessLevelName": "string"
          }
        }
      ]
    }
    ```
#### API-4.2: Save Generated QR to directus db
- **Endpoint**: `POST ${VITE_API_URL}/items/qrgenerate`
- **Request Payload**:
  ```json
  {
    "tenant": "tenant-id",
    "employeeId": 12,
    "accessLevelsId": 3,
    "qrcode": "AES-Encrypted-Key-String",
    "qraccess": true,
    "expires_at": "2026-06-19T22:22:30.000Z"
  }
  ```
- **Assertions**:
  - Status code is `200 OK` or `201 Created`.
  - Body contains the created ID.

### 🚀 Load & Performance Test
- **Goal**: Measure key generation response time and database write limitations.
- **k6 Simulation Script**:
  ```javascript
  import http from 'k6/http';
  import { check, sleep } from 'k6';

  export const options = {
    vus: 80,
    duration: '2m',
    thresholds: {
      http_req_duration: ['p(95)<600'], // database write transaction must respond in under 600ms
    },
  };

  export default function () {
    const token = 'JWT_MOCK_EMPLOYEE_KEY';
    const params = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const url = 'https://api.fieldseasy.com/items/qrgenerate';
    const payload = JSON.stringify({
      tenant: 't-1234',
      employeeId: 44,
      accessLevelsId: 1,
      qrcode: 'AES256_STRESS_TEST_VALUE_XYZZY',
      qraccess: true,
      expires_at: '2026-06-19T18:00:00.000Z'
    });

    const res = http.post(url, payload, params);
    check(res, {
      'qr stored': (r) => r.status === 200 || r.status === 201
    });

    sleep(1.5);
  }
  ```

---

## 🏢 Flow 5: Core Master Settings Configuration (Branches)

### 🖥️ UI Verification Cases
#### UI-5.1: Debounced Search UI State
- **Action**: Type 3 characters into search bar, verify no immediate visual table update, then wait.
- **Assertion**:
  - Table spinner shows up precisely 300ms after user pauses.
  - Search query matches the results matching typed parameters.
#### UI-5.2: Latitude/Longitude Floating Precision Check
- **Action**: Navigate to branches view list.
- **Assertion**: Coordinate chip displays numbers formatted with exactly four decimal places (e.g., `12.9716`), even if backend API delivers float variables with more decimals (e.g. `12.9715893`).

### 🔌 API Response Validation Cases
#### API-5.1: Get Branch Management Nodes
- **Endpoint**: `GET ${VITE_API_URL}/items/locationManagement`
- **Assertions**:
  - Status code is `200 OK`.
  - Body matches location schema:
    ```json
    {
      "data": [
        {
          "id": "number",
          "locType": "branch",
          "state": "string",
          "locdetail": {
            "locationName": "string",
            "address": "string",
            "pincodes": [
              "string"
            ]
          },
          "locmark": {
            "type": "Point",
            "coordinates": [
              "number (longitude)",
              "number (latitude)"
            ]
          }
        }
      ]
    }
    ```

### 🚀 Load & Performance Test
- **Goal**: Simulate administrative dashboard load querying branch listings under sustained search stress.
- **k6 Simulation Script**:
  ```javascript
  import http from 'k6/http';
  import { check, sleep } from 'k6';

  export const options = {
    vus: 30, // 30 concurrent managers loading settings dashboard
    duration: '1m',
    thresholds: {
      http_req_duration: ['p(95)<400'], // branch list queries must resolve in < 400ms
    },
  };

  export default function () {
    const token = 'ADMIN_STRESS_JWT';
    const params = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const url = 'https://api.fieldseasy.com/items/locationManagement?fields[]=orgLocation.orgName,locSize,locType,locdetail,locmark,state,id&filter[_and][0][_and][0][tenant][tenantId][_eq]=t-99&filter[_and][0][_and][1][locType][_eq]=branch';
    const res = http.get(url, params);
    
    check(res, {
      'branches list loaded': (r) => r.status === 200,
    });
    
    sleep(2);
  }
  ```

---
---

# SECTION 2: Sidebar Tab-Wise Page Validations

## 📊 Tab 1: Dashboard / Live Insights (`/dashboard`)

### 🖥️ UI Verification Cases
- **UI-T1.1 (Role Rendering)**: Verify Guard login shows Security Overview metrics (Authorized, Denied, Auth Rate), Employee login shows Mobile Key and Attendance shortcuts, and Admins view all metric cards.
- **UI-T1.2 (Live Activity Table)**: Check that check-in events display in reverse chronological order. Status values must render green chips (`bg-emerald-50`) for authorized entries and red chips (`bg-rose-50`) for denials.
- **UI-T1.3 (Quick Action Prompts)**: Verify that clicking "Register Door" opens the registration modal and "New Employee" triggers the onboarding popup.

### 🔌 API Response Validation Cases
- **API-T1.1 (Metric Queries)**:
  - **Endpoint**: `POST /accesseasy-dashboard-api/metrics`
  - **Payload**: `{ "action": "main-dashboard", "tenantId": "t-100", "today": "2026-06-18", "role": "Admin" }`
  - **Assertions**: Status `200 OK`. JSON must contain `doors` (integer), `employees` (integer), `authorized` (integer), `unauthorized` (integer), and `recentLogs` (array of objects).

### 🚀 Load & Performance Test Case
- **Load Profile**: Simulate 50 concurrent administrators loading and polling the live metric dashboard route every 5 seconds.
- **Target Metrics**: API must respond under **400ms** at 95th percentile (p95).

---

## 👥 Tab 2: Visitor Dashboard (`/dashboard/visitors-overview`)

### 🖥️ UI Verification Cases
- **UI-T2.1 (Overstay Warnings Alert)**: Overstay list must render warnings in bold crimson font with immediate badge indicator if visit duration exceeds scheduled limit.
- **UI-T2.2 (Filter Panel)**: Clicking filters (Today, This Week, Custom Date Range) must immediately partition table rows without page reload.

### 🔌 API Response Validation Cases
- **API-T2.1 (Get Visitor Metrics)**:
  - **Endpoint**: `GET /items/visitors?aggregate[count]=id&filter[status][_eq]=checked_in`
  - **Assertions**: Status `200 OK`. Schema must return integer count matching current floor occupants.

### 🚀 Load & Performance Test Case
- **Load Profile**: Simulate 30 concurrent reception desk gates querying checked-in statuses during check-in rush hours (50 RPS).
- **Target Metrics**: DB lookup response time must resolve in under **500ms**.

---

## 🏢 Tab 3: Doors (`/dashboard/access-control/doors`)

### 🖥️ UI Verification Cases
- **UI-T3.1 (Registration Form Validation)**: Leaving Door Name blank on the "Register Door" form must block submission and highlight the input border in red with a `"Door Name is required"` label.
- **UI-T3.2 (Lock Status Display)**: Locked doors must render a secure lock icon; open doors must flash a warning indicator.

### 🔌 API Response Validation Cases
- **API-T3.1 (Fetch Doors List)**:
  - **Endpoint**: `GET /items/doors?filter[tenant][tenantId][_eq]=...`
  - **Assertions**: Status `200 OK`. Checks if door array contains `id`, `doorName`, `macAddress`, `status` (active/inactive).
- **API-T3.2 (Add Door)**:
  - **Endpoint**: `POST /items/doors`
  - **Payload**: `{ "doorName": "Front Gate", "macAddress": "00:1A:2B:3C:4D:5E", "tenant": "t-100" }`
  - **Assertions**: Status `201 Created` with created record JSON confirmation.

### 🚀 Load & Performance Test Case
- **Load Profile**: Simulate a bulk import upload where 100 doors are provisioned simultaneously via CSV upload parser.
- **Target Metrics**: Maximum queue write duration must not exceed **2.5s**.

---

## 🛡️ Tab 4: Groups (Access Clearance) (`/dashboard/easy-access/configurators/access-levels`)

### 🖥️ UI Verification Cases
- **UI-T4.1 (Checkbox Selector Grid)**: Checkbox matrix showing doors vs schedules must render correctly. Select All / Deselect All headers must instantly toggle corresponding items.
- **UI-T4.2 (Revoke Flag Visuals)**: Inactivating an access group must update status labels to red badge.

### 🔌 API Response Validation Cases
- **API-T4.1 (Query Access clearance levels)**:
  - **Endpoint**: `GET /items/accesslevels?fields=id,accessLevelName,status`
  - **Assertions**: Status `200 OK`. Verify inactive groups are correctly flagged.

### 🚀 Load & Performance Test Case
- **Load Profile**: Simulate 40 bulk revisions where security admins adjust clearance permissions across multiple access groups.
- **Target Metrics**: Average request duration under **800ms**.

---

## 👮 Tab 5: Guards (`/dashboard/guards`)

### 🖥️ UI Verification Cases
- **UI-T5.1 (Add Guard Input checks)**: Mobile field must validate character count. Email field must check for `@` character validation.
- **UI-T5.2 (Gate Assignment Select Menu)**: Changing location assignment must immediately change the mapped branch value displayed in the table row.

### 🔌 API Response Validation Cases
- **API-T5.1 (Create Guard Login)**:
  - **Endpoint**: `POST /items/guards`
  - **Payload**: `{ "firstName": "Ramesh", "lastName": "Kumar", "mobile": "9988776655", "branchId": 5 }`
  - **Assertions**: Status `201 Created`. JSON response returns the new user profile object.

### 🚀 Load & Performance Test Case
- **Load Profile**: Simulate bulk check assignment query during change of security shifts (100 simultaneous requests).
- **Target Metrics**: Read endpoints response latency below **350ms**.

---

## 👥 Tab 6: Employees (`/dashboard/easy-access/employees`)

### 🖥️ UI Verification Cases
- **UI-T6.1 (Deactivation Date Picker)**: Choosing a resignation date from the calendar must display warning: `"Deactivating account locks out digital keys."`.
- **UI-T6.2 (Search & Filter Column)**: Search bar must execute matching queries. Column filters (e.g. Filter by Department) must instantly update rows.

### 🔌 API Response Validation Cases
- **API-T6.1 (Deactivate Employee)**:
  - **Endpoint**: `PATCH /items/personalModule/:id`
  - **Payload**: `{ "dateOfLeaving": "2026-06-17" }`
  - **Assertions**: Status `200 OK`. Checked-out state verified on database schema.

### 🚀 Load & Performance Test Case
- **Load Profile**: Run bulk query simulation parsing 1,000 employee profile data cards with nested access level records.
- **Target Metrics**: Response throughput >= **300 requests/sec** with p99 < **1.5s**.

---

## 📋 Tab 7: Visitor Portals (`/dashboard/visitor-portals` & `/visit/:id`)

### 🖥️ UI Verification Cases
- **UI-T7.1 (Mobile Camera Selfie Feed)**: Click capture photo field. Camera feed must open. Swapping facing camera front/rear on mobile must display live mirroring correctly.
- **UI-T7.2 (Fields Customizer Sync)**: Hide Government ID option in builder. Verify visitor check-in form hides the ID input field.

### 🔌 API Response Validation Cases
- **API-T7.1 (Document Proof upload)**:
  - **Endpoint**: `POST /files`
  - **Format**: Multipart form binary upload.
  - **Assertions**: Status `200 OK`. Must yield valid UUID token string identifier.

### 🚀 Load & Performance Test Case
- **Load Profile**: Run k6 script loading 120 visitor registrations checking in simultaneously, upload image binaries (100KB each).
- **Target Metrics**: System must resolve visitor registrations under **1.8s** with no database deadlock errors.

---

## 📅 Tab 8: Scheduled Reports (`/dashboard/report-automation`)

### 🖥️ UI Verification Cases
- **UI-T8.1 (Cron Expression builder)**: Selecting "Every Monday" must set default input cron values to `0 9 * * 1`. Custom input overrides must validate expression before saving.
- **UI-T8.2 (E-mail Address tags)**: Adding target recipients must render clean chip elements with close ('x') action handles.

### 🔌 API Response Validation Cases
- **API-T8.1 (Save Automation Task)**:
  - **Endpoint**: `POST /items/reportAutomation`
  - **Payload**: `{ "reportName": "Weekly Activity", "cron": "0 9 * * 1", "format": "pdf", "emails": ["manager@co.com"] }`
  - **Assertions**: Status `201 Created`.

### 🚀 Load & Performance Test Case
- **Load Profile**: Trigger 50 manual immediate PDF document builds representing 10,000 logs records.
- **Target Metrics**: Backend processing worker threads must complete compilation tasks without leaking system memory.

---

## ⚙️ Tab 9: Settings - Devices (`/dashboard/settings/devices`)

### 🖥️ UI Verification Cases
- **UI-T9.1 (Online Pulse indicator)**: Active devices must render a pulsing green dot, offline devices render solid grey status dots.
- **UI-T9.2 (Sync Logs Panel)**: Terminal command consoles must display logs line-by-line with auto-scroll lock capability.

### 🔌 API Response Validation Cases
- **API-T9.1 (Device Health Status request)**:
  - **Endpoint**: `GET /items/devicesManager?fields=id,deviceName,isOnline,lastSeen`
  - **Assertions**: Status `200 OK`. Verify timestamp structure.

### 🚀 Load & Performance Test Case
- **Load Profile**: Simulate 500 devices concurrently checking-in (sending status heartbeats) every 30 seconds.
- **Target Metrics**: CPU utilization must remain below **40%** at server gateway node.

---

## 📝 Tab 10: Settings - Event Logs (`/dashboard/settings/logs`)

### 🖥️ UI Verification Cases
- **UI-T10.1 (Lazy Load Infinite Scroll)**: Scrolling to the bottom of the table logs must load the next chunk of logs seamlessly.
- **UI-T10.2 (CSV/Excel Export Button)**: Verify file download dialog opens instantly and names the file dynamically.

### 🔌 API Response Validation Cases
- **API-T10.1 (Filtered Logs Fetch)**:
  - **Endpoint**: `GET /items/logs?filter[ValidLogs][_eq]=authorized&limit=50`
  - **Assertions**: Status `200 OK`. Verify schema returns employee names and check-in times.

### 🚀 Load & Performance Test Case
- **Load Profile**: Run continuous read queries pulling 5,000 log events with multiple filters (Branch, Date Range, Status).
- **Target Metrics**: Latency below **600ms**.

---

## 🔑 Tab 11: My Access (`/dashboard/my-access`)

### 🖥️ UI Verification Cases
- **UI-T11.1 (Visual QR code generation)**: Generating key must display canvas QR pass.
- **UI-T11.2 (RFID Register Option)**: Verify entering a valid RFID tag updates status to Active.

### 🔌 API Response Validation Cases
- **API-T11.1 (Register Token)**:
  - **Endpoint**: `POST /items/qrgenerate`
  - **Assertions**: Status `201 Created`. Token expires in exactly 24 hours.

### 🚀 Load & Performance Test Case
- **Load Profile**: Simulate 200 employees generating keys at the start of shift.
- **Target Metrics**: Response time < **700ms**.

---

## 📅 Tab 12: My Attendance (`/dashboard/my-attendance`)

### 🖥️ UI Verification Cases
- **UI-T12.1 (Calendar Timeline)**: Checked-in days must display green, absent days display red.
- **UI-T12.2 (Regularisation Form)**: Clicking "Request Change" must display form validator modal.

### 🔌 API Response Validation Cases
- **API-T12.1 (Get Attendance Logs)**:
  - **Endpoint**: `GET /items/personalModule/attendance`
  - **Assertions**: Status `200 OK`. Returns attendance records.

### 🚀 Load & Performance Test Case
- **Load Profile**: Simulate 300 employees checking calendars simultaneously.
- **Target Metrics**: Response time < **500ms**.

---

## 🔍 Tab 13: Authorize (`/dashboard/authorize`)

### 🖥️ UI Verification Cases
- **UI-T13.1 (Laser Animation scan)**: Verify camera feed displays a red animated laser line overlay.
- **UI-T13.2 (Visual Result Screens)**: Valid QR results render green screens, invalid QRs render red screens.

### 🔌 API Response Validation Cases
- **API-T13.1 (Verify Token API)**:
  - **Endpoint**: `GET /items/qrgenerate?filter[qrcode][_eq]=...`
  - **Assertions**: Status `200 OK`. Must query status, expiration, and access restrictions.

### 🚀 Load & Performance Test Case
- **Load Profile**: Run continuous checks simulating 100 gates scan requests.
- **Target Metrics**: Average request-response time must resolve within **1.0s**.
