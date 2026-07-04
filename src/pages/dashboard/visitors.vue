<template>
  <div class="space-y-8 pb-12 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header -->
    <div class="flex items-center justify-between relative z-50">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Visitor Overview
        </h1>
        <p class="text-sm font-medium text-slate-500 mt-1">
          Real-time tracking of guest check-ins and portal performance.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <!-- Date Picker -->
        <div class="relative flex items-center">
          <Calendar class="absolute left-3 w-4 h-4 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <input 
            type="date" 
            v-model="selectedDate"
            class="pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900/50 backdrop-blur-sm border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200 text-sm font-bold shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        <!-- Export Dropdown -->
        <div class="relative group">
          <button
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-900/50 backdrop-blur-sm border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200 text-sm font-bold shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95"
          >
            <FileDown class="w-4 h-4" />
            Export Data
          </button>
          <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg py-1 z-50 hidden group-hover:block backdrop-blur-xl">
            <button
              class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
              @click="exportVisitorsExcel"
            >
              Export Visitors (Excel)
            </button>
            <button
              class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
              @click="exportVisitorsCSV"
            >
              Export Visitors (CSV)
            </button>
            <div class="border-t border-slate-100 dark:border-zinc-900 my-1" />
            <button
              class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
              @click="exportLogsExcel"
            >
              Export Logs (Excel)
            </button>
            <button
              class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
              @click="exportLogsCSV"
            >
              Export Logs (CSV)
            </button>
          </div>
        </div>

        <button
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all active:scale-95"
          @click="$router.push('/dashboard/visitor-portals')"
        >
          <Layout class="w-4 h-4" />
          Manage Portals
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- Total Visitors Today -->
      <button 
        @click="activeFilter = 'all'"
        class="text-left bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl border p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden group hover:border-blue-500/30 transition-all focus:outline-none cursor-pointer"
        :class="activeFilter === 'all' ? 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-500/5 ring-1 ring-blue-500/20' : 'border-slate-200/50 dark:border-white/5'"
      >
        <div class="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
        <p class="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 pl-2 flex items-center gap-2">
          Visitors
        </p>
        <p
          v-if="loading"
          class="text-3xl font-black text-slate-200 dark:text-zinc-700 animate-pulse pl-2"
        >
          —
        </p>
        <p
          v-else
          class="text-4xl font-black text-slate-900 dark:text-white pl-2 tracking-tight"
        >
          {{ stats.totalToday }}
        </p>
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 pl-2">
          View all scans
        </p>
      </button>

      <!-- Active Now -->
      <button 
        @click="activeFilter = 'authorized'"
        class="text-left bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl border p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden group hover:border-emerald-500/30 transition-all focus:outline-none cursor-pointer"
        :class="activeFilter === 'authorized' ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/5 ring-1 ring-emerald-500/20' : 'border-slate-200/50 dark:border-white/5'"
      >
        <div class="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
        <p class="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 pl-2">
          Inside Now
        </p>
        <p
          v-if="loading"
          class="text-3xl font-black text-slate-200 dark:text-zinc-700 animate-pulse pl-2"
        >
          —
        </p>
        <p
          v-else
          class="text-4xl font-black text-slate-900 dark:text-white pl-2 tracking-tight"
        >
          {{ stats.activeNow }}
        </p>
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 pl-2">
          View authorized
        </p>
      </button>

      <!-- Denied Visitors -->
      <button 
        @click="activeFilter = 'denied'"
        class="text-left bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl border p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden group hover:border-rose-500/30 transition-all focus:outline-none cursor-pointer"
        :class="activeFilter === 'denied' ? 'border-rose-500/50 bg-rose-50/50 dark:bg-rose-500/5 ring-1 ring-rose-500/20' : 'border-slate-200/50 dark:border-white/5'"
      >
        <div class="absolute top-0 left-0 w-1 h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
        <p class="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-2 pl-2">
          Denied Entry
        </p>
        <p
          v-if="loading"
          class="text-3xl font-black text-slate-200 dark:text-zinc-700 animate-pulse pl-2"
        >
          —
        </p>
        <p
          v-else
          class="text-4xl font-black text-rose-600 dark:text-rose-400 pl-2 tracking-tight"
        >
          {{ stats.deniedToday }}
        </p>
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 pl-2">
          View failed scans
        </p>
      </button>

      <!-- Active Portals -->
      <button 
        @click="$router.push('/dashboard/visitor-portals')"
        class="text-left bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-white/5 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden group hover:border-amber-500/30 transition-all focus:outline-none cursor-pointer"
      >
        <div class="absolute top-0 left-0 w-1 h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
        <p class="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2 pl-2">
          Portals
        </p>
        <p
          v-if="loading"
          class="text-3xl font-black text-slate-200 dark:text-zinc-700 animate-pulse pl-2"
        >
          —
        </p>
        <p
          v-else
          class="text-4xl font-black text-slate-900 dark:text-white pl-2 tracking-tight"
        >
          {{ stats.portals }}
        </p>
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 pl-2 group-hover:text-amber-500 transition-colors">
          Manage portals →
        </p>
      </button>

      <!-- Registered Visitors -->
      <button 
        @click="openRegisteredModal"
        class="text-left bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-white/5 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden group hover:border-indigo-500/30 transition-all focus:outline-none cursor-pointer"
      >
        <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
        <p class="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2 pl-2 flex items-center gap-2">
          Registered
        </p>
        <p
          v-if="loading"
          class="text-3xl font-black text-slate-200 dark:text-zinc-700 animate-pulse pl-2"
        >
          —
        </p>
        <p
          v-else
          class="text-4xl font-black text-slate-900 dark:text-white pl-2 tracking-tight"
        >
          {{ registeredVisitors }}
        </p>
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 pl-2 group-hover:text-indigo-500 transition-colors">
          View Details →
        </p>
      </button>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 gap-6 mt-8">
      
      <!-- Visitor Analytics (Health) -->
      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck class="w-4 h-4 text-indigo-500" />
            Security & Approval Health
          </h3>
          <span 
            class="text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            :class="[
              healthRate >= 95 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
              healthRate >= 80 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 
              'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
            ]"
          >
            <span class="relative flex h-1.5 w-1.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="healthRate >= 95 ? 'bg-emerald-400' : healthRate >= 80 ? 'bg-amber-400' : 'bg-rose-400'" />
              <span class="relative inline-flex rounded-full h-1.5 w-1.5" :class="healthRate >= 95 ? 'bg-emerald-500' : healthRate >= 80 ? 'bg-amber-500' : 'bg-rose-500'" />
            </span>
            {{ healthRate >= 95 ? 'Optimal' : healthRate >= 80 ? 'Warning' : 'Critical' }}
          </span>
        </div>
        
        <div v-if="loading" class="w-full h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
        <div v-else class="flex flex-col md:flex-row gap-6 items-center">
          <!-- Left: Progress Bar -->
          <div class="w-full md:w-2/3 space-y-4">
            <div class="flex px-1 justify-between text-[11px] font-black tracking-widest uppercase mb-2">
              <span class="text-emerald-600 dark:text-emerald-400">
                {{ healthRate }}% Successful ({{ stats.totalToday }})
              </span>
              <span class="text-rose-600 dark:text-rose-400 shrink-0">
                {{ 100 - healthRate }}% Unauthorized ({{ stats.deniedToday }})
              </span>
            </div>
            <!-- Progress Bar -->
            <div class="w-full h-4 bg-rose-500/20 rounded-full overflow-hidden flex border border-rose-500/10 shadow-inner dark:bg-rose-500/10">
              <div
                class="h-full bg-gradient-to-r transition-all duration-1000 border-r border-slate-900/20"
                :class="healthRate >= 95 ? 'from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : healthRate >= 80 ? 'from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]'"
                :style="{ width: `${healthRate}%` }"
              />
            </div>
          </div>

          <!-- Right: Insights -->
          <div class="w-full md:w-1/3 bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-slate-200/50 dark:border-white/5">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 mb-1">
              System Insight
            </p>
            <p class="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              {{ 
                healthRate >= 95 ? 'Access control systems are operating normally with minimal unauthorized access attempts.' :
                healthRate >= 80 ? 'Slightly elevated rate of unauthorized attempts. Monitor logs for potential issues.' :
                'High rate of unauthorized access attempts detected. Immediate review of visitor logs is recommended.'
              }}
            </p>
            <div class="mt-3 pt-3 border-t border-slate-200/50 dark:border-zinc-800 flex justify-between items-center">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Scans</span>
              <span class="text-sm font-black text-slate-900 dark:text-white">{{ stats.totalToday + stats.deniedToday }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Visitor Logs -->
      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] h-[450px] flex flex-col">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100/50 dark:border-white/5 shrink-0 bg-white/50 dark:bg-zinc-900/50">
          <div class="flex items-center gap-4">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-3">
              Live Visitor Logs 
              <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" /><span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" /></span>
            </h3>
          </div>
          
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <div class="relative w-full sm:w-64">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                v-model="searchQuery"
                placeholder="Search visitor or door..."
                class="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950/50 border border-slate-200/80 dark:border-zinc-800/80 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
              />
            </div>
            <router-link
              to="/visitors"
              class="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors shrink-0"
            >
              View All →
            </router-link>
          </div>
        </div>
        
        <div class="overflow-y-auto flex-1 custom-scrollbar">
          <table class="w-full text-sm text-left border-collapse">
            <thead class="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-50/80 dark:bg-zinc-950/80 border-b border-slate-200/50 dark:border-white/5 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th class="px-6 py-4">Visitor</th>
                <th class="px-6 py-4">Door</th>
                <th class="px-6 py-4">Authorized By</th>
                <th class="px-6 py-4">Time</th>
                <th class="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100/50 dark:divide-white/5">
              <tr
                v-if="loading"
                class="h-32"
              >
                <td
                  colspan="5"
                  class="text-center text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  Loading feed...
                </td>
              </tr>
              <tr
                v-else-if="filteredLogs.length === 0"
                class="h-32"
              >
                <td
                  colspan="5"
                  class="text-center text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  {{ recentLogs.length === 0 ? 'No visitors for selected date' : 'No matches found' }}
                </td>
              </tr>
              <tr
                v-for="log in filteredLogs"
                v-else
                :key="log.id"
                class="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors group"
              >
                <td class="px-6 py-4">
                  <div class="text-[12px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {{ log.name || 'Unknown Visitor' }}
                  </div>
                  <div class="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                    {{ log.mode === 'throughApp' ? 'App Scan' : (log.mode || 'Portal Scan') }}
                  </div>
                </td>
                <td class="px-6 py-4 text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                  {{ log.door?.doorName || log.door?.doorNumber || '-' }}
                </td>
                <td class="px-6 py-4 text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                  <span
                    v-if="log.user_created"
                  >
                    {{ log.user_created.first_name }} {{ log.user_created.last_name || '' }}
                  </span>
                  <span
                    v-else
                    class="text-slate-400 italic text-[10px]"
                  >
                    System / Auto
                  </span>
                </td>
                <td class="px-6 py-4 text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                  {{ formatTime(log.date_created) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <span
                    v-if="log.ValidLogs === 'authorized' || log.ValidLogs === true"
                    class="px-2.5 py-1.5 rounded-md text-[9px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 uppercase tracking-widest shadow-sm"
                  >Auth</span>
                  <span
                    v-else
                    class="px-2.5 py-1.5 rounded-md text-[9px] font-black bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20 uppercase tracking-widest shadow-sm"
                  >Denied</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Registered Visitors Modal -->
    <div v-if="showRegisteredModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showRegisteredModal = false" />
      <div class="relative w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 shrink-0">
          <h3 class="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            <Users class="w-4 h-4 text-indigo-500" />
            Registered Visitor Details
          </h3>
          <button @click="showRegisteredModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Modal Body -->
        <div class="overflow-y-auto p-4 flex-1 custom-scrollbar bg-slate-50/50 dark:bg-zinc-950/50">
          <div class="flex flex-col gap-3">
            <div v-if="loadingRegistered" class="p-12 flex justify-center">
              <Loader2 class="w-8 h-8 animate-spin text-indigo-500" />
            </div>
            
            <div v-else-if="registeredVisitorsList.length === 0" class="py-12 text-center">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">
                No registered visitors found.
              </p>
            </div>
            
            <div
              v-for="visitor in registeredVisitorsList"
              v-else
              :key="visitor.id"
              class="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] overflow-hidden gap-4"
            >
              <!-- Left: Profile Info -->
              <div class="flex items-center gap-4 min-w-[200px] flex-1">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white shadow-inner shrink-0">
                  {{ visitor.personName?.charAt(0).toUpperCase() || '?' }}
                </div>
                <div class="flex flex-col">
                  <span class="block text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ visitor.personName }}</span>
                  <span class="text-[10px] font-semibold text-slate-500 mt-0.5">{{ visitor.mobileNumber || '' }}  {{ visitor.email ? '• ' + visitor.email : '' }}</span>
                </div>
              </div>

              <!-- Middle: Validity Period -->
              <div class="flex flex-col flex-1 min-w-[150px]">
                <span class="text-[11px] font-black text-slate-700 dark:text-zinc-300">
                  {{ formatDate(visitor.startDate) }} to {{ formatDate(visitor.endDate) }}
                </span>
              </div>

              <!-- Middle: Access Level -->
              <div class="flex flex-col flex-1 min-w-[100px]">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-zinc-800/80 inline-flex self-start">
                  {{ visitor.assignedAccessLevels?.accessLevelName || 'N/A' }}
                </span>
              </div>

              <!-- Right: Status & Actions -->
              <div class="flex items-center justify-end gap-4 shrink-0 sm:min-w-[200px] w-full sm:w-auto mt-2 sm:mt-0">
                <!-- Status Badge -->
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm transition-colors"
                  :class="visitor.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'"
                >
                  <div
                    class="w-1.5 h-1.5 rounded-full" 
                    :class="visitor.status === 'active' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-rose-500 shadow-[0_0_5px_#f43f5e]'"
                  />
                  {{ visitor.status || 'inactive' }}
                </span>

                <!-- Action Button -->
                <button
                  @click="viewVisitorCard(visitor)"
                  class="flex items-center gap-2 h-8 px-3 rounded-lg bg-slate-100 dark:bg-zinc-800/80 border border-transparent hover:border-slate-300 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm hover:shadow-[0_0_15px_rgba(79,70,229,0.2)] group-hover:bg-white dark:group-hover:bg-zinc-800"
                >
                  <Printer class="w-3.5 h-3.5" /> 
                  <span>View Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Digital ID Card Modal (Holographic Rectangle) -->
    <div v-if="showIdCardModal && selectedVisitorForCard" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <!-- Dark backdrop -->
      <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md print:hidden" @click="showIdCardModal = false" />
      
      <div class="relative flex flex-col items-center animate-in zoom-in-95 duration-300 w-full max-w-3xl">
        <!-- Print Header -->
        <div class="hidden print:block text-center mb-6 w-full">
          <h1 class="text-2xl font-black text-black">VISITOR PASS</h1>
        </div>

        <!-- Animated glowing orb behind the card -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-30 animate-pulse print:hidden -z-10"></div>
        
        <!-- Glassmorphic Container -->
        <div class="relative bg-slate-900/60 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.3)] overflow-hidden p-6 sm:p-10 w-full print:bg-white print:border-black print:shadow-none print:rounded-none">
          
          <!-- Top Section: Avatar + Name -->
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
            <!-- Avatar -->
            <div class="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 shrink-0 print:bg-black">
              <div class="w-full h-full rounded-full overflow-hidden border-4 border-slate-900 bg-slate-800 print:border-white">
                <img v-if="selectedVisitorForCard.photo" :src="getPhotoUrl(selectedVisitorForCard.photo)" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center font-black text-4xl text-white bg-slate-800 print:text-black print:bg-white">
                  {{ selectedVisitorForCard.personName?.charAt(0).toUpperCase() || '?' }}
                </div>
              </div>
            </div>
            
            <!-- Name and Basic Info -->
            <div class="flex-1 mt-2 sm:mt-0">
              <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase print:text-black">{{ selectedVisitorForCard.personName }}</h2>
              <p class="text-lg font-bold text-slate-300 mt-1 uppercase tracking-widest print:text-slate-600">VISITOR ID</p>
              <p class="text-sm text-cyan-400 mt-1 font-semibold uppercase tracking-widest print:text-slate-500" v-if="selectedVisitorForCard.company">{{ selectedVisitorForCard.company }}</p>
            </div>
          </div>

          <!-- Middle Divider Info Row -->
          <div class="w-full text-[10px] sm:text-xs font-semibold text-slate-300 flex flex-wrap justify-center sm:justify-start gap-x-3 gap-y-2 uppercase tracking-widest border-y border-white/10 py-4 mb-8 print:border-slate-300 print:text-slate-600">
            <span>Visitor ID: <strong class="text-white print:text-black">#{{ (selectedVisitorForCard.id || '000').toString().slice(0, 8) }}</strong></span>
            <span class="text-white/20 print:hidden">|</span>
            <span>Date: <strong class="text-white print:text-black">{{ formatDate(selectedVisitorForCard.startDate) }}</strong></span>
            <span class="text-white/20 print:hidden">|</span>
            <span>Access: <strong class="text-white print:text-black">{{ selectedVisitorForCard.assignedAccessLevels?.accessLevelName || 'General' }}</strong></span>
            <span class="text-white/20 print:hidden">|</span>
            <span>Expiry: <strong class="text-white print:text-black">{{ formatDate(selectedVisitorForCard.endDate) }}</strong></span>
            <span v-if="selectedVisitorForCard.personToMeet">
              <span class="text-white/20 print:hidden">|</span>
              Host: <strong class="text-white print:text-black">{{ selectedVisitorForCard.personToMeet }}</strong>
            </span>
            <span v-if="selectedVisitorForCard.mobileNumber">
              <span class="text-white/20 print:hidden">|</span>
              Phone: <strong class="text-white print:text-black">{{ selectedVisitorForCard.mobileNumber }}</strong>
            </span>
          </div>

          <!-- Bottom Section: QR Code & Status -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
            <!-- QR Code with glowing brackets -->
            <div class="relative p-1 shrink-0">
               <!-- Glowing corners (simulating high tech) -->
               <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 print:hidden"></div>
               <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 print:hidden"></div>
               <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-500 print:hidden"></div>
               <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500 print:hidden"></div>
               
               <div class="m-2 p-3 bg-white/95 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.15)] print:shadow-none print:border print:border-black">
                 <qrcode-vue :value="selectedVisitorForCard.id || 'N/A'" :size="120" level="H" :margin="1" background="transparent" />
               </div>
            </div>

            <!-- Logo & Status -->
            <div class="flex flex-col items-center sm:items-end text-center sm:text-right">
               <div class="flex items-center gap-3 mb-4">
                 <!-- Simple AccessEasy logo placeholder -->
                 <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-indigo-600 text-xl print:border print:border-black">A</div>
                 <div class="text-left">
                   <div class="text-lg font-black text-white leading-none print:text-black">AccessEasy</div>
                   <div class="text-[10px] text-slate-400 tracking-widest uppercase print:text-slate-500">Visitor Management</div>
                 </div>
               </div>
               <div class="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-slate-500">
                 STATUS: 
                 <span class="text-base ml-2" :class="selectedVisitorForCard.status === 'active' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] print:text-black' : 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] print:text-black'">
                   {{ selectedVisitorForCard.status }}
                 </span>
               </div>
            </div>
          </div>
        </div>
        
        <!-- External Actions -->
        <div class="mt-6 flex justify-end gap-4 w-full print:hidden relative z-10">
          <button @click="showIdCardModal = false" class="px-6 py-2.5 rounded-xl border border-white/20 font-bold text-xs uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition-all bg-slate-900/50 backdrop-blur-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Layout, Users, ShieldCheck, Activity, Clock, FileDown, Calendar, Search, X, Loader2, Printer } from 'lucide-vue-next';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import QrcodeVue from 'qrcode.vue';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const loading = ref(true);
