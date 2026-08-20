<template>
  <div class="ag" ref="rootRef">

    <!-- ══════════════════════════════════════════════════════════
         1. NAVIGATION
    ══════════════════════════════════════════════════════════ -->
    <header class="ag-nav" :class="{ 'ag-nav--scrolled': scrolled }">
      <div class="ag-wrap ag-nav__inner">
        <!-- Brand -->
        <a href="#" class="ag-brand" @click.prevent>
          <img :src="logoPatrol" class="w-8 h-8 object-contain" alt="AccessEasy Patrol Logo" />
          <span class="ag-brand__name">AccessEasy <span style="color:#1B4FD8; font-weight:900;">PATROL</span></span>
        </a>

        <!-- Desktop nav links -->
        <nav class="ag-nav__links" aria-label="Main navigation">
          <a href="#" class="ag-nav__link">Product</a>
          <a href="#features" class="ag-nav__link" @click.prevent="scrollTo('features')">Features</a>
          <a href="#solutions" class="ag-nav__link">Solutions</a>
          <a href="#pricing" class="ag-nav__link" @click.prevent="scrollTo('pricing')">Pricing</a>
          <a href="#" class="ag-nav__link">Resources</a>
          <a href="#" class="ag-nav__link">Contact</a>
        </nav>

        <!-- Desktop CTA -->
        <div class="ag-nav__cta">
          <button class="ag-btn ag-btn--ghost" @click="goToLogin" id="nav-login">Login</button>
          <button class="ag-btn ag-btn--primary" @click="goToLogin" id="nav-demo">Book a Demo</button>
        </div>

        <!-- Hamburger -->
        <button class="ag-hamburger" :class="{ 'ag-hamburger--open': mobileOpen }" @click="mobileOpen = !mobileOpen" aria-label="Toggle navigation">
          <span></span><span></span><span></span>
        </button>
      </div>

      <!-- Mobile menu -->
      <Transition name="ag-mobile">
        <div v-if="mobileOpen" class="ag-mobile-menu">
          <a href="#" class="ag-mobile-menu__link" @click="mobileOpen = false">Product</a>
          <a href="#features" class="ag-mobile-menu__link" @click="mobileOpen = false; scrollTo('features')">Features</a>
          <a href="#" class="ag-mobile-menu__link" @click="mobileOpen = false">Solutions</a>
          <a href="#pricing" class="ag-mobile-menu__link" @click="mobileOpen = false; scrollTo('pricing')">Pricing</a>
          <a href="#" class="ag-mobile-menu__link" @click="mobileOpen = false">Resources</a>
          <a href="#" class="ag-mobile-menu__link" @click="mobileOpen = false">Contact</a>
          <div class="ag-mobile-menu__cta">
            <button class="ag-btn ag-btn--ghost ag-btn--full" @click="goToLogin">Login</button>
            <button class="ag-btn ag-btn--primary ag-btn--full" @click="goToLogin">Book a Demo</button>
          </div>
        </div>
      </Transition>
    </header>


    <!-- ══════════════════════════════════════════════════════════
         2. HERO
    ══════════════════════════════════════════════════════════ -->
    <section class="ag-hero">
      <!-- Ambient Smooth Dynamic Background Glows & Tech Grid -->
      <div class="ag-hero__ambient ag-hero__ambient--1" />
      <div class="ag-hero__ambient ag-hero__ambient--2" />
      <div class="ag-hero__ambient ag-hero__ambient--3" />
      <div class="ag-hero__grid-pattern" />

      <div class="ag-wrap ag-hero__inner">

        <!-- LEFT: content -->
        <div class="ag-hero__content ag-reveal">
          <div class="ag-eyebrow">Patrol Management Made Simple</div>
          <h1 class="ag-hero__h1">
            Smart Patrol.<br>
            <span class="ag-hero__h1--blue">Stronger Security.</span><br>
            Complete Visibility.
          </h1>
          <p class="ag-hero__sub">
            AccessEasy Patrol helps security agencies manage guards, patrols, checkpoints and incidents in real-time&nbsp;— all from one place.
          </p>
          <!-- AEO: Answer Block — structured definition for featured snippet capture -->
          <p class="ag-hero__answer-block">
            <strong>AccessEasy Patrol</strong> is a cloud-based security guard tour management platform
            that verifies checkpoints via NFC or QR scanning, tracks guards in real-time via GPS,
            logs incidents with geotagged photo evidence, and maintains full patrol compliance&nbsp;—
            even in areas without cellular coverage, using an offline-first sync queue.
          </p>
          <div class="ag-hero__btns">
            <button class="ag-btn ag-btn--primary ag-btn--lg" @click="goToLogin" id="hero-trial">Start Free Trial</button>
            <button class="ag-btn ag-btn--outline ag-btn--lg" @click="goToLogin" id="hero-demo">Book a Demo</button>
          </div>
          <div class="ag-hero__trust">
            <span v-for="t in heroTrust" :key="t" class="ag-hero__trust-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="#EFF6FF"/><path d="M4 7l2 2 4-4" stroke="#1B4FD8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ t }}
            </span>
          </div>
        </div>

        <!-- RIGHT: visual mockups -->
        <div class="ag-hero__visual">

          <!-- Dashboard (browser frame) -->
          <div class="ag-hero__dash ag-float">
            <!-- Browser chrome -->
            <div class="ag-chrome">
              <div class="ag-chrome__dots"><span></span><span></span><span></span></div>
              <div class="ag-chrome__url">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1L1 3.5V7c0 3 2.5 4.8 5 5 2.5-.2 5-2 5-5V3.5L6 1Z" fill="#22c55e"/></svg>
                patrol.accesseasy.io
              </div>
            </div>

            <!-- App shell -->
            <div class="ag-db">
              <!-- Sidebar -->
              <aside class="ag-db__sidebar">
                <div class="ag-db__logo">
                  <svg width="14" height="16" viewBox="0 0 26 30" fill="none"><path d="M13 0L0.5 5V15C0.5 22.5 6.1 29.4 13 30C19.9 29.4 25.5 22.5 25.5 15V5L13 0Z" fill="#1B4FD8"/><path d="M9 15.5L11.8 18.3L17.5 11.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>AccessEasy</span>
                </div>
                <ul class="ag-db__sidenav">
                  <li class="ag-db__sidenav-item ag-db__sidenav-item--active"><span class="ag-db__sidenav-icon">⊞</span>Overview</li>
                  <li class="ag-db__sidenav-item"><span class="ag-db__sidenav-icon">◉</span>Sites</li>
                  <li class="ag-db__sidenav-item"><span class="ag-db__sidenav-icon">◎</span>Guards</li>
                  <li class="ag-db__sidenav-item"><span class="ag-db__sidenav-icon">◈</span>Patrols</li>
                  <li class="ag-db__sidenav-item"><span class="ag-db__sidenav-icon">⊡</span>Incidents</li>
                  <li class="ag-db__sidenav-item"><span class="ag-db__sidenav-icon">≡</span>Reports</li>
                  <li class="ag-db__sidenav-item"><span class="ag-db__sidenav-icon">⚙</span>Settings</li>
                </ul>
              </aside>

              <!-- Main area -->
              <main class="ag-db__main">
                <div class="ag-db__topbar">
                  <span class="ag-db__title">Dashboard</span>
                  <div class="ag-db__topbar-right">
                    <span class="ag-db__bell">🔔</span>
                    <div class="ag-db__avatar">JA</div>
                  </div>
                </div>

                <!-- KPIs -->
                <div class="ag-db__kpis">
                  <div class="ag-db__kpi">
                    <div class="ag-db__kpi-num">24</div>
                    <div class="ag-db__kpi-lbl">Total Sites</div>
                    <div class="ag-db__kpi-tag ag-db__kpi-tag--neutral">↑ 2 this week</div>
                  </div>
                  <div class="ag-db__kpi ag-db__kpi--blue">
                    <div class="ag-db__kpi-num">156</div>
                    <div class="ag-db__kpi-lbl">Active Guards</div>
                    <div class="ag-db__kpi-tag ag-db__kpi-tag--blue">Online now</div>
                  </div>
                  <div class="ag-db__kpi ag-db__kpi--green">
                    <div class="ag-db__kpi-num">32</div>
                    <div class="ag-db__kpi-lbl">Active Patrols</div>
                    <div class="ag-db__kpi-tag ag-db__kpi-tag--green">In progress</div>
                  </div>
                  <div class="ag-db__kpi ag-db__kpi--red">
                    <div class="ag-db__kpi-num">5</div>
                    <div class="ag-db__kpi-lbl">Open Incidents</div>
                    <div class="ag-db__kpi-tag ag-db__kpi-tag--red">Needs action</div>
                  </div>
                </div>

                <!-- Map -->
                <div class="ag-db__map">
                  <div class="ag-db__map-header">Live Guard Tracking <span class="ag-db__live-pill"><span></span>LIVE</span></div>
                  <div class="ag-db__map-area">
                    <!-- Subtle grid lines -->
                    <div class="ag-db__map-grid"></div>
                    <!-- Guard dots -->
                    <div class="ag-db__guard-dot ag-db__guard-dot--blue" style="top:38%;left:22%"></div>
                    <div class="ag-db__guard-dot ag-db__guard-dot--blue" style="top:62%;left:48%"></div>
                    <div class="ag-db__guard-dot ag-db__guard-dot--orange" style="top:28%;left:67%"></div>
                    <div class="ag-db__guard-dot ag-db__guard-dot--blue" style="top:72%;left:30%"></div>
                    <div class="ag-db__guard-dot ag-db__guard-dot--blue" style="top:50%;left:80%"></div>
                  </div>
                </div>

                <!-- Bottom row -->
                <div class="ag-db__bottom">
                  <div class="ag-db__compliance">
                    <div class="ag-db__compliance-hdr">Patrol Compliance</div>
                    <div class="ag-db__compliance-row">
                      <div class="ag-db__bar-wrap"><div class="ag-db__bar-fill" style="width:98%"></div></div>
                      <span class="ag-db__compliance-pct">98%</span>
                    </div>
                  </div>
                  <div class="ag-db__top-guard">
                    <div class="ag-db__compliance-hdr">Top Guard</div>
                    <div class="ag-db__guard-row">
                      <div class="ag-db__guard-av">JD</div>
                      <div>
                        <div class="ag-db__guard-name">John Doe</div>
                        <div class="ag-db__guard-score">Score: 98%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Mini chart area -->
                <div class="ag-db__chart">
                  <div class="ag-db__chart-lbl">Patrol Analytics — This Week</div>
                  <div class="ag-db__chart-bars">
                    <div v-for="(h, i) in chartData" :key="i" class="ag-db__chart-bar-wrap">
                      <div class="ag-db__chart-bar" :style="{ height: h + '%' }"></div>
                      <div class="ag-db__chart-day">{{ days[i] }}</div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div><!-- /ag-hero__dash -->

          <!-- Phone mockup -->
          <div class="ag-hero__phone ag-float-delayed">
            <div class="ag-phone">
              <div class="ag-phone__statusbar">
                <span class="ag-phone__time">9:41</span>
                <span class="ag-phone__signal">●●●</span>
              </div>
              <div class="ag-phone__header">
                <svg width="14" height="16" viewBox="0 0 26 30" fill="none"><path d="M13 0L0.5 5V15C0.5 22.5 6.1 29.4 13 30C19.9 29.4 25.5 22.5 25.5 15V5L13 0Z" fill="white"/><path d="M9 15.5L11.8 18.3L17.5 11.5" stroke="#1B4FD8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>AccessEasy Guard</span>
              </div>
              <div class="ag-phone__body">
                <div class="ag-phone__greeting">
                  Good morning,<br><strong>James Wilson 👋</strong>
                </div>
                <div class="ag-phone__patrol-card">
                  <div class="ag-phone__patrol-badge">ACTIVE PATROL</div>
                  <div class="ag-phone__patrol-name">Night Route — Sector B</div>
                  <div class="ag-phone__bar-wrap"><div class="ag-phone__bar-fill" style="width:43%"></div></div>
                  <div class="ag-phone__bar-lbl">3 / 7 Checkpoints</div>
                </div>
                <div class="ag-phone__checkpoint">
                  <div class="ag-phone__checkpoint-lbl">NEXT CHECKPOINT</div>
                  <div class="ag-phone__checkpoint-name">CP-04 · East Gate</div>
                  <button class="ag-phone__scan-btn">📷 Scan QR Code</button>
                </div>
                <button class="ag-phone__report-btn">⚠ Report Incident</button>
              </div>
            </div>
          </div><!-- /ag-hero__phone -->

        </div><!-- /ag-hero__visual -->
      </div><!-- /ag-wrap -->
    </section><!-- /ag-hero -->


    <!-- ══════════════════════════════════════════════════════════
         3. TRUST LOGOS
    ══════════════════════════════════════════════════════════ -->
    <section class="ag-trust">
      <div class="ag-wrap">
        <p class="ag-trust__label">Trusted by security teams across the world</p>
        <div class="ag-trust__logos">
          <div v-for="logo in trustLogos" :key="logo" class="ag-trust__logo">{{ logo }}</div>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════════════════
         4. FEATURES
    ══════════════════════════════════════════════════════════ -->
    <section class="ag-section ag-features" id="features">
      <div class="ag-wrap">
        <div class="ag-section__header ag-reveal">
          <div class="ag-eyebrow">Powerful Features</div>
          <h2 class="ag-section__h2">Everything you need to manage<br class="ag-break"> your security operations</h2>
        </div>
        <div class="ag-features__grid">
          <div v-for="(feat, i) in features" :key="i" class="ag-feature-card ag-reveal" :style="{ '--delay': i * 60 + 'ms' }">
            <div class="ag-feature-card__icon" v-html="feat.icon"></div>
            <h3 class="ag-feature-card__title">{{ feat.title }}</h3>
            <p class="ag-feature-card__desc">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════════════════
         4b. COMPARISON TABLE (GEO)
    ══════════════════════════════════════════════════════════ -->
    <section class="ag-section ag-compare" id="compare">
      <div class="ag-wrap">
        <div class="ag-section__header ag-reveal">
          <div class="ag-eyebrow">Why AccessEasy Patrol</div>
          <h2 class="ag-section__h2">How we compare to the alternatives</h2>
          <p class="ag-compare__sub">See why modern security teams choose AccessEasy Patrol over legacy wand systems and generic mobile apps.</p>
        </div>
        <div class="ag-compare-table ag-reveal" style="--delay: 80ms">
          <table>
            <thead>
              <tr>
                <th>Capability</th>
                <th>Legacy Wand / RFID</th>
                <th>Generic Mobile Apps</th>
                <th class="ag-compare__highlight-col">AccessEasy Patrol</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Data Synchronization</td>
                <td>Manual USB docking at shift end</td>
                <td>Requires active internet</td>
                <td class="ag-compare__highlight-col"><strong>Real-time cloud + offline FIFO queue</strong></td>
              </tr>
              <tr>
                <td>GPS Verification</td>
                <td>None</td>
                <td>Raw single-point GPS (drift-prone)</td>
                <td class="ag-compare__highlight-col"><strong>4-Tier GPS Accuracy Evaluator</strong></td>
              </tr>
              <tr>
                <td>Evidence Capture</td>
                <td>Text notes only</td>
                <td>Basic photos</td>
                <td class="ag-compare__highlight-col"><strong>Geotagged photo, audio &amp; timestamped log</strong></td>
              </tr>
              <tr>
                <td>Distress / SOS</td>
                <td>None</td>
                <td>SMS only</td>
                <td class="ag-compare__highlight-col"><strong>Instant dispatch to command center</strong></td>
              </tr>
              <tr>
                <td>Works Offline</td>
                <td>Stores locally — no real-time</td>
                <td>No — requires internet</td>
                <td class="ag-compare__highlight-col"><strong>Yes — full offline operation with auto-sync</strong></td>
              </tr>
              <tr>
                <td>Hardware Required</td>
                <td>Proprietary wand device</td>
                <td>Smartphone</td>
                <td class="ag-compare__highlight-col"><strong>Standard Android or iOS smartphone</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════════════════
         5. COMMAND CENTER
    ══════════════════════════════════════════════════════════ -->
    <section class="ag-section ag-command" id="product">
      <div class="ag-wrap ag-command__inner">

        <!-- Left text -->
        <div class="ag-command__content ag-reveal">
          <div class="ag-eyebrow">Centralized Command</div>
          <h2 class="ag-command__h2">Complete control from<br>your command center</h2>
          <p class="ag-command__desc">
            Get a real-time overview of all sites, guards, patrols and events. Take action instantly and ensure nothing is missed.
          </p>
          <ul class="ag-checklist">
            <li v-for="item in commandChecklist" :key="item" class="ag-checklist__item">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="9" fill="#EFF6FF"/><path d="M5 9l3 3 5-5" stroke="#1B4FD8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ item }}
            </li>
          </ul>
          <button class="ag-btn ag-btn--primary ag-btn--lg" style="margin-top:2rem" @click="goToLogin">See Command Center</button>
        </div>

        <!-- Right: large dashboard mockup -->
        <div class="ag-command__visual ag-reveal" style="--delay:100ms">
          <div class="ag-cmd-dash">
            <div class="ag-chrome ag-chrome--dark">
              <div class="ag-chrome__dots ag-chrome__dots--dark"><span></span><span></span><span></span></div>
              <div class="ag-chrome__url ag-chrome__url--dark">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1L1 3.5V7c0 3 2.5 4.8 5 5 2.5-.2 5-2 5-5V3.5L6 1Z" fill="#22c55e"/></svg>
                patrol.accesseasy.io/command-center
              </div>
            </div>

            <div class="ag-cmd-shell">
              <aside class="ag-cmd-sidebar">
                <div class="ag-cmd-sidebar__logo">
                  <svg width="16" height="18" viewBox="0 0 26 30" fill="none"><path d="M13 0L0.5 5V15C0.5 22.5 6.1 29.4 13 30C19.9 29.4 25.5 22.5 25.5 15V5L13 0Z" fill="#1B4FD8"/><path d="M9 15.5L11.8 18.3L17.5 11.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>AccessEasy</span>
                </div>
                <div class="ag-cmd-sidebar__section">MAIN</div>
                <ul class="ag-cmd-sidenav">
                  <li class="ag-cmd-sidenav__item ag-cmd-sidenav__item--active">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor"/><rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor"/><rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor"/><rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor"/></svg>
                    Overview
                  </li>
                  <li class="ag-cmd-sidenav__item">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><rect x="1" y="10" width="12" height="3" rx="1" fill="currentColor"/></svg>
                    Sites
                  </li>
                  <li class="ag-cmd-sidenav__item">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="3" stroke="currentColor" stroke-width="1.3"/><path d="M1 13c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                    Guards
                  </li>
                  <li class="ag-cmd-sidenav__item">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Patrols
                  </li>
                  <li class="ag-cmd-sidenav__item">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 4V2.5a2 2 0 014 0V4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                    Checkpoints
                  </li>
                  <li class="ag-cmd-sidenav__item">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v6M4 10.5l3 2.5 3-2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/></svg>
                    Incidents
                  </li>
                  <div class="ag-cmd-sidebar__section" style="margin-top:1rem">REPORTS</div>
                  <li class="ag-cmd-sidenav__item">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4 4h6M4 7h6M4 10h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                    Reports
                  </li>
                  <li class="ag-cmd-sidenav__item">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M7 4v3l2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                    Settings
                  </li>
                </ul>
              </aside>

              <main class="ag-cmd-main">
                <div class="ag-cmd-topbar">
                  <div>
                    <div class="ag-cmd-topbar__title">Overview</div>
                    <div class="ag-cmd-topbar__sub">Monday, 6 Oct 2025 · All Sites</div>
                  </div>
                  <div class="ag-cmd-topbar__right">
                    <span class="ag-cmd-livebell">🔔</span>
                    <div class="ag-cmd-user">
                      <div class="ag-cmd-user__av">JA</div>
                      <div class="ag-cmd-user__info">
                        <div class="ag-cmd-user__name">James Admin</div>
                        <div class="ag-cmd-user__role">Administrator</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="ag-cmd-kpis">
                  <div class="ag-cmd-kpi">
                    <div class="ag-cmd-kpi__icon ag-cmd-kpi__icon--blue">
                      <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M2 11V7a5 5 0 0110 0v4" stroke="#1B4FD8" stroke-width="1.3" stroke-linecap="round"/><rect x="1" y="10" width="12" height="3" rx="1" fill="#1B4FD8"/></svg>
                    </div>
                    <div>
                      <div class="ag-cmd-kpi__num">24</div>
                      <div class="ag-cmd-kpi__lbl">Total Sites</div>
                    </div>
                  </div>
                  <div class="ag-cmd-kpi">
                    <div class="ag-cmd-kpi__icon ag-cmd-kpi__icon--green">
                      <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="3" stroke="#059669" stroke-width="1.3"/><path d="M1 13c0-3 2.7-5 6-5s6 2 6 5" stroke="#059669" stroke-width="1.3" stroke-linecap="round"/></svg>
                    </div>
                    <div>
                      <div class="ag-cmd-kpi__num">156</div>
                      <div class="ag-cmd-kpi__lbl">Active Guards</div>
                    </div>
                  </div>
                  <div class="ag-cmd-kpi">
                    <div class="ag-cmd-kpi__icon ag-cmd-kpi__icon--purple">
                      <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="#7C3AED" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div>
                      <div class="ag-cmd-kpi__num">32</div>
                      <div class="ag-cmd-kpi__lbl">Active Patrols</div>
                    </div>
                  </div>
                  <div class="ag-cmd-kpi">
                    <div class="ag-cmd-kpi__icon ag-cmd-kpi__icon--red">
                      <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 5v3M7 10.5v.5" stroke="#DC2626" stroke-width="1.5" stroke-linecap="round"/><path d="M6 2L1 11h12L8 2H6z" stroke="#DC2626" stroke-width="1.3" stroke-linejoin="round"/></svg>
                    </div>
                    <div>
                      <div class="ag-cmd-kpi__num">5</div>
                      <div class="ag-cmd-kpi__lbl">Incidents</div>
                    </div>
                  </div>
                </div>

                <div class="ag-cmd-content-row">
                  <!-- Map -->
                  <div class="ag-cmd-map">
                    <div class="ag-cmd-map__hdr">Live Guard Tracking <span class="ag-cmd-live-badge"><span></span>LIVE</span></div>
                    <div class="ag-cmd-map__area">
                      <div class="ag-cmd-map__grid"></div>
                      <div class="ag-cmd-gdot" style="top:35%;left:20%"></div>
                      <div class="ag-cmd-gdot" style="top:60%;left:45%"></div>
                      <div class="ag-cmd-gdot ag-cmd-gdot--warn" style="top:25%;left:65%"></div>
                      <div class="ag-cmd-gdot" style="top:70%;left:28%"></div>
                      <div class="ag-cmd-gdot" style="top:48%;left:78%"></div>
                      <div class="ag-cmd-gdot" style="top:55%;left:58%"></div>
                    </div>
                    <div class="ag-cmd-map__legend">
                      <span class="ag-cmd-map__leg-item ag-cmd-map__leg-item--ok">● On Route</span>
                      <span class="ag-cmd-map__leg-item ag-cmd-map__leg-item--warn">● Delayed</span>
                    </div>
                  </div>

                  <!-- Activity feed -->
                  <div class="ag-cmd-activity">
                    <div class="ag-cmd-activity__hdr">Recent Activity</div>
                    <div v-for="act in activityFeed" :key="act.time" class="ag-cmd-activity__item">
                      <div class="ag-cmd-activity__dot" :class="`ag-cmd-activity__dot--${act.type}`"></div>
                      <div class="ag-cmd-activity__info">
                        <div class="ag-cmd-activity__text">{{ act.text }}</div>
                        <div class="ag-cmd-activity__time">{{ act.time }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Bottom charts -->
                <div class="ag-cmd-charts-row">
                  <div class="ag-cmd-compliance-chart">
                    <div class="ag-cmd-compliance-chart__hdr">Patrol Compliance</div>
                    <div class="ag-cmd-compliance-chart__val">98<span>%</span></div>
                    <div class="ag-cmd-compliance-chart__bar"><div class="ag-cmd-compliance-chart__fill" style="width:98%"></div></div>
                    <div class="ag-cmd-compliance-chart__sub">↑ 3% vs last week</div>
                  </div>
                  <div class="ag-cmd-analytics-chart">
                    <div class="ag-cmd-analytics-chart__hdr">Patrol Duration — This Week</div>
                    <div class="ag-cmd-analytics-chart__bars">
                      <div v-for="(h, i) in cmdChartData" :key="i" class="ag-cmd-analytics-chart__bar-col">
                        <div class="ag-cmd-analytics-chart__bar" :style="{ height: h + '%' }"></div>
                        <div class="ag-cmd-analytics-chart__lbl">{{ days[i] }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="ag-cmd-guard-perf">
                    <div class="ag-cmd-guard-perf__hdr">Top Performing Guard</div>
                    <div class="ag-cmd-guard-perf__card">
                      <div class="ag-cmd-guard-perf__av">JD</div>
                      <div>
                        <div class="ag-cmd-guard-perf__name">John Doe</div>
                        <div class="ag-cmd-guard-perf__site">HQ — Sector A</div>
                        <div class="ag-cmd-guard-perf__score">98% Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>

      </div>
    </section>


    <!-- ══════════════════════════════════════════════════════════
         6. HOW IT WORKS
    ══════════════════════════════════════════════════════════ -->
    <section class="ag-section ag-how">
      <div class="ag-wrap">
        <div class="ag-section__header ag-reveal">
          <h2 class="ag-section__h2">From assignment to completion,<br class="ag-break"> everything stays connected.</h2>
        </div>
        <div class="ag-how__steps">
          <div v-for="(step, i) in howSteps" :key="i" class="ag-how__step ag-reveal" :style="{ '--delay': i * 100 + 'ms' }">
            <div class="ag-how__step-num">0{{ i + 1 }}</div>
            <div class="ag-how__step-icon" v-html="step.icon"></div>
            <div class="ag-how__step-label">{{ step.label }}</div>
            <h3 class="ag-how__step-title">{{ step.title }}</h3>
            <p class="ag-how__step-desc">{{ step.desc }}</p>
          </div>
          <div class="ag-how__connector ag-how__connector--1"></div>
          <div class="ag-how__connector ag-how__connector--2"></div>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════════════════
         7. GUARD MOBILE APP
    ══════════════════════════════════════════════════════════ -->
    <section class="ag-section ag-app">
      <div class="ag-wrap ag-app__inner">

        <!-- Left phones -->
        <div class="ag-app__visual ag-reveal">
          <div class="ag-app__phone-wrap">
            <!-- Primary phone -->
            <div class="ag-app__phone ag-float" style="z-index:2">
              <div class="ag-phone ag-phone--lg">
                <div class="ag-phone__statusbar">
                  <span class="ag-phone__time">9:41</span>
                  <span class="ag-phone__signal">●●●</span>
                </div>
                <div class="ag-phone__header">
                  <svg width="14" height="16" viewBox="0 0 26 30" fill="none"><path d="M13 0L0.5 5V15C0.5 22.5 6.1 29.4 13 30C19.9 29.4 25.5 22.5 25.5 15V5L13 0Z" fill="white"/><path d="M9 15.5L11.8 18.3L17.5 11.5" stroke="#1B4FD8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>AccessEasy Guard</span>
                  <span class="ag-phone__menu-dots">···</span>
                </div>
                <div class="ag-phone__body">
                  <div class="ag-phone__greeting" style="margin-bottom:1rem">
                    Good morning,<br><strong>Sarah Connor 👋</strong>
                  </div>
                  <!-- Stats row -->
                  <div class="ag-phone__stats-row">
                    <div class="ag-phone__stat">
                      <div class="ag-phone__stat-num">7</div>
                      <div class="ag-phone__stat-lbl">Assigned</div>
                    </div>
                    <div class="ag-phone__stat">
                      <div class="ag-phone__stat-num">3</div>
                      <div class="ag-phone__stat-lbl">Completed</div>
                    </div>
                    <div class="ag-phone__stat ag-phone__stat--red">
                      <div class="ag-phone__stat-num">1</div>
                      <div class="ag-phone__stat-lbl">Incidents</div>
                    </div>
                  </div>
                  <div class="ag-phone__patrol-card" style="margin-bottom:0.75rem">
                    <div class="ag-phone__patrol-badge">ACTIVE PATROL</div>
                    <div class="ag-phone__patrol-name">Perimeter Route — North</div>
                    <div class="ag-phone__bar-wrap"><div class="ag-phone__bar-fill" style="width:71%"></div></div>
                    <div class="ag-phone__bar-lbl">5 / 7 Checkpoints</div>
                  </div>
                  <div class="ag-phone__checkpoint" style="margin-bottom:0.75rem">
                    <div class="ag-phone__checkpoint-lbl">CURRENT CHECKPOINT</div>
                    <div class="ag-phone__checkpoint-name">CP-06 · Parking Gate B</div>
                    <div class="ag-phone__checkpoint-sub">GPS verified · 2m ago</div>
                    <button class="ag-phone__scan-btn">✓ Mark Complete</button>
                  </div>
                  <!-- Checkpoint history -->
                  <div class="ag-phone__history">
                    <div class="ag-phone__history-lbl">CHECKPOINT HISTORY</div>
                    <div v-for="cp in cpHistory" :key="cp.name" class="ag-phone__history-item">
                      <span class="ag-phone__history-dot" :class="cp.done ? 'ag-phone__history-dot--done' : ''"></span>
                      <span class="ag-phone__history-name">{{ cp.name }}</span>
                      <span class="ag-phone__history-time">{{ cp.time }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Secondary phone (behind) -->
            <div class="ag-app__phone ag-app__phone--back ag-float-delayed">
              <div class="ag-phone ag-phone--back">
                <div class="ag-phone__statusbar">
                  <span class="ag-phone__time">9:41</span>
                  <span class="ag-phone__signal">●●●</span>
                </div>
                <div class="ag-phone__header ag-phone__header--red">
                  <svg width="14" height="16" viewBox="0 0 26 30" fill="none"><path d="M13 0L0.5 5V15C0.5 22.5 6.1 29.4 13 30C19.9 29.4 25.5 22.5 25.5 15V5L13 0Z" fill="white"/><path d="M9 15.5L11.8 18.3L17.5 11.5" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>Incident Report</span>
                </div>
                <div class="ag-phone__body">
                  <div class="ag-phone__incident-title">⚠ New Incident</div>
                  <div class="ag-phone__incident-card">
                    <div class="ag-phone__incident-type">Suspicious Activity</div>
                    <div class="ag-phone__incident-loc">East Wing — Floor 2</div>
                    <div class="ag-phone__incident-photo">📷 Photo attached</div>
                    <div class="ag-phone__incident-status">Reported — Pending Review</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right text -->
        <div class="ag-app__content ag-reveal" style="--delay:100ms">
          <div class="ag-eyebrow">Guard Mobile App</div>
          <h2 class="ag-app__h2">Give every guard a smarter<br>way to patrol.</h2>
          <p class="ag-app__desc">
            The AccessEasy Guard App keeps every guard connected, informed and accountable — from patrol start to completion. Simple to use. Built for real patrol environments.
          </p>
          <ul class="ag-app__list">
            <li v-for="pt in appPoints" :key="pt.title" class="ag-app__list-item">
              <div class="ag-app__list-icon" v-html="pt.icon"></div>
              <div>
                <div class="ag-app__list-title">{{ pt.title }}</div>
                <div class="ag-app__list-desc">{{ pt.desc }}</div>
              </div>
            </li>
          </ul>
          <button class="ag-btn ag-btn--primary ag-btn--lg" style="margin-top:2rem" @click="goToLogin">Explore Guard App →</button>
        </div>

      </div>
    </section>


    <!-- ══════════════════════════════════════════════════════════
         8. ANALYTICS
    ══════════════════════════════════════════════════════════ -->
    <section class="ag-section ag-analytics">
      <div class="ag-wrap">
        <div class="ag-analytics__inner">
          <div class="ag-analytics__content ag-reveal">
            <div class="ag-eyebrow">Operational Intelligence</div>
            <h2 class="ag-analytics__h2">Turn patrol activity into<br>actionable intelligence.</h2>
            <p class="ag-analytics__desc">
              AccessEasy Patrol transforms raw patrol data into meaningful insights — helping supervisors make better decisions, improve compliance and reduce risk.
            </p>
            <div class="ag-analytics__insight-card">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 14l4-4 3 3 7-8" stroke="#1B4FD8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <div>
                <strong>Patrol compliance increased 18% this month.</strong>
                <div style="font-size:0.8rem;color:#64748B;margin-top:2px">Compared to the previous 30-day period across all sites.</div>
              </div>
            </div>
            <button class="ag-btn ag-btn--outline" style="margin-top:1.5rem" @click="goToLogin">View Full Analytics</button>
          </div>

          <div class="ag-analytics__charts ag-reveal" style="--delay:100ms">
            <div v-for="(metric, i) in analyticsMetrics" :key="i" class="ag-analytics__metric">
              <div class="ag-analytics__metric-top">
                <span class="ag-analytics__metric-label">{{ metric.label }}</span>
                <span class="ag-analytics__metric-value">{{ metric.value }}</span>
              </div>
              <div class="ag-analytics__metric-bar">
                <div class="ag-analytics__metric-fill" :style="{ width: metric.pct + '%', background: metric.color }"></div>
              </div>
            </div>
            <!-- Area chart mockup -->
            <div class="ag-analytics__area-chart">
              <div class="ag-analytics__area-hdr">Patrol Completion — 30 Days</div>
              <svg class="ag-analytics__area-svg" viewBox="0 0 280 80" fill="none" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#1B4FD8" stop-opacity="0.15"/>
                    <stop offset="100%" stop-color="#1B4FD8" stop-opacity="0.01"/>
                  </linearGradient>
                </defs>
                <path d="M0 60 C20 55 40 35 60 38 C80 41 100 28 120 25 C140 22 160 30 180 26 C200 22 220 15 240 18 C260 21 270 20 280 18 L280 80 L0 80Z" fill="url(#areaGrad)"/>
                <path d="M0 60 C20 55 40 35 60 38 C80 41 100 28 120 25 C140 22 160 30 180 26 C200 22 220 15 240 18 C260 21 270 20 280 18" stroke="#1B4FD8" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════════════════
         9. SECURITY / RELIABILITY
    ══════════════════════════════════════════════════════════ -->
    <section class="ag-section ag-reliability">
      <div class="ag-wrap">
        <div class="ag-section__header ag-reveal">
          <div class="ag-eyebrow">Enterprise Grade</div>
          <h2 class="ag-section__h2">Built for security operations<br class="ag-break"> you can depend on.</h2>
        </div>
        <div class="ag-reliability__grid">
          <div v-for="(item, i) in reliabilityItems" :key="i" class="ag-reliability__item ag-reveal" :style="{ '--delay': i * 80 + 'ms' }">
            <div class="ag-reliability__icon" v-html="item.icon"></div>
            <h3 class="ag-reliability__title">{{ item.title }}</h3>
            <p class="ag-reliability__desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════════════════
         10. PRICING
    ══════════════════════════════════════════════════════════ -->
    <section class="ag-section ag-pricing" id="pricing">
      <div class="ag-wrap">
        <div class="ag-section__header ag-reveal">
          <div class="ag-eyebrow">Simple &amp; Transparent Pricing</div>
          <h2 class="ag-section__h2">Plans that grow with your business</h2>
        </div>
        <div class="ag-pricing__grid">
          <!-- Per site -->
          <div class="ag-price-card ag-reveal">
            <div class="ag-price-card__label">Per Site</div>
            <div class="ag-price-card__price">
              <span class="ag-price-card__currency">₹</span>
              <span class="ag-price-card__amount">1,999</span>
              <span class="ag-price-card__period">/ site / month</span>
            </div>
            <p class="ag-price-card__desc">Ideal for growing agencies managing multiple locations independently.</p>
            <ul class="ag-price-card__features">
              <li v-for="f in perSiteFeatures" :key="f">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#EFF6FF"/><path d="M5 8l2.5 2.5L11 5.5" stroke="#1B4FD8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {{ f }}
              </li>
            </ul>
            <button class="ag-btn ag-btn--outline ag-btn--full ag-btn--lg" @click="goToLogin">Get Started</button>
          </div>

          <!-- Custom plan -->
          <div class="ag-price-card ag-price-card--popular ag-reveal" style="--delay:80ms">
            <div class="ag-price-card__badge">ENTERPRISE</div>
            <div class="ag-price-card__label">Custom</div>
            <div class="ag-price-card__price">
              <span class="ag-price-card__amount">Custom</span>
              <span class="ag-price-card__period">/ tailored plan</span>
            </div>
            <p class="ag-price-card__desc">For larger security teams and enterprise agencies with specialized requirements.</p>
            <ul class="ag-price-card__features">
              <li v-for="f in customFeatures" :key="f">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.2)"/><path d="M5 8l2.5 2.5L11 5.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {{ f }}
              </li>
            </ul>
            <button class="ag-btn ag-btn--white ag-btn--full ag-btn--lg" @click="goToLogin">Contact Sales</button>
          </div>
        </div>

        <!-- Pricing assurances -->
        <div class="ag-pricing__assurances ag-reveal" style="--delay:160ms">
          <div v-for="a in pricingAssurances" :key="a.text" class="ag-pricing__assurance">
            <div v-html="a.icon" class="ag-pricing__assurance-icon"></div>
            <div>
              <div class="ag-pricing__assurance-title">{{ a.title }}</div>
              <div class="ag-pricing__assurance-text">{{ a.text }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════════════════
         11b. FAQ (AEO + GEO)
    ══════════════════════════════════════════════════════════ -->
    <section class="ag-section ag-faq" id="faq">
      <div class="ag-wrap">
        <div class="ag-section__header ag-reveal">
          <div class="ag-eyebrow">Common Questions</div>
          <h2 class="ag-section__h2">Frequently Asked Questions</h2>
        </div>
        <div class="ag-faq__list">
          <details v-for="(item, i) in faqs" :key="i" class="ag-faq__item ag-reveal" :style="{ '--delay': i * 50 + 'ms' }">
            <summary class="ag-faq__question">{{ item.q }}</summary>
            <p class="ag-faq__answer">{{ item.a }}</p>
          </details>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════════════════
         11. FINAL CTA
    ══════════════════════════════════════════════════════════ -->
    <section class="ag-cta ag-reveal">
      <div class="ag-wrap ag-cta__inner">
        <div class="ag-cta__content">
          <h2 class="ag-cta__h2">Ready to transform your<br>security operations?</h2>
          <p class="ag-cta__sub">Join security teams using AccessEasy Patrol to stay ahead.</p>
          <div class="ag-cta__btns">
            <button class="ag-btn ag-btn--white ag-btn--lg" @click="goToLogin" id="cta-trial">Start Free Trial</button>
            <button class="ag-btn ag-btn--outline-white ag-btn--lg" @click="goToLogin" id="cta-demo">Book a Demo</button>
          </div>
        </div>
        <div class="ag-cta__visual" aria-hidden="true">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" opacity="0.06">
            <path d="M100 5L10 42.5V105C10 152.5 50.5 195 100 200C149.5 195 190 152.5 190 105V42.5L100 5Z" fill="white"/>
          </svg>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════════════════════
         12. FOOTER
    ══════════════════════════════════════════════════════════ -->
    <footer class="ag-footer">
      <div class="ag-wrap ag-footer__inner">
        <!-- Brand col -->
        <div class="ag-footer__brand">
          <a href="#" class="ag-brand" @click.prevent>
            <img :src="logoPatrol" class="w-7 h-7 object-contain" alt="AccessEasy Patrol Logo" />
            <span class="ag-brand__name">AccessEasy <span style="color:#1B4FD8; font-weight:900;">PATROL</span></span>
          </a>
          <p class="ag-footer__tagline">
            AccessEasy Patrol Management helps security agencies achieve complete visibility, accountability and operational excellence.
          </p>
        </div>

        <!-- Link columns -->
        <div class="ag-footer__col">
          <div class="ag-footer__col-title">Product</div>
          <a href="#" class="ag-footer__link">Features</a>
          <a href="#pricing" class="ag-footer__link" @click.prevent="scrollTo('pricing')">Pricing</a>
          <a href="#" class="ag-footer__link">Guard App</a>
          <a href="#" class="ag-footer__link">Integrations</a>
        </div>
        <div class="ag-footer__col">
          <div class="ag-footer__col-title">Company</div>
          <a href="#" class="ag-footer__link">About Us</a>
          <a href="#" class="ag-footer__link">Careers</a>
          <a href="#" class="ag-footer__link">Blog</a>
          <a href="#" class="ag-footer__link">Contact Us</a>
        </div>
        <div class="ag-footer__col">
          <div class="ag-footer__col-title">Resources</div>
          <a href="#" class="ag-footer__link">Help Center</a>
          <a href="#" class="ag-footer__link">Documentation</a>
          <a href="#" class="ag-footer__link">API Docs</a>
          <a href="#" class="ag-footer__link">Privacy Policy</a>
        </div>
        <div class="ag-footer__col">
          <div class="ag-footer__col-title">Follow Us</div>
          <a href="#" class="ag-footer__link">LinkedIn</a>
          <a href="#" class="ag-footer__link">Facebook</a>
          <a href="#" class="ag-footer__link">YouTube</a>
          <a href="#" class="ag-footer__link">X / Twitter</a>
        </div>
      </div>
      <div class="ag-footer__bottom">
        <div class="ag-wrap ag-footer__bottom-inner">
          <span>© 2026 AccessEasy Patrol. All rights reserved.</span>
          <div class="ag-footer__bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import logoPatrol from '@/assets/images/logoPatrol.png';

const router = useRouter();
const rootRef = ref(null);
const scrolled = ref(false);
const mobileOpen = ref(false);

function goToLogin() {
  router.push({ name: 'Login' });
}
function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
function onScroll() {
  scrolled.value = window.scrollY > 50;
}

// ── Scroll reveal ──────────────────────────────────────────────
let observer;
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });

  // Inject Google Fonts
  if (!document.getElementById('aegis-fonts')) {
    const link = document.createElement('link');
    link.id = 'aegis-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(link);
  }

  // Intersection observer for reveal animations
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('ag-reveal--in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.ag-reveal').forEach(el => observer.observe(el));
});
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  observer?.disconnect();
});

