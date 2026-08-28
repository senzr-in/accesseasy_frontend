<template>
  <div class="employee-directory-root h-full flex flex-col bg-[#F8FAFC] text-[#0F172A] p-4 sm:p-6 space-y-4 overflow-hidden">
    <!-- 1. Compact Page Header with Integrated Summary & Add Action -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            Employees
          </h1>
          <!-- Compact Inline Summary Counter Pills -->
          <div class="hidden md:flex items-center gap-2 text-xs font-semibold">
            <span class="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
              {{ totalItems.toLocaleString() }} Total
            </span>
            <span class="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
              {{ activeCount.toLocaleString() }} Active
            </span>
            <span v-if="inactiveCount > 0" class="px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
              {{ inactiveCount.toLocaleString() }} Inactive
            </span>
            <span v-if="pendingCount > 0" class="px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
              {{ pendingCount.toLocaleString() }} Pending
            </span>
          </div>
        </div>
        <p class="text-xs text-[#64748B] mt-0.5">
          Manage workforce profiles, biometric credentials and access permissions
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="h-9 px-3.5 bg-[#0F172A] text-white hover:bg-[#1E293B] active:bg-[#020617] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          @click="handleCreateEmployee"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add Employee</span>
        </button>
      </div>
    </div>

    <!-- 2. Compact Toolbar: Search, Filters, Import, Export / Bulk Bar -->
    <div class="shrink-0 space-y-2">
      <!-- Normal Toolbar -->
      <div v-if="selectedEmployeeIds.length === 0" class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <!-- Search Bar -->
        <div class="relative w-full sm:w-80 lg:w-96">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-3.5 h-3.5" />
          <input
            v-model="search"
            type="search"
            placeholder="Search employees, ID, department or role..."
            class="w-full pl-9 pr-3.5 h-9 text-xs bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-[#0F172A] placeholder:text-[#94A3B8] shadow-2xs transition-all"
            @input="debouncedSearch"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            class="h-9 px-3.5 bg-[#0F172A] text-white hover:bg-[#1E293B] active:bg-[#020617] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            @click="handleCreateEmployee"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add Employee</span>
          </button>

          <!-- Filter Button -->
          <button
            class="h-9 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            :class="[
              hasActiveFilters || isFilterDrawerOpen
                ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]'
                : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]'
            ]"
            @click="isFilterDrawerOpen = true"
          >
            <Filter class="w-3.5 h-3.5" />
            <span>Filter</span>
            <span
              v-if="hasActiveFilters"
              class="w-1.5 h-1.5 rounded-full bg-[#2563EB]"
            />
          </button>

          <!-- Import Button -->
          <button
            class="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#334155] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            @click="isImportModalOpen = true"
          >
            <FileUp class="w-3.5 h-3.5 text-[#64748B]" />
            <span>Import</span>
          </button>

          <!-- Export Button -->
          <button
            class="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#334155] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            @click="isExportModalOpen = true"
          >
            <FileDown class="w-3.5 h-3.5 text-[#64748B]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <!-- Bulk Selection Toolbar (When 1+ checkboxes selected) -->
      <div
        v-else
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3.5 py-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl shadow-2xs animate-in fade-in duration-100"
      >
        <div class="flex items-center gap-2.5 text-xs font-bold text-[#1E40AF]">
          <span>{{ selectedEmployeeIds.length }} selected</span>
          <button
            v-if="selectedEmployeeIds.length < totalItems"
            class="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
            @click="selectAllTenantEmployees"
          >
            Select all {{ totalItems }}
          </button>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            class="h-7.5 px-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            @click="openBulkAssignModal"
          >
            <ShieldCheck class="w-3 h-3" />
            <span>Assign Access</span>
          </button>

          <button
            class="h-7.5 px-2.5 bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#334155] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            @click="exportSelectedEmployees"
          >
            <FileDown class="w-3 h-3" />
            <span>Export</span>
          </button>

          <button
            class="h-7.5 px-2.5 bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] text-[#DC2626] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            @click="bulkDeleteEmployees"
          >
            <Trash2 class="w-3 h-3" />
            <span>Delete</span>
          </button>

          <button
            class="h-7.5 px-2.5 bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            @click="selectedEmployeeIds = []"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Active Filter Chips Bar -->
      <div v-if="hasActiveFilters" class="flex items-center gap-1.5 flex-wrap">
        <span class="text-[11px] font-semibold text-[#64748B]">Active:</span>

        <span
          v-if="filters.department"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A] shadow-2xs"
        >
          Dept: {{ getDepartmentName(filters.department) }}
          <X class="w-3 h-3 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer" @click="filters.department = ''; applyFilters();" />
        </span>

        <span
          v-if="filters.status"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A] shadow-2xs"
        >
          Status: {{ filters.status }}
          <X class="w-3 h-3 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer" @click="filters.status = ''; applyFilters();" />
        </span>

        <span
          v-if="filters.role"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A] shadow-2xs"
        >
          Role: {{ filters.role }}
          <X class="w-3 h-3 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer" @click="filters.role = ''; applyFilters();" />
        </span>

        <span
          v-if="filters.accessLevel"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A] shadow-2xs"
        >
          Access: {{ getAccessLevelName(filters.accessLevel) }}
          <X class="w-3 h-3 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer" @click="filters.accessLevel = ''; applyFilters();" />
        </span>

        <button
          class="text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer ml-1"
          @click="clearAllFilters"
        >
          Clear all
        </button>
      </div>
    </div>

    <!-- 3. Main Employee Data Table Card (Fills Available Height Cleanly) -->
    <div class="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-2xs overflow-hidden flex flex-col flex-1 min-h-0">
      <div class="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
        <table class="w-full text-left border-collapse">
          <thead class="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
            <tr>
              <th class="py-2.5 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  :checked="isSelectAll"
                  class="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-0 cursor-pointer"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="py-2.5 px-3.5 font-bold">EMPLOYEE</th>
              <th class="py-2.5 px-3.5 font-bold">DEPARTMENT</th>
              <th class="py-2.5 px-3.5 font-bold">ROLE</th>
              <th class="py-2.5 px-3.5 font-bold">BIOMETRICS</th>
              <th class="py-2.5 px-3.5 font-bold">ACCESS</th>
              <th class="py-2.5 px-3.5 font-bold">STATUS</th>
              <th class="py-2.5 px-3.5 font-bold text-right">ACTIONS</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-[#F1F5F9] text-xs">
            <!-- Loading Skeletons State -->
            <tr v-if="loading" v-for="i in 8" :key="'skel-' + i" class="animate-pulse">
              <td class="py-3 px-3.5 text-center">
                <div class="w-3.5 h-3.5 bg-[#F1F5F9] rounded mx-auto" />
              </td>
              <td class="py-3 px-3.5">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-[#F1F5F9] shrink-0" />
                  <div class="space-y-1 flex-1">
                    <div class="h-3 bg-[#F1F5F9] rounded w-24" />
                    <div class="h-2 bg-[#F1F5F9] rounded w-32" />
                  </div>
                </div>
              </td>
              <td class="py-3 px-3.5"><div class="h-2.5 bg-[#F1F5F9] rounded w-16" /></td>
              <td class="py-3 px-3.5"><div class="h-2.5 bg-[#F1F5F9] rounded w-14" /></td>
              <td class="py-3 px-3.5"><div class="h-3 bg-[#F1F5F9] rounded w-20" /></td>
              <td class="py-3 px-3.5"><div class="h-2.5 bg-[#F1F5F9] rounded w-16" /></td>
              <td class="py-3 px-3.5"><div class="h-2.5 bg-[#F1F5F9] rounded w-12" /></td>
              <td class="py-3 px-3.5 text-right"><div class="h-3 bg-[#F1F5F9] rounded w-5 ml-auto" /></td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="items.length === 0">
              <td colspan="8" class="py-12 px-4 text-center">
                <div class="max-w-xs mx-auto space-y-1.5">
                  <UserX class="w-7 h-7 text-[#94A3B8] mx-auto" />
                  <h3 class="text-xs font-semibold text-[#0F172A]">No employees found</h3>
                  <p class="text-[11px] text-[#64748B]">
                    {{ search || hasActiveFilters ? 'Try adjusting your search or active filters.' : 'Your workforce directory is empty.' }}
                  </p>
                  <div class="pt-1.5 flex items-center justify-center gap-2">
                    <button
                      v-if="search || hasActiveFilters"
                      class="px-2.5 py-1 bg-[#FFFFFF] border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg text-xs font-semibold text-[#334155] cursor-pointer"
                      @click="clearAllFilters"
                    >
                      Clear Filters
                    </button>
                    <button
                      v-if="isAdmin"
                      class="px-2.5 py-1 bg-[#0F172A] text-white hover:bg-[#1E293B] rounded-lg text-xs font-semibold cursor-pointer"
                      @click="handleCreateEmployee"
                    >
                      + Add Employee
                    </button>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-for="emp in items"
              v-else
              :key="emp.id"
              class="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
              @click="openProfile(emp)"
            >
              <!-- Checkbox -->
              <td class="py-2.5 px-3.5 text-center" @click.stop>
                <input
                  v-model="selectedEmployeeIds"
                  type="checkbox"
                  :value="emp.id"
                  class="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-0 cursor-pointer"
                />
              </td>

              <!-- Employee Identity Cell -->
              <td class="py-2.5 px-3.5">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-xs flex items-center justify-center shrink-0 border border-[#DBEAFE]">
                    {{ getInitials(emp.assignedUser?.first_name, emp.assignedUser?.last_name) }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-semibold text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors">
                      {{ getFullName(emp) }}
                    </p>
                    <p class="text-[10px] text-[#64748B] truncate mt-0.5">
                      {{ emp.assignedUser?.email || emp.assignedUser?.phone || 'No Contact' }}
                      <span class="text-[#CBD5E1] mx-0.5">&bull;</span>
                      <span class="font-mono text-[#94A3B8]">{{ emp.employeeId || `EMP-${emp.id?.slice(0, 6)}` }}</span>
                    </p>
                  </div>
                </div>
              </td>

              <!-- Department -->
              <td class="py-2.5 px-3.5 font-medium text-[#0F172A]">
                <p class="truncate text-xs">{{ emp.department?.departmentName || 'Operations' }}</p>
              </td>

              <!-- Role -->
              <td class="py-2.5 px-3.5">
                <span
                  v-if="isSuperRole(emp)"
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]"
                >
                  {{ getRoleName(emp) }}
                </span>
                <span v-else class="text-[#475569] text-xs">
                  {{ getRoleName(emp) }}
                </span>
              </td>

              <!-- Biometrics & Credentials Icon Group -->
              <td class="py-2.5 px-3.5" @click.stop="openProfileWithTab(emp, 'biometrics')">
                <div class="flex items-center gap-1">
                  <!-- Face Recognition -->
                  <div
                    class="p-1 rounded-md border text-xs flex items-center justify-center transition-all cursor-pointer"
                    :title="hasFace(emp) ? 'Face Recognition: Enrolled' : 'Face Recognition: Not Configured'"
                    :class="hasFace(emp) ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]'"
                  >
                    <ScanFace class="w-3 h-3" />
                  </div>

                  <!-- Fingerprint -->
                  <div
                    class="p-1 rounded-md border text-xs flex items-center justify-center transition-all cursor-pointer"
                    :title="hasFinger(emp.id) ? 'Fingerprint: Synchronized' : 'Fingerprint: Missing'"
                    :class="hasFinger(emp.id) ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]'"
                  >
                    <Fingerprint class="w-3 h-3" />
                  </div>

                  <!-- RFID Card -->
                  <div
                    class="p-1 rounded-md border text-xs flex items-center justify-center transition-all cursor-pointer"
                    :title="hasRfid(emp.id) ? 'RFID Card: Active' : 'RFID Card: Not Assigned'"
                    :class="hasRfid(emp.id) ? 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]' : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]'"
                  >
                    <CreditCard class="w-3 h-3" />
                  </div>

                  <!-- Mobile Pass -->
                  <div
                    class="p-1 rounded-md border text-xs flex items-center justify-center transition-all cursor-pointer"
                    :title="emp.assignedUser?.phone ? 'Mobile Access: Enabled' : 'Mobile Access: No Phone'"
                    :class="emp.assignedUser?.phone ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]' : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]'"
                  >
                    <Smartphone class="w-3 h-3" />
                  </div>
                </div>
              </td>

              <!-- Access Level -->
              <td class="py-2.5 px-3.5 font-medium text-[#475569]">
                <p class="truncate max-w-[130px] text-xs" :title="getEmployeeAccessName(emp)">
                  {{ getEmployeeAccessName(emp) }}
                </p>
              </td>

              <!-- Status Indicator -->
              <td class="py-2.5 px-3.5">
                <div class="inline-flex items-center gap-1.5 font-medium text-xs">
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="[
                      getStatusLabel(emp.status) === 'Active'
                        ? 'bg-[#10B981]'
                        : getStatusLabel(emp.status) === 'Pending'
                        ? 'bg-[#F59E0B]'
                        : 'bg-[#94A3B8]'
                    ]"
                  />
                  <span
                    :class="[
                      getStatusLabel(emp.status) === 'Active'
                        ? 'text-[#059669]'
                        : getStatusLabel(emp.status) === 'Pending'
                        ? 'text-[#D97706]'
                        : 'text-[#64748B]'
                    ]"
                  >
                    {{ getStatusLabel(emp.status) }}
                  </span>
                </div>
              </td>

              <!-- Actions -->
              <td class="py-2.5 px-3.5 text-right" @click.stop>
                <div class="relative inline-block text-left">
                  <button
                    class="w-7 h-7 rounded-lg border border-transparent hover:border-[#E2E8F0] hover:bg-[#FFFFFF] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-all cursor-pointer"
                    @click="activeActionMenuId = activeActionMenuId === emp.id ? null : emp.id"
                  >
                    <MoreHorizontal class="w-3.5 h-3.5" />
                  </button>

                  <!-- Popover Dropdown Menu -->
                  <div
                    v-if="activeActionMenuId === emp.id"
                    class="absolute right-0 mt-1 w-44 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-lg py-1 z-30 text-left animate-in fade-in zoom-in-95 duration-100"
                  >
                    <button
                      class="w-full px-3 py-1.5 text-xs text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2 transition-colors cursor-pointer"
                      @click="openProfile(emp); activeActionMenuId = null;"
                    >
                      <User class="w-3.5 h-3.5 text-[#64748B]" />
                      <span>View Profile</span>
                    </button>

                    <button
                      class="w-full px-3 py-1.5 text-xs text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2 transition-colors cursor-pointer"
                      @click="handleEditEmployee(emp); activeActionMenuId = null;"
                    >
                      <Edit3 class="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Edit Employee</span>
                    </button>

                    <button
                      class="w-full px-3 py-1.5 text-xs text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2 transition-colors cursor-pointer"
                      @click="openProfileWithTab(emp, 'access'); activeActionMenuId = null;"
                    >
                      <Shield class="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Access Permissions</span>
                    </button>

                    <button
                      class="w-full px-3 py-1.5 text-xs text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2 transition-colors cursor-pointer"
                      @click="openProfileWithTab(emp, 'biometrics'); activeActionMenuId = null;"
                    >
                      <Fingerprint class="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Biometrics</span>
                    </button>

                    <button
                      class="w-full px-3 py-1.5 text-xs text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2 transition-colors cursor-pointer"
                      @click="openProfileWithTab(emp, 'attendance'); activeActionMenuId = null;"
                    >
                      <Calendar class="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Attendance</span>
                    </button>

                    <button
                      class="w-full px-3 py-1.5 text-xs text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2 transition-colors cursor-pointer"
                      @click="openProfileWithTab(emp, 'logs'); activeActionMenuId = null;"
                    >
                      <Clock class="w-3.5 h-3.5 text-[#64748B]" />
                      <span>View Logs</span>
                    </button>

                    <div class="my-1 border-t border-[#F1F5F9]" />

                    <button
                      v-if="isAdmin"
                      class="w-full px-3 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2 transition-colors cursor-pointer"
                      @click="confirmDelete(emp); activeActionMenuId = null;"
                    >
                      <Trash2 class="w-3.5 h-3.5 text-[#DC2626]" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 4. Compact Pagination Footer -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-3.5 py-2.5 border-t border-[#E2E8F0] bg-[#FFFFFF] text-xs text-[#64748B] shrink-0">
        <div>
          Showing <span class="font-semibold text-[#0F172A]">{{ paginationStart }}–{{ paginationEnd }}</span> of <span class="font-semibold text-[#0F172A]">{{ totalItems.toLocaleString() }}</span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Rows per page -->
          <div class="flex items-center gap-1.5">
            <span class="text-[11px] text-[#64748B]">Per page:</span>
            <select
              v-model="itemsPerPage"
              class="h-7 px-1.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
              @change="page = 1; fetchEmployeeData();"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>

          <!-- Page Controls -->
          <div class="flex items-center gap-1">
            <button
              class="h-7 px-2 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold text-[#334155] cursor-pointer"
              :disabled="page <= 1 || loading"
              @click="page--"
            >
              &lsaquo; Prev
            </button>

            <span class="px-1.5 font-semibold text-[#0F172A] text-xs">
              {{ page }} / {{ totalPages || 1 }}
            </span>

            <button
              class="h-7 px-2 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-semibold text-[#334155] cursor-pointer"
              :disabled="page >= totalPages || loading"
              @click="page++"
            >
              Next &rsaquo;
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Advanced Filter Slide-over Drawer -->
    <Teleport to="body">
      <div
        v-if="isFilterDrawerOpen"
        class="fixed inset-0 z-50 overflow-hidden bg-black/25 transition-opacity"
        @click.self="isFilterDrawerOpen = false"
      >
        <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div class="w-screen max-w-sm bg-[#FFFFFF] border-l border-[#E2E8F0] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <!-- Header -->
            <div class="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-[#0F172A]">Filter Employees</h3>
                <p class="text-xs text-[#64748B] mt-0.5">Refine workforce directory view</p>
              </div>
              <button
                class="w-7 h-7 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                @click="isFilterDrawerOpen = false"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Filter Fields -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              <!-- Department -->
              <div>
                <label class="block font-semibold text-[#334155] mb-1">Department</label>
                <select
                  v-model="filters.department"
                  class="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="">All Departments</option>
                  <option v-for="d in availableDepartments" :key="d.id" :value="d.id">
                    {{ d.departmentName || d.name }}
                  </option>
                </select>
              </div>

              <!-- Role -->
              <div>
                <label class="block font-semibold text-[#334155] mb-1">Role</label>
                <select
                  v-model="filters.role"
                  class="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="">All Roles</option>
                  <option v-for="r in availableRoles" :key="r.id" :value="r.roleName || r.name">
                    {{ r.roleName || r.name }}
                  </option>
                </select>
              </div>

              <!-- Status -->
              <div>
                <label class="block font-semibold text-[#334155] mb-1">Status</label>
                <select
                  v-model="filters.status"
                  class="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <!-- Access Level -->
              <div>
                <label class="block font-semibold text-[#334155] mb-1">Access Level</label>
                <select
                  v-model="filters.accessLevel"
                  class="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="">All Access Levels</option>
                  <option v-for="al in availableAccessLevels" :key="al.id" :value="al.id">
                    {{ al.groupName || al.name || al.title || al.accessLevelName }}
                  </option>
                </select>
              </div>

              <!-- Biometric Enrollment -->
              <div>
                <label class="block font-semibold text-[#334155] mb-1">Biometrics</label>
                <select
                  v-model="filters.biometric"
                  class="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="">All</option>
                  <option value="face">Face Registered</option>
                  <option value="finger">Fingerprint Registered</option>
                  <option value="missing">Missing Biometrics</option>
                </select>
              </div>

              <!-- Credential -->
              <div>
                <label class="block font-semibold text-[#334155] mb-1">Credential</label>
                <select
                  v-model="filters.credential"
                  class="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="">All</option>
                  <option value="rfid">RFID Card Assigned</option>
                  <option value="mobile">Mobile Pass Enabled</option>
                </select>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-end gap-2">
              <button
                class="px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:bg-[#FFFFFF] rounded-xl transition-colors cursor-pointer"
                @click="clearAllFilters"
              >
                Clear
              </button>
              <button
                class="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-xl transition-colors cursor-pointer shadow-2xs"
                @click="applyFilters(); isFilterDrawerOpen = false;"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 6. Employee Profile Slide-over Drawer -->
    <EmployeeProfileDrawer
      :is-open="isProfileDrawerOpen"
      :employee="selectedProfileEmployee"
      :initial-tab="profileInitialTab"
      @update:is-open="isProfileDrawerOpen = $event"
      @edit="handleEditEmployee"
      @delete="confirmDelete"
      @close="selectedProfileEmployee = null"
    />

    <!-- 7. Add/Edit Employee Dialog -->
    <AddEmployeeDialog
      v-model="showAddDialog"
      :employee="selectedEmployee"
      @success="fetchEmployeeData"
    />

    <!-- 8. Import Employees Modal -->
    <ImportEmployeesModal
      :is-open="isImportModalOpen"
      @update:is-open="isImportModalOpen = $event"
      @success="fetchEmployeeData"
    />

    <!-- 9. Export Employees Dialog -->
    <ExportEmployees
      v-if="isExportModalOpen"
      :selected-ids="selectedEmployeeIds"
      :filters="filters"
      @close="isExportModalOpen = false"
    />

    <!-- 10. Bulk Assign Group & Role Modal -->
    <div
      v-if="showBulkAssignModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 animate-in fade-in duration-100"
      @click.self="showBulkAssignModal = false"
    >
      <div class="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 w-full max-w-md shadow-xl space-y-3.5">
        <div>
          <h3 class="text-sm font-bold text-[#0F172A]">Assign Access Group & Role</h3>
          <p class="text-xs text-[#64748B] mt-0.5">
            Apply batch updates to {{ selectedEmployeeIds.length }} selected employee(s).
          </p>
        </div>

        <div class="space-y-3 text-xs">
          <!-- Access Group -->
          <div>
            <label class="block font-semibold text-[#334155] mb-1">Access Group</label>
            <select
              v-model="bulkAssignForm.accessLevelId"
              class="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="">-- No Change (Keep Existing) --</option>
              <option v-for="al in availableAccessLevels" :key="al.id" :value="al.id">
                {{ al.groupName || al.name || al.title || al.accessLevelName }}
              </option>
            </select>
          </div>

          <!-- User Role -->
          <div>
            <label class="block font-semibold text-[#334155] mb-1">User Role</label>
            <select
              v-model="bulkAssignForm.roleId"
              class="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            >
              <option value="">-- No Change (Keep Existing) --</option>
              <option v-for="r in availableRoles" :key="r.id" :value="r.id">
                {{ r.roleName || r.name || r.title }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2.5 border-t border-[#E2E8F0]">
          <button
            class="px-3.5 py-1.5 text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] rounded-xl transition-colors cursor-pointer"
            @click="showBulkAssignModal = false"
          >
            Cancel
          </button>
          <button
            :disabled="isAssigning"
            class="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            @click="executeBulkAssign"
          >
            <Loader2 v-if="isAssigning" class="w-3.5 h-3.5 animate-spin" />
            Apply Changes
          </button>
        </div>
      </div>
    </div>

    <!-- 11. Delete Confirmation Dialog -->
    <div
      v-if="deleteDialog"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 animate-in fade-in duration-100"
      @click.self="deleteDialog = false"
    >
      <div class="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-3.5">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0 border border-[#FECACA]">
            <Trash2 class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-[#0F172A]">Delete Employee</h3>
            <p class="text-xs text-[#64748B]">This action cannot be undone.</p>
          </div>
        </div>

        <p class="text-xs text-[#475569] leading-relaxed">
          Are you sure you want to permanently remove
          <strong class="text-[#0F172A]">{{ employeeToDelete?.assignedUser?.first_name }} {{ employeeToDelete?.assignedUser?.last_name }}</strong>?
        </p>

        <div class="flex justify-end gap-2 pt-1.5">
          <button
            class="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            @click="deleteDialog = false"
          >
            Cancel
          </button>
          <button
            :disabled="deleting"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            @click="deleteEmployee"
          >
            <Loader2 v-if="deleting" class="w-3.5 h-3.5 animate-spin" />
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Progress Modals for batch operations -->
    <DeleteProgressModal
      :show="deleteProgress.show"
      :title="deleteProgress.title"
      :current="deleteProgress.current"
      :total="deleteProgress.total"
      :status-text="deleteProgress.statusText"
    />

    <DeleteProgressModal
      :show="bulkAssignProgress.show"
      :title="bulkAssignProgress.title"
      :current="bulkAssignProgress.current"
      :total="bulkAssignProgress.total"
      :status-text="bulkAssignProgress.statusText"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, inject, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  Plus, Search, Filter, FileDown, FileUp, Trash2, Edit3, User, UserX,
  MoreHorizontal, Loader2, Fingerprint, ScanFace, CreditCard, Smartphone,
  ShieldCheck, Shield, Calendar, Clock, X
} from "lucide-vue-next";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { mqttService } from "@/services/mqttService";
import DeleteProgressModal from "@/components/common/modals/DeleteProgressModal.vue";
import AddEmployeeDialog from "./addEmployeeDialog.vue";
import ExportEmployees from "./report/exportEmployees.vue";
import ImportEmployeesModal from "@/components/workforce/dashboard/ImportEmployeesModal.vue";
import EmployeeProfileDrawer from "@/components/workforce/dashboard/EmployeeProfileDrawer.vue";

const router = useRouter();
const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();
const userRole = currentUserTenant.getRole();

// Data State
const items = ref([]);
const loading = ref(true);
const search = ref("");
const page = ref(1);
const totalItems = ref(0);
const itemsPerPage = ref(25);

// Inline summary stats counters
const activeCount = ref(0);
const inactiveCount = ref(0);
const pendingCount = ref(0);

// Dialogs & Drawers
const showAddDialog = ref(false);
const selectedEmployee = ref(null);
const deleteDialog = ref(false);
const employeeToDelete = ref(null);
const deleting = ref(false);

const isFilterDrawerOpen = ref(false);
const isImportModalOpen = ref(false);
const isExportModalOpen = ref(false);
const isProfileDrawerOpen = ref(false);
const selectedProfileEmployee = ref(null);
const profileInitialTab = ref('overview');
const activeActionMenuId = ref(null);

const selectedEmployeeIds = ref([]);
const showBulkAssignModal = ref(false);
const isAssigning = ref(false);

const availableAccessLevels = ref([]);
const availableDepartments = ref([]);
const availableRoles = ref([]);

const filters = reactive({
  department: "",
  role: "",
  status: "",
  accessLevel: "",
  biometric: "",
  credential: "",
});

const bulkAssignForm = reactive({
  accessLevelId: "",
  roleId: "",
});

const deleteProgress = reactive({
  show: false,
  title: "Deleting Employees...",
  current: 0,
  total: 0,
  statusText: "",
});

const bulkAssignProgress = reactive({
  show: false,
  title: "Assigning Group & Role...",
  current: 0,
  total: 0,
  statusText: "",
});

const defaultMessageHandler = {
  showSuccess: (m) => console.log(m),
  showError: (m) => console.error(m)
};
const messageHandler = inject('messageHandler', defaultMessageHandler);

// Permissions
const isAdmin = computed(() => userRole === "Admin" || userRole === "Dealer" || authService.getUserRole() === "Admin");

// Pagination Computations
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value) || 1);
const paginationStart = computed(() => totalItems.value === 0 ? 0 : (page.value - 1) * itemsPerPage.value + 1);
const paginationEnd = computed(() => Math.min(page.value * itemsPerPage.value, totalItems.value));

const hasActiveFilters = computed(() => {
  return !!(filters.department || filters.role || filters.status || filters.accessLevel || filters.biometric || filters.credential);
});

const isSelectAll = computed(() => {
  return items.value.length > 0 && selectedEmployeeIds.value.length === items.value.length;
});

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    selectedEmployeeIds.value = items.value.map((emp) => emp.id);
  } else {
    selectedEmployeeIds.value = [];
  }
};

const getInitials = (first, last) => {
  return `${(first?.[0] || 'E')}${(last?.[0] || '')}`.toUpperCase();
};

const getFullName = (emp) => {
  const first = emp.assignedUser?.first_name || '';
  const last = emp.assignedUser?.last_name || '';
  return `${first} ${last}`.trim() || 'Unnamed Employee';
};

const isSuperRole = (emp) => {
  const r = (emp.assignedUser?.role?.name || '').toLowerCase();
  return r.includes('admin') || r.includes('manager');
};

const getRoleName = (emp) => {
  return emp.assignedUser?.role?.name || 'Employee';
};

const getEmployeeAccessName = (emp) => {
  if (!emp) return 'No Access Group';
  const al1 = emp.assignedAccessLevels?.[0]?.accesslevels_id?.accessLevelName;
  if (al1) return al1;
  const al2 = typeof emp.assignedAccessLevel === 'object' ? (emp.assignedAccessLevel?.accessLevelName || emp.assignedAccessLevel?.groupName || emp.assignedAccessLevel?.name) : null;
  if (al2) return al2;
  const rawId = emp.assignedAccessLevel?.id || emp.assignedAccessLevel || emp.assignedAccessLevels?.[0]?.accesslevels_id || emp.assignedAccessLevels?.[0];
  if (rawId !== undefined && rawId !== null && rawId !== '') {
    const idStr = typeof rawId === 'object' ? String(rawId.id || rawId._id || '') : String(rawId);
    const found = availableAccessLevels.value.find(a => String(a.id) === idStr || String(a.accessLevelNumber) === idStr);
    if (found) return found.accessLevelName || found.name || found.groupName || `Group #${found.id}`;
    return `Group #${idStr}`;
  }
  return 'No Access Group';
};

const getStatusLabel = (status) => {
  if (status === 'Pending' || status === 'pending') return 'Pending';
  if (status === false || status === 'false' || status === 'Inactive' || status === 'inactive') return 'Inactive';
  return 'Active';
};

const getDepartmentName = (deptId) => {
  const d = availableDepartments.value.find(item => String(item.id) === String(deptId));
  return d ? (d.departmentName || d.name) : deptId;
};

const getAccessLevelName = (alId) => {
  const al = availableAccessLevels.value.find(item => String(item.id) === String(alId));
  return al ? (al.groupName || al.name || al.accessLevelName) : alId;
};

const openProfile = (emp) => {
  selectedProfileEmployee.value = {
    id: emp.id,
    first_name: emp.assignedUser?.first_name || '',
    last_name: emp.assignedUser?.last_name || '',
    email: emp.assignedUser?.email || '',
    phone: emp.assignedUser?.phone || '',
    department: emp.department?.departmentName || 'Operations',
    designation: getRoleName(emp),
    status: emp.status || 'Active',
    card_number: emp.assignedCards?.[0]?.cardManagement_id?.rfidCard || emp.rfid || null,
    has_face: hasFace(emp),
    has_finger: hasFinger(emp.id)
  };
  profileInitialTab.value = 'overview';
  isProfileDrawerOpen.value = true;
};

const openProfileWithTab = (emp, tabName) => {
  openProfile(emp);
  profileInitialTab.value = tabName;
};

const handleCreateEmployee = () => {
  selectedEmployee.value = null;
  showAddDialog.value = true;
};

const handleEditEmployee = (emp) => {
  selectedEmployee.value = emp;
  showAddDialog.value = true;
};

const confirmDelete = (emp) => {
  employeeToDelete.value = emp;
  deleteDialog.value = true;
};

const clearAllFilters = () => {
  filters.department = "";
  filters.role = "";
  filters.status = "";
  filters.accessLevel = "";
  filters.biometric = "";
  filters.credential = "";
  page.value = 1;
  fetchEmployeeData();
};

const applyFilters = () => {
  page.value = 1;
  fetchEmployeeData();
};

let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchEmployeeData();
  }, 300);
};

