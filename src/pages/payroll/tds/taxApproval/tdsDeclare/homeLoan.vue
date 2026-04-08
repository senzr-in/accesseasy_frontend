<template>
  <div class="deductions-container">
    <v-toolbar density="compact" color="grey-lighten-4">
      <v-btn icon color="black" @click="handleClose">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="ml-4">Add TDSDetails</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="error" variant="text" class="mr-2" @click="handleClose">
        CANCEL
      </v-btn>
    </v-toolbar>
    <!-- House Property Deductions Section -->
    <div class="section">
      <h2 class="section-title">Deductions Under House Property</h2>
      <div class="info-text">
        Homeowners can claim a deduction of up to ₹2,00,000 on their home loan
        interest under Section 24. For more information, please
        <a href="#" class="link">click here</a>.
      </div>
      <v-data-table
        :headers="headers"
        :items="rentEntries"
        class="elevation-1 mb-6"
        hide-default-footer
      >
        <template v-slot:item.fileId="{ item }">
          <td>
            <v-btn
              icon
              :disabled="!item.fileId"
              @click="downloadFile(item.fileId)"
              title="Download Proof Document"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </td>
        </template>
        <template v-slot:item.actions="{ item }">
          <td>
            <v-icon small @click="deleteItem(item)" class="cursor-pointer"
              >mdi-delete</v-icon
            >
          </td>
        </template>
        <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending' && userRole === 'Admin'">
              <v-btn small color="green" class="mr-2" @click="acceptItem(item)"
                >Accept</v-btn
              >
              <v-btn small color="red" @click="rejectItem(item)">Reject</v-btn>
            </div>
            <div v-else>
              <v-chip color="pink lighten-4">
                {{ item.status }}
              </v-chip>
            </div>
          </td>
        </template>
      </v-data-table>
      <div class="action-buttons" v-if="userRole == 'Admin'">
        <button class="add-btn" @click="openAddInvestmentDialog">
          Add New Home Loan
        </button>
      </div>
    </div>

    <!-- Section 80EE/80EEA Deductions -->
    <div class="section gray-bg">
      <h2 class="section-title">Section 80EE/80EEA Deductions</h2>
      <div class="info-text">
        Section 80EE/80EEA allows further tax benefits for first time home
        buyers. Through these sections, an additional deduction of ₹1,50,000 can
        be claimed on home loan interest, under certain conditions. This is in
        addition to deduction of ₹2,00,000 allowed under section 24.
      </div>
    </div>

    <!-- Section 80EE Investments -->
    <div class="section">
      <h3 class="subsection-title">Investments under Section 80EE</h3>

      <!-- Grid container -->
      <div class="grid-wrapper">
        <!-- Left: Requirements list -->
        <ul class="requirements-list">
          <li>
            Rebate under Section 80EE is available only to those individual
            borrowers whose loan was sanctioned between 1 April 2016 and 31
            March 2017.
          </li>
          <li>Value of the house should be Rs 50 lakh or less.</li>
          <li>Loan taken for the house must be Rs 35 lakh or less.</li>
        </ul>

        <!-- Right: Amount table -->
        <div class="amounts-table-grid">
          <div class="grid-item label">Declared Amount</div>
          <div class="grid-item value">₹ {{ declareddeduction }}</div>
          <div class="grid-item label">Approved Amount</div>
          <div class="grid-item value">₹ {{ approveddeduction }}</div>
        </div>
      </div>
      <v-data-table
        :headers="headersDeduction"
        :items="deductionEntries"
        class="elevation-1 mb-6"
        hide-default-footer
      >
        <template v-slot:item.actions="{ item }">
          <td>
            <v-icon small @click="deletededuction(item)" class="cursor-pointer"
              >mdi-delete</v-icon
            >
          </td>
        </template>
        <template v-slot:item.fileId="{ item }">
          <td>
            <v-btn
              icon
              :disabled="!item.fileId"
              @click="downloadFile(item.fileId)"
              title="Download Proof Document"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </td>
        </template>

        <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending' && userRole === 'Admin'">
              <v-btn
                small
                color="green"
                class="mr-2"
                @click="acceptDeduction(item)"
              >
                Accept
              </v-btn>
              <v-btn small color="red" @click="rejectDeduction(item)">
                Reject
              </v-btn>
            </div>
            <div v-else>
              <v-chip color="pink lighten-4">
                {{ item.status }}
              </v-chip>
            </div>
          </td>
        </template>
      </v-data-table>

      <!-- Buttons -->
      <div class="action-buttons" v-if="userRole == 'Admin'">
        <button class="add-investment-btn" @click="homeDeductionOpen">
          Add Investment <span class="info-icon">ⓘ</span>
        </button>
      </div>
    </div>

    <!-- Section 80EEA Investments -->
    <div class="section">
      <h3 class="subsection-title">Investments under Section 80EE</h3>

      <div class="grid-wrapper">
        <!-- Left: Bullet Points -->
        <ul class="requirements-list">
          <li>
            Rebate under Section 80EE is available only to those individual
            borrowers whose loan was sanctioned between 1 April 2016 and 31
            March 2017.
          </li>
          <li>Value of the house should be Rs 50 lakh or less.</li>
          <li>Loan taken for the house must be Rs 35 lakh or less.</li>
        </ul>
        <div class="amounts-table-grid">
          <div class="grid-item label">Declared Amount</div>
          <div class="grid-item value">₹ {{ declaredinvestment }}</div>
          <div class="grid-item label">Approved Amount</div>
          <div class="grid-item value">₹ {{ approvedinvestment }}</div>
        </div>
      </div>
      <v-data-table
        :headers="headersInvestment"
        :items="investmentEntries"
        class="elevation-1 mb-6"
        hide-default-footer
      >
        <template v-slot:item.fileId="{ item }">
          <td>
            <v-btn
              icon
              :disabled="!item.fileId"
              @click="downloadFile(item.fileId)"
              title="Download Proof Document"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </td>
        </template>
        <template v-slot:item.actions="{ item }">
          <td>
            <v-icon small @click="deleteinvestment(item)" class="cursor-pointer"
              >mdi-delete</v-icon
            >
          </td>
        </template>
        <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending' && userRole === 'Admin'">
              <v-btn
                small
                color="green"
                class="mr-2"
                @click="acceptInvestment(item)"
              >
                Accept
              </v-btn>
              <v-btn small color="red" @click="rejectInvestment(item)">
                Reject
              </v-btn>
            </div>
            <div v-else>
              <v-chip color="pink lighten-4">
                {{ item.status }}
              </v-chip>
            </div>
          </td>
        </template>
      </v-data-table>

      <!-- Buttons -->
      <div class="action-buttons" v-if="userRole == 'Admin'">
        <button class="add-investment-btn" @click="homeInvestmentOpen">
          Add Investment <span class="info-icon">ⓘ</span>
        </button>
      </div>

      <v-dialog v-model="showDeduction" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New Home Loan Declaration</span>
            <v-spacer></v-spacer>
            <v-btn icon @click="closeDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="loanDeduction.amountPaid"
                    label="Amount Paid *"
                    prefix="₹"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Amount Paid is required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="loanDeduction.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  />
                </v-col>
              

              
                <v-col cols="12">
                  <v-file-input
                    @change="uploadFile"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
                 <v-col cols="12">
            <v-card variant="outlined" class="pa-4 bg-grey-lighten-5">
              <v-checkbox
                v-model="loanDeduction.disclaimer"
                color="black"
                :rules="[(v) => !!v || 'You must accept the disclaimer']"
              >
                <template v-slot:label>
                  <div>
                    <strong>Disclaimer:</strong> I hereby declare that all the information provided and documents uploaded are true and correct to the best of my knowledge. I understand that any false statement may result in disciplinary action.
                  </div>
                </template>
              </v-checkbox>
            </v-card>
          </v-col>
           </v-row>   
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialogDeduction"
              >Cancel</v-btn
            >
            <v-btn color="primary" @click="homeDeduction">Add Home Loan</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showInvestment" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New Home Loan Declaration</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="loanDeduction.amountPaid"
                    label="Amount Paid *"
                    prefix="₹"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Amount Paid is required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="loanDeduction.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  />
                </v-col>
       
                <v-col cols="12">
                  <v-file-input
                    @change="uploadFile"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
                 <v-col cols="12">
            <v-card variant="outlined" class="pa-4 bg-grey-lighten-5">
              <v-checkbox
                v-model="loanDeduction.disclaimer"
                color="black"
                :rules="[(v) => !!v || 'You must accept the disclaimer']"
              >
                <template v-slot:label>
                  <div>
                    <strong>Disclaimer:</strong> I hereby declare that all the information provided and documents uploaded are true and correct to the best of my knowledge. I understand that any false statement may result in disciplinary action.
                  </div>
                </template>
              </v-checkbox>
            </v-card>
          </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialogDeduction"
              >Cancel</v-btn
            >
            <v-btn color="primary" @click="homeInvestment">Add Home Loan</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showDialog" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New Home Loan Declaration</span>
            <v-spacer></v-spacer>
            <v-btn icon @click="closeDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="loanForm.amountPaid"
                    label="Amount Paid *"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Monthly Rent is required']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="loanForm.lenderName"
                    label="Lender Name *"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Monthly Rent is required']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="loanForm.lenderPAN"
                    label="Lender PAN *"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Monthly Rent is required']"
                  ></v-text-field>
                </v-col>
              
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="loanForm.lenderAddress"
                    label="Lender Address *"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Monthly Rent is required']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="loanForm.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  ></v-text-field>
                </v-col>
            
                <v-col cols="12" sm="6">
                  <v-file-input
                    @change="uploadFile"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
                <v-col cols="12">
            <v-card variant="outlined" class="pa-4 bg-grey-lighten-5">
              <v-checkbox
                v-model="loanForm.disclaimer"
                color="black"
                :rules="[(v) => !!v || 'You must accept the disclaimer']"
              >
                <template v-slot:label>
                  <div>
                    <strong>Disclaimer:</strong> I hereby declare that all the information provided and documents uploaded are true and correct to the best of my knowledge. I understand that any false statement may result in disciplinary action.
                  </div>
                </template>
              </v-checkbox>
            </v-card>
          </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialog">
              Cancel
            </v-btn>
            <v-btn color="primary" @click="addHomeLoan"> Add Home Loan</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { authService } from "@/services/authService";
