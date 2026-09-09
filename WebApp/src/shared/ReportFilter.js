import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaFilter, FaRedo, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO, endOfMonth } from 'date-fns';

function ReportFilter({ onFilter, onExportExcel, onExportPdf }) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [filterType, setFilterType] = useState('date'); // 'date' | 'month' | 'year'
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleApplyFilter = () => {
    let startDate = '';
    let endDate = '';

    if (filterType === 'date') {
      startDate = fromDate ? fromDate : '';
      endDate = toDate ? toDate : '';
    } else if (filterType === 'month') {
      if (selectedYear && selectedMonth) {
        const m = parseInt(selectedMonth, 10);
        const y = parseInt(selectedYear, 10);
        const firstDay = new Date(y, m - 1, 1);
        const lastDay = endOfMonth(firstDay);
        startDate = format(firstDay, 'yyyy-MM-dd');
        endDate = format(lastDay, 'yyyy-MM-dd');
      }
    } else if (filterType === 'year') {
      if (selectedYear) {
        const y = parseInt(selectedYear, 10);
        startDate = `${y}-01-01`;
        endDate = `${y}-12-31`;
      }
    }

    if (onFilter) {
      onFilter({ startDate, endDate, filterType });
    }
  };

  const handleResetFilter = () => {
    setFilterType('date');
    setFromDate('');
    setToDate('');
    setSelectedMonth(currentMonth.toString());
    setSelectedYear(currentYear.toString());
    if (onFilter) {
      onFilter({});
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border mb-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Type Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">{t('common.Loại lọc') || 'Loại'}:</label>
          <select
            className="px-3 py-1.5 border border-gray-300 bg-white rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="date">{t('common.Ngày') || 'Ngày'}</option>
            <option value="month">{t('common.Tháng') || 'Tháng'}</option>
            <option value="year">{t('common.Năm') || 'Năm'}</option>
          </select>
        </div>

        {/* Dynamic Controls based on Filter Type */}
        {filterType === 'date' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1">
              <label className="text-sm text-gray-600">{t('common.Từ ngày') || 'Từ ngày'}:</label>
              <DatePicker
                selected={(() => {
                  try {
                    const date = parseISO(fromDate);
                    return !isNaN(date) ? date : null;
                  } catch {
                    return null;
                  }
                })()}
                onChange={(date) => setFromDate(date ? format(date, 'yyyy-MM-dd') : '')}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="px-2 py-1 border border-gray-300 rounded text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-1">
              <label className="text-sm text-gray-600">{t('common.Đến ngày') || 'Đến ngày'}:</label>
              <DatePicker
                selected={(() => {
                  try {
                    const date = parseISO(toDate);
                    return !isNaN(date) ? date : null;
                  } catch {
                    return null;
                  }
                })()}
                onChange={(date) => setToDate(date ? format(date, 'yyyy-MM-dd') : '')}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="px-2 py-1 border border-gray-300 rounded text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {filterType === 'month' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1">
              <label className="text-sm text-gray-600">{t('common.Tháng') || 'Tháng'}:</label>
              <select
                className="px-2 py-1 border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              <label className="text-sm text-gray-600">{t('common.Năm') || 'Năm'}:</label>
              <select
                className="px-2 py-1 border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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

        {filterType === 'year' && (
          <div className="flex items-center space-x-1">
            <label className="text-sm text-gray-600">{t('common.Năm') || 'Năm'}:</label>
            <select
              className="px-2 py-1 border border-gray-300 bg-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700 flex items-center gap-1.5 font-medium transition"
          onClick={handleApplyFilter}
          type="button"
        >
          <FaFilter className="text-xs" />
          {t('common.Lọc') || 'Lọc'}
        </button>
        <button
          className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded shadow hover:bg-gray-600 flex items-center gap-1.5 font-medium transition"
          onClick={handleResetFilter}
          type="button"
        >
          <FaRedo className="text-xs" />
          {t('common.Đặt lại') || 'Đặt lại'}
        </button>

        {onExportExcel && (
          <button
            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded shadow hover:bg-green-700 flex items-center gap-1.5 font-medium transition"
            onClick={onExportExcel}
            type="button"
          >
            <FaFileExcel className="text-xs" />
            {t('common.Xuất Excel') || 'Xuất Excel'}
          </button>
        )}

        {onExportPdf && (
          <button
            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded shadow hover:bg-red-700 flex items-center gap-1.5 font-medium transition"
            onClick={onExportPdf}
            type="button"
          >
            <FaFilePdf className="text-xs" />
            {t('common.Xuất PDF') || 'Xuất PDF'}
          </button>
        )}
      </div>
    </div>
  );
}

export default ReportFilter;
