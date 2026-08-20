<template>
  <div class="flex h-screen bg-[#F8FAFC] overflow-hidden text-[#0F172A] font-sans antialiased">
    <AlarmBanner />
    <div class="flex w-full h-full overflow-hidden">
      <!-- Sidebar -->
      <component :is="activeSidebar" />

      <!-- Main Content Area -->
      <div class="flex flex-1 flex-col overflow-hidden min-w-0">
        <!-- Header -->
        <header class="flex h-14 shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-[#FFFFFF] px-6 gap-4 z-40 relative shadow-2xs">
          <!-- Left Header: Minimalist Platform Indicator / Breadcrumb -->
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xs font-semibold text-[#64748B]">Workforce</span>
            <span class="text-xs text-[#CBD5E1]">/</span>
            <span class="text-xs font-bold text-[#0F172A] truncate">{{ currentPageTitle }}</span>
          </div>

          <!-- Right Header: Search, Notifications, & Admin Profile -->
          <div class="flex items-center gap-3">
            <!-- Search Trigger / Input -->
            <button
              class="flex items-center gap-2.5 h-9 px-3.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] text-xs text-[#64748B] hover:text-[#0F172A] transition-all cursor-pointer shadow-2xs"
              @click="isSearchModalOpen = true"
            >
              <Search class="w-3.5 h-3.5 text-[#64748B]" />
              <span class="hidden sm:inline">Search anything...</span>
              <kbd class="hidden sm:inline-block text-[10px] bg-[#FFFFFF] border border-[#CBD5E1] text-[#64748B] px-1.5 py-0.5 rounded font-mono shadow-2xs">
                ⌘K
              </kbd>
            </button>

            <!-- Notifications Dropdown -->
            <div ref="notificationsDropdownRef" class="relative">
              <button
                class="w-9 h-9 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer shadow-2xs"
                @click="isNotificationsOpen = !isNotificationsOpen"
              >
                <Bell class="w-4 h-4" />
                <span
                  v-if="activeAlertsCount > 0 && !hasSeenAlerts"
                  class="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white"
                />
              </button>

              <!-- Notifications Menu -->
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="isNotificationsOpen"
                  class="absolute right-0 mt-2 w-80 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xl py-2 z-50 origin-top-right overflow-hidden"
                >
                  <div class="px-4 py-2 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                    <div>
                      <p class="text-xs font-bold text-[#0F172A]">Alerts & Notifications</p>
                      <p class="text-[10px] text-[#64748B]">Real-time security & access logs</p>
                    </div>
                    <button
                      v-if="activeAlertsCount > 0"
                      class="text-[10px] font-semibold text-[#2563EB] hover:underline"
                      @click="resolveAllAlerts"
                    >
                      Clear All
                    </button>
                  </div>

                  <div class="max-h-72 overflow-y-auto divide-y divide-[#F1F5F9]">
                    <div
                      v-for="alert in activeAlertsList"
                      :key="alert.id"
                      class="p-3 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                      @click="openAlertDetails(alert)"
                    >
                      <div class="flex items-start gap-2.5">
                        <div class="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center shrink-0 mt-0.5">
                          <AlertCircle class="w-4 h-4" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-xs font-semibold text-[#0F172A]">{{ alert.title || 'Security Warning' }}</p>
                          <p class="text-[11px] text-[#64748B] mt-0.5 leading-snug">{{ alert.message || alert.type }}</p>
                          <span class="text-[9px] text-[#94A8B8] font-mono mt-1 block">{{ getFormattedAlertTime(alert.date_created) }}</span>
                        </div>
                      </div>
                    </div>

                    <div v-if="activeAlertsCount === 0" class="py-8 text-center text-xs text-[#94A3B8]">
                      No active alerts. System healthy.
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <!-- Admin Profile Indicator -->
            <div class="flex items-center gap-2.5 pl-2 border-l border-[#E2E8F0]">
              <div class="w-8 h-8 rounded-full bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {{ userInitials }}
              </div>
              <div class="hidden lg:flex flex-col text-left">
                <span class="text-xs font-semibold text-[#0F172A] leading-tight">{{ userName }}</span>
                <span class="text-[10px] font-medium text-[#64748B]">{{ userRole }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Canvas -->
        <main class="flex-1 flex flex-col overflow-hidden relative bg-[#F8FAFC]">
          <router-view class="flex-1 min-h-0" />
        </main>
      </div>
    </div>

    <!-- Global Spotlight Search Modal -->
    <GlobalSearchModal
      :is-open="isSearchModalOpen"
      @update:is-open="isSearchModalOpen = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { onClickOutside } from '@vueuse/core';
import { Search, Bell, AlertCircle } from 'lucide-vue-next';
import SecuritySidebar from '@/components/layout/SecuritySidebar.vue';
import WorkforceSidebar from '@/components/layout/WorkforceSidebar.vue';
import AlarmBanner from '@/components/AlarmBanner.vue';
import GlobalSearchModal from '@/components/workforce/dashboard/GlobalSearchModal.vue';

import { authService } from '@/services/authService';
import { patrolService } from '@/services/patrolService';

const route = useRoute();
const router = useRouter();

const isSearchModalOpen = ref(false);
const isNotificationsOpen = ref(false);
const notificationsDropdownRef = ref(null);
const activeAlertsList = ref([]);
const activeAlertsCount = computed(() => activeAlertsList.value.length);
const hasSeenAlerts = ref(false);

const _userData = authService.getUserData();
const userRole = computed(() => authService.getUserRole() || 'Admin');
const userName = computed(() => {
  const ud = authService.getUserData();
  if (!ud) return 'Workforce Admin';
  const name = `${ud.first_name || ''} ${ud.last_name || ''}`.trim();
  if (!name || name.toLowerCase().includes('patrol')) return 'Workforce Admin';
  return name;
});
const userInitials = computed(() => userName.value.charAt(0).toUpperCase());

const appMode = import.meta.env.VITE_APP_MODE || 'workforce';
const activeSidebar = computed(() => (appMode === 'security' || appMode === 'patrol') ? SecuritySidebar : WorkforceSidebar);

const fetchAlerts = async () => {
  try {
    const alerts = await patrolService.getActiveAlerts();
    if (alerts && Array.isArray(alerts)) {
      activeAlertsList.value = alerts;
    }
  } catch (e) {
    // Non-blocking
  }
};

const resolveAllAlerts = async () => {
  try {
    const promises = activeAlertsList.value.map(a => patrolService.updateAlertStatus(a.id, 'resolved'));
    await Promise.all(promises);
    activeAlertsList.value = [];
  } catch (err) {
    console.error('Error clearing alerts:', err);
  }
};

const openAlertDetails = () => {
  isNotificationsOpen.value = false;
  router.push('/dashboard/settings/logs');
};

const getFormattedAlertTime = (dateStr) => {
  if (!dateStr) return 'just now';
  try {
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return 'just now';
  }
};

onClickOutside(notificationsDropdownRef, () => {
  isNotificationsOpen.value = false;
});

const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    isSearchModalOpen.value = true;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  fetchAlerts();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const currentPageTitle = computed(() => {
  const path = route.path;
  if (path.includes('/dashboard/settings/devices')) return 'Devices & Controllers';
  if (path.includes('/dashboard/settings/logs')) return 'Event Logs';
  if (path.includes('/dashboard/settings/zones')) return 'Zones & Access Points';
  if (path.includes('/dashboard/access-control/doors')) return 'Doors & Turnstiles';
  if (path.includes('/dashboard/easy-access/employees')) return 'Employees Directory';
  if (path.includes('/dashboard/easy-access/configurators/access-levels')) return 'Access Levels & Groups';
  if (path.includes('/dashboard/easy-access/biometrics')) return 'Biometrics Hub';
  if (path.includes('/dashboard/access-control/schedules')) return 'Schedules & Shifts';
  return 'Workforce Dashboard';
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 4px;
}
</style>
