/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { useNavigate } from 'react-router-dom';
import { RequestContext } from '../../App';
import { getStatistics } from '../../systems/api';
import { routes, defaultFilters } from '../../systems/constant';
import { formatScore } from '../../systems/util';
import { useTranslation } from 'react-i18next';

function ReportManagerReview() {
  const { setLoading } = useContext(RequestContext);
  const [statistics, setStatistics] = useState({"-": 0});
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    getStatistics(routes.reportManagerReview.component).then((statistics) => {
        setStatistics(statistics);
    }).catch(error => {
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('Fetch error:', error);
      }
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleChartClick = (score) => {
    sessionStorage.setItem(`${routes.managerReviewList.component}_filters`, JSON.stringify({...defaultFilters, managerReviewScore: score.replace("score", "")}));
    navigate(`${routes.managerReviewList.path}?backTo=${routes.reportManagerReview.path}`);
  };

  const generateChartData = (data) => [
    [t('report.Điểm'), t('report.Đánh giá'), { role: 'annotation' }],
    ...Object.entries(data || {}).map(([key, value]) => [
      { v: key, f: formatScore(key, t) },
      value,
      `${value} ${t('report.đánh giá')}`,
    ]),
  ];

  const chartData = generateChartData(statistics);

  return (
    <div className="m-1 p-6 shadow-md rounded-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold flex-grow text-left">{t(`routes.${routes.reportManagerReview.label}`)}</h1>
      </div>
      <div className="p-0">
        <div className="p-4 border rounded-lg">
          <Chart
            chartType="BarChart"
            data={chartData}
            options={{ legend: 'none', is3D: false, tooltip: { trigger: "none" } }}
            width="100%"
            height={chartData.length * 60}
            chartEvents={[
              {
                eventName: 'select',
                callback: ({ chartWrapper }) => {
                  const chart = chartWrapper.getChart();
                  const selection = chart.getSelection();
                  if (selection.length > 0) {
                    const [selectedItem] = selection;
                    const score = chartData[selectedItem.row + 1][0].v;
                    handleChartClick(score);
                  }
                },
              },
            ]}
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

export default ReportManagerReview;
