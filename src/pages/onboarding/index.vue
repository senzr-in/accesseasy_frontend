<template>
  <div class="min-h-screen bg-background flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-2xl border border-border shadow-2xl rounded-2xl relative overflow-hidden bg-white dark:bg-zinc-950">
      
      <!-- Top gradient accent bar (matches reference exactly) -->
      <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-emerald-500"></div>

      <!-- Header -->
      <div class="text-center pt-10 pb-6 flex flex-col items-center px-8">
        <div class="mb-6 p-4 rounded-full bg-primary/5 border border-primary/10">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 text-blue-500">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span class="text-3xl font-black text-foreground">Access<span class="text-blue-500">Easy</span></span>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-foreground mb-2">Welcome to AccessEasy</h1>
        <p class="text-base text-muted-foreground">
          Let's get your organization set up in a few simple steps.
        </p>
      </div>

      <!-- Steps Grid (matches reference 2-column grid) -->
      <div class="px-8 pb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="step in steps"
            :key="step.id"
            class="flex items-start space-x-3 p-3 rounded-lg bg-muted/40 border border-border/50"
          >
            <div class="mt-1 bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
              {{ step.id }}
            </div>
            <div>
              <h3 class="font-semibold text-sm text-foreground">{{ step.title }}</h3>
              <p class="text-xs text-muted-foreground">{{ step.description }}</p>
            </div>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col gap-3 pt-6">
          <button
            @click="handleStart"
            :disabled="loading"
            class="w-full h-11 rounded-lg bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 group"
          >
            <span>{{ loading ? 'Starting...' : 'Get Started' }}</span>
            <ArrowRight v-if="!loading" class="w-4 h-4 transition-transform group-hover:translate-x-1" />
            <Loader2 v-else class="w-4 h-4 animate-spin" />
          </button>
          <button
            @click="handleSkip"
            :disabled="loading"
            class="w-full h-11 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
          >
            {{ loading ? 'Please wait...' : 'Skip to Dashboard' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, Loader2 } from 'lucide-vue-next';
import { onboardingService, ONBOARDING_STEPS } from '@/services/onboardingService';

const router = useRouter();
const loading = ref(false);

const steps = ONBOARDING_STEPS.map(s => ({
  id: s.id,
  title: s.title,
  description: s.description,
}));

const handleStart = async () => {
  loading.value = true;
  onboardingService.start();
  const stepData = onboardingService.getCurrentStep();
  router.push(stepData.stepConfig?.url || '/dashboard');
};

const handleSkip = async () => {
  loading.value = true;
  onboardingService.dismiss();
  router.push('/dashboard');
};
</script>
