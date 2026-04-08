<template>
  <div>
    <v-window v-model="activeTab">
            <!-- Antipassback Mode Tab -->
            <v-window-item value="antipassback">
              <!-- Your existing antipassback code -->
            </v-window-item>

            <!-- Interlock Mode Tab -->
            <v-window-item value="interlock">
              <!-- Interlock Configuration Form -->
              <div v-if="showInterlockForm">
                <div class="d-flex align-center mb-4">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    class="mr-2"
                    @click="closeInterlockForm"
                  >
                    <v-icon>mdi-arrow-left</v-icon>
                  </v-btn>
                  <v-card-title class="text-h6 font-weight-bold pa-0">
                    {{
                      isEditingInterlock
                        ? "Edit Interlock Rule"
                        : "Add New Interlock Rule"
                    }}
                  </v-card-title>
                </div>

                <v-card-text>
                  <v-row>
                    <v-col cols="12">
                      <div class="text-subtitle-1 font-weight-medium mb-2">
                        Select up to 4 doors for interlock control (excludes
                        doors from antipassback)
                      </div>

                      <!-- Doors Selection -->
                      <v-card class="mb-4">
                        <v-card-text>
                          <div class="mb-3">
                            <div class="text-caption text-medium-emphasis mb-2">
                              Select interlock doors
                            </div>
                            <v-select
                              label="Select Doors"
                              :items="doorOptions"
                              multiple
                              variant="outlined"
                              density="compact"
                              v-model="interlockForm.selectedDoors"
                              :rules="doorSelectionRules"
                              :error="hasDoorSelectionError"
                              :error-messages="doorSelectionErrorMessages"
                            ></v-select>
                          </div>

                          <!-- Validation Message -->
                          <div v-if="hasDoorSelectionError" class="mt-2">
                            <div class="text-caption text-error">
                              {{ doorSelectionErrorMessages }}
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols="12">
                      <div
                        class="d-flex align-center justify-end gap-2"
                        style="max-width: 100%"
                      >
                        <BaseButton
                          variant="ghost"
                          size="md"
                          text="Cancel"
                          @click="closeInterlockForm"
                        />
                        <BaseButton
                          variant="primary"
                          size="md"
                          text="Save Configuration"
                          @click="saveInterlockRule"
                          :disabled="!isFormValid"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </div>

              <!-- Interlock Rules List -->
              <div v-else>
                <div class="d-flex align-center justify-space-between">
                  <v-card-title class="text-h6 font-weight-bold pa-0">
                    Interlock Configuration
                    <v-chip size="small" color="primary" class="ml-3">
                      {{ interlockRules.length }} Rules
                    </v-chip>
                  </v-card-title>
                  <BaseButton
                    variant="primary"
                    size="md"
                    text="Add New Rule"
                    :leftIcon="Plus"
                    @click="openAddInterlockPanel"
                  />
                </div>

                <div>
                  <!-- Loading State -->
                  <SkeletonLoader
                    v-if="interlockLoading"
                    variant="data-table"
                    :rows="5"
                    :columns="4"
                  />

                  <!-- Interlock Table -->
                  <DataTableWrapper v-else :showSearch="false">
                    <DataTable
                      :items="interlockRules"
                      :columns="[
                        {
                          label: 'Doors Involved',
                          key: 'doorsInvolved',
                          sortable: true,
                          width: '250px',
                        },
                      ]"
                      :showSelection="false"
                      :expandable="false"
                      show-header
                      :row-clickable="true"
                    >
                      <template #status="{ item }">
                        <v-chip
                          :color="item.status === 'Active' ? 'success' : 'grey'"
                          size="small"
                        >
                          {{ item.status }}
                        </v-chip>
                      </template>

                      <template #actions="{ item }">
                        <BaseButton
                          variant="ghost"
                          size="sm"
                          text="Edit"
                          @click="handleEditInterlock(item)"
                        />
                        <BaseButton
                          variant="ghost"
                          size="sm"
                          text="Delete"
                          :leftIcon="Trash"
                          @click="deleteInterlockRule(item)"
                        />
                      </template>
                    </DataTable>
                  </DataTableWrapper>
                </div>
              </div>
            </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import { Plus, Trash } from "lucide-vue-next";
import { interlockService } from "@/services/interlockService";
import { antipassbackService } from "@/services/antipassbackService";

const activeTab = ref("interlock");
const interlockLoading = ref(false);
const showInterlockForm = ref(false);
const isEditingInterlock = ref(false);
const editingInterlockId = ref(null);

// All available doors
const allDoors = ref([]);
const doorOptions = ref([]);

// Interlock form data
const interlockForm = reactive({
  selectedDoors: [],
  isActive: true,
});

// Computed properties for validation
const hasDoorSelectionError = computed(() => {
  return interlockForm.selectedDoors.length > 4;
});

const doorSelectionErrorMessages = computed(() => {
  if (interlockForm.selectedDoors.length > 4) {
    return "Maximum 4 doors only allowed for interlock configuration";
  }
  return "";
});

