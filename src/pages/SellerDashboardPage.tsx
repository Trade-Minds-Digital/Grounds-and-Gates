import React, { useState } from 'react';
import { Property, LanguageCode, ListingStatus } from '../types/property';
import { translations } from '../i18n/translations';
import { formatPriceINR } from '../utils/propertyUtils';
import { useAppState } from '../context/AppStateContext';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Card,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Rating,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// MUI Icons
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TuneIcon from '@mui/icons-material/Tune';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';

interface SellerDashboardPageProps {
  properties: Property[];
  lang: LanguageCode;
  onNavigate: (view: string, params?: any) => void;
  onSelectProperty: (id: string) => void;
  onUpdatePropertyStatus?: (propertyId: string, newStatus: ListingStatus) => void;
}

export type KanbanStage = 'new' | 'scheduled' | 'negotiation' | 'won' | 'lost';

export interface LeadItem {
  id: string;
  buyerName: string;
  phone: string;
  email: string;
  propertyTitle: string;
  propertyId: string;
  stage: KanbanStage;
  date: string;
  offerAmount?: number;
  message: string;
  priority: 'high' | 'medium' | 'low';
  scheduledVisitDate?: Date | null;
}

const KANBAN_STAGES: { id: KanbanStage; label: string; color: string; bg: string; border: string }[] = [
  { id: 'new', label: 'New Leads', color: '#0369A1', bg: '#F0F9FF', border: '#BAE6FD' },
  { id: 'scheduled', label: 'Visit Scheduled', color: '#854D0E', bg: '#FEFCE8', border: '#FEF08A' },
  { id: 'negotiation', label: 'Under Negotiation', color: '#9A3412', bg: '#FFF7ED', border: '#FED7AA' },
  { id: 'won', label: 'Won / Deal Closed', color: '#166534', bg: '#F0FDF4', border: '#BBF7D0' },
  { id: 'lost', label: 'Lost / Closed', color: '#4B5563', bg: '#F9FAFB', border: '#E5E7EB' },
];

