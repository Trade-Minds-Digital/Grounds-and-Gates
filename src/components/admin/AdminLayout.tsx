import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Tooltip,
  Badge,
  InputBase,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonOutlineIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageIcon from '@mui/icons-material/Language';
import PublicIcon from '@mui/icons-material/Public';

import { Logo } from '../common/Logo';
import { AdminUser } from '../../types/crm';
import { LanguageCode } from '../../types/property';
import { CrmModule, hasModuleAccess, getRoleDisplayName } from '../../utils/rbac';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

interface AdminLayoutProps {
  currentUser: AdminUser;
  currentModule: CrmModule;
  lang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onNavigateModule: (module: CrmModule) => void;
  onLogout: () => void;
  onNavigatePublic: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  currentModule,
  lang,
  onLanguageChange,
  onNavigateModule,
  onLogout,
  onNavigatePublic,
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems: Array<{ id: CrmModule; labelEn: string; labelTa: string; icon: React.ReactElement }> = [
    { id: 'dashboard', labelEn: 'Dashboard', labelTa: 'முகப்பலகை', icon: <DashboardIcon /> },
    { id: 'leads', labelEn: 'Leads & CRM', labelTa: 'லீட்கள் & CRM', icon: <PeopleIcon /> },
    { id: 'customers', labelEn: 'Customers', labelTa: 'வாடிக்கையாளர்கள்', icon: <PersonOutlineIcon /> },
    { id: 'properties', labelEn: 'Properties', labelTa: 'சொத்துக்கள்', icon: <BusinessIcon /> },
    { id: 'projects', labelEn: 'Projects & Builders', labelTa: 'திட்டங்கள் & கட்டுநர்கள்', icon: <ApartmentIcon /> },
    { id: 'site-visits', labelEn: 'Site Visits', labelTa: 'தள ஆய்வுகள்', icon: <CalendarMonthIcon /> },
    { id: 'bookings', labelEn: 'Bookings & Payments', labelTa: 'முன்பதிவுகள் & பணம்', icon: <MonetizationOnIcon /> },
    { id: 'tasks', labelEn: 'Tasks & Follow-ups', labelTa: 'பணிகள் & தொடர்வுகள்', icon: <AssignmentIcon /> },
    { id: 'team', labelEn: 'Team & Permissions', labelTa: 'குழு & அனுமதிகள்', icon: <ManageAccountsIcon /> },
    { id: 'reports', labelEn: 'Reports & Exports', labelTa: 'அறிக்கைகள் & ஏற்றுமதிகள்', icon: <AssessmentIcon /> },
    { id: 'audit-log', labelEn: 'Audit Log', labelTa: 'தணிக்கை பதிவு (Audit)', icon: <HistoryIcon /> },
    { id: 'settings', labelEn: 'System Settings', labelTa: 'கணினி அமைப்புகள்', icon: <SettingsIcon /> },
    { id: 'masters', labelEn: 'Masters Management', labelTa: 'மாஸ்டர் மேலாண்மை', icon: <AccountTreeIcon /> },
    { id: 'content', labelEn: 'Website Content', labelTa: 'வலைத்தள உள்ளடக்கம்', icon: <LanguageIcon /> },
  ];

