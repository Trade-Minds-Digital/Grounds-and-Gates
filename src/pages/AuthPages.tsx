import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  MenuItem,
  Divider,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { UserRole, LanguageCode } from '../types/property';
import { useLogin, useRegister } from '../query/hooks/useAuthQueries';
import { auth, sendPasswordResetEmail, mapFirebaseError } from '../config/firebase';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
} from '../schemas/auth.schema';
import { useAppDispatch } from '../store/hooks';
import { addToast } from '../store/slices/toastSlice';

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
];

interface AuthPagesProps {
  initialMode?: 'login' | 'register' | 'forgot-password';
  lang?: LanguageCode;
  onLoginSuccess?: (role: UserRole, userDetails: { name: string; email: string }) => void;
  onNavigate?: (view: string, params?: any) => void;
  onShowToast?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'login',
  lang = 'en',
  onLoginSuccess,
  onNavigate,
  onShowToast,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/account/dashboard';

  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [accountUsage, setAccountUsage] = useState<'buyer' | 'seller' | 'both'>('buyer');

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Register form
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
  });

  // Forgot password form
  const forgotForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const handleLoginSubmit = async (data: LoginFormData) => {
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

      if (!(res as any)?.firebaseUser?.emailVerified && !user?.emailVerified) {
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}&returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }

      navigate(returnUrl);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setAuthError(null);
    try {
      await registerMutation.mutateAsync({
        ...data,
        accountUsage,
        role: accountUsage === 'buyer' ? 'buyer' : 'seller',
      });

      navigate(`/verify-email?email=${encodeURIComponent(data.email)}&returnUrl=${encodeURIComponent(returnUrl)}`);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleForgotSubmit = async (data: ForgotPasswordFormData) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, data.email.trim());
      setResetSent(true);
      dispatch(
        addToast({
          type: 'info',
          message: 'If that email address is registered, password reset instructions have been dispatched.',
        })
      );
    } catch (err: any) {
      // Security: never reveal if email exists
      setResetSent(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '90vh',
        bgcolor: '#FAF8F2',
        py: { xs: 6, sm: 10 },
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
          maxWidth: mode === 'register' ? 620 : 460,
          borderRadius: '24px',
          p: { xs: 3.5, sm: 5 },
          bgcolor: '#FFFFFF',
          border: '1px solid rgba(1, 62, 24, 0.1)',
          boxShadow: '0 8px 32px rgba(1, 62, 24, 0.08)',
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* Brand Lockup */}
        <Box sx={{ textAlign: 'center', pb: 3, borderBottom: '1px solid #ECE7DA' }}>
          <Box
            sx={{
              display: 'inline-block',
              bgcolor: '#013E18',
              color: '#C99325',
              fontWeight: 900,
              fontSize: '1rem',
              width: 38,
              height: 38,
              lineHeight: '38px',
              borderRadius: '50%',
              mb: 1,
              textAlign: 'center',
              border: '1px solid #C99325',
            }}
          >
            04A
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 800,
              color: '#013E18',
              letterSpacing: '-0.01em',
            }}
          >
            {mode === 'login' && (lang === 'ta' ? 'உள்நுழைக' : 'Sign In to Your Account')}
            {mode === 'register' && (lang === 'ta' ? 'கணக்கு உருவாக்கவும்' : 'Create Grounds & Gates Account')}
            {mode === 'forgot-password' && (lang === 'ta' ? 'கடவுச்சொல்லை மீட்டமைக்கவும்' : 'Reset Your Password')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.5, fontSize: '0.82rem' }}>
            {mode === 'login' &&
              (lang === 'ta'
                ? 'உங்கள் சேமிக்கப்பட்ட சொத்துக்கள், வருகைகள் மற்றும் பட்டியல்களை நிர்வகிக்கவும்.'
                : 'Access shortlisted properties, scheduled visits, and verified listings.')}
            {mode === 'register' &&
              (lang === 'ta'
                ? 'தமிழ்நாட்டின் முதன்மை பிரீமியம் ரியல் எஸ்டேட் தளத்தில் இணையுங்கள்.'
                : 'Join buyers, owners, and developers across Tamil Nadu.')}
            {mode === 'forgot-password' &&
              (lang === 'ta'
                ? 'கடவுச்சொல் மீட்பு இணைப்பைப் பெற உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சலை உள்ளிடவும்.'
                : 'Enter your email to receive secure Firebase password recovery instructions.')}
          </Typography>
        </Box>

        {authError && (
          <Alert severity="error" sx={{ mt: 3, mb: 2, borderRadius: '12px' }}>
            {authError}
          </Alert>
        )}

        {/* ─── FORGOT PASSWORD CONFIRMATION ──────────────── */}
        {resetSent ? (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#FAF8F2', borderRadius: '16px', mt: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: '#013E18', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#013E18', mb: 1 }}>
              {lang === 'ta' ? 'மீட்பு இணைப்பு அனுப்பப்பட்டது' : 'Recovery Email Dispatched'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#536458', fontSize: '0.85rem', mb: 3 }}>
              {lang === 'ta'
                ? 'உங்கள் மின்னஞ்சல் முகவரிக்கு கடவுச்சொல் மீட்டமைப்பு இணைப்பு அனுப்பப்பட்டுள்ளது. தயவுசெய்து உங்கள் இன்பாக்ஸை சரிபார்க்கவும்.'
                : 'If an account exists with that email address, a secure password reset link has been dispatched to your inbox.'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setResetSent(false);
                setMode('login');
              }}
              sx={{
                bgcolor: '#013E18',
                color: '#FAF8F2',
                fontWeight: 700,
                borderRadius: '12px',
                px: 3,
                '&:hover': { bgcolor: '#025824' },
              }}
            >
              {lang === 'ta' ? 'உள்நுழைவுக்கு திரும்புக' : 'Return to Login'}
            </Button>
          </Box>
        ) : mode === 'forgot-password' ? (
          /* ─── FORGOT PASSWORD FORM ──────────────────────── */
          <Box component="form" onSubmit={forgotForm.handleSubmit(handleForgotSubmit)} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label={lang === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
              {...forgotForm.register('email')}
              error={Boolean(forgotForm.formState.errors.email)}
              helperText={forgotForm.formState.errors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#013E18', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#013E18',
                color: '#FAF8F2',
                fontWeight: 700,
                py: 1.4,
                borderRadius: '12px',
                border: '1px solid #C99325',
                '&:hover': { bgcolor: '#025824' },
              }}
            >
              {lang === 'ta' ? 'மீட்பு இணைப்பை அனுப்புக' : 'Send Recovery Link'}
            </Button>

            <Button
              variant="text"
              onClick={() => setMode('login')}
              sx={{ color: '#013E18', fontWeight: 700, fontSize: '0.85rem' }}
            >
              {lang === 'ta' ? 'உள்நுழைவுக்கு திரும்புக' : 'Back to Login'}
            </Button>
          </Box>
        ) : mode === 'login' ? (
          /* ─── LOGIN FORM ────────────────────────────────── */
          <Box component="form" onSubmit={loginForm.handleSubmit(handleLoginSubmit)} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label={lang === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
              {...loginForm.register('email')}
              error={Boolean(loginForm.formState.errors.email)}
              helperText={loginForm.formState.errors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#013E18', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              label={lang === 'ta' ? 'கடவுச்சொல்' : 'Password'}
              type={showPassword ? 'text' : 'password'}
              {...loginForm.register('password')}
              error={Boolean(loginForm.formState.errors.password)}
              helperText={loginForm.formState.errors.password?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#013E18', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="text"
                size="small"
                onClick={() => setMode('forgot-password')}
                sx={{ color: '#8B6413', fontWeight: 700, fontSize: '0.78rem' }}
              >
                {lang === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot Password?'}
              </Button>
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loginMutation.isPending}
              startIcon={loginMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
              sx={{
                bgcolor: '#013E18',
                color: '#FAF8F2',
                fontWeight: 700,
                py: 1.4,
                borderRadius: '12px',
                border: '1px solid #C99325',
                '&:hover': { bgcolor: '#025824' },
              }}
            >
              {loginMutation.isPending
                ? lang === 'ta'
                  ? 'உள்நுழைகிறது...'
                  : 'Signing In...'
                : lang === 'ta'
                ? 'உள்நுழைக'
                : 'Sign In'}
            </Button>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#536458', display: 'inline', mr: 1 }}>
                {lang === 'ta' ? 'கணக்கு இல்லையா?' : "Don't have an account?"}
              </Typography>
              <Button
                variant="text"
                onClick={() => setMode('register')}
                sx={{ color: '#013E18', fontWeight: 800, p: 0, minWidth: 'auto' }}
              >
                {lang === 'ta' ? 'இப்போதே பதிவு செய்க' : 'Register Now'}
              </Button>
            </Box>
          </Box>
        ) : (
          /* ─── REGISTRATION FORM ─────────────────────────── */
          <Box component="form" onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Account Usage Selector Pills */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#013E18', mb: 1, display: 'block' }}>
                {lang === 'ta' ? 'நான் Grounds & Gates தளத்தை பயன்படுத்துவது:' : 'I AM USING GROUNDS & GATES TO:'}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                <Button
                  variant={accountUsage === 'buyer' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setAccountUsage('buyer');
                    registerForm.setValue('accountUsage', 'buyer');
                  }}
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    bgcolor: accountUsage === 'buyer' ? '#013E18' : 'transparent',
                    borderColor: '#013E18',
                    color: accountUsage === 'buyer' ? '#FAF8F2' : '#013E18',
                  }}
                >
                  Buy
                </Button>
                <Button
                  variant={accountUsage === 'seller' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setAccountUsage('seller');
                    registerForm.setValue('accountUsage', 'seller');
                  }}
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    bgcolor: accountUsage === 'seller' ? '#013E18' : 'transparent',
                    borderColor: '#013E18',
                    color: accountUsage === 'seller' ? '#FAF8F2' : '#013E18',
                  }}
                >
                  Sell
                </Button>
                <Button
                  variant={accountUsage === 'both' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setAccountUsage('both');
                    registerForm.setValue('accountUsage', 'both');
                  }}
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    bgcolor: accountUsage === 'both' ? '#013E18' : 'transparent',
                    borderColor: '#013E18',
                    color: accountUsage === 'both' ? '#FAF8F2' : '#013E18',
                  }}
                >
                  Both
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label={lang === 'ta' ? 'முழுப்பெயர்' : 'Full Name'}
                {...registerForm.register('fullName')}
                error={Boolean(registerForm.formState.errors.fullName)}
                helperText={registerForm.formState.errors.fullName?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#013E18', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label={lang === 'ta' ? 'மொபைல் எண் (+91...)' : 'Mobile Phone (+91...)'}
                {...registerForm.register('mobile')}
                error={Boolean(registerForm.formState.errors.mobile)}
                helperText={registerForm.formState.errors.mobile?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: '#013E18', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <TextField
              fullWidth
              label={lang === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
              {...registerForm.register('email')}
              error={Boolean(registerForm.formState.errors.email)}
              helperText={registerForm.formState.errors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#013E18', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                select
                label={lang === 'ta' ? 'மாவட்டம்' : 'Preferred District'}
                defaultValue="Coimbatore"
                {...registerForm.register('district')}
              >
                {TN_DISTRICTS.map((dist) => (
                  <MenuItem key={dist} value={dist}>
                    {dist}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label={lang === 'ta' ? 'நகரம் / பகுதி' : 'City / Locality'}
                {...registerForm.register('city')}
              />
            </Box>

            {/* Conditional Seller Details */}
            {(accountUsage === 'seller' || accountUsage === 'both') && (
              <Box sx={{ p: 2, bgcolor: '#FAF8F2', borderRadius: '12px', border: '1px solid #ECE7DA' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#013E18', mb: 1.5, display: 'block' }}>
                  {lang === 'ta' ? 'விற்பனையாளர் விவரங்கள்:' : 'SELLER & BUSINESS PROFILE:'}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    select
                    size="small"
                    label="Seller Capacity"
                    defaultValue="owner"
                    {...registerForm.register('sellerType')}
                  >
                    <MenuItem value="owner">Owner / Landowner</MenuItem>
                    <MenuItem value="agent">Broker / Agent</MenuItem>
                    <MenuItem value="builder">Builder</MenuItem>
                    <MenuItem value="developer">Developer</MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    size="small"
                    label="Company / Firm Name (Optional)"
                    {...registerForm.register('companyName')}
                  />
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label={lang === 'ta' ? 'கடவுச்சொல்' : 'Password'}
                type={showPassword ? 'text' : 'password'}
                {...registerForm.register('password')}
                error={Boolean(registerForm.formState.errors.password)}
                helperText={registerForm.formState.errors.password?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label={lang === 'ta' ? 'கடவுச்சொல்லை உறுதிப்படுத்துக' : 'Confirm Password'}
                type={showConfirmPassword ? 'text' : 'password'}
                {...registerForm.register('confirmPassword')}
                error={Boolean(registerForm.formState.errors.confirmPassword)}
                helperText={registerForm.formState.errors.confirmPassword?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            {/* Consents */}
            <Box>
              <FormControlLabel
                control={<Checkbox {...registerForm.register('termsAccepted')} defaultChecked />}
                label={
                  <Typography variant="caption" sx={{ color: '#536458', lineHeight: 1.4 }}>
                    {lang === 'ta'
                      ? 'நான் Grounds & Gates விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை ஏற்கிறேன்.'
                      : 'I accept the Grounds & Gates Terms of Service and Privacy Policy.'}
                  </Typography>
                }
              />
              {registerForm.formState.errors.termsAccepted && (
                <Typography variant="caption" sx={{ color: '#D32F2F', display: 'block', ml: 4 }}>
                  {registerForm.formState.errors.termsAccepted.message}
                </Typography>
              )}

              <FormControlLabel
                control={<Checkbox {...registerForm.register('marketingConsent')} />}
                label={
                  <Typography variant="caption" sx={{ color: '#536458', lineHeight: 1.4 }}>
                    {lang === 'ta'
                      ? 'புதிய சொத்துக்கள் மற்றும் சிறப்பு அறிவிப்புகளை மின்னஞ்சல் மூலம் பெற ஒப்புக்கொள்கிறேன்.'
                      : 'Send me occasional updates about new premium listings across Tamil Nadu.'}
                  </Typography>
                }
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={registerMutation.isPending}
              startIcon={registerMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
              sx={{
                bgcolor: '#013E18',
                color: '#FAF8F2',
                fontWeight: 700,
                py: 1.4,
                borderRadius: '12px',
                border: '1px solid #C99325',
                '&:hover': { bgcolor: '#025824' },
              }}
            >
              {registerMutation.isPending
                ? lang === 'ta'
                  ? 'பதிவு செய்கிறது...'
                  : 'Creating Account...'
                : lang === 'ta'
                ? 'கணக்கை உருவாக்கு'
                : 'Create Account & Verify'}
            </Button>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#536458', display: 'inline', mr: 1 }}>
                {lang === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?'}
              </Typography>
              <Button
                variant="text"
                onClick={() => setMode('login')}
                sx={{ color: '#013E18', fontWeight: 800, p: 0, minWidth: 'auto' }}
              >
                {lang === 'ta' ? 'உள்நுழைக' : 'Sign In'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
