import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyIcon from '@mui/icons-material/Key';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Logo } from '../../components/common/Logo';
import { api } from '../../services/api';
import { LanguageCode } from '../../types/property';

interface AdminForgotPasswordPageProps {
  lang: LanguageCode;
  onNavigate: (view: string, params?: any) => void;
}

export const AdminForgotPasswordPage: React.FC<AdminForgotPasswordPageProps> = ({
  lang,
  onNavigate,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    message: string;
    hasEmailProvider: boolean;
    resetToken?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusResult(null);

    if (!email.trim()) {
      setErrorMessage(
        lang === 'ta'
          ? 'உங்கள் பதிவுசெய்த மின்னஞ்சல் முகவரியை உள்ளிடவும்.'
          : 'Please enter your registered staff email address.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.forgotPassword(email.trim());
      setStatusResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F5F2E9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 540,
          width: '100%',
          p: { xs: 3.5, sm: 5 },
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid rgba(201, 147, 37, 0.25)',
          boxShadow: '0 20px 50px rgba(1, 62, 24, 0.08)',
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Logo variant="horizontal" size="md" />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B', mb: 1, textAlign: 'center' }}>
          {lang === 'ta' ? 'கடவுச்சொல் மீட்பு' : 'Staff Password Recovery'}
        </Typography>

        <Typography variant="body2" sx={{ color: '#536458', mb: 3.5, textAlign: 'center', lineHeight: 1.6 }}>
          {lang === 'ta'
            ? 'உங்கள் அதிகாரப்பூர்வ மின்னஞ்சல் முகவரியை உள்ளிடவும். கடவுச்சொல்லை மீட்டமைப்பதற்கான டோக்கன் அல்லது வழிமுறை உருவாக்கப்படும்.'
            : 'Enter your registered staff email. A single-use expiring reset token will be generated to safely update your credentials.'}
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {errorMessage}
          </Alert>
        )}

        {statusResult && (
          <Box sx={{ mb: 3 }}>
            <Alert
              severity={statusResult.hasEmailProvider ? 'success' : 'info'}
              icon={statusResult.hasEmailProvider ? undefined : <InfoOutlinedIcon />}
              sx={{ borderRadius: '12px', mb: 2 }}
            >
              {statusResult.message}
            </Alert>

            {!statusResult.hasEmailProvider && statusResult.resetToken && (
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: '#FAF8F2',
                  border: '1px dashed #C99325',
                  borderRadius: '12px',
                  mb: 2,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B6413', display: 'block', mb: 0.5 }}>
                  OPERATIONAL PASSWORD RESET TOKEN:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: '#FFFFFF',
                    p: 1.25,
                    borderRadius: '6px',
                    wordBreak: 'break-all',
                    fontWeight: 700,
                    color: '#013E18',
                    border: '1px solid rgba(24, 36, 27, 0.1)',
                  }}
                >
                  {statusResult.resetToken}
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => onNavigate('admin-reset-password', { token: statusResult.resetToken })}
                  sx={{
                    mt: 2,
                    borderColor: '#C99325',
                    color: '#8B6413',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(201, 147, 37, 0.08)', borderColor: '#8B6413' },
                  }}
                >
                  {lang === 'ta' ? 'இந்த டோக்கனுடன் கடவுச்சொல்லை மீட்டமைக்க →' : 'Proceed with this Token to Reset Password →'}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {!statusResult && (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              type="email"
              placeholder="e.g. admin@groundsandgates.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#536458', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#FAF8F2',
                  '&.Mui-focused fieldset': {
                    borderColor: '#013E18',
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                py: 1.5,
                bgcolor: '#013E18',
                color: '#F5F2E9',
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#00280F' },
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : lang === 'ta' ? (
                'மீட்டமைப்பு டோக்கன் கோருக'
              ) : (
                'Generate Password Reset Token'
              )}
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => onNavigate('admin-login')}
            sx={{
              color: '#536458',
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              '&:hover': { color: '#013E18', bgcolor: 'transparent' },
            }}
          >
            {lang === 'ta' ? 'நிர்வாக உள்நுழைவுக்குத் திரும்பு' : 'Return to Admin Login'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
