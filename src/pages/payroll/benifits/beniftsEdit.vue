<template>
  <v-window :model-value="activeTab">
    <!-- Bonus Tab Content -->
    <v-window-item value="bonus">
      <!-- Add New Bonus Section -->
      <v-card
        class="mb-8 bonus-form-card"
        elevation="0"
        style="border: 1px solid #e5e7eb; border-radius: 12px"
      >
        <v-card-title
          class="d-flex align-center justify-space-between pa-6"
          style="
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px 12px 0 0;
          "
        >
          <h2
            class="text-h5 font-weight-bold"
            style="color: #1e293b; letter-spacing: -0.025em"
          >
            Add New Bonus
          </h2>
          <BaseButton
            variant="primary"
            size="md"
            :left-icon="Check"
            @click="saveAdhocPayments"
            :loading="isLoading"
            class="ms-2"
          >
            Save Bonus
          </BaseButton>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row class="mb-4">
            <v-col cols="4">
              <v-text-field
                v-model="newBonus.reason"
                label="Reason"
                placeholder="Enter bonus reason"
                variant="outlined"
                density="comfortable"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="newBonus.amount"
                label="Amount"
                prefix="₹"
                type="number"
                variant="outlined"
                density="comfortable"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4">
              <v-textarea
                v-model="newBonus.notes"
                label="Notes"
                placeholder="Add any additional notes..."
                variant="outlined"
                density="comfortable"
                rows="3"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Existing Bonus Records Section -->
      <v-card
        elevation="0"
        class="records-card"
        style="border: 1px solid #e5e7eb; border-radius: 12px"
      >
        <v-card-title
          class="pa-6"
          style="
            border-bottom: 1px solid #e5e7eb;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          "
        >
          <h3 class="text-h6 font-weight-bold" style="color: #374151">
            Existing Bonus Records
          </h3>
        </v-card-title>
        <v-card-text class="pa-6">
          <div
            v-if="bonuses.length === 0"
            class="text-center py-8"
            style="color: #6b7280"
          >
            <v-icon size="48" style="color: #d1d5db" class="mb-3"
              >mdi-inbox</v-icon
            >
            <p class="text-body-1">No bonus records found</p>
          </div>
          <div v-else class="bonus-list">
            <div
              v-for="(bonus, index) in bonuses"
              :key="index"
              class="bonus-item d-flex align-center justify-space-between py-3 px-4 mb-3"
              style="width: 40%"
            >
              <v-chip color="#3b82f6" size="default" class="font-weight-medium">
                {{ bonus.reason }}
              </v-chip>
              <div class="d-flex align-center" style="gap: 12px">
                <v-chip
                  color="#10b981"
                  size="default"
                  class="font-weight-medium"
                >
                  ₹{{ bonus.amount }}
                </v-chip>

                <ActionButton
                  text="Delete"
                  :icon="Trash2"
                  variant="red"
                  size="sm"
                  color="red"
                  @click="
                    () => {
                      selectedIndex = index;
                      deleteType = 'bonus';
                      showDeleteModal = true;
                    }
                  "
                />
              </div>
            </div>
            <div
              class="bonus-item d-flex align-center justify-space-between py-3 px-4 mt-4"
              style="width: 40%; border-top: 1px solid #e5e7eb"
            >
              <strong>Total</strong>
              <v-chip color="#f59e0b" size="default" class="font-weight-bold">
                ₹{{ totalBonus }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-window-item>

    <!-- Incentives Tab Content -->
    <v-window-item value="incentives">
      <!-- Add New Incentive -->
      <v-card
        class="mb-8 bonus-form-card"
        elevation="0"
        style="border: 1px solid #e5e7eb; border-radius: 12px"
      >
        <v-card-title
          class="d-flex align-center justify-space-between pa-6"
          style="
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px 12px 0 0;
          "
        >
          <h2
            class="text-h5 font-weight-bold"
            style="color: #1e293b; letter-spacing: -0.025em"
          >
            Add New Incentive
          </h2>
          <BaseButton
            variant="primary"
            size="md"
            :left-icon="Check"
            @click="saveAdhocPayments"
            :loading="isLoading"
            class="ms-2"
          >
            Save Incentive
          </BaseButton>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row class="mb-4">
            <v-col cols="4">
              <v-text-field
                v-model="newIncentive.reason"
                label="Reason"
                placeholder="Enter incentive reason"
                variant="outlined"
                density="comfortable"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="newIncentive.amount"
                label="Amount"
                prefix="₹"
                type="number"
                variant="outlined"
                density="comfortable"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4">
              <v-textarea
                v-model="newIncentive.notes"
                label="Notes"
                placeholder="Add any additional notes..."
                variant="outlined"
                density="comfortable"
                rows="3"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Existing Incentive Records -->
      <v-card
        elevation="0"
        class="records-card"
        style="border: 1px solid #e5e7eb; border-radius: 12px"
      >
        <v-card-title
          class="pa-6"
          style="
            border-bottom: 1px solid #e5e7eb;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          "
        >
          <h3 class="text-h6 font-weight-bold" style="color: #374151">
            Existing Incentive Records
          </h3>
        </v-card-title>
        <v-card-text class="pa-6">
          <div
            v-if="incentives.length === 0"
            class="text-center py-8"
            style="color: #6b7280"
          >
            <v-icon size="48" style="color: #d1d5db" class="mb-3"
              >mdi-inbox</v-icon
            >
            <p class="text-body-1">No incentive records found</p>
          </div>
          <div v-else class="bonus-list">
            <div
              v-for="(incentive, index) in incentives"
              :key="index"
              class="bonus-item d-flex align-center justify-space-between py-3 px-4 mb-3"
              style="width: 40%"
            >
              <v-chip color="#3b82f6" size="default" class="font-weight-medium">
                {{ incentive.reason }}
              </v-chip>
              <div class="d-flex align-center" style="gap: 12px">
                <v-chip
                  color="#10b981"
                  size="default"
                  class="font-weight-medium"
                >
                  ₹{{ incentive.amount }}
                </v-chip>

                <ActionButton
                  text="Delete"
                  :icon="Trash2"
                  variant="red"
                  size="sm"
                  color="red"
                  @click="
                    () => {
                      selectedIndex = index;
                      deleteType = 'incentive';
                      showDeleteModal = true;
                    }
                  "
                />
              </div>
            </div>
            <div
              class="bonus-item d-flex align-center justify-space-between py-3 px-4 mt-4"
              style="width: 40%; border-top: 1px solid #e5e7eb"
            >
              <strong>Total</strong>
              <v-chip color="#f59e0b" size="default" class="font-weight-bold">
                ₹{{ totalIncentive }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-window-item>

    <!-- Retention Pay Tab Content -->
    <v-window-item value="retention">
      <!-- Add Retention Pay -->
      <v-card
        class="mb-8 bonus-form-card"
        elevation="0"
        style="border: 1px solid #e5e7eb; border-radius: 12px"
      >
        <v-card-title
          class="d-flex align-center justify-space-between pa-6"
          style="
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px 12px 0 0;
          "
        >
          <h2
            class="text-h5 font-weight-bold"
            style="color: #1e293b; letter-spacing: -0.025em"
          >
            Add Retention Pay
          </h2>
          <BaseButton
            variant="primary"
            size="md"
            :left-icon="Check"
            @click="saveAdhocPayments"
            :loading="isLoading"
            class="ms-2"
          >
            Save Retention
          </BaseButton>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row class="mb-4">
            <v-col cols="4">
              <v-text-field
                v-model="newRetention.reason"
                label="Reason"
                placeholder="Enter reason"
                variant="outlined"
                density="comfortable"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="newRetention.amount"
                label="Amount"
                prefix="₹"
                type="number"
                variant="outlined"
                density="comfortable"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4">
              <v-textarea
                v-model="newRetention.notes"
                label="Notes"
                placeholder="Add notes..."
                variant="outlined"
                density="comfortable"
                rows="3"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Existing Retention Pay Records -->
      <v-card
        elevation="0"
        class="records-card"
        style="border: 1px solid #e5e7eb; border-radius: 12px"
      >
        <v-card-title
          class="pa-6"
          style="
            border-bottom: 1px solid #e5e7eb;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          "
        >
          <h3 class="text-h6 font-weight-bold" style="color: #374151">
            Existing Retention Pay Records
          </h3>
        </v-card-title>
        <v-card-text class="pa-6">
          <div
            v-if="retentionPays.length === 0"
            class="text-center py-8"
            style="color: #6b7280"
          >
            <v-icon size="48" style="color: #d1d5db" class="mb-3"
              >mdi-inbox</v-icon
            >
            <p class="text-body-1">No retention pay records found</p>
          </div>
          <div v-else class="bonus-list">
            <div
              v-for="(item, index) in retentionPays"
              :key="index"
              class="bonus-item d-flex align-center justify-space-between py-3 px-4 mb-3"
              style="width: 40%"
            >
              <v-chip color="#3b82f6" size="default" class="font-weight-medium">
                {{ item.reason }}
              </v-chip>
              <div class="d-flex align-center" style="gap: 12px">
                <v-chip
                  color="#10b981"
                  size="default"
                  class="font-weight-medium"
                >
                  ₹{{ item.amount }}
                </v-chip>

                <ActionButton
                  text="Delete"
                  :icon="Trash2"
                  variant="red"
                  size="sm"
                  color="red"
                  @click="
                    () => {
                      selectedIndex = index;
                      deleteType = 'retention';
                      showDeleteModal = true;
                    }
                  "
                />
              </div>
            </div>
            <div
              class="bonus-item d-flex align-center justify-space-between py-3 px-4 mt-4"
              style="width: 40%; border-top: 1px solid #e5e7eb"
            >
              <strong>Total</strong>
              <v-chip color="#f59e0b" size="default" class="font-weight-bold">
                ₹{{ totalRetentionPay }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-window-item>

    <!-- Salary Arrears Tab Content -->
    <v-window-item value="arrears">
      <!-- Add Salary Arrears -->
      <v-card
        class="mb-8 bonus-form-card"
        elevation="0"
        style="border: 1px solid #e5e7eb; border-radius: 12px"
      >
        <v-card-title
          class="d-flex align-center justify-space-between pa-6"
          style="
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px 12px 0 0;
          "
        >
          <h2
            class="text-h5 font-weight-bold"
            style="color: #1e293b; letter-spacing: -0.025em"
          >
            Add Salary Arrears
          </h2>
          <BaseButton
            variant="primary"
            size="md"
            :left-icon="Check"
            @click="saveAdhocPayments"
            :loading="isLoading"
            class="ms-2"
          >
            Save Arrears
          </BaseButton>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row class="mb-4">
            <v-col cols="4">
              <v-text-field
                v-model="newArrears.name"
                label="Reason"
                placeholder="Enter reason"
                variant="outlined"
                density="comfortable"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="newArrears.amount"
                label="Amount"
                prefix="₹"
                type="number"
                variant="outlined"
                density="comfortable"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4">
              <v-textarea
                v-model="newArrears.notes"
                label="Notes"
                placeholder="Add notes..."
                variant="outlined"
                density="comfortable"
                rows="3"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Existing Salary Arrears Records -->
      <v-card
        elevation="0"
        class="records-card"
        style="border: 1px solid #e5e7eb; border-radius: 12px"
      >
        <v-card-title
          class="pa-6"
          style="
            border-bottom: 1px solid #e5e7eb;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          "
        >
          <h3 class="text-h6 font-weight-bold" style="color: #374151">
            Existing Salary Arrears Records
          </h3>
        </v-card-title>
        <v-card-text class="pa-6">
          <div
            v-if="salaryArrears.length === 0"
            class="text-center py-8"
            style="color: #6b7280"
          >
            <v-icon size="48" style="color: #d1d5db" class="mb-3"
              >mdi-inbox</v-icon
            >
            <p class="text-body-1">No salary arrears records found</p>
          </div>
          <div v-else class="bonus-list">
            <div
              v-for="(item, index) in salaryArrears"
              :key="index"
              class="bonus-item d-flex align-center justify-space-between py-3 px-4 mb-3"
              style="width: 40%"
            >
              <v-chip color="#3b82f6" size="default" class="font-weight-medium">
                {{ item.name }}
              </v-chip>
              <div class="d-flex align-center" style="gap: 12px">
                <v-chip
                  color="#10b981"
                  size="default"
                  class="font-weight-medium"
                >
                  ₹{{ item.amount }}
                </v-chip>

                <ActionButton
                  text="Delete"
                  :icon="Trash2"
                  variant="red"
                  size="sm"
                  color="red"
                  @click="
                    () => {
                      selectedIndex = index;
                      deleteType = 'arrears';
                      showDeleteModal = true;
                    }
                  "
                />
              </div>
            </div>
            <div
              class="bonus-item d-flex align-center justify-space-between py-3 px-4 mt-4"
              style="width: 40%; border-top: 1px solid #e5e7eb"
            >
              <strong>Total</strong>
              <v-chip color="#f59e0b" size="default" class="font-weight-bold">
                ₹{{ totalArrears }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-window-item>

    <!-- Deductions Tab Content -->
    <v-window-item value="deductions">
      <!-- Add Deduction -->
      <v-card
        class="mb-8 bonus-form-card"
        elevation="0"
        style="border: 1px solid #e5e7eb; border-radius: 12px"
      >
        <v-card-title
          class="d-flex align-center justify-space-between pa-6"
          style="
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px 12px 0 0;
          "
        >
          <h2
            class="text-h5 font-weight-bold"
            style="color: #1e293b; letter-spacing: -0.025em"
          >
            Add Deduction
          </h2>
          <BaseButton
            variant="primary"
            size="md"
            :left-icon="Check"
            @click="saveAdhocPayments"
            :loading="isLoading"
            class="ms-2"
          >
            Save Deduction
          </BaseButton>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row class="mb-4">
            <v-col cols="4">
              <v-text-field
                v-model="newDeduction.name"
                label="Reason"
                placeholder="Enter reason"
                variant="outlined"
                density="comfortable"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="newDeduction.amount"
                label="Amount"
                prefix="₹"
                type="number"
                variant="outlined"
                density="comfortable"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4">
              <v-textarea
                v-model="newDeduction.notes"
                label="Notes"
                placeholder="Add notes..."
                variant="outlined"
                density="comfortable"
                rows="3"
                class="professional-input"
                style="
                  --v-field-border-color: #d1d5db;
                  --v-field-border-opacity: 1;
                "
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Existing Deduction Records -->
      <v-card
        elevation="0"
        class="records-card"
        style="border: 1px solid #e5e7eb; border-radius: 12px"
      >
        <v-card-title
          class="pa-6"
          style="
            border-bottom: 1px solid #e5e7eb;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          "
        >
          <h3 class="text-h6 font-weight-bold" style="color: #374151">
            Existing Deduction Records
          </h3>
        </v-card-title>
        <v-card-text class="pa-6">
          <div
            v-if="deductions.length === 0"
            class="text-center py-8"
            style="color: #6b7280"
          >
            <v-icon size="48" style="color: #d1d5db" class="mb-3"
              >mdi-inbox</v-icon
            >
            <p class="text-body-1">No deduction records found</p>
          </div>
          <div v-else class="bonus-list">
            <div
              v-for="(item, index) in deductions"
              :key="index"
              class="bonus-item d-flex align-center justify-space-between py-3 px-4 mb-3"
              style="width: 40%"
            >
              <v-chip color="#3b82f6" size="default" class="font-weight-medium">
                {{ item.name }}
              </v-chip>
              <div class="d-flex align-center" style="gap: 12px">
                <v-chip
                  color="#10b981"
                  size="default"
                  class="font-weight-medium"
                >
                  ₹{{ item.amount }}
                </v-chip>

                <ActionButton
                  text="Delete"
                  :icon="Trash2"
                  variant="red"
                  size="sm"
                  color="red"
                  @click="
                    () => {
                      selectedIndex = index;
                      deleteType = 'deduction';
                      showDeleteModal = true;
                    }
                  "
                />
              </div>
            </div>
            <div
              class="bonus-item d-flex align-center justify-space-between py-3 px-4 mt-4"
              style="width: 40%; border-top: 1px solid #e5e7eb"
            >
              <strong>Total</strong>
              <v-chip color="#f59e0b" size="default" class="font-weight-bold">
                ₹{{ totalDeduction }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-window-item>

    <DeleteModal
      v-if="showDeleteModal"
      :show="showDeleteModal"
      title="Confirm Deletion"
      confirmMessage="Are you sure you want to delete?"
      :itemLabel="deleteType"
      :itemName="''"
      cancelText="Cancel"
      confirmText="Delete"
      :deleting="deleting"
      :deletingText="'Deleting...'"
      @close="showDeleteModal = false"
      @confirm="
        () => {
          if (deleteType === 'bonus') deleteBonus(selectedIndex);
          if (deleteType === 'incentive') deleteIncentive(selectedIndex);
          if (deleteType === 'retention') deleteRetention(selectedIndex);
          if (deleteType === 'arrears') deleteArrears(selectedIndex);
          if (deleteType === 'deduction') deleteDeduction(selectedIndex);
          showDeleteModal = false;
        }
      "
    />
  </v-window>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { authService } from "@/services/authService";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { Trash2, Check } from "lucide-vue-next";
import ActionButton from "@/components/common/buttons/ActionButton.vue";
import DeleteModal from "@/components/common/modals/ConfirmDeleteModal.vue";

const token = authService.getToken();
const props = defineProps({
  activeTab: String,
});
const salaryBreakdown = ref(null);
const route = useRoute();
const showDeleteModal = ref(false);
const selectedIndex = ref(null);
const selectedKey = ref(null);
const deleteType = ref("");
const deleting = ref(false);
const totalBonus = ref(0);
const totalIncentive = ref(0);
const totalRetentionPay = ref(0);
const totalArrears = ref(0);
const totalDeduction = ref(0);

const loading = ref(false);
const error = ref("");

const newBonus = ref({
  reason: "",
  amount: "",
  notes: "",
});

const bonuses = ref([]);
const incentives = ref([]);
const newIncentive = ref({
  reason: "",
  amount: null,
  notes: "",
});
// Retention
const retentionPays = ref([]);
const newRetention = ref({ reason: "", amount: null, notes: "" });
const saveRetention = () => {
  retentionPays.value.push({ ...newRetention.value });
  newRetention.value = { reason: "", amount: null, notes: "" };
};

// Salary Arrears
const salaryArrears = ref([]);
const newArrears = ref({ name: "", amount: null, notes: "" });
const saveArrears = () => {
  salaryArrears.value.push({ ...newArrears.value });
  newArrears.value = { reason: "", amount: null, notes: "" };
};

// Deductions
const deductions = ref([]);

const newDeduction = ref({ name: "", amount: null, notes: "" });
const saveDeduction = () => {
  deductions.value.push({ ...newDeduction.value });
  newDeduction.value = { reason: "", amount: null, notes: "" };
};

const saveAdhocPayments = async () => {
  if (!token) {
    console.error("Authentication required. Please login again.");
    error.value = "Authentication required. Please login again.";
    return;
  }

  if (!route.query.id || !route.query.month) {
    console.error("Missing required employee ID or month.");
    error.value = "Employee ID and month are required.";
    return;
  }

  loading.value = true;
  try {
    const [year, month] = route.query.month.split("-");
    const monthKey = month.padStart(2, "0");

    // ---------------- BONUS ----------------
    const bonusEntry =
      newBonus.value.reason && newBonus.value.amount
        ? {
            reason: newBonus.value.reason,
            amount: Number(newBonus.value.amount),
            notes: newBonus.value.notes || "",
          }
        : null;

    const existingBonusMonth =
      salaryBreakdown.value?.bonus?.[year]?.[monthKey] || {};

    const existingBonusTotal = Object.keys(existingBonusMonth)
      .filter((k) => k.startsWith("bonus"))
      .reduce((sum, key) => sum + (existingBonusMonth[key].amount || 0), 0);

    const bonusCount = Object.keys(existingBonusMonth).filter((k) =>
      k.startsWith("bonus"),
    ).length;

    const bonus = {
      ...(salaryBreakdown.value?.bonus || {}),
      ...(bonusEntry && {
        [year]: {
          ...(salaryBreakdown.value?.bonus?.[year] || {}),
          [monthKey]: {
            ...existingBonusMonth,
            [`bonus${bonusCount + 1}`]: bonusEntry,
            totalAmount: existingBonusTotal + bonusEntry.amount,
          },
        },
      }),
    };

    // ---------------- INCENTIVE ----------------
    const incentiveEntry =
      newIncentive.value.reason && newIncentive.value.amount
        ? {
            reason: newIncentive.value.reason,
            amount: Number(newIncentive.value.amount),
            notes: newIncentive.value.notes || "",
          }
        : null;

    const existingIncentiveMonth =
      salaryBreakdown.value?.incentive?.[year]?.[monthKey] || {};

    const existingIncentiveTotal = Object.keys(existingIncentiveMonth)
      .filter((k) => k.startsWith("incentive"))
      .reduce((sum, key) => sum + (existingIncentiveMonth[key].amount || 0), 0);

    const incentiveCount = Object.keys(existingIncentiveMonth).filter((k) =>
      k.startsWith("incentive"),
    ).length;

    const incentive = {
      ...(salaryBreakdown.value?.incentive || {}),
      ...(incentiveEntry && {
        [year]: {
          ...(salaryBreakdown.value?.incentive?.[year] || {}),
          [monthKey]: {
            ...existingIncentiveMonth,
            [`incentive${incentiveCount + 1}`]: incentiveEntry,
            totalAmount: existingIncentiveTotal + incentiveEntry.amount,
          },
        },
      }),
    };

    // ---------------- RETENTION PAY ----------------
    const retentionEntry =
      newRetention.value.reason && newRetention.value.amount
        ? {
            reason: newRetention.value.reason,
            amount: Number(newRetention.value.amount),
            notes: newRetention.value.notes || "",
          }
        : null;

    const existingRetentionMonth =
      salaryBreakdown.value?.retentionPay?.[year]?.[monthKey] || {};

    const existingRetentionTotal = Object.keys(existingRetentionMonth)
      .filter((k) => k.startsWith("retention"))
      .reduce((sum, key) => sum + (existingRetentionMonth[key].amount || 0), 0);

    const retentionCount = Object.keys(existingRetentionMonth).filter((k) =>
      k.startsWith("retention"),
    ).length;

    const retentionPay = {
      ...(salaryBreakdown.value?.retentionPay || {}),
      ...(retentionEntry && {
        [year]: {
          ...(salaryBreakdown.value?.retentionPay?.[year] || {}),
          [monthKey]: {
            ...existingRetentionMonth,
            [`retention${retentionCount + 1}`]: retentionEntry,
            totalAmount: existingRetentionTotal + retentionEntry.amount,
          },
        },
      }),
    };

    // ---------------- SALARY ARREARS ----------------
    const arrearsEntry =
      newArrears.value.name && newArrears.value.amount
        ? {
            name: newArrears.value.name,
            amount: Number(newArrears.value.amount),
            date: new Date().toISOString().split("T")[0],
          }
        : null;

    const existingArrearsMonth =
      salaryBreakdown.value?.salaryArrears?.[year]?.[monthKey] || {};

    const existingArrearsTotal = Object.keys(existingArrearsMonth)
      .filter((k) => k.startsWith("salaryArrear"))
      .reduce((sum, key) => sum + (existingArrearsMonth[key].amount || 0), 0);

    const arrearsCount = Object.keys(existingArrearsMonth).filter((k) =>
      k.startsWith("salaryArrear"),
    ).length;

    const salaryArrears = {
      ...(salaryBreakdown.value?.salaryArrears || {}),
      ...(arrearsEntry && {
        [year]: {
          ...(salaryBreakdown.value?.salaryArrears?.[year] || {}),
          [monthKey]: {
            ...existingArrearsMonth,
            [`salaryArrear${arrearsCount + 1}`]: arrearsEntry,
            totalAmount: existingArrearsTotal + arrearsEntry.amount,
          },
        },
      }),
    };

    // ---------------- INDIVIDUAL DEDUCTION ----------------
    const deductionEntry =
      newDeduction.value.name && newDeduction.value.amount
        ? {
            name: newDeduction.value.name,
            amount: Number(newDeduction.value.amount),
            date: new Date().toISOString().split("T")[0],
          }
        : null;

    const existingDeductionMonth =
      salaryBreakdown.value?.individualDeduction?.[year]?.[monthKey] || {};

    const existingDeductionTotal = Object.keys(existingDeductionMonth)
      .filter((k) => k.startsWith("deduction"))
      .reduce((sum, key) => sum + (existingDeductionMonth[key].amount || 0), 0);

    const deductionCount = Object.keys(existingDeductionMonth).filter((k) =>
      k.startsWith("deduction"),
    ).length;

    const individualDeduction = {
      ...(salaryBreakdown.value?.individualDeduction || {}),
      ...(deductionEntry && {
        [year]: {
          ...(salaryBreakdown.value?.individualDeduction?.[year] || {}),
          [monthKey]: {
            ...existingDeductionMonth,
            [`deduction${deductionCount + 1}`]: deductionEntry,
            totalAmount: existingDeductionTotal + deductionEntry.amount,
          },
        },
      }),
    };

    // ---------------- FINAL PAYLOAD ----------------
    const payload = {
      bonus,
      incentive,
      retentionPay,
      salaryArrears,
      individualDeduction,
    };

    // ---------------- API CALL ----------------
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown/${route.query.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Adhoc payment saved successfully:", data);

    // ---------------- RESET FORMS ----------------
    if (bonusEntry) {
      newBonus.value.reason = "";
      newBonus.value.amount = "";
      newBonus.value.notes = "";
    }
    if (incentiveEntry) {
      newIncentive.value.reason = "";
      newIncentive.value.amount = "";
      newIncentive.value.notes = "";
    }
    if (retentionEntry) {
      newRetention.value.reason = "";
      newRetention.value.amount = "";
      newRetention.value.notes = "";
    }
    if (arrearsEntry) {
      newArrears.value.name = "";
      newArrears.value.amount = "";
      newArrears.value.notes = "";
    }
    if (deductionEntry) {
      newDeduction.value.name = "";
      newDeduction.value.amount = "";
    }

    await fetchSalaryBreakdown();
  } catch (err) {
    console.error("Error saving adhoc payment:", err.message);
    error.value = `Failed to save: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

const fetchSalaryBreakdown = async () => {
  if (!token) {
    console.error("Authentication required. Please login again.");
    error.value = "Authentication required. Please login again.";
    return;
  }

  try {
    const fields = [
      "id",
      "employee.id",
      "employee.employeeId",
      "employee.assignedUser.first_name",
      "employee.assignedUser.role.name",
      "salaryTracking",

      "salaryArrears",
      "individualDeduction",
      "bonus",
      "incentive",
      "retentionPay",
    ];

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown/${route.query.id}?fields=${fields.join(",")}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP GET error! Status: ${response.status}`);
    }

    const data = await response.json();
    salaryBreakdown.value = data.data;
    const [year, month] = route.query.month.split("-");

    const bonusObj = data.data.bonus?.[year]?.[month] || {};
    bonuses.value = Object.entries(bonusObj)
      .filter(([key]) => key !== "totalAmount")
      .map(([_, value]) => value);
    totalBonus.value = bonusObj.totalAmount || 0;

    const incentiveObj = data.data.incentive?.[year]?.[month] || {};
    incentives.value = Object.entries(incentiveObj)
      .filter(([key]) => key !== "totalAmount")
      .map(([_, value]) => value);
    totalIncentive.value = incentiveObj.totalAmount || 0;

    const retentionObj = data.data.retentionPay?.[year]?.[month] || {};
    retentionPays.value = Object.entries(retentionObj)
      .filter(([key]) => key !== "totalAmount")
      .map(([_, value]) => value);
    totalRetentionPay.value = retentionObj.totalAmount || 0;

    const arrearsObj = data.data.salaryArrears?.[year]?.[month] || {};
    salaryArrears.value = Object.entries(arrearsObj)
      .filter(([key]) => key !== "totalAmount")
      .map(([_, value]) => value);
    totalArrears.value = arrearsObj.totalAmount || 0;

    const deductionObj = data.data.individualDeduction?.[year]?.[month] || {};
    deductions.value = Object.entries(deductionObj)
      .filter(([key]) => key !== "totalAmount")
      .map(([_, value]) => value);
    totalDeduction.value = deductionObj.totalAmount || 0;

    return data;
  } catch (err) {
    console.error("Error fetching SalaryBreakdown:", err.message);
    error.value = `Failed to fetch SalaryBreakdown: ${err.message}`;
  }
};

const deleteBonus = async (key) => {
  const [year, month] = route.query.month.split("-");
  const monthKey = month.padStart(2, "0");
  const existingMonth = {
    ...(salaryBreakdown.value?.bonus?.[year]?.[monthKey] || {}),
  };

  delete existingMonth[key];

  const totalAmount = Object.keys(existingMonth)
    .filter((k) => k.startsWith("bonus"))
    .reduce((sum, k) => sum + (existingMonth[k].amount || 0), 0);

  existingMonth.totalAmount = totalAmount;

  const updatedBonus = {
    ...salaryBreakdown.value.bonus,
    [year]: {
      ...(salaryBreakdown.value.bonus?.[year] || {}),
      [monthKey]: existingMonth,
    },
  };

  await patchSalaryBreakdown({ bonus: updatedBonus });
  await fetchSalaryBreakdown();
};

// ---------------- INCENTIVE ----------------
const deleteIncentive = async (key) => {
  const [year, month] = route.query.month.split("-");
  const monthKey = month.padStart(2, "0");
  const existingMonth = {
    ...(salaryBreakdown.value?.incentive?.[year]?.[monthKey] || {}),
  };

  delete existingMonth[key];

  const totalAmount = Object.keys(existingMonth)
    .filter((k) => k.startsWith("incentive"))
    .reduce((sum, k) => sum + (existingMonth[k].amount || 0), 0);

  existingMonth.totalAmount = totalAmount;

  const updatedIncentive = {
    ...salaryBreakdown.value.incentive,
    [year]: {
      ...(salaryBreakdown.value.incentive?.[year] || {}),
      [monthKey]: existingMonth,
    },
  };

  await patchSalaryBreakdown({ incentive: updatedIncentive });
  await fetchSalaryBreakdown();
};

const deleteRetention = async (key) => {
  const [year, month] = route.query.month.split("-");
  const monthKey = month.padStart(2, "0");
  const existingMonth = {
    ...(salaryBreakdown.value?.retentionPay?.[year]?.[monthKey] || {}),
  };

  delete existingMonth[key];

  const totalAmount = Object.keys(existingMonth)
    .filter((k) => k.startsWith("retentionPay"))
    .reduce((sum, k) => sum + (existingMonth[k].amount || 0), 0);

  existingMonth.totalAmount = totalAmount;

  const updatedRetention = {
    ...salaryBreakdown.value.retentionPay,
    [year]: {
      ...(salaryBreakdown.value.retentionPay?.[year] || {}),
      [monthKey]: existingMonth,
    },
  };

  await patchSalaryBreakdown({ retentionPay: updatedRetention });
  await fetchSalaryBreakdown();
};

const deleteArrears = async (key) => {
  const [year, month] = route.query.month.split("-");
  const monthKey = month.padStart(2, "0");

  // Delete inside year → month
  const existingMonth = {
    ...(salaryBreakdown.value?.salaryArrears?.[year]?.[monthKey] || {}),
  };
  delete existingMonth[key];
  const totalAmount = Object.keys(existingMonth)
    .filter((k) => k.startsWith("salaryArrear"))
    .reduce((sum, k) => sum + (existingMonth[k].amount || 0), 0);
  existingMonth.totalAmount = totalAmount;

  // Delete top-level key if exists
  const updatedArrears = { ...salaryBreakdown.value.salaryArrears };
  delete updatedArrears[key];

  // Merge month-wise update
  updatedArrears[year] = {
    ...(updatedArrears[year] || {}),
    [monthKey]: existingMonth,
  };

  await patchSalaryBreakdown({ salaryArrears: updatedArrears });
  await fetchSalaryBreakdown();
};

const deleteDeduction = async (key) => {
  const [year, month] = route.query.month.split("-");
  const monthKey = month.padStart(2, "0");

  // Delete inside year → month
  const existingMonth = {
    ...(salaryBreakdown.value?.individualDeduction?.[year]?.[monthKey] || {}),
  };
  delete existingMonth[key];
  const totalAmount = Object.keys(existingMonth)
    .filter((k) => k.startsWith("deduction"))
    .reduce((sum, k) => sum + (existingMonth[k].amount || 0), 0);
  existingMonth.totalAmount = totalAmount;

  // Delete top-level key if exists
  const updatedDeduction = { ...salaryBreakdown.value.individualDeduction };
  delete updatedDeduction[key];

  // Merge month-wise update
  updatedDeduction[year] = {
    ...(updatedDeduction[year] || {}),
    [monthKey]: existingMonth,
  };

  await patchSalaryBreakdown({ individualDeduction: updatedDeduction });
  await fetchSalaryBreakdown();
};

const patchSalaryBreakdown = async (payload) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown/${route.query.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP PATCH error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error("Error updating SalaryBreakdown:", err.message);
    error.value = `Failed to update: ${err.message}`;
  }
};

onMounted(async () => {
  await fetchSalaryBreakdown();
});
</script>

<style scoped>
.bonus-management-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: #ffffff;
  min-height: 100vh;
}

.professional-input :deep(.v-field__outline) {
  --v-field-border-width: 1px;
}

.professional-input :deep(.v-field--focused .v-field__outline) {
  --v-field-border-color: #3b82f6;
  --v-field-border-width: 2px;
}

.bonus-item:hover {
  background: #f3f4f6 !important;
  border-color: #e5e7eb !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1) !important;
}

.bonus-form-card {
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.records-card {
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>
