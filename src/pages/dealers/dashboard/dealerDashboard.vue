<template>
  <v-container fluid class="pa-6">
    <!-- Header with date and time -->
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <div>
          <h2 class="text-h5 font-weight-bold text-grey-darken-3">
            Dashboard Overview
          </h2>
        </div>
        <div class="text-right">
          <p class="text-body-2 text-grey-600">{{ currentDate }}</p>
          <p class="text-h6 font-weight-bold text-grey-darken-2">
            {{ currentTime }}
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <div class="d-flex align-center">
            <v-avatar size="48" class="bg-blue-lighten-4 mr-4">
              <v-icon color="blue-darken-2" size="24">mdi-account-group</v-icon>
            </v-avatar>
            <div>
              <p class="text-body-2 text-grey-600 mb-1">Total Dealers</p>
              <p class="text-h4 font-weight-bold text-grey-darken-3">45</p>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <div class="d-flex align-center">
            <v-avatar size="48" class="bg-green-lighten-4 mr-4">
              <v-icon color="green-darken-2" size="24">mdi-check-circle</v-icon>
            </v-avatar>
            <div>
              <p class="text-body-2 text-grey-600 mb-1">Active Dealers</p>
              <p class="text-h4 font-weight-bold text-green-darken-2">32</p>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <div class="d-flex align-center">
            <v-avatar size="48" class="bg-red-lighten-4 mr-4">
              <v-icon color="red-darken-2" size="24">mdi-close-circle</v-icon>
            </v-avatar>
            <div>
              <p class="text-body-2 text-grey-600 mb-1">Inactive Dealers</p>
              <p class="text-h4 font-weight-bold text-red-darken-2">8</p>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4" elevation="2">
          <div class="d-flex align-center">
            <v-avatar size="48" class="bg-orange-lighten-4 mr-4">
              <v-icon color="orange-darken-2" size="24">mdi-clock-alert</v-icon>
            </v-avatar>
            <div>
              <p class="text-body-2 text-grey-600 mb-1">Pending Requests</p>
              <p class="text-h4 font-weight-bold text-orange-darken-2">5</p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts Section -->
    <v-row>
      <v-col cols="12" lg="8">
        <v-card elevation="2">
          <v-card-title class="text-h6 font-weight-bold text-grey-darken-3">
            Dealers Added Per Month (2025)
          </v-card-title>
          <v-card-text>
            <div class="chart-container" style="height: 300px">
              <div
                class="d-flex align-end justify-space-between pa-4"
                style="height: 100%"
              >
                <div
                  v-for="(data, index) in monthlyData"
                  :key="index"
                  class="d-flex flex-column align-center flex-grow-1"
                >
                  <div
                    class="bg-blue-darken-1 rounded-t transition-all"
                    :style="{
                      height: `${(data.dealers / Math.max(...monthlyData.map((d) => d.dealers))) * 200}px`,
                      minHeight: '20px',
                      width: '100%',
                      maxWidth: '40px',
                    }"
                    @mouseover="hoveredBar = index"
                    @mouseleave="hoveredBar = null"
                    :class="{ 'bg-blue-darken-2': hoveredBar === index }"
                  ></div>
                  <div class="mt-2 text-center">
                    <div class="text-caption font-weight-medium">
                      {{ data.month }}
                    </div>
                    <div class="text-caption text-grey-600">
                      {{ data.dealers }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card elevation="2">
          <v-card-title class="text-h6 font-weight-bold text-grey-darken-3">
            Request Status Overview
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="mb-4">
              <v-card class="pa-4 bg-green-lighten-5" elevation="0">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-avatar size="32" class="bg-green-lighten-4 mr-3">
                      <v-icon color="green-darken-2" size="20"
                        >mdi-check-circle</v-icon
                      >
                    </v-avatar>
                    <div>
                      <p class="font-weight-medium text-grey-darken-3 mb-1">
                        Accepted Requests
                      </p>
                      <p class="text-body-2 text-grey-600">
                        Successfully approved dealers
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-h5 font-weight-bold text-green-darken-2"
                      >28</span
                    >
                  </div>
                </div>
              </v-card>
            </div>

            <div class="mb-4">
              <v-card class="pa-4 bg-red-lighten-5" elevation="0">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-avatar size="32" class="bg-red-lighten-4 mr-3">
                      <v-icon color="red-darken-2" size="20"
                        >mdi-close-circle</v-icon
                      >
                    </v-avatar>
                    <div>
                      <p class="font-weight-medium text-grey-darken-3 mb-1">
                        Rejected Requests
                      </p>
                      <p class="text-body-2 text-grey-600">
                        Declined dealer applications
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-h5 font-weight-bold text-red-darken-2"
                      >12</span
                    >
                  </div>
                </div>
              </v-card>
            </div>

            <div>
              <v-card class="pa-4 bg-orange-lighten-5" elevation="0">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-avatar size="32" class="bg-orange-lighten-4 mr-3">
                      <v-icon color="orange-darken-2" size="20"
                        >mdi-clock-alert</v-icon
                      >
                    </v-avatar>
                    <div>
                      <p class="font-weight-medium text-grey-darken-3 mb-1">
                        Pending Requests
                      </p>
                      <p class="text-body-2 text-grey-600">Awaiting review</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-h5 font-weight-bold text-orange-darken-2"
                      >5</span
                    >
                  </div>
                </div>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";

export default {
  name: "DealerDashboard",
  setup() {
    const currentDate = ref("");
    const currentTime = ref("");
    const hoveredBar = ref(null);
    let timeInterval = null;

    const monthlyData = [
      { month: "Jan", dealers: 5 },
      { month: "Feb", dealers: 8 },
      { month: "Mar", dealers: 12 },
      { month: "Apr", dealers: 7 },
      { month: "May", dealers: 15 },
      { month: "Jun", dealers: 10 },
      { month: "Jul", dealers: 18 },
      { month: "Aug", dealers: 14 },
      { month: "Sep", dealers: 9 },
      { month: "Oct", dealers: 11 },
      { month: "Nov", dealers: 6 },
      { month: "Dec", dealers: 4 },
    ];

    const updateDateTime = () => {
      const now = new Date();
      currentDate.value = now.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      currentTime.value = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };

    onMounted(() => {
      updateDateTime();
      timeInterval = setInterval(updateDateTime, 1000);
    });

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval);
      }
    });

    return {
      currentDate,
      currentTime,
      monthlyData,
      hoveredBar,
    };
  },
};
</script>

<style scoped>
.chart-container {
  position: relative;
}

.transition-all {
  transition: all 0.3s ease;
}

.v-card {
  border-radius: 12px;
}

.v-avatar {
  border-radius: 12px;
}
</style>
