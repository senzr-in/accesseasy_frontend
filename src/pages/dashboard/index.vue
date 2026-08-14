<template>
  <WorkforceDashboard v-if="appMode === 'workforce' || appMode === 'common' || appMode === 'unified'" />
  <AdminDashboard v-else-if="appMode === 'security'" />
  <WorkforceDashboard v-else />
</template>

<script setup>
import CommonDashboard from './components/layouts/CommonDashboard.vue';
import AdminDashboard from './components/layouts/AdminDashboard.vue';
import WorkforceDashboard from './components/layouts/WorkforceDashboard.vue';

const appMode = import.meta.env.VITE_APP_MODE || 'common';
</script>

