<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Value Header -->
    <ValueHeader
      title="Guard Management"
      value-statement="Manage every security guard digitally."
      :benefits="['Force tracking', 'Duty assignment', 'Status overview', 'Access permissions']"
      value-badge="Better accountability with less manual supervision."
      action-text="Add Guard"
      :action-icon="UserPlus"
      theme-color="indigo"
      @action="openAddDialog"
    />

    <!-- Stats & Search Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Stats Cards -->
      <div class="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
        <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors duration-500" />
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 rounded-lg bg-slate-50 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-slate-400">
              <ShieldCheck class="w-4 h-4" />
            </div>
            <p class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Total Force
            </p>
          </div>
          <h3 class="text-3xl font-bold text-slate-900 dark:text-white">
            {{ items.length }}
          </h3>
        </div>
        <div class="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-500" />
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck class="w-4 h-4" />
            </div>
            <p class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Active Personnel
            </p>
          </div>
          <h3 class="text-3xl font-bold text-slate-900 dark:text-white">
            {{ items.filter(g => g.status === 'active').length }}
          </h3>
        </div>
      </div>

      <!-- Search -->
      <div class="col-span-1 flex items-end">
        <div class="relative w-full">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search guards by name or email..."
            class="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-10 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
          >
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-24"
    >
      <Loader2 class="w-8 h-8 animate-spin text-blue-500 mx-auto" />
    </div>

    <!-- Guard Cards Grid -->
    <div
      v-else-if="filteredItems.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="guard in filteredItems"
        :key="guard.id"
        :class="[
          'group relative flex flex-col rounded-[20px] p-5 border bg-zinc-900/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden',
          guard.status === 'active' ? 'border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-emerald-500/10' :
          guard.status === 'break' ? 'border-blue-500/30 hover:border-blue-500/60 hover:shadow-blue-500/10' :
          'border-zinc-700/50 hover:border-zinc-600 hover:shadow-zinc-500/5'
        ]"
      >
        <!-- Ambient glow background based on status -->
        <div
          :class="[
            'absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-32 blur-3xl opacity-20 pointer-events-none transition-colors duration-500',
            guard.status === 'active' ? 'bg-emerald-500' :
            guard.status === 'break' ? 'bg-blue-500' : 'bg-zinc-500'
          ]"
        />

        <!-- Status Dot (Top Right) -->
        <div class="absolute top-4 right-4 flex items-center justify-center">
          <div
            :class="[
              'w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]',
              guard.status === 'active' ? 'bg-emerald-400 shadow-emerald-400/50' :
              guard.status === 'break' ? 'bg-blue-400 shadow-blue-400/50' : 'bg-zinc-500'
            ]"
          />
        </div>

        <!-- Avatar & Face Biometric Frame -->
        <div class="relative z-10 flex flex-col items-center mt-1 mb-4">
          <div 
            class="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800/90 border-2 shadow-lg mb-3 flex items-center justify-center text-zinc-300 font-bold text-2xl group/avatar transition-all duration-300 hover:scale-105 cursor-pointer"
            :class="[
              guard.faceStatus === 'active' 
                ? 'border-emerald-500/60 shadow-emerald-500/20 ring-4 ring-emerald-500/10' 
                : guard.faceStatus === 'pending_update'
                ? 'border-amber-500/60 shadow-amber-500/20 ring-4 ring-amber-500/10'
                : 'border-zinc-700/60 shadow-zinc-900/50'
            ]"
            @click.stop="openBiometricModal(guard)"
          >
            <!-- Face Photo -->
            <img
              v-if="guard.facePhoto || guard.avatar"
              :src="guard.facePhoto || guard.avatar"
              :alt="fullName(guard)"
              class="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover/avatar:scale-110"
              loading="lazy"
              @error="() => { guard.facePhoto = null; guard.avatar = null; }"
            >
            <!-- Fallback Initials -->
            <div v-else class="flex flex-col items-center justify-center text-zinc-400">
              <span class="tracking-wider">{{ initials(guard) }}</span>
            </div>

            <!-- Biometric Verification Badge Overlay -->
            <div
              v-if="guard.faceStatus === 'active'"
              class="absolute bottom-1 right-1 p-1 rounded-full bg-emerald-500 text-white border-2 border-zinc-900 shadow-md flex items-center justify-center"
              title="Verified Face ID Enrolled"
            >
              <ScanFace class="w-3 h-3" />
            </div>
            <div
              v-else-if="guard.faceStatus === 'pending_update'"
              class="absolute bottom-1 right-1 p-1 rounded-full bg-amber-500 text-white border-2 border-zinc-900 shadow-md flex items-center justify-center"
              title="Re-Scan Required"
            >
              <RotateCw class="w-3 h-3" />
            </div>
          </div>

          <h3 class="text-[16px] font-bold text-white tracking-wide text-center">
            {{ fullName(guard) }}
          </h3>
          <p class="text-[11px] text-zinc-400 mt-0.5 font-mono">
            Employee ID {{ guard.employeeId || guard.id.toString().padStart(2, '0') }}
          </p>
        </div>

        <!-- Details List -->
        <div class="relative z-10 space-y-2.5 flex-1 w-full px-1">
          <!-- Status Row -->
          <div class="flex items-center justify-between text-xs">
            <span class="text-zinc-400">Status</span>
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                  guard.status === 'active' ? 'bg-emerald-500 text-white' :
                  guard.status === 'break' ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300'
                ]"
              >
                {{ guard.status === 'active' ? 'ON DUTY' : guard.status === 'break' ? 'BREAK' : 'OFF DUTY' }}
              </span>
              <span class="w-6 h-5 flex items-center justify-center rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-300">
                {{ guard.id.toString().padStart(2, '0').slice(-2) }}
              </span>
            </div>
          </div>

          <!-- Assigned Zone Row -->
          <div class="flex items-center justify-between text-xs">
            <span class="text-zinc-400">Assigned Zone</span>
            <div
              class="flex items-center gap-1.5 text-zinc-300 font-medium truncate max-w-[120px]"
              :title="guard.assigned_zone_name || 'Unassigned'"
            >
              <span class="truncate">{{ guard.assigned_zone_name || 'Unassigned' }}</span>
              <MapPin class="w-3 h-3 text-zinc-500 shrink-0" />
            </div>
          </div>

          <!-- Biometric Face ID Status Row -->
          <div class="flex items-center justify-between text-xs pt-1.5 border-t border-zinc-800/80">
            <span class="text-zinc-400 flex items-center gap-1">
              <ScanFace class="w-3.5 h-3.5 text-indigo-400" />
              Face ID
            </span>
            <button
              class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer"
              :class="[
                guard.faceStatus === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' :
                guard.faceStatus === 'pending_update' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20' :
                'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
              ]"
              @click.stop="openBiometricModal(guard)"
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="guard.faceStatus === 'active' ? 'bg-emerald-400' : guard.faceStatus === 'pending_update' ? 'bg-amber-400' : 'bg-zinc-500'"
              />
              <span>{{ guard.faceStatus === 'active' ? 'Enrolled' : guard.faceStatus === 'pending_update' ? 'Re-Scan Needed' : 'Not Registered' }}</span>
            </button>
          </div>
        </div>

        <!-- Actions Row -->
        <div class="relative z-30 mt-5 grid grid-cols-2 gap-3">
          <button 
            class="flex items-center justify-center gap-2 h-9 rounded-lg border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors group/btn"
            @click.stop.prevent="openMessageModal(guard)"
          >
            <MessageSquare class="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-white" />
            Message
          </button>
          <button class="flex items-center justify-center gap-2 h-9 rounded-lg border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors group/btn">
            <Phone class="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-white" />
            Call
          </button>
        </div>
        
        <!-- Overlay Admin Actions -->
        <div class="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20 pointer-events-none group-hover:pointer-events-auto">
          <button
            title="Biometric Face ID Profile"
            class="h-10 w-10 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors border border-indigo-500/30"
            @click.stop="openBiometricModal(guard)"
          >
            <ScanFace class="w-4 h-4" />
          </button>
          <button
            title="View Patrol Route"
            class="h-10 w-10 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-500/30"
            @click.stop="viewPatrolMap(guard)"
          >
            <Map class="w-4 h-4" />
          </button>
          <button
            title="Edit Guard"
            class="h-10 w-10 rounded-full flex items-center justify-center bg-zinc-800 text-white hover:bg-zinc-700 transition-colors border border-zinc-700"
            @click="editGuard(guard)"
          >
            <Settings class="w-4 h-4" />
          </button>
          <button
            title="Delete Guard"
            class="h-10 w-10 rounded-full flex items-center justify-center bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/30"
            @click="deleteGuard(guard)"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredItems.length === 0 && !loading"
      class="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-zinc-800/20"
    >
      <div class="h-16 w-16 bg-white dark:hover:bg-zinc-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-zinc-800 shadow-sm mb-4">
        <ShieldCheck class="h-8 w-8 text-slate-400" />
      </div>
      <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">
        No Guards Found
      </h3>
      <p class="text-[13px] font-medium text-slate-500 dark:text-slate-400 max-w-sm text-center mb-6">
        You do not have any guards registered in the system yet.
      </p>
      <button
        class="h-9 px-4 rounded-xl flex items-center justify-center bg-slate-900 dark:bg-white dark:bg-slate-900 text-white dark:text-slate-900 dark:text-slate-100 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md"
        @click="openAddDialog"
      >
        <UserPlus class="w-3.5 h-3.5 mr-2" /> Add Guard
      </button>
    </div>

    <!-- Add/Edit Dialog -->
    <div
      v-if="showDialog"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 p-4 w-full"
    >
      <div class="relative w-full max-w-lg flex flex-col bg-white dark:bg-zinc-950 rounded-[24px] shadow-2xl shadow-indigo-500/10 border border-white/20 dark:border-zinc-800/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
        <!-- Premium Glass Header -->
        <div class="relative px-8 py-6 flex justify-between items-start bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-800/80 z-10 shrink-0">
          <div class="absolute inset-0 bg-white dark:bg-slate-900/40 dark:bg-zinc-950/40 backdrop-blur-xl" />
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-1">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
                <ShieldCheck class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {{ editingGuard ? 'Edit Guard' : 'Create Guard' }}
              </h2>
            </div>
            <p class="text-[13px] font-medium text-slate-500 dark:text-zinc-400 ml-[52px]">
              {{ editingGuard ? 'Update the security personnel details.' : 'Register a new guard to the system.' }}
            </p>
          </div>
          <button
            class="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all duration-200"
            @click="showDialog = false"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Dialog Body -->
        <div class="px-8 py-6 space-y-5 overflow-y-auto max-h-[60vh] bg-zinc-50/50 dark:bg-zinc-950/80 custom-scrollbar">
          <div
            v-if="dialogError"
            class="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold uppercase tracking-widest"
          >
            <AlertTriangle class="w-4 h-4 shrink-0" />
            {{ dialogError }}
          </div>

          <form
            id="guard-form"
            class="space-y-6"
            @submit.prevent="handleSubmit"
          >
            <!-- Employee ID -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Employee ID</label>
              <input
                v-model="form.employee_id"
                type="text"
                placeholder="e.g. GRD-001"
                class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500"
              >
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">First Name <span class="text-red-500">*</span></label>
                <input
                  v-model="form.first_name"
                  type="text"
                  placeholder="John"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500"
                >
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Last Name</label>
                <input
                  v-model="form.last_name"
                  type="text"
                  placeholder="Doe"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500"
                >
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Email <span class="text-red-500">*</span></label>
              <input
                v-model="form.email"
                type="email"
                placeholder="guard@example.com"
                class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500"
              >
            </div>

            <!-- Phone Number with Country Code Dropdown -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Mobile Number *</label>
              <div class="flex gap-2">
                <select
                  v-model="form.country_code"
                  class="w-28 h-9 px-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm shrink-0"
                >
                  <option v-for="c in countryCodes" :key="c.code" :value="c.code">
                    {{ c.flag }} {{ c.code }}
                  </option>
                </select>
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="10-digit number"
                  class="flex-1 h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500"
                >
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Guard Role Selector -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Guard Role *</label>
                <select
                  v-model="form.role_id"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500"
                >
                  <option v-for="r in availableRoles" :key="r.id" :value="r.id">
                    {{ r.roleName }}
                  </option>
                </select>
              </div>

              <!-- Assigned Door / Zone -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Assigned Zone</label>
                <select
                  v-model="form.assigned_door"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500"
                >
                  <option :value="null">
                    Unassigned
                  </option>
                  <option
                    v-for="door in doors"
                    :key="door.id"
                    :value="door.id"
                  >
                    {{ door.doorName || 'Unnamed Zone' }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Share Login Link via Email -->
            <div class="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  v-model="form.send_login_link"
                  type="checkbox"
                  class="w-4 h-4 text-indigo-600 rounded border-zinc-300 dark:border-zinc-700 focus:ring-indigo-500 cursor-pointer"
                >
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
                  ✉️ Send Login Credentials & Access Link via Email
                </span>
              </label>
            </div>

            <!-- Mobile App Permissions Section -->
            <div class="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <h4 class="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">
                Mobile App Features
              </h4>
              
              <div class="space-y-4">
                <!-- Incident Reporting Toggle -->
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">
                      Incident Reporting
                    </p>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">
                      Allow guard to submit incident reports with photos.
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="form.enable_incidents"
                      type="checkbox"
                      class="sr-only peer"
                    >
                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600" />
                  </label>
                </div>

                <!-- Patrol Route Toggle -->
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">
                      Patrol Routes
                    </p>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">
                      Enable checkpoint scanning and patrol logging.
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="form.enable_patrols"
                      type="checkbox"
                      class="sr-only peer"
                    >
                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500" />
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Dialog Footer -->
        <div class="relative px-8 py-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex justify-end gap-3 z-10 shrink-0">
          <button
            type="button"
            class="px-6 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[13px] font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 transition-all duration-200 shadow-sm"
            @click="showDialog = false"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="guard-form"
            :disabled="dialogLoading"
            class="group relative px-6 h-10 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white flex items-center gap-2 text-[13px] font-bold shadow-[0px_1px_2px_0px_rgba(255,255,255,0.5)_inset,0px_4px_6px_-1px_rgba(79,70,229,0.3)] disabled:opacity-50 transition-all active:scale-95 duration-200"
          >
            <Loader2
              v-if="dialogLoading"
              class="w-4 h-4 animate-spin"
            />
            <span class="relative z-10">{{ editingGuard ? 'Update Guard' : 'Create Personnel' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Message Guard Modal -->
    <GuardMessageModal 
      v-model:show="showMessageModal"
      :guard="selectedGuardForMessage"
      @sent="handleMessageSent"
    />

    <!-- Patrol Route Map Modal -->
    <div
      v-if="showPatrolMap"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 p-4 w-full"
      @click.self="showPatrolMap = false"
    >
      <div class="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-[24px] shadow-2xl shadow-emerald-500/10 border border-white/20 dark:border-zinc-800/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
        <!-- Ambient Glow Background -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div class="relative z-10 p-8">
          <!-- Header -->
          <div class="flex items-start justify-between mb-8">
            <div>
              <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Active Patrol Route
              </h2>
              <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Guard: {{ fullName(activeGuardForMap) }} • Shift: Ongoing
              </p>
            </div>
            <div class="flex items-center gap-3">
              <div class="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2 shadow-sm">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">In Progress</span>
              </div>
              <button
                class="text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white transition-colors"
                @click="showPatrolMap = false"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Timeline Container -->
          <div class="relative pl-6 space-y-4">
            <div class="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
              <Clock class="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
              <p class="font-medium">No live checkpoints scanned yet for this active route.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Biometric Face ID Profile Modal -->
    <div
      v-if="showBiometricModal && selectedGuardForBiometric"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-4 w-full"
      @click.self="showBiometricModal = false"
    >
      <div class="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-[28px] shadow-2xl shadow-indigo-500/10 border border-slate-200 dark:border-zinc-800/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
        <!-- Header -->
        <div class="relative px-6 pt-6 pb-4 flex justify-between items-start border-b border-slate-100 dark:border-zinc-800/80">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
              <ScanFace class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Biometric Face ID Profile
              </h3>
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                Guard: {{ fullName(selectedGuardForBiometric) }}
              </p>
            </div>
          </div>
          <button
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            @click="showBiometricModal = false"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-5">
          <!-- Face ID Photo Frame -->
          <div class="flex flex-col items-center">
            <div class="relative w-36 h-36 rounded-2xl overflow-hidden bg-zinc-900 border-2 border-indigo-500/30 shadow-lg flex items-center justify-center group">
              <img
                v-if="selectedGuardForBiometric.facePhoto"
                :src="selectedGuardForBiometric.facePhoto"
                :alt="fullName(selectedGuardForBiometric)"
                class="w-full h-full object-cover"
              >
              <div v-else class="flex flex-col items-center justify-center text-zinc-500 gap-1.5 p-4 text-center">
                <Camera class="w-8 h-8 text-zinc-600" />
                <span class="text-[11px] font-medium">No Reference Photo</span>
              </div>
              
              <!-- Scan overlay animation if active -->
              <div
                v-if="selectedGuardForBiometric.faceStatus === 'active'"
                class="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-indigo-500/20 pointer-events-none border border-indigo-400/40 rounded-2xl"
              />
              <div
                v-if="selectedGuardForBiometric.faceStatus === 'active'"
                class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1"
              >
                <CheckCircle2 class="w-2.5 h-2.5" /> Active
              </div>
            </div>
            
            <p class="text-xs font-bold text-slate-700 dark:text-zinc-300 mt-3">
              {{ selectedGuardForBiometric.first_name }} {{ selectedGuardForBiometric.last_name }}
            </p>
            <p class="text-[11px] text-slate-500 dark:text-zinc-500">
              Employee ID: {{ selectedGuardForBiometric.employeeId || selectedGuardForBiometric.id }}
            </p>
          </div>

          <!-- Biometric Info Card -->
          <div class="bg-slate-50 dark:bg-zinc-900/80 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800 space-y-2.5 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-slate-500 dark:text-zinc-400">Enrollment Status</span>
              <span
                class="px-2 py-0.5 rounded-md font-bold text-[11px]"
                :class="[
                  selectedGuardForBiometric.faceStatus === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                  selectedGuardForBiometric.faceStatus === 'pending_update' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                  'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                ]"
              >
                {{ selectedGuardForBiometric.faceStatus === 'active' ? 'Enrolled & Verified' : selectedGuardForBiometric.faceStatus === 'pending_update' ? 'Re-Scan Required' : 'Not Registered' }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500 dark:text-zinc-400">AI Model</span>
              <span class="font-mono text-[11px] text-slate-700 dark:text-zinc-300">MobileFaceNet (192-d)</span>
            </div>
            <div v-if="selectedGuardForBiometric.faceProfile?.deviceEnrolled" class="flex justify-between items-center">
              <span class="text-slate-500 dark:text-zinc-400">Enrolled Device</span>
              <span class="font-medium text-slate-700 dark:text-zinc-300">{{ selectedGuardForBiometric.faceProfile.deviceEnrolled }}</span>
            </div>
            <div v-if="selectedGuardForBiometric.faceEnrolledDate" class="flex justify-between items-center">
              <span class="text-slate-500 dark:text-zinc-400">Enrolled Date</span>
              <span class="text-slate-700 dark:text-zinc-300">{{ new Date(selectedGuardForBiometric.faceEnrolledDate).toLocaleDateString() }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500 dark:text-zinc-400">Multi-Device Sync</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check class="w-3 h-3" /> Synced to all devices
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-2 pt-1">
            <button
              v-if="selectedGuardForBiometric.faceStatus === 'active'"
              :disabled="biometricActionLoading"
              class="w-full h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              @click="handleRequestReScan(selectedGuardForBiometric)"
            >
              <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': biometricActionLoading }" />
              <span>Request Face Re-Scan on Mobile</span>
            </button>

            <button
              v-if="selectedGuardForBiometric.faceStatus === 'active' || selectedGuardForBiometric.faceStatus === 'pending_update'"
              :disabled="biometricActionLoading"
              class="w-full h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              @click="handleRevokeFace(selectedGuardForBiometric)"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Revoke Biometric Face ID</span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-zinc-800/80 flex justify-end">
          <button
            class="px-5 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
            @click="showBiometricModal = false"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  UserPlus, Search, Loader2, ShieldCheck, Phone, Settings, Trash2, X, 
  AlertTriangle, Map, MapPin, Check, AlertCircle, Clock, MessageSquare,
  ScanFace, Camera, CheckCircle2, RotateCw
} from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { biometricService } from '@/services/biometricService';
import ValueHeader from '@/components/common/ValueHeader.vue';
import GuardMessageModal from '@/components/guard/GuardMessageModal.vue';

const items = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const showDialog = ref(false);
const editingGuard = ref(null);
const dialogLoading = ref(false);
const dialogError = ref('');
const doors = ref([]);
const guardRoleId = ref(null);

const showBiometricModal = ref(false);
const selectedGuardForBiometric = ref(null);
const biometricActionLoading = ref(false);

const openBiometricModal = (guard) => {
  selectedGuardForBiometric.value = guard;
  showBiometricModal.value = true;
};

const handleRequestReScan = async (guard) => {
  if (!guard?.faceProfile?.id) return;
  try {
    biometricActionLoading.value = true;
    await biometricService.requestReEnrollment(guard.faceProfile.id);
    guard.faceStatus = 'pending_update';
  } catch (e) {
    console.error('Failed to request re-scan:', e);
  } finally {
    biometricActionLoading.value = false;
  }
};

const handleRevokeFace = async (guard) => {
  if (!guard?.faceProfile?.id) return;
  if (!confirm(`Are you sure you want to revoke Face ID biometric access for ${fullName(guard)}?`)) return;
  try {
    biometricActionLoading.value = true;
    await biometricService.revokeFaceId(guard.faceProfile.id);
    guard.faceStatus = 'revoked';
    guard.facePhoto = null;
  } catch (e) {
    console.error('Failed to revoke Face ID:', e);
  } finally {
    biometricActionLoading.value = false;
  }
};

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
  first_name: '',
  last_name: '',
  email: '',
  country_code: '+91',
  phone: '',
  role_id: 4940,
  send_login_link: true,
  password: '',
  assigned_door: null,
  enable_incidents: false,
  enable_patrols: false,
});

const showPatrolMap = ref(false);
const activeGuardForMap = ref(null);

const showMessageModal = ref(false);
const selectedGuardForMessage = ref(null);

const viewPatrolMap = (guard) => {
  activeGuardForMap.value = guard;
  showPatrolMap.value = true;
};

const openMessageModal = (guard) => {
  selectedGuardForMessage.value = guard;
  showMessageModal.value = true;
};

const handleMessageSent = () => {
  console.log('Message sent successfully.');
};

const fetchGuardRoleId = async () => {
  try {
    const token = authService.getToken();
    if (!token || !authService.isAuthenticated()) return;
    const tenantId = await currentUserTenant.getTenantIdAsync();
    if (!tenantId) return;
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/roleConfigurator?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][accessType][_in]=patrol,accesseasy_patrol&fields[]=id&fields[]=roleName`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        availableRoles.value = data.data;
        const guardRole = data.data.find(r => /guard|security|patrol|officer/i.test(r.roleName));
        if (guardRole) {
          guardRoleId.value = guardRole.id;
          if (!form.value.role_id) {
            form.value.role_id = guardRole.id;
          }
        } else {
          // Auto-provision default Security Guard role for this tenant
          try {
            const createRes = await fetch(`${import.meta.env.VITE_API_URL}/items/roleConfigurator`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                roleName: 'Security Guard',
                accessType: 'patrol',
                tenant: tenantId
              })
            });
            if (createRes.ok) {
              const created = await createRes.json();
              if (created.data?.id) {
                availableRoles.value.push(created.data);
                guardRoleId.value = created.data.id;
                form.value.role_id = created.data.id;
              }
            }
          } catch (e) {
            guardRoleId.value = null;
          }
        }
      } else {
        // No patrol roles exist at all for this tenant — auto-create Security Guard
        try {
          const createRes = await fetch(`${import.meta.env.VITE_API_URL}/items/roleConfigurator`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              roleName: 'Security Guard',
              accessType: 'patrol',
              tenant: tenantId
            })
          });
          if (createRes.ok) {
            const created = await createRes.json();
            if (created.data?.id) {
              availableRoles.value = [created.data];
              guardRoleId.value = created.data.id;
              form.value.role_id = created.data.id;
            }
          }
        } catch (e) {
          guardRoleId.value = null;
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch guard role config:', err);
  }
};

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value;
  const q = searchQuery.value.toLowerCase();
  return items.value.filter(g =>
    fullName(g).toLowerCase().includes(q) || (g.email || '').toLowerCase().includes(q)
  );
});

const fullName = (g) => `${g.first_name || ''} ${g.last_name || ''}`.trim() || 'Unknown';
const initials = (g) => fullName(g).charAt(0).toUpperCase();

const openAddDialog = () => {
  editingGuard.value = null;
  dialogError.value = '';
  form.value = {
    employee_id: `GRD-${Date.now().toString().slice(-5)}`,
    first_name: '',
    last_name: '',
    email: '',
    country_code: '+91',
    phone: '',
    role_id: availableRoles.value[0]?.id || guardRoleId.value || null,
    send_login_link: true,
    password: '',
    assigned_door: null,
    enable_incidents: false,
    enable_patrols: false
  };
  showDialog.value = true;
};

const editGuard = async (guard) => {
  editingGuard.value = guard;
  dialogError.value = '';
  
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
    employee_id: guard.employeeId || guard.employee_id || '',
    first_name: guard.first_name || '',
    last_name: guard.last_name || '',
    email: (guard.email && !guard.email.includes('@accesseasy.app')) ? guard.email : '',
    country_code: matchedCode,
    phone: cleanPhone,
    role_id: guard.accesseasyRole?.id || guard.accesseasyRole || availableRoles.value[0]?.id || guardRoleId.value || null,
    send_login_link: false,
    password: '',
    assigned_door: null,
    enable_incidents: false,
    enable_patrols: false,
  };
  
  // Fetch personalModule to get assigned_door, employeeId, and mobilePermissions
  try {
    dialogLoading.value = true;
    const token = authService.getToken();
    const pmRes = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?filter[assignedUser][_eq]=${guard.id}&fields[]=id&fields[]=employeeId&fields[]=assigned_door&fields[]=mobilePermissions`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (pmRes.ok) {
        const pmData = await pmRes.json();
        if (pmData.data && pmData.data.length > 0) {
            const pm = pmData.data[0];
            form.value.assigned_door = typeof pm.assigned_door === 'object' && pm.assigned_door !== null ? pm.assigned_door.id || pm.assigned_door : pm.assigned_door;
            if (pm.employeeId) {
              form.value.employee_id = pm.employeeId;
            }
            editingGuard.value.personalModuleId = pm.id;
            
            // Load toggles if they exist
            let permissions = pm.mobilePermissions;
            if (permissions) {
                if (typeof permissions === 'string') {
                    try { permissions = JSON.parse(permissions); } catch(e) {}
                }
                form.value.enable_incidents = !!permissions?.enable_incidents;
                form.value.enable_patrols = !!permissions?.enable_patrols;
            }
        }
    }
  } catch(err) {
      console.error('Failed to fetch guard personal info:', err);
  } finally {
      dialogLoading.value = false;
  }

  showDialog.value = true;
};

const fetchGuards = async () => {
  loading.value = true;
  try {
    const token = authService.getToken();
    let tenantId = authService.getTenantId();
    if (!tenantId) {
      try { tenantId = await currentUserTenant.getTenantIdAsync(); } catch (_) {}
    }

    if (!token) {
      items.value = [];
      return;
    }

    if (!guardRoleId.value) {
      await fetchGuardRoleId();
    }

    let rawGuards = [];

    // Step 1: Query /users with multi-strategy fallback
    const queryUrls = [];
    if (tenantId) {
      queryUrls.push(`${import.meta.env.VITE_API_URL}/users?filter[_or][0][tenant][_eq]=${tenantId}&filter[_or][1][tenant][tenantId][_eq]=${tenantId}&filter[_or][2][tenant][id][_eq]=${tenantId}&fields[]=id&fields[]=first_name&fields[]=last_name&fields[]=email&fields[]=phone&fields[]=status&fields[]=title&fields[]=avatar&fields[]=role.name&limit=500`);
      queryUrls.push(`${import.meta.env.VITE_API_URL}/users?filter[tenant][_eq]=${tenantId}&fields[]=id&fields[]=first_name&fields[]=last_name&fields[]=email&fields[]=phone&fields[]=status&fields[]=title&fields[]=avatar&fields[]=role.name&limit=500`);
    }
    queryUrls.push(`${import.meta.env.VITE_API_URL}/users?fields[]=id&fields[]=first_name&fields[]=last_name&fields[]=email&fields[]=phone&fields[]=status&fields[]=title&fields[]=avatar&fields[]=role.name&limit=500`);

    for (const url of queryUrls) {
      try {
        const usersRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData.data && Array.isArray(usersData.data) && usersData.data.length > 0) {
            rawGuards = usersData.data.map(u => ({
              id: u.id,
              first_name: u.first_name || '',
              last_name: u.last_name || '',
              email: u.email || '',
              phone: u.phone || '',
              status: u.status || 'active',
              employeeId: u.title || null,
              avatar: u.avatar || null,
              assigned_zone_name: null,
              _roleSystemName: (u.role?.name || '').toLowerCase()
            }));
            break;
          }
        }
      } catch (e) {
        console.warn('Guard /users fetch error:', e);
      }
    }

    // Step 2: Enrich rawGuards with personalModule data (zone, employeeId, mobilePermissions)
    if (rawGuards.length > 0) {
      try {
        const userIds = rawGuards.map(g => g.id).filter(Boolean).join(',');
        const pmRes = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule?filter[assignedUser][_in]=${userIds}&fields[]=assignedUser&fields[]=id&fields[]=employeeId&fields[]=mobilePermissions&fields[]=assigned_door.doorName`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (pmRes.ok) {
          const pmData = await pmRes.json();
          const pmMap = {};
          (pmData.data || []).forEach(pm => {
            if (pm.assignedUser) {
              pmMap[pm.assignedUser] = {
                personalModuleId: pm.id,
                employeeId: pm.employeeId,
                mobilePermissions: pm.mobilePermissions,
                assigned_zone_name: pm.assigned_door?.doorName || null
              };
            }
          });
          rawGuards.forEach(g => {
            const pm = pmMap[g.id];
            if (pm) {
              g.personalModuleId = pm.personalModuleId;
              g.employeeId = g.employeeId || pm.employeeId;
              g.mobilePermissions = pm.mobilePermissions;
              g.assigned_zone_name = pm.assigned_zone_name;
            }
          });
        }
      } catch (e) {
        console.warn('personalModule enrichment error:', e);
      }
    }

    // Step 3: Exclude current admin and system accounts
    const currentUserId = authService.getUserId?.() || authService.getUserData?.()?.id;
    const filtered = rawGuards.filter(u => {
      if (u._roleSystemName?.includes('administrator') || u._roleSystemName?.includes('public')) return false;
      if (currentUserId && String(u.id) === String(currentUserId)) {
        const myRole = (authService.getUserRole?.() || '').toLowerCase();
        if (myRole.includes('admin') || myRole.includes('owner')) return false;
      }
      return true;
    });

    // 5. Fetch biometric face ID records for current tenant
    let faceProfiles = [];
    try {
      faceProfiles = await biometricService.getTenantFaceProfiles();
    } catch (err) {
      console.warn('Failed to load biometric face profiles:', err);
    }

    const enhanced = filtered.map(u => {
      const matchingProfile = faceProfiles.find(fp => 
        fp.assignedTo?.assignedUser?.id === u.id || 
        fp.assignedTo?.assignedUser === u.id || 
        fp.assignedTo?.id === u.personalModuleId || 
        fp.assignedTo?.id === u.id || 
        fp.assignedTo === u.personalModuleId || 
        fp.assignedTo === u.id
      );

      // Resolve face photo from biometric record, personal module, or user avatar
      let photoUrl = null;
      if (matchingProfile?.rawImage) {
        photoUrl = matchingProfile.rawImage;
      } else {
        const photoId = matchingProfile?.referencePhoto?.id || 
                        matchingProfile?.referencePhoto || 
                        matchingProfile?.photo?.id || 
                        matchingProfile?.photo || 
                        matchingProfile?.facePhoto?.id || 
                        matchingProfile?.facePhoto || 
                        matchingProfile?.image?.id || 
                        matchingProfile?.image || 
                        matchingProfile?.avatar?.id || 
                        matchingProfile?.avatar || 
                        matchingProfile?.assignedTo?.avatar?.id || 
                        matchingProfile?.assignedTo?.avatar || 
                        matchingProfile?.assignedTo?.photo?.id || 
                        matchingProfile?.assignedTo?.photo || 
                        u.avatar?.id || 
                        u.avatar;

        photoUrl = photoId ? biometricService.getFacePhotoUrl(photoId) : null;
      }

      return {
        ...u,
        avatar: photoUrl,
        faceProfile: matchingProfile || null,
        faceStatus: matchingProfile?.status || 'not_enrolled',
        facePhoto: photoUrl,
        faceEnrolledDate: matchingProfile?.date_created || matchingProfile?.date_updated || null,
        is_face_enrolled: matchingProfile?.status === 'active'
      };
    });

    items.value = enhanced;
  } catch (err) {
    console.error('Failed to fetch guards:', err);
    items.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchDoors = async () => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/doors?filter[tenant][_eq]=${tenantId}&filter[status][_neq]=archived&fields[]=id&fields[]=doorName`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      doors.value = data.data || [];
    }
  } catch (err) {
    console.error('Failed to fetch doors:', err);
  }
};

