<template>
  <div class="tasks-container">
    <div class="main-content" :class="{ 'with-filter': showFilters }">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <!-- Search Bar -->
          <div class="search-container">
            <div class="search-input">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search tasks..."
                @input="debouncedApplyFilters"
              />
              <button
                v-if="searchQuery"
                class="clear-button"
                @click="clearSearch"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          <!-- Header Actions -->
          <div class="header-actions">
            <button
              class="filter-toggle-btn"
              @click="toggleFilters"
              :class="{ active: hasActiveFilters }"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
              </svg>
              <span>Filters</span>
              <div v-if="hasActiveFilters" class="filter-indicator"></div>
            </button>
            <button
              v-if="selectedTaskIds.length > 0"
              class="btn-danger"
              @click="deleteSelectedTasks"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-trash"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Delete ({{ selectedTaskIds.length }} selected)
            </button>
            <button class="btn-primary" @click="navigateToAddTask">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Work Orders
            </button>
            <!-- Export Button with Dropdown -->
            <div class="relative">
              <button
                class="btn-secondary export-btn"
                @click="toggleExportDropdown"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Export</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="{ 'rotate-180': showExportDropdown }"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div v-if="showExportDropdown" class="export-dropdown-menu">
                <button
                  @click="exportData('excel')"
                  class="export-dropdown-item"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
                    />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M10 12.5V17h4" />
                    <path d="M10 14.5c.75.75 1.5 1.5 3 1.5s2.25-.75 3-1.5" />
                  </svg>
                  Export to Excel
                </button>
                <button @click="exportData('csv')" class="export-dropdown-item">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
                    />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="12" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12" y2="16" />
                    <line x1="12" y1="20" x2="12" y2="20" />
                  </svg>
                  Export to CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <!-- Main Content -->
      <main class="main-content-area">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3>Unable to load tasks</h3>
          <p>{{ error }}</p>
          <button class="btn-primary" @click="fetchTasks">Try Again</button>
        </div>
        <!-- Empty State -->
        <div v-else-if="tasks.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3>No WorkOrder found</h3>
          <p>Try adjusting your filters or create a new task</p>
          <div class="empty-actions">
            <button class="btn-secondary" @click="clearAllFilters">
              Clear Filters
            </button>
            <button class="btn-primary" @click="navigateToAddTask">
              Create WorkOrder
            </button>
          </div>
        </div>
        <!-- Tasks List -->
        <div v-else class="tasks-list">
          <!-- List Header -->
          <div class="list-header">
            <div class="header-cell checkbox-col">
              <input
                type="checkbox"
                class="custom-checkbox"
                :checked="allTasksSelected"
                :indeterminate="someTasksSelected && !allTasksSelected"
                @change="toggleSelectAll"
              />
            </div>
            <div class="header-cell task-col" @click="requestSort('title')">
              Work Orders
              <span class="sort-icon" v-if="sortBy === 'title'"
                ><svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="{ 'rotate-180': sortDirection === 'desc' }"
                >
                  <path d="m6 9 6 6 6-6" /></svg
              ></span>
            </div>
            <div
              class="header-cell description-col"
              @click="requestSort('description')"
            >
              Description
              <span class="sort-icon" v-if="sortBy === 'description'"
                ><svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="{ 'rotate-180': sortDirection === 'desc' }"
                >
                  <path d="m6 9 6 6 6-6" /></svg
              ></span>
            </div>
            <div class="header-cell type-col" @click="requestSort('taskType')">
              Type
              <span class="sort-icon" v-if="sortBy === 'taskType'"
                ><svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="{ 'rotate-180': sortDirection === 'desc' }"
                >
                  <path d="m6 9 6 6 6-6" /></svg
              ></span>
            </div>
            <div class="header-cell status-col" @click="requestSort('status')">
              Status
              <span class="sort-icon" v-if="sortBy === 'status'"
                ><svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="{ 'rotate-180': sortDirection === 'desc' }"
                >
                  <path d="m6 9 6 6 6-6" /></svg
              ></span>
            </div>
            <div
              class="header-cell assigned-col"
              @click="requestSort('employeeId.assignedUser.first_name')"
            >
              Assigned To
              <span
                class="sort-icon"
                v-if="sortBy === 'employeeId.assignedUser.first_name'"
                ><svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="{ 'rotate-180': sortDirection === 'desc' }"
                >
                  <path d="m6 9 6 6 6-6" /></svg
              ></span>
            </div>
            <div
              class="header-cell client-col"
              @click="requestSort('clientId.customerName')"
            >
              Client Name
              <span class="sort-icon" v-if="sortBy === 'clientId.customerName'"
                ><svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :class="{ 'rotate-180': sortDirection === 'desc' }"
                >
                  <path d="m6 9 6 6 6-6" /></svg
              ></span>
            </div>
            <div class="header-cell actions-col">Actions</div>
          </div>
          <!-- List Items -->
          <div
            v-for="task in tasks"
            :key="task.id"
            class="list-item"
            :class="{ expanded: expandedTaskId === task.id }"
            @click="viewTaskDetails(task)"
          >
            <!-- Main Row -->
            <div class="item-row">
              <div class="list-cell checkbox-col" @click.stop>
                <input
                  type="checkbox"
                  class="custom-checkbox"
                  :checked="selectedTaskIds.includes(task.id)"
                  @change="toggleTaskSelection(task.id)"
                />
              </div>
              <!-- Task Column -->
              <div class="list-cell task-col">
                <div class="task-info">
                  <h3 class="task-title">
                    {{ task.title || "Untitled Task" }}
                  </h3>
                </div>
              </div>
              <!-- Description Column -->
              <div class="list-cell description-col">
                <p class="task-description">
                  {{ task.description || "No description available" }}
                </p>
              </div>
              <!-- Type Column -->
              <div class="list-cell type-col">
                <span class="type-badge">{{
                  formatTaskType(task.taskType)
                }}</span>
              </div>
              <!-- Status Column -->
              <div class="list-cell status-col">
                <span class="status-badge" :class="`status-${task.status}`">
                  <template v-if="task.status === 'pending'">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-clock"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </template>
                  <template v-else-if="task.status === 'inprogress'">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-hourglass"
                    >
                      <path d="M5 22h14" />
                      <path d="M5 2h14" />
                      <path
                        d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"
                      />
                      <path
                        d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"
                      />
                    </svg>
                  </template>
                  <template v-else-if="task.status === 'completed'">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-check-circle"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                  </template>
                  <template v-else-if="task.status === 'overdue'">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-alert-circle"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                  </template>
                  {{ formatStatus(task.status) }}</span
                >
              </div>
              <!-- Assigned To Column -->
              <div class="list-cell assigned-col">
                <div class="assigned-info">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>{{ task.assignedUser || "Unassigned" }}</span>
                </div>
              </div>
              <!-- Client Column -->
              <div class="list-cell client-col">
                <div class="client-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-users"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>{{ task.customerName || "No Client" }}</span>
                </div>
              </div>
              <!-- Actions Column -->
              <div class="list-cell actions-col">
                <button
                  class="action-btn"
                  @click.stop="toggleExpandedDetails(task.id)"
                  title="Toggle Details"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    :class="{
                      rotated: expandedTaskId === task.id,
                    }"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>
            </div>
            <!-- Expanded Details -->
            <div v-if="expandedTaskId === task.id" class="expanded-details">
              <div class="details-content">
                <div class="detail-section">
                  <h4>Task Information</h4>
                  <div class="detail-section">
                    <h4>Description</h4>
                    <p>{{ task.description || "No description provided" }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Custom Pagination -->
        <CustomPagination
          v-model:page="currentPage"
          v-model:itemsPerPage="itemsPerPage"
          :total-items="totalItems"
          :is-searching="!!searchQuery"
          @update:page="handlePageChange"
          @update:itemsPerPage="handleItemsPerPageChange"
        />
      </main>
    </div>
    <!-- Right Filter Panel -->
    <transition name="slide">
      <div v-if="showFilters" class="filter-panel">
        <div class="filter-header">
          <div class="filter-header-content">
            <button class="back-btn" @click="toggleFilters" aria-label="Back">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h3 class="filter-title">Filters</h3>
            <button class="close-btn" @click="toggleFilters">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div class="filter-content">
          <!-- Date Filter -->
          <div class="filter-section">
            <h4 class="filter-section-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-calendar"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              Date Range
            </h4>
            <div class="date-filter-container">
              <div class="date-input-group">
                <label class="date-label">From Date</label>
                <input
                  type="date"
                  v-model="filters.dateFrom"
                  @change="applyFilters"
                  class="date-input"
                />
              </div>
              <div class="date-input-group">
                <label class="date-label">To Date</label>
                <input
                  type="date"
                  v-model="filters.dateTo"
                  @change="applyFilters"
                  class="date-input"
                />
              </div>
              <div
                v-if="filters.dateFrom || filters.dateTo"
                class="date-filter-actions"
              >
                <button class="btn-clear-date" @click="clearDateFilter">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Clear Dates
                </button>
              </div>
            </div>
          </div>
          <!-- Status Filter -->
          <div class="filter-section">
            <h4 class="filter-section-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-check-square"
              >
                <polyline points="9 11 12 14 22 4" />
                <path
                  d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                />
              </svg>
              Status
            </h4>
            <div class="filter-input custom-select-wrapper">
              <select
                v-model="filters.status"
                @change="applyFilters"
                class="custom-select"
              >
                <option value="">All Status ({{ taskCounts.total }})</option>
                <option value="pending">
                  Pending ({{ taskCounts.pending }})
                </option>
                <option value="inprogress">
                  In Progress ({{ taskCounts.inProgress }})
                </option>
                <option value="completed">
                  Completed ({{ taskCounts.completed }})
                </option>
                <option value="overdue">
                  OverDue ({{ taskCounts.overdue }})
                </option>
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-chevron-down select-icon"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
          <!-- Task Type Filter (Dynamic) -->
          <div class="filter-section">
            <h4 class="filter-section-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-tag"
              >
                <path
                  d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414L19 21.414a2 2 0 0 0 2.828 0l2-2a2 2 0 0 0 0-2.828Z"
                />
                <path d="M7 7h.01" />
              </svg>
              Task Type
            </h4>
            <div class="filter-input custom-select-wrapper">
              <select
                v-model="filters.assignFormId"
                @change="applyFilters"
                class="custom-select"
              >
                <option value="">All Task Types</option>
                <option
                  v-for="form in formTemplates"
                  :key="form.id"
                  :value="form.id"
                >
                  {{ form.formName }}
                </option>
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-chevron-down select-icon"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
          <!-- Branch Filter -->
          <div class="filter-section">
            <h4 class="filter-section-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-map-pin"
              >
                <path d="M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                <path
                  d="M12 22s8-4 8-10V7c0-2.8-2.2-5-5-5h-6c-2.8 0-5 2.2-5 5v5c0 6 8 10 8 10Z"
                />
              </svg>
              Branch
            </h4>
            <div class="filter-input custom-select-wrapper">
              <select
                v-model="filters.branch"
                @change="applyFilters"
                class="custom-select"
              >
                <option value="">All Branches</option>
                <option
                  v-for="branch in branches"
                  :key="branch.id"
                  :value="branch.id"
                >
                  {{ branch.branchName }}
                </option>
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-chevron-down select-icon"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
        <div class="filter-actions">
          <button class="btn-secondary" @click="clearAllFilters">
            Clear All
          </button>
          <button class="btn-primary" @click="applyFilters">
            Apply Filters
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/authService";
import CustomPagination from "../../../utils/pagination/CustomPagination.vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
const tenantId = currentUserTenant.getTenantId();
import {
  getFormattedExportData,
  generateFileName,
  exportToCSV,
  exportToExcel,
  exportToPDF,
} from "@/utils/Tasksexport/exportUtils"; // Import export utilities

const API_TOKEN = authService.getToken();
const router = useRouter();

// State
const loading = ref(true);
const error = ref("");
const tasks = ref([]);
const branches = ref([]);
const formTemplates = ref([]); // New state for dynamic form templates
const expandedTaskId = ref(null); // New ref to manage expanded task details
const searchQuery = ref("");
const showFilters = ref(false);
const showExportDropdown = ref(false); // New state for export dropdown
const currentPage = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0); // New reactive variable for total items from API
const selectedTaskIds = ref([]); // New state for selected task IDs

