<template>
  <div class="flex h-full w-full overflow-hidden">
    <!-- Filter Panel -->
    <div
      v-if="showFilters"
      class="w-80 border-r border-slate-200 dark:border-slate-800  bg-white dark:bg-slate-900  flex flex-col shrink-0"
    >
      <FilterComponent
        :tenant-id="tenantId"
        :initial-filters="initialFilters"
        :initially-visible="true"
        :filter-schema="pageFilters"
        @apply-filters="handleApplyFilters"
        @filter-visibility-changed="onFilterVisibilityChanged"
      />
    </div>

    <!-- Main Content -->
    <div class="flex-grow flex flex-col gap-4 p-4 overflow-hidden min-w-0">
      <!-- Business Value Header -->
      <ValueHeader
        title="Employee Directory"
        :action-text="isAdmin ? 'Add Employee' : ''"
        :action-icon="Plus"
        theme-color="slate"
        @action="handleCreateEmployee"
      />

      <!-- Toolbar: Search + Filter + Export on one line -->
      <div class="flex items-center justify-between gap-3">
        <!-- Search -->
        <div class="relative flex-1 max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            v-model="search"
            type="search"
            placeholder="Search employees..."
            class="w-full pl-9 pr-4 h-10 text-sm bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-800  rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-slate-900 dark:text-slate-100  placeholder:text-slate-400"
            @input="debouncedSearch"
          >
        </div>
        <!-- Right-side actions -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            :class="[
              'flex items-center gap-1.5 h-10 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-colors shadow-sm',
              showFilters
                ? 'bg-blue-50 text-blue-600 border-blue-200   '
                : 'border-slate-200 dark:border-slate-800  hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200 '
            ]"
            @click="toggleFilters"
          >
            <Filter class="w-3.5 h-3.5" /> Filter
            <span
              v-if="hasActiveFilters"
              class="w-1.5 h-1.5 rounded-full bg-blue-600 "
            />
          </button>
          <button
            class="flex items-center gap-1.5 h-10 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm text-slate-700 dark:text-slate-200 cursor-pointer"
            @click="showImportDialog = true"
          >
            <FileUp class="w-3.5 h-3.5 text-blue-500" /> Import
          </button>
          <button
            class="flex items-center gap-1.5 h-10 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm text-slate-700 dark:text-slate-200 cursor-pointer"
            @click="showExportDialog = true"
          >
            <FileDown class="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      <!-- Bulk Action Bar -->
      <div
        v-if="selectedEmployeeIds.length > 0"
        class="flex items-center justify-between px-4 py-2.5 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-xl shadow-sm"
      >
        <div class="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-200">
          <span>Selected {{ selectedEmployeeIds.length }} of {{ totalItems }} employee(s)</span>
          <button
            v-if="selectedEmployeeIds.length < totalItems"
            class="px-2 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 underline hover:text-blue-900 cursor-pointer"
            @click="selectAllTenantEmployees"
          >
            Select All {{ totalItems }} Tenant Employees
          </button>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            @click="openBulkAssignModal"
          >
            <ShieldCheck class="w-3.5 h-3.5" /> Assign Group & Role
          </button>
          <button
            class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            @click="bulkDeleteEmployees"
          >
            <Trash2 class="w-3.5 h-3.5" /> Bulk Delete Selected
          </button>
          <button
            class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            @click="selectedEmployeeIds = []"
          >
            Clear Selection
          </button>
        </div>
      </div>

      <!-- Main Table Card -->
      <div class="rounded-xl border border-slate-200 dark:border-slate-800  bg-white dark:bg-slate-900  shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        <!-- Table Area -->
        <div class="overflow-x-auto flex-1 h-full">
          <table class="w-full text-left border-collapse relative">
            <thead class="bg-slate-50 dark:bg-slate-800/50  border-b border-slate-200 dark:border-slate-800  sticky top-0 z-10 w-full">
              <tr>
                <th
                  scope="col"
                  class="h-10 px-4 w-10 text-center"
                >
                  <input
                    type="checkbox"
                    :checked="isSelectAll"
                    class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    @change="toggleSelectAll"
                  >
                </th>
                <th
                  scope="col"
                  class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap"
                >
                  Employee ID
                </th>
                <th
                  scope="col"
                  class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap"
                >
                  Name
                </th>
                <th
                  scope="col"
                  class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap"
                >
                  Department
                </th>
                <th
                  scope="col"
                  class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap"
                >
                  Role
                </th>
                <th
                  scope="col"
                  class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap"
                >
                  Biometrics & Keys
                </th>
                <th
                  scope="col"
                  class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap"
                >
                  Status
                </th>
                <th
                  scope="col"
                  class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap text-right"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100  bg-white dark:bg-slate-900 ">
              <tr v-if="loading">
                <td
                  colspan="8"
                  class="h-24 text-center text-slate-500 dark:text-slate-400"
                >
                  <Loader2 class="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td
                  colspan="8"
                  class="h-32 text-center text-slate-500 dark:text-slate-400 text-sm font-medium"
                >
                  No employees found.
                </td>
              </tr>
              <tr
                v-for="emp in items"
                v-else
                :key="emp.id"
                class="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 transition-colors group"
                @click="handleRowClick(emp.id)"
              >
                <td
                  class="px-4 py-3 text-center"
                  @click.stop
                >
                  <input
                    v-model="selectedEmployeeIds"
                    type="checkbox"
                    :value="emp.id"
                    class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  >
                </td>
                <td class="px-5 py-3 text-xs font-black text-slate-700 dark:text-slate-200 ">
                  {{ emp.employeeId || '-' }}
                </td>
                <td class="px-5 py-3">
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-slate-900 dark:text-slate-100  group-hover:text-blue-600 transition-colors">
                      {{ emp.assignedUser?.first_name || 'No Name' }}
                    </span>
                    <span class="text-[10px] font-semibold tracking-wide text-slate-500 dark:text-slate-400 mt-0.5">{{ emp.assignedUser?.email }}</span>
                  </div>
                </td>
                <td class="px-5 py-3 text-xs font-medium text-slate-600 dark:text-slate-300 ">
                  {{ emp.department?.departmentName || "-" }}
                </td>
                <td class="px-5 py-3">
                  <span class="inline-flex px-2 py-0.5 bg-slate-50 dark:bg-slate-800/50  text-slate-600 dark:text-slate-300  rounded-md text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800 ">
                    {{ emp.assignedUser?.accesseasyRole?.roleName || emp.assignedUser?.role?.name || "Unassigned" }}
                  </span>
                </td>
                <td class="px-5 py-3">
                  <div class="flex items-center gap-1.5">
                    <!-- Fingerprint -->
                    <span
                      :title="hasFinger(emp.id) ? 'Fingerprint Registered' : 'Fingerprint Missing'"
                      :class="[
                        'p-1 rounded-lg border text-xs flex items-center justify-center transition-all',
                        hasFinger(emp.id) 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200   ' 
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800   '
                      ]"
                    >
                      <Fingerprint class="w-3.5 h-3.5" />
                    </span>
                    <!-- Face -->
                    <span
                      :title="hasFace(emp) ? 'Face Template Registered' : 'Face Template Missing'"
                      :class="[
                        'p-1 rounded-lg border text-xs flex items-center justify-center transition-all',
                        hasFace(emp) 
                          ? 'bg-blue-50 text-blue-600 border-blue-200   ' 
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800   '
                      ]"
                    >
                      <Scan class="w-3.5 h-3.5" />
                    </span>
                    <!-- RFID -->
                    <span
                      :title="hasRfid(emp.id) ? 'RFID Card Assigned' : 'RFID Card Missing'"
                      :class="[
                        'p-1 rounded-lg border text-xs flex items-center justify-center transition-all',
                        hasRfid(emp.id) 
                          ? 'bg-purple-50 text-purple-600 border-purple-200   ' 
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800   '
                      ]"
                    >
                      <CreditCard class="w-3.5 h-3.5" />
                    </span>
                    <!-- NFC -->
                    <span
                      :title="hasNfc(emp) ? 'NFC Key Registered' : 'NFC Key Missing'"
                      :class="[
                        'p-1 rounded-lg border text-xs flex items-center justify-center transition-all',
                        hasNfc(emp) 
                          ? 'bg-amber-50 text-amber-600 border-amber-200   ' 
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800   '
                      ]"
                    >
                      <Smartphone class="w-3.5 h-3.5" />
                    </span>
                  </div>
                </td>
                <td class="px-5 py-3">
                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border',
                      emp.status === 'Active' || emp.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700   border-emerald-200 ' 
                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300   border-slate-200 dark:border-slate-800 '
                    ]"
                  >
                    {{ emp.status || 'Unknown' }}
                  </span>
                </td>
                <td
                  class="px-5 py-3 text-right"
                  @click.stop
                >
                  <div class="flex justify-end gap-2 pr-2">
                    <button 
                      v-if="emp.assignedUser?.phone"
                      title="Send Mobile Pass via WhatsApp"
                      class="h-7 w-7 p-0 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-800  text-slate-500 dark:text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-50 :bg-emerald-500/10 transition-colors shadow-sm"
                    >
                      <MessageCircle class="h-3.5 w-3.5" />
                    </button>
                    <button 
                      class="h-7 px-3 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800  rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 :bg-zinc-800 text-slate-700 dark:text-slate-200  transition-colors shadow-sm"
                      @click="handleEditEmployee(emp)"
                    >
                      Edit
                    </button>
                    <button 
                      v-if="isAdmin"
                      class="h-7 w-7 p-0 flex items-center justify-center rounded-md border border-rose-200  bg-transparent text-rose-500 hover:text-rose-600 hover:bg-rose-50 :bg-rose-900/20 transition-colors shadow-sm"
                      @click="confirmDelete(emp)"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <!-- Pagination -->
        <div class="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 mt-auto shrink-0">
          <button
            class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:bg-slate-900 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-200"
            :disabled="page <= 1 || loading"
            @click="page--"
          >
            Previous
          </button>

          <div class="flex items-center gap-3">
            <div class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Page {{ page }} of {{ totalPages || 1 }} (Total {{ totalItems }} Employees)
            </div>
            <select
              v-model="itemsPerPage"
              class="h-8 px-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              @change="page = 1; fetchEmployeeData();"
            >
              <option :value="10">
                10 per page
              </option>
              <option :value="25">
                25 per page
              </option>
              <option :value="50">
                50 per page
              </option>
              <option :value="100">
                100 per page
              </option>
              <option :value="250">
                250 per page
              </option>
              <option :value="500">
                500 per page
              </option>
              <option :value="1000">
                1000 per page
              </option>
            </select>
          </div>

          <button
            class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:bg-slate-900 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-200"
            :disabled="page >= totalPages || loading"
            @click="page++"
          >
            Next
          </button>
        </div>

        <!-- Dialogs -->
        <AddEmployeeDialog
          v-model="showAddDialog"
          :employee="selectedEmployee"
          @success="fetchEmployeeData"
        />

        <!-- Deletion Progress Modal -->
        <DeleteProgressModal
          :show="deleteProgress.show"
          :title="deleteProgress.title"
          :current="deleteProgress.current"
          :total="deleteProgress.total"
          :status-text="deleteProgress.statusText"
        />

        <!-- Bulk Assign Progress Modal -->
        <DeleteProgressModal
          :show="bulkAssignProgress.show"
          :title="bulkAssignProgress.title"
          :current="bulkAssignProgress.current"
          :total="bulkAssignProgress.total"
          :status-text="bulkAssignProgress.statusText"
        />

        <!-- Delete Confirmation Dialog -->
        <div
          v-if="deleteDialog"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            @click="deleteDialog = false"
          />
          <div class="relative bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-800  rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-full bg-rose-100  flex items-center justify-center shrink-0">
                <Trash2 class="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900 dark:text-slate-100 ">
                  Delete Employee?
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-300  mb-6">
              Are you sure you want to permanently remove
              <strong class="text-slate-800 dark:text-slate-200 ">{{ employeeToDelete?.assignedUser?.first_name }}</strong>
              from the system?
            </p>
            <div class="flex justify-end gap-3">
              <button
                class="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 :bg-zinc-800 transition-colors"
                @click="deleteDialog = false"
              >
                Cancel
              </button>
              <button
                :disabled="deleting"
                class="px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
                @click="deleteEmployee"
              >
                <Loader2
                  v-if="deleting"
                  class="w-4 h-4 animate-spin"
                />
                <Trash2
                  v-else
                  class="w-4 h-4"
                />
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Export Dialog -->
        <ExportEmployees
          v-if="showExportDialog"
          :filters="filters"
          :search="search"
          @close="showExportDialog = false"
        />

        <!-- Bulk Import Dialog -->
        <ImportEmployees
          v-if="showImportDialog"
          @close="showImportDialog = false; fetchEmployeeData()"
        />

        <!-- Bulk Assign Group, Role & Department Modal -->
        <div
          v-if="showBulkAssignModal"
          class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          @click.self="showBulkAssignModal = false"
        >
          <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 class="text-base font-black text-slate-900 dark:text-white">
                  Bulk Assign Group & Role
                </h3>
                <p class="text-xs text-slate-500">
                  Applying changes to {{ selectedEmployeeIds.length }} selected employee(s)
                </p>
              </div>
              <button
                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold cursor-pointer"
                @click="showBulkAssignModal = false"
              >
                &times;
              </button>
            </div>

            <div class="flex flex-col gap-4">
              <!-- Access Group / Clearance Level -->
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Access Group (Clearance Level)</label>
                <select
                  v-model="bulkAssignForm.accessLevelId"
                  class="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                >
                  <option value="">
                    -- No Change (Keep Existing) --
                  </option>
                  <option
                    v-for="al in availableAccessLevels"
                    :key="al.id"
                    :value="al.id"
                  >
                    {{ al.groupName || al.name || al.title || al.accessLevelName || al.id }}
                  </option>
                </select>
              </div>

              <!-- User Role -->
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">User Role</label>
                <select
                  v-model="bulkAssignForm.roleId"
                  class="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                >
                  <option value="">
                    -- No Change (Keep Existing) --
                  </option>
                  <option
                    v-for="role in availableRoles"
                    :key="role.id"
                    :value="role.id"
                  >
                    {{ role.roleName || role.name || role.title || role.roleConfiguratorName || role.id }}
                  </option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
              <button
                class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                @click="showBulkAssignModal = false"
              >
                Cancel
              </button>
              <button
                :disabled="isAssigning"
                class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                @click="executeBulkAssign"
              >
                <Loader2
                  v-if="isAssigning"
                  class="w-4 h-4 animate-spin"
                />
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, inject } from "vue";
import { useRouter } from "vue-router";
import { Plus, Search, Filter, FileDown, FileUp, Trash2, MessageCircle, Loader2, Fingerprint, Scan, CreditCard, Smartphone, ShieldCheck } from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import mqttService from "@/services/mqttService";
import DeleteProgressModal from "@/components/common/modals/DeleteProgressModal.vue";
import AddEmployeeDialog from "./addEmployeeDialog.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import ExportEmployees from "./report/exportEmployees.vue";
import ImportEmployees from "./report/importEmployees.vue";
import ValueHeader from "@/components/common/ValueHeader.vue";

