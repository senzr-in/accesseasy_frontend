<template>
  <div class="h-full bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-50 p-6 pb-8 font-sans overflow-y-auto custom-scrollbar">
    <!-- Top Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 flex items-center justify-center bg-transparent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white leading-none">
            Dashboard
          </h1>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Real-time overview of your security operations
          </p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 shadow-sm cursor-pointer">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-200">Main Office</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <button class="relative p-2 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-300 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#0b0f19]">12</span>
        </button>
        <div class="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-white/10">
          <img
            src="https://ui-avatars.com/api/?name=Admin&background=random"
            alt="Admin"
            class="w-8 h-8 rounded-full"
          >
          <div class="hidden sm:block text-sm">
            <p class="font-bold text-slate-900 dark:text-white leading-none">
              Admin
            </p>
            <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Super Admin
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      <div
        v-for="(kpi, i) in kpiCardsFormatted"
        :key="i"
        class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm flex items-start gap-3"
      >
        <!-- Icon -->
        <div :class="`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${kpi.iconBg}`">
          <component
            :is="kpi.icon"
            class="w-6 h-6"
          />
        </div>
        
        <!-- Content -->
        <div class="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div>
            <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              {{ kpi.label }}
            </p>
            <div class="flex items-end gap-1.5">
              <h3 class="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {{ kpi.value }}
              </h3>
              <span
                v-if="kpi.total"
                class="text-xs font-bold text-slate-400 mb-0.5"
              >/ {{ kpi.total }}</span>
            </div>
          </div>
          
          <!-- Bottom line -->
          <div
            v-if="kpi.trend"
            class="mt-3 text-[10px] font-bold flex items-center gap-1"
            :class="kpi.trendColor"
          >
            <span>{{ kpi.trendIcon }}</span>
            <span>{{ kpi.trend }} vs yesterday</span>
          </div>
          <div
            v-else-if="kpi.progress"
            class="mt-3"
          >
            <div class="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              <span>{{ kpi.progress.label }}</span>
            </div>
            <div class="h-1 w-full bg-slate-100 dark:bg-white dark:bg-slate-900/10 rounded-full overflow-hidden">
              <div
                class="h-full bg-green-500 rounded-full"
                :style="{ width: kpi.progress.value + '%' }"
              />
            </div>
          </div>
          <div
            v-else-if="kpi.link"
            class="mt-3 text-[11px] font-bold text-red-500 hover:text-red-600 cursor-pointer flex items-center gap-1 transition-colors"
          >
            {{ kpi.link }} <ChevronRight class="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>

    <!-- Main 3-Column Layout -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-3 mb-4">
      <!-- AI Event Feed -->
      <div class="xl:col-span-5 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col shadow-sm h-[380px]">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">
            AI Event Feed
          </h2>
          <button class="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
            View All Events
          </button>
        </div>
        <div class="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <div
            v-for="event in processedActivityFeed"
            :key="event.id"
            class="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-white/5 last:border-0 group hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-800/50 transition-colors px-2 -mx-2 rounded-lg"
          >
            <!-- Dot -->
            <div :class="`w-2 h-2 rounded-full shrink-0 ${event.dotColor}`" />
            
            <!-- Time -->
            <div class="w-14 shrink-0">
              <p class="text-[11px] font-bold text-slate-900 dark:text-white">
                {{ event.time }}
              </p>
              <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Today
              </p>
            </div>

            <!-- Icon -->
            <div :class="`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${event.iconBg}`">
              <component
                :is="event.icon"
                class="w-4 h-4"
              />
            </div>

            <!-- Title & Subtitle -->
            <div class="flex-1 min-w-0">
              <h4 class="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                {{ event.title }}
              </h4>
              <div class="flex items-center gap-2 mt-1">
                <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {{ event.subtitle }}
                </p>
                <span
                  v-if="event.badge"
                  :class="`px-1.5 py-0.5 rounded text-[9px] font-bold ${event.badgeClass}`"
                >{{ event.badge }}</span>
              </div>
            </div>

            <!-- Location & Camera -->
            <div class="w-24 shrink-0">
              <p class="text-[11px] font-medium text-slate-900 dark:text-white truncate">
                {{ event.location }}
              </p>
              <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate mt-1">
                {{ event.camera }}
              </p>
            </div>

            <!-- Image -->
            <div class="w-12 h-10 rounded-md overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative shadow-sm border border-slate-200 dark:border-white/10">
              <img
                v-if="event.image"
                :src="event.image"
                class="w-full h-full object-cover"
              >
              <component
                :is="event.fallbackIcon"
                v-else
                class="w-5 h-5 text-slate-400"
              />
              <div
                v-if="event.image && event.smallIcon"
                :class="`absolute -bottom-1 -left-1 w-4 h-4 rounded text-[8px] flex items-center justify-center border border-white dark:border-[#151c2c] ${event.iconColor}`"
              >
                <component
                  :is="event.smallIcon"
                  class="w-2.5 h-2.5"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Snapshots -->
      <div class="xl:col-span-3 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col shadow-sm h-[380px]">
        <div class="px-4 py-4 border-b border-slate-100 dark:border-white/5 shrink-0 flex flex-col gap-3">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">
            Recent Snapshots
          </h2>
          <div class="flex bg-slate-50 dark:bg-black/20 rounded-lg p-1 border border-slate-200 dark:border-white/5">
            <button
              :class="['flex-1 py-1 text-[11px] font-bold rounded-md transition-colors border', activeSnapshotFilter === 'All' ? 'bg-white dark:bg-[#151c2c] shadow-sm text-slate-900 dark:text-white border-slate-200 dark:border-white/10' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-300']"
              @click="activeSnapshotFilter = 'All'"
            >
              All
            </button>
            <button
              :class="['flex-1 py-1 flex justify-center items-center rounded-md transition-colors border', activeSnapshotFilter === 'Scan' ? 'bg-white dark:bg-[#151c2c] shadow-sm text-slate-900 dark:text-white border-slate-200 dark:border-white/10' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-300']"
              @click="activeSnapshotFilter = 'Scan'"
            >
              <Scan class="w-3.5 h-3.5" />
            </button>
            <button
              :class="['flex-1 py-1 flex justify-center items-center rounded-md transition-colors border', activeSnapshotFilter === 'Car' ? 'bg-white dark:bg-[#151c2c] shadow-sm text-slate-900 dark:text-white border-slate-200 dark:border-white/10' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-300']"
              @click="activeSnapshotFilter = 'Car'"
            >
              <Car class="w-3.5 h-3.5" />
            </button>
            <button
              :class="['flex-1 py-1 flex justify-center items-center rounded-md transition-colors border', activeSnapshotFilter === 'User' ? 'bg-white dark:bg-[#151c2c] shadow-sm text-slate-900 dark:text-white border-slate-200 dark:border-white/10' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-300']"
              @click="activeSnapshotFilter = 'User'"
            >
              <User class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div class="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <div
            v-for="snap in recentSnapshots"
            :key="snap.id"
            class="flex gap-3 mb-4 last:mb-0 items-center group cursor-pointer border-b border-slate-50 dark:border-white/5 pb-4 last:border-0 last:pb-0"
          >
            <div class="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 relative shadow-sm group-hover:border-blue-500/30 transition-colors">
              <img
                :src="snap.image"
                class="w-full h-full object-cover"
              >
              <div :class="`absolute -bottom-1 -left-1 w-4 h-4 rounded text-[8px] flex items-center justify-center border border-white dark:border-[#151c2c] ${snap.iconBg}`">
                <component
                  :is="snap.icon"
                  class="w-2.5 h-2.5"
                />
              </div>
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-center">
              <p class="text-[9px] text-slate-400 font-bold mb-0.5">
                {{ snap.time }}
              </p>
              <h4 class="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                {{ snap.title }}
              </h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                {{ snap.location }}
              </p>
            </div>
          </div>
          <button class="w-full text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-2 text-left transition-colors">
            View All Snapshots
          </button>
        </div>
      </div>

      <!-- Platform Modules -->
      <div class="xl:col-span-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm flex flex-col overflow-hidden h-[380px]">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-white/5 shrink-0">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">
            Platform Modules
          </h2>
          <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            Enable and manage platform modules
          </p>
        </div>
        <div class="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <div class="mb-5">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Installed
            </p>
            <div class="bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-xl p-3 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                  <Check class="w-3.5 h-3.5" />
                </div>
                <div class="min-w-0">
                  <h4 class="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                    AI Camera Analytics
                  </h4>
                  <p class="text-[9px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Face, Vehicle & Person Detection
                  </p>
                </div>
              </div>
              <span class="bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[9px] font-bold px-2 py-0.5 rounded border border-green-200 dark:border-green-500/30 shrink-0 ml-2">Active</span>
            </div>
          </div>
          
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Available Add-ons
            </p>
            <div class="space-y-2">
              <div
                v-for="module in availableModules"
                :key="module.id"
                class="border border-slate-100 dark:border-white/5 rounded-xl p-2.5 flex items-center justify-between hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors bg-white dark:bg-transparent"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div :class="`w-6 h-6 rounded flex items-center justify-center text-white shrink-0 ${module.color}`">
                    <component
                      :is="module.icon"
                      class="w-3.5 h-3.5"
                    />
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                      {{ module.title }}
                    </h4>
                    <p class="text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {{ module.desc }}
                    </p>
                  </div>
                </div>
                <button class="text-[10px] font-bold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors shrink-0 ml-2">
                  Enable
                </button>
              </div>
            </div>
            <button class="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-4 transition-colors">
              See all modules in marketplace &rsaquo;
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Camera Health + Promo Row -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-3">
      <!-- Camera Health -->
      <div class="xl:col-span-9 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col shadow-sm">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white">
            Camera Health
          </h2>
          <div class="flex flex-wrap items-center gap-4 text-[10px] font-bold">
            <span class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"><span class="w-2 h-2 rounded-full bg-green-500 shadow-sm" /> Online (18)</span>
            <span class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"><span class="w-2 h-2 rounded-full bg-red-500 shadow-sm" /> Offline (2)</span>
            <span class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"><span class="w-2 h-2 rounded-full bg-blue-500 shadow-sm" /> Recording (18)</span>
            <span class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"><span class="w-2 h-2 rounded-full bg-purple-500 shadow-sm" /> AI Running (18)</span>
          </div>
        </div>
        <div class="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div
            v-for="cam in filteredCameras"
            :key="cam.id"
            class="rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 group cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 bg-white dark:bg-[#1e293b] shadow-sm hover:shadow-md"
          >
            <div class="h-[72px] relative overflow-hidden bg-slate-100 dark:bg-black/50">
              <img
                v-if="cam.liveSnapshot || cam.fallbackUrl"
                :src="cam.liveSnapshot || cam.fallbackUrl"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              >
              <div
                v-else
                class="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2"
              >
                <VideoOff class="w-6 h-6 opacity-50" />
                <span class="text-[9px] font-medium">No Signal</span>
              </div>
              <div class="absolute bottom-2 left-2 flex gap-1">
                <span
                  v-if="cam.id !== 4"
                  class="bg-white dark:bg-slate-900/90 dark:bg-black/60 backdrop-blur-sm text-blue-600 dark:text-blue-400 rounded px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-1 shadow-sm"
                >
                  <Video class="w-3 h-3" /> AI
                </span>
              </div>
            </div>
            <div class="p-2.5 flex items-center gap-2">
              <span :class="`w-2 h-2 rounded-full shrink-0 shadow-sm ${cam.isLive ? 'bg-green-500' : 'bg-red-500'}`" />
              <div class="min-w-0">
                <h5 class="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                  {{ cam.name }}
                </h5>
                <p class="text-[9px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {{ cam.mqttId.replace('_', ' ') || 'Camera Node' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Add Camera Card -->
          <div class="rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-slate-300 dark:hover:border-white/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-800/50 transition-all h-full min-h-[96px] text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-300 group">
            <Plus class="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span class="text-[10px] font-bold">Add Camera</span>
          </div>
        </div>
      </div>

      <!-- Promo Card -->
      <div class="xl:col-span-3 bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] border border-blue-900/50 rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden shadow-lg">
        <div class="relative z-10">
          <h3 class="text-[14px] font-bold text-white mb-2">
            Need more features?
          </h3>
          <p class="text-[11px] font-medium text-blue-200/80 mb-4 leading-relaxed">
            Explore our advanced modules to extend the power of your platform.
          </p>
          <button class="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2 px-4 rounded-lg transition-colors shadow-md">
            Explore Modules
          </button>
        </div>
        <div class="absolute -right-6 -bottom-6 text-[90px] text-white/10 rotate-12 select-none pointer-events-none">
          🧩
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, shallowRef, ref } from 'vue';
import { useSOCState } from '@/composables/useSOCState';
import { useWorkforceMQTT } from '@/composables/workforce/useWorkforceMQTT';
import { 
  Video, Car, Bell, Scan, User,
  VideoOff, Calendar, Lock, Shield, 
  Clock, AlertCircle, ChevronRight, 
  Plus, EyeOff, Check
} from 'lucide-vue-next';

