<template>
  <div class="employee-form-container">
    <!-- Header -->
    <div class="form-header">
      <div class="header-left">
        <v-btn
          v-if="!isDialog"
          icon
          variant="text"
          @click="$router.push('/payroll/adhoc-payments')"
          class="back-button"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div class="employee-name-container">
          <v-icon left color="primary">mdi-account</v-icon>
          <span class="employee-name">{{
            $route.query.employeeName || "New Employee"
          }}</span>
        </div>
        <v-chip color="primary" text-color="white" class="ml-2">
          selectedMonth:{{ $route.query.month || "No Month Selected" }}
        </v-chip>
      </div>

      <div class="header-center">
        <h2 class="form-title">Add Adhoc Payments</h2>
      </div>

      <div class="header-right">
        <BaseButton
          variant="danger"
          size="sm"
          :left-icon="XCircle"
          color="red"
          class="ms-2"
          @click="cancelChanges"
        >
          Cancel
        </BaseButton>
      </div>
    </div>

    <!-- Main Content with Sidebar -->
    <div class="form-content-wrapper">
      <!-- Left Sidebar with Tabs -->
      <div class="sidebar">
        <v-list>
          <v-list-item
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="{ 'v-list-item--active': activeTab === tab.id }"
            :style="{
              minHeight: '54px !important',
              borderRight: '1px solid #e0e0e0',
            }"
          >
            <template v-slot:prepend>
              <v-tooltip location="right">
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" class="sidebar-icon">
                    {{ tab.icon }}
                  </v-icon>
                </template>
                <span>{{ tab.title }}</span>
              </v-tooltip>
            </template>

            <v-list-item-title class="sidebar-title">
              {{ tab.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <!-- Right Content Area -->
      <div class="form-content">
        <TabContent :active-tab="activeTab" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import TabContent from "@/pages/payroll/benifits/beniftsEdit.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { XCircle } from "lucide-vue-next";
import { useRouter } from 'vue-router'

// Simple reactive data
const activeTab = ref("bonus");
const employeeData = ref({});
const router = useRouter()

// Function to handle data updates from TabContent component
const updateEmployeeData = (newData) => {
  employeeData.value = {
    ...employeeData.value,
    ...newData,
  };
};

const tabs = [
  {
    id: "bonus",
    title: "Bonus",
    icon: "mdi-gift",
  },
  {
    id: "incentives",
    title: "Incentives",
    icon: "mdi-star-circle",
  },
  {
    id: "retention",
    title: "Retention Pay",
    icon: "mdi-account-cash",
  },
  {
    id: "arrears",
    title: "Salary Arrears",
    icon: "mdi-cash-refund",
  },
  {
    id: "deductions",
    title: "Deductions",
    icon: "mdi-minus-circle",
  },
];
const cancelChanges =() => {
   router.push('/payroll/adhoc-payments')
}
</script>
<style scoped>
.employee-form-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  width: 100%;
  max-width: 100%;
}

/* Improved Header Styles */
.form-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.employee-name-container {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  background-color: #f5f8ff;
  border: 1px solid #e0e0e0;
}

.employee-name {
  font-weight: 600;
  color: #1976d2;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* Rest of the styles remain the same */
.form-content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.form-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

:deep(.v-list-item--active) {
  background-color: #f5f5f5 !important;
  color: #1976d2 !important;
}

:deep(.v-list-item:hover) {
  background-color: #f0f0f0;
}

.has-error {
  color: rgb(var(--v-theme-error));
}

:deep(.v-list-item.has-error:not(.v-list-item--active)) {
  background-color: rgb(var(--v-theme-error), 0.1);
}

.sidebar-title {
  font-weight: 400;

}
@media (max-width: 768px) {
  .sidebar-title {
    display: none;
  }

  .sidebar {
    width: 80px;
  }

  .sidebar-icon {
    margin: auto;
  }
}
</style>
