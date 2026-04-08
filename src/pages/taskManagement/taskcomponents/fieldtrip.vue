<template>
  <div class="field-trips-container">
    <div class="main-content" :class="{ 'with-filter': showFilters }">
      <!-- Main Content with Common Components -->
      <DataTableWrapper
        v-model:searchQuery="searchQuery"
        @update:searchQuery="handleSearchUpdate"
        :total-items="totalItems"
      >
        <!-- Toolbar Actions Slot -->
        <template v-slot:toolbar-actions>
          <div class="wo-counters" aria-label="Work Order Status Counters">
            <div
              class="wo-pill total"
              role="button"
              aria-live="polite"
              @click="handleFilterByStatus('')"
              :class="{ active: filters.status === '' }"
            >
              <ListChecks class="wo-icon" aria-hidden="true" />
              <span class="wo-label">Total</span>
              <span class="wo-count">{{ fieldTripCounts.total }}</span>
            </div>
            <div
              class="wo-pill pending"
              role="button"
              aria-live="polite"
              @click="handleFilterByStatus('pending')"
              :class="{ active: filters.status === 'pending' }"
            >
              <Clock class="wo-icon" aria-hidden="true" />
              <span class="wo-label">Pending</span>
              <span class="wo-count">{{ fieldTripCounts.pending }}</span>
            </div>
            <div
              class="wo-pill overdue"
              role="button"
              aria-live="polite"
              @click="handleFilterByStatus('overdue')"
              :class="{ active: filters.status === 'overdue' }"
            >
              <AlertTriangle class="wo-icon" aria-hidden="true" />
              <span class="wo-label">Overdue</span>
              <span class="wo-count">{{ fieldTripCounts.overdue }}</span>
            </div>
            <div
              class="wo-pill completed"
              role="button"
              aria-live="polite"
              @click="handleFilterByStatus('completed')"
              :class="{ active: filters.status === 'completed' }"
            >
              <CheckCircle class="wo-icon" aria-hidden="true" />
              <span class="wo-label">Completed</span>
              <span class="wo-count">{{ fieldTripCounts.completed }}</span>
            </div>
          </div>
          <BaseButton
            variant="secondary"
            text="Filters"
            :leftIcon="Filter"
            :badge="hasActiveFilters ? '!' : null"
            @click="showFilters = !showFilters"
          />
          <BaseButton
            v-if="selectedFieldTripIds.length > 0"
            variant="danger"
            :text="`Delete (${selectedFieldTripIds.length})`"
            :leftIcon="Trash2"
            @click="deleteSelectedFieldTrips"
          />
          <!-- <BaseButton
            variant="primary"
            text="Create Field Trip"
            :leftIcon="Plus"
            @click="navigateToAddFieldTrip"
          /> -->
          <DropdownButton
            text="Export"
            :leftIcon="Download"
            :items="exportItems"
            @itemClick="handleExport"
          />
        </template>

        <!-- Main Content Area -->
        <div class="content-area">
          <SkeletonLoader
            v-show="loading"
            variant="table-body-only"
            :rows="10"
            :columns="8"
          />

          <EmptyState
            v-show="!loading && !error && fieldTrips.length === 0"
            title="No Field Trips found"
            message="Try adjusting your filters or create a new field trip"
            :primaryAction="{ text: 'Create Field Trip', icon: Plus }"
            :secondaryAction="
              hasActiveFilters ? { text: 'Clear Filters', icon: X } : null
            "
            @primaryAction="navigateToAddFieldTrip"
            @secondaryAction="clearAllFilters"
          />

          <FieldTripTable
            v-show="!loading && !error && fieldTrips.length > 0"
            :fieldTrips="fieldTrips"
            :selectedFieldTripIds="selectedFieldTripIds"
            :expandedFieldTripId="expandedFieldTripId"
            :sortBy="sortBy"
            :sortDirection="sortDirection"
            @toggleSelectAll="toggleSelectAll"
            @toggleFieldTripSelection="toggleFieldTripSelection"
            @requestSort="requestSort"
            @viewFieldTripDetails="viewFieldTripDetails"
            @toggleExpandedDetails="toggleExpandedDetails"
            @showRouteMap="handleShowRouteMap"
          />

          <ErrorState
            v-show="!loading && error"
            title="Unable to load field trips"
            :message="error"
            @retry="fetchFieldTrips"
          />
        </div>

        <!-- Pagination Slot -->
        <template v-slot:pagination>
          <CustomPagination
            v-model:page="currentPage"
            v-model:itemsPerPage="itemsPerPage"
            :total-items="totalItems"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>
    </div>

    <!-- Filter Panel -->
    <FilterPanel
      :show="showFilters"
      title="Field Trip Filters"
      :hasFilters="hasActiveFilters"
      @close="showFilters = false"
      @clear="clearAllFilters"
      @apply="applyFilters"
    >
      <!-- Field trip specific filters -->
      <FilterSection title="Month" :icon="Calendar">
        <FilterMonth
          v-model="filters.month"
          @change="applyFilters"
          @clear="clearMonthFilter"
        />
      </FilterSection>

      <FilterSection title="Trip Type" :icon="MapPin">
        <FilterSelect
          v-model="filters.tripType"
          :options="tripTypeOptions"
          placeholder="All Trip Types"
          @change="applyFilters"
        />
      </FilterSection>

      <FilterSection title="Status" :icon="Tag">
        <FilterSelect
          v-model="filters.status"
          :options="statusOptions"
          placeholder="All Statuses"
          @change="applyFilters"
        />
      </FilterSection>
    </FilterPanel>

    <!-- Map Modal -->
    <Teleport to="body">
      <div v-if="showMapModal" class="map-modal">
        <div class="map-modal-content">
          <div class="modal-header">
            <h3>Route Map for {{ selectedFieldTrip?.title }}</h3>
            <BaseButton
              variant="ghost"
              :iconOnly="true"
              @click="showMapModal = false"
            >
              <X size="24" />
            </BaseButton>
          </div>
          <div id="map-container" style="height: 600px; width: 100%"></div>
        </div>
      </div>
    </Teleport>

    <!-- Toast Container -->
    <ToastContainer ref="toastContainer" />
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import {
  Filter,
  Trash2,
  Plus,
  Download,
  Calendar,
  Tag,
  X,
  ListChecks,
  Clock,
  AlertTriangle,
  CheckCircle,
  MapPin,
} from "lucide-vue-next";
import { Loader } from "@googlemaps/js-api-loader";

