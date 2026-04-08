<template>
  <v-container style="max-width: 100%;">
    <div class="mt-6 mb-6">
      <h2 >
        Certificate Management
      </h2>
    </div>

    <v-tabs v-model="activeTab" class="mb-6">
      <v-tab value="upload">UPLOAD NEW CERTIFICATE</v-tab>
      <v-tab value="current">CURRENT CERTIFICATES</v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item value="upload">
        <div class="d-flex align-center mb-8">
          <v-icon class="mr-3">mdi-cloud-upload</v-icon>
          <span class="text-h6 font-weight-bold">Upload New Certificate</span>
        </div>

        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="documentType"
              :items="documentTypes"
              item-title="name"
              item-value="id"
              label="Document Type *"
              placeholder="Select document type"
              variant="outlined"
              density="comfortable"
              @update:model-value="resetSelections"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <div
                      :class="`${item.raw.color} rounded-circle mr-2`"
                      style="width: 12px; height: 12px"
                    ></div>
                  </template>
                </v-list-item>
              </template>
              <template v-slot:selection="{ item }">
                <div class="d-flex align-center">
                  <div
                    :class="`${item.raw.color} rounded-circle mr-2`"
                    style="width: 12px; height: 12px"
                  ></div>
                  {{ item.raw.name }}
                </div>
              </template>
            </v-select>
          </v-col>

          <v-col cols="12" md="4">
            <v-file-input
              v-model="selectedFile"
              label="Upload Certificate"
              accept=".pdf, .jpg, .jpeg, .png"
              :show-size="true"
              max-size="10000000"
              prepend-icon="mdi-upload"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            ></v-file-input>
           
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedState"
              :items="states"
              item-title="name"
              item-value="id"
              label="Select State *"
              placeholder="Select state"
              variant="outlined"
              density="comfortable"
            >
              <template v-slot:prepend-inner>
                <v-icon size="small" color="grey-darken-1"
                  >mdi-map-marker</v-icon
                >
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" md="4">
            
          </v-col>
        </v-row>

        <div class="mb-4" v-if="selectedFile">
          <v-chip
            color="primary"
            variant="flat"
            closable
            @click:close="selectedFile = null"
          >
            <v-icon start>mdi-file</v-icon>
            {{ selectedFile.name }}
          </v-chip>
        </div>

        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="issueDate"
              type="date"
              label="Issue Date *"
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="expiryDate"
              type="date"
              label="Expiry Date *"
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-col>
        </v-row>

        <div class="d-flex justify-end pt-4">
          <v-btn
            color="primary"
            size="large"
            :disabled="!isFormValid"
            @click="uploadCertificate"
            class="px-6"
          >
            <v-icon start>mdi-upload</v-icon>
            Upload Certificate
          </v-btn>
        </div>
      </v-tabs-window-item>

      <v-tabs-window-item value="current">
        <v-card elevation="2">
          <v-card-text class="text-center py-12">
            <v-icon size="48" color="grey-lighten-1" class="mb-4"
              >mdi-file-document</v-icon
            >
            <h3 class="text-h6 font-weight-medium text-grey-darken-2 mb-2">
              No certificates uploaded yet
            </h3>
            <p class="text-body-2 text-grey-darken-1">
              Upload your first certificate to see it here.
            </p>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";

const activeTab = ref("upload");
const documentType = ref("");
const selectedBranch = ref("");
const selectedState = ref("");
const selectedFile = ref(null);
const issueDate = ref("");
const expiryDate = ref("");
const certificateNumber = ref("");
const dragOver = ref(false);
const fileInput = ref(null);

const documentTypes = [
  {
    id: "esi",
    name: "ESI Certificate",
    requiresBranch: true,
    requiresState: false,
    color: "bg-blue-darken-2",
  },
  {
    id: "lwf",
    name: "LWF Certificate",
    requiresBranch: true,
    requiresState: false,
    color: "bg-purple-darken-2",
  },
  {
    id: "pt",
    name: "PT Certificate",
    requiresBranch: false,
    requiresState: true,
    color: "bg-orange-darken-2",
  },
  {
    id: "pf",
    name: "PF Certificate",
    requiresBranch: false,
    requiresState: true,
    color: "bg-green-darken-2",
  },
  {
    id: "shop",
    name: "Shop Establishment",
    requiresBranch: false,
    requiresState: false,
    color: "bg-indigo-darken-2",
  },
  {
    id: "factory",
    name: "Factory License",
    requiresBranch: false,
    requiresState: false,
    color: "bg-red-darken-2",
  },
  {
    id: "trade",
    name: "Trade License",
    requiresBranch: false,
    requiresState: false,
    color: "bg-yellow-darken-2",
  },
];

const branches = [
  { id: "delhi", name: "Delhi (New Delhi)", esi: "45464" },
  { id: "mumbai", name: "Mumbai (Maharashtra)", esi: "78901" },
  { id: "bangalore", name: "Bangalore (Karnataka)", esi: "23456" },
];

const states = [
  { id: "delhi-state", name: "Delhi", pf: "DL/12345" },
  { id: "maharashtra", name: "Maharashtra", pf: "MH/67890" },
  { id: "karnataka", name: "Karnataka", pf: "KA/11223" },
];

const currentDocumentType = computed(() =>
  documentTypes.find((doc) => doc.id === documentType.value),
);
const currentBranch = computed(() =>
  branches.find((b) => b.id === selectedBranch.value),
);
const currentState = computed(() =>
  states.find((s) => s.id === selectedState.value),
);

const isFormValid = computed(() => {
  if (!documentType.value) return false;
  if (currentDocumentType.value?.requiresBranch && !selectedBranch.value)
    return false;
  if (currentDocumentType.value?.requiresState && !selectedState.value)
    return false;
  if (!selectedFile.value || !issueDate.value || !expiryDate.value)
    return false;
  return true;
});

const resetSelections = () => {
  selectedBranch.value = "";
  selectedState.value = "";
  selectedFile.value = null;
  issueDate.value = "";
  expiryDate.value = "";
  certificateNumber.value = "";
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
  }
};

const handleFileDrop = (event) => {
  dragOver.value = false;
  const file = event.dataTransfer.files[0];
  if (file) {
    selectedFile.value = file;
  }
};

const uploadCertificate = () => {
  if (isFormValid.value) {
    console.log("Uploading certificate:", {
      documentType: documentType.value,
      branch: selectedBranch.value,
      state: selectedState.value,
      file: selectedFile.value,
      issueDate: issueDate.value,
      expiryDate: expiryDate.value,
      certificateNumber: certificateNumber.value,
    });
    // Add your upload logic here
    alert("Certificate uploaded successfully!");
    resetSelections();
    documentType.value = "";
  }
};
</script>

<style scoped></style>
