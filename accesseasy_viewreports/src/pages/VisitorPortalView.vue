<template>
  <div
    class="min-h-screen font-sans bg-white"
    :style="cssVars"
  >
    <!-- ── Loading ──────────────────────────────────────────────────── -->
    <div
      v-if="loading"
      class="min-h-screen flex flex-col items-center justify-center gap-4 bg-white"
    >
      <div class="w-10 h-10 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin" />
      <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">
        Loading Portal...
      </p>
    </div>

    <!-- ── Error ─────────────────────────────────────────────────────── -->
    <div
      v-else-if="error"
      class="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <div class="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
        <svg
          class="w-10 h-10 text-rose-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        /></svg>
      </div>
      <h1 class="text-2xl font-black text-slate-900">
        Portal Not Found
      </h1>
      <p class="text-sm text-slate-500 max-w-xs">
        {{ error }}
      </p>
      <button
        class="px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
        @click="fetchPortal"
      >
        Retry
      </button>
    </div>

    <!-- ── Main Content ──────────────────────────────────────────────── -->
    <div v-else-if="portal">
      <!-- Sticky Nav -->
      <nav class="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div class="flex items-center gap-3">
          <img
            v-if="logoUrl"
            :src="logoUrl"
            class="h-9 w-9 object-contain rounded-lg"
            @error="logoUrl = null"
          >
          <span class="font-black text-lg text-slate-900 tracking-tight">{{ portal.Title }}</span>
        </div>
        <button
          v-if="content.enableRegistrationForm !== false"
          class="px-5 py-2 rounded-full text-white text-sm font-black shadow-md transition-all active:scale-95"
          :style="{ backgroundColor: content.primaryColor || '#2563eb' }"
          @click="openModal"
        >
          Check In
        </button>
      </nav>

      <!-- Hero -->
      <section class="text-center px-6 py-16 md:py-24 max-w-3xl mx-auto">
        <span
          class="inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-8"
          :style="{ color: content.primaryColor || '#2563eb', backgroundColor: (content.primaryColor || '#2563eb') + '18' }"
        >
          {{ portal.Title }}
        </span>
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
          {{ content.heading || 'Welcome to Our Office' }}
        </h1>
        <p class="text-lg text-slate-500 font-medium mb-12 max-w-xl mx-auto leading-relaxed">
          {{ content.subtext || 'Please register below to receive your visitor pass.' }}
        </p>
        <!-- CTA button below text -->
        <button
          v-if="content.enableRegistrationForm !== false"
          class="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white text-base font-black shadow-lg transition-all active:scale-95 mb-12"
          :style="{ backgroundColor: content.primaryColor || '#2563eb', boxShadow: `0 8px 24px ${(content.primaryColor || '#2563eb')}40` }"
          @click="openModal"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          /></svg>
          {{ content.registrationFormButtonText || 'Register & Get Pass' }}
        </button>
        <!-- Banner Image -->
        <div
          v-if="bannerUrl"
          class="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-100"
        >
          <img
            :src="bannerUrl"
            class="w-full object-cover"
            style="max-height: 380px;"
            @error="bannerUrl = null"
          >
        </div>
      </section>

      <!-- Contact Strip -->
      <section
        v-if="content.enableContact && (content.contactPhone || content.contactEmail)"
        class="flex flex-wrap justify-center gap-3 pb-16 px-6"
      >
        <a
          v-if="content.contactPhone"
          :href="`https://wa.me/${content.contactPhone.replace(/\D/g,'')}`"
          target="_blank"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-bold shadow-md bg-emerald-500 hover:bg-emerald-600 transition-colors"
        >
          <svg
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          ><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
          WhatsApp
        </a>
        <a
          v-if="content.contactEmail"
          :href="`mailto:${content.contactEmail}`"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-bold shadow-md transition-colors"
          :style="{ backgroundColor: content.primaryColor || '#2563eb' }"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"
          /></svg>
          Email Us
        </a>
      </section>

      <!-- Footer -->
      <footer class="py-10 border-t border-slate-100 bg-slate-50 text-center px-6">
        <p class="text-xs font-bold text-slate-400">
          © {{ new Date().getFullYear() }} {{ portal.Title }}. All rights reserved.
        </p>
        <p class="text-[10px] text-slate-300 uppercase tracking-widest mt-1 font-bold">
          Powered by AccessEasy
        </p>
      </footer>
    </div>

    <!-- ── Registration Modal ─────────────────────────────────────────── -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="modalOpen"
          class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <!-- Backdrop -->
          <div
            class="absolute inset-0 bg-black/40 backdrop-blur-sm"
            @click="modalOpen = false"
          />
          <!-- Panel -->
          <div
            class="relative w-full sm:max-w-lg bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
            style="border-radius: 24px 24px 0 0;"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <div>
                <h2 class="text-lg font-black text-slate-900">
                  {{ content.registrationFormTitle || 'Visitor Check-in' }}
                </h2>
                <p class="text-xs font-medium text-slate-400 mt-0.5">
                  {{ content.registrationFormDescription || 'Complete the form to check in.' }}
                </p>
              </div>
              <button
                class="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                @click="modalOpen = false"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                /></svg>
              </button>
            </div>

            <!-- Success Screen -->
            <div
              v-if="submitted"
              class="flex flex-col items-center justify-center gap-5 py-16 px-6 text-center"
            >
              <div
                class="w-20 h-20 rounded-full flex items-center justify-center"
                :style="{ backgroundColor: (content.primaryColor || '#2563eb') + '18' }"
              >
                <svg
                  class="w-10 h-10"
                  :style="{ color: content.primaryColor || '#2563eb' }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-black text-slate-900 mb-2">
                  Checked In!
                </h3>
                <p class="text-sm text-slate-500">
                  Welcome, <strong>{{ visitorData.name }}</strong>. Your visit has been recorded.
                </p>
              </div>
              <div class="w-full bg-slate-50 rounded-2xl p-5 text-left space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="font-bold text-slate-500">Check-in Time</span><span class="font-black text-slate-900">{{ checkInTime }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-bold text-slate-500">Reason</span><span class="font-bold text-slate-700">{{ visitorData.reasonForVisit }}</span>
                </div>
                <div
                  v-if="visitorData.personToMeet"
                  class="flex justify-between"
                >
                  <span class="font-bold text-slate-500">Meeting</span><span class="font-bold text-slate-700">{{ visitorData.personToMeet }}</span>
                </div>
              </div>
              <button
                class="w-full py-3.5 rounded-xl text-white font-black text-sm transition-all active:scale-95"
                :style="{ backgroundColor: content.primaryColor || '#2563eb' }"
                @click="resetModal"
              >
                Done
              </button>
            </div>

            <!-- Form -->
            <div
              v-else
              class="overflow-y-auto flex-1 px-6 py-5 space-y-4"
            >
              <!-- Name -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name <span class="text-rose-500">*</span></label>
                <input
                  v-model="visitorData.name"
                  type="text"
                  placeholder="John Doe"
                  autocomplete="name"
                  class="field-input"
                  :class="{ 'border-rose-400': errors.name }"
                  @blur="validateField('name')"
                >
                <p
                  v-if="errors.name"
                  class="text-[10px] text-rose-500 font-bold"
                >
                  {{ errors.name }}
                </p>
              </div>
              <!-- Mobile -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mobile Number <span class="text-rose-500">*</span></label>
                <input
                  v-model="visitorData.mobile"
                  type="tel"
                  placeholder="+91 98765 43210"
                  autocomplete="tel"
                  class="field-input"
                  :class="{ 'border-rose-400': errors.mobile }"
                  @blur="validateField('mobile')"
                >
                <p
                  v-if="errors.mobile"
                  class="text-[10px] text-rose-500 font-bold"
                >
                  {{ errors.mobile }}
                </p>
              </div>
              <!-- ID Type + Number -->
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Govt ID Type <span class="text-rose-500">*</span></label>
                  <select
                    v-model="visitorData.govtIdType"
                    class="field-input"
                  >
                    <option>Aadhar</option>
                    <option>Driving License</option>
                    <option>Passport</option>
                    <option>Voter ID</option>
                    <option>PAN Card</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Number <span class="text-rose-500">*</span></label>
                  <input
                    v-model="visitorData.govtIdNumber"
                    type="text"
                    placeholder="XXXX-XXXX-XXXX"
                    class="field-input"
                    :class="{ 'border-rose-400': errors.govtIdNumber }"
                    @blur="validateField('govtIdNumber')"
                  >
                </div>
              </div>
              <p
                v-if="errors.govtIdNumber"
                class="text-[10px] text-rose-500 font-bold -mt-2"
              >
                {{ errors.govtIdNumber }}
              </p>

              <!-- Reason for Visit -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reason for Visit <span class="text-rose-500">*</span></label>
                <select
                  v-model="visitorData.reasonForVisit"
                  class="field-input"
                  :class="{ 'border-rose-400': errors.reasonForVisit }"
                  @change="errors.reasonForVisit = ''"
                >
                  <option value="">
                    Select a reason...
                  </option>
                  <option>Meeting / Appointment</option>
                  <option>Interview</option>
                  <option>Delivery / Courier</option>
                  <option>Vendor / Supplier</option>
                  <option>Client Visit</option>
                  <option>Maintenance / Repair</option>
                  <option>Personal Work</option>
                  <option>Other</option>
                </select>
                <input
                  v-if="visitorData.reasonForVisit === 'Other'"
                  v-model="visitorData.reasonForVisitOther"
                  type="text"
                  placeholder="Please describe..."
                  class="field-input mt-2"
                >
                <p
                  v-if="errors.reasonForVisit"
                  class="text-[10px] text-rose-500 font-bold"
                >
                  {{ errors.reasonForVisit }}
                </p>
              </div>

              <!-- Person to Meet -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Person to Meet</label>
                <input
                  v-model="visitorData.personToMeet"
                  type="text"
                  placeholder="e.g. Rajan Kumar"
                  class="field-input"
                >
              </div>

              <!-- Company -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Company / Organisation</label>
                <input
                  v-model="visitorData.company"
                  type="text"
                  placeholder="e.g. Acme Corp"
                  class="field-input"
                >
              </div>

              <!-- Submit error -->
              <p
                v-if="submitError"
                class="text-xs text-rose-500 font-bold text-center py-1"
              >
                {{ submitError }}
              </p>
            </div>

            <!-- Footer / Submit -->
            <div
              v-if="!submitted"
              class="px-6 pb-6 pt-4 shrink-0 border-t border-slate-100"
            >
              <button
                :disabled="submitting"
                class="w-full py-4 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                :style="{ backgroundColor: content.primaryColor || '#2563eb', boxShadow: `0 6px 20px ${(content.primaryColor || '#2563eb')}40` }"
                @click="submitRegistration"
              >
                <svg
                  v-if="submitting"
                  class="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <svg
                  v-else
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                /></svg>
                {{ submitting ? 'Submitting...' : (content.registrationFormButtonText || 'Register & Get Pass') }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();

// ── State ──────────────────────────────────────────────────────────────────
const loading     = ref(true);
const error       = ref(null);
const portal      = ref(null);
const modalOpen   = ref(false);
const submitted   = ref(false);
const submitting  = ref(false);
const submitError = ref('');
const checkInTime = ref('');

const DEFAULT_ASSET_ID = 'b88c5273-ba1e-45db-b874-c34ad791afeb';

// ── Computed helpers ──────────────────────────────────────────────────────
const content = computed(() => portal.value?.Contentjson || {});

const assetUrl = (id) => {
  if (!id || id === DEFAULT_ASSET_ID) return null;
  return `${import.meta.env.VITE_API_URL}/assets/${id}?access_token=${import.meta.env.VITE_API_TOKEN}`;
};

const logoUrl   = ref(null);
const bannerUrl = ref(null);

const cssVars = computed(() => ({
  '--brand': content.value.primaryColor || '#2563eb',
}));

// ── Visitor Data ───────────────────────────────────────────────────────────
const visitorData = ref({
  name: '',
  mobile: '',
  govtIdType: 'Aadhar',
  govtIdNumber: '',
  reasonForVisit: '',
  reasonForVisitOther: '',
  personToMeet: '',
  company: '',
});

const errors = ref({});

// ── Fetch Portal ───────────────────────────────────────────────────────────
const fetchPortal = async () => {
  loading.value = true;
  error.value   = null;
  const id  = route.params.id;

  if (!id) {
    error.value = 'No portal ID provided';
    loading.value = false;
    return;
  }

  try {
    const knativeUrl = `${import.meta.env.VITE_KN_API_URL}/branded-page-flow/${id}`;
    const response = await axios.get(knativeUrl, { timeout: 15000 });

    if (response.data.status === 'SUCCESS') {
      let data = response.data.data;
      
      // Parse JSON fields safely if returned as strings
      if (data && data.Contentjson && typeof data.Contentjson === 'string') {
        try { data.Contentjson = JSON.parse(data.Contentjson); } catch(e) {}
      }
      if (data && data.Assetjson && typeof data.Assetjson === 'string') {
        try { data.Assetjson = JSON.parse(data.Assetjson); } catch(e) {}
      }

      portal.value  = data;
      logoUrl.value   = assetUrl(data.Assetjson?.images?.logo);
      bannerUrl.value = assetUrl(data.Assetjson?.images?.banner);

      if (data.Title) document.title = `${data.Title} | Visitor Check-in`;
    } else {
      error.value = response.data.message || 'Failed to load portal configuration';
    }
  } catch (err) {
    console.error('Fetch error:', err);
    if (err.code === 'ECONNABORTED') {
      error.value = 'Request timed out. Please check your connection and try again.';
    } else {
      error.value = err.response?.data?.message || err.message || 'Failed to load portal.';
    }
  } finally {
    loading.value = false;
  }
};

// ── Modal ─────────────────────────────────────────────────────────────────
const openModal = () => {
  submitted.value  = false;
  submitError.value = '';
  modalOpen.value  = true;
};

const resetModal = () => {
  modalOpen.value = false;
  submitted.value = false;
  visitorData.value = { name: '', mobile: '', govtIdType: 'Aadhar', govtIdNumber: '', reasonForVisit: '', reasonForVisitOther: '', personToMeet: '', company: '' };
  errors.value = {};
};

// ── Validation ─────────────────────────────────────────────────────────────
const validateField = (field) => {
  errors.value[field] = '';
  if (field === 'name'        && !visitorData.value.name.trim())        errors.value.name        = 'Full name is required';
  if (field === 'mobile'      && !visitorData.value.mobile.trim())      errors.value.mobile      = 'Mobile number is required';
  if (field === 'govtIdNumber'&& !visitorData.value.govtIdNumber.trim())errors.value.govtIdNumber= 'ID number is required';
};

const validate = () => {
  ['name','mobile','govtIdNumber'].forEach(validateField);
  if (!visitorData.value.reasonForVisit) errors.value.reasonForVisit = 'Please select a reason';
  if (visitorData.value.reasonForVisit === 'Other' && !visitorData.value.reasonForVisitOther.trim())
    errors.value.reasonForVisit = 'Please describe the reason';
  return !Object.values(errors.value).some(Boolean);
};

// ── Submit ─────────────────────────────────────────────────────────────────
const submitRegistration = async () => {
  submitError.value = '';
  if (!validate()) return;
  submitting.value = true;
  try {
    const reason = visitorData.value.reasonForVisit === 'Other'
      ? visitorData.value.reasonForVisitOther
      : visitorData.value.reasonForVisit;

    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const timeNow = today.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ':00';
    
    // Create an end time that gives them access until Midnight
    const endTime = '23:59:59';

    const payload = {
      personName:           visitorData.value.name,
      mobileNumber:         visitorData.value.mobile,
      email:                visitorData.value.company || '', // Company as email? Or leave blank
      startDate:            startDate,
      endDate:              startDate,
      startTime:            timeNow,
      endTime:              endTime,
      status:               'active',
      quantity:             1,
      tenant:               { tenantId: portal.value.tenant },
      
      // We pass the collected AccessEasy-specific schema data to metadata or matching fields, 
      // but strictly we must map the required FieldEasy signature above.
      personToMeet:         visitorData.value.personToMeet,
      reasonForVisit:       reason,
      govtIdType:           visitorData.value.govtIdType,
      govtIdNumber:         visitorData.value.govtIdNumber,
      portalId:             portal.value.id,
    };

    const directusUrl = `${import.meta.env.VITE_API_URL}/items/visitor`;
    const response = await axios.post(directusUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
      }
    });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(response.data.errors?.[0]?.message || 'Submission failed');
    }

    checkInTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    submitted.value   = true;
  } catch (err) {
    console.error('Submit error:', err);
    submitError.value = err.response?.data?.message || err.message || 'Failed to submit check-in: Please try again.';
  } finally {
    submitting.value = false;
  }
};

onMounted(fetchPortal);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

* { font-family: 'Inter', sans-serif; }

.field-input {
  width: 100%;
  height: 3rem;
  padding: 0 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background-color: #f8fafc;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
}

.field-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

select.field-input {
  cursor: pointer;
}

/* Modal transition */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .relative, .modal-leave-active .relative { transition: transform 0.25s cubic-bezier(0.16,1,0.3,1); }
.modal-enter-from .relative { transform: translateY(40px); }
.modal-leave-to .relative { transform: translateY(40px); }
</style>
