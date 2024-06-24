'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Container,
  Divider,
  Grid2,
} from '@mui/material';
import Table from '../../Table';
import dayjs from 'dayjs';
import { AcceptedMethods, FetchStates, useFetch } from '@/hooks/useFetch';
import { redirect, useParams } from 'next/navigation';
import DateRangePicker from './DateRangePicker';
import LineChartComponent from './LineChart';
import StatsPageSkeleton from './Skeleton';
import { Dayjs } from 'dayjs';
import { StatsResponse } from '@/app/api/stats/route';
import RangeDropDown from '../../RangeDropDown';

const ranges = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Custom Range', value: 'custom' },
];

export default function StatsPage() {
  const [selectedRange, setSelectedRange] = useState('7d');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const { blogId } = useParams();

  if (!blogId) return redirect('/stats');
  const {
    dataRef,
    fetchState,
    doFetch: doFetchStatsData,
  } = useFetch<StatsResponse>({
    url: '/api/stats/blog/' + blogId,
    method: AcceptedMethods.GET,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (data) => {
      console.log(data, 'data');
    },
  });

  const getDateRange = useCallback((range: string) => {
    const end = dayjs();
    let start;

    switch (range) {
      case '7d':
        start = end.subtract(6, 'days');
        break;
      case '30d':
        start = end.subtract(30, 'days');
        break;
      case '90d':
        start = end.subtract(89, 'days');
        break;
      default:
        start = end.subtract(6, 'days');
    }

    return {
      start: start.format('YYYY-MM-DD'),
      end: end.format('YYYY-MM-DD'),
    };
  }, []);

  const fetchStats = useCallback(
    async (start: string, end: string) => {
      const queryParams = new URLSearchParams({
        blogId: blogId as string,
        startDate: start,
        endDate: end,
      });

      await doFetchStatsData(
        undefined,
        '/api/stats/blog/' + blogId + '?' + queryParams.toString()
      );
    },
    [blogId, doFetchStatsData]
  );

  useEffect(() => {
    if (selectedRange !== 'custom') {
      const { start, end } = getDateRange(selectedRange);
      fetchStats(start, end);
    }
  }, [selectedRange]);

  const handleDateRangeApply = (startDate: string, endDate: string) => {
    setDateRange([dayjs(startDate), dayjs(endDate)]);
    fetchStats(startDate, endDate);
  };

  if (fetchState === FetchStates.LOADING || fetchState === FetchStates.IDLE)
    return <StatsPageSkeleton />;
  if (!dataRef.current) return <div>No data available</div>;

  return (
    <Container>
      <Box sx={{ pt: 3, color: 'text.primary' }}>
        <Stack direction="row" justifyContent="space-between" mb={4}>
          <Stack direction="row" spacing={2}>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6">Total Views</Typography>
                <Typography variant="h4">
                  {dataRef.current.totals.total_views}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6">Total Likes</Typography>
                <Typography variant="h4">
                  {dataRef.current.totals.total_likes}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6">Total Comments</Typography>
                <Typography variant="h4">
                  {dataRef.current.totals.total_comments}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
          <RangeDropDown
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
            setDateRange={setDateRange}
            getDateRange={getDateRange}
            setIsDatePickerOpen={setIsDatePickerOpen}
            fetchStats={fetchStats}
          />
        </Stack>
        <Box sx={{ height: 400 }}>
          {dataRef.current.chartData.reaction && (
            <LineChartComponent
              statsData={dataRef.current.chartData.reaction}
            />
          )}
        </Box>
        <Divider sx={{ mb: 4 }} />
        <Grid2 container spacing={2} sx={{ width: '100%' }}>
          <Grid2
            size="grow"
            sx={{ borderRight: '1px solid #e0e0e0', padding: 2 }}
          >
            {dataRef.current?.chartData.referrers && (
              <Table
                data={dataRef.current.chartData.referrers}
                column1="Referrer"
                column2="Percentage"
              />
            )}
          </Grid2>
          <Grid2 size="grow" sx={{ padding: 2 }}>
            {dataRef.current?.chartData.browsers && (
              <Table
                data={dataRef.current.chartData.browsers}
                column1="Browser"
                column2="Percentage"
              />
            )}
          </Grid2>
        </Grid2>
        <Divider sx={{ my: 4 }} />
        <Grid2 container spacing={2} sx={{ width: '100%' }}>
          <Grid2
            size="grow"
            sx={{ padding: 2, borderRight: '1px solid #e0e0e0' }}
          >
            {dataRef.current?.chartData.devices && (
              <Table
                data={dataRef.current.chartData.devices}
                column1="Device"
                column2="Percentage"
              />
            )}
          </Grid2>
          <Grid2 size="grow" sx={{ padding: 2 }}>
            {dataRef.current?.chartData.operating_systems && (
              <Table
                data={dataRef.current.chartData.operating_systems}
                column1="Operating System"
                column2="Percentage"
              />
            )}
          </Grid2>
        </Grid2>
        <Divider sx={{ my: 4 }} />
        <DateRangePicker
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          onApply={handleDateRangeApply}
          initialDateRange={dateRange}
        />
      </Box>
    </Container>
  );
}
