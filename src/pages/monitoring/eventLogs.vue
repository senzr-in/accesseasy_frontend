<template>
  <div class="event-logs-container">
    <!-- ── Tab Bar ─────────────────────────────────────────────────────────── -->
    <div class="tab-bar mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span
          v-if="tab.key === 'face' && faceEvents.length"
          class="tab-badge"
        >
          {{ faceEvents.length }}
        </span>
      </button>
    </div>

    <!-- ── Header / Filter Row ───────────────────────────────────────────── -->
    <div class="header-actions mb-4">
      <h2>{{ activeTab === 'face' ? 'Face Recognition Events' : 'AI Event Logs' }}</h2>
      <div class="d-flex align-center gap-4">
        <!-- Face Events filters -->
        <template v-if="activeTab === 'face'">
          <v-select
            v-model="faceRegisteredFilter"
            :items="[{ title: 'All', value: null }, { title: 'Registered', value: true }, { title: 'Visitors', value: false }]"
            item-title="title"
            item-value="value"
            label="Identity"
            density="compact"
            variant="outlined"
            hide-details
            style="width: 160px; margin-right: 16px;"
          />
          <v-select
            v-model="faceCameraFilter"
            :items="faceEventCameras"
            label="Camera"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            style="width: 200px; margin-right: 16px;"
          />
        </template>

        <!-- AI Logs location filter -->
        <v-select
          v-if="activeTab !== 'face'"
          v-model="selectedLocationFilter"
          :items="locations"
          item-title="locationName"
          item-value="id"
          label="Filter by Location"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          style="width: 200px; margin-right: 16px;"
        />

        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          @click="refreshLogs"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <!-- ── Tab: Face Recognition Events ─────────────────────────────────── -->
    <div v-if="activeTab === 'face'">
      <div
        v-if="faceLoading"
        class="face-loading"
      >
        <v-progress-circular
          indeterminate
          color="amber"
        />
        <p class="mt-3 text-sm text-zinc-500">
          Loading face recognition events…
        </p>
      </div>

      <div
        v-else-if="filteredFaceEvents.length === 0"
        class="face-empty"
      >
        <span class="text-4xl">🤖</span>
        <p class="mt-2 text-zinc-500">
          No face recognition events found.
        </p>
        <button
          class="mt-3 text-amber-500 text-sm font-bold hover:underline"
          @click="fetchFaceEvents"
        >
          Reload
        </button>
      </div>

      <div
        v-else
        class="face-grid"
      >
        <div
          v-for="ev in filteredFaceEvents"
          :key="ev.event_id"
          class="face-card"
          :class="ev.is_registered ? 'registered' : 'visitor'"
        >
          <!-- Image Preview -->
          <div class="face-img-wrap">
            <img
              v-if="ev.full_image_base64"
              :src="ev.full_image_base64"
              alt="Face capture"
              class="face-img"
            >
            <div
              v-else
              class="face-img-placeholder"
            >
              <span class="text-3xl">👤</span>
            </div>
            <!-- Identity badge -->
            <span
              class="identity-badge"
              :class="ev.is_registered ? 'badge-registered' : 'badge-visitor'"
            >
              {{ ev.is_registered ? '✅ Registered' : '🔶 Visitor' }}
            </span>
          </div>

          <!-- Card Body -->
          <div class="face-card-body">
            <div class="face-name">
              {{ ev.person_name }}
            </div>

            <div class="face-meta">
              <span class="meta-item">
                📷 <strong>{{ ev.camera }}</strong>
              </span>
              <span class="meta-item">
                🕒 {{ ev.timestamp_ist || ev.time }}
              </span>
            </div>

            <!-- Score bar -->
            <div class="score-row">
              <span class="score-label">Match Score</span>
              <div class="score-bar-bg">
                <div
                  class="score-bar-fill"
                  :style="{ width: `${Math.round(ev.similarity_score * 100)}%`, background: scoreColor(ev.similarity_score) }"
                />
              </div>
              <span
                class="score-pct"
                :style="{ color: scoreColor(ev.similarity_score) }"
              >
                {{ Math.round(ev.similarity_score * 100) }}%
              </span>
            </div>

            <!-- Stats row -->
            <div class="face-stats">
              <div class="stat-item">
                <span class="stat-val">{{ ev.total_visits }}</span>
                <span class="stat-lbl">Total Visits</span>
              </div>
              <div class="stat-item">
                <span class="stat-val">{{ ev.duration_seconds }}s</span>
                <span class="stat-lbl">Duration</span>
              </div>
              <div
                v-if="ev.person_id"
                class="stat-item"
              >
                <span class="stat-val">#{{ ev.person_id }}</span>
                <span class="stat-lbl">Person ID</span>
              </div>
              <div
                v-if="ev.cluster_id"
                class="stat-item"
              >
                <span
                  class="stat-val"
                  :title="ev.cluster_id"
                >#{{ ev.cluster_id.slice(0, 6) }}</span>
                <span class="stat-lbl">Cluster ID</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Tab: AI / Camera Event Logs ──────────────────────────────────── -->
    <v-card v-else>
      <v-data-table
        :headers="headers"
        :items="filteredEvents"
        :loading="loading"
        class="elevation-1"
      >
        <template #item.timestamp="{ item }">
          {{ formatTimestamp(item.timestamp) }}
        </template>
        
        <template #item.severity="{ item }">
          <v-chip
            :color="getSeverityColor(item.severity)"
            size="small"
          >
            {{ item.severity }}
          </v-chip>
        </template>

        <template #item.snapshot="{ item }">
          <v-img
            :src="item.snapshotUrl"
            width="80"
            height="45"
            cover
            class="rounded bg-grey-lighten-2"
          />
        </template>
        
        <template #item.actions="{ item }">
          <v-btn
            size="small"
            color="primary"
            variant="text"
            prepend-icon="mdi-play-circle"
            @click="playVideo(item)"
          >
            Play
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Video Player Dialog -->
    <v-dialog
      v-model="videoDialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Event Playback</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="videoDialog = false"
          />
        </v-card-title>
        <v-card-text class="pa-0">
          <div style="height: 450px;">
            <VideoPlayer
              v-if="selectedEvent"
              :video-url="selectedEvent.videoUrl"
              :poster-url="selectedEvent.snapshotUrl"
              autoplay
            />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import VideoPlayer from '@/components/VideoPlayer.vue';
