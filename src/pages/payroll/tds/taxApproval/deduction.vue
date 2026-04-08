<template>
  <div class="deductions-container">
     <v-toolbar density="compact" color="grey-lighten-4">
      <v-btn icon color="black" @click="handleClose">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="ml-4">Add TDSDetails</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="error" variant="text" class="mr-2" @click="handleClose">
        CANCEL
      </v-btn>
      
    </v-toolbar>
    <div class="section">
      <h3 class="subsection-title">Investments under Section 80C</h3>

      <div class="grid-wrapper">
        <!-- Left: Bullet Points -->
        <ul class="requirements-list">
          <li>
            Maximum Investment of ₹1,50,000 in Life Insurance, Provident Fund,
            Subscription to certain equity shares, Tuition Fees, National
            Savings Certificate, Housing Loan Principal , LIC , Pension Scheme
            of Central Govt etc.
          </li>
        </ul>
        <div class="amounts-table-grid">
          <div class="grid-item label">Declared Amount</div>
          <div class="grid-item value">₹ {{declared80C}}</div>

          <div class="grid-item label">Approved Amount</div>
          <div class="grid-item value">₹ {{approved80C}}</div>
        </div>
      </div>
      <v-data-table
        :headers="headersInvestment"
        :items="deductionEntries"
        class="elevation-1 mb-6"
        hide-default-footer
      >
        <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending'">
              <v-btn small color="green" @click="acceptItem(item, '80C')">Accept</v-btn>
<v-btn small color="red" @click="rejectItem(item, '80C')">Reject</v-btn>
 </div>
            <div v-else>
              {{ item.status }}
            </div>
          </td>
        </template>
      </v-data-table>

      <!-- Buttons -->
      <div class="action-buttons">
       
        <button class="add-investment-btn" @click="cDeductionOpen">
          Add Investment80C <span class="info-icon">ⓘ</span>
        </button>
      </div>
    </div>

    <!-- Section 80EEA Investments -->
    <div class="section">
      <h3 class="subsection-title">Investments under Section 80CCD(1B)</h3>

      <div class="grid-wrapper">
        <!-- Left: Bullet Points -->
        <ul class="requirements-list">
          <li>
            Deduction towards payments made to Pension Scheme of Central
            Government, excluding deduction claimed under 80CCD (1). Maximum
            Limit is ₹50,000.
          </li>
        </ul>
        <div class="amounts-table-grid">
          <div class="grid-item label">Declared Amount</div>
          <div class="grid-item value">₹ {{ declared80CCD }}</div>
          <div class="grid-item label">Approved Amount</div>
          <div class="grid-item value">₹ {{approved80CCD}}</div>
        </div>
      </div>
      <v-data-table
        :headers="headersInvestment.value"
        :items="deduction80CCD"
        class="elevation-1 mb-6"
        hide-default-footer
      >
      <template v-slot:item.status="{ item }">
  <td>
    <div v-if="item.status === 'pending'">
      <v-btn small color="green" class="mr-2" @click="acceptItem(item, '80CCD')">Accept</v-btn>
      <v-btn small color="red" @click="rejectItem(item, '80CCD')">Reject</v-btn>
    </div>
    <div v-else>
      {{ item.status }}
    </div>
  </td>
</template>

      </v-data-table>

      <!-- Buttons -->
      <div class="action-buttons">
        
        <button class="add-investment-btn" @click="ccdDeductionOpen">
          Add Investment <span class="info-icon">ⓘ</span>
        </button>
      </div>
    </div>
    <!-- 3 -->
    <div class="section">
      <h3 class="subsection-title">Investments under Section 80D</h3>

      <div class="grid-wrapper">
        <!-- Left: Bullet Points -->
        <ul class="requirements-list">
          <li>
            Deduction towards payments made to Health Insurance Premium &
            Preventive Health check up.
          </li>
        </ul>
        <div class="amounts-table-grid">
          <div class="grid-item label">Declared Amount</div>
          <div class="grid-item value">₹ {{declared80D}}</div>
          <div class="grid-item label">Approved Amount</div>
          <div class="grid-item value">₹ {{approved80D}}</div>
        </div>
      </div>
      <v-data-table
        :headers="headersInvestment.value"
        :items="deduction80D"
        class="elevation-1 mb-6"
        hide-default-footer
      >
        <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending'">
              <v-btn small color="green" @click="acceptItem(item, '80D')">Accept</v-btn>
<v-btn small color="red" @click="rejectItem(item, '80D')">Reject</v-btn>
</div>
            <div v-else>
              {{ item.status }}
            </div>
          </td>
        </template>
      </v-data-table>

      <!-- Buttons -->
      <div class="action-buttons">
        
        <button class="add-investment-btn" @click="dDeductionOpen">
          Add Investment <span class="info-icon">ⓘ</span>
        </button>
      </div>
    </div>
    <!-- 4 -->
    <div class="section">
      <h3 class="subsection-title">Investments under Section 80DD</h3>

      <div class="grid-wrapper">
        <!-- Left: Bullet Points -->
        <ul class="requirements-list">
          <li>
            Deduction towards payments made towards Maintenance or Medical
            treatment of a Disabled Dependent or Paid / Deposited any amount
            under relevant approved scheme.
          </li>
        </ul>
        <div class="amounts-table-grid">
          <div class="grid-item label">Declared Amount</div>
          <div class="grid-item value">₹ {{declared80DD}}</div>
          <div class="grid-item label">Approved Amount</div>
          <div class="grid-item value">₹ {{approved80DD}}</div>
        </div>
      </div>
      <v-data-table
        :headers="headersInvestment.value"
        :items="deduction80DD"
        class="elevation-1 mb-6"
        hide-default-footer
      >
        <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending'">
              <v-btn small color="green" @click="acceptItem(item, '80DD')">Accept</v-btn>
