<template>
  <v-navigation-drawer
    v-model="show"
    temporary
    width="400"
    location="end"
    no-overlay
    :style="{ position: 'absolute', zIndex: 1000 }"
  >
    <v-card flat height="100%" class="loan-card">
      <v-card-title class="loan-header">
        <span class="loan-header-title"> {{ "Employee" }} </span>
        <v-btn icon class="loan-close-btn" @click="closeDrawer">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="loan-content">
        <div class="loan-outstanding">
          <span class="loan-outstanding-label">Loan Outstanding:</span>
          <span class="loan-outstanding-amount"
            >₹{{ calculateLoanOutstanding() }}</span
          >
        </div>

        <div class="loan-main-section">
          <div v-if="!editMode">
            <div class="loan-form-section">
              <div class="loan-form-row">
                <label class="loan-form-label">Amount</label>
                <v-text-field
                  v-model="tempAmount"
                  variant="outlined"
                  density="compact"
                  prefix="₹"
                  type="number"
                  class="loan-input"
                  hide-details
                />
              </div>

              <div class="loan-form-row">
                <label class="loan-form-label">Payment Date</label>
                <v-text-field
                  v-model="tempDate"
                  type="month"
                  variant="outlined"
                  density="compact"
                  class="loan-input"
                  hide-details
                />
              </div>

              <div class="loan-form-row">
                <label class="loan-form-label">Notes</label>
                <v-textarea
                  v-model="tempNotes"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  placeholder="Add Notes..."
                  class="loan-textarea"
                  hide-details
                />
              </div>

              <div class="loan-actions">
                <BaseButton
                  variant="primary"
                  size="md"
                  text="Add Loan"
                  :leftIcon="Plus"
                  :loading="updatingBenefits"
                  :disabled="!tempAmount || !tempDate"
                  @click="addLoan"
                />

                <BaseButton
                  variant="danger"
                  size="md"
                  text="Deduct Loan"
                  :leftIcon="Minus"
                  :loading="updatingBenefits"
                  :disabled="!tempAmount || !tempDate"
                  @click="deductLoan"
                />

                <!-- <BaseButton
                  variant="outline"
                  size="md"
                  text="Cancel"
                  :leftIcon="X"
                  @click="cancelEdit"
                /> -->
              </div>
            </div>

            <div class="loan-history-section">
              <div class="loan-history-header">
                <span class="loan-history-title">History</span>
                <v-icon class="loan-history-icon">mdi-clock-outline</v-icon>
              </div>

              <div v-if="advanceManual?.length" class="loan-history-list">
                <div
                  v-for="(deduction, index) in advanceManual"
                  :key="index"
                  class="loan-history-item"
                >
                  <div class="loan-history-item-content">
                    <div class="loan-history-item-left">
                      <span
                        :class="[
                          'loan-status-badge',
                          getStatusClass(deduction.type),
                        ]"
                      >
                        {{ deduction.type || "Given" }}
                      </span>
                      <span class="loan-history-date">{{
                        formatDate(deduction.month)
                      }}</span>
                    </div>
                    <div class="loan-history-item-right">
                      <span class="loan-history-amount"
                        >₹ {{ deduction.amount }}</span
                      >
                      <div class="loan-history-actions">
                        <v-btn
                          v-if="props.mode !== 'view'"
                          icon
                          size="small"
                          class="loan-action-btn"
                          @click="editSpecificBenefit(index)"
                        >
                          <v-icon size="16">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          v-if="props.mode !== 'view'"
                          icon
                          size="small"
                          class="loan-action-btn loan-delete-btn"
                          @click="deleteSpecificBenefit(index)"
                        >
                          <v-icon size="16">mdi-close</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="loan-no-records">No loan records found</div>
            </div>
          </div>

          <div v-else>
            <v-card flat>
              <v-card-text>
                <div class="loan-form-row">
                  <div class="loan-form-label">Reason</div>
                  <v-text-field
                    v-model="editingBenefits.reason"
                    variant="outlined"
                    density="compact"
                    placeholder="Enter reason"
                  />
                </div>
                <div class="loan-form-row">
                  <div class="loan-form-label">Amount</div>
                  <v-text-field
                    v-model="editingBenefits.amount"
                    type="number"
                    variant="outlined"
                    prefix="₹"
                    density="compact"
                  />
                </div>
                <div class="loan-form-row">
                  <div class="loan-form-label">Month</div>
                  <v-text-field
                    v-model="editingBenefits.month"
                    type="month"
                    variant="outlined"
                    density="compact"
                    required
                  />
                </div>
                <div class="loan-form-row">
                  <div class="loan-form-label">Notes</div>
                  <v-textarea
                    v-model="editingBenefits.notes"
                    variant="outlined"
                    density="compact"
                    rows="3"
                  />
                </div>

                <!-- <div class="d-flex justify-end mt-4">
                  <v-btn class="mr-2" variant="outlined" @click="cancelEdit">
                    Cancel
                  </v-btn>
                  <v-btn
                    color="primary"
                    class="mr-2"
                    @click="updateLoan"
                    :loading="updatingBenefits"
                    :disabled="
                      !editingBenefits.amount || !editingBenefits.month
                    "
                  >
                    Update Loan
                  </v-btn>
                </div> -->
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { authService } from "@/services/authService";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { Plus, Minus, X } from "lucide-vue-next";
const props = defineProps({
  employeeId: { type: String, required: true },
  show: { type: Boolean, default: false },
  mode: { type: String, default: "view" },
  benefitIndex: { type: Number, default: null },
});

