import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const currentYear = new Date().getFullYear();
const startDate = `${currentYear}-04-01`;
const endDate = `${currentYear + 1}-03-31`;

// Batch GET for multiple users
const getTdsDeductionByUsers = async (employeeIds, startDate, endDate) => {
  if (!token || !employeeIds || employeeIds.length === 0) return {};

  const params = {
    fields: [
      "id",
      "taxLiabilties",
      "regime",
      "taxableIncome",
      "exemption",
      "standardDeduction",
      "totalEarnings",
      "totalDeductions",
      "deduction",
      "rebate",
      "healthEducation",
      "paidTax",
      "employer",
    ],
    "filter[_and][0][startDate][_gte]": startDate,
    "filter[_and][1][endDate][_lte]": endDate,
    "filter[_and][2][employer][_in]": employeeIds.join(","), // Batch query for multiple employees
  };

  try {
    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${encodeURIComponent(params[key])}`;
      })
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsDeduction?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GET failed with status: ${response.status}`);
    }

    const result = await response.json();
    const data = result.data || [];

    // Group by employee for easy access
    const groupedData = {};
    data.forEach((item) => {
      if (!groupedData[item.employer]) {
        groupedData[item.employer] = [];
      }
      groupedData[item.employer].push(item);
    });

    return groupedData;
  } catch (error) {
    console.error(
      "Error fetching TDS deductions for multiple employees:",
      error,
    );
    return {};
  }
};
const fetchPayrollVerification = async (employeeId, payrollEndDate) => {
  const employeeIds = employeeId.map((emp) => emp.employeeId).join(",");
  if (!token) return;

  try {
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-04-01`;
    const endDate = `${currentYear + 1}-03-31`;

    const params = {
      fields: [
        "complienceDeduction",
        "totalBenefits",
        "totalEarnings",
        "finalizeDate",
        "startDate",
        "endDate",
        "tdsAmount",
        "id",
        "employee",
      ],
    };

    const queryString = [
      ...params.fields.map((field) => `fields[]=${field}`),
      `filter[_and][0][_and][0][endDate][_gte]=${startDate}`,
      `filter[_and][0][_and][1][endDate][_lte]=${endDate}`,
      `filter[employee][_in]=${employeeIds}`,
    ].join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/payrollVerification?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const tdsPerMonth = await calculationLogic(
      data.data,
      employeeId,
      payrollEndDate,
    );
    return tdsPerMonth;
  } catch (error) {
    console.error("Error fetching payroll verification:", error);
  }
};
// Batch GET for payroll verification
// const calculateMonthlyEarnings = async (data, employeeData, payrollEndDate) => {
//   const results = {};
//   const payrollMonth = payrollEndDate
//     ? new Date(payrollEndDate).toISOString().slice(0, 7)
//     : null;
//   const today = new Date();

//   console.log(
//     `\n=== STARTING CALCULATION FOR PAYROLL MONTH: ${payrollMonth || "Not specified"} ===`,
//   );

//   // Get existing TDS data for all employees at once
//   const employeeIds = employeeData.map((emp) => emp.employeeId);
//   const existingTdsData = await getTdsDeductionByUsers(
//     employeeIds,
//     startDate,
//     endDate,
//   );

//   // Process each employee
//   for (const employee of employeeData) {
//     console.log(`\n=== PROCESSING EMPLOYEE ${employee.employeeId} ===`);
//     console.log(
//       `Initial Values - Monthly CTC: ₹${employee.monthlyCTC}, Employee PF: ₹${employee.employeePF}`,
//     );

//     const { employeeId, monthlyCTC, employeePF } = employee;

//     // Validate employee data
//     if (!employeeId || !monthlyCTC || employeePF === undefined) {
//       console.error(`❌ Invalid employee data for ${employeeId}:`, employee);
//       continue;
//     }

//     // Filter data for current employee
//     const employeeSpecificData = data.filter(
//       (item) => item.employee === employeeId,
//     );
//     console.log(
//       `📂 Found ${employeeSpecificData.length} historical payroll records`,
//     );

//     const earningsByMonth = {};
//     const tdsByMonth = {};
//     const pfByMonth = {};
//     const benefitsByMonth = {};
//     let date = new Date(startDate);
//     const finalDate = new Date(endDate);
//     const allMonths = [];

//     // Generate all months in the date range
//     while (date <= finalDate) {
//       const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
//       allMonths.push(key);

//       // Initialize with default values
//       earningsByMonth[key] = Number(monthlyCTC);
//       tdsByMonth[key] = 0;
//       pfByMonth[key] = Number(employeePF);
//       benefitsByMonth[key] = 0;

//       date.setMonth(date.getMonth() + 1);
//     }

//     // Process payroll data and override default values
//     const processedMonths = new Set();

//     employeeSpecificData
//       .filter((item) => {
//         const dateToCheck = item.endDate || item.startDate;
//         if (!dateToCheck) return false;

//         const itemDate = new Date(dateToCheck);
//         const isInRange =
//           itemDate >= new Date(startDate) && itemDate <= finalDate;
//         return isInRange;
//       })
//       .sort((a, b) => {
//         const dateA = new Date(a.endDate || a.startDate);
//         const dateB = new Date(b.endDate || b.startDate);
//         return dateA - dateB;
//       })
//       .forEach((item) => {
//         const dateToUse = item.endDate || item.startDate;
//         const itemDate = new Date(dateToUse);
//         const key = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}`;
//         const isFutureMonth = new Date(key + "-01") > today;

//         // Special handling for current payroll month
//         if (payrollMonth && key === payrollMonth) {
//           console.log(`\n🔄 PROCESSING PAYROLL MONTH (${key}) SPECIAL CASE:`);
//           console.log(
//             `- Using current payroll values instead of historical data`,
//           );
//           console.log(`- Earnings: Setting to monthly CTC (₹${monthlyCTC})`);
//           console.log(`- PF: Setting to employee PF (₹${employeePF})`);

//           earningsByMonth[key] = Number(monthlyCTC);
//           pfByMonth[key] = Number(employeePF);

//           if (itemDate <= today) {
//             console.log(
//               `- TDS: Using historical value (₹${item.tdsAmount || 0}) since payroll date is in past`,
//             );
//             tdsByMonth[key] = Number(item.tdsAmount || 0);
//           } else {
//             console.log(`- TDS: Not setting (future payroll)`);
//           }

//           processedMonths.add(key);
//           return;
//         }

//         const earnings = Number(item.totalEarnings || monthlyCTC);
//         const benefits = Number(item.totalBenefits || 0);
//         const totalEarnings = earnings + benefits;
//         const tds = Number(item.tdsAmount || 0);

//         // Modified PF calculation logic
//         const pf = isFutureMonth
//           ? Number(employeePF) // Always use employeePF for future months
//           : item.complienceDeduction !== null
//             ? Number(item.complienceDeduction)
//             : 0; // Treat null as 0 for past months

//         console.log(`\n📅 Processing historical record for ${key}:`);
//         console.log(`- Earnings: ${earningsByMonth[key]} → ${totalEarnings}`);
//         console.log(`- TDS: ${tdsByMonth[key]} → ${tds}`);
//         console.log(
//           `- PF: ${pfByMonth[key]} → ${pf} (${
//             isFutureMonth
//               ? "Future month - using employeePF"
//               : item.complienceDeduction !== null
//                 ? "Historical value"
//                 : "Null treated as 0"
//           })`,
//         );
//         console.log(`- Benefits: ${benefitsByMonth[key]} → ${benefits}`);

//         earningsByMonth[key] = totalEarnings;
//         tdsByMonth[key] = key < today.toISOString().slice(0, 7) ? tds : 0;
//         pfByMonth[key] = pf;
//         benefitsByMonth[key] = benefits;
//         processedMonths.add(key);
//       });

//     // Fill in missing months with carried forward values
//     allMonths.forEach((monthKey) => {
//       if (!processedMonths.has(monthKey)) {
//         const monthDate = new Date(monthKey + "-01");
//         const currentMonth = today.toISOString().slice(0, 7);
//         const isCurrentOrFuture = monthKey >= currentMonth;
//         if (monthKey === currentMonth) {
//           earningsByMonth[monthKey] =
//             earningsByMonth[monthKey] || Number(monthlyCTC);
//         } else {
//           earningsByMonth[monthKey] = isCurrentOrFuture
//             ? Number(monthlyCTC)
//             : 0;
//         }

//         console.log(`\n⏳ Filling missing month ${monthKey}:`);
//         console.log(
//           `- Status: ${isCurrentOrFuture ? "Current/Future" : "Past"}`,
//         );

//         earningsByMonth[monthKey] = isCurrentOrFuture ? Number(monthlyCTC) : 0;
//         pfByMonth[monthKey] = isCurrentOrFuture ? Number(employeePF) : 0;
//         benefitsByMonth[monthKey] = 0;
//         tdsByMonth[monthKey] = monthDate < today ? 0 : tdsByMonth[monthKey];

//         console.log(
//           `- Earnings: Set to ${isCurrentOrFuture ? "monthly CTC" : "0"} (₹${earningsByMonth[monthKey]})`,
//         );
//         console.log(
//           `- PF: Set to ${isCurrentOrFuture ? "employee PF" : "0"} (₹${pfByMonth[monthKey]})`,
//         );
//         console.log(`- Benefits: Set to 0`);
//         console.log(
//           `- TDS: Set to ${monthDate < today ? "0 (missing past month)" : "unchanged"}`,
//         );
//       }
//     });

//     // Rest of the code remains exactly the same...
//     console.log(`\n📊 FINAL MONTHLY BREAKDOWN FOR EMPLOYEE ${employeeId}:`);
//     console.table(
//       allMonths.map((monthKey) => ({
//         Month: monthKey,
//         Earnings: earningsByMonth[monthKey],
//         PF: pfByMonth[monthKey],
//         TDS: tdsByMonth[monthKey],
//         Benefits: benefitsByMonth[monthKey],
//         Status:
//           payrollMonth === monthKey
//             ? "CURRENT PAYROLL"
//             : processedMonths.has(monthKey)
//               ? "HISTORICAL"
//               : "CALCULATED",
//       })),
//     );

//     // Compute totals (unchanged)
//     const finalTotal = Object.values(earningsByMonth).reduce(
//       (sum, val) => sum + Number(val),
//       0,
//     );
//     const totalTdsAmount = Object.values(tdsByMonth).reduce(
//       (sum, val) => sum + Number(val),
//       0,
//     );
//     const totalPfAmount = Object.values(pfByMonth).reduce(
//       (sum, val) => sum + Number(val),
//       0,
//     );
//     const totalBenefits = Object.values(benefitsByMonth).reduce(
//       (sum, val) => sum + Number(val),
//       0,
//     );

//     console.log(`\n💰 EMPLOYEE ${employeeId} FINAL TOTALS:`);
//     console.log(`- Final Total Earnings: ₹${finalTotal}`);
//     console.log(`- Total TDS: ₹${totalTdsAmount}`);
//     console.log(`- Total PF: ₹${totalPfAmount}`);
//     console.log(`- Total Benefits: ₹${totalBenefits}`);

//     const lastPaidMonth = Object.entries(tdsByMonth)
//       .filter(([month, amount]) => Number(amount) > 0)
//       .map(([month]) => month)
//       .sort()
//       .pop();

//     console.log(`- Last month with TDS payment: ${lastPaidMonth || "None"}`);

//     results[employeeId] = {
//       finalTotal,
//       totalTdsAmount,
//       totalPfAmount,
//       totalBenefits,
//       lastPaidMonth,
//       earningsByMonth,
//       tdsByMonth,
//       pfByMonth,
//       benefitsByMonth,
//       existingTds: existingTdsData[employeeId] || null,
//     };
//   }

//   const batchResults = await batchProcessTdsDeduction(
//     results,
//     startDate,
//     endDate,
//   );
//   console.log("\n=== BATCH PROCESSING COMPLETE ===");
//   return batchResults;
// };
const calculationLogic = async (data, employeeData, payrollEndDate) => {
  const results = {};
  const payrollMonth = payrollEndDate
    ? new Date(payrollEndDate).toISOString().slice(0, 7)
    : null;

  // Fetch all existing TDS records once
  const existingTdsData = await getTdsDeductionByUsers(
    employeeData.map((e) => e.employeeId),
    startDate,
    endDate,
  );
  const allTdsRules = {
    newRegime: await getTdsRules("newRegime"),
    oldRegime: await getTdsRules("oldRegime"),
  };
  // Loop through each employee
  for (const employee of employeeData) {
    const {
      employeeId,
      monthlyCTC,
      employeePF,
      currentEarnings,
      currentBenefits,
      currentPF,
    } = employee;

    if (!employeeId) {
      console.error(`❌ Missing employeeId for record:`, employee);
      continue;
    }

    const earningsByMonth = {};
    const pfByMonth = {};
    const tdsByMonth = {};
    let date = new Date(startDate);
    const finalDate = new Date(endDate);

    while (date <= finalDate) {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const record = data.find((item) => {
        const dt = new Date(item.endDate || item.startDate);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
        return item.employee === employeeId && key === monthKey;
      });
      //  for past
      if (monthKey < payrollMonth) {
        earningsByMonth[monthKey] =
          Number(record?.totalEarnings ?? 0) +
          Number(record?.totalBenefits ?? 0);
        pfByMonth[monthKey] = Number(record?.complienceDeduction ?? 0);
        tdsByMonth[monthKey] = Number(record?.tdsAmount ?? 0);
      } else if (monthKey === payrollMonth) {
        earningsByMonth[monthKey] =
          Number(currentEarnings ?? 0) + Number(currentBenefits ?? 0);
        pfByMonth[monthKey] = Number(currentPF ?? 0);
        tdsByMonth[monthKey] = 0;
      } else {
        earningsByMonth[monthKey] = Number(monthlyCTC ?? 0);
        pfByMonth[monthKey] = Number(employeePF ?? 0);
        tdsByMonth[monthKey] = 0;
      }

      date.setMonth(date.getMonth() + 1);
    }

    const sum = (obj) =>
      Object.values(obj).reduce((s, v) => s + Number(v || 0), 0);
    const finalTotal = sum(earningsByMonth);
    const totalPfAmount = sum(pfByMonth);
    const totalTdsAmount = sum(tdsByMonth);

    // Existing TDS info
    const existingTds = existingTdsData[employeeId] || [];
    const existingTdsRecord = existingTds[0] || null;
    const deductionCal =
      Number(existingTdsRecord?.deduction || 0) + totalPfAmount;
    const regime = existingTdsRecord?.regime || "newRegime";
    const standardDeduction = existingTdsRecord?.standardDeduction || 75000;
    const exemption = existingTdsRecord?.exemption || 0;

    // Tax calculation
    const taxableIncome =
      regime === "oldRegime"
        ? finalTotal - deductionCal - exemption - standardDeduction
        : finalTotal - standardDeduction;

    const taxSlabs = allTdsRules[regime];
    const taxLiabilities = calculateProgressiveTax(taxableIncome, taxSlabs);

    const rebate =
      regime === "oldRegime"
        ? taxableIncome <= 500000
          ? taxLiabilities
          : 0
        : taxableIncome <= 1200000
          ? taxLiabilities
          : 0;

    const finalTaxLiabilities = taxLiabilities - rebate;
    const health = finalTaxLiabilities * 0.04;
    const paidTax = finalTaxLiabilities + health;

    // Remaining TDS calculation
    let tdsPerMonth = totalTdsAmount;
    let remainingTds = 0;
    let remainingMonths = 0;

    if (existingTdsRecord?.id) {
      remainingTds = existingTdsRecord.paidTax - totalTdsAmount;
      remainingMonths = calculateRemainingMonths(
        startDate,
        endDate,
        payrollEndDate,
      );
      tdsPerMonth = remainingMonths > 0 ? remainingTds / remainingMonths : 0;
    } else {
      remainingTds = paidTax - totalTdsAmount;
      remainingMonths = calculateRemainingMonths(
        startDate,
        endDate,
        payrollEndDate,
      );
      tdsPerMonth =
        remainingMonths > 0 ? remainingTds / remainingMonths : remainingTds;
    }

    results[employeeId] = {
      id: existingTdsRecord?.id,
      finalTotal,
      totalPfAmount,
      totalTdsAmount,
      earningsByMonth,
      pfByMonth,
      tdsByMonth,
      existingTds,
      tdsPerMonth,
      paidTax,
      remainingTds,
      remainingMonths,
      deduction: deductionCal,
      standardDeduction,
      exemption,
      taxableIncome,
      taxLiabilities,
      rebate,
      health,
      employeeId,
      regime,
    };
  }

  await saveTdsDeduction(results, startDate, endDate);

  return results;
};

const saveTdsDeduction = async (results, startDate, endDate) => {
  try {
    const postPayload = [];
    const patchPayload = [];

    for (const res of Object.values(results)) {
      const common = {
        regime: res.regime,
        totalEarnings: res.finalTotal,
        totalDeductions: res.deduction,
        taxableIncome: res.taxableIncome,
        taxLiabilties: res.taxLiabilities,
        deduction: res.deduction,
        standardDeduction: res.standardDeduction,
        exemption: res.exemption,
        rebate: res.rebate || 0,
        healthEducation: res.health || 0,
        paidTax: res.paidTax,
      };

      if (res.id) {
        patchPayload.push({ id: res.id, ...common });
      } else {
        postPayload.push({
          employer: res.employeeId,
          ...common,
          startDate,
          endDate,
        });
      }
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    if (postPayload.length > 0) {
      const postResp = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tdsDeduction`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(postPayload),
        },
      );
      if (!postResp.ok)
        throw new Error(`Batch POST failed: ${postResp.status}`);
    }

    if (patchPayload.length > 0) {
      const patchResp = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tdsDeduction`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(patchPayload),
        },
      );
      if (!patchResp.ok)
        throw new Error(`Batch PATCH failed: ${patchResp.status}`);
    }
  } catch (error) {
    console.error("Error saving TDS deduction:", error);
  }
};

// const batchProcessTdsDeduction = async (
//   employeeResults,
//   startDate,
//   endDate,
//   payrollEndDate
// ) => {
//   if (!token) return {};

//   const batchOperations = [];
//   const finalResults = {};

//   // Prepare batch operations
//   for (const [employeeId, result] of Object.entries(employeeResults)) {
//     const {
//       finalTotal,
//       totalTdsAmount,
//       totalPfAmount,
//       lastPaidMonth,
//       existingTds,
//     } = result;

//     const existingTdsRecord =
//       existingTds && existingTds.length > 0 ? existingTds[0] : null;
//     const deductionCal =
//       Number(existingTdsRecord?.deduction || 0) + Number(totalPfAmount);
//     const regime = existingTdsRecord?.regime || "newRegime";
//     const standardDeduction = existingTdsRecord?.standardDeduction || 75000;
//     const exemption = existingTdsRecord?.exemption || 0;

//     batchOperations.push({
//       employeeId,
//       finalTotal,
//       totalTdsAmount,
//       totalPfAmount,
//       lastPaidMonth,
//       existingTdsRecord,
//       deductionCal,
//       regime,
//       standardDeduction,
//       exemption,
//       startDate,
//       endDate,
//     });
//   }

//   // Get tax rules once for all employees
//   const taxRulesCache = {};
//   const uniqueRegimes = [...new Set(batchOperations.map((op) => op.regime))];

//   for (const regime of uniqueRegimes) {
//     taxRulesCache[regime] = await getTdsRules(regime);
//   }

//   // Separate POST and PATCH operations
//   const postOperations = [];
//   const patchOperations = [];

//   for (const operation of batchOperations) {
//     const {
//       employeeId,
//       finalTotal,
//       totalTdsAmount,
//       totalPfAmount,
//       lastPaidMonth,
//       existingTdsRecord,
//       deductionCal,
//       regime,
//       standardDeduction,
//       exemption,
//       startDate,
//       endDate,
//     } = operation;

//     // Calculate tax
//     const totalEarnings = finalTotal;
//     const totalDeductions = deductionCal;
//     const taxableIncome =
//       regime === "oldRegime"
//         ? totalEarnings - totalDeductions - exemption - standardDeduction
//         : totalEarnings - standardDeduction;

//     const taxSlabs = taxRulesCache[regime] || [];
//     const taxLiabilties = calculateProgressiveTax(taxableIncome, taxSlabs);

//     const rebate =
//       regime === "oldRegime"
//         ? taxableIncome <= 500000
//           ? taxLiabilties
//           : 0
//         : taxableIncome <= 1200000
//           ? taxLiabilties
//           : 0;

//     const finalTaxLiabilities = taxLiabilties - rebate;
//     const health = finalTaxLiabilities * 0.04;
//     const paidTax = finalTaxLiabilities + health;

//     if (existingTdsRecord?.id) {
//       if (totalEarnings !== existingTdsRecord.totalEarnings) {
//         // PATCH operation
//         patchOperations.push({
//           id: existingTdsRecord.id,
//           employeeId,
//           totalEarnings,
//           taxableIncome,
//           taxLiabilties,
//           totalDeductions,
//           rebate,
//           healthEducation: health,
//           paidTax,
//           totalTdsAmount,
//           startDate,
//           endDate,
//         });
//       } else {
//         // No change needed, calculate remaining TDS
//         const remainingTds = existingTdsRecord.paidTax - totalTdsAmount;
//         const remainingMonths = calculateRemainingMonths(startDate, endDate, payrollEndDate  );
//         const tdsPerMonth =
//           remainingMonths > 0 ? remainingTds / remainingMonths : 0;

//         finalResults[employeeId] = {
//           ...employeeResults[employeeId],
//           tdsPerMonth,
//           paidTax: existingTdsRecord.paidTax,
//           remainingTds,
//           remainingMonths,
//         };
//       }
//     } else {
//       // POST operation
//       postOperations.push({
//         employeeId,
//         regime,
//         standardDeduction,
//         totalEarnings,
//         exemption,
//         totalDeductions,
//         taxableIncome,
//         taxLiabilties,
//         deduction: deductionCal,
//         startDate,
//         endDate,
//         employer: employeeId,
//         rebate,
//         healthEducation: health,
//         paidTax,
//         totalTdsAmount,
//       });
//     }
//   }

//   // Execute batch POST operations
//   if (postOperations.length > 0) {
//     try {
//       const postResponse = await fetch(
//         `${import.meta.env.VITE_API_URL}/items/tdsDeduction`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(
//             postOperations.map((op) => ({
//               regime: op.regime,
//               standardDeduction: op.standardDeduction,
//               totalEarnings: op.totalEarnings,
//               exemption: op.exemption,
//               totalDeductions: op.totalDeductions,
//               taxableIncome: op.taxableIncome,
//               taxLiabilties: op.taxLiabilties,
//               deduction: op.deduction,
//               startDate: op.startDate,
//               endDate: op.endDate,
//               employer: op.employer,
//               rebate: op.rebate,
//               healthEducation: op.healthEducation,
//               paidTax: op.paidTax,
//             })),
//           ),
//         },
//       );

//       if (postResponse.ok) {
//         const postResult = await postResponse.json();
//         const createdRecords = Array.isArray(postResult.data)
//           ? postResult.data
//           : [postResult.data];

//         // Process POST results
//         postOperations.forEach((op, index) => {
//           const createdRecord = createdRecords[index];
//           if (createdRecord) {
//             const remainingTds = createdRecord.paidTax - op.totalTdsAmount;
//             const remainingMonths = calculateRemainingMonths(
//               op.startDate,
//               op.endDate,payrollEndDate
//             );
//             const tdsPerMonth =
//               remainingMonths > 0 ? remainingTds / remainingMonths : 0;

//             finalResults[op.employeeId] = {
//               ...employeeResults[op.employeeId],
//               tdsPerMonth,
//               paidTax: createdRecord.paidTax,
//               remainingTds,
//               remainingMonths,
//             };
//           }
//         });
//       } else {
//         console.error(`Batch POST failed with status: ${postResponse.status}`);
//         // Fallback to individual POST calls
//         for (const op of postOperations) {
//           finalResults[op.employeeId] = await processSingleTdsOperation(
//             op,
//             "POST",
//             employeeResults,
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Batch POST error:", error);
//       // Fallback to individual POST calls
//       for (const op of postOperations) {
//         finalResults[op.employeeId] = await processSingleTdsOperation(
//           op, payrollEndDate  ,
//           "POST",
//           employeeResults,
//         );
//       }
//     }
//   }

//   // Execute batch PATCH operations
//   if (patchOperations.length > 0) {
//     try {
//       // Build batch PATCH URL with multiple IDs
//       const patchIds = patchOperations.map((op) => op.id);
//       const patchUrl = `${import.meta.env.VITE_API_URL}/items/tdsDeduction`;

//       const patchResponse = await fetch(patchUrl, {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(
//           patchOperations.map((op) => ({
//             id: op.id,
//             totalEarnings: op.totalEarnings,
//             taxableIncome: op.taxableIncome,
//             taxLiabilties: op.taxLiabilties,
//             totalDeductions: op.totalDeductions,
//             rebate: op.rebate,
//             healthEducation: op.healthEducation,
//             paidTax: op.paidTax,
//           })),
//         ),
//       });

//       if (patchResponse.ok) {
//         const patchResult = await patchResponse.json();
//         const updatedRecords = Array.isArray(patchResult.data)
//           ? patchResult.data
//           : [patchResult.data];

//         // Process PATCH results
//         patchOperations.forEach((op, index) => {
//           const updatedRecord = updatedRecords[index];
//           if (updatedRecord) {
//             const remainingTds = updatedRecord.paidTax - op.totalTdsAmount;
//             const remainingMonths = calculateRemainingMonths(
//               op.startDate,
//               op.endDate,payrollEndDate
//             );
//             const tdsPerMonth =
//               remainingMonths > 0 ? remainingTds / remainingMonths : 0;

//             finalResults[op.employeeId] = {
//               ...employeeResults[op.employeeId],
//               tdsPerMonth,
//               paidTax: updatedRecord.paidTax,
//               remainingTds,
//               remainingMonths,
//             };
//           }
//         });
//       } else {
//         console.error(
//           `Batch PATCH failed with status: ${patchResponse.status}`,
//         );
//         // Fallback to individual PATCH calls
//         for (const op of patchOperations) {
//           finalResults[op.employeeId] = await processSingleTdsOperation(
//             op,payrollEndDate  ,
//             "PATCH",
//             employeeResults,
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Batch PATCH error:", error);
//       // Fallback to individual PATCH calls
//       for (const op of patchOperations) {
//         finalResults[op.employeeId] = await processSingleTdsOperation(
//           op,payrollEndDate  ,
//           "PATCH",
//           employeeResults,
//         );
//       }
//     }
//   }

//   return finalResults;
// };

// // Helper function for individual API calls when batch fails
// const processSingleTdsOperation = async (
//   operation,
//   method,
//   employeeResults
// ) => {
//   try {
//     const url =
//       method === "POST"
//         ? `${import.meta.env.VITE_API_URL}/items/tdsDeduction`
//         : `${import.meta.env.VITE_API_URL}/items/tdsDeduction/${operation.id}`;

//     const body =
//       method === "POST"
//         ? {
//             regime: operation.regime,
//             standardDeduction: operation.standardDeduction,
//             totalEarnings: operation.totalEarnings,
//             exemption: operation.exemption,
//             totalDeductions: operation.totalDeductions,
//             taxableIncome: operation.taxableIncome,
//             taxLiabilties: operation.taxLiabilties,
//             deduction: operation.deduction,
//             startDate: operation.startDate,
//             endDate: operation.endDate,
//             employer: operation.employer,
//             rebate: operation.rebate,
//             healthEducation: operation.healthEducation,
//             paidTax: operation.paidTax,
//           }
//         : {
//             totalEarnings: operation.totalEarnings,
//             taxableIncome: operation.taxableIncome,
//             taxLiabilties: operation.taxLiabilties,
//             totalDeductions: operation.totalDeductions,
//             rebate: operation.rebate,
//             healthEducation: operation.healthEducation,
//             paidTax: operation.paidTax,
//           };

//     const response = await fetch(url, {
//       method,
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });

