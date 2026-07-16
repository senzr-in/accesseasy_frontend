<template>
  <div :class="embedded ? 'space-y-4' : 'p-4 md:p-6 h-full overflow-y-auto space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-800/50 '">
    <!-- Back Navigation Bar (hidden when embedded in dashboard) -->
    <div
      v-if="!embedded"
      class="flex items-center justify-between shrink-0 animate-in fade-in slide-in-from-top-4 duration-500"
    >
      <button 
        class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 bg-white dark:bg-slate-900/80 backdrop-blur-md font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-sm cursor-pointer hover:shadow-md"
        @click="$router.push('/dashboard/visitors')"
      >
        <ArrowLeft class="w-3.5 h-3.5" /> Back to Console
      </button>

      <button
        v-if="portals.length > 0 && permissions.create"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm"
        @click="createPortal"
      >
        <Plus class="w-3 h-3" /> New Portal
      </button>
    </div>
    <!-- New Portal button shown inline when embedded -->
    <div
      v-else
      class="flex items-center justify-between shrink-0"
    >
      <h3 class="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200  flex items-center gap-2">
        <Globe class="w-4 h-4 text-blue-500" /> Visitor Portals
      </h3>
      <button
        v-if="permissions.create"
        class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
        @click="createPortal"
      >
        <Plus class="w-3.5 h-3.5" /> New Portal
      </button>
    </div>


    <!-- Loading -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-32 gap-4 animate-in fade-in duration-500"
    >
      <div class="relative">
        <div class="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse" />
        <Loader2 class="w-10 h-10 animate-spin text-blue-500 relative z-10" />
      </div>
      <p class="text-[11px] font-black uppercase tracking-widest text-slate-400">
        Loading portals...
      </p>
    </div>

    <!-- ── Premium Empty State ── -->
    <div
      v-else-if="portals.length === 0"
      class="relative overflow-hidden flex flex-col items-center justify-center py-24 rounded-3xl border border-slate-200 dark:border-slate-800  bg-white dark:bg-slate-900/40  backdrop-blur-xl text-center px-6 animate-in fade-in zoom-in-95 duration-700 shadow-xl"
    >
      <!-- Background Accents -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

      <div class="relative z-10 flex flex-col items-center">
        <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/30 transform hover:scale-105 transition-transform duration-500">
          <Globe class="w-12 h-12 text-white" />
        </div>
        <h3 class="text-3xl font-black text-slate-900 dark:text-slate-100  mb-4 tracking-tight">
          Next-Level Visitor Experience
        </h3>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400  max-w-md mb-10 leading-relaxed">
          Create your beautifully branded visitor check-in portal. Let your visitors pre-register and receive a QR pass instantly.
        </p>
        <button
          :disabled="!permissions.create"
          class="group relative flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900  text-white  text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20  transition-all hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          @click="createPortal"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Plus class="w-4 h-4 relative z-10 group-hover:text-white transition-colors" />
          <span class="relative z-10 group-hover:text-white transition-colors">Create Visitor Portal</span>
        </button>
      </div>
    </div>

    <!-- ── Portal Dashboard Area ── -->
    <div
      v-else
      class="space-y-4"
    >
      <!-- Pro Tip Banner moved to top -->
      <div class="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50   border border-blue-100  shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
        <div class="w-8 h-8 rounded-full bg-blue-100  flex items-center justify-center shrink-0">
          <Info class="w-4 h-4 text-blue-600 " />
        </div>
        <div>
          <h4 class="text-[11px] font-black text-slate-800 dark:text-slate-200  uppercase tracking-widest mb-1">
            Pro Tip
          </h4>
          <p class="text-xs font-semibold text-slate-600 dark:text-slate-300  leading-relaxed">
            Share the portal link with visitors before they arrive. They'll fill in their details and receive a QR pass — guards can instantly scan it at entry for zero friction.
          </p>
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3 items-start">
        <div
          v-for="(portal, index) in portals"
          :key="portal.id"
          class="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md animate-in fade-in slide-in-from-bottom-4 w-full transition-shadow"
          :style="{ animationDelay: `${100 + index * 80}ms`, animationFillMode: 'both' }"
        >
          <!-- Status Dot (top right, smaller) -->
          <div class="absolute top-3 right-3 z-10">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest"
              :class="portal.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'"
            >
              <span
                class="w-1 h-1 rounded-full"
                :class="portal.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'"
              />
              {{ portal.status === 'published' ? 'Live' : 'Draft' }}
            </span>
          </div>

          <!-- Card Header -->
          <div class="flex items-center gap-3 p-4 pr-20">
            <!-- Logo -->
            <div class="w-10 h-10 rounded-xl border border-slate-100 dark:border-slate-700  bg-slate-50 dark:bg-slate-800/50  flex items-center justify-center overflow-hidden shrink-0">
              <img
                v-if="portal.logoUrl"
                :src="portal.logoUrl"
                class="w-full h-full object-contain p-1"
                @error="portal.logoUrl = null"
              >
              <Globe
                v-else
                class="w-5 h-5 text-slate-300 "
              />
            </div>
            <div class="min-w-0">
              <h2 class="text-sm font-black text-slate-900 dark:text-slate-100  tracking-tight truncate">
                {{ portal.Title }}
              </h2>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {{ formatDate(portal.date_created) }}
              </p>
            </div>
          </div>

          <!-- Stats Row - compact -->
          <div class="grid grid-cols-3 divide-x divide-slate-100  border-y border-slate-100 dark:border-slate-700 ">
            <div class="py-3 text-center">
              <p class="text-lg font-black text-slate-900 dark:text-slate-100  leading-none">
                {{ portal.anim.total }}
              </p>
              <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">
                Total
              </p>
            </div>
            <div class="py-3 text-center">
              <p class="text-lg font-black text-emerald-500 leading-none">
                {{ portal.anim.today }}
              </p>
              <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">
                Today
              </p>
            </div>
            <div class="py-3 text-center">
              <p class="text-lg font-black text-blue-500 leading-none">
                {{ portal.anim.active }}
              </p>
              <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
                <span class="w-1 h-1 rounded-full bg-blue-500" />Active
              </p>
            </div>
          </div>

          <!-- URL Strip - compact -->
          <div class="px-4 py-3">
            <div class="flex items-center gap-2">
              <div class="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 min-w-0">
                <Link class="w-3 h-3 text-blue-500 shrink-0" />
                <span class="text-[9px] font-mono font-semibold text-slate-500 dark:text-slate-400  truncate">{{ portal.url }}</span>
              </div>
              <button
                class="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-blue-500 hover:border-blue-400 transition-all active:scale-95"
                @click="copyUrl(portal)"
              >
                <Check
                  v-if="portal.copied"
                  class="w-3 h-3 text-emerald-500"
                />
                <Copy
                  v-else
                  class="w-3 h-3"
                />
              </button>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700  flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <button
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-95"
                @click="openPortal(portal)"
              >
                <ExternalLink class="w-3 h-3" /> Open
              </button>
              <button
                :disabled="!permissions.update"
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 disabled:opacity-50 transition-all active:scale-95"
                @click="editPortal(portal)"
              >
                <Settings class="w-3 h-3" /> Edit
              </button>
              <button
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/10 transition-all active:scale-95"
                @click="shareWhatsApp(portal)"
              >
                <MessageCircle class="w-3 h-3" /> WA
              </button>
              <button
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-blue-500 border border-blue-500/20 hover:bg-blue-500/10 transition-all active:scale-95"
                @click="shareEmail(portal)"
              >
                <Mail class="w-3 h-3" /> Email
              </button>
              <button
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-violet-500 border border-violet-500/20 hover:bg-violet-500/10 transition-all active:scale-95"
                @click="openQrModal(portal)"
              >
                <QrCode class="w-3 h-3" /> Print QR
              </button>
            </div>
            <button
              :disabled="!permissions.delete || portal.deleting"
              class="p-1.5 rounded-lg text-slate-300  hover:text-rose-500 transition-colors disabled:opacity-40"
              @click="confirmDelete(portal)"
            >
              <Trash2
                v-if="!portal.deleting"
                class="w-3.5 h-3.5"
              />
              <Loader2
                v-else
                class="w-3.5 h-3.5 animate-spin"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Delete Confirm Modal ── -->
    <div
      v-if="deleteDialog"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        @click="deleteDialog = false"
      />
      <div class="relative bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-800  rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
        <div class="w-16 h-16 rounded-3xl bg-rose-50  flex items-center justify-center mx-auto mb-6 transform -rotate-6 shadow-inner">
          <Trash2 class="w-8 h-8 text-rose-500" />
        </div>
        <h3 class="text-xl font-black text-slate-900 dark:text-slate-100  mb-2 text-center tracking-tight">
          Delete Portal?
        </h3>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 text-center leading-relaxed">
          This will permanently remove <strong class="text-slate-800 dark:text-slate-200 ">{{ portalToDelete?.Title }}</strong>. All existing visitor links will instantly stop working.
        </p>
        <div class="flex gap-4">
          <button
            class="flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 transition-colors active:scale-95"
            @click="deleteDialog = false"
          >
            Cancel
          </button>
          <button
            :disabled="portalToDelete?.deleting"
            class="flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95"
            @click="deletePortal"
          >
            <Loader2
              v-if="portalToDelete?.deleting"
              class="w-4 h-4 animate-spin"
            />
            Yes, Delete
          </button>
        </div>
      </div>
    </div>

    <!-- ── QR Print Modal ── -->
    <div
      v-if="qrModal.show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        class="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
        @click="qrModal.show = false"
      />
      <div class="relative bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-800  rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 w-full max-w-sm overflow-hidden">
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 ">
          <h3 class="text-[11px] font-black text-slate-800 dark:text-slate-200  uppercase tracking-widest flex items-center gap-2">
            <QrCode class="w-4 h-4 text-violet-500" /> Print QR Code
          </h3>
          <button
            class="text-slate-400 hover:text-slate-600 dark:text-slate-300 :text-white transition-colors"
            @click="qrModal.show = false"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Printable QR Area -->
        <div
          id="qr-print-area"
          class="flex flex-col items-center px-8 py-8 bg-white dark:bg-slate-900"
        >
          <!-- Logo + Brand -->
          <div class="flex items-center gap-2 mb-6">
            <img
              v-if="qrModal.logoUrl"
              :src="qrModal.logoUrl"
              class="w-8 h-8 rounded-lg object-contain"
            >
            <span class="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">{{ qrModal.title }}</span>
          </div>

          <!-- QR Code -->
          <div class="p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-5">
            <QrcodeVue
              :value="qrModal.url"
              :size="200"
              level="H"
              render-as="svg"
            />
          </div>

          <!-- Instruction -->
          <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center mb-1">
            Scan to check in
          </p>
          <p class="text-[8px] font-mono text-slate-400 text-center break-all max-w-[220px]">
            {{ qrModal.url }}
          </p>
        </div>

        <!-- Actions -->
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
          <button
            class="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 transition-colors"
            @click="qrModal.show = false"
          >
            Close
          </button>
          <button
            :disabled="qrModal.downloading"
            class="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            @click="downloadQr"
          >
            <Loader2
              v-if="qrModal.downloading"
              class="w-3.5 h-3.5 animate-spin"
            />
            <Download
              v-else
              class="w-3.5 h-3.5"
            />
            Download
          </button>
          <button
            class="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-violet-600 hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
            @click="printQr"
          >
            <Printer class="w-3.5 h-3.5" /> Print
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
import QrcodeVue from 'qrcode.vue';
import {
  Plus, Loader2, Globe, Link, Copy, Trash2,
  MessageCircle, Mail, Settings, ExternalLink,
  Check, Info, ArrowLeft, QrCode, Printer, X, Download
} from 'lucide-vue-next';

