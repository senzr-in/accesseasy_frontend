<template>
  <div class="payroll-summary-container">
    <!-- Toggleable Left Filter Sidebar -->
    <div class="filter-sidebar" :class="{ 'collapsed': isCollapsed }">
      <button class="toggle-btn" @click="toggleSidebar">
        {{ isCollapsed ? '▶' : '◀' }}
      </button>
      <payrollfilter v-if="!isCollapsed" @apply-filters="applyFilters"></payrollfilter>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <div class="header">
        <h1>Payroll Summary - {{ filters.monthYear || 'July 2025' }}</h1>
      </div>

      <!-- Right Side Card with Actions -->
      <div class="action-card">
        <h3>Actions</h3>
        <button @click="addSalary">Add Salary</button>

        <button @click="finalizePayroll">Finalize Payroll</button>
      </div>

      <!-- Payroll Summary Sections -->
      <div class="summary-sections">
        <div class="section">
          <h3>Finalized</h3>
          <p>{{ verifiedSalaries }} Staff</p>
        </div>
        <div class="section">
          <h3>Paid</h3>
          <p>{{ paidStaff }} Staff</p>
        </div>
      </div>

      <!-- Earning Details -->
      <div class="earning-details">
        <h3>Earning Details</h3>
        <div class="detail-item">
          <span>Overtime Pay</span>
          <span>{{ overtimePay }}</span>
        </div>
        <div class="detail-item">
          <span>Bonus</span>
          <span>{{ bonus }}</span>
        </div>
        <div class="detail-item">
          <span>Incentives</span>
          <span>{{ incentives }}</span>
        </div>
        <div class="detail-item">
          <span>Retention Pay</span>
          <span>{{ retentionPay }}</span>
        </div>
      </div>

      <!-- Verified Data Section -->
      <div class="verified-data">
        <h3>Verified Data</h3>
        <p>Salary Details Verified: {{ verifiedSalaries }} / {{ totalSalaries }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import payrollfilter from '@/components/common/filters/payrollfilter.vue';
import { authService } from '@/services/authService';

const route = useRoute();
const router = useRouter();

const isCollapsed = ref(false);
const loading = ref(false);
const filters = ref({});
const token = ref('');
const paidStaff = ref(0);
const overtimePay = ref('₹0.00');
const bonus = ref('₹0.00');
const incentives = ref('₹0.00');
const retentionPay = ref('₹0.00');
const verifiedSalaries = ref(0);
const totalSalaries = ref(0);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const applyFilters = async (newFilters) => {
  filters.value = newFilters;
  await fetchPayrollData();
};

const fetchPayrollData = async () => {
  loading.value = true;
  try {
    const baseUrl = `${import.meta.env.VITE_API_URL}/items/payrollVerification`;
    const monthYear = filters.value.monthYear || 'July 2025';
    const [monthName, year] = monthYear.split(' ');
    const monthIndex = new Date(Date.parse(`${monthName} 1, ${year}`)).getMonth() + 1;
    const monthStr = monthIndex.toString().padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;

    console.log('Fetching data for:', { monthYear, startDate });

    let filter = {
      "_and": [
        {
          "tenant": {
            "tenantId": {
              "_eq": "c06d5756-422f-42c7-a581-5b225c39b145"
            }
          }
        }
      ]
    };
    const params = new URLSearchParams({
      filter: JSON.stringify(filter),
      limit: '-1'
    });
    const url = `${baseUrl}?${params.toString()}`;
    
    console.log('API URL:', url);
    console.log('Request headers:', {
      'Authorization': `Bearer ${token.value.substring(0, 10)}...`,
      'Content-Type': 'application/json'
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const result = await response.json();
    console.log('Raw API response:', result);
    
    const items = result.data || [];
    console.log('Number of items fetched:', items.length);
    console.log('Sample item structure:', items.length > 0 ? items[0] : 'No items found');
    
    totalSalaries.value = items.length;
    
    let verifiedSalariesCount = 0;
    let paidStaffCount = 0;
    let overtimeSum = 0;
    let bonusSum = 0;
    let incentivesSum = 0;
    let retentionSum = 0;

    items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        id: item.id,
        salaryVerification: item.salaryVerification,
        salaryPaid: item.salaryPaid,
        benefits: item.benefits
      });

      if (item.salaryVerification === true) {
        verifiedSalariesCount++;
        
        if (item.salaryPaid === 'paid') {
          paidStaffCount++;
        }
        overtimeSum += item.benefits?.Overtime || 0;
        bonusSum += item.benefits?.BonusManual || 0;
        incentivesSum += item.benefits?.IncentiveManual || 0;
        retentionSum += item.benefits?.RetentionPayManual || 0;
      }
    });
    
    console.log('Aggregation results:', {
      totalSalaries: totalSalaries.value,
      verifiedSalaries: verifiedSalariesCount,
      paidStaff: paidStaffCount,
      overtimeSum,
      bonusSum,
      incentivesSum,
      retentionSum
    });

    verifiedSalaries.value = verifiedSalariesCount;
    paidStaff.value = paidStaffCount;
    overtimePay.value = '₹' + overtimeSum.toFixed(2);
    bonus.value = '₹' + bonusSum.toFixed(2);
    incentives.value = '₹' + incentivesSum.toFixed(2);
    retentionPay.value = '₹' + retentionSum.toFixed(2);
    
    console.log('Final computed values:', {
      verifiedSalaries: verifiedSalaries.value,
      paidStaff: paidStaff.value,
      overtimePay: overtimePay.value,
      bonus: bonus.value,
      incentives: incentives.value,
      retentionPay: retentionPay.value
    });

  } catch (error) {
    console.error('Error fetching payroll data:', error);
    console.error('Error details:', error.message);
  } finally {
    loading.value = false;
    console.log('Loading completed');
  }
};

const addSalary = () => {
 router.push('/employee-details/salary');
};

const runPayroll = () => {
  alert('Run Payroll feature coming soon!');
};

const finalizePayroll = () => {
 router.push('management');
};

onMounted(() => {
  token.value = authService.getToken();
  fetchPayrollData();
});
</script>

<style scoped>
.payroll-summary-container {
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
}

.filter-sidebar {
  width: 280px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  transition: width 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
}

.filter-sidebar.collapsed {
  width: 50px;
  padding: 10px;
}

.toggle-btn {
  position: absolute;
  top: 20px;
  right: -15px;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-btn:hover {
  background-color: #f1f3f5;
}

.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background-color: #f1f3f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.action-card {
  float: right;
  width: 220px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-left: 20px;
}

.action-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 15px;
}

.action-card button {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.action-card button:hover {
  background-color: #1d4ed8;
}

.summary-sections {
  display: flex;
  justify-content: space-around;
  margin: 30px 0;
  gap: 20px;
}

.section {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  text-align: center;
}

.section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 10px;
}

.section p {
  font-size: 16px;
  color: #4b5563;
}

.earning-details {
  margin: 30px 0;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.earning-details h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item span {
  font-size: 14px;
  color: #4b5563;
}

.detail-item span:last-child {
  font-weight: 500;
  color: #1f2937;
}

.verified-data {
  margin: 30px 0;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.verified-data h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 15px;
}

.verified-data p {
  font-size: 14px;
  color: #4b5563;
  margin: 8px 0;
}
</style>