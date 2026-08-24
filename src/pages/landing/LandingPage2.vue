<template>
  <div class="patrol-v2" ref="rootEl" :class="[`vision-${currentVisionMode}`, `cam-mode-${currentCamMode}`]" @mousemove="handleGlobalMouseMove">
    <!-- ═══════════════════════════════════════════════════════════
         1. CUSTOM MAGNETIC FLUID CURSOR & GLOW LIGHT
    ═══════════════════════════════════════════════════════════ -->
    <div 
      class="cursor-glow" 
      :style="{ transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)` }"
    ></div>
    <div 
      class="cursor-dot" 
      :class="{ 'cursor-active': isCursorHovering, 'cursor-clicking': isClicking }"
      :style="{ transform: `translate3d(${smoothCursor.x}px, ${smoothCursor.y}px, 0)` }"
    ></div>

    <!-- ═══════════════════════════════════════════════════════════
         2. 3D WEBGL CANVAS BACKGROUND & SPATIAL HUD OVERLAYS
    ═══════════════════════════════════════════════════════════ -->
    <div class="canvas-wrapper">
      <canvas ref="canvasEl" class="webgl-canvas"></canvas>
      
      <!-- Night Vision Scanline & CRT Overlay (when active) -->
      <div v-if="currentVisionMode === 'night'" class="night-vision-overlay">
        <div class="nv-crosshair"></div>
        <div class="nv-battery">NVG-GEN3 &bull; BAT 94% &bull; GAIN +12dB</div>
      </div>

      <!-- Thermal Overlay (when active) -->
      <div v-if="currentVisionMode === 'thermal'" class="thermal-vision-overlay">
        <div class="thermal-palette-bar">
          <span>HIGH 38°C</span>
          <div class="thermal-gradient"></div>
          <span>LOW 12°C</span>
        </div>
      </div>

      <!-- Projected 3D Checkpoint Spatial Tooltip (Follows 3D Mesh) -->
      <div 
        v-if="hoveredCheckpoint"
        class="spatial-3d-tooltip"
        :style="{ left: `${hoveredCheckpointScreenPos.x}px`, top: `${hoveredCheckpointScreenPos.y}px` }"
      >
        <div class="tooltip-header">
          <span class="status-indicator"></span>
          <span class="tooltip-title">{{ hoveredCheckpoint.name }}</span>
        </div>
        <div class="tooltip-details">
          <div class="tooltip-row">
            <span class="label">Hardware:</span>
            <span class="val">{{ hoveredCheckpoint.hardware }}</span>
          </div>
          <div class="tooltip-row">
            <span class="label">Last Verified:</span>
            <span class="val text-cyan">{{ hoveredCheckpoint.lastVerified }}</span>
          </div>
          <div class="tooltip-row">
            <span class="label">Guard On Duty:</span>
            <span class="val">{{ hoveredCheckpoint.guard }}</span>
          </div>
          <div class="tooltip-row">
            <span class="label">Verification:</span>
            <span class="val text-emerald">{{ hoveredCheckpoint.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════
         2b. FLOATING TACTICAL 3D COMMAND DOCK (Bottom-Right)
    ═══════════════════════════════════════════════════════════ -->
    <aside class="tactical-hud-dock" :class="{ 'dock-minimized': isDockMinimized }">
      <div class="dock-header">
        <div class="dock-title-group">
          <span class="dock-live-pulse"></span>
          <span class="dock-title">3D TACTICAL COMMAND DOCK</span>
        </div>
        <button class="dock-toggle-btn" @click="isDockMinimized = !isDockMinimized" :title="isDockMinimized ? 'Expand HUD' : 'Collapse HUD'">
          <svg v-if="!isDockMinimized" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      </div>

      <div v-show="!isDockMinimized" class="dock-content">
        <!-- Vision Mode Selector Row -->
        <div class="dock-section">
          <span class="dock-section-label">VISION SENSOR</span>
          <div class="dock-pill-grid">
            <button 
              v-for="mode in visionModes" 
              :key="mode.id"
              class="dock-pill-btn"
              :class="{ active: currentVisionMode === mode.id }"
              @click="setVisionMode(mode.id)"
              :title="mode.desc"
            >
              <span class="pill-icon" v-html="mode.icon"></span>
              <span>{{ mode.name }}</span>
            </button>
          </div>
        </div>

        <!-- Camera Perspective Selector Row -->
        <div class="dock-section">
          <span class="dock-section-label">CAMERA POV</span>
          <div class="dock-pill-grid">
            <button 
              v-for="cam in camModes" 
              :key="cam.id"
              class="dock-pill-btn"
              :class="{ active: currentCamMode === cam.id }"
              @click="setCamMode(cam.id)"
              :title="cam.desc"
            >
              <span class="pill-icon" v-html="cam.icon"></span>
              <span>{{ cam.name }}</span>
            </button>
          </div>
        </div>

        <!-- Tour Quick Selector & Telemetry Toggles -->
        <div class="dock-footer-row">
          <div class="dock-tour-select-wrap">
            <select v-model="activeTourId" class="dock-tour-dropdown" @change="onTourDropdownChange">
              <option v-for="t in patrolTours" :key="t.id" :value="t.id">
                📍 {{ t.name }}
              </option>
            </select>
          </div>

          <button 
            class="dock-action-btn" 
            :class="{ active: showParticleField }"
            @click="toggleParticles"
            title="Toggle Particle Telemetry"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <circle cx="19" cy="5" r="2"></circle>
              <circle cx="5" cy="19" r="2"></circle>
            </svg>
            <span>{{ fpsCounter }} FPS</span>
          </button>

          <button 
            class="dock-action-btn" 
            :class="{ active: !isAudioMuted }"
            @click="toggleAudio"
            title="Toggle Tactical Audio FX"
          >
            <svg v-if="!isAudioMuted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
            <span>{{ isAudioMuted ? 'Muted' : 'Audio' }}</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- ═══════════════════════════════════════════════════════════
         3. TOP NAVIGATION BAR (HOLOGRAPHIC GLASS)
    ═══════════════════════════════════════════════════════════ -->
    <header class="navbar" :class="{ 'navbar-scrolled': isScrolled }">
      <div class="nav-inner">
        <!-- Logo -->
        <a href="#" class="brand-link" @click.prevent="scrollTo('hero')">
          <div class="brand-shield-wrap">
            <div class="brand-shield-glow"></div>
            <img :src="logoPatrol" class="brand-logo-img" alt="AccessEasy Patrol Logo" />
          </div>
          <div class="brand-text-block">
            <span class="brand-title">AccessEasy <span class="brand-highlight">PATROL</span></span>
            <span class="brand-subtitle">Smart Guard Tour & GPS Telemetry</span>
          </div>
        </a>

        <!-- Nav Links -->
        <nav class="nav-menu" aria-label="Main navigation">
          <a href="#features" class="nav-item" @click.prevent="scrollTo('features')">Features</a>
          <a href="#simulator" class="nav-item nav-item-pulse" @click.prevent="scrollTo('simulator')">
            <span class="badge-dot"></span> SOS Sandbox
          </a>
          <a href="#scanner-sim" class="nav-item" @click.prevent="scrollTo('scanner-sim')">NFC & Geofence</a>
          <a href="#tours" class="nav-item" @click.prevent="scrollTo('tours')">3D Tours</a>
          <a href="#global-fleet" class="nav-item" @click.prevent="scrollTo('global-fleet')">Global Sites</a>
          <a href="#pricing" class="nav-item" @click.prevent="scrollTo('pricing')">Pricing</a>
          <a href="#faq" class="nav-item" @click.prevent="scrollTo('faq')">FAQ</a>
        </nav>

        <!-- CTAs -->
        <div class="nav-actions">
          <button 
            class="btn btn-ghost" 
            @click="goToLogin"
            @mouseenter="onCursorHover(true)" 
            @mouseleave="onCursorHover(false)"
          >
            SOC Login
          </button>
          <button 
            class="btn btn-primary" 
            @click="goToLogin"
            @mouseenter="onCursorHover(true)" 
            @mouseleave="onCursorHover(false)"
          >
            <span class="btn-shine"></span>
            <span class="btn-text">Start 7-Day Free Trial</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-toggle" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line v-if="!mobileMenuOpen" x1="3" y1="12" x2="21" y2="12"></line>
            <line v-if="!mobileMenuOpen" x1="3" y1="6" x2="21" y2="6"></line>
            <line v-if="!mobileMenuOpen" x1="3" y1="18" x2="21" y2="18"></line>
            <line v-if="mobileMenuOpen" x1="18" y1="6" x2="6" y2="18"></line>
            <line v-if="mobileMenuOpen" x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Mobile Dropdown Menu -->
      <div v-if="mobileMenuOpen" class="mobile-menu-drawer">
        <a href="#features" class="mob-link" @click="mobileMenuOpen = false; scrollTo('features')">Features</a>
        <a href="#simulator" class="mob-link" @click="mobileMenuOpen = false; scrollTo('simulator')">SOS Sandbox</a>
        <a href="#scanner-sim" class="mob-link" @click="mobileMenuOpen = false; scrollTo('scanner-sim')">NFC Phone Scanner</a>
        <a href="#geofence-builder" class="mob-link" @click="mobileMenuOpen = false; scrollTo('geofence-builder')">Geofence Lab</a>
        <a href="#radio-hub" class="mob-link" @click="mobileMenuOpen = false; scrollTo('radio-hub')">Radio Comms</a>
        <a href="#tours" class="mob-link" @click="mobileMenuOpen = false; scrollTo('tours')">3D Tours</a>
        <a href="#mobile-app" class="mob-link" @click="mobileMenuOpen = false; scrollTo('mobile-app')">Guard App</a>
        <a href="#global-fleet" class="mob-link" @click="mobileMenuOpen = false; scrollTo('global-fleet')">Global Sites</a>
        <a href="#pricing" class="mob-link" @click="mobileMenuOpen = false; scrollTo('pricing')">Pricing</a>
        <a href="#faq" class="mob-link" @click="mobileMenuOpen = false; scrollTo('faq')">FAQ</a>
        <div class="mob-cta-row">
          <button class="btn btn-ghost w-full" @click="goToLogin">Login</button>
          <button class="btn btn-primary w-full" @click="goToLogin">Start Free Trial</button>
        </div>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════════════
         4. HERO SECTION (INTERACTIVE 3D TACTICAL COMMAND)
    ═══════════════════════════════════════════════════════════ -->
    <section id="hero" class="hero-section">
      <div class="section-container hero-grid">
        <!-- Left: Headline & Live CTA Stack -->
        <div class="hero-content">
          <div class="hero-badge" @mouseenter="playSfx('blip')">
            <span class="badge-radar"></span>
            <span class="hero-badge-text">NEXT-GEN 3D GUARD PATROL INTELLIGENCE</span>
            <span class="badge-tag">v2.8 LIVE</span>
          </div>

          <h1 class="hero-title">
            Real-Time Patrol Tracking & 
            <span class="gradient-text">Zero-Trust Guard Verification</span>
          </h1>

          <p class="hero-description">
            Eliminate missed patrols and unverified tours. AccessEasy Patrol combines 
            <strong>cryptographic NFC/QR anti-spoofing</strong>, <strong>4-tier sub-meter GPS accuracy</strong>, 
            instant <strong>1-tap SOS panic dispatch</strong>, and automated multi-site client reporting.
          </p>

          <!-- Hero Metrics Bar -->
          <div class="hero-metrics-pill-grid">
            <div class="metric-pill">
              <span class="metric-val text-cyan">99.98%</span>
              <span class="metric-lbl">NFC Scan Integrity</span>
            </div>
            <div class="metric-pill">
              <span class="metric-val text-emerald">&plusmn;0.8m</span>
              <span class="metric-lbl">4-Tier GPS Precision</span>
            </div>
            <div class="metric-pill">
              <span class="metric-val text-amber">&lt; 3.2s</span>
              <span class="metric-lbl">SOC Panic Dispatch</span>
            </div>
          </div>

          <!-- Hero Action Buttons -->
          <div class="hero-cta-stack">
            <button 
              class="btn btn-primary btn-lg"
              @click="goToLogin"
              @mouseenter="onCursorHover(true)" 
              @mouseleave="onCursorHover(false)"
            >
              <span class="btn-shine"></span>
              <span>Launch Live Patrol Demo</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>

            <button 
              class="btn btn-secondary btn-lg"
              @click="scrollTo('simulator')"
              @mouseenter="onCursorHover(true)" 
              @mouseleave="onCursorHover(false)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>Test SOS Panic Sandbox</span>
            </button>
          </div>

          <!-- Guard App Download & Offline Badge -->
          <div class="hero-trust-badges">
            <div class="trust-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Offline-First FIFO Sync</span>
            </div>
            <div class="trust-divider"></div>
            <div class="trust-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>AES-256 Checkpoint Signatures</span>
            </div>
            <div class="trust-divider"></div>
            <div class="trust-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>Instant Web Audio Siren</span>
            </div>
          </div>
        </div>

        <!-- Right: Live Active Guard Hologram Telemetry HUD -->
        <div class="hero-telemetry-panel">
          <div class="holo-card" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
            <div class="holo-card-inner">
              <div class="holo-header">
                <div class="guard-id-block">
                  <div class="guard-avatar-ring">
                    <span class="avatar-radar"></span>
                    <div class="avatar-img-placeholder">
                      <span>AJ</span>
                    </div>
                  </div>
                  <div>
                    <div class="guard-name-row">
                      <span class="guard-fullname">Alex Johnson</span>
                      <span class="role-badge">Lead Guard</span>
                    </div>
                    <div class="guard-meta">ID: SEC-8041 &bull; Alpha Shift &bull; Zone 04</div>
                  </div>
                </div>

                <div class="guard-status-badge">
                  <span class="status-dot"></span>
                  <span>ON ACTIVE ROUTE</span>
                </div>
              </div>

              <!-- Live Telemetry Matrix -->
              <div class="telemetry-stat-grid">
                <div class="telem-box">
                  <span class="telem-lbl">Current Checkpoint</span>
                  <span class="telem-val text-cyan">CP-03: Server Vault</span>
                </div>
                <div class="telem-box">
                  <span class="telem-lbl">Tour Progress</span>
                  <span class="telem-val">4 / 6 Completed</span>
                </div>
                <div class="telem-box">
                  <span class="telem-lbl">Walking Speed</span>
                  <span class="telem-val">1.2 m/s (Nominal)</span>
                </div>
                <div class="telem-box">
                  <span class="telem-lbl">Mobile Battery</span>
                  <span class="telem-val text-emerald">94% &bull; GPS Active</span>
                </div>
              </div>

              <!-- Route Progress Bar -->
              <div class="telem-progress-wrap">
                <div class="telem-progress-header">
                  <span>Tour Schedule Adherence: <strong>98.4%</strong></span>
                  <span class="text-cyan">00:04:12 ahead of schedule</span>
                </div>
                <div class="telem-track">
                  <div class="telem-bar" style="width: 66%;"></div>
                </div>
              </div>

              <!-- Live Micro Logs -->
              <div class="micro-logs-feed">
                <div class="micro-log-item" v-for="(log, idx) in activeGuardLogs" :key="idx">
                  <span class="micro-time">{{ log.time }}</span>
                  <span class="micro-icon" v-html="log.icon"></span>
                  <span class="micro-msg">{{ log.text }}</span>
                  <span class="micro-tag" :class="log.tagClass">{{ log.tag }}</span>
                </div>
              </div>

              <!-- Live Heartbeat Waveform -->
              <div class="telem-footer">
                <div class="telemetry-waveform">
                  <span class="wave-bar" v-for="i in 16" :key="i" :style="{ animationDelay: `${i * 0.08}s` }"></span>
                </div>
                <span class="telem-latency">WebSocket: <strong>14ms latency</strong> (Encrypted MQTT)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         5. INTERACTIVE LIVE SOS & INCIDENT DISPATCH SIMULATOR
    ═══════════════════════════════════════════════════════════ -->
    <section id="simulator" class="section-container simulator-section">
      <div class="section-header">
        <div class="section-badge">INTERACTIVE THREAT & SOS DISPATCH ENGINE</div>
        <h2 class="section-title">Test the SOC Emergency Dispatch Sandbox</h2>
        <p class="section-subtitle">
          Experience how AccessEasy Patrol intercepts perimeter intrusions, missed checkpoints, 
          and guard panic alerts in real-time with sub-second automated rerouting.
        </p>
      </div>

      <div class="sim-container" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
        <div class="sim-grid">
          <!-- Left: Simulation Trigger Controls -->
          <div class="sim-controls">
            <h3 class="sim-panel-title">1. Trigger a Security Scenario</h3>
            <p class="sim-panel-desc">Select an emergency trigger to observe automated real-time dispatch:</p>

            <div class="sim-buttons-stack">
              <button 
                class="sim-btn"
                :class="{ active: activeSimScenario === 'sos' }"
                @click="triggerSimulation('sos')"
              >
                <div class="sim-btn-icon bg-red">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <div class="sim-btn-info">
                  <div class="sim-btn-title">Guard SOS Panic Trigger</div>
                  <div class="sim-btn-meta">1-tap panic alert sent from mobile app</div>
                </div>
              </button>

              <button 
                class="sim-btn"
                :class="{ active: activeSimScenario === 'breach' }"
                @click="triggerSimulation('breach')"
              >
                <div class="sim-btn-icon bg-amber">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div class="sim-btn-info">
                  <div class="sim-btn-title">Geofence Perimeter Violation</div>
                  <div class="sim-btn-meta">Guard strayed 24m outside authorized zone</div>
                </div>
              </button>

              <button 
                class="sim-btn"
                :class="{ active: activeSimScenario === 'missed' }"
                @click="triggerSimulation('missed')"
              >
                <div class="sim-btn-icon bg-purple">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 14 14"></polyline>
                  </svg>
                </div>
                <div class="sim-btn-info">
                  <div class="sim-btn-title">Missed Checkpoint Interval</div>
                  <div class="sim-btn-meta">Checkpoint #04 not scanned within 15min window</div>
                </div>
              </button>
            </div>

            <!-- Manual Reset / Deploy Button -->
            <div class="sim-dispatch-action">
              <button 
                class="btn btn-primary w-full"
                :disabled="isDispatching"
                @click="executeAutoDispatch"
              >
                <span class="btn-shine"></span>
                <span>{{ isDispatching ? 'Dispatching Nearest Guard Unit...' : 'Dispatch Guard Backup Now' }}</span>
              </button>
            </div>
          </div>

          <!-- Right: Live Simulated SOC Terminal Feed -->
          <div class="sim-terminal">
            <div class="terminal-header">
              <div class="term-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <div class="term-title">SOC LIVE INCIDENT DISPATCH CONSOLE</div>
              <div class="term-time">{{ simClock }}</div>
            </div>

            <div class="terminal-body" ref="terminalBodyEl">
              <div 
                v-for="(item, idx) in simTerminalLogs" 
                :key="idx" 
                class="term-line"
                :class="item.type"
              >
                <span class="term-stamp">[{{ item.time }}]</span>
                <span class="term-tag">{{ item.tag }}</span>
                <span class="term-text">{{ item.text }}</span>
              </div>

              <!-- Animated Dispatch Banner -->
              <div v-if="simIncidentActive" class="term-alert-banner">
                <div class="alert-icon-wrap">
                  <span class="alert-ping"></span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <div class="alert-details">
                  <div class="alert-heading">ACTIVE INCIDENT #INC-{{ simIncidentId }}</div>
                  <div class="alert-desc">{{ simIncidentMessage }}</div>
                  <div class="alert-meta">
                    <span>Target: <strong>Sector B &bull; Vault Gate</strong></span>
                    <span>Nearest Unit: <strong>Guard Marcus Vance (120m away)</strong></span>
                    <span>Calculated Intercept ETA: <strong class="text-cyan">{{ simEtaCountdown }}s</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Terminal Status Bar -->
            <div class="terminal-footer">
              <div class="term-status-pill">
                <span class="pulse-dot"></span>
                <span>MQTT Broker: Connected</span>
              </div>
              <div class="term-geo-eval">4-Tier GPS Logic: <strong>VERDICT_VALID</strong></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         6. INTERACTIVE MOBILE NFC / QR PHONE SCANNER SIMULATOR
    ═══════════════════════════════════════════════════════════ -->
    <section id="scanner-sim" class="section-container scanner-section">
      <div class="section-header">
        <div class="section-badge">INTERACTIVE GUARD MOBILE APP LAB</div>
        <h2 class="section-title">Experience 1-Tap Cryptographic NFC & QR Scanning</h2>
        <p class="section-subtitle">
          Click the interactive phone controls below to simulate scanning physical tags, 
          generating cryptographic anti-spoof signatures, and attaching photo evidence in real-time.
        </p>
      </div>

      <div class="scanner-layout" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
        <!-- Left: Interactive Mobile Device Frame -->
        <div class="interactive-phone-wrap">
          <div class="interactive-phone">
            <!-- Dynamic Island / Speaker -->
            <div class="phone-dynamic-island">
              <span class="island-camera"></span>
              <span class="island-sensor"></span>
            </div>

            <!-- Phone Screen View -->
            <div class="phone-screen-content">
              <!-- Top Bar -->
              <div class="phone-status-bar">
                <span>11:42 AM</span>
                <span class="text-cyan">AccessEasy Guard v2.8</span>
                <span class="text-emerald">100% ⚡</span>
              </div>

              <!-- Guard Profile Pill -->
              <div class="phone-guard-bar">
                <div class="phone-avatar">AJ</div>
                <div>
                  <div class="phone-guard-name">Alex Johnson</div>
                  <div class="phone-guard-loc">Nexus Campus &bull; Alpha Shift</div>
                </div>
                <span class="phone-badge-live">GPS LOCKED</span>
              </div>

              <!-- Active Scanner Target Viewport -->
              <div class="phone-scanner-viewport" :class="{ 'scan-scanning': isNfcScanning, 'scan-success': nfcScanSuccess }">
                <div class="scanner-corner tl"></div>
                <div class="scanner-corner tr"></div>
                <div class="scanner-corner bl"></div>
                <div class="scanner-corner br"></div>

                <!-- Animated NFC Wave -->
                <div v-if="isNfcScanning" class="nfc-wave-ring"></div>
                <div v-if="isNfcScanning" class="nfc-wave-ring delay"></div>

                <!-- Scanner Center Icon / Result -->
                <div class="scanner-center-content">
                  <div v-if="!isNfcScanning && !nfcScanSuccess" class="scanner-idle-state">
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01"></path>
                      <path d="M12 7v10M7 12h10"></path>
                    </svg>
                    <span>Hold Phone Near NFC Tag</span>
                  </div>

                  <div v-if="isNfcScanning" class="scanner-scanning-state">
                    <span class="scan-radar-ping"></span>
                    <span>Validating AES-256 Nonce...</span>
                  </div>

                  <div v-if="nfcScanSuccess" class="scanner-success-state">
                    <div class="success-checkmark-circle">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span class="success-text">CHECKPOINT VERIFIED!</span>
                    <span class="success-hash">UID: {{ simulatedNfcHash }}</span>
                  </div>
                </div>
              </div>

              <!-- Simulated Photo Preview when attached -->
              <div v-if="simulatedPhotoAttached" class="phone-photo-attached">
                <span class="photo-badge">📷 PHOTO ATTACHED &bull; EXIF TIMESTAMP LOCKED</span>
              </div>

              <!-- Interactive Phone Action Buttons -->
              <div class="phone-action-grid">
                <button 
                  class="phone-action-btn primary"
                  :disabled="isNfcScanning"
                  @click="performSimulatedNfcScan"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                    <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                    <line x1="12" y1="20" x2="12.01" y2="20"></line>
                  </svg>
                  <span>Simulate NFC Scan</span>
                </button>

                <button 
                  class="phone-action-btn"
                  @click="toggleSimulatedPhoto"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <span>{{ simulatedPhotoAttached ? 'Photo Attached' : 'Attach Photo' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Real-time Cryptographic Verification Ledger -->
        <div class="scanner-ledger-panel">
          <div class="ledger-header">
            <div>
              <h3 class="ledger-title">Cryptographic Anti-Spoof Ledger</h3>
              <p class="ledger-subtitle">Live Cloud Ingestion Pipeline &bull; AES-256 Nonce Verification</p>
            </div>
            <span class="ledger-badge">IMMUTABLE DEVICE LOGS</span>
          </div>

          <div class="ledger-table-wrap">
            <div class="ledger-row-header">
              <span>Timestamp</span>
              <span>Checkpoint</span>
              <span>Hardware UID</span>
              <span>GPS Accuracy</span>
              <span>Verdict</span>
            </div>
            <div 
              v-for="(scan, idx) in simulatedScanRecords" 
              :key="idx"
              class="ledger-row-item"
            >
              <span class="col-time">{{ scan.time }}</span>
              <span class="col-cp">{{ scan.checkpoint }}</span>
              <span class="col-uid font-mono">{{ scan.uid }}</span>
              <span class="col-gps text-emerald">&plusmn;{{ scan.accuracy }}m</span>
              <span class="col-verdict" :class="scan.verdictClass">{{ scan.verdict }}</span>
            </div>
          </div>

          <div class="ledger-footer-info">
            <div class="info-item">
              <span class="info-dot green"></span>
              <span>Hardware Tamper-Resistance: <strong>Active</strong></span>
            </div>
            <div class="info-item">
              <span class="info-dot cyan"></span>
              <span>Offline FIFO Local Queue: <strong>Synced (0 items pending)</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         7. INTERACTIVE DRAG-AND-DROP GEOFENCE LAB SANDBOX
    ═══════════════════════════════════════════════════════════ -->
    <section id="geofence-builder" class="section-container geofence-section">
      <div class="section-header">
        <div class="section-badge">PATENTED 4-TIER GPS GEOFENCING ENGINE</div>
        <h2 class="section-title">Drag & Shape Live Tactical Geofence Zones</h2>
        <p class="section-subtitle">
          Drag the 4 corner handles on the interactive satellite radar below to adjust the perimeter. 
          Observe real-time area calculation and automatic breach classification when the guard crosses the border.
        </p>
      </div>

      <div class="geofence-sandbox-card" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
        <div class="geofence-grid">
          <!-- Interactive Map Canvas with Draggable Handles -->
          <div class="geofence-map-container" ref="geofenceMapEl">
            <svg 
              class="geofence-svg-layer" 
              viewBox="0 0 600 400"
              @mousemove="onGeofenceMouseMove"
              @mouseup="onGeofenceMouseUp"
            >
              <defs>
                <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(56, 189, 248, 0.08)" stroke-width="1" />
                </pattern>
              </defs>
              <rect width="600" height="400" fill="url(#gridPattern)" />

              <!-- Geofence Polygon Area -->
              <polygon 
                :points="geofencePolygonPoints" 
                class="geofence-polygon"
                :class="{ 'violation-zone': isGuardOutsideGeofence }"
              />

              <!-- Geofence Boundary Lines -->
              <polygon 
                :points="geofencePolygonPoints" 
                class="geofence-polygon-border"
                :class="{ 'violation-border': isGuardOutsideGeofence }"
              />

              <!-- Simulated Guard Moving Beacon -->
              <g :transform="`translate(${guardGeofencePos.x}, ${guardGeofencePos.y})`">
                <circle r="16" class="guard-sonar-ring" :class="{ 'ring-alert': isGuardOutsideGeofence }" />
                <circle r="8" class="guard-beacon-center" :class="{ 'center-alert': isGuardOutsideGeofence }" />
                <text x="12" y="4" class="guard-beacon-label">Guard SEC-8041 (Alex)</text>
              </g>

              <!-- Draggable Anchor Handles (4 Corners) -->
              <g 
                v-for="(point, idx) in geofenceHandles" 
                :key="idx"
                class="geofence-handle"
                :transform="`translate(${point.x}, ${point.y})`"
                @mousedown="onGeofenceHandleMouseDown(idx, $event)"
              >
                <circle r="12" class="handle-outer" />
                <circle r="5" class="handle-inner" />
                <text x="14" y="4" class="handle-label">Node {{ ['A', 'B', 'C', 'D'][idx] }}</text>
              </g>
            </svg>

            <!-- Map HUD Status Floating Badge -->
            <div class="geofence-map-hud">
              <span class="hud-tag" :class="isGuardOutsideGeofence ? 'tag-alert' : 'tag-nominal'">
                {{ isGuardOutsideGeofence ? '🚨 GEOFENCE BREACH DETECTED (24m Out)' : '🛡️ GUARD WITHIN AUTHORIZED ZONE' }}
              </span>
            </div>
          </div>

          <!-- Geofence Live Telemetry & Area Metrics -->
          <div class="geofence-metrics-panel">
            <h3 class="geofence-title">Zone Geometry & GPS Evaluation</h3>
            <p class="geofence-desc">Real-time polygonal point-in-polygon (Ray-Casting Algorithm) telemetry:</p>

            <div class="geofence-stat-stack">
              <div class="geo-stat-card">
                <span class="geo-stat-lbl">Calculated Perimeter Area</span>
                <span class="geo-stat-val text-cyan">{{ computedGeofenceArea.toLocaleString() }} m&sup2;</span>
                <span class="geo-stat-sub">Approximately {{ (computedGeofenceArea / 4046.86).toFixed(2) }} Acres</span>
              </div>

              <div class="geo-stat-card">
                <span class="geo-stat-lbl">4-Tier GPS Precision Status</span>
                <span class="geo-stat-val text-emerald">VERDICT_VALID (&plusmn;0.72m)</span>
                <span class="geo-stat-sub">Kalman multipath jitter filter active</span>
              </div>

              <div class="geo-stat-card">
                <span class="geo-stat-lbl">Automated SOC Escalation</span>
                <span class="geo-stat-val" :class="isGuardOutsideGeofence ? 'text-amber' : 'text-purple'">
                  {{ isGuardOutsideGeofence ? 'Alarm Broadcast (SMS & Siren)' : 'Standby / Continuous Heartbeat' }}
                </span>
                <span class="geo-stat-sub">Grace Interval: 45 seconds allowed</span>
              </div>
            </div>

            <!-- Guard Position Simulation Controller -->
            <div class="guard-pos-slider-wrap">
              <div class="slider-header">
                <label>Simulate Guard Movement Position:</label>
                <span class="slider-val text-cyan">Coordinate Offset: {{ guardSliderOffset }}%</span>
              </div>
              <input 
                type="range" 
                v-model.number="guardSliderOffset" 
                min="0" 
                max="100" 
                class="calc-slider"
                @input="updateGuardSliderPosition"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         8. TACTICAL RADIO COMMS & WALKIE-TALKIE SOUNDBOARD
    ═══════════════════════════════════════════════════════════ -->
    <section id="radio-hub" class="section-container radio-section">
      <div class="section-header">
        <div class="section-badge">INTERACTIVE DISPATCH AUDIO HUB</div>
        <h2 class="section-title">Walkie-Talkie Radio Chatter & Soundboard</h2>
        <p class="section-subtitle">
          Test the audio synthesis engine built for AccessEasy Patrol SOC. 
          Click on any channel to audition tactical radio comms, siren alerts, and guard check-ins.
        </p>
      </div>

      <div class="radio-card" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
        <div class="radio-grid">
          <!-- Radio Frequency Display & Channel Deck -->
          <div class="radio-deck">
            <div class="radio-lcd-display">
              <div class="lcd-top">
                <span>VHF CH-04 &bull; 154.600 MHz</span>
                <span class="lcd-enc">AES-256 ENCRYPTED</span>
              </div>
              <div class="lcd-main">
                <span class="lcd-status">{{ currentRadioMessage }}</span>
              </div>
              <div class="lcd-bars">
                <span class="signal-bar active" v-for="i in 5" :key="i"></span>
                <span class="lcd-time">SOC AUDIO LINK ACTIVE</span>
              </div>
            </div>

            <!-- Soundboard Trigger Buttons -->
            <div class="soundboard-btn-grid">
              <button 
                v-for="sound in radioSoundboard" 
                :key="sound.id"
                class="radio-trigger-btn"
                @click="triggerRadioComms(sound)"
              >
                <span class="radio-btn-icon" v-html="sound.icon"></span>
                <div class="radio-btn-text">
                  <div class="radio-btn-name">{{ sound.name }}</div>
                  <div class="radio-btn-meta">{{ sound.meta }}</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Radio Broadcast Log Stream -->
          <div class="radio-logs-stream">
            <div class="stream-header">
              <span class="pulse-dot"></span>
              <span>LIVE AUDIO DISPATCH LOG (VOX DETECT)</span>
            </div>
            <div class="stream-body">
              <div 
                v-for="(item, idx) in radioCommsHistory" 
                :key="idx"
                class="comms-log-item"
              >
                <span class="comms-time">{{ item.time }}</span>
                <span class="comms-callsign">{{ item.callsign }}</span>
                <span class="comms-text">{{ item.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         9. INTERACTIVE PATROL TOURS & CHECKPOINT EXPLORER
    ═══════════════════════════════════════════════════════════ -->
    <section id="tours" class="section-container tours-section">
      <div class="section-header">
        <div class="section-badge">INTERACTIVE CHECKPOINT MATRIX</div>
        <h2 class="section-title">Explore Active Patrol Tours & Checkpoint Beacons</h2>
        <p class="section-subtitle">
          Click across simulated tour configurations to view live sequence checkpoints, 
          verification rules, and target completion intervals.
        </p>
      </div>

      <div class="tours-layout" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
        <!-- Tour Selection Left Column -->
        <div class="tours-nav-list">
          <div 
            v-for="t in patrolTours" 
            :key="t.id"
            class="tour-card-tab"
            :class="{ active: activeTourId === t.id }"
            @click="selectTour(t)"
          >
            <div class="tour-tab-header">
              <span class="tour-badge">{{ t.badge }}</span>
              <span class="tour-timing">{{ t.frequency }}</span>
            </div>
            <div class="tour-tab-title">{{ t.name }}</div>
            <div class="tour-tab-desc">{{ t.desc }}</div>
            <div class="tour-tab-footer">
              <span>{{ t.checkpoints.length }} Checkpoint Beacons</span>
              <span class="text-cyan">Target: {{ t.duration }}</span>
            </div>
          </div>
        </div>

        <!-- Tour Active Checkpoints Detail Right Column -->
        <div class="tours-detail-panel">
          <div class="panel-header">
            <div>
              <div class="panel-title">{{ currentTour.name }} &mdash; Checkpoint Sequence</div>
              <div class="panel-meta">Standard Operating Procedure: Strict Sequential Verification</div>
            </div>
            <div class="panel-badge-status">
              <span class="pulse-dot"></span>
              <span>PATROL ACTIVE</span>
            </div>
          </div>

          <!-- Checkpoint Step List -->
          <div class="checkpoints-timeline">
            <div 
              v-for="(cp, index) in currentTour.checkpoints" 
              :key="cp.id"
              class="cp-step"
              :class="{ 'cp-completed': cp.completed, 'cp-current': cp.isCurrent }"
            >
              <div class="cp-index-wrap">
                <span class="cp-index">{{ index + 1 }}</span>
                <span class="cp-connector" v-if="index < currentTour.checkpoints.length - 1"></span>
              </div>

              <div class="cp-body">
                <div class="cp-top">
                  <span class="cp-name">{{ cp.name }}</span>
                  <span class="cp-tag" :class="cp.tagClass">{{ cp.tag }}</span>
                </div>
                <div class="cp-info-row">
                  <span><strong>Hardware:</strong> {{ cp.hardware }}</span>
                  <span><strong>Geofence Radius:</strong> {{ cp.radius }}</span>
                  <span><strong>Target Grace Window:</strong> {{ cp.window }}</span>
                </div>
                <div class="cp-rule">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  <span>Verification Rule: {{ cp.rule }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         10. MOBILE GUARD APP & WEB SOC COMMAND DUO
    ═══════════════════════════════════════════════════════════ -->
    <section id="mobile-app" class="section-container mobile-section">
      <div class="section-header">
        <div class="section-badge">SEAMLESS CROSS-PLATFORM SYSTEM</div>
        <h2 class="section-title">Built for the Guard on Patrol. Mastered by the SOC.</h2>
        <p class="section-subtitle">
          A Flutter native mobile app engineered for one-handed operation in the dark, 
          paired with a high-throughput Web Command Center for supervisors.
        </p>
      </div>

      <div class="duo-grid">
        <!-- Left: Guard App Mockup & Features -->
        <div class="duo-card" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
          <div class="duo-header">
            <span class="duo-pill text-cyan">FLUTTER MOBILE GUARD APP</span>
            <h3 class="duo-title">Ultra-Fast 1-Handed Guard Operations</h3>
          </div>

          <div class="mockup-frame">
            <div class="mockup-header-bar">
              <span>9:41 AM</span>
              <span class="mock-signal">5G &bull; GPS Nominal</span>
              <span>98%</span>
            </div>
            <div class="mockup-screen">
              <div class="mock-top-status">
                <div class="mock-guard-info">
                  <div class="mock-avatar">AJ</div>
                  <div>
                    <div class="mock-name">Alex Johnson</div>
                    <div class="mock-site">Site: Nexus Tower &bull; Shift A</div>
                  </div>
                </div>
                <span class="mock-status-chip">ON PATROL</span>
              </div>

              <!-- Next Checkpoint Hero Card -->
              <div class="mock-next-card">
                <span class="mock-next-lbl">NEXT CHECKPOINT</span>
                <div class="mock-next-title">CP-04: Rooftop Helipad</div>
                <div class="mock-next-dist">Distance: 45m &bull; Scan window: 8 mins left</div>
                
                <div class="mock-scan-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"></path>
                  </svg>
                  <span>TAP TO SCAN NFC / QR</span>
                </div>
              </div>

              <!-- Quick Action Bar -->
              <div class="mock-action-row">
                <div class="mock-action-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  <span>Add Photo</span>
                </div>
                <div class="mock-action-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  <span>Log Incident</span>
                </div>
                <div class="mock-action-btn mock-sos-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <span>SOS PANIC</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Web SOC Command Center -->
        <div class="duo-card" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
          <div class="duo-header">
            <span class="duo-pill text-emerald">ENTERPRISE WEB COMMAND SOC</span>
            <h3 class="duo-title">Live Dispatch & Multi-Site Oversight</h3>
          </div>

          <div class="soc-web-mockup">
            <div class="soc-topbar">
              <div class="soc-title">AccessEasy Patrol &mdash; Command Center SOC</div>
              <div class="soc-stats-row">
                <span class="soc-stat">Active Guards: <strong>18/20</strong></span>
                <span class="soc-stat">Active Incidents: <strong class="text-emerald">0 Pending</strong></span>
                <span class="soc-stat">Adherence: <strong>99.4%</strong></span>
              </div>
            </div>

            <div class="soc-body-grid">
              <div class="soc-guard-list">
                <div class="soc-guard-row" v-for="g in sampleGuards" :key="g.id">
                  <div class="soc-guard-avatar">{{ g.initials }}</div>
                  <div class="soc-guard-details">
                    <div class="soc-guard-name">{{ g.name }}</div>
                    <div class="soc-guard-site">{{ g.site }} &bull; {{ g.zone }}</div>
                  </div>
                  <span class="soc-guard-pill" :class="g.statusClass">{{ g.status }}</span>
                </div>
              </div>

              <div class="soc-map-preview">
                <div class="soc-map-radar"></div>
                <div class="soc-map-marker marker-1">
                  <span class="marker-ping"></span>
                  <span class="marker-label">Guard #1 (Alex)</span>
                </div>
                <div class="soc-map-marker marker-2">
                  <span class="marker-ping"></span>
                  <span class="marker-label">Guard #2 (Sarah)</span>
                </div>
                <div class="soc-map-geofence"></div>
                <div class="soc-map-overlay">
                  <span>Nexus Campus &bull; Geofence Active (4 Sectors)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         11. GLOBAL MULTI-SITE ENTERPRISE FLEET SELECTOR
    ═══════════════════════════════════════════════════════════ -->
    <section id="global-fleet" class="section-container fleet-section">
      <div class="section-header">
        <div class="section-badge">ENTERPRISE MULTI-TENANT ARCHITECTURE</div>
        <h2 class="section-title">Manage Distributed Global Facilities Seamlessly</h2>
        <p class="section-subtitle">
          Switch between global enterprise sites to observe real-time SLA metrics, 
          guard tour compliance, and dynamic 3D scene re-alignment.
        </p>
      </div>

      <div class="fleet-grid">
        <div 
          v-for="site in enterpriseSites" 
          :key="site.id"
          class="fleet-site-card"
          :class="{ active: activeSiteId === site.id }"
          @click="selectEnterpriseSite(site)"
          @mousemove="handleCardTilt($event)"
          @mouseleave="resetCardTilt($event)"
        >
          <div class="site-header">
            <div>
              <span class="site-city">{{ site.city }}</span>
              <h3 class="site-name">{{ site.name }}</h3>
            </div>
            <span class="site-badge" :class="site.badgeClass">{{ site.badge }}</span>
          </div>

          <div class="site-metrics-row">
            <div class="site-metric">
              <span class="lbl">Active Guards</span>
              <span class="val text-cyan">{{ site.activeGuards }}</span>
            </div>
            <div class="site-metric">
              <span class="lbl">Checkpoints</span>
              <span class="val text-emerald">{{ site.checkpoints }}</span>
            </div>
            <div class="site-metric">
              <span class="lbl">Compliance</span>
              <span class="val text-purple">{{ site.compliance }}</span>
            </div>
          </div>

          <div class="site-footer">
            <span class="site-sla">Security Level: <strong>{{ site.securityTier }}</strong></span>
            <span class="site-action">Select Campus &rarr;</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         12. 6 CORE PILLARS OF ACCESSEASY PATROL (3D TILT CARDS)
    ═══════════════════════════════════════════════════════════ -->
    <section id="features" class="section-container features-section">
      <div class="section-header">
        <div class="section-badge">ENGINEERED FOR MODERN SECURITY OPERATIONS</div>
        <h2 class="section-title">Everything Needed to Run a High-Trust Guard Force</h2>
        <p class="section-subtitle">
          From multi-frequency checkpoint tags to offline database synchronization, 
          discover how AccessEasy Patrol transforms physical security into measurable intelligence.
        </p>
      </div>

      <div class="features-grid">
        <!-- Feature 1: NFC & QR Checkpoint Security -->
        <div class="feature-card" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
          <div class="feature-card-glow"></div>
          <div class="feature-card-content">
            <div class="feature-icon-wrap bg-blue-subtle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01"></path>
                <path d="M12 7v10M7 12h10"></path>
              </svg>
            </div>
            <h3 class="feature-title">Anti-Spoof NFC & QR Verification</h3>
            <p class="feature-desc">
              Prevent fake check-ins. Scans are cryptographically validated against hardware UID, 
              device GPS proximity, and high-entropy rolling timestamp nonces.
            </p>
            <ul class="feature-bullets">
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Supports NFC Type 2/4 tags & dynamic QR codes</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Bluetooth Low Energy (BLE) beacon fallback</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Mandatory photo evidence attachment capability</li>
            </ul>
          </div>
        </div>

        <!-- Feature 2: 4-Tier GPS & Geofence Intelligence -->
        <div class="feature-card" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
          <div class="feature-card-glow"></div>
          <div class="feature-card-content">
            <div class="feature-icon-wrap bg-emerald-subtle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
                <line x1="12" y1="2" x2="12" y2="5"></line>
                <line x1="12" y1="19" x2="12" y2="22"></line>
                <line x1="2" y1="12" x2="5" y2="12"></line>
                <line x1="19" y1="12" x2="22" y2="12"></line>
              </svg>
            </div>
            <h3 class="feature-title">4-Tier GPS & Smart Geofencing</h3>
            <p class="feature-desc">
              Proprietary evaluation algorithm filters out multipath indoor GPS jitter, 
              assigning 4 distinct verdict tiers: <em>Valid</em>, <em>Warning</em>, <em>Uncertain</em>, and <em>Violation</em>.
            </p>
            <ul class="feature-bullets">
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Sub-meter accuracy with Kalman filtering</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Polygon, circular & multi-floor indoor zones</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Automated stray-guard notifications & breadcrumbs</li>
            </ul>
          </div>
        </div>

        <!-- Feature 3: Instant 1-Tap SOS Panic & Voice Hub -->
        <div class="feature-card" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
          <div class="feature-card-glow"></div>
          <div class="feature-card-content">
            <div class="feature-icon-wrap bg-red-subtle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
                <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 class="feature-title">Instant SOS & Panic Escalation</h3>
            <p class="feature-desc">
              When guards face danger, a single tap triggers loud audio alarms on the SOC web dashboard, 
              transmits live GPS coordinates, and dispatches backup with turn-by-turn routing.
            </p>
            <ul class="feature-bullets">
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Web Audio API synthesized alarm sirens</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Automated SMS & WhatsApp escalation cascades</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Audio recording attachment & incident timeline</li>
            </ul>
          </div>
        </div>

        <!-- Feature 4: Offline-First FIFO Sync Queue -->
        <div class="feature-card" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
          <div class="feature-card-glow"></div>
          <div class="feature-card-content">
            <div class="feature-icon-wrap bg-purple-subtle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="2">
                <polyline points="16 16 12 12 8 16"></polyline>
                <line x1="12" y1="12" x2="12" y2="21"></line>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                <polyline points="16 16 12 12 8 16"></polyline>
              </svg>
            </div>
            <h3 class="feature-title">Offline-First SQLite Sync Queue</h3>
            <p class="feature-desc">
              Never lose a scan in basements, underground parking, or dead zones. Scans commit locally to 
              SQLite first and automatically drain with exponential backoff upon signal recovery.
            </p>
            <ul class="feature-bullets">
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Immutable client timestamps (`created_at_device`)</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Zero duplicate transactions with idempotent UUIDs</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Visual sync status pill on mobile status bar</li>
            </ul>
          </div>
        </div>

        <!-- Feature 5: AI Incident Classification & Evidence -->
        <div class="feature-card" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
          <div class="feature-card-glow"></div>
          <div class="feature-card-content">
            <div class="feature-icon-wrap bg-amber-subtle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 class="feature-title">Digital Proof of Presence & Logs</h3>
            <p class="feature-desc">
              Complete paperless operations. Guards capture high-resolution photos, log categorized hazards 
              (Theft, Maintenance, Intrusion, Fire), and collect digital client sign-offs.
            </p>
            <ul class="feature-bullets">
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Watermarked timestamps & EXIF GPS verification</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Audit-proof tamper-evident tour trail</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Integrated shift attendance & biometric check-ins</li>
            </ul>
          </div>
        </div>

        <!-- Feature 6: Multi-Site SOC & Executive PDF Reports -->
        <div class="feature-card" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
          <div class="feature-card-glow"></div>
          <div class="feature-card-content">
            <div class="feature-icon-wrap bg-cyan-subtle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h3 class="feature-title">Multi-Site Hub & Client Portals</h3>
            <p class="feature-desc">
              Manage hundreds of client facilities from one glassmorphic SOC command center. 
              Give property owners branded portals with automated morning summary PDFs.
            </p>
            <ul class="feature-bullets">
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> White-label portal with custom branding & logos</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Automated scheduled email dispatches</li>
              <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Granular role permissions (Admin, Manager, Guard)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         14. PRICING & ENTERPRISE PLANS (OFFICIAL FLAT ₹1,999/SITE/MO)
    ═══════════════════════════════════════════════════════════ -->
    <section id="pricing" class="section-container pricing-section">
      <div class="section-header">
        <div class="section-badge">PLANS &amp; PRICING</div>
        <h2 class="section-title">Simple, Transparent Pricing</h2>
        <p class="section-subtitle">
          Flat <strong>₹1,999 / site / month</strong>. Only pay for the physical sites you protect. 
          Guards, checkpoints, live GPS tracking, dispatch &amp; shift rosters are 100% Unlimited.
        </p>
      </div>

      <div class="pricing-unified-grid">
        <!-- Main Unified Operations Platform Card with Interactive Capacity Slider -->
        <div class="pricing-card pricing-card-primary" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
          <div class="pricing-popular-pill">
            <span class="pill-sparkle">⚡</span>
            <span>7-DAY FREE TRIAL (1 SITE) &bull; ZERO FEATURE GATING</span>
          </div>

          <div class="pricing-card-body">
            <div class="pricing-card-header">
              <div>
                <span class="tier-badge-label">UNIFIED OPERATIONS PLATFORM</span>
                <h3 class="tier-heading">AccessEasy Patrol Core</h3>
                <p class="tier-subtext">All platform features unlocked. Scale smoothly site-by-site.</p>
              </div>
              <div class="tier-price-block">
                <div class="tier-price">
                  <span class="price-currency">₹</span>
                  <span class="price-val">1,999</span>
                  <span class="price-period">/ site / mo</span>
                </div>
                <span class="price-tax-note">+ applicable GST &bull; Billed monthly</span>
              </div>
            </div>

            <!-- Feature Checklist (2 Columns) -->
            <div class="pricing-features-wrap">
              <div class="features-subheading">Everything Included with Zero Feature Gating:</div>
              <ul class="pricing-features-grid">
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> <strong>Unlimited Guards</strong> &bull; No per-guard licensing fee</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> <strong>Unlimited Checkpoints</strong> (NFC &amp; Dynamic QR)</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> <strong>Sub-Meter GPS Tracking</strong> &bull; Kalman Geofencing</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> <strong>1-Tap SOS Panic Dispatch</strong> &bull; Real-time sirens</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> <strong>Offline-First SQLite Sync</strong> (Works in basements)</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> <strong>Guard Mobile App</strong> (Native Android &amp; iOS)</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> <strong>Photo Evidence &amp; Watermarking</strong> &bull; Instant upload</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> <strong>Shift Scheduling &amp; Rostering</strong> &bull; Shift handovers</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> <strong>Web Command Center</strong> &bull; Executive PDF Reports</li>
                <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> <strong>Deployment under 24 hrs</strong> &bull; Priority email/chat support</li>
              </ul>
            </div>

            <!-- Primary Action CTA -->
            <div class="pricing-card-footer">
              <button class="btn btn-primary btn-lg w-full" @click="goToLogin">
                <span class="btn-shine"></span>
                <span>Start 7-Day Free Trial</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
              <p class="footer-trial-note">No credit card required &bull; 1 Site fully licensed during trial &bull; Cancel anytime</p>
            </div>
          </div>
        </div>

        <!-- Enterprise Custom Plan Card -->
        <div class="pricing-card pricing-card-enterprise" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
          <div class="pricing-card-header">
            <span class="tier-badge-label enterprise">CUSTOM FLEET</span>
            <h3 class="tier-heading">Enterprise</h3>
            <p class="tier-subtext">For large guarding agencies, multi-city corporations &amp; specialized SLAs.</p>
          </div>

          <div class="tier-price-block mt-4 mb-6">
            <div class="tier-price">
              <span class="price-val">Custom</span>
              <span class="price-period">Bespoke Rollout</span>
            </div>
            <span class="price-tax-note">Tailored volume tiers &amp; dedicated support</span>
          </div>

          <ul class="pricing-features">
            <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Everything in Platform across unlimited sites</li>
            <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Dedicated Account Manager &amp; Solution Architect</li>
            <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Custom REST API &amp; Webhook Integrations</li>
            <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Face AI Guard Biometric Verification</li>
            <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> White-Label Property Owner Client Portals</li>
            <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> 99.99% SLA-backed uptime guarantee</li>
            <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> On-Site Training &amp; 24/7 Phone Support</li>
          </ul>

          <div class="mt-auto pt-6">
            <button class="btn btn-secondary w-full" @click="goToLogin">Contact Sales</button>
          </div>
        </div>
      </div>

      <!-- Assurances Row -->
      <div class="pricing-assurances-grid">
        <div class="pricing-assurance-item">
          <div class="assurance-icon-wrap">🛡️</div>
          <div class="assurance-text">
            <strong>No credit card required</strong>
            <span>Instant sign up with zero billing risk</span>
          </div>
        </div>
        <div class="pricing-assurance-item">
          <div class="assurance-icon-wrap">⏱️</div>
          <div class="assurance-text">
            <strong>7-day free trial</strong>
            <span>Full feature access on 1 licensed site</span>
          </div>
        </div>
        <div class="pricing-assurance-item">
          <div class="assurance-icon-wrap">🔒</div>
          <div class="assurance-text">
            <strong>256-bit encryption</strong>
            <span>Bank-grade security &amp; data privacy</span>
          </div>
        </div>
        <div class="pricing-assurance-item">
          <div class="assurance-icon-wrap">✅</div>
          <div class="assurance-text">
            <strong>Cancel anytime</strong>
            <span>No lock-in contracts or hidden fees</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         15. INTERACTIVE FAQ ACCORDION (SEARCH-OPTIMIZED & AEO)
    ═══════════════════════════════════════════════════════════ -->
    <section id="faq" class="section-container faq-section">
      <div class="section-header">
        <div class="section-badge">FREQUENTLY ASKED QUESTIONS</div>
        <h2 class="section-title">Frequently Asked Questions</h2>
        <p class="section-subtitle">
          Everything you need to know about hardware compatibility, offline synchronization, GPS accuracy, and deployments.
        </p>
      </div>

      <div class="faq-list">
        <div 
          v-for="(faq, idx) in faqItems" 
          :key="idx"
          class="faq-card"
          :class="{ open: faq.open }"
          @click="faq.open = !faq.open"
          @mousemove="handleCardTilt($event)"
          @mouseleave="resetCardTilt($event)"
        >
          <div class="faq-question-row">
            <span class="faq-question">{{ faq.q }}</span>
            <span class="faq-toggle-icon">{{ faq.open ? '&minus;' : '+' }}</span>
          </div>
          <div v-if="faq.open" class="faq-answer">
            <p>{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         16. FINAL CONVERSION BANNER (MATCHING ORIGINAL HERO CTA)
    ═══════════════════════════════════════════════════════════ -->
    <section class="section-container cta-section">
      <div class="cta-banner" @mousemove="handleCardTilt($event)" @mouseleave="resetCardTilt($event)">
        <div class="cta-glow"></div>
        <div class="cta-content">
          <div class="cta-top-badge">
            <span class="badge-beacon"></span>
            <span>Deployment in under 24 hours</span>
          </div>
          <h2 class="cta-title">Ready to Modernize Your<br /><span class="text-cyan">Patrol Operations?</span></h2>
          <p class="cta-subtitle">
            Join 500+ security teams already using AccessEasy Patrol. Start your free trial today — no credit card required.
          </p>
          <div class="cta-btn-row">
            <button class="btn btn-primary btn-lg" @click="goToLogin">
              <span class="btn-shine"></span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>Start Free Trial</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <button class="btn btn-ghost btn-lg" @click="goToLogin">Schedule a Demo</button>
          </div>
          <div class="cta-social-proof-bar">
            <span>⭐⭐⭐⭐⭐ Trusted by <strong>500+</strong> Security Teams Worldwide</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         17. FOOTER
    ═══════════════════════════════════════════════════════════ -->
    <footer class="footer">
      <div class="section-container footer-inner">
        <div class="footer-col-brand">
          <div class="brand-link">
            <img :src="logoPatrol" class="brand-logo-img" alt="AccessEasy Patrol" />
            <span class="brand-title">AccessEasy <span class="brand-highlight">PATROL</span></span>
          </div>
          <p class="footer-desc">
            Smart Guard Tour, Real-Time GPS Tracking, NFC/QR Anti-Spoof Verification, and Security Operations Center.
          </p>
          <div class="footer-copyright">
            &copy; 2026 AccessEasy Patrol. All rights reserved.
          </div>
        </div>

        <div class="footer-col">
          <h4 class="footer-heading">Platform</h4>
          <a href="#features" @click.prevent="scrollTo('features')">NFC Checkpoints</a>
          <a href="#geofence-builder" @click.prevent="scrollTo('geofence-builder')">4-Tier GPS Engine</a>
          <a href="#scanner-sim" @click.prevent="scrollTo('scanner-sim')">NFC Phone Simulator</a>
          <a href="#radio-hub" @click.prevent="scrollTo('radio-hub')">Radio Comms Deck</a>
        </div>

        <div class="footer-col">
          <h4 class="footer-heading">Resources</h4>
          <a href="#pricing" @click.prevent="scrollTo('pricing')">Plans &amp; Pricing</a>
          <a href="#global-fleet" @click.prevent="scrollTo('global-fleet')">Global Fleet Hub</a>
          <a href="/login" @click.prevent="goToLogin">REST API Documentation</a>
          <a href="/login" @click.prevent="goToLogin">MQTT Protocol V1.0.6</a>
        </div>

        <div class="footer-col">
          <h4 class="footer-heading">Security & Trust</h4>
          <a href="#">SOC 2 Type II Certified</a>
          <a href="#">AES-256 Cloud Encryption</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from 'three';
import logoPatrol from '@/assets/images/logoPatrol.png';

const router = useRouter();

// DOM Refs
const rootEl = ref(null);
const canvasEl = ref(null);
const geofenceMapEl = ref(null);
const terminalBodyEl = ref(null);

// State & UI
const isScrolled = ref(false);

// ── 3D Command Dock UI ─────────────────────────────────────────
const isDockMinimized = ref(false);
const isGuideBubbleVisible = ref(false);
const isGuideMenuOpen = ref(false);
const isGuideMuted = ref(true);
const currentTourStopIndex = ref(0);

const guardScreenY = ref(typeof window !== 'undefined' ? window.innerHeight * 0.45 : 350);
const guardTargetScreenY = ref(typeof window !== 'undefined' ? window.innerHeight * 0.45 : 350);
const guardIsRunning = ref(false);
const guardMissedAlert = ref(false);
const guardBubbleVisible = ref(false);
const guardBubbleMsg = ref('You skipped Sector Checkpoint #03 without verifying the cryptographic NFC tag!');
const guardAlertTitle = ref('🚨 PATROL CHECKPOINT MISSED!');
const scrollVelocity = ref(0);
let missedScrollPosition = 0;

// Guided Patrol Checkpoint Stops on the Landing Page
const tourStops = ref([
  {
    id: 'hero',
    name: '3D Tactical Command',
    badge: 'START',
    title: '👋 Welcome to AccessEasy Patrol!',
    desc: 'Explore our 3D real-time security operations platform and live guard tour technology!'
  },
  {
    id: 'simulator',
    name: 'SOS Threat Sandbox',
    badge: 'LIVE DEMO',
    title: '🚨 Interactive SOS Panic Simulator',
    desc: 'Try clicking the SOS button in this console below to see sub-3.2s automated supervisor dispatch in action!'
  },
  {
    id: 'scanner-sim',
    name: 'NFC Mobile App Lab',
    badge: 'INTERACTIVE',
    title: '📱 Anti-Spoof Guard Phone Lab',
    desc: 'Click "Simulate Tag Scan" on the phone! We generate AES-256 rolling cryptographic signatures to prevent fake guard check-ins.'
  },
  {
    id: 'geofence-builder',
    name: 'GPS Geofencing Lab',
    badge: 'MAP DEMO',
    title: '🗺️ 4-Tier Sub-Meter Geofencing',
    desc: 'Try switching perimeter zones! If an officer strays outside their authorized boundary, we alert supervisors in < 3 seconds.'
  },
  {
    id: 'radio-hub',
    name: 'Radio Comms Hub',
    badge: 'AUDIO',
    title: '📻 Live Tactical Radio Comms',
    desc: 'Click any frequency button below to listen to live simulated tactical dispatcher audio and guard chatter.'
  },
  {
    id: 'tours',
    name: '3D Checkpoint Matrix',
    badge: '3D TOURS',
    title: '📍 Automated Checkpoint Sequencing',
    desc: 'Select any patrol route card to inspect checkpoint milestones, expected pacing, and audit-proof timestamps.'
  },
  {
    id: 'global-fleet',
    name: 'Global Multi-Site Hub',
    badge: 'ENTERPRISE',
    title: '🌐 Multi-Tenant Fleet Telemetry',
    desc: 'Switch between Singapore, London, Tokyo, and New York sites to see consolidated cross-border guard operations.'
  },
  {
    id: 'features',
    name: 'Zero-Trust Matrix',
    badge: 'CORE',
    title: '🛡️ Engineered for High-Security Operations',
    desc: 'Explore offline-first sync, facial biometrics verification, and automated incident SLA escalations.'
  },
  {
    id: 'pricing',
    name: 'Flat ₹1,999 / Site',
    badge: 'PLANS',
    title: '🚀 Simple, Transparent Pricing',
    desc: 'Start your 7-day free trial on 1 site with zero credit card required!'
  }
]);

const currentTourStop = computed(() => {
  return tourStops.value[currentTourStopIndex.value] || tourStops.value[0];
});

const MISSED_PATROL_SCENARIOS = [
  {
    title: '🚨 MISSED CHECKPOINT CP-03 (Server Vault)',
    msg: 'You scrolled past the Server Vault perimeter! Anti-tamper audit flagged an unverified patrol interval.',
  },
  {
    title: '⚠ PATROL SPEED LIMIT EXCEEDED (>1.8 m/s)',
    msg: 'Guard movement speed breached maximum patrol threshold. Guard tour compliance decreased.',
  },
  {
    title: '🛑 MISSED GEOFENCE SECTOR B CORRIDOR',
    msg: 'Guard left Authorized Patrol Zone without logging NFC badge at Checkpoint Gate 02.',
  },
  {
    title: '🚨 SKIPPED INCIDENT SWEEP ROUTE',
    msg: 'Skipped active sweep protocol. Supervisor SOC alert was automatically queued.',
  }
];

let lastScrollY = 0;
let lastScrollTime = Date.now();
let lastAlertTriggerTime = 0;
let alertCooldownUntil = 0;
let guardAnimFrame = null;
let missedAlertTimeout = null;
const alertSnapshotVelocity = ref(1850);

const guardStatusLabel = computed(() => {
  if (guardMissedAlert.value) return 'MISSED PATROL';
  if (guardIsRunning.value) return 'RUNNING FAST';
  return 'PATROL GUIDE';
});

const toggleGuideBubble = () => {
  isGuideBubbleVisible.value = !isGuideBubbleVisible.value;
  playSfx('blip');
};

const toggleGuideMenu = () => {
  isGuideMenuOpen.value = !isGuideMenuOpen.value;
  isGuideBubbleVisible.value = true;
  playSfx('blip');
};

const toggleGuideMute = () => {
  isGuideMuted.value = !isGuideMuted.value;
  playSfx('blip');
};

const jumpToStop = (index) => {
  if (index >= 0 && index < tourStops.value.length) {
    currentTourStopIndex.value = index;
    isGuideBubbleVisible.value = true;
    isGuideMenuOpen.value = false;
    playSfx('blip');
    const targetId = tourStops.value[index].id;
    scrollTo(targetId);
  }
};

const goToNextStop = () => {
  if (currentTourStopIndex.value < tourStops.value.length - 1) {
    jumpToStop(currentTourStopIndex.value + 1);
  } else {
    goToLogin();
  }
};

const goToPrevStop = () => {
  if (currentTourStopIndex.value > 0) {
    jumpToStop(currentTourStopIndex.value - 1);
  }
};

const animateGuard = () => {
  // Spring lag in viewport coordinates (smooth tracking)
  const diff = guardTargetScreenY.value - guardScreenY.value;
  guardScreenY.value += diff * 0.1;
  guardAnimFrame = requestAnimationFrame(animateGuard);
};

const showMissedAlert = (triggerSpeed = 1850) => {
  const now = Date.now();
  // Enforce minimum 20s cooldown between alerts
  if (now < alertCooldownUntil || (now - lastAlertTriggerTime) < 20000) {
    return;
  }
  lastAlertTriggerTime = now;
  alertSnapshotVelocity.value = Math.round(triggerSpeed);

  if (missedAlertTimeout) clearTimeout(missedAlertTimeout);
  const scenario = MISSED_PATROL_SCENARIOS[Math.floor(Math.random() * MISSED_PATROL_SCENARIOS.length)];
  guardAlertTitle.value = scenario.title;
  guardBubbleMsg.value = scenario.msg;
  guardMissedAlert.value = true;
  guardBubbleVisible.value = true;
  playSfx('alert');

  missedAlertTimeout = setTimeout(() => {
    guardMissedAlert.value = false;
    guardBubbleVisible.value = false;
  }, 4500);
};

const dismissAlert = () => {
  guardBubbleVisible.value = false;
  guardMissedAlert.value = false;
  // Give 45 seconds of peace when user explicitly dismisses
  alertCooldownUntil = Date.now() + 45000;
};

const returnToPatrolPoint = () => {
  guardBubbleVisible.value = false;
  guardMissedAlert.value = false;
  alertCooldownUntil = Date.now() + 30000;
  playSfx('blip');
  window.scrollTo({
    top: Math.max(0, missedScrollPosition),
    behavior: 'smooth'
  });
};

const onTourDropdownChange = (e) => {
  const t = patrolTours.value.find(item => item.id === activeTourId.value);
  if (t) selectTour(t);
};
const mobileMenuOpen = ref(false);
const isAudioMuted = ref(false);
const showParticleField = ref(true);
const fpsCounter = ref(60);
const isCursorHovering = ref(false);
const isClicking = ref(false);

// Cursor Tracking Coordinates
const cursorPos = reactive({ x: -100, y: -100 });
const smoothCursor = reactive({ x: -100, y: -100 });
const mouseNorm = reactive({ x: 0, y: 0 }); // -1 to 1 for 3D

// Three.js Scene Variables
let scene, camera, renderer, animationFrameId;
let centralCoreGroup, particleSystem, particlePositions, particleOriginals, particleVelocities;
let routeLine, guardOrb, radarWaveRing, checkpointMeshes = [];
let raycaster, mouseVector3D;
let clock = new THREE.Clock();

// Spatial 3D Checkpoint Tooltip
const hoveredCheckpoint = ref(null);
const hoveredCheckpointScreenPos = reactive({ x: 0, y: 0 });

// 1. 3D VISION MODES
const visionModes = [
  { id: 'cyber', name: 'Cyber Core', desc: 'Standard Neon Blue Holographic Matrix', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 12 8"></polygon></svg>' },
  { id: 'thermal', name: 'FLIR Thermal', desc: 'Infrared Heat Signature Spectrum', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>' },
  { id: 'night', name: 'Night Recon', desc: 'Phosphor Green Tactical NVG', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>' },
  { id: 'xray', name: 'X-Ray Grid', desc: 'Structural Isometric Wireframe', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>' },
];
const currentVisionMode = ref('cyber');

const setVisionMode = (modeId) => {
  currentVisionMode.value = modeId;
  playSfx('blip');
  applyVisionModeTo3D(modeId);
};

// 2. 3D CAMERA POV MODES
const camModes = [
  { id: 'orbit', name: 'Drone Orbit', desc: 'Cinematic Flying Drone Cam', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M3 12h3M18 12h3M12 3v3M12 18v3"></path></svg>' },
  { id: 'guard', name: 'Guard Bodycam', desc: 'First-Person Patrol Chase', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' },
  { id: 'satellite', name: 'Satellite Top', desc: 'High-Altitude 90° Radar', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>' },
  { id: 'iso', name: 'Isometric', desc: '45° Strategic Parallax', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>' },
];
const currentCamMode = ref('iso');

const setCamMode = (camId) => {
  currentCamMode.value = camId;
  playSfx('blip');
};

// 3. INTERACTIVE SOS & INCIDENT DISPATCH SIMULATOR
const activeSimScenario = ref('sos');
const isDispatching = ref(false);
const simIncidentActive = ref(true);
const simIncidentId = ref('4921');
const simIncidentMessage = ref('CRITICAL SOS ALERT: Alex Johnson triggered emergency panic from mobile app.');
const simEtaCountdown = ref(38);
const simClock = ref('11:42:24');

const simTerminalLogs = ref([
  { time: '11:40:01', tag: 'SYSTEM', text: 'Secure encrypted MQTT broker initialized on channel (TLS v1.3)', type: 'info' },
  { time: '11:40:08', tag: 'GEOFENCE', text: 'Evaluating GPS stream for SEC-8041: Accuracy 0.72m within polygon sector 4', type: 'success' },
  { time: '11:41:20', tag: 'INCIDENT', text: 'ALERT: SOS Panic button activated by Guard Alex Johnson at CP-03', type: 'alert' },
  { time: '11:41:22', tag: 'DISPATCH', text: 'Auto-allocating nearest backup guard: Marcus Vance (Unit 02) assigned', type: 'dispatch' },
]);

const triggerSimulation = (scenario) => {
  activeSimScenario.value = scenario;
  simIncidentActive.value = true;
  playSfx('alert');
  
  const now = new Date().toTimeString().split(' ')[0];
  if (scenario === 'sos') {
    simIncidentId.value = '4921';
    simIncidentMessage.value = 'CRITICAL SOS ALERT: Alex Johnson triggered emergency panic from mobile app.';
    simTerminalLogs.value.push({
      time: now,
      tag: 'SOS PANIC',
      text: 'Mobile SOS packet verified: GPS ±0.6m at CP-03. Audio siren triggered.',
      type: 'alert'
    });
  } else if (scenario === 'breach') {
    simIncidentId.value = '4922';
    simIncidentMessage.value = 'GEOFENCE BREACH: Guard strayed 24m outside authorized Sector B perimeter.';
    simTerminalLogs.value.push({
      time: now,
      tag: 'GEOFENCE',
      text: 'VERDICT_VIOLATION: Device GPS 37.7749,-122.4194 outside bounding geofence polygon.',
      type: 'alert'
    });
  } else if (scenario === 'missed') {
    simIncidentId.value = '4923';
    simIncidentMessage.value = 'MISSED CHECKPOINT: CP-04 (Rooftop Deck) overdue by 12 minutes.';
    simTerminalLogs.value.push({
      time: now,
      tag: 'PATROL TIMEOUT',
      text: 'Tour sequence timer expired for Checkpoint #04. Supervisor notification dispatched.',
      type: 'alert'
    });
  }

  nextTick(() => {
    if (terminalBodyEl.value) {
      terminalBodyEl.value.scrollTop = terminalBodyEl.value.scrollHeight;
    }
  });
};

const executeAutoDispatch = () => {
  isDispatching.value = true;
  playSfx('blip');
  setTimeout(() => {
    isDispatching.value = false;
    const now = new Date().toTimeString().split(' ')[0];
    simTerminalLogs.value.push({
      time: now,
      tag: 'DISPATCHED',
      text: 'Backup Unit SEC-8043 acknowledged dispatch. ETA 42 seconds.',
      type: 'success'
    });
    nextTick(() => {
      if (terminalBodyEl.value) {
        terminalBodyEl.value.scrollTop = terminalBodyEl.value.scrollHeight;
      }
    });
  }, 1200);
};

// 4. INTERACTIVE NFC SCANNER SIMULATOR
const isNfcScanning = ref(false);
const nfcScanSuccess = ref(false);
const simulatedPhotoAttached = ref(false);
const simulatedNfcHash = ref('0x84F2-E9A1-99B4');

const simulatedScanRecords = ref([
  { time: '11:42:08', checkpoint: 'CP-03 (Server Vault)', uid: 'NTAG-216:04:8F:2A', accuracy: '0.6', verdict: 'VALID', verdictClass: 'tag-green' },
  { time: '11:38:15', checkpoint: 'CP-02 (East Perimeter)', uid: 'BLE:BEAC-8841-02', accuracy: '0.9', verdict: 'VALID', verdictClass: 'tag-green' },
  { time: '11:32:00', checkpoint: 'CP-01 (Main Gate)', uid: 'NTAG-216:04:12:E9', accuracy: '0.5', verdict: 'VALID', verdictClass: 'tag-green' },
]);

const performSimulatedNfcScan = () => {
  isNfcScanning.value = true;
  nfcScanSuccess.value = false;
  playSfx('blip');

  setTimeout(() => {
    isNfcScanning.value = false;
    nfcScanSuccess.value = true;
    playSfx('success');
    simulatedNfcHash.value = '0x' + Math.random().toString(16).substr(2, 8).toUpperCase() + '-AES256';

    const now = new Date().toTimeString().split(' ')[0];
    simulatedScanRecords.value.unshift({
      time: now,
      checkpoint: 'CP-04 (Helipad Deck)',
      uid: 'NTAG-216:' + Math.random().toString(16).substr(2, 6).toUpperCase(),
      accuracy: '0.7',
      verdict: 'VALID',
      verdictClass: 'tag-green'
    });
  }, 1200);
};

const toggleSimulatedPhoto = () => {
  simulatedPhotoAttached.value = !simulatedPhotoAttached.value;
  playSfx('blip');
};

// 5. INTERACTIVE GEOFENCE BUILDER LAB
const geofenceHandles = ref([
  { x: 120, y: 80 },
  { x: 480, y: 70 },
  { x: 510, y: 320 },
  { x: 90, y: 310 }
]);
const activeDraggingHandleIndex = ref(null);
const guardSliderOffset = ref(35);

const geofencePolygonPoints = computed(() => {
  return geofenceHandles.value.map(h => `${h.x},${h.y}`).join(' ');
});

const guardGeofencePos = computed(() => {
  const pct = guardSliderOffset.value / 100;
  return {
    x: 100 + pct * 420,
    y: 120 + Math.sin(pct * Math.PI * 2) * 140
  };
});

const isGuardOutsideGeofence = computed(() => {
  const pt = guardGeofencePos.value;
  const poly = geofenceHandles.value;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect = ((yi > pt.y) !== (yj > pt.y)) && (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return !inside;
});

const computedGeofenceArea = computed(() => {
  const p = geofenceHandles.value;
  let area = 0;
  for (let i = 0; i < p.length; i++) {
    const j = (i + 1) % p.length;
    area += p[i].x * p[j].y;
    area -= p[j].x * p[i].y;
  }
  return Math.round(Math.abs(area / 2) * 24);
});

const onGeofenceHandleMouseDown = (idx, e) => {
  e.preventDefault();
  activeDraggingHandleIndex.value = idx;
};

const onGeofenceMouseMove = (e) => {
  if (activeDraggingHandleIndex.value === null || !geofenceMapEl.value) return;
  const rect = geofenceMapEl.value.getBoundingClientRect();
  const svgWidth = 600;
  const svgHeight = 400;
  
  const scaleX = svgWidth / rect.width;
  const scaleY = svgHeight / rect.height;

  const newX = Math.max(30, Math.min(570, (e.clientX - rect.left) * scaleX));
  const newY = Math.max(30, Math.min(370, (e.clientY - rect.top) * scaleY));

  geofenceHandles.value[activeDraggingHandleIndex.value].x = newX;
  geofenceHandles.value[activeDraggingHandleIndex.value].y = newY;
};

const onGeofenceMouseUp = () => {
  activeDraggingHandleIndex.value = null;
};

const updateGuardSliderPosition = () => {
  if (isGuardOutsideGeofence.value) {
    playSfx('alert');
  }
};

// 6. TACTICAL RADIO SOUNDBOARD & COMMS
const currentRadioMessage = ref('STANDBY: SQUELCH OPEN &bull; CHANNEL CLEAR');
const radioCommsHistory = ref([
  { time: '11:40:12', callsign: 'ALPHA-1', message: 'Checkpoint 3 secured. Perimeter clear.' },
  { time: '11:36:45', callsign: 'DISPATCH', message: 'Roger Alpha-1. Proceed to Helipad Sector.' },
  { time: '11:30:00', callsign: 'SYSTEM', message: 'Shift Tour #02 synchronized.' },
]);

const radioSoundboard = ref([
  { id: 'chatter1', name: 'Guard Check-In', meta: 'Alpha-1 to SOC Voice Ack', icon: '🎙️', text: 'Alpha-1 to SOC: Checkpoint 3 secured. Perimeter clear.' },
  { id: 'chatter2', name: 'Emergency Backup', meta: 'SOC Auto-Reroute Dispatch', icon: '🚨', text: 'Dispatch to Unit 2: Respond to Sector B immediately.' },
  { id: 'chatter3', name: 'Breach Alarm Siren', meta: 'Perimeter Siren Burst', icon: '🔊', text: 'ALERT: Sector 4 perimeter geofence deviation.' },
  { id: 'chatter4', name: 'Shift Rollcall', meta: 'All Units Acknowledge', icon: '📻', text: 'Rollcall complete. All 18 guards active.' },
]);

const triggerRadioComms = (sound) => {
  currentRadioMessage.value = `TX [${sound.name.toUpperCase()}]: ${sound.text}`;
  playSfx(sound.id === 'chatter3' ? 'alert' : 'radio');

  const now = new Date().toTimeString().split(' ')[0];
  radioCommsHistory.value.unshift({
    time: now,
    callsign: 'SOC-DISPATCH',
    message: sound.text
  });
};

// 7. GLOBAL MULTI-SITE ENTERPRISE SELECTOR
const enterpriseSites = ref([
  { id: 'ny_hq', name: 'Nexus Metro HQ', city: 'New York, USA', activeGuards: '18 / 20', checkpoints: 32, compliance: '99.8%', securityTier: 'Level 4 Enterprise', badge: 'ACTIVE SOC', badgeClass: 'tag-green' },
  { id: 'london_vault', name: 'Canary Financial Vault', city: 'London, UK', activeGuards: '12 / 12', checkpoints: 24, compliance: '100%', securityTier: 'Level 5 Maximum', badge: 'SECURED', badgeClass: 'tag-blue' },
  { id: 'frankfurt_dc', name: 'Rhine Cloud Data Center', city: 'Frankfurt, GER', activeGuards: '8 / 8', checkpoints: 18, compliance: '99.4%', securityTier: 'Tier IV Data Hub', badge: 'NOMINAL', badgeClass: 'tag-cyan' },
  { id: 'tokyo_hub', name: 'Shibuya Autonomous Hub', city: 'Tokyo, JPN', activeGuards: '15 / 16', checkpoints: 28, compliance: '99.6%', securityTier: 'AI Robotics Grid', badge: 'ACTIVE', badgeClass: 'tag-purple' },
]);
const activeSiteId = ref('ny_hq');

const selectEnterpriseSite = (site) => {
  activeSiteId.value = site.id;
  playSfx('blip');
};

// 9. FAQ ACCORDION (AEO & SEARCH ENGINE OPTIMIZED)
const faqItems = ref([
  { 
    q: 'How does AccessEasy Patrol verify checkpoints without an internet connection?', 
    a: 'AccessEasy Patrol uses an offline-first local event queue on the mobile device. When a guard scans an NFC tag or QR code in a cellular dead zone or basement, the scan is saved locally in an SQLite database with an immutable hardware timestamp. When connectivity is restored, all queued events sync automatically to the cloud in chronological order — ensuring zero data loss.', 
    open: true 
  },
  { 
    q: 'What is the 4-Tier GPS Geofence accuracy system?', 
    a: 'The 4-tier GPS accuracy evaluator classifies every checkpoint scan into one of four verdicts based on physical distance and satellite accuracy: Valid (inside geofence, high GPS accuracy), Warning (boundary fringe), Uncertain (excessive satellite drift, location unconfirmed), or Violation (outside geofence boundary). This prevents false alarms from GPS drift and completely blocks location spoofing apps.', 
    open: false 
  },
  { 
    q: 'Can AccessEasy Patrol replace legacy electronic guard tour wand systems?', 
    a: 'Yes! Unlike legacy electronic wand systems that require manual USB docking at shift end and offer no real-time visibility, AccessEasy Patrol delivers live cloud visibility, instant incident alerts, photo and voice evidence capture, and automated compliance reports from standard Android or iOS smartphones — no proprietary hardware required.', 
    open: false 
  },
  { 
    q: 'Does AccessEasy Patrol work in basements and dead zones without cellular coverage?', 
    a: 'Yes. The mobile app is engineered fully offline-first. All checkpoint scans, incident reports, and attendance events are stored locally in an encrypted SQLite database. A background sync worker automatically uploads all pending events with zero data loss the moment any network connection is detected.', 
    open: false 
  },
  { 
    q: 'What types of checkpoints does AccessEasy Patrol support?', 
    a: 'AccessEasy Patrol supports three checkpoint verification modes: NFC tag scanning (passive tap, no internet required), Dynamic QR code scanning (camera-based, works offline), and GPS proximity checkpoints (geofence-verified without a physical tag). Each checkpoint has a configurable geofence radius and accuracy threshold.', 
    open: false 
  },
  { 
    q: 'What evidence can guards capture during an incident report?', 
    a: 'Guards can attach high-resolution geotagged photos, audio voice notes, and categorical incident tags to each report. Every report automatically captures the exact GPS coordinates, immutable hardware timestamp, guard identity, site name, and severity tier, instantly triggering automated supervisor notifications.', 
    open: false 
  },
]);

// Active Guard Micro-Logs
const activeGuardLogs = ref([
  { time: '11:14:02', icon: '📍', text: 'Scanned CP-03 (Server Vault)', tag: 'NFC VERIFIED', tagClass: 'tag-green' },
  { time: '11:10:45', icon: '📷', text: 'Photo attached to Door #4 check', tag: 'EVIDENCE', tagClass: 'tag-blue' },
  { time: '11:06:18', icon: '🚶', text: 'Passed Sector B corridor', tag: 'GPS NOMINAL', tagClass: 'tag-cyan' },
  { time: '11:00:00', icon: '⚡', text: 'Started Night Shift Tour #02', tag: 'INITIALIZED', tagClass: 'tag-purple' },
]);

// Patrol Tours Data
const patrolTours = ref([
  {
    id: 'night_perimeter',
    name: 'Night Perimeter Sweep',
    badge: 'HIGH PRIORITY',
    frequency: 'Every 30 Mins',
    duration: '22 Mins',
    desc: 'Full outdoor perimeter fence inspection with infrared and gate latch verification.',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
    checkpoints: [
      { id: 'cp1', name: 'Tower A: Main Gate Entrance', hardware: 'NFC Type 4 UID', radius: '8 meters', window: '00:05:00', rule: 'Must scan within 5m GPS radius', completed: true, tag: 'VERIFIED', tagClass: 'tag-green' },
      { id: 'cp2', name: 'Tower B: East Perimeter Sector', hardware: 'BLE Beacon #04', radius: '12 meters', window: '00:10:00', rule: 'Continuous beacon handshake required', completed: true, tag: 'VERIFIED', tagClass: 'tag-green' },
      { id: 'cp3', name: 'Tower C: Server Vault Rear Door', hardware: 'NFC + Dynamic QR', radius: '4 meters', window: '00:15:00', rule: 'Mandatory photo of biometric lock LED', isCurrent: true, tag: 'CURRENT TARGET', tagClass: 'tag-cyan' },
      { id: 'cp4', name: 'Tower D: Rooftop Helipad Deck', hardware: 'NFC Hardware Tag', radius: '6 meters', window: '00:22:00', rule: 'Confirm emergency stairwell latch is locked', completed: false, tag: 'PENDING', tagClass: 'tag-gray' },
    ]
  },
  {
    id: 'datacenter_vault',
    name: 'Data Center High-Security Sweep',
    badge: 'CRITICAL',
    frequency: 'Hourly',
    duration: '15 Mins',
    desc: 'Critical infrastructure patrol covering HVAC generators, battery racks, and rack locks.',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>',
    checkpoints: [
      { id: 'dc1', name: 'UPS Battery Array Room', hardware: 'NFC Tag', radius: '5 meters', window: '00:04:00', rule: 'Check ambient temperature gauge', completed: true, tag: 'VERIFIED', tagClass: 'tag-green' },
      { id: 'dc2', name: 'Cold Aisle Server Pod 1-4', hardware: 'Dynamic QR', radius: '3 meters', window: '00:09:00', rule: 'Scan rack handle QR codes in sequence', completed: true, tag: 'VERIFIED', tagClass: 'tag-green' },
      { id: 'dc3', name: 'Diesel Generator Backup Sector', hardware: 'BLE Beacon', radius: '8 meters', window: '00:15:00', rule: 'Inspect fuel level sensor readout', isCurrent: true, tag: 'CURRENT TARGET', tagClass: 'tag-cyan' },
    ]
  },
  {
    id: 'executive_building',
    name: 'Executive Office Tour',
    badge: 'STANDARD',
    frequency: 'Every 2 Hours',
    duration: '18 Mins',
    desc: 'Interior office suites, executive boardrooms, and emergency fire exits check.',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>',
    checkpoints: [
      { id: 'ex1', name: 'Floor 12 Executive Lobby', hardware: 'NFC Tag', radius: '6 meters', window: '00:05:00', rule: 'Verify badge reader indicator', completed: true, tag: 'VERIFIED', tagClass: 'tag-green' },
      { id: 'ex2', name: 'Boardroom A Emergency Exit', hardware: 'NFC Tag', radius: '4 meters', window: '00:11:00', rule: 'Confirm door pressure seal', completed: false, isCurrent: true, tag: 'CURRENT TARGET', tagClass: 'tag-cyan' },
      { id: 'ex3', name: 'Freight Elevator Penthouse', hardware: 'Dynamic QR', radius: '5 meters', window: '00:18:00', rule: 'Scan QR at elevator machine room', completed: false, tag: 'PENDING', tagClass: 'tag-gray' },
    ]
  }
]);

const activeTourId = ref('night_perimeter');
const currentTour = computed(() => patrolTours.value.find(t => t.id === activeTourId.value) || patrolTours.value[0]);

// Sample Guards for Web SOC preview
const sampleGuards = ref([
  { id: 1, name: 'Alex Johnson', initials: 'AJ', site: 'Nexus Campus', zone: 'Sector 4', status: 'On Patrol', statusClass: 'status-green' },
  { id: 2, name: 'Sarah Miller', initials: 'SM', site: 'Nexus Campus', zone: 'Sector 1', status: 'On Patrol', statusClass: 'status-green' },
  { id: 3, name: 'Marcus Vance', initials: 'MV', site: 'Nexus Campus', zone: 'Sector 2', status: 'Dispatched (SOS)', statusClass: 'status-red' },
  { id: 4, name: 'David Chen', initials: 'DC', site: 'Harbor Facility', zone: 'Gate B', status: 'Standby', statusClass: 'status-yellow' },
]);

// Audio Web API Sound Synthesis
let audioCtx = null;
const playSfx = (type) => {
  if (isAudioMuted.value) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'blip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523, audioCtx.currentTime);
      osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.08);
      osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.28);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.28);
    } else if (type === 'radio') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(750, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (e) {
    // AudioContext blocked
  }
};

const toggleAudio = () => {
  isAudioMuted.value = !isAudioMuted.value;
  if (!isAudioMuted.value) playSfx('blip');
};

const toggleParticles = () => {
  showParticleField.value = !showParticleField.value;
  if (particleSystem) particleSystem.visible = showParticleField.value;
};

const selectTour = (tour) => {
  activeTourId.value = tour.id;
  playSfx('blip');
};

// Cursor & Card Tilt Handlers
const handleGlobalMouseMove = (e) => {
  cursorPos.x = e.clientX;
  cursorPos.y = e.clientY;
  mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNorm.y = -(e.clientY / window.innerHeight) * 2 + 1;
};

const onCursorHover = (hovering) => {
  isCursorHovering.value = hovering;
};

const handleCardTilt = (e) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * -6;
  const rotateY = ((x - centerX) / centerX) * 6;
  
  card.style.setProperty('--mouse-x', `${x}px`);
  card.style.setProperty('--mouse-y', `${y}px`);
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
};

const resetCardTilt = (e) => {
  const card = e.currentTarget;
  card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
};

// Navigation Scroll Helper
const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

const goToLogin = () => {
  router.push('/login');
};

// ═══════════════════════════════════════════════════════════════
// 3D THREE.JS WEBGL SIMULATION INITIALIZATION
// ═══════════════════════════════════════════════════════════════
const initThreeJS = () => {
  if (!canvasEl.value) return;

  const width = canvasEl.value.clientWidth || window.innerWidth;
  const height = canvasEl.value.clientHeight || window.innerHeight;

  // Scene & Camera
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030712, 0.015);

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 18, 42);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl.value,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Raycaster for mouse interaction
  raycaster = new THREE.Raycaster();
  mouseVector3D = new THREE.Vector2();

  // 1. Ambient & Directional Lights
  const ambientLight = new THREE.AmbientLight(0x0f2b5c, 1.5);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0x38bdf8, 3.0);
  mainLight.position.set(20, 40, 20);
  scene.add(mainLight);

  const accentCyanLight = new THREE.PointLight(0x06b6d4, 4, 60);
  accentCyanLight.position.set(-15, 10, 10);
  scene.add(accentCyanLight);

  const accentBlueLight = new THREE.PointLight(0x1d4ed8, 5, 80);
  accentBlueLight.position.set(15, -5, -10);
  scene.add(accentBlueLight);

  // 2. Central Holographic Cyber Core / Shield
  centralCoreGroup = new THREE.Group();
  scene.add(centralCoreGroup);

  // Core Geodesic Wireframe
  const coreGeom = new THREE.IcosahedronGeometry(7, 2);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.6,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });
  const coreMesh = new THREE.Mesh(coreGeom, coreMat);
  centralCoreGroup.add(coreMesh);

  // Inner Solid Glow Sphere
  const innerSphereGeom = new THREE.SphereGeometry(4.5, 32, 32);
  const innerSphereMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.8,
    transparent: true,
    opacity: 0.85
  });
  const innerSphere = new THREE.Mesh(innerSphereGeom, innerSphereMat);
  centralCoreGroup.add(innerSphere);

  // Orbital Rings
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  const ringGeom1 = new THREE.RingGeometry(9, 9.2, 64);
  const ring1 = new THREE.Mesh(ringGeom1, ringMat);
  ring1.rotation.x = Math.PI / 2.3;
  centralCoreGroup.add(ring1);

  const ringGeom2 = new THREE.RingGeometry(11.5, 11.7, 64);
  const ring2 = new THREE.Mesh(ringGeom2, new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
  ring2.rotation.x = Math.PI / 3;
  ring2.rotation.y = Math.PI / 4;
  centralCoreGroup.add(ring2);

  // 3. Ground Tactical Grid
  const gridHelper = new THREE.GridHelper(80, 40, 0x0284c7, 0x0c2146);
  gridHelper.position.y = -10;
  scene.add(gridHelper);

  // Radar Wave Ring
  const radarGeom = new THREE.RingGeometry(0.1, 1.2, 64);
  const radarMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
  radarWaveRing = new THREE.Mesh(radarGeom, radarMat);
  radarWaveRing.rotation.x = -Math.PI / 2;
  radarWaveRing.position.y = -9.9;
  scene.add(radarWaveRing);

  // 4. 4 Checkpoint Beacon Towers
  const cpPositions = [
    { x: -14, y: -9.5, z: 8, name: 'Tower A: Main Gate (#01)', hardware: 'NFC Type 4', lastVerified: '2 mins ago', guard: 'Alex Johnson', status: 'VERIFIED (99.8%)' },
    { x: 12, y: -9.5, z: 12, name: 'Tower B: East Perimeter (#02)', hardware: 'BLE Beacon #04', lastVerified: '6 mins ago', guard: 'Alex Johnson', status: 'VERIFIED' },
    { x: 15, y: -9.5, z: -10, name: 'Tower C: Server Vault (#03)', hardware: 'NFC + QR Lock', lastVerified: 'Just Now', guard: 'Alex Johnson', status: 'ACTIVE TARGET' },
    { x: -12, y: -9.5, z: -14, name: 'Tower D: Rooftop Helipad (#04)', hardware: 'NFC Hardware Tag', lastVerified: 'Pending', guard: 'Alex Johnson', status: 'SCHEDULED' },
  ];

  checkpointMeshes = [];
  cpPositions.forEach((cp, idx) => {
    const group = new THREE.Group();
    group.position.set(cp.x, cp.y, cp.z);
    group.userData = cp;

    const baseGeom = new THREE.CylinderGeometry(1.2, 1.6, 0.6, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    group.add(base);

    const pillarGeom = new THREE.CylinderGeometry(0.2, 0.4, 6, 16);
    const pillarMat = new THREE.MeshBasicMaterial({
      color: idx === 2 ? 0x38bdf8 : 0x0ea5e9,
      transparent: true,
      opacity: 0.6
    });
    const pillar = new THREE.Mesh(pillarGeom, pillarMat);
    pillar.position.y = 3;
    group.add(pillar);

    const crystalGeom = new THREE.OctahedronGeometry(0.8, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      wireframe: false
    });
    const crystal = new THREE.Mesh(crystalGeom, crystalMat);
    crystal.position.y = 6.5;
    group.add(crystal);

    scene.add(group);
    checkpointMeshes.push(group);
  });

  // 5. Patrol Route Tube Geometry
  const curvePoints = [
    new THREE.Vector3(-14, -6.5, 8),
    new THREE.Vector3(-2, -7.5, 14),
    new THREE.Vector3(12, -6.5, 12),
    new THREE.Vector3(16, -6.0, 0),
    new THREE.Vector3(15, -6.5, -10),
    new THREE.Vector3(0, -6.0, -16),
    new THREE.Vector3(-12, -6.5, -14),
    new THREE.Vector3(-16, -6.0, -2),
    new THREE.Vector3(-14, -6.5, 8)
  ];
  const curve = new THREE.CatmullRomCurve3(curvePoints);
  const routeGeom = new THREE.TubeGeometry(curve, 100, 0.15, 8, true);
  const routeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.7 });
  routeLine = new THREE.Mesh(routeGeom, routeMat);
  scene.add(routeLine);

  // Animated Guard Glowing Orb
  const guardGeom = new THREE.SphereGeometry(0.6, 16, 16);
  const guardMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 2.0
  });
  guardOrb = new THREE.Mesh(guardGeom, guardMat);
  scene.add(guardOrb);

  // 6. 10,000 Dynamic Depth Particles with Physics
  const particleCount = 10000;
  const pGeom = new THREE.BufferGeometry();
  particlePositions = new Float32Array(particleCount * 3);
  particleOriginals = new Float32Array(particleCount * 3);
  particleVelocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const idx = i * 3;
    const r = 14 + Math.random() * 45;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = (r * Math.sin(phi) * Math.sin(theta)) * 0.6;
    const z = r * Math.cos(phi);

    particlePositions[idx] = x;
    particlePositions[idx + 1] = y;
    particlePositions[idx + 2] = z;

    particleOriginals[idx] = x;
    particleOriginals[idx + 1] = y;
    particleOriginals[idx + 2] = z;

    particleVelocities[idx] = 0;
    particleVelocities[idx + 1] = 0;
    particleVelocities[idx + 2] = 0;
  }

  pGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  const pMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.22,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particleSystem = new THREE.Points(pGeom, pMat);
  scene.add(particleSystem);

  // Animation Loop
  animate3D();
};

const applyVisionModeTo3D = (modeId) => {
  if (!scene || !particleSystem) return;
  
  if (modeId === 'thermal') {
    particleSystem.material.color.setHex(0xf97316);
    if (scene.fog) scene.fog.color.setHex(0x1a0b2e);
  } else if (modeId === 'night') {
    particleSystem.material.color.setHex(0x10b981);
    if (scene.fog) scene.fog.color.setHex(0x022c22);
  } else if (modeId === 'xray') {
    particleSystem.material.color.setHex(0xa855f7);
    if (scene.fog) scene.fog.color.setHex(0x0f0b24);
  } else {
    particleSystem.material.color.setHex(0x38bdf8);
    if (scene.fog) scene.fog.color.setHex(0x030712);
  }
};

let radarScale = 0.1;
let guardRouteProgress = 0;
let lastFrameTime = performance.now();
let frameCount = 0;

const animate3D = () => {
  animationFrameId = requestAnimationFrame(animate3D);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Calculate FPS
  frameCount++;
  const now = performance.now();
  if (now - lastFrameTime >= 1000) {
    fpsCounter.value = frameCount;
    frameCount = 0;
    lastFrameTime = now;
  }

  // Smooth Cursor Interpolation for Fluid Dot
  smoothCursor.x += (cursorPos.x - smoothCursor.x) * 0.15;
  smoothCursor.y += (cursorPos.y - smoothCursor.y) * 0.15;

  // 1. Central Core Rotation & Cursor Interaction
  if (centralCoreGroup) {
    centralCoreGroup.rotation.y += 0.005;
    centralCoreGroup.rotation.x = THREE.MathUtils.lerp(centralCoreGroup.rotation.x, mouseNorm.y * 0.35, 0.05);
    centralCoreGroup.rotation.z = THREE.MathUtils.lerp(centralCoreGroup.rotation.z, -mouseNorm.x * 0.35, 0.05);
  }

  // 2. Camera POV Navigation
  if (camera) {
    if (currentCamMode.value === 'orbit') {
      const orbitSpeed = time * 0.3;
      camera.position.x = Math.sin(orbitSpeed) * 38;
      camera.position.z = Math.cos(orbitSpeed) * 38;
      camera.position.y = 16 + Math.sin(orbitSpeed * 0.5) * 4;
      camera.lookAt(0, 0, 0);
    } else if (currentCamMode.value === 'guard' && guardOrb) {
      camera.position.x = guardOrb.position.x - 6;
      camera.position.y = guardOrb.position.y + 4;
      camera.position.z = guardOrb.position.z + 8;
      camera.lookAt(guardOrb.position);
    } else if (currentCamMode.value === 'satellite') {
      camera.position.set(0, 52, 2);
      camera.lookAt(0, 0, 0);
    } else {
      // Default Isometric with mouse parallax
      const targetCamX = mouseNorm.x * 8;
      const targetCamY = 18 + mouseNorm.y * 4;
      camera.position.x += (targetCamX - camera.position.x) * 0.03;
      camera.position.y += (targetCamY - camera.position.y) * 0.03;
      camera.position.z = 42;
      camera.lookAt(0, 0, 0);
    }
  }

  // 3. Radar Wave Expansion
  if (radarWaveRing) {
    radarScale += 0.25;
    if (radarScale > 40) radarScale = 0.1;
    radarWaveRing.scale.set(radarScale, radarScale, 1);
    radarWaveRing.material.opacity = Math.max(0, 0.7 * (1 - radarScale / 40));
  }

  // 4. Checkpoint Crystals Floating & Rotation
  checkpointMeshes.forEach((cpGroup, i) => {
    const crystal = cpGroup.children[2];
    if (crystal) {
      crystal.rotation.y += 0.02;
      crystal.position.y = 6.5 + Math.sin(time * 2 + i) * 0.35;
    }
  });

  // 5. Guard Orb Moving along Patrol Loop
  if (guardOrb && routeLine) {
    guardRouteProgress += 0.002;
    if (guardRouteProgress > 1) guardRouteProgress = 0;
    
    const angle = guardRouteProgress * Math.PI * 2;
    const gx = Math.sin(angle) * 14;
    const gz = Math.cos(angle) * 11;
    guardOrb.position.set(gx, -6.5 + Math.sin(angle * 2) * 0.5, gz);
  }

  // 6. Particle Physics & Dynamic Cursor Repulsion
  if (particleSystem && particlePositions && showParticleField.value) {
    const posAttr = particleSystem.geometry.attributes.position;
    const cursorRayPoint = new THREE.Vector3(mouseNorm.x * 25, mouseNorm.y * 15, 0);

    for (let i = 0; i < particlePositions.length / 3; i++) {
      const idx = i * 3;
      const px = posAttr.getX(i);
      const py = posAttr.getY(i);
      const pz = posAttr.getZ(i);

      const ox = particleOriginals[idx];
      const oy = particleOriginals[idx + 1];
      const oz = particleOriginals[idx + 2];

      const dx = px - cursorRayPoint.x;
      const dy = py - cursorRayPoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 12) {
        const force = (12 - dist) / 12;
        particleVelocities[idx] += (dx / dist) * force * 0.8;
        particleVelocities[idx + 1] += (dy / dist) * force * 0.8;
      }

      particleVelocities[idx] += (ox - px) * 0.03;
      particleVelocities[idx + 1] += (oy - py) * 0.03;
      particleVelocities[idx + 2] += (oz - pz) * 0.03;

      particleVelocities[idx] *= 0.88;
      particleVelocities[idx + 1] *= 0.88;
      particleVelocities[idx + 2] *= 0.88;

      posAttr.setXYZ(
        i,
        px + particleVelocities[idx],
        py + particleVelocities[idx + 1],
        pz + particleVelocities[idx + 2]
      );
    }
    posAttr.needsUpdate = true;
  }

  // 7. Raycasting for 3D Checkpoint Tooltip
  if (raycaster && camera && checkpointMeshes.length > 0) {
    mouseVector3D.x = mouseNorm.x;
    mouseVector3D.y = mouseNorm.y;
    raycaster.setFromCamera(mouseVector3D, camera);

    const interactiveObjects = checkpointMeshes.map(g => g.children[2]).filter(Boolean);
    const intersects = raycaster.intersectObjects(interactiveObjects);

    if (intersects.length > 0) {
      const hitGroup = intersects[0].object.parent;
      if (hitGroup && hitGroup.userData) {
        hoveredCheckpoint.value = hitGroup.userData;
        
        const worldPos = new THREE.Vector3();
        hitGroup.getWorldPosition(worldPos);
        worldPos.y += 7.5;
        worldPos.project(camera);

        const halfWidth = window.innerWidth / 2;
        const halfHeight = window.innerHeight / 2;
        hoveredCheckpointScreenPos.x = (worldPos.x * halfWidth) + halfWidth;
        hoveredCheckpointScreenPos.y = -(worldPos.y * halfHeight) + halfHeight;
      }
    } else {
      hoveredCheckpoint.value = null;
    }
  }

  renderer.render(scene, camera);
};

// Window Resize & Scroll Listeners
const handleResize = () => {
  if (!canvasEl.value || !renderer || !camera) return;
  const width = canvasEl.value.clientWidth || window.innerWidth;
  const height = canvasEl.value.clientHeight || window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

const handleScroll = () => {
  const now = Date.now();
  const currentY = window.scrollY;
  const deltaY = currentY - lastScrollY;
  const absDeltaY = Math.abs(deltaY);
  const deltaT = Math.max(1, now - lastScrollTime);
  const speed = (absDeltaY / deltaT) * 1000; // px per second
  scrollVelocity.value = speed;

  isScrolled.value = currentY > 40;

  // Viewport-relative spring inertia (45% of viewport height default, slightly shifting during scroll)
  const baseCenter = window.innerHeight * 0.45;
  const lagOffset = Math.max(-120, Math.min(120, deltaY * 1.5));
  guardTargetScreenY.value = baseCenter - lagOffset;

  // Guard runs when actively scrolling fast
  guardIsRunning.value = speed > 600;

  // Auto-detect active section for the Patrol Guide
  const scrollMiddle = currentY + window.innerHeight * 0.4;
  for (let i = tourStops.value.length - 1; i >= 0; i--) {
    const el = document.getElementById(tourStops.value[i].id);
    if (el && el.offsetTop <= scrollMiddle) {
      if (currentTourStopIndex.value !== i && !guardMissedAlert.value) {
        currentTourStopIndex.value = i;
        isGuideBubbleVisible.value = true;
      }
      break;
    }
  }

  // Rapid scroll tracking (without popup interruptions)
  if (speed > 1800 && absDeltaY > 200 && currentY > 300) {
    missedScrollPosition = Math.max(0, currentY - 600);
  }

  lastScrollY = currentY;
  lastScrollTime = now;
};

const handleMouseDown = () => { isClicking.value = true; };
const handleMouseUp = () => { isClicking.value = false; };

onMounted(() => {
  document.title = 'AccessEasy Patrol | Real-Time Security Guard Tour & Patrol Management Platform';
  
  // Set SEO Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = 'Connect your security command center with guards on the ground. Real-time GPS patrol tracking, NFC & QR checkpoints, instant SOS dispatch, and automated incident reports for 500+ security teams.';

  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mouseup', handleMouseUp);
  
  lastScrollY = window.scrollY;
  guardTargetScreenY.value = window.innerHeight * 0.45;
  guardScreenY.value = guardTargetScreenY.value;
  guardAnimFrame = requestAnimationFrame(animateGuard);

  nextTick(() => {
    initThreeJS();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('mousedown', handleMouseDown);
  window.removeEventListener('mouseup', handleMouseUp);
  if (guardAnimFrame) cancelAnimationFrame(guardAnimFrame);
  if (missedAlertTimeout) clearTimeout(missedAlertTimeout);

  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (renderer) renderer.dispose();
  if (scene) {
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  }
});
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS & CYBER-PHYSICAL STYLING
═══════════════════════════════════════════════════════════════ */
.patrol-v2 {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: #030712;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  overflow-x: hidden;
  cursor: default;
}

/* Custom Magnetic Fluid Cursor */
.cursor-glow {
  position: fixed;
  top: -150px;
  left: -150px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(27, 79, 216, 0.05) 45%, transparent 70%);
  pointer-events: none;
  z-index: 9999;
  transition: transform 0.06s ease-out;
  mix-blend-mode: screen;
}

.cursor-dot {
  position: fixed;
  top: -6px;
  left: -6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 16px #38bdf8, 0 0 32px rgba(56, 189, 248, 0.6);
  pointer-events: none;
  z-index: 10000;
  transition: width 0.2s ease, height 0.2s ease, background 0.2s ease;
}
.cursor-dot.cursor-active {
  width: 36px;
  height: 36px;
  top: -18px;
  left: -18px;
  background: rgba(56, 189, 248, 0.25);
  border: 1.5px solid #38bdf8;
}
.cursor-dot.cursor-clicking {
  transform: scale(0.7);
}

/* ═══════════════════════════════════════════════════════════
   3D WEBGL CANVAS & OVERLAY HUDS
═══════════════════════════════════════════════════════════ */
.canvas-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  pointer-events: none;
}
.webgl-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* Vision Overlays */
.night-vision-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, transparent 40%, rgba(2, 44, 34, 0.6) 90%),
              repeating-linear-gradient(0deg, rgba(16, 185, 129, 0.04) 0px, rgba(16, 185, 129, 0.04) 1px, transparent 1px, transparent 3px);
  pointer-events: none;
}
.nv-crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  transform: translate(-50%, -50%);
  border: 1px dashed rgba(16, 185, 129, 0.5);
  border-radius: 50%;
}
.nv-battery {
  position: absolute;
  bottom: 24px;
  left: 24px;
  font-family: monospace;
  font-size: 11px;
  color: #10b981;
}

