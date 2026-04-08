<template>
  <div class="min-h-screen">
    <v-container fluid class="pa-8">
      <div class="mb-8">
        <div class="d-flex align-center ga-3 mb-2">
          <v-icon color="blue-darken-2" size="32">mdi-cog</v-icon>
          <h2>Financial Year ({{ fy }})</h2>
        </div>
      </div>

      <v-form @submit.prevent="handleSubmit">
        <div class="form-sections">
          <v-row class="mb-8">
            <!-- <v-col cols="6" lg="3">
              <v-card class="pa-6 bg-grey-lighten-5" variant="outlined">
                <div class="d-flex align-center ga-3 mb-4">
                  <div class="accent-bar bg-blue-darken-2"></div>
                  <h2 class="text-h6 font-weight-medium text-grey-darken-3">
                    Financial Year Selection
                  </h2>
                </div>
                <div class="form-field">
                 <v-select
  v-model="formData.financialYear"
  :items="financialYearOptions"
  item-title="title"
  item-value="value"
  label="Select Financial Year"
  variant="outlined"
  density="comfortable"
  class="custom-select"
/>

                </div>
              </v-card>
            </v-col> -->

            <!-- Declaration Section -->
            <v-col cols="6" lg="4">
              <v-card
                class="pa-6 bg-grey-lighten-5"
                variant="outlined"
                :disabled="!editMode"
              >
                <div class="d-flex align-center ga-3 mb-4">
                  <div class="accent-bar bg-blue-darken-2"></div>
                  <h2 class="text-h6 font-weight-medium text-grey-darken-3">
                    Declaration Period
                  </h2>
                </div>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.declarationStart"
                      type="date"
                      label="Start Date"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-calendar"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.declarationEnd"
                      type="date"
                      label="End Date"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-calendar"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>

            <v-col cols="6" lg="4">
              <v-card
                class="pa-6 bg-grey-lighten-5"
                variant="outlined"
                :disabled="!editMode"
              >
                <div class="d-flex align-center ga-3 mb-4">
                  <div class="accent-bar bg-green-darken-2"></div>
                  <h2 class="text-h6 font-weight-medium text-grey-darken-3">
                    Reconcile Period
                  </h2>
                </div>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.reconcileStart"
                      type="date"
                      label="Start Date"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-calendar"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.reconcileEnd"
                      type="date"
                      label="End Date"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-calendar"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mb-8">
            <!-- Document Upload Section -->
            <v-col cols="6" lg="4">
              <v-card
                class="pa-6 bg-grey-lighten-5"
                variant="outlined"
                :disabled="!editMode"
              >
                <div class="d-flex align-center ga-3 mb-4">
                  <div class="accent-bar bg-orange-darken-2"></div>
                  <h2 class="text-h6 font-weight-medium text-grey-darken-3">
                    Document Upload Closure Date
                  </h2>
                </div>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.uploadStart"
                      type="date"
                      label="Start Date"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-calendar"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.uploadEnd"
                      type="date"
                      label="End Date"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-calendar"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

          <div class="d-flex flex-column flex-sm-row ga-4">
            <template v-if="editMode">
              <v-btn type="submit" color="black" size="large" class="px-8">
                <v-icon start>mdi-file-document</v-icon>
                Save
              </v-btn>

              <v-btn
                color="grey-darken-1"
                size="large"
                class="px-8"
                @click="cancelEdit"
              >
                <v-icon start>mdi-cancel</v-icon>
                Cancel
              </v-btn>
            </template>
            <template v-else>
              <v-btn
                color="black"
                size="large"
                class="px-8"
                @click="editMode = true"
              >
                <v-icon start>mdi-pencil</v-icon>
                Edit
              </v-btn>
            </template>
          </div>
        </div>
      </v-form>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const id = ref(null);
const originalData = ref({});
const editMode = ref(false);

// Form data
const formData = ref({
  financialYear: "",
  declarationStart: "",
  declarationEnd: "",
  reconcileStart: "",
  reconcileEnd: "",
  uploadStart: "",
  uploadEnd: "",
});

const currentYear = new Date().getFullYear();

// const financialYearOptions = Array.from({ length: 3 }, (_, i) => {
//   const start = currentYear - i;
//   const end = start + 1;
//   return {
//     title: `${start} - ${end}`,
//     value: `${start}-${end}`,
//   };
// });
     const today = new Date();
  const year = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  const fy = `${year} - ${year + 1}`;
