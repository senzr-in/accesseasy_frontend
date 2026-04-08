<template>
  <div class="access-management">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Main Content -->
    <div v-else class="content-container">
      <!-- Header -->
      <div class="header">
        <div class="title">
          <v-icon size="24" color="primary" class="mr-2">mdi-shield-key</v-icon>
          <h1>Access Management</h1>
        </div>
      </div>

      <!-- Warning Message -->
      <div v-if="!formData.accessOn" class="warning-message">
        <v-icon color="warning" class="mr-2">mdi-alert-circle</v-icon>
        <span>
          To assign cards, please enable access or check the Access Level's
          access type.
        </span>
      </div>

      <!-- Main Content Columns -->
      <div class="main-content">
        <!-- Access Level Details -->
        <div class="access-details">
          <div class="section-header">
            <v-icon size="20" color="primary" class="mr-2"
              >mdi-shield-account</v-icon
            >
            <h2>Access Level Details</h2>
          </div>

          <!-- Access Controls -->
          <div class="access-controls">
            <div class="access-level-container">
              <div class="access-level-label">Access Level Category</div>
              <v-select
                v-model="formData.accessLevel"
                :items="props.accessLevelOptions"
                item-title="accessLevelName"
                item-value="accessLevelName"
                @update:model-value="handleAccessLevelChange"
                variant="outlined"
                hide-details
                class="access-level-select"
              >
                <template v-slot:item="{ item, props }">
                  <v-list-item v-bind="props" :disabled="!item.raw.accessType">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.accessType ? 'success' : 'error'"
                      >
                        {{
                          item.raw.accessType
                            ? "mdi-shield-check"
                            : "mdi-shield-off"
                        }}
                      </v-icon>
                    </template>
                    <template v-slot:append>
                      <span
                        :class="
                          item.raw.accessType ? 'text-success' : 'text-error'
                        "
                      >
                        ({{ item.raw.accessType ? "Enabled" : "Disabled" }})
                      </span>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </div>

            <div class="access-toggle">
              <v-switch
                v-model="formData.accessOn"
                color="success"
                hide-details
                @update:model-value="handleAccessToggle"
                :key="accessToggleKey"
              >
                <template v-slot:label>
                  <span class="access-label">
                    Access: {{ formData.accessOn ? "Enabled" : "Disabled" }}
                  </span>
                </template>
              </v-switch>
            </div>
          </div>

          <div v-if="selectedAccessLevel" class="details-content">
            <div class="tabs">
              <div
                class="tab"
                :class="{ active: activeAccessTab === 'general' }"
                @click="activeAccessTab = 'general'"
              >
                <v-icon size="18" class="mr-1">mdi-information</v-icon>
                GENERAL
              </div>
              <div
                class="tab"
                :class="{ active: activeAccessTab === 'doors' }"
                @click="activeAccessTab = 'doors'"
              >
                <v-icon size="18" class="mr-1">mdi-door</v-icon>
                ASSIGNED DOORS
              </div>
            </div>

            <div v-if="activeAccessTab === 'general'" class="general-info">
              <div
                class="info-card"
                :class="{ 'disabled-card': !selectedAccessLevel._24hrs }"
              >
                <div class="info-header">
                  <v-icon
                    :color="selectedAccessLevel._24hrs ? 'success' : 'error'"
                    size="24"
                    class="mr-2"
                  >
                    mdi-clock-time-four
                  </v-icon>
                  <span class="info-title">24 Hours Access</span>
                </div>
                <div class="info-value">
                  {{ selectedAccessLevel._24hrs ? "Enabled" : "Disabled" }}
                </div>
              </div>

              <div class="info-card">
                <div class="info-header">
                  <v-icon color="primary" size="24" class="mr-2"
                    >mdi-timer-outline</v-icon
                  >
                  <span class="info-title">Max Hours</span>
                </div>
                <div class="info-value">
                  {{ selectedAccessLevel.maxWorkHours }} hours
                </div>
              </div>

              <div class="info-card">
                <div class="info-header">
                  <v-icon color="primary" size="24" class="mr-2"
                    >mdi-calendar-clock</v-icon
                  >
                  <span class="info-title">Working Hours</span>
                </div>
                <div class="info-value">
                  {{ selectedAccessLevel.workingHours || "Not set" }}
                </div>
              </div>

              <div class="info-card">
                <div class="info-header">
                  <v-icon color="primary" size="24" class="mr-2"
                    >mdi-calendar-star</v-icon
                  >
                  <span class="info-title">Holidays</span>
                </div>
                <div class="info-value">
                  {{ selectedAccessLevel.holidays ? "Allowed" : "Not Allowed" }}
                </div>
              </div>
            </div>

            <div v-if="activeAccessTab === 'doors'" class="doors-info">
              <div
                v-if="
                  !selectedAccessLevel.assignedDoors ||
                  selectedAccessLevel.assignedDoors.length === 0
                "
                class="no-doors"
              >
                No doors assigned to this access level
              </div>

              <div v-else class="doors-grid">
                <div
                  v-for="door in selectedAccessLevel.assignedDoors"
                  :key="door.doors_id.doorNumber"
                  class="door-item"
                >
                  <v-icon color="primary" size="20" class="mr-2"
                    >mdi-door</v-icon
                  >
                  <div>
                    <div class="door-number">
                      {{ door.doors_id.doorNumber }}
                    </div>
                    <div class="door-name">{{ door.doors_id.doorName }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-access-level">
            <v-icon size="40" color="grey" class="mb-2">mdi-shield-off</v-icon>
            <div>No access level selected</div>
          </div>
        </div>

        <!-- Card Management -->
        <div
          class="card-management"
          :class="{ 'disabled-section': !formData.accessOn }"
        >
          <div class="section-header">
            <v-icon size="20" color="primary" class="mr-2"
              >mdi-credit-card-multiple</v-icon
            >
            <h2>Card Management</h2>
          </div>

          <!-- Disabled Message -->
          <div v-if="!formData.accessOn" class="disabled-message">
            <v-icon color="warning" size="48" class="mb-3">mdi-lock</v-icon>
            <h3>Card Management Disabled</h3>
            <p>Please enable access to manage cards for this employee.</p>
            <v-btn
              color="primary"
              variant="outlined"
              @click="enableAccess"
              class="mt-3"
            >
              Enable Access
            </v-btn>
          </div>

          <!-- Card Management Content -->
          <div v-else class="card-management-content">
            <div class="card-input-container">
              <v-text-field
                v-model="cardInput"
                label="Swipe card to enter"
                variant="outlined"
                type="number"
                density="comfortable"
                @focus="handleCardFocus"
                maxlength="10"
                minlength="10"
                @input="handleCardInput"
                hide-details
                class="card-input"
              ></v-text-field>

              <v-select
                v-model="selectedCardType"
                :items="['rfid', 'tag']"
                variant="outlined"
                density="comfortable"
                hide-details
                class="card-type"
              ></v-select>
            </div>

            <v-btn
              color="black"
              variant="elevated"
              @click="addNewCard"
              :disabled="!cardInput"
              class="add-card-btn"
              prepend-icon="mdi-plus"
            >
              ADD NEW CARD
            </v-btn>

            <div class="assigned-cards">
              <div class="assigned-cards-header">
                <span>Assigned Cards</span>
                <span class="card-count">{{ assignedCards.length }} cards</span>
              </div>

              <div class="cards-list">
                <div v-if="assignedCards.length === 0" class="no-cards">
                  No cards assigned
                </div>

                <div
                  v-for="card in assignedCards"
                  :key="card.id"
                  class="card-item"
                >
                  <div class="card-info">
                    <v-icon size="20" color="primary" class="mr-2"
                      >mdi-credit-card</v-icon
                    >
                    <div>
                      <div class="card-number">{{ card.rfidCard }}</div>
                      <div class="card-type-label">
                        Type: {{ card.type.toUpperCase() }}
                      </div>
                    </div>
                  </div>

                  <div class="card-actions">
                    <v-switch
                      v-model="card.enabled"
                      color="success"
                      density="compact"
                      hide-details
                      @update:model-value="updateCardAccess(card)"
                      class="card-toggle"
                      :key="`card-${card.id}-${cardToggleKey}`"
                    ></v-switch>

                    <v-btn
                      icon
                      variant="text"
                      color="error"
                      @click="removeCard(card.id)"
                      class="delete-btn"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="info-text">
          <v-icon color="info" size="18" class="mr-2">mdi-information</v-icon>
          <span>Need to modify access level categories?</span>
        </div>

        <v-btn
          color="primary"
          variant="tonal"
          @click="redirectToAccessLevelCategory"
          class="settings-btn"
          prepend-icon="mdi-cog"
        >
          ACCESS LEVEL CATEGORY SETTINGS
        </v-btn>
      </div>
    </div>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="showErrorSnackbar"
      color="error"
      timeout="3000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>

    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="3000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-check-circle</v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from "vue";
import { authService } from "@/services/authService";
import { useRouter } from "vue-router";

// Props
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      accessLevel: "",
      accessOn: true,
    }),
  },
  accessLevelOptions: {
    type: Array,
    default: () => [],
  },
  tenantId: {
    type: String,
    required: true,
  },
});

