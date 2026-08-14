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
        <!-- Tab pills -->
        <div
          ref="tabGroupEl"
          class="tab-pill-group"
        >
          <div
            class="tab-pill-indicator"
            :style="indicatorStyle"
          />
          <button
            v-for="(tab, idx) in filterTabs"
            :key="tab.days"
            :ref="el => { if(el) tabEls[idx] = el }"
            class="tab-pill"
            :class="{ 'tab-pill--active': activeTab === tab.days }"
            @click="setTab(tab.days, idx)"
          >
            {{ tab.label }}
            <span
              class="tab-count"
              :class="activeTab === tab.days ? 'tab-count--active' : ''"
            >{{ tab.count }}</span>
          </button>
        </div>

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
            <th>Days Inactive</th>
            <th>Assigned Card</th>
            <th>Status</th>
            <th class="text-right">
              Action
            </th>
          </tr>
        </thead>
        <TransitionGroup
          name="table-row"
          tag="tbody"
          class="audit-table__body"
        >
          <tr
            v-for="(emp, idx) in filteredEmployees"
            :key="emp.id"
            class="audit-row"
            :style="{ '--row-delay': `${idx * 40}ms` }"
          >
            <!-- Employee -->
            <td class="audit-cell audit-cell--employee">
              <img
                :src="emp.avatar"
                :alt="emp.name"
                class="audit-avatar"
              >
              <span class="audit-cell__name">{{ emp.name }}</span>
            </td>
            <!-- ID -->
            <td class="audit-cell">
              <span class="audit-cell__mono">{{ emp.empId }}</span>
            </td>
            <!-- Department -->
            <td class="audit-cell">
              <span class="audit-cell__dept">{{ emp.department }}</span>
            </td>
            <!-- Designation -->
            <td class="audit-cell audit-cell--muted">
              {{ emp.designation }}
            </td>
            <!-- Last Access -->
            <td class="audit-cell audit-cell--semi">
              {{ emp.lastAccess }}
            </td>
            <!-- Days Inactive -->
            <td class="audit-cell">
              <span
                class="days-badge"
                :class="daysClass(emp.daysInactive)"
              >
                <Clock class="w-3 h-3" />
                {{ emp.daysInactive }} days
              </span>
            </td>
            <!-- Card -->
            <td class="audit-cell">
              <span class="audit-cell__mono audit-cell--muted">{{ emp.assignedCard }}</span>
            </td>
            <!-- Status -->
            <td class="audit-cell">
              <span
                class="status-pill"
                :class="emp.status === 'Active' ? 'status-pill--active' : 'status-pill--suspended'"
              >
                {{ emp.status }}
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
                    <button
                      class="action-item"
                      @click="activeActionId = null"
                    >
                      <Mail class="w-3.5 h-3.5 text-emerald-500" /> Send Reminder
                    </button>
                    <div class="action-divider" />
                    <button
                      class="action-item action-item--danger"
                      @click="activeActionId = null"
                    >
                      <ShieldOff class="w-3.5 h-3.5" /> Revoke Access
                    </button>
                  </div>
                </Transition>
              </div>
            </td>
          </tr>
        </TransitionGroup>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import { Search, Clock, MoreHorizontal, User, History, Mail, ShieldOff } from 'lucide-vue-next';

const activeTab = ref(15);
const searchQuery = ref('');
const activeActionId = ref(null);
const tabEls = ref([]);
const indicatorStyle = ref({ width: '0px', left: '0px' });

const filterTabs = [
  { days: 7, label: '7+ Days', count: 18 },
  { days: 15, label: '15+ Days', count: 12 },
  { days: 30, label: '30+ Days', count: 7 },
  { days: 60, label: '60+ Days', count: 3 },
];

const setTab = (days, idx) => {
  activeTab.value = days;
  updateIndicator(idx);
};

const updateIndicator = (idx) => {
  const el = tabEls.value[idx];
  if (!el) return;
  indicatorStyle.value = { width: `${el.offsetWidth}px`, left: `${el.offsetLeft}px` };
};

onMounted(async () => {
  await nextTick();
  const initIdx = filterTabs.findIndex(t => t.days === activeTab.value);
  updateIndicator(initIdx >= 0 ? initIdx : 0);
});

const daysClass = (days) => {
  if (days >= 30) return 'days-badge--critical';
  if (days >= 15) return 'days-badge--warning';
  return 'days-badge--mild';
};

