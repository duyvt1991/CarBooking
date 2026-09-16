import ExcelJS from 'exceljs';

/**
 * Format duration between startTime and endTime in format H:mm
 * @param {string} startTime e.g. '07:30:00' or '07:30'
 * @param {string} endTime e.g. '21:00:00' or '21:00'
 * @param {string} startDate e.g. '2026-08-01'
 * @param {string} endDate e.g. '2026-08-01'
 * @returns {{ durationText: string, durationMinutes: number }}
 */
export const calculateDuration = (startTime, endTime, startDate = '', endDate = '') => {
  if (!startTime || !endTime) return { durationText: '0:00', durationMinutes: 0 };

  const sDate = startDate || '2000-01-01';
  const eDate = endDate || sDate;

  const start = new Date(`${sDate} ${startTime}`);
  const end = new Date(`${eDate} ${endTime}`);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { durationText: '0:00', durationMinutes: 0 };
  }

  let diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) diffMs = 0;

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    durationText: `${hours}:${minutes.toString().padStart(2, '0')}`,
    durationMinutes: totalMinutes,
  };
};

/**
 * Extract start hour (0-23) from startTime string
 * @param {string} startTime e.g. '05:00:00', '06:30'
 * @returns {number} hour (0-23) or -1 if invalid
 */
export const getStartHour = (startTime) => {
  if (!startTime) return -1;
  const str = startTime.toString().trim();
  const timePart = str.includes('T') ? str.split('T')[1] : (str.includes(' ') ? str.split(' ')[1] : str);
  const match = timePart.match(/^(\d{1,2}):/);
  if (!match) return -1;
  return parseInt(match[1], 10);
};

/**
 * Format total minutes to HH:mm:ss format e.g. 4:00:00 or 275:55:00
 */