// Emits
const emit = defineEmits([
  "update:modelValue",
  "update:assignedCards",
  "update:accessLevel",
  "update:accessOn",
]);

// Router
const router = useRouter();

// Reactive data
const loading = ref(false);
const formData = ref({
  accessLevel: props.initialData.accessLevel || "",
  accessOn: props.initialData.accessOn ?? true,
});

const cardInput = ref("");
const selectedCardType = ref("rfid");
const assignedCards = ref([]);
const selectedAccessLevel = ref(null);
const activeAccessTab = ref("general");
const cardListener = ref(null);

// Keys for forcing component re-render
const accessToggleKey = ref(0);
const cardToggleKey = ref(0);

// Snackbar states
const showErrorSnackbar = ref(false);
const showSuccessSnackbar = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Computed properties
const hasChanges = computed(() => {
  return (
    formData.value.accessLevel !== props.initialData.accessLevel ||
    formData.value.accessOn !== props.initialData.accessOn ||
    assignedCards.value.length > 0
  );
});

// Methods
const showError = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const showSuccess = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const enableAccess = () => {
  formData.value.accessOn = true;
  handleAccessToggle(true);
};

const forceToggleUpdate = () => {
  accessToggleKey.value += 1;
  cardToggleKey.value += 1;
};

const handleCardInput = (event) => {
  if (cardInput.value.length > 10) {
    cardInput.value = cardInput.value.slice(0, 10);
  }
};

