<template>
  <div class="document-management">
    <v-container fluid class="pa-4">
      <div class="d-flex align-center mb-3">
        <div class="title-bar">
          <h1 class="text-h5 font-weight-bold">Employee Document Management</h1>
          <p class="text-body-2 text-grey mb-0">
            Streamline your employee onboarding and offboarding document
            collection process
          </p>
        </div>
      </div>

      <v-row>
        <v-col cols="12" md="6" class="pa-2">
          <v-card class="doc-card onboarding-card" elevation="3">
            <div class="card-header">
              <v-avatar color="primary" size="42" class="header-icon">
                <v-icon color="white" size="24">mdi-account-plus</v-icon>
              </v-avatar>
              <h2 class="text-h6 font-weight-bold white--text">
                Onboarding Documents
              </h2>
            </div>
            <v-card-text class="pa-4">
              <p class="text-body-2 text-grey mb-4">
                Collect and manage all required documents for new employees
              </p>

              <div class="document-list">
                <v-hover v-slot="{ isHovering, props }">
                  <div
                    class="doc-item d-flex align-center mb-3 pa-2 rounded"
                    v-bind="props"
                    :class="{ 'doc-item-hover': isHovering }"
                  >
                    <v-avatar color="primary-lighten-5" size="36" class="mr-3">
                      <v-icon color="primary" size="18"
                        >mdi-card-account-details</v-icon
                      >
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-medium">
                        Personal & Identity Documents
                      </div>
                      <div class="text-caption text-grey">
                        Aadhaar, PAN, Passport, etc.
                      </div>
                    </div>
                  </div>
                </v-hover>

                <v-hover v-slot="{ isHovering, props }">
                  <div
                    class="doc-item d-flex align-center mb-3 pa-2 rounded"
                    v-bind="props"
                    :class="{ 'doc-item-hover': isHovering }"
                  >
                    <v-avatar color="indigo-lighten-5" size="36" class="mr-3">
                      <v-icon color="indigo" size="18">mdi-school</v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-medium">
                        Educational & Professional Documents
                      </div>
                      <div class="text-caption text-grey">
                        Certificates, Experience Letters, etc.
                      </div>
                    </div>
                  </div>
                </v-hover>

                <v-hover v-slot="{ isHovering, props }">
                  <div
                    class="doc-item d-flex align-center mb-3 pa-2 rounded"
                    v-bind="props"
                    :class="{ 'doc-item-hover': isHovering }"
                  >
                    <v-avatar color="green-lighten-5" size="36" class="mr-3">
                      <v-icon color="green" size="18">mdi-bank</v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-medium">
                        Banking & Tax Information
                      </div>
                      <div class="text-caption text-grey">
                        Bank details, Form 16, etc.
                      </div>
                    </div>
                  </div>
                </v-hover>

                <v-hover v-slot="{ isHovering, props }">
                  <div
                    class="doc-item d-flex align-center mb-3 pa-2 rounded"
                    v-bind="props"
                    :class="{ 'doc-item-hover': isHovering }"
                  >
                    <v-avatar color="amber-lighten-5" size="36" class="mr-3">
                      <v-icon color="amber-darken-2" size="18"
                        >mdi-file-document</v-icon
                      >
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-medium">
                        Statutory Forms
                      </div>
                      <div class="text-caption text-grey">
                        EPF, ESIC declarations, etc.
                      </div>
                    </div>
                  </div>
                </v-hover>
              </div>

              <v-btn
                color="primary"
                block
                class="mt-4 action-button"
                :to="'/documents/onboarding'"
                elevation="2"
              >
                MANAGE ONBOARDING DOCUMENTS
                <v-icon class="ml-2">mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" class="pa-2">
          <v-card class="doc-card offboarding-card" elevation="3">
            <div class="card-header">
              <v-avatar color="error" size="42" class="header-icon">
                <v-icon color="white" size="24">mdi-account-minus</v-icon>
              </v-avatar>
              <h2 class="text-h6 font-weight-bold white--text">
                Offboarding Documents
              </h2>
            </div>
            <v-card-text class="pa-4">
              <p class="text-body-2 text-grey mb-4">
                Process exit documentation for departing employees
              </p>

              <div class="document-list">
                <v-hover v-slot="{ isHovering, props }">
                  <div
                    class="doc-item d-flex align-center mb-3 pa-2 rounded"
                    v-bind="props"
                    :class="{ 'doc-item-hover': isHovering }"
                  >
                    <v-avatar color="pink-lighten-5" size="36" class="mr-3">
                      <v-icon color="pink" size="18">mdi-file-sign</v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-medium">
                        Resignation & Acceptance
                      </div>
                      <div class="text-caption text-grey">
                        Resignation letter, acceptance letter
                      </div>
                    </div>
                  </div>
                </v-hover>

                <v-hover v-slot="{ isHovering, props }">
                  <div
                    class="doc-item d-flex align-center mb-3 pa-2 rounded"
                    v-bind="props"
                    :class="{ 'doc-item-hover': isHovering }"
                  >
                    <v-avatar color="purple-lighten-5" size="36" class="mr-3">
                      <v-icon color="purple" size="18">mdi-gavel</v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-medium">
                        Compliance & Statutory Documents
                      </div>
                      <div class="text-caption text-grey">
                        Experience certificate, relieving letter, Form 16
                      </div>
                    </div>
                  </div>
                </v-hover>

                <v-hover v-slot="{ isHovering, props }">
                  <div
                    class="doc-item d-flex align-center mb-3 pa-2 rounded"
                    v-bind="props"
                    :class="{ 'doc-item-hover': isHovering }"
                  >
                    <v-avatar color="teal-lighten-5" size="36" class="mr-3">
                      <v-icon color="teal" size="18">mdi-laptop</v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-medium">
                        Asset & Knowledge Handover
                      </div>
                      <div class="text-caption text-grey">
                        Asset return form, knowledge transfer documents
                      </div>
                    </div>
                  </div>
                </v-hover>

                <v-hover v-slot="{ isHovering, props }">
                  <div
                    class="doc-item d-flex align-center mb-3 pa-2 rounded"
                    v-bind="props"
                    :class="{ 'doc-item-hover': isHovering }"
                  >
                    <v-avatar
                      color="blue-grey-lighten-5"
                      size="36"
                      class="mr-3"
                    >
                      <v-icon color="blue-grey" size="18"
                        >mdi-file-certificate</v-icon
                      >
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-medium">
                        Other Internal Documents
                      </div>
                      <div class="text-caption text-grey">
                        No dues certificate, exit NDA, feedback form
                      </div>
                    </div>
                  </div>
                </v-hover>
              </div>

              <v-btn
                color="error"
                block
                class="mt-4 action-button"
                :to="'/documents/offboarding'"
                elevation="2"
              >
                MANAGE OFFBOARDING DOCUMENTS
                <v-icon class="ml-2">mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "DocumentManagement",
  data() {
    return {};
  },
};
</script>

<style scoped>
.title-bar {
  position: relative;
  padding-left: 12px;
  margin-bottom: 16px;
}

.title-bar::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(
    to bottom,
    var(--v-primary-base),
    var(--v-primary-darken2)
  );
  border-radius: 4px;
}

.doc-card {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
  height: 100%;
}

.doc-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.onboarding-card .card-header {
  background: linear-gradient(
    135deg,
    var(--v-primary-base),
    var(--v-primary-darken2)
  );
}

.offboarding-card .card-header {
  background: linear-gradient(
    135deg,
    var(--v-error-base),
    var(--v-error-darken2)
  );
}

.header-icon {
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
}

.document-list {
  margin-top: 16px;
}

.doc-item {
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.doc-item-hover {
  background-color: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transform: translateX(4px);
}

.action-button {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  height: 44px;
}
</style>
