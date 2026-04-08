<template>
  <v-card flat class="compliance-card">
    <v-card-text>
      <h3 class="text-h5 mb-6">Compliances</h3>

      <v-tabs v-model="activeTab" color="black" class="mb-6">
        <v-tab value="employer">Employer Contributions</v-tab>
        <v-tab value="employee">Employee Contributions</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- Employer Contributions Tab -->
        <v-window-item value="employer">
          <div class="d-flex flex-wrap gap-6">
            <!-- Employer PF Contribution -->
            <v-card width="400" variant="outlined" class="flex-grow-1">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-4">
                  <span class="text-h6">Employer PF Contribution</span>
                  <v-tooltip location="bottom">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-information"
                        variant="text"
                        size="small"
                        color="grey"
                        @click="showInfoDialog('pf')"
                      ></v-btn>
                    </template>
                    <span>PF contribution information</span>
                  </v-tooltip>
                </div>
                <div class="component-chips pa-3 rounded bg-grey-lighten-4">
                  <div class="d-flex align-center flex-wrap gap-2">
                    <v-chip
                      v-for="item in employerPFComponents"
                      :key="item"
                      closable
                      size="small"
                      class="mr-2 mb-2"
                      @click:close="removeComponent('employerPF', item)"
                    >
                      {{ item }}
                    </v-chip>
                    <v-btn
                      variant="text"
                      style="background-color: black; font-size: medium"
                      color="white"
                      size="small"
                      class="add-button"
                      @click="showAddDialog('employerPF')"
                    >
                      + Add
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Employer ESI Contribution -->
            <v-card width="400" variant="outlined" class="flex-grow-1">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-4">
                  <span class="text-h6">Employer ESI Contribution</span>
                  <v-tooltip location="bottom">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-information"
                        variant="text"
                        size="small"
                        color="grey"
                        @click="showInfoDialog('esi')"
                      ></v-btn>
                    </template>
                    <span>ESI contribution information</span>
                  </v-tooltip>
                </div>
                <div class="component-chips pa-3 rounded bg-grey-lighten-4">
                  <div class="d-flex align-center flex-wrap gap-2">
                    <v-chip
                      v-for="item in employerESIComponents"
                      :key="item"
                      closable
                      size="small"
                      class="mr-2 mb-2"
                      @click:close="removeComponent('employerESI', item)"
                    >
                      {{ item }}
                    </v-chip>
                    <v-btn
                      variant="text"
                      style="background-color: black; font-size: medium"
                      color="white"
                      size="small"
                      class="add-button"
                      @click="showAddDialog('employerESI')"
                    >
                      + Add
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-window-item>

        <!-- Employee Contributions Tab -->
        <v-window-item value="employee">
          <div class="d-flex flex-wrap gap-6">
            <!-- Employee PF Contribution -->
            <v-card width="400" variant="outlined" class="flex-grow-1">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-4">
                  <span class="text-h6">Employee PF Contribution</span>
                  <v-tooltip location="bottom">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-information"
                        variant="text"
                        size="small"
                        color="grey"
                        @click="showInfoDialog('employeePf')"
                      ></v-btn>
                    </template>
                    <span>Employee PF contribution information</span>
                  </v-tooltip>
                </div>
                <div class="component-chips pa-3 rounded bg-grey-lighten-4">
                  <div class="d-flex align-center flex-wrap gap-2">
                    <v-chip
                      v-for="item in employeePFComponents"
                      :key="item"
                      closable
                      size="small"
                      class="mr-2 mb-2"
                      @click:close="removeComponent('employeePF', item)"
                    >
                      {{ item }}
                    </v-chip>
                    <v-btn
                      variant="text"
                      style="background-color: black; font-size: medium"
                      color="white"
                      size="small"
                      class="add-button"
                      @click="showAddDialog('employeePF')"
                    >
                      + Add
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Employee ESI Contribution -->
            <v-card width="400" variant="outlined" class="flex-grow-1">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-4">
                  <span class="text-h6">Employee ESI Contribution</span>
                  <v-tooltip location="bottom">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-information"
                        variant="text"
                        size="small"
                        color="grey"
                        @click="showInfoDialog('employeeEsi')"
                      ></v-btn>
                    </template>
                    <span>Employee ESI contribution information</span>
                  </v-tooltip>
                </div>
                <div class="component-chips pa-3 rounded bg-grey-lighten-4">
                  <div class="d-flex align-center flex-wrap gap-2">
                    <v-chip
                      v-for="item in employeeESIComponents"
                      :key="item"
                      closable
                      size="small"
                      class="mr-2 mb-2"
                      @click:close="removeComponent('employeeESI', item)"
                    >
                      {{ item }}
                    </v-chip>
                    <v-btn
                      variant="text"
                      style="background-color: black; font-size: medium"
                      color="white"
                      size="small"
                      class="add-button"
                      @click="showAddDialog('employeeESI')"
                    >
                      + Add
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-window-item>
      </v-window>

      <!-- Add Component Dialog -->
      <v-dialog v-model="showAddComponentDialog" max-width="500">
        <v-card>
          <v-card-title>Add Component</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedComponent"
              :items="availableComponents"
              label="Select Component"
              variant="outlined"
              density="comfortable"
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="white"
              style="background-color: black"
              @click="closeAddDialog"
            >
              Cancel
            </v-btn>

            <v-btn
              style="background-color: black"
              color="white"
              @click="addComponent"
              :disabled="!selectedComponent"
            >
              Add
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Info Dialog -->
      <v-dialog v-model="showInfoDialog" max-width="500">
        <v-card>
          <v-card-title>{{ infoDialogTitle }}</v-card-title>
          <v-card-text>{{ infoDialogContent }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              style="background-color: black"
              color="white"
              variant="text"
              @click="closeInfoDialog"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "Compliance",
  data() {
    return {
      activeTab: "employer",
      employerPFComponents: ["BASIC", "Dearness Allowance"],
      employerESIComponents: ["BASIC", "Dearness Allowance"],
      employeePFComponents: ["BASIC"],
      employeeESIComponents: ["BASIC"],
      showAddComponentDialog: false,
      showInfoDialog: false,
      selectedComponent: null,
      currentSection: null,
      infoDialogTitle: "",
      infoDialogContent: "",
      availableComponents: [
        "BASIC",
        "Dearness Allowance",
        "HRA",
        "Special Allowance",
        "Transport Allowance",
      ],
    };
  },
  methods: {
    showAddDialog(section) {
      this.currentSection = section;
      this.showAddComponentDialog = true;
    },
    closeAddDialog() {
      this.showAddComponentDialog = false;
      this.selectedComponent = null;
      this.currentSection = null;
    },
    addComponent() {
      if (this.selectedComponent && this.currentSection) {
        const components = this[`${this.currentSection}Components`];
        if (!components.includes(this.selectedComponent)) {
          components.push(this.selectedComponent);
        }
        this.closeAddDialog();
      }
    },
    removeComponent(section, component) {
      const components = this[`${section}Components`];
      const index = components.indexOf(component);
      if (index > -1) {
        components.splice(index, 1);
      }
    },
    showInfoDialog(type) {
      const info = {
        pf: {
          title: "Employer PF Contribution",
          content:
            "Employer's contribution to Provident Fund is calculated based on selected components.",
        },
        esi: {
          title: "Employer ESI Contribution",
          content:
            "Employer's contribution to ESI is calculated based on selected components.",
        },
        employeePf: {
          title: "Employee PF Contribution",
          content:
            "Employee's contribution to Provident Fund is calculated based on selected components.",
        },
        employeeEsi: {
          title: "Employee ESI Contribution",
          content:
            "Employee's contribution to ESI is calculated based on selected components.",
        },
      };

      this.infoDialogTitle = info[type].title;
      this.infoDialogContent = info[type].content;
      this.showInfoDialog = true;
    },
    closeInfoDialog() {
      this.showInfoDialog = false;
      this.infoDialogTitle = "";
      this.infoDialogContent = "";
    },
  },
};
</script>

<style scoped>
.compliance-card {
  min-height: 600px;
}

.component-chips {
  border: 1px solid #e0e0e0;
  min-height: 80px;
}

.add-button {
  height: 32px !important;
  padding: 0 12px !important;
}

.gap-6 {
  gap: 24px;
}

:deep(.v-chip) {
  background-color: white !important;
}

:deep(.v-btn) {
  text-transform: none;
}

:deep(.v-tab) {
  text-transform: none;
  font-size: 16px;
}

:deep(.v-card-text) {
  padding: 24px;
}
</style>
