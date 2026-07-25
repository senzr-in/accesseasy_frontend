<template>
  <div>
    <h3 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
      Quick Actions
    </h3>
    <div class="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
      <button
        class="soc-card p-4 min-w-[120px] flex flex-col items-center justify-center gap-3 group hover:bg-white dark:bg-slate-900/5 transition-all active:scale-95 cursor-pointer"
        @click="$emit('action', 'add-employee')"
      >
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
          <UserPlus class="w-5 h-5" />
        </div>
        <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center leading-tight group-hover:text-white">Add<br>Employee</span>
      </button>

      <button
        class="soc-card p-4 min-w-[120px] flex flex-col items-center justify-center gap-3 group hover:bg-white dark:bg-slate-900/5 transition-all active:scale-95 cursor-pointer"
        @click="$emit('action', 'add-vehicle')"
      >
        <div class="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors">
          <Car class="w-5 h-5" />
        </div>
        <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center leading-tight group-hover:text-white">Add<br>Vehicle</span>
      </button>

      <button
        class="soc-card p-4 min-w-[120px] flex flex-col items-center justify-center gap-3 group hover:bg-white dark:bg-slate-900/5 transition-all active:scale-95 cursor-pointer"
        @click="$emit('action', 'issue-pass')"
      >
        <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
          <QrCode class="w-5 h-5" />
        </div>
        <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center leading-tight group-hover:text-white">Issue<br>Pass</span>
      </button>

      <button
        class="soc-card p-4 min-w-[120px] flex flex-col items-center justify-center gap-3 group hover:bg-white dark:bg-slate-900/5 transition-all active:scale-95 cursor-pointer"
        @click="$emit('action', 'open-door')"
      >
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
          <DoorOpen class="w-5 h-5" />
        </div>
        <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center leading-tight group-hover:text-white">Open<br>Door</span>
      </button>

      <button
        class="soc-card p-4 min-w-[120px] flex flex-col items-center justify-center gap-3 group hover:bg-white dark:bg-slate-900/5 transition-all active:scale-95 cursor-pointer"
        @click="$emit('action', 'view-reports')"
      >
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
          <BarChart2 class="w-5 h-5" />
        </div>
        <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center leading-tight group-hover:text-white">View<br>Reports</span>
      </button>

      <button
        class="soc-card p-4 min-w-[120px] flex flex-col items-center justify-center gap-3 group hover:bg-white dark:bg-slate-900/5 transition-all active:scale-95 cursor-pointer"
        @click="$emit('action', 'device-status')"
      >
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
          <Cpu class="w-5 h-5" />
        </div>
        <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center leading-tight group-hover:text-white">Device<br>Status</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { UserPlus, Car, QrCode, DoorOpen, BarChart2, Cpu } from 'lucide-vue-next';

defineEmits(['action']);
</script>
