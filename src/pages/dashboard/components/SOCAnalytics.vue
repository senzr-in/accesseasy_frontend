<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Entries vs Exits -->
    <div class="soc-card p-5 bg-zinc-900/80">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xs font-black uppercase tracking-widest text-white">
          Entries vs Exits
        </h3>
        <select class="bg-white dark:bg-slate-900/5 border border-white/10 rounded-md text-[10px] text-slate-300 px-2 py-1 outline-none font-bold uppercase">
          <option>Today</option>
        </select>
      </div>
      <div class="h-48 flex items-end justify-center relative">
        <!-- Minimal Mock Chart (Since Chart.js dependency is unknown, rendering a visual CSS mock for now) -->
        <div class="absolute inset-0 flex items-end justify-between px-2">
          <!-- Grid lines -->
          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div class="border-b border-white/5 w-full h-0" />
            <div class="border-b border-white/5 w-full h-0" />
            <div class="border-b border-white/5 w-full h-0" />
            <div class="border-b border-white/5 w-full h-0" />
            <div class="border-b border-white/5 w-full h-0" />
          </div>
          <!-- Data points mock (Entries - Blue) -->
          <svg
            class="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <polyline
              points="0,80 20,60 40,30 60,10 80,40 100,50"
              fill="none"
              stroke="#3b82f6"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <polyline
              points="0,90 20,70 40,40 60,30 80,50 100,60"
              fill="none"
              stroke="#a855f7"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <!-- Legend -->
        <div class="absolute -bottom-6 left-0 right-0 flex justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-blue-500" /> Entries</span>
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-purple-500" /> Exits</span>
        </div>
      </div>
    </div>

    <!-- Peak Entry Hours -->
    <div class="soc-card p-5 bg-zinc-900/80">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xs font-black uppercase tracking-widest text-white">
          Peak Entry Hours
        </h3>
        <select class="bg-white dark:bg-slate-900/5 border border-white/10 rounded-md text-[10px] text-slate-300 px-2 py-1 outline-none font-bold uppercase">
          <option>Today</option>
        </select>
      </div>
      <div class="h-48 flex items-end justify-between px-2 gap-2 relative">
        <div class="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
          <div class="border-b border-white/5 w-full h-0" />
          <div class="border-b border-white/5 w-full h-0" />
          <div class="border-b border-white/5 w-full h-0" />
          <div class="border-b border-white/5 w-full h-0" />
          <div class="border-b border-white/5 w-full h-0" />
        </div>
        
        <div
          class="w-full bg-blue-500/20 hover:bg-blue-500/40 transition-colors rounded-t-sm z-10 relative group"
          style="height: 10%"
        />
        <div
          class="w-full bg-blue-500/40 hover:bg-blue-500/60 transition-colors rounded-t-sm z-10 relative group"
          style="height: 30%"
        />
        <div
          class="w-full bg-blue-500 hover:bg-blue-400 transition-colors rounded-t-sm z-10 relative group"
          style="height: 80%"
        />
        <div
          class="w-full bg-blue-500/60 hover:bg-blue-500/80 transition-colors rounded-t-sm z-10 relative group"
          style="height: 50%"
        />
        <div
          class="w-full bg-blue-500/30 hover:bg-blue-500/50 transition-colors rounded-t-sm z-10 relative group"
          style="height: 20%"
        />
        <div
          class="w-full bg-blue-500/10 hover:bg-blue-500/30 transition-colors rounded-t-sm z-10 relative group"
          style="height: 15%"
        />
        
        <!-- X Axis labels mock -->
        <div class="absolute -bottom-6 left-0 right-0 flex justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400">
          <span>6A</span>
          <span>9A</span>
          <span>12P</span>
          <span>3P</span>
          <span>6P</span>
          <span>9P</span>
        </div>
      </div>
    </div>

    <!-- Unknown Faces Trend -->
    <div class="soc-card p-5 bg-zinc-900/80">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xs font-black uppercase tracking-widest text-white">
          Security Events
        </h3>
        <select class="bg-white dark:bg-slate-900/5 border border-white/10 rounded-md text-[10px] text-slate-300 px-2 py-1 outline-none font-bold uppercase">
          <option>This Week</option>
        </select>
      </div>
      <div class="h-48 flex items-end justify-center relative">
        <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div class="border-b border-white/5 w-full h-0" />
          <div class="border-b border-white/5 w-full h-0" />
          <div class="border-b border-white/5 w-full h-0" />
          <div class="border-b border-white/5 w-full h-0" />
          <div class="border-b border-white/5 w-full h-0" />
        </div>
        <svg
          class="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <polyline
            points="0,95 16,80 33,90 50,70 66,50 83,85 100,75"
            fill="none"
            stroke="#f97316"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Dots -->
          <circle
            cx="0"
            cy="95"
            r="3"
            fill="#f97316"
          />
          <circle
            cx="16"
            cy="80"
            r="3"
            fill="#f97316"
          />
          <circle
            cx="33"
            cy="90"
            r="3"
            fill="#f97316"
          />
          <circle
            cx="50"
            cy="70"
            r="3"
            fill="#f97316"
          />
          <circle
            cx="66"
            cy="50"
            r="3"
            fill="#f97316"
          />
          <circle
            cx="83"
            cy="85"
            r="3"
            fill="#f97316"
          />
          <circle
            cx="100"
            cy="75"
            r="3"
            fill="#f97316"
          />
        </svg>
        
        <div class="absolute -bottom-6 left-0 right-0 flex justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({})
  }
});
</script>
