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
      timeout: 30000,
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

  redirectToLogin() {
    window.location.href = "/login?timeout=true";
  }

  async checkPhoneExists(phone) {
    try {
      const response = await this.api.get("/users", {
        params: {
          "filter[_and][0][phone][_contains]": phone,
          "filter[_and][1][userApp][_eq]": "accesseasy",
        },
      });
      return response.data.data.length > 0;
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
      // Robust search: Use last 10 digits
      const digits = phone.replace(/\D/g, "");
      const searchPhone = digits.length >= 10 ? digits.slice(-10) : digits;

      const response = await this.api.get("/users", {
        params: {
          "filter[_and][0][phone][_contains]": searchPhone,
          "filter[_and][1][userApp][_eq]": "accesseasy",
          "fields[]": ["dateOfLeaving"],
        },
      });

      if (response.data.data && response.data.data.length > 0) {
        return this.isResigned(response.data.data[0]);
      }
      return false;
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
    console.log("\n📱 [OTP PHONE] ── generateOtp() called");
    console.log("  → Input phone:", phone);

    try {
      console.log("  [1/4] Checking if user is resigned...");
      const isResigned = await this.checkUserResigned(phone);
      if (isResigned) {
        console.warn("  ❌ User is resigned. Blocking OTP.");
        throw new Error("RESIGNED_USER");
      }
      console.log("  ✅ User is active (not resigned).");

      // Sanitize phone for API (remove spaces, keep +)
      const cleanPhone = phone.replace(/\s/g, "");
      console.log("  [2/4] Cleaned phone:", cleanPhone);

      console.log("  [3/4] Sending OTP via Knative /send-otp-accesseasy ...");
      const response = await this.knApi.post("/send-otp-accesseasy", {
        phone: cleanPhone,
        userApp: "accesseasy",
      });
      console.log("  ✅ OTP sent. Response:", response.data);

      if (response.data.otp_session_uuid) {
        localStorage.setItem("sessionUuid", response.data.otp_session_uuid);
        this.setPhone(phone);
        console.log("  [4/4] Session UUID stored:", response.data.otp_session_uuid);
      } else {
        console.warn("  ⚠️ No otp_session_uuid returned from server.");
      }

      this.storeOtpMeta("phone", cleanPhone);
      console.log("  → OTP meta stored for local verification shortcut.");

      return response.data;
    } catch (error) {
      console.error("  ❌ generateOtp() FAILED:", error.message);
      throw error;
    }
  }

  async verifyOtp(otp, sessionUuid, phone) {
    console.log("\n🔐 [OTP PHONE] ── verifyOtp() called");
    console.log("  → Phone:", phone);
    console.log("  → Session UUID:", sessionUuid);
    console.log("  → OTP entered:", otp);

    try {
      if (!otp || !sessionUuid || !phone) {
        console.error("  ❌ Missing required fields:", { otp: !!otp, sessionUuid: !!sessionUuid, phone: !!phone });
        throw new Error("Missing required verification data");
      }

      // ── STEP 1: Always fetch user from DB first ──
      console.log("  [1] Fetching user record from DB...");
      const digits = phone.replace(/\D/g, "");
      const searchPhone = digits.length >= 10 ? digits.slice(-10) : digits;
      console.log("  → Search phone (last 10 digits):", searchPhone);

      const userRes = await this.api.get("/users", {
        params: {
          "filter[_and][0][phone][_contains]": searchPhone,
          "filter[_and][1][userApp][_eq]": "accesseasy",
          "fields[]": ["id", "token", "otp", "usertoken", "tenant.tenantId", "tenant.tenantName", "role.name", "phone", "first_name", "last_name", "email", "userPin", "dateOfLeaving", "title", "description"],
        },
      });

      const userData = userRes?.data?.data?.[0];
      if (!userData) {
        console.error("  ❌ No user record found in DB for phone:", searchPhone);
        throw new Error("User not found");
      }
      console.log("  ✅ User found:", userData.first_name, userData.last_name, "| User ID:", userData.id);

      // ── STEP 2: Verify OTP locally against DB stored OTP ──
      console.log("  [2] OTP Comparison:");
      const storedOtp = String(userData.otp ?? "").trim();
      const enteredOtp = String(otp).trim();
      console.log("       → Stored OTP (from DB):", storedOtp || "(empty)");
      console.log("       → Entered OTP (by user):", enteredOtp);

      if (!storedOtp) {
        console.error("  ❌ DB has no OTP for this user. Ask user to re-send OTP.");
        throw new Error("No OTP stored for this user. Please re-send OTP.");
      }
      if (storedOtp !== enteredOtp) {
        console.warn("  ❌ OTP mismatch! Entered:", enteredOtp, "| Stored:", storedOtp);
        throw new Error("OTP is wrong, please enter correct OTP");
      }
      console.log("  ✅ OTP MATCHED!");

      // ── STEP 3: Check if user already has a usertoken in DB ──
      const dbToken = userData.usertoken;
      console.log("  [3] User's usertoken in DB:", dbToken ? `✅ FOUND (${String(dbToken).slice(0, 12)}...)` : "❌ NOT FOUND");

      if (dbToken) {
        console.log("  → 🔄 DB TOKEN PATH: usertoken found — using it directly (trigger SKIPPED).");
        this.setToken(dbToken);
        this.setPhone(phone);
        this.setUserData(userData);
        localStorage.removeItem("sessionUuid");
        this.clearOtpMeta();
        console.log("  🎉 PHONE OTP COMPLETE — token set from DB usertoken.");
        return { success: true, token: dbToken, fromDb: true };
      }

      // ── STEP 4: No DB token → call Knative verify-otp → flow trigger ──
      console.log("  → ▶️  TRIGGER PATH: No token in DB — calling Knative /verify-otp-accesseasy ...");
      const cleanPhoneForVerify = phone.replace(/\s/g, "");
      const verifyResponse = await this.knApi.post("/verify-otp-accesseasy", {
        phone: cleanPhoneForVerify,
        otp,
        otp_session_uuid: sessionUuid,
      });
      console.log("  Knative /verify-otp-accesseasy response:", verifyResponse.data);

      if (!verifyResponse.data.success) {
        console.error("  ❌ Knative OTP verification failed:", verifyResponse.data.message);
        throw new Error(verifyResponse.data.message || "OTP verification failed");
      }
      console.log("  ✅ Knative OTP verified successfully.");

      const cleanPhone = phone.replace(/\D/g, "").replace(/^91/, "");
      const formattedPhone = "0" + cleanPhone;
      console.log("  [4] Calling flow trigger. Formatted phone:", formattedPhone);

      const tokenResponse = await this.api.get(
        `/flows/trigger/542de075-7445-49a5-bd18-c8d8b92b3440?otp=${otp}&session_uuid=${sessionUuid}&phone_number=${formattedPhone}`,
      );
      console.log("  Flow trigger response:", tokenResponse.data);

      if (tokenResponse.data.token) {
        console.log("  ✅ New token received from trigger. Storing.");
        this.setToken(tokenResponse.data.token);
        this.setPhone(phone);
        localStorage.removeItem("sessionUuid");
        this.clearOtpMeta();
        this.setUserData(userData);
      } else {
        console.warn("  ⚠️ No token in flow trigger response.");
      }

      console.log("  🎉 PHONE OTP COMPLETE (via Knative + trigger).");
      return tokenResponse.data;
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
      // Robust search: Use last 10 digits to match database records
      const digits = phone.replace(/\D/g, "");
      const searchPhone = digits.length >= 10 ? digits.slice(-10) : digits;

      const response = await this.api.get("/users", {
        params: {
          "filter[_and][0][phone][_contains]": searchPhone,
          "filter[_and][1][userApp][_eq]": "accesseasy",
          "fields[]": [
            "id",
            "tenant.tenantId",
            "tenant.tenantName",
            "role.name",
            "phone",
            "first_name",
            "last_name",
            "email",
            "userPin",
            "dateOfLeaving",
            "title",
            "description"
          ],
        },
      });

      if (response?.data?.data && response.data.data.length > 0) {
        const userData = response.data.data[0];
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

  async checkEmailExists(email) {
    try {
      const response = await this.api.get("/users", {
        params: {
          "filter[_and][0][email][_eq]": email,
          "filter[_and][1][userApp][_eq]": "accesseasy",
        },
      });
      return response.data.data.length > 0;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  }

  async checkUserResignedByEmail(email) {
    try {
      const response = await this.api.get("/users", {
        params: {
          "filter[_and][0][email][_eq]": email,
          "filter[_and][1][userApp][_eq]": "accesseasy",
          "fields[]": ["dateOfLeaving"],
        },
      });

      if (response.data.data && response.data.data.length > 0) {
        const user = response.data.data[0];
        if (user.dateOfLeaving) {
          const parsedDate = this.parseDateString(user.dateOfLeaving);
          if (!parsedDate) return false;

          const today = new Date();
          parsedDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          return parsedDate <= today;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking resignation status by email:", error);
      return false;
    }
  }

  async getUserByEmail(email) {
    try {
      const response = await this.api.get("/users", {
        params: {
          "filter[_and][0][email][_eq]": email,
          "filter[_and][1][userApp][_eq]": "accesseasy",
          "fields[]": [
            "id",
            "tenant.tenantId",
            "tenant.tenantName",
            "role.name",
            "phone",
            "first_name",
            "last_name",
            "email",
            "userPin",
            "dateOfLeaving",
            "otp",
            "usertoken",
            "title",
            "description"
          ],
        },
      });

      if (response?.data?.data && response.data.data.length > 0) {
        const userData = response.data.data[0];
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

      const response = await this.api.get(
        `/flows/trigger/133d557a-42ac-480c-9fd9-49ced4bbf5e8?session_uuid=${sessionUuid}&email=${email}&user_app=accesseasy`
      );

      if (!response.data || !response.data.token) {
        throw new Error("Authentication failed: No token returned from flow");
      }

      this.setToken(response.data.token);
      this.setEmail(email);

      try {
        const userData = await this.getUserByEmail(email);
        this.setUserData(userData);
      } catch (e) {
        console.warn("Could not fetch full user data after session login:", e);
      }

      return response.data;
    } catch (error) {
      console.error("Error in loginWithSessionUuid:", error);
      throw error;
    }
  }

  async verifyEmailOtp(otp, sessionUuid, email) {
    console.log("\n📧 [OTP EMAIL] ── verifyEmailOtp() called");
    console.log("  → Email:", email);
    console.log("  → Session UUID:", sessionUuid);
    console.log("  → OTP entered:", otp);

    try {
      if (!otp || !sessionUuid || !email) {
        console.error("  ❌ Missing required fields:", { otp: !!otp, sessionUuid: !!sessionUuid, email: !!email });
        throw new Error("Missing required verification data");
      }

      // ── STEP 1: Fetch user from DB ──
      console.log("  [1] Fetching user record from DB for email:", email);
      const userRes = await this.api.get("/users", {
        params: {
          "filter[_and][0][email][_eq]": email,
          "filter[_and][1][userApp][_eq]": "accesseasy",
          "fields[]": ["id", "token", "otp", "usertoken", "tenant.tenantId", "tenant.tenantName", "role.name", "phone", "first_name", "last_name", "email", "userPin", "dateOfLeaving", "title", "description"],
        },
      });

      const userData = userRes?.data?.data?.[0];
      if (!userData || userData.otp === null || userData.otp === undefined) {
        console.error("  ❌ User not found or OTP not set in DB.");
        throw new Error("OTP not found for this user");
      }
      console.log("  ✅ User found:", userData?.first_name, userData?.last_name, "| Role:", userData?.role?.name);

      // ── STEP 2: Verify OTP locally ──
      const storedOtp = String(userData.otp).trim();
      const enteredOtp = String(otp).trim();
      console.log("  [2] OTP Comparison:");
      console.log("       → Stored OTP (from DB):", storedOtp);
      console.log("       → Entered OTP (by user):", enteredOtp);

      if (storedOtp !== enteredOtp) {
        console.warn("  ❌ OTP mismatch! Entered:", enteredOtp, "| Stored:", storedOtp);
        throw new Error("OTP is wrong, please enter correct OTP");
      }
      console.log("  ✅ OTP MATCHED!");

      // ── STEP 3: Check if user already has a usertoken in DB ──
      const dbToken = userData.usertoken;
      console.log("  [3] User's usertoken in DB:", dbToken ? `✅ FOUND (${String(dbToken).slice(0, 12)}...)` : "❌ NOT FOUND");

      if (dbToken) {
        console.log("  → 🔄 DB TOKEN PATH: usertoken found — using it directly (trigger SKIPPED).");
        this.setToken(dbToken);
        this.setEmail(email);
        this.setUserData(userData);
        localStorage.removeItem("emailSessionUuid");
        this.clearOtpMeta();
        console.log("  🎉 EMAIL OTP COMPLETE — token set from DB usertoken.");
        return { success: true, token: dbToken, fromDb: true, userData };
      }

      // ── STEP 4: No token in DB → call flow trigger ──
      console.log("  → ▶️  TRIGGER PATH: No token in DB — calling Directus flow trigger...");
      const response = await this.api.get(
        `/flows/trigger/133d557a-42ac-480c-9fd9-49ced4bbf5e8?otp=${otp}&session_uuid=${sessionUuid}&email=${email}&user_app=accesseasy`,
      );
      console.log("  Flow trigger response:", response.data);

      if (!response.data || !response.data.token) {
        console.error("  ❌ No token in trigger response. Auth failed.");
        throw new Error("Authentication failed");
      }

      console.log("  ✅ New token received from trigger. Storing.");
      this.setToken(response.data.token);
      this.setEmail(email);
      localStorage.removeItem("emailSessionUuid");
      this.clearOtpMeta();
      this.setUserData(userData);

      console.log("  🎉 EMAIL OTP COMPLETE (via Directus trigger).");
      return { ...response.data, userData };
    } catch (error) {
      console.error("  ❌ verifyEmailOtp() FAILED:", error.message);

      if (error.message.includes("OTP is wrong")) {
        throw new Error("OTP is wrong, please enter correct OTP");
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  }

  // 🔥 FIXED: FORGOT PIN METHODS - PRESERVE +91
  async forgotPin({ phone, email, userApp = "accesseasy" }) {
    try {
      const payload = { userApp };

      if (phone) {
        payload.phone = phone.replace(/\s/g, "");
      }
      if (email) {
        payload.email = email;
      }
      const response = await this.knApi.post("/pin", payload);
      return response.data;
    } catch (error) {
      console.error("Error forgot PIN:", error);
      throw error;
    }
  }

  async verifyForgotPinOtp({ phone, email, otp }) {
    try {
      const payload = { otp };

      if (phone) {
        payload.phone = phone.replace(/\s/g, "");
      }
      if (email) {
        payload.email = email;
      }

      const response = await this.knApi.post("/verify-forgotpin-otp", payload);
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
    const inactivityTimeout = 3600000; // 1 hour

    if (inactiveTime > inactivityTimeout) {
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
        this.redirectToLogin();
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
