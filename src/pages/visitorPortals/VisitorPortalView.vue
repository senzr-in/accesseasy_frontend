<template>
<<<<<<< HEAD
  <div
    class="vp-root"
    :style="cssVars"
  >
=======
  <div class="vp-root" :class="themeClass" :style="cssVars">

>>>>>>> 93bea48b930ded0358b88cd4b15bd38dedad09b5
    <!-- ── Loading ── -->
    <div
      v-if="loading"
      class="vp-center-screen"
    >
      <div class="vp-spinner" />
      <p class="vp-loading-text">
        Loading Portal...
      </p>
    </div>

    <!-- ── Error ── -->
    <div
      v-else-if="error"
      class="vp-center-screen"
    >
      <div class="vp-error-icon">
        <svg
          width="32"
          height="32"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        /></svg>
      </div>
      <h2 class="vp-error-title">
        Portal Not Found
      </h2>
      <p class="vp-error-msg">
        {{ error }}
      </p>
      <button
        class="vp-btn-primary"
        @click="fetchPortal"
      >
        Retry
      </button>
    </div>

    <!-- ── Main ── -->
    <div
      v-else-if="portal"
      class="vp-page"
    >
      <!-- Navbar -->
      <nav class="vp-nav">
        <div class="vp-nav-brand">
          <img
            v-if="logoUrl"
            :src="logoUrl"
            class="vp-logo"
            @error="logoUrl = null"
          >
          <div
            v-else
            class="vp-logo-placeholder"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            /></svg>
          </div>
          <span class="vp-nav-title">{{ portal.Title }}</span>
        </div>
        <button
          v-if="content.enableRegistrationForm !== false"
          class="vp-btn-primary vp-btn-sm"
          @click="openModal"
        >
          Check In
        </button>
      </nav>

      <!-- Hero -->
      <section class="vp-hero">
        <div class="vp-hero-inner">
          <span class="vp-badge">{{ portal.Title }}</span>
          <h1 class="vp-hero-heading">
            {{ content.heading || 'Welcome to Our Office' }}
          </h1>
          <p class="vp-hero-subtext">
            {{ content.subtext || 'Please register below to receive your visitor pass.' }}
          </p>

          <button
            v-if="content.enableRegistrationForm !== false"
            class="vp-btn-primary vp-btn-lg"
            @click="openModal"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            /></svg>
            {{ content.registrationFormButtonText || 'Register & Get Pass' }}
          </button>

          <div
            v-if="bannerUrl"
            class="vp-banner-wrap"
          >
            <img
              :src="bannerUrl"
              class="vp-banner-img"
              @error="bannerUrl = null"
            >
          </div>
        </div>
      </section>

      <!-- Contact Strip -->
      <section
        v-if="content.enableContact && (content.contactPhone || content.contactEmail)"
        class="vp-contact-strip"
      >
        <a
          v-if="content.contactPhone"
          :href="`https://wa.me/${content.contactPhone.replace(/\D/g,'')}`"
          target="_blank"
          class="vp-contact-btn vp-contact-wa"
        >
          <svg
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 24 24"
          ><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
          WhatsApp
        </a>
        <a
          v-if="content.contactEmail"
          :href="`mailto:${content.contactEmail}`"
          class="vp-contact-btn vp-contact-email"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"
          /></svg>
          Email Us
        </a>
      </section>

      <!-- Footer -->
      <footer class="vp-footer">
        <p>© {{ new Date().getFullYear() }} {{ portal.Title }}. All rights reserved.</p>
        <p class="vp-footer-sub">
          Powered by AccessEasy
        </p>
      </footer>
    </div>

    <!-- ── Modal ── -->
    <Teleport to="body">
      <transition name="vp-modal">
        <div
          v-if="modalOpen"
          class="vp-modal-overlay"
          @click.self="modalOpen = false"
        >
          <div class="vp-modal-panel">
            <!-- Modal Header -->
            <div class="vp-modal-header">
              <div>
                <h2 class="vp-modal-title">
                  {{ content.registrationFormTitle || 'Visitor Check-in' }}
                </h2>
                <p class="vp-modal-desc">
                  {{ content.registrationFormDescription || 'Complete the form to check in.' }}
                </p>
              </div>
              <button
                class="vp-modal-close"
                @click="modalOpen = false"
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                /></svg>
              </button>
            </div>

            <!-- Success -->
            <div
              v-if="submitted"
              class="vp-success"
            >
              <div class="vp-success-icon">
                <svg
                  width="36"
                  height="36"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                /></svg>
              </div>
              <h3 class="vp-success-title">
                Checked In!
              </h3>
              <p class="vp-success-msg">
                Welcome, <strong>{{ visitorData.name }}</strong>. Your visit has been recorded.
              </p>

              <!-- QR Code Block -->
              <div class="vp-qr-block">
                <!-- If backend returned a base64 image -->
                <img
                  v-if="qrToken && qrToken.startsWith('data:image')"
                  :src="qrToken"
                  class="vp-qr-img"
                  alt="Visitor QR Code"
                >
                <!-- If backend returned a token string → render with qrcode.vue -->
                <QrcodeVue
                  v-else-if="qrToken"
                  :value="qrToken"
                  :size="180"
                  level="H"
                  class="vp-qr-img"
                />
                <!-- Fallback if backend hasn't returned a QR yet -->
                <div
                  v-else
                  class="vp-qr-pending"
                >
                  <svg
                    width="32"
                    height="32"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  ><rect
                    x="3"
                    y="3"
                    width="7"
                    height="7"
                    rx="1"
                    stroke-width="2"
                  /><rect
                    x="14"
                    y="3"
                    width="7"
                    height="7"
                    rx="1"
                    stroke-width="2"
                  /><rect
                    x="3"
                    y="14"
                    width="7"
                    height="7"
                    rx="1"
                    stroke-width="2"
                  /><path
                    stroke-width="2"
                    d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"
                  /></svg>
                  <p>QR code will appear here once the backend service is activated.</p>
                </div>
                <p class="vp-qr-label">
                  Show this QR to the security guard at the gate
                </p>
                <button
                  v-if="qrToken"
                  class="vp-qr-download-btn"
                  @click="downloadQR"
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  /></svg>
                  Download QR Pass
                </button>
              </div>

              <div class="vp-success-summary">
                <div class="vp-summary-row">
                  <span>Check-in Time</span><strong>{{ checkInTime }}</strong>
                </div>
                <div class="vp-summary-row">
                  <span>Reason</span><strong>{{ visitorData.reasonForVisit }}</strong>
                </div>
                <div
                  v-if="visitorData.personToMeet"
                  class="vp-summary-row"
                >
                  <span>Meeting</span><strong>{{ visitorData.personToMeet }}</strong>
                </div>
              </div>
              <button
                class="vp-btn-primary vp-btn-full"
                @click="resetModal"
              >
                Done
              </button>
            </div>

            <!-- Form -->
            <!-- Form -->
            <div
              v-else
              class="vp-form-body"
            >
              <!-- Full Name -->
              <div
                v-if="resolvedFields.name.visible"
                class="vp-field"
              >
                <label class="vp-label">{{ resolvedFields.name.label }} <span
                  v-if="resolvedFields.name.required"
                  class="vp-required"
                >*</span></label>
                <input
                  v-model="visitorData.name"
                  type="text"
                  :placeholder="resolvedFields.name.placeholder"
                  class="vp-input"
                  :class="{ 'vp-input-error': errors.name }"
                  @blur="validateField('name')"
                >
                <p
                  v-if="errors.name"
                  class="vp-err-msg"
                >
                  {{ errors.name }}
                </p>
              </div>

              <!-- Mobile Number -->
              <div
                v-if="resolvedFields.mobile.visible"
                class="vp-field"
              >
                <label class="vp-label">{{ resolvedFields.mobile.label }} <span
                  v-if="resolvedFields.mobile.required"
                  class="vp-required"
                >*</span></label>
                <input
                  v-model="visitorData.mobile"
                  type="tel"
                  :placeholder="resolvedFields.mobile.placeholder"
                  class="vp-input"
                  :class="{ 'vp-input-error': errors.mobile }"
                  @blur="validateField('mobile')"
                >
                <p
                  v-if="errors.mobile"
                  class="vp-err-msg"
                >
                  {{ errors.mobile }}
                </p>
              </div>

              <!-- Email Address -->
              <div
                v-if="resolvedFields.email.visible"
                class="vp-field"
              >
                <label class="vp-label">{{ resolvedFields.email.label }} <span
                  v-if="resolvedFields.email.required"
                  class="vp-required"
                >*</span></label>
                <input
                  v-model="visitorData.email"
                  type="email"
                  :placeholder="resolvedFields.email.placeholder"
                  class="vp-input"
                  :class="{ 'vp-input-error': errors.email }"
                  @blur="validateField('email')"
                >
                <p
                  v-if="errors.email"
                  class="vp-err-msg"
                >
                  {{ errors.email }}
                </p>
              </div>

              <!-- Govt ID Type & ID Number -->
              <div
                v-if="resolvedFields.govtId.visible"
                class="vp-field-row"
              >
                <div class="vp-field">
                  <label class="vp-label">{{ resolvedFields.govtId.label }} Type <span
                    v-if="resolvedFields.govtId.required"
                    class="vp-required"
                  >*</span></label>
                  <select
                    v-model="visitorData.govtIdType"
                    class="vp-input vp-select"
                  >
                    <option>Aadhar</option>
                    <option>Driving License</option>
                    <option>Passport</option>
                    <option>Voter ID</option>
                    <option>PAN Card</option>
                  </select>
                </div>
                <div class="vp-field">
                  <label class="vp-label">ID Number <span
                    v-if="resolvedFields.govtId.required"
                    class="vp-required"
                  >*</span></label>
                  <input
                    v-model="visitorData.govtIdNumber"
                    type="text"
                    :placeholder="resolvedFields.govtId.placeholder"
                    class="vp-input"
                    :class="{ 'vp-input-error': errors.govtIdNumber }"
                    @blur="validateField('govtIdNumber')"
                  >
                </div>
              </div>
              <p
                v-if="resolvedFields.govtId.visible && errors.govtIdNumber"
                class="vp-err-msg"
              >
                {{ errors.govtIdNumber }}
              </p>

              <!-- Reason for Visit -->
              <div
                v-if="resolvedFields.reasonForVisit.visible"
                class="vp-field"
              >
                <label class="vp-label">{{ resolvedFields.reasonForVisit.label }} <span
                  v-if="resolvedFields.reasonForVisit.required"
                  class="vp-required"
                >*</span></label>
                <select
                  v-model="visitorData.reasonForVisit"
                  class="vp-input vp-select"
                  :class="{ 'vp-input-error': errors.reasonForVisit }"
                  @change="errors.reasonForVisit = ''"
                >
                  <option value="">
                    {{ resolvedFields.reasonForVisit.placeholder }}
                  </option>
                  <option>Meeting / Appointment</option>
                  <option>Interview</option>
                  <option>Delivery / Courier</option>
                  <option>Vendor / Supplier</option>
                  <option>Client Visit</option>
                  <option>Maintenance / Repair</option>
                  <option>Personal Work</option>
                  <option>Other</option>
                </select>
                <input
                  v-if="visitorData.reasonForVisit === 'Other'"
                  v-model="visitorData.reasonForVisitOther"
                  type="text"
                  placeholder="Please describe..."
                  class="vp-input"
                  style="margin-top:0.5rem;"
                >
                <p
                  v-if="errors.reasonForVisit"
                  class="vp-err-msg"
                >
                  {{ errors.reasonForVisit }}
                </p>
              </div>

              <!-- Person to Meet -->
              <div
                v-if="resolvedFields.personToMeet.visible"
                class="vp-field"
              >
                <label class="vp-label">{{ resolvedFields.personToMeet.label }} <span
                  v-if="resolvedFields.personToMeet.required"
                  class="vp-required"
                >*</span></label>
                <input
                  v-model="visitorData.personToMeet"
                  type="text"
                  :placeholder="resolvedFields.personToMeet.placeholder"
                  class="vp-input"
                  :class="{ 'vp-input-error': errors.personToMeet }"
                  @blur="validateField('personToMeet')"
                >
                <p
                  v-if="errors.personToMeet"
                  class="vp-err-msg"
                >
                  {{ errors.personToMeet }}
                </p>
              </div>

              <!-- Company / Organisation -->
              <div
                v-if="resolvedFields.company.visible"
                class="vp-field"
              >
                <label class="vp-label">{{ resolvedFields.company.label }} <span
                  v-if="resolvedFields.company.required"
                  class="vp-required"
                >*</span></label>
                <input
                  v-model="visitorData.company"
                  type="text"
                  :placeholder="resolvedFields.company.placeholder"
                  class="vp-input"
                  :class="{ 'vp-input-error': errors.company }"
                  @blur="validateField('company')"
                >
                <p
                  v-if="errors.company"
                  class="vp-err-msg"
                >
                  {{ errors.company }}
                </p>
              </div>

              <!-- Photo Upload (configurable) -->
              <div
                v-if="resolvedFields.photo.visible"
                class="vp-field"
              >
                <label class="vp-label">{{ resolvedFields.photo.label }} <span
                  v-if="resolvedFields.photo.required"
                  class="vp-required"
                >*</span><span
                  v-else
                  class="vp-badge-opt"
                >Optional</span></label>
                <div
                  class="vp-upload-box"
                  :class="{ 'vp-input-error': errors.photo }"
                  @click="$refs.photoInput.click()"
                >
                  <img
                    v-if="photoPreview"
                    :src="photoPreview"
                    class="vp-upload-preview"
                  >
                  <div
                    v-else
                    class="vp-upload-placeholder"
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    /><circle
                      cx="12"
                      cy="13"
                      r="3"
                      stroke-width="2"
                    /></svg>
                    <span>{{ resolvedFields.photo.placeholder }}</span>
                  </div>
                </div>
                <input
                  ref="photoInput"
                  type="file"
                  accept="image/*"
                  capture="user"
                  class="hidden"
                  @change="handlePhotoChange"
                >
                <button
                  v-if="photoPreview"
                  class="vp-upload-clear"
                  @click.stop="clearPhoto"
                >
                  Remove photo
                </button>
                <p
                  v-if="errors.photo"
                  class="vp-err-msg"
                >
                  {{ errors.photo }}
                </p>
              </div>

              <!-- Proof Document Upload (configurable) -->
              <div
                v-if="resolvedFields.proofDocument.visible"
                class="vp-field"
              >
                <label class="vp-label">{{ resolvedFields.proofDocument.label }} <span
                  v-if="resolvedFields.proofDocument.required"
                  class="vp-required"
                >*</span><span
                  v-else
                  class="vp-badge-opt"
                >Optional</span></label>
                <div
                  class="vp-upload-box vp-upload-doc"
                  :class="{ 'vp-input-error': errors.proofDocument }"
                  @click="$refs.proofInput.click()"
                >
                  <div
                    v-if="proofFileName"
                    class="vp-upload-doc-selected"
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    /></svg>
                    <span>{{ proofFileName }}</span>
                  </div>
                  <div
                    v-else
                    class="vp-upload-placeholder"
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    /></svg>
                    <span>{{ resolvedFields.proofDocument.placeholder }}</span>
                  </div>
                </div>
                <input
                  ref="proofInput"
                  type="file"
                  accept="image/*,application/pdf"
                  class="hidden"
                  @change="handleProofChange"
                >
                <button
                  v-if="proofFileName"
                  class="vp-upload-clear"
                  @click.stop="clearProof"
                >
                  Remove file
                </button>
                <p
                  v-if="errors.proofDocument"
                  class="vp-err-msg"
                >
                  {{ errors.proofDocument }}
                </p>
              </div>

              <p
                v-if="submitError"
                class="vp-err-msg"
                style="text-align:center;"
              >
                {{ submitError }}
              </p>
            </div>

            <!-- Modal Footer -->
            <div
              v-if="!submitted"
              class="vp-modal-footer"
            >
              <button
                class="vp-btn-primary vp-btn-full"
                :disabled="submitting"
                @click="submitRegistration"
              >
                <svg
                  v-if="submitting"
                  class="vp-spin"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                ><circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  class="vp-spin-track"
                /><path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                /></svg>
                <svg
                  v-else
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                /></svg>
                {{ submitting ? 'Submitting...' : (content.registrationFormButtonText || 'Register & Get Pass') }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import QrcodeVue from 'qrcode.vue';
import QRCode from 'qrcode';

const route = useRoute();

const loading     = ref(true);
const error       = ref(null);
const portal      = ref(null);
const modalOpen   = ref(false);
const submitted   = ref(false);
const submitting  = ref(false);
const submitError = ref('');
const checkInTime = ref('');
const qrToken     = ref('');    // QR token returned from backend
const visitorId   = ref('');   // visitor record ID

// ── File upload state ─────────────────────────────────────────────────────
const photoFile    = ref(null);
const photoPreview = ref(null);
const proofFile    = ref(null);
const proofFileName= ref(null);

const DEFAULT_ASSET_ID = 'b88c5273-ba1e-45db-b874-c34ad791afeb';

const content = computed(() => portal.value?.Contentjson || {});

const assetUrl = (id) => {
  if (!id || id === DEFAULT_ASSET_ID) return null;
  return `${import.meta.env.VITE_API_URL}/assets/${id}?access_token=${import.meta.env.VITE_API_TOKEN}`;
};

const logoUrl   = ref(null);
const bannerUrl = ref(null);

const brandColor = computed(() => content.value.primaryColor || '#2563eb');

const themeClass = computed(() => {
  const t = content.value?.theme || 'Modern Blue';
  return 'theme-' + t.toLowerCase().replace(/\s+/g, '-');
});

// Dynamic Font Loading
const loadedFonts = new Set();
const loadGoogleFont = (fontFamily) => {
  if (!fontFamily || fontFamily === 'Inter' || loadedFonts.has(fontFamily)) return;
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
  loadedFonts.add(fontFamily);
};

// Set CSS vars and theme class on documentElement so Teleport content can access them too
watchEffect(() => {
  const color = brandColor.value;
  document.documentElement.style.setProperty('--vp-brand', color);
  document.documentElement.style.setProperty('--vp-brand-light', color + '20');
  document.documentElement.style.setProperty('--vp-brand-shadow', color + '44');

  const t = content.value?.theme || 'Modern Blue';
  const newClass = 'theme-' + t.toLowerCase().replace(/\s+/g, '-');
  
  document.documentElement.classList.forEach(className => {
    if (className.startsWith('theme-')) {
      document.documentElement.classList.remove(className);
    }
  });
  document.documentElement.classList.add(newClass);

  const newFont = content.value?.fontFamily;
  if (newFont) loadGoogleFont(newFont);
});

onUnmounted(() => {
  document.documentElement.classList.forEach(className => {
    if (className.startsWith('theme-')) {
      document.documentElement.classList.remove(className);
    }
  });
});

// Keep cssVars for vp-root as well (belt-and-suspenders)
const cssVars = computed(() => {
  const color = brandColor.value;
  const fontFamily = content.value?.fontFamily || 'Inter';
  return {
    '--vp-brand': color,
    '--vp-brand-light': color + '20',
    '--vp-brand-shadow': color + '44',
    '--vp-font': `'${fontFamily}', sans-serif`,
  };
});

const defaultFieldsConfig = {
  name: { visible: true, required: true, label: 'Full Name', placeholder: 'John Doe' },
  mobile: { visible: true, required: true, label: 'Mobile Number', placeholder: '+91 98765 43210' },
  email: { visible: false, required: false, label: 'Email Address', placeholder: 'john@example.com' },
  govtId: { visible: true, required: true, label: 'Government ID', placeholder: 'XXXX-XXXX-XXXX' },
  reasonForVisit: { visible: true, required: true, label: 'Reason for Visit', placeholder: 'Select a reason...' },
  personToMeet: { visible: true, required: false, label: 'Person to Meet', placeholder: 'e.g. Rajan Kumar' },
  company: { visible: true, required: false, label: 'Company / Organisation', placeholder: 'e.g. Acme Corp' },
  photo: { visible: false, required: false, label: 'Your Photo', placeholder: 'Tap to take / upload photo' },
  proofDocument: { visible: false, required: false, label: 'ID Proof Document', placeholder: 'Upload ID proof (image or PDF)' }
};

const resolvedFields = computed(() => {
  const config = JSON.parse(JSON.stringify(defaultFieldsConfig));

  if (content.value && content.value.fieldsConfig) {
    Object.keys(config).forEach(key => {
      if (content.value.fieldsConfig[key]) {
        config[key] = { ...config[key], ...content.value.fieldsConfig[key] };
      }
    });
  } else if (content.value) {
    config.photo.visible = !!content.value.enablePhotoUpload;
    config.proofDocument.visible = !!content.value.enableProofUpload;
    config.govtId.required = !content.value.govtIdOptional;
  }

  // Force core fields validation rules
  config.name.visible = true;
  config.name.required = true;
  config.mobile.visible = true;
  config.mobile.required = true;
  config.photo.visible = true; // Ensure photo upload field is always displayed in the form

  return config;
});

const visitorData = ref({
  name: '', mobile: '', email: '', govtIdType: 'Aadhar', govtIdNumber: '',
  reasonForVisit: '', reasonForVisitOther: '', personToMeet: '', company: '',
});
const errors = ref({});

// Fetch Portal
const fetchPortal = async () => {
  loading.value = true;
  error.value   = null;
  const id = route.params.id;
  if (!id) { error.value = 'No portal ID provided'; loading.value = false; return; }

  try {
    const res = await axios.get(`${import.meta.env.VITE_KN_API_URL}/visitor-portal-flow/${id}`, { timeout: 15000 });
    if (res.data.status === 'SUCCESS') {
      let data = res.data.data;
      if (data?.Contentjson && typeof data.Contentjson === 'string') try { data.Contentjson = JSON.parse(data.Contentjson); } catch(e) {}
      if (data?.Assetjson  && typeof data.Assetjson  === 'string') try { data.Assetjson  = JSON.parse(data.Assetjson);  } catch(e) {}
      portal.value  = data;
      logoUrl.value   = assetUrl(data.Assetjson?.images?.logo);
      bannerUrl.value = assetUrl(data.Assetjson?.images?.banner);
      if (data.Title) document.title = `${data.Title} | Visitor Check-in`;
    } else {
      error.value = res.data.message || 'Failed to load portal configuration';
    }
  } catch (err) {
    error.value = err.code === 'ECONNABORTED'
      ? 'Request timed out. Please try again.'
      : (err.response?.data?.message || err.message || 'Failed to load portal.');
  } finally {
    loading.value = false;
  }
};

const openModal  = () => { submitted.value = false; submitError.value = ''; modalOpen.value = true; };
const resetModal = () => {
  modalOpen.value = false; submitted.value = false;
  qrToken.value = ''; visitorId.value = '';
  photoFile.value = null; photoPreview.value = null;
  proofFile.value = null; proofFileName.value = null;
  visitorData.value = { name:'', mobile:'', email:'', govtIdType:'Aadhar', govtIdNumber:'', reasonForVisit:'', reasonForVisitOther:'', personToMeet:'', company:'' };
  errors.value = {};
};

// Download QR Code
const downloadQR = async () => {
  const fileName = `visitor-pass-${visitorData.value.name.replace(/\s+/g,'-')}-${new Date().toISOString().split('T')[0]}.png`;

  try {
    if (qrToken.value.startsWith('data:image')) {
      // It's already a base64 image — direct download
      const link = document.createElement('a');
      link.href = qrToken.value;
      link.download = fileName;
      link.click();
    } else if (qrToken.value) {
      // Render token string to canvas → download PNG
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, qrToken.value, {
        width: 300, margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      });
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    }
  } catch (e) {
    console.error('QR download error:', e);
  }
};

