import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by RouteErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#FAF8F2',
            py: 8,
            px: 2,
          }}
        >
          <Container maxWidth="sm">
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: '24px',
                textAlign: 'center',
                border: '1px solid rgba(1, 62, 24, 0.1)',
                bgcolor: '#FFFFFF',
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '20px',
                  bgcolor: 'rgba(179, 38, 30, 0.1)',
                  color: '#B3261E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <WarningAmberIcon sx={{ fontSize: 36 }} />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 900, color: '#18241B', mb: 1.5 }}>
                Something went wrong
              </Typography>
              <Typography variant="body2" sx={{ color: '#536458', mb: 3, lineHeight: 1.6 }}>
                An unexpected interface error occurred. You can reload this view or navigate back to the main marketplace.
              </Typography>

              {this.state.error?.message && (
                <Box
                  sx={{
                    bgcolor: '#FAF8F2',
                    p: 2,
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    color: '#B3261E',
                    textAlign: 'left',
                    fontFamily: 'monospace',
                    mb: 4,
                    overflowX: 'auto',
                    border: '1px solid #ECE7DA',
                  }}
                >
                  {this.state.error.message}
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReset}
                  sx={{
                    borderRadius: '12px',
                    borderColor: '#013E18',
                    color: '#013E18',
                    fontWeight: 700,
                    px: 3,
                  }}
                >
                  Reload Page
                </Button>
                <Button
                  variant="contained"
                  startIcon={<HomeIcon />}
                  onClick={() => {
                    window.location.href = window.location.pathname.startsWith('/Grounds-and-Gates')
                      ? '/Grounds-and-Gates/'
                      : '/';
                  }}
                  sx={{
                    borderRadius: '12px',
                    bgcolor: '#013E18',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    px: 3,
                    '&:hover': { bgcolor: '#00280f' },
                  }}
                >
                  Return to Home
                </Button>
              </Box>
            </Paper>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}
