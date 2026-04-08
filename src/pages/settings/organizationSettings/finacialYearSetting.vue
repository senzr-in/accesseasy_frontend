<template>
  <div class="payroll-settings">
    <div
      class="settings-container"
      style="max-height: 100vh; overflow-y: auto; padding-right: 20px"
    >
      <h3>Financial year Settings</h3>
      <br />
      <p>Configure your financial year and attendance cycle</p>

      <div class="section">
        <h3>Financial Year</h3>
        <div class="row">
          <div class="form-group">
            <label for="startMonth">Start Month</label>
            <input
              id="startMonth"
              type="month"
              v-model="formData.startMonth"
              :disabled="!isEditing"
            />
          </div>
          <div class="form-group">
            <label for="endMonth">End Month</label>
            <input
              id="endMonth"
              type="month"
              :value="formData.endMonth"
              readonly
            />
          </div>
        </div>
      </div>

      <div class="buttons">
        <button v-if="!isEditing" class="edit" @click="enableEditMode">
          Edit
        </button>
        <button v-else class="save" color="black" @click="saveSettings">
          Save
        </button>
        <button v-if="isEditing" class="cancel" @click="cancelSettings">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

const token = authService.getToken();
const formData = reactive({
  startMonth: "",
  endMonth: "",
  tenantId: "",
  tenantName: "",
});
const isEditing = ref(false);

// Fetch attendance cycle data for the tenant
const fetchAttendanceCycle = async () => {
  const token = authService.getToken();
  const tenantId = await currentUserTenant.getTenantId();
  const url = `${
    import.meta.env.VITE_API_URL
  }/items/attendanceCycle?field[]=id&field[]=tenant.tenantId&fields[]=startMonth&fields[]=endMonth&filter[tenant][tenantId][_eq]=${tenantId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    const cycle = data.data[0];
    if (cycle) {
      formData.startMonth = cycle.startMonth || "";
      formData.endMonth = cycle.endMonth || "";
    }
  } else {
    console.error("Failed to fetch attendance cycle");
  }
};

// Enable edit mode
const enableEditMode = () => {
  isEditing.value = true;
};

// Cancel editing
const cancelSettings = () => {
  isEditing.value = false;
  fetchAttendanceCycle(); // Revert changes to the latest saved data
};

// Save or update settings
const saveSettings = async () => {
  const token = authService.getToken();
  const tenantId = await currentUserTenant.getTenantId();

  if (!formData.startMonth) {
    alert("Start Month is required");
    return;
  }

  const payload = {
    startMonth: formData.startMonth,
    endMonth: calculateEndMonth(formData.startMonth),
    tenant: tenantId,
  };

  const url = `${import.meta.env.VITE_API_URL}/items/attendanceCycle`;
  const method = formData.tenantId ? "PATCH" : "POST";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    alert("Settings saved successfully!");
    isEditing.value = false;
    fetchAttendanceCycle(); // Refresh data
  } else {
    console.error("Failed to save settings");
  }
};

// Calculate end month based on start month
const calculateEndMonth = (startMonth) => {
  if (startMonth) {
    const [year, month] = startMonth.split("-");
    const startMonthNum = parseInt(month);
    const endMonthNum = startMonthNum === 1 ? 12 : startMonthNum - 1;
    const endYear = startMonthNum === 1 ? parseInt(year) - 1 : year;

    return `${endYear}-${endMonthNum.toString().padStart(2, "0")}`;
  }
  return "";
};
watch(
  () => formData.startMonth,
  (newStartMonth) => {
    if (newStartMonth) {
      formData.endMonth = calculateEndMonth(newStartMonth);
    } else {
      formData.endMonth = ""; // Reset endMonth if startMonth is cleared
    }
  }
);

onMounted(fetchAttendanceCycle);
</script>

<style scoped>
.payroll-settings {
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: left;
  align-items: left;
  box-sizing: border-box;
}

.settings-container {
  background-color: #ffffff;
  padding: 40px;
  border-radius: 8px;
  max-width: 1700px;
  width: 100%;
}

.settings-container h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.settings-container p {
  font-size: 16px;
  color: #555;
  margin-bottom: 30px;
}

.section {
  margin-bottom: 30px;
}

.section h3 {
  font-size: 20px;
  margin-bottom: 15px;
}

.row {
  display: flex;
  gap: 30px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-group label {
  font-size: 16px;
  margin-bottom: 8px;
  color: #555;
}

.form-group select,
.form-group input {
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.buttons {
  display: flex;
  justify-content: flex-start;
  gap: 15px;
}

button {
  padding: 12px 25px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
button.edit {
  background-color: black;
  color: white;
}
button.save {
  background-color: black;
  color: white;
}

button.cancel {
  background-color: white;
  color: black;
}

.cycle-toggles {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toggle-item {
  display: flex;
  align-items: center;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: black;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.ml-2 {
  margin-left: 10px;
}

.mt-2 {
  margin-top: 10px;
}
.cycle-type-radio {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.radio-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-container input {
  margin-right: 8px;
}

.radio-container input[type="radio"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 50%;
  outline: none;
  transition: all 0.3s;
}

.radio-container input[type="radio"]:checked {
  border-color: black;
  background-color: black;
  position: relative;
}

.radio-container input[type="radio"]:checked::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: white;
  border-radius: 50%;
}

.radio-label {
  font-size: 16px;
  color: #555;
}
</style>
