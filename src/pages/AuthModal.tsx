import React, { useState } from 'react';
import { LanguageCode, UserRole } from '../types/property';
import { translations } from '../i18n/translations';
import { Logo } from '../components/common/Logo';
import { api } from '../services/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Tabs,
  Tab,
  InputAdornment,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  initialMode?: 'login' | 'register';
  onLoginSuccess: (role: UserRole, name: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialMode = 'login',
  onLoginSuccess,
}) => {
  const t = translations[lang];
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>('buyer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide your email and password.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        const res = await api.register({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role,
        });
        const name = res.user?.fullName || fullName;
        onLoginSuccess(role, name);
        onClose();
      } else {
        const res = await api.login({
          email: email.trim(),
          password,
        });
        const name = res.user?.fullName || email.split('@')[0];
        const resRole = (res.user?.role as UserRole) || role;
        onLoginSuccess(resRole, name);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: '#013E18',
          color: '#F5F2E9',
          p: 3.5,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
          <Logo variant="light" size="sm" showTagline={false} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
          {mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(245, 242, 233, 0.8)', mt: 0.5, display: 'block' }}>
          {mode === 'login' ? t.auth.loginSub : t.auth.registerSub}
        </Typography>
      </DialogTitle>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: '#ECE7DA', bgcolor: '#FAF8F2' }}>
        <Tabs
          value={mode}
          onChange={(_, val) => {
            setError(null);
            setMode(val);
          }}
          variant="fullWidth"
          indicatorColor="secondary"
        >
          <Tab value="login" label={t.auth.loginTitle} />
          <Tab value="register" label={t.auth.registerTitle} />
        </Tabs>
      </Box>

      {/* Form Content */}
      <DialogContent sx={{ p: 3.5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Role Selection when Registering */}
            {mode === 'register' && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 1, display: 'block' }}>
                  Select Your Account Role
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <Button
                    type="button"
                    variant={role === 'buyer' ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => setRole('buyer')}
                    startIcon={<PersonIcon sx={{ fontSize: 18 }} />}
                    sx={{ justifyContent: 'flex-start', py: 1.2, textTransform: 'none' }}
                  >
                    Buyer
                  </Button>
                  <Button
                    type="button"
                    variant={role === 'owner' ? 'contained' : 'outlined'}
                    color="secondary"
                    onClick={() => setRole('owner')}
                    startIcon={<BusinessIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      justifyContent: 'flex-start',
                      py: 1.2,
                      textTransform: 'none',
                      ...(role === 'owner' ? { bgcolor: '#C99325', color: '#FFFFFF' } : {}),
                    }}
                  >
                    Owner / Seller
                  </Button>
                </Box>
              </Box>
            )}

            {mode === 'register' && (
              <TextField
                label={t.auth.fullName}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
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
              label={t.auth.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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

            <TextField
              label={t.auth.password}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ py: 1.4, borderRadius: '14px', fontWeight: 800, mt: 1 }}
            >
              {mode === 'login' ? t.auth.loginBtn : t.auth.registerBtn}
            </Button>

            <Box sx={{ textAlign: 'center', pt: 1 }}>
              <Button
                variant="text"
                color="primary"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                sx={{ fontSize: '0.8rem', fontWeight: 700 }}
              >
                {mode === 'login' ? t.auth.switchToRegister : t.auth.switchToLogin}
              </Button>
            </Box>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};
