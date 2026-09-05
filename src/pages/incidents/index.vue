<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden p-1">
    <!-- Header -->
    <div class="flex items-center gap-3 shrink-0">
      <div>
        <h1 class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
          Incidents
        </h1>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          View and manage security incidents
        </p>
      </div>
    </div>
    


    <!-- Toolbar / Filters -->
    <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col flex-1 min-h-0">
      
      <div class="flex flex-nowrap items-center gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/20 border-b border-slate-200 dark:border-slate-800 shrink-0 overflow-x-auto min-w-0 custom-scrollbar rounded-t-xl">
        
        <!-- Micro KPIs -->
        <div class="flex items-center gap-4 shrink-0 border-r border-slate-200 dark:border-slate-700 pr-6">
          <div class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity" @click="setFilter('all', 'all')">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
            <div class="flex items-center justify-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black text-lg">
              {{ filteredList.length }}
            </div>
          </div>
          <div class="w-px h-10 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <div class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity" @click="setFilter('open', 'all')">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active</p>
            <div class="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 font-black text-lg">
              {{ activeCount }}
            </div>
          </div>
          <div class="w-px h-10 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <div class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity" @click="setFilter('all', 'Critical')">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical</p>
            <div class="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400 font-black text-lg">
              {{ criticalCount }}
            </div>
          </div>
          <div class="w-px h-10 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <div class="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity" @click="setFilter('closed', 'all')">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Closed</p>
            <div class="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-lg">
              {{ closedCount }}
            </div>
          </div>
        </div>

        <!-- Filters & Actions -->
        <div class="flex items-center gap-3 flex-nowrap shrink-0 flex-1 justify-between">
          <!-- Left: Filters -->
          <div class="flex items-center gap-2 shrink-0 flex-nowrap">
            <!-- Status Filter -->
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status:</span>
              <select v-model="statusFilter" class="ae-input h-8 py-1 text-xs min-w-[100px] pr-6">
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <!-- Priority Filter -->
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Severity:</span>
              <select v-model="priorityFilter" class="ae-input h-8 py-1 text-xs min-w-[100px] pr-6">
                <option value="all">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Med</option>
                <option value="High">High</option>
                <option value="Critical">Crit</option>
              </select>
            </div>
          </div>

          <!-- Right: Actions & Search -->
          <div class="flex items-center gap-2 shrink-0 flex-nowrap min-w-0">
            <div class="relative shrink-0 w-[160px] flex-1 max-w-[200px]">
              <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search reports..."
                class="ae-input w-full h-8 text-xs"
                style="padding-left: 2rem !important;"
              />
            </div>
            
            <button
              class="btn-primary text-xs flex items-center gap-1.5 h-8 px-3 shrink-0 whitespace-nowrap"
              @click="openLogModal"
            >
              <Plus class="w-3.5 h-3.5" /> Log Incident
            </button>
          </div>
        </div>
      </div>

      <!-- Incidents Table -->
      <div class="overflow-x-auto flex-1 h-full">
        <table class="w-full text-left border-collapse relative">
          <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
            <tr>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Incident ID
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Guard
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Location
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Status
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Closed By
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Closed Time
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Date
              </th>
              <th class="h-10 px-5 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-xs">
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="8" class="px-5 py-24 text-center">
                <Loader2 class="w-8 h-8 animate-spin text-indigo-650 mx-auto" />
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="filteredList.length === 0">
              <td colspan="8" class="px-5 py-24 text-center">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <AlertTriangle class="w-10 h-10 text-slate-350" />
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    No incidents logged.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Rows -->
            <tr
              v-for="inc in filteredList"
              :key="inc.id"
              class="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              @click="openDetailsPopup(inc)"
            >
              <!-- Incident ID & Severity -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2.5">
                  <div>
                    <span class="font-bold text-slate-800 dark:text-slate-200">
                      {{ inc.reportId || 'INC-TEMP' }}
                    </span>
                    <span class="block text-[10px] text-slate-400 font-medium">
                      {{ inc.type }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Guard (Reporter) -->
              <td class="px-5 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                {{ inc.guardName || 'Anonymous' }}
              </td>

              <!-- Location -->
              <td class="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                {{ inc.location || '—' }}
              </td>

              <!-- Status -->
              <td class="px-5 py-3.5">
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border"
                  :class="inc.status === 'closed'
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-700 border-amber-500/20'"
                >
                  <span class="w-1 h-1 rounded-full" :class="inc.status === 'closed' ? 'bg-emerald-500' : 'bg-amber-500'" />
                  {{ inc.status || 'open' }}
                </span>
              </td>

              <!-- Closed By -->
              <td class="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                {{ inc.closedBy || '—' }}
              </td>

              <!-- Closed Time -->
              <td class="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                {{ inc.closedTime ? formatDateTime(inc.closedTime) : '—' }}
              </td>

              <!-- Date -->
              <td class="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                {{ formatDateTime(inc.dateTime) }}
              </td>

              <!-- Actions -->
              <td class="px-5 py-3.5 text-right">
                <div class="flex justify-end gap-2 pr-1">




                  <button
                    class="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                    @click.stop="editIncident(inc)"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Dialog Modal: Log / Edit Incident -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div class="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-between items-center shrink-0">
          <h2 class="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-indigo-650" />
            {{ isEditing ? 'Edit Incident Details' : 'Log Security Incident' }}
          </h2>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Form content -->
        <div class="px-8 py-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar bg-slate-50/20">
          <div class="grid grid-cols-2 gap-4">
            <!-- Type / Title -->
            <div class="space-y-1.5 col-span-2 sm:col-span-1">
              <label class="text-[10px] font-black text-slate-450 uppercase tracking-widest">Incident Category *</label>
              <select v-model="form.type" required class="ae-input w-full pr-8">
                <option value="" disabled>Select category...</option>
                <option value="Intruder / Trespassing">Intruder / Trespassing</option>
                <option value="Vandalism / Property Damage">Vandalism / Property Damage</option>
                <option value="Fire Hazard / Alarm">Fire Hazard / Alarm</option>
                <option value="Unsecure Entry / Broken Lock">Unsecure Entry / Broken Lock</option>
                <option value="Suspicious Activity">Suspicious Activity</option>
                <option value="Medical Emergency">Medical Emergency</option>
                <option value="Other">Other Security Event</option>
              </select>
            </div>

            <!-- Severity -->
            <div class="space-y-1.5 col-span-2 sm:col-span-1">
              <label class="text-[10px] font-black text-slate-450 uppercase tracking-widest">Priority Severity *</label>
              <select v-model="form.severity" required class="ae-input w-full pr-8">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <!-- Location -->
            <div class="space-y-1.5 col-span-2 sm:col-span-1">
              <label class="text-[10px] font-black text-slate-455 uppercase tracking-widest">Location / Coordinates *</label>
              <div class="relative">
                <input
                  v-model="form.location"
                  type="text"
                  required
                  placeholder="e.g. North Gate Fence"
                  class="ae-input w-full pr-10"
                />
                <button
                  type="button"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-455 hover:bg-slate-105 hover:text-slate-800 cursor-pointer"
                  title="Use Current GPS Coordinates"
                  @click="fetchGPSCoordinates"
                >
                  <MapPin class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Assigned To -->
            <div class="space-y-1.5 col-span-2 sm:col-span-1">
              <label class="text-[10px] font-black text-slate-450 uppercase tracking-widest">Assign Incident To</label>
              <select v-model="form.assignedTo" class="ae-input w-full pr-8">
                <option value="">Leave Unassigned</option>
                <option v-for="g in guardsList" :key="g.id" :value="g.name">{{ g.name }}</option>
              </select>
            </div>

            <!-- Notes -->
            <div class="space-y-1.5 col-span-2">
              <label class="text-[10px] font-black text-slate-450 uppercase tracking-widest">Incident Notes & Observations *</label>
              <textarea
                v-model="form.description"
                required
                rows="4"
                placeholder="Detail what occurred, any witnesses, and actions taken..."
                class="ae-input w-full py-2 min-h-[90px]"
              />
            </div>

            <!-- Upload Image -->
            <div class="space-y-1.5 col-span-2">
              <label class="text-[10px] font-black text-slate-450 uppercase tracking-widest">Photo Attachments (Image Upload)</label>
              
              <div class="border-2 border-dashed border-slate-200 dark:border-slate-850 hover:border-indigo-500 rounded-xl p-5 transition-colors relative bg-white dark:bg-slate-900 group/dropzone">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  @change="handleImageUpload"
                  title=""
                />
                
                <div v-if="form.images.length === 0" class="flex flex-col items-center justify-center py-4 pointer-events-none">
                  <Upload class="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover/dropzone:text-indigo-500 transition-colors" />
                  <p class="text-xs font-bold text-slate-650 group-hover/dropzone:text-indigo-600 transition-colors">Click to upload or drag image files</p>
                  <p class="text-[10px] text-slate-400 mt-1">PNG, JPG, or WEBP formats up to 5MB</p>
                </div>
                
                <div v-else class="grid grid-cols-4 sm:grid-cols-5 gap-3 relative z-20 pointer-events-none">
                  <div 
                    v-for="(img, idx) in form.images" 
                    :key="idx"
                    class="relative rounded-lg overflow-hidden border border-slate-250 dark:border-slate-800 group/img bg-slate-100"
                  >
                    <img :src="img" class="w-full h-20 object-cover" />
                    <!-- Button must have pointer-events-auto to be clickable! -->
                    <button
                      type="button"
                      class="absolute inset-0 w-full h-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer pointer-events-auto"
                      @click.prevent="removeImage(idx)"
                    >
                      <Trash2 class="w-5 h-5" />
                    </button>
                  </div>
                  
                  <!-- Decorative 'Add More' tile that sits under the file input -->
                  <div class="relative rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center h-20 bg-slate-50 dark:bg-slate-800/50 group-hover/dropzone:border-indigo-400 group-hover/dropzone:bg-indigo-50/50 transition-colors">
                     <Upload class="w-5 h-5 text-slate-400 mb-1 group-hover/dropzone:text-indigo-500 transition-colors" />
                     <span class="text-[9px] font-bold text-slate-500 group-hover/dropzone:text-indigo-600 transition-colors">Add More</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            class="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer"
            @click="showModal = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-5 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
            @click="saveIncident"
          >
            {{ isEditing ? 'Save Changes' : 'Log Incident' }}
          </button>
        </div>
      </div>
    </div>

  </div>

    <!-- Details Modal -->
    <Teleport to="body">
      <div v-if="showDetailsModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in" @click="closeDetails">
        <div class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700 flex flex-col my-auto" @click.stop>
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <h3 class="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
              <FileText class="w-4 h-4 text-indigo-650" />
              Incident Details
            </h3>
            <button class="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors" @click="closeDetails">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-4">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="text-lg font-bold text-slate-900 dark:text-white">{{ selectedIncident.reportId }}</h4>
                <p class="text-xs text-slate-500 font-medium">{{ selectedIncident.type }}</p>
              </div>
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border"
                :class="selectedIncident.status === 'closed'
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-700 border-amber-500/20'"
              >
                <span class="w-1 h-1 rounded-full" :class="selectedIncident.status === 'closed' ? 'bg-emerald-500' : 'bg-amber-500'" />
                {{ selectedIncident.status }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm mt-4">
               <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date / Time</p>
                  <p class="font-medium text-slate-700 dark:text-slate-300">{{ formatDateTime(selectedIncident.dateTime) }}</p>
               </div>
               <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Severity</p>
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border"
                    :class="getSeverityBadgeClass(selectedIncident.severity)"
                  >
                    {{ selectedIncident.severity }}
                  </span>
               </div>
               <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                  <p class="font-medium text-slate-700 dark:text-slate-300">{{ selectedIncident.location || '—' }}</p>
               </div>
               <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned To</p>
                  <p class="font-medium text-slate-700 dark:text-slate-300">{{ selectedIncident.assignedTo || 'Unassigned' }}</p>
               </div>
               <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reporter</p>
                  <p class="font-medium text-slate-700 dark:text-slate-300">{{ selectedIncident.guardName || 'Anonymous' }}</p>
               </div>
            </div>

            <div class="mt-4">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description & Notes</p>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 min-h-[60px]">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ selectedIncident.description }}</p>
              </div>
            </div>
            
            <div v-if="selectedIncident.status === 'closed'" class="mt-4">
               <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Closed By</p>
               <p class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ selectedIncident.closedBy }} at {{ formatDateTime(selectedIncident.closedTime) }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-5 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
            <button class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors" @click="closeDetails">
              Close
            </button>
            <button
              v-if="selectedIncident.status === 'closed' && canCloseIncident"
              class="px-4 py-2 text-xs font-bold bg-transparent border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center shadow-sm cursor-pointer"
              @click="reopenIncidentFromDetails"
            >
              Reopen Incident
            </button>
            <button
              v-if="selectedIncident.status !== 'closed' && canCloseIncident"
              class="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center shadow-sm"
              @click="closeIncidentFromDetails"
            >
              Resolve Incident
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Pro 7-Stage Incident Workflow Modal -->
    <IncidentWorkflowModal
      v-model="showWorkflowModal"
      :incident="selectedWorkflowIncident"
      @updated="fetchIncidents"
    />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});
