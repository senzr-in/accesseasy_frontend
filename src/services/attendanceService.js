export const attendanceService = {
  /**
   * Get attendance time-series analytics (Today, 7 Days, 30 Days, Custom)
   */
  async getAttendanceAnalytics(timeframe = '7d', filter = {}) {
    if (timeframe === 'today') {
      return {
        categories: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
        series: [
          { name: 'Present', data: [320, 1150, 1680, 1780, 1810, 1842, 1820, 1790, 1650, 1200] },
          { name: 'Late', data: [15, 68, 92, 105, 105, 105, 105, 105, 105, 105] },
          { name: 'Absent', data: [450, 390, 360, 356, 356, 356, 356, 356, 356, 356] },
          { name: 'Leave', data: [87, 87, 87, 87, 87, 87, 87, 87, 87, 87] },
          { name: 'Overtime', data: [0, 0, 0, 0, 12, 45, 80, 140, 290, 420] }
        ],
        summary: {
          presentTotal: 1842,
          lateTotal: 105,
          absentTotal: 356,
          leaveTotal: 87,
          overtimeHours: '342 hrs'
        }
      };
    }

    if (timeframe === '30d') {
      const days = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
      return {
        categories: days,
        series: [
          { name: 'Present', data: [1780, 1820, 1840, 1810, 1835, 1200, 850, 1820, 1845, 1860, 1850, 1842, 1220, 890, 1830, 1850, 1840, 1865, 1870, 1210, 880, 1840, 1855, 1860, 1845, 1842, 1230, 895, 1850, 1842] },
          { name: 'Late', data: [65, 72, 80, 58, 64, 20, 10, 75, 82, 90, 68, 70, 22, 12, 60, 78, 85, 92, 70, 25, 15, 68, 74, 88, 65, 72, 20, 14, 60, 68] },
          { name: 'Absent', data: [380, 360, 350, 365, 355, 800, 1100, 360, 345, 340, 350, 356, 790, 1080, 360, 345, 350, 335, 340, 795, 1090, 355, 345, 340, 350, 356, 785, 1075, 350, 356] },
          { name: 'Leave', data: [95, 90, 85, 92, 88, 40, 30, 92, 86, 84, 89, 87, 45, 35, 90, 85, 88, 82, 85, 42, 32, 88, 84, 82, 86, 87, 44, 34, 86, 87] },
          { name: 'Overtime', data: [210, 240, 310, 290, 350, 80, 40, 230, 260, 320, 300, 340, 90, 50, 220, 250, 315, 295, 360, 85, 45, 225, 255, 330, 310, 342, 88, 48, 235, 342] }
        ],
        summary: {
          presentTotal: '97.2% Avg',
          lateTotal: '3.4% Avg',
          absentTotal: '4.8% Avg',
          leaveTotal: '2.8% Avg',
          overtimeHours: '8,420 hrs'
        }
      };
    }

    // Default: 7 Days
    return {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: [
        { name: 'Present', data: [1810, 1835, 1850, 1845, 1842, 620, 310] },
        { name: 'Late', data: [68, 74, 82, 60, 55, 12, 5] },
        { name: 'Absent', data: [365, 350, 340, 355, 356, 840, 980] },
        { name: 'Leave', data: [92, 88, 85, 87, 87, 35, 20] },
        { name: 'Overtime', data: [280, 310, 340, 325, 342, 45, 15] }
      ],
      summary: {
        presentTotal: 1842,
        lateTotal: 55,
        absentTotal: 356,
        leaveTotal: 87,
        overtimeHours: '1,957 hrs'
      }
    };
  },

  /**
   * Get regularisation requests pending
   */
  async getRegularisationRequests() {
    return [
      { id: 'REG-201', employee: 'Arun Kumar', date: '2026-08-18', reason: 'Biometric sync error at Gate 2', status: 'Pending' },
      { id: 'REG-202', employee: 'Marcus Vance', date: '2026-08-17', reason: 'Remote shift missing checkout', status: 'Pending' },
      { id: 'REG-203', employee: 'Amara Okonkwo', date: '2026-08-18', reason: 'Emergency field audit visit', status: 'Pending' }
    ];
  }
};
