<template>
  <div class="sidebar-container">
    <div class="header">
      <div class="header-left">
        <h2 class="header-title">Create Clients</h2>
      </div>
      <div class="header-right">
        <BaseButton @click="emitClose" variant="danger" :text="`Cancel`" />
        <BaseButton @click="handleSave" :text="`Save`" variant="primary" />
        <!-- <button class="draft-btn" @click="handleSaveDraft">
          Save as draft
        </button> -->
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="sidebar-layout" id="clientForm">
      <!-- Client Info -->
      <div class="info-box">
        <h2 class="box-title">Client Details</h2>
        <div class="form-row">
          <div class="form-group">
            <label for="category">Category</label>
            <select
              v-model="client.category"
              id="category"
              class="input"
              required
            >
              <option value="clientorg">Client-Company</option>
              <option value="contact">Individual</option>
            </select>
          </div>
          <div class="form-group">
            <label for="clientName">{{
              client.category === "contact" ? "Contact Name" : "Client's Name"
            }}</label>
            <input
              v-model="client.orgName"
              id="clientName"
              type="text"
              class="input"
              :placeholder="
                client.category === 'contact'
                  ? 'Enter Contact name'
                  : 'Enter Client name'
              "
              required
            />
          </div>
          <div class="form-group">
            <label for="supervisor">Supervisor</label>
            <div class="searchable-select" @click="toggleSupervisorDropdown">
              <input
                v-model="supervisorSearch"
                id="supervisor"
                type="text"
                class="input"
                :placeholder="
                  showSupervisorDropdown
                    ? 'Search supervisor...'
                    : 'Select Supervisor'
                "
                @focus="showSupervisorDropdown = true"
                @input="showSupervisorDropdown = true"
              />
              <div v-if="showSupervisorDropdown" class="dropdown-list">
                <ul>
                  <li
                    v-for="sup in filteredSupervisors"
                    :key="sup.id"
                    @click="selectSupervisor(sup)"
                  >
                    {{ sup.name }}
                  </li>
                </ul>
                <div v-if="filteredSupervisors.length === 0" class="no-results">
                  No supervisors found
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="phoneNumber">Phone number</label>
            <input
              v-model="client.orgNumber"
              id="phoneNumber"
              type="tel"
              class="input"
              :placeholder="
                client.category === 'contact'
                  ? 'Enter Contact number'
                  : 'Enter Client number'
              "
              maxlength="10"
              pattern="[0-9]{10}"
              title="Please enter exactly 10 digits"
              @input="validatePhoneNumber"
              required
            />
            <div v-if="phoneError" class="error-message">{{ phoneError }}</div>
          </div>
          <div class="form-group">
            <label for="email">E-mail ID</label>
            <input
              v-model="client.email"
              id="email"
              type="email"
              class="input"
              :placeholder="
                client.category === 'contact'
                  ? 'Enter Contact email'
                  : 'Enter Client email'
              "
            />
          </div>
        </div>
        <div class="form-group">
          <label for="address"> Billing Address</label>
          <input
            v-model="client.orgAddress"
            id="address"
            type="text"
            class="input"
            placeholder="Enter full address"
            required
          />
        </div>
      </div>

      <!-- Search -->
      <div class="search-container">
        <input
          id="search-input"
          type="text"
          placeholder="Search for address..."
          class="input"
        />
      </div>

      <!-- Map -->
      <div id="map" class="map"></div>

      <!-- Toast Notification -->
      <ToastNotification
        v-if="toast.show"
        :show="toast.show"
        :message="toast.message"
        :type="toast.type"
        @close="toast.show = false"
      />
    </form>
  </div>
</template>

