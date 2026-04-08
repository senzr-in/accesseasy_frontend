<template>
  <div @click.stop>
    <div
      class="d-flex align-center sensitive-data-cell"
      style="cursor: pointer"
      @click="showDecryptedData"
    >
      <span v-if="encryptedValue">{{ maskedValue }}</span>
      <span v-else>-</span>
      <v-icon size="small" color="primary" class="ms-2"> mdi-eye </v-icon>
    </div>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6"> Sensitive Information </v-card-title>
        <v-card-text>
          <div v-if="loading" class="d-flex justify-center align-center pa-4">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </div>
          <div v-else>
            <p class="text-subtitle-1 font-weight-bold mb-2">
              {{ fieldLabel }}:
            </p>
            <v-alert
              v-if="decryptionError"
              type="error"
              variant="tonal"
              class="mb-0"
            >
              {{ decryptedValue }}
            </v-alert>
            <v-alert
              v-else
              type="info"
              variant="tonal"
              class="mb-0 text-body-1 font-weight-medium"
            >
              {{ decryptedValue }}
            </v-alert>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="!decryptionError && decryptedValue"
            color="secondary"
            variant="text"
            prepend-icon="mdi-content-copy"
            @click="copyToClipboard"
          >
            Copy
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="dialog = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import crypto from "crypto-js";

const props = defineProps({
  encryptedValue: {
    type: String,
    required: true,
  },
  fieldName: {
    type: String,
    required: true,
  },
});

const dialog = ref(false);
const decryptedValue = ref("");
const loading = ref(false);
const decryptionError = ref(false);

const ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const fieldLabel = computed(() => {
  const name = props.fieldName.replace(/_/g, " ");
  return name.charAt(0).toUpperCase() + name.slice(1);
});

const isEncrypted = (text) => {
  if (!text || typeof text !== "string") return false;
  const parts = text.split(":");
  if (parts.length !== 2) return false;
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(parts[0]) && hexRegex.test(parts[1]);
};

const maskedValue = computed(() => {
  if (!props.encryptedValue || typeof props.encryptedValue !== "string")
    return "-";

  if (!isEncrypted(props.encryptedValue)) {
    const visiblePart = props.encryptedValue.substring(0, 4);
    return `${visiblePart}...`;
  }
  return "••••••••";
});

const decryptData = (encryptedText) => {
  try {
    if (!encryptedText || typeof encryptedText !== "string") {
      return encryptedText || "";
    }

    if (!isEncrypted(encryptedText)) {
      console.log("Data is not encrypted, returning as is.");
      return encryptedText;
    }
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
    return "Decryption failed - Please check encryption key";
  }
};

const showDecryptedData = async () => {
  dialog.value = true;
  loading.value = true;
  decryptionError.value = false;

  try {
    setTimeout(() => {
      try {
        const result = decryptData(props.encryptedValue);

        if (!result || result.includes("Decryption failed")) {
          decryptionError.value = true;
          decryptedValue.value =
            result || "Decryption failed - No data returned";
        } else {
          decryptedValue.value = result;
        }
      } catch (error) {
        console.error("Decryption error:", error);
        decryptionError.value = true;
        decryptedValue.value = "Decryption failed - " + error.message;
      }

      loading.value = false;
    }, 500);
  } catch (error) {
    console.error("Error processing data:", error);
    decryptedValue.value = "Unable to process data";
    decryptionError.value = true;
    loading.value = false;
  }
};

const copyToClipboard = () => {
  if (decryptedValue.value) {
    navigator.clipboard
      .writeText(decryptedValue.value)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }
};
</script>

<style scoped>
.sensitive-data-cell {
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.sensitive-data-cell:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
