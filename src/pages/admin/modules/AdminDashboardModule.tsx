import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';

// Icons
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { api } from '../../../services/api';
import { AdminUser, DashboardMetrics } from '../../../types/crm';
import { LanguageCode } from '../../../types/property';
import { formatPriceINR } from '../../../utils/propertyUtils';
import { CrmModule } from '../../../utils/rbac';

interface AdminDashboardModuleProps {
  currentUser: AdminUser;
  lang: LanguageCode;
  onNavigateModule: (module: CrmModule) => void;
}

export const AdminDashboardModule: React.FC<AdminDashboardModuleProps> = ({
  currentUser,
  lang,
  onNavigateModule,
}) => {
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'year' | 'all'>('30days');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardAnalytics();
      setMetrics(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch database metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  if (isLoading && !metrics) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
        <CircularProgress size={40} sx={{ color: '#013E18', mb: 2 }} />
        <Typography variant="body2" sx={{ color: '#536458', fontWeight: 600 }}>
          {lang === 'ta' ? 'தரவுத்தள புள்ளிவிவரங்கள் ஏற்றப்படுகின்றன...' : 'Querying real-time database metrics...'}
        </Typography>
      </Box>
    );
  }

  // Calculate conversion rate: Won / (Total leads)
  const wonCount = metrics?.leads?.byStage?.won || 0;
  const totalLeads = metrics?.leads?.total || 1;
  const conversionRate = ((wonCount / totalLeads) * 100).toFixed(1);

  return (
    <Box>
      {/* Top Header & Actions Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3.5,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B' }}>
            {lang === 'ta' ? 'வணக்கம், ' : 'Welcome, '} {currentUser.fullName}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25 }}>
            {lang === 'ta'
              ? 'தமிழ்நாடு ரியல் எஸ்டேட் விற்பனை மற்றும் லீட்கள் நேரலை புள்ளிவிவரங்கள்.'
              : 'Live operational metrics, sales pipelines, and inventory records across Tamil Nadu.'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          <FormControl size="small" sx={{ minWidth: 140, bgcolor: '#FFFFFF', borderRadius: '10px' }}>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              sx={{ borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            onClick={fetchMetrics}
            startIcon={<RefreshIcon />}
            sx={{
              borderColor: 'rgba(24, 36, 27, 0.2)',
              color: '#013E18',
              fontWeight: 700,
              borderRadius: '10px',
              textTransform: 'none',
              px: 1.5,
              height: 40,
            }}
          >
            {lang === 'ta' ? 'புதுப்பி' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
          Notice: {error} Displaying cached or fallback data.
        </Alert>
      )}

      {/* KPI Stats Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 4,
        }}
      >
        {/* KPI 1: Active Leads */}
        <Paper
          elevation={1}
          sx={{
            p: 2.5,
            borderRadius: '18px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#536458', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {lang === 'ta' ? 'மொத்த லீட்கள்' : 'CRM Leads'}
            </Typography>
            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(1, 62, 24, 0.08)', color: '#013E18' }}>
              <PeopleIcon fontSize="small" />
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#013E18', mb: 0.5 }}>
            {metrics?.leads?.total || 0}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip size="small" label={`New: ${metrics?.leads?.byStage?.new || 0}`} sx={{ fontSize: '0.72rem', bgcolor: '#FEF3C7', color: '#92400E' }} />
            <Chip size="small" label={`Negotiation: ${metrics?.leads?.byStage?.negotiation || 0}`} sx={{ fontSize: '0.72rem', bgcolor: '#E0F2FE', color: '#0369A1' }} />
          </Box>
        </Paper>

        {/* KPI 2: Properties Catalog */}
        <Paper
          elevation={1}
          sx={{
            p: 2.5,
            borderRadius: '18px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#536458', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {lang === 'ta' ? 'சொத்துக்கள் பட்டியல்' : 'Property Inventory'}
            </Typography>
            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(201, 147, 37, 0.12)', color: '#8B6413' }}>
              <BusinessIcon fontSize="small" />
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#18241B', mb: 0.5 }}>
            {metrics?.properties?.total || 0}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip size="small" label={`Active: ${metrics?.properties?.active || 0}`} sx={{ fontSize: '0.72rem', bgcolor: '#ECFDF5', color: '#065F46' }} />
            <Chip size="small" label={`Sold: ${metrics?.properties?.sold || 0}`} sx={{ fontSize: '0.72rem', bgcolor: '#F1F5F9', color: '#475569' }} />
          </Box>
        </Paper>

        {/* KPI 3: Site Visits */}
        <Paper
          elevation={1}
          sx={{
            p: 2.5,
            borderRadius: '18px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#536458', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {lang === 'ta' ? 'திட்டமிடப்பட்ட ஆய்வுகள்' : 'Upcoming Inspections'}
            </Typography>
            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(2, 132, 199, 0.1)', color: '#0284C7' }}>
              <CalendarMonthIcon fontSize="small" />
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0284C7', mb: 0.5 }}>
            {metrics?.siteVisits?.upcoming || 0}
          </Typography>
          <Typography variant="caption" sx={{ color: '#536458', fontWeight: 600 }}>
            Total scheduled inspections: {metrics?.siteVisits?.total || 0}
          </Typography>
        </Paper>

        {/* KPI 4: Recorded Token Collections */}
        <Paper
          elevation={1}
          sx={{
            p: 2.5,
            borderRadius: '18px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#536458', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {lang === 'ta' ? 'பதிவான டோக்கன் தொகை' : 'Recorded Token Receipts'}
            </Typography>
            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
              <MonetizationOnIcon fontSize="small" />
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#013E18', mb: 0.5 }}>
            {formatPriceINR(metrics?.bookings?.totalToken || 0)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#8B6413', display: 'block', fontSize: '0.72rem' }}>
            *Manual bank/token records; not recognized revenue
          </Typography>
        </Paper>
      </Box>

      {/* Quick Operational Shortcuts */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '18px',
          bgcolor: '#FAF8F2',
          border: '1px solid rgba(201, 147, 37, 0.3)',
          mb: 4,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18' }}>
            {lang === 'ta' ? 'விரைவு செயல்பாடுகள் (Quick Actions)' : 'Operational Quick Actions'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#536458' }}>
            Instantly dispatch site visits, add new leads, or create verified listings.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => onNavigateModule('leads')}
            sx={{
              bgcolor: '#013E18',
              color: '#F5F2E9',
              fontWeight: 700,
              borderRadius: '10px',
              textTransform: 'none',
              '&:hover': { bgcolor: '#00280F' },
            }}
          >
            + New Lead
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => onNavigateModule('properties')}
            sx={{
              bgcolor: '#C99325',
              color: '#18241B',
              fontWeight: 700,
              borderRadius: '10px',
              textTransform: 'none',
              '&:hover': { bgcolor: '#E0AA3E' },
            }}
          >
            + Add Property
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={() => onNavigateModule('site-visits')}
            sx={{
              borderColor: '#013E18',
              color: '#013E18',
              fontWeight: 700,
              borderRadius: '10px',
              textTransform: 'none',
            }}
          >
            Schedule Site Visit
          </Button>
        </Box>
      </Paper>

      {/* Middle Row: Pipeline Stages & Regional Breakdown */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' },
          gap: 3,
          mb: 4,
        }}
      >
        {/* Pipeline Summary */}
        <Paper
          elevation={1}
          sx={{
            p: 3,
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
              {lang === 'ta' ? 'விற்பனை பைப்லைன் நிலைகள்' : 'Lead Conversion Pipeline'}
            </Typography>
            <Chip
              label={`Won Conversion: ${conversionRate}%`}
              size="small"
              sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 700 }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { label: 'New Inquiries', count: metrics?.leads?.byStage?.new || 0, color: '#F59E0B' },
              { label: 'Contacted & Qualified', count: (metrics?.leads?.byStage?.contacted || 0) + (metrics?.leads?.byStage?.qualified || 0), color: '#3B82F6' },
              { label: 'Site Visit Scheduled', count: metrics?.leads?.byStage?.scheduled || 0, color: '#8B5CF6' },
              { label: 'Price Negotiation', count: metrics?.leads?.byStage?.negotiation || 0, color: '#06B6D4' },
              { label: 'Won / Booked', count: metrics?.leads?.byStage?.won || 0, color: '#10B981' },
              { label: 'Closed / Lost', count: metrics?.leads?.byStage?.lost || 0, color: '#9CA3AF' },
            ].map((stage) => {
              const pct = Math.min(100, Math.round(((stage.count || 0) / totalLeads) * 100));
              return (
                <Box key={stage.label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#18241B', fontSize: '0.85rem' }}>
                      {stage.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#536458' }}>
                      {stage.count} leads ({pct}%)
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 8, bgcolor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                    <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: stage.color, borderRadius: 4 }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* District Distribution */}
        <Paper
          elevation={1}
          sx={{
            p: 3,
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B', mb: 2 }}>
            {lang === 'ta' ? 'மாவட்ட வாரியாக சொத்துக்கள்' : 'Tamil Nadu Regional Hubs'}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {(metrics?.districtDistribution || [
              { district: 'Coimbatore', count: 14 },
              { district: 'Chennai', count: 9 },
              { district: 'Madurai', count: 4 },
              { district: 'Tiruppur', count: 3 },
              { district: 'Erode', count: 2 },
            ]).map((dist) => (
              <Box
                key={dist.district}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.25,
                  borderRadius: '10px',
                  bgcolor: '#FAF8F2',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B' }}>
                  {dist.district}
                </Typography>
                <Chip
                  label={`${dist.count} listings`}
                  size="small"
                  sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, fontSize: '0.72rem' }}
                />
              </Box>
            ))}
          </Box>

          <Button
            fullWidth
            variant="text"
            onClick={() => onNavigateModule('properties')}
            endIcon={<ArrowForwardIcon />}
            sx={{ mt: 2.5, color: '#013E18', fontWeight: 700, textTransform: 'none' }}
          >
            View All Properties in Inventory →
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

