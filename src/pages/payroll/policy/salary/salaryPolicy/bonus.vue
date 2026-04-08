<template>
  <v-card flat class="additional-salary px-0">
    <v-card-text class="px-0">
      <div class="d-flex justify-space-between align-center mb-6">
        <h3 class="text-h5">Additional Salary Conditions</h3>
        <v-btn color="black" @click="saveTemplate" :loading="saving">
          Save Template
        </v-btn>
      </div>

      <!-- ESI Calculation -->
      <div class="mb-8">
        <div class="d-flex align-center mb-4">
          <v-icon color="primary" class="mr-2">mdi-currency-usd</v-icon>
          <span class="text-h6">ESI Calculation</span>
        </div>
        <div class="d-flex align-center">
          <span class="text-body-1 grey--text text--darken-1">
            ESI is applicable only for employees with a monthly salary below
          </span>
          <v-text-field
            v-model="formData.esiLimit"
            density="compact"
            variant="outlined"
            class="ml-2"
            style="max-width: 100px"
            hide-details
          ></v-text-field>
        </div>
      </div>

      <!-- Bonus Calculation -->
      <div class="mb-8">
        <div class="d-flex align-center mb-4">
          <v-icon color="success" class="mr-2">mdi-percent</v-icon>
          <span class="text-h6">Bonus Calculation</span>
        </div>
        <v-row class="ma-0">
          <v-col cols="12" sm="4" md="4" class="pa-2">
      <div class="d-flex align-center mb-4">
        <v-icon color="success" class="mr-2">mdi-calendar-clock</v-icon>
        <span class="text-h6">Bonus Period</span>
      </div>
      <v-select
        v-model="formData.bonusPeriod"
        label="Bonus Period"
        :items="periods"
        variant="outlined"
        density="comfortable"
        hide-details
      ></v-select>
    </v-col>

    <v-col cols="12" sm="4" md="4" class="pa-2">
      <div class="d-flex align-center mb-4">
        <v-icon color="success" class="mr-2">mdi-percent</v-icon>
        <span class="text-h6">Bonus Percentage</span>
      </div>
      <v-text-field
        v-model="formData.bonusPercentage"
        label="Bonus Percentage"
        type="number"
        variant="outlined"
        density="comfortable"
        hide-details
      ></v-text-field>
    </v-col>

    <v-col cols="12" sm="4" md="4" class="pa-2">
      <div class="d-flex align-center mb-4">
        <v-icon color="info" class="mr-2">mdi-calendar</v-icon>
        <span class="text-h6">Bonus Date</span>
      </div>
      <v-text-field
        v-model="formData.bonusDate"
        label="Bonus Date"
        type="date"
        variant="outlined"
        density="comfortable"
        hide-details
      ></v-text-field>
    </v-col>
        </v-row>
      </div>

      <!-- Gratuity Condition -->
      <div>
        <div class="d-flex align-center mb-4">
          <v-icon color="purple" class="mr-2">mdi-clock-outline</v-icon>
          <span class="text-h6">Gratuity Condition</span>
        </div>
        <div class="d-flex align-center">
          <span class="text-body-1 grey--text text--darken-1">
            Gratuity is applicable for employees who have worked for at least
          </span>
          <v-text-field
            v-model="formData.gratuityYears"
            density="compact"
            variant="outlined"
            class="mx-2"
            style="max-width: 80px"
            hide-details
          ></v-text-field>
          <span class="text-body-1 grey--text text--darken-1">
            years in the company
          </span>
        </div>
      </div>
    </v-card-text>

    <!-- Success Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2000" location="top">
      {{ snackbarText }}
    </v-snackbar>
  </v-card>
</template>

<script>
export default {
  name: "BonusGratuity",
  data() {
    return {
      saving: false,
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
      formData: {
        esiLimit: "21000",
        bonusPeriod: "",
        bonusPercentage: "",
        bonusDate: '',
        gratuityYears: "4",
      },
      periods: ["Yearly"],
    };
  },
  methods: {
    async saveTemplate() {
      try {
        this.saving = true;

        // Validate form data
        if (!this.formData.bonusPeriod || !this.formData.bonusPercentage || !this.formData.bonusDate) {
          this.showError("Please fill in all required fields");
          return;
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Emit save event with form data
        this.$emit("save-template", {
          type: "bonus-gratuity",
          data: { ...this.formData },
        });

        this.showSuccess("Template saved successfully");

        // Emit an event to notify the parent component to navigate back
        this.$emit("template-saved");
      } catch (error) {
        this.showError("Failed to save template");
        console.error("Save template error:", error);
      } finally {
        this.saving = false;
      }
    },

    showSuccess(message) {
      this.snackbarText = message;
      this.snackbarColor = "success";
      this.snackbar = true;
    },

    showError(message) {
      this.snackbarText = message;
      this.snackbarColor = "error";
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.additional-salary {
  width: 100%;
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-text-field .v-input__details) {
  display: none;
}

.text-h6 {
  font-size: 1.1rem;
  font-weight: 500;
}

:deep(.v-card-text) {
  padding-left: 0;
  padding-right: 0;
}

:deep(.v-btn) {
  text-transform: none;
}
</style>