export const SellerDashboardPage: React.FC<SellerDashboardPageProps> = ({
  properties,
  lang,
  onNavigate,
  onSelectProperty,
  onUpdatePropertyStatus,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'leads' | 'analytics'>('overview');

  // Centralized Real-time API State
  const {
    properties: sharedProperties,
    leads: sharedLeads,
    siteVisits,
    bookings,
    activities,
    updateLeadStage,
    addLead,
    updatePropertyStatus: updateSharedPropertyStatus,
    refreshAll,
  } = useAppState();

  // Use sharedProperties from centralized state if available or fall back to props
  const localProperties = sharedProperties.length > 0 ? sharedProperties : properties;

  const totalViews = localProperties.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const totalLeads = localProperties.reduce((sum, p) => sum + (p.enquiriesCount || 0), 0);
  const activeCount = localProperties.filter(p => p.status === 'active').length;

  // CRM Kanban Leads mapped from real-time database state
  const leads: LeadItem[] = sharedLeads.map(l => ({
    id: l.id,
    buyerName: l.buyerName,
    phone: l.phone,
    email: l.email,
    propertyTitle: l.propertyTitle,
    propertyId: l.propertyId,
    stage: l.stage as KanbanStage,
    date: l.date,
    offerAmount: l.offerAmount,
    message: l.message,
    priority: l.priority,
    scheduledVisitDate: l.scheduledVisitDate ? new Date(l.scheduledVisitDate) : null,
  }));

  // Lead Modal state
  const [openNewLeadModal, setOpenNewLeadModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadProperty, setNewLeadProperty] = useState(localProperties[0]?.id || '');
  const [newLeadStage, setNewLeadStage] = useState<KanbanStage>('new');
  const [newLeadOffer, setNewLeadOffer] = useState('');
  const [newLeadVisitDate, setNewLeadVisitDate] = useState<Date | null>(new Date());
  const [newLeadNotes, setNewLeadNotes] = useState('');

  const handleStageChange = (leadId: string, newStage: KanbanStage) => {
    updateLeadStage(leadId, newStage);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadPhone.trim()) return;

    const matchedProp = localProperties.find(p => p.id === newLeadProperty);
    addLead({
      buyerName: newLeadName,
      phone: newLeadPhone,
      email: 'inbound@customer.com',
      propertyTitle: matchedProp ? matchedProp.title : 'General Portfolio Inquiry',
      propertyId: newLeadProperty || 'prop-general',
      stage: newLeadStage,
      priority: 'high',
      offerAmount: newLeadOffer ? Number(newLeadOffer) : undefined,
      message: newLeadNotes || 'Inbound inquiry logged via CRM',
      scheduledVisitDate: newLeadVisitDate ? newLeadVisitDate.toISOString().slice(0, 10) : undefined,
    });

    setOpenNewLeadModal(false);
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadOffer('');
    setNewLeadNotes('');
  };

  const handleStatusChange = (propertyId: string, newStatus: ListingStatus) => {
    updateSharedPropertyStatus(propertyId, newStatus);
    if (onUpdatePropertyStatus) {
      onUpdatePropertyStatus(propertyId, newStatus);
    }
  };

  // MUI X Data Grid Column Definitions
  const dataGridColumns: GridColDef[] = [
    {
      field: 'property',
      headerName: 'Property',
      flex: 1.8,
      minWidth: 260,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Property;
        return (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', height: '100%' }}>
            <Box
              component="img"
              src={row.images[0]}
              alt={row.title}
              sx={{ width: 44, height: 38, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
            />
            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
              <Typography
                variant="subtitle2"
                onClick={() => onSelectProperty(row.id)}
                sx={{
                  fontWeight: 800,
                  color: '#18241B',
                  fontSize: '0.8rem',
                  lineHeight: 1.2,
                  cursor: 'pointer',
                  '&:hover': { color: '#013E18', textDecoration: 'underline' },
                }}
                noWrap
              >
                {row.title}
              </Typography>
              <Typography variant="caption" sx={{ color: '#8C9A90', fontSize: '0.7rem' }} noWrap>
                {row.location}, {row.district}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'price',
      headerName: 'Price (INR)',
      flex: 1,
      minWidth: 140,
      valueGetter: (_value, row) => row.price,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Property;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#013E18', fontSize: '0.8rem' }}>
              {formatPriceINR(row.price, row.listingType, row.priceUnit)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8C9A90', fontSize: '0.65rem' }}>
              {row.plotArea} {row.plotAreaUnit}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 0.9,
      minWidth: 120,
      valueGetter: (_value, row) => row.category,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Property;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={row.category.replace('-', ' ')}
              size="small"
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'capitalize',
                bgcolor: 'rgba(24, 36, 27, 0.06)',
                color: '#18241B',
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1.1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Property;
        const statusMap: Record<ListingStatus, { bg: string; color: string; label: string }> = {
          active: { bg: '#ECFDF5', color: '#065F46', label: 'Active' },
          'under-negotiation': { bg: '#FFFBEB', color: '#92400E', label: 'Negotiation' },
          sold: { bg: '#FFE4E6', color: '#9F1239', label: 'Sold Out' },
          'pending-review': { bg: '#F3F4F6', color: '#374151', label: 'Pending' },
        };
        const s = statusMap[row.status] || statusMap.active;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
            <Select
              size="small"
              value={row.status}
              onChange={(e) => handleStatusChange(row.id, e.target.value as ListingStatus)}
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                height: 28,
                bgcolor: s.bg,
                color: s.color,
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: s.color },
              }}
            >
              <MenuItem value="active" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Active</MenuItem>
              <MenuItem value="under-negotiation" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Under Negotiation</MenuItem>
              <MenuItem value="sold" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Sold Out</MenuItem>
              <MenuItem value="pending-review" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Pending Review</MenuItem>
            </Select>
          </Box>
        );
      },
    },
    {
      field: 'viewsCount',
      headerName: 'Views',
      flex: 0.7,
      minWidth: 90,
      valueGetter: (_value, row) => row.viewsCount || 350,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 0.5 }}>
          <VisibilityIcon sx={{ fontSize: 14, color: '#8C9A90' }} />
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#18241B' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'enquiriesCount',
      headerName: 'Leads',
      flex: 0.7,
      minWidth: 80,
      valueGetter: (_value, row) => row.enquiriesCount || 12,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Chip
            label={params.value}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: 'rgba(201, 147, 37, 0.15)',
              color: '#8B6413',
            }}
          />
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Action',
      flex: 0.8,
      minWidth: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Property;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Tooltip title="View Property Brochure">
              <IconButton
                size="small"
                onClick={() => onSelectProperty(row.id)}
                sx={{
                  color: '#013E18',
                  borderRadius: '8px',
                  border: '1px solid #ECE7DA',
                  p: 0.6,
                  '&:hover': { bgcolor: '#013E18', color: '#FFFFFF' },
                }}
              >
                <OpenInNewIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const navItems = [
    { id: 'overview', label: t.sellerDashboard.overview, icon: TuneIcon },
    { id: 'listings', label: `Inventory (${localProperties.length})`, icon: BusinessIcon },
    { id: 'leads', label: `CRM Kanban (${leads.length})`, icon: PeopleIcon },
    { id: 'analytics', label: t.sellerDashboard.analytics, icon: BarChartIcon },
  ];

  return (
    <Box sx={{ bgcolor: '#FAF8F2', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl" disableGutters sx={{ maxWidth: '1280px !important', px: { xs: 2, sm: 3, md: 4 } }}>
        
        {/* Executive Header Banner */}
        <Paper
          elevation={1}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
              <Box
                sx={{
                  width: { xs: 54, sm: 64 },
                  height: { xs: 54, sm: 64 },
                  borderRadius: '18px',
                  bgcolor: '#013E18',
                  color: '#C99325',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  boxShadow: '0 4px 14px rgba(1, 62, 24, 0.25)',
                  flexShrink: 0,
                }}
              >
                GG
              </Box>
              <Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B' }}>
                    Seller & Developer CRM
                  </Typography>
                  <Chip
                    size="small"
                    label="Developer Partner"
                    sx={{
                      bgcolor: '#C99325',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      height: 22,
                    }}
                  />
                  <Chip
                    size="small"
                    icon={<VerifiedUserIcon sx={{ fontSize: 13, color: '#013E18' }} />}
                    label="Verified Desk"
                    sx={{
                      bgcolor: '#ECFDF5',
                      color: '#065F46',
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      height: 22,
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#536458', mt: 0.5 }}>
                  Portfolio of Mohanraj S. (Grounds & Gates Gated Communities & Enclaves)
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' }, flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RefreshIcon sx={{ fontSize: 18, color: '#C99325' }} />}
                onClick={() => refreshAll()}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  py: 1,
                  px: 2,
                  textTransform: 'none',
                  borderColor: 'rgba(24, 36, 27, 0.2)',
                  color: '#18241B',
                  '&:hover': { bgcolor: 'rgba(201, 147, 37, 0.08)', borderColor: '#C99325' }
                }}
              >
                Refresh CRM
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<PeopleIcon sx={{ fontSize: 18 }} />}
                onClick={() => setOpenNewLeadModal(true)}
                sx={{ borderRadius: '12px', fontWeight: 800, py: 1, px: 2, textTransform: 'none' }}
              >
                + Log New Lead
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleIcon sx={{ fontSize: 18, color: '#C99325' }} />}
                onClick={() => onNavigate('post-property')}
                sx={{ borderRadius: '12px', fontWeight: 800, py: 1, px: 2.5 }}
              >
                {t.sellerDashboard.addNewListing}
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Sidebar + Workspace Layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 9fr' }, gap: 4, alignItems: 'start' }}>
          
          {/* Navigation Sidebar */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
              <Typography variant="caption" sx={{ px: 1.5, py: 1, color: '#8C9A90', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block' }}>
                CRM Portals
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'row', lg: 'column' }, gap: 1, overflowX: 'auto', pb: { xs: 1, lg: 0 } }}>
                {navItems.map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      startIcon={<Icon sx={{ fontSize: 18, color: active ? '#C99325' : 'text.secondary' }} />}
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1.2,
                        px: 2,
                        borderRadius: '12px',
                        fontWeight: active ? 800 : 600,
                        fontSize: '0.8rem',
                        bgcolor: active ? '#013E18' : 'transparent',
                        color: active ? '#FFFFFF' : '#536458',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          bgcolor: active ? '#00280F' : '#FAF8F2',
                          color: active ? '#FFFFFF' : '#013E18',
                        },
                      }}
                    >
                      {tab.label}
                    </Button>
                  );
                })}
              </Box>

              <Box sx={{ display: { xs: 'none', lg: 'block' }, mt: 2, pt: 2, borderTop: '1px solid #ECE7DA', px: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 700 }}>
                    Active Leads in Pipeline
                  </Typography>
                  <Chip label={leads.length} size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, height: 20 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 700 }}>
                    Inventory Properties
                  </Typography>
                  <Chip label={localProperties.length} size="small" sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 800, height: 20 }} />
                </Box>
              </Box>
            </Paper>

            {/* Verification Note */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #ECE7DA', display: { xs: 'none', lg: 'flex' }, gap: 1.5, alignItems: 'flex-start' }}>
              <VerifiedUserIcon sx={{ fontSize: 18, color: '#013E18', flexShrink: 0, mt: 0.3 }} />
              <Typography variant="caption" sx={{ color: '#536458', fontSize: '0.72rem', lineHeight: 1.5 }}>
                All listings registered here are synced with the Grounds & Gates enterprise database and presented directly on the public portal.
              </Typography>
            </Paper>
          </Box>

          {/* Main Dashboard Workspace */}
          <Box sx={{ minWidth: 0 }}>
            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* KPI Metric Cards */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                  <Card sx={{ p: 2.5, borderRadius: '18px', borderTop: '3px solid #013E18' }}>
                    <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                      {t.sellerDashboard.statsListings}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#013E18', my: 0.5 }}>
                      {localProperties.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#536458' }}>
                      Managed on platform
                    </Typography>
                  </Card>

                  <Card sx={{ p: 2.5, borderRadius: '18px', borderTop: '3px solid #013E18' }}>
                    <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                      {t.sellerDashboard.statsActive}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#065F46', my: 0.5 }}>
                      {activeCount}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#536458' }}>
                      Live in marketplace
                    </Typography>
                  </Card>

                  <Card sx={{ p: 2.5, borderRadius: '18px', borderTop: '3px solid #C99325' }}>
                    <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                      {t.sellerDashboard.statsViews}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#C99325', my: 0.5 }}>
                      {totalViews.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#065F46', fontWeight: 700 }}>
                      Live traffic metrics
                    </Typography>
                  </Card>

                  <Card sx={{ p: 2.5, borderRadius: '18px', borderTop: '3px solid #8C9A90' }}>
                    <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                      {t.sellerDashboard.statsLeads}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#18241B', my: 0.5 }}>
                      {totalLeads}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#536458' }}>
                      High-intent inquiries
                    </Typography>
                  </Card>
                </Box>

                {/* Performance Chart Paper */}
                <Paper elevation={1} sx={{ p: { xs: 3, sm: 4 }, borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
                        Weekly Traffic & Buyer Engagements
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#536458' }}>
                        Illustrative snapshot of listing impressions and buyer inquiries across Tamil Nadu
                      </Typography>
                    </Box>
                    <Chip label="Telemetry Active" size="small" sx={{ bgcolor: '#FAF8F2', color: '#013E18', fontWeight: 700 }} />
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: { xs: 1, sm: 2 }, height: 180, alignItems: 'flex-end', pt: 2, borderBottom: '1px solid #ECE7DA', textAlign: 'center' }}>
                    {[
                      { day: 'Mon', views: 420 },
                      { day: 'Tue', views: 680 },
                      { day: 'Wed', views: 890 },
                      { day: 'Thu', views: 740 },
                      { day: 'Fri', views: 1120 },
                      { day: 'Sat', views: 1450 },
                      { day: 'Sun', views: 1680 },
                    ].map((item, i) => {
                      const heightPercent = Math.round((item.views / 1800) * 100);
                      return (
                        <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, height: '100%', justifyContent: 'flex-end' }}>
                          <Box
                            sx={{
                              width: '100%',
                              maxWidth: 36,
                              bgcolor: '#013E18',
                              borderRadius: '8px 8px 0 0',
                              height: `${heightPercent}%`,
                              transition: 'all 0.3s ease',
                              '&:hover': { bgcolor: '#C99325' },
                            }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#536458' }}>
                            {item.day}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Paper>

                {/* Quick MUI X Data Grid on Overview */}
                <Paper elevation={1} sx={{ p: { xs: 3, sm: 4 }, borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
                        Enterprise Inventory Data Grid
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#536458' }}>
                        Sort, filter, and modify live property statuses
                      </Typography>
                    </Box>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setActiveTab('listings')}
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      sx={{ fontWeight: 700, color: '#013E18', fontSize: '0.75rem' }}
                    >
                      View Full Inventory ({localProperties.length})
                    </Button>
                  </Box>

                  <Box sx={{ height: 380, width: '100%' }}>
                    <DataGrid
                      rows={localProperties.slice(0, 5)}
                      columns={dataGridColumns}
                      initialState={{
                        pagination: { paginationModel: { pageSize: 5 } },
                      }}
                      pageSizeOptions={[5, 10]}
                      disableRowSelectionOnClick
                      density="comfortable"
                      sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                          bgcolor: '#FAF8F2',
                          color: '#18241B',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                        },
                        '& .MuiDataGrid-row:hover': {
                          bgcolor: 'rgba(1, 62, 24, 0.04)',
                        },
                        '& .MuiDataGrid-cell': {
                          borderBottom: '1px solid #ECE7DA',
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Tab 2: Full MUI X Data Grid Inventory */}
            {activeTab === 'listings' && (
              <Paper elevation={1} sx={{ p: { xs: 3, sm: 4 }, borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
                      Complete Property Inventory ({localProperties.length} Listings)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#536458' }}>
                      Full Enterprise Data Grid with sorting, multi-column filtering, and live state updates
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AddCircleIcon sx={{ fontSize: 16, color: '#C99325' }} />}
                    onClick={() => onNavigate('post-property')}
                    sx={{ borderRadius: '10px', fontWeight: 800 }}
                  >
                    Add Property
                  </Button>
                </Box>

                <Box sx={{ height: 580, width: '100%' }}>
                  <DataGrid
                    rows={localProperties}
                    columns={dataGridColumns}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[5, 10, 20]}
                    disableRowSelectionOnClick
                    density="comfortable"
                    sx={{
                      border: 'none',
                      '& .MuiDataGrid-columnHeaders': {
                        bgcolor: '#FAF8F2',
                        color: '#18241B',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                      },
                      '& .MuiDataGrid-row:hover': {
                        bgcolor: 'rgba(1, 62, 24, 0.04)',
                      },
                      '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #ECE7DA',
                      },
                    }}
                  />
                </Box>
              </Paper>
            )}

            {/* Tab 3: Professional CRM Kanban Board */}
            {activeTab === 'leads' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Paper elevation={1} sx={{ p: { xs: 3, sm: 3.5 }, borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#18241B' }}>
                          CRM Pipeline Kanban
                        </Typography>
                        <Chip
                          size="small"
                          label={`${leads.length} Total Opportunities`}
                          sx={{ bgcolor: 'rgba(201, 147, 37, 0.15)', color: '#8B6413', fontWeight: 800, fontSize: '0.7rem' }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#536458' }}>
                        Track buyer inquiries, inspections, offers, and closed contracts through pipeline stages
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      startIcon={<AddCircleIcon sx={{ fontSize: 16 }} />}
                      onClick={() => setOpenNewLeadModal(true)}
                      sx={{ borderRadius: '10px', fontWeight: 800 }}
                    >
                      New Opportunity
                    </Button>
                  </Box>

                  {/* Kanban Columns Grid */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)', xl: 'repeat(5, 1fr)' },
                      gap: 2,
                      alignItems: 'start',
                      overflowX: 'auto',
                      pb: 1,
                    }}
                  >
                    {KANBAN_STAGES.map(stage => {
                      const stageLeads = leads.filter(l => l.stage === stage.id);
                      const totalStageOffer = stageLeads.reduce((acc, l) => acc + (l.offerAmount || 0), 0);

                      return (
                        <Box
                          key={stage.id}
                          sx={{
                            bgcolor: '#FAF8F2',
                            borderRadius: '16px',
                            border: `1.5px solid ${stage.border}`,
                            p: 1.5,
                            minHeight: 450,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                          }}
                        >
                          {/* Column Header */}
                          <Box sx={{ pb: 1, borderBottom: `1px solid ${stage.border}` }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: stage.color, fontSize: '0.8rem' }}>
                                {stage.label}
                              </Typography>
                              <Chip
                                label={stageLeads.length}
                                size="small"
                                sx={{
                                  height: 20,
                                  minWidth: 20,
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  bgcolor: stage.bg,
                                  color: stage.color,
                                  border: `1px solid ${stage.border}`,
                                }}
                              />
                            </Box>
                            {totalStageOffer > 0 && (
                              <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 700, fontSize: '0.65rem' }}>
                                ₹{(totalStageOffer / 100000).toFixed(1)}L Pipeline
                              </Typography>
                            )}
                          </Box>

                          {/* Cards in Column */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {stageLeads.map(lead => (
                              <Paper
                                key={lead.id}
                                elevation={1}
                                sx={{
                                  p: 1.8,
                                  borderRadius: '12px',
                                  bgcolor: '#FFFFFF',
                                  border: '1px solid rgba(24, 36, 27, 0.08)',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                                    transform: 'translateY(-2px)',
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.8rem' }}>
                                    {lead.buyerName}
                                  </Typography>
                                  {lead.priority === 'high' && (
                                    <Chip label="High" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: '#FEE2E2', color: '#991B1B' }} />
                                  )}
                                </Box>

                                <Typography variant="caption" sx={{ color: '#013E18', fontWeight: 700, display: 'block', mb: 0.5 }} noWrap>
                                  {lead.propertyTitle}
                                </Typography>

                                {lead.offerAmount && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#C99325', mb: 0.8 }}>
                                    <CurrencyRupeeIcon sx={{ fontSize: 13 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                      Offer: ₹{(lead.offerAmount / 100000).toFixed(1)} Lakhs
                                    </Typography>
                                  </Box>
                                )}

                                <Typography variant="body2" sx={{ color: '#536458', fontSize: '0.72rem', fontStyle: 'italic', mb: 1, lineHeight: 1.4 }}>
                                  "{lead.message}"
                                </Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #F0ECE1' }}>
                                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', color: '#8C9A90' }}>
                                    <PhoneIcon sx={{ fontSize: 12 }} />
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                                      {lead.phone}
                                    </Typography>
                                  </Box>

                                  {/* Quick Stage Move Dropdown */}
                                  <FormControl size="small" variant="standard">
                                    <Select
                                      value={lead.stage}
                                      onChange={(e) => handleStageChange(lead.id, e.target.value as KanbanStage)}
                                      IconComponent={SwapHorizIcon}
                                      sx={{
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        color: stage.color,
                                        '&:before, &:after': { display: 'none' },
                                      }}
                                    >
                                      {KANBAN_STAGES.map(s => (
                                        <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.7rem' }}>
                                          Move to {s.label}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Box>
                              </Paper>
                            ))}

                            {stageLeads.length === 0 && (
                              <Box sx={{ p: 2, textAlign: 'center', border: '1px dashed #ECE7DA', borderRadius: '12px' }}>
                                <Typography variant="caption" sx={{ color: '#8C9A90', fontSize: '0.7rem' }}>
                                  No leads in this stage
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Tab 4: Analytics */}
            {activeTab === 'analytics' && (
              <Paper elevation={1} sx={{ p: { xs: 3, sm: 4 }, borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B', mb: 1 }}>
                  Audience & Regional Demand Analytics
                </Typography>
                <Typography variant="body2" sx={{ color: '#536458', mb: 3 }}>
                  Visitor interest distribution across key Tamil Nadu investment corridors.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { hub: 'Coimbatore (Saravanampatti & Avinashi Rd)', share: '38%', count: '4,280 views' },
                    { hub: 'Chennai (OMR & ECR Coast)', share: '32%', count: '3,610 views' },
                    { hub: 'Madurai & Trichy Expressways', share: '18%', count: '2,030 views' },
                    { hub: 'Pollachi & Western Agro-corridors', share: '12%', count: '1,350 views' },
                  ].map((row, i) => (
                    <Box key={i} sx={{ p: 2, borderRadius: '12px', bgcolor: '#FAF8F2', border: '1px solid #ECE7DA' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B' }}>{row.hub}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#013E18' }}>{row.share} ({row.count})</Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 8, bgcolor: '#ECE7DA', borderRadius: 4, overflow: 'hidden' }}>
                        <Box sx={{ width: row.share, height: '100%', bgcolor: '#013E18' }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

          </Box>
        </Box>

      </Container>

      {/* New Opportunity Modal with MUI DatePicker */}
      <Dialog
        open={openNewLeadModal}
        onClose={() => setOpenNewLeadModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              p: 1.5,
              bgcolor: '#FFFFFF',
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
            Log Inbound Lead / Opportunity
          </Typography>
          <IconButton size="small" onClick={() => setOpenNewLeadModal(false)}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleCreateLead}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Buyer Full Name *"
                required
                value={newLeadName}
                onChange={(e) => setNewLeadName(e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="Phone Number *"
                required
                value={newLeadPhone}
                onChange={(e) => setNewLeadPhone(e.target.value)}
                size="small"
                fullWidth
              />
            </Box>

            <FormControl fullWidth size="small">
              <InputLabel>Associated Property</InputLabel>
              <Select
                value={newLeadProperty}
                label="Associated Property"
                onChange={(e) => setNewLeadProperty(e.target.value)}
              >
                {properties.map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.title} ({p.district})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Pipeline Stage</InputLabel>
                <Select
                  value={newLeadStage}
                  label="Pipeline Stage"
                  onChange={(e) => setNewLeadStage(e.target.value as KanbanStage)}
                >
                  {KANBAN_STAGES.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Offer Budget (INR)"
                type="number"
                value={newLeadOffer}
                onChange={(e) => setNewLeadOffer(e.target.value)}
                placeholder="e.g. 5000000"
                size="small"
                fullWidth
              />
            </Box>

            <DatePicker
              label="Scheduled Site Visit Date"
              value={newLeadVisitDate}
              onChange={(newDate) => setNewLeadVisitDate(newDate)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
            />

            <TextField
              label="Requirement / Site Visit Notes"
              multiline
              rows={2}
              value={newLeadNotes}
              onChange={(e) => setNewLeadNotes(e.target.value)}
              placeholder="e.g., Prefers North facing 6 cent plot with 40ft road"
              size="small"
              fullWidth
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenNewLeadModal(false)} sx={{ color: '#536458', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: '10px', px: 3, fontWeight: 800 }}
            >
              Save to Pipeline
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};
