<template>
  <!-- Main container for the application -->
  <div class="container">
    <!-- Header section -->
    <header class="header">
      <div class="header-content">
        <!-- Active plans display -->
        <div class="active-plans-header">
          <h2>Active Plans</h2>
          <div class="active-plan-tags">
            <span
              v-for="plan in activeTenantPlans"
              :key="plan.key"
              class="plan-tag"
              @click="showActivePlanModal = true"
              >{{ plan.name }}</span
            >
          </div>
        </div>

        <!-- Header controls including trial status, employee count, currency, billing toggle, and action buttons -->
        <div class="header-controls">
          <!-- Free trial badge and upgrade button -->
          <div v-if="isFreeTrial" class="free-trial">
            <span class="free-trial-badge">🎉 Free Trial Active</span>
            <button @click="handleUpgradeFromTrial" class="btn upgrade-btn">
              Upgrade Now
            </button>
          </div>

          <!-- Employee count adjustment controls -->
          <div class="employees-control">
            <button
              @click="adjustEmployees(-1)"
              :disabled="employees <= 1"
              class="btn employee-btn"
            >
              -
            </button>
            <div class="employee-count">
              <div class="employee-number">{{ employees }}</div>
              <div class="employee-label">employees</div>
            </div>
            <button
              @click="adjustEmployees(1)"
              :disabled="isFreeTrial && employees >= 5"
              class="btn employee-btn employee-btn-primary"
            >
              +
            </button>
            <div v-if="isFreeTrial && employees >= 5" class="trial-warning">
              Trial limit reached. Upgrade to add more employees.
            </div>
          </div>

          <!-- Currency selection dropdown -->
          <select v-model="currency" class="currency-select">
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
          </select>

          <!-- Billing cycle toggle (monthly/annual) -->
          <div class="billing-switch">
            <div
              :class="[
                'switch-tab',
                { active: !annual, disabled: isFreeTrial },
              ]"
              @click="!isFreeTrial && toggleBilling(false)"
            >
              Monthly
            </div>
            <div
              :class="['switch-tab', { active: annual, disabled: isFreeTrial }]"
              @click="!isFreeTrial && toggleBilling(true)"
            >
              Annual <span class="save-text">(Save 20%)</span>
            </div>
          </div>

          <!-- Action buttons: Start Free Trial or Proceed to Payment -->
          <div class="header-actions">
            <button
              v-if="isFreeTrial"
              @click="handleStartFreeTrial"
              class="btn start-trial-btn"
            >
              Start Free Trial
            </button>
            <button
              v-else
              @click="showPaymentModal = true"
              class="btn payment-btn"
            >
              Proceed to Payment
            </button>
            <button
              v-if="!isFreeTrial"
              @click="
                isFreeTrial = true;
                employees = 5;
              "
              class="btn try-trial-btn"
            >
              Try Free Trial Instead
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content area -->
    <div class="main-content">
      <!-- Plans selection section -->
      <div class="plans-selection">
        <h2>Select Your Plans</h2>
        <p class="plans-note">
          The Lite plan is included by default. Customize by adding advanced
          plans or the Locate add-on.
        </p>

        <!-- Plans grid -->
        <div class="plans-grid">
          <div
            v-for="plan in plansData"
            :key="plan.key"
            :class="[
              'plan-card',
              {
                selected: selectedPlans.has(plan.key),
                lite: plan.key === 'lite',
              },
            ]"
            @click="plan.key !== 'lite' && togglePlan(plan.key)"
          >
            <div class="plan-header">
              <div class="plan-info">
                <div class="plan-title-price">
                  <h3>{{ plan.name }}</h3>
                  <div class="plan-pricing">
                    <div class="price">
                      {{
                        isFreeTrial
                          ? "Free"
                          : formatPrice(
                              plan.perUser[currency][
                                annual ? "annual" : "monthly"
                              ],
                            ) + `/user/${annual ? "year" : "month"}`
                      }}
                    </div>
                    <div class="total-cost">
                      {{
                        isFreeTrial
                          ? "Trial"
                          : formatPrice(calculatePlanCost(plan)) +
                            ` ${annual ? "yearly" : "monthly"}`
                      }}
                    </div>
                    <div
                      v-if="
                        annual &&
                        !isFreeTrial &&
                        calculateAnnualSavingsPerPlan(plan) > 0
                      "
                      class="savings"
                    >
                      Save
                      {{
                        formatPrice(calculateAnnualSavingsPerPlan(plan))
                      }}/year 🎉
                    </div>
                  </div>
                </div>
                <ul class="plan-features">
                  <li v-for="feature in plan.features" :key="feature">
                    {{ feature }}
                  </li>
                  <li
                    v-for="addOn in plan.addOns"
                    :key="addOn.key"
                    class="add-on-feature"
                  >
                    <input
                      type="checkbox"
                      :value="`${plan.key}_${addOn.key}`"
                      v-model="selectedAddOns"
                      @click.stop="toggleAddOn(plan.key, addOn.key)"
                      :disabled="!selectedPlans.has(plan.key) || isFreeTrial"
                    />
                    {{ addOn.name }} (+{{
                      formatPrice(
                        addOn.perUser[currency][annual ? "annual" : "monthly"],
                      )
                    }}/user/{{ annual ? "year" : "month" }})
                    <ul>
                      <li v-for="feature in addOn.features" :key="feature">
                        {{ feature }}
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
            <div class="plan-checkbox">
              <input
                v-if="plan.key !== 'lite'"
                type="checkbox"
                v-model="selectedPlans"
                :value="plan.key"
              />
              <div v-else class="required-label">Required</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="payment-modal">
      <div class="payment-modal-content">
        <div class="modal-header">
          <h3>Complete Payment</h3>
          <button @click="showPaymentModal = false" class="modal-close-btn">
            ×
          </button>
        </div>

        <!-- Plan Summary in Modal -->
        <div class="modal-plan-summary">
          <h4>Plan Summary</h4>
          <div class="billing-info">
            <div class="label">Billing for</div>
            <div class="employees-count">
              {{ effectiveEmployees }} employees
            </div>
            <div class="billing-cycle">
              {{
                isFreeTrial
                  ? "Free Trial (14 days)"
                  : annual
                    ? "Annual billing"
                    : "Monthly billing"
              }}
            </div>
          </div>

          <div class="selected-plans-list">
            <div class="label">Selected Plans:</div>
            <div
              v-for="planKey in selectedPlans"
              :key="planKey"
              class="selected-plan-item"
            >
              <span class="selected-plan-name">{{
                plansData.find((p) => p.key === planKey).name
              }}</span>
              <span
                v-if="selectedAddOns.has(`${planKey}_locate`)"
                class="add-on-label"
              >
                + Locate
              </span>
              <span v-if="isFreeTrial" class="free-trial-badge-small"
                >Free Trial</span
              >
              <span class="selected-plan-cost">
                {{
                  isFreeTrial
                    ? "FREE"
                    : annual
                      ? formatPrice(
                          calculatePlanCost(
                            plansData.find((p) => p.key === planKey),
                          ),
                        ) + "/year"
                      : formatPrice(
                          calculatePlanCost(
                            plansData.find((p) => p.key === planKey),
                          ),
                        ) + "/month"
                }}
              </span>
            </div>
          </div>

          <div class="total-cost-section">
            <div
              v-if="annual && !isFreeTrial && totalAnnualSavings > 0"
              class="annual-savings-box"
            >
              <div class="month-vs-annual">
                <span>If paid monthly for 12 months:</span>
                <span>{{ formatPrice(totalMonthlyCostFor12Months) }}</span>
              </div>
              <div class="annual-payment">
                <span>Annual payment:</span>
                <span>{{ formatPrice(totalCost) }}</span>
              </div>
              <div class="your-savings">
                <span>Your savings:</span>
                <span>{{ formatPrice(totalAnnualSavings) }} (20% OFF) 🎉</span>
              </div>
            </div>

            <div class="total-row">
              <span class="total-label">
                {{
                  isFreeTrial
                    ? "Trial Cost:"
                    : annual
                      ? "Pay Once Yearly:"
                      : "Pay Monthly:"
                }}
              </span>
              <span class="total-amount">{{
                isFreeTrial ? "FREE" : formatPrice(totalCost)
              }}</span>
            </div>
            <div class="billing-note" v-if="!isFreeTrial">
              {{ annual ? "Billed annually, save 20%" : "Billed monthly" }}
            </div>
          </div>
        </div>

        <!-- Payment methods -->
        <div class="payment-methods">
          <div class="method-label">For Indian Companies:</div>
          <button
            @click="handlePayment('razorpay')"
            :disabled="isProcessingPayment"
            class="payment-method-btn razorpay-btn"
          >
            <div class="method-icon">₹</div>
            <div class="method-info">
              <div class="method-name">Razorpay</div>
              <div class="method-desc">UPI, Cards, Net Banking</div>
            </div>
          </button>

          <div class="method-label">International:</div>
          <button
            @click="handlePayment('stripe')"
            :disabled="isProcessingPayment"
            class="payment-method-btn stripe-btn"
          >
            <div class="method-icon">$</div>
            <div class="method-info">
              <div class="method-name">Stripe</div>
              <div class="method-desc">Cards, Apple Pay, Google Pay</div>
            </div>
          </button>
        </div>

        <!-- Payment processing indicator -->
        <div v-if="isProcessingPayment" class="processing-payment">
          <div class="spinner"></div>
          <span>Processing Payment...</span>
        </div>
      </div>
    </div>

    <!-- Active Plan Details Modal -->
    <div v-if="showActivePlanModal" class="active-plan-modal">
      <div class="active-plan-modal-content">
        <div class="modal-header">
          <h3>Active Plans Details</h3>
          <button @click="showActivePlanModal = false" class="modal-close-btn">
            ×
          </button>
        </div>
        <div class="active-plans-list">
          <div
            v-for="plan in activeTenantPlans"
            :key="plan.key"
            class="active-plan-item"
          >
            <span class="plan-name">{{ plan.name }}</span>
            <span class="plan-validity">
              Valid from: {{ activePlanStartDate }} to {{ activePlanEndDate }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";

// Mock payment APIs for simulation
const activePlanStartDate = ref("");
const activePlanEndDate = ref("");
const showActivePlanModal = ref(false);
const tenantplan = currentUserTenant.getTenantPlan();
const token = authService.getToken();
const mockPaymentAPI = {
  razorpay: (amount, currency = "INR") => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          paymentId: `rzp_${Math.random().toString(36).substr(2, 9)}`,
          amount,
          currency,
        });
      }, 2000);
    });
  },
  stripe: (amount, currency = "USD") => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          paymentId: `pi_${Math.random().toString(36).substr(2, 9)}`,
          amount,
          currency,
        });
      }, 2000);
    });
  },
};

