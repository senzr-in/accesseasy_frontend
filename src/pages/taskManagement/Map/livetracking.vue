<template>
  <div class="map-wrapper">
    <!-- Main Map Container -->
    <div class="map-container">
      <div id="map" ref="mapContainer"></div>
      
      <!-- Top Statistics Bar -->
      <div class="top-stats-bar">
        <div class="stats-container">
          <div class="stat-card total-locations">
            <div class="stat-icon">📍</div>
            <div class="stat-content">
              <div class="stat-number">{{ totalCount }}</div>
              <div class="stat-label">Total Locations</div>
            </div>
          </div>
          
          <div class="stat-card serviceable-areas">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-number">{{ serviceableAreasCount }}</div>
              <div class="stat-label">Serviceable Areas</div>
            </div>
          </div>
          
          <div class="stat-card branches">
            <div class="stat-icon">🏢</div>
            <div class="stat-content">
              <div class="stat-number">{{ branchesCount }}</div>
              <div class="stat-label">Branches</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side Control Panel -->
      <div class="right-control-panel">
        <!-- Search Input -->
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search by name, address, or pincode..." 
            class="search-input"
          >
        </div>

        <!-- Map Layers Dropdown -->
        <div class="control-dropdown" :class="{ 'dropdown-active': showLayersPanel }">
          <div class="dropdown-trigger" @click="toggleLayersPanel">
            <div class="trigger-content">
              <span class="trigger-icon">🗂️</span>
              <span class="trigger-text">Map Layers</span>
              <div class="trigger-counts">
                <span class="count-item serviceable">{{ serviceableAreasCount }}</span>
                <span class="count-item branches">{{ branchesCount }}</span>
              </div>
            </div>
            <div class="dropdown-arrow" :class="{ 'arrow-up': showLayersPanel }">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div class="dropdown-content" v-show="showLayersPanel">
            <div class="dropdown-section">
              <div class="section-title">Layer Visibility</div>
              
              <div class="control-row">
                <div class="control-info">
                  <div class="control-icon serviceable-area">🎯</div>
                  <div class="control-details">
                    <span class="control-name">Serviceable Areas</span>
                    <span class="control-description">Coverage zones with radius</span>
                  </div>
                </div>
                <div class="control-actions">
                  <span class="item-count">{{ serviceableAreasCount }}</span>
                  <label class="modern-switch">
                    <input 
                      type="checkbox"
                      v-model="layers.serviceableAreas"
                      @change="toggleLayer('serviceableAreas')"
                    >
                    <span class="switch-slider"></span>
                  </label>
                </div>
              </div>
              
              <div class="control-row">
                <div class="control-info">
                  <div class="control-icon branch">🏢</div>
                  <div class="control-details">
                    <span class="control-name">Branches</span>
                    <span class="control-description">Physical branch locations</span>
                  </div>
                </div>
                <div class="control-actions">
                  <span class="item-count">{{ branchesCount }}</span>
                  <label class="modern-switch">
                    <input 
                      type="checkbox"
                      v-model="layers.branches"
                      @change="toggleLayer('branches')"
                    >
                    <span class="switch-slider"></span>
                  </label>
                </div>
              </div>

              <div class="control-row">
                <div class="control-info">
                  <div class="control-icon camera">📷</div>
                  <div class="control-details">
                    <span class="control-name">Cameras</span>
                    <span class="control-description">Surveillance cameras</span>
                  </div>
                </div>
                <div class="control-actions">
                  <span class="item-count">{{ camerasCount }}</span>
                  <label class="modern-switch">
                    <input 
                      type="checkbox"
                      v-model="layers.cameras"
                      @change="toggleLayer('cameras')"
                    >
                    <span class="switch-slider"></span>
                  </label>
                </div>
              </div>
              
              <div class="control-row">
                <div class="control-info">
                  <div class="control-icon radius">📐</div>
                  <div class="control-details">
                    <span class="control-name">Coverage Radius</span>
                    <span class="control-description">Show service area circles</span>
                  </div>
                </div>
                <div class="control-actions">
                  <span class="item-count">{{ locationsWithRadius }}</span>
                  <label class="modern-switch">
                    <input 
                      type="checkbox"
                      v-model="layers.showRadius"
                      @change="toggleLayer('showRadius')"
                    >
                    <span class="switch-slider"></span>
                  </label>
                </div>
              </div>
              
              <div class="control-row">
                <div class="control-info">
                  <div class="control-icon label">📝</div> <!-- Changed icon to indicate text labels -->
                  <div class="control-details">
                    <span class="control-name">Location Names</span>
                    <span class="control-description">Show location names with coverage</span>
                  </div>
                </div>
                <div class="control-actions">
                  <span class="item-count">{{ totalCount }}</span>
                  <label class="modern-switch">
                    <input 
                      type="checkbox"
                      v-model="layers.showLocationNames"
                      @change="toggleLayer('showLocationNames')"
                    >
                    <span class="switch-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Organization Filter Dropdown -->
        <div class="control-dropdown" :class="{ 'dropdown-active': showOrgPanel }">
          <div class="dropdown-trigger" @click="toggleOrgPanel">
            <div class="trigger-content">
              <span class="trigger-icon">🏢</span>
              <span class="trigger-text">Organizations</span>
              <div class="trigger-counts">
                <span class="count-item total">{{ totalCount }}</span>
              </div>
            </div>
            <div class="dropdown-arrow" :class="{ 'arrow-up': showOrgPanel }">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div class="dropdown-content" v-show="showOrgPanel">
            <div class="dropdown-section">
              <div class="section-title">Filter by Organization</div>
              
              <label class="org-option" :class="{ 'option-active': selectedOrganization === 'all' }">
                <input 
                  type="radio"
                  name="organization"
                  value="all"
                  v-model="selectedOrganization"
                >
                <div class="org-card">
                  <div class="org-icon all">🌐</div>
                  <div class="org-details">
                    <div class="org-name">All Organizations</div>
                    <div class="org-description">Show all locations</div>
                  </div>
                  <div class="org-count">{{ organizationCounts.all }}</div>
                </div>
              </label>
              
              <label class="org-option" :class="{ 'option-active': selectedOrganization === 'main-tenant' }">
                <input 
                  type="radio"
                  name="organization"
                  value="main-tenant"
                  v-model="selectedOrganization"
                >
                <div class="org-card">
                  <div class="org-icon main-tenant">🏛️</div>
                  <div class="org-details">
                    <div class="org-name">Main Tenant</div>
                    <div class="org-description">Primary organization</div>
                  </div>
                  <div class="org-count">{{ organizationCounts.mainTenant }}</div>
                </div>
              </label>
              <!-- Add this after the Contact Org option -->
