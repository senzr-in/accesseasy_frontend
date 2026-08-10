
<template>
  <div class="h-full flex flex-col bg-[#F5F4F1]/80 dark:bg-[#0b0f19] p-4 lg:p-6 overflow-hidden relative">
    <!-- Glassmorphism Glowing Orbs -->
    <div
      class="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[hsl(220,60%,70%)]/35 dark:bg-blue-600/20 blur-[100px] pointer-events-none z-0 animate-float-gentle"
      style="animation-delay: 0s;"
    />
    <div
      class="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-[hsl(260,50%,72%)]/30 dark:bg-indigo-600/20 blur-[100px] pointer-events-none z-0 animate-float-gentle"
      style="animation-delay: 1.5s;"
    />
    <div
      class="absolute top-[30%] left-[50%] w-[30%] h-[30%] rounded-full bg-[hsl(300,40%,78%)]/20 dark:bg-purple-600/10 blur-[100px] pointer-events-none z-0 animate-float-gentle"
      style="animation-delay: 3s;"
    />
    
    <!-- MAIN GRID (12 columns) -->
    <div class="flex-1 grid grid-cols-12 gap-6 min-h-0 mb-6 relative z-10">
      <!-- LEFT COLUMN: OPERATIONS (col-span-4) -->
      <div class="col-span-12 xl:col-span-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 min-h-0 animate-slide-up stagger-1">
        <div>
          <h2 class="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
            OPERATIONS
          </h2>
          <p class="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Quick actions to perform daily tasks
          </p>
        </div>

        <!-- VISITOR MANAGEMENT -->
        <div>
          <h3 class="text-[13px] font-bold text-slate-800 dark:text-slate-100 mb-3">
            Visitor Management
          </h3>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="item in visitorActions"
              :key="item.label"
              class="flex flex-col items-center justify-start gap-2 p-2.5 rounded-xl border border-[#E5E1D8]/80 dark:border-white/10 bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none hover:border-slate-300 dark:hover:border-white/20 dark:border-white/20 transition-all group"
              @click="item.action ? handleAction(item.action) : router.push(item.href)"
            >
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                :class="item.bg"
              >
                <component
                  :is="item.icon"
                  class="w-5 h-5"
                  :class="item.color"
                />
              </div>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">{{ item.label }}</span>
              <span class="text-[10px] font-medium text-slate-400 dark:text-slate-500 text-center leading-tight">{{ item.sub }}</span>
            </button>
          </div>
        </div>

        <!-- GUARD OPERATIONS -->
        <div>
          <h3 class="text-[13px] font-bold text-slate-800 dark:text-slate-100 mb-3">
            Guard Operations
          </h3>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="item in guardActions"
              :key="item.label"
              class="flex flex-col items-center justify-start gap-2 p-2.5 rounded-xl border border-[#E5E1D8]/80 dark:border-white/10 bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none hover:border-slate-300 dark:hover:border-white/20 dark:border-white/20 transition-all group"
              @click="item.action ? handleAction(item.action) : router.push(item.href)"
            >
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                :class="item.bg"
              >
                <component
                  :is="item.icon"
                  class="w-5 h-5"
                  :class="item.color"
                />
              </div>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">{{ item.label }}</span>
              <span class="text-[10px] font-medium text-slate-400 dark:text-slate-500 text-center leading-tight">{{ item.sub }}</span>
            </button>
          </div>
        </div>

        <!-- SMART QUEUE -->
        <div class="bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none rounded-[20px] border border-[#E5E1D8]/80 dark:border-white/10 shadow-sm flex flex-col flex-1 min-h-[300px]">
          <div class="p-4 border-b border-white/40 dark:border-white/5 shrink-0">
            <h3 class="text-[14px] font-bold text-slate-800 dark:text-slate-100 mb-3">
              Smart Queue
            </h3>
            <div class="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
              <button
                :class="activeQueueTab === 'All Visitors' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/5:bg-slate-800 border-transparent'"
                class="px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap transition-colors"
                @click="activeQueueTab = 'All Visitors'"
              >
                All Visitors <span
                  :class="activeQueueTab === 'All Visitors' ? 'bg-blue-600' : 'bg-slate-400'"
                  class="text-white rounded-full px-1.5 py-0.5 ml-1 text-[11px]"
                >{{ smartQueue.length }}</span>
              </button>
              <button
                :class="activeQueueTab === 'Waiting Approval' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/5:bg-slate-800 border-transparent'"
                class="px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap transition-colors"
                @click="activeQueueTab = 'Waiting Approval'"
              >
                Waiting Approval <span
                  :class="activeQueueTab === 'Waiting Approval' ? 'bg-amber-500' : 'bg-slate-400'"
                  class="text-white rounded-full px-1.5 py-0.5 ml-1 text-[11px]"
                >{{ smartQueue.filter(v => v.status === 'Waiting').length }}</span>
              </button>
              <button
                :class="activeQueueTab === 'Check-in Pending' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/5:bg-slate-800 border-transparent'"
                class="px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap transition-colors"
                @click="activeQueueTab = 'Check-in Pending'"
              >
                Check-in Pending <span
                  :class="activeQueueTab === 'Check-in Pending' ? 'bg-purple-500' : 'bg-slate-400'"
                  class="text-white rounded-full px-1.5 py-0.5 ml-1 text-[11px]"
                >{{ smartQueue.filter(v => v.status === 'Expected').length }}</span>
              </button>
            </div>
          </div>
          
          <div class="flex-1 overflow-y-auto p-2 custom-scrollbar">
            <div
              v-for="visitor in filteredSmartQueue"
              :key="visitor.name"
              class="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/5:bg-white/60 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none/5 rounded-xl transition-colors cursor-pointer group"
              @click="router.push('/dashboard/visitors')"
            >
              <img
                :src="visitor.avatar"
                class="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 object-cover"
              >
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">
                  {{ visitor.name }}
                </p>
                <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {{ visitor.company }}
                </p>
              </div>
              <div class="w-24 shrink-0">
                <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  {{ visitor.purpose }}
                </p>
              </div>
              <div class="w-16 shrink-0 text-right">
                <p class="text-[11px] font-bold text-slate-800 dark:text-slate-100">
                  {{ visitor.time }}
                </p>
              </div>
              <div class="w-16 shrink-0 flex justify-end">
                <span
                  class="text-[11px] font-bold px-2 py-1 rounded-md"
                  :class="visitor.statusClass"
                >{{ visitor.status }}</span>
              </div>
              <button class="w-6 h-6 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 shrink-0">
                <MoreVertical class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="p-3 border-t border-white/40 dark:border-white/5 bg-slate-50 dark:bg-white/5 rounded-b-[20px] shrink-0 flex items-center justify-between">
            <span class="text-[13px] font-bold text-slate-800 dark:text-slate-100">Today's Summary</span>
            <div class="flex gap-4">
              <div class="flex items-center gap-1.5">
                <Users class="w-3.5 h-3.5 text-emerald-500" />
                <div class="flex flex-col">
                  <span class="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-none">{{ stats.visitorsInside }}</span>
                  <span class="text-[10px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-none mt-0.5">Inside</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <UserCheck class="w-3.5 h-3.5 text-blue-500" />
                <div class="flex flex-col">
                  <span class="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-none">{{ stats.visitorsToday }}</span>
                  <span class="text-[10px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-none mt-0.5">Checked In</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-amber-500" />
                <div class="flex flex-col">
                  <span class="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-none">{{ visitorsWaiting.length }}</span>
                  <span class="text-[10px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-none mt-0.5">Waiting</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <AlertCircle class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <div class="flex flex-col">
                  <span class="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-none">{{ stats.overstaying }}</span>
                  <span class="text-[10px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-none mt-0.5">Overstaying</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MIDDLE COLUMN (col-span-5) -->
      <div class="col-span-12 xl:col-span-5 flex flex-col gap-5 min-h-0 animate-slide-up stagger-2">
        <!-- Header -->
        <div class="flex items-center justify-between shrink-0">
          <div>
            <h2 class="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
              LIVE COMMAND CENTER <div class="w-2 h-2 rounded-full bg-emerald-500" />
            </h2>
            <p class="text-[13px] text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">
              Real-time overview of your site
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="flex items-center gap-2 px-3 py-1.5 border border-[#E5E1D8]/80 dark:border-white/10 bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none rounded-lg text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/5:bg-white/5 shadow-sm transition-colors"
              @click="router.push('/dashboard/settings')"
            >
              <Settings class="w-3.5 h-3.5" /> Customize
            </button>
            <button
              class="w-8 h-8 flex items-center justify-center border border-[#E5E1D8]/80 dark:border-white/10 bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/5:bg-white/5 shadow-sm transition-colors"
              @click="document.documentElement.requestFullscreen().catch(()=>{})"
            >
              <Maximize class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- KPI Row -->
        <div class="grid grid-cols-4 gap-3 shrink-0">
          <div
            class="bg-[hsl(155,30%,97%)] dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-[#E5E1D8]/80 dark:border-white/10 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3 cursor-pointer hover:border-emerald-200 transition-all"
            @click="router.push('/dashboard/visitors')"
          >
            <span class="text-4xl font-black text-[#35A673] leading-none shrink-0">24</span>
            <div class="min-w-0">
              <p class="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                Visitors Inside
              </p>
              <p class="text-[11px] text-[#35A673] font-bold mt-1 truncate">
                ↑ 12% from yesterday
              </p>
            </div>
          </div>
          <div
            class="bg-[hsl(220,30%,97%)] dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-[#E5E1D8]/80 dark:border-white/10 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3 cursor-pointer hover:border-blue-200 transition-all"
            @click="router.push('/dashboard/guards')"
          >
            <span class="text-4xl font-black text-[#3E7DD4] leading-none shrink-0">8</span>
            <div class="min-w-0">
              <p class="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                Guards On Duty
              </p>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1 truncate">
                2 Patrolling
              </p>
            </div>
          </div>
          <div
            class="bg-[hsl(38,35%,97%)] dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-[#E5E1D8]/80 dark:border-white/10 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3 cursor-pointer hover:border-amber-200 transition-all"
            @click="router.push('/dashboard/patrols')"
          >
            <span class="text-4xl font-black text-[#D4900A] leading-none shrink-0">2</span>
            <div class="min-w-0">
              <p class="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                Patrols Running
              </p>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1 truncate">
                North Zone, Parking
              </p>
            </div>
          </div>
          <div class="bg-[hsl(348,30%,97%)] dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-[#E5E1D8]/80 dark:border-white/10 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3 hover:border-rose-200 transition-all">
            <span class="text-4xl font-black text-[#D44B62] leading-none shrink-0">{{ recentIncidents.length }}</span>
            <div class="min-w-0">
              <p class="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                Active Alerts
              </p>
              <p class="text-[11px] text-[#D44B62] font-medium mt-1 truncate">
                Requires attention
              </p>
            </div>
          </div>
        </div>

        <!-- MAP -->
        <div class="flex-1 rounded-[20px] bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-[#E5E1D8]/80 dark:border-white/10 p-1.5 overflow-hidden relative shadow-sm min-h-[250px]">
          <div
            ref="dashboardMapContainer"
            class="w-full h-full rounded-[16px] overflow-hidden transition-all duration-500"
            :style="isDark ? 'filter: invert(100%) hue-rotate(180deg) brightness(75%) contrast(75%) grayscale(40%);' : ''"
          />
          <div
            v-if="!activeGuards.length"
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span class="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none px-4 py-2 rounded-full shadow-sm backdrop-blur">No active locations</span>
          </div>
        </div>

        <!-- Patrol + Live Activity -->
        <div class="grid grid-cols-2 gap-4 shrink-0 h-[220px]">
          <!-- Patrol Progress -->
          <div class="bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-[#E5E1D8]/80 dark:border-white/10 rounded-[20px] p-4 shadow-sm flex flex-col overflow-hidden">
            <div class="flex items-center justify-between mb-4 shrink-0">
              <h3 class="text-[13px] font-black text-slate-800 dark:text-slate-100">
                Patrol Progress
              </h3>
              <button
                class="text-xs font-bold text-blue-600 hover:underline"
                @click="router.push('/dashboard/patrols')"
              >
                View All
              </button>
            </div>
            <div class="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
              <div
                v-for="patrol in patrolList"
                :key="patrol.name"
                class="cursor-pointer group"
                @click="router.push('/dashboard/patrols')"
              >
                <div class="flex items-center justify-between mb-1.5">
                  <div>
                    <span class="text-[13px] font-bold text-slate-800 dark:text-slate-100 block">{{ patrol.name }}</span>
                    <span class="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium block mt-0.5">{{ patrol.pct }}% Completed</span>
                  </div>
                  <span
                    v-if="patrol.status === 'On Track'"
                    class="text-[11px] font-bold text-emerald-500"
                  >On Track</span>
                  <span
                    v-else
                    class="text-[11px] font-bold text-amber-500"
                  >Delayed</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="patrol.status === 'On Track' ? 'bg-emerald-500' : 'bg-amber-400'"
                      :style="{ width: patrol.pct + '%' }"
                    />
                  </div>
                  <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">{{ patrol.done }}/{{ patrol.total }} Checkpoints</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Unified Access Events -->
          <div class="bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-[#E5E1D8]/80 dark:border-white/10 rounded-[20px] shadow-sm flex flex-col overflow-hidden h-full">
            <UnifiedEventLog class="w-full h-full overflow-y-auto" />
          </div>
        </div>
      </div>
      
      <!-- RIGHT COLUMN (col-span-3) -->
      <div class="col-span-12 xl:col-span-3 flex flex-col gap-6 min-h-0 pt-10 animate-slide-up stagger-3">
        <!-- ACTIVE ALERTS -->
        <div class="bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none rounded-[20px] border border-[#E5E1D8]/80 dark:border-white/10 p-5 shadow-sm flex flex-col flex-1 min-h-0">
          <div class="flex items-center justify-between mb-4 shrink-0">
            <h3 class="text-[14px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle class="w-5 h-5 text-rose-500" /> Active Alerts
            </h3>
          </div>

          <p
            v-if="!recentIncidents.length"
            class="text-xs text-slate-500 text-center py-4"
          >
            No active alerts
          </p>
          <div
            v-else
            class="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1"
          >
            <div
              v-for="alert in recentIncidents"
              :key="alert.id"
            >
              <!-- High Severity Alert -->
              <div
                v-if="alert.severity === 'high' || alert.title.toUpperCase().includes('SOS')"
                class="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-3 relative overflow-hidden"
              >
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-xl" />
                <div class="flex justify-between items-center mb-2 pl-2">
                  <div class="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <AlertTriangle class="w-4 h-4" />
                    <span class="text-[13px] font-black uppercase tracking-wide">{{ alert.title }}</span>
                  </div>
                  <span class="text-[11px] font-black px-1.5 py-0.5 rounded bg-rose-500 text-white uppercase animate-pulse">LIVE</span>
                </div>
                <div class="pl-2 space-y-1 mb-3">
                  <p class="text-xs text-rose-700 dark:text-rose-200">
                    By: <span class="font-bold text-rose-900 dark:text-white">{{ alert.reportedBy }}</span>
                  </p>
                  <p class="text-xs text-rose-700 dark:text-rose-200">
                    Location: <span class="font-bold text-rose-900 dark:text-white">{{ alert.location }}</span>
                  </p>
                  <p class="text-xs text-rose-700 dark:text-rose-200">
                    Time: <span class="font-bold text-rose-900 dark:text-white">{{ alert.time }}</span>
                  </p>
                </div>
                <button
                  class="w-full py-1.5 bg-[#FDFCFA]/70 dark:bg-white/10 backdrop-blur-md shadow-xl shadow-slate-200/20 dark:shadow-none border border-[#E5E1D8]/80 dark:border-white/10 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/20 transition-all"
                  @click="openIncidentDetails(alert)"
                >
                  View Details
                </button>
              </div>

              <!-- Normal Alert -->
              <div
                v-else
                class="border border-white/40 dark:border-white/5 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all group"
                @click="openIncidentDetails(alert)"
              >
                <div class="flex gap-2">
                  <AlertCircle class="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p class="text-[13px] font-bold text-slate-800 dark:text-slate-100">
                      {{ alert.title }}
                    </p>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {{ alert.location }}
                    </p>
                  </div>
                </div>
                <span class="text-[11px] font-medium text-slate-400">{{ alert.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- GUARDS ON DUTY -->
        <div class="bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none rounded-[20px] border border-[#E5E1D8]/80 dark:border-white/10 p-5 shadow-sm flex flex-col flex-1 min-h-0">
          <div class="flex items-center justify-between mb-4 shrink-0">
            <h3 class="text-[14px] font-bold text-slate-800 dark:text-slate-100">
              Guards On Duty
            </h3>
            <button
              class="text-xs font-bold text-blue-600 hover:underline"
              @click="router.push('/dashboard/guards')"
            >
              View All
            </button>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
            <div
              v-for="guard in refGuardsList"
              :key="guard.name"
              class="flex items-center gap-3 cursor-pointer group"
              @click="router.push('/dashboard/guards')"
            >
              <div class="relative">
                <img
                  :src="guard.avatar"
                  class="w-10 h-10 rounded-full object-cover border border-[#E5E1D8]/80 dark:border-white/10"
                >
                <div class="absolute -bottom-1 -right-1 bg-[#FDFCFA]/70 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none rounded-full p-0.5 border border-[#E5E1D8]/80 dark:border-white/10 shadow-sm">
                  <Shield
                    v-if="guard.patrolling"
                    class="w-3 h-3 text-blue-600"
                  />
                  <User
                    v-else
                    class="w-3 h-3 text-slate-400 dark:text-slate-500"
                  />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">
                  {{ guard.name }}
                </p>
                <p class="text-[11px] truncate font-medium mt-0.5 text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  {{ guard.patrolling ? 'Patrolling' : 'Standing By' }} - {{ guard.loc }}
                </p>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  :class="guard.batColor === 'amber' ? 'bg-amber-400' : 'bg-emerald-500'"
                />
                <span class="text-xs font-bold text-slate-600 dark:text-slate-300">{{ guard.bat }}%</span>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-white/40 dark:border-white/5 mt-4 shrink-0 flex justify-between items-center">
            <span class="text-[13px] text-slate-800 dark:text-slate-100 font-bold">{{ stats.guardsOnDuty }} Guards On Duty</span>
            <button
              class="text-xs font-bold text-blue-600 hover:underline"
              @click="router.push('/dashboard/guards')"
            >
              View All
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- ── QR Print/Download Modal ── -->
  <div
    v-if="showQrModal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
  >
    <div
      class="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
      @click="showQrModal = false"
    />
    <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 w-full max-w-sm overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 class="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
          <QrCode class="w-4 h-4 text-violet-500" />
          <span v-if="activePortalIndex === -1">Visitor Registration Portal</span>
          <span v-else>Visitor Registration QR</span>
        </h3>
        <button
          class="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"
          @click="showQrModal = false"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Portal List View -->
      <div
        v-if="activePortalIndex === -1"
        class="flex flex-col p-4 max-h-[400px] overflow-y-auto custom-scrollbar gap-2"
      >
        <div
          v-for="(portal, idx) in availablePortals"
          :key="portal.id"
          class="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-500/50 cursor-pointer transition-all group"
          @click="activePortalIndex = idx"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
              <Globe class="w-5 h-5 text-blue-500" />
            </div>
            <div class="min-w-0">
              <p class="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">
                {{ portal.Title || 'Visitor Registration Portal' }}
              </p>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {{ windowOrigin }}/visit/{{ portal.id.substring(0, 8) }}...
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <QrCode class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <button
              class="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 flex items-center justify-center transition-colors shrink-0"
              @click.stop="downloadFromCard(idx)"
            >
              <Download class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
        </div>
          
        <div
          v-if="availablePortals.length === 0"
          class="py-12 text-center text-slate-500"
        >
          <Globe class="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p class="text-sm font-bold">
            No visitor portals found
          </p>
        </div>
      </div>

      <!-- Printable QR Area -->
      <div v-else>
        <div
          id="dashboard-qr-area"
          class="flex flex-col items-center px-8 py-8 bg-white dark:bg-slate-900"
        >
          <div class="mb-4 text-center">
            <h4 class="font-bold text-slate-800 dark:text-slate-100 text-[13px]">
              {{ activePortalTitle }}
            </h4>
          </div>
          <div class="p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-5">
            <QrcodeVue
              :value="qrDownloadUrl"
              :size="200"
              level="H"
              render-as="svg"
            />
          </div>
          <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center mb-1">
            Scan to register
          </p>
          <p class="text-[8px] font-mono text-slate-400 text-center break-all max-w-[220px]">
            {{ qrDownloadUrl }}
          </p>
        </div>

        <!-- Actions -->
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
          <button
            v-if="availablePortals.length > 1"
            class="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 transition-colors"
            @click="activePortalIndex = -1"
          >
            Back
          </button>
          <button
            v-else
            class="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 transition-colors"
            @click="showQrModal = false"
          >
            Close
          </button>
          <button
            :disabled="isDownloadingQr"
            class="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            @click="downloadDashboardQr"
          >
            <Loader2
              v-if="isDownloadingQr"
              class="w-3.5 h-3.5 animate-spin"
            />
            <Download
              v-else
              class="w-3.5 h-3.5"
            />
            Download
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Incident Details Modal ── -->
  <div
    v-if="selectedIncident"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
  >
    <div
      class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      @click="selectedIncident = null"
    />
    <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-rose-50/50 dark:bg-rose-500/5">
        <div class="flex gap-4 items-center">
          <div class="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle class="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 class="text-[15px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {{ selectedIncident.title }}
            </h3>
            <p class="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mt-0.5">
              {{ selectedIncident.severity === 'high' || selectedIncident.title.toUpperCase().includes('SOS') ? 'CRITICAL ALERT' : 'SYSTEM ALERT' }}
            </p>
          </div>
        </div>
        <button
          class="text-slate-400 hover:text-slate-600 transition-colors mt-1"
          @click="selectedIncident = null"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-white dark:bg-slate-900">
        <!-- Location -->
        <div>
          <div class="flex items-center gap-2 mb-1">
            <MapPin class="w-4 h-4 text-slate-400" />
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Location</span>
          </div>
          <p class="text-[14px] font-bold text-slate-800 dark:text-slate-100 pl-6">
            {{ selectedIncident.location }}
          </p>
            
          <!-- Map View -->
          <div class="mt-3 ml-6 h-28 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-700 bg-slate-100 flex items-center justify-center">
            <iframe 
              v-if="selectedIncident.location"
              width="100%" 
              height="100%" 
              style="border:0;" 
              loading="lazy" 
              allowfullscreen 
              :src="`https://maps.google.com/maps?q=${encodeURIComponent(selectedIncident.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`"
            />
            <div
              v-else
              class="text-xs text-slate-400"
            >
              Map not available
            </div>
          </div>
        </div>

        <!-- Time Reported -->
        <div>
          <div class="flex items-center gap-2 mb-1">
            <Clock class="w-4 h-4 text-slate-400" />
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Time Reported</span>
          </div>
          <p class="text-[14px] font-bold text-slate-800 dark:text-slate-100 pl-6">
            {{ selectedIncident.time }}
          </p>
        </div>

        <!-- Reported By -->
        <div>
          <div class="flex items-center gap-2 mb-1">
            <User class="w-4 h-4 text-slate-400" />
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Reported By</span>
          </div>
          <p class="text-[14px] font-bold text-slate-800 dark:text-slate-100 pl-6">
            {{ selectedIncident.reportedBy }}
          </p>
        </div>

        <!-- Details & Context -->
        <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 ml-6">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Details & Context</span>
          <p class="text-[13px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-4">
            {{ selectedIncident.description }}
          </p>

          <!-- Audio Player if available -->
          <div
            v-if="selectedIncident.audioUrl"
            class="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex items-center gap-4"
          >
            <div class="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center shrink-0">
              <Mic class="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1.5 truncate">
                Audio Message.mp3
              </p>
              <audio
                controls
                class="w-full h-8"
                :src="selectedIncident.audioUrl"
              />
            </div>
          </div>

          <!-- Image if available -->
          <div
            v-else-if="selectedIncident.imageUrl"
            class="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <img
              :src="selectedIncident.imageUrl"
              class="w-full h-auto max-h-48 object-cover"
            >
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 bg-slate-50 dark:bg-slate-800/20 shrink-0 w-full">
        <!-- Automated Dispatch UI -->
        <div
          v-if="selectedIncident.severity === 'high' || selectedIncident.title.toUpperCase().includes('SOS')"
          class="flex items-center justify-center gap-2 text-[12px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20 animate-pulse-soft w-full"
        >
          <UserCheck class="w-4 h-4 shrink-0" /> AI Suggestion: Guard Smith is 45m away
        </div>

        <div class="flex items-center justify-end gap-2 w-full">
          <button
            class="px-4 py-2.5 text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors"
            @click="selectedIncident = null"
          >
            Close
          </button>
          <button
            v-if="selectedIncident.severity === 'high' || selectedIncident.title.toUpperCase().includes('SOS')"
            class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            @click="selectedIncident = null"
          >
            Acknowledge Alert
          </button>
          <button
            class="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 shadow-sm"
            @click="selectedIncident = null"
          >
            <Shield class="w-4 h-4 shrink-0" />
            Manage
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Checkpoint QR Print/Download Modal ── -->
  <div
    v-if="showCheckpointQrModal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
  >
    <div
      class="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
      @click="showCheckpointQrModal = false"
    />
    <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
        <h3 class="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
          <QrCode class="w-4 h-4 text-purple-500" />
          <span v-if="activeGroupIndex === -1">Select Checkpoint Group</span>
          <span v-else>{{ activeGroupTitle }} Checkpoints</span>
        </h3>
        <button
          class="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"
          @click="showCheckpointQrModal = false"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Group List View -->
      <div
        v-if="activeGroupIndex === -1"
        class="flex flex-col p-4 overflow-y-auto custom-scrollbar gap-2"
      >
        <div
          v-for="(group, idx) in availableCheckpointGroups"
          :key="group.id"
          class="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-purple-300 dark:hover:border-purple-500/50 cursor-pointer transition-all group-item"
          @click="selectGroup(idx)"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
              <MapPin class="w-5 h-5 text-purple-500" />
            </div>
            <div class="min-w-0">
              <p class="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">
                {{ group.name || 'Group ' + (idx + 1) }}
              </p>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Patrol Route
              </p>
            </div>
          </div>
          <div class="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 ml-2">
            <QrCode class="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
          
        <div
          v-if="availableCheckpointGroups.length === 0"
          class="py-12 text-center text-slate-500"
        >
          <MapPin class="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p class="text-sm font-bold">
            No checkpoint groups found
          </p>
        </div>

        <!-- Create Button -->
        <button
          class="mt-2 w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors group"
          @click="router.push('/dashboard/patrols')"
        >
          <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 flex items-center justify-center transition-colors">
            <Plus class="w-4 h-4" />
          </div>
          <span class="text-[13px] font-bold">Create Checkpoint Group</span>
        </button>
      </div>

      <!-- Printable QR Area -->
      <div
        v-else
        class="flex flex-col flex-1 overflow-y-auto"
      >
        <div
          v-if="isFetchingCheckpoints"
          class="flex flex-col items-center justify-center py-12"
        >
          <Loader2 class="w-8 h-8 animate-spin text-purple-500 mb-2" />
          <p class="text-xs text-slate-500">
            Loading checkpoints...
          </p>
        </div>
        <div
          v-else
          id="checkpoint-qr-area"
          class="flex flex-col items-center px-6 py-6 bg-white dark:bg-slate-900 w-full"
        >
          <div class="mb-6 text-center w-full">
            <h4 class="font-black text-slate-800 dark:text-slate-100 text-[15px] uppercase tracking-wide">
              {{ activeGroupTitle }}
            </h4>
            <p class="text-[11px] text-slate-500 mt-0.5">
              {{ groupCheckpoints.length }} Checkpoints
            </p>
          </div>
            
          <div
            v-if="groupCheckpoints.length === 0"
            class="text-sm text-slate-500 py-4"
          >
            No checkpoints assigned to this group.
          </div>

          <div
            v-else
            class="grid grid-cols-2 gap-4 w-full"
          >
            <div
              v-for="cp in groupCheckpoints"
              :key="cp.id"
              class="relative group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 shadow-sm flex flex-col items-center"
            >
              <div
                :id="'cp-qr-' + cp.id"
                class="flex flex-col items-center w-full bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-transparent dark:border-slate-800"
              >
                <div class="p-2 bg-white rounded-lg mb-3">
                  <QrcodeVue
                    :value="generateSignedQr(cp.checkpoint_id)"
                    :size="100"
                    level="H"
                    render-as="svg"
                  />
                </div>
                <h4 class="font-bold text-slate-800 dark:text-slate-100 text-[11px] text-center mb-0.5 truncate w-full">
                  {{ cp.name }}
                </h4>
                <p class="text-[9px] text-slate-500 text-center truncate w-full">
                  ID: {{ cp.checkpoint_id }}
                </p>
              </div>

              <button
                class="absolute top-2 right-2 w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 flex items-center justify-center transition-colors shadow-sm"
                @click="downloadIndividualCheckpointQr(cp)"
              >
                <Download class="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-2 shrink-0 bg-white dark:bg-slate-900">
          <button
            class="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 transition-colors"
            @click="activeGroupIndex = -1"
          >
            Back
          </button>
          <button
            :disabled="isDownloadingQr || isFetchingCheckpoints || groupCheckpoints.length === 0"
            class="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
            @click="downloadCheckpointQrAction"
          >
            <Loader2
              v-if="isDownloadingQr"
              class="w-3.5 h-3.5 animate-spin"
            />
            <Download
              v-else
              class="w-3.5 h-3.5"
            />
            Download All
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useDark } from '@vueuse/core';
import {
  MoreVertical, Settings, Maximize, AlertCircle, Plus,
  Users, Shield, AlertTriangle, UserCheck, UserPlus, QrCode, Search, Clock,
  PlayCircle, Radio, Contact, Lock, DoorOpen, LayoutGrid, LayoutDashboard,
  SlidersHorizontal, Battery, MoreHorizontal, User, Calendar,
  MapPin, Globe, Building2, Download, Loader2, X, Mic
} from 'lucide-vue-next';
import PatrolMapReplay from '@/pages/guard/tabs/components/PatrolMapReplay.vue';
import QrcodeVue from 'qrcode.vue';
import UnifiedEventLog from '@/components/UnifiedEventLog.vue';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { useDashboardState } from '@/composables/useDashboardState';
import { useZoneFilter } from '@/composables/useZoneFilter';
import { Loader } from '@googlemaps/js-api-loader';

const router = useRouter();
const token = authService.getToken();
const apiUrl = import.meta.env.VITE_API_URL;

const showQrModal = ref(false);
const availablePortals = ref([]);
const activePortalIndex = ref(-1);
const isDownloadingQr = ref(false);
const windowOrigin = window.location.origin;

const qrDownloadUrl = computed(() => {
  if (availablePortals.value.length === 0 || activePortalIndex.value === -1) return window.location.origin + '/visit/default';
  return window.location.origin + '/visit/' + availablePortals.value[activePortalIndex.value].id;
});

const activePortalTitle = computed(() => {
  if (availablePortals.value.length === 0 || activePortalIndex.value === -1) return 'Visitor Registration';
  return availablePortals.value[activePortalIndex.value].Title || 'Visitor Registration';
});

const showCheckpointQrModal = ref(false);
const availableCheckpointGroups = ref([]);
const activeGroupIndex = ref(-1);
const groupCheckpoints = ref([]);
const isFetchingCheckpoints = ref(false);

const activeGroupTitle = computed(() => {
  if (availableCheckpointGroups.value.length === 0 || activeGroupIndex.value === -1) return 'Checkpoint Group';
  return availableCheckpointGroups.value[activeGroupIndex.value].name || 'Checkpoint Group';
});

const generateSignedQr = (id) => {
  const tenantId = authService.getTenantId();
  const signature = btoa(`${id}-${tenantId}-AccessEasy2026`).replace(/=/g, '');
  return `ACPT::${id}::${signature}`;
};

const handleAction = async (action) => {
  if (action === 'downloadQR') {
    activePortalIndex.value = availablePortals.value.length === 1 ? 0 : -1;
    showQrModal.value = true;
  }
  if (action === 'downloadCheckpointQR') {
    try {
      const tenantId = authService.getTenantId();
      const res = await fetch(`${apiUrl}/items/checkpoint_groups?filter[tenant][_eq]=${tenantId}&sort=-date_created`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        availableCheckpointGroups.value = d.data || [];
      }
    } catch (e) { console.error(e); }
    activeGroupIndex.value = -1;
    showCheckpointQrModal.value = true;
  }
};

const selectGroup = async (idx) => {
  activeGroupIndex.value = idx;
  isFetchingCheckpoints.value = true;
  try {
    const groupId = availableCheckpointGroups.value[idx].id;
    const res = await fetch(`${apiUrl}/items/checkpoints?filter[group_id][_eq]=${groupId}&sort=sort_order`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const d = await res.json();
      groupCheckpoints.value = d.data || [];
    }
  } catch (e) { console.error(e); } finally {
    isFetchingCheckpoints.value = false;
  }
};

const downloadCheckpointQrAction = async () => {
  const area = document.getElementById('checkpoint-qr-area');
  if (!area) return;
  isDownloadingQr.value = true;
  try {
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(area, { backgroundColor: isDark.value ? '#0f172a' : '#ffffff', pixelRatio: 2 });
    const link = document.createElement('a');
    const filename = activeGroupTitle.value.replace(/\s+/g, '-');
    link.download = `${filename}-Checkpoints-QR.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('QR download failed:', err);
  } finally {
    isDownloadingQr.value = false;
  }
};

const downloadIndividualCheckpointQr = async (cp) => {
  const area = document.getElementById('cp-qr-' + cp.id);
  if (!area) return;
  isDownloadingQr.value = true;
  try {
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(area, { backgroundColor: isDark.value ? '#0f172a' : '#f8fafc', pixelRatio: 3 });
    const link = document.createElement('a');
    const filename = (cp.name || cp.checkpoint_id).replace(/\s+/g, '-');
    link.download = `${filename}-Checkpoint-QR.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('QR download failed:', err);
  } finally {
    isDownloadingQr.value = false;
  }
};

const downloadDashboardQr = async () => {
  const area = document.getElementById('dashboard-qr-area');
  if (!area) return;
  isDownloadingQr.value = true;
  try {
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(area, { backgroundColor: '#ffffff', pixelRatio: 3 });
    const link = document.createElement('a');
    const filename = activePortalTitle.value.replace(/\s+/g, '-');
    link.download = `${filename}-QR.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('QR download failed:', err);
  } finally {
    isDownloadingQr.value = false;
  }
};

const downloadFromCard = async (idx) => {
  activePortalIndex.value = idx;
  await nextTick();
  setTimeout(() => {
    downloadDashboardQr();
  }, 100);
};

const { selectedZone, zones } = useZoneFilter();

const currentZoneName = computed(() => {
  if (selectedZone.value === 'all') return 'Global Workspace';
  const z = zones.value.find(z => z.id === selectedZone.value);
  return z ? z.zoneName : 'Global Workspace';
});

const loading = ref(false);
const activeGuards = ref([]);


const visitorActions = [
  { label: 'Register Visitor', sub: 'Add walk-in visitor', href: '/dashboard/visitors', icon: UserPlus, bg: 'bg-indigo-50', color: 'text-indigo-600' },
  { label: 'Download QR', sub: 'Visitor registration', action: 'downloadQR', icon: QrCode, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  { label: 'Expected Visitors', sub: 'View schedule', href: '/dashboard/visitors', icon: Calendar, bg: 'bg-orange-50', color: 'text-orange-500' },
  { label: 'Search Visitor', sub: 'Find existing', href: '/dashboard/visitors', icon: Search, bg: 'bg-blue-50', color: 'text-blue-600' },
  { label: 'Visitor History', sub: 'View all logs', href: '/dashboard/visitors', icon: Clock, bg: 'bg-purple-50', color: 'text-purple-600' },
];

const guardActions = [
  { label: 'Start Patrol', sub: 'Create new patrol', href: '/dashboard/patrols', icon: PlayCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  { label: 'Checkpoint QR', sub: 'Download QR Codes', action: 'downloadCheckpointQR', icon: QrCode, bg: 'bg-purple-50', color: 'text-purple-600' },
  { label: 'Assign Guard', sub: 'Assign to post', href: '/dashboard/guards', icon: UserCheck, bg: 'bg-blue-50', color: 'text-blue-600' },
  { label: 'Live Guards', sub: 'Track in real-time', href: '/dashboard/guards', icon: Radio, bg: 'bg-green-50', color: 'text-green-600' },
  { label: 'Incidents', sub: 'Report incident', href: '/dashboard/monitoring', icon: AlertTriangle, bg: 'bg-rose-50', color: 'text-rose-600' },
];

const { 
  recentLogs, startPolling, stopPolling, loadDashboardData,
  visitorsWaiting, visitorsInside, visitorsExpected, timelineEvents
} = useDashboardState();

const activeQueueTab = ref('All Visitors');

const smartQueue = computed(() => {
  let all = [...visitorsInside.value, ...visitorsWaiting.value, ...visitorsExpected.value];
  return all.map(v => ({
    ...v,
    name: v.personName || 'Unknown',
    company: v.company || 'N/A',
    purpose: v.reasonForVisit || 'Visit',
    time: v.startTime || (v.startDate ? new Date(v.startDate).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : 'N/A'),
    status: v.status === 'active' ? 'Checked In' : (visitorsWaiting.value.find(w => w.id === v.id) ? 'Waiting' : 'Expected'),
    statusClass: v.status === 'active' ? 'bg-emerald-100 text-emerald-600' : (visitorsWaiting.value.find(w => w.id === v.id) ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'),
    avatar: v.photo ? `${apiUrl}/assets/${v.photo}?access_token=${token}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(v.personName || 'V')
  }));
});