// Sorting state
const sortBy = ref("date_created"); // Default sort field
const sortDirection = ref("desc"); // Default sort direction

// Filters
const filters = reactive({
  status: "",
  taskTypes: [], // This will be replaced by assignFormId for dynamic filter
  branch: "",
  dateFrom: "",
  dateTo: "",
  assignFormId: "", // New filter for dynamic task type
});

// Task counts for filter display (still useful for showing counts in filter options)
const taskCounts = ref({
  total: 0,
  pending: 0,
  inProgress: 0,
  completed: 0,
  overdue: 0, // Added overdue count
});

// API Configuration
const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
const API_ENDPOINTS = {
  tasks: "/items/tasks",
  branches: "/items/branch",
  formTemplates: "/items/form_template",
};

// Computed properties
const hasActiveFilters = computed(() => {
  return (
    filters.status !== "" ||
    filters.taskTypes.length > 0 || // Keep for now if still used elsewhere, but assignFormId replaces it for UI
    filters.branch !== "" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.assignFormId !== "" || // Include new filter
    searchQuery.value !== ""
  );
});

const allTasksSelected = computed(() => {
  return (
    tasks.value.length > 0 &&
    selectedTaskIds.value.length === tasks.value.length
  );
});

const someTasksSelected = computed(() => {
  return (
    selectedTaskIds.value.length > 0 &&
    selectedTaskIds.value.length < tasks.value.length
  );
});