// Import composables
import { useFieldTripApi } from "@/composables/workorder/fieldTrips/useFieldTripApi";
import { useFieldTripExport } from "@/composables/workorder/fieldTrips/useFieldTripExport";
import { usefieldTripsFilters } from "@/composables/workorder/fieldTrips/useFieldTripFilters";
import { useToast } from "@/composables/workorder/tasks/userToats";

// Import components
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import FilterPanel from "@/components/common/filters/FilterPanel.vue";
import FilterSection from "@/components/common/filters/FilterSection.vue";
import FilterSelect from "@/components/common/filters/FilterSelect.vue";
import FilterMonth from "@/components/common/filters/FilterMonth.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DropdownButton from "@/components/common/buttons/DropdownButton.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import FieldTripTable from "@/components/tasks_Components/table/fieldTripTable.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import ToastContainer from "@/components/common/notifications/ToastContainer.vue";

// Initialize router
const router = useRouter();

// Initialize composables
const fieldTripApi = useFieldTripApi();
const { exportFieldTrips } = useFieldTripExport();
const exportFieldTripsFilters = usefieldTripsFilters();

// Destructure composable returns
const {
  fieldTrips,
  formTemplates,
  loading,
  error,
  totalItems,
  fieldTripCounts,
  fetchFieldTrips,
  fetchFormTemplates,
  deleteSelectedFieldTrips: apiDeleteSelectedFieldTrips,
} = fieldTripApi;

const {
  filters,
  searchQuery,
  hasActiveFilters,
  buildFieldTripFilterParams,
  filterByStatus,
  clearAllFilters: clearFilters,
  clearMonthFilter: clearMonth,
  debouncedApplyFilters,
} = exportFieldTripsFilters;

// Component state
const showFilters = ref(false);
const expandedFieldTripId = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(25);
const selectedFieldTripIds = ref([]);
const sortBy = ref("from");
const sortDirection = ref("desc");
const toastContainer = ref(null);
const showMapModal = ref(false);
const selectedFieldTrip = ref(null);

// Export items configuration
const exportItems = [
  { label: "Export to Excel", value: "excel", icon: Download },
  { label: "Export to CSV", value: "csv", icon: Download },
  { label: "Export to PDF", value: "pdf", icon: Download },
];

const tripTypeOptions = computed(() => [
  { label: "Client Visit", value: "Client Visit" },
  { label: "Delivery", value: "Delivery" },
  { label: "Site Inspection", value: "Site Inspection" },
  { label: "Meeting", value: "Meeting" },
  { label: "Other", value: "Other" },
]);

const statusOptions = computed(() => [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "inprogress" },
  { label: "Completed", value: "completed" },
  { label: "Overdue", value: "overdue" },
]);