<label class="org-option" :class="{ 'option-active': selectedOrganization === 'tenant-org' }">
  <input 
    type="radio"
    name="organization"
    value="tenant-org"
    v-model="selectedOrganization"
  >
  <div class="org-card">
    <div class="org-icon tenant-org">🏢</div>
    <div class="org-details">
      <div class="org-name">Tenant Org</div>
      <div class="org-description">Tenant organizations</div>
    </div>
    <div class="org-count">{{ organizationCounts.tenantOrg }}</div>
  </div>
</label>
              <label class="org-option" :class="{ 'option-active': selectedOrganization === 'client-org' }">
                <input 
                  type="radio"
                  name="organization"
                  value="client-org"
                  v-model="selectedOrganization"
                >
                <div class="org-card">
                  <div class="org-icon client-org">🏪</div>
                  <div class="org-details">
                    <div class="org-name">Client Org</div>
                    <div class="org-description">Client organizations</div>
                  </div>
                  <div class="org-count">{{ organizationCounts.clientOrg }}</div>
                </div>
              </label>
              
              <label class="org-option" :class="{ 'option-active': selectedOrganization === 'distributor-org' }">
                <input 
                  type="radio"
                  name="organization"
                  value="distributor-org"
                  v-model="selectedOrganization"
                >
                <div class="org-card">
                  <div class="org-icon distributor-org">🚚</div>
                  <div class="org-details">
                    <div class="org-name">Distributor Org</div>
                    <div class="org-description">Distributor organizations</div>
                  </div>
                  <div class="org-count">{{ organizationCounts.distributorOrg }}</div>
                </div>
              </label>
              
              <label class="org-option" :class="{ 'option-active': selectedOrganization === 'contact-org' }">
                <input 
                  type="radio"
                  name="organization"
                  value="contact-org"
                  v-model="selectedOrganization"
                >
                <div class="org-card">
                  <div class="org-icon contact-org">📞</div>
                  <div class="org-details">
                    <div class="org-name">Contact</div>
                    <div class="org-description">Contact organizations</div>
                  </div>
                  <div class="org-count">{{ organizationCounts.contactOrg }}</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Map Action Buttons -->
        <div class="action-buttons">
          <button class="action-btn" @click="fitAllMarkers" title="Fit All Locations">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M8 21H5C3.89543 21 3 20.1046 3 19V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="action-btn" @click="toggleFullscreen" title="Toggle Fullscreen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 3H21V9M9 21H3V15M3 9V3H9M21 15V21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      

      <!-- Loading Overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <div class="loading-text">Loading locations...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { Loader } from '@googlemaps/js-api-loader';
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

