<template>
  <v-dialog v-model="showPayslipPreview" max-width="800px">
    <v-card>
      <v-card-title class="text-h5 bg-primary text-white">
        Payslip Preview
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text class="pa-0">
        <div ref="payslipPreviewContent" class="payslip-preview-content">
          <div v-if="currentPayslipData" class="payslip-container">
            <div class="payslip-loading" v-if="generatingPdf">
              <v-progress-circular indeterminate color="primary" />
              <span class="ml-2">Generating PDF...</span>
            </div>
            <div v-else>
              <div class="payslip-header"></div>
              <div class="payslip-title">
                <h3>
                  PAYSLIP FOR
                  {{
                    formatPayrollMonth(
                      currentPayslipData.month,
                      currentPayslipData.year,
                    )
                  }}
                </h3>
              </div>
              <div class="employee-details">
                <div class="detail-row">
                  <div class="detail-item">
                    <span class="label">Employee Name:</span>
                    <span class="value">{{
                      currentPayslipData.employeeName
                    }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Employee ID:</span>
                    <span class="value">{{
                      currentPayslipData.employeeId
                    }}</span>
                  </div>
                </div>
                <div class="detail-row">
                  <div class="detail-item">
                    <span class="label">Department:</span>
                    <span class="value">{{
                      currentPayslipData.department
                    }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Designation:</span>
                    <span class="value">{{
                      currentPayslipData.designation
                    }}</span>
                  </div>
                </div>
                <div class="detail-row">
                  <div class="detail-item">
                    <span class="label">Pay Period:</span>
                    <span class="value">{{
                      formatPayrollMonth(
                        currentPayslipData.month,
                        currentPayslipData.year,
                      )
                    }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Payable Days:</span>
                    <span class="value">{{
                      currentPayslipData.payableDays
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="salary-details">
                <div class="salary-section">
                  <h4>Earnings</h4>
                  <div class="salary-items">
                    <div
                      v-for="(value, key) in currentPayslipData.earnings"
                      :key="`earning-${key}`"
                      class="salary-item"
                    >
                      <span class="item-name">{{ key }}</span>
                      <span class="item-value"
                        >₹ {{ formatAmount(value) }}</span
                      >
                    </div>
                    <div class="salary-item total">
                      <span class="item-name">Total Earnings</span>
                      <span class="item-value"
                        >₹
                        {{
                          formatAmount(currentPayslipData.totalEarnings)
                        }}</span
                      >
                    </div>
                  </div>
                </div>
                <div class="salary-section">
                  <h4>Deductions</h4>
                  <div class="salary-items">
                    <div
                      v-for="(value, key) in currentPayslipData.deductions"
                      :key="`deduction-${key}`"
                      class="salary-item"
                    >
                      <span class="item-name">{{ key }}</span>
                      <span class="item-value"
                        >₹ {{ formatAmount(value) }}</span
                      >
                    </div>
                    <div class="salary-item total">
                      <span class="item-name">Total Deductions</span>
                      <span class="item-value"
                        >₹
                        {{
                          formatAmount(currentPayslipData.totalDeductions)
                        }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div class="net-salary">
                <div class="net-salary-label">Net Salary</div>
                <div class="net-salary-value">
                  ₹ {{ formatAmount(currentPayslipData.netSalary) }}
                </div>
              </div>
              <div
                v-if="
                  currentPayslipData && currentPayslipData.totalAttendanceCount
                "
                class="attendance-summary"
              >
                <h4>Attendance Summary</h4>
                <div class="attendance-grid">
                  <template
                    v-for="(value, key) in formatAttendanceData(
                      currentPayslipData.totalAttendanceCount,
                    )"
                    :key="key"
                  >
                    <div class="attendance-item">
                      <span class="attendance-label">{{
                        key.replace(/([A-Z])/g, " $1").trim()
                      }}</span>
                      <span class="attendance-value">{{ value }}</span>
                    </div>
                  </template>
                </div>
              </div>
              <div class="payslip-footer">
                <p>
                  This is a computer-generated payslip and does not require a
                  signature.
                </p>
                <p>For any queries, please contact HR department.</p>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="error" @click="showPayslipPreview = false">Close</v-btn>
        <v-btn
          color="primary"
          @click="downloadCurrentPayslip"
          :loading="generatingPdf"
          :disabled="generatingPdf"
        >
          <v-icon left>mdi-download</v-icon>
          Download PDF
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
  name: "PayslipPreview",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    employeeData: {
      type: Object,
      default: () => ({}),
    },
    token: {
      type: String,
      required: true,
    },
    tenantId: {
      type: String,
      required: true,
    },
    tenantName: {
      type: String,
      default: "Company Name",
    },
  },
  data() {
    return {
      showPayslipPreview: false,
      currentPayslipData: null,
      generatingPdf: false,
    };
  },
  watch: {
    value(newVal) {
      this.showPayslipPreview = newVal;
    },
    showPayslipPreview(newVal) {
      this.$emit("input", newVal);
      if (newVal && this.employeeData) {
        this.preparePayslipData(this.employeeData);
      }
    },
  },
  methods: {
    formatAttendanceData(totalAttendanceCount) {
      if (!totalAttendanceCount) return {};

      try {
        // If it's a string, parse it to an object
        const attendanceData =
          typeof totalAttendanceCount === "string"
            ? JSON.parse(totalAttendanceCount)
            : totalAttendanceCount;

        // Remove employeeId as requested
        const { employeeId, ...formattedData } = attendanceData;
        return formattedData;
      } catch (error) {
        console.error("Error formatting attendance data:", error);
        return {};
      }
    },

    formatAmount(value) {
      if (!value) return "0.00";
      return parseFloat(value)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    formatPayrollMonth(month, year) {
      const date = new Date(year, month - 1, 1);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    },

    formatDateForDisplay(dateString) {
      if (!dateString) return "-";

      try {
        const date = new Date(dateString + "T00:00:00Z");

        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } catch (e) {
        console.error("Error formatting date:", e);
        return dateString;
      }
    },

    async preparePayslipData(item) {
      if (!item.attendanceVerified || !item.salaryVerified) {
        this.$emit("show-snackbar", {
          message:
            "This employee's payslip is not available for download. Both attendance and salary must be verified.",
          color: "warning",
        });
        return;
      }

      try {
        this.generatingPdf = true;

        // Fetch employee details
        const employeeResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule/${item.employee.id}`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        );

        if (!employeeResponse.ok) {
          throw new Error(
            `Failed to fetch employee details: ${employeeResponse.statusText}`,
          );
        }

        const employeeData = await employeeResponse.json();

        // Fetch payroll verification data - this is the key change
        const verificationResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/payrollVerification?filter[_and][0][employee][id][_eq]=${item.employee.id}`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        );

        if (!verificationResponse.ok) {
          throw new Error(
            `Failed to fetch verification details: ${verificationResponse.statusText}`,
          );
        }

        const verificationData = await verificationResponse.json();
        const verification = verificationData.data[0];

        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Set the payslip data
        this.currentPayslipData = {
          employeeName: item.employee.assignedUser.first_name,
          employeeId: item.employee.employeeId,
          department:
            item.employee.assignedDepartment?.department_id?.departmentName ||
            "-",
          designation: item.employee.assignedUser.role?.name || "-",
          month: month,
          year: year,
          payableDays: item.payableDays || 0,
          earnings: verification.earnings || {},
          deductions: verification.deductions || {},
          totalEarnings: verification.netSalary || 0,
          totalDeductions: Object.values(verification.deductions || {}).reduce(
            (sum, val) => sum + parseFloat(val || 0),
            0,
          ),
          netSalary: verification.netSalary || 0,
          // Use the attendance data from payroll verification
          totalAttendanceCount: verification.totalAttendanceCount || null,
          startDate: verification.startDate || "-",
          endDate: verification.endDate || "-",
        };
      } catch (error) {
        console.error("Error preparing payslip:", error);
        this.$emit("show-snackbar", {
          message: `Error preparing payslip: ${error.message}`,
          color: "error",
        });
      } finally {
        this.generatingPdf = false;
      }
    },

    async downloadCurrentPayslip() {
      if (!this.currentPayslipData) return;

      try {
        this.generatingPdf = true;

        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        let yPos = margin;

        // Company name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.text(this.tenantName, pageWidth / 2, yPos, { align: "center" });

        yPos += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);

        // Payslip title
        yPos += 6;
        doc.setFontSize(10);
        doc.text(
          `PAYSLIP FOR ${this.formatPayrollMonth(
            this.currentPayslipData.month,
            this.currentPayslipData.year,
          ).toUpperCase()}`,
          pageWidth / 2,
          yPos,
          { align: "center" },
        );

        yPos += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;

        // Employee details section
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 25, "F");
        yPos += 2;

        const employeeDetails = [
          [
            { content: "Employee:", styles: { fontStyle: "bold" } },
            { content: this.currentPayslipData.employeeName },
            { content: "Employee ID:", styles: { fontStyle: "bold" } },
            { content: this.currentPayslipData.employeeId },
          ],
          [
            { content: "Department:", styles: { fontStyle: "bold" } },
            { content: this.currentPayslipData.department || "-" },
            { content: "Designation:", styles: { fontStyle: "bold" } },
            { content: this.currentPayslipData.designation },
          ],
          [
            { content: "Pay Period:", styles: { fontStyle: "bold" } },
            {
              content: this.formatPayrollMonth(
                this.currentPayslipData.month,
                this.currentPayslipData.year,
              ),
            },
            { content: "Payable Days:", styles: { fontStyle: "bold" } },
            { content: this.currentPayslipData.payableDays.toString() },
          ],
        ];

        doc.autoTable({
          startY: yPos,
          body: employeeDetails,
          theme: "plain",
          styles: {
            fontSize: 8,
            textColor: [80, 80, 80],
            cellPadding: 1.5,
            lineWidth: 0,
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 45 },
            2: { cellWidth: 25 },
            3: { cellWidth: 30 },
          },
          margin: { left: margin, right: margin },
        });

        yPos = doc.lastAutoTable.finalY + 5;

        // Earnings section
        const earningsHeader = [["EARNINGS", "AMOUNT"]];
        const earningsData = Object.entries(
          this.currentPayslipData.earnings,
        ).map(([key, value]) => [key, `₹ ${this.formatAmount(value)}`]);

        // Deductions section
        const deductionsHeader = [["DEDUCTIONS", "AMOUNT"]];
        const deductionsData = Object.entries(
          this.currentPayslipData.deductions,
        ).map(([key, value]) => [key, `₹ ${this.formatAmount(value)}`]);

        doc.autoTable({
          startY: yPos,
          head: earningsHeader,
          body: earningsData,
          theme: "grid",
          headStyles: {
            fillColor: [245, 245, 245],
            textColor: [50, 50, 50],
            fontStyle: "bold",
            halign: "left",
            fontSize: 8,
          },
          margin: { left: margin, right: pageWidth / 2 + 2 },
          tableWidth: (pageWidth - 2 * margin) / 2 - 2,
          styles: {
            fontSize: 7,
            textColor: [80, 80, 80],
            cellPadding: 1.5,
          },
          columnStyles: {
            0: { cellWidth: "auto" },
            1: { cellWidth: 25, halign: "left" },
          },
          foot: [
            [
              "Total Earnings",
              `₹ ${this.formatAmount(this.currentPayslipData.totalEarnings)}`,
            ],
          ],
          footStyles: {
            fillColor: [245, 245, 245],
            textColor: [50, 50, 50],
            fontStyle: "bold",
            fontSize: 8,
          },
        });

        doc.autoTable({
          startY: yPos,
          head: deductionsHeader,
          body: deductionsData,
          theme: "grid",
          headStyles: {
            fillColor: [245, 245, 245],
            textColor: [50, 50, 50],
            fontStyle: "bold",
            halign: "left",
            fontSize: 8,
          },
          margin: { left: pageWidth / 2 + 2, right: margin },
          tableWidth: (pageWidth - 2 * margin) / 2 - 2,
          styles: {
            fontSize: 7,
            textColor: [80, 80, 80],
            cellPadding: 1.5,
          },
          columnStyles: {
            0: { cellWidth: "auto" },
            1: { cellWidth: 25, halign: "left" },
          },
          foot: [
            [
              "Total Deductions",
              `₹ ${this.formatAmount(this.currentPayslipData.totalDeductions)}`,
            ],
          ],
          footStyles: {
            fillColor: [245, 245, 245],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            fontSize: 8,
          },
        });

        const finalY = Math.max(
          doc.previousAutoTable.finalY,
          doc.autoTable.previous.finalY,
        );
        yPos = finalY + 7;

        // Net salary section
        const netSalaryBoxHeight = 10;
        const netSalaryBoxWidth = pageWidth - 2 * margin;

        doc.setFillColor(102, 90, 205);
        doc.rect(margin, yPos, netSalaryBoxWidth, netSalaryBoxHeight, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Net Salary", margin + 5, yPos + 6.5);
        doc.text(
          `₹ ${this.formatAmount(this.currentPayslipData.netSalary)}`,
          pageWidth - margin - 5,
          yPos + 6.5,
          { align: "left" },
        );

        // Attendance summary section
        if (this.currentPayslipData.totalAttendanceCount) {
          yPos += netSalaryBoxHeight + 5;

          doc.setTextColor(50, 50, 50);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text("Attendance Summary", margin, yPos);
          yPos += 4;

          const attendanceData = this.formatAttendanceData(
            this.currentPayslipData.totalAttendanceCount,
          );

          // Create attendance data table
          const attendanceHeaders = [];
          const attendanceValues = [];

          // First row of attendance data
          const firstRowKeys = [
            "present",
            "absent",
            "paidLeave",
            "unpaidLeave",
            "halfDay",
          ];
          firstRowKeys.forEach((key) => {
            if (key in attendanceData) {
              attendanceHeaders.push(key.replace(/([A-Z])/g, " $1").trim());
              attendanceValues.push(attendanceData[key].toString());
            }
          });

          if (attendanceHeaders.length > 0) {
            doc.autoTable({
              startY: yPos,
              head: [attendanceHeaders],
              body: [attendanceValues],
              theme: "grid",
              headStyles: {
                fillColor: [245, 245, 245],
                textColor: [50, 50, 50],
                fontStyle: "bold",
                halign: "center",
                fontSize: 7,
              },
              bodyStyles: {
                halign: "center",
                fontSize: 7,
              },
              margin: { left: margin, right: margin },
              styles: {
                cellPadding: 1,
              },
            });

            yPos = doc.previousAutoTable.finalY + 2;
          }

          // Second row of attendance data
          const secondRowKeys = [
            "weekOff",
            "holiday",
            "workFromHome",
            "totalPayableDays",
          ];
          const attendanceHeaders2 = [];
          const attendanceValues2 = [];

          secondRowKeys.forEach((key) => {
            if (key in attendanceData) {
              attendanceHeaders2.push(key.replace(/([A-Z])/g, " $1").trim());
              attendanceValues2.push(attendanceData[key].toString());
            }
          });

          if (attendanceHeaders2.length > 0) {
            doc.autoTable({
              startY: yPos,
              head: [attendanceHeaders2],
              body: [attendanceValues2],
              theme: "grid",
              headStyles: {
                fillColor: [245, 245, 245],
                textColor: [50, 50, 50],
                fontStyle: "bold",
                halign: "center",
                fontSize: 7,
              },
              bodyStyles: {
                halign: "center",
                fontSize: 7,
              },
              margin: { left: margin, right: margin },
              styles: {
                cellPadding: 1,
              },
            });

            yPos = doc.previousAutoTable.finalY + 3;
          }
        }

        // Footer
        yPos = doc.previousAutoTable
          ? doc.previousAutoTable.finalY + 10
          : yPos + 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        doc.text(
          "This is a computer-generated payslip and does not require a signature.",
          pageWidth / 2,
          yPos,
          {
            align: "center",
          },
        );

        // Save the PDF
        doc.save(
          `payslip-${this.currentPayslipData.employeeName.replace(/\s+/g, "-")}-${this.currentPayslipData.month}-${this.currentPayslipData.year}.pdf`,
        );

        this.$emit("show-snackbar", {
          message: "Payslip downloaded successfully",
          color: "success",
        });
      } catch (error) {
        console.error("Error downloading payslip:", error);
        this.$emit("show-snackbar", {
          message: `Error downloading payslip: ${error.message}`,
          color: "error",
        });
      } finally {
        this.generatingPdf = false;
      }
    },
  },
};
</script>

<style scoped>
.payslip-preview-content {
  padding: 20px;
  background-color: #f5f5f5;
}

.payslip-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.payslip-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
}