const rawEmployees = ref([
  { id: 1, name: 'John Mathew', empId: 'EMP-1024', department: 'Security Operations', designation: 'Senior Guard', lastAccess: 'Jul 28, 2026', daysInactive: 16, assignedCard: 'Card-8421', status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120' },
  { id: 2, name: 'Sanjay Reddy', empId: 'EMP-1108', department: 'Facilities Management', designation: 'HVAC Engineer', lastAccess: 'Jul 14, 2026', daysInactive: 30, assignedCard: 'Card-9012', status: 'Active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120' },
  { id: 3, name: 'Meera Deshmukh', empId: 'EMP-0982', department: 'Human Resources', designation: 'Recruiter', lastAccess: 'Aug 04, 2026', daysInactive: 9, assignedCard: 'Card-7114', status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120' },
  { id: 4, name: 'David Miller', empId: 'EMP-0840', department: 'IT Infrastructure', designation: 'Network Specialist', lastAccess: 'Jun 12, 2026', daysInactive: 62, assignedCard: 'Card-5501', status: 'Suspended', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120' },
  { id: 5, name: 'Kavita Joshi', empId: 'EMP-1210', department: 'Administration', designation: 'Office Admin', lastAccess: 'Jul 25, 2026', daysInactive: 19, assignedCard: 'Card-6380', status: 'Active', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120' },
]);

const filteredEmployees = computed(() =>
  rawEmployees.value.filter(emp => {
    const matchesDays = emp.daysInactive >= activeTab.value;
    const q = searchQuery.value.toLowerCase();
    const matchesQuery = !q || emp.name.toLowerCase().includes(q) || emp.empId.toLowerCase().includes(q) || emp.department.toLowerCase().includes(q);
    return matchesDays && matchesQuery;
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
@media (min-width: 1024px) {
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
  flex-wrap: wrap;
}
:global(.dark) .audit-card__title { color: #f8fafc; }

.audit-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.08));
  color: #b45309;
  border: 1px solid rgba(245,158,11,0.2);
}
:global(.dark) .audit-badge {
  background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1));
  color: #fbbf24;
  border-color: rgba(245,158,11,0.25);
}

.audit-card__sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 3px;
}

/* ─── Controls ────────────────────────────────────────── */
.audit-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

/* Tabs */
.tab-pill-group {
  position: relative;
  display: flex;
  align-items: center;
  padding: 4px;
  background: rgba(241,245,249,0.9);
  border: 1px solid rgba(226,232,240,0.6);
  border-radius: 12px;
}
:global(.dark) .tab-pill-group {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.06);
}

.tab-pill-indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  border-radius: 8px;
  background: white;
  border: 1px solid rgba(226,232,240,0.5);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: left 300ms cubic-bezier(0.34, 1.2, 0.64, 1),
              width 300ms cubic-bezier(0.34, 1.2, 0.64, 1);
  pointer-events: none;
}
:global(.dark) .tab-pill-indicator {
  background: rgba(30,40,60,0.95);
  border-color: rgba(255,255,255,0.08);
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

.tab-pill {
  position: relative;
  z-index: 1;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #94a3b8;
  transition: color 200ms;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}
.tab-pill--active { color: #6366f1; }
:global(.dark) .tab-pill { color: #64748b; }
:global(.dark) .tab-pill--active { color: #818cf8; }

.tab-count {
  font-size: 10px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 999px;
  background: rgba(148,163,184,0.15);
  color: #94a3b8;
  transition: background 200ms, color 200ms;
}
.tab-count--active {
  background: rgba(99,102,241,0.12);
  color: #6366f1;
}
:global(.dark) .tab-count--active {
  background: rgba(129,140,248,0.15);
  color: #818cf8;
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
  background: rgba(255,255,255,0.025);
  border-bottom-color: rgba(255,255,255,0.05);
  color: #64748b;
}

.audit-table__body tr + tr { border-top: 1px solid rgba(241,245,249,0.8); }
:global(.dark) .audit-table__body tr + tr { border-top-color: rgba(255,255,255,0.04); }

/* Row */
.audit-row {
  transition: background 200ms;
  animation: rowFadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--row-delay, 0ms);
}
.audit-row:hover { background: rgba(248,250,252,0.9); }
:global(.dark) .audit-row:hover { background: rgba(255,255,255,0.03); }

@keyframes rowFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Cells */
.audit-cell {
  padding: 13px 16px;
  font-size: 12px;
  vertical-align: middle;
}
.audit-cell--employee {
  display: flex;
  align-items: center;
  gap: 10px;
}
.audit-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(226,232,240,0.6);
  flex-shrink: 0;
  transition: box-shadow 250ms;
}
.audit-row:hover .audit-avatar {
  box-shadow: 0 0 0 2px rgba(99,102,241,0.3);
}
.audit-cell__name {
  font-weight: 700;
  color: #0f172a;
}
:global(.dark) .audit-cell__name { color: #f1f5f9; }
.audit-cell__mono {
  font-family: ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  color: #64748b;
}
.audit-cell__dept {
  font-weight: 600;
  color: #334155;
}
:global(.dark) .audit-cell__dept { color: #cbd5e1; }
.audit-cell--muted { color: #94a3b8; font-weight: 500; }
.audit-cell--semi { color: #475569; font-weight: 600; }
:global(.dark) .audit-cell--semi { color: #94a3b8; }

/* Days badge */
.days-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}
.days-badge--critical {
  background: linear-gradient(135deg, rgba(244,63,94,0.12), rgba(225,29,72,0.08));
  color: #e11d48;
  border: 1px solid rgba(244,63,94,0.2);
}
.days-badge--warning {
  background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.08));
  color: #d97706;
  border: 1px solid rgba(245,158,11,0.2);
}
.days-badge--mild {
  background: rgba(148,163,184,0.1);
  color: #64748b;
  border: 1px solid rgba(148,163,184,0.15);
}
:global(.dark) .days-badge--critical { background: rgba(244,63,94,0.15); color: #fb7185; border-color: rgba(244,63,94,0.25); }
:global(.dark) .days-badge--warning { background: rgba(245,158,11,0.15); color: #fbbf24; border-color: rgba(245,158,11,0.25); }
:global(.dark) .days-badge--mild { background: rgba(255,255,255,0.06); color: #94a3b8; border-color: rgba(255,255,255,0.08); }

/* Status pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 999px;
}
.status-pill--active {
  background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08));
  color: #059669;
  border: 1px solid rgba(16,185,129,0.2);
}
.status-pill--suspended {
  background: rgba(148,163,184,0.1);
  color: #64748b;
  border: 1px solid rgba(148,163,184,0.15);
}
:global(.dark) .status-pill--active { background: rgba(16,185,129,0.15); color: #34d399; border-color: rgba(16,185,129,0.25); }
:global(.dark) .status-pill--suspended { background: rgba(255,255,255,0.06); color: #94a3b8; border-color: rgba(255,255,255,0.08); }

/* Action dropdown */
.action-wrap { position: relative; display: inline-block; }
.action-trigger {
  padding: 6px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #94a3b8;
  transition: background 200ms, color 200ms, transform 300ms cubic-bezier(0.34,1.56,0.64,1);
}
.action-trigger:hover { background: rgba(241,245,249,0.9); color: #475569; transform: scale(1.1); }
:global(.dark) .action-trigger:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }

.action-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  width: 168px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(226,232,240,0.6);
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06);
  padding: 6px;
  z-index: 100;
}
:global(.dark) .action-dropdown {
  background: rgba(18,25,42,0.96);
  border-color: rgba(255,255,255,0.08);
  box-shadow: 0 8px 30px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2);
}

.action-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  text-align: left;
  transition: background 150ms;
}
.action-item:hover { background: rgba(241,245,249,0.9); }
:global(.dark) .action-item { color: #e2e8f0; }
:global(.dark) .action-item:hover { background: rgba(255,255,255,0.06); }
.action-item--danger { color: #e11d48; }
.action-item--danger:hover { background: rgba(244,63,94,0.07); }
:global(.dark) .action-item--danger { color: #fb7185; }
:global(.dark) .action-item--danger:hover { background: rgba(244,63,94,0.1); }

.action-divider {
  height: 1px;
  background: rgba(226,232,240,0.6);
  margin: 4px 0;
}
:global(.dark) .action-divider { background: rgba(255,255,255,0.06); }

/* Dropdown transition */
.dropdown-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: top right;
}
.dropdown-enter-from {
  opacity: 0;
  transform: scale(0.88) translateY(-8px);
}
.dropdown-leave-active {
  transition: all 0.15s ease;
  transform-origin: top right;
}
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.94) translateY(-4px);
}

/* Table row transitions */
.table-row-enter-active { transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
.table-row-enter-from { opacity: 0; transform: translateY(10px); }
.table-row-leave-active { transition: all 0.2s ease; }
.table-row-leave-to { opacity: 0; transform: translateX(-10px); }

/* ─── Reduced Motion ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .audit-row { animation: none; }
  .dropdown-enter-active, .dropdown-leave-active { transition: opacity 150ms; }
  .dropdown-enter-from, .dropdown-leave-to { transform: none; }
  .tab-pill-indicator { transition: none; }
  .search-input:focus { width: 200px; }
}
</style>
