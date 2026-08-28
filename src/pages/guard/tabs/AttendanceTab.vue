<template>
  <div class="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

    <!-- Top Header & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Guard Attendance & Live Monitoring
            </h2>
            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
              <Smartphone class="w-3 h-3" />
              Mobile App Sync Live
            </span>
          </div>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Real-time live status tracking & multi-session punch history recorded via the Mobile Patrol App
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          class="h-9 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          @click="loadAttendanceData"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>Refresh</span>
        </button>

        <!-- Pro Feature: Export Report -->
        <FeatureGate feature="attendance.advanced">
          <button
            class="h-9 px-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            @click="exportCSV"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </FeatureGate>
      </div>
    </div>

    <!-- Pro: Advanced Operations Center Dashboard Strip -->
    <FeatureGate feature="attendance.advanced">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <!-- Total Unique Guards -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Total Roster</span>
          <p class="text-xl font-black text-slate-900 dark:text-white mt-1">
            {{ uniqueGuardsCount }} <span class="text-[10px] text-slate-400 font-normal">Guards</span>
          </p>
        </div>

        <!-- Total Active Guards -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm border-l-4 border-l-emerald-500">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">On Duty (Active)</span>
          <p class="text-xl font-black text-emerald-600 mt-1">
            {{ activeGuardsCount }} <span class="text-[10px] text-emerald-500 font-bold">Guards</span>
          </p>
        </div>

        <!-- On Break -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm border-l-4 border-l-amber-500">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">On Break</span>
          <p class="text-xl font-black text-amber-600 mt-1">{{ onBreakCount }}</p>
        </div>

        <!-- Total Sessions Today -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Total Punches</span>
          <p class="text-xl font-black text-indigo-600 mt-1">{{ attendanceList.length }} <span class="text-[10px] text-indigo-400 font-normal">Sessions</span></p>
        </div>

        <!-- Off Duty -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Off Duty</span>
          <p class="text-xl font-black text-slate-600 dark:text-slate-300 mt-1">{{ offDutyCount }}</p>
        </div>

        <!-- Shift Compliance % -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Compliance</span>
          <p class="text-xl font-black text-emerald-600 mt-1">{{ stats.complianceRate }}%</p>
        </div>
      </div>
    </FeatureGate>

    <!-- Filters, Search & View Mode Switcher -->
    <div class="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-3 rounded-xl shadow-sm text-xs">
      <div class="flex items-center gap-2 flex-wrap">
        <!-- View Mode: Grouped by Person vs Flat Punch Sessions -->
        <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            class="px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            :class="viewMode === 'grouped' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'"
            @click="viewMode = 'grouped'"
          >
            <Users class="w-3.5 h-3.5" />
            <span>Grouped by Guard (Multi-Session)</span>
          </button>
          <button
            class="px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            :class="viewMode === 'flat' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'"
            @click="viewMode = 'flat'"
          >
            <ListFilter class="w-3.5 h-3.5" />
            <span>All Punch Logs ({{ filteredList.length }})</span>
          </button>
        </div>

        <!-- Status Filter -->
        <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            v-for="st in ['all', 'present', 'on_break', 'off_duty', 'absent']"
            :key="st"
            class="px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition-all"
            :class="statusFilter === st ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'"
            @click="statusFilter = st"
          >
            {{ statusFilterLabel(st) }}
          </button>
        </div>

        <!-- Site Filter -->
        <select
          v-model="selectedSiteFilter"
          class="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none"
        >
          <option value="">All Sites</option>
          <option v-for="site in sitesList" :key="site.id" :value="site.id">
            {{ site.name }}
          </option>
        </select>
      </div>

      <!-- Search Box -->
      <div class="relative w-full sm:w-64">
        <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search guard name, phone..."
          class="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- VIEW A: GROUPED BY EMPLOYEE (MULTI-SESSION VIEW)             -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div v-if="viewMode === 'grouped'" class="space-y-3.5">
      <div v-if="loading" class="p-16 flex justify-center items-center gap-3 text-slate-400 text-xs bg-white dark:bg-[#151c2c] rounded-2xl border border-slate-200 dark:border-white/10">
        <Loader2 class="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading attendance records from mobile app...</span>
      </div>

      <div v-else-if="groupedGuards.length === 0" class="p-16 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-[#151c2c] rounded-2xl border border-slate-200 dark:border-white/10">
        <Smartphone class="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-1">No Guard Attendance Records</h3>
        <p class="text-xs text-slate-500">Attendance punches recorded on the mobile app will automatically appear here.</p>
      </div>

      <!-- Grouped Guard Cards -->
      <div
        v-else
        v-for="guardGroup in groupedGuards"
        :key="guardGroup.guardKey"
        class="bg-white dark:bg-[#151c2c] border border-slate-200/90 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:border-indigo-400/60 dark:hover:border-indigo-500/30 transition-all space-y-4"
      >
        <!-- Top Row: Guard Identity & Status Indicator -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-white/5">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center font-black text-sm text-indigo-700 dark:text-indigo-300 shadow-sm shrink-0">
              {{ (guardGroup.guardName || 'G')[0] }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-black text-sm text-slate-900 dark:text-white">{{ guardGroup.guardName }}</h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {{ guardGroup.sessions.length }} {{ guardGroup.sessions.length === 1 ? 'Session' : 'Sessions Today' }}
                </span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1">
                  <Smartphone class="w-2.5 h-2.5" /> Mobile App Logged
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 font-medium">
                <span>{{ guardGroup.phone }}</span>
                <span>&bull;</span>
                <span class="text-slate-700 dark:text-slate-300 font-semibold">{{ guardGroup.siteName }}</span>
              </p>
            </div>
          </div>

          <!-- Read-Only Status Indicator & Audit History -->
          <div class="flex items-center gap-2.5">
            <!-- Current Live Status Badge -->
            <span
              class="text-xs font-extrabold uppercase px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm"
              :class="getStatusBadgeClass(guardGroup.currentStatus)"
            >
              <span class="w-2 h-2 rounded-full" :class="getStatusDotClass(guardGroup.currentStatus)" />
              {{ guardGroup.currentStatus ? guardGroup.currentStatus.replace('_', ' ') : 'Present' }}
            </span>

            <!-- Audit History Details Button -->
            <button
              class="h-8 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="View full punch timeline from mobile"
              @click="openAuditModal(guardGroup)"
            >
              <History class="w-3.5 h-3.5 text-indigo-500" />
              <span>Punch Timeline</span>
            </button>
          </div>
        </div>

        <!-- Middle Row: Sessions Timeline Breakdown -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="(session, sIdx) in guardGroup.sessions"
            :key="session.id"
            class="p-3.5 rounded-xl border transition-all relative overflow-hidden"
            :class="session.check_out_time 
              ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-white/5' 
              : 'bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/30 ring-1 ring-emerald-500/20'"
          >
            <!-- Session Header -->
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full" :class="session.check_out_time ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'"></span>
                Session #{{ sIdx + 1 }}
              </span>
              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full" :class="session.check_out_time ? 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'">
                {{ session.check_out_time ? 'Checked Out' : (session.status === 'on_break' ? 'On Break' : 'On Duty') }}
              </span>
            </div>

            <!-- Timestamps Grid -->
            <div class="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-white/5">
              <div>
                <span class="text-[10px] font-bold text-slate-400 block uppercase">Check-In</span>
                <span class="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {{ formatTime(session.check_in_time) || '—' }}
                </span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-slate-400 block uppercase">Check-Out</span>
                <span class="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {{ formatTime(session.check_out_time) || (session.check_in_time ? 'In Progress' : '—') }}
                </span>
              </div>
            </div>

            <!-- Break Info If Present -->
            <div v-if="session.break_started_at || session.status === 'on_break'" class="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              <span class="flex items-center gap-1"><Coffee class="w-3 h-3" /> Break Logged</span>
              <span>{{ session.break_started_at ? formatTime(session.break_started_at) : 'Active Break' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- VIEW B: ALL PUNCH LOGS TABLE (FLAT RAW LOGS)                 -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div v-else class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
      <div v-if="loading" class="p-16 flex justify-center items-center gap-3 text-slate-400 text-xs">
        <Loader2 class="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading attendance logs...</span>
      </div>

      <div v-else-if="filteredList.length === 0" class="p-16 text-center text-slate-500 dark:text-slate-400">
        <Clock class="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-1">No Attendance Records Found</h3>
        <p class="text-xs text-slate-500">Attendance punches recorded on the mobile app will appear here.</p>
      </div>

      <div v-else class="overflow-x-auto custom-scrollbar">
        <table class="w-full text-left text-xs whitespace-nowrap">
          <thead class="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
            <tr>
              <th class="px-5 py-3.5">Security Guard</th>
              <th class="px-4 py-3.5">Site / Estate</th>
              <th class="px-4 py-3.5">Check-In Time</th>
              <th class="px-4 py-3.5">Live Break State</th>
              <th class="px-4 py-3.5">Check-Out Time</th>
              <th class="px-4 py-3.5">Verification</th>
              <th class="px-4 py-3.5 text-center">Status</th>
              <th class="px-4 py-3.5 text-right">Source</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-white/5">
            <tr
              v-for="record in filteredList"
              :key="record.id"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <!-- Guard Identity -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-600">
                    {{ (record.guard_name || 'G')[0] }}
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white text-xs">{{ record.guard_name }}</h4>
                    <span class="text-[10px] text-slate-400 font-mono">{{ record.guard?.phone || 'No phone' }}</span>
                  </div>
                </div>
              </td>

              <!-- Site & Sector -->
              <td class="px-4 py-3.5">
                <span class="font-semibold text-slate-800 dark:text-slate-200">{{ record.site_name }}</span>
                <span v-if="record.zone_name" class="block text-[10px] text-slate-400">{{ record.zone_name }}</span>
              </td>

              <!-- Check-In Time -->
              <td class="px-4 py-3.5">
                <div v-if="record.check_in_time">
                  <span class="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {{ formatTime(record.check_in_time) }}
                  </span>
                  <span v-if="record.check_in_accuracy_m" class="block text-[10px] text-emerald-600 font-semibold">
                    GPS ±{{ record.check_in_accuracy_m }}m
                  </span>
                </div>
                <span v-else class="text-slate-400 italic">—</span>
              </td>

              <!-- Live Break State -->
              <td class="px-4 py-3.5">
                <div v-if="record.status === 'on_break' || record.live_status === 'on_break'"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold"
                >
                  <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                  On Break
                </div>
                <div v-else-if="record.status === 'present' || record.live_status === 'checked_in'"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold"
                >
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  On Duty
                </div>
                <span v-else class="text-slate-400 text-[10px]">Off Duty</span>
              </td>

              <!-- Check-Out Time -->
              <td class="px-4 py-3.5">
                <span v-if="record.check_out_time" class="font-mono text-slate-800 dark:text-slate-200">
                  {{ formatTime(record.check_out_time) }}
                </span>
                <span v-else class="text-slate-400">—</span>
              </td>

              <!-- Verification Method Column -->
              <td class="px-4 py-3.5">
                <div v-if="record.verification_mode === 'face_ai'" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold shadow-sm">
                  <ScanFace class="w-3 h-3" />
                  <span>Face AI {{ record.confidence_score ? `(${record.confidence_score}%)` : '' }}</span>
                </div>
                <div v-else-if="record.verification_mode === 'nfc'" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-[10px] font-bold">
                  <Radio class="w-3 h-3" />
                  <span>NFC Badge</span>
                </div>
                <div v-else class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium">
                  <UserCheck class="w-3 h-3" />
                  <span>Manual / Pin</span>
                </div>
              </td>

              <!-- Status Badge -->
              <td class="px-4 py-3.5 text-center">
                <span
                  class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                  :class="getStatusBadgeClass(record.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(record.status)" />
                  {{ record.status ? record.status.replace('_', ' ') : 'Present' }}
                </span>
              </td>

              <!-- Mobile Source Badge -->
              <td class="px-4 py-3.5 text-right">
                <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  <Smartphone class="w-3 h-3 text-indigo-500" />
                  Mobile App
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- AUDIT MODAL: DETAILED PUNCH SESSIONS TIMELINE                -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="showAuditModal && selectedGuardAudit"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
        @click.self="showAuditModal = false"
      >
        <div class="w-full max-w-lg bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {{ selectedGuardAudit.guardName[0] }}
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">{{ selectedGuardAudit.guardName }}</h3>
                <p class="text-xs text-slate-500">Mobile Punch Audit Trail &bull; {{ selectedGuardAudit.sessions.length }} Total Sessions</p>
              </div>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showAuditModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Timeline Sessions List -->
          <div class="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
            <div
              v-for="(session, sIdx) in selectedGuardAudit.sessions"
              :key="session.id"
              class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 space-y-2.5"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-slate-800 dark:text-slate-200">Session #{{ sIdx + 1 }}</span>
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full" :class="session.check_out_time ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'">
                  {{ session.check_out_time ? 'Checked Out' : 'Active Duty' }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span class="text-[10px] font-bold text-slate-400 block uppercase">Check-In</span>
                  <span class="font-mono font-bold">{{ formatTime(session.check_in_time) }}</span>
                </div>
                <div>
                  <span class="text-[10px] font-bold text-slate-400 block uppercase">Check-Out</span>
                  <span class="font-mono font-bold">{{ formatTime(session.check_out_time) || 'In Progress' }}</span>
                </div>
              </div>

              <div class="text-[11px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                <span>Verification: <strong>{{ session.verification_mode || 'Manual' }}</strong></span>
                <span>Site: <strong>{{ session.site_name || 'Main Site' }}</strong></span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-end">
            <button class="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer" @click="showAuditModal = false">
              Close Audit Trail
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  Clock, RefreshCw, Download, Users, Check, X,
  Search, ScanFace, Radio, UserCheck, Loader2,
  Coffee, History, ListFilter, Smartphone
} from 'lucide-vue-next';
import { attendanceService } from '@/services/attendanceService';
import { siteService } from '@/services/siteService';
import FeatureGate from '@/components/common/FeatureGate.vue';

// State
const loading = ref(false);
const attendanceList = ref([]);
const sitesList = ref([]);
const viewMode = ref('grouped'); // 'grouped' (by person) or 'flat' (all punches)

const stats = ref({
  totalGuards: 0,
  onDuty: 0,
  offDuty: 0,
  late: 0,
  absent: 0,
  complianceRate: 100
});

const statusFilter = ref('all');
const selectedSiteFilter = ref('');
const searchQuery = ref('');

const showAuditModal = ref(false);
const selectedGuardAudit = ref(null);

let pollInterval = null;
let _pollLocked = false;

// Normalize status
const normalizeStatus = (r) => {
  const ls = r.live_status;
  if (ls === 'on_break' || r.status === 'on_break') return 'on_break';
  if (ls === 'checked_out' || r.status === 'off_duty' || r.check_out_time) return 'off_duty';
  if (ls === 'checked_in' || r.status === 'present' || r.check_in_time) return 'present';
  return r.status || 'absent';
};

const statusFilterLabel = (st) => {
  const labels = { all: 'All Guards', present: 'On Duty', on_break: 'On Break', off_duty: 'Off Duty', absent: 'Absent' };
  return labels[st] || st.replace('_', ' ');
};

// Flat list filter
const filteredList = computed(() => {
  let list = attendanceList.value;
  if (statusFilter.value !== 'all') {
    list = list.filter(r => normalizeStatus(r) === statusFilter.value);
  }
  if (selectedSiteFilter.value) {
    list = list.filter(r => String(r.site?.id || r.site) === String(selectedSiteFilter.value));
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(r => 
      (r.guard_name || '').toLowerCase().includes(q) ||
      (r.guard?.phone || '').includes(q) ||
      (r.site_name || '').toLowerCase().includes(q)
    );
  }
  return list;
});

// ── GROUPED BY EMPLOYEE (MULTI-SESSION MODEL) ─────────────────────────────────
const groupedGuards = computed(() => {
  const map = {};

  attendanceList.value.forEach(record => {
    // Determine unique guard identifier
    const guardKey = String(record.guard?.assignedUser?.id || record.guard?.id || record.guard_name || record.guard || 'Unknown');
    if (!map[guardKey]) {
      map[guardKey] = {
        guardKey,
        guardName: record.guard_name || 'Security Guard',
        phone: record.guard?.phone || record.phone || 'No phone',
        siteName: record.site_name || 'Main Site',
        sessions: [],
        currentStatus: 'off_duty',
        activeSession: null
      };
    }

    map[guardKey].sessions.push(record);
  });

  // Determine current status & active session for each guard
  const result = Object.values(map).map(group => {
    // Sort sessions chronologically (oldest to newest)
    group.sessions.sort((a, b) => new Date(a.check_in_time || a.date_created) - new Date(b.check_in_time || b.date_created));

    // Find any open session (no check-out time)
    const openSession = group.sessions.find(s => !s.check_out_time);
    if (openSession) {
      group.activeSession = openSession;
      group.currentStatus = normalizeStatus(openSession);
    } else {
      const lastSession = group.sessions[group.sessions.length - 1];
      group.activeSession = null;
      group.currentStatus = lastSession ? normalizeStatus(lastSession) : 'off_duty';
    }

    return group;
  });

  // Apply filters to grouped result
  return result.filter(g => {
    if (statusFilter.value !== 'all' && g.currentStatus !== statusFilter.value) return false;
    if (selectedSiteFilter.value && !g.sessions.some(s => String(s.site?.id || s.site) === String(selectedSiteFilter.value))) return false;
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      return g.guardName.toLowerCase().includes(q) || g.phone.includes(q) || g.siteName.toLowerCase().includes(q);
    }
    return true;
  });
});

// Aggregate Counts
const uniqueGuardsCount = computed(() => Object.keys(groupedGuards.value).length);
const activeGuardsCount = computed(() => groupedGuards.value.filter(g => g.currentStatus === 'present').length);
const onBreakCount = computed(() => groupedGuards.value.filter(g => g.currentStatus === 'on_break').length);
const offDutyCount = computed(() => groupedGuards.value.filter(g => g.currentStatus === 'off_duty').length);

const formatTime = (isoString) => {
  if (!isoString) return '';
  if (typeof isoString === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(isoString.trim())) {
    const parts = isoString.trim().split(':');
    const d = new Date();
    d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2] || 0, 10));
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return isoString;
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'present':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30';
    case 'late':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30';
    case 'absent':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30';
    case 'on_break':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30';
    case 'off_duty':
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  }
};

