'use client';

import { memo, useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  FormHelperText,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

interface DateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  initialDateRange?: [Dayjs | null, Dayjs | null];
}

const DateRangePicker = memo(
  ({ isOpen, onClose, onApply, initialDateRange }: DateRangePickerProps) => {
    const [startDate, setStartDate] = useState(
      initialDateRange?.[0]?.format('YYYY-MM-DD') || ''
    );
    const [endDate, setEndDate] = useState(
      initialDateRange?.[1]?.format('YYYY-MM-DD') || ''
    );
    const [error, setError] = useState<string>('');

    // Reset fields when modal opens
    useEffect(() => {
      if (isOpen) {
        setStartDate(initialDateRange?.[0]?.format('YYYY-MM-DD') || '');
        setEndDate(initialDateRange?.[1]?.format('YYYY-MM-DD') || '');
        setError('');
      }
    }, [isOpen, initialDateRange]);

    const validateDates = (): boolean => {
      if (!startDate || !endDate) {
        setError('Both dates are required');
        return false;
      }

      const start = dayjs(startDate);
      const end = dayjs(endDate);

      if (!start.isValid() || !end.isValid()) {
        setError('Invalid date format');
        return false;
      }

      if (start.isAfter(end)) {
        setError('Start date must be before end date');
        return false;
      }

      // if (end.diff(start, 'days') > 90) {
      //   setError('Date range cannot exceed 90 days');
      //   return false;
      // }

      setError('');
      return true;
    };

    const handleApply = () => {
      if (validateDates()) {
        onApply(startDate, endDate);
        onClose();
      }
    };

    return (
      <Modal open={isOpen} onClose={onClose} sx={{ color: 'text.primary' }}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            minWidth: 300,
            color: 'text.primary',
          }}
        >
          <Typography variant="h6" mb={3}>
            Select Date Range
          </Typography>

          <Stack spacing={3}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{
                max: endDate || undefined,
              }}
            />

            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{
                min: startDate || undefined,
              }}
            />

            {error && (
              <FormHelperText error sx={{ mx: 0 }}>
                {error}
              </FormHelperText>
            )}
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={!startDate || !endDate}
            >
              Apply
            </Button>
          </Stack>
        </Box>
      </Modal>
    );
  }
);

DateRangePicker.displayName = 'DateRangePicker';

export default DateRangePicker;
