import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import TableRowsIcon from '@mui/icons-material/TableRows';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { api } from '../../../services/api';
import { AdminUser, CrmLead, LeadStage } from '../../../types/crm';
import { LanguageCode } from '../../../types/property';
import { formatPriceINR } from '../../../utils/propertyUtils';

interface AdminLeadsModuleProps {
  currentUser: AdminUser;
  lang: LanguageCode;
}

const STAGES: Array<{ id: LeadStage; label: string; color: string }> = [
  { id: 'new', label: 'New Inbound', color: '#F59E0B' },
  { id: 'contacted', label: 'Contacted', color: '#3B82F6' },
  { id: 'qualified', label: 'Qualified', color: '#6366F1' },
  { id: 'scheduled', label: 'Visit Scheduled', color: '#8B5CF6' },
  { id: 'negotiation', label: 'Negotiation', color: '#06B6D4' },
  { id: 'won', label: 'Won / Booked', color: '#10B981' },
  { id: 'lost', label: 'Lost', color: '#9CA3AF' },
];

export const AdminLeadsModule: React.FC<AdminLeadsModuleProps> = ({ currentUser, lang }) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selected lead for detail drawer
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [leadActivities, setLeadActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Create Lead Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newLeadData, setNewLeadData] = useState({
    buyerName: '',
    phone: '',
    email: '',
    propertyTitle: '',
    propertyId: 'gg-cbe-plot-01',
    offerAmount: 3500000,
    priority: 'high' as 'low' | 'medium' | 'high',
    stage: 'new' as LeadStage,
    source: 'website',
    message: '',
  });

  // Duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [potentialDuplicate, setPotentialDuplicate] = useState<CrmLead | null>(null);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  const fetchLeads = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const filters: any = {};
      if (stageFilter !== 'all') filters.stage = stageFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      const res = await api.getLeads(filters);
      setLeads(res || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch leads from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [stageFilter, priorityFilter]);

  // Stage change with real backend persistence
  const handleStageChange = async (leadId: string, newStage: LeadStage) => {
    const previousLeads = [...leads];
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId || l.referenceId === leadId ? { ...l, stage: newStage } : l))
    );

    try {
      await api.updateLeadStage(leadId, newStage);
      setSuccessMessage(`Lead moved to ${newStage.toUpperCase()}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // Revert if backend write fails
      setLeads(previousLeads);
      setErrorMessage(`Stage update failed: ${err.message}. Changes reverted.`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Open Lead Detail Drawer
  const handleOpenLeadDetails = async (lead: CrmLead) => {
    setSelectedLead(lead);
    setIsLoadingActivities(true);
    try {
      const res = await api.getLeadById(lead.id || lead.referenceId || '');
      if (res && res.activities) {
        setLeadActivities(res.activities);
      }
    } catch (e) {
      console.warn('Failed to fetch lead activities:', e);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Duplicate Check
  const handleCheckDuplicate = async (phone: string, email: string) => {
    if (!phone && !email) return;
    try {
      const res = await api.checkDuplicateLead(email, phone);
      if (res.hasDuplicate && res.duplicates && res.duplicates.length > 0) {
        setDuplicateWarning(`Potential duplicate lead detected for ${res.duplicates[0].buyerName} (${res.duplicates[0].phone}).`);
        setPotentialDuplicate(res.duplicates[0]);
      } else {
        setDuplicateWarning(null);
        setPotentialDuplicate(null);
      }
    } catch (e) {}
  };

  // Create Lead Form Submit
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadData.buyerName || !newLeadData.phone) {
      alert('Please provide lead name and phone number.');
      return;
    }

    try {
      await api.createLead(newLeadData);
      setCreateModalOpen(false);
      setSuccessMessage('New lead successfully saved to production database.');
      setNewLeadData({
        buyerName: '',
        phone: '',
        email: '',
        propertyTitle: '',
        propertyId: 'gg-cbe-plot-01',
        offerAmount: 3500000,
        priority: 'high',
        stage: 'new',
        source: 'website',
        message: '',
      });
      fetchLeads();
    } catch (err: any) {
      alert(`Lead creation failed: ${err.message}`);
    }
  };

  // Merge Duplicate Leads
  const handleExecuteMerge = async () => {
    if (!selectedLead || !potentialDuplicate) return;
    try {
      await api.mergeLeads(
        selectedLead.id || selectedLead.referenceId || '',
        potentialDuplicate.id || potentialDuplicate.referenceId || ''
      );
      setMergeModalOpen(false);
      setSuccessMessage('Duplicate leads successfully merged.');
      fetchLeads();
      setSelectedLead(null);
    } catch (err: any) {
      alert(`Merge failed: ${err.message}`);
    }
  };

  return (
    <Box>
      {/* Header bar */}
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
            {lang === 'ta' ? 'லீட்கள் & CRM மேலாண்மை' : 'Leads Pipeline & Management'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25 }}>
            Total {leads.length} active leads recorded across sales stages.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* View Mode Toggle */}
          <Box sx={{ bgcolor: '#FFFFFF', borderRadius: '10px', p: 0.5, border: '1px solid rgba(24, 36, 27, 0.1)' }}>
            <IconButton
              size="small"
              onClick={() => setViewMode('kanban')}
              sx={{ color: viewMode === 'kanban' ? '#013E18' : '#536458', bgcolor: viewMode === 'kanban' ? 'rgba(1, 62, 24, 0.08)' : 'transparent' }}
            >
              <ViewKanbanIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('table')}
              sx={{ color: viewMode === 'table' ? '#013E18' : '#536458', bgcolor: viewMode === 'table' ? 'rgba(1, 62, 24, 0.08)' : 'transparent' }}
            >
              <TableRowsIcon fontSize="small" />
            </IconButton>
          </Box>

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
              px: 2,
              '&:hover': { bgcolor: '#00280F' },
            }}
          >
            New Lead
          </Button>
        </Box>
      </Box>

      {/* Notifications / Alerts */}
      {errorMessage && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{errorMessage}</Alert>}
      {successMessage && <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: '12px' }}>{successMessage}</Alert>}

      {/* Search & Filter Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid rgba(24, 36, 27, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          size="small"
          placeholder="Search by buyer name, phone, email, or property..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchLeads()}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#536458', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 280, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Stage</InputLabel>
          <Select
            value={stageFilter}
            label="Stage"
            onChange={(e) => setStageFilter(e.target.value)}
            sx={{ borderRadius: '10px' }}
          >
            <MenuItem value="all">All Stages</MenuItem>
            {STAGES.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priorityFilter}
            label="Priority"
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ borderRadius: '10px' }}
          >
            <MenuItem value="all">All Priorities</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>

        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchLeads}
          sx={{ borderRadius: '10px', textTransform: 'none', color: '#013E18', borderColor: 'rgba(24, 36, 27, 0.2)' }}
        >
          Apply Filters
        </Button>
      </Paper>

      {/* Kanban Pipeline View */}
      {viewMode === 'kanban' && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' },
            gap: 2,
            alignItems: 'start',
            overflowX: 'auto',
            pb: 2,
          }}
        >
          {STAGES.map((stage) => {
            const columnLeads = leads.filter((l) => l.stage === stage.id);
            return (
              <Box
                key={stage.id}
                sx={{
                  bgcolor: '#FAF8F2',
                  borderRadius: '16px',
                  p: 2,
                  border: '1px solid rgba(24, 36, 27, 0.08)',
                  minHeight: 400,
                }}
              >
                {/* Column Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: stage.color }} />
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.85rem' }}>
                      {stage.label}
                    </Typography>
                  </Box>
                  <Chip
                    label={columnLeads.length}
                    size="small"
                    sx={{ height: 20, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#FFFFFF' }}
                  />
                </Box>

                {/* Cards in column */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {columnLeads.map((lead) => (
                    <Paper
                      key={lead.id || lead.referenceId}
                      elevation={1}
                      onClick={() => handleOpenLeadDetails(lead)}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '1px solid rgba(24, 36, 27, 0.06)',
                        '&:hover': {
                          borderColor: '#C99325',
                          boxShadow: '0 8px 20px rgba(1, 62, 24, 0.08)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#18241B' }}>
                          {lead.buyerName}
                        </Typography>
                        <Chip
                          label={lead.priority.toUpperCase()}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: lead.priority === 'high' ? '#FEE2E2' : '#FEF3C7',
                            color: lead.priority === 'high' ? '#991B1B' : '#92400E',
                          }}
                        />
                      </Box>

                      <Typography variant="caption" sx={{ color: '#536458', display: 'block', mb: 1, lineHeight: 1.4 }}>
                        {lead.propertyTitle}
                      </Typography>

                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#013E18', fontSize: '0.82rem', mb: 1.5 }}>
                        {formatPriceINR(lead.offerAmount || 0)}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #F3F4F6' }}>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.7rem' }}>
                          {lead.phone}
                        </Typography>

                        {/* Quick Stage Move Dropdown */}
                        <Select
                          size="small"
                          value={lead.stage}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStageChange(lead.id || lead.referenceId || '', e.target.value as LeadStage)}
                          sx={{
                            fontSize: '0.7rem',
                            height: 24,
                            '& .MuiSelect-select': { py: 0.2, px: 1 },
                          }}
                        >
                          {STAGES.map((s) => (
                            <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.75rem' }}>{s.label}</MenuItem>
                          ))}
                        </Select>
                      </Box>
                    </Paper>
                  ))}

                  {columnLeads.length === 0 && (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        No leads in this stage
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Paper elevation={1} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid rgba(24, 36, 27, 0.08)' }}>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Lead Name</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Phone / Email</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Property Enquired</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Offer (INR)</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Stage</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Priority</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr
                    key={l.id || l.referenceId}
                    style={{ borderBottom: '1px solid rgba(24, 36, 27, 0.05)', cursor: 'pointer' }}
                    onClick={() => handleOpenLeadDetails(l)}
                  >
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#18241B' }}>{l.buyerName}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#536458' }}>
                      <div>{l.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{l.email}</div>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#18241B' }}>{l.propertyTitle}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#013E18' }}>{formatPriceINR(l.offerAmount || 0)}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <Chip label={l.stage.toUpperCase()} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Chip
                        label={l.priority.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: l.priority === 'high' ? '#FEE2E2' : '#FEF3C7',
                          color: l.priority === 'high' ? '#991B1B' : '#92400E',
                        }}
                      />
                    </td>
                    <td style={{ padding: '14px 18px' }} onClick={(e) => e.stopPropagation()}>
                      <Button size="small" onClick={() => handleOpenLeadDetails(l)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                        Details →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Lead Details Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        slotProps={{
          paper: {
            sx: { width: { xs: '100%', sm: 480 }, p: 3.5, bgcolor: '#FFFFFF' },
          },
        }}
      >
        {selectedLead && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
                Lead Details: {selectedLead.referenceId}
              </Typography>
              <IconButton size="small" onClick={() => setSelectedLead(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ mb: 3, p: 2.5, bgcolor: '#FAF8F2', borderRadius: '16px' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#013E18' }}>
                {selectedLead.buyerName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <PhoneIcon sx={{ fontSize: 16, color: '#536458' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedLead.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <EmailIcon sx={{ fontSize: 16, color: '#536458' }} />
                <Typography variant="body2" sx={{ color: '#536458' }}>{selectedLead.email}</Typography>
              </Box>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              Interested Property & Offer
            </Typography>
            <Typography variant="body2" sx={{ color: '#18241B', mb: 0.5 }}>{selectedLead.propertyTitle}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#013E18', mb: 3 }}>
              Offer: {formatPriceINR(selectedLead.offerAmount || 0)}
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
              Lead Stage & Progression
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <Select
                value={selectedLead.stage}
                onChange={(e) => handleStageChange(selectedLead.id || selectedLead.referenceId || '', e.target.value as LeadStage)}
                sx={{ borderRadius: '10px' }}
              >
                {STAGES.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              Buyer Notes & Inquiries
            </Typography>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: '10px', mb: 3, border: '1px solid #E5E7EB' }}>
              <Typography variant="body2" sx={{ color: '#374151', whiteSpace: 'pre-wrap' }}>
                {selectedLead.message || selectedLead.notes || 'No message provided.'}
              </Typography>
            </Paper>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
              Activity History & Follow-ups
            </Typography>
            {isLoadingActivities ? (
              <CircularProgress size={24} sx={{ color: '#013E18', display: 'block', mx: 'auto', my: 2 }} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                {leadActivities.map((act) => (
                  <Box key={act.referenceId || act._id} sx={{ p: 1.5, bgcolor: '#F9FAFB', borderRadius: '10px' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#013E18', display: 'block' }}>
                      {act.title}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#536458' }}>
                      {act.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.7rem' }}>
                      {act.performedBy} • {new Date(act.createdAt || act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                ))}
                {leadActivities.length === 0 && (
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>No activity records yet.</Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </Drawer>

      {/* Create Lead Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#18241B' }}>
          Add New Inbound Lead
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {duplicateWarning && (
              <Alert severity="warning" icon={<WarningAmberIcon />}>
                {duplicateWarning}
              </Alert>
            )}

            <TextField
              required
              label="Buyer Full Name"
              value={newLeadData.buyerName}
              onChange={(e) => setNewLeadData({ ...newLeadData, buyerName: e.target.value })}
            />

            <TextField
              required
              label="Phone Number"
              value={newLeadData.phone}
              onChange={(e) => {
                setNewLeadData({ ...newLeadData, phone: e.target.value });
                handleCheckDuplicate(e.target.value, newLeadData.email);
              }}
            />

            <TextField
              label="Email Address"
              value={newLeadData.email}
              onChange={(e) => {
                setNewLeadData({ ...newLeadData, email: e.target.value });
                handleCheckDuplicate(newLeadData.phone, e.target.value);
              }}
            />

            <TextField
              label="Interested Property Title"
              value={newLeadData.propertyTitle}
              placeholder="e.g. DTCP Gated Villa Plot, Saravanampatti"
              onChange={(e) => setNewLeadData({ ...newLeadData, propertyTitle: e.target.value })}
            />

            <TextField
              type="number"
              label="Offer / Budget Amount (INR)"
              value={newLeadData.offerAmount}
              onChange={(e) => setNewLeadData({ ...newLeadData, offerAmount: Number(e.target.value) })}
            />

            <TextField
              multiline
              rows={3}
              label="Inquiry / Requirement Notes"
              value={newLeadData.message}
              onChange={(e) => setNewLeadData({ ...newLeadData, message: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCreateModalOpen(false)} sx={{ textTransform: 'none', color: '#536458' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateLead}
            sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, textTransform: 'none' }}
          >
            Save Lead
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
