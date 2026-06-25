<template>
  <div class="p-6 md:p-8 h-full overflow-y-auto">
    <!-- Header -->
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white mb-1">
          Visitor Portal
        </h1>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
          Your public-facing visitor check-in page.
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-24 gap-4"
    >
      <Loader2 class="w-8 h-8 animate-spin text-blue-500" />
      <p class="text-sm font-semibold text-slate-400">
        Loading portal...
      </p>
    </div>

    <!-- ── Empty State ── -->
    <div
      v-else-if="!portal"
      class="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-center px-6"
    >
      <div class="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6">
        <Globe class="w-10 h-10 text-blue-500" />
      </div>
      <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2">
        No Visitor Portal Yet
      </h3>
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mb-8">
        Create your branded visitor check-in portal. Visitors will register, fill their details, and receive a QR pass — all from one link.
      </p>
      <button
        :disabled="!permissions.create"
        class="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        @click="createPortal"
      >
        <Plus class="w-4 h-4" />
        Create Visitor Portal
      </button>
    </div>

    <!-- ── Portal Card ── -->
    <div
      v-else
      class="space-y-6 max-w-3xl"
    >
      <!-- Status Bar -->
      <div class="flex items-center gap-3">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
          :class="portal.status === 'published'
            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="portal.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'"
          />
          {{ portal.status === 'published' ? 'Live' : 'Draft' }}
        </span>
        <span class="text-xs font-semibold text-slate-400">Created {{ formatDate(portal.date_created) }}</span>
      </div>

      <!-- Main Card -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <!-- Card Header -->
        <div class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-4">
            <!-- Logo -->
            <div class="w-14 h-14 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              <img
                v-if="logoUrl"
                :src="logoUrl"
                class="w-full h-full object-contain p-1"
                @error="logoUrl = null"
              >
              <Globe
                v-else
                class="w-7 h-7 text-slate-300 dark:text-slate-600"
              />
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-900 dark:text-white">
                {{ portal.Title }}
              </h2>
              <p class="text-xs font-semibold text-slate-400">
                Visitor Check-in Portal
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <button
              title="Open Live Portal"
              class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              @click="openPortal"
            >
              <ExternalLink class="w-3.5 h-3.5" />
              Open
            </button>
            <button
              :disabled="!permissions.update"
              class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-blue-500/20"
              @click="editPortal"
            >
              <Settings class="w-3.5 h-3.5" />
              Edit Settings
            </button>
          </div>
        </div>

        <!-- Portal URL Strip -->
        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Portal Link
          </p>
          <div class="flex items-center gap-2">
            <div class="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 min-w-0">
              <Link class="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span class="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 truncate">{{ portalUrl }}</span>
            </div>
            <button
              title="Copy Link"
              class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-all"
              @click="copyUrl"
            >
              <Check
                v-if="copied"
                class="w-4 h-4 text-emerald-500"
              />
              <Copy
                v-else
                class="w-4 h-4"
              />
            </button>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
          <div class="px-6 py-5 text-center">
            <p class="text-2xl font-black text-slate-900 dark:text-white">
              {{ stats.total }}
            </p>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Total Visitors
            </p>
          </div>
          <div class="px-6 py-5 text-center">
            <p class="text-2xl font-black text-emerald-500">
              {{ stats.today }}
            </p>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Today
            </p>
          </div>
          <div class="px-6 py-5 text-center">
            <p class="text-2xl font-black text-blue-500">
              {{ stats.active }}
            </p>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Active Now
            </p>
          </div>
        </div>

        <!-- Share Footer -->
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <p class="text-xs font-semibold text-slate-400">
            Share portal with visitors
          </p>
          <div class="flex items-center gap-2">
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
              @click="shareWhatsApp"
            >
              <MessageCircle class="w-3.5 h-3.5" />
              WhatsApp
            </button>
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
              @click="shareEmail"
            >
              <Mail class="w-3.5 h-3.5" />
              Email
            </button>
            <button
              :disabled="!permissions.delete"
              title="Delete Portal"
              class="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              @click="confirmDelete"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20">
        <Info class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p class="text-xs font-medium text-blue-700 dark:text-blue-400">
          Share the portal link with visitors before they arrive. They'll fill in their details and receive a QR pass — guards can scan it at entry.
        </p>
      </div>
    </div>

    <!-- ── Delete Confirm Modal ── -->
    <div
      v-if="deleteDialog"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        @click="deleteDialog = false"
      />
      <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div class="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
          <Trash2 class="w-6 h-6 text-rose-500" />
        </div>
        <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2 text-center">
          Delete Portal?
        </h3>
        <p class="text-sm font-medium text-slate-500 mb-6 text-center">
          This will permanently remove <strong class="text-slate-700 dark:text-slate-300">{{ portal?.Title }}</strong>. All existing visitor links will stop working.
        </p>
        <div class="flex gap-3">
          <button
            class="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            @click="deleteDialog = false"
          >
            Cancel
          </button>
          <button
            :disabled="deleting"
            class="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            @click="deletePortal"
          >
            <Loader2
              v-if="deleting"
              class="w-4 h-4 animate-spin"
            />
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';
import {
  Plus, Loader2, Globe, Link, Copy, Trash2,
  MessageCircle, Mail, Settings, ExternalLink,
  Check, Info
} from 'lucide-vue-next';

