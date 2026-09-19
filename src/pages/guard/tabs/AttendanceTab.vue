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
            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5">
              <Radio class="w-3 h-3 text-emerald-500 animate-pulse" />
              Biometric & Device Sync Live
            </span>
          </div>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            Real-time live status tracking & multi-session punch telemetry recorded via Biometric Hardware Terminals & Access Devices
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
        <!-- Total Roster Guards -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Total Roster</span>
          <p class="text-xl font-black text-slate-900 dark:text-white mt-1">
            {{ totalRosterCount }} <span class="text-[10px] text-slate-400 font-normal">Guards</span>
          </p>
        </div>

        <!-- Total Active Guards -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 border-l-4 border-l-emerald-500 rounded-xl p-3.5 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">On Duty (Active)</span>
          <p class="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {{ activeGuardsCount }} <span class="text-[10px] text-slate-400 font-normal">Guards</span>
          </p>
        </div>

        <!-- On Break Guards -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 border-l-4 border-l-amber-500 rounded-xl p-3.5 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">On Break</span>
          <p class="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {{ onBreakCount }}
          </p>
        </div>

        <!-- Total Punches (Multi-session) -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 border-l-4 border-l-indigo-500 rounded-xl p-3.5 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Total Punches</span>
          <p class="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {{ totalPunchesCount }} <span class="text-[10px] text-slate-400 font-normal">Sessions</span>
          </p>
        </div>

        <!-- Off Duty Guards -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Off Duty</span>
          <p class="text-xl font-black text-slate-900 dark:text-white mt-1">
            {{ offDutyCount }}
          </p>
        </div>

        <!-- Daily Roster Compliance % -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase block">Compliance</span>
          <p class="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {{ complianceRate }}%
          </p>
        </div>
      </div>
    </FeatureGate>

    <!-- Toolbar: View Switcher, Site Filter, Status Filters, Search -->
    <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-3.5 rounded-2xl shadow-sm">
      <div class="flex items-center gap-2 flex-wrap">
        <!-- View Mode Switcher -->
        <div class="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            :class="viewMode === 'grouped' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
            @click="viewMode = 'grouped'"
          >
            <Users class="w-3.5 h-3.5" />
            <span>Grouped by Guard (Multi-Session)</span>
          </button>
          <button
            class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            :class="viewMode === 'flat' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
            @click="viewMode = 'flat'"
          >
            <ListFilter class="w-3.5 h-3.5" />
            <span>All Punch Logs ({{ totalPunchesCount }})</span>
          </button>
        </div>

        <!-- Status Filter Pills -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold overflow-x-auto">
          <button
            v-for="st in ['all', 'present', 'on_break', 'off_duty', 'absent']"
            :key="st"
            class="px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap"
            :class="statusFilter === st ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
            @click="statusFilter = st"
          >
            {{ statusFilterLabel(st) }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <!-- Site Selector Filter -->
        <select
          v-model="selectedSiteFilter"
          class="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="">All Sites</option>
          <option v-for="site in sitesList" :key="site.id" :value="site.id">
            {{ site.name || site.locName }}
          </option>
        </select>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="relative">
      <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search guard name, phone, employee ID, site..."
        class="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151c2c] text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
      />
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- VIEW A: GROUPED BY EMPLOYEE (MULTI-SESSION VIEW)             -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div v-if="viewMode === 'grouped'" class="space-y-3.5">
      <div v-if="loading" class="p-16 flex justify-center items-center gap-3 text-slate-400 text-xs bg-white dark:bg-[#151c2c] rounded-2xl border border-slate-200 dark:border-white/10">
        <Loader2 class="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading attendance & device telemetry records...</span>
      </div>

      <div v-else-if="groupedGuards.length === 0" class="p-16 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-[#151c2c] rounded-2xl border border-slate-200 dark:border-white/10">
        <Users class="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-1">No Guards In Roster</h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">Register security officers under the Guard Team tab to monitor their live device and biometric check-ins.</p>
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
            <div class="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center font-black text-sm text-indigo-700 dark:text-indigo-300 shadow-sm shrink-0 overflow-hidden">
              <img v-if="guardGroup.avatar" :src="getAvatarUrl(guardGroup.avatar)" class="w-full h-full object-cover" />
              <span v-else>{{ (guardGroup.guardName || 'G')[0]?.toUpperCase() }}</span>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-black text-sm text-slate-900 dark:text-white">{{ guardGroup.guardName }}</h3>
                <span v-if="guardGroup.employeeId" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {{ guardGroup.employeeId }}
                </span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {{ guardGroup.sessions.length }} {{ guardGroup.sessions.length === 1 ? 'Session' : 'Sessions Today' }}
                </span>
                <span v-if="guardGroup.sessions.length > 0" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                  <Radio class="w-2.5 h-2.5 text-emerald-500 animate-pulse" /> Device Live
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 font-medium">
                <span>{{ guardGroup.phone }}</span>
                <span>&bull;</span>
                <span class="text-slate-700 dark:text-slate-300 font-semibold">{{ guardGroup.siteName }}</span>
              </p>
            </div>
          </div>

          <!-- Live Status Indicator & Audit Action Controls -->
          <div class="flex items-center gap-2.5 flex-wrap">
            <!-- Current Live Status Badge -->
            <span
              class="text-xs font-extrabold uppercase px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm"
              :class="getStatusBadgeClass(guardGroup.currentStatus)"
            >
              <span class="w-2 h-2 rounded-full" :class="getStatusDotClass(guardGroup.currentStatus)" />
              {{ statusDisplayLabel(guardGroup.currentStatus) }}
            </span>

            <!-- Audit History Details Button -->
            <button
              v-if="guardGroup.sessions.length > 0"
              class="h-8 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="View full device punch timeline"
              @click="openAuditModal(guardGroup)"
            >
              <History class="w-3.5 h-3.5 text-indigo-500" />
              <span>Timeline</span>
            </button>
          </div>
        </div>

        <!-- Middle Row: Sessions Timeline Breakdown OR Awaiting Device Punch Notice -->
        <div v-if="guardGroup.sessions.length === 0" class="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-3 text-xs">
          <Clock class="w-4 h-4 text-slate-400 shrink-0" />
          <span class="text-slate-500 dark:text-slate-400">
            Awaiting physical device check-in (Biometric Terminal / Face ID / Access Gate). Guard is currently <strong>Not Checked In (Absent)</strong>.
          </span>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

            <!-- Verification Method Tag -->
            <div class="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-500">
              <span>Source: <strong>{{ session.device_name || session.verification_mode || 'Access Device' }}</strong></span>
              <span v-if="session.break_started_at || session.status === 'on_break'" class="text-amber-600 font-bold flex items-center gap-1">
                <Coffee class="w-3 h-3" /> Break
              </span>
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
        <p class="text-xs text-slate-500">Attendance punches recorded on devices and the mobile app will appear here.</p>
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
              <th class="px-4 py-3.5 text-right">Device / Source</th>
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
                  <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-600 overflow-hidden">
                    <img v-if="record.avatar" :src="getAvatarUrl(record.avatar)" class="w-full h-full object-cover" />
                    <span v-else>{{ (record.guard_name || 'G')[0]?.toUpperCase() }}</span>
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white text-xs">{{ record.guard_name }}</h4>
                    <span class="text-[10px] text-slate-400 font-mono">{{ record.guard?.phone || record.phone || 'No phone' }}</span>
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
                  <span>{{ record.verification_mode === 'biometric_device' ? 'Biometric Device' : 'Manual / PIN' }}</span>
                </div>
              </td>

              <!-- Status Badge -->
              <td class="px-4 py-3.5 text-center">
                <span
                  class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                  :class="getStatusBadgeClass(record.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(record.status)" />
                  {{ statusDisplayLabel(record.status) }}
                </span>
              </td>

              <!-- Device / Source Badge -->
              <td class="px-4 py-3.5 text-right">
                <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  <Smartphone class="w-3 h-3 text-indigo-500" />
                  {{ record.device_name || 'Device' }}
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
                {{ (selectedGuardAudit.guardName || 'G')[0]?.toUpperCase() }}
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">{{ selectedGuardAudit.guardName }}</h3>
                <p class="text-xs text-slate-500">Punch Audit Trail &bull; {{ selectedGuardAudit.sessions.length }} Total Sessions</p>
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
                <span>Verification: <strong>{{ session.verification_mode || 'Face Device / App' }}</strong></span>
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
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { mqttService } from '@/services/mqttService';
import FeatureGate from '@/components/common/FeatureGate.vue';

// State
const loading = ref(false);
const attendanceList = ref([]);
const sitesList = ref([]);
const guardRoster = ref([]);
const viewMode = ref('grouped'); // 'grouped' (by person) or 'flat' (all punches)

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
  const labels = {
    all: `All Guards (${totalRosterCount.value})`,
    present: `On Duty (${activeGuardsCount.value})`,
    on_break: `On Break (${onBreakCount.value})`,
    off_duty: `Off Duty (${offDutyCount.value})`,
    absent: `Not Checked In (${absentCount.value})`
  };
  return labels[st] || st.replace('_', ' ');
};

