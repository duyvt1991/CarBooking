/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { useNavigate } from 'react-router-dom';
import { RequestContext } from '../../App';
import { getStatistics } from '../../systems/api';
import { routes } from '../../systems/constant';
import { formatDepartment } from '../../systems/util';
import { useTranslation } from 'react-i18next';
import ReportFilter from '../../shared/ReportFilter';
import { exportToExcel, exportToPdf } from '../../systems/exportUtil';

function ReportUsageDemand() {
  const { setLoading, masterData } = useContext(RequestContext);
  const [statistics, setStatistics] = useState({"-": 0});
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchStatistics = (filters = {}) => {
    setLoading(true);
    getStatistics(routes.reportUsageDemand.component, filters).then((statistics) => {
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

  const generateChartData = (data) => [
    [t('report.Phòng ban'), t('report.Số lần')],
    ...Object.entries(data || {}).map(([key, value]) => [`${formatDepartment(key, masterData)}\n(${value} ${t('report.lần')})`, value])
  ];

  const chartData = generateChartData(statistics);

  const handleExportExcel = () => {
    const dataToExport = Object.entries(statistics || {}).map(([key, value]) => ({
      [t('report.Phòng ban')]: formatDepartment(key, masterData),
      [t('report.Số lần')]: value
    }));

    exportToExcel(dataToExport, 'bao-cao-nhu-cau-su-dung.xlsx', 'Nhu cầu sử dụng');
  };

  const handleExportPdf = () => {
    exportToPdf('report-usage-demand-container', 'bao-cao-nhu-cau-su-dung.pdf');
  };

  return (
    <div id="report-usage-demand-container" className="m-1 p-6 shadow-md rounded-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold flex-grow text-left">{t(`routes.${routes.reportUsageDemand.label}`)}</h1>
      </div>
      <ReportFilter onFilter={handleFilter} onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} />
      <div className="p-0">
        <div className="p-4 border rounded-lg">
          <Chart
            chartType="BarChart"
            data={chartData}
            options={{ legend: 'none', is3D: false, tooltip: { trigger: "none" } }}
            width="100%"
            height={chartData.length * 60}
          />
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

export default ReportUsageDemand;
