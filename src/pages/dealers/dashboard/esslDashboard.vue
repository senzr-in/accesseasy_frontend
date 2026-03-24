<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans">
    <!-- Header -->
    <header class="flex items-center justify-between h-16 px-6 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30">
      <div class="flex items-center gap-3">
        <div class="h-9 w-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-violet-400">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <span class="text-sm font-black tracking-tight text-white">AccessEasy</span>
          <span class="ml-2 text-[10px] font-bold text-violet-400 uppercase tracking-[0.3em]">Super Admin</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <!-- Search -->
        <div class="relative hidden md:block">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            v-model="globalSearch"
            type="text"
            placeholder="Search tenants..."
            class="h-9 w-56 pl-9 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium text-slate-300 placeholder:text-slate-600 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
          />
        </div>

        <!-- Admin Badge -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-600/10 border border-violet-500/20">
          <div class="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black">
            {{ userInitials }}
          </div>
          <span class="text-xs font-bold text-violet-300">{{ userName }}</span>
        </div>

        <button @click="handleSignOut" class="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-900 text-slate-500 hover:text-rose-400 transition-colors">
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </header>

    <div class="p-6">
      <!-- Stats Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div v-for="stat in stats" :key="stat.label" class="rounded-2xl bg-slate-900 border border-slate-800/80 p-5 flex items-center gap-4">
          <div :class="['h-12 w-12 shrink-0 rounded-xl flex items-center justify-center border', stat.bg, stat.border]">
            <component :is="stat.icon" :class="['w-5 h-5', stat.color]" />
          </div>
          <div>
            <div class="text-2xl font-black text-white">{{ stat.value }}</div>
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 p-1 bg-slate-900 rounded-xl border border-slate-800 w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200',
            activeTab === tab.id
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
              : 'text-slate-500 hover:text-slate-300'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
          <span v-if="tab.badge" :class="['text-[10px] font-black px-1.5 py-0.5 rounded-full', activeTab === tab.id ? 'bg-white/20' : 'bg-slate-800 text-slate-400']">
            {{ tab.badge }}
          </span>
        </button>
      </div>

      <!-- ── Tenants Tab ── -->
      <div v-if="activeTab === 'tenants'">
        <div class="rounded-2xl bg-slate-900 border border-slate-800/80 overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 class="text-sm font-black text-white uppercase tracking-widest">All Tenants</h2>
            <button class="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors">
              <Plus class="w-4 h-4" />
              Add Tenant
            </button>
          </div>

          <!-- Loading state -->
          <div v-if="loadingTenants" class="flex items-center justify-center py-16">
            <div class="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"></div>
          </div>

          <!-- Table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-800">
                  <th v-for="h in tenantHeaders" :key="h" class="text-left px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">{{ h }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="tenant in filteredTenants"
                  :key="tenant.id || tenant.tenantId"
                  class="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td class="px-5 py-3.5">
                    <div class="font-bold text-sm text-white">{{ tenant.tenantName || '—' }}</div>
                    <div class="text-[10px] text-slate-500 font-medium mt-0.5">ID: {{ tenant.tenantId || tenant.id || '—' }}</div>
                  </td>
                  <td class="px-5 py-3.5 text-sm text-slate-400">{{ tenant.companyAddress || '—' }}</td>
                  <td class="px-5 py-3.5">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                  <td class="px-5 py-3.5">
                    <button class="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5">
                      <Settings class="w-3.5 h-3.5" /> Configure
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredTenants.length === 0">
                  <td colspan="4" class="px-5 py-12 text-center text-slate-600 font-semibold text-sm">
                    No tenants found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ── Dealer Requests Tab ── -->
      <div v-if="activeTab === 'dealers'">
        <div class="rounded-2xl bg-slate-900 border border-slate-800/80 overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 class="text-sm font-black text-white uppercase tracking-widest">Dealer Requests</h2>
            <button @click="fetchDealers" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-colors">
              <RefreshCw class="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div v-if="loadingDealers" class="flex items-center justify-center py-16">
            <div class="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"></div>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-800">
                  <th v-for="h in dealerHeaders" :key="h" class="text-left px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">{{ h }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in dealers"
                  :key="item.id"
                  class="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td class="px-5 py-3.5">
                    <div class="font-bold text-sm text-white">{{ item.requestedBy?.assignedUser?.tenant?.tenantName || '—' }}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">{{ item.requestedBy?.assignedUser?.tenant?.tenantId || '' }}</div>
                  </td>
                  <td class="px-5 py-3.5 text-sm text-slate-300">{{ item.requestedBy?.assignedUser?.first_name || '—' }}</td>
                  <td class="px-5 py-3.5 text-sm text-slate-400">{{ item.requestedBy?.assignedUser?.email || '—' }}</td>
                  <td class="px-5 py-3.5">
                    <span :class="statusClass(item.dealerAccess)" class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border">
                      {{ item.dealerAccess || 'pending' }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-2">
                      <button
                        v-if="item.dealerAccess === 'requested'"
                        @click="approveDealerRequest(item)"
                        class="h-7 px-3 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        v-if="item.dealerAccess === 'requested'"
                        @click="rejectDealerRequest(item)"
                        class="h-7 px-3 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 text-[10px] font-black transition-colors"
                      >
                        Reject
                      </button>
                      <span v-if="item.dealerAccess !== 'requested'" class="text-xs text-slate-600 font-semibold">—</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="dealers.length === 0">
                  <td colspan="5" class="px-5 py-12 text-center text-slate-600 font-semibold text-sm">
                    No dealer requests found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Building2, Users, Handshake, Activity,
  Search, LogOut, Plus, Settings, RefreshCw,
} from "lucide-vue-next";
import { authService } from "@/services/authService";

const router = useRouter();

// ── User Info ─────────────────────────────────────────────────────────────────
const user = ref(authService.getUserData() || { first_name: "Super", last_name: "Admin" });
const userName = computed(() => `${user.value?.first_name || ""} ${user.value?.last_name || ""}`.trim() || "Super Admin");
const userInitials = computed(() => userName.value.charAt(0).toUpperCase());

// ── Tabs ──────────────────────────────────────────────────────────────────────
const activeTab = ref("tenants");
const tabs = computed(() => [
  { id: "tenants", label: "Tenants", icon: Building2, badge: tenants.value.length || null },
  { id: "dealers", label: "Dealer Requests", icon: Handshake, badge: pendingCount.value || null },
]);

// ── Search ────────────────────────────────────────────────────────────────────
const globalSearch = ref("");

// ── Data ──────────────────────────────────────────────────────────────────────
const tenants = ref([]);
const dealers = ref([]);
const loadingTenants = ref(false);
const loadingDealers = ref(false);

// ── Computed ──────────────────────────────────────────────────────────────────
const filteredTenants = computed(() => {
  if (!globalSearch.value) return tenants.value;
  const q = globalSearch.value.toLowerCase();
  return tenants.value.filter(
    (t) =>
      t.tenantName?.toLowerCase().includes(q) ||
      t.tenantId?.toLowerCase().includes(q)
  );
});

const pendingCount = computed(() =>
  dealers.value.filter((d) => d.dealerAccess === "requested").length
);

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = computed(() => [
  {
    label: "Total Tenants",
    value: tenants.value.length,
    icon: Building2,
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    color: "text-violet-400",
  },
  {
    label: "Active Users",
    value: "—",
    icon: Users,
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    color: "text-blue-400",
  },
  {
    label: "Pending Requests",
    value: pendingCount.value,
    icon: Handshake,
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    color: "text-amber-400",
  },
  {
    label: "System Status",
    value: "Live",
    icon: Activity,
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    color: "text-emerald-400",
  },
]);

// ── Table Headers ─────────────────────────────────────────────────────────────
const tenantHeaders = ["Company", "Address", "Status", "Actions"];
const dealerHeaders = ["Tenant", "Contact", "Email", "Status", "Actions"];

// ── API Calls ─────────────────────────────────────────────────────────────────
async function fetchTenants() {
  loadingTenants.value = true;
  try {
    const res = await authService.protectedApi.get("/items/tenant", {
      params: {
        "fields[]": ["tenantId", "tenantName", "companyAddress"],
        limit: 100,
      },
    });
    tenants.value = res.data?.data || [];
  } catch (e) {
    console.error("Failed to fetch tenants:", e);
    // Fallback mock so UI is visible during dev
    tenants.value = [
      { tenantId: "TNT001", tenantName: "TechCorp Solutions", companyAddress: "Mumbai, MH" },
      { tenantId: "TNT002", tenantName: "InnovateTech", companyAddress: "Bengaluru, KA" },
    ];
  } finally {
    loadingTenants.value = false;
  }
}

async function fetchDealers() {
  loadingDealers.value = true;
  try {
    const res = await authService.protectedApi.get("/items/dealers", {
      params: {
        "fields[]": [
          "id",
          "dealerAccess",
          "date_created",
          "requestedBy.assignedUser.first_name",
          "requestedBy.assignedUser.email",
          "requestedBy.assignedUser.phone",
          "requestedBy.assignedUser.tenant.tenantId",
          "requestedBy.assignedUser.tenant.tenantName",
        ],
        sort: ["-date_created"],
        limit: 100,
      },
    });
    dealers.value = res.data?.data || [];
  } catch (e) {
    console.error("Failed to fetch dealers:", e);
    dealers.value = [];
  } finally {
    loadingDealers.value = false;
  }
}

async function approveDealerRequest(item) {
  try {
    await authService.protectedApi.patch(`/items/dealers/${item.id}`, {
      dealerAccess: "approved",
    });
    item.dealerAccess = "approved";
  } catch (e) {
    console.error("Failed to approve:", e);
  }
}

async function rejectDealerRequest(item) {
  try {
    await authService.protectedApi.patch(`/items/dealers/${item.id}`, {
      dealerAccess: "rejected",
    });
    item.dealerAccess = "rejected";
  } catch (e) {
    console.error("Failed to reject:", e);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusClass(status) {
  switch (status) {
    case "approved":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "rejected":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    default:
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }
}

function handleSignOut() {
  authService.logout();
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(() => {
  // Redirect non-esslAdmin away
  const role = authService.getUserRole();
  if (role && role !== "esslAdmin") {
    router.replace("/dashboard");
    return;
  }
  fetchTenants();
  fetchDealers();
});
</script>
