<template>
  <div class="loading-overlay" v-if="show">
    <div class="loading-container">
      <div class="loading-content">
        <v-icon size="36" color="primary" class="loading-icon">{{
          icon
        }}</v-icon>
        <h3 class="loading-title">{{ title }}</h3>

        <div class="progress-container">
          <div class="loading-counter">
            <span v-if="totalUsers"
              >Completed: {{ completedUsers }} / {{ totalUsers }} Users</span
            >
            <span v-else>{{ statusText }}</span>
          </div>

         
        </div>

        <div class="loading-message">{{ message || statusMessage }}</div>

        <div v-if="cycleDates" class="cycle-dates">
          <div class="date-range">
            <span class="date-label">Start:</span>
            {{ formatDate(cycleDates.start) }}
            <span class="date-label ml-4">End:</span>
            {{ formatDate(cycleDates.end) }}
          </div>
          <div class="cycle-duration">{{ cycleDates.duration }} days</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
    },
    statusText: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "Loading Data",
    },
    message: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "mdi-loading mdi-spin",
    },
    autoClose: {
      type: Boolean,
      default: true,
    },
    closeDelay: {
      type: Number,
      default: 1000,
    },
    completedUsers: {
      type: Number,
      default: 0,
    },
    totalUsers: {
      type: Number,
      default: 0,
    },
    cycleDates: {
      type: Object,
      default: null,
    },
  },

  computed: {
    statusMessage() {
      if (this.progress < 30) {
        return "Initializing...";
      } else if (this.progress < 60) {
        return "Fetching data...";
      } else if (this.progress < 90) {
        return "Processing...";
      } else if (this.progress < 100) {
        return "Almost done...";
      } else {
        return "Complete!";
      }
    },
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },
  },

  watch: {
    progress(newValue) {
      if (newValue >= 100 && this.autoClose) {
        setTimeout(() => {
          this.$emit("update:show", false);
          this.$emit("complete");
        }, this.closeDelay);
      }
    },
  },
};
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.loading-content {
  padding: 2rem;
  text-align: center;
}

.loading-icon {
  margin-bottom: 1rem;
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1.5rem;
}

.progress-container {
  margin-bottom: 1.5rem;
}

.loading-counter {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4776e6;
  margin-bottom: 0.5rem;
}

.loading-message {
  font-size: 1rem;
  color: #718096;
  margin-bottom: 1rem;
}

.cycle-dates {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.date-range {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.date-label {
  font-weight: 600;
  color: #4a5568;
}

.cycle-duration {
  font-size: 1.1rem;
  font-weight: 700;
  color: #4776e6;
}

.ml-4 {
  margin-left: 1rem;
}
</style>
