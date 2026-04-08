<template>
  <div class="user-activity-container">
    <v-card class="activity-card" elevation="2" rounded="lg">
      <div class="header-gradient px-6 py-5">
        <div class="d-flex align-center">
          <div>
            <h2 class="text-h4 font-weight-bold text-white mb-1">
              Activity Log
            </h2>
            <p class="text-subtitle-1 text-white text-opacity-80 mb-0">
              Track user actions and system changes
            </p>
          </div>
          <v-spacer></v-spacer>
          <div class="d-flex align-center">
            <v-menu location="bottom end" transition="slide-y-transition">
              <template v-slot:activator="{ props }">
                <v-btn
                  color="white"
                  v-bind="props"
                  prepend-icon="mdi-calendar-range"
                  variant="outlined"
                  class="date-filter-btn me-3"
                >
                  {{ selectedPeriod.label }}
                </v-btn>
              </template>
              <v-card min-width="220" elevation="8" rounded="lg" class="pa-2">
                <v-list density="compact" nav rounded="lg">
                  <v-list-item
                    v-for="(period, index) in timePeriods"
                    :key="index"
                    :value="period.value"
                    @click="changeTimePeriod(period)"
                    :active="selectedPeriod.value === period.value"
                    rounded="lg"
                    class="mb-1"
                    :class="
                      selectedPeriod.value === period.value
                        ? 'bg-primary-lighten-5'
                        : ''
                    "
                  >
                    <template v-slot:prepend>
                      <v-icon
                        :icon="period.icon"
                        size="small"
                        class="me-2"
                      ></v-icon>
                    </template>
                    <v-list-item-title>{{ period.label }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
            <v-btn
              icon
              variant="text"
              color="white"
              @click="refreshData"
              :disabled="loading"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <div class="filter-section px-6 py-4">
        <div class="d-flex align-center">
          <div class="text-subtitle-1 font-weight-medium me-4">Filter by:</div>
          <v-chip-group
            v-model="selectedAction"
            column
            multiple
            class="action-filter"
          >
            <v-chip
              v-for="action in actionTypes"
              :key="action.value"
              :value="action.value"
              filter
              :color="action.color"
              variant="elevated"
              class="action-chip"
              label
            >
              <template v-slot:prepend>
                <v-icon :icon="action.icon" size="small" class="me-1"></v-icon>
              </template>
              {{ action.label }}
            </v-chip>
          </v-chip-group>
          <v-spacer></v-spacer>
          <v-btn
            v-if="selectedAction.length > 0"
            variant="text"
            color="primary"
            size="small"
            @click="selectedAction = []"
            prepend-icon="mdi-filter-off"
          >
            Clear
          </v-btn>
        </div>
      </div>

      <v-divider></v-divider>

      <div v-if="loading" class="d-flex justify-center align-center pa-8">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </div>

      <div v-else-if="filteredActivities.length === 0" class="empty-state pa-8">
        <div class="d-flex flex-column align-center">
          <v-icon
            icon="mdi-clipboard-text-off-outline"
            size="64"
            color="grey-lighten-1"
          ></v-icon>
          <h3 class="text-h6 mt-4 text-grey-darken-1">No Activity Found</h3>
          <p class="text-body-2 text-grey mt-2 text-center">
            There are no activity logs matching your current filters.
          </p>
          <v-btn
            color="primary"
            variant="tonal"
            class="mt-4"
            @click="selectedAction = []"
            prepend-icon="mdi-filter-off"
          >
            Reset Filters
          </v-btn>
        </div>
      </div>

      <div v-else class="activity-list-container">
        <div class="activity-grid">
          <div
            v-for="(activity, index) in filteredActivities"
            :key="index"
            class="activity-card-item"
            :class="getActionClass(activity.action)"
          >
            <div class="activity-card-header">
              <div class="d-flex align-center">
                <v-avatar
                  :color="getActionColor(activity.action)"
                  size="36"
                  class="activity-icon"
                >
                  <v-icon
                    :icon="getActionIcon(activity.action)"
                    color="white"
                    size="18"
                  ></v-icon>
                </v-avatar>
                <div class="ms-3">
                  <div class="text-subtitle-2 font-weight-bold text-uppercase">
                    {{ activity.action }}
                  </div>
                  <div class="text-caption">
                    {{ formatCollection(activity.collection) }}
                  </div>
                </div>
                <v-spacer></v-spacer>
                <div class="text-caption text-grey-darken-1">
                  {{ formatDate(activity.timestamp) }}
                </div>
              </div>
            </div>

            <v-divider class="my-2"></v-divider>

            <div class="activity-card-content">
              <div class="d-flex align-center">
                <v-avatar size="40" class="me-3">
                  <v-img
                    v-if="activity.avatarImage"
                    :src="activity.avatarImage"
                    :alt="getUserName(activity.user)"
                  ></v-img>
                  <v-img
                    v-else
                    src="/images/person-Icon.png"
                    alt="Default Avatar"
                  ></v-img>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ getUserName(activity.user) || "System" }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ activity.user?.email || "No email" }}
                  </div>
                </div>
              </div>

              <div class="mt-3 d-flex justify-space-between align-center">
                <v-chip
                  size="small"
                  color="grey-lighten-3"
                  variant="flat"
                  class="text-caption"
                >
                  ID: {{ activity.id }}
                </v-chip>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="grey"
                  @click="showActivityDetails(activity)"
                >
                  <v-icon icon="mdi-dots-horizontal" size="small"></v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center pa-6" v-if="hasMoreData">
          <v-btn
            color="primary"
            variant="elevated"
            rounded="pill"
            size="large"
            @click="loadMore"
            :loading="loadingMore"
            class="load-more-btn px-8"
          >
            <span class="text-subtitle-1">Load More</span>
          </v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { format, subDays, parseISO } from "date-fns";

