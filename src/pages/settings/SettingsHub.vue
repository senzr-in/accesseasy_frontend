<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans p-6 lg:p-8 gap-6">
    
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-6 rounded-2xl shadow-sm">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 shrink-0">
          <Settings class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Settings
          </h1>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Configure system preferences, devices, and operational rules
          </p>
        </div>
      </div>
    </div>

    <!-- Settings Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      
      <div
        v-for="card in settingsCards"
        :key="card.title"
        class="bg-white dark:bg-[#151c2c] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-400/80 dark:hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between group"
        @click="router.push(card.route)"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center shadow-xs" :class="card.iconBg">
              <component :is="card.icon" class="w-5 h-5" :class="card.iconColor" />
            </div>
            <div class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:translate-x-0.5 transition-all">
              <ChevronRight class="w-4 h-4" />
            </div>
          </div>

          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {{ card.title }}
            </h3>
            <p class="text-xs text-slate-500 font-medium leading-relaxed mt-1">
              {{ card.description }}
            </p>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { 
  Settings, CreditCard, Volume2, Smartphone, Calendar, 
  MapPin, QrCode, ChevronRight 
} from 'lucide-vue-next';

const router = useRouter();

const settingsCards = [
  {
    title: 'Subscription & Billing',
    description: 'Plan details, usage limits, and renewal',
    route: '/dashboard/settings/subscription',
    icon: CreditCard,
    iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    title: 'Emergency Alert Rules',
    description: 'Automated alerts for SOS alarms and missed patrols',
    route: '/dashboard/settings/escalation',
    icon: Volume2,
    iconBg: 'bg-rose-50 dark:bg-rose-500/10',
    iconColor: 'text-rose-600 dark:text-rose-400'
  },
  {
    title: 'Guard Devices',
    description: 'Battery levels, app versions, and online status',
    route: '/dashboard/settings/devices',
    icon: Smartphone,
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    title: 'Shift Schedules',
    description: 'Duty shift timings, hours, and weekly rosters',
    route: '/dashboard/settings/patrol-shifts',
    icon: Calendar,
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    title: 'Sites & Zones',
    description: 'Client locations, boundary areas, and geofences',
    route: '/dashboard/sites',
    icon: MapPin,
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    title: 'Patrol Checkpoints',
    description: 'QR codes, NFC tags, and scan points',
    route: '/dashboard/settings/checkpoints',
    icon: QrCode,
    iconBg: 'bg-cyan-50 dark:bg-cyan-500/10',
    iconColor: 'text-cyan-600 dark:text-cyan-400'
  }
];
</script>