const filteredSmartQueue = computed(() => {
  if (activeQueueTab.value === 'Waiting Approval') return smartQueue.value.filter(v => v.status === 'Waiting');
  if (activeQueueTab.value === 'Check-in Pending') return smartQueue.value.filter(v => v.status === 'Expected');
  return smartQueue.value;
});

const refGuardsList = computed(() => {
  return activeGuards.value.map(g => ({
    name: g.guardName,
    loc: g.userLocation || 'On Patrol',
    bat: g.bat,
    batColor: g.batColor,
    patrolling: true,
    avatar: g.directusAvatar ? `${apiUrl}/assets/${g.directusAvatar}?access_token=${token}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(g.guardName || 'G')
  }));
});

const liveEvents = computed(() => {
  return timelineEvents.value.map(e => ({
    label: e.text.split(' at ')[0] || e.text,
    sub: e.text.split(' at ')[1] || 'Site Activity',
    time: e.time,
    icon: e.type === 'success' ? UserCheck : (e.type === 'danger' ? AlertTriangle : User),
    iconBg: e.type === 'success' ? 'bg-emerald-50 border-emerald-100' : (e.type === 'danger' ? 'bg-rose-50 border-rose-100' : 'bg-blue-50 border-blue-100'),
    iconColor: e.type === 'success' ? 'text-emerald-600' : (e.type === 'danger' ? 'text-rose-600' : 'text-blue-600'),
    urgent: e.type === 'danger'
  }));
});

const stats = ref({
  visitorsToday: 0,
  visitorsInside: 0,
  guardsOnDuty: 0,
  patrolCompletion: 0,
  patrolsCompleted: 0,
  overstaying: 0,
  missedCheckpoints: 0,
  checkpointGroups: 0,
  accessPoints: 0,
  zones: 0,
});

const patrolList = computed(() => {
  return []; // We don't have detailed live patrol progress easily accessible without refactoring patrolService, but we can clear the mock data.
});



const recentIncidents = ref([]);

const loadIncidents = async () => {
  try {
    const { patrolService } = await import('@/services/patrolService');
    const rawAlerts = await patrolService.getAlerts();
    recentIncidents.value = rawAlerts.map(a => {
      let finalImageUrl = a.image_url || null;
      if (finalImageUrl && !finalImageUrl.includes('access_token')) {
        const joiner = finalImageUrl.includes('?') ? '&' : '?';
        finalImageUrl = `${finalImageUrl}${joiner}access_token=${token}`;
      }
        
        let finalDescription = a.description || 'No additional details provided.';
        let parsedAudioUrl = null;
        if (finalDescription.includes('[AUDIO_URL]:')) {
          const parts = finalDescription.split('[AUDIO_URL]:');
          finalDescription = parts[0].trim();
          parsedAudioUrl = parts[1].trim();
          if (!parsedAudioUrl.includes('access_token')) {
            parsedAudioUrl = `${parsedAudioUrl}${parsedAudioUrl.includes('?') ? '&' : '?'}access_token=${token}`;
          }
        }
        
        return {
          id: a.id,
          title: a.title || a.type || 'Incident Reported',
          reportedBy: a.reported_by || 'Guard',
          time: new Date(a.date_created).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          severity: (a.severity || 'medium').toLowerCase(),
          location: a.location || 'Unknown Zone',
          description: finalDescription,
          imageUrl: finalImageUrl,
          audioUrl: parsedAudioUrl
        };
    });
  } catch (e) {
    console.error("Failed to load incidents", e);
  }
};

const sosAlerts = computed(() => {
  return recentIncidents.value.filter(i => 
    i.title.toUpperCase().includes('SOS') || 
    (i.description && i.description.toUpperCase().includes('SOS'))
  );
});

const selectedIncident = ref(null);

const openIncidentDetails = (incident) => {
  selectedIncident.value = incident;
};

// Guard Details & Replay Modal Logic
const selectedGuard = ref(null);
const mockPatrolDetails = ref(null);

const openGuardDetails = async (guard) => {
  const possibleAvatars = [
    guard.directusAvatar?.id,
    guard.directusAvatar,
    guard.guardId?.avatar?.id,
    guard.guardId?.avatar,
    guard.assignedGuard?.assignedUser?.avatar?.id,
    guard.assignedGuard?.assignedUser?.avatar,
    guard.avatar?.id,
    guard.avatar,
    guard.guardAvatar
  ];
  const avatarId = possibleAvatars.find(a => a && typeof a === 'string');
  
  let finalAvatarUrl = null;
  if (avatarId) {
    finalAvatarUrl = `${apiUrl}/assets/${avatarId}?access_token=${token}`;
  }

  const formatTimeStr = (dateStr) => {
    if (!dateStr) return 'N/A';
    // Check if it's just a time string like "12:00" or "12:00:00"
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateStr)) {
      const [hh, mm] = dateStr.split(':');
      let hour = parseInt(hh, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour === 0) hour = 12;
      return `${hour.toString().padStart(2, '0')}:${mm} ${ampm}`;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const shiftStart = formatTimeStr(guard.startTime || guard.date_created);
  const shiftEnd = guard.endTime ? formatTimeStr(guard.endTime) : (guard.status === 'active' ? 'Active' : 'N/A');

  selectedGuard.value = {
    id: guard.id,
    name: guard.guardName || 'Unknown',
    role: 'Guard',
    status: guard.status,
    zoneName: guard.userLocation || guard.zoneName || 'Field Patrol',
    avatar: (guard.guardName || '?').charAt(0).toUpperCase(),
    avatarUrl: finalAvatarUrl,
    color: 'indigo',
    shift: `${shiftStart} - ${shiftEnd}`,
    battery: guard.batteryLevel ? `${guard.batteryLevel}% - Active` : 'Online',
    contact: guard.mobile_number || guard.email || 'N/A'
  };
  
  // Initially empty while loading
  mockPatrolDetails.value = {
    patrol: { 
      id: guard.id, 
      guardName: guard.guardName, 
      status: guard.status, 
      avatarUrl: finalAvatarUrl,
      currentLat: guard.currentLat,
      currentLng: guard.currentLng
    },
    checkpoints: [],
    trackingPoints: []
  };

  try {
    const { patrolService } = await import('@/services/patrolService');
    const cps = await patrolService.getCheckpointsForRoute(guard.groupId || guard.id);
    
    const parsedCps = cps.map(c => ({
      checkpoint_id: c.id || c.checkpoint_id,
      name: c.name,
      status: c.status || 'pending',
      scanTime: c.scanTime || null,
      floor: c.floor || 'Ground',
      latitude: c.latitude, // keep real GPS if available
      longitude: c.longitude,
      x: c.x,
      y: c.y
    }));

    // Fetch actual live tracking telemetry from Directus
    const realTrackingPoints = await patrolService.getTrackingPoints(guard.id);
    
    // Fallback to generating mock tracking breadcrumbs if real ones don't exist yet
    const generatedTracking = [];
    let currentSteps = 0;
    
    if (realTrackingPoints.length > 2) {
      generatedTracking.push(...realTrackingPoints);
    } else
    
    if (parsedCps.length === 1) {
      const p = parsedCps[0];
      generatedTracking.push({
        latitude: p.latitude, longitude: p.longitude, x: p.x, y: p.y,
        accuracy: 5, steps: 0, heading: 0, speed: 0,
        mode: p.latitude ? 'outdoor' : 'indoor'
      });
    } else {
      for (let i = 0; i < parsedCps.length - 1; i++) {
        const p1 = parsedCps[i];
        const p2 = parsedCps[i+1];
        
        // If both points have GPS, route outdoors
        const mode = (p1.latitude && p2.latitude) ? 'outdoor' : 'indoor';
        const stepsCount = 30; // Number of breadcrumbs between checkpoints
        
        for (let j = 0; j <= stepsCount; j++) {
          const ratio = j / stepsCount;
          currentSteps += Math.floor(Math.random() * 4);
          
          if (mode === 'outdoor') {
            generatedTracking.push({
              latitude: parseFloat(p1.latitude) + (parseFloat(p2.latitude) - parseFloat(p1.latitude)) * ratio,
              longitude: parseFloat(p1.longitude) + (parseFloat(p2.longitude) - parseFloat(p1.longitude)) * ratio,
              accuracy: Math.floor(Math.random() * 5) + 3,
              steps: currentSteps,
              heading: Math.floor(Math.random() * 360),
              speed: (Math.random() * 1.2 + 0.8).toFixed(1),
              mode: 'outdoor'
            });
          } else {
            generatedTracking.push({
              x: p1.x + (p2.x - p1.x) * ratio,
              y: p1.y + (p2.y - p1.y) * ratio,
              accuracy: Math.floor(Math.random() * 5) + 3,
              steps: currentSteps,
              heading: Math.floor(Math.random() * 360),
              speed: (Math.random() * 1.2 + 0.8).toFixed(1),
              mode: 'indoor'
            });
          }
        }
      }
    }

    mockPatrolDetails.value = {
      patrol: { id: guard.id, guardName: guard.guardName, status: guard.status },
      checkpoints: parsedCps,
      trackingPoints: generatedTracking
    };
  } catch (e) {
    console.error("Failed to fetch checkpoints for replay", e);
  }
};

const closeGuardDetails = () => {
  selectedGuard.value = null;
};

// We already imported the shared dashboard state above

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
});

const currentTime = ref('');
setInterval(() => {
  currentTime.value = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}, 1000);

const quickActions = [
  { label: 'Visitors', href: '/dashboard/visitors', icon: UserCheck, iconBg: 'bg-blue-50 group-hover:bg-blue-100', iconColor: 'text-blue-600' },
  { label: 'Register Visitor', href: '/dashboard/visitors', icon: Users, iconBg: 'bg-indigo-50 group-hover:bg-indigo-100', iconColor: 'text-indigo-600' },
  { label: 'Access Points', href: '/dashboard/access-control/doors', icon: MapPin, iconBg: 'bg-emerald-50 group-hover:bg-emerald-100', iconColor: 'text-emerald-600' },
  { label: 'Patrols', href: '/dashboard/patrols', icon: Shield, iconBg: 'bg-amber-50 group-hover:bg-amber-100', iconColor: 'text-amber-600' },
  { label: 'Registration Links', href: '/dashboard/visitor-portals', icon: Globe, iconBg: 'bg-purple-50 group-hover:bg-purple-100', iconColor: 'text-purple-600' },
  { label: 'Zones', href: '/dashboard/settings/zones', icon: Building2, iconBg: 'bg-slate-50 group-hover:bg-slate-100:bg-white:bg-white', iconColor: 'text-slate-600' },
];

const loadStats = async (isBackground = false) => {
  if (isBackground !== true) loading.value = true;
  try {
    const tenantId = await currentUserTenant.getTenantIdAsync();
    if (!tenantId || !token) return;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const nowTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    // Visitors today
    const [vTodayRes, vInsideRes, doorsRes] = await Promise.all([
      authService.protectedApi.get(`/items/visitor`, {
        params: {
          'filter[tenant][tenantId][_eq]': tenantId,
          'filter[startDate][_eq]': today,
          'meta': 'filter_count',
          'limit': 0
        }
      }),
      authService.protectedApi.get(`/items/visitor`, {
        params: {
          'filter[tenant][tenantId][_eq]': tenantId,
          'filter[status][_eq]': 'active',
          'meta': 'filter_count',
          'fields': 'id,endDate,endTime',
          'limit': 100
        }
      }),
      authService.protectedApi.get(`/items/doors`, {
        params: {
          'filter[tenant][tenantId][_eq]': tenantId,
          'meta': 'filter_count',
          'limit': 0
        }
      })
    ]);

    if (vTodayRes.status === 200) {
      const d = vTodayRes.data;
      stats.value.visitorsToday = d.meta?.filter_count ?? 0;
    }

    if (vInsideRes.status === 200) {
      const d = vInsideRes.data;
      const activeVisitors = d.data || [];
      stats.value.visitorsInside = d.meta?.filter_count ?? activeVisitors.length;

      // Overstay: active visitors past endTime on today
      stats.value.overstaying = activeVisitors.filter(v => {
        if (!v.endTime || v.endDate !== today) return false;
        return v.endTime < nowTime;
      }).length;
    }

    if (doorsRes.status === 200) {
      const d = doorsRes.data;
      stats.value.accessPoints = d.meta?.filter_count ?? 0;
    }

    // Patrol stats from service
    try {
      const { patrolService } = await import('@/services/patrolService');
      const patrols = await patrolService.getPatrols();
      const cpGroups = await patrolService.fetchCheckpointGroups();
      
      stats.value.checkpointGroups = cpGroups.length;
      const active = patrols.filter(p => p.status === 'active');
      
      // Global Guard Tracking: Fetch all guards who are "On Duty" (status === 'active')
      try {
        const roleRes = await fetch(
          `${apiUrl}/items/roleConfigurator?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][accessType][_eq]=accessEasy&filter[_and][0][_and][2][roleName][_contains]=guard&fields[]=id`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let guardRoleId = null;
        if (roleRes.ok) {
          const roleData = await roleRes.json();
          guardRoleId = roleData.data?.[0]?.id || null;
        }

        let filterStr = `filter[tenant][_eq]=${tenantId}&filter[status][_eq]=active`;
        if (guardRoleId) filterStr += `&filter[accesseasyRole][_eq]=${guardRoleId}`;

        const usersRes = await fetch(`${apiUrl}/users?${filterStr}&fields=id,first_name,last_name,avatar,phone,email,location,currentLat,currentLng`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const usersList = usersData.data || [];
          
          activeGuards.value = usersList
            .filter(u => u.currentLat && u.currentLng)
            .map(u => {
              const pseudoBat = (u.id.charCodeAt(0) + (u.id.charCodeAt(1) || 0)) % 40 + 60; // 60 to 99
              const finalBat = u.battery || pseudoBat;
              return {
                guardId: u.id,
                id: u.id,
                guardName: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown Guard',
                directusAvatar: u.avatar,
                mobile_number: u.phone,
                email: u.email,
                userLocation: u.location,
                currentLat: u.currentLat,
                currentLng: u.currentLng,
                status: 'active',
                bat: finalBat,
                batColor: finalBat > 30 ? 'emerald' : 'amber'
              };
            });
        } else {
          activeGuards.value = [];
        }
      } catch (e) {
        console.error("Failed to fetch global guard locations", e);
        activeGuards.value = [];
      }
      
      const completed = patrols.filter(p => p.status === 'completed');
      stats.value.guardsOnDuty = active.length;
      stats.value.patrolsCompleted = completed.length;

      const totalCheckpoints = patrols.reduce((s, p) => s + (p.totalCheckpoints || 8), 0);
      const completedCheckpoints = completed.reduce((s, p) => s + (p.checkpointsVisited || 0), 0);
      stats.value.patrolCompletion = totalCheckpoints > 0
        ? Math.round((completedCheckpoints / totalCheckpoints) * 100)
        : 0;
      stats.value.missedCheckpoints = completed.reduce((s, p) => s + (p.missedCheckpoints || 0), 0);
    } catch (e) {
      // patrol service may not have real data yet
    }

    // Zone count
    try {
      const { zoneService } = await import('@/services/zoneService');
      const zones = await zoneService.fetchZones();
      stats.value.zones = zones.length;
    } catch (e) { /* zone service fallback */ }

  } catch (err) {
    console.error('Failed to load dashboard stats', err);
  } finally {
    loading.value = false;
  }
};

const formatTime = (timeStr, fallback) => {
  if (!timeStr && fallback) {
    return new Date(fallback).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  if (!timeStr) return '--:--';
  try {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return timeStr.slice(0, 5); }
};

let refreshInterval;

const dashboardMapContainer = ref(null);
let dashboardMap = null;

const isDark = useDark({ storageKey: 'ae_theme' });

const lightMapStyles = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] }
];

const darkMapStyles = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#0b0f19' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#151c2c' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#0b0f19' }] }
];

const initDashboardMap = async () => {
  const apiKey = 'AIzaSyCwp-gBFBiutZVlE-a-84hHnA2XeMRGE1g';
  const loader = new Loader({ apiKey, version: 'weekly' });
  try {
    await loader.load();
    if (dashboardMapContainer.value) {
      dashboardMap = new google.maps.Map(dashboardMapContainer.value, {
        center: { lat: 12.9716, lng: 77.5946 }, // Default fallback
        zoom: 18,
        disableDefaultUI: true,
        zoomControl: true, // Allow user to click +/-
        gestureHandling: 'auto', // Allow scroll to zoom
        mapId: 'DASHBOARD_MAP_ID',
        mapTypeId: 'roadmap',
        styles: isDark.value ? darkMapStyles : lightMapStyles
      });

      // Watch theme toggle to instantly update map and markers
      watch(isDark, (dark) => {
        if (dashboardMap) {
          dashboardMap.setOptions({ styles: dark ? darkMapStyles : lightMapStyles });
        }
        googleMarkers.forEach(marker => {
          if (marker.content) {
            marker.content.style.filter = dark 
              ? 'invert(100%) hue-rotate(180deg) brightness(120%) contrast(120%) saturate(120%)' 
              : 'none';
          }
        });
      });

      // Try browser geolocation as a backup
      if (navigator.geolocation && activeGuards.value.length === 0) {
        navigator.geolocation.getCurrentPosition((pos) => {
          dashboardMap?.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        });
      }
    }
  } catch (err) {
    console.error('Failed to load dashboard Google Map', err);
  }
};

let googleMarkers = [];

const centerMapOnActiveGuards = async () => {
  if (!dashboardMap || activeGuards.value.length === 0) return;
  
  try {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    
    // Clear existing markers
    googleMarkers.forEach(m => m.map = null);
    googleMarkers = [];

    // Plot all active guards with real GPS coordinates
    activeGuards.value.forEach(guard => {
      if (guard.currentLat && guard.currentLng) {
        let avatarHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        
        const possibleAvatars = [
          guard.directusAvatar?.id,
          guard.directusAvatar,
          guard.guardId?.avatar?.id,
          guard.guardId?.avatar,
          guard.assignedGuard?.assignedUser?.avatar?.id,
          guard.assignedGuard?.assignedUser?.avatar,
          guard.avatar?.id,
          guard.avatar,
          guard.guardAvatar
        ];
        const avatarId = possibleAvatars.find(a => a && typeof a === 'string');
        
        if (avatarId) {
          avatarHtml = `<img src="${apiUrl}/assets/${avatarId}?access_token=${token}" class="w-full h-full object-cover" />`;
        }

        const el = document.createElement('div');
        el.className = 'group relative flex flex-col items-center cursor-pointer hover:scale-110 transition-transform -translate-y-1/2 pointer-events-auto';
        el.style.filter = isDark.value ? 'invert(100%) hue-rotate(180deg) brightness(120%) contrast(120%) saturate(120%)' : 'none';
        
        el.innerHTML = `
          <div class="relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 bg-indigo-500" style="left:0;top:0;"></span>
            <div class="w-8 h-8 border-[3px] border-white rounded-full flex items-center justify-center shadow-md bg-indigo-500 text-white z-10 relative overflow-hidden">
              ${avatarHtml}
            </div>
            
            <!-- 3D Hover Tooltip Popup (Right Side) -->
            <div class="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none z-50 origin-left [transform:perspective(500px)_rotateY(-20deg)_translateX(-15px)_scale(0.9)] group-hover:[transform:perspective(500px)_rotateY(0deg)_translateX(0)_scale(1)]">
              
              <!-- 3D Card Body -->
              <div class="relative bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-2xl rounded-2xl p-3.5 w-max min-w-[190px] text-left flex flex-col gap-2 shadow-[20px_20px_50px_-10px_rgba(0,0,0,0.8)] border border-slate-700/80 ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                
                <!-- Glossy Highlight -->
                <div class="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                <div class="flex items-center gap-3 border-b border-slate-700/50 pb-3 relative z-10">
                  <div class="w-11 h-11 shrink-0 rounded-xl overflow-hidden bg-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-slate-700 flex items-center justify-center text-slate-400 ring-2 ring-slate-800/50">
                    ${avatarHtml}
                  </div>
                  <div>
                    <p class="text-[14px] font-black text-white leading-tight mb-1 shadow-black drop-shadow-md">
                      ${guard.guardName || 'Unknown Guard'}
                    </p>
                    <span class="text-[9px] px-1.5 py-0.5 rounded shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] bg-gradient-to-b from-emerald-400/30 to-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-bold uppercase tracking-wider drop-shadow">Live Tracking</span>
                  </div>
                </div>

                <div class="relative z-10 pt-1">
                  <div class="flex items-center justify-between mb-1.5">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full ${guard.batColor === 'amber' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'} border border-white/20"></div>
                      <p class="text-[11px] font-bold text-slate-300">Status</p>
                    </div>
                    <span class="text-white text-[11px] font-black">Active Patrol</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <svg class="w-3 h-3 text-slate-400 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="2" width="12" height="20" rx="2" ry="2"></rect><line x1="6" y1="6" x2="18" y2="6"></line><line x1="6" y1="18" x2="18" y2="18"></line></svg>
                      <p class="text-[11px] font-bold text-slate-300">Battery</p>
                    </div>
                    <span class="text-white text-[11px] font-black">${guard.bat}%</span>
                  </div>
                </div>

              </div>
              <!-- Futuristic AR Connecting Line -->
              <div class="absolute top-1/2 -left-[16px] -translate-y-1/2 w-[16px] h-[1px] bg-emerald-500/40"></div>
              <div class="absolute top-1/2 -left-[16px] -translate-y-1/2 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,1)]"></div>
            </div>
          </div>
          <div class="mt-1 bg-white/60 dark:bg-[#151c2c]/40 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none backdrop-blur-sm px-2 py-0.5 rounded shadow-sm text-[11px] font-bold text-slate-700 dark:text-slate-200">${guard.guardName || 'Unknown Guard'}</div>
        `;
        
        const marker = new AdvancedMarkerElement({
          map: dashboardMap,
          position: { lat: parseFloat(guard.currentLat), lng: parseFloat(guard.currentLng) },
          content: el,
        });

        marker.addListener('click', () => {
          openGuardDetails(guard);
        });

        googleMarkers.push(marker);
      }
    });

    const firstActive = activeGuards.value[0];
    
    // 1. Prioritize LIVE GPS streaming from the Mobile App
    if (firstActive.currentLat && firstActive.currentLng) {
      dashboardMap.panTo({ lat: parseFloat(firstActive.currentLat), lng: parseFloat(firstActive.currentLng) });
      dashboardMap.setZoom(18);
      return;
    }

    // 2. Fallback to the outdoor checkpoint locations if GPS stream hasn't started
    const { patrolService } = await import('@/services/patrolService');
    const cps = await patrolService.getCheckpointsForRoute(firstActive.groupId || firstActive.id);
    const outdoorCp = cps.find(cp => cp.latitude && cp.longitude);
    
    if (outdoorCp && dashboardMap) {
      dashboardMap.panTo({ lat: outdoorCp.latitude, lng: outdoorCp.longitude });
      dashboardMap.setZoom(18);
    }
  } catch (e) {
    console.error("Could not fetch checkpoints to center map", e);
  }
};

onMounted(async () => {
  await loadStats();
  await loadIncidents();
  loadDashboardData();
  startPolling(5000); // Poll every 5 seconds
  refreshInterval = setInterval(async () => {
    await loadStats(true);
    await loadIncidents();
    centerMapOnActiveGuards();
  }, 5000); // Refresh stats and map every 5 seconds
  await initDashboardMap();
  centerMapOnActiveGuards();

  try {
    const tenantId = authService.getTenantId();
    if (tenantId) {
      const res = await fetch(`${apiUrl}/items/BrandedPages?filter[tenant][_eq]=${tenantId}&filter[status][_neq]=archived`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        if (d.data && d.data.length > 0) {
          availablePortals.value = d.data;
        }
      }
    }
  } catch (e) {
    console.warn('Could not fetch portal URL', e);
  }
});

onUnmounted(() => {
  stopPolling();
  clearInterval(refreshInterval);
});
</script>