// Plans data configuration without icons
const plansData = [
  {
    name: "Lite",
    key: "lite",
    perUser: {
      INR: { monthly: 25, annual: 20 },
      USD: { monthly: 0.29, annual: 0.24 },
    },
    features: [
      " Selfie & QR check-in",
      "Geofence check-in",
      "Leave management",
      "Expense management",
      "Daily & monthly reports",
    ],
    addOns: [
      {
        name: "Locate",
        key: "locate",
        perUser: {
          INR: { monthly: 80, annual: 64 },
          USD: { monthly: 12, annual: 10 },
        },
        features: ["Live GPS tracking"],
      },
    ],
  },
  {
    name: "PRO",
    key: "pro",
    perUser: {
      INR: { monthly: 50, annual: 40 },
      USD: { monthly: 0.59, annual: 0.47 },
    },
    features: [
      "All Lite features",
      "Face check-in with liveness",
      "Regularisation",
      "Scheduled reports",
      "Payroll integration (API)",
    ],
    addOns: [
      {
        name: "Locate",
        key: "locate",
        perUser: {
          INR: { monthly: 80, annual: 64 },
          USD: { monthly: 12, annual: 10 },
        },
        features: ["Live GPS tracking"],
      },
    ],
  },
  {
    name: "FieldPro",
    key: "fieldpro",
    perUser: {
      INR: { monthly: 150, annual: 120 },
      USD: { monthly: 1.76, annual: 14 },
    },
    features: [
      "All Lite features",
      "Work order management",
      "Client management",
      "Field job tracking",
      "Work order scheduling",
    ],
    addOns: [
      {
        name: "Smart-Forms",
        key: "forms",
        perUser: {
          INR: { monthly: 80, annual: 64 },
          USD: { monthly: 0.94, annual: 0.75 },
        },
        features: ["Smart-forms for workorder"],
      },
      {
        name: "Locate",
        key: "locate",
        perUser: {
          INR: { monthly: 80, annual: 64 },
          USD: { monthly: 12, annual: 10 },
        },
        features: ["Live GPS tracking"],
      },
    ],
  },
  {
    name: "GrowthSuite CRMENTERPRISE",
    key: "crm",
    perUser: {
      INR: { monthly: 230, annual: 184 },
      USD: { monthly: 24, annual: 20 },
    },
    features: [
      "All Lite features",
      "Smart Forms (custom)",
      "CRM Dashboard",
      "Role configurator",
      "WhatsApp reports",
      "Employee KPI Dashboard",
      "CRM integrations (Zoho, ERPNext)",
    ],
    addOns: [],
  },
];

