<template>
  <v-app>
    <v-container fluid class="pa-0 fill-height" style="width: 100%">
      <div
        class="layout-container"
        style="
          display: flex;
          height: 100%;
          padding: 18px;
          gap: 18px;
          width: 100%;
        "
      >
        <!-- Sidebar Navigation -->
        <div
          class="sidebar"
          style="flex: 0 0 auto; min-width: 250px; max-width: 300px"
        >
          <v-card flat>
            <div class="sidebar-content" style="height: 90vh; overflow-y: auto">
              <div
                v-for="config in configurators"
                :key="config.id"
                class="sidebar-section"
              >
                <div class="sidebar-header">
                  {{ config.label }}
                </div>
                <v-list density="compact" class="py-0">
                  <v-list-item
                    v-for="subsection in config.subsections"
                    :key="subsection.id"
                    @click="switchTab(subsection.id)"
                    :class="{ 'active-tab': activeTab === subsection.id }"
                    class="mb-1 rounded"
                  >
                    <v-list-item-title class="text-body-2">
                      {{ subsection.label }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Main Content Area -->
        <div
          class="main-content"
          style="
            flex: 1;
            border: 1px solid #e2e8f0;

            display: flex;
            flex-direction: column;
            min-width: 0;
            height: 90vh;
            border-radius: 1rem;
          "
        >
          <!-- Breadcrumb -->
          <div
            class="breadcrumb d-flex align-center text-body-2 pa-4"
            style="
              color: #64748b;
              border: 1px solid #059367;
              background-color: #ecfdf5;
            "
          >
            <!-- Root clickable -->
            <span class="cursor-pointer" @click="switchTab(activeTab)">
              Configurators
            </span>
            <v-icon small class="mx-2">mdi-chevron-right</v-icon>

            <!-- Parent section clickable -->
            <span class="cursor-pointer" @click="switchTab(activeTab)">
              {{ breadcrumbs[1]?.title || "" }}
            </span>
            <v-icon small class="mx-2">mdi-chevron-right</v-icon>

            <!-- Active subsection -->
            <span class="font-weight-medium" @click="switchTab(activeTab)">
              {{ breadcrumbs[2]?.title || "" }}
            </span>
          </div>

          <!-- Content Area -->
          <div class="content-area pa-4">
            <router-view />
          </div>
        </div>
      </div>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";

// --- Reactive state ---
const activeTab = ref("branches");

const router = useRouter();
const route = useRoute();

// --- Configuration sections ---
const configurators = [
  {
    id: "configuration",
    label: "Organization Configurator",
    subsections: [
      { id: "branches", label: "Branches" },
      { id: "departments", label: "Departments" },
      // { id: "teams", label: "Teams" },
      // { id: "designations", label: "Designations" },
    ],
  },
  {
    id: "attendance",
    label: "Attendance Configurator",
    subsections: [
      { id: "ShiftSettings", label: "Shifts" },
      { id: "attendance-cycle", label: "Attendance Cycle" },
      { id: "LeaveSettings", label: "Leaves" },
      { id: "HolidaySettings", label: "Holidays" },
    ],
  },
  // {
  //   id: "expense",
  //   label: "Expense Configurator",
  //   subsections: [{ id: "expense", label: "Manage Expenses" }],
  // },
  // {
  //   id: "payroll",
  //   label: "Payroll Configurator",
  //   subsections: [
  //     { id: "Payrollpolicy", label: "Payroll Policies" },
  //     { id: "Penalitypolicy", label: "Penalty Policies" },
  //   ],
  // },
  {
    id: "door",
    label: "Door Configurator", // ← NEW SECTION
    subsections: [
      { id: "door-configurator", label: "Manage Doors" }, // ← NEW SUB-SECTION
    ],
  },
  {
    id: "device",
    label: "Device Configurator",
    subsections: [
      { id: "device-configurator", label: "Manage Devices" },
      { id: "camera-management", label: "Manage Cameras" },
    ],
  },
  {
    id: "accesslevel",
    label: "Access Level Configurator",
    subsections: [
      { id: "accesslevel-configurator", label: "Manage Access Levels" },
      { id: "timerzone", label: "Time Zones" }, // ← ADDED TIMERZONE SUBSECTION
    ],
  },
  {
    id: "antipassbackMode",
    label: "Global Configurator",
    subsections: [
      { id: "antipassbackmode-configurator", label: "Anti-passback Mode" }, // ← Fixed
      { id: "interlockmode-configurator", label: "Interlock Mode" }, // ← Fixed
    ],
  },
];

// Get all valid route names from configurators
const validRouteNames = computed(() => {
  return configurators.flatMap((config) =>
    config.subsections.map((subsection) => subsection.id)
  );
});

// --- Route checking and initialization ---
const initializeActiveTab = () => {
  console.log("Current route:", route.name, route.path);

  // Check if current route name exists in our valid route names
  if (route.name && validRouteNames.value.includes(route.name)) {
    // If route has a valid name, use it as active tab
    activeTab.value = route.name;
    console.log("Active tab set from route name:", route.name);
  } else {
    // If no valid route name, default to 'branches' and navigate there
    activeTab.value = "branches";
    router.replace({ name: "branches" });
    console.log("No valid route name found, defaulting to 'branches'");
  }
};

// --- Lifecycle hooks ---
onMounted(() => {
  console.log("Component mounted - initializing active tab");
  initializeActiveTab();
});

// Watch for route changes
watch(
  () => route.name,
  (newRouteName) => {
    console.log("Route changed to:", newRouteName);
    if (newRouteName && validRouteNames.value.includes(newRouteName)) {
      activeTab.value = newRouteName;
      console.log("Active tab updated from route change:", newRouteName);
    }
  }
);

// Optional: Check before unmount (for cleanup if needed)
onBeforeUnmount(() => {
  console.log("Component unmounting - current active tab:", activeTab.value);
});

const breadcrumbs = computed(() => {
  const subsection = configurators
    .flatMap((c) => c.subsections.map((s) => ({ ...s, parent: c.label })))
    .find((s) => s.id === activeTab.value);

  // 👇 Add a console log here to see what's happening
  console.log("Breadcrumb computed for activeTab:", activeTab.value);
  console.log("Matched subsection:", subsection);

  return [
    { title: "Configurators", disabled: false },
    { title: subsection?.parent || "Payroll Configurator", disabled: false },
    { title: subsection?.label || "Payroll Categories", disabled: true },
  ];
});

function goToRoot() {
  router.push({ name: "branches" }); // or your default route
}

function goToParent() {
  const subsection = configurators
    .flatMap((c) =>
      c.subsections.map((s) => ({ ...s, parentId: c.id, parent: c.label }))
    )
    .find((s) => s.id === activeTab.value);

  if (subsection?.parentId) {
    // Find the first subsection of that parent and navigate there
    const parent = configurators.find((c) => c.id === subsection.parentId);
    if (parent && parent.subsections.length) {
      const firstChild = parent.subsections[0].id;
      router.push({ name: firstChild });
      activeTab.value = firstChild;
    }
  }
}

// --- Tab switch method ---
function switchTab(tabId) {
  activeTab.value = tabId;
  router.push({ name: tabId });
}
</script>

<style scoped>
.breadcrumb {
  color: rgb(6, 6, 6) !important;
  border: 1px solid #f44336 !important;
  background-color: rgb(243, 228, 227) !important;
  border-radius: 4px;
}
.sidebar {
  /* width: 240px; */
  background-color: white;
  border-right: 1px solid #e0e0e0;
  height: 90vh !important;
}

.sidebar-content {
  /* Scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f5f5f5;
}

.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.sidebar-section {
  margin-bottom: 16px;
}

.sidebar-header {
  font-weight: 600;
  font-size: 14px;
  padding: 8px 12px;
  background-color: #f5dcda;
  border: 1px solid red;
  border-radius: 4px;
  margin-bottom: 8px;
}

.active-tab {
  background-color: rgb(244, 84, 84) !important;
  color: white !important;
  font-weight: 500;
}

.breadcrumb-card {
  border-bottom: 1px solid #e0e0e0;
}
.breadcrumb span {
  cursor: pointer;
}
.content-area {
  background-color: #fafafa;
  height: 90vh;
}

.header-controls {
  border-bottom: 1px solid #e0e0e0;
}

.control-group {
  gap: 16px;
  flex: 1;
}

.search-field {
  max-width: 300px;
}

.year-select {
  max-width: 150px;
}

.footer-pagination {
  border-top: 1px solid #e0e0e0;
  justify-content: space-between;
  padding: 12px 16px;
}

.pagination-controls {
  gap: 8px;
}

.fill-height {
  height: 95vh !important;
}
</style>