// Helper function for debouncing search input
let searchTimeout = null;
const debouncedApplyFilters = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 300); // 300ms debounce time
};

// API Methods
const buildTaskFilterParams = () => {
  const params = {};
  let filterIndex = 0;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    params[`filter[_or][${filterIndex}][title][_icontains]`] = query;
    params[`filter[_or][${filterIndex + 1}][description][_icontains]`] = query;
    params[
      `filter[_or][${filterIndex + 2}][employeeId][assignedUser][first_name][_icontains]`
    ] = query;
    params[
      `filter[_or][${filterIndex + 3}][clientId][customerName][_icontains]`
    ] = query;
    filterIndex += 4;
  }

  // Status filter
  if (filters.status) {
    params[`filter[_and][${filterIndex}][status][_eq]`] = filters.status;
    filterIndex++;
  }

  // Dynamic Task Type filter (using assignFormId)
  if (filters.assignFormId) {
    params[`filter[_and][${filterIndex}][assignFormId][_eq]`] =
      filters.assignFormId;
    filterIndex++;
  }

  // Branch filter
  if (filters.branch) {
    params[
      `filter[_and][${filterIndex}][employeeId][assignedBranch][branch_id][id][_eq]`
    ] = filters.branch;
    filterIndex++;
  }

  // Date filters
  if (filters.dateFrom || filters.dateTo) {
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

    if (fromDate && toDate) {
      // Direct date range filtering for date_created
      params[`filter[_and][${filterIndex}][date_created][_gte]`] = fromDate
        .toISOString()
        .split("T")[0];
      params[`filter[_and][${filterIndex + 1}][date_created][_lte]`] = toDate
        .toISOString()
        .split("T")[0];
      filterIndex += 2;
    } else if (fromDate) {
      params[`filter[_and][${filterIndex}][date_created][_gte]`] = fromDate
        .toISOString()
        .split("T")[0];
      filterIndex++;
    } else if (toDate) {
      params[`filter[_and][${filterIndex}][date_created][_lte]`] = toDate
        .toISOString()
        .split("T")[0];
      filterIndex++;
    }
  }

  // Sorting parameters
  if (sortBy.value) {
    params.sort = `${sortDirection.value === "desc" ? "-" : ""}${sortBy.value}`;
  }

  return params;
};

