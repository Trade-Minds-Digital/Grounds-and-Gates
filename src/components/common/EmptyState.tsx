import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <Box
      sx={{
        p: { xs: 4, sm: 6 },
        textAlign: 'center',
        bgcolor: '#FFFFFF',
        borderRadius: '24px',
        border: '1px dashed #ECE7DA',
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
          bgcolor: 'rgba(1, 62, 24, 0.06)',
          color: '#013E18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        {icon || <InboxOutlinedIcon sx={{ fontSize: 30 }} />}
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B', mb: 0.5 }}>
        {title}
      </Typography>

      {description && (
        <Typography variant="body2" sx={{ color: '#536458', maxWidth: 400, mb: actionText ? 2.5 : 0, lineHeight: 1.5 }}>
          {description}
        </Typography>
      )}

      {actionText && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{
            borderRadius: '12px',
            bgcolor: '#013E18',
            color: '#FFFFFF',
            fontWeight: 800,
            textTransform: 'none',
            px: 3,
            py: 1,
            '&:hover': { bgcolor: '#00280f' },
          }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

