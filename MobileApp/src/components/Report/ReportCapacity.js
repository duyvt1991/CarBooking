/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { useNavigate } from 'react-router-dom';
import { RequestContext } from '../../App';
import { getStatistics } from '../../systems/api';
import { routes } from '../../systems/constant';
import { formatPersons, formatBuilding, formatRoomType } from '../../systems/util';
import { useTranslation } from 'react-i18next';

function ReportCapacity() {
  const { t } = useTranslation();
  const { setLoading, masterData } = useContext(RequestContext);
  const [statistics, setStatistics] = useState({});
  const [selectedBuildingCapacities, setSelectedBuildingCapacities] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getStatistics(routes.reportCapacity.component).then((statistics) => {
        setStatistics(statistics);
    }).catch(error => {
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('Fetch error:', error);
      }
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const generateChartData = (data, formatter, label) => [
    [label, t('report.Sức chứa')],
    ...Object.entries(data || {}).map(([key, value]) => [`${formatter(key)} (${value} ${t('report.người')})`, value])
  ];

  const buildingCapacitiesData = generateChartData(
    Object.entries(statistics.buildingCapacities || {}).reduce((acc, [key, counts]) => {
      acc[key] = Object.values(counts).reduce((a, b) => a + b, 0);
      return acc;
    }, {}),
    (key) => formatBuilding(key, masterData),
    t('report.Toà nhà')
  );

  const handleBuildingCapacitiesSelect = (chartWrapper) => {
    const chart = chartWrapper.getChart();
    const selection = chart.getSelection();
    if (selection.length > 0) {
      const selectedItem = selection[0];
      const selectedLabel = buildingCapacitiesData[selectedItem.row + 1][0];
      const selectedType = selectedLabel.split(' (')[0];
      const selectedKey = masterData.buildings.find(
        (building) => building.mvalue === selectedType
      )?.mkey;
      setSelectedBuildingCapacities(selectedKey);
      if (!selectedKey) return;
      setTimeout(() => chart.setSelection(selection), 0);
    } else {
      setSelectedBuildingCapacities(null);
    }
  };

  const filteredCapacitiesData = generateChartData(
    selectedBuildingCapacities ? statistics.buildingCapacities[selectedBuildingCapacities] : statistics.totalCapacities,
    (key) => formatRoomType(key, masterData),
    t('report.Loại phòng')
  );

  const totalBuildingCapacities = buildingCapacitiesData.slice(1).reduce((total, [, count]) => total + count, 0);
  const totalCapacities = filteredCapacitiesData.slice(1).reduce((total, [, count]) => total + count, 0);

  return (
    <div className="m-1 p-6 shadow-md rounded-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold flex-grow text-left">{t(`routes.${routes.reportCapacity.label}`)}</h1>
      </div>
      <div className="p-0">
        <div className="grid grid-cols-1 my-4 sm:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">{t('report.Theo toà nhà')}</h2>
            <Chart
              chartType="PieChart"
              data={buildingCapacitiesData}
              options={{ pieHole: 0.4, is3D: false, chartArea: { width: '85%', height: '85%' }, tooltip: { trigger: 'none' }, legend: { position: "labeled" }, pieSliceText: "none" }}
              width="100%"
              chartEvents={[
                {
                  eventName: 'select',
                  callback: ({ chartWrapper }) => handleBuildingCapacitiesSelect(chartWrapper),
                },
              ]}
            />
            <p className="mt-2 text-gray-600 text-center">{t('report.Tổng sức chứa')}: {formatPersons(totalBuildingCapacities, null, t)}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">{t('report.Theo loại phòng')}{selectedBuildingCapacities ? ` - ${formatBuilding(selectedBuildingCapacities, masterData)}` : ""}</h2>
            <Chart
              chartType="PieChart"
              data={filteredCapacitiesData}
              options={{ pieHole: 0.4, is3D: false, chartArea: { width: '85%', height: '85%' }, tooltip: { trigger: 'none' }, legend: { position: "labeled" }, pieSliceText: "none" }}
              width="100%"
            />
            <p className="mt-2 text-gray-600 text-center">{t('report.Tổng sức chứa')}: {formatPersons(totalCapacities, null, t)}</p>
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
