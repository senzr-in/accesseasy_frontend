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
        <h3>Emergency Contact Details</h3>
        <BaseButton
          variant="primary"
          text="Update"
          :disabled="!hasChanges"
          @click="updatePersonalDetails"
        />
      </div>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="employeeData.assignedUser.emergency_Contact_Name"
            label="Emergency Contact Name"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="employeeData.assignedUser.emergency_Contact_Mobile_Number"
            label="Emergency Contact Mobile Number"
            type="tel"
            variant="outlined"
            density="comfortable"
            :rules="[validateContactNumber]"
            maxlength="10"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="employeeData.assignedUser.emergency_Contact_Relationship"
            label="Emergency Contact Relationship"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="employeeData.assignedUser.guardians_Name"
            label="Guardian's Name"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-textarea
            v-model="employeeData.assignedUser.emergency_Contact_Address"
            label="Emergency Contact Address"
            rows="3"
            variant="outlined"
            density="comfortable"
          ></v-textarea>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-check-circle</v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>

    <v-snackbar
      v-model="showErrorSnackbar"
      color="error"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, onMounted } from "vue";
import { authService } from "@/services/authService";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

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
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

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
      "assignedUser.emergency_Contact_Name",
      "assignedUser.emergency_Contact_Mobile_Number",
      "assignedUser.emergency_Contact_Relationship",
      "assignedUser.emergency_Contact_Address",
      "assignedUser.guardians_Name",
    ];
    const queryString = `fields[]=${fields.join("&fields[]=")}`;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    if (data.data) {
      originalEmployeeData.value = JSON.parse(JSON.stringify(data.data));
      emit("update:employeeData", data.data);
    } else {
      throw new Error("No employee data found");
    }
  } catch (error) {
    console.error("Error fetching employee data:", error);
    showErrorMessage(`Error fetching employee data: ${error.message}`);
  } finally {
    loading.value = false;
  }
};
const validateContactNumber = (value) => {
  if (!value) return "Contact number is required";
  // Allow only exactly 10 digits
  const regex = /^\d{10}$/;
  if (!regex.test(value)) {
    return "Enter a valid 10-digit mobile number";
  }
  return true;
};

const updatePersonalDetails = async () => {
  if (!hasChanges.value) return;

  const updatedData = { id: props.employeeData.assignedUser.id };
  Object.keys(originalEmployeeData.value.assignedUser).forEach((key) => {
    if (
      originalEmployeeData.value.assignedUser[key] !==
      props.employeeData.assignedUser[key]
    ) {
      updatedData[key] = props.employeeData.assignedUser[key];
    }
  });

  if (Object.keys(updatedData).length === 1 && updatedData.id) return;
  try {
    const token = authService.getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignedUser: updatedData }),
      },
    );

    if (!response.ok) throw new Error("Failed to update");

    const result = await response.json();
    originalEmployeeData.value = JSON.parse(JSON.stringify(result.data));
    emit("update:employeeData", result.data);
    showSuccessMessage("Updated successfully");
    await fetchEmployeeData();
  } catch (error) {
    console.error("Error updating employee data:", error);
    showErrorMessage("Error fetching employee data: ${error.message}");
  }
};

onMounted(fetchEmployeeData);
</script>
