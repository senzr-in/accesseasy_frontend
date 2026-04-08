<template>
  <div class="attendance-wrapper">
    <!-- Header -->
    <div class="header-section">
      <div class="d-flex align-center">
        <div class="header-content">
          <div class="d-flex align-center gap-3">
            <v-btn
              v-if="showCalendarView"
              icon
              variant="text"
              @click="backToMonthlyView"
              class="calendar-nav-btn"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h1 class="main-title">{{ userData?.name }}'s Monthly Attendan</h1>
          </div>
          <p class="subtitle">{{ selectedYear }} Annual Timeline</p>
        </div>
      </div>
      <div class="d-flex align-center gap-2">
        <!-- <BaseButton
               size="md"
          variant="primary"
         :leftIcon="ArrowLeft"
          @click="downloadPDF"
          :loading="loading"
           :text="'EXPORT'"
        /> -->

        <BaseButton
          size="md"
          variant="primary"
          :leftIcon="Download"
          @click="downloadExcel"
          :loading="loading"
          :text="'EXPORT'"
        />
      </div>
    </div>

    <!-- Monthly Timeline Section -->
    <div v-if="!showCalendarView" class="timeline-section">
      <h2 class="section-title">Monthly Timeline</h2>

      <div class="timeline-container">
        <v-btn
          icon
          variant="text"
          class="timeline-nav-btn"
          @click="scrollTimeline('left')"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>

        <div class="timeline-scroll" ref="timelineScroll">
          <div class="timeline-wrapper">
            <div
              v-for="(month, index) in userMonthlyData"
              :key="index"
              class="timeline-month"
              :class="{ selected: selectedMonths.includes(month.monthName) }"
              @click="selectMonth(month)"
            >
              <div class="month-arrow"></div>
              <div class="month-square">
                <div class="month-abbr">
                  {{ getMonthAbbr(month.monthName) }}
                </div>
                <div class="month-stats-square">
                  <span class="present-text">{{ month.present || 0 }}d</span>
                  <span class="absent-text">{{ month.absent || 0 }}d</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <v-btn
          icon
          variant="text"
          class="timeline-nav-btn"
          @click="scrollTimeline('right')"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Selected Month Details -->
    <div
      v-if="!showCalendarView && selectedMonthData"
      class="month-details-section"
    >
      <div class="month-header">
        <div class="month-title-wrapper">
          <h2 class="month-title">
            {{ selectedMonthData.monthName }} {{ selectedYear }}
          </h2>
          <BaseButton
            size="md"
            variant="primary"
            @click="showMonthCalendar(selectedMonthData)"
            :text="'VIEW CALENDAR DETAILS'"
            :left-icon="ViewIcon"
          />
        </div>
        <span class="working-days"
          >{{ getTotalWorkingDays(selectedMonthData) }} working days</span
        >
      </div>

      <div class="stats-grid">
        <div class="stats-column">
          <!-- Presence Section -->
          <div class="stats-section">
            <h3 class="stats-title">Presence</h3>
            <div class="stats-chips">
              <v-chip
                class="stat-chip presence-chip"
                :class="{ 'has-value': selectedMonthData.present > 0 }"
              >
                Present {{ selectedMonthData.present || 0 }}
              </v-chip>
              <v-chip
                class="stat-chip presence-chip"
                :class="{ 'has-value': selectedMonthData.weekoffPresent > 0 }"
              >
                Weekoff Present {{ selectedMonthData.weekoffPresent || 0 }}
              </v-chip>
              <v-chip
                class="stat-chip presence-chip holiday-present"
                :class="{ 'has-value': selectedMonthData.holidayPresent > 0 }"
              >
                Holiday Present {{ selectedMonthData.holidayPresent || 0 }}
              </v-chip>
              <v-chip
                class="stat-chip presence-chip work-from-home"
                :class="{ 'has-value': selectedMonthData.workFromHome > 0 }"
              >
                Work From Home {{ selectedMonthData.workFromHome || 0 }}
              </v-chip>
            </div>
          </div>

          <!-- Absence Section -->
          <div class="stats-section">
            <h3 class="stats-title">Absence</h3>
            <div class="stats-chips">
              <v-chip
                class="stat-chip absence-chip"
                :class="{ 'has-value': selectedMonthData.absent > 0 }"
              >
                Absent {{ selectedMonthData.absent || 0 }}
              </v-chip>
              <v-chip
                class="stat-chip absence-chip half-day"
                :class="{ 'has-value': selectedMonthData.halfDay > 0 }"
              >
                Half Day {{ selectedMonthData.halfDay || 0 }}
              </v-chip>
              <v-chip
                class="stat-chip absence-chip week-off"
                :class="{ 'has-value': selectedMonthData.weekOff > 0 }"
              >
                Week Off {{ selectedMonthData.weekOff || 0 }}
              </v-chip>
              <v-chip
                class="stat-chip absence-chip holiday"
                :class="{ 'has-value': selectedMonthData.holiday > 0 }"
              >
                Holiday {{ selectedMonthData.holiday || 0 }}
              </v-chip>
            </div>
          </div>
        </div>

        <div class="stats-column">
          <!-- Leaves Section -->
          <div class="stats-section">
            <h3 class="stats-title">Leaves</h3>
            <div class="stats-chips">
              <v-chip
                class="stat-chip leave-chip paid-leave"
                :class="{ 'has-value': selectedMonthData.paidLeave > 0 }"
              >
                Paid Leave {{ selectedMonthData.paidLeave || 0 }}
              </v-chip>
              <v-chip
                class="stat-chip leave-chip unpaid-leave"
                :class="{ 'has-value': selectedMonthData.unPaidLeave > 0 }"
              >
                Unpaid Leave {{ selectedMonthData.unPaidLeave || 0 }}
              </v-chip>
              <v-chip
                class="stat-chip leave-chip early-leaving"
                :class="{ 'has-value': selectedMonthData.earlyLeaving > 0 }"
              >
                Early Leaving {{ selectedMonthData.earlyLeaving || 0 }}
              </v-chip>
              <v-chip
                class="stat-chip leave-chip late-coming"
                :class="{ 'has-value': selectedMonthData.lateComing > 0 }"
              >
                Late Coming {{ selectedMonthData.lateComing || 0 }}
              </v-chip>
            </div>
          </div>

          <!-- Overtime Section -->
          <div class="stats-section">
            <h3 class="stats-title">Overtime</h3>
            <div class="stats-chips">
              <v-chip
                class="stat-chip overtime-chip"
                :class="{ 'has-value': selectedMonthData.workingDayOT > 0 }"
              >
                Working Days OT {{ selectedMonthData.workingDayOT || 0 }}
              </v-chip>
              <v-chip
                class="stat-chip overtime-chip"
                :class="{ 'has-value': selectedMonthData.holidayPresentOT > 0 }"
              >
                Holiday Present OT {{ selectedMonthData.holidayPresentOT || 0 }}
              </v-chip>
              <v-chip
                class="stat-chip overtime-chip"
                :class="{ 'has-value': selectedMonthData.weekoffPresentOT > 0 }"
              >
                Weekoff Present OT {{ selectedMonthData.weekoffPresentOT || 0 }}
              </v-chip>
              <v-chip
                class="stat-chip overtime-chip work-from-home-ot"
                :class="{ 'has-value': selectedMonthData.workFromHomeOT > 0 }"
              >
                Work From Home OT {{ selectedMonthData.workFromHomeOT || 0 }}
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar View -->
    <CalendarView
      v-if="showCalendarView"
      :month="selectedCalendarMonth"
      :year="selectedCalendarYear"
      :attendanceData="selectedMonthAttendanceData"
      :employee="userData"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import CalendarView from "./calanderView.vue";