const props = defineProps({ embedded: { type: Boolean, default: false } });

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
const portals     = ref([]);
const loading     = ref(true);
const deleteDialog= ref(false);
const portalToDelete = ref(null);
const qrModal = reactive({ show: false, url: '', title: '', logoUrl: null, downloading: false });


// ── URL helpers ────────────────────────────────────────────────────────────
const BASE_URL  = import.meta.env.VITE_UI_URL || window.location.origin;

const getAssetUrl = (id) => {
  if (!id) return null;
  return `${import.meta.env.VITE_API_URL}/assets/${id}`;
};

// ── Fetch ──────────────────────────────────────────────────────────────────
const animatePortalStat = (portal, key, endValue) => {
  let startTimestamp = null;
  const duration = 1200;
  const startValue = portal.anim[key];
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    portal.anim[key] = Math.floor(ease * (endValue - startValue) + startValue);
    if (progress < 1) window.requestAnimationFrame(step);
    else portal.anim[key] = endValue;
  };
  window.requestAnimationFrame(step);
};

const fetchPortals = async () => {
  loading.value = true;
  try {
    const tenantId = authService.getTenantId();
    
    // Fetch all portals for the tenant
    const res = await authService.protectedApi.get('/items/BrandedPages', {
      params: {
        'filter[tenant][_eq]': tenantId,
        'filter[status][_neq]': 'archived',
        'sort': '-date_created',
        'fields': 'id,Title,status,date_created,Assetjson,tenant',
      }
    });
    
    const data = res.data.data || [];
    
    portals.value = data.map(p => {
      const assetJson = p.Assetjson;
      const parsed = typeof assetJson === 'string' ? JSON.parse(assetJson) : assetJson;
      const logoId = parsed?.images?.logo;
      return reactive({
        ...p,
        logoUrl: logoId ? getAssetUrl(logoId) : null,
        url: `${BASE_URL}/visit/${p.id}`,
        copied: false,
        deleting: false,
        anim: { total: 0, today: 0, active: 0 }
      });
    });

    // Fetch stats per portal in parallel
    const today = new Date().toISOString().split('T')[0];
    await Promise.all(portals.value.map(async (portal) => {
      try {
        const [totalRes, todayRes, activeRes] = await Promise.all([
          authService.protectedApi.get('/items/visitor', { params: { 'filter[portalId][_eq]': portal.id, 'aggregate[count]': 'id' } }),
          authService.protectedApi.get('/items/visitor', { params: { 'filter[portalId][_eq]': portal.id, 'filter[startDate][_eq]': today, 'aggregate[count]': 'id' } }),
          authService.protectedApi.get('/items/visitor', { params: { 'filter[portalId][_eq]': portal.id, 'filter[status][_eq]': 'active', 'aggregate[count]': 'id' } }),
        ]);

        const total  = totalRes.data?.data?.[0]?.count?.id  ?? 0;
        const todayN = todayRes.data?.data?.[0]?.count?.id  ?? 0;
        const active = activeRes.data?.data?.[0]?.count?.id ?? 0;
        
        animatePortalStat(portal, 'total', total);
        animatePortalStat(portal, 'today', todayN);
        animatePortalStat(portal, 'active', active);
      } catch (e) {
        console.warn(`Stats fetch failed for portal ${portal.id}:`, e.message);
      }
    }));

  } catch (err) {
    console.error('Failed to load portals:', err);
  } finally {
    loading.value = false;
  }
};


