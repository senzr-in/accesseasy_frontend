# Implementation Plan - Incident Management

We will create a premium **Incident Management** module. This module will allow logging, assigning, tracking, and closing incidents with image attachments, priority levels, and role-based permission visibility for guards.

## Proposed Changes

### Component Layout & Routing

We will register the new `/dashboard/incidents` route and add a left sidebar entry.

---

#### [MODIFY] [index.js](file:///c:/Users/capta/Accesseasy/accesseasy_frontend-main/src/router/index.js)
* Import the new Incidents component.
* Register `{ path: "incidents", name: "Incidents", component: () => import("@/pages/incidents/index.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } }` in both the `security` and `workforce` routing children definitions.

---

#### [MODIFY] [SecuritySidebar.vue](file:///c:/Users/capta/Accesseasy/accesseasy_frontend-main/src/components/layout/SecuritySidebar.vue)
* Import `AlertTriangle` from `lucide-vue-next`.
* Append `{ name: 'Incidents', href: '/dashboard/incidents', icon: AlertTriangle }` to the `operationsNav` navigation list.

---

#### [NEW] [index.vue](file:///c:/Users/capta/Accesseasy/accesseasy_frontend-main/src/pages/incidents/index.vue)
Create a new comprehensive dashboard module with the following capabilities:
1. **KPI Header Strip**:
   * **Total Incidents**
   * **Active Incidents** (Open/Assigned status)
   * **Critical Priority** (High/Critical)
   * **Closed Incidents**
2. **Interactive Filters**:
   * Filter by status (All, Open, Closed).
   * Filter by priority (All, Low, Medium, High, Critical).
   * Search queries.
3. **Table Columns**:
   * **Incident ID**: Auto-generated custom ID (e.g. `INC-87D2`).
   * **Date**: Logged timestamp.
   * **Guard**: Who created/reported the incident.
   * **Location**: GPS coordinates or text description.
   * **Status**: Badge (`Open`, `Assigned`, `Closed`) with color coding.
   * **Assigned To**: Which officer is handling it.
   * **Closed By**: Officer who resolved it.
   * **Closed Time**: Resolution timestamp.
4. **Log Incident Dialog**:
   * Form inputs: Title/Type, Location, Severity/Priority, Description/Notes, Assigned To (officer selection), and File Upload (image attachments).
   * Generates local previews and handles attachments.
5. **Assign / Action Panel**:
   * Directly change priority, edit notes, or re-assign to another guard.
   * **Close Incident**: Sets status to `Closed`, logs the current user as `Closed By`, and sets the current timestamp as `Closed Time`.
   * **Reopen Incident**: Reverts the status back to `Open` and clears closure logs.
6. **Guard Permission Boundaries**:
   * Detects if the logged-in user role is **`Guard`**.
   * If yes, automatically filters the list to show **only** incidents created by that Guard or assigned specifically to that Guard.
   * Admins and Managers retain global views to assign/close any incident.

---

## Verification Plan

### Manual Verification
1. Log in as an **Admin** or **Manager**:
   * Confirm the "Incidents" menu item is visible in the sidebar.
   * Log a new incident, choose priority, and assign to a Guard (e.g., `beast`).
   * Verify all table columns display details correctly.
   * Click close, verify that the `Closed By` and `Closed Time` populate automatically.
   * Click reopen and verify status resets.
2. Log in as a **Guard** (e.g. `beast`):
   * Verify that you only see incidents assigned to you or created by you.
   * Log a new incident as a Guard and verify it shows up in your personal list.
