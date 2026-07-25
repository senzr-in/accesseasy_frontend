<template>
  <div class="h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
    <!-- Right Side Content Area (Now Full Width) -->
    <div class="flex-1 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-4 md:p-8">
      <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full h-full">
        <router-view v-slot="{ Component }">
          <transition
            name="fade-slide"
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