const validateField = (f) => {
  errors.value[f] = '';
  const fieldSetting = resolvedFields.value[f];

  // If field is not visible, don't validate it
  if (fieldSetting && !fieldSetting.visible) return;

  if (f === 'name') {
    if (!visitorData.value.name.trim()) {
      errors.value.name = `${resolvedFields.value.name.label} is required`;
    }
  } else if (f === 'mobile') {
    if (!visitorData.value.mobile.trim()) {
      errors.value.mobile = `${resolvedFields.value.mobile.label} is required`;
    }
  } else if (f === 'email') {
    const val = visitorData.value.email.trim();
    if (resolvedFields.value.email.required && !val) {
      errors.value.email = `${resolvedFields.value.email.label} is required`;
    } else if (val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        errors.value.email = 'Please enter a valid email address';
      }
    }
  } else if (f === 'govtIdNumber') {
    if (resolvedFields.value.govtId.required && !visitorData.value.govtIdNumber.trim()) {
      errors.value.govtIdNumber = 'ID number is required';
    }
  } else if (f === 'personToMeet') {
    if (resolvedFields.value.personToMeet.required && !visitorData.value.personToMeet.trim()) {
      errors.value.personToMeet = `${resolvedFields.value.personToMeet.label} is required`;
    }
  } else if (f === 'company') {
    if (resolvedFields.value.company.required && !visitorData.value.company.trim()) {
      errors.value.company = `${resolvedFields.value.company.label} is required`;
    }
  } else if (f === 'photo') {
    if (resolvedFields.value.photo.required && !photoFile.value) {
      errors.value.photo = 'Photo upload is required';
    }
  } else if (f === 'proofDocument') {
    if (resolvedFields.value.proofDocument.required && !proofFile.value) {
      errors.value.proofDocument = 'ID Proof Document is required';
    }
  }
};

