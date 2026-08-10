# Accesseasy Frontend — Complete Project Context

> This file is the agent's primary knowledge base for this project.
> Read this **in full** before making any architectural suggestion or writing any code.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| App Name | `samey-web-app` (Accesseasy) |
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build Tool | Vite |
| Package Manager | npm |
| Styling | Tailwind CSS v4 + Vuetify v4 |
| Routing | Vue Router 4 |
| HTTP | Axios (3 singleton instances in `authService`) |
| Real-time | MQTT over WebSocket (`mqttService.js`) |
| Auth | JWT Bearer tokens, stored in cookies via `js-cookie` |
| State (global) | Custom singleton stores using Vue `ref`/`reactive` (no Pinia or Vuex) |
| Charts | ApexCharts (`vue3-apexcharts`) |
| Other libraries | `leaflet` (maps), `exceljs` / `jspdf` (exports), `mqtt` (v5), `date-fns` |

---

## 2. Application Modes (Multi-Build)

The app compiles into **3 separate bundles** using different Vite configs:

| Mode | Config File | App Focus |
|------|-------------|-----------|
| `workforce` | `vite.config.js` (default) | HR: Employees, Attendance, Payroll |
| `security` | `vite.config.security.js` | Security: Guards, Patrols, Monitoring |
| `patrol` | `vite.config.patrol.js` | Guard mobile: Patrols only |

The env var `VITE_APP_MODE` drives which routes and sidebar items are visible at runtime.

---

## 3. Role-Based Access Control (RBAC)

All routes include a `meta: { roles: [...] }` array. The router guard in `src/router/index.js` enforces access.

| Role | Home Path | Description |
|------|-----------|-------------|
| `Admin` | `/dashboard` | Full access — settings, devices, rules, HR |
| `Manager` | `/dashboard` | Partial access — no device/branch settings |
| `Employee` | `/dashboard/my-access` | Self-service portal only |
| `Guard` | `/dashboard/patrols` | Security ops |
| `esslAdmin` | `/dealer-dashboard` | Superadmin — dealer management UI |

**Key rule**: Never hardcode role checks in components. Role resolution is handled by `authService.getUserRole()` with a multi-source fallback chain in the router.

---

## 4. Directory Structure

```
src/
├── assets/styles/         # variables.css, typography.css (global CSS)
├── components/
│   ├── common/            # Reusable: buttons/, filters/, modals/, table/, states/, notifications/
│   ├── guard/             # Guard-specific UI components
│   ├── layout/            # Layout components (sidebars, navbars)
│   ├── loginAuthentication/ # Login, Register, PIN, Email, DevLogin pages
│   ├── modals/            # App-wide modals
│   └── ui/workOrderUi/    # Work Order flow UI
├── composables/
│   ├── useDashboardState.js   # Singleton: dashboard KPIs, muster mode, drawer state
│   ├── useMQTT.js             # Reactive MQTT wrapper (person/LP detection events)
│   ├── useSOCState.js         # Security Ops Center reactive state
│   ├── useCameraData.js       # Camera feed composable
│   ├── useDashboardFilter.js  # Dashboard filter state
│   ├── useZoneFilter.js       # Zone filter state
│   ├── security/              # Security-specific composables
│   ├── workforce/             # Workforce-specific composables
│   ├── workorder/             # Work order flow composables
│   └── cycle/                 # Attendance cycle composables
├── layouts/
│   └── dashboardLayout.vue    # MASTER layout: sidebar + header + <RouterView>
├── pages/                     # 51 feature directories (one per business domain)
├── router/index.js            # All routes + navigation guards + RBAC
├── services/
│   ├── authService.js         # Auth, Axios instances, token/cookie management
│   ├── mqttService.js         # Singleton MQTT client (Frigate camera events)
│   ├── patrolService.js       # Guard patrol API calls
│   ├── zoneService.js         # Zone management API calls
│   └── ...
├── stores/
│   └── useSOCStore.js         # Security Ops Center store (guards, patrols, alerts, visitors)
└── utils/
    ├── currentUserTenant.js   # Singleton: tenant ID, plan, role, userId resolution
    └── helpers/               # importHelper.js, convertToCardAccessHex.js, incognitoHelper.js
```

---

## 5. Key Singleton Services & Their APIs

### `authService` (`src/services/authService.js`)
The central auth class. Exposes 3 Axios instances:
- `this.api` — Public (no auth header)
- `this.knApi` — Knative functions API (auto-injects Bearer token)
- `this.protectedApi` — Main protected API (auto-injects Bearer token, logs 401s)

