const exportHeaders = {
  doors: ["door Number", "door Name"],
  personalModule: ["Profile", "Employee ID", "person Name", "Phone", "Email", "Assigned Cards", "Assigned Tags"],
  accesslevels: ["Accesslevel Name"],
  department: ["Department Name"],
  branch: ["Branch Name"],
  holiday: ["Date", "Events"],
};

export const downloadCollectionTemplate = async (collectionName) => {
  if (!collectionName) throw new Error("Please select a collection");

  try {
    if (!exportHeaders[collectionName]) throw new Error(`Invalid collection type: ${collectionName}`);

    const headers = exportHeaders[collectionName];
    const csvContent = headers.join(",");
    const date = new Date().toISOString().split("T")[0];
    const filename = `${collectionName}_template_${date}.csv`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const downloadURL = URL.createObjectURL(blob);
    const link = document.createElement("a");
   
    link.href = downloadURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadURL);

    return { success: true, message: `Successfully downloaded ${collectionName} template` };
  } catch (error) {
    throw new Error(`Failed to export data: ${error.message}`);
  }
};

export const processCSVImport = async (file, collectionName, userTenant) => {
  if (!file || !collectionName) throw new Error("File and collection name are required");
  if (!userTenant) throw new Error("Tenant ID is required");

  const BATCH_SIZE = 20; // Process 20 records at a time

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = async (event) => {
      try {
        const lines = event.target.result.split("\n");
        if (lines.length < 2) throw new Error("File contains no data");

        const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
        const dataRows = lines.slice(1).filter(line => line.trim());
       
        // Transform all data first
        let transformedData = dataRows.map(row => {
          const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.trim().replace(/^"|"$/g, ""));
          const alignedValues = headers.map((_, index) => values[index] || "");
          return transformRowData(mapRowToHeaders(headers, alignedValues), collectionName, userTenant);
        }).filter(Boolean);

        let validRecords = [];
        let duplicateRecords = [];
        let processedCount = 0;
        let startingNumber;

        // Get initial sequence number
        if (collectionName === "accesslevels") {
          startingNumber = await generateSequentialAccessLevelNumber(userTenant);
        } else if (collectionName === "doors") {
          startingNumber = await generateSequentialDoorNumber(userTenant);
        } else if (collectionName === "branch") {
          startingNumber = await generateSequentialBranchId(userTenant);
        } else if (collectionName === "department") {
          startingNumber = await generateSequentialDepartmentId(userTenant);
        }

        let currentNumber = parseInt(startingNumber);

        // Process in batches
        while (processedCount < transformedData.length) {
          const batch = transformedData.slice(processedCount, processedCount + BATCH_SIZE);
         
          // Process batch
          const batchPromises = batch.map(async (data) => {
            try {
              let checkURL = '';
              let nameField = '';
             
              // Set check parameters based on collection
              if (collectionName === "accesslevels") {
                checkURL = `/items/accesslevels?filter[accessLevelName][_eq]=${data.accessLevelName}&filter[tenant][_eq]=${userTenant}`;
                nameField = 'accessLevelName';
              } else if (collectionName === "doors") {
                checkURL = `/items/doors?filter[doorName][_eq]=${data.doorName}&filter[tenant][_eq]=${userTenant}`;
                nameField = 'doorName';
              } else if (collectionName === "branch") {
                checkURL = `/items/branch?filter[branchName][_eq]=${data.branchName}&filter[tenant][_eq]=${userTenant}`;
                nameField = 'branchName';
              } else if (collectionName === "department") {
                checkURL = `/items/department?filter[departmentName][_eq]=${data.departmentName}&filter[tenant][_eq]=${userTenant}`;
                nameField = 'departmentName';
              } else if (collectionName === "personalModule") {
                checkURL = `/items/personalModule?filter[uniqueId][_eq]=${data.uniqueId}`;
                nameField = 'employeeId';
              }

              const checkResponse = await fetch(checkURL);
              const existingData = await checkResponse.json();

              if (existingData.data?.length > 0) {
                return { isDuplicate: true, name: data[nameField] };
              }

              // Assign sequence number and uniqueId
              data[`${collectionName === 'accesslevels' ? 'accessLevelNumber' : collectionName.slice(0, -1) + 'Id'}`] = currentNumber.toString();
              data.uniqueId = `${userTenant}-${currentNumber}`;
              currentNumber++;

              return { isDuplicate: false, data };
            } catch (error) {
              console.error(`Error processing record:`, error);
              return { isError: true, error };
            }
          });

          // Wait for batch to complete
          const batchResults = await Promise.all(batchPromises);

          // Process batch results
          batchResults.forEach(result => {
            if (result.isDuplicate) {
              duplicateRecords.push(result.name);
            } else if (!result.isError) {
              validRecords.push(result.data);
            }
          });

          processedCount += BATCH_SIZE;

          // Optional: Add progress notification
          console.log(`Processed ${processedCount}/${transformedData.length} records`);
        }

        // Show duplicates alert if any
        if (duplicateRecords.length > 0) {
          alert(`Following records are duplicates and will be skipped:\n${duplicateRecords.join('\n')}`);
        }

        // Import valid records
        if (validRecords.length > 0) {
          const response = await sendImportRequest(validRecords, collectionName);
          resolve({
            success: true,
            message: `Successfully imported ${validRecords.length} records. ${duplicateRecords.length} duplicates were skipped.`,
            data: validRecords
          });
        } else {
          throw new Error("No valid records to import after duplicate check");
        }

      } catch (error) {
        alert(error.message);
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Error reading file"));
  });
};

