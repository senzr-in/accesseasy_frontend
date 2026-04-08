<template>
  <div
    v-if="stepData"
    class="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white shadow-lg"
  >
    <div class="px-4 py-3">
      <div class="flex items-center justify-between gap-4">
        <!-- Left: Progress and Step Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-1.5">
            <div class="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap">
              Step {{ stepData.currentStep }} of {{ stepData.totalSteps }}
            </div>
            <h3 class="font-semibold text-sm md:text-base truncate">
              {{ stepData.stepConfig?.title }}
            </h3>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                class="h-full bg-white rounded-full transition-all duration-500"
                :style="{ width: stepData.progress + '%' }"
              ></div>
            </div>
            <span class="text-xs font-medium whitespace-nowrap">{{ stepData.progress }}%</span>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2">
          <button
            @click="handleSkip"
            :disabled="isSkipping"
            class="hidden md:flex items-center gap-1 px-3 h-8 rounded-md text-white hover:bg-white/20 text-xs font-semibold transition-colors"
          >
            <SkipForward class="w-4 h-4" /> Skip
          </button>
          <button
            @click="handleContinue"
            class="flex items-center gap-1 px-3 h-8 rounded-md bg-white text-blue-600 hover:bg-white/90 text-xs font-semibold transition-colors"
          >
            Continue <ArrowRight class="w-4 h-4" />
          </button>
          <button
            @click="handleDismiss"
            class="flex items-center justify-center h-8 w-8 rounded-md text-white hover:bg-white/20 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, SkipForward, X } from 'lucide-vue-next';
import { onboardingService } from '@/services/onboardingService';

const router = useRouter();
const stepData = ref(null);
const isSkipping = ref(false);

onMounted(() => {
  if (!onboardingService.isCompleted()) {
    stepData.value = onboardingService.getCurrentStep();
  }
});

const handleContinue = () => {
  const data = onboardingService.getCurrentStep();
  if (data?.stepConfig?.url) {
    router.push(data.stepConfig.url);
  }
};

const handleSkip = () => {
  isSkipping.value = true;
  const current = onboardingService.getCurrentStep();
  const { isFinished } = onboardingService.skipStep(current.currentStep);
  if (isFinished) {
    stepData.value = null;
  } else {
    stepData.value = onboardingService.getCurrentStep();
  }
  isSkipping.value = false;
};

const handleDismiss = () => {
  onboardingService.dismiss();
  stepData.value = null;
};
</script>