// Close actions menu when clicking outside
const handleClickOutside = (e) => {
  if (!e.target.closest('.relative')) {
    activeActionMenuId.value = null;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
  fetchDropdownOptions();
  fetchEmployeeData();
});

watch(page, () => {
  fetchEmployeeData();
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});

// Dropdown options loader (Departments, Access Levels, Roles)
const fetchDropdownOptions = async () => {
  const activeToken = authService.getToken();
  if (!activeToken) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/department?limit=-1`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      availableDepartments.value = data.data || [];
    }
  } catch (e) {
    console.warn("Failed to fetch departments:", e);
  }

  try {
    let res = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevels?limit=-1`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    });
    if (!res.ok) {
      res = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevel?limit=-1`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
    }
    if (res.ok) {
      const data = await res.json();
      availableAccessLevels.value = data.data || [];
    }
  } catch (e) {
    console.warn("Failed to fetch access levels:", e);
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/accesseasyRole?limit=-1`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      availableRoles.value = data.data || [];
    }
  } catch (e) {
    console.warn("Failed to fetch roles:", e);
  }
};

const buildFilterParams = async () => {
  const params = {};
  const activeTenantId = await currentUserTenant.getTenantIdAsync();
  if (activeTenantId) {
    params["filter[assignedUser][tenant][tenantId][_eq]"] = activeTenantId;
  }

  if (search.value) {
    const q = search.value.trim();
    let idx = 0;
    params[`filter[_or][${idx++}][employeeId][_icontains]`] = q;
    params[`filter[_or][${idx++}][assignedUser][first_name][_icontains]`] = q;
    params[`filter[_or][${idx++}][assignedUser][last_name][_icontains]`] = q;
    params[`filter[_or][${idx++}][assignedUser][email][_icontains]`] = q;
    params[`filter[_or][${idx++}][assignedUser][phone][_icontains]`] = q;
  }

  if (filters.department) {
    params["filter[department][id][_eq]"] = filters.department;
  }
  if (filters.status) {
    params["filter[status][_eq]"] = filters.status;
  }
  if (filters.accessLevel) {
    params["filter[assignedAccessLevel][id][_eq]"] = filters.accessLevel;
  }

  return params;
};