const fetchTaxSettings = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-04-01`;
    const endDate = `${currentYear + 1}-03-31`;

    const params = {
      fields: [
        "decalarationStartDate",
        "decalarationEndDate",
        "reconcileStartDate",
        "reconcileEndDate",
        "proofStartDate",
        "proofEndDate",
        "financialStartDate",
        "financialEndDate",
        "id",
      ],
      filter: {
        tenant: {
          _eq: tenantId,
        },
        financialStartDate: {
          _eq: startDate,
        },
        financialEndDate: {
          _eq: endDate,
        },
      },
    };

    const queryString = Object.entries(params)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((v) => `${key}[]=${v}`).join("&");
        }
        if (typeof value === "object") {
          return Object.entries(value)
            .map(([nestedKey, nestedVal]) =>
              Object.entries(nestedVal)
                .map(([op, val]) => `filter[${nestedKey}][${op}]=${val}`)
                .join("&"),
            )
            .join("&");
        }
        return `${key}=${value}`;
      })
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/taxSettings?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const result = await response.json();
    const data = result.data?.[0];
    id.value = data?.id;


    if (data) {
     
      formData.value = {
        // financialYear: fy,
        declarationStart: data.decalarationStartDate || "",
        declarationEnd: data.decalarationEndDate || "",
        reconcileStart: data.reconcileStartDate || "",
        reconcileEnd: data.reconcileEndDate || "",
        uploadStart: data.proofStartDate || "",
        uploadEnd: data.proofEndDate || "",
      };
      originalData.value = { ...formData.value };
    }
  } catch (error) {
    console.error("Error fetching existing tax settings:", error);
  }
};

const fieldMap = {
  declarationStart: "decalarationStartDate",
  declarationEnd: "decalarationEndDate",
  reconcileStart: "reconcileStartDate",
  reconcileEnd: "reconcileEndDate",
  uploadStart: "proofStartDate",
  uploadEnd: "proofEndDate",

  financialStartDate: "financialStartDate",
  financialEndDate: "financialEndDate",
};

const handleSubmit = () => {
  const isEditing = !!id.value;
  const finalPayload = {};

  if (isEditing) {
    let hasChanges = false;

    for (const key in fieldMap) {
      const apiField = fieldMap[key];
      const currentValue = formData.value[key] || "";
      const originalValue = originalData.value[key] || "";

      if (currentValue !== originalValue) {
        finalPayload[apiField] = currentValue;
        hasChanges = true;

        if (key === "financialYear" && currentValue.includes("-")) {
          const [startYear] = currentValue.split("-");
          finalPayload["financialStartDate"] = `${startYear}-04-01`;
          finalPayload["financialEndDate"] = `${parseInt(startYear) + 1}-03-31`;
        }
      }
    }

    if (!hasChanges) {
      alert("No changes updated.");
      editMode.value = false;
      return;
    }
  } else {
    for (const key in fieldMap) {
      const value = formData.value[key];
      if (value) {
        const apiField = fieldMap[key];
        finalPayload[apiField] = value;
      }
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const financialStartYear =
      currentMonth <= 3 ? currentYear - 1 : currentYear;

    finalPayload["financialStartDate"] = `${financialStartYear}-04-01`;
    finalPayload["financialEndDate"] = `${financialStartYear + 1}-03-31`;
    finalPayload.tenant = tenantId;
  }

  console.log("Payload to send:", finalPayload);
  submitTaxSettings(finalPayload);
};

const submitTaxSettings = async (payload) => {
  try {
    const token = authService.getToken();
    const isEditing = !!id.value;
    if (isEditing) {
      originalData.value = { ...formData.value };
    }

    const url = isEditing
      ? `${import.meta.env.VITE_API_URL}/items/taxSettings/${id.value}`
      : `${import.meta.env.VITE_API_URL}/items/taxSettings`;

    const response = await fetch(url, {
      method: isEditing ? "PATCH" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    editMode.value = false;
    await fetchTaxSettings();
    console.log("Tax settings saved successfully:", data);
  } catch (error) {
    console.error("Error submitting tax settings:", error);
  }
};
const cancelEdit = () => {
  formData.value = { ...originalData.value };
  editMode.value = false;
};

const resetForm = () => {
  formData.value = {
    declarationStart: "",
    declarationEnd: "",
    reconcileStart: "",
    reconcileEnd: "",
    uploadStart: "",
    uploadEnd: "",
  };
  console.log("Form reset");
};

onMounted(() => {
  fetchTaxSettings();
});
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.accent-bar {
  width: 4px;
  height: 24px;
  border-radius: 2px;
}

.form-sections {
  width: 100%;
}

.custom-select {
  margin-top: 8px;
}

.form-field {
  margin-top: 8px;
}

/* Custom spacing for better alignment */
.ga-3 {
  gap: 12px;
}

.ga-4 {
  gap: 16px;
}

/* Ensure consistent card heights */
.v-card {
  height: 100%;
}

/* Custom button styling */
.v-btn {
  text-transform: none;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .ml-11 {
    margin-left: 44px;
  }
}

@media (max-width: 600px) {
  .ml-11 {
    margin-left: 0;
  }

  .pa-8 {
    padding: 16px !important;
  }
}
</style>
