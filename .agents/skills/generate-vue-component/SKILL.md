---
name: generate-vue-component
description: Generates a new Vue 3 component using Tailwind CSS and Vuetify, following project conventions.
---

# Generate Vue Component

When the user asks to "create a new component" or "generate a Vue component", follow these steps:

1. **Understand Requirements**: Ensure you know the component name, its purpose, and what props it needs.
2. **File Creation**: Create the new component in `src/components/` (or the appropriate subdirectory).
3. **Structure**:
   - Use `<script setup>` syntax.
   - Use Tailwind CSS utility classes for layout and styling where possible, utilizing Vuetify components for complex interactive elements.
4. **Validation**: Make sure to include proper imports (e.g., `import { ref } from 'vue'`).

### Example Template
```vue
<template>
  <div class="p-4 rounded shadow bg-white">
    <h2 class="text-xl font-bold">{{ title }}</h2>
    <!-- Component content goes here -->
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Default Title'
  }
});
</script>
```