<v-btn small color="red" @click="rejectItem(item, '80DD')">Reject</v-btn>
 </div>
            <div v-else>
              {{ item.status }}
            </div>
          </td>
        </template>
      </v-data-table>

      <!-- Buttons -->
      <div class="action-buttons">
       
        <button class="add-investment-btn" @click="ddDeductionOpen">
          Add Investment <span class="info-icon">ⓘ</span>
        </button>
      </div>
    </div>
    <!-- 5 -->
    <div class="section">
      <h3 class="subsection-title">Investments under Section 80E</h3>

      <div class="grid-wrapper">
        <!-- Left: Bullet Points -->
        <ul class="requirements-list">
          <li>
            Deduction towards interest payments made on loan for higher
            education of Self or relative.
          </li>
        </ul>
        <div class="amounts-table-grid">
          <div class="grid-item label">Declared Amount</div>
          <div class="grid-item value">₹ 0</div>
          <div class="grid-item label">Approved Amount</div>
          <div class="grid-item value">₹ 0</div>
        </div>
      </div>
      <v-data-table
        :headers="headersInvestment.value"
        :items="  deduction80E"
        class="elevation-1 mb-6"
        hide-default-footer
      >
        <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending'">
              <v-btn small color="green" @click="acceptItem(item, '80E')">Accept</v-btn>
<v-btn small color="red" @click="rejectItem(item, '80E')">Reject</v-btn>
 </div>
            <div v-else>
              {{ item.status }}
            </div>
          </td>
        </template>
      </v-data-table>

      <!-- Buttons -->
      <div class="action-buttons">
       
        <button class="add-investment-btn" @click="eDeductionOpen">
          Add Investment <span class="info-icon">ⓘ</span>
        </button>
      </div>
    </div>
    <!-- 6 -->
    <div class="section">
      <h3 class="subsection-title">Investments under Section 80EEB</h3>

      <div class="grid-wrapper">
        <!-- Left: Bullet Points -->
        <ul class="requirements-list">
          <li>
            Deduction towards interest payments made on loan for purchase of
            Electric Vehicle where the loan is sanctioned between 1st April 2019
            to 31st March 2023. Limit of ₹1,50,000
          </li>
        </ul>
        <div class="amounts-table-grid">
          <div class="grid-item label">Declared Amount</div>
          <div class="grid-item value">₹ 0</div>
          <div class="grid-item label">Approved Amount</div>
          <div class="grid-item value">₹ 0</div>
        </div>
      </div>
      <v-data-table
        :headers="headersInvestment.value"
        :items="deduction80EEB"
        class="elevation-1 mb-6"
        hide-default-footer
      >
        <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending'">
              <v-btn small color="green" @click="acceptItem(item, '80EEB')">Accept</v-btn>
<v-btn small color="red" @click="rejectItem(item, '80EEB')">Reject</v-btn>
 </div>
            <div v-else>
              {{ item.status }}
            </div>
          </td>
        </template>
      </v-data-table>

      <!-- Buttons -->
      <div class="action-buttons">
        
        <button class="add-investment-btn" @click="eebDeductionOpen">
          Add Investment <span class="info-icon">ⓘ</span>
        </button>
      </div>
    </div>
    <!-- 7 -->
    <div class="section">
      <h3 class="subsection-title">Investments under Section 80G</h3>

      <div class="grid-wrapper">
        <!-- Left: Bullet Points -->
        <ul class="requirements-list">
          <li>
            Deduction towards Donations made to prescribed Funds, Charitable
            Institutions, etc. Donation are eligible for deduction under the
            below categories.
          </li>
        </ul>
        <div class="amounts-table-grid">
          <div class="grid-item label">Declared Amount</div>
          <div class="grid-item value">₹ 0</div>
          <div class="grid-item label">Approved Amount</div>
          <div class="grid-item value">₹ 0</div>
        </div>
      </div>
      <v-data-table
        :headers="headersInvestment.value"
        :items="investmentEntries"
        class="elevation-1 mb-6"
        hide-default-footer
      >
        <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending'">
              <v-btn small color="green" @click="acceptItem(item, '80G')">Accept</v-btn>
