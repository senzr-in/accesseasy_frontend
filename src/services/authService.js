// authService.js;
import axios from "axios";
import Cookies from "js-cookie";

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    this.knApi = axios.create({
      baseURL: import.meta.env.VITE_KN_API_URL,
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 45000,
    });

    this.protectedApi = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    // Global Error Interceptor for "Worst Case" Handling
    const handleNetworkErrors = (error) => {
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        error.message = "Unable to connect. Please check your internet.";
      }
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        error.message = "Request timed out (30s). Please try again.";
      }
      if (error.response?.status === 429) {
        error.message = "Too many requests. Please wait a moment.";
      }
      return Promise.reject(error);
    };

    [this.api, this.knApi, this.protectedApi].forEach((instance) => {
      instance.interceptors.response.use((r) => r, handleNetworkErrors);
    });

    this.protectedApi.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.protectedApi.interceptors.response.use(
      (response) => {
        this.updateLastActivity();
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          console.warn(
            "Unauthorized access. Token might be invalid or missing.",
          );
        }
        return Promise.reject(error);
      },
    );

    this.initInactivityTracking();
  }

  setToken(token) {
    Cookies.set("userToken", token, { expires: 365 * 20 });
    localStorage.setItem("userToken", token);
    this.protectedApi.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
    this.updateLastActivity();
  }

  getToken() {
    return Cookies.get("userToken") || localStorage.getItem("userToken");
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
    const tenantData = localStorage.getItem("tenantData");
    return tenantData ? JSON.parse(tenantData) : null;
  }

  getTenantName() {
    const tenantData = this.getTenantData();
    return tenantData?.tenantName || tenantData?.name || "";
  }

  getTenantId() {
    const tenantData = this.getTenantData();
    return tenantData?.tenantId || tenantData?.id || "";
  }

  // Add user-related methods
  setUserData(userData) {
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
      
      const tid = userData?.tenant?.tenantId || userData?.tenant?.id; 
      const uid = userData?.id;
      const appName = userData?.userApp || "accesseasy";
      
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
    let role = userData?.role?.name || "";
    // Dynamically identify Guard sub-role via title designation if they are standard employees
    if (role === 'Employee' && (userData?.title?.toLowerCase() === 'guard' || userData?.title?.toLowerCase() === 'security')) {
        role = 'Guard';
    }
    return role;
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

  logout() {
    Cookies.remove("userToken");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("email");
    localStorage.removeItem("sessionUuid");
    localStorage.removeItem("pinVerifiedInSession");
    localStorage.removeItem("userData");
    localStorage.removeItem("tenantData");
    delete this.protectedApi.defaults.headers.common["Authorization"];
    window.location.href = "/login";
  }

  // Clears auth state without redirecting (used by router guard before it redirects)
  softLogout() {
    Cookies.remove("userToken");
    localStorage.removeItem("userToken");
    localStorage.removeItem("pinVerifiedInSession");
    localStorage.removeItem("userData");
    localStorage.removeItem("tenantData");
    delete this.protectedApi.defaults.headers.common["Authorization"];
  }

  // Validates token against the server — returns true if valid, false if expired/invalid
  async validateToken() {
    const token = this.getToken();
    if (!token) return false;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me?fields=id`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        return false;
      }
      return true;
    } catch (err) {
      console.warn("[AuthService] Token validation failed due to network/offline state:", err);
      return true;
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
        userApp: "accesseasy",
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
        this.setToken(token);
        this.setPhone(phone);
        localStorage.removeItem("sessionUuid");
        this.clearOtpMeta();
        if (userData) {
          this.setUserData(userData);
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
        
        // Auto-attach to accesseasy if they exist but aren't on this app yet
        const currentAppStr = String(userData.userApp || "").toLowerCase();
        if (!currentAppStr.includes("accesseasy")) {
          console.log("[getUserByPhone] User found but not on accesseasy. Attaching...");
          const newAppStr = currentAppStr ? `${currentAppStr}, accesseasy` : "accesseasy";
          
          this.api.patch(`/users/${userData.id}`, { userApp: newAppStr }).catch(e => 
            console.warn("[getUserByPhone] User patch failed:", e.message)
          );
          userData.userApp = newAppStr;

          const tId = userData.tenant?.tenantId || userData.tenant?.id;
          if (tId) {
            this.ensureTenantUserApp(tId, userData.id, "accesseasy").catch(e =>
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

  async ensureTenantUserApp(tenantId, userId, appName = "accesseasy") {
    if (!tenantId || !userId) {
      console.warn("[ensureTenantUserApp] Missing tenantId or userId — skipping.");
      return;
    }

    try {
      const targetApp = "accesseasy";
      const envToken = import.meta.env.VITE_API_TOKEN;
      const getUrl = `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}&fields[]=tenantId&fields[]=userApp&limit=1`;
      
      const response = await fetch(getUrl, {
        headers: { Authorization: `Bearer ${envToken}` }
      });
      const tenantJson = await response.json();

      const tenantRecord = tenantJson.data?.[0];
      if (!tenantRecord) {
        console.warn("[ensureTenantUserApp] Tenant record not found for tenantId:", tenantId);
        return;
      }

      let appsArray = [];
      if (tenantRecord.userApp) {
        try {
          const parsed = typeof tenantRecord.userApp === "string" ? JSON.parse(tenantRecord.userApp) : tenantRecord.userApp;
          appsArray = Array.isArray(parsed) ? parsed : [];
        } catch (e) { appsArray = []; }
      }

      const alreadyExists = appsArray.some(entry => 
        String(entry.userApp || "").toLowerCase() === targetApp.toLowerCase()
      );

      if (alreadyExists) {
        return;
      }

      let empi = null;
      try {
        const pmRes = await this.api.get("/items/personalModule", {
          params: { "filter[assignedUser][_eq]": userId, "fields[]": ["id"], limit: 1 },
        });
        empi = pmRes.data?.data?.[0]?.id || null;
      } catch (e) { console.warn("[ensureTenantUserApp] PM lookup failed:", e.message); }

      const newEntry = {
        userApp: targetApp,
        date: new Date().toISOString(),
        empi: empi,
      };
      
      appsArray.push(newEntry);

      const patchRes = await fetch(`${import.meta.env.VITE_API_URL}/items/tenant/${tenantId}`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${envToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
           userApp: JSON.stringify(appsArray) 
        })
      });

      if (!patchRes.ok) {
        console.error(`[ensureTenantUserApp] Patch failed`);
      }
    } catch (error) {
      console.error("[ensureTenantUserApp] Failed to update tenant userApp:", error.message);
    }
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
        
        // Auto-attach to accesseasy if they exist but aren't on this app yet
        const currentAppStr = String(userData.userApp || "").toLowerCase();
        if (!currentAppStr.includes("accesseasy")) {
          console.log("[getUserByEmail] User found but not on accesseasy. Attaching...");
          const newAppStr = currentAppStr ? `${currentAppStr}, accesseasy` : "accesseasy";
          
          this.api.patch(`/users/${userData.id}`, { userApp: newAppStr }).catch(e => 
            console.warn("[getUserByEmail] User patch failed:", e.message)
          );
          userData.userApp = newAppStr;

          const tId = userData.tenant?.tenantId || userData.tenant?.id;
          if (tId) {
            this.ensureTenantUserApp(tId, userData.id, "accesseasy").catch(e =>
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
        userApp: "accesseasy",
      });

      if (!response.data || !response.data.token) {
        throw new Error("Authentication failed: No token returned from flow");
      }

      this.setToken(response.data.token);
      this.setEmail(email);

      if (response.data.userData) {
        this.setUserData(response.data.userData);
      } else {
        try {
          const userData = await this.getUserByEmail(email);
          this.setUserData(userData);
        } catch (e) {
          console.warn("Could not fetch full user data after session login:", e);
        }
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
        this.setToken(token);
        this.setEmail(email);
        localStorage.removeItem("emailSessionUuid");
        this.clearOtpMeta();
        if (userData) {
          this.setUserData(userData);
        }
      }
      return response.data;
    } catch (error) {
      console.error("  ❌ verifyEmailOtp() FAILED:", error.message);
      throw error;
    }
  }

  async forgotPin({ phone, email, userApp = "accesseasy" }) {
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
        ...params,
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
        userApp: "accesseasy",
      });
      return response.data;
    } catch (error) {
      console.error("Error generating email OTP:", error);
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

  setPinVerified(value) {
    localStorage.setItem("pinVerifiedInSession", value ? "true" : "false");
  }

  isPinVerified() {
    return localStorage.getItem("pinVerifiedInSession") === "true";
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

      // ── Overlay ──────────────────────────────────────────────────────────
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
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
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
      badge.textContent = "Session Expired";

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
      heading.textContent = "You've been signed out";

      // ── Message ──────────────────────────────────────────────────────────
      const message = document.createElement("p");
      Object.assign(message.style, {
        fontSize:     "14px",
        color:        "#a1a1aa",
        marginBottom: "28px",
        lineHeight:   "1.6",
        fontFamily:   "inherit",
      });
      message.textContent = "Your session expired due to inactivity. Please log in again to continue.";

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
        window.location.reload();
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
}

export const authService = new AuthService();