const fetchTaskAggregateCount = async () => {
  try {
    if (!API_TOKEN) {
      throw new Error("Authentication token not found");
    }

    const filterParams = buildTaskFilterParams();
    const params = {
      "aggregate[count]": "id",
      ...filterParams,
    };

    const queryString = Object.keys(params)
      .map((key) => {
        return `${key}=${encodeURIComponent(params[key])}`;
      })
      .join("&");

    const countResponse = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.tasks}?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!countResponse.ok) {
      throw new Error(`HTTP error! status: ${countResponse.status}`);
    }

    const countData = await countResponse.json();
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
  } catch (err) {
    console.error("Error fetching aggregate count:", err);
    totalItems.value = 0;
  }
};

const fetchBranches = async () => {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.branches}?fields[]=id&fields[]=branchName`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.data) {
      branches.value = data.data.map((branch) => ({
        id: branch.id,
        branchName: branch.branchName || "",
      }));
    } else {
      branches.value = [];
    }
  } catch (err) {
    console.error("Error fetching branches:", err);
  }
};

const fetchFormTemplates = async () => {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.formTemplates}?fields[]=id&fields[]=formName`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.data) {
      formTemplates.value = data.data.map((form) => ({
        id: form.id,
        formName: form.formName || "",
      }));
    } else {
      formTemplates.value = [];
    }
  } catch (err) {
    console.error("Error fetching form templates:", err);
  }
};

