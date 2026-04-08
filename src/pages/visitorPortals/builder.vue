<template>
  <div class="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">

    <!-- ── Header ────────────────────────────────────────────────────────── -->
    <div class="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shrink-0 shadow-sm">
      <div>
        <h1 class="text-base font-black text-slate-900 dark:text-white">Visitor Portal Designer</h1>
        <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Live preview · Changes reflected instantly</p>
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

    <!-- ── Body ──────────────────────────────────────────────────────────── -->
    <div class="flex-1 flex overflow-hidden">

      <!-- ── Left: Editor ─────────────────────────────────────────────────── -->
      <div class="w-80 shrink-0 h-full overflow-y-auto bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col pb-24">

        <!-- Section: General -->
        <div class="p-5 border-b border-slate-100 dark:border-zinc-800 space-y-4">
          <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Settings class="w-3.5 h-3.5 text-blue-500" /> General Settings
          </h3>
          <div class="space-y-3">
            <div class="space-y-1">
              <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Portal Title</label>
              <input v-model="pageConfig.title" type="text"
                class="w-full h-9 px-3 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-950 text-sm font-medium text-slate-800 dark:text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Theme Style</label>
              <select v-model="pageConfig.theme"
                class="w-full h-9 px-3 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-950 text-sm font-medium text-slate-800 dark:text-white focus:border-blue-500 outline-none">
                <option>Modern Blue</option>
                <option>Classic Dark</option>
                <option>Nature Green</option>
                <option>Sunset Orange</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Brand Color</label>
              <div class="flex items-center gap-3">
                <input v-model="pageConfig.primaryColor" type="color" class="w-9 h-9 rounded-lg border-0 cursor-pointer p-0.5 bg-transparent" />
                <span class="text-xs font-bold text-slate-500 dark:text-zinc-400">{{ pageConfig.primaryColor }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Hero -->
        <div class="p-5 border-b border-slate-100 dark:border-zinc-800 space-y-4">
          <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Layout class="w-3.5 h-3.5 text-blue-500" /> Hero Branding
          </h3>
          <div class="space-y-3">
            <div class="space-y-1">
              <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Banner Image</label>
              <div @click="$refs.bannerInput.click()"
                class="h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-zinc-700 flex items-center justify-center cursor-pointer hover:border-blue-500 relative overflow-hidden transition-colors group">
                <img v-if="pageConfig.bannerPreview" :src="pageConfig.bannerPreview" class="w-full h-full object-cover" />
                <div v-else class="flex flex-col items-center text-slate-400 group-hover:text-blue-500 transition-colors">
                  <UploadCloud class="w-6 h-6 mb-1" />
                  <span class="text-[10px] font-bold">Upload Banner</span>
                </div>
                <div v-if="pageConfig.bannerPreview" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span class="text-white text-xs font-bold">Change Image</span>
                </div>
              </div>
              <input ref="bannerInput" type="file" class="hidden" accept="image/*" @change="handleBannerChange" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Heading Text</label>
              <input v-model="pageConfig.bannerHeading" type="text"
                class="w-full h-9 px-3 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-950 text-sm font-medium text-slate-800 dark:text-white focus:border-blue-500 outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Subtext / Description</label>
              <textarea v-model="pageConfig.bannerSubtext" rows="3"
                class="w-full p-3 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-950 text-sm font-medium text-slate-800 dark:text-white focus:border-blue-500 outline-none resize-none"></textarea>
            </div>
          </div>
        </div>

        <!-- Section: Branding / Logo -->
        <div class="p-5 border-b border-slate-100 dark:border-zinc-800 space-y-4">
          <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon class="w-3.5 h-3.5 text-blue-500" /> Brand Identity
          </h3>
          <div class="flex items-center gap-4">
            <div @click="$refs.logoInput.click()"
              class="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 dark:border-zinc-700 flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden transition-colors">
              <img v-if="pageConfig.logoPreview" :src="pageConfig.logoPreview" class="max-w-full max-h-full object-contain" />
              <Plus v-else class="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p class="text-xs font-bold text-slate-700 dark:text-slate-300">Company Logo</p>
              <button @click="$refs.logoInput.click()" class="text-[10px] text-blue-500 font-bold hover:underline mt-0.5">Change</button>
            </div>
            <input ref="logoInput" type="file" class="hidden" accept="image/*" @change="handleLogoChange" />
          </div>
        </div>

        <!-- Section: Contact Info -->
        <div class="p-5 border-b border-slate-100 dark:border-zinc-800 space-y-4">
          <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Phone class="w-3.5 h-3.5 text-blue-500" /> Contact Info
          </h3>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="pageConfig.enableContact" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Show Contact Details</span>
          </label>
          <div v-if="pageConfig.enableContact" class="space-y-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <div class="space-y-1">
              <label class="text-[9px] font-bold text-blue-600 uppercase tracking-widest">WhatsApp / Phone</label>
              <input v-model="pageConfig.contactPhone" type="text" placeholder="+91 98765 43210"
                class="w-full h-9 px-3 border border-white dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm focus:border-blue-500 outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Contact Email</label>
              <input v-model="pageConfig.contactEmail" type="email" placeholder="info@company.com"
                class="w-full h-9 px-3 border border-white dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm focus:border-blue-500 outline-none" />
            </div>
          </div>
        </div>

        <!-- Section: Registration Form -->
        <div class="p-5 space-y-4">
          <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <ClipboardSignature class="w-3.5 h-3.5 text-blue-500" /> Registration Setup
          </h3>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="pageConfig.enableRegistrationForm"
              class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Enable Check-In Form</span>
          </label>
          <div v-if="pageConfig.enableRegistrationForm"
            class="space-y-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <div class="space-y-1">
              <label class="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Form Title</label>
              <input v-model="pageConfig.registrationFormTitle" type="text"
                class="w-full h-9 px-3 border border-white dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm focus:border-blue-500 outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Form Description</label>
              <textarea v-model="pageConfig.registrationFormDescription" rows="2"
                class="w-full p-2 border border-white dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm focus:border-blue-500 outline-none resize-none"></textarea>
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Button Label</label>
              <input v-model="pageConfig.registrationFormButtonText" type="text"
                class="w-full h-9 px-3 border border-white dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm focus:border-blue-500 outline-none" />
            </div>
            <!-- Read-only fields preview -->
            <div class="border-t border-blue-100 dark:border-blue-900/30 pt-3">
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fields Collected (Fixed)</p>
              <div class="grid grid-cols-2 gap-1.5 text-[10px] font-bold text-slate-500">
                <div class="px-2 py-1.5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-700 rounded">Full Name</div>
                <div class="px-2 py-1.5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-700 rounded">Mobile Number</div>
                <div class="px-2 py-1.5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-700 rounded">Govt ID Type</div>
                <div class="px-2 py-1.5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-700 rounded">ID Number</div>
                <div class="px-2 py-1.5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-700 rounded col-span-2">Reason for Visit</div>
                <div class="px-2 py-1.5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-700 rounded">Person to Meet</div>
                <div class="px-2 py-1.5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-700 rounded">Company / Org</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Right: Live Preview ───────────────────────────────────────────── -->
      <div class="flex-1 overflow-hidden bg-slate-100 dark:bg-zinc-950 p-4 flex flex-col gap-3">

        <!-- Preview Header Bar -->
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest">Live Preview</span>
          <span class="text-[10px] font-semibold text-slate-400">Changes are reflected instantly</span>
        </div>

        <!-- Browser Mockup -->
        <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col flex-1">

          <!-- Mockup Address Bar -->
          <div class="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-700">
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-rose-400"></span>
              <span class="w-3 h-3 rounded-full bg-amber-400"></span>
              <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
            </div>
            <div class="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-700 rounded-lg border border-slate-200 dark:border-zinc-600 text-xs font-mono text-slate-500 dark:text-zinc-300 truncate mx-2">
              <span class="truncate">{{ previewUrl }}</span>
            </div>
            <!-- Share Buttons -->
            <div class="flex items-center gap-1">
              <button @click="copyToClipboard(previewUrl)" title="Copy URL"
                class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-400 hover:text-blue-500 transition-colors">
                <Copy class="w-3.5 h-3.5" />
              </button>
              <button @click="shareWhatsApp(previewUrl)" title="Share via WhatsApp"
                class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-400 hover:text-emerald-500 transition-colors">
                <MessageCircle class="w-3.5 h-3.5" />
              </button>
              <button @click="shareEmail(previewUrl)" title="Share via Email"
                class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-400 hover:text-blue-500 transition-colors">
                <Mail class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Canvas -->
          <div class="flex-1 overflow-y-auto bg-white" :style="{ '--brand': pageConfig.primaryColor }">

            <!-- Nav -->
            <nav class="flex items-center justify-between px-8 py-5 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <img v-if="pageConfig.logoPreview" :src="pageConfig.logoPreview" class="h-9 object-contain" />
                <span class="font-black text-lg tracking-tight text-slate-900">{{ pageConfig.title || 'Visitor Portal' }}</span>
              </div>
              <button v-if="pageConfig.enableRegistrationForm"
                @click="registrationDialog = true"
                class="px-6 py-2 rounded-full text-white text-sm font-black shadow-md transition-all"
                :style="{ backgroundColor: pageConfig.primaryColor }">
                Check In Now
              </button>
            </nav>

            <!-- Hero -->
            <div class="px-10 py-14 text-center">
              <span class="inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6"
                :style="{ color: pageConfig.primaryColor, backgroundColor: pageConfig.primaryColor + '18' }">
                {{ pageConfig.title || 'WELCOME' }}
              </span>
              <h1 class="text-4xl font-black text-slate-900 leading-tight mb-5 max-w-2xl mx-auto">
                {{ pageConfig.bannerHeading || 'Welcome to Our Office' }}
              </h1>
              <p class="text-base text-slate-500 font-medium mb-10 max-w-xl mx-auto">
                {{ pageConfig.bannerSubtext || 'Please register to receive your visitor pass.' }}
              </p>
              <div class="w-full max-w-2xl mx-auto aspect-[2/1] rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-slate-50">
                <img v-if="pageConfig.bannerPreview" :src="pageConfig.bannerPreview" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                  <ImageIcon class="w-16 h-16" />
                </div>
              </div>
            </div>

            <!-- Contact strip -->
            <div v-if="pageConfig.enableContact && (pageConfig.contactPhone || pageConfig.contactEmail)"
              class="flex justify-center gap-4 pb-10">
              <a v-if="pageConfig.contactPhone" :href="`https://wa.me/${pageConfig.contactPhone.replace(/\D/g,'')}`" target="_blank"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-md bg-emerald-500 hover:bg-emerald-600 transition-colors">
                <MessageCircle class="w-4 h-4" /> WhatsApp
              </a>
              <a v-if="pageConfig.contactEmail" :href="`mailto:${pageConfig.contactEmail}`"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-md transition-colors"
                :style="{ backgroundColor: pageConfig.primaryColor }">
                <Mail class="w-4 h-4" /> Email
              </a>
            </div>

            <!-- Footer -->
            <footer class="py-8 border-t border-slate-100 text-center bg-slate-50">
              <p class="text-xs font-bold text-slate-400">© {{ new Date().getFullYear() }} {{ pageConfig.title }}. All rights reserved.</p>
              <p class="text-[10px] text-slate-300 uppercase tracking-widest mt-1">Powered by AccessEasy</p>
            </footer>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Registration Form Modal ──────────────────────────────────────── -->
    <div v-if="registrationDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="registrationDialog = false"></div>
      <div class="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex items-start justify-between">
          <div>
            <h3 class="text-lg font-black text-slate-900 dark:text-white">{{ pageConfig.registrationFormTitle || 'Visitor Check-in' }}</h3>
            <p class="text-xs font-medium text-slate-500 mt-1">{{ pageConfig.registrationFormDescription }}</p>
          </div>
          <button @click="registrationDialog = false" class="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2 space-y-1">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name <span class="text-rose-500">*</span></label>
              <input v-model="visitorData.name" type="text" placeholder="John Doe"
                class="w-full h-10 px-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-950 text-sm font-medium text-slate-800 dark:text-white focus:border-blue-500 outline-none" />
            </div>
            <div class="col-span-2 space-y-1">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mobile Number <span class="text-rose-500">*</span></label>
              <input v-model="visitorData.mobile" type="tel" placeholder="+91 98765 43210"
                class="w-full h-10 px-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-950 text-sm font-medium text-slate-800 dark:text-white focus:border-blue-500 outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Govt ID Type <span class="text-rose-500">*</span></label>
              <select v-model="visitorData.govtIdType"
                class="w-full h-10 px-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-950 text-sm font-medium text-slate-800 dark:text-white focus:border-blue-500 outline-none">
                <option>Aadhar</option>
                <option>Driving License</option>
                <option>Passport</option>
                <option>Voter ID</option>
                <option>PAN Card</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Number <span class="text-rose-500">*</span></label>
              <input v-model="visitorData.govtIdNumber" type="text" placeholder="XXXX-XXXX-XXXX"
                class="w-full h-10 px-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-950 text-sm font-medium text-slate-800 dark:text-white focus:border-blue-500 outline-none" />
            </div>
            <!-- Reason for Visit -->
            <div class="col-span-2 space-y-1">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reason for Visit <span class="text-rose-500">*</span></label>
              <select v-model="visitorData.reasonForVisit"
                class="w-full h-10 px-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-950 text-sm font-medium text-slate-800 dark:text-white focus:border-blue-500 outline-none">
                <option value="">Select a reason...</option>
                <option>Meeting / Appointment</option>
                <option>Interview</option>
                <option>Delivery / Courier</option>
                <option>Vendor / Supplier</option>
                <option>Client Visit</option>
                <option>Maintenance / Repair</option>
                <option>Personal Work</option>
                <option>Other</option>
              </select>
              <!-- Free-text when Other is selected -->
              <input v-if="visitorData.reasonForVisit === 'Other'" v-model="visitorData.reasonForVisitOther"
                type="text" placeholder="Please specify..."
                class="w-full h-10 px-3 mt-2 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-950 text-sm font-medium text-slate-800 dark:text-white focus:border-blue-500 outline-none" />
            </div>
            <!-- Person to Meet -->
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Person to Meet</label>
              <input v-model="visitorData.personToMeet" type="text" placeholder="e.g. Rajan Kumar"
                class="w-full h-10 px-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-950 text-sm font-medium text-slate-800 dark:text-white focus:border-blue-500 outline-none" />
            </div>
            <!-- Company / Organisation -->
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Company / Org</label>
              <input v-model="visitorData.company" type="text" placeholder="e.g. Acme Corp"
                class="w-full h-10 px-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-950 text-sm font-medium text-slate-800 dark:text-white focus:border-blue-500 outline-none" />
            </div>
          </div>

          <button @click="submitRegistration" :disabled="submittingRegistration"
            class="w-full py-3 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 mt-2 transition-all active:scale-95 disabled:opacity-60 shadow-md"
            :style="{ backgroundColor: pageConfig.primaryColor }">
            <Loader2 v-if="submittingRegistration" class="w-4 h-4 animate-spin" />
            <ClipboardSignature v-else class="w-4 h-4" />
            {{ pageConfig.registrationFormButtonText || 'Complete Registration' }}
          </button>
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
        <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">Saved &amp; Published!</h3>
        <p class="text-sm font-medium text-slate-500 mb-6">Your visitor portal is now live.</p>

        <!-- Shareable URL -->
        <div class="flex items-center gap-2 px-3 py-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-100 dark:border-zinc-700 mb-6 text-left">
          <span class="text-xs font-mono text-slate-600 dark:text-zinc-300 truncate flex-1">{{ previewUrl }}</span>
          <button @click="copyToClipboard(previewUrl)" class="shrink-0 text-blue-500 hover:text-blue-700 transition-colors">
            <Copy class="w-4 h-4" />
          </button>
        </div>

        <!-- Share Row -->
        <div class="flex justify-center gap-2 mb-6">
          <button @click="shareWhatsApp(previewUrl)"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 transition-colors">
            <MessageCircle class="w-3.5 h-3.5" /> WhatsApp
          </button>
          <button @click="shareEmail(previewUrl)"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors">
            <Mail class="w-3.5 h-3.5" /> Email
          </button>
        </div>

        <button @click="saveSuccessDialog = false; router.push('/dashboard/visitor-portals')"
          class="w-full py-3 rounded-xl font-black text-sm text-white bg-slate-900 dark:bg-blue-600 hover:opacity-90 active:scale-95 transition-all">
          Back to Portals
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
  ClipboardSignature, Save, Check, Copy, MessageCircle, Mail, Phone, X
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
const registrationDialog   = ref(false);
const submittingRegistration = ref(false);

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
});