export const formatTotalHours = (totalMinutes) => {
  if (!totalMinutes || totalMinutes <= 0) return '0:00:00';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}:00`;
};

/**
 * Get Vietnamese day of week: '2', '3', '4', '5', '6', '7', 'CN'
 */
export const getDayOfWeekLabel = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  if (day === 0) return 'CN';
  return (day + 1).toString();
};

/**
 * Format date to d/M/yyyy (e.g. 1/8/2026)
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = parseInt(parts[2], 10);
    const m = parseInt(parts[1], 10);
    const y = parts[0];
    return `${d}/${m}/${y}`;
  }
  return dateStr;
};

/**
 * Check if booking is notified (ô đỏ = đã thông báo)
 */
export const isBookingNotified = (booking) => {
  if (!booking) return false;
  if (booking.notificationDriverDate) return true;
  if (booking.driverConfirmationDate) return true;
  if (Number(booking.notificationCount) > 0) return true;
  if (Number(booking.notificationDriverCount) > 0) return true;
  if (Number(booking.isApproved) >= 2) return true;
  return false;
};

/**
 * Get clean name from Bitrix user object or string (e.g. 'Quốc Bảo (baoq@esuhai.com)' -> 'Quốc Bảo')
 */
export const getCleanName = (item) => {
  if (!item) return '';
  let str = '';
  if (typeof item === 'object') {
    str = item.mvalue || item.name || '';
  } else {
    str = String(item);
  }
  return str.split(' (')[0].trim();
};

/**
 * Cột loại xe lấy mvalue trong column room trong bảng car_booking_requests
 */
export const getCarName = (booking) => {
  if (!booking) return '';
  let room = booking.room;
  if (!room) return '';
  if (typeof room === 'string') {
    try {
      room = JSON.parse(room);
    } catch (e) {
      return room;
    }
  }
  if (typeof room === 'object' && room !== null) {
    if (room.mvalue !== undefined && room.mvalue !== null) {
      return String(room.mvalue);
    }
    if (room.mkey) return String(room.mkey);
    return '';
  }
  return String(room);
};

/**
 * Kiểm tra chuyến đi có phải dịch vụ Xe nội bộ hay không
 * Chỉ lấy các chuyến dịch vụ là : Xe nội bộ
 */
export const isInternalCarService = (booking) => {
  if (!booking) return false;

  let st = booking.serviceType;
  if (typeof st === 'string') {
    try {
      const parsed = JSON.parse(st);
      st = parsed;
    } catch (e) {}
  }

  if (st) {
    const key = typeof st === 'object' ? (st.mkey || st.id || '') : String(st);
    const val = typeof st === 'object' ? (st.mvalue || '') : String(st);

    if (key === 'ST001') return true;
    if (key === 'ST002') return false;

    const lower = (val || key).toLowerCase();
    if (lower.includes('nội bộ')) return true;
    if (lower.includes('dịch vụ') || lower.includes('ngoài') || lower.includes('khách') || lower.includes('grab')) {
      return false;
    }
  }

  // Nếu room có hasServiceCar (1: Xe dịch vụ, 0: Xe nội bộ)
  let room = booking.room;
  if (typeof room === 'string') {
    try {
      room = JSON.parse(room);
    } catch (e) {}
  }
  if (room && typeof room === 'object') {
    if (room.hasServiceCar !== undefined && room.hasServiceCar !== null) {
      return room.hasServiceCar.toString() !== '1';
    }
  }

  return true;
};

/**
 * Get service column value ('Dịch vụ') according to "Phân loại khách" (usagePurpose)
 */
export const getCustomerTypeLabel = (booking, masterData = {}) => {
  if (!booking) return '';
  const up = booking.usagePurpose !== undefined ? booking.usagePurpose : booking;
  if (!up) return '';

  if (typeof up === 'object') {
    return up.mvalue || up.name || '';
  }

  if (typeof up === 'string') {
    try {
      const parsed = JSON.parse(up);
      if (parsed && typeof parsed === 'object') {
        return parsed.mvalue || parsed.name || up;
      }
    } catch {
      // not a JSON string
    }

    if (masterData?.usagePurposes && Array.isArray(masterData.usagePurposes)) {
      const found = masterData.usagePurposes.find(item => String(item.mkey) === String(up) || String(item.id) === String(up));
      if (found) return found.mvalue || found.name || up;
    }

    return up;
  }

  return String(up);
};

export const getServiceTypeLabel = getCustomerTypeLabel;

/**
 * Get all departments (BUs) directly from masterData (and bookings)
 */
export const getAllDepartments = (masterData = {}, bookings = []) => {
  const depts = [];
  const addDept = (name) => {
    if (!name || typeof name !== 'string') return;
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!depts.some(d => d.toLowerCase() === trimmed.toLowerCase())) {
      depts.push(trimmed);
    }
  };

  // 1. From masterData.departments
  if (masterData?.departments && Array.isArray(masterData.departments)) {
    masterData.departments.forEach(d => {
      const name = d.mvalue || d.name;
      addDept(name);
    });
  }

  // 2. From bookings (in case a booking has a department not yet in masterData)
  bookings.forEach(b => {
    const dept = b.department?.mvalue || (typeof b.department === 'string' ? b.department : '');
    addDept(dept);
  });

  return depts;
};

/**
 * Get all drivers directly from masterData (and bookings)
 */
export const getAllDrivers = (masterData = {}, bookings = []) => {
  const drivers = [];
  const addDriver = (name) => {
    if (!name || typeof name !== 'string') return;
    const clean = getCleanName(name).trim();
    if (!clean) return;
    if (!drivers.some(d => d.toLowerCase() === clean.toLowerCase())) {
      drivers.push(clean);
    }
  };

  // 1. From masterData.drivers
  if (masterData?.drivers && Array.isArray(masterData.drivers)) {
    masterData.drivers.forEach(d => {
      const clean = getCleanName(d);
      addDriver(clean);
    });
  }

  // 2. From bookings (in case a booking has a driver not yet in masterData)
  bookings.forEach(b => {
    const driver = b.driverUser || b.driver;
    if (driver) addDriver(getCleanName(driver));
  });

  return drivers;
};

const borderThin = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } },
};

/**
 * Export 3 sheets matching the uploaded images:
 * Sheet 1: LichHoatDong
 * Sheet 2: ChiPhi
 * Sheet 3: TaiXe
 */
export const exportCarActivityExcel = async (bookings = [], masterData = {}, filterParams = {}) => {
  const { startDate = '', endDate = '', filterType = 'month', selectedMonth = '', selectedYear = '' } = filterParams;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CarBooking System';
  workbook.created = new Date();

  // Determine title period
  let periodTitle = '';
  if (filterType === 'month' && selectedMonth && selectedYear) {
    periodTitle = `THÁNG ${selectedMonth}/${selectedYear}`;
  } else if (startDate && endDate) {
    const sParts = startDate.split('-');
    const eParts = endDate.split('-');
    if (sParts[0] === eParts[0] && sParts[1] === eParts[1]) {
      periodTitle = `THÁNG ${parseInt(sParts[1], 10)}/${sParts[0]}`;
    } else {
      periodTitle = `TỪ NGÀY ${formatDateShort(startDate)} ĐẾN NGÀY ${formatDateShort(endDate)}`;
    }
  } else {
    const now = new Date();
    periodTitle = `THÁNG ${now.getMonth() + 1}/${now.getFullYear()}`;
  }

  // Chỉ lấy các chuyến dịch vụ là : Xe nội bộ
  const validBookings = bookings
    // .filter(b => Number(b.isCancelled) !== 1 && isInternalCarService(b))
    // .filter(b => Number(b.isCancelled) !== 1)
    .sort((a, b) => {
      const dateA = `${a.startDate || ''} ${a.startTime || ''}`;
      const dateB = `${b.startDate || ''} ${b.endTime || ''}`;
      return dateA.localeCompare(dateB);
    });

  // ==========================================
  // SHEET 1: LichHoatDong
  // ==========================================
  const ws1 = workbook.addWorksheet('LichHoatDong', {
    views: [{ showGridLines: true }],
  });

  // Set column widths
  ws1.columns = [
    { key: 'thu', width: 8 },         // A: Thứ
    { key: 'ngay', width: 14 },       // B: Ngày
    { key: 'loaiXe', width: 16 },     // C: Loại xe
    { key: 'batDau', width: 10 },     // D: Bắt đầu
    { key: 'ketThuc', width: 10 },    // E: Kết thúc
    { key: 'soGio', width: 10 },      // F: Số giờ
    { key: 'kmDi', width: 11 },       // G: Đi (KM)
    { key: 'kmVe', width: 11 },       // H: Về (KM)
    { key: 'kmTong', width: 10 },     // I: Tổng (KM)
    { key: 'phiDauXe', width: 12 },   // J: Phí đậu xe
    { key: 'xangXe', width: 12 },     // K: Xăng xe
    { key: 'luuDem', width: 12 },     // L: Lưu đêm
    { key: 'diSom', width: 12 },      // M: Đi sớm
    { key: 'taiXe', width: 18 },      // N: TÀI XẾ
    { key: 'phongBan', width: 16 },   // O: Phòng ban
    { key: 'nvSuDung', width: 16 },   // P: NV sử dụng
    { key: 'slNguoi', width: 10 },    // Q: SL Người
    { key: 'dichVu', width: 12 },     // R: Dịch vụ
    { key: 'ghiChu', width: 45 },     // S: Ghi Chú/Lịch trình
  ];

  // Row 1: Empty
  ws1.addRow([]);

  // Row 2: Title "LỊCH HOẠT ĐỘNG XE CÔNG TY"
  ws1.mergeCells('A2:S2');
  const titleCell1 = ws1.getCell('A2');
  titleCell1.value = 'LỊCH HOẠT ĐỘNG XE CÔNG TY';
  titleCell1.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1F4E78' } };
  titleCell1.alignment = { horizontal: 'center', vertical: 'middle' };
  ws1.getRow(2).height = 30;

  // Row 3: Subtitle "THÁNG M/YYYY"
  ws1.mergeCells('A3:S3');
  const subTitleCell1 = ws1.getCell('A3');
  subTitleCell1.value = periodTitle;
  subTitleCell1.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFF0000' } };
  subTitleCell1.alignment = { horizontal: 'center', vertical: 'middle' };
  ws1.getRow(3).height = 25;

  // Headers (Rows 4 & 5)
  const headerBlueFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFB4C6E7' },
  };

  const headerYellowFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFF00' },
  };

  const headerFont = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };

  ws1.getRow(4).height = 24;
  ws1.getRow(5).height = 24;

  // Vertical Merges (Row 4 & 5)
  const verticalHeaders = [
    { col: 'A', title: 'Thứ' },
    { col: 'B', title: 'Ngày' },
    { col: 'C', title: 'Loại xe' },
    { col: 'N', title: 'TÀI XẾ' },
    { col: 'O', title: 'Phòng ban' },
    { col: 'P', title: 'NV sử dụng' },
    { col: 'Q', title: 'SL Người' },
    { col: 'R', title: 'Dịch vụ' },
    { col: 'S', title: 'Ghi Chú/Lịch trình' },
  ];

  verticalHeaders.forEach(({ col, title }) => {
    ws1.mergeCells(`${col}4:${col}5`);
    const cell = ws1.getCell(`${col}4`);
    cell.value = title;
    cell.fill = headerBlueFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = borderThin;
    ws1.getCell(`${col}5`).border = borderThin;
  });

  // Group Header D-F: "THỜI GIAN"
  ws1.mergeCells('D4:F4');
  const thoiGianCell = ws1.getCell('D4');
  thoiGianCell.value = 'THỜI GIAN';
  thoiGianCell.fill = headerBlueFill;
  thoiGianCell.font = headerFont;
  thoiGianCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ['D4', 'E4', 'F4'].forEach(addr => { ws1.getCell(addr).border = borderThin; ws1.getCell(addr).fill = headerBlueFill; });

  // Sub headers D5, E5, F5
  [
    { col: 'D', title: 'Bắt đầu' },
    { col: 'E', title: 'Kết thúc' },
    { col: 'F', title: 'Số giờ' },
  ].forEach(({ col, title }) => {
    const c = ws1.getCell(`${col}5`);
    c.value = title;
    c.fill = headerBlueFill;
    c.font = headerFont;
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borderThin;
  });

  // Group Header G-I: "KM" (Yellow)
  ws1.mergeCells('G4:I4');
  const kmCell = ws1.getCell('G4');
  kmCell.value = 'KM';
  kmCell.fill = headerYellowFill;
  kmCell.font = headerFont;
  kmCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ['G4', 'H4', 'I4'].forEach(addr => { ws1.getCell(addr).border = borderThin; ws1.getCell(addr).fill = headerYellowFill; });

  // Sub headers G5, H5, I5
  [
    { col: 'G', title: 'Đi' },
    { col: 'H', title: 'Về' },
    { col: 'I', title: 'Tổng' },
  ].forEach(({ col, title }) => {
    const c = ws1.getCell(`${col}5`);
    c.value = title;
    c.fill = headerYellowFill;
    c.font = headerFont;
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borderThin;
  });

  // Group Header J-M: "PHÍ CÔNG TÁC" (Yellow)
  ws1.mergeCells('J4:M4');
  const phiCell = ws1.getCell('J4');
  phiCell.value = 'PHÍ CÔNG TÁC';
  phiCell.fill = headerYellowFill;
  phiCell.font = headerFont;
  phiCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ['J4', 'K4', 'L4', 'M4'].forEach(addr => { ws1.getCell(addr).border = borderThin; ws1.getCell(addr).fill = headerYellowFill; });

  // Sub headers J5, K5, L5, M5
  [
    { col: 'J', title: 'Phí đậu xe' },
    { col: 'K', title: 'Xăng xe' },
    { col: 'L', title: 'Lưu đêm' },
    { col: 'M', title: 'Đi sớm' },
  ].forEach(({ col, title }) => {
    const c = ws1.getCell(`${col}5`);
    c.value = title;
    c.fill = headerYellowFill;
    c.font = headerFont;
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = borderThin;
  });

  // Group bookings by date
  const bookingsByDate = {};
  validBookings.forEach(b => {
    const dStr = b.startDate ? b.startDate.substring(0, 10) : '';
    if (!dStr) return;
    if (!bookingsByDate[dStr]) bookingsByDate[dStr] = [];
    bookingsByDate[dStr].push(b);
  });

  let currentRowIdx = 6;
  const sortedDates = Object.keys(bookingsByDate).sort();

  sortedDates.forEach(dateKey => {
    const dayBookings = bookingsByDate[dateKey];
    const startRow = currentRowIdx;
    const dayOfWeek = getDayOfWeekLabel(dateKey);
    const dateFormatted = formatDateShort(dateKey);

    dayBookings.forEach((b) => {
      const row = ws1.getRow(currentRowIdx);
      const { durationText } = calculateDuration(b.startTime, b.endTime, b.startDate, b.endDate);

      // Cột loại xe là lấy theo mvalue trong column room
      const carName = getCarName(b);

      // Notified status -> Red cell for Loại xe
      const isNotified = isBookingNotified(b);

      // Driver name
      const driverName = getCleanName(b.driverUser);

      // Department
      const deptName = b.department?.mvalue || '';

      // User using car
      const userName = getCleanName(b.mainUser);

      // Person count
      const personCount = b.employeeNumber;

      // Service type (Cột Dịch vụ lấy theo Phân loại khách)
      const serviceType = getCustomerTypeLabel(b, masterData);

      // Schedule / note (lấy data detailedSchedule)
      const schedule = b.detailedSchedule || '';

      // Set cell values
      row.getCell(1).value = dayOfWeek; // Col A
      row.getCell(2).value = dateFormatted; // Col B
      row.getCell(3).value = carName; // Col C: Loại xe
      row.getCell(4).value = (b.startTime || '').substring(0, 5); // Col D: Bắt đầu
      row.getCell(5).value = (b.endTime || '').substring(0, 5); // Col E: Kết thúc
      row.getCell(6).value = durationText; // Col F: Số giờ

      // Yellow columns left blank for manual input
      row.getCell(7).value = ''; // Col G: Đi
      row.getCell(8).value = ''; // Col H: Về
      row.getCell(9).value = '';  // Col I: Tổng
      row.getCell(10).value = ''; // Col J: Phí đậu xe
      row.getCell(11).value = ''; // Col K: Xăng xe
      row.getCell(12).value = ''; // Col L: Lưu đêm
      row.getCell(13).value = ''; // Col M: Đi sớm

      row.getCell(14).value = driverName; // Col N: TÀI XẾ
      row.getCell(15).value = deptName; // Col O: Phòng ban
      row.getCell(16).value = userName; // Col P: NV sử dụng
      row.getCell(17).value = personCount; // Col Q: SL Người
      row.getCell(18).value = serviceType; // Col R: Dịch vụ
      row.getCell(19).value = schedule; // Col S: Ghi Chú/Lịch trình

      // Styling row cells
      for (let colIdx = 1; colIdx <= 19; colIdx++) {
        const cell = row.getCell(colIdx);
        cell.border = borderThin;
        cell.font = { name: 'Arial', size: 9 };
        cell.alignment = { vertical: 'middle' };

        if ([1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 17, 18].includes(colIdx)) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (colIdx === 19) {
          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        }
      }

      // Check red cell for Loại xe
      const carCell = row.getCell(3);
      if (isNotified) {
        carCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' }, // Red background
        };
        carCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }; // White bold text
      }
      carCell.alignment = { horizontal: 'center', vertical: 'middle' };

      currentRowIdx++;
    });

    // Merge A and B if multiple rows on same day
    const endRow = currentRowIdx - 1;
    if (endRow > startRow) {
      ws1.mergeCells(`A${startRow}:A${endRow}`);
      ws1.mergeCells(`B${startRow}:B${endRow}`);
      ws1.getCell(`A${startRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
      ws1.getCell(`B${startRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
    }
  });

  // ==========================================
  // SHEET 2: ChiPhi
  // ==========================================
  const ws2 = workbook.addWorksheet('ChiPhi', {
    views: [{ showGridLines: true }],
  });

  ws2.columns = [
    { key: 'bu', width: 22 },           // A: BÁO CÁO CHI PHÍ BU
    { key: 'soChuyen', width: 12 },     // B: SỐ CHUYẾN
    { key: 'tongGio', width: 16 },      // C: TỔNG GIỜ
    { key: 'tachGio', width: 12 },      // D: TÁCH GIỜ
    { key: 'km', width: 10 },           // E: KM
    { key: 'xang', width: 10 },         // F: XĂNG
    { key: 'phiDauXe', width: 14 },     // G: PHÍ ĐẬU XE
    { key: 'phiNhanSuTT', width: 18 },  // H: PHÍ NHÂN SỰ TT
    { key: 'tongPhi', width: 16 },      // I: TỔNG PHÍ
  ];

  // Row 1: Table Header
  const headRow2 = ws2.getRow(1);
  headRow2.height = 26;
  const headers2 = [
    'BÁO CÁO CHI PHÍ BU',
    'SỐ CHUYẾN',
    'TỔNG GIỜ',
    'TÁCH GIỜ',
    'KM',
    'XĂNG',
    'PHÍ ĐẬU XE',
    'PHÍ NHÂN SỰ TT',
    'TỔNG PHÍ'
  ];

  headers2.forEach((h, idx) => {
    const c = headRow2.getCell(idx + 1);
    c.value = h;
    c.font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: idx === 0 ? { argb: 'FFC00000' } : { argb: 'FF000000' }
    };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borderThin;
  });

  // Collect department usage (ALL BUs)
  const allDepts = getAllDepartments(masterData, validBookings);
  const deptStatsMap = {};

  allDepts.forEach(name => {
    deptStatsMap[name] = { totalMinutes: 0, count: 0 };
  });

  // Calculate total minutes and count per department from bookings
  validBookings.forEach(b => {
    const deptName = (b.department?.mvalue || '').trim();
    if (!deptName) return;

    const { durationMinutes } = calculateDuration(b.startTime, b.endTime, b.startDate, b.endDate);
    const matchedKey = Object.keys(deptStatsMap).find(k => k.toLowerCase() === deptName.toLowerCase());
    const key = matchedKey || deptName;
    if (!deptStatsMap[key]) {
      deptStatsMap[key] = { totalMinutes: 0, count: 0 };
    }
    deptStatsMap[key].totalMinutes += durationMinutes;
    deptStatsMap[key].count += 1;
  });

  // Output rows for Sheet 2
  let s2RowIdx = 2;
  Object.entries(deptStatsMap).forEach(([deptName, stats]) => {
    const row = ws2.getRow(s2RowIdx);
    row.height = 20;

    row.getCell(1).value = deptName;
    row.getCell(2).value = stats.count;
    row.getCell(3).value = formatTotalHours(stats.totalMinutes);
    row.getCell(4).value = Math.round(stats.totalMinutes / 60);
    // row.getCell(5).value = 0;
    // row.getCell(6).value = 0;
    // row.getCell(7).value = 0;
    // row.getCell(8).value = stats.totalMinutes > 0 ? '' : 0;
    // row.getCell(9).value = stats.totalMinutes > 0 ? '' : 0;

    for (let c = 1; c <= 9; c++) {
      const cell = row.getCell(c);
      cell.border = borderThin;
      cell.font = { name: 'Arial', size: 10 };
      if (c === 1) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { name: 'Arial', size: 10, bold: true };
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    }
    s2RowIdx++;
  });

  // ==========================================
  // SHEET 3: TaiXe
  // ==========================================
  const ws3 = workbook.addWorksheet('TaiXe', {
    views: [{ showGridLines: true }],
  });

  ws3.columns = [
    { key: 'taiXe', width: 22 },       // A: BÁO CÁO TÀI XẾ
    { key: 'soChuyen', width: 12 },    // B: SỐ CHUYẾN
    { key: 'tongGio', width: 16 },     // C: TỔNG GIỜ
    { key: 'km', width: 10 },          // D: KM
    { key: 'phiDauXe', width: 14 },    // E: PHÍ ĐẬU XE
    { key: 'luuDem', width: 12 },      // F: LƯU ĐÊM
    { key: 'h5', width: 8 },           // G: 5H
    { key: 'h6', width: 8 },           // H: 6H
    { key: 'quaTrua', width: 12 },     // I: QUA TRƯA
    { key: 'chuNhat', width: 12 },     // J: CHỦ NHẬT
    { key: 'ngayLe', width: 12 },      // K: NGÀY LỄ
    { key: 'tangCa', width: 12 },      // L: TĂNG CA
  ];

  // Row 1: Headers
  const headRow3 = ws3.getRow(1);
  headRow3.height = 26;
  const headers3 = [
    'BÁO CÁO TÀI XẾ',
    'SỐ CHUYẾN',
    'TỔNG GIỜ',
    'KM',
    'PHÍ ĐẬU XE',
    'LƯU ĐÊM',
    '5H',
    '6H',
    'QUA TRƯA',
    'CHỦ NHẬT',
    'NGÀY LỄ',
    'TĂNG CA'
  ];

  const peachFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFCE4D6' }, // Light peach/pink
  };

  const peachHeaders = ['5H', '6H', 'QUA TRƯA', 'CHỦ NHẬT', 'NGÀY LỄ', 'TĂNG CA'];

  headers3.forEach((h, idx) => {
    const c = headRow3.getCell(idx + 1);
    c.value = h;
    c.font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: idx === 0 ? { argb: 'FFC00000' } : { argb: 'FF000000' }
    };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borderThin;
    if (peachHeaders.includes(h)) {
      c.fill = peachFill;
    }
  });

  // Collect driver hours and stats (ALL Drivers)
  const allDrivers = getAllDrivers(masterData, validBookings);
  const driverStatsMap = {};

  allDrivers.forEach(name => {
    driverStatsMap[name] = { totalMinutes: 0, count: 0, count5h: 0, count6h: 0 };
  });

  // Calculate total minutes, trip count and early trip counts per driver from bookings
  validBookings.forEach(b => {
    const driver = b.driverUser;
    const clean = getCleanName(driver).trim();
    if (!clean) return;

    const { durationMinutes } = calculateDuration(b.startTime, b.endTime, b.startDate, b.endDate);

    const matchedKey = Object.keys(driverStatsMap).find(k => k.toLowerCase() === clean.toLowerCase() || clean.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(clean.toLowerCase()));
    const key = matchedKey || clean;
    if (!driverStatsMap[key]) {
      driverStatsMap[key] = { totalMinutes: 0, count: 0, count5h: 0, count6h: 0 };
    }
    driverStatsMap[key].totalMinutes += durationMinutes;
    driverStatsMap[key].count += 1;

    const startHour = getStartHour(b.startTime);
    if (startHour === 5) {
      driverStatsMap[key].count5h += 1;
    } else if (startHour === 6) {
      driverStatsMap[key].count6h += 1;
    }
  });

  // Output driver rows
  let s3RowIdx = 2;
  Object.entries(driverStatsMap).forEach(([driverName, stats]) => {
    const row = ws3.getRow(s3RowIdx);
    row.height = 20;

    row.getCell(1).value = driverName;
    row.getCell(2).value = stats.count;
    row.getCell(3).value = formatTotalHours(stats.totalMinutes);
    // row.getCell(4).value = 0;
    // row.getCell(5).value = 0;
    // row.getCell(6).value = 0;
    row.getCell(7).value = stats.count5h > 0 ? stats.count5h : '';
    row.getCell(8).value = stats.count6h > 0 ? stats.count6h : '';
    // row.getCell(9).value = '';
    // row.getCell(10).value = '';
    // row.getCell(11).value = '';
    // row.getCell(12).value = '';

    for (let c = 1; c <= 12; c++) {
      const cell = row.getCell(c);
      cell.border = borderThin;
      cell.font = { name: 'Arial', size: 10 };
      if (c === 1) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { name: 'Arial', size: 10, bold: true };
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    }
    s3RowIdx++;
  });

  // Save workbook to file in browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `Bao_Cao_Lich_Hoat_Dong_Xe_${startDate || 'all'}_den_${endDate || 'all'}.xlsx`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