const fetchTasks = async () => {
  loading.value = true;
  error.value = "";
  try {
    await fetchTaskAggregateCount(); // Get total count first

    let url = `${API_BASE_URL}${API_ENDPOINTS.tasks}?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&fields[]=id,taskType&fields[]=title&fields[]=status&fields[]=employeeId.assignedUser.first_name&fields[]=clientId.customerName&fields[]=date_created&fields[]=description&fields[]=assignFormId`;

    // Add pagination parameters
    url += `&limit=${itemsPerPage.value}&offset=${(currentPage.value - 1) * itemsPerPage.value}`;

    // Add filters and search to URL
    const filterParams = buildTaskFilterParams();
    const queryString = Object.keys(filterParams)
      .map((key) => `${key}=${encodeURIComponent(filterParams[key])}`)
      .join("&");

    if (queryString) {
      url += `&${queryString}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.data) {
      tasks.value = data.data.map((task) => ({
        id: task.id || Math.random().toString(36).substr(2, 9),
        title: task.title || "",
        description: task.description || "",
        taskType: task.taskType || "",
        status: task.status || "pending",
        assignFormId: task.assignFormId,
        assignedUser: task.employeeId?.assignedUser?.first_name || "",
        customerName: task.clientId?.customerName || "",
        date_created: task.date_created || new Date().toISOString(),
      }));
      calculateTaskCounts();
    } else {
      tasks.value = [];
    }
  } catch (err) {
    console.error("Error fetching tasks:", err);
    error.value =
      "Failed to load tasks. Please check your connection and try again.";
    tasks.value = [];
  } finally {
    loading.value = false;
  }
};

// New function to fetch all data for export
const fetchExportData = async () => {
  try {
    if (!API_TOKEN) {
      throw new Error("Authentication token not found");
    }

    const exportFields = [
      "id",
      "title",
      "description",
      "taskType",
      "status",
      "amountCollected",
      "amountExpected",
      "currentLat",
      "currentLng",
      "demo",
      "deviceType",
      "dueTime",
      "eAmountCollected",
      "from",
      "issueReport",
      "lat",
      "lng",
      "paymentMode",
      "radiusInMeters",
      "referenceNumber",
      "snNumber",
      "date_created",
      // New nested fields
      "prodName.productName",
      "orgId.orgName",
      "orgLocation.locType",
      "tenant.tenantName",
      "employeeId.assignedUser.first_name", // Keep for assigned user name
      "clientId.customerName", // Keep for client name
    ];

    let url = `${API_BASE_URL}${API_ENDPOINTS.tasks}?fields[]=${exportFields.join(",")}`;

    // Add filters and search to URL (without pagination)
    const filterParams = buildTaskFilterParams();
    const queryString = Object.keys(filterParams)
      .filter((key) => key !== "sort") // Exclude sort from export data fetch if you want unsorted export
      .map((key) => `${key}=${encodeURIComponent(filterParams[key])}`)
      .join("&");

    if (queryString) {
      url += `&${queryString}`;
    }

    // Add a large limit to ensure all data is fetched, or use pagination if API supports it for full export
    // For Directus, -1 means no limit
    url += `&limit=-1`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error("Error fetching export data:", err);
    alert("Failed to fetch data for export. Please try again.");
    return [];
  }
};

// Methods
const calculateTaskCounts = () => {
  const allTasks = tasks.value;
  taskCounts.value = {
    total: totalItems.value, // Use totalItems from API for overall count
    pending: allTasks.filter((t) => t.status === "pending").length,
    inProgress: allTasks.filter((t) => t.status === "inprogress").length,
    completed: allTasks.filter((t) => t.status === "completed").length,
    overdue: allTasks.filter((t) => t.status === "overdue").length, // Calculate overdue count
  };
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value;
};

const applyFilters = () => {
  currentPage.value = 1; // Reset to first page on filter change
  fetchTasks();
};

const clearAllFilters = () => {
  filters.status = "";
  filters.taskTypes = []; // Clear this as well, though assignFormId is primary now
  filters.branch = "";
  filters.dateFrom = "";
  filters.dateTo = "";
  filters.assignFormId = ""; // Clear new filter
  searchQuery.value = "";
  currentPage.value = 1;
  selectedTaskIds.value = []; // Clear selected tasks
  // Reset sorting when clearing all filters
  sortBy.value = "date_created";
  sortDirection.value = "desc";
  fetchTasks();
};

const clearDateFilter = () => {
  filters.dateFrom = "";
  filters.dateTo = "";
  applyFilters(); // Re-apply filters to fetch data
};

const clearSearch = () => {
  searchQuery.value = "";
  applyFilters(); // Re-apply filters to fetch data
};

const toggleTaskSelection = (taskId) => {
  if (selectedTaskIds.value.includes(taskId)) {
    selectedTaskIds.value = selectedTaskIds.value.filter((id) => id !== taskId);
  } else {
    selectedTaskIds.value.push(taskId);
  }
};

const toggleSelectAll = () => {
  if (allTasksSelected.value) {
    selectedTaskIds.value = [];
  } else {
    selectedTaskIds.value = tasks.value.map((task) => task.id);
  }
};

const deleteSelectedTasks = async () => {
  if (selectedTaskIds.value.length === 0) {
    alert("No tasks selected for deletion.");
    return;
  }

  if (
    !confirm(
      `Are you sure you want to delete ${selectedTaskIds.value.length} selected tasks?`,
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.tasks}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedTaskIds.value), // Send array of IDs in the body
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData.errors?.[0]?.message || "Unknown error"}`,
      );
    }

    alert(`${selectedTaskIds.value.length} tasks deleted successfully!`);
    selectedTaskIds.value = []; // Clear selection
    fetchTasks(); // Re-fetch tasks to update the list
  } catch (err) {
    console.error("Error deleting tasks:", err);
    alert(`Failed to delete tasks: ${err.message}. Please try again.`);
  }
};

