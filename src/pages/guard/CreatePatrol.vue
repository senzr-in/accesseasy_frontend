<template>
  <div class="h-full flex flex-col bg-[#FAFAFA] dark:bg-[#0b0f19] overflow-auto custom-scrollbar">
    <!-- Sticky Top Header: ALWAYS VISIBLE WITHOUT SCROLLING -->
    <header class="sticky top-0 z-40 bg-[#FAFAFA]/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs shrink-0">
      <div class="max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            @click="$router.push('/dashboard/patrols')"
            title="Back to Patrols"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <div>
            <h1 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight flex items-center gap-2">
              <span>Create New Patrol</span>
              <span v-if="saving" class="text-xs font-semibold text-indigo-600 animate-pulse">Saving...</span>
            </h1>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Set up your patrol route, timing & interactive checkpoints map
            </p>
          </div>
        </div>

        <!-- Action Buttons in Header: ALWAYS VISIBLE WITHOUT SCROLLING -->
        <div class="flex items-center gap-2.5">
          <button 
            type="button"
            class="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700" 
            @click="$router.push('/dashboard/patrols')"
          >
            Cancel
          </button>
          <button 
            type="button"
            class="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="submit"
            :disabled="saving"
          >
            <Check class="w-4 h-4 stroke-[2.5]" />
            <span>{{ saving ? 'Saving Patrol...' : 'Save Patrol' }}</span>
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-[1600px] mx-auto w-full px-4 sm:px-6 pb-8 flex flex-col xl:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <!-- Left Column: Form -->
      <div class="flex-1 min-w-0 space-y-6">

        <!-- Step 1: Settings -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Patrol Configuration</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <!-- Site Selection -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Site <span class="text-rose-500">*</span></label>
                <button
                  type="button"
                  @click="openAddSiteModal"
                  class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  + New Site
                </button>
              </div>
              <select
                v-model="form.siteId"
                @change="handleSiteSelectChange"
                class="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              >
                <option value="">All Sites (Global)</option>
                <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.name || s.locName }}</option>
                <option value="__NEW_SITE__" class="font-bold text-indigo-600">+ Create New Site...</option>
              </select>
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
                <option v-for="z in filteredZones" :key="z.id" :value="z.id">{{ z.zoneName || z.name }}</option>
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
                <span>Maximum Patrol Duration</span>
                <span class="text-[10px] text-slate-400 font-normal">(Used to detect delays)</span>
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="form.maxDuration"
                  type="number"
                  min="5"
                  class="w-20 text-center text-sm font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <span class="text-xs font-bold text-slate-500">Minutes</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Checkpoints -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
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
          <div v-if="selectedCheckpoints.length === 0 && !isCreatingInline" class="text-center py-4 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30">
            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">
              No checkpoints added to this patrol route yet
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5">
              Select existing checkpoints from your property library or click <span class="font-bold text-indigo-600 dark:text-indigo-400">+ Pin on Map</span>.
            </p>
            <div class="flex items-center gap-2 mt-2.5">
              <button 
                type="button"
                class="h-7 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                @click="openSelectCheckpointsModal"
              >
                <ListFilter class="w-3 h-3" />
                <span>Select from Library</span>
              </button>
              <button 
                type="button"
                class="h-7 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                @click="openInlineCreate"
              >
                <Plus class="w-3 h-3 text-indigo-500" />
                <span>Create New Checkpoint</span>
              </button>
            </div>
          </div>

          <!-- ── Add Checkpoint Modal Dialog ── -->
          <Teleport to="body">
            <div
              v-if="isCreatingInline"
              class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            >
              <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 w-full max-w-md overflow-hidden flex flex-col">
                <!-- Modal Header -->
                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                    <MapPin class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>ADD CHECKPOINT</span>
                  </h3>
                  <button
                    class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                    @click="isCreatingInline = false"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>

                <!-- Form Area -->
                <div class="p-6 space-y-4 text-left max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Checkpoint Name *</label>
                    <input
                      v-model="inlineForm.name"
                      type="text"
                      class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 shadow-sm"
                      placeholder="e.g. Server Room Entrance"
                      required
                    />
                  </div>

                  <!-- Zone Assignment -->
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Zone Assignment *</label>
                      <button
                        type="button"
                        @click="openAddZoneModal"
                        class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        + New Zone
                      </button>
                    </div>
                    <select
                      v-model="inlineForm.zoneId"
                      @change="handleInlineZoneChange"
                      class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 shadow-sm"
                      required
                    >
                      <option value="" disabled>Select target zone...</option>
                      <option
                        v-for="zone in zones"
                        :key="zone.id"
                        :value="zone.id"
                      >
                        {{ zone.zoneName || zone.name }}
                      </option>
                      <option value="__NEW_ZONE__" class="font-bold text-indigo-600">+ Create New Zone...</option>
                    </select>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Building</label>
                      <input
                        v-model="inlineForm.building"
                        type="text"
                        class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 shadow-sm"
                        placeholder="e.g. Tower B"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Floor</label>
                      <input
                        v-model="inlineForm.floor"
                        type="text"
                        class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 shadow-sm"
                        placeholder="e.g. 2nd Floor"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Dwell Time (Minutes)</label>
                      <input
                        v-model.number="inlineForm.dwell_time"
                        type="number"
                        min="0"
                        class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 shadow-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                      <button
                        type="button"
                        class="w-full h-10 rounded-xl border flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs font-bold"
                        :class="inlineForm.status !== 'inactive' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'"
                        @click="inlineForm.status = inlineForm.status !== 'inactive' ? 'inactive' : 'active'"
                      >
                        <span class="w-2 h-2 rounded-full" :class="inlineForm.status !== 'inactive' ? 'bg-emerald-500' : 'bg-slate-400'" />
                        {{ inlineForm.status !== 'inactive' ? 'Active' : 'Inactive' }}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Verification Method</label>
                    <div class="grid grid-cols-3 gap-2 mb-3">
                      <button
                        type="button"
                        class="p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                        :class="inlineForm.type === 'qr' ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'"
                        @click="inlineForm.type = 'qr'"
                      >
                        <QrCode class="w-4 h-4 text-purple-600" />
                        <span>QR Code</span>
                      </button>
                      <button
                        type="button"
                        class="p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                        :class="inlineForm.type === 'nfc' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'"
                        @click="inlineForm.type = 'nfc'"
                      >
                        <Radio class="w-4 h-4 text-blue-600" />
                        <span>NFC Tag</span>
                      </button>
                      <button
                        type="button"
                        class="p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                        :class="inlineForm.type === 'gps' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'"
                        @click="inlineForm.type = 'gps'"
                      >
                        <Navigation class="w-4 h-4 text-emerald-600" />
                        <span>GPS Geofence</span>
                      </button>
                    </div>

                    <div v-if="inlineForm.type === 'nfc'">
                      <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">NFC Hardware Tag UID *</label>
                      <input
                        v-model="inlineForm.nfc_tag_id"
                        type="text"
                        class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 shadow-sm font-mono"
                        placeholder="e.g. 04:A2:3E:C5"
                      />
                    </div>
                    <div v-else-if="inlineForm.type === 'qr'">
                      <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">QR Code Value / Identifier (Optional)</label>
                      <input
                        v-model="inlineForm.qr_code"
                        type="text"
                        class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 shadow-sm font-mono"
                        placeholder="Leave blank to auto-generate"
                      />
                    </div>
                    <div v-else-if="inlineForm.type === 'gps'" class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Latitude</label>
                        <input
                          v-model.number="inlineForm.latitude"
                          type="number"
                          step="any"
                          class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 shadow-sm font-mono"
                          placeholder="e.g. 13.0827"
                        />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Longitude</label>
                        <input
                          v-model.number="inlineForm.longitude"
                          type="number"
                          step="any"
                          class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 shadow-sm font-mono"
                          placeholder="e.g. 80.2707"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Expected Within (Minutes From Patrol Start)</label>
                    <input
                      v-model.number="inlineForm.expectedOffset"
                      type="number"
                      min="0"
                      class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 shadow-sm font-semibold"
                      placeholder="5"
                    />
                  </div>
                </div>

                <!-- Modal Footer -->
                <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    class="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    @click="isCreatingInline = false"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    :disabled="savingInline || !inlineForm.name"
                    @click="createInlineCheckpoint"
                  >
                    <span v-if="savingInline">Saving...</span>
                    <span v-else>Save Checkpoint</span>
                  </button>
                </div>
              </div>
            </div>
          </Teleport>

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
              <!-- Stop Number Badge & Drag Handle -->
              <div class="flex items-center gap-2">
                <div class="cursor-grab hover:text-indigo-600 text-slate-300 dark:text-slate-600" title="Drag to reorder">
                  <GripVertical class="w-5 h-5" />
                </div>
                
                <div 
                  class="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0"
                  :class="index === 0 ? 'bg-emerald-600' : (index === selectedCheckpoints.length - 1 && selectedCheckpoints.length > 1 ? 'bg-amber-500' : 'bg-indigo-600')"
                  :title="`Stop #${index + 1}`"
                >
                  {{ index + 1 }}
                </div>

                <div class="flex flex-col gap-0.5">
                  <button
                    type="button"
                    class="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 cursor-pointer"
                    :disabled="index === 0"
                    title="Move Up"
                    @click.stop="moveCheckpointUp(index)"
                  >
                    <ChevronUp class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    class="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 cursor-pointer"
                    :disabled="index === selectedCheckpoints.length - 1"
                    title="Move Down"
                    @click.stop="moveCheckpointDown(index)"
                  >
                    <ChevronDown class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div class="flex-1 flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Radio v-if="getCheckpointTypeInfo(cp).icon === 'nfc'" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <QrCode v-else-if="getCheckpointTypeInfo(cp).icon === 'qr'" class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <Navigation v-else-if="getCheckpointTypeInfo(cp).icon === 'gps'" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <MapPin v-else class="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ cp.name }}</span>
                    <span 
                      class="text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1"
                      :class="getCheckpointTypeInfo(cp).colorClass"
                    >
                      {{ getCheckpointTypeInfo(cp).label }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1 rounded">{{ cp.checkpoint_id || 'CP-AUTO' }}</span>
                    <span v-if="cp.zone" class="text-[10px] text-slate-400">{{ getZoneName(cp.zone) }}</span>
                    <span v-if="cp.nfc_tag_id" class="text-[10px] font-mono text-slate-400">UID: {{ cp.nfc_tag_id }}</span>
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

              <!-- Locate on Map Button -->
              <button
                type="button"
                class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                title="Locate pin on Tactical Map"
                @click="focusCheckpointOnMap(cp, index)"
              >
                <MapPin class="w-4 h-4" />
              </button>

              <button class="w-8 h-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-300 hover:text-rose-500 transition-colors flex items-center justify-center ml-1 cursor-pointer" @click="removeCheckpoint(index)">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Info class="w-3.5 h-3.5" />
            <span>Time targets are counted in minutes from patrol departure.</span>
          </div>
        </div>

        <!-- Step 3: Assign Guard -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</div>
              <h2 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Assign Guard</span>
                <span class="text-slate-400 font-normal text-xs">(Optional)</span>
              </h2>
            </div>
            <button 
              type="button"
              class="h-7 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
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
                class="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              >
                <option value="">👤 Unassigned</option>
                <option v-for="g in guards" :key="g.id" :value="g.id">👤 {{ g.name }}</option>
                <option value="__NEW_GUARD__" class="font-bold text-indigo-600">+ Add New Guard...</option>
              </select>
            </div>

            <p v-if="guards.length === 0" class="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
              <Info class="w-3.5 h-3.5 shrink-0" />
              <span>No guards found yet. Can leave as Unassigned.</span>
            </p>
          </div>
        </div>

      </div>

      <!-- Right Column: Interactive Route Tactical Map & Timeline -->
      <div class="w-full xl:w-[480px] 2xl:w-[520px] shrink-0 flex flex-col gap-4">
        
        <!-- Interactive Patrol Route Map Card -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden flex flex-col">
          <!-- Card Header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Navigation class="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Patrol Route Map</span>
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    Live Route
                  </span>
                </h3>
                <p class="text-[10px] text-slate-500 dark:text-slate-400">
                  Interactive sequence & GPS corridor
                </p>
              </div>
            </div>

            <!-- Map Controls -->
            <div class="flex items-center gap-1.5">
              <!-- Street / Satellite Layer Switcher -->
              <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                <button
                  type="button"
                  class="px-2 py-0.5 rounded transition-all cursor-pointer"
                  :class="mapStyle === 'street' ? 'bg-white dark:bg-[#151c2c] text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'"
                  @click="setMapStyle('street')"
                >
                  Street
                </button>
                <button
                  type="button"
                  class="px-2 py-0.5 rounded transition-all cursor-pointer"
                  :class="mapStyle === 'satellite' ? 'bg-white dark:bg-[#151c2c] text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'"
                  @click="setMapStyle('satellite')"
                >
                  Satellite
                </button>
              </div>

              <!-- Fit Route Button -->
              <button
                type="button"
                class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                title="Fit Route to Screen"
                @click="fitRouteBounds"
              >
                <Maximize2 class="w-3 h-3" />
              </button>
            </div>
          </div>

          <!-- Map Viewport -->
          <div class="relative w-full h-[260px] sm:h-[280px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
            <div id="patrol-route-map" class="w-full h-full"></div>

            <!-- Floating Top Helper Tag -->
            <div class="absolute top-3 left-3 z-[400] flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold shadow-md border border-white/10 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{{ selectedCheckpoints.length }} Waypoints Active</span>
              </span>
            </div>

            <!-- Floating Map Pin Add Tool -->
            <div class="absolute top-3 right-3 z-[400]">
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg backdrop-blur-md text-[10px] font-bold shadow-md border flex items-center gap-1.5 transition-all cursor-pointer"
                :class="isMapAddMode ? 'bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-400/50' : 'bg-slate-900/80 text-white border-white/10 hover:bg-slate-800'"
                @click="toggleMapAddMode"
                title="Click anywhere on the map to place a checkpoint"
              >
                <MapPin class="w-3 h-3 text-indigo-400" />
                <span>{{ isMapAddMode ? 'Click Map to Place' : '+ Pin on Map' }}</span>
              </button>
            </div>

            <!-- Bottom Floating Legend -->
            <div class="absolute bottom-2 left-2 right-2 z-[400] flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/75 backdrop-blur-md text-[10px] font-semibold text-slate-200 border border-white/10">
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-indigo-600 border border-white flex items-center justify-center text-[7px] text-white font-black">1</span>
                  <span>In Route</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center text-[7px] text-slate-300 font-bold">+</span>
                  <span>Click to Add</span>
                </div>
              </div>
              <div class="text-[9px] text-slate-400 hidden sm:block">
                Drag pins to adjust GPS
              </div>
            </div>
          </div>

          <!-- Real-Time Route Telemetry Deck -->
          <div class="mt-4 grid grid-cols-3 gap-2.5">
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stops</span>
              <span class="text-sm font-black text-slate-900 dark:text-white">
                {{ selectedCheckpoints.length }} <span class="text-[10px] font-semibold text-slate-400">stops</span>
              </span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distance</span>
              <span class="text-sm font-black text-slate-900 dark:text-white">
                {{ formattedRouteDistance }}
              </span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Time</span>
              <span class="text-sm font-black text-slate-900 dark:text-white">
                ~{{ estimatedWalkingTimeMin }} <span class="text-[10px] font-semibold text-slate-400">min</span>
              </span>
            </div>
          </div>

          <!-- Route Feasibility Status Banner -->
          <div class="mt-3 p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border"
            :class="isRouteFeasible 
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20' 
              : 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/20'"
          >
            <div class="flex items-center gap-2">
              <Check v-if="isRouteFeasible" class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <AlertCircle v-else class="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span v-if="isRouteFeasible">
                Feasible route: easily fits within {{ form.maxDuration }} min allowance.
              </span>
              <span v-else>
                Warning: Estimated walking time (~{{ estimatedWalkingTimeMin }}m) exceeds max patrol duration ({{ form.maxDuration }}m).
              </span>
            </div>
          </div>
        </div>

        <!-- Expected Timeline Preview Card -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock class="w-4 h-4 text-indigo-500" />
              <span>Route Timeline & Schedule</span>
            </h3>
            <span class="text-[10px] font-bold text-slate-400">
              Total: {{ form.maxDuration }}m Max
            </span>
          </div>

          <div class="relative">
            <!-- Connecting Vertical Line -->
            <div class="absolute left-[11px] top-4 bottom-8 w-0.5 border-l-2 border-dashed border-slate-200 dark:border-slate-700"></div>
            
            <div class="space-y-4 relative z-10">
              <!-- Start Item -->
              <div class="flex items-start gap-3.5">
                <div class="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-white shadow-sm ring-4 ring-white dark:ring-[#151c2c]">
                  <Play class="w-3 h-3" />
                </div>
                <div class="flex-1 flex justify-between items-center pt-0.5">
                  <div>
                    <span class="text-xs font-bold text-slate-900 dark:text-white">Patrol Departure</span>
                    <p class="text-[10px] text-slate-400">Guard initiates tour</p>
                  </div>
                  <span class="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-500/20">
                    {{ formatAMPM(form.startsAt) }}
                  </span>
                </div>
              </div>

              <!-- Checkpoints with leg distance -->
              <div v-for="(cp, idx) in previewTimeline" :key="cp.id" class="flex items-start gap-3.5 group">
                <div 
                  class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-black ring-4 ring-white dark:ring-[#151c2c] cursor-pointer"
                  :class="idx === 0 ? 'bg-emerald-600' : (idx === previewTimeline.length - 1 && previewTimeline.length > 1 ? 'bg-amber-500' : 'bg-indigo-600')"
                  @click="focusCheckpointOnMap(selectedCheckpoints[idx], idx)"
                  title="Focus on Map"
                >
                  {{ idx + 1 }}
                </div>
                <div class="flex-1 pt-0.5">
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{{ cp.name }}</span>
                    <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">
                      {{ cp.computedTime }} (+{{ cp.offset }}m)
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>{{ getLegInfo(idx) }}</span>
                    <button
                      type="button"
                      class="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      @click="focusCheckpointOnMap(selectedCheckpoints[idx], idx)"
                    >
                      <MapPin class="w-3 h-3" />
                      <span>Map</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- End Item -->
              <div class="flex items-start gap-3.5">
                <div class="w-6 h-6 rounded-full bg-white dark:bg-[#151c2c] border-2 border-emerald-500 flex items-center justify-center shrink-0 text-emerald-500 ring-4 ring-white dark:ring-[#151c2c]">
                  <Check class="w-3.5 h-3.5" />
                </div>
                <div class="flex-1 flex justify-between items-center pt-0.5">
                  <div>
                    <p class="text-xs font-bold text-slate-900 dark:text-white">Patrol Target Completion</p>
                    <p class="text-[10px] text-slate-400">Must complete within {{ form.maxDuration }} min</p>
                  </div>
                  <span class="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {{ computeEndTime }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Collapsible Timing Rules Guide -->
        <div class="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <button
            type="button"
            class="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            @click="showTimingGuide = !showTimingGuide"
          >
            <div class="flex items-center gap-2">
              <Info class="w-4 h-4 text-indigo-500" />
              <span>How does timing & delay detection work?</span>
            </div>
            <ChevronDown class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': showTimingGuide }" />
          </button>

          <div v-if="showTimingGuide" class="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 text-xs space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
            <div class="flex gap-2.5 items-start mt-3">
              <div class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 text-[10px] font-bold">1</div>
              <p class="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                <strong class="text-slate-800 dark:text-slate-200">Relative Time Targets:</strong> You only specify expected minutes from patrol start time.
              </p>
            </div>
            <div class="flex gap-2.5 items-start">
              <div class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center shrink-0 text-[10px] font-bold">2</div>
              <p class="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                <strong class="text-slate-800 dark:text-slate-200">Automatic Recalculation:</strong> If patrol starts at {{ formatAMPM(form.startsAt) }}, all checkpoint scan deadlines dynamically sync.
              </p>
            </div>
            <div class="flex gap-2.5 items-start">
              <div class="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 flex items-center justify-center shrink-0 text-[10px] font-bold">3</div>
              <p class="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                <strong class="text-slate-800 dark:text-slate-200">Delay Alerts:</strong> When a guard exceeds a checkpoint's time window, an operational delay exception is logged in real-time.
              </p>
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
                <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Radio v-if="getCheckpointTypeInfo(cp).icon === 'nfc'" class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <QrCode v-else-if="getCheckpointTypeInfo(cp).icon === 'qr'" class="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <Navigation v-else-if="getCheckpointTypeInfo(cp).icon === 'gps'" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <MapPin v-else class="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <p class="text-xs font-bold text-slate-900 dark:text-white">{{ cp.name }}</p>
                    <span 
                      class="text-[9px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-1"
                      :class="getCheckpointTypeInfo(cp).colorClass"
                    >
                      {{ getCheckpointTypeInfo(cp).label }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.2 rounded">{{ cp.checkpoint_id || 'CP-AUTO' }}</span>
                    <span class="text-[10px] text-slate-400">{{ getZoneName(cp.zone) }}</span>
                    <span v-if="cp.nfc_tag_id" class="text-[10px] font-mono text-slate-400">UID: {{ cp.nfc_tag_id }}</span>
                  </div>
                </div>
              </div>
              <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{{ getCheckpointTypeInfo(cp).label }}</span>
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

    <!-- Toast Notification -->
    <Teleport to="body">
      <transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 translate-y-2" enter-to-class="transform opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="toastMessage" class="fixed bottom-6 right-6 z-[200] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-white/10 dark:border-slate-800">
          <Check class="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{{ toastMessage }}</span>
        </div>
      </transition>
    </Teleport>

    <!-- Modal: Add New Site (Full Real Working Site Modal) -->
    <Teleport to="body">
      <div
        v-if="showAddSiteModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
        @click.self="showAddSiteModal = false"
      >
        <div class="w-full max-w-lg bg-white dark:bg-[#151c2c] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-150 my-6">
          
          <!-- Modal Header -->
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
            <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer" @click="showAddSiteModal = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="submitAddSite" class="space-y-3.5 text-xs">
            <!-- Site Name -->
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Property / Site Name *</label>
              <input
                v-model="newSiteForm.name"
                required
                placeholder="e.g. Bangalore Global Tech Campus"
                class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>

            <!-- Site Code & Address -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Site Code *</label>
                <input
                  v-model="newSiteForm.code"
                  required
                  placeholder="e.g. BGTC-01"
                  class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
              <div class="sm:col-span-2 space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Physical Address / Landmark</label>
                <input
                  v-model="newSiteForm.address"
                  placeholder="e.g. OMR IT Highway, Chennai"
                  class="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500 shadow-sm"
                />
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
                    v-model.number="newSiteForm.latitude"
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
                    v-model.number="newSiteForm.longitude"
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
                  <span>Advanced Settings (Geofence Radius & Rules)</span>
                </div>
                <ChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': showAdvancedSettings }" />
              </button>

              <div v-if="showAdvancedSettings" class="p-4 space-y-3 bg-white dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-700">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="font-bold text-slate-700 dark:text-slate-300">Geofence Radius (Meters)</label>
                    <input
                      v-model.number="newSiteForm.geofence_radius"
                      type="number"
                      min="50"
                      max="10000"
                      placeholder="500"
                      class="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500"
                    />
                    <p class="text-[10px] text-slate-400">Allowed patrol scan boundary around property</p>
                  </div>
                  <div class="space-y-1">
                    <label class="font-bold text-slate-700 dark:text-slate-300">Site Status</label>
                    <select
                      v-model="newSiteForm.status"
                      class="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showAddSiteModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                :disabled="isSavingSite || !newSiteForm.name.trim()"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>{{ isSavingSite ? 'Creating...' : 'Create & Select Site' }}</span>
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
            <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer" @click="showMapPickerModal = false">
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
                class="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            <button
              type="button"
              class="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
              :disabled="isSearchingLocation"
              @click="searchLocation"
            >
              <Search class="w-3.5 h-3.5" />
              <span>{{ isSearchingLocation ? 'Searching...' : 'Search' }}</span>
            </button>
          </div>

          <!-- Quick Jump Popular Cities -->
          <div class="flex items-center gap-1.5 mb-3 flex-wrap shrink-0">
            <span class="text-[10px] font-bold text-slate-400 uppercase">Quick Jump:</span>
            <button
              v-for="c in [
                { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
                { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
                { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
                { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
                { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 }
              ]"
              :key="c.name"
              type="button"
              class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 text-[10px] font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              @click="jumpToLocation(c.lat, c.lng, c.name)"
            >
              {{ c.name }}
            </button>
          </div>

          <!-- Leaflet Interactive Map Canvas -->
          <div class="w-full flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative min-h-[320px] bg-slate-100 dark:bg-slate-900">
            <div id="leaflet-create-patrol-picker-map" class="w-full h-full" style="min-height: 320px;"></div>
            
            <div class="absolute top-2 left-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-200 z-[400] flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Click or drag pin to position property center</span>
            </div>
          </div>

          <!-- Current Selected Location Info -->
          <div class="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shrink-0">
            <div class="flex items-center gap-2">
              <MapPin class="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <div class="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Lat: {{ tempCoords.lat }}, Lng: {{ tempCoords.lng }}
                </div>
                <div v-if="tempAddress" class="text-[10px] text-slate-500 truncate max-w-md">
                  {{ tempAddress }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                class="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showMapPickerModal = false"
              >
                Cancel
              </button>
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  ShieldPlus, GripVertical, Trash2, Info, Clock, 
  Plus, ArrowDown, AlertCircle, Play, Check, MapPin, ArrowLeft,
  ListFilter, Search, X, UserPlus, Layers, QrCode, Radio, Navigation,
  Building2, SlidersHorizontal, ChevronDown, ChevronUp, Map as MapIcon,
  Maximize2
} from 'lucide-vue-next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { patrolService } from '@/services/patrolService';
import { zoneService } from '@/services/zoneService';
import { siteService } from '@/services/siteService';
import { authService } from '@/services/authService';
import { subscriptionService } from '@/services/subscriptionService';
import { toast } from '@/stores/useToastStore';

const router = useRouter();
const isMounted = ref(false);
const saving = ref(false);
const toastMessage = ref('');
let toastTimer = null;

// Tactical Patrol Route Map State
const mapStyle = ref('street'); // 'street' | 'satellite'
const isMapAddMode = ref(false);
const showTimingGuide = ref(false);

let routeMap = null;
let routeMarkersLayer = null;
let routeGlowLineLayer = null;
let routeLineLayer = null;
let siteGeofenceCircle = null;
let activeTileLayer = null;

const showToast = (msg) => {
  toastMessage.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMessage.value = '';
  }, 3500);
};

const sites = ref([]);
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

// Real Working Site Modal State
const showAddSiteModal = ref(false);
const isSavingSite = ref(false);
const showAdvancedSettings = ref(false);
const showMapPickerModal = ref(false);
const locationSearchQuery = ref('');
const isSearchingLocation = ref(false);
const tempCoords = ref({ lat: 12.9716, lng: 80.2435 });
const tempAddress = ref('');
let leafletMapInstance = null;
let leafletMarkerInstance = null;
let leafletCircleInstance = null;

const newSiteForm = ref({
  name: '',
  code: '',
  address: '',
  latitude: 12.9716,
  longitude: 80.2435,
  geofence_radius: 500,
  status: 'active'
});

const openMapPickerModal = () => {
  tempCoords.value = {
    lat: newSiteForm.value.latitude || 12.9716,
    lng: newSiteForm.value.longitude || 80.2435
  };
  tempAddress.value = newSiteForm.value.address || '';
  showMapPickerModal.value = true;
  nextTick(() => {
    setTimeout(initLeafletMap, 150);
  });
};

const initLeafletMap = () => {
  const container = document.getElementById('leaflet-create-patrol-picker-map');
  if (!container) return;

  if (leafletMapInstance) {
    leafletMapInstance.remove();
    leafletMapInstance = null;
  }

  const initialLat = tempCoords.value.lat || 12.9716;
  const initialLng = tempCoords.value.lng || 80.2435;

  leafletMapInstance = L.map('leaflet-create-patrol-picker-map', {
    center: [initialLat, initialLng],
    zoom: 15,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(leafletMapInstance);

  const pinIcon = L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="position: relative; top: -34px; left: -17px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
        <div style="background-color: #4f46e5; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2.5px solid #ffffff;">
          <div style="transform: rotate(45deg); width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
        </div>
      </div>
    `,
    iconSize: [0, 0]
  });

  leafletMarkerInstance = L.marker([initialLat, initialLng], {
    icon: pinIcon,
    draggable: true
  }).addTo(leafletMapInstance);

  const radius = Number(newSiteForm.value.geofence_radius) || 500;
  leafletCircleInstance = L.circle([initialLat, initialLng], {
    radius: radius,
    color: '#4f46e5',
    fillColor: '#4f46e5',
    fillOpacity: 0.15,
    weight: 2
  }).addTo(leafletMapInstance);

  leafletMarkerInstance.on('dragend', (e) => {
    const pos = e.target.getLatLng();
    updateTempLocation(pos.lat, pos.lng);
  });

  leafletMapInstance.on('click', (e) => {
    updateTempLocation(e.latlng.lat, e.latlng.lng);
  });

  leafletMapInstance.invalidateSize();
  setTimeout(() => {
    if (leafletMapInstance) leafletMapInstance.invalidateSize();
  }, 200);
  setTimeout(() => {
    if (leafletMapInstance) leafletMapInstance.invalidateSize();
  }, 450);
};

const updateTempLocation = (lat, lng) => {
  const cleanLat = parseFloat(lat.toFixed(6));
  const cleanLng = parseFloat(lng.toFixed(6));
  tempCoords.value = { lat: cleanLat, lng: cleanLng };

  if (leafletMarkerInstance) {
    leafletMarkerInstance.setLatLng([cleanLat, cleanLng]);
  }
  if (leafletCircleInstance) {
    leafletCircleInstance.setLatLng([cleanLat, cleanLng]);
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
      if (leafletMapInstance && leafletMarkerInstance && leafletCircleInstance) {
        leafletMarkerInstance.setLatLng([lat, lng]);
        leafletCircleInstance.setLatLng([lat, lng]);
        leafletMapInstance.setView([lat, lng], 16);
      }
    } else {
      showToast(`Location "${locationSearchQuery.value}" not found`);
    }
  } catch (e) {
    isSearchingLocation.value = false;
  }
};

const jumpToLocation = (lat, lng, cityName) => {
  tempCoords.value = { lat, lng };
  tempAddress.value = cityName;
  if (leafletMapInstance && leafletMarkerInstance && leafletCircleInstance) {
    leafletMarkerInstance.setLatLng([lat, lng]);
    leafletCircleInstance.setLatLng([lat, lng]);
    leafletMapInstance.setView([lat, lng], 15);
  }
};

const confirmLocationSelection = () => {
  newSiteForm.value.latitude = tempCoords.value.lat;
  newSiteForm.value.longitude = tempCoords.value.lng;
  if (tempAddress.value && (!newSiteForm.value.address || newSiteForm.value.address.length < 5)) {
    newSiteForm.value.address = tempAddress.value;
  }
  showMapPickerModal.value = false;
};

const submitAddSite = async () => {
  if (!newSiteForm.value.name.trim()) return;
  isSavingSite.value = true;
  try {
    const created = await siteService.createSite({
      name: newSiteForm.value.name.trim(),
      locName: newSiteForm.value.name.trim(),
      code: newSiteForm.value.code.trim() || `SITE-${Math.floor(100 + Math.random() * 900)}`,
      address: newSiteForm.value.address.trim() || 'Chennai, TN',
      locAddress: newSiteForm.value.address.trim() || 'Chennai, TN',
      latitude: newSiteForm.value.latitude || 12.9716,
      longitude: newSiteForm.value.longitude || 80.2435,
      geofence_radius: newSiteForm.value.geofence_radius || 500,
      status: newSiteForm.value.status || 'active'
    });
    if (created) {
      if (!sites.value.some(s => String(s.id) === String(created.id))) {
        sites.value.push(created);
      }
      form.value.siteId = created.id;
      showToast(`Site "${created.name}" created successfully!`);
    }
    showAddSiteModal.value = false;
    newSiteForm.value = {
      name: '',
      code: '',
      address: '',
      latitude: 12.9716,
      longitude: 80.2435,
      geofence_radius: 500,
      status: 'active'
    };
  } catch (err) {
    console.error("Failed to create site:", err);
    showToast(`Failed to create site: ${err.message || 'Error'}`);
  } finally {
    isSavingSite.value = false;
  }
};

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
  type: 'qr',
  zoneId: '',
  building: '',
  floor: '',
  dwell_time: 0,
  status: 'active',
  nfc_tag_id: '',
  qr_code: '',
  latitude: null,
  longitude: null,
  expectedOffset: 5
});

const getCheckpointTypeInfo = (cp) => {
  const typeStr = (cp?.type || '').toLowerCase();
  if (cp?.nfc_tag_id || typeStr === 'nfc') {
    return {
      label: 'NFC Tag',
      colorClass: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
      icon: 'nfc'
    };
  }
  if (cp?.qr_code || typeStr === 'qr' || typeStr.includes('qr')) {
    return {
      label: 'QR Code',
      colorClass: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
      icon: 'qr'
    };
  }
  if ((cp?.latitude && cp?.longitude) || typeStr === 'gps' || typeStr === 'geofence') {
    return {
      label: 'GPS Geofence',
      colorClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
      icon: 'gps'
    };
  }
  return {
    label: cp?.type || 'QR Code',
    colorClass: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    icon: 'qr'
  };
};

const form = ref({
  name: '',
  siteId: '',
  zoneId: '',
  startsAt: '08:00',
  repeat: 'none',
  maxDuration: 30,
  guardId: ''
});

const filteredZones = computed(() => {
  if (!form.value.siteId) return zones.value;
  return zones.value.filter(z => !z.site || String(z.site) === String(form.value.siteId));
});

const handleSiteSelectChange = async () => {
  if (form.value.siteId === '__NEW_SITE__') {
    form.value.siteId = '';
    showAddSiteModal.value = true;
    return;
  }
  form.value.zoneId = '';
  selectedCheckpoints.value = [];
  try {
    const fetchedZones = await zoneService.fetchZones(form.value.siteId || null);
    if (fetchedZones) zones.value = fetchedZones;
  } catch (e) {}
};

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
    toast.success(`Zone "${createdZone.zoneName || createdZone.name}" created successfully!`);
  } catch (err) {
    console.error("Failed to create zone:", err);
    toast.error(`Failed to create zone: ${err.message || 'Unknown error'}`);
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
      const roleRes = await fetch(`${apiUrl}/items/roleConfigurator?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][accessType][_in]=patrol,accesseasy_patrol&filter[_and][0][_and][2][roleName][_contains]=guard&fields[]=id`, { headers: { Authorization: `Bearer ${token}` } });
      if (roleRes.ok) {
        const roleData = await roleRes.json();
        roleId = roleData.data?.[0]?.id || null;
      }
    } catch (e) {}

    if (!roleId) {
      try {
        const createRes = await fetch(`${apiUrl}/items/roleConfigurator`, {
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
          roleId = created.data?.id || null;
        }
      } catch (_) {}
    }

    const payload = {
      first_name: newGuardForm.value.first_name.trim(),
      last_name: newGuardForm.value.last_name.trim(),
      phone: newGuardForm.value.phone.trim(),
      title: newGuardForm.value.badge_number.trim() || undefined,
      email: newGuardForm.value.email.trim() || undefined,
      tenant: tenantId,
      status: 'active',
      userApp: 'patrol'
    };
    if (roleId) {
      payload.accesseasyPatrolRole = roleId;
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
    toast.success(`Guard "${newGuardObj.name}" added successfully!`);
  } catch (err) {
    console.error("Failed to add guard:", err);
    toast.error("Failed to add guard. Please try again.");
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
    type: 'qr',
    zoneId: form.value.zoneId || (zones.value[0]?.id || ''),
    building: '',
    floor: '',
    dwell_time: 0,
    status: 'active',
    nfc_tag_id: '',
    qr_code: '',
    latitude: null,
    longitude: null,
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
  if (!inlineForm.value.name || !inlineForm.value.name.trim()) return;

  const trimmedName = inlineForm.value.name.trim().toLowerCase();
  const duplicate = allMasterCheckpoints.value.find(cp =>
    cp.name.trim().toLowerCase() === trimmedName &&
    String(cp.zone || '') === String(targetZoneId || '')
  );

  if (duplicate) {
    toast.warning(`A checkpoint named "${inlineForm.value.name.trim()}" already exists in this zone.`);
    return;
  }

  if (!form.value.zoneId && targetZoneId) {
    form.value.zoneId = targetZoneId;
  }
  savingInline.value = true;
  try {
    const payload = {
      name: inlineForm.value.name,
      checkpoint_id: 'CP' + Math.floor(1000 + Math.random() * 9000),
      type: inlineForm.value.type || 'qr',
      instructions: targetZoneId ? `__ZONE_ASSIGNMENT__:${targetZoneId}` : '',
      zone: targetZoneId || null,
      building_id: inlineForm.value.building || null,
      floor: inlineForm.value.floor || null,
      dwell_time: inlineForm.value.dwell_time || 0,
      nfc_tag_id: inlineForm.value.type === 'nfc' ? (inlineForm.value.nfc_tag_id || null) : null,
      qr_code: inlineForm.value.type === 'qr' ? (inlineForm.value.qr_code || null) : null,
      latitude: inlineForm.value.type === 'gps' ? inlineForm.value.latitude : null,
      longitude: inlineForm.value.type === 'gps' ? inlineForm.value.longitude : null,
      status: inlineForm.value.status || 'active'
    };
    const savedCp = await patrolService.saveMasterCheckpoint(payload);
    
    // Checkpoint saved successfully. Fetch refreshed master list
    const updatedList = await patrolService.getMasterCheckpoints();
    if (updatedList && Array.isArray(updatedList)) {
      updatedList.forEach(cp => {
        const match = cp.instructions?.match(/__ZONE_ASSIGNMENT__:(\d+)/);
        cp.zone = match ? Number(match[1]) : (cp.zone || null);
      });
      allMasterCheckpoints.value = updatedList;
    }
    
    const newCp = savedCp || (Array.isArray(updatedList) && updatedList.find(c => c.name === inlineForm.value.name));
    if (newCp) {
      const match = newCp.instructions?.match(/__ZONE_ASSIGNMENT__:(\d+)/);
      newCp.zone = match ? Number(match[1]) : (targetZoneId || null);
      addCheckpoint({ 
        ...newCp, 
        building: inlineForm.value.building,
        floor: inlineForm.value.floor,
        dwell_time: inlineForm.value.dwell_time,
        expectedOffset: inlineForm.value.expectedOffset || 5 
      });
    }
    
    // Reset form
    inlineForm.value = {
      name: '',
      zoneId: '',
      building: '',
      floor: '',
      dwell_time: 0,
      status: 'active',
      nfc_tag_id: '',
      expectedOffset: 5
    };
    toast.success(`Checkpoint "${inlineForm.value.name}" added!`);
  } catch (err) {
    console.error("Failed to create checkpoint", err);
    toast.error(err?.message || "Failed to create checkpoint. Please try again.");
  } finally {
    savingInline.value = false;
  }
};

// --- DRAG AND DROP & TOUCH REORDERING ---
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

const moveCheckpointUp = (index) => {
  if (index <= 0) return;
  const item = selectedCheckpoints.value.splice(index, 1)[0];
  selectedCheckpoints.value.splice(index - 1, 0, item);
};

const moveCheckpointDown = (index) => {
  if (index >= selectedCheckpoints.value.length - 1) return;
  const item = selectedCheckpoints.value.splice(index, 1)[0];
  selectedCheckpoints.value.splice(index + 1, 0, item);
};

// --- TACTICAL ROUTE MAP TELEMETRY & COORDINATES ---

const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getCheckpointCoords = (cp, index = 0) => {
  const lat = Number(cp?.latitude);
  const lng = Number(cp?.longitude);
  if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
    return [lat, lng];
  }
  
  const selectedSite = sites.value.find(s => String(s.id) === String(form.value.siteId)) || sites.value[0];
  const siteLat = Number(selectedSite?.latitude) || 12.9716;
  const siteLng = Number(selectedSite?.longitude) || 80.2435;
  
  const count = Math.max(selectedCheckpoints.value.length, 6);
  const angle = (index / count) * 2 * Math.PI;
  const radiusMeters = 60 + (index % 3) * 25;
  const dLat = (radiusMeters * Math.cos(angle)) / 111320;
  const dLng = (radiusMeters * Math.sin(angle)) / (111320 * Math.cos(siteLat * Math.PI / 180));
  
  return [parseFloat((siteLat + dLat).toFixed(6)), parseFloat((siteLng + dLng).toFixed(6))];
};

const routeDistanceMeters = computed(() => {
  if (selectedCheckpoints.value.length < 2) return 0;
  let totalMeters = 0;
  for (let i = 0; i < selectedCheckpoints.value.length - 1; i++) {
    const p1 = getCheckpointCoords(selectedCheckpoints.value[i], i);
    const p2 = getCheckpointCoords(selectedCheckpoints.value[i + 1], i + 1);
    totalMeters += getDistanceMeters(p1[0], p1[1], p2[0], p2[1]);
  }
  return Math.round(totalMeters);
});

const formattedRouteDistance = computed(() => {
  const m = routeDistanceMeters.value;
  if (m === 0) return '0 m';
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(2)} km`;
});

const estimatedWalkingTimeMin = computed(() => {
  if (selectedCheckpoints.value.length === 0) return 0;
  const walkMins = Math.ceil(routeDistanceMeters.value / 70);
  const totalDwell = selectedCheckpoints.value.reduce((acc, cp) => acc + (Number(cp.dwell_time) || 0), 0);
  return Math.max(walkMins + totalDwell, 3);
});

const isRouteFeasible = computed(() => {
  if (selectedCheckpoints.value.length === 0) return true;
  return estimatedWalkingTimeMin.value <= (Number(form.value.maxDuration) || 30);
});

const getLegInfo = (idx) => {
  if (idx === 0) return 'Patrol Origin';
  const prev = selectedCheckpoints.value[idx - 1];
  const curr = selectedCheckpoints.value[idx];
  if (!prev || !curr) return '';
  const p1 = getCheckpointCoords(prev, idx - 1);
  const p2 = getCheckpointCoords(curr, idx);
  const distM = Math.round(getDistanceMeters(p1[0], p1[1], p2[0], p2[1]));
  const estMins = Math.max(1, Math.ceil(distM / 70));
  return `${distM < 1000 ? `${distM}m` : `${(distM / 1000).toFixed(1)}km`} · ~${estMins}m walk`;
};

// --- LEAFLET TACTICAL MAP INITIALIZATION & ENGINE ---

const tileUrls = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      attribution: '&copy; Esri World Imagery',
      maxZoom: 19
    }
  }
};

const setMapStyle = (style) => {
  if (!routeMap || mapStyle.value === style) return;
  mapStyle.value = style;
  if (activeTileLayer) {
    routeMap.removeLayer(activeTileLayer);
  }
  const cfg = tileUrls[style];
  activeTileLayer = L.tileLayer(cfg.url, cfg.options).addTo(routeMap);
};

const initRouteMap = () => {
  const container = document.getElementById('patrol-route-map');
  if (!container || routeMap) return;

  const selectedSite = sites.value.find(s => String(s.id) === String(form.value.siteId)) || sites.value[0];
  const initialLat = Number(selectedSite?.latitude) || 12.9716;
  const initialLng = Number(selectedSite?.longitude) || 80.2435;

  routeMap = L.map('patrol-route-map', {
    center: [initialLat, initialLng],
    zoom: 16,
    zoomControl: false
  });

  L.control.zoom({ position: 'topright' }).addTo(routeMap);

  const cfg = tileUrls[mapStyle.value];
  activeTileLayer = L.tileLayer(cfg.url, cfg.options).addTo(routeMap);

  routeMarkersLayer = L.layerGroup().addTo(routeMap);
  routeGlowLineLayer = L.layerGroup().addTo(routeMap);
  routeLineLayer = L.layerGroup().addTo(routeMap);

  routeMap.on('click', (e) => {
    if (isMapAddMode.value) {
      openInlineCreate();
      inlineForm.value.type = 'gps';
      inlineForm.value.latitude = parseFloat(e.latlng.lat.toFixed(6));
      inlineForm.value.longitude = parseFloat(e.latlng.lng.toFixed(6));
      isMapAddMode.value = false;
      showToast(`Coordinates pinned at ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
    }
  });

  setTimeout(() => {
    if (routeMap) {
      routeMap.invalidateSize();
      updateRouteMap();
    }
  }, 250);
};

const toggleMapAddMode = () => {
  isMapAddMode.value = !isMapAddMode.value;
  if (isMapAddMode.value) {
    showToast('Click anywhere on the map to place a checkpoint');
  }
};

const fitRouteBounds = () => {
  if (!routeMap) return;
  const bounds = [];
  selectedCheckpoints.value.forEach((cp, idx) => {
    bounds.push(getCheckpointCoords(cp, idx));
  });
  if (bounds.length > 0) {
    routeMap.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 18 });
  } else {
    const selectedSite = sites.value.find(s => String(s.id) === String(form.value.siteId)) || sites.value[0];
    const sLat = Number(selectedSite?.latitude) || 12.9716;
    const sLng = Number(selectedSite?.longitude) || 80.2435;
    routeMap.setView([sLat, sLng], 16);
  }
};

const focusCheckpointOnMap = (cp, index) => {
  if (!routeMap) return;
  const coords = getCheckpointCoords(cp, index);
  routeMap.flyTo(coords, 18, { duration: 0.8 });
  
  if (routeMarkersLayer) {
    routeMarkersLayer.eachLayer(layer => {
      if (layer.getLatLng && layer.getPopup) {
        const latlng = layer.getLatLng();
        if (Math.abs(latlng.lat - coords[0]) < 0.0001 && Math.abs(latlng.lng - coords[1]) < 0.0001) {
          layer.openPopup();
        }
      }
    });
  }
};

const updateRouteMap = () => {
  if (!routeMap || !routeMarkersLayer) return;

  routeMarkersLayer.clearLayers();
  routeGlowLineLayer.clearLayers();
  routeLineLayer.clearLayers();
  if (siteGeofenceCircle) {
    routeMap.removeLayer(siteGeofenceCircle);
    siteGeofenceCircle = null;
  }

  const selectedSite = sites.value.find(s => String(s.id) === String(form.value.siteId)) || sites.value[0];
  const siteLat = Number(selectedSite?.latitude) || 12.9716;
  const siteLng = Number(selectedSite?.longitude) || 80.2435;
  const geofenceRadius = Number(selectedSite?.geofence_radius) || 350;

  // Site perimeter circle
  siteGeofenceCircle = L.circle([siteLat, siteLng], {
    radius: geofenceRadius,
    color: '#6366f1',
    weight: 1.5,
    dashArray: '5, 6',
    fillColor: '#6366f1',
    fillOpacity: 0.04
  }).addTo(routeMap);

  const routeLatLngs = [];
  const allBounds = [];

  // Unselected checkpoints in site/zone
  const currentZoneId = form.value.zoneId;
  const availableCps = allMasterCheckpoints.value.filter(cp => {
    const isSelected = selectedCheckpoints.value.some(sel => sel.id === cp.id || sel.checkpoint_id === cp.checkpoint_id);
    if (isSelected) return false;

    if (currentZoneId) {
      const zId = typeof cp.zone === 'object' && cp.zone ? cp.zone.id : cp.zone;
      if (String(zId) !== String(currentZoneId)) return false;
    }
    return true;
  });

  availableCps.forEach((cp, idx) => {
    const coords = getCheckpointCoords(cp, idx + selectedCheckpoints.value.length + 1);
    allBounds.push(coords);

    const availableIcon = L.divIcon({
      className: 'patrol-unselected-pin-wrapper',
      html: `
        <div style="cursor: pointer; display: flex; align-items: center; justify-content: center;" title="${cp.name} (Click to add)">
          <div style="background: #1e293b; color: #94a3b8; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #64748b; font-size: 13px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
            +
          </div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const marker = L.marker(coords, { icon: availableIcon }).addTo(routeMarkersLayer);

    const popupHtml = `
      <div style="font-family: inherit; min-width: 170px; padding: 2px;">
        <div style="font-weight: 800; font-size: 12px; color: #0f172a; margin-bottom: 2px;">${cp.name}</div>
        <div style="font-size: 10px; color: #64748b; margin-bottom: 8px;">${cp.building || 'Building'} · ${cp.floor || 'Floor'}</div>
        <button id="add-cp-${cp.id || idx}" style="width: 100%; background: #4f46e5; color: white; border: none; border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
          + Add to Route
        </button>
      </div>
    `;
    marker.bindPopup(popupHtml);
    marker.on('popupopen', () => {
      const btn = document.getElementById(`add-cp-${cp.id || idx}`);
      if (btn) {
        btn.onclick = () => {
          addCheckpoint(cp);
          marker.closePopup();
        };
      }
    });
  });

  // Sequenced checkpoints
  selectedCheckpoints.value.forEach((cp, idx) => {
    const coords = getCheckpointCoords(cp, idx);
    routeLatLngs.push(coords);
    allBounds.push(coords);

    const seqNum = idx + 1;
    const isFirst = idx === 0;
    const isLast = idx === selectedCheckpoints.value.length - 1 && selectedCheckpoints.value.length > 1;
    const markerColor = isFirst ? '#10b981' : (isLast ? '#f59e0b' : '#4f46e5');

    const activeIcon = L.divIcon({
      className: 'patrol-route-pin-wrapper',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: ${markerColor}; color: #ffffff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.45); transform: translateY(-4px);">
            ${seqNum}
          </div>
          <div style="background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px); color: #ffffff; padding: 2px 7px; border-radius: 9999px; font-size: 10px; font-weight: 700; max-width: 110px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin-top: -2px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 2px 5px rgba(0,0,0,0.25);">
            ${cp.name}
          </div>
        </div>
      `,
      iconSize: [120, 50],
      iconAnchor: [60, 24]
    });

    const marker = L.marker(coords, { icon: activeIcon, draggable: true }).addTo(routeMarkersLayer);

    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      cp.latitude = parseFloat(pos.lat.toFixed(6));
      cp.longitude = parseFloat(pos.lng.toFixed(6));
      updateRouteMap();
    });

    const popupHtml = `
      <div style="font-family: inherit; min-width: 180px; padding: 4px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <span style="background: ${markerColor}; color: white; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 4px;">STOP ${seqNum}</span>
          <span style="font-size: 10px; color: #64748b; font-weight: 600;">+${cp.expectedOffset || 0}m</span>
        </div>
        <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${cp.name}</div>
        <div style="font-size: 10px; color: #64748b; margin-bottom: 8px;">${cp.building ? `${cp.building}, ` : ''}${cp.floor || 'Ground Floor'}</div>
        <button id="remove-route-cp-${idx}" style="width: 100%; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; padding: 5px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">
          Remove from Patrol
        </button>
      </div>
    `;

    marker.bindPopup(popupHtml);
    marker.on('popupopen', () => {
      const btn = document.getElementById(`remove-route-cp-${idx}`);
      if (btn) {
        btn.onclick = () => {
          removeCheckpoint(idx);
          marker.closePopup();
        };
      }
    });
  });

  // Polyline corridor
  if (routeLatLngs.length > 1) {
    L.polyline(routeLatLngs, {
      color: '#818cf8',
      weight: 7,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(routeGlowLineLayer);

    L.polyline(routeLatLngs, {
      color: '#4f46e5',
      weight: 3.5,
      dashArray: '8, 8',
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(routeLineLayer);
  }

  // Camera bounds
  if (allBounds.length > 0) {
    routeMap.fitBounds(L.latLngBounds(allBounds), { padding: [40, 40], maxZoom: 18 });
  } else {
    routeMap.setView([siteLat, siteLng], 16);
  }
};

// --- TIMELINE COMPUTATIONS ---

const formatAMPM = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return '';
  let [h, m] = timeStr.split(':');
  const parsedH = parseInt(h, 10);
  if (isNaN(parsedH)) return '';
  const ampm = parsedH >= 12 ? 'PM' : 'AM';
  const displayH = parsedH % 12 || 12;
  return `${displayH.toString().padStart(2, '0')}:${m || '00'} ${ampm}`;
};

const addMinutesToTime = (timeStr, minutes) => {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return '--:--';
  let [h, m] = timeStr.split(':');
  const parsedH = parseInt(h, 10);
  const parsedM = parseInt(m, 10);
  if (isNaN(parsedH) || isNaN(parsedM)) return '--:--';
  const date = new Date();
  date.setHours(parsedH, parsedM, 0);
  date.setMinutes(date.getMinutes() + parseInt(minutes || 0, 10));
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
  if (form.value.repeat === 'none') return [{ time: form.value.startsAt, dayOffset: 0 }];
  
  const interval = parseInt(form.value.repeat);
  const timings = [];
  let [h, m] = form.value.startsAt.split(':').map(Number);
  
  for (let i = 0; i < 24; i += interval) {
    let totalH = h + i;
    let dayOffset = Math.floor(totalH / 24);
    let newH = totalH % 24;
    timings.push({
      time: `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
      dayOffset
    });
  }
  return timings;
};

const submit = async () => {
  if (!form.value.name.trim()) return toast.warning('Please enter a Patrol Name');
  if (!form.value.zoneId) return toast.warning('Please select a Zone');
  if (selectedCheckpoints.value.length === 0) return toast.warning('Please select at least one Checkpoint');

  // Guard: ensure the selected siteId actually exists in the loaded sites list.
  // If it doesn't (e.g. site was deleted), clear it so we don't send an invalid FK.
  const resolvedSiteId = (() => {
    if (!form.value.siteId) return null;
    const exists = sites.value?.some(s => String(s.id) === String(form.value.siteId));
    if (!exists) {
      form.value.siteId = ''; // reset stale selection
      return null;
    }
    return form.value.siteId;
  })();

  saving.value = true;
  try {
    // 1. Create a Checkpoint Group representing the route configuration (1 API call)
    const group = await patrolService.createCheckpointGroup({
      name: form.value.name.trim(),
      site_id: resolvedSiteId,
      site: resolvedSiteId,
      zone_id: form.value.zoneId,
      frequency: form.value.repeat === 'none' ? 'custom' : `every_${form.value.repeat}h`,
      grace_period: 15 // static grace period buffer
    });

    // 2. Clone and batch-save checkpoints to this new group (1 single API call for all checkpoints)
    const clones = selectedCheckpoints.value.map((originalCp, index) => ({
      name: originalCp.name,
      checkpoint_id: originalCp.checkpoint_id || ('CP' + Math.floor(1000 + Math.random() * 9000)),
      building_id: originalCp.building_id || originalCp.building || null,
      floor: originalCp.floor || null,
      dwell_time: Number(originalCp.dwell_time) || (enableAdvancedTiming.value ? Number(originalCp.expectedOffset || 0) : 0),
      nfc_uid: originalCp.nfc_uid || originalCp.nfc_tag_id || null,
      status: 'active',
      sort_order: index,
      zone: form.value.zoneId
    }));
    await patrolService.saveCheckpointsBatch(group.id, clones);

    // 3. Batch-generate scheduled patrol rounds (1 single API call for all scheduled timings)
    const timings = generateTimings();
    const now = new Date();
    const z = zones.value.find(z => z.id === form.value.zoneId);

    const patrolRounds = timings.map(item => {
      const roundDate = new Date(now);
      if (item.dayOffset) {
        roundDate.setDate(roundDate.getDate() + item.dayOffset);
      }
      const y = roundDate.getFullYear();
      const m = String(roundDate.getMonth() + 1).padStart(2, '0');
      const d = String(roundDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      return {
        site: resolvedSiteId,
        siteId: resolvedSiteId,
        zone: form.value.zoneId || null,
        zoneId: form.value.zoneId,
        zoneName: z?.zoneName || z?.name || 'Security Zone',
        groupId: group.id,
        name: form.value.name.trim(),
        routeName: form.value.name.trim(),
        guard: form.value.guardId || null,
        guard_id: form.value.guardId || null,
        guardId: form.value.guardId || null,
        assignedGuard: form.value.guardId || null,
        guardName: form.value.guardId
          ? (guards.value.find(g => g.id === form.value.guardId)?.name || 'Assigned Guard')
          : 'Unassigned',
        date: dateStr,
        scheduledTime: `${dateStr}T${item.time}:00`,
        status: 'scheduled',
        allowed_delay: form.value.maxDuration,
        qr_support: true
      };
    });

    await patrolService.createPatrolsBatch(patrolRounds);

    clearDraft();
    subscriptionService.clearCache();
    toast.success(`Patrol plan "${form.value.name}" scheduled successfully!`);
    router.push('/dashboard/patrols');
  } catch (err) {
    toast.error(`Failed to save patrol plan: ${err.message}`);
  } finally {
    saving.value = false;
  }
};

// Draft auto-save & restore in sessionStorage
const DRAFT_KEY = 'accesseasy_create_patrol_draft';

const saveDraft = () => {
  try {
    if (form.value.name || selectedCheckpoints.value.length > 0) {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        form: form.value,
        selectedCheckpoints: selectedCheckpoints.value,
        timestamp: Date.now()
      }));
    }
  } catch (_) {}
};

const restoreDraft = () => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const { form: savedForm, selectedCheckpoints: savedCps, timestamp } = parsed;
    if (Date.now() - timestamp < 4 * 60 * 60 * 1000) { // within 4 hours
      if (savedForm && savedForm.name && !form.value.name) {
        form.value = { ...form.value, ...savedForm };
      }
      if (Array.isArray(savedCps) && savedCps.length > 0 && selectedCheckpoints.value.length === 0) {
        selectedCheckpoints.value = savedCps;
      }
    }
  } catch (_) {}
};

