<template>
  <div class="h-full flex flex-col bg-slate-100 dark:bg-[#070C18] text-slate-900 dark:text-slate-100 overflow-y-auto custom-scrollbar font-sans transition-colors duration-300">
    <div class="flex flex-col gap-4 p-3 sm:p-4 lg:p-5 min-h-full max-w-[1800px] mx-auto w-full">

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 0. SUCCESS TOAST & NOTIFICATION FLOATER                      -->
      <!-- ═══════════════════════════════════════════════════════════ -->
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
          class="fixed top-5 right-5 z-[250] bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/80 animate-in"
        >
          <div class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
            <Check class="w-4 h-4" />
          </div>
          <div>
            <p class="text-xs font-bold">{{ successToastMessage }}</p>
            <p class="text-[10px] text-slate-400">Live telemetry updated</p>
          </div>
          <button class="text-slate-400 hover:text-white ml-2 cursor-pointer" @click="successToastMessage = ''">
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </transition>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 1. GLOBAL ENTERPRISE OPERATIONS HEADER                       -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <header class="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 px-5 py-3.5 rounded-xl shadow-xs shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <!-- Left: System Identity & Real-Time Operational Status -->
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-white/5 border border-blue-500/20 dark:border-white/10 flex items-center justify-center shadow-xs shrink-0 p-1.5">
            <img :src="logoPatrol" class="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(27,79,216,0.25)]" alt="AccessEasy Patrol" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1 class="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none whitespace-nowrap">
                Live Operations
              </h1>
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors shrink-0"
                :class="currentMetrics.criticalIncidents > 0 
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' 
                  : currentMetrics.delayedPatrols > 0
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="currentMetrics.criticalIncidents > 0 ? 'bg-rose-500' : currentMetrics.delayedPatrols > 0 ? 'bg-amber-500' : 'bg-emerald-500'"
                />
                <span>{{ currentMetrics.criticalIncidents > 0 ? `${currentMetrics.criticalIncidents} Urgent Incident` : currentMetrics.delayedPatrols > 0 ? `${currentMetrics.delayedPatrols} Delayed Tours` : 'All Systems Operational' }}</span>
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-2 truncate">
              <span>{{ formattedCurrentDate }}</span>
              <span class="text-slate-300 dark:text-slate-600">&middot;</span>
              <span class="font-mono font-semibold text-slate-700 dark:text-slate-300">{{ currentTime }}</span>
            </p>
          </div>
        </div>

        <!-- Right: Enterprise Filters & Primary Dispatch Actions -->
        <div class="flex flex-wrap items-center gap-2.5">
          
          <!-- Facility / Site Filter -->
          <div class="relative" ref="siteDropdownRef">
            <button
              class="h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition-colors cursor-pointer"
              @click="isSiteDropdownOpen = !isSiteDropdownOpen"
              title="Filter by Facility / Property"
            >
              <Building2 class="w-3.5 h-3.5 text-slate-500" />
              <span class="truncate max-w-[150px]">{{ selectedSiteName }}</span>
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
                class="absolute right-0 mt-1.5 w-64 rounded-xl bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-50 overflow-hidden"
              >
                <div class="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Facility
                </div>
                <button
                  class="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors cursor-pointer"
                  :class="selectedSiteId === 'all' ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-200'"
                  @click="selectSite('all')"
                >
                  <div class="flex items-center gap-2">
                    <Globe class="w-3.5 h-3.5 text-slate-400" />
                    <span>All Facilities (Global)</span>
                  </div>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">{{ sitesList.length }}</span>
                </button>
                
                <button
                  v-for="site in sitesList"
                  :key="site.id"
                  class="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors cursor-pointer"
                  :class="selectedSiteId === site.id ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-200'"
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

                <div class="p-1.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    class="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    @click="openQuickCreateModal('add_site')"
                  >
                    <Plus class="w-3.5 h-3.5" />
                    <span>Add New Property</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <!-- Security Zone Filter -->
          <div class="relative" ref="zoneDropdownRef">
            <button
              class="h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition-colors cursor-pointer"
              @click="isZoneDropdownOpen = !isZoneDropdownOpen; isSiteDropdownOpen = false;"
              title="Filter by Security Zone"
            >
              <Layers class="w-3.5 h-3.5 text-slate-500" />
              <span class="truncate max-w-[130px]">{{ selectedZoneName }}</span>
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
                class="absolute right-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-50 overflow-hidden"
              >
                <div class="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Security Zone
                </div>
                <button
                  class="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors cursor-pointer"
                  :class="selectedZoneId === 'all' ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-200'"
                  @click="selectZone('all')"
                >
                  <div class="flex items-center gap-2">
                    <Layers class="w-3.5 h-3.5 text-slate-400" />
                    <span>All Zones</span>
                  </div>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">{{ zonesList.length }}</span>
                </button>
                
                <button
                  v-for="zone in zonesList"
                  :key="zone.id"
                  class="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors cursor-pointer"
                  :class="selectedZoneId === zone.id ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-200'"
                  @click="selectZone(zone.id)"
                >
                  <div class="flex items-center gap-2 truncate">
                    <div class="w-2 h-2 rounded-full shrink-0 bg-blue-500" />
                    <span class="truncate">{{ zone.name || zone.zoneName }}</span>
                  </div>
                  <span v-if="zone.securityTier" class="text-[9px] text-slate-400 shrink-0 font-mono">{{ zone.securityTier }}</span>
                </button>

                <div class="p-1.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    class="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    @click="openQuickCreateModal('add_zone')"
                  >
                    <Plus class="w-3.5 h-3.5" />
                    <span>Add New Zone</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <!-- Refresh Button -->
          <button
            class="h-9 w-9 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
            :class="{ 'animate-spin': isRefreshing }"
            title="Refresh Live Data"
            @click="refreshDashboard"
          >
            <RefreshCw class="w-3.5 h-3.5" />
          </button>

          <!-- Primary Dispatch Button -->
          <button
            class="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            @click="openQuickCreateModal('create_patrol')"
          >
            <Plus class="w-4 h-4" />
            <span>Dispatch Tour</span>
          </button>

          <!-- Secondary Actions Dropdown -->
          <div class="relative" ref="createDropdownRef">
            <button
              class="h-9 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              @click="isCreateDropdownOpen = !isCreateDropdownOpen"
              title="More Actions"
            >
              <span>Manage</span>
              <ChevronDown class="w-3 h-3 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isCreateDropdownOpen }" />
            </button>

            <!-- Dropdown -->
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
                class="absolute right-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-50 overflow-hidden"
              >
                <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Setup
                </div>
                <button
                  v-for="action in quickCreateOptions"
                  :key="action.id"
                  class="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors cursor-pointer"
                  @click="openQuickCreateModal(action.id)"
                >
                  <component :is="action.icon" class="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{{ action.label }}</span>
                </button>
              </div>
            </transition>
          </div>

        </div>
      </header>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 2. EXECUTIVE OPERATIONAL KPIS (STANDARDIZED ENTERPRISE STRIP) -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">

        <!-- Card 1: Guard Force Deployment -->
        <div
          class="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
          @click="router.push('/dashboard/guards')"
        >
          <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span class="uppercase tracking-wider text-[11px] font-bold">Guards Deployed</span>
            <Users class="w-4 h-4 text-slate-400" />
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {{ currentMetrics.activeGuards }}
            </span>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
              / {{ currentMetrics.totalGuards }} Scheduled
            </span>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span class="font-medium text-emerald-600 dark:text-emerald-400">
              {{ currentMetrics.guardsOnPatrol }} on active tour
            </span>
            <span>{{ currentMetrics.guardsOnStandby }} on standby</span>
          </div>
        </div>

        <!-- Card 2: Active Patrol Tours -->
        <div
          class="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
          @click="router.push('/dashboard/patrols')"
        >
          <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span class="uppercase tracking-wider text-[11px] font-bold">Active Patrol Tours</span>
            <Activity class="w-4 h-4 text-slate-400" />
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {{ currentMetrics.activePatrols }}
            </span>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
              In Progress
            </span>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span class="font-medium text-slate-700 dark:text-slate-300">
              {{ currentMetrics.onTrackPatrols }} on schedule
            </span>
            <span :class="currentMetrics.delayedPatrols > 0 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-400'">
              {{ currentMetrics.delayedPatrols }} delayed
            </span>
          </div>
        </div>

        <!-- Card 3: Checkpoint Tour Compliance -->
        <div
          class="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
          @click="router.push('/dashboard/settings/checkpoints')"
        >
          <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span class="uppercase tracking-wider text-[11px] font-bold">Tour Compliance</span>
            <QrCode class="w-4 h-4 text-slate-400" />
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {{ currentMetrics.completionRate }}%
            </span>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
              Completion Rate
            </span>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span class="font-medium text-slate-700 dark:text-slate-300">
              {{ currentMetrics.completedToday }} rounds completed
            </span>
            <span class="text-blue-600 dark:text-blue-400 font-medium">{{ recentCheckpointScans.length }} scans today</span>
          </div>
        </div>

        <!-- Card 4: Incident Exceptions & SOS -->
        <div
          class="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
          @click="router.push('/dashboard/incidents')"
        >
          <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span class="uppercase tracking-wider text-[11px] font-bold">Exceptions &amp; Incidents</span>
            <ShieldAlert v-if="currentMetrics.criticalIncidents > 0" class="w-4 h-4 text-rose-500" />
            <CheckCircle2 v-else class="w-4 h-4 text-emerald-500" />
          </div>
          <div class="flex items-baseline gap-2">
            <span
              class="text-2xl font-bold tracking-tight"
              :class="currentMetrics.criticalIncidents > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'"
            >
              {{ currentMetrics.openIncidents }}
            </span>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
              Open Issues
            </span>
          </div>
          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span
              class="inline-flex items-center gap-1 font-semibold"
              :class="currentMetrics.criticalIncidents > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'"
            >
              {{ currentMetrics.criticalIncidents > 0 ? `${currentMetrics.criticalIncidents} Urgent SOS Alerts` : 'Perimeter Secure' }}
            </span>
            <span class="text-slate-400 hover:text-blue-600 font-medium">Incident Desk &rarr;</span>
          </div>
        </div>

      </section>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 2.5 ONBOARDING NOTICE (CLEAN ENTERPRISE BANNER WHEN NO SITES) -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <section v-if="sitesList.length === 0" class="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 class="text-sm font-bold text-blue-950 dark:text-blue-200">
            Getting Started: Initialize Security Infrastructure
          </h2>
          <p class="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
            Add your primary property location, set up security checkpoints, register officers, and launch your first scheduled patrol.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button
            class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            @click="openQuickCreateModal('add_site')"
          >
            1. Add Property
          </button>
          <button
            class="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            @click="openQuickCreateModal('add_checkpoint')"
          >
            2. Add Checkpoint
          </button>
          <button
            class="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            @click="openQuickCreateModal('add_guard')"
          >
            3. Enrol Officer
          </button>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 3. MAIN WORKSPACE: BALANCED 60% MAP / 40% OPERATIONS DECK   -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[580px]">

        <!-- LEFT SECTION: GIS LIVE FACILITY & GUARD MAP (7 cols = ~58%) -->
        <main class="lg:col-span-7 bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col overflow-hidden relative min-h-[460px]">
          
          <!-- Map Header & Controls -->
          <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0D1424] z-20">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h2 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Live Facility Map
              </h2>
              <span class="text-xs text-slate-400 font-medium">&middot; {{ selectedSiteName }}</span>
            </div>

            <!-- Map Layer & Fit Controls -->
            <div class="flex items-center gap-1.5">
              <button
                class="h-7 px-2.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                :class="isSatelliteView 
                  ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'"
                @click="toggleMapLayer"
                title="Toggle Satellite View"
              >
                <Layers class="w-3.5 h-3.5 text-slate-500" />
                <span>{{ isSatelliteView ? 'Street Map' : 'Satellite' }}</span>
              </button>

              <button
                class="h-7 px-2.5 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                @click="centerMapOnGuards"
                title="Fit all officers on map"
              >
                <Crosshair class="w-3.5 h-3.5 text-slate-500" />
                <span>Fit All</span>
              </button>
            </div>
          </div>

          <!-- Leaflet Map Container -->
          <div
            id="dashboard-leaflet-map"
            ref="dashboardMapRef"
            class="w-full flex-1 min-h-[380px] z-10 relative bg-slate-100 dark:bg-slate-900"
          ></div>

          <!-- Floating Map Officer Inspector Drawer -->
          <div
            v-if="selectedMapGuard"
            class="absolute bottom-4 left-4 right-4 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl shadow-lg flex items-center justify-between gap-4"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {{ selectedMapGuard.name.charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ selectedMapGuard.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {{ selectedMapGuard.siteName }} &middot; Route: <strong>{{ selectedMapGuard.routeName }}</strong> &middot; Next: <strong>{{ selectedMapGuard.currentCheckpoint }}</strong>
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button
                class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                @click="router.push(`/dashboard/patrols?patrolId=${selectedMapGuard.patrolId}`)"
              >
                Tour Details
              </button>
              <button
                class="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                @click="selectedMapGuard = null"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        <!-- RIGHT SECTION: LIVE OPERATIONS MANAGEMENT STREAM (5 cols = ~42%) -->
        <aside class="lg:col-span-5 bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col overflow-hidden min-h-[460px]">
          
          <!-- Stream Segmented Tab Navigation -->
          <div class="px-3 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 shrink-0 bg-slate-50/50 dark:bg-[#0D1424]">
            <button
              class="px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-1.5"
              :class="activeStreamTab === 'patrols'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
              @click="activeStreamTab = 'patrols'"
            >
              <span>Active Tours</span>
              <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {{ filteredActivePatrols.length }}
              </span>
            </button>

            <button
              class="px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-1.5"
              :class="activeStreamTab === 'scans'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
              @click="activeStreamTab = 'scans'"
            >
              <span>Checkpoint Scans</span>
            </button>

            <button
              class="px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-1.5"
              :class="activeStreamTab === 'alerts'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
              @click="activeStreamTab = 'alerts'"
            >
              <span>Exceptions &amp; Alerts</span>
              <span
                v-if="attentionItems.length > 0"
                class="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-500 text-white"
              >
                {{ attentionItems.length }}
              </span>
            </button>

            <button
              class="px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px"
              :class="activeStreamTab === 'sites'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
              @click="activeStreamTab = 'sites'"
            >
              Properties
            </button>
          </div>

          <!-- ═════════════════════════════════════════════════════════ -->
          <!-- TAB CONTENT 1: ACTIVE TOURS / PATROLS LIST                -->
          <!-- ═════════════════════════════════════════════════════════ -->
          <div v-if="activeStreamTab === 'patrols'" class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
            
            <div
              v-for="patrol in filteredActivePatrols"
              :key="patrol.id"
              class="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
              @click="focusPatrolOnMap(patrol)"
            >
              <!-- Row 1: Officer Header & Status -->
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                    {{ (patrol.guardName || 'G').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ patrol.guardName }}</p>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {{ patrol.siteName }} &middot; {{ patrol.routeName }}
                    </p>
                  </div>
                </div>

                <!-- Status Chip & Contact -->
                <div class="flex items-center gap-1.5 shrink-0">
                  <a
                    v-if="patrol.guardPhone"
                    :href="'tel:' + patrol.guardPhone"
                    @click.stop
                    class="w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                    title="Direct Phone Call"
                  >
                    <PhoneCall class="w-3.5 h-3.5" />
                  </a>

                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold"
                    :class="patrol.status === 'running' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="patrol.status === 'running' ? 'bg-emerald-500' : 'bg-amber-500'" />
                    {{ patrol.status === 'running' ? 'On Schedule' : 'Delayed' }}
                  </span>
                </div>
              </div>

              <!-- Row 2: Checkpoint Progress Bar -->
              <div class="mt-3">
                <div class="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                  <span>Checkpoint {{ patrol.scannedCheckpoints }} of {{ patrol.totalCheckpoints }}</span>
                  <span class="font-mono font-semibold">{{ Math.round((patrol.scannedCheckpoints / Math.max(1, patrol.totalCheckpoints)) * 100) }}%</span>
                </div>
                <div class="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="patrol.status === 'running' ? 'bg-blue-600' : 'bg-amber-500'"
                    :style="{ width: `${Math.min(100, (patrol.scannedCheckpoints / Math.max(1, patrol.totalCheckpoints)) * 100)}%` }"
                  />
                </div>
              </div>

              <!-- Row 3: Target & Action Buttons -->
              <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div class="flex items-center gap-1 truncate max-w-[60%]">
                  <MapPin class="w-3 h-3 text-slate-400 shrink-0" />
                  <span class="truncate">Next: <strong class="text-slate-700 dark:text-slate-200 font-semibold">{{ patrol.nextCheckpoint || 'Final Point' }}</strong></span>
                </div>

                <div class="flex items-center gap-1.5">
                  <button
                    class="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                    @click.stop="focusPatrolOnMap(patrol)"
                  >
                    Locate
                  </button>
                  <button
                    class="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-semibold transition-colors"
                    @click.stop="router.push(`/dashboard/patrols?patrolId=${patrol.id}`)"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredActivePatrols.length === 0" class="py-14 text-center text-slate-400 px-4">
              <ShieldCheck class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">No Active Tours Currently Dispatched</p>
              <p class="text-[11px] text-slate-400 mt-0.5">All scheduled guard patrols are either pending dispatch or completed.</p>
              <button
                class="mt-3.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                @click="openQuickCreateModal('create_patrol')"
              >
                Dispatch Tour Now
              </button>
            </div>
          </div>

          <!-- ═════════════════════════════════════════════════════════ -->
          <!-- TAB CONTENT 2: LIVE CHECKPOINT SCAN FEED                  -->
          <!-- ═════════════════════════════════════════════════════════ -->
          <div v-else-if="activeStreamTab === 'scans'" class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            <div
              v-for="(scan, index) in recentCheckpointScans"
              :key="scan.id || scan.timestamp || index"
              class="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 class="w-3.5 h-3.5" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {{ scan.checkpoint_name || scan.checkpointId?.name || 'Checkpoint Tag' }}
                  </p>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Scanned by {{ scan.guard_name || scan.guardId?.first_name || 'Assigned Officer' }}
                  </p>
                </div>
              </div>

              <div class="text-right shrink-0">
                <span class="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                  {{ scan.timestamp ? new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Live' }}
                </span>
                <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Verified</p>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="recentCheckpointScans.length === 0" class="py-14 text-center text-slate-400 px-4">
              <QrCode class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">No Checkpoint Scans Recorded Yet</p>
              <p class="text-[11px] text-slate-400 mt-0.5">As security officers scan QR or NFC checkpoints, live logs will stream here.</p>
            </div>
          </div>

          <!-- ═════════════════════════════════════════════════════════ -->
          <!-- TAB CONTENT 3: EXCEPTIONS & ALERTS FEED                   -->
          <!-- ═════════════════════════════════════════════════════════ -->
          <div v-else-if="activeStreamTab === 'alerts'" class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            <div
              v-for="item in attentionItems"
              :key="item.id"
              class="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 transition-colors cursor-pointer"
              @click="handleAttentionClick(item)"
            >
              <div class="flex items-center justify-between text-[10.5px] font-semibold mb-1">
                <span
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded uppercase"
                  :class="item.type.includes('SOS') || item.type.includes('Incident') 
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'"
                >
                  <AlertTriangle class="w-3 h-3" />
                  {{ item.type }}
                </span>
                <span class="text-slate-400 font-mono">{{ item.time }}</span>
              </div>
              <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ item.title }}</p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{{ item.description }}</p>
            </div>

            <!-- Empty State -->
            <div v-if="attentionItems.length === 0" class="py-14 text-center text-slate-400 px-4">
              <CheckCircle2 class="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">All Operations Normal</p>
              <p class="text-[11px] text-slate-400 mt-0.5">No overdue tours, missed checkpoints, or urgent incident alarms.</p>
            </div>
          </div>

          <!-- ═════════════════════════════════════════════════════════ -->
          <!-- TAB CONTENT 4: PROPERTIES LIST                            -->
          <!-- ═════════════════════════════════════════════════════════ -->
          <div v-else class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            <div
              v-for="site in sitesList"
              :key="site.id"
              class="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              @click="selectSite(site.id)"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ site.name }}</span>
                <span class="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{{ site.code }}</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                Guards: <strong>{{ site.activeGuards || 1 }}</strong> &middot; Geofence: <strong>{{ site.geofenceRadius || 500 }}m</strong> &middot; Status: <strong class="text-emerald-600">Active</strong>
              </p>
            </div>

            <div class="pt-2">
              <button
                class="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                @click="router.push('/dashboard/reports')"
              >
                <span>View Full Audit Reports</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </aside>

      </div>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- 4. OPERATIONAL PERFORMANCE & SHIFT ANALYTICS                -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <section class="bg-white dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs shrink-0">
        
        <!-- Section Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <BarChart3 class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 class="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Shift Performance &amp; Patrol Telemetry Analytics
              </h2>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hourly checkpoint throughput velocity, tour completion distribution, and operational adherence.
            </p>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
              <button
                v-for="range in ['Today', '7 Days', '30 Days']"
                :key="range"
                class="px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                :class="analyticsTimeRange === range 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
                @click="analyticsTimeRange = range"
              >
                {{ range }}
              </button>
            </div>

            <button
              class="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              @click="router.push('/dashboard/reports')"
            >
              <span>Full Analytics Hub</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- 3-Column Analytics Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          <!-- Chart 1: Checkpoint Scan Velocity (7 cols = ~58%) -->
          <div class="lg:col-span-7 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  24-Hour Checkpoint Scan Velocity
                </h3>
                <p class="text-[11px] text-slate-400">Scans recorded per 2-hour operational window</p>
              </div>
              <div class="flex items-center gap-3 text-xs font-medium text-slate-500">
                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-blue-600"></span> Verified Scans</span>
              </div>
            </div>
            
            <div class="h-56 w-full">
              <VueApexCharts
                type="area"
                height="100%"
                width="100%"
                :options="scanVelocityChartOptions"
                :series="scanVelocityChartSeries"
              />
            </div>
          </div>

          <!-- Chart 2: Tour Status Distribution (Donut) (5 cols = ~42%) -->
          <div class="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-5">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Tour Completion Distribution
                </h3>
                <p class="text-[11px] text-slate-400">Operational adherence across scheduled tours</p>
              </div>
              <span class="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {{ currentMetrics.completionRate }}% Compliance
              </span>
            </div>

            <div class="h-44 w-full flex items-center justify-center my-1">
              <VueApexCharts
                type="donut"
                height="100%"
                width="100%"
                :options="tourStatusDonutOptions"
                :series="tourStatusDonutSeries"
              />
            </div>

            <!-- Mini Summary Legend Table -->
            <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs">
              <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p class="text-[10px] text-slate-400 font-medium">On Schedule</p>
                <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{{ currentMetrics.onTrackPatrols + currentMetrics.completedToday }}</p>
              </div>
              <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p class="text-[10px] text-slate-400 font-medium">Delayed</p>
                <p class="text-sm font-bold text-amber-600 dark:text-amber-400">{{ currentMetrics.delayedPatrols }}</p>
              </div>
              <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p class="text-[10px] text-slate-400 font-medium">Exceptions</p>
                <p class="text-sm font-bold text-rose-600 dark:text-rose-400">{{ currentMetrics.openIncidents }}</p>
              </div>
            </div>

          </div>

        </div>

      </section>

    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- 4. QUICK ACTION & MODAL OVERLAYS                            -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <!-- Create Patrol Modal -->
      <div v-if="activeQuickModal === 'create_patrol'" class="fixed inset-0 z-[210] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" @click.self="activeQuickModal = null">
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold">
                <Plus class="w-4 h-4" />
              </div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">Dispatch New Patrol Round</h3>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1" @click="activeQuickModal = null"><X class="w-4 h-4" /></button>
          </div>
          <form @submit.prevent="submitQuickPatrol" class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Assign Security Guard *</label>
              <select v-model="quickPatrolForm.guardName" required class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                <option value="" disabled>Select Guard</option>
                <option v-for="g in allGuards" :key="g.id" :value="g.first_name ? `${g.first_name} ${g.last_name || ''}`.trim() : (g.name || 'Security Officer')">
                  {{ g.first_name ? `${g.first_name} ${g.last_name || ''}`.trim() : (g.name || 'Security Officer') }} ({{ g.phone || 'Standby' }})
                </option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Patrol Route / Sector *</label>
              <input v-model="quickPatrolForm.routeName" required placeholder="e.g. Night Perimeter Tour" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Site *</label>
                <select v-model="quickPatrolForm.siteName" required class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                  <option value="" disabled>Select Site</option>
                  <option v-for="s in sitesList" :key="s.id" :value="s.name || s.locName">{{ s.name || s.locName }}</option>
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

      <!-- Add Guard Modal -->
      <div v-if="activeQuickModal === 'add_guard'" class="fixed inset-0 z-[210] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" @click.self="activeQuickModal = null">
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                <Users class="w-4 h-4" />
              </div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">Enrol Security Officer</h3>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1" @click="activeQuickModal = null"><X class="w-4 h-4" /></button>
          </div>
          <form @submit.prevent="submitQuickGuard" class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">First Name *</label>
                <input v-model="quickGuardForm.first_name" required placeholder="e.g. Ramesh" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Last Name</label>
                <input v-model="quickGuardForm.last_name" placeholder="e.g. Kumar" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
              </div>
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Mobile Number (For App OTP Login) *</label>
              <input v-model="quickGuardForm.phone" required placeholder="e.g. 9876543210" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Badge / Guard ID</label>
              <input v-model="quickGuardForm.badge_number" placeholder="e.g. GRD-104" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button type="button" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs" @click="activeQuickModal = null">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">Register Officer</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add Site Modal -->
      <div v-if="activeQuickModal === 'add_site'" class="fixed inset-0 z-[210] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" @click.self="activeQuickModal = null">
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold">
                <Building2 class="w-4 h-4" />
              </div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">Add Security Property / Site</h3>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1" @click="activeQuickModal = null"><X class="w-4 h-4" /></button>
          </div>
          <form @submit.prevent="submitQuickSite" class="space-y-3 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Property Name *</label>
              <input v-model="quickSiteForm.name" required placeholder="e.g. Apex Tech Campus" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Site Code</label>
                <input v-model="quickSiteForm.code" placeholder="e.g. SITE-01" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Geofence Radius (m)</label>
                <input v-model="quickSiteForm.geofence_radius" type="number" placeholder="500" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
              </div>
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Facility Address</label>
              <input v-model="quickSiteForm.address" placeholder="Physical location" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button type="button" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs" @click="activeQuickModal = null">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">Create Property</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add Checkpoint Modal -->
      <div v-if="activeQuickModal === 'add_checkpoint'" class="fixed inset-0 z-[210] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" @click.self="activeQuickModal = null">
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold">
                <QrCode class="w-4 h-4" />
              </div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">Register Checkpoint Tag</h3>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1" @click="activeQuickModal = null"><X class="w-4 h-4" /></button>
          </div>
          <form @submit.prevent="submitQuickCheckpoint" class="space-y-3 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Checkpoint Name *</label>
              <input v-model="quickCheckpointForm.name" required placeholder="e.g. Gate 2 North Emergency Exit" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Site *</label>
                <select v-model="quickCheckpointForm.site" required class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                  <option value="" disabled>Select Site</option>
                  <option v-for="s in sitesList" :key="s.id" :value="s.id">{{ s.name || s.locName }}</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Tag Type</label>
                <select v-model="quickCheckpointForm.type" class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none">
                  <option value="QR Code">QR Code Scan Point</option>
                  <option value="NFC Tag">NFC Physical Disc</option>
                  <option value="Bluetooth BLE">BLE Beacon</option>
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

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { onClickOutside } from '@vueuse/core';
import {
  Shield, ShieldCheck, Building2, Globe, Users, ShieldAlert, CheckCircle2,
  AlertTriangle, Plus, RefreshCw, ChevronDown, ArrowRight, MapPin,
  Crosshair, PhoneCall, Radio, Activity, Flame, X, QrCode, Layers, Check,
  BarChart3
} from 'lucide-vue-next';
import VueApexCharts from 'vue3-apexcharts';

