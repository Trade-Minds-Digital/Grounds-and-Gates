import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  Tooltip,
} from '@mui/material';

// Icons
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LayersClearIcon from '@mui/icons-material/LayersClear';

import { api } from '../../../services/api';
import { AdminUser, DashboardMetrics } from '../../../types/crm';
import { LanguageCode } from '../../../types/property';
import { formatPriceINR } from '../../../utils/propertyUtils';
import { CrmModule, hasModuleAccess } from '../../../utils/rbac';

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

  const fetchMetrics = useCallback(async (selectedRange = dateRange) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardAnalytics({ dateRange: selectedRange });
      setMetrics(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch database metrics.');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchMetrics(dateRange);
  }, [dateRange, fetchMetrics]);

  if (isLoading && !metrics) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={36} sx={{ color: '#013E18', mb: 2 }} />
        <Typography variant="body2" sx={{ color: '#536458', fontWeight: 600 }}>
          {lang === 'ta' ? 'நேரலை புள்ளிவிவரங்கள் ஏற்றப்படுகின்றன...' : 'Loading operational metrics...'}
        </Typography>
      </Box>
    );
  }

  const totalLeads = metrics?.leads?.total || 0;
  const wonCount = metrics?.leads?.byStage?.won || 0;
  const hasLeadData = totalLeads > 0;
  const conversionRate = hasLeadData ? ((wonCount / totalLeads) * 100).toFixed(1) : null;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Top Header & Range Controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B', fontSize: { xs: '1.25rem', sm: '1.4rem' } }}>
            {lang === 'ta' ? 'வணக்கம், ' : 'Welcome, '} {currentUser.fullName}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25, fontSize: '0.84rem' }}>
            {lang === 'ta'
              ? 'தமிழ்நாடு ரியல் எஸ்டேட் விற்பனை மற்றும் லீட்கள் நேரலை புள்ளிவிவரங்கள்.'
              : 'Live operational metrics, sales pipelines, and inventory records across Tamil Nadu.'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
          <FormControl size="small" sx={{ minWidth: 130, bgcolor: '#FFFFFF', borderRadius: '8px' }}>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              sx={{ borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}
              aria-label="Filter date range"
            >
              <MenuItem value="today">{lang === 'ta' ? 'இன்று' : 'Today'}</MenuItem>
              <MenuItem value="7days">{lang === 'ta' ? 'கடந்த 7 நாட்கள்' : 'Last 7 Days'}</MenuItem>
              <MenuItem value="30days">{lang === 'ta' ? 'கடந்த 30 நாட்கள்' : 'Last 30 Days'}</MenuItem>
              <MenuItem value="year">{lang === 'ta' ? 'இந்த ஆண்டு' : 'This Year'}</MenuItem>
              <MenuItem value="all">{lang === 'ta' ? 'அனைத்து காலம்' : 'All Time'}</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            onClick={() => fetchMetrics(dateRange)}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderColor: 'rgba(24, 36, 27, 0.2)',
              color: '#013E18',
              fontWeight: 700,
              borderRadius: '8px',
              textTransform: 'none',
              px: 1.5,
              height: 38,
              fontSize: '0.82rem',
              '&:hover': { borderColor: '#013E18', bgcolor: 'rgba(1, 62, 24, 0.04)' },
            }}
          >
            {lang === 'ta' ? 'புதுப்பி' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: '10px' }}>
          Notice: {error} Displaying cached or fallback data.
        </Alert>
      )}

      {/* KPI Stats Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 2.5,
        }}
      >
        {/* KPI 1: Active Leads */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '14px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#536458', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.70rem' }}>
              {lang === 'ta' ? 'மொத்த லீட்கள்' : 'CRM Leads'}
            </Typography>
            <Box sx={{ p: 0.75, borderRadius: '8px', bgcolor: 'rgba(1, 62, 24, 0.08)', color: '#013E18', display: 'flex' }}>
              <PeopleIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#013E18', mb: 0.75, fontSize: '1.75rem', lineHeight: 1 }}>
            {totalLeads}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            <Chip size="small" label={`New: ${metrics?.leads?.byStage?.new || 0}`} sx={{ fontSize: '0.68rem', height: 20, bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600 }} />
            <Chip size="small" label={`Negotiation: ${metrics?.leads?.byStage?.negotiation || 0}`} sx={{ fontSize: '0.68rem', height: 20, bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 600 }} />
          </Box>
        </Paper>

        {/* KPI 2: Properties Catalog */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '14px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#536458', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.70rem' }}>
              {lang === 'ta' ? 'சொத்துக்கள் பட்டியல்' : 'Property Inventory'}
            </Typography>
            <Box sx={{ p: 0.75, borderRadius: '8px', bgcolor: 'rgba(201, 147, 37, 0.12)', color: '#8B6413', display: 'flex' }}>
              <BusinessIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#18241B', mb: 0.75, fontSize: '1.75rem', lineHeight: 1 }}>
            {metrics?.properties?.total || 0}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            <Chip size="small" label={`Active: ${metrics?.properties?.active || 0}`} sx={{ fontSize: '0.68rem', height: 20, bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 600 }} />
            <Chip size="small" label={`Sold: ${metrics?.properties?.sold || 0}`} sx={{ fontSize: '0.68rem', height: 20, bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600 }} />
          </Box>
        </Paper>

        {/* KPI 3: Site Visits */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '14px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#536458', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.70rem' }}>
              {lang === 'ta' ? 'திட்டமிடப்பட்ட ஆய்வுகள்' : 'Upcoming Inspections'}
            </Typography>
            <Box sx={{ p: 0.75, borderRadius: '8px', bgcolor: 'rgba(2, 132, 199, 0.1)', color: '#0284C7', display: 'flex' }}>
              <CalendarMonthIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0284C7', mb: 0.75, fontSize: '1.75rem', lineHeight: 1 }}>
            {metrics?.siteVisits?.upcoming || 0}
          </Typography>
          <Typography variant="caption" sx={{ color: '#536458', fontWeight: 600, fontSize: '0.72rem' }}>
            Total scheduled inspections: {metrics?.siteVisits?.total || 0}
          </Typography>
        </Paper>

        {/* KPI 4: Recorded Token Collections */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '14px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#536458', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.70rem' }}>
              {lang === 'ta' ? 'பதிவான டோக்கன் தொகை' : 'Recorded Token Receipts'}
            </Typography>
            <Box sx={{ p: 0.75, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'flex' }}>
              <MonetizationOnIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#013E18', mb: 0.75, fontSize: '1.75rem', lineHeight: 1 }}>
            {formatPriceINR(metrics?.bookings?.totalToken || 0)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#8B6413', display: 'block', fontSize: '0.68rem', lineHeight: 1.2 }}>
            *Manual bank/token records; not recognized revenue
          </Typography>
        </Paper>
      </Box>

      {/* Quick Operational Shortcuts */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '14px',
          bgcolor: '#FAF8F2',
          border: '1px solid rgba(201, 147, 37, 0.3)',
          mb: 2.5,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18', fontSize: '0.88rem' }}>
            {lang === 'ta' ? 'விரைவு செயல்பாடுகள்' : 'Operational Quick Actions'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#536458', fontSize: '0.75rem' }}>
            {lang === 'ta'
              ? 'தள ஆய்வுகளை திட்டமிடுங்கள், புதிய லீட்களை அல்லது சரிபார்க்கப்பட்ட சொத்துக்களை சேர்க்கவும்.'
              : 'Instantly dispatch site visits, add new leads, or create verified listings.'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {hasModuleAccess(currentUser.role, 'leads') && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              onClick={() => onNavigateModule('leads')}
              sx={{
                bgcolor: '#013E18',
                color: '#F5F2E9',
                fontWeight: 700,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '0.80rem',
                py: 0.6,
                px: 1.5,
                '&:hover': { bgcolor: '#00280F' },
              }}
            >
              {lang === 'ta' ? 'புதிய லீட்' : 'New Lead'}
            </Button>
          )}

          {hasModuleAccess(currentUser.role, 'properties') && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              onClick={() => onNavigateModule('properties')}
              sx={{
                bgcolor: '#C99325',
                color: '#18241B',
                fontWeight: 700,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '0.80rem',
                py: 0.6,
                px: 1.5,
                '&:hover': { bgcolor: '#E0AA3E' },
              }}
            >
              {lang === 'ta' ? 'சொத்து சேர்' : 'Add Property'}
            </Button>
          )}

          {hasModuleAccess(currentUser.role, 'site-visits') && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
              onClick={() => onNavigateModule('site-visits')}
              sx={{
                borderColor: '#013E18',
                color: '#013E18',
                fontWeight: 700,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '0.80rem',
                py: 0.6,
                px: 1.5,
                '&:hover': { bgcolor: 'rgba(1, 62, 24, 0.05)' },
              }}
            >
              {lang === 'ta' ? 'தள ஆய்வு அட்டவணை' : 'Schedule Site Visit'}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Middle Row: Pipeline Stages & Regional Breakdown */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' },
          gap: 2.5,
          alignItems: 'flex-start',
        }}
      >
        {/* Pipeline Summary */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B', fontSize: '1rem' }}>
              {lang === 'ta' ? 'விற்பனை பைப்லைன் நிலைகள்' : 'Lead Conversion Pipeline'}
            </Typography>
            <Chip
              label={hasLeadData ? `Won Conversion: ${conversionRate}%` : (lang === 'ta' ? 'தரவு இல்லை' : 'No lead records')}
              size="small"
              sx={{
                bgcolor: hasLeadData ? '#ECFDF5' : '#F1F5F9',
                color: hasLeadData ? '#065F46' : '#64748B',
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 22,
              }}
            />
          </Box>

          {!hasLeadData ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <LayersClearIcon sx={{ fontSize: 36, color: '#9CA3AF', mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#536458', mb: 1.5 }}>
                {lang === 'ta' ? 'தற்போது பதிவு செய்யப்பட்ட லீட்கள் எதுவும் இல்லை.' : 'No active leads recorded in this period.'}
              </Typography>
              {hasModuleAccess(currentUser.role, 'leads') && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => onNavigateModule('leads')}
                  sx={{
                    borderColor: '#013E18',
                    color: '#013E18',
                    fontWeight: 700,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.80rem',
                  }}
                >
                  {lang === 'ta' ? 'முதல் லீடை சேர்க்கவும்' : 'Create First Lead'}
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
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
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#18241B', fontSize: '0.82rem' }}>
                        {stage.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#536458', fontSize: '0.82rem' }}>
                        {stage.count} {stage.count === 1 ? 'lead' : 'leads'} ({pct}%)
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 6, bgcolor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                      <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: stage.color, borderRadius: 3 }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>

        {/* District Distribution - Content Driven Height */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
            height: 'fit-content',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.75 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B', fontSize: '1rem' }}>
              {lang === 'ta' ? 'மாவட்ட வாரியாக சொத்துக்கள்' : 'Tamil Nadu Regional Hubs'}
            </Typography>
            <Chip
              label={`${metrics?.districtDistribution?.length || 0} ${metrics?.districtDistribution?.length === 1 ? 'Hub' : 'Hubs'}`}
              size="small"
              sx={{ bgcolor: '#FAF8F2', color: '#013E18', fontWeight: 700, fontSize: '0.70rem', height: 22 }}
            />
          </Box>

          {(!metrics?.districtDistribution || metrics.districtDistribution.length === 0) ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#536458' }}>
                {lang === 'ta' ? 'மாவட்ட வாரியான சொத்து பதிவுகள் இல்லை.' : 'No regional property distribution recorded yet.'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {metrics.districtDistribution.map((dist) => {
                const count = dist.count || 0;
                const unitLabel = count === 1 ? (lang === 'ta' ? 'சொத்து' : 'listing') : (lang === 'ta' ? 'சொத்துக்கள்' : 'listings');
                return (
                  <Box
                    key={dist.district}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.25,
                      borderRadius: '8px',
                      bgcolor: '#FAF8F2',
                      border: '1px solid rgba(24, 36, 27, 0.05)',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B', fontSize: '0.84rem' }}>
                      {dist.district || 'Unassigned'}
                    </Typography>
                    <Chip
                      label={`${count} ${unitLabel}`}
                      size="small"
                      sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, fontSize: '0.70rem', height: 22 }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}

          <Button
            fullWidth
            variant="text"
            onClick={() => onNavigateModule('properties')}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              mt: 2,
              color: '#013E18',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.84rem',
              '&:hover': { bgcolor: 'rgba(1, 62, 24, 0.05)' },
            }}
          >
            {lang === 'ta' ? 'அனைத்து சொத்துக்களையும் காண்க' : 'View All Properties in Inventory'}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};
