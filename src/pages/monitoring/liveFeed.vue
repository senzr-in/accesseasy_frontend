<template>
  <div class="live-feed-container">
    <div class="header-actions mb-4">
      <h2>Live Camera Feeds</h2>
      <div class="controls d-flex align-center gap-4">
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
        <v-select
          v-model="gridSize"
          :items="[1, 2, 3, 4]"
          label="Grid Size"
          density="compact"
          variant="outlined"
          hide-details
          style="width: 120px"
        ></v-select>
      </div>
    </div>

    <div class="camera-grid-wrapper">
      <v-row>
        <v-col
          v-for="camera in filteredCameras"
          :key="camera.id"
          :cols="12 / gridSize"
          class="camera-col"
        >
          <v-card class="camera-feed-card">
            <v-card-title class="text-subtitle-2 py-1 px-2 d-flex justify-space-between bg-grey-lighten-4">
              <span>{{ camera.name }}</span>
              <div class="d-flex align-center">
                <span class="text-caption text-grey mr-2" v-if="camera.locationName">{{ camera.locationName }}</span>
                <v-icon size="small" :color="camera.status === 'online' ? 'success' : 'error'">
                  mdi-circle
                </v-icon>
              </div>
            </v-card-title>
            <div class="feed-container bg-black" style="aspect-ratio: 16/9; position: relative;">
              <!-- Show video when camera is online -->
              <video 
                v-if="camera.status === 'online' && camera.videoUrl"
                :src="camera.videoUrl"
                autoplay
                loop
                muted
                playsinline
                class="camera-video"
                style="width: 100%; height: 100%; object-fit: cover;"
              ></video>
              <!-- Show placeholder when camera is offline -->
              <div 
                v-else
                class="feed-placeholder d-flex align-center justify-center" 
                style="width: 100%; height: 100%;"
              >
                <div class="text-center">
                  <v-icon color="grey-darken-2" size="48">mdi-cctv</v-icon>
                  <div class="text-grey text-caption mt-1">Live Feed Unavailable</div>
                </div>
              </div>
            </div>
            <v-card-actions class="py-1">
              <v-spacer></v-spacer>
              <v-btn size="small" variant="text" icon="mdi-fullscreen"></v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      
      <div v-if="filteredCameras.length === 0" class="text-center mt-8 text-grey">
        No cameras found for the selected location.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCameraData } from '@/composables/useCameraData.js';

const gridSize = ref(2);
const selectedLocationFilter = ref(null);

// Use shared camera data composable
const { locations, cameras, fetchLocations } = useCameraData();

const filteredCameras = computed(() => {
  if (!selectedLocationFilter.value) return cameras.value;
  return cameras.value.filter(c => c.locationId === selectedLocationFilter.value);
});

// Fetch locations and cameras on mount
onMounted(async () => {
  await fetchLocations();
});
</script>

<style scoped>
.live-feed-container {
  padding: 20px;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}
.camera-grid-wrapper {
  overflow: auto;
  flex: 1;
  max-height: 100%;
}
.camera-feed-card {
  border: 1px solid #e0e0e0;
}
</style>