const fetchEmployeeData = async () => {
  const activeToken = authService.getToken();
  if (!activeToken) return;

  try {
    loading.value = true;
    const filterParams = await buildFilterParams();

    // 1. Total counts
    const countParams = { "aggregate[count]": "id", ...filterParams };
    const countQs = new URLSearchParams(countParams).toString();
    const countRes = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?${countQs}`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    });
    if (countRes.ok) {
      const countData = await countRes.json();
      totalItems.value = Number(countData?.data?.[0]?.count?.id) || 0;
    }

    // 2. Paginated Data
    const queryParams = new URLSearchParams({
      page: page.value,
      limit: itemsPerPage.value,
      ...filterParams
    });

    const fields = [
      "id",
      "employeeId",
      "status",
      "accessOn",
      "registeredFace",
      "assignedUser.id",
      "assignedUser.first_name",
      "assignedUser.last_name",
      "assignedUser.role.id",
      "assignedUser.role.name",
      "assignedUser.phone",
      "assignedUser.email",
      "department.id",
      "department.departmentName",
      "branch.id",
      "branch.branchName",
      "assignedCards.cardManagement_id.id",
      "assignedCards.cardManagement_id.rfidCard",
      "assignedCards.cardManagement_id.type",
      "assignedCards.cardManagement_id.cardAccess",
      "assignedAccessLevel.id",
      "assignedAccessLevel.accessLevelName",
      "assignedAccessLevel.accessLevelNumber",
      "assignedAccessLevels.accesslevels_id.id",
      "assignedAccessLevels.accesslevels_id.accessLevelName",
      "assignedAccessLevels.accesslevels_id.accessLevelNumber"
    ].map(f => `fields[]=${f}`).join('&');

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?${queryParams.toString()}&${fields}`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    });

    if (res.ok) {
      const data = await res.json();
      items.value = data.data || [];

      // Calculate summary breakdowns
      activeCount.value = items.value.filter(e => getStatusLabel(e.status) === 'Active').length;
      inactiveCount.value = items.value.filter(e => getStatusLabel(e.status) === 'Inactive').length;
      pendingCount.value = items.value.filter(e => getStatusLabel(e.status) === 'Pending').length;

      if (items.value.length > 0) {
        await fetchBiometricAndCredentialStatus(items.value.map(item => item.id));
      }
    } else {
      items.value = [];
    }
  } catch (error) {
    console.error("Failed to fetch employee directory:", error);
    items.value = [];
  } finally {
    loading.value = false;
  }
};

