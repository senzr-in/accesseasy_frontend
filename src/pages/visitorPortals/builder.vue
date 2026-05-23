<template>
  <div class="h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 font-sans overflow-hidden">

    <!-- ── Header ────────────────────────────────────────────────────────── -->
    <div class="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shrink-0 shadow-sm">
      <div>
        <h1 class="text-base font-black text-slate-900 dark:text-white">Visitor Portal Settings</h1>
        <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Configure your check-in portal</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="router.push('/dashboard/visitor-portals')"
          class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800">
          ← Back
        </button>
        <button @click="savePage" :disabled="saving"
          class="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-500/20">
          <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
          <Save v-else class="w-3.5 h-3.5" />
          Save &amp; Publish
        </button>
      </div>
    </div>

    <!-- ── Body: Simplified Form ──────────────────────────────────────────── -->
    <div class="flex-1 overflow-y-auto p-6 md:p-12 flex justify-center">
      <div class="w-full max-w-2xl space-y-8 pb-12">
        
        <!-- Form Card -->
        <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          
          <!-- Section: Identity -->
          <div class="p-8 border-b border-slate-100 dark:border-zinc-800 space-y-6">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon class="w-3.5 h-3.5 text-blue-500" /> Brand Identity
            </h3>
            
            <div class="flex flex-col md:flex-row gap-8 items-start">
              <!-- Logo Upload -->
              <div class="shrink-0">
                <div @click="$refs.logoInput.click()"
                  class="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-700 flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden transition-all group bg-slate-50 dark:bg-zinc-950">
                  <img v-if="pageConfig.logoPreview" :src="pageConfig.logoPreview" class="max-w-full max-h-full object-contain p-4 transition-transform group-hover:scale-105" />
                  <div v-else class="flex flex-col items-center gap-1 text-slate-400 group-hover:text-blue-500">
                    <Plus class="w-8 h-8" />
                    <span class="text-[10px] font-bold uppercase tracking-widest">Logo</span>
                  </div>
                </div>
                <input ref="logoInput" type="file" class="hidden" accept="image/*" @change="handleLogoChange" />
                <button @click="$refs.logoInput.click()" class="w-full mt-3 text-[10px] text-blue-500 font-bold hover:underline">Change Logo</button>
              </div>

              <!-- General Fields -->
              <div class="flex-1 w-full space-y-5">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Portal Title</label>
                  <input v-model="pageConfig.title" type="text" placeholder="e.g. Main Office Reception"
                    class="w-full h-11 px-4 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-950 text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                </div>
                
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Brand Color</label>
                  <div class="flex items-center gap-4">
                    <div class="relative w-12 h-11 overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-700">
                      <input v-model="pageConfig.primaryColor" type="color" class="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer bg-transparent border-0" />
                    </div>
                    <input v-model="pageConfig.primaryColor" type="text"
                      class="flex-1 h-11 px-4 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-950 text-sm font-mono text-slate-600 dark:text-zinc-300 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Registration & Default Group -->
          <div class="p-8 space-y-6 bg-slate-50/50 dark:bg-zinc-900/50">
            <div class="flex items-center justify-between">
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ClipboardSignature class="w-3.5 h-3.5 text-blue-500" /> Check-in Experience
              </h3>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="pageConfig.enableRegistrationForm" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span class="ms-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Enabled</span>
              </label>
            </div>

            <div v-if="pageConfig.enableRegistrationForm" class="space-y-4">
               <div class="space-y-1.5">
                 <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Default Visitor Access Group</label>
                 <select v-model="pageConfig.defaultAccessLevel"
                   class="w-full h-11 px-4 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-950 text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer">
                   <option :value="null" disabled>Select Access Group</option>
                   <option v-for="group in accessLevels" :key="group.id" :value="group.id">{{ group.accessLevelName }}</option>
                 </select>
                 <p class="text-[10px] text-slate-400 font-medium">This access group will be automatically assigned to all new visitors.</p>
               </div>
            </div>
          </div>

          <!-- Section: Form Fields Customizer -->
          <div v-if="pageConfig.enableRegistrationForm" class="p-8 border-t border-slate-100 dark:border-zinc-800 space-y-5">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <SlidersHorizontal class="w-3.5 h-3.5 text-blue-500" /> Form Fields Customizer
            </h3>
            <p class="text-[10px] font-medium text-slate-400 -mt-2">Choose which fields are displayed, which are required, and customize their labels and placeholders.</p>

            <div class="space-y-4">
              <div v-for="(field, key) in pageConfig.fieldsConfig" :key="key" 
                class="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 transition-all duration-300"
                :class="{ 'opacity-60': !field.visible }">
                
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <!-- Field Header & Icon -->
                  <div class="flex items-center gap-4">
                    <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Camera v-if="key === 'photo'" class="w-4 h-4 text-blue-500" />
                      <FileUp v-else-if="key === 'proofDocument'" class="w-4 h-4 text-blue-500" />
                      <ShieldOff v-else-if="key === 'govtId'" class="w-4 h-4 text-blue-500" />
                      <SlidersHorizontal v-else class="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-slate-700 dark:text-slate-200 capitalize">{{ key.replace(/([A-Z])/g, ' $1') }}</h4>
                      <p class="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                        {{ key === 'name' || key === 'mobile' ? 'Core Field' : 'Optional Field' }}
                      </p>
                    </div>
                  </div>

                  <!-- Action Toggles -->
                  <div class="flex items-center gap-6 justify-between md:justify-end">
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visible</span>
                      <label class="relative inline-flex items-center cursor-pointer" :class="{ 'pointer-events-none opacity-50': key === 'name' || key === 'mobile' }">
                        <input type="checkbox" v-model="field.visible" :disabled="key === 'name' || key === 'mobile'" @change="!field.visible && (field.required = false)" class="sr-only peer">
                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest" :class="{ 'opacity-50': !field.visible }">Required</span>
                      <label class="relative inline-flex items-center cursor-pointer" :class="{ 'pointer-events-none opacity-50': !field.visible || key === 'name' || key === 'mobile' }">
                        <input type="checkbox" v-model="field.required" :disabled="!field.visible || key === 'name' || key === 'mobile'" class="sr-only peer">
                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Editable Labels & Placeholders -->
                <div v-if="field.visible" class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-900 animate-in fade-in duration-200">
                  <div class="space-y-1">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custom Field Label</span>
                    <input v-model="field.label" type="text" 
                      class="w-full h-9 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-200 outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div class="space-y-1">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custom Placeholder</span>
                    <input v-model="field.placeholder" type="text" 
                      class="w-full h-9 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-200 outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        <!-- Preview Note -->
        <div class="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20">
          <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
            <Layout class="w-4 h-4" />
          </div>
          <div>
            <p class="text-xs font-bold text-blue-900 dark:text-blue-300">Live Preview Link</p>
            <p class="text-[10px] font-medium text-blue-700/70 dark:text-blue-400/70">{{ previewUrl }}</p>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Save Success Modal ─────────────────────────────────────────────── -->
    <div v-if="saveSuccessDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="saveSuccessDialog = false"></div>
      <div class="relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check class="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">Portal Published!</h3>
        <p class="text-sm font-medium text-slate-500 mb-6">Your visitor portal is now ready to use.</p>

        <!-- Share Row -->
        <div class="flex justify-center gap-2 mb-6">
          <button @click="copyToClipboard(previewUrl)"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-bold hover:bg-slate-200 transition-colors">
            <Copy class="w-3.5 h-3.5" /> Copy Link
          </button>
          <button @click="shareWhatsApp(previewUrl)"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 transition-colors">
            <MessageCircle class="w-3.5 h-3.5" /> WhatsApp
          </button>
        </div>

        <button @click="saveSuccessDialog = false; router.push('/dashboard/visitor-portals')"
          class="w-full py-3 rounded-xl font-black text-sm text-white bg-slate-900 dark:bg-blue-600 hover:opacity-90 active:scale-95 transition-all shadow-lg">
          Back to My Portals
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authService } from '@/services/authService';
import {
  Loader2, Settings, Image as ImageIcon, Plus, Layout, UploadCloud,
  ClipboardSignature, Save, Check, Copy, MessageCircle, Mail, Phone, X,
  SlidersHorizontal, Camera, FileUp, ShieldOff
} from 'lucide-vue-next';