const isFormValid = computed(() => {
  return (
    interlockForm.selectedDoors.length >= 1 &&
    interlockForm.selectedDoors.length <= 4
  );
});

// Validation rules
const doorSelectionRules = [
  (value) => !!value.length || "At least one door is required",
  (value) => value.length <= 4 || "Maximum 4 doors only allowed",
];

// Interlock rules data
const interlockRules = ref([]);

// Helpers
const formatDoorDisplay = (door) => {
  if (!door) return "";
  return `${door.doorName} (${door.doorNumber})`;
};

const showNotification = (message) => {
  // Assuming a global notification or local snackbar needs to be added similar to antipassbackMode
  // For now, just console log or alert if no snackbar in template
  console.log(message);
};

// === CRUD Operations ===
const fetchInterlockData = async () => {
  interlockLoading.value = true;
  try {
    const [rules, doors] = await Promise.all([
      interlockService.fetchRules(),
      antipassbackService.fetchDoors(),
    ]);

    allDoors.value = doors;
    doorOptions.value = doors.map((d) => ({
      title: formatDoorDisplay(d),
      value: d.doorNumber,
    }));

    // Map rules
    interlockRules.value = rules.map((rule) => {
      // interlockMode format: "(1,2)"
      let doorNumbers = [];
      // Check interlockMode first (new format), then fall back to interlockRule (old format)
      const rawMode = rule.interlockMode;
      const rawRule = rule.interlockRule;
      
      if (typeof rawMode === 'string' && rawMode.startsWith('(') && rawMode.endsWith(')')) {
        const content = rawMode.slice(1, -1); // Remove ( and )
        if (content) {
          doorNumbers = content.split(',').map(n => parseInt(n.trim()));
        }
      } else if (typeof rawRule === 'string' && rawRule.startsWith('[(') && rawRule.endsWith(')]')) {
        // Fallback for old format
        const content = rawRule.slice(2, -2); // Remove [( and )]
        if (content) {
          doorNumbers = content.split(',').map(n => parseInt(n.trim()));
        }
      } else if (Array.isArray(rawRule)) {
        // Fallback for legacy array format
        doorNumbers = rawRule;
      }

      const doorsInvolved = doorNumbers
        .map((num) => {
          const d = doors.find((door) => door.doorNumber === num);
          return d ? formatDoorDisplay(d) : `Door ${num}`;
        })
        .join(", ");

      return {
        id: rule.id,
        ruleName: `Interlock Group ${rule.id}`, // Or if backend has name
        doorsInvolved,
        selectedDoors: doorNumbers,
        status: rule.status || "Active",
        isActive: rule.status === "Active",
      };
    });
  } catch (error) {
    console.error("Error fetching interlock data:", error);
  } finally {
    interlockLoading.value = false;
  }
};

// Methods to handle interlock form
const openAddInterlockPanel = () => {
  showInterlockForm.value = true;
  isEditingInterlock.value = false;
  editingInterlockId.value = null;
  // Reset form
  Object.assign(interlockForm, {
    selectedDoors: [],
    isActive: true,
  });
};

const closeInterlockForm = () => {
  showInterlockForm.value = false;
  isEditingInterlock.value = false;
  editingInterlockId.value = null;
};

const handleEditInterlock = (item) => {
  isEditingInterlock.value = true;
  showInterlockForm.value = true;
  editingInterlockId.value = item.id;

  // Populate form with existing data
  interlockForm.selectedDoors = [...item.selectedDoors];
  interlockForm.isActive = item.isActive;
};

const saveInterlockRule = async () => {
  // Double check validation before saving
  if (!isFormValid.value) {
    return;
  }

  try {
    const payload = {
      interlockMode: `(${interlockForm.selectedDoors.join(",")})`, // Custom format: (1,2,3)
      status: interlockForm.isActive ? "Active" : "Inactive",
    };

    if (isEditingInterlock.value && editingInterlockId.value) {
      await interlockService.updateRule(editingInterlockId.value, payload);
      showNotification("Interlock rule updated");
    } else {
      await interlockService.createRule(payload);
      showNotification("Interlock rule created");
    }

    await fetchInterlockData();
    closeInterlockForm();
  } catch (error) {
    console.error("Error saving interlock rule:", error);
    showNotification("Failed to save interlock rule");
  }
};

const deleteInterlockRule = async (item) => {
  if (!confirm("Are you sure you want to delete this rule?")) return;
  
  try {
    await interlockService.deleteRule(item.id);
    showNotification("Interlock rule deleted");
    await fetchInterlockData();
  } catch (error) {
    console.error("Error deleting interlock rule:", error);
    showNotification("Failed to delete interlock rule");
  }
};

onMounted(() => {
  fetchInterlockData();
});
</script>

<style scoped>
.v-container {
  max-width: 100%;
}
.gap-2 {
  gap: 8px;
}
.v-card-text {
  flex: 1 1 auto;
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.0178571429em;
  opacity: var(--v-card-text-opacity, 1);
  text-transform: none;
}
</style>