// Biometrics and credentials status maps
const userFingersMap = ref({});
const rfidCardsMap = ref({});

const fetchBiometricAndCredentialStatus = async (employeeIds) => {
  if (!employeeIds || employeeIds.length === 0) return;
  const idString = employeeIds.join(",");
  const activeToken = authService.getToken();

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/userFingers?filter[assignedTo][id][_in]=${idString}&fields=id,assignedTo.id`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      const map = {};
      (data.data || []).forEach(f => {
        const empId = f.assignedTo?.id;
        if (empId) map[empId] = true;
      });
      userFingersMap.value = { ...userFingersMap.value, ...map };
    }
  } catch (err) {
    console.warn("Error fetching userFingers:", err);
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement?filter[employeeId][_in]=${idString}&fields=id,rfidCard,employeeId`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      const map = {};
      (data.data || []).forEach(c => {
        const empId = typeof c.employeeId === 'object' ? c.employeeId?.id : c.employeeId;
        if (empId && c.rfidCard) {
          map[empId] = true;
        }
      });
      rfidCardsMap.value = { ...rfidCardsMap.value, ...map };
    }
  } catch (err) {
    console.warn("Error fetching cardManagement:", err);
  }
};

const hasFinger = (id) => !!userFingersMap.value[id];
const hasFace = (emp) => !!emp.assignedFaceEmbed?.id || (emp.registeredFace && emp.registeredFace.trim() !== "");
const hasRfid = (id) => !!rfidCardsMap.value[id];

