<template>
  <div class="feed-card">
    <!-- Header -->
    <div class="feed-card__header">
      <div>
        <h3 class="feed-card__title">
          Live Access Feed
          <span class="feed-live-dot">
            <span class="feed-live-dot__ring" />
            <span class="feed-live-dot__core" />
          </span>
        </h3>
        <p class="feed-card__sub">
          Real-time gate check-ins &amp; check-outs
        </p>
      </div>
      <a
        href="/dashboard/settings/logs"
        class="feed-view-all"
      >
        View All
        <span class="feed-view-all__arrow">→</span>
      </a>
    </div>

    <!-- Feed List -->
    <TransitionGroup
      name="feed-item"
      tag="div"
      class="feed-list"
    >
      <div
        v-for="(event, idx) in liveEvents"
        :key="event.id"
        class="feed-item"
        :class="event.status === 'Granted' ? 'feed-item--granted' : 'feed-item--denied'"
        :style="{ '--feed-delay': `${idx * 60}ms` }"
      >
        <!-- Left accent strip -->
        <div
          class="feed-item__strip"
          :class="event.status === 'Granted' ? 'feed-item__strip--granted' : 'feed-item__strip--denied'"
        />

        <!-- Avatar -->
        <div class="feed-item__avatar-wrap">
          <img
            :src="event.avatar"
            :alt="event.name"
            class="feed-item__avatar"
            :class="event.status === 'Granted' ? 'feed-item__avatar--granted' : 'feed-item__avatar--denied'"
          >
        </div>

        <!-- Info -->
        <div class="feed-item__info">
          <div class="feed-item__name-row">
            <span class="feed-item__name">{{ event.name }}</span>
            <span class="feed-item__emp-id">{{ event.empId }}</span>
          </div>
          <p class="feed-item__location">
            <MapPin class="w-3 h-3 flex-shrink-0" />
            <span>{{ event.device }}</span>
          </p>
        </div>

        <!-- Right badges -->
        <div class="feed-item__badges">
          <span
            class="feed-status-badge"
            :class="event.status === 'Granted' ? 'feed-status-badge--granted' : 'feed-status-badge--denied'"
          >
            {{ event.status }}
          </span>
          <p class="feed-item__time">
            {{ event.relativeTime }}
          </p>
          <span
            class="feed-type-badge"
            :class="event.type === 'Entry' ? 'feed-type-badge--entry' : 'feed-type-badge--exit'"
          >
            {{ event.type }}
          </span>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { MapPin } from 'lucide-vue-next';

const liveEvents = ref([
  { id: 1, name: 'Arun Kumar', empId: 'EMP-1042', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120', type: 'Entry', device: 'Main Entrance Gate A', relativeTime: '2 min ago', status: 'Granted' },
  { id: 2, name: 'Priya Sundaram', empId: 'EMP-1088', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', type: 'Exit', device: 'South Wing Turnstile 2', relativeTime: '3 min ago', status: 'Granted' },
  { id: 3, name: 'Rajesh Kanna', empId: 'EMP-1115', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', type: 'Entry', device: 'Server Room Controller 1', relativeTime: '5 min ago', status: 'Granted' },
  { id: 4, name: 'Vikram Sethi', empId: 'EMP-0924', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', type: 'Entry', device: 'Executive Suite Door', relativeTime: '7 min ago', status: 'Denied' },
  { id: 5, name: 'Ananya Sharma', empId: 'EMP-1204', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120', type: 'Entry', device: 'Main Entrance Gate B', relativeTime: '9 min ago', status: 'Granted' },
]);
</script>

<style scoped>
/* ─── Card Shell ──────────────────────────────────────── */
.feed-card {
  background: rgba(255,255,255,0.88);
  border: 1px solid rgba(226,232,240,0.7);
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
:global(.dark) .feed-card {
  background: rgba(21,28,44,0.88);
  border-color: rgba(255,255,255,0.07);
  box-shadow: 0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04);
}

/* ─── Header ──────────────────────────────────────────── */
.feed-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.feed-card__title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}
:global(.dark) .feed-card__title { color: #f8fafc; }
.feed-card__sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

/* Live dot */
.feed-live-dot {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
}
.feed-live-dot__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(16,185,129,0.35);
  animation: feedDotPulse 2s ease-in-out infinite;
}
.feed-live-dot__core {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16,185,129,0.7);
}
@keyframes feedDotPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.9); opacity: 0; }
}