const clearDraft = () => {
  try { sessionStorage.removeItem(DRAFT_KEY); } catch (_) {}
};

watch([form, selectedCheckpoints], saveDraft, { deep: true });

watch(
  () => selectedCheckpoints.value,
  () => {
    nextTick(() => {
      updateRouteMap();
    });
  },
  { deep: true }
);

watch(
  () => form.value.siteId,
  () => {
    nextTick(() => {
      updateRouteMap();
      fitRouteBounds();
    });
  }
);

watch(
  () => form.value.zoneId,
  () => {
    nextTick(() => {
      updateRouteMap();
    });
  }
);

// --- INIT ---

onMounted(async () => {
  isMounted.value = true;
  restoreDraft();
  
  const token = authService.getToken();
  const tenantId = authService.getTenantId();
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Fetch Sites
  try {
    const fetchedSites = await siteService.fetchSites();
    sites.value = fetchedSites || [];
  } catch (e) { console.error('Failed to fetch sites:', e); }

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
    const tenantData = authService.getTenantData();
    const tenantIdStr = tenantData?.tenantId;
    const tenantIdPk = tenantData?.id;

    const validTenantSet = new Set(
      [tenantId, tenantIdStr, tenantIdPk].filter(Boolean).map(String)
    );

    const userFieldList = [
      'id', 'first_name', 'last_name', 'email', 'phone', 'status', 'title', 'role.name', 'tenant'
    ].map(f => `fields[]=${f}`).join('&');

    const guardsMap = new Map();
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
              if (!guardsMap.has(uid)) {
                guardsMap.set(uid, u);
              }
            }
          }
        }
      } catch (usersErr) {
        console.warn('[CreatePatrol] users fetch notice:', usersErr);
      }
    }

    const currentUserId = authService.getUserId?.() || authService.getUserData?.()?.id;
    const allUsers = Array.from(guardsMap.values());
    const guardsOnly = allUsers.filter(u => {
      const roleName = (u.role?.name || '').toLowerCase();
      if (roleName.includes('administrator') || roleName.includes('public')) return false;
      if (currentUserId && String(u.id) === String(currentUserId)) {
        const myRole = (authService.getUserRole?.() || '').toLowerCase();
        if (myRole.includes('admin') || myRole.includes('owner')) return false;
      }
      return true;
    });

    guards.value = guardsOnly.map(u => {
      const lName = (u.last_name && u.last_name !== '-') ? u.last_name : '';
      const fName = u.first_name || '';
      const fullName = `${fName} ${lName}`.trim();
      return {
        id: u.id,
        name: fullName || u.phone || u.email || 'Guard',
        first_name: u.first_name,
        last_name: u.last_name,
        phone: u.phone,
        email: u.email
      };
    });
  } catch (e) { console.error('Failed to fetch guards in CreatePatrol:', e); }

  // Mount Tactical Patrol Route Map
  nextTick(() => {
    setTimeout(initRouteMap, 300);
  });
  
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
  if (routeMap) {
    routeMap.remove();
    routeMap = null;
  }
});
</script>

<style>
/* Leaflet custom map markers */
.patrol-route-pin-wrapper {
  background: transparent !important;
  border: none !important;
}
.patrol-unselected-pin-wrapper {
  background: transparent !important;
  border: none !important;
}
.patrol-unselected-pin-wrapper:hover > div > div {
  transform: scale(1.18);
  border-color: #4f46e5 !important;
  color: #ffffff !important;
  background: #4f46e5 !important;
}

/* Custom popup styling */
.leaflet-popup-content-wrapper {
  border-radius: 14px !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2) !important;
  padding: 4px !important;
}
.leaflet-popup-tip {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2) !important;
}
</style>
