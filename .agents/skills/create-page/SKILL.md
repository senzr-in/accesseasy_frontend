---
name: create-page
description: Creates a complete new page/view in the Accesseasy frontend. Use when the user asks to "add a page", "create a new view", or "add a route".
---

# Create a New Page

## Step 1: Clarify Requirements
Before writing any code, confirm:
- What is the page name? (e.g., `IncidentDetail`)
- What domain does it belong to? (e.g., `incidents`, `visitors`, `guard`)
- Which roles should access it? (`Admin`, `Manager`, `Employee`, `Guard`)
- Does it need its own subdirectory, or is it a nested tab within an existing page?

## Step 2: Create the Page Component

Create the file at: `src/pages/<domain>/index.vue` (or a meaningful name like `IncidentDetail.vue`).

### Required Structure
```vue
<template>
  <!-- Use Teleport to inject the page title into the shared dashboard header -->
  <Teleport to="#header-title-slot">
    <div class="flex flex-col justify-center">
      <h1 class="text-base font-semibold text-slate-800 dark:text-white leading-tight">Page Title</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400">Subtitle or breadcrumb</p>
    </div>
  </Teleport>

  <!-- Page content wrapper -->
  <div class="flex flex-col gap-6 p-6 h-full overflow-y-auto">
    <!-- Your content here -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { currentUserTenant } from '@/utils/currentUserTenant';
// Import the relevant service for API calls

// Initialize tenant context if needed
onMounted(async () => {
  await currentUserTenant.initialize();
  // fetch data...
});
</script>
```

## Step 3: Register the Route

Open `src/router/index.js` and add the route to the correct `dashboardChildren` block:

```js
{
  path: 'your-path',
  name: 'YourPageName',
  component: () => import('@/pages/<domain>/index.vue'),
  meta: { roles: ['Admin', 'Manager'] }  // <-- match the correct roles
}
```

⚠️ Use a **lazy import** (`() => import(...)`) for all new routes. Never use a static import for new pages.

## Step 4: Add Navigation (if needed)
If the page needs a sidebar link, find the correct sidebar component in `src/components/layout/` or `src/components/guard/` depending on the app mode.

## Step 5: Verify
- Confirm the correct roles are set in `meta.roles`.
- Check that the `Teleport` target `#header-title-slot` is present in `dashboardLayout.vue`.
- Confirm the component uses `@/` import aliases, not relative paths.
