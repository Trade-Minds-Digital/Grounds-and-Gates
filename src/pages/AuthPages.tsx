import React, { useState } from 'react';
import { UserRole, LanguageCode } from '../types/property';
import { api } from '../services/api';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface AuthPagesProps {
  initialMode?: 'login' | 'register' | 'forgot-password';
  lang: LanguageCode;
  onLoginSuccess: (role: UserRole, userDetails: { name: string; email: string }) => void;
  onNavigate: (view: string, params?: any) => void;
  onShowToast?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'login',
  lang: _lang,
  onLoginSuccess,
  onNavigate,
  onShowToast
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);
  const [role, setRole] = useState<UserRole>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (mode === 'forgot-password') {
      if (!email.trim()) {
        setAuthError('Please enter your registered email address.');
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await api.forgotPassword(email.trim());
        setResetSent(true);
        if (onShowToast) {
          onShowToast(res.message, res.hasEmailProvider ? 'success' : 'info');
        }
      } catch (err: any) {
        setAuthError(err.message || 'Failed to submit password reset request.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setAuthError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        const res = await api.register({
          fullName: name.trim() || 'Client',
          email: email.trim(),
          password,
          role,
        });
        const finalName = res.user?.fullName || name || 'User';
        onLoginSuccess(role, { name: finalName, email: email.trim() });
        if (onShowToast) {
          onShowToast(`Account registered successfully! Welcome, ${finalName}`, 'success');
        }
      } else {
        const res = await api.login({
          email: email.trim(),
          password,
        });
        const finalName = res.user?.fullName || (email ? email.split('@')[0] : 'User');
        const finalRole = (res.user?.role as UserRole) || role;
        onLoginSuccess(finalRole, { name: finalName, email: email.trim() });
        if (onShowToast) {
          onShowToast(`Welcome back, ${finalName}!`, 'success');
        }
      }

      if (role === 'buyer') {
        onNavigate('buyer-dashboard');
      } else {
        onNavigate('seller-dashboard');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F5F2E9',
        py: { xs: 8, sm: 12 },
        px: { xs: 2, sm: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: '24px',
          p: { xs: 3.5, sm: 4.5 },
          bgcolor: '#FFFFFF',
          border: '1px solid rgba(24, 36, 27, 0.08)',
        }}
      >
        {/* Brand Lockup */}
        <Box sx={{ textAlign: 'center', pb: 3, borderBottom: '1px solid #ECE7DA' }}>
          <Chip
            size="small"
            label="Grounds & Gates Portal"
            sx={{
              bgcolor: 'rgba(201, 147, 37, 0.15)',
              color: '#8B6413',
              fontWeight: 800,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              mb: 1.5,
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#18241B', letterSpacing: '-0.01em' }}>
            {mode === 'login' && 'Sign In to Your Account'}
            {mode === 'register' && 'Create Your Free Account'}
            {mode === 'forgot-password' && 'Reset Your Password'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.5, fontSize: '0.8rem' }}>
            {mode === 'login' && 'Manage your shortlisted properties, site visit schedules, or listings.'}
            {mode === 'register' && 'Join thousands of buyers and property owners across Tamil Nadu.'}
            {mode === 'forgot-password' && 'Enter your email to receive password recovery instructions.'}
          </Typography>
        </Box>

        {/* Form Body */}
        {resetSent ? (
          <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#FAF8F2', borderRadius: '16px', border: '1px solid #ECE7DA' }}>
            <CheckCircleIcon sx={{ fontSize: 40, color: '#013E18', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18' }}>
              Recovery Instructions Dispatched
            </Typography>
            <Typography variant="body2" sx={{ color: '#536458', fontSize: '0.8rem', mt: 0.5 }}>
              If an account is associated with <strong>{email}</strong>, secure recovery instructions have been sent.
            </Typography>
            <Button
              variant="text"
              onClick={() => {
                setResetSent(false);
                setMode('login');
              }}
              sx={{ mt: 1.5, fontWeight: 800, color: '#013E18', fontSize: '0.75rem' }}
            >
              Return to Login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Role Selector (if Registering) */}
            {mode === 'register' && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 1, display: 'block' }}>
                  I am using Grounds & Gates as:
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <Button
                    type="button"
                    variant={role === 'buyer' ? 'contained' : 'outlined'}
                    color="primary"
                    size="small"
                    onClick={() => setRole('buyer')}
                    sx={{ borderRadius: '10px', fontWeight: 800, py: 1 }}
                  >
                    Property Buyer
                  </Button>
                  <Button
                    type="button"
                    variant={role === 'owner' ? 'contained' : 'outlined'}
                    color="secondary"
                    size="small"
                    onClick={() => setRole('owner')}
                    sx={{ borderRadius: '10px', fontWeight: 800, py: 1 }}
                  >
                    Owner / Seller
                  </Button>
                </Box>
              </Box>
            )}

            {mode === 'register' && (
              <TextField
                label="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}

            <TextField
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              fullWidth
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {mode !== 'forgot-password' && (
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}

            {mode === 'login' && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ color: '#536458', fontWeight: 600 }}>
                      Keep me signed in
                    </Typography>
                  }
                />
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setMode('forgot-password')}
                  sx={{ color: '#C99325', fontWeight: 700, fontSize: '0.75rem', p: 0, minWidth: 0 }}
                >
                  Forgot?
                </Button>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 18, color: '#C99325' }} />}
              sx={{ py: 1.3, borderRadius: '12px', fontWeight: 800, mt: 1 }}
            >
              {mode === 'login' && 'Sign In'}
              {mode === 'register' && 'Complete Registration'}
              {mode === 'forgot-password' && 'Send Reset Instructions'}
            </Button>
          </Box>
        )}

        {/* Footer switch links */}
        <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid #ECE7DA', textAlign: 'center' }}>
          {mode === 'login' && (
            <Typography variant="caption" sx={{ color: '#536458' }}>
              Don't have an account yet?{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => setMode('register')}
                sx={{ color: '#013E18', fontWeight: 800, fontSize: '0.75rem', p: 0, minWidth: 0 }}
              >
                Register Free
              </Button>
            </Typography>
          )}

          {mode === 'register' && (
            <Typography variant="caption" sx={{ color: '#536458' }}>
              Already registered?{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => setMode('login')}
                sx={{ color: '#013E18', fontWeight: 800, fontSize: '0.75rem', p: 0, minWidth: 0 }}
              >
                Sign In
              </Button>
            </Typography>
          )}

          {mode === 'forgot-password' && (
            <Typography variant="caption" sx={{ color: '#536458' }}>
              Remembered your password?{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => setMode('login')}
                sx={{ color: '#013E18', fontWeight: 800, fontSize: '0.75rem', p: 0, minWidth: 0 }}
              >
                Back to Sign In
              </Button>
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};
