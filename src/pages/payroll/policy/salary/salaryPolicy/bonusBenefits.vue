<template>
  <v-card class="bonus-configuration">
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
          <h3 class="text-h6">Bonus Configuration</h3>
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
            <!-- Bonus Type -->
            <div class="form-group">
              <label>Bonus Type</label>
              <div class="select-container">
                <select v-model="bonusConfig.reason" class="form-control" :disabled="!isEditing">
                  <option value="" disabled selected>Select bonus type</option>
                  <option v-for="type in bonusTypes" :key="type" :value="type">{{ type }}</option>
                  <option value="add_new">+ Add New Bonus Type</option>
                </select>
                <span class="select-arrow">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#555" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </span>
              </div>
            </div>

            <!-- Bonus Amount Type -->
            <div class="form-group">
              <label>Amount Type</label>
              <div class="select-container">
                <select v-model="bonusConfig.type" class="form-control" :disabled="!isEditing">
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
                  <input type="checkbox" v-model="bonusConfig.withinCTC" :disabled="!isEditing">
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">{{ bonusConfig.withinCTC ? 'Yes' : 'No' }}</span>
                </label>
              </div>
            </div>

            <!-- Value -->
            <div class="form-group">
              <label>Value</label>
              <div class="input-with-icon">
                <span class="prefix-icon">{{ bonusConfig.type === 'fixed' ? '₹' : '%' }}</span>
                <input
                  type="text"
                  :placeholder="bonusConfig.type === 'fixed' ? 'Enter amount' : 'Enter percentage'"
                  v-model="bonusConfig.value"
                  class="form-control with-prefix"
                  :disabled="!isEditing"
                >
              </div>
            </div>

            <!-- Frequency -->
            <div class="form-group">
              <label>Frequency</label>
              <div class="select-container">
                <select v-model="bonusConfig.frequency" class="form-control" :disabled="!isEditing">
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
                <select v-model="bonusConfig.paymentDateType" class="form-control" :disabled="!isEditing">
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
                v-model="bonusConfig.specificDate"
                v-if="bonusConfig.paymentDateType === 'specific'"
                class="form-control date-input"
                :disabled="!isEditing"
              >
            </div>
          </div>
        </div>
      </v-card-text>
    </div>

    <!-- Add Bonus Type Dialog -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>Add New Bonus Type</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newBonusType"
            label="Bonus Type Name"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black" variant="contained" @click="addBonusType" class="white--text">
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
  name: "BonusConfiguration",
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
      newBonusType: "",
      bonusTypes: [
        "Performance Bonus",
        "Festival Bonus",
        "Annual Bonus",
        "Retention Bonus",
        "Signing Bonus"
      ],
      bonusConfig: {
        reason: "",
        type: "",
        withinCTC: false,
        value: "",
        frequency: "",
        paymentDateType: "specific",
        specificDate: new Date().toISOString().split('T')[0]
      }
    };
  },
  created() {
    this.fetchBonusConfiguration();
  },
  watch: {
    'bonusConfig.reason'(newVal) {
      if (newVal === "add_new") {
        this.showDialog = true;
        this.bonusConfig.reason = "";
      }
    }
  },
  methods: {
    async fetchBonusConfiguration() {
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

        if (data && data.bonusConfig) {
          const bonusData = data.bonusConfig;

          this.bonusConfig = {
            reason: bonusData.reason || "",
            type: bonusData.amountType || "",
            withinCTC: bonusData.withinCTC === true,
            value: bonusData.value || "",
            frequency: bonusData.frequency || "",
            paymentDateType: bonusData.paymentDate === "salary_date" ? "salary" : "specific",
            specificDate: bonusData.specificDate || new Date().toISOString().split('T')[0]
          };

          if (bonusData.amountType && !this.bonusTypes.includes(bonusData.amountType)) {
            this.bonusTypes.push(bonusData.amountType);
          }
        }
      } catch (error) {
        console.error("Error fetching bonus configuration:", error);
        this.showSnackbar("Failed to fetch bonus configuration", "error");
      }
    },

    async saveConfiguration() {
      try {
        const categoryId = this.category?.id;
        if (!categoryId) {
          console.error("Category ID is required");
          this.showSnackbar("Invalid category configuration", "error");
          return;
        }

        const payload = {
          bonusConfig: {
            amountType: this.bonusConfig.type,
            withinCTC: this.bonusConfig.withinCTC,
            value: this.bonusConfig.value,
            frequency: this.bonusConfig.frequency,
            paymentDate: this.bonusConfig.paymentDateType === "salary" ? "salary_date" : "specific_date",
            reason: this.bonusConfig.reason,
            ...(this.bonusConfig.paymentDateType === "specific" && {
              specificDate: this.bonusConfig.specificDate
            })
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
          this.showSnackbar("Bonus configuration saved successfully", "success");
        } else {
          throw new Error("Failed to save bonus configuration");
        }
      } catch (error) {
        console.error("Error:", error);
        this.showSnackbar("Failed to save bonus configuration", "error");
      }
    },

    addBonusType() {
      if (this.newBonusType.trim()) {
        this.bonusTypes.push(this.newBonusType.trim());
        this.bonusConfig.reason = this.newBonusType.trim();
        this.newBonusType = "";
        this.showDialog = false;
      }
    },

    closeDialog() {
      this.showDialog = false;
      this.newBonusType = "";
    },

    startEditing() {
      this.isEditing = true;
    },

    cancelEdit() {
      this.isEditing = false;
      this.fetchBonusConfiguration();
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
.bonus-configuration {
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

/* Add this new style for the edit button */
.btn-edit {
  padding: 0 20px;
  height: 42px;
  background: #4d90fe;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-edit:hover {
  background: #3d80ee;
}

/* Keep all your original styles exactly as they were */
.bonus-configuration {

  max-width: 1000px;
  margin: 0 auto;
  color: #333;
}

.header-section {
  margin-bottom: 24px;
}

h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #222;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.configuration-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 24px;
}

.configuration-form {
  margin-bottom: 24px;
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
  margin-bottom: 8px;
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

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 0 20px;
  height: 42px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #eee;
}

.btn-save, .btn-add {
  padding: 0 20px;
  height: 42px;
  background: #4d90fe;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover, .btn-add:hover {
  background: #3d80ee;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-container {
  position: relative;
  width: 450px;
  max-width: 90%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 24px;
}

.modal-body label {
  display: block;
  margin-bottom: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eee;
}
</style>
