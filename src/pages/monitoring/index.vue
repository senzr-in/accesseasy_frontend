<template>
  <div class="space-y-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Visual Monitoring
            <Video class="w-6 h-6 text-slate-400" />
          </h1>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Real-time surveillance & node visuals.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
        <div class="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest flex items-center">
          <Shield class="w-3 h-3 mr-2" />
          SYSTEM SECURE
        </div>
        <button class="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 flex items-center text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm ml-auto">
          <RefreshCw class="w-3.5 h-3.5 mr-2" />
          RELAY FEEDS
        </button>
      </div>
    </div>

    <!-- Video Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="cam in cameras" 
        :key="cam.id" 
        class="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 shadow-sm group flex flex-col"
      >
        <!-- Card Header -->
        <div class="p-6 pb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div 
                class="w-2.5 h-2.5 rounded-full"
                :class="cam.status === 'Online' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-300 dark:bg-zinc-700'"
              />
              <h3 class="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                {{ cam.name }}
              </h3>
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-white/50 px-2 py-0.5 rounded">
              {{ cam.group }}
            </span>
          </div>
        </div>

        <!-- Card Content (Video Area) -->
        <div class="flex-1 flex flex-col">
          <div class="aspect-video bg-slate-100 dark:bg-zinc-900 relative flex items-center justify-center overflow-hidden border-y border-slate-100 dark:border-zinc-800/50">
            <template v-if="cam.status === 'Online'">
              <!-- Mock video static/feed UI -->
              <div class="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              <Video class="w-12 h-12 text-slate-300 dark:text-zinc-800" />
              <div class="absolute bottom-4 left-4 flex items-center gap-2 bg-white/80 dark:bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-slate-200 dark:border-white/10 shadow-sm">
                <div class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">LIVE</span>
              </div>
            </template>
            <template v-else>
              <div class="flex flex-col items-center gap-2 opacity-50 dark:opacity-40">
                <Camera class="w-10 h-10 text-slate-400 dark:text-zinc-500" />
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Signal Lost</span>
              </div>
            </template>

            <!-- Hover Overlay -->
            <div class="absolute inset-0 bg-white/80 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] h-10 px-6 uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
                <Maximize2 class="w-4 h-4" />
                EXPAND FEED
              </button>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="p-6 flex items-center justify-between bg-slate-50 dark:bg-transparent mt-auto">
            <span class="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">
              <MapPin class="w-3 h-3 inline-block mr-1 -mt-0.5" />
              {{ cam.location }}
            </span>
            <button class="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <RefreshCw class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { Camera, Maximize2, RefreshCw, Shield, Video, MapPin, Loader2 } from 'lucide-vue-next';
import { useCameraData } from '@/composables/useCameraData';

const { cameras, loading, fetchLocations } = useCameraData();

onMounted(() => {
  fetchLocations();
});
</script>