// Bulk operations
const openBulkAssignModal = () => {
  showBulkAssignModal.value = true;
  bulkAssignForm.accessLevelId = "";
  bulkAssignForm.roleId = "";
};

const executeBulkAssign = async () => {
  if (!bulkAssignForm.accessLevelId && !bulkAssignForm.roleId) {
    messageHandler.showError("Please select at least one field (Access Group or Role) to update.");
    return;
  }

  isAssigning.value = true;
  showBulkAssignModal.value = false;

  const idsToUpdate = [...selectedEmployeeIds.value];
  bulkAssignProgress.show = true;
  bulkAssignProgress.title = "Assigning Group & Role...";
  bulkAssignProgress.total = idsToUpdate.length;
  bulkAssignProgress.current = 0;
  bulkAssignProgress.statusText = "Initializing batch updates...";

  try {
    const activeToken = authService.getToken();

    if (bulkAssignForm.accessLevelId && idsToUpdate.length > 0) {
      const chunkSize = 50;
      for (let i = 0; i < idsToUpdate.length; i += chunkSize) {
        const chunk = idsToUpdate.slice(i, i + chunkSize);
        bulkAssignProgress.current = Math.min(i + chunkSize, idsToUpdate.length);
        bulkAssignProgress.statusText = `Updating Access Group for batch ${Math.floor(i / chunkSize) + 1}...`;

        await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${activeToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            keys: chunk,
            data: { assignedAccessLevel: bulkAssignForm.accessLevelId }
          })
        });
      }

      // Broadcast permission sync to controller hardware devices
      try {
        bulkAssignProgress.statusText = "Broadcasting permissions to devices...";
        let deviceUuids = [];

        try {
          const alRes = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevels/${bulkAssignForm.accessLevelId}?fields=*,assignedDoors.doors_id.*`, {
            headers: { Authorization: `Bearer ${activeToken}` }
          });
          if (alRes.ok) {
            const alData = await alRes.json();
            const doors = alData.data?.assignedDoors || [];
            deviceUuids = [...new Set(doors.map(d => d.doors_id?.deviceUuid || d.doors_id?.uniqueId).filter(Boolean))];
          }
        } catch (e) {
          console.warn("Failed to fetch access level doors:", e);
        }

        // Fallback: If access level has no linked doors, query all tenant doors for device UUIDs
        if (deviceUuids.length === 0) {
          try {
            const doorsRes = await fetch(`${import.meta.env.VITE_API_URL}/items/doors?limit=-1&fields=id,deviceUuid,uniqueId`, {
              headers: { Authorization: `Bearer ${activeToken}` }
            });
            if (doorsRes.ok) {
              const doorsData = await doorsRes.json();
              deviceUuids = [...new Set((doorsData.data || []).map(d => d.deviceUuid || d.uniqueId).filter(Boolean))];
            }
          } catch (e) {
            console.warn("Failed to fetch tenant doors:", e);
          }
        }

        if (deviceUuids.length > 0) {
          mqttService.connect();

          for (let i = 0; i < idsToUpdate.length; i += chunkSize) {
            const chunk = idsToUpdate.slice(i, i + chunkSize);
            const empRes = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?filter[id][_in]=${chunk.join(',')}&fields=id,employeeId,assignedCards.cardManagement_id.rfidCard,assignedCards.cardManagement_id.type`, {
              headers: { Authorization: `Bearer ${activeToken}` }
            });
            if (empRes.ok) {
              const empData = await empRes.json();
              const employees = empData.data || [];

              for (const uuid of deviceUuids) {
                const payloadData = [];
                employees.forEach(emp => {
                  const cards = emp.assignedCards || [];
                  cards.forEach((cItem, idx) => {
                    const cardNo = cItem.cardManagement_id?.rfidCard;
                    if (cardNo) {
                      payloadData.push({
                        id: String(cardNo),
                        type: 200,
                        code: String(cardNo),
                        index: idx + 1,
                        time: { type: 0 },
                        extra: { name: emp.employeeId }
                      });
                    }
                  });
                });

                if (payloadData.length > 0) {
                  await mqttService.publishCommand(uuid, 'insertPermission', payloadData);
                }
              }
            }
          }
        }
      } catch (syncErr) {
        console.error("Bulk MQTT permission broadcast error:", syncErr);
      }
    }

    messageHandler.showSuccess(`Successfully updated & synced ${idsToUpdate.length} employee(s)`);
    selectedEmployeeIds.value = [];
    bulkAssignForm.accessLevelId = "";
    bulkAssignForm.roleId = "";
    showBulkAssignModal.value = false;
    fetchEmployeeData();
  } catch (err) {
    console.error("Bulk assign error:", err);
    messageHandler.showError(err.message || "Failed to update selected employees");
  } finally {
    isAssigning.value = false;
    bulkAssignProgress.show = false;
  }
};

