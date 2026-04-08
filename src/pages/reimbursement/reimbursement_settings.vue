<template>
  <div class="transport-settings-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-text"></div>
        <div class="header-actions">
          <BaseButton
            variant="primary"
            :left-icon="PlusIcon"
            @click="openAddModal"
            text="Add Setting"
            :loading="externalLoading"
          />
        </div>
      </div>
    </div>

    <div class="settings-section">
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
          :items="paginatedSettings"
          :columns="tableColumns"
          :show-selection="false"
          :row-clickable="false"
        >
          <!-- Rate per KM Cell -->
          <template #cell-ratePerKm="{ value }"> {{ value }} /km </template>

          <!-- Actions Cell -->
          <template #cell-actions="{ item }">
            <div class="action-buttons">
              <ActionButton
                :icon="EditIcon"
                variant="ghost"
                tooltip="Edit setting"
                @click="openEditModal(item)"
              />
              <ActionButton
                :icon="TrashIcon"
                variant="ghost"
                tooltip="Delete setting"
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
            :total-items="totalSettings"
            :is-searching="loading"
          />
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal (kept inline to match original structure, but adapted) -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>
          {{
            modalMode === "add"
              ? "Add Transport Setting"
              : "Edit Transport Setting"
          }}
        </h3>
        <div class="title"></div>
        <form
          @submit.prevent="modalMode === 'add' ? addSetting() : updateSetting()"
        >
          <div class="form-group">
            <label for="transportType">Transport Type</label>
            <select
              v-model="currentSetting.transportName"
              id="transportType"
              required
              class="form-select"
            >
              <option value="" disabled>Select a transport type</option>
              <option value="Bus">Bus</option>
              <option value="Bike">Bike</option>
              <option value="Car">Car</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div class="form-group">
            <label for="rate">Rate per KM</label>
            <input
              v-model.number="currentSetting.ratePerKm"
              id="rate"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 10.50"
              required
            />
          </div>
          <div class="modal-buttons">
            <button
              type="submit"
              class="submit-button"
              :disabled="modalLoading"
            >
              {{ modalMode === "add" ? "Add" : "Update" }}
            </button>
            <button
              type="button"
              class="cancel-button"
              @click="closeModal"
              :disabled="modalLoading"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      :show="showDeleteModal"
      title="Delete Transport Setting"
      confirm-message="Are you sure you want to delete this transport setting?"
      item-label="Transport Name"
      :item-name="selectedSetting?.transportName"
      description="This action cannot be undone."
      :deleting="deleteLoading"
      @close="closeDeleteModal"
      @confirm="deleteSetting"
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
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";

import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import axios from "axios";

const settings = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(25);
const showModal = ref(false);
const modalMode = ref("add"); // 'add' or 'edit'
const currentSetting = ref({
  id: null,
  transportName: "",
  ratePerKm: null,
  status: "draft",
  tenant: null,
});
const showDeleteModal = ref(false);
const selectedSetting = ref(null);
const modalLoading = ref(false);
const deleteLoading = ref(false);
const externalLoading = ref(false);
const toastContainer = ref(null);
const token = ref(null);
const tenantId = ref(null);
const apiUrl = `${import.meta.env.VITE_API_URL}/items/transport`;

const tableColumns = [
  {
    key: "transportName",
    label: "Transport Name",
    sortable: false,
    width: "250px",
  },
  { key: "ratePerKm", label: "Rate per KM", sortable: false, width: "200px" },
  { key: "actions", label: "Actions", sortable: false, width: "120px" },
];

const totalSettings = computed(() => settings.value.length);

const paginatedSettings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return settings.value.slice(start, end);
});

async function init() {
  try {
    token.value = await authService.getToken();
    tenantId.value = await currentUserTenant.getTenantId();
    currentSetting.value.tenant = tenantId.value;
  } catch (error) {
    console.error("Error initializing:", error);
  }
}

