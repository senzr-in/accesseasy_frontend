// src/composables/workorder/fieldTrips/useFieldTripExport.js
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function useFieldTripExport() {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const API_TOKEN = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();

  const exportFieldTrips = async (format = "csv", filters = {}) => {
    console.log("export field ops", exportFieldTrips);
    try {
      const url = new URL(`${API_BASE_URL}/items/tasks`);
      url.searchParams.append("filter[tenant][tenantId][_eq]", tenantId);
      url.searchParams.append("filter[tripType][_nnull]", "true");
      url.searchParams.append("limit", "-1");

      // Fields to include
      const fields = [
        "id",
        "title",
        "employeeId.employeeId",
        "employeeId.assignedUser.first_name",
        "taskType",
        "dueTime",
        "from",
        "status",
        "orgId.orgName",
        "distanceKm",
        "purpose",
        "tripType",
        "lat",
        "lng",
        "currentLat",
        "currentLng",
      ];
      fields.forEach((field) => url.searchParams.append("fields[]", field));

      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        url.searchParams.append(key, value);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch field trip data");

      const { data } = await response.json();

      const formattedData = data.map((trip) => ({
        ID: trip.id,
        Title: trip.title || "",
        "Employee ID": trip.employeeId?.employeeId || "",
        "Employee Name": trip.employeeId?.assignedUser?.first_name || "",
        "Task Type": trip.taskType || "",
        "From Date": trip.from || "",
        "Due Time": trip.dueTime || "",
        Status: trip.status || "",
        Organization: trip.orgId?.orgName || "",
        "Distance (km)": trip.distanceKm || "",
        Purpose: trip.purpose || "",
        "Trip Type": trip.tripType || "",
        "Start Lat": trip.lat || "",
        "Start Lng": trip.lng || "",
        "Current Lat": trip.currentLat || "",
        "Current Lng": trip.currentLng || "",
      }));

      if (format === "csv") {
        exportToCSV(formattedData);
      } else if (format === "excel") {
        exportToExcel(formattedData);
      } else if (format === "pdf") {
        exportToPDF(formattedData);
      } else {
        throw new Error("Invalid export format selected");
      }
    } catch (err) {
      console.error("Field Trip Export Error:", err);
      alert("Export failed: " + err.message);
    }
  };

  const exportToCSV = (data) => {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));

    for (const row of data) {
      const values = headers.map(
        (header) => `"${String(row[header] || "").replace(/"/g, '""')}"`,
      );
      csvRows.push(values.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, "FieldTrips.csv");
  };

  const exportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Field Trips");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, "FieldTrips.xlsx");
  };

  const exportToPDF = (data) => {
    const doc = new jsPDF();
    const headers = [Object.keys(data[0])];
    const rows = data.map((trip) => Object.values(trip));

    autoTable(doc, {
      head: headers,
      body: rows,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [22, 160, 133] },
      startY: 10,
    });

    doc.save("FieldTrips.pdf");
  };

  return {
    exportFieldTrips,
  };
}
