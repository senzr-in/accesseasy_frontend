<template>
  <div class="sensitive-input-wrapper">
    <v-text-field
      :model-value="displayValue"
      @update:model-value="handleInput"
      :label="label"
      :type="inputType"
      variant="outlined"
      density="comfortable"
      :error-messages="validationError || errorMessages"
      :disabled="loading || !showDecrypted"
      :readonly="false"
      class="sensitive-text-field"
    >
      <template v-slot:append>
        <div v-if="loading" class="d-flex align-center">
          <v-progress-circular
            indeterminate
            size="20"
            width="2"
            color="primary"
          ></v-progress-circular>
        </div>
      </template>
    </v-text-field>

    <!-- Separate eye icon positioned absolutely -->
    <div class="eye-icon-container" v-if="!loading">
      <v-btn
        icon
        variant="text"
        size="small"
        color="primary"
        @click="toggleVisibility"
        class="eye-toggle-btn"
        :disabled="false"
      >
        <v-icon size="20">
          {{ showDecrypted ? "mdi-eye-off" : "mdi-eye" }}
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import crypto from "crypto-js";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    required: true,
  },
  rules: {
    type: Array,
    default: () => [],
  },
  errorMessages: {
    type: String,
    default: "",
  },
  fieldType: {
    type: String,
    default: "text",
  },
  sensitive: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const loading = ref(false);
const decryptedValue = ref("");
const showDecrypted = ref(false); // Start with eye "off" (masked data)
const isEncrypted = ref(false);
const validationError = ref("");

const ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const inputType = computed(() => {
  // Always show as text when decrypted, password when masked
  return showDecrypted.value
    ? props.fieldType === "number"
      ? "number"
      : "text"
    : "password";
});

const displayValue = computed(() => {
  if (showDecrypted.value) {
    // Eye is "on" - show actual decrypted data
    return decryptedValue.value;
  } else {
    // Eye is "off" - show masked data
    return decryptedValue.value ? "••••••••" : "";
  }
});

const checkIfEncrypted = (text) => {
  if (!text || typeof text !== "string") return false;
  const parts = text.split(":");
  if (parts.length !== 2) return false;
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(parts[0]) && hexRegex.test(parts[1]);
};

const validateValue = (value) => {
  if (!props.rules || props.rules.length === 0) return "";
  for (const rule of props.rules) {
    const result = rule(value);
    if (result !== true) {
      return result;
    }
  }
  return "";
};

const decryptData = async (encryptedText) => {
  try {
    if (!encryptedText || typeof encryptedText !== "string") {
      return encryptedText || "";
    }

    if (!checkIfEncrypted(encryptedText)) {
      return encryptedText;
    }

    loading.value = true;
    isEncrypted.value = true;

    const textParts = encryptedText.split(":");
    const iv = textParts[0];
    const encryptedData = textParts[1];

    const ivWordArray = crypto.enc.Hex.parse(iv);
    const keyWordArray = crypto.enc.Hex.parse(ENCRYPTION_KEY);
    const ciphertext = crypto.enc.Hex.parse(encryptedData);

    const cipherParams = crypto.lib.CipherParams.create({
      ciphertext: ciphertext,
    });

    const decrypted = crypto.AES.decrypt(cipherParams, keyWordArray, {
      iv: ivWordArray,
      mode: crypto.mode.CBC,
      padding: crypto.pad.Pkcs7,
    });

    return decrypted.toString(crypto.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return encryptedText;
  } finally {
    loading.value = false;
  }
};

const handleInput = (value) => {
  // Only handle input when eye is "on" (showDecrypted is true)
  if (showDecrypted.value) {
    decryptedValue.value = value;
    validationError.value = validateValue(value);
    emit("update:modelValue", value);
  }
};

const toggleVisibility = () => {
  // This function can always be called regardless of text field state
  showDecrypted.value = !showDecrypted.value;
  console.log(
    "Eye toggled:",
    showDecrypted.value ? "ON (editable)" : "OFF (disabled)",
  );
};

const processModelValue = async () => {
  if (props.modelValue) {
    loading.value = true;
    try {
      const result = await decryptData(props.modelValue);
      decryptedValue.value = result;
      validationError.value = validateValue(result);
    } catch (error) {
      console.error("Error processing value:", error);
      decryptedValue.value = props.modelValue;
      validationError.value = validateValue(props.modelValue);
    } finally {
      loading.value = false;
    }
  } else {
    decryptedValue.value = "";
    validationError.value = "";
  }
};

onMounted(() => {
  processModelValue();
});

watch(() => props.modelValue, processModelValue);

watch(
  () => decryptedValue.value,
  (newValue) => {
    validationError.value = validateValue(newValue);
  },
);
</script>

<style scoped>
.sensitive-input-wrapper {
  position: relative;
}

.eye-icon-container {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  pointer-events: auto;
}

.eye-toggle-btn {
  pointer-events: auto !important;
  opacity: 1 !important;
  background: transparent !important;
}

.eye-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.04) !important;
}

.sensitive-input-wrapper .eye-toggle-btn {
  pointer-events: auto !important;
}

.sensitive-text-field :deep(.v-field__append-inner) {
  padding-right: 40px;
}
</style>
