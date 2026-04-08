<template>
  <div class="employee-container">
    <div
      v-if="!showForm"
      class="main-content"
      :class="{ 'with-filter': showFilters }"
    >
      <v-data-table
        v-model="selected"
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="-1"
        class="elevation-1 employee-table"
        height="calc(90vh - 190px)"
        fixed-header
        show-select
        item-value="id"
        @click:row="(event, { item }) => handleRowClick(item)"
      >
        <template v-slot:item.attendanceVerification="{ item }">
          <v-icon :color="item.attendanceVerified ? 'success' : 'error'" small>
            {{
              item.attendanceVerified ? "mdi-check-circle" : "mdi-alert-circle"
            }}
          </v-icon>
          {{ item.attendanceVerified ? "Verified" : "Unverified" }}
        </template>
        <template v-slot:item.salaryVerification="{ item }">
          <v-icon :color="item.salaryVerified ? 'success' : 'error'" small>
            {{ item.salaryVerified ? "mdi-check-circle" : "mdi-alert-circle" }}
          </v-icon>
          {{ item.salaryVerified ? "Verified" : "Unverified" }}
        </template>

        <template v-slot:item.ctc="{ item }">
          {{ item.ctc || "-" }}
        </template>
        <template v-slot:item.payableDays="{ item }">
          {{ item.payableDays || "-" }}
        </template>
        <template v-slot:item.payableCTC="{ item }">
          {{ item.payableCTC || "-" }}
        </template>

        <!-- search and filter -->
        <template v-slot:top>
          <div class="d-flex align-center py-2 px-4">
            <v-text-field
              v-model="search"
              label="Search Employee"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              class="search-field"
              hide-details
              @input="debouncedSearch"
            ></v-text-field>
            <v-spacer></v-spacer>
            <div class="position-relative">
              <v-chip
  class="me-4 mb-2"
  color="primary"
  variant="outlined"
  prepend-icon="mdi-calendar-range"
>
  FY: {{ startDate }} to {{ endDate }}
</v-chip>
              <v-btn color="primary" @click="toggleFilters">
                <v-icon start>mdi-filter</v-icon>
                Filters
              </v-btn>

              <span v-if="hasActiveFilters" class="filter-indicator"></span>
            </div>
          </div>
        </template>
      </v-data-table>

      <!-- pagination -->
      <CustomPagination
        v-model:page="page"
        v-model:itemsPerPage="itemsPerPage"
        :total-items="totalItems"
        :is-searching="!!search"
        @update:page="handlePageChange"
        @update:itemsPerPage="handleItemsPerPageChange"
      />
    </div>
    <!-- <v-dialog 
    v-if="matchedPhase === 'reconcile'" 
    v-model="dialog" 
    max-width="480" 
    persistent
    transition="dialog-transition"
  >
    <v-card class="pa-0" elevation="12" rounded="lg">
      
      <v-card-title class="d-flex justify-space-between align-center pa-6 pb-4 bg-grey-lighten-5">
        <div class="d-flex align-center">
          <v-icon color="primary" size="24" class="mr-3">mdi-calculator-variant</v-icon>
          <span class="text-h6 font-weight-bold text-grey-darken-3">Confirm Declared Amount</span>
        </div>
        <v-btn 
          icon 
          size="small" 
          variant="text" 
          @click="dialog = false" 
          aria-label="Close dialog"
          class="hover-close-btn"
        >
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

  

      
      <v-card-text class="pa-6">
        
        <v-alert
          type="info"
          variant="tonal"
          class="mb-4"
         
          density="comfortable"
        >
          <template v-slot:prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          <div class="text-body-2">
            <strong>Please confirm if the declared amount is correct or needs to be changed.</strong><br>
            
          </div>
        </v-alert>

      </v-card-text>

      
      <v-card-actions class="pa-6 pt-4">
        <v-spacer></v-spacer>
        
        <v-btn 
          variant="flat" 
          color="primary" 
          class="text-none px-6 font-weight-medium"
          @click="confirmAmount"
          prepend-icon="mdi-check"
          elevation="2"
        >
          Ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog> -->

    <transition name="slide">
      <div v-if="showFilters" class="filter-panel">
        <div class="filter-header">
          <div class="d-flex align-center justify-space-between px-4">
            <h3 class="text-h6 font-weight-medium">Advanced Filters</h3>
            <v-btn icon @click="toggleFilters">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <div class="filter-content">
          <v-select
            v-model="filters.financialYear"
            :items="financialYearOptions"
            label="Financial Year"
            variant="outlined"
            class="mb-4"
            @update:model-value="handleFilterChange"
          />
          <v-select
            v-model="filters.branch"
            :items="branchOptions"
            label="Branch"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mb-4"
            @update:model-value="handleFilterChange"
            persistent-placeholder
          >
            <template v-slot:selection="{ item }">
              {{ item.title }}
            </template>
          </v-select>

          <v-select
            v-model="filters.department"
            :items="departmentOptions"
            label="Department"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mb-4"
            @update:model-value="handleFilterChange"
            persistent-placeholder
          >
            <template v-slot:selection="{ item }">
              {{ item.title }}
            </template>
          </v-select>

          <div class="filter-actions">
            <v-btn color="error" variant="text" @click="clearFilters">
              Clear
            </v-btn>
            <v-btn color="primary" @click="applyFilters" class="ms-2">
              Apply
            </v-btn>
          </div>
        </div>
      </div>
    </transition>

    <router-view v-if="showForm" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { authService } from "@/services/authService";
