<template>
  <div class="attendance-cycles-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-text"></div>
        <div class="header-actions">
          <BaseButton
            variant="primary"
            :left-icon="PlusIcon"
            @click="openAddModal"
            text="Add Cycle"
            :loading="externalLoading"
          />
        </div>
      </div>
    </div>

    <div class="cycles-section">
      <div class="table-container">
        <!-- Skeleton loader while fetching -->
        <SkeletonLoading
          v-if="loading"
          variant="data-table"
          :rows="6"
          :columns="tableColumns.length"
        />

        <!-- Data Table -->
        <DataTable
          v-else
          :items="paginatedCycles"
          :columns="tableColumns"
          :show-selection="false"
          :row-clickable="false"
        >
          <!-- Weekends Cell -->
          <template #cell-weekends="{ value }">
            <span :class="['status-badge', value ? 'status-yes' : 'status-no']">
              {{ value ? "Yes" : "No" }}
            </span>
          </template>

          <!-- Holidays Cell -->
          <template #cell-holidays="{ value }">
            <span :class="['status-badge', value ? 'status-yes' : 'status-no']">
              {{ value ? "Yes" : "No" }}
            </span>
          </template>

          <!-- Actions Cell -->
          <template #cell-actions="{ item }">
            <div class="action-buttons">
              <ActionButton
                :icon="EditIcon"
                variant="ghost"
                tooltip="Edit cycle"
                @click="openEditModal(item)"
              />
              <ActionButton
                :icon="TrashIcon"
                variant="ghost"
                tooltip="Delete cycle"
                @click="openDeleteModal(item)"
              />
            </div>
          </template>
        </DataTable>

        <!-- Pagination -->
        <div class="pagination-wrapper" v-if="!loading">
          <CustomPagination
            v-model:page="currentPage"
            v-model:items-per-page="itemsPerPage"
            :total-items="totalCycles"
            :is-searching="loading"
          />
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <CycleModal
      :show="showModal"
      :cycle="selectedCycle"
      :loading="modalLoading"
      @close="closeModal"
      @save="saveCycle"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      :show="showDeleteModal"
      title="Delete Attendance Cycle"
      confirm-message="Are you sure you want to delete this attendance cycle?"
      item-label="Cycle Name"
      :item-name="selectedCycle?.cycleName"
      description="This action cannot be undone and may affect employee attendance tracking."
      :deleting="deleteLoading"
      @close="closeDeleteModal"
      @confirm="deleteCycle"
    />

    <!-- Toast Container -->
    <ToastContainer ref="toastContainer" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-vue-next";

// Components
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import ActionButton from "@/components/common/buttons/ActionButton.vue";
import ConfirmDeleteModal from "@/components/common/modals/ConfirmDeleteModal.vue";
import ToastContainer from "@/components/common/notifications/ToastContainer.vue";
import CycleModal from "@/components/modals/CycleModal/CycleModal.vue";
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";

// Composable
import { useAttendanceCycles } from "@/composables/cycle/useAttendanceCycles";

const {
  cycles,
  loading,
  fetchCycles,
  createCycle,
  updateCycle,
  deleteCycleById,
} = useAttendanceCycles();

const currentPage = ref(1);
const itemsPerPage = ref(25);
const showModal = ref(false);
const showDeleteModal = ref(false);
const selectedCycle = ref(null);
const modalLoading = ref(false);
const deleteLoading = ref(false);
const toastContainer = ref(null);

const tableColumns = [
  { key: "cycleName", label: "Cycle Name", sortable: false, width: "250px" },
  {
    key: "duration",
    label: "Duration",
    sortable: false,
    width: "200px",
  },
  {
    key: "weekends",
    label: "Include Weekends",
    sortable: false,
    width: "160px",
  },
  {
    key: "holidays",
    label: "Include Holidays",
    sortable: false,
    width: "160px",
  },
  { key: "actions", label: "Actions", sortable: false, width: "120px" },
];

const totalCycles = computed(() => cycles.value.length);

const paginatedCycles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return cycles.value.slice(start, end).map((cycle) => ({
    ...cycle,
    weekends: cycle.includeWeekends,
    holidays: cycle.includeHolidays,
    duration: `${cycle.startDate} - ${cycle.endDate}`,
  }));
});

const openAddModal = () => {
  selectedCycle.value = null;
  showModal.value = true;
};

const openEditModal = (cycle) => {
  selectedCycle.value = { ...cycle };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedCycle.value = null;
  modalLoading.value = false;
};

const openDeleteModal = (cycle) => {
  selectedCycle.value = cycle;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedCycle.value = null;
  deleteLoading.value = false;
};

const saveCycle = async (cycleData) => {
  modalLoading.value = true;
  try {
    if (selectedCycle.value?.cycleId) {
      await updateCycle(selectedCycle.value.cycleId, cycleData);
      toastContainer.value?.success("Cycle updated successfully");
    } else {
      await createCycle(cycleData);
      toastContainer.value?.success("Cycle created successfully");
    }
    closeModal();
    await fetchCycles();
  } catch (error) {
    toastContainer.value?.error("Failed to save cycle");
  } finally {
    modalLoading.value = false;
  }
};

const deleteCycle = async () => {
  deleteLoading.value = true;
  try {
    await deleteCycleById(selectedCycle.value.cycleId);
    toastContainer.value?.success("Cycle deleted successfully");
    closeDeleteModal();
    await fetchCycles();
  } catch (error) {
    toastContainer.value?.error("Failed to delete cycle");
  } finally {
    deleteLoading.value = false;
  }
};

onMounted(() => {
  fetchCycles();
});
</script>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 220px);
}

.table-container :deep(.data-table) {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.pagination-wrapper {
  flex-shrink: 0;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  background: white;
}

.attendance-cycles-page {
  margin: 0 auto;
}

.header-content {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.header-actions {
  flex-shrink: 0;
}

.cycles-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.section-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
}

.section-title h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.duration-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-yes {
  background: #dcfce7;
  color: #166534;
}

.status-no {
  background: #fef2f2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.pagination-wrapper {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
