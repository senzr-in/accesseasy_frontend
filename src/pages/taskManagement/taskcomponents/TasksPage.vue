<!-- senzrfieldopsfrontend/src/pages/taskManagement/taskcomponents/TasksPage.vue -->
<template>
  <div class="tasks-container">
    <div
      class="main-content"
      :class="{
        'with-filter': showFilters,
        'with-create': openCreateWO,
        'with-complete': openCompleteSidebar,
      }"
    >
      <DataTableWrapper
        v-model:searchQuery="searchQuery"
        @update:searchQuery="handleSearchUpdate"
        :total-items="totalItems"
        height="calc(95vh - 190px)"
      >
        <!-- Toolbar Actions Slot -->
        <template v-slot:toolbar-actions>
          <div class="wo-counters" aria-label="Work Order Status Counters">
            <div
              class="wo-pill total"
              role="button"
              aria-live="polite"
              @click="filterByStatus('')"
              :class="{ active: filters.status === '' }"
            >
              <ListChecks class="wo-icon" aria-hidden="true" />
              <span class="wo-label">Total</span>
              <span class="wo-count">{{ statusCounts?.total ?? 0 }}</span>
            </div>
            <div
              class="wo-pill pending"
              role="button"
              aria-live="polite"
              @click="filterByStatus('pending')"
              :class="{ active: filters.status === 'pending' }"
            >
              <Clock class="wo-icon" aria-hidden="true" />
              <span class="wo-label">Pending</span>
              <span class="wo-count">{{ statusCounts?.pending ?? 0 }}</span>
            </div>
            <div
              class="wo-pill overDue"
              role="button"
              aria-live="polite"
              @click="filterByStatus('overDue')"
              :class="{ active: filters.status === 'overDue' }"
            >
              <AlertTriangle class="wo-icon" aria-hidden="true" />
              <span class="wo-label">Over Due</span>
              <span class="wo-count">{{ statusCounts?.overDue ?? 0 }}</span>
            </div>
            <div
              class="wo-pill cancelled"
              role="button"
              aria-live="polite"
              @click="filterByStatus('cancelled')"
              :class="{ active: filters.status === 'cancelled' }"
            >
              <AlertTriangle class="wo-icon" aria-hidden="true" />
              <span class="wo-label">Cancelled</span>
              <span class="wo-count">{{ statusCounts?.cancelled ?? 0 }}</span>
            </div>
            <div
              class="wo-pill completed"
              role="button"
              aria-live="polite"
              @click="filterByStatus('completed')"
              :class="{ active: filters.status === 'completed' }"
            >
              <CheckCircle class="wo-icon" aria-hidden="true" />
              <span class="wo-label">Completed</span>
              <span class="wo-count">{{ statusCounts?.completed ?? 0 }}</span>
            </div>
          </div>
          <BaseButton
            variant="secondary"
            text="Filters"
            :leftIcon="Filter"
            :badge="hasActiveFilters ? '!' : null"
            @click="toggleFilters"
          />
          <BaseButton
            v-if="userRole === 'Employee' && selectedTaskIds.length > 0"
            variant="danger"
            :loading="externalLoading"
            :text="`Delete (${selectedTaskIds.length})`"
            :leftIcon="Trash2"
            @click="openDeleteModal = true"
          />
          <BaseButton
            variant="primary"
            :text="`Create Job`"
            :leftIcon="PlusIcon"
            :loading="externalLoading"
            @click="handleCreateWorkOrder"
          />
          <DropdownButton
            v-if="userRole === 'Admin'"
            text="Export"
            :leftIcon="Download"
            :items="exportItems"
            @itemClick="handleExport"
          />
        </template>

        <!-- Table content states -->
        <div v-if="isInitialLoading || loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="tasks.length || 10"
            :columns="6"
          />
        </div>
        <div v-else-if="error">
          <ErrorState
            title="Unable to load tasks"
            :message="error"
            @retry="fetchTasksWithFilters"
          />
        </div>
        <div v-else-if="!loading && !isInitialLoading && tasks.length === 0">
          <EmptyState
            title="No Work Orders found"
            message="Try adjusting your filters or create a new work order"
            :primaryAction="{ text: 'Create Work Order', icon: Plus }"
            :secondaryAction="{ text: 'Clear Filters', icon: X }"
            @primaryAction="openCreateWO = true"
            @secondaryAction="clearAllFiltersAndReload"
          />
        </div>
        <div v-else>
          <TaskTable
            :tasks="tasks"
            :selectedTaskIds="selectedTaskIds"
            :expandedTaskId="expandedTaskId"
            :sortBy="sortBy"
            :sortDirection="sortDirection"
            @toggleSelectAll="toggleSelectAll"
            @toggleTaskSelection="toggleTaskSelection"
            @requestSort="requestSort"
            @toggleExpandedDetails="toggleExpandedDetails"
            @openCompleteSidebar="handleOpenCompleteSidebar"
          />
        </div>

        <!-- Create Work Order Sidebar -->
        <CreateWorkOrderSidebar
          v-model="openCreateWO"
          @created="refreshTasks"
        />
        <!-- Complete Task Sidebar -->
        <CompleteTaskSidebar
          v-model="openCompleteSidebar"
          :task="selectedTaskForCompletion"
          @complete="handleTaskComplete"
          @saveDraft="handleTaskSaveDraft"
        />

        <!-- Pagination Slot -->
        <template v-slot:pagination>
          <CustomPagination
            v-model:page="currentPage"
            v-model:itemsPerPage="itemsPerPage"
            :total-items="totalItems"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>
    </div>

    <!-- Filter Panel -->
    <FilterPanel
      :show="showFilters"
      title="Task Filters"
      :hasFilters="hasActiveFilters"
      @close="showFilters = false"
      @clear="clearAllFiltersAndReload"
      @apply="applyFilters"
    >
      <FilterSection title="Month" :icon="Calendar">
        <FilterMonth
          v-model="filters.month"
          @change="applyFilters"
          @clear="clearMonthFilter"
        />
      </FilterSection>

      <FilterSection title="Task Type" :icon="Tag">
        <FilterSelect
          v-model="filters.assignFormId"
          :options="formTemplateOptions"
          placeholder="All Task Types"
          @change="applyFilters"
        />
      </FilterSection>

      <FilterSection title="Status" :icon="ListChecks">
        <FilterSelect
          v-model="filters.status"
          :options="statusOptions"
          placeholder="All Statuses"
          @change="applyFilters"
          @clear="clearStatusFilter"
        />
      </FilterSection>

      <!-- Replace the FilterSelect components with SearchableSelect -->
      <FilterSection title="Client" :icon="Building">
        <SearchableSelect
          v-model="filters.orgId"
          placeholder="All Clients"
          :static-options="clientOptions"
          :fetch-options="searchOrganizations"
          @change="applyFilters"
          @clear="clearClientFilter"
        />
      </FilterSection>

      <FilterSection title="Employee" :icon="User">
        <SearchableSelect
          v-model="filters.employeeUserId"
          placeholder="All Employees"
          :static-options="employeeOptions"
          :fetch-options="searchEmployees"
          @change="applyFilters"
          @clear="clearEmployeeFilter"
        />
      </FilterSection>
    </FilterPanel>

    <!-- Bottom Action Bar for Admin Bulk Actions -->
    <div
      v-if="userRole === 'Admin' && selectedTaskIds.length > 0"
      class="bottom-actions"
    >
      <BaseButton
        v-if="canRescheduleOrReassign"
        :leftIcon="Plus"
        variant="primary"
        text="Reassign"
        @click="openReassignModal = true"
      />
      <BaseButton
        v-if="canRescheduleOrReassign"
        :leftIcon="CalendarClock"
        variant="primary"
        text="Reschedule"
        @click="openRescheduleModal = true"
      />
      <BaseButton
        :leftIcon="Trash2"
        variant="danger"
        text="Delete"
        @click="openDeleteModal = true"
      />
      <BaseButton
        v-if="canCancel"
        :leftIcon="XCircle"
        variant="danger"
        text="Cancel task"
        :loading="externalLoading"
        @click="openCancelModal = true"
      />
    </div>

    <!-- Modals -->
    <ReassignModal
      v-if="openReassignModal"
      :show="openReassignModal"
      :taskIds="selectedTaskIds"
      :users="users"
      :currentEmployeeId="
        selectedTasks.length === 1 ? selectedTasks[0].employeeId : null
      "
      @close="openReassignModal = false"
      @reassign="handleReassign"
    />
    <RescheduleModal
      v-if="openRescheduleModal"
      :show="openRescheduleModal"
      :taskIds="selectedTaskIds"
      :currentFrom="selectedTasks.length === 1 ? selectedTasks[0].from : null"
      :currentDueTime="
        selectedTasks.length === 1 ? selectedTasks[0].dueTime : null
      "
      @close="openRescheduleModal = false"
      @reschedule="handleReschedule"
    />
    <ConfirmCancelModal
      v-if="openCancelModal"
      :show="openCancelModal"
      :taskIds="selectedTaskIds"
      :loading="externalLoading"
      @close="openCancelModal = false"
      @confirm="handleConfirmCancel"
    />
    <ConfirmDeleteModal
      :show="openDeleteModal"
      title="Delete Tasks"
      :itemLabel="'Task(s)'"
      :itemName="`${selectedTaskIds.length} selected`"
      :deleting="deleting"
      confirmText="Delete"
      cancelText="Cancel"
      @close="openDeleteModal = false"
      @confirm="handleConfirmDelete"
    />

    <!-- Toast Container -->
    <ToastContainer ref="toastContainer" />
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, watch } from "vue";
import { useRoute } from "vue-router";
import {
  Filter,
  Trash2,
  Plus as PlusIcon,
  Download,
  Calendar,
  Tag,
  X,
  ListChecks,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  CalendarClock,
  XCircle,
  Building,
  User,
} from "lucide-vue-next";

