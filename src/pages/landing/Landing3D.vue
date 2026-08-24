<template>
  <div class="patrol-lp" ref="rootEl">
    <!-- ═══════════════════════════════════════════════════
         3D WEBGL CANVAS (STICKY BACKGROUND)
    ═══════════════════════════════════════════════════ -->
    <div class="canvas-container">
      <canvas ref="canvasEl" class="webgl-canvas" />
      
      <!-- Interactive Camera Mode Selector (Top Left) -->
      <div class="cam-modes-hud">
        <span class="hud-label"><span class="live-pulse"></span> 3D POV</span>
        <button 
          v-for="mode in camModes" 
          :key="mode.id"
          class="cam-btn" 
          :class="{ active: currentCamMode === mode.id }"
          @click="setCamMode(mode.id)"
        >
          <span class="cam-btn-icon" v-html="mode.icon"></span>
          <span>{{ mode.label }}</span>
        </button>
      </div>

      <!-- Live Guard Floating Telemetry HUD (Top Right) -->
      <div class="guard-telemetry-hud" :class="{ 'hud-visible': heroInView || activeStorySection === 0 || activeStorySection === 1 }">
        <div class="telemetry-header">
          <span class="telemetry-badge">
            <span class="radar-ping"></span>
            PATROL IN PROGRESS
          </span>
          <span class="telemetry-time">{{ liveClock }}</span>
        </div>
        <div class="telemetry-body">
          <div class="guard-profile">
            <div class="guard-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <div class="guard-name">Alex Johnson</div>
              <div class="guard-meta">ID: SEC-8492 &bull; Guard Alpha</div>
            </div>
          </div>
          <div class="telemetry-grid">
            <div class="telem-item">
              <span class="telem-lbl">Zone</span>
              <span class="telem-val highlight">{{ currentZoneName }}</span>
            </div>
            <div class="telem-item">
              <span class="telem-lbl">Progress</span>
              <span class="telem-val">{{ checkpointsPassed }} / {{ totalCheckpoints }} Checkpoints</span>
            </div>
            <div class="telem-item">
              <span class="telem-lbl">Pace & GPS</span>
              <span class="telem-val text-green">1.2 m/s &bull; ±0.8m Acc</span>
            </div>
            <div class="telem-item">
              <span class="telem-lbl">Status</span>
              <span class="telem-val text-cyan">On Route (Nominal)</span>
            </div>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" :style="{ width: (checkpointsPassed / totalCheckpoints * 100) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════
         TOP NAVIGATION BAR
    ═══════════════════════════════════════════════════ -->
    <header class="navbar" :class="{ 'navbar-scrolled': isScrolled }">
      <div class="nav-container">
        <a href="#" class="brand-logo" @click.prevent="scrollToSection('hero')">
          <div class="logo-shield">
            <svg width="22" height="24" viewBox="0 0 26 30" fill="none">
              <path d="M13 0L0.5 5V15C0.5 22.5 6.1 29.4 13 30C19.9 29.4 25.5 22.5 25.5 15V5L13 0Z" fill="url(#shieldGrad)"/>
              <path d="M9 15.5L11.8 18.3L17.5 11.5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="shieldGrad" x1="0" y1="0" x2="26" y2="30">
                  <stop offset="0%" stop-color="#38BDF8"/>
                  <stop offset="100%" stop-color="#1B4FD8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="brand-titles">
            <span class="brand-text">AccessEasy <span class="brand-highlight">PATROL</span></span>
            <span class="brand-tagline">Enterprise Security Ops</span>
          </div>
        </a>

        <nav class="nav-links">
          <a href="#tracking" class="nav-link" @click.prevent="scrollToSection('tracking')">Tracking</a>
          <a href="#checkpoints" class="nav-link" @click.prevent="scrollToSection('checkpoints')">Checkpoints</a>
          <a href="#geofencing" class="nav-link" @click.prevent="scrollToSection('geofencing')">Smart Zones</a>
          <a href="#incidents" class="nav-link" @click.prevent="scrollToSection('incidents')">Incidents</a>
          <a href="#command-center" class="nav-link" @click.prevent="scrollToSection('command-center')">Command Center</a>
          <a href="#multisite" class="nav-link" @click.prevent="scrollToSection('multisite')">Multi-Site</a>
          <a href="#mobile-app" class="nav-link" @click.prevent="scrollToSection('mobile-app')">Guard App</a>
        </nav>

        <div class="nav-actions">
          <button class="btn btn-ghost" @click="goToLogin">Login</button>
          <button class="btn btn-primary" @click="goToLogin">
            <span class="btn-shine"></span>
            Start Free Trial
          </button>
        </div>

        <button class="mobile-toggle" :class="{ active: isMobileMenuOpen }" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <span></span><span></span><span></span>
        </button>
      </div>

      <!-- Mobile Dropdown -->
      <Transition name="fade-slide">
        <div v-if="isMobileMenuOpen" class="mobile-dropdown">
          <a href="#tracking" class="mobile-nav-link" @click="isMobileMenuOpen=false; scrollToSection('tracking')">Live Tracking</a>
          <a href="#checkpoints" class="mobile-nav-link" @click="isMobileMenuOpen=false; scrollToSection('checkpoints')">Checkpoints</a>
          <a href="#geofencing" class="mobile-nav-link" @click="isMobileMenuOpen=false; scrollToSection('geofencing')">Smart Zones</a>
          <a href="#incidents" class="mobile-nav-link" @click="isMobileMenuOpen=false; scrollToSection('incidents')">Incident Response</a>
          <a href="#command-center" class="mobile-nav-link" @click="isMobileMenuOpen=false; scrollToSection('command-center')">Command Center</a>
          <a href="#multisite" class="mobile-nav-link" @click="isMobileMenuOpen=false; scrollToSection('multisite')">Multi-Site</a>
          <div class="mobile-nav-cta">
            <button class="btn btn-ghost w-full" @click="goToLogin">Login</button>
            <button class="btn btn-primary w-full" @click="goToLogin">Start Free Trial</button>
          </div>
        </div>
      </Transition>
    </header>

    <!-- ═══════════════════════════════════════════════════
         SCROLLABLE STORY CONTENT CONTAINER
    ═══════════════════════════════════════════════════ -->
    <main class="story-flow">

      <!-- ── SECTION 0: HERO ── -->
      <section id="hero" class="story-section hero-section" data-step="0">
        <div class="section-container">
          <div class="hero-content">
            <div class="eyebrow-pill">
              <span class="eyebrow-dot"></span>
              <span>Next-Gen Security Operations Platform</span>
            </div>
            <h1 class="hero-headline">
              Security Patrol,<br>
              <span class="gradient-text">Reimagined.</span>
            </h1>
            <p class="hero-description">
              Track guards in real-time 3D, verify checkpoint scans with biometric certainty, monitor intelligent geofences, and dispatch incident teams — all from one mission-critical platform.
            </p>
            <div class="hero-cta-group">
              <button class="btn btn-primary btn-xl" @click="goToLogin">
                <span class="btn-shine"></span>
                <span>Start Free Trial</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button class="btn btn-secondary btn-xl" @click="scrollToSection('tracking')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                <span>See How It Works</span>
              </button>
            </div>
            <div class="hero-trust-tag">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>7 Days Free Trial &bull; No Credit Card Required &bull; SOC 2 & ISO 27001 Certified</span>
            </div>

            <!-- Quick Telemetry Strip -->
            <div class="hero-stats-strip">
              <div class="stat-box">
                <span class="stat-number">99.98%</span>
                <span class="stat-label">Patrol Compliance</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">&lt; 15s</span>
                <span class="stat-label">Incident Dispatch</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">0-Loss</span>
                <span class="stat-label">Offline SQLite Sync</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">4-Tier</span>
                <span class="stat-label">GPS Geofencing</span>
              </div>
            </div>
          </div>
        </div>

        <div class="scroll-indicator" @click="scrollToSection('tracking')">
          <div class="mouse-icon"><div class="mouse-wheel"></div></div>
          <span>Scroll to Explore 3D Campus</span>
        </div>
      </section>

      <!-- ── SECTION 1: REAL-TIME GUARD TRACKING ── -->
      <section id="tracking" class="story-section" data-step="1">
        <div class="section-container">
          <div class="story-card glass-panel" :class="{ 'card-active': activeStorySection === 1 }">
            <div class="card-tag">
              <span class="radar-dot"></span>
              <span>SECTION 01 &bull; LIVE TELEMETRY</span>
            </div>
            <h2 class="card-title">Know Where Your Team Is.<br><span class="gradient-text">Every Second.</span></h2>
            <p class="card-desc">
              Continuous high-precision breadcrumb tracking maps each guard's location across multi-level commercial, residential, and industrial complexes with sub-meter accuracy.
            </p>
            <ul class="feature-bullets">
              <li>
                <div class="bullet-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                <span><strong>Live GPS & Indoor Beacon Mesh:</strong> Seamless tracking even when entering basements or shielded concrete zones.</span>
              </li>
              <li>
                <div class="bullet-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                <span><strong>Pace & Route Deviation AI:</strong> Automatically flags loitering, unplanned detours, or sudden cessation of movement.</span>
              </li>
              <li>
                <div class="bullet-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                <span><strong>Dynamic Trail Visualization:</strong> Watch live breadcrumb routes glow and adapt as guards complete their assigned rounds.</span>
              </li>
            </ul>
            <div class="card-footer-metric">
              <span class="metric-val text-cyan">42 Live Guards</span>
              <span class="metric-lbl">Monitored simultaneously across 12 sectors</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── SECTION 2: DIGITAL PATROL ROUNDS & CHECKPOINTS ── -->
      <section id="checkpoints" class="story-section" data-step="2">
        <div class="section-container">
          <div class="story-card glass-panel" :class="{ 'card-active': activeStorySection === 2 }">
            <div class="card-tag">
              <span class="radar-dot green"></span>
              <span>SECTION 02 &bull; PROOF OF PRESENCE</span>
            </div>
            <h2 class="card-title">Verify Every Checkpoint.<br><span class="gradient-text">Zero Compromise.</span></h2>
            <p class="card-desc">
              Replace outdated physical wands with smart NFC tags, encrypted QR codes, and geofenced beacons. Every verification produces a tamper-proof cryptographic audit trail.
            </p>
            
            <!-- Checkpoint Verification Status Board -->
            <div class="checkpoint-status-board">
              <div class="chk-item verified">
                <div class="chk-icon">✓</div>
                <div class="chk-info">
                  <div class="chk-name">Checkpoint 01 — North Perimeter Gate</div>
                  <div class="chk-meta">NFC Tap &bull; 00:14:22 &bull; 100% On-Time</div>
                </div>
                <span class="chk-badge">Verified</span>
              </div>
              <div class="chk-item verified">
                <div class="chk-icon">✓</div>
                <div class="chk-info">
                  <div class="chk-name">Checkpoint 02 — Data Center Server Vault</div>
                  <div class="chk-meta">Biometric QR &bull; 00:18:05 &bull; Dual-Auth</div>
                </div>
                <span class="chk-badge">Verified</span>
              </div>
              <div class="chk-item active">
                <div class="chk-icon pulse">●</div>
                <div class="chk-info">
                  <div class="chk-name">Checkpoint 03 — Executive Tower Lobby</div>
                  <div class="chk-meta">Proximity Scan &bull; Guard Approaching (12m)</div>
                </div>
                <span class="chk-badge pending">Scanning...</span>
              </div>
              <div class="chk-item upcoming">
                <div class="chk-icon">○</div>
                <div class="chk-info">
                  <div class="chk-name">Checkpoint 04 — Loading Dock Sub-Level</div>
                  <div class="chk-meta">Scheduled: 00:25:00 &bull; Est. ETA 4m</div>
                </div>
                <span class="chk-badge queued">Queued</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── SECTION 3: SMART ZONES & GEOFENCING ── -->
      <section id="geofencing" class="story-section" data-step="3">
        <div class="section-container">
          <div class="story-card glass-panel" :class="{ 'card-active': activeStorySection === 3 }">
            <div class="card-tag">
              <span class="radar-dot purple"></span>
              <span>SECTION 03 &bull; INTELLIGENT PERIMETER</span>
            </div>
            <h2 class="card-title">Every Zone. Every Movement.<br><span class="gradient-text">Under Complete Control.</span></h2>
            <p class="card-desc">
              Draw 3D geofenced operational zones in seconds. The system dynamically validates guard positions with 4-tier confidence scoring to prevent GPS spoofing and false alerts.
            </p>

            <div class="zone-matrix">
              <div class="zone-pill safe">
                <span class="zone-color-bar"></span>
                <div>
                  <div class="zone-title">Safe Zone</div>
                  <div class="zone-desc">Lobby, Common Areas, Guard Stations</div>
                </div>
              </div>
              <div class="zone-pill patrol">
                <span class="zone-color-bar"></span>
                <div>
                  <div class="zone-title">Active Patrol Corridor</div>
                  <div class="zone-desc">Perimeter Walkway, Corridors, Stairwells</div>
                </div>
              </div>
              <div class="zone-pill restricted">
                <span class="zone-color-bar"></span>
                <div>
                  <div class="zone-title">Restricted Zone</div>
                  <div class="zone-desc">Server Rooms, Cash Office, Rooftops</div>
                </div>
              </div>
              <div class="zone-pill emergency">
                <span class="zone-color-bar"></span>
                <div>
                  <div class="zone-title">Emergency Zone</div>
                  <div class="zone-desc">Hazard Areas, Fire Exits, Loading Docks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── SECTION 4: INCIDENT MANAGEMENT & DISPATCH ── -->
      <section id="incidents" class="story-section" data-step="4">
        <div class="section-container">
          <div class="story-card glass-panel" :class="{ 'card-active': activeStorySection === 4 }">
            <div class="card-tag">
              <span class="radar-dot amber"></span>
              <span>SECTION 04 &bull; INSTANT RESPONSE</span>
            </div>
            <h2 class="card-title">Incident Detected.<br><span class="gradient-text">Resolved in Minutes.</span></h2>
            <p class="card-desc">
              When an anomaly or breach occurs, the system automatically correlates CCTV feeds, geolocates the nearest guard, and dispatches an emergency action package with turn-by-turn navigation.
            </p>

            <!-- Live Incident Simulation Card -->
            <div class="incident-sim-card">
              <div class="incident-sim-header">
                <div class="inc-alert-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span>CRITICAL ALERT &bull; INC-8041</span>
                </div>
                <span class="inc-time">12s ago</span>
              </div>
              <div class="incident-sim-body">
                <div class="inc-headline">Unauthorized Perimeter Breach / Loitering</div>
                <div class="inc-meta-row">
                  <span><strong>Location:</strong> Parking Area — Zone B (Gate 4)</span>
                  <span><strong>Priority:</strong> High</span>
                </div>
                <div class="incident-workflow-steps">
                  <div class="wf-step completed">
                    <div class="wf-dot">✓</div>
                    <span>AI Detection</span>
                  </div>
                  <div class="wf-step completed">
                    <div class="wf-dot">✓</div>
                    <span>Guard Dispatched</span>
                  </div>
                  <div class="wf-step in-progress">
                    <div class="wf-dot">●</div>
                    <span>Investigating</span>
                  </div>
                  <div class="wf-step">
                    <div class="wf-dot">○</div>
                    <span>Resolution</span>
                  </div>
                </div>
                <div class="inc-assigned-guard">
                  <div class="guard-sm-avatar">AJ</div>
                  <div class="guard-sm-details">
                    <div><strong>Alex Johnson</strong> assigned to investigate</div>
                    <div class="text-cyan">ETA: 45 seconds &bull; Distance: 65 meters</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── SECTION 5: COMMAND CENTER DASHBOARD ── -->
      <section id="command-center" class="story-section" data-step="5">
        <div class="section-container">
          <div class="story-card glass-panel wide" :class="{ 'card-active': activeStorySection === 5 }">
            <div class="card-tag">
              <span class="radar-dot"></span>
              <span>SECTION 05 &bull; COMMAND HUB</span>
            </div>
            <h2 class="card-title">Unified Command Center.<br><span class="gradient-text">Complete Operational Clarity.</span></h2>
            <p class="card-desc">
              All live guard routes, CCTV feeds, access logs, and incident workflows stream into a centralized high-density dashboard built for modern security operations centers (SOC).
            </p>

            <!-- Command Center Glass Metrics Strip -->
            <div class="command-metrics-grid">
              <div class="cmd-metric-box">
                <span class="cmd-num text-cyan">24</span>
                <span class="cmd-lbl">Guards Online</span>
              </div>
              <div class="cmd-metric-box">
                <span class="cmd-num text-green">18</span>
                <span class="cmd-lbl">Patrols Active</span>
              </div>
              <div class="cmd-metric-box">
                <span class="cmd-num text-purple">96</span>
                <span class="cmd-lbl">Checkpoints Verified</span>
              </div>
              <div class="cmd-metric-box">
                <span class="cmd-num text-amber">2</span>
                <span class="cmd-lbl">Open Incidents</span>
              </div>
            </div>

            <!-- Mini Live Event Feed -->
            <div class="event-feed-box">
              <div class="feed-header">LIVE TELEMETRY STREAM</div>
              <div class="feed-item" v-for="evt in liveFeed" :key="evt.id">
                <span class="feed-dot" :class="evt.type"></span>
                <span class="feed-time">{{ evt.time }}</span>
                <span class="feed-text"><strong>{{ evt.actor }}</strong> {{ evt.action }}</span>
                <span class="feed-zone">{{ evt.zone }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── SECTION 6: MULTI-SITE ENTERPRISE ── -->
      <section id="multisite" class="story-section" data-step="6">
        <div class="section-container">
          <div class="story-card glass-panel" :class="{ 'card-active': activeStorySection === 6 }">
            <div class="card-tag">
              <span class="radar-dot"></span>
              <span>SECTION 06 &bull; GLOBAL SCALE</span>
            </div>
            <h2 class="card-title">One Command Center.<br><span class="gradient-text">Every Site Worldwide.</span></h2>
            <p class="card-desc">
              Manage commercial portfolios across cities, countries, and continents. Aggregate multi-facility analytics, standardize guard SOPs, and ensure regulatory compliance effortlessly.
            </p>

            <div class="multisite-locations-grid">
              <div class="site-card" v-for="site in sitesList" :key="site.name">
                <div class="site-header">
                  <div class="site-flag-box">
                    <span class="site-dot"></span>
                    <span class="site-name">{{ site.name }}</span>
                  </div>
                  <span class="site-status-tag">{{ site.status }}</span>
                </div>
                <div class="site-stats">
                  <span>{{ site.guards }} Guards</span> &bull; 
                  <span>{{ site.sitesCount }} Properties</span> &bull; 
                  <span class="text-green">{{ site.compliance }} SLA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── SECTION 7: MOBILE GUARD APP ── -->
      <section id="mobile-app" class="story-section" data-step="7">
        <div class="section-container">
          <div class="story-card glass-panel" :class="{ 'card-active': activeStorySection === 7 }">
            <div class="card-tag">
              <span class="radar-dot green"></span>
              <span>SECTION 07 &bull; GUARD MOBILE APP</span>
            </div>
            <h2 class="card-title">Everything Your Guards Need.<br><span class="gradient-text">In Their Hands.</span></h2>
            <p class="card-desc">
              An intuitive Android & iOS application built specifically for security officers. Zero training required — clear route guidance, rapid NFC tap, photo evidence capture, and 1-touch SOS.
            </p>

            <div class="mobile-features-list">
              <div class="mf-item">
                <div class="mf-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg></div>
                <div>
                  <h4>Turn-by-Turn Patrol Navigation</h4>
                  <p>Guards see dynamic waypoint routes with estimated arrival times and route instructions.</p>
                </div>
              </div>
              <div class="mf-item">
                <div class="mf-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
                <div>
                  <h4>Geotagged Multimedia Evidence</h4>
                  <p>Snap photo and voice notes directly attached to incident reports with immutable timestamps.</p>
                </div>
              </div>
              <div class="mf-item">
                <div class="mf-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                <div>
                  <h4>1-Touch Panic & SOS Distress</h4>
                  <p>Instantly transmits silent distress beacons and opens live audio streaming to central dispatch.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── SECTION 8: OFFLINE-FIRST RELIABILITY ── -->
      <section id="offline" class="story-section" data-step="8">
        <div class="section-container">
          <div class="story-card glass-panel" :class="{ 'card-active': activeStorySection === 8 }">
            <div class="card-tag">
              <span class="radar-dot cyan"></span>
              <span>SECTION 08 &bull; ZERO DATA LOSS</span>
            </div>
            <h2 class="card-title">Patrol Without Losing Data.<br><span class="gradient-text">100% Offline-First.</span></h2>
            <p class="card-desc">
              Basements, parking decks, and remote facilities often lack cellular connectivity. AccessEasy Patrol's local SQLite transactional queue stores scans and syncs automatically when network returns.
            </p>

            <div class="offline-demo-box">
              <div class="offline-flow-step">
                <div class="of-icon alert"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg></div>
                <div class="of-info">
                  <div class="of-title">Connection Lost</div>
                  <div class="of-desc">Guard enters B3 sub-basement server vault</div>
                </div>
              </div>
              <div class="of-arrow">➔</div>
              <div class="offline-flow-step">
                <div class="of-icon buffer"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></div>
                <div class="of-info">
                  <div class="of-title">Local SQLite Queue</div>
                  <div class="of-desc">Scans, photos & timestamps stored securely on device</div>
                </div>
              </div>
              <div class="of-arrow">➔</div>
              <div class="offline-flow-step">
                <div class="of-icon success"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <div class="of-info">
                  <div class="of-title">Synced Successfully ✓</div>
                  <div class="of-desc">Auto-uploaded in exact chronological order</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── SECTION 9: FINAL CTA ── -->
      <section id="final-cta" class="story-section cta-section" data-step="9">
        <div class="section-container">
          <div class="cta-inner-card glass-panel">
            <div class="cta-backdrop-glow"></div>
            <div class="eyebrow-pill">
              <span class="eyebrow-dot"></span>
              <span>Enterprise Security Deployment</span>
            </div>
            <h2 class="cta-headline">
              Take Control of Every Patrol.<br>
              <span class="gradient-text">Starting Today.</span>
            </h2>
            <p class="cta-subhead">
              From real-time GPS tracking to checkpoint verification and automated compliance reporting, give your security officers and clients total peace of mind.
            </p>
            <div class="cta-actions">
              <button class="btn btn-primary btn-xl" @click="goToLogin">
                <span class="btn-shine"></span>
                <span>Start Your 7-Day Free Trial</span>
              </button>
              <button class="btn btn-ghost btn-xl" @click="goToLogin">
                <span>Book a Guided Demo</span>
              </button>
            </div>
            <div class="cta-footer-notes">
              <span>✓ No credit card required</span>
              <span>✓ Instant cloud setup in 5 minutes</span>
              <span>✓ Compatible with any standard smartphone</span>
            </div>
          </div>
        </div>
      </section>

    </main>

    <!-- ═══════════════════════════════════════════════════
         FOOTER
    ═══════════════════════════════════════════════════ -->
    <footer class="footer-wrap">
      <div class="footer-container">
        <div class="footer-brand-col">
          <div class="brand-logo">
            <div class="logo-shield">
              <svg width="20" height="22" viewBox="0 0 26 30" fill="none">
                <path d="M13 0L0.5 5V15C0.5 22.5 6.1 29.4 13 30C19.9 29.4 25.5 22.5 25.5 15V5L13 0Z" fill="url(#ftGrad)"/>
                <path d="M9 15.5L11.8 18.3L17.5 11.5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                <defs><linearGradient id="ftGrad" x1="0" y1="0" x2="26" y2="30"><stop offset="0%" stop-color="#38BDF8"/><stop offset="100%" stop-color="#1B4FD8"/></linearGradient></defs>
              </svg>
            </div>
            <span class="brand-text">AccessEasy <span class="brand-highlight">PATROL</span></span>
          </div>
          <p class="footer-tagline">
            Next-generation enterprise security guard tour, checkpoint verification, and incident management platform.
          </p>
        </div>

        <div class="footer-links-col">
          <h4>Platform</h4>
          <a href="#tracking" @click.prevent="scrollToSection('tracking')">Live GPS Tracking</a>
          <a href="#checkpoints" @click.prevent="scrollToSection('checkpoints')">Checkpoint Scanning</a>
          <a href="#geofencing" @click.prevent="scrollToSection('geofencing')">3D Geofence Matrix</a>
          <a href="#incidents" @click.prevent="scrollToSection('incidents')">Incident Workflow</a>
          <a href="#command-center" @click.prevent="scrollToSection('command-center')">SOC Command Center</a>
        </div>

        <div class="footer-links-col">
          <h4>Integrations</h4>
          <a href="#" @click.prevent>OSDP & Wiegand Access</a>
          <a href="#" @click.prevent>Milestone & Genetec CCTV</a>
          <a href="#" @click.prevent>Hikvision & Dahua VMS</a>
          <a href="#" @click.prevent>SAP & Kronos HRMS</a>
          <a href="#" @click.prevent>RESTful Telemetry API</a>
        </div>

        <div class="footer-links-col">
          <h4>Security & Legal</h4>
          <a href="#" @click.prevent>SOC 2 Type II Certified</a>
          <a href="#" @click.prevent>ISO 27001 Compliance</a>
          <a href="#" @click.prevent>GDPR & Privacy Policy</a>
          <a href="#" @click.prevent>Terms of Service</a>
          <a href="#" @click.prevent>Security Whitepaper</a>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <span>&copy; {{ new Date().getFullYear() }} AccessEasy Security Systems Inc. All rights reserved.</span>
          <div class="footer-status-pill">
            <span class="status-green-dot"></span>
            <span>All Systems Operational &bull; 99.99% Uptime</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'

const router = useRouter()

// UI state refs
const rootEl = ref(null)
const canvasEl = ref(null)
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const heroInView = ref(true)
const activeStorySection = ref(0)
const currentCamMode = ref('follow')
const liveClock = ref('')
const checkpointsPassed = ref(6)
const totalCheckpoints = ref(8)
const currentZoneName = ref('Building A — Ground Floor')

// Camera modes
const camModes = [
  { id: 'follow', label: 'Follow Guard', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
  { id: 'overhead', label: 'Campus Map', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>' },
  { id: 'command', label: 'Command SOC', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
  { id: 'cctv', label: 'CCTV Cam 04', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>' },
]

function setCamMode(id) {
  currentCamMode.value = id
}

// Live feed mockup data
const liveFeed = [
  { id: 1, time: '00:21:14', actor: 'Alex Johnson', action: 'completed Checkpoint 02 (Vault)', zone: 'Zone B', type: 'green' },
  { id: 2, time: '00:20:48', actor: 'CCTV AI-04', action: 'scanned Gate 4 Perimeter (Nominal)', zone: 'Perimeter', type: 'cyan' },
  { id: 3, time: '00:19:30', actor: 'Dispatch SOC', action: 'cleared automated geofence handshake', zone: 'Zone A', type: 'purple' },
  { id: 4, time: '00:18:12', actor: 'Ravi Kumar', action: 'verified NFC tag #849 at South Lobby', zone: 'Zone C', type: 'green' },
]

// Multisite data
const sitesList = [
  { name: 'Site A — Chennai Technology Park', status: 'Optimal', guards: 28, sitesCount: 4, compliance: '99.9%' },
  { name: 'Site B — Bengaluru Corporate Campus', status: 'Optimal', guards: 42, sitesCount: 8, compliance: '99.8%' },
  { name: 'Site C — Hyderabad Innovation Hub', status: 'Optimal', guards: 34, sitesCount: 5, compliance: '100%' },
  { name: 'Site D — Mumbai Financial Center', status: 'Optimal', guards: 56, sitesCount: 11, compliance: '99.7%' },
]

function goToLogin() {
  router.push('/login')
}

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function updateClock() {
  const now = new Date()
  liveClock.value = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ══════════════════════════════════════════════════════════
// THREE.JS 3D ENVIRONMENT ENGINE
// ══════════════════════════════════════════════════════════
let scene, camera, renderer, animFrameId
let campusGroup, guardGroup, pathLine, pathGlowLine, cctvLightCone, radarMesh
let checkpointMeshes = []
let geofenceVolumes = []
let guardCurve, guardProgress = 0
let scrollRatio = 0

// Patrol Waypoints in 3D Space
const routePoints = [
  new THREE.Vector3(-14, 0, -8),
  new THREE.Vector3(-8, 0, -6),
  new THREE.Vector3(-3, 0, -2),
  new THREE.Vector3(2, 0, 1),
  new THREE.Vector3(7, 0, -1),
  new THREE.Vector3(12, 0, 4),
  new THREE.Vector3(15, 0, 9),
  new THREE.Vector3(8, 0, 14),
  new THREE.Vector3(-4, 0, 12),
  new THREE.Vector3(-12, 0, 6),
  new THREE.Vector3(-14, 0, -8),
]

function initThreeScene() {
  const canvas = canvasEl.value
  if (!canvas) return

  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020813)
  scene.fog = new THREE.FogExp2(0x020813, 0.022)

  // Camera setup
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500)
  camera.position.set(-6, 9, 14)
  camera.lookAt(0, 1, 0)

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25

  // Lights
  const ambientLight = new THREE.AmbientLight(0x0e1e38, 2.2)
  scene.add(ambientLight)

  const moonLight = new THREE.DirectionalLight(0x38bdf8, 2.5)
  moonLight.position.set(25, 40, 20)
  moonLight.castShadow = true
  moonLight.shadow.mapSize.width = 2048
  moonLight.shadow.mapSize.height = 2048
  moonLight.shadow.bias = -0.0001
  scene.add(moonLight)

  const cyanFill = new THREE.DirectionalLight(0x1b4fd8, 1.8)
  cyanFill.position.set(-30, 20, -20)
  scene.add(cyanFill)

  // Campus Ground Plane
  const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32)
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x030d1e,
    roughness: 0.85,
    metalness: 0.2,
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // Grid overlay
  const gridHelper = new THREE.GridHelper(140, 70, 0x1e3a8a, 0x0c1e3d)
  gridHelper.position.y = 0.02
  scene.add(gridHelper)

  // Campus Root Container
  campusGroup = new THREE.Group()
  scene.add(campusGroup)

  // ── BUILD 3D CAMPUS ASSETS ──
  buildCampusArchitecture()
  buildPatrolRouteSpline()
  buildCheckpoints()
  buildGeofenceVolumes()
  buildCCTVTower()
  buildGuardCharacter()
  buildAmbientParticles()

  // Start Animation Loop
  animate()
}

// ── 1. PROCEDURAL MODERN CAMPUS BUILDINGS ──
function buildCampusArchitecture() {
  const buildingMatDark = new THREE.MeshStandardMaterial({
    color: 0x0a192f,
    roughness: 0.4,
    metalness: 0.6,
  })
  const buildingMatGlass = new THREE.MeshStandardMaterial({
    color: 0x172a45,
    roughness: 0.1,
    metalness: 0.9,
    emissive: 0x0d2847,
    emissiveIntensity: 0.35,
  })
  const windowLitMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.6,
  })
  const borderLineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 })

  const buildings = [
    // Main Executive Tower
    { x: -10, z: -14, w: 9, d: 8, h: 16, name: 'Tower A' },
    // Data Center & Tech Hub
    { x: 8, z: -12, w: 10, d: 7, h: 11, name: 'Tech Hub' },
    // Logistics & Operations Center
    { x: 16, z: 2, w: 7, d: 9, h: 8, name: 'Logistics' },
    // Gatehouse Security HQ
    { x: -16, z: 2, w: 5, d: 5, h: 4, name: 'HQ Gatehouse' },
    // South Wing Annex
    { x: -6, z: 16, w: 8, d: 6, h: 7, name: 'South Wing' },
    // Parking Deck / Substructure
    { x: 10, z: 15, w: 11, d: 8, h: 3.5, name: 'Parking Deck' },
  ]

  buildings.forEach(b => {
    const geo = new THREE.BoxGeometry(b.w, b.h, b.d)
    const mesh = new THREE.Mesh(geo, Math.random() > 0.5 ? buildingMatDark : buildingMatGlass)
    mesh.position.set(b.x, b.h / 2, b.z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    campusGroup.add(mesh)

    // Wireframe edge highlight
    const edges = new THREE.EdgesGeometry(geo)
    const line = new THREE.LineSegments(edges, borderLineMat)
    line.position.copy(mesh.position)
    campusGroup.add(line)

    // Lit window accents
    for (let wy = 2; wy < b.h - 1; wy += 2.5) {
      const winGeo = new THREE.BoxGeometry(b.w * 0.75, 0.35, b.d + 0.05)
      const winMesh = new THREE.Mesh(winGeo, windowLitMat)
      winMesh.position.set(b.x, wy, b.z)
      campusGroup.add(winMesh)
    }

    // Rooftop beacon / antenna
    const antGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8)
    const antMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    const ant = new THREE.Mesh(antGeo, antMat)
    ant.position.set(b.x, b.h + 1.25, b.z)
    campusGroup.add(ant)
  })

  // Roads / Asphalt Pathways
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x051329, roughness: 0.9 })
  const mainRoadGeo = new THREE.PlaneGeometry(120, 6)
  const mainRoad = new THREE.Mesh(mainRoadGeo, roadMat)
  mainRoad.rotation.x = -Math.PI / 2
  mainRoad.position.set(0, 0.03, 0)
  campusGroup.add(mainRoad)

  const crossRoadGeo = new THREE.PlaneGeometry(6, 120)
  const crossRoad = new THREE.Mesh(crossRoadGeo, roadMat)
  crossRoad.rotation.x = -Math.PI / 2
  crossRoad.position.set(0, 0.03, 0)
  campusGroup.add(crossRoad)
}

