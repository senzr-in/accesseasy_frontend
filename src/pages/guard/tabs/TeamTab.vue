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

        <!-- Avatar & Identity -->
        <div class="relative z-10 flex flex-col items-center mt-2 mb-4">
          <div class="w-16 h-16 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700/50 shadow-inner mb-3 flex items-center justify-center text-zinc-400 font-bold text-xl">
            <img
              v-if="guard.avatar"
              :src="guard.avatar"
              :alt="fullName(guard)"
              class="w-full h-full object-cover"
            >
            <span v-else>{{ initials(guard) }}</span>
          </div>
          <h3 class="text-[16px] font-bold text-white tracking-wide">
            {{ fullName(guard) }}
          </h3>
          <p class="text-[11px] text-zinc-400 mt-0.5">
            Employee ID {{ guard.employeeId || guard.id.toString().padStart(2, '0') }}
          </p>
        </div>

        <!-- Details List -->
        <div class="relative z-10 space-y-3 flex-1 w-full px-1">
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
        </div>

        <!-- Actions Row -->
        <div class="relative z-30 mt-6 grid grid-cols-2 gap-3">
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

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Phone</label>
                <input
                  v-model="form.phone"
                  type="text"
                  inputmode="numeric"
                  maxlength="10"
                  placeholder="10-digit phone number"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500"
                  @input="form.phone = $event.target.value.replace(/\D/g, '')"
                >
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Assigned Door <span class="text-red-500">*</span></label>
                <select
                  v-model="form.assigned_door"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500"
                >
                  <option
                    :value="null"
                    disabled
                  >
                    Select a Door
                  </option>
                  <option
                    v-for="door in doors"
                    :key="door.id"
                    :value="door.id"
                  >
                    {{ door.doorName || 'Unnamed Door' }}
                  </option>
                </select>
              </div>
            </div>

            <div
              v-if="!editingGuard"
              class="space-y-1.5"
            >
              <label class="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Password <span class="text-red-500">*</span></label>
              <input
                v-model="form.password"
                type="password"
                placeholder="Minimum 8 characters"
                class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground shadow-sm focus:border-indigo-500"
              >
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

          <!-- Timeline Container (Mock Data) -->
          <div class="relative pl-6 space-y-8">
            <!-- Connecting Line -->
            <div class="absolute left-[39px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-zinc-800 rounded-full" />

            <!-- Scanned Checkpoint 1 -->
            <div class="relative flex gap-6 items-start group">
              <div class="relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-4 ring-white dark:ring-zinc-950 shrink-0 transform transition-transform group-hover:scale-110">
                <Check class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1 bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-zinc-800/50 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800/80 backdrop-blur-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 group-hover:border-emerald-200 dark:group-hover:border-emerald-500/30">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                      Main Lobby Desk
                    </h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
                      <MapPin class="w-3 h-3" /> NFC-001 • Checkpoint 1
                    </p>
                  </div>
                  <span class="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-2 py-1 rounded-md">
                    10:00 AM
                  </span>
                </div>
              </div>
            </div>

            <!-- Scanned Checkpoint 2 -->
            <div class="relative flex gap-6 items-start group">
              <div class="relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-4 ring-white dark:ring-zinc-950 shrink-0 transform transition-transform group-hover:scale-110">
                <Check class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1 bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-zinc-800/50 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800/80 backdrop-blur-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 group-hover:border-emerald-200 dark:group-hover:border-emerald-500/30">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                      Server Room Corridor
                    </h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
                      <MapPin class="w-3 h-3" /> QR-042 • Checkpoint 2
                    </p>
                  </div>
                  <span class="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-2 py-1 rounded-md">
                    10:15 AM
                  </span>
                </div>
              </div>
            </div>

            <!-- Missed Checkpoint -->
            <div class="relative flex gap-6 items-start group">
              <div class="relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20 ring-4 ring-white dark:ring-zinc-950 shrink-0 transform transition-transform group-hover:scale-110">
                <X class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1 bg-rose-50/50 dark:bg-rose-500/5 rounded-2xl p-4 border border-rose-100 dark:border-rose-500/20 backdrop-blur-sm group-hover:border-rose-300 dark:group-hover:border-rose-500/40 transition-colors">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-sm font-bold text-rose-900 dark:text-rose-100">
                      South Parking Exit
                    </h3>
                    <p class="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle class="w-3 h-3" /> Missed Checkpoint
                    </p>
                  </div>
                  <span class="text-[9px] font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 px-2 py-1 rounded-md uppercase tracking-widest">
                    Expected 10:30 AM
                  </span>
                </div>
              </div>
            </div>

            <!-- Pending Checkpoint -->
            <div class="relative flex gap-6 items-start group">
              <div class="relative z-10 w-10 h-10 rounded-xl bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 flex items-center justify-center ring-4 ring-white dark:ring-zinc-950 shrink-0">
                <Clock class="w-4 h-4 text-slate-400" />
              </div>
              <div class="flex-1 border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-slate-900/50 dark:bg-zinc-950/50 rounded-2xl p-4 opacity-60">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-sm font-bold text-slate-600 dark:text-zinc-400">
                      North Gate
                    </h3>
                    <p class="text-[11px] text-slate-400 mt-1 font-medium">
                      Pending Scan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { UserPlus, Search, Loader2, ShieldCheck, Phone, Settings, Trash2, X, AlertTriangle, Map, MapPin, Check, AlertCircle, Clock, MessageSquare } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
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

