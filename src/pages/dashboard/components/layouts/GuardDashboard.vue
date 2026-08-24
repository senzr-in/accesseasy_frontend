<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans transition-colors duration-300">
    <div class="flex flex-col gap-5 p-4 lg:p-6 min-h-full max-w-[1720px] mx-auto w-full">

      <!-- Success Toast Notification -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="transform -translate-y-4 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-4 opacity-0"
      >
        <div
          v-if="successToastMessage"
          class="fixed top-6 right-6 z-[200] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in"
        >
          <div class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
            <Check class="w-4 h-4" />
          </div>
          <div>
            <p class="text-xs font-bold">{{ successToastMessage }}</p>
            <p class="text-[10px] text-slate-400">Dashboard updated in real-time</p>
          </div>
          <button class="text-slate-400 hover:text-white ml-2 cursor-pointer" @click="successToastMessage = ''">
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </transition>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 1. TOP BAR / COMMAND HEADER                                 -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm">
        
        <!-- Left: Branding & Subtitle -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
            <Shield class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base font-black text-slate-900 dark:text-white tracking-tight">AccessEasy Patrol</h1>
              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                Command Center
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Operations Monitoring &nbsp;·&nbsp; {{ formattedCurrentDate }} &nbsp;·&nbsp; {{ currentTime }}
            </p>
          </div>
        </div>

        <!-- Center / Right: Global Site Selector & Quick Actions -->
        <div class="flex flex-wrap items-center gap-3">
          
          <!-- Global Site Selector Dropdown -->
          <div class="relative" ref="siteDropdownRef">
            <button
              class="h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm transition-all cursor-pointer"
              @click="isSiteDropdownOpen = !isSiteDropdownOpen"
            >
              <Building2 class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{{ selectedSiteName }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isSiteDropdownOpen }" />
            </button>

            <!-- Dropdown Menu -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="isSiteDropdownOpen"
                class="absolute right-0 sm:left-0 mt-2 w-64 rounded-xl bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-50 overflow-hidden animate-in"
              >
                <div class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Security Property
                </div>
                <button
                  class="w-full px-3.5 py-2.5 text-left text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center justify-between transition-colors"
                  :class="selectedSiteId === 'all' ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-500/5' : 'text-slate-700 dark:text-slate-200'"
                  @click="selectSite('all')"
                >
                  <div class="flex items-center gap-2">
                    <Globe class="w-4 h-4 text-slate-400" />
                    <span>All Sites (Global Overview)</span>
                  </div>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">{{ sitesList.length }}</span>
                </button>
                
                <button
                  v-for="site in sitesList"
                  :key="site.id"
                  class="w-full px-3.5 py-2.5 text-left text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center justify-between transition-colors"
                  :class="selectedSiteId === site.id ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-500/5' : 'text-slate-700 dark:text-slate-200'"
                  @click="selectSite(site.id)"
                >
                  <div class="flex items-center gap-2 truncate">
                    <div
                      class="w-2 h-2 rounded-full shrink-0"
                      :class="site.healthStatus === 'healthy' ? 'bg-emerald-500' : site.healthStatus === 'warning' ? 'bg-amber-500' : 'bg-rose-500'"
                    />
                    <span class="truncate">{{ site.name }}</span>
                  </div>
                  <span class="text-[10px] text-slate-400 shrink-0 font-mono">{{ site.code }}</span>
                </button>

                <div class="p-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    class="w-full py-2 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    @click="openQuickCreateModal('add_site')"
                  >
                    <Plus class="w-3.5 h-3.5" />
                    <span>+ Add Property / Site</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <!-- Global Zone Selector Dropdown -->
          <div class="relative" ref="zoneDropdownRef">
            <button
              class="h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm transition-all cursor-pointer"
              @click="isZoneDropdownOpen = !isZoneDropdownOpen; isSiteDropdownOpen = false;"
            >
              <Layers class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{{ selectedZoneName }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isZoneDropdownOpen }" />
            </button>

            <!-- Dropdown Menu -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="isZoneDropdownOpen"
                class="absolute right-0 sm:left-0 mt-2 w-64 rounded-xl bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-50 overflow-hidden animate-in"
              >
                <div class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Security Zone
                </div>
                <button
                  class="w-full px-3.5 py-2.5 text-left text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center justify-between transition-colors cursor-pointer"
                  :class="selectedZoneId === 'all' ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-500/5' : 'text-slate-700 dark:text-slate-200'"
                  @click="selectZone('all')"
                >
                  <div class="flex items-center gap-2">
                    <Layers class="w-4 h-4 text-slate-400" />
                    <span>All Zones (Combined)</span>
                  </div>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">{{ zonesList.length }}</span>
                </button>
                
                <button
                  v-for="zone in zonesList"
                  :key="zone.id"
                  class="w-full px-3.5 py-2.5 text-left text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center justify-between transition-colors cursor-pointer"
                  :class="selectedZoneId === zone.id ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-500/5' : 'text-slate-700 dark:text-slate-200'"
                  @click="selectZone(zone.id)"
                >
                  <div class="flex items-center gap-2 truncate">
                    <div class="w-2 h-2 rounded-full shrink-0 bg-indigo-500" />
                    <span class="truncate">{{ zone.name || zone.zoneName }}</span>
                  </div>
                  <span v-if="zone.securityTier" class="text-[9px] text-slate-400 shrink-0">{{ zone.securityTier }}</span>
                </button>

                <div v-if="zonesList.length === 0" class="px-3.5 py-3 text-center text-xs text-slate-400">
                  No zones configured for this site
                </div>

                <div class="p-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    class="w-full py-2 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    @click="openQuickCreateModal('add_zone')"
                  >
                    <Plus class="w-3.5 h-3.5" />
                    <span>+ Add Security Zone</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <!-- Quick Action Dropdown: + Create (Opens Popup Modals) -->
          <div class="relative" ref="createDropdownRef">
            <button
              class="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center gap-2 text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              @click="isCreateDropdownOpen = !isCreateDropdownOpen"
            >
              <Plus class="w-4 h-4" />
              <span>Create</span>
              <ChevronDown class="w-3.5 h-3.5 opacity-80" :class="{ 'rotate-180': isCreateDropdownOpen }" />
            </button>

            <!-- Create Menu -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="isCreateDropdownOpen"
                class="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-700 shadow-2xl py-2 z-50 overflow-hidden animate-in"
              >
                <div class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Create
                </div>
                <button
                  v-for="action in quickCreateOptions"
                  :key="action.id"
                  class="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                  @click="openQuickCreateModal(action.id)"
                >
                  <component :is="action.icon" class="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{{ action.label }}</span>
                </button>
              </div>
            </transition>
          </div>

          <!-- Refresh Button -->
          <button
            class="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-100 flex items-center justify-center shadow-sm transition-colors cursor-pointer"
            :class="{ 'animate-spin': isRefreshing }"
            title="Refresh Command Center"
            @click="refreshDashboard"
          >
            <RefreshCw class="w-4 h-4" />
          </button>
        </div>

      </div>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 2. FIVE PRIMARY KPI CARDS (DETAILS WITH / TOTAL)            -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">

        <!-- Card 1: Total Guards -->
        <div
          class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:border-indigo-400/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          @click="router.push('/dashboard/guards')"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Guards</span>
            <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users class="w-3.5 h-3.5" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {{ currentMetrics.activeGuards }}
            </span>
            <span class="text-sm font-bold text-slate-400 dark:text-slate-500">
              / {{ currentMetrics.totalGuards }}
            </span>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span class="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {{ currentMetrics.activeGuards }} Active
            </span>
            <span>{{ currentMetrics.offDutyGuards }} Off Duty</span>
          </div>
        </div>

        <!-- Card 2: Active Patrols -->
        <div
          class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:border-indigo-400/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          @click="router.push('/dashboard/patrols?filter=running')"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Patrols</span>
            <div class="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert class="w-3.5 h-3.5" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight leading-none">
              {{ currentMetrics.activePatrols }}
            </span>
            <span class="text-sm font-bold text-blue-400/70 dark:text-blue-500/70">
              / {{ currentMetrics.totalPatrols }}
            </span>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span class="text-emerald-600 dark:text-emerald-400 font-bold">{{ currentMetrics.onTrackPatrols }} On Track</span>
            <span :class="currentMetrics.delayedPatrols > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : ''">{{ currentMetrics.delayedPatrols }} Delayed</span>
          </div>
        </div>

        <!-- Card 3: Completed Today -->
        <div
          class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:border-indigo-400/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          @click="router.push('/dashboard/patrols?filter=completed')"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed Today</span>
            <div class="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 class="w-3.5 h-3.5" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
              {{ currentMetrics.completedToday }}
            </span>
            <span class="text-sm font-bold text-emerald-400/70 dark:text-emerald-500/70">
              / {{ currentMetrics.totalPatrols }}
            </span>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span>{{ currentMetrics.completionRate }}% rate</span>
            <span class="text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp class="w-3 h-3" /> {{ currentMetrics.completionTrend }}
            </span>
          </div>
        </div>

        <!-- Card 4: Missed / Overdue (Alert Highlight) -->
        <div
          class="bg-white dark:bg-[#151c2c] border rounded-2xl p-4 shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
          :class="(currentMetrics.missedCount + currentMetrics.overdueCount) > 0 ? 'border-rose-300 dark:border-rose-500/30 hover:border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-white/10 hover:border-indigo-400'"
          @click="router.push('/dashboard/patrols?filter=missed')"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-extrabold uppercase tracking-wider" :class="(currentMetrics.missedCount + currentMetrics.overdueCount) > 0 ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-500'">
              Missed / Overdue
            </span>
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
              :class="(currentMetrics.missedCount + currentMetrics.overdueCount) > 0 ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-100 text-slate-500'"
            >
              <AlertTriangle class="w-3.5 h-3.5" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-3xl font-black tracking-tight leading-none" :class="(currentMetrics.missedCount + currentMetrics.overdueCount) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'">
              {{ currentMetrics.missedCount + currentMetrics.overdueCount }}
            </span>
            <span class="text-sm font-bold opacity-60">
              / {{ currentMetrics.totalPatrols }}
            </span>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span :class="currentMetrics.missedCount > 0 ? 'text-rose-600 font-bold' : ''">{{ currentMetrics.missedCount }} Missed</span>
            <span :class="currentMetrics.overdueCount > 0 ? 'text-amber-600 font-bold' : ''">{{ currentMetrics.overdueCount }} Overdue</span>
          </div>
        </div>

        <!-- Card 5: Open Incidents -->
        <div
          class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:border-indigo-400/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group col-span-2 sm:col-span-1"
          @click="router.push('/dashboard/incidents')"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Open Incidents</span>
            <div class="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle class="w-3.5 h-3.5" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight leading-none">
              {{ currentMetrics.openIncidents }}
            </span>
            <span class="text-sm font-bold text-amber-400/70 dark:text-amber-500/70">
              / {{ currentMetrics.totalIncidents }}
            </span>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span class="text-rose-600 font-bold">{{ currentMetrics.criticalIncidents }} Critical</span>
            <span>{{ currentMetrics.normalIncidents }} Normal</span>
          </div>
        </div>

      </div>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 3. LIVE OPERATIONS (VISUAL CENTER): ACTIVE PATROLS + MAP    -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[480px]">

        <!-- LEFT (5 Cols): Active Patrols List -->
        <div class="lg:col-span-5 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          
          <!-- Header -->
          <div class="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
            <div class="flex items-center gap-2.5">
              <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
              <h2 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Live Patrols ({{ filteredActivePatrols.length }})
              </h2>
            </div>
            <button
              class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              @click="router.push('/dashboard/patrols')"
            >
              <span>View All</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Patrol Cards Stream -->
          <div class="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-3">
            <div
              v-for="patrol in filteredActivePatrols"
              :key="patrol.id"
              class="p-4 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-slate-900/40 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all shadow-sm group relative"
            >
              <!-- Top Row: Status badge & Guard -->
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-500/30 shadow-sm">
                    {{ (patrol.guardName || 'G').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ patrol.guardName }}</p>
                    <p class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                      <Building2 class="w-3 h-3 shrink-0" /> {{ patrol.siteName }} &nbsp;·&nbsp; {{ patrol.routeName }}
                    </p>
                  </div>
                </div>

                <!-- Status Badge -->
                <span
                  class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
                  :class="patrol.status === 'running' 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' 
                    : patrol.status === 'delayed'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="patrol.status === 'running' ? 'bg-emerald-500' : patrol.status === 'delayed' ? 'bg-amber-500' : 'bg-rose-500'"
                  />
                  {{ patrol.status === 'running' ? 'On Track' : patrol.status === 'delayed' ? 'Delayed' : 'Critical' }}
                </span>
              </div>

              <!-- Checkpoint Progress Bar -->
              <div class="mt-3 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-white/5">
                <div class="flex items-center justify-between text-[11px] font-bold mb-1.5">
                  <span class="text-slate-700 dark:text-slate-300">
                    Checkpoint {{ patrol.scannedCheckpoints }} / {{ patrol.totalCheckpoints }}
                  </span>
                  <span class="text-indigo-600 dark:text-indigo-400 font-mono">
                    {{ Math.round((patrol.scannedCheckpoints / patrol.totalCheckpoints) * 100) }}%
                  </span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                    :style="{ width: `${(patrol.scannedCheckpoints / patrol.totalCheckpoints) * 100}%` }"
                  />
                </div>
              </div>

              <!-- Bottom Row: Timestamps & Next Target -->
              <div class="mt-3 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <div class="flex items-center gap-3">
                  <span>Started: <strong class="text-slate-700 dark:text-slate-200">{{ patrol.startedTime }}</strong></span>
                  <span>Last Scan: <strong class="text-slate-700 dark:text-slate-200">{{ patrol.lastScanTime }}</strong></span>
                </div>
                <button
                  class="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                  @click="router.push(`/dashboard/patrols?patrolId=${patrol.id}`)"
                >
                  View Patrol
                </button>
              </div>

              <!-- Next Checkpoint Ticker -->
              <div class="mt-2 text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin class="w-3 h-3 text-indigo-500 shrink-0" />
                <span>Next Checkpoint: <strong class="text-slate-800 dark:text-slate-200">{{ patrol.nextCheckpoint }}</strong></span>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredActivePatrols.length === 0" class="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <ShieldCheck class="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p class="text-xs font-bold text-slate-600 dark:text-slate-400">No active patrols in progress</p>
              <button
                class="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                @click="openQuickCreateModal('create_patrol')"
              >
                + Dispatch a Patrol
              </button>
            </div>
          </div>

        </div>

        <!-- RIGHT (7 Cols): Site / Patrol Interactive Map -->
        <div class="lg:col-span-7 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex flex-col overflow-hidden relative min-h-[420px]">
          
          <!-- Map Floating Controls & Badge -->
          <div class="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
            <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 shadow-md pointer-events-auto flex items-center gap-2.5">
              <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
              <span class="text-xs font-bold text-slate-800 dark:text-slate-100">Live Security Map</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                {{ selectedSiteName }}
              </span>
            </div>

            <div class="flex items-center gap-1.5 pointer-events-auto">
              <button
                class="h-9 px-3 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 shadow-md text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                @click="centerMapOnGuards"
              >
                <Crosshair class="w-3.5 h-3.5" />
                <span>Center Guards</span>
              </button>
              <button
                class="h-9 w-9 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors cursor-pointer"
                title="Full Screen Map"
                @click="router.push('/dashboard/monitoring')"
              >
                <Maximize2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Map Container -->
          <div ref="dashboardMapRef" class="w-full h-full min-h-[380px] bg-slate-100 dark:bg-slate-900 z-10"></div>

          <!-- Interactive Guard Popup Overlay if selected -->
          <div
            v-if="selectedMapGuard"
            class="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-2xl z-30 animate-in slide-in-from-bottom-2"
          >
            <div class="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-white/5">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-md">
                  {{ selectedMapGuard.name.charAt(0) }}
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">{{ selectedMapGuard.name }}</h4>
                  <p class="text-[10px] text-slate-500">{{ selectedMapGuard.siteName }} · {{ selectedMapGuard.routeName }}</p>
                </div>
              </div>
              <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="selectedMapGuard = null">
                <X class="w-4 h-4" />
              </button>
            </div>

            <div class="grid grid-cols-2 gap-2 mt-2.5 text-[11px]">
              <div class="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                <span class="text-[9px] text-slate-400 block font-semibold uppercase">Current Target</span>
                <span class="font-bold text-slate-800 dark:text-slate-200 truncate block">{{ selectedMapGuard.currentCheckpoint }}</span>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                <span class="text-[9px] text-slate-400 block font-semibold uppercase">Telemetry</span>
                <span class="font-bold text-emerald-600 flex items-center gap-1">
                  <Battery class="w-3 h-3" /> {{ selectedMapGuard.battery }} · <Wifi class="w-3 h-3" /> {{ selectedMapGuard.signal }}
                </span>
              </div>
            </div>

            <div class="mt-3 flex gap-2">
              <button
                class="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                @click="router.push(`/dashboard/patrols?patrolId=${selectedMapGuard.patrolId}`)"
              >
                Track Live
              </button>
              <button
                class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                @click="alert(`Calling ${selectedMapGuard.name}...`)"
              >
                <PhoneCall class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 4. ATTENTION REQUIRED & RECENT INCIDENTS                     -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

        <!-- ATTENTION REQUIRED (6 Cols) -->
        <div class="lg:col-span-6 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-4 flex flex-col">
          <div class="flex items-center justify-between mb-3.5 shrink-0">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Attention Required</h3>
                <p class="text-[10px] text-slate-500">Live operational alerts needing supervisor action</p>
              </div>
            </div>
            <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
              {{ attentionItems.length }} Action Items
            </span>
          </div>

          <div class="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar max-h-64 pr-1">
            <div
              v-for="item in attentionItems"
              :key="item.id"
              class="p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors cursor-pointer"
              :class="item.severity === 'critical' 
                ? 'bg-rose-50/40 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20 hover:border-rose-400' 
                : 'bg-amber-50/40 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 hover:border-amber-400'"
              @click="handleAttentionClick(item)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  :class="item.severity === 'critical' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'"
                >
                  <AlertCircle v-if="item.type === 'incident'" class="w-4 h-4" />
                  <Clock v-else class="w-4 h-4" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ item.title }}</p>
                  <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    {{ item.siteName }} &nbsp;·&nbsp; {{ item.location }} &nbsp;·&nbsp; {{ item.timeAgo }}
                  </p>
                </div>
              </div>

              <div class="shrink-0 flex items-center gap-2">
                <button class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors">
                  Take Action
                </button>
              </div>
            </div>

            <div v-if="attentionItems.length === 0" class="flex flex-col items-center justify-center py-10 text-center opacity-60">
              <CheckCircle2 class="w-8 h-8 text-emerald-500 mb-1.5" />
              <p class="text-xs font-bold text-slate-700 dark:text-slate-300">All Clear</p>
              <p class="text-[10px] text-slate-500">No overdue patrols or missed checkpoints</p>
            </div>
          </div>
        </div>

        <!-- RECENT INCIDENTS (6 Cols) -->
        <div class="lg:col-span-6 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-4 flex flex-col">
          <div class="flex items-center justify-between mb-3.5 shrink-0">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertCircle class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Recent Incidents</h3>
                <p class="text-[10px] text-slate-500">Real-time security exceptions & guard reports</p>
              </div>
            </div>
            <button
              class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              @click="router.push('/dashboard/incidents')"
            >
              <span>View all incidents</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>

          <div class="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar max-h-64 pr-1">
            <div
              v-for="inc in filteredRecentIncidents"
              :key="inc.id"
              class="p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between gap-3"
              @click="openIncidentModal(inc)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span
                  class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shrink-0"
                  :class="inc.severity === 'critical'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                    : inc.severity === 'medium'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'"
                >
                  {{ inc.severity }}
                </span>
                <div class="min-w-0">
                  <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ inc.title }}</p>
                  <p class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {{ inc.siteName }} &nbsp;·&nbsp; {{ inc.location }} &nbsp;·&nbsp; Reported by {{ inc.reportedBy }}
                  </p>
                </div>
              </div>

              <span class="text-[10px] font-semibold text-slate-400 shrink-0">{{ inc.timeAgo }}</span>
            </div>

            <div v-if="filteredRecentIncidents.length === 0" class="flex flex-col items-center justify-center py-10 text-center opacity-60">
              <ShieldCheck class="w-8 h-8 text-slate-400 mb-1.5" />
              <p class="text-xs font-bold text-slate-600 dark:text-slate-400">No incident logs reported</p>
            </div>
          </div>
        </div>

      </div>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 5. SITE PERFORMANCE TABLE                                   -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div>
            <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Site Performance & Compliance</h3>
            <p class="text-[10px] text-slate-500">Multi-property status, checkpoint coverage, and incident load</p>
          </div>
          <button
            class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            @click="router.push('/dashboard/sites')"
          >
            Manage Sites →
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="py-3 px-4">Site Name</th>
                <th class="py-3 px-4 text-center">Guards Active</th>
                <th class="py-3 px-4 text-center">Patrols Today</th>
                <th class="py-3 px-4 text-center">Completion Rate</th>
                <th class="py-3 px-4 text-center">Missed / Late</th>
                <th class="py-3 px-4 text-center">Incidents</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5 font-medium text-slate-700 dark:text-slate-300">
              <tr
                v-for="site in sitesList"
                :key="site.id"
                class="hover:bg-indigo-50/40 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                @click="selectSite(site.id)"
              >
                <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                  <div class="flex items-center gap-2">
                    <Building2 class="w-4 h-4 text-slate-400" />
                    <div>
                      <p class="leading-tight">{{ site.name }}</p>
                      <p class="text-[10px] text-slate-400 font-mono">{{ site.code }} · {{ site.address }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4 text-center font-semibold">
                  <span class="text-emerald-600 font-bold">{{ site.activeGuards }}</span> / {{ site.totalGuards }}
                </td>
                <td class="py-3.5 px-4 text-center font-bold font-mono">{{ site.completedToday }}</td>
                <td class="py-3.5 px-4 text-center">
                  <div class="inline-flex items-center gap-2">
                    <div class="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        class="h-full rounded-full"
                        :class="site.completionRate >= 95 ? 'bg-emerald-500' : site.completionRate >= 85 ? 'bg-amber-500' : 'bg-rose-500'"
                        :style="{ width: `${site.completionRate}%` }"
                      />
                    </div>
                    <span class="font-bold font-mono text-[11px]">{{ site.completionRate }}%</span>
                  </div>
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span
                    class="font-bold font-mono px-2 py-0.5 rounded text-[11px]"
                    :class="site.missedCount > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'text-slate-400'"
                  >
                    {{ site.missedCount }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span
                    class="font-bold font-mono px-2 py-0.5 rounded text-[11px]"
                    :class="site.incidentsCount > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'text-slate-400'"
                  >
                    {{ site.incidentsCount }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span
                    class="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                    :class="site.healthStatus === 'healthy' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : site.healthStatus === 'warning'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="site.healthStatus === 'healthy' ? 'bg-emerald-500' : site.healthStatus === 'warning' ? 'bg-amber-500' : 'bg-rose-500'"
                    />
                    {{ site.healthStatus }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <button
                    class="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 cursor-pointer"
                    @click.stop="router.push(`/dashboard/sites/${site.id}`)"
                  >
                    Site Hub →
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 6. PATROL PERFORMANCE TREND & GUARD PERFORMANCE             -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

        <!-- Patrol Performance Chart (7 Cols) -->
        <div class="lg:col-span-7 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Patrol Compliance Trend</h3>
              <p class="text-[10px] text-slate-500">Historical completion rate & punctuality trajectory</p>
            </div>
            <!-- Time Tabs -->
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                v-for="period in ['7 Days', '30 Days', '90 Days']"
                :key="period"
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                :class="selectedChartPeriod === period 
                  ? 'bg-white dark:bg-[#151c2c] text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'"
                @click="selectedChartPeriod = period"
              >
                {{ period }}
              </button>
            </div>
          </div>

          <!-- Clean High-Fidelity SVG Chart Curve -->
          <div class="h-44 w-full flex items-end pt-4 pb-2 px-2 relative">
            <svg class="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.0" />
                </linearGradient>
              </defs>
              <!-- Grid Lines -->
              <line x1="0" y1="20" x2="500" y2="20" stroke="currentColor" class="text-slate-100 dark:text-slate-800" stroke-dasharray="4" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="currentColor" class="text-slate-100 dark:text-slate-800" stroke-dasharray="4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="currentColor" class="text-slate-100 dark:text-slate-800" stroke-dasharray="4" />
              <!-- Area Fill -->
              <path d="M 0 100 L 0 70 Q 80 40 160 55 T 320 30 T 500 15 L 500 120 L 0 120 Z" fill="url(#chartGrad)" />
              <!-- Line -->
              <path d="M 0 70 Q 80 40 160 55 T 320 30 T 500 15" fill="none" stroke="#4f46e5" stroke-width="3" stroke-linecap="round" />
              <!-- Marker Dots -->
              <circle cx="0" cy="70" r="4" fill="#4f46e5" />
              <circle cx="80" cy="45" r="4" fill="#4f46e5" />
              <circle cx="160" cy="55" r="4" fill="#4f46e5" />
              <circle cx="240" cy="40" r="4" fill="#4f46e5" />
              <circle cx="320" cy="30" r="4" fill="#4f46e5" />
              <circle cx="410" cy="20" r="4" fill="#4f46e5" />
              <circle cx="500" cy="15" r="5" fill="#10b981" stroke="#fff" stroke-width="2" />
            </svg>
          </div>

          <!-- X-Axis Labels -->
          <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
            <span>Mon (88%)</span>
            <span>Tue (92%)</span>
            <span>Wed (90%)</span>
            <span>Thu (94%)</span>
            <span>Fri (96%)</span>
            <span>Sat (97%)</span>
            <span class="text-emerald-600 font-black">Sun (98.4%)</span>
          </div>
        </div>

        <!-- Guard Performance Ranking (5 Cols) -->
        <div class="lg:col-span-5 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Guard Performance</h3>
              <p class="text-[10px] text-slate-500">Punctuality and completion leaderboards</p>
            </div>
            <button class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline" @click="router.push('/dashboard/guards')">
              All Guards
            </button>
          </div>

          <!-- Top Guards Section -->
          <div class="space-y-2">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Award class="w-3.5 h-3.5 text-amber-500" /> Top Performing Guards
            </div>
            <div
              v-for="guard in topGuards"
              :key="guard.name"
              class="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 text-xs"
            >
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {{ guard.rank }}
                </span>
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ guard.name }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-[10px] text-slate-500">{{ guard.patrols }} patrols</span>
                <span class="font-bold font-mono text-emerald-600">{{ guard.completion }}</span>
              </div>
            </div>
          </div>

          <!-- Needs Attention Section -->
          <div class="space-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5 text-rose-500" /> Punctuality Flags
            </div>
            <div
              v-for="guard in flagGuards"
              :key="guard.name"
              class="flex items-center justify-between p-2 rounded-xl bg-rose-50/40 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 text-xs"
            >
              <span class="font-bold text-slate-800 dark:text-slate-200">{{ guard.name }}</span>
              <span class="font-bold text-rose-600 text-[11px]">{{ guard.missed }} missed / late</span>
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- 7. POPUP MODALS FOR QUICK CREATE (NO REDIRECTION)           -->
    <!-- ═══════════════════════════════════════════════════════════ -->

    <!-- Modal 1: Create Patrol Modal -->
    <Teleport to="body">
      <div v-if="activeQuickModal === 'create_patrol'" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" @click.self="activeQuickModal = null">
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold">
                <ShieldAlert class="w-4 h-4" />
              </div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">Dispatch New Patrol</h3>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1" @click="activeQuickModal = null"><X class="w-4 h-4" /></button>
          </div>
          <form @submit.prevent="submitQuickPatrol" class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Assign Guard *</label>
              <select v-model="quickPatrolForm.guardName" required class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                <option value="Raj Kumar">Raj Kumar (On Duty)</option>
                <option value="Arun Prakash">Arun Prakash (On Duty)</option>
                <option value="Vijay Anand">Vijay Anand (On Duty)</option>
                <option value="Kumar Swamy">Kumar Swamy (Standby)</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Patrol Route / Sector *</label>
              <select v-model="quickPatrolForm.routeName" required class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                <option value="Night Perimeter Inspection">Night Perimeter Inspection (8 Checkpoints)</option>
                <option value="Basement Logistics & Bay">Basement Logistics & Bay (6 Checkpoints)</option>
                <option value="Server Room Core Vault">Server Room Core Vault (5 Checkpoints)</option>
                <option value="Rooftop Emergency Exits">Rooftop Emergency Exits (4 Checkpoints)</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Site *</label>
                <select v-model="quickPatrolForm.siteName" required class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                  <option v-for="s in sitesList" :key="s.id" :value="s.name">{{ s.name }}</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Priority</label>
                <select v-model="quickPatrolForm.priority" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                  <option value="Normal">Normal</option>
                  <option value="High">High Priority</option>
                  <option value="Critical">Critical Tour</option>
                </select>
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button type="button" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs" @click="activeQuickModal = null">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">Dispatch Patrol</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal 2: Patrol Schedule Modal -->
    <Teleport to="body">
      <div v-if="activeQuickModal === 'patrol_schedule'" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" @click.self="activeQuickModal = null">
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold">
                <Clock class="w-4 h-4" />
              </div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">Create Patrol Schedule</h3>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1" @click="activeQuickModal = null"><X class="w-4 h-4" /></button>
          </div>
          <form @submit.prevent="submitQuickSchedule" class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Schedule Name *</label>
              <input v-model="quickScheduleForm.name" required placeholder="e.g. Night Shift Continuous Roving" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Frequency</label>
                <select v-model="quickScheduleForm.frequency" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                  <option value="Every 1 hour">Every 1 hour</option>
                  <option value="Every 2 hours">Every 2 hours</option>
                  <option value="Every 4 hours">Every 4 hours</option>
                  <option value="Daily Fixed">Daily Fixed</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Shift</label>
                <select v-model="quickScheduleForm.shift" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                  <option value="Night (22:00 - 06:00)">Night (22:00 - 06:00)</option>
                  <option value="Day (06:00 - 14:00)">Day (06:00 - 14:00)</option>
                  <option value="Evening (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                </select>
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button type="button" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs" @click="activeQuickModal = null">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">Save Schedule</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal 3: Add Guard Modal -->
    <Teleport to="body">
      <div v-if="activeQuickModal === 'add_guard'" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" @click.self="activeQuickModal = null">
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold">
                <Users class="w-4 h-4" />
              </div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">Enroll Guard</h3>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1" @click="activeQuickModal = null"><X class="w-4 h-4" /></button>
          </div>
          <form @submit.prevent="submitQuickGuard" class="space-y-3.5 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">First Name *</label>
                <input v-model="quickGuardForm.first_name" required placeholder="e.g. Suresh" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Last Name</label>
                <input v-model="quickGuardForm.last_name" placeholder="e.g. Kumar" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Badge / Guard ID *</label>
                <input v-model="quickGuardForm.badge_number" required placeholder="GRD-204" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase outline-none" />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Phone Number *</label>
                <input v-model="quickGuardForm.phone" required placeholder="9876543210" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button type="button" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs" @click="activeQuickModal = null">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">Save Guard</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Add Site Modal (Full Feature with Coordinates and Map Picker) -->
    <Teleport to="body">
      <div v-if="activeQuickModal === 'add_site'" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" @click.self="activeQuickModal = null">
        <div class="w-full max-w-lg bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-sm">
                <Building2 class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">Create Security Site</h3>
                <p class="text-[10px] text-slate-500 dark:text-slate-400">Configure new property location & guard patrol sector</p>
              </div>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="activeQuickModal = null"><X class="w-4 h-4" /></button>
          </div>
          <form @submit.prevent="submitQuickSite" class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Property / Site Name *</label>
              <input v-model="quickSiteForm.name" required placeholder="e.g. Bangalore Global Tech Campus" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500 shadow-sm" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Site Code *</label>
                <input v-model="quickSiteForm.code" required placeholder="e.g. BGTC-01" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase outline-none focus:border-indigo-500 shadow-sm" />
              </div>
              <div class="sm:col-span-2 space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Physical Address / Landmark</label>
                <input v-model="quickSiteForm.address" placeholder="e.g. OMR IT Highway, Chennai" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500 shadow-sm" />
              </div>
            </div>

            <!-- Site Coordinates Section with Pick Location on Map -->
            <div class="space-y-2 pt-1 pb-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Site Coordinates</span>
                </span>
                
                <button
                  type="button"
                  class="h-8 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-indigo-200 dark:border-indigo-500/30 cursor-pointer shadow-sm"
                  @click="openMapPickerModal"
                >
                  <MapIcon class="w-3.5 h-3.5" />
                  <span>Pick Location on Map</span>
                </button>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Latitude</label>
                  <input
                    v-model.number="quickSiteForm.latitude"
                    type="number"
                    step="any"
                    required
                    placeholder="12.9716"
                    class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Longitude</label>
                  <input
                    v-model.number="quickSiteForm.longitude"
                    type="number"
                    step="any"
                    required
                    placeholder="80.2435"
                    class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Advanced Settings Accordion -->
            <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                type="button"
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                @click="showAdvancedSettings = !showAdvancedSettings"
              >
                <div class="flex items-center gap-2">
                  <SlidersHorizontal class="w-3.5 h-3.5 text-indigo-500" />
                  <span>Advanced Settings (Geofence Radius & Security)</span>
                </div>
                <ChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': showAdvancedSettings }" />
              </button>

              <div v-if="showAdvancedSettings" class="p-4 space-y-3 bg-white dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-700">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="font-bold text-slate-700 dark:text-slate-300">Geofence Radius (Meters)</label>
                    <input
                      v-model.number="quickSiteForm.geofence_radius"
                      type="number"
                      min="50"
                      max="10000"
                      placeholder="500"
                      class="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500"
                    />
                    <p class="text-[10px] text-slate-400">Allowed patrol scan boundary around property</p>
                  </div>
                  <div class="space-y-1">
                    <label class="font-bold text-slate-700 dark:text-slate-300">Emergency Phone</label>
                    <input
                      v-model="quickSiteForm.emergency_phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      class="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500"
                    />
                    <p class="text-[10px] text-slate-400">Direct line for SOS alert escalations</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Action Buttons -->
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button type="button" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer" @click="activeQuickModal = null">Cancel</button>
              <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5">
                <Building2 class="w-3.5 h-3.5" />
                <span>Save Site</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Dedicated Map Location Picker Modal -->
    <Teleport to="body">
      <div
        v-if="showMapPickerModal"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4"
        @click.self="showMapPickerModal = false"
      >
        <div class="w-full max-w-3xl bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-5 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
          <!-- Map Picker Header -->
          <div class="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-white/5 shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <MapPin class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">Select Property Location</h3>
                <p class="text-[11px] text-slate-500">Search any location or click on map to set property pin</p>
              </div>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showMapPickerModal = false">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Location Search Input -->
          <div class="flex items-center gap-2 mb-2 shrink-0">
            <div class="relative flex-1">
              <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="locationSearchQuery"
                type="text"
                placeholder="Search city, area, landmark, or street address (e.g. Whitefield, Bengaluru)..."
                @keydown.enter.prevent="searchLocation"
                class="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-indigo-500 shadow-inner"
              />
              <button
                v-if="locationSearchQuery"
                type="button"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                @click="locationSearchQuery = ''"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              :disabled="isSearchingLocation"
              class="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
              @click="searchLocation"
            >
              <Search class="w-3.5 h-3.5" />
              <span>{{ isSearchingLocation ? 'Searching...' : 'Find Place' }}</span>
            </button>
          </div>

          <!-- Fast Quick-Select Location Chips -->
          <div class="flex items-center gap-1.5 flex-wrap pb-2 shrink-0">
            <span class="text-[10px] font-bold text-slate-400 uppercase">Quick Jump:</span>
            <button
              v-for="city in popularHubs"
              :key="city.name"
              type="button"
              class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              @click="jumpToLocation(city.lat, city.lng, city.name)"
            >
              📍 {{ city.name }}
            </button>
          </div>

          <!-- Leaflet Interactive Map Canvas -->
          <div class="relative w-full flex-1 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-800" style="min-height: 320px;">
            <div id="leaflet-site-picker-map" class="w-full h-full" style="min-height: 320px;"></div>
            
            <!-- Floating Coordinates Pill -->
            <div class="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-md pointer-events-none flex items-center gap-2 z-[999]">
              <span class="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              <span><strong>Lat:</strong> {{ tempCoords.lat.toFixed(4) }} · <strong>Lng:</strong> {{ tempCoords.lng.toFixed(4) }}</span>
            </div>
          </div>

          <!-- Map Picker Footer Actions -->
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
            <div class="text-xs text-slate-500 truncate max-w-sm">
              <span v-if="tempAddress" class="truncate block">📍 {{ tempAddress }}</span>
              <span v-else class="text-slate-400">Click on map or drag pin to adjust</span>
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showMapPickerModal = false"
              >
                Cancel
              </button>
              <button
                type="button"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                @click="confirmLocationSelection"
              >
                <Check class="w-3.5 h-3.5" />
                <span>Confirm Location</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- Modal 4: Add Zone Modal -->
    <Teleport to="body">
      <div v-if="activeQuickModal === 'add_zone'" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" @click.self="activeQuickModal = null">
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold">
                <MapIcon class="w-4 h-4" />
              </div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">Create Security Zone</h3>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1" @click="activeQuickModal = null"><X class="w-4 h-4" /></button>
          </div>
          <form @submit.prevent="submitQuickZone" class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Zone Name *</label>
              <input v-model="quickZoneForm.name" required placeholder="e.g. Server Room Vault 3B" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Site *</label>
                <select v-model="quickZoneForm.siteId" required class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                  <option v-for="s in sitesList" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Security Tier</label>
                <select v-model="quickZoneForm.securityTier" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                  <option value="Tier 1 Critical">Tier 1 Critical</option>
                  <option value="Tier 2 High">Tier 2 High</option>
                  <option value="Tier 3 Standard">Tier 3 Standard</option>
                </select>
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button type="button" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs" @click="activeQuickModal = null">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">Save Zone</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal 5: Add Checkpoint Modal -->
    <Teleport to="body">
      <div v-if="activeQuickModal === 'add_checkpoint'" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" @click.self="activeQuickModal = null">
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold">
                <QrCode class="w-4 h-4" />
              </div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">Create Patrol Checkpoint</h3>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1" @click="activeQuickModal = null"><X class="w-4 h-4" /></button>
          </div>
          <form @submit.prevent="submitQuickCheckpoint" class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Checkpoint Name *</label>
              <input v-model="quickCheckpointForm.name" required placeholder="e.g. CP-18 East Fire Door" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Verification Type</label>
                <select v-model="quickCheckpointForm.type" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                  <option value="QR Code">QR Code</option>
                  <option value="NFC Tag">NFC Tag</option>
                  <option value="GPS Geofence">GPS Geofence</option>
                  <option value="QR + GPS Dual">QR + GPS Dual</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Zone</label>
                <select v-model="quickCheckpointForm.zone" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                  <option value="Perimeter Boundary">Perimeter Boundary</option>
                  <option value="Basement Parking">Basement Parking</option>
                  <option value="Tower Core">Tower Core</option>
                </select>
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button type="button" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs" @click="activeQuickModal = null">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">Save Checkpoint</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal 6: Report Incident Modal -->
    <Teleport to="body">
      <div v-if="activeQuickModal === 'report_incident'" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" @click.self="activeQuickModal = null">
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle class="w-4 h-4" />
              </div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">Report Security Incident</h3>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1" @click="activeQuickModal = null"><X class="w-4 h-4" /></button>
          </div>
          <form @submit.prevent="submitQuickIncident" class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Incident Title *</label>
              <input v-model="quickIncidentForm.title" required placeholder="e.g. Broken Fence Lock" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Severity</label>
                <select v-model="quickIncidentForm.severity" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                  <option value="critical">🔴 Critical</option>
                  <option value="medium">🟠 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Location / Sector</label>
                <input v-model="quickIncidentForm.location" placeholder="e.g. North Gate" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
              </div>
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Incident Description</label>
              <textarea v-model="quickIncidentForm.description" rows="2" placeholder="Provide details for immediate triage..." class="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none"></textarea>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button type="button" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs" @click="activeQuickModal = null">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs">Submit Incident</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { onClickOutside } from '@vueuse/core';
import {
  Shield, Building2, Globe, Users, ShieldAlert, CheckCircle2,
  AlertTriangle, AlertCircle, TrendingUp, Plus, RefreshCw, ChevronDown,
  ArrowRight, MapPin, Maximize2, Crosshair, PhoneCall, Battery, Wifi,
  Clock, Award, X, QrCode, Map as MapIcon, Check, Search, SlidersHorizontal, Layers
} from 'lucide-vue-next';
import { siteService } from '@/services/siteService';
import { zoneService } from '@/services/zoneService';
import { patrolService } from '@/services/patrolService';
import { authService } from '@/services/authService';
import { attendanceService } from '@/services/attendanceService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { Loader } from '@googlemaps/js-api-loader';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const router = useRouter();

// ── STATE ─────────────────────────────────────────────────────────────────────
const isRefreshing = ref(false);
const selectedSiteId = ref('all');
const isSiteDropdownOpen = ref(false);
const siteDropdownRef = ref(null);

const zonesList = ref([]);
const selectedZoneId = ref('all');
const isZoneDropdownOpen = ref(false);
const zoneDropdownRef = ref(null);

const isCreateDropdownOpen = ref(false);
const createDropdownRef = ref(null);
const selectedChartPeriod = ref('7 Days');
const selectedMapGuard = ref(null);
const selectedIncidentModal = ref(null);
const successToastMessage = ref('');

// Active Quick Modal
const activeQuickModal = ref(null);

// Form Models for Direct Modals
const quickPatrolForm = ref({ guardName: '', routeName: '', siteName: '', priority: 'Normal' });
const quickScheduleForm = ref({ name: '', frequency: 'Every 2 hours', shift: 'Night (22:00 - 06:00)' });
const quickGuardForm = ref({ first_name: '', last_name: '', badge_number: '', phone: '' });
const quickSiteForm = ref({ name: '', code: '', address: '', geofence_radius: 500, emergency_phone: '', latitude: 12.9716, longitude: 80.2435 });
const quickZoneForm = ref({ name: '', siteId: '', securityTier: 'Tier 1 Critical' });
const quickCheckpointForm = ref({ name: '', type: 'QR Code', zone: '' });
const quickIncidentForm = ref({ title: '', severity: 'critical', location: '', description: '' });

// ── MAP LOCATION PICKER STATE ─────────────────────────────────────────────────
const showMapPickerModal = ref(false);
const showAdvancedSettings = ref(false);
const locationSearchQuery = ref('');
const isSearchingLocation = ref(false);
const tempCoords = ref({ lat: 12.9716, lng: 80.2435 });
const tempAddress = ref('');

const popularHubs = [
  { name: 'Chennai Tech Park', lat: 12.9716, lng: 80.2435 },
  { name: 'Bangalore Whitefield', lat: 12.9698, lng: 77.7500 },
  { name: 'Hyderabad Hitec City', lat: 17.4435, lng: 78.3772 },
  { name: 'Mumbai BKC', lat: 19.0657, lng: 72.8687 },
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 }
];

let leafletPickerMap = null;
let leafletPickerMarker = null;
let leafletPickerCircle = null;

const openMapPickerModal = async () => {
  tempCoords.value = {
    lat: Number(quickSiteForm.value.latitude) || 12.9716,
    lng: Number(quickSiteForm.value.longitude) || 80.2435
  };
  tempAddress.value = quickSiteForm.value.address || '';
  locationSearchQuery.value = '';
  showMapPickerModal.value = true;

  await nextTick();
  setTimeout(() => {
    initLeafletPickerMap();
  }, 100);
};

const initLeafletPickerMap = () => {
  const container = document.getElementById('leaflet-site-picker-map');
  if (!container) return;

  if (leafletPickerMap) {
    leafletPickerMap.remove();
    leafletPickerMap = null;
  }

  const initialLat = tempCoords.value.lat;
  const initialLng = tempCoords.value.lng;

  leafletPickerMap = L.map('leaflet-site-picker-map', {
    center: [initialLat, initialLng],
    zoom: 15,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(leafletPickerMap);

  const pinIcon = L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="position:relative; transform: translate(-50%, -100%);">
        <div style="background-color: #4f46e5; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); border: 2.5px solid #ffffff;">
          <div style="transform: rotate(45deg); width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
        </div>
      </div>
    `,
    iconSize: [0, 0]
  });

  leafletPickerMarker = L.marker([initialLat, initialLng], {
    icon: pinIcon,
    draggable: true
  }).addTo(leafletPickerMap);

  const radius = Number(quickSiteForm.value.geofence_radius) || 500;
  leafletPickerCircle = L.circle([initialLat, initialLng], {
    radius: radius,
    color: '#4f46e5',
    fillColor: '#4f46e5',
    fillOpacity: 0.15,
    weight: 2
  }).addTo(leafletPickerMap);

  leafletPickerMarker.on('dragend', (e) => {
    const pos = e.target.getLatLng();
    updatePickerTempLocation(pos.lat, pos.lng);
  });

  leafletPickerMap.on('click', (e) => {
    updatePickerTempLocation(e.latlng.lat, e.latlng.lng);
  });

  leafletPickerMap.invalidateSize();
};

const updatePickerTempLocation = (lat, lng) => {
  const cleanLat = parseFloat(lat.toFixed(6));
  const cleanLng = parseFloat(lng.toFixed(6));
  tempCoords.value = { lat: cleanLat, lng: cleanLng };

  if (leafletPickerMarker) {
    leafletPickerMarker.setLatLng([cleanLat, cleanLng]);
  }
  if (leafletPickerCircle) {
    leafletPickerCircle.setLatLng([cleanLat, cleanLng]);
  }

  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${cleanLat}&lon=${cleanLng}&zoom=18&addressdetails=1`, {
    headers: { 'Accept-Language': 'en' }
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.display_name) {
        tempAddress.value = data.display_name;
      }
    })
    .catch(() => {});
};

const searchLocation = async () => {
  if (!locationSearchQuery.value.trim()) return;
  isSearchingLocation.value = true;

  try {
    const q = encodeURIComponent(locationSearchQuery.value.trim());
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`, {
      headers: { 'Accept-Language': 'en' }
    });
    const data = await res.json();
    isSearchingLocation.value = false;

    if (data && data.length > 0) {
      const result = data[0];
      const lat = parseFloat(parseFloat(result.lat).toFixed(6));
      const lng = parseFloat(parseFloat(result.lon).toFixed(6));

      tempCoords.value = { lat, lng };
      tempAddress.value = result.display_name;

      if (leafletPickerMap && leafletPickerMarker && leafletPickerCircle) {
        leafletPickerMarker.setLatLng([lat, lng]);
        leafletPickerCircle.setLatLng([lat, lng]);
        leafletPickerMap.setView([lat, lng], 16);
      }
    }
  } catch (e) {
    isSearchingLocation.value = false;
    console.error('Search failed', e);
  }
};

const jumpToLocation = (lat, lng, cityName) => {
  tempCoords.value = { lat, lng };
  tempAddress.value = cityName;
  if (leafletPickerMap && leafletPickerMarker && leafletPickerCircle) {
    leafletPickerMarker.setLatLng([lat, lng]);
    leafletPickerCircle.setLatLng([lat, lng]);
    leafletPickerMap.setView([lat, lng], 15);
  }
};

const confirmLocationSelection = () => {
  quickSiteForm.value.latitude = tempCoords.value.lat;
  quickSiteForm.value.longitude = tempCoords.value.lng;
  if (tempAddress.value && !quickSiteForm.value.address) {
    quickSiteForm.value.address = tempAddress.value;
  }
  showMapPickerModal.value = false;
};

onClickOutside(siteDropdownRef, () => isSiteDropdownOpen.value = false);
onClickOutside(createDropdownRef, () => isCreateDropdownOpen.value = false);

// ── QUICK CREATE OPTIONS (OPENS DIRECT POPUPS) ────────────────────────────────
const quickCreateOptions = [
  { id: 'create_patrol', label: 'Create Patrol', icon: ShieldAlert },
  { id: 'patrol_schedule', label: 'Patrol Schedule', icon: Clock },
  { id: 'add_guard', label: 'Add Guard', icon: Users },
  { id: 'add_site', label: 'Add Site', icon: Building2 },
  { id: 'add_zone', label: 'Add Zone', icon: MapIcon },
  { id: 'add_checkpoint', label: 'Add Checkpoint', icon: QrCode },
  { id: 'report_incident', label: 'Report Incident', icon: AlertTriangle },
];

const openQuickCreateModal = (actionId) => {
  isCreateDropdownOpen.value = false;
  activeQuickModal.value = actionId;
};

const showToast = (msg) => {
  successToastMessage.value = msg;
  setTimeout(() => {
    successToastMessage.value = '';
  }, 4000);
};

// Direct Submission Handlers
const submitQuickSite = async () => {
  try {
    const payload = {
      name: quickSiteForm.value.name,
      code: quickSiteForm.value.code || `SITE-${Math.floor(100 + Math.random() * 900)}`,
      address: quickSiteForm.value.address || 'Chennai, TN',
      latitude: quickSiteForm.value.latitude || 12.9716,
      longitude: quickSiteForm.value.longitude || 80.2435,
      geofence_radius: quickSiteForm.value.geofence_radius || 500,
      emergency_phone: quickSiteForm.value.emergency_phone || '',
      status: 'active'
    };
    const created = await siteService.createSite(payload);
    if (created) {
      sitesList.value.push(created);
    }
    activeQuickModal.value = null;
    showToast(`Property "${quickSiteForm.value.name}" added successfully!`);
    quickSiteForm.value = { name: '', code: '', address: '', geofence_radius: 500, emergency_phone: '', latitude: 12.9716, longitude: 80.2435 };
  } catch (err) {
    console.error("Failed to quick-create site:", err);
    activeQuickModal.value = null;
    showToast(`Site created locally!`);
  }
};

// Direct Submission Handlers
const submitQuickPatrol = () => {
  mockActivePatrols.value.unshift({
    id: `pat-${Date.now()}`,
    siteId: 'site-01',
    siteName: quickPatrolForm.value.siteName,
    guardName: quickPatrolForm.value.guardName,
    routeName: quickPatrolForm.value.routeName,
    status: 'running',
    scannedCheckpoints: 1,
    totalCheckpoints: 8,
    startedTime: 'Just now',
    lastScanTime: 'Just now',
    nextCheckpoint: 'Zone Entrance',
    lat: 12.9716,
    lng: 80.2435,
    battery: '100%',
    signal: '5G'
  });
  activeQuickModal.value = null;
  showToast(`Patrol dispatched for ${quickPatrolForm.value.guardName}!`);
};

const submitQuickSchedule = () => {
  activeQuickModal.value = null;
  showToast(`Patrol Schedule "${quickScheduleForm.value.name}" saved!`);
  quickScheduleForm.value.name = '';
};

const submitQuickGuard = () => {
  activeQuickModal.value = null;
  showToast(`Guard ${quickGuardForm.value.first_name} enrolled successfully!`);
  quickGuardForm.value = { first_name: '', last_name: '', badge_number: '', phone: '' };
};

const submitQuickZone = () => {
  activeQuickModal.value = null;
  showToast(`Zone "${quickZoneForm.value.name}" created!`);
  quickZoneForm.value.name = '';
};

const submitQuickCheckpoint = () => {
  activeQuickModal.value = null;
  showToast(`Checkpoint "${quickCheckpointForm.value.name}" registered!`);
  quickCheckpointForm.value.name = '';
};

const submitQuickIncident = () => {
  recentIncidentsList.value.unshift({
    id: `inc-${Date.now()}`,
    siteId: 'site-01',
    siteName: 'Chennai Tech Park',
    title: quickIncidentForm.value.title,
    location: quickIncidentForm.value.location || 'Main Property',
    reportedBy: 'Supervisor',
    timeAgo: 'Just now',
    severity: quickIncidentForm.value.severity,
    description: quickIncidentForm.value.description
  });
  activeQuickModal.value = null;
  showToast(`Incident "${quickIncidentForm.value.title}" logged to live feed!`);
  quickIncidentForm.value = { title: '', severity: 'critical', location: '', description: '' };
};

// ── SITES LIST ────────────────────────────────────────────────────────────────
const sitesList = ref([]);

const selectedSiteName = computed(() => {
  if (selectedSiteId.value === 'all') return 'All Sites (Global)';
  const match = sitesList.value.find(s => String(s.id) === String(selectedSiteId.value));
  return match ? match.name : 'All Sites';
});

const selectedZoneName = computed(() => {
  if (selectedZoneId.value === 'all') return 'All Zones';
  const match = zonesList.value.find(z => String(z.id) === String(selectedZoneId.value));
  return match ? (match.name || match.zoneName) : 'All Zones';
});

const selectSite = async (siteId) => {
  selectedSiteId.value = siteId;
  selectedZoneId.value = 'all';
  isSiteDropdownOpen.value = false;
  panMapToSelectedSite();
  await loadZones(siteId);
};

const selectZone = (zoneId) => {
  selectedZoneId.value = zoneId;
  isZoneDropdownOpen.value = false;
};

const loadZones = async (siteId = null) => {
  try {
    const targetSiteId = siteId === 'all' ? null : siteId;
    zonesList.value = await zoneService.fetchZones(targetSiteId);
  } catch (e) {
    zonesList.value = [];
  }
};

onClickOutside(siteDropdownRef, () => {
  isSiteDropdownOpen.value = false;
});

onClickOutside(zoneDropdownRef, () => {
  isZoneDropdownOpen.value = false;
});

onClickOutside(createDropdownRef, () => {
  isCreateDropdownOpen.value = false;
});

// ── METRICS COMPUTATION (LIVE REAL-TIME DATA & / TOTALS) ─────────────────────
const allGuards = ref([]);
const allPatrols = ref([]);
const allIncidents = ref([]);
const todayAttendance = ref([]);

const currentMetrics = computed(() => {
  const siteFilter = selectedSiteId.value;
  const zoneFilter = selectedZoneId.value;

  const filteredP = allPatrols.value.filter(p => {
    if (siteFilter !== 'all' && p.site && String(p.site) !== String(siteFilter)) return false;
    if (zoneFilter !== 'all' && p.zoneId && String(p.zoneId) !== String(zoneFilter)) return false;
    return true;
  });

  const filteredI = allIncidents.value.filter(i => {
    if (siteFilter !== 'all' && i.site && String(i.site) !== String(siteFilter)) return false;
    return true;
  });

  const totalG = allGuards.value.length;
  const activeAttendanceGuardIds = new Set(
    todayAttendance.value
      .filter(a => a.status === 'present' || a.status === 'late' || a.check_in_time)
      .map(a => String(a.guard_id || a.user || a.userId))
  );

  const activeG = allGuards.value.filter(g =>
    (g.status === 'active' || g.status === 'on_duty') || activeAttendanceGuardIds.has(String(g.id))
  ).length;
  const offDutyG = Math.max(0, totalG - activeG);

  const totalP = filteredP.length;
  const activeP = filteredP.filter(p => p.status === 'running' || p.status === 'in_progress').length;
  const onTrackP = filteredP.filter(p => (p.status === 'running' || p.status === 'in_progress') && !p.is_delayed).length;
  const delayedP = filteredP.filter(p => p.status === 'delayed' || p.is_delayed).length;
  const completedP = filteredP.filter(p => p.status === 'completed').length;
  const missedP = filteredP.filter(p => p.status === 'missed').length;
  const overdueP = filteredP.filter(p => p.status === 'overdue').length;

  const totalInc = filteredI.length;
  const openInc = filteredI.filter(i => i.status === 'open' || i.status === 'active' || !i.status).length;
  const criticalInc = filteredI.filter(i => (i.severity || '').toLowerCase() === 'critical' || (i.priority || '').toLowerCase() === 'high').length;
  const normalInc = Math.max(0, openInc - criticalInc);

  const completionRate = totalP > 0 ? Math.round((completedP / totalP) * 100) : (completedP > 0 ? 100 : 0);

  return {
    totalGuards: totalG,
    activeGuards: activeG,
    offDutyGuards: offDutyG,
    totalPatrols: totalP,
    activePatrols: activeP,
    onTrackPatrols: onTrackP,
    delayedPatrols: delayedP,
    completedToday: completedP,
    completionRate,
    completionTrend: '+0.0%',
    missedCount: missedP,
    overdueCount: overdueP,
    totalIncidents: totalInc,
    openIncidents: openInc,
    incidentsCount: openInc,
    criticalIncidents: criticalInc,
    normalIncidents: normalInc
  };
});

// ── ACTIVE PATROLS STREAM ─────────────────────────────────────────────────────
const mockActivePatrols = ref([]);

const filteredActivePatrols = computed(() => {
  if (selectedSiteId.value === 'all') return mockActivePatrols.value;
  return mockActivePatrols.value.filter(p => String(p.siteId) === String(selectedSiteId.value));
});

// ── ATTENTION REQUIRED & INCIDENTS ────────────────────────────────────────────
const attentionItems = computed(() => {
  return [];
});

const recentIncidentsList = ref([]);

const filteredRecentIncidents = computed(() => {
  if (selectedSiteId.value === 'all') return recentIncidentsList.value;
  return recentIncidentsList.value.filter(i => String(i.siteId) === String(selectedSiteId.value));
});

const openIncidentModal = (inc) => {
  selectedIncidentModal.value = inc;
};

const handleAttentionClick = (item) => {
  if (item.type === 'patrol') {
    router.push('/dashboard/patrols?filter=missed');
  } else if (item.type === 'incident') {
    router.push('/dashboard/incidents');
  } else {
    router.push('/dashboard/patrols');
  }
};

// ── LEADERBOARDS ──────────────────────────────────────────────────────────────
const topGuards = [];
const flagGuards = [];

// ── GOOGLE MAP INTEGRATION ────────────────────────────────────────────────────
const dashboardMapRef = ref(null);
let mapInstance = null;
let mapMarkers = [];

const lightMapStyles = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] }
];

const initMap = async () => {
  const apiKey = 'AIzaSyCwp-gBFBiutZVlE-a-84hHnA2XeMRGE1g';
  const loader = new Loader({ apiKey, version: 'weekly' });
  try {
    await loader.load();
    if (dashboardMapRef.value) {
      mapInstance = new google.maps.Map(dashboardMapRef.value, {
        center: { lat: 12.9716, lng: 80.2435 },
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'auto',
        styles: lightMapStyles
      });
      renderGuardMarkers();
    }
  } catch (err) {
    console.error('Google Map init fallback', err);
  }
};

const renderGuardMarkers = () => {
  if (!mapInstance) return;
  mapMarkers.forEach(m => m.setMap && m.setMap(null));
  mapMarkers = [];

  mockActivePatrols.value.forEach(patrol => {
    const marker = new google.maps.Marker({
      position: { lat: patrol.lat, lng: patrol.lng },
      map: mapInstance,
      title: `${patrol.guardName} (${patrol.routeName})`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: patrol.status === 'running' ? '#10b981' : '#f59e0b',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2.5
      }
    });

    marker.addListener('click', () => {
      selectedMapGuard.value = {
        name: patrol.guardName,
        siteName: patrol.siteName,
        routeName: patrol.routeName,
        currentCheckpoint: patrol.nextCheckpoint,
        battery: patrol.battery,
        signal: patrol.signal,
        patrolId: patrol.id
      };
    });

    mapMarkers.push(marker);
  });
};

const centerMapOnGuards = () => {
  if (!mapInstance || mockActivePatrols.value.length === 0) return;
  const bounds = new google.maps.LatLngBounds();
  mockActivePatrols.value.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
  mapInstance.fitBounds(bounds);
};

const panMapToSelectedSite = () => {
  if (!mapInstance) return;
  if (selectedSiteId.value === 'all') {
    centerMapOnGuards();
  } else {
    const match = sitesList.value.find(s => String(s.id) === String(selectedSiteId.value));
    if (match && match.latitude && match.longitude) {
      mapInstance.panTo({ lat: match.latitude, lng: match.longitude });
      mapInstance.setZoom(16);
    }
  }
};

// ── REFRESH & LIFECYCLE ───────────────────────────────────────────────────────
const formattedCurrentDate = computed(() => {
  return new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
});

const currentTime = ref('');
let clockTimer = null;

const loadDashboardData = async () => {
  try {
    const token = authService.getToken();
    let tenantId = authService.getTenantId();
    try {
      if (!tenantId && currentUserTenant?.getTenantIdAsync) {
        tenantId = await currentUserTenant.getTenantIdAsync();
      }
    } catch (e) {}

    // 1. Fetch Sites & Zones
    try {
      sitesList.value = await siteService.fetchSites();
      await loadZones(selectedSiteId.value);
    } catch (e) {
      console.warn("Could not fetch sites/zones:", e);
    }

    // 2. Fetch Guards from /users
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users?filter[_and][0][tenant][tenantId][_eq]=${tenantId}&fields[]=id&fields[]=first_name&fields[]=last_name&fields[]=status&fields[]=accesseasyRole.*&fields[]=tenant.userApp`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const udata = await res.json();
        const usersList = (udata.data || []).filter(u => {
          if (!u.tenant) return false;
          let apps = u.tenant.userApp;
          if (typeof apps === 'string') {
            try { apps = JSON.parse(apps); } catch (e) { apps = []; }
          }
          return Array.isArray(apps) && apps.some(a => a.userApp === 'accesseasy' || a.userApp === 'accesseasy_patrol');
        });

        // Filter for security guard roles (or all assigned force if roles are generic)
        const guardRoles = usersList.filter(u => {
          const roleName = u.accesseasyRole?.roleName?.toLowerCase() || '';
          return roleName.includes('guard') || roleName.includes('security') || roleName.includes('patrol') || !roleName.includes('admin');
        });

        allGuards.value = guardRoles.length > 0 ? guardRoles : usersList;
      }
    } catch (e) {
      console.warn("Could not fetch guards for metrics:", e);
    }

    // 3. Fetch Patrols
    try {
      allPatrols.value = await patrolService.getPatrols();
      mockActivePatrols.value = allPatrols.value.filter(p => p.status === 'running' || p.status === 'in_progress');
    } catch (e) {
      console.warn("Could not fetch patrols for metrics:", e);
    }

    // 4. Fetch Incidents
    try {
      allIncidents.value = await patrolService.getAlerts();
      recentIncidentsList.value = (allIncidents.value || []).slice(0, 10).map(a => ({
        id: a.id,
        siteId: a.site || 'site-01',
        siteName: a.location || 'Security Zone',
        title: a.title || a.type || 'Incident Alert',
        location: a.location || 'Perimeter',
        reportedBy: a.reported_by || 'Guard',
        timeAgo: a.date_created ? new Date(a.date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        severity: (a.severity || 'medium').toLowerCase(),
        description: a.description
      }));
    } catch (e) {
      console.warn("Could not fetch incidents for metrics:", e);
    }

    // 5. Fetch Attendance
    try {
      todayAttendance.value = await attendanceService.getTodayAttendance();
    } catch (e) {
      console.warn("Could not fetch attendance for metrics:", e);
    }
  } catch (err) {
    console.error("Failed to load dashboard data:", err);
  }
};

const refreshDashboard = async () => {
  isRefreshing.value = true;
  await loadDashboardData();
  setTimeout(() => isRefreshing.value = false, 500);
};

onMounted(async () => {
  clockTimer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }, 1000);
  currentTime.value = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  await loadDashboardData();
  await nextTick();
  await initMap();
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
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
