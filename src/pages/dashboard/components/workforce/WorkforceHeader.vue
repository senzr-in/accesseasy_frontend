<template>
  <header class="header-card">
    <div class="header-inner">
      <!-- Left: Greeting & Date -->
      <div class="header-left">
        <div class="header-icon">
          <Building2 class="w-5 h-5" />
        </div>
        <div>
          <div class="header-greeting-row">
            <h1 class="header-greeting">
              {{ greeting }}, Admin
            </h1>
            <span class="header-live-badge">
              <span class="header-live-dot">
                <span class="header-live-dot__ring" />
                <span class="header-live-dot__core" />
              </span>
              Live Operations
            </span>
          </div>
          <p class="header-date-row">
            <Calendar class="w-3.5 h-3.5" />
            <span>{{ currentDateStr }}</span>
            <span class="header-sep">•</span>
            <Clock class="w-3.5 h-3.5" />
            <span class="header-time">{{ currentTimeStr }}</span>
          </p>
        </div>
      </div>

      <!-- Right: Controls -->
      <div class="header-right">
        <!-- Site Selector -->
        <div class="relative">
          <button
            class="site-selector"
            @click="isSiteOpen = !isSiteOpen"
          >
            <MapPin class="w-3.5 h-3.5 text-indigo-500" />
            <span>{{ selectedSite }}</span>
            <ChevronDown
              class="w-3.5 h-3.5 text-slate-400"
              :class="{ 'rotate-180': isSiteOpen }"
              style="transition: transform 250ms cubic-bezier(0.34,1.56,0.64,1)"
            />
          </button>
          <Transition name="dropdown-sm">
            <div
              v-if="isSiteOpen"
              class="site-dropdown"
            >
              <button
                v-for="site in sites"
                :key="site"
                class="site-option"
                :class="{ 'site-option--active': selectedSite === site }"
                @click="selectedSite = site; isSiteOpen = false"
              >
                <span>{{ site }}</span>
                <Check
                  v-if="selectedSite === site"
                  class="w-3.5 h-3.5 text-indigo-500"
                />
              </button>
            </div>
          </Transition>
        </div>

        <!-- Search Bar -->
        <div class="search-wrap">
          <Search class="search-icon" />
          <input
            type="text"
            placeholder="Search employee, device..."
            class="search-input"
          >
        </div>

        <!-- Notification Bell -->
        <button class="notif-btn">
          <Bell class="w-4 h-4" />
          <span class="notif-dot" />
        </button>

        <!-- Quick Action -->
        <div class="relative">
          <button
            class="quick-action-btn"
            @click="isQuickActionOpen = !isQuickActionOpen"
          >
            <Plus class="w-4 h-4" />
            <span>Quick Action</span>
            <ChevronDown
              class="w-3.5 h-3.5 opacity-75"
              :class="{ 'rotate-180': isQuickActionOpen }"
              style="transition: transform 250ms cubic-bezier(0.34,1.56,0.64,1)"
            />
          </button>
          <Transition name="dropdown-sm">
            <div
              v-if="isQuickActionOpen"
              class="quick-dropdown"
            >
              <a
                href="/dashboard/easy-access/employees"
                class="quick-item"
              >
                <UserPlus class="w-4 h-4 text-indigo-500" /> Add Employee
              </a>
              <a
                href="/dashboard/settings/devices"
                class="quick-item"
              >
                <HardDrive class="w-4 h-4 text-indigo-500" /> Add Access Device
              </a>
              <a
                href="/dashboard/easy-access/biometrics"
                class="quick-item"
              >
                <CreditCard class="w-4 h-4 text-indigo-500" /> Issue Access Card
              </a>
              <div class="quick-divider" />
              <a
                href="/dashboard/report-automation"
                class="quick-item"
              >
                <FileSpreadsheet class="w-4 h-4 text-indigo-500" /> Generate Report
              </a>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Building2, Calendar, Clock, MapPin, ChevronDown, Search, Bell, Plus, Check, UserPlus, HardDrive, CreditCard, FileSpreadsheet } from 'lucide-vue-next';

