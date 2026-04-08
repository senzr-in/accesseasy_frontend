<template>
  <div class="settings-container">
    <router-view
      v-if="showSalary"
      @close="
        showSalary = false;
        initializeData();
      "
    />

    <div v-if="!showSalary">
      <div>
        <div class="section-header">
          <div
            class="header-with-back"
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <v-btn
              v-if="showSalaryConfig"
              icon="mdi-arrow-left"
              variant="text"
              size="small"
              @click="closeSalaryConfig"
              class="back-btn"
            ></v-btn>

            <h3 class="text-h6">
              {{
                showSalaryConfig ? selectedCategory.name : "Payroll Category"
              }}
            </h3>
            <div v-if="!showSalaryConfig" class="filters-container">
              <!-- Search Input -->
              <v-text-field
                v-model="searchQuery"
                placeholder="Search..."
                variant="outlined"
                density="compact"
                hide-details
                class="search-input"
                prepend-inner-icon="mdi-magnify"
              ></v-text-field>

              <!-- State Filter -->
              <v-select
                v-model="filterState"
                :items="states"
                item-title="text"
                item-value="value"
                label="State"
                variant="outlined"
                density="compact"
                hide-details
                class="filter-select"
                clearable
              ></v-select>
            </div>
          </div>
        </div>
      </div>

      <!-- Scrollable Content Section -->
      <div v-if="!showSalaryConfig" class="scrollable">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <span class="ml-2 text-grey-darken-1">Loading categories...</span>
        </div>

        <!-- No Data State -->
        <div v-else-if="SalaryCategories.length === 0" class="no-data-found">
          <div class="category-grid">
            <div class="category-card create-card" @click="openCreateDialog">
              <div class="create-content">
                <div class="create-icon">
                  <v-icon size="24" color="#6366f1">mdi-plus</v-icon>
                </div>
                <h4 class="create-title">Create New</h4>
                <p class="create-subtitle">Add a new salary category</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Category Cards Grid -->
        <div v-else>
          <div class="category-grid">
            <!-- Create New Card -->
            <div class="category-card create-card" @click="openCreateDialog">
              <div class="create-content">
                <div class="create-icon">
                  <v-icon size="24" color="#6366f1">mdi-plus</v-icon>
                </div>
                <h4 class="create-title">Create New</h4>
                <p class="create-subtitle">Add a new salary category</p>
              </div>
            </div>

            <div
              v-for="category in SalaryCategories"
              :key="category.id"
              class="category-card template-card"
              @click="openSalaryConfig(category)"
            >
              <div class="card-header">
                <div class="category-badge">
                  {{
                    states.find((state) => state.value === category.state)
                      ?.text || category.state
                  }}
                </div>
                <div class="card-icon">
                  <v-icon size="20" color="primary">mdi-cash</v-icon>
                </div>
              </div>

              <div class="card-content">
                <h4 class="category-title">{{ category.name }}</h4>
              </div>

              <!-- Action buttons -->
              <div class="card-actions">
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  color="primary"
                  @click.stop="editCategory(category)"
                ></v-btn>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SalaryConfiguration Component -->
      <!-- <SalaryConfiguration
        v-if="showSalaryConfig"
        :category="selectedCategory"
        @close="closeSalaryConfig"
      /> -->

      <!-- Create/Edit Category Dialog -->
      <v-dialog v-model="categoryDialog" max-width="500px">
        <v-card>
          <v-card-title class="dialog-title">
            {{ editingCategory ? "Edit" : "Create" }} Payroll Category
          </v-card-title>
          <v-card-text class="dialog-content">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedState"
                  :items="states"
                  item-title="text"
                  item-value="value"
                  label="Select State"
                  class="mb-4"
                  variant="outlined"
                  @update:model-value="stateLimit"
                  :error-messages="limitMessage"
                >
                </v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :disabled="!selectedState"
                  v-model="categoryName"
                  label="Category Name"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="dialog-actions">
            <v-spacer></v-spacer>
            <v-btn color="error" variant="text" @click="categoryDialog = false"
              >Cancel</v-btn
            >
            <v-btn color="black" @click="saveCategory">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
// import SalaryConfiguration from "./salaryConfiguration.vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

