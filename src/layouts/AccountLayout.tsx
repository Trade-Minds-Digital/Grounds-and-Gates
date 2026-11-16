import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Container, Box, Typography, Tabs, Tab, Paper, Chip, Avatar, Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import { useCurrentUser, useLogout } from '../query/hooks/useAuthQueries';
import { useAppSelector } from '../store/hooks';

export const AccountLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();
  const lang = useAppSelector((state) => state.ui.language);

  const currentTab = location.pathname.includes('/seller') ? 'seller' : 'buyer';

  return (
    <Box sx={{ minHeight: '85vh', bgcolor: '#FAF8F2', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="xl" sx={{ maxWidth: '1280px !important' }}>
        {/* User Account Header Banner */}
        <Paper
          elevation={1}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: '24px',
            bgcolor: '#013E18',
            color: '#FFFFFF',
            mb: 4,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: '#C99325',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '1.3rem',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            >
              {(user?.fullName || user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  {user?.fullName || user?.name || 'Account Workspace'}
                </Typography>
                <Chip
                  size="small"
                  label={(user?.role || 'buyer').toUpperCase()}
                  sx={{
                    bgcolor: 'rgba(201, 147, 37, 0.25)',
                    color: '#E0AA3E',
                    fontWeight: 800,
                    fontSize: '0.65rem',
                    border: '1px solid rgba(201, 147, 37, 0.4)',
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(245, 242, 233, 0.75)', mt: 0.3 }}>
                {user?.email} · Tamil Nadu Verified Real Estate Portfolio
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', alignSelf: { xs: 'stretch', md: 'auto' }, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/post-property')}
              sx={{
                bgcolor: '#C99325',
                color: '#FFFFFF',
                fontWeight: 800,
                borderRadius: '12px',
                px: 2.5,
                py: 1,
                flex: { xs: 1, md: 'none' },
                '&:hover': { bgcolor: '#b8831b' },
              }}
            >
              List New Property
            </Button>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={() => logoutMutation.mutate()}
              sx={{
                borderColor: 'rgba(255,255,255,0.25)',
                color: '#FFFFFF',
                fontWeight: 700,
                borderRadius: '12px',
                px: 2,
                py: 1,
                '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              Logout
            </Button>
          </Box>
        </Paper>

        {/* Dashboard Navigation Tabs */}
        <Box sx={{ borderBottom: '1px solid #ECE7DA', mb: 4 }}>
          <Tabs
            value={currentTab}
            onChange={(_, val) => {
              navigate(val === 'seller' ? '/seller/dashboard' : '/account/dashboard');
            }}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 800,
                fontSize: '0.9rem',
                textTransform: 'none',
                minHeight: 48,
                color: '#536458',
                '&.Mui-selected': {
                  color: '#013E18',
                },
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#013E18',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab
              value="buyer"
              icon={<DashboardIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={lang === 'ta' ? 'வாங்குபவர் டாஷ்போர்டு' : 'Buyer Dashboard & Saved'}
            />
            <Tab
              value="seller"
              icon={<StorefrontIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={lang === 'ta' ? 'விற்பனையாளர் போர்ட்டல்' : 'Seller & Inbound Leads'}
            />
          </Tabs>
        </Box>

        <Outlet />
      </Container>
    </Box>
  );
};

