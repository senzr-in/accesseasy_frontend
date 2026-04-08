<template>
  <v-app>
    <v-container fluid class="pa-0">
      <!-- Navigation Tabs -->
      <v-card flat>
        <v-tabs v-model="activeTab" background-color="white" class="border-b">
          <v-tab value="tds-summary" class="text-none">
            <v-icon start>mdi-calculator</v-icon>
            TDS Summary
          </v-tab>
          <v-tab value="declare" class="text-none">
            <v-icon start>mdi-plus</v-icon>
            Declare
          </v-tab>
          <v-tab value="review" class="text-none">
            <v-icon start>mdi-check-circle-outline</v-icon>
            Review
          </v-tab>
          <v-tab value="tax-regime" class="text-none">
            <v-icon start>mdi-file-document-outline</v-icon>
            Tax Regime
          </v-tab>
        </v-tabs>
      </v-card>

      <!-- Main Content -->
      <v-container>
        <div class="d-flex align-center mb-6">
          <v-icon size="28" class="mr-2">mdi-calculator-variant</v-icon>
          <h1 class="text-h5 font-weight-bold">TDS Calculations Summary</h1>
        </div>

        <!-- Annual Salary Input -->
        <div class="d-flex align-center mb-6">
          <div class="text-subtitle-1 mr-4">Annual Salary:</div>
          <v-text-field
            v-model="annualSalary"
            variant="outlined"
            density="compact"
            hide-details
            class="max-width-200"
            @input="calculateTax"
          ></v-text-field>
        </div>

        <!-- Tax Regime Comparison -->
        <v-row>
          <!-- New Regime -->
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="h-100">
              <v-card-title class="text-success font-weight-bold">
                New Regime
              </v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item>
                    <template v-slot:prepend>
                      <div class="text-body-1">Annual Earnings</div>
                    </template>
                    <template v-slot:append>
                      <div class="text-body-1 font-weight-medium">
                        ₹{{ formatCurrency(newRegime.annualEarnings) }}
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <div class="text-body-1">Annual Deductions</div>
                    </template>
                    <template v-slot:append>
                      <div class="text-body-1 font-weight-medium">
                        ₹{{ formatCurrency(newRegime.annualDeductions) }}
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <div class="text-body-1">Standard Deduction</div>
                    </template>
                    <template v-slot:append>
                      <div class="text-body-1 font-weight-medium">
                        ₹{{ formatCurrency(newRegime.standardDeduction) }}
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <div class="text-body-1">Exemption</div>
                    </template>
                    <template v-slot:append>
                      <div class="text-body-1 font-weight-medium">
                        ₹{{ formatCurrency(newRegime.exemption) }}
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider></v-divider>

                  <v-list-item class="bg-grey-lighten-4">
                    <template v-slot:prepend>
                      <div class="text-body-1 font-weight-bold">
                        Taxable Income
                      </div>
                    </template>
                    <template v-slot:append>
                      <div class="text-body-1 font-weight-bold">
                        ₹{{ formatCurrency(newRegime.taxableIncome) }}
                      </div>
                    </template>
                  </v-list-item>

                  <v-list-item
                    class="bg-red-lighten-5 clickable-item"
                    @click="showTaxBreakdown('new')"
                    style="cursor: pointer"
                  >
                    <template v-slot:prepend>
                      <div
                        class="text-body-1 font-weight-bold d-flex align-center"
                      >
                        Tax Liability
                        <v-icon size="16" class="ml-2 text-grey"
                          >mdi-information-outline</v-icon
                        >
                      </div>
                    </template>
                    <template v-slot:append>
                      <div
                        class="text-body-1 font-weight-bold text-red d-flex align-center"
                      >
                        ₹{{ formatCurrency(newRegime.taxLiability) }}
                        <v-icon size="16" class="ml-2"
                          >mdi-chevron-right</v-icon
                        >
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <div class="text-body-1">
                        Less: Rebate Under Section 87A(a)
                      </div>
                    </template>
                    <template v-slot:append>
                      <div class="text-body-1 font-weight-medium">
                        ₹{{ formatCurrency(newRegime.rebate) }}
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <div class="text-body-1">
                        Health and Education Cess (4% of Tax on taxable Income +
                        Surcharge)
                      </div>
                    </template>
                    <template v-slot:append>
                      <div class="text-body-1 font-weight-medium">
                        ₹{{ formatCurrency(newRegime.cess) }}
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Old Regime -->
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="h-100">
              <v-card-title class="text-primary font-weight-bold">
                Old Regime
              </v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item>
                    <template v-slot:prepend>
                      <div class="text-body-1">Annual Earnings</div>
                    </template>
                    <template v-slot:append>
                      <div class="text-body-1 font-weight-medium">
                        ₹{{ formatCurrency(oldRegime.annualEarnings) }}
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <div class="text-body-1">Annual Deductions</div>
                    </template>
                    <template v-slot:append>
                      <div class="text-body-1 font-weight-medium">
                        ₹{{ formatCurrency(oldRegime.annualDeductions) }}
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <div class="text-body-1">Standard Deduction</div>
                    </template>
                    <template v-slot:append>
                      <div class="text-body-1 font-weight-medium">
                        ₹{{ formatCurrency(oldRegime.standardDeduction) }}
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <div class="text-body-1">Exemption</div>
                    </template>
                    <template v-slot:append>
                      <div class="text-body-1 font-weight-medium">
                        ₹{{ formatCurrency(oldRegime.exemption) }}
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider></v-divider>

                  <v-list-item class="bg-grey-lighten-4">
                    <template v-slot:prepend>
                      <div class="text-body-1 font-weight-bold">
                        Taxable Income
                      </div>
                    </template>
                    <template v-slot:append>
                      <div class="text-body-1 font-weight-bold">
                        ₹{{ formatCurrency(oldRegime.taxableIncome) }}
                      </div>
                    </template>
                  </v-list-item>

                  <v-list-item
                    class="bg-red-lighten-5 clickable-item"
                    @click="showTaxBreakdown('old')"
                    style="cursor: pointer"
                  >
                    <template v-slot:prepend>
                      <div
                        class="text-body-1 font-weight-bold d-flex align-center"
                      >
                        Tax Liability
                        <v-icon size="16" class="ml-2 text-grey"
                          >mdi-information-outline</v-icon
                        >
                      </div>
                    </template>
                    <template v-slot:append>
                      <div
                        class="text-body-1 font-weight-bold text-red d-flex align-center"
                      >
                        ₹{{ formatCurrency(oldRegime.taxLiability) }}
                        <v-icon size="16" class="ml-2"
                          >mdi-chevron-right</v-icon
                        >
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <div class="text-body-1">
                        Less: Rebate Under Section 87A(a)
                      </div>
                    </template>
                    <template v-slot:append>
                      <div class="text-body-1 font-weight-medium">
                        ₹{{ formatCurrency(oldRegime.rebate) }}
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <div class="text-body-1">
                        Health and Education Cess (4% of Tax on taxable Income +
                        Surcharge)
                      </div>
                    </template>
                    <template v-slot:append>
                      <div class="text-body-1 font-weight-medium">
                        ₹{{ formatCurrency(oldRegime.cess) }}
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Tax Breakdown Dialog -->
        <v-dialog v-model="showBreakdownDialog" max-width="600px">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-calculator-variant</v-icon>
              Tax Liability Breakdown -
              {{ selectedRegime === "new" ? "New Regime" : "Old Regime" }}
            </v-card-title>

            <v-card-text>
              <v-alert type="info" variant="tonal" class="mb-4">
                <div class="text-subtitle-2">
                  Total Taxable Income: ₹{{
                    formatCurrency(
                      selectedRegime === "new"
                        ? newRegime.taxableIncome
                        : oldRegime.taxableIncome,
                    )
                  }}
                </div>
                <div class="text-subtitle-2">
                  Total Tax Liability: ₹{{
                    formatCurrency(
                      selectedRegime === "new"
                        ? newRegime.taxLiability
                        : oldRegime.taxLiability,
                    )
                  }}
                </div>
              </v-alert>

              <v-table>
                <thead>
                  <tr>
                    <th class="text-left">Tax Slab</th>
                    <th class="text-left">Rate</th>
                    <th class="text-left">Taxable Amount</th>
                    <th class="text-left">Tax Amount</th>
                    <th class="text-left">% of Total Tax</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in breakdownData" :key="index">
                    <td class="text-body-2">{{ item.slab }}</td>
                    <td class="text-body-2">{{ item.rate }}%</td>
                    <td class="text-body-2">
                      ₹{{ formatCurrency(item.taxableAmount) }}
                    </td>
                    <td class="text-body-2 font-weight-medium">
                      ₹{{ formatCurrency(item.taxAmount) }}
                    </td>
                    <td class="text-body-2">
                      <v-chip
                        :color="
                          item.percentage > 50
                            ? 'red'
                            : item.percentage > 25
                              ? 'orange'
                              : 'green'
                        "
                        variant="tonal"
                        size="small"
                      >
                        {{ item.percentage.toFixed(1) }}%
                      </v-chip>
                    </td>
                  </tr>
                </tbody>
              </v-table>

              <v-divider class="my-4"></v-divider>

              <div class="text-caption text-grey">
                * Surcharge and cess are calculated separately and added to the
                base tax amount.
              </div>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="showBreakdownDialog = false"
                >Close</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: "TdsCalculator",
  data() {
    return {
      activeTab: "tds-summary",
      annualSalary: "9844888",
      showBreakdownDialog: false,
      selectedRegime: "",
      breakdownData: [],
      newRegime: {
        annualEarnings: 9844888,
        annualDeductions: 0,
        standardDeduction: 75000,
        exemption: 0,
        taxableIncome: 9769888,
        taxLiability: 2620966.4,
        rebate: 0,
        cess: 104838.66,
      },
      oldRegime: {
        annualEarnings: 9844888,
        annualDeductions: 250000,
        standardDeduction: 50000,
        exemption: 0,
        taxableIncome: 9544888,
        taxLiability: 2675966.4,
        rebate: 0,
        cess: 107038.66,
      },
    };
  },
  mounted() {
    this.calculateTax();
  },
  methods: {
    formatCurrency(value) {
      // Format number to Indian currency format (with commas)
      const num = parseFloat(value);
      if (isNaN(num)) return "0.00";

      const parts = num.toFixed(2).toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      // Convert to Indian number format (e.g., 1,00,000 instead of 100,000)
      const integerPart = parts[0];
      let formattedInteger = "";

      if (integerPart.length > 3) {
        formattedInteger =
          integerPart.substring(0, integerPart.length - 3) +
          "," +
          integerPart.substring(integerPart.length - 3);

        // Add commas every 2 digits for the remaining part
        let remainingPart = formattedInteger.split(",")[0];
        if (remainingPart.length > 2) {
          let tempPart = "";
          for (let i = remainingPart.length - 1; i >= 0; i--) {
            tempPart = remainingPart[i] + tempPart;
            if ((remainingPart.length - i) % 2 === 0 && i !== 0) {
              tempPart = "," + tempPart;
            }
          }
          formattedInteger = tempPart + "," + formattedInteger.split(",")[1];
        }
      } else {
        formattedInteger = integerPart;
      }

      return formattedInteger + "." + parts[1];
    },
    calculateTax() {
      // Parse the annual salary
      const salary = parseFloat(this.annualSalary.replace(/,/g, "")) || 0;

      // Update annual earnings for both regimes
      this.newRegime.annualEarnings = salary;
      this.oldRegime.annualEarnings = salary;

      // Calculate taxable income for new regime
      this.newRegime.taxableIncome = Math.max(
        0,
        this.newRegime.annualEarnings -
          this.newRegime.annualDeductions -
          this.newRegime.standardDeduction -
          this.newRegime.exemption,
      );

      // Calculate taxable income for old regime
      this.oldRegime.taxableIncome = Math.max(
        0,
        this.oldRegime.annualEarnings -
          this.oldRegime.annualDeductions -
          this.oldRegime.standardDeduction -
          this.oldRegime.exemption,
      );

      // Calculate tax liability for new regime (simplified calculation)
      this.newRegime.taxLiability = this.calculateNewRegimeTax(
        this.newRegime.taxableIncome,
      );

      // Calculate tax liability for old regime (simplified calculation)
      this.oldRegime.taxLiability = this.calculateOldRegimeTax(
        this.oldRegime.taxableIncome,
      );

      // Calculate cess (4% of tax liability)
      this.newRegime.cess = this.newRegime.taxLiability * 0.04;
      this.oldRegime.cess = this.oldRegime.taxLiability * 0.04;
    },
    calculateNewRegimeTax(income) {
      // Simplified tax calculation for new regime
      let tax = 0;

      if (income <= 300000) {
        tax = 0;
      } else if (income <= 600000) {
        tax = (income - 300000) * 0.05;
      } else if (income <= 900000) {
        tax = 15000 + (income - 600000) * 0.1;
      } else if (income <= 1200000) {
        tax = 45000 + (income - 900000) * 0.15;
      } else if (income <= 1500000) {
        tax = 90000 + (income - 1200000) * 0.2;
      } else {
        tax = 150000 + (income - 1500000) * 0.3;
      }

      // Apply surcharge for high income
      if (income > 5000000 && income <= 10000000) {
        tax = tax * 1.1; // 10% surcharge
      } else if (income > 10000000 && income <= 20000000) {
        tax = tax * 1.15; // 15% surcharge
      } else if (income > 20000000 && income <= 50000000) {
        tax = tax * 1.25; // 25% surcharge
      } else if (income > 50000000) {
        tax = tax * 1.37; // 37% surcharge
      }

      return tax;
    },
    calculateOldRegimeTax(income) {
      // Simplified tax calculation for old regime
      let tax = 0;

      if (income <= 250000) {
        tax = 0;
      } else if (income <= 500000) {
        tax = (income - 250000) * 0.05;
      } else if (income <= 1000000) {
        tax = 12500 + (income - 500000) * 0.2;
      } else {
        tax = 112500 + (income - 1000000) * 0.3;
      }

      // Apply surcharge for high income
      if (income > 5000000 && income <= 10000000) {
        tax = tax * 1.1; // 10% surcharge
      } else if (income > 10000000 && income <= 20000000) {
        tax = tax * 1.15; // 15% surcharge
      } else if (income > 20000000 && income <= 50000000) {
        tax = tax * 1.25; // 25% surcharge
      } else if (income > 50000000) {
        tax = tax * 1.37; // 37% surcharge
      }

      return tax;
    },
    showTaxBreakdown(regime) {
      this.selectedRegime = regime;
      this.breakdownData = this.calculateTaxBreakdown(regime);
      this.showBreakdownDialog = true;
    },

    calculateTaxBreakdown(regime) {
      const income =
        regime === "new"
          ? this.newRegime.taxableIncome
          : this.oldRegime.taxableIncome;
      const totalTax =
        regime === "new"
          ? this.newRegime.taxLiability
          : this.oldRegime.taxLiability;
      const breakdown = [];

      if (regime === "new") {
        // New regime tax slabs
        const slabs = [
          { min: 0, max: 300000, rate: 0 },
          { min: 300000, max: 600000, rate: 5 },
          { min: 600000, max: 900000, rate: 10 },
          { min: 900000, max: 1200000, rate: 15 },
          { min: 1200000, max: 1500000, rate: 20 },
          { min: 1500000, max: Infinity, rate: 30 },
        ];

        slabs.forEach((slab) => {
          if (income > slab.min) {
            const taxableInSlab = Math.min(income, slab.max) - slab.min;
            const taxInSlab = taxableInSlab * (slab.rate / 100);

            if (taxableInSlab > 0) {
              breakdown.push({
                slab:
                  slab.max === Infinity
                    ? `₹${this.formatCurrency(slab.min)} and above`
                    : `₹${this.formatCurrency(slab.min)} - ₹${this.formatCurrency(slab.max)}`,
                rate: slab.rate,
                taxableAmount: taxableInSlab,
                taxAmount: taxInSlab,
                percentage: totalTax > 0 ? (taxInSlab / totalTax) * 100 : 0,
              });
            }
          }
        });
      } else {
        // Old regime tax slabs
        const slabs = [
          { min: 0, max: 250000, rate: 0 },
          { min: 250000, max: 500000, rate: 5 },
          { min: 500000, max: 1000000, rate: 20 },
          { min: 1000000, max: Infinity, rate: 30 },
        ];

        slabs.forEach((slab) => {
          if (income > slab.min) {
            const taxableInSlab = Math.min(income, slab.max) - slab.min;
            const taxInSlab = taxableInSlab * (slab.rate / 100);

            if (taxableInSlab > 0) {
              breakdown.push({
                slab:
                  slab.max === Infinity
                    ? `₹${this.formatCurrency(slab.min)} and above`
                    : `₹${this.formatCurrency(slab.min)} - ₹${this.formatCurrency(slab.max)}`,
                rate: slab.rate,
                taxableAmount: taxableInSlab,
                taxAmount: taxInSlab,
                percentage: totalTax > 0 ? (taxInSlab / totalTax) * 100 : 0,
              });
            }
          }
        });
      }

      // Add surcharge if applicable
      if (income > 5000000) {
        const baseTax = breakdown.reduce(
          (sum, item) => sum + item.taxAmount,
          0,
        );
        let surchargeRate = 0;

        if (income > 5000000 && income <= 10000000) {
          surchargeRate = 10;
        } else if (income > 10000000 && income <= 20000000) {
          surchargeRate = 15;
        } else if (income > 20000000 && income <= 50000000) {
          surchargeRate = 25;
        } else if (income > 50000000) {
          surchargeRate = 37;
        }

        if (surchargeRate > 0) {
          const surchargeAmount = baseTax * (surchargeRate / 100);
          breakdown.push({
            slab: "Surcharge",
            rate: surchargeRate,
            taxableAmount: baseTax,
            taxAmount: surchargeAmount,
            percentage: totalTax > 0 ? (surchargeAmount / totalTax) * 100 : 0,
          });
        }
      }

      return breakdown;
    },
  },
};
</script>

<style scoped>
.max-width-200 {
  max-width: 200px;
}

.border-b {
  border-bottom: 1px solid #e0e0e0;
}

/* Override Vuetify styles to match the design */
:deep(.v-list-item) {
  min-height: 48px !important;
  padding: 8px 16px !important;
}

:deep(.v-card-title) {
  padding: 16px !important;
}

:deep(.v-list-item__prepend) {
  padding-right: 16px !important;
}

:deep(.v-list-item__append) {
  padding-left: 16px !important;
}

.clickable-item {
  transition: background-color 0.2s ease;
}

.clickable-item:hover {
  background-color: rgba(255, 0, 0, 0.1) !important;
  transform: translateX(2px);
  transition: all 0.2s ease;
}

.clickable-item:hover .v-icon {
  color: #d32f2f !important;
}
</style>