import { useRoute, useRouter } from "vue-router";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { tdsRules, fetchTDSRules } from "@/services/tds/tdsRule";

const route = useRoute();
const router = useRouter();
const matchedPhase = ref(null);

const id = route.params.id;
const token = authService.getToken();
const userRole = currentUserTenant.getRole();

const showDialog = ref(false);
const showDeduction = ref(false);
const showInvestment = ref(false);

const handleClose = () => {
  router.push({ name: "TdsDeductionDefault", params: { id } });
};
let loanForm = reactive({
  amountPaid: "",
  lenderName: "",
  lenderPAN: "",
  lenderAddress: "",
  comments: "",
});
let loanDeduction = reactive({
  amountPaid: "",
  comments: "",
  document: null,
});
const uploading = ref(false);
const uploadFile = async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  uploading.value = true;
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (openAddInvestmentDialog) {
      loanForm.document = data.data.id;
    }
    if (homeDeductionOpen) {
      loanDeduction.document = data.data.id;
    }
    if (homeInvestmentOpen) {
      loanDeduction.document = data.data.id;
    }
  } catch (err) {
    console.error("File upload failed:", err);
  } finally {
    uploading.value = false;
  }
};

const homeLoanForm = ref(null);

const homeDeductionOpen = () => {
  showDeduction.value = true;
};
const homeInvestmentOpen = () => {
  showInvestment.value = true;
};

