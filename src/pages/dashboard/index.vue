<template>
  <AdminDashboard v-if="appMode === 'security'" />
  <WorkforceDashboard v-else />
</template>

<script setup>
import AdminDashboard from './components/layouts/AdminDashboard.vue';
import WorkforceDashboard from './components/layouts/WorkforceDashboard.vue';

const appMode = import.meta.env.VITE_APP_MODE || 'workforce';
</script>