//     if (!response.ok) {
//       throw new Error(`${method} failed with status: ${response.status}`);
//     }

//     const result = await response.json();
//     const tax = result.data.paidTax;

//     const remainingTds = tax - operation.totalTdsAmount;
//     const remainingMonths = calculateRemainingMonths(
//       operation.startDate,
//       operation.endDate,
//        operation.payrollEndDate
//     );
//     const tdsPerMonth =
//       remainingMonths > 0 ? remainingTds / remainingMonths : 0;

//     return {
//       ...employeeResults[operation.employeeId],
//       tdsPerMonth,
//       paidTax: tax,
//       remainingTds,
//       remainingMonths,
//     };
//   } catch (error) {
//     console.error(
//       `Error in single ${method} operation for employee ${operation.employeeId}:`,
//       error,
//     );
//     return {
//       ...employeeResults[operation.employeeId],
//       tdsPerMonth: 0,
//       error: error.message,
//     };
//   }
// };

const getTdsRules = async (regime) => {
  if (!token || !regime) return [];

  try {
    const queryString = ["fields[]=newRegime", "fields[]=oldRegime"].join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tdsRules?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GET TDS rules failed: ${response.status}`);
    }

    const result = await response.json();
    const ruleData = result.data?.[0];

    return ruleData?.[regime]?.taxSlabs || [];
  } catch (error) {
    console.error("Error fetching TDS rules:", error);
    return [];
  }
};

const calculateProgressiveTax = (taxableIncome, taxSlabs) => {
  if (!taxSlabs || taxSlabs.length === 0) return 0;

  let remainingIncome = Math.max(0, taxableIncome);
  let taxAmount = 0;

  for (const slab of taxSlabs) {
    if (remainingIncome <= 0) break;

    const { range, percentage } = slab;
    let lower = 0,
      upper = 0;

    if (range.includes("above") || range.includes("and above")) {
      lower = parseInt(range.replace(/\D/g, ""));
      upper = Infinity;
    } else {
      const parts = range.split("-");
      if (parts.length === 2) {
        lower = parseInt(parts[0].trim());
        upper = parseInt(parts[1].trim());
      }
    }

    if (taxableIncome > lower) {
      const incomeInSlab =
        upper === Infinity
          ? remainingIncome
          : Math.min(remainingIncome, upper - lower);

      const taxForSlab = Math.round(incomeInSlab * (percentage / 100));
      taxAmount += taxForSlab;
      remainingIncome -= incomeInSlab;
    }
  }

  return taxAmount;
};

const calculateRemainingMonths = (
  startDate,
  endDate,
  payrollEndDate = null,
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const referenceDate = payrollEndDate ? new Date(payrollEndDate) : new Date();

  const referenceMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1,
  );

  let months = 0;
  let tempDate = new Date(Math.max(start.getTime(), referenceMonth.getTime()));

  while (tempDate <= end) {
    months++;
    tempDate.setMonth(tempDate.getMonth() + 1);
  }

  console.log(
    `Remaining months from ${referenceMonth.toISOString().slice(0, 7)} to ${endDate} = ${months}`,
  );
  return Math.max(0, months);
};

export { fetchPayrollVerification };
