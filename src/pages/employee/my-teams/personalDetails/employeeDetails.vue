<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden">

    <!-- Toolbar: Search + Filter + Export + Add Employee on one line -->
    <div class="flex items-center justify-between gap-3">
      <!-- Search -->
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="search"
          placeholder="Search employees..."
          v-model="search"
          @input="debouncedSearch"
          class="w-full pl-9 pr-4 h-10 text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>
      <!-- Right-side actions -->
      <div class="flex items-center gap-2 shrink-0">
        <button class="flex items-center gap-1.5 h-10 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors shadow-sm text-slate-700 dark:text-slate-300">
          <Filter class="w-3.5 h-3.5" /> Filter
        </button>
        <button class="flex items-center gap-1.5 h-10 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors shadow-sm text-slate-700 dark:text-slate-300">
          <FileDown class="w-3.5 h-3.5" /> Export
        </button>
        <button v-if="isAdmin" @click="handleCreateEmployee"
          class="flex items-center gap-1.5 h-10 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all shadow-sm">
          <Plus class="w-4 h-4" /> Add Employee
        </button>
      </div>
    </div>

    <!-- Main Table Card -->
    <div class="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">

      <!-- Table Area -->
      <div class="overflow-x-auto flex-1 h-full">
        <table class="w-full text-left border-collapse relative">
          <thead class="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10 w-full">
            <tr>
              <th scope="col" class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Employee ID</th>
              <th scope="col" class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Name</th>
              <th scope="col" class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Department</th>
              <th scope="col" class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Role</th>
              <th scope="col" class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
              <th scope="col" class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
            <tr v-if="loading">
              <td colspan="6" class="h-24 text-center text-slate-500">
                <Loader2 class="w-6 h-6 animate-spin text-blue-500 mx-auto" />
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="6" class="h-32 text-center text-slate-500 text-sm font-medium">
                No employees found.
              </td>
            </tr>
            <tr
              v-else
              v-for="emp in items"
              :key="emp.id"
              class="cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors group"
              @click="handleRowClick(emp.id)"
            >
              <td class="px-5 py-3 text-xs font-black text-slate-700 dark:text-zinc-300">
                {{ emp.employeeId || '-' }}
              </td>
              <td class="px-5 py-3">
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {{ emp.assignedUser?.first_name || 'No Name' }}
                  </span>
                  <span class="text-[10px] font-semibold tracking-wide text-slate-500 mt-0.5">{{ emp.assignedUser?.email }}</span>
                </div>
              </td>
              <td class="px-5 py-3 text-xs font-medium text-slate-600 dark:text-zinc-400">
                {{ emp.department?.departmentName || "-" }}
              </td>
              <td class="px-5 py-3">
                <span class="inline-flex px-2 py-0.5 bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 rounded-md text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-zinc-800">
                  {{ emp.assignedUser?.role?.name || "Unassigned" }}
                </span>
              </td>
              <td class="px-5 py-3">
                <span :class="[
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border',
                  emp.status === 'Active' || emp.status === 'active' 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                    : 'bg-slate-50 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                ]">
                  {{ emp.status || 'Unknown' }}
                </span>
              </td>
              <td class="px-5 py-3 text-right" @click.stop>
                <div class="flex justify-end gap-2 pr-2">
                  <button 
                    v-if="emp.assignedUser?.phone"
                    title="Send Mobile Pass via WhatsApp"
                    class="h-7 w-7 p-0 flex items-center justify-center rounded-md border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors shadow-sm"
                  >
                    <MessageCircle class="h-3.5 w-3.5" />
                  </button>
                  <button 
                    @click="handleEditEmployee(emp)"
                    class="h-7 px-3 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-zinc-700 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors shadow-sm"
                  >
                    Edit
                  </button>
                  <button 
                    v-if="isAdmin"
                    class="h-7 w-7 p-0 flex items-center justify-center rounded-md border border-rose-200 dark:border-rose-900/50 bg-transparent text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shadow-sm"
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
      <div class="flex items-center justify-between p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 mt-auto shrink-0">
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          @click="page--"
          :disabled="page <= 1 || loading"
        >
          Previous
        </button>
        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Page {{ page }} of {{ totalPages || 1 }}
        </div>
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          @click="page++"
          :disabled="page >= totalPages || loading"
        >
          Next
        </button>
    </div>

    <!-- Dialogs -->
    <AddEmployeeDialog v-model="showAddDialog" :employee="selectedEmployee" @success="fetchEmployeeData" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Plus, Search, Filter, FileDown, Trash2, MessageCircle, Loader2 } from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import AddEmployeeDialog from "./addEmployeeDialog.vue";

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
const itemsPerPage = 15;
const showAddDialog = ref(false);
const selectedEmployee = ref(null);

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
        "id", "employeeId", "status", "assignedUser.id", 
        "assignedUser.first_name", "assignedUser.role.name", 
        "assignedUser.phone", "assignedUser.email",
        "department.id", "department.departmentName"
    ].map(f => `fields[]=${f}`).join('&');

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?${queryParams.toString()}&${fields}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      items.value = data.data || [];
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

onMounted(() => {
  fetchEmployeeData();
});
</script>
