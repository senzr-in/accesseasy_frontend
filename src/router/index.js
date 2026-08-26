import { createRouter, createWebHistory } from "vue-router";
import { authService } from "@/services/authService";

// Landing
import LandingPage2 from "@/pages/landing/LandingPage2.vue";

// Auth
import Login from "@/components/loginAuthentication/login.vue";
import Register from "@/components/loginAuthentication/register.vue";
import Verification from "@/components/loginAuthentication/verification.vue";
import PinVerification from "@/components/loginAuthentication/pinVerification.vue";
import EmailVerification from "@/components/loginAuthentication/emailVerification.vue";
import AlternateLogin from "@/components/loginAuthentication/alternateLogin.vue";
import AuthCallback from "@/pages/authorize/AuthCallback.vue";

// Layout
import DashboardLayout from "@/layouts/dashboardLayout.vue";

// Superadmin (esslAdmin) Dashboard
import EsslDashboard from "@/pages/dealers/dashboard/esslDashboard.vue";

// Visitor Portal
import VisitorPortalView from "@/pages/visitorPortals/VisitorPortalView.vue";

// DEV ONLY: Dev quick login bypass
import DevLogin from "@/components/loginAuthentication/devLogin.vue";

// Placeholders / Ports
import DashboardHome from "@/pages/dashboard/index.vue";
import Employees from "@/pages/employee/my-teams/personalDetails/employeeDetails.vue";
import Devices from "@/pages/devicesManager/deviceManagerTabs.vue";
import DeviceDashboard from "@/pages/settings/devices/DeviceDashboard.vue";
import Doors from "@/pages/devicesManager/doors/doorsVue.vue";
import Zones from "@/pages/zones/index.vue";
import Logs from "@/pages/logs/logTab.vue";
import OnboardingPage from "@/pages/onboarding/index.vue";
import Timerzones from "@/pages/accesslevel/timerzone.vue";
import BranchConfiguration from "@/pages/settings/configuration/branch/branchConfiguration.vue";
import BranchAddForm from "@/pages/settings/configuration/branch/branchAddForm.vue";
import BranchEditForm from "@/pages/settings/configuration/branch/branchEditForm.vue";
import AppearanceSettings from "@/pages/settings/appearance.vue";

const getRoleHome = () => {
  if (!authService.isAuthenticated()) return "/login";
  const role = authService.getUserRole();
  if (role === "esslAdmin")  return "/dealer-dashboard";
  if (role === "Guard")      return "/dashboard/patrols";    // Security App home
  if (role === "Employee")   return "/dashboard/my-access";  // Workforce App home
  return "/dashboard"; // Admin & Manager → Command Center
};

const appMode = import.meta.env.VITE_APP_MODE || 'workforce';

let dashboardChildren = [];

