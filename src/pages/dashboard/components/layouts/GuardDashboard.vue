<template>
  <div class="h-full flex flex-col bg-[#F5F4F1]/80 dark:bg-[#0b0f19] overflow-y-auto custom-scrollbar relative">
    <!-- Glassmorphism Glowing Orbs -->
    <div
      class="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[hsl(220,60%,70%)]/35 dark:bg-blue-600/20 blur-[100px] pointer-events-none z-0 animate-float-gentle"
      style="animation-delay: 0s;"
    />
    <div
      class="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-[hsl(260,50%,72%)]/30 dark:bg-indigo-600/20 blur-[100px] pointer-events-none z-0 animate-float-gentle"
      style="animation-delay: 1.5s;"
    />

    <div class="relative z-10 flex flex-col gap-5 p-4 lg:p-6 min-h-full">
      <!-- ── HEADER ─────────────────────────────────────────────── -->
      <div class="flex items-center justify-between shrink-0">
        <div>
          <h2 class="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Shield class="w-6 h-6 text-indigo-500" /> Patrol Operations Center
          </h2>
          <p class="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {{ formattedDate }} &nbsp;·&nbsp; {{ currentTime }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button class="btn-primary h-9 px-4 text-xs shadow-lg shadow-indigo-500/20" @click="router.push('/dashboard/patrols/create')">
            <Plus class="w-3.5 h-3.5 mr-1.5" /> Create Patrol
          </button>
        </div>
      </div>

      <!-- ── KPI BAR ─────────────────────────────────────────────── -->
      <div class="flex flex-wrap gap-3 shrink-0">

        <!-- KPI: Total Today -->
        <div
          class="bg-[hsl(230,30%,97%)] dark:bg-indigo-500/5 border border-[#E5E1D8]/80 dark:border-indigo-500/20 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3 cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:shadow-md transition-all w-[145px]"
          @click="router.push('/dashboard/patrols?filter=all')"
        >
          <span class="text-3xl font-black text-indigo-600 dark:text-indigo-400 leading-none shrink-0">{{ patrolStats.scheduled }}</span>
          <div class="min-w-0">
            <p class="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Total</p>
            <p class="text-[9px] text-indigo-500 font-bold mt-0.5">All Time</p>
          </div>
        </div>

        <!-- KPI: Active / Running -->
        <div
          class="bg-[hsl(155,30%,97%)] dark:bg-emerald-500/5 border border-[#E5E1D8]/80 dark:border-emerald-500/20 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3 cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-500/40 hover:shadow-md transition-all w-[145px]"
          @click="router.push('/dashboard/patrols?filter=running')"
        >
          <span class="text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none shrink-0">{{ patrolStats.active }}</span>
          <div class="min-w-0">
            <p class="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Running</p>
            <p class="text-[9px] text-emerald-600 font-bold mt-0.5">Live</p>
          </div>
        </div>

        <!-- KPI: Completed Today -->
        <div
          class="bg-[hsl(220,30%,97%)] dark:bg-blue-500/5 border border-[#E5E1D8]/80 dark:border-blue-500/20 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3 cursor-pointer hover:border-blue-200 dark:hover:border-blue-500/40 hover:shadow-md transition-all w-[145px]"
          @click="router.push('/dashboard/patrols?filter=completed')"
        >
          <span class="text-3xl font-black text-blue-600 dark:text-blue-400 leading-none shrink-0">{{ patrolStats.completed }}</span>
          <div class="min-w-0">
            <p class="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Completed</p>
            <p class="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {{ patrolStats.scheduled > 0 ? Math.round((patrolStats.completed / patrolStats.scheduled) * 100) : 0 }}% Done
            </p>
          </div>
        </div>

        <!-- KPI: Missed / Alerts -->
        <div
          class="border border-[#E5E1D8]/80 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition-all w-[145px]"
          :class="patrolStats.missed > 0 ? 'bg-[hsl(348,30%,97%)] dark:bg-rose-500/5 dark:border-rose-500/20 hover:border-rose-200 dark:hover:border-rose-500/40' : 'bg-slate-50/80 dark:bg-slate-700/10 dark:border-slate-700/30 hover:border-slate-200'"
          @click="router.push('/dashboard/patrols?filter=missed')"
        >
          <span class="text-3xl font-black leading-none shrink-0"
                :class="patrolStats.missed > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'">
            {{ patrolStats.missed }}
          </span>
          <div class="min-w-0">
            <p class="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Missed</p>
            <p class="text-[9px] font-bold mt-0.5" :class="patrolStats.missed > 0 ? 'text-rose-500' : 'text-slate-400'">
              {{ patrolStats.missed > 0 ? 'Review' : 'All Clear' }}
            </p>
          </div>
        </div>
      </div>

      <!-- ── MAIN BODY: 3-COLUMN GRID ───────────────────────────── -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">

        <!-- ── LEFT COLUMN: TODAY'S PATROLS ──────────────────────── -->
        <div class="lg:col-span-4 flex flex-col gap-4 min-h-0">

          <!-- Today's Patrols List -->
          <div class="bg-white/80 dark:bg-[#151c2c]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl shadow-sm flex flex-col" style="min-height: 340px; max-height: 460px;">
            <div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 class="text-[13px] font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ClipboardList class="w-4 h-4 text-indigo-500" /> Today's Patrols
              </h3>
              <button class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline" @click="router.push('/dashboard/patrols')">
                View All
              </button>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              <div
                v-for="patrol in todaysPatrolList"
                :key="patrol.id"
                class="flex items-center gap-3 p-3 rounded-xl border bg-slate-50/80 dark:bg-slate-900/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors cursor-pointer group"
                :class="{
                  'border-emerald-200 dark:border-emerald-500/20': patrol.status === 'active',
                  'border-slate-200 dark:border-slate-800': patrol.status !== 'active'
                }"
                @click="router.push('/dashboard/patrols?patrolId=' + patrol.id)"
              >
                <!-- Status dot -->
                <div class="w-2.5 h-2.5 rounded-full shrink-0"
                     :class="{
                       'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse': patrol.status === 'active',
                       'bg-blue-500': patrol.status === 'completed',
                       'bg-rose-500': patrol.status === 'missed',
                       'bg-slate-300 dark:bg-slate-600': patrol.status === 'scheduled'
                     }">
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{{ patrol.routeName || 'Unnamed Route' }}</p>
                  <p class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <MapPin class="w-2.5 h-2.5 shrink-0" />
                    {{ patrol.zoneName || 'Unknown Zone' }}
                    <span v-if="patrol.guardName && patrol.guardName !== 'Unassigned'" class="truncate">
                      &nbsp;·&nbsp; {{ patrol.guardName }}
                    </span>
                  </p>
                </div>

                <!-- Status badge -->
                <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md shrink-0"
                      :class="{
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400': patrol.status === 'active',
                        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400': patrol.status === 'completed',
                        'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400': patrol.status === 'missed',
                        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400': patrol.status === 'scheduled'
                      }">
                  {{ patrol.status === 'active' ? 'Live' : patrol.status === 'completed' ? 'Done' : patrol.status === 'missed' ? 'Missed' : 'Scheduled' }}
                </span>
              </div>

              <!-- Empty State -->
              <div v-if="todaysPatrolList.length === 0" class="flex flex-col items-center justify-center h-full py-10 text-center opacity-60">
                <ClipboardList class="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p class="text-xs font-bold text-slate-600 dark:text-slate-400">No patrols scheduled today</p>
                <button class="mt-3 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline" @click="router.push('/dashboard/patrols/create')">
                  + Create a Patrol
                </button>
              </div>
            </div>
          </div>

          <!-- Zone Coverage -->
          <div class="bg-white/80 dark:bg-[#151c2c]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
            <h3 class="text-[13px] font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 shrink-0">
              <Building2 class="w-4 h-4 text-indigo-500" /> Zone Coverage Today
            </h3>

            <div class="space-y-2">
              <div
                v-for="zone in zoneCoverage"
                :key="zone.id"
                class="flex items-center gap-3"
              >
                <div class="w-2 h-2 rounded-full shrink-0"
                     :class="zone.covered ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'">
                </div>
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1 truncate">{{ zone.name }}</span>
                <span class="text-[10px] font-bold"
                      :class="zone.covered ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'">
                  {{ zone.covered ? `${zone.patrolCount} patrol${zone.patrolCount !== 1 ? 's' : ''}` : 'No Patrol' }}
                </span>
              </div>

              <div v-if="zoneCoverage.length === 0" class="text-xs text-slate-400 text-center py-4">
                No zones found
              </div>
            </div>
          </div>
        </div>

        <!-- ── CENTER COLUMN: LIVE MAP ─────────────────────────── -->
        <div class="lg:col-span-5 flex flex-col min-h-0 relative" style="min-height: 400px;">
          <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex-1 relative flex flex-col">
            <!-- Floating Header on Map -->
            <div class="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
              <div class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-lg pointer-events-auto flex items-center gap-2.5">
                <div class="relative w-2.5 h-2.5 flex items-center justify-center">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-500"></span>
                  <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </div>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100">Live Guard Tracking</span>
                <span class="text-[10px] font-bold text-slate-400">{{ activeGuards.length }} online</span>
              </div>
              <button
                class="w-9 h-9 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-white/10 shadow-lg pointer-events-auto flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                @click="centerMapOnActiveGuards"
              >
                <Maximize class="w-4 h-4" />
              </button>
            </div>

            <!-- The Map Container -->
            <div ref="dashboardMapContainer" id="dashboard-map" class="w-full h-full bg-slate-100 dark:bg-slate-800" style="min-height: 380px;"></div>

            <!-- No GPS overlay -->
            <div v-if="activeGuards.length === 0" class="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-[#151c2c]/50 backdrop-blur-sm pointer-events-none">
              <div class="bg-white dark:bg-slate-900 px-6 py-5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-2 text-center">
                <MapPin class="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
                <p class="text-sm font-bold text-slate-600 dark:text-slate-300">No guards transmitting GPS</p>
                <p class="text-[11px] text-slate-400 dark:text-slate-500">Guards will appear here once on patrol</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ── RIGHT COLUMN: INCIDENTS + QUICK ACTIONS ─────────── -->
        <div class="lg:col-span-3 flex flex-col gap-4 min-h-0">

          <!-- Patrol Quick Actions -->
          <div class="bg-white/80 dark:bg-[#151c2c]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl shadow-sm p-4 shrink-0">
            <h3 class="text-[13px] font-black text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Zap class="w-4 h-4 text-indigo-500" /> Quick Actions
            </h3>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="item in patrolQuickActions"
                :key="item.label"
                class="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:-translate-y-0.5 hover:shadow-sm transition-all group cursor-pointer"
                @click="item.action ? handleAction(item.action) : router.push(item.href)"
              >
                <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" :class="item.iconBg">
                  <component :is="item.icon" class="w-4 h-4" :class="item.iconColor" />
                </div>
                <span class="text-[10px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">{{ item.label }}</span>
              </button>
            </div>
          </div>

          <!-- Recent Incidents Feed -->
          <div class="bg-white/80 dark:bg-[#151c2c]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 flex flex-col flex-1 min-h-[220px] shadow-sm">
            <div class="flex items-center justify-between mb-3 shrink-0">
              <h3 class="text-[13px] font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <AlertCircle class="w-4 h-4 text-rose-500" /> Recent Incidents
              </h3>
              <div class="flex items-center gap-1.5">
                <span v-if="recentIncidents.length > 0" class="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {{ Math.min(recentIncidents.length, 9) }}
                </span>
                <button class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline" @click="router.push('/dashboard/incidents')">
                  All
                </button>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-0.5">
              <div
                v-for="incident in recentIncidents.slice(0, 6)"
                :key="incident.id"
                class="p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
                @click="openIncidentDetails(incident)"
              >
                <div class="flex items-start justify-between gap-2 mb-1">
                  <p class="text-[11px] font-bold text-slate-900 dark:text-slate-100 line-clamp-1 flex-1">
                    {{ incident.title }}
                  </p>
                  <span
                    class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0"
                    :class="{
                      'bg-rose-100 text-rose-700': incident.severity === 'high' || incident.title.includes('SOS'),
                      'bg-amber-100 text-amber-700': incident.severity === 'medium' && !incident.title.includes('SOS'),
                      'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300': incident.severity === 'low'
                    }"
                  >
                    {{ incident.severity === 'high' || incident.title.includes('SOS') ? 'High' : incident.severity }}
                  </span>
                </div>
                <p class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock class="w-2.5 h-2.5" /> {{ incident.time }} · {{ incident.reportedBy }}
                </p>
              </div>

              <div v-if="!recentIncidents || recentIncidents.length === 0" class="h-full flex flex-col items-center justify-center text-center opacity-50 py-8">
                <ShieldCheck class="w-8 h-8 text-slate-400 mb-2" />
                <p class="text-xs font-bold text-slate-600 dark:text-slate-400">No incidents</p>
                <p class="text-[10px] font-medium text-slate-500">All clear on site</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ── INCIDENT DETAIL MODAL ─────────────────────────────── -->
    <Teleport to="body">
      <div
        v-if="selectedIncident"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        @click.self="selectedIncident = null"
      >
        <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                <AlertCircle class="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ selectedIncident.title }}</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ selectedIncident.time }} · {{ selectedIncident.reportedBy }}</p>
              </div>
            </div>
            <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" @click="selectedIncident = null">
              <X class="w-5 h-5" />
            </button>
          </div>
          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2">{{ selectedIncident.description }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400" v-if="selectedIncident.location">
            📍 {{ selectedIncident.location }}
          </p>
          <img v-if="selectedIncident.imageUrl" :src="selectedIncident.imageUrl" class="mt-4 w-full rounded-xl" />
        </div>
      </div>
    </Teleport>

    <!-- Onboarding Wizard -->
    <GettingStartedWizard :is-open="showOnboarding" @close="showOnboarding = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  Shield, AlertCircle, Plus,
  AlertTriangle, UserCheck, QrCode, Clock,
  PlayCircle,
  MapPin, Building2, Download, X, ShieldCheck,
  Calendar, CheckCircle2, ClipboardList, Zap, Maximize
} from 'lucide-vue-next';
import GettingStartedWizard from '../GettingStartedWizard.vue';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { Loader } from '@googlemaps/js-api-loader';

