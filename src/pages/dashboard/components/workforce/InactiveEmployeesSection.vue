<template>
  <div class="audit-card">
    <!-- Header -->
    <div class="audit-card__header">
      <div>
        <h2 class="audit-card__title">
          Inactive Employees Audit
          <span class="audit-badge">Security Audit</span>
        </h2>
        <p class="audit-card__sub">
          Employees who haven't recorded an access event recently
        </p>
      </div>

      <!-- Filters -->
      <div class="audit-controls">
        <!-- Search -->
        <div class="search-wrap">
          <Search class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search employee..."
            class="search-input"
          >
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="audit-table">
        <thead class="audit-table__head">
          <tr>
            <th>Employee</th>
            <th>Employee ID</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Last Access</th>
            <th>Assigned Card</th>
            <th>Status</th>
            <th class="text-right">
              Action
            </th>
          </tr>
        </thead>
        <TransitionGroup
          v-if="filteredEmployees.length > 0"
          name="table-row"
          tag="tbody"
          class="audit-table__body"
        >
          <tr
            v-for="emp in filteredEmployees"
            :key="emp.id"
            class="audit-row"
          >
            <!-- Employee -->
            <td class="audit-cell">
              <div class="employee-cell">
                <div class="employee-avatar-initial">
                  {{ getInitials(emp.first_name, emp.last_name) }}
                </div>
                <div>
                  <p class="employee-name">
                    {{ emp.first_name }} {{ emp.last_name }}
                  </p>
                  <p class="employee-email">
                    {{ emp.email || '—' }}
                  </p>
                </div>
              </div>
            </td>
            <!-- Emp ID -->
            <td class="audit-cell">
              <span class="font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold">{{ emp.employeeId || emp.id }}</span>
            </td>
            <!-- Department -->
            <td class="audit-cell">
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ emp.department || '—' }}</span>
            </td>
            <!-- Designation -->
            <td class="audit-cell">
              <span class="text-xs text-slate-500 dark:text-slate-400">{{ emp.designation || 'Staff' }}</span>
            </td>
            <!-- Last Access -->
            <td class="audit-cell">
              <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Clock class="w-3 h-3 text-slate-400" />
                <span>{{ emp.last_active || '—' }}</span>
              </div>
            </td>
            <!-- Assigned Card -->
            <td class="audit-cell">
              <span class="font-mono text-xs text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">
                {{ emp.card_number || 'None' }}
              </span>
            </td>
            <!-- Status -->
            <td class="audit-cell">
              <span class="status-badge status-badge--suspended">
                {{ emp.status || 'Inactive' }}
              </span>
            </td>
            <!-- Action -->
            <td class="audit-cell text-right">
              <div class="action-wrap">
                <button
                  class="action-trigger"
                  @click="activeActionId = activeActionId === emp.id ? null : emp.id"
                >
                  <MoreHorizontal class="w-4 h-4" />
                </button>
                <Transition name="dropdown">
                  <div
                    v-if="activeActionId === emp.id"
                    class="action-dropdown"
                  >
                    <button
                      class="action-item"
                      @click="activeActionId = null"
                    >
                      <User class="w-3.5 h-3.5 text-indigo-500" /> View Employee
                    </button>
                    <button
                      class="action-item"
                      @click="activeActionId = null"
                    >
                      <History class="w-3.5 h-3.5 text-blue-500" /> Access History
                    </button>
                  </div>
                </Transition>
              </div>
            </td>
          </tr>
        </TransitionGroup>
      </table>

      <div v-if="filteredEmployees.length === 0" class="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
        No inactive employees requiring audit attention.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, Clock, MoreHorizontal, User, History } from 'lucide-vue-next';
import { employeeService } from '@/services/employeeService';

const searchQuery = ref('');
const activeActionId = ref(null);
const rawEmployees = ref([]);

const getInitials = (first, last) => {
  return `${(first?.[0] || 'E')}${(last?.[0] || '')}`.toUpperCase();
};

onMounted(async () => {
  try {
    const res = await employeeService.getEmployees({ status: 'Inactive', limit: 20 });
    rawEmployees.value = res.data || [];
  } catch (err) {
    console.warn('Error loading inactive employees:', err);
  }
});

const filteredEmployees = computed(() =>
  rawEmployees.value.filter(emp => {
    const q = searchQuery.value.toLowerCase().trim();
    if (!q) return true;
    const name = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    const id = String(emp.employeeId || emp.id).toLowerCase();
    const dept = (emp.department || '').toLowerCase();
    return name.includes(q) || id.includes(q) || dept.includes(q);
  })
);
</script>