  // Filter menu items by user role permissions
  const permittedItems = menuItems.filter((item) => hasModuleAccess(currentUser.role, item.id));

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#00280F',
        color: '#F5F2E9',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(245, 242, 233, 0.1)',
        }}
      >
        {!isCollapsed && <Logo variant="light" size="sm" />}
        {isCollapsed && <Logo variant="mark-only" size="sm" />}

        {!isMobile && (
          <IconButton
            size="small"
            onClick={() => setIsCollapsed(!isCollapsed)}
            sx={{ color: '#C99325', p: 0.5 }}
          >
            <ChevronLeftIcon sx={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </IconButton>
        )}
      </Box>

      {/* Role Pill */}
      {!isCollapsed && (
        <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
          <Chip
            label={getRoleDisplayName(currentUser.role, lang)}
            size="small"
            sx={{
              bgcolor: 'rgba(201, 147, 37, 0.15)',
              color: '#E0AA3E',
              border: '1px solid rgba(201, 147, 37, 0.3)',
              fontWeight: 700,
              fontSize: '0.74rem',
              width: '100%',
              justifyContent: 'flex-start',
            }}
          />
        </Box>
      )}

      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 1.5, flex: 1, overflowY: 'auto' }}>
        {permittedItems.map((item) => {
          const isActive = currentModule === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  onNavigateModule(item.id);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '10px',
                  py: 1,
                  px: 1.5,
                  color: isActive ? '#FFFFFF' : 'rgba(245, 242, 233, 0.75)',
                  bgcolor: isActive ? '#013E18 !important' : 'transparent',
                  borderLeft: isActive ? '3px solid #C99325' : '3px solid transparent',
                  '&:hover': {
                    bgcolor: 'rgba(1, 62, 24, 0.6)',
                    color: '#FFFFFF',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#C99325' : 'inherit',
                    minWidth: isCollapsed ? 'auto' : 36,
                    mr: isCollapsed ? 0 : 1,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: '0.86rem', fontWeight: isActive ? 700 : 500 }}>
                        {lang === 'ta' ? item.labelTa : item.labelEn}
                      </Typography>
                    }
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(245, 242, 233, 0.1)' }} />

      {/* User Footer Profile */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
        }}
        onClick={(e) => setUserMenuAnchor(e.currentTarget)}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: '#C99325',
            color: '#18241B',
            fontWeight: 800,
            fontSize: '0.9rem',
          }}
        >
          {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'A'}
        </Avatar>
        {!isCollapsed && (
          <Box sx={{ overflow: 'hidden', flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser.fullName || 'Admin User'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(245, 242, 233, 0.6)', display: 'block', fontSize: '0.72rem' }}>
              {currentUser.email}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F2E9' }}>
      {/* Sidebar for Desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid rgba(24, 36, 27, 0.1)',
              transition: 'width 0.2s ease-in-out',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top Navbar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            color: '#18241B',
            borderBottom: '1px solid rgba(24, 36, 27, 0.08)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
            {/* Left: Mobile hamburger & breadcrumbs */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isMobile && (
                <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ color: '#013E18' }}>
                  <MenuIcon />
                </IconButton>
              )}
              <Box>
                <Typography variant="caption" sx={{ color: '#536458', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Grounds & Gates CRM / {getRoleDisplayName(currentUser.role, 'en')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#013E18', lineHeight: 1.2 }}>
                  {menuItems.find((m) => m.id === currentModule)?.labelEn || 'Dashboard'}
                </Typography>
              </Box>
            </Box>

            {/* Right: Actions, Language Switch, Profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              {/* Language Switch */}
              <Button
                size="small"
                variant="outlined"
                startIcon={<LanguageIcon sx={{ fontSize: 16 }} />}
                onClick={() => onLanguageChange(lang === 'en' ? 'ta' : 'en')}
                sx={{
                  borderColor: 'rgba(24, 36, 27, 0.2)',
                  color: '#013E18',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  borderRadius: '20px',
                  px: 1.5,
                }}
              >
                {lang === 'en' ? 'தமிழ்' : 'English'}
              </Button>

              {/* View Public Website */}
              <Tooltip title="View Public Marketplace">
                <IconButton onClick={onNavigatePublic} size="small" sx={{ color: '#536458' }}>
                  <PublicIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* Profile Avatar & Menu */}
              <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)} size="small">
                <Avatar sx={{ width: 34, height: 34, bgcolor: '#013E18', fontSize: '0.85rem', fontWeight: 700 }}>
                  {currentUser.fullName ? currentUser.fullName.charAt(0) : 'A'}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* User Popover Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={() => setUserMenuAnchor(null)}
          slotProps={{
            paper: {
              elevation: 3,
              sx: { borderRadius: '14px', minWidth: 220, mt: 1, p: 0.5 },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#18241B' }}>
              {currentUser.fullName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#536458', display: 'block' }}>
              {currentUser.email}
            </Typography>
            <Chip
              label={getRoleDisplayName(currentUser.role, lang)}
              size="small"
              sx={{ mt: 1, bgcolor: '#FAF8F2', color: '#013E18', fontWeight: 700, fontSize: '0.72rem' }}
            />
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => { setUserMenuAnchor(null); onNavigatePublic(); }}>
            <PublicIcon sx={{ mr: 1.5, fontSize: 18, color: '#536458' }} />
            {lang === 'ta' ? 'பொது தளம் காண்க' : 'Open Public Website'}
          </MenuItem>
          {hasModuleAccess(currentUser.role, 'settings') && (
            <MenuItem onClick={() => { setUserMenuAnchor(null); onNavigateModule('settings'); }}>
              <SettingsIcon sx={{ mr: 1.5, fontSize: 18, color: '#536458' }} />
              {lang === 'ta' ? 'கணினி அமைப்புகள்' : 'CRM Settings'}
            </MenuItem>
          )}
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => { setUserMenuAnchor(null); onLogout(); }} sx={{ color: '#BE123C' }}>
            <LogoutIcon sx={{ mr: 1.5, fontSize: 18 }} />
            {lang === 'ta' ? 'வெளியேறு (Logout)' : 'Sign Out'}
          </MenuItem>
        </Menu>

        {/* Dynamic Main Page Content */}
        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
