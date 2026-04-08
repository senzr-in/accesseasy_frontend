<template>
  <div class="hr-dashboard">
    <v-container fluid>
      <!-- Header with back button -->
      <v-row class="mb-4">
        <v-col cols="12" class="d-flex align-center">
          <v-btn icon variant="text" :to="'/documents'" class="mr-2">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h4 font-weight-bold d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-account-cog</v-icon>
            HR Document Management
          </h1>
        </v-col>
      </v-row>

      <!-- Search and Filter -->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search employees..."
            variant="outlined"
            density="comfortable"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6" class="d-flex justify-end">
          <v-btn variant="outlined" class="mr-2">
            <v-icon class="mr-1">mdi-filter</v-icon>
            Filter
          </v-btn>
          <v-btn color="primary">View All Employees</v-btn>
        </v-col>
      </v-row>

      <!-- Tabs for Onboarding/Offboarding -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-tabs v-model="activeTab" bg-color="transparent" color="primary">
              <v-tab value="onboarding">Onboarding Documents</v-tab>
              <v-tab value="offboarding">Offboarding Documents</v-tab>
            </v-tabs>

            <v-divider></v-divider>

            <v-window v-model="activeTab">
              <!-- Onboarding Documents -->
              <v-window-item value="onboarding">
                <v-card-text>
                  <v-card class="mb-6">
                    <v-card-title
                      class="d-flex justify-space-between align-center"
                    >
                      <div>
                        <span class="text-h6 font-weight-bold"
                          >Employee: John Doe</span
                        >
                      </div>
                    </v-card-title>
                    <v-card-subtitle
                      >Software Engineer • Joining: June 1,
                      2025</v-card-subtitle
                    >
                    <v-card-text>
                      <h3 class="text-h6 font-weight-medium mb-4">
                        HR-Provided Documents
                      </h3>

                      <document-upload
                        title="Appointment Letter"
                        description="Signed appointment letter to be provided by HR"
                        :status="'hr_action'"
                        :required="true"
                        :is-hr-view="true"
                      ></document-upload>

                      <h3 class="text-h6 font-weight-medium mt-8 mb-4">
                        Employee-Uploaded Documents Requiring Verification
                      </h3>

                      <document-upload
                        title="Aadhaar Card"
                        description="Front and back of Aadhaar card"
                        :status="'completed'"
                        :required="true"
                        :is-hr-view="true"
                      ></document-upload>

                      <document-upload
                        title="PAN Card"
                        description="Clear scan of PAN card"
                        :status="'completed'"
                        :required="true"
                        :is-hr-view="true"
                      ></document-upload>

                      <document-upload
                        title="Educational Certificates"
                        description="10th, 12th, and Graduation certificates"
                        :status="'completed'"
                        :required="true"
                        :is-hr-view="true"
                      ></document-upload>
                    </v-card-text>
                  </v-card>
                </v-card-text>
              </v-window-item>

              <!-- Offboarding Documents -->
              <v-window-item value="offboarding">
                <v-card-text>
                  <v-card class="mb-6">
                    <v-card-title
                      class="d-flex justify-space-between align-center"
                    >
                      <div>
                        <span class="text-h6 font-weight-bold"
                          >Employee: Jane Smith</span
                        >
                      </div>
                    </v-card-title>
                    <v-card-subtitle
                      >Product Manager • Last Working Day: July 15,
                      2025</v-card-subtitle
                    >
                    <v-card-text>
                      <h3 class="text-h6 font-weight-medium mb-4">
                        HR-Provided Documents
                      </h3>

                      <document-upload
                        title="Resignation Acceptance Letter"
                        description="Formal acceptance issued by HR/Manager"
                        :status="'hr_action'"
                        :required="true"
                        :is-hr-view="true"
                      ></document-upload>

                      <document-upload
                        title="Experience Certificate"
                        description="Official document stating employment duration and role"
                        :status="'hr_action'"
                        :required="true"
                        :is-hr-view="true"
                      ></document-upload>

                      <document-upload
                        title="Relieving Letter"
                        description="Confirms employee has served notice period and is officially relieved"
                        :status="'hr_action'"
                        :required="true"
                        :is-hr-view="true"
                      ></document-upload>

                      <document-upload
                        title="Form 16"
                        description="To be issued at financial year end for tax filing"
                        :status="'hr_action'"
                        :required="true"
                        :is-hr-view="true"
                      ></document-upload>

                      <h3 class="text-h6 font-weight-medium mt-8 mb-4">
                        Employee-Uploaded Documents Requiring Verification
                      </h3>

                      <document-upload
                        title="Asset Return Form"
                        description="Checklist for company laptop, ID card, access card, etc."
                        :status="'completed'"
                        :required="true"
                        :is-hr-view="true"
                      ></document-upload>

                      <document-upload
                        title="Knowledge Transfer Document"
                        description="Documentation of key responsibilities and handover notes"
                        :status="'completed'"
                        :required="true"
                        :is-hr-view="true"
                      ></document-upload>
                    </v-card-text>
                  </v-card>
                </v-card-text>
              </v-window-item>
            </v-window>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import DocumentUpload from "@/components/documents/documentUpload.vue";

export default {
  name: "HrDashboard",
  components: {
    DocumentUpload,
  },
  data() {
    return {
      activeTab: "onboarding",
      search: "",
    };
  },
};
</script>
