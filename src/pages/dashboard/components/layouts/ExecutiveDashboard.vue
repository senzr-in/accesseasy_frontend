<template>
  <div class="space-y-6 pb-12">
    <!-- Executive High-level KPI grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Visits Month-to-Date</span>
        <h3 class="text-3xl font-black mt-2 text-slate-900 dark:text-white">1,482</h3>
        <p class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">↑ +14.2% from last month</p>
      </div>

      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Average Lobby Wait Time</span>
        <h3 class="text-3xl font-black mt-2 text-slate-900 dark:text-white">4m 12s</h3>
        <p class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">↓ -18% response improvement</p>
      </div>

      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Lobby Compliance Rating</span>
        <h3 class="text-3xl font-black mt-2 text-indigo-500">99.8%</h3>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">NDA signing completion rate</p>
      </div>

      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Visitor Operational ROI</span>
        <h3 class="text-3xl font-black mt-2 text-slate-900 dark:text-white">96.4%</h3>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Staff time saving index</p>
      </div>
    </div>

    <!-- Analytics Dashboard widgets -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Visitor Demographics & Peak Traffic (Left 2-cols) -->
      <div class="lg:col-span-2 bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col h-[400px]">
        <div class="pb-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <h3 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
            Visitor Flow Peak Hours (Linear Prediction)
          </h3>
        </div>

        <div class="flex-1 flex flex-col justify-end mt-6">
          <!-- Custom High-fidelity CSS Graph representing peak hours -->
          <div class="flex items-end justify-between h-48 px-4 gap-2">
            <div class="flex-1 flex flex-col items-center gap-2">
              <div class="w-full bg-slate-200 dark:bg-zinc-800 rounded-t-lg h-[15%] transition-all hover:bg-indigo-500" title="08:00 AM" />
              <span class="text-[8px] font-bold text-slate-400">08:00</span>
            </div>
            <div class="flex-1 flex flex-col items-center gap-2">
              <div class="w-full bg-slate-200 dark:bg-zinc-800 rounded-t-lg h-[45%] transition-all hover:bg-indigo-500" title="09:00 AM" />
              <span class="text-[8px] font-bold text-slate-400">09:00</span>
            </div>
            <div class="flex-1 flex flex-col items-center gap-2">
              <div class="w-full bg-indigo-600 rounded-t-lg h-[95%] transition-all hover:bg-indigo-700 shadow-md shadow-indigo-500/20" title="10:00 AM (Peak)" />
              <span class="text-[8px] font-bold text-indigo-500">10:00</span>
            </div>
            <div class="flex-1 flex flex-col items-center gap-2">
              <div class="w-full bg-indigo-600 rounded-t-lg h-[80%] transition-all hover:bg-indigo-700 shadow-md shadow-indigo-500/20" title="11:00 AM" />
              <span class="text-[8px] font-bold text-indigo-500">11:00</span>
            </div>
            <div class="flex-1 flex flex-col items-center gap-2">
              <div class="w-full bg-slate-200 dark:bg-zinc-800 rounded-t-lg h-[30%] transition-all hover:bg-indigo-500" title="12:00 PM" />
              <span class="text-[8px] font-bold text-slate-400">12:00</span>
            </div>
            <div class="flex-1 flex flex-col items-center gap-2">
              <div class="w-full bg-slate-200 dark:bg-zinc-800 rounded-t-lg h-[25%] transition-all hover:bg-indigo-500" title="01:00 PM" />
              <span class="text-[8px] font-bold text-slate-400">13:00</span>
            </div>
            <div class="flex-1 flex flex-col items-center gap-2">
              <div class="w-full bg-slate-200 dark:bg-zinc-800 rounded-t-lg h-[50%] transition-all hover:bg-indigo-500" title="02:00 PM" />
              <span class="text-[8px] font-bold text-slate-400">14:00</span>
            </div>
            <div class="flex-1 flex flex-col items-center gap-2">
              <div class="w-full bg-slate-200 dark:bg-zinc-800 rounded-t-lg h-[65%] transition-all hover:bg-indigo-500" title="03:00 PM" />
              <span class="text-[8px] font-bold text-slate-400">15:00</span>
            </div>
          </div>
          
          <div class="mt-6 flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100 dark:border-zinc-800/80 pt-4">
            <span>Forecast status: Optimal</span>
            <span>Capacity load: 45%</span>
          </div>
        </div>
      </div>

      <!-- Compliance & Security Audit matrix (Right 1-col) -->
      <div class="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col h-[400px]">
        <div class="pb-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <h3 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
            Compliance Audit Matrix
          </h3>
        </div>

        <div class="flex-1 flex flex-col justify-around py-4">
          <!-- Compliance Item 1 -->
          <div class="flex justify-between items-center text-xs">
            <div>
              <span class="block font-bold text-slate-800 dark:text-white">NDA Completions</span>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">NDA document signing matches</span>
            </div>
            <span class="font-black text-indigo-500">100.0%</span>
          </div>

          <!-- Compliance Item 2 -->
          <div class="flex justify-between items-center text-xs">
            <div>
              <span class="block font-bold text-slate-800 dark:text-white">Contractor Document Renewals</span>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Insurance / ID verification checks</span>
            </div>
            <span class="font-black text-emerald-500">98.5%</span>
          </div>

          <!-- Compliance Item 3 -->
          <div class="flex justify-between items-center text-xs">
            <div>
              <span class="block font-bold text-slate-800 dark:text-white">Safety Briefing Confirmations</span>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Evacuation plan approvals</span>
            </div>
            <span class="font-black text-emerald-500">99.1%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Pure executive views. Uses mock/analyzed KPIs.
</script>
