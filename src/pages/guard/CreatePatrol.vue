<template>
  <div class="h-full flex flex-col bg-[#FAFAFA] dark:bg-[#0b0f19] overflow-auto custom-scrollbar">
    <!-- Header -->
    <div class="max-w-[1400px] mx-auto w-full px-6 pt-2 pb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          class="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          @click="$router.push('/dashboard/patrols')"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div>
          <h1 class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Create New Patrol
          </h1>
          <p class="text-[10px] text-slate-500 dark:text-slate-400">
            Set up your patrol in a few simple steps
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-[1400px] mx-auto w-full px-6 pb-6 flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <!-- Left Column: Form -->
      <div class="flex-1 space-y-6">

        <!-- Step 1: Settings -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Patrol Configuration</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
            <!-- Patrol Name -->
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Patrol Name <span class="text-rose-500">*</span></label>
              <input
                v-model="form.name"
                type="text"
                class="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="e.g. Night Warehouse Patrol"
              />
            </div>

            <!-- Zone -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Zone <span class="text-rose-500">*</span></label>
                <button
                  type="button"
                  @click="openAddZoneModal"
                  class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  + New Zone
                </button>
              </div>
              <select
                v-model="form.zoneId"
                @change="handleZoneSelectChange"
                class="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              >
                <option value="" disabled>Select Zone</option>
                <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.zoneName || z.name }}</option>
                <option value="__NEW_ZONE__" class="font-bold text-indigo-600">+ Create New Zone...</option>
              </select>
            </div>

            <!-- Starts At -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Starts At <span class="text-rose-500">*</span></label>
              <input
                v-model="form.startsAt"
                type="time"
                class="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            
            <!-- Repeat -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Repeat <span class="text-rose-500">*</span></label>
              <select
                v-model="form.repeat"
                class="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
              >
                <option value="none">Does not repeat</option>
                <option value="1">Every 1 Hour</option>
                <option value="2">Every 2 Hours</option>
                <option value="3">Every 3 Hours</option>
                <option value="4">Every 4 Hours</option>
                <option value="8">Every 8 Hours</option>
                <option value="12">Every 12 Hours</option>
              </select>
            </div>

            <!-- Max Duration -->
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                Maximum Patrol Duration (Overall)
                <Info class="w-3.5 h-3.5 text-slate-400" />
              </label>
              <div class="flex gap-2">
                <input
                  v-model.number="form.maxDuration"
                  type="number"
                  min="5"
                  class="w-24 text-center text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <select class="text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none">
                  <option>Minutes</option>
                </select>
              </div>
            </div>
            
            <!-- Info Box -->
            <div class="md:col-span-4 mt-2">
              <div class="flex items-center gap-3 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
                <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Clock class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p class="text-sm font-semibold text-indigo-900 dark:text-indigo-200 leading-snug">
                  The patrol must be completed within <span class="font-black">{{ form.maxDuration }} minutes</span> from the start time. Used to detect delays.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Checkpoints -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Checkpoints <span class="text-xs font-semibold text-slate-400">({{ selectedCheckpoints.length }} selected · Drag to reorder)</span>
              </h2>
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                type="button"
                class="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                @click="openSelectCheckpointsModal"
              >
                <ListFilter class="w-3.5 h-3.5 text-indigo-500" />
                <span>Select from Library</span>
              </button>
              <button 
                type="button"
                class="h-8 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                @click="openInlineCreate"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>+ Create Checkpoint</span>
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="selectedCheckpoints.length === 0 && !isCreatingInline" class="text-center py-8 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30">
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <MapPin class="w-6 h-6" />
            </div>
            <p class="text-sm font-bold text-slate-800 dark:text-slate-200">
              No checkpoints added to this patrol yet
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Select existing checkpoints from your property library or create a new checkpoint directly.
            </p>
            <div class="flex items-center gap-2.5 mt-4">
              <button 
                type="button"
                class="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                @click="openSelectCheckpointsModal"
              >
                <ListFilter class="w-4 h-4" />
                <span>Select from Library</span>
              </button>
              <button 
                type="button"
                class="h-9 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                @click="openInlineCreate"
              >
                <Plus class="w-4 h-4 text-indigo-500" />
                <span>Create New Checkpoint</span>
              </button>
            </div>
          </div>

          <!-- Inline Create Form -->
          <div v-if="isCreatingInline" class="mb-4 w-full text-left p-4 bg-indigo-50/50 dark:bg-[#151c2c] border border-indigo-200 dark:border-indigo-500/30 rounded-xl shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin class="w-4 h-4 text-indigo-500" /> Create & Add Checkpoint
              </h3>
              <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="isCreatingInline = false">
                <X class="w-4 h-4" />
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div :class="form.zoneId ? 'sm:col-span-2' : 'sm:col-span-1'">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Checkpoint Name <span class="text-rose-500">*</span></label>
                <input v-model="inlineForm.name" type="text" class="w-full text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="e.g. Server Room Door" />
              </div>
              <div v-if="!form.zoneId">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Zone <span class="text-rose-500">*</span></label>
                <select v-model="inlineForm.zoneId" class="w-full text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                  <option value="" disabled>Select Zone</option>
                  <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.zoneName || z.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Expected within (min)</label>
                <input v-model.number="inlineForm.expectedOffset" type="number" min="0" class="w-full text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
            </div>
            <div class="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button @click="isCreatingInline = false" class="h-8 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">Cancel</button>
              <button @click="createInlineCheckpoint" class="btn-primary text-xs h-8 px-4" :disabled="savingInline || !inlineForm.name">
                <span v-if="savingInline">Saving...</span>
                <span v-else>Create & Add</span>
              </button>
            </div>
          </div>

          <div v-if="selectedCheckpoints.length > 0" class="space-y-2 relative">
            <div 
              v-for="(cp, index) in selectedCheckpoints" 
              :key="cp.checkpoint_id || cp.id || index"
              class="flex items-center gap-4 p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0b0f19] hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              :class="{ 'opacity-50 scale-[0.98]': dragIndex === index }"
              draggable="true"
              @dragstart="onDragStart($event, index)"
              @dragover="onDragOver($event)"
              @drop="onDrop($event, index)"
              @dragenter.prevent
            >
              <div class="cursor-grab hover:text-indigo-600 text-slate-300 dark:text-slate-600">
                <GripVertical class="w-5 h-5" />
              </div>
              <div class="flex-1 flex items-center gap-3">
                <div class="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <MapPin class="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div>
                  <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ cp.name }}</span>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1 rounded">{{ cp.checkpoint_id || 'CP-AUTO' }}</span>
                    <span v-if="cp.zone" class="text-[10px] text-slate-400">{{ getZoneName(cp.zone) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <span class="text-xs font-semibold text-slate-500">Expected within</span>
                <input 
                  v-model.number="cp.expectedOffset"
                  type="number"
                  min="0"
                  class="w-16 text-center text-sm font-bold px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <span class="text-xs font-semibold text-slate-500">min</span>
              </div>

              <button class="w-8 h-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-300 hover:text-rose-500 transition-colors flex items-center justify-center ml-2 cursor-pointer" @click="removeCheckpoint(index)">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="mt-5 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Info class="w-4 h-4" />
            Time targets are counted from patrol start time.
          </div>
        </div>

        <!-- Step 3: Assign Guard -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">Assign Guard <span class="text-slate-400 font-medium text-sm">(Optional)</span></h2>
            </div>
            <button 
              type="button"
              class="h-8 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              @click="openAddGuardModal"
            >
              <UserPlus class="w-3.5 h-3.5" />
              <span>+ Add New Guard</span>
            </button>
          </div>
          
          <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <div class="relative w-full sm:w-80">
              <select
                v-model="form.guardId"
                @change="handleGuardSelectChange"
                class="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              >
                <option value="">👤 Unassigned</option>
                <option v-for="g in guards" :key="g.id" :value="g.id">👤 {{ g.name }}</option>
                <option value="__NEW_GUARD__" class="font-bold text-indigo-600">+ Add New Guard...</option>
              </select>
            </div>

            <button 
              type="button"
              class="h-10 px-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              @click="openAddGuardModal"
            >
              <UserPlus class="w-4 h-4" />
              <span>+ Add Guard</span>
            </button>
          </div>

          <!-- Notice if no guards exist -->
          <div v-if="guards.length === 0" class="mt-3.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300">
            <div class="flex items-center gap-2">
              <Info class="w-4 h-4 shrink-0 text-amber-600" />
              <span>No guards found yet. You can leave unassigned or register a guard now.</span>
            </div>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 transition-colors cursor-pointer"
              @click="openAddGuardModal"
            >
              + Add Guard
            </button>
          </div>
          
          <!-- Actions -->
          <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button class="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer" @click="$router.push('/dashboard/patrols')">
              Cancel
            </button>
            <button 
              class="px-8 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 cursor-pointer"
              @click="submit"
              :disabled="saving"
            >
              {{ saving ? 'Saving...' : 'Save Patrol' }}
            </button>
          </div>
        </div>

        <!-- Info Footer -->
        <div class="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white dark:bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
            <ShieldPlus class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p class="text-sm font-bold text-indigo-900 dark:text-indigo-300">Simple to configure. Powerful to monitor.</p>
            <p class="text-xs font-semibold text-indigo-600/70 dark:text-indigo-400 mt-0.5">You set the start time, repeat interval, overall duration, and checkpoint time targets. We handle the rest.</p>
          </div>
        </div>

      </div>

      <!-- Right Column: Info & Preview -->
      <div class="w-full lg:w-[360px] shrink-0 flex flex-col gap-6">
        
        <!-- Helper Card -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Info class="w-4 h-4 text-indigo-500" />
            How does timing work?
          </h3>
          <ul class="space-y-4">
            <li class="flex gap-3">
              <div class="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Clock class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">You only set time targets (in minutes)</p>
                <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5">No need to enter exact clock times.</p>
              </div>
            </li>
            <li class="flex gap-3">
              <div class="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <ArrowDown class="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Targets are relative to patrol start time</p>
                <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5">If patrol starts at {{ formatAMPM(form.startsAt) }}, all targets are calculated from that.</p>
              </div>
            </li>
            <li class="flex gap-3">
              <div class="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle class="w-3 h-3 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">If the guard is late</p>
                <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5">The system shows delayed checkpoints and total delay.</p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Preview Card -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm sticky top-6">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-5">Preview: Expected Timeline</h3>
          
          <div class="relative">
            <!-- Connecting Line -->
            <div class="absolute left-[11px] top-4 bottom-8 w-0.5 bg-dashed border-l-2 border-dashed border-slate-200 dark:border-slate-700"></div>
            
            <div class="space-y-6 relative z-10">
              
              <!-- Start Item -->
              <div class="flex items-start gap-4">
                <div class="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-white shadow-sm ring-4 ring-white dark:ring-[#151c2c]">
                  <Play class="w-3 h-3" />
                </div>
                <div class="flex-1 flex justify-between items-center pt-0.5">
                  <span class="text-xs font-bold text-slate-500">{{ formatAMPM(form.startsAt) }}</span>
                  <span class="text-xs font-bold text-slate-900 dark:text-white">Patrol Starts</span>
                </div>
              </div>

              <!-- Checkpoints -->
              <div v-for="(cp, idx) in previewTimeline" :key="cp.id" class="flex items-start gap-4">
                <div class="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 text-[10px] font-black ring-4 ring-white dark:ring-[#151c2c]">
                  {{ idx + 1 }}
                </div>
                <div class="flex-1 flex justify-between items-center pt-0.5">
                  <span class="text-xs font-bold text-slate-600 dark:text-slate-300">{{ cp.computedTime }}</span>
                  <span class="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">{{ cp.name }}</span>
                  <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20 whitespace-nowrap">
                    Within {{ cp.offset }} min
                  </span>
                </div>
              </div>

              <!-- End Item -->
              <div class="flex items-start gap-4">
                <div class="w-6 h-6 rounded-full bg-white dark:bg-[#151c2c] border-2 border-emerald-500 flex items-center justify-center shrink-0 text-emerald-500 ring-4 ring-white dark:ring-[#151c2c]">
                  <Check class="w-3.5 h-3.5" />
                </div>
                <div class="flex-1 flex justify-between items-center pt-0.5">
                  <div>
                    <p class="text-xs font-bold text-slate-900 dark:text-white">Must complete within</p>
                    <p class="text-[11px] font-bold text-slate-500">{{ computeEndTime }} ({{ form.maxDuration }} min)</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Modal: Select Checkpoints from Library -->
    <Teleport to="body">
      <div v-if="showSelectCheckpointsModal" class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4" @click.self="showSelectCheckpointsModal = false">
        <div class="w-full max-w-2xl bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 flex flex-col max-h-[85vh]">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5 shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <ListFilter class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">Select Patrol Checkpoints</h3>
                <p class="text-[11px] text-slate-500">Pick checkpoints from your library to add to this patrol route</p>
              </div>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showSelectCheckpointsModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Search & Filter Controls -->
          <div class="flex items-center gap-3 mb-3 shrink-0">
            <div class="relative flex-1">
              <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="checkpointSearchQuery"
                type="text"
                placeholder="Search checkpoints by name or ID..."
                class="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-indigo-500"
              />
            </div>
            <select
              v-model="modalZoneFilter"
              class="h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium outline-none"
            >
              <option value="all">All Zones</option>
              <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.zoneName || z.name }}</option>
            </select>
          </div>

          <!-- Checkpoints List -->
          <div class="flex-1 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 p-1">
            <label
              v-for="cp in modalFilteredCheckpoints"
              :key="cp.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  :checked="modalSelectedCpIds.includes(cp.id)"
                  @change="toggleModalCpSelection(cp.id)"
                  class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p class="text-xs font-bold text-slate-900 dark:text-white">{{ cp.name }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.2 rounded">{{ cp.checkpoint_id || 'CP-AUTO' }}</span>
                    <span class="text-[10px] text-slate-400">{{ getZoneName(cp.zone) }}</span>
                  </div>
                </div>
              </div>
              <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{{ cp.type || 'QR Code' }}</span>
            </label>

            <div v-if="modalFilteredCheckpoints.length === 0" class="py-10 text-center text-xs text-slate-400">
              No matching checkpoints found.
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
            <span class="text-xs font-semibold text-slate-500">
              {{ modalSelectedCpIds.length }} selected
            </span>
            <div class="flex gap-2">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showSelectCheckpointsModal = false"
              >
                Cancel
              </button>
              <button
                type="button"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                @click="confirmModalCpSelection"
              >
                <Check class="w-3.5 h-3.5" />
                <span>Add Selected ({{ modalSelectedCpIds.length }})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Modal: Add Guard Modal -->
    <Teleport to="body">
      <div v-if="showAddGuardModal" class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4" @click.self="showAddGuardModal = false">
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <UserPlus class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">Add Security Guard</h3>
                <p class="text-[11px] text-slate-500">Register a new security guard to assign to patrols</p>
              </div>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showAddGuardModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="submitAddGuard" class="space-y-3.5 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">First Name *</label>
                <input
                  v-model="newGuardForm.first_name"
                  required
                  placeholder="e.g. Ramesh"
                  class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Last Name</label>
                <input
                  v-model="newGuardForm.last_name"
                  placeholder="e.g. Kumar"
                  class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Phone Number *</label>
                <input
                  v-model="newGuardForm.phone"
                  required
                  placeholder="9876543210"
                  class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Badge / Guard ID</label>
                <input
                  v-model="newGuardForm.badge_number"
                  placeholder="GRD-101"
                  class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Email Address (Optional)</label>
              <input
                v-model="newGuardForm.email"
                type="email"
                placeholder="guard@company.com"
                class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500"
              />
            </div>

            <!-- Footer -->
            <div class="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showAddGuardModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                :disabled="isSavingGuard"
              >
                <UserPlus class="w-3.5 h-3.5" />
                <span>{{ isSavingGuard ? 'Saving...' : 'Add & Select Guard' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Add Zone Modal -->
    <Teleport to="body">
      <div v-if="showAddZoneModal" class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4" @click.self="showAddZoneModal = false">
        <div class="w-full max-w-md bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Layers class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">Create Security Zone</h3>
                <p class="text-[11px] text-slate-500">Define a new zone for patrol checkpoints and routes</p>
              </div>
            </div>
            <button class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer" @click="showAddZoneModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="submitAddZone" class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Zone Name *</label>
              <input
                v-model="newZoneForm.name"
                required
                placeholder="e.g. Ground Floor & Main Gate"
                class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500"
              />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Zone Code (Optional)</label>
              <input
                v-model="newZoneForm.code"
                placeholder="e.g. ZN-GF-01"
                class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase outline-none focus:border-indigo-500"
              />
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Description (Optional)</label>
              <textarea
                v-model="newZoneForm.description"
                rows="2"
                placeholder="Brief description of the zone area..."
                class="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500 resize-none"
              ></textarea>
            </div>

            <!-- Footer -->
            <div class="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showAddZoneModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                :disabled="isSavingZone || !newZoneForm.name.trim()"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>{{ isSavingZone ? 'Creating...' : 'Create & Select Zone' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  ShieldPlus, ChevronRight, GripVertical, Trash2, Info, Clock, 
  Plus, CheckCircle2, ArrowDown, AlertCircle, Play, Check, MapPin, ArrowLeft,
  ListFilter, Search, X, UserPlus, Layers
} from 'lucide-vue-next';
import { patrolService } from '@/services/patrolService';
import { zoneService } from '@/services/zoneService';
import { authService } from '@/services/authService';

const router = useRouter();
const isMounted = ref(false);
const saving = ref(false);

const zones = ref([]);
const guards = ref([]);
const allMasterCheckpoints = ref([]);
const selectedCheckpoints = ref([]);
const showCheckpointDropdown = ref(false);
const enableAdvancedTiming = ref(false);

const showSelectCheckpointsModal = ref(false);
const checkpointSearchQuery = ref('');
const modalZoneFilter = ref('all');
const modalSelectedCpIds = ref([]);

const showAddZoneModal = ref(false);
const isSavingZone = ref(false);
const newZoneForm = ref({
  name: '',
  code: '',
  description: ''
});

const showAddGuardModal = ref(false);
const isSavingGuard = ref(false);
const newGuardForm = ref({
  first_name: '',
  last_name: '',
  phone: '',
  badge_number: '',
  email: ''
});

const isCreatingInline = ref(false);
const savingInline = ref(false);
const inlineForm = ref({
  name: '',
  zoneId: '',
  expectedOffset: 5
});

const form = ref({
  name: '',
  zoneId: '',
  startsAt: '08:00',
  repeat: 'none',
  maxDuration: 30,
  guardId: ''
});

const openAddZoneModal = () => {
  newZoneForm.value = {
    name: '',
    code: '',
    description: ''
  };
  showAddZoneModal.value = true;
};

const handleZoneSelectChange = () => {
  if (form.value.zoneId === '__NEW_ZONE__') {
    form.value.zoneId = '';
    openAddZoneModal();
  } else {
    onZoneChange();
  }
};

const submitAddZone = async () => {
  if (!newZoneForm.value.name.trim()) return;
  isSavingZone.value = true;
  try {
    const createdZone = await zoneService.createZone({
      name: newZoneForm.value.name.trim(),
      zoneName: newZoneForm.value.name.trim(),
      code: newZoneForm.value.code.trim() || undefined,
      description: newZoneForm.value.description.trim() || undefined,
      status: 'active'
    });
    
    // Add to zones list if not already present and select it
    if (!zones.value.some(z => String(z.id) === String(createdZone.id))) {
      zones.value.push(createdZone);
    }
    form.value.zoneId = createdZone.id;
    onZoneChange();
    showAddZoneModal.value = false;
  } catch (err) {
    console.error("Failed to create zone:", err);
    alert(`Failed to create zone: ${err.message || 'Unknown error'}`);
  } finally {
    isSavingZone.value = false;
  }
};

const openAddGuardModal = () => {
  newGuardForm.value = {
    first_name: '',
    last_name: '',
    phone: '',
    badge_number: '',
    email: ''
  };
  showAddGuardModal.value = true;
};

const handleGuardSelectChange = () => {
  if (form.value.guardId === '__NEW_GUARD__') {
    form.value.guardId = '';
    openAddGuardModal();
  }
};

const submitAddGuard = async () => {
  if (!newGuardForm.value.first_name || !newGuardForm.value.phone) return;
  isSavingGuard.value = true;
  try {
    const token = authService.getToken();
    const tenantId = authService.getTenantId();
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Find guard role if not already cached
    let roleId = null;
    try {
      const roleRes = await fetch(`${apiUrl}/items/roleConfigurator?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][accessType][_eq]=accessEasy&filter[_and][0][_and][2][roleName][_contains]=guard&fields[]=id`, { headers: { Authorization: `Bearer ${token}` } });
      if (roleRes.ok) {
        const roleData = await roleRes.json();
        roleId = roleData.data?.[0]?.id || null;
      }
    } catch (e) {}

    const payload = {
      first_name: newGuardForm.value.first_name.trim(),
      last_name: newGuardForm.value.last_name.trim(),
      phone: newGuardForm.value.phone.trim(),
      title: newGuardForm.value.badge_number.trim() || undefined,
      email: newGuardForm.value.email.trim() || undefined,
      tenant: tenantId,
      status: 'active'
    };
    if (roleId) {
      payload.accesseasyRole = roleId;
    }

    let createdGuardId = null;
    let createdGuardName = `${payload.first_name} ${payload.last_name}`.trim();

    try {
      const res = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        createdGuardId = data.data?.id;
      }
    } catch (e) {
      console.warn("Backend user creation fallback:", e);
    }

    if (!createdGuardId) {
      createdGuardId = 'guard-' + Date.now();
    }

    const newGuardObj = {
      id: createdGuardId,
      name: createdGuardName || payload.phone || 'Guard',
      first_name: payload.first_name,
      last_name: payload.last_name,
      phone: payload.phone
    };

    guards.value.push(newGuardObj);
    form.value.guardId = createdGuardId;
    showAddGuardModal.value = false;
  } catch (err) {
    console.error("Failed to add guard:", err);
    alert("Failed to add guard. Please try again.");
  } finally {
    isSavingGuard.value = false;
  }
};

const openSelectCheckpointsModal = () => {
  modalZoneFilter.value = form.value.zoneId || 'all';
  checkpointSearchQuery.value = '';
  modalSelectedCpIds.value = selectedCheckpoints.value.map(c => c.id);
  showSelectCheckpointsModal.value = true;
};

const modalFilteredCheckpoints = computed(() => {
  return allMasterCheckpoints.value.filter(c => {
    // Zone filter
    if (modalZoneFilter.value !== 'all') {
      const zId = typeof c.zone === 'object' && c.zone ? c.zone.id : c.zone;
      if (String(zId) !== String(modalZoneFilter.value)) return false;
    }
    // Search filter
    if (checkpointSearchQuery.value.trim()) {
      const q = checkpointSearchQuery.value.toLowerCase();
      const matchName = (c.name || '').toLowerCase().includes(q);
      const matchId = (c.checkpoint_id || '').toLowerCase().includes(q);
      if (!matchName && !matchId) return false;
    }
    return true;
  });
});

const toggleModalCpSelection = (cpId) => {
  const idx = modalSelectedCpIds.value.indexOf(cpId);
  if (idx > -1) {
    modalSelectedCpIds.value.splice(idx, 1);
  } else {
    modalSelectedCpIds.value.push(cpId);
  }
};

const confirmModalCpSelection = () => {
  const finalCps = [];
  modalSelectedCpIds.value.forEach((cpId, idx) => {
    const existing = selectedCheckpoints.value.find(c => c.id === cpId);
    if (existing) {
      finalCps.push(existing);
    } else {
      const found = allMasterCheckpoints.value.find(c => c.id === cpId);
      if (found) {
        finalCps.push({
          ...found,
          expectedOffset: (idx + 1) * 5
        });
      }
    }
  });

  selectedCheckpoints.value = finalCps;
  showSelectCheckpointsModal.value = false;
};

const getZoneName = (zoneId) => {
  if (!zoneId) return 'General';
  const found = zones.value.find(z => String(z.id) === String(zoneId));
  return found ? (found.zoneName || found.name) : 'Zone';
};

const openInlineCreate = () => {
  inlineForm.value = {
    name: '',
    zoneId: form.value.zoneId || (zones.value[0]?.id || ''),
    expectedOffset: (selectedCheckpoints.value.length + 1) * 5
  };
  isCreatingInline.value = true;
};

const onZoneChange = () => {
  selectedCheckpoints.value = [];
  if (form.value.zoneId) {
    const zoneCps = allMasterCheckpoints.value.filter(c => {
      const zId = typeof c.zone === 'object' && c.zone ? c.zone.id : c.zone;
      return String(zId) === String(form.value.zoneId);
    });
    
    // Auto-populate all checkpoints in this zone
    zoneCps.forEach((cp, idx) => {
      selectedCheckpoints.value.push({ 
        ...cp, 
        expectedOffset: (idx + 1) * 5 
      });
    });
  }
};

// Available Checkpoints (in selected zone & not already selected)
const availableCheckpoints = computed(() => {
  if (!form.value.zoneId) return [];
  return allMasterCheckpoints.value.filter(c => {
    const zId = typeof c.zone === 'object' && c.zone ? c.zone.id : c.zone;
    return String(zId) === String(form.value.zoneId) && !selectedCheckpoints.value.some(sel => sel.id === c.id);
  });
});

const addCheckpoint = (cp) => {
  // Give it a default expected offset based on length
  const lastOffset = selectedCheckpoints.value.length > 0 ? selectedCheckpoints.value[selectedCheckpoints.value.length - 1].expectedOffset : 0;
  selectedCheckpoints.value.push({ 
    ...cp, 
    expectedOffset: lastOffset + 5 
  });
  showCheckpointDropdown.value = false;
};

const removeCheckpoint = (idx) => {
  selectedCheckpoints.value.splice(idx, 1);
};

const createInlineCheckpoint = async () => {
  const targetZoneId = inlineForm.value.zoneId || form.value.zoneId;
  if (!inlineForm.value.name || !targetZoneId) return;
  if (!form.value.zoneId) {
    form.value.zoneId = targetZoneId;
  }
  savingInline.value = true;
  try {
    const payload = {
      name: inlineForm.value.name,
      checkpoint_id: 'CP' + Math.floor(1000 + Math.random() * 9000),
      instructions: `__ZONE_ASSIGNMENT__:${targetZoneId}`,
      status: 'active'
    };
    const updatedList = await patrolService.saveMasterCheckpoint(payload);
    
    // Checkpoint saved successfully. Find it and add to route
    if (updatedList) {
      updatedList.forEach(cp => {
        const match = cp.instructions?.match(/__ZONE_ASSIGNMENT__:(\d+)/);
        cp.zone = match ? Number(match[1]) : null;
      });
      allMasterCheckpoints.value = updatedList;
      
      const newCp = updatedList.find(c => c.name === inlineForm.value.name && c.checkpoint_id === payload.checkpoint_id);
      if (newCp) {
        addCheckpoint({ ...newCp, expectedOffset: inlineForm.value.expectedOffset });
      }
    }
    
    // Reset form
    inlineForm.value = { name: '', zoneId: '', expectedOffset: 5 };
    isCreatingInline.value = false;
  } catch (err) {
    console.error("Failed to inline create checkpoint", err);
    alert("Failed to create checkpoint. Please try again.");
  } finally {
    savingInline.value = false;
  }
};

const sortCheckpointsByTime = () => {
  selectedCheckpoints.value.sort((a, b) => (a.expectedOffset || 0) - (b.expectedOffset || 0));
};

// --- DRAG AND DROP ---
const dragIndex = ref(null);

const onDragStart = (e, index) => {
  dragIndex.value = index;
  e.dataTransfer.effectAllowed = 'move';
};

const onDragOver = (e) => {
  e.preventDefault();
};

const onDrop = (e, dropIndex) => {
  e.preventDefault();
  if (dragIndex.value !== null && dragIndex.value !== dropIndex) {
    const item = selectedCheckpoints.value.splice(dragIndex.value, 1)[0];
    selectedCheckpoints.value.splice(dropIndex, 0, item);
  }
  dragIndex.value = null;
};

// --- TIMELINE COMPUTATIONS ---

const formatAMPM = (timeStr) => {
  if (!timeStr) return '';
  let [h, m] = timeStr.split(':');
  h = parseInt(h);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
};

const addMinutesToTime = (timeStr, minutes) => {
  if (!timeStr) return '';
  let [h, m] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(h), parseInt(m), 0);
  date.setMinutes(date.getMinutes() + parseInt(minutes || 0));
  const hr = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return formatAMPM(`${hr}:${min}`);
};

