<!-- src/components/common/filters/SearchableSelect.vue -->
<template>
  <div class="searchable-select" ref="root">
    <!-- Trigger -->
    <div
      class="trigger"
      :class="{ open: isOpen, selected: modelValue }"
      @click="toggle"
    >
      <span class="label">
        {{ selectedLabel || placeholder }}
      </span>
      <ChevronDown class="icon" :class="{ rotated: isOpen }" />
      <X v-if="modelValue" class="clear" @click.stop="clear" />
    </div>

    <!-- Dropdown -->
    <div v-if="isOpen" class="dropdown" ref="panel">
      <div class="search-box">
        <Search class="search-icon" />
        <input
          ref="input"
          v-model="query"
          class="search-input"
          placeholder="Search..."
          @keydown.stop
        />
        <X v-if="query" class="clear-search" @click="query = ''" />
      </div>

      <div class="options" ref="options">
        <div
          v-for="opt in filtered"
          :key="opt.value"
          class="option"
          :class="{ active: opt.value === modelValue }"
          @click="pick(opt)"
        >
          {{ opt.label }}
        </div>

        <div v-if="loading" class="option loading">
          <Loader2 class="spin" /> Loading…
        </div>

        <div v-if="!loading && filtered.length === 0" class="option empty">
          No results
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { ChevronDown, Search, X, Loader2 } from "lucide-vue-next";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  placeholder: { type: String, default: "Select…" },
  fetchOptions: { type: Function, required: true },
  staticOptions: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue", "change", "clear"]);

const root = ref(null);
const panel = ref(null);
const input = ref(null);
const isOpen = ref(false);
const query = ref("");
const loading = ref(false);

/* ------------------------------------------------------------------
   1. Keep **full** list (static + fetched) so the selected item is
       always present – even after a search.
------------------------------------------------------------------ */
const fullList = ref([]);

/* ------------------------------------------------------------------
   2. Selected label – **always** taken from the full list
------------------------------------------------------------------ */
const selectedLabel = computed(() => {
  const o = fullList.value.find((x) => x.value === props.modelValue);
  return o?.label || "";
});

/* ------------------------------------------------------------------
   3. What we show in the dropdown
------------------------------------------------------------------ */
const filtered = computed(() => {
  if (!query.value) return fullList.value;
  const q = query.value.toLowerCase();
  return fullList.value.filter((o) => o.label.toLowerCase().includes(q));
});

/* ------------------------------------------------------------------
   Open / close
------------------------------------------------------------------ */
const toggle = () => (isOpen.value ? close() : open());
const open = async () => {
  isOpen.value = true;
  fullList.value = props.staticOptions; // start with static data
  await nextTick();
  input.value?.focus();
};
const close = () => {
  isOpen.value = false;
  query.value = "";
};

/* ------------------------------------------------------------------
   Pick / clear
------------------------------------------------------------------ */
const pick = (opt) => {
  emit("update:modelValue", opt.value);
  emit("change", opt.value);
  close();
};
const clear = () => {
  emit("update:modelValue", "");
  emit("clear");
};

/* ------------------------------------------------------------------
   Debounced backend search – **merge** results with static list
------------------------------------------------------------------ */
let timer = null;
watch(query, () => {
  clearTimeout(timer);
  if (!query.value) {
    fullList.value = props.staticOptions;
    loading.value = false;
    return;
  }

  loading.value = true;
  timer = setTimeout(async () => {
    try {
      const remote = await props.fetchOptions(query.value);
      // keep static items + remote items (dedupe by value)
      const map = new Map();
      props.staticOptions.forEach((i) => map.set(i.value, i));
      remote.forEach((i) => map.set(i.value, i));
      fullList.value = Array.from(map.values());
    } catch (e) {
      console.error(e);
      fullList.value = props.staticOptions;
    } finally {
      loading.value = false;
    }
  }, 300);
});

/* ------------------------------------------------------------------
   When the **static** list changes (e.g. first load) – refresh fullList
------------------------------------------------------------------ */
watch(
  () => props.staticOptions,
  (newStatic) => {
    if (!query.value) fullList.value = newStatic;
  },
  { immediate: true },
);

/* ------------------------------------------------------------------
   Click‑outside
------------------------------------------------------------------ */
const clickOutside = (e) => {
  if (root.value && !root.value.contains(e.target)) close();
};
onMounted(() => {
  document.addEventListener("click", clickOutside);
});
onUnmounted(() => document.removeEventListener("click", clickOutside));
</script>

<style scoped>
/* ──────────────────────────────────────────────────────────────── */
.searchable-select {
  position: relative;
  width: 100%;
}
.trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  min-height: 38px;
}
.trigger:hover {
  border-color: #9ca3af;
}
.trigger.open {
  border-color: #3b82f6;
}
.trigger.selected {
  background: #f9fafb;
}

.label {
  flex: 1;
  color: #374151;
}
.icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}
.icon.rotated {
  transform: rotate(180deg);
}
.clear {
  margin-left: 8px;
  cursor: pointer;
  color: #9ca3af;
}
.clear:hover {
  color: #374151;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 320px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Search box */
.search-box {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafbfc;
}
.search-icon {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  margin-right: 8px;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
}
.clear-search {
  cursor: pointer;
  color: #9ca3af;
}
.clear-search:hover {
  color: #374151;
}

/* Options */
.options {
  flex: 1;
  overflow-y: auto;
}
.option {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
}
.option:hover {
  background: #f3f4f6;
}
.option.active {
  background: #dbeafe;
  font-weight: 500;
}
.option.loading {
  display: flex;
  align-items: center;
  color: #6b7280;
}
.spin {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  animation: spin 1s linear infinite;
}
.option.empty {
  color: #9ca3af;
  font-style: italic;
  text-align: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
