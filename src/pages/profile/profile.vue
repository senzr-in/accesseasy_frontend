<template>
  <v-app>
    <v-main class="profile-page">
      <v-container fluid class="pa-0 fill-height">
        <div class="profile-content">
          <!-- Left Section -->
          <div class="profile-sidebar">
            <div class="profile-image-section">
              <div class="profile-image-container">
                <v-avatar size="200" class="profile-avatar">
                  <v-img
                    :src="profileImage"
                    :alt="profileData.avatar?.title || 'Profile Image'"
                    @error="handleImageError"
                  >
                    <template v-slot:placeholder>
                      <v-icon size="200" color="grey lighten-1"
                        >mdi-account-circle</v-icon
                      >
                    </template>
                  </v-img>
                </v-avatar>
                <!-- <v-btn
                  color="primary"
                  fab
                  small
                  class="camera-btn"
                  @click="triggerImageUpload"
                >
                  <v-icon>mdi-camera</v-icon>
                </v-btn> -->
              </div>
              <h1 class="profile-name">{{ fullName }}</h1>
              <div class="profile-role">{{ profileData.role?.name }}</div>
              <div class="profile-tenant">
                {{ profileData.tenant?.tenantName }}
              </div>
            </div>

            <div class="quick-info">
              <div class="info-item">
                <v-icon color="primary">mdi-domain</v-icon>
                <div class="info-details">
                  <span class="info-label">Department</span>
                  <span class="info-value">{{
                    profileData.departmentName || "Not Set"
                  }}</span>
                </div>
              </div>
              <div class="info-item">
                <v-icon color="primary">mdi-office-building</v-icon>
                <div class="info-details">
                  <span class="info-label">Branch</span>
                  <span class="info-value">{{
                    profileData.branchName || "Not Set"
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Section -->
          <div class="profile-main">
            <v-tabs
              v-model="activeTab"
              background-color="transparent"
              color="primary"
              class="profile-tabs"
            >
              <v-tab class="custom-tab">Profile Details</v-tab>
            </v-tabs>

            <v-tabs-items v-model="activeTab" class="profile-tabs-content">
              <v-tab-item>
                <div class="details-grid">
                  <div
                    v-for="field in profileFields"
                    :key="field.name"
                    class="detail-item"
                  >
                    <div class="detail-label">{{ field.label }}</div>
                    <div class="detail-value">
                      {{ profileData[field.name] || "Not Set" }}
                    </div>
                  </div>
                </div>
              </v-tab-item>
            </v-tabs-items>
          </div>
        </div>
      </v-container>
    </v-main>
    <input
      type="file"
      ref="imageInput"
      @change="handleImageUpload"
      accept="image/*"
      style="display: none"
    />
  </v-app>
</template>

<script>
import { ref } from "vue";
import { authService } from "@/services/authService";
import axios from "axios";

export default {
  name: "ProfilePage",
  data() {
    return {
      activeTab: 0,
      profileData: {},
      profileFields: [
        { name: "first_name", label: "First Name", editable: true },
        { name: "last_name", label: "Last Name", editable: true },
        { name: "phone", label: "Phone Number", editable: true },
        { name: "email", label: "Email", editable: true },
        { name: "role.name", label: "Role", editable: false },
        { name: "tenant.tenantName", label: "Tenant Name", editable: false },
      ],
      profileImage: null,
      isLoadingImage: false,
    };
  },

  computed: {
    fullName() {
      return (
        `${this.profileData.first_name || ""} ${
          this.profileData.last_name || ""
        }`.trim() || "Not Set"
      );
    },
  },

  mounted() {
    this.fetchProfileData();
  },

  methods: {
    async fetchProfileData() {
      try {
        const api = axios.create({
          baseURL: import.meta.env.VITE_API_URL,
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            "Content-Type": "application/json",
          },
        });

        const token = localStorage.getItem("userToken");
        if (!token) {
          throw new Error("No user token found");
        }

        const response = await api.get("/users/me", {
          params: {
            fields: [
              "first_name",
              "last_name",
              "phone",
              "email",
              "avatar.id",
              "avatar.title",
              "role.name",
              "tenant.tenantName",
            ],
          },
        });

        if (response.data?.data) {
          console.log("Profile response:", response.data);
          const userData = response.data.data;
          this.profileData = {
            first_name: userData.first_name || "Not Set",
            last_name: userData.last_name || "Not Set",
            phone: userData.phone || "Not Set",
            email: userData.email || "Not Set",
            role: userData.role || { name: "Not Set" },
            tenant: userData.tenant || { tenantName: "Not Set" },
            avatar: userData.avatar || null,
            departmentName: userData.departmentName || "Not Set", // Adjust based on your API
            branchName: userData.branchName || "Not Set", // Adjust based on your API
          };

          if (userData.avatar?.id) {
            await this.fetchAuthorizedImage(
              `${import.meta.env.VITE_API_URL}/assets/${userData.avatar.id}`,
            );
          }
        } else {
          throw new Error("No user data found");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        this.profileData = {
          first_name: "Guest",
          last_name: "",
          phone: "Not Set",
          email: "Not Set",
          role: { name: "Employee" },
          tenant: { tenantName: "No organization" },
          departmentName: "Not Set",
          branchName: "Not Set",
        };
        if (error.response?.status === 401) {
          authService.logout();
          this.$router.push("/login");
        }
      }
    },

    async fetchAuthorizedImage(imageUrl) {
      this.isLoadingImage = true;
      try {
        const response = await fetch(imageUrl, {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        });
        if (!response.ok) throw new Error("Failed to load image");
        const blob = await response.blob();
        this.profileImage = URL.createObjectURL(blob);
      } catch (error) {
        console.error("Error loading profile image:", error);
        this.profileImage = null;
      } finally {
        this.isLoadingImage = false;
      }
    },

    handleImageError() {
      this.profileImage = null;
      console.warn("Failed to load profile image");
    },

    triggerImageUpload() {
      this.$refs.imageInput.click();
    },

    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          const response = await authService.protectedApi.post(
            "/files",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );
          if (response.data.data?.id) {
            const reader = new FileReader();
            reader.onload = (e) => {
              this.profileImage = e.target.result;
            };
            reader.readAsDataURL(file);
            await authService.protectedApi.patch(`/users/me`, {
              avatar: response.data.data.id,
            });
            this.profileData.avatar = { id: response.data.data.id };
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          if (error.response?.status === 401) {
            authService.logout();
            this.$router.push("/login");
          }
        }
      }
    },
  },
};
</script>

<style scoped>
.profile-page {
  background-color: #ffffff;
  min-height: 100vh;
}

.profile-content {
  display: flex;
  min-height: 100vh;
}

.profile-sidebar {
  background-color: #f8fafc;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #e2e8f0;
}

.profile-image-section {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-image-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.profile-avatar {
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.camera-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 2;
}

.profile-name {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a202c;
}

.profile-role {
  font-size: 1.1rem;
  color: #4a5568;
  margin-bottom: 0.25rem;
}

.profile-tenant {
  font-size: 0.9rem;
  color: #718096;
}

.quick-info {
  width: 100%;
  margin-top: 2rem;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  gap: 1rem;
}

.info-details {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.8rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 1rem;
  color: #2d3748;
  font-weight: 500;
}

.custom-tab {
  font-weight: 550;
}

.profile-main {
  flex: 1;
  padding: 2rem;
  background-color: #fff;
  width: 1100px;
}

.profile-tabs {
  margin-bottom: 2rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.detail-item {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
}

.detail-label {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 1rem;
  color: #2d3748;
  font-weight: 500;
}

.detail-value.with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 960px) {
  .profile-content {
    flex-direction: column;
  }

  .profile-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }

  .profile-main {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