// ── Static data ────────────────────────────────────────────────

const heroTrust = ['Real-time Tracking', 'Cloud Based', 'Easy to Use', 'Secure & Reliable'];

const trustLogos = ['SecurePlus', 'Guardian Protection', 'SafeWatch Security', 'DefendX', 'ShieldForce', 'Fortress Solutions'];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const chartData = [65, 80, 72, 90, 85, 95, 88];
const cmdChartData = [70, 85, 65, 92, 88, 96, 90];

const activityFeed = [
  { type: 'ok',   text: 'Patrol completed — Site A East Wing',   time: '10:23 AM' },
  { type: 'ok',   text: 'Checkpoint scanned — CP-07 Main Gate',  time: '10:19 AM' },
  { type: 'warn', text: 'Incident reported — North Parking',      time: '10:11 AM' },
  { type: 'ok',   text: 'Guard clocked in — James Wilson',        time: '09:58 AM' },
  { type: 'ok',   text: 'Route assigned — Perimeter North',       time: '09:45 AM' },
];

const cpHistory = [
  { name: 'CP-01 · Main Entrance',  time: '09:12', done: true },
  { name: 'CP-02 · Lobby North',    time: '09:28', done: true },
  { name: 'CP-03 · Stairwell A',    time: '09:44', done: true },
  { name: 'CP-04 · East Corridor',  time: '10:01', done: true },
  { name: 'CP-05 · Roof Access',    time: '10:18', done: true },
  { name: 'CP-06 · Parking Gate B', time: 'Current', done: false },
  { name: 'CP-07 · Exit Gate',      time: 'Pending', done: false },
];

