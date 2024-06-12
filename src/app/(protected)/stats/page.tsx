'use client';

import { useFetch, AcceptedMethods, FetchStates } from '@/hooks/useFetch';
import {
  Box,
  Container,
  Divider,
  Grid2,
  Card,
  CardContent,
  Typography,
  Stack,
} from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import LineChartComponent from './blog/[blogId]/LineChart';
import { StatsResponse } from '@/app/api/stats/route';
import Table from './Table';
import BlogsTable from './BlogsTable';
import DateRangePicker from './blog/[blogId]/DateRangePicker';
import { Dayjs } from 'dayjs';
import RangeDropDown from './RangeDropDown';
import StatsPageSkeleton from './blog/[blogId]/Skeleton';

const page = () => {
  const [selectedRange, setSelectedRange] = useState('7d');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const { dataRef, doFetch, fetchState } = useFetch<StatsResponse>({
    url: '/api/stats',
    method: AcceptedMethods.GET,
    onSuccess: (data) => {
      console.log(data, 'stats');
    },
  });

  const fetchStats = useCallback(async (start: string, end: string) => {
    const queryParams = new URLSearchParams({
      startDate: start,
      endDate: end,
    });

    await doFetch(undefined, '/api/stats?' + queryParams.toString());
  }, []);

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

  useEffect(() => {
    if (selectedRange !== 'custom') {
      const { start, end } = getDateRange(selectedRange);
      fetchStats(start, end);
    }
  }, [selectedRange, getDateRange, fetchStats]);

  const handleDateRangeApply = useCallback(
    (startDate: string, endDate: string) => {
      setDateRange([dayjs(startDate), dayjs(endDate)]);
      fetchStats(startDate, endDate);
    },
    [fetchStats]
  );

  if (fetchState === FetchStates.LOADING || fetchState === FetchStates.IDLE)
    return <StatsPageSkeleton />;
  if (!dataRef.current) return <div>No data available</div>;

  return (
    <Container>
      <Box sx={{ color: 'text.primary', pt: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Stack direction="row" spacing={2}>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6">Total Views</Typography>
                <Typography variant="h4">
                  {dataRef.current?.totals.total_views || 0}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6">Total Likes</Typography>
                <Typography variant="h4">
                  {dataRef.current?.totals.total_likes || 0}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6">Total Comments</Typography>
                <Typography variant="h4">
                  {dataRef.current?.totals.total_comments || 0}
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

        <Box sx={{ width: '100%', height: '500px' }}>
          {dataRef.current && (
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
        {dataRef.current?.chartData.blogs && (
          <BlogsTable data={dataRef.current.chartData.blogs} />
        )}
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
};

export default page;
