import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShieldIcon from '@mui/icons-material/Shield';

import { api } from '../../../services/api';
import { AdminUser, CrmAuditLog } from '../../../types/crm';
import { LanguageCode } from '../../../types/property';

interface AdminAuditLogModuleProps {
  currentUser: AdminUser;
  lang: LanguageCode;
}

export const AdminAuditLogModule: React.FC<AdminAuditLogModuleProps> = ({ currentUser, lang }) => {
  const [logs, setLogs] = useState<CrmAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (moduleFilter !== 'all') filters.module = moduleFilter;
      const res = await api.getAuditLogs(filters);
      setLogs(res || []);
    } catch (e) {
      console.warn('Failed to load audit logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter]);

  const paginatedLogs = logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              {lang === 'ta' ? 'பாதுகாப்பு & தணிக்கை பதிவு' : 'Security & Administrative Audit Log'}
            </Typography>
            <Chip
              label={`${logs.length} Immutable Records`}
              size="small"
              sx={{ bgcolor: '#FAF8F2', color: '#013E18', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25, fontSize: '0.82rem' }}>
            Append-only tamper-evident record of permissions, stage updates, financial adjustments, and logins.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
          onClick={fetchLogs}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            color: '#013E18',
            borderColor: 'rgba(24, 36, 27, 0.2)',
            fontWeight: 700,
            fontSize: '0.80rem',
            height: 36,
            px: 1.5,
            '&:hover': { borderColor: '#013E18', bgcolor: 'rgba(1, 62, 24, 0.04)' },
          }}
        >
          Refresh Logs
        </Button>
      </Box>

      {/* Filter toolbar */}
      <Paper elevation={0} sx={{ p: 1.75, mb: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)', display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel sx={{ fontSize: '0.84rem' }}>Filter by Module</InputLabel>
          <Select
            value={moduleFilter}
            label="Filter by Module"
            onChange={(e) => { setModuleFilter(e.target.value); setPage(0); }}
            sx={{ borderRadius: '8px', fontSize: '0.84rem' }}
          >
            <MenuItem value="all">All Modules</MenuItem>
            <MenuItem value="AUTH">AUTH (Logins & Passwords)</MenuItem>
            <MenuItem value="TEAM">TEAM (Staff & Roles)</MenuItem>
            <MenuItem value="LEADS">LEADS (Pipeline & Merge)</MenuItem>
            <MenuItem value="PROPERTIES">PROPERTIES (Verification)</MenuItem>
            <MenuItem value="BOOKINGS">BOOKINGS (Financial Records)</MenuItem>
            <MenuItem value="SETTINGS">SETTINGS (System Config)</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Audit Log Table */}
      {isLoading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={32} sx={{ color: '#013E18' }} />
        </Box>
      ) : logs.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
          <ShieldIcon sx={{ fontSize: 44, color: '#9CA3AF', mb: 1.5 }} />
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#18241B', mb: 0.5 }}>
            No audit records matching this filter
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458' }}>
            All administrative mutations and RBAC events will be captured here in real-time.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(24, 36, 27, 0.08)', bgcolor: '#FFFFFF' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#FAF8F2' }}>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Timestamp (IST)</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Actor</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Module</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Action Code</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.78rem', py: 1.5 }}>Changes & Metadata</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id || (log as any)._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.5, fontSize: '0.76rem', color: '#536458', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B', fontSize: '0.82rem' }}>
                        {log.user?.fullName || log.userEmail || 'System / CLI'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8B6413', fontSize: '0.70rem' }}>
                        {log.user?.role || 'authorized-actor'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={log.module}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.68rem', height: 20, bgcolor: '#FAF8F2', border: '1px solid rgba(24, 36, 27, 0.1)' }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#013E18', fontFamily: 'monospace', fontSize: '0.76rem' }}>
                        {log.action}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, fontSize: '0.76rem', color: '#536458', maxWidth: 380 }}>
                      {log.changes ? (
                        <pre style={{ margin: 0, fontSize: '0.72rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: 80, overflowY: 'auto' }}>
                          {JSON.stringify(log.changes, null, 1)}
                        </pre>
                      ) : (
                        `Entity ID: ${log.entityId || 'N/A'}`
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 15, 30]}
            component="div"
            count={logs.length}
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
    </Box>
  );
};
