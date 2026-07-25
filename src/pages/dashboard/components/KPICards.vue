<template>
  <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
    <!-- Employees Inside -->
    <div class="soc-card relative overflow-hidden p-5 flex flex-col justify-between group hover:border-white/20 transition-colors">
      <div class="absolute top-0 left-0 w-1 h-full bg-blue-500" />
      <div class="flex justify-between items-start">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
          <Users class="w-5 h-5" />
        </div>
        <button
          class="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
          @click="$emit('action', 'employees')"
        >
          View Directory <ChevronRight class="w-3 h-3" />
        </button>
      </div>
      <div class="mt-4">
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Employees Inside</span>
        <div class="flex items-end gap-3">
          <h3 class="text-3xl font-black text-white leading-none">
            {{ data.employeesInside }}
          </h3>
          <span
            class="text-xs font-bold mb-1"
            :class="data.employeesTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'"
          >
            {{ data.employeesTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(data.employeesTrend) }}% vs yesterday
          </span>
        </div>
      </div>
    </div>

    <!-- Vehicles Inside -->
    <div class="soc-card relative overflow-hidden p-5 flex flex-col justify-between group hover:border-white/20 transition-colors">
      <div class="absolute top-0 left-0 w-1 h-full bg-teal-500" />
      <div class="flex justify-between items-start">
        <div class="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
          <Car class="w-5 h-5" />
        </div>
        <button
          class="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
          @click="$emit('action', 'vehicles')"
        >
          View Parking <ChevronRight class="w-3 h-3" />
        </button>
      </div>
      <div class="mt-4">
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Vehicles Inside</span>
        <div class="flex items-end gap-3">
          <h3 class="text-3xl font-black text-white leading-none">
            {{ data.vehiclesInside }}
          </h3>
          <span
            class="text-xs font-bold mb-1"
            :class="data.vehiclesTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'"
          >
            {{ data.vehiclesTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(data.vehiclesTrend) }}% vs yesterday
          </span>
        </div>
      </div>
    </div>

    <!-- Unknown Persons -->
    <div class="soc-card relative overflow-hidden p-5 flex flex-col justify-between group hover:border-white/20 transition-colors">
      <div class="absolute top-0 left-0 w-1 h-full bg-orange-500" />
      <div class="flex justify-between items-start">
        <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
          <UserX class="w-5 h-5" />
        </div>
        <button
          class="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
          @click="$emit('action', 'unknown')"
        >
          Review Now <ChevronRight class="w-3 h-3" />
        </button>
      </div>
      <div class="mt-4">
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Unknown Persons</span>
        <div class="flex items-end gap-3">
          <h3 class="text-3xl font-black text-white leading-none">
            {{ data.unknownPersons }}
          </h3>
        </div>
      </div>
    </div>

    <!-- Offline Devices -->
    <div class="soc-card relative overflow-hidden p-5 flex flex-col justify-between group hover:border-white/20 transition-colors">
      <div class="absolute top-0 left-0 w-1 h-full bg-rose-500" />
      <div class="flex justify-between items-start">
        <div class="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
          <WifiOff class="w-5 h-5" />
        </div>
        <button
          class="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
          @click="$emit('action', 'offline-devices')"
        >
          View Devices <ChevronRight class="w-3 h-3" />
        </button>
      </div>
      <div class="mt-4">
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Offline Devices</span>
        <div class="flex items-end gap-3">
          <h3 class="text-3xl font-black text-white leading-none">
            {{ data.offlineDevices }}
          </h3>
        </div>
      </div>
    </div>

    <!-- Critical Alerts -->
    <div class="soc-card relative overflow-hidden p-5 flex flex-col justify-between group hover:border-white/20 transition-colors">
      <div class="absolute top-0 left-0 w-1 h-full bg-rose-600" />
      <div class="flex justify-between items-start">
        <div class="w-10 h-10 rounded-xl bg-rose-600/10 flex items-center justify-center text-rose-600 shrink-0">
          <ShieldAlert class="w-5 h-5 animate-pulse" />
        </div>
        <button
          class="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
          @click="$emit('action', 'alerts')"
        >
          View All <ChevronRight class="w-3 h-3" />
        </button>
      </div>
      <div class="mt-4">
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Critical Alerts</span>
        <div class="flex items-end gap-3">
          <h3 class="text-3xl font-black text-white leading-none">
            {{ data.criticalAlerts }}
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Users, Car, UserX, WifiOff, ShieldAlert, ChevronRight } from 'lucide-vue-next';

defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      employeesInside: 0,
      employeesTrend: 0,
      vehiclesInside: 0,
      vehiclesTrend: 0,
      unknownPersons: 0,
      offlineDevices: 0,
      criticalAlerts: 0
    })
  }
});

defineEmits(['action']);
</script>
