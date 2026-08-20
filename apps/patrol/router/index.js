import { createRouter, createWebHistory } from "vue-router";
import { authService } from "@/services/authService";
import { usePlanStore } from "@/stores/usePlanStore";

// Landing (Eagerly loaded for instant initial render)
import AegisLanding from "@/pages/landing/AegisLanding.vue";

// Auth (Lazy Loaded)
const Login = () => import("@/components/loginAuthentication/login.vue");
const Register = () => import("@/components/loginAuthentication/register.vue");
const Verification = () => import("@/components/loginAuthentication/verification.vue");
const PinVerification = () => import("@/components/loginAuthentication/pinVerification.vue");
const EmailVerification = () => import("@/components/loginAuthentication/emailVerification.vue");
const AlternateLogin = () => import("@/components/loginAuthentication/alternateLogin.vue");
const AuthCallback = () => import("@/pages/authorize/AuthCallback.vue");

// Layout
const DashboardLayout = () => import("@/layouts/dashboardLayout.vue");

// Superadmin (esslAdmin) Dashboard
const EsslDashboard = () => import("@/pages/dealers/dashboard/esslDashboard.vue");

// Visitor Portal
const VisitorPortalView = () => import("@/pages/visitorPortals/VisitorPortalView.vue");

// DEV ONLY: Dev quick login bypass
const DevLogin = () => import("@/components/loginAuthentication/devLogin.vue");

// Placeholders / Ports
const DashboardHome = () => import("@/pages/dashboard/index.vue");
const Employees = () => import("@/pages/employee/my-teams/personalDetails/employeeDetails.vue");
const Devices = () => import("@/pages/devicesManager/deviceManagerTabs.vue");
const Doors = () => import("@/pages/devicesManager/doors/doorsVue.vue");
const Zones = () => import("@/pages/zones/index.vue");
const Logs = () => import("@/pages/logs/logTab.vue");
const OnboardingPage = () => import("@/pages/onboarding/index.vue");
const Timerzones = () => import("@/pages/accesslevel/timerzone.vue");
const BranchConfiguration = () => import("@/pages/settings/configuration/branch/branchConfiguration.vue");
const BranchAddForm = () => import("@/pages/settings/configuration/branch/branchAddForm.vue");
const BranchEditForm = () => import("@/pages/settings/configuration/branch/branchEditForm.vue");
const AppearanceSettings = () => import("@/pages/settings/appearance.vue");


// ─── Role → Home Route map ───────────────────────────────────────────────────
const getRoleHome = () => {
  if (!authService.isAuthenticated()) return "/login";
  const role = authService.getUserRole();
  if (role === "esslAdmin")  return "/dealer-dashboard";
  if (role === "Guard")      return "/dashboard/patrols";    // Patrol App home
  if (role === "Employee")   return "/dashboard/my-access";
  return "/dashboard"; // Admin & Manager → Command Center
};