const emit = defineEmits(["update:show"]);

const token = authService.getToken();

const show = ref(props.show);
const employee = ref(null);
const editMode = ref(false);
const advanceManual = ref([]);
const tempAmount = ref("");
const tempDate = ref("");
const tempNotes = ref("");
const editingBenefits = ref({
  reason: "",
  amount: 0,
  month: "",
  notes: "",
});
const updatingBenefits = ref(false);
const employeeSalaryBreakdown = ref(null);

const closeDrawer = () => {
  show.value = false;
  editMode.value = false;
  emit("update:show", false);
};

const fetchSalaryBreakdown = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?filter[id][_eq]=${props.employeeId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    employeeSalaryBreakdown.value = data.data[0] || null;

    if (employeeSalaryBreakdown.value) {
      employee.value = employeeSalaryBreakdown.value.employee || null;
      advanceManual.value = [
        ...(employeeSalaryBreakdown.value?.loanCredit
          ? Object.entries(employeeSalaryBreakdown.value.loanCredit).flatMap(
              ([year, months]) =>
                Object.entries(months).flatMap(([month, entries]) =>
                  Object.entries(entries)
                    .filter(([key]) => key !== "totalAmount")
                    .map(([key, value]) => ({
                      ...value,
                      month: `${year}-${month}`,
                      type: "Given",
                    })),
                ),
            )
          : []),
        ...(employeeSalaryBreakdown.value?.loanDebit
          ? Object.entries(employeeSalaryBreakdown.value.loanDebit).flatMap(
              ([year, months]) =>
                Object.entries(months).flatMap(([month, entries]) =>
                  Object.entries(entries)
                    .filter(([key]) => key !== "totalAmount")
                    .map(([key, value]) => ({
                      ...value,
                      month: `${year}-${month}`,
                      type: "Received",
                    })),
                ),
            )
          : []),
      ].sort((a, b) => new Date(b.month) - new Date(a.month)); // Sort by date descending
    }

    if (props.mode === "add") {
      editMode.value = true;
      resetForm();
    } else if (
      props.mode === "edit" &&
      props.benefitIndex !== null &&
      advanceManual.value[props.benefitIndex]
    ) {
      editSpecificBenefit(props.benefitIndex);
    }
  } catch (err) {
    console.error("Error fetching salary breakdown:", err.message);
  }
};

const patchSalaryBreakdown = async (field, payload) => {
  try {
    updatingBenefits.value = true;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown/${props.employeeId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: payload,
        }),
      },
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    employeeSalaryBreakdown.value[field] = payload;
    await fetchSalaryBreakdown(); // Refresh data
  } catch (err) {
    console.error(`Error updating ${field}:`, err.message);
  } finally {
    updatingBenefits.value = false;
  }
};

