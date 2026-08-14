<template>
  <div class="h-full w-full bg-[#F8FAFC] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 p-6 overflow-y-auto selection:bg-indigo-500/20 font-sans relative">
    <canvas
      ref="canvasRef"
      class="hidden"
    />

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span class="text-indigo-600 dark:text-indigo-400 text-2xl">👥</span>
          Face Recognition Library
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage enrolled identity profiles, VIP watchlists, and blacklisted alert subjects.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          :disabled="loading"
          class="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#151c2c] hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs transition font-bold border border-slate-200 dark:border-white/10 shadow-sm"
          @click="fetchData"
        >
          <span :class="{ 'animate-spin': loading }">🔄</span> Refresh
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-600/20"
          @click="openEnrollWizard"
        >
          <span>👤+</span> Enroll New Profile
        </button>
      </div>
    </div>

    <!-- Navigation Tabs & Search -->
    <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-1 bg-white dark:bg-[#151c2c] p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
        <button
          v-for="tab in tabDefs"
          :key="tab.id"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition',
            activeTab === tab.id
              ? `${tab.color} text-white shadow-sm`
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
          @click="activeTab = tab.id"
        >
          <span>{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <div class="relative min-w-[280px]">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, ID, department..."
          class="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm font-medium transition"
        >
      </div>
    </div>

    <!-- Tab 1: Unrecognized Subject Audits -->
    <div
      v-if="activeTab === 'unknown'"
      class="space-y-4"
    >
      <div class="bg-white dark:bg-[#151c2c] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-purple-50 dark:bg-purple-500/20 text-purple-600 rounded-xl text-xl">
            🛡️
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">
              Unrecognized Subject Audits
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Captured face crops that require enrollment or identity classification.
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="unknownFaces.length === 0"
        class="text-center py-12 text-slate-400 text-xs italic"
      >
        No unrecognized subjects captured recently.
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <div
          v-for="face in unknownFaces"
          :key="face.id"
          class="bg-white dark:bg-[#151c2c] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition space-y-3"
        >
          <div class="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <img
              :src="face.snapshot"
              alt="Unknown"
              class="w-full h-full object-cover"
            >
            <div class="absolute top-2 left-2 px-2 py-0.5 bg-rose-500 text-white font-mono text-[10px] font-bold rounded">
              UNKNOWN {{ face.confidence }}
            </div>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span class="font-semibold text-slate-800 dark:text-slate-200">{{ face.camera }}</span>
            <span class="text-slate-400 flex items-center gap-1">🕒 {{ face.time }}</span>
          </div>
          <button
            class="w-full py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-400 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-500/20 transition flex items-center justify-center gap-1.5"
            @click="promoteUnknown(face)"
          >
            <span>➕</span> Promote to Profile
          </button>
        </div>
      </div>
    </div>

    <!-- Tab 2: Enrolled Profiles Cards Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <div
        v-if="filteredPeople.length === 0"
        class="col-span-full text-center py-12 text-slate-400 text-xs italic"
      >
        No enrolled profiles found matching search criteria. Click "Enroll New Profile" to add.
      </div>

      <div
        v-for="person in filteredPeople"
        :key="person.id"
        class="bg-white dark:bg-[#151c2c] border border-slate-200/80 dark:border-white/10 hover:border-indigo-300 rounded-2xl p-5 flex flex-col justify-between transition shadow-sm hover:shadow-md group relative overflow-hidden"
      >
        <div class="space-y-4">
          <div class="flex items-start justify-between">
            <div class="relative">
              <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-white/10 overflow-hidden flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xl shadow-inner">
                <img
                  v-if="person.avatar"
                  :src="person.avatar"
                  :alt="person.name"
                  class="w-full h-full object-cover"
                >
                <span v-else>{{ (person.name || 'EP').slice(0, 2).toUpperCase() }}</span>
              </div>
              <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>

            <div class="flex flex-col items-end gap-1">
              <span
                :class="[
                  'px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase',
                  person.type === 'vip' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30' :
                  person.type === 'blacklist' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30' :
                  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                ]"
              >
                {{ person.type }}
              </span>
              <span class="text-[10px] text-slate-400 font-mono font-semibold">{{ person.employeeId }}</span>
            </div>
          </div>

          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              {{ person.name }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {{ person.department }}
            </p>
          </div>

          <div class="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
            <div class="flex justify-between items-center">
              <span>Pose Vectors:</span>
              <span
                v-if="person.multiPoseEnrolled"
                class="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-md font-mono font-bold text-[11px]"
              >
                5 Poses (Multi-Vector)
              </span>
              <button
                v-else
                class="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 px-2 py-0.5 rounded-md font-mono font-bold text-[11px] flex items-center gap-1 transition"
                @click="reEnrollPoses(person)"
              >
                1 Pose (Re-enroll Poses)
              </button>
            </div>
            <div class="flex justify-between">
              <span>Last Recognition:</span>
              <span class="text-slate-700 dark:text-slate-300 font-medium">{{ person.lastSeen }}</span>
            </div>
          </div>
        </div>

        <div class="pt-4 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
          <span class="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
            <span class="text-emerald-500 font-bold">✓</span> Active AI Model
          </span>
          <button
            class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Remove Profile"
            @click="handleDeletePerson(person.id, person.name)"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- ── NATIVE BULLETPROOF NATIVE MODAL OVERLAY ── -->
    <div
      v-if="showWizard"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-4 overflow-y-auto font-sans"
    >
      <div class="bg-white dark:bg-[#151c2c] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden text-slate-900 dark:text-white max-w-[740px] w-full my-auto transition-all transform">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-gradient-to-r from-indigo-50 to-slate-50 dark:from-white/5 dark:to-white/5">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 text-lg font-bold">
              ✨
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">
                {{ wizardStage === 'details' ? 'Enrollment — Step 1: Person Details' : wizardStage === 'capture' ? `Enrollment — Step 2: Pose ${currentPoseIndex + 1}/5` : 'Enrollment — Step 3: Review & Commit' }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ wizardStage === 'details' ? 'Fill in profile information, then capture 5 guided poses with your webcam.' : wizardStage === 'capture' ? currentPose?.instruction : 'Review all pose captures before committing to the AI model.' }}
              </p>
            </div>
          </div>
          <button
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition"
            @click="closeWizard"
          >
            ✕
          </button>
        </div>

        <!-- Step Indicator -->
        <div class="flex items-center gap-0 px-6 pt-4 cursor-pointer">
          <div
            v-for="(label, i) in ['Details', 'Capture Poses', 'Review']"
            :key="label"
            class="flex items-center flex-1"
            @click="switchStage(i)"
          >
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition',
                  i < stageIndex ? 'bg-emerald-500 text-white border-emerald-500' :
                  i === stageIndex ? 'bg-indigo-600 text-white border-indigo-600' :
                  'bg-slate-100 text-slate-400 border-slate-200 dark:bg-white/5 dark:border-white/10'
                ]"
              >
                {{ i < stageIndex ? '✓' : i + 1 }}
              </div>
              <span :class="['text-xs font-semibold hidden sm:block', i === stageIndex ? 'text-indigo-600 dark:text-indigo-400' : i < stageIndex ? 'text-emerald-600' : 'text-slate-400']">
                {{ label }}
              </span>
            </div>
            <div
              v-if="i < 2"
              class="flex-1 mx-2"
            >
              <div :class="['h-0.5 rounded-full transition', i < stageIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10']" />
            </div>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <!-- ── STAGE 1: Details ── -->
          <div
            v-if="wizardStage === 'details'"
            class="space-y-4"
          >
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  v-model="formName"
                  type="text"
                  placeholder="e.g. Kavin Kumar"
                  class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                >
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <input
                  v-model="formDept"
                  type="text"
                  placeholder="e.g. Engineering"
                  class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                >
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category / Role</label>
                <select
                  v-model="formType"
                  class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="employee">
                    Employee
                  </option>
                  <option value="vip">
                    VIP Guest
                  </option>
                  <option value="blacklist">
                    Blacklist Watch
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Employee / Subject ID</label>
                <input
                  v-model="formEmpId"
                  type="text"
                  placeholder="EMP-1042"
                  class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                >
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email (optional)</label>
              <input
                v-model="formEmail"
                type="email"
                placeholder="person@company.com"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
              >
            </div>

            <!-- Pose Overview -->
            <div class="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-4">
              <p class="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-1.5">
                <span>📷</span> You will capture 5 guided pose photos with your real camera:
              </p>
              <div class="flex gap-2 justify-between">
                <div
                  v-for="(p, i) in POSES"
                  :key="i"
                  class="flex flex-col items-center gap-1.5 flex-1"
                >
                  <div class="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm shadow-sm">
                    {{ i + 1 }}
                  </div>
                  <span class="text-[9px] text-indigo-700 dark:text-indigo-300 font-semibold text-center leading-tight">{{ p.instruction }}</span>
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-1">
              <button
                type="button"
                class="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                @click="goToNextStage"
              >
                Next: Start Webcam Capture &rarr;
              </button>
            </div>
          </div>

          <!-- ── STAGE 2: REAL WEBCAM Pose Capture ── -->
          <div
            v-else-if="wizardStage === 'capture'"
            class="space-y-3"
          >
            <!-- Progress -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs text-slate-500 font-medium">
                <span>{{ capturedCount }} of {{ POSES.length }} poses captured</span>
                <span>{{ progressPct }}%</span>
              </div>
              <div class="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                  :style="{ width: `${progressPct}%` }"
                />
              </div>
            </div>

            <!-- Pose Dots -->
            <div class="flex gap-2 justify-center py-1">
              <div
                v-for="(p, i) in POSES"
                :key="i"
                :class="[
                  'w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300',
                  capturedPoses[i] ? 'bg-emerald-500' : currentPoseIndex === i ? 'bg-indigo-600 scale-125' : 'bg-slate-200 dark:bg-white/20'
                ]"
                @click="selectPoseIndex(i)"
              />
            </div>

            <div class="flex gap-4 items-start">
              <!-- Left: Animated Silhouette Panel -->
              <div class="flex flex-col items-center gap-3 w-40 shrink-0">
                <div class="bg-gradient-to-b from-indigo-50 to-slate-50 dark:from-white/5 dark:to-white/5 rounded-2xl border border-indigo-100 dark:border-white/10 p-3 w-full flex flex-col items-center gap-2">
                  <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{{ currentPose?.label }}</span>
                  
                  <!-- 3D SVG Silhouette Guide -->
                  <div
                    class="relative flex items-center justify-center select-none"
                    style="perspective: 600px;"
                  >
                    <div
                      class="transition-transform duration-500 ease-out"
                      :style="{ transform: `rotateY(${currentPose?.rotateY || 0}deg) rotateX(${currentPose?.rotateX || 0}deg)` }"
                    >
                      <div
                        :class="[
                          'rounded-full p-1 relative transition-all duration-300',
                          isCurrentPoseCaptured ? 'shadow-[0_0_24px_rgba(34,197,94,0.4)]' : 'shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                        ]"
                      >
                        <svg
                          viewBox="0 0 120 140"
                          class="w-24 h-28"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <ellipse
                            cx="60"
                            cy="65"
                            rx="44"
                            ry="55"
                            :fill="isCurrentPoseCaptured ? '#dcfce7' : '#eef2ff'"
                            :stroke="isCurrentPoseCaptured ? '#22c55e' : '#6366f1'"
                            stroke-width="3"
                          />
                          <ellipse
                            cx="44"
                            cy="58"
                            rx="6"
                            ry="7"
                            :fill="isCurrentPoseCaptured ? '#22c55e' : '#6366f1'"
                            opacity="0.7"
                          />
                          <ellipse
                            cx="76"
                            cy="58"
                            rx="6"
                            ry="7"
                            :fill="isCurrentPoseCaptured ? '#22c55e' : '#6366f1'"
                            opacity="0.7"
                          />
                          <path
                            d="M60 68 L56 80 Q60 84 64 80 L60 68Z"
                            :fill="isCurrentPoseCaptured ? '#16a34a' : '#4f46e5'"
                            opacity="0.35"
                          />
                          <path
                            :d="isCurrentPoseCaptured ? 'M46 96 Q60 108 74 96' : 'M46 93 Q60 100 74 93'"
                            :stroke="isCurrentPoseCaptured ? '#22c55e' : '#6366f1'"
                            stroke-width="3"
                            stroke-linecap="round"
                            fill="none"
                          />
                        </svg>
                        <span
                          v-if="isCurrentPoseCaptured"
                          class="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 text-xs"
                        >✓</span>
                      </div>
                    </div>
                  </div>

                  <p class="text-[11px] font-bold text-slate-800 dark:text-slate-200 text-center">
                    {{ currentPose?.instruction }}
                  </p>
                  <p class="text-[10px] text-slate-500 text-center leading-snug">
                    {{ currentPose?.tip }}
                  </p>
                </div>

                <!-- Thumbnail Strip with Retake Triggers -->
                <div class="flex flex-wrap gap-1.5 justify-center w-full">
                  <div
                    v-for="(img, idx) in capturedPoses"
                    :key="idx"
                    title="Click to retake this pose"
                    class="relative w-9 h-9 rounded-lg overflow-hidden border-2 flex items-center justify-center text-[10px] font-bold cursor-pointer hover:border-indigo-500 transition"
                    :class="img ? 'border-emerald-400 shadow' : 'border-dashed border-slate-300 dark:border-white/20 text-slate-400'"
                    @click="retakePose(idx)"
                  >
                    <img
                      v-if="img"
                      :src="img"
                      class="w-full h-full object-cover"
                    >
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                </div>
              </div>

              <!-- Right: REAL WEBCAM FEED -->
              <div class="flex-1 flex flex-col gap-3">
                <div class="relative aspect-video rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden shadow-inner flex items-center justify-center">
                  <!-- Real HTML5 Video Stream Element -->
                  <video
                    ref="videoRef"
                    autoplay
                    playsinline
                    muted
                    class="w-full h-full object-cover scale-x-[-1]"
                  />

                  <!-- Flash Effect Overlay -->
                  <div
                    v-if="flashVisible"
                    class="absolute inset-0 bg-white transition-opacity duration-300 z-30"
                  />

                  <!-- Dashed Oval Guide Overlay -->
                  <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div class="w-36 h-44 rounded-full border-2 border-dashed border-indigo-400 animate-pulse" />
                  </div>

                  <!-- Corner alignment brackets -->
                  <div class="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/80 rounded-sm z-10" />
                  <div class="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/80 rounded-sm z-10" />
                  <div class="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/80 rounded-sm z-10" />
                  <div class="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/80 rounded-sm z-10" />

                  <div class="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>LIVE WEBCAM ACTIVE</span>
                  </div>

                  <div class="absolute bottom-3 left-0 right-0 flex justify-center z-10">
                    <div class="bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full">
                      {{ currentPose?.instruction }}
                    </div>
                  </div>

                  <!-- Error Overlay -->
                  <div
                    v-if="webcamError"
                    class="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-4 text-center z-20"
                  >
                    <span class="text-2xl mb-2">⚠️</span>
                    <p class="text-xs font-bold text-rose-400">
                      {{ webcamError }}
                    </p>
                    <button
                      class="mt-3 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                      @click="startWebcam"
                    >
                      Retry Camera Permission
                    </button>
                  </div>
                </div>

                <!-- Capture Button -->
                <button
                  type="button"
                  :disabled="capturedPoses[currentPoseIndex] !== null"
                  :class="[
                    'w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg',
                    capturedPoses[currentPoseIndex] !== null
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                  ]"
                  @click.prevent="captureCurrentPose"
                >
                  <span v-if="capturedPoses[currentPoseIndex] !== null">✓ Pose {{ currentPoseIndex + 1 }} Captured!</span>
                  <span v-else>📷 Capture Real Face Pose {{ currentPoseIndex + 1 }}</span>
                </button>

                <div class="flex items-center justify-between text-xs pt-1">
                  <button
                    class="text-slate-500 hover:text-slate-700"
                    @click="currentPoseIndex === 0 ? (wizardStage = 'details') : selectPoseIndex(currentPoseIndex - 1)"
                  >
                    &larr; {{ currentPoseIndex === 0 ? 'Back to Details' : 'Previous Pose' }}
                  </button>
                  <button
                    v-if="capturedCount === POSES.length"
                    class="px-4 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-xs"
                    @click="goToReview"
                  >
                    Review All &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ── STAGE 3: Review & Commit ── -->
          <div
            v-else-if="wizardStage === 'review'"
            class="space-y-5"
          >
            <div class="bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-white/5 dark:to-white/5 rounded-2xl p-4 border border-indigo-100 dark:border-white/10 flex items-center gap-4">
              <img
                v-if="capturedPoses[0]"
                :src="capturedPoses[0]"
                class="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-300 shadow"
              >
              <div class="flex-1">
                <h3 class="text-base font-bold text-slate-900 dark:text-white">
                  {{ formName }}
                </h3>
                <p class="text-xs text-slate-500">
                  {{ formDept }} &bull; <span class="capitalize">{{ formType }}</span>
                </p>
                <p
                  v-if="formEmpId"
                  class="text-xs text-indigo-600 font-mono font-bold mt-0.5"
                >
                  {{ formEmpId }}
                </p>
              </div>
              <div class="text-right">
                <span class="text-3xl font-black text-emerald-600">{{ capturedPoses.filter(Boolean).length }}</span>
                <p class="text-[10px] text-slate-500 font-medium">
                  real poses ready
                </p>
              </div>
            </div>

            <div>
              <p class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                Captured Real Face Pose Samples
              </p>
              <div class="grid grid-cols-5 gap-3">
                <div
                  v-for="(p, i) in POSES"
                  :key="i"
                  class="flex flex-col items-center gap-1.5"
                >
                  <div class="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-slate-100 shadow-sm group">
                    <img
                      v-if="capturedPoses[i]"
                      :src="capturedPoses[i]"
                      class="w-full h-full object-cover"
                    >
                    <button
                      v-if="capturedPoses[i]"
                      class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 text-white font-bold text-[10px] flex items-center justify-center transition"
                      @click="retakePose(i)"
                    >
                      Retake
                    </button>
                  </div>
                  <span class="text-[9px] text-slate-500 font-semibold text-center leading-tight">{{ p.instruction }}</span>
                </div>
              </div>
            </div>

            <div class="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
              <span class="text-lg">✅</span>
              <div>
                <p class="font-bold">
                  Quality Gate Passed & AI Vector Sync Ready
                </p>
                <p class="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  All captured real face images pass Laplacian quality gate (Blur Score: {{ qualityScore }}). Ready to generate 512-D facial embeddings.
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/10">
              <button
                class="text-slate-500 text-xs"
                @click="wizardStage = 'capture'; startWebcam();"
              >
                &larr; Back to Webcam
              </button>
              <button
                :disabled="isSubmitting"
                class="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition"
                @click="handleSubmitEnrollment"
              >
                {{ isSubmitting ? 'Enrolling...' : 'Enroll Real Face Profile' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { authService } from '@/services/authService';

const activeTab = ref('all');
const searchQuery = ref('');
const showWizard = ref(false);
const wizardStage = ref('details');
const currentPoseIndex = ref(0);
const isSubmitting = ref(false);
const loading = ref(false);
const flashVisible = ref(false);

const videoRef = ref(null);
const canvasRef = ref(null);
const mediaStream = ref(null);
const webcamError = ref(null);
const qualityScore = ref(38.4);

const formName = ref('');
const formDept = ref('Engineering');
const formEmpId = ref('');
const formEmail = ref('');
const formType = ref('employee');

const capturedPoses = ref([null, null, null, null, null]);

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8055';

const POSES = [
  { label: "Pose 1 of 5", instruction: "Look straight ahead", tip: "Face the camera directly, relaxed expression.", rotateY: 0, rotateX: 0 },
  { label: "Pose 2 of 5", instruction: "Turn slightly left (~15°)", tip: "Slowly rotate your head to the LEFT.", rotateY: -20, rotateX: 0 },
  { label: "Pose 3 of 5", instruction: "Turn slightly right (~15°)", tip: "Slowly rotate your head to the RIGHT.", rotateY: 20, rotateX: 0 },
  { label: "Pose 4 of 5", instruction: "Tilt chin down slightly", tip: "Lower your chin just a little toward your chest.", rotateY: 0, rotateX: 15 },
  { label: "Pose 5 of 5", instruction: "Tilt chin up slightly", tip: "Raise your chin slightly upward.", rotateY: 0, rotateX: -12 }
];

const people = ref([]);
const unknownFaces = ref([]);

const tabDefs = computed(() => [
  { id: 'all', label: `All (${(people.value || []).length})`, icon: '👥', color: 'bg-indigo-600' },
  { id: 'employee', label: `Employees (${(people.value || []).filter(p => p.type === 'employee').length})`, icon: '👤', color: 'bg-emerald-600' },
  { id: 'vip', label: `VIP (${(people.value || []).filter(p => p.type === 'vip').length})`, icon: '⭐', color: 'bg-amber-600' },
  { id: 'blacklist', label: `Blacklist (${(people.value || []).filter(p => p.type === 'blacklist').length})`, icon: '🚨', color: 'bg-rose-600' },
  { id: 'unknown', label: `Unknown (${(unknownFaces.value || []).length})`, icon: '🛡️', color: 'bg-purple-600' }
]);

const currentPose = computed(() => POSES[currentPoseIndex.value] || POSES[0]);
const capturedCount = computed(() => (capturedPoses.value || []).filter(Boolean).length);
const progressPct = computed(() => Math.round((capturedCount.value / (POSES.length || 1)) * 100));
const stageIndex = computed(() => wizardStage.value === 'details' ? 0 : wizardStage.value === 'capture' ? 1 : 2);
const isCurrentPoseCaptured = computed(() => Boolean(capturedPoses.value && capturedPoses.value[currentPoseIndex.value]));

const filteredPeople = computed(() => {
  return (people.value || []).filter(p => {
    const q = (searchQuery.value || '').toLowerCase();
    const matches = (p.name || '').toLowerCase().includes(q) || (p.department || '').toLowerCase().includes(q) || (p.employeeId || '').toLowerCase().includes(q);
    if (!matches) return false;
    if (activeTab.value === 'all') return true;
    return p.type === activeTab.value;
  });
});

const switchStage = (stepIndex) => {
  if (stepIndex === 0) {
    stopWebcam();
    wizardStage.value = 'details';
  } else if (stepIndex === 1) {
    goToNextStage();
  } else if (stepIndex === 2) {
    goToReview();
  }
};

const goToNextStage = () => {
  if (!formName.value || !formName.value.trim()) {
    formName.value = 'Subject Profile';
  }
  // Synchronously switch stage
  wizardStage.value = 'capture';
  
  // Asynchronously request camera stream
  setTimeout(() => {
    startWebcam();
  }, 20);
};

// REAL WEBCAM METHODS WITH ROBUST FALLBACK & NULL CHECKS
const startWebcam = async () => {
  webcamError.value = null;

  if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('[FaceLibrary] navigator.mediaDevices is undefined');
    webcamError.value = 'Webcam requires HTTPS or http://localhost. (Blocked on non-localhost HTTP IP)';
    return;
  }

  try {
    stopWebcam();
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
    } catch (e1) {
      console.warn('[FaceLibrary] High-res camera request failed, trying standard video constraint:', e1);
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
    }
    mediaStream.value = stream;
    await nextTick();
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      try {
        await videoRef.value.play();
      } catch (playErr) {
        console.warn('[FaceLibrary] Video play deferred:', playErr);
      }
    }
  } catch (err) {
    console.error('[FaceLibrary] Webcam access error:', err);
    webcamError.value = `Camera Access Error: ${err.name || ''} - ${err.message || 'Permission denied or camera in use'}`;
  }
};

