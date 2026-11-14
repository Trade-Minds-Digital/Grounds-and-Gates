import React from 'react';
import { LanguageCode } from '../types/property';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardMedia,
  CardContent,
  Chip,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ExploreIcon from '@mui/icons-material/Explore';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BalanceIcon from '@mui/icons-material/Balance';

interface AboutPageProps {
  lang: LanguageCode;
  onNavigate: (view: string, params?: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ lang: _lang, onNavigate }) => {
  const leadership = [
    {
      name: 'K. Sundararajan',
      role: 'Founder & Managing Director',
      bio: '25+ years of infrastructure and land acquisition leadership across Coimbatore, Tiruppur, and Western Tamil Nadu.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Priya R. Mohan',
      role: 'Chief Product & Operations Officer',
      bio: 'Former PropTech director dedicated to digital transparency, buyer discovery workflows, and land GIS indexing.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Adv. M. Natarajan',
      role: 'Head of Legal & Title Verification',
      bio: 'Senior property counsel specializing in DTCP, CMDA, patta transfers, and multi-generational land title audits.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Ar. S. Vignesh',
      role: 'Principal Architect & Town Planner',
      bio: 'Master planner focused on gated enclave infrastructure, vaastu orientation, and sustainable green corridors.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const pillars = [
    {
      title: 'Verified Land Titles & Approvals',
      desc: 'Every listing undergoes rigorous parent document validation, DTCP/CMDA order checks, and patta verification before publishing.',
      icon: VerifiedUserIcon
    },
    {
      title: 'True Ground Dimensions',
      desc: 'Transparent reporting of exact cent measurements, square-foot equivalents, approach road widths, and frontage distances.',
      icon: ExploreIcon
    },
    {
      title: 'Direct Corporate & Verified Sellers',
      desc: 'Clear separation between Grounds & Gates company-developed inventory and certified third-party owners, builders, and brokers.',
      icon: BusinessIcon
    },
    {
      title: 'Zero Hidden Costs or Surprises',
      desc: 'Honest price disclosures, breakdown of registration expenses, and direct communication without unnecessary intermediaries.',
      icon: BalanceIcon
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F2E9', pb: 12 }}>
      {/* 1. Hero Banner */}
      <Box sx={{ bgcolor: '#013E18', color: '#F5F2E9', py: { xs: 8, sm: 12 }, textAlign: 'center' }}>
        <Container maxWidth="xl" disableGutters sx={{ maxWidth: '1280px !important', px: { xs: 2, sm: 3, md: 4 } }}>
          <Chip
            size="small"
            label="Real Estate Standard for Tamil Nadu"
            sx={{
              bgcolor: 'rgba(201, 147, 37, 0.2)',
              color: '#E0AA3E',
              fontWeight: 800,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              mb: 2.5,
              border: '1px solid rgba(201, 147, 37, 0.3)',
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', mb: 2 }}>
            Grounds and Gates
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(245, 242, 233, 0.85)', maxWidth: 750, mx: 'auto', fontWeight: 500, fontSize: { xs: '1rem', sm: '1.2rem' }, lineHeight: 1.6 }}>
            Establishing architectural distinction, clear land titles, and verified property ownership across Tamil Nadu’s prime residential and agricultural corridors.
          </Typography>
        </Container>
      </Box>

      {/* 2. Four Pillars of Trust */}
      <Container maxWidth="xl" disableGutters sx={{ maxWidth: '1280px !important', px: { xs: 2, sm: 3, md: 4 }, mt: -5 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3,
          }}
        >
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <Paper
                key={index}
                elevation={2}
                sx={{
                  p: 3.5,
                  borderRadius: '24px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid rgba(24, 36, 27, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    bgcolor: 'rgba(1, 62, 24, 0.08)',
                    color: '#013E18',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sx={{ fontSize: 26, color: '#013E18' }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#18241B' }}>
                  {pillar.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#536458', lineHeight: 1.6, fontSize: '0.85rem' }}>
                  {pillar.desc}
                </Typography>
              </Paper>
            );
          })}
        </Box>
      </Container>

      {/* 3. Leadership Team Grid */}
      <Container maxWidth="xl" disableGutters sx={{ maxWidth: '1280px !important', px: { xs: 2, sm: 3, md: 4 }, mt: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            size="small"
            label="Stewards of Excellence"
            sx={{
              bgcolor: 'rgba(201, 147, 37, 0.15)',
              color: '#8B6413',
              fontWeight: 800,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              mb: 1.5,
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#18241B', letterSpacing: '-0.02em' }}>
            Executive Leadership
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.5 }}>
            Experienced advocates, urban planners, and real estate professionals.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3.5,
          }}
        >
          {leadership.map((leader, index) => (
            <Card
              key={index}
              elevation={1}
              sx={{
                borderRadius: '24px',
                overflow: 'hidden',
                bgcolor: '#FFFFFF',
                border: '1px solid rgba(24, 36, 27, 0.08)',
              }}
            >
              <CardMedia
                component="img"
                height="220"
                image={leader.image}
                alt={leader.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#18241B' }}>
                  {leader.name}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#C99325', textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
                  {leader.role}
                </Typography>
                <Typography variant="body2" sx={{ color: '#536458', fontSize: '0.8rem', lineHeight: 1.6 }}>
                  {leader.bio}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* 4. Bottom CTA Strip */}
      <Container maxWidth="xl" disableGutters sx={{ maxWidth: '1280px !important', px: { xs: 2, sm: 3, md: 4 }, mt: 10 }}>
        <Paper
          elevation={2}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: '28px',
            bgcolor: '#013E18',
            color: '#F5F2E9',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            border: '1px solid rgba(201, 147, 37, 0.3)',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Ready to Discover Verified Real Estate?
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(245, 242, 233, 0.8)', maxWidth: 580, fontSize: '0.95rem' }}>
            Explore 32 premier residential plots, luxury villas, agricultural farms, and commercial buildings across Tamil Nadu.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              onClick={() => onNavigate('properties')}
              sx={{ px: 4, py: 1.4, borderRadius: '14px', fontWeight: 800 }}
            >
              Browse Tamil Nadu Properties
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => onNavigate('contact')}
              sx={{
                px: 3.5,
                py: 1.4,
                borderRadius: '14px',
                fontWeight: 700,
                color: '#F5F2E9',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.08)' },
              }}
            >
              Contact Desk
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
