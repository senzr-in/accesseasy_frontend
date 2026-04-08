<template>
  <div class="message-handler">
    <v-snackbar
      v-model="show"
      :color="messageType === 'error' ? 'error' : 'success'"
      :timeout="timeout"
      location="top"
    >
      <v-card
        :class="[
          'message-card',
          messageType === 'error' ? 'error-card' : 'success-card',
        ]"
        elevation="2"
      >
        <v-card-text class="d-flex align-center">
          <v-icon
            :icon="
              messageType === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle'
            "
            size="large"
            class="mr-3"
            :color="
              messageType === 'error' ? 'red-darken-1' : 'light-green-darken-1'
            "
          ></v-icon>
          <div>
            <div class="text-h6 mb-1">
              {{ messageType === "error" ? "Error" : "Success" }}
            </div>
            <div>{{ message }}</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :color="
              messageType === 'error' ? 'red-darken-1' : 'light-green-darken-1'
            "
            variant="text"
            @click="closeMessage"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-snackbar>
  </div>
</template>

<script>
import { ref, provide } from "vue";

export default {
  name: "MessageHandler",
  setup() {
    const message = ref("");
    const messageType = ref("success");
    const show = ref(false);
    const timeout = ref(1000);

    function showMessage(msg, type = "success", duration = 1000) {
      message.value = msg;
      messageType.value = type;
      timeout.value = duration;
      show.value = true;
    }

    function showSuccess(msg, duration = 1000) {
      showMessage(msg, "success", duration);
    }

    function showError(msg, duration = 1000) {
      showMessage(msg, "error", duration);
    }

    function closeMessage() {
      show.value = false;
    }

    provide("messageHandler", {
      showSuccess,
      showError,
    });

    return {
      message,
      messageType,
      show,
      timeout,
      closeMessage,
    };
  },
};
</script>

<style scoped>
.message-handler {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: 100%;
  max-width: 400px;
}

.message-card {
  border-radius: 8px;
}

.error-card {
  background-color: #ffebee;
  color: #b71c1c;
}

.success-card {
  background-color: #e8f5e9;
  color: #1b5e20;
}
</style>