const viewTaskDetails = (task) => {
  // This function is now solely for navigation when clicking the row (excluding checkbox/action button)
  router.push(
    `/taskManagement/taskcomponents/complete-work-order/${task.id}/${task.assignFormId}`,
  );
};

const toggleExpandedDetails = (taskId) => {
  if (expandedTaskId.value === taskId) {
    expandedTaskId.value = null; // Collapse if already expanded
  } else {
    expandedTaskId.value = taskId; // Expand the clicked task
  }
};

const navigateToAddTask = () => {
  router.push("/taskManagement/taskcomponents/AddTaskForm");
};

const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchTasks();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1; // Reset to first page when items per page changes
  fetchTasks();
};

// Sorting method
const requestSort = (field) => {
  if (sortBy.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortDirection.value = "asc"; // Default to ascending when changing sort field
  }
  currentPage.value = 1; // Reset to first page on sort change
  fetchTasks();
};

// Export Functions
const exportData = async (type) => {
  showExportDropdown.value = false; // Close dropdown immediately
  alert(`Generating ${type.toUpperCase()} report... This might take a moment.`); // User feedback
  try {
    const dataToExport = await fetchExportData();
    const formattedData = getFormattedExportData(dataToExport);

    if (formattedData.length === 0) {
      alert("No data to export with the current filters.");
      return;
    }

    const filename = generateFileName(type);
    if (type === "csv") {
      exportToCSV(formattedData, filename);
    } else if (type === "excel") {
      exportToExcel(formattedData, filename);
    } else if (type === "pdf") {
      exportToPDF(formattedData, filename);
    }
  } catch (err) {
    console.error("Export failed:", err);
    alert("Failed to generate report. Please check console for details.");
  }
};

// Helper functions (kept here for table display formatting)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch (e) {
    return "Invalid Date";
  }
};

