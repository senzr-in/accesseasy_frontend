import { ref, computed, reactive } from 'vue';
import { patrolService } from '@/services/patrolService';
import { mqttService } from '@/services/mqttService';

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
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const parts = topic.split('/');
    const deviceId = parts[2] || data.deviceId || data.device_id || 'unknown';
    const guardId = data.guard_id || data.guardId || deviceId;
    const guardName = data.guard_name || data.guardName || data.name || \Guard \;
    const lat = parseFloat(data.latitude ?? data.lat);
    const lng = parseFloat(data.longitude ?? data.lng);

    if (isNaN(lat) || isNaN(lng)) return;

    const existingIdx = guards.value.findIndex(g => g.id === guardId || g.deviceId === deviceId);
    const updatedGuard = {
      id: guardId,
      deviceId,
      name: guardName,
      latitude: lat,
      longitude: lng,
      speed: data.speed || 0,
      accuracy: data.accuracy || 5,
      battery: data.battery || data.batteryLevel,
      status: 'on_duty',
      lastSeen: new Date(),
      timestamp: data.timestamp || new Date().toISOString()
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
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const alertId = data.id || \lert_\;
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
        description: data.description || '',
        date_created: data.date_created || new Date().toISOString(),
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
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const alertId = data.id || \sos_\;
    alerts.value.unshift({
      id: alertId,
      title: data.title || 'CRITICAL SOS ALERT',
      type: 'sos',
      severity: 'critical',
      status: 'open',
      location: data.location || \Lat: \, Lng: \,
      latitude: data.latitude,
      longitude: data.longitude,
      reported_by: data.reported_by || 'Guard',
      date_created: new Date().toISOString(),
      ...data
    });
    lastUpdated.value = new Date();
    // Play alert sound if available
    try {
      const audio = new Audio('/sounds/sos-alarm.mp3');
      audio.play().catch(() => {});
    } catch (_) {}
  } catch (e) {
    console.warn('[SOC Store] Failed to parse MQTT SOS payload:', e);
  }
};

const setupMqttSubscriptions = () => {
  mqttService.connect();
  if (unsubMqttLocation) unsubMqttLocation();
  if (unsubMqttAlert) unsubMqttAlert();
  if (unsubMqttSos) unsubMqttSos();

  unsubMqttLocation = mqttService.on('device/fieldeasy_mobile/+/location', handleMqttLocation);
  unsubMqttAlert = mqttService.on('patrol/+/alert', handleMqttAlert);
  unsubMqttSos = mqttService.on('patrol/+/sos', handleMqttSos);
};

const stopPolling = () => {
  if (socketInterval) {
    clearInterval(socketInterval);
    socketInterval = null;
  }
  if (unsubMqttLocation) { unsubMqttLocation(); unsubMqttLocation = null; }
  if (unsubMqttAlert) { unsubMqttAlert(); unsubMqttAlert = null; }
  if (unsubMqttSos) { unsubMqttSos(); unsubMqttSos = null; }
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
