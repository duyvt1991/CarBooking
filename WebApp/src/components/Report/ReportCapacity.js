/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { useNavigate } from 'react-router-dom';
import { RequestContext } from '../../App';
import { getStatistics } from '../../systems/api';
import { routes } from '../../systems/constant';
import { formatRoom, formatRoomType } from '../../systems/util';
import { useTranslation } from 'react-i18next';
import ReportFilter from '../../shared/ReportFilter';
import { exportToExcel, exportToPdf } from '../../systems/exportUtil';

function ReportCapacity() {
  const { t } = useTranslation();
  const { setLoading, masterData } = useContext(RequestContext);
  const [statistics, setStatistics] = useState({});
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const navigate = useNavigate();

  const fetchStatistics = (filters = {}) => {
    setLoading(true);
    getStatistics(routes.reportCapacity.component, filters).then((statistics) => {
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
    [label, t('report.Số chuyến')],
    ...Object.entries(data || {}).map(([key, value]) => [`${formatter(key)} (${value} ${t('report.chuyến')})`, value])
  ];

  const roomTypeCapacitiesData = generateChartData(
    statistics.totalRoomTypeCapacities || {},
    (key) => formatRoomType(key, masterData),
    t('report.Loại xe')
  );

  const handleRoomTypeSelect = (chartWrapper) => {
    const chart = chartWrapper.getChart();
    const selection = chart.getSelection();
    if (selection.length > 0) {
      const selectedItem = selection[0];
      const selectedLabel = roomTypeCapacitiesData[selectedItem.row + 1][0];
      const selectedTypeName = selectedLabel.split(' (')[0];
      const selectedKey = masterData.roomTypes.find(
        (type) => type.mvalue === selectedTypeName
      )?.mkey;
      setSelectedRoomType(selectedKey);
      if (!selectedKey) return;
      setTimeout(() => chart.setSelection(selection), 0);
    } else {
      setSelectedRoomType(null);
    }
  };

  const filteredCarCapacitiesData = generateChartData(
    selectedRoomType ? statistics.roomTypeCapacities?.[selectedRoomType] : statistics.totalRoomCapacities,
    (key) => formatRoom(key, masterData),
    t('report.Xe')
  );

  const totalRoomTypeCapacities = roomTypeCapacitiesData.slice(1).reduce((total, [, count]) => total + count, 0);
  const totalCarCapacities = filteredCarCapacitiesData.slice(1).reduce((total, [, count]) => total + count, 0);

  const handleExportExcel = () => {
    const dataToExport = Object.entries(statistics.totalRoomTypeCapacities || {}).map(([key, count]) => ({
      [t('report.Loại xe')]: formatRoomType(key, masterData),
      [t('report.Số chuyến')]: count
    }));

    dataToExport.push({
      [t('report.Loại xe')]: t('report.Tổng'),
      [t('report.Số chuyến')]: totalRoomTypeCapacities
    });

    exportToExcel(dataToExport, 'bao-cao-cong-suat-xe.xlsx', 'Công suất xe');
  };

  const handleExportPdf = () => {
    exportToPdf('report-capacity-container', 'bao-cao-cong-suat-xe.pdf');
  };

  return (
    <div id="report-capacity-container" className="m-1 p-6 shadow-md rounded-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold flex-grow text-left">{t(`routes.${routes.reportCapacity.label}`)}</h1>
      </div>
      <ReportFilter onFilter={handleFilter} onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} />
      <div className="p-0">
        <div className="grid grid-cols-1 my-4 sm:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">{t('report.Theo loại xe')}</h2>
            <Chart
              chartType="PieChart"
              data={roomTypeCapacitiesData}
              options={{ pieHole: 0.4, is3D: false, chartArea: { width: '85%', height: '85%' }, tooltip: { trigger: 'none' }, legend: { position: "labeled" }, pieSliceText: "none" }}
              width="100%"
              chartEvents={[
                {
                  eventName: 'select',
                  callback: ({ chartWrapper }) => handleRoomTypeSelect(chartWrapper),
                },
              ]}
            />
            <p className="mt-2 text-gray-600 text-center">{t('report.Tổng')}: {totalRoomTypeCapacities} {t('report.chuyến')}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">{t('report.Theo xe')}{selectedRoomType ? ` - ${formatRoomType(selectedRoomType, masterData)}` : ""}</h2>
            <Chart
              chartType="PieChart"
              data={filteredCarCapacitiesData}
              options={{ pieHole: 0.4, is3D: false, chartArea: { width: '85%', height: '85%' }, tooltip: { trigger: 'none' }, legend: { position: "labeled" }, pieSliceText: "none" }}
              width="100%"
            />
            <p className="mt-2 text-gray-600 text-center">{t('report.Tổng')}: {totalCarCapacities} {t('report.chuyến')}</p>
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

export default ReportCapacity;