import { 
  Search, Plus, FileText, X,
  AlertTriangle, Loader2, MapPin, Trash2, Upload, Pencil
} from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { usePlanGuard } from '@/composables/usePlanGuard';
import IncidentWorkflowModal from './IncidentWorkflowModal.vue';

const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all');
const priorityFilter = ref('all');

const setFilter = (status, severity) => {
  statusFilter.value = status;
  priorityFilter.value = severity;
};

const showDetailsModal = ref(false);
const selectedIncident = ref(null);
const { can } = usePlanGuard();
const showWorkflowModal = ref(false);
const selectedWorkflowIncident = ref(null);

const openDetailsPopup = (inc) => {
  selectedIncident.value = inc;
  if (can('incident.workflow')) {
    selectedWorkflowIncident.value = {
      ...inc,
      title: inc.type || inc.title || `Incident ${inc.reportId}`,
      site_name: inc.location || 'Main Site',
      priority: inc.severity || 'Medium',
      reported_by: inc.guardName || 'Security Guard',
      action_log: inc.action_log || [
        { status: 'reported', user: inc.guardName || 'Guard', time: inc.dateTime || new Date().toISOString(), notes: inc.description || 'Initial report' }
      ]
    };
    showWorkflowModal.value = true;
  } else {
    showDetailsModal.value = true;
  }
};

