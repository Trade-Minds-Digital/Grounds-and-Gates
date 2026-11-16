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
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

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

  const handleToggleTaskStatus = async (task: CrmTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateTask(task.id || task.referenceId || '', { status: newStatus });
      fetchTasks();
    } catch (e: any) {
      alert(`Failed to update task: ${e.message}`);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      await api.createTask({
        ...newTask,
        id: `task-${Date.now()}`,
        status: 'pending',
        assignedTo: currentUser.id || 'emp-senthil-01',
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

  const filtered = tasks.filter((t) => {
    if (taskViewFilter === 'overdue') {
      return new Date(t.dueDate) < new Date() && t.status !== 'completed';
    }
    return true;
  });

  const overdueCount = tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== 'completed').length;

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
              {lang === 'ta' ? 'பணிகள் & வாடிக்கையாளர் தொடர்வுகள்' : 'Tasks & Follow-up Action Items'}
            </Typography>
            <Chip
              label={`${tasks.length} Total Tasks`}
              size="small"
              sx={{ bgcolor: '#FAF8F2', color: '#013E18', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25, fontSize: '0.82rem' }}>
            Time-bound action items linked to leads, site visit reminders, and document verifications.
          </Typography>
        </Box>

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
          Add Task
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
        <Tabs
          value={taskViewFilter}
          onChange={(_, val) => setTaskViewFilter(val)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.82rem', minHeight: 40 },
            '& .Mui-selected': { color: '#013E18' },
            '& .MuiTabs-indicator': { backgroundColor: '#013E18' },
          }}
        >
          <Tab value="my" label={`My Active Tasks (${tasks.length})`} />
          <Tab value="team" label="Team Workload" />
          <Tab
            value="overdue"
            label={`Overdue Items (${overdueCount})`}
            sx={{ color: overdueCount > 0 ? '#BE123C !important' : 'inherit' }}
          />
        </Tabs>
      </Box>

      {/* Task List */}
      {isLoading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={32} sx={{ color: '#013E18' }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
          <TaskAltIcon sx={{ fontSize: 44, color: '#9CA3AF', mb: 1.5 }} />
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#18241B', mb: 0.5 }}>
            No tasks in this view
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mb: 2 }}>
            All follow-ups and inspections are up to date.
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
            sx={{ bgcolor: '#013E18', textTransform: 'none', borderRadius: '8px', fontWeight: 700 }}
          >
            Create Task
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((t) => {
            const isOverdue = new Date(t.dueDate) < new Date() && t.status !== 'completed';
            const isCompleted = t.status === 'completed';
            return (
              <Paper
                key={t.id || t.referenceId}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  border: isOverdue ? '1px solid #FCA5A5' : '1px solid rgba(24, 36, 27, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  transition: 'border-color 0.15s ease-in-out',
                  '&:hover': { borderColor: isOverdue ? '#F87171' : 'rgba(1, 62, 24, 0.3)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1, minWidth: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleTaskStatus(t)}
                    sx={{ color: isCompleted ? '#10B981' : '#9CA3AF', p: 0.5, mt: 0.25 }}
                    aria-label={isCompleted ? 'Mark task incomplete' : 'Mark task complete'}
                  >
                    {isCompleted ? <CheckCircleIcon sx={{ fontSize: 22 }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 22 }} />}
                  </IconButton>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25, flexWrap: 'wrap' }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: isCompleted ? '#9CA3AF' : '#18241B',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          fontSize: '0.88rem',
                        }}
                      >
                        {t.title}
                      </Typography>
                      <Chip
                        label={(t.priority || 'medium').toUpperCase()}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          bgcolor: t.priority === 'urgent' || t.priority === 'high' ? '#FEE2E2' : '#FEF3C7',
                          color: t.priority === 'urgent' || t.priority === 'high' ? '#991B1B' : '#92400E',
                        }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#536458', mb: 0.75, fontSize: '0.80rem', lineHeight: 1.3 }}>
                      {t.description || t.entityTitle || 'Follow-up on inquiry specifications.'}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: isOverdue ? '#BE123C' : '#536458' }} />
                        <Typography variant="caption" sx={{ color: isOverdue ? '#BE123C' : '#536458', fontWeight: isOverdue ? 700 : 500, fontSize: '0.72rem' }}>
                          Due: {t.dueDate} {isOverdue && '(Overdue)'}
                        </Typography>
                      </Box>
                      {t.entityTitle && (
                        <Typography variant="caption" sx={{ color: '#013E18', fontWeight: 600, fontSize: '0.72rem' }}>
                          Linked: {t.entityTitle}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Create Task Modal */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: '16px' } },
        }}
      >
        <form onSubmit={handleCreateTask}>
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', pb: 1 }}>
            Create CRM Task or Follow-up
          </DialogTitle>
          <DialogContent dividers sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                size="small"
                label="Task Title"
                placeholder="e.g. Call buyer regarding DTCP approval copy..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <FormControl size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newTask.priority}
                    label="Priority"
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    sx={{ borderRadius: '8px' }}
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
                  size="small"
                  label="Due Date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Box>

              <TextField
                fullWidth
                size="small"
                label="Linked Entity (Lead or Property Name)"
                value={newTask.entityTitle}
                onChange={(e) => setNewTask({ ...newTask, entityTitle: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />

              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Action Description / Notes"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
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
              Save Task
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