const tenantId = currentUserTenant.getTenantId();
const apiKey = 'AIzaSyCwp-gBFBiutZVlE-a-84hHnA2XeMRGE1g';

// Reactive data
const layers = ref({
  serviceableAreas: true,
  branches: true,
  cameras: true,
  showRadius: true,
  showLocationNames: true // New property for location names visibility
});

const token = authService.getToken();
const selectedOrganization = ref('all');
const searchQuery = ref('');
const mapContainer = ref(null);
const loading = ref(false);
const showLayersPanel = ref(false);
const showOrgPanel = ref(false);

// Map instance and markers
let map = null;
let locationMarkers = [];
let radiusCircles = [];
let infoWindow = null;

// API data
const locations = ref([]);
const organizationCounts = ref({
  all: 0,
  mainTenant: 0,
  clientOrg: 0,
  distributorOrg: 0,
  contactOrg: 0
});

// API base URL
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/items/locationManagement?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`;

// computed filteredLocations
const filteredLocations = computed(() => {
  let filtered = locations.value;

  // Organization filter
  if (selectedOrganization.value !== 'all') {
    let orgType;
    switch (selectedOrganization.value) {
      case 'main-tenant':
        orgType = 'main tenant';
        break;
      case 'client-org':
        orgType = 'clientorg';
        break;
      case 'distributor-org':
        orgType = 'distributororg';
        break;
      case 'contact-org':
        orgType = 'contact';
        break;
      case 'tenant-org':
        orgType = 'tenantorg';
        break;
    }
    if (orgType) {
      filtered = filtered.filter(loc => loc.orgLocation?.orgType === orgType);
    }
    console.log(`Filtered by organization (${orgType}):`, filtered.length);
  }

  // Search filter (keep your existing code)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter(loc => {
      return (
        (loc.locdetail?.locationName || '').toLowerCase().includes(q) ||
        (loc.locdetail?.address || '').toLowerCase().includes(q) ||
        (loc.locdetail?.pincode || '').toLowerCase().includes(q)
      );
    });
  }

  return filtered;
});
// Computed properties for counts
const totalCount = computed(() => filteredLocations.value.length);
const serviceableAreasCount = computed(() => 
  filteredLocations.value.filter(loc => loc.locType === 'serviceable_area').length);
const branchesCount = computed(() => 
  filteredLocations.value.filter(loc => loc.locType === 'branch').length);
const camerasCount = computed(() => 
  filteredLocations.value.filter(loc => loc.locType === 'camera').length);
const locationsWithRadius = computed(() => 
  filteredLocations.value.filter(loc => loc.locSize && loc.locSize !== null).length);

const averageCoverage = computed(() => {
  const locationsWithSize = filteredLocations.value.filter(loc => loc.locSize && loc.locSize !== null);
  if (locationsWithSize.length === 0) return 'N/A';
  
  const totalSize = locationsWithSize.reduce((sum, loc) => {
    const parsed = parseLocationSize(loc.locSize);
    return sum + (parsed.unit === 'km' ? parsed.value : parsed.value / 1000);
  }, 0);
  
  return `${(totalSize / locationsWithSize.length).toFixed(1)}km`;
});

// Panel toggle functions
const toggleLayersPanel = () => {
  showLayersPanel.value = !showLayersPanel.value;
  if (showLayersPanel.value) {
    showOrgPanel.value = false;
  }
};

const toggleOrgPanel = () => {
  showOrgPanel.value = !showOrgPanel.value;
  if (showOrgPanel.value) {
    showLayersPanel.value = false;
  }
};

// Utility function to parse location size
const parseLocationSize = (locSize) => {
  if (!locSize) return { value: 0, unit: 'km' };
  
  const sizeStr = locSize.toString().toLowerCase().trim();
  const numMatch = sizeStr.match(/(\d+(?:\.\d+)?)/);
  const value = numMatch ? parseFloat(numMatch[1]) : 0;
  
  if (sizeStr.includes('m') && !sizeStr.includes('km')) {
    return { value: value, unit: 'm' };
  } else if (sizeStr.includes('km')) {
    return { value: value, unit: 'km' };
  } else {
    return { value: value, unit: 'km' };
  }
};

// Convert size to meters for Google Maps circle radius
const sizeToMeters = (locSize) => {
  const parsed = parseLocationSize(locSize);
  return parsed.unit === 'km' ? parsed.value * 1000 : parsed.value;
};

const fetchLocations = async () => {
  try {
    loading.value = true;
    console.log('Fetching locations from:', API_BASE_URL);
    
    const response = await fetch(API_BASE_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const locationsData = data.data || data;
    
    // Log API response for debugging
    logApiResponse(locationsData);
    
    // Mock Camera Locations for Demo
    const mockCameras = [
      {
        locType: 'camera',
        locdetail: { locationName: 'Main Entrance Cam', address: 'Headquarters', pincode: '123456' },
        locmark: { coordinates: [78.9629, 20.5937] }, // Near center
        orgLocation: { orgType: 'main tenant' }
      },
      {
        locType: 'camera',
        locdetail: { locationName: 'Warehouse Cam', address: 'Warehouse A', pincode: '654321' },
        locmark: { coordinates: [77.5946, 12.9716] }, // Bangalore
        orgLocation: { orgType: 'main tenant' }
      }
    ];
    
    return [...locationsData, ...mockCameras];
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  } finally {
    loading.value = false;
  }
};
const logApiResponse = (data) => {
  console.log('API Response Data:', data);
console.log("Sample orgLocation:", JSON.stringify(data[0].orgLocation, null, 2));

  const orgTypes = [...new Set(
    data.map(loc => {
      const ol = loc.orgLocation;
      if (!ol) return undefined;
      if (typeof ol === 'string') return undefined; // needs expansion
      const ot = ol.orgType;
      if (!ot) return undefined;
      return typeof ot === 'object' ? (ot.name ?? ot.id) : ot; // name if available, else id
    })
  )].filter(Boolean);

  console.warn(
    data.some(loc => typeof loc.orgLocation === 'string')
      ? 'orgLocation is a string ID. Expand relations in the API (e.g., ?fields=*,orgLocation.*,orgLocation.orgType.*).'
      : 'orgLocation is an object.'
  );

  console.log('Organization Types Found:', orgTypes);
};

const computeOrganizationCounts = () => {
  organizationCounts.value.all = locations.value.length;
  
  // Reset all counts
  organizationCounts.value.mainTenant = 0;
  organizationCounts.value.clientOrg = 0;
  organizationCounts.value.distributorOrg = 0;
  organizationCounts.value.contactOrg = 0;
  organizationCounts.value.tenantOrg = 0;
  
  locations.value.forEach(loc => {
    const orgType = loc.orgLocation?.orgType?.toLowerCase() || 'unknown';
    console.log('Organization type found:', orgType);
    
    switch (orgType) {
      case 'main tenant':
        organizationCounts.value.mainTenant++;
        break;
      case 'clientorg':
        organizationCounts.value.clientOrg++;
        break;
      case 'distributororg':
        organizationCounts.value.distributorOrg++;
        break;
      case 'contact':
        organizationCounts.value.contactOrg++;
        break;
      case 'tenantorg':
        organizationCounts.value.tenantOrg++;
        break;
      default:
        console.log('Unknown organization type:', orgType);
    }
  });
  
  console.log('Final Organization Counts:', organizationCounts.value);
};
// Initialize map
const initMap = async () => {
  if (!mapContainer.value) return;

  const loader = new Loader({
    apiKey,
    version: 'weekly',
  });

  try {
    await loader.load();
    map = new google.maps.Map(mapContainer.value, {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 5,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    infoWindow = new google.maps.InfoWindow();

    await loadAllLocations();
  } catch (error) {
    console.error('Error initializing Google Maps:', error);
  }
};

// Load all locations
const loadAllLocations = async () => {
  try {
    const allLocations = await fetchLocations();
    locations.value = allLocations;
    computeOrganizationCounts();
    addLocationMarkers();
    
    if (locationMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      locationMarkers.forEach(({ marker }) => {
        bounds.extend(marker.getPosition());
      });
      map.fitBounds(bounds, 100);
    }
  } catch (error) {
    console.error('Error loading locations:', error);
  }
};

// Clear all markers and circles from map
const clearMarkers = () => {
  locationMarkers.forEach(({ marker, label }) => {
    marker.setMap(null);
    if (label) label.setMap(null);
  });
  radiusCircles.forEach(({ circle }) => {
    circle.setMap(null);
  });
  locationMarkers = [];
  radiusCircles = [];
};

// Add location markers to map
const addLocationMarkers = () => {
  clearMarkers();
  
  filteredLocations.value.forEach(location => {
    const coordinates = location.locmark?.coordinates;
    if (!coordinates || coordinates[0] === null || coordinates[1] === null) {
      return;
    }
    
    const [lng, lat] = coordinates;
    const locationName = location.locdetail?.locationName || 'Unknown Location';
    const locationType = location.locType || 'unknown';
    const locSize = location.locSize;
    
    let colors = {
      markerFill: '#6B7280',
      markerStroke: '#4B5563',
      radiusFill: '#6B7280',
      radiusStroke: '#4B5563'
    };
    
    if (locationType === 'serviceable_area') {
      colors = {
        markerFill: '#8B5CF6',
        markerStroke: '#7C3AED',
        radiusFill: '#8B5CF6',
        radiusStroke: '#7C3AED'
      };
    } else if (locationType === 'branch') {
      colors = {
        markerFill: '#EF4444',
        markerStroke: '#DC2626',
        radiusFill: '#EF4444',
        radiusStroke: '#DC2626'
      };
    } else if (locationType === 'camera') {
      colors = {
        markerFill: '#10B981',
        markerStroke: '#059669',
        radiusFill: '#10B981',
        radiusStroke: '#059669'
      };
    }
    
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: shouldShowMarker(locationType) ? map : null,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: colors.markerFill,
        fillOpacity: 0.9,
        strokeColor: colors.markerStroke,
        strokeWeight: 3
      }
    });
    
    let radiusCircle = null;
    if (locSize && locSize !== null) {
      const radiusInMeters = sizeToMeters(locSize);
      const sizeInfo = parseLocationSize(locSize);
      
      if (radiusInMeters > 0) {
        radiusCircle = new google.maps.Circle({
          center: { lat, lng },
          radius: radiusInMeters,
          strokeColor: colors.radiusStroke,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: colors.radiusFill,
          fillOpacity: 0.2,
          map: layers.value.showRadius && shouldShowMarker(locationType) ? map : null,
          strokeDasharray: '8, 4'
        });
        
        google.maps.event.addListener(radiusCircle, 'mouseover', () => {
          infoWindow.setContent(`Coverage: ${sizeInfo.value} ${sizeInfo.unit}`);
          infoWindow.setPosition({ lat, lng });
          infoWindow.open(map);
        });
        
        google.maps.event.addListener(radiusCircle, 'mouseout', () => {
          infoWindow.close();
        });
        
        radiusCircles.push({
          circle: radiusCircle,
          type: locationType,
          size: sizeInfo
        });
      }
    }
    
    const sizeInfo = parseLocationSize(locSize);
    const popupContent = `
      <div class="modern-popup">
        <div class="popup-header">
          <h4>${locationName}</h4>
          <span class="location-type ${locationType}">${locationType.replace('_', ' ').toUpperCase()}</span>
        </div>
        <div class="popup-body">
          <div class="popup-item">
            <span class="popup-label">📍 Address:</span>
            <span class="popup-value">${location.locdetail?.address || 'N/A'}</span>
          </div>
          <div class="popup-item">
            <span class="popup-label">📮 Pincode:</span>
            <span class="popup-value">${location.locdetail?.pincode || 'N/A'}</span>
          </div>
          ${locSize ? `
            <div class="popup-item coverage">
              <span class="popup-label">🎯 Coverage:</span>
              <span class="popup-value coverage-value">${sizeInfo.value} ${sizeInfo.unit}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    marker.addListener('click', () => {
      infoWindow.setContent(popupContent);
      infoWindow.open(map, marker);
    });
    
    // const labelDiv = document.createElement('div');
    // labelDiv.className = `label-content ${locationType}`;
    // labelDiv.textContent = layers.value.showLocationNames ? (locSize ? `${locationName} (${sizeInfo.value}${sizeInfo.unit})` : locationName) : '';
    // labelDiv.style.cssText = `
    //   background: rgba(255, 255, 255, 0.95);
    //   backdrop-filter: blur(10px);
    //   color: #1f2937;
    //   font-weight: 600;
    //   font-size: 11px;
    //   padding: 6px 10px;
    //   border-radius: 8px;
    //   text-align: center;
    //   white-space: nowrap;
    //   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    //   border: 1px solid rgba(255, 255, 255, 0.2);
    //   max-width: 150px;
    //   overflow: hidden;
    //   text-overflow: ellipsis;
    //   ${locationType === 'serviceable_area' ? 'border-left: 3px solid #8b5cf6;' : ''}
    //   ${locationType === 'branch' ? 'border-left: 3px solid #ef4444;' : ''}
    //   ${!layers.value.showLocationNames ? 'display: none;' : ''}
    // `;
    
    // const label = new google.maps.OverlayView();
    // label.onAdd = function() {
    //   const pane = this.getPanes().floatPane;
    //   pane.appendChild(labelDiv);
    // };
    // label.draw = function() {
    //   const projection = this.getProjection();
    //   const position = projection.fromLatLngToDivPixel(new google.maps.LatLng(lat, lng));
    //   labelDiv.style.left = `${position.x - 80}px`;
    //   labelDiv.style.top = `${position.y - 15}px`;
    // };
    // label.onRemove = function() {
    //   if (labelDiv.parentNode) {
    //     labelDiv.parentNode.removeChild(labelDiv);
    //   }
    // };
    // if (shouldShowMarker(locationType) && layers.value.showLocationNames) {
    //   label.setMap(map);
    // }
    
    // locationMarkers.push({
    //   marker,
    //   type: locationType,
    //   radiusCircle,
    //   hasRadius: radiusCircle !== null,
    //   label
    // });
  });
  
  console.log(`Added ${locationMarkers.length} markers, ${radiusCircles.length} radius circles`);
};