// Methods
const handleFilterByStatus = (status) => {
  filterByStatus(status);
  currentPage.value = 1;
  applyFilters();
};

const applyFilters = () => {
  const filterParams = buildFieldTripFilterParams();
  fetchFieldTrips({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: sortBy.value,
    sortDirection: sortDirection.value,
    filters: filterParams,
  });
};

const clearAllFilters = () => {
  clearFilters();
  selectedFieldTripIds.value = [];
  sortBy.value = "from";
  sortDirection.value = "desc";
  currentPage.value = 1;
  applyFilters();
};

const clearMonthFilter = () => {
  clearMonth();
  applyFilters();
};

const toggleFieldTripSelection = (fieldTripId) => {
  if (selectedFieldTripIds.value.includes(fieldTripId)) {
    selectedFieldTripIds.value = selectedFieldTripIds.value.filter(
      (id) => id !== fieldTripId,
    );
  } else {
    selectedFieldTripIds.value.push(fieldTripId);
  }
};

const toggleSelectAll = () => {
  const allSelected =
    fieldTrips.value.length > 0 &&
    selectedFieldTripIds.value.length === fieldTrips.value.length;
  if (allSelected) {
    selectedFieldTripIds.value = [];
  } else {
    selectedFieldTripIds.value = fieldTrips.value.map((trip) => trip.id);
  }
};

const deleteSelectedFieldTrips = async () => {
  if (selectedFieldTripIds.value.length === 0) {
    toastContainer.value?.warning("No field trips selected for deletion.");
    return;
  }

  const success = await apiDeleteSelectedFieldTrips(selectedFieldTripIds.value);
  if (success) {
    selectedFieldTripIds.value = [];
    toastContainer.value?.success("Field trips deleted successfully!");
    applyFilters();
  } else {
    toastContainer.value?.error(
      "Failed to delete field trips. Please try again.",
    );
  }
};

const viewFieldTripDetails = (fieldTrip) => {
  router.push(
    `/taskManagement/taskcomponents/field-trip-details/${fieldTrip.id}`,
  );
};

const toggleExpandedDetails = (fieldTripId) => {
  expandedFieldTripId.value =
    expandedFieldTripId.value === fieldTripId ? null : fieldTripId;
};

const navigateToAddFieldTrip = () => {
  router.push("/taskManagement/taskcomponents/AddFieldTripForm");
};

const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  const filterParams = buildFieldTripFilterParams();
  fetchFieldTrips({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: sortBy.value,
    sortDirection: sortDirection.value,
    filters: filterParams,
    skipAggregateCount: true,
  });
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1;
  const filterParams = buildFieldTripFilterParams();
  fetchFieldTrips({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: sortBy.value,
    sortDirection: sortDirection.value,
    filters: filterParams,
  });
};

const requestSort = (field) => {
  if (sortBy.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortDirection.value = "desc";
  }

  currentPage.value = 1;

  const filterParams = buildFieldTripFilterParams();
  fetchFieldTrips({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: sortBy.value,
    sortDirection: sortDirection.value,
    filters: filterParams,
    skipAggregateCount: true,
  });
};

const handleExport = (item) => {
  const filterParams = buildFieldTripFilterParams();
  exportFieldTrips(item.value, filterParams);
};

const handleSearchUpdate = (newSearchQuery) => {
  searchQuery.value = newSearchQuery;
  currentPage.value = 1;
  debouncedApplyFilters(applyFilters);
};

const handleShowRouteMap = (fieldTrip) => {
  selectedFieldTrip.value = fieldTrip;
  showMapModal.value = true;
};

