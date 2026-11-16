import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'A connection or server error occurred while retrieving information. Please try again.',
  onRetry,
}) => {
  return (
    <Box
      sx={{
        p: { xs: 4, sm: 5 },
        textAlign: 'center',
        bgcolor: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid rgba(179, 38, 30, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '16px',
          bgcolor: 'rgba(179, 38, 30, 0.1)',
          color: '#B3261E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <CloudOffIcon sx={{ fontSize: 30 }} />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B', mb: 0.5 }}>
        {title}
      </Typography>

      <Typography variant="body2" sx={{ color: '#536458', maxWidth: 420, mb: onRetry ? 2.5 : 0, lineHeight: 1.5 }}>
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{
            borderRadius: '12px',
            borderColor: '#013E18',
            color: '#013E18',
            fontWeight: 700,
            px: 3,
            py: 1,
          }}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

