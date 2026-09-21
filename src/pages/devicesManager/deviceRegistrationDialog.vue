<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 p-4 w-full overflow-y-auto"
  >
    <!-- Main Form Container -->
    <div 
      v-if="!showNetworkScanner" 
      class="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-950 rounded-[24px] shadow-2xl shadow-amber-500/10 border border-white/20 dark:border-zinc-800/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300"
    >
      <!-- Premium Glass Header -->
      <div class="relative px-8 py-6 flex justify-between items-start bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-800/80 z-10 shrink-0">
        <div class="absolute inset-0 bg-white dark:bg-slate-900/40 dark:bg-zinc-950/40 backdrop-blur-xl" />
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-1">
            <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-100 dark:border-amber-500/20 shadow-inner">
              <Cpu class="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {{ device ? 'Configure Controller' : 'Add Hardware Device' }}
            </h2>
          </div>
          <p class="text-[13px] font-medium text-slate-500 dark:text-zinc-400 ml-[52px]">
            {{ device ? 'Update device network configuration and parameters' : 'Register a new controller or edge computing device to the network' }}
          </p>
        </div>
        <button 
          class="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all duration-200" 
          @click="close"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Content with custom scrollbar -->
      <div class="px-8 py-6 overflow-y-auto flex-1 bg-zinc-50/50 dark:bg-zinc-950/80 custom-scrollbar">
        <form
          id="device-form"
          class="space-y-6"
          @submit.prevent="handleSubmit"
        >
          <!-- Basic Info -->
          <div class="space-y-5">
            <h3 class="text-xs font-black uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800/80 pb-3 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <Cpu class="w-4 h-4 text-amber-500" /> Device Identity
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Device Name <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.controllerName"
                  type="text"
                  required
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                  <span>Serial Number <span class="text-red-500">*</span></span>
                  <button
                    type="button"
                    class="text-amber-500 hover:text-amber-600 flex items-center gap-1 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded transition-colors"
                    @click="openNetworkScanner"
                  >
                    <Wifi class="w-3 h-3" /> Scan Network
                  </button>
                </label>
                <input
                  v-model="formData.sn"
                  type="text"
                  required
                  placeholder="Device UUID / MAC"
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
              </div>
              <div class="space-y-1.5 col-span-2">
                <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Device Type <span class="text-red-500">*</span></label>
                <select
                  v-model.number="formData.controllerType"
                  required
                  class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  <option
                    value=""
                    disabled
                  >
                    Select Device Type
                  </option>
                  <option :value="1">
                    Single Door Controller
                  </option>
                  <option :value="2">
                    2-Door Controller
                  </option>
                  <option :value="3">
                    3-Door Controller
                  </option>
                  <option :value="4">
                    4-Door Controller
                  </option>
                </select>
              </div>

              <!-- Door Selection Section -->
              <div v-if="formData.controllerType" class="col-span-2 space-y-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <div class="flex items-center justify-between">
                  <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <DoorOpen class="w-3.5 h-3.5 text-amber-500" />
                    Door Assignment
                    <span class="text-zinc-400 font-normal font-mono normal-case tracking-normal">
                      ({{ doorSlots.slice(0, maxDoors).filter(Boolean).length }} / {{ maxDoors }} assigned)
                    </span>
                  </label>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/40 transition-colors cursor-pointer"
                    @click="openAddDoorDialog()"
                  >
                    <Plus class="w-3.5 h-3.5" />
                    Add Door
                  </button>
                </div>

                <!-- Loading State -->
                <div v-if="loadingDoors" class="flex items-center gap-2 text-xs text-zinc-400 py-3 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60">
                  <Loader2 class="w-3.5 h-3.5 animate-spin text-amber-500" />
                  <span>Loading available doors...</span>
                </div>

                <!-- Empty Doors State: Show Add Door Option -->
                <div 
                  v-else-if="availableDoors.length === 0" 
                  class="p-4 rounded-xl border border-dashed border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 text-center space-y-2"
                >
                  <div class="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                    <DoorOpen class="w-4 h-4" />
                  </div>
                  <p class="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    No doors are currently available in the system.
                  </p>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-colors cursor-pointer"
                    @click="openAddDoorDialog()"
                  >
                    <Plus class="w-3.5 h-3.5" />
                    Add First Door
                  </button>
                </div>

                <!-- Door Slots Selection -->
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    v-for="index in maxDoors" 
                    :key="index"
                    class="space-y-2 bg-zinc-50/80 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 hover:border-amber-500/30 transition-all relative"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <DoorOpen class="w-3.5 h-3.5 text-amber-500" />
                        Door 0{{ index }}
                      </span>
                      <span 
                        v-if="doorSlots[index - 1]" 
                        class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Assigned
                      </span>
                      <button
                        v-else
                        type="button"
                        class="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/40 transition-colors flex items-center gap-1 cursor-pointer"
                        @click="openAddDoorDialog(index - 1)"
                      >
                        <Plus class="w-2.5 h-2.5" /> Add Door 0{{ index }}
                      </button>
                    </div>
                    
                    <!-- Custom Styled Dropdown Selector -->
                    <div class="relative door-dropdown-container">
                      <button
                        type="button"
                        class="w-full h-9 px-3 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all cursor-pointer select-none text-left"
                        :class="[
                          openDropdownSlot === (index - 1)
                            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-white dark:bg-zinc-950 shadow-sm'
                            : doorSlots[index - 1]
                              ? 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 hover:border-amber-500/40'
                              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                        ]"
                        @click.stop="toggleDropdown(index - 1)"
                      >
                        <div v-if="getDoorById(doorSlots[index - 1])" class="flex items-center gap-2 min-w-0 flex-1">
                          <span class="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 shrink-0">
                            #{{ getDoorById(doorSlots[index - 1]).doorNumber }}
                          </span>
                          <span class="font-medium text-zinc-900 dark:text-zinc-100 truncate text-xs">
                            {{ getDoorById(doorSlots[index - 1]).doorName }}
                          </span>
                          <span 
                            v-if="getDoorById(doorSlots[index - 1]).location" 
                            class="text-[10px] text-zinc-400 dark:text-zinc-500 truncate shrink-0 hidden sm:inline"
                          >
                            • {{ getDoorById(doorSlots[index - 1]).location }}
                          </span>
                        </div>
                        <div v-else class="text-zinc-400 dark:text-zinc-500 text-xs font-normal">
                          -- Select Door 0{{ index }} --
                        </div>

                        <div class="flex items-center gap-1 shrink-0 ml-auto">
                          <span
                            v-if="doorSlots[index - 1]"
                            role="button"
                            title="Unassign door"
                            class="p-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950 text-zinc-400 hover:text-rose-500 transition-colors"
                            @click.stop="selectDoor(index - 1, null)"
                          >
                            <X class="w-3.5 h-3.5" />
                          </span>
                          <ChevronDown 
                            class="w-3.5 h-3.5 text-zinc-400 transition-transform duration-200"
                            :class="{ 'rotate-180 text-amber-500': openDropdownSlot === (index - 1) }"
                          />
                        </div>
                      </button>

                      <!-- Popover Menu -->
                      <div
                        v-if="openDropdownSlot === (index - 1)"
                        class="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                      >
                        <div class="p-1 max-h-52 overflow-y-auto space-y-0.5">
                          <div 
                            v-if="getDoorsForSlot(index - 1).length === 0"
                            class="py-3 px-3 text-center text-xs text-zinc-400 italic"
                          >
                            No available doors
                          </div>

                          <button
                            v-for="door in getDoorsForSlot(index - 1)"
                            :key="door.id"
                            type="button"
                            class="w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                            :class="[
                              String(doorSlots[index - 1]) === String(door.id)
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-medium'
                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
                            ]"
                            @click="selectDoor(index - 1, door.id)"
                          >
                            <div class="flex items-center gap-2 min-w-0">
                              <span 
                                class="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded shrink-0"
                                :class="[
                                  String(doorSlots[index - 1]) === String(door.id)
                                    ? 'bg-amber-200/80 text-amber-900 dark:bg-amber-800/80 dark:text-amber-200'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-950 group-hover:text-amber-700 dark:group-hover:text-amber-300'
                                ]"
                              >
                                #{{ door.doorNumber }}
                              </span>
                              <span class="text-xs truncate font-medium">
                                {{ door.doorName }}
                              </span>
                              <span v-if="door.location" class="text-[10px] text-zinc-400 dark:text-zinc-500 truncate hidden sm:inline">
                                ({{ door.location }})
                              </span>
                            </div>
                            <Check 
                              v-if="String(doorSlots[index - 1]) === String(door.id)"
                              class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" 
                            />
                          </button>
                        </div>

                        <!-- Add New Door Action -->
                        <div class="p-1 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60">
                          <button
                            type="button"
                            class="w-full px-2.5 py-2 rounded-lg text-left flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-amber-950/80 transition-colors cursor-pointer"
                            @click="handleAddNewFromDropdown(index - 1)"
                          >
                            <Plus class="w-3.5 h-3.5" />
                            <span>+ Add New Door...</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Advanced Options (Collapsible) -->
              <div class="col-span-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                <button
                  type="button"
                  class="flex items-center justify-between w-full py-2 px-3 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 transition-all cursor-pointer select-none bg-white dark:bg-zinc-950"
                  @click="showAdvanced = !showAdvanced"
                >
                  <span class="flex items-center gap-2">
                    <SlidersHorizontal class="w-3.5 h-3.5 text-zinc-400" />
                    <span>Advanced Options</span>
                    <span
                      v-if="formData.useIpProtocol"
                      class="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 font-mono"
                    >
                      Direct IP Enabled
                    </span>
                  </span>
                  <ChevronDown
                    class="w-4 h-4 text-zinc-400 transition-transform duration-200"
                    :class="{ 'rotate-180': showAdvanced }"
                  />
                </button>

                <div v-show="showAdvanced" class="mt-3 space-y-3 animate-in fade-in duration-150">
                  <!-- Network Switch -->
                  <div class="bg-white dark:bg-zinc-950 p-5 rounded-[16px] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-zinc-200 dark:bg-zinc-800 group-hover:bg-amber-500 transition-colors" />
                    <div class="pl-2">
                      <h4 class="text-sm font-bold flex items-center gap-2 text-foreground">
                        <Network class="w-4 h-4 text-amber-500" />
                        Direct IP Connection
                      </h4>
                      <p class="text-[11px] text-muted-foreground mt-1 font-medium">
                        Enable for Controllers requiring direct TCP/UDP. Disable for edge devices using MQTT directly.
                      </p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        v-model="formData.useIpProtocol"
                        type="checkbox"
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-500/30 rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-amber-500" />
                    </label>
                  </div>

                  <div
                    v-if="formData.useIpProtocol"
                    class="grid grid-cols-2 gap-4 animate-in fade-in"
                  >
                    <div class="space-y-1.5">
                      <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">IP Address <span class="text-red-500">*</span></label>
                      <input
                        v-model="formData.serverIp"
                        type="text"
                        placeholder="192.168.1.201"
                        :required="formData.useIpProtocol"
                        class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                      >
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">MAC Address</label>
                      <input
                        v-model="formData.macAddress"
                        type="text"
                        placeholder="00:1A:2B:3C:4D:5E"
                        class="w-full h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer Action Bar -->
      <div class="relative px-8 py-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex justify-between items-center z-10 shrink-0">
        <button
          v-if="(device || formData.sn) && formData.controllerType"
          type="button"
          class="px-4 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60 text-[13px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2 transition-all duration-200 cursor-pointer"
          @click="showHardwareConfig = true"
        >
          <SlidersHorizontal class="w-4 h-4" />
          <span>{{ hardwareConfigButtonLabel }}</span>
        </button>
        <div v-else />

        <div class="flex items-center gap-3">
          <button
            type="button"
            class="px-6 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[13px] font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="device-form"
            :disabled="loading"
            class="group relative px-6 h-10 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white flex items-center gap-2 text-[13px] font-bold shadow-[0px_1px_2px_0px_rgba(255,255,255,0.5)_inset,0px_4px_6px_-1px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
          >
            <Loader2
              v-if="loading"
              class="w-4 h-4 animate-spin"
            />
            <span class="relative z-10">{{ device ? 'Update Device' : 'Register Hardware' }}</span>
          </button>
        </div>
      </div>

      <!-- Hardware Config Modal -->
      <DoorConfigModal
        v-model="showHardwareConfig"
        :device-uuid="formData.sn || ''"
        :controller-type="formData.controllerType || 4"
      />

      <!-- Add Door Modal Popup -->
      <DoorRegistrationDialog
        v-if="showAddDoorDialog"
        v-model="showAddDoorDialog"
        :default-door-number="presetDoorNumber"
        :default-door-name="presetDoorName"
        @success="handleDoorCreated"
      />
    </div>

    <!-- Network Scanner Panel -->
    <div 
      v-else 
      class="relative w-full max-w-md max-h-[80vh] flex flex-col bg-white dark:bg-zinc-950 rounded-[24px] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300"
    >
      <!-- Scanner Header -->
      <div class="px-6 py-4 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 shrink-0 bg-slate-50 dark:hover:bg-zinc-800">
        <h3 class="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Wifi class="w-5 h-5 text-amber-500" />
          Network Scanner
        </h3>
        <button 
          class="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white dark:text-slate-100 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors" 
          @click="closeNetworkScanner"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Scanner Body -->
      <div class="p-6 overflow-y-auto flex-1 bg-zinc-50/50 dark:bg-zinc-950/80 custom-scrollbar">
        <div
          v-if="scanningNetwork"
          class="flex flex-col items-center justify-center py-12 text-zinc-500"
        >
          <div class="relative w-16 h-16 mb-4">
            <div class="absolute inset-0 border-4 border-amber-500/20 rounded-full" />
            <div class="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <p class="text-sm font-medium animate-pulse">
            Scanning local subnet via MQTT...
          </p>
        </div>

        <div
          v-else-if="discoveredDevices.length === 0"
          class="text-center py-8 text-zinc-500 text-sm"
        >
          No recently connected devices found on the network.
          <button
            class="mt-4 block mx-auto text-amber-500 hover:underline font-bold"
            @click="fetchDiscoveredDevices"
          >
            Scan Again
          </button>
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <div 
            v-for="dev in discoveredDevices" 
            :key="dev.id"
            class="group cursor-pointer p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"
            @click="selectDiscoveredDevice(dev)"
          >
            <div class="flex justify-between items-start mb-2">
              <span class="font-bold text-sm text-slate-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                {{ dev.controllerName || 'Unknown Controller' }}
              </span>
              <span
                class="text-[10px] font-mono px-2 py-0.5 rounded-full" 
                :class="dev.controllerStatus === 'online' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'"
              >
                {{ dev.controllerStatus || 'Offline' }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              <div>SN: <span class="text-slate-700 dark:text-zinc-300">{{ dev.sn }}</span></div>
              <div>IP: <span class="text-slate-700 dark:text-zinc-300">{{ dev.serverIp || 'N/A' }}</span></div>
              <div>MAC: <span class="text-slate-700 dark:text-zinc-300">{{ dev.macAddress || 'N/A' }}</span></div>
              <div>Model: <span class="text-slate-700 dark:text-zinc-300">{{ dev.controllerType === 1 ? 'Face' : 'Controller' }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Beautiful In-App Warning / Duplicate Device Modal -->
    <div
      v-if="errorModal.show"
      class="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div class="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        <div class="flex items-start gap-4">
          <div 
            class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
            :class="errorModal.isDuplicate ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-rose-50 text-rose-600 border border-rose-200'"
          >
            <AlertTriangle v-if="errorModal.isDuplicate" class="w-6 h-6" />
            <AlertCircle v-else class="w-6 h-6" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-bold text-slate-900 leading-snug">
              {{ errorModal.title }}
            </h3>
            <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {{ errorModal.message }}
            </p>
            <div v-if="errorModal.serialNo" class="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 break-all font-semibold flex items-center justify-between gap-2">
              <span class="truncate">SN: {{ errorModal.serialNo }}</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md uppercase shrink-0">Already Enrolled</span>
            </div>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            @click="errorModal.show = false"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { X, Loader2, Network, Cpu, Wifi, SlidersHorizontal, ChevronDown, Plus, DoorOpen, Check, AlertTriangle, AlertCircle } from 'lucide-vue-next';
import { authService } from '@/services/authService';
import { currentUserTenant } from '@/utils/currentUserTenant';
import DoorConfigModal from './doors/doorConfigModal.vue';
import DoorRegistrationDialog from './doors/doorRegistrationDialog.vue';

const errorModal = ref({
  show: false,
  isDuplicate: false,
  title: '',
  message: '',
  serialNo: '',
});

const showHardwareConfig = ref(false);
const showAdvanced = ref(false);

// Door Selection State
const availableDoors = ref([]);
const loadingDoors = ref(false);
const showAddDoorDialog = ref(false);
const pendingSlotIndex = ref(null);
const doorSlots = ref([null, null, null, null]);
const openDropdownSlot = ref(null);

const toggleDropdown = (slotIndex) => {
  openDropdownSlot.value = openDropdownSlot.value === slotIndex ? null : slotIndex;
};

const closeDropdowns = () => {
  openDropdownSlot.value = null;
};

const getDoorById = (id) => {
  if (!id) return null;
  return (availableDoors.value || []).find(d => String(d.id) === String(id)) || null;
};

const selectDoor = (slotIndex, doorId) => {
  doorSlots.value[slotIndex] = doorId ? (isNaN(Number(doorId)) ? doorId : Number(doorId)) : null;
  openDropdownSlot.value = null;
};

const handleAddNewFromDropdown = (slotIndex) => {
  openDropdownSlot.value = null;
  openAddDoorDialog(slotIndex);
};

const handleClickOutside = (e) => {
  if (!e.target.closest('.door-dropdown-container')) {
    openDropdownSlot.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const props = defineProps({
  modelValue: Boolean,
  device: { type: Object, default: null },
  startWithScanner: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'success']);

const loading = ref(false);

// Network Scanner state
const showNetworkScanner = ref(false);
const scanningNetwork = ref(false);
const discoveredDevices = ref([]);
const discoveredDeviceId = ref(null);

const formData = ref({
  controllerName: '',
  sn: '',
  controllerType: '',
  useIpProtocol: false,
  serverIp: '',
  macAddress: '',
});

const maxDoors = computed(() => {
  const type = Number(formData.value.controllerType);
  if (type === 1) return 1;
  if (type === 2) return 2;
  if (type === 3) return 3;
  if (type === 4) return 4;
  return 1;
});

const hardwareConfigButtonLabel = computed(() => {
  const type = Number(formData.value.controllerType);
  if (type === 1) return 'Single Door Hardware Config';
  if (type === 2) return '2-Door Hardware Config';
  if (type === 3) return '3-Door Hardware Config';
  if (type === 4) return '4-Door Hardware Config';
  return 'Door Hardware Config';
});

const fetchAvailableDoors = async () => {
  loadingDoors.value = true;
  try {
    const token = authService.getToken() || import.meta.env.VITE_API_TOKEN;
    const tenantId = await currentUserTenant.getTenantIdAsync().catch(() => null);
    
    let url = `${import.meta.env.VITE_API_URL}/items/doors?limit=-1&sort=doorNumber&fields=id,doorName,doorNumber,location,deviceUuid`;
    if (tenantId) {
      url += `&filter[tenant][_eq]=${encodeURIComponent(tenantId)}`;
    }
    
    let res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok && tenantId) {
      res = await fetch(`${import.meta.env.VITE_API_URL}/items/doors?limit=-1&sort=doorNumber&fields=id,doorName,doorNumber,location,deviceUuid`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    
    if (res.ok) {
      const data = await res.json();
      availableDoors.value = data.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch available doors:", err);
  } finally {
    loadingDoors.value = false;
  }
};

const getDoorsForSlot = (slotIndex) => {
  const currentSlotValue = doorSlots.value[slotIndex];
  return (availableDoors.value || [])
    .filter(door => {
      if (currentSlotValue && String(door.id) === String(currentSlotValue)) return true;
      const isUsedInOtherSlot = doorSlots.value.some((id, idx) => idx !== slotIndex && id && String(id) === String(door.id));
      return !isUsedInOtherSlot;
    })
    .sort((a, b) => {
      const numA = Number(a.doorNumber) || 0;
      const numB = Number(b.doorNumber) || 0;
      if (numA !== numB) return numA - numB;
      return (a.doorName || '').localeCompare(b.doorName || '');
    });
};

const presetDoorNumber = computed(() => {
  const usedNumbers = new Set();
  (availableDoors.value || []).forEach(d => {
    const n = Number(d.doorNumber);
    if (!isNaN(n) && n > 0) usedNumbers.add(n);
  });

  let candidate = (pendingSlotIndex.value !== null && pendingSlotIndex.value >= 0)
    ? pendingSlotIndex.value + 1
    : 1;

  while (usedNumbers.has(candidate)) {
    candidate++;
  }
  return candidate;
});

const presetDoorName = computed(() => {
  return `Door ${presetDoorNumber.value}`;
});

const openAddDoorDialog = (slotIndex = null) => {
  pendingSlotIndex.value = slotIndex;
  showAddDoorDialog.value = true;
};

const handleDoorSlotChange = (slotIndex, value) => {
  if (value === '__NEW__') {
    openAddDoorDialog(slotIndex);
    return;
  }
  doorSlots.value[slotIndex] = value ? (isNaN(Number(value)) ? value : Number(value)) : null;
};

const handleDoorCreated = async () => {
  const prevIds = new Set(availableDoors.value.map(d => String(d.id)));
  await fetchAvailableDoors();
  
  const newDoor = availableDoors.value.find(d => !prevIds.has(String(d.id)));
  if (newDoor) {
    if (pendingSlotIndex.value !== null && pendingSlotIndex.value >= 0 && pendingSlotIndex.value < maxDoors.value) {
      doorSlots.value[pendingSlotIndex.value] = newDoor.id;
    } else {
      const emptyIdx = doorSlots.value.findIndex((s, i) => i < maxDoors.value && !s);
      if (emptyIdx !== -1) {
        doorSlots.value[emptyIdx] = newDoor.id;
      }
    }
  }
  pendingSlotIndex.value = null;
  showAddDoorDialog.value = false;
};

watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    fetchAvailableDoors();

    if (props.startWithScanner) {
      showNetworkScanner.value = true;
      fetchDiscoveredDevices();
    } else {
      showNetworkScanner.value = false;
    }
    
    if (props.device) {
      showAdvanced.value = !!(props.device.serverIp || props.device.macAddress);
      formData.value = {
        controllerName:   props.device.controllerName || '',
        sn:               props.device.sn || '',
        controllerType:   props.device.controllerType || 1,
        useIpProtocol:    !!props.device.serverIp,
        serverIp:         props.device.serverIp || '',
        macAddress:       props.device.macAddress || '',
      };

      if (props.device.selectedDoors && Array.isArray(props.device.selectedDoors)) {
        doorSlots.value = [
          props.device.selectedDoors[0] || null,
          props.device.selectedDoors[1] || null,
          props.device.selectedDoors[2] || null,
          props.device.selectedDoors[3] || null,
        ];
      } else if (props.device.sn) {
        await fetchAvailableDoors();
        const linked = availableDoors.value.filter(d => d.deviceUuid === props.device.sn);
        doorSlots.value = [
          linked[0]?.id || null,
          linked[1]?.id || null,
          linked[2]?.id || null,
          linked[3]?.id || null,
        ];
      } else {
        doorSlots.value = [null, null, null, null];
      }
    } else {
      showAdvanced.value = false;
      doorSlots.value = [null, null, null, null];
      formData.value = {
        controllerName:   '',
        sn:               '',
        controllerType:   '',
        useIpProtocol:    false,
        serverIp:         '',
        macAddress:       '',
      };
    }
    discoveredDeviceId.value = null;
  }
});

const close = () => {
  emit('update:modelValue', false);
};



// Network Scanner methods
const openNetworkScanner = () => {
  showNetworkScanner.value = true;
  fetchDiscoveredDevices();
};

const closeNetworkScanner = () => {
  showNetworkScanner.value = false;
};

const fetchDiscoveredDevices = async () => {
  scanningNetwork.value = true;
  try {
    const token = authService.getToken();
    // Fetch newly connected devices from mqtt_devices collection
    const res = await fetch(`${import.meta.env.VITE_API_URL}/items/mqtt_devices?sort=-date_created&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      discoveredDevices.value = data.data || [];
    }
  } catch (err) {
    console.error("Failed to scan network for devices:", err);
  } finally {
    scanningNetwork.value = false;
  }
};

const selectDiscoveredDevice = (dev) => {
  discoveredDeviceId.value = dev.id;
  formData.value.sn = dev.sn;
  
  if (dev.serverIp) {
    formData.value.useIpProtocol = true;
    formData.value.serverIp = dev.serverIp;
    showAdvanced.value = true;
  }
  if (dev.macAddress) {
    formData.value.macAddress = dev.macAddress;
    showAdvanced.value = true;
  }
  if (dev.controllerName && !formData.value.controllerName) {
    formData.value.controllerName = dev.controllerName;
  }
  if (dev.controllerType) {
    formData.value.controllerType = dev.controllerType;
  }
  
  closeNetworkScanner();
};

const getSafeUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const token = authService.getToken() || import.meta.env.VITE_API_TOKEN;
    let tenantId = null;
    try {
      tenantId = await currentUserTenant.getTenantIdAsync();
    } catch (tErr) {
      tenantId = authService.getTenantId() || authService.getUserData()?.tenant?.id || null;
    }

    const isEdit = !!props.device;
    const isDiscovered = !!discoveredDeviceId.value;

    const url = isEdit 
      ? `${import.meta.env.VITE_API_URL}/items/controllers/${props.device.id}`
      : `${import.meta.env.VITE_API_URL}/items/controllers`;

    const method = isEdit ? 'PATCH' : 'POST';

    // Build explicit clean payload
    const assignedDoorIds = doorSlots.value.slice(0, maxDoors.value).filter(Boolean);
    const payload = {
      controllerName:   formData.value.controllerName,
      sn:               formData.value.sn,
      controllerType:   formData.value.controllerType,
      selectedDoors:    assignedDoorIds,
      tenant:           tenantId,
      status:           isEdit ? (props.device.status || 'unApproved') : 'approved',
      controllerStatus: isEdit ? (props.device.controllerStatus || 'offline') : 'online',
      serverIp:         formData.value.useIpProtocol ? (formData.value.serverIp || null) : null,
      macAddress:       formData.value.useIpProtocol ? (formData.value.macAddress || null) : null,
    };

    if (!isEdit) {
      payload.id = formData.value.sn || getSafeUUID();
    }

    const res = await fetch(url, {
      method: method,
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // Sync assigned doors' deviceUuid to this controller's sn
      if (formData.value.sn) {
        for (const doorId of assignedDoorIds) {
          try {
            await fetch(`${import.meta.env.VITE_API_URL}/items/doors/${doorId}`, {
              method: 'PATCH',
              headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({ deviceUuid: formData.value.sn })
            });
          } catch (doorErr) {
            console.warn(`Failed to link door ${doorId} to controller:`, doorErr);
          }
        }
      }
      // Remove from discovery queue
      if (isDiscovered) {
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/items/mqtt_devices/${discoveredDeviceId.value}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (delErr) {
          console.error("Failed to clean up discovered device:", delErr);
        }
      }

      // First add initialization for Knative
      if (!isEdit && formData.value.sn) {
        try {
          await fetch(`${import.meta.env.VITE_KN_API_URL || 'https://appv1.fieldseasy.com/kn'}/device-mqtt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "clearPermission",
              uuid: formData.value.sn
            })
          });
          console.log("Sent initial clearPermission to Knative for new device.");
        } catch (knErr) {
          console.error("Failed to send first add command to Knative:", knErr);
        }
      }

      emit('success');
      close();
    } else {
      const errorData = await res.json().catch(() => null);
      const rawMsg = errorData?.errors?.[0]?.message || res.statusText || 'Unknown error';
      console.error("[Device Save Error]", errorData);

      const isDuplicate = rawMsg.toLowerCase().includes("has to be unique") || 
                          rawMsg.toLowerCase().includes("unique") || 
                          rawMsg.toLowerCase().includes("record_not_unique");

      errorModal.value = {
        show: true,
        isDuplicate: isDuplicate,
        title: isDuplicate ? "Device Already Registered" : "Failed to Register Device",
        message: isDuplicate 
          ? "A hardware controller with this Serial Number / ID is already registered in your organization. Please verify the serial number or update the existing controller configuration."
          : rawMsg,
        serialNo: isDuplicate ? (formData.value.sn || '') : ''
      };
    }
  } catch (err) {
    console.error("Save error", err);
    errorModal.value = {
      show: true,
      isDuplicate: false,
      title: "Connection Error",
      message: err.message || "Failed to communicate with the backend API.",
      serialNo: ''
    };
  } finally {
    loading.value = false;
  }
};
</script>
