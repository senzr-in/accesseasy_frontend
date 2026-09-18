<template>
  <div class="h-full flex flex-col gap-3.5 overflow-hidden animate-in pb-4 bg-slate-50/50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 rounded-2xl px-4 sm:px-6 pt-3.5 relative">
    
    <!-- Top Module Navigation Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
      <div class="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-2xl w-fit">
        <button
          type="button"
          @click="activeTab = 'roster'"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'roster'
              ? 'bg-white dark:bg-[#151c2c] text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <Users class="w-4 h-4" />
          <span>Guard Roster</span>
          <span 
            class="text-[10px] font-mono px-2 py-0.5 rounded-full" 
            :class="activeTab === 'roster' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-slate-300/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300'"
          >
            {{ items.length }}
          </span>
        </button>

        <button
          type="button"
          @click="activeTab = 'attendance'"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'attendance'
              ? 'bg-white dark:bg-[#151c2c] text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <Clock class="w-4 h-4" />
          <span>Live Attendance</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'shifts'"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'shifts'
              ? 'bg-white dark:bg-[#151c2c] text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <Calendar class="w-4 h-4" />
          <span>Shift Scheduler</span>
        </button>
      </div>

      <!-- Quick Actions for Guard Roster -->
      <div v-if="activeTab === 'roster'" class="flex items-center gap-2">
        <button
          type="button"
          class="h-9 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          @click="fetchGuards"
          :disabled="loading"
          title="Refresh Guards Roster"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span class="hidden sm:inline">Refresh</span>
        </button>

        <button
          type="button"
          class="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-600/20 hover:scale-102 cursor-pointer shrink-0"
          @click="openAddDialog"
        >
          <UserPlus class="w-3.5 h-3.5" />
          <span>+ Register Guard</span>
        </button>
      </div>
    </div>

    <!-- TAB 1: Guard Roster -->
    <template v-if="activeTab === 'roster'">

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex items-center justify-center py-24 flex-1 relative z-10"
      >
        <Loader2 class="w-8 h-8 animate-spin text-indigo-600" />
      </div>

      <!-- User-Friendly Onboarding Empty State (When 0 Guards) -->
      <div
        v-else-if="items.length === 0"
        class="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative z-10 max-w-4xl mx-auto my-auto overflow-y-auto custom-scrollbar"
      >
        <!-- Top Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-3 shadow-2xs">
          <ShieldCheck class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Security Personnel & Guard Tour Operations</span>
        </div>

        <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight text-center">
          Deploy Your Security Guard Force
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl text-center mt-1.5 mb-6 leading-relaxed">
          Enroll security officers to monitor patrols, verify NFC & QR checkpoints, detect delay exceptions, and record real-time incident reports on the mobile app.
        </p>

        <!-- Interactive Preview Mock Card & 3-Step Feature Cards in 2 columns -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 w-full mb-6 items-stretch text-left">
          
          <!-- Sample Officer Preview Hologram Card (Left 5 cols) -->
          <div class="md:col-span-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-indigo-950/20 dark:via-[#151c2c] dark:to-[#151c2c] p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[10px] font-mono font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-500/20 px-2 py-0.5 rounded-full">
                Officer Preview
              </span>
              <span class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ON DUTY
              </span>
            </div>

            <div class="flex items-center gap-3.5 my-2">
              <div class="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-600/25 shrink-0">
                RK
              </div>
              <div class="min-w-0">
                <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate">Rajesh Kumar</h4>
                <p class="text-[10px] font-mono text-slate-500">ID: GRD-0104 · Perimeter</p>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="inline-flex items-center gap-0.5 text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-200/50 dark:border-purple-500/20">
                    <ScanFace class="w-2.5 h-2.5" /> Face ID
                  </span>
                  <span class="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-200/50 dark:border-blue-500/20">
                    NFC Patrol Key
                  </span>
                </div>
              </div>
            </div>

            <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Mobile OTP Access</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-bold">✓ Enrolled & Ready</span>
            </div>
          </div>

          <!-- 3-Step Guidance Cards (Right 7 cols) -->
          <div class="md:col-span-7 flex flex-col justify-between gap-2.5">
            <div class="p-3 rounded-xl bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 shadow-2xs flex items-start gap-3">
              <div class="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center shrink-0">1</div>
              <div>
                <p class="text-xs font-bold text-slate-900 dark:text-white">Register Officer Details</p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Input the guard's name, mobile number, and employee badge code.</p>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 shadow-2xs flex items-start gap-3">
              <div class="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-black flex items-center justify-center shrink-0">2</div>
              <div>
                <p class="text-xs font-bold text-slate-900 dark:text-white">Automated Face Biometrics</p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Upload a photo to automatically generate a 192-d Face ID vector for mobile face check-in.</p>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 shadow-2xs flex items-start gap-3">
              <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center justify-center shrink-0">3</div>
              <div>
                <p class="text-xs font-bold text-slate-900 dark:text-white">Instant Mobile App Login</p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">The officer logs into the mobile app using their phone & SMS/Email OTP (no passwords needed).</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3 flex-wrap justify-center">
          <button
            type="button"
            class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all hover:scale-102 flex items-center gap-2 cursor-pointer"
            @click="openAddDialog"
          >
            <UserPlus class="w-4 h-4" />
            <span>+ Register Security Officer</span>
          </button>

          <button
            type="button"
            class="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            @click="loadDemoGuards"
          >
            <Sparkles class="w-4 h-4 text-amber-500" />
            <span>Load Sample Guards (Demo)</span>
          </button>
        </div>
      </div>

      <!-- Active Roster Content (When Guards Exist) -->
      <div v-else class="flex flex-col gap-3.5 flex-1 min-h-0 overflow-hidden">
        <!-- Real-time Operational Telemetry Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <!-- Total Guards -->
          <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xs flex items-center justify-between">
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
              <p class="text-lg font-black text-slate-900 dark:text-white mt-0.5">{{ items.length }}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users class="w-4 h-4" />
            </div>
          </div>

          <!-- On Duty Now -->
          <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xs flex items-center justify-between">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On Duty</p>
              </div>
              <p class="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{{ activeGuardsCount }}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck class="w-4 h-4" />
            </div>
          </div>

          <!-- On Break -->
          <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xs flex items-center justify-between">
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On Break</p>
              <p class="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">{{ breakGuardsCount }}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock class="w-4 h-4" />
            </div>
          </div>

          <!-- Face ID Enrolled -->
          <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xs flex items-center justify-between">
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Face ID Enrolled</p>
              <p class="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5">{{ biometricEnrolledCount }}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ScanFace class="w-4 h-4" />
            </div>
          </div>
        </div>

        <!-- Search, Filter & View Controls Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 shrink-0">
          <div class="flex items-center gap-2 flex-wrap flex-1">
            <!-- Search -->
            <div class="relative min-w-[200px] sm:w-72">
              <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search guards, badge ID, phone..."
                class="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <!-- Status Filter -->
            <select
              v-model="statusFilter"
              class="h-9 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses ({{ items.length }})</option>
              <option value="active">On Duty ({{ activeGuardsCount }})</option>
              <option value="break">On Break ({{ breakGuardsCount }})</option>
              <option value="off">Off Duty ({{ offDutyGuardsCount }})</option>
            </select>
          </div>

          <!-- View Switcher -->
          <div class="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shrink-0">
            <button
              type="button"
              class="p-1.5 rounded-lg transition-colors cursor-pointer"
              :class="viewMode === 'grid' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'"
              title="Grid View"
              @click="viewMode = 'grid'"
            >
              <LayoutGrid class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="p-1.5 rounded-lg transition-colors cursor-pointer"
              :class="viewMode === 'table' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'"
              title="List / Table View"
              @click="viewMode = 'table'"
            >
              <List class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- No Search Results Filter State -->
        <div
          v-if="filteredGuards.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center flex-1"
        >
          <Search class="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
          <p class="text-xs font-bold text-slate-700 dark:text-slate-300">No matching guards found</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Try adjusting your search query or status filter.</p>
          <button 
            type="button"
            class="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer" 
            @click="searchQuery = ''; statusFilter = 'all';"
          >
            Reset Filters
          </button>
        </div>

    <!-- Grid View -->
    <div
      v-else-if="viewMode === 'grid'"
      class="overflow-y-auto flex-1 custom-scrollbar relative z-10 pr-2"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
        <div
          v-for="guard in filteredGuards"
          :key="guard.id"
          @click="selectedGuard = guard"
          :class="[
            'group relative flex flex-col rounded-2xl p-4 border bg-white dark:bg-[#151c2c] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg overflow-hidden cursor-pointer',
            guard.status === 'active' ? 'border-emerald-200 dark:border-emerald-800/40 hover:border-emerald-400' :
            guard.status === 'break' ? 'border-blue-200 dark:border-blue-800/40 hover:border-blue-400' :
            'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          ]"
        >
          <!-- Status Dot (Top Right) -->
          <div class="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
            <span
              :class="[
                'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider',
                guard.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
                guard.status === 'break' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' :
                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              ]"
            >
              {{ guard.status === 'active' ? 'ON DUTY' : guard.status === 'break' ? 'BREAK' : 'OFF DUTY' }}
            </span>
          </div>

          <!-- Avatar & Identity -->
          <div class="relative z-10 flex flex-col items-center mt-1 mb-3">
            <div class="w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-sm mb-2 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xl relative">
              <img
                v-if="guard.facePhoto || guard.avatar"
                :src="getAvatarUrl(guard.facePhoto || guard.avatar)"
                :alt="guard.first_name"
                class="w-full h-full object-cover"
                @error="(e) => { guard.facePhoto = null; guard.avatar = null; }"
              >
              <span v-else>{{ guard.first_name?.charAt(0).toUpperCase() || 'G' }}</span>
            </div>

            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide text-center">
              {{ guard.first_name }} {{ guard.last_name }}
            </h3>
            
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.2 rounded">
                {{ guard.employee_id || guard.id.toString().substring(0, 8).toUpperCase() }}
              </span>
              <span v-if="guard.avatar || guard.facePhoto" class="inline-flex items-center gap-0.5 text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-1.5 py-0.2 rounded">
                <ScanFace class="w-2.5 h-2.5" /> Face ID
              </span>
            </div>
          </div>

          <!-- Details List -->
          <div class="relative z-10 space-y-2 flex-1 w-full px-1 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
            <!-- Contact Phone -->
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-400">Mobile</span>
              <a v-if="guard.phone" :href="`tel:${guard.phone}`" @click.stop class="font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1">
                <Phone class="w-3 h-3 text-slate-400" />
                <span>{{ guard.phone }}</span>
              </a>
              <span v-else class="text-slate-400 italic">Not set</span>
            </div>

            <!-- Assigned Zone -->
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-400">Zone</span>
              <div
                class="flex items-center gap-1 font-semibold truncate max-w-[140px]"
                :class="guard.assigned_zone_name ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 italic'"
                :title="guard.assigned_zone_name || 'Unassigned'"
              >
                <MapPin class="w-3 h-3 shrink-0" :class="guard.assigned_zone_name ? 'text-indigo-500' : 'text-slate-400'" />
                <span class="truncate">{{ guard.assigned_zone_name || 'Unassigned' }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Footer Status Cycle & Actions -->
          <div class="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between z-10" @click.stop>
            <button
              type="button"
              class="h-6 px-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Toggle Duty Status"
              @click="cycleStatus(guard)"
            >
              <RefreshCw class="w-2.5 h-2.5" />
              <span>Toggle Status</span>
            </button>

            <div class="flex items-center gap-1">
              <button
                type="button"
                title="Edit Guard"
                class="h-6 w-6 rounded-md flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
                @click="editGuard(guard)"
              >
                <Pencil class="w-3 h-3" />
              </button>
              <button
                type="button"
                title="Delete Guard"
                class="h-6 w-6 rounded-md flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                @click="deleteGuard(guard)"
              >
                <Trash2 class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div
      v-else-if="viewMode === 'table'"
      class="overflow-y-auto flex-1 custom-scrollbar relative z-10 pr-2"
    >
      <div class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#151c2c] shadow-2xs">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th class="py-3 px-4">Security Officer</th>
              <th class="py-3 px-4">Employee ID</th>
              <th class="py-3 px-4">Contact</th>
              <th class="py-3 px-4">Assigned Zone</th>
              <th class="py-3 px-4">Duty Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr 
              v-for="guard in filteredGuards" 
              :key="guard.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              @click="selectedGuard = guard"
            >
              <!-- Officer -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-sm shrink-0">
                    <img
                      v-if="guard.facePhoto || guard.avatar"
                      :src="getAvatarUrl(guard.facePhoto || guard.avatar)"
                      :alt="guard.first_name"
                      class="w-full h-full object-cover"
                      @error="guard.facePhoto = null; guard.avatar = null;"
                    />
                    <span v-else>{{ guard.first_name?.charAt(0).toUpperCase() || 'G' }}</span>
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 dark:text-white leading-tight">
                      {{ guard.first_name }} {{ guard.last_name }}
                    </p>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span v-if="guard.avatar || guard.facePhoto" class="inline-flex items-center gap-0.5 text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-1.5 py-0.2 rounded">
                        <ScanFace class="w-2.5 h-2.5" /> Face ID Enrolled
                      </span>
                      <span v-else class="text-[9px] text-slate-400">No Biometrics</span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- ID -->
              <td class="py-3 px-4 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {{ guard.employee_id || guard.id.toString().substring(0, 8).toUpperCase() }}
              </td>

              <!-- Contact -->
              <td class="py-3 px-4">
                <div class="space-y-0.5">
                  <a v-if="guard.phone" :href="`tel:${guard.phone}`" @click.stop class="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1">
                    <Phone class="w-3 h-3 text-slate-400" />
                    <span>{{ guard.phone }}</span>
                  </a>
                  <span v-else class="text-[11px] text-slate-400">No phone</span>
                  <a v-if="guard.email && !guard.email.includes('@accesseasy.app')" :href="`mailto:${guard.email}`" @click.stop class="text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1">
                    <Mail class="w-3 h-3 text-slate-400" />
                    <span class="truncate max-w-[140px]">{{ guard.email }}</span>
                  </a>
                </div>
              </td>

              <!-- Zone -->
              <td class="py-3 px-4">
                <span 
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  :class="guard.assigned_zone_name ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'text-slate-400 italic'"
                >
                  <MapPin class="w-3 h-3" :class="guard.assigned_zone_name ? 'text-indigo-500' : 'text-slate-400'" />
                  <span>{{ guard.assigned_zone_name || 'Unassigned' }}</span>
                </span>
              </td>

              <!-- Status -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <span
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                    :class="[
                      guard.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                      guard.status === 'break' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    ]"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="guard.status === 'active' ? 'bg-emerald-500' : guard.status === 'break' ? 'bg-blue-500' : 'bg-slate-400'"></span>
                    {{ guard.status === 'active' ? 'ON DUTY' : guard.status === 'break' ? 'ON BREAK' : 'OFF DUTY' }}
                  </span>
                  <button
                    type="button"
                    class="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                    title="Toggle Duty Status"
                    @click.stop="cycleStatus(guard)"
                  >
                    <RefreshCw class="w-3 h-3" />
                  </button>
                </div>
              </td>

              <!-- Actions -->
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5" @click.stop>
                  <button
                    type="button"
                    class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Edit Officer"
                    @click="editGuard(guard)"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    class="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Delete Officer"
                    @click="deleteGuard(guard)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
    </template>

    <!-- TAB 2: Live Attendance -->
    <div v-else-if="activeTab === 'attendance'" class="flex-1 overflow-y-auto custom-scrollbar">
      <AttendanceTab />
    </div>

    <!-- TAB 3: Shift Scheduler -->
    <div v-else-if="activeTab === 'shifts'" class="flex-1 overflow-y-auto custom-scrollbar">
      <ShiftScheduler />
    </div>

    <!-- Guard Details Modal -->
    <Teleport to="body">
      <div
        v-if="selectedGuard"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in"
        @click="selectedGuard = null"
      >
        <div
          class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800"
          @click.stop
        >
          <div class="h-24 bg-gradient-to-r from-indigo-500 to-emerald-500 relative">
            <button
              class="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              @click="editGuard(selectedGuard)"
              title="Edit Guard"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              @click="selectedGuard = null"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          
          <div class="px-6 pb-6 pt-0 relative flex flex-col items-center text-center">
            <div class="w-20 h-20 rounded-full border-4 border-white dark:border-slate-900 overflow-hidden bg-slate-100 -mt-10 mb-3 shadow-sm flex items-center justify-center text-slate-500 text-2xl font-bold z-10">
              <button
                v-if="selectedGuard.avatar"
                @click.stop="previewImage = getAvatarUrl(selectedGuard.avatar).replace('&width=100&height=100&fit=cover', '')"
                title="View Full Photo"
                class="w-full h-full block cursor-pointer bg-transparent border-0 p-0 m-0"
              >
                <img
                  :src="getAvatarUrl(selectedGuard.avatar)"
                  class="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  @error="selectedGuard.avatar = null"
                >
              </button>
              <span v-else>{{ selectedGuard.first_name?.charAt(0).toUpperCase() || 'G' }}</span>
            </div>
            
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">
              {{ selectedGuard.first_name }} {{ selectedGuard.last_name }}
            </h2>
            <p class="text-xs text-slate-500 font-medium mb-4">
              ID: {{ selectedGuard.employee_id || selectedGuard.id.toString().substring(0, 8).toUpperCase() }}
            </p>

            <div class="w-full grid grid-cols-2 gap-3 mb-6">
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                <p
                  class="text-xs font-bold"
                  :class="selectedGuard.status === 'active' ? 'text-emerald-600' : selectedGuard.status === 'break' ? 'text-blue-600' : 'text-slate-600'"
                >
                  {{ selectedGuard.status === 'active' ? 'ON DUTY' : selectedGuard.status === 'break' ? 'BREAK' : 'OFF DUTY' }}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Zone</p>
                <p class="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                  {{ selectedGuard.assigned_zone_name || 'Unassigned' }}
                </p>
              </div>
            </div>

            <div class="w-full space-y-2 text-left">
              <component
                :is="selectedGuard.phone ? 'a' : 'div'"
                :href="selectedGuard.phone ? `tel:${selectedGuard.phone}` : undefined"
                class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                :class="{ 'cursor-pointer': selectedGuard.phone }"
              >
                <div class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Phone class="w-4 h-4" />
                </div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400">Phone</p>
                  <p class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ selectedGuard.phone || 'No phone provided' }}</p>
                </div>
              </component>

              <component
                :is="selectedGuard.email ? 'a' : 'div'"
                :href="selectedGuard.email ? `mailto:${selectedGuard.email}` : undefined"
                class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                :class="{ 'cursor-pointer': selectedGuard.email }"
              >
                <div class="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Mail class="w-4 h-4" />
                </div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400">Email</p>
                  <p class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ selectedGuard.email || 'No email provided' }}</p>
                </div>
              </component>
            </div>

          </div>
        </div>
      </div>
    </Teleport>

    <!-- Image Preview Modal -->
    <Teleport to="body">
      <div 
        v-if="previewImage" 
        class="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 animate-in zoom-in-95 duration-200"
        @click="previewImage = null"
      >
        <button class="absolute top-4 right-4 text-white hover:text-slate-300">
          <X class="w-8 h-8" />
        </button>
        <img :src="previewImage" class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" @click.stop />
      </div>
    </Teleport>

    <!-- Add Guard Modal -->
    <Teleport to="body">
      <div
        v-if="showAddDialog"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto"
      >
      <div class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700 flex flex-col my-auto">
        <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
            {{ editingGuard ? 'Edit Guard' : 'Add Guard' }}
          </h3>
          <button
            class="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"
            @click="showAddDialog = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <div ref="modalScrollContainer" class="p-5 space-y-5 text-left max-h-[70vh] overflow-y-auto custom-scrollbar">
          <!-- Modern Styled Error Alert Banner -->
          <div
            v-if="formError"
            class="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm"
          >
            <AlertCircle class="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div class="flex-1 text-xs leading-relaxed">
              <p class="font-bold text-rose-900 dark:text-rose-100 mb-0.5">{{ formError.title || 'Unable to Save Guard' }}</p>
              <p class="text-rose-700 dark:text-rose-300 font-medium">{{ formError.message }}</p>
            </div>
            <button
              type="button"
              class="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 transition-colors p-1 cursor-pointer"
              @click="formError = null"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <div class="flex flex-col items-center justify-center gap-3">
            <div class="relative">
              <div
                class="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-500 transition-colors group"
                @click="triggerFileUpload"
              >
                <img
                  v-if="form.avatarPreview"
                  :src="form.avatarPreview"
                  class="w-full h-full object-cover"
                >
                <img
                  v-else-if="editingGuard?.avatar && !form.removeAvatar"
                  :src="getAvatarUrl(editingGuard.avatar)"
                  class="w-full h-full object-cover"
                  @error="editingGuard.avatar = null"
                >
                <div
                  v-else
                  class="text-slate-400 group-hover:text-emerald-500 flex flex-col items-center"
                >
                  <Camera class="w-6 h-6 mb-1" />
                  <span class="text-[8px] uppercase font-bold tracking-widest">Upload</span>
                </div>
                <div
                  v-if="form.avatarPreview || (editingGuard?.avatar && !form.removeAvatar)"
                  class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera class="w-6 h-6 text-white" />
                </div>
              </div>
              
              <button
                v-if="form.avatarPreview || (editingGuard?.avatar && !form.removeAvatar)"
                class="absolute top-0 right-0 w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors z-10 translate-x-1 -translate-y-1"
                @click.stop="form.removeAvatar = true; form.avatarFile = null; form.avatarPreview = null"
                title="Remove Photo"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              accept="image/*"
              @change="onFileChange"
            >
            <div class="text-center flex flex-col items-center mt-1.5">
              <div class="flex items-center gap-1.5">
                <p class="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                  Guard Photo & Biometrics
                </p>
                <span
                  v-if="form.avatarPreview || (editingGuard?.avatar && !form.removeAvatar)"
                  class="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[8px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                >
                  <CheckCircle2 class="w-2.5 h-2.5" /> Enrolled
                </span>
              </div>
              <p class="text-[9px] text-slate-400 mt-0.5">
                Uploaded photo automatically enrolls 192-d face biometrics for mobile Face ID recognition
              </p>
            </div>
          </div>

          <!-- Employee ID -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Employee ID</label>
            <input
              v-model="form.employee_id"
              type="text"
              placeholder="e.g. GRD-001"
              class="w-full h-9 px-3 rounded-md border text-sm focus:outline-none focus:ring-2 transition-all shadow-sm"
              :class="fieldErrors.employee_id ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-slate-100' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-emerald-500/20 focus:border-emerald-500'"
              @input="delete fieldErrors.employee_id; if (formError?.field === 'employee_id') formError = null;"
            >
            <p v-if="fieldErrors.employee_id" class="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 mt-1">
              <AlertCircle class="w-3 h-3" /> {{ fieldErrors.employee_id }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">First Name *</label>
              <input
                v-model="form.first_name"
                type="text"
                placeholder="John"
                class="w-full h-9 px-3 rounded-md border text-sm focus:outline-none focus:ring-2 transition-all shadow-sm"
                :class="fieldErrors.first_name ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-slate-100' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-emerald-500/20 focus:border-emerald-500'"
                @input="delete fieldErrors.first_name; if (formError?.field === 'first_name') formError = null;"
              >
              <p v-if="fieldErrors.first_name" class="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 mt-1">
                <AlertCircle class="w-3 h-3" /> {{ fieldErrors.first_name }}
              </p>
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Last Name</label>
              <input
                v-model="form.last_name"
                type="text"
                placeholder="Doe"
                class="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 shadow-sm focus:border-emerald-500 transition-all"
              >
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email Address</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="guard@example.com"
              class="w-full h-9 px-3 rounded-md border text-sm focus:outline-none focus:ring-2 transition-all shadow-sm"
              :class="fieldErrors.email ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-slate-100' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-emerald-500/20 focus:border-emerald-500'"
              @input="delete fieldErrors.email; if (formError?.field === 'email') formError = null;"
            >
            <p v-if="fieldErrors.email" class="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 mt-1">
              <AlertCircle class="w-3 h-3" /> {{ fieldErrors.email }}
            </p>
          </div>

          <!-- Mobile Number with Country Code Dropdown -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Mobile Number *</label>
            <div class="flex gap-2">
              <select
                v-model="form.country_code"
                class="w-28 h-9 px-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm shrink-0"
              >
                <option v-for="c in countryCodes" :key="c.code" :value="c.code">
                  {{ c.flag }} {{ c.code }}
                </option>
              </select>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="10-digit number"
                class="flex-1 h-9 px-3 rounded-md border text-sm focus:outline-none focus:ring-2 transition-all shadow-sm"
                :class="fieldErrors.phone ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-slate-100' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-emerald-500/20 focus:border-emerald-500'"
                @input="delete fieldErrors.phone; if (formError?.field === 'phone') formError = null;"
              >
            </div>
            <p v-if="fieldErrors.phone" class="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 mt-1">
              <AlertCircle class="w-3 h-3" /> {{ fieldErrors.phone }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Guard Role Selector -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Guard Role *</label>
              <select
                v-model="form.role_id"
                class="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 shadow-sm focus:border-emerald-500 transition-all"
              >
                <option v-for="r in availableRoles" :key="r.id" :value="r.id">
                  {{ r.roleName }}
                </option>
              </select>
            </div>

            <!-- Assigned Site Selector -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Assigned Site</label>
              <select
                v-model="form.site_id"
                class="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 shadow-sm focus:border-emerald-500 transition-all"
              >
                <option :value="null">All Sites / Unassigned</option>
                <option v-for="s in sites" :key="s.id" :value="s.id">
                  {{ s.locName || s.name || s.branchName || `Site ${s.id}` }}
                </option>
              </select>
            </div>
          </div>

          <!-- Assigned Security Zone -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Assigned Zone</label>
            <select
              v-model="form.assigned_door"
              class="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-slate-100 shadow-sm focus:border-emerald-500 transition-all"
            >
              <option :value="null">
                Unassigned
              </option>
              <option
                v-for="zone in availableZones"
                :key="zone.id"
                :value="zone.id"
              >
                {{ zone.zoneName || zone.name || zone.doorName || `Zone ${zone.id}` }}
              </option>
            </select>
          </div>

          <!-- Share Login Link via Email Option -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label class="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                v-model="form.send_login_link"
                type="checkbox"
                class="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
              >
              <div>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Mail class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Share Login Link & App Access via Email
                </span>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Sends onboarding instructions and one-click login link to the officer's email.
                </p>
              </div>
            </label>
          </div>

          <div
            v-if="!editingGuard"
            class="pt-2 border-t border-slate-100 dark:border-slate-700"
          >
            <p class="text-[9px] text-slate-500 dark:text-slate-400 font-semibold mb-2">
              Guards login on mobile using their mobile number (or email) and OTP.
            </p>
          </div>
        </div>
        <div class="p-5 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button
            class="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 transition-colors"
            @click="showAddDialog = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center"
            :disabled="saving"
            @click="saveGuard"
          >
            <Loader2
              v-if="saving"
              class="w-4 h-4 animate-spin mr-2 inline"
            />
            Save Guard
          </button>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- Image Preview Modal -->
    <Teleport to="body">
      <div
        v-if="previewImage"
        class="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        @click="previewImage = null"
      >
        <div class="relative max-w-xl max-h-[90vh] bg-transparent flex flex-col items-center">
          <img :src="previewImage" class="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain border border-white/20">
          <button
            class="mt-4 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors"
            @click="previewImage = null"
          >
            Close Preview
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Message Guard Modal -->
    <GuardMessageModal 
      v-model:show="showMessageModal"
      :guard="selectedGuardForMessage"
      @sent="handleMessageSent"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmDeleteModal
      :show="showDeleteModal"
      title="Delete Guard"
      confirmMessage="Are you sure you want to delete this guard?"
      itemLabel="Guard Name"
      :itemName="guardToDelete ? `${guardToDelete.first_name} ${guardToDelete.last_name}` : ''"
      description="This action cannot be undone and will remove the guard's access."
      :deleting="isDeleting"
      @close="showDeleteModal = false; guardToDelete = null;"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import { 
  Users, UserPlus, Phone, Mail, FileText, ChevronRight, CheckCircle2, 
  Clock, AlertTriangle, AlertCircle, Search, Filter, MoreVertical, X, Shield, ShieldCheck, History, MapPin, Edit, ArrowLeft, MessageSquare, Pencil, Trash2, Camera, Loader2, RefreshCw, ScanFace, Calendar,
  LayoutGrid, List, Sparkles
} from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { biometricService } from '@/services/biometricService';
import { siteService } from '@/services/siteService';
import { zoneService } from '@/services/zoneService';
import GuardMessageModal from '@/components/guard/GuardMessageModal.vue';
import ConfirmDeleteModal from '@/components/common/modals/ConfirmDeleteModal.vue';
import AttendanceTab from '@/pages/guard/tabs/AttendanceTab.vue';
import ShiftScheduler from '@/pages/settings/shifts/ShiftScheduler.vue';

const route = useRoute();
const activeTab = ref(route.query.tab === 'attendance' ? 'attendance' : route.query.tab === 'shifts' ? 'shifts' : 'roster');

watch(() => route.query.tab, (newTab) => {
  if (newTab === 'attendance' || newTab === 'shifts' || newTab === 'roster') {
    activeTab.value = newTab;
  }
});

// View mode, search & filter controls
const searchQuery = ref('');
const statusFilter = ref('all');
const viewMode = ref('grid'); // 'grid' | 'table'

// Computed operational metrics
const activeGuardsCount = computed(() => items.value.filter(g => g.status === 'active').length);
const breakGuardsCount = computed(() => items.value.filter(g => g.status === 'break').length);
const offDutyGuardsCount = computed(() => items.value.filter(g => g.status !== 'active' && g.status !== 'break').length);
const biometricEnrolledCount = computed(() => items.value.filter(g => g.avatar || g.facePhoto).length);

// Filtered guards computed
const filteredGuards = computed(() => {
  return items.value.filter(g => {
    // Status filter
    if (statusFilter.value !== 'all') {
      if (statusFilter.value === 'active' && g.status !== 'active') return false;
      if (statusFilter.value === 'break' && g.status !== 'break') return false;
      if (statusFilter.value === 'off' && (g.status === 'active' || g.status === 'break')) return false;
    }
    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const fullName = `${g.first_name || ''} ${g.last_name || ''}`.toLowerCase();
      const empId = (g.employee_id || '').toLowerCase();
      const phone = (g.phone || '').toLowerCase();
      const zone = (g.assigned_zone_name || '').toLowerCase();
      if (!fullName.includes(q) && !empId.includes(q) && !phone.includes(q) && !zone.includes(q)) {
        return false;
      }
    }
    return true;
  });
});

const apiUrl = import.meta.env.VITE_API_URL;
const loading = ref(false);
const saving = ref(false);
const selectedGuard = ref(null);
const previewImage = ref(null);
const showAddDialog = ref(false);
const showDeleteModal = ref(null);
const guardToDelete = ref(null);
const isDeleting = ref(false);
const editingGuard = ref(null);
const doors = ref([]);
const sites = ref([]);
const zones = ref([]);
const fileInput = ref(null);
const modalScrollContainer = ref(null);
const formError = ref(null);
const fieldErrors = ref({});

const parseDirectusError = (errorData) => {
  const err = errorData?.errors?.[0];
  if (!err) {
    return {
      title: 'Failed to Save Guard',
      message: 'An unexpected server error occurred. Please verify all details and try again.'
    };
  }

  const code = err.extensions?.code || '';
  const field = err.extensions?.field || '';
  const message = err.message || '';

  // 1. Duplicate email check
  if (
    field === 'email' || 
    (code === 'RECORD_NOT_UNIQUE' && /email/i.test(message)) ||
    /field "email".*unique/i.test(message) ||
    /email.*already exists/i.test(message)
  ) {
    return {
      field: 'email',
      title: 'Email Address Already In Use',
      message: `The email address "${form.value.email}" is already registered to another account. Please use a different email address.`
    };
  }

  // 2. Duplicate phone check
  if (
    field === 'phone' ||
    (code === 'RECORD_NOT_UNIQUE' && /phone/i.test(message)) ||
    /field "phone".*unique/i.test(message) ||
    /phone.*already exists/i.test(message)
  ) {
    return {
      field: 'phone',
      title: 'Mobile Number Already Registered',
      message: `The mobile number "${form.value.phone}" is already associated with an existing account.`
    };
  }

  // 3. Duplicate employee ID check
  if (
    field === 'employeeId' ||
    (code === 'RECORD_NOT_UNIQUE' && /employeeId/i.test(message)) ||
    /employeeId.*unique/i.test(message)
  ) {
    return {
      field: 'employee_id',
      title: 'Employee ID Already Taken',
      message: `The Employee ID "${form.value.employee_id}" is already assigned to another guard.`
    };
  }

  // 4. Invalid foreign key
  if (code === 'INVALID_FOREIGN_KEY' || /foreign key/i.test(message)) {
    return {
      field: 'site_id',
      title: 'Invalid Assignment Reference',
      message: 'The selected site or location reference is invalid. Please select another site.'
    };
  }

  // Clean raw Directus technical schema noise for display
  const cleanedMessage = message
    .replace(/in collection "[^"]*"/gi, '')
    .replace(/for field "[^"]*"/gi, '')
    .replace(/Value "\[(.*?)\]"/gi, '$1')
    .trim();

  return {
    title: 'Validation Notice',
    message: cleanedMessage || 'Please review the entered information and try again.'
  };
};

const availableZones = computed(() => {
  if (zones.value.length > 0) {
    if (form.value.site_id) {
      const filtered = zones.value.filter(z => !z.site || z.site == form.value.site_id || z.siteId == form.value.site_id);
      return filtered.length > 0 ? filtered : zones.value;
    }
    return zones.value;
  }
  return doors.value;
});



const countryCodes = [
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India (+91)' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'USA (+1)' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'UK (+44)' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE (+971)' },
  { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia (+966)' },
  { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore (+65)' },
  { code: '+60', country: 'MY', flag: '🇲🇾', name: 'Malaysia (+60)' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia (+61)' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany (+49)' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France (+33)' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan (+81)' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria (+234)' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa (+27)' },
];

const availableRoles = ref([
  { id: 4940, roleName: 'Security Guard' },
  { id: 4941, roleName: 'Head Guard' },
  { id: 4942, roleName: 'Patrol Supervisor' },
]);

const form = ref({ 
  employee_id: '',
  first_name: '', 
  last_name: '', 
  email: '', 
  country_code: '+91',
  phone: '',
  role_id: 4940,
  site_id: null,
  assigned_door: null,
  send_login_link: true,
  avatarFile: null,
  avatarPreview: null,
  removeAvatar: false
});
const items = ref([]);
const guardRoleId = ref(null);

const loadDemoGuards = () => {
  items.value = [
    {
      id: 'demo-1',
      first_name: 'Rajesh',
      last_name: 'Kumar',
      email: 'rajesh.kumar@securityops.io',
      phone: '+91 98765 43210',
      status: 'active',
      employee_id: 'GRD-0104',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      facePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      assigned_zone_name: 'Main Gate & Perimeter',
      role_name: 'Patrol Supervisor'
    },
    {
      id: 'demo-2',
      first_name: 'Amit',
      last_name: 'Sharma',
      email: 'amit.sharma@securityops.io',
      phone: '+91 98123 45678',
      status: 'active',
      employee_id: 'GRD-0105',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      facePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      assigned_zone_name: 'Tower B Lobby',
      role_name: 'Security Guard'
    },
    {
      id: 'demo-3',
      first_name: 'Priya',
      last_name: 'Nair',
      email: 'priya.nair@securityops.io',
      phone: '+91 99456 78901',
      status: 'break',
      employee_id: 'GRD-0108',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      facePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      assigned_zone_name: 'Control Room / CCTV',
      role_name: 'Head Guard'
    },
    {
      id: 'demo-4',
      first_name: 'Vikram',
      last_name: 'Singh',
      email: 'vikram.singh@securityops.io',
      phone: '+91 97234 56789',
      status: 'suspended',
      employee_id: 'GRD-0112',
      avatar: null,
      facePhoto: null,
      assigned_zone_name: 'Basement Parking B2',
      role_name: 'Security Guard'
    }
  ];
};

const showMessageModal = ref(false);
const selectedGuardForMessage = ref(null);

const openMessageModal = (guard) => {
  selectedGuardForMessage.value = guard;
  showMessageModal.value = true;
};

const handleMessageSent = () => {
  console.log('Message sent successfully.');
};

const cycleStatus = async (guard) => {
  const cycle = { active: 'suspended', suspended: 'active' };
  // For break status, go to active; otherwise cycle active ↔ suspended
  const nextStatus = guard.status === 'break' ? 'active' : (cycle[guard.status] || 'active');
  try {
    const token = authService.getToken();
    const res = await fetch(`${apiUrl}/users/${guard.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: nextStatus })
    });
    if (res.ok) {
      guard.status = nextStatus;
    } else {
      const err = await res.json();
      alert('Failed to update status: ' + (err.errors?.[0]?.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Status update error', err);
    alert('Failed to update guard status.');
  }
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  form.value.avatarFile = file;
  form.value.avatarPreview = URL.createObjectURL(file);
};

const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const getAvatarUrl = (avatarId) => {
  if (!avatarId) return '';
  if (typeof avatarId === 'string' && (avatarId.startsWith('data:image/') || avatarId.startsWith('http://') || avatarId.startsWith('https://') || avatarId.startsWith('blob:'))) {
    return avatarId;
  }
  const token = authService.getToken();
  return `${apiUrl}/assets/${avatarId}?access_token=${token}&width=100&height=100&fit=cover`;
};

const openAddDialog = () => {
  editingGuard.value = null;
  formError.value = null;
  fieldErrors.value = {};
  form.value = { 
    employee_id: `GRD-${Date.now().toString().slice(-5)}`,
    first_name: '', 
    last_name: '', 
    email: '', 
    country_code: '+91',
    phone: '',
    role_id: guardRoleId.value || availableRoles.value[0]?.id || null,
    site_id: sites.value[0]?.id || null,
    send_login_link: true,
    assigned_door: null,
    avatarFile: null,
    avatarPreview: null,
    removeAvatar: false
  };
  showAddDialog.value = true;
};

const editGuard = async (guard) => {
  selectedGuard.value = null;
  editingGuard.value = guard;
  formError.value = null;
  fieldErrors.value = {};
  
  // Extract country code if present (e.g. +91, +1, +44)
  let matchedCode = '+91';
  let cleanPhone = guard.phone || '';
  for (const c of countryCodes) {
    if (cleanPhone.startsWith(c.code)) {
      matchedCode = c.code;
      cleanPhone = cleanPhone.slice(c.code.length);
      break;
    }
  }

  form.value = {
    employee_id: guard.employee_id || '',
    first_name: guard.first_name || '',
    last_name: guard.last_name || '',
    email: (guard.email && !guard.email.includes('@accesseasy.app')) ? guard.email : '',
    country_code: matchedCode,
    phone: cleanPhone,
    role_id: guard.accesseasyRole?.id || guard.accesseasyRole || availableRoles.value[0]?.id || guardRoleId.value || null,
    site_id: null,
    send_login_link: false,
    assigned_door: null,
    avatarFile: null,
    avatarPreview: null,
    removeAvatar: false
  };
  showAddDialog.value = true;
  
  try {
    const token = authService.getToken();
    const pmRes = await fetch(`${apiUrl}/items/personalModule?filter[assignedUser][_eq]=${guard.id}&fields[]=id&fields[]=employeeId&fields[]=assigned_door&fields[]=branchLocation`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (pmRes.ok) {
        const pmData = await pmRes.json();
        if (pmData.data && pmData.data.length > 0) {
            const pm = pmData.data[0];
            form.value.assigned_door = typeof pm.assigned_door === 'object' && pm.assigned_door !== null ? pm.assigned_door.id || pm.assigned_door : pm.assigned_door;
            form.value.site_id = typeof pm.branchLocation === 'object' && pm.branchLocation !== null ? pm.branchLocation.id || pm.branchLocation : pm.branchLocation;
            if (pm.employeeId) {
              form.value.employee_id = pm.employeeId;
            }
            editingGuard.value.personalModuleId = pm.id;
        }
    }
  } catch(err) {
      console.error('Failed to fetch guard personal info:', err);
  }
};

const deleteGuard = (guard) => {
  guardToDelete.value = guard;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!guardToDelete.value) return;
  isDeleting.value = true;
  try {
    const token = authService.getToken();
    const guardId = guardToDelete.value.id;

    // 1. Delete associated personalModule record if it exists to prevent foreign key constraint block
    try {
      const pmRes = await fetch(`${apiUrl}/items/personalModule?filter[assignedUser][_eq]=${guardId}&fields[]=id`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (pmRes.ok) {
        const pmData = await pmRes.json();
        if (pmData.data && Array.isArray(pmData.data) && pmData.data.length > 0) {
          for (const pm of pmData.data) {
            await fetch(`${apiUrl}/items/personalModule/${pm.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            }).catch(() => {});
          }
        }
      }
    } catch (_) {}

    // 2. Delete user account from Directus users
    const res = await fetch(`${apiUrl}/users/${guardId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok || res.status === 204 || res.status === 200) {
      items.value = items.value.filter(g => String(g.id) !== String(guardId));
      if (selectedGuard.value && String(selectedGuard.value.id) === String(guardId)) {
        selectedGuard.value = null;
      }
    } else {
      // If hard delete was blocked by foreign key constraints (e.g. past patrol logs), archive the guard
      await fetch(`${apiUrl}/users/${guardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'archived' })
      }).catch(() => {});
      items.value = items.value.filter(g => String(g.id) !== String(guardId));
    }

    await fetchGuards();
    showDeleteModal.value = false;
    guardToDelete.value = null;
  } catch (err) {
    console.error('Delete error', err);
    alert('Failed to delete guard. Please try again.');
  } finally {
    isDeleting.value = false;
  }
};

