export interface Objtemp {
  total: number;
  xAxis: string[];
  yAxis: number[];
}

export interface IViewsByDate {
  today: number;
  week: Objtemp;
  month: Objtemp;
  year: Objtemp;
}

export interface IStatsPerBlog {
  blogId: string;
  title: string;
  total_number_of_likes: number;
  total_number_of_comments: number;
  total_number_of_views: number;
}

interface IStatsResponseData {
  totalNumbers: {
    total_number_of_likes: number;
    total_number_of_comments: number;
    total_number_of_views: number;
  };
  viewsByDate: IViewsByDate;
  statsPerBlog: IStatsPerBlog[];
}

import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import WeeklyStatsChart from '../Charts/WeeklyStatsChart';
import { useQuery } from '@tanstack/react-query';
import { CustomAxiosAuth } from '../utils/CustomAxios';
import { useGlobalContext } from '../context/GlobalContext';
import BlogsStatsTable from '../components/BlogStatsTable';
import { Card, CardContent, CardHeader, Stack } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function UserStats() {
  const [value, setValue] = React.useState(0);
  const { user } = useGlobalContext();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const { data, isLoading, isError } = useQuery<{ data: IStatsResponseData }>({
    queryKey: ['repoData'],
    queryFn: () => CustomAxiosAuth(user?.token as string).get('/user/stats'),
  });

  if (isLoading) return <div>Loading...</div>;

  if (isError) return <div>Error...</div>;

  console.log(data);

  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <Card>
          <CardContent>
            <Typography variant="h6">Total number of views</Typography>
            <Typography variant="h3">
              {data?.data.totalNumbers.total_number_of_views}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">Total number of likes</Typography>
            <Typography variant="h3">
              {data?.data.totalNumbers.total_number_of_likes}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">Total number of comments</Typography>
            <Typography variant="h3">
              {data?.data.totalNumbers.total_number_of_comments}
            </Typography>
          </CardContent>
        </Card>
      </Stack>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Weekly" {...a11yProps(0)} />
            <Tab label="Monthly" {...a11yProps(1)} />
            <Tab label="Yearly" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          {data?.data.viewsByDate.week ? (
            <WeeklyStatsChart weeklyData={data?.data.viewsByDate.week} />
          ) : (
            <p>No data</p>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          {data?.data.viewsByDate.week ? (
            <WeeklyStatsChart weeklyData={data?.data.viewsByDate.month} />
          ) : (
            <p>No data</p>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          {data?.data.viewsByDate.week ? (
            <WeeklyStatsChart weeklyData={data?.data.viewsByDate.year} />
          ) : (
            <p>No data</p>
          )}
        </CustomTabPanel>
      </Box>
      <BlogsStatsTable StatsPerBlog={data?.data.statsPerBlog} />
    </Box>
  );
}
