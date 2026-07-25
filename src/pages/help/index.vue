<template>
  <div class="relative p-6 h-full bg-slate-50 dark:bg-[#0b0f19] flex flex-col items-center justify-center overflow-y-auto">
    <!-- Back Button -->
    <button
      @click="$router.push('/dashboard')"
      class="absolute top-6 left-6 p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-wider"
    >
      <ArrowLeft class="w-4 h-4" />
      Back
    </button>
    
    <div class="text-center max-w-lg w-full mt-10">
      <!-- Icon -->
      <div class="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <HelpCircle class="w-10 h-10" />
      </div>

      <h1 class="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Help &amp; Support</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
        Need assistance with AccessEasy? We're here to help. Explore our knowledge base or contact support directly.
      </p>

      <!-- Action Cards -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <button
          class="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-2xl hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
          @click="openDocumentation"
        >
          <BookOpen class="w-6 h-6 text-slate-400 group-hover:text-indigo-500 mb-3 transition-colors" />
          <h3 class="font-bold text-slate-700 dark:text-slate-200 text-sm">Documentation</h3>
          <p class="text-[11px] text-slate-500 mt-1">Read the setup guides &amp; user manuals</p>
        </button>

        <button
          class="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-2xl hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
          @click="showContactModal = true"
        >
          <MessageCircle class="w-6 h-6 text-slate-400 group-hover:text-indigo-500 mb-3 transition-colors" />
          <h3 class="font-bold text-slate-700 dark:text-slate-200 text-sm">Contact Support</h3>
          <p class="text-[11px] text-slate-500 mt-1">Send a message to our team</p>
        </button>
      </div>

      <!-- FAQ Section -->
      <div class="text-left w-full space-y-3">
        <h2 class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Frequently Asked Questions</h2>

        <div
          v-for="(faq, i) in faqs"
          :key="i"
          class="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
        >
          <button
            class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            @click="toggleFaq(i)"
          >
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ faq.q }}</span>
            <ChevronDown
              class="w-4 h-4 text-slate-400 shrink-0 transition-transform"
              :class="openFaq === i ? 'rotate-180' : ''"
            />
          </button>
          <div v-if="openFaq === i" class="px-4 pb-3 text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3">
            {{ faq.a }}
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Support Modal -->
    <div
      v-if="showContactModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showContactModal = false" />
      <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 z-10">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MessageCircle class="w-5 h-5 text-indigo-500" /> Contact Support
          </h3>
          <button class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" @click="showContactModal = false">
            <X class="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Subject</label>
            <input
              v-model="contactForm.subject"
              type="text"
              placeholder="e.g. Cannot register a guard"
              class="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Message</label>
            <textarea
              v-model="contactForm.message"
              rows="4"
              placeholder="Describe your issue in detail..."
              class="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none"
            />
          </div>
        </div>

        <div class="mt-5 flex gap-3">
          <button
            class="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            @click="showContactModal = false"
          >
            Cancel
          </button>
          <button
            class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
            @click="submitContact"
          >
            <Send class="w-4 h-4" /> Send Message
          </button>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div
      v-if="showToast"
      class="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-300"
    >
      <CheckCircle class="w-4 h-4" /> Message sent! We'll get back to you soon.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { HelpCircle, BookOpen, MessageCircle, ChevronDown, X, Send, CheckCircle, ArrowLeft } from 'lucide-vue-next';

const showContactModal = ref(false);
const showToast = ref(false);
const openFaq = ref(null);

const contactForm = ref({ subject: '', message: '' });

const faqs = [
  { q: 'How do I add a new guard?', a: 'Go to Setup → Guards in the sidebar, then click "Add Guard". Fill in the guard\'s personal details, assign a zone, and set their shift schedule.' },
  { q: 'How do I create a patrol plan?', a: 'Navigate to Patrol Monitoring, then click "Create Patrol". Select a zone, add checkpoints, assign guards, and set the patrol frequency.' },
  { q: 'How do I register visitor access?', a: 'Go to Visitor Management and click "Register Visitor". Fill in visitor details, select the host employee, and choose the access point they will use.' },
  { q: 'How do I download QR codes for checkpoints?', a: 'Open Gate Access Points under Setup. Each access point has a QR code download button in the Actions column.' },
  { q: 'How do I view patrol reports?', a: 'Navigate to Patrol Monitoring and look at the Patrol Status section. You can also go to the Reports module for detailed exports.' },
];

function toggleFaq(i) {
  openFaq.value = openFaq.value === i ? null : i;
}

function openDocumentation() {
  window.open('https://docs.accesseasy.io', '_blank');
}

function submitContact() {
  if (!contactForm.value.subject.trim() || !contactForm.value.message.trim()) return;
  // In production this would call an API. For now show success toast.
  showContactModal.value = false;
  contactForm.value = { subject: '', message: '' };
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 4000);
}
</script>