import { currentUserTenant } from "@/utils/currentUserTenant";
import { useFormApi } from "@/composables/workorder/createWorkOrderForm/useFormApi";
import { useTaskApi } from "@/composables/workorder/tasks/useTaskApi";
import { useTaskExport } from "@/composables/workorder/tasks/useTaskExport";
import { useTaskFilters } from "@/composables/workorder/tasks/useTaskFilters";

import TaskTable from "@/components/tasks_Components/table/taskTable.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import CreateWorkOrderSidebar from "@/pages/taskManagement/taskcomponents/formTemplate/AddTaskForm/CreateWorkOrderChoice.vue";
import CompleteTaskSidebar from "@/pages/taskManagement/taskcomponents/formTemplate/submitTaskForm/CompleteWorkOrder.vue";
import ReassignModal from "@/components/modals/tasks_Components/reassignModal.vue";
import RescheduleModal from "@/components/modals/tasks_Components/rescheduleModal.vue";
import ConfirmCancelModal from "@/components/modals/tasks_Components/confirmCancelModal.vue";
import ConfirmDeleteModal from "@/components/common/modals/ConfirmDeleteModal.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import FilterPanel from "@/components/common/filters/FilterPanel.vue";
import FilterSection from "@/components/common/filters/FilterSection.vue";
import FilterSelect from "@/components/common/filters/FilterSelect.vue";
import FilterMonth from "@/components/common/filters/FilterMonth.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DropdownButton from "@/components/common/buttons/DropdownButton.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import ToastContainer from "@/components/common/notifications/ToastContainer.vue";
import SearchableSelect from "@/components/common/filters/SearchableSelect.vue";

