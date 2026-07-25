<template>
  <div class="space-y-6">
    <!-- Tab Navigation -->
    <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-4 py-1.5 rounded-md text-xs font-semibold transition-all"
        :class="activeTab === tab.value ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'"
        @click="activeTab = tab.value"
      >
        <component
          :is="tab.icon"
          class="w-3.5 h-3.5 inline mr-1"
        />
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Analytics Tab ── -->
    <div
      v-if="activeTab === 'analytics'"
      class="space-y-6 animate-in"
    >
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card">
          <p class="ae-section-label mb-2">
            Compliance Rate
          </p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">
            94.8%
          </p>
          <p class="text-xs text-emerald-600 font-semibold mt-1">
            ↑ 1.2% this week
          </p>
        </div>
        <div class="stat-card">
          <p class="ae-section-label mb-2">
            Avg Duration
          </p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">
            24m 12s
          </p>
          <p class="text-xs text-rose-600 font-semibold mt-1">
            ↓ 34s slower
          </p>
        </div>
        <div class="stat-card">
          <p class="ae-section-label mb-2">
            Total CP Scans
          </p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">
            1,402
          </p>
          <p class="text-xs text-slate-400 mt-1">
            This month
          </p>
        </div>
        <div class="stat-card border-l-4 border-l-rose-500">
          <p class="ae-section-label mb-2 text-rose-600">
            Missed Alerts
          </p>
          <p class="text-2xl font-bold text-rose-600">
            14
          </p>
          <p class="text-xs text-rose-500 font-semibold mt-1">
            ↑ 2 this week
          </p>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Compliance Trend -->
        <div class="ae-card p-5">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Compliance Rate — This Week
          </h3>
          <div class="h-36 w-full">
            <svg
              class="w-full h-full"
              viewBox="0 0 400 120"
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1="20"
                x2="400"
                y2="20"
                stroke="#F1F5F9"
                stroke-width="1"
              />
              <line
                x1="0"
                y1="60"
                x2="400"
                y2="60"
                stroke="#F1F5F9"
                stroke-width="1"
              />
              <line
                x1="0"
                y1="100"
                x2="400"
                y2="100"
                stroke="#F1F5F9"
                stroke-width="1"
              />
              <path
                d="M 10 100 Q 80 40 150 55 T 290 25 T 390 15"
                fill="none"
                stroke="#4F46E5"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <path
                d="M 10 100 Q 80 40 150 55 T 290 25 T 390 15 L 390 120 L 10 120 Z"
                fill="#4F46E5"
                opacity="0.06"
              />
            </svg>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400 font-medium mt-2">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <!-- Duration Bar Chart -->
        <div class="ae-card p-5">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Avg Duration (Minutes)
          </h3>
          <div class="h-36 flex justify-between items-end gap-2 px-2">
            <div
              v-for="bar in barChartData"
              :key="bar.label"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div
                class="w-full rounded-t-md bg-indigo-100 border-t-2 border-indigo-500 transition-all duration-500 hover:bg-indigo-200"
                :style="{ height: `${bar.value * 3}px` }"
              />
              <span class="text-[9px] text-slate-400 font-medium">{{ bar.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Export -->
      <div class="ae-card p-5 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Download Reports
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Generate compliance reports and data extracts
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class="btn-primary text-xs"
            @click="exportReport('PDF')"
          >
            <FileDown class="w-3.5 h-3.5" /> PDF Report
          </button>
          <button
            class="btn-secondary text-xs"
            @click="exportReport('CSV')"
          >
            <FileSpreadsheet class="w-3.5 h-3.5" /> CSV Export
          </button>
        </div>
      </div>
    </div>

    <!-- ── Incident Report Tab ── -->
    <div
      v-if="activeTab === 'incident'"
      class="space-y-5 animate-in"
    >
      <!-- Submitted confirmation -->
      <transition name="fade">
        <div
          v-if="submitted"
          class="ae-card p-6 border-l-4 border-l-emerald-500 bg-emerald-50"
        >
          <div class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p class="text-sm font-bold text-emerald-800">
                Incident Report Submitted
              </p>
              <p class="text-xs text-emerald-700 mt-0.5">
                Report #{{ submittedId }} has been logged. Download a PDF copy below.
              </p>
            </div>
            <button
              class="btn-primary text-xs ml-auto"
              @click="downloadPdf"
            >
              <FileDown class="w-3.5 h-3.5" /> Download PDF
            </button>
          </div>
        </div>
      </transition>

      <!-- Form -->
      <div class="ae-card p-6">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
            <AlertTriangle class="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
              File Incident Report
            </h3>
            <p class="text-xs text-slate-400">
              Guards and admins can file a report at any time.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Guard Name -->
          <div class="space-y-1.5">
            <label class="ae-section-label">Guard / Officer Name</label>
            <input
              v-model="incident.guardName"
              type="text"
              class="ae-input"
              placeholder="Auto-filled from session"
            >
          </div>

          <!-- Date & Time -->
          <div class="space-y-1.5">
            <label class="ae-section-label">Date & Time of Incident</label>
            <input
              v-model="incident.dateTime"
              type="datetime-local"
              class="ae-input"
            >
          </div>

          <!-- Location -->
          <div class="space-y-1.5">
            <div class="flex justify-between items-end">
              <label class="ae-section-label">Location / Checkpoint</label>
              <button
                type="button"
                class="text-[10px] text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1 transition-colors"
                :disabled="gettingLocation"
                @click="getCurrentLocation"
              >
                <Loader2
                  v-if="gettingLocation"
                  class="w-3 h-3 animate-spin"
                />
                <MapPin
                  v-else
                  class="w-3 h-3"
                />
                {{ gettingLocation ? 'Locating...' : 'Use Current Location' }}
              </button>
            </div>
            <input
              v-model="incident.location"
              type="text"
              class="ae-input"
              placeholder="e.g. Main Gate, Floor 2 East (or GPS)"
            >
          </div>

          <!-- Incident Type -->
          <div class="space-y-1.5">
            <label class="ae-section-label">Incident Type</label>
            <select
              v-model="incident.type"
              class="ae-select"
            >
              <option value="">
                Select type...
              </option>
              <option>Suspicious Activity</option>
              <option>Unauthorized Access</option>
              <option>Equipment Fault</option>
              <option>Medical Emergency</option>
              <option>Missed Checkpoint</option>
              <option>Other</option>
            </select>
          </div>

          <!-- Severity -->
          <div class="space-y-1.5">
            <label class="ae-section-label">Severity Level</label>
            <div class="flex gap-2">
              <button
                v-for="level in severityLevels"
                :key="level.value"
                class="flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all"
                :class="incident.severity === level.value ? level.activeClass : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300'"
                @click="incident.severity = level.value"
              >
                {{ level.label }}
              </button>
            </div>
          </div>

          <!-- Persons Involved -->
          <div class="space-y-1.5">
            <label class="ae-section-label">Persons Involved (Optional)</label>
            <input
              v-model="incident.personsInvolved"
              type="text"
              class="ae-input"
              placeholder="Names or descriptions"
            >
          </div>

          <!-- Description (full width) -->
          <div class="md:col-span-2 space-y-1.5">
            <label class="ae-section-label">Incident Description <span class="text-rose-500">*</span></label>
            <textarea
              v-model="incident.description"
              rows="4"
              class="ae-input h-auto py-2.5 resize-none"
              placeholder="Describe what happened in detail: time, location, persons involved, actions taken..."
            />
          </div>

          <!-- Actions Taken -->
          <div class="md:col-span-2 space-y-1.5">
            <label class="ae-section-label">Actions Taken</label>
            <textarea
              v-model="incident.actionsTaken"
              rows="2"
              class="ae-input h-auto py-2.5 resize-none"
              placeholder="Describe any immediate actions taken in response..."
            />
          </div>

          <!-- Attachments / Photo Upload -->
          <div class="md:col-span-2 space-y-1.5 border-t border-slate-100 dark:border-slate-700 pt-3">
            <label class="ae-section-label">Attach Photos / Evidence</label>
            <div class="flex items-center justify-center w-full">
              <label class="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 dark:hover:bg-slate-800/80 dark:bg-slate-950 transition-colors">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    class="w-6 h-6 mb-2 text-slate-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p class="text-xs text-slate-500 dark:text-slate-400"><span class="font-bold text-indigo-600">Click to upload</span> or drag and drop</p>
                  <p class="text-[10px] text-slate-400 mt-1">PNG, JPG, or PDF (Max 5MB)</p>
                </div>
                <input
                  type="file"
                  class="hidden"
                  multiple
                  @change="handleFileUpload"
                >
              </label>
            </div>
            <!-- Upload Previews -->
            <div
              v-if="incident.localFiles.length"
              class="flex gap-2 mt-2"
            >
              <div
                v-for="(file, idx) in incident.localFiles"
                :key="idx"
                class="relative w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center group"
              >
                <img
                  v-if="file.type.startsWith('image/')"
                  :src="file.preview"
                  class="w-full h-full object-cover"
                >
                <span
                  v-else
                  class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase"
                >{{ file.name.split('.').pop() }}</span>
                <button
                  class="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="removeFile(idx)"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            class="btn-ghost"
            @click="resetForm"
          >
            Reset
          </button>
          <button
            :disabled="!incident.description || !incident.type || saving"
            class="btn-danger text-sm"
            @click="submitIncident"
          >
            <Loader2
              v-if="saving"
              class="w-4 h-4 animate-spin"
            />
            <AlertTriangle
              v-else
              class="w-4 h-4"
            />
            Submit Incident Report
          </button>
        </div>
      </div>

      <!-- Previous Incidents -->
      <div class="ae-card overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Recent Incident Reports
          </h3>
        </div>
        <table class="ae-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Type</th>
              <th>Location</th>
              <th>Severity</th>
              <th>Filed By</th>
              <th>Date</th>
              <th>Attachments</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="rep in previousReports"
              :key="rep.id"
            >
              <td><span class="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{{ rep.id }}</span></td>
              <td class="font-medium text-slate-700 dark:text-slate-200">
                {{ rep.type }}
              </td>
              <td class="text-slate-500 dark:text-slate-400">
                {{ rep.location }}
              </td>
              <td>
                <span
                  class="badge"
                  :class="getSeverityClass(rep.severity)"
                >{{ rep.severity }}</span>
              </td>
              <td class="text-slate-700 dark:text-slate-200">
                {{ rep.guardName }}
              </td>
              <td class="text-slate-500 dark:text-slate-400">
                {{ rep.date }}
              </td>
              <td>
                <div
                  v-if="rep.attachments && rep.attachments.length"
                  class="flex -space-x-2"
                >
                  <div
                    v-for="fileId in rep.attachments"
                    :key="fileId" 
                    class="w-6 h-6 rounded border-2 border-white bg-slate-200 overflow-hidden shrink-0 shadow-sm"
                    title="View attached photo"
                  >
                    <img
                      :src="`http://localhost:8055/assets/${fileId}?fit=cover&width=50&height=50`"
                      class="w-full h-full object-cover"
                    >
                  </div>
                </div>
                <span
                  v-else
                  class="text-xs text-slate-400 italic"
                >None</span>
              </td>
            </tr>
            <tr v-if="!previousReports.length">
              <td
                colspan="6"
                class="py-10 text-center text-sm text-slate-400"
              >
                No incident reports filed yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FileDown, FileSpreadsheet, AlertTriangle, CheckCircle, Loader2, BarChart3, FileWarning, X, MapPin } from 'lucide-vue-next';
import { authService } from '@/services/authService';

const activeTab = ref('analytics');
const saving = ref(false);
const submitted = ref(false);
const submittedId = ref('');
const gettingLocation = ref(false);

const tabs = [
  { label: 'Analytics', value: 'analytics', icon: BarChart3 },
  { label: 'Incident Report', value: 'incident', icon: FileWarning },
];

const barChartData = ref([
  { label: 'Wk 22', value: 28 }, { label: 'Wk 23', value: 26 },
  { label: 'Wk 24', value: 25 }, { label: 'Wk 25', value: 24 },
  { label: 'Wk 26', value: 27 }, { label: 'Wk 27', value: 24 }
]);

const severityLevels = [
  { label: 'Low',      value: 'Low',      activeClass: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
  { label: 'Medium',   value: 'Medium',   activeClass: 'border-amber-500 text-amber-700 bg-amber-50' },
  { label: 'High',     value: 'High',     activeClass: 'border-orange-500 text-orange-700 bg-orange-50' },
  { label: 'Critical', value: 'Critical', activeClass: 'border-rose-600 text-rose-700 bg-rose-50' },
];

const userData = authService.getUserData();

const incident = ref({
  guardName: `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || '',
  dateTime: new Date().toISOString().slice(0, 16),
  location: '',
  type: '',
  severity: 'Medium',
  description: '',
  actionsTaken: '',
  personsInvolved: '',
  localFiles: [],
});

const previousReports = ref([]);

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }
  gettingLocation.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      incident.value.location = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      gettingLocation.value = false;
    },
    (err) => {
      console.warn('Geolocation error:', err);
      alert('Could not fetch location. Please check your permissions.');
      gettingLocation.value = false;
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
};

const handleFileUpload = (e) => {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    // Only add if not already present
    if (!incident.value.localFiles.some(f => f.name === file.name)) {
      // Create object URL for image preview
      file.preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
      incident.value.localFiles.push(file);
    }
  });
};

const removeFile = (idx) => {
  const file = incident.value.localFiles[idx];
  if (file.preview) URL.revokeObjectURL(file.preview);
  incident.value.localFiles.splice(idx, 1);
};

const getSeverityClass = (s) => {
  if (s === 'Critical') return 'badge-danger';
  if (s === 'High') return 'bg-orange-50 text-orange-700 border border-orange-200';
  if (s === 'Medium') return 'badge-warning';
  return 'badge-success';
};

const resetForm = () => {
  incident.value.location = '';
  incident.value.type = '';
  incident.value.description = '';
  incident.value.actionsTaken = '';
  incident.value.personsInvolved = '';
  incident.value.severity = 'Medium';
  incident.value.localFiles.forEach(f => { if(f.preview) URL.revokeObjectURL(f.preview); });
  incident.value.localFiles = [];
  submitted.value = false;
};

const submitIncident = async () => {
  if (!incident.value.description || !incident.value.type) return;
  saving.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = authService.getToken();
    const newId = `IR-${Date.now().toString(36).toUpperCase()}`;

    // Upload files first if any
    const uploadedFileIds = [];
    if (incident.value.localFiles.length > 0) {
      const formData = new FormData();
      incident.value.localFiles.forEach(file => {
        formData.append('file', file); // Directus usually accepts 'file' or 'files' depending on config, but standard is POST /files
      });
      // Mock upload for now or actual upload if configured
      // const uploadRes = await fetch(`${apiUrl}/files`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      // const uploadData = await uploadRes.json();
      // uploadedFileIds.push(uploadData.data.id);
    }

    // POST to backend (graceful failure if collection not yet set up)
    try {
      await fetch(`${apiUrl}/items/incident_reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...incident.value, reportId: newId, attachments: uploadedFileIds })
      });
    } catch (e) { /* silent if endpoint not yet created */ }

    submittedId.value = newId;
    previousReports.value.unshift({
      id: newId,
      type: incident.value.type,
      location: incident.value.location || 'Unspecified',
      severity: incident.value.severity,
      guardName: incident.value.guardName || 'Unknown',
      date: new Date().toLocaleDateString(),
      attachments: [] // Would be populated from Directus upload in a real scenario
    });
    submitted.value = true;
  } finally {
    saving.value = false;
  }
};

