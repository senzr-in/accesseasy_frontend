<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup></script>
<style>
.v-container {
  width: 100%;
  padding: 0px;
  margin-right: auto;
  margin-left: auto;
}
.scrollable-content {
  height: calc(100vh - 64px);
  overflow: hidden !important;
}
.tab-text {
  text-transform: capitalize;
  font-weight: 550;
  font-size: 16px;

}
</style>
