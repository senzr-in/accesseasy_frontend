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
            Security & System Settings Hub
          </h1>
          <p class="text-xs text-slate-500 font-medium mt-1">
            Configure subscription tiers, escalation policies, device fleets, shift rosters, and audit trails
          </p>
        </div>
      </div>
    </div>

    <!-- Settings Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      
      <div
        v-for="card in settingsCards"
        :key="card.title"
        class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between group"
        @click="router.push(card.route)"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" :class="card.iconBg">
              <component :is="card.icon" class="w-5 h-5" :class="card.iconColor" />
            </div>
            <span v-if="card.tag" class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full" :class="card.tagClass">
              {{ card.tag }}
            </span>
          </div>

          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {{ card.title }}
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed mt-1">
              {{ card.description }}
            </p>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
          <span>Configure Settings</span>
          <ArrowRight class="w-4 h-4" />
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { 
  Settings, CreditCard, Volume2, Smartphone, Calendar, 
  MapPin, ScrollText, QrCode, ArrowRight 
} from 'lucide-vue-next';

const router = useRouter();

const settingsCards = [
  {
    title: 'Subscription & Billing',
    description: 'Manage tier capacity limits, view live resource usage meters, and upgrade between Normal, Pro & Custom.',
    route: '/dashboard/settings/subscription',
    icon: CreditCard,
    iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
    iconColor: 'text-indigo-600',
    tag: 'Tiers & Quota',
    tagClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
  },
  {
    title: 'Emergency Escalation Policies',
    description: 'Configure automated multi-tier alert fallback chains for SOS panic alerts, missed patrols, and geofence breaches.',
    route: '/dashboard/settings/escalation',
    icon: Volume2,
    iconBg: 'bg-rose-50 dark:bg-rose-500/10',
    iconColor: 'text-rose-600',
    tag: 'Pro Feature',
    tagClass: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
  },
  {
    title: 'Guard Handhelds & Device Fleet',
    description: 'Live battery %, charging state, OS/App versions, heartbeat freshness, registration, and remote device wiping.',
    route: '/dashboard/settings/devices',
    icon: Smartphone,
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    iconColor: 'text-blue-600',
    tag: 'Fleet Ops',
    tagClass: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
  },
  {
    title: 'Shift Scheduler & Rotation Matrix',
    description: 'Plan weekly 24/7 rotations, assign guard shift slots, detect turnaround fatigue conflicts, and export rosters.',
    route: '/dashboard/settings/patrol-shifts',
    icon: Calendar,
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    tag: 'Pro Feature',
    tagClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
  },
  {
    title: 'Sites & Geofence Calibration',
    description: 'Property boundaries, zone perimeters, 4-tier GPS accuracy calibration, and live violation logs.',
    route: '/dashboard/sites',
    icon: MapPin,
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-600',
    tag: 'Perimeter Engine',
    tagClass: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
  },
  {
    title: 'Security Operations Audit Trail',
    description: 'Immutable historical logs of all supervisor actions, incident transitions, geofence edits, and IP tracking.',
    route: '/dashboard/settings/audit-log',
    icon: ScrollText,
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-700 dark:text-slate-300',
    tag: 'Audit & Compliance',
    tagClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  },
  {
    title: 'Checkpoints Configuration',
    description: 'Manage QR code tokens, NFC tags, scanning radius margins, and checkpoint library.',
    route: '/dashboard/settings/checkpoints',
    icon: QrCode,
    iconBg: 'bg-cyan-50 dark:bg-cyan-500/10',
    iconColor: 'text-cyan-600',
    tag: 'Core Patrol',
    tagClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300'
  }
];
</script>
