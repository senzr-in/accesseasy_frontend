<template>
  <div>
    <!-- Instructions Modal -->
    <TemplateInstructionsModal
      v-if="showInstructionsModal"
      @close="showInstructionsModal = false"
      @proceed="
        showInstructionsModal = false;
        showTemplateModal = true;
      "
    />

    <!-- Template Selection Modal -->
    <div
      v-if="showTemplateModal"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h4>Download Employee Template</h4>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <div class="select-all">
            <label>
              <input
                type="checkbox"
                v-model="selectAll"
                @change="toggleSelectAll"
              />
              Select All
            </label>
          </div>
          <div class="fields-list">
            <div
              v-for="(field, index) in fields"
              :key="index"
              class="field-item"
              :class="{ 'required-field': field.required }"
            >
              <label>
                <input
                  type="checkbox"
                  v-model="field.selected"
                  :disabled="field.required"
                />
                {{ field.label }}
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="closeModal">Cancel</button>
          <button
            class="download-btn"
            @click="downloadTemplate"
            :disabled="!hasSelectedFields"
          >
            Download Template
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import * as XLSX from "xlsx";
import TemplateInstructionsModal from "./importDataInstructions.vue";

const emit = defineEmits(["close"]);

const showInstructionsModal = ref(true);
const showTemplateModal = ref(false);

// Only gender, firstName, and employeeId are mandatory
const requiredFields = ["gender", "firstName", "employeeId"];

const fields = ref([
  {
    label: "firstName",
    key: "assignedUser.first_name",
    selected: true,
    required: true,
  },
  {
    label: "lastName",
    key: "assignedUser.last_name",
    selected: true,
    required: false,
  },
  {
    label: "gender",
    key: "assignedUser.gender",
    selected: true,
    required: true,
  },
  {
    label: "middleName",
    key: "assignedUser.middleName",
    selected: true,
    required: false,
  },
  {
    label: "Employee ID",
    key: "employeeId",
    selected: true,
    required: true,
  },
  {
    label: "phone",
    key: "assignedUser.phone",
    selected: true,
    required: false,
  },
  {
    label: "email",
    key: "assignedUser.email",
    selected: true,
    required: false,
  },
  {
    label: "Office Email",
    key: "assignedUser.officeEmail",
    selected: true,
    required: false,
  },
  {
    label: "Role Name",
    key: "assignedUser.role.name",
    selected: true,
    required: false,
  },
  {
    label: "pan",
    key: "assignedUser.pan",
    selected: true,
    required: false,
  },
  {
    label: "Aadhar",
    key: "assignedUser.aadhar",
    selected: true,
    required: false,
  },
  {
    label: "salary",
    key: "salaryTracking",
    selected: true,
    required: false,
  },
  {
    label: "dateOfBirth",
    key: "assignedUser.DOB",
    selected: true,
    required: false,
  },
  {
    label: "bloodGroup",
    key: "assignedUser.bloodGroup",
    selected: true,
    required: false,
  },
  {
    label: "maritalStatus",
    key: "assignedUser.maritalStatus",
    selected: true,
    required: false,
  },
  {
    label: "currentAddress",
    key: "assignedUser.current_Address",
    selected: true,
    required: false,
  },
  {
    label: "permanentAddress",
    key: "assignedUser.permanent_Address",
    selected: true,
    required: false,
  },
  {
    label: "bankAccountName",
    key: "assignedUser.bankName",
    selected: true,
    required: false,
  },
  {
    label: "bankAccountNumber",
    key: "assignedUser.accountNumber",
    selected: true,
    required: false,
  },
  {
    label: "skillType",
    key: "assignedUser.skilled",
    selected: true,
    required: false,
  },
  {
    label: "designation",
    key: "assignedUser.designation",
    selected: true,
    required: false,
  },
  {
    label: "ifscCode",
    key: "assignedUser.IFSC",
    selected: true,
    required: false,
  },
  {
    label: "UPI ID",
    key: "assignedUser.UPI",
    selected: true,
    required: false,
  },
  {
    label: "emergencyContactName",
    key: "assignedUser.emergency_Contact_Name",
    selected: true,
    required: false,
  },
  {
    label: "emergencyContactMobile",
    key: "assignedUser.emergency_Contact_Mobile_Number",
    selected: true,
    required: false,
  },
  {
    label: "emergencyContactRelationship",
    key: "assignedUser.emergency_Contact_Relationship",
    selected: true,
    required: false,
  },
  {
    label: "emergencyContactAddress",
    key: "assignedUser.emergency_Contact_Address",
    selected: true,
    required: false,
  },
  {
    label: "guardiansName",
    key: "assignedUser.guardians_Name",
    selected: true,
    required: false,
  },
  {
    label: "Previous Company Name",
    key: "assignedUser.previousExperiences.companyName",
    selected: true,
    required: false,
  },
  {
    label: "Previous Designation",
    key: "assignedUser.previousExperiences.designation",
    selected: true,
    required: false,
  },
  {
    label: "Previous Joining Date",
    key: "assignedUser.previousExperiences.joiningDate",
    selected: true,
    required: false,
  },
  {
    label: "Previous Leaving Date",
    key: "assignedUser.previousExperiences.leavingDate",
    selected: true,
    required: false,
  },
  {
    label: "Previous Salary Currency",
    key: "assignedUser.previousExperiences.currency",
    selected: true,
    required: false,
  },
  {
    label: "Previous Salary",
    key: "assignedUser.previousExperiences.salary",
    selected: true,
    required: false,
  },
  {
    label: "Date of Joining",
    key: "assignedUser.dateOfJoining",
    selected: true,
    required: false,
  },
  {
    label: "Date of Leaving",
    key: "assignedUser.dateOfLeaving",
    selected: true,
    required: false,
  },
  {
    label: "pfAccountNumber",
    key: "assignedUser.PFAccountNumber",
    selected: true,
    required: false,
  },
  {
    label: "esiAccountNumber",
    key: "assignedUser.ESIAccountNumber",
    selected: true,
    required: false,
  },
  {
    label: "Voter ID",
    key: "assignedUser.voter_ID",
    selected: true,
    required: false,
  },
  {
    label: "drivingLicense",
    key: "assignedUser.driving_License",
    selected: true,
    required: false,
  },
  {
    label: "uan",
    key: "assignedUser.UAN",
    selected: true,
    required: false,
  },
  {
    label: "departmentName",
    key: "department.departmentId",
    selected: true,
    required: false,
  },
]);

