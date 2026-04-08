import { ref, computed } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

export function useLocationApi() {
  const locationTypes = ref([]);
  const allLocationsData = ref([]);
  const selectedLocType = ref(null);
  const selectedClientBranchId = ref(null);
  const selectedClientBranchSize = ref(null);
  const selectedClientLat = ref(null);
  const selectedClientLng = ref(null);
  const mapContainer = ref(null);
  const reverseGeocodedAddress = ref(null);
  const currentGpsFieldKey = ref("");
  const locationError = ref("");
  const showLocationSelectorDialog = ref(false);

  let mapInstance = null;
  let markerInstance = null;
  const geocoder = ref(null);

  const GOOGLE_MAPS_API_KEY = "AIzaSyCwp-gBFBiutZVlE-a-84hHnA2XeMRGE1g";

  const token = ref(authService.getToken());
  const tenantId = computed(() => currentUserTenant.getTenantId());

  const locationBranches = computed(() => {
    if (!selectedLocType.value || !allLocationsData.value) return [];
    const filtered = allLocationsData.value.filter(
      (loc) => loc.locType === selectedLocType.value,
    );
    return filtered.map((loc) => ({
      title:
        loc.locdetail?.locationName ||
        loc.orgLocation?.orgName ||
        `ID: ${loc.id}`,
      value: loc.id,
      data: loc,
    }));
  });

  const displayLocationDetails = computed(() => {
    if (selectedLocType.value && locationBranches.value.length > 0) {
      const location = locationBranches.value[0].data;
      return {
        ...location,
        locmark: {
          ...location.locmark,
          lat: location.locmark.coordinates[1],
          lng: location.locmark.coordinates[0],
        },
      };
    }
    // Fallback when dialog reopens without a type selected: show last applied lat/lng if available
    if (selectedClientLat.value != null && selectedClientLng.value != null) {
      return {
        id: selectedClientBranchId.value,
        locSize: selectedClientBranchSize.value,
        locdetail: {},
        locmark: {
          lat: selectedClientLat.value,
          lng: selectedClientLng.value,
        },
      };
    }
    return null;
  });

  const fetchLocationManagementData = async (clientOrgId) => {
    if (!token.value || !tenantId.value || !clientOrgId) {
      locationError.value =
        "Missing authentication or organization details to fetch locations.";
      return;
    }

    try {
      const params = new URLSearchParams([
        ["limit", "-1"],
        ["fields[]", "locType"],
        ["fields[]", "locmark"],
        ["fields[]", "locdetail"],
        ["fields[]", "locSize"],
        ["fields[]", "orgLocation.orgName"],
        ["fields[]", "orgLocation.id"],
        ["fields[]", "tenant.tenantId"],
        ["fields[]", "id"],
        ["filter[_and][0][_and][0][orgLocation][id][_eq]", clientOrgId],
        ["filter[_and][1][status][_neq]", "archived"],
      ]).toString();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/locationManagement?${params}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
        },
      );

      if (!response.ok)
        throw new Error("Failed to fetch location management data.");

      const data = await response.json();
      allLocationsData.value = data.data;

      const uniqueLocTypes = [...new Set(data.data.map((loc) => loc.locType))];
      locationTypes.value = uniqueLocTypes.map((type) => ({
        title: type,
        value: type,
      }));
    } catch (err) {
      console.error("Error fetching location management data:", err);
      locationError.value =
        err.message || "Failed to fetch locations. Please try again.";
    }
  };

  const openLocationSelector = async (fieldKey, clientOrgId) => {
    currentGpsFieldKey.value = fieldKey;
    showLocationSelectorDialog.value = true;
    reverseGeocodedAddress.value = null;
    locationError.value = "";

    // Clear existing map instance; marker will recreate on open
    if (mapInstance && markerInstance) {
      try {
        markerInstance.setMap(null);
      } catch {}
      mapInstance = null;
      markerInstance = null;
    }

    if (!clientOrgId) {
      locationError.value =
        "Please select a client before choosing a location.";
      return;
    }

    await fetchLocationManagementData(clientOrgId);
  };

  const closeLocationSelector = () => {
    showLocationSelectorDialog.value = false;
    reverseGeocodedAddress.value = null;
    currentGpsFieldKey.value = "";
    if (mapInstance && markerInstance) {
      try {
        markerInstance.setMap(null);
      } catch {}
      markerInstance = null;
      mapInstance = null;
    }
  };

  const applyLocation = () => {
    if (displayLocationDetails.value && currentGpsFieldKey.value) {
      const { lat, lng } = displayLocationDetails.value.locmark;
      // form value applied in view; keep composable state in sync:
      selectedClientBranchId.value = displayLocationDetails.value.id;
      selectedClientBranchSize.value = displayLocationDetails.value.locSize;
      selectedClientLat.value = lat;
      selectedClientLng.value = lng;
      closeLocationSelector();
    } else {
      locationError.value = "No location selected to apply.";
    }
  };

  return {
    locationTypes,
    selectedLocType,
    displayLocationDetails,
    reverseGeocodedAddress,
    locationError,
    showLocationSelectorDialog,
    openLocationSelector,
    closeLocationSelector,
    applyLocation,
    fetchLocationManagementData,
    currentGpsFieldKey,
    selectedClientLat,
    selectedClientLng,
  };
}
