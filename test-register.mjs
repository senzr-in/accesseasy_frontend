import fs from 'fs';

(async () => {
  const token = "p2pJHhZAjca6jQea0RbPVwNWRyrJG29X"; // From .env VITE_API_TOKEN
  const baseURL = "https://appv1.fieldseasy.com/directus";

  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  try {
    console.log("1. Creating Tenant...");
    const tenantPayload = {
      tenantName: "Test Company AI",
      companyAddress: JSON.stringify("123 Main St"),
    };
    
    const tenantRes = await fetch(`${baseURL}/items/tenant`, {
      method: "POST",
      headers,
      body: JSON.stringify(tenantPayload)
    });
    
    if (!tenantRes.ok) {
        console.log("Tenant creation failed:");
        console.log(await tenantRes.text());
        return;
    }
    
    const tenantData = await tenantRes.json();
    console.log("Tenant created:", tenantData.data.tenantId);
    const tenantId = tenantData.data.tenantId;

    console.log("2. Creating Personal Module with User...");
    const adminRoleId = "ea2303aa-1662-43ca-a7f7-ab84924a7e0a";
    const empId = "EMP-001-" + Math.floor(Math.random() * 1000);
    const phone = "+9199999" + Math.floor(10000 + Math.random() * 90000);
    
    const personalModulePayload = {
      status: "active",
      accessOn: true,
      employeeId: empId,
      cycleType: 1,
      uniqueId: `${tenantId}-${empId}`,
      assignedUser: {
        first_name: "Test User AI",
        email: `test_ai_${Date.now()}@example.com`,
        phone: phone,
        role: adminRoleId,
        tenant: tenantId,
        appAccess: true,
        userApp: "fieldeasy" // or accesseasy
      },
    };

    const pmRes = await fetch(`${baseURL}/items/personalModule`, {
      method: "POST",
      headers,
      body: JSON.stringify(personalModulePayload)
    });

    if (!pmRes.ok) {
        console.log("Personal Module creation failed:");
        console.log(await pmRes.text());
        return;
    }

    const pmData = await pmRes.json();
    console.log("Personal Module created successfully:", pmData.data.id);

  } catch (e) {
    console.error("Fetch error:", e);
  }
})();