const features = [
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M3 12h3M18 12h3M12 3v3M12 18v3"/><circle cx="12" cy="12" r="9" opacity=".3"/></svg>`,
    title: 'Real-time Patrol Tracking',
    desc: 'Track guards live on the map and monitor patrol progress in real-time across all sites.'
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12l2.5 2.5L15 9"/></svg>`,
    title: 'Smart Checkpoints',
    desc: 'QR, NFC and GPS checkpoints with real-time verification and automatic tamper-proof logs.'
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7v5c0 5.25 3.75 10.2 9 11 5.25-.8 9-5.75 9-11V7L12 2Z"/><path d="M12 8v4l2 2"/></svg>`,
    title: 'Incident Management',
    desc: 'Report incidents with photos, notes and instant command center notifications from the field.'
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M7 20V10M12 20V4M17 20v-6"/></svg>`,
    title: 'Guard Performance',
    desc: 'Analytics, reports and leaderboards to improve guard accountability and performance.'
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>`,
    title: 'Schedule & Assign',
    desc: 'Create patrol routes, set schedules and assign guards to sites with drag-and-drop ease.'
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>`,
    title: 'Reports & Analytics',
    desc: 'Detailed compliance reports and operational insights to help you make better decisions.'
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M9 22V12h6v10"/></svg>`,
    title: 'Multi-site Management',
    desc: 'Manage multiple sites, teams and patrol operations from one central unified dashboard.'
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/><path d="M9 6h6M9 10h6"/></svg>`,
    title: 'Mobile App for Guards',
    desc: 'A simple mobile experience that keeps guards connected, guided and updated throughout their shift.'
  },
];

const commandChecklist = [
  'Live Guard Tracking',
  'Real-time Alerts',
  'Patrol Compliance',
  'Activity Timeline',
];

const howSteps = [
  {
    label: 'CREATE',
    title: 'Set up sites and routes',
    desc: 'Define your sites, configure patrol routes and place QR or NFC checkpoints exactly where they are needed.',
    icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="20" height="20" rx="3"/><path d="M16 10v12M10 16h12"/></svg>`,
  },
  {
    label: 'ASSIGN',
    title: 'Assign guards and schedules',
    desc: 'Assign guards to specific shifts and patrol routes. Guards receive their assignments instantly on the mobile app.',
    icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="12" r="5"/><path d="M6 27c0-5 4.5-9 10-9s10 4 10 9"/><path d="M22 8l3 3-5 5"/></svg>`,
  },
  {
    label: 'MONITOR',
    title: 'Track, verify and report',
    desc: 'Monitor every checkpoint scan, guard location and incident in real-time from the command center.',
    icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="16" r="6"/><path d="M6 16H3M29 16h-3M16 6V3M16 29v-3"/><path d="M10 10L8 8M24 24l-2-2M10 22l-2 2M24 8l-2 2"/></svg>`,
  },
];

