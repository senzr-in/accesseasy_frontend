<template>
  <v-card flat class="professional-tax-lwf">
    <v-card-text>
      <v-row>
        <!-- Professional Tax Section -->
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="d-flex align-center">
              Professional Tax
              <v-tooltip location="right">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-information"
                    variant="text"
                    size="small"
                    color="grey"
                    class="ml-2"
                  ></v-btn>
                </template>
                <span>Professional Tax information</span>
              </v-tooltip>
            </v-card-title>
            <v-card-text>
              <v-autocomplete
                v-model="selectedPTState"
                :items="states"
                label="Select State"
                variant="outlined"
                @update:model-value="updatePTValues"
              ></v-autocomplete>
              <v-list
                v-if="selectedPTState && ptValues.length > 0"
                class="bg-grey-lighten-4"
              >
                <v-list-item v-for="(value, index) in ptValues" :key="index">
                  <v-list-item-title>{{ value.range }}</v-list-item-title>
                  <v-list-item-subtitle>{{ value.tax }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-alert
                v-else-if="selectedPTState"
                type="info"
                variant="tonal"
                class="mt-4"
              >
                Professional tax is not applicable in {{ selectedPTState }}.
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Employee LWF Section -->
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="d-flex align-center">
              Employee LWF
              <v-tooltip location="right">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-information"
                    variant="text"
                    size="small"
                    color="grey"
                    class="ml-2"
                  ></v-btn>
                </template>
                <span>Labour Welfare Fund information</span>
              </v-tooltip>
            </v-card-title>
            <v-card-text>
              <v-autocomplete
                v-model="selectedLWFState"
                :items="states"
                label="Select State"
                variant="outlined"
                @update:model-value="updateLWFValues"
              ></v-autocomplete>
              <v-list
                v-if="selectedLWFState && lwfValue"
                class="bg-grey-lighten-4"
              >
                <v-list-item>
                  <v-list-item-title>Employee Contribution</v-list-item-title>
                  <v-list-item-subtitle>₹{{ lwfValue }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-alert
                v-else-if="selectedLWFState"
                type="info"
                variant="tonal"
                class="mt-4"
              >
                LWF information not available for {{ selectedLWFState }}.
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Note about real-time updates -->
      <v-alert type="info" variant="tonal" border="start" class="mt-4">
        <template v-slot:prepend>
          <v-icon icon="mdi-information-outline" size="small"></v-icon>
        </template>
        <div class="text-subtitle-1 font-weight-medium">Note:</div>
        <div class="text-body-2">
          The professional tax information provided on this platform is based on
          the latest government regulations and state-specific laws. While every
          effort is made to ensure accuracy, these rates and rules are subject
          to change without prior notice.
        </div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "ProfessionalTaxLWF",
  data() {
    return {
      selectedPTState: null,
      selectedLWFState: null,
      states: [
        "Andhra Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Gujarat",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Puducherry",
        "Punjab",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
      ],
      ptValues: [],
      lwfValue: null,
      ptData: {
        "Andhra Pradesh": [
          { range: "Up to ₹15,000", tax: "NIL" },
          { range: "₹15,001 to ₹20,000", tax: "₹150" },
          { range: "Above ₹20,000", tax: "₹200" },
        ],
        Assam: [
          { range: "Up to ₹10,000", tax: "NIL" },
          { range: "₹10,001 to ₹15,000", tax: "₹150" },
          { range: "₹15,001 to ₹25,000", tax: "₹180" },
          { range: "Above ₹25,000", tax: "₹208" },
        ],
        Bihar: [
          { range: "Up to ₹3,00,000", tax: "NIL" },
          { range: "₹3,00,001 to ₹5,00,000", tax: "₹1,000" },
          { range: "₹5,00,001 to ₹10,00,000", tax: "₹2,000" },
          { range: "Above ₹10,00,000", tax: "₹2,500" },
        ],
        Chhattisgarh: [
          { range: "Up to ₹40,000", tax: "NIL" },
          { range: "₹40,001 to ₹50,000", tax: "₹360" },
          { range: "₹50,001 to ₹60,000", tax: "₹720" },
          { range: "₹60,001 to ₹80,000", tax: "₹1,080" },
          { range: "₹80,001 to ₹1,00,000", tax: "₹1,200" },
          { range: "₹1,00,001 to ₹1,50,000", tax: "₹1,440" },
          { range: "₹1,50,001 to ₹2,00,000", tax: "₹1,800" },
          { range: "₹2,00,001 to ₹2,50,000", tax: "₹2,160" },
          { range: "₹2,50,001 to ₹3,00,000", tax: "₹2,280" },
          { range: "Above ₹3,00,000", tax: "₹2,400" },
        ],
        Gujarat: [
          { range: "Up to ₹12,000", tax: "NIL" },
          { range: "Above ₹12,000", tax: "₹200" },
        ],
        Jharkhand: [
          { range: "Up to ₹3,00,000", tax: "NIL" },
          { range: "₹3,00,001 to ₹5,00,000", tax: "₹1,200" },
          { range: "₹5,00,001 to ₹8,00,000", tax: "₹1,800" },
          { range: "₹8,00,001 to ₹10,00,000", tax: "₹2,100" },
          { range: "Above ₹10,00,000", tax: "₹2,500" },
        ],
        Karnataka: [
          { range: "Up to ₹24,999", tax: "NIL" },
          { range: "₹25,000 and above", tax: "₹200" },
        ],
        Kerala: [
          { range: "Up to ₹11,999", tax: "NIL" },
          { range: "₹12,000 to ₹17,999", tax: "₹120" },
          { range: "₹18,000 to ₹29,999", tax: "₹180" },
          { range: "₹30,000 to ₹44,999", tax: "₹300" },
          { range: "₹45,000 to ₹59,999", tax: "₹450" },
          { range: "₹60,000 to ₹74,999", tax: "₹600" },
          { range: "₹75,000 to ₹99,999", tax: "₹750" },
          { range: "₹1,00,000 to ₹1,24,999", tax: "₹1,000" },
          { range: "₹1,25,000 and above", tax: "₹1,250" },
        ],
        "Madhya Pradesh": [
          { range: "Up to ₹2,25,000", tax: "NIL" },
          { range: "₹2,25,001 to ₹3,00,000", tax: "₹125 per month" },
          {
            range: "₹3,00,001 to ₹4,00,000",
            tax: "₹166 per month for first 11 months and ₹174 for the last 12th month",
          },
          {
            range: "Above ₹4,00,001",
            tax: "₹208 per month for first 11 months and ₹212 for the last 12th month",
          },
        ],
        Maharashtra: [
          { range: "Male: Up to ₹7,500", tax: "NIL" },
          { range: "Male: ₹7,501 to ₹10,000", tax: "₹175" },
          { range: "Male: Above ₹10,000", tax: "₹200 (₹300 in February)" },
          { range: "Female: Up to ₹25,000", tax: "NIL" },
          { range: "Female: Above ₹25,000", tax: "₹200 (₹300 in February)" },
        ],
        Manipur: [
          { range: "Up to ₹50,000", tax: "NIL" },
          { range: "₹50,001 to ₹75,000", tax: "₹1,200" },
          { range: "₹75,001 to ₹1,00,000", tax: "₹2,000" },
          { range: "₹1,00,001 to ₹1,25,000", tax: "₹2,400" },
          { range: "Above ₹1,25,001", tax: "₹2,500" },
        ],
        Meghalaya: [
          { range: "Up to ₹50,000", tax: "NIL" },
          { range: "₹50,001 to ₹75,000", tax: "₹200" },
          { range: "₹75,001 to ₹1,00,000", tax: "₹300" },
          { range: "₹1,00,001 to ₹1,50,000", tax: "₹500" },
          { range: "₹1,50,001 to ₹2,00,000", tax: "₹750" },
          { range: "₹2,00,001 to ₹2,50,000", tax: "₹1,000" },
          { range: "₹2,50,001 to ₹3,00,000", tax: "₹1,250" },
          { range: "₹3,00,001 to ₹3,50,000", tax: "₹1,500" },
          { range: "₹3,50,001 to ₹4,00,000", tax: "₹1,800" },
          { range: "₹4,00,001 to ₹4,50,000", tax: "₹2,100" },
          { range: "₹4,50,001 to ₹5,00,000", tax: "₹2,400" },
          { range: "Above ₹5,00,000", tax: "₹2,500" },
        ],
        Mizoram: [
          { range: "Up to ₹5,000", tax: "NIL" },
          { range: "₹5,001 to ₹8,000", tax: "₹75" },
          { range: "₹8,001 to ₹10,000", tax: "₹120" },
          { range: "₹10,001 to ₹12,000", tax: "₹150" },
          { range: "₹12,001 to ₹15,000", tax: "₹180" },
          { range: "Above ₹15,000", tax: "₹208" },
        ],
        Nagaland: [
          { range: "Up to ₹4,000", tax: "NIL" },
          { range: "₹4,001 to ₹5,000", tax: "₹35" },
          { range: "₹5,001 to ₹7,000", tax: "₹75" },
          { range: "₹7,001 to ₹9,000", tax: "₹110" },
          { range: "₹9,001 to ₹12,000", tax: "₹180" },
          { range: "Above ₹12,000", tax: "₹208" },
        ],
        Odisha: [
          { range: "Up to ₹1,59,999", tax: "NIL" },
          { range: "₹1,60,000 to ₹3,00,000", tax: "₹125 per month" },
          {
            range: "Above ₹3,00,000",
            tax: "₹200 per month for the first 11 months; and ₹300 for the last month",
          },
        ],
        Puducherry: [
          { range: "Up to ₹99,999", tax: "NIL" },
          { range: "₹1,00,000 to ₹2,00,000", tax: "₹250" },
          { range: "₹2,00,001 to ₹3,00,000", tax: "₹500" },
          { range: "₹3,00,001 to ₹4,00,000", tax: "₹750" },
          { range: "₹4,00,001 to ₹5,00,000", tax: "₹1,000" },
          { range: "Above ₹5,00,001", tax: "₹1,250" },
        ],
        Punjab: [
          {
            range: "Persons having income from salary (Above ₹2,50,000)",
            tax: "₹200 per month",
          },
          {
            range: "Persons having income from business and profession",
            tax: "₹2,400 per annum",
          },
        ],
        Sikkim: [
          { range: "Up to ₹20,000", tax: "NIL" },
          { range: "₹20,001 to ₹30,000", tax: "₹125" },
          { range: "₹30,001 to ₹40,000", tax: "₹150" },
          { range: "Above ₹40,000", tax: "₹200" },
        ],
        "Tamil Nadu": [
          { range: "Up to ₹21,000", tax: "NIL" },
          { range: "₹21,001 to ₹30,000", tax: "₹100" },
          { range: "₹30,001 to ₹45,000", tax: "₹235" },
          { range: "₹45,001 to ₹60,000", tax: "₹510" },
          { range: "₹60,001 to ₹75,000", tax: "₹760" },
          { range: "Above ₹75,000", tax: "₹1,095" },
        ],
        Telangana: [
          { range: "Up to ₹15,000", tax: "NIL" },
          { range: "₹15,001 to ₹20,000", tax: "₹150" },
          { range: "Above ₹20,000", tax: "₹200" },
        ],
      },
      lwfData: {
        Maharashtra: 24,
        Karnataka: 20,
        "Tamil Nadu": 20,
        Gujarat: 15,
        "West Bengal": 30,
        Kerala: 20,
        "Andhra Pradesh": 20,
        Telangana: 20,
        "Madhya Pradesh": 30,
        Odisha: 10,
        Chhattisgarh: 15,
        Assam: 15,
      },
    };
  },
  methods: {
    updatePTValues() {
      if (this.selectedPTState && this.ptData[this.selectedPTState]) {
        this.ptValues = this.ptData[this.selectedPTState];
      } else {
        this.ptValues = [];
      }
    },
    updateLWFValues() {
      if (this.selectedLWFState && this.lwfData[this.selectedLWFState]) {
        this.lwfValue = this.lwfData[this.selectedLWFState];
      } else {
        this.lwfValue = null;
      }
    },
  },
};
</script>

<style scoped>


:deep(.v-list-item) {
  min-height: 40px;
}

:deep(.v-list-item__title) {
  font-weight: 500;
}

:deep(.v-card-title) {
  font-size: 1.25rem;
}

:deep(.v-btn) {
  text-transform: none;
}
</style>
