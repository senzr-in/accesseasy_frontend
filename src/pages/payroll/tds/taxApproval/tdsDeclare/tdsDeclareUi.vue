<template>
  <v-app>
    <v-main>
      <v-container v-if="!selectedComponent"
        fluid
        class="pa-6"
        style="
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
          max-height: 100vh;
          overflow-y: auto;
        "
      >
        <v-row>
          <v-col v-for="card in exemptions" :key="card.key" cols="12" lg="6">
            <v-card
              :elevation="2"
              class="mb-4"
              :style="`border-top: 4px solid ${card.borderColor};`"
            >
              <v-card-title
                class="d-flex align-center justify-space-between pa-4"
                :style="`background-color: ${card.bgColor};`"
              >
                <div class="d-flex align-center">
                  <v-avatar
                    size="40"
                    color="white"
                    class="mr-3"
                    style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)"
                  >
                    <v-icon :color="card.iconColor">{{ card.icon }}</v-icon>
                  </v-avatar>
                  <span class="text-h6 font-weight-medium text-grey-darken-2">{{
                    card.title
                  }}</span>
                </div>
                <v-btn icon variant="text" @click="openEditDialog(card.key)" size="small">
                  <v-icon color="grey">mdi-pencil</v-icon>
                </v-btn>
              </v-card-title>

              <v-card-text class="pa-0">
                <v-table density="comfortable">
                  <thead>
                    <tr style="background-color: #f8f9fa">
                      <th
                        class="text-left font-weight-medium text-grey-darken-1 pa-4"
                      >
                        Description
                      </th>
                      <th
                        class="text-center font-weight-medium text-grey-darken-1 pa-4"
                      >
                        Declared Amount
                      </th>
                      <th
                        class="text-center font-weight-medium text-grey-darken-1 pa-4"
                      >
                        Approved Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, index) in card.rows"
                      :key="index"
                      class="hover-row"
                    >
                      <td class="pa-4 font-weight-medium">{{ row.label }}</td>
                      <td class="text-center pa-4">
                        <v-chip
                          size="small"
                          
                          text-color="grey-darken-2"
                          >{{ row.declared }}</v-chip
                        >
                      </td>
                      <td class="text-center pa-4">
                        <v-chip
                          size="small"
                          
                          text-color="grey-darken-2"
                          >{{ row.approved }}</v-chip
                        >
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        
        <v-row>
          <v-col cols="12">
            <v-card elevation="2" style="border-top: 4px solid #8b5cf6">
              <v-card-title
                class="d-flex align-center justify-space-between pa-4"
                style="background-color: #f5f3ff"
              >
                <div class="d-flex align-center">
                  <v-avatar
                    size="40"
                    color="white"
                    class="mr-3"
                    style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)"
                  >
                    <v-icon color="purple">mdi-file-document</v-icon>
                  </v-avatar>
                  <span class="text-h6 font-weight-medium text-grey-darken-2">
                    Section 80 Deductions (investments, education loans, medical
                    insurance etc.)
                  </span>
                </div>
                <v-btn icon variant="text" size="small">
                  <v-icon color="grey">mdi-pencil</v-icon>
                </v-btn>
              </v-card-title>

              <v-card-text class="pa-0">
                <v-table density="comfortable">
                  <thead>
                    <tr style="background-color: #f8f9fa">
                      <th
                        class="text-left font-weight-medium text-grey-darken-1 pa-4"
                      >
                        Section
                      </th>
                      <th
                        class="text-center font-weight-medium text-grey-darken-1 pa-4"
                      >
                        Declared Amount
                      </th>
                      <th
                        class="text-center font-weight-medium text-grey-darken-1 pa-4"
                      >
                        Approved Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="section in section80Data"
                      :key="section.name"
                      class="hover-row"
                    >
                      <td class="pa-4 font-weight-medium">
                        {{ section.name }}
                      </td>
                      <td class="text-center pa-4">
                        <v-chip
                          size="small"
                          
                          text-color="grey-darken-2"
                          >{{ section.declared }}</v-chip
                        >
                      </td>
                      <td class="text-center pa-4">
                        <v-chip
                          size="small"
                          
                          text-color="grey-darken-2"
                          >{{ section.approved }}</v-chip
                        >
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
      <component v-if="selectedComponent" :is="selectedComponent" />
    </v-main>
  </v-app>
</template>

<script setup>

import { ref, onMounted } from "vue";
import { authService } from "@/services/authService";
import { useRoute, useRouter } from "vue-router";
import hra from '@/pages/payroll/tds/taxApproval/tdsDeclare/hraAdd.vue'
import homeLoan from '@/pages/payroll/tds/taxApproval/tdsDeclare/homeLoan.vue'
import leaveTravel from '@/pages/payroll/tds/taxApproval/tdsDeclare/leaveTravel.vue'
import deduction from '@/pages/payroll/tds/taxApproval/tdsDeclare/deduction.vue'
import pastTds from '@/pages/payroll/tds/taxApproval/tdsDeclare/pastTds.vue'

const route = useRoute();

const router = useRouter();

const id = route.params.id;

