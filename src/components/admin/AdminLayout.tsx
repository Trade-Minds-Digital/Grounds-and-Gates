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
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageIcon from '@mui/icons-material/Language';
import PublicIcon from '@mui/icons-material/Public';

import { Logo } from '../common/Logo';
import { AdminUser } from '../../types/crm';
import { LanguageCode } from '../../types/property';
import { CrmModule, hasModuleAccess, getRoleDisplayName } from '../../utils/rbac';

const SIDEBAR_WIDTH = 252;
const SIDEBAR_COLLAPSED_WIDTH = 68;

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

  const menuGroups: Array<{
    groupEn: string;
    groupTa: string;
    items: Array<{ id: CrmModule; labelEn: string; labelTa: string; icon: React.ReactElement }>;
  }> = [
    {
      groupEn: 'Operations',
      groupTa: 'செயல்பாடுகள்',
      items: [
        { id: 'dashboard', labelEn: 'Dashboard', labelTa: 'முகப்பலகை', icon: <DashboardIcon /> },
        { id: 'leads', labelEn: 'Leads & CRM', labelTa: 'லீட்கள் & CRM', icon: <PeopleIcon /> },
        { id: 'customers', labelEn: 'Customers', labelTa: 'வாடிக்கையாளர்கள்', icon: <PersonOutlineIcon /> },
      ],
    },
    {
      groupEn: 'Inventory & Deals',
      groupTa: 'சொத்துக்கள் & ஒப்பந்தங்கள்',
      items: [
        { id: 'properties', labelEn: 'Properties', labelTa: 'சொத்துக்கள்', icon: <BusinessIcon /> },
        { id: 'projects', labelEn: 'Projects & Builders', labelTa: 'திட்டங்கள் & கட்டுநர்கள்', icon: <ApartmentIcon /> },
        { id: 'site-visits', labelEn: 'Site Visits', labelTa: 'தள ஆய்வுகள்', icon: <CalendarMonthIcon /> },
        { id: 'bookings', labelEn: 'Bookings & Payments', labelTa: 'முன்பதிவுகள் & கட்டணங்கள்', icon: <MonetizationOnIcon /> },
      ],
    },
    {
      groupEn: 'Management',
      groupTa: 'மேலாண்மை',
      items: [
        { id: 'tasks', labelEn: 'Tasks & Follow-ups', labelTa: 'பணிகள் & தொடர்வுகள்', icon: <AssignmentIcon /> },
        { id: 'team', labelEn: 'Team & Permissions', labelTa: 'குழு & அனுமதிகள்', icon: <ManageAccountsIcon /> },
        { id: 'reports', labelEn: 'Reports & Exports', labelTa: 'அறிக்கைகள் & ஏற்றுமதிகள்', icon: <AssessmentIcon /> },
      ],
    },
    {
      groupEn: 'System',
      groupTa: 'கணினி அமைப்புகள்',
      items: [
        { id: 'masters', labelEn: 'Masters Management', labelTa: 'மாஸ்டர் மேலாண்மை', icon: <AccountTreeIcon /> },
        { id: 'content', labelEn: 'Website Content', labelTa: 'வலைத்தள உள்ளடக்கம்', icon: <LanguageIcon /> },
        { id: 'audit-log', labelEn: 'Audit Log', labelTa: 'தணிக்கை பதிவு (Audit)', icon: <HistoryIcon /> },
        { id: 'settings', labelEn: 'System Settings', labelTa: 'கணினி அமைப்புகள்', icon: <SettingsIcon /> },
      ],
    },
  ];

  const allMenuItems = menuGroups.flatMap((g) => g.items);

  // Filter menu items by user role permissions per group
  const permittedGroups = menuGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => hasModuleAccess(currentUser.role, item.id)),
    }))
    .filter((g) => g.items.length > 0);

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
          px: isCollapsed ? 1.5 : 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(245, 242, 233, 0.1)',
          minHeight: 60,
          flexShrink: 0,
        }}
      >
        {!isCollapsed && <Logo variant="light" size="sm" />}
        {isCollapsed && <Logo variant="mark-only" size="sm" />}

        {!isMobile && (
          <Tooltip title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'} placement="right">
            <IconButton
              size="small"
              onClick={() => setIsCollapsed(!isCollapsed)}
              sx={{
                color: '#E0AA3E',
                p: 0.5,
                bgcolor: 'rgba(201, 147, 37, 0.12)',
                '&:hover': { bgcolor: 'rgba(201, 147, 37, 0.25)' },
              }}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeftIcon
                sx={{
                  transform: isCollapsed ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease-in-out',
                  fontSize: 20,
                }}
              />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Role Pill */}
      {!isCollapsed && (
        <Box sx={{ px: 2, pt: 1.5, pb: 0.75, flexShrink: 0 }}>
          <Chip
            label={getRoleDisplayName(currentUser.role, lang)}
            size="small"
            sx={{
              bgcolor: 'rgba(201, 147, 37, 0.18)',
              color: '#F0BE54',
              border: '1px solid rgba(201, 147, 37, 0.35)',
              fontWeight: 700,
              fontSize: '0.72rem',
              width: '100%',
              justifyContent: 'flex-start',
              height: 24,
            }}
          />
        </Box>
      )}

      {/* Grouped Navigation List with independent scrolling and sleek scrollbar */}
      <List
        sx={{
          px: 1.25,
          py: 1,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.18) transparent',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(255, 255, 255, 0.18)',
            borderRadius: '4px',
          },
        }}
      >
        {permittedGroups.map((group, gIdx) => (
          <Box key={group.groupEn} sx={{ mb: 1.25 }}>
            {!isCollapsed && (
              <Typography
                variant="overline"
                sx={{
                  display: 'block',
                  px: 1.25,
                  pt: gIdx > 0 ? 0.75 : 0.25,
                  pb: 0.25,
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#D4A038',
                  textTransform: 'uppercase',
                }}
              >
                {lang === 'ta' ? group.groupTa : group.groupEn}
              </Typography>
            )}
            {isCollapsed && gIdx > 0 && (
              <Divider sx={{ my: 0.75, borderColor: 'rgba(245, 242, 233, 0.08)' }} />
            )}
            {group.items.map((item) => {
              const isActive = currentModule === item.id;
              const itemLabel = lang === 'ta' ? item.labelTa : item.labelEn;
              const buttonNode = (
                <ListItemButton
                  selected={isActive}
                  onClick={() => {
                    onNavigateModule(item.id);
                    if (isMobile) setMobileOpen(false);
                  }}
                  aria-label={itemLabel}
                  sx={{
                    borderRadius: '8px',
                    py: 0.85,
                    px: isCollapsed ? 1 : 1.25,
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    bgcolor: isActive ? 'rgba(201, 147, 37, 0.16) !important' : 'transparent',
                    borderLeft: isActive ? '3.5px solid #E0AA3E' : '3.5px solid transparent',
                    transition: 'all 0.15s ease-in-out',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(201, 147, 37, 0.22)' : 'rgba(255, 255, 255, 0.08)',
                      '& .menu-icon': {
                        color: isActive ? '#E0AA3E' : '#FFFFFF',
                      },
                      '& .menu-text': {
                        color: '#FFFFFF',
                      },
                    },
                    '&:focus-visible': {
                      outline: '2px solid #E0AA3E',
                      outlineOffset: '2px',
                    },
                  }}
                >
                  <ListItemIcon
                    className="menu-icon"
                    sx={{
                      color: isActive ? '#E0AA3E' : '#9BB6A4',
                      minWidth: isCollapsed ? 'auto' : 32,
                      mr: isCollapsed ? 0 : 1,
                      justifyContent: 'center',
                      '& svg': { fontSize: 20 },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      disableTypography
                      primary={
                        <Typography
                          className="menu-text"
                          sx={{
                            fontSize: '0.84rem',
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? '#FFFFFF' : '#E6EFE9',
                            lineHeight: 1.3,
                            letterSpacing: '0.01em',
                          }}
                        >
                          {itemLabel}
                        </Typography>
                      }
                    />
                  )}
                </ListItemButton>
              );

              return (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.25 }}>
                  {isCollapsed ? (
                    <Tooltip title={itemLabel} placement="right" arrow>
                      {buttonNode}
                    </Tooltip>
                  ) : (
                    buttonNode
                  )}
                </ListItem>
              );
            })}
          </Box>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(245, 242, 233, 0.1)', flexShrink: 0 }} />

      {/* User Footer Profile */}
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          cursor: 'pointer',
          flexShrink: 0,
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.06)' },
        }}
        onClick={(e) => setUserMenuAnchor(e.currentTarget)}
      >
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: '#C99325',
            color: '#18241B',
            fontWeight: 800,
            fontSize: '0.85rem',
            flexShrink: 0,
          }}
        >
          {(currentUser?.fullName || 'A').charAt(0).toUpperCase()}
        </Avatar>
        {!isCollapsed && (
          <Box sx={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                fontSize: '0.82rem',
                lineHeight: 1.2,
              }}
            >
              {currentUser.fullName || 'Admin User'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(245, 242, 233, 0.72)',
                display: 'block',
                fontSize: '0.70rem',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
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
            zIndex: 1100,
          }}
        >
          <Toolbar sx={{ minHeight: '60px !important', height: 60, justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
            {/* Left: Mobile hamburger & breadcrumbs */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isMobile && (
                <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ color: '#013E18' }} aria-label="Open navigation menu">
                  <MenuIcon />
                </IconButton>
              )}
              <Box>
                <Typography variant="caption" sx={{ color: '#536458', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.70rem' }}>
                  Grounds & Gates CRM / {getRoleDisplayName(currentUser.role, 'en')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#013E18', lineHeight: 1.2, fontSize: '1.05rem' }}>
                  {allMenuItems.find((m) => m.id === currentModule)?.labelEn || 'Dashboard'}
                </Typography>
              </Box>
            </Box>

            {/* Right: Actions, Language Switch, Profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
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
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  borderRadius: '16px',
                  px: 1.25,
                  py: 0.35,
                }}
              >
                {lang === 'en' ? 'தமிழ்' : 'English'}
              </Button>

              {/* View Public Website */}
              <Tooltip title="View Public Marketplace">
                <IconButton onClick={onNavigatePublic} size="small" sx={{ color: '#536458' }} aria-label="Open public marketplace">
                  <PublicIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* Profile Avatar & Menu */}
              <Tooltip title="Staff Account Menu">
                <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)} size="small" aria-label="User account menu">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#013E18', fontSize: '0.82rem', fontWeight: 700 }}>
                    {currentUser.fullName ? currentUser.fullName.charAt(0) : 'A'}
                  </Avatar>
                </IconButton>
              </Tooltip>
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
        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 2.5, md: 3 }, overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
