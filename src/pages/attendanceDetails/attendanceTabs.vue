<template>
  <div class="attendance-details">
    <v-card flat class="content-area">
      <router-view></router-view>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "AttendanceDetailsTabs",
};
</script>

<style scoped>
.content-area {
  background-color: white;
  border-radius: 8px;
  min-height: 400px;
}

@media (max-width: 768px) {
  .attendance-details {
    padding: 0px;
  }
}
</style>
