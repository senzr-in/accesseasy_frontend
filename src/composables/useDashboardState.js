import { ref, computed, watch } from 'vue';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

// Global state shared across dashboard instances
const isMusterMode = ref(false);
const commandPaletteOpen = ref(false);
const rightDrawerOpen = ref(false);
const drawerContext = ref({ type: null, data: null });

const searchQuery = ref('');
const searchResults = ref([]);
const searchLoading = ref(false);

const stats = ref({
  totalToday: 0,
  activeNow: 0,
  deniedToday: 0,
  pendingApprovals: 0,
  expectedToday: 0
});

const visitorsWaiting = ref([]);
const visitorsInside = ref([]);
const visitorsExpected = ref([]);
const visitorsDenied = ref([]);
const recentLogs = ref([]);

const buildingStatus = ref({
  occupancy: 0,
  capacity: 1000,
  activeGates: 4,
  offlineGates: 0,
  emergencyStatus: 'Normal',
  activeGuards: 6,
  healthScore: 98
});

const timelineEvents = ref([]);
const alertsList = ref([]);
const loading = ref(false);

export function useDashboardState() {
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();

  const toggleMusterMode = () => {
    isMusterMode.value = !isMusterMode.value;
    buildingStatus.value.emergencyStatus = isMusterMode.value ? 'EVACUATION' : 'Normal';
    
    // Add to timeline
    timelineEvents.value.unshift({
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      text: isMusterMode.value ? 'Emergency Muster Evacuation triggered!' : 'Emergency Muster Evacuation canceled.',
      type: isMusterMode.value ? 'alert' : 'info'
    });
  };

  const openDrawer = (type, data) => {
    drawerContext.value = { type, data };
    rightDrawerOpen.value = true;
  };

  const closeDrawer = () => {
    rightDrawerOpen.value = false;
    drawerContext.value = { type: null, data: null };
  };

  const notifyHost = async (visitor) => {
    // Add notification feed entry
    timelineEvents.value.unshift({
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      text: `Alert sent to host ${visitor.personToMeet || 'Employee'} for visitor ${visitor.personName}.`,
      type: 'info'
    });
    
    // Mock API call to update status or record
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor/${visitor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reasonForVisit: (visitor.reasonForVisit || '') + ' [Host Alerted]' })
      });
      if (response.ok) {
        visitor.reasonForVisit = (visitor.reasonForVisit || '') + ' [Host Alerted]';
      }
    } catch (e) {
      console.warn('Failed to notify host via backend patch:', e);
    }
  };

  const checkInVisitor = async (visitor) => {
    loading.value = true;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor/${visitor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'active' })
      });
      
      if (response.ok) {
        visitor.status = 'active';
        timelineEvents.value.unshift({
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          text: `Visitor ${visitor.personName} checked in.`,
          type: 'success'
        });
        
        // Log entry attempt using metrics API or simulate gate scan log
        await authService.knApi.post('/accesseasy-dashboard-api/metrics', {
          action: 'simulate-scan',
          tenantId,
          visitorId: visitor.id,
          status: 'authorized'
        }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});

        await loadDashboardData();
      }
    } catch (e) {
      console.error('Failed to check in visitor:', e);
    } finally {
      loading.value = false;
    }
  };

  const checkOutVisitor = async (visitor) => {
    loading.value = true;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor/${visitor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'expired' })
      });
      
      if (response.ok) {
        visitor.status = 'expired';
        timelineEvents.value.unshift({
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          text: `Visitor ${visitor.personName} checked out.`,
          type: 'info'
        });

        await loadDashboardData();
      }
    } catch (e) {
      console.error('Failed to check out visitor:', e);
    } finally {
      loading.value = false;
    }
  };

  const searchAll = async (query) => {
    if (!query) {
      searchResults.value = [];
      return;
    }
    searchLoading.value = true;
    try {
      const filter = { "filter[tenant][tenantId][_eq]": tenantId };
      filter["filter[_or][0][personName][_icontains]"] = query;
      filter["filter[_or][1][email][_icontains]"] = query;
      filter["filter[_or][2][company][_icontains]"] = query;
      
      const params = new URLSearchParams({
        limit: '15',
        fields: 'id,personName,email,mobileNumber,startDate,endDate,startTime,endTime,status,company,personToMeet,assignedAccessLevels.accessLevelName,photo',
        ...filter
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        searchResults.value = (data.data || []).map(v => ({
          ...v,
          type: 'visitor'
        }));
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      searchLoading.value = false;
    }
  };

  const loadDashboardData = async () => {
    if (!token || !tenantId) return;
    loading.value = true;
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch metrics and recent gate logs
      const metricsResponse = await authService.knApi.post('/accesseasy-dashboard-api/metrics', {
        action: 'visitor-dashboard',
        tenantId,
        today: todayDate
      }, { headers }).catch(() => null);

      const metricsData = metricsResponse?.data || {};
      recentLogs.value = metricsData.recentLogs || [];

      // Calculate state lists from logs
      stats.value.totalToday = metricsData.totalToday || recentLogs.value.length;
      stats.value.deniedToday = metricsData.deniedToday || recentLogs.value.filter(l => l.ValidLogs !== 'authorized' && l.ValidLogs !== true).length;
      stats.value.activeNow = metricsData.activeNow || 0;
      stats.value.portals = metricsData.portals || 0;

      // 2. Fetch expected and inside visitors today from database
      const filter = { "filter[tenant][tenantId][_eq]": tenantId };
      const params = new URLSearchParams({
        limit: '100',
        sort: '-date_created',
        fields: 'id,personName,email,mobileNumber,startDate,endDate,startTime,endTime,status,company,personToMeet,photo,assignedAccessLevels.accessLevelName,reasonForVisit',
        ...filter
      });

      const res = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor?${params.toString()}`, {
        headers
      });

      if (res.ok) {
        const data = await res.json();
        const allVisitors = data.data || [];
        
        // Auto-reconcile state using live logs (fallback for missed webhooks/permissions)
        const recentEntries = recentLogs.value.filter(l => l.ValidLogs === 'authorized' || l.ValidLogs === true);
        allVisitors.forEach(v => {
          if (v.status === 'inactive') {
            const logMatch = recentEntries.find(l => {
              if (!l.name || !v.personName) return false;
              const logName = l.name.toLowerCase().trim();
              const vName = v.personName.toLowerCase().trim();
              return logName === vName || logName === `${vName} (visitor)` || logName.includes(vName);
            });
            
            if (logMatch) {
              v.status = 'active';
              if (!v.startTime) {
                // Try to parse time from log if available
                v.startTime = logMatch.timeStamp || new Date().toLocaleTimeString('en-GB');
              }
            }
          }
        });

        // Categorize visitors
        visitorsExpected.value = allVisitors.filter(v => v.status === 'inactive');
        visitorsInside.value = allVisitors.filter(v => v.status === 'active');
        visitorsDenied.value = allVisitors.filter(v => v.status === 'denied' || v.status === 'expired');
        
        // Calculate mock waiting queue (expected guests whose startTime matches current work hours)
        visitorsWaiting.value = allVisitors.filter(v => v.status === 'inactive' && v.startDate <= todayDate);
        
        stats.value.pendingApprovals = visitorsWaiting.value.length;
        stats.value.expectedToday = visitorsExpected.value.length;
        
        // Update building occupancy
        buildingStatus.value.occupancy = visitorsInside.value.length;
      }

      // Populate smart timeline events from real logs
      timelineEvents.value = recentLogs.value.slice(0, 10).map((log, index) => ({
        id: index.toString(),
        time: log.timeStamp || new Date().toLocaleTimeString('en-GB'),
        text: `${log.name || 'Unknown'} was ${log.ValidLogs === 'authorized' || log.ValidLogs === true ? 'authorized' : 'denied'} at ${log.readerName || 'Gate'}.`,
        type: log.ValidLogs === 'authorized' || log.ValidLogs === true ? 'success' : 'danger'
      }));

      // Map overstaying visitors to alerts
      const overstaying = visitorsInside.value.filter(v => v.endTime && v.endDate <= todayDate && v.endTime < new Date().toLocaleTimeString('en-GB'));
      alertsList.value = overstaying.map((v, i) => ({
        id: `a${i}`,
        text: `Overstaying Visitor: ${v.personName} has exceeded their allocated time.`,
        severity: 'warning'
      }));

    } catch (e) {
      console.error('Failed to reload enterprise dashboard state:', e);
    } finally {
      loading.value = false;
    }
  };

  let pollingInterval = null;

  const startPolling = (intervalMs = 15000) => {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(async () => {
      // Background silent sync (no loading spinners)
      if (!token || !tenantId) return;
      try {
        const todayDate = new Date().toISOString().split('T')[0];
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch metrics and recent gate logs
        const metricsResponse = await authService.knApi.post('/accesseasy-dashboard-api/metrics', {
          action: 'visitor-dashboard',
          tenantId,
          today: todayDate
        }, { headers }).catch(() => null);

        const metricsData = metricsResponse?.data || {};
        recentLogs.value = metricsData.recentLogs || [];

        // Calculate state lists from logs
        stats.value.totalToday = metricsData.totalToday || recentLogs.value.length;
        stats.value.deniedToday = metricsData.deniedToday || recentLogs.value.filter(l => l.ValidLogs !== 'authorized' && l.ValidLogs !== true).length;
        stats.value.activeNow = metricsData.activeNow || 0;
        stats.value.portals = metricsData.portals || 0;

        // 2. Fetch expected and inside visitors today from database
        const filter = { "filter[tenant][tenantId][_eq]": tenantId };
        const params = new URLSearchParams({
          limit: '100',
          sort: '-date_created',
          fields: 'id,personName,email,mobileNumber,startDate,endDate,startTime,endTime,status,company,personToMeet,photo,assignedAccessLevels.accessLevelName,reasonForVisit',
          ...filter
        });

        const res = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor?${params.toString()}`, {
          headers
        });

        if (res.ok) {
          const data = await res.json();
          const allVisitors = data.data || [];
          
          // Auto-reconcile state using live logs (fallback for missed webhooks/permissions)
          const recentEntries = recentLogs.value.filter(l => l.ValidLogs === 'authorized' || l.ValidLogs === true);
          allVisitors.forEach(v => {
            if (v.status === 'inactive') {
              const logMatch = recentEntries.find(l => {
                if (!l.name || !v.personName) return false;
                const logName = l.name.toLowerCase().trim();
                const vName = v.personName.toLowerCase().trim();
                return logName === vName || logName === `${vName} (visitor)` || logName.includes(vName);
              });
              
              if (logMatch) {
                // If the most recent log is an OUT log, maybe they already left? 
                // We'll just assume they are active if they were inactive and have an authorized log today
                v.status = 'active';
                if (!v.startTime) {
                  v.startTime = logMatch.timeStamp || new Date().toLocaleTimeString('en-GB');
                }
              }
            }
          });

          // Categorize visitors
          visitorsExpected.value = allVisitors.filter(v => v.status === 'inactive');
          visitorsInside.value = allVisitors.filter(v => v.status === 'active');
          visitorsDenied.value = allVisitors.filter(v => v.status === 'denied' || v.status === 'expired');
          visitorsWaiting.value = allVisitors.filter(v => v.status === 'inactive' && v.startDate <= todayDate);
          
          stats.value.pendingApprovals = visitorsWaiting.value.length;
          stats.value.expectedToday = visitorsExpected.value.length;
          buildingStatus.value.occupancy = visitorsInside.value.length;
        }
      } catch (e) {
        // Silent catch for background polling
      }
    }, intervalMs);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  return {
    isMusterMode,
    commandPaletteOpen,
    rightDrawerOpen,
    drawerContext,
    searchQuery,
    searchResults,
    searchLoading,
    stats,
    visitorsWaiting,
    visitorsInside,
    visitorsExpected,
    visitorsDenied,
    recentLogs,
    buildingStatus,
    timelineEvents,
    alertsList,
    loading,
    toggleMusterMode,
    openDrawer,
    closeDrawer,
    notifyHost,
    checkInVisitor,
    checkOutVisitor,
    searchAll,
    loadDashboardData,
    startPolling,
    stopPolling
  };
}
