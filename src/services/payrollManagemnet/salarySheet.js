import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import axios from "axios";
import crypto from "crypto-js";

const BATCH_SIZE = 100;

// Encryption/Decryption functions
const ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function checkIfEncrypted(text) {
  if (!text || typeof text !== "string") return false;
  const parts = text.split(":");
  if (parts.length !== 2) return false;
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(parts[0]) && hexRegex.test(parts[1]);
}

function decryptData(encryptedText) {
  try {
    if (!encryptedText || typeof encryptedText !== "string") {
      return encryptedText || "";
    }

    if (!checkIfEncrypted(encryptedText)) {
      return encryptedText;
    }

    const textParts = encryptedText.split(":");
    const iv = textParts[0];
    const encryptedData = textParts[1];

    const ivWordArray = crypto.enc.Hex.parse(iv);
    const keyWordArray = crypto.enc.Hex.parse(ENCRYPTION_KEY);
    const ciphertext = crypto.enc.Hex.parse(encryptedData);

    const cipherParams = crypto.lib.CipherParams.create({
      ciphertext: ciphertext,
    });

    const decrypted = crypto.AES.decrypt(cipherParams, keyWordArray, {
      iv: ivWordArray,
      mode: crypto.mode.CBC,
      padding: crypto.pad.Pkcs7,
    });

    return decrypted.toString(crypto.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return encryptedText;
  }
}

export async function downloadSalarySheet(
  selectedItems,
  currentMonth,
  currentYear,
  token,
  options = {},
) {
  try {
    if (options.onProgress) {
      options.onProgress({
        current: 0,
        total: selectedItems.length,
        percentage: 5,
        message: "Starting download...",
      });
    }

    const startDate =
      options.startDate ||
      `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`;
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    const endDate =
      options.endDate ||
      `${currentYear}-${currentMonth.toString().padStart(2, "0")}-${lastDay}`;

    const employeeIds = selectedItems.map((item) => item.employee.id);

    if (options.onProgress) {
      options.onProgress({
        current: 0,
        total: selectedItems.length,
        percentage: 10,
        message: "Fetching employee details...",
      });
    }

    const employeeDetailsMap = await fetchEmployeeDetailsInBatch(
      employeeIds,
      token,
      options.cancelToken,
    );

    if (options.onProgress) {
      options.onProgress({
        current: 0,
        total: selectedItems.length,
        percentage: 30,
        message: "Fetching verification data...",
      });
    }

    const verificationDataMap = await fetchVerificationDataInBatch(
      employeeIds,
      currentMonth,
      currentYear,
      token,
      options.cancelToken,
      startDate,
      endDate,
    );

    if (options.onProgress) {
      options.onProgress({
        current: 0,
        total: selectedItems.length,
        percentage: 60,
        message: "Processing data...",
      });
    }

    const detailedEmployeeData = selectedItems.map((item, index) => {
      const employeeId = item.employee.id;

      if (options.onProgress && index % 5 === 0) {
        options.onProgress({
          current: index + 1,
          total: selectedItems.length,
          percentage:
            60 + Math.round(((index + 1) / selectedItems.length) * 30),
          message: `Processing employee ${index + 1} of ${selectedItems.length}...`,
        });
      }

      return {
        ...item,
        employeeDetails: employeeDetailsMap[employeeId] || {},
        verificationData: verificationDataMap[employeeId] || {},
      };
    });

    if (options.onProgress) {
      options.onProgress({
        current: selectedItems.length,
        total: selectedItems.length,
        percentage: 95,
        message: "Generating Excel file...",
      });
    }

    const allEarnings = new Set();
    const allDeductions = new Set();
    const allPenalties = new Set();
    const allBenefits = new Set();

    detailedEmployeeData.forEach((item) => {
      Object.keys(item.verificationData?.earnings || {}).forEach((key) =>
        allEarnings.add(`Earning: ${key}`),
      );
      Object.keys(item.verificationData?.deductions || {}).forEach((key) =>
        allDeductions.add(`Deduction: ${key}`),
      );
      Object.keys(item.verificationData?.penalties || {}).forEach((key) =>
        allPenalties.add(`Penalty: ${key}`),
      );
      Object.keys(item.verificationData?.benefits || {}).forEach((key) =>
        allBenefits.add(`Benefit: ${key}`),
      );
      Object.entries(item.verificationData?.individualDeduction || {}).forEach(
        ([key, val]) => {
          if (typeof val === "object" && val !== null) {
            const amount = val[Object.keys(val)[0]];
            allDeductions.add(`Individual Deduction: ${key}`);
          } else {
            allDeductions.add(`Individual Deduction: ${key}`);
          }
        },
      );
      Object.entries(item.verificationData?.salaryArrears || {}).forEach(
        ([key, val]) => {
          if (typeof val === "object" && val !== null) {
            const innerKey = Object.keys(val)[0];
            allDeductions.add(`Salary Arrear: ${innerKey}`);
          } else {
            allDeductions.add(`Salary Arrear: ${key}`);
          }
        },
      );
    });

    const fixedColumnOrder = [
      "Employee ID",
      "Employee Name",
      "Gender",
      "Department",
      "Branch",
      "State",
      "Designation",
      "Role",
      "Attendance Status",
      "Salary Status",
      "PAN",
      "UAN",
      "Bank Name",
      "IFSC",
      "Account Number",
      "UPI",
      "PF Account",
      "ESI Account",
      "Total Payable Days",
      "Monthly CTC",
      ...Array.from(allEarnings),
      "Total Earnings",
      ...Array.from(allBenefits),
      "Total Benefits",
      ...Array.from(allDeductions),
      "Total Deductions",
      "Net Salary",
      ...Array.from(allPenalties),
      "Paid Amount",
      "Pending Amount",
      "startDate",
      "endDate",
      "finalizeDate",
    ];

    const excelData = detailedEmployeeData.map((item) => {
      const raw = {};

      // Basic fields
      raw["Employee ID"] = item.employeeDetails?.employeeId || "";
      raw["Employee Name"] = item.employee?.assignedUser?.first_name || "";
      raw["Designation"] = item.employeeDetails?.designation || "";
      raw["Gender"] = item.employeeDetails?.Gender || "";
      raw["PAN"] = decryptData(item.employeeDetails?.pan || "");
      raw["UAN"] = decryptData(item.employeeDetails?.UAN || "");
      raw["Bank Name"] = item.employeeDetails?.bankName || "";
      raw["IFSC"] = decryptData(item.employeeDetails?.IFSC || "");
      raw["Account Number"] = item.employeeDetails?.accountNumber || "";
      raw["UPI"] = item.employeeDetails?.UPI || "";
      raw["PF Account"] = item.employeeDetails?.PFAccountNumber || "";
      raw["ESI Account"] = item.employeeDetails?.ESIAccountNumber || "";

      raw["Department"] = item.employeeDetails?.department || "";
      raw["Branch"] = item.employeeDetails?.branch || "";
      raw["State"] = item.employeeDetails?.state || "";
      raw["Role"] = item.employee?.assignedUser?.role?.name || "";
      raw["Attendance Status"] = item.verificationData?.attendaceVerification
        ? "Verified"
        : "Unverified";
      raw["Salary Status"] = item.verificationData?.salaryVerification
        ? "Verified"
        : "Unverified";

      // Attendance
      const attendance = item.verificationData?.totalAttendanceCount;
      if (attendance) {
        try {
          const parsed =
            typeof attendance === "string"
              ? JSON.parse(attendance)
              : attendance;
          raw["Total Payable Days"] = parsed.totalPayableDays || 0;
        } catch {
          raw["Total Payable Days"] = 0;
        }
      }

      // Salaries - format as whole numbers
      raw["Monthly CTC"] = item.verificationData?.ctc
        ? Math.round(Number.parseFloat(item.verificationData.ctc))
        : 0;
      raw["Net Salary"] = item.verificationData?.netSalary
        ? Math.round(Number.parseFloat(item.verificationData.netSalary))
        : 0;

      raw["PF Account"] = item.employeeDetails?.PFAccountNumber || "";
      raw["ESI Account"] = item.employeeDetails?.ESIAccountNumber || "";

      // Earnings - format as whole numbers
      Object.entries(item.verificationData?.earnings || {}).forEach(
        ([key, value]) =>
          (raw[`Earning: ${key}`] = value
            ? Math.round(Number.parseFloat(value))
            : 0),
      );

      raw["Total Earnings"] = item.verificationData?.totalEarnings
        ? Math.round(Number.parseFloat(item.verificationData.totalEarnings))
        : 0;

      raw["Total Benefits"] = item.verificationData?.totalBenefits
        ? Math.round(Number.parseFloat(item.verificationData.totalBenefits))
        : 0;

      // Deductions - format as whole numbers
      Object.entries(item.verificationData?.deductions || {}).forEach(
        ([key, value]) =>
          (raw[`Deduction: ${key}`] = value
            ? Math.round(Number.parseFloat(value))
            : 0),
      );
      Object.entries(item.verificationData?.individualDeduction || {}).forEach(
        ([key, value]) => {
          if (typeof value === "object" && value !== null) {
            const amount = value[Object.keys(value)[0]];
            raw[`Individual Deduction: ${key}`] = amount
              ? Math.round(Number.parseFloat(amount))
              : 0;
          } else {
            raw[`Individual Deduction: ${key}`] = value
              ? Math.round(Number.parseFloat(value))
              : 0;
          }
        },
      );
      Object.entries(item.verificationData?.salaryArrears || {}).forEach(
        ([key, value]) => {
          if (typeof value === "object" && value !== null) {
            const innerKey = Object.keys(value)[0];
            const amount = value[innerKey];
            raw[`Salary Arrear: ${innerKey}`] = amount
              ? Math.round(Number.parseFloat(amount))
              : 0;
          } else {
            raw[`Salary Arrear: ${key}`] = value
              ? Math.round(Number.parseFloat(value))
              : 0;
          }
        },
      );

      raw["Total Deductions"] = item.verificationData?.totalOtherDeduction
        ? Math.round(
            Number.parseFloat(item.verificationData.totalOtherDeduction),
          )
        : 0;
      // Penalties & Benefits - format as whole numbers
      Object.entries(item.verificationData?.penalties || {}).forEach(
        ([key, value]) =>
          (raw[`Penalty: ${key}`] = value
            ? Math.round(Number.parseFloat(value))
            : 0),
      );
      Object.entries(item.verificationData?.benefits || {}).forEach(
        ([key, value]) =>
          (raw[`Benefit: ${key}`] = value
            ? Math.round(Number.parseFloat(value))
            : 0),
      );

      // Final payment details - format as whole numbers
      raw["Paid Amount"] = item.salaryPaid
        ? Math.round(Number.parseFloat(item.salaryPaid))
        : 0;
      raw["Pending Amount"] = item.salaryPending
        ? Math.round(Number.parseFloat(item.salaryPending))
        : 0;
      raw["startDate"] = item.verificationData?.startDate || "";
      raw["endDate"] = item.verificationData?.endDate || "";
      raw["finalizeDate"] = item.verificationData?.finalizeDate || "";

      const orderedRow = {};
      fixedColumnOrder.forEach((col) => {
        orderedRow[col] = raw[col] ?? "";
      });

      return orderedRow;
    });

    const filterInfo = [];

    if (options.startDate && options.endDate) {
      filterInfo.push({
        "Filter Type": "Date Range",
        "Filter Value": `${options.startDate} to ${options.endDate}`,
      });
    }

    if (options.filters?.branch && options.filters.branch.length > 0) {
      filterInfo.push({
        "Filter Type": "Branch",
        "Filter Value": options.filters.branch.join(", "),
      });
    }

    if (options.filters?.department && options.filters.department.length > 0) {
      filterInfo.push({
        "Filter Type": "Department",
        "Filter Value": options.filters.department.join(", "),
      });
    }

    if (options.filters?.attendanceVerification !== null) {
      filterInfo.push({
        "Filter Type": "Attendance Verification",
        "Filter Value": options.filters.attendanceVerification
          ? "Verified"
          : "Unverified",
      });
    }

    if (options.filters?.salaryVerification !== null) {
      filterInfo.push({
        "Filter Type": "Salary Verification",
        "Filter Value": options.filters.salaryVerification
          ? "Verified"
          : "Unverified",
      });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const colWidths = [];
    excelData.forEach((row) => {
      Object.keys(row).forEach((key, i) => {
        const value = String(row[key] || "");
        colWidths[i] = Math.max(colWidths[i] || 0, key.length, value.length);
      });
    });

    worksheet["!cols"] = colWidths.map((width) => ({
      width: Math.min(width + 2, 50),
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Sheet");

    if (filterInfo.length > 0) {
      const filterWorksheet = XLSX.utils.json_to_sheet(filterInfo);
      XLSX.utils.book_append_sheet(
        workbook,
        filterWorksheet,
        "Applied Filters",
      );
    }

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `salary-sheet-${currentMonth}-${currentYear}.xlsx`);

    if (options.onProgress) {
      options.onProgress({
        current: selectedItems.length,
        total: selectedItems.length,
        percentage: 100,
        message: "Download complete!",
      });
    }
  } catch (error) {
    console.error("Error generating salary sheet:", error);
    throw error;
  }
}

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

async function fetchEmployeeDetailsInBatch(employeeIds, token, cancelToken) {
  try {
    if (!employeeIds || employeeIds.length === 0) {
      return {};
    }

    const employeeDetailsMap = {};
    const idChunks = chunkArray(employeeIds, BATCH_SIZE);

    for (let i = 0; i < idChunks.length; i++) {
      const chunk = idChunks[i];
      const employeeIdsStr = chunk.join(",");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/items/personalModule`,
        {
          params: {
            "filter[id][_in]": employeeIdsStr,
            fields: [
              "id",
              "employeeId",
              "assignedUser.first_name",
              "assignedUser.pan",
              "assignedUser.UAN",
              "assignedUser.PFAccountNumber",
              "assignedUser.ESIAccountNumber",
              "branchLocation.locdetail.locationName",
              "branchLocation.state",
              "department.departmentName",
              "assignedUser.gender",
              "assignedUser.bankName",
              "assignedUser.IFSC",
              "assignedUser.accountNumber",
              "assignedUser.UPI",
              "assignedUser.designation",
            ],
            limit: -1,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cancelToken: cancelToken,
        },
      );

      if (response.data && response.data.data) {
        response.data.data.forEach((employee) => {
          employeeDetailsMap[employee.id] = {
            designation: employee.assignedUser?.designation || "",
            pan: employee.assignedUser?.pan || "",
            UAN: employee.assignedUser?.UAN || "",
            Gender: employee.assignedUser?.gender || "",
            PFAccountNumber: employee.assignedUser?.PFAccountNumber || "",
            ESIAccountNumber: employee.assignedUser?.ESIAccountNumber || "",
            department: employee.department?.departmentName || "",
            branch: employee.branchLocation?.locdetail?.locationName || "",
            state: employee.branchLocation?.state || "",
            employeeId: employee.employeeId || "",
            bankName: employee.assignedUser?.bankName || "",
            IFSC: employee.assignedUser?.IFSC || "",
            accountNumber: employee.assignedUser?.accountNumber || "",
            UPI: employee.assignedUser?.UPI || "",
          };
        });
      }
    }

    return employeeDetailsMap;
  } catch (error) {
    console.error("Error fetching employee details in batch:", error);
    return {};
  }
}

async function fetchVerificationDataInBatch(
  employeeIds,
  month,
  year,
  token,
  cancelToken,
  startDate,
  endDate,
) {
  try {
    if (!employeeIds || employeeIds.length === 0) {
      return {};
    }

    const verificationDataMap = {};
    const idChunks = chunkArray(employeeIds, BATCH_SIZE);

    for (let i = 0; i < idChunks.length; i++) {
      const chunk = idChunks[i];
      const employeeIdsStr = chunk.join(",");

      const params = {
        "filter[employee][id][_in]": employeeIdsStr,
        fields: [
          "id",
          "employee.id",
          "attendaceVerification",
          "salaryVerification",
          "ctc",
          "payableDays",
          "netSalary",
          "earnings",
          "deductions",
          "penalties",
          "benefits",
          "startDate",
          "endDate",
          "totalAttendanceCount",
          "individualDeduction",
          "salaryArrears",
          "totalEarnings",
          "totalBenefits",
          "totalOtherDeduction",
          "finalizeDate",
        ],
        limit: -1,
      };

      if (startDate && endDate) {
        params["filter[startDate][_between][0]"] = startDate;
        params["filter[startDate][_between][1]"] = endDate;
      } else {
        params["filter[month(endDate)][_eq]"] = month;
        params["filter[year(endDate)][_eq]"] = year;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/items/payrollVerification`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cancelToken: cancelToken,
        },
      );

      if (response.data && response.data.data) {
        response.data.data.forEach((verification) => {
          if (verification.employee && verification.employee.id) {
            verificationDataMap[verification.employee.id] = verification;
          }
        });
      }
    }

    return verificationDataMap;
  } catch (error) {
    console.error("Error fetching verification data in batch:", error);
    return {};
  }
}

async function fetchEmployeeDetails(employeeId, token, cancelToken) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${employeeId}`,
      {
        params: {
          fields: [
            "employeeId",
            "assignedUser.first_name",
            "assignedUser.pan",
            "assignedUser.UAN",
            "assignedUser.PFAccountNumber",
            "assignedUser.ESIAccountNumber",
            "branchLocation.locdetail.locationName",
            "branchLocation.state",
            "department.departmentName",
            "assignedUser.gender",
            "assignedUser.bankName",
            "assignedUser.IFSC",
            "assignedUser.accountNumber",
            "assignedUser.UPI",
            "assignedUser.designation",
          ],
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cancelToken: cancelToken,
      },
    );

    const data = response.data.data;
    return {
      pan: data.assignedUser?.pan || "",
      UAN: data.assignedUser?.UAN || "",
      Gender: data.assignedUser?.gender || "",
      PFAccountNumber: data.assignedUser?.PFAccountNumber || "",
      ESIAccountNumber: data.assignedUser?.ESIAccountNumber || "",
      department: data.department?.departmentName || "",
      branch: data.branchLocation?.locdetail?.locationName || "",
      state: data.branchLocation?.state || "",
      employeeId: data.employeeId || "",
    };
  } catch (error) {
    console.error("Error fetching employee details:", error);
    return {};
  }
}

async function fetchEmployeeAttendanceData(
  employeeId,
  month,
  year,
  token,
  cancelToken,
  customStartDate,
  customEndDate,
) {
  try {
    const startDate =
      customStartDate || `${year}-${month.toString().padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate =
      customEndDate ||
      `${year}-${month.toString().padStart(2, "0")}-${lastDay}`;

    const verificationResponse = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/payrollVerification`,
      {
        params: {
          "filter[_and][0][employee][id][_eq]": employeeId,
          "filter[_and][1][startDate][_between][0]": startDate,
          "filter[_and][1][startDate][_between][1]": endDate,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cancelToken: cancelToken,
      },
    );

    const verificationData = verificationResponse.data.data[0] || {};
    let attendanceData = {};

    if (verificationData.totalAttendanceCount) {
      try {
        const parsedData =
          typeof verificationData.totalAttendanceCount === "string"
            ? JSON.parse(verificationData.totalAttendanceCount)
            : verificationData.totalAttendanceCount;

        attendanceData = {
          present: parsedData.present || 0,
          absent: parsedData.absent || 0,
          halfDay: parsedData.halfDay || 0,
          weekoff: parsedData.weekOff || 0,
          holiday: parsedData.holiday || 0,
          workFromHome: parsedData.workFromHome || 0,
          unpaidLeave: parsedData.unpaidLeave || 0,
          leave: parsedData.paidLeave || 0,
          casualLeave: 0,
          sickLeave: 0,
          privilegedLeave: 0,
          totalPayableDays: parsedData.totalPayableDays || 0,
        };
      } catch (error) {
        console.error("Error parsing totalAttendanceCount:", error);
      }
    }

    return attendanceData;
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return {};
  }
}

async function fetchVerificationData(
  employeeId,
  month,
  year,
  token,
  cancelToken,
  startDate,
  endDate,
) {
  try {
    const params = {
      "filter[_and][0][employee][id][_eq]": employeeId,
      fields: [
        "id",
        "employee.id",
        "attendaceVerification",
        "salaryVerification",
        "ctc",
        "payableDays",
        "netSalary",
        "earnings",
        "deductions",
        "individualDeduction",
        "salaryArrears",
        "penalties",
        "benefits",
        "startDate",
        "endDate",
        "totalAttendanceCount",
        "finalizeDate",
      ],
    };

    if (startDate && endDate) {
      params["filter[_and][1][startDate][_between][0]"] = startDate;
      params["filter[_and][1][startDate][_between][1]"] = endDate;
    } else {
      params["filter[_and][1][month(endDate)][_eq]"] = month;
      params["filter[_and][2][year(endDate)][_eq]"] = year;
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/payrollVerification`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cancelToken: cancelToken,
      },
    );
    return response.data.data[0] || {};
  } catch (error) {
    console.error("Error fetching verification data:", error);
    return {};
  }
}
