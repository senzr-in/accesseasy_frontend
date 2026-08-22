import axios from 'axios';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const API_URL = import.meta.env.VITE_API_URL || 'https://appv1.fieldseasy.com/directus';

const getHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const employeeService = {
  /**
   * Fetch paginated list of employees with search & filtering from personalModule
   */
  async getEmployees({ page = 1, limit = 20, search = '', department = '', status = '', site = '' } = {}) {
    try {
      const activeTenantId = await currentUserTenant.getTenantIdAsync();
      const token = authService.getToken();
      if (!token) {
        return { data: [], total: 0, page, limit, totalPages: 1 };
      }

      const params = new URLSearchParams();
      if (activeTenantId) {
        params.append('filter[uniqueId][_icontains]', activeTenantId);
      }

      if (search && search.trim()) {
        const q = search.trim();
        params.append('filter[_or][0][employeeId][_icontains]', q);
        params.append('filter[_or][1][assignedUser][first_name][_icontains]', q);
        params.append('filter[_or][2][assignedUser][last_name][_icontains]', q);
        params.append('filter[_or][3][assignedUser][email][_icontains]', q);
      }

      if (department && department !== 'all') {
        params.append('filter[department][id][_eq]', department);
      }

      if (status && status !== 'all') {
        params.append('filter[status][_eq]', status);
      }

      if (site && site !== 'all') {
        params.append('filter[branch][_eq]', site);
      }

      // 1. Fetch total count
      let total = 0;
      try {
        const countParams = new URLSearchParams(params);
        countParams.append('aggregate[count]', 'id');
        const countRes = await fetch(`${API_URL}/items/personalModule?${countParams.toString()}`, {
          headers: getHeaders()
        });
        if (countRes.ok) {
          const countData = await countRes.json();
          total = Number(countData?.data?.[0]?.count?.id) || 0;
        }
      } catch (err) {
        console.warn('[employeeService] Count query failed:', err);
      }

      // 2. Fetch paginated records
      params.append('page', String(page));
      params.append('limit', String(limit));
      params.append('sort[]', '-date_created');

      const fields = [
        'id',
        'employeeId',
        'status',
        'accessOn',
        'registeredFace',
        'face',
        'finger',
        'uniqueId',
        'date_updated',
        'date_created',
        'assignedUser.id',
        'assignedUser.first_name',
        'assignedUser.last_name',
        'assignedUser.email',
        'assignedUser.phone',
        'assignedUser.avatar',
        'department.id',
        'department.departmentName',
        'branch',
        'assignedAccessLevel',
        'assignedCards.id'
      ].map(f => `fields[]=${f}`).join('&');

      let res = await fetch(`${API_URL}/items/personalModule?${params.toString()}&${fields}`, {
        headers: getHeaders()
      });

      if (!res.ok && activeTenantId) {
        // Fallback without tenant filter if needed
        const fallbackParams = new URLSearchParams(params);
        fallbackParams.delete('filter[uniqueId][_icontains]');
        res = await fetch(`${API_URL}/items/personalModule?${fallbackParams.toString()}&${fields}`, {
          headers: getHeaders()
        });
      }

      if (!res.ok) {
        return { data: [], total: 0, page, limit, totalPages: 1 };
      }

      const resData = await res.json();
      const rawList = resData.data || [];

      // Normalize format for components
      const normalizedData = rawList.map(e => ({
        id: e.id,
        employeeId: e.employeeId || e.id,
        first_name: e.firstName || e.assignedUser?.first_name || '',
        last_name: e.lastName || e.assignedUser?.last_name || '',
        email: e.personalEmail || e.assignedUser?.email || '',
        department: e.department?.departmentName || '',
        designation: e.designation || 'Staff',
        status: e.status === 'true' || e.status === 'Active' || e.status === 'active' ? 'Active' : (e.status || 'Inactive'),
        location: e.branch?.branchName || 'Main Campus',
        last_active: e.date_updated ? new Date(e.date_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        avatar: null,
        card_number: e.assignedCards?.[0]?.cardManagement_id?.rfidCard || null,
        biometric_enrolled: !!(e.finger || e.face || e.registeredFace),
        face_registered: !!(e.face || e.registeredFace),
        phone: e.personalPhone || e.assignedUser?.phone || '',
        raw: e
      }));

      if (!total && normalizedData.length > 0) {
        total = normalizedData.length;
      }

      return {
        data: normalizedData,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      };
    } catch (error) {
      console.error('[employeeService] Error fetching employees:', error);
      return { data: [], total: 0, page, limit, totalPages: 1 };
    }
  },

  /**
   * Get employee by ID
   */
  async getEmployeeById(id) {
    if (!id) return null;
    try {
      const res = await fetch(`${API_URL}/items/personalModule/${id}?fields=*.*`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        return data.data || null;
      }
    } catch (err) {
      console.error('[employeeService] getEmployeeById error:', err);
    }
    return null;
  },

  /**
   * Create a new employee in personalModule
   */
  async createEmployee(payload) {
    const activeTenantId = await currentUserTenant.getTenantIdAsync();
    const res = await fetch(`${API_URL}/items/personalModule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getHeaders()
      },
      body: JSON.stringify({
        ...payload,
        tenant: activeTenantId
      })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.errors?.[0]?.message || 'Failed to create employee');
    }
    return await res.json();
  },

  /**
   * Import batch employees
   */
  async importEmployees(records) {
    const activeTenantId = await currentUserTenant.getTenantIdAsync();
    const formattedRecords = records.map(r => ({
      ...r,
      tenant: activeTenantId
    }));
    const res = await fetch(`${API_URL}/items/personalModule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getHeaders()
      },
      body: JSON.stringify(formattedRecords)
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.errors?.[0]?.message || 'Failed to import employees');
    }
    return await res.json();
  },

  /**
   * Get recently active employees
   */
  async getRecentlyActive(limit = 6) {
    const { data } = await this.getEmployees({ limit });
    return data;
  }
};
