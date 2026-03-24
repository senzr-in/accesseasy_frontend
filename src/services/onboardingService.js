// Onboarding service — mirrors the Next.js reference onboarding-actions.ts
// Persists to localStorage using key 'ae_onboarding'

const STORAGE_KEY = 'ae_onboarding';
const TOTAL_STEPS = 6;

export const ONBOARDING_STEPS = [
  { id: 1, name: 'doors',         title: 'Create Door Access',    description: 'Define entry/exit points',   url: '/dashboard/access-control/doors?onboarding=true' },
  { id: 2, name: 'zones',         title: 'Create Zones',          description: 'Organize locations',         url: '/dashboard/access-control/zones?onboarding=true' },
  { id: 3, name: 'branches',      title: 'Setup Branches',        description: 'Setup locations',            url: '/dashboard/easy-access/configurators/branches?onboarding=true' },
  { id: 4, name: 'access-levels', title: 'Create Access Levels',  description: 'Define permissions',         url: '/dashboard/easy-access/configurators/access-levels?onboarding=true' },
  { id: 5, name: 'devices',       title: 'Add Devices',           description: 'Add hardware',               url: '/dashboard/devices?onboarding=true' },
  { id: 6, name: 'employees',     title: 'Add Employees',         description: 'Add team members',           url: '/dashboard/easy-access/employees?onboarding=true' },
];

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const onboardingService = {
  /** Returns null if onboarding is done/dismissed, or the current step data object */
  getStatus() {
    const state = loadState();
    if (state.completed || state.dismissed) return null;
    return state;
  },

  isCompleted() {
    const state = loadState();
    return !!(state.completed || state.dismissed);
  },

  /** Returns whether the user has ever started (step > 0) */
  hasStarted() {
    const state = loadState();
    return (state.currentStep || 0) > 0;
  },

  start() {
    const state = loadState();
    if (!state.currentStep) {
      saveState({ ...state, currentStep: 1, completedSteps: [] });
    }
  },

  getCurrentStep() {
    const state = loadState();
    const currentStepId = state.currentStep || 1;
    const completedSteps = state.completedSteps || [];
    const skippedSteps = state.skippedSteps || [];
    const stepConfig = ONBOARDING_STEPS.find(s => s.id === currentStepId);
    const progress = Math.round((completedSteps.length / TOTAL_STEPS) * 100);

    return {
      currentStep: currentStepId,
      totalSteps: TOTAL_STEPS,
      stepConfig,
      completedSteps,
      skippedSteps,
      progress,
    };
  },

  markStepCompleted(stepId) {
    const state = loadState();
    const completedSteps = state.completedSteps || [];
    if (!completedSteps.includes(stepId)) completedSteps.push(stepId);
    const nextStep = stepId + 1;
    const isFinished = nextStep > TOTAL_STEPS;
    saveState({
      ...state,
      completedSteps,
      currentStep: isFinished ? TOTAL_STEPS : nextStep,
      completed: isFinished,
    });
    return { nextStep, isFinished };
  },

  skipStep(stepId) {
    const state = loadState();
    const skippedSteps = state.skippedSteps || [];
    if (!skippedSteps.includes(stepId)) skippedSteps.push(stepId);
    const nextStep = stepId + 1;
    const isFinished = nextStep > TOTAL_STEPS;
    saveState({
      ...state,
      skippedSteps,
      currentStep: isFinished ? TOTAL_STEPS : nextStep,
      completed: isFinished,
    });
    return { nextStep, isFinished };
  },

  complete() {
    const state = loadState();
    saveState({ ...state, completed: true });
  },

  dismiss() {
    const state = loadState();
    saveState({ ...state, dismissed: true });
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
