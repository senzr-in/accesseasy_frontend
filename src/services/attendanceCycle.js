//serverice/attendanceCycle.vue
export const getAttendanceCycles = async (tenantId, token) => {
  const queryParams = [
    "fields[]=endDate",
    "fields[]=includeWeekoffs",
    "fields[]=startDate",

    "fields[]=fixedCycle",
    "fields[]=startMonth",
    "fields[]=endMonth",
    "fields[]=includeHolidays",

    "fields[]=id",
    `filter[tenant][tenantId][_eq]=${tenantId}`,
    "filter[status][_neq]=archived",
  ].join("&");

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendanceCycle?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const cycle = data?.data?.[0];

    if (!cycle) return null;

    const dateRange = formatDate(cycle.startDate, cycle.endDate);

    return {
      cycleData: cycle,
      ...dateRange,
    };
  } catch (error) {
    console.error("Error fetching attendance cycles:", error);
    throw error;
  }
};

const formatDate = (startDay, endDay) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let startDate, endDate;

  if (startDay === 1) {
    const month = currentMonth === 0 ? 11 : currentMonth - 1;
    const year = currentMonth === 0 ? currentYear - 1 : currentYear;

    startDate = new Date(year, month, 1);
    endDate = new Date(year, month + 1, 0);
  } else {
    const startMonth =
      currentMonth - 2 < 0 ? 12 + (currentMonth - 2) : currentMonth - 2;
    const endMonth =
      currentMonth - 1 < 0 ? 12 + (currentMonth - 1) : currentMonth - 1;
    const startYear = currentMonth - 2 < 0 ? currentYear - 1 : currentYear;
    const endYear = currentMonth - 1 < 0 ? currentYear - 1 : currentYear;

    startDate = new Date(startYear, startMonth, startDay);
    endDate = new Date(endYear, endMonth, endDay);
  }

  const format = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return {
    formattedStartDate: format(startDate),
    formattedEndDate: format(endDate),
    rawStartDate: startDate,
    rawEndDate: endDate,
  };
};