const selectedSite = ref('Main HQ Campus');
const sites = ['Main HQ Campus', 'North Wing Office', 'Tech Park Block B', 'Warehouse & Logistics'];
const isSiteOpen = ref(false);
const isQuickActionOpen = ref(false);
const now = ref(new Date());
let timer = null;

onMounted(() => { timer = setInterval(() => { now.value = new Date(); }, 1000); });
onUnmounted(() => { if (timer) clearInterval(timer); });

const greeting = computed(() => {
  const h = now.value.getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
});

const currentDateStr = computed(() =>
  now.value.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
);
const currentTimeStr = computed(() =>
  now.value.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
);
</script>

<style scoped>
/* ─── Card Shell ──────────────────────────────────────── */
.header-card {
  background: rgba(255,255,255,0.88);
  border: 1px solid rgba(226,232,240,0.7);
  border-radius: 20px;
  padding: 18px 22px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
  margin-bottom: 20px;
}
:global(.dark) .header-card {
  background: rgba(21,28,44,0.88);
  border-color: rgba(255,255,255,0.07);
  box-shadow: 0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05);
}

.header-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
@media (min-width: 1024px) {
  .header-inner { flex-direction: row; align-items: center; justify-content: space-between; gap: 16px; }
}

/* ─── Left side ───────────────────────────────────────── */
.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08));
  border: 1px solid rgba(99,102,241,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(99,102,241,0.12);
  transition: transform 400ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms;
}
.header-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(99,102,241,0.2);
}
:global(.dark) .header-icon {
  background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12));
  border-color: rgba(99,102,241,0.25);
  color: #818cf8;
}

.header-greeting-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.header-greeting {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #0f172a 0%, #3730a3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
  margin: 0;
}
:global(.dark) .header-greeting {
  background: linear-gradient(135deg, #f8fafc 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.header-live-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.07));
  color: #059669;
  border: 1px solid rgba(16,185,129,0.2);
}
:global(.dark) .header-live-badge {
  background: linear-gradient(135deg, rgba(16,185,129,0.14), rgba(5,150,105,0.09));
  color: #34d399;
  border-color: rgba(16,185,129,0.25);
}

.header-live-dot {
  position: relative;
  display: inline-flex;
  width: 10px;
  height: 10px;
  align-items: center;
  justify-content: center;
}
.header-live-dot__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(16,185,129,0.4);
  animation: hdrDotPulse 2s ease-in-out infinite;
}
.header-live-dot__core {
  position: relative;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px rgba(16,185,129,0.6);
}
@keyframes hdrDotPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.9); opacity: 0; }
}

.header-date-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  margin-top: 4px;
}
.header-sep { color: rgba(148,163,184,0.5); }
.header-time {
  font-family: ui-monospace, monospace;
  font-weight: 700;
  font-size: 11px;
  color: #6366f1;
  letter-spacing: 0.02em;
}
:global(.dark) .header-time { color: #818cf8; }

/* ─── Right side ──────────────────────────────────────── */
.header-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* Site selector */
.site-selector {
  height: 38px;
  padding: 0 12px;
  border-radius: 12px;
  background: rgba(248,250,252,0.9);
  border: 1px solid rgba(226,232,240,0.7);
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: background 200ms, border-color 200ms, box-shadow 200ms;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.site-selector:hover {
  background: rgba(241,245,249,0.95);
  border-color: rgba(99,102,241,0.25);
  box-shadow: 0 2px 8px rgba(99,102,241,0.08);
}
:global(.dark) .site-selector {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.08);
  color: #e2e8f0;
}
:global(.dark) .site-selector:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(129,140,248,0.3);
}

.site-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  width: 200px;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(226,232,240,0.6);
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  padding: 6px;
  z-index: 100;
}
:global(.dark) .site-dropdown {
  background: rgba(18,25,42,0.96);
  border-color: rgba(255,255,255,0.08);
  box-shadow: 0 8px 30px rgba(0,0,0,0.35);
}

