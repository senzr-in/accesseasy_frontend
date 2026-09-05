import { ref, computed, reactive } from 'vue';
import { patrolService } from '@/services/patrolService';
import { mqttService } from '@/services/mqttService';
import { alertNotificationService } from '@/services/alertNotificationService';

// ==========================================
// GLOBAL STATE (Singleton)
// ==========================================
const guards = ref([]);
const patrols = ref([]);
const alerts = ref([]);
const visitors = ref([]);

const isConnected = ref(false);
const lastUpdated = ref(null);
const isLoading = ref(true);

let socketInterval = null;
let unsubMqttLocation = null;
let unsubMqttAlert = null;
let unsubMqttSos = null;
let unsubMqttLog = null;

// ==========================================
// GETTERS (Derived State)
// ==========================================

const activePatrols = computed(() => patrols.value.filter(p => p.status === 'active' || p.status === 'in_progress'));
const completedPatrols = computed(() => patrols.value.filter(p => p.status === 'completed'));

// Sort alerts newest first
const sortedAlerts = computed(() => {
  return [...alerts.value].sort((a, b) => {
    const timeA = new Date(a.date_created || a.timestamp || 0).getTime();
    const timeB = new Date(b.date_created || b.timestamp || 0).getTime();
    return timeB - timeA;
  });
});

const criticalAlerts = computed(() => sortedAlerts.value.filter(a => a.severity === 'error' || a.severity === 'critical' || a.type === 'sos'));

// KPI Metrics used in the top bar
const kpiMetrics = computed(() => {
  const totalCheckpoints = activePatrols.value.reduce((acc, p) => acc + (p.checkpointsVisited || p.completed_points || 0), 0)
    + completedPatrols.value.reduce((acc, p) => acc + (p.checkpointsVisited || p.completed_points || 0), 0);

  return {
    guardsOnDuty: guards.value.length || activePatrols.value.length,
    activePatrols: activePatrols.value.length,
    completedCheckpoints: totalCheckpoints,
    activeAlerts: alerts.value.length,
    criticalIncidents: criticalAlerts.value.length,
    visitorsInside: visitors.value.length
  };
});

// ==========================================
// ACTIONS
// ==========================================

const fetchAllData = async () => {
  try {
    const [patrolData, alertData] = await Promise.all([
      patrolService.getPatrols(),
      patrolService.getAlerts()
    ]);
    patrols.value = patrolData || [];
    alerts.value = alertData || [];
  } catch (e) {
    console.error('SOC Store: Failed to fetch data', e);
    throw e;
  }
};

const handleMqttLocation = (topic, payload) => {
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : (typeof payload?.toString === 'function' ? JSON.parse(payload.toString()) : payload);
    const parts = topic.split('/');
    
    // Resolve device ID & guard ID from topic or payload
    let deviceId = data.deviceId || data.device_id || (parts.length > 2 ? parts[parts.length - 1] : 'unknown');
    let guardId = data.guard_id || data.guardId || data.employee_id || data.employeeId || data.personal_module_id || data.userId || deviceId;
    
    if (parts[0] === 'patrol' && parts[1] === 'live') {
      guardId = parts[3] || parts[2] || guardId;
    } else if (parts[0] === 'accesseasy' && parts[4] === 'guards') {
      guardId = parts[5] || guardId;
    }

    const guardName = data.guard_name || data.guardName || data.name || (data.first_name ? `${data.first_name} ${data.last_name || ''}`.trim() : `Guard #${guardId}`);
    const lat = parseFloat(data.latitude ?? data.lat ?? data.gps_lat);
    const lng = parseFloat(data.longitude ?? data.lng ?? data.gps_lng);

    if (isNaN(lat) || isNaN(lng)) return;

    const existingIdx = guards.value.findIndex(g => String(g.id) === String(guardId) || String(g.deviceId) === String(deviceId));
    const updatedGuard = {
      id: guardId,
      deviceId,
      name: guardName,
      latitude: lat,
      longitude: lng,
      speed: parseFloat(data.speed || 0),
      accuracy: parseFloat(data.accuracy || data.accuracy_meters || 5),
      battery: data.battery ?? data.batteryLevel ?? data.battery_level,
      status: 'on_duty',
      lastSeen: new Date(),
      timestamp: data.timestamp || data.last_heartbeat || new Date().toISOString()
    };

    if (existingIdx >= 0) {
      guards.value[existingIdx] = { ...guards.value[existingIdx], ...updatedGuard };
    } else {
      guards.value.push(updatedGuard);
    }
    lastUpdated.value = new Date();
  } catch (e) {
    console.warn('[SOC Store] Failed to parse MQTT location payload:', e);
  }
};