// State
const openCreateWO = ref(false);
const openCompleteSidebar = ref(false);
const selectedTaskForCompletion = ref(null);
const openDeleteModal = ref(false);
const openReassignModal = ref(false);
const openRescheduleModal = ref(false);
const openCancelModal = ref(false);
const deleting = ref(false);
const isInitialLoading = ref(true);
const externalLoading = ref(false);
const userRole = ref(null);

// Initialize composables
const taskApi = useTaskApi();
const taskExport = useTaskExport();
const taskFilters = useTaskFilters();
const formApi = useFormApi();
const route = useRoute();

const {
  tasks,
  formTemplates,
  loading,
  error,
  totalItems,
  fetchTasks,
  fetchFormTemplates,
  deleteSelectedTasks: apiDeleteSelectedTasks,
  updateMultipleTasks,
  statusCounts,
  fetchOrganizations,
  fetchEmployees,
  organizations,
  employees,
  searchOrganizations,
  searchEmployees,
} = taskApi;

const { exportData } = taskExport;

const {
  filters,
  searchQuery,
  hasActiveFilters,
  buildTaskFilterParams,
  clearAllFilters,
  clearStatusFilter,
  debouncedApplyFilters,
  clearClientFilter, // NEW
  clearEmployeeFilter, // NEW
} = taskFilters;