.thermal-vision-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, transparent 50%, rgba(249, 115, 22, 0.15) 100%);
  pointer-events: none;
}
.thermal-palette-bar {
  position: absolute;
  bottom: 24px;
  left: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 9px;
  font-weight: 800;
  color: #f97316;
}
.thermal-gradient {
  width: 14px;
  height: 80px;
  border-radius: 4px;
  background: linear-gradient(180deg, #f97316 0%, #eab308 50%, #8b5cf6 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* ═══════════════════════════════════════════════════════════
   FLOATING TACTICAL 3D COMMAND DOCK (Bottom-Right HUD)
═══════════════════════════════════════════════════════════ */
.tactical-hud-dock {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1001;
  background: rgba(10, 18, 35, 0.92);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.15);
  backdrop-filter: blur(20px);
  width: 380px;
  max-width: calc(100vw - 32px);
  padding: 12px 14px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}
.tactical-hud-dock.dock-minimized {
  width: auto;
  padding: 8px 14px;
}

.dock-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.dock-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dock-live-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 10px #38bdf8;
  animation: beacon-pulse 1.8s ease-in-out infinite;
}
.dock-title {
  font-size: 10px;
  font-weight: 800;
  color: #38bdf8;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.dock-toggle-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #94a3b8;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.dock-toggle-btn:hover {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border-color: #38bdf8;
}