<v-btn small color="red" @click="rejectItem(item, '80G')">Reject</v-btn>
 </div>
            <div v-else>
              {{ item.status }}
            </div>
          </td>
        </template>
      </v-data-table>

      <!-- Buttons -->
      <div class="action-buttons">
      
        <button class="add-investment-btn" @click="gDeductionOpen">
          Add Investment <span class="info-icon">ⓘ</span>
        </button>
      </div>
    </div>
    <!-- 8 -->
    <div class="section">
      <h3 class="subsection-title">Investments under Section 80GG</h3>

      <div class="grid-wrapper">
        <!-- Left: Bullet Points -->
        <ul class="requirements-list">
          <li>
            Deduction towards rent paid for house & applicable to only those who
            are self-employed or for whom HRA is not part of Salary.
          </li>
        </ul>
        <div class="amounts-table-grid">
          <div class="grid-item label">Declared Amount</div>
          <div class="grid-item value">₹ 0</div>
          <div class="grid-item label">Approved Amount</div>
          <div class="grid-item value">₹ 0</div>
        </div>
      </div>
      <v-data-table
        :headers="headersInvestment.value"
        :items=" deduction80G"
        class="elevation-1 mb-6"
        hide-default-footer
      >
        <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending'">
              <v-btn small color="green" @click="acceptItem(item, '80GG')">Accept</v-btn>
<v-btn small color="red" @click="rejectItem(item, '80GG')">Reject</v-btn>
 </div>
            <div v-else>
              {{ item.status }}
            </div>
          </td>
        </template>
      </v-data-table>

      <!-- Buttons -->
      <div class="action-buttons">
        
        <button class="add-investment-btn" @click="ggDeductionOpen">
          Add Investment <span class="info-icon">ⓘ</span>
        </button>
      </div>
    </div>
    <!-- 9 -->
    <div class="section">
      <h3 class="subsection-title">Investments under Section 80GGA</h3>

      <div class="grid-wrapper">
        <!-- Left: Bullet Points -->
        <ul class="requirements-list">
          <li>
            Deduction towards Donations made for Scientific Research or Rural
            Development.
          </li>
        </ul>
        <div class="amounts-table-grid">
          <div class="grid-item label">Declared Amount</div>
          <div class="grid-item value">₹ 0</div>
          <div class="grid-item label">Approved Amount</div>
          <div class="grid-item value">₹ 0</div>
        </div>
      </div>
      <v-data-table
        :headers="headersInvestment.value"
        :items="investmentEntries"
        class="elevation-1 mb-6"
        hide-default-footer
      >
        <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending'">
              <v-btn small color="green" @click="acceptItem(item, '80GGA')">Accept</v-btn>
<v-btn small color="red" @click="rejectItem(item, '80GGA')">Reject</v-btn>
 </div>
            <div v-else>
              {{ item.status }}
            </div>
          </td>
        </template>
      </v-data-table>

      <!-- Buttons -->
      <div class="action-buttons">
       
        <button class="add-investment-btn" @click="ggaDeductionOpen">
          Add Investment <span class="info-icon">ⓘ</span>
        </button>
      </div>
    </div>
    <!-- 10 -->
    <div class="section">
      <h3 class="subsection-title">Investments under Section 80GGC</h3>

      <div class="grid-wrapper">
        <!-- Left: Bullet Points -->
        <ul class="requirements-list">
          <li>
            Deduction towards Donations made to Political Party or Electoral
            Trust.
          </li>
        </ul>
        <div class="amounts-table-grid">
          <div class="grid-item label">Declared Amount</div>
          <div class="grid-item value">₹ 0</div>
          <div class="grid-item label">Approved Amount</div>
          <div class="grid-item value">₹ 0</div>
        </div>
      </div>
      <v-data-table
        :headers="headersInvestment.value"
        :items="deduction80GGA"
        class="elevation-1 mb-6"
        hide-default-footer
      >
      <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending'">
              <v-btn small color="green" @click="acceptItem(item, '80GGC')">Accept</v-btn>
<v-btn small color="red" @click="rejectItem(item, '80GGC')">Reject</v-btn>
</div>
            <div v-else>
              {{ item.status }}
            </div>
          </td>
        </template>
      </v-data-table>

      <!-- Buttons -->
      <div class="action-buttons">
      
        <button class="add-investment-btn" @click="ggcDeductionOpen">
          Add Investment <span class="info-icon">ⓘ</span>
        </button>
      </div>
    </div>

    <!-- 12 -->
    <div class="section">
      <h3 class="subsection-title">Investments under Section 80DDB</h3>

      <div class="grid-wrapper">
        <!-- Left: Bullet Points -->
        <ul class="requirements-list">
          <li>
            NADeduction towards payments made towards Medical treatment of Self
            or Dependent for specified diseases. Deduction limit of ₹40,000.
          </li>
        </ul>
        <div class="amounts-table-grid">
          <div class="grid-item label">Declared Amount</div>
          <div class="grid-item value">₹ 0</div>
          <div class="grid-item label">Approved Amount</div>
          <div class="grid-item value">₹ 0</div>
        </div>
      </div>
      <v-data-table
        :headers="headersInvestment.value"
        :items="deduction80DDB"
        class="elevation-1 mb-6"
        hide-default-footer
      >
        <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending'">
              <v-btn small color="green" @click="acceptItem(item, '80DDB')">Accept</v-btn>