const route  = useRoute();
const router = useRouter();

const defaultMessageHandler = {
  showSuccess: (msg) => console.log('[OK]', msg),
  showError:   (msg) => console.error('[ERR]', msg),
};
const messageHandler = inject('messageHandler', defaultMessageHandler);

// ── State ──────────────────────────────────────────────────────────────────
const saving               = ref(false);
const saveSuccessDialog    = ref(false);
const accessLevels         = ref([]);

// ── Assets ─────────────────────────────────────────────────────────────────
const DEFAULT_ASSET_ID  = 'b88c5273-ba1e-45db-b874-c34ad791afeb';
const getAssetUrl = (id) => `${import.meta.env.VITE_API_URL}/assets/${id}?access_token=${import.meta.env.VITE_API_TOKEN}`;
const DEFAULT_ASSET_URL = getAssetUrl(DEFAULT_ASSET_ID);

// ── Page Config ────────────────────────────────────────────────────────────
const pageConfig = ref({
  id: null,
  title: 'Visitor Portal',
  theme: 'Modern Blue',
  bannerHeading: 'Welcome to Our Office',
  bannerSubtext: 'Please register below to receive your visitor pass.',
  primaryColor: '#2563eb',
  logoPreview:   DEFAULT_ASSET_URL,
  logoId:        DEFAULT_ASSET_ID,
  bannerPreview: DEFAULT_ASSET_URL,
  bannerId:      DEFAULT_ASSET_ID,
  enableRegistrationForm: true,
  registrationFormTitle:       'Visitor Check-in',
  registrationFormDescription: 'Enter your details securely. Your data is protected.',
  registrationFormButtonText:  'Register & Get Pass',
  enableContact: false,
  contactPhone:  '',
  contactEmail:  '',
  status: 'published',
  defaultAccessLevel: null,
  // Optional Fields (legacy)
  enablePhotoUpload: false,
  enableProofUpload: false,
  govtIdOptional:    false,
  // New Customizable Fields Config
  fieldsConfig: {
    name: { visible: true, required: true, label: 'Full Name', placeholder: 'John Doe' },
    mobile: { visible: true, required: true, label: 'Mobile Number', placeholder: '+91 98765 43210' },
    email: { visible: false, required: false, label: 'Email Address', placeholder: 'john@example.com' },
    govtId: { visible: true, required: true, label: 'Government ID', placeholder: 'XXXX-XXXX-XXXX' },
    reasonForVisit: { visible: true, required: true, label: 'Reason for Visit', placeholder: 'Select a reason...' },
    personToMeet: { visible: true, required: false, label: 'Person to Meet', placeholder: 'e.g. Rajan Kumar' },
    company: { visible: true, required: false, label: 'Company / Organisation', placeholder: 'e.g. Acme Corp' },
    photo: { visible: false, required: false, label: 'Your Photo', placeholder: 'Tap to take / upload photo' },
    proofDocument: { visible: false, required: false, label: 'ID Proof Document', placeholder: 'Upload ID proof (image or PDF)' }
  }
});