.dock-content {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dock-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dock-section-label {
  font-size: 8px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.06em;
}
.dock-pill-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}
.dock-pill-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 8px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}
.dock-pill-btn:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}
.dock-pill-btn.active {
  background: rgba(56, 189, 248, 0.25);
  border-color: #38bdf8;
  color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

.dock-footer-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.dock-tour-select-wrap {
  flex: 1;
}
.dock-tour-dropdown {
  width: 100%;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 8px;
  outline: none;
  cursor: pointer;
}
.dock-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}
.dock-action-btn:hover, .dock-action-btn.active {
  background: rgba(56, 189, 248, 0.18);
  border-color: #38bdf8;
  color: #38bdf8;
}
.hud-tool-btn:active, .hud-tool-btn:focus {
  transform: scale(0.95);
  background: rgba(56, 189, 248, 0.22);
  border-color: rgba(56, 189, 248, 0.6);
  color: #38bdf8;
  outline: none;
}
.hud-tool-btn.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}

/* Spatial 3D Tooltip Anchor */
.spatial-3d-tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid #38bdf8;
  box-shadow: 0 0 24px rgba(56, 189, 248, 0.35);
  border-radius: 10px;
  padding: 12px 16px;
  pointer-events: none;
  z-index: 100;
  min-width: 220px;
  backdrop-filter: blur(16px);
}
.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 6px;
}
.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
}
.tooltip-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
}
.tooltip-row {
  display: flex;
  justify-content: space-between;
}
.tooltip-row .label { color: #64748b; }
.tooltip-row .val { color: #f1f5f9; font-weight: 600; }

/* ═══════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════ */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 18px 0;
  transition: all 0.3s ease;
}
.navbar.navbar-scrolled {
  padding: 12px 0;
  background: rgba(3, 7, 18, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.nav-inner {
  max-width: 1380px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}
.brand-shield-wrap {
  position: relative;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-shield-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.6) 0%, transparent 70%);
  filter: blur(6px);
}
.brand-logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  position: relative;
  z-index: 2;
}

