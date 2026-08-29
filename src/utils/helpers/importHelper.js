import { authService } from '@/services/authService';
import { mqttService } from '@/services/mqttService';
import { currentUserTenant } from '@/utils/currentUserTenant';

const API_URL = import.meta.env.VITE_API_URL || 'https://appv1.fieldseasy.com/directus';

const getHeaders = (extraHeaders = {}) => {
  const token = authService.getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders
  };
};

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

const checkBatchDuplicates = async (collectionName, batch, userTenant) => {
  if (!batch || !batch.length) return new Map();

  let checkKey = '';
  if (collectionName === "accesslevels") checkKey = 'accessLevelName';
  else if (collectionName === "doors") checkKey = 'doorName';
  else if (collectionName === "branch") checkKey = 'branchName';
  else if (collectionName === "department") checkKey = 'departmentName';
  else if (collectionName === "personalModule") checkKey = 'uniqueId';

  if (!checkKey) return new Map();

  const resultMap = new Map();

  // 1. Primary field duplicate check using filter[_in] (efficient & avoids 400 Bad Request)
  const valuesToCheck = batch
    .map(data => (collectionName === 'personalModule' ? data.uniqueId : data[checkKey]))
    .filter(val => val !== undefined && val !== null && val !== '');

  if (valuesToCheck.length) {
    try {
      const params = new URLSearchParams();
      params.append(`filter[${checkKey}][_in]`, valuesToCheck.join(','));
      if (collectionName !== "personalModule") {
        params.append('filter[tenant][_eq]', userTenant);
      }
      params.append('limit', batch.length.toString());
      params.append('fields', collectionName === 'personalModule' ? `id,${checkKey},assignedUser.id,assignedUser.email` : `id,${checkKey}`);

      const response = await fetch(`${API_URL}/items/${collectionName}?${params.toString()}`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const existingData = await response.json();
        const records = existingData.data || [];
        records.forEach(r => {
          if (r[checkKey]) {
            resultMap.set(r[checkKey].toString().trim().toLowerCase(), r);
          }
        });
      }
    } catch (error) {
      console.error('Error in batch duplicate check (primary):', error);
    }
  }

  // 2. Additional check for personalModule emails against both personalModule AND directus_users
  if (collectionName === 'personalModule') {
    const emailsToCheck = batch
      .map(d => d.assignedUser?.email || d.personalEmail)
      .filter(val => val !== undefined && val !== null && val !== '');

    if (emailsToCheck.length) {
      // 2a. Check personalModule collection
      try {
        const emailParams = new URLSearchParams();
        emailParams.append('filter[assignedUser][email][_in]', emailsToCheck.join(','));
        emailParams.append('limit', batch.length.toString());
        emailParams.append('fields', 'id,uniqueId,assignedUser.id,assignedUser.email');

        const emailRes = await fetch(`${API_URL}/items/personalModule?${emailParams.toString()}`, {
          headers: getHeaders()
        });
        if (emailRes.ok) {
          const emailData = await emailRes.json();
          (emailData.data || []).forEach(r => {
            if (r.assignedUser?.email) {
              resultMap.set(r.assignedUser.email.toString().trim().toLowerCase(), r);
            }
          });
        }
      } catch (err) {
        console.error('Error in batch duplicate check (personalModule emails):', err);
      }

      // 2b. Check directus_users collection directly to prevent user duplicate email constraint crashes
      try {
        const userParams = new URLSearchParams();
        userParams.append('filter[email][_in]', emailsToCheck.join(','));
        userParams.append('limit', batch.length.toString());
        userParams.append('fields', 'id,email');

        const userRes = await fetch(`${API_URL}/users?${userParams.toString()}`, {
          headers: getHeaders()
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          (userData.data || []).forEach(u => {
            if (u.email) {
              const emailKey = u.email.toString().trim().toLowerCase();
              if (!resultMap.has(emailKey)) {
                resultMap.set(emailKey, { id: null, assignedUser: u });
              }
            }
          });
        }
      } catch (err) {
        console.error('Error in batch duplicate check (directus_users emails):', err);
      }
    }
  }

  return resultMap;
};

const sendPatchRequest = async (itemId, data, collectionName) => {
  const response = await fetch(`${API_URL}/items/${collectionName}/${itemId}`, {
    method: "PATCH",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to update ${collectionName} item ${itemId}: ${errorData.errors?.[0]?.message || "Unknown error"}`);
  }
  return response.json();
};

export const processCSVImport = async (file, collectionName, userTenant, options = {}) => {
  if (!file || !collectionName) throw new Error("File and collection name are required");
  if (!userTenant) throw new Error("Tenant ID is required");

  const BATCH_SIZE = 50; // Process 50 records per batch request

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
        let duplicateItems = [];
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
          const existingMap = await checkBatchDuplicates(collectionName, batch, userTenant);

          batch.forEach((data) => {
            let nameField = 'doorName';
            if (collectionName === "accesslevels") nameField = 'accessLevelName';
            else if (collectionName === "doors") nameField = 'doorName';
            else if (collectionName === "branch") nameField = 'branchName';
            else if (collectionName === "department") nameField = 'departmentName';
            else if (collectionName === "personalModule") nameField = 'employeeId';

            let checkVal = collectionName === 'personalModule' ? data.uniqueId : data[nameField];
            let normalizedVal = checkVal?.toString().trim().toLowerCase();
            let emailVal = collectionName === 'personalModule' ? (data.assignedUser?.email || data.personalEmail)?.toString().trim().toLowerCase() : null;

            const existingRecord = (normalizedVal && existingMap.get(normalizedVal)) || (emailVal && existingMap.get(emailVal));

            if (existingRecord) {
              if (collectionName === 'personalModule' && existingRecord.id === null && existingRecord.assignedUser?.id) {
                // User exists in /users but has no personalModule record in directory. Auto-reuse user ID!
                data.assignedUser = existingRecord.assignedUser.id;
                data[`personalModuleId`] = currentNumber.toString();
                if (!data.uniqueId) {
                  data.uniqueId = `${userTenant}-${data.employeeId || currentNumber}`;
                }
                currentNumber++;
                validRecords.push(data);
              } else {
                duplicateItems.push({
                  data,
                  name: data[nameField] || data.employeeId || data.assignedUser?.email,
                  existingRecord
                });
              }
            } else {
              // Assign sequence number and uniqueId
              data[`${collectionName === 'accesslevels' ? 'accessLevelNumber' : collectionName.slice(0, -1) + 'Id'}`] = currentNumber.toString();
              if (!data.uniqueId) {
                data.uniqueId = `${userTenant}-${data.employeeId || currentNumber}`;
              }
              currentNumber++;
              validRecords.push(data);
            }
          });

          processedCount += BATCH_SIZE;
          console.log(`Processed ${processedCount}/${transformedData.length} records`);
        }

        let userChoice = 'skip';
        if (duplicateItems.length > 0) {
          if (typeof options.onDuplicateFound === 'function') {
            userChoice = await options.onDuplicateFound({
              duplicateRecords: duplicateItems.map(d => d.name),
              duplicateItems,
              count: duplicateItems.length
            });
          } else {
            const duplicateNames = duplicateItems.map(d => d.name);
            const sampleNames = duplicateNames.slice(0, 10).join(', ');
            const moreCount = duplicateNames.length > 10 ? ` (+${duplicateNames.length - 10} more)` : '';
            const confirmEdit = confirm(
              `Found ${duplicateItems.length} duplicate record(s): ${sampleNames}${moreCount}\n\n` +
              `Click [OK] to Edit/Update existing records with new CSV data.\n` +
              `Click [Cancel] to Skip duplicates and import only new records.`
            );
            userChoice = confirmEdit ? 'edit' : 'skip';
          }
        }

        let updatedCount = 0;
        if (userChoice === 'edit' && duplicateItems.length > 0) {
          const PATCH_CONCURRENCY = 15;
          for (let i = 0; i < duplicateItems.length; i += PATCH_CONCURRENCY) {
            const chunk = duplicateItems.slice(i, i + PATCH_CONCURRENCY);
            await Promise.all(chunk.map(async (item) => {
              try {
                const patchPayload = { ...item.data };
                const existingRecordId = item.existingRecord?.id;
                const existingUserObj = item.existingRecord?.assignedUser;
                const existingUserId = typeof existingUserObj === 'object' ? existingUserObj?.id : existingUserObj;

                if (collectionName === 'personalModule' && patchPayload.assignedUser) {
                  if (existingUserId) {
                    patchPayload.assignedUser = {
                      id: existingUserId,
                      ...patchPayload.assignedUser
                    };
                  } else {
                    delete patchPayload.assignedUser;
                  }
                }

                if (existingRecordId) {
                  await sendPatchRequest(existingRecordId, patchPayload, collectionName);
                  updatedCount++;
                } else if (existingUserId) {
                  // User exists in /users but has no personalModule item yet
                  patchPayload.assignedUser = existingUserId;
                  await sendImportRequest([patchPayload], collectionName);
                  updatedCount++;
                }
              } catch (err) {
                console.error(`Failed to update duplicate record ${item.name}:`, err);
              }
            }));
            console.log(`Updated duplicates progress: ${Math.min(i + PATCH_CONCURRENCY, duplicateItems.length)}/${duplicateItems.length}`);
          }
        }

        // Import valid (new) records
        if (validRecords.length > 0) {
          await sendImportRequest(validRecords, collectionName);
        }

        // Automatically sync imported RFID cards to hardware controllers over MQTT
        if (collectionName === 'personalModule') {
          try {
            const importedRecords = userChoice === 'edit'
              ? [...validRecords, ...duplicateItems.map(d => d.data)]
              : validRecords;

            const cardPayloads = [];
            importedRecords.forEach((item, idx) => {
              let rfidNo = item.rfidCardVal || item.rfidCard;
              if (!rfidNo && item.assignedCards?.create?.[0]?.cardManagement_id?.rfidCard) {
                rfidNo = item.assignedCards.create[0].cardManagement_id.rfidCard;
              }
              if (rfidNo) {
                const cardStr = String(rfidNo).trim();
                cardPayloads.push({
                  id: cardStr,
                  type: 200,
                  code: cardStr,
                  index: idx + 1,
                  time: { type: 0 },
                  extra: { name: String(item.employeeId || item.firstName || `EMP-${idx + 1}`) }
                });
              }
            });

            if (cardPayloads.length > 0) {
              console.log(`Syncing ${cardPayloads.length} imported RFID cards to physical hardware controllers over MQTT...`);

              let deviceUuids = [];
              try {
                const currentTenantId = currentUserTenant.getTenantId();
                const doorsRes = await fetch(`${API_URL}/items/doors?limit=-1&fields=id,deviceUuid,uniqueId,tenant.tenantId,tenant`, {
                  headers: getHeaders()
                });
                if (doorsRes.ok) {
                  const doorsData = await doorsRes.json();
                  const tenantDoors = (doorsData.data || []).filter(d => {
                    const tId = d.tenant?.tenantId || d.tenant?.id || d.tenant;
                    return currentTenantId && String(tId) === String(currentTenantId);
                  });
                  deviceUuids = [...new Set(tenantDoors.map(d => d.deviceUuid || d.uniqueId).filter(Boolean))];
                }
              } catch (e) {
                console.warn("Failed to query doors for MQTT sync:", e);
              }

              // Always ensure physical 4-Door Controller UUIDs receive the insertPermission command
              const HARDWARE_CONTROLLER_UUIDS = [
                '4302786958303133662B46534E4B2EEA',
                '4302786958303133662B46534E4B2EEb'
              ];

              HARDWARE_CONTROLLER_UUIDS.forEach(hwUuid => {
                if (!deviceUuids.includes(hwUuid)) {
                  deviceUuids.push(hwUuid);
                }
              });

              console.log("Target Controller UUIDs for insertPermission broadcast:", deviceUuids);

              try { mqttService.connect(); } catch (e) {}

              const MQTT_CHUNK_SIZE = 50;
              for (let i = 0; i < cardPayloads.length; i += MQTT_CHUNK_SIZE) {
                const batchChunk = cardPayloads.slice(i, i + MQTT_CHUNK_SIZE);
                for (const uuid of deviceUuids) {
                  const payload = {
                    action: "insertPermission",
                    uuid: uuid,
                    data: batchChunk
                  };

                  console.log(`[MQTT Broadcast] Sending insertPermission (${batchChunk.length} cards) to controller ${uuid}...`);

                  // Send via Knative Router HTTP Endpoint
                  await fetch(`${import.meta.env.VITE_KN_API_URL || 'https://appv1.fieldseasy.com/kn'}/device-mqtt`, {
                    method: "POST",
                    headers: getHeaders({ "Content-Type": "application/json" }),
                    body: JSON.stringify(payload)
                  }).catch(err => console.warn("Knative router import sync error:", err));

                  // Direct MQTT Broker Publish
                  try {
                    await mqttService.publishCommand(uuid, 'insertPermission', batchChunk);
                  } catch (e) {}
                }
              }
            }
          } catch (syncError) {
            console.error("Failed to sync imported cards to hardware device over MQTT:", syncError);
          }
        }

        const skippedCount = userChoice === 'skip' ? duplicateItems.length : duplicateItems.length - updatedCount;

        resolve({
          success: true,
          message: `Import completed: ${validRecords.length} new record(s) created, ${updatedCount} existing record(s) updated, ${skippedCount} skipped.`,
          data: {
            newRecords: validRecords,
            updatedCount,
            skippedCount
          }
        });

      } catch (error) {
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
  const employeeId = rowData["employee id"] || rowData["employeeid"] || rowData["id"] || rowData["emp id"] || "";
  const rawFirstName = rowData["firstname"] || rowData["first name"] || "";
  const rawLastName = rowData["lastname"] || rowData["last name"] || "";
  const middleName = rowData["middlename"] || rowData["middle name"] || "";
  const gender = rowData["gender"] || "";
  const rawFullName = rowData["person name"] || rowData["name"] || rowData["full name"] || "";
  const email = rowData["email"] || rowData["official work email"] || rowData["work email"] || rowData["personal email"] || "";
  const phone = rowData["phone"] || rowData["mobile"] || rowData["personal phone"] || "";
  const designation = rowData["designation"] || rowData["title"] || "";
  const rfidCardVal = rowData["rfidcard"] || rowData["rfid card"] || rowData["rfid"] || rowData["assigned cards"] || rowData["cards"] || "";
  const assignedTag = rowData["assigned tags"] || rowData["tags"] || "";

  let firstName = rawFirstName.trim();
  let lastName = rawLastName.trim();

  if (!firstName && rawFullName) {
    const parts = rawFullName.trim().split(" ");
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  const cards = rfidCardVal ?
    rfidCardVal.toString().split(",")
      .map(card => card.trim())
      .filter(Boolean)
      .map(card => card.replace(/['"\\]/g, ""))
      .filter(val => val)
      .slice(0, 4)
      .map(number => ({ cardManagement_id: { rfidCard: number, type: "rfid" } }))
    : [];

  const tags = assignedTag ?
    assignedTag.toString().split(",")
      .map(tags => tags.trim())
      .filter(Boolean)
      .map(tags => tags.replace(/['"\\]/g, ""))
      .filter(val => val)
      .slice(0, 4)
      .map(number => ({ cardManagement_id: { rfidCard: number, type: "tag" } }))
    : [];

  const payload = {
    employeeId: employeeId?.trim() || "",
    firstName: firstName,
    lastName: lastName,
    middleName: middleName?.trim() || "",
    gender: gender?.trim() || "",
    designation: designation?.trim() || "",
    personalPhone: phone?.trim() || null,
    personalEmail: email?.trim() || null,
    status: "true",
    accessOn: true,
    assignedUser: {
      first_name: firstName || "Employee",
      last_name: lastName || "-",
      email: email?.trim() || "",
      phone: phone?.trim() ? (phone.trim().startsWith("+91") ? phone.trim() : `+91${phone.trim()}`) : "",
      avatar: null,
      tenant: userTenant,
      role: null,
    },
    assignedCards: { create: cards, update: [], delete: [] },
    assignedTag: { create: tags, update: [], delete: [] },
    rfidCardVal: rfidCardVal ? rfidCardVal.toString().trim() : null,
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

  const response = await fetch(`${API_URL}/utils/import/${collectionName}`, {
    method: "POST",
    headers: getHeaders(),
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
      `${API_URL}/items/accesslevels?filter[tenant][tenantId][_eq]=${userTenant}&sort[]=-accessLevelNumber&limit=1`,
      { headers: getHeaders() }
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
      `${API_URL}/items/branch?filter[tenant][tenantId][_eq]=${userTenant}&sort[]=-branchId&limit=1`,
      { headers: getHeaders() }
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
      `${API_URL}/items/department?filter[tenant][tenantId][_eq]=${userTenant}&sort[]=-departmentId&limit=1`,
      { headers: getHeaders() }
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
      `${API_URL}/items/doors?filter[tenant][tenantId][_eq]=${userTenant}&sort[]=-doorNumber&limit=1`,
      { headers: getHeaders() }
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