const formatStatus = (status) => {
  if (!status) return "Unknown";
  switch (status.toLowerCase()) {
    case "inprogress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "pending":
      return "Pending";
    case "overdue": // Added overdue case
      return "OverDue";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

const formatTaskType = (type) => {
  if (!type) return "Unknown";
  switch (type) {
    case "siteVisit":
      return "Site Visit";
    case "moneyCollection":
      return "Money Collection";
    case "installation":
      return "Installation";
    case "service":
      return "Service";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

// Watch for changes in filters, search query, or sort to re-fetch data
watch(
  [filters, searchQuery, sortBy, sortDirection],
  () => {
    // No direct action here, as `applyFilters` or `requestSort`
    // already trigger `fetchTasks` with updated parameters.
  },
  { deep: true },
);

// Lifecycle
onBeforeMount(async () => {
  await fetchBranches();
  await fetchFormTemplates(); // Fetch form templates on mount
});

onMounted(async () => {
  await fetchTasks();
});
</script>

<style scoped>
/* Base Styles */
.tasks-container {
  height: 100vh;
  display: flex;
  padding: -1rem;
  overflow: hidden;
  background-color: #f8fafc;
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: margin-right 0.3s ease;
}
/* Filter panel open state */
.main-content.with-filter {
  margin-right: 320px;
}
/* Header */
.header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  max-width: none;
}
.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
/* Search */
.search-container {
  flex: 1;
  max-width: 400px;
}
.search-input {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}
.search-input:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.search-input svg {
  position: absolute;
  left: 0.75rem;
  color: #64748b;
}
.search-input input {
  width: 100%;
  padding: 0.5rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  background: transparent;
  color: #1e293b;
}
.search-input input:focus {
  outline: none;
}
.search-input input::placeholder {
  color: #94a3b8;
}
.clear-button {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.clear-button:hover {
  background: #e2e8f0;
  color: #475569;
}
/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.filter-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.filter-toggle-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
.filter-toggle-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}
.filter-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  border: 1px solid white;
}
/* Main Content Area */
.main-content-area {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
/* Loading, Error, Empty States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%; /* Use 100% to fill parent, not 100vh */
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  border: 1px solid #e2e8f0;
  height: 100%; /* Use 100% to fill parent */
}
.error-icon,
.empty-icon {
  color: #94a3b8;
  margin-bottom: 1rem;
}
.error-state h3,
.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}
.error-state p,
.empty-state p {
  color: #64748b;
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
}
.empty-actions {
  display: flex;
  gap: 0.75rem;
}
/* Tasks List */
.tasks-list {
  flex: 1;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow-y: auto;
  overflow-x: auto; /* Allow horizontal scrolling for the table */
  max-height: calc(100vh - 200px); /* Adjust based on header/footer height */
}
.list-header {
  display: flex;
  background: #f8fafc;
  padding: 0.5rem;
  font-weight: 700;
  color: #475569;
  font-size: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #e8edff;
  color: #0f3b82;
}
.header-cell {
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  cursor: pointer; /* Indicate sortable */
  user-select: none; /* Prevent text selection on click */
}
.header-cell .sort-icon {
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
}
.header-cell .sort-icon svg {
  transition: transform 0.2s ease;
}
.header-cell .sort-icon svg.rotate-180 {
  transform: rotate(180deg);
}
.list-item {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
}
.list-item:last-child {
  border-bottom: none;
}
.list-item:hover {
  background-color: #f8fafc;
}
.item-row {
  display: flex;
  cursor: pointer;
}
.list-cell {
  padding: 0.6rem 0.5rem; /* Minimized row height */
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #1e293b;
}
/* Column Widths */
.checkbox-col {
  flex: 0 0 40px; /* Fixed width for checkbox column */
  justify-content: center;
}
.task-col {
  flex: 2;
  min-width: 180px;
}
.description-col {
  flex: 2.5; /* New column for description */
  min-width: 220px;
}
.type-col {
  flex: 1.5;
  min-width: 140px;
}
.status-col {
  flex: 1.5;
  min-width: 120px;
}
.assigned-col {
  flex: 2;
  min-width: 180px; /* Increased width for clarity */
}
.client-col {
  flex: 2;
  min-width: 180px; /* Increased width for clarity */
}
.actions-col {
  flex: 1;
  min-width: 100px;
  justify-content: center;
}
/* Task Info */
.task-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}
.task-title {
  font-weight: 500;
  margin: 0;
  font-size: 0.875rem;
  color: #1e293b;
}
.task-description {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Badges */
.type-badge {
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}
.status-badge {
  display: flex; /* Added for icon alignment */
  align-items: center; /* Added for icon alignment */
  gap: 0.4rem; /* Space between icon and text */
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}
.status-pending {
  background: #fef3c7;
  color: #92400e;
}
.status-inprogress {
  background: #dbeafe;
  color: #1d4ed8;
}
.status-completed {
  background: #dcfce7;
  color: #166534;
}
.status-overdue {
  background: #fee2e2; /* Light red */
  color: #dc2626; /* Darker red */
}
/* Assigned Info */
.assigned-info,
.client-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
}
.assigned-info svg,
.client-info svg {
  color: #94a3b8;
}
/* Actions */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}
.action-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}
.action-btn svg.rotated {
  transform: rotate(180deg);
}
/* Expanded Details */
.expanded-details {
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}
.details-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.detail-section {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
.detail-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
}
.detail-section p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.detail-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}
.detail-value {
  font-size: 0.875rem;
  color: #1e293b;
}
/* Filter Panel */
.filter-panel {
  width: 330px;
  background: white;
  border-left: 1px solid #e2e8f0;
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  z-index: 200;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
}
.filter-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  margin-top: 4rem;
}
.filter-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filter-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f3b82;
  margin: 0;
}
.back-btn,
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: #98c2c921;
  border: none;
  color: #64748b;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.2s ease;
}
.back-btn:hover,
.close-btn:hover {
  background: #ddeeff;
  color: #475569;
}
.filter-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}
.filter-section {
  margin-bottom: 2rem;
}
.filter-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
  display: flex; /* Added for icon alignment */
  align-items: center; /* Added for icon alignment */
  gap: 0.5rem; /* Space between icon and text */
}
.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.filter-option {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.filter-option input {
  margin-right: 0.75rem;
}
.filter-input {
  position: relative; /* Added for custom select icon positioning */
}
.filter-input select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}
.filter-input select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Custom Checkbox Styles */
.custom-checkbox {
  /* Remove default browser styles */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  /* Sizing */
  width: 18px; /* Increased size */
  height: 18px; /* Increased size */
  /* Visuals */
  border: 2px solid #cbd5e1; /* Light gray border */
  border-radius: 4px; /* Slightly rounded corners */
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative; /* For custom checkmark */
  display: inline-block; /* Ensure it respects width/height */
  flex-shrink: 0; /* Prevent shrinking in flex containers */
}

