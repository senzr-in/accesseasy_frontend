import { createRouter, createWebHistory } from "vue-router";
import { authService } from "@/services/authService";
import { usePlanStore } from "@/stores/usePlanStore";

// Landing (Eagerly loaded for instant initial render)
import LandingPage2 from "@/pages/landing/LandingPage2.vue";

// Auth (Lazy Loaded)
const Login = () => import("@/components/loginAuthentication/login.vue");
const Register = () => import("@/components/loginAuthentication/register.vue");
const Verification = () => import("@/components/loginAuthentication/verification.vue");
const PinVerification = () => import("@/components/loginAuthentication/pinVerification.vue");
const EmailVerification = () => import("@/components/loginAuthentication/emailVerification.vue");
const AlternateLogin = () => import("@/components/loginAuthentication/alternateLogin.vue");
const AuthCallback = () => import("@/pages/authorize/AuthCallback.vue");
const DevLogin = () => import("@/components/loginAuthentication/devLogin.vue");

// Layout
const DashboardLayout = () => import("@/layouts/dashboardLayout.vue");

// Superadmin / Unused removed for Patrol-only mode
const PatrolsTab = () => import("@/pages/guard/tabs/PatrolsTab.vue");
const CreatePatrol = () => import("@/pages/guard/CreatePatrol.vue");
const Checkpoints = () => import("@/pages/guard/Checkpoints.vue");
const PatrolHistory = () => import("@/pages/guard/History.vue");
const Guards = () => import("@/pages/guard/index.vue");
const GuardAttendance = () => import("@/pages/guard/tabs/AttendanceTab.vue");
const Incidents = () => import("@/pages/incidents/index.vue");
const Sites = () => import("@/pages/sites/index.vue");
const SiteDetail = () => import("@/pages/sites/SiteDetail.vue");
const SiteGeofenceEditor = () => import("@/pages/sites/SiteGeofenceEditor.vue");
const Zones = () => import("@/pages/zones/index.vue");
const ZoneDetail = () => import("@/pages/zones/ZoneDetail.vue");
const CheckpointSettings = () => import("@/pages/settings/checkpoints/index.vue");
const EscalationPolicies = () => import("@/pages/settings/escalation/EscalationPolicies.vue");
const DeviceDashboard = () => import("@/pages/settings/devices/DeviceDashboard.vue");
const ShiftScheduler = () => import("@/pages/settings/shifts/ShiftScheduler.vue");
const AuditLog = () => import("@/pages/settings/AuditLog.vue");
const SubscriptionPage = () => import("@/pages/settings/subscription/SubscriptionPage.vue");
const Plans = () => import("@/pages/settings/plans/plans.vue");
const Logs = () => import("@/pages/logs/logTab.vue");
const Reports = () => import("@/pages/reports/index.vue");
const SettingsHub = () => import("@/pages/settings/SettingsHub.vue");
const Profile = () => import("@/pages/profile/index.vue");
const HelpSupport = () => import("@/pages/help/index.vue");

// ─── Role → Home Route map ───────────────────────────────────────────────────
const getRoleHome = () => {
  if (!authService.isAuthenticated()) return "/login";
  return "/dashboard/patrols";
};

const routes = [
  {
    path: "/",
    name: "Landing",
    component: LandingPage2,
    beforeEnter: (to, from, next) => {
      if (authService.isAuthenticated()) {
        next(getRoleHome());
      } else {
        next();
      }
    },
  },
  {
    path: "/landing",
    name: "LandingPage",
    component: LandingPage2,
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
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  // DEV ONLY — Hidden in production deployment
  ...(import.meta.env.DEV ? [{
    path: "/dev-login",
    name: "DevLogin",
    component: DevLogin,
  }] : []),
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
        component: PatrolsTab,
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "patrols",
        name: "Patrols",
        component: PatrolsTab,
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "patrols/create",
        name: "CreatePatrol",
        component: CreatePatrol,
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "patrols/checkpoints",
        name: "PatrolCheckpoints",
        component: Checkpoints,
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "patrols/history",
        name: "PatrolHistory",
        component: PatrolHistory,
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "guards",
        name: "Guards",
        component: Guards,
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "guards/attendance",
        name: "GuardAttendance",
        component: GuardAttendance,
        meta: { roles: ["Admin", "Manager", "Guard"], feature: "attendance.basic" }
      },
      {
        path: "incidents",
        name: "Incidents",
        component: Incidents,
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "sites",
        name: "Sites",
        component: Sites,
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "sites/:id",
        name: "SiteDetail",
        component: SiteDetail,
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "sites/:id/geofence",
        name: "SiteGeofenceEditor",
        component: SiteGeofenceEditor,
        meta: { roles: ["Admin", "Manager"], feature: "geofence.site" }
      },
      {
        path: "reports",
        name: "Reports",
        component: Reports,
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "profile",
        name: "Profile",
        component: Profile,
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "help",
        name: "HelpSupport",
        component: HelpSupport,
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      // ─── Settings Hub & Patrol Sub-modules ────────────────────────────────
      {
        path: "settings",
        name: "SettingsHub",
        component: SettingsHub,
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "settings/zones",
        name: "SettingsZones",
        component: Zones,
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "settings/zones/:id",
        name: "SettingsZoneDetail",
        component: ZoneDetail,
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "settings/checkpoints",
        name: "SettingsCheckpoints",
        component: CheckpointSettings,
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "settings/escalation",
        name: "EscalationPolicies",
        component: EscalationPolicies,
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "settings/devices",
        name: "SettingsDevices",
        component: DeviceDashboard,
        meta: { roles: ["Admin", "Manager"], feature: "ops.operations_center" }
      },
      {
        path: "settings/patrol-devices",
        name: "PatrolDevices",
        component: DeviceDashboard,
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "settings/shifts",
        name: "Shifts",
        component: ShiftScheduler,
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "settings/patrol-shifts",
        name: "PatrolShifts",
        component: ShiftScheduler,
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "settings/audit-log",
        name: "AuditLog",
        component: AuditLog,
        meta: { roles: ["Admin"] }
      },
      {
        path: "settings/logs",
        name: "SettingsLogs",
        component: Logs,
        meta: { roles: ["Admin", "Manager", "Guard"] }
      },
      {
        path: "settings/subscription",
        name: "Subscription",
        component: SubscriptionPage,
        meta: { roles: ["Admin", "Manager"] }
      },
      {
        path: "settings/plans",
        name: "PatrolPlans",
        component: Plans,
        meta: { roles: ["Admin", "Manager"] }
      }
    ]
  },
  // Catch-all — send to patrol home
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
