import { ref, onMounted } from 'vue';
import { biometricService } from '@/services/biometricService';
import { accessService } from '@/services/accessService';

export function useDeviceStatus() {
  const biometricHealth = ref(null);
  const accessOverview = ref(null);
  const isLoading = ref(true);

  const loadStatus = async () => {
    isLoading.value = true;
    try {
      const [bio, acc] = await Promise.all([
        biometricService.getBiometricHealth(),
        accessService.getAccessOverview()
      ]);
      biometricHealth.value = bio;
      accessOverview.value = acc;
    } catch (e) {
      console.error('[useDeviceStatus] Error loading health & equipment status:', e);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    loadStatus();
  });

  return {
    biometricHealth,
    accessOverview,
    isLoading,
    reload: loadStatus
  };
}
