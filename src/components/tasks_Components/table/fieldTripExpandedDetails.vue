<!-- src/components/tasks_Components/table/fieldTripExpandedDetails.vue -->
<template>
  <div class="field-trip-details">
    <div class="details-grid">
      <div class="detail-item">
        <span class="detail-label">Purpose:</span>
        <span class="detail-value">{{ fieldTrip.purpose || "N/A" }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Trip Type:</span>
        <span class="detail-value">{{ fieldTrip.tripType || "N/A" }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Distance:</span>
        <span class="detail-value">{{
          fieldTrip.distanceKm ? `${fieldTrip.distanceKm} km` : "N/A"
        }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Location:</span>
        <span class="detail-value">
          {{
            fieldTrip.lat && fieldTrip.lng
              ? `${fieldTrip.lat}, ${fieldTrip.lng}`
              : "N/A"
          }}
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Current Location:</span>
        <span class="detail-value">
          {{
            fieldTrip.currentLat && fieldTrip.currentLng
              ? `${fieldTrip.currentLat}, ${fieldTrip.currentLng}`
              : "N/A"
          }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  fieldTrip: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.field-trip-details {
  padding: 0.5rem 0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}
</style>
