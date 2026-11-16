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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import { api } from '../../../services/api';
import { AdminUser, CrmSiteVisit } from '../../../types/crm';
import { LanguageCode } from '../../../types/property';

interface AdminSiteVisitsModuleProps {
  currentUser: AdminUser;
  lang: LanguageCode;
}

export const AdminSiteVisitsModule: React.FC<AdminSiteVisitsModuleProps> = ({ currentUser, lang }) => {
  const [visits, setVisits] = useState<CrmSiteVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [newVisitData, setNewVisitData] = useState({
    customerName: '',
    customerPhone: '',
    propertyTitle: 'DTCP Grand Gated Villa Plot, Saravanampatti',
    propertyId: 'gg-cbe-plot-01',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSlot: 'morning' as 'morning' | 'afternoon' | 'evening',
    notes: '',
  });
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchVisits = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSiteVisits();
      setVisits(res || []);
    } catch (e) {
      console.warn('Failed to load visits:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleDateOrSlotChange = (date: string, timeSlot: string) => {
    const conflict = visits.find((v) => v.date === date && v.timeSlot === timeSlot && v.status === 'scheduled');
    if (conflict) {
      setConflictWarning(`Scheduling Conflict: Executive already has a visit scheduled for ${conflict.customerName} on ${date} (${timeSlot} slot).`);
    } else {
      setConflictWarning(null);
    }
  };

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!newVisitData.customerName.trim() || !newVisitData.customerPhone.trim()) {
      setFormError('Please enter both customer name and phone number.');
      return;
    }

    try {
      await api.createSiteVisit({
        ...newVisitData,
        id: `visit-${Date.now()}`,
        status: 'scheduled',
        assignedEmployeeId: currentUser.id || 'emp-senthil-01',
        assignedEmployeeName: currentUser.fullName || 'Executive',
        transportProvided: true,
      });
      setScheduleModalOpen(false);
      setNewVisitData({
        customerName: '',
        customerPhone: '',
        propertyTitle: 'DTCP Grand Gated Villa Plot, Saravanampatti',
        propertyId: 'gg-cbe-plot-01',
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        timeSlot: 'morning',
        notes: '',
      });
      fetchVisits();
    } catch (e: any) {
      setFormError(`Failed to schedule visit: ${e.message}`);
    }
  };

  const handleUpdateStatus = async (visitId: string, status: string) => {
    try {
      await api.updateSiteVisit(visitId, { status: status as any });
      fetchVisits();
    } catch (e: any) {
      alert(`Update failed: ${e.message}`);
    }
  };

  const paginatedVisits = visits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              {lang === 'ta' ? 'தள ஆய்வுகள் & வாகன திட்டமிடல்' : 'Site Visits & Escorted Inspections'}
            </Typography>
            <Chip
              label={`${visits.length} Scheduled Visits`}
              size="small"
              sx={{ bgcolor: '#FAF8F2', color: '#013E18', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25, fontSize: '0.82rem' }}>
            Operational time zone: Asia/Kolkata (IST). Conflict checks enforce dedicated executive assignments.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          onClick={() => { setFormError(null); setScheduleModalOpen(true); }}
          sx={{
            bgcolor: '#013E18',
            color: '#F5F2E9',
            fontWeight: 700,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '0.82rem',
            py: 0.6,
            px: 1.75,
            '&:hover': { bgcolor: '#00280F' },
          }}
        >
          Schedule Inspection
        </Button>
      </Box>

      {/* Visits Table */}
      {isLoading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={32} sx={{ color: '#013E18' }} />
        </Box>
      ) : visits.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
          <EventAvailableIcon sx={{ fontSize: 44, color: '#9CA3AF', mb: 1.5 }} />
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#18241B', mb: 0.5 }}>
            No site visits scheduled
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mb: 2 }}>
            Schedule inspections with client contact details, preferred property, and date/slot.
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => { setFormError(null); setScheduleModalOpen(true); }}
            sx={{ bgcolor: '#013E18', textTransform: 'none', borderRadius: '8px', fontWeight: 700 }}
          >
            Schedule Inspection
          </Button>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(24, 36, 27, 0.08)', bgcolor: '#FFFFFF' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#FAF8F2' }}>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Client Name</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Property Title</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Date & Slot (IST)</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Notes & Instructions</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedVisits.map((v) => (
                  <TableRow key={v.id || v.referenceId} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B', fontSize: '0.84rem' }}>
                        {v.customerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#536458', fontSize: '0.72rem' }}>
                        {v.customerPhone}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, maxWidth: 240 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#18241B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.propertyTitle}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <CalendarMonthIcon sx={{ fontSize: 15, color: '#013E18' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#013E18', fontSize: '0.80rem' }}>
                          {v.date}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ textTransform: 'capitalize', color: '#8B6413', fontWeight: 600, fontSize: '0.70rem' }}>
                        {v.timeSlot} slot
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={(v.status || 'scheduled').toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          height: 20,
                          bgcolor: v.status === 'completed' ? '#ECFDF5' : v.status === 'scheduled' ? '#E0F2FE' : '#FEE2E2',
                          color: v.status === 'completed' ? '#065F46' : v.status === 'scheduled' ? '#0369A1' : '#991B1B',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, maxWidth: 220 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#536458', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.notes || v.feedback || 'Client requested parent legal documents during inspection.'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      {v.status === 'scheduled' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={() => handleUpdateStatus(v.id || v.referenceId || '', 'completed')}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', fontSize: '0.74rem', py: 0.35, px: 1 }}
                        >
                          Mark Completed
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={visits.length}
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

      {/* Schedule Visit Modal */}
      <Dialog
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: '16px' } },
        }}
      >
        <form onSubmit={handleScheduleVisit}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', pb: 1 }}>
            Schedule Client Site Visit
          </DialogTitle>
          <DialogContent dividers sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {formError && (
                <Alert severity="error" sx={{ borderRadius: '8px', fontSize: '0.84rem' }}>
                  {formError}
                </Alert>
              )}

              {conflictWarning && (
                <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ borderRadius: '8px', fontSize: '0.84rem' }}>
                  {conflictWarning}
                </Alert>
              )}

              <TextField
                required
                fullWidth
                size="small"
                label="Customer Full Name"
                value={newVisitData.customerName}
                onChange={(e) => setNewVisitData({ ...newVisitData, customerName: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />

              <TextField
                required
                fullWidth
                size="small"
                label="Customer Phone Number (+91)"
                value={newVisitData.customerPhone}
                onChange={(e) => setNewVisitData({ ...newVisitData, customerPhone: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />

              <TextField
                fullWidth
                size="small"
                label="Property / Layout Title"
                value={newVisitData.propertyTitle}
                onChange={(e) => setNewVisitData({ ...newVisitData, propertyTitle: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  required
                  type="date"
                  size="small"
                  label="Inspection Date"
                  value={newVisitData.date}
                  onChange={(e) => {
                    const d = e.target.value;
                    setNewVisitData({ ...newVisitData, date: d });
                    handleDateOrSlotChange(d, newVisitData.timeSlot);
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />

                <FormControl size="small">
                  <InputLabel>Preferred Time Slot</InputLabel>
                  <Select
                    value={newVisitData.timeSlot}
                    label="Preferred Time Slot"
                    onChange={(e) => {
                      const slot = e.target.value as any;
                      setNewVisitData({ ...newVisitData, timeSlot: slot });
                      handleDateOrSlotChange(newVisitData.date, slot);
                    }}
                    sx={{ borderRadius: '8px' }}
                  >
                    <MenuItem value="morning">Morning (09:30 AM - 12:30 PM)</MenuItem>
                    <MenuItem value="afternoon">Afternoon (01:30 PM - 04:30 PM)</MenuItem>
                    <MenuItem value="evening">Evening (04:30 PM - 06:30 PM)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Inspection Notes / Vehicle Logistics"
                placeholder="Escort vehicle requested from Coimbatore office..."
                value={newVisitData.notes}
                onChange={(e) => setNewVisitData({ ...newVisitData, notes: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button size="small" onClick={() => setScheduleModalOpen(false)} sx={{ textTransform: 'none', color: '#536458', fontSize: '0.82rem' }}>
              Cancel
            </Button>
            <Button
              size="small"
              type="submit"
              variant="contained"
              sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, textTransform: 'none', borderRadius: '8px', fontSize: '0.82rem', '&:hover': { bgcolor: '#00280F' } }}
            >
              Confirm Site Visit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
