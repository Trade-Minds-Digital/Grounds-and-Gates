import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Tabs,
  Tab,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  IconButton,
  Chip,
  Switch,
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
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentIcon from '@mui/icons-material/Assessment';

import { api } from '../../../services/api';
import { MasterItem, MasterGroup, MasterUsageReport } from '../../../types/masters';
import { LanguageCode } from '../../../types/property';

interface AdminMastersModuleProps {
  lang: LanguageCode;
  onShowToast?: (message: string, type: 'success' | 'info' | 'error') => void;
}

interface MasterTypeDef {
  id: string;
  labelEn: string;
  labelTa: string;
  group: MasterGroup;
  parentType?: string;
}

const MASTER_TYPES: MasterTypeDef[] = [
  // Location Masters
  { id: 'country', labelEn: 'Countries', labelTa: 'நாடுகள்', group: 'location' },
  { id: 'state', labelEn: 'States', labelTa: 'மாநிலங்கள்', group: 'location', parentType: 'country' },
  { id: 'district', labelEn: 'Districts', labelTa: 'மாவட்டங்கள்', group: 'location', parentType: 'state' },
  { id: 'city', labelEn: 'Cities / Towns', labelTa: 'நகரங்கள் / பேரூர்கள்', group: 'location', parentType: 'district' },
  { id: 'locality', labelEn: 'Localities / Areas', labelTa: 'பகுதிகள் / ஏரியாக்கள்', group: 'location', parentType: 'district' },
  { id: 'regional_hub', labelEn: 'Regional Growth Corridors', labelTa: 'வளர்ச்சி மண்டலங்கள்', group: 'location', parentType: 'district' },

  // Property Masters
  { id: 'property_category', labelEn: 'Property Categories', labelTa: 'சொத்துப் பிரிவுகள்', group: 'property' },
  { id: 'property_subcategory', labelEn: 'Subcategories', labelTa: 'துணைப் பிரிவுகள்', group: 'property', parentType: 'property_category' },
  { id: 'transaction_type', labelEn: 'Transaction Types', labelTa: 'பரிவர்த்தனை வகைகள்', group: 'property' },
  { id: 'ownership_type', labelEn: 'Ownership Classifications', labelTa: 'உரிமை வகைகள்', group: 'property' },
  { id: 'amenity', labelEn: 'Amenities', labelTa: 'வசதிகள் & சிறப்பம்சங்கள்', group: 'property' },
  { id: 'facing_direction', labelEn: 'Facing Directions', labelTa: 'திசைகள்', group: 'property' },
  { id: 'road_type', labelEn: 'Road Types & Widths', labelTa: 'சாலை வகைகள்', group: 'property' },
  { id: 'area_unit', labelEn: 'Area Units & Conversions', labelTa: 'அளவீட்டு அலகுகள்', group: 'property' },
  { id: 'approval_authority', labelEn: 'Approval Authorities', labelTa: 'அங்கீகார அமைப்புகள்', group: 'property' },
  { id: 'document_type', labelEn: 'Document Types', labelTa: 'ஆவண வகைகள்', group: 'property' },

  // CRM Masters
  { id: 'lead_source', labelEn: 'Lead Sources', labelTa: 'லீட் மூலங்கள்', group: 'crm' },
  { id: 'lead_priority', labelEn: 'Lead Priorities', labelTa: 'முன்னுரிமைகள்', group: 'crm' },
  { id: 'lost_lead_reason', labelEn: 'Lost Lead Reasons', labelTa: 'இழப்புக்கான காரணங்கள்', group: 'crm' },
  { id: 'follow_up_type', labelEn: 'Follow-up Types', labelTa: 'தொடர்வு வகைகள்', group: 'crm' },
  { id: 'task_category', labelEn: 'Task Categories', labelTa: 'பணிப் பிரிவுகள்', group: 'crm' },
  { id: 'visit_purpose', labelEn: 'Visit Purposes', labelTa: 'பார்வை நோக்கங்கள்', group: 'crm' },
  { id: 'visit_time_slot', labelEn: 'Visit Time Slots', labelTa: 'பார்வை நேரங்கள்', group: 'crm' },
  { id: 'cancellation_reason', labelEn: 'Visit Cancellation Reasons', labelTa: 'ரத்து காரணங்கள்', group: 'crm' },
  { id: 'booking_cancellation_reason', labelEn: 'Booking Cancellation Reasons', labelTa: 'முன்பதிவு ரத்து காரணங்கள்', group: 'crm' },
  { id: 'payment_method', labelEn: 'Payment Methods', labelTa: 'செலுத்தும் முறைகள்', group: 'crm' },
  { id: 'payment_adjustment_reason', labelEn: 'Payment Adjustment Reasons', labelTa: 'சரிசெய்தல் காரணங்கள்', group: 'crm' },

  // Organization Masters
  { id: 'branch', labelEn: 'Company Branches', labelTa: 'கிளை அலுவலகங்கள்', group: 'organization' },
  { id: 'department', labelEn: 'Departments', labelTa: 'துறைகள்', group: 'organization' },
  { id: 'designation', labelEn: 'Staff Designations', labelTa: 'பதவி நிலைகள்', group: 'organization' },
  { id: 'team', labelEn: 'Operational Teams', labelTa: 'குழுக்கள்', group: 'organization', parentType: 'branch' },
];