// ── Actions ────────────────────────────────────────────────────────────────
const createPortal = () => router.push('/dashboard/visitor-portals/builder');
const editPortal   = (portal) => router.push(`/dashboard/visitor-portals/builder/${portal.id}`);
const openPortal   = (portal) => window.open(portal.url, '_blank');

const openQrModal = (portal) => {
  qrModal.show    = true;
  qrModal.url     = portal.url;
  qrModal.title   = portal.Title;
  qrModal.logoUrl = portal.logoUrl;
};

const printQr = () => {
  const area = document.getElementById('qr-print-area');
  if (!area) return;
  const printWin = window.open('', '_blank', 'width=400,height=500');
  printWin.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Visitor QR - ${qrModal.title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; font-family: sans-serif; }
          .wrap { text-align: center; padding: 32px; }
          .logo-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; }
          .logo-row img { width: 32px; height: 32px; border-radius: 8px; object-fit: contain; }
          .logo-row span { font-size: 16px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
          .qr-box { display: inline-block; padding: 12px; border: 2px solid #e2e8f0; border-radius: 16px; margin-bottom: 16px; }
          .hint { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
          .url { font-size: 8px; font-family: monospace; color: #cbd5e1; word-break: break-all; max-width: 220px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="wrap">
          ${area.innerHTML}
        </div>
      </body>
    </html>
  `);
  printWin.document.close();
  printWin.focus();
  setTimeout(() => { printWin.print(); printWin.close(); }, 500);
};

const downloadQr = async () => {
  const area = document.getElementById('qr-print-area');
  if (!area) return;
  qrModal.downloading = true;
  try {
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(area, { backgroundColor: '#ffffff', pixelRatio: 3 });
    const link = document.createElement('a');
    link.download = `QR-${qrModal.title.replace(/\s+/g, '-')}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('QR download failed:', err);
  } finally {
    qrModal.downloading = false;
  }
};

const copyUrl = async (portal) => {
  const textToCopy = portal.url;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (!successful) throw new Error("execCommand copy failed");
    }
    portal.copied = true;
    messageHandler.showSuccess('Link copied to clipboard!');
    setTimeout(() => { portal.copied = false; }, 2000);
  } catch (err) {
    console.error('Failed to copy link:', err);
    messageHandler.showError('Failed to copy link to clipboard.');
  }
};