// Reactive state variables
const selectedPlans = ref(new Set(["lite"]));
const selectedAddOns = ref(new Set());
const employees = ref(5);
const currency = ref("USD");
const annual = ref(false);
const isFreeTrial = ref(true);
const isProcessingPayment = ref(false);
const showPaymentModal = ref(false);
const activePlan = ref("");
const tenantId = currentUserTenant.getTenantId();
const activeTenantPlans = ref([]);

// Toggle billing cycle (monthly/annual)
const toggleBilling = (isAnnual) => {
  annual.value = isAnnual;
};

// Toggle plan selection
const togglePlan = (key) => {
  if (key === "lite") return;
  const newSet = new Set(selectedPlans.value);
  if (newSet.has(key)) {
    newSet.delete(key);
    selectedAddOns.value.delete(`${key}_locate`);
  } else {
    newSet.add(key);
  }
  selectedPlans.value = newSet;
};

// Toggle add-on selection
const toggleAddOn = (planKey, addOnKey) => {
  const addOnId = `${planKey}_${addOnKey}`;
  const newAddOns = new Set(selectedAddOns.value);
  if (newAddOns.has(addOnId)) {
    newAddOns.delete(addOnId);
  } else if (selectedPlans.value.has(planKey) && !isFreeTrial.value) {
    newAddOns.add(addOnId);
  }
  selectedAddOns.value = newAddOns;
};

