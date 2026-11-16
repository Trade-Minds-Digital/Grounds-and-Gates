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
  InputAdornment,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const paginatedCustomers = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Page Header */}
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
              {lang === 'ta' ? 'வாடிக்கையாளர் கோப்பக மேலாண்மை' : 'Customer Directory & Profiles'}
            </Typography>
            <Chip
              label={`${filtered.length} of ${customers.length} Clients`}
              size="small"
              sx={{ bgcolor: '#FAF8F2', color: '#013E18', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25, fontSize: '0.82rem' }}>
            Verified buyer and client profiles with preference portfolios and deal history.
          </Typography>
        </Box>
      </Box>

      {/* Search Bar */}
      <Paper elevation={0} sx={{ p: 1.75, mb: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)', display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by customer name, phone number, email, or city..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#536458', fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.84rem' } }}
        />
        {searchQuery && (
          <Button
            size="small"
            variant="text"
            onClick={() => setSearchQuery('')}
            startIcon={<FilterListOffIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', color: '#536458', fontWeight: 600, fontSize: '0.82rem', flexShrink: 0 }}
          >
            Clear
          </Button>
        )}
      </Paper>

      {/* Customer List */}
      {isLoading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={32} sx={{ color: '#013E18' }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
          <PersonIcon sx={{ fontSize: 44, color: '#9CA3AF', mb: 1.5 }} />
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#18241B', mb: 0.5 }}>
            No matching customers found
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mb: 2 }}>
            Try searching with a different name, phone, or location.
          </Typography>
          {searchQuery && (
            <Button variant="outlined" size="small" onClick={() => setSearchQuery('')} sx={{ textTransform: 'none', borderRadius: '8px' }}>
              Reset Search
            </Button>
          )}
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(24, 36, 27, 0.08)', bgcolor: '#FFFFFF' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#FAF8F2' }}>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Client Name</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Contact Details</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Budget Range</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCustomers.map((c) => (
                  <TableRow
                    key={c.id || c.referenceId}
                    hover
                    onClick={() => setSelectedCustomer(c)}
                    sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                  >
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#013E18', color: '#F5F2E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.80rem', flexShrink: 0 }}>
                          {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B', fontSize: '0.84rem', lineHeight: 1.2 }}>
                            {c.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#536458', fontSize: '0.70rem' }}>
                            Ref: {c.referenceId || c.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.80rem', color: '#18241B', fontWeight: 600 }}>
                        {c.phone}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#536458', display: 'block', fontSize: '0.72rem' }}>
                        {c.email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, fontSize: '0.80rem', color: '#18241B' }}>
                      {c.city || c.district || 'Tamil Nadu'}
                    </TableCell>
                    <TableCell sx={{ py: 1.5, fontWeight: 700, color: '#013E18', fontSize: '0.82rem' }}>
                      {c.budgetMin && c.budgetMax
                        ? `${formatPriceINR(c.budgetMin)} - ${formatPriceINR(c.budgetMax)}`
                        : 'Custom Profile'}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={c.isActive ? 'Active Client' : 'Inactive'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          height: 20,
                          bgcolor: c.isActive ? '#ECFDF5' : '#F3F4F6',
                          color: c.isActive ? '#065F46' : '#6B7280',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }} onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedCustomer(c)}
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          borderColor: 'rgba(1, 62, 24, 0.4)',
                          color: '#013E18',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          textTransform: 'none',
                          borderRadius: '6px',
                          py: 0.35,
                          px: 1,
                          '&:hover': { bgcolor: 'rgba(1, 62, 24, 0.05)', borderColor: '#013E18' },
                        }}
                      >
                        Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{ borderTop: '1px solid rgba(24, 36, 27, 0.08)' }}
          />
        </Paper>
      )}

      {/* Customer Detail Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        slotProps={{
          paper: {
            sx: { width: { xs: '100%', sm: 460 }, p: 3, bgcolor: '#FFFFFF' },
          },
        }}
      >
        {selectedCustomer && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, pb: 1.5, borderBottom: '1px solid rgba(24, 36, 27, 0.08)' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B', fontSize: '1.05rem' }}>
                Customer Profile
              </Typography>
              <IconButton size="small" onClick={() => setSelectedCustomer(null)} aria-label="Close profile">
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <Box sx={{ p: 2.5, bgcolor: '#FAF8F2', borderRadius: '12px', mb: 2.5, border: '1px solid rgba(201, 147, 37, 0.25)' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#013E18', fontSize: '1.1rem' }}>
                  {selectedCustomer.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8B6413', fontWeight: 700, display: 'block', mb: 1.5 }}>
                  Reference ID: {selectedCustomer.referenceId || selectedCustomer.id}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PhoneIcon sx={{ fontSize: 16, color: '#536458' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.84rem' }}>{selectedCustomer.phone}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EmailIcon sx={{ fontSize: 16, color: '#536458' }} />
                  <Typography variant="body2" sx={{ color: '#536458', fontSize: '0.84rem' }}>{selectedCustomer.email}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 16, color: '#536458' }} />
                  <Typography variant="body2" sx={{ color: '#536458', fontSize: '0.84rem' }}>{selectedCustomer.city || 'Coimbatore'}, Tamil Nadu</Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#18241B', fontSize: '0.88rem' }}>
                Preferred Property Categories
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2.5 }}>
                {(selectedCustomer.preferredCategories || ['residential-plots', 'villas']).map((cat) => (
                  <Chip key={cat} label={cat} size="small" sx={{ fontWeight: 600, bgcolor: '#FAF8F2', border: '1px solid rgba(24, 36, 27, 0.08)', fontSize: '0.72rem' }} />
                ))}
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#18241B', fontSize: '0.88rem' }}>
                Client Notes & Investment Horizon
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                <Typography variant="body2" sx={{ color: '#374151', fontSize: '0.84rem', lineHeight: 1.5 }}>
                  {selectedCustomer.notes || 'Looking for DTCP certified plots in Saravanampatti or Avinashi corridor. Immediate token ready upon legal clearance.'}
                </Typography>
              </Paper>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};
