<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-hidden bg-black/25 transition-opacity"
      @click.self="close"
    >
      <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div class="w-screen max-w-lg bg-[#FFFFFF] border-l border-[#E5E7EB] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          <!-- 1. Drawer Header -->
          <div class="p-6 border-b border-[#E5E7EB] flex items-start justify-between">
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-base flex items-center justify-center border border-[#BFDBFE] shrink-0">
                {{ getInitials(employee?.first_name, employee?.last_name) }}
              </div>
              <div class="min-w-0">
                <h2 class="text-base font-bold text-[#111827] truncate">
                  {{ employee?.first_name }} {{ employee?.last_name }}
                </h2>
                <p class="text-xs text-[#6B7280] truncate mt-0.5">
                  {{ employee?.designation || 'Staff Member' }} &bull; {{ employee?.department || 'Operations' }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#059669]">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    {{ employee?.status || 'Active' }}
                  </span>
                  <span class="font-mono text-[11px] text-[#9CA3AF]">
                    {{ employee?.id ? `ID: ${employee.id.slice(0, 8)}` : 'EMP-002481' }}
                  </span>
                </div>
              </div>
            </div>

            <button
              class="w-7 h-7 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors cursor-pointer shrink-0"
              @click="close"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- 2. Navigation Tabs (Overview, Access, Biometrics, Attendance, Logs) -->
          <div class="flex items-center border-b border-[#E5E7EB] px-6 bg-[#F9FAFB] text-xs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="py-3 px-3 font-semibold border-b-2 transition-all cursor-pointer -mb-px"
              :class="[
                activeTab === tab.id
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#6B7280] hover:text-[#111827]'
              ]"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- 3. Tab Content Area -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#111827]">
            <!-- Tab 1: Overview -->
            <div v-if="activeTab === 'overview'" class="space-y-5">
              <div>
                <h4 class="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">
                  Personal Information
                </h4>
                <div class="grid grid-cols-2 gap-3">
                  <div class="p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF]">
                    <span class="text-[10px] text-[#9CA3AF]">First Name</span>
                    <p class="font-semibold text-[#111827] mt-0.5">{{ employee?.first_name || 'Rajesh' }}</p>
                  </div>
                  <div class="p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF]">
                    <span class="text-[10px] text-[#9CA3AF]">Last Name</span>
                    <p class="font-semibold text-[#111827] mt-0.5">{{ employee?.last_name || 'Kumar' }}</p>
                  </div>
                  <div class="p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] col-span-2">
                    <span class="text-[10px] text-[#9CA3AF]">Corporate Email</span>
                    <p class="font-semibold text-[#111827] mt-0.5">{{ employee?.email || 'rajesh.kumar@acme.corp' }}</p>
                  </div>
                  <div class="p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] col-span-2">
                    <span class="text-[10px] text-[#9CA3AF]">Phone Number</span>
                    <p class="font-semibold text-[#111827] mt-0.5">{{ employee?.phone || '+91 98765 43210' }}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">
                  Organization & Department
                </h4>
                <div class="grid grid-cols-2 gap-3">
                  <div class="p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF]">
                    <span class="text-[10px] text-[#9CA3AF]">Department</span>
                    <p class="font-semibold text-[#111827] mt-0.5">{{ employee?.department || 'Security' }}</p>
                  </div>
                  <div class="p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF]">
                    <span class="text-[10px] text-[#9CA3AF]">Role Level</span>
                    <p class="font-semibold text-[#111827] mt-0.5">{{ employee?.designation || 'Security Officer' }}</p>
                  </div>
                  <div class="p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF]">
                    <span class="text-[10px] text-[#9CA3AF]">Assigned Site</span>
                    <p class="font-semibold text-[#111827] mt-0.5">Headquarters (Main Tower)</p>
                  </div>
                  <div class="p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF]">
                    <span class="text-[10px] text-[#9CA3AF]">Workforce Status</span>
                    <p class="font-semibold text-[#059669] mt-0.5">Active & Verified</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 2: Access Permissions -->
            <div v-else-if="activeTab === 'access'" class="space-y-4">
              <div>
                <h4 class="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">
                  Assigned Access Group
                </h4>
                <div class="p-4 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-xs text-[#1E40AF]">Standard 24/7 Security Access</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DBEAFE] text-[#1D4ED8]">Active</span>
                  </div>
                  <p class="text-[11px] text-[#3B82F6]">Full authorization to primary entrances, security offices, and turnstiles.</p>
                </div>
              </div>

              <div>
                <h4 class="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
                  Authorized Entry Doors (4)
                </h4>
                <div class="space-y-2">
                  <div v-for="door in authorizedDoors" :key="door.name" class="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF]">
                    <div class="flex items-center gap-2.5">
                      <DoorClosed class="w-4 h-4 text-[#6B7280]" />
                      <span class="font-semibold text-[#111827]">{{ door.name }}</span>
                    </div>
                    <span class="text-[11px] text-[#6B7280]">{{ door.schedule }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 3: Biometrics & Credentials -->
            <div v-else-if="activeTab === 'biometrics'" class="space-y-4">
              <h4 class="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">
                Biometric Template Status
              </h4>

              <!-- Face -->
              <div class="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                    <ScanFace class="w-4 h-4" />
                  </div>
                  <div>
                    <p class="font-semibold text-[#111827]">Face Recognition Template</p>
                    <p class="text-[11px] text-[#6B7280]">3D Neural Embedding Synced</p>
                  </div>
                </div>
                <span class="px-2 py-1 rounded-md text-[10px] font-bold bg-[#ECFDF5] text-[#059669]">
                  Enrolled (99.4%)
                </span>
              </div>

              <!-- Fingerprint -->
              <div class="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                    <Fingerprint class="w-4 h-4" />
                  </div>
                  <div>
                    <p class="font-semibold text-[#111827]">Fingerprint Templates</p>
                    <p class="text-[11px] text-[#6B7280]">Right Thumb, Left Index</p>
                  </div>
                </div>
                <span class="px-2 py-1 rounded-md text-[10px] font-bold bg-[#ECFDF5] text-[#059669]">
                  2 Enrolled
                </span>
              </div>

              <!-- RFID Card -->
              <div class="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                    <CreditCard class="w-4 h-4" />
                  </div>
                  <div>
                    <p class="font-semibold text-[#111827]">Smart RFID Card</p>
                    <p class="text-[11px] font-mono text-[#6B7280]">{{ employee?.card_number || 'CRD-89421' }}</p>
                  </div>
                </div>
                <span class="px-2 py-1 rounded-md text-[10px] font-bold bg-[#F5F3FF] text-[#7C3AED]">
                  Active
                </span>
              </div>

              <!-- Mobile Pass -->
              <div class="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                    <Smartphone class="w-4 h-4" />
                  </div>
                  <div>
                    <p class="font-semibold text-[#111827]">NFC / BLE Mobile Pass</p>
                    <p class="text-[11px] text-[#6B7280]">Device Authenticated</p>
                  </div>
                </div>
                <span class="px-2 py-1 rounded-md text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB]">
                  Enabled
                </span>
              </div>
            </div>

            <!-- Tab 4: Attendance Analytics -->
            <div v-else-if="activeTab === 'attendance'" class="space-y-4">
              <h4 class="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">
                Attendance & Punctuality Summary
              </h4>

              <div class="grid grid-cols-3 gap-2.5 text-center">
                <div class="p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF]">
                  <p class="text-[10px] text-[#9CA3AF]">Punctuality</p>
                  <p class="text-base font-bold text-[#059669] mt-0.5">98.2%</p>
                </div>
                <div class="p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF]">
                  <p class="text-[10px] text-[#9CA3AF]">Avg Hours</p>
                  <p class="text-base font-bold text-[#111827] mt-0.5">8h 42m</p>
                </div>
                <div class="p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF]">
                  <p class="text-[10px] text-[#9CA3AF]">Leaves</p>
                  <p class="text-base font-bold text-[#2563EB] mt-0.5">2 Days</p>
                </div>
              </div>

              <div class="p-4 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] space-y-2">
                <p class="font-bold text-xs text-[#111827]">Today's Shift: General (09:00 AM – 06:00 PM)</p>
                <div class="flex items-center justify-between text-xs text-[#6B7280] pt-1">
                  <span>First Check-in: <strong class="text-[#059669]">08:52 AM</strong></span>
                  <span>Last Checkout: <strong class="text-[#111827]">In Progress</strong></span>
                </div>
              </div>
            </div>

            <!-- Tab 5: Access Logs -->
            <div v-else-if="activeTab === 'logs'" class="space-y-3">
              <h4 class="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">
                Recent Access Activity
              </h4>

              <div class="space-y-2">
                <div v-for="log in sampleLogs" :key="log.time" class="p-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-xs text-[#111827]">{{ log.door }}</p>
                    <p class="text-[10px] text-[#6B7280] mt-0.5">{{ log.method }} &bull; {{ log.time }}</p>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#059669]">
                    Granted
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Drawer Footer -->
          <div class="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-end gap-2">
            <button
              class="px-4 py-2 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F9FAFB] text-xs font-semibold text-[#374151] transition-colors cursor-pointer"
              @click="close"
            >
              Close
            </button>
            <button
              class="px-4 py-2 rounded-xl bg-[#111827] hover:bg-[#1F2937] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              @click="$emit('edit', employee); close();"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import {
  X, ScanFace, Fingerprint, CreditCard, Smartphone,
  DoorClosed
} from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  employee: Object,
  initialTab: {
    type: String,
    default: 'overview'
  }
});