<v-btn small color="red" @click="rejectItem(item, '80DDB')">Reject</v-btn>
 </div>
            <div v-else>
              {{ item.status }}
            </div>
          </td>
        </template>
      </v-data-table>

      <!-- Buttons -->
      <div class="action-buttons">
        
        <button class="add-investment-btn" @click="ddbDeductionOpen">
          Add Investment <span class="info-icon">ⓘ</span>
        </button>
      </div>
    </div>
    <!-- 13 -->
    <div class="section">
      <h3 class="subsection-title">Investments under Section 80U</h3>

      <div class="grid-wrapper">
        <!-- Left: Bullet Points -->
        <ul class="requirements-list">
          <li>
            Deductions for a resident individual taxpayer with Disability.
          </li>
        </ul>
        <div class="amounts-table-grid">
          <div class="grid-item label">Declared Amount</div>
          <div class="grid-item value">₹ 0</div>
          <div class="grid-item label">Approved Amount</div>
          <div class="grid-item value">₹ 0</div>
        </div>
      </div>
      <v-data-table
        :headers="headersInvestment.value"
        :items="deduction80U"
        class="elevation-1 mb-6"
        hide-default-footer
      >
        <template v-slot:item.status="{ item }">
          <td>
            <div v-if="item.status === 'pending'">
              <v-btn small color="green" @click="acceptItem(item, '80U')">Accept</v-btn>
<v-btn small color="red" @click="rejectItem(item, '80U')">Reject</v-btn>
</div>
            <div v-else>
              {{ item.status }}
            </div>
          </td>
        </template>
      </v-data-table>

      <!-- Buttons -->
      <div class="action-buttons">
      
        <button class="add-investment-btn" @click="uDeductionOpen">
          Add Investment <span class="info-icon">ⓘ</span>
        </button>
      </div>

      <v-dialog v-model="showGDeduction" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New 80G Deduction Declaration</span>
            
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="gDeduction.amountPaid"
                    label="Amount Paid *"
                    prefix="₹"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Amount Paid is required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="gDeduction.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-file-input
                    v-model="gDeduction.document"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialogG"
              >Cancel</v-btn
            >
            <v-btn color="primary" @click="gDeductionSave">Add 80G</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showGgDeduction" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New 80GG Deduction Declaration</span>
            
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="ggDeduction.amountPaid"
                    label="Amount Paid *"
                    prefix="₹"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Amount Paid is required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="ggDeduction.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-file-input
                    v-model="ggDeduction.document"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialogGg"
              >Cancel</v-btn
            >
            <v-btn color="primary" @click="ggDeductionSave">Add 80GG</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showGgaDeduction" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New 80GGA Deduction Declaration</span>
            
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="ggaDeduction.amountPaid"
                    label="Amount Paid *"
                    prefix="₹"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Amount Paid is required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="ggaDeduction.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-file-input
                    v-model="ggaDeduction.document"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialogGga"
              >Cancel</v-btn
            >
            <v-btn color="primary" @click="ggaDeductionSave">Add 80GGA</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showGgcDeduction" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New 80GGC Deduction Declaration</span>

          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="ggcDeduction.amountPaid"
                    label="Amount Paid *"
                    prefix="₹"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Amount Paid is required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="ggcDeduction.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-file-input
                    v-model="ggcDeduction.document"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialogGgc"
              >Cancel</v-btn
            >
            <v-btn color="primary" @click="ggcDeductionSave">Add 80GGC</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showDdbDeduction" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New 80DDB Deduction Declaration</span>
           
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="ddbDeduction.amountPaid"
                    label="Amount Paid *"
                    prefix="₹"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Amount Paid is required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="ddbDeduction.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-file-input
                    v-model="ddbDeduction.document"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialogDdb"
              >Cancel</v-btn
            >
            <v-btn color="primary" @click="ddbDeductionSave">Add 80DDB</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showCDeduction" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New Home Loan Declaration</span>
          
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="cDeduction.amountPaid"
                    label="Amount Paid *"
                    prefix="₹"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Amount Paid is required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="cDeduction.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-file-input
                    v-model="cDeduction.document"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialogC"
              >Cancel</v-btn
            >
            <v-btn color="primary" @click="cDeductionSave">Add Home Loan</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showccdDeduction" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New Home Loan Declaration</span>
           
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="ccdDeduction.amountPaid"
                    label="Amount Paid *"
                    prefix="₹"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Amount Paid is required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="ccdDeduction.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-file-input
                    v-model="ccdDeduction.document"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialogccd"
              >Cancel</v-btn
            >
            <v-btn color="primary" @click="ccdDeductionSave"
              >Add Home Loan</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showdDeduction" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New Home Loan Declaration</span>
            <v-spacer></v-spacer>
            
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="dDeduction.amountPaid"
                    label="Amount Paid *"
                    prefix="₹"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Amount Paid is required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="dDeduction.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-file-input
                    v-model="dDeduction.document"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialogd"
              >Cancel</v-btn
            >
            <v-btn color="primary" @click="dDeductionSave">Add Home Loan</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showDdDeduction" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New 80DD Deduction Declaration</span>
          
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="ddDeduction.amountPaid"
                    label="Amount Paid *"
                    prefix="₹"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Amount Paid is required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="ddDeduction.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-file-input
                    v-model="ddDeduction.document"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialogDd"
              >Cancel</v-btn
            >
            <v-btn color="primary" @click="ddDeductionSave">Add 80DD</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showEDeduction" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New 80E Deduction Declaration</span>
           
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="eDeduction.amountPaid"
                    label="Amount Paid *"
                    prefix="₹"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Amount Paid is required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="eDeduction.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-file-input
                    v-model="eDeduction.document"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialogE"
              >Cancel</v-btn
            >
            <v-btn color="primary" @click="eDeductionSave">Add 80E</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showEebDeduction" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New 80EEB Deduction Declaration</span>
           
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="eebDeduction.amountPaid"
                    label="Amount Paid *"
                    prefix="₹"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Amount Paid is required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="eebDeduction.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-file-input
                    v-model="eebDeduction.document"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialogEeb"
              >Cancel</v-btn
            >
            <v-btn color="primary" @click="eebDeductionSave">Add 80EEB</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showUDeduction" max-width="700px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New 80U Deduction Declaration</span>
           
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="uDeduction.amountPaid"
                    label="Amount Paid *"
                    prefix="₹"
                    variant="outlined"
                    color="black"
                    :rules="[(v) => !!v || 'Amount Paid is required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="uDeduction.comments"
                    label="Comments"
                    variant="outlined"
                    color="black"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-file-input
                    v-model="uDeduction.document"
                    label="Upload Proof Document"
                    variant="outlined"
                    color="black"
                    show-size
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeDialogU"
              >Cancel</v-btn
            >
            <v-btn color="primary" @click="uDeductionSave">Add 80U</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted , toRaw} from "vue";