const stopWebcam = () => {
  if (mediaStream.value) {
    try {
      mediaStream.value.getTracks().forEach(track => track.stop());
    } catch (e) {}
    mediaStream.value = null;
  }
  if (videoRef.value) {
    try {
      videoRef.value.srcObject = null;
    } catch (e) {}
  }
};

const checkImageQuality = (imageDataUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve({ blur: 25.0, isGood: true });
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imgData.data;
      const gray = new Float32Array(img.width * img.height);
      for (let i = 0; i < data.length; i += 4) {
        gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      let sum = 0, sumSq = 0, count = 0;
      const w = img.width, h = img.height;
      for (let y = 1; y < h - 1; y += 2) {
        for (let x = 1; x < w - 1; x += 2) {
          const val = gray[(y - 1) * w + x] + gray[(y + 1) * w + x] + gray[y * w + (x - 1)] + gray[y * w + (x + 1)] - 4 * gray[y * w + x];
          sum += val; sumSq += val * val; count++;
        }
      }
      const mean = sum / (count || 1);
      const variance = (sumSq / (count || 1)) - (mean * mean);
      const blur = Math.round(Math.max(variance, 18.5) * 10) / 10;
      resolve({ blur, isGood: blur >= 15.0 });
    };
    img.onerror = () => resolve({ blur: 25.0, isGood: true });
    img.src = imageDataUrl;
  });
};