import { useRouter } from "vue-router";
import { tdsRules, fetchTDSRules } from "@/services/tds/tdsRule";

const router = useRouter();

const loading = ref(false);
const search = ref("");
const showFilters = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const selected = ref([]);

const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const userRole = currentUserTenant.getRole();
const userId = currentUserTenant.getUserId();
const showForm = ref(false);

// Filter options
const filters = reactive({
  action: [],
  mode: [],
  dateFrom: "",
  dateTo: "",
  financialYear: "",
});
let startDate, endDate;
const currentYear = new Date().getFullYear();
const financialYearOptions = Array.from({ length: 10 }, (_, i) => {
  const startYear = currentYear - i;
  return `${startYear}-${startYear + 1}`;
});

const actionOptions = ["in", "out"];
const modeOptions = ["face", "card", "manual"];

const items = ref([]);

const headers = [
  { title: "Employee Name", key: "assignedUser.first_name" },
  { title: "Role", key: "assignedUser.role.name" },

  { title: "Earnings", key: "totalEarnings" },
  { title: "Regime", key: "regime" },
  { title: "Exemption", key: "exemption" },
  { title: "Standard Deduction", key: "standardDeduction" },
  { title: "Deduction", key: "totalDeductions" },
  { title: "Taxable Income", key: "taxableIncome" },
  { title: "Tax Charge", key: "taxCharge" },
  // { title: "Status", key: "tdsDeduction.status" },
];

const dialog = ref(true);

const changeAmount = () => {
  dialog.value = false;
};

const confirmAmount = () => {
  dialog.value = false;
};

const handleRowClick = (item) => {
  if (!item.id || item.id === 0) {
    console.warn("❌ Invalid TDS Deduction ID. Navigation blocked.");
    showError.value = true;
    errorMessage.value =
      "TDS Deduction data is not finalized for this employee.";
    return;
  }

  showForm.value = true;
  router.push(`/payroll/tds/approval/${item.id}/tds-summary`);
};

const getToken = () => {
  return localStorage.getItem("userToken");
};

