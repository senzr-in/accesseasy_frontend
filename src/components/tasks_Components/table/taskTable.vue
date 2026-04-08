<!-- taskTable.vue - ✅ ERROR FIXED! Works with BOTH Row Click + Button -->
<template>
  <DataTable
    :items="tasks"
    :columns="taskColumns"
    :selectedItems="selectedTasks"
    :showSelection="true"
    :expandable="false"
    :sortBy="sortBy"
    :sortDirection="sortDirection"
    @update:selectedItems="handleSelectedChange"
    @sort="handleSort"
    @rowClick="handleRowClick"
  >
    <!-- Employee ID -->
    <template #cell-employeeId="{ item }">
      <span class="employeeId-cell">{{ item.employeeId }}</span>
    </template>

    <!-- Status Badge -->
    <template #cell-status="{ item }">
      <TaskStatusBadge :status="item.status" />
    </template>

    <!-- End Date -->
    <template #cell-dueTime="{ item }">
      <span class="cellData">
        {{ item.dueTime ? new Date(item.dueTime).toLocaleString() : "N/A" }}
      </span>
    </template>

    <!-- Start Date -->
    <template #cell-from="{ item }">
      <span class="cellData">
        {{ item.from ? new Date(item.from).toLocaleString() : "N/A" }}
      </span>
    </template>

    <!-- Action Button -->
    <template #cell-actions="{ item }">
      <ActionBtn
        class="action-btn"
        data-action="complete"
        :icon="CheckCircle"
        variant="ghost"
        size="sm"
        tooltip="Complete Task"
        @click.stop="handleCompleteTask(item)"
      />
    </template>

    <!-- Expanded Content -->
    <template #expanded-content="{ item }">
      <div class="expanded-section">
        <h4 class="expanded-header">Other Details</h4>
        <TaskExpandedDetails :task="item" />
      </div>
    </template>
  </DataTable>
</template>

<script setup>
import { computed } from "vue";
import DataTable from "@/components/common/table/DataTable.vue";
import TaskStatusBadge from "../badges/TaskStatusBadge.vue";
import TaskExpandedDetails from "../table/taskExpandedDetails.vue";
import ActionBtn from "@/components/common/buttons/ActionButton.vue";
import { CheckCircle } from "lucide-vue-next";

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  selectedTaskIds: { type: Array, default: () => [] },
  expandedTaskId: [String, Number, null],
  sortBy: String,
  sortDirection: String,
});

const emit = defineEmits([
  "toggleSelectAll",
  "toggleTaskSelection",
  "requestSort",
  "toggleExpandedDetails",
  "openCompleteSidebar",
]);

const selectedTasks = computed(() =>
  props.tasks.filter((t) => props.selectedTaskIds.includes(t.id)),
);

const taskColumns = [
  {
    key: "employeeId",
    label: "Employee ID",
    field: "employeeId",
    width: "1",
    sortable: true,
  },
  {
    key: "assignedUser",
    label: "Assigned To",
    field: "assignedUser",
    width: "1.5",
    sortable: false,
  },
  // {
  //   key: "taskType",
  //   label: "Task Type",
  //   field: "taskType",
  //   width: "1.3",
  //   sortable: true,
  // },
  {
    key: "title",
    label: "Job Title",
    field: "title",
    width: "2",
    sortable: true,
  },
  {
    key: "orgName",
    label: "Client",
    field: "orgName",
    width: "1.5",
    sortable: false,
  },
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
    key: "status",
    label: "Status",
    field: "status",
    width: "1.2",
    sortable: true,
  },
  // {
  //   key: "actions",
  //   label: "View Task Details ",
  //   field: "actions",
  //   width: "1.3",
  //   sortable: false,
  // },
];

const handleSelectedChange = (selectedItems) => {
  const selectedIds = selectedItems.map((i) => i.id);
  const currentIds = props.selectedTaskIds;

  const allCount = props.tasks.length;

  if (selectedIds.length === 0 && currentIds.length === allCount) {
    emit("toggleSelectAll");
    return;
  }

  if (selectedIds.length === allCount && currentIds.length !== allCount) {
    emit("toggleSelectAll");
    return;
  }

  const added = selectedIds.find((id) => !currentIds.includes(id));
  const removed = currentIds.find((id) => !selectedIds.includes(id));

  if (added) emit("toggleTaskSelection", added);
  else if (removed) emit("toggleTaskSelection", removed);
};

const handleSort = ({ field }) => emit("requestSort", field);

const handleCompleteTask = (task) => {
  emit("openCompleteSidebar", task);
};

// ✅ FIXED: Safe for undefined event!
const handleRowClick = (item, event) => {
  // 1. Handle checkbox clicks (selection only)
  if (
    event &&
    (event.target.type === "checkbox" ||
      event.target.closest('input[type="checkbox"]'))
  ) {
    emit("toggleTaskSelection", item.id);
    return;
  }

  // 2. Skip action button clicks (let button handle it)
  if (
    event &&
    (event.target.closest(".action-btn") ||
      event.target.closest('[data-action="complete"]'))
  ) {
    return;
  }

  // 3. ✅ OPEN CompleteTaskSidebar on ROW CLICK
  emit("openCompleteSidebar", item);
};
</script>

<style scoped>
.cellData {
  font-size: 0.875rem;
  color: #374151;
}
.employeeId-cell {
  font-weight: bold;
  color: #122f68;
  font-size: 0.9rem;
}

.expanded-section {
  padding: 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}
.expanded-header {
  font-size: medium;

  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1e293b;
}
</style>
