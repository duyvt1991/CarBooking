/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { useNavigate } from 'react-router-dom';
import { RequestContext } from '../../App';
import { getStatistics } from '../../systems/api';
import { routes } from '../../systems/constant';
import { formatUsagePurpose } from '../../systems/util';
import { useTranslation } from 'react-i18next';
import ReportFilter from '../../shared/ReportFilter';
import { exportToExcel, exportToPdf } from '../../systems/exportUtil';

function ReportGuestCount() {
  const { setLoading, masterData } = useContext(RequestContext);
  const [statistics, setStatistics] = useState({});
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchStatistics = (filters = {}) => {
    setLoading(true);
    getStatistics(routes.reportGuestCount.component, filters).then((statistics) => {
        setStatistics(statistics);
    }).catch(error => {
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('Fetch error:', error);
      }
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleFilter = (filters) => {
    fetchStatistics(filters);
  };

  const generateChartData = (data, formatter, label) => [
    [label, t('report.Số lượng')],
    ...Object.entries(data || {}).map(([key, value]) => [`${formatter(key)} (${value} ${t('report.khách')})`, value])
  ];

  const usagePurposeData = generateChartData(
    Object.entries(statistics.usagePurposeCounts || {}).reduce((acc, [key, counts]) => {
      acc[key] = typeof counts === 'number' ? counts : Object.values(counts).reduce((a, b) => a + b, 0);
      return acc;
    }, {}),
    (key) => formatUsagePurpose(key, masterData),
    t('report.Phân loại khách')
  );

  const totalUsagePurpose = usagePurposeData.slice(1).reduce((total, [, count]) => total + count, 0);

  const handleExportExcel = () => {
    const dataToExport = Object.entries(statistics.usagePurposeCounts || {}).map(([key, counts]) => {
      const val = typeof counts === 'number' ? counts : Object.values(counts).reduce((a, b) => a + b, 0);
      return {
        [t('report.Phân loại khách')]: formatUsagePurpose(key, masterData),
        [t('report.Số lượng')]: val
      };
    });

    dataToExport.push({
      [t('report.Phân loại khách')]: t('report.Tổng'),
      [t('report.Số lượng')]: totalUsagePurpose
    });

    exportToExcel(dataToExport, 'bao-cao-so-luong-khach.xlsx', 'Số lượng khách');
  };

  const handleExportPdf = () => {
    exportToPdf('report-guest-count-container', 'bao-cao-so-luong-khach.pdf');
  };

  return (
    <div id="report-guest-count-container" className="m-1 p-6 shadow-md rounded-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold flex-grow text-left">{t(`routes.${routes.reportGuestCount.label}`)}</h1>
      </div>
      <ReportFilter onFilter={handleFilter} onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} />
      <div className="p-0">
        <div className="max-w-2xl mx-auto my-4">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2 text-center">{t('report.Theo phân loại khách')}</h2>
            <Chart
              chartType="PieChart"
              data={usagePurposeData}
              options={{ pieHole: 0.4, is3D: false, chartArea: { width: '85%', height: '85%' }, tooltip: { trigger: 'none' }, legend: { position: "labeled" }, pieSliceText: "none" }}
              width="100%"
            />
            <p className="mt-2 text-gray-600 text-center">{t('report.Tổng')}: {totalUsagePurpose} {t('report.khách')}</p>
          </div>
        </div>
        <div className="flex mt-4 justify-center space-x-6">
          <button
            className="back-btn bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
            type="button"
            onClick={() => navigate(routes.home.path)}
          >
            {t('report.Trở về')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportGuestCount;
