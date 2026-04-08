<template>
  <div class="deductions-container">
    <v-toolbar density="compact" color="grey-lighten-4">
      <v-btn icon color="black" @click="handleClose">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="ml-4"
        >Past TDS in current financial year</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-btn color="error" variant="text" class="mr-2" @click="handleClose">
        CANCEL
      </v-btn>
      <v-btn
        style="background-color: black"
        color="white"
        @click="handleSave"
        :loading="isSaving"
      >
        SAVE
      </v-btn>
    </v-toolbar>

    <!-- TDS Information Section -->
    <div class="section">
      <div class="info-text">
        To correctly calculate TDS liability, please enter details of any amount
        that has been paid to the staff by you or previous employer from outside
        of Salarybox App in the current financial year.
      </div>

      <div class="tds-input-container mt-4">
        <div class="input-field mb-4">
          <label>Taxable Salary</label>
          <v-text-field
            v-model="taxableSalary"
            prefix="₹"
            variant="outlined"
            color="black"
            hide-details
            class="mt-1"
          />
        </div>

        <div class="input-field">
          <label>TDS deducted/paid</label>
          <v-text-field
            v-model="tdsDeducted"
            prefix="₹"
            variant="outlined"
            color="black"
            hide-details
            class="mt-1"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { authService } from "@/services/authService";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const id = route.params.id;
const token = authService.getToken();

const taxableSalary = ref("");
const tdsDeducted = ref("");
const tdsDeductionId = ref("");

const fetchItemData = async () => {
  try {
    const params = {
      fields: ["pastTds","id"],
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
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    tdsDeductionId.value = data.data.id
    const pastTds = data.data.pastTds;
if (pastTds) {
  taxableSalary.value = pastTds.taxableSalary || "";
  tdsDeducted.value = pastTds.tdsDeducted || "";
}
  } catch (error) {
    console.error("Error fetching past TDS data:", error);
  }
};
const handleSave = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          
            pastTds: {              
              taxableSalary: taxableSalary.value,
              tdsDeducted: tdsDeducted.value,
            },
            id: tdsDeductionId.value, 
        
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to update past TDS");

    handleClose(); 
    await fetchItemData(); 
  } catch (err) {
    console.error("PATCH error:", err);
  }
};


const handleClose = () => {
  router.push({ name: "TdsDeductionDefault", params: { id } });
};

onMounted(async () => {
  await fetchItemData();
});
</script>

<style scoped>
.deductions-container {

  color: #333;
  max-width: 100%;
  margin: 0 auto;
  height: calc(90vh - 190px);
  overflow-y: auto;
}

.section {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 4px;
}

.gray-bg {
  background-color: #f2f2f2;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 15px;
}

.subsection-title {
  font-size: 18px;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 15px;
}

.info-text {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
}

.link {
  color: #0078d4;
  text-decoration: none;
}

.add-btn {
  background-color: transparent;
  color: #0078d4;
  border: 1px solid #0078d4;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.grid-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
  margin-bottom: 20px;
}

.amounts-table-grid {
  display: grid;
  grid-template-columns: auto auto;
  row-gap: 8px;
  column-gap: 8px;
  padding: 10px;
  border-radius: 4px;

  max-width: 250px;
  justify-self: end;
}

.grid-item.label {
  font-weight: bold;
  text-align: left;
}

.grid-item.value {
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.manage-btn,
.add-investment-btn {
  background-color: transparent;
  color: #0078d4;
  border: none;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.dropdown-icon,
.info-icon {
  margin-left: 5px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .amounts-table {
    overflow-x: auto;
  }
}
</style>