const routes = [
  {
    path: "/",
    name: "Landing",
    component: AegisLanding,
    beforeEnter: (to, from, next) => {
      // If already authenticated, skip the landing page and go to the appropriate home
      if (authService.isAuthenticated()) {
        next(getRoleHome());
      } else {
        next();
      }
    },
  },
  {
    path: "/dealer-dashboard",
    name: "DealerDashboard",
    component: EsslDashboard,
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      const role = authService.getUserRole();
      if (role === "esslAdmin") {
        next();
      } else {
        // Non-superadmin trying to access this page → send to main dashboard
        next("/dashboard");
      }
    },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    beforeEnter: (to, from, next) => {
      const token = authService.getToken();
      const userData = authService.getUserData();
      if (token && (authService.getPhone() || authService.getEmail() || userData)) {
        if (!authService.isPinVerified()) {
          const phone = authService.getPhone() || localStorage.getItem("userPhone");
          const email = authService.getEmail() || localStorage.getItem("email");

          if (phone) {
            const digits = phone.replace(/\D/g, "").slice(-10);
            next({ name: "PinVerification", params: { contactType: "phone", contactValue: digits } });
            return;
          } else if (email) {
            next({ name: "PinVerification", params: { contactType: "email", contactValue: email } });
            return;
          } else {
            authService.softLogout();
            next();
            return;
          }
        }
        next(getRoleHome());
      } else {
        next();
      }
    },
  },
  // Onboarding welcome page (full-page, no sidebar)
  {
    path: "/onboarding",
    name: "Onboarding",
    component: OnboardingPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  // ⚠ DEV ONLY — Remove before production deployment
  {
    path: "/dev-login",
    name: "DevLogin",
    component: DevLogin,
  },
  {
    path: "/verification/:phoneNumber",
    name: "Verification",
    component: Verification,
    props: true,
  },
  {
    path: "/auth/callback",
    name: "AuthCallback",
    component: AuthCallback,
  },
  {
    path: "/pin-verification/:contactType/:contactValue",
    name: "PinVerification",
    component: PinVerification,
    props: true,
  },
  {
    path: "/email-verification/:email",
    name: "EmailVerification",
    component: EmailVerification,
    props: true,
  },
  {
    path: "/alternate-login",
    name: "AlternateLogin",
    component: AlternateLogin,
  },
  {
    path: "/dashboard",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "DashboardHome",
        component: DashboardHome,
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "settings",
        name: "SettingsHub",
        component: () => import("@/pages/settings/SettingsHub.vue"),
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "settings/appearance",
        name: "SettingsAppearance",
        component: AppearanceSettings,
        meta: { roles: ["Admin"] }
      },
      {
        path: "settings/ai-events",
        name: "SettingsAiEvents",
        component: () => import("@/pages/settings/aiEvents.vue"),
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "settings/logs",
        name: "SettingsLogs",
        component: Logs,
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "settings/zones",
        name: "SettingsZones",
        component: Zones,
        meta: { roles: ["Admin"] }
      },
      {
        path: "settings/zones/:id",
        name: "SettingsZoneDetail",
        component: () => import("@/pages/zones/ZoneDetail.vue"),
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "sites",
        name: "Sites",
        component: () => import("@/pages/sites/index.vue"),
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "sites/:id",
        name: "SiteDetail",
        component: () => import("@/pages/sites/SiteDetail.vue"),
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "sites/:id/geofence",
        name: "SiteGeofenceEditor",
        component: () => import("@/pages/sites/SiteGeofenceEditor.vue"),
        meta: { roles: ["Admin", "Manager"], feature: "geofence.site" }
      },
      {
        path: "settings/checkpoints",
        name: "SettingsCheckpoints",
        component: () => import("@/pages/settings/checkpoints/index.vue"),
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "settings/branches",
        name: "SettingsBranches",
        component: BranchConfiguration,
        meta: { roles: ["Admin"] }
      },
      {
        path: "settings/branches/add",
        name: "SettingsBranchAdd",
        component: BranchAddForm,
        meta: { roles: ["Admin"] }
      },
      {
        path: "settings/branches/:id/edit",
        name: "SettingsBranchEdit",
        component: BranchEditForm,
        meta: { roles: ["Admin"] }
      },
      {
        path: "settings/devices",
        name: "SettingsDevices",
        component: () => import("@/pages/settings/devices/DeviceDashboard.vue"),
        meta: { roles: ["Admin", "Manager"], feature: "ops.operations_center" }
      },
      {
        path: "access-control/doors",
        name: "Doors",
        component: Doors,
        meta: { roles: ["Admin"] }
      },
      {
        path: "access-control/schedules",
        name: "Schedules",
        component: () => import("@/pages/schedules/index.vue"),
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "access-control/rules",
        name: "Rules",
        component: () => import("@/pages/rules/index.vue"),
        meta: { roles: ["Admin"] }
      },
      {
        path: "guards",
        name: "Guards",
        component: () => import("@/pages/guard/index.vue"),
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "guards/attendance",
        name: "GuardAttendance",
        component: () => import("@/pages/guard/tabs/AttendanceTab.vue"),
        meta: { roles: ["Admin", "Manager", "Guard"], feature: "attendance.basic" }
      },
      {
        path: "patrols",
        name: "Patrols",
        component: () => import("@/pages/guard/tabs/PatrolsTab.vue"),
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "patrols/create",
        name: "CreatePatrol",
        component: () => import("@/pages/guard/CreatePatrol.vue"),
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "patrols/checkpoints",
        name: "PatrolCheckpoints",
        component: () => import("@/pages/guard/Checkpoints.vue"),
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "patrols/history",
        name: "PatrolHistory",
        component: () => import("@/pages/guard/History.vue"),
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "authorize",
        name: "Authorize",
        component: () => import("@/pages/authorize/index.vue"),
        meta: { roles: ["Admin", "Guard"] }
      },
      {
        path: "visitors",
        name: "Visitors",
        component: () => import("@/pages/visitors/index.vue"),
        meta: { roles: ["Admin", "Guard"] }
      },
      {
        path: "visitor-portals",
        name: "VisitorPortals",
        component: () => import("@/pages/visitorPortals/index.vue"),
        meta: { roles: ["Admin"] }
      },
      {
        path: "visitor-portals/builder/:id?",
        name: "VisitorPortalBuilder",
        component: () => import("@/pages/visitorPortals/builder.vue"),
        meta: { roles: ["Admin"] }
      },
      {
        path: "monitoring",
        name: "Monitoring",
        component: () => import("@/pages/monitoring/index.vue"),
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "reports",
        name: "Reports",
        component: () => import("@/pages/reports/index.vue"),
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "incidents",
        name: "Incidents",
        component: () => import("@/pages/incidents/index.vue"),
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "help",
        name: "HelpSupport",
        component: () => import("@/pages/help/index.vue"),
        meta: { roles: ["Admin", "Manager", "Employee", "Guard"] }
      },
      {
        path: "settings/roles",
        name: "Roles",
        component: () => import("@/pages/roles/index.vue"),
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "settings/shifts",
        name: "Shifts",
        component: () => import("@/pages/shifts/index.vue"),
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "settings/permissions",
        name: "Permissions",
        component: () => import("@/pages/permissions/index.vue"),
        meta: { roles: ["Admin"] }
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/pages/profile/index.vue"),
        meta: { roles: ["Admin", "Manager", "Employee", "Guard"] }
      },
      // ─── Subscription & Plan ─────────────────────────────────────────────
      {
        path: "settings/subscription",
        name: "Subscription",
        component: () => import("@/pages/settings/subscription/SubscriptionPage.vue"),
        meta: { roles: ["Admin"] }
      },
      // ─── Escalation (Pro+) ───────────────────────────────────────────────
      {
        path: "settings/escalation",
        name: "EscalationPolicies",
        component: () => import("@/pages/settings/escalation/EscalationPolicies.vue"),
        meta: { roles: ["Admin", "Manager"], feature: "incident.escalation" }
      },
      // ─── Device Management (Pro+) ────────────────────────────────────────
      {
        path: "settings/patrol-devices",
        name: "PatrolDevices",
        component: () => import("@/pages/settings/devices/DeviceDashboard.vue"),
        meta: { roles: ["Admin", "Manager"], feature: "ops.operations_center" }
      },
      // ─── Shifts (Pro+) ───────────────────────────────────────────────────
      {
        path: "settings/patrol-shifts",
        name: "PatrolShifts",
        component: () => import("@/pages/settings/shifts/ShiftScheduler.vue"),
        meta: { roles: ["Admin", "Manager"], feature: "attendance.shift_compliance" }
      },
      // ─── Audit Log (Pro+) ────────────────────────────────────────────────
      {
        path: "settings/audit-log",
        name: "AuditLog",
        component: () => import("@/pages/settings/AuditLog.vue"),
        meta: { roles: ["Admin"], feature: "ops.audit_log" }
      }
    ]
  },
  // Visitor Portal Route
  {
    path: "/visit/:id",
    name: "VisitorPortalView",
    component: VisitorPortalView
  },
  // Catch-all — send to role-appropriate home
  {
    path: "/:pathMatch(.*)*",
    redirect: getRoleHome
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Token validation is done once per browser session to avoid a network call on every navigation.
// sessionStorage is cleared on tab close/reload, so every page reload triggers a fresh server check.
let tokenValidatedThisSession = false;

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // Skip non-protected routes (login, register, etc.)
  if (!requiresAuth) {
    next();
    return;
  }

  // Basic local auth check first
  const token = authService.getToken();
  const userData = authService.getUserData();
  const isAuthenticated = !!(token && (authService.getPhone() || authService.getEmail() || userData));

  if (!isAuthenticated) {
    next("/login");
    return;
  }

  // --- Enforce PIN verification state ---
  if (!authService.isPinVerified()) {
    const phone = authService.getPhone() || localStorage.getItem("userPhone");
    const email = authService.getEmail() || localStorage.getItem("email");

    if (phone) {
      const digits = phone.replace(/\D/g, "").slice(-10);
      next({ name: "PinVerification", params: { contactType: "phone", contactValue: digits } });
      return;
    } else if (email) {
      next({ name: "PinVerification", params: { contactType: "email", contactValue: email } });
      return;
    } else {
      authService.softLogout();
      next("/login?expired=true");
      return;
    }
  }

  // ── Server-side token validation (once per browser session / page reload) ──
  if (!tokenValidatedThisSession) {
    tokenValidatedThisSession = true; // Prevent duplicate calls during the same navigation cycle
    const isTokenValid = await authService.validateToken();

    if (!isTokenValid) {
      console.warn("[Router] Server token invalid or expired. Redirecting to re-auth.");
      authService.softLogout();
      next("/login?expired=true");
      return;
    }
  }

  // Role-based access control
  const requiredRoles = to.matched
    .slice()
    .reverse()
    .find(record => record.meta.roles)?.meta.roles;

  if (requiredRoles) {
    // Try multiple sources to resolve role
    let userRole = authService.getUserRole();

    // Fallback chain if primary resolution fails
    if (!userRole && userData) {
      const roleConfigName = userData?.accesseasyRole?.roleName || userData?.roleConfig?.roleName || '';
      const fallbackName = userData?.role?.name || '';
      const rawName = roleConfigName || fallbackName;
      if (rawName) {
        const lower = rawName.toLowerCase();
        if (lower.includes('admin')) userRole = 'Admin';
        else if (lower.includes('manager')) userRole = 'Manager';
        else if (lower.includes('guard') || lower.includes('security')) userRole = 'Guard';
        else if (lower.includes('employee')) userRole = 'Employee';
        else userRole = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      }
    }

    if (userRole && !requiredRoles.includes(userRole)) {
      const homePath = getRoleHome();
      if (to.path === homePath) {
        next('/login');
        return;
      }
      next(homePath);
      return;
    }
    // If userRole is still empty but user is authenticated, allow through
  }

  // ── Feature Entitlement Gate ────────────────────────────────────────────
  // Blocks Pro/Custom-only routes if the org's plan doesn't have the feature.
  // The plan store is populated on app mount; if not ready yet, allow through
  // (the plan guard will also enforce this in the component via FeatureGate).
  const requiredFeature = to.matched
    .slice()
    .reverse()
    .find(record => record.meta.feature)?.meta.feature;

  if (requiredFeature) {
    const planStore = usePlanStore();
    if (planStore.ready && !planStore.entitlements.has(requiredFeature)) {
      // Redirect to subscription page with a query param so the upgrade modal auto-opens
      next({ name: 'Subscription', query: { feature: requiredFeature, locked: '1' } });
      return;
    }
  }

  next();
});

router.onError((error) => {
  if (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed')
  ) {
    console.warn('Chunk load error detected. Reloading page...');
    window.location.reload();
  }
});

export default router;