const closeDetails = () => {
  showDetailsModal.value = false;
  selectedIncident.value = null;
};

const closeIncidentFromDetails = () => {
  if (selectedIncident.value) {
    closeIncident(selectedIncident.value);
    closeDetails();
  }
};

const reopenIncidentFromDetails = () => {
  if (selectedIncident.value) {
    reopenIncident(selectedIncident.value);
    closeDetails();
  }
};

const rawUser = authService.getUserData();
const userRole = authService.getUserRole() || 'Guard';
const userName = `${rawUser?.first_name || ''} ${rawUser?.last_name || ''}`.trim() || 'Officer';

// Incident list & configuration
const incidents = ref([]);
const guardsList = ref([]);

// Form State
const form = ref({
  id: null,
  reportId: '',
  type: '',
  severity: 'Medium',
  location: '',
  assignedTo: '',
  description: '',
  images: [],
  status: 'open',
  dateTime: '',
  guardName: '',
  closedBy: '',
  closedTime: ''
});

// Permissions boundary check: guards only see incidents assigned to or logged by them
const canCloseIncident = computed(() => {
  return ['Admin', 'Manager', 'Guard'].includes(userRole);
});

const filteredList = computed(() => {
  let list = incidents.value;

  // 1. Guard Permission Boundary Check
  if (userRole === 'Guard') {
    list = list.filter(inc => 
      String(inc.guardName).toLowerCase() === userName.toLowerCase() ||
      String(inc.assignedTo).toLowerCase() === userName.toLowerCase()
    );
  }

  // 2. Status Filter
  if (statusFilter.value !== 'all') {
    list = list.filter(inc => inc.status === statusFilter.value);
  }

  // 3. Priority Filter
  if (priorityFilter.value !== 'all') {
    list = list.filter(inc => inc.severity === priorityFilter.value);
  }

  // 4. Search Filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(inc => 
      (inc.reportId || '').toLowerCase().includes(q) ||
      (inc.type || '').toLowerCase().includes(q) ||
      (inc.description || '').toLowerCase().includes(q) ||
      (inc.location || '').toLowerCase().includes(q) ||
      (inc.guardName || '').toLowerCase().includes(q) ||
      (inc.assignedTo || '').toLowerCase().includes(q)
    );
  }

  return list;
});

