import { Box, Typography } from '@mui/material';
import { memo } from 'react';
import React from 'react';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  borderColor?: string;
}

const ProgressBar = memo(
  ({
    percentage,
    height = 24,
    backgroundColor = '#1a1a1a',
    progressColor = '#2196f3',
    borderColor = '#fff',
  }: ProgressBarProps) => {
    // Ensure percentage is between 0 and 100
    const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);

    return (
      <Box
        sx={{
          position: 'relative',
          width: '80px',
          height: height,
          backgroundColor: backgroundColor,
          borderRadius: '1px 1px 0 0',
          borderLeft: `1px solid ${borderColor}`,
          overflow: 'hidden',
        }}
      >
        {/* Progress Fill */}
        <Box
          sx={{
            position: 'absolute',
            height: '100%',
            width: `${normalizedPercentage}%`,
            backgroundColor: progressColor,
            opacity: 0.5,
            transition: 'width 0.5s ease-in-out',
          }}
        />

        {/* Centered Percentage Text */}
        <Typography
          variant="body2"
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            mixBlendMode: 'difference', // Makes text readable on any background
            userSelect: 'none', // Prevents text selection
          }}
        >
          {`${Math.round(normalizedPercentage)}%`}
        </Typography>
      </Box>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
