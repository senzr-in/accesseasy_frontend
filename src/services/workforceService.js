import axios from 'axios';
import { authService } from '@/services/authService';

const getHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const API_URL = import.meta.env.VITE_API_URL || 'https://appv1.fieldseasy.com/directus';

export const workforceService = {
  /**
   * Fetch aggregated workforce KPI metrics
   */
  async getDashboardKPIs(filter = {}) {
    try {
      // In real deployment, can query /items/workforce_kpi or aggregate from employees/attendance
      return {
        totalEmployees: { value: 2486, change: '+4.2%', period: 'vs last month', trend: 'up' },
        presentToday: { value: 1842, rate: '74.1%', period: 'of workforce', trend: 'up' },
        currentlyOnSite: { value: 1731, subtext: 'Live on-premise', trend: 'live' },
        attendanceRate: { value: '97.4%', change: '+1.2%', period: 'vs last week', trend: 'up' },
      };
    } catch (error) {
      console.error('[workforceService] Error fetching KPIs:', error);
      throw error;
    }
  },

  /**
   * Fetch workforce presence breakdown
   */
  async getPresenceBreakdown(filter = {}) {
    return {
      total: 2486,
      onSite: 1731,
      remote: 312,
      onLeave: 87,
      absent: 356,
      onSitePercentage: 69.6,
      departments: [
        { name: 'Engineering', onSite: 540, remote: 140, total: 680 },
        { name: 'Operations', onSite: 420, remote: 20, total: 440 },
        { name: 'Security', onSite: 310, remote: 0, total: 310 },
        { name: 'Sales & Marketing', onSite: 240, remote: 110, total: 350 },
        { name: 'Finance & HR', onSite: 221, remote: 42, total: 263 },
      ]
    };
  },

  /**
   * Fetch filter options (Organizations, Sites, Departments, Teams, Shifts)
   */
  async getFilterOptions() {
    return {
      organizations: [
        { id: 'all', name: 'All Organizations' },
        { id: 'acme_hq', name: 'Acme Corporation' },
        { id: 'acme_tech', name: 'Acme Technologies' },
        { id: 'acme_logistics', name: 'Acme Logistics' }
      ],
      sites: [
        { id: 'all', name: 'All Sites' },
        { id: 'site_nyc', name: 'Global HQ - New York' },
        { id: 'site_sf', name: 'Tech Campus - San Francisco' },
        { id: 'site_blr', name: 'APAC Hub - Bengaluru' },
        { id: 'site_ldn', name: 'EMEA Office - London' }
      ],
      departments: [
        { id: 'all', name: 'All Departments' },
        { id: 'eng', name: 'Engineering' },
        { id: 'ops', name: 'Operations' },
        { id: 'sec', name: 'Security' },
        { id: 'fin', name: 'Finance' },
        { id: 'hr', name: 'Human Resources' },
        { id: 'sales', name: 'Sales & Marketing' }
      ],
      teams: [
        { id: 'all', name: 'All Teams' },
        { id: 'backend', name: 'Backend Platform' },
        { id: 'frontend', name: 'Frontend Web' },
        { id: 'devops', name: 'Cloud Infrastructure' },
        { id: 'facilities', name: 'Facilities & Guard' }
      ],
      shifts: [
        { id: 'all', name: 'All Shifts' },
        { id: 'morning', name: 'General / Morning (09:00 - 18:00)' },
        { id: 'afternoon', name: 'Afternoon Shift (13:00 - 22:00)' },
        { id: 'night', name: 'Night Shift (22:00 - 06:00)' }
      ]
    };
  }
};
