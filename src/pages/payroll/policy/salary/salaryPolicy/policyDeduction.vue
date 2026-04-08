<template>
  <v-card class="deduction-manager">
    <!-- Snackbar for notifications -->
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
    <div class="sticky-header">
      <v-card-text>
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6">Deduction</h3>
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
          <div v-if="earningsFields.length === 0" class="text-center pa-4">
            <p class="text-body-1 text-grey-darken-1">
              No data available. You can choose deductions from the Add Field
              button.
            </p>
          </div>
          <div
            v-else
            v-for="(field, index) in earningsFields"
            :key="index"
            class="field-row mb-4"
          >
            <v-row class="align-center">
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

              <!-- <v-col cols="4" v-if="isEditing" class="d-flex justify-end">
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  :color="field.name === 'Basic Pay' ? 'grey' : 'black'"
                  class="action-button"
                  @click="deleteField(index)"
                  :disabled="field.name === 'Basic Pay'"
                ></v-btn>
              </v-col> -->
            </v-row>
          </div>
        </div>
        <!-- <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              color="black"
              class="px-4 mt-4"
              v-bind="props"
            >
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
    </div>

    <!-- Add Field Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>Add New Field</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newField.name"
            label="Field Name"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
          <v-select
            v-model="newField.type"
            :items="earningsTypes"
            label="Type"
            variant="outlined"
            density="comfortable"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            style="background-color: black"
            color="white"
            variant="contained"
            @click="saveNewField"
            class="white--text"
          >
            Save
          </v-btn>
          <v-btn
            style="background-color: black"
            color="white"
            variant="outlined"
            @click="dialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { authService } from "@/services/authService";
export default {
  name: "PolicyDeduction",
  props: {
    category: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      defaultFields: [
        { name: "Benevolent Fund", type: "On Attendance", value: 0 },
        { name: "Term Insurance", type: "On Attendance", value: 0 },
        {
          name: "Group Accidental Policy & WC",
          type: "On Attendance",
          value: 0,
        },
        { name: "Gratuity", type: "On Attendance", value: 0 },
        { name: "Statutory Bonus Deduction", type: "On Attendance", value: 0 },
        { name: "Security Deposit", type: "On Attendance", value: 0 },
        { name: "Uniform Deduction", type: "On Attendance", value: 0 },
        { name: "Transport Charges", type: "On Attendance", value: 0 },
        { name: "Miscellaneous Deduction", type: "On Attendance", value: 0 },
        { name: "Food Deduction", type: "On Attendance", value: 0 },
        { name: "Medical Insurance Premium", type: "On Attendance", value: 0 },
        { name: "Labour Welfare Fund", type: "On Attendance", value: 0 },
        { name: "ProfessionalTax", type: "On Attendance", value: 0 },
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
    this.initializeAvailableFields();
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
    },

    deleteField(index) {
      if (this.earningsFields[index].name !== "Basic Pay") {
        // Add the deleted field back to available fields if it was a default field
        const deletedField = this.earningsFields[index];
        const isDefaultField = this.defaultFields.some(
          (df) => df.name === deletedField.name,
        );

        if (isDefaultField) {
          const fieldToAdd = this.defaultFields.find(
            (df) => df.name === deletedField.name,
          );
          if (fieldToAdd) {
            this.availableDefaultFields.push(fieldToAdd);
            // Sort available fields to maintain original order
            this.availableDefaultFields.sort(
              (a, b) =>
                this.defaultFields.findIndex((df) => df.name === a.name) -
                this.defaultFields.findIndex((df) => df.name === b.name),
            );
          }
        }

        this.earningsFields.splice(index, 1);
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
        const fields = ["deduction", "id"];

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
        const deductions = data.data[0]?.deduction || [];
        this.earningsFields = deductions.map((item) => ({
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
        this.showSnackbar("Failed to fetch  data", "error");
      }
    },
    showSnackbar(text, color) {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    },
    startEdit() {
      this.isEditing = true;
    },
    async saveEdit() {
      // Removed index parameter since it's not needed
      try {
        const deductionsArray = this.earningsFields.map((field) => ({
          name: field.name,
          calculation: field.type,
        }));

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/salarySetting/${this.category.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              deduction: deductionsArray, // Removed .at
            }),
          },
        );

        if (response.ok) {
          this.isEditing = false; // Changed to update overall editing state
        }
        this.showSnackbar("Changes saved successfully");
      } catch (error) {
        console.error("Error:", error);
        this.showSnackbar("Failed to save changes", "error");
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
.deduction-manager {
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
  gap: 8px;
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

.text-center {
  text-align: center;
}

.pa-4 {
  padding: 16px;
}
</style>
