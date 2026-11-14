import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B' }}>
            {lang === 'ta' ? 'பாதுகாப்பு & தணிக்கை பதிவு' : 'Security & Administrative Audit Log'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25 }}>
            Append-only tamper-evident record of permissions, stage updates, financial adjustments, and logins.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={fetchLogs}
          sx={{ borderRadius: '10px', textTransform: 'none', color: '#013E18', borderColor: 'rgba(24, 36, 27, 0.2)' }}
        >
          Refresh Logs
        </Button>
      </Box>

      {/* Filter toolbar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)', display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Module</InputLabel>
          <Select
            value={moduleFilter}
            label="Filter by Module"
            onChange={(e) => setModuleFilter(e.target.value)}
            sx={{ borderRadius: '10px' }}
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
          <CircularProgress size={36} sx={{ color: '#013E18' }} />
        </Box>
      ) : (
        <Paper elevation={1} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid rgba(24, 36, 27, 0.08)' }}>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Timestamp (IST)</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Actor</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Module</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Action Code</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 800, color: '#18241B' }}>Changes & Metadata</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id || (log as any)._id} style={{ borderBottom: '1px solid rgba(24, 36, 27, 0.05)' }}>
                    <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: '#536458', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#18241B' }}>
                        {log.user?.fullName || log.userEmail || 'System / CLI'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8B6413' }}>
                        {log.user?.role || 'authorized-actor'}
                      </Typography>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Chip
                        label={log.module}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: '#FAF8F2' }}
                      />
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#013E18', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {log.action}
                      </Typography>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: '#536458', maxWidth: 380 }}>
                      {log.changes ? (
                        <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(log.changes, null, 1)}
                        </pre>
                      ) : (
                        `Entity ID: ${log.entityId || 'N/A'}`
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: '#9CA3AF' }}>
                      No audit records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