// KPIs
const activeCount = computed(() => filteredList.value.filter(inc => inc.status !== 'closed').length);
const criticalCount = computed(() => filteredList.value.filter(inc => ['High', 'Critical'].includes(inc.severity)).length);
const closedCount = computed(() => filteredList.value.filter(inc => inc.status === 'closed').length);

const fetchIncidents = async () => {
  if (!incidents.value.length) loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId = authService.getTenantId();
    if (!token) return;
    
    // Fetch from Directus API (patrol_alerts collection)
    const endpoint = tenantId 
      ? `${import.meta.env.VITE_API_URL}/items/patrol_alerts?filter[tenant][_eq]=${tenantId}&sort=-date_created&limit=100`
      : `${import.meta.env.VITE_API_URL}/items/patrol_alerts?sort=-date_created&limit=100`;

    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      incidents.value = (data.data || []).map(alert => {
        const titleStr = (alert.title || alert.type || alert.alert_type || '').toLowerCase();
        const isCritical = alert.severity?.toLowerCase() === 'critical' || 
          titleStr.includes('sos') || 
          titleStr.includes('emergency') || 
          titleStr.includes('threat') || 
          titleStr.includes('intruder') ||
          titleStr.includes('duress');

        return {
          ...alert,
          reportId: alert.reportId || `ALT-${alert.id}`,
          type: alert.type || alert.title || alert.alert_type || 'Incident',
          severity: alert.severity ? (alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1).toLowerCase()) : (isCritical ? 'Critical' : 'Medium'),
          dateTime: alert.date_created || alert.timestamp || new Date().toISOString(),
          description: alert.description || alert.message || alert.notes || 'Alert logged',
          guardName: alert.reported_by || alert.guard_name || alert.guard?.firstName || 'Guard',
          location: alert.location || alert.site || alert.zone_name || 'Patrol Site',
          status: alert.status || 'open'
        };
      });
    } else {
      loadFromLocalStorage();
    }
  } catch (err) {
    console.warn("API fallback to local cache:", err);
    loadFromLocalStorage();
  } finally {
    loading.value = false;
  }
};