async function fetchSettings() {
  loading.value = true;
  try {
    const response = await axios.get(
      `${apiUrl}?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId.value}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      },
    );
    settings.value = response.data.data;
  } catch (error) {
    console.error("Error fetching transport settings:", error);
    toastContainer.value?.error("Failed to fetch settings");
  } finally {
    loading.value = false;
  }
}

function openAddModal() {
  modalMode.value = "add";
  currentSetting.value = {
    id: null,
    transportName: "",
    ratePerKm: null,
    status: "draft",
    tenant: tenantId.value,
  };
  showModal.value = true;
}

function openEditModal(item) {
  modalMode.value = "edit";
  currentSetting.value = { ...item, tenant: tenantId.value };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  currentSetting.value = {
    id: null,
    transportName: "",
    ratePerKm: null,
    status: "draft",
    tenant: tenantId.value,
  };
  modalLoading.value = false;
}

async function addSetting() {
  if (
    currentSetting.value.transportName &&
    currentSetting.value.ratePerKm !== null
  ) {
    modalLoading.value = true;
    try {
      const response = await axios.post(
        apiUrl,
        {
          transportName: currentSetting.value.transportName,
          ratePerKm: currentSetting.value.ratePerKm,
          status: currentSetting.value.status,
          tenant: currentSetting.value.tenant,
        },
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        },
      );
      settings.value.push(response.data.data);
      toastContainer.value?.success("Setting added successfully");
      closeModal();
      await fetchSettings();
    } catch (error) {
      console.error("Error adding transport setting:", error);
      toastContainer.value?.error("Failed to add setting");
    } finally {
      modalLoading.value = false;
    }
  }
}

async function updateSetting() {
  if (
    currentSetting.value.transportName &&
    currentSetting.value.ratePerKm !== null
  ) {
    modalLoading.value = true;
    try {
      const response = await axios.patch(
        `${apiUrl}/${currentSetting.value.id}`,
        {
          transportName: currentSetting.value.transportName,
          ratePerKm: currentSetting.value.ratePerKm,
          status: currentSetting.value.status,
          tenant: currentSetting.value.tenant,
        },
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        },
      );
      const updatedIndex = settings.value.findIndex(
        (item) => item.id === currentSetting.value.id,
      );
      if (updatedIndex !== -1) {
        settings.value[updatedIndex] = response.data.data;
      }
      toastContainer.value?.success("Setting updated successfully");
      closeModal();
      await fetchSettings();
    } catch (error) {
      console.error("Error updating transport setting:", error);
      toastContainer.value?.error("Failed to update setting");
    } finally {
      modalLoading.value = false;
    }
  }
}

function openDeleteModal(item) {
  selectedSetting.value = item;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  selectedSetting.value = null;
  deleteLoading.value = false;
}

async function deleteSetting() {
  deleteLoading.value = true;
  try {
    await axios.delete(`${apiUrl}/${selectedSetting.value.id}`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
    settings.value = settings.value.filter(
      (item) => item.id !== selectedSetting.value.id,
    );
    toastContainer.value?.success("Setting deleted successfully");
    closeDeleteModal();
    await fetchSettings();
  } catch (error) {
    console.error("Error deleting transport setting:", error);
    toastContainer.value?.error("Failed to delete setting");
  } finally {
    deleteLoading.value = false;
  }
}

onMounted(async () => {
  await init();
  await fetchSettings();
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

.transport-settings-page {
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

.settings-section {
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

/* Modal Styles (kept from original) */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.modal-header {
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0 0 12px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.title {
  height: 2px;
  background-color: #059367; /* Green color */
  width: 100%;
  border-radius: 1px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path fill="%23333" d="M2 4l4 4 4-4H2z"/></svg>')
    no-repeat right 8px center;
  background-size: 12px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.submit-button,
.cancel-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button {
  background-color: #059367;
  color: white;
}

.submit-button:hover {
  background-color: #059367;
}

.cancel-button {
  background-color: #a0a0a0;
  color: white;
}

.cancel-button:hover {
  background-color: #e2e4e5;
}
</style>