const {
  kpiData,
  liveActivityFeed,
  todayOverview,
  alertsFeed,
  analyticsData,
  loadSOCData,
  startPolling,
  stopPolling,
} = useSOCState();

const {
  mqttStatus,
  personEvents,
  lpEvents,
  personCounts,
  personSnapshots,
  lpSnapshots,
} = useWorkforceMQTT();

const kpiCardsFormatted = computed(() => [
  { 
    label: 'Cameras Online', 
    value: '18', 
    total: '20',
    progress: { label: '90% Online', value: 90 },
    icon: Video, 
    iconBg: 'bg-green-500 text-white' 
  },
  { 
    label: 'Faces Detected Today', 
    value: '152', 
    trend: '12%',
    trendIcon: '↑',
    trendColor: 'text-green-500',
    icon: Scan, 
    iconBg: 'bg-blue-600 text-white' 
  },
  { 
    label: 'Vehicles Detected Today', 
    value: '87', 
    trend: '8%',
    trendIcon: '↑',
    trendColor: 'text-green-500',
    icon: Car, 
    iconBg: 'bg-purple-600 text-white' 
  },
  { 
    label: 'People Detected Today', 
    value: '231', 
    trend: '15%',
    trendIcon: '↑',
    trendColor: 'text-green-500',
    icon: User, 
    iconBg: 'bg-orange-500 text-white' 
  },
  { 
    label: 'Active Alerts', 
    value: alertsFeed.value.length.toString(), 
    link: 'View all alerts',
    icon: Bell, 
    iconBg: 'bg-red-500 text-white' 
  },
]);