// ── Preview URL ────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_UI_URL || 'http://localhost:3000';
const previewUrl = computed(() =>
  pageConfig.value.id
    ? `${BASE_URL}/visit/${pageConfig.value.id}`
    : `${BASE_URL}/visit/preview-pending`
);

// ── File Handlers ──────────────────────────────────────────────────────────
const selectedLogoFile   = ref(null);

const handleLogoChange = (e) => {
  const file = e.target.files[0];
  if (file) { selectedLogoFile.value = file; pageConfig.value.logoPreview = URL.createObjectURL(file); }
};

const uploadFile = async (file, prefix) => {
  if (!file) return null;
  try {
    const formData = new FormData();
    formData.append('file', file, `${prefix}-${authService.getTenantId()}-${Date.now()}.png`);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authService.getToken()}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return (await res.json()).data.id;
  } catch (err) {
    console.error('Upload error:', err);
    return null;
  }
};

// ── Save ───────────────────────────────────────────────────────────────────
const savePage = async () => {
  saving.value = true;
  try {
    const tenantId = authService.getTenantId();

    if (selectedLogoFile.value) {
      const id = await uploadFile(selectedLogoFile.value, 'portal-logo');
      if (id) { pageConfig.value.logoId = id; selectedLogoFile.value = null; }
    }

    // Keep legacy flags in perfect sync with the new fieldsConfig before saving
    if (pageConfig.value.fieldsConfig) {
      pageConfig.value.enablePhotoUpload = !!pageConfig.value.fieldsConfig.photo?.visible;
      pageConfig.value.enableProofUpload = !!pageConfig.value.fieldsConfig.proofDocument?.visible;
      pageConfig.value.govtIdOptional = !pageConfig.value.fieldsConfig.govtId?.required;
    }

    const payload = {
      Title:  pageConfig.value.title,
      status: pageConfig.value.status,
      tenant: tenantId,
      Contentjson: {
        heading:                     pageConfig.value.bannerHeading,
        subtext:                     pageConfig.value.bannerSubtext,
        theme:                       pageConfig.value.theme,
        primaryColor:                pageConfig.value.primaryColor,
        enableRegistrationForm:      pageConfig.value.enableRegistrationForm,
        registrationFormTitle:       pageConfig.value.registrationFormTitle,
        registrationFormDescription: pageConfig.value.registrationFormDescription,
        registrationFormButtonText:  pageConfig.value.registrationFormButtonText,
        enableContact:               pageConfig.value.enableContact,
        contactPhone:                pageConfig.value.contactPhone,
        contactEmail:                pageConfig.value.contactEmail,
        defaultAccessLevel:          pageConfig.value.defaultAccessLevel,
        // Legacy Optional Fields
        enablePhotoUpload:           pageConfig.value.enablePhotoUpload,
        enableProofUpload:           pageConfig.value.enableProofUpload,
        govtIdOptional:              pageConfig.value.govtIdOptional,
        // New customizable fields config
        fieldsConfig:                pageConfig.value.fieldsConfig,
      },
      Assetjson: { images: { logo: pageConfig.value.logoId, banner: pageConfig.value.bannerId } },
    };

    if (pageConfig.value.id) {
      await authService.protectedApi.patch(`/items/BrandedPages/${pageConfig.value.id}`, payload);
    } else {
      const res = await authService.protectedApi.post('/items/BrandedPages', payload);
      pageConfig.value.id = res.data.data.id;
    }
    saveSuccessDialog.value = true;
  } catch (err) {
    console.error('Save error:', err);
    messageHandler.showError('Failed to save portal config.');
  } finally {
    saving.value = false;
  }
};