const router = useRouter();
const token = authService.getToken();
const apiUrl = import.meta.env.VITE_API_URL;

const showOnboarding = ref(false);
const loading = ref(false);
const activeGuards = ref([]);

// ── PATROL STATS ──────────────────────────────────────────────────────────────
const patrolStats = ref({
  scheduled: 0,
  active: 0,
  completed: 0,
  missed: 0,
});

// Today's patrol list (flat)
const todaysPatrols = ref([]);

const actualTodaysPatrols = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return todaysPatrols.value.filter(p => {
    if (!p.date) return true; // Include if no date is set
    return p.date === today || (p.scheduledTime && p.scheduledTime.startsWith(today));
  });
});

const todaysPatrolList = computed(() => {
  return actualTodaysPatrols.value.slice(0, 20); // show up to 20 of today's
});

// ── ZONE COVERAGE ─────────────────────────────────────────────────────────────
const allZones = ref([]);
const zoneCoverage = computed(() => {
  return allZones.value.map(z => {
    const zId = String(z.id);
    const patrolsInZone = actualTodaysPatrols.value.filter(p => {
      const pZoneId = String(p.zoneId || p.zone_id || p.zone || '');
      return pZoneId === zId;
    });
    return {
      id: z.id,
      name: z.zoneName || z.name || 'Zone',
      covered: patrolsInZone.length > 0,
      patrolCount: patrolsInZone.length,
    };
  });
});

