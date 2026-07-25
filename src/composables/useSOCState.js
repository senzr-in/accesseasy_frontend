import { ref } from 'vue';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { mqttService } from '@/services/mqttService';

export function useSOCState() {
  const isMusterMode = ref(false);
  const loading = ref(false);

  const kpiData = ref({
    employeesInside: 0,
    employeesTrend: 0,
    vehiclesInside: 0,
    vehiclesTrend: 0,
    unknownPersons: 0,
    offlineDevices: 0,
    criticalAlerts: 0
  });

  const liveActivityFeed = ref([]);
  const todayOverview = ref({
    entries: 0,
    entriesTrend: 0,
    exits: 0,
    exitsTrend: 0,
    employeesInside: 0,
    employeesInsideTrend: 0,
    vehiclesInside: 0,
    vehiclesInsideTrend: 0
  });

  const alertsFeed = ref([]);

  const analyticsData = ref({
    entriesVsExits: {
      labels: ['12 AM', '6 AM', '12 PM', '6 PM', '12 AM'],
      entries: [10, 20, 50, 80, 20],
      exits: [5, 10, 20, 60, 40]
    },
    peakEntryHours: {
      labels: ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM'],
      data: [10, 80, 40, 20, 30, 10]
    },
    securityEventsTrend: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [5, 2, 8, 3, 1, 0, 1]
    }
  });

  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();
  let pollingInterval = null;

  const toggleMusterMode = () => {
    isMusterMode.value = !isMusterMode.value;
  };

  const loadSOCData = async () => {
    if (!token || !tenantId) return;
    loading.value = true;
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const headers = { Authorization: `Bearer ${token}` };

      // TODO: Replace with real API calls to the new endpoints (soc-kpi, soc-live-feed, etc.)
      // Mocking data for now based on the requested design
      
      kpiData.value = {
        employeesInside: 184,
        employeesTrend: 12,
        vehiclesInside: 41,
        vehiclesTrend: 8,
        unknownPersons: 2,
        offlineDevices: 1,
        criticalAlerts: 3
      };

      liveActivityFeed.value = [
        { id: 1, type: 'Employee Entered', name: 'John Smith', time: '09:42:10', gate: 'Gate 1', method: 'Face Recognition', status: 'authorized', photo: null },
        { id: 2, type: 'Vehicle Entered', name: 'TN09AB1234', time: '09:41:32', gate: 'Main Gate', method: 'Employee Vehicle', status: 'authorized', photo: null },
        { id: 3, type: 'Checked In', name: 'ABC Technologies', time: '09:40:11', gate: 'Reception', method: 'Pre-registered', status: 'authorized', photo: null },
        { id: 4, type: 'Unknown Face Detected', name: 'Unknown', time: '09:39:45', gate: 'Warehouse Entrance', method: 'Camera: WH Cam 2', status: 'denied', photo: null },
        { id: 5, type: 'RFID Access', name: 'Priya Sharma', time: '09:38:21', gate: 'Gate 2', method: 'Employee', status: 'authorized', photo: null },
      ];

      todayOverview.value = {
        entries: 256,
        entriesTrend: 18,
        exits: 212,
        exitsTrend: 15,
        employeesInside: 184,
        employeesInsideTrend: 12,
        vehiclesInside: 41,
        vehiclesInsideTrend: 8
      };

      alertsFeed.value = [
        { id: 1, priority: 'critical', title: 'Unknown face detected', location: 'Warehouse Entrance', time: '09:39 AM', action: 'Review' },
        { id: 2, priority: 'warning', title: 'Device offline', location: 'Warehouse Door Controller', time: '09:15 AM', action: 'View' },
        { id: 3, priority: 'critical', title: 'Access denied', location: 'Gate 2 (Ramesh Kumar)', time: '09:10 AM', action: 'View' },
        { id: 4, priority: 'warning', title: 'Door forced open', location: 'Back Door', time: '09:05 AM', action: 'View' },
        { id: 5, priority: 'info', title: 'Multiple failed attempts', location: 'Gate 1', time: '08:50 AM', action: 'View' },
      ];

    } catch (e) {
      console.error('Failed to load SOC dashboard data:', e);
    } finally {
      loading.value = false;
    }
  };

  // ── MQTT real-time integration ────────────────────────────────────────────
  let _mqttEventUnsub  = null;
  let _mqttCountUnsub  = null;

  /** Start listening to MQTT for live dashboard updates. */
  const startMQTT = () => {
    mqttService.connect();

    // Person detection events → live activity feed + KPI
    _mqttEventUnsub = mqttService.on('frigate/events', (_topic, payload) => {
      let msg;
      try { msg = JSON.parse(payload.toString()); } catch { return; }
      const { type, after } = msg;
      if (!after) return;

      if (after.label === 'person' && type === 'new') {
        const isFalsePositive = after.false_positive;
        if (!isFalsePositive) {
          const entry = {
            id:     Date.now(),
            type:   'Person Detected',
            name:   `Camera: ${after.camera}`,
            time:   new Date(after.start_time * 1000).toLocaleTimeString(),
            gate:   after.camera,
            method: 'AI Camera',
            status: 'authorized',
          };
          liveActivityFeed.value = [entry, ...liveActivityFeed.value].slice(0, 20);
          // Bump unknown persons count if score is below threshold (unrecognised face)
          if (after.top_score != null && after.top_score < 0.6) {
            kpiData.value = { ...kpiData.value, unknownPersons: (kpiData.value.unknownPersons || 0) + 1 };
            // Push an alert for unknown face
            const alert = {
              id:       Date.now(),
              priority: 'critical',
              title:    'Unknown person detected',
              location: after.camera,
              time:     new Date().toLocaleTimeString(),
            };
            alertsFeed.value = [alert, ...alertsFeed.value].slice(0, 20);
            kpiData.value = { ...kpiData.value, criticalAlerts: (kpiData.value.criticalAlerts || 0) + 1 };
          }
        }
      }

      if (after.label === 'license_plate' && type === 'end' && after.has_snapshot) {
        const entry = {
          id:     Date.now(),
          type:   'License Plate Captured',
          name:   `Event: ${after.id.slice(-8)}`,
          time:   new Date(after.start_time * 1000).toLocaleTimeString(),
          gate:   after.camera,
          method: 'LP Detector',
          status: 'authorized',
        };
        liveActivityFeed.value = [entry, ...liveActivityFeed.value].slice(0, 20);
      }
    });
  };

  /** Stop MQTT listeners (does not disconnect the shared client). */
  const stopMQTT = () => {
    _mqttEventUnsub?.();
    _mqttCountUnsub?.();
  };

  // ── Polling ───────────────────────────────────────────────────────────────
  const startPolling = (intervalMs = 15000) => {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(loadSOCData, intervalMs);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    stopMQTT();
  };

  return {
    isMusterMode,
    loading,
    kpiData,
    liveActivityFeed,
    todayOverview,
    alertsFeed,
    analyticsData,
    toggleMusterMode,
    loadSOCData,
    startPolling,
    stopPolling,
    startMQTT,
    stopMQTT,
  };
}