// Adjust employee count
const adjustEmployees = (delta) => {
  const newCount = Math.max(1, employees.value + delta);
  if (isFreeTrial.value && newCount > 5) {
    alert(
      "Free trial is limited to 5 employees. Upgrade to add more employees.",
    );
    return;
  }
  employees.value = newCount;
};

// Handle upgrade from trial
const handleUpgradeFromTrial = () => {
  isFreeTrial.value = false;
  selectedAddOns.value.clear();
  if (employees.value < 20) {
    employees.value = 20;
  }
};

// Start free trial
const handleStartFreeTrial = async () => {
  selectedAddOns.value.clear();
  alert(
    "🎉 Free trial started! You have 14 days to explore all features with up to 5 employees.",
  );
  await updateTenantPlan(true);
};

// Update tenant plan
const updateTenantPlan = async (isTrial) => {
  if (!tenantId) {
    alert("Error: Tenant ID not found. Please log in again.");
    return;
  }

  if (!selectedPlans.value.size || !selectedPlans.value.has("lite")) {
    alert("Error: At least the Lite plan must be selected.");
    return;
  }

  if (!["USD", "INR"].includes(currency.value)) {
    alert("Error: Invalid currency selected.");
    return;
  }

  const today = new Date();
  let endDate = new Date(today);
  let billingCycle = isTrial ? "trial" : annual.value ? "annual" : "monthly";

  if (isTrial) {
    endDate.setDate(today.getDate() + 14);
    employees.value = Math.min(employees.value, 5);
  } else if (annual.value) {
    endDate.setFullYear(today.getFullYear() + 1);
    employees.value = Math.max(20, employees.value);
  } else {
    endDate.setMonth(today.getMonth() + 1);
    employees.value = Math.max(20, employees.value);
  }
  const planData = {
    users: effectiveEmployees.value,
    features: Array.from(selectedPlans.value).map((key) => {
      const plan = plansData.find((p) => p.key === key);
      const addOns = plan.addOns.filter((addOn) =>
        selectedAddOns.value.has(`${key}_${addOn.key}`),
      );
      return {
        key: plan.key,
        name: plan.name,
        features: [...plan.features, ...addOns.flatMap((a) => a.features)],
        value: calculatePlanCost(plan),
      };
    }),
    billing_cycle: billingCycle,
    start_date: today.toISOString().split("T")[0],
    end_date: endDate.toISOString().split("T")[0],
    currency: currency.value,
    total_value: totalCost.value,
  };

  try {
    if (!token) {
      alert("Error: Authentication token missing. Please log in again.");
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant/${tenantId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: JSON.stringify(planData) }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to update plan: ${errorData.message || response.statusText}`,
      );
    }

    const responseData = await response.json();
    if (!responseData.data || !responseData.data.plan) {
      throw new Error("Invalid response format from server.");
    }

    alert("✅ Plan updated successfully!");
    setActivePlanHeader();
    activeTenantPlans.value = planData.features;
    activePlanStartDate.value = planData.start_date;
    activePlanEndDate.value = planData.end_date;
  } catch (error) {
    console.error("Error updating tenant plan:", error);
    alert(`❌ Error updating plan: ${error.message}`);
  }
};

// Fetch tenant plan on component mount
const fetchTenantPlan = async () => {
  if (!tenantId) {
    console.warn("No tenant ID found. Skipping plan fetch.");
    return;
  }

  try {
    const plan = currentUserTenant.getTenantPlan();

    if (!plan || typeof plan !== "object" || Object.keys(plan).length === 0) {
      console.log(
        "No existing tenant plan found. Using default configuration.",
      );

      selectedPlans.value = new Set(["lite"]);
      selectedAddOns.value = new Set();
      employees.value = 5;
      annual.value = false;
      currency.value = "USD";
      isFreeTrial.value = true;
      activeTenantPlans.value = [];

      const today = new Date();
      const trialEndDate = new Date(today);
      trialEndDate.setDate(today.getDate() + 14);

      activePlanStartDate.value = today.toISOString().split("T")[0];
      activePlanEndDate.value = trialEndDate.toISOString().split("T")[0];

      return;
    }

    if (!Array.isArray(plan.features)) {
      console.warn("Plan features are not an array or are missing.");
      activeTenantPlans.value = [];
      return;
    }

    selectedPlans.value = new Set(
      plan.features.map((f) => f.key).filter((key) => key),
    );
    selectedAddOns.value = new Set();

    plan.features.forEach((feature) => {
      const planData = plansData.find((p) => p.key === feature.key);
      if (planData && planData.addOns.length > 0) {
        const hasLocate =
          feature.features && feature.features.includes("Live GPS tracking");
        if (hasLocate) {
          selectedAddOns.value.add(`${feature.key}_locate`);
        }
      }
    });

    employees.value = Number.isFinite(plan.users) ? plan.users : 5;
    annual.value = plan.billing_cycle === "annual";
    currency.value = ["USD", "INR"].includes(plan.currency)
      ? plan.currency
      : "USD";
    isFreeTrial.value = plan.billing_cycle === "trial";
    activeTenantPlans.value = plan.features.filter((f) => f.key && f.name);
    activePlanStartDate.value =
      plan.start_date || new Date().toISOString().split("T")[0];
    activePlanEndDate.value =
      plan.end_date || new Date().toISOString().split("T")[0];

    setActivePlanHeader();
  } catch (error) {
    console.error("Error processing tenant plan:", error);
    selectedPlans.value = new Set(["lite"]);
    selectedAddOns.value = new Set();
    employees.value = 5;
    isFreeTrial.value = true;
    activeTenantPlans.value = [];
    alert("Failed to load tenant plan data. Using default configuration.");
  }
};

// Set active plan header text
const setActivePlanHeader = () => {
  const planNames = activeTenantPlans.value.map((plan) => {
    const hasLocate = selectedAddOns.value.has(`${plan.key}_locate`);
    return hasLocate ? `${plan.name} + Locate` : plan.name;
  });
  activePlan.value = `Active: ${planNames.join(", ")}`;
};

// Format price based on currency
const formatPrice = (amount) =>
  currency.value === "USD" ? `$${amount.toFixed(2)}` : `₹${amount.toFixed(2)}`;

// Computed properties
const effectiveEmployees = computed(() =>
  isFreeTrial.value
    ? Math.min(5, employees.value)
    : Math.max(20, employees.value),
);

// Calculate cost for a specific plan
const calculatePlanCost = (plan) => {
  let cost = annual.value
    ? plan.perUser[currency.value]["annual"] * effectiveEmployees.value * 12
    : plan.perUser[currency.value]["monthly"] * effectiveEmployees.value;

  plan.addOns.forEach((addOn) => {
    if (selectedAddOns.value.has(`${plan.key}_${addOn.key}`)) {
      cost += annual.value
        ? addOn.perUser[currency.value]["annual"] *
          effectiveEmployees.value *
          12
        : addOn.perUser[currency.value]["monthly"] * effectiveEmployees.value;
    }
  });

  return cost;
};

// Calculate monthly cost without annual discount
const calculateMonthlyCostOnly = (plan) => {
  let cost = plan.perUser[currency.value]["monthly"] * effectiveEmployees.value;
  plan.addOns.forEach((addOn) => {
    if (selectedAddOns.value.has(`${plan.key}_${addOn.key}`)) {
      cost +=
        addOn.perUser[currency.value]["monthly"] * effectiveEmployees.value;
    }
  });
  return cost;
};

// Calculate annual savings per plan
const calculateAnnualSavingsPerPlan = (plan) => {
  const monthlyPrice = plan.perUser[currency.value]["monthly"];
  const annualPrice = plan.perUser[currency.value]["annual"];
  let monthlyCostFor12Months = monthlyPrice * 12 * effectiveEmployees.value;
  let annualCost = annualPrice * 12 * effectiveEmployees.value;

  plan.addOns.forEach((addOn) => {
    if (selectedAddOns.value.has(`${plan.key}_${addOn.key}`)) {
      monthlyCostFor12Months +=
        addOn.perUser[currency.value]["monthly"] *
        12 *
        effectiveEmployees.value;
      annualCost +=
        addOn.perUser[currency.value]["annual"] * 12 * effectiveEmployees.value;
    }
  });

  return monthlyCostFor12Months - annualCost;
};

// Total cost for all selected plans
const totalCost = computed(() =>
  isFreeTrial.value
    ? 0
    : Array.from(selectedPlans.value).reduce((sum, planKey) => {
        const plan = plansData.find((p) => p.key === planKey);
        return sum + calculatePlanCost(plan);
      }, 0),
);

// Total monthly cost extrapolated to 12 months
const totalMonthlyCostFor12Months = computed(() =>
  Array.from(selectedPlans.value).reduce((sum, planKey) => {
    const plan = plansData.find((p) => p.key === planKey);
    return sum + calculateMonthlyCostOnly(plan) * 12;
  }, 0),
);

// Total annual savings
const totalAnnualSavings = computed(() =>
  annual.value && !isFreeTrial.value
    ? totalMonthlyCostFor12Months.value - totalCost.value
    : 0,
);

// 1. Add Razorpay script to your index.html or load it dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// 2. Update your handlePayment function
const handlePayment = async (paymentMethod) => {
  if (paymentMethod !== "razorpay") {
    alert("Only Razorpay is implemented. Stripe coming soon!");
    return;
  }

  isProcessingPayment.value = true;

  try {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error("Failed to load Razorpay SDK");
    }

    // Prepare plan data
    const planData = {
      users: effectiveEmployees.value,
      features: Array.from(selectedPlans.value).map((key) => {
        const plan = plansData.find((p) => p.key === key);
        const addOns = plan.addOns.filter((addOn) =>
          selectedAddOns.value.has(`${key}_${addOn.key}`),
        );
        return {
          key: plan.key,
          name: plan.name,
          features: [...plan.features, ...addOns.flatMap((a) => a.features)],
          value: calculatePlanCost(plan),
        };
      }),
      billing_cycle: isFreeTrial.value
        ? "trial"
        : annual.value
          ? "annual"
          : "monthly",
      start_date: new Date().toISOString().split("T")[0],
      end_date: calculateEndDate(),
      currency: currency.value,
      total_value: totalCost.value,
    };

    // Step 1: Create order on backend
    const orderResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/payment/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: totalCost.value,
          currency: currency.value,
          tenantId: tenantId,
          planDetails: planData,
        }),
      },
    );

    const orderData = await orderResponse.json();

    if (!orderData.success) {
      throw new Error(orderData.message || "Failed to create order");
    }

    // Step 2: Open Razorpay checkout
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Samaya Access",
      description: `Plan: ${planData.features.map((f) => f.name).join(", ")}`,
      order_id: orderData.order_id,
      handler: async function (response) {
        // Step 3: Verify payment on backend
        try {
          const verifyResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/payment/verify-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                payment_record_id: orderData.payment_record_id,
              }),
            },
          );

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            showPaymentModal.value = false;
            isProcessingPayment.value = false;
            alert(
              `✅ Payment successful! Payment ID: ${response.razorpay_payment_id}`,
            );

            // Refresh tenant plan data
            await fetchTenantPlan();
          } else {
            throw new Error(
              verifyData.message || "Payment verification failed",
            );
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          alert(`❌ Payment verification failed: ${error.message}`);
        }
      },
      prefill: {
        name: currentUserTenant.getTenantName() || "",
        email: authService.getUserEmail() || "",
        contact: "",
      },
      theme: {
        color: "#007bff",
      },
      modal: {
        ondismiss: async function () {
          // Handle payment cancellation
          isProcessingPayment.value = false;

          await fetch(
            `${import.meta.env.VITE_API_URL}/payment/handle-failure`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                payment_record_id: orderData.payment_record_id,
                error_description: "Payment cancelled by user",
              }),
            },
          );

          alert("Payment cancelled");
        },
      },
    };

    const rzp = new window.Razorpay(options);

    // Handle payment failures
    rzp.on("payment.failed", async function (response) {
      console.error("Payment failed:", response.error);

      await fetch(`${import.meta.env.VITE_API_URL}/payment/handle-failure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_record_id: orderData.payment_record_id,
          error_description: response.error.description,
        }),
      });

      isProcessingPayment.value = false;
      alert(`❌ Payment failed: ${response.error.description}`);
    });

    // Open Razorpay modal
    rzp.open();
  } catch (error) {
    console.error("Payment error:", error);
    isProcessingPayment.value = false;
    alert(`❌ Payment failed: ${error.message}`);
  }
};