// Check if marker should be shown based on current layer settings
const shouldShowMarker = (locationType) => {
  if (locationType === 'serviceable_area') {
    return layers.value.serviceableAreas;
  } else if (locationType === 'branch') {
    return layers.value.branches;
  } else if (locationType === 'camera') {
    return layers.value.cameras;
  }
  return false;
};

// Toggle layer visibility
const toggleLayer = (layerName) => {
  if (layerName === 'showRadius') {
    radiusCircles.forEach(({ circle, type }) => {
      if (circle && shouldShowMarker(type)) {
        circle.setMap(layers.value.showRadius ? map : null);
      }
    });
    return;
  }
  
  if (layerName === 'showLocationNames') {
    locationMarkers.forEach(({ label }) => {
      if (label) {
        label.setMap(layers.value.showLocationNames ? map : null);
        // Update label content dynamically
        const labelDiv = label.getPanes().floatPane.querySelector('.label-content');
        if (labelDiv) {
          const location = locations.value.find(loc => loc.locmark?.coordinates[0] === labelDiv._lng && loc.locmark?.coordinates[1] === labelDiv._lat);
          const sizeInfo = location ? parseLocationSize(location.locSize) : { value: 0, unit: 'km' };
          labelDiv.textContent = layers.value.showLocationNames ? (location.locSize ? `${location.locdetail?.locationName || 'Unknown'} (${sizeInfo.value}${sizeInfo.unit})` : location.locdetail?.locationName || 'Unknown') : '';
          labelDiv.style.display = layers.value.showLocationNames ? 'block' : 'none';
        }
      }
    });
    return;
  }
  
  locationMarkers.forEach(({ marker, type, radiusCircle, label }) => {
    if (layerName === 'serviceableAreas' && type === 'serviceable_area') {
      marker.setMap(layers.value.serviceableAreas ? map : null);
      label.setMap(layers.value.serviceableAreas && layers.value.showLocationNames ? map : null);
      if (radiusCircle && layers.value.showRadius) {
        radiusCircle.setMap(layers.value.serviceableAreas ? map : null);
      }
    } else if (layerName === 'branches' && type === 'branch') {
      marker.setMap(layers.value.branches ? map : null);
      label.setMap(layers.value.branches && layers.value.showLocationNames ? map : null);
      if (radiusCircle && layers.value.showRadius) {
        radiusCircle.setMap(layers.value.branches ? map : null);
      }
    }
  });
};