const stats = ref({ totalToday: 0, activeNow: 0, deniedToday: 0, portals: 0 });
const recentLogs = ref([]);
const registeredVisitors = ref(0);
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const searchQuery = ref('');
const activeFilter = ref('all');

// Modal State
const showRegisteredModal = ref(false);
const registeredVisitorsList = ref([]);
const loadingRegistered = ref(false);

const showIdCardModal = ref(false);
const selectedVisitorForCard = ref(null);

const viewVisitorCard = (visitor) => {
  selectedVisitorForCard.value = visitor;
  showIdCardModal.value = true;
};

const refreshInterval = ref(null);

const filteredLogs = computed(() => {
  let logs = recentLogs.value;

  // Apply card filter
  if (activeFilter.value === 'denied') {
    logs = logs.filter(log => log.ValidLogs !== 'authorized' && log.ValidLogs !== true);
  } else if (activeFilter.value === 'authorized') {
    logs = logs.filter(log => log.ValidLogs === 'authorized' || log.ValidLogs === true);
  }

  // Apply search query
  if (searchQuery.value) {
    const lowerQuery = searchQuery.value.toLowerCase();
    logs = logs.filter(log => {
      const nameMatch = (log.name || '').toLowerCase().includes(lowerQuery);
      const doorMatch = (log.door?.doorName || log.door?.doorNumber || '').toLowerCase().includes(lowerQuery);
      return nameMatch || doorMatch;
    });
  }

  return logs;
});