// Enhanced loadGoogleMap function with proper polyline decoding and route display
const loadGoogleMap = () => {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: "weekly",
    libraries: ["geometry"],
  });

  loader
    .load()
    .then((google) => {
      const mapContainer = document.getElementById("map-container");
      if (!mapContainer) {
        console.error("Map container not found");
        return;
      }

      const map = new google.maps.Map(mapContainer, {
        zoom: 12,
        center: {
          lat: selectedFieldTrip.value.lat || 0,
          lng: selectedFieldTrip.value.lng || 0,
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "all",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#dfe6e9" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#a3ccff" }],
          },
        ],
      });

      // Function to decode polyline (JavaScript equivalent of your Dart function)
      const decodePolyline = (encoded) => {
        const points = [];
        let index = 0;
        const len = encoded.length;
        let lat = 0;
        let lng = 0;

        while (index < len) {
          let b;
          let shift = 0;
          let result = 0;

          // Decode latitude
          do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
          } while (b >= 0x20);

          const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
          lat += dlat;

          shift = 0;
          result = 0;

          // Decode longitude
          do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
          } while (b >= 0x20);

          const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
          lng += dlng;

          points.push(new google.maps.LatLng(lat / 1e5, lng / 1e5));
        }

        return points;
      };

      if (selectedFieldTrip.value?.routePolyline) {
        try {
          // Decrypt the routePolyline first
          const decryptedPolyline = atob(selectedFieldTrip.value.routePolyline);
          console.log("Decrypted polyline:", decryptedPolyline);

          // Decode the polyline to get array of LatLng points
          const decodedPath = decodePolyline(decryptedPolyline);

          if (decodedPath.length === 0) {
            throw new Error("No points found in polyline");
          }

          console.log("Decoded path points:", decodedPath.length);

          // Get start and end points
          const startPoint = decodedPath[0];
          const endPoint = decodedPath[decodedPath.length - 1];

          // Create start marker (Green)
          const startMarker = new google.maps.Marker({
            position: startPoint,
            map: map,
            icon: {
              url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
              scaledSize: new google.maps.Size(32, 32),
            },
            title: "Start Point",
            zIndex: 1000,
          });

          // Create end marker (Red)
          const endMarker = new google.maps.Marker({
            position: endPoint,
            map: map,
            icon: {
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new google.maps.Size(32, 32),
            },
            title: "End Point",
            zIndex: 1000,
          });

          // Add info windows for start and end markers
          const startInfoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h4 style="margin: 0 0 5px 0; color: #059669;">Start Point</h4>
                <p style="margin: 0; font-size: 12px;">
                  Lat: ${startPoint.lat().toFixed(6)}<br>
                  Lng: ${startPoint.lng().toFixed(6)}
                </p>
              </div>
            `,
          });

          const endInfoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h4 style="margin: 0 0 5px 0; color: #dc2626;">End Point</h4>
                <p style="margin: 0; font-size: 12px;">
                  Lat: ${endPoint.lat().toFixed(6)}<br>
                  Lng: ${endPoint.lng().toFixed(6)}
                </p>
              </div>
            `,
          });

          // Add click listeners to markers
          startMarker.addListener("click", () => {
            endInfoWindow.close();
            startInfoWindow.open(map, startMarker);
          });

          endMarker.addListener("click", () => {
            startInfoWindow.close();
            endInfoWindow.open(map, endMarker);
          });

          // Create the polyline (route path) - Enhanced visibility
          const polyline = new google.maps.Polyline({
            path: decodedPath,
            geodesic: true,
            strokeColor: "#2563eb",
            strokeOpacity: 0.8,
            strokeWeight: 4,
            icons: [
              {
                icon: {
                  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 5,
                  strokeColor: "#2563eb",
                  strokeWeight: 1,
                  fillColor: "#2563eb",
                  fillOpacity: 1,
                },
                offset: "0%",
                repeat: "80px",
              },
            ],
          });

          // Add a shadow/outline effect for even better visibility
          const polylineOutline = new google.maps.Polyline({
            path: decodedPath,
            geodesic: true,
            strokeColor: "#000000", // Black outline
            strokeOpacity: 0.3,
            strokeWeight: 12, // Slightly thicker than main line
            zIndex: 1, // Behind the main line
          });

          polylineOutline.setMap(map);
          polyline.setMap(map);

          polyline.setMap(map);

          // Add intermediate waypoint markers (optional - every 10th point)
          const waypointInterval = Math.max(
            1,
            Math.floor(decodedPath.length / 10),
          );
          for (
            let i = waypointInterval;
            i < decodedPath.length - 1;
            i += waypointInterval
          ) {
            const waypoint = decodedPath[i];
            new google.maps.Marker({
              position: waypoint,
              map: map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 4,
                strokeColor: "#2563eb",
                strokeWeight: 2,
                fillColor: "#ffffff",
                fillOpacity: 1,
              },
              title: `Waypoint ${Math.floor(i / waypointInterval)}`,
            });
          }

          // Fit map to show the entire route
          const bounds = new google.maps.LatLngBounds();
          decodedPath.forEach((point) => bounds.extend(point));
          map.fitBounds(bounds);

          // Add some padding to the bounds
          const padding = { top: 50, right: 50, bottom: 50, left: 50 };
          map.fitBounds(bounds, padding);

          // Add route information
          const routeDistance = selectedFieldTrip.value.distanceKm || "Unknown";
          const routeInfoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; max-width: 250px;">
                <h3 style="margin: 0 0 10px 0; color: #1e293b;">${selectedFieldTrip.value.title || "Field Trip Route"}</h3>
                <div style="display: flex; flex-direction: column; gap: 5px; font-size: 14px;">
                  <div><strong>Trip Type:</strong> ${selectedFieldTrip.value.tripType || "N/A"}</div>
                  <div><strong>Purpose:</strong> ${selectedFieldTrip.value.purpose || "N/A"}</div>
                  <div><strong>Distance:</strong> ${routeDistance} km</div>
                  <div><strong>Status:</strong> 
                    <span style="
                      padding: 2px 8px; 
                      border-radius: 12px; 
                      font-size: 12px; 
                      background: ${getStatusColor(selectedFieldTrip.value.status)};
                      color: white;
                    ">
                      ${selectedFieldTrip.value.status || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            `,
            position: bounds.getCenter(),
          });

          // Show route info by default
          routeInfoWindow.open(map);

          // Helper function for status colors
          function getStatusColor(status) {
            switch (status?.toLowerCase()) {
              case "completed":
                return "#10b981";
              case "pending":
                return "#f59e0b";
              case "overdue":
                return "#ef4444";
              case "inprogress":
                return "#3b82f6";
              default:
                return "#6b7280";
            }
          }

          console.log("Route displayed successfully");
          toastContainer.value?.success("Route loaded successfully!");
        } catch (e) {
          console.error("Error processing polyline:", e);
          toastContainer.value?.error(`Failed to decode route: ${e.message}`);

          // Fallback: Show just the start/end points if available
          if (selectedFieldTrip.value.lat && selectedFieldTrip.value.lng) {
            const fallbackPosition = new google.maps.LatLng(
              selectedFieldTrip.value.lat,
              selectedFieldTrip.value.lng,
            );

            new google.maps.Marker({
              position: fallbackPosition,
              map: map,
              icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              },
              title: "Field Trip Location",
            });

            map.setCenter(fallbackPosition);
            map.setZoom(15);
          }
        }
      } else {
        toastContainer.value?.warning("No route data available for this trip.");

        // Show default location if coordinates are available
        if (selectedFieldTrip.value.lat && selectedFieldTrip.value.lng) {
          const defaultPosition = new google.maps.LatLng(
            selectedFieldTrip.value.lat,
            selectedFieldTrip.value.lng,
          );

          new google.maps.Marker({
            position: defaultPosition,
            map: map,
            title: selectedFieldTrip.value.title || "Field Trip Location",
          });

          map.setCenter(defaultPosition);
          map.setZoom(15);
        }
      }
    })
    .catch((e) => {
      console.error("Error loading Google Maps:", e);
      toastContainer.value?.error("Failed to load map. Please try again.");
    });
};

watch(showMapModal, (newVal) => {
  if (newVal) {
    nextTick(() => {
      loadGoogleMap();
    });
  }
});

onBeforeMount(async () => {
  await fetchFormTemplates();
  // Load data without filters initially
  fetchFieldTrips({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: sortBy.value,
    sortDirection: sortDirection.value,
    filters: {}, // Empty filters on initial load
  });
});
</script>

<style scoped>
.field-trips-container {
  height: 100vh;
  display: flex;
  padding: 1rem;
  overflow: hidden;
  background-color: #f8f8fc;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-right 0.3s ease;
}

.main-content.with-filter {
  margin-right: 350px;
}

.content-area {
  position: relative;
  flex: 1;
}

.map-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.map-modal-content {
  background: white;
  border-radius: 12px;
  width: 80%;
  max-width: 1200px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

@media (max-width: 1024px) {
  .main-content.with-filter {
    margin-right: 0;
  }

  .map-modal-content {
    width: 95%;
  }
}
.wo-counters {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 12px;
  flex-wrap: wrap;
}

.wo-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  line-height: 1;
  border: 1px solid transparent;
  cursor: pointer; /* Indicate clickable */
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.wo-pill.active {
  border-color: #3b82f6; /* Highlight active filter */
  background-color: #e0f2fe;
}

.wo-icon {
  width: 16px;
  height: 16px;
}

.wo-label {
  font-weight: 600;
}

.wo-count {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.wo-pill.total {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #e2e8f0;
}

.wo-pill.total.active {
  background: #e0f2fe;
  border-color: #3b82f6;
}

.wo-pill.pending {
  background: #fff7ed;
  color: #9a3412;
  border-color: #fed7aa;
}

.wo-pill.pending.active {
  background: #ffedd5;
  border-color: #f97316;
}

.wo-pill.overdue {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.wo-pill.overdue.active {
  background: #fee2e2;
  border-color: #ef4444;
}

.wo-pill.completed {
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.wo-pill.completed.active {
  background: #d1fae5;
  border-color: #10b981;
}
</style>