// ── Preview URL ────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_UI_URL || 'http://localhost:3000';
const previewUrl = computed(() =>
  pageConfig.value.id
    ? `${BASE_URL}/visit/${pageConfig.value.id}`
    : `${BASE_URL}/visit/preview-pending`
);

// ── File Handlers ──────────────────────────────────────────────────────────
const selectedBannerFile = ref(null);
const selectedLogoFile   = ref(null);

const handleBannerChange = (e) => {
  const file = e.target.files[0];
  if (file) { selectedBannerFile.value = file; pageConfig.value.bannerPreview = URL.createObjectURL(file); }
};
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
    if (selectedBannerFile.value) {
      const id = await uploadFile(selectedBannerFile.value, 'portal-banner');
      if (id) { pageConfig.value.bannerId = id; selectedBannerFile.value = null; }
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

// ── Registration Submit (Preview mode) ────────────────────────────────────
const submitRegistration = async () => {
  const reason = visitorData.value.reasonForVisit === 'Other'
    ? visitorData.value.reasonForVisitOther
    : visitorData.value.reasonForVisit;

  if (!visitorData.value.name || !visitorData.value.mobile || !visitorData.value.govtIdNumber || !reason) {
    messageHandler.showError('Please fill all mandatory fields (Name, Mobile, ID, Reason for Visit)');
    return;
  }
  submittingRegistration.value = true;
  try {
    await new Promise(r => setTimeout(r, 600)); // Preview mode: simulate
    registrationDialog.value = false;
    visitorData.value = {
      name: '', mobile: '', govtIdType: 'Aadhar', govtIdNumber: '',
      reasonForVisit: '', reasonForVisitOther: '', personToMeet: '', company: '',
    };
    messageHandler.showSuccess('Preview: Registration would be submitted here.');
  } finally {
    submittingRegistration.value = false;
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

const shareEmail = (url) => {
  if (url.includes('preview-pending')) { messageHandler.showError('Save the portal first.'); return; }
  window.location.href = `mailto:?subject=Visitor Portal&body=${encodeURIComponent('Check out our visitor portal: ' + url)}`;
};

// ── Load existing ─────────────────────────────────────────────────────────
onMounted(async () => {
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
