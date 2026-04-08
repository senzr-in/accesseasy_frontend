<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Import Instructions</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="instructions-container">
          <h3>Before You Import</h3>
          <p>
            Please read the following instructions carefully to ensure your data
            imports correctly:
          </p>

          <div class="instruction-section">
            <h4>File Format Requirements</h4>
            <ul>
              <li>
                Upload either a <strong>CSV</strong> or
                <strong>XLSX</strong> file
              </li>
              <li>
                The first row must contain column headers exactly as shown in
                the template
              </li>
              <li>Do not modify the column headers in the template</li>
              <li>All column names are case-sensitive</li>
              <li>
                If no data is there then ensure they remain empty (rather than
                being filled with placeholders like "N/A", "-", null or "No"),
              </li>
            </ul>
          </div>

          <div class="instruction-section">
            <h4>Required Fields</h4>
            <p>
              The following fields are
              <span class="required-text">mandatory</span> and must be filled
              for each employee:
            </p>
            <ul class="required-fields-list">
              <li><strong>firstName</strong> - Employee's first name</li>
              <li>
                <strong>gender</strong> - Gender of the employee (Must be either
                <code>Male</code>, <code>Female</code>, or <code>Others</code>)
              </li>
              <li>
                <strong>Employee ID</strong> - Unique identifier for each
                employee
              </li>
            </ul>
          </div>

          <div class="instruction-section">
            <h4>Optional Fields</h4>
            <p>
              The following fields are optional but should follow the specified
              format if provided:
            </p>
            <ul>
              <li>
                <strong>salary</strong> - month salary in numeric format (e.g.,
                50000)
              </li>
            </ul>
          </div>

          <div class="instruction-section">
            <h4>Role Names</h4>
            <p class="important-note">
              Role names must be entered exactly as shown below
              (case-sensitive):
            </p>
            <div class="role-examples">
              <div class="role-example">
                <span class="role-name">Employee</span>
                <span class="role-status">✓ Correct</span>
              </div>
              <div class="role-example">
                <span class="role-name">Manager</span>
                <span class="role-status">✓ Correct</span>
              </div>
              <div class="role-example">
                <span class="role-name">Admin</span>
                <span class="role-status">✓ Correct</span>
              </div>
              <div class="role-example incorrect">
                <span class="role-name">employee</span>
                <span class="role-status">✗ (lowercase)</span>
              </div>
              <div class="role-example incorrect">
                <span class="role-name">MANAGER</span>
                <span class="role-status">✗ (all caps)</span>
              </div>
              <div class="role-example incorrect">
                <span class="role-name">administrator</span>
                <span class="role-status">✗ (wrong)</span>
              </div>
            </div>
          </div>

          <div class="instruction-section mt-6">
            <h4>Gender Values</h4>
            <p class="important-note">
              Gender must be entered exactly as shown below (case-sensitive):
            </p>
            <div class="role-examples">
              <div class="role-example">
                <span class="role-name">Male</span>
                <span class="role-status">✓ Correct</span>
              </div>
              <div class="role-example">
                <span class="role-name">Female</span>
                <span class="role-status">✓ Correct</span>
              </div>
              <div class="role-example">
                <span class="role-name">Others</span>
                <span class="role-status">✓ Correct</span>
              </div>
              <div class="role-example incorrect">
                <span class="role-name">male</span>
                <span class="role-status">✗ (lowercase)</span>
              </div>
              <div class="role-example incorrect">
                <span class="role-name">FEMALE</span>
                <span class="role-status">✗ (all caps)</span>
              </div>
              <div class="role-example incorrect">
                <span class="role-name">other</span>
                <span class="role-status">✗ (wrong spelling/case)</span>
              </div>
            </div>
          </div>

          <div class="instruction-section">
            <h4>Date Formats</h4>
            <p>The system accepts the following date formats:</p>
            <div class="date-formats">
              <table>
                <thead>
                  <tr>
                    <th>Format</th>
                    <th>Example</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>DD/MM/YYYY</td>
                    <td>31/12/2023</td>
                    <td>Day/Month/Year with slashes</td>
                  </tr>
                  <tr>
                    <td>MM/DD/YYYY</td>
                    <td>12/31/2023</td>
                    <td>Month/Day/Year with slashes</td>
                  </tr>
                  <tr>
                    <td>YYYY-MM-DD</td>
                    <td>2023-12-31</td>
                    <td>ISO format (recommended)</td>
                  </tr>
                  <tr>
                    <td>DD-MM-YYYY</td>
                    <td>31-12-2023</td>
                    <td>Day-Month-Year with hyphens</td>
                  </tr>
                  <tr>
                    <td>DD MMM YYYY</td>
                    <td>31 Dec 2023</td>
                    <td>Day Month(text) Year</td>
                  </tr>
                  <tr>
                    <td>MMM DD, YYYY</td>
                    <td>Dec 31, 2023</td>
                    <td>Month(text) Day, Year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="instruction-section">
            <h4>Data Validation Rules</h4>
            <ul>
              <li>
                <strong>Phone Numbers:</strong> Must be 10 digits with no spaces
                or special characters
              </li>
              <li>
                <strong>Aadhar Number:</strong> Must be 12 digits with no spaces
                or special characters
              </li>
              <li><strong>PAN:</strong> Must be 10 alphanumeric characters</li>
              <li>
                <strong>Email Addresses:</strong> Must follow standard email
                format (example@domain.com)
              </li>
              <li><strong>UAN:</strong> Must be 12 digits if provided</li>
              <li>
                <strong>Voter ID:</strong> Must be at least 10 alphanumeric
                characters if provided
              </li>
              <li>
                <strong>Driving License:</strong> Must be 8-16 alphanumeric
                characters if provided
              </li>
              <li>
                <strong>Salary:</strong> Must be a positive number if provided
                (e.g., 500000)
              </li>
            </ul>
          </div>

          <div class="instruction-section">
            <h4>Example Data</h4>
            <p>
              Below is a comprehensive example with all available fields. Scroll
              horizontally to view all columns:
            </p>
            <div class="example-table-container">
              <table class="example-table">
                <thead>
                  <tr>
                    <th>firstName</th>
                    <th>Employee ID</th>
                    <th>phone</th>
                    <th>email</th>
                    <th>Office Email</th>
                    <th>Role Name</th>
                    <th>pan</th>
                    <th>Aadhar</th>
                    <th>gender</th>
                    <th>dateOfBirth</th>
                    <th>bloodGroup</th>
                    <th>maritalStatus</th>
                    <th>currentAddress</th>
                    <th>permanentAddress</th>
                    <th>bankAccountName</th>
                    <th>bankAccountNumber</th>
                    <th>skillType</th>
                    <th>designation</th>
                    <th>ifscCode</th>
                    <th>UPI ID</th>
                    <th>emergencyContactName</th>
                    <th>emergencyContactMobile</th>
                    <th>emergencyContactRelationship</th>
                    <th>emergencyContactAddress</th>
                    <th>guardiansName</th>
                    <th>Department Name</th>
                    <th>salary</th>
                    <th>Date of Joining</th>
                    <th>Date of Leaving</th>
                    <th>pfAccountNumber</th>
                    <th>esiAccountNumber</th>
                    <th>Voter ID</th>
                    <th>drivingLicense</th>
                    <th>uan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>John</td>
                    <td>EMP001</td>
                    <td>9876543210</td>
                    <td>john@example.com</td>
                    <td>john.work@company.com</td>
                    <td>Employee</td>
                    <td>ABCDE1234F</td>
                    <td>123456789012</td>
                    <td>Male</td>
                    <td>15/05/1990</td>
                    <td>O+</td>
                    <td>Married</td>
                    <td>123 Main St, Bangalore</td>
                    <td>123 Main St, Bangalore</td>
                    <td>HDFC Bank</td>
                    <td>1234567890</td>
                    <td>Technical</td>
                    <td>Software Engineer</td>
                    <td>HDFC0001234</td>
                    <td>john@upi</td>
                    <td>Jane Doe</td>
                    <td>9876543211</td>
                    <td>Spouse</td>
                    <td>123 Main St, Bangalore</td>
                    <td>Robert Smith</td>
                    <td>Engineering</td>
                    <td>500000</td>
                    <td>15/01/2023</td>
                    <td></td>
                    <td>123456789012</td>
                    <td>987654321012</td>
                    <td>ABC1234567</td>
                    <td>DL1234567890</td>
                    <td>123456789012</td>
                  </tr>
                  <tr>
                    <td>Sarah</td>
                    <td>EMP002</td>
                    <td>9876543211</td>
                    <td>sarah@example.com</td>
                    <td>sarah.work@company.com</td>
                    <td>Manager</td>
                    <td>FGHIJ5678K</td>
                    <td>123456789013</td>
                    <td>Female</td>
                    <td>1985-06-12</td>
                    <td>A-</td>
                    <td>Unmarried</td>
                    <td>456 Park Ave, Mumbai</td>
                    <td>456 Park Ave, Mumbai</td>
                    <td>ICICI Bank</td>
                    <td>0987654321</td>
                    <td>Management</td>
                    <td>Project Manager</td>
                    <td>ICIC0002345</td>
                    <td>sarah@upi</td>
                    <td>Michael Johnson</td>
                    <td>9876543212</td>
                    <td>Father</td>
                    <td>789 Oak St, Delhi</td>
                    <td>Michael Johnson</td>
                    <td>Marketing</td>
                    <td>750000</td>
                    <td>2022-11-01</td>
                    <td></td>
                    <td>234567890123</td>
                    <td>876543210123</td>
                    <td>DEF2345678</td>
                    <td>DL2345678901</td>
                    <td>234567890123</td>
                  </tr>
                  <tr>
                    <td>Rajesh</td>
                    <td>EMP003</td>
                    <td>9876543212</td>
                    <td>rajesh@example.com</td>
                    <td>rajesh.work@company.com</td>
                    <td>Admin</td>
                    <td>LMNOP9012Q</td>
                    <td>123456789014</td>
                    <td>Male</td>
                    <td>25 Dec 1988</td>
                    <td>B+</td>
                    <td>Married</td>
                    <td>789 Park Rd, Chennai</td>
                    <td>789 Park Rd, Chennai</td>
                    <td>SBI Bank</td>
                    <td>2345678901</td>
                    <td>Administrative</td>
                    <td>System Administrator</td>
                    <td>SBIN0003456</td>
                    <td>rajesh@upi</td>
                    <td>Priya Kumar</td>
                    <td>9876543213</td>
                    <td>Spouse</td>
                    <td>789 Park Rd, Chennai</td>
                    <td>Suresh Kumar</td>
                    <td>IT</td>
                    <td>600000</td>
                    <td>Mar 05, 2023</td>
                    <td></td>
                    <td>345678901234</td>
                    <td>765432101234</td>
                    <td>GHI3456789</td>
                    <td>DL3456789012</td>
                    <td>345678901234</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="confirmation-checkbox">
          <label>
            <input type="checkbox" v-model="hasReadInstructions" />
            I have read and understood the import instructions
          </label>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">Cancel</button>
        <button
          class="continue-btn"
          :disabled="!hasReadInstructions"
          @click="proceedToDownload"
        >
          Continue to Download Template
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const hasReadInstructions = ref(false);
const emit = defineEmits(["close", "proceed"]);

