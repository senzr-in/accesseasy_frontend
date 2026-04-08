<template>
  <div class="personal-details">
    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="black"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>
    <v-container
      v-else-if="employeeData && employeeData.assignedUser"
      class="pa-4"
    >
      <div class="d-flex justify-space-between align-center mb-4">
        <h3>Employee Address</h3>
        <v-btn
          color="black"
          @click="updatePersonalDetails"
          :disabled="!hasChanges"
        >
          Update
        </v-btn>
      </div>
      <br />
      <v-row>
        <!-- Permanent Address -->
        <v-col cols="12">
          <v-textarea
            v-model="employeeData.assignedUser.permanent_Address"
            label="Permanent Address"
            rows="3"
            variant="outlined"
            density="comfortable"
          ></v-textarea>
        </v-col>

        <!-- Current Address -->
        <v-col cols="12">
          <v-textarea
            v-model="employeeData.assignedUser.current_Address"
            label="Current Address"
            rows="3"
            variant="outlined"
            density="comfortable"
          ></v-textarea>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { authService } from "@/services/authService";

const props = defineProps({
  employeeData: {
    type: Object,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:employeeData"]);

const loading = ref(true);
const originalEmployeeData = ref(null);

const hasChanges = computed(() => {
  if (!originalEmployeeData.value || !props.employeeData) return false;
  return (
    JSON.stringify(originalEmployeeData.value) !==
    JSON.stringify(props.employeeData)
  );
});

const fetchEmployeeData = async () => {
  const token = authService.getToken();
  try {
    const fields = [
      "id",
      "assignedUser.id",
      "assignedUser.permanent_Address",
      "assignedUser.current_Address",
    ];

    const queryString = `fields[]=${fields.join("&fields[]=")}`;
    const finalUrl = `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}?${queryString}`;

    const response = await fetch(finalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data) {
      originalEmployeeData.value = JSON.parse(JSON.stringify(data.data));
      emit("update:employeeData", data.data);
    } else {
      throw new Error("No employee data found");
    }
  } catch (err) {
    console.error("Error fetching employee data:", err);
  } finally {
    loading.value = false;
  }
};

const updatePersonalDetails = async () => {
  const token = authService.getToken();

  try {
    const updatedFields = {};
    const assignedUser = props.employeeData.assignedUser;
    const originalUser = originalEmployeeData.value.assignedUser;

    for (const key in assignedUser) {
      if (
        JSON.stringify(assignedUser[key]) !==
          JSON.stringify(originalUser[key]) &&
        assignedUser[key] !== ""
      ) {
        updatedFields[key] = assignedUser[key];
      }
    }

    if (Object.keys(updatedFields).length === 0) {
      alert("No changes detected in personal details.");
      return;
    }

    if (!assignedUser.id) {
      throw new Error("assignedUser.id is required for update");
    }

    const payload = {
      assignedUser: {
        id: assignedUser.id,
        ...updatedFields,
      },
    };

    console.log("Update payload:", payload);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Update successful", result);

    originalEmployeeData.value = JSON.parse(JSON.stringify(props.employeeData));
    alert("Personal details updated successfully!");
  } catch (error) {
    alert(
      error.message.includes("assignedUser.id")
        ? "Error: User ID is missing. Please refresh the page and try again."
        : "Failed to update personal details. Please try again.",
    );
  }
};

onMounted(() => {
  fetchEmployeeData();
});
</script>

<style scoped>
.personal-details {
  height: 550px;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
}
</style>