const validate = () => {
  errors.value = {};

  Object.keys(resolvedFields.value).forEach(key => {
    if (key === 'govtId') {
      validateField('govtIdNumber');
    } else {
      validateField(key);
    }
  });

  if (resolvedFields.value.reasonForVisit.visible) {
    if (resolvedFields.value.reasonForVisit.required && !visitorData.value.reasonForVisit) {
      errors.value.reasonForVisit = 'Please select a reason';
    } else if (visitorData.value.reasonForVisit === 'Other' && !visitorData.value.reasonForVisitOther.trim()) {
      errors.value.reasonForVisit = 'Please describe the reason';
    }
  }

  return !Object.values(errors.value).some(Boolean);
};

// ── File handlers ─────────────────────────────────────────────────────────
const handlePhotoChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  photoFile.value    = file;
  photoPreview.value = URL.createObjectURL(file);
  errors.value.photo = '';
};
const clearPhoto = () => { photoFile.value = null; photoPreview.value = null; };

const handleProofChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  proofFile.value     = file;
  proofFileName.value = file.name;
  errors.value.proofDocument = '';
};
const clearProof = () => { proofFile.value = null; proofFileName.value = null; };

// Upload a file to Directus and return the file ID
const uploadToDirectus = async (file, prefix) => {
  const formData = new FormData();
  formData.append('file', file, `${prefix}-${Date.now()}-${file.name}`);
  const res = await axios.post(`${import.meta.env.VITE_API_URL}/files`, formData, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data?.data?.id || null;
};

const submitRegistration = async () => {
  submitError.value = '';
  if (!validate()) return;
  submitting.value = true;
  try {
    const reason = visitorData.value.reasonForVisit === 'Other'
      ? visitorData.value.reasonForVisitOther : visitorData.value.reasonForVisit;
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const timeNow = today.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ':00';

    // Upload files to Directus if provided
    let photoId = null;
    let proofDocumentId = null;
    if (photoFile.value) {
      try { photoId = await uploadToDirectus(photoFile.value, 'visitor-photo'); }
      catch(e) {
        console.error('Photo upload failed:', e.message);
        throw new Error('Failed to upload photo. Please try again.');
      }
    }
    if (proofFile.value) {
      try { proofDocumentId = await uploadToDirectus(proofFile.value, 'visitor-proof'); }
      catch(e) {
        console.error('Proof upload failed:', e.message);
        throw new Error('Failed to upload proof document. Please try again.');
      }
    }

    const payload = {
      personName: visitorData.value.name,
      mobileNumber: visitorData.value.mobile,
      email: visitorData.value.email || '',
      startDate,
      endDate: startDate,
      startTime: timeNow,
      endTime: '23:59:59',
      status: 'active',
      quantity: 1,
      tenant: { tenantId: portal.value.tenant },
      personToMeet: resolvedFields.value.personToMeet.visible ? visitorData.value.personToMeet : '',
      reasonForVisit: resolvedFields.value.reasonForVisit.visible ? reason : '',
      govtIdType: resolvedFields.value.govtId.visible ? visitorData.value.govtIdType : '',
      govtIdNumber: resolvedFields.value.govtId.visible ? visitorData.value.govtIdNumber : '',
      portalId: portal.value.id,
      photo: photoId || null,
      proofDocument: proofDocumentId || null,
    };

    const res = await axios.post(`${import.meta.env.VITE_KN_API_URL}/visitor-portal-flow/visitor`, payload);
    if (res.data.status !== 'SUCCESS') throw new Error(res.data.message || 'Submission failed');

    // Capture QR token from backend response
    qrToken.value   = res.data.data?.qrToken || res.data.data?.generated_Qr || '';
    visitorId.value = res.data.data?.visitorId || res.data.data?.id || '';

    checkInTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    submitted.value = true;
  } catch (err) {
    submitError.value = err.response?.data?.message || err.message || 'Failed to submit. Please try again.';
  } finally {
    submitting.value = false;
  }
};

onMounted(fetchPortal);
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* Global Theme variables applied to documentElement */
:root, .theme-modern-blue {
  --vp-bg: #f8fafc;
  --vp-text: #0f172a;
  --vp-text-muted: #64748b;
  --vp-text-light: #94a3b8;
  --vp-nav-bg: rgba(255, 255, 255, 0.8);
  --vp-nav-border: rgba(226, 232, 240, 0.8);
  --vp-card-bg: #ffffff;
  --vp-card-border: #f1f5f9;
  --vp-input-bg: #f8fafc;
  --vp-input-border: #e2e8f0;
  --vp-input-text: #0f172a;
  --vp-success-bg: #f8fafc;
  --vp-success-border: #e2e8f0;
}

.theme-classic-dark {
  --vp-bg: #0f172a;
  --vp-text: #f8fafc;
  --vp-text-muted: #cbd5e1;
  --vp-text-light: #94a3b8;
  --vp-nav-bg: rgba(15, 23, 42, 0.8);
  --vp-nav-border: rgba(51, 65, 85, 0.8);
  --vp-card-bg: #1e293b;
  --vp-card-border: #334155;
  --vp-input-bg: #0f172a;
  --vp-input-border: #334155;
  --vp-input-text: #ffffff;
  --vp-success-bg: #0f172a;
  --vp-success-border: #334155;
}

.theme-nature-green {
  --vp-bg: #f0fdf4;
  --vp-text: #064e3b;
  --vp-text-muted: #047857;
  --vp-text-light: #34d399;
  --vp-nav-bg: rgba(240, 253, 244, 0.8);
  --vp-nav-border: rgba(209, 250, 229, 0.8);
  --vp-card-bg: #ffffff;
  --vp-card-border: #d1fae5;
  --vp-input-bg: #f0fdf4;
  --vp-input-border: #a7f3d0;
  --vp-input-text: #064e3b;
  --vp-success-bg: #f0fdf4;
  --vp-success-border: #a7f3d0;
}

.theme-sunset-orange {
  --vp-bg: #fffaf5;
  --vp-text: #431407;
  --vp-text-muted: #c2410c;
  --vp-text-light: #fb923c;
  --vp-nav-bg: rgba(255, 250, 245, 0.8);
  --vp-nav-border: rgba(255, 237, 213, 0.8);
  --vp-card-bg: #ffffff;
  --vp-card-border: #ffedd5;
  --vp-input-bg: #fffaf5;
  --vp-input-border: #fed7aa;
  --vp-input-text: #431407;
  --vp-success-bg: #fffaf5;
  --vp-success-border: #fed7aa;
}
</style>

<style scoped>
/* ── Root ── */
.vp-root {
  font-family: var(--vp-font, 'Inter', sans-serif);
  min-height: 100vh;
  background: var(--vp-bg);
  color: var(--vp-text);
  -webkit-font-smoothing: antialiased;
}

/* ── Loading / Error centering ── */
.vp-center-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.vp-spinner {
  width: 40px; height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--vp-brand);
  border-radius: 50%;
  animation: vp-spin 0.8s linear infinite;
}
@keyframes vp-spin { to { transform: rotate(360deg); } }