<script>
import { Loader } from "@googlemaps/js-api-loader";
import { reactive, onMounted, ref, computed, onUnmounted, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";
import axios from "axios";
import ToastNotification from "@/components/common/notifications/ToastNotification.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

export default {
  name: "AddClient",
  components: {
    ToastNotification,
    BaseButton,
  },
  emits: ["close", "success"],
  setup(props, { emit }) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const apiUrl = import.meta.env.VITE_API_URL;
    const tenantId = currentUserTenant.getTenantId();
    const token = authService.getToken();
    const client = reactive({
      orgName: "",
      email: "",
      orgNumber: "",
      orgAddress: "",
      supervisor: "",
      latitude: "",
      longitude: "",
      category: "clientorg",
    });
    const isSubmitting = ref(false);
    const phoneError = ref("");
    const toast = reactive({
      show: false,
      message: "",
      type: "error",
    });
    const supervisors = ref([]);
    const supervisorSearch = ref("");
    const showSupervisorDropdown = ref(false);
    let map;
    let searchBox;
    let marker;

    const filteredSupervisors = computed(() => {
      if (!supervisorSearch.value.trim()) return supervisors.value;
      return supervisors.value.filter((s) =>
        s.name.toLowerCase().includes(supervisorSearch.value.toLowerCase()),
      );
    });

    const fetchSupervisors = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/items/personalModule?filter[assignedUser][tenant][tenantId][_eq]=${tenantId}&fields=id,assignedUser.first_name`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        supervisors.value = response.data.data.map((item) => ({
          id: item.id,
          name: item.assignedUser.first_name,
        }));
      } catch (error) {
        console.error("Failed to fetch supervisors:", error);
        toast.message = "Failed to load supervisors.";
        toast.type = "error";
        toast.show = true;
      }
    };

    const selectSupervisor = (sup) => {
      client.supervisor = sup.id;
      supervisorSearch.value = sup.name;
      showSupervisorDropdown.value = false;
    };

    const toggleSupervisorDropdown = () => {
      showSupervisorDropdown.value = !showSupervisorDropdown.value;
    };

    const closeDropdown = (e) => {
      if (!e.target.closest(".searchable-select")) {
        showSupervisorDropdown.value = false;
      }
    };

    const initMap = async () => {
      const loader = new Loader({
        apiKey,
        version: "weekly",
        libraries: ["places"],
      });
      const google = await loader.load();
      map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
      });

      // Initialize SearchBox
      const searchInput = document.getElementById("search-input");
      searchBox = new google.maps.places.SearchBox(searchInput);

      // Bias the SearchBox results towards current map's viewport
      map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
      });

      // Listen for the search to finish
      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length === 0) {
          return;
        }

        // Clear the previous marker
        if (marker) {
          marker.setMap(null);
        }

        // For each place, get the icon, name and location
        const bounds = new google.maps.LatLngBounds();
        const place = places[0]; // Use the first place

        if (!place.geometry || !place.geometry.location) {
          console.log("No geometry available for place");
          return;
        }

        // Create a marker for each place
        marker = new google.maps.Marker({
          map,
          title: place.name,
          position: place.geometry.location,
        });

        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }

        // Update client address and coordinates
        client.orgAddress = place.formatted_address || "";
        client.latitude = place.geometry.location.lat().toFixed(8);
        client.longitude = place.geometry.location.lng().toFixed(8);

        map.fitBounds(bounds);
      });
    };

    const validatePhoneNumber = () => {
      client.orgNumber = client.orgNumber.replace(/\D/g, "");
      if (client.orgNumber.length > 10) {
        client.orgNumber = client.orgNumber.slice(0, 10);
      }
      if (client.orgNumber && client.orgNumber.length !== 10) {
        phoneError.value = "Phone number must be exactly 10 digits";
      } else {
        phoneError.value = "";
      }
    };

    const handleSubmit = async (status = "active") => {
      validatePhoneNumber();
      if (phoneError.value) {
        toast.message = "Please fix the phone number error before submitting.";
        toast.type = "error";
        toast.show = true;
        return;
      }
      if (client.orgNumber.length !== 10) {
        toast.message = "Phone number must be exactly 10 digits.";
        toast.type = "error";
        toast.show = true;
        return;
      }
      isSubmitting.value = true;
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/items/organization`,
          {
            orgName: client.orgName,
            email: client.email,
            orgNumber: client.orgNumber,
            orgAddress: client.orgAddress,
            supervisor: client.supervisor,
            status,
            tenant: tenantId,
            orgType: client.category,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        toast.message = `${client.category === "contact" ? "Contact" : "Client"} added successfully!`;
        toast.type = "success";
        toast.show = true;
        Object.assign(client, {
          orgName: "",
          email: "",
          orgNumber: "",
          orgAddress: "",
          supervisor: "",
          latitude: "",
          longitude: "",
          category: "clientorg",
        });
        supervisorSearch.value = "";
        showSupervisorDropdown.value = false;
        phoneError.value = "";
        if (marker) marker.setMap(null);
        map.setCenter({ lat: 20.5937, lng: 78.9629 });
        map.setZoom(5);
        emit("success");
      } catch (error) {
        toast.message = `Failed to add ${client.category === "contact" ? "contact" : "client"}. Please try again.`;
        toast.type = "error";
        toast.show = true;
      } finally {
        isSubmitting.value = false;
      }
    };

    const handleSave = () => {
      handleSubmit("active");
    };

    const handleSaveDraft = () => {
      handleSubmit("draft");
    };

    const emitClose = () => {
      emit("close");
    };

    watch(
      () => client.supervisor,
      (newVal) => {
        if (!newVal) {
          supervisorSearch.value = "";
        } else {
          const sup = supervisors.value.find((s) => s.id === newVal);
          if (sup) {
            supervisorSearch.value = sup.name;
          }
        }
      },
    );

    onMounted(() => {
      initMap();
      fetchSupervisors();
      document.addEventListener("click", closeDropdown);
    });

    onUnmounted(() => {
      document.removeEventListener("click", closeDropdown);
    });

    return {
      client,
      handleSubmit,
      handleSave,
      handleSaveDraft,
      isSubmitting,
      phoneError,
      validatePhoneNumber,
      emitClose,
      toast,
      supervisorSearch,
      showSupervisorDropdown,
      filteredSupervisors,
      selectSupervisor,
      toggleSupervisorDropdown,
    };
  },
};
</script>