const fetchSitesAndZones = async () => {
  try {
    const [fetchedSites, fetchedZones] = await Promise.all([
      siteService.fetchSites().catch(() => []),
      zoneService.fetchZones().catch(() => [])
    ]);
    sites.value = fetchedSites || [];
    zones.value = fetchedZones || [];
  } catch (err) {
    console.error('Failed to fetch sites/zones:', err);
  }
  await fetchDoors();
};

const fetchDoors = async () => {
  try {
    const token = authService.getToken();
    if (!token || !authService.isAuthenticated()) return;
    let tenantId = authService.getTenantId();
    if (!tenantId) {
      try { tenantId = await currentUserTenant.getTenantIdAsync(); } catch (_) {}
    }
    if (!tenantId) {
      doors.value = [];
      return;
    }
    
    // Strictly isolate doors to current tenant only
    const res = await fetch(`${apiUrl}/items/doors?filter[tenant][_eq]=${tenantId}&filter[status][_neq]=archived&fields[]=id&fields[]=doorName`, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json();
      doors.value = data.data || [];
    } else {
      doors.value = [];
    }
  } catch (err) {
    console.error('Failed to fetch doors:', err);
    doors.value = [];
  }
};

const filterAndDeduplicateRoles = (rawRoles) => {
  if (!Array.isArray(rawRoles) || rawRoles.length === 0) return [];
  
  // Non-security / cross-product roles to exclude
  const excludedKeywords = [
    'crm', 'sales', 'marketing', 'field force', 'field_force',
    'lead', 'campaign', 'telecall', 'ticket', 'pipeline', 'deal', 'agent'
  ];

  const seenNames = new Set();
  const filtered = [];

  for (const r of rawRoles) {
    if (!r || !r.roleName) continue;
    const nameTrimmed = r.roleName.trim();
    const nameLower = nameTrimmed.toLowerCase();
    
    // Skip non-security roles
    if (excludedKeywords.some(k => nameLower.includes(k))) continue;

    // Deduplicate by case-insensitive name
    if (!seenNames.has(nameLower)) {
      seenNames.add(nameLower);
      const displayName = nameTrimmed.charAt(0).toUpperCase() + nameTrimmed.slice(1);
      filtered.push({
        id: r.id,
        roleName: displayName,
        rawName: nameLower
      });
    }
  }

  // Fallback if all roles got filtered out
  if (filtered.length === 0) {
    for (const r of rawRoles) {
      if (!r || !r.roleName) continue;
      const nameTrimmed = r.roleName.trim();
      const nameLower = nameTrimmed.toLowerCase();
      if (!seenNames.has(nameLower)) {
        seenNames.add(nameLower);
        filtered.push({
          id: r.id,
          roleName: nameTrimmed.charAt(0).toUpperCase() + nameTrimmed.slice(1),
          rawName: nameLower
        });
      }
    }
  }

  // Priority sorting: Guard/Security/Patrol first, Supervisor second, Officer third, Manager fourth, Admin fifth, others
  filtered.sort((a, b) => {
    const getScore = (name) => {
      if (name.includes('guard') || name.includes('patrol') || name.includes('security')) return 1;
      if (name.includes('supervisor')) return 2;
      if (name.includes('officer')) return 3;
      if (name.includes('manager')) return 4;
      if (name.includes('admin')) return 5;
      return 6;
    };
    return getScore(a.rawName) - getScore(b.rawName);
  });

  return filtered;
};

