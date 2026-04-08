<template>
  <div class="expanded-details">
    <div class="details-content">
      <div class="detail-section">
        <h4>Task Information</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Description:</span>
            <span class="detail-value">{{
              task.description || "No description provided"
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Created:</span>
            <span class="detail-value">{{
              formatDate(task.date_created)
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Form ID:</span>
            <span class="detail-value">{{ task.assignFormId || "N/A" }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Task Type:</span>
            <span class="detail-value">{{
              formatTaskType(task.taskType)
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  task: Object,
});

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (e) {
    return "Invalid Date";
  }
};

const formatTaskType = (type) => {
  if (!type) return "Unknown";
  switch (type.toLowerCase()) {
    case "sitevisit":
      return "Site Visit";
    case "moneycollection":
      return "Money Collection";
    case "installation":
      return "Installation";
    case "service":
      return "Service";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};
</script>

<style scoped>
.expanded-details {
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-section {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.detail-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
}

.detail-grid {
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
  color: #64748b;
  font-weight: 500;
}

.detail-value {
  font-size: 0.875rem;
  color: #1e293b;
}
</style>