const { users, fetchDropdownData } = formApi;

// Component state
const showFilters = ref(false);
const expandedTaskId = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(25);
const selectedTaskIds = ref([]);
const sortBy = ref("date_created");
const sortDirection = ref("desc");
const toastContainer = ref(null);

// Computed
const selectedTasks = computed(() =>
  tasks.value.filter((t) => selectedTaskIds.value.includes(t.id)),
);

const canCancel = computed(() =>
  selectedTasks.value.every((t) => t.status === "pending"),
);

const formTemplateOptions = computed(() =>
  formTemplates.value.map((template) => ({
    label: template.formName,
    value: template.id,
  })),
);

const allTasksSelected = computed(
  () =>
    tasks.value.length > 0 &&
    selectedTaskIds.value.length === tasks.value.length,
);

const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "inprogress", value: "inprogress" },
  { label: "over Due", value: "overDue" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const exportItems = [
  { label: "Export to Excel", value: "excel", icon: Download },
  { label: "Export to CSV", value: "csv", icon: Download },
];

const canRescheduleOrReassign = computed(() => {
  if (selectedTasks.value.length === 0) return false;
  return selectedTasks.value.every(
    (t) => t.status !== "completed" && t.status !== "cancelled",
  );
});

// NEW: Client & Employee Options
const clientOptions = computed(() =>
  organizations.value.map((o) => ({
    label: o.label,
    value: o.id,
  })),
);

const employeeOptions = computed(() =>
  employees.value.map((e) => ({
    label: e.label,
    value: e.id,
  })),
);

// Methods
const fetchTasksWithFilters = async () => {
  const filterParams = buildTaskFilterParams();
  await fetchTasks({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: sortBy.value,
    sortDirection: sortDirection.value,
    filters: filterParams,
  });
  isInitialLoading.value = false;
};

const applyFilters = async () => {
  isInitialLoading.value = false;
  await debouncedApplyFilters(fetchTasksWithFilters);
};

const filterByStatus = (status) => {
  filters.status = status;
  currentPage.value = 1;
  applyFilters();
};

const clearAllFiltersAndReload = async () => {
  clearAllFilters();
  selectedTaskIds.value = [];
  sortBy.value = "date_created";
  sortDirection.value = "desc";
  currentPage.value = 1;
  isInitialLoading.value = true;
  await fetchTasksWithFilters();
};

const clearMonthFilter = () => {
  filters.month = null;
  applyFilters();
};

const toggleTaskSelection = (taskId) => {
  if (selectedTaskIds.value.includes(taskId)) {
    selectedTaskIds.value = selectedTaskIds.value.filter((id) => id !== taskId);
  } else {
    selectedTaskIds.value.push(taskId);
  }
};

const toggleSelectAll = () => {
  if (allTasksSelected.value) {
    selectedTaskIds.value = [];
  } else {
    selectedTaskIds.value = tasks.value.map((task) => task.id);
  }
};

const handleConfirmDelete = async () => {
  if (selectedTaskIds.value.length === 0) {
    toastContainer.value?.warning("No tasks selected for deletion.");
    openDeleteModal.value = false;
    return;
  }
  deleting.value = true;
  externalLoading.value = true;
  try {
    const success = await apiDeleteSelectedTasks(selectedTaskIds.value);
    if (success) {
      selectedTaskIds.value = [];
      toastContainer.value?.success("Tasks deleted successfully!");
      await fetchTasksWithFilters();
      openDeleteModal.value = false;
    } else {
      toastContainer.value?.error("Failed to delete tasks. Please try again.");
    }
  } catch (err) {
    toastContainer.value?.error("Failed to delete tasks: " + err.message);
  } finally {
    deleting.value = false;
    externalLoading.value = false;
  }
};

const handleReassign = async (payload) => {
  try {
    externalLoading.value = true;
    const { employeeId, status } = payload;
    await updateMultipleTasks(selectedTaskIds.value, { employeeId, status });
    toastContainer.value?.success("Tasks reassigned successfully!");
    await fetchTasksWithFilters();
    selectedTaskIds.value = [];
  } catch (err) {
    toastContainer.value?.error("Failed to reassign tasks: " + err.message);
  } finally {
    externalLoading.value = false;
    openReassignModal.value = false;
  }
};

const handleReschedule = async (payload) => {
  try {
    externalLoading.value = true;
    const { from, dueTime, status } = payload;
    await updateMultipleTasks(selectedTaskIds.value, { from, dueTime, status });
    toastContainer.value?.success("Tasks rescheduled successfully!");
    await fetchTasksWithFilters();
    selectedTaskIds.value = [];
  } catch (err) {
    toastContainer.value?.error("Failed to reschedule tasks: " + err.message);
  } finally {
    externalLoading.value = false;
    openRescheduleModal.value = false;
  }
};

const handleConfirmCancel = async () => {
  if (selectedTaskIds.value.length === 0) {
    toastContainer.value?.warning("No tasks selected for cancellation.");
    openCancelModal.value = false;
    return;
  }
  try {
    externalLoading.value = true;
    await updateMultipleTasks(selectedTaskIds.value, { status: "cancelled" });
    toastContainer.value?.success(
      `${selectedTaskIds.value.length} task(s) cancelled successfully!`,
    );
    selectedTaskIds.value = [];
    await fetchTasksWithFilters();
  } catch (err) {
    toastContainer.value?.error("Failed to cancel task(s): " + err.message);
  } finally {
    externalLoading.value = false;
    openCancelModal.value = false;
  }
};

const toggleExpandedDetails = (taskId) => {
  expandedTaskId.value = expandedTaskId.value === taskId ? null : taskId;
};

const handleCreateWorkOrder = () => {
  showFilters.value = false;
  openCompleteSidebar.value = false;
  openCreateWO.value = true;
};

const handleOpenCompleteSidebar = (task) => {
  if (!task?.id) {
    console.error("Task ID is undefined or missing:", task);
    toastContainer.value?.error("Cannot open task: Task ID is missing.");
    return;
  }
  showFilters.value = false;
  openCreateWO.value = false;
  selectedTaskForCompletion.value = task;
  openCompleteSidebar.value = true;
};

const handleTaskComplete = async ({ message, error }) => {
  try {
    externalLoading.value = true;
    if (error) {
      toastContainer.value?.error(error);
    } else {
      toastContainer.value?.success(message);
      await fetchTasksWithFilters();
      openCompleteSidebar.value = false;
      selectedTaskForCompletion.value = null;
    }
  } catch (err) {
    toastContainer.value?.error("Failed to complete task: " + err.message);
  } finally {
    externalLoading.value = false;
  }
};

const handleTaskSaveDraft = async ({ message, error }) => {
  try {
    externalLoading.value = true;
    if (error) {
      toastContainer.value?.error(error);
    } else {
      toastContainer.value?.success(message);
      await fetchTasksWithFilters();
      openCompleteSidebar.value = false;
      selectedTaskForCompletion.value = null;
    }
  } catch (err) {
    toastContainer.value?.error("Failed to save draft: " + err.message);
  } finally {
    externalLoading.value = false;
  }
};

const handlePageChange = async (newPage) => {
  currentPage.value = newPage;
  await fetchTasksWithFilters();
};

const handleItemsPerPageChange = async (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1;
  await fetchTasksWithFilters();
};

const requestSort = async (field) => {
  if (sortBy.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortDirection.value = "desc";
  }
  currentPage.value = 1;
  await fetchTasksWithFilters();
};

const handleExport = (item) => {
  const filterParams = buildTaskFilterParams();
  exportData(item.value, filterParams);
};

const handleSearchUpdate = (newSearchQuery) => {
  searchQuery.value = newSearchQuery;
  currentPage.value = 1;
  applyFilters();
};

const toggleFilters = () => {
  const newShowFilters = !showFilters.value;
  openCreateWO.value = false;
  openCompleteSidebar.value = false;
  showFilters.value = newShowFilters;
};

const refreshTasks = async () => {
  await fetchTasksWithFilters();
};

watch(openCompleteSidebar, (isOpen) => {
  if (!isOpen) {
    selectedTaskForCompletion.value = null;
  }
});

onBeforeMount(async () => {
  try {
    userRole.value = await currentUserTenant.getRoleAsync();
    await fetchFormTemplates();
    if (userRole.value === "Admin" || userRole.value === "Employee") {
      await fetchDropdownData();
    }

    // NEW: Fetch organizations & employees
    await Promise.all([fetchOrganizations(), fetchEmployees()]);

    await fetchTasksWithFilters();

    const statusFromQuery = route.query.status;
    if (statusFromQuery) {
      filters.status = statusFromQuery;
      await applyFilters();
    }
  } catch (err) {
    console.error("Error during initialization:", err);
    toastContainer.value?.error("Failed to initialize page: " + err.message);
  }
});

watch(
  () => route.query.status,
  (newStatus) => {
    if (newStatus) {
      filters.status = newStatus;
      applyFilters();
    } else if (filters.status !== "") {
      filters.status = "";
      applyFilters();
    }
  },
);
</script>

<style scoped>
.tasks-container {
  height: 100vh;
  display: flex;
  padding: 0;
  overflow: hidden;
  background-color: #f8fafc;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-right 0.3s ease;
}

.main-content.with-filter {
  margin-right: 350px;
}

@media (max-width: 1024px) {
  .main-content.with-filter,
  .main-content.with-create .main-content.with-complete {
    margin-right: 0;
  }
}

.wo-counters {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 12px;
  flex-wrap: wrap;
}

.wo-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: medium;
  line-height: 1;
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.wo-pill.active {
  border-color: #3b82f6;
  background-color: #e0f2fe;
}

.wo-icon {
  width: 16px;
  height: 16px;
}

.wo-label {
  font-weight: 600;
}

.wo-count {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.wo-pill.total {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #e2e8f0;
}

.wo-pill.total.active {
  background: #e0f2fe;
  border-color: #3b82f6;
}

.wo-pill.pending {
  background: #fff7ed;
  color: #9a3412;
  border-color: #fed7aa;
}

.wo-pill.pending.active {
  background: #ffedd5;
  border-color: #f97316;
}

.wo-pill.overDue {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.wo-pill.overDue.active {
  background: #fee2e2;
  border-color: #ef4444;
}

.wo-pill.cancelled {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.wo-pill.cancelled.active {
  background: #fee2e2;
  border-color: #ef4444;
}

.wo-pill.completed {
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.wo-pill.completed.active {
  background: #d1fae5;
  border-color: #10b981;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  border-top: 1px solid #e5e7eb;
  z-index: 10;
}
</style>