Key methods to know:
- `authService.getToken()` — Get JWT from cookies
- `authService.getUserRole()` — Returns `'Admin'`, `'Manager'`, `'Employee'`, `'Guard'`, `'esslAdmin'`
- `authService.getUserData()` — Full user object from localStorage
- `authService.isAuthenticated()` — Boolean check
- `authService.isPinVerified()` — Boolean PIN 2FA check
- `authService.softLogout()` — Clears session without full redirect
- `authService.validateToken()` — Server-side token check (called once per session)
- `authService.registerLogoutListener(fn)` — Register cleanup callbacks

### `mqttService` (`src/services/mqttService.js`)
Singleton MQTT client. Connects to `mqtt.fieldseasy.com`. Topics:
- `frigate/events` — Frigate camera person & plate detection
- `frigate/+/person` — Live person count per camera
- `frigate/+/person/snapshot` — JPEG snapshot bytes
- `frigate/+/license_plate/snapshot` — License plate snapshot filename
- `frigate/+/license_plate/snapshot/bytes/+` — Base64 annotated LP image

Key API: `mqttService.on(pattern, cb)`, `.connect()`, `.disconnect()`, `.publish(topic, payload)`, `.onStatus(cb)`

### `currentUserTenant` (`src/utils/currentUserTenant.js`)
Singleton class. Must be initialized before accessing data.
- `currentUserTenant.getTenantId()` → Tenant's unique ID
- `currentUserTenant.initialize()` → Async init (fetches profile if needed)

### `useSOCStore` (`src/stores/useSOCStore.js`)
Pinia-like singleton store (implemented with raw Vue `reactive()`). Manages real-time Security Ops data:
- State: `guards`, `patrols`, `alerts`, `visitors`, `isLoading`
- Computed: `activePatrols`, `criticalAlerts`, `kpiMetrics`
- Actions: `initSocketConnection()` (starts 5s polling), `fetchAllData()`

---

## 6. Composable Patterns

All composables in this project follow a **module-level singleton pattern** (NOT Pinia):
```js
// Reactive state declared OUTSIDE the exported function
const myState = ref(null);

export function useMyComposable() {
  // All instances share the same `myState`
  return { myState };
}
```

⚠️ **Critical rule**: Do NOT break this pattern. Adding `const myState = ref()` inside the exported function would create per-component isolated state, breaking the shared state architecture.

---

## 7. MQTT / Real-time Data Pattern

Use `useMQTT()` composable to subscribe to real-time camera data in components. It auto-connects on first mount and cleans up on last unmount using ref-counting:
```js
const { mqttStatus, personEvents, lpEvents, personCounts, personSnapshots } = useMQTT();
```
This is already used in monitoring and dashboard pages.

---

## 8. Dashboard Layout Architecture

`src/layouts/dashboardLayout.vue` is the master shell. It:
- Dynamically loads the correct sidebar via `:is="activeSidebar"` (switches between `security`, `workforce`, `patrol` modes)
- Contains the global header with search (visible only on `/dashboard` home), notification bell, and profile menu
- The `#header-title-slot` teleport target lets child pages inject their own page titles into the header
- Has a **right drawer** that any child page can open via `useDashboardState().openDrawer(type, data)`
- Tracks `buildingStatus`, `alertsList`, and `isMusterMode` (emergency evacuation state)

---

## 9. Available Reusable Components

Located under `src/components/common/`:
- `buttons/` — Standardized button variants
- `filters/` — Table/list filter components
- `modals/ConfirmDeleteModal.vue` — Use for ALL delete confirmations
- `modals/QRScanModal.vue` — QR scanner dialog
- `modals/VisitorPassModal.vue` — Visitor pass display
- `states/` — Empty state, loading state, error state components
- `table/` — Shared data table components
- `notifications/` — Toast / alert notification components
- `ValueHeader.vue` — Page section header with a label and a value

---

## 10. Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Main backend API base URL |
| `VITE_KN_API_URL` | Knative serverless functions base URL |
| `VITE_APP_MODE` | `workforce` / `security` / `patrol` |
| `VITE_MQTT_USERNAME` | MQTT broker username |
| `VITE_MQTT_PASSWORD` | MQTT broker password |

---

## 11. Coding Conventions

1. **`<script setup>` only** — No Options API. No `defineComponent()`.
2. **Tailwind first, Vuetify second** — Use Tailwind for layout, spacing, colors. Use Vuetify for complex interactive UI (`v-dialog`, `v-data-table`, `v-autocomplete`, etc.).
3. **No Pinia / Vuex** — Use module-level `ref`/`reactive` singleton pattern as shown in existing stores.
4. **Import aliases** — Always use `@/` for `src/` imports. Never use relative `../../` paths.
5. **RBAC in router only** — Never check roles in component logic. The router guards handle it.
6. **Delete confirmation** — Always use `ConfirmDeleteModal.vue` for destructive actions.
7. **API calls in services** — Do not use `axios` directly in components. Add API call methods to the appropriate service file.
8. **Export utilities** — Use helpers in `src/utils/helpers/` for data export (Excel, PDF, CSV).
