<template>
  <v-app>
    <v-container fluid class="pa-0">
      <v-row no-gutters class="full-height">
        <!-- Task List Panel -->
        <v-col cols="12" lg="4" xl="3" class="task-panel">
          <v-card 
            flat 
            class="task-card h-100 d-flex flex-column"
            :class="$vuetify.theme.dark ? 'bg-grey-darken-4' : 'bg-grey-lighten-5'"
          >
            <!-- Header -->
            <div class="task-header pa-4">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-btn
                    @click="goBack"
                    icon
                    variant="text"
                    size="small"
                    class="mr-2"
                  >
                    <v-icon>mdi-arrow-left</v-icon>
                    <v-tooltip activator="parent">Back to Reimbursement</v-tooltip>
                  </v-btn>
                  <v-icon class="mr-3" color="primary" size="24">mdi-clipboard-list</v-icon>
                  <span class="text-h6 font-weight-bold">WORK ORDER LOCATION VIEW</span>
                </div>
              </div>
            </div>

            <v-divider />

            <v-card-text class="flex-grow-1 pa-0">
              <!-- Filters Section -->
              <div class="filters-section pa-4">
                <v-row dense>
                  <v-col cols="6">
                    <v-select
                      v-model="selectedMonth"
                      :items="months"
                      label="Select Month"
                      variant="outlined"
                      density="compact"
                      hide-details
                      item-title="text"
                      item-value="value"
                      @update:modelValue="handleDateFilterChange"
                    >
                      <template #prepend-inner>
                        <v-icon size="20">mdi-calendar-month</v-icon>
                      </template>
                    </v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      v-model="selectedYear"
                      :items="years"
                      label="Year"
                      variant="outlined"
                      density="compact"
                      hide-details
                      @update:modelValue="handleDateFilterChange"
                    >
                      <template #prepend-inner>
                        <v-icon size="20">mdi-calendar</v-icon>
                      </template>
                    </v-select>
                  </v-col>
                </v-row>

                <!-- Search Input -->
                <v-text-field
                  v-model="search"
                  label="Search tasks..."
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  class="mt-3"
                >
                  <template #prepend-inner>
                    <v-icon size="20">mdi-magnify</v-icon>
                  </template>
                </v-text-field>

                <!-- Stats Cards -->
                <div class="stats-section mt-4">
                  <v-row dense>
                    <v-col cols="6">
                      <v-card variant="tonal" color="primary" class="pa-2">
                        <div class="text-center">
                          <div class="text-h6 font-weight-bold">{{ totalItems }}</div>
                          <div class="text-caption">Total Tasks</div>
                        </div>
                      </v-card>
                    </v-col>
                    <v-col cols="6">
                      <v-card variant="tonal" color="success" class="pa-2">
                        <div class="text-center">
                          <div class="text-h6 font-weight-bold">{{ completedTasks }}</div>
                          <div class="text-caption">Completed</div>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </div>

              <v-divider />

              <!-- Task List -->
              <div class="task-list flex-grow-1">
                <v-progress-linear v-if="loading" indeterminate color="primary" />
                
                <div v-if="!loading && filteredTasks.length > 0" class="pa-2">
                  <v-virtual-scroll
                    :items="filteredTasks"
                    height="400"
                    item-height="120"
                  >
                    <template #default="{ item }">
                      <v-card
                        class="task-item ma-2"
                        :class="{ 'selected-task': selectedTask?.id === item.id }"
                        @click="selectTask(item)"
                        hover
                        :elevation="selectedTask?.id === item.id ? 4 : 1"
                      >
                        <v-card-text class="pa-3">
                          <div class="d-flex justify-space-between align-start">
                            <div class="flex-grow-1">
                              <h4 class="task-title text-subtitle-1 font-weight-bold mb-1">
                                {{ item.title }}
                              </h4>
                              <div class="task-meta">
                                <v-chip
                                  :color="getTaskTypeColor(item.taskType)"
                                  size="small"
                                  variant="tonal"
                                  class="mr-1 mb-1"
                                >
                                  {{ item.taskType }}
                                </v-chip>
                                <v-chip
                                  :color="getStatusColor(item.status)"
                                  size="small"
                                  variant="flat"
                                  class="mb-1"
                                >
                                  {{ item.status }}
                                </v-chip>
                              </div>
                              <div class="task-distance mt-2">
                                <v-icon size="16" class="mr-1">mdi-map-marker-distance</v-icon>
                                <span class="text-caption">{{ formatDistance(item.distanceKm) }}</span>
                              </div>
                              <!-- Location Status Indicator -->
                              <div class="location-status mt-1">
                                <v-chip
                                  :color="hasCurrentLocation(item) ? 'success' : 'warning'"
                                  size="x-small"
                                  variant="tonal"
                                >
                                  <v-icon size="12" class="mr-1">
                                    {{ hasCurrentLocation(item) ? 'mdi-map-marker-check' : 'mdi-map-marker-off' }}
                                  </v-icon>
                                  {{ hasCurrentLocation(item) ? 'Located' : 'No Location' }}
                                </v-chip>
                              </div>
                            </div>
                            <v-btn
                              icon
                              variant="text"
                              size="small"
                              :color="selectedTask?.id === item.id ? 'primary' : 'default'"
                            >
                              <v-icon>{{ selectedTask?.id === item.id ? 'mdi-eye' : 'mdi-eye-outline' }}</v-icon>
                            </v-btn>
                          </div>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-virtual-scroll>
                </div>

                <div v-else-if="!loading" class="pa-4 text-center">
                  <v-icon size="64" color="grey" class="mb-2">mdi-clipboard-off</v-icon>
                  <p class="text-body-2 text-grey">No tasks found for the selected period.</p>
                </div>
              </div>

              <!-- Pagination -->
              <div v-if="totalPages > 1" class="pa-3">
                <v-pagination
                  v-model="currentPage"
                  :length="totalPages"
                  :total-visible="5"
                  density="compact"
                  size="small"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Map Panel -->
       <v-col cols="12" lg="8" xl="9" class="map-panel">
          <v-card flat class="map-card h-100">
            <!-- Google Map Container -->
            <div class="map-container">
              <GoogleMap
                :api-key="apiKey"
                :center="mapCenter"
                :zoom="mapZoom"
                :map-type-id="mapType"
                :options="mapOptions"
                style="width: 100%; height: 100%"
                @map-loaded="onMapLoaded"
              >
                <!-- Current Location Marker (Starting Point) -->
                <Marker
                  v-if="selectedTask && hasCurrentLocation(selectedTask)"
                  :options="currentLocationMarkerOptions"
                  @marker-loaded="onCurrentMarkerLoaded"
                />
                
                <!-- Destination Marker -->
                <Marker
                  v-if="selectedTask && hasDestination(selectedTask)"
                  :options="destinationMarkerOptions"
                  @marker-loaded="onDestinationMarkerLoaded"
                />
                
                <!-- Route Polyline -->
                <Polyline
                  v-if="routePolyline && routePolyline.length > 0"
                  :options="polylineOptions"
                />
              </GoogleMap>

              <!-- Map Overlay for No Selection -->
              <div v-if="!selectedTask" class="map-overlay">
                <div class="text-center">
                  <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-map-marker-outline</v-icon>
                  <h3 class="text-h6 text-grey-lighten-1 mb-2">Select a Task</h3>
                  <p class="text-body-2 text-grey">Choose a task from the list to view its location on the map</p>
                </div>
              </div>

              <!-- Map Overlay for No Location Data -->
              <div v-else-if="selectedTask && !hasCurrentLocation(selectedTask)" class="map-overlay">
                <div class="text-center">
                  <v-icon size="64" color="warning" class="mb-4">mdi-map-marker-off</v-icon>
                  <h3 class="text-h6 text-warning mb-2">No Location Data</h3>
                  <p class="text-body-2 text-grey">This task doesn't have current location coordinates</p>
                </div>
              </div>

              <!-- Map Controls -->
              <div class="map-controls">
                <v-btn
                  v-if="selectedTask && hasCurrentLocation(selectedTask)"
                  @click="centerOnCurrentLocation"
                  icon
                  variant="text"
                  size="small"
                  class="mr-2"
                >
                  <v-icon>mdi-crosshairs-gps</v-icon>
                  <v-tooltip activator="parent">Center on Current Location</v-tooltip>
                </v-btn>
                <v-btn
                  v-if="selectedTask && hasDestination(selectedTask)"
                  @click="centerOnDestination"
                  icon
                  variant="text"
                  size="small"
                  class="mr-2"
                >
                  <v-icon>mdi-map-marker</v-icon>
                  <v-tooltip activator="parent">Center on Destination</v-tooltip>
                </v-btn>
                <v-btn
                  v-if="selectedTask && hasCurrentLocation(selectedTask) && hasDestination(selectedTask)"
                  @click="fitBothMarkers"
                  icon
                  variant="text"
                  size="small"
                  class="mr-2"
                >
                  <v-icon>mdi-fit-to-screen</v-icon>
                  <v-tooltip activator="parent">Fit Both Locations</v-tooltip>
                </v-btn>
                <v-btn
                  @click="toggleMapType"
                  icon
                  variant="text"
                  size="small"
                  class="mr-2"
                >
                  <v-icon>{{ mapType === 'roadmap' ? 'mdi-satellite-variant' : 'mdi-road-variant' }}</v-icon>
                  <v-tooltip activator="parent">
                    Switch to {{ mapType === 'roadmap' ? 'Satellite' : 'Road' }} View
                  </v-tooltip>
                </v-btn>
                <v-btn
                  @click="toggleDrawingMode"
                  icon
                  variant="text"
                  size="small"
                >
                  <v-icon>{{ drawingMode ? 'mdi-pencil-off' : 'mdi-pencil' }}</v-icon>
                  <v-tooltip activator="parent">
                    {{ drawingMode ? 'Disable Drawing' : 'Enable Drawing' }}
                  </v-tooltip>
                </v-btn>
              </div>
            </div>

            <!-- Task Details Card -->
            <v-expand-transition>
              <v-card
                v-if="selectedTask"
                variant="elevated"
                class="task-details-card ma-4"
                elevation="8"
              >
                <div class="pa-3">
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-subtitle-1 font-weight-bold">Task Details</span>
                    <v-btn
                      @click="selectedTask = null"
                      icon
                      variant="text"
                      size="small"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </div>
                </div>
                
                <v-divider />
                
                <v-card-text class="pa-3">
                  <v-row dense>
                    <v-col cols="12" md="6">
                      <div class="detail-item mb-2">
                        <span class="detail-label">Title:</span>
                        <span class="detail-value font-weight-medium">{{ selectedTask.title }}</span>
                      </div>
                      <div class="detail-item mb-2">
                        <span class="detail-label">Type:</span>
                        <v-chip
                          :color="getTaskTypeColor(selectedTask.taskType)"
                          size="small"
                          variant="tonal"
                        >
                          {{ selectedTask.taskType }}
                        </v-chip>
                      </div>
                      <div class="detail-item mb-2">
                        <span class="detail-label">Status:</span>
                        <v-chip
                          :color="getStatusColor(selectedTask.status)"
                          size="small"
                          variant="flat"
                        >
                          {{ selectedTask.status }}
                        </v-chip>
                      </div>
                      <div class="detail-item mb-2">
                        <span class="detail-label">Distance:</span>
                        <span class="detail-value font-weight-medium">{{ formatDistance(selectedTask.distanceKm) }}</span>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <!-- Current Location -->
                      <div class="detail-item mb-2">
                        <span class="detail-label">Current Location:</span>
                        <span class="detail-value font-mono" v-if="hasCurrentLocation(selectedTask)">
                          {{ formatCoordinate(selectedTask.currentLat) }}, {{ formatCoordinate(selectedTask.currentLng) }}
                        </span>
                        <span class="detail-value text-warning" v-else>Not Available</span>
                      </div>
                      
                      <!-- Destination -->
                      <div class="detail-item mb-2">
                        <span class="detail-label">Destination:</span>
                        <span class="detail-value font-mono" v-if="hasDestination(selectedTask)">
                          {{ formatCoordinate(selectedTask.lat) }}, {{ formatCoordinate(selectedTask.lng) }}
                        </span>
                        <span class="detail-value text-warning" v-else>Not Available</span>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue';