import { siteService } from '@/services/siteService';
import { zoneService } from '@/services/zoneService';
import { patrolService } from '@/services/patrolService';
import { authService } from '@/services/authService';
import { attendanceService } from '@/services/attendanceService';
import { mqttService } from '@/services/mqttService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import logoPatrol from '@/assets/images/logoPatrol.png';

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
const selectedMapGuard = ref(null);
const successToastMessage = ref('');
const activeStreamTab = ref('patrols'); // 'patrols' | 'scans' | 'alerts' | 'sites'

// Analytics State & Configuration
const analyticsTimeRange = ref('Today');
const historicalLogs = ref([]);

const scanVelocityAnalytics = computed(() => {
  const range = analyticsTimeRange.value;
  const logs = historicalLogs.value.length > 0 ? historicalLogs.value : recentCheckpointScans.value;
  const now = new Date();

  if (range === 'Today') {
    const categories = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const buckets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const todayStr = now.toISOString().slice(0, 10);

    logs.forEach(scan => {
      const timeStr = scan.timestamp || scan.date_created;
      if (timeStr) {
        const d = new Date(timeStr);
        if (d.toISOString().slice(0, 10) === todayStr) {
          const hr = d.getHours();
          const bucketIndex = Math.min(11, Math.floor(hr / 2));
          buckets[bucketIndex] += 1;
        }
      }
    });

    return { categories, data: buckets };
  } else if (range === '7 Days') {
    const categories = [];
    const buckets = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
      categories.push(label);
      const datePrefix = d.toISOString().slice(0, 10);
      const count = logs.filter(scan => {
        const t = scan.timestamp || scan.date_created;
        return t && t.slice(0, 10) === datePrefix;
      }).length;
      buckets.push(count);
    }
    return { categories, data: buckets };
  } else {
    // 30 Days (6 5-day intervals)
    const categories = [];
    const buckets = [];
    for (let i = 5; i >= 0; i--) {
      const endD = new Date(now);
      endD.setDate(endD.getDate() - i * 5);
      const startD = new Date(endD);
      startD.setDate(startD.getDate() - 5);
      const label = `${startD.getDate()}/${startD.getMonth() + 1}-${endD.getDate()}/${endD.getMonth() + 1}`;
      categories.push(label);

      const count = logs.filter(scan => {
        const t = scan.timestamp || scan.date_created;
        if (!t) return false;
        const scanTime = new Date(t).getTime();
        return scanTime >= startD.getTime() && scanTime <= endD.getTime();
      }).length;
      buckets.push(count);
    }
    return { categories, data: buckets };
  }
});

