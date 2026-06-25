<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden">
    <!-- Toolbar: Search + Add Group on the same line -->
    <div class="flex items-center justify-between gap-3">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search access groups..."
          class="w-full pl-9 pr-4 h-10 text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
          @input="debouncedSearch"
        >
      </div>
      <button
        class="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-sm shrink-0"
        @click="openCreateDialog"
      >
        <Plus class="w-4 h-4" /> Add Access Group
      </button>
    </div>

    <!-- Data Table Card — fills remaining height -->
    <div class="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
      <!-- Table -->
      <div class="overflow-x-auto flex-1 h-full">
        <table class="w-full text-left border-collapse relative">
          <thead class="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-10 w-full">
            <tr>
              <th
                scope="col"
                class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap"
              >
                Access Group Name
              </th>
              <th
                scope="col"
                class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap"
              >
                Work Hours
              </th>
              <th
                scope="col"
                class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap"
              >
                Valid Hours
              </th>
              <th
                scope="col"
                class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap"
              >
                Doors
              </th>
              <th
                scope="col"
                class="h-10 px-5 font-black text-[10px] text-slate-500 uppercase tracking-widest text-right whitespace-nowrap"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
            <tr v-if="loading">
              <td
                colspan="5"
                class="px-5 py-24 text-center text-slate-500"
              >
                <Loader2 class="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td
                colspan="5"
                class="px-5 py-24 text-center"
              >
                <div class="flex flex-col items-center justify-center space-y-3">
                  <Shield class="w-10 h-10 text-slate-300 dark:text-zinc-700" />
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    No access groups found.
                  </p>
                </div>
              </td>
            </tr>
            <tr
              v-for="group in items"
              v-else
              :key="group.id"
              class="group/row hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors duration-200"
            >
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
                    <Shield class="h-4 w-4" />
                  </div>
                  <span
                    class="text-[13px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer transition-colors"
                    @click="editGroup(group)"
                  >
                    {{ group.accessLevelName }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Clock class="w-3.5 h-3.5 text-slate-400" />
                  {{ group.workingHours ? group.workingHours : "Not set" }}
                </div>
              </td>
              <td class="px-5 py-3">
                <span class="inline-flex px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-md text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-zinc-700">
                  {{ group._24hrs ? "24 Hours" : (group.workingHours || "Custom") }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-zinc-800/80 rounded-md w-fit border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400">
                  <Key class="w-3 h-3 text-slate-400" />
                  <span class="text-[10px] font-black uppercase tracking-widest">
                    {{ Array.isArray(group.assignDoorsGroup) ? group.assignDoorsGroup.length : 0 }} Doors
                  </span>
                </div>
              </td>
              <td class="px-5 py-3 text-right">
                <div class="flex justify-end gap-2 pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                  <button
                    class="h-7 px-3 text-[10px] font-black uppercase tracking-widest bg-transparent border border-slate-200 dark:border-zinc-700 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors shadow-sm"
                    @click="editGroup(group)"
                  >
                    Edit
                  </button>
                  <button
                    title="Delete Access Group"
                    class="h-7 w-7 p-0 flex items-center justify-center rounded-md border border-rose-200 dark:border-rose-900/50 bg-transparent text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shadow-sm"
                    @click="deleteGroup(group)"
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
      <div class="flex items-center justify-between p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 shrink-0">
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          :disabled="page <= 1 || loading"
          @click="page--"
        >
          Previous
        </button>
        <div class="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Page {{ page }} of {{ totalPages || 1 }} &nbsp;·&nbsp; {{ totalItems }} total
        </div>
        <button
          class="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 disabled:opacity-50 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
          :disabled="page >= totalPages || loading"
          @click="page++"
        >
          Next
        </button>
      </div>

      <!-- Dialog -->
      <AddAccessLevelDialog
        v-model="showDialog"
        :access-level="selectedGroup"
        @success="fetchData"
      />
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Shield, Plus, Search, Trash2, Key, Clock, Settings, Loader2 } from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import AddAccessLevelDialog from "./addAccessLevelDialog.vue";

// State
const items = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const page = ref(1);
const limit = 10;
const totalItems = ref(0);
const showDialog = ref(false);
const selectedGroup = ref(null);

const token = authService.getToken();

const totalPages = computed(() => Math.ceil(totalItems.value / limit));

let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchData();
  }, 300);
};

watch(page, () => {
  fetchData();
});

const fetchData = async () => {
  if (!token) return;
  // Always resolve tenantId async — sync getter returns null before initialization
  const tenantId = await currentUserTenant.getTenantIdAsync();
  if (!tenantId) return;

  loading.value = true;

  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.value.toString(),
      "sort[]": "sort",
      "filter[tenant][tenantId][_eq]": tenantId,
      meta: "filter_count",
    });

    const fields = [
      "id",
      "accessLevelName",
      "accessLevelNumber",
      "_24hrs",
      "workingHours",
      "assignDoorsGroup",
      "groupType",
      "accessType"
    ];

    fields.forEach(f => params.append("fields[]", f));

    if (searchQuery.value) {
      params.append("filter[accessLevelName][_icontains]", searchQuery.value);
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevels?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      items.value = data.data || [];
      totalItems.value = data.meta?.filter_count ?? 0;
    }
  } catch (error) {
    console.error("Fetch access levels error:", error);
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
    selectedGroup.value = null;
    showDialog.value = true;
};

const editGroup = (group) => {
    selectedGroup.value = group;
    showDialog.value = true;
};

const deleteGroup = async (group) => {
    if(!confirm("Are you sure you want to delete this group?")) return;
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevels/${group.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if(response.ok) {
            fetchData();
        } else {
            alert("Failed to delete access level.");
        }
    } catch(err) {
        console.error(err);
    }
};

onMounted(() => {
  fetchData();
});
</script>
