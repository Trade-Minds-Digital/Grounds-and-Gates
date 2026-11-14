import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { translations } from '../../i18n/translations';
import { LanguageCode, UserRole, PropertyFilterState } from '../../types/property';
import { LOCATIONS_DATA } from '../../data/locations';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Drawer,
  Typography,
  Chip,
  Divider,
  Tooltip,
  Avatar,
  FormControl,
  Select,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BalanceIcon from '@mui/icons-material/Balance';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';

interface NavbarProps {
  currentView: string;
  activeFilter?: Partial<PropertyFilterState>;
  onNavigate: (view: string, params?: any) => void;
  lang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  savedCount: number;
  compareCount: number;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  userRole: UserRole;
  onUserRoleChange: (role: UserRole) => void;
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  activeFilter,
  onNavigate,
  lang,
  onLanguageChange,
  savedCount,
  compareCount,
  selectedLocation,
  onLocationChange,
  userRole,
  onUserRoleChange: _onUserRoleChange,
  onOpenAuth,
  isLoggedIn,
  onLogout,
}) => {
  const t = translations[lang];
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);

  // Streamlined primary desktop links (clean, non-cluttered)
  const desktopLinks = [
    { id: 'buy', label: t.nav.buy, filter: { listingType: 'buy' } },
    { id: 'rent', label: t.nav.rent, filter: { listingType: 'rent' } },
    { id: 'commercial', label: t.nav.commercial, filter: { category: 'commercial-properties' } },
    { id: 'contact', label: lang === 'ta' ? 'தொடர்புக்கு' : 'Contact' },
  ];

  // Full links set for mobile drawer
  const mobileLinks = [
    { id: 'home', label: t.nav.home, icon: <HomeIcon sx={{ fontSize: 18 }} /> },
    { id: 'buy', label: t.nav.buy, filter: { listingType: 'buy' }, icon: <ApartmentIcon sx={{ fontSize: 18 }} /> },
    { id: 'rent', label: t.nav.rent, filter: { listingType: 'rent' }, icon: <ApartmentIcon sx={{ fontSize: 18 }} /> },
    { id: 'commercial', label: t.nav.commercial, filter: { category: 'commercial-properties' }, icon: <BusinessIcon sx={{ fontSize: 18 }} /> },
    { id: 'about', label: lang === 'ta' ? 'எங்களைப் பற்றி' : 'About', icon: <InfoIcon sx={{ fontSize: 18 }} /> },
    { id: 'contact', label: lang === 'ta' ? 'தொடர்புக்கு' : 'Contact', icon: <ContactMailIcon sx={{ fontSize: 18 }} /> },
  ];

  const handleLinkClick = (id: string, filter?: any) => {
    setMobileDrawerOpen(false);
    if (id === 'home') {
      onNavigate('home');
    } else if (id === 'buy' || id === 'rent' || id === 'commercial') {
      onNavigate('properties', filter);
    } else if (id === 'about') {
      onNavigate('about');
    } else if (id === 'contact') {
      onNavigate('contact');
    } else {
      onNavigate(id);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(1, 62, 24, 0.08)',
        boxShadow: '0 2px 12px rgba(1, 62, 24, 0.04)',
        color: '#18241B',
      }}
    >
      <Container maxWidth="xl" disableGutters sx={{ maxWidth: '1240px !important', px: { xs: 2, sm: 3 } }}>
        <Toolbar
          disableGutters
          sx={{
            height: 64,
            minHeight: '64px !important',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Left: Brand Logo (Clicking routes Home) */}
          <Box
            component="button"
            onClick={() => handleLinkClick('home')}
            sx={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              p: 0,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              transition: 'opacity 0.2s',
              '&:hover': { opacity: 0.9 },
            }}
            aria-label="Grounds and Gates Home"
          >
            <Logo variant="horizontal" size="sm" animateEntrance />
          </Box>

          {/* Middle: Streamlined Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {desktopLinks.map(link => {
              const isActive =
                (link.id === 'buy' && currentView === 'properties' && activeFilter?.listingType === 'buy' && activeFilter?.category !== 'commercial-properties') ||
                (link.id === 'rent' && currentView === 'properties' && activeFilter?.listingType === 'rent') ||
                (link.id === 'commercial' && currentView === 'properties' && activeFilter?.category === 'commercial-properties') ||
                (link.id === 'contact' && currentView === 'contact');

              return (
                <Button
                  key={link.id}
                  variant="text"
                  onClick={() => handleLinkClick(link.id, link.filter)}
                  sx={{
                    color: isActive ? '#013E18' : '#334155',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.86rem',
                    letterSpacing: '-0.01em',
                    borderRadius: '8px',
                    px: 1.6,
                    py: 0.6,
                    position: 'relative',
                    transition: 'all 0.15s',
                    '&:hover': {
                      bgcolor: 'rgba(1, 62, 24, 0.05)',
                      color: '#013E18',
                    },
                    '&::after': isActive ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 2,
                      left: 14,
                      right: 14,
                      height: 2.5,
                      borderRadius: 2,
                      bgcolor: '#C99325',
                    } : {},
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Box>

          {/* Right: Compact Language Toggle, Favorites, Profile & Post CTA */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.2 }, flexShrink: 0 }}>
            
            {/* Compact Language Pill */}
            <Box
              sx={{
                display: 'flex',
                bgcolor: '#FAF8F2',
                border: '1px solid #ECE7DA',
                borderRadius: '16px',
                p: '2px',
              }}
            >
              <Button
                size="small"
                onClick={() => onLanguageChange('en')}
                sx={{
                  minWidth: 28,
                  px: 0.8,
                  py: 0.2,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  borderRadius: '14px',
                  bgcolor: lang === 'en' ? '#013E18' : 'transparent',
                  color: lang === 'en' ? '#FFFFFF' : '#5A675D',
                  boxShadow: 'none',
                  height: 24,
                  '&:hover': {
                    bgcolor: lang === 'en' ? '#00280F' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                EN
              </Button>
              <Button
                size="small"
                onClick={() => onLanguageChange('ta')}
                sx={{
                  minWidth: 32,
                  px: 0.8,
                  py: 0.2,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  borderRadius: '14px',
                  bgcolor: lang === 'ta' ? '#013E18' : 'transparent',
                  color: lang === 'ta' ? '#FFFFFF' : '#5A675D',
                  boxShadow: 'none',
                  height: 24,
                  '&:hover': {
                    bgcolor: lang === 'ta' ? '#00280F' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                தமிழ்
              </Button>
            </Box>

            {/* Saved Favorites Icon */}
            <Tooltip title="Saved Properties">
              <IconButton
                onClick={() => onNavigate('favorites')}
                size="small"
                sx={{
                  color: savedCount > 0 ? '#E11D48' : '#334155',
                  p: 0.8,
                  '&:hover': { bgcolor: 'rgba(225, 29, 72, 0.08)' },
                }}
                aria-label="Saved properties"
              >
                <Badge
                  badgeContent={savedCount}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: '#E11D48',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.62rem',
                      height: 16,
                      minWidth: 16,
                    },
                  }}
                >
                  <FavoriteIcon sx={{ fontSize: 20, color: savedCount > 0 ? '#E11D48' : 'inherit' }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Compact Profile Avatar Button */}
            <Tooltip title={userRole === 'owner' ? 'Seller CRM & Portals' : 'Buyer Hub & Portals'}>
              <IconButton
                onClick={(e) => setUserAnchorEl(e.currentTarget)}
                size="small"
                sx={{ p: 0.4 }}
                aria-label="User account menu"
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: userRole === 'owner' ? '#C99325' : '#013E18',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    border: '2px solid #FFFFFF',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {userRole === 'owner' ? 'S' : 'B'}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={userAnchorEl}
              open={Boolean(userAnchorEl)}
              onClose={() => setUserAnchorEl(null)}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: '16px',
                    width: 250,
                    p: 1,
                    boxShadow: '0 16px 40px rgba(1, 62, 24, 0.15)',
                    border: '1px solid #ECE7DA',
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.62rem' }}>
                  {isLoggedIn ? 'Active Account' : 'Guest Explorer'}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#18241B' }}>
                  {isLoggedIn ? (userRole === 'owner' ? 'Seller / Agency Portal' : 'Buyer / Investor Hub') : 'Welcome to Grounds & Gates'}
                </Typography>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              <MenuItem
                onClick={() => {
                  onNavigate('buyer-dashboard');
                  setUserAnchorEl(null);
                }}
                sx={{ borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, py: 0.8 }}
              >
                <PersonIcon sx={{ fontSize: 18, color: '#C99325', mr: 1.2 }} />
                <span>{t.nav.buyerDashboard}</span>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  onNavigate('seller-dashboard');
                  setUserAnchorEl(null);
                }}
                sx={{ borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, py: 0.8 }}
              >
                <BusinessIcon sx={{ fontSize: 18, color: '#013E18', mr: 1.2 }} />
                <span>{t.nav.sellerDashboard}</span>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  onNavigate('compare');
                  setUserAnchorEl(null);
                }}
                sx={{ borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, py: 0.8 }}
              >
                <BalanceIcon sx={{ fontSize: 18, color: '#C99325', mr: 1.2 }} />
                <span>Compare Listings ({compareCount})</span>
              </MenuItem>

              <Divider sx={{ my: 0.5 }} />

              {isLoggedIn ? (
                <MenuItem
                  onClick={() => {
                    setUserAnchorEl(null);
                    onLogout();
                  }}
                  sx={{ borderRadius: '10px', fontSize: '0.82rem', color: '#B3261E', fontWeight: 600, py: 0.8 }}
                >
                  <LogoutIcon sx={{ fontSize: 18, color: '#B3261E', mr: 1.2 }} />
                  <span>Sign Out</span>
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => {
                    setUserAnchorEl(null);
                    onOpenAuth('login');
                  }}
                  sx={{ borderRadius: '10px', fontSize: '0.82rem', color: '#013E18', fontWeight: 700, py: 0.8 }}
                >
                  <VpnKeyIcon sx={{ fontSize: 18, color: '#013E18', mr: 1.2 }} />
                  <span>Sign In / Register</span>
                </MenuItem>
              )}
            </Menu>

            {/* Compact "Post Property" CTA */}
            <Button
              variant="contained"
              size="small"
              onClick={() => onNavigate('post-property')}
              startIcon={<AddIcon sx={{ fontSize: 16, color: '#C99325' }} />}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                bgcolor: '#013E18',
                color: '#FFFFFF',
                borderRadius: '18px',
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.01em',
                py: 0.6,
                px: 1.8,
                height: 36,
                boxShadow: '0 2px 8px rgba(1, 62, 24, 0.2)',
                transition: 'all 0.15s',
                '&:hover': {
                  bgcolor: '#00280F',
                  boxShadow: '0 4px 12px rgba(1, 62, 24, 0.3)',
                },
              }}
            >
              {t.nav.postProperty}
            </Button>

            {/* Mobile Menu Hamburger */}
            <IconButton
              onClick={() => setMobileDrawerOpen(true)}
              sx={{
                display: { md: 'none' },
                color: '#18241B',
                p: 0.8,
              }}
              aria-label="Open navigation menu"
            >
              <MenuIcon sx={{ fontSize: 22 }} />
            </IconButton>

          </Box>
        </Toolbar>
      </Container>

      {/* Sleek Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              p: 2.5,
              bgcolor: '#FFFFFF',
              boxShadow: '-8px 0 32px rgba(1, 62, 24, 0.16)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            },
          },
        }}
      >
        <Box>
          {/* Drawer Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '1px solid #ECE7DA' }}>
            <Logo variant="horizontal" size="sm" />
            <IconButton
              onClick={() => setMobileDrawerOpen(false)}
              size="small"
              sx={{ border: '1px solid #ECE7DA', borderRadius: '8px' }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Active Session Status */}
          <Box sx={{ my: 2, p: 1.2, bgcolor: '#FAF8F2', borderRadius: '12px', border: '1px solid #ECE7DA' }}>
            <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.62rem', display: 'block', mb: 0.5 }}>
              {isLoggedIn ? 'Signed In Session' : 'Account Status'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.8rem' }}>
                {isLoggedIn ? (userRole === 'owner' ? 'Seller Account' : 'Buyer Account') : 'Guest Explorer'}
              </Typography>
              {isLoggedIn ? (
                <Button
                  size="small"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onLogout();
                  }}
                  sx={{ fontSize: '0.7rem', color: '#B3261E', fontWeight: 700, p: 0, minWidth: 'auto' }}
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  size="small"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenAuth('login');
                  }}
                  sx={{ fontSize: '0.7rem', color: '#013E18', fontWeight: 700, p: 0, minWidth: 'auto' }}
                >
                  Sign In
                </Button>
              )}
            </Box>
          </Box>

          {/* Corridor Hub Filter */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.62rem', display: 'block', mb: 0.6 }}>
              {lang === 'ta' ? 'இருப்பிடம்' : 'Tamil Nadu Corridor'}
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedLocation}
                onChange={(e) => {
                  onLocationChange(e.target.value);
                  setMobileDrawerOpen(false);
                  if (e.target.value !== 'All') {
                    onNavigate('properties', { district: e.target.value });
                  }
                }}
                sx={{
                  borderRadius: '10px',
                  bgcolor: '#FAF8F2',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#18241B',
                  height: 38,
                  '& fieldset': { borderColor: '#ECE7DA' },
                }}
              >
                <MenuItem value="All" sx={{ fontSize: '0.78rem', fontWeight: 700 }}>
                  {lang === 'ta' ? 'அனைத்து தமிழ்நாடு (32)' : 'All Tamil Nadu (32)'}
                </MenuItem>
                {LOCATIONS_DATA.map(loc => (
                  <MenuItem key={loc.id} value={loc.name} sx={{ fontSize: '0.78rem' }}>
                    {loc.name} ({loc.tamilName})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Nav Links */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
            {mobileLinks.map(link => {
              const isActive =
                (link.id === 'home' && currentView === 'home') ||
                (link.id === 'buy' && currentView === 'properties' && activeFilter?.listingType === 'buy' && activeFilter?.category !== 'commercial-properties') ||
                (link.id === 'rent' && currentView === 'properties' && activeFilter?.listingType === 'rent') ||
                (link.id === 'commercial' && currentView === 'properties' && activeFilter?.category === 'commercial-properties') ||
                (link.id === 'about' && currentView === 'about') ||
                (link.id === 'contact' && currentView === 'contact');

              return (
                <Button
                  key={link.id}
                  fullWidth
                  startIcon={React.cloneElement(link.icon, {
                    sx: { fontSize: 18, color: isActive ? '#C99325' : '#8C9A90' }
                  })}
                  onClick={() => handleLinkClick(link.id, link.filter)}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1,
                    px: 1.5,
                    borderRadius: '10px',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.84rem',
                    color: isActive ? '#013E18' : '#334155',
                    bgcolor: isActive ? 'rgba(1, 62, 24, 0.08)' : 'transparent',
                    '&:hover': { bgcolor: '#FAF8F2', color: '#013E18' },
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Action Hub */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 16, color: '#C99325' }} />}
              onClick={() => {
                setMobileDrawerOpen(false);
                onNavigate('post-property');
              }}
              sx={{
                py: 1,
                borderRadius: '10px',
                bgcolor: '#013E18',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.8rem',
                boxShadow: '0 2px 8px rgba(1, 62, 24, 0.2)',
                '&:hover': { bgcolor: '#00280F' },
              }}
            >
              {t.nav.postProperty} (Free)
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<PersonIcon sx={{ fontSize: 16, color: '#C99325' }} />}
              onClick={() => {
                setMobileDrawerOpen(false);
                onNavigate('buyer-dashboard');
              }}
              sx={{
                py: 0.8,
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.78rem',
                color: '#18241B',
                borderColor: '#ECE7DA',
                bgcolor: '#FAF8F2',
                '&:hover': { borderColor: '#013E18', bgcolor: '#FFFFFF' },
              }}
            >
              {t.nav.buyerDashboard}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<BusinessIcon sx={{ fontSize: 16, color: '#013E18' }} />}
              onClick={() => {
                setMobileDrawerOpen(false);
                onNavigate('seller-dashboard');
              }}
              sx={{
                py: 0.8,
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.78rem',
                color: '#18241B',
                borderColor: '#ECE7DA',
                bgcolor: '#FAF8F2',
                '&:hover': { borderColor: '#013E18', bgcolor: '#FFFFFF' },
              }}
            >
              {t.nav.sellerDashboard}
            </Button>
          </Box>
        </Box>

        {/* Bottom Concierge */}
        <Box sx={{ mt: 2, p: 1.5, borderRadius: '12px', bgcolor: '#FAF8F2', border: '1px solid #ECE7DA' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
            <PhoneInTalkIcon sx={{ fontSize: 14, color: '#C99325' }} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#013E18', fontSize: '0.7rem' }}>
              Grounds & Gates Concierge
            </Typography>
          </Box>
          <Button
            component="a"
            href="tel:+914222987000"
            fullWidth
            size="small"
            variant="outlined"
            sx={{
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: 800,
              borderColor: '#013E18',
              color: '#013E18',
              py: 0.4,
              textTransform: 'none',
              mt: 0.5,
            }}
          >
            +91 422 298 7000
          </Button>
        </Box>
      </Drawer>
    </AppBar>
  );
};