// Helper function to calculate end date
const calculateEndDate = () => {
  const today = new Date();
  let endDate = new Date(today);

  if (isFreeTrial.value) {
    endDate.setDate(today.getDate() + 14);
  } else if (annual.value) {
    endDate.setFullYear(today.getFullYear() + 1);
  } else {
    endDate.setMonth(today.getMonth() + 1);
  }

  return endDate.toISOString().split("T")[0];
};

// Initialize component
onMounted(async () => {
  await fetchTenantPlan();
  console.log(tenantId);
});
</script>

<style>
/* Minimal styles for a clean UI */

/* Container */

/* Add-on feature styling */
.add-on-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}
.add-on-feature input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
  transition: all 0.2s ease;
}
.add-on-feature input[type="checkbox"]:checked {
  background-color: #007bff;
  border-color: #007bff;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
}
.add-on-feature input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.add-on-label {
  font-size: 12px;
  color: #28a745;
  font-weight: 600;
  margin-left: 8px;
}

/* Header styling */
.header {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 12px 24px;
  flex-shrink: 0;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
}
.active-plans-header {
  display: flex;
  gap: 16px;
  align-items: center;
}
.active-plans-header h2 {
  margin: 0;
  font-weight: 600;
  font-size: 18px;
  color: #333;
}
.active-plan-tags {
  display: flex;
  gap: 8px;
}
.plan-tag {
  background-color: #f8f9fa;
  color: #666;
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  user-select: none;
}
.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}
.free-trial {
  display: flex;
  align-items: center;
  gap: 8px;
}
.free-trial-badge {
  background-color: #e9ffe9;
  color: #28a745;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 4px;
  user-select: none;
}
.upgrade-btn {
  background-color: #007bff;
  color: white;
  font-size: 13px;
  border: none;
  padding: 4px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.upgrade-btn:hover {
  background-color: #0056b3;
}
.employees-control {
  display: flex;
  align-items: center;
  position: relative;
}
.employee-btn {
  padding: 6px 10px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.employee-btn:hover:not(:disabled) {
  background-color: #e9ecef;
}
.employee-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.employee-btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}
.employee-btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}
.employee-count {
  text-align: center;
  margin: 0 8px;
}
.employee-number {
  font-size: 22px;
  font-weight: 700;
  color: #007bff;
}
.employee-label {
  font-size: 10px;
  color: #666;
}
.trial-warning {
  font-size: 10px;
  color: #ffc107;
  margin-top: 4px;
  user-select: none;
}
.currency-select {
  border: 1px solid #ddd;
  padding: 6px 10px;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
}
.billing-switch {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 2px;
}
.switch-tab {
  padding: 6px 16px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.switch-tab.active {
  background-color: #007bff;
  color: white;
}
.switch-tab:not(.active):hover {
  background-color: #e9ecef;
}
.switch-tab:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.save-text {
  font-weight: 500;
  font-size: 12px;
  margin-left: 4px;
}
.header-actions {
  display: flex;
  gap: 12px;
}
.start-trial-btn,
.payment-btn,
.try-trial-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}
.start-trial-btn {
  background-color: #28a745;
  color: white;
}
.start-trial-btn:hover {
  background-color: #218838;
}
.payment-btn {
  background-color: #007bff;
  color: white;
}
.payment-btn:hover {
  background-color: #0056b3;
}
.try-trial-btn {
  background-color: white;
  border: 1px solid #28a745;
  color: #28a745;
}
.try-trial-btn:hover {
  background-color: #e9ffe9;
}

