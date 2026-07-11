<template>
  <div class="flex flex-col h-full bg-white overflow-hidden">



    <!-- Guards on Duty -->
    <div class="px-4 py-3 border-b border-slate-100 shrink-0">
      <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2.5">Guards on Duty</h3>
      <div class="grid grid-cols-2 gap-2">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span class="text-[10px] text-slate-600"><strong class="text-slate-900">{{ guardStats.onPatrol }}</strong> On Patrol</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span class="text-[10px] text-slate-600"><strong class="text-slate-900">{{ guardStats.atCheckpoint }}</strong> At Checkpoint</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          <span class="text-[10px] text-slate-600"><strong class="text-slate-900">{{ guardStats.onBreak }}</strong> On Break</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-slate-300"></span>
          <span class="text-[10px] text-slate-600"><strong class="text-slate-900">{{ guardStats.offDuty }}</strong> Off Duty</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-auto px-4 py-4 border-t border-slate-100 bg-slate-50/50">
      <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2.5">Quick Actions</h3>
      <div class="space-y-1.5">
        <button @click="$emit('create-patrol')"
          class="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-indigo-50 transition-colors text-left group">
          <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 transition-colors">
            <PlusCircle class="w-4 h-4" />
          </div>
          <div>
            <p class="text-xs font-bold text-slate-900">Create Patrol</p>
            <p class="text-[10px] text-slate-400">Schedule new patrol</p>
          </div>
        </button>
        <button @click="$emit('view-reports')"
          class="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-emerald-50 transition-colors text-left group">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
            <BarChart3 class="w-4 h-4" />
          </div>
          <div>
            <p class="text-xs font-bold text-slate-900">View Reports</p>
            <p class="text-[10px] text-slate-400">Patrol analytics & reports</p>
          </div>
        </button>
        <button @click="$emit('manage-routes')"
          class="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-violet-50 transition-colors text-left group">
          <div class="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition-colors">
            <Route class="w-4 h-4" />
          </div>
          <div>
            <p class="text-xs font-bold text-slate-900">Manage Routes</p>
            <p class="text-[10px] text-slate-400">Routes & checkpoints</p>
          </div>
        </button>
        <button @click="$emit('open-map')"
          class="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-sky-50 transition-colors text-left group">
          <div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 group-hover:bg-sky-200 transition-colors">
            <MapPin class="w-4 h-4" />
          </div>
          <div>
            <p class="text-xs font-bold text-slate-900">Guard Tracking</p>
            <p class="text-[10px] text-slate-400">All guard locations</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { PlusCircle, BarChart3, Route, MapPin } from 'lucide-vue-next';

const props = defineProps({
  patrols: { type: Array, default: () => [] },
  guards: { type: Array, default: () => [] }
});

defineEmits(['open-map', 'create-patrol', 'view-reports', 'manage-routes']);

const guardStats = computed(() => {
  const activeGuardsList = props.patrols.filter(p => p.status === 'active');
  const uniqueGuardNames = new Set();
  activeGuardsList.forEach(p => {
    if (p.guardName) uniqueGuardNames.add(p.guardName);
  });
  
  const activeCount = uniqueGuardNames.size;
  
  return {
    onPatrol: activeCount,
    atCheckpoint: 0,
    onBreak: 0,
    offDuty: Math.max(0, props.guards.length - activeCount)
  };
});

</script>
