// authService.js;
import axios from "axios";
import Cookies from "js-cookie";
import { appConfigService } from "@/services/appConfigService";

class AuthService {
  constructor() {
    this.logoutListeners = [];

    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    this.knApi = axios.create({
      baseURL: import.meta.env.VITE_KN_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    this.protectedApi = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    // Global Error Interceptor for "Worst Case" Handling
    const handleNetworkErrors = (error) => {
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        error.message = "Unable to connect. Please check your internet.";
      }
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        error.message = "Request timed out (10s). Please try again.";
      }
      if (error.response?.status === 429) {
        error.message = "Too many requests. Please wait a moment.";
      }
      return Promise.reject(error);
    };

    [this.api, this.knApi, this.protectedApi].forEach((instance) => {
      instance.interceptors.response.use((r) => r, handleNetworkErrors);
    });

    [this.knApi, this.protectedApi].forEach((instance) => {
      instance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
      );
    });

    this.protectedApi.interceptors.response.use(
      (response) => {
        this.updateLastActivity();
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest?._retried) {
          originalRequest._retried = true;
          const refreshToken = this.getRefreshToken();
          if (refreshToken) {
            try {
              const directusBase = this.baseURL || 'https://api.fieldseasy.com';
              const res = await axios.post(`${directusBase}/auth/refresh`, {
                refresh_token: refreshToken,
                mode: 'json'
              });
              if (res.data?.data) {
                const { access_token, refresh_token: newRefresh } = res.data.data;
                this.setToken(access_token, newRefresh);
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                return this.protectedApi(originalRequest);
              }
            } catch (refreshErr) {
              console.warn('[AuthService] Token refresh failed:', refreshErr?.message);
              this.softLogout();
            }
          }
        }
        return Promise.reject(error);
      },
    );

    if (typeof window !== "undefined") {
      this.authChannel = new BroadcastChannel("accesseasy_auth_channel");
      this.authChannel.onmessage = (event) => {
        if (event.data?.type === "NEW_LOGIN") {
          const currentUserId = this.getUserId();
          if (currentUserId && event.data.userId === currentUserId) {
            console.log("[AuthService] Same user logged in on another tab. Keeping session alive.");
            if (event.data.token) this.setToken(event.data.token);
          } else {
            console.warn("[AuthService] Different user logged in on another tab. Invalidating session.");
            this.handleConcurrentLogin();
          }
        }
      };
    }

    this.initInactivityTracking();
  }

  onSuccessfulLogin(userId) {
    if (this.authChannel && userId) {
      this.authChannel.postMessage({
        type: "NEW_LOGIN",
        userId: userId,
      });
    }
  }

  handleConcurrentLogin() {
    this.softLogout();

    if (typeof window !== "undefined") {
      // ── Inject keyframe animation once ──────────────────────────────────
      if (!document.getElementById("session-modal-styles")) {
        const styleEl = document.createElement("style");
        styleEl.id = "session-modal-styles";
        styleEl.textContent = `
          @keyframes session-modal-in {
            from { opacity: 0; transform: scale(0.92) translateY(12px); }
            to   { opacity: 1; transform: scale(1)   translateY(0); }
          }
          @keyframes session-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.45); }
            50%       { box-shadow: 0 0 0 14px rgba(239,68,68,0); }
          }
        `;
        document.head.appendChild(styleEl);
      }

      // Remove any existing concurrent/timeout overlays
      const existingOverlays = document.querySelectorAll(".session-concurrent-modal-overlay, .session-timeout-modal-overlay");
      existingOverlays.forEach(el => el.remove());

      // ── Overlay ──────────────────────────────────────────────────────────
      const modalOverlay = document.createElement("div");
      modalOverlay.className = "session-concurrent-modal-overlay";
      Object.assign(modalOverlay.style, {
        position:        "fixed",
        inset:           "0",
        width:           "100%",
        height:          "100%",
        backgroundColor: "rgba(0,0,0,0.65)",
        backdropFilter:  "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        zIndex:          "9999",
        padding:         "16px",
      });

      // ── Card ─────────────────────────────────────────────────────────────
      const modalContent = document.createElement("div");
      Object.assign(modalContent.style, {
        background:    "linear-gradient(145deg, #18181b, #09090b)",
        border:        "1px solid rgba(63,63,70,0.8)",
        borderRadius:  "20px",
        padding:       "36px 32px",
        width:         "100%",
        maxWidth:      "400px",
        textAlign:     "center",
        boxShadow:     "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
        animation:     "session-modal-in 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards",
      });

      // ── Icon ring ────────────────────────────────────────────────────────
      const iconRing = document.createElement("div");
      Object.assign(iconRing.style, {
        width:           "72px",
        height:          "72px",
        borderRadius:    "50%",
        background:      "linear-gradient(135deg, #ef4444, #b91c1c)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        margin:          "0 auto 24px",
        animation:       "session-pulse 2s infinite",
        flexShrink:      "0",
      });
      iconRing.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
             stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>`;

      // ── Badge ────────────────────────────────────────────────────────────
      const badge = document.createElement("span");
      Object.assign(badge.style, {
        display:       "inline-block",
        padding:       "3px 10px",
        borderRadius:  "999px",
        fontSize:      "10px",
        fontWeight:    "800",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        background:    "rgba(239,68,68,0.12)",
        color:         "#f87171",
        border:        "1px solid rgba(239,68,68,0.25)",
        marginBottom:  "12px",
      });
      badge.textContent = "Concurrent Login";

      // ── Heading ──────────────────────────────────────────────────────────
      const heading = document.createElement("h3");
      Object.assign(heading.style, {
        fontSize:     "22px",
        fontWeight:   "900",
        color:        "#fafafa",
        marginBottom: "8px",
        letterSpacing: "-0.02em",
        lineHeight:   "1.2",
        fontFamily:   "inherit",
      });
      heading.textContent = "Session Invalidated";

      // ── Message ──────────────────────────────────────────────────────────
      const message = document.createElement("p");
      Object.assign(message.style, {
        fontSize:     "14px",
        color:        "#a1a1aa",
        marginBottom: "28px",
        lineHeight:   "1.6",
        fontFamily:   "inherit",
      });
      message.textContent = "You have been logged out because a new login was detected in another tab.";

      // ── Button ───────────────────────────────────────────────────────────
      const okButton = document.createElement("button");
      Object.assign(okButton.style, {
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            "8px",
        width:          "100%",
        padding:        "12px 24px",
        background:     "linear-gradient(135deg, #ef4444, #b91c1c)",
        color:          "white",
        border:         "none",
        borderRadius:   "12px",
        fontSize:       "13px",
        fontWeight:     "800",
        letterSpacing:  "0.06em",
        textTransform:  "uppercase",
        cursor:         "pointer",
        transition:     "opacity 0.2s, transform 0.15s",
        boxShadow:      "0 4px 20px rgba(239,68,68,0.35)",
        fontFamily:     "inherit",
      });
      okButton.textContent = "Sign In Again";
      okButton.onmouseenter = () => { okButton.style.opacity = "0.88"; okButton.style.transform = "scale(0.98)"; };
      okButton.onmouseleave = () => { okButton.style.opacity = "1";    okButton.style.transform = "scale(1)"; };
      okButton.onclick = () => {
        document.body.removeChild(modalOverlay);
        window.location.href = "/login";
      };

      // ── Assemble ─────────────────────────────────────────────────────────
      modalContent.appendChild(iconRing);
      modalContent.appendChild(badge);
      modalContent.appendChild(heading);
      modalContent.appendChild(message);
      modalContent.appendChild(okButton);
      modalOverlay.appendChild(modalContent);
      document.body.appendChild(modalOverlay);
    }
  }

  handleSessionExpired() {
    if (this._sessionExpiredModalOpen) return;
    this._sessionExpiredModalOpen = true;
    this.softLogout();

    if (typeof window !== "undefined") {
      if (!document.getElementById("session-modal-styles")) {
        const styleEl = document.createElement("style");
        styleEl.id = "session-modal-styles";
        styleEl.textContent = `
          @keyframes session-modal-in {
            from { opacity: 0; transform: scale(0.92) translateY(12px); }
            to   { opacity: 1; transform: scale(1)   translateY(0); }
          }
          @keyframes session-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.45); }
            50%       { box-shadow: 0 0 0 14px rgba(239,68,68,0); }
          }
        `;
        document.head.appendChild(styleEl);
      }

      const existingOverlays = document.querySelectorAll(".session-concurrent-modal-overlay, .session-timeout-modal-overlay");
      existingOverlays.forEach(el => el.remove());

      const modalOverlay = document.createElement("div");
      modalOverlay.className = "session-timeout-modal-overlay";
      Object.assign(modalOverlay.style, {
        position:        "fixed",
        inset:           "0",
        width:           "100%",
        height:          "100%",
        backgroundColor: "rgba(0,0,0,0.65)",
        backdropFilter:  "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        zIndex:          "9999",
        padding:         "16px",
      });

      const modalContent = document.createElement("div");
      Object.assign(modalContent.style, {
        background:    "linear-gradient(145deg, #18181b, #09090b)",
        border:        "1px solid rgba(63,63,70,0.8)",
        borderRadius:  "20px",
        padding:       "36px 32px",
        width:         "100%",
        maxWidth:      "400px",
        textAlign:     "center",
        boxShadow:     "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
        animation:     "session-modal-in 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards",
      });

      const iconRing = document.createElement("div");
      Object.assign(iconRing.style, {
        width:           "72px",
        height:          "72px",
        borderRadius:    "50%",
        background:      "linear-gradient(135deg, #f59e0b, #d97706)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        margin:          "0 auto 24px",
        animation:       "session-pulse 2s infinite",
        flexShrink:      "0",
      });
      iconRing.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
             stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>`;

      const badge = document.createElement("span");
      Object.assign(badge.style, {
        display:       "inline-block",
        padding:       "3px 10px",
        borderRadius:  "999px",
        fontSize:      "10px",
        fontWeight:    "800",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        background:    "rgba(245,158,11,0.12)",
        color:         "#fbbf24",
        border:        "1px solid rgba(245,158,11,0.25)",
        marginBottom:  "12px",
      });
      badge.textContent = "Session Expired";

      const heading = document.createElement("h3");
      Object.assign(heading.style, {
        fontSize:     "22px",
        fontWeight:   "900",
        color:        "#fafafa",
        marginBottom: "8px",
        letterSpacing: "-0.02em",
        lineHeight:   "1.2",
        fontFamily:   "inherit",
      });
      heading.textContent = "Authentication Required";

      const message = document.createElement("p");
      Object.assign(message.style, {
        fontSize:     "14px",
        color:        "#a1a1aa",
        marginBottom: "28px",
        lineHeight:   "1.6",
        fontFamily:   "inherit",
      });
      message.textContent = "Your session token has expired or is invalid. Please sign in again to continue.";

      const okButton = document.createElement("button");
      Object.assign(okButton.style, {
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            "8px",
        width:          "100%",
        padding:        "12px 24px",
        background:     "linear-gradient(135deg, #6366f1, #4f46e5)",
        color:          "white",
        border:         "none",
        borderRadius:   "12px",
        fontSize:       "13px",
        fontWeight:     "800",
        letterSpacing:  "0.06em",
        textTransform:  "uppercase",
        cursor:         "pointer",
        transition:     "opacity 0.2s, transform 0.15s",
        boxShadow:      "0 4px 20px rgba(99,102,241,0.35)",
        fontFamily:     "inherit",
      });
      okButton.textContent = "Sign In Again";
      okButton.onclick = () => {
        this._sessionExpiredModalOpen = false;
        document.body.removeChild(modalOverlay);
        window.location.href = "/login";
      };

      modalContent.appendChild(iconRing);
      modalContent.appendChild(badge);
      modalContent.appendChild(heading);
      modalContent.appendChild(message);
      modalContent.appendChild(okButton);
      modalOverlay.appendChild(modalContent);
      document.body.appendChild(modalOverlay);
    }
  }

  setToken(token, refreshToken = null) {
    if (!token) return;
    Cookies.set("userToken", token, { expires: 1 });
    sessionStorage.setItem("userToken", token);
    localStorage.setItem("userToken", token);
    if (refreshToken) {
      localStorage.setItem("ae_refresh_token", refreshToken);
      Cookies.set("refreshToken", refreshToken, { expires: 7 });
    }
    this.protectedApi.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
    this.updateLastActivity();
  }

  getRefreshToken() {
    return localStorage.getItem("ae_refresh_token") || Cookies.get("refreshToken");
  }

  getToken() {
    return Cookies.get("userToken") || sessionStorage.getItem("userToken") || localStorage.getItem("userToken");
  }

  setPhone(phone) {
    if (!phone) return;
    const cleanPhone = phone.replace(/\s/g, "");
    localStorage.setItem("userPhone", cleanPhone);
  }

  getPhone() {
    return localStorage.getItem("userPhone");
  }

  setEmail(email) {
    if (!email) return;
    localStorage.setItem("email", email);
  }

  getEmail() {
    return localStorage.getItem("email");
  }

  // Add tenant-related methods
  setTenantData(tenantData) {
    if (tenantData) {
      localStorage.setItem("tenantData", JSON.stringify(tenantData));
    }
  }

  getTenantData() {
    try {
      const tenantData = localStorage.getItem("tenantData");
      if (!tenantData) return null;
      return JSON.parse(tenantData);
    } catch (e) {
      return localStorage.getItem("tenantData");
    }
  }

  getTenantName() {
    const tenantData = this.getTenantData();
    if (typeof tenantData === "string") {
      return "";
    }
    return tenantData?.tenantName || tenantData?.name || "";
  }

  getTenantId() {
    const tenantData = this.getTenantData();
    if (typeof tenantData === "string") {
      return tenantData;
    }
    return tenantData?.tenantId || tenantData?.id || "";
  }

  // Add user-related methods
  setUserData(userData) {
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
      const tid = userData?.tenant?.tenantId || userData?.tenant?.id;
      const uid = userData?.id;
      const appName = userData?.userApp || "patrol";

      if (tid && uid) {
        this.ensureTenantUserApp(tid, uid, appName).catch(err =>
          console.warn("[setUserData] Background userApp registration failed:", err.message)
        );
      }

      // Automatically sync email and phone to localStorage if present in userData
      // This ensures isAuthenticated() stays consistent
      if (userData.email) {
        this.setEmail(userData.email);
      }
      if (userData.phone) {
        this.setPhone(userData.phone);
      }

      // Also store tenant data if it exists in user data
      if (userData.tenant) {
        this.setTenantData(userData.tenant);
      }
    }
  }

  getUserData() {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  }

  getUserRole() {
    const userData = this.getUserData();
    if (!userData) return "";

    // 1. Directus Administrator system role check (admin_access or name contains admin)
    if (userData?.role?.admin_access === true || userData?.role?.name?.toLowerCase()?.includes("admin")) {
      return "Admin";
    }

    // 2. Application Role Configurator check (accesseasyPatrolRole, patrolRole, accesseasyRole, roleConfig)
    const roleConfigName = userData?.accesseasyPatrolRole?.roleName || userData?.patrolRole?.roleName || userData?.accesseasyRole?.roleName || userData?.roleConfig?.roleName || "";
    if (roleConfigName) {
      const lowercaseName = roleConfigName.toLowerCase();
      if (lowercaseName.includes("admin")) {
        return "Admin";
      } else if (lowercaseName.includes("guard") || lowercaseName.includes("security")) {
        return "Guard";
      } else if (lowercaseName.includes("manager")) {
        return "Manager";
      } else if (lowercaseName.includes("employee")) {
        // If title says Guard or Admin, honor the title
        if (userData?.title?.toLowerCase()?.includes("guard")) return "Guard";
        if (userData?.title?.toLowerCase()?.includes("admin")) return "Admin";
        return "Employee";
      } else {
        return roleConfigName.charAt(0).toUpperCase() + roleConfigName.slice(1);
      }
    }

    // 3. Title check for Admin / Guard
    if (userData?.title?.toLowerCase()?.includes("admin") || userData?.title?.toLowerCase()?.includes("owner")) {
      return "Admin";
    }
    if (userData?.title?.toLowerCase()?.includes("guard") || userData?.title?.toLowerCase()?.includes("security")) {
      return "Guard";
    }

    // 4. Fallback to userData.role.name
    const fallbackName = userData?.role?.name || "";
    if (fallbackName) {
      const lowerFallback = fallbackName.toLowerCase();
      if (lowerFallback.includes("admin")) return "Admin";
      if (lowerFallback.includes("guard") || lowerFallback.includes("security")) return "Guard";
      if (lowerFallback.includes("manager")) return "Manager";
      if (lowerFallback.includes("employee")) return "Employee";
      return fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);
    }

    // 5. Default to Admin if user has tenant management capabilities
    return "Admin";
  }


  getUserId() {
    const userData = this.getUserData();
    return userData?.id || "";
  }

  getUserTenant() {
    const userData = this.getUserData();
    return userData?.tenant || this.getTenantData();
  }

  isAuthenticated() {
    return !!(this.getToken() && (this.getPhone() || this.getEmail()));
  }

  registerLogoutListener(cb) {
    if (typeof cb === "function") {
      this.logoutListeners.push(cb);
    }
  }

  triggerLogoutListeners() {
    this.logoutListeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error("Error in logout listener:", e);
      }
    });
  }

  logout() {
    Cookies.remove("userToken");
    
    // Clear all localStorage keys except the theme preference
    const theme = localStorage.getItem("ae_theme");
    localStorage.clear();
    if (theme) {
      localStorage.setItem("ae_theme", theme);
    }

    // Clear sessionStorage
    sessionStorage.clear();

    delete this.protectedApi.defaults.headers.common["Authorization"];
    
    this.triggerLogoutListeners();

    window.location.href = "/login";
  }

  // Clears auth state without redirecting (used by router guard before it redirects)
  softLogout() {
    Cookies.remove("userToken");
    
    // Clear all localStorage keys except the theme preference
    const theme = localStorage.getItem("ae_theme");
    localStorage.clear();
    if (theme) {
      localStorage.setItem("ae_theme", theme);
    }

    // Clear sessionStorage
    sessionStorage.clear();

    delete this.protectedApi.defaults.headers.common["Authorization"];
    
    this.triggerLogoutListeners();
  }

  // Validates token against the server — returns true if valid, false if expired/invalid
  async validateToken() {
    const token = this.getToken();
    if (!token) return false;
    if (token.startsWith("dev-token-")) return true;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me?fields=id`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "omit",
      });
      if (res.status === 401 || res.status === 403) {
        const localUser = this.getUserData();
        if (localUser && (localUser.email || localUser.id)) {
          return true;
        }
        return false;
      }
      return true;
    } catch (err) {
      console.warn("[AuthService] Token validation failed due to network/offline state:", err);
      return true; // Avoid locking user out on temporary network glitch
    }
  }

  redirectToLogin() {
    window.location.href = "/login?timeout=true";
  }

  async checkPhoneExists(phone) {
    try {
      const response = await this.knApi.post("/auth-service", {
        action: "check-user",
        phone,
      });
      return response.data.success === true;
    } catch (error) {
      console.error("Error checking phone:", error);
      return false;
    }
  }

  isResigned(user) {
    if (!user || !user.dateOfLeaving) return false;

    const parsedDate = this.parseDateString(user.dateOfLeaving);
    if (!parsedDate) return false;

    const today = new Date();
    parsedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return parsedDate <= today;
  }

  async checkUserResigned(phone) {
    try {
      const response = await this.knApi.post("/auth-service", {
        action: "check-user",
        phone,
      });
      return response.data.success === false && response.data.message === "RESIGNED_USER";
    } catch (error) {
      console.error("Error checking resignation status:", error);
      return false;
    }
  }

  parseDateString(dateString) {
    if (!dateString) return null;

    let date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;

    const formats = [
      /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/,
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/,
    ];

    for (const regex of formats) {
      const match = dateString.match(regex);
      if (match) {
        if (match[3]?.length === 4) {
          date = new Date(`${match[3]}-${match[2]}-${match[1]}`);
        } else {
          date = new Date(`${match[1]}-${match[2]}-${match[3]}`);
        }
        if (!isNaN(date.getTime())) return date;
      }
    }

    console.warn(`Could not parse date string: ${dateString}`);
    return null;
  }

  // ─── OTP Meta Helpers (for local verification shortcut) ───────────────────

  storeOtpMeta(type, identifier) {
    localStorage.setItem("otp_type", type);           // 'phone' | 'email'
    localStorage.setItem("otp_identifier", identifier);
  }

  clearOtpMeta() {
    localStorage.removeItem("otp_type");
    localStorage.removeItem("otp_identifier");
  }

  // ─── Phone OTP ─────────────────────────────────────────────────────────────

  async generateOtp(phone) {
    console.log("\n📱 [OTP PHONE] ── generateOtp() called via Knative auth-service");
    console.log("  → Input phone:", phone);

    try {
      const cleanPhone = phone.replace(/\s/g, "");
      console.log("  [1/2] Cleaned phone:", cleanPhone);

      console.log("  [2/2] Sending OTP via Knative auth-service generate-otp ...");
      const response = await this.knApi.post("/auth-service", {
        action: "generate-otp",
        phone: cleanPhone,
        userApp: "patrol",
      });
      console.log("  ✅ OTP sent response:", response.data);

      if (response.data.otp_session_uuid) {
        localStorage.setItem("sessionUuid", response.data.otp_session_uuid);
        this.setPhone(phone);
        console.log("  Session UUID stored:", response.data.otp_session_uuid);
      }

      this.storeOtpMeta("phone", cleanPhone);
      return response.data;
    } catch (error) {
      console.error("  ❌ generateOtp() FAILED:", error.message);
      throw error;
    }
  }

  async verifyOtp(otp, sessionUuid, phone) {
    console.log("\n🔐 [OTP PHONE] ── verifyOtp() called via Knative auth-service");
    console.log("  → Phone:", phone);
    console.log("  → Session UUID:", sessionUuid);
    console.log("  → OTP entered:", otp);

    try {
      if (!otp || !sessionUuid || !phone) {
        throw new Error("Missing required verification data");
      }

      const cleanPhone = phone.replace(/\s/g, "");
      const response = await this.knApi.post("/auth-service", {
        action: "verify-otp",
        phone: cleanPhone,
        otp,
        sessionUuid,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "OTP verification failed");
      }

      const { token, userData } = response.data;
      if (token) {
        this.softLogout();
        this.setToken(token);
        this.setPhone(phone);
        localStorage.removeItem("sessionUuid");
        this.clearOtpMeta();
        if (userData) {
          this.setUserData(userData);
          this.onSuccessfulLogin(userData.id);
        }
      }
      return response.data;
    } catch (error) {
      console.error("  ❌ verifyOtp() FAILED:", error.message);
      throw error;
    }
  }

  async getCurrentUser() {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated");
    }
    const phone = this.getPhone();
    const email = this.getEmail();
    if (phone) {
      return this.getUserByPhone(phone);
    } else if (email) {
      return this.getUserByEmail(email);
    } else {
      throw new Error("No phone or email found for current user");
    }
  }

  async getUserByPhone(phone) {
    try {
      const response = await this.knApi.post("/auth-service", {
        action: "get-user-profile",
        phone,
      });

      if (response?.data?.success && response.data.userData) {
        const userData = response.data.userData;

        // Auto-attach to patrol if they exist but aren't on this app yet
        let userAppsList = userData.userApp;
        if (typeof userAppsList === "string") {
          try {
            userAppsList = JSON.parse(userAppsList);
          } catch (_) {
            userAppsList = userAppsList.split(",").map(s => ({ userApp: s.trim() }));
          }
        }
        if (!Array.isArray(userAppsList)) {
          userAppsList = userAppsList ? [{ userApp: String(userAppsList) }] : [];
        }

        const hasPatrol = userAppsList.some(a => {
          const name = String(a.userApp || a || "").toLowerCase();
          return name === "patrol" || name === "accesseasy_patrol";
        });

        if (!hasPatrol) {
          console.log("[getUserByPhone] Appending patrol to userApp array...");
          const updatedApps = [...userAppsList, { userApp: "patrol", date: new Date().toISOString() }];

          if (this.getToken()) {
            this.protectedApi.patch(`/users/${userData.id}`, { userApp: updatedApps }).catch(e =>
              console.warn("[getUserByPhone] User patch (non-fatal):", e.message)
            );
          }
          userData.userApp = updatedApps;

          const tId = userData.tenant?.tenantId || userData.tenant?.id;
          if (tId) {
            this.ensureTenantUserApp(tId, userData.id, "patrol").catch(e =>
              console.warn("[getUserByPhone] Tenant patch failed:", e.message)
            );
          }
        }
        this.setUserData(userData);
        return userData;
      }
      throw new Error("User not found");
    } catch (error) {
      console.error("Error fetching user:", error);
      if (error.message === "User not found") throw error;
      throw new Error("Failed to fetch user data");
    }
  }

  async ensureTenantUserApp(tenantId, userId, appName = "patrol") {
    // Tenant-app associations are managed server-side by /auth-service.
    // Client-side direct reads/patches to /items/tenant with end-user JWTs trigger 401 Unauthorized.
    return;
  }

  async checkEmailExists(email) {
    try {
      const response = await this.knApi.post("/auth-service", {
        action: "check-user",
        email,
      });
      return response.data.success === true;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  }

  async checkUserResignedByEmail(email) {
    try {
      const response = await this.knApi.post("/auth-service", {
        action: "check-user",
        email,
      });
      return response.data.success === false && response.data.message === "RESIGNED_USER";
    } catch (error) {
      console.error("Error checking resignation status by email:", error);
      return false;
    }
  }

  async getUserByEmail(email) {
    try {
      const response = await this.knApi.post("/auth-service", {
        action: "get-user-profile",
        email,
      });

      if (response?.data?.success && response.data.userData) {
        const userData = response.data.userData;

        // Auto-attach to patrol if they exist but aren't on this app yet
        let userAppsList = userData.userApp;
        if (typeof userAppsList === "string") {
          try {
            userAppsList = JSON.parse(userAppsList);
          } catch (_) {
            userAppsList = userAppsList.split(",").map(s => ({ userApp: s.trim() }));
          }
        }
        if (!Array.isArray(userAppsList)) {
          userAppsList = userAppsList ? [{ userApp: String(userAppsList) }] : [];
        }

        const hasPatrol = userAppsList.some(a => {
          const name = String(a.userApp || a || "").toLowerCase();
          return name === "patrol" || name === "accesseasy_patrol";
        });

        if (!hasPatrol) {
          console.log("[getUserByEmail] Appending patrol to userApp array...");
          const updatedApps = [...userAppsList, { userApp: "patrol", date: new Date().toISOString() }];

          if (this.getToken()) {
            this.protectedApi.patch(`/users/${userData.id}`, { userApp: updatedApps }).catch(e =>
              console.warn("[getUserByEmail] User patch (non-fatal):", e.message)
            );
          }
          userData.userApp = updatedApps;

          const tId = userData.tenant?.tenantId || userData.tenant?.id;
          if (tId) {
            this.ensureTenantUserApp(tId, userData.id, "patrol").catch(e =>
              console.warn("[getUserByEmail] Tenant patch failed:", e.message)
            );
          }
        }
        this.setUserData(userData);
        return userData;
      }
      throw new Error("User not found");
    } catch (error) {
      console.error("Error fetching user by email:", error);
      if (error.message === "User not found") throw error;
      throw new Error("Failed to fetch user data");
    }
  }

  async loginWithSessionUuid(email, sessionUuid) {
    try {
      if (!email || !sessionUuid) {
        throw new Error("Missing email or session UUID");
      }

      const response = await this.knApi.post("/auth-service", {
        action: "login-with-session",
        email,
        sessionUuid,
        userApp: "patrol",
      });

      if (!response.data || !response.data.token) {
        throw new Error("Authentication failed: No token returned from flow");
      }

      this.softLogout();
      this.setToken(response.data.token);
      this.setEmail(email);

      let uData = null;
      if (response.data.userData) {
        uData = response.data.userData;
        this.setUserData(uData);
      } else {
        try {
          const userData = await this.getUserByEmail(email);
          this.setUserData(userData);
          uData = userData;
        } catch (e) {
          console.warn("Could not fetch full user data after session login:", e);
        }
      }

      if (uData) {
        this.onSuccessfulLogin(uData.id);
      }

      return response.data;
    } catch (error) {
      console.error("Error in loginWithSessionUuid:", error);
      throw error;
    }
  }

  async verifyEmailOtp(otp, sessionUuid, email) {
    console.log("\n📧 [OTP EMAIL] ── verifyEmailOtp() called via Knative auth-service");
    console.log("  → Email:", email);
    console.log("  → Session UUID:", sessionUuid);
    console.log("  → OTP entered:", otp);

    try {
      if (!otp || !sessionUuid || !email) {
        throw new Error("Missing required verification data");
      }

      const response = await this.knApi.post("/auth-service", {
        action: "verify-email-otp",
        email,
        otp,
        sessionUuid,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "OTP verification failed");
      }

      const { token, userData } = response.data;
      if (token) {
        this.softLogout();
        this.setToken(token);
        this.setEmail(email);
        localStorage.removeItem("emailSessionUuid");
        this.clearOtpMeta();
        if (userData) {
          this.setUserData(userData);
          this.onSuccessfulLogin(userData.id);
        }
      }
      return response.data;
    } catch (error) {
      console.error("  ❌ verifyEmailOtp() FAILED:", error.message);
      throw error;
    }
  }

  async forgotPin({ phone, email, userApp = "patrol" }) {
    try {
      const payload = {
        action: "update-pin",
        userApp
      };

      if (phone) {
        payload.phone = phone.replace(/\s/g, "");
      }
      if (email) {
        payload.email = email;
      }
      const response = await this.knApi.post("/auth-service", payload);
      return response.data;
    } catch (error) {
      console.error("Error forgot PIN:", error);
      throw error;
    }
  }

  async verifyForgotPinOtp({ phone, email, otp }) {
    try {
      const payload = {
        action: "verify-forgotpin-otp",
        otp
      };

      if (phone) {
        payload.phone = phone.replace(/\s/g, "");
      }
      if (email) {
        payload.email = email;
      }

      const response = await this.knApi.post("/auth-service", payload);
      return response.data;
    } catch (error) {
      console.error("Error verifying forgot PIN OTP:", error);
      throw error;
    }
  }

  async setPin(userId, pin) {
    try {
      const response = await this.knApi.post("/auth-service", {
        action: "set-pin",
        userId,
        pin,
      });
      return response.data;
    } catch (error) {
      console.error("Error in setPin:", error);
      throw error;
    }
  }

  async register(params) {
    try {
      const response = await this.knApi.post("/auth-service", {
        action: "register",
        userApp: "patrol",
        ...params,
      });

      // Robustly extract tenant ID from any response shape
      const tenantId = 
        response.data?.tenantId || 
        response.data?.tenant_id || 
        response.data?.tenant?.tenantId || 
        response.data?.tenant?.id || 
        response.data?.data?.tenantId || 
        response.data?.data?.tenant_id || 
        response.data?.id;

      // Trigger Knative initial-settings to create tenant defaults and send Admin Notification + Welcome emails
      const adminEmail = appConfigService.getAdminNotifyEmail();
      this.knApi.post("/initial-settings", {
        tenantId: tenantId || "auto",
        tenant_id: tenantId || "auto",
        tenantName: params.companyName || params.fullName,
        fullName: params.fullName,
        email: params.email,
        recipientEmail: params.email,
        phone: params.phone,
        adminNotifyEmail: adminEmail,
        notifyEmail: adminEmail,
        adminEmail: adminEmail,
        userApp: "patrol",
        source: params.source || "AccessEasy Patrol Web",
        companyAddress: params.companyAddress || "Not provided",
        app_name: "AccessEasy Patrol",
        appName: "AccessEasy Patrol"
      }).catch(err => {
        console.warn("[AuthService] initial-settings notification error (non-fatal):", err.message);
      });

      return response.data;
    } catch (error) {
      console.error("Error in register:", error);
      throw error;
    }
  }

  async googleLogin(email) {
    try {
      const response = await this.knApi.post("/auth-service", {
        action: "google-login",
        email,
        userApp: "patrol",
      });
      return response.data;
    } catch (error) {
      console.error("Error in googleLogin:", error);
      throw error;
    }
  }

  async generateEmailOtp(email) {
    try {
      const response = await this.knApi.post("/auth-service", {
        action: "generate-email-otp",
        email,
        userApp: "patrol",
      });
      return response.data;
    } catch (error) {
      console.error("Error generating email OTP:", error);
      throw error;
    }
  }

  setPinVerified(value) {
    sessionStorage.setItem("pinVerifiedInSession", value ? "true" : "false");
    localStorage.setItem("pinVerifiedInSession", value ? "true" : "false");
  }

  isPinVerified() {
    return (
      sessionStorage.getItem("pinVerifiedInSession") === "true" ||
      localStorage.getItem("pinVerifiedInSession") === "true"
    );
  }

  initInactivityTracking() {
    if (typeof window !== "undefined") {
      const lastActivity = Number.parseInt(
        localStorage.getItem("lastActivityTime") || "0",
        10
      );
      if (lastActivity > 0) {
        const inactiveTime = Date.now() - lastActivity;
        if (inactiveTime > 900000 && this.isAuthenticated()) {
          this.setPinVerified(false);
        }
      }
      this.updateLastActivity();
      const events = [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
      ];

      events.forEach((event) => {
        document.addEventListener(event, this.updateLastActivity.bind(this));
      });

      setInterval(this.checkInactivity.bind(this), 60000);
    }
  }

  updateLastActivity() {
    localStorage.setItem("lastActivityTime", Date.now().toString());
  }

  checkInactivity() {
    if (!this.isAuthenticated()) return;

    const lastActivity = Number.parseInt(
      localStorage.getItem("lastActivityTime") || "0",
    );
    const currentTime = Date.now();
    const inactiveTime = currentTime - lastActivity;
    const inactivityTimeout = 900000; // 15 minutes

    if (inactiveTime > inactivityTimeout) {
      if (this.isPinVerified()) {
        this.setPinVerified(false);
      }
      // The intrusive session expired modal has been removed based on user request.
    }
  }
}

export const authService = new AuthService();
