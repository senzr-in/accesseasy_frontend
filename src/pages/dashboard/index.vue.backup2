<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="w-full h-full flex flex-col gap-4 animate-in pb-4">

      <!-- Page Header -->
      <div class="flex items-center justify-between shrink-0 pt-2">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Security Overview <span class="text-slate-400 font-medium text-lg">/ {{ currentZoneName }}</span></h1>
          <p class="text-sm text-slate-500 mt-0.5">{{ formattedDate }}</p>
        </div>
        <button
          @click="loadStats"
          class="btn-secondary text-xs"
          :class="{ 'opacity-50 cursor-not-allowed': loading }"
          :disabled="loading"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          Refresh
        </button>
      </div>
      
      <!-- SOS EMERGENCY BANNER -->
      <div v-if="sosAlerts.length > 0" class="shrink-0 bg-red-600 text-white p-4 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.5)] flex items-center justify-between mb-2 animate-pulse border-2 border-red-400">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle class="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 class="text-lg font-black tracking-widest">EMERGENCY SOS TRIGGERED</h2>
            <p class="text-sm font-medium mt-0.5 text-red-100">
              Guard <span class="font-bold text-white">{{ sosAlerts[0].reportedBy }}</span> triggered an SOS at <span class="font-bold text-white">{{ sosAlerts[0].time }}</span> in <span class="font-bold text-white">{{ sosAlerts[0].location }}</span>.
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button @click="openIncidentDetails(sosAlerts[0])" class="bg-white text-red-700 hover:bg-red-50 font-bold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm">
            VIEW DETAILS
          </button>
        </div>
      </div>

      <!-- TOP ROW: Site Structure & Quick Actions -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 shrink-0">
        
        <!-- Site Structure Strip -->
        <div class="xl:col-span-2 rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden flex flex-col">
          <div class="flex items-center gap-2 px-4 py-2 border-b border-slate-200 bg-white shrink-0">
            <Layers class="w-3.5 h-3.5 text-slate-400" />
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Site Structure</span>
            <span class="ml-auto text-[10px] text-slate-400">Zones contain Access Points & Checkpoints</span>
          </div>
        <div class="grid grid-cols-3 divide-x divide-slate-200">

          <!-- Zones -->
          <div
            class="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white transition-colors group"
            @click="router.push('/dashboard/settings/zones')"
          >
            <div class="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0">
              <Building2 class="w-5 h-5 text-slate-600" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Zones</span>
                <span class="text-[9px] font-semibold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">Setup</span>
              </div>
              <p class="text-2xl font-bold text-slate-900">
                <span v-if="loading" class="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded" />
                <span v-else>{{ stats.zones }}</span>
              </p>
              <p class="text-[10px] text-slate-400 mt-0.5 leading-tight">Physical areas grouping access points & checkpoints</p>
            </div>
          </div>

          <!-- Access Points -->
          <div
            class="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-emerald-50/30 transition-colors group"
            @click="router.push('/dashboard/access-control/doors')"
          >
            <div class="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors shrink-0">
              <QrCode class="w-5 h-5 text-emerald-600" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-[10px] font-black uppercase tracking-widest text-emerald-700">Access Points</span>
                <span class="text-[9px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Visitors</span>
              </div>
              <p class="text-2xl font-bold text-slate-900">
                <span v-if="loading" class="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded" />
                <span v-else>{{ stats.accessPoints }}</span>
              </p>
              <p class="text-[10px] text-slate-400 mt-0.5 leading-tight">Entry/exit gates — visitors scan QR to check in</p>
            </div>
          </div>

          <!-- Checkpoints -->
          <div
            class="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-indigo-50/30 transition-colors group"
            @click="router.push({ path: '/dashboard/patrols', query: { action: 'configurator' } })"
          >
            <div class="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors shrink-0">
              <MapPin class="w-5 h-5 text-indigo-600" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-[10px] font-black uppercase tracking-widest text-indigo-700">Checkpoints</span>
                <span class="text-[9px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">Patrol</span>
              </div>
              <p class="text-2xl font-bold text-slate-900">
                <span v-if="loading" class="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded" />
                <span v-else>{{ stats.checkpointGroups }}</span>
              </p>
              <p class="text-[10px] text-slate-400 mt-0.5 leading-tight">Guard stops — security scans QR to confirm patrol</p>
            </div>
          </div>

        </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="xl:col-span-1 flex flex-col">
          <h2 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1 shrink-0">Quick Actions</h2>
          <div class="grid grid-cols-3 gap-2 flex-1">
            <button
              v-for="action in quickActions"
              :key="action.label"
              @click="router.push(action.href)"
              class="ae-card ae-card-hover flex flex-col items-center justify-center gap-1.5 p-2 cursor-pointer group h-full"
            >
              <div class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors" :class="action.iconBg">
                <component :is="action.icon" class="w-4 h-4 transition-colors" :class="action.iconColor" />
              </div>
              <span class="text-[10px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-center leading-tight">{{ action.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- MIDDLE ROW: KPI Grid -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">

        <!-- Visitors Today -->
        <div class="stat-card group cursor-pointer ae-card-hover py-3" @click="router.push('/dashboard/visitors')">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Today's Visitors</span>
            <div class="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
              <Users class="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p class="text-3xl font-bold text-slate-900">
            <span v-if="loading" class="inline-block w-10 h-8 bg-slate-200 animate-pulse rounded" />
            <span v-else>{{ stats.visitorsToday }}</span>
          </p>
          <p class="text-xs text-slate-400 mt-1">registered today</p>
        </div>

        <!-- Inside Now -->
        <div class="stat-card group cursor-pointer ae-card-hover py-3" @click="router.push('/dashboard/visitors')">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inside Now</span>
            <div class="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
              <UserCheck class="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p class="text-3xl font-bold text-emerald-600">
            <span v-if="loading" class="inline-block w-10 h-8 bg-slate-200 animate-pulse rounded" />
            <span v-else>{{ stats.visitorsInside }}</span>
          </p>
          <p class="text-xs text-slate-400 mt-1">checked in</p>
        </div>

        <!-- Patrols Running -->
        <div class="stat-card group cursor-pointer ae-card-hover py-3" @click="router.push('/dashboard/patrols')">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Patrols Running</span>
            <div class="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
              <Shield class="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <p class="text-3xl font-bold text-indigo-600">
            <span v-if="loading" class="inline-block w-10 h-8 bg-slate-200 animate-pulse rounded" />
            <span v-else>{{ stats.guardsOnDuty }}</span>
          </p>
          <p class="text-xs text-slate-400 mt-1">active now</p>
        </div>

        <!-- Patrol Completion -->
        <div class="stat-card group cursor-pointer ae-card-hover py-3" @click="router.push('/dashboard/patrols')">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Patrol Rate</span>
            <div class="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center">
              <Route class="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p class="text-3xl font-bold text-amber-600">
            <span v-if="loading" class="inline-block w-10 h-8 bg-slate-200 animate-pulse rounded" />
            <span v-else>{{ stats.patrolCompletion }}%</span>
          </p>
          <p class="text-xs text-slate-400 mt-1">completion today</p>
        </div>

        <!-- Overstaying -->
        <div
          class="stat-card group cursor-pointer ae-card-hover py-3 border-l-4"
          :class="stats.overstaying > 0 ? 'border-l-rose-500' : 'border-l-slate-200'"
          @click="router.push('/dashboard/visitors')"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Overstaying</span>
            <div class="w-6 h-6 rounded-md flex items-center justify-center" :class="stats.overstaying > 0 ? 'bg-rose-50' : 'bg-slate-50'">
              <AlertTriangle class="w-4 h-4" :class="stats.overstaying > 0 ? 'text-rose-600' : 'text-slate-400'" />
            </div>
          </div>
          <p class="text-3xl font-bold" :class="stats.overstaying > 0 ? 'text-rose-600' : 'text-slate-400'">
            <span v-if="loading" class="inline-block w-10 h-8 bg-slate-200 animate-pulse rounded" />
            <span v-else>{{ stats.overstaying }}</span>
          </p>
          <p class="text-xs text-slate-400 mt-1">past allowed time</p>
        </div>

      </div>

      <!-- BOTTOM ROW: Recent Logs, Incidents, and Patrol Status -->
      <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- Recent Access Logs -->
        <div class="ae-card overflow-hidden flex flex-col">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-semibold text-slate-900">Recent Access Events</h3>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <button @click="router.push('/dashboard/visitors')" class="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
              View all →
            </button>
          </div>
          <div class="divide-y divide-slate-50 flex-1 overflow-y-auto custom-scrollbar">
            <div v-if="recentLogs.length === 0" class="py-10 text-center text-sm text-slate-400">
              No recent access events
            </div>
            <div
              v-for="log in recentLogs.slice(0, 6)"
              :key="log.id"
              class="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
            >
              <!-- Avatar -->
              <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {{ (log.name || log.personName || '?').charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-900 truncate">{{ log.name || log.personName || 'Unknown' }}</p>
                <p class="text-xs text-slate-400 truncate">{{ log.deviceId?.name || 'Unknown door' }}</p>
              </div>
              <div class="text-right shrink-0">
                <span
                  class="badge text-[10px]"
                  :class="log.ValidLogs === true || log.ValidLogs === 1 ? 'badge-success' : 'badge-danger'"
                >
                  {{ log.ValidLogs === true || log.ValidLogs === 1 ? 'Authorized' : 'Denied' }}
                </span>
                <p class="text-[10px] text-slate-400 mt-0.5">{{ formatTime(log.timeStamp, log.date_created) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Incidents / Alerts -->
        <div class="ae-card overflow-hidden flex flex-col">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-rose-50/30 shrink-0">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-semibold text-rose-900">Critical Incidents</h3>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </div>
            <button @click="router.push('/dashboard/patrols')" class="text-xs font-medium text-rose-600 hover:text-rose-800 transition-colors">
              Manage →
            </button>
          </div>
          <div class="divide-y divide-slate-50 flex-1 overflow-y-auto custom-scrollbar">
            <div v-if="!recentIncidents || recentIncidents.length === 0" class="flex flex-col items-center justify-center py-12 text-center text-sm text-slate-400 bg-slate-50/20 h-full">
              <ShieldCheck class="w-8 h-8 text-emerald-400 mb-2" />
              <p class="font-semibold text-slate-600">All Clear</p>
              <p class="text-xs mt-0.5">No recent incidents reported</p>
            </div>
            <div
              v-else
              v-for="incident in recentIncidents"
              :key="incident.id"
              @click="openIncidentDetails(incident)"
              class="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div class="w-1 self-stretch rounded-full shrink-0" :class="incident.severity === 'high' ? 'bg-rose-500' : 'bg-amber-500'" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-slate-900 truncate group-hover:text-rose-600 transition-colors">{{ incident.title }}</p>
                <div class="flex justify-between items-center mt-1">
                  <span class="text-xs text-slate-500 truncate">{{ incident.reportedBy }}</span>
                  <span class="text-[10px] font-semibold text-slate-400">{{ incident.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Guard Tracking Map -->
        <div class="ae-card overflow-hidden flex flex-col group relative">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0 bg-slate-50/50">
            <div>
              <h3 class="text-sm font-semibold text-slate-900">Live Guard Tracking</h3>
              <p class="text-[10px] text-slate-400 mt-0.5">Real-time guard locations</p>
            </div>
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          
          <div class="flex-1 relative overflow-hidden group-hover:bg-slate-200/50 transition-colors min-h-[220px]">
            <!-- Real Google Map Background -->
            <div ref="dashboardMapContainer" class="absolute inset-0"></div>
            
            <!-- Dynamic Real Data Map Markers are now injected via AdvancedMarkerElement in JS -->

            <!-- Empty State if no real guards are active -->
            <div v-if="!activeGuards.length" class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
               <span class="text-xs font-semibold text-slate-400 bg-white/80 px-3 py-1 rounded-full shadow-sm">No guards available</span>
            </div>

            <!-- View Full Map Button -->
            <div class="absolute bottom-4 right-4 z-[100]">
              <button @click.stop="router.push('/dashboard/patrols')" class="bg-white/90 backdrop-blur border border-slate-200 text-indigo-700 hover:text-indigo-800 hover:bg-white px-4 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 transition-all hover:scale-105 pointer-events-auto">
                <MapPin class="w-3.5 h-3.5" /> View Full Map
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Incident Details Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="selectedIncident" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="selectedIncident = null"></div>
          
          <div class="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between" :class="selectedIncident.severity === 'high' ? 'bg-rose-50/50' : 'bg-amber-50/50'">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="selectedIncident.severity === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'">
                  <AlertTriangle class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900 leading-tight">{{ selectedIncident.title }}</h3>
                  <p class="text-xs font-semibold uppercase tracking-wider" :class="selectedIncident.severity === 'high' ? 'text-rose-600' : 'text-amber-600'">
                    {{ selectedIncident.severity === 'high' ? 'Critical Alert' : 'Warning' }}
                  </p>
                </div>
              </div>
              <button @click="selectedIncident = null" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-5">
              <div class="flex items-start gap-3">
                <MapPin class="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                  <p class="text-sm font-semibold text-slate-900">{{ selectedIncident.location || 'Unknown Zone' }}</p>
                </div>
              </div>
              
              <!-- Small Embedded Map -->
              <div v-if="selectedIncident.location && selectedIncident.location !== 'Unknown Zone'" class="w-full h-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameborder="0" 
                  style="border:0" 
                  :src="`https://maps.google.com/maps?q=${selectedIncident.location}&z=16&output=embed`" 
                  allowfullscreen>
                </iframe>
                <a :href="`https://www.google.com/maps?q=${selectedIncident.location}`" target="_blank" class="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors"></a>
              </div>

              <div class="flex items-start gap-3">
                <Clock class="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Time Reported</p>
                  <p class="text-sm font-semibold text-slate-900">{{ selectedIncident.time }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <UserCheck class="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Reported By</p>
                  <p class="text-sm font-semibold text-slate-900">{{ selectedIncident.reportedBy }}</p>
                </div>
              </div>

              <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Details & Context</p>
                <p class="text-sm text-slate-700 leading-relaxed">{{ selectedIncident.description || 'No additional details provided for this incident.' }}</p>
                
                <!-- Audio Evidence -->
                <div v-if="selectedIncident.title.includes('AUDIO')" class="mt-4 bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
                  <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Mic class="w-5 h-5 text-indigo-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-slate-900 truncate">Audio Message.mp3</p>
                    <audio 
                      :key="selectedIncident.id"
                      class="w-full h-8 mt-1.5 outline-none custom-audio-player" 
                      controls 
                      preload="auto"
                      :src="selectedIncident.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'">
                    </audio>
                  </div>
                </div>
                
                <!-- Incident Image -->
                <div v-if="selectedIncident.imageUrl" class="mt-4 rounded-lg overflow-hidden border border-slate-200 shadow-sm relative group cursor-pointer">
                  <img :src="selectedIncident.imageUrl" alt="Incident Evidence" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  <div class="absolute bottom-2 left-2 bg-slate-900/70 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Camera class="w-3 h-3" /> Evidence Photo
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button @click="selectedIncident = null" class="btn-ghost text-sm">Close</button>
              <button @click="router.push('/dashboard/patrols'); selectedIncident = null" class="btn-primary text-sm shadow-md">
                <Shield class="w-4 h-4" /> Manage Incident
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Guard Profile & Replay Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="selectedGuard" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeGuardDetails"></div>
          
          <div class="relative w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <!-- Header Background & Avatar -->
            <div class="h-20 bg-gradient-to-r from-slate-100 to-slate-200 relative shrink-0">
              <button @click="closeGuardDetails" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-white/50 hover:bg-white rounded-full transition-colors z-10">
                <X class="w-4 h-4" />
              </button>
              <div class="absolute -bottom-6 left-6">
                <div class="w-14 h-14 rounded-2xl border-4 border-white flex items-center justify-center text-xl font-black text-white shadow-sm overflow-hidden"
                  :class="`bg-${selectedGuard.color}-500`">
                  <img v-if="selectedGuard.avatarUrl" :src="selectedGuard.avatarUrl" class="w-full h-full object-cover" />
                  <template v-else>{{ selectedGuard.avatar }}</template>
                </div>
              </div>
            </div>

            <div class="px-6 pt-8 pb-4 flex items-start justify-between shrink-0">
              <!-- Name & Status -->
              <div>
                <h3 class="text-lg font-bold text-slate-900 leading-tight">{{ selectedGuard.name }}</h3>
                <p class="text-xs text-slate-500 font-medium">{{ selectedGuard.role }} • {{ selectedGuard.id }}</p>
              </div>
              
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <MapPin class="w-3.5 h-3.5 text-slate-400" />
                  <span class="text-xs font-semibold text-slate-700">{{ selectedGuard.zoneName || 'Unknown Zone' }}</span>
                </div>
                <span class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5"
                  :class="selectedGuard.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">
                  <span v-if="selectedGuard.status === 'active'" class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {{ selectedGuard.status }}
                </span>
              </div>
            </div>

            <!-- NEW GUARD DETAILS SECTION -->
            <div class="px-6 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
              <div class="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3 min-w-0">
                 <Clock class="w-5 h-5 text-indigo-500 shrink-0" />
                 <div class="min-w-0"><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Current Shift</p><p class="text-xs font-semibold text-slate-800 truncate" :title="selectedGuard.shift">{{ selectedGuard.shift }}</p></div>
              </div>
              <div class="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3 min-w-0">
                 <Battery class="w-5 h-5 text-emerald-500 shrink-0" />
                 <div class="min-w-0"><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Device Battery</p><p class="text-xs font-semibold text-slate-800 truncate" :title="selectedGuard.battery">{{ selectedGuard.battery }}</p></div>
              </div>
              <div class="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3 min-w-0">
                 <User class="w-5 h-5 text-blue-500 shrink-0" />
                 <div class="min-w-0"><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contact Details</p><p class="text-xs font-semibold text-slate-800 truncate" :title="selectedGuard.contact">{{ selectedGuard.contact }}</p></div>
              </div>
            </div>

            <!-- Patrol Replay Map Component -->
            <div class="flex-1 overflow-hidden px-6 pb-6 min-h-[500px] flex flex-col">
              <div class="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                <PatrolMapReplay v-if="mockPatrolDetails" :patrol-details="mockPatrolDetails" />
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Users, Shield, Route, AlertTriangle, RefreshCw, UserCheck,
  QrCode, Globe, ShieldCheck, MapPin, FileText, X, Clock, Camera,
  Layers, Building2, Battery, PlayCircle, Play, Pause, RefreshCcw, User, Mic
} from 'lucide-vue-next';
import PatrolMapReplay from '@/pages/guard/tabs/components/PatrolMapReplay.vue';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { useDashboardState } from '@/composables/useDashboardState';
import { useZoneFilter } from '@/composables/useZoneFilter';
import { Loader } from '@googlemaps/js-api-loader';

const router = useRouter();
const token = authService.getToken();
const apiUrl = import.meta.env.VITE_API_URL;

const { selectedZone, zones } = useZoneFilter();

const currentZoneName = computed(() => {
  if (selectedZone.value === 'all') return 'Global Workspace';
  const z = zones.value.find(z => z.id === selectedZone.value);
  return z ? z.zoneName : 'Global Workspace';
});

const loading = ref(false);
const activeGuards = ref([]);

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

// Use shared dashboard state for recent logs
const { recentLogs, startPolling, stopPolling, loadDashboardData } = useDashboardState();

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
});

const quickActions = [
  { label: 'Visitors', href: '/dashboard/visitors', icon: UserCheck, iconBg: 'bg-blue-50 group-hover:bg-blue-100', iconColor: 'text-blue-600' },
  { label: 'Register Visitor', href: '/dashboard/visitors', icon: Users, iconBg: 'bg-indigo-50 group-hover:bg-indigo-100', iconColor: 'text-indigo-600' },
  { label: 'Access Points', href: '/dashboard/access-control/doors', icon: MapPin, iconBg: 'bg-emerald-50 group-hover:bg-emerald-100', iconColor: 'text-emerald-600' },
  { label: 'Patrols', href: '/dashboard/patrols', icon: Shield, iconBg: 'bg-amber-50 group-hover:bg-amber-100', iconColor: 'text-amber-600' },
  { label: 'Registration Links', href: '/dashboard/visitor-portals', icon: Globe, iconBg: 'bg-purple-50 group-hover:bg-purple-100', iconColor: 'text-purple-600' },
  { label: 'Zones', href: '/dashboard/settings/zones', icon: Building2, iconBg: 'bg-slate-50 group-hover:bg-slate-100', iconColor: 'text-slate-600' },
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
      fetch(`${apiUrl}/items/visitor?filter[tenant][tenantId][_eq]=${tenantId}&filter[startDate][_eq]=${today}&meta=filter_count&limit=0`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${apiUrl}/items/visitor?filter[tenant][tenantId][_eq]=${tenantId}&filter[status][_eq]=active&meta=filter_count&fields=id,endDate,endTime&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${apiUrl}/items/doors?filter[tenant][tenantId][_eq]=${tenantId}&meta=filter_count&limit=0`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    if (vTodayRes.ok) {
      const d = await vTodayRes.json();
      stats.value.visitorsToday = d.meta?.filter_count ?? 0;
    }

    if (vInsideRes.ok) {
      const d = await vInsideRes.json();
      const activeVisitors = d.data || [];
      stats.value.visitorsInside = d.meta?.filter_count ?? activeVisitors.length;

      // Overstay: active visitors past endTime on today
      stats.value.overstaying = activeVisitors.filter(v => {
        if (!v.endTime || v.endDate !== today) return false;
        return v.endTime < nowTime;
      }).length;
    }

    if (doorsRes.ok) {
      const d = await doorsRes.json();
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
            .map(u => ({
              guardId: u.id,
              id: u.id,
              guardName: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown Guard',
              directusAvatar: u.avatar,
              mobile_number: u.phone,
              email: u.email,
              userLocation: u.location,
              currentLat: u.currentLat,
              currentLng: u.currentLng,
              status: 'active'
            }));
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
        styles: [
          { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] }
        ]
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
        el.className = 'relative flex flex-col items-center cursor-pointer hover:scale-110 transition-transform -translate-y-1/2 pointer-events-auto';
        el.innerHTML = `
          <div class="relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 bg-indigo-500" style="left:0;top:0;"></span>
            <div class="w-8 h-8 border-[3px] border-white rounded-full flex items-center justify-center shadow-md bg-indigo-500 text-white z-10 relative overflow-hidden">
              ${avatarHtml}
            </div>
          </div>
          <div class="mt-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm text-[9px] font-bold text-slate-700">${guard.guardName || 'Unknown Guard'}</div>
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
});

onUnmounted(() => {
  stopPolling();
  clearInterval(refreshInterval);
});
</script>