const proceedToDownload = () => {
  if (hasReadInstructions.value) {
    emit("proceed");
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 800px;
  max-width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
  flex-grow: 1;
}

.instructions-container {
  margin-bottom: 20px;
}

.instruction-section {
  margin-bottom: 20px;
}

.instruction-section h4 {
  margin-bottom: 8px;
  color: #059367;
  font-size: 16px;
}

.instruction-section ul {
  padding-left: 20px;
  margin-bottom: 10px;
}

.instruction-section li {
  margin-bottom: 5px;
}

.required-text {
  color: #dc2626;
  font-weight: bold;
}

.required-fields-list li {
  color: #dc2626;
}

.important-note {
  font-weight: bold;
  background-color: #fef3c7;
  padding: 8px;
  border-radius: 4px;
  border-left: 4px solid #f59e0b;
  margin-bottom: 10px;
}

.role-examples {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin: 15px 0;
}

.role-example {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 3px solid #0ea5e9;
}

.role-example.incorrect {
  background-color: #fef2f2;
  border-left: 3px solid #dc2626;
}

.role-name {
  font-weight: bold;
}

.role-status {
  font-size: 0.85em;
}

.date-formats {
  margin: 10px 0;
  overflow-x: auto;
}

.date-formats table {
  width: 100%;
  border-collapse: collapse;
}

.date-formats th,
.date-formats td {
  padding: 8px 12px;
  text-align: left;
  border: 1px solid #e5e7eb;
}

.date-formats th {
  background-color: #f3f4f6;
}

.example-table-container {
  overflow-x: auto;
  margin: 10px 0;
  border: 1px solid #eee;
  border-radius: 4px;
  max-width: 100%;
}

.example-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 2000px; /* Force horizontal scrolling */
}

.example-table th,
.example-table td {
  padding: 8px 12px;
  text-align: left;
  border: 1px solid #e5e7eb;
  white-space: nowrap;
}

.example-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.confirmation-checkbox {
  margin: 20px 0;
  padding: 15px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.confirmation-checkbox input {
  margin-right: 10px;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-btn,
.continue-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  color: #333;
}

.continue-btn {
  background-color: #059367;
  border: none;
  color: white;
}

.continue-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .role-examples {
    grid-template-columns: 1fr;
  }
}
</style>
