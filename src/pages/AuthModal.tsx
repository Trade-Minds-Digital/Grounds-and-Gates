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
  const [fullName, setFullName] = useState('Mohanraj S.');
  const [email, setEmail] = useState('mohanrajs0410@gmail.com');
  const [password, setPassword] = useState('demo123456');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'register') {
        const res = await api.register({
          fullName,
          email,
          password: password || 'Buyer@123',
          role
        });
        const name = res.user?.fullName || fullName;
        onLoginSuccess(role, name);
      } else {
        const res = await api.login({
          email,
          password: password || 'Buyer@123'
        });
        const name = res.user?.fullName || fullName;
        const resRole = (res.user?.role as UserRole) || role;
        onLoginSuccess(resRole, name);
      }
    } catch {
      // Offline fallback
      onLoginSuccess(role, fullName);
    }
    onClose();
  };

  const fillAsBuyer = () => {
    setRole('buyer');
    setFullName('Mohanraj S. (Buyer)');
    setEmail('mohanrajs0410@gmail.com');
  };

  const fillAsSeller = () => {
    setRole('owner');
    setFullName('Senthil Nathan (Owner)');
    setEmail('senthil.nathan@example.com');
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
          onChange={(_, val) => setMode(val)}
          variant="fullWidth"
          indicatorColor="secondary"
        >
          <Tab value="login" label={t.auth.loginTitle} />
          <Tab value="register" label={t.auth.registerTitle} />
        </Tabs>
      </Box>

      {/* Quick Demo Pre-Fill Helpers */}
      <Box sx={{ p: 1.5, bgcolor: '#FAF8F2', borderBottom: '1px solid #ECE7DA', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#536458', textTransform: 'uppercase', fontSize: '0.65rem' }}>
          Quick Demo:
        </Typography>
        <Chip
          label={t.auth.quickFillBuyer}
          size="small"
          clickable
          onClick={fillAsBuyer}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #013E18',
            color: '#013E18',
            fontWeight: 700,
            fontSize: '0.7rem',
            height: 24,
            '&:hover': { bgcolor: 'rgba(1, 62, 24, 0.08)' },
          }}
        />
        <Chip
          label={t.auth.quickFillSeller}
          size="small"
          clickable
          onClick={fillAsSeller}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #C99325',
            color: '#8B6413',
            fontWeight: 700,
            fontSize: '0.7rem',
            height: 24,
            '&:hover': { bgcolor: 'rgba(201, 147, 37, 0.12)' },
          }}
        />
      </Box>

      {/* Form Content */}
      <DialogContent sx={{ p: 3.5 }}>
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