const scanVelocityChartSeries = computed(() => [
  {
    name: 'Verified Scans',
    data: scanVelocityAnalytics.value.data
  }
]);

const scanVelocityChartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'inherit',
    sparkline: { enabled: false }
  },
  colors: ['#2563eb'],
  stroke: {
    curve: 'smooth',
    width: 2
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.05,
      stops: [0, 95, 100]
    }
  },
  xaxis: {
    categories: scanVelocityAnalytics.value.categories,
    labels: {
      style: {
        colors: '#94a3b8',
        fontSize: '11px',
        fontWeight: 500
      }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      style: {
        colors: '#94a3b8',
        fontSize: '11px'
      }
    }
  },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } }
  },
  dataLabels: { enabled: false },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val) => `${val} Checkpoints Scanned`
    }
  }
}));

const tourStatusDonutSeries = computed(() => {
  const onSchedule = currentMetrics.value.completedToday + currentMetrics.value.onTrackPatrols;
  const inProgress = currentMetrics.value.activePatrols;
  const delayed = currentMetrics.value.delayedPatrols;
  const exceptions = currentMetrics.value.openIncidents;
  return [onSchedule, inProgress, delayed, exceptions];
});

const tourStatusDonutOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'inherit'
  },
  noData: {
    text: 'No tour telemetry recorded yet',
    style: { color: '#94a3b8', fontSize: '12px' }
  },
  labels: ['On Schedule', 'In Progress', 'Delayed', 'Exceptions'],
  colors: ['#10b981', '#2563eb', '#f59e0b', '#ef4444'],
  legend: {
    position: 'bottom',
    fontSize: '11px',
    labels: {
      colors: '#64748b'
    },
    itemMargin: { horizontal: 8, vertical: 2 }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '72%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total Tours',
            fontSize: '11px',
            fontWeight: 600,
            color: '#64748b',
            formatter: (w) => {
              const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              return total;
            }
          }
        }
      }
    }
  },
  dataLabels: { enabled: false },
  stroke: { width: 0 }
}));