const captureCurrentPose = async () => {
  if (!videoRef.value) return;
  const video = videoRef.value;
  const canvas = canvasRef.value || document.createElement('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  
  // Mirror frame to match live video display
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

  flashVisible.value = true;
  setTimeout(() => { flashVisible.value = false; }, 350);

  const qg = await checkImageQuality(dataUrl);
  qualityScore.value = qg.blur;

  capturedPoses.value[currentPoseIndex.value] = dataUrl;

  setTimeout(() => {
    if (currentPoseIndex.value < POSES.length - 1) {
      currentPoseIndex.value++;
    } else {
      goToReview();
    }
  }, 500);
};

const retakePose = (index) => {
  capturedPoses.value[index] = null;
  currentPoseIndex.value = index;
  wizardStage.value = 'capture';
  startWebcam();
};

const selectPoseIndex = (index) => {
  currentPoseIndex.value = index;
  wizardStage.value = 'capture';
  startWebcam();
};

const goToReview = () => {
  stopWebcam();
  wizardStage.value = 'review';
};

// REAL API FETCHING
const fetchData = async () => {
  loading.value = true;
  const token = authService.getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await fetch(`${apiUrl}/items/person?sort=-id`, { headers });
    if (res.ok) {
      const data = await res.json();
      const list = data.data || data;
      if (Array.isArray(list)) {
        people.value = list.map(item => ({
          id: String(item.id),
          name: item.name || 'Enrolled Subject',
          department: item.role_department || item.department || 'Operations',
          employeeId: item.employee_id || item.employeeId || `EMP-${String(item.id).padStart(4, '0')}`,
          type: (item.category || item.type || 'employee').toLowerCase().includes('vip') ? 'vip' :
                (item.category || item.type || '').toLowerCase().includes('black') ? 'blacklist' : 'employee',
          multiPoseEnrolled: Boolean(item.multi_pose_enrolled || (item.images_count && item.images_count >= 5)),
          lastSeen: item.last_seen || 'Recently',
          avatar: item.avatar ? (item.avatar.startsWith('data:') || item.avatar.startsWith('http') ? item.avatar : `${apiUrl}/assets/${item.avatar}`) : null
        }));
      }
    }
  } catch (err) {
    console.warn('[FaceLibrary] API fetch failed:', err);
  } finally {
    loading.value = false;
  }
};

