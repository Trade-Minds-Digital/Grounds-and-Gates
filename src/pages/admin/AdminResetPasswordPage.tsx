import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import KeyIcon from '@mui/icons-material/Key';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Logo } from '../../components/common/Logo';
import { api } from '../../services/api';
import { LanguageCode } from '../../types/property';

interface AdminResetPasswordPageProps {
  lang: LanguageCode;
  initialToken?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const AdminResetPasswordPage: React.FC<AdminResetPasswordPageProps> = ({
  lang,
  initialToken = '',
  onNavigate,
}) => {
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialToken) setToken(initialToken);
  }, [initialToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token.trim()) {
      setErrorMessage(lang === 'ta' ? 'மீட்டமைப்பு டோக்கனை உள்ளிடவும்.' : 'Please provide the password reset token.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage(lang === 'ta' ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் கொண்டதாக இருக்க வேண்டும்.' : 'Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(lang === 'ta' ? 'இரு கடவுச்சொற்களும் பொருந்தவில்லை.' : 'Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await api.resetPassword(token.trim(), newPassword);
      setSuccessMessage(
        lang === 'ta'
          ? 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது! உங்கள் புதிய கடவுச்சொல்லுடன் உள்நுழையலாம்.'
          : 'Password successfully updated! You can now log in with your new password.'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. The token may be expired or invalid.');
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
          maxWidth: 520,
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
          {lang === 'ta' ? 'புதிய கடவுச்சொல்லை அமைக்கவும்' : 'Set New Staff Password'}
        </Typography>

        <Typography variant="body2" sx={{ color: '#536458', mb: 3.5, textAlign: 'center', fontSize: '0.88rem' }}>
          {lang === 'ta'
            ? 'உங்கள் மீட்பு டோக்கன் மற்றும் புதிய பாதுகாப்பான கடவுச்சொல்லை உள்ளிடவும்.'
            : 'Enter your single-use reset token and choose a new secure password.'}
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {errorMessage}
          </Alert>
        )}

        {successMessage ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: '12px' }}>
              {successMessage}
            </Alert>
            <Button
              variant="contained"
              fullWidth
              onClick={() => onNavigate('admin-login')}
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
              {lang === 'ta' ? 'நிர்வாக உள்நுழைவுக்கு செல்ல →' : 'Proceed to Staff Login →'}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 0.75, display: 'block' }}>
              {lang === 'ta' ? 'மீட்டமைப்பு டோக்கன்' : 'Reset Token'}
            </Typography>
            <TextField
              fullWidth
              required
              placeholder="e.g. 4f981b2a..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isLoading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon sx={{ color: '#536458', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#FAF8F2',
                },
              }}
            />

            <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 0.75, display: 'block' }}>
              {lang === 'ta' ? 'புதிய கடவுச்சொல்' : 'New Password (min 6 characters)'}
            </Typography>
            <TextField
              fullWidth
              required
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#536458', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#FAF8F2',
                },
              }}
            />

            <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 0.75, display: 'block' }}>
              {lang === 'ta' ? 'கடவுச்சொல்லை உறுதிப்படுத்தவும்' : 'Confirm New Password'}
            </Typography>
            <TextField
              fullWidth
              required
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#536458', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                mb: 3.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#FAF8F2',
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
                'கடவுச்சொல்லை மீட்டமைக்க'
              ) : (
                'Update Staff Password'
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
            {lang === 'ta' ? 'உள்நுழைவுக்குத் திரும்பு' : 'Back to Login'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
