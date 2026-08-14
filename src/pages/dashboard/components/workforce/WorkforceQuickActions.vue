<template>
  <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm mb-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">
          Quick Actions
        </h3>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Shortcuts for daily workforce & access management tasks
        </p>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      <a 
        v-for="action in actions" 
        :key="action.name"
        :href="action.href"
        class="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-center group flex flex-col items-center justify-center gap-2"
      >
        <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <component
            :is="action.icon"
            class="w-4 h-4"
          />
        </div>
        <span class="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
          {{ action.name }}
        </span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { 
  UserPlus, HardDrive, CreditCard, FileText, 
  Users, Server, FileSpreadsheet 
} from 'lucide-vue-next';

const actions = [
  { name: 'Add Employee', href: '/dashboard/easy-access/employees', icon: UserPlus },
  { name: 'Add Device', href: '/dashboard/settings/devices', icon: HardDrive },
  { name: 'Issue Access Card', href: '/dashboard/easy-access/biometrics', icon: CreditCard },
  { name: 'View Access Logs', href: '/dashboard/settings/logs', icon: FileText },
  { name: 'Manage Employees', href: '/dashboard/easy-access/employees', icon: Users },
  { name: 'Manage Devices', href: '/dashboard/settings/devices', icon: Server },
  { name: 'Generate Report', href: '/dashboard/report-automation', icon: FileSpreadsheet }
];
</script>
