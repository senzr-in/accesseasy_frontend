<template>
  <div class="form-section">
    <h3>Leave Policy</h3>
    <br />

    <v-card v-if="leavePolicies.length > 0">
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="(policy, index) in leavePolicies"
            :key="index"
            :title="policy.leaveName"
            :subtitle="`${policy.leaveConfig?.days || 0}`"
          >
            <template v-slot:append>
              <v-switch
                v-model="policy.isActive"
                color="primary"
                hide-details
                inset
                class="mr-3"
                :label="policy.isActive ? 'Assigned' : 'Not assigned'"
                @change="updateAssignedLeaves(policy)"
                :loading="policy.loading"
              ></v-switch>

              <v-chip
                v-if="policy.leaveConfig?.carryForward > 0"
                color="info"
                variant="outlined"
                class="mr-2"
              >
                Carry Forward: {{ policy.leaveConfig.limit }} days
              </v-chip>

              <v-chip
                v-if="policy.leaveConfig?.monthLimit > 0"
                color="warning"
                variant="outlined"
              >
                Monthly Limit: {{ policy.leaveConfig.monthLimit }} days
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <v-alert v-else type="info" variant="tonal" class="mt-4">
      No active leave policies found for this tenant.
    </v-alert>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { authService } from "@/services/authService";

const props = defineProps({
  tenantId: String,
  employeeId: String, // Employee ID passed as prop
});

const leavePolicies = ref([]);
const isLoading = ref(false);

// Fetch all leave policies for the tenant
async function fetchLeavePolicySettings() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveSetting?filter[tenant][tenantId][_eq]=${props.tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch leave settings");

    const data = await response.json();
    return data.data
      .filter((item) => item.leaveConfig?.isEnabled === true)
      .map((item) => ({
        ...item,
        isActive: false, // Initialize all as inactive
        loading: false,
      }));
  } catch (error) {
    console.error("Error fetching leave settings:", error);
    return [];
  }
}

// Fetch current assigned leaves for the employee
async function fetchAssignedLeaves() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leave?filter[assignedTo][id][_eq]=${props.employeeId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch assigned leaves");

    const data = await response.json();
    return data.data[0]?.assignedLeave || [];
  } catch (error) {
    console.error("Error fetching assigned leaves:", error);
    return [];
  }
}

// Update assigned leaves when toggle is changed
async function updateAssignedLeaves(policy) {
  policy.loading = true;
  try {
    // First get or create the leave record for the employee
    let leaveRecord;

    // Try to fetch existing record
    const leaveResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leave?filter[assignedTo][id][_eq]=${props.employeeId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!leaveResponse.ok) throw new Error("Failed to fetch leave record");

    const leaveData = await leaveResponse.json();

    // If record doesn't exist, create one
    if (leaveData.data.length === 0) {
      const createResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/leave`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify({
            assignedTo: props.employeeId,
            assignedLeave: policy.isActive ? [policy.leaveName] : [],
            leaveBalance: {},
            leaveTaken: {},
            CarryForwardleave: {},
            status: "active",
          }),
        },
      );

      if (!createResponse.ok) throw new Error("Failed to create leave record");
      leaveRecord = await createResponse.json().data;
    } else {
      leaveRecord = leaveData.data[0];
    }

    // Get current assigned leaves
    const currentAssigned = leaveRecord?.assignedLeave || [];
    let updatedAssigned = [...currentAssigned];

    if (policy.isActive) {
      // Add the leave policy if not already present
      if (!currentAssigned.includes(policy.leaveName)) {
        updatedAssigned.push(policy.leaveName);
      }
    } else {
      // Remove the leave policy if present
      updatedAssigned = currentAssigned.filter(
        (name) => name !== policy.leaveName,
      );
    }

    // Update the leave record
    const updateResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leave/${leaveRecord.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          assignedLeave: updatedAssigned,
        }),
      },
    );

    if (!updateResponse.ok) throw new Error("Failed to update assigned leaves");
  } catch (error) {
    console.error("Error updating assigned leaves:", error);
    // Revert the toggle if there was an error
    policy.isActive = !policy.isActive;
  } finally {
    policy.loading = false;
  }
}

onMounted(async () => {
  leavePolicies.value = await fetchLeavePolicySettings();

  // Set initial toggle states based on assigned leaves
  if (props.employeeId) {
    const assignedLeaves = await fetchAssignedLeaves();
    leavePolicies.value = leavePolicies.value.map((policy) => ({
      ...policy,
      isActive: assignedLeaves.includes(policy.leaveName),
    }));
  }
});
</script>
