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
        value-statement="Track employee movement securely."
        :benefits="['Secure employee access', 'Biometric status', 'Complete attendance history', 'Clearance levels']"
        value-badge="Secure employee access with complete attendance history."
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
            class="flex items-center gap-1.5 h-10 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-800  hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 transition-colors shadow-sm text-slate-700 dark:text-slate-200 "
            @click="showExportDialog = true"
          >
            <FileDown class="w-3.5 h-3.5" /> Export
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
                  colspan="7"
                  class="h-24 text-center text-slate-500 dark:text-slate-400"
                >
                  <Loader2 class="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td
                  colspan="7"
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
        <div class="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-700  bg-slate-50 dark:bg-slate-800/50  mt-auto shrink-0">
          <button
            class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-800  hover:bg-white dark:bg-slate-900 :bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-200 "
            :disabled="page <= 1 || loading"
            @click="page--"
          >
            Previous
          </button>
          <div class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Page {{ page }} of {{ totalPages || 1 }}
          </div>
          <button
            class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-800  hover:bg-white dark:bg-slate-900 :bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-200 "
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, inject } from "vue";
import { useRouter } from "vue-router";
import { Plus, Search, Filter, FileDown, Trash2, MessageCircle, Loader2, Fingerprint, Scan, CreditCard, Smartphone } from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import AddEmployeeDialog from "./addEmployeeDialog.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import ExportEmployees from "./report/exportEmployees.vue";
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
const itemsPerPage = 10;
const showAddDialog = ref(false);
const selectedEmployee = ref(null);
const deleteDialog = ref(false);
const employeeToDelete = ref(null);
const deleting = ref(false);

const showExportDialog = ref(false);
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
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

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
    // Step 1: Delete the personalModule record
    const pmRes = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule/${emp.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!pmRes.ok && pmRes.status !== 204) {
      throw new Error('Failed to delete employee record');
    }
    // Step 2: Delete the Directus user account if linked
    if (emp.assignedUser?.id) {
      await fetch(`${import.meta.env.VITE_API_URL}/users/${emp.assignedUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    messageHandler.showSuccess('Employee deleted successfully');
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

const buildFilterParams = () => {
  const params = {};
  if (isAdmin.value) {
    params["filter[assignedUser][tenant][tenantId][_eq]"] = tenantId;
  }
  // Simplified search
  if (search.value) {
    params["filter[_or][0][employeeId][_eq]"] = search.value;
    params["filter[_or][1][assignedUser][first_name][_icontains]"] = search.value;
    params["filter[_or][2][assignedUser][email][_icontains]"] = search.value;
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
  if (!token || !tenantId) return;

  try {
    loading.value = true;
    const filterParams = buildFilterParams();
    
    // First figure out total counts
    const countParams = { "aggregate[count]": "id", ...filterParams };
    const countQs = new URLSearchParams(countParams).toString();
    const countRes = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?${countQs}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (countRes.ok) {
      const countData = await countRes.json();
      totalItems.value = Number(countData?.data?.[0]?.count?.id) || 0;
    }

    // Now fetch actual paginated data
    const queryParams = new URLSearchParams({
      page: page.value,
      limit: itemsPerPage,
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
      headers: { Authorization: `Bearer ${token}` }
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
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement?filter[employeeId][id][_in]=${idString}&fields=id,rfidCard,type,employeeId.id`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      const map = {};
      (data.data || []).forEach(c => {
        const empId = c.employeeId?.id;
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