const healthRate = computed(() => {
  const total = stats.value.totalToday + stats.value.deniedToday;
  if (total === 0) return 100;
  return Math.round((stats.value.totalToday / total) * 100);
});

const formatTime = (d) => d ? format(new Date(d), 'hh:mm a') : '—';

const formatDate = (isoString) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getPhotoUrl = (photoId) => {
  if (!photoId) return '';
  return `${import.meta.env.VITE_API_URL}/assets/${photoId}?access_token=${authService.getToken()}`;
};

const openRegisteredModal = async () => {
  showRegisteredModal.value = true;
  loadingRegistered.value = true;
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();
  try {
    const filter = { "filter[tenant][tenantId][_eq]": tenantId };
    const params = new URLSearchParams({
      limit: '50',
      sort: '-date_created',
      fields: 'id,personName,email,mobileNumber,startDate,endDate,status,assignedAccessLevels.accessLevelName,photo,personToMeet,reasonForVisit,company',
      ...filter
    });
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      registeredVisitorsList.value = data.data || [];
    }
  } catch(e) {
    console.error('Failed to fetch registered visitors', e);
  } finally {
    loadingRegistered.value = false;
  }
};

const fetchData = async (background = false) => {
  if (!background) loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = currentUserTenant.getTenantId();
    const headers = { Authorization: `Bearer ${token}` };

    const response = await authService.knApi.post('/accesseasy-dashboard-api/metrics', {
      action: 'visitor-dashboard',
      tenantId,
      today: selectedDate.value
    }, { headers });

    const data = response.data;
    recentLogs.value = data.recentLogs || [];
    
    // Calculate fallback stats in case backend returns 0
    const computedTotal = recentLogs.value.length;
    const computedDenied = recentLogs.value.filter(log => log.ValidLogs !== 'authorized' && log.ValidLogs !== true).length;
    const backendTotal = data.totalToday || 0;
    
    stats.value = {
      totalToday: backendTotal > 0 ? backendTotal : computedTotal,
      deniedToday: backendTotal > 0 ? (data.deniedToday || 0) : computedDenied,
      activeNow: data.activeNow || 0,
      portals: data.portals || 0
    };
    
    // Fetch registered visitors total count
    const filter = { "filter[tenant][tenantId][_eq]": tenantId };
    const params = new URLSearchParams({
      limit: '1',
      meta: 'filter_count',
      ...filter
    });
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const visitorData = await res.json();
      registeredVisitors.value = visitorData.meta?.filter_count ?? 0;
    }
  } catch (e) {
    console.error('Visitor dashboard fetch failed:', e);
  } finally {
    loading.value = false;
  }
};

