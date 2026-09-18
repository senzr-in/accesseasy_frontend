<template>
  <div
    v-if="isVisible"
    class="mb-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-900/90 via-slate-900 to-slate-900 border border-indigo-500/30 text-white shadow-lg relative overflow-hidden"
  >
    <!-- Background glow -->
    <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
      <!-- Left Info -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-500/30">
            Quick Start Guide
          </span>
          <span class="text-xs text-slate-400 font-semibold">
            {{ completedCount }} of {{ steps.length }} steps completed
          </span>
        </div>
        <h3 class="text-sm sm:text-base font-black text-white tracking-tight">
          Welcome to AccessEasy Security & Patrol Management
        </h3>
        <p class="text-xs text-slate-300 max-w-xl">
          Follow these 5 quick steps to configure your security sites, checkpoints, guard roster, and start your first live patrol.
        </p>
      </div>

      <!-- Right Dismiss Button -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          class="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          @click="dismissBanner"
        >
          Dismiss
        </button>
      </div>
    </div>

    <!-- Steps Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-white/10 relative z-10">
      <div
        v-for="(step, idx) in steps"
        :key="step.title"
        class="p-3 rounded-xl border transition-all flex flex-col justify-between"
        :class="[
          step.completed
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
            : 'bg-white/5 border-white/10 hover:border-indigo-400/40 text-slate-200'
        ]"
      >
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono font-bold" :class="step.completed ? 'text-emerald-400' : 'text-slate-400'">
              0{{ idx + 1 }}
            </span>
            <span
              class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black"
              :class="step.completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'"
            >
              {{ step.completed ? '✓' : idx + 1 }}
            </span>
          </div>
          <h4 class="text-xs font-bold text-white">{{ step.title }}</h4>
          <p class="text-[11px] text-slate-400 leading-tight">{{ step.desc }}</p>
        </div>

        <button
          class="mt-3 w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1"
          :class="[
            step.completed
              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-95'
          ]"
          @click="step.action"
        >
          <span>{{ step.completed ? 'Manage' : step.buttonText }}</span>
          <span class="text-[10px]">&rarr;</span>
        </button>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- MODAL 1: CREATE SITE POPUP -->
    <!-- ============================================================ -->
    <Teleport to="body">
      <div
        v-if="showSiteModal"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      >
        <div class="relative w-full max-w-lg bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="px-6 py-4 border-b border-slate-150 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Building2 class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">Create Security Site</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Define facility location & geofence perimeter</p>
              </div>
            </div>
            <button
              class="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              @click="showSiteModal = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="submitCreateSite" class="p-6 space-y-3.5 text-xs text-slate-800 dark:text-slate-200">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Property / Site Name *</label>
              <input
                v-model="siteForm.name"
                required
                placeholder="e.g. Bangalore Global Tech Campus"
                class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Site Code *</label>
                <input
                  v-model="siteForm.code"
                  required
                  placeholder="e.g. SITE-01"
                  class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono uppercase outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
              <div class="sm:col-span-2 space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Address / Location</label>
                <input
                  v-model="siteForm.address"
                  placeholder="e.g. Electronic City Phase 1, Bangalore"
                  class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
            </div>

            <!-- GPS Coordinates -->
            <div class="space-y-1 pt-1">
              <div class="flex items-center justify-between">
                <label class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin class="w-3.5 h-3.5 text-indigo-600" />
                  <span>GPS Coordinates</span>
                </label>
                <button
                  type="button"
                  @click="useCurrentLocation"
                  class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <MapPin class="w-3 h-3" />
                  <span>Use My Location</span>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <input
                    v-model.number="siteForm.latitude"
                    type="number"
                    step="any"
                    required
                    placeholder="Latitude (12.9716)"
                    class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
                <div>
                  <input
                    v-model.number="siteForm.longitude"
                    type="number"
                    step="any"
                    required
                    placeholder="Longitude (77.5946)"
                    class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Geofence Radius -->
            <div class="grid grid-cols-2 gap-3 pt-1">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Geofence Radius (Meters)</label>
                <input
                  v-model.number="siteForm.geofence_radius"
                  type="number"
                  min="50"
                  max="10000"
                  placeholder="500"
                  class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Emergency Phone</label>
                <input
                  v-model="siteForm.emergency_phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
            </div>

            <div class="mt-5 pt-3 border-t border-slate-150 dark:border-white/10 flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showSiteModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmittingSite"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Loader2 v-if="isSubmittingSite" class="w-3.5 h-3.5 animate-spin" />
                <Building2 v-else class="w-3.5 h-3.5" />
                <span>Save Site</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ============================================================ -->
    <!-- MODAL 2: CREATE ZONE POPUP -->
    <!-- ============================================================ -->
    <Teleport to="body">
      <div
        v-if="showZoneModal"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      >
        <div class="relative w-full max-w-lg bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="px-6 py-4 border-b border-slate-150 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Layers class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">Create Security Zone</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Designate perimeter areas and patrol sectors</p>
              </div>
            </div>
            <button
              class="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              @click="showZoneModal = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="submitCreateZone" class="p-6 space-y-3.5 text-xs text-slate-800 dark:text-slate-200">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Zone Name *</label>
              <input
                v-model="zoneForm.name"
                required
                placeholder="e.g. North Perimeter Gate, Server Room"
                class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Zone Code</label>
                <input
                  v-model="zoneForm.code"
                  placeholder="e.g. ZN-01"
                  class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono uppercase outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Belongs to Site</label>
                <select
                  v-model="zoneForm.siteId"
                  class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
                >
                  <option value="">Primary Site</option>
                  <option v-for="site in availableSites" :key="site.id" :value="site.id">
                    {{ site.name || site.branchName }}
                  </option>
                </select>
              </div>
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Description / Area Details</label>
              <textarea
                v-model="zoneForm.description"
                rows="2"
                placeholder="e.g. Perimeter fence checkpoints and vehicle entry gate"
                class="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
              ></textarea>
            </div>

            <div class="mt-5 pt-3 border-t border-slate-150 dark:border-white/10 flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showZoneModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmittingZone"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Loader2 v-if="isSubmittingZone" class="w-3.5 h-3.5 animate-spin" />
                <Layers v-else class="w-3.5 h-3.5" />
                <span>Save Zone</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ============================================================ -->
    <!-- MODAL 3: CREATE CHECKPOINT POPUP -->
    <!-- ============================================================ -->
    <Teleport to="body">
      <div
        v-if="showCheckpointModal"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      >
        <div class="relative w-full max-w-lg bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="px-6 py-4 border-b border-slate-150 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <QrCode class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">Add Checkpoint</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Place scanning verification point on route</p>
              </div>
            </div>
            <button
              class="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              @click="showCheckpointModal = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="submitCreateCheckpoint" class="p-6 space-y-3.5 text-xs text-slate-800 dark:text-slate-200">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Checkpoint Name *</label>
              <input
                v-model="cpForm.name"
                required
                placeholder="e.g. East Emergency Fire Exit"
                class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Assigned Zone *</label>
                <select
                  v-model="cpForm.zone"
                  class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
                >
                  <option value="">General Area</option>
                  <option v-for="z in availableZones" :key="z.id" :value="z.id">
                    {{ z.zoneName || z.name }}
                  </option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Checkpoint Code / Token</label>
                <input
                  v-model="cpForm.checkpoint_id"
                  placeholder="e.g. CP-1001"
                  class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono uppercase outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Floor / Level</label>
                <input
                  v-model="cpForm.floor"
                  placeholder="e.g. Ground Floor, Basement 1"
                  class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Minimum Dwell Time (sec)</label>
                <input
                  v-model.number="cpForm.dwell_time"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Guard Instructions</label>
              <textarea
                v-model="cpForm.instructions"
                rows="2"
                placeholder="e.g. Inspect fire extinguisher pressure gauge and verify exit door latch"
                class="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
              ></textarea>
            </div>

            <div class="mt-5 pt-3 border-t border-slate-150 dark:border-white/10 flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showCheckpointModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmittingCheckpoint"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Loader2 v-if="isSubmittingCheckpoint" class="w-3.5 h-3.5 animate-spin" />
                <QrCode v-else class="w-3.5 h-3.5" />
                <span>Save Checkpoint</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ============================================================ -->
    <!-- MODAL 4: SCHEDULE PATROL POPUP -->
    <!-- ============================================================ -->
    <Teleport to="body">
      <div
        v-if="showScheduleModal"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      >
        <div class="relative w-full max-w-lg bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="px-6 py-4 border-b border-slate-150 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Calendar class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white">Schedule Patrol Tour</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Configure recurring route timing & guard assignment</p>
              </div>
            </div>
            <button
              class="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              @click="showScheduleModal = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="submitSchedulePatrol" class="p-6 space-y-3.5 text-xs text-slate-800 dark:text-slate-200">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">Patrol Route Name *</label>
              <input
                v-model="patrolForm.name"
                required
                placeholder="e.g. Night Perimeter Security Round"
                class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Target Zone *</label>
                <select
                  v-model="patrolForm.zoneId"
                  required
                  class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
                >
                  <option value="" disabled>Select Zone</option>
                  <option v-for="z in availableZones" :key="z.id" :value="z.id">
                    {{ z.zoneName || z.name }}
                  </option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Assigned Guard / Officer</label>
                <select
                  v-model="patrolForm.guardId"
                  class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
                >
                  <option value="">Any Active Guard</option>
                  <option v-for="g in availableGuards" :key="g.id" :value="g.id">
                    {{ g.name || g.full_name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Recurrence Frequency</label>
                <select
                  v-model="patrolForm.frequency"
                  class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
                >
                  <option value="1">Every 1 Hour</option>
                  <option value="2">Every 2 Hours</option>
                  <option value="4">Every 4 Hours</option>
                  <option value="8">Once Per Shift (8h)</option>
                  <option value="none">Single Tour (Now)</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="font-bold text-slate-700 dark:text-slate-300">Max Tour Duration (min)</label>
                <input
                  v-model.number="patrolForm.maxDuration"
                  type="number"
                  min="10"
                  max="300"
                  placeholder="45"
                  class="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>
            </div>

            <div class="mt-5 pt-3 border-t border-slate-150 dark:border-white/10 flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                @click="showScheduleModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmittingSchedule"
                class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Loader2 v-if="isSubmittingSchedule" class="w-3.5 h-3.5 animate-spin" />
                <Calendar v-else class="w-3.5 h-3.5" />
                <span>Schedule Patrol</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Building2, Layers, QrCode, Calendar, MapPin, X, Loader2 
} from 'lucide-vue-next';
import { siteService } from '@/services/siteService';
import { zoneService } from '@/services/zoneService';
import { patrolService } from '@/services/patrolService';
import { authService } from '@/services/authService';

const props = defineProps({
  sitesCount: { type: Number, default: 0 },
  zonesCount: { type: Number, default: 0 },
  patrolsCount: { type: Number, default: 0 }
});

const emit = defineEmits(['openPairing', 'refreshData']);

const isDismissed = ref(false);
const totalCheckpoints = ref(0);

// Local override counts so completed status flips instantly on creation
const localSitesCount = ref(0);
const localZonesCount = ref(0);
const localPatrolsCount = ref(0);

// Modals visibility state
const showSiteModal = ref(false);
const showZoneModal = ref(false);
const showCheckpointModal = ref(false);
const showScheduleModal = ref(false);

// Submitting state
const isSubmittingSite = ref(false);
const isSubmittingZone = ref(false);
const isSubmittingCheckpoint = ref(false);
const isSubmittingSchedule = ref(false);

// Data lists for select dropdowns
const availableSites = ref([]);
const availableZones = ref([]);
const availableGuards = ref([]);

// Form states
const siteForm = ref({
  name: '',
  code: `SITE-${Math.floor(100 + Math.random() * 900)}`,
  address: '',
  latitude: 12.9716,
  longitude: 77.5946,
  geofence_radius: 500,
  emergency_phone: ''
});

const zoneForm = ref({
  name: '',
  code: `ZN-${Math.floor(10 + Math.random() * 90)}`,
  siteId: '',
  description: ''
});

const cpForm = ref({
  name: '',
  zone: '',
  checkpoint_id: `CP-${Math.floor(1000 + Math.random() * 9000)}`,
  floor: 'Ground Floor',
  dwell_time: 0,
  instructions: ''
});

const patrolForm = ref({
  name: '',
  zoneId: '',
  guardId: '',
  frequency: '1',
  maxDuration: 45
});

const fetchMetadata = async () => {
  try {
    const [sites, zones, cps] = await Promise.all([
      siteService.fetchSites().catch(() => []),
      zoneService.fetchZones().catch(() => []),
      patrolService.getMasterCheckpoints().catch(() => [])
    ]);
    availableSites.value = sites || [];
    availableZones.value = zones || [];
    totalCheckpoints.value = cps?.length || 0;

    // Fetch guards
    const token = authService.getToken();
    const tenantId = authService.getTenantId();
    const apiUrl = import.meta.env.VITE_API_URL;
    if (token && tenantId) {
      try {
        const res = await fetch(
          `${apiUrl}/users?filter[tenant][_eq]=${tenantId}&fields[]=id&fields[]=first_name&fields[]=last_name&fields[]=phone&fields[]=status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          availableGuards.value = (data.data || []).map(u => ({
            id: u.id,
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.phone || 'Guard'
          }));
        }
      } catch (_) {}
    }
  } catch (e) {
    console.warn('[SetupWizard] Metadata fetch failed:', e);
  }
};

const useCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        siteForm.value.latitude = parseFloat(pos.coords.latitude.toFixed(6));
        siteForm.value.longitude = parseFloat(pos.coords.longitude.toFixed(6));
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
      },
      { timeout: 8000 }
    );
  }
};

onMounted(() => {
  const dismissed = localStorage.getItem('accesseasy_setup_wizard_dismissed');
  if (dismissed === 'true') {
    isDismissed.value = true;
  }
  fetchMetadata();
});

const dismissBanner = () => {
  isDismissed.value = true;
  localStorage.setItem('accesseasy_setup_wizard_dismissed', 'true');
};

// Form Submissions
const submitCreateSite = async () => {
  if (!siteForm.value.name.trim()) return;
  isSubmittingSite.value = true;
  try {
    await siteService.createSite({
      name: siteForm.value.name.trim(),
      code: siteForm.value.code.trim(),
      address: siteForm.value.address.trim(),
      latitude: siteForm.value.latitude,
      longitude: siteForm.value.longitude,
      geofence_radius: siteForm.value.geofence_radius,
      emergency_phone: siteForm.value.emergency_phone
    });
    localSitesCount.value++;
    showSiteModal.value = false;
    emit('refreshData');
    await fetchMetadata();
  } catch (err) {
    alert(`Failed to create site: ${err.message}`);
  } finally {
    isSubmittingSite.value = false;
  }
};

const submitCreateZone = async () => {
  if (!zoneForm.value.name.trim()) return;
  isSubmittingZone.value = true;
  try {
    await zoneService.createZone({
      name: zoneForm.value.name.trim(),
      code: zoneForm.value.code.trim(),
      siteId: zoneForm.value.siteId || null,
      description: zoneForm.value.description.trim()
    });
    localZonesCount.value++;
    showZoneModal.value = false;
    emit('refreshData');
    await fetchMetadata();
  } catch (err) {
    alert(`Failed to create zone: ${err.message}`);
  } finally {
    isSubmittingZone.value = false;
  }
};

const submitCreateCheckpoint = async () => {
  if (!cpForm.value.name.trim()) return;
  isSubmittingCheckpoint.value = true;
  try {
    const payload = {
      name: cpForm.value.name.trim(),
      checkpoint_id: cpForm.value.checkpoint_id.trim(),
      floor: cpForm.value.floor.trim(),
      dwell_time: cpForm.value.dwell_time || 0,
      status: 'active'
    };
    if (cpForm.value.zone) {
      payload.instructions = `__ZONE_ASSIGNMENT__:${cpForm.value.zone} ${cpForm.value.instructions || ''}`.trim();
    } else {
      payload.instructions = (cpForm.value.instructions || '').trim();
    }
    await patrolService.saveMasterCheckpoint(payload);
    totalCheckpoints.value++;
    showCheckpointModal.value = false;
    emit('refreshData');
    await fetchMetadata();
  } catch (err) {
    alert(`Failed to create checkpoint: ${err.message}`);
  } finally {
    isSubmittingCheckpoint.value = false;
  }
};

const submitSchedulePatrol = async () => {
  if (!patrolForm.value.name.trim() || !patrolForm.value.zoneId) return;
  isSubmittingSchedule.value = true;
  try {
    const group = await patrolService.createCheckpointGroup({
      name: patrolForm.value.name.trim(),
      zone_id: patrolForm.value.zoneId,
      frequency: patrolForm.value.frequency === 'none' ? 'custom' : `every_${patrolForm.value.frequency}h`,
      grace_period: 15
    });

    // Create immediate patrol round
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const z = availableZones.value.find(z => String(z.id) === String(patrolForm.value.zoneId));

    const round = {
      zone: patrolForm.value.zoneId,
      zoneId: patrolForm.value.zoneId,
      zoneName: z?.zoneName || z?.name || 'Security Zone',
      groupId: group.id,
      name: patrolForm.value.name.trim(),
      routeName: patrolForm.value.name.trim(),
      guard: patrolForm.value.guardId || null,
      guardId: patrolForm.value.guardId || null,
      guardName: patrolForm.value.guardId
        ? (availableGuards.value.find(g => String(g.id) === String(patrolForm.value.guardId))?.name || 'Assigned Guard')
        : 'Unassigned',
      date: dateStr,
      scheduledTime: `${dateStr}T${timeStr}:00`,
      status: 'scheduled',
      allowed_delay: patrolForm.value.maxDuration || 45,
      qr_support: true
    };

    await patrolService.createPatrolsBatch([round]);
    localPatrolsCount.value++;
    showScheduleModal.value = false;
    emit('refreshData');
    await fetchMetadata();
  } catch (err) {
    alert(`Failed to schedule patrol: ${err.message}`);
  } finally {
    isSubmittingSchedule.value = false;
  }
};

const hasSites = computed(() => (props.sitesCount + localSitesCount.value) > 0 || availableSites.value.length > 0);
const hasZones = computed(() => (props.zonesCount + localZonesCount.value) > 0 || availableZones.value.length > 0);
const hasCheckpoints = computed(() => totalCheckpoints.value > 0);
const hasPatrols = computed(() => (props.patrolsCount + localPatrolsCount.value) > 0);

const steps = computed(() => [
  {
    title: '1. Create Site',
    desc: 'Define facility address and geofence boundary.',
    completed: hasSites.value,
    buttonText: 'Add Site',
    action: () => {
      fetchMetadata();
      showSiteModal.value = true;
    }
  },
  {
    title: '2. Setup Zones',
    desc: 'Create security zones (Perimeter, Main Gate, etc.)',
    completed: hasZones.value,
    buttonText: 'Add Zone',
    action: () => {
      fetchMetadata();
      showZoneModal.value = true;
    }
  },
  {
    title: '3. Add Checkpoints',
    desc: 'Place QR/NFC scanning points across floors.',
    completed: hasCheckpoints.value,
    buttonText: 'Checkpoints',
    action: () => {
      fetchMetadata();
      showCheckpointModal.value = true;
    }
  },
  {
    title: '4. Schedule Patrol',
    desc: 'Assign routes, shift times, and security guards.',
    completed: hasPatrols.value,
    buttonText: 'Schedule',
    action: () => {
      fetchMetadata();
      showScheduleModal.value = true;
    }
  },
  {
    title: '5. Pair Tablet / App',
    desc: 'Link guard mobile devices via instant QR sync.',
    completed: false,
    buttonText: 'Pair Device',
    action: () => emit('openPairing')
  }
]);

const completedCount = computed(() => steps.value.filter(s => s.completed).length);

const isVisible = computed(() => {
  if (isDismissed.value) return false;
  return completedCount.value < 5;
});
</script>
