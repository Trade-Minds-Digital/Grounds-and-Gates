import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockResetIcon from '@mui/icons-material/LockReset';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  auth,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  mapFirebaseError,
} from '../config/firebase';
import { api } from '../services/api';
import { resetPasswordSchema, ResetPasswordFormData } from '../schemas/auth.schema';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToast } from '../store/slices/toastSlice';

export const AuthActionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.ui.language);

  const mode = searchParams.get('mode'); // 'verifyEmail' | 'resetPassword' | 'recoverEmail'
  const oobCode = searchParams.get('oobCode');

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!oobCode || !mode) {
      setIsLoading(false);
      setErrorMessage(
        lang === 'ta'
          ? 'செல்லுபடியாகாத அல்லது விடுபட்ட அங்கீகார இணைப்பு.'
          : 'Invalid or missing authentication link parameters.'
      );
      return;
    }

    if (mode === 'verifyEmail') {
      // Complete email verification
      applyActionCode(auth, oobCode)
        .then(async () => {
          try {
            if (auth.currentUser) {
              await auth.currentUser.reload();
              const freshToken = await auth.currentUser.getIdToken(true);
              api.setToken(freshToken);
              await api.syncVerification();
            }
          } catch {}
          setIsSuccess(true);
          dispatch(
            addToast({
              type: 'success',
              message: 'Email verified successfully! Welcome to Grounds & Gates.',
            })
          );
        })
        .catch((err) => {
          setErrorMessage(mapFirebaseError(err));
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (mode === 'resetPassword') {
      // Validate password reset code
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setAccountEmail(email);
          setIsLoading(false);
        })
        .catch((err) => {
          setErrorMessage(mapFirebaseError(err));
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setErrorMessage(`Unsupported authentication action mode: ${mode}`);
    }
  }, [mode, oobCode, dispatch, lang]);

  const handlePasswordResetSubmit = async (data: ResetPasswordFormData) => {
    if (!oobCode) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await confirmPasswordReset(auth, oobCode, data.password);
      setIsSuccess(true);
      dispatch(
        addToast({
          type: 'success',
          message: 'Password reset successful! Please log in with your new password.',
        })
      );
    } catch (err: any) {
      setErrorMessage(mapFirebaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '85vh',
        bgcolor: '#FAF8F2',
        py: { xs: 8, sm: 12 },
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(1, 62, 24, 0.1)',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(1, 62, 24, 0.08)',
          }}
        >
          {isLoading && (
            <Box sx={{ py: 6 }}>
              <CircularProgress sx={{ color: '#013E18', mb: 2 }} />
              <Typography variant="body1" sx={{ color: '#536458', fontWeight: 600 }}>
                {lang === 'ta'
                  ? 'பாதுகாப்பு சான்றிதழை சரிபார்க்கிறது...'
                  : 'Validating security authentication link...'}
              </Typography>
            </Box>
          )}

          {!isLoading && isSuccess && mode === 'verifyEmail' && (
            <Box>
              <CheckCircleIcon sx={{ fontSize: 64, color: '#013E18', mb: 2 }} />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 800,
                  color: '#013E18',
                  mb: 1.5,
                }}
              >
                {lang === 'ta' ? 'மின்னஞ்சல் உறுதிப்படுத்தப்பட்டது!' : 'Email Verified Successfully!'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#536458', mb: 4, lineHeight: 1.6 }}>
                {lang === 'ta'
                  ? 'உங்கள் கணக்கு வெற்றிகரமாக செயல்படுத்தப்பட்டது. நீங்கள் இப்போது Grounds & Gates போர்ட்டலை முழுமையாகப் பயன்படுத்தலாம்.'
                  : 'Your Grounds & Gates account has been activated. You now have full access to explore, save, and list properties.'}
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: '#013E18',
                  color: '#FAF8F2',
                  fontWeight: 700,
                  py: 1.4,
                  px: 4,
                  borderRadius: '12px',
                  border: '1px solid #C99325',
                  '&:hover': { bgcolor: '#025824' },
                }}
              >
                {lang === 'ta' ? 'உள்நுழைக' : 'Continue to Sign In'}
              </Button>
            </Box>
          )}

          {!isLoading && isSuccess && mode === 'resetPassword' && (
            <Box>
              <CheckCircleIcon sx={{ fontSize: 64, color: '#013E18', mb: 2 }} />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 800,
                  color: '#013E18',
                  mb: 1.5,
                }}
              >
                {lang === 'ta' ? 'கடவுச்சொல் மாற்றப்பட்டது!' : 'Password Reset Complete!'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#536458', mb: 4 }}>
                {lang === 'ta'
                  ? 'உங்கள் புதிய கடவுச்சொல் பாதுகாப்பாக சேமிக்கப்பட்டுள்ளது. புதிய தகவல்களைப் பயன்படுத்தி உள்நுழையவும்.'
                  : 'Your password has been successfully updated. Please log in with your new credentials.'}
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  bgcolor: '#013E18',
                  color: '#FAF8F2',
                  fontWeight: 700,
                  py: 1.4,
                  px: 4,
                  borderRadius: '12px',
                  border: '1px solid #C99325',
                  '&:hover': { bgcolor: '#025824' },
                }}
              >
                {lang === 'ta' ? 'உள்நுழைய செல்லவும்' : 'Sign In Now'}
              </Button>
            </Box>
          )}

          {!isLoading && !isSuccess && mode === 'resetPassword' && !errorMessage && (
            <Box component="form" onSubmit={handleSubmit(handlePasswordResetSubmit)} sx={{ textAlign: 'left' }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <LockResetIcon sx={{ fontSize: 50, color: '#C99325', mb: 1 }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 800,
                    color: '#013E18',
                  }}
                >
                  {lang === 'ta' ? 'புதிய கடவுச்சொல்லை அமைக்கவும்' : 'Create New Password'}
                </Typography>
                {accountEmail && (
                  <Typography variant="body2" sx={{ color: '#536458', mt: 0.5 }}>
                    For account: <strong>{accountEmail}</strong>
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  label={lang === 'ta' ? 'புதிய கடவுச்சொல்' : 'New Password'}
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
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
                  label={lang === 'ta' ? 'புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்' : 'Confirm New Password'}
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword?.message}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
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
                  {lang === 'ta' ? 'கடவுச்சொல்லைப் புதுப்பிக்கவும்' : 'Update Password'}
                </Button>
              </Box>
            </Box>
          )}

          {!isLoading && errorMessage && (
            <Box>
              <ErrorOutlineIcon sx={{ fontSize: 56, color: '#D32F2F', mb: 2 }} />
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 800,
                  color: '#D32F2F',
                  mb: 1.5,
                }}
              >
                {lang === 'ta' ? 'சரிபார்ப்பு தோல்வியடைந்தது' : 'Action Link Error'}
              </Typography>
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left', borderRadius: '12px' }}>
                {errorMessage}
              </Alert>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/forgot-password')}
                  sx={{ borderColor: '#013E18', color: '#013E18', fontWeight: 700, borderRadius: '12px' }}
                >
                  {lang === 'ta' ? 'கடவுச்சொல்லை மீட்டமைக்க' : 'Request New Reset Link'}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{ bgcolor: '#013E18', color: '#FAF8F2', fontWeight: 700, borderRadius: '12px' }}
                >
                  {lang === 'ta' ? 'உள்நுழைக' : 'Go to Login'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};
