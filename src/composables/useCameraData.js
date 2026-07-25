import { ref, computed } from 'vue';
import { authService } from '@/services/authService.js';

// Shared state for locations and cameras
const locations = ref([]);
const cameras = ref([]);
const loading = ref(false);
const isInitialized = ref(false);

export function useCameraData() {
  // Fetch locations from API
  const fetchLocations = async () => {
    if (isInitialized.value) {
      // Return cached data if already initialized
      return { locations: locations.value, cameras: cameras.value };
    }

    try {
      loading.value = true;
      const tenantId = authService.getTenantId();
      
      const response = await authService.protectedApi.get('/items/locationManagement', {
        params: {
          'fields[]': ['locdetail', 'locType', 'id'],
          'filter[_and][0][_and][0][tenant][tenantId][_eq]': tenantId,
          'filter[_and][0][_and][1][locType][_contains]': 'branch'
        }
      });

      if (response.data && response.data.data) {
        // Map the response to extract locationName from locdetail
        const fetchedLocations = response.data.data.map(loc => ({
          id: loc.id,
          locationName: loc.locdetail?.locationName || 'Unknown Location'
        }));
        
        locations.value = fetchedLocations;
        
        // Generate cameras for the first 2 locations
        const locationsToUse = fetchedLocations.slice(0, 2);
        const generatedCameras = [];
        let cameraId = 1;
        
        // Camera live feed video URLs - using local videos from public/videos folder
        const videoMapping = {
          // First location (Hyderabad) cameras
          1: { status: 'online', videoUrl: '/videos/tenant1camera1.mp4' },  // Hyderabad Camera 1
          2: { status: 'offline', videoUrl: null },  // Hyderabad Camera 2
          3: { status: 'online', videoUrl: '/videos/tenant1camera2.mp4' },  // Hyderabad Camera 3
          // Second location (NewTenant) cameras
          4: { status: 'online', videoUrl: '/videos/tenant2camera1.mp4' },  // NewTenant Camera 1
          5: { status: 'offline', videoUrl: null },  // NewTenant Camera 2
        };
        
        locationsToUse.forEach((location, locIndex) => {
          // Add 3 cameras for first location (Hyderabad), 2 for second location (NewTenant)
          const camerasPerLocation = locIndex === 0 ? 3 : 2;
          
          for (let i = 1; i <= camerasPerLocation; i++) {
            const config = videoMapping[cameraId] || { status: 'offline', videoUrl: null };
            
            generatedCameras.push({
              id: cameraId,
              name: `${location.locationName} Camera ${i}`,
              ip: `192.168.${locIndex + 1}.10${i}`,
              locationId: location.id,
              locationName: location.locationName,
              status: config.status,
              videoUrl: config.videoUrl
            });
            cameraId++;
          }
        });
        
        cameras.value = generatedCameras;
        isInitialized.value = true;
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      loading.value = false;
    }

    return { locations: locations.value, cameras: cameras.value };
  };

  // Get cameras for a specific location
  const getCamerasByLocation = (locationId) => {
    if (!locationId) return cameras.value;
    return cameras.value.filter(c => c.locationId === locationId);
  };

  // Reset the cache (useful for refreshing data)
  const resetCache = () => {
    isInitialized.value = false;
    locations.value = [];
    cameras.value = [];
  };

  return {
    locations: computed(() => locations.value),
    cameras: computed(() => cameras.value),
    loading: computed(() => loading.value),
    isInitialized: computed(() => isInitialized.value),
    fetchLocations,
    getCamerasByLocation,
    resetCache
  };
}
