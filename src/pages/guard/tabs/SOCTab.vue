<template>
  <div class="h-full flex flex-col gap-3 overflow-hidden">
    <FeatureGate feature="ops.operations_center" show-locked-badge locked-label="Operations Center & Live Command Map — Pro Feature">
      
      <!-- LEVEL 0: Command Bar & Global Search -->
      <CommandBar class="shrink-0" />

      <!-- LEVEL 1: KPI Bar -->
      <KPIBar class="shrink-0" />

      <!-- MAIN SPLIT VIEW (fills remaining height) -->
      <div class="flex-1 min-h-0 flex flex-col xl:flex-row gap-3">
        <!-- LEFT COLUMN (70%) -->
        <div class="flex-1 xl:w-[70%] min-h-0 flex flex-col gap-3">
          <!-- Level 2: Live Operations Map (45% of left column) -->
          <div class="h-[45%] shrink-0">
            <LiveMapWidget />
          </div>

          <!-- Level 3: Active Guards (fills remaining left space, scrolls internally) -->
          <div class="flex-1 min-h-0 overflow-hidden">
            <ActiveGuards />
          </div>
        </div>

        <!-- RIGHT COLUMN (30%) - Operations Sidebar -->
        <div class="w-full xl:w-[30%] min-h-0 shrink-0 flex flex-col gap-3">
          <!-- Live Alerts (fills available space, scrolls internally) -->
          <div class="flex-1 min-h-0">
            <AlertsSidebar />
          </div>

          <!-- Emergency Panel (fixed height at bottom) -->
          <EmergencyPanel class="shrink-0" />
        </div>
      </div>

    </FeatureGate>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import CommandBar from '../components/shared/CommandBar.vue';
import KPIBar from '../components/soc/KPIBar.vue';
import LiveMapWidget from '../components/soc/LiveMapWidget.vue';
import AlertsSidebar from '../components/soc/AlertsSidebar.vue';
import ActiveGuards from '../components/soc/ActiveGuards.vue';
import EmergencyPanel from '../components/soc/EmergencyPanel.vue';
import FeatureGate from '@/components/common/FeatureGate.vue';
import { useSOCStore } from '@/stores/useSOCStore';

const socStore = useSOCStore();

onMounted(() => {
  // Initialize the unified socket/data connection when the SOC dashboard mounts
  socStore.initSocketConnection();
});
</script>