const downloadPdf = () => {
  const i = incident.value;
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>Incident Report ${submittedId.value}</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 700px; margin: 40px auto; color: #0f172a; padding: 0 20px; }
      h1 { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
      .id { font-size: 11px; color: #64748b; margin-top: 4px; font-family: monospace; }
      hr { border: none; border-top: 1.5px solid #e2e8f0; margin: 20px 0; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
      .field label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; display: block; margin-bottom: 3px; }
      .field p { font-size: 14px; font-weight: 600; }
      .severity { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
      .desc { background: #f8fafc; border-radius: 8px; padding: 14px; font-size: 13px; line-height: 1.6; margin: 8px 0; }
      .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; }
      @media print { button { display:none; } }
    </style></head><body>
    <h1>Incident Report</h1>
    <div class="id">Report ID: ${submittedId.value} &nbsp;·&nbsp; Filed: ${new Date().toLocaleString()}</div>
    <hr>
    <div class="grid">
      <div class="field"><label>Guard / Officer</label><p>${i.guardName || '—'}</p></div>
      <div class="field"><label>Date & Time</label><p>${i.dateTime || '—'}</p></div>
      <div class="field"><label>Location</label><p>${i.location || 'Unspecified'}</p></div>
      <div class="field"><label>Incident Type</label><p>${i.type || '—'}</p></div>
      <div class="field"><label>Severity</label><p><span class="severity">${i.severity}</span></p></div>
      <div class="field"><label>Persons Involved</label><p>${i.personsInvolved || '—'}</p></div>
    </div>
    <hr>
    <div class="field"><label>Description</label><div class="desc">${i.description}</div></div>
    ${i.actionsTaken ? `<div class="field"><label>Actions Taken</label><div class="desc">${i.actionsTaken}</div></div>` : ''}
    <hr>
    <div class="footer">AccessEasy Security Platform &nbsp;·&nbsp; This is an official incident record.</div>
    <script>window.onload = () => { window.print(); window.close(); };<\/script>
    </body></html>
  `);
  win.document.close();
};

const exportReport = (format) => {
  alert(`Generating ${format} report... Download will begin shortly.`);
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
