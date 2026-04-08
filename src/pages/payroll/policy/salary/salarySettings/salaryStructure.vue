<template>
  <v-card flat class="earnings-manager">
    <div class="sticky-header">
      <v-card-text>
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6">Earnings</h3>
          <!-- <div class="d-flex">
            <v-btn v-if="!isEditing" color="black" @click="startEdit">
              Edit
            </v-btn>
            <template v-else>
              <v-btn color="black" class="mr-2" @click="saveEdit"> Save </v-btn>
              <v-btn color="black" @click="cancelEdit"> Cancel </v-btn>
            </template>
          </div> -->
        </div>
      </v-card-text>
    </div>
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
    <div v-else>
      <div class="scroll-content">
        <v-card-text>
          <div class="fields-container">
            <v-row v-for="(field, index) in fields" :key="index" class="mb-4">
              <v-col cols="4">
                <div
                  :style="{
                    fontWeight: '500',
                    color: 'rgba(0, 0, 0, 0.87)',
                    lineHeight: '1.5',
                    paddingTop: '16px',
                    fontSize: '16px',
                    fontFamily: 'Roboto, sans-serif',
                  }"
                >
                  {{ field.name }}
                </div>
              </v-col>
              <v-col cols="3">
                <v-select
                  v-if="
                    !['HRA', 'Basic Pay', 'Dearness Allowance'].includes(
                      field.name,
                    )
                  "
                  v-model="field.type"
                  :items="earningsTypes"
                  label="Type"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  :disabled="!isEditing"
                  @update:modelValue="handleTypeChange(index, $event)"
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model.number="field.value"
                  label="Value"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  :prefix="getPrefix(field.type)"
                  :placeholder="getPlaceholder(field.type)"
                  :disabled="!isEditing"
                ></v-text-field>
              </v-col>
              <v-col cols="1" class="d-flex align-center justify-end">
                <v-btn
                  v-if="isEditing"
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  :color="field.name === 'Basic Pay' ? 'grey' : 'black'"
                  @click="deleteField(index)"
                  :disabled="field.name === 'Basic Pay'"
                ></v-btn>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </div>

      <!-- <div class="sticky-footer">
        <v-card-text>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn color="black" class="mr-2" v-bind="props">
                <v-icon start>mdi-plus</v-icon>
                Add Field
              </v-btn>
            </template>
            <v-list
              style="
                max-height: 200px;
                overflow-y: auto;
                justify-content: space-between;
              "
            >
              <v-list-item
                v-for="field in availableDefaultFields"
                :key="field.name"
                @click="addDefaultField(field)"
              >
                <v-list-item-title>{{ field.name }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card-text>
      </div> -->
    </div>
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="2000"
      location="top"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

export default {
  props: {
    category: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      loading: true,
      defaultFields: [
        { name: "HRA", type: "Percentage", value: 0 },
        { name: "Dearness Allowance", type: "Percentage", value: 0 },
        { name: "Accomodation and Food", type: "Fixed", value: 0 },
        { name: "Bonus and Incentives", type: "Fixed", value: 0 },
        { name: "Cash Allowance", type: "Fixed", value: 0 },
        { name: "Conveyance Allowance", type: "Fixed", value: 0 },
        { name: "Children Education Allowance", type: "Fixed", value: 0 },
        { name: "Distance Allowance", type: "Fixed", value: 0 },
        { name: "Transport Allowance", type: "Fixed", value: 0 },
        // { name: "Performance Allowance", type: "Fixed", value: 0 },
        // { name: "Day OverTime Allowance", type: "Fixed", value: 0 },
        // { name: "Attendance Bonus Allowance", type: "Fixed", value: 0 },
        // { name: "Sunday OverTime Allowance", type: "Fixed", value: 0 },
        // { name: "Special Allowance", type: "Fixed", value: 0 },
        // { name: "Health Allowance", type: "Fixed", value: 0 },
        { name: "Other Allowance", type: "Fixed", value: 0 },
      ],
      availableDefaultFields: [],
      fields: [],
      earningsTypes: ["Fixed", "Percentage"],
      isEditing: false,
      token: authService.getToken(),
      snackbar: false,
      snackbarText: "",
      snackbarColor: "error",
      apiData: null,
      tenantId: null,
    };
  },

  async created() {
    await this.fetchData();
  },

  methods: {
    initializeAvailableFields() {
      // Filter out fields that are already in fields
      this.availableDefaultFields = this.defaultFields.filter(
        (defaultField) =>
          !this.fields.some(
            (visibleField) => visibleField.name === defaultField.name,
          ),
      );
    },
    addDefaultField(field) {
      const newField = {
        ...field,
        isEditing: true,
      };
      this.fields.push(newField);
      // Remove the added field from availableDefaultFields
      this.availableDefaultFields = this.availableDefaultFields.filter(
        (f) => f.name !== field.name,
      );
      this.startEdit();
    },
    deleteField(index) {
      if (this.fields[index].name === "Basic Pay") return;

      const deletedField = this.fields[index];

      // Remove the field from the fields array
      this.fields.splice(index, 1);

      this.availableDefaultFields.push({
        name: deletedField.name,
        type: deletedField.type,
        value: 0,
      });

      // If we have API data with employer contributions, update the calculations
      if (this.apiData && this.apiData.length > 0) {
        const data = this.apiData[0];

        // Update employersContributions if it exists
        if (data.employersContributions) {
          const contributions = data.employersContributions;

          // Update EmployerPF calculations if it exists
          if (
            contributions.EmployerPF &&
            Array.isArray(contributions.EmployerPF.Calculations)
          ) {
            contributions.EmployerPF.Calculations =
              contributions.EmployerPF.Calculations.filter(
                (calc) => calc.name !== deletedField.name,
              );
          }

          // Update EmployerESI calculations if it exists
          if (
            contributions.EmployerESI &&
            Array.isArray(contributions.EmployerESI.Calculations)
          ) {
            contributions.EmployerESI.Calculations =
              contributions.EmployerESI.Calculations.filter(
                (calc) => calc.name !== deletedField.name,
              );
          }
        }

        // Update employeeDeductions if it exists
        if (data.employeeDeductions) {
          const deductions = data.employeeDeductions;

          // Update EmployeePF calculations if it exists
          if (
            deductions.EmployeePF &&
            Array.isArray(deductions.EmployeePF.Calculations)
          ) {
            deductions.EmployeePF.Calculations =
              deductions.EmployeePF.Calculations.filter(
                (calc) => calc.name !== deletedField.name,
              );
          }

          // Update EmployeeESI calculations if it exists
          if (
            deductions.EmployeeESI &&
            Array.isArray(deductions.EmployeeESI.Calculations)
          ) {
            deductions.EmployeeESI.Calculations =
              deductions.EmployeeESI.Calculations.filter(
                (calc) => calc.name !== deletedField.name,
              );
          }

          // Update VoluntaryPF calculations if it exists
          if (
            deductions.VoluntaryPF &&
            Array.isArray(deductions.VoluntaryPF.Calculations)
          ) {
            deductions.VoluntaryPF.Calculations =
              deductions.VoluntaryPF.Calculations.filter(
                (calc) => calc.name !== deletedField.name,
              );
          }
        }
      }
    },

    async user() {
      const userData = await currentUserTenant.fetchLoginUserDetails();
      this.tenantId = userData.tenant;
    },

    async fetchData() {
      try {
        this.loading = true;
        await this.user();
        const fields = [
          "employersContributions",
          "basicPay",
          "earnings",
          "deductions",
          "allowances",
          "id",
          "employeeDeductions",
        ];

        const queryString = [
          ...fields.map((field) => `fields[]=${field}`),
          `filter[id][_eq]=${this.category.id}`,
        ].join("&");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/salarySetting?${queryString}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        this.apiData = data.data;
        this.processApiData();

        this.initializeAvailableFields();
        this.loading = false;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    processApiData() {
      if (!this.apiData || !this.apiData.length) {
        console.log("No API data available");
        return;
      }

      const config = this.apiData[0];
      this.fields = [];
      // Add Basic Pay
      if (config.basicPay) {
        this.fields.push({
          name: "Basic Pay",
          type: "Percentage",
          value: config.basicPay,
          isEditing: false,
        });
      }

      // Process earnings
      if (config.earnings) {
        config.earnings.forEach((earning) => {
          this.fields.push({
            name: earning.name,
            type: earning.calculations,
            value: earning[earning.calculations],
            isEditing: false,
          });
        });
      }
      // Process allowances
      // if (config.allowances) {
      //   this.fields = config.allowence
      //   config.allowances.forEach((allowance) => {
      //     if (!this.fields.some((field) => field.name === allowance.name)) {
      //       this.availableDefaultFields.push({
      //         name: allowance.name,
      //         type: "Percentage",
      //         value: "0",
      //       });
      //     }
      //   });
      // }
    },

    handleTypeChange(index, newType) {
      const field = this.fields[index];
      field.value = 0;
    },

    validateTotalPercentage() {
      const totalPercentage = this.fields
        .filter((field) => field.type === "Percentage")
        .reduce((sum, field) => sum + Number(field.value || 0), 0);

      if (totalPercentage !== 100) {
        this.snackbarText =
          "Total of Basic Pay and percentage earnings must equal 100%. Please adjust the values.";
        this.snackbarColor = "error";
        this.snackbar = true;
        return false;
      }
      return true;
    },

    async saveEdit() {
      try {
        if (!this.validateTotalPercentage()) {
          return;
        }

        // Prepare the basic payload
        const payload = {
          basicPay: Number(
            this.fields.find((f) => f.name === "Basic Pay")?.value || 0,
          ),
          earnings: this.fields
            .filter((field) => field.name !== "Basic Pay")
            .map((field) => ({
              name: field.name,
              calculations: field.type,
              Fixed: field.type === "Fixed" ? field.value : 0,
              Percentage: field.type === "Percentage" ? field.value : 0,
            })),
          allowances: this.fields.map((field) => ({
            name: field.name,
            calculation: "On Attendance",
          })),
          id: this.apiData[0].id,
        };

        // Include updated employer contributions if they exist
        if (this.apiData && this.apiData.length > 0) {
          // Get the current field names to ensure we only include existing fields
          const currentFieldNames = this.fields.map((field) => field.name);

          // Handle employer contributions
          if (this.apiData[0].employersContributions) {
            // Clone the employer contributions
            const employersContributions = JSON.parse(
              JSON.stringify(this.apiData[0].employersContributions),
            );

            // Filter out any calculations that reference deleted fields
            if (
              employersContributions.EmployerPF &&
              Array.isArray(employersContributions.EmployerPF.Calculations)
            ) {
              employersContributions.EmployerPF.Calculations =
                employersContributions.EmployerPF.Calculations.filter((calc) =>
                  currentFieldNames.includes(calc.name),
                );
            }

            if (
              employersContributions.EmployerESI &&
              Array.isArray(employersContributions.EmployerESI.Calculations)
            ) {
              employersContributions.EmployerESI.Calculations =
                employersContributions.EmployerESI.Calculations.filter((calc) =>
                  currentFieldNames.includes(calc.name),
                );
            }

            // Add to payload
            payload.employersContributions = employersContributions;
          }

          // Handle employee deductions
          if (this.apiData[0].employeeDeductions) {
            // Clone the employee deductions
            const employeeDeductions = JSON.parse(
              JSON.stringify(this.apiData[0].employeeDeductions),
            );

            // Filter out any calculations that reference deleted fields
            if (
              employeeDeductions.EmployeePF &&
              Array.isArray(employeeDeductions.EmployeePF.Calculations)
            ) {
              employeeDeductions.EmployeePF.Calculations =
                employeeDeductions.EmployeePF.Calculations.filter((calc) =>
                  currentFieldNames.includes(calc.name),
                );
            }

            if (
              employeeDeductions.EmployeeESI &&
              Array.isArray(employeeDeductions.EmployeeESI.Calculations)
            ) {
              employeeDeductions.EmployeeESI.Calculations =
                employeeDeductions.EmployeeESI.Calculations.filter((calc) =>
                  currentFieldNames.includes(calc.name),
                );
            }

            if (
              employeeDeductions.VoluntaryPF &&
              Array.isArray(employeeDeductions.VoluntaryPF.Calculations)
            ) {
              employeeDeductions.VoluntaryPF.Calculations =
                employeeDeductions.VoluntaryPF.Calculations.filter((calc) =>
                  currentFieldNames.includes(calc.name),
                );
            }

            // Add to payload
            payload.employeeDeductions = employeeDeductions;
          }
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/salarySetting/${
            this.category.id
          }`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) throw new Error("Failed to save changes");
        await this.fetchData();

        this.isEditing = false;
        this.snackbarText = "Changes saved successfully";
        this.snackbarColor = "success";
        this.snackbar = true;
      } catch (error) {
        console.error("Error saving changes:", error);
        this.snackbarText = "Failed to save changes";
        this.snackbarColor = "error";
        this.snackbar = true;
      }
    },

    // deleteField(index) {
    //   if (this.fields[index].name === "Basic Pay") return;
    //   const deletedFieldName = this.fields[index].name;
    //   this.fields = this.fields.filter((_, i) => i !== index);
    //   const matchingDefaultField = this.defaultFields.find(
    //     (field) => field.name === deletedFieldName
    //   );
    //   if (matchingDefaultField) {
    //     this.availableDefaultFields.push({ ...matchingDefaultField });
    //   }
    // },

    getPrefix(type) {
      return type === "Percentage" ? "%" : "₹";
    },

    getPlaceholder(type) {
      return type === "Percentage" ? "Enter percentage" : "Enter amount";
    },

    startEdit() {
      this.isEditing = true;
    },

    cancelEdit() {
      this.isEditing = false;
      this.fetchData().then(() => {
        this.initializeAvailableFields();
      });
    },
  },
};
</script>

<style scoped>
.earnings-manager {
  display: flex;
  flex-direction: column;
}

.sticky-header {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  border-bottom: 1px solid #e0e0e0;
}

.scroll-content {
  flex-grow: 1;
  max-height: calc(75vh - 180px);
  overflow-y: auto;
}

.sticky-footer {
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 1;
  border-top: 1px solid #e0e0e0;
}

.v-card .v-card-title {
  line-height: 1.6;
  margin-bottom: 10px;
  font-weight: bold;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-content {
  display: flex;
  flex: 1;
}

.type-select {
  width: 160px;
}

.value-input {
  width: 150px;
}

.action-button {
  margin-left: 4px;
}

:deep(.v-btn) {
  text-transform: none;
  border-radius: 4px;
}

:deep(.v-field__input) {
  padding-top: 6px;
  padding-bottom: 6px;
}

:deep(.v-text-field input[type="number"]) {
  -moz-appearance: textfield;
}

:deep(.v-text-field input[type="number"]::-webkit-outer-spin-button),
:deep(.v-text-field input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
</style>
