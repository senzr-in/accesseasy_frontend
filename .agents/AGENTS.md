# Accesseasy Frontend — Agent Rules

## 🧠 Before Every Task
1. Read `.agents/PROJECT_CONTEXT.md` **first** to understand architecture, patterns, and conventions.
2. Identify what **domain** (`pages/` subdirectory) or **service** the task belongs to.
3. Check if a reusable component already exists under `src/components/common/` before creating a new one.

---

## ⚙️ Tech Stack (Non-Negotiable)
- **Framework**: Vue 3 with `<script setup>` syntax ONLY — no Options API, no `defineComponent`.
- **Styling**: Tailwind CSS v4 for layout/spacing/colors. Vuetify v4 for complex interactive components.
- **HTTP**: Use the Axios instances from `authService` (`api`, `knApi`, `protectedApi`). Never import `axios` directly in a component.
- **Routing**: Vue Router 4. RBAC is enforced in the router only — never in component logic.
- **State**: Module-level `ref`/`reactive` singleton pattern. No Pinia, no Vuex.
- **Imports**: Always use `@/` alias for `src/`. Never use relative `../../` paths.

---

## 🚫 Hard Rules
- **Never break the singleton composable pattern.** Reactive state must be declared at module level, outside the exported function.
- **Never add role-check logic inside a component.** Use `authService.getUserRole()` only in the router or service layer.
- **Never use raw `axios` in a component or page file.** API logic belongs in `src/services/`.
- **Always use `ConfirmDeleteModal.vue`** for any destructive action.
- **Never hardcode URLs or tenant IDs.** Use environment variables and `currentUserTenant`.

---

## 🎨 UI & Design Guidelines
- Match the existing dark-mode glass design language: `bg-white/60 dark:bg-[#151c2c]/40 backdrop-blur-xl`.
- Use `transition-colors duration-300` for color transitions to stay consistent with the dashboard layout.
- The dashboard's right drawer is opened via `useDashboardState().openDrawer(type, data)` — prefer this over creating new full-page modals.

---

## 📂 Where Things Live
| Need | Look Here |
|------|-----------|
| Auth & API | `src/services/authService.js` |
| Real-time camera | `src/services/mqttService.js` + `src/composables/useMQTT.js` |
| Current user / tenant | `src/utils/currentUserTenant.js` |
| Security ops state | `src/stores/useSOCStore.js` |
| Dashboard state / drawer | `src/composables/useDashboardState.js` |
| Delete confirmation | `src/components/common/modals/ConfirmDeleteModal.vue` |
| Data exports | `src/utils/helpers/importHelper.js` |

---

## 🛠️ Available Skills
| Trigger | Skill |
|---------|-------|
| "generate a Vue component" | `.agents/skills/generate-vue-component/SKILL.md` |
| "create a new page" | `.agents/skills/create-page/SKILL.md` |
| "add an API service method" | `.agents/skills/add-api-service/SKILL.md` |
| "create a new composable" | `.agents/skills/create-composable/SKILL.md` |