import { GoogleMap, Marker, Polyline } from 'vue3-google-map';
import axios from 'axios';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { useRoute, useRouter } from 'vue-router';
import polyline from 'google-polyline';

// Constants
const apiKey = 'AIzaSyCwp-gBFBiutZVlE-a-84hHnA2XeMRGE1g';
const route = useRoute();
const router = useRouter();
const employeeId = route.params.employeeId;

// Reactive data
const search = ref('');
const tasks = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const loading = ref(false);
const mapType = ref('roadmap');
const drawingMode = ref(false);

// Date filters
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());

const months = Array.from({ length: 12 }, (_, i) => ({
  text: new Date(0, i).toLocaleString('default', { month: 'long' }),
  value: i + 1,
}));

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

// Map data
const selectedTask = ref(null);
const defaultCenter = { lat: 13.0827, lng: 80.2707 }; // Chennai coordinates as fallback
const mapCenter = ref({ ...defaultCenter });
const mapZoom = ref(10);
const routePolyline = ref([]);
const mapInstance = ref(null);
const currentMarkerInstance = ref(null);
const destinationMarkerInstance = ref(null);
const drawingManager = ref(null);

// Helper functions for location validation
const hasCurrentLocation = (task) => {
  return task && task.currentLat && task.currentLng && 
         !isNaN(parseFloat(task.currentLat)) && !isNaN(parseFloat(task.currentLng));
};