const mapRowToHeaders = (headers, values) => {
  const mappedData = {};
  headers.forEach((header, index) => mappedData[header] = values[index] || "");
  return mappedData;
};

const transformRowData = (rowData, collectionName, userTenant) => {
  const transforms = {
    doors: () => transformDoorData(rowData, userTenant),
    personalModule: () => transformPersonalModuleData(rowData, userTenant),
    accesslevels: () => transformAccessLevelData(rowData, userTenant),
    branch: () => transformBranchData(rowData, userTenant),
    department: () => transformDepartmentData(rowData, userTenant),
    holiday: () => transformHolidayData(rowData, userTenant),
  };

  if (!transforms[collectionName]) throw new Error(`Unsupported collection type: ${collectionName}`);
  return transforms[collectionName]();
};

const transformDoorData = (rowData, userTenant) => {
  const { "door name": doorName } = rowData;
  if (!doorNumber || !doorName) return null;

  return {
   
    doorName,
   
    tenant: userTenant,
    status: "assigned",
   
  };
};

const transformPersonalModuleData = (rowData, userTenant) => {
  const { "employee id": employeeId, "person name": name, phone, email, "assigned cards": assignedCards, "assigned tags": assignedTag} = rowData;
  const cards = assignedCards ?
    assignedCards.split(",")
      .map(card => card.trim())
      .filter(Boolean)
      .map(card => parseInt(card.replace(/['"\\]/g, ""), 10))
      .filter(num => !isNaN(num))
      .slice(0, 4)
      .map(number => ({ cardManagement_id: { rfidCard: number, type: "tag" } }))
    : [];

    const tags = assignedTag ?
    assignedTag.split(",")
      .map(tags => tags.trim())
      .filter(Boolean)
      .map(tags => parseInt(tags.replace(/['"\\]/g, ""), 10))
      .filter(num => !isNaN(num))
      .slice(0, 4)
      .map(number => ({ cardManagement_id: { rfidCard: number, type: "rfid" } }))
    : [];


  const payload = {
    employeeId,
    status: "active",
    accessOn: "true",
    assignedUser: {
      first_name: name?.trim() || "",
      email: email?.trim() || "",
      phone: phone?.trim() || "",
      avatar: null,
      tenant: userTenant,
      role: null,
    },
    assignedCards: { create: cards, update: [], delete: [] },
    assignedTag: { create: tags, update: [], delete: [] },
    uniqueId: `${userTenant}-${employeeId}`,
  };
  console.log("payload", payload);
  return payload;
};

const transformAccessLevelData = (rowData, userTenant) => {
  const { "accesslevel name": accessLevelName } = rowData;
  if (!accessLevelName) return null;

 
  return {
    accessLevelName,
   
    status: "assigned",
    holidays: "false",
    _24hrs: "false",
    maxWorkHours: 8,
    workingHours: "true",
    tenant: userTenant,
    wrkHrs: null,
    assignedDoors: { create: [], delete: [], update: [] },
   
  };
};

const transformBranchData = (rowData, userTenant) => {
  const { "branch name": branchName } = rowData;
  if (!branchName) return null;

 
  return {
   
    branchName,
    status: "assigned",
    tenant: userTenant,
   
  };
};

const transformDepartmentData = (rowData, userTenant) => {
  const { "department name": departmentName } = rowData;
  if (!departmentName) return null;

 
  return {
   
    status: "assigned",
    departmentName,
    branch: null,
    tenant: userTenant,
   
  };
};

const transformHolidayData = (rowData, userTenant) => {
  const { date, events } = rowData;
  if (!date || !events) return null;

  const formattedDate = parseDate(date);
  if (!formattedDate) return null;

  return {
    date: formatDate(formattedDate),
    status: "assigned",
    event: events,
    tenant: userTenant,
    branch: null,
  };
};

const parseDate = dateString => {
  const parts = dateString.split('-');
  return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : null;
};

const formatDate = dateString => {
  const parsedDate = parseDate(dateString);
  if (!parsedDate) throw new Error(`Invalid date format: ${dateString}`);
  return new Date(parsedDate).toISOString().split("T")[0];
};

const sendImportRequest = async (transformedData, collectionName) => {
  const formData = new FormData();
  formData.append("file", new Blob([JSON.stringify(transformedData)], { type: "application/json" }), "data.json");

  const response = await fetch(`/utils/import/${collectionName}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Upload failed: ${errorData.errors?.[0]?.message || "Unknown error"}`);
  }

  return response;
};

async function generateSequentialAccessLevelNumber(userTenant) {
 
  try {
    const response = await fetch(
      `/items/accesslevels?filter[tenant][tenantId][_eq]=${userTenant}&sort[]=-accessLevelNumber&limit=1`
    );
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return "1";
    }

    const lastNumber = parseInt(data.data[0].accessLevelNumber, 10);
    return (lastNumber + 1).toString();
  } catch (error) {
    console.error("Error generating access level number:", error);
    return "1";
  }
};

// Add new method for branchId
async function generateSequentialBranchId(userTenant) {
  try {
    const response = await fetch(
      `/items/branch?filter[tenant][tenantId][_eq]=${userTenant}&sort[]=-branchId&limit=1`
    );
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return "1";
    }

    const lastNumber = parseInt(data.data[0].branchId, 10);
    return (lastNumber + 1).toString();
  } catch (error) {
    console.error("Error generating branch ID:", error);
    return "1";
  }
};

// Add new method for departmentId
async function generateSequentialDepartmentId(userTenant) {
  try {
    const response = await fetch(
      `/items/department?filter[tenant][tenantId][_eq]=${userTenant}&sort[]=-departmentId&limit=1`
    );
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return "1";
    }

    const lastNumber = parseInt(data.data[0].departmentId, 10);
    return (lastNumber + 1).toString();
  } catch (error) {
    console.error("Error generating department ID:", error);
    return "1";
  }
};
 // Add new door number generator
async function generateSequentialDoorNumber(userTenant) {
  try {
    const response = await fetch(
      `/items/doors?filter[tenant][tenantId][_eq]=${userTenant}&sort[]=-doorNumber&limit=1`
    );
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return "1";
    }

    const lastNumber = parseInt(data.data[0].doorNumber, 10);
    return (lastNumber + 1).toString();
  } catch (error) {
    console.error("Error generating door number:", error);
    return "1";
  }
};