// ── Share helpers ─────────────────────────────────────────────────────────
const copyToClipboard = (text) => {
  if (text.includes('preview-pending')) {
    messageHandler.showError('Save the portal first to generate a shareable link.');
    return;
  }
  navigator.clipboard.writeText(text);
  messageHandler.showSuccess('URL copied to clipboard!');
};

const shareWhatsApp = (url) => {
  if (url.includes('preview-pending')) { messageHandler.showError('Save the portal first.'); return; }
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out our visitor portal: ' + url)}`, '_blank');
};

// ── Load existing ─────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const tenantId = authService.getTenantId();
    const alRes = await authService.protectedApi.get('/items/accesslevels', {
      params: {
         'filter[tenant][_eq]': tenantId,
         'filter[status][_neq]': 'archived',
         'fields': 'id,accessLevelName'
      }
    });
    accessLevels.value = alRes.data.data || [];
  } catch (e) {
    console.error('Failed to load access levels', e);
  }

  const pageId = route.params.id;
  if (!pageId) return;
  try {
    const res = await authService.protectedApi.get(`/items/BrandedPages/${pageId}`);
    const d = res.data.data;
    if (!d) return;
    pageConfig.value.id    = d.id;
    pageConfig.value.title = d.Title;
    if (d.Contentjson) {
      pageConfig.value.bannerHeading              = d.Contentjson.heading                     ?? pageConfig.value.bannerHeading;
      pageConfig.value.bannerSubtext              = d.Contentjson.subtext                     ?? pageConfig.value.bannerSubtext;
      pageConfig.value.theme                      = d.Contentjson.theme                       ?? pageConfig.value.theme;
      pageConfig.value.primaryColor               = d.Contentjson.primaryColor                ?? pageConfig.value.primaryColor;
      pageConfig.value.enableRegistrationForm     = d.Contentjson.enableRegistrationForm      ?? true;
      pageConfig.value.registrationFormTitle      = d.Contentjson.registrationFormTitle       ?? pageConfig.value.registrationFormTitle;
      pageConfig.value.registrationFormDescription= d.Contentjson.registrationFormDescription ?? pageConfig.value.registrationFormDescription;
      pageConfig.value.registrationFormButtonText = d.Contentjson.registrationFormButtonText  ?? pageConfig.value.registrationFormButtonText;
      pageConfig.value.enableContact              = d.Contentjson.enableContact               ?? false;
      pageConfig.value.contactPhone               = d.Contentjson.contactPhone                ?? '';
      pageConfig.value.contactEmail               = d.Contentjson.contactEmail                ?? '';
      pageConfig.value.defaultAccessLevel         = d.Contentjson.defaultAccessLevel          ?? null;
      pageConfig.value.enablePhotoUpload          = d.Contentjson.enablePhotoUpload           ?? false;
      pageConfig.value.enableProofUpload          = d.Contentjson.enableProofUpload           ?? false;
      pageConfig.value.govtIdOptional             = d.Contentjson.govtIdOptional              ?? false;

      // Safe load & initialize with backward-compatibility logic
      if (d.Contentjson.fieldsConfig) {
        pageConfig.value.fieldsConfig = { ...pageConfig.value.fieldsConfig, ...d.Contentjson.fieldsConfig };
      } else {
        // Fallback to legacy config flags
        pageConfig.value.fieldsConfig.photo.visible = !!pageConfig.value.enablePhotoUpload;
        pageConfig.value.fieldsConfig.proofDocument.visible = !!pageConfig.value.enableProofUpload;
        pageConfig.value.fieldsConfig.govtId.required = !pageConfig.value.govtIdOptional;
      }
    }
    if (d.Assetjson?.images) {
      pageConfig.value.logoId       = d.Assetjson.images.logo   || DEFAULT_ASSET_ID;
      pageConfig.value.logoPreview  = getAssetUrl(pageConfig.value.logoId);
      pageConfig.value.bannerId     = d.Assetjson.images.banner || DEFAULT_ASSET_ID;
      pageConfig.value.bannerPreview= getAssetUrl(pageConfig.value.bannerId);
    }
  } catch (e) {
    console.error('Failed to load portal:', e);
  }
});
</script>