export default {
  name: "SalaryCategory",

  props: ["category"],
  data() {
    return {
      //
      selectedSkillLevels: "",
      skillLevels: [
        "HighlySkilled",
        "Skilled",
        "Semiskilled",
        "UnSkilled",
        "Drivers",
        "OfficeStaffs",
        "Others",
      ],
      selectedAreaType: null,

      //
      stateSelectionCount: 0,
      maxStateSelections: 5,

      tenantId: null,
      categoryDialog: false,
      SalaryCategories: [],
      states: [],
      branches: ["sensen", "essl"],
      areaTypes: null,
      areaType: null,
      selectedState: null,
      selectedBranches: [],
      stateCategoryCounts: {},
      categoryName: "",
      editingCategory: null,
      searchQuery: "",
      filterState: null,
      filterBranch: null,
      filterArea: null,
      filterSkills: null,
      allBranches: [],
      showSalaryConfig: false,
      showSalary: false,
      selectedCategory: null,
      isLoading: false,
      page: 1,
      limit: 25,
    };
  },
  computed: {
    defaultCategoryName() {
      if (!this.selectedState) return "Select a state first";

      const selectedStateInfo = this.states.find(
        (state) => state.value === this.selectedState,
      );
      const stateName = selectedStateInfo ? selectedStateInfo.text : "";
      const count = (this.stateCategoryCounts[stateName] || 0) + 1;
      this.categoryName = `${stateName} ${count}`; // This line is correct! Keep it!
      return this.categoryName;
    },
    token() {
      return authService.getToken();
    },
    apiUrl() {
      return import.meta.env.VITE_API_URL;
    },
  },
  created() {
    this.initializeData();
  },
  methods: {
    stateLimit(value) {
      const stateName = this.states.find(
        (state) => state.value === value,
      )?.text;

      if (stateName && (this.stateCategoryCounts[stateName] || 0) >= 6) {
        this.limitMessage = ` Only 6 category will be allowed in ${stateName} !`;
        this.selectedState = null;
      } else {
        this.limitMessage = "";
        this.selectedState = value;
      }
    },

    updateStateCategoryCounts() {
      const counts = {};
      this.SalaryCategories.forEach((category) => {
        const stateName = this.states.find(
          (state) => state.value === category.state,
        )?.text;
        if (stateName) {
          counts[stateName] = (counts[stateName] || 0) + 1;
        }
      });
      this.stateCategoryCounts = counts;
    },
    closeSalaryConfig() {
      // Implement your close logic here
      this.showSalaryConfig = false;
    },
    removeSkillLevel(level) {
      this.selectedSkillLevels = this.selectedSkillLevels.filter(
        (item) => item !== level,
      );
    },
    async initializeData() {
      this.isLoading = true;
      try {
        await this.user();
        await this.fetchStateData();
        await this.fetchAccessLevels();
        await this.fetchBranches();
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        this.isLoading = false;
      }
    },

    onAreaTypeChange() {
      // Optional: Add any specific logic you want when area type changes
      console.log("Selected Area Type:", this.areaType);
    },
    async user() {
      const userData = await currentUserTenant.fetchLoginUserDetails();
      this.tenantId = await currentUserTenant.getTenantId();
      console.log(".....", this.tenantId);
      return userData;
    },
    async fetchStateData() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/tax`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        );
        const data = await response.json();

        this.states = data.data
          .filter(
            (item) =>
              item.state &&
              ["Tamil Nadu", "Maharashtra", "Delhi", "Karnataka"].includes(
                item.state,
              ),
          )
          .map((item) => ({
            text: item.state,
            value: item.id,
          }));

        this.selectedState = null; // Reset selection if previous value is not valid
      } catch (error) {
        console.error("Error fetching state data:", error);
      }
    },

    async fetchAccessLevels() {
      try {
        const fields = [
          "skillLevel",
          "zone",
          "basicPay",
          "earnings",
          "status",
          "tenant",
          "deductions",
          "employerContribution",
          "advancedMode",
          "allowances",
          "professionalTax",
          "LWF",
          "id",
          "configName",
          "adminCharges",
          "stateTaxes",
          "payrollBranch.branch_id.branchName",
        ];

        // Use an array to build the query string
        let params = `filter[tenant][_eq]=${this.tenantId}`;

        // Append fields to the params string
        params += fields.map((field) => `&fields[]=${field}`).join("");

        // Check if filterState is provided and append it
        if (this.filterState) {
          params += `&filter[stateTaxes][_eq]=${this.filterState}`;
        }
        if (this.filterSkills) {
          params += `&filter[skillLevel][_eq]=${this.filterSkills}`;
        }
        if (this.filterArea) {
          params += `&filter[zone][_eq]=${this.filterArea}`;
        }
        if (this.searchQuery) {
          params += `&filter[configName][_icontains]=${this.searchQuery}`;
        }

        // Make the fetch request with the constructed URL
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/salarySetting?${params}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
          },
        );

        // Check if the response is okay
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Update SalaryCategories with fetched data
        this.SalaryCategories = data.data.map((setting) => ({
          id: setting.id,
          name: setting.configName,
          state: setting.stateTaxes,
          zone: setting.zone,
          skillLevel: setting?.skillLevel || "",
          branches: (setting.payrollBranch || [])
            .map((pb) => pb?.branch_id?.branchName)
            .filter(Boolean),
          basicPay: setting.basicPay,
          earnings: setting.earnings,
          deductions: setting.deductions,
        }));

        // Optional: Update UI or perform additional processing
        this.loading = false;
        this.updateStateCategoryCounts();
        return data;
      } catch (error) {
        console.error("Error fetching salary settings:", error);
        this.loading = false;
        // Handle error appropriately
        throw error;
      }
    },

    async fetchBranches() {
      try {
        await currentUserTenant.fetchLoginUserDetails();
        const tenantId = currentUserTenant.getTenantId();

        let queryString = `filter[tenant][tenantId][_eq]=${tenantId}`;
        const selectedItem = this.states.find(
          (state) => state.value === this.selectedState,
        );
        queryString += `&filter[state][_eq]=${selectedItem?.text}`;

        const response = await fetch(
          `${this.apiUrl}/items/branch?${queryString}`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();
        this.allBranches = data.data.map((branch) => ({
          text: branch.branchName,
          value: branch.branchId,
          state: branch.state,
          areaType: branch.areaType,
        }));
        this.areaTypes = [
          ...new Set(this.allBranches.map((branch) => branch.areaType)),
        ];
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    },
    async loadBranches() {
      if (this.selectedState) {
        this.branches = this.allBranches.filter(
          (branch) => branch.state === this.selectedState,
        );
      } else {
        this.branches = this.allBranches;
      }
    },
    openCreateDialog() {
      this.showSalary = true;
      this.$router.push("/payroll/policy/payroll-policy/salary-template");
    },
    async saveCategory() {
      try {
        // Validate inputs
        if (!this.selectedState) {
          alert("Please select state");
          return;
        }

        // Prepare configuration data
        const configData = {
          configName: this.categoryName || this.defaultCategoryName,
          salarySettings: {
            basicPay: null,
            earnings: [],
            deductions: [],
          },
          zone: this.selectedAreaType,
          skillLevel: this.selectedSkillLevels,
          status: "active",
          stateTaxes: this.selectedState,
          professionalTax: this.selectedState,
          LWF: this.selectedState,

          payrollBranch: {
            create: this.selectedBranches.map((branchId) => ({
              salarySetting_id: this.editingCategory?.id.toString(), // Convert to string
              branch_id: { id: this.selectedBranches[0] },
            })),
            update: [],
            delete: [],
          },
        };

        const url = this.editingCategory
          ? `${import.meta.env.VITE_API_URL}/items/salarySetting/${
              this.editingCategory.id
            }`
          : `${import.meta.env.VITE_API_URL}/items/salarySetting`;

        // Make API request
        const response = await fetch(url, {
          method: this.editingCategory ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...configData,
            id: this.editingCategory ? this.editingCategory.id : undefined,
            tenant: {
              tenantId: currentUserTenant.getTenantId(),
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Reset dialog and refresh data
        this.categoryDialog = false;
        this.editingCategory = null;

        await this.fetchAccessLevels();

        return data;
      } catch (error) {
        console.error("Error saving configuration:", error);
        alert("Failed to save category. Please try again.");
      }
    },

    editCategory(category) {
      this.editingCategory = category;
      this.selectedState = category.state;
      this.selectedAreaType = category.zone;
      // Find the corresponding branch objects from allBranches
      this.selectedBranches = category.branches
        .map(
          (branchName) =>
            this.allBranches.find((b) => b.text === branchName)?.value,
        )
        .filter(Boolean);
      this.categoryName = category.name;
      this.loadBranches();
      this.categoryDialog = true;
    },
    async duplicateCategory(category) {
      try {
        const newCategory = {
          ...category,
          configName: `${category.name} (Copy)`,
          tenant: this.tenantId,
        };
        delete newCategory.id;

        const response = await fetch(`${this.apiUrl}/items/salarySetting`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCategory),
        });

        if (response.ok) {
          await this.fetchAccessLevels();
        }
      } catch (error) {
        console.error("Error duplicating category:", error);
      }
    },
    async deleteCategory(categoryId) {
      if (confirm("Are you sure you want to delete this category?")) {
        try {
          const response = await fetch(
            `${this.apiUrl}/items/salarySetting/${categoryId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${this.token}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (response.ok) {
            await this.fetchAccessLevels();
          }
        } catch (error) {
          console.error("Error deleting category:", error);
        }
      }
    },
    openSalaryConfig(category) {
      this.selectedCategory = category;
      console.log("category", category);
      this.showSalary = true;
      this.$router.push({
        name: "salary-templateEdit",
        params: { categoryData: category.id },
      });
    },

    closeSalaryConfig() {
      this.showSalaryConfig = false;
      this.$router.push("/payroll/policy/payroll-policy");
    },
  },
  watch: {
    searchQuery: {
      handler() {
        this.fetchAccessLevels();
      },
      debounce: 300,
    },
    selectedState(newValue) {
      this.defaultCategoryName;
      this.fetchBranches();
    },
    filterState() {
      this.fetchAccessLevels();
    },
    filterBranch() {
      this.fetchAccessLevels();
    },
    filterArea() {
      this.fetchAccessLevels();
    },
    filterSkills() {
      this.fetchAccessLevels();
    },
  },
};
</script>

