<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 animate-in fade-in duration-150"
      @click.self="close"
    >
      <div class="w-full max-w-lg bg-[#FFFFFF] border border-[#E8E8E8] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-[#E8E8E8] flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-[#171717]">Register Access Device</h3>
            <p class="text-xs text-[#6B6B6B] mt-0.5">Enroll biometric terminal, turnstile, or controller</p>
          </div>
          <button
            class="w-7 h-7 rounded-md border border-[#E8E8E8] flex items-center justify-center text-[#6B6B6B] hover:text-[#171717] hover:bg-[#F7F7F8] transition-colors cursor-pointer"
            @click="close"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4 text-xs">
          <div>
            <label class="block font-medium text-[#171717] mb-1">Device Name *</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g. Main Lobby Face Terminal 01"
              class="form-input"
            >
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-medium text-[#171717] mb-1">Device Category *</label>
              <select v-model="form.type" required class="form-input">
                <option value="Face Terminal">Face Recognition Terminal</option>
                <option value="Fingerprint Terminal">Fingerprint Terminal</option>
                <option value="Turnstile Controller">Turnstile Controller</option>
                <option value="RFID Door Reader">RFID Door Reader</option>
                <option value="4-Door Master Controller">4-Door Master Controller</option>
              </select>
            </div>
            <div>
              <label class="block font-medium text-[#171717] mb-1">IP Address / Host *</label>
              <input
                v-model="form.ip"
                type="text"
                required
                placeholder="192.168.1.150"
                class="form-input font-mono"
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-medium text-[#171717] mb-1">Gateway UUID / MAC</label>
              <input
                v-model="form.uuid"
                type="text"
                placeholder="e.g. 78-2B-CB-A1-89"
                class="form-input font-mono"
              >
            </div>
            <div>
              <label class="block font-medium text-[#171717] mb-1">Assigned Zone</label>
              <select v-model="form.zone" class="form-input">
                <option value="">General Area</option>
                <option v-for="z in availableZones" :key="z.id" :value="z.id">
                  {{ z.zoneName || z.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="pt-4 border-t border-[#E8E8E8] flex items-center justify-end gap-2.5">
            <button
              type="button"
              class="px-4 py-2 rounded-lg border border-[#E8E8E8] font-medium text-xs text-[#171717] hover:bg-[#F7F7F8] transition-colors cursor-pointer"
              @click="close"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 rounded-lg bg-[#171717] text-[#FFFFFF] font-medium text-xs hover:bg-[#2D2D2D] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {{ isSubmitting ? 'Registering...' : 'Register Device' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { X } from 'lucide-vue-next';
import { deviceService } from '@/services/deviceService';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['update:isOpen', 'success']);

const isSubmitting = ref(false);
const availableZones = ref([]);

const form = reactive({
  name: '',
  type: 'Face Terminal',
  ip: '',
  uuid: '',
  zone: ''
});

onMounted(async () => {
  try {
    const activeTenantId = await currentUserTenant.getTenantIdAsync();
    const token = authService.getToken();
    if (!token) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/zones?filter[tenant][_eq]=${activeTenantId}&limit=-1&fields=id,zoneName`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      availableZones.value = data.data || [];
    }
  } catch (err) {
    console.warn('Error loading zones:', err);
  }
});

const close = () => {
  emit('update:isOpen', false);
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const res = await deviceService.registerDevice({ ...form });
    emit('success', res);
    close();
  } catch (err) {
    console.error('Failed to register device:', err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.form-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid #E8E8E8;
  background-color: #FFFFFF;
  color: #171717;
  outline: none;
  transition: border-color 0.15s ease;
}

.form-input:focus {
  border-color: #3478F6;
}
</style>