const handleCardFocus = () => {
  if (formData.value.accessOn) {
    cardListener.value = window.addEventListener("keypress", handleCardSwipe);
  }
};

const handleCardSwipe = (event) => {
  if (event.keyCode === 13) {
    window.removeEventListener("keypress", handleCardSwipe);
    cardListener.value = null;
    processCardData(cardInput.value);
  }
};

const processCardData = (cardData) => {
  const existingCard = assignedCards.value.find(
    (card) => card.rfidCard === cardData
  );
  if (existingCard) {
    showError("This card is already assigned to this employee");
    cardInput.value = "";
    return;
  }
  addNewCard();
};

const checkCardExistsInDatabase = async (cardNumber) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[rfidCard][_eq]=${cardNumber}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to check card existence");
    }

    const data = await response.json();
    return data.data && data.data.length > 0;
  } catch (error) {
    console.error("Error checking card existence:", error);
    return false;
  }
};

const addNewCard = async () => {
  if (!cardInput.value || !formData.value.accessOn) return;

  // Check if card already exists in database
  const cardExists = await checkCardExistsInDatabase(cardInput.value);
  if (cardExists) {
    showError("This card already exists in the system");
    cardInput.value = "";
    return;
  }

  // Create new card - enabled by default when access is on
  const newCard = {
    id: Date.now(),
    rfidCard: cardInput.value,
    type: selectedCardType.value,
    enabled: true, // New cards are enabled by default when access is on
    isNew: true,
  };

  assignedCards.value.push(newCard);
  cardInput.value = "";

  showSuccess(`Card ${newCard.rfidCard} added successfully`);
  emit("update:assignedCards", assignedCards.value);

  // Force update card toggles
  nextTick(() => {
    cardToggleKey.value += 1;
  });
};

