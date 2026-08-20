import { ref } from 'vue';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { useMQTT } from '@/composables/useMQTT';

export function useSOCState() {
  const isMusterMode = ref(false);
  const loading = ref(false);
  const { deviceOnlineMap, activeAlarms } = useMQTT();

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
  const unifiedActivityFeed = ref([]);
  const registeredCameras = ref([]);
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
      const apiUrl = import.meta.env.VITE_API_URL;
      const headers = { Authorization: `Bearer ${token}` };
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      // Fetch Controllers to get total cameras and offline status
      let onlineCameras = 0;
      let totalCameras = 0;
      let offlineCameras = 0;
      let allowedCameras = [];
      try {
        const ctrlRes = await authService.protectedApi.get('/items/controllers', {
          params: {
            'filter[tenant][_eq]': tenantId,
            'filter[linkedCamera][_nnull]': 'true'
          }
        });
        const controllers = ctrlRes.data?.data || [];
        totalCameras = controllers.length;
        onlineCameras = controllers.filter(c => {
          const rt = deviceOnlineMap.value[c.sn];
          if (rt && rt.status) return rt.status === 'online';
          return c.status === 'online' || c.status === 'active';
        }).length;
        offlineCameras = totalCameras - onlineCameras;
        allowedCameras = controllers.map(c => c.linkedCamera).filter(Boolean);
        registeredCameras.value = controllers;
      } catch (err) {
        console.error('Error fetching controllers', err);
      }

      // Fetch Today's Events
      let facesToday = 0;
      let vehiclesToday = 0;
      let peopleToday = 0;
      
      try {
        const eventParams = {
          'filter[start_time][_gte]': todayIso,
          'sort': '-start_time',
          'limit': 50
        };
        
        if (allowedCameras.length > 0) {
          eventParams['filter[camera][_in]'] = allowedCameras.join(',');
        } else {
          eventParams['filter[camera][_in]'] = 'no_cameras_linked';
        }

        const eventsRes = await authService.protectedApi.get('/items/frigateEvents', {
          params: eventParams
        });
        const events = eventsRes.data?.data || [];
        
        facesToday = events.filter(e => e.label === 'face').length;
        vehiclesToday = events.filter(e => e.label === 'car').length;
        peopleToday = events.filter(e => e.label === 'person').length;

        // Map events to liveActivityFeed format
        const mappedEvents = events.map(e => ({
            id: e.id || e.event_id,
            type: e.label === 'face' ? (e.person_name ? 'Employee Recognized' : 'Unknown Face') : e.label === 'car' ? 'Vehicle Detected' : 'Person Detected',
            name: e.person_name || (e.label === 'car' ? 'Vehicle' : 'Unknown'),
            time: new Date(e.start_time).toLocaleTimeString(),
            timestamp: new Date(e.start_time).getTime(),
            gate: e.camera,
            method: 'AI Camera',
            status: (e.label === 'face' && !e.person_name) ? 'denied' : 'authorized',
            photo: e.snapshot_file ? (e.snapshot_file.endsWith('.jpg') ? `http://frigate-mqtt.knative-fn.65.109.41.139.sslip.io/?file=${encodeURIComponent(e.snapshot_file)}` : `${apiUrl}/assets/${e.snapshot_file}?access_token=${token}`) : null,
            eventData: e,
            isLog: false
        }));
        
        liveActivityFeed.value = mappedEvents.slice(0, 20);
        
        const unified = [...mappedEvents];

        // Fetch Access Logs
        try {
          const logParams = new URLSearchParams({
            limit: '30',
            'sort[]': '-date_created',
            'filter[_and][0][tenant][tenantId][_eq]': tenantId,
            'filter[_and][1][mode][_neq]': 'cronJob'
          });
          const logFields = [
            "status", "action", "employeeId.employeeId", 
            "employeeId.assignedUser.id", "employeeId.assignedUser.first_name", 
            "employeeId.assignedUser.last_name", "employeeId.assignedUser.avatar.id",
            "mode", "timeStamp", "date", "id", "ValidLogs", "date_created",
            "name", "rfid"
          ];
          logFields.forEach(f => logParams.append('fields[]', f));

          const logsRes = await authService.protectedApi.get('/items/logs?' + logParams.toString());
          const accessLogs = logsRes.data?.data || [];

          const mappedLogs = await Promise.all(accessLogs.map(async (l) => {
            if (!l.employeeId && l.rfid) {
              try {
                const cardRes = await authService.protectedApi.get(`/items/cardManagement?filter[rfidCard][_eq]=${encodeURIComponent(l.rfid)}&fields=employeeId.employeeId,employeeId.assignedUser.id,employeeId.assignedUser.first_name,employeeId.assignedUser.last_name,employeeId.assignedUser.avatar.id`);
                if (cardRes.data?.data?.[0]?.employeeId) {
                  l.employeeId = cardRes.data.data[0].employeeId;
                }
              } catch (e) {}
            }

            let employeeName = "Unknown";
            if (l.employeeId?.assignedUser) {
              employeeName = `${l.employeeId.assignedUser.first_name || ''} ${l.employeeId.assignedUser.last_name || ''}`.trim() || "Unknown";
            } else if (l.name) {
              employeeName = l.name;
            } else if (l.rfid) {
              employeeName = "Unassigned Card";
            }

            return {
              id: `log_${l.id}`,
              type: l.action === 'in' ? 'Check In' : l.action === 'out' ? 'Check Out' : (l.action || 'Access'),
              name: employeeName,
              subtitle: l.employeeId?.employeeId || l.rfid || l.mode || 'N/A',
              time: l.timeStamp ? l.timeStamp.split('.')[0] : (l.date_created ? new Date(l.date_created).toLocaleTimeString() : '-'),
              timestamp: new Date(l.date_created).getTime(),
              gate: l.mode,
              method: l.mode,
              status: (l.ValidLogs === true || l.ValidLogs === "authorized" || l.ValidLogs === 1) ? 'authorized' : 'denied',
              photo: l.employeeId?.assignedUser?.avatar?.id ? `${apiUrl}/assets/${l.employeeId.assignedUser.avatar.id}?access_token=${token}` : null,
              eventData: l,
              isLog: true
            };
          }));
          unified.push(...mappedLogs);
        } catch (e) {
          console.error("Failed fetching access logs", e);
        }

        unified.sort((a, b) => b.timestamp - a.timestamp);
        unifiedActivityFeed.value = unified.slice(0, 40);

      } catch (err) {
        console.error('Error fetching events', err);
      }

      kpiData.value = {
        employeesInside: facesToday,
        employeesTrend: 0,
        vehiclesInside: vehiclesToday,
        vehiclesTrend: 0,
        unknownPersons: peopleToday,
        offlineDevices: offlineCameras,
        criticalAlerts: 0,
        totalCameras,
        onlineCameras
      };

      todayOverview.value = {
        entries: facesToday + peopleToday,
        entriesTrend: 0,
        exits: 0,
        exitsTrend: 0,
        employeesInside: facesToday,
        employeesInsideTrend: 0,
        vehiclesInside: vehiclesToday,
        vehiclesInsideTrend: 0
      };

      alertsFeed.value = []; // Placeholder

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

      if (['person', 'car', 'face'].includes(after.label) && type === 'new') {
        const isFalsePositive = after.false_positive;
        if (!isFalsePositive) {
          const entry = {
            id:     after.id || Date.now(),
            type:   after.label === 'face' ? (after.person_name ? 'Employee Recognized' : 'Unknown Face') : after.label === 'car' ? 'Vehicle Detected' : 'Person Detected',
            name:   after.person_name || (after.label === 'car' ? 'Vehicle' : 'Unknown'),
            time:   new Date(after.start_time * 1000).toLocaleTimeString(),
            gate:   after.camera,
            method: 'AI Camera',
            status: (after.label === 'face' && !after.person_name) ? 'denied' : 'authorized',
            photo:  after.has_snapshot ? `http://frigate-mqtt.knative-fn.65.109.41.139.sslip.io/?file=${encodeURIComponent(after.camera + '-' + after.id + '.jpg')}` : null,
            eventData: {
              ...after,
              start_time: after.start_time * 1000,
              score: after.top_score || after.score
            }
          };
          
          liveActivityFeed.value = [entry, ...liveActivityFeed.value].slice(0, 20);
          
          // Update KPIs
          if (after.label === 'face') {
             kpiData.value = { ...kpiData.value, employeesInside: (kpiData.value.employeesInside || 0) + 1 };
          } else if (after.label === 'car') {
             kpiData.value = { ...kpiData.value, vehiclesInside: (kpiData.value.vehiclesInside || 0) + 1 };
          } else if (after.label === 'person') {
             kpiData.value = { ...kpiData.value, unknownPersons: (kpiData.value.unknownPersons || 0) + 1 };
          }

          if (after.top_score != null && after.top_score < 0.6) {
            // Push an alert for unknown face
            const alert = {
              id:       Date.now(),
              priority: 'critical',
              title:    'Low confidence match detected',
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
          id:     after.id || Date.now(),
          type:   'License Plate Captured',
          name:   `Event: ${after.id.slice(-8)}`,
          time:   new Date(after.start_time * 1000).toLocaleTimeString(),
          gate:   after.camera,
          method: 'LP Detector',
          status: 'authorized',
          photo: `http://frigate-mqtt.knative-fn.65.109.41.139.sslip.io/?file=${encodeURIComponent(after.camera + '-' + after.id + '.jpg')}`,
          eventData: {
            ...after,
            start_time: after.start_time * 1000,
            score: after.top_score || after.score
          }
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
    unifiedActivityFeed,
    registeredCameras,
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
