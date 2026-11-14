import React from 'react';
import { translations } from '../../i18n/translations';
import { LanguageCode } from '../../types/property';
import {
  Box,
  Container,
  Typography,
  Chip,
  Link,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface AnnouncementBarProps {
  lang: LanguageCode;
  onExploreClick?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  lang,
  onExploreClick,
}) => {
  const t = translations[lang];

  return (
    <Box
      sx={{
        background: 'linear-gradient(90deg, #013E18 0%, #002B10 50%, #013E18 100%)',
        color: '#F5F2E9',
        borderBottom: '1px solid rgba(201, 147, 37, 0.25)',
        py: 0.8,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="xl" disableGutters sx={{ maxWidth: '1280px !important' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 0.8, sm: 1.5 },
          }}
        >
          {/* Left message & Trust Pill */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Chip
              size="small"
              icon={<VerifiedUserIcon sx={{ fontSize: 13, color: '#C99325 !important' }} />}
              label="100% Verified Titles"
              sx={{
                bgcolor: 'rgba(201, 147, 37, 0.15)',
                color: '#E0AA3E',
                fontWeight: 800,
                fontSize: '0.65rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                height: 22,
                borderRadius: '6px',
                border: '1px solid rgba(201, 147, 37, 0.35)',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(245, 242, 233, 0.92)',
                fontWeight: 500,
                fontSize: { xs: '0.72rem', sm: '0.76rem' },
                letterSpacing: '-0.01em',
              }}
            >
              {t.announcement.message}
            </Typography>
          </Box>

          {/* Right quick actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            {onExploreClick && (
              <Box
                component="button"
                onClick={onExploreClick}
                sx={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: '#C99325',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  p: 0,
                  transition: 'color 0.2s, transform 0.2s',
                  '&:hover': {
                    color: '#E0AA3E',
                    transform: 'translateX(2px)',
                  },
                }}
              >
                <span>{t.announcement.cta}</span>
                <ArrowForwardIcon sx={{ fontSize: 13 }} />
              </Box>
            )}

            <Typography
              variant="caption"
              sx={{ color: 'rgba(201, 147, 37, 0.3)', display: { xs: 'none', sm: 'inline' } }}
            >
              •
            </Typography>

            <Link
              href="tel:+914222987000"
              underline="hover"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                alignItems: 'center',
                gap: 0.8,
                color: 'rgba(245, 242, 233, 0.88)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.01em',
                '&:hover': { color: '#FFFFFF' },
              }}
            >
              <PhoneInTalkIcon sx={{ fontSize: 13, color: '#C99325' }} />
              <span>Desk: +91 422 298 7000</span>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
