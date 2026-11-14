import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <aside aria-label="Notifications" className="fixed top-20 right-4 sm:right-6 z-50 pointer-events-none">
      <Stack spacing={1.5} sx={{ maxWidth: 400, width: '100%' }}>
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <Snackbar
              key={toast.id}
              open={true}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              sx={{ position: 'static', pointerEvents: 'auto' }}
            >
              <Alert
                severity={toast.type}
                icon={
                  isSuccess ? (
                    <CheckCircleIcon sx={{ fontSize: 20, color: '#C99325' }} />
                  ) : isError ? (
                    <ErrorOutlineIcon sx={{ fontSize: 20, color: '#FDA4AF' }} />
                  ) : (
                    <InfoOutlinedIcon sx={{ fontSize: 20, color: '#C99325' }} />
                  )
                }
                action={
                  <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={() => onDismiss(toast.id)}
                    sx={{ p: 0.5, color: '#F5F2E9', opacity: 0.8, '&:hover': { opacity: 1 } }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                }
                sx={{
                  width: '100%',
                  borderRadius: '14px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                  backdropFilter: 'blur(8px)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  alignItems: 'center',
                  bgcolor: isSuccess
                    ? '#013E18'
                    : isError
                    ? '#881337'
                    : '#18241B',
                  color: '#F5F2E9',
                  border: isSuccess
                    ? '1px solid rgba(201, 147, 37, 0.4)'
                    : isError
                    ? '1px solid rgba(244, 63, 94, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.15)',
                  '& .MuiAlert-message': {
                    color: '#F5F2E9',
                    py: 0.5,
                  },
                }}
              >
                {toast.message}
              </Alert>
            </Snackbar>
          );
        })}
      </Stack>
    </aside>
  );
};