// Dependencies
const router = useRouter();
const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();
const userRole = currentUserTenant.getRole();

// State
const items = ref([]);
const loading = ref(true);
const search = ref("");
const page = ref(1);
const totalItems = ref(0);
const itemsPerPage = ref(100);
const showAddDialog = ref(false);
const selectedEmployee = ref(null);
const deleteDialog = ref(false);
const employeeToDelete = ref(null);
const deleting = ref(false);

const deleteProgress = reactive({
  show: false,
  title: "Deleting Employees...",
  current: 0,
  total: 0,
  statusText: "",
});

const bulkAssignProgress = reactive({
  show: false,
  title: "Assigning Group & Role...",
  current: 0,
  total: 0,
  statusText: "",
});

const showExportDialog = ref(false);
const showImportDialog = ref(false);
const selectedEmployeeIds = ref([]);

const showBulkAssignModal = ref(false);
const isAssigning = ref(false);
const availableAccessLevels = ref([]);
const availableDepartments = ref([]);
const availableRoles = ref([]);

const bulkAssignForm = reactive({
  accessLevelId: "",
  departmentId: "",
  roleId: "",
});

const openBulkAssignModal = async () => {
  showBulkAssignModal.value = true;
  bulkAssignForm.accessLevelId = "";
  bulkAssignForm.departmentId = "";
  bulkAssignForm.roleId = "";

  // Fetch access levels from accesslevels and accesslevel
  try {
    let alRes = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevels?filter[tenant][tenantId][_eq]=${tenantId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!alRes.ok) {
      alRes = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevel?filter[tenant][tenantId][_eq]=${tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    if (!alRes.ok) {
      alRes = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    if (alRes.ok) {
      const data = await alRes.json();
      availableAccessLevels.value = data.data || [];
    }
  } catch (e) {
    console.warn("Failed to fetch access levels:", e);
  }

  // Fetch roles
  try {
    let roleRes = await fetch(`${import.meta.env.VITE_API_URL}/items/roleConfigurator?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][accessType][_eq]=accessEasy`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!roleRes.ok) {
      roleRes = await fetch(`${import.meta.env.VITE_API_URL}/items/accesseasyRole`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    if (roleRes.ok) {
      const data = await roleRes.json();
      availableRoles.value = data.data || [];
    }

    if (!availableRoles.value || availableRoles.value.length === 0) {
      let sysRoleRes = await fetch(`${import.meta.env.VITE_API_URL}/roles?fields=id,name`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (sysRoleRes.ok) {
        const sysData = await sysRoleRes.json();
        availableRoles.value = (sysData.data || []).map(r => ({ id: r.id, name: r.name }));
      }
    }
  } catch (e) {
    console.warn("Failed to fetch roles:", e);
  }
};

const syncEmployeesHardwareAccess = async (employeeIds, accessLevelId) => {
  if (!employeeIds || employeeIds.length === 0 || !accessLevelId) return;

  try {
    // 1. Fetch access level doors (use in-memory item first, or filter query to avoid 403 single-item restriction)
    let groupItem = availableAccessLevels.value.find((al) => String(al.id) === String(accessLevelId));

    if (!groupItem || (!groupItem.assignDoorsGroup && !groupItem.doors)) {
      let groupRes = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevels?filter[id][_eq]=${accessLevelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!groupRes.ok) {
        groupRes = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevel?filter[id][_eq]=${accessLevelId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      if (groupRes.ok) {
        const groupData = await groupRes.json();
        groupItem = groupData.data?.[0];
      }
    }

    if (!groupItem) {
      console.warn("Could not load access level details for ID:", accessLevelId);
      return;
    }

    const rawDoors = groupItem.assignDoorsGroup || groupItem.doors || [];
    const doorIds = rawDoors.map((d) => (typeof d === "object" ? d.id : d)).filter(Boolean);
    if (doorIds.length === 0) {
      console.warn("No doors linked to access level:", accessLevelId);
      return;
    }

    // 2. Fetch doors
    const doorsRes = await fetch(`${import.meta.env.VITE_API_URL}/items/doors?filter[id][_in]=${doorIds.join(',')}&fields=deviceUuid,uniqueId,doorNumber`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!doorsRes.ok) return;
    const doorsData = await doorsRes.json();

    const deviceDoorMasks = {};
    const deviceDoorLists = {};
    (doorsData.data || []).forEach(d => {
      const uuid = d.deviceUuid || d.uniqueId;
      if (uuid) {
        const doorNum = parseInt(d.doorNumber || 1, 10);
        const doorBitmask = 1 << (doorNum - 1);
        if (!deviceDoorMasks[uuid]) deviceDoorMasks[uuid] = 0;
        deviceDoorMasks[uuid] |= doorBitmask;

        if (!deviceDoorLists[uuid]) deviceDoorLists[uuid] = [];
        const doorIndexStr = doorNum.toString().padStart(2, '0');
        if (!deviceDoorLists[uuid].includes(doorIndexStr)) {
          deviceDoorLists[uuid].push(doorIndexStr);
        }
      }
    });

    const uuids = Object.keys(deviceDoorMasks);
    if (uuids.length === 0) return;

    // Fetch controller types
    let controllerTypes = {};
    const ctrlRes = await fetch(`${import.meta.env.VITE_API_URL}/items/controllers?filter[sn][_in]=${uuids.join(',')}&fields=sn,controllerType`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (ctrlRes.ok) {
      const ctrlData = await ctrlRes.json();
      (ctrlData.data || []).forEach(c => { controllerTypes[c.sn] = c.controllerType; });
    }

    // 3. Collect cards for selected employees from cardManagement & personalModule in query chunks of 100 IDs
    const cardList = [];
    const ID_CHUNK_SIZE = 100;

    for (let i = 0; i < employeeIds.length; i += ID_CHUNK_SIZE) {
      const chunkIds = employeeIds.slice(i, i + ID_CHUNK_SIZE);
      const idString = chunkIds.join(",");

      try {
        const cmRes = await fetch(
          `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[_or][0][employeeId][id][_in]=${idString}&filter[_or][1][employeeId][_in]=${idString}&fields=id,rfidCard,employeeId&limit=-1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (cmRes.ok) {
          const cmJson = await cmRes.json();
          (cmJson.data || []).forEach(c => {
            const empIdVal = typeof c.employeeId === 'object' ? String(c.employeeId?.id || '') : String(c.employeeId || '');
            const rfidStr = String(c.rfidCard || '').trim();
            if (rfidStr && !cardList.some(item => item.rfidCard === rfidStr)) {
              const empObj = items.value.find(itemObj => String(itemObj.id) === empIdVal);
              const name = `${empObj?.assignedUser?.first_name || ''} ${empObj?.assignedUser?.last_name || ''}`.trim() || 'Employee';
              cardList.push({ rfidCard: rfidStr, employeeId: empIdVal, name });
            }
          });
        }
      } catch (e) {
        console.warn('[MQTT Hardware Sync] Error fetching cardManagement chunk:', e);
      }

      // Fallback: Check if rfid is attached directly to personalModule employee records in DB
      try {
        const pmFetchRes = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule?filter[id][_in]=${idString}&fields=id,rfid,assignedUser.first_name,assignedUser.last_name&limit=-1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (pmFetchRes.ok) {
          const pmJson = await pmFetchRes.json();
          (pmJson.data || []).forEach((empObj) => {
            const rfidVal = String(empObj.rfid || empObj.rfidCard || '').trim();
            if (rfidVal && !cardList.some((item) => item.rfidCard === rfidVal)) {
              const name = `${empObj.assignedUser?.first_name || ''} ${empObj.assignedUser?.last_name || ''}`.trim() || 'Employee';
              cardList.push({ rfidCard: rfidVal, employeeId: String(empObj.id), name });
            }
          });
        }
      } catch (e) {
        console.warn('[MQTT Hardware Sync] Error fetching personalModule fallback chunk:', e);
      }
    }

    console.log(`[MQTT Hardware Sync] Found ${cardList.length} card(s) for ${employeeIds.length} employee(s):`, cardList.map(c => c.rfidCard));

    if (cardList.length === 0) {
      console.warn("No RFID cards found in cardManagement for selected employees:", employeeIds);
      return;
    }

    // 4. Send insertPermission payload to Knative MQTT per controller
    for (const [uuid, bitmask] of Object.entries(deviceDoorMasks)) {
      const type = controllerTypes[uuid] || 1;
      const indexData = type !== 1 ? deviceDoorLists[uuid] : bitmask.toString(16).padStart(2, '0').toUpperCase();

      const payloadData = [];
      cardList.forEach(c => {
        if (!c.rfidCard) return;
        const name = c.name || 'Employee';

        if (Array.isArray(indexData)) {
          indexData.forEach(idx => {
            payloadData.push({
              id: String(c.rfidCard),
              type: 200,
              code: String(c.rfidCard),
              index: idx,
              time: { type: 0 },
              extra: { name }
            });
          });
        } else {
          payloadData.push({
            id: String(c.rfidCard),
            type: 200,
            code: String(c.rfidCard),
            index: indexData,
            time: { type: 0 },
            extra: { name },
            buzzer_timing: 50
          });
        }
      });

      if (payloadData.length > 0) {
        console.log(`[MQTT Hardware Sync] Sending ${payloadData.length} permission items in chunks to controller ${uuid}...`);
        const MQTT_CHUNK_SIZE = 100; // ~3 KB payload per MQTT packet to prevent hardware RX buffer truncation
        for (let pIdx = 0; pIdx < payloadData.length; pIdx += MQTT_CHUNK_SIZE) {
          const chunkData = payloadData.slice(pIdx, pIdx + MQTT_CHUNK_SIZE);
          await fetch(`${import.meta.env.VITE_KN_API_URL || 'https://appv1.fieldseasy.com/kn'}/device-mqtt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "insertPermission", uuid: uuid, data: chunkData })
          }).catch((knErr) => console.warn('[Knative device-mqtt] Chunk send notice:', knErr));
          if (pIdx + MQTT_CHUNK_SIZE < payloadData.length) {
            await new Promise((r) => setTimeout(r, 50));
          }
        }
      }
    }
  } catch (err) {
    console.error("Hardware MQTT sync error in bulk assign:", err);
  }
};

const executeBulkAssign = async () => {
  if (!bulkAssignForm.accessLevelId && !bulkAssignForm.roleId) {
    messageHandler.showError("Please select at least one field (Access Group or Role) to update.");
    return;
  }

  isAssigning.value = true;
  showBulkAssignModal.value = false;

  const idsToUpdate = [...selectedEmployeeIds.value];
  bulkAssignProgress.show = true;
  bulkAssignProgress.title = "Assigning Group & Role...";
  bulkAssignProgress.total = idsToUpdate.length;
  bulkAssignProgress.current = 0;
  bulkAssignProgress.statusText = "Initializing batch updates...";

  try {
    // Batch update assignedAccessLevel on personalModule (Directus Bulk PATCH - 1 request instead of N)
    if (bulkAssignForm.accessLevelId && idsToUpdate.length > 0) {
      const chunkSize = 50;
      for (let i = 0; i < idsToUpdate.length; i += chunkSize) {
        const chunk = idsToUpdate.slice(i, i + chunkSize);
        bulkAssignProgress.current = Math.min(i + chunkSize, idsToUpdate.length);
        bulkAssignProgress.statusText = `Updating Access Group for batch ${Math.floor(i / chunkSize) + 1} (${bulkAssignProgress.current} of ${idsToUpdate.length})...`;

        const res = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            keys: chunk,
            data: { assignedAccessLevel: bulkAssignForm.accessLevelId }
          })
        });
        if (!res.ok) {
          console.warn("Bulk patch personalModule chunk error:", await res.text());
        }
      }
    }

    // Batch update accesseasyRole on users (Directus Bulk PATCH - 1 request instead of N)
    if (bulkAssignForm.roleId && idsToUpdate.length > 0) {
      bulkAssignProgress.statusText = "Fetching user account mappings...";
      const userIdsToUpdate = [];
      const fetchChunkSize = 100;
      for (let i = 0; i < idsToUpdate.length; i += fetchChunkSize) {
        const chunk = idsToUpdate.slice(i, i + fetchChunkSize);
        const idString = chunk.join(",");
        try {
          const fetchUsersRes = await fetch(
            `${import.meta.env.VITE_API_URL}/items/personalModule?filter[id][_in]=${idString}&fields=assignedUser.id&limit=-1`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (fetchUsersRes.ok) {
            const fetchUsersData = await fetchUsersRes.json();
            (fetchUsersData.data || []).forEach(emp => {
              const uId = typeof emp.assignedUser === "object" ? emp.assignedUser?.id : emp.assignedUser;
              if (uId) userIdsToUpdate.push(uId);
            });
          }
        } catch (e) {
          console.warn("Error pre-fetching assignedUser IDs for bulk assign:", e);
        }
      }

      if (userIdsToUpdate.length > 0) {
        const patchChunkSize = 50;
        for (let i = 0; i < userIdsToUpdate.length; i += patchChunkSize) {
          const chunk = userIdsToUpdate.slice(i, i + patchChunkSize);
          bulkAssignProgress.statusText = `Updating User Role for batch ${Math.floor(i / patchChunkSize) + 1} (${Math.min(i + patchChunkSize, userIdsToUpdate.length)} of ${userIdsToUpdate.length})...`;

          const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              keys: chunk,
              data: { accesseasyRole: bulkAssignForm.roleId }
            })
          });
          if (!res.ok) {
            console.warn("Bulk patch users chunk error:", await res.text());
          }
        }
      }
    }

    const updatedCount = idsToUpdate.length;

    if (bulkAssignForm.accessLevelId) {
      bulkAssignProgress.statusText = "Syncing RFID permissions to hardware controllers over MQTT...";
      await syncEmployeesHardwareAccess(idsToUpdate, bulkAssignForm.accessLevelId);
    }

    messageHandler.showSuccess(`Successfully updated Group & Role for ${updatedCount} employee(s)`);
    selectedEmployeeIds.value = [];
    fetchEmployeeData();
  } catch (err) {
    console.error("Bulk assign error:", err);
    messageHandler.showError(err.message || "Failed to update selected employees");
  } finally {
    isAssigning.value = false;
    bulkAssignProgress.show = false;
  }
};