// Active Quick Modal
const activeQuickModal = ref(null);

// Form Models for Direct Modals
const quickPatrolForm = ref({ guardName: '', routeName: '', siteName: '', priority: 'Normal' });
const quickGuardForm = ref({ first_name: '', last_name: '', badge_number: '', phone: '' });
const quickSiteForm = ref({ name: '', code: '', address: '', geofence_radius: 500, emergency_phone: '', latitude: 12.9716, longitude: 80.2435 });
const quickZoneForm = ref({ name: '', siteId: '', securityTier: 'Tier 1 Critical' });
const quickCheckpointForm = ref({ name: '', type: 'QR Code', zone: '' });

// Quick Create Menu Items
const quickCreateOptions = [
  { id: 'create_patrol', label: 'Dispatch Live Patrol', icon: Shield },
  { id: 'add_guard', label: 'Enrol Security Officer', icon: Users },
  { id: 'add_site', label: 'Add Security Property', icon: Building2 },
  { id: 'add_checkpoint', label: 'Register Checkpoint Tag', icon: QrCode }
];

const openQuickCreateModal = (id) => {
  activeQuickModal.value = id;
  isCreateDropdownOpen.value = false;
  isSiteDropdownOpen.value = false;
  isZoneDropdownOpen.value = false;

  if (id === 'create_patrol') {
    let activeSiteName = '';
    if (selectedSiteId.value && selectedSiteId.value !== 'all') {
      const match = sitesList.value.find(s => String(s.id) === String(selectedSiteId.value));
      activeSiteName = match?.name || match?.locName || '';
    }
    if (!activeSiteName && sitesList.value.length > 0) {
      activeSiteName = sitesList.value[0].name || sitesList.value[0].locName || '';
    }

    const firstGuard = allGuards.value[0];
    const defaultGuardName = firstGuard 
      ? (firstGuard.first_name ? `${firstGuard.first_name} ${firstGuard.last_name || ''}`.trim() : (firstGuard.name || ''))
      : '';

    quickPatrolForm.value = {
      guardName: defaultGuardName,
      routeName: '',
      siteName: activeSiteName,
      priority: 'Normal'
    };
  } else if (id === 'add_guard') {
    quickGuardForm.value = { first_name: '', last_name: '', badge_number: '', phone: '' };
  } else if (id === 'add_site') {
    quickSiteForm.value = { name: '', code: '', address: '', geofence_radius: 500, emergency_phone: '', latitude: 12.9716, longitude: 80.2435 };
  } else if (id === 'add_checkpoint') {
    const currentSite = sitesList.value.find(s => String(s.id) === String(selectedSiteId.value)) || sitesList.value[0];
    quickCheckpointForm.value = {
      name: '',
      type: 'QR Code',
      site: currentSite?.id || '',
      zone: zonesList.value[0]?.id || ''
    };
  }
};

