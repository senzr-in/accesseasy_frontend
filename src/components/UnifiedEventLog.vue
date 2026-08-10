<template>
  <div class="unified-event-log p-4 h-full flex flex-col">
    <div class="flex items-center justify-between mb-4 shrink-0">
      <h3 class="text-[13px] font-black text-slate-800 dark:text-slate-100">
        Unified Access Events
      </h3>
    </div>
    
    <div v-if="events.length === 0" class="text-xs text-slate-500 dark:text-slate-400 italic py-4 text-center">
      No recent access events.
    </div>
    
    <div class="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
      <div 
        v-for="event in events" 
        :key="event.id"
        class="event-card relative flex items-start gap-3 p-3 rounded-xl border border-[#E5E1D8]/80 dark:border-white/10 bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-sm transition-all"
        :class="event.alertLevel === 'error' ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-emerald-500'"
      >
        <!-- Profile / Status Icon -->
        <div class="flex-shrink-0 mt-1">
          <div v-if="event.swipeDetails && event.swipeDetails.profilePic" class="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600">
            <img :src="event.swipeDetails.profilePic" alt="Profile" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
            <svg v-if="event.alertLevel === 'error'" class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <svg v-else class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </div>
        </div>

        <!-- Event Details -->
        <div class="flex-grow min-w-0">
          <div class="flex justify-between items-start">
            <div class="truncate">
              <h3 class="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">
                {{ event.swipeDetails ? event.swipeDetails.employeeName : 'Unknown Person' }}
              </h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                <span class="bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded font-medium">{{ event.doorId }}</span>
                <span>{{ new Date(event.timestamp).toLocaleTimeString() }}</span>
              </p>
            </div>
            
            <span 
              class="px-2 py-0.5 text-[10px] font-bold rounded-md shrink-0 ml-2"
              :class="event.alertLevel === 'error' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'"
            >
              {{ event.status }}
            </span>
          </div>
          
          <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 leading-snug">
            {{ event.summary }}
          </p>
        </div>

        <!-- Camera Snapshot Thumbnail -->
        <div class="flex-shrink-0 cursor-pointer ml-2" @click="expandImage(event.cameraDetails?.snapshotUrl)">
          <div v-if="event.cameraDetails && event.cameraDetails.snapshotUrl" class="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-[#E5E1D8]/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 transition-colors">
            <img :src="event.cameraDetails.snapshotUrl" alt="Camera Snapshot" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="expandedImage" class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" @click="expandedImage = null">
      <div class="relative max-w-4xl w-full">
        <img :src="expandedImage" class="w-full h-auto rounded-lg shadow-2xl border border-gray-700" @click.stop />
        <button @click="expandedImage = null" class="absolute top-4 right-4 bg-gray-900 bg-opacity-75 text-white rounded-full p-2 hover:bg-opacity-100">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { correlationEngine } from '../services/correlationEngine';

const events = ref([]);
const expandedImage = ref(null);

let unsubscribe = null;

onMounted(() => {
  // Load existing events
  events.value = [...correlationEngine.unifiedEvents].reverse();
  
  // Subscribe to new events
  unsubscribe = correlationEngine.subscribe((newEvent) => {
    events.value.unshift(newEvent);
    // Keep UI list manageable
    if (events.value.length > 50) {
      events.value.pop();
    }
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

const expandImage = (url) => {
  if (url) {
    expandedImage.value = url;
  }
};
</script>

<style scoped>
.event-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
}
</style>