const emit = defineEmits(['update:isOpen', 'edit', 'delete', 'close']);

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'access', label: 'Access' },
  { id: 'biometrics', label: 'Biometrics' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'logs', label: 'Logs' }
];

const activeTab = ref(props.initialTab || 'overview');

watch(() => props.initialTab, (newTab) => {
  if (newTab) activeTab.value = newTab;
});

const close = () => {
  emit('update:isOpen', false);
  emit('close');
};

const getInitials = (first, last) => {
  return `${(first?.[0] || 'E')}${(last?.[0] || '')}`.toUpperCase();
};

const authorizedDoors = [
  { name: 'Main Lobby Turnstiles (North)', schedule: '24/7 Unrestricted' },
  { name: 'Security Control Operations Center', schedule: '24/7 Authorized' },
  { name: 'B1 Secure Staff Entrance', schedule: '24/7 Unrestricted' },
  { name: 'Server & IT Room 3A', schedule: 'Escort Required' }
];

const sampleLogs = [
  { door: 'Main Lobby Turnstiles (North)', method: 'Face Recognition', time: 'Today at 08:52:14 AM' },
  { door: 'Security Operations Center B1', method: 'Fingerprint Sensor', time: 'Today at 10:14:02 AM' },
  { door: 'Main Lobby Turnstiles (South)', method: 'Smart RFID Card', time: 'Yesterday at 06:12:45 PM' }
];
</script>