const previewTimeline = computed(() => {
  return selectedCheckpoints.value.map(cp => ({
    id: cp.id,
    name: cp.name,
    offset: cp.expectedOffset || 0,
    computedTime: addMinutesToTime(form.value.startsAt, cp.expectedOffset || 0)
  }));
});

const computeEndTime = computed(() => {
  return addMinutesToTime(form.value.startsAt, form.value.maxDuration || 0);
});

// --- SUBMIT ---

const generateTimings = () => {
  if (form.value.repeat === 'none') return [form.value.startsAt];
  
  const interval = parseInt(form.value.repeat);
  const timings = [];
  let [h, m] = form.value.startsAt.split(':').map(Number);
  
  for(let i=0; i<24; i+=interval) {
    let newH = (h + i) % 24;
    timings.push(`${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  }
  // Sort and remove duplicates if any
  return [...new Set(timings)].sort();
};

const submit = async () => {
  if (!form.value.name.trim()) return alert('Please enter a Patrol Name');
  if (!form.value.zoneId) return alert('Please select a Zone');
  if (selectedCheckpoints.value.length === 0) return alert('Please select at least one Checkpoint');
  
  saving.value = true;
  try {
    // 1. Create a Checkpoint Group representing the route configuration
    const group = await patrolService.createCheckpointGroup({
      name: form.value.name.trim(),
      zone_id: form.value.zoneId,
      frequency: form.value.repeat === 'none' ? 'custom' : `every_${form.value.repeat}h`,
      grace_period: 15 // static grace period buffer
    });

    // 2. Clone and save checkpoints to this new group in order
    for (let index = 0; index < selectedCheckpoints.value.length; index++) {
      const originalCp = selectedCheckpoints.value[index];
      const clone = {
        name: originalCp.name,
        checkpoint_id: originalCp.checkpoint_id || originalCp.id,
        building_id: originalCp.building_id,
        floor: originalCp.floor,
        dwell_time: enableAdvancedTiming.value ? (originalCp.expectedOffset || 0) : 0,
        nfc_uid: originalCp.nfc_uid,
        status: 'pending',
        sort_order: index,
        zone: form.value.zoneId,
        latitude: originalCp.latitude || null,
        longitude: originalCp.longitude || null,
        x: originalCp.x || 0,
        y: originalCp.y || 0
      };
      await patrolService.saveCheckpoint(group.id, clone);
    }

    // 3. Generate patrol rounds based on repeat
    const timings = generateTimings();
    const todayStr = new Date().toISOString().split('T')[0];
    const z = zones.value.find(z => z.id === form.value.zoneId);

    for (const time of timings) {
      const scheduledTimeStr = `${todayStr}T${time}:00`;
      
      const payload = {
        zoneId: form.value.zoneId,
        zoneName: z?.zoneName || z?.name || 'Security Zone',
        groupId: group.id,
        routeName: form.value.name.trim(),
        guardId: form.value.guardId || null,
        guardName: form.value.guardId
          ? (guards.value.find(g => g.id === form.value.guardId)?.name || 'Assigned Guard')
          : 'Unassigned',
        date: todayStr,
        scheduledTime: scheduledTimeStr,
        status: 'scheduled',
        allowed_delay: form.value.maxDuration, // use max duration as allowed delay boundary
        qr_support: true
      };

      await patrolService.createPatrol(payload);
    }

    router.push('/dashboard/patrols');
  } catch (err) {
    alert(`Failed to save patrol plan: ${err.message}`);
  } finally {
    saving.value = false;
  }
};

// --- INIT ---

onMounted(async () => {
  isMounted.value = true;
  
  const token = authService.getToken();
  const tenantId = authService.getTenantId();
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Fetch Zones
  try {
    const fetchedZones = await zoneService.fetchZones();
    zones.value = fetchedZones || [];
  } catch (e) { console.error('Failed to fetch zones:', e); }

  // Fetch Master Checkpoints
  try {
    const list = await patrolService.getMasterCheckpoints();
    if (list) {
      list.forEach(cp => {
        const match = cp.instructions?.match(/__ZONE_ASSIGNMENT__:(\d+)/);
        cp.zone = match ? match[1] : cp.zone;
      });
    }
    allMasterCheckpoints.value = list || [];
  } catch (e) { console.error(e); }

  // Fetch Guards
  try {
    const roleRes = await fetch(`${apiUrl}/items/roleConfigurator?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][accessType][_eq]=accessEasy&filter[_and][0][_and][2][roleName][_contains]=guard&fields[]=id`, { headers: { Authorization: `Bearer ${token}` } });
    let guardRoleId = null;
    if (roleRes.ok) {
      const roleData = await roleRes.json();
      guardRoleId = roleData.data?.[0]?.id || null;
    }

    let filterStr = `filter[tenant][_eq]=${tenantId}`;
    if (guardRoleId) filterStr += `&filter[accesseasyRole][_eq]=${guardRoleId}`;

    const res = await fetch(`${apiUrl}/users?${filterStr}&fields[]=id&fields[]=first_name&fields[]=last_name&fields[]=phone`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      guards.value = (data.data || []).map(u => ({
        id: u.id,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.phone || 'Guard'
      }));
    }
  } catch (e) { console.error('Failed to fetch guards:', e); }
  
  // Global click handler to close checkpoint dropdown
  window.addEventListener('click', closeDropdowns);
});

const closeDropdowns = (e) => {
  if (!e.target.closest('.relative')) {
    showCheckpointDropdown.value = false;
  }
};

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns);
});
</script>