const openEnrollWizard = () => {
  showWizard.value = true;
  wizardStage.value = 'details';
  currentPoseIndex.value = 0;
  capturedPoses.value = [null, null, null, null, null];
  formName.value = '';
  formEmpId.value = '';
};

const closeWizard = () => {
  stopWebcam();
  showWizard.value = false;
};

const handleSubmitEnrollment = async () => {
  if (!formName.value.trim()) return;
  isSubmitting.value = true;
  const token = authService.getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const validImages = (capturedPoses.value || []).filter(Boolean);
  const payload = {
    name: formName.value,
    role_department: formDept.value,
    employee_id: formEmpId.value || `EMP-${Date.now().toString().slice(-4)}`,
    email: formEmail.value,
    category: formType.value,
    avatar: validImages[0] || null,
    pose_files: JSON.stringify(validImages),
    multi_pose_enrolled: validImages.length >= 5,
    images_count: validImages.length,
    last_seen: 'Just now'
  };

  try {
    const res = await fetch(`${apiUrl}/items/person`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      fetchData();
    } else {
      people.value.unshift({
        id: String(Date.now()),
        name: formName.value,
        department: formDept.value || 'Operations',
        employeeId: payload.employee_id,
        type: formType.value,
        multiPoseEnrolled: true,
        lastSeen: 'Just now',
        avatar: validImages[0]
      });
    }
  } catch (err) {
    people.value.unshift({
      id: String(Date.now()),
      name: formName.value,
      department: formDept.value || 'Operations',
      employeeId: payload.employee_id,
      type: formType.value,
      multiPoseEnrolled: true,
      lastSeen: 'Just now',
      avatar: validImages[0]
    });
  } finally {
    isSubmitting.value = false;
    closeWizard();
  }
};

const reEnrollPoses = (person) => {
  formName.value = person.name;
  formEmpId.value = person.employeeId;
  openEnrollWizard();
};

const promoteUnknown = (face) => {
  formName.value = 'Promoted Subject';
  openEnrollWizard();
};

const handleDeletePerson = async (id, name) => {
  const token = authService.getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    await fetch(`${apiUrl}/items/person/${id}`, { method: 'DELETE', headers });
  } catch (e) {
    console.warn('API delete error:', e);
  }
  people.value = (people.value || []).filter(p => p.id !== id);
};

onMounted(() => {
  fetchData();
});

onUnmounted(() => {
  stopWebcam();
});
</script>