// ── 2. GLOWING PATROL ROUTE SPLINE ──
function buildPatrolRouteSpline() {
  guardCurve = new THREE.CatmullRomCurve3(routePoints, true)
  const splinePoints = guardCurve.getPoints(200)

  const splineGeo = new THREE.BufferGeometry().setFromPoints(splinePoints)
  const splineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    linewidth: 3,
    transparent: true,
    opacity: 0.85,
  })
  pathLine = new THREE.Line(splineGeo, splineMat)
  pathLine.position.y = 0.12
  campusGroup.add(pathLine)

  // Floating dashed trail
  const dashMat = new THREE.LineDashedMaterial({
    color: 0x60a5fa,
    dashSize: 0.8,
    gapSize: 0.4,
    transparent: true,
    opacity: 0.6,
  })
  pathGlowLine = new THREE.Line(splineGeo, dashMat)
  pathGlowLine.computeLineDistances()
  pathGlowLine.position.y = 0.22
  campusGroup.add(pathGlowLine)
}

// ── 3. CHECKPOINTS WITH HOLOGRAPHIC SCAN RINGS ──
function buildCheckpoints() {
  const chkPointsLoc = [
    { pos: new THREE.Vector3(-14, 0, -8), label: 'CP 01 Gate' },
    { pos: new THREE.Vector3(-3, 0, -2), label: 'CP 02 Tech Vault' },
    { pos: new THREE.Vector3(7, 0, -1), label: 'CP 03 Exec Lobby' },
    { pos: new THREE.Vector3(15, 0, 9), label: 'CP 04 Loading Dock' },
    { pos: new THREE.Vector3(8, 0, 14), label: 'CP 05 Parking Deck' },
    { pos: new THREE.Vector3(-12, 0, 6), label: 'CP 06 West Wing' },
  ]

  chkPointsLoc.forEach((cp, idx) => {
    const cpGroup = new THREE.Group()
    cpGroup.position.copy(cp.pos)

    // Pedestal
    const pedGeo = new THREE.CylinderGeometry(0.3, 0.45, 1.2, 16)
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x0f274a, metalness: 0.8, roughness: 0.2 })
    const ped = new THREE.Mesh(pedGeo, pedMat)
    ped.position.y = 0.6
    ped.castShadow = true
    cpGroup.add(ped)

    // Holographic Pulsing Gem
    const gemGeo = new THREE.OctahedronGeometry(0.28, 0)
    const gemMat = new THREE.MeshBasicMaterial({ color: idx < 3 ? 0x22c55e : 0x38bdf8, wireframe: true })
    const gem = new THREE.Mesh(gemGeo, gemMat)
    gem.position.y = 1.45
    cpGroup.add(gem)

    // Ground Scanning Ring
    const ringGeo = new THREE.RingGeometry(0.6, 0.85, 32)
    const ringMat = new THREE.MeshBasicMaterial({
      color: idx < 3 ? 0x22c55e : 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.08
    cpGroup.add(ring)

    checkpointMeshes.push({ group: cpGroup, gem, ring, verified: idx < 3 })
    campusGroup.add(cpGroup)
  })
}