.vp-loading-text { font-size: 0.75rem; font-weight: 700; color: var(--vp-text-light); letter-spacing: 0.1em; text-transform: uppercase; }

.vp-error-icon {
  width: 72px; height: 72px; border-radius: 50%;
  background: #fff1f2; color: #f43f5e;
  display: flex; align-items: center; justify-content: center;
}
.vp-error-title { font-size: 1.5rem; font-weight: 900; color: var(--vp-text); }
.vp-error-msg   { font-size: 0.875rem; color: var(--vp-text-muted); max-width: 280px; }

/* ── Navbar ── */
.vp-nav {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--vp-nav-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--vp-nav-border);
  box-shadow: 0 1px 20px rgba(0,0,0,0.04);
}
.vp-nav-brand { display: flex; align-items: center; gap: 0.625rem; }
.vp-logo { width: 36px; height: 36px; object-fit: contain; border-radius: 8px; }
.vp-logo-placeholder {
  width: 36px; height: 36px; border-radius: 8px;
  background: var(--vp-brand-light);
  color: var(--vp-brand);
  display: flex; align-items: center; justify-content: center;
}
.vp-nav-title { font-size: 1rem; font-weight: 800; color: var(--vp-text); letter-spacing: -0.02em; }

/* ── Buttons ── */
.vp-btn-primary {
  display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 0.5rem !important;
  background: var(--vp-brand) !important;
  background-color: var(--vp-brand) !important;
  background-image: none !important;
  color: #fff !important;
  font-family: var(--vp-font, 'Inter', sans-serif) !important;
  font-weight: 700 !important;
  font-size: 0.875rem !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 9999px !important;
  border: none !important;
  cursor: pointer !important;
  box-shadow: 0 4px 14px var(--vp-brand-shadow) !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s !important;
  text-decoration: none !important;
  opacity: 1 !important;
}
.vp-btn-primary:hover:not(:disabled) { transform: translateY(-2px) !important; box-shadow: 0 8px 24px var(--vp-brand-shadow) !important; }
.vp-btn-primary:active:not(:disabled) { transform: translateY(0) !important; }
.vp-btn-primary:disabled { opacity: 0.6 !important; cursor: not-allowed !important; }
.vp-btn-sm  { padding: 0.5rem 1.25rem !important; font-size: 0.8rem !important; }
.vp-btn-lg  { padding: 1rem 2rem !important; font-size: 1rem !important; }
.vp-btn-full { width: 100% !important; border-radius: 0.875rem !important; padding: 1rem !important; }