const loadFromLocalStorage = () => {
  const data = localStorage.getItem('local_incident_reports');
  if (data) {
    try {
      incidents.value = JSON.parse(data);
    } catch {
      incidents.value = [];
    }
  } else {
    incidents.value = [];
  }
};

const saveToLocalStorage = () => {
  localStorage.setItem('local_incident_reports', JSON.stringify(incidents.value));
};

const fetchGuards = async () => {
  try {
    const token = authService.getToken();
    const tenantId = authService.getTenantId();
    if (!token || !tenantId) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/personalModule?filter[tenant][_eq]=${tenantId}&fields=id,firstName,lastName,personalPhone&limit=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      guardsList.value = (data.data || []).map(g => ({
        id: g.id,
        name: `${g.firstName || ''} ${g.lastName || ''}`.trim() || g.personalPhone || 'Guard'
      }));
    } else {
      guardsList.value = [{ id: 1, name: userName }];
    }
  } catch {
    guardsList.value = [{ id: 1, name: userName }];
  }
};

// Actions
const openLogModal = () => {
  isEditing.value = false;
  form.value = {
    id: null,
    reportId: 'INC-' + Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase(),
    type: '',
    severity: 'Medium',
    location: '',
    assignedTo: '',
    description: '',
    images: [],
    status: 'open',
    dateTime: new Date().toISOString(),
    guardName: userName,
    closedBy: '',
    closedTime: ''
  };
  showModal.value = true;
};