import { authService } from "@/services/authService";
import {useRouter, useRoute } from "vue-router";

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const token = authService.getToken();

const handleClose = () => {
  router.push({ name: "TdsDefault", params: { id } });
};
const showDialog = ref(false);
const showCDeduction = ref(false);
const showccdDeduction = ref(false);
const showdDeduction = ref(false);
const showDdDeduction = ref(false);
const showDdbDeduction = ref(false);
const showEDeduction = ref(false);
const showEebDeduction = ref(false);
const showGDeduction = ref(false);
const showGgDeduction = ref(false);
const showGgaDeduction = ref(false);
const showGgcDeduction = ref(false);
const showUDeduction = ref(false);

// Form data
const loanForm = reactive({
  amountPaid: "",
  lenderName: "",
  lenderPAN: "",
  lenderAddress: "",
  comments: "",
});
const cDeduction = reactive({
  amountPaid: "",
  comments: "",
  document: null,
});
const ccdDeduction = reactive({
  amountPaid: "",
  comments: "",
  document: null,
});
const dDeduction = reactive({
  amountPaid: "",
  comments: "",
  document: null,
});
const ddDeduction = reactive({
  amountPaid: "",
  comments: "",
  document: null,
});

const ddbDeduction = reactive({
  amountPaid: "",
  comments: "",
  document: null,
});

const eDeduction = reactive({
  amountPaid: "",
  comments: "",
  document: null,
});

const eebDeduction = reactive({
  amountPaid: "",
  comments: "",
  document: null,
});

const gDeduction = reactive({
  amountPaid: "",
  comments: "",
  document: null,
});

const ggDeduction = reactive({
  amountPaid: "",
  comments: "",
  document: null,
});

const ggaDeduction = reactive({
  amountPaid: "",
  comments: "",
  document: null,
});

const ggcDeduction = reactive({
  amountPaid: "",
  comments: "",
  document: null,
});

const uDeduction = reactive({
  amountPaid: "",
  comments: "",
  document: null,
});

const homeLoanForm = ref(null);

const cDeductionOpen = () => {
  showCDeduction.value = true;
};
const ccdDeductionOpen = () => {
  showccdDeduction.value = true;
};
const dDeductionOpen = () => {
  showdDeduction.value = true;
};
const ddDeductionOpen = () => {
  showDdDeduction.value = true;
};

const ddbDeductionOpen = () => {
  showDdbDeduction.value = true;
};

const eDeductionOpen = () => {
  showEDeduction.value = true;
};

const eebDeductionOpen = () => {
  showEebDeduction.value = true;
};

const gDeductionOpen = () => {
  showGDeduction.value = true;
};

const ggDeductionOpen = () => {
  showGgDeduction.value = true;
};

const ggaDeductionOpen = () => {
  showGgaDeduction.value = true;
};

const ggcDeductionOpen = () => {
  showGgcDeduction.value = true;
};

const uDeductionOpen = () => {
  showUDeduction.value = true;
};




