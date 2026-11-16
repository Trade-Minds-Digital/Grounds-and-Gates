import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { api } from '../../../services/api';
import { AdminUser, CrmBooking } from '../../../types/crm';
import { LanguageCode } from '../../../types/property';
import { formatPriceINR } from '../../../utils/propertyUtils';

interface AdminBookingsModuleProps {
  currentUser: AdminUser;
  lang: LanguageCode;
}

export const AdminBookingsModule: React.FC<AdminBookingsModuleProps> = ({ currentUser, lang }) => {
  const [bookings, setBookings] = useState<CrmBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<CrmBooking | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [paymentStatusUpdate, setPaymentStatusUpdate] = useState<'pending' | 'partially-paid' | 'confirmed' | 'failed' | 'refunded'>('confirmed');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBookings();
      setBookings(res || []);
    } catch (e) {
      console.warn('Failed to load bookings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenPaymentCorrection = (b: CrmBooking) => {
    setSelectedBooking(b);
    setPaymentStatusUpdate(b.paymentStatus === 'paid' ? 'confirmed' : (b.paymentStatus || 'pending') as any);
    setCorrectionNotes('');
    setPaymentModalOpen(true);
  };

  const handleSavePaymentStatus = async () => {
    if (!selectedBooking) return;
    try {
      await api.updateBooking(selectedBooking.id || selectedBooking.bookingNumber, {
        paymentStatus: paymentStatusUpdate as any,
        notes: `${selectedBooking.notes || ''}\n[Audit Record]: Payment status updated to ${paymentStatusUpdate} by ${currentUser.email}. Reason: ${correctionNotes}`,
      });
      setPaymentModalOpen(false);
      setSuccessMessage('Payment record and audit adjustment logged successfully.');
      fetchBookings();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      alert(`Update failed: ${e.message}`);
    }
  };

  const totalTokenINR = bookings.reduce((sum, b) => sum + (b.tokenAmount || 0), 0);
  const paginatedBookings = bookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Header Bar */}
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
              {lang === 'ta' ? 'முன்பதிவுகள் & கட்டணங்கள்' : 'Bookings & Token Receipts'}
            </Typography>
            <Chip
              label={`${bookings.length} Records`}
              size="small"
              sx={{ bgcolor: '#FAF8F2', color: '#013E18', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
            />
            <Chip
              label={`Token Total: ${formatPriceINR(totalTokenINR)}`}
              size="small"
              sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25, fontSize: '0.82rem' }}>
            Official token collections and contract commitments. Manual receipts logged under financial audit controls.
          </Typography>
        </Box>
      </Box>

      {successMessage && <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2, borderRadius: '10px' }}>{successMessage}</Alert>}

      {/* Bookings Table */}
      {isLoading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={32} sx={{ color: '#013E18' }} />
        </Box>
      ) : bookings.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
          <ReceiptLongIcon sx={{ fontSize: 44, color: '#9CA3AF', mb: 1.5 }} />
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#18241B', mb: 0.5 }}>
            No booking tokens recorded
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458' }}>
            Bookings are initiated when a customer signs an agreement or deposits a token advance for a verified property.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(24, 36, 27, 0.08)', bgcolor: '#FFFFFF' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#FAF8F2' }}>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Booking Ref / Date</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Buyer & Property</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Token Advance</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Agreed Deal Value</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Payment Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBookings.map((b) => (
                  <TableRow key={b.id || b.bookingNumber} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#013E18', fontSize: '0.84rem' }}>
                        {b.bookingNumber}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#536458', fontSize: '0.72rem' }}>
                        {b.bookingDate || '2026-03-01'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, maxWidth: 260 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B', fontSize: '0.84rem' }}>
                        {b.customerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#536458', display: 'block', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.propertyTitle}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, fontWeight: 800, color: '#013E18', fontSize: '0.84rem' }}>
                      {formatPriceINR(b.tokenAmount)}
                    </TableCell>
                    <TableCell sx={{ py: 1.5, fontWeight: 700, color: '#18241B', fontSize: '0.82rem' }}>
                      {formatPriceINR(b.totalAmount)}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={(b.paymentStatus || 'pending').toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          height: 20,
                          bgcolor: b.paymentStatus === 'confirmed' || b.paymentStatus === 'paid' ? '#ECFDF5' : b.paymentStatus === 'partially-paid' ? '#FEF3C7' : '#F3F4F6',
                          color: b.paymentStatus === 'confirmed' || b.paymentStatus === 'paid' ? '#065F46' : b.paymentStatus === 'partially-paid' ? '#92400E' : '#6B7280',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenPaymentCorrection(b)}
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
                        Adjust / Audit
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
            count={bookings.length}
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

      {/* Payment Correction Modal */}
      <Dialog
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: '16px' } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', pb: 1 }}>
          Payment & Token Adjustment
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2.5 }}>
          {selectedBooking && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: '#FAF8F2', borderRadius: '10px', border: '1px solid rgba(201, 147, 37, 0.25)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18', fontSize: '0.90rem' }}>
                  Booking Ref: {selectedBooking.bookingNumber}
                </Typography>
                <Typography variant="caption" sx={{ color: '#536458', display: 'block' }}>
                  Client: {selectedBooking.customerName} • Token: {formatPriceINR(selectedBooking.tokenAmount)} • Total: {formatPriceINR(selectedBooking.totalAmount)}
                </Typography>
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel>Payment Clearance Status</InputLabel>
                <Select
                  value={paymentStatusUpdate}
                  label="Payment Clearance Status"
                  onChange={(e) => setPaymentStatusUpdate(e.target.value as any)}
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="confirmed">Confirmed (Bank Clearance Received)</MenuItem>
                  <MenuItem value="partially-paid">Partially Paid</MenuItem>
                  <MenuItem value="pending">Pending Clearance</MenuItem>
                  <MenuItem value="refunded">Refunded (Token Returned)</MenuItem>
                  <MenuItem value="failed">Failed / Bounced</MenuItem>
                </Select>
              </FormControl>

              <TextField
                required
                fullWidth
                multiline
                rows={3}
                size="small"
                label="Manager Audit Justification"
                placeholder="NEFT transaction reference number, bank UTR, or clearance reason..."
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button size="small" onClick={() => setPaymentModalOpen(false)} sx={{ textTransform: 'none', color: '#536458', fontSize: '0.82rem' }}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleSavePaymentStatus}
            sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, textTransform: 'none', borderRadius: '8px', fontSize: '0.82rem', '&:hover': { bgcolor: '#00280F' } }}
          >
            Save Adjustment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
