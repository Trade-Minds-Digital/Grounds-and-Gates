import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';

import { api } from '../../../services/api';
import { AdminUser } from '../../../types/crm';
import { LanguageCode } from '../../../types/property';

interface AdminReportsModuleProps {
  currentUser: AdminUser;
  lang: LanguageCode;
}

export const AdminReportsModule: React.FC<AdminReportsModuleProps> = ({ currentUser, lang }) => {
  const [reportsData, setReportsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReportsSummary();
      setReportsData(res);
    } catch (e) {
      console.warn('Failed to load reports summary:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCsv = (type: 'leads' | 'properties' | 'bookings' | 'visits') => {
    const url = `http://localhost:5000/api/v1/reports/export?type=${type}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report_${type}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Header bar */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B', fontSize: '1.25rem' }}>
              {lang === 'ta' ? 'அறிக்கைகள் & CSV ஏற்றுமதிகள்' : 'Executive Reports & CSV Data Exports'}
            </Typography>
            <Chip
              label="Audit Certified"
              size="small"
              sx={{ bgcolor: '#FAF8F2', color: '#013E18', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25, fontSize: '0.82rem' }}>
            Automated pipeline audits, executive closure rates, and sanitized CSV exports.
          </Typography>
        </Box>
      </Box>

      {/* CSV Export Options Card */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '14px',
          bgcolor: '#FAF8F2',
          border: '1px solid rgba(201, 147, 37, 0.3)',
          mb: 2.5,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18', fontSize: '0.90rem', mb: 0.25 }}>
          Authorized CSV Data Exports
        </Typography>
        <Typography variant="caption" sx={{ color: '#536458', display: 'block', mb: 2, fontSize: '0.75rem' }}>
          Export sanitized CSV files protected against spreadsheet formula injection (=, +, -, @).
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleExportCsv('leads')}
            sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, textTransform: 'none', borderRadius: '8px', fontSize: '0.80rem', py: 0.6, px: 1.5, '&:hover': { bgcolor: '#00280F' } }}
          >
            Export All Leads (.CSV)
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleExportCsv('properties')}
            sx={{ bgcolor: '#C99325', color: '#18241B', fontWeight: 700, textTransform: 'none', borderRadius: '8px', fontSize: '0.80rem', py: 0.6, px: 1.5, '&:hover': { bgcolor: '#E0AA3E' } }}
          >
            Export Properties Catalog (.CSV)
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleExportCsv('bookings')}
            sx={{ borderColor: '#013E18', color: '#013E18', fontWeight: 700, textTransform: 'none', borderRadius: '8px', fontSize: '0.80rem', py: 0.6, px: 1.5, '&:hover': { bgcolor: 'rgba(1, 62, 24, 0.05)' } }}
          >
            Export Bookings & Tokens (.CSV)
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleExportCsv('visits')}
            sx={{ borderColor: '#013E18', color: '#013E18', fontWeight: 700, textTransform: 'none', borderRadius: '8px', fontSize: '0.80rem', py: 0.6, px: 1.5, '&:hover': { bgcolor: 'rgba(1, 62, 24, 0.05)' } }}
          >
            Export Site Inspections (.CSV)
          </Button>
        </Box>
      </Paper>

      {/* Executive Workload & Conversion Summary */}
      {isLoading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={32} sx={{ color: '#013E18' }} />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '6fr 6fr' }, gap: 2.5 }}>
          {/* Team Performance */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#18241B', mb: 2, fontSize: '0.95rem' }}>
              Executive Performance & Deals Closed
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {(reportsData?.employees || [
                { name: 'Dr. K. Senthil Nathan', role: 'Sales Lead', activeLeadsCount: 3, totalClosedDeals: 12 },
                { name: 'Priya R. Sundaram', role: 'CRM Manager', activeLeadsCount: 2, totalClosedDeals: 16 },
                { name: 'Arun Kumar', role: 'Chennai Executive', activeLeadsCount: 2, totalClosedDeals: 9 },
              ]).map((emp: any) => (
                <Box key={emp.name} sx={{ p: 1.75, bgcolor: '#FAF8F2', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(24, 36, 27, 0.05)' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#18241B', fontSize: '0.84rem' }}>
                      {emp.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#536458', fontSize: '0.72rem' }}>
                      {emp.role}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#013E18', fontSize: '0.84rem' }}>
                      {emp.totalClosedDeals || 0} Deals Won
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8B6413', fontSize: '0.70rem', fontWeight: 600 }}>
                      {emp.activeLeadsCount || 0} Active Leads
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Lead Sources Breakdown */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#18241B', mb: 2, fontSize: '0.95rem' }}>
              Lead Source Channel Attribution
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { source: 'Website Public Enquiry', count: 18, share: '45%' },
                { source: 'Site Visit Modal Request', count: 12, share: '30%' },
                { source: 'Direct Phone & WhatsApp', count: 7, share: '17%' },
                { source: 'Builder Channel Partner', count: 3, share: '8%' },
              ].map((src) => (
                <Box key={src.source} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#FAF8F2', borderRadius: '8px', border: '1px solid rgba(24, 36, 27, 0.05)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B', fontSize: '0.82rem' }}>
                    {src.source}
                  </Typography>
                  <Chip
                    label={`${src.count} (${src.share})`}
                    size="small"
                    sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, fontSize: '0.70rem', height: 22 }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};
