import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Helper functions for formatting data
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch (e) {
    return "Invalid Date";
  }
};

const formatStatus = (status) => {
  if (!status) return "Unknown";
  switch (status.toLowerCase()) {
    case "inprogress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "pending":
      return "Pending";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

const formatTaskType = (type) => {
  if (!type) return "Unknown";
  switch (type) {
    case "siteVisit":
      return "Site Visit";
    case "moneyCollection":
      return "Money Collection";
    case "installation":
      return "Installation";
    case "service":
      return "Service";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

/**
 * Formats raw task data into a human-readable format for export.
 * Only exports one row per task with essential fields.
 * @param {Array} rawData - The raw task data from the API.
 * @returns {Array} Formatted data with proper headers.
 */
export const getFormattedExportData = (rawData) => {
  return rawData.map((task) => {
    // Get Task ID and Task Status from dynamicFields if available
    let taskId = "N/A";
    let taskStatus = "N/A";

    if (task.dynamicFields?.tasks?.length > 0) {
      // Get the first task's ID and status
      taskId = task.dynamicFields.tasks[0].taskId || "N/A";
      taskStatus = formatStatus(task.dynamicFields.tasks[0].status);
    }

    return {
      // "Task Type": formatTaskType(task.taskType),
      Status: formatStatus(task.status),
      Title: task.title || "Untitled Task",
      // Description: task.description || "No description available",
      "Employee ID": task.employeeId?.employeeId || "N/A",
      "Assigned User":
        task.employeeId?.assignedUser?.first_name || "Unassigned",
      "Due Time": formatDate(task.dueTime),
      From: formatDate(task.from),
      "Task Priority": task.task_priority
        ? task.task_priority.charAt(0).toUpperCase() +
          task.task_priority.slice(1)
        : "N/A",
      "Organization Name": task.orgId?.orgName || "N/A",
      "Location Name": task.orgLocation?.locdetail?.locationName || "N/A",
      Address: task.orgLocation?.locdetail?.address || "N/A",
      // "Location Size": task.orgLocation?.locSize || "N/A",
      "Contact Person":
        task.orgLocation?.contactDetails?.contactPerson || "N/A",
      Ratings: task.ratings !== null ? task.ratings : "N/A",
      // "Contact Number":
      //   task.orgLocation?.contactDetails?.contactNumber || "N/A",
      // Email: task.orgLocation?.contactDetails?.Email || "N/A",
    };
  });
};

/**
 * Generates a consistent filename for exported reports.
 * @param {string} type - The file type (e.g., 'csv', 'excel', 'pdf').
 * @returns {string} The generated filename.
 */
export const generateFileName = (type) => {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0].replace(/:/g, "");
  let extension = type;
  if (type === "excel") {
    extension = "xlsx";
  }
  return `WorkOrders_Report_${date}_${time}.${extension}`;
};

/**
 * Exports data to a CSV file.
 * @param {Array} data - The formatted data to export.
 * @param {string} filename - The desired filename.
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }
  const header = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((value) => {
        const stringValue = String(value);
        return `"${stringValue.replace(/"/g, '""')}"`; // Escape double quotes
      })
      .join(","),
  );
  const csvContent = [header, ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert(
      "Your browser does not support downloading files directly. Please copy the content manually.",
    );
    console.log(csvContent);
  }
};

/**
 * Exports data to an Excel file (requires 'xlsx' library).
 * @param {Array} data - The formatted data to export.
 * @param {string} filename - The desired filename.
 */
export const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(data);

  // Define column widths for the essential columns
  ws["!cols"] = [
    // { wpx: 100 }, // Task Type
    { wpx: 80 }, // Status
    { wpx: 100 }, // Title
    // { wpx: 200 }, // Description
    { wpx: 80 }, // Employee ID
    { wpx: 120 }, // Assigned User
    { wpx: 100 }, // Due Time
    { wpx: 100 }, // From
    { wpx: 80 }, // Task Priority
    { wpx: 150 }, // Organization Name
    { wpx: 120 }, // Location Name
    { wpx: 200 }, // Address
    // { wpx: 80 }, // Location Size
    { wpx: 100 }, // Contact Person
    { wpx: 60 }, // Ratings
    // { wpx: 100 }, // Contact Number
    // { wpx: 120 }, // Email
  ];

  // Apply styling (bold headers, borders, alignment)
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = { c: C, r: R };
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      if (!ws[cellRef]) continue;

      ws[cellRef].s = {
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
        alignment: {
          horizontal: "left",
          vertical: "middle",
        },
      };

      // Bold headers
      if (R === 0) {
        ws[cellRef].s.font = { bold: true };
        ws[cellRef].s.fill = { fgColor: { rgb: "D3D3D3" } }; // Light gray background
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Work Orders");
  XLSX.writeFile(wb, filename, { bookType: "xlsx", type: "buffer" });
};

/**
 * Exports data to a PDF file (requires 'jspdf' and 'jspdf-autotable' libraries).
 * @param {Array} data - The formatted data to export.
 * @param {string} filename - The desired filename.
 */
export const exportToPDF = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  const doc = new jsPDF("landscape");

  const headers = Object.keys(data[0]);
  const body = data.map((row) => headers.map((h) => row[h]));

  const now = new Date();
  const generationDate = now.toLocaleString();

  doc.autoTable({
    head: [headers],
    body: body,
    startY: 20,
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      overflow: "linebreak",
      halign: "left",
      valign: "middle",
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [71, 85, 105],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      Description: { minCellWidth: 35, cellWidth: "auto" },
      "Organization Name": { minCellWidth: 25, cellWidth: "auto" },
      Address: { minCellWidth: 25, cellWidth: "auto" },
      Title: { minCellWidth: 20, cellWidth: "auto" },
    },
    tableWidth: "auto",
    didDrawPage: (data) => {
      let str = "Page " + doc.internal.getNumberOfPages();
      if (typeof doc.putTotalPages === "function") {
        str = str + " of " + doc.putTotalPages();
      }
      doc.setFontSize(8);
      doc.text(
        str,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10,
      );
      doc.text(
        `Generated: ${generationDate}`,
        doc.internal.pageSize.width - data.settings.margin.right,
        doc.internal.pageSize.height - 10,
        { align: "right" },
      );
    },
  });

  if (typeof doc.putTotalPages === "function") {
    doc.putTotalPages(doc.internal.getNumberOfPages());
  }

  doc.save(filename);
};