const statusDisplayLabel = (st) => {
  const labels = {
    present: 'On Duty',
    on_break: 'On Break',
    off_duty: 'Off Duty',
    absent: 'Not Checked In',
    late: 'Late'
  };
  return labels[st] || (st ? st.replace('_', ' ') : 'Not Checked In');
};

const getAvatarUrl = (avatarId) => {
  if (!avatarId) return '';
  if (typeof avatarId === 'string' && (avatarId.startsWith('data:') || avatarId.startsWith('http') || avatarId.startsWith('blob:'))) {
    return avatarId;
  }
  const token = authService.getToken();
  const apiUrl = import.meta.env.VITE_API_URL;
  return `${apiUrl}/assets/${avatarId}?access_token=${token}&width=100&height=100&fit=cover`;
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
      (r.guard?.phone || r.phone || '').includes(q) ||
      (r.site_name || '').toLowerCase().includes(q)
    );
  }
  return list;
});

// ── GROUPED BY EMPLOYEE (FULL ROSTER + MULTI-SESSION MODEL) ──────────────────────
const groupedGuards = computed(() => {
  const map = {};

  // 1. Initialize with all registered guards in the tenant roster
  guardRoster.value.forEach(g => {
    const key = String(g.id);
    map[key] = {
      guardKey: key,
      guardId: g.id,
      guardName: g.name,
      employeeId: g.employee_id || '',
      phone: g.phone || 'No phone',
      siteName: g.assigned_site_name || 'All Sites',
      avatar: g.avatar || null,
      sessions: [],
      currentStatus: 'absent',
      activeSession: null
    };
  });

  // 2. Attach recorded punches
  attendanceList.value.forEach(record => {
    const rawGuardId = record.guard?.assignedUser?.id || record.guard?.id || (typeof record.guard === 'object' ? record.guard?.id : record.guard);
    const recEmpId = record.employee_id || record.guard?.employeeId || record.employeeId || record.guard?.id;
    const recPmId = record.personalModuleId || record.guard?.personalModuleId;
    const recPhone = (record.phone || record.guard?.phone || '').replace(/\D/g, '');
    const recName = (record.guard_name || '').toLowerCase().trim();

    // Comprehensive multi-factor guard matching
    let matchedGuard = guardRoster.value.find(g => {
      // 1. Match Direct User ID
      if (rawGuardId && String(g.id) === String(rawGuardId)) return true;
      
      // 2. Match Personal Module ID
      if (recPmId && g.personalModuleId && String(g.personalModuleId) === String(recPmId)) return true;
      if (rawGuardId && g.personalModuleId && String(g.personalModuleId) === String(rawGuardId)) return true;

      // 3. Match Employee ID (e.g. GRD-42786 or numeric 42786)
      if (recEmpId && g.employee_id) {
        if (String(g.employee_id).toLowerCase() === String(recEmpId).toLowerCase()) return true;
        const cleanG = String(g.employee_id).replace(/\D/g, '');
        const cleanR = String(recEmpId).replace(/\D/g, '');
        if (cleanG && cleanR && (cleanG === cleanR || cleanG.endsWith(cleanR) || cleanR.endsWith(cleanG))) return true;
      }

      // 4. Match Phone number (last 7+ digits)
      if (recPhone && recPhone.length >= 7 && g.phone) {
        const cleanPhone = String(g.phone).replace(/\D/g, '');
        if (cleanPhone && (cleanPhone.endsWith(recPhone) || recPhone.endsWith(cleanPhone))) return true;
      }

      // 5. Match Guard Full Name
      if (recName && recName !== 'security guard' && !recName.startsWith('guard #')) {
        const gName = (g.name || '').toLowerCase().trim();
        if (gName === recName || gName.includes(recName) || recName.includes(gName)) return true;
      }

      return false;
    });

    let guardKey = matchedGuard ? String(matchedGuard.id) : (rawGuardId ? String(rawGuardId) : null);

    if (!guardKey || !map[guardKey]) {
      guardKey = guardKey || String(record.guard_name || record.id || Math.random());
      map[guardKey] = {
        guardKey,
        guardId: rawGuardId || null,
        guardName: record.guard_name || 'Security Guard',
        employeeId: recEmpId || '',
        phone: record.guard?.phone || record.phone || 'No phone',
        siteName: record.site_name || 'Device Gate',
        avatar: null,
        sessions: [],
        currentStatus: 'off_duty',
        activeSession: null
      };
    }

    map[guardKey].sessions.push(record);
    if (record.site_name && (map[guardKey].siteName === 'All Sites' || !map[guardKey].siteName)) {
      map[guardKey].siteName = record.site_name;
    }
  });

  const result = Object.values(map).map(group => {
    const uniqueSessions = [];
    group.sessions.forEach(s => {
      const isDup = uniqueSessions.some(u => 
        (u.id && s.id && u.id === s.id) ||
        (u.check_in_time && s.check_in_time && u.check_in_time === s.check_in_time && u.check_out_time === s.check_out_time)
      );
      if (!isDup) uniqueSessions.push(s);
    });
    group.sessions = uniqueSessions;

    if (group.sessions.length > 0) {
      group.sessions.sort((a, b) => new Date(a.check_in_time || a.date_created) - new Date(b.check_in_time || b.date_created));
      const openSession = group.sessions.find(s => !s.check_out_time && s.check_in_time);
      if (openSession) {
        group.activeSession = openSession;
        group.currentStatus = normalizeStatus(openSession);
      } else {
        const lastSession = group.sessions[group.sessions.length - 1];
        group.activeSession = null;
        group.currentStatus = lastSession ? normalizeStatus(lastSession) : 'off_duty';
      }
    } else {
      group.currentStatus = 'absent';
      group.activeSession = null;
    }

    return group;
  });

  return result.filter(g => {
    if (statusFilter.value !== 'all' && g.currentStatus !== statusFilter.value) return false;
    if (selectedSiteFilter.value && !g.sessions.some(s => String(s.site?.id || s.site) === String(selectedSiteFilter.value))) return false;
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      return (
        g.guardName.toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        (g.employeeId || '').toLowerCase().includes(q) ||
        g.siteName.toLowerCase().includes(q)
      );
    }
    return true;
  });
});

