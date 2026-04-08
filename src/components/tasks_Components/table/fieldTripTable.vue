<template>
  <DataTable
    :items="fieldTrips"
    :columns="fieldTripColumns"
    :selectedItems="selectedFieldTrips"
    :showSelection="true"
    :expandable="false"
    :sortBy="sortBy"
    :sortDirection="sortDirection"
    @update:selectedItems="handleSelectedChange"
    @sort="handleSort"
  >
    <!-- Custom Status Cell -->
    <template #cell-status="{ item }">
      <TaskStatusBadge :status="item.status" />
    </template>

    <!-- Format Employee ID -->
    <template #cell-employeeId="{ item }">
      <span class="cellData">
        {{ item.employeeId || "N/A" }}
      </span>
    </template>

    <!-- Format Assigned User -->
    <template #cell-assignedUser="{ item }">
      <span class="cellData">
        {{ (item.assignedUser && item.assignedUser.first_name) || "N/A" }}
      </span>
    </template>

    <!-- Format Due Time -->
    <template #cell-dueTime="{ item }">
      <span class="cellData">
        {{ item.dueTime ? new Date(item.dueTime).toLocaleDateString() : "N/A" }}
      </span>
    </template>

    <!-- Format Start Date -->
    <template #cell-from="{ item }">
      <span class="cellData">
        {{ item.from ? new Date(item.from).toLocaleDateString() : "N/A" }}
      </span>
    </template>

    <!-- Format Distance -->
    <template #cell-distanceKm="{ item }">
      <span class="cellData">
        {{ item.distanceKm ? `${item.distanceKm} km` : "N/A" }}
      </span>
    </template>

    <!-- Format Organization -->
    <template #cell-orgName="{ item }">
      <span class="cellData">
        {{ item.orgName || "N/A" }}
      </span>
    </template>

    <!-- Route Map Cell -->
    <template #cell-routeMap="{ item }">
      <div class="map-cell">
        <Map
          v-if="item.routePolyline"
          class="map-icon"
          size="20"
          @click="emit('showRouteMap', item)"
        />
        <span v-else class="na-text">N/A</span>
      </div>
    </template>

    <!-- Expanded Content for extra details -->
    <template #expanded-content="{ item }">
      <div class="expanded-section">
        <h4 class="expanded-header">Field Trip Details</h4>
        <FieldTripExpandedDetails :fieldTrip="item" />
      </div>
    </template>
  </DataTable>
</template>

<script setup>
import { computed } from "vue";
import DataTable from "@/components/common/table/DataTable.vue";
import TaskStatusBadge from "../badges/TaskStatusBadge.vue";
import FieldTripExpandedDetails from "./fieldTripExpandedDetails.vue";
import { Map } from "lucide-vue-next";

const props = defineProps({
  fieldTrips: {
    type: Array,
    default: () => [],
  },
  selectedFieldTripIds: {
    type: Array,
    default: () => [],
  },
  expandedFieldTripId: [String, Number],
  sortBy: String,
  sortDirection: String,
});

const emit = defineEmits([
  "toggleSelectAll",
  "toggleFieldTripSelection",
  "requestSort",
  "viewFieldTripDetails",
  "toggleExpandedDetails",
  "showRouteMap",
]);

// Convert selectedFieldTripIds to selected field trip objects for DataTable
const selectedFieldTrips = computed(() => {
  return props.fieldTrips.filter((trip) =>
    props.selectedFieldTripIds.includes(trip.id),
  );
});

const fieldTripColumns = [
  {
    key: "title",
    label: "Field Trip Title",
    field: "title",
    width: "2",
    sortable: true,
  },
  {
    key: "employeeId",
    label: "Employee ID",
    field: "employeeId",
    width: "1.5",
    sortable: true,
  },
  {
    key: "assignedUser",
    label: "Assigned To",
    field: "assignedUser.first_name",
    width: "1.5",
    sortable: true,
  },
  {
    key: "tripType",
    label: "Trip Type",
    field: "tripType",
    width: "1.3",
    sortable: true,
  },
  {
    key: "purpose",
    label: "Purpose",
    field: "purpose",
    width: "1.5",
    sortable: false,
  },
  {
    key: "status",
    label: "Status",
    field: "status",
    width: "1.2",
    sortable: true,
  },
  // {
  //   key: "orgName",
  //   label: "Organization",
  //   field: "orgName",
  //   width: "1.5",
  //   sortable: false,
  // },
  {
    key: "from",
    label: "Start Date",
    field: "from",
    width: "1.7",
    sortable: true,
  },
  {
    key: "dueTime",
    label: "End Date",
    field: "dueTime",
    width: "1.7",
    sortable: true,
  },
  {
    key: "distanceKm",
    label: "Distance",
    field: "distanceKm",
    width: "1.2",
    sortable: true,
  },
  {
    key: "routeMap",
    label: "Route Map",
    width: "1.2",
    sortable: false,
  },
];

const handleSelectedChange = (selectedItems) => {
  const selectedIds = selectedItems.map((item) => item.id);
  const currentIds = props.selectedFieldTripIds;

  if (selectedIds.length === 0 && currentIds.length > 0) {
    emit("toggleSelectAll");
  } else if (
    selectedIds.length === props.fieldTrips.length &&
    currentIds.length !== props.fieldTrips.length
  ) {
    emit("toggleSelectAll");
  } else {
    const added = selectedIds.find((id) => !currentIds.includes(id));
    const removed = currentIds.find((id) => !selectedIds.includes(id));

    if (added) emit("toggleFieldTripSelection", added);
    else if (removed) emit("toggleFieldTripSelection", removed);
  }
};

// Handle sort
const handleSort = ({ field, direction }) => {
  emit("requestSort", field);
};
</script>

<style scoped>
.cellData {
  font-size: 0.875rem;
  color: #374151;
}

.expanded-section {
  padding: 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.expanded-header {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.map-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-icon {
  cursor: pointer;
  color: #4b5563;
  transition: color 0.2s ease;
}

.map-icon:hover {
  color: #2563eb;
}

.na-text {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
