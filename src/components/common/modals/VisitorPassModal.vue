<template>
  <div v-if="show && visitor" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <!-- Dark backdrop -->
    <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm print:hidden" @click="closeModal" />
    
    <div class="relative flex flex-col items-center animate-in zoom-in-95 duration-200 w-full max-w-3xl">
      <!-- Print Header -->
      <div class="hidden print:block text-center mb-6 w-full">
        <h1 class="text-2xl font-bold text-black">VISITOR PASS</h1>
      </div>

      <!-- Clean Card Container -->
      <div 
        ref="passCardRef"
        class="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden p-8 w-full border border-slate-200 dark:border-slate-800 shadow-xl print:border-black print:shadow-none print:rounded-none"
        :class="{ 'border-none rounded-none shadow-none': isExporting }" 
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <!-- Column 1: Who is arriving? -->
          <div class="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Visitor Identity</div>
            <div class="w-24 h-24 rounded-full border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-800">
              <div class="w-full h-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                <img v-if="visitor.photo" :src="getPhotoUrl(visitor.photo)" class="w-full h-full object-cover" crossorigin="anonymous" />
                <div v-else class="w-full h-full flex items-center justify-center font-bold text-3xl text-slate-400">
                  {{ visitor.personName?.charAt(0).toUpperCase() || '?' }}
                </div>
              </div>
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase">{{ visitor.personName }}</h2>
              <p class="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{{ visitor.mobileNumber || 'No Phone' }}</p>
            </div>
          </div>

          <!-- Column 2: Why are they here? -->
          <div class="flex flex-col space-y-6 md:border-l border-slate-200 dark:border-slate-800 md:pl-8">
            <div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Visit Details</div>
            
            <div>
              <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Host / Department</p>
              <p class="text-sm font-bold text-slate-900 dark:text-white mt-1">{{ visitor.personToMeet || 'General Access' }}</p>
            </div>
            
            <div>
              <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Company</p>
              <p class="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">{{ visitor.company || 'Personal Visit' }}</p>
            </div>

            <div>
              <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Valid Time</p>
              <p class="text-sm font-bold text-slate-900 dark:text-white mt-1">{{ formatDate(visitor.startDate) }} • {{ visitor.startTime?.slice(0, 5) || 'All Day' }}</p>
            </div>
          </div>

          <!-- Column 3: Can I let them in? (QR & Status) -->
          <div class="flex flex-col items-center justify-center space-y-6 md:border-l border-slate-200 dark:border-slate-800 md:pl-8">
            <div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Access Credentials</div>
            
            <div class="p-3 bg-white border border-slate-200 rounded-lg">
              <qrcode-vue :value="JSON.stringify({ type: 'VISITOR', token: visitor.id, name: visitor.personName })" :size="100" level="H" :margin="0" background="#ffffff" foreground="#000000" />
            </div>

            <div class="text-center w-full">
              <span class="inline-block px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider w-full"
                :class="visitor.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'">
                {{ visitor.status || 'PENDING' }}
              </span>
            </div>
          </div>

        </div>
      </div>
      
      <!-- External Actions -->
      <div class="mt-6 flex flex-wrap justify-end gap-3 w-full print:hidden relative z-10">
        <button 
          :disabled="isExporting"
          @click="downloadImage" 
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          <Loader2 v-if="isExporting === 'image'" class="w-4 h-4 animate-spin" />
          <Image v-else class="w-4 h-4" />
          {{ isExporting === 'image' ? 'Saving...' : 'Save Badge' }}
        </button>
        
        <button 
          :disabled="isExporting"
          @click="downloadPDF" 
          class="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          <Loader2 v-if="isExporting === 'pdf'" class="w-4 h-4 animate-spin" />
          <FileText v-else class="w-4 h-4" />
          {{ isExporting === 'pdf' ? 'Generating...' : 'Download PDF' }}
        </button>

        <button 
          @click="printPass" 
          class="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 font-semibold text-xs transition-colors shadow-sm"
        >
          <Printer class="w-4 h-4" />
          Print
        </button>
        
        <button 
          @click="closeModal" 
          class="px-4 py-2 rounded-lg font-semibold text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { Loader2, Image, FileText, Printer } from 'lucide-vue-next';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { authService } from '@/services/authService';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  visitor: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);

const token = authService.getToken();
const passCardRef = ref(null);
const isExporting = ref(false); // 'image' or 'pdf' or false

const closeModal = () => {
  emit('close');
};

const getPhotoUrl = (photoId) => {
  if (!photoId) return '';
  return `${import.meta.env.VITE_API_URL}/assets/${photoId}?access_token=${token}`;
};

const formatDate = (isoString) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const printPass = () => {
  window.print();
};

const downloadImage = async () => {
  if (!passCardRef.value) return;
  isExporting.value = 'image';
  
  try {
    const dataUrl = await toPng(passCardRef.value, { 
      quality: 0.95,
      pixelRatio: 2,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      }
    });
    
    const link = document.createElement('a');
    link.download = `Visitor_Pass_${props.visitor?.personName?.replace(/\s+/g, '_') || 'ID'}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Failed to export image:', err);
    alert('Failed to generate image. Please try again.');
  } finally {
    isExporting.value = false;
  }
};

const downloadPDF = async () => {
  if (!passCardRef.value) return;
  isExporting.value = 'pdf';
  
  try {
    // Generate an image of the card
    const dataUrl = await toPng(passCardRef.value, { 
      quality: 0.95,
      pixelRatio: 2,
    });
    
    // Create a PDF matching the dimensions of the card
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [passCardRef.value.offsetWidth, passCardRef.value.offsetHeight]
    });
    
    pdf.addImage(dataUrl, 'PNG', 0, 0, passCardRef.value.offsetWidth, passCardRef.value.offsetHeight);
    pdf.save(`Visitor_Pass_${props.visitor?.personName?.replace(/\s+/g, '_') || 'ID'}.pdf`);
  } catch (err) {
    console.error('Failed to export PDF:', err);
    alert('Failed to generate PDF. Please try again.');
  } finally {
    isExporting.value = false;
  }
};
</script>

<style scoped>
@keyframes scan {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(120px); }
}
</style>