const getStatusDotClass = (status) => {
  switch (status) {
    case 'present': return 'bg-emerald-500';
    case 'late': return 'bg-amber-500';
    case 'absent': return 'bg-rose-500';
    case 'on_break': return 'bg-amber-400 animate-pulse';
    default: return 'bg-slate-400';
  }
};

// Data Loading
const loadAttendanceData = async (silent = false) => {
  if (silent && _pollLocked) return;
  if (silent) _pollLocked = true;
  if (!silent) loading.value = true;
  try {
    const [att, st, sites] = await Promise.all([
      attendanceService.getTodayAttendance(),
      attendanceService.getAttendanceStats(),
      siteService.fetchSites()
    ]);
    attendanceList.value = att || [];
    stats.value = st || stats.value;
    if (sites && sites.length > 0) {
      sitesList.value = sites;
    }
  } catch (error) {
    console.error("Error loading attendance data:", error);
  } finally {
    if (!silent) loading.value = false;
  }
};

const openAuditModal = (guardGroup) => {
  selectedGuardAudit.value = guardGroup;
  showAuditModal.value = true;
};

const exportCSV = () => {
  const headers = ['Guard Name', 'Phone', 'Site', 'Zone', 'Check-In', 'Check-Out', 'Status'];
  const rows = filteredList.value.map(r => [
    r.guard_name,
    r.guard?.phone || '',
    r.site_name,
    r.zone_name || '',
    r.check_in_time || '',
    r.check_out_time || '',
    r.status
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `guard_attendance_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(async () => {
  await loadAttendanceData();
  pollInterval = setInterval(async () => {
    if (_pollLocked) return;
    _pollLocked = true;
    try {
      await loadAttendanceData(true);
    } finally {
      _pollLocked = false;
    }
  }, 10000); // 10s auto-refresh from mobile app punches
});

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.3);
  border-radius: 99px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 116, 139, 0.5);
}
</style>
