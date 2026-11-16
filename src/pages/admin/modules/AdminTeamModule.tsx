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
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Tooltip,
} from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import { api } from '../../../services/api';
import { AdminUser } from '../../../types/crm';
import { LanguageCode, UserRole } from '../../../types/property';
import { getRoleDisplayName } from '../../../utils/rbac';

interface AdminTeamModuleProps {
  currentUser: AdminUser;
  lang: LanguageCode;
}

export const AdminTeamModule: React.FC<AdminTeamModuleProps> = ({ currentUser, lang }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedUserForReassign, setSelectedUserForReassign] = useState<AdminUser | null>(null);
  const [targetStaffId, setTargetStaffId] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [newStaffData, setNewStaffData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    role: 'sales-executive' as UserRole,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getStaffUsers();
      setUsers(res || []);
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to load staff list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffData.fullName || !newStaffData.email || !newStaffData.password) return;

    try {
      await api.createStaffUser(newStaffData);
      setCreateModalOpen(false);
      setSuccessMessage(`Staff member ${newStaffData.fullName} successfully registered.`);
      setNewStaffData({
        fullName: '',
        email: '',
        mobile: '',
        password: '',
        role: 'sales-executive',
      });
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (e: any) {
      alert(`Staff creation failed: ${e.message}`);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = user.accountStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.updateStaffStatus(user.id || (user as any)._id, nextStatus);
      setSuccessMessage(`Account for ${user.fullName} marked as ${(nextStatus || '').toUpperCase()}`);
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      alert(`Status update failed: ${e.message}`);
    }
  };

  const handleReassignRecords = async () => {
    if (!selectedUserForReassign || !targetStaffId) return;
    try {
      await api.reassignStaffRecords(
        selectedUserForReassign.id || (selectedUserForReassign as any)._id,
        targetStaffId
      );
      setReassignModalOpen(false);
      setSuccessMessage(`All assigned records successfully transferred.`);
      fetchUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      alert(`Reassignment failed: ${e.message}`);
    }
  };

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              {lang === 'ta' ? 'பணியாளர் குழு & அணுகல் அனுமதிகள்' : 'Staff Team & Access Permissions'}
            </Typography>
            <Chip
              label={`${users.length} Active Staff`}
              size="small"
              sx={{ bgcolor: '#FAF8F2', color: '#013E18', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25, fontSize: '0.82rem' }}>
            Role-Based Access Control (RBAC). Only Super Admin can promote staff to privileged tiers.
          </Typography>
        </Box>

        {currentUser.role === 'super-admin' && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            onClick={() => setCreateModalOpen(true)}
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
            Create Staff Member
          </Button>
        )}
      </Box>

      {successMessage && <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2, borderRadius: '10px' }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{errorMessage}</Alert>}

      {/* Users Table */}
      {isLoading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={32} sx={{ color: '#013E18' }} />
        </Box>
      ) : users.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
          <ManageAccountsIcon sx={{ fontSize: 44, color: '#9CA3AF', mb: 1.5 }} />
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#18241B', mb: 0.5 }}>
            No staff records loaded
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458' }}>
            Ensure the backend REST service is connected to MongoDB.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(24, 36, 27, 0.08)', bgcolor: '#FFFFFF' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#FAF8F2' }}>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Staff Member</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Contact Number</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Account Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Permissions Overview</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Management</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((u) => (
                  <TableRow key={u.id || (u as any)._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B', fontSize: '0.84rem' }}>
                        {u.fullName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#536458', fontSize: '0.72rem' }}>
                        {u.email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={getRoleDisplayName(u.role, lang)}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.70rem',
                          height: 22,
                          bgcolor: u.role === 'super-admin' ? '#FEF3C7' : '#FAF8F2',
                          color: u.role === 'super-admin' ? '#92400E' : '#013E18',
                          border: '1px solid rgba(24, 36, 27, 0.1)',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, fontSize: '0.80rem', color: '#18241B' }}>
                      {u.mobile || '+91 98422 71000'}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={(u.accountStatus || 'active').toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          height: 20,
                          bgcolor: u.accountStatus === 'active' ? '#ECFDF5' : '#FEE2E2',
                          color: u.accountStatus === 'active' ? '#065F46' : '#991B1B',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, maxWidth: 220 }}>
                      <Typography variant="caption" sx={{ color: '#536458', display: 'block', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.role === 'super-admin' && 'Full CRM, Users, Settings & Audit Logs'}
                        {u.role === 'admin' && 'All CRM modules, Team, Reports & Content'}
                        {u.role === 'sales-manager' && 'Leads, Site Visits, Bookings, Team Reports'}
                        {u.role === 'sales-executive' && 'Assigned Leads, Inspections & Follow-ups'}
                        {u.role === 'listing-manager' && 'Properties, Projects, Masters & Content'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      {currentUser.role === 'super-admin' && u.id !== currentUser.id && (
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Transfer / Reassign CRM Records">
                            <IconButton
                              size="small"
                              onClick={() => { setSelectedUserForReassign(u); setReassignModalOpen(true); }}
                              sx={{ color: '#536458', p: 0.5 }}
                              aria-label="Reassign records"
                            >
                              <SwapHorizIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={u.accountStatus === 'active' ? 'Deactivate Account' : 'Reactivate Account'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(u)}
                              sx={{ color: u.accountStatus === 'active' ? '#BE123C' : '#059669', p: 0.5 }}
                              aria-label={u.accountStatus === 'active' ? 'Deactivate' : 'Reactivate'}
                            >
                              <BlockIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
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
            count={users.length}
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

      {/* Create Staff Modal */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: '16px' } },
        }}
      >
        <form onSubmit={handleCreateStaff}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', pb: 1 }}>
            Provision New Staff Account
          </DialogTitle>
          <DialogContent dividers sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                size="small"
                label="Full Legal Name"
                placeholder="e.g. Senthil Kumar"
                value={newStaffData.fullName}
                onChange={(e) => setNewStaffData({ ...newStaffData, fullName: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />

              <TextField
                required
                type="email"
                fullWidth
                size="small"
                label="Staff Corporate Email"
                placeholder="senthil@groundsandgates.com"
                value={newStaffData.email}
                onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />

              <TextField
                required
                fullWidth
                size="small"
                label="Mobile Phone Number"
                placeholder="+91 98422 71000"
                value={newStaffData.mobile}
                onChange={(e) => setNewStaffData({ ...newStaffData, mobile: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />

              <TextField
                required
                type="password"
                fullWidth
                size="small"
                label="Initial Password"
                placeholder="••••••••••••"
                value={newStaffData.password}
                onChange={(e) => setNewStaffData({ ...newStaffData, password: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Assigned Role Tier</InputLabel>
                <Select
                  value={newStaffData.role}
                  label="Assigned Role Tier"
                  onChange={(e) => setNewStaffData({ ...newStaffData, role: e.target.value as any })}
                  sx={{ borderRadius: '8px' }}
                >
                  <MenuItem value="sales-executive">Sales Executive (Field visits & assigned leads)</MenuItem>
                  <MenuItem value="sales-manager">Sales Manager (Team oversight & lead routing)</MenuItem>
                  <MenuItem value="listing-manager">Listing Manager (Catalog, approvals & masters)</MenuItem>
                  <MenuItem value="admin">Platform Admin (General CRM administration)</MenuItem>
                  <MenuItem value="super-admin">Super Admin (Unrestricted enterprise root)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button size="small" onClick={() => setCreateModalOpen(false)} sx={{ textTransform: 'none', color: '#536458', fontSize: '0.82rem' }}>
              Cancel
            </Button>
            <Button
              size="small"
              type="submit"
              variant="contained"
              sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, textTransform: 'none', borderRadius: '8px', fontSize: '0.82rem', '&:hover': { bgcolor: '#00280F' } }}
            >
              Provision Account
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Reassign Records Modal */}
      <Dialog
        open={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: '16px' } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.05rem', pb: 1 }}>
          Reassign CRM Records
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2.5 }}>
          <Typography variant="body2" sx={{ color: '#536458', mb: 2, fontSize: '0.84rem' }}>
            Transfer all leads, inspections, and tasks currently owned by <strong>{selectedUserForReassign?.fullName}</strong> to another active staff member.
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel>Select Target Staff Member</InputLabel>
            <Select
              value={targetStaffId}
              label="Select Target Staff Member"
              onChange={(e) => setTargetStaffId(e.target.value)}
              sx={{ borderRadius: '8px' }}
            >
              {users
                .filter((u) => u.id !== selectedUserForReassign?.id && u.accountStatus === 'active')
                .map((u) => (
                  <MenuItem key={u.id || (u as any)._id} value={u.id || (u as any)._id}>
                    {u.fullName} ({getRoleDisplayName(u.role, 'en')})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button size="small" onClick={() => setReassignModalOpen(false)} sx={{ textTransform: 'none', color: '#536458', fontSize: '0.82rem' }}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={!targetStaffId}
            onClick={handleReassignRecords}
            sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, textTransform: 'none', borderRadius: '8px', fontSize: '0.82rem', '&:hover': { bgcolor: '#00280F' } }}
          >
            Confirm Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
