import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
  Drawer,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import { api } from '../../../services/api';
import { AdminUser, CrmCustomer } from '../../../types/crm';
import { LanguageCode } from '../../../types/property';
import { formatPriceINR } from '../../../utils/propertyUtils';

interface AdminCustomersModuleProps {
  currentUser: AdminUser;
  lang: LanguageCode;
}

export const AdminCustomersModule: React.FC<AdminCustomersModuleProps> = ({ currentUser, lang }) => {
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CrmCustomer | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCustomers();
      setCustomers(res || []);
    } catch (e) {
      console.warn('Failed to fetch customers:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B' }}>
          {lang === 'ta' ? 'வாடிக்கையாளர் கோப்பக மேலாண்மை' : 'Customer Directory & Profiles'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#536458', mt: 0.25 }}>
          Verified buyer and client profiles with preference portfolios and deal history.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by customer name, phone number, email, or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#536458', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />
      </Paper>

      {/* Customer List */}
      {isLoading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={36} sx={{ color: '#013E18' }} />
        </Box>
      ) : (
        <Paper elevation={1} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid rgba(24, 36, 27, 0.08)' }}>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Client Name</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Contact Details</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Location</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Budget Range</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Status</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id || c.referenceId}
                    style={{ borderBottom: '1px solid rgba(24, 36, 27, 0.05)', cursor: 'pointer' }}
                    onClick={() => setSelectedCustomer(c)}
                  >
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#18241B' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: '#013E18', color: '#F5F2E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                          {c.name ? c.name.charAt(0) : 'C'}
                        </Box>
                        <span>{c.name}</span>
                      </Box>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#536458' }}>
                      <div>{c.phone}</div>
                      <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#18241B' }}>
                      {c.city || c.district || 'Tamil Nadu'}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#013E18', fontSize: '0.82rem' }}>
                      {c.budgetMin && c.budgetMax
                        ? `${formatPriceINR(c.budgetMin)} - ${formatPriceINR(c.budgetMax)}`
                        : 'Custom Profile'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Chip
                        label={c.isActive ? 'Active Client' : 'Inactive'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: c.isActive ? '#ECFDF5' : '#F3F4F6',
                          color: c.isActive ? '#065F46' : '#6B7280',
                        }}
                      />
                    </td>
                    <td style={{ padding: '14px 18px' }} onClick={(e) => e.stopPropagation()}>
                      <Button size="small" onClick={() => setSelectedCustomer(c)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                        View Profile →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Customer Detail Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        slotProps={{
          paper: {
            sx: { width: { xs: '100%', sm: 460 }, p: 3.5, bgcolor: '#FFFFFF' },
          },
        }}
      >
        {selectedCustomer && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
                Customer Profile
              </Typography>
              <IconButton size="small" onClick={() => setSelectedCustomer(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ p: 3, bgcolor: '#FAF8F2', borderRadius: '16px', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#013E18' }}>
                {selectedCustomer.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#8B6413', fontWeight: 700, display: 'block', mb: 1.5 }}>
                Reference ID: {selectedCustomer.referenceId || selectedCustomer.id}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <PhoneIcon sx={{ fontSize: 16, color: '#536458' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedCustomer.phone}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <EmailIcon sx={{ fontSize: 16, color: '#536458' }} />
                <Typography variant="body2" sx={{ color: '#536458' }}>{selectedCustomer.email}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: '#536458' }} />
                <Typography variant="body2" sx={{ color: '#536458' }}>{selectedCustomer.city || 'Coimbatore'}, Tamil Nadu</Typography>
              </Box>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              Preferred Property Categories
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {(selectedCustomer.preferredCategories || ['residential-plots', 'villas']).map((cat) => (
                <Chip key={cat} label={cat} size="small" sx={{ fontWeight: 600, bgcolor: '#FAF8F2' }} />
              ))}
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              Client Notes & Investment Horizon
            </Typography>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: '10px', mb: 3, border: '1px solid #E5E7EB' }}>
              <Typography variant="body2" sx={{ color: '#374151' }}>
                {selectedCustomer.notes || 'Looking for DTCP certified plots in Saravanampatti or Avinashi corridor. Immediate token ready upon legal clearance.'}
              </Typography>
            </Paper>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};
