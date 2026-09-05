<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[110] flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300 p-4 w-full"
    @click.self="close"
  >
    <div class="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[24px] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-950/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
            <MessageSquare class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Message Guard
            </h2>
            <p class="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              To: {{ guardName }}
            </p>
          </div>
        </div>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          @click="close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-5">
        <!-- Error Message -->
        <div
          v-if="error"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold uppercase tracking-widest"
        >
          <AlertTriangle class="w-4 h-4 shrink-0" />
          {{ error }}
        </div>

        <!-- Mode Switcher -->
        <div class="flex p-1 bg-slate-100 dark:bg-zinc-950 rounded-xl">
          <button 
            class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all"
            :class="mode === 'text' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'"
            @click="mode = 'text'"
          >
            Text Message
          </button>
          <button 
            class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all"
            :class="mode === 'voice' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'"
            @click="mode = 'voice'"
          >
            Voice Note
          </button>
        </div>

        <!-- Text Mode -->
        <div
          v-if="mode === 'text'"
          class="space-y-2"
        >
          <textarea
            v-model="textMessage"
            rows="4"
            placeholder="Type your instructions here..."
            class="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 resize-none"
          />
        </div>

        <!-- Voice Mode -->
        <div
          v-if="mode === 'voice'"
          class="flex flex-col items-center py-6 space-y-6"
        >
          <div 
            class="w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-300"
            :class="isRecording ? 'border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 animate-pulse' : (audioBlob ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900')"
          >
            <Mic
              v-if="!isRecording && !audioBlob"
              class="w-8 h-8 text-zinc-400"
            />
            <div
              v-else-if="isRecording"
              class="w-6 h-6 rounded bg-rose-500 animate-pulse"
            />
            <Check
              v-else-if="audioBlob"
              class="w-8 h-8 text-emerald-500"
            />
          </div>
          
          <div class="text-center">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">
              {{ isRecording ? 'Recording...' : (audioBlob ? 'Voice Note Ready' : 'Record a Voice Note') }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              {{ isRecording ? recordingTimeFormatted : (audioBlob ? 'You can preview or rerecord before sending.' : 'Tap the button below to start.') }}
            </p>
          </div>

          <div class="flex gap-3">
            <button 
              v-if="!isRecording && !audioBlob"
              class="px-6 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[13px] font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
              @click="startRecording"
            >
              <Mic class="w-4 h-4" /> Start Recording
            </button>
            <button 
              v-if="isRecording"
              class="px-6 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-[13px] font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
              @click="stopRecording"
            >
              <Square class="w-4 h-4" /> Stop
            </button>
            
            <template v-if="!isRecording && audioBlob">
              <button 
                class="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Preview"
                @click="playPreview"
              >
                <Play class="w-4 h-4" />
              </button>
              <button 
                class="w-10 h-10 rounded-xl border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                title="Discard"
                @click="discardRecording"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </template>
          </div>
          
          <audio
            ref="audioPlayer"
            class="hidden"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 flex justify-end gap-3">
        <button 
          type="button" 
          class="px-5 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          @click="close"
        >
          Cancel
        </button>
        <button 
          :disabled="loading || (!textMessage.trim() && mode === 'text') || (!audioBlob && mode === 'voice')"
          class="px-6 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
          @click="sendMessage"
        >
          <Loader2
            v-if="loading"
            class="w-3.5 h-3.5 animate-spin"
          />
          <Send
            v-else
            class="w-3.5 h-3.5"
          />
          Send {{ mode === 'text' ? 'Message' : 'Voice Note' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { MessageSquare, X, AlertTriangle, Mic, Square, Play, Trash2, Check, Send, Loader2 } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { mqttService } from '@/services/mqttService';

const props = defineProps({
  show: Boolean,
  guard: Object,
});

const emit = defineEmits(['update:show', 'sent']);

const guardName = computed(() => {
  if (!props.guard) return '';
  return `${props.guard.first_name || ''} ${props.guard.last_name || ''}`.trim() || 'Guard';
});

const close = () => {
  if (isRecording.value) stopRecording();
  emit('update:show', false);
  resetForm();
};

const mode = ref('text'); // 'text' | 'voice'
const textMessage = ref('');
const loading = ref(false);
const error = ref('');

// Audio Recording State
const isRecording = ref(false);
const recordingTime = ref(0);
let timerInterval = null;
const audioBlob = ref(null);
let mediaRecorder = null;
let audioChunks = [];
const audioPlayer = ref(null);

const recordingTimeFormatted = computed(() => {
  const mins = Math.floor(recordingTime.value / 60).toString().padStart(2, '0');
  const secs = (recordingTime.value % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
});

const startRecording = async () => {
  error.value = '';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = () => {
      audioBlob.value = new Blob(audioChunks, { type: 'audio/webm' });
      stream.getTracks().forEach(track => track.stop());
    };
    
    mediaRecorder.start();
    isRecording.value = true;
    recordingTime.value = 0;
    
    timerInterval = setInterval(() => {
      recordingTime.value++;
      if (recordingTime.value >= 120) stopRecording(); // Max 2 mins
    }, 1000);
  } catch (err) {
    error.value = 'Microphone access denied or not available.';
    console.error(err);
  }
};

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  isRecording.value = false;
  if (timerInterval) clearInterval(timerInterval);
};

const discardRecording = () => {
  audioBlob.value = null;
  audioChunks = [];
  recordingTime.value = 0;
};

const playPreview = () => {
  if (audioBlob.value && audioPlayer.value) {
    const url = URL.createObjectURL(audioBlob.value);
    audioPlayer.value.src = url;
    audioPlayer.value.play();
  }
};

const resetForm = () => {
  textMessage.value = '';
  mode.value = 'text';
  discardRecording();
  error.value = '';
};

const sendMessage = async () => {
  if (!props.guard) return;
  loading.value = true;
  error.value = '';
  
  try {
    const token = authService.getToken();
    const apiUrl = import.meta.env.VITE_API_URL;
    
    let fileId = null;
    let messageBody = textMessage.value;

    if (mode.value === 'voice' && audioBlob.value) {
      const formData = new FormData();
      formData.append('title', `Voice Message to ${props.guard.first_name}`);
      formData.append('file', audioBlob.value, 'voice_message.webm');
      
      const fileRes = await fetch(`${apiUrl}/files`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (!fileRes.ok) throw new Error('Failed to upload voice message');
      const fileData = await fileRes.json();
      fileId = fileData.data.id;
      messageBody = 'Voice Message Received';
    }

    const payload = {
      recipient: props.guard.id,
      subject: 'New Message from Admin',
      message: messageBody,
    };
    
    if (fileId) {
      payload.collection = 'directus_files';
      payload.item = fileId;
    }

    const res = await fetch(`${apiUrl}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error('Failed to send notification');

    // MQTT Publish for instant delivery to Flutter app
    if (mqttService.status !== 'connected') {
      mqttService.connect();
    }
    
    const tenantId = currentUserTenant.getTenantId();
    const mqttTopic = `accesseasy/tenant/${tenantId}/guards/${props.guard.id}/messages`;
    const canonicalTopic = `accesseasy/${tenantId}/guards/${props.guard.id}/messages`;
    const mqttPayload = {
      type: mode.value === 'voice' ? 'audio' : 'text',
      text: textMessage.value,
      fileId: fileId,
      timestamp: Date.now(),
      sender: 'Admin'
    };
    
    // Slight delay to ensure connection if just opened
    setTimeout(() => {
      mqttService.publish(mqttTopic, mqttPayload);
      mqttService.publish(canonicalTopic, mqttPayload);
    }, 500);
    
    emit('sent');
    close();
  } catch (err) {
    error.value = 'Failed to send message. Please try again.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
});
</script>