/* ── Hero ── */
.vp-hero { padding: 5rem 1.5rem 4rem; }
.vp-hero-inner { max-width: 700px; margin: 0 auto; text-align: center; }

.vp-badge {
  display: inline-block;
  padding: 0.25rem 1rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--vp-brand);
  background: var(--vp-brand-light);
  margin-bottom: 1.5rem;
}

.vp-hero-heading {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  color: var(--vp-text);
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}

.vp-hero-subtext {
  font-size: 1.1rem;
  color: var(--vp-text-muted);
  font-weight: 500;
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 480px;
  margin-left: auto; margin-right: auto;
}

.vp-banner-wrap {
  margin-top: 2.5rem;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  border: 1px solid var(--vp-card-border);
}
.vp-banner-img { width: 100%; display: block; max-height: 380px; object-fit: cover; }

/* ── Contact ── */
.vp-contact-strip {
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: 0.75rem; padding: 0 1.5rem 3rem;
}
.vp-contact-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.875rem; font-weight: 700;
  color: #fff; border: none; cursor: pointer;
  text-decoration: none;
  transition: opacity 0.2s, transform 0.2s;
}
.vp-contact-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.vp-contact-wa    { background: #22c55e; }
.vp-contact-email { background: var(--vp-brand); }

/* ── Footer ── */
.vp-footer {
  border-top: 1px solid var(--vp-nav-border);
  background: var(--vp-bg);
  padding: 2rem 1.5rem;
  text-align: center;
}
.vp-footer p      { font-size: 0.75rem; font-weight: 600; color: var(--vp-text-light); }
.vp-footer-sub    { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: var(--vp-text-light); opacity: 0.5; margin-top: 0.25rem; }

/* ── Modal Overlay ── */
.vp-modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  display: flex; align-items: flex-end;
  justify-content: center;
  background: rgba(15,23,42,0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 0;
}
@media (min-width: 640px) {
  .vp-modal-overlay { align-items: center; padding: 1.5rem; }
  .vp-modal-panel {
    border-radius: 1.5rem !important;
    max-height: 85vh;
  }
}

/* ── Modal Panel ── */
.vp-modal-panel {
  position: relative;
  width: 100%; max-width: 520px;
  background: var(--vp-card-bg);
  border-radius: 1.5rem 1.5rem 0 0;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.15);
  height: 92dvh;
  max-height: 92dvh;
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* ── Modal Header ── */
.vp-modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--vp-card-border);
  flex-shrink: 0;
}
.vp-modal-title { font-size: 1.125rem; font-weight: 800; color: var(--vp-text); }
.vp-modal-desc  { font-size: 0.75rem; color: var(--vp-text-light); font-weight: 500; margin-top: 0.25rem; }
.vp-modal-close {
  padding: 0.375rem; border-radius: 0.5rem; border: none; cursor: pointer;
  background: transparent; color: var(--vp-text-light); display: flex; align-items: center;
  transition: background 0.2s, color 0.2s;
}
.vp-modal-close:hover { background: var(--vp-input-bg); color: var(--vp-text); }