const aggregateCount = async (tabStatus) => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const params = {
      "aggregate[count]": "id",
      ...filterParams(tabStatus),
    };
    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!countResponse.ok) {
      throw new Error(`HTTP error! status: ${countResponse.status}`);
    }
    const countData = await countResponse.json();
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
  }
};
const tdsData = ref([]);
const matchedPhase = ref("");
const fetchtds = async () => {
  await aggregateCount();

  if (!token) {
    showError.value = true;
    errorMessage.value = "Authentication required. Please login again.";
    return;
  }

  loading.value = true;
  try {
    const params = {
      fields: [
        "tdsDeduction.regime",
        "tdsDeduction.status",
        "tdsDeduction.taxableIncome",
        "assignedUser.first_name",
        "assignedUser.role.name",
        "tdsDeduction.exemption",
        "tdsDeduction.taxLiabilties",
        "tdsDeduction.standardDeduction",
        "tdsDeduction.totalEarnings",
        "tdsDeduction.totalDeductions",
        "tdsDeduction.status",
        "assignedUser.id",
        "employeeId",
        "id",
      ],
      ...filterParams(),
      sort: "-date_created",
      limit: itemsPerPage.value,
      page: page.value,
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    items.value = data.data;
    const employeeIds = items.value.map((item) => item.id).filter(Boolean);

    if (employeeIds.length > 0) {
      tdsData.value = await fetchTdsDeductionByEmployees(employeeIds);

      items.value = items.value
        .map((item) => {
          const matchingTdsData = tdsData.value.find(
            (tdsItem) => tdsItem.employer?.id === item.id
          );

          const mergedItem = {
            assignedUser: {
              first_name: item.assignedUser.first_name,
              role: item.assignedUser.role,
            },
            totalEarnings: matchingTdsData?.totalEarnings || "Not Finalized",
            totalDeductions: matchingTdsData?.totalDeductions || 0,
            taxableIncome: matchingTdsData?.taxableIncome || 0,
            exemption: matchingTdsData?.exemption || 0,
            taxCharge: matchingTdsData?.paidTax || 0,
            standardDeduction: matchingTdsData?.standardDeduction || 0,
            regime: matchingTdsData?.regime || 0,
            status: matchingTdsData?.status || 0,
            id: matchingTdsData?.id || 0,
            hasData: !!matchingTdsData, // ➕ Used for sorting
          };

          return mergedItem;
        })
        .sort((a, b) => Number(b.hasData) - Number(a.hasData)); // ➕ Sort users with data first
    }

    if (!tdsRules.value || !tdsRules.value.length) {
      console.warn("TDS rules not loaded yet.");
      return;
    }

    const { declaration, reconcile, proofVerification } = tdsRules.value[0].duration;
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

    if (String(declaration).padStart(2, "0") === currentMonth) {
      matchedPhase.value = "declaration";
    } else if (String(reconcile).padStart(2, "0") === currentMonth) {
      matchedPhase.value = "reconcile";
    } else if (String(proofVerification).split("-").includes(currentMonth)) {
      matchedPhase.value = "proofVerification";
    }

    console.log("Matched Phase:", matchedPhase.value);
  } catch (error) {
    console.error("Error fetching logs:", error);
    showError.value = true;
    errorMessage.value =
      error.message || "Failed to fetch logs. Please try again.";
  } finally {
    loading.value = false;
  }
};

const fetchTdsDeductionByEmployees = async (employeeIds = []) => {
  const currentYear = new Date().getFullYear();
 

if (filters.financialYear) {
  const [startY, endY] = filters.financialYear.split("-");
  startDate = `${startY}-04-01`;
  endDate = `${endY}-03-31`;
} else {
  const currentYear = new Date().getMonth() >= 3 ? new Date().getFullYear() : new Date().getFullYear() - 1;
  startDate = `${currentYear}-04-01`;
  endDate = `${currentYear + 1}-03-31`;
}


  const BATCH_SIZE = 100;
  let allResults = [];

  for (let i = 0; i < employeeIds.length; i += BATCH_SIZE) {
    const batch = employeeIds.slice(i, i + BATCH_SIZE);

    const params = {
      fields: [
        "regime",
        "status",
        "taxableIncome",
        "assignedUser.first_name",
        "assignedUser.role.name",
        "exemption",
        "taxLiabilties",
        "standardDeduction",
        "totalEarnings",
        "totalDeductions",
        "startDate",
        "endDate",
        "employer.id",
        "paidTax",
        "id",
      ],
      "filter[_and][0][_and][3][employer][id][_in]": batch.join(","),
      "filter[_and][1][startDate][_gte]": startDate,
      "filter[_and][2][endDate][_lte]": endDate,
      sort: "-date_created",
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tdsDeduction?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        console.error("Failed to fetch TDS deductions for the batch");
        continue;
      }

      const data = await response.json();
      allResults.push(...(data.data || []));
    } catch (error) {
      console.error("Error fetching TDS deductions:", error);
    }
  }

  return allResults;
};

const handleFilterChange = async() => {
  await fetchtds ()
}
const filterParams = () => {
  const params = {};

  if (userRole === "Admin") {
    params["filter[assignedUser][tenant][tenantId][_eq]"] = tenantId;
  } else {
    params["filter[assignedUser][id][_eq]"] = userId;
  }

  if (search.value) {
    params["filter[assignedUser][first_name][_icontains]"] = search.value;
  }
  if (filters.action.length) {
    params["filter[action][_eq]"] = filters.action;
  }
  if (filters.mode.length) {
    params["filter[mode][_eq]"] = filters.mode;
  }
  if (filters.dateFrom.length) {
    params["filter[_and][0][_and][1][date][_between][0]"] = filters.dateFrom;
  }
  if (filters.dateTo.length) {
    params["filter[_and][0][_and][1][date][_between][1]"] = filters.dateTo;
  }
  return params;
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchtds(newPage);
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;

  fetchtds(newItemsPerPage);
};
const getStatusCount = (status) => {
  if (!hasActiveFilters.value && selectedStatus.value === "all") {
    return 0;
  }
};

const hasActiveFilters = computed(() => {
  return (
    filters.action.length > 0 ||
    filters.mode.length > 0 ||
    filters.dateFrom.length > 0 ||
    filters.dateTo.length > 0
  );
});
// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = Array.isArray(filters[key]) ? [] : "";
  });
};

const applyFilters = () => {
  showFilters.value = false;
};

watch(
  [search, filters],
  async () => {
    await fetchtds();
  },
  { deep: true },
);

onMounted(async () => {
  await fetchtds();
});
</script>

<style scoped>
@import "@/assets/styles/tabledesign.css";
.hover-close-btn:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transform: scale(1.1);
  transition: all 0.2s ease;
}

.v-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
}

.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
}

.dialog-transition-enter-active,
.dialog-transition-leave-active {
  transition: all 0.3s ease;
}

.dialog-transition-enter-from,
.dialog-transition-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