if (appMode === 'security') {
  dashboardChildren = [
    { path: "", name: "DashboardHome", component: DashboardHome, meta: { roles: ["Admin", "Manager", "Employee", "Guard"] } },
    { path: "settings", name: "SettingsHub", component: () => import("@/pages/settings/SettingsHub.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/appearance", name: "SettingsAppearance", component: AppearanceSettings, meta: { roles: ["Admin"] } },
    { path: "settings/devices", name: "SettingsDevices", component: DeviceDashboard, meta: { roles: ["Admin"] } },
    { path: "settings/checkpoints", name: "SettingsCheckpoints", component: () => import("@/pages/settings/checkpoints/index.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/ai-events", name: "SettingsAiEvents", component: () => import("@/pages/settings/aiEvents.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "settings/logs", name: "SettingsLogs", component: Logs, meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "settings/zones", name: "SettingsZones", component: Zones, meta: { roles: ["Admin"] } },
    { path: "settings/escalation", name: "SettingsEscalation", component: () => import("@/pages/settings/escalation/EscalationPolicies.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/patrol-shifts", name: "SettingsPatrolShifts", component: () => import("@/pages/settings/shifts/ShiftScheduler.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/audit-log", name: "SettingsAuditLog", component: () => import("@/pages/settings/AuditLog.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/subscription", name: "SettingsSubscription", component: () => import("@/pages/settings/subscription/SubscriptionPage.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/plans", name: "SettingsPlans", component: () => import("@/pages/settings/plans/plans.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "sites", name: "Sites", component: () => import("@/pages/sites/index.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "sites/:id", name: "SiteDetail", component: () => import("@/pages/sites/SiteDetail.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "monitoring", name: "Monitoring", component: () => import("@/pages/monitoring/index.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "reports", name: "Reports", component: () => import("@/pages/reports/index.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "guards", name: "Guards", component: () => import("@/pages/guard/index.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "guards/attendance", name: "GuardAttendance", component: () => import("@/pages/guard/tabs/AttendanceTab.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "patrols", name: "Patrols", component: () => import("@/pages/guard/tabs/PatrolsTab.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "patrols/create", name: "CreatePatrol", component: () => import("@/pages/guard/CreatePatrol.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "patrols/history", name: "PatrolHistory", component: () => import("@/pages/guard/History.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "patrols/checkpoints", name: "PatrolCheckpoints", component: () => import("@/pages/guard/Checkpoints.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "visitors", name: "Visitors", component: () => import("@/pages/visitors/index.vue"), meta: { roles: ["Admin", "Guard", "Employee"] } },
    { path: "settings/roles", name: "SettingsRoles", component: () => import("@/pages/settings/roleConfigurator/roleconfig.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/shifts", name: "SettingsShifts", component: () => import("@/pages/settings/shifts/shiftsManagmnet.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/permissions", name: "SettingsPermissions", component: () => import("@/pages/settings/roleConfigurator/roleconfig.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "incidents", name: "Incidents", component: () => import("@/pages/incidents/index.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "help", name: "HelpSupport", component: () => import("@/pages/help/index.vue"), meta: { roles: ["Admin", "Manager", "Employee", "Guard"] } }
  ];
} else {
  dashboardChildren = [
    { path: "", name: "DashboardHome", component: DashboardHome, meta: { roles: ["Admin", "Manager", "Employee", "Guard"] } },
    { path: "easy-access/employees", name: "Employees", component: Employees, meta: { roles: ["Admin", "Manager"] } },
    { path: "settings", name: "SettingsHub", component: () => import("@/pages/settings/SettingsHub.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/appearance", name: "SettingsAppearance", component: AppearanceSettings, meta: { roles: ["Admin"] } },
    { path: "settings/devices", name: "SettingsDevices", component: DeviceDashboard, meta: { roles: ["Admin"] } },
    { path: "settings/checkpoints", name: "SettingsCheckpoints", component: () => import("@/pages/settings/checkpoints/index.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/ai-events", name: "SettingsAiEvents", component: () => import("@/pages/settings/aiEvents.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "settings/logs", name: "SettingsLogs", component: Logs, meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "settings/zones", name: "SettingsZones", component: Zones, meta: { roles: ["Admin"] } },
    { path: "settings/escalation", name: "SettingsEscalation", component: () => import("@/pages/settings/escalation/EscalationPolicies.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/patrol-shifts", name: "SettingsPatrolShifts", component: () => import("@/pages/settings/shifts/ShiftScheduler.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/audit-log", name: "SettingsAuditLog", component: () => import("@/pages/settings/AuditLog.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/subscription", name: "SettingsSubscription", component: () => import("@/pages/settings/subscription/SubscriptionPage.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/plans", name: "SettingsPlans", component: () => import("@/pages/settings/plans/plans.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "settings/timezones", name: "SettingsTimezones", component: Timerzones, meta: { roles: ["Admin"] } },
    { path: "settings/branches", name: "SettingsBranches", component: BranchConfiguration, meta: { roles: ["Admin"] } },
    { path: "settings/branches/add", name: "SettingsBranchAdd", component: BranchAddForm, meta: { roles: ["Admin"] } },
    { path: "settings/branches/:id/edit", name: "SettingsBranchEdit", component: BranchEditForm, meta: { roles: ["Admin"] } },
    { path: "sites", name: "Sites", component: () => import("@/pages/sites/index.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "sites/:id", name: "SiteDetail", component: () => import("@/pages/sites/SiteDetail.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "access-control/doors", name: "Doors", component: Doors, meta: { roles: ["Admin"] } },
    { path: "easy-access/configurators/access-levels", name: "AccessLevels", component: () => import("@/pages/devicesManager/accesslevel/accesslevelCatagory.vue"), meta: { roles: ["Admin"] } },
    { path: "guards", name: "Guards", component: () => import("@/pages/guard/index.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "guards/attendance", name: "GuardAttendance", component: () => import("@/pages/guard/tabs/AttendanceTab.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "patrols", name: "Patrols", component: () => import("@/pages/guard/tabs/PatrolsTab.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "patrols/create", name: "CreatePatrol", component: () => import("@/pages/guard/CreatePatrol.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "patrols/history", name: "PatrolHistory", component: () => import("@/pages/guard/History.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "patrols/checkpoints", name: "PatrolCheckpoints", component: () => import("@/pages/guard/Checkpoints.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "authorize", name: "Authorize", component: () => import("@/pages/authorize/index.vue"), meta: { roles: ["Admin", "Guard"] } },
    { path: "visitors", name: "Visitors", component: () => import("@/pages/visitors/index.vue"), meta: { roles: ["Admin", "Guard", "Employee"] } },
    { path: "visitor-portals", name: "VisitorPortals", component: () => import("@/pages/visitorPortals/index.vue"), meta: { roles: ["Admin"] } },
    { path: "visitor-portals/builder/:id?", name: "VisitorPortalBuilder", component: () => import("@/pages/visitorPortals/builder.vue"), meta: { roles: ["Admin"] } },
    { path: "access-control/schedules", name: "Schedules", component: () => import("@/pages/schedules/index.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "access-control/rules", name: "Rules", component: () => import("@/pages/rules/index.vue"), meta: { roles: ["Admin"] } },
    { path: "monitoring", name: "Monitoring", component: () => import("@/pages/monitoring/index.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "reports", name: "Reports", component: () => import("@/pages/reports/index.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "firmware", name: "Firmware", component: () => import("@/pages/firmware/index.vue"), meta: { roles: ["Admin"] } },
    { path: "device-types", name: "DeviceTypes", component: () => import("@/pages/deviceTypes/index.vue"), meta: { roles: ["Admin"] } },
    { path: "mobile-pass", name: "MobilePass", component: () => import("@/pages/mobilePass/index.vue"), meta: { roles: ["Admin", "Manager", "Employee"] } },
    { path: "easy-access/biometrics/face", name: "FaceEmbedding", component: () => import("@/pages/faceEmbedding/index.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "easy-access/biometrics/fingerprint", name: "FingerprintManagement", component: () => import("@/pages/fingerData/index.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "easy-access/biometrics/qr", name: "QRGenerate", component: () => import("@/pages/qrgenerate/index.vue"), meta: { roles: ["Admin", "Manager"] } },
    { path: "my-access", name: "MyAccess", component: () => import("@/pages/myAccess/index.vue"), meta: { roles: ["Admin", "Manager", "Employee"] } },
    { path: "my-attendance", name: "MyAttendance", component: () => import("@/pages/myAttendance/index.vue"), meta: { roles: ["Admin", "Manager", "Employee"] } },
    { path: "my-logs", name: "MyLogs", component: () => import("@/pages/myLogs/index.vue"), meta: { roles: ["Admin", "Manager", "Employee"] } },
    { path: "profile", name: "Profile", component: () => import("@/pages/profile/index.vue"), meta: { roles: ["Admin", "Manager", "Employee"] } },
    { path: "report-automation", name: "ReportAutomation", component: () => import("@/pages/reportAutomation/index.vue"), meta: { roles: ["Admin"] } },
    { path: "incidents", name: "Incidents", component: () => import("@/pages/incidents/index.vue"), meta: { roles: ["Admin", "Manager", "Guard"] } },
    { path: "help", name: "HelpSupport", component: () => import("@/pages/help/index.vue"), meta: { roles: ["Admin", "Manager", "Employee", "Guard"] } }
  ];
}

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
    path: "/landing-2",
    redirect: "/landing",
  },
  {
    path: "/landing-v2",
    redirect: "/landing",
  },
  {
    path: "/landing-3d",
    redirect: "/landing",
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
  // ⚠ DEV ONLY — Hidden in production deployment
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
    children: dashboardChildren
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
    // (the backend will enforce permissions; we don't lock out legitimate users)
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
