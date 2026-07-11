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
              />
            </div>
            <span class="text-xs font-medium whitespace-nowrap">{{ stepData.progress }}%</span>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2">
          <button
            :disabled="isSkipping"
            class="hidden md:flex items-center gap-1 px-3 h-8 rounded-md text-white hover:bg-white/20 text-xs font-semibold transition-colors"
            @click="handleSkip"
          >
            <SkipForward class="w-4 h-4" /> Skip
          </button>
          <button
            v-if="isOnStepPage"
            class="flex items-center gap-1 px-3 h-8 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors border border-emerald-400/20"
            @click="handleComplete"
          >
            Mark Completed & Next <ArrowRight class="w-4 h-4" />
          </button>
          <button
            v-else
            class="flex items-center gap-1 px-3 h-8 rounded-md bg-white text-blue-600 hover:bg-white/90 text-xs font-semibold transition-colors"
            @click="handleContinue"
          >
            Continue <ArrowRight class="w-4 h-4" />
          </button>
          <button
            class="flex items-center justify-center h-8 w-8 rounded-md text-white hover:bg-white/20 transition-colors"
            @click="handleDismiss"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowRight, SkipForward, X } from 'lucide-vue-next';
import { onboardingService } from '@/services/onboardingService';
import { authService } from '@/services/authService';

const route = useRoute();
const router = useRouter();
const stepData = ref(null);
const isSkipping = ref(false);

const isOnStepPage = computed(() => {
  if (!stepData.value?.stepConfig?.url) return false;
  const stepPath = stepData.value.stepConfig.url.split('?')[0];
  return route.path === stepPath;
});

onMounted(() => {
  // Only show onboarding banner for Admin users — Guards and Employees should not see it
  const role = authService.getUserRole();
  if (role !== 'Admin') return;
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

const handleComplete = () => {
  const current = onboardingService.getCurrentStep();
  const { isFinished } = onboardingService.markStepCompleted(current.currentStep);
  if (isFinished) {
    stepData.value = null;
    router.push('/dashboard');
  } else {
    stepData.value = onboardingService.getCurrentStep();
    if (stepData.value?.stepConfig?.url) {
      router.push(stepData.value.stepConfig.url);
    }
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