const tdsRules = ref([]);
const exemptions = ref([]);
const section80Data = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedComponent = ref(null)
const tdsDeduction = ref({});


const fetchTdsRules = async () => {
  loading.value = true;
  error.value = null;

  try {
    const token = authService.getToken();

    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/tdsRules`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    tdsRules.value = data.data?.[0];
    
    await fetchTdsDeduction ();
    console.log('tdsDeduction', tdsDeduction.value)
    processingData(tdsRules.value, tdsDeduction.value);
    
  } catch (err) {
    error.value = err.message || "Failed to fetch TDS rules";
  } finally {
    loading.value = false;
  }
};
const processingData = (tdsRules, tdsDeduction) => {
  const sections = tdsRules?.section || [];
  section80Data.value = sections.map((item) => ({
    name: item.label,
    declared: tdsDeduction.section80Deduction?.[item.section]?.totalDeclaredAmount ?? 0,
    approved: tdsDeduction.section80Deduction?.[item.section]?.totalApprovedAmount ?? 0,
  }));
   exemptions.value = [
    {
      key: "PAST_TDS",
      title: "Past TDS in FY",
      icon: "mdi-calendar",
      iconColor: "amber",
      borderColor: "#facc15",
      bgColor: "#fefce8",
      rows: [
        {
          label: "Taxable Salary",
          declared: `₹${tdsDeduction?.pastTds?.taxableSalary ?? 0}`,
          approved: null,
        },
        {
          label: "Tax Paid",
          declared: `₹${tdsDeduction?.pastTds?.taxPaid ?? 0}`,
          approved: null,
        },
      ],
    },
    {
      key: "HRA",
      title: "Home Rent",
      icon: "mdi-home",
      iconColor: "orange",
      borderColor: "#f97316",
      bgColor: "#fef7f0",
      rows: [
        {
          label: "Total Home Rent",
          declared: `₹${tdsDeduction?.hraRent?.totalDeclaredAmount ?? 0}`,
          approved: `₹${tdsDeduction?.hraRent?.totalApprovedAmount ?? 0}`,
        },
        {
          label: "Latest Monthly Rent",
          declared: `₹${tdsDeduction?.hraRent?.latestMonthlyRentDeclared ?? 0}`,
          approved: `₹${tdsDeduction?.hraRent?.latestMonthlyRentApproved ?? 0}`,
        },
      ],
    },
    {
      key: "HOME_LOAN",
      title: "Interest On Home Loan",
      icon: "mdi-home",
      iconColor: "orange",
      borderColor: "#f97316",
      bgColor: "#fef7f0",
      rows: [
        {
          label: "Annual interest payable",
          declared: `₹${tdsDeduction?.homeLoan?.totalDeclaredAmount ?? 0}`,
          approved: `₹${tdsDeduction?.homeLoan?.totalApprovedAmount ?? 0}`,
        },
        {
          label: "Additional benefit under Section 80EE",
          declared: `₹${tdsDeduction?.homeLoanDeduction?.totalDeclaredAmount ?? 0}`,
          approved: `₹${tdsDeduction?.homeLoanDeduction?.totalApprovedAmount?.["80EE"] ?? 0}`,
        },
        {
          label: "Section 80EEA",
          declared: `₹${tdsDeduction?.homeLoanDeduction?.totalDeclaredAmount ?? 0}`,
          approved: `₹${tdsDeduction?.homeLoanDeduction?.totalApprovedAmount?.["80EEA"] ?? 0}`,
        },
      ],
    },
    {
      key: "LTA",
      title: "Leave Travel Allowance",
      icon: "mdi-airplane",
      iconColor: "blue",
      borderColor: "#3b82f6",
      bgColor: "#eff6ff",
      rows: [
        {
          label: "LTA Amount",
          declared: `₹${tdsDeduction?.leaveTravel?.totalDeclaredAmount ?? 0}`,
          approved: `₹${tdsDeduction?.leaveTravel?.totalApprovedAmount ?? 0}`,
        },
      ],
    },
  ];
};


const openEditDialog = (key) => {
  const componentMap = {
    HRA: hra,
    HOME_LOAN: homeLoan,
    LEAVE_TRAVEL: leaveTravel,
    SECTION_80: deduction,
    PAST_TDS: pastTds,
  }

  selectedComponent.value = componentMap[key] || null
}
const fetchTdsDeduction = async () => {
  loading.value = true;
  error.value = null;

  try {
    const token = authService.getToken();

    const params = {
      fields: [
        "hraRent",
        "homeLoan",
        "homeLoanInvestment",
        "homeLoanDeduction",
        "section80Deduction",
        "leaveTravel",
        "pastTds",
      ],
    };

    const queryString = params.fields.map(field => `fields[]=${field}`).join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    tdsDeduction.value = data.data;

     return tdsDeduction.value
  } catch (err) {
    error.value = err.message || "Failed to fetch TDS deduction";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTdsRules();
});


</script>

<style scoped>
.hover-row:hover {
  background-color: #f8f9fa !important;
  transition: background-color 0.2s ease;
}

.v-table > .v-table__wrapper > table > tbody > tr:not(:last-child) > td {
  border-bottom: 1px solid #e5e7eb;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}
</style>