const processedActivityFeed = computed(() => [
  {
    id: 1,
    title: 'Employee Recognized',
    subtitle: 'John Doe',
    badge: 'ID: EMP1023',
    badgeClass: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20',
    time: '09:45 AM',
    location: 'Main Gate',
    camera: 'Camera 01',
    icon: Scan,
    iconBg: 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400 border border-green-100 dark:border-transparent',
    dotColor: 'bg-green-500',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=60',
    smallIcon: Scan,
    iconColor: 'bg-green-500 text-white'
  },
  {
    id: 2,
    title: 'Unknown Person Detected',
    subtitle: 'Confidence: 92%',
    time: '09:43 AM',
    location: 'Warehouse',
    camera: 'Camera 04',
    icon: Scan,
    iconBg: 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-100 dark:border-transparent',
    dotColor: 'bg-red-500',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=60',
    smallIcon: Scan,
    iconColor: 'bg-red-500 text-white'
  },
  {
    id: 3,
    title: 'Vehicle Detected',
    subtitle: 'TN09AB1234',
    badge: 'TN09AB1234',
    badgeClass: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20',
    time: '09:40 AM',
    location: 'Entry Gate',
    camera: 'Camera 02',
    icon: Car,
    iconBg: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-transparent',
    dotColor: 'bg-blue-500',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&q=60',
    smallIcon: Car,
    iconColor: 'bg-blue-500 text-white'
  },
  {
    id: 4,
    title: 'Person in Restricted Area',
    subtitle: 'Confidence: 88%',
    time: '09:36 AM',
    location: 'Production Area',
    camera: 'Camera 07',
    icon: User,
    iconBg: 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-transparent',
    dotColor: 'bg-orange-500',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=60',
    smallIcon: User,
    iconColor: 'bg-orange-500 text-white'
  },
  {
    id: 5,
    title: 'Camera Offline',
    subtitle: 'No Signal',
    time: '09:31 AM',
    location: 'Parking',
    camera: 'Camera 12',
    icon: VideoOff,
    iconBg: 'bg-slate-50 dark:bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-transparent',
    dotColor: 'bg-red-500',
    fallbackIcon: EyeOff
  }
]);