.brand-title {
  font-size: 18px;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.02em;
}
.brand-highlight {
  color: #38bdf8;
  font-weight: 900;
}
.brand-subtitle {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}
.nav-item {
  color: #94a3b8;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav-item:hover {
  color: #38bdf8;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  color: #f8fafc;
  cursor: pointer;
}

.mobile-menu-drawer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: rgba(15, 23, 42, 0.98);
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
}
.mob-link {
  color: #cbd5e1;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
}
.mob-cta-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

/* ═══════════════════════════════════════════════════════════
   BUTTONS & UI ATOMS
═══════════════════════════════════════════════════════════ */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
}
.btn-lg {
  padding: 14px 28px;
  font-size: 15px;
  border-radius: 12px;
}
.btn-primary {
  background: linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%);
  color: #ffffff;
  border: 1px solid rgba(56, 189, 248, 0.4);
  box-shadow: 0 4px 20px rgba(2, 132, 199, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(56, 189, 248, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.5);
}
.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: skewX(-20deg);
  animation: shine 4s infinite;
}
@keyframes shine {
  0% { left: -100%; }
  20% { left: 200%; }
  100% { left: 200%; }
}

.btn-secondary {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(56, 189, 248, 0.25);
  color: #e2e8f0;
  backdrop-filter: blur(10px);
}
.btn-secondary:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #38bdf8;
  transform: translateY(-2px);
}

