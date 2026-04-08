import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const fetchAllPayrollData = async (userIds, selectedYear, token) => {
  const batchSize = 100;
  const batches = [];
  const allResults = [];

  const userIdsCopy = [...userIds];
  while (userIdsCopy.length) {
    batches.push(userIdsCopy.splice(0, batchSize));
  }

  const baseParams = [
    "fields[]=ctc",    
    "fields[]=payableAmount",
    "fields[]=status",
    "fields[]=employee.assignedUser.first_name",
    "fields[]=endDate",
    "fields[]=startDate",
    "fields[]=deductions",
    "fields[]=earnings",
    "fields[]=id"
  ];

  for (const batch of batches) {
    const employeeIds = batch.join(",");
    const filterParams = [
      `filter[_and][0][_and][1][year(startDate)][_eq]=${selectedYear}`,
      `filter[_and][0][_and][2][employee][_in]=${employeeIds}`
    ];

    const queryParams = [...baseParams, ...filterParams];
    const queryString = queryParams.join("&");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items/payrollVerification?${queryString}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.data) {
        allResults.push(...data.data);
      }
    } catch (error) {
      console.error("Error fetching batch:", error);
      throw error;
    }
  }

  return allResults;
};

const formatFormDData = (payrollData, selectedYear) => {
  const uniqueEmployees = new Set(payrollData.map(item => item.employee?.id)).size;

  let totalEmployeeContribution = 0;
  let totalEmployerContribution = 0;

  payrollData.forEach(() => {
    totalEmployeeContribution += 20;
    totalEmployerContribution += 40;
  });

  const establishmentName = "Your Company Name";
  const establishmentAddress = "Your Company Address";
  const totalUnits = 1;

  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} Jan, ${currentDate.getFullYear()}`;
  const paymentId = `KLWB-${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 10000000000)}`;

  return {
    title: `FORM 'D'`,
    heading: "STATEMENT OF EMPLOYER'S AND EMPLOYEE'S CONTRIBUTION TO BE SENT BY THE EMPLOYER BY 15th JANUARY EVERY YEAR",
    year: selectedYear,
    establishment: {
      name: establishmentName,
      address: establishmentAddress,
      totalUnits: totalUnits
    },
    employerName: establishmentName,
    totalEmployees: uniqueEmployees,
    employeeContribution: totalEmployeeContribution,
    employerContribution: totalEmployerContribution,
    totalContribution: totalEmployeeContribution + totalEmployerContribution,
    payment: {
      amount: totalEmployeeContribution + totalEmployerContribution,
      interest: "",
      id: paymentId,
      date: formattedDate
    }
  };
};

const generateFormDPDF = (data) => {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.setTextColor(0, 57, 118);
  doc.text(data.title, 105, 15, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(data.heading, 105, 22, { align: 'center' });

  const tableBody = [
    ["1", "Name & Address of the Establishment", `${data.establishment.name}\n${data.establishment.address}\nUnits: ${data.establishment.totalUnits}`],
    ["2", "Name of the Employers", data.employerName],
    ["3", `Total No. of the Employees as on 31st December ${data.year}`, data.totalEmployees],
    ["4", "Employees Contribution @Rs. 20", data.employeeContribution],
    ["5", "Employer's Contribution @Rs. 40", data.employerContribution],
    ["6", "Total of Items 4 & 5", data.totalContribution],
    ["7", "Payment Details", 
      `Amount: ${data.payment.amount}\nInterest: ${data.payment.interest}\nPayment ID: ${data.payment.id}\nDate: ${data.payment.date}`]
  ];

  autoTable(doc, {
    head: [["S.NO", "TITLE", "DESCRIPTION"]],
    body: tableBody,
    startY: 30,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [0, 57, 118], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  doc.save(`Form_D_Report_${data.year}.pdf`);
};

// Main function to handle report download
export const downloadReport = async (selectedUserIds, selectedYear, token) => {
  if (!selectedUserIds.length) {
    console.warn("No users selected for Form D report");
    return;
  }

  try {
    const payrollData = await fetchAllPayrollData(selectedUserIds, selectedYear, token);

    if (!payrollData || payrollData.length === 0) {
      console.warn("No payroll data found for Form D report");
      return;
    }

    const formattedData = formatFormDData(payrollData, selectedYear);
    generateFormDPDF(formattedData);

  } catch (error) {
    console.error("Failed to generate Form D report:", error);
  }
};
