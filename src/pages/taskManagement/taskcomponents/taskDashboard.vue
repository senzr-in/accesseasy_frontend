<template>
  <div class="dashboard-wrapper">
    <div class="dashboard-container">
      <!-- Dashboard Header with Branch Filter -->
      <div class="dashboard-header">
        <div class="header-left">
          <div class="title-row">
            <h2 class="dashboard-title">
              <i class="fas fa-chart-line"></i> Dashboard Overview
            </h2>
            <div class="branch-filter">
              <select
                id="branch-select"
                v-model="selectedBranch"
                @change="onBranchChange"
                class="branch-select"
              >
                <option value="all">All Branches</option>
                <option
                  v-for="branch in branches"
                  :key="branch.id"
                  :value="branch.id"
                >
                  {{ branch.locationName }}
                </option>
              </select>
            </div>
          </div>
          <p class="dashboard-subtitle">
            Monitor your access control system in real-time
          </p>
        </div>
        <div class="header-right"></div>
      </div>

      <!-- Top Statistics Bar -->
      <div class="stats-bar">
        <div class="stat-card employee-card">
          <div class="stat-icon blue-bg">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info-detailed">
            <div class="stat-main">
              <span class="stat-value">{{ attendanceCounts.total }}</span>
              <span class="stat-label">Total Employees</span>
            </div>
            <div class="stat-breakdown">
              <div class="breakdown-item present">
                <i class="fas fa-user-check"></i>
                <span class="breakdown-label">Present:</span>
                <span class="breakdown-value">{{
                  attendanceCounts.present
                }}</span>
              </div>
              <div class="breakdown-item absent">
                <i class="fas fa-user-times"></i>
                <span class="breakdown-label">Absent:</span>
                <span class="breakdown-value">{{
                  attendanceCounts.absent
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="stat-card" v-if="cameraCounts.total > 0">
          <div class="stat-icon purple-bg">
            <i class="fas fa-video"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value"
              >{{ cameraCounts.online }} / {{ cameraCounts.total }}</span
            >
            <span class="stat-label">Cameras Online</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon teal-bg">
            <i class="fas fa-door-open"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value"
              >{{ doorCounts.assigned }} / {{ doorCounts.total }}</span
            >
            <span class="stat-label">Active Doors</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red-bg">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ criticalAlerts }}</span>
            <span class="stat-label">Critical Alerts</span>
          </div>
        </div>
      </div>

      <!-- Main Grid Layout -->
      <div class="dashboard-grid">
        <!-- Left Column: Security Health & Access Activity -->
        <div class="main-column">
          <!-- Security Health Section -->
          <div class="section-card health-section">
            <div class="section-header">
              <h3><i class="fas fa-shield-alt"></i> System Health</h3>
            </div>
            <div class="health-grid">
              <!-- Camera Health -->
              <div class="health-item" v-if="cameraCounts.total > 0">
                <div class="health-chart">
                  <v-progress-circular
                    :model-value="cameraHealthPercentage"
                    :color="getCameraHealthColor"
                    :size="80"
                    :width="8"
                  >
                    {{ cameraHealthPercentage }}%
                  </v-progress-circular>
                </div>
                <div class="health-details">
                  <h4>Cameras</h4>
                  <p class="online">
                    <span class="dot green"></span>
                    {{ cameraCounts.online }} Online
                  </p>
                  <p class="offline">
                    <span class="dot red"></span>
                    {{ cameraCounts.offline }} Offline
                  </p>
                </div>
              </div>
              <!-- Controller Health -->
              <div class="health-item">
                <div class="health-chart">
                  <v-progress-circular
                    :model-value="controllerHealthPercentage"
                    :color="getControllerHealthColor"
                    :size="80"
                    :width="8"
                  >
                    {{ controllerHealthPercentage }}%
                  </v-progress-circular>
                </div>
                <div class="health-details">
                  <h4>Controllers</h4>
                  <p class="online">
                    <span class="dot green"></span>
                    {{ controllerCounts.connected }} Connected
                  </p>
                  <p class="offline">
                    <span class="dot red"></span>
                    {{ controllerCounts.waiting }} Waiting
                  </p>
                </div>
              </div>
              <!-- Door Health -->
              <div class="health-item">
                <div class="health-chart">
                  <v-progress-circular
                    :model-value="doorHealthPercentage"
                    :color="getDoorHealthColor"
                    :size="80"
                    :width="8"
                  >
                    {{ doorHealthPercentage }}%
                  </v-progress-circular>
                </div>
                <div class="health-details">
                  <h4>Doors</h4>
                  <p class="online">
                    <span class="dot green"></span>
                    {{ doorCounts.assigned }} Assigned
                  </p>
                  <p class="offline">
                    <span class="dot grey"></span>
                    {{ doorCounts.unassigned }} Unassigned
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity and Camera Grid -->
          <div class="activity-camera-grid">
            <!-- Recent Access Activity -->
            <div class="section-card activity-section">
              <div class="section-header">
                <h3><i class="fas fa-history"></i> Recent Access Activity</h3>
                <button
                  class="view-all-btn"
                  @click="navigateTo('/monitoring/access-logs')"
                >
                  View All
                </button>
              </div>
              <div class="activity-list">
                <div
                  v-for="(log, index) in recentAccessLogs"
                  :key="index"
                  class="activity-item"
                >
                  <div
                    class="activity-icon"
                    :class="log.status === 'Granted' ? 'granted' : 'denied'"
                  >
                    <i
                      :class="
                        log.status === 'Granted'
                          ? 'fas fa-check'
                          : 'fas fa-times'
                      "
                    ></i>
                  </div>
                  <div class="activity-info">
                    <span class="user-name">{{ log.user }}</span>
                    <span class="access-point">{{ log.door }}</span>
                    <span class="access-branch" v-if="log.branch"
                      ><i class="fas fa-building"></i> {{ log.branch }}</span
                    >
                  </div>
                  <div class="activity-meta">
                    <span class="time">{{ log.time }}</span>
                    <span class="access-method">{{ log.accessMethod }}</span>
                    <span
                      class="status-badge"
                      :class="log.status.toLowerCase()"
                      >{{ log.status }}</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Camera Overview -->
            <div class="section-card camera-section">
              <div class="section-header">
                <h3><i class="fas fa-video"></i> Camera Overview</h3>
                <button
                  class="view-all-btn"
                  @click="navigateTo('/monitoring/live')"
                >
                  View All
                </button>
              </div>
              <div class="camera-grid">
                <div
                  v-for="camera in filteredCameras"
                  :key="camera.id"
                  class="camera-item"
                >
                  <div class="camera-feed">
                    <video
                      v-if="camera.videoUrl"
                      :src="camera.videoUrl"
                      autoplay
                      muted
                      loop
                      class="camera-video"
                    ></video>
                    <div v-else class="camera-placeholder">
                      <i class="fas fa-video-slash"></i>
                      <span>No Feed</span>
                    </div>
                    <div class="camera-status" :class="camera.status">
                      <span class="status-dot"></span> {{ camera.status }}
                    </div>
                  </div>
                  <div class="camera-info">
                    <span class="camera-name">{{ camera.name }}</span>
                  </div>
                </div>
                <div v-if="filteredCameras.length === 0" class="no-cameras">
                  <i class="fas fa-video-slash"></i>
                  <p>No cameras available for this selection.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: AI Insights & Quick Actions -->
        <div class="side-column">
          <!-- AI Insights Widget -->
          <div class="section-card ai-insights">
            <div class="section-header">
              <h3><i class="fas fa-robot"></i> AI Insights (Live)</h3>
              <span class="live-indicator"
                ><span class="pulse"></span> Live</span
              >
            </div>
            <div class="insights-feed">
              <div
                v-for="(event, index) in filteredAiEvents"
                :key="index"
                class="insight-card"
              >
                <div class="insight-image">
                  <img :src="event.snapshot" alt="Event Snapshot" />
                </div>
                <div class="insight-content">
                  <div class="insight-header-row">
                    <span class="insight-type" :class="event.severity">{{
                      event.type
                    }}</span>
                    <span class="insight-camera" v-if="event.camera"
                      ><i class="fas fa-video"></i> {{ event.camera }}</span
                    >
                  </div>
                  <div class="insight-location-row" v-if="event.location">
                    <span class="insight-location"
                      ><i class="fas fa-map-marker-alt"></i>
                      {{ event.location }}</span
                    >
                  </div>
                  <p class="insight-desc">{{ event.description }}</p>
                  <span class="insight-time">{{ event.time }}</span>
                </div>
              </div>
              <div v-if="filteredAiEvents.length === 0" class="no-events">
                <i class="fas fa-check-circle"></i>
                <p>No anomalies detected.</p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="section-card quick-actions">
            <div class="section-header">
              <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
              <button
                class="toggle-btn"
                @click="isQuickActionsExpanded = !isQuickActionsExpanded"
              >
                <i
                  :class="
                    isQuickActionsExpanded
                      ? 'fas fa-chevron-up'
                      : 'fas fa-chevron-down'
                  "
                ></i>
              </button>
            </div>
            <transition name="collapse">
              <div v-show="isQuickActionsExpanded" class="actions-grid">
                <button
                  class="action-btn"
                  @click="navigateTo('/employee-details/employee/add/personal')"
                >
                  <i class="fas fa-user-plus"></i> Create Employee
                </button>
                <button
                  class="action-btn"
                  @click="navigateTo('/configuration/configuration')"
                >
                  <i class="fas fa-cogs"></i> Organization Configurator
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { useCameraData } from "@/composables/useCameraData";

export default {
  name: "TaskDashboard",
  components: {
    BaseButton,
  },
  setup() {
    const {
      fetchLocations,
      getCamerasByLocation,
      cameras: allCameras,
    } = useCameraData();
    return { fetchLocations, getCamerasByLocation, allCameras };
  },
  data() {
    return {
      currentDate: new Date(),
      branches: [],
      selectedBranch: "all",
      attendanceCounts: { total: 0, present: 0, absent: 0 },
      cameraCounts: { total: 0, online: 0, offline: 0 },
      doorCounts: { total: 0, assigned: 0, unassigned: 0 },
      controllerCounts: { total: 0, connected: 0, waiting: 0 },
      accessLevelCounts: { total: 0, active: 0, inactive: 0 },
      criticalAlerts: 0, // Mocked for now
      isQuickActionsExpanded: true, // Quick Actions collapsed by default

      // Mocked Data for AI Events
      aiEvents: [
        {
          type: "Tailgating",
          camera: "Main Entrance Cam",
          location: "Hyderabad Branch",
          description: "Tailgating detected at Main Entrance",
          time: "2 mins ago",
          severity: "high",
          snapshot: "https://via.placeholder.com/150?text=Tailgating",
        },
        {
          type: "Unrecognized Person",
          camera: "Server Room Cam",
          location: "Bangalore Branch",
          description: "Unknown person in Server Room corridor",
          time: "15 mins ago",
          severity: "medium",
          snapshot: "https://via.placeholder.com/150?text=Unknown",
        },
        {
          type: "Crowd Density",
          camera: "Lobby Cam",
          location: "Hyderabad Branch",
          description: "High crowd density in Lobby Area",
          time: "1 hour ago",
          severity: "low",
          snapshot: "https://via.placeholder.com/150?text=Crowd",
        },
        {
          type: "Motion Detected",
          camera: "NewTenant Camera 1",
          location: "Kukatpally Branch", // Assuming the second branch is Kukatpally based on user request "kku"
          description: "Motion detected in restricted area",
          time: "Just now",
          severity: "high",
          snapshot: "https://via.placeholder.com/150?text=Motion",
        },
      ],

      // Mocked Data for Access Logs
      recentAccessLogs: [
        {
          user: "John Doe",
          door: "Main Entrance",
          branch: "Hyderabad Branch",
          time: "10:45 AM",
          status: "Granted",
          accessMethod: "RFID Card",
        },
        {
          user: "Jane Smith",
          door: "Server Room",
          branch: "Bangalore Branch",
          time: "10:42 AM",
          status: "Denied",
          accessMethod: "Face ID",
        },
        {
          user: "Mike Ross",
          door: "Back Gate",
          branch: "Hyderabad Branch",
          time: "10:30 AM",
          status: "Granted",
          accessMethod: "QR Code",
        },
        {
          user: "Rachel Zane",
          door: "Office Lobby",
          branch: "Bangalore Branch",
          time: "10:15 AM",
          status: "Granted",
          accessMethod: "Mobile NFC",
        },
        {
          user: "Harvey Specter",
          door: "Executive Suite",
          branch: "Hyderabad Branch",
          time: "09:55 AM",
          status: "Granted",
          accessMethod: "Fingerprint",
        },
      ],
    };
  },
  computed: {
    cameraHealthPercentage() {
      if (this.cameraCounts.total === 0) return 0;
      return Math.round(
        (this.cameraCounts.online / this.cameraCounts.total) * 100
      );
    },
    getCameraHealthColor() {
      if (this.cameraHealthPercentage >= 90) return "green";
      if (this.cameraHealthPercentage >= 70) return "orange";
      return "red";
    },
    controllerHealthPercentage() {
      if (this.controllerCounts.total === 0) return 0;
      return Math.round(
        (this.controllerCounts.connected / this.controllerCounts.total) * 100
      );
    },
    getControllerHealthColor() {
      if (this.controllerHealthPercentage >= 90) return "green";
      if (this.controllerHealthPercentage >= 70) return "orange";
      return "red";
    },
    doorHealthPercentage() {
      if (this.doorCounts.total === 0) return 0;
      return Math.round(
        (this.doorCounts.assigned / this.doorCounts.total) * 100
      );
    },
    getDoorHealthColor() {
      if (this.doorHealthPercentage >= 90) return "green";
      if (this.doorHealthPercentage >= 50) return "orange";
      return "grey";
    },
    filteredAiEvents() {
      if (this.selectedBranch === "all") {
        return this.aiEvents;
      }
      // Find the name of the selected branch
      const branch = this.branches.find((b) => b.id === this.selectedBranch);
      if (!branch) return this.aiEvents;

      // Filter events that match the branch name
      // Note: This relies on the mock data having 'location' matching the branch name
      // In a real app, you'd filter by branch ID
      return this.aiEvents.filter(
        (event) => event.location === branch.locationName
      );
    },
    filteredCameras() {
      if (this.selectedBranch === "all") {
        return this.allCameras;
      }
      return this.getCamerasByLocation(this.selectedBranch);
    },
  },
  async created() {
    // Initialize camera data
    await this.fetchLocations();
    await this.fetchBranches();
    await this.fetchDashboardData();

    // Simulate real-time updates for AI events (optional, just for effect)
    setInterval(() => {
      this.simulateNewEvent();
    }, 30000);
  },
  methods: {
    formatShortDate(date) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    },
    navigateTo(path) {
      this.$router.push(path);
    },
    navigateToWithName(name) {
      this.$router.push({ name: name });
    },
    simulateNewEvent() {
      // Simple simulation to add a new event occasionally
      const eventTypes = ["Loitering", "Object Left Behind", "Intrusion"];
      const locations = ["Parking Lot", "Rear Exit", "Warehouse"];
      const cameras = ["Parking Cam 1", "Exit Cam", "Warehouse Cam 2"];

      // Pick a random branch from available branches, or default to Hyderabad
      const branchNames =
        this.branches.length > 0
          ? this.branches.map((b) => b.locationName)
          : ["Hyderabad Branch", "Bangalore Branch"];
      const randomBranch =
        branchNames[Math.floor(Math.random() * branchNames.length)];

      const randomIndex = Math.floor(Math.random() * eventTypes.length);
      const randomType = eventTypes[randomIndex];
      const randomLoc = locations[randomIndex]; // Keep location and camera somewhat synced for demo
      const randomCam = cameras[randomIndex];

      const newEvent = {
        type: randomType,
        camera: randomCam,
        location: randomBranch,
        description: `${randomType} detected at ${randomLoc}`,
        time: "Just now",
        severity: "medium",
        snapshot: `https://via.placeholder.com/150?text=${randomType}`,
      };

      this.aiEvents.unshift(newEvent);
      if (this.aiEvents.length > 5) this.aiEvents.pop();
    },

    async fetchBranches() {
      const tenantId = await currentUserTenant.getTenantId();
      const token = await authService.getToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/locationManagement?filter[_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][1][locType][_eq]=branch&fields=id,locdetail`,
          { headers }
        );
        const data = await response.json();

        this.branches = data.data.map((branch) => ({
          id: branch.id,
          locationName: branch.locdetail?.locationName || "Unknown Branch",
        }));
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    },

    onBranchChange() {
      // Refresh dashboard data when branch changes
      this.fetchDashboardData();
    },

    async fetchDashboardData() {
      const tenantId = await currentUserTenant.getTenantId();
      const token = await authService.getToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        // 1. Fetch Employee/Attendance Counts
        const today = new Date().toISOString().split("T")[0];

        // Fetch total employees with branch filter if applicable
        let employeesUrl = `${import.meta.env.VITE_API_URL}/items/personalModule?filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId}`;
        if (this.selectedBranch !== "all") {
          employeesUrl += `&filter[_and][1][branchLocation][id][_eq]=${this.selectedBranch}`;
        }
        employeesUrl += "&aggregate[count]=*";

        const employeesResponse = await fetch(employeesUrl, { headers });
        const empData = await employeesResponse.json();
        this.attendanceCounts.total = empData.data[0].count || 0;

        // Fetch today's attendance with branch filter if applicable
        let attUrl = `${import.meta.env.VITE_API_URL}/items/attendance?filter[_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][1][date][_eq]=${today}`;
        if (this.selectedBranch !== "all") {
          attUrl += `&filter[_and][2][locationBranch][_eq]=${this.selectedBranch}`;
        }

        const attResponse = await fetch(attUrl, { headers });
        const attData = await attResponse.json();

        // Count present and absent employees
        this.attendanceCounts.present = attData.data.filter(
          (a) => a.attendance === "Present"
        ).length;
        this.attendanceCounts.absent =
          this.attendanceCounts.total - this.attendanceCounts.present;

        // 2. Fetch Camera Counts using useCameraData
        let currentCameras = [];
        if (this.selectedBranch === "all") {
          currentCameras = this.allCameras;
        } else {
          currentCameras = this.getCamerasByLocation(this.selectedBranch);
        }

        this.cameraCounts.total = currentCameras.length;
        this.cameraCounts.online = currentCameras.filter(
          (c) => c.status === "online"
        ).length;
        this.cameraCounts.offline = currentCameras.filter(
          (c) => c.status === "offline"
        ).length;

        // 3. Fetch Door Counts with branch filter
        const doorsUrl =
          this.selectedBranch !== "all"
            ? `${import.meta.env.VITE_API_URL}/items/doors?filter[_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][1][location][_eq]=${this.selectedBranch}`
            : `${import.meta.env.VITE_API_URL}/items/doors?filter[_and][0][tenant][tenantId][_eq]=${tenantId}`;

        const doorsResponse = await fetch(doorsUrl, { headers });
        const doorsData = await doorsResponse.json();
        const doors = doorsData.data;
        this.doorCounts.total = doors.length;
        this.doorCounts.assigned = doors.filter(
          (d) => d.doorName && d.doorName !== ""
        ).length; // Assuming 'assigned' means has a name or config
        this.doorCounts.unassigned =
          this.doorCounts.total - this.doorCounts.assigned;

        // 4. Fetch Controller Counts with branch filter
        const controllersUrl =
          this.selectedBranch !== "all"
            ? `${import.meta.env.VITE_API_URL}/items/controllers?filter[_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][1][branchDetails][_eq]=${this.selectedBranch}`
            : `${import.meta.env.VITE_API_URL}/items/controllers?filter[_and][0][tenant][tenantId][_eq]=${tenantId}`;

        const controllersResponse = await fetch(controllersUrl, { headers });
        const controllersData = await controllersResponse.json();
        const controllers = controllersData.data;
        this.controllerCounts.total = controllers.length;
        this.controllerCounts.connected = controllers.filter(
          (c) => c.status === "Connected"
        ).length;
        this.controllerCounts.waiting = controllers.filter(
          (c) => c.status === "Waiting"
        ).length;

        // 5. Critical Alerts (Mocked based on offline devices)
        this.criticalAlerts =
          this.cameraCounts.offline + this.controllerCounts.waiting;
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    },
  },
};
</script>

<style scoped>
.dashboard-wrapper {
  width: 100%;
  height: 100vh;
  overflow: auto;
  background-color: #f4f6f9;
}

.dashboard-container {
  padding: 24px;
  background-color: #f4f6f9;
  min-height: 100vh;
  min-width: 1200px;
  font-family: "Inter", sans-serif;
}

/* Dashboard Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-left {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 8px;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dashboard-title i {
  color: #3b82f6;
  font-size: 26px;
}

.dashboard-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.header-right {
  display: none; /* Hidden as branch filter moved */
}

.branch-filter {
  display: flex;
  align-items: center;
  gap: 12px;
}

.branch-filter label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.branch-filter label i {
  color: #6b7280;
  font-size: 16px;
}

.branch-select {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 200px;
  outline: none;
}

.branch-select:hover {
  border-color: #3b82f6;
}

.branch-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
  color: white;
}

.blue-bg {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}
.green-bg {
  background: linear-gradient(135deg, #10b981, #059669);
}
.orange-bg {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
.purple-bg {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}
.teal-bg {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
}
.red-bg {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

/* Employee Card with Breakdown */
.employee-card {
  grid-column: span 1;
}

.stat-info-detailed {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.stat-main {
  display: flex;
  flex-direction: column;
}

.stat-breakdown {
  display: flex;
  gap: 16px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.breakdown-item i {
  font-size: 14px;
}

.breakdown-item.present {
  color: #059669;
}

.breakdown-item.present i {
  color: #10b981;
}

.breakdown-item.absent {
  color: #d97706;
}

.breakdown-item.absent i {
  color: #f59e0b;
}

.breakdown-label {
  font-weight: 500;
}

.breakdown-value {
  font-weight: 700;
  font-size: 14px;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.main-column,
.side-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Section Cards */
.section-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.section-header i {
  color: #6b7280;
}

/* Health Grid */
.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
}

.health-details h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #374151;
}

.health-details p {
  margin: 4px 0;
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot.green {
  background-color: #10b981;
}
.dot.red {
  background-color: #ef4444;
}
.dot.grey {
  background-color: #9ca3af;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  transition: background 0.2s;
}

.activity-item:hover {
  background: #f3f4f6;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 16px;
}

.activity-icon.granted {
  background-color: #d1fae5;
  color: #059669;
}

.activity-icon.denied {
  background-color: #fee2e2;
  color: #dc2626;
}

.activity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.access-point {
  font-size: 12px;
  color: #6b7280;
}

.activity-meta {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.time {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.status-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.status-badge.granted {
  background-color: #ecfdf5;
  color: #059669;
}

.status-badge.denied {
  background-color: #fef2f2;
  color: #dc2626;
}

.view-all-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

/* AI Insights */
.live-indicator {
  font-size: 12px;
  color: #ef4444;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pulse {
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: pulse-animation 1.5s infinite;
}

@keyframes pulse-animation {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.insights-feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.insight-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.insight-image img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.insight-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.insight-type {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.insight-type.high {
  color: #dc2626;
}
.insight-type.medium {
  color: #d97706;
}
.insight-type.low {
  color: #2563eb;
}

.insight-desc {
  font-size: 13px;
  color: #374151;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.insight-time {
  font-size: 11px;
  color: #9ca3af;
}

.no-events {
  text-align: center;
  padding: 40px 0;
  color: #10b981;
}

.no-events i {
  font-size: 32px;
  margin-bottom: 10px;
}

/* Quick Actions */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #4b5563;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e5e7eb;
  color: #111827;
  transform: translateY(-2px);
}

.action-btn i {
  font-size: 20px;
  color: #3b82f6;
}

.action-btn.secondary i {
  color: #6b7280;
}

.insight-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.insight-camera {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.access-method {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
  font-weight: 500;
}

.insight-location-row {
  margin-bottom: 4px;
}

.insight-location {
  font-size: 11px;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.access-branch {
  font-size: 11px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

/* Activity and Camera Grid */
.activity-camera-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1200px) {
  .activity-camera-grid {
    grid-template-columns: 1fr;
  }
}

/* Camera Grid */
.camera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.camera-item {
  background: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.camera-feed {
  position: relative;
  aspect-ratio: 16/9;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6b7280;
  font-size: 12px;
  gap: 4px;
}

.camera-status {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  text-transform: capitalize;
}

.camera-status.online .status-dot {
  background-color: #10b981;
}

.camera-status.offline .status-dot {
  background-color: #ef4444;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.camera-info {
  padding: 8px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.camera-name {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-cameras {
  grid-column: 1 / -1;
  text-align: center;
  padding: 20px;
  color: #9ca3af;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
</style>