.custom-checkbox:checked {
  background-color: #3b82f6; /* Blue background when checked */
  border-color: #3b82f6; /* Blue border when checked */
}

.custom-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); /* Focus ring */
}

.custom-checkbox:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px; /* Checkmark width */
  height: 10px; /* Checkmark height */
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -50%) rotate(45deg);
}

/* Indeterminate state for header checkbox */
.custom-checkbox:indeterminate {
  background-color: #3b82f6; /* Blue background for indeterminate */
  border-color: #3b82f6; /* Blue border for indeterminate */
}

.custom-checkbox:indeterminate::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px; /* Line width */
  height: 2px; /* Line height */
  background-color: white;
  transform: translate(-50%, -50%);
  border-radius: 1px; /* Slightly rounded ends for the line */
}

/* Ensure alignment in header and rows */
.header-cell.checkbox-col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.5rem;
  margin-left: 0.5rem;
}
.list-cell.checkbox-col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.5rem;
  margin-left: 1rem;
}

/* Custom Select Styles */
.custom-select-wrapper {
  position: relative;
  width: 100%;
}

.custom-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 1rem; /* Increased padding, space for icon */
  border: 1px solid #e2e8f0;
  border-radius: 8px; /* Slightly more rounded */
  background-color: #fff;
  font-size: 0.875rem;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-select:hover {
  border-color: #cbd5e1;
}

.custom-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; /* Ensures clicks go through to the select */
  color: #64748b;
}

/* Date Filter Styles */
.date-filter-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.date-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}
.date-input {
  width: 100%;
  padding: 0.6rem 1rem; /* Increased padding */
  border: 1px solid #e2e8f0;
  border-radius: 8px; /* Slightly more rounded */
  font-size: 0.875rem;
  background: white;
  color: #1e293b;
  transition: all 0.2s ease;
}
.date-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.date-filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}
.btn-clear-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-clear-date:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}
.filter-actions {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 0.75rem;
}
/* Buttons */
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #68ade1;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-secondary:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
.btn-danger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-danger:hover {
  background: #dc2626;
}
/* Export Dropdown Styles */
.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.export-btn svg.rotate-180 {
  transform: rotate(180deg);
}
.export-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
}
.export-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
  color: #1e293b;
  transition: background-color 0.2s;
}
.export-dropdown-item:hover {
  background-color: #f1f5f9;
}
/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
/* Responsive */
@media (max-width: 1024px) {
  .main-content.with-filter {
    margin-right: 0;
  }
  .filter-panel {
    width: 100%;
    max-width: 330px;
  }
  .tasks-list {
    overflow-x: auto;
  }
  .list-header,
  .item-row {
    min-width: 1000px;
  }
}
@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .search-container {
    order: 3;
    flex: 1 1 100%;
    max-width: none;
  }
  /* Remove original pagination styles that conflict with CustomPagination */
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  .pagination-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