const saveDeduction = async (sectionCode, deductionData, approvedAmount) => {
  const mandatoryFields = ["amountPaid"];
  const missingFields = mandatoryFields.filter((field) => !deductionData[field]);
  
  if (missingFields.length > 0) {
    alert("Please fill all required fields.");
    return;
  }
  
  try {
    // Create a plain JavaScript object (non-reactive) to avoid circular references
    let updatedDeductions = {};
    
    if (rentEntries.value) {
      // Use toRaw or a safer approach to handle reactive objects
      const plainRentEntries = Array.isArray(rentEntries.value)
        ? {}
        : toRaw(rentEntries.value); // Use toRaw if available in your Vue version
        
      // Alternative if toRaw is not available:
      // const plainRentEntries = JSON.parse(JSON.stringify(unref(rentEntries.value)));
      
      updatedDeductions = { ...plainRentEntries };
    }
    
    if (!updatedDeductions[sectionCode]) {
      updatedDeductions[sectionCode] = {
        [sectionCode]: [],
        totalDeclaredAmount: 0,
        totalApprovedAmount: approvedAmount || 0
      };
    }
    
    const entries = updatedDeductions[sectionCode][sectionCode] || [];
    const maxId = entries.length > 0
      ? Math.max(...entries.map(item => item.id || 0))
      : 0;
    
    const newEntry = {
      id: maxId + 1,
      amountPaid: deductionData.amountPaid,
      comments: deductionData.comments || "",
      status: "pending"
    };
    
    entries.push(newEntry);
    updatedDeductions[sectionCode][sectionCode] = entries;
    
    updatedDeductions[sectionCode].totalDeclaredAmount = entries.reduce(
      (sum, item) => sum + Number(item.amountPaid || 0),
      0
    );
    
    // Unwrap any ref values before creating request body
    if (updatedDeductions[sectionCode] && updatedDeductions[sectionCode].totalApprovedAmount && 
        updatedDeductions[sectionCode].totalApprovedAmount.__v_isRef) {
      updatedDeductions[sectionCode].totalApprovedAmount = updatedDeductions[sectionCode].totalApprovedAmount.value;
    }
    
    // Deep clone and unwrap all potential refs
    const safeUpdatedDeductions = {};
    Object.keys(updatedDeductions).forEach(key => {
      safeUpdatedDeductions[key] = {};
      
      // Handle totalDeclaredAmount
      safeUpdatedDeductions[key].totalDeclaredAmount = updatedDeductions[key].totalDeclaredAmount;
      
      // Handle totalApprovedAmount - unwrap if it's a ref
      const totalApproved = updatedDeductions[key].totalApprovedAmount;
      safeUpdatedDeductions[key].totalApprovedAmount = totalApproved && totalApproved.__v_isRef 
        ? totalApproved.value 
        : (totalApproved || 0);
      
      // Handle section array
      safeUpdatedDeductions[key][key] = Array.isArray(updatedDeductions[key][key]) 
        ? [...updatedDeductions[key][key]] 
        : [];
    });
    
    const requestBody = {
      tdsDeduction: {
        section80Deduction: safeUpdatedDeductions,
        id: tdsDeductionId.value,
      }
    };
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );
    
    if (!response.ok) throw new Error("Failed to update item");
    
    deductionData.amountPaid = "";
    deductionData.comments = "";
    deductionData.document = null;
    
    await fetchItemData();
  } catch (err) {
    console.error("Failed to save: " + err.message);
  }
};




const cDeductionSave = async () => {
  await saveDeduction("80C", cDeduction, approved80C);
  closeDialogC();
};

const ccdDeductionSave = async () => {
  await saveDeduction("80CCD", ccdDeduction, approved80CCD);
  closeDialogccd();
};

const dDeductionSave = async () => {
  await saveDeduction("80D", dDeduction, approved80D);
  closeDialogd();
};

const ddDeductionSave = async () => {
  await saveDeduction("80DD", ddDeduction, approved80DD);
  closeDialogDd();
};

const eDeductionSave = async () => {
  await saveDeduction("80E", eDeduction, approved80E);
  closeDialogE();
};

const eebDeductionSave = async () => {
  await saveDeduction("80EEB", eebDeduction, approved80EEB);
  closeDialogEeb();
};

const gDeductionSave = async () => {
  await saveDeduction("80G", gDeduction, 0);
  closeDialogG();
};

const ggDeductionSave = async () => {
  await saveDeduction("80GG", ggDeduction, 0);
  closeDialogGg();
};

const ggaDeductionSave = async () => {
  await saveDeduction("80GGA", ggaDeduction, 0);
  closeDialogGga();
};

const ggcDeductionSave = async () => {
  await saveDeduction("80GGC", ggcDeduction, 0);
  closeDialogGgc();
};

const ddbDeductionSave = async () => {
  await saveDeduction("80DDB", ddbDeduction, 0);
  closeDialogDdb();
};

const uDeductionSave = async () => {
  await saveDeduction("80U", uDeduction, 0);
  closeDialogU();
};