const selectAll = ref(true);

onMounted(() => {
  fields.value.forEach((field) => {
    if (requiredFields.includes(field.label)) {
      field.required = true;
      field.selected = true;
    }
  });
});

const hasSelectedFields = computed(() => {
  return fields.value.some((field) => field.selected);
});

const toggleSelectAll = () => {
  fields.value.forEach((field) => {
    if (!field.required) {
      field.selected = selectAll.value;
    }
  });
};

const closeModal = () => {
  emit("close");
};

const downloadTemplate = () => {
  const selectedFields = fields.value.filter((field) => field.selected);
  const headerRow = selectedFields.map((field) => field.label);
  const worksheet = XLSX.utils.aoa_to_sheet([headerRow]);

  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  worksheet["!cols"] = [];
  for (let col = range.s.c; col <= range.e.c; col++) {
    worksheet["!cols"][col] = { wch: 25 };
  }

  if (!worksheet["!styles"]) worksheet["!styles"] = {};
  headerRow.forEach((label, index) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });

    const isRequired = requiredFields.includes(label);

    if (isRequired) {
      if (!worksheet[cellRef]) worksheet[cellRef] = { v: label };
      worksheet[cellRef].s = {
        font: { color: { rgb: "FF0000" } },
      };
    }
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Template");
  XLSX.writeFile(workbook, "employee_template.xlsx", { cellStyles: true });
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
  flex-grow: 1;
}

.select-all {
  margin-bottom: 16px;
}

.fields-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.field-item {
  display: flex;
  align-items: center;
}

/* Style for required fields */
.required-field {
  color: red;
}

.required-field input[type="checkbox"] {
  opacity: 0.7;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-btn,
.download-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  color: #333;
}

.download-btn {
  background-color: #059367;
  border: none;
  color: white;
}

.download-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
