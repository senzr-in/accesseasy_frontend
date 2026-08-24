/**
 * paymentService.js
 * Payment & Subscription Service interfacing with Knative `payment-procedure` microservice.
 *
 * Scoped to userApp: 'patrol' (and backward-compatible with 'accesseasy')
 */

import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

const PAYMENT_PROCEDURE_BASE =
  import.meta.env.VITE_KN_API_URL
    ? `${import.meta.env.VITE_KN_API_URL}/payment-procedure`
    : "https://appv1.fieldseasy.com/kn/payment-procedure";

class PaymentService {
  constructor() {
    this.targetApp = "patrol";
    this.knEndpoint = "/payment-procedure";
  }

  /**
   * Load Razorpay Checkout SDK dynamically if not already on the window
   */
  async loadRazorpaySDK() {
    if (typeof window !== "undefined" && window.Razorpay) {
      return true;
    }
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error("[PaymentService] Failed to load Razorpay SDK");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Helper to make HTTP POST requests with fallbacks
   */
  async _post(path, data) {
    const token =
      authService.getToken() ||
      localStorage.getItem("directus_access_token") ||
      "";

    // Primary attempt: via authService.knApi
    try {
      const response = await authService.knApi.post(`${this.knEndpoint}${path}`, data);
      if (response.data) {
        return response.data;
      }
    } catch (apiErr) {
      console.warn(`[PaymentService] knApi call to ${path} had issue, trying direct fetch:`, apiErr.message);
    }

    // Fallback attempt: via direct fetch to payment procedure
    const url = `${PAYMENT_PROCEDURE_BASE}${path}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resJson = await res.json();
    if (!res.ok && resJson.success === false) {
      throw new Error(resJson.message || `Request to ${path} failed (${res.status})`);
    }
    return resJson;
  }

  /**
   * Create an order via Knative payment-procedure
   * @param {Object} params
   * @param {number} params.amount - Total amount in selected currency
   * @param {string} params.currency - 'INR' | 'USD'
   * @param {number} params.sitesCount - Number of sites
   * @param {string} params.billingCycle - 'monthly' | 'annual'
   * @param {Object} [params.planDetails] - Additional plan configuration
   */
  async createOrder({
    amount,
    currency = "INR",
    sitesCount = 1,
    billingCycle = "monthly",
    planDetails = {},
  }) {
    const tenantId = currentUserTenant.getTenantId() || authService.getTenantId();
    if (!tenantId) {
      throw new Error("Tenant ID not found. Please log in again.");
    }

    const payload = {
      action: "create-order",
      userapp: this.targetApp,
      userApp: this.targetApp,
      tenantId,
      amount,
      currency,
      sitesCount,
      billingCycle,
      planDetails: {
        plan_key: "ez_patrol_platform",
        plan_name: "AccessEasy Patrol Platform",
        sites: sitesCount,
        price_per_site: currency === "USD" ? (billingCycle === "annual" ? 19 : 24) : (billingCycle === "annual" ? 1599 : 1999),
        base_price_inr: currency === "INR" ? 1999 * sitesCount : 0,
        total_charge_inr: currency === "INR" ? amount : 0,
        billing_cycle: billingCycle,
        currency,
        userapp: this.targetApp,
        ...planDetails,
      },
    };

    try {
      const data = await this._post("/create-order", payload);
      if (data && data.success !== false) {
        return data;
      }
      throw new Error(data?.message || "Failed to create payment order");
    } catch (error) {
      console.error("[PaymentService] createOrder error:", error);
      throw error;
    }
  }

  /**
   * Verify completed payment on backend
   * @param {Object} params
   */
  async verifyPayment({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    paymentRecordId,
    sitesCount = 1,
    billingCycle = "monthly",
    amount,
    currency = "INR",
  }) {
    const tenantId = currentUserTenant.getTenantId() || authService.getTenantId();

    const payload = {
      action: "verify-payment",
      userapp: this.targetApp,
      userApp: this.targetApp,
      tenantId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      payment_record_id: paymentRecordId,
      sites_count: sitesCount,
      sitesCount,
      billing_cycle: billingCycle,
      amount,
      currency,
    };

    try {
      const data = await this._post("/verify-payment", payload);
      if (data && data.success !== false) {
        return data;
      }
      throw new Error(data?.message || "Payment verification failed");
    } catch (error) {
      console.error("[PaymentService] verifyPayment error:", error);
      throw error;
    }
  }

  /**
   * Start 7-Day Free Trial via Knative payment-procedure
   * @param {Object} params
   */
  async startFreeTrial({ sitesCount = 1, days = 7 } = {}) {
    const tenantId = currentUserTenant.getTenantId() || authService.getTenantId();
    if (!tenantId) {
      throw new Error("Tenant ID not found. Please log in again.");
    }

    const payload = {
      action: "start-trial",
      userapp: this.targetApp,
      userApp: this.targetApp,
      tenantId,
      plan_key: "ez_patrol_platform",
      plan_name: "AccessEasy Patrol 7-Day Free Trial",
      sitesCount: 1,
      days,
    };

    try {
      const data = await this._post("/start-trial", payload);
      return data;
    } catch (error) {
      console.warn("[PaymentService] start-trial endpoint warning, fallback direct tenant patch:", error.message);
      // Fallback Directus update if offline/dev mode
      const token = authService.getToken();
      const today = new Date();
      const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

      const planData = {
        plan_key: "ez_patrol_platform",
        plan_name: "AccessEasy Patrol 7-Day Free Trial",
        status: "active",
        is_trial: true,
        sites: 1,
        billing_cycle: "trial",
        start_date: today.toISOString().split("T")[0],
        active_until: endDate.toISOString(),
        currency: "INR",
        total_value: 0,
        features: ["All Patrol Platform Features Included"],
      };

      try {
        await authService.protectedApi.post("/items/plans", {
          tenant: tenantId,
          name: "AccessEasy Patrol 7-Day Free Trial",
          tier: "trial",
          billing_period: "trial",
          price: 0,
          currency: "INR",
          max_sites: 1,
          max_checkpoints: 25,
          max_patrols_per_day: 50,
          currentplan: planData,
          date_created: new Date().toISOString()
        });
      } catch (_) {}

      return { success: true, plan: planData };
    }
  }

  /**
   * Report payment failure / cancellation
   * @param {Object} params
   */
  async handlePaymentFailure({ paymentRecordId, errorDescription }) {
    if (!paymentRecordId) return;
    try {
      const tenantId = currentUserTenant.getTenantId() || authService.getTenantId();
      await this._post("/mark-failed", {
        action: "mark-failed",
        userapp: this.targetApp,
        userApp: this.targetApp,
        tenantId,
        payment_record_id: paymentRecordId,
        reason: errorDescription || "User closed checkout modal",
      });
    } catch (error) {
      console.warn("[PaymentService] Failed to report payment failure:", error.message);
    }
  }
}

export const paymentService = new PaymentService();