<style scoped>
.sidebar-container {
  width: 700px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #fff;
  border-left: 1px solid #e1e4e8;
  padding: 20px;
  margin-top: 60px;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e1e4e8;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.save-btn,
.draft-btn,
.close-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.close-btn {
  background: none;
  color: #6c757d;
  font-size: 18px;
  padding: 4px;
}

.close-btn:hover {
  color: #dc3545;
}

.sidebar-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  height: calc(100vh - 80px);
  padding-bottom: 20px;
}

.info-box {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 20px;
  background: #fff;
}

.box-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #059367;

  padding-bottom: 5px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.form-row:last-child {
  grid-template-columns: 1fr 2fr;
}

.form-group {
  margin-bottom: 0;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #555;
}

.input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.searchable-select {
  position: relative;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dropdown-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dropdown-list li {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-list li:hover {
  background-color: #f8f9fa;
}

.dropdown-list li:last-child {
  border-bottom: none;
}

.no-results {
  padding: 10px;
  color: #6c757d;
  font-style: italic;
}

.search-container {
  margin-bottom: 10px;
}

#search-input {
  width: 100%;
}

.map {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  border: 1px solid #e1e4e8;
  background: #f8f9fc;
  flex-shrink: 0;
}

.error-message {
  color: red;
  font-size: 12px;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .sidebar-container {
    width: 100%;
    max-width: 350px;
    padding: 15px;
  }

  .header-title {
    font-size: 18px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .info-box {
    padding: 12px;
  }

  .box-title {
    font-size: 16px;
  }

  .input {
    padding: 8px;
    font-size: 13px;
  }

  .map {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .sidebar-container {
    padding: 10px;
  }

  .header-title {
    font-size: 16px;
  }

  .header-right {
    gap: 5px;
  }

  .save-btn,
  .draft-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .form-group {
    margin-bottom: 10px;
  }

  .input {
    padding: 7px;
    font-size: 12px;
  }

  .map {
    height: 200px;
  }
}
</style>
