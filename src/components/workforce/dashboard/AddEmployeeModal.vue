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
            <h3 class="text-sm font-bold text-[#171717]">Add New Employee</h3>
            <p class="text-xs text-[#6B6B6B] mt-0.5">Enroll employee profile into directory & access controller</p>
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
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-medium text-[#171717] mb-1">First Name *</label>
              <input
                v-model="form.first_name"
                type="text"
                required
                placeholder="e.g. John"
                class="form-input"
              >
            </div>
            <div>
              <label class="block font-medium text-[#171717] mb-1">Last Name *</label>
              <input
                v-model="form.last_name"
                type="text"
                required
                placeholder="e.g. Doe"
                class="form-input"
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-medium text-[#171717] mb-1">Email Address *</label>
              <input
                v-model="form.email"
                type="email"
                required
                placeholder="john.doe@company.com"
                class="form-input"
              >
            </div>
            <div>
              <label class="block font-medium text-[#171717] mb-1">Phone Number</label>
              <input
                v-model="form.phone"
                type="text"
                placeholder="+1 (555) 000-0000"
                class="form-input"
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-medium text-[#171717] mb-1">Department *</label>
              <select v-model="form.department" required class="form-input">
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="Security">Security</option>
                <option value="Finance">Finance</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
              </select>
            </div>
            <div>
              <label class="block font-medium text-[#171717] mb-1">Access Group</label>
              <select v-model="form.access_group" class="form-input">
                <option value="General Staff">General Staff (08:00 - 19:00)</option>
                <option value="Executive 24/7">Executive 24/7 (All Zones)</option>
                <option value="Security & Facility">Security & Facilities</option>
                <option value="Visitor Temporary">Visitor Temporary</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-medium text-[#171717] mb-1">RFID Card Number (Optional)</label>
            <input
              v-model="form.card_number"
              type="text"
              placeholder="e.g. CRD-99201"
              class="form-input font-mono"
            >
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
              {{ isSubmitting ? 'Adding Employee...' : 'Add Employee' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { X } from 'lucide-vue-next';
import { employeeService } from '@/services/employeeService';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['update:isOpen', 'success']);

const isSubmitting = ref(false);

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  department: 'Engineering',
  access_group: 'General Staff',
  card_number: ''
});

const close = () => {
  emit('update:isOpen', false);
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const res = await employeeService.createEmployee({ ...form });
    emit('success', res);
    close();
  } catch (err) {
    console.error('Failed to create employee:', err);
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