const activities = ref([]);
const loading = ref(true);
const loadingMore = ref(false);
const page = ref(1);
const limit = ref(20);
const hasMoreData = ref(true);
const selectedAction = ref([]);
const selectedPeriod = ref({
  value: 30,
  label: "Last 30 Days",
  icon: "mdi-calendar-month",
});
const tenantId = ref(null);

const timePeriods = [
  { value: 7, label: "Last 7 Days", icon: "mdi-calendar-week" },
  { value: 30, label: "Last 30 Days", icon: "mdi-calendar-month" },
  { value: 90, label: "Last 3 Months", icon: "mdi-calendar-range" },
  { value: 180, label: "Last 6 Months", icon: "mdi-calendar-multiple" },
];

const actionTypes = [
  {
    value: "create",
    label: "Created",
    color: "success",
    icon: "mdi-plus-circle",
  },
  { value: "update", label: "Updated", color: "info", icon: "mdi-pencil" },
  { value: "delete", label: "Deleted", color: "error", icon: "mdi-delete" },
];

const filteredActivities = computed(() => {
  let filtered = [...activities.value];

  if (selectedAction.value && selectedAction.value.length > 0) {
    filtered = filtered.filter((activity) =>
      selectedAction.value.includes(activity.action),
    );
  }

  return filtered;
});

const getCurrentUserTenantId = async () => {
  try {
    const id = currentUserTenant.getTenantId();
    if (id) {
      tenantId.value = id;
      return id;
    }

    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    if (userDetails && userDetails.tenant && userDetails.tenant.tenantId) {
      tenantId.value = userDetails.tenant.tenantId;
      return userDetails.tenant.tenantId;
    }

    console.error("Could not retrieve tenant ID");
    return null;
  } catch (error) {
    console.error("Error getting tenant ID:", error);
    return null;
  }
};

// Replace the simple URL function with a function that fetches the image with authentication
const avatarCache = ref(new Map());

const fetchAuthorizedImage = async (avatarId) => {
  try {
    // Check if we already have this image in cache
    if (avatarCache.value.has(avatarId)) {
      return avatarCache.value.get(avatarId);
    }

    const token = authService.getToken();
    const imageUrl = `${import.meta.env.VITE_API_URL}/assets/${avatarId}`;

    const response = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to load image");

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    // Cache the result
    avatarCache.value.set(avatarId, objectUrl);

    return objectUrl;
  } catch (error) {
    console.error("Error loading profile image:", error);
    return null;
  }
};