const removeCard = (cardId) => {
  const cardToRemove = assignedCards.value.find((card) => card.id === cardId);
  assignedCards.value = assignedCards.value.filter(
    (card) => card.id !== cardId
  );

  if (cardToRemove) {
    showSuccess(`Card ${cardToRemove.rfidCard} removed successfully`);
  }
  emit("update:assignedCards", assignedCards.value);
};

const updateCardAccess = (card) => {
  // Prevent card state changes when access is OFF
  if (!formData.value.accessOn) {
    card.enabled = false;
    nextTick(() => {
      cardToggleKey.value += 1;
    });
    return;
  }

  // Mark card as changed for tracking
  card.isChanged = true;
  emit("update:assignedCards", assignedCards.value);

  showSuccess(`Card ${card.rfidCard} ${card.enabled ? "enabled" : "disabled"}`);
};

const handleAccessLevelChange = async (value) => {
  formData.value.accessLevel = value;
  emit("update:accessLevel", value);

  if (value) {
    // Find the selected access level object from the options
    const selectedLevel = props.accessLevelOptions.find(
      (level) => level.accessLevelName === value
    );
    if (selectedLevel) {
      selectedAccessLevel.value = selectedLevel;
    }
    await fetchAccessLevelDetails(value);
  } else {
    selectedAccessLevel.value = null;
  }
};

const handleAccessToggle = async (value) => {
  formData.value.accessOn = value;
  emit("update:accessOn", value);

  if (!value) {
    // When access is OFF: disable all cards and prevent individual changes
    assignedCards.value = assignedCards.value.map((card) => ({
      ...card,
      enabled: false, // Force all cards to disabled state
      isChanged: true,
    }));

    // Remove card listener when access is disabled
    if (cardListener.value) {
      window.removeEventListener("keypress", handleCardSwipe);
      cardListener.value = null;
    }

    showSuccess("Access disabled - All cards have been disabled");
  } else {
    // When access is ON: allow individual card management
    // Don't automatically enable cards, let user control individual states
    assignedCards.value = assignedCards.value.map((card) => ({
      ...card,
      isChanged: true,
    }));

    showSuccess("Access enabled - Cards can now be managed individually");
  }

  emit("update:assignedCards", assignedCards.value);

  // Force update all toggles
  await nextTick();
  forceToggleUpdate();
};