const addLoan = async () => {
  if (!tempAmount.value || !tempDate.value) return;
  const [year, month] = tempDate.value.split("-");

  const existing = JSON.parse(
    JSON.stringify(employeeSalaryBreakdown.value?.loanCredit || {}),
  );
  if (!existing[year]) existing[year] = {};
  if (!existing[year][month]) existing[year][month] = { totalAmount: 0 };
  const existingEntries = existing[year]?.[month]
    ? Object.keys(existing[year][month]).filter((k) => k.startsWith("credit"))
    : [];
  const entryKey = `credit${existingEntries.length + 1}`;
  existing[year][month][entryKey] = {
    reason: tempNotes.value,
    amount: Number(tempAmount.value),
    notes: tempNotes.value || "",
  };
  existing[year][month].totalAmount += Number(tempAmount.value);
  const newOutstanding = calculateLoanOutstanding();
  await patchSalaryBreakdown("loanCredit", existing);

  resetForm();
};

const deductLoan = async () => {
  if (!tempAmount.value || !tempDate.value) return;
  const [year, month] = tempDate.value.split("-");

  const existing = JSON.parse(
    JSON.stringify(employeeSalaryBreakdown.value?.loanDebit || {}),
  );
  if (!existing[year]) existing[year] = {};
  if (!existing[year][month]) existing[year][month] = { totalAmount: 0 };
  const existingEntries = existing[year]?.[month]
    ? Object.keys(existing[year][month]).filter((k) => k.startsWith("debit"))
    : [];
  const entryKey = `debit${existingEntries.length + 1}`;
  existing[year][month][entryKey] = {
    reason: tempNotes.value,
    amount: Number(tempAmount.value),
    notes: tempNotes.value || "",
  };
  existing[year][month].totalAmount += Number(tempAmount.value);
  const newOutstanding = calculateLoanOutstanding();
  await patchSalaryBreakdown("loanDebit", existing);
  resetForm();
};

const getStatusClass = (type) => {
  return type === "Received" ? "status-received" : "status-given";
};

const resetForm = () => {
  tempAmount.value = "";
  tempDate.value = "";
  tempNotes.value = "";
  editMode.value = false;
};

const cancelEdit = () => {
  resetForm();
  editMode.value = false;
};

const calculateLoanOutstanding = () => {
  const loanCredit = employeeSalaryBreakdown.value?.loanCredit || {};
  const loanDebit = employeeSalaryBreakdown.value?.loanDebit || {};

  let totalCredit = 0;
  let totalDebit = 0;

  Object.values(loanCredit).forEach((year) => {
    Object.values(year).forEach((month) => {
      if (month.totalAmount) totalCredit += month.totalAmount;
    });
  });

  Object.values(loanDebit).forEach((year) => {
    Object.values(year).forEach((month) => {
      if (month.totalAmount) totalDebit += month.totalAmount;
    });
  });

  return totalCredit - totalDebit;
};

const editSpecificBenefit = (index) => {
  editMode.value = true;
  const benefit = advanceManual.value[index];
  editingBenefits.value = {
    reason: benefit.reason || "",
    amount: Number(benefit.amount),
    month: benefit.month,
    notes: benefit.notes || "",
    type: benefit.type,
  };
};

const deleteSpecificBenefit = async (index) => {
  const benefit = advanceManual.value[index];
  const [year, month] = benefit.month.split("-");
  const field = benefit.type === "Received" ? "loanDebit" : "loanCredit";
  const existing = JSON.parse(
    JSON.stringify(employeeSalaryBreakdown.value?.[field] || {}),
  );
  if (existing[year]?.[month]) {
    const entryKey = Object.keys(existing[year][month]).find(
      (key) =>
        key !== "totalAmount" &&
        existing[year][month][key].reason === benefit.reason &&
        existing[year][month][key].amount === benefit.amount,
    );
    if (entryKey) {
      existing[year][month].totalAmount -= Number(benefit.amount);
      delete existing[year][month][entryKey];
      if (Object.keys(existing[year][month]).length === 1)
        delete existing[year][month];
      if (Object.keys(existing[year]).length === 0) delete existing[year];
      await patchSalaryBreakdown(field, existing);
    }
  }
};

