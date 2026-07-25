import { ref, computed, reactive } from 'vue';
import { patrolService } from '@/services/patrolService';

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

// ==========================================
// GETTERS (Derived State)
// ==========================================

const activePatrols = computed(() => patrols.value.filter(p => p.status === 'active'));
const completedPatrols = computed(() => patrols.value.filter(p => p.status === 'completed'));

// Sort alerts newest first
const sortedAlerts = computed(() => {
  return [...alerts.value].sort((a, b) => {
    return b.id.localeCompare(a.id);
  });
});

const criticalAlerts = computed(() => sortedAlerts.value.filter(a => a.severity === 'error'));

// KPI Metrics used in the top bar
const kpiMetrics = computed(() => {
  const totalCheckpoints = activePatrols.value.reduce((acc, p) => acc + (p.checkpointsVisited || 0), 0)
    + completedPatrols.value.reduce((acc, p) => acc + (p.checkpointsVisited || 0), 0);

  return {
    guardsOnDuty: activePatrols.value.length,
    activePatrols: activePatrols.value.length,
    completedCheckpoints: totalCheckpoints,
    activeAlerts: alerts.value.length,
    criticalIncidents: criticalAlerts.value.length,
    visitorsInside: visitors.value.length
  }
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
    patrols.value = patrolData;
    alerts.value = alertData;
  } catch (e) {
    console.error('SOC Store: Failed to fetch data', e);
    throw e;
  }
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
  }, 5000); // Poll every 5 seconds for live guard tracking
};

const initSocketConnection = async () => {
  if (isConnected.value) return; // Prevent double init
  isLoading.value = true;
  try {
    await fetchAllData();
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
// Wrapping in reactive() mimics Pinia's behavior by automatically unwrapping refs in templates
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
  fetchAllData
});

export const useSOCStore = () => storeInstance;