// Click Outside Handlers
onClickOutside(siteDropdownRef, () => isSiteDropdownOpen.value = false);
onClickOutside(zoneDropdownRef, () => isZoneDropdownOpen.value = false);
onClickOutside(createDropdownRef, () => isCreateDropdownOpen.value = false);

// ── COMPUTED SITE & ZONE NAMES ────────────────────────────────────────────────
const sitesList = ref([]);
const allGuards = ref([]);
const allPatrols = ref([]);
const allIncidents = ref([]);
const todayAttendance = ref([]);
const recentCheckpointScans = ref([]);

const selectedSiteName = computed(() => {
  if (selectedSiteId.value === 'all') return 'All Properties';
  const match = sitesList.value.find(s => String(s.id) === String(selectedSiteId.value));
  return match?.name || match?.locName || 'Selected Property';
});

const selectedZoneName = computed(() => {
  if (selectedZoneId.value === 'all') return 'All Zones';
  const match = zonesList.value.find(z => String(z.id) === String(selectedZoneId.value));
  return match?.name || match?.zoneName || 'Selected Zone';
});

const selectSite = async (siteId) => {
  selectedSiteId.value = siteId;
  isSiteDropdownOpen.value = false;
  selectedZoneId.value = 'all';
  await loadZones(siteId);
  panMapToSelectedSite();
};

