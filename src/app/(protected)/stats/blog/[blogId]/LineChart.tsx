'use client';

import { LineChart } from '@mui/x-charts/LineChart';
import { memo } from 'react';
import { StatsResponse } from '@/app/api/stats/route';

const LineChartComponent = memo(
  ({ statsData }: { statsData: StatsResponse['chartData']['reaction'] }) => {
    console.log(statsData);
    return (
      <LineChart
        experimentalMarkRendering
        xAxis={[
          {
            data: statsData.dates,
            scaleType: 'band',
          },
        ]}
        series={[
          {
            data: statsData.views,
            label: 'Views',
            color: '#2196f3', // blue
          },
          {
            data: statsData.likes,
            label: 'Likes',
            color: '#4caf50', // green
          },
          {
            data: statsData.comments,
            label: 'Comments',
            color: '#ff9800', // orange
          },
        ]}
      />
    );
  },
  (prevProps, nextProps) => {
    return prevProps.statsData === nextProps.statsData;
  }
);

export default LineChartComponent;