// ── 4. GEOFENCE 3D HOLOGRAPHIC BOUNDARIES ──
function buildGeofenceVolumes() {
  const zones = [
    { x: -10, z: -10, r: 8, h: 4, color: 0x22c55e, name: 'Safe Zone' },
    { x: 8, z: -8, r: 7, h: 4, color: 0x38bdf8, name: 'Patrol Zone' },
    { x: 12, z: 12, r: 6.5, h: 3.5, color: 0xf59e0b, name: 'Restricted Zone' },
    { x: -12, z: 4, r: 6, h: 3.5, color: 0xef4444, name: 'Emergency Zone' },
  ]

  zones.forEach(z => {
    const geo = new THREE.CylinderGeometry(z.r, z.r, z.h, 32, 1, true)
    const mat = new THREE.MeshBasicMaterial({
      color: z.color,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(z.x, z.h / 2, z.z)
    campusGroup.add(mesh)

    // Top border ring
    const topRingGeo = new THREE.RingGeometry(z.r - 0.1, z.r + 0.1, 48)
    const topRingMat = new THREE.MeshBasicMaterial({ color: z.color, side: THREE.DoubleSide, transparent: true, opacity: 0.4 })
    const topRing = new THREE.Mesh(topRingGeo, topRingMat)
    topRing.rotation.x = -Math.PI / 2
    topRing.position.set(z.x, z.h, z.z)
    campusGroup.add(topRing)

    geofenceVolumes.push({ mesh, topRing, baseY: z.h / 2 })
  })
}

// ── 5. CCTV TOWER WITH ROTATING LIGHT CONE ──
function buildCCTVTower() {
  const towerGeo = new THREE.CylinderGeometry(0.15, 0.3, 6, 8)
  const towerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
  const tower = new THREE.Mesh(towerGeo, towerMat)
  tower.position.set(0, 3, 0)
  campusGroup.add(tower)

  // Camera Housing
  const camHead = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }))
  camHead.position.set(0, 6, 0)
  campusGroup.add(camHead)

  // CCTV Vision Cone
  const coneGeo = new THREE.ConeGeometry(3.5, 7, 32, 1, true)
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  })
  cctvLightCone = new THREE.Mesh(coneGeo, coneMat)
  cctvLightCone.position.set(0, 2.8, 0)
  cctvLightCone.rotation.x = Math.PI / 6
  campusGroup.add(cctvLightCone)
}