const addHomeLoan = async () => {
  const mandatoryFields = [
    "amountPaid",
    "lenderName",
    "lenderPAN",
    "lenderAddress",
  ];
  const fieldsToValidate = [...mandatoryFields];

  const missingFields = fieldsToValidate.filter((field) => !loanForm[field]);

  if (missingFields.length > 0) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    let updatedLoans = JSON.parse(JSON.stringify(rentEntries.value));

    if (!updatedLoans) {
      updatedLoans = [];
    }

    const maxId = updatedLoans.length
      ? Math.max(...updatedLoans.map((item) => item.id || 0))
      : 0;

    const isEdit = !!loanForm.id;
    if (isEdit) {
      updatedLoans = updatedLoans.map((item) =>
        item.id === loanForm.id
          ? {
              ...item,
              amountPaid: loanForm.amountPaid,
              lenderName: loanForm.lenderName,
              lenderPAN: loanForm.lenderPAN,
              lenderAddress: loanForm.lenderAddress,
              fileId: loanForm.document,
              comments: loanForm.comments || "",
              status: item.status || "pending",
            }
          : item,
      );
    } else {
      updatedLoans.push({
        id: maxId + 1,
        amountPaid: loanForm.amountPaid,
        lenderName: loanForm.lenderName,
        lenderPAN: loanForm.lenderPAN,
        lenderAddress: loanForm.lenderAddress,
        fileId: loanForm.document,
        comments: loanForm.comments || "",
        status: "pending",
      });
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          homeLoan: {
            homeLoan: updatedLoans,
            totalDeclaredAmount: updatedLoans.reduce(
              (sum, loan) => sum + (loan.amountPaid || 0),
              0,
            ),
            totalApprovedAmount: approvedhomeLoan.value,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update item");

    closeDialog();
    await fetchItemData();
  } catch (err) {
    console.error("PATCH error:", err);
  }
};
const homeDeduction = async () => {
  const mandatoryFields = ["amountPaid"];
  const fieldsToValidate = [...mandatoryFields];

  const missingFields = fieldsToValidate.filter(
    (field) => !loanDeduction[field],
  );

  if (missingFields.length > 0) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const existingData =
      tdsData.value?.homeLoanDeduction?.totalApprovedAmount || {};

    let updatedDeductions = JSON.parse(JSON.stringify(deductionEntries.value));
    console.log(deductionEntries.value);

    if (!updatedDeductions) {
      updatedDeductions = [];
    }

    const maxId = updatedDeductions.length
      ? Math.max(...updatedDeductions.map((item) => item.id || 0))
      : 0;

    updatedDeductions.push({
      id: maxId + 1,
      amountPaid: loanDeduction.amountPaid,
      fileId: loanDeduction.document,
      comments: loanDeduction.comments || "",
      status: "pending",
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          homeLoanDeduction: {
            homeLoanDeduction: updatedDeductions,
            totalDeclaredAmount: updatedDeductions.reduce(
              (sum, loan) => sum + (loan.amountPaid || 0),
              0,
            ),
            totalApprovedAmount: existingData,
          },
          id: tdsDeductionId.value,
        }),
      },
    );
    if (totalDeclaredAmount > 200000) {
      alert("Total declared amount cannot exceed ₹2,00,000.");
      return;
    }
    if (!response.ok) throw new Error("Failed to update item");

    closeDialogDeduction();

    await fetchItemData();
  } catch (err) {
    console.error("PATCH error:", err);
  }
};
const homeInvestment = async () => {
  const mandatoryFields = ["amountPaid"];
  const fieldsToValidate = [...mandatoryFields];

  const missingFields = fieldsToValidate.filter(
    (field) => !loanDeduction[field],
  );

  if (missingFields.length > 0) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    let updatedDeductions = JSON.parse(JSON.stringify(investmentEntries.value));

    // Ensure the array exists
    if (!updatedDeductions) {
      updatedDeductions = [];
    }

    // Find the next available ID
    const maxId = updatedDeductions.length
      ? Math.max(...updatedDeductions.map((item) => item.id || 0))
      : 0;

    // Push new item
    updatedDeductions.push({
      id: maxId + 1,
      amountPaid: loanDeduction.amountPaid,
      fileId: loanDeduction.document,
      status: "pending",
    });

    // Send PATCH request to update data
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          homeLoanInvestment: {
            homeLoanInvestment: updatedDeductions,
            totalDeclaredAmount: updatedDeductions.reduce(
              (sum, loan) => sum + (loan.amountPaid || 0),
              0,
            ),
            totalApprovedAmount: approvedinvestment.value,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update item");

    closeDialogDeduction();
    await fetchItemData();
  } catch (err) {
    console.error("PATCH error:", err);
  }
};