const editIncident = (inc) => {
  isEditing.value = true;
  form.value = { ...inc };
  showModal.value = true;
};

const saveIncident = async () => {
  if (!form.value.type || !form.value.location || !form.value.description) {
    alert('Please fill in all mandatory fields.');
    return;
  }

  if (isEditing.value) {
    const idx = incidents.value.findIndex(i => i.id === form.value.id || i.reportId === form.value.reportId);
    if (idx !== -1) {
      incidents.value[idx] = { ...form.value };
    }
  } else {
    // ID managed by Directus on create
    incidents.value.unshift({ ...form.value });
  }

  saveToLocalStorage();
  
  // Try sending to API
  try {
    const token = authService.getToken();
    const tenantId = authService.getTenantId();
    const method = isEditing.value ? 'PATCH' : 'POST';
    const url = isEditing.value 
      ? `${import.meta.env.VITE_API_URL}/items/patrol_alerts/${form.value.id}`
      : `${import.meta.env.VITE_API_URL}/items/patrol_alerts`;
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify((() => { const d = { ...form.value, tenant: tenantId }; if (!isEditing.value) delete d.id; return d; })())
    });
  } catch (e) {
    console.warn("API Sync deferred, saved locally:", e);
  }

  showModal.value = false;
};

const closeIncident = async (inc) => {
  inc.status = 'closed';
  inc.closedBy = userName;
  inc.closedTime = new Date().toISOString();
  saveToLocalStorage();
  
  try {
    const token = authService.getToken();
    await fetch(`${import.meta.env.VITE_API_URL}/items/patrol_alerts/${inc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'closed', closedBy: userName, closedTime: inc.closedTime })
    });
  } catch {}
};

const reopenIncident = async (inc) => {
  inc.status = 'open';
  inc.closedBy = '';
  inc.closedTime = '';
  saveToLocalStorage();

  try {
    const token = authService.getToken();
    await fetch(`${import.meta.env.VITE_API_URL}/items/patrol_alerts/${inc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'open', closedBy: '', closedTime: '' })
    });
  } catch {}
};

const fetchGPSCoordinates = () => {
  if (!navigator.geolocation) {
    alert('Geolocation not supported by browser.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.value.location = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
    },
    () => {
      alert('Could not fetch location permissions.');
    }
  );
};

const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      form.value.images.push(event.target.result);
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (idx) => {
  form.value.images.splice(idx, 1);
};

// Class mappings
const getSeverityBadgeClass = (sev) => {
  if (sev === 'Critical') return 'bg-red-500/10 text-red-700 border-red-500/20';
  if (sev === 'High') return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
  if (sev === 'Medium') return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
  return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

let incidentPollTimer = null;
let isPollingIncidents = false;

onMounted(() => {
  fetchIncidents();
  fetchGuards();
  // Auto-poll every 30 seconds for new device alerts / incidents
  incidentPollTimer = setInterval(async () => {
    if (isPollingIncidents) return;
    isPollingIncidents = true;
    try {
      await fetchIncidents();
    } finally {
      isPollingIncidents = false;
    }
  }, 30000);
});

onUnmounted(() => {
  if (incidentPollTimer) clearInterval(incidentPollTimer);
});
</script>
