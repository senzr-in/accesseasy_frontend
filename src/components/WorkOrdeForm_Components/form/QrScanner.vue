<template>
  <v-dialog :model-value="show" max-width="500px" persistent>
    <v-card class="qr-scanner-card" elevation="12">
      <v-card-title class="qr-scanner-header">
        <v-icon class="header-icon mr-3" size="28">mdi-qrcode-scan</v-icon>
        <span class="header-title">QR Code Scanner</span>
        <v-spacer></v-spacer>
        <v-btn 
          icon 
          variant="text" 
          @click="$emit('close')"
          class="close-btn"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="qr-scanner-content">
        <v-alert 
          v-if="scanError" 
          type="error" 
          variant="tonal"
          class="mb-4" 
          closable
          @click:close="$emit('update:scan-error', '')"
        >
          {{ scanError }}
        </v-alert>

        <div class="upload-section">
          <v-file-input
            :model-value="qrImageFile"
            @update:model-value="$emit('update:qr-image-file', $event)"
            label="Upload QR Code Image"
            accept="image/*"
            prepend-icon="mdi-camera"
            variant="outlined"
            density="comfortable"
            show-size-counter
            class="upload-input"
          ></v-file-input>
        </div>

        <v-text-field
          v-if="decodedContent"
          :model-value="decodedContent"
          label="Decoded QR Content"
          variant="outlined"
          density="comfortable"
          readonly
          class="mt-4 decoded-content"
          prepend-inner-icon="mdi-check-circle"
        ></v-text-field>

        <canvas ref="qrCanvas" style="display: none"></canvas>
      </v-card-text>

      <v-card-actions class="qr-scanner-actions">
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          @click="$emit('close')"
          size="large"
          class="action-btn"
        >
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          @click="$emit('apply')"
          :disabled="!decodedContent"
          size="large"
          class="action-btn apply-btn"
          append-icon="mdi-check"
        >
          Apply
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import jsQR from 'jsqr'

const props = defineProps({
  show: Boolean,
  qrImageFile: Array,
  decodedContent: String,
  scanError: String
})

const emit = defineEmits([
  'close',
  'apply',
  'update:qr-image-file',
  'update:decoded-content',
  'update:scan-error'
])

const qrCanvas = ref(null)

// Watch for file changes and process QR code
watch(() => props.qrImageFile, (newFiles) => {
  if (newFiles && newFiles.length > 0) {
    const file = newFiles[0]
    emit('update:decoded-content', '')
    emit('update:scan-error', '')

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = qrCanvas.value
        if (!canvas) {
          emit('update:scan-error', 'Canvas element not found.')
          return
        }

        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0, img.width, img.height)

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          })

          if (code) {
            emit('update:decoded-content', code.data)
            emit('update:scan-error', '')
          } else {
            emit('update:scan-error', 'No QR code found in the image.')
            emit('update:decoded-content', '')
          }
        } catch (e) {
          emit('update:scan-error', `Error processing image: ${e.message}`)
          emit('update:decoded-content', '')
        }
      }

      img.onerror = () => {
        emit('update:scan-error', 'Could not load image. Please ensure it\'s a valid image file.')
        emit('update:decoded-content', '')
      }

      img.src = e.target.result
    }

    reader.readAsDataURL(file)
  } else {
    emit('update:decoded-content', '')
    emit('update:scan-error', '')
  }
})
</script>

<style scoped>
.qr-scanner-card {
  border-radius: 20px !important;
  overflow: hidden;
}

.qr-scanner-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  padding: 24px;
}

.header-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 6px;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.close-btn {
  color: rgba(255, 255, 255, 0.8);
}

.close-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.qr-scanner-content {
  padding: 32px;
}

.upload-section {
  text-align: center;
}

.upload-input {
  border-radius: 12px;
}

.decoded-content {
  background: rgba(76, 175, 80, 0.05);
  border-radius: 12px;
}

.qr-scanner-actions {
  padding: 24px 32px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.action-btn {
  border-radius: 12px !important;
  font-weight: 600;
  text-transform: none;
  min-width: 120px;
  transition: all 0.3s ease;
}

.apply-btn {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3) !important;
}

.apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4) !important;
}

:deep(.v-file-input .v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