.btn-ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}
.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* ═══════════════════════════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════════════════════════ */
.hero-section {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding-top: 120px;
  padding-bottom: 60px;
}
.section-container {
  max-width: 1380px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 48px;
  align-items: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  background: rgba(14, 165, 233, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #38bdf8;
  margin-bottom: 24px;
  backdrop-filter: blur(12px);
}
.badge-radar {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 10px #38bdf8;
  animation: radarPulse 1.8s infinite;
}
@keyframes radarPulse {
  0% { transform: scale(0.9); opacity: 1; }
  50% { transform: scale(1.6); opacity: 0.4; }
  100% { transform: scale(0.9); opacity: 1; }
}
.badge-tag {
  background: #0284c7;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
}

.hero-title {
  font-size: clamp(38px, 5vw, 62px);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 20px;
}
.gradient-text {
  background: linear-gradient(135deg, #38bdf8 0%, #60a5fa 50%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 17px;
  line-height: 1.6;
  color: #94a3b8;
  max-width: 580px;
  margin-bottom: 32px;
}
.hero-description strong {
  color: #f1f5f9;
}

.hero-metrics-pill-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 540px;
  margin-bottom: 36px;
}
.metric-pill {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 16px;
  backdrop-filter: blur(10px);
}
.metric-val {
  display: block;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.metric-lbl {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.hero-cta-stack {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.hero-trust-badges {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}
.trust-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.trust-divider {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

/* Hero Holo Card (3D Tilt) */
.hero-telemetry-panel {
  perspective: 1200px;
}
.holo-card {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 20px;
  padding: 2px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15);
  backdrop-filter: blur(24px);
  transition: transform 0.1s ease-out;
}
.holo-card-inner {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(3, 7, 18, 0.95) 100%);
  border-radius: 18px;
  padding: 24px;
}
.holo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.guard-id-block {
  display: flex;
  align-items: center;
  gap: 14px;
}
.guard-avatar-ring {
  position: relative;
  width: 44px;
  height: 44px;
}
.avatar-radar {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1.5px dashed #38bdf8;
  animation: spin 8s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
.avatar-img-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: #fff;
}
.guard-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.guard-fullname {
  font-size: 15px;
  font-weight: 800;
  color: #f8fafc;
}
.role-badge {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}
.guard-meta {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}
.guard-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 4px 10px;
  border-radius: 9999px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.telemetry-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.telem-box {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 10px 14px;
}
.telem-lbl {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.telem-val {
  font-size: 13px;
  font-weight: 700;
  color: #f1f5f9;
  margin-top: 2px;
}

.telem-progress-wrap {
  margin-bottom: 20px;
}
.telem-progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 8px;
}
.telem-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
}
.telem-bar {
  height: 100%;
  background: linear-gradient(90deg, #0284c7, #38bdf8);
  border-radius: 9999px;
  box-shadow: 0 0 10px #38bdf8;
}

.micro-logs-feed {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  background: rgba(3, 7, 18, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 12px;
}
.micro-log-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}
.micro-time { color: #64748b; font-family: monospace; }
.micro-msg { flex: 1; color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.micro-tag {
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.telem-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 11px;
  color: #64748b;
}
.telemetry-waveform {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 16px;
}
.wave-bar {
  width: 2px;
  height: 100%;
  background: #38bdf8;
  border-radius: 1px;
  animation: wave 1.2s infinite ease-in-out;
}
@keyframes wave {
  0%, 100% { transform: scaleY(0.2); }
  50% { transform: scaleY(1); }
}

/* ═══════════════════════════════════════════════════════════
   SECTION HEADERS
═══════════════════════════════════════════════════════════ */
.section-header {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 56px auto;
  position: relative;
  z-index: 10;
}
.section-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #38bdf8;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.section-title {
  font-size: clamp(28px, 3.5vw, 42px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
  color: #f8fafc;
}
.section-subtitle {
  font-size: 16px;
  line-height: 1.6;
  color: #94a3b8;
}

/* ═══════════════════════════════════════════════════════════
   SIMULATOR SECTION
═══════════════════════════════════════════════════════════ */
.simulator-section {
  padding: 90px 0;
  position: relative;
  z-index: 10;
}
.sim-container {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(24px);
}
.sim-grid {
  display: grid;
  grid-template-columns: 1fr 1.35fr;
  gap: 36px;
}

.sim-panel-title {
  font-size: 18px;
  font-weight: 800;
  color: #f8fafc;
  margin-bottom: 8px;
}
.sim-panel-desc {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 24px;
}

.sim-buttons-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.sim-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}
.sim-btn:hover, .sim-btn.active {
  background: rgba(56, 189, 248, 0.12);
  border-color: #38bdf8;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);
}
.sim-btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sim-btn-title {
  font-size: 14px;
  font-weight: 700;
  color: #f8fafc;
}
.sim-btn-meta {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

/* Terminal Console */
.sim-terminal {
  background: #030712;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: rgba(15, 23, 42, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.term-dots {
  display: flex;
  gap: 6px;
}
.term-dots .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.term-dots .red { background: #ef4444; }
.term-dots .yellow { background: #f59e0b; }
.term-dots .green { background: #10b981; }
.term-title {
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.06em;
}
.term-time {
  font-size: 11px;
  font-family: monospace;
  color: #38bdf8;
}

.terminal-body {
  padding: 18px;
  flex: 1;
  min-height: 280px;
  max-height: 340px;
  overflow-y: auto;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.term-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.4;
}
.term-stamp { color: #64748b; }
.term-tag {
  font-weight: 800;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}
.term-line.alert .term-tag { background: #ef4444; color: #fff; }
.term-line.alert .term-text { color: #fca5a5; }
.term-line.success .term-tag { background: #10b981; color: #fff; }
.term-line.success .term-text { color: #86efac; }
.term-line.dispatch .term-tag { background: #0284c7; color: #fff; }
.term-line.dispatch .term-text { color: #7dd3fc; }

.term-alert-banner {
  margin-top: 12px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid #ef4444;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  animation: pulseGlow 2s infinite;
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 24px rgba(239, 68, 68, 0.6); }
}
.alert-icon-wrap {
  position: relative;
  color: #ef4444;
  margin-top: 2px;
}
.alert-heading {
  font-size: 13px;
  font-weight: 800;
  color: #f87171;
}
.alert-desc {
  font-size: 12px;
  color: #fca5a5;
  margin: 4px 0 8px 0;
}
.alert-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
  color: #cbd5e1;
}

.terminal-footer {
  display: flex;
  justify-content: space-between;
  padding: 10px 18px;
  background: rgba(15, 23, 42, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 11px;
  color: #64748b;
}

/* ═══════════════════════════════════════════════════════════
   NFC SCANNER SIMULATOR SECTION
═══════════════════════════════════════════════════════════ */
.scanner-section {
  padding: 90px 0;
  position: relative;
  z-index: 10;
}
.scanner-layout {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 40px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 24px;
  padding: 40px;
  backdrop-filter: blur(24px);
}

.interactive-phone-wrap {
  display: flex;
  justify-content: center;
}
.interactive-phone {
  width: 310px;
  background: #030712;
  border: 4px solid #1e293b;
  border-radius: 38px;
  padding: 14px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(56, 189, 248, 0.15);
}
.phone-dynamic-island {
  width: 90px;
  height: 20px;
  background: #000;
  border-radius: 10px;
  margin: 0 auto 12px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.island-camera { width: 8px; height: 8px; border-radius: 50%; background: #1e293b; }
.island-sensor { width: 5px; height: 5px; border-radius: 50%; background: #0f172a; }

.phone-screen-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.phone-status-bar {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  font-weight: 700;
  color: #94a3b8;
}
.phone-guard-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 10px;
  padding: 8px 10px;
}
.phone-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
}
.phone-guard-name { font-size: 11px; font-weight: 800; color: #fff; }
.phone-guard-loc { font-size: 9px; color: #64748b; }
.phone-badge-live {
  font-size: 8px;
  font-weight: 800;
  color: #10b981;
  margin-left: auto;
  background: rgba(16, 185, 129, 0.15);
  padding: 2px 6px;
  border-radius: 4px;
}

.phone-scanner-viewport {
  position: relative;
  height: 180px;
  background: radial-gradient(circle, #0b1e3b 0%, #030712 100%);
  border: 1px dashed rgba(56, 189, 248, 0.3);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}
.phone-scanner-viewport.scan-success {
  border-color: #10b981;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, #030712 100%);
}

.scanner-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid #38bdf8;
}
.scanner-corner.tl { top: 8px; left: 8px; border-right: 0; border-bottom: 0; }
.scanner-corner.tr { top: 8px; right: 8px; border-left: 0; border-bottom: 0; }
.scanner-corner.bl { bottom: 8px; left: 8px; border-right: 0; border-top: 0; }
.scanner-corner.br { bottom: 8px; right: 8px; border-left: 0; border-top: 0; }

.nfc-wave-ring {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #38bdf8;
  animation: nfcPulse 1.4s infinite ease-out;
}
.nfc-wave-ring.delay { animation-delay: 0.7s; }
@keyframes nfcPulse {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(2.6); opacity: 0; }
}

.scanner-idle-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #94a3b8;
}
.scanner-scanning-state {
  font-size: 11px;
  font-weight: 700;
  color: #38bdf8;
}
.scanner-success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.success-checkmark-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px #10b981;
}
.success-text { font-size: 12px; font-weight: 900; color: #fff; margin-top: 4px; }
.success-hash { font-size: 9px; font-family: monospace; color: #6ee7b7; }

.phone-photo-attached {
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid #38bdf8;
  border-radius: 8px;
  padding: 6px;
  text-align: center;
  font-size: 9px;
  font-weight: 700;
  color: #38bdf8;
}

.phone-action-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 8px;
}
.phone-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  transition: all 0.2s ease;
}
.phone-action-btn.primary {
  background: linear-gradient(135deg, #0284c7, #1d4ed8);
  border-color: #38bdf8;
  color: #fff;
}
.phone-action-btn:hover {
  transform: translateY(-2px);
}

/* Scanner Ledger Panel */
.scanner-ledger-panel {
  background: #030712;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 18px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}
.ledger-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 14px;
}
.ledger-title { font-size: 18px; font-weight: 800; color: #f8fafc; }
.ledger-subtitle { font-size: 12px; color: #64748b; margin-top: 2px; }
.ledger-badge {
  font-size: 9px;
  font-weight: 800;
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  padding: 4px 8px;
  border-radius: 4px;
}

.ledger-table-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.ledger-row-header {
  display: grid;
  grid-template-columns: 1fr 1.4fr 1.4fr 1fr 1fr;
  font-size: 10px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  padding: 6px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.ledger-row-item {
  display: grid;
  grid-template-columns: 1fr 1.4fr 1.4fr 1fr 1fr;
  align-items: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 10px;
  font-size: 11px;
}
.col-time { color: #64748b; }
.col-cp { font-weight: 700; color: #fff; }
.col-uid { color: #38bdf8; font-size: 10px; }
.col-verdict {
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  text-align: center;
}

.ledger-footer-info {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 11px;
  color: #64748b;
}
.info-item { display: flex; align-items: center; gap: 6px; }
.info-dot { width: 6px; height: 6px; border-radius: 50%; }
.info-dot.green { background: #10b981; }
.info-dot.cyan { background: #38bdf8; }

/* ═══════════════════════════════════════════════════════════
   GEOFENCE BUILDER SECTION
═══════════════════════════════════════════════════════════ */
.geofence-section {
  padding: 90px 0;
  position: relative;
  z-index: 10;
}
.geofence-sandbox-card {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 24px;
  padding: 40px;
  backdrop-filter: blur(24px);
}
.geofence-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
}

.geofence-map-container {
  position: relative;
  background: #020617;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.8);
}
.geofence-svg-layer {
  width: 100%;
  height: 100%;
  display: block;
  min-height: 340px;
}

.geofence-polygon {
  fill: rgba(56, 189, 248, 0.15);
  transition: fill 0.3s ease;
}
.geofence-polygon.violation-zone {
  fill: rgba(239, 68, 68, 0.2);
}
.geofence-polygon-border {
  fill: none;
  stroke: #38bdf8;
  stroke-width: 2;
  stroke-dasharray: 6 4;
}
.geofence-polygon-border.violation-border {
  stroke: #ef4444;
}

.guard-sonar-ring {
  fill: none;
  stroke: #38bdf8;
  stroke-width: 1.5;
  animation: sonarPulse 2s infinite;
}
.guard-sonar-ring.ring-alert { stroke: #ef4444; }
.guard-beacon-center { fill: #38bdf8; }
.guard-beacon-center.center-alert { fill: #ef4444; }
.guard-beacon-label {
  font-size: 10px;
  font-weight: 700;
  fill: #fff;
}
@keyframes sonarPulse {
  0% { r: 8; opacity: 1; }
  100% { r: 24; opacity: 0; }
}

.geofence-handle { cursor: grab; }
.geofence-handle:active { cursor: grabbing; }
.handle-outer { fill: rgba(56, 189, 248, 0.3); stroke: #38bdf8; stroke-width: 1.5; }
.handle-inner { fill: #fff; }
.handle-label { font-size: 9px; font-weight: 800; fill: #38bdf8; }

.geofence-map-hud {
  position: absolute;
  bottom: 12px;
  left: 12px;
}
.hud-tag {
  font-size: 10px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 9999px;
}
.tag-nominal { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; }
.tag-alert { background: rgba(239, 68, 68, 0.25); color: #f87171; border: 1px solid #ef4444; }

.geofence-metrics-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.geofence-title { font-size: 18px; font-weight: 800; color: #f8fafc; }
.geofence-desc { font-size: 12px; color: #94a3b8; margin: 4px 0 20px 0; }

.geofence-stat-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.geo-stat-card {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 16px;
}
.geo-stat-lbl { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
.geo-stat-val { font-size: 15px; font-weight: 800; margin: 2px 0; display: block; }
.geo-stat-sub { font-size: 11px; color: #94a3b8; }

.guard-pos-slider-wrap {
  background: #030712;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 12px;
  padding: 16px;
}

/* ═══════════════════════════════════════════════════════════
   RADIO COMMS SOUNDBOARD SECTION
═══════════════════════════════════════════════════════════ */
.radio-section {
  padding: 90px 0;
  position: relative;
  z-index: 10;
}
.radio-card {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 24px;
  padding: 36px;
  backdrop-filter: blur(24px);
}
.radio-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 36px;
}

.radio-lcd-display {
  background: #022c22;
  border: 2px solid #10b981;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: inset 0 0 20px rgba(16, 185, 129, 0.3);
}
.lcd-top {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-family: monospace;
  color: #6ee7b7;
}
.lcd-main {
  font-size: 14px;
  font-weight: 800;
  color: #10b981;
  font-family: monospace;
  margin: 12px 0;
  min-height: 24px;
}
.lcd-bars {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  color: #6ee7b7;
}
.signal-bar {
  width: 3px;
  height: 10px;
  background: #10b981;
  border-radius: 1px;
}

.soundboard-btn-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.radio-trigger-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}
.radio-trigger-btn:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  transform: translateY(-2px);
}
.radio-btn-icon { font-size: 20px; }
.radio-btn-name { font-size: 13px; font-weight: 800; color: #fff; }
.radio-btn-meta { font-size: 10px; color: #94a3b8; }

.radio-logs-stream {
  background: #030712;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
}
.stream-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 800;
  color: #38bdf8;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 10px;
  margin-bottom: 12px;
}
.stream-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  max-height: 220px;
  overflow-y: auto;
}
.comms-log-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
  border-left: 2px solid #38bdf8;
  padding-left: 8px;
}
.comms-time { font-size: 9px; color: #64748b; font-family: monospace; }
.comms-callsign { font-weight: 800; color: #38bdf8; }
.comms-text { color: #cbd5e1; }

/* ═══════════════════════════════════════════════════════════
   TOURS & CHECKPOINT MATRIX
═══════════════════════════════════════════════════════════ */
.tours-section {
  padding: 90px 0;
  position: relative;
  z-index: 10;
}
.tours-layout {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 32px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(20px);
}

.tours-nav-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.tour-card-tab {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tour-card-tab:hover, .tour-card-tab.active {
  background: rgba(56, 189, 248, 0.12);
  border-color: #38bdf8;
  box-shadow: 0 8px 24px rgba(56, 189, 248, 0.2);
}
.tour-tab-header {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 800;
  margin-bottom: 8px;
}
.tour-badge {
  background: #0284c7;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
}
.tour-timing { color: #94a3b8; }
.tour-tab-title {
  font-size: 16px;
  font-weight: 800;
  color: #f8fafc;
  margin-bottom: 6px;
}
.tour-tab-desc {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 14px;
}
.tour-tab-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 10px;
}

.tours-detail-panel {
  background: #030712;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 24px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 16px;
}
.panel-title {
  font-size: 16px;
  font-weight: 800;
  color: #f8fafc;
}
.panel-meta {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
}
.panel-badge-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
  padding: 4px 8px;
  border-radius: 9999px;
}

.checkpoints-timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.cp-step {
  display: flex;
  gap: 16px;
}
.cp-index-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cp-index {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #94a3b8;
  z-index: 2;
}
.cp-completed .cp-index {
  background: #10b981;
  color: #fff;
  border-color: #10b981;
}
.cp-current .cp-index {
  background: #0284c7;
  color: #fff;
  border-color: #38bdf8;
  box-shadow: 0 0 12px #38bdf8;
}
.cp-connector {
  position: absolute;
  top: 28px;
  width: 2px;
  height: calc(100% + 12px);
  background: rgba(255, 255, 255, 0.1);
}

.cp-body {
  flex: 1;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 14px 16px;
}
.cp-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.cp-name {
  font-size: 13px;
  font-weight: 800;
  color: #f8fafc;
}
.cp-info-row {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 8px;
}
.cp-rule {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.08);
  padding: 4px 8px;
  border-radius: 6px;
}

/* ═══════════════════════════════════════════════════════════
   MOBILE & WEB DUO
═══════════════════════════════════════════════════════════ */
.mobile-section {
  padding: 90px 0;
  position: relative;
  z-index: 10;
}
.duo-grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 32px;
}
.duo-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(20px);
}
.duo-pill {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.duo-title {
  font-size: 20px;
  font-weight: 800;
  color: #f8fafc;
  margin: 6px 0 24px 0;
}

/* Flutter Mockup Frame */
.mockup-frame {
  max-width: 320px;
  margin: 0 auto;
  background: #030712;
  border: 3px solid #1e293b;
  border-radius: 36px;
  padding: 16px 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
}
.mockup-header-bar {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 16px;
}
.mock-top-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 14px;
}
.mock-guard-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mock-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
}
.mock-name { font-size: 12px; font-weight: 800; color: #fff; }
.mock-site { font-size: 9px; color: #64748b; }
.mock-status-chip {
  font-size: 8px;
  font-weight: 800;
  background: #10b981;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
}

.mock-next-card {
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(29, 78, 216, 0.2) 100%);
  border: 1px solid #38bdf8;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 14px;
}
.mock-next-lbl { font-size: 9px; font-weight: 800; color: #38bdf8; letter-spacing: 0.05em; }
.mock-next-title { font-size: 14px; font-weight: 800; color: #fff; margin: 4px 0; }
.mock-next-dist { font-size: 10px; color: #94a3b8; margin-bottom: 12px; }

.mock-scan-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #38bdf8;
  color: #030712;
  font-size: 11px;
  font-weight: 800;
  padding: 10px;
  border-radius: 8px;
}

.mock-action-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.mock-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 8px 4px;
  font-size: 9px;
  color: #cbd5e1;
}
.mock-sos-btn {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #f87171;
  font-weight: 800;
}

/* SOC Web Mockup */
.soc-web-mockup {
  background: #030712;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
}
.soc-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: rgba(15, 23, 42, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 11px;
}
.soc-title { font-weight: 800; color: #f8fafc; }
.soc-stats-row { display: flex; gap: 14px; color: #94a3b8; }

.soc-body-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 16px;
  gap: 16px;
}
.soc-guard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.soc-guard-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 8px 10px;
}
.soc-guard-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  color: #38bdf8;
}
.soc-guard-details { flex: 1; }
.soc-guard-name { font-size: 11px; font-weight: 700; color: #fff; }
.soc-guard-site { font-size: 9px; color: #64748b; }
.soc-guard-pill {
  font-size: 8px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.soc-map-preview {
  position: relative;
  background: radial-gradient(circle, #0b1e3b 0%, #030712 100%);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 10px;
  min-height: 180px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.soc-map-radar {
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 1px solid rgba(56, 189, 248, 0.4);
  animation: radarScan 4s linear infinite;
}
@keyframes radarScan { 100% { transform: rotate(360deg); } }
.soc-map-marker {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  font-weight: 800;
  color: #38bdf8;
}
.marker-1 { top: 30%; left: 25%; }
.marker-2 { bottom: 35%; right: 30%; }
.marker-ping {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
}
.soc-map-overlay {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 9px;
  color: #64748b;
}

/* ═══════════════════════════════════════════════════════════
   GLOBAL FLEET SECTION
═══════════════════════════════════════════════════════════ */
.fleet-section {
  padding: 90px 0;
  position: relative;
  z-index: 10;
}
.fleet-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.fleet-site-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 24px 20px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
}
.fleet-site-card:hover, .fleet-site-card.active {
  border-color: #38bdf8;
  background: rgba(14, 165, 233, 0.12);
  box-shadow: 0 12px 30px rgba(56, 189, 248, 0.2);
  transform: translateY(-4px);
}
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.site-city { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; }
.site-name { font-size: 15px; font-weight: 800; color: #fff; margin-top: 2px; }
.site-badge { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; }

.site-metrics-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  background: rgba(3, 7, 18, 0.6);
  border-radius: 10px;
  padding: 10px 8px;
  margin-bottom: 16px;
  text-align: center;
}
.site-metric .lbl { font-size: 9px; color: #64748b; display: block; }
.site-metric .val { font-size: 13px; font-weight: 800; margin-top: 2px; }

.site-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #94a3b8;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 12px;
}
.site-action { color: #38bdf8; font-weight: 700; }

/* ═══════════════════════════════════════════════════════════
   6 FEATURES GRID (3D TILT CARDS)
═══════════════════════════════════════════════════════════ */
.features-section {
  padding: 90px 0;
  position: relative;
  z-index: 10;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.feature-card {
  position: relative;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 32px 28px;
  backdrop-filter: blur(16px);
  transition: transform 0.15s ease-out, border-color 0.25s ease;
  overflow: hidden;
}
.feature-card:hover {
  border-color: rgba(56, 189, 248, 0.4);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15);
}

.feature-card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(56, 189, 248, 0.15), transparent 40%);
  pointer-events: none;
}

.feature-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.bg-blue-subtle { background: rgba(56, 189, 248, 0.15); }
.bg-emerald-subtle { background: rgba(16, 185, 129, 0.15); }
.bg-red-subtle { background: rgba(239, 68, 68, 0.15); }
.bg-purple-subtle { background: rgba(168, 85, 247, 0.15); }
.bg-amber-subtle { background: rgba(245, 158, 11, 0.15); }
.bg-cyan-subtle { background: rgba(6, 182, 212, 0.15); }

.feature-title {
  font-size: 18px;
  font-weight: 800;
  color: #f8fafc;
  margin-bottom: 12px;
}
.feature-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #94a3b8;
  margin-bottom: 20px;
}
.feature-bullets {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  color: #cbd5e1;
}
.feature-bullets li {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ═══════════════════════════════════════════════════════════
   OFFICIAL PRICING (FLAT ₹1,999/SITE/MO & CAPACITY CALCULATOR)
═══════════════════════════════════════════════════════════ */
.pricing-section {
  padding: 90px 0;
  position: relative;
  z-index: 10;
}

.pricing-unified-grid {
  display: grid;
  grid-template-columns: 1.35fr 0.85fr;
  gap: 32px;
  align-items: stretch;
  margin-bottom: 48px;
}

.pricing-card {
  position: relative;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 36px;
  backdrop-filter: blur(24px);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.pricing-card-primary {
  border-color: rgba(56, 189, 248, 0.4);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.15);
}

.pricing-card-enterprise {
  background: rgba(10, 15, 30, 0.85);
  border-color: rgba(255, 255, 255, 0.12);
}

.pricing-popular-pill {
  position: absolute;
  top: -14px;
  left: 36px;
  background: linear-gradient(135deg, #0284c7, #2563eb);
  border: 1px solid rgba(56, 189, 248, 0.6);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 9999px;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
  display: flex;
  align-items: center;
  gap: 6px;
}

.tier-badge-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #38bdf8;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: 6px;
}
.tier-badge-label.enterprise { color: #a78bfa; }

.tier-heading {
  font-size: 24px;
  font-weight: 800;
  color: #f8fafc;
  margin-bottom: 4px;
}

.tier-subtext {
  font-size: 13px;
  color: #94a3b8;
}

.pricing-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 24px;
  margin-bottom: 24px;
}

.tier-price-block {
  text-align: right;
  flex-shrink: 0;
}

.tier-price {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 3px;
}

.price-currency {
  font-size: 20px;
  font-weight: 800;
  color: #38bdf8;
}

.price-val {
  font-size: 38px;
  font-weight: 900;
  color: #f8fafc;
  letter-spacing: -0.03em;
}

.price-period {
  font-size: 13px;
  color: #94a3b8;
  margin-left: 2px;
}

.price-tax-note {
  display: block;
  font-size: 10px;
  color: #64748b;
  margin-top: 2px;
}

/* Features checklist */
.pricing-features-wrap {
  margin-bottom: 28px;
}

.features-subheading {
  font-size: 12px;
  font-weight: 800;
  color: #38bdf8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 14px;
}

.pricing-features-grid {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
  font-size: 13px;
  color: #cbd5e1;
}

.pricing-features-grid li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.4;
}

.pricing-features-grid li svg {
  flex-shrink: 0;
  margin-top: 3px;
}

.pricing-card-footer {
  text-align: center;
}

.footer-trial-note {
  font-size: 11px;
  color: #64748b;
  margin-top: 10px;
}

/* Assurances row */
.pricing-assurances-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.pricing-assurance-item {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.assurance-icon-wrap {
  font-size: 24px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(56, 189, 248, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.assurance-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.assurance-text strong {
  font-size: 13px;
  color: #f8fafc;
}

.assurance-text span {
  font-size: 11px;
  color: #94a3b8;
}

@media (max-width: 1024px) {
  .pricing-unified-grid {
    grid-template-columns: 1fr;
  }
  .pricing-features-grid {
    grid-template-columns: 1fr;
  }
  .pricing-assurances-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .pricing-assurances-grid {
    grid-template-columns: 1fr;
  }
  .pricing-card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .tier-price-block {
    text-align: left;
  }
}

/* ═══════════════════════════════════════════════════════════
   15. FAQ ACCORDION
═══════════════════════════════════════════════════════════ */
.faq-section {
  padding: 90px 0;
  position: relative;
  z-index: 10;
}

.faq-list {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.faq-card {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 22px 26px;
  cursor: pointer;
  backdrop-filter: blur(20px);
  transition: all 0.2s ease;
}

.faq-card:hover {
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(15, 23, 42, 0.95);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.1);
  transform: translateY(-2px);
}

.faq-card.open {
  border-color: #38bdf8;
  background: rgba(14, 165, 233, 0.08);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(56, 189, 248, 0.15);
}

.faq-question-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.faq-question {
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.4;
}

.faq-card.open .faq-question {
  color: #38bdf8;
}

.faq-toggle-icon {
  font-size: 22px;
  font-weight: 700;
  color: #38bdf8;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(56, 189, 248, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.faq-answer {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 14px;
  line-height: 1.7;
  color: #94a3b8;
}

/* ═══════════════════════════════════════════════════════════
   16. CTA BANNER
═══════════════════════════════════════════════════════════ */
.cta-section {
  padding: 90px 0 110px 0;
  position: relative;
  z-index: 10;
}

.cta-banner {
  position: relative;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(3, 7, 18, 0.98) 50%, rgba(2, 132, 199, 0.2) 100%);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 32px;
  padding: 64px 48px;
  text-align: center;
  overflow: hidden;
  backdrop-filter: blur(28px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.8), 0 0 50px rgba(56, 189, 248, 0.15);
}

.cta-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 300px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

.cta-content {
  position: relative;
  z-index: 2;
  max-width: 720px;
  margin: 0 auto;
}

.cta-top-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 9999px;
  margin-bottom: 20px;
}

.badge-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
  animation: pulseBeacon 1.5s infinite;
}

@keyframes pulseBeacon {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.4); }
}

.cta-title {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 900;
  color: #f8fafc;
  line-height: 1.15;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.cta-subtitle {
  font-size: 16px;
  line-height: 1.6;
  color: #94a3b8;
  margin-bottom: 36px;
}

.cta-btn-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.cta-social-proof-bar {
  font-size: 12px;
  color: #94a3b8;
}

.cta-social-proof-bar strong {
  color: #f8fafc;
}

/* ═══════════════════════════════════════════════════════════
   17. FOOTER
═══════════════════════════════════════════════════════════ */
.footer {
  position: relative;
  z-index: 10;
  background: #030712;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 70px 0 40px 0;
}

.footer-inner {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 48px;
}

.footer-col-brand {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.footer-col-brand .brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-col-brand .brand-logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.footer-desc {
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
  max-width: 300px;
}

.footer-copyright {
  font-size: 12px;
  color: #475569;
  margin-top: 12px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-heading {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #f8fafc;
  margin-bottom: 4px;
}

.footer-col a {
  font-size: 13px;
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.15s ease, transform 0.15s ease;
}

.footer-col a:hover {
  color: #38bdf8;
  transform: translateX(3px);
}

@media (max-width: 1024px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
    gap: 36px;
  }
}

@media (max-width: 640px) {
  .footer-inner {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .cta-banner {
    padding: 40px 24px;
  }
}

@media (max-width: 900px) {
  .tactical-hud-dock { display: none; }
}
</style>