const hasDestination = (task) => {
  return task && task.lat && task.lng && 
         !isNaN(parseFloat(task.lat)) && !isNaN(parseFloat(task.lng));
};

// Computed properties
const filteredTasks = computed(() => {
  if (!search.value) return tasks.value;
  const searchTerm = search.value.toLowerCase();
  return tasks.value.filter(task =>
    task.title?.toLowerCase().includes(searchTerm) ||
    task.taskType?.toLowerCase().includes(searchTerm) ||
    task.status?.toLowerCase().includes(searchTerm)
  );
});

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const completedTasks = computed(() => 
  tasks.value.filter(task => task.status?.toLowerCase() === 'completed').length
);

// Current location marker position and options
const currentLocationPosition = computed(() => {
  if (!selectedTask.value || !hasCurrentLocation(selectedTask.value)) return defaultCenter;
  return {
    lat: parseFloat(selectedTask.value.currentLat),
    lng: parseFloat(selectedTask.value.currentLng)
  };
});

const currentLocationMarkerOptions = computed(() => ({
  position: currentLocationPosition.value,
  title: `Current Location - ${selectedTask.value?.title || 'Task'}`,
  icon: {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#4CAF50" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
        <circle cx="16" cy="16" r="3" fill="#4CAF50"/>
      </svg>
    `),
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 16)
  }
}));

// Destination marker position and options
const destinationPosition = computed(() => {
  if (!selectedTask.value || !hasDestination(selectedTask.value)) return defaultCenter;
  return {
    lat: parseFloat(selectedTask.value.lat),
    lng: parseFloat(selectedTask.value.lng)
  };
});

const destinationMarkerOptions = computed(() => ({
  position: destinationPosition.value,
  title: `Destination - ${selectedTask.value?.title || 'Task'}`,
  icon: {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C11.0294 2 7 6.02944 7 11C7 18.25 16 30 16 30C16 30 25 18.25 25 11C25 6.02944 20.9706 2 16 2Z" fill="#F44336" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="11" r="4" fill="white"/>
      </svg>
    `),
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 32)
  }
}));