const handleMqttAlert = (topic, payload) => {
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : (typeof payload?.toString === 'function' ? JSON.parse(payload.toString()) : payload);
    const alertId = data.id || `alert_${Date.now()}`;
    const existingIdx = alerts.value.findIndex(a => String(a.id) === String(alertId));
    
    if (existingIdx >= 0) {
      alerts.value[existingIdx] = { ...alerts.value[existingIdx], ...data };
    } else {
      alerts.value.unshift({
        id: alertId,
        title: data.title || 'Patrol Alert',
        severity: data.severity || 'warning',
        status: data.status || 'open',
        location: data.location || 'Site Patrol',
        description: data.description || data.notes || '',
        date_created: data.date_created || data.timestamp || new Date().toISOString(),
        ...data
      });
    }
    lastUpdated.value = new Date();
  } catch (e) {
    console.warn('[SOC Store] Failed to parse MQTT alert payload:', e);
  }
};

const handleMqttSos = (topic, payload) => {
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : (typeof payload?.toString === 'function' ? JSON.parse(payload.toString()) : payload);
    const alertId = data.id || `sos_${Date.now()}`;
    alerts.value.unshift({
      id: alertId,
      title: data.title || 'CRITICAL SOS ALERT',
      type: 'sos',
      severity: 'critical',
      status: 'open',
      location: data.location || `Lat: ${data.latitude || data.lat || 0}, Lng: ${data.longitude || data.lng || 0}`,
      latitude: data.latitude || data.lat,
      longitude: data.longitude || data.lng,
      reported_by: data.reported_by || data.guard_name || 'Guard',
      date_created: data.date_created || data.timestamp || new Date().toISOString(),
      ...data
    });
    lastUpdated.value = new Date();
    // Trigger desktop notification and alert tone via decoupled alert service
    alertNotificationService.notify(data);
  } catch (e) {
    console.warn('[SOC Store] Failed to parse MQTT SOS payload:', e);
  }
};

const unsubs = [];

const setupMqttSubscriptions = () => {
  mqttService.connect();
  unsubs.forEach(u => typeof u === 'function' && u());
  unsubs.length = 0;

  // Canonical Contract Topics
  unsubs.push(mqttService.on('accesseasy/+/sites/+/guards/+/location', handleMqttLocation));
  unsubs.push(mqttService.on('accesseasy/+/sites/+/alerts/sos', handleMqttSos));
  unsubs.push(mqttService.on('accesseasy/+/sites/+/alerts/+', handleMqttSos));
  unsubs.push(mqttService.on('accesseasy/+/sites/+/alerts/incident', handleMqttSos));
  unsubs.push(mqttService.on('accesseasy/+/patrols/+/checkpoints', handleMqttAlert));
  unsubs.push(mqttService.on('accesseasy/+/patrols/+/status', handleMqttAlert));
  unsubs.push(mqttService.on('accesseasy/+/devices/+/telemetry', handleMqttLocation));

  // Multi-topic subscriptions covering all mobile app publish patterns
  unsubs.push(mqttService.on('fieldeasy_mobile/+/location', handleMqttLocation));
  unsubs.push(mqttService.on('fieldeasy_mobile/+/+', handleMqttLocation));
  unsubs.push(mqttService.on('device/fieldeasy_mobile/+/location', handleMqttLocation));
  unsubs.push(mqttService.on('device/location/+/+', handleMqttLocation));
  unsubs.push(mqttService.on('patrol/live/+/+', handleMqttLocation));
  unsubs.push(mqttService.on('patrol/+/alert', handleMqttAlert));
  unsubs.push(mqttService.on('patrol/alerts/+', handleMqttAlert));
  unsubs.push(mqttService.on('patrol/+/sos', handleMqttSos));
  unsubs.push(mqttService.on('patrol/alerts/sos/+', handleMqttSos));
};

const stopPolling = () => {
  if (socketInterval) {
    clearInterval(socketInterval);
    socketInterval = null;
  }
  unsubs.forEach(u => typeof u === 'function' && u());
  unsubs.length = 0;
  isConnected.value = false;
};

const setupLivePolling = () => {
  if (socketInterval) clearInterval(socketInterval);
  socketInterval = setInterval(async () => {
    try {
      await fetchAllData();
      lastUpdated.value = new Date();
    } catch (e) {
      console.warn('Silent polling failure', e);
    }
  }, 10000);
};

const initSocketConnection = async () => {
  if (isConnected.value && socketInterval) return;
  isLoading.value = true;
  try {
    await fetchAllData();
    setupMqttSubscriptions();
    isConnected.value = true;
    lastUpdated.value = new Date();
    setupLivePolling();
  } catch (e) {
    console.error('SOC Store: Connection failed', e);
    isConnected.value = false;
  } finally {
    isLoading.value = false;
  }
};

// ==========================================
// STORE INSTANCE
// ==========================================
const storeInstance = reactive({
  guards,
  patrols,
  alerts,
  visitors,
  isConnected,
  lastUpdated,
  isLoading,

  activePatrols,
  completedPatrols,
  sortedAlerts,
  criticalAlerts,
  kpiMetrics,

  initSocketConnection,
  stopPolling,
  fetchAllData
});

export const useSOCStore = () => storeInstance;
