// TDSForm.vue
<template>
  <v-container class="pa-4">
    <v-card class="mb-4" variant="outlined">
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-icon size="small" class="me-2">mdi-file-document</v-icon>
          <span class="text-h6 font-weight-medium">Past TDS in current financial year</span>
        </div>
        <p class="text-body-1 text-medium-emphasis">
          To correctly calculate TDS liability, please enter details of any amount that has been paid to the
          staff by you or previous employer from outside of Salarybox App in the current financial year.
        </p>
      </v-card-text>
    </v-card>

    <div class="mb-6">
      <p class="text-subtitle-1 font-weight-medium mb-2">Taxable Salary</p>
      <v-text-field
        v-model="taxableSalary"
        density="comfortable"
        variant="outlined"
        hide-details
        prefix="₹"
        type="number"
      ></v-text-field>
    </div>

    <div>
      <p class="text-subtitle-1 font-weight-medium mb-2">TDS deducted/paid</p>
      <v-text-field
        v-model="tdsDeducted"
        density="comfortable"
        variant="outlined"
        hide-details
        prefix="₹"
        type="number"
      ></v-text-field>
    </div>
  </v-container>
</template>

<script>
export default {
  name: 'TDSForm',
  data() {
    return {
      taxableSalary: '25,000',
      tdsDeducted: '15,000'
    }
  }
}
</script>

<style scoped>
.v-card {
  border-color: #e0e0e0;
}
</style>