const polylineOptions = computed(() => ({
  path: routePolyline.value,
  geodesic: true,
  strokeColor: '#1976D2',
  strokeOpacity: 0.8,
  strokeWeight: 3,
  icons: [{
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 3,
      fillColor: '#1976D2',
      fillOpacity: 1,
      strokeColor: '#1976D2',
      strokeOpacity: 1
    },
    offset: '0%',
    repeat: '20px'
  }]
}));

const mapOptions = computed(() => ({
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: true,
  rotateControl: false,
  fullscreenControl: true,
  gestureHandling: 'cooperative',
  styles: mapType.value === 'roadmap' ? [] : undefined
}));

// API configuration
const API_ENDPOINTS = {
  tasks: '/items/tasks',
};

// Helper functions
const getTaskTypeColor = (taskType) => {
  const colors = {
    'delivery': 'blue',
    'pickup': 'green',
    'maintenance': 'orange',
    'inspection': 'purple',
    'default': 'grey'
  };
  return colors[taskType?.toLowerCase()] || colors.default;
};

const getStatusColor = (status) => {
  const colors = {
    'completed': 'success',
    'in-progress': 'warning',
    'pending': 'info',
    'cancelled': 'error',
    'default': 'grey'
  };
  return colors[status?.toLowerCase()] || colors.default;
};

