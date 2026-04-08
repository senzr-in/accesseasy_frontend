<template>
  <span class="status-badge" :class="`status-${normalizedStatus}`">
    <component :is="statusIcon" :size="16" v-if="statusIcon" />
    {{ formatStatus(status) }}
  </span>
</template>

<script setup>
import { computed } from "vue";
import {
  Clock,
  Hourglass,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-vue-next";

const props = defineProps({
  status: {
    type: String,
    default: "pending",
  },
});

const normalizedStatus = computed(
  () => props.status?.toLowerCase() || "pending",
);

const statusIcon = computed(() => {
  switch (normalizedStatus.value) {
    case "pending":
      return Clock;
    case "inprogress":
      return Hourglass;
    case "completed":
      return CheckCircle;
    case "overDue":
      return AlertCircle;
    case "cancelled":
      return XCircle;
    default:
      return null;
  }
});

const formatStatus = (status) => {
  if (!status) return "Unknown";
  switch (status.toLowerCase()) {
    case "inprogress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "pending":
      return "Pending";
    case "overDue":
      return "Over Due";
    case "cancelled":
      return "Cancelled";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
};
</script>

<style scoped>
.status-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.6rem;

  font-weight: 300;
  white-space: nowrap;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-inprogress {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}

.status-overdue {
  background: #fee2e2;
  color: #dc2626;
}

.status-cancelled {
  background: #fee2e2;
  color: #dc2626;
}
</style>