const shareWhatsApp = (portal) => {
  const text = encodeURIComponent(`Check in at our visitor portal: ${portal.url}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
};

const shareEmail = (portal) => {
  const subject = encodeURIComponent(`Visitor Portal: ${portal.Title}`);
  const body    = encodeURIComponent(`Hello,\n\nPlease use the link below to check in as a visitor:\n${portal.url}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

const confirmDelete = (portal) => {
  if (!permissions.delete) { messageHandler.showError('No permission to delete.'); return; }
  portalToDelete.value = portal;
  deleteDialog.value = true;
};

const deletePortal = async () => {
  if (!portalToDelete.value) return;
  const p = portalToDelete.value;
  p.deleting = true;
  try {
    await authService.protectedApi.patch(`/items/BrandedPages/${p.id}`, { status: 'archived' });
    messageHandler.showSuccess('Portal deleted.');
    portals.value = portals.value.filter(item => item.id !== p.id);
    deleteDialog.value = false;
  } catch (err) {
    messageHandler.showError('Failed to delete portal.');
  } finally {
    p.deleting = false;
    portalToDelete.value = null;
  }
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

onMounted(fetchPortals);
</script>

<style scoped>
.scale-in-center {
  animation: scale-in-center 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}

@keyframes scale-in-center {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
