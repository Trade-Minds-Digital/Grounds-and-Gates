import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import { useAppSelector } from '../../store/hooks';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const lang = useAppSelector((state) => state.ui.language);

  return (
    <Box
      sx={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#FAF8F2',
        py: 8,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={2}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: '28px',
            textAlign: 'center',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(1, 62, 24, 0.08)',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '24px',
              bgcolor: 'rgba(201, 147, 37, 0.12)',
              color: '#C99325',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <TravelExploreIcon sx={{ fontSize: 44 }} />
          </Box>

          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.15em',
              color: '#C99325',
              display: 'block',
              mb: 0.5,
            }}
          >
            404 · Page Not Found
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: 900, color: '#18241B', mb: 1.5, letterSpacing: '-0.02em' }}>
            {lang === 'ta' ? 'பக்கம் கிடைக்கவில்லை' : 'Destination Not Found'}
          </Typography>

          <Typography variant="body2" sx={{ color: '#536458', mb: 4, lineHeight: 1.6, maxWidth: 420, mx: 'auto' }}>
            {lang === 'ta'
              ? 'நீங்கள் தேடும் முகவரி மாற்றப்பட்டிருக்கலாம் அல்லது கிடைக்காமல் இருக்கலாம்.'
              : 'The property record, URL, or administration route you requested could not be located in our verified directory.'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={() => navigate('/properties')}
              sx={{
                borderRadius: '12px',
                borderColor: '#013E18',
                color: '#013E18',
                fontWeight: 700,
                px: 3,
                py: 1.2,
              }}
            >
              Browse Properties
            </Button>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{
                borderRadius: '12px',
                bgcolor: '#013E18',
                color: '#FFFFFF',
                fontWeight: 800,
                px: 3,
                py: 1.2,
                '&:hover': { bgcolor: '#00280f' },
              }}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