// Aggregate Counts
const totalRosterCount = computed(() => Math.max(guardRoster.value.length, Object.keys(groupedGuards.value).length));
const activeGuardsCount = computed(() => groupedGuards.value.filter(g => g.currentStatus === 'present').length);
const onBreakCount = computed(() => groupedGuards.value.filter(g => g.currentStatus === 'on_break').length);
const offDutyCount = computed(() => groupedGuards.value.filter(g => g.currentStatus === 'off_duty').length);
const absentCount = computed(() => groupedGuards.value.filter(g => g.currentStatus === 'absent').length);
const totalPunchesCount = computed(() => attendanceList.value.length);
const complianceRate = computed(() => {
  const total = totalRosterCount.value;
  if (total === 0) return 100;
  const presentOrWorked = activeGuardsCount.value + onBreakCount.value + offDutyCount.value;
  return Math.min(100, Math.round((presentOrWorked / total) * 100));
});

const formatTime = (isoString) => {
  if (!isoString) return '';
  const str = String(isoString).trim();
  if (!str || str === '00:00:00' || str === '00:00' || str.endsWith('T00:00:00') || str.endsWith('T00:00:00.000Z') || str.endsWith(' 00:00:00')) {
    return '';
  }
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(str)) {
    const parts = str.split(':');
    const d = new Date();
    d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2] || 0, 10));
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  try {
    let parseStr = str;
    if (parseStr.includes('T') && !parseStr.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(parseStr)) {
      parseStr += 'Z';
    } else if (parseStr.includes(' ') && !parseStr.includes('T')) {
      parseStr = parseStr.replace(' ', 'T') + (parseStr.endsWith('Z') ? '' : 'Z');
    }

    const d = new Date(parseStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const dRaw = new Date(str);
    return isNaN(dRaw.getTime()) ? str : dRaw.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return str;
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

// Supervisor Manual Punch
const handleManualPunch = async (guardGroup) => {
  try {
    loading.value = true;
    if (guardGroup.currentStatus === 'present' || guardGroup.currentStatus === 'on_break') {
      const openSess = guardGroup.activeSession || guardGroup.sessions?.[guardGroup.sessions.length - 1];
      if (openSess?.id) {
        await attendanceService.checkOut(openSess.id);
      }
    } else {
      const targetGuard = guardGroup.guardId || guardGroup.guardKey;
      const targetSite = sitesList.value[0]?.id || null;
      await attendanceService.checkIn(targetGuard, targetSite);
    }
    await loadAttendanceData();
  } catch (err) {
    console.error('Manual punch error:', err);
  } finally {
    loading.value = false;
  }
};

// Data Loading
const loadAttendanceData = async (silent = false) => {
  if (silent && _pollLocked) return;
  _pollLocked = true;
  if (!silent) loading.value = true;
  try {
    const token = authService.getToken();
    let tenantId = authService.getTenantId();
    if (!tenantId) {
      try { tenantId = await currentUserTenant.getTenantIdAsync(); } catch (_) {}
    }
    const tenantData = authService.getTenantData();
    const tenantIdStr = tenantData?.tenantId;
    const tenantIdPk = tenantData?.id;
    const apiUrl = import.meta.env.VITE_API_URL;

    const validTenantSet = new Set(
      [tenantId, tenantIdStr, tenantIdPk].filter(Boolean).map(String)
    );

    // Fetch full guard roster for this tenant (excluding Admin/Owner accounts)
    const currentUserId = authService.getUserId?.() || authService.getUserData?.()?.id;
    const myRole = (authService.getUserRole?.() || '').toLowerCase();
    const rosterMap = new Map();

    if (token && validTenantSet.size > 0) {
      for (const tid of Array.from(validTenantSet)) {
        try {
          const uRes = await fetch(`${apiUrl}/users?filter[tenant][_eq]=${tid}&fields[]=id&fields[]=first_name&fields[]=last_name&fields[]=phone&fields[]=email&fields[]=title&fields[]=role.name&fields[]=avatar&limit=500`, { headers: { Authorization: `Bearer ${token}` } });
          if (uRes.ok) {
            const uData = await uRes.json();
            if (Array.isArray(uData.data)) {
              for (const u of uData.data) {
                const roleName = (u.role?.name || '').toLowerCase();
                // Exclude system accounts, administrators, owners
                if (roleName.includes('admin') || roleName.includes('administrator') || roleName.includes('owner') || roleName.includes('public')) continue;
                if (currentUserId && String(u.id) === String(currentUserId) && (myRole.includes('admin') || myRole.includes('owner'))) continue;
                if (u.email && (u.email.includes('admin@') || u.email.startsWith('admin_'))) continue;

                if (!rosterMap.has(String(u.id))) {
                  const lName = (u.last_name && u.last_name !== '-') ? u.last_name : '';
                  rosterMap.set(String(u.id), {
                    id: u.id,
                    name: `${u.first_name || ''} ${lName}`.trim() || u.phone || u.email || 'Guard',
                    first_name: u.first_name || '',
                    last_name: u.last_name || '',
                    phone: u.phone || 'No phone',
                    email: u.email || '',
                    avatar: u.avatar || null,
                    employee_id: u.title || `GRD-${u.id}`
                  });
                }
              }
            }
          }
        } catch (_) {}
      }
    }

    // Step 2: Enrich guard roster with personalModule (employeeId & personalModuleId)
    if (rosterMap.size > 0 && token) {
      try {
        const uIds = Array.from(rosterMap.keys()).filter(Boolean).join(',');
        const pmRes = await fetch(`${apiUrl}/items/personalModule?filter[assignedUser][_in]=${uIds}&fields[]=id&fields[]=employeeId&fields[]=assignedUser`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (pmRes.ok) {
          const pmJson = await pmRes.json();
          (pmJson.data || []).forEach(pm => {
            const uId = String(pm.assignedUser);
            if (rosterMap.has(uId)) {
              const guard = rosterMap.get(uId);
              guard.personalModuleId = pm.id;
              if (pm.employeeId) {
                guard.employee_id = pm.employeeId;
              }
            }
          });
        }
      } catch (_) {}
    }
    guardRoster.value = Array.from(rosterMap.values());

    const [att, sites] = await Promise.all([
      attendanceService.getTodayAttendance(),
      siteService.fetchSites()
    ]);
    attendanceList.value = att || [];
    stats.value = attendanceService.calculateStats(att || []) || stats.value;
    sitesList.value = sites || [];
  } catch (error) {
    console.error("Error loading attendance data:", error);
  } finally {
    if (!silent) loading.value = false;
    _pollLocked = false;
  }
};

const openAuditModal = (guardGroup) => {
  selectedGuardAudit.value = guardGroup;
  showAuditModal.value = true;
};

const exportCSV = () => {
  const headers = ['Guard Name', 'Phone', 'Site', 'First Check-In', 'Last Check-Out', 'Total Sessions', 'Current Status'];
  const rows = groupedGuards.value.map(g => {
    const firstSession = g.sessions?.[0];
    const lastSession = g.sessions?.[g.sessions.length - 1];
    return [
      `"${g.guardName || 'Guard'}"`,
      `"${g.phone || ''}"`,
      `"${g.siteName || ''}"`,
      `"${firstSession?.check_in_time ? formatTime(firstSession.check_in_time) : ''}"`,
      `"${lastSession?.check_out_time ? formatTime(lastSession.check_out_time) : ''}"`,
      `"${g.sessions?.length || 0}"`,
      `"${(g.currentStatus || 'off_duty').toUpperCase()}"`
    ];
  });
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `guard_attendance_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

let _attTabUnsubs = [];
let unsubMqttAttendance = null;
let unsubMqttDevice = null;
let unsubMqttLoc1 = null;
let unsubMqttLoc2 = null;
let unsubMqttLoc3 = null;
let _debouncedMqttTimer = null;

const triggerDebouncedReload = () => {
  if (_debouncedMqttTimer) clearTimeout(_debouncedMqttTimer);
  _debouncedMqttTimer = setTimeout(() => {
    loadAttendanceData(true);
  }, 2500);
};

onMounted(async () => {
  await loadAttendanceData();

  // Instant real-time update on mobile punches / breaks / check-ins (debounced)
  try {
    mqttService.connect();
    // Canonical Contract Subscriptions
    const attMqttUnsubs = [];
    attMqttUnsubs.push(mqttService.on('accesseasy/+/sites/+/guards/+/location', triggerDebouncedReload));
    attMqttUnsubs.push(mqttService.on('accesseasy/+/patrols/+/checkpoints', triggerDebouncedReload));
    attMqttUnsubs.push(mqttService.on('accesseasy/+/patrols/+/status', triggerDebouncedReload));
    attMqttUnsubs.push(mqttService.on('accesseasy/+/devices/+/telemetry', triggerDebouncedReload));
    // Legacy fallback subscriptions
    attMqttUnsubs.push(mqttService.on('patrol/+/log', triggerDebouncedReload));
    attMqttUnsubs.push(mqttService.on('patrol/+/alert', triggerDebouncedReload));
    attMqttUnsubs.push(mqttService.on('fieldeasy_mobile/+/location', triggerDebouncedReload));
    attMqttUnsubs.push(mqttService.on('fieldeasy_mobile/+/+', triggerDebouncedReload));
    attMqttUnsubs.push(mqttService.on('device/fieldeasy_mobile/+/location', triggerDebouncedReload));
    _attTabUnsubs = attMqttUnsubs;
  } catch (_) {}

  pollInterval = setInterval(async () => {
    try {
      await loadAttendanceData(true);
    } catch (_) {}
  }, 15000); // 15s auto-refresh fallback
});

onUnmounted(() => {
  if (_debouncedMqttTimer) {
    clearTimeout(_debouncedMqttTimer);
    _debouncedMqttTimer = null;
  }
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  if (_attTabUnsubs) { _attTabUnsubs.forEach(u => typeof u === 'function' && u()); _attTabUnsubs = []; }
  if (typeof unsubMqttAttendance === 'function') unsubMqttAttendance();
  if (typeof unsubMqttDevice === 'function') unsubMqttDevice();
  if (typeof unsubMqttLoc1 === 'function') unsubMqttLoc1();
  if (typeof unsubMqttLoc2 === 'function') unsubMqttLoc2();
  if (typeof unsubMqttLoc3 === 'function') unsubMqttLoc3();
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
