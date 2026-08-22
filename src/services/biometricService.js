import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const API_URL = import.meta.env.VITE_API_URL || 'https://appv1.fieldseasy.com/directus';

const getHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const biometricService = {
  /**
   * Get biometric health metrics and device synchronization statistics from live database
   */
  async getBiometricHealth() {
    try {
      const activeTenantId = await currentUserTenant.getTenantIdAsync();
      const token = authService.getToken();
      if (!token) {
        return this.getEmptyHealth();
      }

      const tenantParam = activeTenantId ? `filter[tenant][tenantId][_eq]=${activeTenantId}` : '';

      // 1. Fetch employees to check face and fingerprint enrollment
      let totalEligible = 0;
      let faceEnrolledCount = 0;
      let fingerEnrolledCount = 0;

      try {
        let empUrl = `${API_URL}/items/personalModule?limit=-1&fields=id,registeredFace,face,finger,assignedFaceEmbed`;
        if (activeTenantId) {
          empUrl += `&filter[uniqueId][_icontains]=${encodeURIComponent(activeTenantId)}`;
        }
        let empRes = await fetch(empUrl, { headers: getHeaders() });
        if (!empRes.ok && activeTenantId) {
          empRes = await fetch(`${API_URL}/items/personalModule?limit=-1&fields=id,registeredFace,face,finger,assignedFaceEmbed`, { headers: getHeaders() });
        }
        if (empRes.ok) {
          const empData = await empRes.json();
          const emps = empData.data || [];
          totalEligible = emps.length;
          emps.forEach(e => {
            if (e.face || e.registeredFace || e.assignedFaceEmbed) faceEnrolledCount++;
            if (e.finger) fingerEnrolledCount++;
          });
        }
      } catch (e) {
        console.warn('[biometricService] error fetching employee biometric info:', e);
      }

      // 2. Fetch controllers
      let totalDevices = 0;
      let devicesOnline = 0;
      try {
        let ctrlUrl = `${API_URL}/items/controllers?limit=-1&fields=id,status,controllerStatus`;
        if (activeTenantId) {
          ctrlUrl += `&filter[tenant][_eq]=${encodeURIComponent(activeTenantId)}`;
        }
        let ctrlRes = await fetch(ctrlUrl, { headers: getHeaders() });
        if (!ctrlRes.ok && activeTenantId) {
          ctrlRes = await fetch(`${API_URL}/items/controllers?limit=-1&fields=id,status,controllerStatus`, { headers: getHeaders() });
        }
        if (ctrlRes.ok) {
          const ctrlData = await ctrlRes.json();
          const ctrls = ctrlData.data || [];
          totalDevices = ctrls.length;
          devicesOnline = ctrls.filter(c => 
            String(c.status).toLowerCase() === 'online' || 
            String(c.status).toLowerCase() === 'approved' || 
            String(c.controllerStatus).toLowerCase() === 'online' ||
            c.status === 1
          ).length;
        }
      } catch (e) {
        console.warn('[biometricService] error fetching controller devices:', e);
      }

      const faceScore = totalEligible > 0 ? Math.round((faceEnrolledCount / totalEligible) * 100) : 0;
      const fingerScore = totalEligible > 0 ? Math.round((fingerEnrolledCount / totalEligible) * 100) : 0;
      const devicesOffline = Math.max(0, totalDevices - devicesOnline);

      return {
        faceRecognition: {
          score: faceScore,
          status: faceScore > 80 ? 'Optimal' : (totalEligible > 0 ? 'Active' : 'No Data'),
          enrolledCount: faceEnrolledCount,
          totalEligible
        },
        fingerprintDevices: {
          score: fingerScore,
          status: fingerScore > 80 ? 'Operational' : (totalEligible > 0 ? 'Active' : 'No Data'),
          enrolledCount: fingerEnrolledCount,
          totalEligible
        },
        credentialSync: {
          score: totalDevices > 0 ? Math.round((devicesOnline / totalDevices) * 100) : 100,
          status: devicesOffline > 0 ? 'Sync Pending' : 'Fully Synced',
          pendingSync: devicesOffline,
          syncedCount: devicesOnline,
          totalDevices
        },
        summary: {
          devicesOnline,
          devicesOffline,
          requiresSync: devicesOffline
        }
      };
    } catch (err) {
      console.error('[biometricService] Error getting biometric health:', err);
      return this.getEmptyHealth();
    }
  },

  getEmptyHealth() {
    return {
      faceRecognition: { score: 0, status: 'No Data', enrolledCount: 0, totalEligible: 0 },
      fingerprintDevices: { score: 0, status: 'No Data', enrolledCount: 0, totalEligible: 0 },
      credentialSync: { score: 0, status: 'No Devices', pendingSync: 0, syncedCount: 0, totalDevices: 0 },
      summary: { devicesOnline: 0, devicesOffline: 0, requiresSync: 0 }
    };
  }
};
