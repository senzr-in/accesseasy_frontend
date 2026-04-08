<template>
  <div class="settings-details">
    <v-card flat class="content-area">
      <router-view></router-view>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "SettingsTabs",
};
</script>

<style scoped>
.content-area {
  background-color: white;
  border-radius: 8px;
  min-height: 400px;
}

@media (max-width: 768px) {
  .settings-details {
    padding: 0px;
  }
}
</style>