// ── 6. ULTRA-PREMIUM STYLIZED 3D SECURITY GUARD ──
let guardLeftLeg, guardRightLeg, guardLeftArm, guardRightArm, guardPhoneMesh, radarMeshInner, radarMeshOuter, bodycamLed, flashlightBeam

function buildGuardCharacter() {
  guardGroup = new THREE.Group()

  // Premium Shading Materials
  const uniformDark = new THREE.MeshStandardMaterial({ color: 0x0b1526, roughness: 0.45, metalness: 0.25 })
  const vestMat = new THREE.MeshStandardMaterial({ color: 0x173158, roughness: 0.35, metalness: 0.4 })
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x050a14, roughness: 0.2, metalness: 0.85 })
  const buckleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.9 })
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5cfc2, roughness: 0.5, metalness: 0.05 })
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
  const capMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.3 })
  const capVisorMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.1, metalness: 0.9 })
  const bootMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.25, metalness: 0.6 })
  const phoneBodyMat = new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.15, metalness: 0.95 })
  const phoneScreenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })

  // ── 1. TORSO & TACTICAL PATROL VEST ──
  const torsoGroup = new THREE.Group()

  // Main Tapered Torso Body
  const torsoGeo = new THREE.CylinderGeometry(0.24, 0.21, 0.64, 16)
  const torso = new THREE.Mesh(torsoGeo, uniformDark)
  torso.position.y = 1.08
  torso.scale.set(1.15, 1, 0.75)
  torso.castShadow = true
  torsoGroup.add(torso)

  // Tactical Armored Vest Over Torso
  const vestGeo = new THREE.CylinderGeometry(0.26, 0.23, 0.48, 16)
  const vest = new THREE.Mesh(vestGeo, vestMat)
  vest.position.y = 1.14
  vest.scale.set(1.18, 1, 0.8)
  vest.castShadow = true
  torsoGroup.add(vest)

  // Collar Trim
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.035, 8, 16), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.4 }))
  collar.rotation.x = Math.PI / 2
  collar.position.set(0, 1.42, 0)
  torsoGroup.add(collar)

  // Smart Holographic Security Badge (Chest Left)
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.065, 0.015), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 }))
  badge.position.set(0.14, 1.22, 0.175)
  torsoGroup.add(badge)

  // Tactical Bodycam with Blinking LED (Chest Right)
  const bodycam = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.03), new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.8 }))
  bodycam.position.set(-0.13, 1.22, 0.17)
  torsoGroup.add(bodycam)

  bodycamLed = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22c55e }))
  bodycamLed.position.set(-0.13, 1.24, 0.19)
  torsoGroup.add(bodycamLed)

  // Shoulder Epaulets / Patrol Ranks
  const epauletGeo = new THREE.BoxGeometry(0.1, 0.03, 0.18)
  const epauletMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
  const epauletL = new THREE.Mesh(epauletGeo, epauletMat)
  epauletL.position.set(-0.27, 1.38, 0)
  torsoGroup.add(epauletL)

  const epauletR = new THREE.Mesh(epauletGeo, epauletMat)
  epauletR.position.set(0.27, 1.38, 0)
  torsoGroup.add(epauletR)

  // Duty Belt with Metallic Cyan Buckle
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.08, 16), beltMat)
  belt.position.y = 0.76
  belt.scale.set(1.15, 1, 0.78)
  torsoGroup.add(belt)

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), buckleMat)
  buckle.position.set(0, 0.76, 0.18)
  torsoGroup.add(buckle)

  // Holstered Radio with Flexible Antenna
  const radio = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.06), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }))
  radio.position.set(-0.25, 0.8, 0.04)
  torsoGroup.add(radio)

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6), new THREE.MeshBasicMaterial({ color: 0x64748b }))
  antenna.position.set(-0.25, 0.94, 0.04)
  torsoGroup.add(antenna)

  guardGroup.add(torsoGroup)

  // ── 2. HEAD, HAIR & SECURITY PATROL CAP ──
  const headGroup = new THREE.Group()
  headGroup.position.set(0, 1.58, 0)

  // Stylized Smooth Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), skinMat)
  head.scale.set(0.95, 1.05, 0.95)
  head.castShadow = true
  headGroup.add(head)

  // Stylized Hair
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.165, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), hairMat)
  hair.position.y = 0.02
  hair.rotation.x = -0.15
  headGroup.add(hair)

  // Security Peaked Patrol Cap
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.19, 0.09, 20), capMat)
  cap.position.y = 0.11
  headGroup.add(cap)

  // Cap Visor with glossy finish
  const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.02, 16, 1, false, 0, Math.PI), capVisorMat)
  visor.position.set(0, 0.07, 0.08)
  visor.rotation.x = 0.25
  headGroup.add(visor)

  // Metallic Shield Emblem on Cap
  const emblem = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.05, 4), new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9 }))
  emblem.position.set(0, 0.12, 0.18)
  emblem.rotation.x = Math.PI / 2
  headGroup.add(emblem)

  guardGroup.add(headGroup)

  // ── 3. LEGS & COMBAT BOOTS ──
  const legGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.62, 12)
  const bootFootGeo = new THREE.BoxGeometry(0.13, 0.1, 0.2)

  // Left Leg
  guardLeftLeg = new THREE.Group()
  const legL = new THREE.Mesh(legGeo, uniformDark)
  legL.position.y = 0.32
  legL.castShadow = true
  guardLeftLeg.add(legL)

  const bootL = new THREE.Mesh(bootFootGeo, bootMat)
  bootL.position.set(0, 0.05, 0.04)
  bootL.castShadow = true
  guardLeftLeg.add(bootL)

  guardLeftLeg.position.set(-0.13, 0.08, 0)
  guardGroup.add(guardLeftLeg)

  // Right Leg
  guardRightLeg = new THREE.Group()
  const legR = new THREE.Mesh(legGeo, uniformDark)
  legR.position.y = 0.32
  legR.castShadow = true
  guardRightLeg.add(legR)

  const bootR = new THREE.Mesh(bootFootGeo, bootMat)
  bootR.position.set(0, 0.05, 0.04)
  bootR.castShadow = true
  guardRightLeg.add(bootR)

  guardRightLeg.position.set(0.13, 0.08, 0)
  guardGroup.add(guardRightLeg)

  // ── 4. ARMS & SMARTPHONE IN HAND ──
  const armGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.6, 12)

  // Left Arm (Natural swing)
  guardLeftArm = new THREE.Mesh(armGeo, uniformDark)
  guardLeftArm.position.set(-0.32, 1.05, 0)
  guardLeftArm.castShadow = true
  guardGroup.add(guardLeftArm)

  // Right Arm Holding Modern Smartphone
  guardRightArm = new THREE.Group()
  guardRightArm.position.set(0.3, 1.35, 0)

  // Upper Arm
  const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.32, 12), uniformDark)
  rUpperArm.position.set(0, -0.15, 0.08)
  rUpperArm.rotation.x = -Math.PI / 4.8
  guardRightArm.add(rUpperArm)

  // Forearm angled up
  const rForeArm = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.3, 12), uniformDark)
  rForeArm.position.set(0, -0.24, 0.25)
  rForeArm.rotation.x = -Math.PI / 2.6
  guardRightArm.add(rForeArm)

  // Hand
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), skinMat)
  rHand.position.set(0, -0.26, 0.38)
  guardRightArm.add(rHand)

  // ── AccessEasy Guard Smartphone Model ──
  guardPhoneMesh = new THREE.Group()
  guardPhoneMesh.position.set(0, -0.24, 0.42)
  guardPhoneMesh.rotation.x = -Math.PI / 5.5

  // Beveled Smartphone Body
  const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.015), phoneBodyMat)
  phoneBody.castShadow = true
  guardPhoneMesh.add(phoneBody)

  // Glowing High-Tech Touchscreen
  const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.105, 0.2), phoneScreenMat)
  phoneScreen.position.z = 0.009
  guardPhoneMesh.add(phoneScreen)

  // Soft Holographic Forward Scanner Cone
  const coneGeo = new THREE.ConeGeometry(0.5, 2.4, 24, 1, true)
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })
  flashlightBeam = new THREE.Mesh(coneGeo, coneMat)
  flashlightBeam.rotation.x = Math.PI / 2
  flashlightBeam.position.set(0, 0, 1.2)
  guardPhoneMesh.add(flashlightBeam)

  // Dynamic Point Light cast from Smartphone onto Guard & Ground
  const phoneGlowLight = new THREE.PointLight(0x38bdf8, 3.2, 4.5)
  phoneGlowLight.position.set(0, 0, 0.25)
  guardPhoneMesh.add(phoneGlowLight)

  guardRightArm.add(guardPhoneMesh)
  guardGroup.add(guardRightArm)

  // ── 5. HOLOGRAPHIC DUAL-RING RADAR FOOTPRINT ──
  const radarGroup = new THREE.Group()
  radarGroup.position.y = 0.04

  const ringGeo1 = new THREE.RingGeometry(0.35, 0.42, 32)
  const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
  radarMeshInner = new THREE.Mesh(ringGeo1, ringMat1)
  radarMeshInner.rotation.x = -Math.PI / 2
  radarGroup.add(radarMeshInner)

  const ringGeo2 = new THREE.RingGeometry(0.8, 0.86, 32)
  const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.25 })
  radarMeshOuter = new THREE.Mesh(ringGeo2, ringMat2)
  radarMeshOuter.rotation.x = -Math.PI / 2
  radarGroup.add(radarMeshOuter)

  guardGroup.add(radarGroup)

  scene.add(guardGroup)
}

