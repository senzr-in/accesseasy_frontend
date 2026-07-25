<template>
  <AdminDashboard v-if="appMode === 'security'" />
  <GuardDashboard v-else-if="appMode === 'patrol'" />
  <WorkforceDashboard v-else />
</template>

<script setup>
import AdminDashboard from './components/layouts/AdminDashboard.vue';
import WorkforceDashboard from './components/layouts/WorkforceDashboard.vue';
import GuardDashboard from './components/layouts/GuardDashboard.vue';

const appMode = import.meta.env.VITE_APP_MODE || 'workforce';
</script>
