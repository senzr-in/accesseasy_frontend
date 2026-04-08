<template>
  <div class="offboarding-documents">
    <v-container fluid>
      <!-- Header with back button and progress -->
      <v-row class="mb-4">
        <v-col cols="12" class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-btn icon variant="text" :to="'/documents'" class="mr-2">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h1 class="text-h4 font-weight-bold d-flex align-center">
              <v-icon color="error" size="32" class="mr-3"
                >mdi-account-minus</v-icon
              >
              Offboarding Documents
            </h1>
          </div>
          <div class="d-flex align-center">
            <span class="text-subtitle-1 font-weight-medium mr-2"
              >Overall Progress</span
            >
            <v-progress-linear
              v-model="progress"
              color="error"
              height="10"
              rounded
              class="mr-2"
              style="width: 200px"
            ></v-progress-linear>
            <span class="text-subtitle-1 font-weight-bold"
              >{{ progress }}%</span
            >
          </div>
        </v-col>
      </v-row>

      <!-- Employee Information Card -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card elevation="3" class="employee-card">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="8">
                  <h2 class="text-h5 font-weight-bold mb-2">
                    Employee Information
                  </h2>
                  <p class="text-subtitle-1">
                    <span class="font-weight-medium">Jane Smith</span> •
                    <span class="text-error">Product Manager</span> •
                    <span
                      >Last Working Day: <strong>July 15, 2025</strong></span
                    >
                  </p>
                </v-col>
                <v-col cols="12" md="4" class="d-flex align-center justify-end">
                  <v-btn color="error" size="large" class="px-4">
                    <v-icon class="mr-2">mdi-file-check-outline</v-icon>
                    Process Exit
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Document Categories Tabs -->
      <v-row>
        <v-col cols="12">
          <v-card elevation="3">
            <v-tabs
              v-model="activeTab"
              bg-color="background"
              color="error"
              grow
              slider-color="error"
              class="tab-header"
            >
              <v-tab
                value="resignation"
                class="text-subtitle-1 font-weight-medium"
              >
                <v-icon class="mr-2">mdi-file-sign</v-icon>
                Resignation
              </v-tab>
              <v-tab
                value="compliance"
                class="text-subtitle-1 font-weight-medium"
              >
                <v-icon class="mr-2">mdi-gavel</v-icon>
                Compliance
              </v-tab>
              <v-tab
                value="handover"
                class="text-subtitle-1 font-weight-medium"
              >
                <v-icon class="mr-2">mdi-laptop</v-icon>
                Asset & Handover
              </v-tab>
              <v-tab
                value="internal"
                class="text-subtitle-1 font-weight-medium"
              >
                <v-icon class="mr-2">mdi-file-certificate</v-icon>
                Internal Documents
              </v-tab>
            </v-tabs>

            <v-divider></v-divider>

            <v-window v-model="activeTab">
              <!-- Resignation Documents -->
              <v-window-item value="resignation">
                <v-card-text class="scroll-container">
                  <div class="section-header">
                    <h3 class="text-h5 font-weight-bold mb-2">
                      Resignation & Acceptance
                    </h3>
                    <p class="text-subtitle-1 text-grey-darken-1 mb-6">
                      Documents related to employee resignation process
                    </p>
                  </div>

                  <document-upload
                    title="Resignation Letter"
                    description="Employee's formal resignation letter or email"
                    :status="'completed'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="Resignation Acceptance Letter"
                    description="Formal acceptance issued by HR/Manager"
                    :status="'hr_action'"
                    :required="true"
                  ></document-upload>
                </v-card-text>
              </v-window-item>

              <!-- Compliance Documents -->
              <v-window-item value="compliance">
                <v-card-text class="scroll-container">
                  <div class="section-header">
                    <h3 class="text-h5 font-weight-bold mb-2">
                      Compliance & Statutory Documents
                    </h3>
                    <p class="text-subtitle-1 text-grey-darken-1 mb-6">
                      Legal and compliance documents for exiting employees
                    </p>
                  </div>

                  <document-upload
                    title="Experience Certificate"
                    description="Official document stating employment duration and role"
                    :status="'hr_action'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="Relieving Letter"
                    description="Confirms employee has served notice period and is officially relieved"
                    :status="'hr_action'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="Form 16"
                    description="To be issued at financial year end for tax filing"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>
                </v-card-text>
              </v-window-item>

              <!-- Asset & Handover Documents -->
              <v-window-item value="handover">
                <v-card-text class="scroll-container">
                  <div class="section-header">
                    <h3 class="text-h5 font-weight-bold mb-2">
                      Asset & Knowledge Handover
                    </h3>
                    <p class="text-subtitle-1 text-grey-darken-1 mb-6">
                      Return of company assets and knowledge transfer
                    </p>
                  </div>

                  <document-upload
                    title="Asset Return Form"
                    description="Checklist for company laptop, ID card, access card, etc."
                    :status="'pending'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="Knowledge Transfer Document"
                    description="Documentation of key responsibilities and handover notes"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>
                </v-card-text>
              </v-window-item>

              <!-- Internal Documents -->
              <v-window-item value="internal">
                <v-card-text class="scroll-container">
                  <div class="section-header">
                    <h3 class="text-h5 font-weight-bold mb-2">
                      Other Internal Documents
                    </h3>
                    <p class="text-subtitle-1 text-grey-darken-1 mb-6">
                      Company-specific exit documentation
                    </p>
                  </div>

                  <document-upload
                    title="No Dues Certificate (NDC)"
                    description="Signed by all relevant departments: IT, Admin, Finance, HR"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="Exit NDA"
                    description="Non-Disclosure Agreement reconfirmation"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="Exit Feedback Form"
                    description="Employee feedback on their experience with the company"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>
                </v-card-text>
              </v-window-item>
            </v-window>

            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn variant="outlined" size="large" class="mr-2">
                <v-icon class="mr-2">mdi-content-save</v-icon>
                Save Progress
              </v-btn>
              <v-btn color="error" size="large">
                <v-icon class="mr-2">mdi-check-circle</v-icon>
                Complete Offboarding
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import DocumentUpload from "@/components/documents/documentUpload.vue";

export default {
  name: "OffboardingDocuments",
  components: {
    DocumentUpload,
  },
  data() {
    return {
      progress: 25,
      activeTab: "resignation",
    };
  },
};
</script>

<style scoped>
.offboarding-documents {
  background-color: #f8f9fa;
}

.employee-card {
  border-left: 4px solid var(--v-error-base);
}

.scroll-container {
  height: calc(70vh - 170px);
  overflow-y: auto;
  padding: 24px;
}

.section-header {
  border-left: 4px solid var(--v-error-base);
  padding-left: 16px;
  margin-bottom: 24px;
}

.tab-header {
  background-color: #f5f7fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

/* Make text more eye-catching */
.text-h4,
.text-h5,
.text-h6 {
  letter-spacing: -0.5px;
}

.text-subtitle-1 {
  font-size: 16px !important;
  line-height: 1.5 !important;
}

.v-tab {
  font-weight: 600 !important;
  letter-spacing: 0.3px;
}

/* Improve button visibility */
.v-btn {
  letter-spacing: 0.5px;
  font-weight: 600;
}
</style>