// ── 7. AMBIENT SECURITY FLOATING PARTICLES ──
let particlePoints

function buildAmbientParticles() {
  const pCount = 1200
  const posArray = new Float32Array(pCount * 3)
  const colorArray = new Float32Array(pCount * 3)

  for (let i = 0; i < pCount; i++) {
    posArray[i * 3] = (Math.random() - 0.5) * 80
    posArray[i * 3 + 1] = Math.random() * 25 + 0.5
    posArray[i * 3 + 2] = (Math.random() - 0.5) * 80

    colorArray[i * 3] = 0.22 + Math.random() * 0.1
    colorArray[i * 3 + 1] = 0.74 + Math.random() * 0.2
    colorArray[i * 3 + 2] = 0.97
  }

  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  pGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))

  const pMat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
  })
  particlePoints = new THREE.Points(pGeo, pMat)
  scene.add(particlePoints)
}

// ══════════════════════════════════════════════════════════
// ANIMATION & SCROLL SYNC ENGINE
// ══════════════════════════════════════════════════════════
let clock = new THREE.Clock()

function animate() {
  animFrameId = requestAnimationFrame(animate)

  const elapsedTime = clock.getElapsedTime()

  // 1. Move Guard along Spline Path
  if (guardCurve && guardGroup) {
    guardProgress = (elapsedTime * 0.02 + scrollRatio * 0.85) % 1
    const currentPos = guardCurve.getPointAt(guardProgress)
    const nextPos = guardCurve.getPointAt((guardProgress + 0.01) % 1)

    guardGroup.position.copy(currentPos)
    guardGroup.lookAt(nextPos.x, guardGroup.position.y, nextPos.z)

    // Guard Walking Gait Animation
    const walkFreq = 8
    const swing = Math.sin(elapsedTime * walkFreq) * 0.35
    if (guardLeftLeg && guardRightLeg) {
      guardLeftLeg.rotation.x = swing
      guardRightLeg.rotation.x = -swing
    }
    if (guardLeftArm) {
      guardLeftArm.rotation.x = -swing
    }
    if (guardRightArm) {
      guardRightArm.rotation.x = swing * 0.15 // Hand with phone holds steady
    }

    // Radar dual-ring expansion pulse
    if (radarMeshInner && radarMeshOuter) {
      const pulse = (elapsedTime * 1.6) % 1
      radarMeshOuter.scale.set(1 + pulse * 0.8, 1 + pulse * 0.8, 1)
      radarMeshOuter.material.opacity = Math.max(0, 0.45 - pulse * 0.4)
      radarMeshInner.rotation.z = elapsedTime * 0.8
    }
    if (bodycamLed) {
      bodycamLed.material.color.setHex(Math.sin(elapsedTime * 4) > 0 ? 0x22c55e : 0x059669)
    }

    // Update zone status dynamically based on guard coordinate
    if (currentPos.x < -5 && currentPos.z < 0) {
      currentZoneName.value = 'Safe Zone — Sector A'
    } else if (currentPos.x >= 0 && currentPos.z < 5) {
      currentZoneName.value = 'Active Patrol — Tech Hub'
    } else if (currentPos.z >= 8) {
      currentZoneName.value = 'Restricted — Loading Bay'
    } else {
      currentZoneName.value = 'Perimeter Gate 04'
    }
  }

  // 2. Animate Checkpoint holographic items
  checkpointMeshes.forEach((cp, i) => {
    cp.gem.rotation.y = elapsedTime * 1.5 + i
    cp.gem.rotation.x = Math.sin(elapsedTime + i) * 0.5
    cp.gem.position.y = 1.45 + Math.sin(elapsedTime * 2 + i) * 0.1
    cp.ring.scale.setScalar(1 + Math.sin(elapsedTime * 3 + i) * 0.08)
  })

  // 3. Animate Geofence Volumes
  geofenceVolumes.forEach((g, idx) => {
    g.mesh.material.opacity = 0.1 + Math.sin(elapsedTime * 2 + idx) * 0.04
    g.topRing.position.y = g.baseY * 2 + Math.sin(elapsedTime * 1.5 + idx) * 0.08
  })

  // 4. Rotate CCTV Cone
  if (cctvLightCone) {
    cctvLightCone.rotation.y = Math.sin(elapsedTime * 0.6) * (Math.PI / 3)
  }

  // 5. Particles slow drift
  if (particlePoints) {
    particlePoints.rotation.y = elapsedTime * 0.015
  }

  // 6. Camera Orbit / Mode Controller
  updateCameraPosition(elapsedTime)

  renderer.render(scene, camera)
}