import axios from "axios";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { useRoute, useRouter } from "vue-router";
import * as XLSX from "xlsx";
import {
  Download,
  DownloadCloud,
  Upload,
  UploadIcon,
  View,
  ViewIcon,
} from "lucide-vue-next";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

const props = defineProps({
  employeeId: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const userData = ref(null);
const attendanceData = ref([]);
const selectedYear = ref(new Date().getFullYear().toString());
const years = [selectedYear.value];
const selectedMonths = ref([]);
const showCalendarView = ref(false);
const selectedCalendarMonth = ref(0);
const selectedCalendarYear = ref(parseInt(selectedYear.value));
const selectedMonthAttendanceData = ref([]);
const userMonthlyData = ref([]);
const filterMonth = ref(null);
const monthlyDetailedData = ref({});
const timelineScroll = ref(null);
const userRole = currentUserTenant.getRole();
const isAdmin = computed(() => userRole === "Admin" || userRole === "Dealer");
const isEmployee = computed(() => userRole === "Employee");
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
console.log("Received employeeId:", props.employeeId);
const selectedMonthData = computed(() => {
  if (selectedMonths.value.length === 0) return null;
  return userMonthlyData.value.find(
    (m) => m.monthName === selectedMonths.value[0],
  );
});

onMounted(() => {
  parseUrlParams();
  fetchUserData();
});

watch(
  () => props.employeeId,
  () => {
    fetchUserData();
  },
);

watch(
  () => route.query,
  () => {
    parseUrlParams();
    fetchUserData();
  },
);

const parseUrlParams = () => {
  const { month, year, tenantId } = route.query;
  if (month) {
    filterMonth.value = parseInt(month);
  }
  if (year) {
    selectedYear.value = year;
    selectedCalendarYear.value = parseInt(year);
  }
};

const getMonthAbbr = (monthName) => {
  return monthName.substring(0, 3);
};

const getTotalWorkingDays = (monthData) => {
  return (
    (monthData.present || 0) +
    (monthData.absent || 0) +
    (monthData.halfDay || 0)
  );
};

const selectMonth = async (month) => {
  selectedMonths.value = [month.monthName]; // Always set the selected month
  await handleMonthSelection(month);
};

const backToMonthlyView = () => {
  showCalendarView.value = false;
};

const scrollTimeline = (direction) => {
  const container = timelineScroll.value;
  if (container) {
    const scrollAmount = 200;
    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  }
};

// Auto-select current month when data is loaded
const autoSelectCurrentMonth = () => {
  const currentMonth = new Date().getMonth(); // 0-based index
  const currentMonthName = monthNames[currentMonth];

  const foundMonth = userMonthlyData.value.find(
    (m) => m.monthName === currentMonthName,
  );
  if (foundMonth && selectedMonths.value.length === 0) {
    selectedMonths.value = [foundMonth.monthName];
    handleMonthSelection(foundMonth);
  }
};

// Keep all existing methods unchanged
const handleMonthSelection = async (month) => {
  if (selectedMonths.value.includes(month.monthName)) {
    await fetchMonthDetailedData(month.monthName);
  }
};

const fetchUserData = async () => {
  loading.value = true;
  try {
    const token = authService.getToken();
    const tenantId =
      route.query.tenantId || (await currentUserTenant.getTenantId());

    if (!token || !tenantId) {
      console.error("Authentication required or tenant not found");
      return;
    }

    const userResponse = await axios.get(
      `${import.meta.env.VITE_API_URL}/items/personalModule?filter[_and][0][id][_eq]=${props.employeeId}&fields[]=assignedUser.first_name&fields[]=assignedUser.last_name&fields[]=id&fields[]=employeeId&fields[]=assignedDepartment.department_id.departmentName`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (userResponse.data.data && userResponse.data.data.length > 0) {
      const user = userResponse.data.data[0];
      userData.value = {
        id: user.id,
        name: `${user.assignedUser.first_name} ${user.assignedUser.last_name || ""}`,
        employeeId: user.employeeId,
        department:
          user.assignedDepartment?.[0]?.department_id?.departmentName || "N/A",
      };

      let attendanceUrl = `${import.meta.env.VITE_API_URL}/attendance/monthly-dashboard?tenantId=${tenantId}&employeeId=${user.id}&year=${selectedYear.value}`;

      if (filterMonth.value) {
        attendanceUrl += `&month=${filterMonth.value}`;
      }
      attendanceUrl += "&page=1&limit=25";

      const attendanceResponse = await axios.get(attendanceUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (attendanceResponse.data && attendanceResponse.data.data) {
        userMonthlyData.value = attendanceResponse.data.data;

        if (filterMonth.value) {
          const monthName = monthNames[filterMonth.value - 1];
          const foundMonth = userMonthlyData.value.find(
            (m) => m.monthName === monthName,
          );
          if (foundMonth) {
            selectedMonths.value = [foundMonth.monthName];
            await fetchMonthDetailedData(foundMonth.monthName);
          }
        } else {
          // Auto-select current month if no filter month is provided
          autoSelectCurrentMonth();
        }
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  } finally {
    loading.value = false;
  }
};

const fetchMonthDetailedData = async (monthName) => {
  try {
    const token = authService.getToken();
    const tenantId =
      route.query.tenantId || (await currentUserTenant.getTenantId());

    if (!token || !tenantId || !userData.value?.id) {
      console.error("Authentication required or tenant not found");
      return null;
    }

    const monthNumber = monthNames.indexOf(monthName) + 1;
    const url = `${import.meta.env.VITE_API_URL}/attendance/monthly-dashboard?tenantId=${tenantId}&employeeId=${userData.value?.id}&year=${selectedYear.value}&month=${monthNumber}&fields=*.*`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.data && response.data.data) {
      monthlyDetailedData.value[monthName] = response.data;
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching detailed data for ${monthName}:`, error);
    return null;
  }
};

const showMonthCalendar = (month) => {
  const monthIndex = monthNames.indexOf(month.monthName);
  selectedCalendarMonth.value = monthIndex;
  selectedCalendarYear.value = parseInt(selectedYear.value);

  if (
    monthlyDetailedData.value[month.monthName] &&
    monthlyDetailedData.value[month.monthName].data &&
    monthlyDetailedData.value[month.monthName].data.dailyRecords
  ) {
    selectedMonthAttendanceData.value =
      monthlyDetailedData.value[month.monthName].data.dailyRecords;
  } else {
    selectedMonthAttendanceData.value = [];
    fetchMonthDetailedData(month.monthName).then((data) => {
      if (data && data.data && data.data.dailyRecords) {
        selectedMonthAttendanceData.value = data.data.dailyRecords;
      }
    });
  }
  showCalendarView.value = true;
};

// Keep all existing export methods unchanged
const extractAllFields = (record) => {
  const flatRecord = { ...record };
  if (flatRecord.employeeId && typeof flatRecord.employeeId === "object") {
    flatRecord.employeeId = flatRecord.employeeId.employeeId || "";
  }

  for (const key in flatRecord) {
    if (
      typeof flatRecord[key] === "object" &&
      flatRecord[key] !== null &&
      !Array.isArray(flatRecord[key])
    ) {
      const nestedObj = flatRecord[key];
      for (const nestedKey in nestedObj) {
        if (
          typeof nestedObj[nestedKey] !== "object" ||
          nestedObj[nestedKey] === null
        ) {
          flatRecord[`${key}_${nestedKey}`] = nestedObj[nestedKey];
        }
      }
      delete flatRecord[key];
    }
  }
  return flatRecord;
};

const formatFieldName = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase());
};

const downloadPDF = async () => {
  try {
    loading.value = true;
    if (selectedMonths.value.length === 0) {
      alert("Please select at least one month to export");
      return;
    }

    const pdf = new jsPDF("l", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 10;

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Detailed Attendance Report", pageWidth / 2, margin + 10, {
      align: "center",
    });

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Employee: ${userData.value?.name} (${userData.value?.employeeId}) - Department: ${userData.value?.department}`,
      pageWidth / 2,
      margin + 18,
      { align: "center" },
    );

    for (const monthName of selectedMonths.value) {
      const monthData = userMonthlyData.value.find(
        (m) => m.monthName === monthName,
      );
      if (!monthData) continue;

      if (!monthlyDetailedData.value[monthName]) {
        await fetchMonthDetailedData(monthName);
      }

      const detailedData = monthlyDetailedData.value[monthName];
      pdf.addPage();

      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        `${monthName} ${selectedYear.value} - Monthly Summary`,
        margin,
        margin + 8,
      );

      const summaryData = [];
      const monthDataKeys = Object.keys(monthData).filter(
        (key) =>
          typeof monthData[key] !== "object" &&
          key !== "monthName" &&
          key !== "month" &&
          key !== "year",
      );

      for (let i = 0; i < monthDataKeys.length; i += 2) {
        const row = [
          formatFieldName(monthDataKeys[i]),
          monthData[monthDataKeys[i]] || 0,
        ];
        if (i + 1 < monthDataKeys.length) {
          row.push(
            formatFieldName(monthDataKeys[i + 1]),
            monthData[monthDataKeys[i + 1]] || 0,
          );
        } else {
          row.push("", "");
        }
        summaryData.push(row);
      }

      pdf.autoTable({
        startY: margin + 15,
        head: [["Metric", "Count", "Metric", "Count"]],
        body: summaryData,
        theme: "grid",
        headStyles: {
          fillColor: [75, 75, 75],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: { fontSize: 10 },
        margin: { left: margin, right: margin },
        columnStyles: { 0: { fontStyle: "bold" }, 2: { fontStyle: "bold" } },
      });

      if (
        detailedData?.data?.dailyRecords &&
        detailedData.data.dailyRecords.length > 0
      ) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          `${monthName} ${selectedYear.value} - Daily Attendance Records`,
          margin,
          margin + 8,
        );

        const dailyRecords = detailedData.data.dailyRecords;
        const sampleRecord = extractAllFields(dailyRecords[0]);
        const requiredFields = [
          "date",
          "attendance",
          "day",
          "leaveType",
          "attendanceContext",
          "onTime",
          "lateBy",
          "breakTime",
          "overTime",
          "earlyDeparture",
          "workHours",
          "inTime",
          "outTime",
          "action",
          "employeeId",
        ];

        const availableFields = requiredFields.filter(
          (field) => field in sampleRecord,
        );
        const headerRow = availableFields.map((field) =>
          formatFieldName(field),
        );
        const dailyRecordsData = dailyRecords.map((record) => {
          const flatRecord = extractAllFields(record);
          return availableFields.map((field) => {
            if (field === "date") {
              return format(new Date(flatRecord[field]), "dd MMM yyyy");
            }
            return flatRecord[field] !== null ? flatRecord[field] : "-";
          });
        });

        pdf.autoTable({
          startY: margin + 15,
          head: [headerRow],
          body: dailyRecordsData,
          theme: "grid",
          headStyles: {
            fillColor: [75, 75, 75],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          styles: { fontSize: 8 },
          margin: { left: margin, right: margin },
        });
      }
    }

    pdf.save(
      `${userData.value?.name}-attendance-${format(new Date(), "yyyy-MM-dd")}.pdf`,
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF. Please check console for details.");
  } finally {
    loading.value = false;
  }
};

const downloadExcel = async () => {
  try {
    loading.value = true;
    if (selectedMonths.value.length === 0) {
      alert("Please select at least one month to export");
      return;
    }

    const wb = XLSX.utils.book_new();

    for (const monthName of selectedMonths.value) {
      const monthData = userMonthlyData.value.find(
        (m) => m.monthName === monthName,
      );
      if (!monthData) continue;

      if (!monthlyDetailedData.value[monthName]) {
        await fetchMonthDetailedData(monthName);
      }

      const detailedData = monthlyDetailedData.value[monthName];
      const combinedData = [
        [`${monthName} ${selectedYear.value} - Attendance Report`],
        [
          `Employee: ${userData.value?.name} (${userData.value?.employeeId}) - Department: ${userData.value?.department}`,
        ],
        [],
        ["MONTHLY SUMMARY"],
        [],
        ["Metric", "Count", "", "Metric", "Count"],
      ];

      const monthDataKeys = Object.keys(monthData).filter(
        (key) =>
          typeof monthData[key] !== "object" &&
          key !== "monthName" &&
          key !== "month" &&
          key !== "year",
      );

      for (let i = 0; i < monthDataKeys.length; i += 2) {
        const row = [
          formatFieldName(monthDataKeys[i]),
          monthData[monthDataKeys[i]] || 0,
          "",
        ];
        if (i + 1 < monthDataKeys.length) {
          row.push(
            formatFieldName(monthDataKeys[i + 1]),
            monthData[monthDataKeys[i + 1]] || 0,
          );
        }
        combinedData.push(row);
      }

      combinedData.push(
        [],
        ["Cycle Information"],
        [
          "Cycle Type",
          monthData.cycleType || "Standard",
          "",
          "Total Days of Month",
          monthData.totalDaysOfMonth || 0,
        ],
        [
          "Cycle Start Date",
          monthData.cycleStartDate
            ? format(new Date(monthData.cycleStartDate), "dd MMM yyyy")
            : "-",
          "",
          "Cycle End Date",
          monthData.cycleEndDate
            ? format(new Date(monthData.cycleEndDate), "dd MMM yyyy")
            : "-",
        ],
        [],
        [],
      );

      if (
        detailedData?.data?.dailyRecords &&
        detailedData.data.dailyRecords.length > 0
      ) {
        const dailyRecords = detailedData.data.dailyRecords;
        combinedData.push(["DAILY ATTENDANCE RECORDS"], []);

        const sampleRecord = extractAllFields(dailyRecords[0]);
        const requiredFields = [
          "date",
          "attendance",
          "day",
          "leaveType",
          "attendanceContext",
          "onTime",
          "lateBy",
          "breakTime",
          "overTime",
          "earlyDeparture",
          "workHours",
          "inTime",
          "outTime",
          "action",
          "employeeId",
        ];

        const availableFields = requiredFields.filter(
          (field) => field in sampleRecord,
        );
        const headerRow = availableFields.map((field) =>
          formatFieldName(field),
        );
        combinedData.push(headerRow);

        dailyRecords.forEach((record) => {
          const flatRecord = extractAllFields(record);
          const row = availableFields.map((field) => {
            if (field === "date" && flatRecord[field]) {
              try {
                return format(new Date(flatRecord[field]), "dd MMM yyyy");
              } catch (e) {
                return flatRecord[field];
              }
            }
            return flatRecord[field] !== null && flatRecord[field] !== undefined
              ? flatRecord[field]
              : "-";
          });
          combinedData.push(row);
        });
      } else {
        combinedData.push(["No daily records available for this month"], []);
      }

      const ws = XLSX.utils.aoa_to_sheet(combinedData);
      const columnWidths = Array(15).fill({ wch: 15 });
      columnWidths[0] = { wch: 20 };
      ws["!cols"] = columnWidths;

      XLSX.utils.book_append_sheet(wb, ws, `${monthName} Report`);
    }

    XLSX.writeFile(
      wb,
      `${userData.value?.name}-attendance-${format(new Date(), "yyyy-MM-dd")}.xlsx`,
    );
  } catch (error) {
    console.error("Error generating Excel:", error);
    alert("Error generating Excel. Please check console for details.");
  } finally {
    loading.value = false;
  }
};

defineEmits(["close"]);
</script>

<style scoped>
.attendance-wrapper {
  background-color: #ffffff;
  min-height: 100vh;
  padding: 24px;
}
/* Replace circular with square styling */
.month-square {
  width: 135px;
  height: 100px;
  font-size: 16px;
  background: #f9fafb;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.timeline-month.selected .month-square {
  background: #1f2937;
  border-color: #1f2937;
  color: white;
}

.month-abbr {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.month-stats-square {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.month-stats-square .present-text,
.month-stats-square .absent-text {
  font-size: 12px;
  font-weight: 500;
}

.timeline-month.selected .month-stats-square .present-text,
.timeline-month.selected .month-stats-square .absent-text,
.timeline-month.selected .month-abbr {
  color: white;
}

/* Remove old connector and apply top line */

/* Arrow below the square */
.month-arrow {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #6b7280;
  margin-top: 4px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.back-btn {
  margin-right: 16px;
}

.header-content {
  flex: 1;
}

.main-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 4px 0 0 0;
}

.export-btn {
  height: 40px;
}

.calendar-nav-btn {
  margin-left: 8px;
}

.timeline-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 205600;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

.timeline-container {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.timeline-nav-btn {
  flex-shrink: 0;
  background: linear-gradient(145deg, #ffffff, #f3f4f6);
  border: 1px solid #d1d5db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.timeline-nav-btn:hover {
  background: linear-gradient(145deg, #e5e7eb, #d1d5db);
}

.timeline-scroll {
  flex: 1;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
  padding-bottom: 8px;
}

.timeline-scroll::-webkit-scrollbar {
  height: 8px;
}

.timeline-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.timeline-scroll::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}
.timeline-wrapper {
  display: flex;
  align-items: flex-start;
  padding: 16px 0;
  min-width: fit-content;
}
.timeline-month:not(:last-child) {
  margin-right: 16px;
}

.timeline-month {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
}

.timeline-month:hover {
  transform: translateY(-4px);
}

.month-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.timeline-connector {
  position: absolute;
  top: 24px;
  left: 50%;
  width: calc(100% + 16px);
  height: 4px;
  background: linear-gradient(to right, #d1d5db, #9ca3af);
  z-index: 1;
}

.timeline-month:first-child .timeline-connector {
  display: none;
}

.month-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffffff, #e5e7eb);
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  z-index: 2;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.timeline-month.selected .month-circle {
  background: linear-gradient(145deg, #1f2937, #374151);
  border-color: #1f2937;
  box-shadow: 0 6px 12px rgba(31, 41, 55, 0.3);
}

.month-abbr {
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
}
.timeline-line-above {
  position: absolute;
  top: 0;
  left: 0;
  height: 4px;
  width: 100%;
  background: linear-gradient(to right, #12499b, #9ca3af);
  z-index: 1;
}

.timeline-month.selected .month-abbr {
  color: #ffffff;
}

.month-details {
  text-align: center;
}

.month-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.month-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.present-text {
  font-size: 12px;
  color: #059669;
  font-weight: 500;
}

.absent-text {
  font-size: 12px;
  color: #dc2626;
  font-weight: 500;
}

.month-details-section {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
}

.month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.month-title-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.month-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.working-days {
  font-size: 14px;
  color: #6b7280;
  background-color: #f3f4f6;
  padding: 4px 12px;
  border-radius: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.stats-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-section {
  margin-bottom: 0;
}

.stats-title {
  font-size: 16px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 12px;
}

.stats-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stat-chip {
  height: 32px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 16px;
  border: 1px solid transparent;
}

/* Presence chips */
.presence-chip {
  background-color: #dcfce7 !important;
  color: #166534 !important;
  border-color: #bbf7d0;
}

.presence-chip.holiday-present {
  background-color: #fce7ff !important;
  color: #86198f !important;
  border-color: #f0abfc;
}

.presence-chip.work-from-home {
  background-color: #dcfce7 !important;
  color: #166534 !important;
  border-color: #bbf7d0;
}

/* Absence chips */
.absence-chip {
  background-color: #fee2e2 !important;
  color: #991b1b !important;
  border-color: #fecaca;
}

.absence-chip.half-day {
  background-color: #fef3c7 !important;
  color: #92400e !important;
  border-color: #fde68a;
}

.absence-chip.week-off {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
  border-color: #d1d5db;
}

.absence-chip.holiday {
  background-color: #fce7ff !important;
  color: #86198f !important;
  border-color: #f0abfc;
}

/* Leave chips */
.leave-chip.paid-leave {
  background-color: #fef3c7 !important;
  color: #92400e !important;
  border-color: #fde68a;
}

.leave-chip.unpaid-leave {
  background-color: #fee2e2 !important;
  color: #991b1b !important;
  border-color: #fecaca;
}

.leave-chip.early-leaving {
  background-color: #fef3c7 !important;
  color: #92400e !important;
  border-color: #fde68a;
}

.leave-chip.late-coming {
  background-color: #fee2e2 !important;
  color: #991b1b !important;
  border-color: #fecaca;
}

/* Overtime chips */
.overtime-chip {
  background-color: #dbeafe !important;
  color: #1e40af !important;
  border-color: #bfdbfe;
}

.overtime-chip.work-from-home-ot {
  background-color: #dbeafe !important;
  color: #1e40af !important;
  border-color: #bfdbfe;
}

/* Enhanced styling for chips with values */
.stat-chip.has-value {
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.view-calendar-btn {
  height: 40px;
  padding: 0 24px;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}
</style>