const appPoints = [
  {
    title: 'Simple for guards',
    desc: 'Intuitive interface designed for real patrol environments. No training required.',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#1B4FD8" stroke-width="1.5" stroke-linecap="round"><rect x="4" y="1" width="10" height="16" rx="2"/><path d="M9 14h.01"/></svg>`,
  },
  {
    title: 'Fast checkpoint verification',
    desc: 'Scan QR codes or tap NFC tags in seconds — fully logged and timestamped automatically.',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#1B4FD8" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="10" y="2" width="6" height="6" rx="1"/><rect x="2" y="10" width="6" height="6" rx="1"/><path d="M10 10h6M10 14h3M13 10v6"/></svg>`,
  },
  {
    title: 'Real-time synchronization',
    desc: 'Every action syncs instantly to the command center. No delays, no data loss.',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#1B4FD8" stroke-width="1.5" stroke-linecap="round"><path d="M3 9a6 6 0 0011.5-2.5M15 9a6 6 0 01-11.5 2.5"/><path d="M3 9l2-2M3 9l2 2"/><path d="M15 9l-2-2M15 9l-2 2"/></svg>`,
  },
  {
    title: 'Field incident reporting',
    desc: 'Guards can report incidents with photos and notes directly from the patrol route.',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#1B4FD8" stroke-width="1.5" stroke-linecap="round"><path d="M9 2L2 15h14L9 2Z"/><path d="M9 8v3M9 13h.01"/></svg>`,
  },
];

