<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans p-4 sm:p-6 lg:p-10 gap-6 max-w-6xl mx-auto w-full">

    <!-- Loading Skeleton -->
    <div v-if="store.loading" class="flex flex-col items-center justify-center py-32 gap-4 text-slate-500">
      <div class="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm font-bold tracking-wide">Loading Subscription Details…</span>
    </div>

    <template v-else>

      <!-- Expired Critical Warning Banner -->
      <div
        v-if="store.isExpired"
        class="p-5 rounded-3xl bg-red-600 text-white shadow-xl shadow-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <AlertTriangle class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider">Patrol Subscription Expired</h3>
            <p class="text-xs text-red-100 mt-0.5">Your site licenses and live officer GPS tracking are currently suspended.</p>
          </div>
        </div>
        <button
          class="h-11 px-6 rounded-2xl bg-white text-red-700 hover:bg-red-50 font-black text-xs uppercase tracking-wider transition-all shadow-lg shrink-0 flex items-center gap-2 cursor-pointer"
          @click="router.push('/dashboard/settings/plans')"
        >
          <span>Renew Subscription Now</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <!-- Main Subscription Header Card -->
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
              <ShieldCheck class="w-7 h-7" />
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2.5">
                <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {{ store.isTrial ? '7-Day Free Trial' : 'AccessEasy Patrol Platform' }}
                </h1>
                <span
                  class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border"
                  :class="store.isTrial ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-300 dark:border-amber-500/30' : store.isExpired ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border-red-300 dark:border-red-500/30' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'"
                >
                  {{ store.isExpired ? '● Expired' : store.isTrial ? '● Trial Active' : '● Active Subscription' }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Licensed for <strong>{{ store.allowedSites }} {{ store.allowedSites === 1 ? 'Physical Site' : 'Physical Sites' }}</strong> · Flat <strong>₹1,999 / site / month</strong>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <button
              class="h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              @click="router.push('/dashboard/settings/plans')"
            >
              <CreditCard class="w-4 h-4" />
              <span>Change Site Capacity & Billing</span>
              <ArrowUpRight class="w-4 h-4" />
            </button>
            <button
              class="h-11 w-11 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer"
              @click="handleRefresh"
              :disabled="isRefreshing"
              title="Sync Status"
            >
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
            </button>
          </div>
        </div>

        <!-- 3 Core Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <!-- Stat 1: Site Capacity -->
          <div class="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Licensed Site Capacity</span>
              <Building2 class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-mono font-black text-slate-900 dark:text-white">
                {{ store.usage?.site_count || 0 }}
              </span>
              <span class="text-sm font-bold text-slate-400">
                / {{ store.allowedSites }} {{ store.allowedSites === 1 ? 'Site' : 'Sites' }}
              </span>
            </div>
            <div class="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mt-2">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="siteUsagePercent >= 100 ? 'bg-amber-500' : 'bg-blue-600'"
                :style="{ width: `${Math.min(siteUsagePercent, 100)}%` }"
              ></div>
            </div>
            <div class="flex justify-between items-center text-[11px] pt-1">
              <span class="text-slate-500">{{ siteUsagePercent }}% Allocated</span>
              <button
                class="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                @click="router.push('/dashboard/settings/plans')"
              >
                + Add More Sites
              </button>
            </div>
          </div>

          <!-- Stat 2: Monthly Spend -->
          <div class="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Monthly Subscription</span>
              <CreditCard class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div class="text-3xl font-mono font-black text-slate-900 dark:text-white">
              ₹{{ (1999 * (store.allowedSites || 1)).toLocaleString() }}
            </div>
            <p class="text-xs text-slate-500 font-medium">
              ₹1,999 × {{ store.allowedSites }} {{ store.allowedSites === 1 ? 'Site' : 'Sites' }} / month
            </p>
            <div class="flex justify-between items-center text-[11px] pt-1">
              <span class="text-slate-500">Billing Interval</span>
              <span class="font-bold text-emerald-600">Monthly</span>
            </div>
          </div>

          <!-- Stat 3: Renewal / Trial -->
          <div class="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>{{ store.isTrial ? 'Trial Expiry' : 'Renewal Status' }}</span>
              <Clock class="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div class="text-2xl font-black text-slate-900 dark:text-white">
              {{ renewalDateFormatted || 'Active' }}
            </div>
            <p v-if="store.daysRemaining !== null && !store.isExpired" class="text-xs text-blue-600 dark:text-blue-400 font-bold">
              {{ store.daysRemaining }} days remaining
            </p>
            <p v-else class="text-xs text-slate-500">Continuous active operation</p>
            <div class="flex justify-between items-center text-[11px] pt-1">
              <span class="text-slate-500">Payment Status</span>
              <span class="font-bold text-emerald-600">✓ Active</span>
            </div>
          </div>

        </div>

      </div>

      <!-- Platform Capabilities (100% Unlimited Features) -->
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
          <div>
            <h3 class="text-base font-black text-slate-900 dark:text-white">Included Platform Capabilities</h3>
            <p class="text-xs text-slate-500">Every feature is 100% unlocked with zero per-user or add-on charges</p>
          </div>
          <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
            ✓ 100% Unlocked
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(feature, idx) in activeFeaturesList"
            :key="idx"
            class="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-start gap-3.5"
          >
            <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <component :is="feature.icon" class="w-4 h-4" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-900 dark:text-white">{{ feature.title }}</span>
                <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                  Unlimited
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5 leading-snug">{{ feature.desc }}</p>
            </div>
          </div>
        </div>
      </div>

    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlanStore } from '@/stores/usePlanStore';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { 
  ShieldCheck, CreditCard, AlertTriangle, Building2, Clock, 
  RefreshCw, ArrowRight, ArrowUpRight, Navigation, AlertCircle, 
  Smartphone, ScrollText, Calendar, QrCode
} from 'lucide-vue-next';

const router = useRouter();
const store = usePlanStore();
const isRefreshing = ref(false);

const renewalDateFormatted = computed(() => {
  const d = store.subscription?.active_until || store.subscription?.renewal_date || store.subscription?.end_date;
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
});

const siteUsagePercent = computed(() => {
  const current = store.usage?.site_count || 0;
  const max = store.allowedSites || 1;
  return Math.round((current / max) * 100);
});

const activeFeaturesList = [
  { title: 'Unlimited Guard Accounts', desc: 'Add all security guards and supervisors with zero per-user fees.', icon: ShieldCheck },
  { title: 'Live GPS & Breadcrumbs', desc: 'Real-time officer geolocation, live map telemetry, and boundary alarms.', icon: Navigation },
  { title: 'QR & NFC Checkpoints', desc: 'Generate tamper-proof checkpoint tokens and physical NFC tags.', icon: QrCode },
  { title: 'Automated Escalation Chains', desc: 'Multi-tier fallback alert engine for SOS emergency panic & missed rounds.', icon: AlertCircle },
  { title: '24/7 Shift Scheduler', desc: 'Guard shift rotation matrix, fatigue detection, and compliance logs.', icon: Calendar },
  { title: 'Handheld Fleet Telemetry', desc: 'Live battery %, device heartbeat, and remote unlinking.', icon: Smartphone }
];

async function handleRefresh() {
  isRefreshing.value = true;
  try {
    await currentUserTenant.refresh();
    await store.refreshPlan();
  } catch (e) {
    console.error('Failed to sync plan:', e);
  } finally {
    isRefreshing.value = false;
  }
}

onMounted(async () => {
  if (!store.ready) {
    await store.initPlan();
  }
});
</script>
