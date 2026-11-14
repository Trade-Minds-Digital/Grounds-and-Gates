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
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import KeyIcon from '@mui/icons-material/Key';
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
      setSuccessMessage(`Account for ${user.fullName} marked as ${nextStatus.toUpperCase()}`);
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B' }}>
            {lang === 'ta' ? 'பணியாளர் குழு & அணுகல் அனுமதிகள்' : 'Staff Team & Access Permissions'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25 }}>
            Role-Based Access Control (RBAC). Only Super Admin can promote staff to privileged tiers.
          </Typography>
        </Box>

        {currentUser.role === 'super-admin' && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
            sx={{
              bgcolor: '#013E18',
              color: '#F5F2E9',
              fontWeight: 700,
              borderRadius: '10px',
              textTransform: 'none',
              '&:hover': { bgcolor: '#00280F' },
            }}
          >
            Create Staff Member
          </Button>
        )}
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{errorMessage}</Alert>}

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
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Staff Member</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Role</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Mobile Contact</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Account Status</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Permissions Overview</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Management</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id || (u as any)._id} style={{ borderBottom: '1px solid rgba(24, 36, 27, 0.05)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#18241B' }}>
                        {u.fullName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#536458' }}>
                        {u.email}
                      </Typography>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Chip
                        label={getRoleDisplayName(u.role, 'en')}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          bgcolor: u.role === 'super-admin' ? '#FEF3C7' : '#ECFDF5',
                          color: u.role === 'super-admin' ? '#92400E' : '#065F46',
                        }}
                      />
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#18241B' }}>
                      {u.mobile || '+91 98422 71000'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Chip
                        label={u.accountStatus.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: u.accountStatus === 'active' ? '#ECFDF5' : '#FEE2E2',
                          color: u.accountStatus === 'active' ? '#065F46' : '#991B1B',
                        }}
                      />
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.78rem', color: '#536458', maxWidth: 220 }}>
                      {u.role === 'super-admin' && 'Full system and operational control.'}
                      {u.role === 'admin' && 'Operational CRM oversight, audit viewing.'}
                      {u.role === 'sales-manager' && 'Team leads, customer records, reports.'}
                      {u.role === 'sales-executive' && 'Assigned leads, site visits, bookings.'}
                      {u.role === 'listing-manager' && 'Property creation, projects, reviews.'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {currentUser.role === 'super-admin' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color={u.accountStatus === 'active' ? 'error' : 'success'}
                            onClick={() => handleToggleStatus(u)}
                            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', py: 0.2 }}
                          >
                            {u.accountStatus === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSelectedUserForReassign(u);
                              setReassignModalOpen(true);
                            }}
                            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', py: 0.2 }}
                          >
                            Reassign Records
                          </Button>
                        </Box>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Create Staff Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Staff Account</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              required
              label="Staff Full Name"
              value={newStaffData.fullName}
              onChange={(e) => setNewStaffData({ ...newStaffData, fullName: e.target.value })}
            />

            <TextField
              required
              type="email"
              label="Official Email Address"
              value={newStaffData.email}
              onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })}
            />

            <TextField
              label="Mobile Number"
              value={newStaffData.mobile}
              onChange={(e) => setNewStaffData({ ...newStaffData, mobile: e.target.value })}
            />

            <TextField
              required
              type="password"
              label="Initial Password"
              placeholder="Min 6 characters"
              value={newStaffData.password}
              onChange={(e) => setNewStaffData({ ...newStaffData, password: e.target.value })}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Assigned Role Tier</InputLabel>
              <Select
                value={newStaffData.role}
                label="Assigned Role Tier"
                onChange={(e) => setNewStaffData({ ...newStaffData, role: e.target.value as UserRole })}
              >
                <MenuItem value="sales-executive">Sales Executive (Field Specialist)</MenuItem>
                <MenuItem value="sales-manager">Sales Manager (Team Lead)</MenuItem>
                <MenuItem value="listing-manager">Listing Manager (Catalog & Projects)</MenuItem>
                <MenuItem value="admin">Administrator (Operations & Oversight)</MenuItem>
                <MenuItem value="super-admin">Super Administrator (Full System Authority)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCreateModalOpen(false)} sx={{ textTransform: 'none', color: '#536458' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateStaff}
            sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, textTransform: 'none' }}
          >
            Create Staff Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reassign Records Modal */}
      <Dialog open={reassignModalOpen} onClose={() => setReassignModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Reassign Staff Workload</DialogTitle>
        <DialogContent dividers>
          {selectedUserForReassign && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Alert severity="info">
                Transfer all assigned leads and scheduled site visits from <strong>{selectedUserForReassign.fullName}</strong> to another active staff member.
              </Alert>

              <FormControl fullWidth size="small">
                <InputLabel>Destination Staff Member</InputLabel>
                <Select
                  value={targetStaffId}
                  label="Destination Staff Member"
                  onChange={(e) => setTargetStaffId(e.target.value)}
                >
                  {users
                    .filter((u) => (u.id || (u as any)._id) !== (selectedUserForReassign.id || (selectedUserForReassign as any)._id) && u.accountStatus === 'active')
                    .map((u) => (
                      <MenuItem key={u.id || (u as any)._id} value={u.id || (u as any)._id}>
                        {u.fullName} ({getRoleDisplayName(u.role, 'en')})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setReassignModalOpen(false)} sx={{ textTransform: 'none', color: '#536458' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!targetStaffId}
            onClick={handleReassignRecords}
            sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, textTransform: 'none' }}
          >
            Transfer Workload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

