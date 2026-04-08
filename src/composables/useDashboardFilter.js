import { ref } from 'vue';

// Global state
const selectedBranch = ref('all');
const branches = ref([]);

export function useDashboardFilter() {
  const setBranch = (branchId) => {
    selectedBranch.value = branchId;
  };

  const setBranches = (newBranches) => {
    branches.value = newBranches;
  };

  return {
    selectedBranch,
    branches,
    setBranch,
    setBranches
  };
}