const headers = [
  { title: "Amount Paid", key: "amountPaid" },
  { title: "Lender Name", key: "lenderName" },
  { title: "Lender PAN", key: "lenderPAN" },
  { title: "Lender Address", key: "lenderAddress" },
  { title: "Doccuments", key: "fileId" },
  { title: "Status", key: "status" },
  { title: "Action", key: "actions" },
];

const headersDeduction = [
  { title: "Amount Paid", key: "amountPaid" },
  { title: "Doccuments", key: "fileId" },
  { title: "Status", key: "status" },
  { title: "Action", key: "actions" },
];

const headersInvestment = [
  { title: "Amount Paid", key: "amountPaid" },
  { title: "Doccuments", key: "fileId" },
  { title: "Status", key: "status" },
  { title: "Action", key: "actions" },
];

const downloadFile = async (fileId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/assets/${fileId}`,
      {
        methods: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to download the report.");
    }

    const blob = await response.blob();

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("failed to download file");
  }
};
const acceptItem = async (item) => {
  try {
    const updatedDeductions = JSON.parse(JSON.stringify(rentEntries.value));

    const updatedHraRent = updatedDeductions.map((entry) => {
      if (entry.id === item.id) {
        return {
          ...entry,
          status: "accepted",
          approvedAmount: entry.amountPaid,
        };
      }
      return entry;
    });

    const approvedSum = updatedHraRent.reduce(
      (sum, entry) => sum + (entry.approvedAmount || 0),
      0,
    );
    const totalApprovedAmount = Math.min(approvedSum, 200000);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          homeLoan: {
            homeLoan: updatedHraRent,
            totalApprovedAmount,
            totalDeclaredAmount: declaredhomeLoan.value,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update status");

    await fetchItemData();
  } catch (err) {
    console.error("Accept item error:", err);
  }
};
const deleteItem = async (item) => {
  try {
    const updatedDeductions = rentEntries.value.filter(
      (entry) => entry.id !== item.id,
    );

    const approvedSum = updatedDeductions.reduce(
      (sum, entry) => sum + (entry.approvedAmount || 0),
      0,
    );
    const totalApprovedAmount = Math.min(approvedSum, 200000);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          homeLoan: {
            homeLoan: updatedDeductions,
            totalApprovedAmount,
            totalDeclaredAmount: declaredhomeLoan.value,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to delete item");

    await fetchItemData();
  } catch (err) {
    console.error("Delete item error:", err);
  }
};

const rejectItem = async (item) => {
  try {
    const updatedDeductions = JSON.parse(JSON.stringify(rentEntries.value));

    // Update the status of the selected item to "rejected"
    const updatedHraRent = updatedDeductions.map((entry) => {
      if (entry.id === item.id) {
        return { ...entry, status: "Rejected", approvedAmount: "0" };
      }
      return entry;
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          homeLoan: {
            homeLoan: updatedHraRent,
            totalApprovedAmount: approvedhomeLoan.value,
            totalDeclaredAmount: declaredhomeLoan.value,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update status");

    await fetchItemData();
  } catch (err) {
    console.error("Reject item error:", err);
  }
};

const acceptDeduction = async (item) => {
  try {
    const existingData =
      tdsData.value?.homeLoanDeduction?.totalDeclaredAmount || {};

    const updatedDeductions = JSON.parse(
      JSON.stringify(deductionEntries.value),
    );

    // Update the status of the selected item
    const updatedHraRent = updatedDeductions.map((entry) => {
      if (entry.id === item.id) {
        return {
          ...entry,
          status: "accepted",
          approvedAmount: entry.amountPaid,
        };
      }
      return entry;
    });

    const approvedSum = updatedHraRent.reduce(
      (sum, entry) => sum + (entry.approvedAmount || 0),
      0,
    );
    const totalApprovedAmount = Math.min(approvedSum, 200000);

    alert(declareddeduction.value);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          homeLoanDeduction: {
            homeLoanDeduction: updatedHraRent,
            totalApprovedAmount,

            totalDeclaredAmount: existingData,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update status");

    await fetchItemData();
  } catch (err) {
    console.error("Accept item error:", err);
  }
};
const deletededuction = async (item) => {
  try {
    // Filter out the item to be deleted
    const updatedDeductions = deductionEntries.value.filter(
      (entry) => entry.id !== item.id,
    );

    const approvedSum = updatedDeductions.reduce(
      (sum, entry) => sum + (entry.approvedAmount || 0),
      0,
    );

    const declaredSum = updatedDeductions.reduce(
      (sum, entry) => sum + (entry.amountPaid || 0),
      0,
    );

    const totalApprovedAmount = Math.min(approvedSum, 200000);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          homeLoanDeduction: {
            homeLoanDeduction: updatedDeductions,
            totalApprovedAmount,
            totalDeclaredAmount: declaredSum,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update after delete");

    await fetchItemData();
  } catch (err) {
    console.error("Delete item error:", err);
  }
};

const rejectDeduction = async (item) => {
  try {
    const existingTotalApprovedData =
      tdsData.value?.homeLoanDeduction?.totalApprovedAmount || {};
    const existingData =
      tdsData.value?.homeLoanDeduction?.totalDeclaredAmount || {};

    const updatedDeductions = JSON.parse(
      JSON.stringify(deductionEntries.value),
    );

    // Update the status of the selected item to "rejected"
    const updatedHraRent = updatedDeductions.map((entry) => {
      if (entry.id === item.id) {
        return { ...entry, status: "Rejected", approvedAmount: "0" };
      }
      return entry;
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          homeLoanDeduction: {
            homeLoanDeduction: updatedHraRent,
            totalDeclaredAmount: existingData,
            totalApprovedAmount: existingTotalApprovedData,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update status");

    await fetchItemData();
  } catch (err) {
    console.error("Reject item error:", err);
  }
};

const acceptInvestment = async (item) => {
  try {
    const updatedDeductions = JSON.parse(
      JSON.stringify(investmentEntries.value),
    );

    // Update the status of the selected item
    const updatedHraRent = updatedDeductions.map((entry) => {
      if (entry.id === item.id) {
        return {
          ...entry,
          status: "accepted",
          approvedAmount: entry.amountPaid,
        };
      }
      return entry;
    });

    const approvedSum = updatedHraRent.reduce(
      (sum, entry) => sum + (entry.approvedAmount || 0),
      0,
    );
    const totalApprovedAmount = Math.min(approvedSum, 200000);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          homeLoanInvestment: {
            homeLoanInvestment: updatedHraRent,
            totalApprovedAmount,
            totalDeclaredAmount: declaredinvestment.value,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update status");

    await fetchItemData();
  } catch (err) {
    console.error("Accept item error:", err);
  }
};
const deleteinvestment = async (item) => {
  try {
    // Filter out the deleted item
    const updatedEntries = investmentEntries.value.filter(
      (entry) => entry.id !== item.id,
    );

    // Recalculate total declared and approved amount
    const totalDeclaredAmount = updatedEntries.reduce(
      (sum, entry) => sum + (entry.amountPaid || 0),
      0,
    );

    const totalApprovedAmount = Math.min(
      updatedEntries.reduce(
        (sum, entry) => sum + (entry.approvedAmount || 0),
        0,
      ),
      200000,
    );

    // PATCH the updated data
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          homeLoanInvestment: {
            homeLoanInvestment: updatedEntries,
            totalDeclaredAmount,
            totalApprovedAmount,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to delete and update data");

    await fetchItemData();
  } catch (err) {
    console.error("Delete investment error:", err);
  }
};

const rejectInvestment = async (item) => {
  try {
    const updatedDeductions = JSON.parse(
      JSON.stringify(investmentEntries.value),
    );

    // Update the status of the selected item to "rejected"
    const updatedHraRent = updatedDeductions.map((entry) => {
      if (entry.id === item.id) {
        return { ...entry, status: "Rejected", approvedAmount: "0" };
      }
      return entry;
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          homeLoanInvestment: {
            homeLoanInvestment: updatedHraRent,
            totalApprovedAmount: approvedinvestment.value,
            totalDeclaredAmount: declaredinvestment.value,
          },
          id: tdsDeductionId.value,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update status");

    await fetchItemData();
  } catch (err) {
    console.error("Reject item error:", err);
  }
};

const openAddInvestmentDialog = () => {
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};
const closeDialogDeduction = () => {
  showInvestment.value = false;
  showDeduction.value = false;
};
const fetchItemData = async () => {
  try {
    const params = {
      fields: ["homeLoan", "homeLoanDeduction", "homeLoanInvestment", "id"],
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${id}?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    processEarningsAndDeductions(data);

    await fetchTDSRules();

    if (!tdsRules.value || !tdsRules.value.length) {
      console.warn("TDS rules not loaded yet.");
      return;
    }
    const { declaration, reconcile, proofVerification } =
      tdsRules.value[0].duration;
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

    if (String(declaration).padStart(2, "0") === currentMonth) {
      matchedPhase.value = "declaration";
    } else if (String(reconcile).padStart(2, "0") === currentMonth) {
      matchedPhase.value = "reconcile";
    } else if (String(proofVerification).split("-").includes(currentMonth)) {
      matchedPhase.value = "proofVerification";
    }
  } catch (error) {
    console.error("Error fetching item data:", error);
  }
};
const tdsDeductionId = ref("");
const rentEntries = ref([]);
const deductionEntries = ref([]);
const investmentEntries = ref([]);
const declaredhomeLoan = ref([]);
const declareddeduction = ref([]);
const declaredinvestment = ref([]);
const approvedhomeLoan = ref([]);
const approveddeduction = ref([]);
const approvedinvestment = ref([]);
const tdsData = ref([]);

const processEarningsAndDeductions = (data) => {
  const tds = data?.data || {};
  tdsDeductionId.value = tds?.id;
  tdsData.value = data?.data;

  rentEntries.value = tds?.homeLoan?.homeLoan || [];
  deductionEntries.value = tds?.homeLoanDeduction?.homeLoanDeduction || [];
  investmentEntries.value = tds?.homeLoanInvestment?.homeLoanInvestment || [];

  declaredhomeLoan.value = tds?.homeLoan?.totalDeclaredAmount || 0;
  approvedhomeLoan.value = tds?.homeLoan?.totalApprovedAmount || 0;
  declareddeduction.value = tds?.homeLoanDeduction?.totalDeclaredAmount || 0;

  approveddeduction.value = tds?.homeLoanDeduction?.totalApprovedAmount;

  declaredinvestment.value = tds?.homeLoanInvestment?.totalDeclaredAmount;
  approvedinvestment.value = tds?.homeLoanInvestment?.totalApprovedAmount;
};
let editedItem = reactive({});
const editedIndex = ref();
const editItem = (item) => {
  loanForm = { ...item };
  editedIndex.value = rentEntries.value.findIndex((i) => i.id === item.id);
  showDialog.value = true;
};
const editdeductionEntries = (item) => {
  loanDeduction = { ...item };
  editedIndex.value = deductionEntries.value.findIndex((i) => i.id === item.id);
  showDeduction.value = true;
};
const editinvestment = (item) => {
  loanDeduction = { ...item };
  editedIndex.value = investmentEntries.value.findIndex(
    (i) => i.id === item.id,
  );
  showInvestment.value = true;
};

onMounted(async () => {
  await fetchItemData();
});
</script>

<style scoped>
.deductions-container {

  color: #333;
  max-width: 100%;
  margin: 0 auto;
  height: calc(90vh - 190px);
  overflow-y: auto;
}

.section {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 4px;
}

.gray-bg {
  background-color: #f2f2f2;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 15px;
}

.subsection-title {
  font-size: 18px;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 15px;
}

.info-text {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
}

.link {
  color: #0078d4;
  text-decoration: none;
}

.add-btn {
  background-color: transparent;
  color: #0078d4;
  border: 1px solid #0078d4;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.grid-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
  margin-bottom: 20px;
}

.amounts-table-grid {
  display: grid;
  grid-template-columns: auto auto;
  row-gap: 8px;
  column-gap: 8px;
  padding: 10px;
  border-radius: 4px;

  max-width: 250px;
  justify-self: end;
}

.grid-item.label {
  font-weight: bold;
  text-align: left;
}

.grid-item.value {
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.manage-btn,
.add-investment-btn {
  background-color: transparent;
  color: #0078d4;
  border: none;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.dropdown-icon,
.info-icon {
  margin-left: 5px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .amounts-table {
    overflow-x: auto;
  }
}
</style>
