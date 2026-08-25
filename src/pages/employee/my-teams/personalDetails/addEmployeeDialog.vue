<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150"
    @click.self="close"
  >
    <div class="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden text-[#0F172A] font-sans">
      <!-- 1. Header -->
      <div class="px-6 py-4 flex items-center justify-between border-b border-[#E2E8F0] bg-[#FFFFFF] shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#DBEAFE] shrink-0">
            <UserPlus class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-base font-bold text-[#0F172A] tracking-tight">
              {{ employee ? 'Edit Employee Profile' : 'Onboard Employee' }}
            </h2>
            <p class="text-xs text-[#64748B] mt-0.5">
              {{ employee ? 'Update employee credentials, role, and access assignments' : 'Create workforce profile and assign biometric credentials' }}
            </p>
          </div>
        </div>

        <button
          class="w-7 h-7 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          @click="close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- 2. Form Body -->
      <div class="px-6 py-4.5 overflow-y-auto flex-1 bg-[#F8FAFC]/50 custom-scrollbar space-y-3.5">
        <form id="employee-form" class="space-y-3.5" @submit.prevent="handleSubmit">
          <!-- 1. Primary Core Information Card -->
          <div class="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
            <h3 class="text-xs font-bold text-[#334155] uppercase tracking-wider flex items-center gap-1.5">
              <User class="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Core Employee Identity</span>
            </h3>

            <!-- Row 1: First Name & Last Name -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-[#334155] mb-1">First Name <span class="text-[#DC2626]">*</span></label>
                <input
                  v-model="formData.firstName"
                  type="text"
                  required
                  placeholder="e.g. Alex"
                  class="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#334155] mb-1">Last Name <span class="text-[#DC2626]">*</span></label>
                <input
                  v-model="formData.lastName"
                  type="text"
                  required
                  placeholder="e.g. Morgan"
                  class="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <!-- Row 2: Employee ID & Designation -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-[#334155] mb-1">Employee ID <span class="text-[#DC2626]">*</span></label>
                <input
                  v-model="formData.employeeId"
                  type="text"
                  required
                  placeholder="e.g. EMP-1048"
                  class="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#334155] mb-1">Designation / Title</label>
                <input
                  v-model="formData.designation"
                  type="text"
                  placeholder="e.g. Security Lead"
                  class="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <!-- Row 3: Official Email & Phone -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-[#334155] mb-1">Official Work Email <span class="text-[#DC2626]">*</span></label>
                <input
                  v-model="formData.email"
                  type="email"
                  required
                  placeholder="alex.morgan@company.com"
                  class="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#334155] mb-1">Mobile Phone (10 digits)</label>
                <input
                  v-model="formData.personalPhone"
                  type="text"
                  inputmode="numeric"
                  maxlength="10"
                  placeholder="9876543210"
                  class="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  @input="formData.personalPhone = formData.personalPhone.replace(/\D/g, '')"
                />
              </div>
            </div>
          </div>

          <!-- 2. Department & Access Permissions Card -->
          <div class="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
            <h3 class="text-xs font-bold text-[#334155] uppercase tracking-wider flex items-center gap-1.5">
              <Building class="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Department & Access Group</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <!-- Department -->
              <div>
                <label class="block text-xs font-semibold text-[#334155] mb-1">Department</label>
                <select
                  v-model="formData.departmentId"
                  class="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="">-- Select Department --</option>
                  <option v-for="d in departments" :key="d.id" :value="d.id">
                    {{ d.departmentName }}
                  </option>
                </select>
              </div>

              <!-- Role (Employee, Admin, Guard, etc.) -->
              <div>
                <label class="block text-xs font-semibold text-[#334155] mb-1">Role <span class="text-[#DC2626]">*</span></label>
                <select
                  v-model="formData.roleId"
                  required
                  class="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="" disabled>-- Select Role --</option>
                  <option v-for="r in roles" :key="r.id" :value="r.id">
                    {{ r.name }}
                  </option>
                </select>
              </div>

              <!-- Access Group -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-semibold text-[#334155]">Access Group</label>
                  <button
                    type="button"
                    class="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-0.5"
                    @click="showAccessLevelModal = true"
                  >
                    + New
                  </button>
                </div>
                <select
                  v-model="formData.groupId"
                  class="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  @change="if ($event.target.value === '__create_new__') { formData.groupId = ''; showAccessLevelModal = true; }"
                >
                  <option value="">-- Select Access Group --</option>
                  <option v-for="g in groups" :key="g.id" :value="g.id">
                    {{ g.accessLevelName }}
                  </option>
                  <option value="__create_new__" class="font-bold text-[#2563EB]">
                    + Create New Access Group...
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- 3. Biometric Credentials (Interactive Popups on + Add) -->
          <div class="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 shadow-2xs space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold text-[#334155] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck class="w-3.5 h-3.5 text-[#059669]" />
                <span>Biometric Credentials & Access Modes</span>
              </h3>
              <span class="text-[10px] text-[#64748B]">Enroll & verify credentials</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <!-- Mode 1: Face Recognition -->
              <div
                class="p-2.5 rounded-xl border transition-all flex items-center justify-between"
                :class="formData.facePhoto || formData.face ? 'bg-[#ECFDF5] border-[#A7F3D0]' : 'bg-[#F8FAFC] border-[#E2E8F0]'"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                    :class="formData.facePhoto || formData.face ? 'bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]' : 'bg-[#FFFFFF] text-[#64748B] border-[#E2E8F0]'"
                  >
                    <ScanFace class="w-3.5 h-3.5" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-xs truncate" :class="formData.facePhoto || formData.face ? 'text-[#065F46]' : 'text-[#334155]'">
                      Face Recognition
                    </p>
                    <p class="text-[10px]" :class="formData.facePhoto || formData.face ? 'text-[#059669]' : 'text-[#94A3B8]'">
                      {{ formData.facePhoto ? 'Photo Uploaded' : formData.face ? 'Face Enrolled' : 'No photo uploaded' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <label v-if="formData.facePhoto || formData.face" class="flex items-center gap-1 cursor-pointer">
                    <input v-model="formData.face" type="checkbox" class="w-4 h-4 rounded text-[#059669] focus:ring-0 cursor-pointer" />
                    <span class="text-[11px] font-bold text-[#059669]">✓ Enrolled</span>
                  </label>
                  <button
                    v-else
                    type="button"
                    class="px-2.5 py-1 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB] text-[11px] font-bold text-[#334155] transition-colors cursor-pointer shadow-2xs"
                    @click="showFacePopup = true"
                  >
                    + Add Face
                  </button>
                </div>
              </div>

              <!-- Mode 2: Fingerprint -->
              <div
                class="p-2.5 rounded-xl border transition-all flex items-center justify-between"
                :class="formData.finger ? 'bg-[#ECFDF5] border-[#A7F3D0]' : 'bg-[#F8FAFC] border-[#E2E8F0]'"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                    :class="formData.finger ? 'bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]' : 'bg-[#FFFFFF] text-[#64748B] border-[#E2E8F0]'"
                  >
                    <Fingerprint class="w-3.5 h-3.5" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-xs truncate" :class="formData.finger ? 'text-[#065F46]' : 'text-[#334155]'">
                      Fingerprint
                    </p>
                    <p class="text-[10px]" :class="formData.finger ? 'text-[#059669]' : 'text-[#94A3B8]'">
                      {{ formData.finger ? 'Minutiae Active' : 'Not registered' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <label v-if="formData.finger" class="flex items-center gap-1 cursor-pointer">
                    <input v-model="formData.finger" type="checkbox" class="w-4 h-4 rounded text-[#059669] focus:ring-0 cursor-pointer" />
                    <span class="text-[11px] font-bold text-[#059669]">✓ Enrolled</span>
                  </label>
                  <button
                    v-else
                    type="button"
                    class="px-2.5 py-1 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] hover:border-[#059669] hover:text-[#059669] text-[11px] font-bold text-[#334155] transition-colors cursor-pointer shadow-2xs"
                    @click="showFingerPopup = true"
                  >
                    + Add Finger
                  </button>
                </div>
              </div>

              <!-- Mode 3: RFID Smart Card -->
              <div
                class="p-2.5 rounded-xl border transition-all flex items-center justify-between"
                :class="formData.rfidCard ? 'bg-[#F5F3FF] border-[#DDD6FE]' : 'bg-[#F8FAFC] border-[#E2E8F0]'"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                    :class="formData.rfidCard ? 'bg-[#EDE9FE] text-[#7C3AED] border-[#DDD6FE]' : 'bg-[#FFFFFF] text-[#64748B] border-[#E2E8F0]'"
                  >
                    <CreditCard class="w-3.5 h-3.5" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-xs truncate" :class="formData.rfidCard ? 'text-[#5B21B6]' : 'text-[#334155]'">
                      RFID Smart Card
                    </p>
                    <p class="text-[10px] truncate" :class="formData.rfidCard ? 'text-[#7C3AED]' : 'text-[#94A3B8]'">
                      {{ formData.rfidCard ? `Card: ${formData.rfidCard}` : 'No card linked' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <div v-if="formData.rfidCard" class="flex items-center gap-1.5">
                    <span class="text-[11px] font-bold text-[#7C3AED]">✓ Linked</span>
                    <button
                      type="button"
                      class="text-[10px] text-[#94A3B8] hover:text-[#DC2626] cursor-pointer"
                      title="Clear Card"
                      @click="formData.rfidCard = ''"
                    >
                      &times;
                    </button>
                  </div>
                  <button
                    v-else
                    type="button"
                    class="px-2.5 py-1 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] hover:border-[#7C3AED] hover:text-[#7C3AED] text-[11px] font-bold text-[#334155] transition-colors cursor-pointer shadow-2xs"
                    @click="showRfidPopup = true"
                  >
                    + Add Card
                  </button>
                </div>
              </div>

              <!-- Mode 4: Dynamic QR Pass -->
              <div
                class="p-2.5 rounded-xl border transition-all flex items-center justify-between"
                :class="formData.QrAttendance ? 'bg-[#EFF6FF] border-[#BFDBFE]' : 'bg-[#F8FAFC] border-[#E2E8F0]'"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                    :class="formData.QrAttendance ? 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]' : 'bg-[#FFFFFF] text-[#64748B] border-[#E2E8F0]'"
                  >
                    <QrCode class="w-3.5 h-3.5" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-xs truncate" :class="formData.QrAttendance ? 'text-[#1E40AF]' : 'text-[#334155]'">
                      Dynamic QR Pass
                    </p>
                    <p class="text-[10px]" :class="formData.QrAttendance ? 'text-[#2563EB]' : 'text-[#94A3B8]'">
                      {{ formData.QrAttendance ? '30-sec Rotating Pass Active' : 'Pass disabled' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <label v-if="formData.QrAttendance" class="flex items-center gap-1 cursor-pointer">
                    <input v-model="formData.QrAttendance" type="checkbox" class="w-4 h-4 rounded text-[#2563EB] focus:ring-0 cursor-pointer" />
                    <span class="text-[11px] font-bold text-[#2563EB]">✓ Active</span>
                  </label>
                  <button
                    v-else
                    type="button"
                    class="px-2.5 py-1 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB] text-[11px] font-bold text-[#334155] transition-colors cursor-pointer shadow-2xs"
                    @click="showQrPopup = true"
                  >
                    + Add QR
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Collapsible Advanced & Personal Options -->
          <div class="border border-[#E2E8F0] rounded-xl bg-[#FFFFFF] overflow-hidden">
            <button
              type="button"
              class="w-full px-4 py-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-xs font-semibold text-[#334155] flex items-center justify-between transition-colors cursor-pointer"
              @click="showAdvanced = !showAdvanced"
            >
              <div class="flex items-center gap-2">
                <SlidersHorizontal class="w-3.5 h-3.5 text-[#64748B]" />
                <span>Advanced & Personal Metadata</span>
                <span class="text-[10px] text-[#94A3B8] font-normal">(DOB, Address, Personal Email, GPS)</span>
              </div>
              <ChevronDown
                class="w-4 h-4 text-[#64748B] transition-transform duration-200"
                :class="{ 'rotate-180': showAdvanced }"
              />
            </button>

            <div v-show="showAdvanced" class="p-4 space-y-3.5 border-t border-[#E2E8F0] bg-[#FFFFFF] animate-in fade-in duration-150">
              <!-- Middle Name & Gender & DOB & Blood Group -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label class="block text-[11px] font-semibold text-[#475569] mb-1">Middle Name</label>
                  <input
                    v-model="formData.middleName"
                    type="text"
                    placeholder="M."
                    class="w-full h-8 px-2.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-xs text-[#0F172A]"
                  />
                </div>

                <div>
                  <label class="block text-[11px] font-semibold text-[#475569] mb-1">Gender</label>
                  <select
                    v-model="formData.gender"
                    class="w-full h-8 px-2 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-xs text-[#0F172A]"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label class="block text-[11px] font-semibold text-[#475569] mb-1">Date of Birth</label>
                  <input
                    v-model="formData.dateOfBirth"
                    type="date"
                    class="w-full h-8 px-2 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-xs text-[#0F172A]"
                  />
                </div>

                <div>
                  <label class="block text-[11px] font-semibold text-[#475569] mb-1">Blood Group</label>
                  <select
                    v-model="formData.bloodGroup"
                    class="w-full h-8 px-2 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-xs text-[#0F172A]"
                  >
                    <option value="">Select</option>
                    <option v-for="bg in ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']" :key="bg" :value="bg">
                      {{ bg }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Personal Email & Joining Date -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-semibold text-[#475569] mb-1">Personal Email</label>
                  <input
                    v-model="formData.personalEmail"
                    type="email"
                    placeholder="personal@email.com"
                    class="w-full h-8 px-2.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-xs text-[#0F172A]"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-[#475569] mb-1">Date of Joining</label>
                  <input
                    v-model="formData.dateOfJoining"
                    type="date"
                    class="w-full h-8 px-2 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-xs text-[#0F172A]"
                  />
                </div>
              </div>

              <!-- Address -->
              <div>
                <label class="block text-[11px] font-semibold text-[#475569] mb-1">Residential Address</label>
                <input
                  v-model="formData.communicationAddress"
                  type="text"
                  placeholder="Full street address, city, state..."
                  class="w-full h-8 px-2.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-xs text-[#0F172A]"
                />
              </div>

              <!-- Mobile GPS Check-in Mode -->
              <div class="pt-1 flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold text-[#334155]">Mobile GPS Geofence Check-in</p>
                  <p class="text-[10px] text-[#64748B]">Enable remote attendance using mobile geolocation</p>
                </div>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input v-model="formData.GeoAttendance" type="checkbox" class="w-4 h-4 rounded text-[#2563EB] focus:ring-0 cursor-pointer" />
                  <span class="text-xs font-semibold text-[#0F172A]">{{ formData.GeoAttendance ? 'Enabled' : 'Disabled' }}</span>
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Error Message Banner -->
      <div
        v-if="errorMessage"
        class="mx-6 mb-2 p-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] text-xs font-semibold flex items-center justify-between"
      >
        <span>{{ errorMessage }}</span>
        <button type="button" @click="errorMessage = ''"><X class="w-3.5 h-3.5" /></button>
      </div>

      <!-- 5. Footer Action Bar -->
      <div class="px-6 py-3.5 border-t border-[#E2E8F0] bg-[#FFFFFF] flex items-center justify-end gap-2 shrink-0">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0] transition-colors cursor-pointer"
          @click="close"
        >
          Cancel
        </button>

        <button
          type="submit"
          form="employee-form"
          :disabled="loading"
          class="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ employee ? 'Save Changes' : 'Onboard Employee' }}</span>
        </button>
      </div>
    </div>

    <!-- SUB-POPUP 1: Add Face Photo -->
    <Teleport to="body">
      <div
        v-if="showFacePopup"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-150"
        @click.self="showFacePopup = false"
      >
        <div class="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div class="flex items-center gap-2.5">
              <div class="p-2 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                <ScanFace class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-[#0F172A]">Upload Face Photo</h3>
                <p class="text-[11px] text-[#64748B]">Enroll employee face template</p>
              </div>
            </div>
            <button class="w-7 h-7 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B]" @click="showFacePopup = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div
            class="border-2 border-dashed border-[#CBD5E1] hover:border-[#059669] hover:bg-[#ECFDF5]/20 rounded-xl p-6 text-center cursor-pointer transition-colors"
            @click="triggerFaceUpload"
          >
            <Camera class="w-8 h-8 mx-auto text-[#059669] mb-2" />
            <p class="text-xs font-semibold text-[#0F172A]">Click to select face photo or capture from camera</p>
            <p class="text-[10px] text-[#64748B] mt-1">Supports JPG, PNG (Max 5MB)</p>
            <input ref="faceFileInput" type="file" accept="image/*" class="hidden" @change="handleFaceUpload" />
          </div>

          <div v-if="facePreviewUrl" class="flex items-center gap-3 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <img :src="facePreviewUrl" class="w-10 h-10 rounded-lg object-cover border border-[#CBD5E1]" />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-[#0F172A] truncate">Photo selected</p>
              <p class="text-[10px] text-[#059669]">✓ Ready to enroll</p>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <button class="px-3 py-1.5 text-xs text-[#64748B] rounded-lg" @click="showFacePopup = false">Cancel</button>
            <button class="px-4 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl shadow-2xs" @click="confirmFaceUpload">
              Save Face Photo
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- SUB-POPUP 2: Add Fingerprint -->
    <Teleport to="body">
      <div
        v-if="showFingerPopup"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-150"
        @click.self="showFingerPopup = false"
      >
        <div class="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div class="flex items-center gap-2.5">
              <div class="p-2 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                <Fingerprint class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-[#0F172A]">Enroll Fingerprint</h3>
                <p class="text-[11px] text-[#64748B]">Select finger and capture minutiae</p>
              </div>
            </div>
            <button class="w-7 h-7 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B]" @click="showFingerPopup = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-[#334155] mb-1">Finger Position</label>
              <select v-model="selectedFingerIndex" class="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-xs">
                <option :value="1">Right Thumb (Position 1)</option>
                <option :value="2">Right Index (Position 2)</option>
                <option :value="3">Right Middle (Position 3)</option>
                <option :value="6">Left Thumb (Position 6)</option>
                <option :value="7">Left Index (Position 7)</option>
              </select>
            </div>

            <div class="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-2">
              <Fingerprint class="w-10 h-10 mx-auto text-[#059669] animate-pulse" />
              <p class="text-xs font-semibold text-[#0F172A]">Scanner Ready</p>
              <p class="text-[11px] text-[#64748B]">Place employee finger on the USB biometric reader when prompted</p>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <button class="px-3 py-1.5 text-xs text-[#64748B] rounded-lg" @click="showFingerPopup = false">Cancel</button>
            <button class="px-4 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl shadow-2xs" @click="confirmFingerprint">
              Confirm Fingerprint
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- SUB-POPUP 3: Add RFID Card -->
    <Teleport to="body">
      <div
        v-if="showRfidPopup"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-150"
        @click.self="showRfidPopup = false"
      >
        <div class="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div class="flex items-center gap-2.5">
              <div class="p-2 rounded-lg bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                <CreditCard class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-[#0F172A]">Assign RFID Smart Card</h3>
                <p class="text-[11px] text-[#64748B]">Enter card ID or swipe on reader</p>
              </div>
            </div>
            <button class="w-7 h-7 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B]" @click="showRfidPopup = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-[#334155] mb-1">RFID Card Number / ID</label>
              <input
                v-model="tempRfidNumber"
                type="text"
                placeholder="e.g. CRD-89421 or 108429"
                class="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F172A]"
                @keyup.enter="confirmRfidCard"
              />
            </div>
            <p class="text-[11px] text-[#64748B]">
              You can tap the RFID card on a USB reader to automatically fill the card number.
            </p>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <button class="px-3 py-1.5 text-xs text-[#64748B] rounded-lg" @click="showRfidPopup = false">Cancel</button>
            <button class="px-4 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl shadow-2xs" @click="confirmRfidCard">
              Assign Card
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- SUB-POPUP 4: Add Dynamic QR -->
    <Teleport to="body">
      <div
        v-if="showQrPopup"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-150"
        @click.self="showQrPopup = false"
      >
        <div class="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div class="flex items-center gap-2.5">
              <div class="p-2 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                <QrCode class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-[#0F172A]">Generate Dynamic QR Pass</h3>
                <p class="text-[11px] text-[#64748B]">Issue rotating digital badge for mobile app</p>
              </div>
            </div>
            <button class="w-7 h-7 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B]" @click="showQrPopup = false">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-center space-y-2">
            <QrCode class="w-12 h-12 mx-auto text-[#2563EB]" />
            <p class="text-xs font-bold text-[#1E40AF]">30-Second Rolling Encryption</p>
            <p class="text-[11px] text-[#3B82F6]">
              A dynamic encrypted barcode will be provisioned on the employee's mobile dashboard.
            </p>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <button class="px-3 py-1.5 text-xs text-[#64748B] rounded-lg" @click="showQrPopup = false">Cancel</button>
            <button class="px-4 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl shadow-2xs" @click="confirmDynamicQr">
              Activate QR Pass
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Original Access Group Clearance Dialog -->
    <AddAccessLevelDialog
      v-model="showAccessLevelModal"
      @success="onAccessLevelSuccess"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import {
  X, Loader2, UserPlus, User, Building, SlidersHorizontal, ChevronDown,
  ScanFace, Fingerprint, CreditCard, QrCode, ShieldCheck, Camera
} from 'lucide-vue-next';
import AddAccessLevelDialog from '@/pages/devicesManager/accesslevel/addAccessLevelDialog.vue';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import { convertToCardAccessHex } from '@/utils/helpers/convertToCardAccessHex';

const props = defineProps({
  modelValue: Boolean,
  employee: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'success']);

const loading = ref(false);
const errorMessage = ref('');
const showAdvanced = ref(false);

const showAccessLevelModal = ref(false);

const onAccessLevelSuccess = async () => {
  await fetchGroups();
  if (groups.value && groups.value.length > 0) {
    formData.value.groupId = groups.value[groups.value.length - 1]?.id || groups.value[0]?.id || '';
  }
};

// Sub-popup controllers
const showFacePopup = ref(false);
const showFingerPopup = ref(false);
const showRfidPopup = ref(false);
const showQrPopup = ref(false);

const faceFileInput = ref(null);
const facePreviewUrl = ref('');
const faceImageBase64 = ref('');
const selectedFingerIndex = ref(2);
const tempRfidNumber = ref('');

let token = authService.getToken();
let tenantId = currentUserTenant.getTenantId();

const roles = ref([
  { id: 'f667b169-c66c-4ec1-bef9-1831c1647c0d', name: 'Employee' },
  { id: 'admin_role', name: 'Admin' },
  { id: 'guard_role', name: 'Guard' }
]);
const departments = ref([]);
const branches = ref([]);
const groups = ref([]);

const originalCardNumber = ref('');
const originalCardId = ref(null);

const formData = ref({
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  gender: '',
  bloodGroup: '',
  dateOfBirth: '',
  maritalStatus: '',
  permanentAddress: '',
  communicationAddress: '',
  personalEmail: '',
  personalPhone: '',
  employeeId: '',
  designation: '',
  dateOfJoining: '',
  departmentId: '',
  branchId: '',
  groupId: '',
  status: 'active',
  roleId: '',
  rfidCard: '',
  facePhoto: null,
  accessOn: true,
  face: false,
  finger: false,
  rfid: false,
  QrAttendance: false,
  GeoAttendance: false,
});

// Face photo handlers
const triggerFaceUpload = () => {
  faceFileInput.value?.click();
};

const handleFaceUpload = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    formData.value.facePhoto = file;
    facePreviewUrl.value = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const fullRes = ev.target?.result || '';
      faceImageBase64.value = typeof fullRes === 'string' && fullRes.includes(',') ? fullRes.split(',')[1] : fullRes;
    };
    reader.readAsDataURL(file);
  }
};

const confirmFaceUpload = () => {
  if (formData.value.facePhoto || facePreviewUrl.value || faceImageBase64.value) {
    formData.value.face = true;
  }
  showFacePopup.value = false;
};

// Fingerprint handlers
const confirmFingerprint = () => {
  formData.value.finger = true;
  showFingerPopup.value = false;
};

// RFID handlers
const confirmRfidCard = () => {
  if (tempRfidNumber.value.trim()) {
    formData.value.rfidCard = tempRfidNumber.value.trim();
    formData.value.rfid = true;
  }
  showRfidPopup.value = false;
};

// QR handlers
const confirmDynamicQr = () => {
  formData.value.QrAttendance = true;
  showQrPopup.value = false;
};

const fetchEmployeeCard = async () => {
  if (!props.employee?.id) return;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement?filter[employeeId][_eq]=${props.employee.id}&filter[type][_eq]=rfid`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.data?.length > 0) {
      originalCardId.value = data.data[0].id;
      originalCardNumber.value = data.data[0].rfidCard;
      formData.value.rfidCard = data.data[0].rfidCard;
      formData.value.rfid = true;
    } else {
      originalCardId.value = null;
      originalCardNumber.value = '';
      formData.value.rfidCard = '';
      formData.value.rfid = false;
    }
  } catch (err) {
    console.error("Error fetching employee card:", err);
  }
};

// Load dropdowns when opened
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    errorMessage.value = '';
    showAdvanced.value = false;
    showFacePopup.value = false;
    showFingerPopup.value = false;
    showRfidPopup.value = false;
    showQrPopup.value = false;
    facePreviewUrl.value = '';
    tempRfidNumber.value = '';

    if (props.employee) {
      const hasRegisteredFace = !!props.employee.registeredFace || !!props.employee.assignedFaceEmbed?.id || props.employee.face === true;
      const hasRegisteredFinger = props.employee.finger === true;
      const hasQr = props.employee.QrAttendance === true;

      faceImageBase64.value = props.employee.registeredFace || '';
      facePreviewUrl.value = props.employee.registeredFace
        ? (props.employee.registeredFace.startsWith('data:') ? props.employee.registeredFace : `data:image/jpeg;base64,${props.employee.registeredFace}`)
        : '';

      formData.value = {
        firstName: props.employee.firstName || props.employee.assignedUser?.first_name || '',
        middleName: props.employee.middleName || '',
        lastName: props.employee.lastName || props.employee.assignedUser?.last_name || '',
        email: props.employee.assignedUser?.email || '',
        gender: props.employee.gender || '',
        bloodGroup: props.employee.bloodGroup || '',
        dateOfBirth: props.employee.dateOfBirth ? props.employee.dateOfBirth.split('T')[0] : '',
        maritalStatus: props.employee.maritalStatus || '',
        permanentAddress: props.employee.permanentAddress || '',
        communicationAddress: props.employee.communicationAddress || '',
        personalEmail: props.employee.personalEmail || '',
        personalPhone: (props.employee.personalPhone || props.employee.assignedUser?.phone || '').replace(/^\+91/, ''),
        employeeId: props.employee.employeeId || '',
        designation: props.employee.designation || '',
        dateOfJoining: props.employee.dateOfJoining ? props.employee.dateOfJoining.split('T')[0] : '',
        departmentId: props.employee.department?.id || props.employee.department || '',
        branchId: props.employee.branch?.id || props.employee.branch || '',
        groupId: props.employee.assignedAccessLevel?.id || props.employee.assignedAccessLevel || props.employee.group?.id || props.employee.group || '',
        status: props.employee.status || 'active',
        roleId: props.employee.assignedUser?.role?.id || props.employee.assignedUser?.role || '',
        rfidCard: '',
        facePhoto: null,
        accessOn: props.employee.accessOn !== false,
        face: hasRegisteredFace,
        finger: hasRegisteredFinger,
        rfid: false,
        QrAttendance: hasQr,
        GeoAttendance: props.employee.GeoAttendance === true,
      };
      originalCardId.value = null;
      originalCardNumber.value = '';
      fetchEmployeeCard();
    } else {
      faceImageBase64.value = '';
      facePreviewUrl.value = '';
      formData.value = {
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        gender: '',
        bloodGroup: '',
        dateOfBirth: '',
        maritalStatus: '',
        permanentAddress: '',
        communicationAddress: '',
        personalEmail: '',
        personalPhone: '',
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        designation: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        departmentId: '',
        branchId: '',
        groupId: '',
        status: 'active',
        roleId: roles.value.find(r => r.name.toLowerCase() === 'employee')?.id || '',
        rfidCard: '',
        facePhoto: null,
        accessOn: true,
        face: false,
        finger: false,
        rfid: false,
        QrAttendance: false,
        GeoAttendance: false,
      };
      originalCardId.value = null;
      originalCardNumber.value = '';
    }
    
    await currentUserTenant.initialize();
    token = authService.getToken();
    tenantId = currentUserTenant.getTenantId();
    
    fetchRoles();
    fetchDepartments();
    fetchBranches();
    fetchGroups();
  }
});

onMounted(async () => {
  await currentUserTenant.initialize();
  token = authService.getToken();
  tenantId = currentUserTenant.getTenantId();
  fetchRoles();
  fetchDepartments();
  fetchGroups();
});

const close = () => {
  emit('update:modelValue', false);
};

const syncKnativeFromDialog = async (personalRecordId = null) => {
  if (!formData.value.groupId) {
    return false;
  }
  
  try {
    const groupRes = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevels/${formData.value.groupId}?fields=assignDoorsGroup`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!groupRes.ok) return false;
    
    const groupData = await groupRes.json();
    if (!groupData.data?.assignDoorsGroup?.length) {
      return false;
    }

    const doorIds = groupData.data.assignDoorsGroup.join(',');
    const doorsRes = await fetch(`${import.meta.env.VITE_API_URL}/items/doors?filter[id][_in]=${doorIds}&fields=deviceUuid,uniqueId,doorNumber`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!doorsRes.ok) return false;
    
    const doorsData = await doorsRes.json();
    
    const deviceDoorMasks = {};
    const deviceDoorLists = {};
    (doorsData.data || []).forEach(d => {
      const uuid = d.deviceUuid || d.uniqueId;
      if (uuid) {
        const doorNum = parseInt(d.doorNumber || 1, 10);
        const doorBitmask = 1 << (doorNum - 1);
        if (!deviceDoorMasks[uuid]) deviceDoorMasks[uuid] = 0;
        deviceDoorMasks[uuid] |= doorBitmask;
        
        if (!deviceDoorLists[uuid]) deviceDoorLists[uuid] = [];
        const doorIndexStr = doorNum.toString().padStart(2, '0');
        if (!deviceDoorLists[uuid].includes(doorIndexStr)) {
          deviceDoorLists[uuid].push(doorIndexStr);
        }
      }
    });

    const uuids = new Set(Object.keys(deviceDoorMasks));
    if (uuids.size === 0) return false;
    
    let controllerTypes = {};
    const uuidsQuery = Array.from(uuids).join(',');
    const ctrlRes = await fetch(`${import.meta.env.VITE_API_URL}/items/controllers?filter[sn][_in]=${uuidsQuery}&fields=sn,controllerType`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (ctrlRes.ok) {
      const ctrlData = await ctrlRes.json();
      (ctrlData.data || []).forEach(c => { controllerTypes[c.sn] = c.controllerType; });
    }

    const userName = `${formData.value.firstName || ''} ${formData.value.lastName || ''}`.trim() || 'Employee';
    const facePhotoData = faceImageBase64.value || props.employee?.registeredFace || null;
    const empIdentifier = String(formData.value.employeeId || personalRecordId || props.employee?.id || 'EMP');

    for (const [uuid, bitmask] of Object.entries(deviceDoorMasks)) {
      const type = controllerTypes[uuid] || 1;
      const indexData = type !== 1 ? deviceDoorLists[uuid] : bitmask.toString(16).padStart(2, '0').toUpperCase();
      const doorIndices = Array.isArray(indexData) ? indexData : [indexData];

      if (formData.value.accessOn) {
        const payloadData = [];

        doorIndices.forEach(idx => {
          // 1. Face Permission (type: 300 - Facial Data)
          if (facePhotoData) {
            payloadData.push({
              id: empIdentifier,
              type: 300,
              code: facePhotoData,
              photo: facePhotoData,
              index: idx,
              time: { type: 0 },
              extra: { name: userName }
            });
          }

          // 2. RFID Card Permission (type: 200 - Standard Card)
          if (formData.value.rfidCard) {
            payloadData.push({
              id: String(formData.value.rfidCard),
              type: 200,
              code: String(formData.value.rfidCard),
              index: idx,
              time: { type: 0 },
              extra: { name: userName }
            });
          }

          // 3. Dynamic QR Permission (type: 103 - Dynamic QR Code)
          if (formData.value.QrAttendance) {
            payloadData.push({
              id: `QR-${empIdentifier}`,
              type: 103,
              code: `QR-${empIdentifier}`,
              index: idx,
              time: { type: 0 },
              extra: { name: userName }
            });
          }
        });

        if (payloadData.length > 0) {
          const payload = { action: "insertPermission", uuid: uuid, data: payloadData };
          await fetch(`${import.meta.env.VITE_KN_API_URL || 'https://appv1.fieldseasy.com/kn'}/device-mqtt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
      } else {
        const delIds = [];
        if (facePhotoData) delIds.push(empIdentifier);
        if (formData.value.rfidCard) delIds.push(String(formData.value.rfidCard));
        if (formData.value.QrAttendance) delIds.push(`QR-${empIdentifier}`);

        if (delIds.length > 0) {
          const payload = { action: "delPermission", uuid: uuid, data: delIds };
          await fetch(`${import.meta.env.VITE_KN_API_URL || 'https://appv1.fieldseasy.com/kn'}/device-mqtt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
      }
    }
    return true;
  } catch(err) {
    console.error("Knative Sync Error:", err);
    return false;
  }
};

const allowedRoleNames = ['employee', 'admin', 'guard'];

const fetchRoles = async () => {
  try {
    const tkn = authService.getToken();
    if (!tkn) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/roles?fields=id,name&sort[]=name`, {
      headers: { Authorization: `Bearer ${tkn}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        const filtered = data.data
          .filter(r => r.name && allowedRoleNames.includes(r.name.trim().toLowerCase()))
          .map(r => ({
            id: r.id,
            name: r.name.charAt(0).toUpperCase() + r.name.slice(1).toLowerCase()
          }));
        
        if (filtered.length > 0) {
          roles.value = filtered;
          const empRole = roles.value.find(r => r.name.toLowerCase() === 'employee');
          if (empRole && !formData.value.roleId) {
            formData.value.roleId = empRole.id;
          }
          return;
        }
      }
    }
  } catch (err) {
    console.error("fetchRoles error:", err);
  }
  roles.value = [
    { id: 'employee_role', name: 'Employee' },
    { id: 'admin_role', name: 'Admin' },
    { id: 'guard_role', name: 'Guard' }
  ];
  if (!formData.value.roleId && roles.value.length > 0) {
    formData.value.roleId = roles.value[0].id;
  }
};

const fetchDepartments = async () => {
  try {
    const activeTenantId = await currentUserTenant.getTenantIdAsync();
    const tkn = authService.getToken();
    if (!activeTenantId || !tkn) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/department?filter[tenant][tenantId][_eq]=${activeTenantId}&fields=id,departmentName`, {
      headers: { Authorization: `Bearer ${tkn}` }
    });
    if (res.ok) {
      const data = await res.json();
      departments.value = (data.data || []).filter(d => d.departmentName);
    }
  } catch (err) {
    console.error("fetchDepartments error:", err);
  }
};

const fetchBranches = async () => {
  try {
    const activeTenantId = await currentUserTenant.getTenantIdAsync();
    const tkn = authService.getToken();
    if (!activeTenantId || !tkn) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/locationManagement?filter[_and][0][_and][0][tenant][tenantId][_eq]=${activeTenantId}&filter[_and][0][_and][1][locType][_eq]=branch`, {
      headers: { Authorization: `Bearer ${tkn}` }
    });
    const data = await res.json();
    branches.value = data.data || [];
  } catch (err) {}
};

const fetchGroups = async () => {
  try {
    const activeTenantId = await currentUserTenant.getTenantIdAsync();
    const tkn = authService.getToken();
    if (!activeTenantId || !tkn) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/accesslevels?filter[tenant][tenantId][_eq]=${activeTenantId}&fields=id,accessLevelName,accessLevelNumber&sort[]=accessLevelNumber`, {
      headers: { Authorization: `Bearer ${tkn}` }
    });
    if (res.ok) {
      const data = await res.json();
      groups.value = (data.data || []).filter(g => g.accessLevelName);
    }
  } catch (err) {
    console.error("fetchGroups error:", err);
  }
};

const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const isEdit = !!props.employee;
    let newUserId = null;

    if (formData.value.personalPhone && !/^\d{10}$/.test(formData.value.personalPhone)) {
      throw new Error("Phone number must be exactly 10 digits.");
    }

    // ── Phone uniqueness check ──────────────────────────────────────────────
    if (formData.value.personalPhone) {
      const formattedPhone = `+91${formData.value.personalPhone}`;
      try {
        const phoneCheckRes = await fetch(
          `${import.meta.env.VITE_API_URL}/users?filter[phone][_eq]=${encodeURIComponent(formattedPhone)}&fields=id,phone&limit=2`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (phoneCheckRes.ok) {
          const phoneCheckData = await phoneCheckRes.json();
          const matches = phoneCheckData.data || [];
          const currentUserId = props.employee?.assignedUser?.id || null;
          const isDuplicate = matches.some(u => u.id !== currentUserId);
          if (isDuplicate) {
            throw new Error("This mobile number is already registered with another employee.");
          }
        }
      } catch (err) {
        if (err.message.includes("already registered")) throw err;
        console.warn("[addEmployeeDialog] Phone uniqueness check failed:", err.message);
      }
    }
    // ───────────────────────────────────────────────────────────────────────

    if (formData.value.rfidCard) {
      if (!/^\d+$/.test(formData.value.rfidCard)) {
        throw new Error("RFID Card number must contain digits only.");
      }
      if (formData.value.rfidCard !== originalCardNumber.value) {
        const cardCheckRes = await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement?filter[rfidCard][_eq]=${formData.value.rfidCard}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (cardCheckRes.ok) {
          const cardCheckData = await cardCheckRes.json();
          if (cardCheckData.data?.length > 0) {
            throw new Error(`RFID Card Number ${formData.value.rfidCard} is already assigned.`);
          }
        }
      }
    }

    if (!isEdit) {
      let selectedRoleId = formData.value.roleId;
      if (!selectedRoleId) {
        const roleRes = await fetch(`${import.meta.env.VITE_API_URL}/roles?filter[name][_eq]=Employee`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const roleData = await roleRes.json();
        selectedRoleId = roleData?.data?.[0]?.id;
      }

      if (!selectedRoleId) throw new Error("Role not found");

      const userPayload = {
        first_name: formData.value.firstName,
        last_name: formData.value.lastName || '-',
        email: formData.value.email,
        role: selectedRoleId,
        tenant: tenantId,
        phone: formData.value.personalPhone ? `+91${formData.value.personalPhone}` : formData.value.personalEmail,
        userApp: "accesseasy",
        appAccess: true
      };

      const userRes = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userPayload)
      });

      if (!userRes.ok) {
        const errorData = await userRes.json();
        throw new Error("Failed to create user: " + (errorData.errors?.[0]?.message || 'Unknown'));
      }

      const userData = await userRes.json();
      newUserId = userData.data.id;
    } else {
      if (props.employee.assignedUser?.id) {
        const userUpdatePayload = {
          first_name: formData.value.firstName,
          last_name: formData.value.lastName || '-',
          phone: formData.value.personalPhone ? `+91${formData.value.personalPhone}` : null,
          email: formData.value.email,
          role: formData.value.roleId || undefined
        };
        const patchRes = await fetch(`${import.meta.env.VITE_API_URL}/users/${props.employee.assignedUser.id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(userUpdatePayload)
        });
        if (!patchRes.ok) {
          const errData = await patchRes.json();
          throw new Error("Failed to update user: " + (errData.errors?.[0]?.message || 'Unknown'));
        }
      }
    }

    const personalPayload = {
      employeeId: formData.value.employeeId,
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      middleName: formData.value.middleName,
      personalEmail: formData.value.personalEmail,
      personalPhone: formData.value.personalPhone ? `+91${formData.value.personalPhone}` : null,
      gender: formData.value.gender,
      dateOfBirth: formData.value.dateOfBirth || null,
      maritalStatus: formData.value.maritalStatus,
      bloodGroup: formData.value.bloodGroup,
      communicationAddress: formData.value.communicationAddress,
      permanentAddress: formData.value.permanentAddress,
      designation: formData.value.designation,
      dateOfJoining: formData.value.dateOfJoining || null,
      status: formData.value.status === 'active' ? 'true' : 'false',
      accessOn: formData.value.accessOn,
      registeredFace: faceImageBase64.value || props.employee?.registeredFace || null,
      face: !!(faceImageBase64.value || props.employee?.registeredFace || formData.value.face),
      finger: formData.value.finger,
      rfid: formData.value.rfid || !!formData.value.rfidCard,
      QrAttendance: formData.value.QrAttendance,
      GeoAttendance: formData.value.GeoAttendance,
      uniqueId: `${tenantId}-${formData.value.employeeId}`,
      config: [{ shiftName: 1, startTime: "09:00", endTime: "18:00" }],
      attendancePolicyHistory: { status: "published" },
      leaves: [],
      workingRange: null,
      tenant: tenantId,
      department: formData.value.departmentId || null,
      assignedAccessLevel: formData.value.groupId || null,
      branch: formData.value.branchId || null
    };

    if (!isEdit) {
      personalPayload.assignedUser = newUserId;
    }

    const personalUrl = isEdit 
      ? `${import.meta.env.VITE_API_URL}/items/personalModule/${props.employee.id}`
      : `${import.meta.env.VITE_API_URL}/items/personalModule`;

    const personalRes = await fetch(personalUrl, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(personalPayload)
    });

    if (!personalRes.ok) {
      const errorData = await personalRes.json();
      throw new Error(`Failed to save record: ` + (errorData.errors?.[0]?.message || 'Unknown error'));
    }

    const personalResData = await personalRes.json();
    const savedPersonalRecordId = isEdit ? props.employee.id : personalResData.data.id;
    
    if (formData.value.rfidCard !== originalCardNumber.value) {
      if (originalCardId.value && !formData.value.rfidCard) {
        await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement/${originalCardId.value}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (formData.value.rfidCard) {
        const accessLevelNum = formData.value.groupId 
          ? groups.value.find(g => g.id === formData.value.groupId)?.accessLevelNumber || 1 
          : 1;
        const cardAccess = formData.value.accessOn;

        const cardPayload = {
          rfidCard: formData.value.rfidCard,
          type: "rfid",
          enabled: cardAccess,
          cardAccess: cardAccess,
          accessLevelsId: accessLevelNum,
          cardAccessLevelArray: `${formData.value.rfidCard}:${cardAccess ? 1 : 0}:${accessLevelNum}`,
          cardAccessLevelHex: convertToCardAccessHex(
            formData.value.rfidCard,
            cardAccess,
            accessLevelNum
          ),
          employeeId: savedPersonalRecordId,
          tenant: tenantId
        };

        if (originalCardId.value) {
          await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement/${originalCardId.value}`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(cardPayload)
          });
        } else {
          await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(cardPayload)
          });
        }
      }
    }

    await syncKnativeFromDialog(savedPersonalRecordId);

    emit('success');
    close();
  } catch (err) {
    console.error("Save error", err);
    errorMessage.value = err.message || "Failed to save employee";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}
</style>