const selectAllTenantEmployees = async () => {
  try {
    const activeToken = authService.getToken();
    const filterParams = await buildFilterParams();
    const queryParams = new URLSearchParams({
      limit: -1,
      fields: "id",
      ...filterParams
    });
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      selectedEmployeeIds.value = (data.data || []).map(e => e.id);
      messageHandler.showSuccess(`Selected all ${selectedEmployeeIds.value.length} employees`);
    }
  } catch (err) {
    messageHandler.showError("Failed to select all employees");
  }
};

const exportSelectedEmployees = () => {
  isExportModalOpen.value = true;
};

const bulkDeleteEmployees = async () => {
  if (selectedEmployeeIds.value.length === 0) return;
  if (!confirm(`Are you sure you want to permanently delete ${selectedEmployeeIds.value.length} selected employee(s)?`)) return;

  const idsToDelete = [...selectedEmployeeIds.value];
  deleteProgress.show = true;
  deleteProgress.title = "Deleting Employees...";
  deleteProgress.total = idsToDelete.length;
  deleteProgress.current = 0;
  deleteProgress.statusText = "Initializing batch deletion...";

  deleting.value = true;
  try {
    const activeToken = authService.getToken();
    await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${activeToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(idsToDelete)
    });

    messageHandler.showSuccess(`Successfully deleted ${idsToDelete.length} employee(s)`);
    selectedEmployeeIds.value = [];
    fetchEmployeeData();
  } catch (err) {
    console.error("Bulk delete error:", err);
    messageHandler.showError("Failed to delete selected employees");
  } finally {
    deleting.value = false;
    deleteProgress.show = false;
  }
};

const deleteEmployee = async () => {
  if (!employeeToDelete.value) return;
  deleting.value = true;
  try {
    const activeToken = authService.getToken();
    await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule/${employeeToDelete.value.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${activeToken}` }
    });

    messageHandler.showSuccess("Employee deleted successfully");
    deleteDialog.value = false;
    employeeToDelete.value = null;
    fetchEmployeeData();
  } catch (err) {
    console.error("Delete error:", err);
    messageHandler.showError(err.message || "Failed to delete employee");
  } finally {
    deleting.value = false;
  }
};
</script>

<style scoped>
.employee-directory-root {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}
</style>
