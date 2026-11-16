import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  MenuItem,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GavelIcon from '@mui/icons-material/Gavel';
import PinDropIcon from '@mui/icons-material/PinDrop';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { Logo } from '../components/common/Logo';
import { LanguageCode, UserRole } from '../types/property';
import { useLogin, useRegister, useCurrentUser } from '../query/hooks/useAuthQueries';
import {
  auth,
  sendPasswordResetEmail,
  sendEmailVerification,
  mapFirebaseError,
} from '../config/firebase';
import { api } from '../services/api';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
} from '../schemas/auth.schema';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  closeAuthModal,
  setAuthModalMode,
  setAuthModalVerificationEmail,
  toggleSaveProperty,
  AuthModalMode,
} from '../store/slices/uiSlice';
import { addToast } from '../store/slices/toastSlice';
import { getSafeRedirectPath } from '../utils/navigationUtils';

const TN_DISTRICTS = [
  'Coimbatore',
  'Chennai',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Erode',
  'Tiruppur',
  'Dindigul',
  'Thanjavur',
  'Vellore',
  'Kanchipuram',
  'Chengalpattu',
  'The Nilgiris',
  'Tirunelveli',
];

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: LanguageCode;
  initialMode?: AuthModalMode;
  contextMessage?: string;
  redirectPath?: string;
  onLoginSuccess?: (role: UserRole, userDetails: { name: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
  initialMode = 'login',
  contextMessage,
  redirectPath,
  onLoginSuccess,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const activeModalState = useAppSelector((state) => state.ui.activeAuthModal);
  const currentMode = activeModalState.mode || initialMode || 'login';
  const effectiveContextMessage = activeModalState.contextMessage || contextMessage;
  const effectiveRedirectPath = activeModalState.redirectPath || redirectPath;
  const postAuthAction = activeModalState.postAuthAction;
  const triggerType = activeModalState.trigger;

  const { refetch: refetchCurrentUser } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // Focus restoration ref
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Local UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  // Capture triggering element on open and restore on close
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
      // Mark as shown in sessionStorage so 5s auto-popup never fires again
      try {
        sessionStorage.setItem('gg_auth_modal_auto_shown', 'true');
      } catch {}
    } else {
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        triggerElementRef.current.focus();
      }
    }
  }, [isOpen]);

  // Countdown timer for resend verification
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Forms
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    shouldFocusError: true,
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      accountUsage: 'buyer',
      role: 'buyer',
      district: 'Coimbatore',
      city: '',
      locality: '',
      sellerType: 'owner',
      companyName: '',
      reraNumber: '',
      licenseNumber: '',
      preferredContactMethod: 'phone',
      password: '',
      confirmPassword: '',
      termsAccepted: true,
      marketingConsent: false,
    },
    shouldFocusError: true,
  });

  const forgotForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    shouldFocusError: true,
  });

  const handleTabChange = (_: React.SyntheticEvent, newMode: 'login' | 'register') => {
    setAuthError(null);
    dispatch(setAuthModalMode(newMode));
  };

  const handleModalClose = () => {
    onClose();
    dispatch(closeAuthModal());

    // If modal was opened via compatibility route /login or /register, return to safe public page
    const cleanPath = location.pathname.toLowerCase();
    if (cleanPath === '/login' || cleanPath === '/register' || cleanPath === '/forgot-password') {
      navigate('/', { replace: true });
    }
  };

  // ─── LOGIN SUBMIT ─────────────────────────────────────────────────────────────
  const onLoginSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      const res = await loginMutation.mutateAsync(data);
      const user = res.user;

      if (onLoginSuccess) {
        onLoginSuccess((user?.role as UserRole) || 'buyer', {
          name: user?.fullName || data.email.split('@')[0],
          email: data.email,
        });
      }

      // Check email verification status
      const isVerified = Boolean((res as any)?.firebaseUser?.emailVerified || user?.emailVerified);
      if (!isVerified) {
        dispatch(setAuthModalVerificationEmail(data.email));
        dispatch(setAuthModalMode('verify-email'));
        return;
      }

      // Execute resumeable post-auth action (e.g. save property)
      if (postAuthAction?.type === 'save-property') {
        dispatch(toggleSaveProperty(postAuthAction.propertyId));
        dispatch(addToast({ type: 'success', message: 'Property saved to your favorites!' }));
      }

      dispatch(closeAuthModal());
      dispatch(addToast({ type: 'success', message: 'Signed in successfully!' }));

      // Navigate to destination (unless auto-triggered on current page)
      if (triggerType !== 'auto-5s' && effectiveRedirectPath) {
        const target = getSafeRedirectPath(effectiveRedirectPath);
        if (target && target !== location.pathname) {
          navigate(target);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please verify your email and password.');
    }
  };

  // ─── REGISTER SUBMIT ──────────────────────────────────────────────────────────
  const onRegisterSubmit = async (data: RegisterFormData) => {
    setAuthError(null);
    try {
      await registerMutation.mutateAsync({
        ...data,
        role: data.accountUsage === 'buyer' ? 'buyer' : 'seller',
      });

      dispatch(setAuthModalVerificationEmail(data.email));
      dispatch(setAuthModalMode('verify-email'));
      setVerificationNotice(`Verification link dispatched to ${data.email}. Please verify to activate your account.`);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed. Please check the form and try again.');
    }
  };

  // ─── FORGOT PASSWORD SUBMIT ───────────────────────────────────────────────────
  const onForgotSubmit = async (data: ForgotPasswordFormData) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, data.email.trim());
      setResetSent(true);
    } catch (err: any) {
      // Security: never reveal non-existence of email address
      setResetSent(true);
    }
  };

  // ─── VERIFY EMAIL CHECK ───────────────────────────────────────────────────────
  const handleCheckVerification = async () => {
    setIsCheckingVerification(true);
    setVerificationNotice(null);
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          const freshToken = await auth.currentUser.getIdToken(true);
          api.setToken(freshToken);
          await refetchCurrentUser();

          // Resume post-auth action if any
          if (postAuthAction?.type === 'save-property') {
            dispatch(toggleSaveProperty(postAuthAction.propertyId));
            dispatch(addToast({ type: 'success', message: 'Property saved to your favorites!' }));
          }

          dispatch(closeAuthModal());
          dispatch(addToast({ type: 'success', message: 'Email confirmed! Your account is active.' }));

          if (triggerType !== 'auto-5s' && effectiveRedirectPath) {
            const target = getSafeRedirectPath(effectiveRedirectPath);
            if (target && target !== location.pathname) {
              navigate(target);
            }
          }
          return;
        }
      }
      setVerificationNotice(
        'Email verification is not yet detected. Please click the link inside the confirmation email and check again.'
      );
    } catch (err: any) {
      setVerificationNotice('Unable to check verification at this moment. Please try again.');
    } finally {
      setIsCheckingVerification(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setResendCooldown(60);
        dispatch(addToast({ type: 'info', message: 'Verification link resent to your inbox.' }));
      }
    } catch (err: any) {
      setAuthError(mapFirebaseError(err));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleModalClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="auth-modal-title"
      aria-describedby="auth-modal-description"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: '20px', sm: '24px' },
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
            boxShadow: '0 24px 64px rgba(1, 62, 24, 0.2)',
            border: '1px solid rgba(1, 62, 24, 0.1)',
            m: { xs: 2, sm: 4 },
            maxHeight: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 64px)' },
          },
        },
        backdrop: {
          sx: {
            bgcolor: 'rgba(1, 62, 24, 0.45)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 200ms ease-in-out',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        {/* ─── LEFT BRAND PANEL (DESKTOP) ────────────────────────── */}
        {!isMobile && (
          <Box
            sx={{
              width: 320,
              bgcolor: '#013E18',
              color: '#FAF8F2',
              p: 4.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(201, 147, 37, 0.15) 0%, transparent 60%)',
              borderRight: '1px solid rgba(201, 147, 37, 0.2)',
            }}
          >
            <Box>
              <Box sx={{ mb: 3 }}>
                <Logo variant="light" size="md" showTagline={false} />
              </Box>

              <Typography
                variant="h6"
                sx={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 800,
                  color: '#FAF8F2',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3,
                  mb: 1.5,
                }}
              >
                Tamil Nadu’s Curated Real Estate Platform
              </Typography>

              <Typography variant="body2" sx={{ color: 'rgba(250, 248, 242, 0.75)', fontSize: '0.82rem', lineHeight: 1.6, mb: 4 }}>
                Access verified property titles, DTCP & RERA approved layouts, and direct seller negotiations across Coimbatore, Chennai, and regional hubs.
              </Typography>

              {/* Verified Pillars */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <GavelIcon sx={{ fontSize: 20, color: '#C99325', mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#FAF8F2' }}>
                      Legal & Regulatory Audit
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(250, 248, 242, 0.65)', fontSize: '0.72rem' }}>
                      Document verification against CMDA, DTCP, and RERA registries.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <PinDropIcon sx={{ fontSize: 20, color: '#C99325', mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#FAF8F2' }}>
                      Confirmed Map Coordinates
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(250, 248, 242, 0.65)', fontSize: '0.72rem' }}>
                      Geo-referenced boundaries and direct route access verification.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <VerifiedUserIcon sx={{ fontSize: 20, color: '#C99325', mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#FAF8F2' }}>
                      Direct Buyer & Seller Portal
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(250, 248, 242, 0.65)', fontSize: '0.72rem' }}>
                      Shortlist properties, schedule site visits, and negotiate directly.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ pt: 3, borderTop: '1px solid rgba(250, 248, 242, 0.1)' }}>
              <Typography variant="caption" sx={{ color: 'rgba(250, 248, 242, 0.5)', fontSize: '0.7rem' }}>
                Secure authentication backed by Firebase. Grounds & Gates © 2026.
              </Typography>
            </Box>
          </Box>
        )}

        {/* ─── RIGHT FORM AREA ───────────────────────────────────── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FFFFFF',
            position: 'relative',
            maxHeight: { xs: 'calc(100vh - 32px)', md: 680 },
          }}
        >
          {/* Top Bar: Close Button & Mobile Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 2.5, sm: 4 },
              pt: { xs: 2.5, sm: 3 },
              pb: 1.5,
              borderBottom: '1px solid #ECE7DA',
            }}
          >
            {isMobile ? (
              <Logo variant="horizontal" size="sm" showTagline={false} />
            ) : (
              <Box>
                <Typography id="auth-modal-title" variant="h6" sx={{ fontWeight: 800, color: '#013E18', fontSize: '1.05rem' }}>
                  {currentMode === 'login' && 'Sign In to Grounds & Gates'}
                  {currentMode === 'register' && 'Create Your Account'}
                  {currentMode === 'forgot-password' && 'Password Recovery'}
                  {currentMode === 'verify-email' && 'Email Verification'}
                </Typography>
                <Typography id="auth-modal-description" variant="caption" sx={{ color: '#536458', fontSize: '0.75rem' }}>
                  {currentMode === 'login' && 'Access your shortlisted properties, bookings, and inquiries.'}
                  {currentMode === 'register' && 'Join verified buyers and sellers across Tamil Nadu.'}
                  {currentMode === 'forgot-password' && 'Enter your email to receive recovery instructions.'}
                  {currentMode === 'verify-email' && 'Please confirm your email address to continue.'}
                </Typography>
              </Box>
            )}

            <IconButton
              aria-label="Close authentication dialog"
              onClick={handleModalClose}
              sx={{
                color: '#536458',
                '&:hover': { bgcolor: '#FAF8F2', color: '#013E18' },
                borderRadius: '50%',
                p: 0.8,
              }}
            >
              <CloseIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Box>

          {/* Context Banner (e.g. Save Property / Post Property requirement) */}
          {effectiveContextMessage && (
            <Box
              sx={{
                bgcolor: '#FEF9EE',
                borderBottom: '1px solid #F3E8CF',
                px: { xs: 2.5, sm: 4 },
                py: 1.2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 18, color: '#C99325', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: '#855C09', fontWeight: 600, fontSize: '0.78rem' }}>
                {effectiveContextMessage}
              </Typography>
            </Box>
          )}

          {/* Mode Tabs (Only on Login & Register) */}
          {(currentMode === 'login' || currentMode === 'register') && (
            <Box sx={{ px: { xs: 2.5, sm: 4 }, pt: 1, bgcolor: '#FAF8F2', borderBottom: '1px solid #ECE7DA' }}>
              <Tabs
                value={currentMode}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  minHeight: 44,
                  '& .MuiTab-root': {
                    minHeight: 44,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#536458',
                    '&.Mui-selected': { color: '#013E18' },
                  },
                  '& .MuiTabs-indicator': {
                    bgcolor: '#013E18',
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                <Tab value="login" label="Sign In" />
                <Tab value="register" label="Create Account" />
              </Tabs>
            </Box>
          )}

          {/* Scrollable Form Body */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: { xs: 2.5, sm: 4 },
              pb: { xs: 'max(1.5rem, env(safe-area-inset-bottom))', sm: 3 },
            }}
          >
            {/* Global Error Banner */}
            {authError && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px', fontSize: '0.82rem' }}>
                {authError}
              </Alert>
            )}

            {/* ─── 1. LOGIN VIEW ────────────────────────────────────── */}
            {currentMode === 'login' && (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} noValidate>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 0.8, display: 'block' }}>
                      Email Address <span style={{ color: '#B3261E' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="you@example.com"
                      type="email"
                      autoComplete="email"
                      {...loginForm.register('email')}
                      error={Boolean(loginForm.formState.errors.email)}
                      helperText={loginForm.formState.errors.email?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ fontSize: 18, color: '#8C9A90' }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B' }}>
                        Password <span style={{ color: '#B3261E' }}>*</span>
                      </Typography>
                      <Button
                        type="button"
                        variant="text"
                        size="small"
                        onClick={() => {
                          setAuthError(null);
                          dispatch(setAuthModalMode('forgot-password'));
                        }}
                        sx={{
                          p: 0,
                          minWidth: 'auto',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#C99325',
                          textTransform: 'none',
                          '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                        }}
                      >
                        Forgot password?
                      </Button>
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...loginForm.register('password')}
                      error={Boolean(loginForm.formState.errors.password)}
                      helperText={loginForm.formState.errors.password?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlinedIcon sx={{ fontSize: 18, color: '#8C9A90' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loginForm.formState.isSubmitting || loginMutation.isPending}
                    sx={{
                      bgcolor: '#013E18',
                      color: '#FFFFFF',
                      py: 1.2,
                      borderRadius: '12px',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      '&:hover': { bgcolor: '#012A10' },
                      mt: 1,
                    }}
                  >
                    {loginForm.formState.isSubmitting || loginMutation.isPending ? (
                      <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Typography variant="body2" sx={{ color: '#536458', fontSize: '0.82rem' }}>
                      Don’t have an account?{' '}
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => {
                          setAuthError(null);
                          dispatch(setAuthModalMode('register'));
                        }}
                        sx={{
                          p: 0,
                          minWidth: 'auto',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#013E18',
                          textTransform: 'none',
                          '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                        }}
                      >
                        Create an account
                      </Button>
                    </Typography>
                  </Box>
                </Box>
              </form>
            )}

            {/* ─── 2. REGISTER VIEW ─────────────────────────────────── */}
            {currentMode === 'register' && (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} noValidate>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                  {/* Account Usage Toggle */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 1, display: 'block' }}>
                      I want to use Grounds & Gates to:
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                      <Box
                        onClick={() => {
                          registerForm.setValue('accountUsage', 'buyer');
                          registerForm.setValue('role', 'buyer');
                        }}
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          border: '2px solid',
                          borderColor: registerForm.watch('accountUsage') === 'buyer' ? '#013E18' : '#ECE7DA',
                          bgcolor: registerForm.watch('accountUsage') === 'buyer' ? 'rgba(1, 62, 24, 0.04)' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#013E18', fontSize: '0.82rem' }}>
                          Buy or Invest
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#536458', fontSize: '0.7rem' }}>
                          Browse & save plots, villas, farms
                        </Typography>
                      </Box>

                      <Box
                        onClick={() => {
                          registerForm.setValue('accountUsage', 'seller');
                          registerForm.setValue('role', 'seller');
                        }}
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          border: '2px solid',
                          borderColor: registerForm.watch('accountUsage') === 'seller' ? '#013E18' : '#ECE7DA',
                          bgcolor: registerForm.watch('accountUsage') === 'seller' ? 'rgba(1, 62, 24, 0.04)' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#013E18', fontSize: '0.82rem' }}>
                          Sell or List
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#536458', fontSize: '0.7rem' }}>
                          Post properties & receive leads
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Basic Details */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 0.6, display: 'block' }}>
                      Full Name <span style={{ color: '#B3261E' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g. Anand Murugan"
                      autoComplete="name"
                      {...registerForm.register('fullName')}
                      error={Boolean(registerForm.formState.errors.fullName)}
                      helperText={registerForm.formState.errors.fullName?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ fontSize: 18, color: '#8C9A90' }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 0.6, display: 'block' }}>
                        Email Address <span style={{ color: '#B3261E' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="you@domain.com"
                        type="email"
                        autoComplete="email"
                        {...registerForm.register('email')}
                        error={Boolean(registerForm.formState.errors.email)}
                        helperText={registerForm.formState.errors.email?.message}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 0.6, display: 'block' }}>
                        Mobile Number <span style={{ color: '#B3261E' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="98422 71000"
                        autoComplete="tel"
                        {...registerForm.register('mobile')}
                        error={Boolean(registerForm.formState.errors.mobile)}
                        helperText={registerForm.formState.errors.mobile?.message}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#536458' }}>+91</span>
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Box>
                  </Box>

                  {/* Location Group */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 0.6, display: 'block' }}>
                        Primary District
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        defaultValue="Coimbatore"
                        {...registerForm.register('district')}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      >
                        {TN_DISTRICTS.map((d) => (
                          <MenuItem key={d} value={d}>
                            {d}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 0.6, display: 'block' }}>
                        City / Locality
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g. Gandhipuram / OMR"
                        {...registerForm.register('city')}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Box>
                  </Box>

                  {/* Conditional Seller Fields */}
                  {registerForm.watch('accountUsage') === 'seller' && (
                    <Box sx={{ p: 2, bgcolor: '#FAF8F2', borderRadius: '14px', border: '1px solid #ECE7DA' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18', mb: 1.5, fontSize: '0.8rem' }}>
                        Seller Information
                      </Typography>

                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 1.5 }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 0.6, display: 'block' }}>
                            Seller Relationship
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            defaultValue="owner"
                            {...registerForm.register('sellerType')}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
                          >
                            <MenuItem value="owner">Direct Property Owner</MenuItem>
                            <MenuItem value="agent">Licensed Real Estate Agent</MenuItem>
                            <MenuItem value="builder">Builder / Developer</MenuItem>
                          </TextField>
                        </Box>

                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 0.6, display: 'block' }}>
                            Business / Company Name
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Optional for individual owners"
                            {...registerForm.register('companyName')}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#FFFFFF' } }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Security Fields */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 0.6, display: 'block' }}>
                        Password <span style={{ color: '#B3261E' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Min 6 characters"
                        {...registerForm.register('password')}
                        error={Boolean(registerForm.formState.errors.password)}
                        helperText={registerForm.formState.errors.password?.message}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                                  {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 0.6, display: 'block' }}>
                        Confirm Password <span style={{ color: '#B3261E' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Re-type password"
                        {...registerForm.register('confirmPassword')}
                        error={Boolean(registerForm.formState.errors.confirmPassword)}
                        helperText={registerForm.formState.errors.confirmPassword?.message}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                  {showConfirmPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    </Box>
                  </Box>

                  {/* Consents */}
                  <Box sx={{ mt: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={registerForm.watch('termsAccepted')}
                          onChange={(e) => registerForm.setValue('termsAccepted', e.target.checked as any)}
                          sx={{ color: '#013E18', '&.Mui-checked': { color: '#013E18' } }}
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ color: '#536458', fontSize: '0.76rem' }}>
                          I accept the Grounds & Gates Terms of Service and Privacy Policy.
                        </Typography>
                      }
                    />
                    {registerForm.formState.errors.termsAccepted && (
                      <Typography variant="caption" sx={{ color: '#B3261E', display: 'block', ml: 4 }}>
                        {registerForm.formState.errors.termsAccepted.message}
                      </Typography>
                    )}

                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={registerForm.watch('marketingConsent')}
                          onChange={(e) => registerForm.setValue('marketingConsent', e.target.checked)}
                          sx={{ color: '#013E18', '&.Mui-checked': { color: '#013E18' } }}
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ color: '#536458', fontSize: '0.76rem' }}>
                          Send me updates on new verified land releases and price revisions (Optional).
                        </Typography>
                      }
                    />
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={registerForm.formState.isSubmitting || registerMutation.isPending}
                    sx={{
                      bgcolor: '#013E18',
                      color: '#FFFFFF',
                      py: 1.2,
                      borderRadius: '12px',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      '&:hover': { bgcolor: '#012A10' },
                      mt: 1,
                    }}
                  >
                    {registerForm.formState.isSubmitting || registerMutation.isPending ? (
                      <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                    ) : (
                      'Create Grounds & Gates Account'
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#536458', fontSize: '0.82rem' }}>
                      Already have an account?{' '}
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => {
                          setAuthError(null);
                          dispatch(setAuthModalMode('login'));
                        }}
                        sx={{
                          p: 0,
                          minWidth: 'auto',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#013E18',
                          textTransform: 'none',
                          '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                        }}
                      >
                        Sign In
                      </Button>
                    </Typography>
                  </Box>
                </Box>
              </form>
            )}

            {/* ─── 3. FORGOT PASSWORD VIEW ─────────────────────────── */}
            {currentMode === 'forgot-password' && (
              <Box>
                {resetSent ? (
                  <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
                    <CheckCircleIcon sx={{ fontSize: 56, color: '#013E18', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#013E18', mb: 1 }}>
                      Recovery Link Dispatched
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#536458', mb: 3, maxWidth: 380, mx: 'auto', lineHeight: 1.6 }}>
                      If an account exists for the provided email address, password reset instructions have been sent via Firebase. Please check your inbox and spam folder.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setResetSent(false);
                        dispatch(setAuthModalMode('login'));
                      }}
                      sx={{
                        bgcolor: '#013E18',
                        color: '#FFFFFF',
                        borderRadius: '12px',
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 4,
                        py: 1,
                      }}
                    >
                      Return to Sign In
                    </Button>
                  </Box>
                ) : (
                  <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} noValidate>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
                      <Typography variant="body2" sx={{ color: '#536458', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        Enter the email address registered with your account. We will send a secure password reset link.
                      </Typography>

                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 0.8, display: 'block' }}>
                          Registered Email Address <span style={{ color: '#B3261E' }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="you@domain.com"
                          type="email"
                          autoComplete="email"
                          {...forgotForm.register('email')}
                          error={Boolean(forgotForm.formState.errors.email)}
                          helperText={forgotForm.formState.errors.email?.message}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailIcon sx={{ fontSize: 18, color: '#8C9A90' }} />
                                </InputAdornment>
                              ),
                            },
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                      </Box>

                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={forgotForm.formState.isSubmitting}
                        sx={{
                          bgcolor: '#013E18',
                          color: '#FFFFFF',
                          py: 1.2,
                          borderRadius: '12px',
                          fontWeight: 700,
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          '&:hover': { bgcolor: '#012A10' },
                        }}
                      >
                        {forgotForm.formState.isSubmitting ? (
                          <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                        ) : (
                          'Send Recovery Link'
                        )}
                      </Button>

                      <Box sx={{ textAlign: 'center' }}>
                        <Button
                          startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                          onClick={() => {
                            setAuthError(null);
                            dispatch(setAuthModalMode('login'));
                          }}
                          sx={{
                            color: '#536458',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            textTransform: 'none',
                          }}
                        >
                          Back to Sign In
                        </Button>
                      </Box>
                    </Box>
                  </form>
                )}
              </Box>
            )}

            {/* ─── 4. EMAIL VERIFICATION VIEW ───────────────────────── */}
            {currentMode === 'verify-email' && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'rgba(201, 147, 37, 0.12)',
                    color: '#C99325',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <MarkEmailReadIcon sx={{ fontSize: 36 }} />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#013E18', mb: 1 }}>
                  Verify Your Email Address
                </Typography>

                <Typography variant="body2" sx={{ color: '#536458', fontSize: '0.85rem', maxWidth: 420, mx: 'auto', mb: 3, lineHeight: 1.6 }}>
                  A verification link was dispatched to{' '}
                  <strong style={{ color: '#013E18' }}>{activeModalState.emailForVerification || auth.currentUser?.email || 'your email'}</strong>.
                  Please open your inbox, click the confirmation link, and confirm verification below.
                </Typography>

                {verificationNotice && (
                  <Alert severity="info" sx={{ mb: 2.5, borderRadius: '12px', fontSize: '0.82rem', textAlign: 'left' }}>
                    {verificationNotice}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 320, mx: 'auto' }}>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={isCheckingVerification}
                    onClick={handleCheckVerification}
                    sx={{
                      bgcolor: '#013E18',
                      color: '#FFFFFF',
                      py: 1.2,
                      borderRadius: '12px',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      '&:hover': { bgcolor: '#012A10' },
                    }}
                  >
                    {isCheckingVerification ? (
                      <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                    ) : (
                      'I’ve Verified My Email'
                    )}
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    disabled={resendCooldown > 0}
                    onClick={handleResendVerification}
                    sx={{
                      borderColor: '#ECE7DA',
                      color: '#013E18',
                      py: 1,
                      borderRadius: '12px',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.82rem',
                    }}
                  >
                    {resendCooldown > 0 ? `Resend Link (${resendCooldown}s)` : 'Resend Verification Email'}
                  </Button>

                  <Button
                    variant="text"
                    onClick={() => {
                      setAuthError(null);
                      dispatch(setAuthModalMode('login'));
                    }}
                    sx={{
                      color: '#536458',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    Sign in with another email
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          {/* Secondary Footer: Continue Browsing */}
          <Box
            sx={{
              px: { xs: 2.5, sm: 4 },
              py: 1.5,
              bgcolor: '#FAF8F2',
              borderTop: '1px solid #ECE7DA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Button
              variant="text"
              onClick={handleModalClose}
              sx={{
                color: '#536458',
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'none',
                '&:hover': { color: '#013E18', bgcolor: 'transparent', textDecoration: 'underline' },
              }}
            >
              Continue browsing without signing in
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
