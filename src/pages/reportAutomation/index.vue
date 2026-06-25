<template>
  <div class="h-full overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950 p-6">
    <!-- ── PAGE HEADER ── -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
          <CalendarClock class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Scheduled Reports
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Automate attendance, access &amp; visitor summaries to your inbox.
          </p>
        </div>
      </div>
      <button
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 shadow-sm"
        @click="showHistoryDialog = true"
      >
        <History class="w-4 h-4" />
        Delivery Logs
      </button>
    </div>

    <!-- ── INFO BANNER ── -->
    <div class="flex items-start gap-3 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/30 mb-8">
      <Info class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
      <p class="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
        Enable any report card below and configure its delivery schedule.
        The Temporal scheduler will pick it up automatically — no code changes needed.
      </p>
    </div>

    <!-- ── LOADING ── -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-24"
    >
      <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- ── REPORTS GRID ── -->
    <div
      v-else
      class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
    >
      <div
        v-for="report in reports"
        :key="report.internalId"
        class="rounded-2xl border bg-white dark:bg-slate-900 transition-all duration-300"
        :class="report.enabled
          ? 'border-blue-300 dark:border-blue-700 shadow-md shadow-blue-500/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'"
      >
        <!-- Card Header -->
        <div class="flex items-start gap-3 p-5">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            :style="{ background: report.color + '18' }"
          >
            <component
              :is="report.icon"
              class="w-5 h-5"
              :style="{ color: report.color }"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-slate-900 dark:text-white text-sm">
              {{ report.name }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {{ report.description }}
            </p>
          </div>
          <!-- Toggle -->
          <button
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
            :class="report.enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'"
            @click="toggleReport(report)"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200"
              :class="report.enabled ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Config Panel -->
        <div
          v-if="report.enabled"
          class="border-t border-slate-100 dark:border-slate-800 p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-b-2xl"
        >
          <!-- Frequency -->
          <div>
            <label class="cfg-label">
              <Clock class="w-3 h-3" /> Frequency
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="opt in ['daily','weekly','monthly']"
                :key="opt"
                class="py-2 rounded-lg text-xs font-bold border transition-all duration-150 capitalize"
                :class="report.reportConfig.schedule === opt
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600'"
                @click="report.reportConfig.schedule = opt"
              >
                {{ opt }}
              </button>
            </div>
          </div>

          <!-- Weekly: day picker -->
          <div v-if="report.reportConfig.schedule === 'weekly'">
            <label class="cfg-label"><CalendarDays class="w-3 h-3" /> Delivery Day</label>
            <select
              v-model="report.reportConfig.weekDay"
              class="field-input"
            >
              <option
                v-for="d in weekDays"
                :key="d.value"
                :value="d.value"
              >
                {{ d.title }}
              </option>
            </select>
          </div>

          <!-- Monthly: day of month -->
          <div v-if="report.reportConfig.schedule === 'monthly'">
            <label class="cfg-label"><CalendarRange class="w-3 h-3" /> Day of Month</label>
            <select
              v-model="report.reportConfig.monthDay"
              class="field-input"
            >
              <option
                v-for="d in monthDays"
                :key="d.value"
                :value="d.value"
              >
                {{ d.title }}
              </option>
            </select>
          </div>

          <!-- Delivery Time -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="cfg-label"><Clock class="w-3 h-3" /> Delivery Time</label>
              <input
                v-model="report.reportConfig.scheduleValue"
                type="time"
                class="field-input"
              >
            </div>
            <div>
              <label class="cfg-label"><Globe class="w-3 h-3" /> Timezone</label>
              <select
                v-model="report.reportConfig.timezone"
                class="field-input"
              >
                <option
                  v-for="tz in timezones"
                  :key="tz.value"
                  :value="tz.value"
                >
                  {{ tz.title }}
                </option>
              </select>
            </div>
          </div>

          <!-- Sender Email -->
          <div>
            <label class="cfg-label"><Mail class="w-3 h-3" /> Sender Account</label>
            <select
              v-model="report.reportConfig.fromEmail"
              class="field-input"
            >
              <option value="">
                — Select sender —
              </option>
              <option
                v-for="acc in emailAccounts"
                :key="acc.account_id"
                :value="acc.account_id"
              >
                {{ acc.credentials?.accountName || acc.credentials?.user_email || acc.account_id }}
              </option>
            </select>
            <button
              class="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all duration-150"
              @click="initiateGoogleLogin"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#4285F4"
                  d="M44.5 20H24v8.5h11.7C34.2 33.9 29.6 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.5-4z"
                />
                <path
                  fill="#34A853"
                  d="M6.3 14.7l7 5.1C15 16.1 19.1 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.7 0-14.3 4.6-17.7 11.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M24 45c5.4 0 10.3-1.9 14.1-5l-6.5-5.3C29.5 36.3 26.9 37 24 37c-5.6 0-10.2-3.1-11.7-7.5l-7 5.4C8.7 41.9 15.8 45 24 45z"
                />
                <path
                  fill="#EA4335"
                  d="M44.5 20H24v8.5h11.7c-.8 2.6-2.6 4.7-5 5.9l6.5 5.3C41.7 36.2 45 30.5 45 24c0-1.3-.2-2.7-.5-4z"
                />
              </svg>
              {{ emailAccounts.length === 0 ? 'Sign in with Google' : 'Add another account' }}
            </button>
          </div>
          <!-- Recipients -->
          <div>
            <label class="cfg-label"><Users class="w-3 h-3" /> Recipients</label>
            <div class="relative">
              <div
                class="field-input min-h-[42px] flex flex-wrap gap-1.5 cursor-pointer"
                @click="report._recipientOpen = !report._recipientOpen"
              >
                <template v-if="report.reportConfig.recipientIds?.length">
                  <span
                    v-for="id in report.reportConfig.recipientIds"
                    :key="id"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-semibold"
                  >
                    {{ getMemberName(id) }}
                    <button
                      class="text-blue-400 hover:text-blue-700 ml-0.5"
                      @click.stop="removeRecipient(report, id)"
                    >×</button>
                  </span>
                </template>
                <span
                  v-else
                  class="text-slate-400 dark:text-slate-500 text-xs self-center"
                >Select recipients...</span>
              </div>
              <!-- Dropdown -->
              <div
                v-if="report._recipientOpen"
                class="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto"
              >
                <div class="p-2 border-b border-slate-100 dark:border-slate-800">
                  <input
                    v-model="report._recipientSearch"
                    type="text"
                    placeholder="Search team members..."
                    class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    @click.stop
                  >
                </div>
                <div
                  v-for="member in filteredMembers(report)"
                  :key="member.value"
                  class="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  @click.stop="toggleRecipient(report, member.value)"
                >
                  <div class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <span class="text-xs font-bold text-blue-600 dark:text-blue-400">{{ member.fullName[0] }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {{ member.fullName }}
                    </p>
                    <p class="text-xs text-slate-400 truncate">
                      {{ member.email }}
                    </p>
                  </div>
                  <div
                    class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
                    :class="report.reportConfig.recipientIds?.includes(member.value)
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-slate-300 dark:border-slate-600'"
                  >
                    <Check
                      v-if="report.reportConfig.recipientIds?.includes(member.value)"
                      class="w-2.5 h-2.5 text-white"
                    />
                  </div>
                </div>
                <p
                  v-if="teamMembers.length === 0"
                  class="text-center text-xs text-slate-400 py-4"
                >
                  No team members found.
                </p>
              </div>
            </div>
          </div>

          <!-- CC / BCC tags input -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="cfg-label"><MailPlus class="w-3 h-3" /> CC</label>
              <EmailTagInput
                v-model="report.reportConfig.cc"
                placeholder="Add CC email..."
              />
            </div>
            <div>
              <label class="cfg-label"><MailMinus class="w-3 h-3" /> BCC</label>
              <EmailTagInput
                v-model="report.reportConfig.bcc"
                placeholder="Add BCC email..."
              />
            </div>
          </div>

          <!-- Save Button -->
          <button
            :disabled="report.saving"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-all duration-150 shadow-sm shadow-blue-500/20"
            @click="onSave(report)"
          >
            <div
              v-if="report.saving"
              class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
            />
            <Save
              v-else
              class="w-4 h-4"
            />
            {{ report.saving ? 'Saving…' : 'Save Schedule' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── HISTORY DIALOG ── -->
    <Teleport to="body">
      <div
        v-if="showHistoryDialog"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="showHistoryDialog = false"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="showHistoryDialog = false"
        />
        <div class="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <!-- Dialog Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <History class="w-4 h-4 text-blue-600" />
              </div>
              <span class="font-bold text-slate-900 dark:text-white">Delivery Logs</span>
            </div>
            <button
              class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              @click="showHistoryDialog = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <!-- Loading -->
          <div
            v-if="logsLoading"
            class="flex justify-center py-16"
          >
            <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <!-- Empty -->
          <div
            v-else-if="deliveryLogs.length === 0"
            class="flex flex-col items-center justify-center py-16 text-slate-400"
          >
            <MailX class="w-12 h-12 mb-3 text-slate-300" />
            <p class="text-sm font-semibold">
              No delivery logs yet
            </p>
            <p class="text-xs mt-1">
              Reports will appear here after the scheduler runs.
            </p>
          </div>
          <!-- Table -->
          <div
            v-else
            class="overflow-x-auto max-h-[480px] overflow-y-auto"
          >
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th class="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th class="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th class="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr
                  v-for="log in deliveryLogs"
                  :key="log.id"
                  class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td class="px-6 py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {{ log.module || 'accesseasy' }}
                  </td>
                  <td class="px-6 py-3">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                      <Users class="w-3 h-3" /> {{ log.recipientCount || 0 }}
                    </span>
                  </td>
                  <td class="px-6 py-3">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold"
                      :class="log.status === 'success'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-700'"
                    >
                      <CheckCircle
                        v-if="log.status === 'success'"
                        class="w-3 h-3"
                      />
                      <AlertCircle
                        v-else
                        class="w-3 h-3"
                      />
                      {{ log.status }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {{ formatDate(log.sentAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── TOAST ── -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-4 opacity-0"
        leave-active-class="transition duration-200 ease-in"
        leave-to-class="translate-y-4 opacity-0"
      >
        <div
          v-if="toast.show"
          class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold"
          :class="toast.type === 'success'
            ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-700 text-slate-800 dark:text-white'
            : 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-700 text-slate-800 dark:text-white'"
        >
          <CheckCircle
            v-if="toast.type === 'success'"
            class="w-4 h-4 text-emerald-500 shrink-0"
          />
          <AlertCircle
            v-else
            class="w-4 h-4 text-red-500 shrink-0"
          />
          {{ toast.message }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, defineComponent, h } from 'vue';
import {
  CalendarClock, History, Info, Clock, CalendarDays, CalendarRange,
  Globe, Mail, MailPlus, MailMinus, Users, Save, X,
  CheckCircle, AlertCircle, Check, MailX,
  ClipboardList, DoorOpen, UserCheck, Cpu, ShieldCheck, BarChart3,
} from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const API_BASE = import.meta.env.VITE_API_URL;
const MODULE   = 'accesseasy';

// ── Inline EmailTagInput component ──────────────────────────────────────────
const EmailTagInput = defineComponent({
  props: { modelValue: { type: Array, default: () => [] }, placeholder: String },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const input = ref('');
    const addTag = () => {
      const val = input.value.trim();
      if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) && !props.modelValue.includes(val)) {
        emit('update:modelValue', [...props.modelValue, val]);
      }
      input.value = '';
    };
    const removeTag = (t) => emit('update:modelValue', props.modelValue.filter(x => x !== t));
    const onKey = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } };
    return () => h('div', { class: 'space-y-1' }, [
      props.modelValue.length > 0 && h('div', { class: 'flex flex-wrap gap-1' },
        props.modelValue.map(t => h('span', { key: t, class: 'inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-semibold' }, [
          t,
          h('button', { onClick: () => removeTag(t), class: 'text-blue-400 hover:text-blue-700 leading-none ml-1' }, '×'),
        ]))
      ),
      h('input', {
        value: input.value,
        onInput: e => { input.value = e.target.value; },
        onKeydown: onKey,
        onBlur: addTag,
        placeholder: props.placeholder,
        class: 'field-input',
        type: 'email',
      }),
    ]);
  },
});

// ── STATE ──────────────────────────────────────────────────────────────────────
const loading          = ref(false);
const logsLoading      = ref(false);
const teamMembers      = ref([]);
const emailAccounts    = ref([]);
const deliveryLogs     = ref([]);
const showHistoryDialog = ref(false);
const configId         = ref(null);
const tenantId         = ref(null);
const token            = ref(null);
const toast            = ref({ show: false, message: '', type: 'success' });
let   toastTimer       = null;

// ── STATIC OPTIONS ─────────────────────────────────────────────────────────────
const weekDays = [
  { title: 'Monday', value: 'monday' }, { title: 'Tuesday', value: 'tuesday' },
  { title: 'Wednesday', value: 'wednesday' }, { title: 'Thursday', value: 'thursday' },
  { title: 'Friday', value: 'friday' }, { title: 'Saturday', value: 'saturday' },
  { title: 'Sunday', value: 'sunday' },
];
function ordinal(n) {
  const s = ['th','st','nd','rd']; const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
const monthDays = [
  ...Array.from({ length: 31 }, (_, i) => ({ title: `${i+1}${ordinal(i+1)}`, value: i+1 })),
  { title: 'Last day of month', value: -1 },
];
const timezones = [
  { title: 'Asia/Kolkata (UTC+5:30)',     value: 'Asia/Kolkata'        },
  { title: 'Asia/Dubai (UTC+4)',           value: 'Asia/Dubai'          },
  { title: 'Asia/Singapore (UTC+8)',       value: 'Asia/Singapore'      },
  { title: 'Europe/London (UTC+0)',        value: 'Europe/London'       },
  { title: 'America/New_York (UTC-5)',     value: 'America/New_York'    },
  { title: 'America/Los_Angeles (UTC-8)', value: 'America/Los_Angeles' },
  { title: 'Australia/Sydney (UTC+10)',    value: 'Australia/Sydney'    },
  { title: 'UTC',                          value: 'UTC'                 },
];

// ── REPORT DEFINITIONS ─────────────────────────────────────────────────────────
function mkReport(internalId, name, description, icon, color) {
  return {
    internalId, name, description, icon, color,
    enabled: false, saving: false,
    _recipientOpen: false, _recipientSearch: '',
    reportConfig: {
      reportName: name, schedule: 'daily', scheduleValue: '18:00',
      timezone: 'Asia/Kolkata', weekDay: 'monday', monthDay: 1,
      recipientIds: [], fromEmail: '', cc: [], bcc: [],
    },
  };
}

const reports = ref([
  mkReport('access-log-report', 'Employee Entry Logs', 'Summarizes total entries, granted vs denied events, and doors accessed by employees.', DoorOpen, '#0891b2'),
  mkReport('visitor-activity', 'Visitor Entry Logs', 'Summarizes daily visitor registrations, guard approvals, and check-in/out activities.', UserCheck, '#10b981'),
]);

// ── HELPERS ────────────────────────────────────────────────────────────────────
const hdrs = () => ({ Authorization: `Bearer ${token.value}`, 'Content-Type': 'application/json' });

const showToast = (message, type = 'success') => {
  clearTimeout(toastTimer);
  toast.value = { show: true, message, type };
  toastTimer = setTimeout(() => { toast.value.show = false; }, 3500);
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const getMemberName = (id) =>
  teamMembers.value.find(m => m.value === id)?.fullName || id;

const filteredMembers = (report) => {
  const q = (report._recipientSearch || '').toLowerCase();
  if (!q) return teamMembers.value;
  return teamMembers.value.filter(m =>
    m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  );
};

const toggleRecipient = (report, id) => {
  const ids = report.reportConfig.recipientIds || [];
  report.reportConfig.recipientIds = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
};

const removeRecipient = (report, id) => {
  report.reportConfig.recipientIds = (report.reportConfig.recipientIds || []).filter(x => x !== id);
};

// Close dropdowns on outside click
const closeDropdowns = (e) => {
  if (!e.target.closest('.relative')) {
    reports.value.forEach(r => { r._recipientOpen = false; });
  }
};

// ── API ────────────────────────────────────────────────────────────────────────
const fetchTeamMembers = async () => {
  try {
    const url = `${API_BASE}/items/personalModule?limit=500` +
      `&fields[]=id&fields[]=assignedUser.id&fields[]=assignedUser.first_name` +
      `&fields[]=assignedUser.last_name&fields[]=assignedUser.email` +
      `&sort[]=-date_created` +
      `&filter[assignedUser][tenant][tenantId][_eq]=${tenantId.value}`;
    const res  = await fetch(url, { headers: hdrs() });
    const data = await res.json();
    teamMembers.value = (data.data || []).map(m => {
      const u = m.assignedUser;
      const name = `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || 'Unnamed';
      return { value: m.id, fullName: name, email: u?.email || '—' };
    });
  } catch (e) { console.error('[ReportAutomation] fetchTeamMembers:', e); }
};

const fetchEmailAccounts = async () => {
  try {
    const res  = await fetch(
      `${API_BASE}/items/integration_accounts` +
      `?filter[tenant_id][_eq]=${tenantId.value}` +
      `&filter[connector_key][_in]=google,google_email`,
      { headers: hdrs() },
    );
    const data = await res.json();
    emailAccounts.value = data.data || [];
  } catch (e) { console.error('[ReportAutomation] fetchEmailAccounts:', e); }
};

const initiateGoogleLogin = async () => {
  const authWin = window.open('about:blank', 'GoogleAuth', 'width=600,height=700');
  try {
    const response = await fetch(
      `${import.meta.env.VITE_KNATIVE_BASE || 'https://appv1.fieldseasy.com/kn'}/google-redirect`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
        body: JSON.stringify({ action: 'get_url', tenant_id: tenantId.value }),
      },
    );
    if (response.ok) {
      const d = await response.json();
      const url = d.url || d.authUrl;
      if (url && authWin) authWin.location.href = url;
    } else if (authWin) authWin.close();
  } catch (err) { if (authWin) authWin.close(); }
};

function handleIntegrationMessage(event) {
  if (event.data?.type === 'INTEGRATION_SUCCESS') fetchEmailAccounts();
}

const fetchConfig = async () => {
  try {
    const res  = await fetch(
      `${API_BASE}/items/reportTenantConfig` +
      `?filter[tenantId][_eq]=${tenantId.value}&filter[module][_eq]=${MODULE}&limit=1`,
      { headers: hdrs() },
    );
    const data = await res.json();
    const cfgRecord = data.data?.[0];
    configId.value = cfgRecord?.id || null;

    if (cfgRecord?.reportConfig) {
      Object.keys(cfgRecord.reportConfig).forEach(key => {
        const match = reports.value.find(r => r.internalId === key);
        if (match) {
          const item = cfgRecord.reportConfig[key];
          match.enabled = !!item.enabled;
          match.reportConfig = {
            ...match.reportConfig, ...item,
            cc:  Array.isArray(item.cc)  ? item.cc  : (item.cc  ? item.cc.split(',').map(s => s.trim()).filter(Boolean)  : []),
            bcc: Array.isArray(item.bcc) ? item.bcc : (item.bcc ? item.bcc.split(',').map(s => s.trim()).filter(Boolean) : []),
          };
        }
      });
    }
  } catch (e) { console.error('[ReportAutomation] fetchConfig:', e); }
};

const fetchDeliveryLogs = async () => {
  logsLoading.value = true;
  try {
    const res  = await fetch(
      `${API_BASE}/items/reportAutomationLogs` +
      `?filter[tenantId][_eq]=${tenantId.value}` +
      `&filter[module][_eq]=${MODULE}&sort[]=-sentAt&limit=50`,
      { headers: hdrs() },
    );
    const data = await res.json();
    deliveryLogs.value = data.data || [];
  } catch (e) { console.error('[ReportAutomation] fetchDeliveryLogs:', e); }
  finally { logsLoading.value = false; }
};

// ── EVENTS ─────────────────────────────────────────────────────────────────────
const toggleReport = (report) => {
  report.enabled = !report.enabled;
  onSave(report);
};

const onSave = async (focusedReport) => {
  focusedReport.saving = true;

  if (focusedReport.enabled) {
    if (!focusedReport.reportConfig.recipientIds?.length) {
      showToast('Please select at least one recipient.', 'error');
      focusedReport.saving = false;
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const field of ['cc','bcc']) {
      for (const email of (focusedReport.reportConfig[field] || [])) {
        if (!emailRe.test(email.trim())) {
          showToast(`Invalid email in ${field.toUpperCase()}: ${email}`, 'error');
          focusedReport.saving = false; return;
        }
      }
    }
  }

  // Re-check for existing record to avoid duplicates
  let cid = configId.value;
  if (!cid) {
    try {
      const check = await fetch(
        `${API_BASE}/items/reportTenantConfig?filter[tenantId][_eq]=${tenantId.value}&filter[module][_eq]=${MODULE}&limit=1&fields=id`,
        { headers: hdrs() },
      );
      const cd = await check.json();
      if (cd.data?.length > 0) { cid = cd.data[0].id; configId.value = cid; }
    } catch (_) {}
  }

  const manifest = {};
  reports.value.forEach(r => {
    manifest[r.internalId] = {
      ...r.reportConfig,
      cc:  Array.isArray(r.reportConfig.cc)  ? r.reportConfig.cc.join(', ')  : (r.reportConfig.cc  || ''),
      bcc: Array.isArray(r.reportConfig.bcc) ? r.reportConfig.bcc.join(', ') : (r.reportConfig.bcc || ''),
      enabled: r.enabled, reportName: r.name, lastUpdated: new Date().toISOString(),
    };
  });

  const payload = { status: 'published', tenantId: tenantId.value, module: MODULE, reportConfig: manifest };

  try {
    let response;
    if (cid) {
      response = await fetch(`${API_BASE}/items/reportTenantConfig/${cid}`, {
        method: 'PATCH', headers: hdrs(), body: JSON.stringify(payload),
      });
      if (response.status === 404) cid = null;
    }
    if (!cid) {
      response = await fetch(`${API_BASE}/items/reportTenantConfig`, {
        method: 'POST', headers: hdrs(), body: JSON.stringify(payload),
      });
      const d = await response.json();
      configId.value = d.data?.id || null;
    }
    showToast(`"${focusedReport.name}" schedule saved ✓`);
  } catch (e) {
    console.error('[ReportAutomation] onSave:', e);
    showToast('Failed to save.', 'error');
  } finally {
    focusedReport.saving = false;
  }
};

watch(showHistoryDialog, (val) => {
  if (val && deliveryLogs.value.length === 0) fetchDeliveryLogs();
});

// ── INIT ───────────────────────────────────────────────────────────────────────
onMounted(async () => {
  loading.value = true;
  token.value   = authService.getToken();
  await currentUserTenant.initialize();
  tenantId.value = await currentUserTenant.getTenantIdAsync();
  await Promise.all([fetchTeamMembers(), fetchEmailAccounts(), fetchConfig()]);
  window.addEventListener('click', closeDropdowns);
  window.addEventListener('message', handleIntegrationMessage);
  loading.value = false;
});

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns);
  window.removeEventListener('message', handleIntegrationMessage);
  clearTimeout(toastTimer);
});
</script>

<style scoped>
.cfg-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin-bottom: 6px;
}
:global(.dark) .cfg-label {
  color: #94a3b8;
}
:global(.field-input) {
  width: 100%;
  padding: 8px 12px;
  font-size: 0.875rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #0f172a;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
:global(.field-input:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}
:global(.dark .field-input) {
  border-color: #334155;
  background: #0f172a;
  color: #f1f5f9;
}
</style>
