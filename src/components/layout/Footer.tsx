import React from 'react';
import { Logo } from '../common/Logo';
import { translations } from '../../i18n/translations';
import { LanguageCode } from '../../types/property';
import { LOCATIONS_DATA } from '../../data/locations';
import { CATEGORIES_DATA } from '../../data/categories';
import {
  Box,
  Container,
  Typography,
  Button,
  Link,
  Chip,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

interface FooterProps {
  lang: LanguageCode;
  onNavigate: (view: string, params?: any) => void;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onNavigate,
  onLanguageChange,
}) => {
  const t = translations[lang];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#18241B',
        color: '#F5F2E9',
        pt: 10,
        pb: 8,
        borderTop: '4px solid #C99325',
      }}
    >
      <Container maxWidth="xl" disableGutters sx={{ maxWidth: '1280px !important', px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Main Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: '4fr 2fr 3fr 3fr' },
            gap: { xs: 5, lg: 6 },
            pb: 6,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Brand Col */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Logo variant="light" size="lg" />

            <Typography variant="body2" sx={{ color: 'rgba(245, 242, 233, 0.8)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 380 }}>
              {t.footer.about}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, color: 'rgba(245, 242, 233, 0.75)', fontSize: '0.8rem' }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <LocationOnIcon sx={{ fontSize: 16, color: '#C99325', flexShrink: 0, mt: 0.3 }} />
                <span>Grounds & Gates Towers, Avinashi Road, Coimbatore, Tamil Nadu 641014</span>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <PhoneIcon sx={{ fontSize: 16, color: '#C99325', flexShrink: 0 }} />
                <Link href="tel:+914222987000" underline="hover" sx={{ color: 'inherit', '&:hover': { color: '#FFFFFF' } }}>
                  +91 422 298 7000 (Direct Desk)
                </Link>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <EmailIcon sx={{ fontSize: 16, color: '#C99325', flexShrink: 0 }} />
                <Link href="mailto:direct@groundsandgates.com" underline="hover" sx={{ color: 'inherit', '&:hover': { color: '#FFFFFF' } }}>
                  direct@groundsandgates.com
                </Link>
              </Box>
            </Box>

            {/* Language Switcher in Footer */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', pt: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(245, 242, 233, 0.6)', fontWeight: 700 }}>
                {t.nav.language}:
              </Typography>
              <Button
                size="small"
                onClick={() => onLanguageChange('en')}
                sx={{
                  bgcolor: lang === 'en' ? '#C99325' : 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  py: 0.4,
                  px: 1.5,
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: lang === 'en' ? '#B5821F' : 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                English
              </Button>
              <Button
                size="small"
                onClick={() => onLanguageChange('ta')}
                sx={{
                  bgcolor: lang === 'ta' ? '#C99325' : 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  py: 0.4,
                  px: 1.5,
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: lang === 'ta' ? '#B5821F' : 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                தமிழ்
              </Button>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#C99325', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2.5, fontSize: '0.8rem' }}>
              {t.footer.quickLinks}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { label: t.nav.home, onClick: () => onNavigate('home') },
                { label: t.nav.buy, onClick: () => onNavigate('properties', { listingType: 'buy' }) },
                { label: t.nav.rent, onClick: () => onNavigate('properties', { listingType: 'rent' }) },
                { label: t.nav.compare, onClick: () => onNavigate('compare') },
                { label: t.nav.saved, onClick: () => onNavigate('favorites') },
                { label: t.nav.buyerDashboard, onClick: () => onNavigate('buyer-dashboard') },
                { label: t.nav.sellerDashboard, onClick: () => onNavigate('seller-dashboard') },
                { label: lang === 'ta' ? 'எங்களைப் பற்றி' : 'About Us', onClick: () => onNavigate('about') },
                { label: lang === 'ta' ? 'தொடர்புக்கு' : 'Contact Us', onClick: () => onNavigate('contact') },
                { label: lang === 'ta' ? 'நிர்வாக போர்டல் (Staff CRM)' : 'Staff Portal (CRM)', onClick: () => onNavigate('admin-login') },
              ].map((item, idx) => (
                <Button
                  key={idx}
                  variant="text"
                  onClick={item.onClick}
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'rgba(245, 242, 233, 0.8)',
                    fontSize: '0.8rem',
                    p: 0,
                    minWidth: 0,
                    fontWeight: 500,
                    '&:hover': { color: '#FFFFFF', background: 'none', textDecoration: 'underline' },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Categories */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#C99325', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2.5, fontSize: '0.8rem' }}>
              {t.footer.categories}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {CATEGORIES_DATA.map(cat => (
                <Button
                  key={cat.id}
                  variant="text"
                  onClick={() => onNavigate('properties', { category: cat.id })}
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'rgba(245, 242, 233, 0.8)',
                    fontSize: '0.8rem',
                    p: 0,
                    minWidth: 0,
                    fontWeight: 500,
                    '&:hover': { color: '#FFFFFF', background: 'none', textDecoration: 'underline' },
                  }}
                >
                  {lang === 'ta' ? cat.tamilName : cat.name}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Regional Hubs */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#C99325', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2.5, fontSize: '0.8rem' }}>
              {t.footer.regionalHubs}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {LOCATIONS_DATA.slice(0, 7).map(loc => (
                <Button
                  key={loc.id}
                  variant="text"
                  onClick={() => onNavigate('properties', { district: loc.name })}
                  sx={{
                    justifyContent: 'space-between',
                    width: '100%',
                    color: 'rgba(245, 242, 233, 0.8)',
                    fontSize: '0.8rem',
                    p: 0,
                    minWidth: 0,
                    fontWeight: 500,
                    '&:hover': { color: '#FFFFFF', background: 'none' },
                  }}
                >
                  <span>{loc.name}</span>
                  <Chip
                    label={loc.listingCount}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: '#E0AA3E',
                    }}
                  />
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Demo Disclaimer & Copyright Notice */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            pt: 4,
            color: 'rgba(245, 242, 233, 0.6)',
            fontSize: '0.75rem',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <VerifiedUserIcon sx={{ fontSize: 16, color: '#C99325', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'rgba(245, 242, 233, 0.65)' }}>
              <strong style={{ color: '#F5F2E9' }}>Presentation Disclaimer: </strong>
              {t.footer.disclaimer}
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'rgba(245, 242, 233, 0.65)', flexShrink: 0 }}>
            {t.footer.copyright}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
