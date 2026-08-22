// src/utils/currentUserTenant.js
import { authService } from "@/services/authService";

class CurrentUserTenant {
  constructor() {
    this.tenantId = null;
    this.tenantName = null;
    this.tenantPlan = null;
    this.accountSettings = null;
    this.role = null;
    this.userId = null;
    this.isLoading = false;
    this.initialized = false;
    this.initPromise = null;

    // Register callback with authService to clear in-memory state on logout
    authService.registerLogoutListener(() => this.clearUserData());
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    if (this.isLoading && this.initPromise) {
      return this.initPromise;
    }

    this.isLoading = true;
    this.initPromise = (async () => {
      try {
        await this.fetchLoginUserDetails();
        this.initialized = true;
      } catch (error) {
        // If the localStorage fallback in fetchLoginUserDetails already set initialized=true,
        // we're fine — don't rethrow. Otherwise propagate.
        if (!this.initialized) {
          console.error("Failed to initialize user data:", error);
          throw error;
        }
      } finally {
        this.isLoading = false;
      }
    })();

    return this.initPromise;
  }

  async fetchLoginUserDetails() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("User token not found");
      }

      if (!authService.isAuthenticated()) {
        throw new Error("User not authenticated");
      }

      // Use cached userData only if it has complete tenant and role config, otherwise fetch fresh from the profile endpoint
      let userData = authService.getUserData();
      const hasCompleteData = userData && 
        (!userData.tenant || userData.tenant.userApp) && 
        (userData.roleConfig || userData.accesseasyRole || userData.role || userData.title);

      if (!hasCompleteData) {
        userData = await authService.getCurrentUser();
      }

      if (userData) {
        // Verify that the user's tenant has access to accesseasy
        let userApps = userData.tenant?.userApp || [];
        if (typeof userApps === "string") {
          try {
            userApps = JSON.parse(userApps);
          } catch (e) {
            userApps = [];
          }
        }
        hasAccess = !userData.tenant || (Array.isArray(userApps) && userApps.some(app => String(app.userApp || "").toLowerCase() === "accesseasy"));

        // If tenant does not have accesseasy entry yet (e.g. fresh Google signup), auto-allow and register in background
        if (!hasAccess && userData.tenant) {
          hasAccess = true;
          const tId = userData.tenant?.tenantId || userData.tenant?.id || (typeof userData.tenant === "string" ? userData.tenant : null);
          if (tId && userData.id) {
            authService.ensureTenantUserApp(tId, userData.id, "accesseasy").catch(e =>
              console.warn("[currentUserTenant] Background userApp registration:", e.message)
            );
          }
        }

        this.tenantId = userData.tenant?.tenantId || userData.tenant?.id || (typeof userData.tenant === "string" ? userData.tenant : null) || authService.getTenantId() || null;
        this.tenantName = userData.tenant?.tenantName || userData.tenant?.name || (typeof userData.tenant === "string" ? null : userData.tenant) || null;

        this.tenantPlan = userData.tenant?.plan || null;
        if (typeof this.tenantPlan === "string") {
          try {
            this.tenantPlan = JSON.parse(this.tenantPlan);
          } catch (parseError) {
            console.warn("Failed to parse tenant plan JSON:", parseError);
          }
        }

        this.accountSettings = userData.tenant?.accountSettings || null;
        if (typeof this.accountSettings === "string") {
          try {
            this.accountSettings = JSON.parse(this.accountSettings);
          } catch (parseError) {
            console.warn("Failed to parse account settings JSON:", parseError);
          }
        }

        // Save/set details in authService for local storage sync and update roles
        authService.setUserData(userData);
        this.role = authService.getUserRole();
        this.userId = userData.id;
        return userData;
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.warn("currentUserTenant: API fetch failed, falling back to localStorage:", error.message);

      // ── Graceful fallback: read from localStorage (covers dev bypass + token refresh edge cases)
      const localUserData = authService.getUserData();
      if (localUserData) {
        this.tenantId = localUserData.tenant?.tenantId || localUserData.tenant?.id || (typeof localUserData.tenant === 'string' ? localUserData.tenant : null) || authService.getTenantId() || null;
        this.tenantName = localUserData.tenant?.tenantName || localUserData.tenant?.name || (typeof localUserData.tenant === 'string' ? null : localUserData.tenant) || null;
        this.role = authService.getUserRole();
        this.userId = localUserData.id || null;
        this.tenantPlan = localUserData.tenant?.plan || null;
        this.accountSettings = localUserData.tenant?.accountSettings || null;
        this.initialized = true;
        console.log("currentUserTenant: Loaded from localStorage fallback — role:", this.role);
        return localUserData;
      }

      // Only hard-logout if we have absolutely no user data at all AND it's a 401
      if (error.response?.status === 401 && !localUserData) {
        console.error("currentUserTenant: 401 with no local user data — logging out.");
        this.clearUserData();
        authService.logout();
      }

      throw error;
    }
  }

  clearUserData() {
    this.tenantId = null;
    this.tenantName = null;
    this.tenantPlan = null;
    this.accountSettings = null;
    this.role = null;
    this.userId = null;
    this.initialized = false;
    this.isLoading = false;
    this.initPromise = null; // ✅ Clear promise
  }

  getTenantId() {
    if (!authService.isAuthenticated()) {
      return null;
    }
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.tenantId;
  }

  getRole() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.role;
  }

  getUserId() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.userId;
  }

  getTenantName() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.tenantName;
  }

  getTenantPlan() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.tenantPlan;
  }

  getAccountSettings() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.accountSettings;
  }

  async refresh() {
    this.initialized = false;
    this.isLoading = false;
    this.initPromise = null;
    this.tenantId = null;
    this.tenantName = null;
    this.tenantPlan = null;
    this.accountSettings = null;
    this.role = null;
    this.userId = null;

    await this.initialize();
    return {
      tenantId: this.tenantId,
      role: this.role,
      userId: this.userId,
    };
  }

  async getTenantIdAsync() {
    if (!authService.isAuthenticated()) {
      return null;
    }
    await this.initialize();
    return this.tenantId;
  }

  async getRoleAsync() {
    await this.initialize();
    return this.role;
  }

  async getUserIdAsync() {
    await this.initialize();
    return this.userId;
  }

  async getTenantNameAsync() {
    await this.initialize();
    return this.tenantName;
  }

  async getTenantPlanAsync() {
    await this.initialize();
    return this.tenantPlan;
  }

  async getAccountSettingsAsync() {
    await this.initialize();
    return this.accountSettings;
  }

  getPlanProperty(propertyName) {
    const plan = this.getTenantPlan();
    return plan && typeof plan === "object" ? plan[propertyName] : null;
  }

  async getPlanPropertyAsync(propertyName) {
    const plan = await this.getTenantPlanAsync();
    return plan && typeof plan === "object" ? plan[propertyName] : null;
  }

  getAccountSetting(propertyName) {
    const settings = this.getAccountSettings();
    return settings && typeof settings === "object"
      ? settings[propertyName]
      : null;
  }

  async getAccountSettingAsync(propertyName) {
    const settings = await this.getAccountSettingsAsync();
    return settings && typeof settings === "object"
      ? settings[propertyName]
      : null;
  }

  getCurrency() {
    return this.getAccountSetting("currency");
  }

  async getCurrencyAsync() {
    return await this.getAccountSettingAsync("currency");
  }
}

export const currentUserTenant = new CurrentUserTenant();