function updateCameraPosition(time) {
  if (!guardGroup) return

  const targetCamPos = new THREE.Vector3()
  const targetLookAt = new THREE.Vector3()

  if (currentCamMode.value === 'follow') {
    const guardPos = guardGroup.position
    const scrollAngle = scrollRatio * Math.PI * 1.5
    targetCamPos.set(
      guardPos.x + Math.sin(scrollAngle) * 8,
      guardPos.y + 4.5 + Math.sin(scrollRatio * Math.PI) * 2,
      guardPos.z + Math.cos(scrollAngle) * 8
    )
    targetLookAt.set(guardPos.x, guardPos.y + 1.2, guardPos.z)
  } else if (currentCamMode.value === 'overhead') {
    targetCamPos.set(0, 36, 12)
    targetLookAt.set(0, 0, 0)
  } else if (currentCamMode.value === 'command') {
    targetCamPos.set(16, 18, 22)
    targetLookAt.set(2, 2, 2)
  } else if (currentCamMode.value === 'cctv') {
    targetCamPos.set(0, 6.5, 0.5)
    targetLookAt.copy(guardGroup.position)
  }

  camera.position.lerp(targetCamPos, 0.04)
  
  const currentLookAt = new THREE.Vector3()
  camera.getWorldDirection(currentLookAt)
  const currentLookTarget = camera.position.clone().add(currentLookAt)
  currentLookTarget.lerp(targetLookAt, 0.04)
  camera.lookAt(currentLookTarget)
}