/* ── Form Body ── */
.vp-form-body {
  flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem;
  display: flex; flex-direction: column; gap: 1rem;
}
.vp-field { display: flex; flex-direction: column; gap: 0.375rem; }
.vp-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.vp-label { font-size: 0.7rem; font-weight: 800; color: var(--vp-text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
.vp-required { color: #f43f5e; }

.vp-input {
  width: 100%; height: 3rem; padding: 0 1rem;
  border: 1.5px solid var(--vp-input-border); border-radius: 0.75rem;
  background: var(--vp-input-bg); font-family: var(--vp-font, 'Inter', sans-serif);
  font-size: 0.875rem; font-weight: 500; color: var(--vp-input-text);
  outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  box-sizing: border-box;
}
.vp-input:focus {
  border-color: var(--vp-brand); background: var(--vp-card-bg);
  box-shadow: 0 0 0 3px var(--vp-brand-light);
}
.vp-input-error { border-color: #f43f5e !important; }
.vp-select { cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3e%3c/svg%3e");
  background-repeat: no-repeat; background-position: right 0.875rem center; background-size: 1rem;
  padding-right: 2.5rem;
}
.vp-err-msg { font-size: 0.7rem; color: #f43f5e; font-weight: 600; }

/* ── Modal Footer ── */
.vp-modal-footer {
  padding: 1rem 1.5rem 1.25rem;
  border-top: 1px solid var(--vp-card-border);
  flex-shrink: 0;
  background: var(--vp-card-bg);
  margin-top: auto;
}

/* ── Success ── */
.vp-success {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.75rem; padding: 1.5rem 1.5rem 1.5rem; text-align: center;
}
.vp-success-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--vp-brand-light); color: var(--vp-brand);
  display: flex; align-items: center; justify-content: center;
}
.vp-success-title { font-size: 1.25rem; font-weight: 900; color: var(--vp-text); margin-top: -0.25rem; }
.vp-success-msg   { font-size: 0.8rem; color: var(--vp-text-muted); margin-top: -0.5rem; }

/* ── QR Code Block ── */
.vp-qr-block {
  width: 100%;
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  background: var(--vp-success-bg);
  border: 2px solid var(--vp-success-border);
  border-radius: 1rem;
  padding: 1rem;
}
.vp-qr-img {
  width: 140px; height: 140px;
  border-radius: 0.5rem;
  display: block;
}
.vp-qr-label {
  font-size: 0.65rem; font-weight: 700;
  color: var(--vp-text-muted); text-align: center;
  text-transform: uppercase; letter-spacing: 0.05em;
  margin-top: 0.25rem;
}
.vp-qr-pending {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.5rem; color: var(--vp-text-light); padding: 0.75rem;
}
.vp-qr-pending p { font-size: 0.75rem; text-align: center; color: var(--vp-text-light); font-weight: 500; max-width: 200px; }
.vp-qr-download-btn {
  display: inline-flex !important; align-items: center !important; gap: 0.4rem !important;
  padding: 0.5rem 1.25rem !important;
  background: #0f172a !important;
  color: #fff !important;
  font-family: var(--vp-font, 'Inter', sans-serif) !important;
  font-size: 0.75rem !important; font-weight: 700 !important;
  border: none !important; border-radius: 9999px !important;
  cursor: pointer !important;
  transition: background 0.2s, transform 0.2s !important;
}
.vp-qr-download-btn:hover { background: #1e293b !important; transform: translateY(-1px) !important; }
.vp-success-summary {
  width: 100%; background: var(--vp-success-bg); border-radius: 0.75rem;
  padding: 0.75rem 1rem; text-align: left; display: flex; flex-direction: column; gap: 0.35rem;
}
.vp-summary-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.75rem;
}
.vp-summary-row span   { color: var(--vp-text-muted); font-weight: 500; }
.vp-summary-row strong { color: var(--vp-text); font-weight: 700; }

/* ── Spin ── */
.vp-spin { animation: vp-spin 0.8s linear infinite; }
.vp-spin-track { opacity: 0.25; }

/* ── Modal Transition ── */
.vp-modal-enter-active, .vp-modal-leave-active { transition: opacity 0.25s ease; }
.vp-modal-enter-from, .vp-modal-leave-to { opacity: 0; }
.vp-modal-enter-active .vp-modal-panel,
.vp-modal-leave-active .vp-modal-panel { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1); }
.vp-modal-enter-from .vp-modal-panel { transform: translateY(100%); }
.vp-modal-leave-to .vp-modal-panel   { transform: translateY(100%); }

/* ── Optional badge ── */
.vp-badge-opt {
  display: inline-block;
  margin-left: 0.35rem;
  padding: 0.1rem 0.4rem;
  font-size: 0.55rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-radius: 4px;
  background: var(--vp-input-bg);
  color: var(--vp-text-light);
  vertical-align: middle;
}

/* ── Upload box ── */
.vp-upload-box {
  width: 100%;
  min-height: 90px;
  border: 1.5px dashed var(--vp-input-border);
  border-radius: 0.75rem;
  background: var(--vp-input-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s, background 0.2s;
}
.vp-upload-box:hover { border-color: var(--vp-brand); background: var(--vp-card-bg); }

.vp-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  color: var(--vp-text-light);
  padding: 1rem;
}
.vp-upload-placeholder span { font-size: 0.7rem; font-weight: 600; text-align: center; }

.vp-upload-preview {
  width: 100%;
  max-height: 140px;
  object-fit: cover;
  display: block;
}

.vp-upload-doc-selected {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--vp-text-muted);
}
.vp-upload-doc-selected span { font-size: 0.75rem; font-weight: 600; word-break: break-all; }

.vp-upload-clear {
  margin-top: 0.35rem;
  font-size: 0.65rem;
  font-weight: 700;
  color: #f43f5e;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.vp-upload-clear:hover { text-decoration: underline; }
</style>
