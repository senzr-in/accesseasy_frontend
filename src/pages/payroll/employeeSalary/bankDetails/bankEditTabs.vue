<template>
  <div class="employee-form-container">
    <!-- Header -->
    <div class="form-header">
      <div class="header-left">
        <v-btn
          v-if="!isDialog"
          icon
          variant="text"
          @click="cancelForm"
          class="back-button"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div class="employee-name-container">
          <v-icon left color="primary">mdi-account</v-icon>
          <span class="employee-name">{{
            employeeData.assignedUser?.first_name || "New Employee"
          }}</span>
        </div>
      </div>

      <div class="header-center">
        <h2 class="form-title">
          {{ isEditing ? "Edit Employee" : "Add Employee" }}
        </h2>
      </div>

      <div class="header-right">
        <v-btn color="error" variant="text" @click="cancelForm"> CANCEL </v-btn>
      </div>
    </div>

    <!-- Main Content with Sidebar -->
    <div class="form-content-wrapper">
      <div class="sidebar">
        <v-list>
          <v-list-item
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab"
            :class="{ 'v-list-item--active': currentTab.id === tab.id }"
            :style="{
              minHeight: '54px !important',
              borderRight: '1px solid #e0e0e0',
            }"
          >
            <template v-slot:prepend>
              <v-tooltip location="right">
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" class="sidebar-icon">{{
                    tab.icon
                  }}</v-icon>
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

      <div class="form-content">
        <component
          :is="currentTab.component"
          :id="id"
          :tenant-id="tenantId"
        ></component>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authService } from "@/services/authService";
import EditTab from "@/pages/payroll/employeeSalary/bankDetails/bankFrom.vue";

const token = authService.getToken();

const props = defineProps({
  isDialog: { type: Boolean, default: false },
});
const emit = defineEmits(["close"]);

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id);
const tenantId = ref(null);

// Employee data fetched for header display
const employeeData = ref({});
const isEditing = computed(() => !!id.value);

// Tabs without role filtering
const tabs = [
  {
    id: "bank",
    title: "Bank Details",
    icon: "mdi-bank",
    path: "bank",
    component: EditTab,
  },
];

const currentTab = ref(tabs[0]);

const cancelForm = () => {
  emit("close");
  router.push("/payroll/employee-salary/bank-details");
};

onMounted(async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${id.value}/?fields=assignedUser.first_name`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (response.ok) {
      const data = await response.json();
      employeeData.value = data.data || {};
    }
  } catch (err) {
    console.error("Failed to fetch employee data", err);
  }
});
</script>

<style scoped>
.employee-form-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  width: 100%;
}

.form-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