export const AdminMastersModule: React.FC<AdminMastersModuleProps> = ({ lang, onShowToast }) => {
  const [activeGroup, setActiveGroup] = useState<MasterGroup>('location');
  const [selectedType, setSelectedType] = useState<string>('district');
  const [items, setItems] = useState<MasterItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterParentCode, setFilterParentCode] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Parent Options for Dependent Dropdown Filter
  const [parentOptions, setParentOptions] = useState<MasterItem[]>([]);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
  const [formCode, setFormCode] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formNameTa, setFormNameTa] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formParentCode, setFormParentCode] = useState<string>('');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formMetadataStr, setFormMetadataStr] = useState<string>('{}');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Delete & Usage Check State
  const [deleteTarget, setDeleteTarget] = useState<MasterItem | null>(null);
  const [usageReport, setUsageReport] = useState<MasterUsageReport | null>(null);
  const [isCheckingUsage, setIsCheckingUsage] = useState<boolean>(false);

  // Migration Dry-Run Modal
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState<boolean>(false);
  const [migrationReport, setMigrationReport] = useState<any | null>(null);
  const [isLoadingMigration, setIsLoadingMigration] = useState<boolean>(false);

  // Current active type definition
  const currentTypeDef = useMemo(() => {
    return MASTER_TYPES.find((m) => m.id === selectedType) || MASTER_TYPES[0];
  }, [selectedType]);

  // Types under the current active group
  const typesInActiveGroup = useMemo(() => {
    return MASTER_TYPES.filter((m) => m.group === activeGroup);
  }, [activeGroup]);

  // When group changes, select the first type in that group
  useEffect(() => {
    const firstInGroup = MASTER_TYPES.find((m) => m.group === activeGroup);
    if (firstInGroup) {
      setSelectedType(firstInGroup.id);
      setFilterParentCode('all');
      setPage(0);
    }
  }, [activeGroup]);

  // Load Parent Options whenever current type has a parentType
  useEffect(() => {
    const fetchParentOptions = async () => {
      if (!currentTypeDef.parentType) {
        setParentOptions([]);
        return;
      }
      try {
        const parents = await api.getPublicMasters(currentTypeDef.parentType);
        setParentOptions(parents || []);
      } catch (err) {
        console.warn('Failed to load parent options for', currentTypeDef.parentType, err);
        setParentOptions([]);
      }
    };
    fetchParentOptions();
  }, [currentTypeDef]);

  // Load Master Items for selected type
  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getMasters({
        type: selectedType,
        search: searchQuery,
        parentCode: filterParentCode !== 'all' ? filterParentCode : undefined,
        isActive: filterStatus === 'active' ? true : filterStatus === 'inactive' ? false : undefined,
        page: page + 1,
        limit: rowsPerPage,
      });

      if (res && Array.isArray(res.items)) {
        setItems(res.items);
        setTotalCount(res.pagination?.total || res.items.length);
      } else {
        setItems([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load master records.');
      if (onShowToast) onShowToast(err.message || 'Error loading masters', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedType, filterParentCode, filterStatus, page, rowsPerPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchItems();
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormCode('');
    setFormName('');
    setFormNameTa('');
    setFormDescription('');
    setFormParentCode(filterParentCode !== 'all' ? filterParentCode : '');
    setFormDisplayOrder(items.length + 1);
    setFormIsActive(true);
    setFormMetadataStr('{}');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: MasterItem) => {
    setEditingItem(item);
    setFormCode(item.code);
    setFormName(item.name);
    setFormNameTa(item.nameTa || '');
    setFormDescription(item.description || '');
    setFormParentCode(item.parentCode || '');
    setFormDisplayOrder(item.displayOrder || 0);
    setFormIsActive(item.isActive);
    setFormMetadataStr(item.metadata ? JSON.stringify(item.metadata, null, 2) : '{}');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save Add / Edit
  const handleSaveForm = async () => {
    if (!formCode.trim() || !formName.trim()) {
      setFormError('Stable Code and English Display Name are mandatory.');
      return;
    }

    let parsedMetadata = {};
    if (formMetadataStr.trim()) {
      try {
        parsedMetadata = JSON.parse(formMetadataStr);
      } catch {
        setFormError('Metadata must be valid JSON format (e.g. {"conversionFactorToSqft": 435.6}).');
        return;
      }
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const payload: Partial<MasterItem> = {
        code: formCode.trim().toLowerCase(),
        name: formName.trim(),
        nameTa: formNameTa.trim(),
        description: formDescription.trim(),
        parentCode: formParentCode ? formParentCode.trim().toLowerCase() : undefined,
        displayOrder: Number(formDisplayOrder) || 0,
        isActive: formIsActive,
        metadata: parsedMetadata,
      };

      if (editingItem) {
        await api.updateMaster(selectedType, editingItem._id, payload);
        if (onShowToast) onShowToast(`Master '${formName}' updated successfully.`, 'success');
      } else {
        await api.createMaster(selectedType, payload);
        if (onShowToast) onShowToast(`New master '${formName}' created successfully.`, 'success');
      }

      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed. Ensure the code is unique.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Active Switch in Table
  const handleToggleStatus = async (item: MasterItem) => {
    try {
      await api.toggleMasterStatus(selectedType, item._id, !item.isActive);
      setItems((prev) =>
        prev.map((it) => (it._id === item._id ? { ...it, isActive: !it.isActive } : it))
      );
      if (onShowToast) {
        onShowToast(`'${item.name}' marked as ${!item.isActive ? 'Active' : 'Inactive'}.`, 'info');
      }
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Open Delete & Usage Dialog
  const handleOpenDelete = async (item: MasterItem) => {
    setDeleteTarget(item);
    setIsCheckingUsage(true);
    setUsageReport(null);
    try {
      const usage = await api.getMasterUsage(selectedType, item._id);
      setUsageReport(usage);
    } catch (err: any) {
      console.warn('Failed to check usage:', err);
    } finally {
      setIsCheckingUsage(false);
    }
  };

  // Execute Deletion
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteMaster(selectedType, deleteTarget._id);
      if (onShowToast) onShowToast(`Master '${deleteTarget.name}' deleted safely.`, 'success');
      setDeleteTarget(null);
      fetchItems();
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'Failed to delete master item', 'error');
    }
  };

  // Run Migration Dry-Run Report
  const handleRunMigrationReport = async () => {
    setIsLoadingMigration(true);
    setIsMigrationModalOpen(true);
    try {
      const rep = await api.getMastersMigrationReport(true);
      setMigrationReport(rep);
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'Failed to run migration check', 'error');
    } finally {
      setIsLoadingMigration(false);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Module Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#18241B' }}>
            {lang === 'ta' ? 'மையப்படுத்தப்பட்ட மாஸ்டர் மேலாண்மை' : 'Centralized Master Management'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.5 }}>
            {lang === 'ta'
              ? 'அனைத்து வணிக தேர்வுகள், இருப்பிடங்கள், சொத்து பண்புகள் மற்றும் சி.ஆர்.எம் விருப்பங்களை நிர்வகிக்கவும்.'
              : 'Authoritative management of business options, locations, property classifications, and CRM workflows without editing source code.'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AssessmentIcon />}
            onClick={handleRunMigrationReport}
            sx={{
              borderColor: '#013E18',
              color: '#013E18',
              fontWeight: 800,
              borderRadius: '10px',
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(1, 62, 24, 0.04)' },
            }}
          >
            Migration Report
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              bgcolor: '#013E18',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: '10px',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(1, 62, 24, 0.2)',
              '&:hover': { bgcolor: '#00280F' },
            }}
          >
            {lang === 'ta' ? 'புதிய பதிவு சேர்க்க' : `Add ${currentTypeDef.labelEn.replace(/s$/, '')}`}
          </Button>
        </Box>
      </Box>

      {/* Group Navigation Tabs */}
      <Card sx={{ borderRadius: '16px', mb: 3, border: '1px solid #ECE7DA', boxShadow: 'none' }}>
        <Tabs
          value={activeGroup}
          onChange={(_, val) => setActiveGroup(val)}
          sx={{
            borderBottom: '1px solid #ECE7DA',
            bgcolor: '#FAF8F2',
            '& .MuiTab-root': {
              fontWeight: 800,
              fontSize: '0.85rem',
              textTransform: 'none',
              py: 1.8,
              color: '#536458',
              '&.Mui-selected': { color: '#013E18' },
            },
            '& .MuiTabs-indicator': { bgcolor: '#C99325', height: 3 },
          }}
        >
          <Tab value="location" label={`📍 ${lang === 'ta' ? 'இருப்பிட மாஸ்டர்கள்' : 'Location Masters'}`} />
          <Tab value="property" label={`🏡 ${lang === 'ta' ? 'சொத்து மாஸ்டர்கள்' : 'Property Masters'}`} />
          <Tab value="crm" label={`💼 ${lang === 'ta' ? 'சி.ஆர்.எம் மாஸ்டர்கள்' : 'CRM Masters'}`} />
          <Tab value="organization" label={`🏢 ${lang === 'ta' ? 'நிறுவன மாஸ்டர்கள்' : 'Organization Masters'}`} />
        </Tabs>

        {/* Sub-type Selection Chips */}
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1, bgcolor: '#FFFFFF' }}>
          {typesInActiveGroup.map((t) => {
            const isSelected = t.id === selectedType;
            return (
              <Chip
                key={t.id}
                label={lang === 'ta' ? t.labelTa : t.labelEn}
                clickable
                onClick={() => {
                  setSelectedType(t.id);
                  setFilterParentCode('all');
                  setPage(0);
                }}
                sx={{
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.78rem',
                  borderRadius: '10px',
                  bgcolor: isSelected ? '#013E18' : '#FAF8F2',
                  color: isSelected ? '#FFFFFF' : '#18241B',
                  border: isSelected ? 'none' : '1px solid #ECE7DA',
                  '&:hover': {
                    bgcolor: isSelected ? '#00280F' : '#ECE7DA',
                  },
                }}
              />
            );
          })}
        </Box>
      </Card>

      {/* Filters & Search Toolbar */}
      <Card sx={{ p: 2.5, borderRadius: '16px', mb: 3, border: '1px solid #ECE7DA', boxShadow: 'none' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1.2fr 1fr auto' }, gap: 2, alignItems: 'center' }}>
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit}>
            <TextField
              fullWidth
              size="small"
              placeholder={lang === 'ta' ? 'பெயர் அல்லது குறியீடு மூலம் தேடுக...' : `Search ${currentTypeDef.labelEn}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#8C9A90', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& fieldset': { borderColor: '#ECE7DA' } }}
            />
          </form>

          {/* Parent Filter (Dependent Dropdown) */}
          {parentOptions.length > 0 ? (
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.8rem' }}>
                {lang === 'ta' ? 'பெற்றோர் வடிகட்டி' : `Filter by ${currentTypeDef.parentType}`}
              </InputLabel>
              <Select
                value={filterParentCode}
                label={`Filter by ${currentTypeDef.parentType}`}
                onChange={(e) => {
                  setFilterParentCode(e.target.value);
                  setPage(0);
                }}
                sx={{ borderRadius: '10px', fontSize: '0.8rem' }}
              >
                <MenuItem value="all">{lang === 'ta' ? 'அனைத்து பெற்றோரும்' : 'All Parents'}</MenuItem>
                {parentOptions.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.name} {p.nameTa ? `(${p.nameTa})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : <Box />}

          {/* Active / Inactive Status Filter */}
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: '0.8rem' }}>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(0);
              }}
              sx={{ borderRadius: '10px', fontSize: '0.8rem' }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active Only</MenuItem>
              <MenuItem value="inactive">Inactive Only</MenuItem>
            </Select>
          </FormControl>

          {/* Refresh Action */}
          <IconButton onClick={fetchItems} sx={{ color: '#013E18' }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Card>

      {/* Master Items Table */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #ECE7DA', boxShadow: 'none', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#013E18' }} />
            <Typography variant="body2" sx={{ color: '#536458', mt: 2, fontWeight: 700 }}>
              Loading authoritative {currentTypeDef.labelEn}...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        ) : items.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <InfoOutlinedIcon sx={{ fontSize: 44, color: '#C99325', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
              No master records found
            </Typography>
            <Typography variant="body2" sx={{ color: '#536458', maxWidth: 400, mx: 'auto', mt: 0.5, mb: 2.5 }}>
              There are currently no active or inactive entries for '{currentTypeDef.labelEn}'. Click below to create the first record.
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{ bgcolor: '#013E18', color: '#FFFFFF', fontWeight: 800, borderRadius: '10px' }}
            >
              Add {currentTypeDef.labelEn}
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="medium">
                <TableHead sx={{ bgcolor: '#FAF8F2' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem' }}>CODE / ID</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem' }}>DISPLAY NAME (EN)</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem' }}>TAMIL NAME (TA)</TableCell>
                    {currentTypeDef.parentType && (
                      <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem' }}>PARENT</TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem' }}>ORDER</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem' }}>STATUS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* Code */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={item.code}
                            size="small"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              bgcolor: '#FAF8F2',
                              border: '1px solid #ECE7DA',
                              color: '#18241B',
                            }}
                          />
                          {item.isSystem && (
                            <Tooltip title="System-defined master: Code and core transitions are protected from deletion or rename.">
                              <Chip label="SYSTEM" size="small" sx={{ height: 18, fontSize: '0.55rem', fontWeight: 800, bgcolor: '#ECE7DA', color: '#536458' }} />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>

                      {/* Name EN */}
                      <TableCell sx={{ fontWeight: 700, color: '#18241B', fontSize: '0.85rem' }}>
                        {item.name}
                        {item.description && (
                          <Typography variant="caption" sx={{ display: 'block', color: '#8C9A90', fontSize: '0.68rem' }}>
                            {item.description}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Name TA */}
                      <TableCell sx={{ fontWeight: 600, color: '#013E18', fontSize: '0.82rem' }}>
                        {item.nameTa || <Typography variant="caption" sx={{ color: 'text.disabled' }}>-</Typography>}
                      </TableCell>

                      {/* Parent */}
                      {currentTypeDef.parentType && (
                        <TableCell>
                          {item.parentCode ? (
                            <Chip
                              label={item.parentCode}
                              size="small"
                              sx={{ fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(201, 147, 37, 0.1)', color: '#C99325' }}
                            />
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>Root</Typography>
                          )}
                        </TableCell>
                      )}

                      {/* Order */}
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#536458' }}>
                        {item.displayOrder}
                      </TableCell>

                      {/* Status Toggle */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Switch
                            size="small"
                            checked={item.isActive}
                            onChange={() => handleToggleStatus(item)}
                            color="success"
                          />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: item.isActive ? '#013E18' : '#8C9A90', fontSize: '0.7rem' }}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Edit Master Record">
                            <IconButton size="small" onClick={() => handleOpenEdit(item)} sx={{ color: '#013E18' }}>
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete or Check Dependencies">
                            <IconButton size="small" onClick={() => handleOpenDelete(item)} sx={{ color: '#B3261E' }}>
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ borderTop: '1px solid #ECE7DA' }}
            />
          </>
        )}
      </Card>

      {/* ======================================================== */}
      {/* ADD / EDIT MASTER DIALOG                                 */}
      {/* ======================================================== */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid #ECE7DA' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#18241B' }}>
            {editingItem ? `Edit ${currentTypeDef.labelEn}` : `Add New ${currentTypeDef.labelEn}`}
          </Typography>
          <IconButton size="small" onClick={() => setIsModalOpen(false)}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {formError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            {/* Unique Stable Code */}
            <TextField
              label="Unique Stable Code (e.g. saravanampatti, dtcp, buy)"
              size="small"
              fullWidth
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              disabled={Boolean(editingItem?.isSystem)}
              helperText={
                editingItem?.isSystem
                  ? 'System-defined code cannot be renamed to protect transactional references.'
                  : 'Must be unique and stable lowercase string. Used in database relationships and APIs.'
              }
              sx={{ '& fieldset': { borderRadius: '10px' } }}
            />

            {/* English Display Name */}
            <TextField
              label="English Display Name"
              size="small"
              fullWidth
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              sx={{ '& fieldset': { borderRadius: '10px' } }}
            />

            {/* Tamil Display Name */}
            <TextField
              label="Tamil Display Name (தமிழ்)"
              size="small"
              fullWidth
              value={formNameTa}
              onChange={(e) => setFormNameTa(e.target.value)}
              helperText="Rendered when users switch language to Tamil mode."
              sx={{ '& fieldset': { borderRadius: '10px' } }}
            />

            {/* Parent Code Dropdown if applicable */}
            {parentOptions.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>{`Parent ${currentTypeDef.parentType}`}</InputLabel>
                <Select
                  value={formParentCode}
                  label={`Parent ${currentTypeDef.parentType}`}
                  onChange={(e) => setFormParentCode(e.target.value)}
                  sx={{ borderRadius: '10px' }}
                >
                  <MenuItem value=""><em>None / Root Level</em></MenuItem>
                  {parentOptions.map((p) => (
                    <MenuItem key={p.code} value={p.code}>
                      {p.name} {p.nameTa ? `(${p.nameTa})` : ''} [{p.code}]
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Description */}
            <TextField
              label="Optional Description / Explanatory Note"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              sx={{ '& fieldset': { borderRadius: '10px' } }}
            />

            {/* Display Order & Active */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Display Order"
                type="number"
                size="small"
                value={formDisplayOrder}
                onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                sx={{ '& fieldset': { borderRadius: '10px' } }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  color="success"
                />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B' }}>
                  {formIsActive ? 'Active in Dropdowns' : 'Inactive'}
                </Typography>
              </Box>
            </Box>

            {/* Metadata (JSON) */}
            <TextField
              label="Entity Metadata (JSON: conversion factor, pinCode, corridor, timeWindow)"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={formMetadataStr}
              onChange={(e) => setFormMetadataStr(e.target.value)}
              helperText="E.g. for area_unit: {'conversionFactorToSqft': 435.6}; for locality: {'pinCode': '641035'}"
              sx={{ fontFamily: 'monospace', '& fieldset': { borderRadius: '10px' } }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #ECE7DA' }}>
          <Button onClick={() => setIsModalOpen(false)} sx={{ color: '#536458', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isSaving}
            onClick={handleSaveForm}
            sx={{ bgcolor: '#013E18', color: '#FFFFFF', fontWeight: 800, borderRadius: '10px', px: 3, '&:hover': { bgcolor: '#00280F' } }}
          >
            {isSaving ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : editingItem ? 'Save Changes' : 'Create Master'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================== */}
      {/* DELETE & USAGE CHECK CONFIRMATION DIALOG                 */}
      {/* ======================================================== */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#18241B', pb: 1 }}>
          Dependency & Usage Check
        </DialogTitle>
        <DialogContent>
          {isCheckingUsage ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress size={24} sx={{ color: '#013E18', mb: 1 }} />
              <Typography variant="body2" sx={{ color: '#536458', fontWeight: 600 }}>
                Querying database references across Properties, Leads, Visits, and Bookings...
              </Typography>
            </Box>
          ) : deleteTarget?.isSystem ? (
            <Box sx={{ pt: 1 }}>
              <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px' }}>
                <strong>System Protected Record:</strong> '{deleteTarget.name}' is a required platform code.
              </Alert>
              <Typography variant="body2" sx={{ color: '#536458' }}>
                System-defined masters cannot be permanently deleted because they are integral to core transaction and publishing state machines.
              </Typography>
              <Typography variant="body2" sx={{ color: '#536458', mt: 1 }}>
                To stop accepting new entries with this choice, toggle its status to <strong>Inactive</strong> instead.
              </Typography>
            </Box>
          ) : usageReport && usageReport.totalUsage > 0 ? (
            <Box sx={{ pt: 1 }}>
              <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                <strong>Deletion Blocked:</strong> '{deleteTarget?.name}' is currently referenced in {usageReport.totalUsage} active record(s).
              </Alert>
              <Typography variant="body2" sx={{ color: '#536458', mb: 1.5 }}>
                Hard deletion would corrupt relational integrity for existing business data:
              </Typography>
              <Box sx={{ bgcolor: '#FAF8F2', p: 1.5, borderRadius: '10px', fontSize: '0.8rem', color: '#18241B' }}>
                {usageReport.references.properties > 0 && <div>• Properties using this: <strong>{usageReport.references.properties}</strong></div>}
                {usageReport.references.leads > 0 && <div>• Leads using this: <strong>{usageReport.references.leads}</strong></div>}
                {usageReport.references.siteVisits > 0 && <div>• Site visits scheduled: <strong>{usageReport.references.siteVisits}</strong></div>}
                {usageReport.references.bookings > 0 && <div>• Bookings recorded: <strong>{usageReport.references.bookings}</strong></div>}
                {usageReport.references.childMasters > 0 && <div>• Child master items: <strong>{usageReport.references.childMasters}</strong></div>}
              </Box>
              <Typography variant="body2" sx={{ color: '#536458', mt: 2 }}>
                Please deactivate this master instead. It will immediately disappear from all new public and CRM dropdowns while keeping historical records intact.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>
                Zero active references found.
              </Alert>
              <Typography variant="body2" sx={{ color: '#18241B' }}>
                Are you sure you want to permanently delete <strong>'{deleteTarget?.name}'</strong> ({deleteTarget?.code})?
              </Typography>
              <Typography variant="caption" sx={{ color: '#B3261E', display: 'block', mt: 1 }}>
                This action cannot be undone.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #ECE7DA' }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: '#536458', fontWeight: 700 }}>
            Cancel
          </Button>

          {usageReport && usageReport.totalUsage > 0 ? (
            <Button
              variant="contained"
              onClick={async () => {
                if (deleteTarget) {
                  await handleToggleStatus(deleteTarget);
                  setDeleteTarget(null);
                }
              }}
              sx={{ bgcolor: '#C99325', color: '#FFFFFF', fontWeight: 800, borderRadius: '10px' }}
            >
              Deactivate Master
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              disabled={Boolean(deleteTarget?.isSystem || (usageReport && usageReport.totalUsage > 0))}
              onClick={handleConfirmDelete}
              sx={{ fontWeight: 800, borderRadius: '10px' }}
            >
              Delete Permanently
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ======================================================== */}
      {/* MIGRATION RECONCILIATION MODAL                           */}
      {/* ======================================================== */}
      <Dialog open={isMigrationModalOpen} onClose={() => setIsMigrationModalOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#18241B', pb: 1, borderBottom: '1px solid #ECE7DA' }}>
          Authoritative Masters Reconciliation Report
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          {isLoadingMigration ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress sx={{ color: '#013E18', mb: 1.5 }} />
              <Typography variant="body2" sx={{ color: '#536458', fontWeight: 700 }}>
                Scanning database properties, leads, and bookings against master codes...
              </Typography>
            </Box>
          ) : migrationReport ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="success" sx={{ borderRadius: '12px' }}>
                Dry-run reconciliation verified at {new Date(migrationReport.timestamp).toLocaleTimeString()}.
              </Alert>

              <Card sx={{ p: 2, bgcolor: '#FAF8F2', borderRadius: '12px', border: '1px solid #ECE7DA' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18', mb: 1 }}>
                  Properties Reconciliation (Total: {migrationReport.propertiesReconciled?.total})
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: '0.8rem' }}>
                  <div>• Matched Categories: <strong>{migrationReport.propertiesReconciled?.matchedCategory}</strong></div>
                  <div>• Matched Districts: <strong>{migrationReport.propertiesReconciled?.matchedDistrict}</strong></div>
                  <div>• Matched Localities: <strong>{migrationReport.propertiesReconciled?.matchedLocality}</strong></div>
                  <div>• Matched Facing: <strong>{migrationReport.propertiesReconciled?.matchedFacing}</strong></div>
                  <div>• Matched Area Units: <strong>{migrationReport.propertiesReconciled?.matchedAreaUnit}</strong></div>
                  <div>• Flagged Unmatched: <strong>{migrationReport.propertiesReconciled?.unmatched?.length || 0}</strong></div>
                </Box>
              </Card>

              <Card sx={{ p: 2, bgcolor: '#FAF8F2', borderRadius: '12px', border: '1px solid #ECE7DA' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18', mb: 1 }}>
                  CRM Leads Reconciliation (Total: {migrationReport.leadsReconciled?.total})
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: '0.8rem' }}>
                  <div>• Matched Sources: <strong>{migrationReport.leadsReconciled?.matchedSource}</strong></div>
                  <div>• Matched Priorities: <strong>{migrationReport.leadsReconciled?.matchedPriority}</strong></div>
                  <div>• Matched Stages: <strong>{migrationReport.leadsReconciled?.matchedStage}</strong></div>
                </Box>
              </Card>

              <Card sx={{ p: 2, bgcolor: '#FAF8F2', borderRadius: '12px', border: '1px solid #ECE7DA' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18', mb: 1 }}>
                  Bookings Reconciliation (Total: {migrationReport.bookingsReconciled?.total})
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: '0.8rem' }}>
                  <div>• Matched Payment Methods: <strong>{migrationReport.bookingsReconciled?.matchedPaymentMethod}</strong></div>
                  <div>• Matched Statuses: <strong>{migrationReport.bookingsReconciled?.matchedStatus}</strong></div>
                </Box>
              </Card>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #ECE7DA' }}>
          <Button onClick={() => setIsMigrationModalOpen(false)} sx={{ fontWeight: 800, color: '#013E18' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