// ── INCIDENTS ─────────────────────────────────────────────────────────────────
const recentIncidents = ref([]);
const selectedIncident = ref(null);

const openIncidentDetails = (incident) => {
  selectedIncident.value = incident;
};

const loadIncidents = async () => {
  try {
    const { patrolService } = await import('@/services/patrolService');
    const rawAlerts = await patrolService.getAlerts();
    recentIncidents.value = rawAlerts.map(a => {
      let finalImageUrl = a.image_url || null;
      if (finalImageUrl && !finalImageUrl.includes('access_token')) {
        const joiner = finalImageUrl.includes('?') ? '&' : '?';
        finalImageUrl = `${finalImageUrl}${joiner}access_token=${token}`;
      }
      let finalDescription = a.description || 'No additional details provided.';
      if (finalDescription.includes('[AUDIO_URL]:')) {
        finalDescription = finalDescription.split('[AUDIO_URL]:')[0].trim();
      }
      return {
        id: a.id,
        title: a.title || a.type || 'Incident Reported',
        reportedBy: a.reported_by || 'Guard',
        time: new Date(a.date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        severity: (a.severity || 'medium').toLowerCase(),
        location: a.location || 'Unknown Zone',
        description: finalDescription,
        imageUrl: finalImageUrl,
      };
    });
  } catch (e) {
    console.error('Failed to load incidents', e);
  }
};

// ── QUICK ACTIONS ─────────────────────────────────────────────────────────────
const patrolQuickActions = [
  { label: 'Create Patrol', href: '/dashboard/patrols/create', icon: Plus, iconBg: 'bg-indigo-50 dark:bg-indigo-500/10 group-hover:bg-indigo-100', iconColor: 'text-indigo-600 dark:text-indigo-400' },
  { label: 'Manage Patrols', href: '/dashboard/patrols', icon: ClipboardList, iconBg: 'bg-emerald-50 dark:bg-emerald-500/10 group-hover:bg-emerald-100', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Manage Guards', href: '/dashboard/guards', icon: UserCheck, iconBg: 'bg-blue-50 dark:bg-blue-500/10 group-hover:bg-blue-100', iconColor: 'text-blue-600 dark:text-blue-400' },
  { label: 'Checkpoint QR', href: '/dashboard/patrols', action: 'checkpoints', icon: QrCode, iconBg: 'bg-purple-50 dark:bg-purple-500/10 group-hover:bg-purple-100', iconColor: 'text-purple-600 dark:text-purple-400' },
  { label: 'Zones', href: '/dashboard/settings/zones', icon: Building2, iconBg: 'bg-amber-50 dark:bg-amber-500/10 group-hover:bg-amber-100', iconColor: 'text-amber-600 dark:text-amber-400' },
  { label: 'Incidents', href: '/dashboard/incidents', icon: AlertCircle, iconBg: 'bg-rose-50 dark:bg-rose-500/10 group-hover:bg-rose-100', iconColor: 'text-rose-600 dark:text-rose-400' },
];

const handleAction = (action) => {
  if (action === 'checkpoints') {
    router.push('/dashboard/patrols');
  }
};

// ── TIME & DATE ───────────────────────────────────────────────────────────────
const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
});

