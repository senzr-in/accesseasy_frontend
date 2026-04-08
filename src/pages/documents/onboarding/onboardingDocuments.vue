<template>
  <div class="onboarding-documents">
    <v-container fluid>
      <!-- Header with back button and progress -->
      <v-row class="mb-4">
        <v-col cols="12" class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-btn icon variant="text" :to="'/documents'" class="mr-2">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h1 class="text-h4 font-weight-bold d-flex align-center">
              <v-icon color="primary" size="32" class="mr-3"
                >mdi-account-plus</v-icon
              >
              Onboarding Documents
            </h1>
          </div>
          <div class="d-flex align-center">
            <span class="text-subtitle-1 font-weight-medium mr-2"
              >Overall Progress</span
            >
            <v-progress-linear
              v-model="progress"
              color="primary"
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
                    <span class="font-weight-medium">John Doe</span> •
                    <span class="text-primary">Software Engineer</span> •
                    <span>Joining: <strong>June 1, 2025</strong></span>
                  </p>
                </v-col>
                <v-col cols="12" md="4" class="d-flex align-center justify-end">
                  <v-btn color="primary" size="large" class="px-4">
                    <v-icon class="mr-2">mdi-file-check-outline</v-icon>
                    Verify Documents
                  </v-btn>
                  <div class="d-flex align-center ml-4">
                    <v-tooltip
                      location="top"
                      text="Toggle for experienced employees"
                    >
                      <template v-slot:activator="{ props }">
                        <div class="d-flex align-center" v-bind="props">
                          <span class="text-subtitle-2 font-weight-bold mr-2"
                            >Experienced</span
                          >
                          <v-switch
                            v-model="isExperienced"
                            color="primary"
                            hide-details
                            density="compact"
                            inset
                          ></v-switch>
                        </div>
                      </template>
                    </v-tooltip>
                  </div>
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
              color="primary"
              grow
              slider-color="primary"
              class="tab-header"
            >
              <v-tab
                value="personal"
                class="text-subtitle-1 font-weight-medium"
              >
                <v-icon class="mr-2">mdi-card-account-details</v-icon>
                Personal & Identity
              </v-tab>
              <v-tab
                value="educational"
                class="text-subtitle-1 font-weight-medium"
              >
                <v-icon class="mr-2">mdi-school</v-icon>
                Educational
              </v-tab>
              <v-tab
                value="employment"
                class="text-subtitle-1 font-weight-medium"
              >
                <v-icon class="mr-2">mdi-briefcase</v-icon>
                Employment
              </v-tab>
              <v-tab value="banking" class="text-subtitle-1 font-weight-medium">
                <v-icon class="mr-2">mdi-bank</v-icon>
                Banking & Tax
              </v-tab>
              <v-tab
                value="statutory"
                class="text-subtitle-1 font-weight-medium"
              >
                <v-icon class="mr-2">mdi-file-document</v-icon>
                Statutory Forms
              </v-tab>
            </v-tabs>

            <v-divider></v-divider>

            <v-window v-model="activeTab">
              <!-- Personal & Identity Documents -->
              <v-window-item value="personal">
                <v-card-text class="scroll-container">
                  <div class="section-header">
                    <h3 class="text-h5 font-weight-bold mb-2">
                      Personal & Identity Documents
                    </h3>
                    <p class="text-subtitle-1 text-grey-darken-1 mb-6">
                      Essential identity documents required for all employees
                    </p>
                  </div>

                  <document-upload
                    title="Aadhaar Card"
                    description="Upload front and back of Aadhaar card"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="PAN Card"
                    description="Upload clear scan of PAN card"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="Passport"
                    description="Upload first and last pages of passport"
                    :status="'not_required'"
                    :required="false"
                  ></document-upload>

                  <document-upload
                    title="Driving License/Voter ID"
                    description="For address proof (any one)"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="Photographs"
                    description="Recent passport-sized photographs (white background)"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>
                </v-card-text>
              </v-window-item>

              <!-- Educational Documents -->
              <v-window-item value="educational">
                <v-card-text class="scroll-container">
                  <div class="section-header">
                    <h3 class="text-h5 font-weight-bold mb-2">
                      Educational & Professional Documents
                    </h3>
                    <p class="text-subtitle-1 text-grey-darken-1 mb-6">
                      Academic qualifications and professional certifications
                    </p>
                  </div>

                  <document-upload
                    title="10th Certificate"
                    description="Upload mark sheet and passing certificate"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="12th Certificate"
                    description="Upload mark sheet and passing certificate"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="Graduation Certificate"
                    description="Upload degree certificate and mark sheets"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="Post Graduation Certificate"
                    description="Upload if applicable"
                    :status="'not_required'"
                    :required="false"
                  ></document-upload>

                  <document-upload
                    title="Professional Certifications"
                    description="Upload relevant professional certifications"
                    :status="'not_required'"
                    :required="false"
                  ></document-upload>
                </v-card-text>
              </v-window-item>

              <!-- Employment Documents -->
              <v-window-item value="employment">
                <v-card-text class="scroll-container">
                  <div class="section-header">
                    <h3 class="text-h5 font-weight-bold mb-2">
                      Previous Employment Documents
                    </h3>
                    <p class="text-subtitle-1 text-grey-darken-1 mb-6">
                      {{
                        isExperienced
                          ? "Required for experienced employees"
                          : "Not applicable for freshers or first-time employees"
                      }}
                    </p>
                  </div>

                  <div
                    v-if="!isExperienced"
                    class="text-center py-8 border border-dashed rounded"
                  >
                    <h3 class="text-h6 font-weight-medium mb-2">
                      No Documents Required
                    </h3>
                    <p class="text-subtitle-1 text-grey-darken-1">
                      Since you're a fresher or first-time employee, no previous
                      employment documents are required.
                    </p>
                  </div>

                  <template v-else>
                    <document-upload
                      title="Previous Employment Offer Letters"
                      description="Upload offer letters from previous employers"
                      :status="'pending'"
                      :required="true"
                    ></document-upload>

                    <document-upload
                      title="Experience Letters"
                      description="Upload experience certificates from previous employers"
                      :status="'pending'"
                      :required="true"
                    ></document-upload>

                    <document-upload
                      title="Relieving Letter"
                      description="Upload relieving letter from last employer"
                      :status="'pending'"
                      :required="true"
                    ></document-upload>

                    <document-upload
                      title="Last 3 Months' Salary Slips"
                      description="Upload salary slips from previous employer"
                      :status="'pending'"
                      :required="true"
                    ></document-upload>

                    <document-upload
                      title="Bank Statements"
                      description="Upload bank statements showing salary credits"
                      :status="'pending'"
                      :required="false"
                    ></document-upload>
                  </template>
                </v-card-text>
              </v-window-item>

              <!-- Banking & Tax Documents -->
              <v-window-item value="banking">
                <v-card-text class="scroll-container">
                  <div class="section-header">
                    <h3 class="text-h5 font-weight-bold mb-2">
                      Banking & Tax Information
                    </h3>
                    <p class="text-subtitle-1 text-grey-darken-1 mb-6">
                      Financial details required for salary processing
                    </p>
                  </div>

                  <document-upload
                    title="Cancelled Cheque"
                    description="Upload cancelled cheque leaf or bank passbook first page"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="Form 16"
                    description="Upload Form 16 from previous employer (if applicable)"
                    :status="'not_applicable'"
                    :required="false"
                  ></document-upload>

                  <document-upload
                    title="Income Tax Declaration"
                    description="Upload income tax declaration form"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="Nomination Form"
                    description="For PF and Gratuity nomination"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>
                </v-card-text>
              </v-window-item>

              <!-- Statutory Forms -->
              <v-window-item value="statutory">
                <v-card-text class="scroll-container">
                  <div class="section-header">
                    <h3 class="text-h5 font-weight-bold mb-2">
                      Statutory Forms
                    </h3>
                    <p class="text-subtitle-1 text-grey-darken-1 mb-6">
                      Government-mandated forms and declarations
                    </p>
                  </div>

                  <document-upload
                    title="EPF Declaration (Form 11)"
                    description="Employee Provident Fund declaration form"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="ESIC Declaration Form"
                    description="Employee State Insurance Corporation form (if applicable)"
                    :status="'not_required'"
                    :required="false"
                  ></document-upload>

                  <document-upload
                    title="UAN Details"
                    description="Universal Account Number details for EPF (if available)"
                    :status="'pending'"
                    :required="true"
                  ></document-upload>

                  <document-upload
                    title="Appointment Letter"
                    description="Signed appointment letter (HR will provide)"
                    :status="'hr_action'"
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
              <v-btn color="primary" size="large">
                <v-icon class="mr-2">mdi-send-check</v-icon>
                Submit All Documents
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
  name: "OnboardingDocuments",
  components: {
    DocumentUpload,
  },
  data() {
    return {
      progress: 15,
      activeTab: "personal",
      isExperienced: false,
    };
  },
};
</script>

<style scoped>
.onboarding-documents {
  background-color: #f8f9fa;
}

.employee-card {
  border-left: 4px solid var(--v-primary-base);
}

.scroll-container {
  height: calc(70vh - 170px);
  overflow-y: auto;
  padding: 24px;
}

.section-header {
  border-left: 4px solid var(--v-primary-base);
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