.payslip-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eaeaea;
}

.payslip-title {
  text-align: center;
  margin-bottom: 20px;
}

.payslip-title h3 {
  font-size: 18px;
  color: #333;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.employee-details {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-item {
  flex: 1;
}

.label {
  font-weight: 600;
  color: #555;
  margin-right: 5px;
}

.value {
  color: #333;
}

.salary-details {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.salary-section {
  flex: 1;
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
}

.salary-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 8px;
}

.salary-items {
  display: flex;
  flex-direction: column;
}

.salary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.salary-item.total {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ccc;
  font-weight: 600;
}

.item-name {
  color: #555;
}

.item-value {
  color: #333;
}

.net-salary {
  background-color: #4776e6;
  color: white;
  border-radius: 6px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.net-salary-label {
  font-size: 18px;
  font-weight: 600;
}

.net-salary-value {
  font-size: 22px;
  font-weight: 700;
}

.attendance-summary {
  margin-top: 20px;
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
}

.attendance-summary h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 8px;
}

.attendance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.attendance-item {
  display: flex;
  flex-direction: column;
}

.attendance-label {
  font-weight: 600;
  color: #555;
  font-size: 12px;
}

.attendance-value {
  color: #333;
  font-size: 14px;
}

.payslip-footer {
  text-align: center;
  color: #777;
  font-size: 12px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eaeaea;
}

.payslip-footer p {
  margin: 5px 0;
}

@media print {
  .payslip-container {
    box-shadow: none;
    padding: 0;
  }
}
</style>