/* Plans selection */
.plans-selection {
  flex: 1;
  background: white;
  padding: 24px;
  overflow-y: auto;
  max-height: 80vh;
}
.plans-selection h2 {
  font-weight: 600;
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}
.plans-note {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}
.plans-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.plan-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  background-color: white;
  transition: border-color 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.plan-card:hover {
  border-color: #007bff;
}
.plan-card.selected {
  border-color: #007bff;
  background-color: #f8f9fa;
}
.plan-card.lite {
  cursor: default;
}
.plan-header {
  display: flex;
  gap: 16px;
  flex: 1;
}
.plan-icon {
  font-size: 30px;
  line-height: 1;
}
.plan-info {
  flex: 1;
}
.plan-title-price {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.plan-title-price h3 {
  margin: 0;
  font-weight: 600;
  font-size: 18px;
  color: #333;
}
.plan-pricing {
  text-align: right;
  min-width: 120px;
}
.price {
  color: #007bff;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 2px;
}
.total-cost {
  font-weight: 700;
  color: #333;
  font-size: 16px;
  margin-bottom: 6px;
}
.savings {
  font-size: 13px;
  color: #28a745;
  font-weight: 600;
}
.plan-features {
  list-style-type: disc;
  padding-left: 20px;
  font-size: 14px;
  color: #666;
}
.plan-checkbox {
  margin-left: 16px;
  margin-top: 8px;
}
.plan-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
  transition: all 0.2s ease;
}
.plan-checkbox input[type="checkbox"]:checked {
  background-color: #007bff;
  border-color: #007bff;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
}
.plan-checkbox input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.required-label {
  font-size: 14px;
  color: #999;
  user-select: none;
}