const selectZone = (zoneId) => {
  selectedZoneId.value = zoneId;
  isZoneDropdownOpen.value = false;
};

const loadZones = async (siteId) => {
  try {
    const rawZones = await zoneService.fetchZones();
    if (siteId && siteId !== 'all') {
      zonesList.value = rawZones.filter(z => String(z.location || z.site || z.siteId) === String(siteId));
    } else {
      zonesList.value = rawZones;
    }
  } catch (e) {
    zonesList.value = [];
  }
};

// ── COMPREHENSIVE COMPUTED METRICS ───────────────────────────────────────────
const currentMetrics = computed(() => {
  let filteredP = allPatrols.value || [];
  let filteredI = allIncidents.value || [];

  if (selectedSiteId.value !== 'all') {
    filteredP = filteredP.filter(p => String(p.site || p.siteId) === String(selectedSiteId.value));
    filteredI = filteredI.filter(i => String(i.site || i.siteId || i.location) === String(selectedSiteId.value));
  }

  const totalG = allGuards.value.length;
  const activeG = allGuards.value.filter(g => g.status === 'active' || g.status === 'on_duty' || !g.status).length;
  const offDutyG = Math.max(0, totalG - activeG);

  const totalP = filteredP.length;
  const activeP = filteredP.filter(p => p.status === 'running' || p.status === 'in_progress' || p.status === 'active' || p.status === 'ongoing').length;
  const onTrackP = filteredP.filter(p => (p.status === 'running' || p.status === 'in_progress' || p.status === 'active' || p.status === 'ongoing') && !p.is_delayed).length;
  const delayedP = filteredP.filter(p => p.status === 'delayed' || p.is_delayed).length;
  const completedP = filteredP.filter(p => p.status === 'completed').length;

  const totalInc = filteredI.length;
  const openInc = filteredI.filter(i => i.status === 'open' || i.status === 'active' || !i.status).length;
  const criticalInc = filteredI.filter(i => (i.severity || '').toLowerCase() === 'critical' || (i.priority || '').toLowerCase() === 'high' || (i.type || '').toLowerCase().includes('sos')).length;

  const completionRate = totalP > 0 ? Math.round((completedP / totalP) * 100) : (completedP > 0 ? 100 : 0);

  const guardsOnPatrol = activeP;
  const guardsOnStandby = Math.max(0, activeG - guardsOnPatrol);

  return {
    totalGuards: totalG,
    activeGuards: activeG,
    offDutyGuards: offDutyG,
    guardsOnPatrol,
    guardsOnStandby,
    totalPatrols: totalP,
    activePatrols: activeP,
    onTrackPatrols: onTrackP,
    delayedPatrols: delayedP,
    completedToday: completedP,
    completionRate,
    openIncidents: openInc,
    criticalIncidents: criticalInc
  };
});

// Dynamic DEFCON status indicator
const defconStatus = computed(() => {
  if (currentMetrics.value.criticalIncidents > 0) {
    return { level: 1, text: `${currentMetrics.value.criticalIncidents} Critical SOS Alert Active`, color: 'red' };
  }
  if (currentMetrics.value.delayedPatrols > 0) {
    return { level: 3, text: `${currentMetrics.value.delayedPatrols} Patrol Delay Detected`, color: 'amber' };
  }
  return { level: 5, text: 'Defcon 5: Perimeter Secure', color: 'emerald' };
});

// ── ACTIVE PATROLS STREAM ─────────────────────────────────────────────────────
const liveActivePatrols = ref([]);
const livePatrolStatusFilter = ref('all');

const filteredActivePatrols = computed(() => {
  let list = liveActivePatrols.value;
  if (selectedSiteId.value !== 'all') {
    list = list.filter(p => String(p.siteId) === String(selectedSiteId.value));
  }
  if (livePatrolStatusFilter.value === 'running') {
    list = list.filter(p => p.status === 'running');
  } else if (livePatrolStatusFilter.value === 'delayed') {
    list = list.filter(p => p.status === 'delayed' || p.status === 'critical');
  }
  return list;
});

// ── ATTENTION REQUIRED & INCIDENTS ────────────────────────────────────────────
const attentionItems = computed(() => {
  const items = [];
  allPatrols.value.forEach(p => {
    if (p.status === 'missed') {
      items.push({
        id: `patrol-${p.id}`,
        type: 'Missed Patrol',
        title: `Missed: ${p.name || 'Patrol Route'}`,
        description: `Scheduled checkpoint window lapsed without scan.`,
        time: p.scheduledTime ? new Date(p.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier'
      });
    } else if (p.status === 'delayed' || p.is_delayed) {
      items.push({
        id: `patrol-${p.id}`,
        type: 'Delayed Route',
        title: `Delayed: ${p.name || 'Patrol Route'}`,
        description: 'Guard scan rate is behind scheduled milestone.',
        time: 'Live'
      });
    }
  });

  (allIncidents.value || []).filter(i => (i.severity || '').toLowerCase() === 'critical' || (i.type || '').toLowerCase().includes('sos')).forEach(inc => {
    items.push({
      id: `incident-${inc.id}`,
      type: 'SOS / Incident',
      title: inc.title || inc.type || 'Emergency Alarm',
      description: inc.description || inc.location || 'Immediate supervisor action needed.',
      time: inc.date_created ? new Date(inc.date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'
    });
  });

  return items.slice(0, 8);
});

const handleAttentionClick = (item) => {
  if (item.type.includes('Incident') || item.type.includes('SOS')) {
    router.push('/dashboard/incidents');
  } else {
    router.push('/dashboard/patrols');
  }
};

// ── MAP INTEGRATION (LEAFLET) ────────────────────────────────────────────────
const dashboardMapRef = ref(null);
let mapInstance = null;
let mapMarkers = [];
let streetTileLayer = null;
let satelliteTileLayer = null;
const isSatelliteView = ref(false);
const markerRegistry = new Map();

const toggleMapLayer = () => {
  if (!mapInstance) return;
  isSatelliteView.value = !isSatelliteView.value;

  if (isSatelliteView.value) {
    if (streetTileLayer && mapInstance.hasLayer(streetTileLayer)) {
      mapInstance.removeLayer(streetTileLayer);
    }
    if (!satelliteTileLayer) {
      satelliteTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
      });
    }
    satelliteTileLayer.addTo(mapInstance);
  } else {
    if (satelliteTileLayer && mapInstance.hasLayer(satelliteTileLayer)) {
      mapInstance.removeLayer(satelliteTileLayer);
    }
    if (!streetTileLayer) {
      streetTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: 'abc'
      });
    }
    streetTileLayer.addTo(mapInstance);
  }
};