const updateLoan = async () => {
  if (!editingBenefits.value.month || props.benefitIndex === null) return;
  const [year, month] = editingBenefits.value.month.split("-");
  const field =
    editingBenefits.value.type === "Received" ? "loanDebit" : "loanCredit";
  const existing = JSON.parse(
    JSON.stringify(employeeSalaryBreakdown.value?.[field] || {}),
  );
  const benefit = advanceManual.value[props.benefitIndex];
  const entryKey = Object.keys(existing[year][month]).find(
    (key) =>
      key !== "totalAmount" &&
      existing[year][month][key].reason === benefit.reason &&
      existing[year][month][key].amount === benefit.amount,
  );
  if (entryKey) {
    const oldAmount = existing[year][month][entryKey].amount;
    existing[year][month][entryKey] = {
      reason: editingBenefits.value.reason,
      amount: Number(editingBenefits.value.amount),
      notes: editingBenefits.value.notes || "",
    };
    existing[year][month].totalAmount +=
      Number(editingBenefits.value.amount) - oldAmount;
    await patchSalaryBreakdown(field, existing);
  }
  cancelEdit();
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month] = dateStr.split("-");
  return new Date(year, month - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
};

watch(
  () => props.show,
  async (val) => {
    show.value = val;
    if (val && props.employeeId) await fetchSalaryBreakdown();
  },
);

watch(
  () => props.mode,
  (newMode) => {
    if (newMode === "add") {
      editMode.value = true;
      resetForm();
    } else if (newMode === "edit" && props.benefitIndex !== null) {
      editSpecificBenefit(props.benefitIndex);
    } else {
      editMode.value = false;
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (props.employeeId) fetchSalaryBreakdown();
});
</script>

<style scoped>
.loan-drawer {
  width: 350px;

  position: fixed;
}

.loan-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.loan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 20px;
  min-height: 64px;
}

.loan-header-title {
  font-size: 16px;
  font-weight: 500;
  color: #212529;
}

.loan-close-btn {
  color: #6c757d;
}

.loan-content {
  flex-grow: 1;
  padding: 20px;
}

.loan-outstanding {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.loan-outstanding-label {
  font-size: 16px;
  font-weight: 500;
  color: #495057;
}

.loan-outstanding-amount {
  font-size: 18px;
  font-weight: 600;
  color: #dc3545;
}

.loan-form-section {
  margin-bottom: 32px;
}

.loan-form-row {
  margin-bottom: 16px;
}

.loan-form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
}

.loan-input,
.loan-textarea {
  width: 100%;
}

.loan-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.loan-btn-add {
  background-color: #dc3545 !important;
  color: white !important;
  font-weight: 600;
  text-transform: none;
  border-radius: 6px;
  padding: 0 24px;
  height: 40px;
}

.loan-btn-deduct {
  background-color: #28a745 !important;
  color: white !important;
  font-weight: 600;
  text-transform: none;
  border-radius: 6px;
  padding: 0 24px;
  height: 40px;
}

.loan-btn-cancel {
  color: #6c757d !important;
  border-color: #dee2e6 !important;
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
  padding: 0 24px;
  height: 40px;
}

.loan-history-section {
  border-top: 1px solid #e9ecef;
  padding-top: 24px;
}

.loan-history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.loan-history-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
}

.loan-history-icon {
  color: #6c757d;
  font-size: 18px;
}

.loan-history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loan-history-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  background-color: #ffffff;
}

.loan-history-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loan-history-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.loan-status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-given {
  background-color: #ffeaa7;
  color: #d63031;
}

.status-received {
  background-color: #d1f2eb;
  color: #00b894;
}

.loan-history-date {
  font-size: 14px;
  color: #6c757d;
}

.loan-history-item-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.loan-history-amount {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
}

.loan-history-actions {
  display: flex;
  gap: 4px;
}

.loan-action-btn {
  color: #6c757d !important;
  background-color: transparent !important;
}

.loan-action-btn:hover {
  background-color: #f8f9fa !important;
}

.loan-delete-btn {
  color: #dc3545 !important;
}

.loan-no-records {
  text-align: center;
  padding: 32px 16px;
  color: #6c757d;
  font-style: italic;
}
</style>
