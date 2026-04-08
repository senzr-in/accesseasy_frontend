<template>
  <!-- Single Generate QR Popup -->
  <div v-if="showSingleGeneratePopup" class="popup-overlay">
    <div class="popup-content">
      <div class="popup-header">
        <h2>Generate Single Visitor QR</h2>
      </div>
      <form @submit.prevent="handleSingleQRGenerate">
        <div class="popup-body split-layout">
          <div class="form-section">
            <div class="form-grid">
              <div class="form-group">
                <label>Person Name<span class="required">*</span></label>
                <input
                  v-model="singleVisitor.personName"
                  type="text"
                  required
                  placeholder="Enter visitor name"
                />
              </div>

              <div class="form-group">
                <label>Mobile Number<span class="required">*</span></label>
                <input
                  v-model="singleVisitor.mobileNumber"
                  type="tel"
                  required
                  placeholder="Enter mobile number"
                />
              </div>

              <div class="form-group">
                <label>Email<span class="required">*</span></label>
                <input
                  v-model="singleVisitor.email"
                  type="email"
                  required
                  placeholder="Enter email"
                />
              </div>

              <div class="form-group">
                <label>Start Date<span class="required">*</span></label>
                <input
                  v-model="singleVisitor.startDate"
                  type="date"
                  required
                  :min="new Date().toISOString().split('T')[0]"
                />
              </div>

              <div class="form-group">
                <label>End Date<span class="required">*</span></label>
                <input
                  v-model="singleVisitor.endDate"
                  type="date"
                  required
                  :min="singleVisitor.startDate"
                />
              </div>

              <div class="form-group">
                <label>Start Time<span class="required">*</span></label>
                <input v-model="singleVisitor.startTime" type="time" required />
              </div>

              <div class="form-group">
                <label>End Time<span class="required">*</span></label>
                <input v-model="singleVisitor.endTime" type="time" required />
              </div>

              <div class="form-group">
                <label
                  >Assigned Access Level<span class="required">*</span></label
                >
                <select v-model="singleVisitor.assignedAccessLevel" required>
                  <option value="">Select access level</option>
                  <option
                    v-for="level in accessLevelOptions"
                    :key="level.id"
                    :value="level.id"
                  >
                    {{ level.accessLevelName }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Right side - QR Display -->
          <div class="qr-section">
            <div v-if="!singleVisitor.generatedQR" class="qr-placeholder">
              <i class="fas fa-qrcode"></i>
              <p>QR code will appear here</p>
            </div>
            <div v-else class="qr-display">
              <div class="download-section">
                <button class="download-btn" @click="downloadPDF">
                  <i class="fas fa-download"></i>
                </button>
              </div>
              <img
                :src="singleVisitor.generatedQR"
                alt="QR Code"
                class="qr-image"
              />
              <p class="validity-info">
                Valid from:
                {{
                  formatDate(
                    singleVisitor.startDate + " " + singleVisitor.startTime,
                  )
                }}
              </p>
              <p class="validity-info">
                Valid until:
                {{
                  formatDate(
                    singleVisitor.endDate + " " + singleVisitor.endTime,
                  )
                }}
              </p>
            </div>
          </div>
        </div>

        <div class="popup-footer">
          <button
            type="submit"
            class="btn btn-generate"
            :disabled="singleVisitor.generated_Qr"
          >
            <i class="fas fa-qrcode"></i>
            Generate QR
          </button>
          <button
            type="button"
            class="btn btn-save"
            @click="saveVisitorData(true)"
            :disabled="!singleVisitor.generated_Qr || isSaving"
          >
            <span v-if="isSaving" class="loading-spinner"></span>
            {{ isSaving ? "Saving..." : "Save" }}
          </button>
          <button
            type="button"
            class="btn btn-cancel"
            @click="
              showSingleGeneratePopup = false;
              resetForm(true);
            "
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Multi Generate QR Popup -->
  <div v-if="showMultiGeneratePopup" class="popup-overlay">
    <div class="popup-content">
      <div class="popup-header">
        <h2>Generate Multiple Visitor QRs</h2>
      </div>
      <form @submit.prevent="handleMultiQRGenerate">
        <div class="popup-body split-layout">
          <div class="form-section">
            <div class="form-grid">
              <div class="form-group">
                <label>Start Date<span class="required">*</span></label>
                <input
                  v-model="multiVisitor.startDate"
                  type="date"
                  required
                  :min="new Date().toISOString().split('T')[0]"
                />
              </div>

              <div class="form-group">
                <label>End Date<span class="required">*</span></label>
                <input
                  v-model="multiVisitor.endDate"
                  type="date"
                  required
                  :min="multiVisitor.startDate"
                />
              </div>

              <div class="form-group">
                <label>Start Time<span class="required">*</span></label>
                <input v-model="multiVisitor.startTime" type="time" required />
              </div>

              <div class="form-group">
                <label>End Time<span class="required">*</span></label>
                <input v-model="multiVisitor.endTime" type="time" required />
              </div>

              <div class="form-group">
                <label
                  >Assigned Access Level<span class="required">*</span></label
                >
                <select v-model="multiVisitor.assignedAccessLevel" required>
                  <option value="">Select access level</option>
                  <option
                    v-for="level in accessLevelOptions"
                    :key="level.id"
                    :value="level.id"
                  >
                    {{ level.accessLevelName }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>QR Quantity<span class="required">*</span></label>
                <input
                  v-model.number="multiVisitor.quantity"
                  type="number"
                  min="1"
                  max="50"
                  required
                  placeholder="Enter number of QR codes (max 50)"
                />
              </div>
            </div>
          </div>

          <!-- Right side - QR Display -->
          <div class="qr-section">
            <div
              v-if="multiVisitor.generatedQRs.length === 0"
              class="qr-placeholder"
            >
              <i class="fas fa-qrcode"></i>
              <p>QR codes will appear here</p>
            </div>
            <div v-else class="qr-scroll-container">
              <div class="download-section">
                <button class="download-btn" @click="downloadPDF">
                  <i class="fas fa-download"></i>
                </button>
              </div>
              <div class="qr-grid">
                <div
                  v-for="(qr, index) in multiVisitor.generatedQRs"
                  :key="index"
                  class="qr-card"
                >
                  <div class="qr-number">QR Code #{{ index + 1 }}</div>
                  <img
                    :src="qr.qrCode"
                    :alt="`QR Code ${index + 1}`"
                    class="qr-image"
                  />
                  <p class="validity-info">
                    Valid from: {{ formatDate(qr.validFrom) }}
                  </p>
                  <p class="validity-info">
                    Valid until: {{ formatDate(qr.validUntil) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="popup-footer">
          <button
            type="submit"
            class="btn btn-generate"
            :disabled="multiVisitor.generatedQRs.length > 0"
          >
            <i class="fas fa-qrcode"></i>
            Generate QRs
          </button>
          <button
            type="button"
            class="btn btn-save"
            @click="saveVisitorData(false)"
            :disabled="multiVisitor.generatedQRs.length === 0 || isSaving"
          >
            <span v-if="isSaving" class="loading-spinner"></span>
            {{ isSaving ? "Saving..." : "Save" }}
          </button>
          <button
            type="button"
            class="btn btn-cancel"
            @click="
              showMultiGeneratePopup = false;
              resetMultiVisitorForm();
            "
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>

  <div class="visitor-flow">
    <div v-if="successMessage" class="success-message">
      <i class="fas fa-check-circle"></i>
      {{ successMessage }}
    </div>

    <div class="tabs-container">
      <div class="left-tabs">
        <button
          @click="activeLeftTab = 'activity'"
          :class="{ active: activeLeftTab === 'activity' }"
        >
          <i class="fas fa-clock"></i>
          Recent Activity
        </button>
        <button
          @click="activeLeftTab = 'history'"
          :class="{ active: activeLeftTab === 'history' }"
        >
          <i class="fas fa-history"></i>
          History
        </button>
      </div>
      <div class="right-tabs">
        <button @click="showSingleGeneratePopup = true" class="action-button">
          <i class="fas fa-qrcode"></i>
          Single Generate QR
        </button>
        <button @click="showMultiGeneratePopup = true" class="action-button">
          <i class="fas fa-qrcode"></i>
          Multi Generate QR
        </button>
      </div>
    </div>

    <!-- Activity/History Content -->
    <div class="table-container">
      <table v-if="activeLeftTab === 'activity' && visitorData.length > 0">
        <thead>
          <tr>
            <th>Person Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Access Level</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Quantity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="visitor in activeVisitors" :key="visitor.id">
            <td>{{ visitor.personName }}</td>
            <td>{{ visitor.email }}</td>
            <td>{{ visitor.mobileNumber }}</td>
            <td>
              <span class="access-level-badge">
                {{ visitor.assignedAccessLevels?.accessLevelName || "N/A" }}
              </span>
            </td>
            <td>{{ formatDate(visitor.startDate) }}</td>
            <td>{{ formatDate(visitor.endDate) }}</td>
            <td>{{ formatTime(visitor.startTime) }}</td>
            <td>{{ formatTime(visitor.endTime) }}</td>
            <td>{{ visitor.quantity }}</td>
            <td>
              <span class="status-badge active">
                <i class="fas fa-check-circle"></i>
                Active
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <table v-else-if="activeLeftTab === 'history' && visitorData.length > 0">
        <thead>
          <tr>
            <th>Person Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Access Level</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Quantity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="visitor in visitorData" :key="visitor.id">
            <td>{{ visitor.personName }}</td>
            <td>{{ visitor.email }}</td>
            <td>{{ visitor.mobileNumber }}</td>
            <td>
              <span class="access-level-badge">
                {{ visitor.assignedAccessLevels?.accessLevelName || "N/A" }}
              </span>
            </td>
            <td>{{ formatDate(visitor.startDate) }}</td>
            <td>{{ formatDate(visitor.endDate) }}</td>
            <td>{{ formatTime(visitor.startTime) }}</td>
            <td>{{ formatTime(visitor.endTime) }}</td>
            <td>{{ visitor.quantity }}</td>
            <td>
              <span
                :class="[
                  'status-badge',
                  visitor.status === 'active'
                    ? 'active'
                    : visitor.status === 'inactive'
                      ? 'inactive'
                      : 'expired',
                ]"
              >
                <i
                  :class="[
                    'fas',
                    visitor.status === 'active'
                      ? 'fa-check-circle'
                      : visitor.status === 'inactive'
                        ? 'fa-clock'
                        : 'fa-times-circle',
                  ]"
                ></i>
                {{
                  visitor.status.charAt(0).toUpperCase() +
                  visitor.status.slice(1)
                }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="no-data-message">
        <i class="fas fa-inbox"></i>
        <p>No visitor data to display</p>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

export default {
  name: "VisitorFlow",
  data() {
    return {
      activeLeftTab: "activity",
      visitorActivities: [],
      showSingleGeneratePopup: false,
      showMultiGeneratePopup: false,
      successMessage: "",
      isSaving: false,
      QRValidityTime: null,
      accessLevelSearch: "",
      branchSearch: "",
      visitorData: [],
      currentPage: 1,
      totalPages: 1,
      isLoading: false,

      singleVisitor: {
        personName: "",
        email: "",
        mobileNumber: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        assignedAccessLevel: "",
        status: "inactive",
        generated_Qr: null,
      },

      multiVisitor: {
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        assignedAccessLevel: "",
        quantity: 1,
        status: "inactive",
        generatedQRs: [],
      },
      accessLevelOptions: [],
    };
  },
  computed: {
    recentActivities() {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return this.visitorActivities.filter(
        (activity) => new Date(activity.dateCreated) >= thirtyDaysAgo,
      );
    },
    activeVisitors() {
      return this.visitorData.filter((visitor) =>
        this.isVisitorActive(visitor),
      );
    },
  },
  watch: {
    accessLevelOptions: {
      handler(newValue) {
        console.log("accessLevelOptions changed:", newValue);
      },
      deep: true,
    },
  },
  methods: {
    formatDate(dateString) {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString("en-US", options);
    },

    async generateUniqueQR(visitorData) {
      console.log("Starting generateUniqueQR with data:", visitorData);

      const startDateTime = new Date(
        `${visitorData.startDate}T${visitorData.startTime}`,
      );
      const endDateTime = new Date(
        `${visitorData.endDate}T${visitorData.endTime}`,
      );

      console.log("Calculated date/times:", {
        startDateTime,
        endDateTime,
      });

      const qrData = {
        ...visitorData,
        validFrom: startDateTime.toISOString(),
        validUntil: endDateTime.toISOString(),
        uniqueId: Date.now() + Math.random().toString(36).substr(2, 9),
      };

      console.log("Generated QR data object:", qrData);

      try {
        console.log("Attempting to generate QR code data URL...");
        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));
        console.log("QR code data URL generated successfully");

        const result = {
          qrCode: qrCodeDataUrl,
          validFrom: startDateTime,
          validUntil: endDateTime,
          uniqueId: qrData.uniqueId,
          status: this.determineInitialStatus(startDateTime, endDateTime),
        };

        console.log("Final QR result:", {
          ...result,
          qrCode: "QR code data URL (truncated)",
        });

        return result;
      } catch (error) {
        console.error("Error in QR generation:", error);
        console.log("Error details:", {
          message: error.message,
          stack: error.stack,
        });
        throw error;
      }
    },

    determineInitialStatus(startDateTime, endDateTime) {
      const now = new Date();
      if (now < startDateTime) {
        return "inactive";
      } else if (now >= startDateTime && now <= endDateTime) {
        return "active";
      } else {
        return "expired";
      }
    },

    startSingleQRStatusCheck(startDateTime, endDateTime) {
      if (this.singleQRStatusInterval) {
        clearInterval(this.singleQRStatusInterval);
      }

      this.singleQRStatusInterval = setInterval(() => {
        const now = new Date();
        if (now < startDateTime) {
          this.singleVisitor.status = "inactive";
        } else if (now >= startDateTime && now <= endDateTime) {
          this.singleVisitor.status = "active";
        } else {
          this.singleVisitor.status = "expired";
          clearInterval(this.singleQRStatusInterval);
        }
      }, 1000);
    },

    beforeDestroy() {
      if (this.statusInterval) {
        clearInterval(this.statusInterval);
      }
      if (this.singleQRStatusInterval) {
        clearInterval(this.singleQRStatusInterval);
      }
    },

    async handleSingleQRGenerate() {
      try {
        const startDateTime = new Date(
          `${this.singleVisitor.startDate}T${this.singleVisitor.startTime}`,
        );
        const endDateTime = new Date(
          `${this.singleVisitor.endDate}T${this.singleVisitor.endTime}`,
        );
        const qrResult = await this.generateUniqueQR({
          personName: this.singleVisitor.personName,
          email: this.singleVisitor.email,
          mobileNumber: this.singleVisitor.mobileNumber,
          startDate: this.singleVisitor.startDate,
          endDate: this.singleVisitor.endDate,
          startTime: this.singleVisitor.startTime,
          endTime: this.singleVisitor.endTime,
          assignedAccessLevel: this.singleVisitor.assignedAccessLevel,
        });

        const initialStatus = this.determineInitialStatus(
          startDateTime,
          endDateTime,
        );
        this.singleVisitor.generatedQR = qrResult.qrCode;
        this.singleVisitor.generated_Qr = qrResult.qrCode;
        this.singleVisitor.status = initialStatus;

        this.startSingleQRStatusCheck(startDateTime, endDateTime);
        console.log(
          "QR code set for UI:",
          this.singleVisitor.generatedQR ? "Generated" : "Not generated",
        );
        console.log(
          "QR code set for payload:",
          this.singleVisitor.generated_Qr ? "Generated" : "Not generated",
        );
      } catch (error) {
        console.error("Failed to generate QR code:", error);
        this.showErrorMessage("Failed to generate QR code. Please try again.");
      }
    },

    async handleMultiQRGenerate() {
      try {
        const generatedQRs = [];
        for (let i = 0; i < this.multiVisitor.quantity; i++) {
          const qrResult = await this.generateUniqueQR({
            startDate: this.multiVisitor.startDate,
            endDate: this.multiVisitor.endDate,
            startTime: this.multiVisitor.startTime,
            endTime: this.multiVisitor.endTime,
            assignedAccessLevel: this.multiVisitor.assignedAccessLevel,
            batchId: Date.now(),
            qrIndex: i + 1,
          });
          generatedQRs.push(qrResult);
        }
        this.multiVisitor.generatedQRs = generatedQRs;
        this.multiVisitor.status = generatedQRs[0].status;
      } catch (error) {
        alert("Failed to generate QR codes:", error);
        throw error;
      }
    },

    async fetchUserTenant() {
      try {
        const userData = await currentUserTenant.fetchLoginUserDetails();
        return userData.tenant;
      } catch (error) {
        console.error("Error fetching user tenant:", error);
        return null;
      }
    },

    async saveVisitorData(isSingle = true) {
      this.isSaving = true;
      try {
        const userTenant = await this.fetchUserTenant();
        if (!userTenant) throw new Error("User tenant not found");

        if (isSingle) {
          if (!this.singleVisitor.generated_Qr) {
            this.showErrorMessage("Please generate QR code first");
            return;
          }

          const payload = {
            personName: this.singleVisitor.personName,
            email: this.singleVisitor.email,
            mobileNumber: this.singleVisitor.mobileNumber,
            startDate: this.singleVisitor.startDate,
            endDate: this.singleVisitor.endDate,
            startTime: this.singleVisitor.startTime,
            endTime: this.singleVisitor.endTime,
            assignedAccessLevels: this.singleVisitor.assignedAccessLevel,
            generated_Qr: this.singleVisitor.generated_Qr,
            status: "inactive",
            tenant: userTenant,
            quantity: 1,
          };

          const response = await this.submitVisitorData(payload);
          if (response) {
            this.showSuccessMessage("QR code saved successfully");
            this.resetForm(true);
            this.showSingleGeneratePopup = false;
            await this.fetchVisitorData();
          }
        } else {
          const totalEntries = this.multiVisitor.quantity;
          const savePromises = [];

          for (let i = 0; i < totalEntries; i++) {
            const qrCode = this.multiVisitor.generatedQRs[i];
            const visitorPayload = {
              startDate: this.multiVisitor.startDate,
              endDate: this.multiVisitor.endDate,
              startTime: this.multiVisitor.startTime,
              endTime: this.multiVisitor.endTime,
              assignedAccessLevels: this.multiVisitor.assignedAccessLevel,
              generated_Qr: qrCode.qrCode,
              status: "inactive",
              quantity: totalEntries,
              personName: `Visitor ${i + 1}`,
              email: `visitor${i + 1}@placeholder.com`,
              mobileNumber: `0000000000`,
              tenant: userTenant,
            };
            savePromises.push(this.submitVisitorData(visitorPayload));
          }

          await Promise.all(savePromises);

          this.showSuccessMessage(
            `Successfully saved ${totalEntries} QR codes`,
          );
          this.resetForm(false);
          this.showMultiGeneratePopup = false;
          await this.fetchVisitorData();
        }
      } catch (error) {
        this.showErrorMessage("Failed to save visitor data. Please try again.");
      } finally {
        this.isSaving = false;
      }
    },

    async submitVisitorData(payload) {
      const token = await authService.getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/visitor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit visitor data");
      }

      return await response.json();
    },

    async updateVisitorStatus(visitorId, newStatus) {
      try {
        const token = await authService.getToken();
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/visitor/${visitorId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
          },
        );

        if (!response.ok) throw new Error("Failed to update status");
        await this.fetchVisitorData();
      } catch (error) {
        console.error("Error updating status:", error);
        alert("Error updating status: " + error.message);
      }
    },

    async checkAndUpdateStatus(visitor) {
      const now = new Date();
      const startDateTime = new Date(
        `${visitor.startDate}T${visitor.startTime}`,
      );
      const endDateTime = new Date(`${visitor.endDate}T${visitor.endTime}`);
      let newStatus = visitor.status;

      if (now < startDateTime) {
        newStatus = "inactive";
      } else if (now > endDateTime) {
        newStatus = "expired";
      } else if (visitor.generated_Qr) {
        newStatus = "active";
      }

      if (newStatus !== visitor.status) {
        await this.updateVisitorStatus(visitor.id, newStatus);
      }
    },

    startStatusChecks() {
      this.statusInterval = setInterval(() => {
        this.visitorData.forEach((visitor) => {
          this.checkAndUpdateStatus(visitor);
        });
      }, 60000);
    },

    resetForm(isSingle = true) {
      if (isSingle) {
        this.singleVisitor = {
          personName: "",
          email: "",
          mobileNumber: "",
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
          assignedAccessLevel: "",
          status: "inactive",
          generatedQR: null,
        };
      } else {
        this.multiVisitor = {
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
          assignedAccessLevel: "",
          quantity: 1,
          status: "inactive",
          generatedQRs: [],
        };
      }
    },

    showSuccessMessage(message) {
      this.successMessage = message;
      setTimeout(() => {
        this.successMessage = "";
      }, 3000);
    },

    showErrorMessage(message) {
      console.error(message);
    },

    async fetchAccessLevels() {
      try {
        const tenantId = currentUserTenant.getTenantId();
        console.log("Fetching access levels for tenant:", tenantId);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/accesslevels?filter[tenant][tenantId][_eq]=${tenantId}`,
          {
            headers: {
              Authorization: `Bearer ${await authService.getToken()}`,
            },
          },
        );
        const data = await response.json();
        console.log("Fetched access levels data:", data);
        this.accessLevelOptions = data.data.map((level) => ({
          id: level.id,
          accessLevelName: level.accessLevelName,
        }));
        console.log("Processed accessLevelOptions:", this.accessLevelOptions);
        this.$forceUpdate();
      } catch (error) {
        console.error("Error fetching access levels:", error);
      }
    },

    async fetchVisitorData() {
      this.isLoading = true;
      try {
        const userTenant = await this.fetchUserTenant();
        if (!userTenant) throw new Error("User tenant not found");

        const params = new URLSearchParams({
          limit: "25",
          fields: [
            "email",
            "mobileNumber",
            "personName",
            "status",
            "startDate",
            "endDate",
            "startTime",
            "endTime",
            "quantity",
            "generated_Qr",
            "assignedAccessLevels.accessLevelName",
            "id",
            "tenant",
          ],
          sort: "sort",
          page: this.currentPage.toString(),
          "filter[status][_neq]": "archived",
          "filter[tenant][_eq]": userTenant,
        }).toString();

        const token = await authService.getToken();
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/visitor?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch visitor data");

        const data = await response.json();
        this.visitorData = data.data;
        this.visitorData.forEach((visitor) => {
          this.checkAndUpdateStatus(visitor);
        });
      } catch (error) {
        console.error("Error fetching visitor data:", error);
        alert("Error fetching visitor data: " + error.message);
      } finally {
        this.isLoading = false;
      }
    },

    formatTime(timeString) {
      if (!timeString) return "N/A";
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    isVisitorActive(visitor) {
      const now = new Date();
      const endDate = new Date(`${visitor.endDate}T${visitor.endTime}`);
      return endDate > now && visitor.status === "active";
    },

    async searchDropdownData(field, searchTerm) {
      if (!searchTerm) {
        await this.fetchDropdownData();
        return;
      }
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      let url = "";
      switch (field) {
        case "accessLevels":
          url = `${import.meta.env.VITE_API_URL}/items/accesslevels?fields=id,accessLevelName&filter[accessLevelName][_icontains]=${lowerCaseSearchTerm}`;
          break;
        case "branches":
          url = `${import.meta.env.VITE_API_URL}/items/branch?fields=id,branchName&filter[branchName][_icontains]=${lowerCaseSearchTerm}`;
          break;
      }
      try {
        const token = await authService.getToken();
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        this.$emit("update:dropdownData", {
          ...this.dropdownData,
          [field]: data.data,
        });
      } catch (error) {
        console.error(`Error fetching filtered ${field}:`, error);
        alert(`Error fetching filtered ${field}: ${error.message}`);
      }
    },

    async fetchDropdownData() {
      try {
        const token = await authService.getToken();
        const accessLevelsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/accesslevels?fields=id,accessLevelName`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const branchesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/branch?fields=id,branchName`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!accessLevelsResponse.ok || !branchesResponse.ok) {
          throw new Error("Failed to fetch dropdown data");
        }

        const accessLevelsData = await accessLevelsResponse.json();
        const branchesData = await branchesResponse.json();

        this.$emit("update:dropdownData", {
          accessLevels: accessLevelsData.data,
          branches: branchesData.data,
        });
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        alert("Error fetching dropdown data: " + error.message);
      }
    },

    async downloadPDF() {
      const doc = new jsPDF();
      let y = 20;
      const pageWidth = doc.internal.pageSize.getWidth();

      if (this.singleVisitor.generatedQR) {
        // Single QR PDF
        doc.setFontSize(16);
        doc.text("Single QR Code Details", pageWidth / 2, y, {
          align: "center",
        });
        y += 20;
        doc.setFontSize(12);
        doc.text(`Person Name: ${this.singleVisitor.personName}`, 20, y);
        y += 10;
        doc.text(`Email: ${this.singleVisitor.email}`, 20, y);
        y += 10;
        doc.text(`Mobile: ${this.singleVisitor.mobileNumber}`, 20, y);
        y += 10;
        doc.text(
          `Valid From: ${this.formatDate(
            this.singleVisitor.startDate + " " + this.singleVisitor.startTime,
          )}`,
          20,
          y,
        );
        y += 10;
        doc.text(
          `Valid Until: ${this.formatDate(
            this.singleVisitor.endDate + " " + this.singleVisitor.endTime,
          )}`,
          20,
          y,
        );
        y += 20;

        const img = new Image();
        img.src = this.singleVisitor.generatedQR;
        doc.addImage(img, "PNG", (pageWidth - 100) / 2, y, 100, 100);

        doc.save("Single_QR_Code.pdf");
      } else if (this.multiVisitor.generatedQRs.length > 0) {
        // Multiple QR PDF
        doc.setFontSize(16);
        doc.text("Multiple QR Codes Details", pageWidth / 2, y, {
          align: "center",
        });

        y += 15;
        doc.setFontSize(11);
        doc.text(
          `Valid From: ${this.formatDate(
            this.multiVisitor.startDate + " " + this.multiVisitor.startTime,
          )}`,
          20,
          y,
        );
        y += 8;
        doc.text(
          `Valid Until: ${this.formatDate(
            this.multiVisitor.endDate + " " + this.multiVisitor.endTime,
          )}`,
          20,
          y,
        );
        y += 8;
        doc.text(
          `Total QR Codes: ${this.multiVisitor.generatedQRs.length}`,
          20,
          y,
        );
        y += 15;

        const qrSize = 50;
        const startX = 20;
        const colSpacing = 65;
        const rowSpacing = 85;
        let currentY = y;

        for (let i = 0; i < this.multiVisitor.generatedQRs.length; i++) {
          if (i > 0 && i % 9 === 0) {
            doc.addPage();
            currentY = 20;
          }

          const qr = this.multiVisitor.generatedQRs[i];
          const col = i % 3;
          const row = Math.floor((i % 9) / 3);

          const x = startX + col * colSpacing;
          const y = currentY + row * rowSpacing;

          doc.setFontSize(10);
          doc.text(`QR Code #${i + 1}`, x, y - 5);

          const img = new Image();
          img.src = qr.qrCode;
          doc.addImage(img, "PNG", x, y, qrSize, qrSize);

          doc.setFontSize(8);
          doc.text(
            `Valid from: ${this.formatDate(qr.validFrom)}`,
            x,
            y + qrSize + 10,
          );
          doc.text(
            `Valid until: ${this.formatDate(qr.validUntil)}`,
            x,
            y + qrSize + 15,
          );
        }

        doc.save("Multiple_QR_Codes.pdf");
      }
    },
  },
  async mounted() {
    console.log("Component mounted");
    await this.fetchAccessLevels();
    await this.fetchDropdownData();
    await this.fetchVisitorData();
    this.startStatusChecks();
  },
  beforeDestroy() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  },
};
</script>