const handleSubmit = async () => {
  dialogError.value = '';
  if (!form.value.first_name.trim()) {
    dialogError.value = 'First name is required.';
    return;
  }
  const cleanDigits = form.value.phone.replace(/\D/g, '');
  if (form.value.phone && cleanDigits.length < 7) {
    dialogError.value = 'Valid mobile number is required.';
    return;
  }
  if (!editingGuard.value && !form.value.password.trim()) {
    dialogError.value = 'Password is required for new guards.';
    return;
  }

  dialogLoading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();

    const isEdit = !!editingGuard.value;
    const url = isEdit
      ? `${import.meta.env.VITE_API_URL}/users/${editingGuard.value.id}`
      : `${import.meta.env.VITE_API_URL}/users`;

    const fullPhone = cleanDigits ? `${form.value.country_code || '+91'}${cleanDigits}` : null;

    const payload = {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      email: form.value.email,
      phone: fullPhone,
      title: form.value.employee_id?.trim() || undefined,
      userApp: 'patrol',
      accesseasyPatrolRole: form.value.role_id || guardRoleId.value || null,
      tenant: tenantId,
    };

    if (!isEdit) {
      // Fetch the generic Employee role dynamically for system auth
      const roleRes = await fetch(`${import.meta.env.VITE_API_URL}/roles?filter[name][_eq]=Employee`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const roleData = await roleRes.json();
      const employeeRoleId = roleData?.data?.[0]?.id;

      if (employeeRoleId) {
        payload.role = employeeRoleId;
      }
      
      payload.password = form.value.password;
    }

    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const userData = await res.json();
      const newUserId = userData.data?.id;

      // If this is a newly created Guard, they strictly require a personalModule profile to pass Flow validation!
      const guardEmpId = form.value.employee_id?.trim() || `GRD-${Date.now().toString().slice(-5)}`;
      if (!isEdit && newUserId) {
        const personalPayload = {
          employeeId: guardEmpId,
          firstName: form.value.first_name,
          lastName: form.value.last_name || '-',
          personalEmail: form.value.email,
          personalPhone: form.value.phone ? `+91${form.value.phone}` : null,
          designation: 'Guard',
          status: 'true',
          accessOn: true,
          uniqueId: `${tenantId}-${guardEmpId}`,
          config: [{ shiftName: 1, startTime: "09:00", endTime: "18:00" }],
          mobilePermissions: { 
            enable_incidents: form.value.enable_incidents, 
            enable_patrols: form.value.enable_patrols 
          },
          attendancePolicyHistory: { status: "published" },
          tenant: tenantId,
          assignedUser: newUserId,
          assigned_door: form.value.assigned_door,
        };

        const personalRes = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(personalPayload),
        });

        if (!personalRes.ok) {
          console.warn('Backend rejected personalModule assignment for Guard.');
        }
      } else if (isEdit && editingGuard.value.personalModuleId) {
        // Update assigned_door, mobile permissions, and employeeId
        const personalPayload = {
            employeeId: form.value.employee_id?.trim() || undefined,
            firstName: form.value.first_name,
            lastName: form.value.last_name || '-',
            personalEmail: form.value.email,
            personalPhone: form.value.phone ? `+91${form.value.phone}` : null,
            assigned_door: form.value.assigned_door,
            mobilePermissions: { 
              enable_incidents: form.value.enable_incidents, 
              enable_patrols: form.value.enable_patrols 
            }
        };
        await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule/${editingGuard.value.personalModuleId}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(personalPayload),
        });
      }

      showDialog.value = false;
      await fetchGuards();
    } else {
      const errData = await res.json();
      dialogError.value = errData.errors?.[0]?.message || 'Failed to save guard.';
    }
  } catch (err) {
    dialogError.value = `Network error: ${err.message}`;
  } finally {
    dialogLoading.value = false;
  }
};

const deleteGuard = async (guard) => {
  if (!confirm(`Delete guard "${fullName(guard)}"?`)) return;
  try {
    const token = authService.getToken();

    // First query and delete associated personalModule profile to prevent database orphans
    const pmRes = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?filter[assignedUser][_eq]=${guard.id}&fields[]=id`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (pmRes.ok) {
      const pmData = await pmRes.json();
      if (pmData.data && pmData.data.length > 0) {
        const pmId = pmData.data[0].id;
        await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule/${pmId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${guard.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchGuards();
    } else {
      alert('Failed to delete guard user account.');
    }
  } catch (err) {
    console.error('Delete error:', err);
  }
};

onMounted(() => {
  fetchGuards();
  fetchDoors();
});
</script>
