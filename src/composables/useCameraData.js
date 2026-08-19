import { ref, computed } from 'vue';
import { authService } from '@/services/authService.js';

// Shared state for locations and cameras
const locations = ref([]);
const cameras = ref([]);
const loading = ref(false);
const isInitialized = ref(false);

const DEFAULT_LOCATIONS = [
  { id: 'loc-01', locationName: 'Main Entrance & Perimeter' },
  { id: 'loc-02', locationName: 'Logistics Hub & Vault' },
];

const DEFAULT_CAMERAS = [
  {
    id: 1,
    name: 'Main Gate Access Cam 01',
    group: 'Entrance',
    ip: '192.168.1.101',
    locationId: 'loc-01',
    locationName: 'Main Entrance & Perimeter',
    location: 'Main Entrance Gate',
    status: 'online',
    videoUrl: '/videos/tenant1camera1.mp4',
    resolution: '1080p Full HD',
    fps: 30
  },
  {
    id: 2,
    name: 'East Perimeter Fence Cam 02',
    group: 'Perimeter',
    ip: '192.168.1.102',
    locationId: 'loc-01',
    locationName: 'Main Entrance & Perimeter',
    location: 'Perimeter East Sector',
    status: 'online',
    videoUrl: '/videos/tenant1camera2.mp4',
    resolution: '1080p Full HD',
    fps: 30
  },
  {
    id: 3,
    name: 'Logistics Bay Loading Dock Cam 03',
    group: 'Logistics',
    ip: '192.168.2.101',
    locationId: 'loc-02',
    locationName: 'Logistics Hub & Vault',
    location: 'Loading Bay 4B',
    status: 'online',
    videoUrl: '/videos/tenant2camera1.mp4',
    resolution: '1080p Full HD',
    fps: 30
  },
  {
    id: 4,
    name: 'Server Vault Corridor Cam 04',
    group: 'Secure Vault',
    ip: '192.168.2.102',
    locationId: 'loc-02',
    locationName: 'Logistics Hub & Vault',
    location: 'Secure Room Vault 3',
    status: 'online',
    videoUrl: '/videos/tenant2camera2.mp4',
    resolution: '1080p Full HD',
    fps: 30
  },
  {
    id: 5,
    name: 'North Tower Rooftop Cam 05',
    group: 'Rooftop',
    ip: '192.168.1.103',
    locationId: 'loc-01',
    locationName: 'Main Entrance & Perimeter',
    location: 'Rooftop Helipad',
    status: 'online',
    videoUrl: '/videos/tenant1camera1.mp4',
    resolution: '4K Ultra HD',
    fps: 60
  },
  {
    id: 6,
    name: 'South Parking Underground Cam 06',
    group: 'Parking',
    ip: '192.168.2.103',
    locationId: 'loc-02',
    locationName: 'Logistics Hub & Vault',
    location: 'Basement Level -2',
    status: 'offline',
    videoUrl: null,
    resolution: '1080p Full HD',
    fps: 0
  }
];

export function useCameraData() {
  // Fetch locations from API
  const fetchLocations = async () => {
    if (isInitialized.value && cameras.value.length > 0) {
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

      if (response.data && response.data.data && response.data.data.length > 0) {
        // Map the response to extract locationName from locdetail
        const fetchedLocations = response.data.data.map(loc => ({
          id: loc.id,
          locationName: loc.locdetail?.locationName || 'Branch Location'
        }));
        
        locations.value = fetchedLocations;
        
        // Generate cameras for the locations
        const locationsToUse = fetchedLocations.slice(0, 2);
        const generatedCameras = [];
        let cameraId = 1;
        
        const videoMapping = {
          1: { status: 'online', videoUrl: '/videos/tenant1camera1.mp4', group: 'Entrance' },
          2: { status: 'online', videoUrl: '/videos/tenant1camera2.mp4', group: 'Perimeter' },
          3: { status: 'online', videoUrl: '/videos/tenant2camera1.mp4', group: 'Loading Bay' },
          4: { status: 'online', videoUrl: '/videos/tenant2camera2.mp4', group: 'Vault' },
          5: { status: 'offline', videoUrl: null, group: 'Parking' }
        };
        
        locationsToUse.forEach((location, locIndex) => {
          const camerasPerLocation = 2;
          for (let i = 1; i <= camerasPerLocation; i++) {
            const config = videoMapping[cameraId] || { status: 'online', videoUrl: '/videos/tenant1camera1.mp4', group: 'General' };
            
            generatedCameras.push({
              id: cameraId,
              name: `${location.locationName} Cam ${i}`,
              group: config.group,
              ip: `192.168.${locIndex + 1}.10${i}`,
              locationId: location.id,
              locationName: location.locationName,
              location: location.locationName,
              status: config.status,
              videoUrl: config.videoUrl,
              resolution: '1080p Full HD',
              fps: config.status === 'online' ? 30 : 0
            });
            cameraId++;
          }
        });
        
        cameras.value = generatedCameras;
        isInitialized.value = true;
      } else {
        // Use default high quality CCTV mock cameras
        locations.value = DEFAULT_LOCATIONS;
        cameras.value = DEFAULT_CAMERAS;
        isInitialized.value = true;
      }
    } catch (error) {
      console.warn('Location API error, falling back to standard CCTV streams:', error);
      locations.value = DEFAULT_LOCATIONS;
      cameras.value = DEFAULT_CAMERAS;
      isInitialized.value = true;
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
