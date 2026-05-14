/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { useNavigate } from 'react-router-dom';
import { RequestContext } from '../../App';
import { getStatistics } from '../../systems/api';
import { routes, defaultFilters } from '../../systems/constant';
import { formatScore } from '../../systems/util';
import { useTranslation } from 'react-i18next';

function ReportUserReview() {
  const { setLoading } = useContext(RequestContext);
  const [statistics, setStatistics] = useState({cleanScore: {"-": 0}, equipmentScore: {"-": 0}, facilityScore: {"-": 0}});
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    getStatistics(routes.reportUserReview.component).then((statistics) => {
        setStatistics(statistics);
    }).catch(error => {
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('Fetch error:', error);
      }
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const generateChartData = (data) => [
    [t('report.Điểm'), t('report.Đánh giá'), { role: 'annotation' }],
    ...Object.entries(data || {}).map(([key, value]) => [
      { v: key, f: formatScore(key, t) },
      value,
      `${value} ${t('report.đánh giá')}`,
    ]),
  ];
  const chartCleanData = generateChartData(statistics.cleanScore);
  const chartEquipmentData = generateChartData(statistics.equipmentScore);
  const chartFacilityData = generateChartData(statistics.facilityScore);

  const handleChartCleanClick = (score) => {
    sessionStorage.setItem(`${routes.userReviewList.component}_filters`, JSON.stringify({...defaultFilters, userReviewCleanScore: score.replace("score", "")}));
    navigate(`${routes.userReviewList.path}?backTo=${routes.reportUserReview.path}`);
  };

  const handleChartEquipmentClick = (score) => {
    sessionStorage.setItem(`${routes.userReviewList.component}_filters`, JSON.stringify({...defaultFilters, userReviewEquipmentScore: score.replace("score", "")}));
    navigate(`${routes.userReviewList.path}?backTo=${routes.reportUserReview.path}`);
  };

  const handleChartFacilityClick = (score) => {
    sessionStorage.setItem(`${routes.userReviewList.component}_filters`, JSON.stringify({...defaultFilters, userReviewFacilityScore: score.replace("score", "")}));
    navigate(`${routes.userReviewList.path}?backTo=${routes.reportUserReview.path}`);
  };

  return (
    <div className="m-1 p-6 shadow-md rounded-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold flex-grow text-left">{t(`routes.${routes.reportUserReview.label}`)}</h1>
      </div>
      <div className="p-0">
        <div className="grid grid-cols-1 my-4 sm:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">{t('report.Đánh giá vệ sinh')}</h2>
            <Chart
              chartType="BarChart"
              data={chartCleanData}
              options={{ legend: 'none', is3D: false, tooltip: { trigger: "none" } }}
              width="100%"
              height={chartCleanData.length * 60}
              chartEvents={[
                {
                  eventName: 'select',
                  callback: ({ chartWrapper }) => {
                    const chart = chartWrapper.getChart();
                    const selection = chart.getSelection();
                    if (selection.length > 0) {
                      const [selectedItem] = selection;
                      const score = chartCleanData[selectedItem.row + 1][0].v;
                      handleChartCleanClick(score);
                    }
                  },
                },
              ]}
            />
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">{t('report.Đánh giá thiết bị')}</h2>
            <Chart
              chartType="BarChart"
              data={chartEquipmentData}
              options={{ legend: 'none', is3D: false, tooltip: { trigger: "none" } }}
              width="100%"
              height={chartEquipmentData.length * 60}
              chartEvents={[
                {
                  eventName: 'select',
                  callback: ({ chartWrapper }) => {
                    const chart = chartWrapper.getChart();
                    const selection = chart.getSelection();
                    if (selection.length > 0) {
                      const [selectedItem] = selection;
                      const score = chartEquipmentData[selectedItem.row + 1][0].v;
                      handleChartEquipmentClick(score);
                    }
                  },
                },
              ]}
            />
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">{t('report.Đánh giá cơ sở vật chất')}</h2>
            <Chart
              chartType="BarChart"
              data={chartFacilityData}
              options={{ legend: 'none', is3D: false, tooltip: { trigger: "none" } }}
              width="100%"
              height={chartFacilityData.length * 60}
              chartEvents={[
                {
                  eventName: 'select',
                  callback: ({ chartWrapper }) => {
                    const chart = chartWrapper.getChart();
                    const selection = chart.getSelection();
                    if (selection.length > 0) {
                      const [selectedItem] = selection;
                      const score = chartFacilityData[selectedItem.row + 1][0].v;
                      handleChartFacilityClick(score);
                    }
                  },
                },
              ]}
            />
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

export default ReportUserReview;