// Update the fetchActivities function to also fetch avatar images
const fetchActivities = async (reset = false) => {
  if (reset) {
    activities.value = [];
    page.value = 1;
    loading.value = true;
    hasMoreData.value = true;
  } else {
    loadingMore.value = true;
  }

  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    // Get tenant ID if not already fetched
    if (!tenantId.value) {
      await getCurrentUserTenantId();
    }

    if (!tenantId.value) {
      throw new Error("Tenant ID not available");
    }

    const fromDate = format(
      subDays(new Date(), selectedPeriod.value.value),
      "yyyy-MM-dd",
    );

    // Build URL manually to handle multiple fields[] parameters correctly
    let url = `${import.meta.env.VITE_API_URL}/activity?`;

    // Add basic parameters
    url += `limit=${limit.value}&page=${page.value}&sort[]=-timestamp`;

    // Add all fields parameters
    const fields = [
      "id",
      "timestamp",
      "action",
      "collection",
      "user.id",
      "user.email",
      "user.first_name",
      "user.last_name",
      "user.avatar.id",
      "user.tenant.tenantId",
    ];

    fields.forEach((field) => {
      url += `&fields[]=${encodeURIComponent(field)}`;
    });

    // Add filters
    url += `&filter[_and][0][collection][_eq]=${encodeURIComponent("personalModule")}`;
    url += `&filter[_and][1][timestamp][_gte]=${encodeURIComponent(fromDate)}`;
    url += `&filter[_and][2][user][tenant][tenantId][_eq]=${encodeURIComponent(tenantId.value)}`;

    if (selectedAction.value && selectedAction.value.length === 1) {
      url += `&filter[_and][3][action][_eq]=${encodeURIComponent(selectedAction.value[0])}`;
    } else if (selectedAction.value && selectedAction.value.length > 1) {
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Process the data to fetch avatar images
    const processedData = await Promise.all(
      (data.data || []).map(async (activity) => {
        if (activity.user?.avatar?.id) {
          activity.avatarImage = await fetchAuthorizedImage(
            activity.user.avatar.id,
          );
        }
        return activity;
      }),
    );

    if (reset) {
      activities.value = processedData;
    } else {
      activities.value = [...activities.value, ...processedData];
    }

    hasMoreData.value = (data.data || []).length === limit.value;
    page.value++;
  } catch (error) {
    console.error("Error fetching activity data:", error);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = () => {
  if (!loadingMore.value && hasMoreData.value) {
    fetchActivities(false);
  }
};

const refreshData = () => {
  fetchActivities(true);
};

const changeTimePeriod = (period) => {
  selectedPeriod.value = period;
  fetchActivities(true);
};

const getUserName = (user) => {
  if (!user) return "Unknown User";
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.email?.split("@")[0] || "Unknown User";
};

const formatDate = (timestamp) => {
  try {
    const date = parseISO(timestamp);
    return format(date, "MMM dd, yyyy • HH:mm");
  } catch (e) {
    return timestamp;
  }
};

const formatCollection = (collection) => {
  if (!collection) return "Unknown";
  return collection
    .replace("actions_", "")
    .replace(/([A-Z])/g, " $1")
    .trim();
};

const getActionColor = (action) => {
  switch (action?.toLowerCase()) {
    case "create":
      return "success";
    case "update":
      return "info";
    case "delete":
      return "error";
    default:
      return "grey";
  }
};

const getActionClass = (action) => {
  switch (action?.toLowerCase()) {
    case "create":
      return "create-card";
    case "update":
      return "update-card";
    case "delete":
      return "delete-card";
    default:
      return "";
  }
};

const getActionIcon = (action) => {
  switch (action?.toLowerCase()) {
    case "create":
      return "mdi-plus-circle";
    case "update":
      return "mdi-pencil";
    case "delete":
      return "mdi-delete";
    default:
      return "mdi-information";
  }
};

const showActivityDetails = (activity) => {
  console.log("Show details for activity:", activity);
};

watch(selectedAction, () => {});

onMounted(async () => {
  await getCurrentUserTenantId();
  fetchActivities(true);
});
</script>

<style scoped>
.user-activity-container {
  height: calc(105vh - 180px);
  background-color: #f5f7fa;
  padding: 10px;
}

.activity-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background-color: white;
}

.header-gradient {
  background: linear-gradient(135deg, #777a86 0%, #595d6e 100%);
  color: white;
}

.date-filter-btn {
  min-width: 160px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.filter-section {
  background-color: white;
}

.action-filter {
  flex-wrap: wrap;
}

.action-chip {
  margin-right: 8px;
  font-weight: 500;
}

.activity-list-container {
  flex: 1;
  height: calc(90vh - 170px);
  overflow-y: auto;
  background-color: #f5f7fa;
  padding: 16px;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding: 8px;
}

.activity-card-item {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-top: 4px solid #e0e0e0;
}

.activity-card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.create-card {
  border-top-color: #4caf50;
}

.update-card {
  border-top-color: #595d6e;
}

.delete-card {
  border-top-color: #f44336;
}

.activity-card-header {
  padding: 16px;
  background-color: #fafafa;
}

.activity-card-content {
  padding: 16px;
}

.activity-icon {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.load-more-btn {
  box-shadow: 0 4px 12px rgba(74, 108, 247, 0.2);
}

.empty-state {
  background-color: white;
  border-radius: 12px;
  margin: 16px;
  padding: 32px;
  text-align: center;
}

@media (max-width: 600px) {
  .activity-grid {
    grid-template-columns: 1fr;
  }

  .user-activity-container {
    padding: 12px;
  }
}
</style>
