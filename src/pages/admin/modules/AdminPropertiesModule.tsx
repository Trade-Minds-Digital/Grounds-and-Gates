import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
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
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  InputAdornment,
  Tooltip,
} from '@mui/material';

// Icons
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import BusinessIcon from '@mui/icons-material/Business';

import { api } from '../../../services/api';
import { Property, ListingStatus } from '../../../types/property';
import { AdminUser } from '../../../types/crm';
import { LanguageCode } from '../../../types/property';
import { formatPriceINR } from '../../../utils/propertyUtils';
import { PropertyLocationPicker, LocationPickerValue } from '../../../components/map/PropertyLocationPicker';

interface AdminPropertiesModuleProps {
  currentUser: AdminUser;
  lang: LanguageCode;
}

export const AdminPropertiesModule: React.FC<AdminPropertiesModuleProps> = ({ currentUser, lang }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<'all' | 'confirmed' | 'missing'>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTab, setReviewTab] = useState<'status' | 'location'>('status');
  const [reviewStatus, setReviewStatus] = useState<ListingStatus>('active');
  const [publishingStatus, setPublishingStatus] = useState<'published' | 'pending-review' | 'draft' | 'rejected' | 'archived'>('published');
  const [isVerified, setIsVerified] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [editLocation, setEditLocation] = useState<LocationPickerValue>({
    lat: 11.0168,
    lng: 76.9558,
    confirmed: false,
    isApproximate: false,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProperties = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getAdminProperties({}, 1, 100);
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
    setPublishingStatus((p as any).publishingStatus || ((p as any).published ? 'published' : 'pending-review'));
    setIsVerified(Boolean(p.verified));
    setReviewNotes('');
    setEditLocation({
      lat: p.coordinates?.lat || p.mapCoordinates?.lat || 11.0168,
      lng: p.coordinates?.lng || p.mapCoordinates?.lng || 76.9558,
      address: p.address || p.location,
      locality: p.locality || p.location,
      district: p.district,
      pincode: p.pincode,
      confirmed: Boolean(p.locationConfirmed),
      isApproximate: Boolean(p.isApproximateLocation),
    });
    setReviewTab('status');
    setReviewModalOpen(true);
  };

  const handleSaveReview = async () => {
    if (!selectedProperty) return;

    try {
      if (reviewTab === 'location' || editLocation.confirmed) {
        await api.updateProperty(selectedProperty.id, {
          coordinates: { lat: editLocation.lat, lng: editLocation.lng },
          locality: editLocation.locality || selectedProperty.locality,
          district: editLocation.district || selectedProperty.district,
          pincode: editLocation.pincode || selectedProperty.pincode,
          address: editLocation.address || selectedProperty.address,
          locationConfirmed: true,
          isApproximateLocation: Boolean(editLocation.isApproximate),
        });
      }

      await api.updatePropertyPublishStatus(selectedProperty.id, publishingStatus, reviewNotes, reviewNotes);

      setSuccessMessage(`Property "${selectedProperty.title.slice(0, 30)}..." updated successfully.`);
      setReviewModalOpen(false);
      fetchProperties();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const filtered = properties.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.district && p.district.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q));
    const statusVal = p.status || (p as any).publishingStatus || 'draft';
    const matchesStatus = statusFilter === 'all' || statusVal === statusFilter;
    const matchesLocation =
      locationFilter === 'all' ||
      (locationFilter === 'confirmed' && p.locationConfirmed) ||
      (locationFilter === 'missing' && !p.locationConfirmed);
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const paginatedProperties = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const isFiltering = searchQuery !== '' || statusFilter !== 'all' || locationFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setLocationFilter('all');
    setPage(0);
  };

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
              {lang === 'ta' ? 'சொத்து பட்டியல் & சரிபார்ப்பு' : 'Property Inventory & Verification'}
            </Typography>
            <Chip
              label={`${filtered.length} of ${properties.length} Listings`}
              size="small"
              sx={{ bgcolor: '#FAF8F2', color: '#013E18', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25, fontSize: '0.82rem' }}>
            Manage verified land layouts, multi-district sales inventory, legal approvals, and map coordinates.
          </Typography>
        </Box>
      </Box>

      {successMessage && <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2, borderRadius: '10px' }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{errorMessage}</Alert>}

      {/* Filter Bar */}
      <Paper elevation={0} sx={{ p: 1.75, mb: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)', display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search by title, district, or locality..."
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
          sx={{ flex: 1, minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.84rem' } }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ fontSize: '0.84rem' }}>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            sx={{ borderRadius: '8px', fontSize: '0.84rem' }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="active">Active (Published)</MenuItem>
            <MenuItem value="under-negotiation">Under Negotiation</MenuItem>
            <MenuItem value="sold">Sold</MenuItem>
            <MenuItem value="pending-review">Pending Review</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ fontSize: '0.84rem' }}>Location Status</InputLabel>
          <Select
            value={locationFilter}
            label="Location Status"
            onChange={(e) => { setLocationFilter(e.target.value as any); setPage(0); }}
            sx={{ borderRadius: '8px', fontSize: '0.84rem' }}
          >
            <MenuItem value="all">All Locations</MenuItem>
            <MenuItem value="confirmed">Confirmed Pin Only</MenuItem>
            <MenuItem value="missing">Location Missing Only</MenuItem>
          </Select>
        </FormControl>

        {isFiltering && (
          <Button
            size="small"
            variant="text"
            onClick={handleResetFilters}
            startIcon={<FilterListOffIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', color: '#536458', fontWeight: 600, fontSize: '0.82rem' }}
          >
            Reset
          </Button>
        )}
      </Paper>

      {/* Properties Table */}
      {isLoading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={32} sx={{ color: '#013E18' }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
          <BusinessIcon sx={{ fontSize: 44, color: '#9CA3AF', mb: 1.5 }} />
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#18241B', mb: 0.5 }}>
            No matching properties found
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mb: 2 }}>
            Try adjusting your search criteria or reset filters to display all listings.
          </Typography>
          {isFiltering && (
            <Button variant="outlined" size="small" onClick={handleResetFilters} sx={{ textTransform: 'none', borderRadius: '8px' }}>
              Reset Filters
            </Button>
          )}
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(24, 36, 27, 0.08)', bgcolor: '#FFFFFF' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#FAF8F2' }}>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Property Title</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Category / District</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Dimensions</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Price (INR)</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Approvals</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Map Pin</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProperties.map((p) => (
                  <TableRow key={p.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.5, maxWidth: 260 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B', fontSize: '0.84rem', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#536458', display: 'block', fontSize: '0.72rem' }}>
                        {p.location}, {p.district}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip label={p.category} size="small" sx={{ fontSize: '0.68rem', fontWeight: 600, mr: 0.5, height: 20 }} />
                      <Chip label={p.ownershipType === 'company' ? 'Direct' : 'Broker'} size="small" sx={{ fontSize: '0.68rem', bgcolor: '#FAF8F2', height: 20 }} />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, fontSize: '0.80rem', fontWeight: 600, color: '#18241B' }}>
                      {p.plotArea} {p.plotAreaUnit}
                    </TableCell>
                    <TableCell sx={{ py: 1.5, fontWeight: 800, color: '#013E18', fontSize: '0.84rem' }}>
                      {formatPriceINR(p.price)}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={p.approvalAuthority || 'None'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          height: 20,
                          bgcolor: p.approvalAuthority ? '#FEF3C7' : '#F3F4F6',
                          color: p.approvalAuthority ? '#92400E' : '#6B7280',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      {p.locationConfirmed ? (
                        <Chip
                          icon={<LocationOnIcon sx={{ fontSize: '13px !important' }} />}
                          label={p.isApproximateLocation ? 'Approx Pin' : 'Confirmed'}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            height: 20,
                            bgcolor: '#ECFDF5',
                            color: '#065F46',
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<EditLocationAltIcon sx={{ fontSize: '13px !important' }} />}
                          label="Missing Pin"
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            height: 20,
                            bgcolor: '#FEF3C7',
                            color: '#92400E',
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={(p.status || (p as any).publishingStatus || 'draft').toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          height: 20,
                          bgcolor: (p.status || (p as any).publishingStatus) === 'active' || (p as any).publishingStatus === 'published' ? '#ECFDF5' : '#FEF3C7',
                          color: (p.status || (p as any).publishingStatus) === 'active' || (p as any).publishingStatus === 'published' ? '#065F46' : '#92400E',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenReview(p)}
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
                        Review / Audit
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

      {/* Review Modal */}
      <Dialog
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: '16px' } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', pb: 1 }}>
          Review Property & Verification
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2.5 }}>
          {selectedProperty && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: '#FAF8F2', borderRadius: '10px', border: '1px solid rgba(201, 147, 37, 0.25)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#013E18', fontSize: '0.95rem' }}>
                  {selectedProperty.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#536458', display: 'block' }}>
                  Ref: {selectedProperty.referenceId || selectedProperty.id} • {selectedProperty.district}, Tamil Nadu • {formatPriceINR(selectedProperty.price)}
                </Typography>
              </Box>

              <Tabs
                value={reviewTab}
                onChange={(_, val) => setReviewTab(val)}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  minHeight: 40,
                  '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.82rem', minHeight: 40 },
                  '& .Mui-selected': { color: '#013E18' },
                  '& .MuiTabs-indicator': { backgroundColor: '#013E18' },
                }}
              >
                <Tab label="Verification & Status" value="status" />
                <Tab
                  label={
                    editLocation.confirmed
                      ? 'Geospatial Pin (Confirmed)'
                      : 'Geospatial Pin (Needs Pin)'
                  }
                  value="location"
                  icon={editLocation.confirmed ? <LocationOnIcon sx={{ fontSize: 16 }} /> : <EditLocationAltIcon sx={{ fontSize: 16 }} />}
                  iconPosition="end"
                />
              </Tabs>

              {reviewTab === 'status' ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Publication State</InputLabel>
                    <Select
                      value={publishingStatus}
                      label="Publication State"
                      onChange={(e) => setPublishingStatus(e.target.value as any)}
                      sx={{ borderRadius: '8px' }}
                    >
                      <MenuItem value="published">Published (Live on Public Portal)</MenuItem>
                      <MenuItem value="pending-review">Pending Administrative Review</MenuItem>
                      <MenuItem value="draft">Draft (Private)</MenuItem>
                      <MenuItem value="rejected">Rejected (Changes Required)</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Commercial Availability</InputLabel>
                    <Select
                      value={reviewStatus}
                      label="Commercial Availability"
                      onChange={(e) => setReviewStatus(e.target.value as ListingStatus)}
                      sx={{ borderRadius: '8px' }}
                    >
                      <MenuItem value="active">Available</MenuItem>
                      <MenuItem value="under-negotiation">Under Negotiation</MenuItem>
                      <MenuItem value="sold">Sold / Registered</MenuItem>
                      <MenuItem value="pending-review">Pending Transaction Clearance</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: '10px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, fontSize: '0.85rem' }}>
                      Platform Verification Status
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#536458', display: 'block', mb: 1.25 }}>
                      Note: Do not mark verified unless parent documents, patta transfer records, and survey maps have been checked by our legal desk.
                    </Typography>
                    <Button
                      variant={isVerified ? 'contained' : 'outlined'}
                      size="small"
                      color={isVerified ? 'success' : 'inherit'}
                      startIcon={<VerifiedUserIcon sx={{ fontSize: 18 }} />}
                      onClick={() => setIsVerified(!isVerified)}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', fontSize: '0.80rem' }}
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
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" sx={{ color: '#536458', mb: 1.5, fontSize: '0.82rem' }}>
                    Drag the pin, search for specific street landmarks, or enter exact GPS coordinates. Marking as approximate protects exact seller privacy on public listing detail pages.
                  </Typography>
                  <PropertyLocationPicker
                    value={editLocation}
                    onChange={(val) => setEditLocation(val)}
                    lang={lang}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            size="small"
            startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
            onClick={() => {
              if (selectedProperty) {
                const target = selectedProperty.slug || (selectedProperty as any).referenceId || selectedProperty.id;
                window.open(`/seller/preview/${target}`, '_blank');
              }
            }}
            sx={{ textTransform: 'none', color: '#013E18', fontWeight: 700, fontSize: '0.82rem' }}
          >
            Staff Preview
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" onClick={() => setReviewModalOpen(false)} sx={{ textTransform: 'none', color: '#536458', fontSize: '0.82rem' }}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSaveReview}
              sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, textTransform: 'none', borderRadius: '8px', fontSize: '0.82rem', '&:hover': { bgcolor: '#00280F' } }}
            >
              Save Verification & Status
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
