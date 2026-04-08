<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <!-- Tabs -->
        <v-row class="align-center mb-4">
          <v-col cols="auto">
            <v-btn icon="mdi-arrow-left" variant="text" @click="goBack"></v-btn>
          </v-col>
          <v-col cols="3">
            <div
              style="
                background-color: #ecfdf5;
                color: black;
                padding: 6px;
                border: 1px solid #059367;
              "
            >
              <h2 class="text-h6 font-weight-medium mb-0">
                {{ props.selectedConfig.configName }}
              </h2>
            </div>
          </v-col>
        </v-row>

        <!-- Tab content -->
        <v-window v-model="activeTab">
          <v-window-item value="penalty-settings">
            <PenaltyOverTime
              v-if="selectedConfig && policyPatchId"
              :config="selectedConfig"
              :policyPatch="policyPatchId"
            />
            <div v-else class="pa-4 text-center text-muted-foreground">
              Please select an attendance policy to configure penalty and
              overtime settings.
            </div>
          </v-window-item>
          <v-window-item value="assign-employee">
            <AssignEmployee
              v-if="selectedConfig"
              :config="selectedConfig"
              gradeName="Default Grade"
              :updateAlteredData="() => {}"
            />
            <div v-else class="pa-4 text-center text-muted-foreground">
              Please select an attendance policy to assign employees.
            </div>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import AssignEmployee from "./attendancePolicies/assignToEmployee.vue";
import PenaltyOverTime from "./attendancePolicies/penality&OverTime.vue";

const props = defineProps({
  selectedConfig: {
    type: Object,
    default: null,
  },
  policyPatchId: {
    type: Number,
    default: null,
  },
  showSnackbar: {
    type: Function,
    default: null,
  },
});
const emit = defineEmits([]);

const goBack = () => {
  emit("close");
};
const tabs = [
  {
    title: "Penalty Settings",
    value: "penalty-settings",
    icon: "mdi-alert-circle-outline",
  },
  // {
  //   title: "Assign to Employee",
  //   value: "assign-employee",
  //   icon: "mdi-account-cog-outline",
  // },
];

const activeTab = ref("penalty-settings");

watch(
  () => props.selectedConfig,
  (newVal) => {
    if (newVal) {
      activeTab.value = "penalty-settings";
    }
  },
);
onMounted(() => {
  console.log("1", props.selectedConfig);
});
</script>

<style scoped>
.v-container {
  padding: 16px;
}

.tab-text {
  text-transform: capitalize;
  font-weight: 550;
  font-size: 16px;

}

/* Optional: Add responsive styles */
@media (max-width: 600px) {
  .v-tab {
    min-width: unset;
  }
}
</style>