const formatDistance = (distance) => {
  if (!distance) return 'N/A';
  const num = parseFloat(distance);
  return num < 1 ? `${Math.round(num * 1000)}m` : `${num.toFixed(1)}km`;
};

const formatCoordinate = (coord) => {
  if (!coord) return 'N/A';
  return parseFloat(coord).toFixed(6);
};

// Decode polyline using google-polyline package
const decodePolyline = (encoded) => {
  if (!encoded || typeof encoded !== 'string') return [];

  try {
    // If it's a JSON string, parse it first
    let polylineString = encoded;
    if (encoded.startsWith('[') || encoded.startsWith('{')) {
      const parsed = JSON.parse(encoded);
      if (Array.isArray(parsed)) return parsed.map(coord => ({ lat: coord[0], lng: coord[1] }));
      polylineString = parsed.points || parsed.polyline || encoded;
    }

    // Use google-polyline to decode
    const decoded = polyline.decode(polylineString);
    // Convert to Google Maps format [{ lat, lng }]
    return decoded.map(coord => ({ lat: coord[0], lng: coord[1] }));
  } catch (error) {
    console.error('Error decoding polyline:', error);
    return [];
  }
};

// Main functions
const fetchTasks = async () => {
  loading.value = true;
  try {
    const token = await authService.getToken();
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}${API_ENDPOINTS.tasks}`,
      {
        params: {
          'filter[_and][0][_and][0][employeeId][id][_eq]': employeeId,
          'filter[_and][0][_and][1][month(date_created)][_eq]': selectedMonth.value,
          'filter[_and][0][_and][2][year(date_created)][_eq]': selectedYear.value,
          'fields[]': [
            'id',
            'taskType',
            'title',
            'status',
            'distanceKm',
            'currentLat',
            'currentLng',
            'lat',
            'lng',
            'routePolyline',
          ],
          'meta': 'total_count',
          'page': currentPage.value,
          'limit': itemsPerPage.value,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    tasks.value = response.data.data || [];
    totalItems.value = response.data.data?.length || 0;
 
    // Auto-select first task with current location if available and none selected
    if (tasks.value.length > 0 && !selectedTask.value) {
      const taskWithLocation = tasks.value.find(task => hasCurrentLocation(task)) || tasks.value[0];
      await nextTick();
      selectTask(taskWithLocation);
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    tasks.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};

const selectTask = async (task) => {
  selectedTask.value = task;
  
  // Only proceed if task has current location
  if (hasCurrentLocation(task)) {
    const currentLat = parseFloat(task.currentLat);
    const currentLng = parseFloat(task.currentLng);
    
    // Center map on current location (starting point)
    mapCenter.value = { lat: currentLat, lng: currentLng };
    mapZoom.value = 16;
    
    // Handle polyline
    if (task.routePolyline) {
      routePolyline.value = decodePolyline(task.routePolyline);
    } else {
      routePolyline.value = [];
    }
    
    // Center map after short delay to ensure map is ready
    await nextTick();
    setTimeout(() => {
      if (mapInstance.value) {
        mapInstance.value.panTo({ lat: currentLat, lng: currentLng });
      }
    }, 100);
  } else {
    // Clear polyline if no current location
    routePolyline.value = [];
  }
};

const centerOnCurrentLocation = () => {
  if (selectedTask.value && hasCurrentLocation(selectedTask.value)) {
    const center = {
      lat: parseFloat(selectedTask.value.currentLat),
      lng: parseFloat(selectedTask.value.currentLng)
    };
    mapCenter.value = center;
    if (mapInstance.value) {
      mapInstance.value.panTo(center);
      mapInstance.value.setZoom(16);
    }
  }
};

const centerOnDestination = () => {
  if (selectedTask.value && hasDestination(selectedTask.value)) {
    const center = {
      lat: parseFloat(selectedTask.value.lat),
      lng: parseFloat(selectedTask.value.lng)
    };
    mapCenter.value = center;
    if (mapInstance.value) {
      mapInstance.value.panTo(center);
      mapInstance.value.setZoom(16);
    }
  }
};

const fitBothMarkers = () => {
  if (selectedTask.value && hasCurrentLocation(selectedTask.value) && hasDestination(selectedTask.value) && mapInstance.value) {
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: parseFloat(selectedTask.value.currentLat), lng: parseFloat(selectedTask.value.currentLng) });
    bounds.extend({ lat: parseFloat(selectedTask.value.lat), lng: parseFloat(selectedTask.value.lng) });
    mapInstance.value.fitBounds(bounds);
  }
};

const toggleMapType = () => {
  mapType.value = mapType.value === 'roadmap' ? 'satellite' : 'roadmap';
};

const toggleDrawingMode = () => {
  drawingMode.value = !drawingMode.value;
  if (mapInstance.value) {
    if (!drawingManager.value) {
      drawingManager.value = new google.maps.drawing.DrawingManager({
        drawingMode: drawingMode.value ? google.maps.drawing.OverlayType.POLYLINE : null,
        drawingControl: false,
        polylineOptions: {
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          editable: true,
          draggable: true
        }
      });
      drawingManager.value.setMap(mapInstance.value);
    } else {
      drawingManager.value.setDrawingMode(drawingMode.value ? google.maps.drawing.OverlayType.POLYLINE : null);
    }
  }
};

const openInGoogleMaps = () => {
  if (selectedTask.value && hasCurrentLocation(selectedTask.value)) {
    const url = `https://www.google.com/maps?q=${selectedTask.value.currentLat},${selectedTask.value.currentLng}`;
    window.open(url, '_blank');
  }
};