/* Payment Modal */
.payment-modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.payment-modal-content {
  background-color: white;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
  padding: 24px;
  position: relative;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.modal-close-btn {
  font-size: 28px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}
.modal-close-btn:hover {
  color: #666;
}
.modal-plan-summary {
  margin-bottom: 24px;
}
.modal-plan-summary h4 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}
.billing-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  font-size: 14px;
  color: #666;
}
.employees-count {
  font-size: 22px;
  color: #333;
  font-weight: 600;
  margin: 4px 0;
}
.selected-plans-list {
  margin-bottom: 24px;
}
.selected-plans-list .label {
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  font-size: 14px;
}
.selected-plan-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #333;
  justify-content: space-between;
}
.selected-plan-icon {
  font-size: 20px;
}
.selected-plan-name {
  flex: 1;
}
.free-trial-badge-small {
  background-color: #e9ffe9;
  color: #28a745;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 6px;
  user-select: none;
}
.selected-plan-cost {
  font-weight: 600;
  color: #007bff;
}
.total-cost-section {
  border-top: 1px solid #eee;
  padding-top: 16px;
}
.annual-savings-box {
  background-color: #e9ffe9;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #28a745;
  font-weight: 600;
  font-size: 14px;
}
.month-vs-annual,
.annual-payment,
.your-savings {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.total-row {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 20px;
  color: #007bff;
  align-items: center;
}
.total-label {
  font-weight: 600;
  color: #333;
}
.billing-note {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 6px;
}
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.method-label {
  font-weight: 600;
  color: #666;
  font-size: 16px;
  margin-bottom: 8px;
}
.payment-method-btn {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: background-color 0.2s;
  background-color: white;
}
.payment-method-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
}
.payment-method-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.razorpay-btn {
  border-color: #007bff;
}
.stripe-btn {
  border-color: #6f42c1;
}
.method-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  font-weight: 700;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.razorpay-btn .method-icon {
  background-color: #007bff;
}
.stripe-btn .method-icon {
  background-color: #6f42c1;
}
.method-info {
  display: flex;
  flex-direction: column;
}
.method-name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}
.method-desc {
  font-size: 12px;
  color: #999;
}
.processing-payment {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  color: #007bff;
  font-size: 16px;
  font-weight: 600;
}
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #007bff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
