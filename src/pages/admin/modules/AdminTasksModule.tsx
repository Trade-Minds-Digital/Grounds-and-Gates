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
  Tabs,
  Tab,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { api } from '../../../services/api';
import { AdminUser, CrmTask } from '../../../types/crm';
import { LanguageCode } from '../../../types/property';

interface AdminTasksModuleProps {
  currentUser: AdminUser;
  lang: LanguageCode;
}

export const AdminTasksModule: React.FC<AdminTasksModuleProps> = ({ currentUser, lang }) => {
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskViewFilter, setTaskViewFilter] = useState<'my' | 'team' | 'overdue'>('my');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    entityType: 'lead' as any,
    entityTitle: '',
    priority: 'high' as any,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  });

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (taskViewFilter === 'overdue') {
        filters.overdue = 'true';
      }
      const res = await api.getTasks(filters);
      setTasks(res || []);
    } catch (e) {
      console.warn('Failed to load tasks:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [taskViewFilter]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      await api.createTask({
        ...newTask,
        assignedEmployeeId: currentUser.id || 'emp-01',
        assignedEmployeeName: currentUser.fullName || 'Executive',
      });
      setCreateModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        entityType: 'lead',
        entityTitle: '',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      });
      fetchTasks();
    } catch (e: any) {
      alert(`Task creation failed: ${e.message}`);
    }
  };

  const handleToggleTaskStatus = async (task: CrmTask) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateTask(task.id || task.referenceId || '', { status: nextStatus });
      fetchTasks();
    } catch (e: any) {
      alert(`Update failed: ${e.message}`);
    }
  };

  const filtered = tasks.filter((t) => {
    if (taskViewFilter === 'my') {
      return (
        t.assignedEmployeeId === currentUser.id ||
        t.assignedEmployeeName === currentUser.fullName ||
        currentUser.role === 'super-admin'
      );
    }
    if (taskViewFilter === 'overdue') {
      return new Date(t.dueDate) < new Date() && t.status !== 'completed';
    }
    return true;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B' }}>
            {lang === 'ta' ? 'பணிகள் & வாடிக்கையாளர் தொடர்வுகள்' : 'Tasks & Follow-up Action Items'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25 }}>
            Time-bound action items linked to leads, site visit reminders, and document verifications.
          </Typography>
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
            '&:hover': { bgcolor: '#00280F' },
          }}
        >
          Add Task
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={taskViewFilter} onChange={(_, val) => setTaskViewFilter(val)}>
          <Tab value="my" label="My Active Tasks" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab value="team" label="Team Workload" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab value="overdue" label="⚠️ Overdue Items" sx={{ fontWeight: 700, textTransform: 'none', color: '#BE123C' }} />
        </Tabs>
      </Box>

      {/* Task List */}
      {isLoading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={36} sx={{ color: '#013E18' }} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map((t) => {
            const isOverdue = new Date(t.dueDate) < new Date() && t.status !== 'completed';
            return (
              <Paper
                key={t.id || t.referenceId}
                elevation={1}
                sx={{
                  p: 2.5,
                  borderRadius: '14px',
                  bgcolor: '#FFFFFF',
                  border: isOverdue ? '1px solid #FCA5A5' : '1px solid rgba(24, 36, 27, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleTaskStatus(t)}
                    sx={{ color: t.status === 'completed' ? '#10B981' : '#9CA3AF', mt: 0.25 }}
                  >
                    <CheckCircleIcon />
                  </IconButton>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 800,
                          color: '#18241B',
                          textDecoration: t.status === 'completed' ? 'line-through' : 'none',
                        }}
                      >
                        {t.title}
                      </Typography>
                      <Chip
                        label={t.priority.toUpperCase()}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          bgcolor: t.priority === 'urgent' || t.priority === 'high' ? '#FEE2E2' : '#FEF3C7',
                          color: t.priority === 'urgent' || t.priority === 'high' ? '#991B1B' : '#92400E',
                        }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#536458', mb: 1, fontSize: '0.85rem' }}>
                      {t.description || t.entityTitle || 'Follow-up on inquiry specifications.'}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 15, color: isOverdue ? '#BE123C' : '#536458' }} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: isOverdue ? '#BE123C' : '#536458',
                          }}
                        >
                          Due: {new Date(t.dueDate).toLocaleDateString('en-IN')} {isOverdue && '(OVERDUE)'}
                        </Typography>
                      </Box>

                      <Typography variant="caption" sx={{ color: '#013E18', fontWeight: 600 }}>
                        Assigned to: {t.assignedEmployeeName}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Button
                  size="small"
                  variant={t.status === 'completed' ? 'outlined' : 'contained'}
                  onClick={() => handleToggleTaskStatus(t)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '8px',
                    bgcolor: t.status === 'completed' ? 'transparent' : '#013E18',
                    color: t.status === 'completed' ? '#065F46' : '#F5F2E9',
                  }}
                >
                  {t.status === 'completed' ? 'Reopen' : 'Complete'}
                </Button>
              </Paper>
            );
          })}

          {filtered.length === 0 && (
            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: '#FAF8F2', borderRadius: '16px' }}>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                No active tasks found in this view.
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Create Task Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Task / Follow-up</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              required
              label="Task Title"
              placeholder="e.g. Call Mr. Mohanraj regarding plot legal EC"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />

            <TextField
              multiline
              rows={2}
              label="Description / Context"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTask.priority}
                label="Priority"
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>

            <TextField
              required
              type="date"
              label="Due Date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCreateModalOpen(false)} sx={{ textTransform: 'none', color: '#536458' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTask}
            sx={{ bgcolor: '#013E18', color: '#F5F2E9', fontWeight: 700, textTransform: 'none' }}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