const isSelectAll = computed(() => {
  return items.value.length > 0 && selectedEmployeeIds.value.length === items.value.length;
});

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    selectedEmployeeIds.value = items.value.map((emp) => emp.id);
  } else {
    selectedEmployeeIds.value = [];
  }
};

const selectAllTenantEmployees = async () => {
  try {
    const activeToken = authService.getToken();
    const filterParams = await buildFilterParams();
    const queryParams = new URLSearchParams({
      limit: -1,
      fields: "id",
      ...filterParams
    });
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      const allIds = (data.data || []).map((e) => e.id);
      selectedEmployeeIds.value = allIds;
      messageHandler.showSuccess(`Selected all ${allIds.length} employee(s) in this tenant`);
    }
  } catch (err) {
    messageHandler.showError("Failed to select all tenant employees");
  }
};

const bulkDeleteEmployees = async () => {
  if (selectedEmployeeIds.value.length === 0) return;
  if (!confirm(`Are you sure you want to delete ${selectedEmployeeIds.value.length} selected employee(s) and their linked accounts & RFID cards for THIS TENANT?`)) return;

  const idsToDelete = [...selectedEmployeeIds.value];
  deleteProgress.show = true;
  deleteProgress.title = "Deleting Employees & Access Credentials...";
  deleteProgress.total = idsToDelete.length;
  deleteProgress.current = 0;
  deleteProgress.statusText = "Initializing fast batch deletion...";

  deleting.value = true;
  try {
    const activeToken = authService.getToken();
    const BATCH_SIZE = 50;

    for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
      const chunkEmpIds = idsToDelete.slice(i, i + BATCH_SIZE);
      const chunkEmpObjects = items.value.filter((emp) => chunkEmpIds.includes(emp.id));

      deleteProgress.current = Math.min(i + chunkEmpIds.length, idsToDelete.length);
      deleteProgress.statusText = `Deleting batch ${Math.floor(i / BATCH_SIZE) + 1} (${deleteProgress.current} of ${idsToDelete.length})...`;

      const idString = chunkEmpIds.join(",");

      // Step 1: Collect RFID cards for this batch & delete cardManagement records
      let rfidCardsToRemove = [];
      try {
        const cardRes = await fetch(
          `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[_or][0][employeeId][id][_in]=${idString}&filter[_or][1][employeeId][_in]=${idString}&fields=id,rfidCard&limit=-1`,
          { headers: { Authorization: `Bearer ${activeToken}` } }
        );
        if (cardRes.ok) {
          const cardData = await cardRes.json();
          const cardRecords = cardData.data || [];
          rfidCardsToRemove = [...new Set(cardRecords.map((c) => String(c.rfidCard)).filter((c) => c && c !== "null"))];

          const cardRecordIds = cardRecords.map((c) => c.id);
          if (cardRecordIds.length > 0) {
            await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${activeToken}`, "Content-Type": "application/json" },
              body: JSON.stringify(cardRecordIds)
            });
          }
        }
      } catch (e) {
        console.warn("[Batch Delete] Error cleaning cardManagement:", e);
      }

      // Step 2: Batched Hardware MQTT Wipe (1 command per controller for all cards in chunk)
      if (rfidCardsToRemove.length > 0) {
        try {
          const doorFilter = tenantId ? `filter[tenant][tenantId][_eq]=${tenantId}&` : '';
          const doorsRes = await fetch(`${import.meta.env.VITE_API_URL}/items/doors?${doorFilter}fields=deviceUuid,uniqueId`, {
            headers: { Authorization: `Bearer ${activeToken}` }
          });
          if (doorsRes.ok) {
            const doorsData = await doorsRes.json();
            const uuids = [...new Set((doorsData.data || []).map((d) => d.deviceUuid || d.uniqueId).filter(Boolean))];
            const validNumericIds = rfidCardsToRemove.map(String).filter((id) => /^\d+$/.test(id));
            if (uuids.length > 0 && validNumericIds.length > 0) {
              for (const uuid of uuids) {
                await fetch(`${import.meta.env.VITE_KN_API_URL || 'https://appv1.fieldseasy.com/kn'}/device-mqtt`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "delPermission",
                    uuid: uuid,
                    data: validNumericIds
                  })
                }).catch((knErr) => console.warn('[Knative device-mqtt] Error:', knErr));
              }
            }
          }
        } catch (e) {
          console.warn('[Batch Delete] MQTT Wipe notice:', e);
        }
      }

      // Step 3: Delete userFingers for chunk
      try {
        const fingerRes = await fetch(`${import.meta.env.VITE_API_URL}/items/userFingers?filter[assignedTo][id][_in]=${idString}&fields=id`, {
          headers: { Authorization: `Bearer ${activeToken}` }
        });
        if (fingerRes.ok) {
          const fingerData = await fingerRes.json();
          const fingerIds = (fingerData.data || []).map((f) => f.id);
          if (fingerIds.length > 0) {
            await fetch(`${import.meta.env.VITE_API_URL}/items/userFingers`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${activeToken}`, "Content-Type": "application/json" },
              body: JSON.stringify(fingerIds)
            });
          }
        }
      } catch (e) {}

      // Step 4: Bulk Delete linked Directus user accounts (fetching assignedUser IDs directly from DB BEFORE deleting personalModule)
      try {
        const userFetchRes = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?filter[id][_in]=${idString}&fields=assignedUser.id&limit=-1`, {
          headers: { Authorization: `Bearer ${activeToken}` }
        });
        if (userFetchRes.ok) {
          const userFetchData = await userFetchRes.json();
          const userIdsToDelete = (userFetchData.data || [])
            .map((emp) => typeof emp.assignedUser === "object" ? emp.assignedUser?.id : emp.assignedUser)
            .filter(Boolean);

          if (userIdsToDelete.length > 0) {
            await fetch(`${import.meta.env.VITE_API_URL}/users`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${activeToken}`, "Content-Type": "application/json" },
              body: JSON.stringify(userIdsToDelete)
            });
          }
        }
      } catch (uErr) {
        console.warn("[Batch Delete] Bulk user delete notice:", uErr);
      }

      // Step 5: Bulk Delete personalModule employee records
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${activeToken}`, "Content-Type": "application/json" },
          body: JSON.stringify(chunkEmpIds)
        });
      } catch (e) {
        console.warn("[Batch Delete] Bulk personalModule delete notice:", e);
      }
    }

    messageHandler.showSuccess(`Successfully deleted ${idsToDelete.length} employee(s) and wiped hardware RFID permissions in batch`);
    selectedEmployeeIds.value = [];
    fetchEmployeeData();
  } catch (err) {
    console.error("Bulk delete error:", err);
    messageHandler.showError("Error deleting selected employees");
  } finally {
    deleting.value = false;
    deleteProgress.show = false;
  }
};
const showFilters = ref(false);
const filters = reactive({
  branch: "",
  department: "",
});

const pageFilters = [
  { key: "branch", label: "Branch", type: "select", show: true },
  { key: "department", label: "Department", type: "select", show: true },
];

const initialFilters = computed(() => ({
  branch: filters.branch,
  department: filters.department,
}));

const hasActiveFilters = computed(() => {
  return !!(filters.branch || filters.department);
});

const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);
  page.value = 1;
  fetchEmployeeData();
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const defaultMessageHandler = { showSuccess: (m) => console.log(m), showError: (m) => console.error(m) };
const messageHandler = inject('messageHandler', defaultMessageHandler);

// Permissions
const isAdmin = computed(() => userRole === "Admin" || userRole === "Dealer");
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchEmployeeData();
  }, 400);
};

watch(page, () => {
  fetchEmployeeData();
});

const handleRowClick = (id) => {
  // router.push(`/employee-details/personalDetails/edit/${id}`);
};

const handleCreateEmployee = () => {
  selectedEmployee.value = null;
  showAddDialog.value = true;
};

const handleEditEmployee = (employeeData) => {
  selectedEmployee.value = employeeData;
  showAddDialog.value = true;
};

const confirmDelete = (emp) => {
  employeeToDelete.value = emp;
  deleteDialog.value = true;
};

const deleteEmployee = async () => {
  if (!employeeToDelete.value) return;
  deleting.value = true;
  try {
    const emp = employeeToDelete.value;

    // Step 1: Delete all linked cards in cardManagement
    try {
      const cardRes = await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement?filter[employeeId][id][_eq]=${emp.id}&fields=id,rfidCard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (cardRes.ok) {
        const cardData = await cardRes.json();
        if (cardData.data && cardData.data.length > 0) {
          for (const card of cardData.data) {
            await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement/${card.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        }
      }
    } catch (cardErr) {
      console.warn('Error deleting linked RFID cards:', cardErr);
    }

    // Step 2: Delete linked userFingers
    try {
      const fingerRes = await fetch(`${import.meta.env.VITE_API_URL}/items/userFingers?filter[assignedTo][id][_eq]=${emp.id}&fields=id`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (fingerRes.ok) {
        const fingerData = await fingerRes.json();
        if (fingerData.data && fingerData.data.length > 0) {
          for (const finger of fingerData.data) {
            await fetch(`${import.meta.env.VITE_API_URL}/items/userFingers/${finger.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        }
      }
    } catch (fingerErr) {
      console.warn('Error deleting linked userFingers:', fingerErr);
    }

    // Step 3: Delete the personalModule record
    const pmRes = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule/${emp.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!pmRes.ok && pmRes.status !== 204) {
      throw new Error('Failed to delete employee record');
    }

    // Step 4: Delete the Directus user account if linked
    if (emp.assignedUser?.id) {
      await fetch(`${import.meta.env.VITE_API_URL}/users/${emp.assignedUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    messageHandler.showSuccess('Employee and all linked RFID cards deleted successfully');
    deleteDialog.value = false;
    employeeToDelete.value = null;
    fetchEmployeeData();
  } catch (err) {
    console.error('Delete error:', err);
    messageHandler.showError(err.message || 'Failed to delete employee');
  } finally {
    deleting.value = false;
  }
};

const buildFilterParams = async () => {
  const params = {};
  if (isAdmin.value) {
    params["filter[assignedUser][tenant][tenantId][_eq]"] = tenantId;
  }
  
  if (search.value) {
    const q = search.value.trim();
    const activeToken = authService.getToken();

    // Query cardManagement to search across assigned RFID card numbers
    let matchedEmpIdsFromCards = [];
    try {
      const cardRes = await fetch(
        `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[rfidCard][_icontains]=${encodeURIComponent(q)}&fields=employeeId&limit=100`,
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );
      if (cardRes.ok) {
        const cardData = await cardRes.json();
        matchedEmpIdsFromCards = (cardData.data || [])
          .map(c => (typeof c.employeeId === 'object' ? c.employeeId?.id : c.employeeId))
          .filter(Boolean);
      }
    } catch (e) {
      console.warn("RFID card search query failed:", e);
    }

    let idx = 0;
    params[`filter[_or][${idx++}][employeeId][_icontains]`] = q;
    params[`filter[_or][${idx++}][assignedUser][first_name][_icontains]`] = q;
    params[`filter[_or][${idx++}][assignedUser][last_name][_icontains]`] = q;
    params[`filter[_or][${idx++}][assignedUser][email][_icontains]`] = q;
    params[`filter[_or][${idx++}][assignedUser][phone][_icontains]`] = q;

    if (matchedEmpIdsFromCards.length > 0) {
      params[`filter[_or][${idx++}][id][_in]`] = [...new Set(matchedEmpIdsFromCards)].join(',');
    }
  }

  if (filters.branch) {
    params["filter[branch][id][_eq]"] = filters.branch;
  }
  if (filters.department) {
    params["filter[department][id][_eq]"] = filters.department;
  }
  return params;
};

const fetchEmployeeData = async () => {
  const activeToken = authService.getToken();
  if (!activeToken) return;

  try {
    loading.value = true;
    const filterParams = await buildFilterParams();
    
    // First figure out total counts
    const countParams = { "aggregate[count]": "id", ...filterParams };
    const countQs = new URLSearchParams(countParams).toString();
    const countRes = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?${countQs}`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    });
    if (countRes.ok) {
      const countData = await countRes.json();
      totalItems.value = Number(countData?.data?.[0]?.count?.id) || 0;
    }

    // Now fetch actual paginated data
    const queryParams = new URLSearchParams({
      page: page.value,
      limit: itemsPerPage.value,
      ...filterParams
    });
    
    // Add fields array manually since URLSearchParams doesn't handle array brackets exactly as Directus wants
    const fields = [
        "id", "employeeId", "status", "registeredFace",
        "assignedUser.id", "assignedUser.first_name", "assignedUser.last_name", "assignedUser.role.name", 
        "assignedUser.phone", "assignedUser.email",
        "assignedUser.accesseasyRole.id", "assignedUser.accesseasyRole.roleName",
        "department.id", "department.departmentName",
        "branch.id", "assignedAccessLevel.id",
        "accessOn", "face", "finger", "rfid", "QrAttendance", "GeoAttendance",
        "assignedFaceEmbed.id"
    ].map(f => `fields[]=${f}`).join('&');

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?${queryParams.toString()}&${fields}`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    });

    if (res.ok) {
      const data = await res.json();
      items.value = data.data || [];
      if (items.value.length > 0) {
        await fetchBiometricAndCredentialStatus(items.value.map(item => item.id));
      }
    } else {
      items.value = [];
    }
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    items.value = [];
  } finally {
    loading.value = false;
  }
};

// Biometrics and credentials status maps
const userFingersMap = ref({});
const rfidCardsMap = ref({});

const fetchBiometricAndCredentialStatus = async (employeeIds) => {
  if (!employeeIds || employeeIds.length === 0) return;
  const idString = employeeIds.join(",");
  
  // Fetch fingerprints from userFingers
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/userFingers?filter[assignedTo][id][_in]=${idString}&fields=id,assignedTo.id`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      const map = {};
      (data.data || []).forEach(f => {
        const empId = f.assignedTo?.id;
        if (empId) map[empId] = true;
      });
      userFingersMap.value = { ...userFingersMap.value, ...map };
    }
  } catch (err) {
    console.error("Error fetching userFingers status:", err);
  }

  // Fetch RFID cards from cardManagement
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement?filter[employeeId][_in]=${idString}&fields=id,rfidCard,type,employeeId`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      const map = {};
      (data.data || []).forEach(c => {
        const empId = typeof c.employeeId === 'object' ? c.employeeId?.id : c.employeeId;
        if (empId && c.rfidCard) {
          map[empId] = true;
        }
      });
      rfidCardsMap.value = { ...rfidCardsMap.value, ...map };
    }
  } catch (err) {
    console.error("Error fetching cardManagement status:", err);
  }
};

const hasFinger = (id) => !!userFingersMap.value[id];
const hasFace = (emp) => !!emp.assignedFaceEmbed?.id || (emp.registeredFace && emp.registeredFace.trim() !== "");
const hasRfid = (id) => !!rfidCardsMap.value[id];
const hasNfc = (emp) => !!emp.card_number;

onMounted(() => {
  fetchEmployeeData();
});
</script>