const acceptItem = async (item, sectionKey) => {
  try {
    const updatedDeductions = JSON.parse(JSON.stringify(rentEntries.value));
    const sectionData = updatedDeductions[sectionKey];
    const entries = sectionData[sectionKey];

    const updatedEntries = entries.map((entry) => {
      if (entry.id === item.id) {
        return {
          ...entry,
          status: "accepted",
          approvedAmount: Number(entry.amountPaid),
        };
      }
      return entry;
    });

    const totalApprovedAmount = updatedEntries.reduce(
      (sum, entry) => sum + (Number(entry.approvedAmount) || 0),
      0
    );

    updatedDeductions[sectionKey] = {
      ...sectionData,
      [sectionKey]: updatedEntries,
      totalApprovedAmount,
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tdsDeduction: {
            section80Deduction: updatedDeductions,
            id: tdsDeductionId.value,
          },
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to update status");
    await fetchItemData();
  } catch (err) {
    console.error("Accept item error:", err);
  }
};
const rejectItem = async (item, sectionKey) => {
  try {
    const updatedDeductions = JSON.parse(JSON.stringify(rentEntries.value));
    const sectionData = updatedDeductions[sectionKey];
    const entries = sectionData[sectionKey];

    const updatedEntries = entries.map((entry) => {
      if (entry.id === item.id) {
        return {
          ...entry,
          status: "rejected",
          approvedAmount: 0,
        };
      }
      return entry;
    });

    const totalApprovedAmount = updatedEntries.reduce(
      (sum, entry) => sum + (Number(entry.approvedAmount) || 0),
      0
    );

    updatedDeductions[sectionKey] = {
      ...sectionData,
      [sectionKey]: updatedEntries,
      totalApprovedAmount,
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tdsDeduction: {
            section80Deduction: updatedDeductions,
            id: tdsDeductionId.value,
          },
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to update status");
    await fetchItemData();
  } catch (err) {
    console.error("Reject item error:", err);
  }
};


const homeInvestment = async () => {
  const mandatoryFields = ["amountPaid"];
  const missingFields = mandatoryFields.filter(
    (field) => !loanDeduction[field],
  );

  if (missingFields.length > 0) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tdsDeduction: {
            homeLoanInvestment: [
              {
                amountPaid: loanDeduction.amountPaid,

                status: "pending",
              },
            ],
            id: tdsDeductionId.value,
          },
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update item");

    closeDialog();
    await fetchItemData();
  } catch (err) {
    console.error("PATCH error:", err);
  }
};

const headers = ref([
  { text: "AMount Paid", value: "amountPaid" },
  { text: "Lendar Name", value: "lenderName" },
  { text: "Lendar PAN", value: "lenderPAN" },
  { text: "Lendar Address", value: "lenderAddress" },

  { text: "Actions", value: "actions", sortable: false },
]);
const headersDeduction = ref([
  { text: "AMount Paid", value: "amountPaid" },

  { text: "Actions", value: "actions", sortable: false },
]);
const headersInvestment = [
  { title: "Amount Paid", key: "amountPaid" },
  { title: "Status", key: "status" },
];

const openAddInvestmentDialog = () => {
  showDialog.value = true;
};
const closeDialog = () => { showDialog.value = false };
const closeDialogC = () => { showCDeduction.value = false };
const closeDialogccd = () => { showccdDeduction.value = false };
const closeDialogd = () => { showdDeduction.value = false };
const closeDialogDd = () => { showDdDeduction.value = false };
const closeDialogDdb = () => { showDdbDeduction.value = false };
const closeDialogE = () => { showEDeduction.value = false };
const closeDialogEeb = () => { showEebDeduction.value = false };
const closeDialogG = () => { showGDeduction.value = false };
const closeDialogGg = () => { showGgDeduction.value = false };
const closeDialogGga = () => { showGgaDeduction.value = false };
const closeDialogGgc = () => { showGgcDeduction.value = false };
const closeDialogU = () => { showUDeduction.value = false };




const fetchItemData = async () => {
  try {
    const params = {
      fields: ["tdsDeduction.section80Deduction", "id", "tdsDeduction.id"],
    };

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${id}?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    processEarningsAndDeductions(data);
  } catch (error) {
    console.error("Error fetching item data:", error);
  }
};
const tdsDeductionId = ref(null);

const rentEntries = ref([]);
const deductionEntries = ref([]);
const deduction80CCD = ref([]);
const deduction80D = ref([]);
const deduction80DD = ref([]);
const deduction80DDB = ref([]);
const deduction80E = ref([]);
const deduction80EEB = ref([]);
const deduction80G = ref([]);
const deduction80GG = ref([]);
const deduction80GGA = ref([]);
const deduction80GGC = ref([]);
const deduction80U = ref([]);

// Total declared and approved amounts for each section
const declared80C = ref(0);
const approved80C = ref(0);

const declared80CCD = ref(0);
const approved80CCD = ref(0);

const declared80D = ref(0);
const approved80D = ref(0);

const declared80DD = ref(0);
const approved80DD = ref(0);

const declared80DDB = ref(0);
const approved80DDB = ref(0);

const declared80E = ref(0);
const approved80E = ref(0);

const declared80EEB = ref(0);
const approved80EEB = ref(0);

const declared80G = ref(0);
const approved80G = ref(0);

const declared80GG = ref(0);
const approved80GG = ref(0);

const declared80GGA = ref(0);
const approved80GGA = ref(0);

const declared80GGC = ref(0);
const approved80GGC = ref(0);

const declared80U = ref(0);
const approved80U = ref(0);

const processEarningsAndDeductions = (data) => {
  const tds = data?.data?.tdsDeduction || {};
  tdsDeductionId.value = tds?.id;

  rentEntries.value = tds?.section80Deduction || [];

  deductionEntries.value = tds?.section80Deduction?.["80C"]?.["80C"] || [];

  deduction80CCD.value = tds?.section80Deduction?.["80CCD"]?.["80CCD"] || [];
  deduction80D.value = tds?.section80Deduction?.["80D"]?.["80D"] || [];
  deduction80DD.value = tds?.section80Deduction?.["80DD"]?.["80DD"] || [];
  deduction80DDB.value = tds?.section80Deduction?.["80DDB"]?.["80DDB"] || [];
  deduction80E.value = tds?.section80Deduction?.["80E"]?.["80E"] || [];
  deduction80EEB.value = tds?.section80Deduction?.["80EEB"]?.["80EEB"] || [];
  deduction80G.value = tds?.section80Deduction?.["80G"]?.["80G"] || [];
  deduction80GG.value = tds?.section80Deduction?.["80GG"]?.["80GG"] || [];
  deduction80GGA.value = tds?.section80Deduction?.["80GGA"]?.["80GGA"] || [];
  deduction80GGC.value = tds?.section80Deduction?.["80GGC"]?.["80GGC"] || [];
  deduction80U.value = tds?.section80Deduction?.["80U"]?.["80U"] || [];

  declared80C.value =
    tds?.section80Deduction?.['80C']?.totalDeclaredAmount || 0;
   
  approved80C.value =
    tds?.section80Deduction?.["80C"]?.totalApprovedAmount || 0;

  declared80CCD.value =
    tds?.section80Deduction?.["80CCD"]?.totalDeclaredAmount || 0;
  approved80CCD.value =
    tds?.section80Deduction?.["80CCD"]?.totalApprovedAmount || 0;

  declared80D.value =
    tds?.section80Deduction?.["80D"]?.totalDeclaredAmount || 0;
  approved80D.value =
    tds?.section80Deduction?.["80D"]?.totalApprovedAmount || 0;

  declared80DD.value =
    tds?.section80Deduction?.["80DD"]?.totalDeclaredAmount || 0;
  approved80DD.value =
    tds?.section80Deduction?.["80DD"]?.totalApprovedAmount || 0;

  declared80DDB.value =
    tds?.section80Deduction?.["80DDB"]?.totalDeclaredAmount || 0;
  approved80DDB.value =
    tds?.section80Deduction?.["80DDB"]?.totalApprovedAmount || 0;

  declared80E.value =
    tds?.section80Deduction?.["80E"]?.totalDeclaredAmount || 0;
  approved80E.value =
    tds?.section80Deduction?.["80E"]?.totalApprovedAmount || 0;

  declared80EEB.value =
    tds?.section80Deduction?.["80EEB"]?.totalDeclaredAmount || 0;
  approved80EEB.value =
    tds?.section80Deduction?.["80EEB"]?.totalApprovedAmount || 0;

  declared80G.value =
    tds?.section80Deduction?.["80G"]?.totalDeclaredAmount || 0;
  approved80G.value =
    tds?.section80Deduction?.["80G"]?.totalApprovedAmount || 0;

  declared80GG.value =
    tds?.section80Deduction?.["80GG"]?.totalDeclaredAmount || 0;
  approved80GG.value =
    tds?.section80Deduction?.["80GG"]?.totalApprovedAmount || 0;

  declared80GGA.value =
    tds?.section80Deduction?.["80GGA"]?.totalDeclaredAmount || 0;
  approved80GGA.value =
    tds?.section80Deduction?.["80GGA"]?.totalApprovedAmount || 0;

  declared80GGC.value =
    tds?.section80Deduction?.["80GGC"]?.totalDeclaredAmount || 0;
  approved80GGC.value =
    tds?.section80Deduction?.["80GGC"]?.totalApprovedAmount || 0;

  declared80U.value =
    tds?.section80Deduction?.["80U"]?.totalDeclaredAmount || 0;
  approved80U.value =
    tds?.section80Deduction?.["80U"]?.totalApprovedAmount || 0;
};

const addHomeLoan = async () => {
  const mandatoryFields = [
    "amountPaid",
    "lenderName",
    "lenderPAN",
    "lenderAddress",
  ];
  const missingFields = mandatoryFields.filter((field) => !loanForm[field]);

  if (missingFields.length > 0) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tdsDeduction: {
            homeLoan: [
              {
                amountPaid: loanForm.amountPaid,
                lenderName: loanForm.lenderName,
                lenderPAN: loanForm.lenderPAN,
                lenderAddress: loanForm.lenderAddress,
                comments: loanForm.comments || "",
                status: "pending",
              },
            ],
            id: tdsDeductionId.value,
          },
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to update item");

    closeDialog();
    await fetchItemData();
  } catch (err) {
    console.error("PATCH error:", err);
  }
};

onMounted(async () => {
  await fetchItemData();
});
</script>

<style scoped>
.deductions-container {

  color: #333;
  max-width: 100%;
  margin: 0 auto;
  height: calc(90vh - 190px);
  overflow-y: auto;
}

.section {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 4px;
}

.gray-bg {
  background-color: #f2f2f2;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 15px;
}

.subsection-title {
  font-size: 18px;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 15px;
}

.info-text {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
}

.link {
  color: #0078d4;
  text-decoration: none;
}

.add-btn {
  background-color: transparent;
  color: #0078d4;
  border: 1px solid #0078d4;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.grid-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
  margin-bottom: 20px;
}

.amounts-table-grid {
  display: grid;
  grid-template-columns: auto auto;
  row-gap: 8px;
  column-gap: 8px;
  padding: 10px;
  border-radius: 4px;

  max-width: 250px;
  justify-self: end;
}

.grid-item.label {
  font-weight: bold;
  text-align: left;
}

.grid-item.value {
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.manage-btn,
.add-investment-btn {
  background-color: transparent;
  color: #0078d4;
  border: none;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.dropdown-icon,
.info-icon {
  margin-left: 5px;
  font-size: 12px;
}


</style>