// ── Permissions ────────────────────────────────────────────────────────────
const userRole  = computed(() => authService.getUserRole());
const isAdmin   = computed(() => userRole.value === 'Admin' || userRole.value === 'esslAdmin');
const permissions = reactive({
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
});

const router = useRouter();

const defaultHandler = {
  showSuccess: (m) => console.log('[OK]', m),
  showError:   (m) => console.error('[ERR]', m),
  showWarning: (m) => console.warn('[WARN]', m),
};
const messageHandler = inject('messageHandler', defaultHandler);

// ── State ──────────────────────────────────────────────────────────────────
const portal      = ref(null);
const loading     = ref(true);
const deleting    = ref(false);
const deleteDialog= ref(false);
const copied      = ref(false);
const logoUrl     = ref(null);

const stats = reactive({ total: 0, today: 0, active: 0 });

// ── URL helpers ────────────────────────────────────────────────────────────
const BASE_URL  = import.meta.env.VITE_UI_URL || 'https://view.fieldseasy.com';
const portalUrl = computed(() => portal.value ? `${BASE_URL}/visit/${portal.value.id}` : '');

const getAssetUrl = (id) => {
  if (!id) return null;
  return `${import.meta.env.VITE_API_URL}/assets/${id}?access_token=${import.meta.env.VITE_API_TOKEN}`;
};

// ── Fetch ──────────────────────────────────────────────────────────────────
const fetchPortal = async () => {
  loading.value = true;
  try {
    const tenantId = authService.getTenantId();
    const res = await authService.protectedApi.get('/items/BrandedPages', {
      params: {
        'filter[tenant][_eq]': tenantId,
        'filter[status][_neq]': 'archived',
        'sort': '-date_created',
        'limit': 1,
        'fields': 'id,Title,status,date_created,Assetjson,tenant',
      }
    });
    const data = res.data.data || [];
    portal.value = data.length ? data[0] : null;

    if (portal.value) {
      // Resolve logo
      const assetJson = portal.value.Assetjson;
      const parsed = typeof assetJson === 'string' ? JSON.parse(assetJson) : assetJson;
      const logoId = parsed?.images?.logo;
      logoUrl.value = logoId ? getAssetUrl(logoId) : null;

      // Fetch visitor stats
      await fetchStats(portal.value.id, tenantId);
    }
  } catch (err) {
    console.error('Failed to load portal:', err);
  } finally {
    loading.value = false;
  }
};

const fetchStats = async (portalId, tenantId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [totalRes, todayRes, activeRes] = await Promise.all([
      // 1. Total Visitors registered under this tenant
      authService.protectedApi.get('/items/visitor', {
        params: {
          'filter[tenant][tenantId][_eq]': tenantId,
          'aggregate[count]': 'id'
        }
      }),
      // 2. Today's Visitors registered under this tenant
      authService.protectedApi.get('/items/visitor', {
        params: {
          'filter[tenant][tenantId][_eq]': tenantId,
          'filter[startDate][_eq]': today,
          'aggregate[count]': 'id'
        }
      }),
      // 3. Active Visitors (Inside Now) under this tenant
      authService.protectedApi.get('/items/visitor', {
        params: {
          'filter[tenant][tenantId][_eq]': tenantId,
          'filter[status][_eq]': 'active',
          'aggregate[count]': 'id'
        }
      }),
    ]);

    stats.total  = totalRes.data?.data?.[0]?.count?.id  ?? 0;
    stats.today  = todayRes.data?.data?.[0]?.count?.id  ?? 0;
    stats.active = activeRes.data?.data?.[0]?.count?.id ?? 0;
  } catch (e) {
    console.warn('Stats fetch failed (non-critical):', e.message);
  }
};

// ── Actions ────────────────────────────────────────────────────────────────
const createPortal = () => router.push('/dashboard/visitor-portals/builder');
const editPortal   = () => router.push(`/dashboard/visitor-portals/builder/${portal.value.id}`);
const openPortal   = () => window.open(portalUrl.value, '_blank');

const copyUrl = async () => {
  await navigator.clipboard.writeText(portalUrl.value);
  copied.value = true;
  messageHandler.showSuccess('Link copied to clipboard!');
  setTimeout(() => { copied.value = false; }, 2000);
};

const shareWhatsApp = () => {
  const text = encodeURIComponent(`Check in at our visitor portal: ${portalUrl.value}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
};

const shareEmail = () => {
  const subject = encodeURIComponent(`Visitor Portal: ${portal.value?.Title}`);
  const body    = encodeURIComponent(`Hello,\n\nPlease use the link below to check in as a visitor:\n${portalUrl.value}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

const confirmDelete = () => {
  if (!permissions.delete) { messageHandler.showError('No permission to delete.'); return; }
  deleteDialog.value = true;
};

const deletePortal = async () => {
  if (!portal.value) return;
  deleting.value = true;
  try {
    await authService.protectedApi.patch(`/items/BrandedPages/${portal.value.id}`, { status: 'archived' });
    messageHandler.showSuccess('Portal deleted.');
    portal.value   = null;
    deleteDialog.value = false;
  } catch (err) {
    messageHandler.showError('Failed to delete portal.');
  } finally {
    deleting.value = false;
  }
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

onMounted(fetchPortal);
</script>