// ══════════════════════════════════════════════════════════
// SCROLL LISTENER & INTERSECTION OBSERVER
// ══════════════════════════════════════════════════════════
function handleScroll() {
  const scrollY = window.scrollY
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  scrollRatio = Math.min(1, Math.max(0, scrollY / (maxScroll || 1)))
  isScrolled.value = scrollY > 60

  const sections = document.querySelectorAll('.story-section')
  sections.forEach((sec, idx) => {
    const rect = sec.getBoundingClientRect()
    if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.45) {
      activeStorySection.value = idx
      heroInView.value = idx === 0
    }
  })
}

function handleResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

let clockInterval

onMounted(() => {
  initThreeScene()
  updateClock()
  clockInterval = setInterval(updateClock, 1000)

  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrameId)
  clearInterval(clockInterval)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  renderer?.dispose()
})
</script>

<style scoped>
/* ─── TOKENS & CSS VARIABLES ─── */
.patrol-lp {
  --navy-950: #010611;
  --navy-900: #040c1a;
  --navy-800: #08162b;
  --navy-700: #0c1e3d;
  --blue-500: #1b4fd8;
  --blue-400: #2563eb;
  --cyan-400: #38bdf8;
  --purple-500: #7c3aed;
  --green-500: #22c55e;
  --amber-500: #f59e0b;
  --red-500: #ef4444;
  --text-pure: #ffffff;
  --text-main: #f0f6ff;
  --text-muted: #94a3b8;
  --text-dim: #64748b;
  --glass-bg: rgba(6, 14, 30, 0.72);
  --glass-border: rgba(56, 189, 248, 0.22);
  --glass-glow: rgba(27, 79, 216, 0.25);
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--navy-950);
  color: var(--text-main);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* ─── STICKY 3D BACKGROUND CANVAS ─── */
.canvas-container {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  pointer-events: auto;
}
.webgl-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* ─── 3D HUD CAMERA MODE SELECTOR ─── */
.cam-modes-hud {
  position: absolute;
  top: 6rem;
  left: 2rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(4, 12, 26, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  padding: 0.35rem 0.6rem;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}
.hud-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--cyan-400);
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding-right: 0.4rem;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}
.live-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cyan-400);
  box-shadow: 0 0 8px var(--cyan-400);
  animation: pulse-dot 1.8s infinite;
}
.cam-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.cam-btn:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.06);
}
.cam-btn.active {
  color: #fff;
  background: linear-gradient(135deg, var(--blue-500), var(--cyan-400));
  border-color: rgba(56, 189, 248, 0.4);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
}

/* ─── LIVE GUARD TELEMETRY FLOATING HUD ─── */
.guard-telemetry-hud {
  position: absolute;
  top: 6rem;
  right: 2rem;
  z-index: 10;
  width: 320px;
  background: rgba(4, 12, 28, 0.88);
  backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.08);
  padding: 1.1rem;
  transform: translateY(-20px);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
.guard-telemetry-hud.hud-visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}
.telemetry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.telemetry-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--cyan-400);
}
.radar-ping {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
  animation: pulse-dot 1.5s infinite;
}
.telemetry-time {
  font-size: 0.72rem;
  font-family: 'Courier New', monospace;
  color: var(--text-dim);
  font-weight: 700;
}
.guard-profile {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.85rem;
}
.guard-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--blue-500), var(--cyan-400));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.guard-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-pure);
}
.guard-meta {
  font-size: 0.7rem;
  color: var(--text-dim);
}
.telemetry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 0.65rem;
  margin-bottom: 0.85rem;
}
.telem-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.telem-lbl {
  font-size: 0.65rem;
  color: var(--text-dim);
  font-weight: 600;
  text-transform: uppercase;
}
.telem-val {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-main);
}
.telem-val.highlight {
  color: var(--cyan-400);
}
.progress-bar-wrap {
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 100px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--blue-500), var(--cyan-400));
  transition: width 0.3s ease;
}

/* ─── NAVBAR ─── */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1.25rem 0;
  transition: all 0.3s ease;
}
.navbar-scrolled {
  background: rgba(1, 6, 17, 0.92);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  padding: 0.85rem 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
}
.nav-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
}
.logo-shield {
  width: 36px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 10px;
}
.brand-titles {
  display: flex;
  flex-direction: column;
}
.brand-text {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-pure);
  letter-spacing: -0.02em;
}
.brand-highlight {
  color: var(--cyan-400);
}
.brand-tagline {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-dim);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.nav-link {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.nav-link:hover {
  color: var(--text-pure);
  background: rgba(255, 255, 255, 0.05);
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* ─── BUTTONS ─── */
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.55rem 1.25rem;
  font-size: 0.88rem;
  font-weight: 700;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.25s ease;
  white-space: nowrap;
}
.btn-primary {
  background: linear-gradient(135deg, var(--blue-500), #2563eb 50%, var(--cyan-400));
  color: #fff;
  box-shadow: 0 4px 20px rgba(27, 79, 216, 0.4);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(27, 79, 216, 0.6), 0 0 0 1px rgba(56, 189, 248, 0.4);
}
.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-main);
  backdrop-filter: blur(12px);
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-ghost:hover {
  color: var(--text-pure);
  background: rgba(255, 255, 255, 0.05);
}
.btn-xl {
  padding: 0.85rem 1.85rem;
  font-size: 1rem;
  border-radius: 12px;
}
.btn-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.25) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}
.btn:hover .btn-shine {
  transform: translateX(100%);
}

/* ─── STORYTELLING SECTIONS ─── */
.story-flow {
  position: relative;
  z-index: 2;
  pointer-events: none;
}
.story-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 8rem 0;
  pointer-events: none;
}
.section-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
  pointer-events: auto;
}

/* Hero Content */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
}
.hero-content {
  max-width: 680px;
}
.eyebrow-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cyan-400);
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 0.4rem 0.95rem;
  border-radius: 100px;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(12px);
}
.eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cyan-400);
  box-shadow: 0 0 8px var(--cyan-400);
}
.hero-headline {
  font-size: clamp(2.8rem, 5vw, 4.4rem);
  font-weight: 900;
  line-height: 1.06;
  letter-spacing: -0.04em;
  color: var(--text-pure);
  margin-bottom: 1.25rem;
}
.gradient-text {
  background: linear-gradient(135deg, var(--cyan-400), #60a5fa 50%, var(--blue-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-description {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--text-muted);
  margin-bottom: 2.2rem;
  max-width: 580px;
}
.hero-cta-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.hero-trust-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-dim);
  font-weight: 600;
  margin-bottom: 3rem;
}
.hero-stats-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  padding: 1.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.stat-box {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.stat-number {
  font-size: 1.55rem;
  font-weight: 900;
  color: var(--text-pure);
  letter-spacing: -0.02em;
}
.stat-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Scroll Mouse Indicator */
.scroll-indicator {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-dim);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  animation: bounce 2.5s infinite;
  pointer-events: auto;
}
.mouse-icon {
  width: 20px;
  height: 32px;
  border: 2px solid var(--text-dim);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  padding-top: 5px;
}
.mouse-wheel {
  width: 3px;
  height: 6px;
  background: var(--cyan-400);
  border-radius: 2px;
  animation: scroll-wheel 1.6s infinite;
}

/* ─── GLASS STORY CARD ─── */
.story-card {
  max-width: 560px;
  background: rgba(4, 11, 24, 0.88);
  backdrop-filter: blur(28px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), 0 0 40px rgba(56, 189, 248, 0.08);
  opacity: 0.85;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.story-card.wide {
  max-width: 780px;
}
.story-card.card-active {
  opacity: 1;
  transform: translateY(0);
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.75), 0 0 50px rgba(56, 189, 248, 0.15);
}
.card-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--cyan-400);
  margin-bottom: 1rem;
}
.radar-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cyan-400);
  box-shadow: 0 0 8px var(--cyan-400);
}
.radar-dot.green { background: var(--green-500); box-shadow: 0 0 8px var(--green-500); }
.radar-dot.purple { background: var(--purple-500); box-shadow: 0 0 8px var(--purple-500); }
.radar-dot.amber { background: var(--amber-500); box-shadow: 0 0 8px var(--amber-500); }
.card-title {
  font-size: clamp(1.8rem, 3.2vw, 2.5rem);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: var(--text-pure);
  margin-bottom: 1rem;
}
.card-desc {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-muted);
  margin-bottom: 1.75rem;
}

