'use client';

import { Box, MenuItem, Select } from '@mui/material';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { memo, useCallback, useEffect } from 'react';

const ranges = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Custom Range', value: 'custom' },
];

interface RangeDropDownProps {
  selectedRange: string;
  setSelectedRange: (range: string) => void;
  setDateRange: (range: [Dayjs | null, Dayjs | null]) => void;
  setIsDatePickerOpen: (isOpen: boolean) => void;
  fetchStats: (start: string, end: string) => void;
  getDateRange: (range: string) => { start: string; end: string };
}

const RangeDropDown = memo(
  ({
    selectedRange,
    setSelectedRange,
    setDateRange,
    setIsDatePickerOpen,
    fetchStats,
    getDateRange,
  }: RangeDropDownProps) => {
    const handleRangeChange = (event: any) => {
      const value = event.target.value;
      setSelectedRange(value);
      if (value === 'custom') {
        setIsDatePickerOpen(true);
      } else {
        const { start, end } = getDateRange(value);
        setDateRange([dayjs(start), dayjs(end)]);
        fetchStats(start, end);
      }
    };

    return (
      <Box>
        <Select value={selectedRange} onChange={handleRangeChange}>
          {ranges.map((range) => (
            <MenuItem key={range.value} value={range.value}>
              {range.label}
            </MenuItem>
          ))}
        </Select>
      </Box>
    );
  }
);

export default RangeDropDown;
