<template>
  <div class="h-full bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-50 p-6 pb-8 font-sans overflow-y-auto custom-scrollbar">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>👥</span> Face Recognition Library
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Manage enrolled AI identity profiles, VIP watchlists, and guided 5-pose biometrics
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
          @click="openEnrollWizard"
        >
          <span>✨</span> Enroll 5-Pose AI Profile
        </button>
      </div>
    </div>

    <!-- Navigation Tabs & Search Bar -->
    <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-1 bg-white dark:bg-[#151c2c] p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition',
            activeTab === tab.id
              ? `${tab.bg} text-white shadow-sm`
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
          @click="activeTab = tab.id"
        >
          <span>{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <div class="relative min-w-[280px]">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, ID, department..."
          class="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-medium shadow-sm"
        >
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
      </div>
    </div>

    <!-- Tab 1: Unknown Subject Audits -->
    <div
      v-if="activeTab === 'unknown'"
      class="space-y-4"
    >
      <div class="bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-2xl p-4 flex items-center gap-3">
        <div class="p-2.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 rounded-xl text-xl">
          🛡️
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">
            Unrecognized Subject Audits
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Captured face crops from CCTV streams requiring profile enrollment.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="unk in unknownFaces"
          :key="unk.id"
          class="bg-white dark:bg-[#151c2c] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition space-y-3"
        >
          <div class="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
            <img
              :src="unk.snapshot"
              alt="Unknown"
              class="w-full h-full object-cover"
            >
            <div class="absolute top-2 left-2 px-2 py-0.5 bg-rose-500 text-white font-mono text-[10px] font-bold rounded">
              UNKNOWN {{ unk.confidence }}
            </div>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-500">
            <span class="font-bold text-slate-800 dark:text-slate-200">{{ unk.camera }}</span>
            <span>{{ unk.time }}</span>
          </div>
          <button
            class="w-full py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-400 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-500/20 transition flex items-center justify-center gap-1.5"
            @click="promoteUnknown(unk)"
          >
            <span>➕</span> Promote to Profile
          </button>
        </div>
      </div>
    </div>

    <!-- Tab 2: Enrolled Profiles Grid (Employees, VIP, Blacklist) -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <div
        v-for="person in filteredPeople"
        :key="person.id"
        class="bg-white dark:bg-[#151c2c] border border-slate-200/80 dark:border-white/10 hover:border-indigo-300 rounded-2xl p-5 flex flex-col justify-between transition shadow-sm hover:shadow-md group relative overflow-hidden"
      >
        <div class="space-y-4">
          <div class="flex items-start justify-between">
            <div class="relative">
              <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-white/10 overflow-hidden flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xl">
                <img
                  v-if="person.avatar"
                  :src="person.avatar"
                  :alt="person.name"
                  class="w-full h-full object-cover"
                >
                <span v-else>{{ person.name.slice(0, 2).toUpperCase() }}</span>
              </div>
              <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>

            <div class="flex flex-col items-end gap-1">
              <span
                :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide',
                  person.type === 'vip' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' :
                  person.type === 'blacklist' ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300' :
                  'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                ]"
              >
                {{ person.type }}
              </span>
              <span class="text-[10px] text-slate-400 font-mono font-semibold">{{ person.employeeId }}</span>
            </div>
          </div>

          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              {{ person.name }}
            </h3>
            <p class="text-xs text-slate-500 font-medium">
              {{ person.department }}
            </p>
          </div>

          <div class="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10 text-xs text-slate-500">
            <div class="flex justify-between items-center">
              <span>Pose Vectors:</span>
              <span
                v-if="person.multiPoseEnrolled"
                class="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded font-mono font-bold text-[10px]"
              >
                5 Poses (Multi-Vector)
              </span>
              <span
                v-else
                class="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded font-mono font-bold text-[10px]"
              >
                1 Pose
              </span>
            </div>
            <div class="flex justify-between">
              <span>Last Recognition:</span>
              <span class="text-slate-700 dark:text-slate-300 font-medium">{{ person.lastSeen }}</span>
            </div>
          </div>
        </div>

        <div class="pt-4 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
          <span class="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
            <span>✓</span> AI Active Model
          </span>
          <button
            class="text-slate-400 hover:text-rose-600 text-xs font-bold"
            @click="deletePerson(person.id)"
          >
            Remove
          </button>
        </div>
      </div>
    </div>

    <!-- ── GUIDED 5-POSE ENROLLMENT WIZARD MODAL ── -->
    <v-dialog
      v-model="showWizard"
      max-width="720px"
      persistent
    >
      <div class="bg-white dark:bg-[#151c2c] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-sans">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <div>
              <h3 class="text-base font-bold">
                {{ wizardStage === 'details' ? 'Step 1: Profile Details' : wizardStage === 'capture' ? `Step 2: Pose ${currentPoseIndex + 1}/5` : 'Step 3: Review & Commit' }}
              </h3>
              <p class="text-xs text-slate-500">
                {{ wizardStage === 'details' ? 'Fill subject details, then capture 5 guided poses' : POSES[currentPoseIndex]?.instruction }}
              </p>
            </div>
          </div>
          <button
            class="text-slate-400 hover:text-slate-600"
            @click="closeWizard"
          >
            ✕
          </button>
        </div>

        <!-- Stage 1: Profile Form -->
        <div
          v-if="wizardStage === 'details'"
          class="p-6 space-y-4"
        >
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. Kavin Kumar"
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium"
              >
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <input
                v-model="form.department"
                type="text"
                placeholder="e.g. Engineering"
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium"
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Watchlist Category</label>
              <select
                v-model="form.type"
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold"
              >
                <option value="employee">
                  Employee
                </option>
                <option value="vip">
                  VIP Guest
                </option>
                <option value="blacklist">
                  Blacklist Watch
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Employee / Subject ID</label>
              <input
                v-model="form.employeeId"
                type="text"
                placeholder="EMP-1042"
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium"
              >
            </div>
          </div>

          <!-- Guided Pose Plan Box -->
          <div class="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
            <p class="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-2">
              📸 Guided 5-Pose AI Vector Capture:
            </p>
            <div class="grid grid-cols-5 gap-2 text-center text-[10px]">
              <div
                v-for="(p, i) in POSES"
                :key="i"
                class="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-white/10"
              >
                <div class="w-6 h-6 mx-auto rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] mb-1">
                  {{ i + 1 }}
                </div>
                <span class="font-semibold text-slate-700 dark:text-slate-300 block leading-tight">{{ p.short }}</span>
              </div>
            </div>
          </div>

          <div class="pt-2 flex justify-end">
            <button
              class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              @click="startCaptureStage"
            >
              Next: Start Pose Capture &rarr;
            </button>
          </div>
        </div>

        <!-- Stage 2: Interactive Camera Pose Capture -->
        <div
          v-else-if="wizardStage === 'capture'"
          class="p-6 space-y-4"
        >
          <!-- Progress bar -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs text-slate-500 font-semibold">
              <span>Pose {{ currentPoseIndex + 1 }} of 5: {{ POSES[currentPoseIndex]?.instruction }}</span>
              <span>{{ capturedCount * 20 }}%</span>
            </div>
            <div class="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                :style="{ width: `${capturedCount * 20}%` }"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <!-- Left: Animated Silhouette Guide -->
            <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10 flex flex-col items-center justify-center text-center space-y-2">
              <div class="w-24 h-28 border-2 border-indigo-500 rounded-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10">
                <span class="text-3xl">👤</span>
              </div>
              <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">{{ POSES[currentPoseIndex]?.label }}</span>
              <p class="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {{ POSES[currentPoseIndex]?.tip }}
              </p>
            </div>

            <!-- Center: Live WebRTC Camera Stream Frame -->
            <div class="col-span-2 relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                alt="Live Camera"
                class="w-full h-full object-cover"
              >
              
              <!-- Face Oval Guide Overlay -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="w-32 h-40 border-2 border-dashed border-indigo-400 rounded-full animate-pulse" />
              </div>

              <!-- Quality Score Badge -->
              <div
                v-if="qualityScore"
                class="absolute top-3 left-3 px-3 py-1 bg-emerald-500 text-white rounded text-xs font-bold font-mono"
              >
                Quality Score: {{ qualityScore }} (Pass)
              </div>
            </div>
          </div>

          <!-- Pose Action Strip & Capture Button -->
          <div class="flex items-center justify-between pt-2">
            <div class="flex gap-2">
              <div
                v-for="(img, idx) in capturedPoses"
                :key="idx"
                class="w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-bold overflow-hidden"
                :class="img ? 'border-emerald-500 bg-emerald-50' : 'border-dashed border-slate-300 text-slate-400'"
              >
                <img
                  v-if="img"
                  :src="img"
                  class="w-full h-full object-cover"
                >
                <span v-else>{{ idx + 1 }}</span>
              </div>
            </div>

            <button
              class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
              @click="capturePose"
            >
              <span>📸</span> Capture Pose {{ currentPoseIndex + 1 }}
            </button>
          </div>
        </div>

        <!-- Stage 3: Review & Commit -->
        <div
          v-else
          class="p-6 space-y-4 text-center"
        >
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-2xl">
            ✓
          </div>
          <h3 class="text-base font-bold">
            5 Pose Vectors Captured Successfully!
          </h3>
          <p class="text-xs text-slate-500">
            Ready to commit '{{ form.name }}' into the AI Vision facial model database.
          </p>

          <div class="flex justify-center gap-2 py-2">
            <img
              v-for="(img, i) in capturedPoses"
              :key="i"
              :src="img"
              class="w-14 h-14 rounded-xl border border-emerald-500 object-cover"
            >
          </div>

          <div class="pt-2 flex justify-center gap-3">
            <button
              class="px-4 py-2 text-slate-600 text-xs font-bold"
              @click="wizardStage = 'capture'"
            >
              Back
            </button>
            <button
              class="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md"
              @click="commitEnrollment"
            >
              Commit Profile to AI Model
            </button>
          </div>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';

const activeTab = ref('all');
const searchQuery = ref('');
const showWizard = ref(false);
const wizardStage = ref('details');
const currentPoseIndex = ref(0);
const qualityScore = ref(null);

const capturedPoses = ref([null, null, null, null, null]);

const POSES = [
  { label: 'Pose 1 of 5', short: 'Front', instruction: 'Look straight ahead', tip: 'Face camera directly with a relaxed expression.' },
  { label: 'Pose 2 of 5', short: 'Left 15°', instruction: 'Turn head slightly left (~15°)', tip: 'Slowly rotate head to your LEFT.' },
  { label: 'Pose 3 of 5', short: 'Right 15°', instruction: 'Turn head slightly right (~15°)', tip: 'Slowly rotate head to your RIGHT.' },
  { label: 'Pose 4 of 5', short: 'Chin Down', instruction: 'Tilt chin down slightly', tip: 'Lower chin slightly toward chest.' },
  { label: 'Pose 5 of 5', short: 'Chin Up', instruction: 'Tilt chin up slightly', tip: 'Raise chin slightly upward.' }
];

const tabs = [
  { id: 'all', label: 'All Profiles', icon: '👥', bg: 'bg-indigo-600' },
  { id: 'employees', label: 'Employees', icon: '👤', bg: 'bg-emerald-600' },
  { id: 'vips', label: 'VIP Guests', icon: '⭐', bg: 'bg-amber-600' },
  { id: 'blacklist', label: 'Blacklist', icon: '🚨', bg: 'bg-rose-600' },
  { id: 'unknown', label: 'Unknown Audits', icon: '🛡️', bg: 'bg-purple-600' }
];

const form = reactive({
  name: '',
  department: 'Engineering',
  type: 'employee',
  employeeId: ''
});

const people = ref([
  { id: '1', name: 'Kavin Kumar', department: 'Engineering', employeeId: 'EMP-1042', type: 'employee', multiPoseEnrolled: true, lastSeen: '10 mins ago', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
  { id: '2', name: 'Dr. Aris Thorne', department: 'Executive Board', employeeId: 'VIP-001', type: 'vip', multiPoseEnrolled: true, lastSeen: '1 hour ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { id: '3', name: 'Restricted Subject #4', department: 'Security Alert', employeeId: 'BLK-99', type: 'blacklist', multiPoseEnrolled: false, lastSeen: 'Yesterday', avatar: null }
]);

const unknownFaces = ref([
  { id: 'unk_1', camera: 'Lobby West Cam', time: '10:11 AM', confidence: '84%', snapshot: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' }
]);

const capturedCount = computed(() => capturedPoses.value.filter(Boolean).length);

const filteredPeople = computed(() => {
  return people.value.filter(p => {
    const q = searchQuery.value.toLowerCase();
    const match = p.name.toLowerCase().includes(q) || p.employeeId.toLowerCase().includes(q);
    if (!match) return false;
    if (activeTab.value === 'all') return true;
    return p.type === activeTab.value;
  });
});

const openEnrollWizard = () => {
  showWizard.value = true;
  wizardStage.value = 'details';
  currentPoseIndex.value = 0;
  capturedPoses.value = [null, null, null, null, null];
};

const closeWizard = () => {
  showWizard.value = false;
};

const startCaptureStage = () => {
  if (!form.name.trim()) return;
  wizardStage.value = 'capture';
};

const capturePose = () => {
  qualityScore.value = (35 + Math.random() * 45).toFixed(1);
  capturedPoses.value[currentPoseIndex.value] = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
  if (currentPoseIndex.value < 4) {
    currentPoseIndex.value++;
  } else {
    wizardStage.value = 'review';
  }
};

const commitEnrollment = () => {
  people.value.unshift({
    id: String(Date.now()),
    name: form.name,
    department: form.department || 'Operations',
    employeeId: form.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    type: form.type,
    multiPoseEnrolled: true,
    lastSeen: 'Just now',
    avatar: capturedPoses.value[0]
  });
  closeWizard();
};

const promoteUnknown = (unk) => {
  form.name = 'Promoted Visitor';
  form.type = 'employee';
  openEnrollWizard();
};

const deletePerson = (id) => {
  people.value = people.value.filter(p => p.id !== id);
};
</script>