/* View all link */
.feed-view-all {
  font-size: 12px;
  font-weight: 700;
  color: #6366f1;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: gap 200ms cubic-bezier(0.34, 1.56, 0.64, 1),
              color 200ms;
  flex-shrink: 0;
}
.feed-view-all:hover { color: #4f46e5; gap: 8px; }
:global(.dark) .feed-view-all { color: #818cf8; }
:global(.dark) .feed-view-all:hover { color: #a5b4fc; }
.feed-view-all__arrow {
  display: inline-block;
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.feed-view-all:hover .feed-view-all__arrow { transform: translateX(3px); }

/* ─── Feed List ───────────────────────────────────────── */
.feed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 340px;
  padding-right: 2px;
}
.feed-list::-webkit-scrollbar { width: 3px; }
.feed-list::-webkit-scrollbar-track { background: transparent; }
.feed-list::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.3); border-radius: 3px; }

/* Feed item */
.feed-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 10px 0;
  border-radius: 14px;
  background: rgba(248,250,252,0.7);
  border: 1px solid rgba(241,245,249,0.6);
  overflow: hidden;
  cursor: default;
  transition: background 250ms, transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 250ms;
  animation: feedSlideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--feed-delay, 0ms);
}
.feed-item:hover {
  background: rgba(241,245,249,0.9);
  transform: translateX(3px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}
:global(.dark) .feed-item {
  background: rgba(255,255,255,0.025);
  border-color: rgba(255,255,255,0.05);
}
:global(.dark) .feed-item:hover {
  background: rgba(255,255,255,0.05);
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
}

@keyframes feedSlideIn {
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Accent strip */
.feed-item__strip {
  width: 3px;
  align-self: stretch;
  border-radius: 0 3px 3px 0;
  flex-shrink: 0;
}
.feed-item__strip--granted {
  background: linear-gradient(to bottom, #10b981, rgba(16,185,129,0.3));
}
.feed-item__strip--denied {
  background: linear-gradient(to bottom, #f43f5e, rgba(244,63,94,0.3));
}

/* Avatar */
.feed-item__avatar-wrap { flex-shrink: 0; }
.feed-item__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  ring: 2px;
  transition: box-shadow 250ms;
}
.feed-item__avatar--granted {
  box-shadow: 0 0 0 2px rgba(16,185,129,0.3), 0 0 10px rgba(16,185,129,0.15);
}
.feed-item__avatar--denied {
  box-shadow: 0 0 0 2px rgba(244,63,94,0.3), 0 0 10px rgba(244,63,94,0.12);
}
.feed-item:hover .feed-item__avatar--granted {
  box-shadow: 0 0 0 2px rgba(16,185,129,0.5), 0 0 14px rgba(16,185,129,0.2);
}
.feed-item:hover .feed-item__avatar--denied {
  box-shadow: 0 0 0 2px rgba(244,63,94,0.5), 0 0 14px rgba(244,63,94,0.18);
}

/* Info */
.feed-item__info { flex: 1; min-width: 0; }
.feed-item__name-row { display: flex; align-items: baseline; gap: 6px; }
.feed-item__name {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
:global(.dark) .feed-item__name { color: #f1f5f9; }
.feed-item__emp-id {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  font-family: ui-monospace, monospace;
  flex-shrink: 0;
}
.feed-item__location {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #94a3b8;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Badges */
.feed-item__badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  flex-shrink: 0;
}
.feed-status-badge {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 999px;
}
.feed-status-badge--granted {
  background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08));
  color: #059669;
  border: 1px solid rgba(16,185,129,0.2);
}
.feed-status-badge--denied {
  background: linear-gradient(135deg, rgba(244,63,94,0.12), rgba(225,29,72,0.08));
  color: #e11d48;
  border: 1px solid rgba(244,63,94,0.2);
}
:global(.dark) .feed-status-badge--granted {
  background: linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.12));
  color: #34d399;
  border-color: rgba(16,185,129,0.3);
}
:global(.dark) .feed-status-badge--denied {
  background: linear-gradient(135deg, rgba(244,63,94,0.18), rgba(225,29,72,0.12));
  color: #fb7185;
  border-color: rgba(244,63,94,0.28);
}

.feed-item__time {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  font-family: ui-monospace, monospace;
  margin: 0;
}

.feed-type-badge {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 6px;
}
.feed-type-badge--entry { background: rgba(20,184,166,0.1); color: #0d9488; }
.feed-type-badge--exit { background: rgba(14,165,233,0.1); color: #0284c7; }
:global(.dark) .feed-type-badge--entry { background: rgba(20,184,166,0.15); color: #2dd4bf; }
:global(.dark) .feed-type-badge--exit { background: rgba(14,165,233,0.15); color: #38bdf8; }

/* TransitionGroup */
.feed-item-enter-active { transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
.feed-item-enter-from { opacity: 0; transform: translateX(20px); }
.feed-item-leave-active { transition: all 0.25s ease; }
.feed-item-leave-to { opacity: 0; transform: translateX(-10px); }

/* ─── Reduced Motion ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .feed-item { animation: none; }
  .feed-item:hover { transform: none; }
  .feed-live-dot__ring { animation: none; }
}
</style>
