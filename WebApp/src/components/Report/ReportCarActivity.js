/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaFileExcel, FaFilter, FaRedo, FaCar, FaUsers, FaClock, FaBuilding, FaArrowLeft } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { RequestContext } from '../../App';
import { getReportCarActivity } from '../../systems/api';
import { routes } from '../../systems/constant';
import {
  exportCarActivityExcel,
  calculateDuration,
  formatTotalHours,
  getDayOfWeekLabel,
  formatDateShort,
  isBookingNotified,
  getCleanName,
  getCustomerTypeLabel,
  getCarName,
  isInternalCarService,
  getAllDepartments,
  getAllDrivers,
  getStartHour,
} from '../../systems/carActivityExcelExport';

function ReportCarActivity() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setLoading, masterData } = useContext(RequestContext);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Filter state
  const [filterType, setFilterType] = useState('month'); // 'date' | 'month'
  const [fromDate, setFromDate] = useState(format(startOfMonth(currentDate), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(endOfMonth(currentDate), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  // Data & UI state
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('lichHoatDong'); // 'lichHoatDong' | 'chiPhi' | 'taiXe'
  const [exporting, setExporting] = useState(false);
  const [hasFiltered, setHasFiltered] = useState(false);

  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const fetchData = (start, end) => {
    setLoading(true);
    const fromStr = start ? `${start} 00:00:00` : `${fromDate} 00:00:00`;
    const toStr = end ? `${end} 23:59:59` : `${toDate} 23:59:59`;

    getReportCarActivity({
      filterType,
      selectedMonth,
      month: selectedMonth,
      selectedYear,
      year: selectedYear,
      fromDate: fromStr,
      toDate: toStr,
      endDate: toStr,
    })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBookings(list);
      })
      .catch((err) => {
        console.error('Error fetching car activity report:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // Set default month range without auto-fetching data
    const firstDay = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const lastDay = format(endOfMonth(currentDate), 'yyyy-MM-dd');
    setFromDate(firstDay);
    setToDate(lastDay);
  }, []);

  const handleApplyFilter = () => {
    setHasFiltered(true);
    let start = '';
    let end = '';

    if (filterType === 'date') {
      start = fromDate || '';
      end = toDate || '';
    } else if (filterType === 'month') {
      const m = parseInt(selectedMonth, 10);
      const y = parseInt(selectedYear, 10);
      const firstDay = new Date(y, m - 1, 1);
      const lastDay = endOfMonth(firstDay);
      start = format(firstDay, 'yyyy-MM-dd');
      end = format(lastDay, 'yyyy-MM-dd');
      setFromDate(start);
      setToDate(end);
    }

    fetchData(start, end);
  };

  const handleResetFilter = () => {
    setFilterType('month');
    const firstDay = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const lastDay = format(endOfMonth(new Date()), 'yyyy-MM-dd');
    setFromDate(firstDay);
    setToDate(lastDay);
    setSelectedMonth((new Date().getMonth() + 1).toString());
    setSelectedYear(new Date().getFullYear().toString());
    setBookings([]);
    setHasFiltered(false);
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await exportCarActivityExcel(bookings, masterData, {
        startDate: fromDate,
        endDate: toDate,
        filterType,
        selectedMonth,
        selectedYear,
      });
    } catch (err) {
      console.error('Error exporting Excel:', err);
    } finally {
      setExporting(false);
    }
  };

  // Chỉ lấy các chuyến dịch vụ là : Xe nội bộ
  const validBookings = bookings
    // .filter((b) => Number(b.isCancelled) !== 1 && isInternalCarService(b))
    // .filter((b) => Number(b.isCancelled) !== 1)
    .sort((a, b) => {
      const dateA = `${a.startDate || ''} ${a.startTime || ''}`;
      const dateB = `${b.startDate || ''} ${b.endTime || ''}`;
      return dateA.localeCompare(dateB);
    });

  // Calculate stats for preview
  let totalMinutesAll = 0;
  const uniqueCars = new Set();
  const uniqueDrivers = new Set();

  // Department aggregation for Tab 2 (ALL BUs)
  const allDepts = hasFiltered ? getAllDepartments(masterData, validBookings) : [];
  const deptMap = {};
  allDepts.forEach(name => {
    deptMap[name] = { totalMinutes: 0, count: 0 };
  });

  // Driver aggregation for Tab 3 (ALL Drivers)
  const allDrivers = hasFiltered ? getAllDrivers(masterData, validBookings) : [];
  const driverMap = {};
  allDrivers.forEach(name => {
    driverMap[name] = { totalMinutes: 0, count: 0, count5h: 0, count6h: 0 };
  });

  validBookings.forEach((b) => {
    const { durationMinutes } = calculateDuration(b.startTime, b.endTime, b.startDate, b.endDate);
    totalMinutesAll += durationMinutes;

    const car = getCarName(b);
    if (car) uniqueCars.add(car);

    const driver = getCleanName(b.driverUser || b.driver);
    if (driver) {
      uniqueDrivers.add(driver);
      const matchedDriverKey = Object.keys(driverMap).find(k => k.toLowerCase() === driver.toLowerCase() || driver.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(driver.toLowerCase()));
      const key = matchedDriverKey || driver;
      if (!driverMap[key]) driverMap[key] = { totalMinutes: 0, count: 0, count5h: 0, count6h: 0 };
      driverMap[key].totalMinutes += durationMinutes;
      driverMap[key].count += 1;

      const startHour = getStartHour(b.startTime);
      if (startHour === 5) {
        driverMap[key].count5h += 1;
      } else if (startHour === 6) {
        driverMap[key].count6h += 1;
      }
    }

    const dept = (b.department?.mvalue || '').trim();
    if (dept) {
      const matchedDeptKey = Object.keys(deptMap).find(k => k.toLowerCase() === dept.toLowerCase());
      const key = matchedDeptKey || dept;
      if (!deptMap[key]) deptMap[key] = { totalMinutes: 0, count: 0 };
      deptMap[key].totalMinutes += durationMinutes;
      deptMap[key].count += 1;
    }
  });

  return (
    <div className="p-4 space-y-4">
      {/* Title & Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(routes.home.path)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition shadow-sm"
            title={t('report.Trở về')}
          >
            <FaArrowLeft className="text-xs" />
            <span>{t('report.Trở về')}</span>
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaCar className="text-blue-600" />
            {t('routes.Lịch hoạt động xe')}
          </h1>
        </div>

        {/* Export Excel Button */}
        <button
          onClick={handleExportExcel}
          disabled={exporting || !hasFiltered || validBookings.length === 0}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaFileExcel className="text-base" />
          {exporting ? t('report.Đang xuất Excel...') : t('common.Xuất Excel')}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">{t('common.Loại lọc')}:</label>
            <select
              className="px-3 py-1.5 border border-gray-300 bg-white rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="month">{t('report.Theo Tháng')}</option>
              <option value="date">{t('report.Theo Ngày')}</option>
            </select>
          </div>

          {filterType === 'month' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1">
                <label className="text-sm text-gray-600">{t('common.Tháng')}:</label>
                <select
                  className="px-2 py-1.5 border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>
                      {t('common.Tháng')} {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-1">
                <label className="text-sm text-gray-600">{t('common.Năm')}:</label>
                <select
                  className="px-2 py-1.5 border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {filterType === 'date' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1">
                <label className="text-sm text-gray-600">{t('common.Từ ngày')}:</label>
                <DatePicker
                  selected={(() => {
                    try {
                      const d = parseISO(fromDate);
                      return !isNaN(d) ? d : null;
                    } catch {
                      return null;
                    }
                  })()}
                  onChange={(date) => setFromDate(date ? format(date, 'yyyy-MM-dd') : '')}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className="px-2.5 py-1.5 border border-gray-300 rounded text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-1">
                <label className="text-sm text-gray-600">{t('common.Đến ngày')}:</label>
                <DatePicker
                  selected={(() => {
                    try {
                      const d = parseISO(toDate);
                      return !isNaN(d) ? d : null;
                    } catch {
                      return null;
                    }
                  })()}
                  onChange={(date) => setToDate(date ? format(date, 'yyyy-MM-dd') : '')}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className="px-2.5 py-1.5 border border-gray-300 rounded text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Filter Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow flex items-center gap-1.5 transition"
            onClick={handleApplyFilter}
            type="button"
          >
            <FaFilter className="text-xs" />
            {t('common.Lọc')}
          </button>
          <button
            className="px-3.5 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded shadow flex items-center gap-1.5 transition"
            onClick={handleResetFilter}
            type="button"
          >
            <FaRedo className="text-xs" />
            {t('common.Đặt lại')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
            <FaCar />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold">{t('report.Tổng chuyến đi')}</div>
            <div className="text-2xl font-bold text-gray-800">{validBookings.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl">
            <FaClock />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold">{t('report.Tổng thời gian')}</div>
            <div className="text-2xl font-bold text-gray-800">{formatTotalHours(totalMinutesAll)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl">
            <FaBuilding />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold">{t('report.Phòng ban sử dụng')}</div>
            <div className="text-2xl font-bold text-gray-800">{Object.values(deptMap).filter(d => d.count > 0).length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xl">
            <FaUsers />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold">{t('report.Tài xế phục vụ')}</div>
            <div className="text-2xl font-bold text-gray-800">{uniqueDrivers.size}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200 px-4">
          <nav className="flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('lichHoatDong')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'lichHoatDong'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              1. {t('report.Lịch hoạt động')} ({validBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('chiPhi')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'chiPhi'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              2. {t('report.Chi phí BU')} ({Object.keys(deptMap).length})
            </button>
            <button
              onClick={() => setActiveTab('taiXe')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'taiXe'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              3. {t('report.Tài xế')} ({Object.keys(driverMap).length})
            </button>
          </nav>
        </div>

        {/* Tab 1: LichHoatDong */}
        {activeTab === 'lichHoatDong' && (
          <div className="p-4">
            <div className="overflow-auto max-h-[600px] border border-gray-200 rounded-lg shadow-inner relative">
              <table className="min-w-full divide-y divide-gray-200 border text-xs">
                <thead className="bg-blue-50 text-gray-700 font-semibold uppercase text-[11px] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-3 py-2.5 border bg-blue-50 text-center whitespace-nowrap">{t('report.Thứ')}</th>
                    <th className="px-3 py-2.5 border bg-blue-50 text-center whitespace-nowrap">{t('report.Ngày')}</th>
                    <th className="px-3 py-2.5 border bg-blue-50 text-center whitespace-nowrap">{t('report.Loại xe')}</th>
                    <th className="px-3 py-2.5 border bg-blue-50 text-center whitespace-nowrap">{t('report.Bắt đầu')}</th>
                    <th className="px-3 py-2.5 border bg-blue-50 text-center whitespace-nowrap">{t('report.Kết thúc')}</th>
                    <th className="px-3 py-2.5 border bg-blue-50 text-center whitespace-nowrap">{t('report.Số giờ')}</th>
                    <th className="px-3 py-2.5 border bg-blue-50 text-center whitespace-nowrap">{t('report.Tài xế')}</th>
                    <th className="px-3 py-2.5 border bg-blue-50 text-center whitespace-nowrap">{t('report.Phòng ban')}</th>
                    <th className="px-3 py-2.5 border bg-blue-50 text-center whitespace-nowrap">{t('report.NV sử dụng')}</th>
                    <th className="px-3 py-2.5 border bg-blue-50 text-center whitespace-nowrap">{t('report.SL Người')}</th>
                    <th className="px-3 py-2.5 border bg-blue-50 text-center whitespace-nowrap">{t('report.Dịch vụ')}</th>
                    <th className="px-3 py-2.5 border bg-blue-50 text-left min-w-[280px]">{t('report.Ghi Chú/Lịch trình')}</th>
                  </tr>
                </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!hasFiltered ? (
                  <tr>
                    <td colSpan={19} className="px-4 py-8 text-center text-gray-500 text-sm">
                      {t('report.Vui lòng nhấn Lọc để tải dữ liệu báo cáo')}
                    </td>
                  </tr>
                ) : validBookings.length === 0 ? (
                  <tr>
                    <td colSpan={19} className="px-4 py-8 text-center text-gray-500 text-sm">
                      {t('report.Không có chuyến xe nào trong khoảng thời gian này')}
                    </td>
                  </tr>
                ) : (
                  validBookings.map((b) => {
                    const { durationText } = calculateDuration(b.startTime, b.endTime, b.startDate, b.endDate);
                    const isNotified = isBookingNotified(b);
                    const carName = getCarName(b);
                    const driverName = getCleanName(b.driverUser);
                    const userName = getCleanName(b.mainUser);
                    const personCount = b.employeeNumber || 0;

                    return (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-2 py-1.5 border text-center font-medium">{getDayOfWeekLabel(b.startDate)}</td>
                        <td className="px-2 py-1.5 border text-center whitespace-nowrap">{formatDateShort(b.startDate)}</td>
                        <td className="px-2 py-1.5 border text-center">
                          {isNotified ? (
                            <span className="px-2 py-0.5 rounded text-white bg-red-600 font-bold whitespace-nowrap">
                              {carName}
                            </span>
                          ) : (
                            <span className="font-medium">{carName}</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 border text-center whitespace-nowrap">{(b.startTime || '').substring(0, 5)}</td>
                        <td className="px-2 py-1.5 border text-center whitespace-nowrap">{(b.endTime || '').substring(0, 5)}</td>
                        <td className="px-2 py-1.5 border text-center font-semibold">{durationText}</td>
                        {/* <td className="px-2 py-1.5 border text-center bg-yellow-50 text-gray-400">-</td>
                        <td className="px-2 py-1.5 border text-center bg-yellow-50 text-gray-400">-</td>
                        <td className="px-2 py-1.5 border text-center bg-yellow-50 font-medium">-</td>
                        <td className="px-2 py-1.5 border text-center bg-yellow-50 text-gray-400">-</td>
                        <td className="px-2 py-1.5 border text-center bg-yellow-50 text-gray-400">-</td>
                        <td className="px-2 py-1.5 border text-center bg-yellow-50 text-gray-400">-</td>
                        <td className="px-2 py-1.5 border text-center bg-yellow-50 text-gray-400">-</td> */}
                        <td className="px-2 py-1.5 border text-center whitespace-nowrap font-medium text-gray-800">{driverName}</td>
                        <td className="px-2 py-1.5 border text-center whitespace-nowrap">{b.department?.mvalue || ''}</td>
                        <td className="px-2 py-1.5 border text-center whitespace-nowrap">{userName}</td>
                        <td className="px-2 py-1.5 border text-center">{personCount}</td>
                        <td className="px-2 py-1.5 border text-center whitespace-nowrap">{getCustomerTypeLabel(b, masterData)}</td>
                        <td className="px-3 py-1.5 border max-w-xs truncate text-gray-700" title={b.detailedSchedule}>
                          {b.detailedSchedule || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Tab 2: ChiPhi BU */}
        {activeTab === 'chiPhi' && (
          <div className="p-4">
            <div className="overflow-auto max-h-[600px] border border-gray-200 rounded-lg shadow-inner relative">
              <table className="min-w-full divide-y divide-gray-200 border text-sm max-w-4xl">
                <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-2.5 border bg-gray-100 text-left text-red-600">{t('report.BÁO CÁO CHI PHÍ BU')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.Số chuyến')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.TỔNG GIỜ')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.TÁCH GIỜ')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.KM')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.XĂNG')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.PHÍ ĐẬU XE')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.PHÍ NHÂN SỰ TT')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.TỔNG PHÍ')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!hasFiltered ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        {t('report.Vui lòng nhấn Lọc để tải dữ liệu báo cáo')}
                      </td>
                    </tr>
                  ) : Object.keys(deptMap).length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        {t('report.Chưa có dữ liệu sử dụng theo phòng ban trong khoảng thời gian này')}
                      </td>
                    </tr>
                  ) : (
                    Object.entries(deptMap).map(([deptName, { totalMinutes, count }]) => (
                      <tr key={deptName} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border font-bold text-gray-800">{deptName}</td>
                        <td className="px-3 py-2 border text-center text-gray-600">{count}</td>
                        <td className="px-3 py-2 border text-center font-bold text-blue-700">{formatTotalHours(totalMinutes)}</td>
                        <td className="px-3 py-2 border text-center">{Math.round(totalMinutes / 60)}</td>
                        <td className="px-3 py-2 border text-center text-gray-400">-</td>
                        <td className="px-3 py-2 border text-center text-gray-400">-</td>
                        <td className="px-3 py-2 border text-center text-gray-400">-</td>
                        <td className="px-3 py-2 border text-center text-gray-400">-</td>
                        <td className="px-3 py-2 border text-center text-gray-400">-</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: TaiXe */}
        {activeTab === 'taiXe' && (
          <div className="p-4">
            <div className="overflow-auto max-h-[600px] border border-gray-200 rounded-lg shadow-inner relative">
              <table className="min-w-full divide-y divide-gray-200 border text-sm max-w-4xl">
                <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-2.5 border bg-gray-100 text-left text-red-600">{t('report.BÁO CÁO TÀI XẾ')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.Số chuyến')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.TỔNG GIỜ')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.KM')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.PHÍ ĐẬU XE')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.LƯU ĐÊM')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.ĐI SỚM (5H)')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.ĐI SỚM (6H)')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.QUA TRƯA')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.CHỦ NHẬT')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.NGÀY LỄ')}</th>
                    <th className="px-3 py-2.5 border bg-gray-100 text-center">{t('report.TĂNG CA')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!hasFiltered ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                        {t('report.Vui lòng nhấn Lọc để tải dữ liệu báo cáo')}
                      </td>
                    </tr>
                  ) : Object.keys(driverMap).length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                        {t('report.Chưa có dữ liệu tài xế trong khoảng thời gian này')}
                      </td>
                    </tr>
                  ) : (
                    Object.entries(driverMap).map(([driverName, { totalMinutes, count, count5h, count6h }]) => (
                      <tr key={driverName} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border font-bold text-gray-800">{driverName}</td>
                        <td className="px-3 py-2 border text-center text-gray-600">{count}</td>
                        <td className="px-3 py-2 border text-center font-bold text-blue-700">{formatTotalHours(totalMinutes)}</td>
                        <td className="px-3 py-2 border text-center text-gray-400">-</td>
                        <td className="px-3 py-2 border text-center text-gray-400">-</td>
                        <td className="px-3 py-2 border text-center text-gray-400">-</td>
                        <td className={`px-3 py-2 border text-center ${count5h ? 'font-semibold text-blue-700' : 'text-gray-400'}`}>{count5h || '-'}</td>
                        <td className={`px-3 py-2 border text-center ${count6h ? 'font-semibold text-blue-700' : 'text-gray-400'}`}>{count6h || '-'}</td>
                        <td className="px-3 py-2 border text-center text-gray-400">-</td>
                        <td className="px-3 py-2 border text-center text-gray-400">-</td>
                        <td className="px-3 py-2 border text-center text-gray-400">-</td>
                        <td className="px-3 py-2 border text-center text-gray-400">-</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Back button */}
      <div className="flex mt-6 justify-center space-x-6">
        <button
          className="back-btn bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-700 transition font-medium shadow-sm"
          type="button"
          onClick={() => navigate(routes.home.path)}
        >
          {t('report.Trở về')}
        </button>
      </div>
    </div>
  );
}

export default ReportCarActivity;
