import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import { Logo } from '../../components/common/Logo';
import { LanguageCode } from '../../types/property';

interface AdminAccessDeniedPageProps {
  lang: LanguageCode;
  onNavigate: (view: string, params?: any) => void;
  onLogout?: () => void;
  requiredRole?: string;
}

export const AdminAccessDeniedPage: React.FC<AdminAccessDeniedPageProps> = ({
  lang,
  onNavigate,
  onLogout,
  requiredRole,
}) => {
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
          maxWidth: 500,
          width: '100%',
          p: { xs: 4, sm: 5 },
          borderRadius: '24px',
          textAlign: 'center',
          bgcolor: '#FFFFFF',
          border: '1px solid rgba(190, 18, 60, 0.2)',
          boxShadow: '0 20px 50px rgba(190, 18, 60, 0.08)',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Logo variant="horizontal" size="md" />
        </Box>

        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'rgba(190, 18, 60, 0.1)',
            color: '#BE123C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5,
          }}
        >
          <LockPersonIcon sx={{ fontSize: 36 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B', mb: 1 }}>
          {lang === 'ta' ? 'அணுகல் மறுக்கப்பட்டது (Access Denied)' : 'Access Restricted'}
        </Typography>

        <Typography variant="body2" sx={{ color: '#536458', mb: 4, lineHeight: 1.6 }}>
          {lang === 'ta'
            ? 'இந்த நிர்வாக தொகுதி அல்லது போர்ட்டலை அணுக உங்கள் கணக்கிற்கு போதிய அனுமதிகள் இல்லை.'
            : 'You do not have the required staff permissions to access this administrative module.'}
          {requiredRole && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#BE123C', fontWeight: 700 }}>
              Required Role: {requiredRole}
            </Typography>
          )}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => onNavigate('home')}
            startIcon={<ArrowBackIcon />}
            sx={{
              py: 1.25,
              bgcolor: '#013E18',
              color: '#F5F2E9',
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { bgcolor: '#00280F' },
            }}
          >
            {lang === 'ta' ? 'பொது முகப்புக்குத் திரும்பு' : 'Return to Public Marketplace'}
          </Button>

          {onLogout && (
            <Button
              variant="outlined"
              fullWidth
              onClick={onLogout}
              startIcon={<LogoutIcon />}
              sx={{
                py: 1.25,
                borderColor: '#BE123C',
                color: '#BE123C',
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(190, 18, 60, 0.05)', borderColor: '#9F1239' },
              }}
            >
              {lang === 'ta' ? 'வெளியேறி வேறு கணக்கில் நுழைக' : 'Sign Out / Switch Staff Account'}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

