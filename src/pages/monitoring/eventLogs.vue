<template>
  <div class="event-logs-container">
    <div class="header-actions mb-4">
      <h2>AI Event Logs</h2>
      <div class="d-flex align-center gap-4">
        <v-select
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
        ></v-select>
        <v-btn color="primary" prepend-icon="mdi-refresh" @click="refreshLogs">
          Refresh
        </v-btn>
      </div>
    </div>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredEvents"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:item.timestamp="{ item }">
          {{ formatTimestamp(item.timestamp) }}
        </template>
        
        <template v-slot:item.severity="{ item }">
          <v-chip
            :color="getSeverityColor(item.severity)"
            size="small"
          >
            {{ item.severity }}
          </v-chip>
        </template>

        <template v-slot:item.snapshot="{ item }">
          <v-img
            :src="item.snapshotUrl"
            width="80"
            height="45"
            cover
            class="rounded bg-grey-lighten-2"
          ></v-img>
        </template>
        
        <template v-slot:item.actions="{ item }">
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

    <!-- Video Player Dialog Placeholder -->
    <v-dialog v-model="videoDialog" max-width="800px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Event Playback</span>
          <v-btn icon="mdi-close" variant="text" @click="videoDialog = false"></v-btn>
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
import { ref, computed, onMounted } from 'vue';
import VideoPlayer from '@/components/VideoPlayer.vue';
import { useCameraData } from '@/composables/useCameraData.js';

const videoDialog = ref(false);
const selectedEvent = ref(null);
const selectedLocationFilter = ref(null);

// Use shared camera data composable
const { locations, cameras, loading, fetchLocations } = useCameraData();

const headers = [
  { title: 'Snapshot', key: 'snapshot', sortable: false },
  { title: 'Timestamp', key: 'timestamp' },
  { title: 'Event Type', key: 'type' },
  { title: 'Camera', key: 'cameraName' },
  { title: 'Location', key: 'locationName' },
  { title: 'Severity', key: 'severity' },
  { title: 'Actions', key: 'actions', sortable: false },
];

// Event types for random generation
const eventTypes = [
  { type: 'Unauthorized Entry', severity: 'High' },
  { type: 'Loitering Detected', severity: 'Medium' },
  { type: 'Tailgating Detected', severity: 'High' },
  { type: 'Object Left Behind', severity: 'Low' },
  { type: 'Crowd Density High', severity: 'Medium' },
  { type: 'Face Recognition Failed', severity: 'Medium' },
  { type: 'Suspicious Activity', severity: 'High' },
];

// Generate events based on actual camera data
const events = computed(() => {
  const generatedEvents = [];
  let eventId = 1;
  
  cameras.value.forEach((camera, index) => {
    // Generate 1-2 events per camera
    const numEvents = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numEvents; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const timeOffset = (index * 3600000) + (i * 1800000); // Stagger timestamps
      
      generatedEvents.push({
        id: eventId++,
        timestamp: new Date(Date.now() - timeOffset).toISOString(),
        type: eventType.type,
        cameraName: camera.name,
        locationId: camera.locationId,
        locationName: camera.locationName,
        severity: eventType.severity,
        snapshotUrl: `https://via.placeholder.com/160x90?text=${encodeURIComponent(camera.name)}`,
        videoUrl: camera.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      });
    }
  });
  
  // Sort by timestamp (newest first)
  return generatedEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
});

const filteredEvents = computed(() => {
  if (!selectedLocationFilter.value) return events.value;
  return events.value.filter(e => e.locationId === selectedLocationFilter.value);
});

const formatTimestamp = (isoString) => {
  return new Date(isoString).toLocaleString();
};

const getSeverityColor = (severity) => {
  switch (severity.toLowerCase()) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'default';
  }
};

const refreshLogs = async () => {
  await fetchLocations();
};

const playVideo = (item) => {
  selectedEvent.value = item;
  videoDialog.value = true;
};

// Fetch locations and cameras on mount
onMounted(async () => {
  await fetchLocations();
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
</style>
