<template>
  <div class="soc-card h-full flex flex-col overflow-hidden bg-zinc-900/80">
    <div class="px-6 py-5 border-b border-white/5 flex justify-between items-center shrink-0">
      <div class="flex items-center gap-4">
        <h3 class="text-xs font-black uppercase tracking-widest text-white">
          Live Monitoring
        </h3>
        <div class="flex bg-white dark:bg-slate-900/5 rounded-lg p-1">
          <button class="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-slate-900/10 text-white">
            All
          </button>
          <button class="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
            People
          </button>
          <button class="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
            Vehicles
          </button>
        </div>
      </div>
      <button
        class="w-8 h-8 rounded-lg bg-white dark:bg-slate-900/5 hover:bg-white dark:bg-slate-900/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        @click="$router.push('/dashboard/monitoring')"
      >
        <Maximize class="w-4 h-4" />
      </button>
    </div>

    <div class="flex-1 p-4 bg-black/40">
      <div class="grid grid-cols-2 gap-4 h-full">
        <!-- Loop up to 4 cameras, or show placeholders -->
        <div 
          v-for="(cam, i) in displayCameras" 
          :key="cam.id || i"
          class="relative rounded-xl overflow-hidden bg-zinc-950 border border-white/10 flex items-center justify-center group"
        >
          <!-- Stream / Snapshot -->
          <img
            v-if="cam.snapshotUrl"
            :src="cam.snapshotUrl"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          >
          <div
            v-else
            class="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-300"
          >
            <Camera class="w-8 h-8 opacity-50" />
            <span class="text-[10px] font-bold uppercase tracking-widest">{{ cam.name || 'Camera Offline' }}</span>
          </div>

          <!-- Top Overlay -->
          <div class="absolute top-0 left-0 w-full p-3 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-start">
            <span class="text-xs font-bold text-white drop-shadow-md">{{ cam.name || `CAM ${i+1}` }}</span>
            <span
              v-if="cam.snapshotUrl"
              class="flex items-center gap-1 text-[10px] font-black text-white bg-green-500/20 border border-green-500/50 px-2 py-0.5 rounded backdrop-blur-sm"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> LIVE
            </span>
          </div>

          <!-- Bottom Overlay (AI Detections mockup) -->
          <div
            v-if="cam.detections?.length"
            class="absolute bottom-3 left-3 flex gap-2"
          >
            <span
              v-for="det in cam.detections"
              :key="det"
              class="px-2 py-1 rounded bg-black/60 backdrop-blur border border-white/20 text-[9px] font-bold text-white uppercase tracking-wider"
            >
              {{ det }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="px-6 py-4 border-t border-white/5 shrink-0 flex justify-center bg-black/20">
      <button 
        class="text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest group"
        @click="$router.push('/dashboard/monitoring')"
      >
        Go to Live Monitoring <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Camera, Maximize, ArrowRight } from 'lucide-vue-next';

const props = defineProps({
  cameras: {
    type: Array,
    required: false,
    default: () => []
  }
});

// Always display a 2x2 grid (4 slots)
const displayCameras = computed(() => {
  const result = [];
  for (let i = 0; i < 4; i++) {
    if (props.cameras[i]) {
      result.push(props.cameras[i]);
    } else {
      // Placeholder data
      result.push({
        id: `mock-${i}`,
        name: i === 0 ? 'Main Gate' : i === 1 ? 'Reception' : i === 2 ? 'Warehouse Entrance' : 'Parking Area',
        snapshotUrl: i === 0 || i === 2 ? 'https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' : null,
        detections: i === 0 ? ['Vehicle', 'Person'] : i === 2 ? ['Unknown Face'] : []
      });
    }
  }
  return result;
});
</script>
