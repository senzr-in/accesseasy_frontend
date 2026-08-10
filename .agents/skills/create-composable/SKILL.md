---
name: create-composable
description: Creates a new Vue 3 composable following the project's module-level singleton pattern. Use when the user asks to "extract shared logic", "create a composable", or "share state between components".
---

# Create a New Composable

## ⚠️ Critical: The Singleton Pattern

This project uses a **module-level singleton** for all shared state. This is different from how most tutorials teach composables. Follow it exactly.

### ✅ CORRECT — Singleton (state shared across all instances)
```js
// State is OUTSIDE the exported function → module-level singleton
const sharedState = ref(null);

export function useMyComposable() {
  return { sharedState };
}
```

### ❌ WRONG — Isolated (state is NOT shared between components)
```js
export function useMyComposable() {
  // State inside the function → each component gets its OWN copy
  const isolatedState = ref(null);
  return { isolatedState };
}
```

Use the singleton pattern unless the user **explicitly** says they want isolated, per-component state.

---

## Step 1: Identify Placement

| Type | Location |
|------|----------|
| General dashboard shared state | `src/composables/` |
| Security-specific logic | `src/composables/security/` |
| Workforce-specific logic | `src/composables/workforce/` |
| Work order flow logic | `src/composables/workorder/` |

## Step 2: Write the Composable

```js
// src/composables/useMyFeature.js
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { myService } from '@/services/myService';

// ── Module-level singleton state ───────────────────────────────────────
const items = ref([]);
const isLoading = ref(false);
const error = ref(null);

// Track how many components are mounted, for lifecycle management
let _refCount = 0;

// ── Derived state ──────────────────────────────────────────────────────
const totalCount = computed(() => items.value.length);
const hasError = computed(() => !!error.value);

// ── Actions ───────────────────────────────────────────────────────────
async function fetchItems() {
  isLoading.value = true;
  error.value = null;
  try {
    items.value = await myService.getAll();
  } catch (e) {
    error.value = e.message;
    console.error('[useMyFeature] fetchItems failed:', e);
  } finally {
    isLoading.value = false;
  }
}

// ── Exported composable function ──────────────────────────────────────
export function useMyFeature() {
  onMounted(() => {
    _refCount++;
    if (_refCount === 1) {
      // Only initialize on the FIRST mount
      fetchItems();
    }
  });

  onUnmounted(() => {
    _refCount--;
    if (_refCount === 0) {
      // Clean up on the LAST unmount (optional)
      items.value = [];
    }
  });

  return {
    // State
    items,
    isLoading,
    error,
    // Computed
    totalCount,
    hasError,
    // Actions
    fetchItems,
  };
}
```

## Step 3: Use It

```vue
<script setup>
import { useMyFeature } from '@/composables/useMyFeature';

const { items, isLoading, totalCount, fetchItems } = useMyFeature();
</script>
```

## For MQTT-based composables

If the composable needs real-time data, wrap `useMQTT()`:
```js
import { useMQTT } from '@/composables/useMQTT';

export function useMyRealtimeFeature() {
  const { personEvents, mqttStatus } = useMQTT();
  // derive your feature's state from personEvents...
  return { personEvents, mqttStatus };
}
```