const currentTime = ref('');
const timeInterval = setInterval(() => {
  currentTime.value = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}, 1000);

// ── STATS LOADING ─────────────────────────────────────────────────────────────
const loadStats = async (isBackground = false) => {
  if (!isBackground) loading.value = true;
  try {
    const tenantId = await currentUserTenant.getTenantIdAsync();
    if (!tenantId || !token) return;

    // Patrols
    try {
      const { patrolService } = await import('@/services/patrolService');
      const [patrols, cgRes] = await Promise.all([
        patrolService.getPatrols(),
        patrolService.fetchCheckpointGroups()
      ]);

      const checkpointGroups = cgRes || [];
      const todays = patrols;

      todaysPatrols.value = todays.map(p => {
        const gId = typeof p.groupId === 'object' ? p.groupId?.id : p.groupId;
        let resolvedName = p.routeName || p.route_name || (typeof p.groupId === 'object' ? p.groupId?.name : null);
        if (!resolvedName && gId) {
          const group = checkpointGroups.find(g => g.id === gId);
          if (group && group.name) {
            resolvedName = group.name;
          }
        }
        
        return {
          id: p.id,
          routeName: resolvedName || 'Unnamed Route',
          zoneName: p.zoneName || p.zone_name || 'Unknown Zone',
          guardName: p.guardName || p.guard_name || 'Unassigned',
          status: p.status || 'scheduled',
          zoneId: p.zoneId || p.zone_id || p.zone,
          groupId: p.groupId,
          date: p.date,
          scheduledTime: p.scheduledTime || p.startTime
        };
      });

      // Group patrols logic to match PatrolsTab
      const groups = new Map();
      todays.forEach(p => {
        const gId = typeof p.groupId === 'object' && p.groupId ? p.groupId.id : (p.groupId || 'nogroup');
        const groupKey = `${p.zoneId}-${gId}-${p.date || ''}`;
        if (!groups.has(groupKey)) groups.set(groupKey, []);
        groups.get(groupKey).push(p);
      });

      let running = 0;
      let completed = 0;
      let missedPatrols = 0;

      for (const slots of groups.values()) {
        let current = slots.find(p => p.status === 'active' || p.status === 'delayed');
        if (!current) current = slots.find(p => p.status === 'scheduled');
        if (!current) current = slots[slots.length - 1]; // All done

        if (current) {
          if (current.status === 'active') running++;
          else if (current.status === 'completed') completed++;
        }

        // Check if the group has any missed patrols or checkpoints
        const hasMissed = slots.some(s => s.status === 'missed' || (s.missedCheckpoints && s.missedCheckpoints > 0));
        if (hasMissed) {
          missedPatrols++;
        }
      }

      patrolStats.value.scheduled = groups.size;
      patrolStats.value.active = running;
      patrolStats.value.completed = completed;
      patrolStats.value.missed = missedPatrols;
    } catch (e) {
      console.error('Failed to load patrol stats', e);
    }

    // Zones
    try {
      const { zoneService } = await import('@/services/zoneService');
      allZones.value = await zoneService.fetchZones();
    } catch (e) { /* zone service fallback */ }

    // Active Guards (GPS tracking)
    try {
      const roleRes = await fetch(
        `${apiUrl}/items/roleConfigurator?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][accessType][_eq]=accessEasy&filter[_and][0][_and][2][roleName][_contains]=guard&fields[]=id`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let guardRoleId = null;
      if (roleRes.ok) {
        const roleData = await roleRes.json();
        guardRoleId = roleData.data?.[0]?.id || null;
      }

      let filterStr = `filter[tenant][_eq]=${tenantId}&filter[status][_eq]=active`;
      if (guardRoleId) filterStr += `&filter[accesseasyRole][_eq]=${guardRoleId}`;

      const usersRes = await fetch(`${apiUrl}/users?${filterStr}&fields=id,first_name,last_name,avatar,phone,email,location,currentLat,currentLng`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const usersList = usersData.data || [];
        activeGuards.value = usersList
          .filter(u => u.currentLat && u.currentLng)
          .map(u => ({
            id: u.id,
            guardName: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown Guard',
            directusAvatar: u.avatar,
            currentLat: u.currentLat,
            currentLng: u.currentLng,
            status: 'active',
          }));
      }
    } catch (e) {
      console.error('Failed to fetch guard locations', e);
    }

  } catch (err) {
    console.error('Failed to load dashboard stats', err);
  } finally {
    loading.value = false;
  }
};

// ── GOOGLE MAP ────────────────────────────────────────────────────────────────
const dashboardMapContainer = ref(null);
let dashboardMap = null;
let googleMarkers = [];

const lightMapStyles = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] }
];

