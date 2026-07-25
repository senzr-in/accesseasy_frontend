<template>
  <div class="h-full flex flex-col items-center justify-center text-center p-8">
    <div class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
      <Settings class="w-8 h-8 text-indigo-500" />
    </div>
    <h2 class="text-3xl font-black text-slate-900 mb-2">
      Admin Settings
    </h2>
    <p class="text-slate-500 font-medium max-w-md">
      Select a configuration option from the sidebar menu to manage your system settings.
    </p>
  </div>
</template>

<script setup>
import { Settings } from 'lucide-vue-next';
</script>
