<template>
  <div class="space-y-4">
    <!-- Header Summary Strip -->
    <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
          <ShieldCheck class="w-4 h-4" />
        </div>
        <div>
          <h4 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Multi-Factor Evidence Trail</h4>
          <p class="text-[10px] text-slate-500">Tamper-evident verification across all scanned checkpoints</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-slate-600 dark:text-slate-300">Average Integrity:</span>
        <span class="text-xs font-black font-mono px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200">
          {{ averageScore }}% Verified
        </span>
      </div>
    </div>

    <!-- Timeline List -->
    <div class="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
      <div
        v-for="(item, index) in timeline"
        :key="item.id || index"
        class="relative bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm space-y-3"
      >
        <!-- Timeline Node Dot -->
        <div
          class="absolute -left-[1.85rem] top-4 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm"
          :class="item.verification_score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'"
        >
          <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
        </div>

        <!-- Checkpoint Top Info -->
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {{ item.checkpoint_id }}
              </span>
              <h4 class="text-xs font-black text-slate-900 dark:text-white">{{ item.checkpoint_name }}</h4>
            </div>
            <p class="text-[10px] text-slate-500 mt-0.5">
              Scanned by <strong>{{ item.guard_name }}</strong> at <span class="font-mono font-semibold text-slate-700 dark:text-slate-300">{{ formatTime(item.scanned_at) }}</span>
            </p>
          </div>

          <!-- Score Badge -->
          <div class="text-right">
            <span
              class="text-[10px] font-black px-2 py-0.5 rounded-full uppercase"
              :class="item.verification_score >= 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
            >
              {{ item.verification_score }}% Verified
            </span>
          </div>
        </div>

        <!-- 5-Factor Proof Chips -->
        <div class="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
          <!-- QR Code Chip -->
          <span class="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <QrCode class="w-3 h-3 text-indigo-600" /> QR Code Scanned
          </span>

          <!-- GPS Fix Chip -->
          <span
            class="px-2 py-1 rounded-md flex items-center gap-1"
            :class="item.geofence_status === 'VALID' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-700'"
          >
            <MapPin class="w-3 h-3" /> GPS {{ item.distance_m }}m (±{{ item.accuracy_m }}m)
          </span>

          <!-- Photo Chip -->
          <button
            v-if="item.photo_url"
            class="px-2 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
            @click="previewPhoto = item.photo_url"
          >
            <Camera class="w-3 h-3" /> View Photo
          </button>

          <!-- NFC Chip (Pro) -->
          <span
            v-if="item.nfc_verified"
            class="px-2 py-1 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 flex items-center gap-1"
          >
            <Radio class="w-3 h-3" /> NFC Tag Verified
          </span>

          <!-- Checklist Chip (Pro) -->
          <span
            v-if="item.checklist_items && item.checklist_items.length"
            class="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center gap-1"
          >
            <CheckSquare class="w-3 h-3" /> Checklist ({{ item.checklist_items.length }}/{{ item.checklist_items.length }})
          </span>
        </div>

        <!-- Checklist Questions Preview if available -->
        <div v-if="item.checklist_items && item.checklist_items.length" class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/30 text-[11px] space-y-1">
          <div v-for="(q, qi) in item.checklist_items" :key="qi" class="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span>{{ q.question }}</span>
            <span class="font-bold text-emerald-600">✓ {{ q.answer }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Lightbox Modal -->
    <Teleport to="body">
      <div
        v-if="previewPhoto"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
        @click.self="previewPhoto = null"
      >
        <div class="relative max-w-xl w-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl p-2 border border-white/10">
          <button
            class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80"
            @click="previewPhoto = null"
          >
            <X class="w-4 h-4" />
          </button>
          <img :src="previewPhoto" class="w-full h-auto max-h-[75vh] object-contain rounded-xl" alt="Checkpoint Evidence" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  ShieldCheck, QrCode, MapPin, Camera, Radio, CheckSquare, X 
} from 'lucide-vue-next';

const props = defineProps({
  timeline: {
    type: Array,
    default: () => []
  }
});

const previewPhoto = ref(null);

const averageScore = computed(() => {
  if (!props.timeline || props.timeline.length === 0) return 100;
  const total = props.timeline.reduce((acc, curr) => acc + (curr.verification_score || 80), 0);
  return Math.round(total / props.timeline.length);
});

const formatTime = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};
</script>