const fetchGuardRoleId = async () => {
  try {
    const token = authService.getToken();
    if (!token || !authService.isAuthenticated()) return null;
    let tenantId = authService.getTenantId();
    if (!tenantId) {
      try { tenantId = await currentUserTenant.getTenantIdAsync(); } catch (_) {}
    }
    if (!tenantId) return null;
    
    let res = null;
    // 1. First try fetching tenant roles specifically filtered for patrol within this tenant
    res = await fetch(
      `${apiUrl}/items/roleConfigurator?filter[_and][0][tenant][_eq]=${tenantId}&filter[_and][1][accessType][_in]=patrol,accesseasy_patrol&fields[]=id&fields[]=roleName`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).catch(() => null);

    // 2. Fallback to general roles for this tenant
    if (!res || !res.ok) {
      res = await fetch(
        `${apiUrl}/items/roleConfigurator?filter[tenant][_eq]=${tenantId}&fields[]=id&fields[]=roleName`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => null);
    }

    // 3. Fallback only to global system template roles (tenant is null/empty) - never another tenant's roles
    if (!res || !res.ok) {
      res = await fetch(
        `${apiUrl}/items/roleConfigurator?filter[tenant][_null]=true&limit=50&fields[]=id&fields[]=roleName`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => null);
    }
    if (res && res.ok) {
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        const cleanRoles = filterAndDeduplicateRoles(data.data);
        availableRoles.value = cleanRoles;
        const guardRole = cleanRoles.find(r => /guard|security|patrol|officer/i.test(r.roleName)) || cleanRoles[0];
        if (guardRole) {
          guardRoleId.value = guardRole.id;
          if (!form.value.role_id) {
            form.value.role_id = guardRole.id;
          }
          return guardRole.id;
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch guard role ID:', err);
  }
  return null;
};

const fetchGuards = async () => {
  const token = authService.getToken();
  if (!token || !authService.isAuthenticated()) return;
  loading.value = true;
  try {
    let tenantId = authService.getTenantId();
    if (!tenantId) {
      try { tenantId = await currentUserTenant.getTenantIdAsync(); } catch (_) {}
    }
    const tenantData = authService.getTenantData();
    const tenantIdStr = tenantData?.tenantId;
    const tenantIdPk = tenantData?.id;

    // Collect all valid representations of the current tenant
    const validTenantSet = new Set(
      [tenantId, tenantIdStr, tenantIdPk].filter(Boolean).map(String)
    );

    if (validTenantSet.size === 0) {
      console.warn('[fetchGuards] No tenant ID found for active user');
      items.value = [];
      loading.value = false;
      return;
    }

    const guardsMap = new Map(); // key: userId -> guard object

    // Helper to verify tenant match
    const belongsToCurrentTenant = (entityTenant) => {
      if (!entityTenant) return false;
      if (typeof entityTenant === 'string' || typeof entityTenant === 'number') {
        return validTenantSet.has(String(entityTenant));
      }
      const tId = entityTenant.tenantId;
      const id = entityTenant.id;
      return (tId && validTenantSet.has(String(tId))) || (id && validTenantSet.has(String(id)));
    };

    // 1. Fetch users for current tenant (Directus foreign-key equality filter without relational traversal)
    const userFieldList = [
      'id', 'first_name', 'last_name', 'email', 'phone', 'status', 'title', 'avatar', 'role.name', 'tenant'
    ].map(f => `fields[]=${f}`).join('&');

    const candidateTids = Array.from(validTenantSet);
    for (const tid of candidateTids) {
      try {
        const usersUrl = `${apiUrl}/users?filter[tenant][_eq]=${tid}&${userFieldList}&limit=500`;
        const usersRes = await fetch(usersUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (Array.isArray(usersData.data)) {
            for (const u of usersData.data) {
              const uid = String(u.id);
              if (belongsToCurrentTenant(u.tenant) || validTenantSet.has(String(u.tenant))) {
                if (!guardsMap.has(uid)) {
                  guardsMap.set(uid, {
                    id: u.id,
                    first_name: u.first_name || '',
                    last_name: u.last_name || '',
                    email: u.email || '',
                    phone: u.phone || '',
                    status: u.status || 'active',
                    employee_id: u.title || null,
                    avatar: u.avatar || null,
                    assigned_zone_name: null,
                    personalModuleId: null,
                    tenant: u.tenant,
                    _roleSystemName: (u.role?.name || u.title || '').toLowerCase()
                  });
                }
              }
            }
          }
        }
      } catch (usersErr) {
        console.warn('[fetchGuards] users query notice:', usersErr);
      }
    }

    // 2. Enrich with personalModule data via authorized assignedUser filter (avoids tenant-level 403)
    const userIds = Array.from(guardsMap.keys());
    if (userIds.length > 0) {
      try {
        const pmUrl = `${apiUrl}/items/personalModule?filter[assignedUser][_in]=${userIds.join(',')}&fields[]=id&fields[]=assignedUser&fields[]=employeeId&fields[]=assigned_door.doorName&limit=500`;
        const pmRes = await fetch(pmUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (pmRes.ok) {
          const pmData = await pmRes.json();
          if (Array.isArray(pmData.data)) {
            for (const pm of pmData.data) {
              const uid = String(pm.assignedUser?.id || pm.assignedUser);
              const target = guardsMap.get(uid);
              if (target) {
                target.personalModuleId = pm.id;
                target.employee_id = target.employee_id || pm.employeeId;
                target.assigned_zone_name = pm.assigned_door?.doorName || target.assigned_zone_name;
              }
            }
          }
        }
      } catch (pmErr) {
        console.warn('[fetchGuards] personalModule enrichment notice:', pmErr);
      }
    }

    // STRICT MULTI-TENANT ISOLATION:
    // Never run an unfiltered `/users` query! Only candidates from this tenant are evaluated.
    const allCandidates = Array.from(guardsMap.values());
    const currentUserId = authService.getUserId?.() || authService.getUserData?.()?.id;

    // Filter out administrators and current logged-in user if they are an admin
    const guardsOnly = allCandidates.filter(u => {
      if (currentUserId && String(u.id) === String(currentUserId)) {
        const myRole = (authService.getUserRole?.() || '').toLowerCase();
        if (myRole.includes('admin') || myRole.includes('owner')) return false;
      }
      const roleName = (u._roleSystemName || '').toLowerCase();
      if (roleName.includes('administrator') || roleName.includes('public')) return false;
      return true;
    });

    items.value = guardsOnly;

    // Step 2: Enrich with faceId biometric photos
    try {
      const faceProfiles = await biometricService.getTenantFaceProfiles();
      items.value.forEach(g => {
        const gId = String(g.id);
        const gPmId = g.personalModuleId ? String(g.personalModuleId) : null;
        const matchingProfile = faceProfiles.find(fp => {
          const atId = fp.assignedTo ? String(fp.assignedTo?.id ?? fp.assignedTo) : null;
          const atUserId = fp.assignedTo?.assignedUser ? String(fp.assignedTo.assignedUser?.id ?? fp.assignedTo.assignedUser) : null;
          return (atUserId && atUserId === gId) ||
                 (atId && gPmId && atId === gPmId) ||
                 (atId && atId === gId);
        });
        if (matchingProfile) {
          let photoUrl = matchingProfile.rawImage || null;
          if (!photoUrl && matchingProfile.referencePhoto) {
            photoUrl = biometricService.getFacePhotoUrl(matchingProfile.referencePhoto?.id || matchingProfile.referencePhoto);
          }
          if (photoUrl && !photoUrl.startsWith('data:') && !photoUrl.startsWith('http') && !photoUrl.startsWith('blob:') && photoUrl.length > 100) {
            photoUrl = `data:image/jpeg;base64,${photoUrl}`;
          }
          if (photoUrl) {
            g.avatar = photoUrl;
            g.facePhoto = photoUrl;
          }
        }
      });
    } catch (faceErr) {
      console.warn('Face profile enrichment notice:', faceErr);
    }
  } catch (err) {
    console.error('Fetch error', err);
  } finally {
    loading.value = false;
  }
};

const saveGuard = async () => {
  formError.value = null;
  fieldErrors.value = {};

  if (!form.value.first_name.trim()) {
    fieldErrors.value.first_name = 'First name is required';
    formError.value = {
      title: 'Missing Required Field',
      message: 'Please enter the guard\'s first name.'
    };
    if (modalScrollContainer.value) modalScrollContainer.value.scrollTop = 0;
    return;
  }

  const cleanDigits = form.value.phone.replace(/\D/g, '');
  if (!cleanDigits || cleanDigits.length < 7) {
    fieldErrors.value.phone = 'Valid mobile number (at least 7 digits) is required';
    formError.value = {
      title: 'Invalid Mobile Number',
      message: 'Please enter a valid mobile number for the guard.'
    };
    if (modalScrollContainer.value) modalScrollContainer.value.scrollTop = 0;
    return;
  }

  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email.trim())) {
    fieldErrors.value.email = 'Please enter a valid email address (e.g. guard@example.com)';
    formError.value = {
      title: 'Invalid Email Address',
      message: 'The email address format is invalid.'
    };
    if (modalScrollContainer.value) modalScrollContainer.value.scrollTop = 0;
    return;
  }
  
  saving.value = true;
  let targetPmId = null;
  try {
    const token = authService.getToken();
    let tenantId = authService.getTenantId();
    if (!tenantId) {
      try { tenantId = await currentUserTenant.getTenantIdAsync(); } catch (_) {}
    }
    
    let employeeRoleId = null;
    try {
      const roleRes = await fetch(`${apiUrl}/roles?filter[name][_icontains]=Employee`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const roleData = await roleRes.json();
      employeeRoleId = roleData?.data?.[0]?.id;
    } catch (_) {}

    const fullPhone = `${form.value.country_code || '+91'}${cleanDigits}`;

    const payload = {
      first_name: form.value.first_name,
      last_name: form.value.last_name || '-',
      phone: fullPhone,
      title: form.value.employee_id?.trim() || undefined,
      status: 'active',
      appAccess: true,
    };
    
    if (form.value.email) {
      payload.email = form.value.email.trim();
    }
    
    payload.userApp = 'accesseasy';
    payload.appAccess = true;
    payload.status = 'active';

    if (!editingGuard.value) {
      payload.accesseasyPatrolRole = form.value.role_id || guardRoleId.value || null;
      if (tenantId) payload.tenant = tenantId;
      if (employeeRoleId) payload.role = employeeRoleId;
      if (!payload.email) payload.email = `guard_${Date.now()}@accesseasy.app`;
    }

    if (form.value.avatarFile) {
      const formData = new FormData();
      formData.append('title', `guard-avatar-${Date.now()}`);
      formData.append('file', form.value.avatarFile);
      
      const fileRes = await fetch(`${apiUrl}/files`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        payload.avatar = fileData.data.id;
      } else {
         const errData = await fileRes.json().catch(() => ({}));
         console.warn("Avatar upload failed", errData);
         formError.value = {
           title: 'Photo Upload Failed',
           message: errData.errors?.[0]?.message || 'Failed to upload photo. Please try a different image.'
         };
         saving.value = false;
         if (modalScrollContainer.value) modalScrollContainer.value.scrollTop = 0;
         return;
      }
    } else if (form.value.removeAvatar) {
      payload.avatar = null;
    }

    const url = editingGuard.value
      ? `${apiUrl}/users/${editingGuard.value.id}`
      : `${apiUrl}/users`;

    const res = await fetch(url, {
      method: editingGuard.value ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const userData = await res.json();
      const newUserId = userData.data?.id;

      // Personal Module for Guard
      const guardEmpId = form.value.employee_id?.trim() || `GRD-${Date.now().toString().slice(-5)}`;

      // Resolve valid branchLocation foreign key (pointing to locationManagement collection)
      let validBranchLocationId = null;
      if (form.value.site_id) {
        try {
          const directCheck = await fetch(`${apiUrl}/items/locationManagement/${form.value.site_id}?fields[]=id`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null);
          if (directCheck && directCheck.ok) {
            validBranchLocationId = form.value.site_id;
          } else {
            const selectedSite = sites.value.find(s => String(s.id) === String(form.value.site_id));
            const siteName = selectedSite?.locName || selectedSite?.name || selectedSite?.branchName;
            if (siteName) {
              const queryCheck = await fetch(
                `${apiUrl}/items/locationManagement?filter[locdetail][locationName][_icontains]=${encodeURIComponent(siteName)}&fields[]=id&limit=1`,
                { headers: { Authorization: `Bearer ${token}` } }
              ).catch(() => null);
              if (queryCheck && queryCheck.ok) {
                const qData = await queryCheck.json();
                if (qData.data && qData.data.length > 0) {
                  validBranchLocationId = qData.data[0].id;
                }
              }
            }
          }
        } catch (_) {
          validBranchLocationId = null;
        }
      }

      if (!editingGuard.value && newUserId) {
        const personalPayload = {
          employeeId: guardEmpId,
          firstName: form.value.first_name,
          lastName: form.value.last_name || '-',
          personalPhone: payload.phone,
          personalEmail: payload.email,
          designation: 'Guard',
          status: 'true',
          accessOn: true,
          uniqueId: `${tenantId}-${guardEmpId}`,
          tenant: tenantId,
          assignedUser: newUserId,
          branchLocation: validBranchLocationId || null,
          branch: form.value.site_id || null,
          assigned_door: form.value.assigned_door || null,
          mobilePermissions: { enable_incidents: true, enable_patrols: true }
        };

        let pmCreateRes = await fetch(`${apiUrl}/items/personalModule`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(personalPayload),
        });

        // Resilient fallback: if branchLocation or branch caused FK constraint violation, retry without them
        if (!pmCreateRes.ok) {
          try {
            const errData = await pmCreateRes.clone().json();
            const hasFkError = errData.errors?.some(e => 
              e.code === 'INVALID_FOREIGN_KEY' || 
              e.field === 'branchLocation' || 
              e.field === 'branch' ||
              (e.message && (e.message.includes('branchLocation') || e.message.includes('branch')))
            );
            if (hasFkError) {
              console.warn('[saveGuard] Foreign key constraint on branchLocation/branch, retrying with null');
              delete personalPayload.branch;
              personalPayload.branchLocation = null;
              pmCreateRes = await fetch(`${apiUrl}/items/personalModule`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(personalPayload),
              });
            }
          } catch (_) {}
        }

        if (pmCreateRes.ok) {
          const pmData = await pmCreateRes.json();
          targetPmId = pmData.data?.id;
        } else {
          console.warn('[saveGuard] Note: personalModule creation response:', await pmCreateRes.text().catch(() => ''));
        }
      } else if (editingGuard.value && editingGuard.value.personalModuleId) {
        targetPmId = editingGuard.value.personalModuleId;
        const patchPayload = {
           employeeId: form.value.employee_id?.trim() || undefined,
           branchLocation: validBranchLocationId || null,
           branch: form.value.site_id || null,
           assigned_door: form.value.assigned_door || null,
           personalEmail: form.value.email || undefined,
           personalPhone: payload.phone,
           firstName: form.value.first_name,
           lastName: form.value.last_name || '-',
        };

        let pmPatchRes = await fetch(`${apiUrl}/items/personalModule/${editingGuard.value.personalModuleId}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(patchPayload),
        });

        if (!pmPatchRes.ok) {
          try {
            const errData = await pmPatchRes.clone().json();
            const hasFkError = errData.errors?.some(e => 
              e.code === 'INVALID_FOREIGN_KEY' || 
              e.field === 'branchLocation' || 
              e.field === 'branch' ||
              (e.message && (e.message.includes('branchLocation') || e.message.includes('branch')))
            );
            if (hasFkError) {
              console.warn('[saveGuard] Foreign key constraint on branchLocation/branch on patch, retrying with null');
              delete patchPayload.branch;
              patchPayload.branchLocation = null;
              await fetch(`${apiUrl}/items/personalModule/${editingGuard.value.personalModuleId}`, {
                method: 'PATCH',
                headers: { 
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(patchPayload),
              });
            }
          } catch (_) {}
        }
      }

      // Automatically sync Face ID & Biometrics if avatar picture was updated
      if (form.value.avatarFile && targetPmId) {
        try {
          const { webFaceEmbeddingService } = await import('@/services/webFaceEmbeddingService');
          const extraction = await webFaceEmbeddingService.processImageFile(form.value.avatarFile);
          if (extraction && extraction.embedding) {
            await biometricService.enrollFaceWithPhoto({
              personalModuleId: targetPmId,
              file: form.value.avatarFile,
              base64Image: extraction.base64Image,
              embeddingVector: extraction.embedding
            });
            console.log('[FaceSync] Face biometrics updated successfully for guard');
          }
        } catch (faceSyncErr) {
          console.warn('[FaceSync] Non-blocking face embedding notice:', faceSyncErr);
        }
      }

      showAddDialog.value = false;
      await fetchGuards();
    } else {
      const errData = await res.json().catch(() => ({}));
      const parsed = parseDirectusError(errData);
      if (parsed.field) {
        fieldErrors.value[parsed.field] = parsed.message;
      }
      formError.value = {
        field: parsed.field,
        title: parsed.title,
        message: parsed.message
      };
      if (modalScrollContainer.value) {
        modalScrollContainer.value.scrollTop = 0;
      }
    }
  } catch (err) {
    console.error('Save error', err);
    formError.value = {
      title: 'Registration Error',
      message: err.message || 'An unexpected error occurred while saving the guard. Please try again.'
    };
    if (modalScrollContainer.value) {
      modalScrollContainer.value.scrollTop = 0;
    }
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (authService.isAuthenticated() && authService.getToken()) {
    fetchGuards();
    fetchSitesAndZones();
    fetchGuardRoleId();
  }
});
</script>