<style scoped>
/* ─── Card Shell ──────────────────────────────────────── */
.audit-card {
  background: rgba(255,255,255,0.88);
  border: 1px solid rgba(226,232,240,0.7);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8);
  margin-bottom: 24px;
}
:global(.dark) .audit-card {
  background: rgba(21,28,44,0.88);
  border-color: rgba(255,255,255,0.07);
  box-shadow: 0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04);
}

/* ─── Header ──────────────────────────────────────────── */
.audit-card__header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}
@media (min-width: 768px) {
  .audit-card__header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.audit-card__title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}
:global(.dark) .audit-card__title { color: #f8fafc; }

.audit-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(244, 63, 94, 0.1);
  color: #e11d48;
  border: 1px solid rgba(244, 63, 94, 0.2);
}
:global(.dark) .audit-badge {
  background: rgba(244, 63, 94, 0.18);
  color: #fb7185;
  border-color: rgba(244, 63, 94, 0.3);
}

.audit-card__sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

/* Search */
.search-wrap {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 13px;
  height: 13px;
  color: #94a3b8;
  pointer-events: none;
}
.search-input {
  width: 200px;
  height: 36px;
  padding: 0 12px 0 30px;
  background: rgba(248,250,252,0.9);
  border: 1px solid rgba(226,232,240,0.7);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  transition: border-color 200ms, box-shadow 200ms, width 300ms cubic-bezier(0.4,0,0.2,1);
}
.search-input::placeholder { color: #94a3b8; }
.search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  width: 220px;
}
:global(.dark) .search-input {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.08);
  color: #f1f5f9;
}
:global(.dark) .search-input:focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 3px rgba(129,140,248,0.12);
}

/* ─── Table ───────────────────────────────────────────── */
.table-wrap {
  overflow-x: auto;
  border-radius: 14px;
  border: 1px solid rgba(241,245,249,0.8);
}
:global(.dark) .table-wrap { border-color: rgba(255,255,255,0.06); }

.audit-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

.audit-table__head tr th {
  padding: 11px 16px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #94a3b8;
  background: rgba(248,250,252,0.9);
  border-bottom: 1px solid rgba(241,245,249,0.8);
  text-align: left;
}
:global(.dark) .audit-table__head tr th {
  background: rgba(255,255,255,0.03);
  border-bottom-color: rgba(255,255,255,0.05);
}

.audit-row {
  border-bottom: 1px solid rgba(241,245,249,0.6);
  transition: background 150ms ease;
}
.audit-row:hover { background: rgba(248,250,252,0.7); }
:global(.dark) .audit-row { border-bottom-color: rgba(255,255,255,0.03); }
:global(.dark) .audit-row:hover { background: rgba(255,255,255,0.025); }

.audit-cell {
  padding: 12px 16px;
  font-size: 12px;
  vertical-align: middle;
}

/* Employee cell */
.employee-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.employee-avatar-initial {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.employee-name {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}
:global(.dark) .employee-name { color: #f1f5f9; }
.employee-email {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 1px;
}

/* Status badges */
.status-badge {
  display: inline-block;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 7px;
  border-radius: 6px;
}
.status-badge--suspended {
  background: rgba(244,63,94,0.1);
  color: #e11d48;
}
:global(.dark) .status-badge--suspended {
  background: rgba(244,63,94,0.18);
  color: #fb7185;
}

/* Action dropdown */
.action-wrap {
  position: relative;
  display: inline-block;
}
.action-trigger {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(226,232,240,0.8);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 150ms ease;
}
.action-trigger:hover {
  background: rgba(241,245,249,0.8);
  color: #0f172a;
  border-color: #cbd5e1;
}
:global(.dark) .action-trigger { border-color: rgba(255,255,255,0.08); }
:global(.dark) .action-trigger:hover {
  background: rgba(255,255,255,0.06);
  color: #f8fafc;
}

.action-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 30;
  min-width: 155px;
  background: #ffffff;
  border: 1px solid rgba(226,232,240,0.8);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
:global(.dark) .action-dropdown {
  background: #1e293b;
  border-color: rgba(255,255,255,0.08);
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
}

.action-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #334155;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 120ms;
}
.action-item:hover { background: #f1f5f9; color: #0f172a; }
:global(.dark) .action-item { color: #cbd5e1; }
:global(.dark) .action-item:hover { background: rgba(255,255,255,0.06); color: #f8fafc; }
</style>
