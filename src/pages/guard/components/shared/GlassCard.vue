<template>
  <div 
    class="relative overflow-hidden transition-all duration-300"
    :class="[
      // Base styles
      'rounded-[18px] backdrop-blur-2xl border',
      // Theme matching (Apple/Linear inspired glass)
      'bg-white dark:bg-slate-900/80 dark:bg-slate-900/60',
      'border-slate-200 dark:border-slate-800/60 dark:border-white/10',
      'shadow-xl shadow-slate-200/20 dark:shadow-black/40',
      // Optional interactive styles
      interactive ? 'hover:shadow-2xl hover:border-cyan-500/30 dark:hover:border-cyan-400/30 cursor-pointer active:scale-[0.99]' : '',
      // Custom padding
      noPadding ? '' : 'p-6',
      // Any extra classes passed
      $attrs.class
    ]"
  >
    <!-- Optional Neon Top Accent Line -->
    <div 
      v-if="accentColor" 
      class="absolute top-0 left-0 right-0 h-1 opacity-80"
      :class="accentColor"
    />
    
    <!-- Optional Ambient Glow for dark mode -->
    <div 
      v-if="glowColor"
      class="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-40 hidden dark:block"
      :class="glowColor"
    />

    <slot />
  </div>
</template>

<script setup>
defineProps({
  interactive: {
    type: Boolean,
    default: false
  },
  noPadding: {
    type: Boolean,
    default: false
  },
  accentColor: {
    type: String, // e.g. 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'
    default: ''
  },
  glowColor: {
    type: String, // e.g. 'bg-cyan-500'
    default: ''
  }
})
</script>