const activeSnapshotFilter = ref('All');

const ALL_SNAPSHOTS = [
  { id: 1, type: 'Scan', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=60', icon: Scan, iconBg: 'bg-green-500 text-white', time: '09:45 AM', title: 'Employee Recognized', location: 'Main Gate - Camera 01' },
  { id: 2, type: 'Scan', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=60', icon: Scan, iconBg: 'bg-red-500 text-white', time: '09:43 AM', title: 'Unknown Person', location: 'Warehouse - Camera 04' },
  { id: 3, type: 'Car', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&q=60', icon: Car, iconBg: 'bg-blue-500 text-white', time: '09:40 AM', title: 'Vehicle TN09AB1234', location: 'Entry Gate - Camera 02' },
  { id: 4, type: 'User', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=60', icon: User, iconBg: 'bg-orange-500 text-white', time: '09:36 AM', title: 'Person Detected', location: 'Production Area - Camera 07' },
];

const recentSnapshots = computed(() => {
  if (activeSnapshotFilter.value === 'All') return ALL_SNAPSHOTS;
  return ALL_SNAPSHOTS.filter(s => s.type === activeSnapshotFilter.value);
});

const availableModules = [
  { id: 1, title: 'Visitor Management', desc: 'Manage visitors & pre-registrations', icon: Calendar, color: 'bg-purple-600' },
  { id: 2, title: 'Access Control', desc: 'Doors, Controllers, RFID, NFC', icon: Lock, color: 'bg-blue-600' },
  { id: 3, title: 'Boom Barrier', desc: 'Vehicle entry & exit control', icon: Shield, color: 'bg-indigo-600' },
  { id: 4, title: 'Security Patrol', desc: 'Guard patrol & checkpoints', icon: Shield, color: 'bg-slate-600' },
  { id: 5, title: 'Attendance', desc: 'Employee attendance tracking', icon: Clock, color: 'bg-pink-600' },
  { id: 6, title: 'Incident Management', desc: 'Manage incidents & reports', icon: AlertCircle, color: 'bg-red-600' },
];

const CAMERA_CONFIG = [
  { id: 1, name: 'Camera 01', mqttId: 'main_gate', type: 'both', fallbackUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=60' },
  { id: 2, name: 'Camera 02', mqttId: 'entry_gate', type: 'both', fallbackUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&q=60' },
  { id: 3, name: 'Camera 03', mqttId: 'reception', type: 'people', fallbackUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=60' },
  { id: 4, name: 'Camera 04', mqttId: 'warehouse', type: 'people', fallbackUrl: null },
  { id: 5, name: 'Camera 05', mqttId: 'parking', type: 'vehicle', fallbackUrl: 'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?w=400&q=60' },
];

const cameraRegistry = computed(() =>
  CAMERA_CONFIG.map(cfg => {
    const liveSnap = personSnapshots.value[cfg.mqttId] ?? null;
    const count = personCounts.value[cfg.mqttId] ?? 0;
    const isLive = !!(liveSnap || count > 0) || cfg.id !== 4; // Mock logic
    return {
      ...cfg,
      liveSnapshot: liveSnap,
      isLive,
    };
  })
);

const filteredCameras = computed(() => cameraRegistry.value);

onMounted(() => {
  loadSOCData();
  startPolling(10000);
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 4px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>