const fetchAccessLevelDetails = async (accessLevelName) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels?filter[accessLevelName][_eq]=${accessLevelName}&fields=accessLevelName,_24hrs,holidays,maxWorkHours,accessType,workingHours,assignedDoors.doors_id.doorNumber,assignedDoors.doors_id.doorName`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch access level details");
    }

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      selectedAccessLevel.value = data.data[0];
    }
  } catch (error) {
    console.error("Error fetching access level details:", error);
    showError("Failed to load access level details");
  }
};

const redirectToAccessLevelCategory = () => {
  router.push("/configuration/accesslevel-configurator");
};

// Watchers
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = {
        accessLevel: newData.accessLevel || "",
        accessOn: newData.accessOn ?? true,
      };
      // Force update toggles when props change
      nextTick(() => {
        forceToggleUpdate();
      });
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => formData.value.accessLevel,
  (newValue) => {
    if (newValue) {
      const selectedLevel = props.accessLevelOptions.find(
        (level) => level.accessLevelName === newValue
      );
      if (selectedLevel) {
        selectedAccessLevel.value = selectedLevel;
      }
      fetchAccessLevelDetails(newValue);
    } else {
      selectedAccessLevel.value = null;
    }
  },
  { immediate: true }
);

// Watch for access state changes and update card states accordingly
watch(
  () => formData.value.accessOn,
  (newValue) => {
    if (!newValue) {
      // When access is turned off, disable all cards
      assignedCards.value.forEach((card) => {
        card.enabled = false;
        card.isChanged = true;
      });
    }
    // Force update toggles
    nextTick(() => {
      forceToggleUpdate();
    });
  }
);

// Lifecycle
onMounted(() => {
  // Initialize with any existing data
  if (props.initialData.accessLevel) {
    fetchAccessLevelDetails(props.initialData.accessLevel);
  }

  // Force initial toggle update
  nextTick(() => {
    forceToggleUpdate();
  });
});

onUnmounted(() => {
  if (cardListener.value) {
    window.removeEventListener("keypress", handleCardSwipe);
  }
});

// Expose methods for parent component
defineExpose({
  getAssignedCards: () => assignedCards.value,
  setAssignedCards: (cards) => {
    assignedCards.value = cards;
    nextTick(() => {
      cardToggleKey.value += 1;
    });
  },
  getFormData: () => formData.value,
  setFormData: (data) => {
    formData.value = { ...formData.value, ...data };
    nextTick(() => {
      forceToggleUpdate();
    });
  },
});
</script>

<style scoped>
.access-management {
  margin: 0 auto;
  padding: 0;
  color: #333;
  overflow-y: auto;
  height: calc(80vh - 64px);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  display: flex;
  align-items: center;
}

.title h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.save-btn {
  font-weight: 500;
}

/* Warning Message */
.warning-message {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff3e0;
  border-radius: 8px;
  color: #e65100;
  font-size: 14px;
  margin-bottom: 16px;
}

/* Main Content */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  min-height: 0vh !important;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

/* Card Management */
.card-management {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-management.disabled-section {
  background-color: #f5f5f5;
  opacity: 0.8;
}

.disabled-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.disabled-message h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.disabled-message p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
}

.card-management-content {
  opacity: 1;
  transition: opacity 0.3s ease;
}

.card-input-container {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.card-input {
  flex: 3;
}

.card-type {
  flex: 1;
}

.add-card-btn {
  width: 100%;
  margin-bottom: 20px;
}

.assigned-cards {
  margin-top: 20px;
}

.assigned-cards-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
}

.card-count {
  font-size: 12px;
  color: #666;
  font-weight: normal;
}

.cards-list {
  max-height: 170px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 4px;
}

.no-cards {
  padding: 24px;
  text-align: center;
  color: #888;
  font-size: 14px;
}

.card-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.card-item:last-child {
  border-bottom: none;
}

.card-info {
  display: flex;
  align-items: center;
}

.card-number {
  font-weight: 500;
  font-size: 16px;
}

.card-type-label {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Access Details */
.access-details {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Access Controls */
.access-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.access-level-container {
  flex: 1;
  max-width: 300px;
}

.access-level-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.access-toggle {
  display: flex;
  align-items: center;
}

.access-label {
  font-weight: 500;
  margin-left: 8px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.tab {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  color: #666;
}

.tab.active {
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
}

.general-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-card {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: transform 0.2s;
  background-color: #f8f9fa;
}

.disabled-card {
  border-left: 3px solid #f44336;
}

.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-title {
  font-weight: 500;
  font-size: 16px;
}

.info-value {
  font-size: 14px;
  color: #666;
}

.doors-info {
  max-height: 300px;
  overflow-y: auto;
}

.no-doors {
  padding: 24px;
  text-align: center;
  color: #888;
  font-size: 14px;
}

.doors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.door-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.door-number {
  font-weight: 500;
  font-size: 14px;
}

.door-name {
  font-size: 12px;
  color: #666;
}

.no-access-level {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #888;
}

/* Footer */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
}

.info-text {
  display: flex;
  align-items: center;
  color: #1976d2;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .access-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .access-level-container {
    width: 100%;
    max-width: none;
  }

  .general-info {
    grid-template-columns: 1fr;
  }

  .footer {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .settings-btn {
    width: 100%;
  }
}
</style>
