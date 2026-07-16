<template>
  <div class="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar h-full p-2.5">
    <!-- "All Zones" option to deselect -->
    <div
      class="rounded-lg border p-2 cursor-pointer transition-all hover:shadow-sm text-center"
      :class="!selectedId ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200'"
      @click="$emit('select', { id: null })"
    >
      <p class="text-xs font-bold text-indigo-700 uppercase tracking-wider">
        All Zones
      </p>
    </div>

    <!-- Zone cards (compact for scalability) -->
    <div
      v-for="zone in zonesWithStatus"
      :key="zone.id"
      class="rounded-lg border p-2.5 cursor-pointer transition-all hover:shadow-sm"
      :class="[
        selectedId === zone.id ? 'border-indigo-300 bg-indigo-50/60 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200',
        zone.hasMissed ? 'border-l-[3px] border-l-rose-500' : zone.hasActive ? 'border-l-[3px] border-l-emerald-500' : 'border-l-[3px] border-l-slate-200'
      ]"
      @click="$emit('select', zone)"
    >
      <div class="flex items-center justify-between mb-1.5">
        <div class="flex items-center gap-1.5 min-w-0">
          <Building2
            class="w-3 h-3 shrink-0"
            :class="zone.hasMissed ? 'text-rose-600' : zone.hasActive ? 'text-emerald-600' : 'text-slate-400'"
          />
          <span class="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">{{ zone.name }}</span>
        </div>
        <ChevronRight class="w-3 h-3 text-slate-300 shrink-0" />
      </div>

      <!-- Compact stat row -->
      <div class="flex items-center gap-2 text-[10px] font-bold">
        <span class="text-indigo-600">{{ zone.running }} <span class="font-normal text-slate-400">run</span></span>
        <span class="text-slate-300">·</span>
        <span :class="zone.missed > 0 ? 'text-rose-600' : 'text-slate-400'">{{ zone.missed }} <span class="font-normal text-slate-400">miss</span></span>
        <span class="text-slate-300">·</span>
        <span class="text-emerald-600">{{ zone.completed }} <span class="font-normal text-slate-400">done</span></span>
      </div>
    </div>

    <div
      v-if="!zonesWithStatus.length"
      class="flex flex-col items-center justify-center h-full text-center py-6"
    >
      <Building2 class="w-7 h-7 text-slate-200 mx-auto mb-2" />
      <p class="text-xs text-slate-400 font-semibold">
        No zones configured
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Building2, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  zones: { type: Array, default: () => [] },
  patrols: { type: Array, default: () => [] },
  selectedId: { type: String, default: null }
});

defineEmits(['select']);

const zonesWithStatus = computed(() => {
  if (!props.zones.length) {
    // Fallback using patrol zone info
    const zoneMap = {};
    props.patrols.forEach(p => {
      const zid = p.zoneId || 'default';
      const zname = p.zoneName || 'Main Zone';
      if (!zoneMap[zid]) zoneMap[zid] = { id: zid, name: zname, patrols: [] };
      zoneMap[zid].patrols.push(p);
    });
    return Object.values(zoneMap).map(z => buildZoneStats(z.id, z.name, z.patrols));
  }
  return props.zones.map(z => {
    const zPatrols = props.patrols.filter(p => p.zoneId === z.id || p.zoneName === z.zoneName);
    return buildZoneStats(z.id, z.zoneName || z.name, zPatrols);
  });
});

function buildZoneStats(id, name, zPatrols) {
  const running = zPatrols.filter(p => p.status === 'active').length;
  const completed = zPatrols.filter(p => p.status === 'completed').length;
  const missed = zPatrols.reduce((s, p) => s + (p.missedCheckpoints || 0), 0);
  return {
    id, name,
    running, completed, missed,
    hasActive: running > 0,
    hasMissed: missed > 0,
    nextDue: zPatrols.find(p => p.nextDue)?.nextDue || null
  };
}
</script>
