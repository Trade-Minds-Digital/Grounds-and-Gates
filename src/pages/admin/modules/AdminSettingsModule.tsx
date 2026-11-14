import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { api } from '../../../services/api';
import { AdminUser } from '../../../types/crm';
import { LanguageCode } from '../../../types/property';

interface AdminSettingsModuleProps {
  currentUser: AdminUser;
  lang: LanguageCode;
}

export const AdminSettingsModule: React.FC<AdminSettingsModuleProps> = ({ currentUser, lang }) => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSettings();
      setSettings(res || {});
    } catch (e) {
      console.warn('Failed to load settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings(settings);
      setSuccessMessage('System configuration saved and audit record created.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (e: any) {
      alert(`Failed to save settings: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={36} sx={{ color: '#013E18' }} />
      </Box>
    );
  }

  const isSuperAdmin = currentUser.role === 'super-admin';

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B' }}>
          {lang === 'ta' ? 'நிறுவன & கணினி அமைப்புகள்' : 'Company Profile & System Settings'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#536458', mt: 0.25 }}>
          Production platform variables, regional offices, and external integration status.
        </Typography>
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{successMessage}</Alert>}

      <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        {/* Company Identity */}
        <Paper elevation={1} sx={{ p: 3.5, borderRadius: '18px', bgcolor: '#FFFFFF' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#013E18', mb: 0.5 }}>
            Corporate Legal Entity & Offices
          </Typography>
          <Typography variant="caption" sx={{ color: '#536458', display: 'block', mb: 3 }}>
            Official registered firm particulars displayed on booking receipts and public agreements.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
            <TextField
              label="Registered Company Name"
              value={settings.companyName || 'Grounds & Gates Properties Pvt Ltd'}
              disabled={!isSuperAdmin}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
            />
            <TextField
              label="Brand Tagline"
              value={settings.tagline || 'Property Decisions Simplified'}
              disabled={!isSuperAdmin}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
            <TextField
              label="Primary Contact Phone"
              value={settings.primaryPhone || '+91 98422 71000'}
              disabled={!isSuperAdmin}
              onChange={(e) => setSettings({ ...settings, primaryPhone: e.target.value })}
            />
            <TextField
              label="Support / Helpdesk Email"
              value={settings.supportEmail || 'contact@groundsandgates.com'}
              disabled={!isSuperAdmin}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            />
            <TextField
              fullWidth
              label="Coimbatore Headquarters"
              value={settings.coimbatoreOffice || 'Race Course Road, Coimbatore, Tamil Nadu - 641018'}
              disabled={!isSuperAdmin}
              onChange={(e) => setSettings({ ...settings, coimbatoreOffice: e.target.value })}
            />
            <TextField
              fullWidth
              label="Chennai Regional Branch"
              value={settings.chennaiOffice || 'Old Mahabalipuram Road (OMR), Perungudi, Chennai - 600096'}
              disabled={!isSuperAdmin}
              onChange={(e) => setSettings({ ...settings, chennaiOffice: e.target.value })}
            />
          </Box>
        </Paper>

        {/* Operational Localization */}
        <Paper elevation={1} sx={{ p: 3.5, borderRadius: '18px', bgcolor: '#FFFFFF' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#013E18', mb: 0.5 }}>
            Localization & Operational Standards
          </Typography>
          <Typography variant="caption" sx={{ color: '#536458', display: 'block', mb: 3 }}>
            Time zone enforcement, unit representations, and business hours.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
            <TextField
              label="Operational Time Zone"
              value={settings.defaultTimeZone || 'Asia/Kolkata'}
              disabled
              helperText="Strictly configured for IST synchronization"
            />
            <TextField
              label="Primary Transaction Currency"
              value={settings.defaultCurrency || 'INR (₹)'}
              disabled
              helperText="Formatted in Lakhs & Crores"
            />
            <TextField
              label="Business Working Hours"
              value={settings.operationalHours || 'Monday - Saturday: 9:00 AM - 7:00 PM IST'}
              disabled={!isSuperAdmin}
              onChange={(e) => setSettings({ ...settings, operationalHours: e.target.value })}
            />
          </Box>
        </Paper>

        {/* External Service Integration Status */}
        <Paper elevation={1} sx={{ p: 3.5, borderRadius: '18px', bgcolor: '#FAF8F2', border: '1px solid rgba(201, 147, 37, 0.3)' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#013E18', mb: 0.5 }}>
            Service Integrations & Gateway Health
          </Typography>
          <Typography variant="caption" sx={{ color: '#536458', display: 'block', mb: 2.5 }}>
            Real-time status of backend subsystems and APIs. Secret tokens are never exposed in browser responses.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {Object.entries(settings.integrations || {
              database: 'MongoDB Production Cluster (Connected)',
              geminiAi: 'Configured & Active',
              emailSmtp: 'Not Configured (Operational Tokens Logged to Console)',
              paymentGateway: 'Manual Bank Transfer / UPI Direct Records (Live Gateway Mocked in Scope)',
            }).map(([name, status]) => (
              <Box key={name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#FFFFFF', borderRadius: '10px' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                  {name.replace(/([A-Z])/g, ' $1')}
                </Typography>
                <Chip
                  label={String(status)}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    bgcolor: String(status).includes('Connected') || String(status).includes('Active') ? '#ECFDF5' : '#FEF3C7',
                    color: String(status).includes('Connected') || String(status).includes('Active') ? '#065F46' : '#92400E',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Paper>

        {isSuperAdmin && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSaving}
              startIcon={<SaveIcon />}
              sx={{
                bgcolor: '#013E18',
                color: '#F5F2E9',
                fontWeight: 700,
                px: 3,
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                '&:hover': { bgcolor: '#00280F' },
              }}
            >
              {isSaving ? 'Saving Changes...' : 'Save System Settings'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

