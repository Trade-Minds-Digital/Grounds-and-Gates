import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Container,
} from '@mui/material';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { auth, sendEmailVerification, mapFirebaseError } from '../config/firebase';
import { useCurrentUser, useSyncVerification, useLogout } from '../query/hooks/useAuthQueries';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToast } from '../store/slices/toastSlice';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const lang = useAppSelector((state) => state.ui.language);

  const returnUrl = searchParams.get('returnUrl') || '/account/dashboard';
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const syncVerification = useSyncVerification();
  const logout = useLogout();

  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already verified, navigate to target
  useEffect(() => {
    if (user?.emailVerified) {
      dispatch(addToast({ type: 'success', message: 'Your email is verified. Welcome to Grounds & Gates!' }));
      navigate(returnUrl, { replace: true });
    }
  }, [user?.emailVerified, navigate, returnUrl, dispatch]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const rawEmail = auth.currentUser?.email || user?.email || searchParams.get('email') || '';
  const maskedEmail = React.useMemo(() => {
    if (!rawEmail || !rawEmail.includes('@')) return 'your registered email';
    const [local, domain] = rawEmail.split('@');
    if (local.length <= 2) return `${local[0]}*@${domain}`;
    return `${local[0]}${'*'.repeat(Math.max(3, local.length - 2))}${local[local.length - 1]}@${domain}`;
  }, [rawEmail]);

  const handleCheckVerified = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const res = await syncVerification.mutateAsync();
      if (res.emailVerified) {
        dispatch(addToast({ type: 'success', message: 'Email verified successfully! Welcome.' }));
        navigate(returnUrl, { replace: true });
      } else {
        setStatusMessage(
          lang === 'ta'
            ? 'மின்னஞ்சல் இன்னும் உறுதிப்படுத்தப்படவில்லை. தயவுசெய்து உங்கள் இன்பாக்ஸில் உள்ள இணைப்பைக் கிளிக் செய்து, பின்னர் இங்கே மீண்டும் கிளிக் செய்யவும்.'
            : 'Email has not been verified yet. Please click the link in your inbox, then click here again.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to check verification status.');
    }
  };

  const handleResendLink = async () => {
    if (resendCooldown > 0 || isResending) return;
    setErrorMessage(null);
    setStatusMessage(null);
    setIsResending(true);

    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setResendCooldown(60);
        setStatusMessage(
          lang === 'ta'
            ? 'புதிய உறுதிப்படுத்தல் இணைப்பு உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டது.'
            : 'A new verification link has been dispatched to your email address.'
        );
        dispatch(
          addToast({
            type: 'info',
            message: 'Verification link sent! Please check your inbox and spam folder.',
          })
        );
      } else {
        setErrorMessage('Unable to find active session. Please sign in again.');
      }
    } catch (err: any) {
      setErrorMessage(mapFirebaseError(err));
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await logout.mutateAsync();
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '85vh',
        bgcolor: '#FAF8F2',
        py: { xs: 6, sm: 10 },
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
          {/* Official Monogram Badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'rgba(201, 147, 37, 0.12)',
              color: '#013E18',
              mb: 2.5,
              border: '2px solid #C99325',
            }}
          >
            <MarkEmailReadOutlinedIcon sx={{ fontSize: 38, color: '#013E18' }} />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 800,
              color: '#013E18',
              mb: 1,
              letterSpacing: '-0.01em',
            }}
          >
            {lang === 'ta' ? 'மின்னஞ்சலை உறுதிப்படுத்தவும்' : 'Verify Your Email'}
          </Typography>

          <Typography variant="body1" sx={{ color: '#536458', mb: 3, lineHeight: 1.6 }}>
            {lang === 'ta' ? (
              <>
                நாங்கள் ஒரு பாதுகாப்பு சரிபார்ப்பு இணைப்பை அனுப்பியுள்ளோம்:{' '}
                <strong style={{ color: '#013E18' }}>{maskedEmail}</strong>. உங்கள் கணக்கைச் செயல்படுத்த அந்த இணைப்பைக்
                கிளிக் செய்யவும்.
              </>
            ) : (
              <>
                We have sent an authentication verification link to{' '}
                <strong style={{ color: '#013E18' }}>{maskedEmail}</strong>. Please check your inbox and click the link
                to activate your account.
              </>
            )}
          </Typography>

          {statusMessage && (
            <Alert severity="info" sx={{ mb: 3, textAlign: 'left', borderRadius: '12px' }}>
              {statusMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left', borderRadius: '12px' }}>
              {errorMessage}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {/* Primary Action: Re-check verification */}
            <Button
              variant="contained"
              size="large"
              onClick={handleCheckVerified}
              disabled={syncVerification.isPending || isUserLoading}
              startIcon={
                syncVerification.isPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <CheckCircleIcon />
                )
              }
              sx={{
                bgcolor: '#013E18',
                color: '#FAF8F2',
                fontWeight: 700,
                py: 1.5,
                borderRadius: '12px',
                border: '1px solid #C99325',
                '&:hover': {
                  bgcolor: '#025824',
                },
              }}
            >
              {lang === 'ta' ? 'எனது மின்னஞ்சலை சரிபார்த்துவிட்டேன்' : 'I have verified my email'}
            </Button>

            {/* Secondary Action: Resend Link */}
            <Button
              variant="outlined"
              size="large"
              onClick={handleResendLink}
              disabled={resendCooldown > 0 || isResending}
              startIcon={isResending ? <CircularProgress size={18} /> : <SendIcon />}
              sx={{
                borderColor: '#C99325',
                color: '#8B6413',
                fontWeight: 700,
                py: 1.3,
                borderRadius: '12px',
                '&:hover': {
                  borderColor: '#013E18',
                  bgcolor: 'rgba(201, 147, 37, 0.08)',
                },
              }}
            >
              {resendCooldown > 0
                ? `${lang === 'ta' ? 'மீண்டும் அனுப்ப காத்திருக்கவும்' : 'Resend available in'} (${resendCooldown}s)`
                : lang === 'ta'
                ? 'உறுதிப்படுத்தல் இணைப்பை மீண்டும் அனுப்புக'
                : 'Resend Verification Link'}
            </Button>

            {/* Sign out / switch account */}
            <Button
              variant="text"
              size="small"
              onClick={handleSignOut}
              startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: '#7A887E',
                fontWeight: 600,
                mt: 1,
                fontSize: '0.85rem',
                '&:hover': { color: '#013E18' },
              }}
            >
              {lang === 'ta' ? 'வெளியேறு அல்லது மின்னஞ்சலை மாற்று' : 'Sign out or use a different email'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

