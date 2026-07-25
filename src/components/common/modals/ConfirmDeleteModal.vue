<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto"
      @click="$emit('close')"
    >
      <div
        class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700 flex flex-col my-auto"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h3 class="flex items-center gap-2 text-sm font-bold text-rose-600 uppercase tracking-widest">
            <XCircleIcon class="w-4 h-4" />
            {{ title }}
          </h3>
          <button
            class="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"
            @click="$emit('close')"
          >
            <XIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
            <XCircleIcon class="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h4 class="text-base font-bold text-slate-900 dark:text-white mb-2">
              {{ confirmMessage }}
            </h4>
            <p
              v-if="itemLabel"
              class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              {{ itemLabel }}: <strong class="text-slate-900 dark:text-white">{{ itemName }}</strong>
            </p>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
              {{ description }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-5 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button
            class="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 transition-colors"
            @click="$emit('close')"
          >
            {{ cancelText }}
          </button>
          <button
            class="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center"
            :disabled="deleting"
            @click="$emit('confirm')"
          >
            <Loader2
              v-if="deleting"
              class="w-4 h-4 animate-spin mr-2"
            />
            <Trash2Icon
              v-else
              class="w-4 h-4 mr-2"
            />
            {{ deleting ? deletingText : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { XCircleIcon, XIcon, Trash2Icon, Loader2 } from "lucide-vue-next";

defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: "Delete Item" },
  confirmMessage: {
    type: String,
    default: "Are you sure you want to delete this item?",
  },
  itemLabel: { type: String, default: "" },
  itemName: { type: String, default: "" },
  description: { type: String, default: "This action cannot be undone." },
  cancelText: { type: String, default: "Cancel" },
  confirmText: { type: String, default: "Delete" },
  deletingText: { type: String, default: "Deleting..." },
  deleting: { type: Boolean, default: false },
});

defineEmits(["close", "confirm"]);
</script>