/* Feature Bullets */
.feature-bullets {
  list-style: none;
  padding: 0;
  margin: 0 0 1.75rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.feature-bullets li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.5;
}
.feature-bullets strong {
  color: var(--text-main);
}
.bullet-icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(56, 189, 248, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.card-footer-metric {
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}
.metric-val {
  font-size: 1.1rem;
  font-weight: 800;
}
.metric-lbl {
  font-size: 0.8rem;
  color: var(--text-dim);
}

/* ─── SECTION 2: CHECKPOINTS STATUS BOARD ─── */
.checkpoint-status-board {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.chk-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}
.chk-item.verified {
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.04);
}
.chk-item.active {
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.08);
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.1);
}
.chk-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 900;
}
.chk-item.verified .chk-icon { background: rgba(34, 197, 94, 0.2); color: var(--green-500); }
.chk-item.active .chk-icon { background: rgba(56, 189, 248, 0.2); color: var(--cyan-400); }
.chk-item.upcoming .chk-icon { background: rgba(255, 255, 255, 0.08); color: var(--text-dim); }
.chk-info {
  flex: 1;
}
.chk-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-pure);
}
.chk-meta {
  font-size: 0.72rem;
  color: var(--text-dim);
}
.chk-badge {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  text-transform: uppercase;
}
.chk-item.verified .chk-badge { background: rgba(34, 197, 94, 0.15); color: var(--green-500); }
.chk-item.active .chk-badge { background: rgba(56, 189, 248, 0.15); color: var(--cyan-400); }
.chk-item.upcoming .chk-badge { background: rgba(255, 255, 255, 0.05); color: var(--text-dim); }

/* ─── SECTION 3: ZONE MATRIX ─── */
.zone-matrix {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}
.zone-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 0.85rem;
}
.zone-color-bar {
  width: 4px;
  height: 36px;
  border-radius: 4px;
}
.zone-pill.safe .zone-color-bar { background: var(--green-500); box-shadow: 0 0 10px var(--green-500); }
.zone-pill.patrol .zone-color-bar { background: var(--cyan-400); box-shadow: 0 0 10px var(--cyan-400); }
.zone-pill.restricted .zone-color-bar { background: var(--amber-500); box-shadow: 0 0 10px var(--amber-500); }
.zone-pill.emergency .zone-color-bar { background: var(--red-500); box-shadow: 0 0 10px var(--red-500); }
.zone-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-pure);
}
.zone-desc {
  font-size: 0.72rem;
  color: var(--text-dim);
}

/* ─── SECTION 4: INCIDENT SIMULATION CARD ─── */
.incident-sim-card {
  background: rgba(245, 158, 11, 0.04);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 16px;
  padding: 1.25rem;
}
.incident-sim-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}
.inc-alert-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--amber-500);
}
.inc-time {
  font-size: 0.72rem;
  color: var(--text-dim);
}
.inc-headline {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-pure);
  margin-bottom: 0.4rem;
}
.inc-meta-row {
  display: flex;
  gap: 1.5rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}
.incident-workflow-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}
.wf-step {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-dim);
}
.wf-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
}
.wf-step.completed { color: var(--green-500); }
.wf-step.completed .wf-dot { background: rgba(34, 197, 94, 0.2); color: var(--green-500); }
.wf-step.in-progress { color: var(--cyan-400); }
.wf-step.in-progress .wf-dot { background: rgba(56, 189, 248, 0.2); color: var(--cyan-400); }
.inc-assigned-guard {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(56, 189, 248, 0.06);
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
}
.guard-sm-avatar {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--blue-500);
  color: #fff;
  font-weight: 800;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.guard-sm-details {
  font-size: 0.78rem;
}

/* ─── SECTION 5: COMMAND CENTER METRICS & FEED ─── */
.command-metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.cmd-metric-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 1.1rem;
  text-align: center;
}
.cmd-num {
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  display: block;
}
.cmd-lbl {
  font-size: 0.72rem;
  color: var(--text-dim);
  font-weight: 700;
  text-transform: uppercase;
}
.event-feed-box {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 1rem;
}
.feed-header {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--cyan-400);
  letter-spacing: 0.1em;
  margin-bottom: 0.75rem;
}
.feed-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.78rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.feed-item:last-child { border-bottom: none; }
.feed-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.feed-dot.green { background: var(--green-500); }
.feed-dot.cyan { background: var(--cyan-400); }
.feed-dot.purple { background: var(--purple-500); }
.feed-time {
  font-family: 'Courier New', monospace;
  color: var(--text-dim);
  font-size: 0.7rem;
}
.feed-text {
  flex: 1;
  color: var(--text-muted);
}
.feed-zone {
  font-size: 0.7rem;
  background: rgba(255, 255, 255, 0.06);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  color: var(--text-dim);
}

/* ─── SECTION 6: MULTI-SITE ─── */
.multisite-locations-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}
.site-card {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 1rem;
}
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.site-flag-box {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.site-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cyan-400);
}
.site-name {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-pure);
}
.site-status-tag {
  font-size: 0.65rem;
  font-weight: 800;
  background: rgba(34, 197, 94, 0.15);
  color: var(--green-500);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}
.site-stats {
  font-size: 0.74rem;
  color: var(--text-dim);
}

/* ─── SECTION 7: MOBILE APP FEATURES ─── */
.mobile-features-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.mf-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.mf-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mf-item h4 {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-pure);
  margin: 0 0 0.25rem 0;
}
.mf-item p {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}

/* ─── SECTION 8: OFFLINE-FIRST DEMO ─── */
.offline-demo-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 16px;
  padding: 1.25rem;
}
.offline-flow-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
}
.of-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.of-icon.alert { background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); }
.of-icon.buffer { background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); }
.of-icon.success { background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); }
.of-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-pure);
}
.of-desc {
  font-size: 0.7rem;
  color: var(--text-dim);
  line-height: 1.4;
}
.of-arrow {
  color: var(--text-dim);
  font-size: 1.2rem;
}

/* ─── SECTION 9: FINAL CTA ─── */
.cta-section {
  padding: 8rem 0;
}
.cta-inner-card {
  position: relative;
  max-width: 880px;
  margin: 0 auto;
  text-align: center;
  padding: 4.5rem 3rem;
  border-radius: 32px;
  overflow: hidden;
}
.cta-backdrop-glow {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(27, 79, 216, 0.35) 0%, rgba(56, 189, 248, 0.1) 40%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
}
.cta-headline {
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 900;
  line-height: 1.12;
  letter-spacing: -0.03em;
  color: var(--text-pure);
  margin-bottom: 1.25rem;
}
.cta-subhead {
  font-size: 1.1rem;
  color: var(--text-muted);
  line-height: 1.7;
  max-width: 620px;
  margin: 0 auto 2.5rem;
}
.cta-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}
.cta-footer-notes {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.78rem;
  color: var(--text-dim);
  font-weight: 600;
  flex-wrap: wrap;
}

/* ─── FOOTER ─── */
.footer-wrap {
  position: relative;
  z-index: 2;
  background: rgba(1, 4, 11, 0.96);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 4.5rem;
}
.footer-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 3rem;
  margin-bottom: 4rem;
}
.footer-tagline {
  font-size: 0.85rem;
  color: var(--text-dim);
  line-height: 1.65;
  margin-top: 1rem;
  max-width: 320px;
}
.footer-links-col h4 {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-pure);
  margin: 0 0 1.25rem 0;
}
.footer-links-col a {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
  text-decoration: none;
  margin-bottom: 0.7rem;
  transition: color 0.2s ease;
}
.footer-links-col a:hover {
  color: var(--cyan-400);
}
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem 0;
}
.footer-bottom-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-dim);
  flex-wrap: wrap;
  gap: 1rem;
}
.footer-status-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.status-green-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green-500);
  box-shadow: 0 0 8px var(--green-500);
}

/* ─── UTILITIES & ANIMATIONS ─── */
.text-cyan { color: var(--cyan-400) !important; }
.text-green { color: var(--green-500) !important; }
.text-purple { color: var(--purple-500) !important; }
.text-amber { color: var(--amber-500) !important; }
.w-full { width: 100%; }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.3); }
}
@keyframes bounce {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, 8px); }
}
@keyframes scroll-wheel {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(10px); }
}

/* ─── RESPONSIVE STYLES ─── */
@media (max-width: 1024px) {
  .nav-links, .nav-actions { display: none; }
  .mobile-toggle { display: flex; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; }
  .mobile-toggle span { display: block; width: 22px; height: 2px; background: var(--text-main); }
  .guard-telemetry-hud { display: none; }
  .cam-modes-hud { display: none; }
  .footer-container { grid-template-columns: 1fr 1fr; }
  .command-metrics-grid { grid-template-columns: 1fr 1fr; }
  .multisite-locations-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .hero-headline { font-size: 2.5rem; }
  .hero-stats-strip { grid-template-columns: 1fr 1fr; }
  .story-card { padding: 1.5rem; }
  .zone-matrix { grid-template-columns: 1fr; }
  .offline-demo-box { flex-direction: column; }
  .of-arrow { transform: rotate(90deg); }
  .footer-container { grid-template-columns: 1fr; }
}
</style>