import { useCameraData } from '@/composables/useCameraData.js';
import { useMQTT } from '@/composables/useMQTT.js';
import { deviceRegistry } from '@/services/deviceRegistry';

// ─── Tab State ────────────────────────────────────────────────────────────────
const activeTab = ref('face');
const tabs = [
  { key: 'face', label: '🤖 Face Recognition' },
  { key: 'ai',   label: '📹 AI Camera Events' },
];

// ─── AI / Camera Event Logs ───────────────────────────────────────────────────
const videoDialog = ref(false);
const selectedEvent = ref(null);
const selectedLocationFilter = ref(null);
const { locations, cameras, loading, fetchLocations } = useCameraData();
const { swipeEvents } = useMQTT();

const headers = [
  { title: 'Snapshot', key: 'snapshot', sortable: false },
  { title: 'Timestamp', key: 'timestamp' },
  { title: 'Event Type', key: 'type' },
  { title: 'Camera / Door', key: 'cameraName' },
  { title: 'Location', key: 'locationName' },
  { title: 'Severity', key: 'severity' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const liveSwipeList = computed(() =>
  swipeEvents.value.map(s => ({
    id: s.id,
    timestamp: new Date(s.timestamp).toISOString(),
    type: `Card Swipe: ${s.action} (Card: ${s.cardNo})`,
    cameraName: `Door ${s.doorIndex}`,
    locationId: null,
    locationName: `Door ${s.doorIndex}`,
    severity: s.status === 1 ? 'Low' : 'High',
    snapshotUrl: 'https://via.placeholder.com/160x90?text=Card+Swipe',
    videoUrl: '',
  }))
);

const events = computed(() => {
  return [...liveSwipeList.value].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
});

const filteredEvents = computed(() => {
  if (!selectedLocationFilter.value) return events.value;
  return events.value.filter(e => e.locationId === selectedLocationFilter.value);
});

const formatTimestamp = (isoString) => new Date(isoString).toLocaleString();

const getSeverityColor = (severity) => {
  switch (severity.toLowerCase()) {
    case 'high':   return 'error';
    case 'medium': return 'warning';
    case 'low':    return 'info';
    default:       return 'default';
  }
};

const playVideo = (item) => {
  selectedEvent.value = item;
  videoDialog.value = true;
};

// ─── Face Recognition Events (Knative frigate-mqtt) ───────────────────────────
const FRIGATE_KN_URL = import.meta.env.VITE_FRIGATE_KN_URL
  || 'http://frigate-mqtt.knative-fn.65.109.41.139.sslip.io';

const faceEvents         = ref([]);
const faceLoading        = ref(false);
const faceRegisteredFilter = ref(null);   // null | true | false
const faceCameraFilter   = ref(null);

/** Unique camera names found in returned face events for filter dropdown */
const faceEventCameras = computed(() => {
  const cams = [...new Set(faceEvents.value.map(e => e.camera).filter(Boolean))];
  return [null, ...cams];  // null = "All Cameras"
});

const filteredFaceEvents = computed(() => {
  let list = faceEvents.value;
  if (faceRegisteredFilter.value !== null) {
    list = list.filter(e => e.is_registered === faceRegisteredFilter.value);
  }
  if (faceCameraFilter.value) {
    list = list.filter(e => e.camera === faceCameraFilter.value);
  }
  return list;
});

/** Fetch enriched face events from Knative frigate-mqtt REST endpoint */
const fetchFaceEvents = async () => {
  faceLoading.value = true;
  try {
    await deviceRegistry.loadDevices();
    const allowedCameras = deviceRegistry.getRegisteredCameraList();

    if (allowedCameras.length === 0) {
      faceEvents.value = [];
      faceLoading.value = false;
      return;
    }

    const params = new URLSearchParams({ limit: 50 });
    if (faceCameraFilter.value) {
      if (!allowedCameras.includes(faceCameraFilter.value.toLowerCase())) {
        faceEvents.value = [];
        faceLoading.value = false;
        return;
      }
      params.set('camera', faceCameraFilter.value);
    }

    const res = await fetch(`${FRIGATE_KN_URL}/events?${params}`);
    if (!res.ok) throw new Error(`Knative returned HTTP ${res.status}`);

    const json = await res.json();
    const data = json.data || [];
    faceEvents.value = data.filter(e => e.camera && allowedCameras.includes(e.camera.toLowerCase()));
  } catch (err) {
    console.error('[eventLogs] fetchFaceEvents error:', err.message);
  } finally {
    faceLoading.value = false;
  }
};

/** Similarity score → color */
const scoreColor = (score) => {
  if (score >= 0.80) return '#22c55e';  // green
  if (score >= 0.65) return '#f59e0b';  // amber
  return '#ef4444';                      // red
};

// ─── Lifecycle & Refresh ──────────────────────────────────────────────────────
const refreshLogs = async () => {
  if (activeTab.value === 'face') {
    await fetchFaceEvents();
  } else {
    await fetchLocations();
  }
};

let pollInterval;

onMounted(async () => {
  await fetchLocations();
  await fetchFaceEvents();
  
  // Poll for new live events every 5 seconds
  pollInterval = setInterval(async () => {
    if (activeTab.value === 'face') {
      const allowedCameras = deviceRegistry.getRegisteredCameraList();
      if (allowedCameras.length === 0) {
        faceEvents.value = [];
        return;
      }
      const params = new URLSearchParams({ limit: 50 });
      if (faceCameraFilter.value) params.set('camera', faceCameraFilter.value);
      try {
        const res = await fetch(`${FRIGATE_KN_URL}/events?${params}`);
        if (res.ok) {
          const json = await res.json();
          const data = json.data || [];
          faceEvents.value = data.filter(e => e.camera && allowedCameras.includes(e.camera.toLowerCase()));
        }
      } catch (e) {
        // silently ignore polling errors to avoid console spam
      }
    } else {
      await fetchLocations();
    }
  }, 5000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>

<style scoped>
.event-logs-container {
  padding: 20px;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ── Tab bar ─────────────────────────────────────────────────────────────── */
.tab-bar {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0;
}
.tab-btn {
  position: relative;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 700;
  color: #71717a;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px 8px 0 0;
}
.tab-btn:hover { color: #f59e0b; background: #fffbeb; }
.tab-btn.active { color: #d97706; border-bottom-color: #f59e0b; background: #fffbeb; }
.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 900;
  border-radius: 99px;
  background: #f59e0b;
  color: white;
}

/* ── Face events grid ────────────────────────────────────────────────────── */
.face-loading,
.face-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
}

.face-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.face-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s, transform 0.2s;
}
.face-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}
.face-card.registered { border-left: 4px solid #22c55e; }
.face-card.visitor    { border-left: 4px solid #f59e0b; }

.face-img-wrap {
  position: relative;
  width: 100%;
  height: 160px;
  background: #f4f4f5;
  overflow: hidden;
}
.face-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.face-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.identity-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 800;
}
.badge-registered { background: #dcfce7; color: #16a34a; }
.badge-visitor     { background: #fef3c7; color: #b45309; }

.face-card-body { padding: 14px 16px; }
.face-name { font-size: 15px; font-weight: 800; color: #18181b; margin-bottom: 6px; }

.face-meta { display: flex; flex-direction: column; gap: 2px; margin-bottom: 10px; }
.meta-item { font-size: 12px; color: #71717a; }

/* Score bar */
.score-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.score-label { font-size: 10px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em; width: 70px; }
.score-bar-bg { flex: 1; height: 6px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
.score-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s; }
.score-pct { font-size: 12px; font-weight: 800; width: 36px; text-align: right; }

/* Stats */
.face-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-val { font-size: 14px; font-weight: 900; color: #18181b; }
.stat-lbl { font-size: 9px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em; }
</style>
