import jsPDF from "jspdf";
import "jspdf-autotable";
import { useTaskCompletionApi } from "./useTaskCompletionApi";

export const usePdfGenerator = () => {
  const { fetchTaskImageBlob } = useTaskCompletionApi();

  const convertImageToBase64 = async (imageUrl) => {
    try {
      if (imageUrl.startsWith("blob:")) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const format = blob.type.startsWith("image/")
          ? blob.type.split("/")[1].toUpperCase()
          : "JPEG";
        const forcedBlob = blob.type.startsWith("image/")
          ? blob
          : new Blob([blob], { type: "image/jpeg" });
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result;
            resolve({ dataUrl, format });
          };
          reader.onerror = reject;
          reader.readAsDataURL(forcedBlob);
        });
      }
      return { dataUrl: imageUrl, format: "PNG" };
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return null;
    }
  };

  const fetchImageAsBase64 = async (imageId) => {
    try {
      const result = await fetchTaskImageBlob(imageId);
      if (result.success && result.data?.url) {
        return await convertImageToBase64(result.data.url);
      }
      return null;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  const addHeader = async (doc, tenantData, logoId, jobsheetName = null) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add logo or company initial
    if (logoId) {
      try {
        const logoData = await fetchImageAsBase64(logoId);

        if (logoData) {
          doc.addImage(logoData.dataUrl, logoData.format, 15, 10, 25, 25);
        }
      } catch (error) {
        console.error("Error adding logo:", error);
        doc.setFillColor(0, 102, 204);
        doc.circle(27.5, 22.5, 12.5, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text(tenantData.companyName?.charAt(0) || "C", 27.5, 25, {
          align: "center",
        });
      }
    } else {
      doc.setFillColor(0, 102, 204);
      doc.circle(27.5, 22.5, 12.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(tenantData.companyName?.charAt(0) || "C", 27.5, 25, {
        align: "center",
      });
    }

    // Company name
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(tenantData.companyName || "Company Name", pageWidth - 15, 20, {
      align: "right",
    });

    // Current date below company name
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Generated At: ${currentDate}`, pageWidth - 15, 27, {
      align: "right",
    });

    // Blue header bar with title
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 40, pageWidth, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    // Show jobsheet name if provided, otherwise show "Job Details Report"
    const headerTitle = jobsheetName
      ? `Jobsheet: ${jobsheetName}`
      : "Job Details Report";
    doc.text(headerTitle, pageWidth / 2, 47, { align: "center" });

    return 55;
  };

  const addOverviewSection = (doc, taskDetails, locationDetails, yPos) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    yPos += 8;

    const leftColX = 15;
    const rightColX = pageWidth / 2 + 5;

    doc.setFontSize(9);

    let leftY = yPos;

    doc.setFont("helvetica", "bold");
    doc.text("Task Type:", leftColX, leftY);
    doc.setFont("helvetica", "normal");
    doc.text(String(taskDetails.taskType || "N/A"), leftColX + 25, leftY);
    leftY += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Assigned To:", leftColX, leftY);
    doc.setFont("helvetica", "normal");
    doc.text(String(taskDetails.assignedTo || "N/A"), leftColX + 25, leftY);
    leftY += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Start Date:", leftColX, leftY);
    doc.setFont("helvetica", "normal");
    doc.text(String(taskDetails.startDate || "N/A"), leftColX + 25, leftY);
    leftY += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Priority:", leftColX, leftY);
    doc.setFont("helvetica", "normal");
    doc.text(String(taskDetails.priority || "N/A"), leftColX + 25, leftY);
    leftY += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Location:", leftColX, leftY);
    doc.setFont("helvetica", "normal");
    const locationText = doc.splitTextToSize(
      String(locationDetails.locationName || "N/A"),
      pageWidth / 2 - 35,
    );
    doc.text(locationText, leftColX + 22, leftY);
    leftY += locationText.length * 5;

    doc.setFont("helvetica", "bold");
    doc.text("Metro Range:", leftColX, leftY);
    doc.setFont("helvetica", "normal");
    doc.text(String(locationDetails.locSize || "N/A"), leftColX + 27, leftY);
    leftY += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Contact Number:", leftColX, leftY);
    doc.setFont("helvetica", "normal");
    doc.text(
      String(locationDetails.contactNumber || "N/A"),
      leftColX + 35,
      leftY,
    );

    let rightY = yPos;

    doc.setFont("helvetica", "bold");
    doc.text("Job Title:", rightColX, rightY);
    doc.setFont("helvetica", "normal");
    const titleText = doc.splitTextToSize(
      String(taskDetails.title || "N/A"),
      pageWidth / 2 - 35,
    );
    doc.text(titleText, rightColX + 23, rightY);
    rightY += titleText.length * 5;

    doc.setFont("helvetica", "bold");
    doc.text("Employee ID:", rightColX, rightY);
    doc.setFont("helvetica", "normal");
    doc.text(
      String(taskDetails.employeeIdDisplay || "N/A"),
      rightColX + 27,
      rightY,
    );
    rightY += 6;

    doc.setFont("helvetica", "bold");
    doc.text("End Date:", rightColX, rightY);
    doc.setFont("helvetica", "normal");
    doc.text(String(taskDetails.dueDate || "N/A"), rightColX + 23, rightY);
    rightY += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Status:", rightColX, rightY);
    doc.setFont("helvetica", "normal");
    doc.text(String(taskDetails.status || "N/A"), rightColX + 15, rightY);
    rightY += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Address:", rightColX, rightY);
    doc.setFont("helvetica", "normal");
    const addressText = doc.splitTextToSize(
      String(locationDetails.address || "N/A"),
      pageWidth / 2 - 30,
    );
    doc.text(addressText, rightColX + 20, rightY);
    rightY += addressText.length * 5;

    doc.setFont("helvetica", "bold");
    doc.text("Supervisor Name:", rightColX, rightY);
    doc.setFont("helvetica", "normal");
    doc.text(
      String(locationDetails.supervisor || "N/A"),
      rightColX + 37,
      rightY,
    );
    rightY += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Email:", rightColX, rightY);
    doc.setFont("helvetica", "normal");
    doc.text(String(locationDetails.email || "N/A"), rightColX + 15, rightY);

    return Math.max(leftY, rightY) + 10;
  };

  const formatGPSValue = (gpsData) => {
    if (!gpsData) return "N/A";

    // Check if it's an object with lat/lng
    if (typeof gpsData === "object" && gpsData.lat && gpsData.lng) {
      const lat = parseFloat(gpsData.lat).toFixed(6);
      const lng = parseFloat(gpsData.lng).toFixed(6);
      let result = `Lat: ${lat}, Lng: ${lng}`;

      // Add timestamp if available
      if (gpsData.timestamp) {
        try {
          const date = new Date(gpsData.timestamp);
          const formattedDate = date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          result += `\nTime: ${formattedDate}`;
        } catch (e) {
          console.error("Error formatting timestamp:", e);
        }
      }

      // Add radius if available
      if (gpsData.radius_range) {
        result += `\nRadius: ${gpsData.radius_range}m`;
      }

      return result;
    }

    // If it's a string, try to parse it
    if (typeof gpsData === "string") {
      try {
        const parsed = JSON.parse(gpsData);
        return formatGPSValue(parsed);
      } catch (e) {
        // If parsing fails, check if it's a comma-separated lat,lng
        if (gpsData.includes(",")) {
          const parts = gpsData.split(",");
          if (parts.length >= 2) {
            return `Lat: ${parts[0].trim()}, Lng: ${parts[1].trim()}`;
          }
        }
        return gpsData;
      }
    }

    return "N/A";
  };

  const addJobsheetSection = async (doc, jobsWithData, yPos) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerSpace = 35;
    for (const job of jobsWithData) {
      if (yPos > pageHeight - footerSpace - 20) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Jobsheet: ${String(job.job_name || "Unnamed Job")}`, 15, yPos);
      yPos += 8;

      const jobsheetData = [];

      for (const field of job.fields) {
        const fieldType = String(field.field_type || "").toLowerCase();
        if (
          fieldType !== "completion" &&
          fieldType !== "creation/completion" &&
          fieldType !== "creation"
        )
          continue;

        const value = job.taskRef?.fields?.[field.key];

        let displayValue = "N/A";

        if (field.type === "image") {
          if (value) {
            const imageIds = Array.isArray(value) ? value : [value];
            for (const imgId of imageIds) {
              if (
                typeof imgId === "string" &&
                /^[0-9a-f-]{10,}$/i.test(imgId)
              ) {
                const imgData = await fetchImageAsBase64(imgId);

                if (imgData) {
                  jobsheetData.push([
                    String(field.label || "Field"),
                    { content: "Image Attached", image: imgData },
                  ]);
                } else {
                  jobsheetData.push([
                    String(field.label || "Field"),
                    "No Image",
                  ]);
                }
              }
            }
          } else {
            jobsheetData.push([String(field.label || "Field"), "No Image"]);
          }
        } else if (field.type === "signature") {
          if (field.label.toLowerCase().includes("client")) {
            displayValue = "Signature";
            if (job.taskRef?.signature) {
              const imgId = job.taskRef.signature;
              const imgData = await fetchImageAsBase64(imgId);

              if (imgData) {
                jobsheetData.push([
                  String(field.label || "Field"),
                  { content: displayValue, image: imgData },
                ]);
              } else {
                jobsheetData.push([
                  String(field.label || "Field"),
                  displayValue,
                ]);
              }
            } else {
              jobsheetData.push([String(field.label || "Field"), displayValue]);
            }
          } else if (field.label.toLowerCase().includes("employee")) {
            displayValue = job.taskRef?.assignedTo || "Not Assigned";
            jobsheetData.push([String(field.label || "Field"), displayValue]);
          }
        } else if (field.type === "logo") {
          if (value) {
            const imageIds = Array.isArray(value) ? value : [value];
            for (const imgId of imageIds) {
              if (
                typeof imgId === "string" &&
                /^[0-9a-f-]{10,}$/i.test(imgId)
              ) {
                const imgData = await fetchImageAsBase64(imgId);

                if (imgData) {
                  jobsheetData.push([
                    String(field.label || "Field"),
                    { content: "Logo", image: imgData },
                  ]);
                } else {
                  jobsheetData.push([
                    String(field.label || "Field"),
                    "No Logo",
                  ]);
                }
              }
            }
          } else {
            jobsheetData.push([String(field.label || "Field"), "No Logo"]);
          }
        } else if (
          field.type === "gps" ||
          field.type === "gps-currentlocation" ||
          field.key === "user_location" ||
          field.key === "location_field_key" ||
          String(field.label || "")
            .toLowerCase()
            .includes("gps") ||
          String(field.label || "")
            .toLowerCase()
            .includes("location")
        ) {
          // Format GPS value properly
          displayValue = formatGPSValue(value);
          jobsheetData.push([String(field.label || "Field"), displayValue]);
        } else if (field.type === "boolean") {
          displayValue = value ? "Yes" : "No";
          jobsheetData.push([String(field.label || "Field"), displayValue]);
        } else {
          displayValue = value != null && value !== "" ? String(value) : "N/A";
          jobsheetData.push([String(field.label || "Field"), displayValue]);
        }
      }

      if (job.taskRef?.workHours) {
        const { start_time, end_time, total_hours } = job.taskRef.workHours;

        // Format start_time and end_time for better readability
        const formatDateTime = (dateTime) => {
          if (!dateTime) return "N/A";
          try {
            const date = new Date(dateTime);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            });
          } catch (error) {
            console.error("Error formatting date-time:", error);
            return "N/A";
          }
        };

        jobsheetData.push(["Job Started At", formatDateTime(start_time)]);
        jobsheetData.push(["Job Ended At", formatDateTime(end_time)]);
        jobsheetData.push(["Total Worked Hours", total_hours || "N/A"]);
      }

      if (jobsheetData.length > 0) {
        doc.autoTable({
          startY: yPos,
          head: [["Field", "Result"]],
          body: jobsheetData.map((row) => [
            row[0],
            typeof row[1] === "object" ? row[1].content : row[1],
          ]),
          didParseCell: (data) => {
            if (
              data.cell.section === "body" &&
              data.column.index === 1 &&
              data.row.index < jobsheetData.length &&
              jobsheetData[data.row.index] &&
              jobsheetData[data.row.index][1]?.image
            ) {
              data.row.height = 34;
            }
          },
          didDrawCell: (data) => {
            if (
              data.cell.section === "body" &&
              data.column.index === 1 &&
              data.row.index < jobsheetData.length &&
              jobsheetData[data.row.index] &&
              jobsheetData[data.row.index][1]?.image
            ) {
              const imgData = jobsheetData[data.row.index][1].image;
              const imgWidth = 30;
              const imgHeight = 30;

              doc.addImage(
                imgData.dataUrl,
                imgData.format,
                data.cell.x + 2,
                data.cell.y + 2,
                imgWidth,
                imgHeight,
              );
            }
          },
          theme: "grid",
          headStyles: {
            fillColor: [0, 102, 204],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 10,
          },
          bodyStyles: { fontSize: 9, overflow: "linebreak" },
          columnStyles: {
            0: { cellWidth: 60, fontStyle: "bold" },
            1: { cellWidth: "auto" },
          },
          margin: { left: 15, right: 15 },
          pageBreak: "auto",
        });
        yPos = doc.lastAutoTable.finalY + 8;
      }

      yPos += 5;
    }

    return yPos;
  };

  const addNotesSection = async (
    doc,
    notesData,
    taskDetails,
    signature,
    yPos,
  ) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    if (yPos > 220 || !Number.isFinite(yPos)) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Notes & Additional Information", 15, yPos);
    const startY = yPos + 10;

    const leftColX = 15;
    const leftColWidth = pageWidth / 2 - 20;
    const rightColX = pageWidth / 2 + 20;

    let leftY = startY;
    let rightY = startY - 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Completion Notes:", leftColX, leftY);
    leftY += 6;
    doc.setFont("helvetica", "normal");
    const notesText = notesData.notes ? String(notesData.notes) : "N/A";
    const notesLines = doc.splitTextToSize(notesText, leftColWidth);
    doc.text(notesLines, leftColX, leftY);
    leftY += notesLines.length * 5 + 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const rating =
      notesData.rating != null
        ? Math.min(Math.max(parseInt(notesData.rating), 0), 5)
        : 0;
    doc.setTextColor(0, 0, 0);
    doc.text(`Rating: ${rating}/5`, leftColX, leftY);
    leftY += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Employee Signature", leftColX, leftY);
    leftY += 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const employeeName = taskDetails.assignedTo || "No name available";
    const employeeNameLines = doc.splitTextToSize(employeeName, leftColWidth);
    doc.text(employeeNameLines, leftColX, leftY);

    const photoWidth = 40;
    const photoHeight = 40;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Client Photo", rightColX, rightY);
    rightY += 5;

    let clientPhotoDisplayed = false;
    if (notesData.clientImage) {
      try {
        const clientPhotoData = await fetchImageAsBase64(notesData.clientImage);
        if (clientPhotoData) {
          doc.addImage(
            clientPhotoData.dataUrl,
            clientPhotoData.format,
            rightColX,
            rightY,
            photoWidth,
            photoHeight,
          );
          clientPhotoDisplayed = true;
          rightY += photoHeight + 5;
        }
      } catch (error) {
        console.error("Error adding client photo:", error);
      }
    }
    if (!clientPhotoDisplayed) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("No photo available", rightColX, rightY);
      rightY += 10;
    }

    const sigWidth = 50;
    const sigHeight = 25;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Client Signature", rightColX, rightY);
    rightY += 5;

    let clientSigDisplayed = false;
    if (signature) {
      try {
        const clientSigData = await fetchImageAsBase64(signature);
        if (clientSigData) {
          doc.addImage(
            clientSigData.dataUrl,
            clientSigData.format,
            rightColX,
            rightY,
            sigWidth,
            sigHeight,
          );
          clientSigDisplayed = true;
          rightY += sigHeight + 5;
        }
      } catch (error) {
        console.error("Error adding client signature:", error);
      }
    }
    if (!clientSigDisplayed) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("No signature available", rightColX, rightY);
      rightY += 10;
    }

    return Math.max(leftY, rightY) + 10;
  };

  const generateTaskPDF = async (taskData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    try {
      // Get the first jobsheet name if available
      const firstJobsheetName =
        taskData.jobsWithData && taskData.jobsWithData.length > 0
          ? taskData.jobsWithData[0].job_name
          : null;

      let yPos = await addHeader(
        doc,
        taskData.tenantData,
        taskData.logoId,
        firstJobsheetName,
      );

      yPos = addOverviewSection(
        doc,
        taskData.overview,
        taskData.location,
        yPos,
      );

      if (taskData.jobsWithData && taskData.jobsWithData.length > 0) {
        yPos = await addJobsheetSection(doc, taskData.jobsWithData, yPos);
      }

      await addNotesSection(
        doc,
        taskData.notesData,
        taskData.overview,
        taskData.notesData.signature,
        yPos,
      );

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(
          String(taskData.tenantData.companyName || "Company Name"),
          pageWidth / 2,
          pageHeight - 20,
          { align: "center" },
        );

        if (taskData.tenantData.companyAddress) {
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          const addressObj = taskData.tenantData.companyAddress;
          const addressText = addressObj
            ? `${addressObj.house || ""}, ${addressObj.street || ""}, ${addressObj.vtc || ""}, ${addressObj.dist || ""}, ${addressObj.state || ""} - ${addressObj.zip || ""}`.replace(
                /,\s*$/,
                "",
              )
            : "No address available";
          doc.text(addressText, pageWidth / 2, pageHeight - 15, {
            align: "center",
          });
        }

        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, {
          align: "center",
        });
      }

      const fileName = `Task_${String(taskData.overview.taskId)}_${Date.now()}.pdf`;
      doc.save(fileName);

      return { success: true, message: "PDF generated successfully" };
    } catch (error) {
      console.error("Error generating PDF:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    generateTaskPDF,
  };
};
