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
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddIcon from '@mui/icons-material/Add';
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

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B' }}>
          {lang === 'ta' ? 'முன்பதிவுகள் & கட்டண ஆவணங்கள்' : 'Property Bookings & Token Transactions'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#536458', mt: 0.25 }}>
          Manual RTGS/UPI instrument records with legal verification checkpoints. (Non-gateway manual records)
        </Typography>
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{successMessage}</Alert>}

      {/* Bookings Table */}
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
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Booking Reference</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Customer / Property</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Token Advance</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Total Deal Value</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Payment Status</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Booking Stage</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id || b.bookingNumber} style={{ borderBottom: '1px solid rgba(24, 36, 27, 0.05)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#013E18', fontFamily: 'monospace' }}>
                        {b.bookingNumber}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8B6413' }}>
                        {b.bookingDate}
                      </Typography>
                    </td>
                    <td style={{ padding: '14px 18px', maxWidth: 260 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B' }}>
                        {b.customerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#536458', display: 'block' }}>
                        {b.propertyTitle}
                      </Typography>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#013E18' }}>
                      {formatPriceINR(b.tokenAmount)}
                      <Typography variant="caption" sx={{ display: 'block', color: '#6B7280' }}>
                        {b.paymentMethod}
                      </Typography>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#18241B' }}>
                      {formatPriceINR(b.totalAmount)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Chip
                        label={(b.paymentStatus || 'pending').toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: b.paymentStatus === 'confirmed' || b.paymentStatus === 'paid' ? '#ECFDF5' : '#FEF3C7',
                          color: b.paymentStatus === 'confirmed' || b.paymentStatus === 'paid' ? '#065F46' : '#92400E',
                        }}
                      />
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Chip
                        label={(b.status || b.bookingStatus || 'draft').toUpperCase()}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenPaymentCorrection(b)}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                      >
                        Adjust / Audit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Payment Correction / Audit Modal */}
      <Dialog open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Audit Payment Record</DialogTitle>
        <DialogContent dividers>
          {selectedBooking && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
                Financial Policy: Confirmed payment adjustments require an audit reason. Reversals or confirmations are permanently logged.
              </Alert>

              <Box sx={{ p: 2, bgcolor: '#FAF8F2', borderRadius: '12px' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18' }}>
                  {selectedBooking.bookingNumber} • {selectedBooking.customerName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#18241B', fontWeight: 700 }}>
                  Token Recorded: {formatPriceINR(selectedBooking.tokenAmount)} ({selectedBooking.paymentMethod})
                </Typography>
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentStatusUpdate}
                  label="Payment Status"
                  onChange={(e) => setPaymentStatusUpdate(e.target.value as any)}
                >
                  <MenuItem value="pending">Pending Bank Verification</MenuItem>
                  <MenuItem value="partially-paid">Partially Paid</MenuItem>
                  <MenuItem value="paid">Confirmed / Token Received</MenuItem>
                  <MenuItem value="refunded">Refunded / Cancelled Deal</MenuItem>
                </Select>
              </FormControl>

              <TextField
                required
                multiline
                rows={3}
                label="Audit Note / Bank UTR Reference"
                placeholder="Enter RTGS UTR number or bank clearance confirmation code..."
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setPaymentModalOpen(false)} sx={{ textTransform: 'none', color: '#536458' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePaymentStatus}
            sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, textTransform: 'none' }}
          >
            Record Audit Adjustment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