const analyticsMetrics = [
  { label: 'Patrol Completion Rate',  value: '94%',  pct: 94, color: '#1B4FD8' },
  { label: 'Checkpoint Compliance',   value: '98%',  pct: 98, color: '#059669' },
  { label: 'Guard Performance Score', value: '87%',  pct: 87, color: '#7C3AED' },
  { label: 'Incident Resolution',     value: '91%',  pct: 91, color: '#D97706' },
];

const reliabilityItems = [
  {
    title: 'Secure by Design',
    desc: 'Enterprise-grade security architecture with end-to-end encryption and SOC 2 compliance.',
    icon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#1B4FD8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2L3 7v7c0 6.5 4.7 12.6 11 14 6.3-1.4 11-7.5 11-14V7L14 2Z"/><path d="M9 14l3.5 3.5 6-6"/></svg>`,
  },
  {
    title: 'Real-time Data',
    desc: 'Operational information stays synchronized across all devices and locations instantly.',
    icon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#1B4FD8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5v18M5 14h18"/><circle cx="14" cy="14" r="11"/></svg>`,
  },
  {
    title: 'Role-based Access',
    desc: 'Control exactly what every user can see and do. Granular permissions for every role.',
    icon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#1B4FD8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="10" r="4"/><path d="M5 23c0-5 4-9 9-9s9 4 9 9"/><path d="M19 13l3 3-5 5"/></svg>`,
  },
  {
    title: 'Reliable Infrastructure',
    desc: '99.9% uptime SLA backed by redundant cloud infrastructure — built for 24/7 operations.',
    icon: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#1B4FD8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="22" height="14" rx="2"/><path d="M7 9V7a7 7 0 0114 0v2"/><path d="M14 15v4"/></svg>`,
  },
];

const perSiteFeatures = ['Unlimited Patrols', 'Unlimited Guards', 'Unlimited Events', 'All Core Features', 'Email & Chat Support'];
const customFeatures = ['Custom Sites & Scale', 'Unlimited Patrols & Guards', 'Custom Integrations & APIs', 'Dedicated Success Manager', '24/7 Priority Support', 'Custom SLAs & Security'];

const pricingAssurances = [
  {
    title: 'No Hidden Fees',
    text: 'Everything you need in one simple price.',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1B4FD8" stroke-width="1.5" stroke-linecap="round"><path d="M10 2L2 6v5c0 4.5 3.4 8.7 8 10 4.6-1.3 8-5.5 8-10V6L10 2Z"/></svg>`,
  },
  {
    title: 'Cancel Anytime',
    text: 'No long-term contracts. Stay flexible.',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1B4FD8" stroke-width="1.5" stroke-linecap="round"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>`,
  },
  {
    title: 'Dedicated Support',
    text: 'Our team is here to help you succeed.',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1B4FD8" stroke-width="1.5" stroke-linecap="round"><path d="M4 15a8 8 0 1112 0M8 18h4M10 15v3"/></svg>`,
  },
];

// ── FAQ data (AEO + GEO) ────────────────────────────────────────
const faqs = [
  {
    q: 'How does AccessEasy Patrol verify checkpoints without an internet connection?',
    a: 'AccessEasy Patrol uses an offline-first local event queue on the mobile device. When a guard scans an NFC tag or QR code in a cellular dead zone, the scan is saved locally with an immutable device timestamp. When connectivity is restored, all queued events sync automatically to the cloud in chronological order — ensuring zero data loss.',
  },
  {
    q: 'What is the 4-Tier GPS Geofence accuracy system?',
    a: 'The 4-tier GPS accuracy evaluator classifies every checkpoint scan into one of four verdicts based on physical distance and satellite accuracy: Valid (inside geofence, high GPS accuracy), Warning (boundary fringe), Uncertain (excessive satellite drift, location unconfirmed), or Violation (outside geofence boundary). This prevents false alarms from GPS drift and blocks location spoofing.',
  },
  {
    q: 'Can AccessEasy Patrol replace legacy guard tour wand systems?',
    a: 'Yes. Unlike legacy electronic wand systems that require manual USB docking at shift end and offer no real-time visibility, AccessEasy Patrol delivers live cloud visibility, instant incident alerts, photo and voice evidence capture, and automated compliance reports from standard Android or iOS smartphones — no proprietary hardware required.',
  },
  {
    q: 'Does AccessEasy Patrol work in areas with no cellular signal?',
    a: 'Yes. The mobile app is built fully offline-first. All checkpoint scans, incident reports, and attendance events are stored locally in an SQLite database. A background sync worker automatically uploads all pending events when any network connection is restored, preserving the original device timestamps.',
  },
  {
    q: 'What types of checkpoints does AccessEasy Patrol support?',
    a: 'AccessEasy Patrol supports three checkpoint types: NFC tag scanning (passive tap, no internet required), QR code scanning (camera-based, works offline), and GPS proximity checkpoints (geofence-verified without a physical tag). Each checkpoint has a configurable geofence radius and accuracy threshold.',
  },
  {
    q: 'What evidence can guards capture during an incident report?',
    a: 'Guards can attach geotagged photos and voice memos to each incident report. Every report automatically includes the GPS coordinates, device timestamp, guard ID, site, and severity classification. Alerts are routed to supervisors based on severity tier.',
  },
];
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════════
   FONTS & BASE
══════════════════════════════════════════════════════════════ */
.ag {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #0A1628;
  background: #FFFFFF;
  -webkit-font-smoothing: antialiased;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.ag-wrap {
  width: 100%;
  max-width: 1760px;
  margin: 0 auto;
  padding-inline: clamp(24px, 4vw, 64px);
}

.ag-break { display: block; }

/* ── Reveal animation ── */
.ag-reveal {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1);
  transition-delay: var(--delay, 0ms);
}
.ag-reveal--in {
  opacity: 1;
  transform: translateY(0);
}

/* ── Float animations ── */
.ag-float {
  animation: agFloat 5s ease-in-out infinite alternate;
}
.ag-float-delayed {
  animation: agFloat 6s ease-in-out infinite alternate;
  animation-delay: -2.5s;
}
@keyframes agFloat {
  from { transform: translateY(0px); }
  to   { transform: translateY(-8px); }
}

/* ══════════════════════════════════════════════════════════════
   TYPOGRAPHY UTILITIES
══════════════════════════════════════════════════════════════ */
.ag-eyebrow {
  font-size: clamp(0.6875rem, 0.9vw, 0.75rem);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #1B4FD8;
  margin-bottom: clamp(0.5rem, 1vh, 0.75rem);
}

.ag-section__header {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 3.5rem;
}

.ag-section__h2 {
  font-size: clamp(1.75rem, 3.2vw, 2.5rem);
  font-weight: 800;
  line-height: 1.25;
  color: #0A1628;
  letter-spacing: -0.03em;
}

/* ══════════════════════════════════════════════════════════════
   BRAND
══════════════════════════════════════════════════════════════ */
.ag-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}
.ag-brand__shield { display: block; }
.ag-brand__name {
  font-size: 1.125rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #0A1628;
}

/* ══════════════════════════════════════════════════════════════
   BUTTONS
══════════════════════════════════════════════════════════════ */
.ag-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.625rem 1.25rem;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}
.ag-btn--lg { padding: clamp(0.6875rem, 1.2vh, 0.8125rem) clamp(1.25rem, 2vw, 1.75rem); font-size: clamp(0.875rem, 1.1vw, 0.9375rem); border-radius: 12px; }
.ag-btn--full { width: 100%; }

.ag-btn--primary {
  background: #1B4FD8;
  color: white;
  box-shadow: 0 1px 2px rgba(27,79,216,0.3), 0 4px 12px rgba(27,79,216,0.2);
}
.ag-btn--primary:hover {
  background: #1640B8;
  box-shadow: 0 2px 4px rgba(27,79,216,0.3), 0 8px 20px rgba(27,79,216,0.25);
  transform: translateY(-1px);
}

.ag-btn--outline {
  background: transparent;
  color: #1B4FD8;
  border: 1.5px solid #CBD5E1;
}
.ag-btn--outline:hover {
  border-color: #1B4FD8;
  background: #EFF6FF;
}

.ag-btn--outline-white {
  background: transparent;
  color: white;
  border: 1.5px solid rgba(255,255,255,0.35);
}
.ag-btn--outline-white:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.6);
}

.ag-btn--ghost {
  background: transparent;
  color: #475569;
}
.ag-btn--ghost:hover { color: #0A1628; background: #F1F5F9; }

.ag-btn--white {
  background: white;
  color: #1B4FD8;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.ag-btn--white:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }

.ag-btn--text { background: transparent; color: #475569; padding: 0.625rem 0.875rem; }
.ag-btn--text:hover { color: #1B4FD8; }

/* ══════════════════════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════════════════════ */
.ag-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.ag-nav--scrolled {
  border-bottom-color: #E2E8F0;
  box-shadow: 0 1px 12px rgba(0,0,0,0.06);
}
.ag-nav__inner {
  height: clamp(60px, 7vh, 70px);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ag-nav__links {
  display: none;
  align-items: center;
  gap: clamp(0.25rem, 1vw, 0.75rem);
}
@media (min-width: 1024px) { .ag-nav__links { display: flex; } }

.ag-nav__link {
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  transition: color 0.15s, background 0.15s;
}
.ag-nav__link:hover { color: #0A1628; background: #F1F5F9; }

.ag-nav__cta {
  display: none;
  align-items: center;
  gap: 0.625rem;
}
@media (min-width: 1024px) { .ag-nav__cta { display: flex; } }

/* Hamburger */
.ag-hamburger {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
}
.ag-hamburger:hover { background: #F1F5F9; }
.ag-hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: #0A1628;
  border-radius: 2px;
  transition: all 0.25s;
}
.ag-hamburger--open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.ag-hamburger--open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.ag-hamburger--open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
@media (min-width: 1024px) { .ag-hamburger { display: none; } }

/* Mobile menu */
.ag-mobile-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.75rem 1rem 1.25rem;
  background: white;
  border-top: 1px solid #E2E8F0;
}
.ag-mobile-menu__link {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #475569;
  text-decoration: none;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  transition: background 0.15s;
}
.ag-mobile-menu__link:hover { background: #F1F5F9; color: #0A1628; }
.ag-mobile-menu__cta { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem; }

/* Mobile menu transition */
.ag-mobile-enter-active, .ag-mobile-leave-active { transition: all 0.25s ease; }
.ag-mobile-enter-from, .ag-mobile-leave-to { opacity: 0; transform: translateY(-8px); }

/* ══════════════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════════════ */
.ag-hero {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  padding-top: clamp(84px, 10vh, 104px);
  padding-bottom: clamp(40px, 6vh, 64px);
  background: 
    radial-gradient(ellipse 70% 60% at 85% 25%, rgba(59, 130, 246, 0.16) 0%, transparent 70%),
    radial-gradient(ellipse 55% 45% at 15% 45%, rgba(14, 165, 233, 0.14) 0%, transparent 65%),
    radial-gradient(ellipse 45% 35% at 50% 85%, rgba(99, 102, 241, 0.09) 0%, transparent 60%),
    linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 50%, #F1F5F9 100%);
  box-sizing: border-box;
  overflow: hidden;
}

.ag-hero__ambient {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
  z-index: 0;
}
.ag-hero__ambient--1 {
  width: 520px;
  height: 520px;
  top: 8%;
  right: 4%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.24) 0%, rgba(37, 99, 235, 0) 70%);
  animation: ambientFloat 14s ease-in-out infinite alternate;
}
.ag-hero__ambient--2 {
  width: 440px;
  height: 440px;
  bottom: 4%;
  left: 4%;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.18) 0%, rgba(56, 189, 248, 0) 70%);
  animation: ambientFloat 12s ease-in-out infinite alternate-reverse;
}
.ag-hero__ambient--3 {
  width: 380px;
  height: 380px;
  top: 35%;
  left: 42%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(129, 140, 248, 0) 70%);
}
.ag-hero__grid-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, rgba(37, 99, 235, 0.08) 1px, transparent 0);
  background-size: 32px 32px;
  mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 40%, transparent 100%);
  pointer-events: none;
  z-index: 0;
}
@keyframes ambientFloat {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, -25px) scale(1.08); }
}

