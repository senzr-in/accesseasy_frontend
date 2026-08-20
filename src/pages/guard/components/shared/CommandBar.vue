<template>
  <div class="flex items-center justify-between gap-4 mb-2 z-20">
    <!-- Linear-style Cmd+K Search Bar -->
    <div class="flex-1 max-w-xl relative group">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search class="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
      </div>
      <input 
        type="text" 
        placeholder="Search guards, visitors, locations, or incidents..." 
        class="block w-full pl-10 pr-16 py-2.5 bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-sm"
      >
      <div class="absolute inset-y-0 right-0 pr-2 flex items-center">
        <kbd class="inline-flex items-center px-2 py-1 border border-slate-200 dark:border-white/10 rounded-md text-[10px] font-sans font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50">
          Ctrl K
        </kbd>
      </div>
    </div>

    <!-- Quick Actions (Top Right) -->
    <div class="flex items-center gap-2">
      <button
        class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer"
        @click="showBroadcastModal = true"
      >
        <MessageSquare class="w-3.5 h-3.5" /> Broadcast
      </button>
      <button
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.4)] cursor-pointer"
        @click="openDispatchModal"
      >
        <Plus class="w-3.5 h-3.5" /> Dispatch Guard
      </button>
    </div>

    <!-- Broadcast Announcement Modal -->
    <Teleport to="body">
      <div
        v-if="showBroadcastModal"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        @click.self="showBroadcastModal = false"
      >
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150 text-xs">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare class="w-4 h-4 text-indigo-600" />
              <span>Broadcast Announcement</span>
            </h3>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showBroadcastModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="sendBroadcast" class="space-y-3.5">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Audience *</label>
              <select v-model="broadcastForm.target" class="ae-input w-full py-2">
                <option value="all">All Active Guards Across All Sites</option>
                <option value="site-01">Chennai Tech Park On-Duty Team</option>
                <option value="site-02">ABC Retail Mall On-Duty Team</option>
                <option value="supervisors">Shift Supervisors Only</option>
              </select>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Urgency Level</label>
              <select v-model="broadcastForm.priority" class="ae-input w-full py-2">
                <option value="normal">Normal Announcement</option>
                <option value="urgent">Urgent Operational Notice (Audio chime)</option>
                <option value="emergency">Emergency Alert (Full-screen siren override)</option>
              </select>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Broadcast Message *</label>
              <textarea
                v-model="broadcastForm.message"
                required
                rows="3"
                placeholder="e.g. VIP delegation arriving at Main Gate in 15 minutes. Increase perimeter vigilance."
                class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-none"
              ></textarea>
            </div>

            <div class="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs"
                @click="showBroadcastModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Send Broadcast
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Search, MessageSquare, Plus, X } from 'lucide-vue-next';

const showBroadcastModal = ref(false);
const broadcastForm = ref({
  target: 'all',
  priority: 'normal',
  message: ''
});

const sendBroadcast = () => {
  alert(`Broadcast successfully dispatched to ${broadcastForm.value.target}!`);
  broadcastForm.value.message = '';
  showBroadcastModal.value = false;
};

const openDispatchModal = () => {
  alert("Guard quick dispatch console ready.");
};
</script>