// Map control functions
const fitAllMarkers = () => {
  if (locationMarkers.length > 0) {
    const bounds = new google.maps.LatLngBounds();
    locationMarkers.forEach(({ marker }) => {
      bounds.extend(marker.getPosition());
    });
    map.fitBounds(bounds, 100);
  }
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    mapContainer.value.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// Watch for changes in filtered locations
watch(filteredLocations, () => {
  addLocationMarkers();
}, { deep: true });

// Lifecycle hooks
onMounted(async () => {
  await initMap();
});

onUnmounted(() => {
  if (map) {
    locationMarkers.forEach(({ marker, label }) => {
      marker.setMap(null);
      if (label) label.setMap(null);
    });
    radiusCircles.forEach(({ circle }) => {
      circle.setMap(null);
    });
    map = null;
  }
});
</script>
<style scoped>
.control-icon.label {
  background: rgba(59, 130, 246, 0.1);
  color: #68ade1;
}
.map-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - 120px);
  min-height: 500px;
  background: linear-gradient(135deg, #68ade1 0%, #68ade1 100%);
}

.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

#map {
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Top Statistics Bar */
.top-stats-bar {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 380px;
  z-index: 1000;
  pointer-events: none;
}

.stats-container {
  display: flex;
  gap: 16px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  pointer-events: auto;
  min-width: 140px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #68ade1, #68ade1);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Right Control Panel */
.right-control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 340px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Search Container */
.search-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  color: #1f2937;
  background: white;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Control Dropdown */
.control-dropdown {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-active {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.dropdown-trigger {
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #68ade1, #68ade1);
  color: white;
  transition: all 0.3s ease;
}

.dropdown-trigger:hover {
  background: linear-gradient(135deg, #68ade1, #68ade1);
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.trigger-icon {
  font-size: 18px;
}

.trigger-text {
  font-weight: 600;
  font-size: 14px;
}

.trigger-counts {
  display: flex;
  gap: 6px;
  margin-left: auto;
  margin-right: 12px;
}

.count-item {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
}

.count-item.serviceable {
  background: #68ade1;
}

.count-item.branches {
  background: rgba(239, 68, 68, 0.3);
}

.count-item.total {
  background: rgba(255, 255, 255, 0.3);
}

.dropdown-arrow {
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
}

.arrow-up {
  transform: rotate(180deg);
}

.dropdown-content {
  background: white;
}

.dropdown-section {
  padding: 20px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

/* Control Row */
.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.control-row:last-child {
  border-bottom: none;
}

.control-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.control-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.control-icon.serviceable-area {
  background: rgba(139, 92, 246, 0.1);
  color: #68ade1;
}

.control-icon.branch {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.control-icon.radius {
  background: rgba(59, 130, 246, 0.1);
  color: #68ade1;
}

.control-details {
  display: flex;
  flex-direction: column;
}

.control-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
}

.control-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
}

.control-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-count {
  background: linear-gradient(135deg, #68ade1, #68ade1);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 12px;
  min-width: 28px;
  text-align: center;
}

/* Modern Switch */
.modern-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.modern-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #cbd5e1;
  transition: 0.3s;
  border-radius: 24px;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .switch-slider {
  background: linear-gradient(135deg, #68ade1, #68ade1);
}

input:checked + .switch-slider:before {
  transform: translateX(24px);
}

/* Organization Options */
.org-option {
  cursor: pointer;
  display: block;
  margin-bottom: 12px;
}

.org-option:last-child {
  margin-bottom: 0;
}

.org-option input {
  display: none;
}

.org-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  transition: all 0.3s ease;
}

.option-active .org-card {
  border-color: #68ade1;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.org-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.org-icon.all {
  background: linear-gradient(135deg, #10b981, #059669);
}

.org-icon.main-tenant {
  background: linear-gradient(135deg, #68ade1, #68ade1);
}

.org-icon.client-org {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.org-icon.distributor-org {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.org-icon.contact-org {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.org-details {
  flex: 1;
}

.org-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
  margin-bottom: 2px;
}

.org-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
}

.org-count {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 12px;
  min-width: 36px;
  text-align: center;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: #374151;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  background: white;
  color: #667eea;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #6b7280;
  font-weight: 500;
}

/* Custom Google Maps Styles */
.modern-popup {

  min-width: 200px;
}

.popup-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.popup-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.location-type {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.location-type.serviceable_area {
  background: rgba(139, 92, 246, 0.1);
  color: #68ade1;
}

.location-type.branch {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.popup-body {
  padding: 16px;
}

.popup-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.popup-item:last-child {
  margin-bottom: 0;
}

.popup-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  min-width: 80px;
}

.popup-value {
  font-size: 12px;
  color: #1f2937;
  flex: 1;
}

.coverage-value {
  font-weight: 600;
  color: #667eea;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .right-control-panel {
    width: 300px;
  }
  
  .top-stats-bar {
    right: 320px;
  }
}

@media (max-width: 768px) {
  .top-stats-bar {
    left: 10px;
    right: 10px;
    top: 10px;
  }
  
  .stats-container {
    justify-content: center;
  }
  
  .stat-card {
    min-width: 120px;
    padding: 12px 16px;
  }
  
  .right-control-panel {
    top: 120px;
    left: 10px;
    right: 10px;
    width: auto;
  }
  
  .control-dropdown {
    margin-bottom: 8px;
  }
}

@media (max-width: 480px) {
  .stat-card {
    min-width: 100px;
    padding: 10px 12px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .stat-icon {
    font-size: 20px;
    width: 32px;
    height: 32px;
  }
  
  .trigger-counts {
    display: none;
  }
}
</style>