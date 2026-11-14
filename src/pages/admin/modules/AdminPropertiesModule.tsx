import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArchiveIcon from '@mui/icons-material/Archive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';

import { api } from '../../../services/api';
import { Property, ListingStatus } from '../../../types/property';
import { AdminUser } from '../../../types/crm';
import { LanguageCode } from '../../../types/property';
import { formatPriceINR } from '../../../utils/propertyUtils';

interface AdminPropertiesModuleProps {
  currentUser: AdminUser;
  lang: LanguageCode;
}

export const AdminPropertiesModule: React.FC<AdminPropertiesModuleProps> = ({ currentUser, lang }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ListingStatus>('active');
  const [isVerified, setIsVerified] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProperties = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getProperties({}, 1, 100);
      setProperties(res.data || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch properties.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleOpenReview = (p: Property) => {
    setSelectedProperty(p);
    setReviewStatus(p.status);
    setIsVerified(Boolean(p.verified));
    setReviewNotes('');
    setReviewModalOpen(true);
  };

  const handleSaveReview = async () => {
    if (!selectedProperty) return;
    try {
      await api.updateProperty(selectedProperty.id, {
        status: reviewStatus,
        verified: isVerified,
      });
      setSuccessMessage(`Property "${selectedProperty.title.slice(0, 30)}..." updated successfully.`);
      setReviewModalOpen(false);
      fetchProperties();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const filtered = properties.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B' }}>
            {lang === 'ta' ? 'சொத்து பட்டியல் & சரிபார்ப்பு' : 'Property Inventory & Verification'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25 }}>
            Manage {properties.length} residential, agricultural, and commercial listings across Tamil Nadu.
          </Typography>
        </Box>
      </Box>

      {successMessage && <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: '12px' }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{errorMessage}</Alert>}

      {/* Filter Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by title, district, or locality..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ borderRadius: '10px' }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="active">Active (Published)</MenuItem>
            <MenuItem value="under-negotiation">Under Negotiation</MenuItem>
            <MenuItem value="sold">Sold</MenuItem>
            <MenuItem value="pending-review">Pending Review</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Properties Table */}
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
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Property Title</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Category / District</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Dimensions</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Price (INR)</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Approvals</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Status</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(24, 36, 27, 0.05)' }}>
                    <td style={{ padding: '14px 18px', maxWidth: 280 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#18241B' }}>
                        {p.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#536458' }}>
                        {p.location}, {p.district}
                      </Typography>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#18241B' }}>
                      <Chip label={p.category} size="small" sx={{ fontSize: '0.7rem', fontWeight: 600, mr: 1 }} />
                      <Chip label={p.ownershipType === 'company' ? 'Direct' : 'Broker'} size="small" sx={{ fontSize: '0.7rem', bgcolor: '#FAF8F2' }} />
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.82rem', fontWeight: 600, color: '#18241B' }}>
                      {p.plotArea} {p.plotAreaUnit}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#013E18' }}>
                      {formatPriceINR(p.price)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Chip
                        label={p.approvalAuthority || 'None'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: p.approvalAuthority ? '#FEF3C7' : '#F3F4F6',
                          color: p.approvalAuthority ? '#92400E' : '#6B7280',
                        }}
                      />
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Chip
                        label={p.status.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: p.status === 'active' ? '#ECFDF5' : '#FEF3C7',
                          color: p.status === 'active' ? '#065F46' : '#92400E',
                        }}
                      />
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenReview(p)}
                        sx={{
                          borderColor: '#013E18',
                          color: '#013E18',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          borderRadius: '8px',
                        }}
                      >
                        Review / Audit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Review Property & Verification
        </DialogTitle>
        <DialogContent dividers>
          {selectedProperty && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <Box sx={{ p: 2, bgcolor: '#FAF8F2', borderRadius: '12px' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18' }}>
                  {selectedProperty.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#536458' }}>
                  {selectedProperty.location}, {selectedProperty.district} • {formatPriceINR(selectedProperty.price)}
                </Typography>
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel>Publishing / Availability Status</InputLabel>
                <Select
                  value={reviewStatus}
                  label="Publishing / Availability Status"
                  onChange={(e) => setReviewStatus(e.target.value as ListingStatus)}
                >
                  <MenuItem value="active">Active (Published on Public Site)</MenuItem>
                  <MenuItem value="under-negotiation">Under Negotiation</MenuItem>
                  <MenuItem value="sold">Sold / Registered</MenuItem>
                  <MenuItem value="pending-review">Pending Internal Review</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                  Platform Verification Status
                </Typography>
                <Typography variant="caption" sx={{ color: '#536458', display: 'block', mb: 1.5 }}>
                  Note: Do not mark verified unless parent documents, patta transfer records, and survey maps have been checked by our legal desk.
                </Typography>
                <Button
                  variant={isVerified ? 'contained' : 'outlined'}
                  size="small"
                  color={isVerified ? 'success' : 'inherit'}
                  startIcon={<VerifiedUserIcon />}
                  onClick={() => setIsVerified(!isVerified)}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {isVerified ? 'Verified Platform Listing (Marked Active)' : 'Mark as Legally Verified'}
                </Button>
              </Box>

              <TextField
                multiline
                rows={3}
                label="Auditor / Legal Desk Review Notes"
                placeholder="Record title verification findings, Encumbrance Certificate number, or rejection reasons..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setReviewModalOpen(false)} sx={{ textTransform: 'none', color: '#536458' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveReview}
            sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, textTransform: 'none' }}
          >
            Save Verification & Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