<style scoped>
.settings-container {
  width: 100%;
  height: calc(100vh - 50px);
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  line-height: 1.3;
}
.scrollable {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 50px);
  padding: 24px;
}
.loading-state,
.no-data-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: #64748b;
}

.loading-state {
  gap: 16px;
}
.templates-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 0;
  margin-top: 20px;
}

.section-header {
  align-items: center;
  flex-wrap: wrap;
  gap: 50px;
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.create-btn {
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.template-card {
  padding: 20px;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.template-card:hover .card-actions {
  opacity: 1;
}
.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  background: rgba(255, 255, 255, 0.95);
  padding: 4px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.text-h6 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
.category-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  height: 160px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.create-card:hover {
  border-color: #6366f1;
  background: #f8faff;
}
.create-card {
  background: white;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.create-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.create-icon {
  width: 48px;
  height: 48px;
  background: #eef2ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.create-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.create-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.category-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  /* font-weight: 600; */
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.create-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.create-text {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.template-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.category-name {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 16px;
}

.category-details {
  flex: 1;
  display: flex;
  flex-direction: column;

  margin-top: 12px;
  align-items: flex-start;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.detail-value {
  font-size: 18px;
  color: black;
}

.template-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px;
  border-radius: 8px;
}

.template-card:hover .template-actions {
  opacity: 1;
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  padding: 24px 24px 0;
}

.dialog-content {
  padding: 24px;
}

.dialog-actions {
  padding: 16px 24px;
}

.filters-container {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
  margin-bottom: 0;
}

.filter-select {
  width: 160px;
  margin-bottom: 0;
}

.header-with-back {
  display: flex;
  align-items: center;
  gap: 8px;
}
/*  */

.skill-level-select {
  max-width: 300px;
}
.area-type-section {
  margin-bottom: 24px;
}

.area-type-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}
@media (max-width: 768px) {
  .templates-container {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .template-card {
    height: 160px;
  }
  .category-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    padding: 16px;
  }
}
</style>
