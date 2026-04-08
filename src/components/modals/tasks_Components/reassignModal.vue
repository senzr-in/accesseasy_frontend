<template>
  <div class="modal" v-if="show">
    <div class="modal-content">
      <h2>Reassign Task(s)</h2>
      <p>Selected tasks: {{ taskIds.length }}</p>
      <FilterSelect
        v-model="selectedEmployee"
        :options="employeeOptions"
        placeholder="Select Employee"
      />
      <div class="modal-actions">
        <BaseButton variant="secondary" text="Cancel" @click="$emit('close')" />
        <BaseButton
          variant="primary"
          text="Reassign"
          @click="handleSubmit"
          :disabled="!selectedEmployee"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import FilterSelect from "@/components/common/filters/FilterSelect.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

const props = defineProps({
  show: Boolean,
  taskIds: Array,
  users: Array,
  currentEmployeeId: [String, Number, null],
});

const emit = defineEmits(["close", "reassign"]);

const selectedEmployee = ref(props.currentEmployeeId);

const employeeOptions = computed(() =>
  props.users.map((user) => ({ value: user.id, label: user.label })),
);

const handleSubmit = () => {
  if (selectedEmployee.value) {
    emit("reassign", { employeeId: selectedEmployee.value, status: "pending" });
  }
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