.site-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  text-align: left;
  transition: background 150ms;
}
.site-option:hover { background: rgba(241,245,249,0.9); }
.site-option--active { color: #6366f1; font-weight: 800; }
:global(.dark) .site-option { color: #e2e8f0; }
:global(.dark) .site-option--active { color: #818cf8; }
:global(.dark) .site-option:hover { background: rgba(255,255,255,0.06); }

/* Search */
.search-wrap {
  position: relative;
  flex: 1;
  min-width: 180px;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: #94a3b8;
  pointer-events: none;
}
.search-input {
  width: 100%;
  height: 38px;
  padding: 0 12px 0 32px;
  background: rgba(248,250,252,0.9);
  border: 1px solid rgba(226,232,240,0.7);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  transition: border-color 200ms, box-shadow 200ms;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.search-input::placeholder { color: #94a3b8; }
.search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}
:global(.dark) .search-input {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.08);
  color: #f1f5f9;
}
:global(.dark) .search-input:focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 3px rgba(129,140,248,0.12);
}

/* Notification bell */
.notif-btn {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(248,250,252,0.9);
  border: 1px solid rgba(226,232,240,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 200ms, color 200ms, transform 350ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.notif-btn:hover {
  background: rgba(241,245,249,0.95);
  color: #334155;
  transform: scale(1.08);
  box-shadow: 0 3px 10px rgba(0,0,0,0.07);
}
:global(.dark) .notif-btn {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.08);
  color: #94a3b8;
}
:global(.dark) .notif-btn:hover {
  background: rgba(255,255,255,0.08);
  color: #e2e8f0;
}

.notif-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f43f5e;
  border: 2px solid white;
  box-shadow: 0 0 6px rgba(244,63,94,0.5);
  animation: notifPulse 2s ease-in-out infinite;
}
:global(.dark) .notif-dot { border-color: #151c2c; }
@keyframes notifPulse {
  0%, 100% { box-shadow: 0 0 4px rgba(244,63,94,0.5); }
  50% { box-shadow: 0 0 10px rgba(244,63,94,0.8); }
}

/* Quick action button */
.quick-action-btn {
  height: 38px;
  padding: 0 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  color: white;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  transition: transform 350ms cubic-bezier(0.34,1.56,0.64,1),
              box-shadow 300ms,
              background 300ms;
  box-shadow: 0 3px 14px rgba(99,102,241,0.35);
}
.quick-action-btn:hover {
  background: linear-gradient(135deg, #818cf8, #6366f1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99,102,241,0.45);
}
.quick-action-btn:active {
  transform: translateY(0px);
  box-shadow: 0 2px 8px rgba(99,102,241,0.3);
}

.quick-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  width: 210px;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(226,232,240,0.6);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.06);
  padding: 8px;
  z-index: 100;
}
:global(.dark) .quick-dropdown {
  background: rgba(18,25,42,0.97);
  border-color: rgba(255,255,255,0.08);
  box-shadow: 0 10px 40px rgba(0,0,0,0.4), 0 2px 10px rgba(0,0,0,0.25);
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  text-decoration: none;
  transition: background 150ms, transform 200ms;
}
.quick-item:hover {
  background: rgba(241,245,249,0.9);
  transform: translateX(3px);
}
:global(.dark) .quick-item { color: #e2e8f0; }
:global(.dark) .quick-item:hover { background: rgba(255,255,255,0.06); }

.quick-divider {
  height: 1px;
  background: rgba(226,232,240,0.6);
  margin: 5px 0;
}
:global(.dark) .quick-divider { background: rgba(255,255,255,0.06); }

/* Dropdown transitions */
.dropdown-sm-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
  transform-origin: top right;
}
.dropdown-sm-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-8px);
}
.dropdown-sm-leave-active {
  transition: all 0.15s ease;
  transform-origin: top right;
}
.dropdown-sm-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

/* ─── Reduced Motion ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .header-live-dot__ring, .notif-dot { animation: none; }
  .notif-btn:hover, .quick-action-btn:hover { transform: none; }
  .quick-item:hover { transform: none; }
}
</style>
