<template>
  <v-dialog v-model="isOpen" max-width="600px">
    <v-card class="rounded-lg">
      <v-card-title
        class="d-flex justify-space-between align-center gradient-header text-white pa-4"
      >
        <div class="d-flex align-center">
          <v-icon color="white" class="mr-2">mdi-credit-card-multiple</v-icon>
          <span class="text-h5 font-weight-bold">RFID Cards</span>
        </div>
        <v-btn icon variant="text" color="white" @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <div v-if="rfidCards.length === 0" class="text-center pa-6">
          <v-icon size="64" color="grey-lighten-1">mdi-credit-card-off</v-icon>
          <div class="text-h6 mt-2 text-grey">No RFID cards found</div>
        </div>

        <div v-else class="card-grid">
          <v-card
            v-for="(card, index) in rfidCards"
            :key="index"
            class="card-item mb-3"
            :class="
              card.cardManagement_id.cardAccess
                ? 'border-active'
                : 'border-inactive'
            "
            variant="outlined"
            elevation="2"
          >
            <div class="d-flex align-center pa-3">
              <v-avatar
                :color="getCardColor(card.cardManagement_id.type)"
                size="42"
                class="mr-3"
              >
                <v-icon color="white">{{
                  getCardIcon(card.cardManagement_id.type)
                }}</v-icon>
              </v-avatar>

              <div class="flex-grow-1">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-subtitle-1 font-weight-bold">{{
                    card.cardManagement_id.rfidCard
                  }}</span>
                  <v-chip
                    :color="
                      card.cardManagement_id.cardAccess ? 'success' : 'error'
                    "
                    size="small"
                    class="ml-2"
                    label
                  >
                    {{
                      card.cardManagement_id.cardAccess ? "Enabled" : "Disabled"
                    }}
                  </v-chip>
                </div>

                <div class="text-caption text-grey mt-1">
                  <v-icon size="small" class="mr-1">mdi-tag</v-icon>
                  {{ card.cardManagement_id.type || "Standard" }}
                </div>
              </div>
            </div>
          </v-card>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4 d-flex justify-end">
        <v-btn color="primary" variant="text" @click="isOpen = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue";

const isOpen = ref(false);
const rfidCards = ref([]);

const open = (cards) => {
  rfidCards.value = cards;
  isOpen.value = true;
};

const getCardColor = (type) => {
  const typeMap = {
    Access: "indigo",
    Employee: "teal",
    Visitor: "amber-darken-2",
    Admin: "deep-purple",
    Security: "red-darken-1",
  };
  return typeMap[type] || "blue";
};

const getCardIcon = (type) => {
  const iconMap = {
    Access: "mdi-door",
    Employee: "mdi-account-badge",
    Visitor: "mdi-account-question",
    Admin: "mdi-shield-account",
    Security: "mdi-security",
  };
  return iconMap[type] || "mdi-credit-card";
};

defineExpose({
  open,
});
</script>

<style scoped>
.gradient-header {
  background: linear-gradient(to right, #1976d2, #0d47a1);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  gap: 12px;
}

.card-item {
  transition: all 0.2s ease;
  border-left-width: 4px !important;
}

.card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.border-active {
  border-left-color: #4caf50 !important;
}

.border-inactive {
  border-left-color: #f44336 !important;
}

@media (min-width: 600px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }
}
</style>