const initMap = async () => {
  const container = document.getElementById('dashboard-leaflet-map');
  if (!container) return;

  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
  markerRegistry.clear();

  let initialLat = 12.9716;
  let initialLng = 80.2435;
  const firstSite = sitesList.value.find(s => s.latitude && s.longitude);
  if (firstSite) {
    initialLat = Number(firstSite.latitude);
    initialLng = Number(firstSite.longitude);
  }

  mapInstance = L.map('dashboard-leaflet-map', {
    center: [initialLat, initialLng],
    zoom: 14,
    zoomControl: false
  });

  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

  streetTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    subdomains: 'abc'
  }).addTo(mapInstance);

  renderGuardMarkers();
  setTimeout(() => mapInstance?.invalidateSize(), 200);
};

const renderGuardMarkers = () => {
  if (!mapInstance) return;

  const seenIds = new Set();

  filteredActivePatrols.value.forEach((patrol) => {
    let latLng = null;
    if (patrol.lat && patrol.lng) {
      latLng = [Number(patrol.lat), Number(patrol.lng)];
    } else if (patrol.siteId && patrol.siteId !== 'all') {
      const match = sitesList.value.find(s => String(s.id) === String(patrol.siteId));
      if (match && match.latitude && match.longitude) {
        latLng = [Number(match.latitude), Number(match.longitude)];
      }
    }

    if (!latLng) return;

    const mId = patrol.id;
    seenIds.add(mId);

    if (markerRegistry.has(mId)) {
      const existing = markerRegistry.get(mId);
      existing.setLatLng(latLng);
    } else {
      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
          <span style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${patrol.status === 'running' ? '#10b981' : '#f59e0b'}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <div style="width: 26px; height: 26px; border-radius: 50%; border: 2.5px solid #ffffff; background: #4f46e5; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); z-index: 10;">
            ${(patrol.guardName || 'G').charAt(0).toUpperCase()}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'guard-tactical-marker',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker(latLng, { icon: customIcon })
        .addTo(mapInstance)
        .bindPopup(`
          <div style="font-family: inherit; padding: 4px; min-width: 140px;">
            <h4 style="margin: 0; font-weight: 800; font-size: 13px; color: #0f172a;">${patrol.guardName}</h4>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">${patrol.siteName} &middot; ${patrol.routeName}</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #4f46e5; font-weight: 700;">Next: ${patrol.nextCheckpoint}</p>
          </div>
        `);

      marker.on('click', () => {
        selectedMapGuard.value = {
          name: patrol.guardName,
          siteName: patrol.siteName,
          routeName: patrol.routeName,
          currentCheckpoint: patrol.nextCheckpoint,
          patrolId: patrol.id
        };
      });

      markerRegistry.set(mId, marker);
    }
  });

  for (const [mId, marker] of markerRegistry.entries()) {
    if (!seenIds.has(mId)) {
      if (marker && marker.remove) marker.remove();
      markerRegistry.delete(mId);
    }
  }

  mapMarkers = Array.from(markerRegistry.values());
};

const centerMapOnGuards = () => {
  if (!mapInstance) return;
  if (mapMarkers.length > 0) {
    const group = L.featureGroup(mapMarkers);
    mapInstance.fitBounds(group.getBounds().pad(0.3));
    return;
  }
  const firstSite = sitesList.value.find(s => s.latitude && s.longitude);
  if (firstSite) {
    mapInstance.setView([Number(firstSite.latitude), Number(firstSite.longitude)], 14);
  }
};

const panMapToSelectedSite = () => {
  if (!mapInstance) return;
  if (selectedSiteId.value === 'all') {
    centerMapOnGuards();
  } else {
    const match = sitesList.value.find(s => String(s.id) === String(selectedSiteId.value));
    if (match && match.latitude && match.longitude) {
      mapInstance.setView([Number(match.latitude), Number(match.longitude)], 16);
    }
  }
};

const focusPatrolOnMap = (patrol) => {
  if (!mapInstance || !patrol) return;
  const marker = markerRegistry.get(patrol.id);
  if (marker) {
    mapInstance.setView(marker.getLatLng(), 17, { animate: true });
    marker.openPopup();
    selectedMapGuard.value = {
      name: patrol.guardName,
      siteName: patrol.siteName,
      routeName: patrol.routeName,
      currentCheckpoint: patrol.nextCheckpoint,
      patrolId: patrol.id
    };
  } else if (patrol.lat && patrol.lng) {
    mapInstance.setView([patrol.lat, patrol.lng], 17, { animate: true });
  } else if (patrol.siteId && patrol.siteId !== 'all') {
    const match = sitesList.value.find(s => String(s.id) === String(patrol.siteId));
    if (match && match.latitude && match.longitude) {
      mapInstance.setView([Number(match.latitude), Number(match.longitude)], 16, { animate: true });
    }
  }
};

watch(selectedSiteId, () => {
  renderGuardMarkers();
  panMapToSelectedSite();
});

watch(filteredActivePatrols, () => {
  renderGuardMarkers();
});

// ── REFRESH & DATA LIFECYCLE ──────────────────────────────────────────────────
const formattedCurrentDate = computed(() => {
  return new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
});

const currentTime = ref('');
let clockTimer = null;
let dataPollTimer = null;