const initDashboardMap = async () => {
  const apiKey = 'AIzaSyCwp-gBFBiutZVlE-a-84hHnA2XeMRGE1g';
  const loader = new Loader({ apiKey, version: 'weekly' });
  try {
    await loader.load();
    if (dashboardMapContainer.value) {
      dashboardMap = new google.maps.Map(dashboardMapContainer.value, {
        center: { lat: 12.9716, lng: 77.5946 },
        zoom: 18,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'auto',
        mapId: 'DASHBOARD_MAP_ID',
        mapTypeId: 'roadmap',
        styles: lightMapStyles
      });
      if (navigator.geolocation && activeGuards.value.length === 0) {
        navigator.geolocation.getCurrentPosition((pos) => {
          dashboardMap?.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        });
      }
    }
  } catch (err) {
    console.error('Failed to load dashboard Google Map', err);
  }
};

const centerMapOnActiveGuards = async () => {
  if (!dashboardMap || activeGuards.value.length === 0) return;
  try {
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
    googleMarkers.forEach(m => m.map = null);
    googleMarkers = [];

    activeGuards.value.forEach(guard => {
      if (guard.currentLat && guard.currentLng) {
        const el = document.createElement('div');
        el.innerHTML = `
          <div class="relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 bg-indigo-500" style="left:0;top:0;"></span>
            <div class="w-8 h-8 border-[3px] border-white rounded-full flex items-center justify-center shadow-md bg-indigo-500 text-white z-10 relative overflow-hidden text-xs font-black">
              ${(guard.guardName || '?').charAt(0).toUpperCase()}
            </div>
          </div>
          <div class="mt-1 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm text-[11px] font-bold text-slate-700 text-center">${guard.guardName || 'Guard'}</div>
        `;

        const marker = new AdvancedMarkerElement({
          map: dashboardMap,
          position: { lat: parseFloat(guard.currentLat), lng: parseFloat(guard.currentLng) },
          content: el,
        });
        googleMarkers.push(marker);
      }
    });

    const firstActive = activeGuards.value[0];
    if (firstActive?.currentLat && firstActive?.currentLng) {
      dashboardMap.panTo({ lat: parseFloat(firstActive.currentLat), lng: parseFloat(firstActive.currentLng) });
      dashboardMap.setZoom(18);
    }
  } catch (e) {
    console.error('Could not center map on guards', e);
  }
};

// ── LIFECYCLE ─────────────────────────────────────────────────────────────────
let refreshInterval;

onMounted(async () => {
  if (!localStorage.getItem('has_completed_onboarding')) {
    showOnboarding.value = true;
  }

  await loadStats();
  await loadIncidents();

  await nextTick();
  await initDashboardMap();
  if (activeGuards.value.length > 0) {
    centerMapOnActiveGuards();
  }

  refreshInterval = setInterval(async () => {
    await loadStats(true);
    await loadIncidents();
    centerMapOnActiveGuards();
  }, 10000);

  document.addEventListener('visibilitychange', handleVisibilityChange);
});

const handleVisibilityChange = async () => {
  if (document.hidden) {
    clearInterval(refreshInterval);
  } else {
    await loadStats(true);
    await loadIncidents();
    refreshInterval = setInterval(async () => {
      await loadStats(true);
      await loadIncidents();
      centerMapOnActiveGuards();
    }, 10000);
  }
};

onUnmounted(() => {
  clearInterval(refreshInterval);
  clearInterval(timeInterval);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