const goBack = () => {
  router.push('/reimbursement/reimbursementtab/reimbursementemp');
};

const handleDateFilterChange = () => {
  currentPage.value = 1;
  selectedTask.value = null;
  routePolyline.value = [];
  fetchTasks();
};

// Map event handlers
const onMapLoaded = (map) => {
  mapInstance.value = map;
};

const onCurrentMarkerLoaded = (marker) => {
  currentMarkerInstance.value = marker;
};

const onDestinationMarkerLoaded = (marker) => {
  destinationMarkerInstance.value = marker;
};

// Watchers
watch(currentPage, fetchTasks);
watch(itemsPerPage, () => {
  currentPage.value = 1;
  fetchTasks();
});

// Initialize
onMounted(() => {
  fetchTasks();
});
</script>

<style scoped>
.full-height {
  height: 100vh;
}

.task-panel {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.task-card,
.map-card {
  border-radius: 0;
}

.task-header,
.map-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%);
  color: white;
}

.filters-section {
  background: rgba(var(--v-theme-surface), 1);
}

.stats-section .v-card {
  border-radius: 12px;
}

.task-item {
  transition: all 0.2s ease-in-out;
  border-radius: 12px;
  cursor: pointer;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.selected-task {
  border: 2px solid rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}

.task-title {
  line-height: 1.3;
  margin-bottom: 4px;
}

.task-meta .v-chip {
  font-size: 0.75rem;
  height: 20px;
}

.task-distance {
  display: flex;
  align-items: center;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.location-status {
  display: flex;
  align-items: center;
}

.map-container {
  position: relative;
  height: calc(100vh - 120px);
  overflow: hidden;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--v-theme-surface), 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.map-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-surface), 0.9);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-details-card {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px 16px 0 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  min-width: 120px;
}

.detail-value {
  font-size: 0.875rem;
}

.font-mono {
  font-size: 0.8rem;
}

/* Responsive adjustments */
@media (max-width: 1264px) {
  .task-panel {
    border-right: none;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }
  
  .map-container {
    height: 400px;
  }
  
  .full-height {
    height: auto;
  }
}

/* Dark theme adjustments */
.theme--dark .task-details-card {
  background: rgba(var(--v-theme-surface), 0.9);
}

.theme--dark .map-overlay {
  background: rgba(var(--v-theme-surface), 0.85);
}

.theme--dark .map-controls {
  background: rgba(var(--v-theme-surface), 0.9);
}

/* Custom scrollbar for task list */
.task-list :deep(.v-virtual-scroll__container) {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) transparent;
}

.task-list :deep(.v-virtual-scroll__container::-webkit-scrollbar) {
  width: 6px;
}

.task-list :deep(.v-virtual-scroll__container::-webkit-scrollbar-track) {
  background: transparent;
}

.task-list :deep(.v-virtual-scroll__container::-webkit-scrollbar-thumb) {
  background-color: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

.task-list :deep(.v-virtual-scroll__container::-webkit-scrollbar-thumb:hover) {
  background-color: rgba(var(--v-theme-primary), 0.5);
}
</style>