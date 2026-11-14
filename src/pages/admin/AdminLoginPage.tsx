import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Chip,
  Container,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Logo } from '../../components/common/Logo';
import { api } from '../../services/api';
import { isStaffRole, getRoleDisplayName } from '../../utils/rbac';
import { LanguageCode } from '../../types/property';
import { AdminUser } from '../../types/crm';

interface AdminLoginPageProps {
  lang: LanguageCode;
  onLoginSuccess: (user: AdminUser) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  lang,
  onLoginSuccess,
  onNavigate,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage(
        lang === 'ta'
          ? 'மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.'
          : 'Please enter your registered staff email and password.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.login({ email: email.trim(), password });
      const user = res.user;

      if (!user || !isStaffRole(user.role)) {
        // Disallow non-staff users from logging into the Admin portal
        await api.logout();
        setErrorMessage(
          lang === 'ta'
            ? 'அணுகல் மறுக்கப்பட்டது: இந்த போர்டல் அங்கீகரிக்கப்பட்ட அதிகாரிகளுக்கு மட்டுமே. வாங்குபவர்கள் மற்றும் விற்பனையாளர்கள் பொது வலைத்தளத்தைப் பயன்படுத்தவும்.'
            : 'Access Denied: This administrative portal is restricted to authorized Grounds & Gates staff. Buyers and Sellers should access the public portal.'
        );
        setIsLoading(false);
        return;
      }

      onLoginSuccess(user as AdminUser);
      onNavigate('admin-dashboard');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setErrorMessage(
          lang === 'ta'
            ? 'சர்வர் இணைப்பு தோல்வியடைந்தது. பின்தள சேவையகம் (Backend Server) இயங்குகிறதா என சரிபார்க்கவும்.'
            : 'Unable to connect to the authentication server. Please verify the backend REST service is running.'
        );
      } else {
        setErrorMessage(
          err.message ||
            (lang === 'ta'
              ? 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்.'
              : 'Invalid administrative credentials. Please check your email and password.')
        );
      }
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
        p: { xs: 2, sm: 3, md: 5 },
      }}
    >
      <Paper
        elevation={4}
        sx={{
          maxWidth: 1040,
          width: '100%',
          borderRadius: { xs: '20px', md: '28px' },
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '5fr 6fr' },
          boxShadow: '0 24px 60px rgba(1, 62, 24, 0.12)',
          border: '1px solid rgba(201, 147, 37, 0.25)',
        }}
      >
        {/* Left Branded Hero Panel (Desktop) */}
        <Box
          sx={{
            bgcolor: '#013E18',
            color: '#F5F2E9',
            p: { xs: 4, sm: 5, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle architectural background watermark */}
          <Box
            sx={{
              position: 'absolute',
              right: -40,
              bottom: -40,
              opacity: 0.06,
              transform: 'rotate(-10deg)',
              pointerEvents: 'none',
            }}
          >
            <Logo variant="light" size="lg" showTagline={false} />
          </Box>

          {/* Top Brand Identity */}
          <Box>
            <Box sx={{ mb: 3 }}>
              <Logo variant="light" size="lg" />
            </Box>

            <Chip
              icon={<AdminPanelSettingsIcon sx={{ color: '#C99325 !important' }} />}
              label={lang === 'ta' ? 'அதிகாரப்பூர்வ நிர்வாக போர்டல்' : 'Enterprise Staff Portal'}
              size="small"
              sx={{
                bgcolor: 'rgba(201, 147, 37, 0.15)',
                color: '#E0AA3E',
                border: '1px solid rgba(201, 147, 37, 0.35)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                mb: 4,
              }}
            />

            <Typography
              variant="h4"
              sx={{
                color: '#FFFFFF',
                fontWeight: 800,
                lineHeight: 1.25,
                mb: 2,
                fontFamily: "'Noto Sans', 'Noto Sans Tamil', sans-serif",
              }}
            >
              {lang === 'ta' ? 'ரியல் எஸ்டேட் நிர்வாக கட்டமைப்பு' : 'Unified Real Estate CRM Workspace'}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(245, 242, 233, 0.82)',
                lineHeight: 1.7,
                fontSize: '0.92rem',
                maxWidth: 380,
              }}
            >
              {lang === 'ta'
                ? 'தமிழ்நாட்டின் முன்னணி சொத்துக்கள், வாடிக்கையாளர் லீட்கள், தள ஆய்வுகள் மற்றும் முன்பதிவுகளை பாதுகாப்பாக நிர்வகிக்கவும்.'
                : 'Manage verified land layouts, multi-district sales pipelines, client site visits, and booking tokens with role-enforced precision.'}
            </Typography>
          </Box>

          {/* Security Assurance Footer */}
          <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid rgba(245, 242, 233, 0.12)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <ShieldIcon sx={{ color: '#C99325', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: '#C99325', fontWeight: 700, letterSpacing: '0.05em' }}>
                SERVER-ENFORCED RBAC & AUDIT LOGS
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(245, 242, 233, 0.65)', display: 'block', fontSize: '0.78rem' }}>
              Authorized internal personnel only. Every administrative session and record change is cryptographically logged.
            </Typography>
          </Box>
        </Box>

        {/* Right Focused Login Form */}
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            p: { xs: 3.5, sm: 5, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Top Return link */}
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => onNavigate('home')}
              sx={{
                color: '#536458',
                fontWeight: 600,
                fontSize: '0.82rem',
                p: 0,
                textTransform: 'none',
                '&:hover': { color: '#013E18', bgcolor: 'transparent' },
              }}
            >
              {lang === 'ta' ? '← பொது வலைத்தளத்திற்குத் திரும்பு' : '← Back to Public Marketplace'}
            </Button>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B', mb: 0.75 }}>
            {lang === 'ta' ? 'நிர்வாக உள்நுழைவு' : 'Staff Administrative Sign In'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mb: 3.5, fontSize: '0.88rem' }}>
            {lang === 'ta'
              ? 'உங்கள் பணியாளர் சான்றுகளுடன் CRM கணக்கில் நுழையவும்.'
              : 'Enter your credentials to access your authorized CRM modules.'}
          </Typography>

          {errorMessage && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: '12px',
                border: '1px solid rgba(190, 18, 60, 0.25)',
                bgcolor: '#FFF1F2',
                color: '#9F1239',
                fontSize: '0.88rem',
              }}
            >
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 1, display: 'block' }}>
              {lang === 'ta' ? 'அதிகாரப்பூர்வ மின்னஞ்சல்' : 'Staff Email Address'}
            </Typography>
            <TextField
              fullWidth
              required
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
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
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#FAF8F2',
                  '&.Mui-focused fieldset': {
                    borderColor: '#013E18',
                    borderWidth: '2px',
                  },
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B' }}>
                {lang === 'ta' ? 'கடவுச்சொல்' : 'Password'}
              </Typography>
              <Button
                onClick={() => onNavigate('admin-forgot-password')}
                sx={{
                  color: '#C99325',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  p: 0,
                  minWidth: 'auto',
                  textTransform: 'none',
                  '&:hover': { color: '#8B6413', bgcolor: 'transparent' },
                }}
              >
                {lang === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot password?'}
              </Button>
            </Box>

            <TextField
              fullWidth
              required
              id="admin-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                mb: 3.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#FAF8F2',
                  '&.Mui-focused fieldset': {
                    borderColor: '#013E18',
                    borderWidth: '2px',
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              endIcon={!isLoading && <ArrowForwardIcon />}
              sx={{
                py: 1.5,
                bgcolor: '#013E18',
                color: '#F5F2E9',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(1, 62, 24, 0.25)',
                '&:hover': {
                  bgcolor: '#00280F',
                  boxShadow: '0 10px 28px rgba(1, 62, 24, 0.35)',
                },
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={20} color="inherit" />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {lang === 'ta' ? 'சரிபார்க்கிறது...' : 'Authenticating...'}
                  </Typography>
                </Box>
              ) : lang === 'ta' ? (
                'நிர்வாக போர்ட்டலில் நுழைக'
              ) : (
                'Sign In to Admin CRM'
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