const showPatrolMap = ref(false);
const activeGuardForMap = ref(null);

const showMessageModal = ref(false);
const selectedGuardForMessage = ref(null);

const viewPatrolMap = (guard) => {
  activeGuardForMap.value = guard;
  showPatrolMap.value = true;
};

const openMessageModal = (guard) => {
  console.log('Opening message modal for guard:', guard);
  alert('Click handler fired! If you see this, the button works but the modal failed to show.');
  selectedGuardForMessage.value = guard;
  showMessageModal.value = true;
};

const handleMessageSent = () => {
  console.log('Message sent successfully.');
};

const fetchGuardRoleId = async () => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantIdAsync();
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/roleConfigurator?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][accessType][_eq]=accessEasy&filter[_and][0][_and][2][roleName][_contains]=guard&fields[]=id`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        guardRoleId.value = data.data[0].id;
      }
    }
  } catch (err) {
    console.error('Failed to fetch guard role config:', err);
  }
};

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  assigned_door: null,
  enable_incidents: false,
  enable_patrols: false,
});

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
  form.value = { first_name: '', last_name: '', email: '', phone: '', password: '', assigned_door: null, enable_incidents: false, enable_patrols: false };
  showDialog.value = true;
};

const editGuard = async (guard) => {
  editingGuard.value = guard;
  dialogError.value = '';
  form.value = {
    first_name: guard.first_name || '',
    last_name: guard.last_name || '',
    email: guard.email || '',
    phone: (guard.phone || '').replace(/^\+91/, ''),
    password: '',
    assigned_door: null,
    enable_incidents: false,
    enable_patrols: false,
  };
  
  // Fetch personalModule to get assigned_door and mobilePermissions
  try {
    dialogLoading.value = true;
    const token = authService.getToken();
    const pmRes = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?filter[assignedUser][_eq]=${guard.id}&fields[]=id&fields[]=assigned_door&fields[]=mobilePermissions`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (pmRes.ok) {
        const pmData = await pmRes.json();
        if (pmData.data && pmData.data.length > 0) {
            const pm = pmData.data[0];
            form.value.assigned_door = typeof pm.assigned_door === 'object' && pm.assigned_door !== null ? pm.assigned_door.id || pm.assigned_door : pm.assigned_door;
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
    const tenantId = await currentUserTenant.getTenantIdAsync();

    if (!tenantId || !token) {
      items.value = [];
      return;
    }

    if (!guardRoleId.value) {
      await fetchGuardRoleId();
    }

    let filterString = `filter[_and][0][tenant][tenantId][_eq]=${tenantId}`;
    if (guardRoleId.value) {
      filterString += `&filter[_and][1][accesseasyRole][_eq]=${guardRoleId.value}`;
    } else {
      filterString += `&filter[_and][1][accesseasyRole][roleName][_contains]=guard`;
    }

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/users?${filterString}&fields[]=id&fields[]=first_name&fields[]=last_name&fields[]=email&fields[]=phone&fields[]=status&fields[]=title&fields[]=accesseasyRole.*&fields[]=tenant.userApp`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const data = await res.json();
      const allUsers = data.data || [];
      const filtered = allUsers.filter(u => {
        if (!u.tenant) return false;
        let userApps = u.tenant.userApp || [];
        if (typeof userApps === "string") {
          try {
            userApps = JSON.parse(userApps);
          } catch (e) {
            userApps = [];
          }
        }
        return Array.isArray(userApps) && userApps.some(app => app.userApp === "accesseasy");
      });
      if (filtered.length > 0) {
        items.value = filtered;
      } else {
        items.value = [];
      }
    } else {
      items.value = [];
    }
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
  if (!form.value.email.trim()) {
    dialogError.value = 'Email is required.';
    return;
  }
  if (form.value.phone && !/^\d{10}$/.test(form.value.phone)) {
    dialogError.value = 'Phone number must be exactly 10 digits.';
    return;
  }
  if (!editingGuard.value && !form.value.password.trim()) {
    dialogError.value = 'Password is required for new guards.';
    return;
  }
  if (!form.value.assigned_door) {
    dialogError.value = 'Assigned door is required.';
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

    const payload = {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      email: form.value.email,
      phone: form.value.phone ? `+91${form.value.phone}` : null,
      userApp: 'accesseasy',
      accesseasyRole: guardRoleId.value || null,
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
      if (!isEdit && newUserId) {
        const generatedEmpId = `GRD-${Date.now().toString().slice(-5)}`;
        const personalPayload = {
          employeeId: generatedEmpId,
          firstName: form.value.first_name,
          lastName: form.value.last_name || '-',
          personalEmail: form.value.email,
          personalPhone: form.value.phone ? `+91${form.value.phone}` : null,
          designation: 'Guard',
          status: 'true',
          accessOn: true,
          uniqueId: `${tenantId}-${generatedEmpId}`,
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
        // Update assigned_door and mobile permissions
        const personalPayload = {
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
