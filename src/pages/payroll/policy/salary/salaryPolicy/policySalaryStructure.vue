<template>
  <v-card flat class="salary-structure-manager">
    <div class="sticky-header">
      <v-card-text>
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6">Earnings</h3>
          <div class="d-flex">
            <!-- <v-btn v-if="!isEditing" color="black" @click="startEdit">
              Edit
            </v-btn>
            <template v-else>
              <v-btn color="black" class="mr-2" @click="saveEdit"> Save </v-btn>
              <v-btn color="black" @click="cancelEdit"> Cancel </v-btn>
            </template> -->
          </div>
        </div>
      </v-card-text>
    </div>

    <div class="scroll-content">
      <v-card-text>
        <div class="fields-container">
          <v-row
            v-for="(field, index) in earningsFields"
            :key="index"
            class="field-row mb-4"
          >
            <v-col cols="6">
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

            <v-col cols="6">
              <v-select
                v-model="field.type"
                :items="earningsTypes"
                label="Type"
                variant="outlined"
                density="comfortable"
                hide-details
                class="ml-4"
                :disabled="!isEditing"
              ></v-select>
            </v-col>

            <!-- <v-col cols="1" class="d-flex align-center">
              <template v-if="isEditing">
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  :color="field.name === 'Basic Pay' ? 'grey' : 'black'"
                  class="action-button"
                  @click="deleteField(index)"
                  :disabled="
                    ['BasicPay', 'HRA', 'Dearness Allowance'].includes(field.name)
                  "
                ></v-btn>
              </template>
            </v-col> -->
          </v-row>
        </div>

        <!-- <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn color="black" class="px-4 mt-4" v-bind="props">
              <v-icon start>mdi-plus</v-icon>
              Add Field
            </v-btn>
          </template>
          <v-list style="max-height: 200px; overflow-y: auto">
            <v-list-item
              v-for="field in availableDefaultFields"
              :key="field.name"
              @click="addDefaultField(field)"
            >
              <v-list-item-title>{{ field.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu> -->
      </v-card-text>
       <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="2000" location="top">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    </div>
  </v-card>
</template>

<script>
import { authService } from "@/services/authService";
export default {
  name: "PolicySalaryStructure",
  props: {
    category: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      defaultFields: [
        { name: "HRA", type: "On Attendance", value: 0 },
        { name: "Dearness Allowance", type: "On Attendance", value: 0 },
        { name: "Accomodation and Food", type: "On Attendance", value: 0 },
        // { name: "Bonus and Incentives", type: "On Attendance", value: 0 },
        { name: "Cash Allowance", type: "On Attendance", value: 0 },
        { name: "Conveyance Allowance", type: "On Attendance", value: 0 },
        {
          name: "Children Education Allowance",
          type: "On Attendance",
          value: 0,
        },
        { name: "Distance Allowance", type: "On Attendance", value: 0 },
        { name: "Transport Allowance", type: "On Attendance", value: 0 },
      ],
      token: authService.getToken(),
      dialog: false,
      earningsTypes: ["On Attendance", "Flat Rate"],
      newField: {
        name: "",
        type: "On Attendance",
      },
      earningsFields: [],
      isEditing: false,
      availableDefaultFields: [],
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
    };
  },
  created() {
    // Fetch data when component is created
    this.fetchData();
  },

  methods: {
    initializeAvailableFields() {
      // Filter out fields that are already in earningsFields
      this.availableDefaultFields = this.defaultFields.filter(
        (defaultField) =>
          !this.earningsFields.some(
            (visibleField) => visibleField.name === defaultField.name,
          ),
      );
    },

    addDefaultField(field) {
      const newField = {
        ...field,
        label: field.name,
        isEditing: true,
        originalData: null,
      };
      this.earningsFields.push(newField);
      // Update available fields list
      this.availableDefaultFields = this.availableDefaultFields.filter(
        (f) => f.name !== field.name,
      );
      this.startEdit();
    },

    deleteField(index) {
      const nonDeletableFields = ["Basic Pay", "HRA", "Dearness Allowance"];

      // Don't allow deletion of non-deletable fields
      if (nonDeletableFields.includes(this.earningsFields[index].name)) return;

      // Store the name of the field being deleted
      const deletedFieldName = this.earningsFields[index].name;

      // Remove the field from earningsFields array
      this.earningsFields = this.earningsFields.filter((_, i) => i !== index);

      // Check if the deleted field was one of the default fields
      const matchingDefaultField = this.defaultFields.find(
        (field) => field.name === deletedFieldName,
      );

      // If it was a default field, add it back to available options
      if (matchingDefaultField) {
        this.availableDefaultFields.push({ ...matchingDefaultField });
        // Sort available fields to maintain original order
        this.availableDefaultFields.sort(
          (a, b) =>
            this.defaultFields.findIndex((df) => df.name === a.name) -
            this.defaultFields.findIndex((df) => df.name === b.name),
        );
      }
    },

    saveNewField() {
      if (this.newField.name) {
        this.earningsFields.push({
          name: this.newField.name,
          label: this.newField.name,
          type: this.newField.type,
          isEditing: false,
          originalData: null,
        });
        // Update available fields in case the new field name matches a default field
        this.initializeAvailableFields();
        this.dialog = false;
        this.newField = {
          name: "",
          type: "On Attendance",
        };
      }
    },
    async fetchData() {
      try {
        const fields = ["deductions", "allowances", "id"];

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
        const allowances = data.data[0]?.allowances || [];
        this.earningsFields = allowances.map((item) => ({
          name: item.name,
          label: item.name,
          type: item.calculation,
          isEditing: false,
          originalData: null,
        }));
        this.initializeAvailableFields();
        this.apiData = data.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.showSnackbar("Failed to fetch salary setting", "error")
      }
    },

    // async fetchData() {
    //   try {
    //     const fields = [
    //       "salarySettings.employeesi",
    //       "salarySettings.employerpf",
    //       "configName",
    //       "id",
    //       "salarySettings.basicPay",
    //       "salarySettings.earnings",
    //       "salarySettings.deductions",
    //       "salarySettings.employerEsi",
    //       "salarySettings.employeePf",
    //       "salarySettings.employerContribution",
    //       "salarySettings.employeeDeductions",
    //       "salarySettings.employersContributions",
    //       "salarySettings.advancedMode",
    //       "salarySettings.dedutions",
    //       "salarySettings.allowances",
    //       "salarySettings.deduction",
    //       "salarySettings.professionalTax",
    //       "salarySettings.LWF.state",
    //       "salarySettings.LWF.stateTaxRules",
    //       "salarySettings.professionalTax.state",
    //       "salarySettings.professionalTax.stateTaxRules",
    //       "salarySettings.LWF",
    //       "salarySettings.id",
    //       "tenant.tenantId",
    //       "tenant.tenantName",
    //     ];

    //     const queryString = [
    //       ...fields.map((field) => `fields[]=${field}`),
    //       `filter[id][_eq]=${this.template.id}`,
    //     ].join("&");

    //     const response = await fetch(
    //       `${import.meta.env.VITE_API_URL}/items/config?${queryString}`,
    //       {
    //         method: "GET",
    //         headers: {
    //           Authorization: `Bearer ${this.token}`,
    //           "Content-Type": "application/json",
    //         },
    //       }
    //     );
    //     const data = await response.json();
    //     const allowances = data.data[0]?.salarySettings?.allowances || [];
    //     this.earningsFields = allowances.map((item) => ({
    //       name: item.name,
    //       label: item.name,
    //       type: item.calculation,
    //       isEditing: false,
    //       originalData: null,
    //     }));
    //     this.initializeAvailableFields();
    //     this.apiData = data.data;
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //   }
    // },
    showSnackbar(text, color) {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    },
    startEdit() {
      this.isEditing = true;
    },
    async saveEdit() {
      try {
        // Map allowances to the required format for PATCH request
        const allowancesArray = this.earningsFields.map((field) => ({
          name: field.name,
          calculation: field.type,
        }));

        // Extract the ID from the fetched data
        const settings = this.apiData[0]?.id;

        // Make the PATCH request to update the data
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
            body: JSON.stringify({
              allowances: allowancesArray,
              id: settings, // Include the ID in the payload
            }),
          },
        );

        if (response.ok) {
          console.log("Data updated successfully!");
          this.showSnackbar("Changes saved successfully", "success");
          this.isEditing = false; // Exit editing mode
        } else {
          const errorData = await response.json();
          console.error("Error updating data:", errorData);
          this.showSnackbar("Failed to save changes", "error");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },

    cancelEdit() {
      this.isEditing = false;
      this.fetchData();
    },
  },
};
</script>

<style scoped>
.salary-structure-manager {
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
  overflow-y: auto;
  max-height: calc(75vh - 180px);
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

.fields-container {
  max-width: 800px;
}

.field-row {
  display: flex;
  align-items: center;
}

.field-content {
  display: flex;
  flex: 1;
}

.type-select {
  width: 200px;
}

.action-button {
  margin-left: 4px;
}

:deep(.v-btn) {
  text-transform: none;
  border-radius: 4px;
}
</style>
