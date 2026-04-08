<template>
  <v-card class="incentive-configuration">
    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="2000" location="top">
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
          <h3 class="text-h6">Incentive Configuration</h3>
          <div class="d-flex">
            <v-btn v-if="!isEditing" color="black" @click="startEditing">
              Edit
            </v-btn>
            <template v-else>
              <v-btn color="black" class="mr-2" @click="saveConfiguration"> Save </v-btn>
              <v-btn color="black" @click="cancelEdit"> Cancel </v-btn>
            </template>
          </div>
        </div>
      </v-card-text>
    </div>

    <div class="scroll-content">
      <v-card-text>
        <div class="fields-container">
          <div class="form-grid">
            <!-- Incentive Type -->
            <div class="form-group">
              <label>Incentive Type</label>
              <div class="select-container">
                <select v-model="incentiveConfig.reason" class="form-control" :disabled="!isEditing">
                  <option value="" disabled selected>Select incentive type</option>
                  <option v-for="type in incentiveTypes" :key="type" :value="type">{{ type }}</option>
                  <option value="add_new">+ Add New Incentive Type</option>
                </select>
                <span class="select-arrow">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#555" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </span>
              </div>
            </div>

            <!-- Incentive Amount Type -->
            <div class="form-group">
              <label>Amount Type</label>
              <div class="select-container">
                <select v-model="incentiveConfig.type" class="form-control" :disabled="!isEditing">
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
                <span class="select-arrow">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#555" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </span>
              </div>
            </div>

            <!-- Within CTC -->
            <div class="form-group">
              <label>Within CTC</label>
              <div class="toggle-switch-container">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="incentiveConfig.withinCTC" :disabled="!isEditing">
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">{{ incentiveConfig.withinCTC ? 'Yes' : 'No' }}</span>
                </label>
              </div>
            </div>

            <!-- Value -->
            <div class="form-group">
              <label>Value</label>
              <div class="input-with-icon">
                <span class="prefix-icon">{{ incentiveConfig.type === 'fixed' ? '₹' : '%' }}</span>
                <input
                  type="text"
                  :placeholder="incentiveConfig.type === 'fixed' ? 'Enter amount' : 'Enter percentage'"
                  v-model="incentiveConfig.value"
                  class="form-control with-prefix"
                  :disabled="!isEditing"
                >
              </div>
            </div>

            <!-- Frequency -->
            <div class="form-group">
              <label>Frequency</label>
              <div class="select-container">
                <select v-model="incentiveConfig.frequency" class="form-control" :disabled="!isEditing">
                  <option value="" disabled selected>Select frequency</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="half-yearly">Half Yearly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <span class="select-arrow">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#555" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </span>
              </div>
            </div>

            <!-- Payment Date -->
            <div class="form-group payment-date">
              <label>Payment Date</label>
              <div class="select-container">
                <select v-model="incentiveConfig.paymentDateType" class="form-control" :disabled="!isEditing">
                  <option value="specific">Specific Date</option>
                  <option value="salary">Salary Date</option>
                </select>
                <span class="select-arrow">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#555" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </span>
              </div>

              <input
                type="date"
                v-model="incentiveConfig.specificDate"
                v-if="incentiveConfig.paymentDateType === 'specific'"
                class="form-control date-input"
                :disabled="!isEditing"
              >
            </div>
          </div>
        </div>
      </v-card-text>
    </div>

    <!-- Add Incentive Type Dialog -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>Add New Incentive Type</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newIncentiveType"
            label="Incentive Type Name"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black" variant="contained" @click="addIncentiveType" class="white--text">
            Add
          </v-btn>
          <v-btn color="black" variant="outlined" @click="closeDialog">
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
  name: "IncentiveConfiguration",
  props: {
    category: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      token: authService.getToken(),
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      isEditing: false,
      showDialog: false,
      newIncentiveType: "",
      incentiveTypes: [
        "Performance Incentive",
        "Sales Incentive",
        "Quarterly Incentive",
        "Annual Incentive",
        "Spot Bonus"
      ],
      incentiveConfig: {
        reason: "",
        type: "fixed",
        withinCTC: true,
        value: "",
        frequency: "",
        paymentDateType: "specific",
        specificDate: new Date().toISOString().split('T')[0]
      },
      originalConfig: {}
    };
  },
  computed: {
    isSettingWiseIncentive() {
      return !!this.category?.id; 
    }
  },
  created() {
    this.fetchIncentiveConfiguration();
  },
  watch: {
    'incentiveConfig.reason'(newVal) {
      if (newVal === "add_new") {
        this.showDialog = true;
        this.incentiveConfig.reason = "";
      }
    }
  },
  methods: {
    async fetchIncentiveConfiguration() {
      try {
        const categoryId = this.category?.id;
        if (!categoryId) {
          console.error("Category ID is required");
          this.showSnackbar("Invalid category configuration", "error");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/salarySetting/${categoryId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const { data } = await response.json();

        if (data && data.incentiveConfig) {
          const incentiveData = data.incentiveConfig;

          this.incentiveConfig = {
            reason: incentiveData.reason || "",
            type: incentiveData.type || "fixed",
            withinCTC: incentiveData.withinCTC === "yes",
            value: incentiveData.value || "",
            frequency: incentiveData.frequency || "",
            paymentDateType: incentiveData.paymentDate === "salary_date" ? "salary" : "specific",
            specificDate: incentiveData.paymentDate !== "salary_date" ? incentiveData.paymentDate : new Date().toISOString().split('T')[0]
          };

          this.originalConfig = JSON.parse(JSON.stringify(this.incentiveConfig));

          if (incentiveData.type && !this.incentiveTypes.includes(incentiveData.reason)) {
            this.incentiveTypes.push(incentiveData.reason);
          }
        }
      } catch (error) {
        console.error("Error fetching incentive configuration:", error);
        this.showSnackbar("Failed to fetch incentive configuration", "error");
      }
    },

    async saveConfiguration() {
      // Basic validation
      if (!this.incentiveConfig.reason || !this.incentiveConfig.value || !this.incentiveConfig.frequency) {
        this.showSnackbar('Please fill all required fields', 'error');
        return;
      }

      try {
        const categoryId = this.category?.id;
        if (!categoryId) {
          console.error("Category ID is required");
          this.showSnackbar("Invalid category configuration", "error");
          return;
        }

        const payload = {
          incentiveConfig: {
            reason: this.incentiveConfig.reason,
            type: this.incentiveConfig.type,
            withinCTC: this.incentiveConfig.withinCTC ? "yes" : "no",
            value: this.incentiveConfig.value,
            frequency: this.incentiveConfig.frequency,
            paymentDate: this.incentiveConfig.paymentDateType === "salary" ? "salary_date" : this.incentiveConfig.specificDate
          }
        };

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/salarySetting/${categoryId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          this.isEditing = false;
          this.originalConfig = JSON.parse(JSON.stringify(this.incentiveConfig));
          this.showSnackbar("Incentive configuration saved successfully", "success");
        } else {
          throw new Error("Failed to save incentive configuration");
        }
      } catch (error) {
        console.error("Error:", error);
        this.showSnackbar("Failed to save incentive configuration", "error");
      }
    },

    addIncentiveType() {
      if (this.newIncentiveType.trim()) {
        this.incentiveTypes.push(this.newIncentiveType.trim());
        this.incentiveConfig.reason = this.newIncentiveType.trim();
        this.newIncentiveType = "";
        this.showDialog = false;
      }
    },

    closeDialog() {
      this.showDialog = false;
      this.newIncentiveType = "";
    },

    startEditing() {
      this.isEditing = true;
    },

    cancelEdit() {
      this.incentiveConfig = JSON.parse(JSON.stringify(this.originalConfig));
      this.isEditing = false;
      this.showSnackbar("Changes discarded", "info");
    },

    showSnackbar(text, color) {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    }
  }
};
</script>

<style scoped>
.incentive-configuration {

  max-width: 1000px;
  margin: 0 auto;
  color: #333;
}

.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  padding-top: 16px;
  border-bottom: 1px solid #eee;
}

.scroll-content {
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  padding: 0 16px;
}

.fields-container {
  padding: 16px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.payment-date {
  grid-column: span 2;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.form-control {
  height: 42px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.15s;
  width: 100%;
}

.form-control:focus {
  border-color: #4d90fe;
  outline: none;
  box-shadow: 0 0 0 2px rgba(77, 144, 254, 0.2);
}

.select-container {
  position: relative;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Toggle Switch for Within CTC */
.toggle-switch-container {
  display: flex;
  align-items: center;
  height: 42px;
}

.toggle-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: auto;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background-color: #ccc;
  border-radius: 24px;
  transition: .4s;
  margin-right: 10px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

input:checked + .toggle-slider {
  background-color: #4d90fe;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.toggle-text {
  font-size: 14px;
  color: #555;
}

/* Input with prefix icon */
.input-with-icon {
  position: relative;
}

.prefix-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.form-control.with-prefix {
  padding-left: 30px;
}

/* Date input styling */
.date-input {
  margin-top: 8px;
}
</style>