<style scoped>
.visitor-flow {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.tabs-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.left-tabs,
.right-tabs {
  display: flex;
  gap: 12px;
}

.left-tabs button {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f0f0f0;
  color: #666;
}

.left-tabs button.active {
  background-color: black;
  color: white;
}

.table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: auto;
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 2px solid #e9ecef;
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  color: #495057;
}

tr:hover {
  background-color: #f8f9fa;
}

/* Button Styles */
.action-button {
  padding: 8px 20px;
  border: 1px solid black;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
  color: black;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button:hover {
  background-color: black;
  color: white;
}

.btn {
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-generate {
  background-color: #28a745;
  color: white;
  border: none;
}

.btn-generate:hover {
  background-color: #218838;
}

.btn-save {
  background-color: black;
  color: white;
  border: none;
}

.btn-save:hover {
  background-color: var(--theme--primary-dark);
}

.btn-cancel {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #ced4da;
}

.btn-cancel:hover {
  background-color: #e9ecef;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.popup-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1200px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
  overflow: auto;
}

.popup-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.popup-header h2 {
  margin: 0;
  color: #212529;
  font-size: 20px;
  font-weight: 600;
}

.popup-body {
  flex: 1;
  padding: 24px;
  overflow: hidden;
}

.popup-footer {
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.split-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  height: calc(100vh - 250px);
  overflow: hidden;
}

.form-section {
  padding-right: 24px;
  overflow: hidden;
}

.download-section {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.download-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: black;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.download-btn i {
  font-size: 16px;
}

.qr-section {
  position: relative;
  border-left: 1px solid #e9ecef;
  padding-left: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  overflow: hidden;
}

.qr-scroll-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding-right: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  color: #495057;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: black;
  box-shadow: 0 0 0 2px rgba(var(--theme--primary-rgb), 0.1);
}

.required {
  color: #dc3545;
  margin-left: 4px;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
}

.qr-card {
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.qr-number {
  font-weight: 500;
  color: #495057;
  margin-bottom: 12px;
}

.qr-image {
  max-width: 200px;
  height: auto;
  margin: 0 auto;
}

.qr-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  text-align: center;
}

.qr-placeholder i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.validity-info {
  margin-top: 12px;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-badge.active {
  background-color: #e6f4ea;
  color: #1e7e34;
}

.status-badge.expired {
  background-color: #feeced;
  color: #dc3545;
}

.access-level-badge {
  background-color: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.qr-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.qr-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.qr-scroll-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.qr-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #666;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.no-data-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  color: #6c757d;
}

.no-data-message i {
  font-size: 48px;
  opacity: 0.5;
}

.no-data-message p {
  font-size: 16px;
  margin: 0;
}

.visitor-info {
  display: flex;
  flex-direction: column;
}

.visitor-email {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .split-layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .form-section {
    padding-right: 0;
  }

  .qr-section {
    border-left: none;
    border-top: 1px solid #e9ecef;
    padding-left: 0;
    padding-top: 24px;
    height: 400px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .tabs-container {
    flex-direction: column;
    gap: 12px;
  }

  .left-tabs,
  .right-tabs {
    width: 100%;
    justify-content: center;
  }

  .popup-content {
    margin: 20px;
    height: calc(100vh - 40px);
  }
}

@media print {
  .popup-overlay {
    position: relative;
    background: none;
  }

  .popup-content {
    box-shadow: none;
  }
  .btn {
    display: none;
  }
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-badge.active {
  background-color: #e6f4ea;
  color: #2cc750;
}

.status-badge.inactive {
  background-color: #fff3cd;
  color: #f0bc21;
}

.status-badge.expired {
  background-color: #feeced;
  color: #db1c2f;
}
</style>