watch(selectedDate, () => {
  fetchData();
});

const fetchAllVisitorsForExport = async () => {
  const tenantId = currentUserTenant.getTenantId();
  const token = authService.getToken();
  if (!tenantId || !token) return [];

  try {
    const filter = { "filter[tenant][tenantId][_eq]": tenantId };
    const params = new URLSearchParams({
      limit: '-1',
      sort: '-date_created',
      fields: 'personName,email,mobileNumber,startDate,endDate,startTime,endTime,status,quantity,assignedAccessLevels.accessLevelName,date_created',
      ...filter
    });

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/visitor?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const result = await res.json();
      return result.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch visitors for export", error);
  }
  return [];
};

const exportVisitorsExcel = async () => {
  const exportItems = await fetchAllVisitorsForExport();
  if (exportItems.length === 0) {
    alert("No visitor data to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Visitors");

  worksheet.columns = [
    { header: "Name", key: "personName", width: 25 },
    { header: "Email", key: "email", width: 25 },
    { header: "Mobile Number", key: "mobileNumber", width: 15 },
    { header: "Start Date", key: "startDate", width: 12 },
    { header: "End Date", key: "endDate", width: 12 },
    { header: "Start Time", key: "startTime", width: 10 },
    { header: "End Time", key: "endTime", width: 10 },
    { header: "Access Level", key: "accessLevelName", width: 25 },
    { header: "Quantity", key: "quantity", width: 10 },
    { header: "Status", key: "status", width: 12 }
  ];

  exportItems.forEach(item => {
    worksheet.addRow({
      personName: item.personName,
      email: item.email || "",
      mobileNumber: item.mobileNumber || "",
      startDate: item.startDate,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      accessLevelName: item.assignedAccessLevels?.accessLevelName || "N/A",
      quantity: item.quantity,
      status: item.status
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Visitors_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
};

const exportVisitorsCSV = async () => {
  const exportItems = await fetchAllVisitorsForExport();
  if (exportItems.length === 0) {
    alert("No visitor data to export");
    return;
  }

  const headers = ["Name", "Email", "Mobile Number", "Start Date", "End Date", "Start Time", "End Time", "Access Level", "Quantity", "Status"];
  const rows = exportItems.map(item => [
    `"${(item.personName || '').replace(/"/g, '""')}"`,
    `"${(item.email || '').replace(/"/g, '""')}"`,
    `"${(item.mobileNumber || '').replace(/"/g, '""')}"`,
    item.startDate,
    item.endDate,
    item.startTime,
    item.endTime,
    `"${(item.assignedAccessLevels?.accessLevelName || 'N/A').replace(/"/g, '""')}"`,
    item.quantity,
    item.status
  ]);

  const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Visitors_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

const exportLogsExcel = async () => {
  if (recentLogs.value.length === 0) {
    alert("No log data to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Visitor Logs");

  worksheet.columns = [
    { header: "Visitor", key: "name", width: 25 },
    { header: "Mode", key: "mode", width: 15 },
    { header: "Door", key: "door", width: 20 },
    { header: "Authorized By", key: "authorizedBy", width: 25 },
    { header: "Time", key: "time", width: 20 },
    { header: "Status", key: "status", width: 12 }
  ];

  recentLogs.value.forEach(log => {
    const authBy = log.user_created ? `${log.user_created.first_name} ${log.user_created.last_name || ''}` : "System / Auto";
    const status = (log.ValidLogs === 'authorized' || log.ValidLogs === true) ? "Authorized" : "Denied";
    const timeFormatted = log.date_created ? format(new Date(log.date_created), 'yyyy-MM-dd hh:mm a') : "—";
    
    worksheet.addRow({
      name: log.name || "Unknown Visitor",
      mode: log.mode === 'throughApp' ? 'App Scan' : (log.mode || 'Portal Scan'),
      door: log.door?.doorName || log.door?.doorNumber || '-',
      authorizedBy: authBy,
      time: timeFormatted,
      status: status
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Visitor_Logs_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
};

const exportLogsCSV = async () => {
  if (recentLogs.value.length === 0) {
    alert("No log data to export");
    return;
  }

  const headers = ["Visitor", "Mode", "Door", "Authorized By", "Time", "Status"];
  const rows = recentLogs.value.map(log => {
    const authBy = log.user_created ? `${log.user_created.first_name} ${log.user_created.last_name || ''}` : "System / Auto";
    const status = (log.ValidLogs === 'authorized' || log.ValidLogs === true) ? "Authorized" : "Denied";
    const timeFormatted = log.date_created ? format(new Date(log.date_created), 'yyyy-MM-dd hh:mm a') : "—";

    return [
      `"${(log.name || 'Unknown Visitor').replace(/"/g, '""')}"`,
      `"${(log.mode === 'throughApp' ? 'App Scan' : (log.mode || 'Portal Scan')).replace(/"/g, '""')}"`,
      `"${(log.door?.doorName || log.door?.doorNumber || '-').replace(/"/g, '""')}"`,
      `"${authBy.replace(/"/g, '""')}"`,
      `"${timeFormatted}"`,
      status
    ];
  });

  const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Visitor_Logs_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

onMounted(() => {
  currentUserTenant.initialize().then(() => {
    fetchData();
  });
});
</script>
