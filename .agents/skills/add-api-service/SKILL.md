---
name: add-api-service
description: Adds new API call methods to an existing service file, or creates a new service. Use when the user asks to "connect to an API", "call a backend endpoint", or "fetch data from the server".
---

# Add an API Service Method

## Core Rule
**Never call `axios` directly in a component or page.** All HTTP logic lives in `src/services/`.

## Step 1: Identify the Right Axios Instance

In `authService.js`, there are 3 instances. Pick the correct one:

| Instance | When to use |
|----------|-------------|
| `authService.api` | Public endpoints (login, register) — no auth header |
| `authService.protectedApi` | Main protected API calls (most features) |
| `authService.knApi` | Calls to Knative serverless functions |

## Step 2: Find or Create the Service File

- **Existing service?** Check `src/services/` for relevant files (e.g., `patrolService.js`, `zoneService.js`).
- **New domain?** Create `src/services/<domain>Service.js`.

## Step 3: Write the Method

Follow this exact pattern used throughout the codebase:

```js
// src/services/exampleService.js
import { authService } from '@/services/authService';

class ExampleService {
  async getItems(tenantId) {
    try {
      const response = await authService.protectedApi.get(`/api/items`, {
        params: { tenantId }
      });
      return response.data;
    } catch (error) {
      console.error('[ExampleService] getItems failed:', error.message);
      throw error;
    }
  }

  async createItem(payload) {
    try {
      const response = await authService.protectedApi.post(`/api/items`, payload);
      return response.data;
    } catch (error) {
      console.error('[ExampleService] createItem failed:', error.message);
      throw error;
    }
  }
}

export const exampleService = new ExampleService();
```

Key rules:
- Always wrap in `try/catch`.
- Always log errors with a `[ServiceName]` prefix for easy debugging.
- Always re-throw the error so the calling component can handle it.
- Export as a **singleton instance** (`export const exampleService = new ExampleService()`).

## Step 4: Use It in a Component

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { exampleService } from '@/services/exampleService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const items = ref([]);
const isLoading = ref(false);
const error = ref(null);

onMounted(async () => {
  isLoading.value = true;
  try {
    await currentUserTenant.initialize();
    const tenantId = currentUserTenant.getTenantId();
    items.value = await exampleService.getItems(tenantId);
  } catch (e) {
    error.value = e.message;
  } finally {
    isLoading.value = false;
  }
});
</script>
```