.ag-hero__inner {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

@media (min-width: 1024px) {
  .ag-hero__inner {
    grid-template-columns: 1fr 1.3fr;
    gap: clamp(3rem, 5vw, 6rem);
    align-items: center;
  }
}

/* Hero Content (Left column) */
.ag-hero__content {
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.ag-hero__h1 {
  font-size: clamp(2.5rem, 4.3vw, 4.35rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.04em;
  color: #0A1628;
  margin-bottom: clamp(14px, 2vh, 22px);
}

.ag-hero__h1--blue { color: #1B4FD8; display: block; }

.ag-hero__sub {
  font-size: clamp(1.05rem, 1.3vw, 1.25rem);
  color: #475569;
  line-height: 1.65;
  margin-bottom: clamp(12px, 1.6vh, 18px);
  max-width: 580px;
}

/* AEO: Answer block — featured snippet bait */
.ag-hero__answer-block {
  font-size: 0.9375rem;
  color: #64748B;
  line-height: 1.7;
  margin-bottom: clamp(20px, 2.8vh, 32px);
  max-width: 560px;
  padding: 0.875rem 1rem;
  background: rgba(239,246,255,0.7);
  border-left: 3px solid #1B4FD8;
  border-radius: 0 8px 8px 0;
}
.ag-hero__answer-block strong { color: #1B4FD8; }

.ag-hero__btns {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(10px, 1.4vw, 16px);
  margin-bottom: clamp(16px, 2.2vh, 26px);
}

.ag-hero__trust {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(12px, 1.6vw, 22px);
}

.ag-hero__trust-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: clamp(0.8125rem, 0.95vw, 0.875rem);
  font-weight: 600;
  color: #64748B;
}

/* Hero Visual (Right column) */
.ag-hero__visual {
  position: relative;
  width: 100%;
  max-width: 860px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  z-index: 2;
}

/* ── Browser / Dashboard mockup ── */
.ag-hero__dash {
  position: relative;
  z-index: 1;
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 25px 60px -15px rgba(27, 79, 216, 0.16), 0 10px 30px -10px rgba(10, 22, 40, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.9);
  overflow: hidden;
  background: #fff;
}

/* Browser chrome */
.ag-chrome {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 11px 16px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
}
.ag-chrome--dark {
  background: #1E293B;
  border-bottom-color: #334155;
}
.ag-chrome__dots { display: flex; gap: 6px; }
.ag-chrome__dots span {
  display: block;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #E2E8F0;
}
.ag-chrome__dots span:nth-child(1) { background: #FC5F57; }
.ag-chrome__dots span:nth-child(2) { background: #FCBC2E; }
.ag-chrome__dots span:nth-child(3) { background: #2FC840; }
.ag-chrome__dots--dark span { opacity: 0.7; }
.ag-chrome__url {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #64748B;
  background: #FFFFFF;
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #E2E8F0;
  flex: 1;
  max-width: 280px;
}
.ag-chrome__url--dark {
  background: #334155;
  border-color: #475569;
  color: #94A3B8;
}

/* Dashboard shell */
.ag-db {
  display: flex;
  height: clamp(400px, 48vh, 520px);
  overflow: hidden;
}
@media (max-width: 640px) { .ag-db { height: 320px; } }

/* DB Sidebar */
.ag-db__sidebar {
  width: 160px;
  background: #0F172A;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  flex-shrink: 0;
}
.ag-db__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 16px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  margin-bottom: 12px;
}
.ag-db__logo span { font-size: 0.9rem; font-weight: 800; color: white; letter-spacing: 0.05em; }

.ag-db__sidenav { list-style: none; flex: 1; padding: 0 10px; }
.ag-db__sidenav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 0.78rem;
  font-weight: 500;
  color: #94A3B8;
  padding: 7px 12px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s;
}
.ag-db__sidenav-item--active {
  background: rgba(27,79,216,0.2);
  color: #93C5FD;
}
.ag-db__sidenav-icon { font-size: 0.8rem; opacity: 0.7; }

/* DB Main */
.ag-db__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px;
  overflow: hidden;
  background: #F8FAFC;
}
.ag-db__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0;
}
.ag-db__title { font-size: 0.92rem; font-weight: 700; color: #0A1628; }
.ag-db__topbar-right { display: flex; align-items: center; gap: 8px; }
.ag-db__bell { font-size: 0.85rem; }
.ag-db__avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #1B4FD8;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 700; color: white;
}

/* KPI cards */
.ag-db__kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.ag-db__kpi {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 12px;
}
.ag-db__kpi-num { font-size: 1.35rem; font-weight: 800; color: #0A1628; line-height: 1.1; }
.ag-db__kpi-lbl { font-size: 0.68rem; color: #64748B; margin-top: 3px; font-weight: 600; }
.ag-db__kpi-tag { font-size: 0.6rem; font-weight: 600; border-radius: 5px; padding: 2px 6px; margin-top: 4px; display: inline-block; }
.ag-db__kpi-tag--neutral { background: #F1F5F9; color: #475569; }
.ag-db__kpi-tag--blue { background: #EFF6FF; color: #1B4FD8; }
.ag-db__kpi-tag--green { background: #ECFDF5; color: #059669; }
.ag-db__kpi-tag--red { background: #FEF2F2; color: #DC2626; }

/* Map area */
.ag-db__map {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 12px;
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 120px;
}
.ag-db__map-header {
  font-size: 0.72rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ag-db__live-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.55rem;
  font-weight: 700;
  color: #059669;
  background: #ECFDF5;
  padding: 2px 8px;
  border-radius: 5px;
}
.ag-db__live-pill span {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #059669;
  animation: livePulse 1.5s ease-in-out infinite;
}

.ag-db__map-area {
  position: relative;
  height: calc(100% - 24px);
  background: #EFF6FF;
  border-radius: 8px;
  overflow: hidden;
}
.ag-db__map-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(27,79,216,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(27,79,216,0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}
.ag-db__guard-dot {
  position: absolute;
  width: 10px; height: 10px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
.ag-db__guard-dot--blue { background: #1B4FD8; box-shadow: 0 0 0 4px rgba(27,79,216,0.22); }
.ag-db__guard-dot--orange { background: #F59E0B; box-shadow: 0 0 0 4px rgba(245,158,11,0.22); }

/* Bottom row */
.ag-db__bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ag-db__compliance, .ag-db__top-guard {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 12px;
}
.ag-db__compliance-hdr { font-size: 0.68rem; font-weight: 600; color: #475569; margin-bottom: 5px; }
.ag-db__compliance-row { display: flex; align-items: center; gap: 8px; }
.ag-db__bar-wrap { flex: 1; height: 6px; background: #E2E8F0; border-radius: 3px; overflow: hidden; }
.ag-db__bar-fill { height: 100%; background: #1B4FD8; border-radius: 3px; }
.ag-db__compliance-pct { font-size: 0.75rem; font-weight: 700; color: #1B4FD8; }
.ag-db__guard-row { display: flex; align-items: center; gap: 8px; }
.ag-db__guard-av { width: 24px; height: 24px; border-radius: 50%; background: #1B4FD8; color: white; font-size: 0.5rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.ag-db__guard-name { font-size: 0.68rem; font-weight: 600; color: #0A1628; }
.ag-db__guard-score { font-size: 0.55rem; color: #059669; font-weight: 600; }

/* Mini chart */
.ag-db__chart {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 12px;
}
.ag-db__chart-lbl { font-size: 0.68rem; font-weight: 600; color: #475569; margin-bottom: 8px; }
.ag-db__chart-bars { display: flex; align-items: flex-end; gap: 6px; height: 42px; }
.ag-db__chart-bar-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; height: 100%; justify-content: flex-end; }
.ag-db__chart-bar { width: 100%; border-radius: 2px 2px 0 0; background: #BFDBFE; min-height: 4px; max-height: 38px; }
.ag-db__chart-bar:nth-child(4n+1) { background: #1B4FD8; }
.ag-db__chart-day { font-size: 0.55rem; color: #94A3B8; }

/* ── Phone mockup ── */
.ag-hero__phone {
  position: absolute;
  right: -24px;
  bottom: -24px;
  z-index: 10;
  width: clamp(210px, 30%, 265px);
  filter: drop-shadow(0 25px 50px rgba(10,22,40,0.25));
}
@media (max-width: 767px) {
  .ag-hero__phone {
    right: -10px;
    bottom: -15px;
    width: clamp(150px, 38%, 180px);
  }
}
.ag-phone {
  background: white;
  border: 2px solid #CBD5E1;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(10,22,40,0.2);
}
.ag-phone--lg { border-radius: 28px; }
.ag-phone--back {
  opacity: 0.92;
}
.ag-phone__statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px 2px;
  background: #0A1628;
  font-size: 0.45rem;
  color: white;
  font-weight: 600;
}
.ag-phone__header {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  background: #0A1628;
  font-size: 0.6rem;
  font-weight: 700;
  color: white;
  border-bottom: 1px solid #1E293B;
}
.ag-phone__header--red { background: #7F1D1D; }
.ag-phone__menu-dots { margin-left: auto; opacity: 0.5; }
.ag-phone__body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #F8FAFC;
}
.ag-phone__greeting { font-size: 0.6rem; color: #475569; line-height: 1.4; }
.ag-phone__greeting strong { color: #0A1628; }

/* Stats row */
.ag-phone__stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 5px; }
.ag-phone__stat { background: white; border: 1px solid #E2E8F0; border-radius: 7px; padding: 5px; text-align: center; }
.ag-phone__stat-num { font-size: 0.85rem; font-weight: 800; color: #0A1628; }
.ag-phone__stat-lbl { font-size: 0.45rem; color: #64748B; }
.ag-phone__stat--red .ag-phone__stat-num { color: #DC2626; }

/* Patrol card */
.ag-phone__patrol-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 8px;
}
.ag-phone__patrol-badge {
  font-size: 0.45rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #1B4FD8;
  background: #EFF6FF;
  border-radius: 3px;
  padding: 2px 5px;
  display: inline-block;
  margin-bottom: 4px;
}
.ag-phone__patrol-name { font-size: 0.62rem; font-weight: 600; color: #0A1628; margin-bottom: 6px; }
.ag-phone__bar-wrap { height: 4px; background: #E2E8F0; border-radius: 2px; overflow: hidden; margin-bottom: 3px; }
.ag-phone__bar-fill { height: 100%; background: #1B4FD8; border-radius: 2px; }
.ag-phone__bar-lbl { font-size: 0.45rem; color: #64748B; }

/* Checkpoint */
.ag-phone__checkpoint {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 8px;
}
.ag-phone__checkpoint-lbl { font-size: 0.45rem; font-weight: 700; letter-spacing: 0.06em; color: #64748B; margin-bottom: 3px; }
.ag-phone__checkpoint-name { font-size: 0.65rem; font-weight: 600; color: #0A1628; margin-bottom: 2px; }
.ag-phone__checkpoint-sub { font-size: 0.45rem; color: #059669; margin-bottom: 5px; }

.ag-phone__scan-btn {
  width: 100%;
  padding: 5px;
  border: none;
  border-radius: 6px;
  background: #1B4FD8;
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.ag-phone__report-btn {
  width: 100%;
  padding: 6px;
  border: none;
  border-radius: 7px;
  background: #FEF2F2;
  color: #DC2626;
  font-size: 0.6rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid #FECACA;
}

/* Checkpoint history */
.ag-phone__history { background: white; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px; }
.ag-phone__history-lbl { font-size: 0.45rem; font-weight: 700; letter-spacing: 0.06em; color: #64748B; margin-bottom: 5px; }
.ag-phone__history-item { display: flex; align-items: center; gap: 5px; margin-bottom: 4px; }
.ag-phone__history-dot { width: 5px; height: 5px; border-radius: 50%; background: #CBD5E1; flex-shrink: 0; }
.ag-phone__history-dot--done { background: #059669; }
.ag-phone__history-name { font-size: 0.5rem; color: #475569; flex: 1; }
.ag-phone__history-time { font-size: 0.45rem; color: #94A3B8; }

/* Incident */
.ag-phone__incident-title { font-size: 0.65rem; font-weight: 700; color: #DC2626; }
.ag-phone__incident-card { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 7px; padding: 8px; }
.ag-phone__incident-type { font-size: 0.6rem; font-weight: 700; color: #0A1628; }
.ag-phone__incident-loc { font-size: 0.5rem; color: #64748B; margin-top: 2px; }
.ag-phone__incident-photo { font-size: 0.5rem; color: #1B4FD8; margin-top: 4px; }
.ag-phone__incident-status { font-size: 0.45rem; color: #D97706; margin-top: 3px; font-weight: 600; }

/* ══════════════════════════════════════════════════════════════
   TRUST LOGOS
══════════════════════════════════════════════════════════════ */
.ag-trust {
  padding: 2.75rem 0;
  border-top: 1px solid #E2E8F0;
  border-bottom: 1px solid #E2E8F0;
  background: #F8FAFC;
}
.ag-trust__label {
  text-align: center;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #94A3B8;
  margin-bottom: 1.5rem;
}
.ag-trust__logos {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
}
.ag-trust__logo {
  font-size: 0.875rem;
  font-weight: 700;
  color: #CBD5E1;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: color 0.2s;
  cursor: default;
}
.ag-trust__logo:hover { color: #94A3B8; }

/* ══════════════════════════════════════════════════════════════
   SECTION BASE
══════════════════════════════════════════════════════════════ */
.ag-section { padding: 88px 0; }
@media (min-width: 1024px) { .ag-section { padding: 104px 0; } }

/* ══════════════════════════════════════════════════════════════
   FEATURES
══════════════════════════════════════════════════════════════ */
.ag-features__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  overflow: hidden;
  background: #E2E8F0;
}
@media (min-width: 768px)  { .ag-features__grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .ag-features__grid { grid-template-columns: repeat(4, 1fr); } }

.ag-feature-card {
  background: white;
  padding: 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  transition: background 0.2s;
  cursor: default;
}
.ag-feature-card:hover { background: #FAFBFF; }
.ag-feature-card__icon { color: #1B4FD8; }
.ag-feature-card__title { font-size: 0.9375rem; font-weight: 700; color: #0A1628; }
.ag-feature-card__desc { font-size: 0.8125rem; color: #64748B; line-height: 1.65; }

/* ══════════════════════════════════════════════════════════════
   COMMAND CENTER
══════════════════════════════════════════════════════════════ */
.ag-command { background: #F8FAFC; }
.ag-command__inner {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  align-items: center;
}
@media (min-width: 1024px) { .ag-command__inner { flex-direction: row; align-items: flex-start; gap: 4rem; } }

.ag-command__content { flex: 0 0 420px; max-width: 440px; }
.ag-command__h2 {
  font-size: clamp(1.875rem, 3.2vw, 2.5rem);
  font-weight: 800;
  line-height: 1.22;
  color: #0A1628;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
}
.ag-command__desc { font-size: 0.9375rem; color: #475569; line-height: 1.65; margin-bottom: 1.5rem; }

.ag-checklist { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
.ag-checklist__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #0A1628;
}

/* Command center large dashboard */
.ag-command__visual { flex: 1; min-width: 0; width: 100%; }

.ag-cmd-dash {
  border-radius: 14px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 24px 64px rgba(10,22,40,0.1);
  background: white;
}

.ag-cmd-shell { display: flex; height: 480px; overflow: hidden; }
@media (max-width: 767px) { .ag-cmd-shell { height: 380px; } }

/* cmd sidebar */
.ag-cmd-sidebar {
  width: 155px;
  background: #0F172A;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  flex-shrink: 0;
}
.ag-cmd-sidebar__logo {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 2px 16px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 12px;
}
.ag-cmd-sidebar__logo span { font-size: 0.85rem; font-weight: 900; color: white; letter-spacing: 0.06em; }
.ag-cmd-sidebar__section { font-size: 0.58rem; font-weight: 700; letter-spacing: 0.1em; color: #475569; padding: 4px 16px; text-transform: uppercase; margin-bottom: 4px; }

.ag-cmd-sidenav { list-style: none; padding: 0 10px; flex: 1; }
.ag-cmd-sidenav__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  font-size: 0.72rem;
  font-weight: 500;
  color: #94A3B8;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 2px;
}
.ag-cmd-sidenav__item:hover { background: rgba(255,255,255,0.05); color: #CBD5E1; }
.ag-cmd-sidenav__item--active { background: rgba(27,79,216,0.2); color: #93C5FD; }

/* cmd main */
.ag-cmd-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #F8FAFC;
  overflow: hidden;
}
.ag-cmd-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.ag-cmd-topbar__title { font-size: 0.9rem; font-weight: 800; color: #0A1628; }
.ag-cmd-topbar__sub { font-size: 0.65rem; color: #64748B; margin-top: 2px; }
.ag-cmd-topbar__right { display: flex; align-items: center; gap: 12px; }
.ag-cmd-livebell { font-size: 0.8rem; }
.ag-cmd-user { display: flex; align-items: center; gap: 8px; }
.ag-cmd-user__av { width: 28px; height: 28px; border-radius: 50%; background: #1B4FD8; color: white; font-size: 0.6rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.ag-cmd-user__name { font-size: 0.65rem; font-weight: 600; color: #0A1628; }
.ag-cmd-user__role { font-size: 0.55rem; color: #64748B; }

/* cmd kpis */
.ag-cmd-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.ag-cmd-kpi {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ag-cmd-kpi__icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ag-cmd-kpi__icon--blue { background: #EFF6FF; }
.ag-cmd-kpi__icon--green { background: #ECFDF5; }
.ag-cmd-kpi__icon--purple { background: #F5F3FF; }
.ag-cmd-kpi__icon--red { background: #FEF2F2; }
.ag-cmd-kpi__num { font-size: 1.2rem; font-weight: 800; color: #0A1628; line-height: 1; }
.ag-cmd-kpi__lbl { font-size: 0.62rem; color: #64748B; margin-top: 2px; }

/* cmd content row */
.ag-cmd-content-row { display: grid; grid-template-columns: 1fr 160px; gap: 8px; flex: 1; min-height: 0; }
@media (max-width: 767px) { .ag-cmd-content-row { grid-template-columns: 1fr; } }

/* cmd map */
.ag-cmd-map { background: white; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px; display: flex; flex-direction: column; overflow: hidden; }
.ag-cmd-map__hdr { font-size: 0.6rem; font-weight: 600; color: #475569; margin-bottom: 5px; display: flex; align-items: center; gap: 6px; }
.ag-cmd-live-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 0.45rem; font-weight: 700; color: #059669; background: #ECFDF5; padding: 1px 5px; border-radius: 3px; }
.ag-cmd-live-badge span { width: 4px; height: 4px; border-radius: 50%; background: #059669; animation: livePulse 1.5s ease-in-out infinite; }
.ag-cmd-map__area { flex: 1; position: relative; background: #EFF6FF; border-radius: 5px; overflow: hidden; min-height: 80px; }
.ag-cmd-map__grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(27,79,216,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(27,79,216,0.06) 1px, transparent 1px); background-size: 24px 24px; }
.ag-cmd-gdot { position: absolute; width: 9px; height: 9px; border-radius: 50%; background: #1B4FD8; box-shadow: 0 0 0 3px rgba(27,79,216,0.18); transform: translate(-50%,-50%); }
.ag-cmd-gdot--warn { background: #F59E0B; box-shadow: 0 0 0 3px rgba(245,158,11,0.2); }
.ag-cmd-map__legend { display: flex; gap: 8px; margin-top: 4px; }
.ag-cmd-map__leg-item { font-size: 0.45rem; font-weight: 600; }
.ag-cmd-map__leg-item--ok { color: #1B4FD8; }
.ag-cmd-map__leg-item--warn { color: #F59E0B; }

/* activity feed */
.ag-cmd-activity { background: white; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px; overflow: hidden; }
.ag-cmd-activity__hdr { font-size: 0.6rem; font-weight: 700; color: #0A1628; margin-bottom: 6px; }
.ag-cmd-activity__item { display: flex; align-items: flex-start; gap: 6px; margin-bottom: 6px; }
.ag-cmd-activity__dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
.ag-cmd-activity__dot--ok { background: #059669; }
.ag-cmd-activity__dot--warn { background: #F59E0B; }
.ag-cmd-activity__text { font-size: 0.5rem; color: #0A1628; font-weight: 500; line-height: 1.4; }
.ag-cmd-activity__time { font-size: 0.45rem; color: #94A3B8; }

/* cmd charts row */
.ag-cmd-charts-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
@media (max-width: 767px) { .ag-cmd-charts-row { grid-template-columns: 1fr; } }

.ag-cmd-compliance-chart, .ag-cmd-analytics-chart, .ag-cmd-guard-perf {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 8px;
}
.ag-cmd-compliance-chart__hdr, .ag-cmd-analytics-chart__hdr, .ag-cmd-guard-perf__hdr { font-size: 0.55rem; font-weight: 600; color: #475569; margin-bottom: 4px; }
.ag-cmd-compliance-chart__val { font-size: 1.5rem; font-weight: 900; color: #1B4FD8; line-height: 1; margin-bottom: 4px; }
.ag-cmd-compliance-chart__val span { font-size: 0.8rem; }
.ag-cmd-compliance-chart__bar { height: 5px; background: #E2E8F0; border-radius: 3px; overflow: hidden; margin-bottom: 3px; }
.ag-cmd-compliance-chart__fill { height: 100%; background: #1B4FD8; border-radius: 3px; }
.ag-cmd-compliance-chart__sub { font-size: 0.45rem; color: #059669; font-weight: 600; }

.ag-cmd-analytics-chart__bars { display: flex; align-items: flex-end; gap: 3px; height: 40px; }
.ag-cmd-analytics-chart__bar-col { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; justify-content: flex-end; height: 100%; }
.ag-cmd-analytics-chart__bar { width: 100%; border-radius: 2px 2px 0 0; background: #BFDBFE; }
.ag-cmd-analytics-chart__bar:nth-child(4n+2) { background: #1B4FD8; }
.ag-cmd-analytics-chart__lbl { font-size: 0.4rem; color: #94A3B8; }

.ag-cmd-guard-perf__card { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.ag-cmd-guard-perf__av { width: 26px; height: 26px; border-radius: 50%; background: #1B4FD8; color: white; font-size: 0.5rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ag-cmd-guard-perf__name { font-size: 0.6rem; font-weight: 700; color: #0A1628; }
.ag-cmd-guard-perf__site { font-size: 0.5rem; color: #64748B; }
.ag-cmd-guard-perf__score { font-size: 0.5rem; color: #059669; font-weight: 700; }

/* ══════════════════════════════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════════════════════════════ */
.ag-how { background: white; }
.ag-how__steps {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
@media (min-width: 768px) { .ag-how__steps { grid-template-columns: repeat(3, 1fr); gap: 0; } }

.ag-how__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 1.5rem;
  position: relative;
  z-index: 1;
}
.ag-how__step-num {
  font-size: 0.6875rem;
  font-weight: 900;
  color: #CBD5E1;
  letter-spacing: 0.08em;
  margin-bottom: 1rem;
}
.ag-how__step-icon {
  width: 64px;
  height: 64px;
  background: #EFF6FF;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1B4FD8;
  margin-bottom: 1.25rem;
  transition: background 0.2s, transform 0.2s;
}
.ag-how__step:hover .ag-how__step-icon { background: #DBEAFE; transform: scale(1.05); }
.ag-how__step-label {
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #1B4FD8;
  margin-bottom: 0.5rem;
}
.ag-how__step-title { font-size: 1.0625rem; font-weight: 700; color: #0A1628; margin-bottom: 0.5rem; }
.ag-how__step-desc { font-size: 0.875rem; color: #64748B; line-height: 1.65; max-width: 260px; }

/* connectors */
.ag-how__connector {
  display: none;
  position: absolute;
  top: calc(2.5rem + 32px); /* center of icon */
  height: 1px;
  background: #E2E8F0;
  z-index: 0;
}
@media (min-width: 768px) { .ag-how__connector { display: block; } }
.ag-how__connector--1 { left: 33.33%; width: 33.33%; }
.ag-how__connector--2 { left: 66.66%; width: 33.33%; }

/* ══════════════════════════════════════════════════════════════
   GUARD APP
══════════════════════════════════════════════════════════════ */
.ag-app { 
  background: #F8FAFC; 
  padding-block: clamp(3rem, 6vh, 6rem);
}
.ag-app__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1100px;
  margin: 0 auto;
  gap: 3rem;
}
@media (min-width: 1024px) { 
  .ag-app__inner { 
    flex-direction: row; 
    align-items: center; 
    justify-content: center; 
    gap: clamp(3rem, 6vw, 6rem); 
  } 
}

.ag-app__visual { 
  flex: 0 0 auto; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.ag-app__phone-wrap { position: relative; width: 210px; height: 430px; }
.ag-app__phone { position: absolute; width: 210px; }
.ag-app__phone--back { width: 190px; top: 25px; left: 35px; z-index: 1; opacity: 0.7; transform: rotate(5deg); }
.ag-app__phone:first-child { left: 0; top: 0; z-index: 2; }

.ag-app__content { flex: 1; max-width: 520px; }
.ag-app__h2 {
  font-size: clamp(1.75rem, 3vw, 2.375rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.03em;
  color: #0A1628;
  margin-bottom: 1rem;
}
.ag-app__desc { font-size: 0.9375rem; color: #475569; line-height: 1.65; margin-bottom: 1.75rem; }

.ag-app__list { list-style: none; display: flex; flex-direction: column; gap: 1rem; }
.ag-app__list-item { display: flex; align-items: flex-start; gap: 0.875rem; }
.ag-app__list-icon { width: 36px; height: 36px; background: #EFF6FF; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.ag-app__list-title { font-size: 0.9375rem; font-weight: 600; color: #0A1628; }
.ag-app__list-desc { font-size: 0.8125rem; color: #64748B; margin-top: 2px; }

/* ══════════════════════════════════════════════════════════════
   ANALYTICS
══════════════════════════════════════════════════════════════ */
.ag-analytics { background: white; }
.ag-analytics__inner {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
  align-items: center;
}
@media (min-width: 1024px) { .ag-analytics__inner { flex-direction: row; align-items: flex-start; gap: 5rem; } }

.ag-analytics__content { flex: 1; max-width: 440px; }
.ag-analytics__h2 {
  font-size: clamp(1.75rem, 3vw, 2.375rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.03em;
  color: #0A1628;
  margin-bottom: 1rem;
}
.ag-analytics__desc { font-size: 0.9375rem; color: #475569; line-height: 1.65; margin-bottom: 1.5rem; }
.ag-analytics__insight-card {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 12px;
  font-size: 0.875rem;
  color: #1E3A8A;
  line-height: 1.5;
}

.ag-analytics__charts { flex: 1; width: 100%; }
.ag-analytics__metric { margin-bottom: 1.25rem; }
.ag-analytics__metric-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.ag-analytics__metric-label { font-size: 0.875rem; font-weight: 500; color: #475569; }
.ag-analytics__metric-value { font-size: 0.875rem; font-weight: 700; color: #0A1628; }
.ag-analytics__metric-bar { height: 8px; background: #F1F5F9; border-radius: 4px; overflow: hidden; }
.ag-analytics__metric-fill { height: 100%; border-radius: 4px; }

.ag-analytics__area-chart { margin-top: 2rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1rem; }
.ag-analytics__area-hdr { font-size: 0.8125rem; font-weight: 600; color: #475569; margin-bottom: 0.75rem; }
.ag-analytics__area-svg { width: 100%; height: 80px; display: block; }

/* ══════════════════════════════════════════════════════════════
   RELIABILITY
══════════════════════════════════════════════════════════════ */
.ag-reliability { background: #F8FAFC; }
.ag-reliability__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (min-width: 768px) { .ag-reliability__grid { grid-template-columns: repeat(4, 1fr); } }

.ag-reliability__item {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 1.75rem;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: default;
}
.ag-reliability__item:hover {
  box-shadow: 0 8px 24px rgba(10,22,40,0.08);
  transform: translateY(-2px);
}
.ag-reliability__icon { margin-bottom: 1rem; }
.ag-reliability__title { font-size: 0.9375rem; font-weight: 700; color: #0A1628; margin-bottom: 0.5rem; }
.ag-reliability__desc { font-size: 0.8125rem; color: #64748B; line-height: 1.65; }

/* ══════════════════════════════════════════════════════════════
   PRICING
══════════════════════════════════════════════════════════════ */
.ag-pricing { background: white; }
.ag-pricing__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto 3rem;
}
@media (min-width: 768px) { .ag-pricing__grid { grid-template-columns: repeat(2, 1fr); gap: 1.25rem; } }

.ag-price-card {
  border: 1.5px solid #E2E8F0;
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: white;
  transition: box-shadow 0.2s;
  position: relative;
}
.ag-price-card:hover { box-shadow: 0 8px 32px rgba(10,22,40,0.08); }

.ag-price-card--popular {
  background: #1B4FD8;
  border-color: #1B4FD8;
  color: white;
}
.ag-price-card__badge {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  background: #F59E0B;
  color: white;
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 3px 14px;
  border-radius: 999px;
  white-space: nowrap;
}
.ag-price-card__label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #64748B;
}
.ag-price-card--popular .ag-price-card__label { color: rgba(255,255,255,0.7); }
.ag-price-card__price { display: flex; align-items: flex-end; gap: 3px; flex-wrap: wrap; }
.ag-price-card__currency { font-size: 1.25rem; font-weight: 700; color: #0A1628; margin-bottom: 4px; }
.ag-price-card--popular .ag-price-card__currency { color: white; }
.ag-price-card__amount { font-size: 3rem; font-weight: 900; color: #0A1628; line-height: 1; letter-spacing: -0.04em; }
.ag-price-card--popular .ag-price-card__amount { color: white; }
.ag-price-card__period { font-size: 0.8125rem; color: #64748B; margin-bottom: 6px; }
.ag-price-card--popular .ag-price-card__period { color: rgba(255,255,255,0.6); }
.ag-price-card__desc { font-size: 0.875rem; color: #475569; line-height: 1.6; }
.ag-price-card--popular .ag-price-card__desc { color: rgba(255,255,255,0.75); }
.ag-price-card__features { list-style: none; display: flex; flex-direction: column; gap: 0.625rem; flex: 1; }
.ag-price-card__features li { display: flex; align-items: center; gap: 0.625rem; font-size: 0.9rem; color: #475569; font-weight: 500; }
.ag-price-card--popular .ag-price-card__features li { color: rgba(255,255,255,0.9); }

.ag-pricing__assurances {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  max-width: 1100px;
  margin: 0 auto;
}
@media (min-width: 640px) { .ag-pricing__assurances { grid-template-columns: repeat(3, 1fr); } }
.ag-pricing__assurance { display: flex; align-items: flex-start; gap: 0.875rem; }
.ag-pricing__assurance-icon { width: 36px; height: 36px; background: #EFF6FF; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ag-pricing__assurance-title { font-size: 0.9375rem; font-weight: 600; color: #0A1628; }
.ag-pricing__assurance-text { font-size: 0.8125rem; color: #64748B; margin-top: 2px; }

/* ══════════════════════════════════════════════════════════════
   CTA BANNER
══════════════════════════════════════════════════════════════ */
.ag-cta {
  background: #0A1628;
  position: relative;
  overflow: hidden;
  padding: 80px 0;
}
.ag-cta__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2rem;
}
@media (min-width: 1024px) { .ag-cta__inner { flex-direction: row; align-items: center; justify-content: space-between; } }
.ag-cta__content { max-width: 560px; }
.ag-cta__h2 {
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.04em;
  color: white;
  margin-bottom: 0.875rem;
}
.ag-cta__sub { font-size: 1rem; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 1.75rem; }
.ag-cta__btns { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.ag-cta__visual { position: absolute; right: 6%; top: 50%; transform: translateY(-50%); pointer-events: none; display: none; }
@media (min-width: 1024px) { .ag-cta__visual { display: block; } }

/* ══════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════ */
.ag-footer { background: #0F172A; padding-top: 4rem; }
.ag-footer__inner {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
@media (min-width: 640px)  { .ag-footer__inner { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .ag-footer__inner { grid-template-columns: 2fr 1fr 1fr 1fr 1fr; } }

.ag-footer__brand .ag-brand__name { color: white; }
.ag-footer__tagline {
  font-size: 0.8125rem;
  color: #64748B;
  line-height: 1.7;
  margin-top: 0.875rem;
  max-width: 280px;
}
.ag-footer__col { display: flex; flex-direction: column; gap: 0.5rem; }
.ag-footer__col-title { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #94A3B8; margin-bottom: 0.375rem; }
.ag-footer__link {
  font-size: 0.875rem;
  color: #64748B;
  text-decoration: none;
  transition: color 0.15s;
  width: fit-content;
}
.ag-footer__link:hover { color: #CBD5E1; }

.ag-footer__bottom { padding: 1.25rem 0; }
.ag-footer__bottom-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8125rem;
  color: #475569;
}
@media (min-width: 640px) { .ag-footer__bottom-inner { flex-direction: row; justify-content: space-between; } }
.ag-footer__bottom-links { display: flex; gap: 1.25rem; }
.ag-footer__bottom-links a { color: #475569; text-decoration: none; font-size: 0.8125rem; transition: color 0.15s; }
.ag-footer__bottom-links a:hover { color: #94A3B8; }

/* ══════════════════════════════════════════════════════════════
   RESPONSIVE OVERRIDES
══════════════════════════════════════════════════════════════ */
@media (max-width: 767px) {
  .ag-break { display: none; }
  .ag-hero__dash { max-width: 100%; }
  .ag-db__kpis { grid-template-columns: repeat(2, 1fr); }
  .ag-how__connector { display: none; }
  .ag-app__phone-wrap { width: 100%; height: 420px; }
  .ag-app__phone--back { display: none; }
  .ag-app__phone:first-child { position: relative; left: auto; top: auto; }
  .ag-cmd-kpis { grid-template-columns: repeat(2, 1fr); }
  .ag-cmd-charts-row { grid-template-columns: 1fr; }
}

/* ══════════════════════════════════════════════════════════════
   COMPARISON TABLE (GEO)
══════════════════════════════════════════════════════════════ */
.ag-compare { background: #F8FAFC; }
.ag-compare__sub {
  font-size: 1rem;
  color: #64748B;
  margin-top: 0.75rem;
  max-width: 560px;
}
.ag-compare-table {
  overflow-x: auto;
  margin-top: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(226,232,240,0.8);
}
.ag-compare-table table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  font-size: 0.9375rem;
}
.ag-compare-table thead tr {
  background: #F1F5F9;
}
.ag-compare-table th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748B;
  border-bottom: 1px solid #E2E8F0;
  white-space: nowrap;
}
.ag-compare-table td {
  padding: 0.9rem 1.25rem;
  color: #475569;
  font-size: 0.9375rem;
  border-bottom: 1px solid #F1F5F9;
  vertical-align: top;
}
.ag-compare-table tbody tr:last-child td { border-bottom: none; }
.ag-compare-table tbody tr:hover td { background: #F8FAFC; }
.ag-compare__highlight-col {
  background: rgba(239,246,255,0.6);
  color: #1B4FD8 !important;
  font-weight: 600;
  border-left: 2px solid rgba(27,79,216,0.12);
}
.ag-compare-table thead .ag-compare__highlight-col {
  background: rgba(27,79,216,0.06);
  color: #1B4FD8;
}

/* ══════════════════════════════════════════════════════════════
   FAQ SECTION (AEO + GEO)
══════════════════════════════════════════════════════════════ */
.ag-faq__list {
  margin-top: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 800px;
}
.ag-faq__item {
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.ag-faq__item:hover { box-shadow: 0 2px 12px rgba(27,79,216,0.08); }
.ag-faq__item[open] {
  border-color: rgba(27,79,216,0.25);
  box-shadow: 0 2px 12px rgba(27,79,216,0.08);
}
.ag-faq__question {
  padding: 1.125rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: #0A1628;
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.ag-faq__question::-webkit-details-marker { display: none; }
.ag-faq__question::after {
  content: '+';
  font-size: 1.25rem;
  color: #1B4FD8;
  font-weight: 400;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.ag-faq__item[open] .ag-faq__question::after { transform: rotate(45deg); }
.ag-faq__answer {
  padding: 0 1.25rem 1.125rem;
  font-size: 0.9375rem;
  color: #475569;
  line-height: 1.7;
}
</style>
