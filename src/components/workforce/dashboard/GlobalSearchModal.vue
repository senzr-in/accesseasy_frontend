<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/30 animate-in fade-in duration-150"
      @click.self="close"
    >
      <div class="w-full max-w-xl bg-[#FFFFFF] border border-[#E8E8E8] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <!-- Search Input Bar -->
        <div class="flex items-center px-4 py-3 border-b border-[#E8E8E8] gap-3">
          <Search class="w-4 h-4 text-[#6B6B6B]" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="Search employees, doors, zones, devices, reports..."
            class="flex-1 text-sm bg-transparent outline-none text-[#171717] placeholder:text-[#929292]"
            @keydown.down.prevent="navigateResults(1)"
            @keydown.up.prevent="navigateResults(-1)"
            @keydown.enter.prevent="selectActive"
            @keydown.esc="close"
          >
          <kbd class="text-[10px] bg-[#F7F7F8] border border-[#E8E8E8] text-[#6B6B6B] px-1.5 py-0.5 rounded font-mono">
            ESC
          </kbd>
        </div>

        <!-- Category Filter Pills -->
        <div class="flex items-center gap-1.5 px-4 py-2 bg-[#F7F7F8] border-b border-[#E8E8E8] overflow-x-auto text-[11px]">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            :class="selectedCategory === cat.id ? 'bg-[#FFFFFF] text-[#171717] font-semibold shadow-xs border border-[#E8E8E8]' : 'text-[#6B6B6B] hover:text-[#171717]'"
            @click="selectedCategory = cat.id"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- Results List -->
        <div class="max-h-80 overflow-y-auto p-2 divide-y divide-[#F0F0F2]">
          <div
            v-for="(item, idx) in filteredResults"
            :key="item.id"
            class="flex items-center justify-between p-2.5 rounded-lg transition-colors cursor-pointer"
            :class="activeIndex === idx ? 'bg-[#F2F2F7] text-[#171717]' : 'hover:bg-[#F7F7F8]'"
            @mouseenter="activeIndex = idx"
            @click="handleSelect(item)"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-7 h-7 rounded-md bg-[#F7F7F8] border border-[#E8E8E8] flex items-center justify-center text-[#6B6B6B] shrink-0">
                <component :is="item.icon" class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-[#171717] truncate">{{ item.title }}</p>
                <p class="text-[11px] text-[#6B6B6B] truncate">{{ item.subtitle }}</p>
              </div>
            </div>

            <span class="text-[10px] font-medium text-[#929292] bg-[#F7F7F8] px-2 py-0.5 rounded border border-[#E8E8E8] shrink-0 ml-2">
              {{ item.category }}
            </span>
          </div>

          <!-- Empty State -->
          <div v-if="filteredResults.length === 0" class="py-8 text-center text-xs text-[#929292]">
            No results found for "{{ query }}"
          </div>
        </div>

        <!-- Footer Help -->
        <div class="px-4 py-2 bg-[#F7F7F8] border-t border-[#E8E8E8] flex items-center justify-between text-[11px] text-[#929292]">
          <div class="flex items-center gap-3">
            <span><kbd class="font-mono">&uarr;&darr;</kbd> Navigate</span>
            <span><kbd class="font-mono">&crarr;</kbd> Select</span>
          </div>
          <span>AccessEasy Spotlight</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Users, DoorClosed, Shield, Server, FileText, MapPin } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['update:isOpen', 'select']);

const router = useRouter();
const query = ref('');
const inputRef = ref(null);
const activeIndex = ref(0);
const selectedCategory = ref('all');

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'employees', name: 'Employees' },
  { id: 'doors', name: 'Doors' },
  { id: 'zones', name: 'Zones' },
  { id: 'devices', name: 'Devices' },
  { id: 'reports', name: 'Reports' }
];

const database = [
  { id: 's-1', title: 'Rajesh Kumar', subtitle: 'Security Lead &bull; Main Gate B1', category: 'Employees', icon: Users, path: '/dashboard/easy-access/employees?search=Rajesh' },
  { id: 's-2', title: 'Priya Sundaram', subtitle: 'Senior Financial Analyst &bull; Floor 2', category: 'Employees', icon: Users, path: '/dashboard/easy-access/employees?search=Priya' },
  { id: 's-3', title: 'Arun Kumar', subtitle: 'Staff Software Engineer &bull; Building 3', category: 'Employees', icon: Users, path: '/dashboard/easy-access/employees?search=Arun' },
  { id: 's-4', title: 'Main Gate B1 Terminal', subtitle: 'Face & Card Access Point', category: 'Doors', icon: DoorClosed, path: '/dashboard/access-control/doors' },
  { id: 's-5', title: 'Server Room Vault', subtitle: 'Restricted Biometric Zone', category: 'Zones', icon: MapPin, path: '/dashboard/settings/zones' },
  { id: 's-6', title: 'Turnstile Controller A01', subtitle: '192.168.1.102 &bull; Online', category: 'Devices', icon: Server, path: '/dashboard/settings/devices' },
  { id: 's-7', title: 'Daily Attendance Audit', subtitle: 'Automated CSV Report &bull; 09:30 AM', category: 'Reports', icon: FileText, path: '/dashboard/report-automation' },
  { id: 's-8', title: 'Executive Access Group', subtitle: '24/7 All-Zone Clearance', category: 'Access Groups', icon: Shield, path: '/dashboard/easy-access/configurators/access-levels' }
];

const filteredResults = computed(() => {
  let list = database;
  if (selectedCategory.value !== 'all') {
    list = list.filter(item => item.category.toLowerCase().includes(selectedCategory.value.toLowerCase()));
  }
  if (query.value.trim()) {
    const q = query.value.toLowerCase();
    list = list.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }
  return list;
});

const close = () => {
  emit('update:isOpen', false);
};

const handleSelect = (item) => {
  close();
  if (item.path) router.push(item.path);
  emit('select', item);
};

const navigateResults = (direction) => {
  const total = filteredResults.value.length;
  if (!total) return;
  activeIndex.value = (activeIndex.value + direction + total) % total;
};

const selectActive = () => {
  if (filteredResults.value[activeIndex.value]) {
    handleSelect(filteredResults.value[activeIndex.value]);
  }
};

watch(() => props.isOpen, (open) => {
  if (open) {
    query.value = '';
    activeIndex.value = 0;
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
});

// Global Ctrl + K listener
const handleGlobalKey = (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    emit('update:isOpen', !props.isOpen);
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKey);
});
</script>