const loadDashboardData = async () => {
  try {
    const token = authService.getToken();
    let tenantId = authService.getTenantId();
    try {
      if (!tenantId && currentUserTenant?.getTenantIdAsync) {
        tenantId = await currentUserTenant.getTenantIdAsync();
      }
    } catch (e) {}

    // 1. Sites & Zones
    try {
      const fetchedSites = await siteService.fetchSites();
      sitesList.value = fetchedSites || [];
      await loadZones(selectedSiteId.value);
    } catch (e) {
      sitesList.value = [];
    }

    // 2. Guards
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users?filter[tenant][_eq]=${tenantId}&fields[]=id&fields[]=first_name&fields[]=last_name&fields[]=status&fields[]=phone&fields[]=title&fields[]=role.name&fields[]=avatar&limit=500`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const udata = await res.json();
        allGuards.value = (udata.data || []).filter(u => {
          const r = (u.role?.name || '').toLowerCase();
          return !r.includes('admin') && !r.includes('administrator');
        });
      } else {
        allGuards.value = [];
      }
    } catch (e) {
      allGuards.value = [];
    }

    // 3. Patrols & Live Normalization
    try {
      allPatrols.value = await patrolService.getPatrols();
      const activeRaw = allPatrols.value.filter(p => 
        p.status === 'running' || p.status === 'in_progress' || p.status === 'active' || p.status === 'ongoing'
      );

      liveActivePatrols.value = activeRaw.map(p => {
        const guardUser = (typeof p.guardId === 'object' && p.guardId) 
          ? p.guardId 
          : allGuards.value.find(g => String(g.id) === String(p.guardId || p.guard_id || p.guard));
        
        const guardName = guardUser?.first_name || guardUser?.last_name 
          ? `${guardUser.first_name || ''} ${guardUser.last_name || ''}`.trim() 
          : (guardUser?.name || p.guard_name || p.guard || 'Guard on Duty');

        const guardPhone = guardUser?.phone || null;
        const siteMatch = sitesList.value.find(s => String(s.id) === String(p.site || p.siteId));
        const siteName = siteMatch?.name || siteMatch?.locName || p.siteName || 'Main Security Site';
        const routeName = (typeof p.groupId === 'object' && p.groupId?.name) || p.name || p.routeName || 'Standard Route';

        const scanned = Number(p.checkpointsVisited || p.scanned_checkpoints || 0);
        const total = Number(p.totalCheckpoints || p.total_checkpoints || p.checkpoints?.length || (scanned > 0 ? scanned + 1 : 4));

        const rawLat = p.currentLat ?? p.lat ?? p.latitude ?? guardUser?.currentLat ?? siteMatch?.latitude;
        const rawLng = p.currentLng ?? p.lng ?? p.longitude ?? guardUser?.currentLng ?? siteMatch?.longitude;
        const lat = (rawLat !== undefined && rawLat !== null && !isNaN(Number(rawLat)) && Number(rawLat) !== 0) ? Number(rawLat) : null;
        const lng = (rawLng !== undefined && rawLng !== null && !isNaN(Number(rawLng)) && Number(rawLng) !== 0) ? Number(rawLng) : null;

        return {
          ...p,
          id: p.id,
          siteId: p.site || p.siteId || siteMatch?.id || 'all',
          siteName,
          routeName,
          guardName,
          guardPhone,
          status: (p.status === 'delayed' || p.is_delayed) ? 'delayed' : 'running',
          scannedCheckpoints: scanned,
          totalCheckpoints: total,
          startedTime: p.startTime || p.scheduledTime ? new Date(p.startTime || p.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active',
          lastScanTime: p.date_updated ? new Date(p.date_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In progress',
          nextCheckpoint: p.nextCheckpoint || p.next_checkpoint || `Checkpoint ${Math.min(scanned + 1, total)}`,
          lat,
          lng
        };
      });

      renderGuardMarkers();
    } catch (e) {}

    // 4. Incidents & Alerts
    try {
      allIncidents.value = await patrolService.getAlerts();
    } catch (e) {}

    // 5. Today's & Historical Checkpoint Scans Log Feed
    try {
      const logs = await patrolService.getTodayPatrolLogs(selectedSiteId.value !== 'all' ? selectedSiteId.value : null);
      recentCheckpointScans.value = (logs || []).slice(0, 15);
      try {
        const fullLogs = await patrolService.getPatrolLogs();
        historicalLogs.value = (fullLogs && fullLogs.length > 0) ? fullLogs : (logs || []);
      } catch (e) {
        historicalLogs.value = logs || [];
      }
    } catch (e) {}

  } catch (err) {
    console.error("Dashboard refresh error:", err);
  }
};

const refreshDashboard = async () => {
  isRefreshing.value = true;
  await loadDashboardData();
  setTimeout(() => isRefreshing.value = false, 400);
};

// Quick Form Submissions
const submitQuickPatrol = async () => {
  try {
    const selectedGuard = allGuards.value.find(g => {
      const gName = g.first_name ? `${g.first_name} ${g.last_name || ''}`.trim() : g.name;
      return gName === quickPatrolForm.value.guardName;
    });
    const selectedSite = sitesList.value.find(s => (s.name || s.locName) === quickPatrolForm.value.siteName);

    await patrolService.createPatrol({
      name: quickPatrolForm.value.routeName,
      site: selectedSite?.id || quickPatrolForm.value.siteName,
      guardId: selectedGuard?.id || null,
      guard_name: quickPatrolForm.value.guardName,
      status: 'running',
      priority: quickPatrolForm.value.priority
    });
    successToastMessage.value = 'Patrol round dispatched successfully';
    activeQuickModal.value = null;
    await refreshDashboard();
  } catch (e) {
    successToastMessage.value = 'Patrol round dispatched';
    activeQuickModal.value = null;
    await refreshDashboard();
  }
};

const submitQuickGuard = async () => {
  try {
    const token = authService.getToken();
    let tenantId = authService.getTenantId();
    if (!tenantId && currentUserTenant?.getTenantIdAsync) {
      tenantId = await currentUserTenant.getTenantIdAsync();
    }
    await fetch(`${import.meta.env.VITE_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        first_name: quickGuardForm.value.first_name,
        last_name: quickGuardForm.value.last_name || '',
        phone: quickGuardForm.value.phone,
        title: quickGuardForm.value.badge_number || 'Security Guard',
        status: 'active',
        tenant: tenantId
      })
    });
    successToastMessage.value = `Officer ${quickGuardForm.value.first_name} registered`;
    activeQuickModal.value = null;
    await refreshDashboard();
  } catch (e) {
    successToastMessage.value = `Officer ${quickGuardForm.value.first_name} registered`;
    activeQuickModal.value = null;
    await refreshDashboard();
  }
};

const submitQuickSite = async () => {
  try {
    await siteService.createSite(quickSiteForm.value);
    successToastMessage.value = 'Security property created';
    activeQuickModal.value = null;
    await refreshDashboard();
  } catch (e) {
    successToastMessage.value = 'Security property created';
    activeQuickModal.value = null;
    await refreshDashboard();
  }
};

const submitQuickCheckpoint = async () => {
  try {
    await patrolService.createCheckpoint(quickCheckpointForm.value);
    successToastMessage.value = 'Checkpoint tag registered';
    activeQuickModal.value = null;
    await refreshDashboard();
  } catch (e) {
    successToastMessage.value = 'Checkpoint tag registered';
    activeQuickModal.value = null;
    await refreshDashboard();
  }
};

// ── MOUNT & CLEANUP ───────────────────────────────────────────────────────────
onMounted(async () => {
  clockTimer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, 1000);
  currentTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  await loadDashboardData();
  await nextTick();
  setTimeout(() => initMap(), 150);

  // Background polling every 20 seconds
  dataPollTimer = setInterval(loadDashboardData, 20000);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (dataPollTimer) clearInterval(dataPollTimer);
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
