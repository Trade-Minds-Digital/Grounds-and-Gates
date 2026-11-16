import React from 'react';
import { Box, Snackbar, Alert, AlertTitle } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { removeToast } from '../../store/slices/toastSlice';

export const ToastContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.toast.toasts);

  if (toasts.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        maxWidth: 420,
        width: 'calc(100% - 48px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          severity={toast.type}
          onClose={() => dispatch(removeToast(toast.id))}
          sx={{
            pointerEvents: 'auto',
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.06)',
            fontSize: '0.85rem',
            fontWeight: 600,
            animation: 'fadeIn 0.25s ease-out',
            '& .MuiAlert-icon': {
              fontSize: 22,
            },
          }}
        >
          {toast.title && <AlertTitle sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{toast.title}</AlertTitle>}
          {toast.message}
        </Alert>
      ))}
    </Box>
  );
};

