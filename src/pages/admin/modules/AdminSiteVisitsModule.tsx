import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
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
    // Check conflict: does any existing visit match this date and slot?
    const conflict = visits.find((v) => v.date === date && v.timeSlot === timeSlot && v.status === 'scheduled');
    if (conflict) {
      setConflictWarning(`Scheduling Conflict: Executive already has a visit scheduled for ${conflict.customerName} on ${date} (${timeSlot} slot).`);
    } else {
      setConflictWarning(null);
    }
  };

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitData.customerName || !newVisitData.customerPhone) {
      alert('Please fill customer name and phone.');
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
      fetchVisits();
    } catch (e: any) {
      alert(`Failed to schedule visit: ${e.message}`);
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B' }}>
            {lang === 'ta' ? 'தள ஆய்வுகள் & வாகன திட்டமிடல்' : 'Site Visits & Escorted Inspections'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25 }}>
            Operational time zone: Asia/Kolkata (IST). Conflict checks enforce dedicated executive assignments.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setScheduleModalOpen(true)}
          sx={{
            bgcolor: '#013E18',
            color: '#F5F2E9',
            fontWeight: 700,
            borderRadius: '10px',
            textTransform: 'none',
            '&:hover': { bgcolor: '#00280F' },
          }}
        >
          Schedule Inspection
        </Button>
      </Box>

      {/* Visits Table */}
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
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Property Title</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Date & Slot (IST)</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Status</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Notes & Instructions</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id || v.referenceId} style={{ borderBottom: '1px solid rgba(24, 36, 27, 0.05)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B' }}>
                        {v.customerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#536458' }}>
                        {v.customerPhone}
                      </Typography>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: '#18241B', maxWidth: 240 }}>
                      {v.propertyTitle}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonthIcon sx={{ fontSize: 16, color: '#013E18' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#013E18' }}>
                          {v.date}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ textTransform: 'capitalize', color: '#8B6413', fontWeight: 600 }}>
                        {v.timeSlot} slot
                      </Typography>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Chip
                        label={v.status.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: v.status === 'completed' ? '#ECFDF5' : v.status === 'scheduled' ? '#E0F2FE' : '#FEE2E2',
                          color: v.status === 'completed' ? '#065F46' : v.status === 'scheduled' ? '#0369A1' : '#991B1B',
                        }}
                      />
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: '#536458', maxWidth: 220 }}>
                      {v.notes || v.feedback || 'Client requested parent legal documents during inspection.'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {v.status === 'scheduled' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={() => handleUpdateStatus(v.id || v.referenceId || '', 'completed')}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                        >
                          Mark Completed
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Schedule Visit Modal */}
      <Dialog open={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Schedule On-Site Inspection</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {conflictWarning && (
              <Alert severity="warning" icon={<WarningAmberIcon />}>
                {conflictWarning}
              </Alert>
            )}

            <TextField
              required
              label="Customer / Buyer Name"
              value={newVisitData.customerName}
              onChange={(e) => setNewVisitData({ ...newVisitData, customerName: e.target.value })}
            />

            <TextField
              required
              label="Contact Phone Number"
              value={newVisitData.customerPhone}
              onChange={(e) => setNewVisitData({ ...newVisitData, customerPhone: e.target.value })}
            />

            <TextField
              label="Property Title"
              value={newVisitData.propertyTitle}
              onChange={(e) => setNewVisitData({ ...newVisitData, propertyTitle: e.target.value })}
            />

            <TextField
              required
              type="date"
              label="Visit Date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={newVisitData.date}
              onChange={(e) => {
                setNewVisitData({ ...newVisitData, date: e.target.value });
                handleDateOrSlotChange(e.target.value, newVisitData.timeSlot);
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Preferred Time Slot (Asia/Kolkata)</InputLabel>
              <Select
                value={newVisitData.timeSlot}
                label="Preferred Time Slot (Asia/Kolkata)"
                onChange={(e) => {
                  setNewVisitData({ ...newVisitData, timeSlot: e.target.value as any });
                  handleDateOrSlotChange(newVisitData.date, e.target.value);
                }}
              >
                <MenuItem value="morning">Morning (9:30 AM - 12:30 PM)</MenuItem>
                <MenuItem value="afternoon">Afternoon (1:30 PM - 4:30 PM)</MenuItem>
                <MenuItem value="evening">Evening (4:30 PM - 6:30 PM)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              multiline
              rows={2}
              label="Inspection Notes / Vehicle Pick-up Location"
              value={newVisitData.notes}
              onChange={(e) => setNewVisitData({ ...newVisitData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setScheduleModalOpen(false)} sx={{ textTransform: 'none', color: '#536458' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleScheduleVisit}
            sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, textTransform: 'none' }}
          >
            Confirm Inspection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
