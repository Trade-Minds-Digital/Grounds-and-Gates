import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { api } from '../../../services/api';
import { Developer, Project } from '../../../types/demo';
import { AdminUser } from '../../../types/crm';
import { LanguageCode } from '../../../types/property';
import { formatPriceINR } from '../../../utils/propertyUtils';

interface AdminProjectsModuleProps {
  currentUser: AdminUser;
  lang: LanguageCode;
}

export const AdminProjectsModule: React.FC<AdminProjectsModuleProps> = ({ currentUser, lang }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'developers'>('projects');
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    district: 'Coimbatore',
    locality: 'Saravanampatti',
    totalUnits: 48,
    availableUnits: 12,
    approvalAuthority: 'DTCP',
    description: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projRes, devRes] = await Promise.all([
        api.getProjects(),
        api.getDevelopers(),
      ]);
      setProjects(projRes || []);
      setDevelopers(devRes || []);
    } catch (e) {
      console.warn('Failed to load projects/developers:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;
    try {
      await api.createProject({
        ...newProject,
        approvalAuthority: (newProject.approvalAuthority as 'CMDA' | 'DTCP' | 'RERA') || 'DTCP',
        id: `proj-${Date.now()}`,
        status: 'ready-to-occupy',
        priceRange: { min: 4500000, max: 9500000 },
        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'],
      });
      setCreateProjectModalOpen(false);
      fetchData();
    } catch (e: any) {
      alert(`Failed to save project: ${e.message}`);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B' }}>
            {lang === 'ta' ? 'டவுன்ஷிப் திட்டங்கள் & கட்டுநர்கள்' : 'Projects & Developers Management'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25 }}>
            Manage gated communities, builder partnerships, and linked inventory units.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant={activeTab === 'projects' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setActiveTab('projects')}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: activeTab === 'projects' ? '#013E18' : 'transparent',
              borderColor: '#013E18',
              color: activeTab === 'projects' ? '#F5F2E9' : '#013E18',
            }}
          >
            Projects ({projects.length})
          </Button>

          <Button
            variant={activeTab === 'developers' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setActiveTab('developers')}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: activeTab === 'developers' ? '#013E18' : 'transparent',
              borderColor: '#013E18',
              color: activeTab === 'developers' ? '#F5F2E9' : '#013E18',
            }}
          >
            Developers ({developers.length})
          </Button>
        </Box>
      </Box>

      {/* Projects Grid */}
      {activeTab === 'projects' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {projects.map((proj) => (
            <Paper
              key={proj.id}
              elevation={1}
              sx={{
                p: 3,
                borderRadius: '18px',
                bgcolor: '#FFFFFF',
                border: '1px solid rgba(24, 36, 27, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#013E18' }}>
                  {proj.name}
                </Typography>
                <Chip
                  label={proj.status.toUpperCase()}
                  size="small"
                  sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 700, fontSize: '0.7rem' }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: '#536458', mb: 2 }}>
                {proj.locality}, {proj.district}
              </Typography>

              <Box sx={{ p: 2, bgcolor: '#FAF8F2', borderRadius: '12px', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#536458', fontWeight: 600 }}>Total Units:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#18241B' }}>{proj.totalUnits}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#536458', fontWeight: 600 }}>Available Units:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#013E18' }}>{proj.availableUnits}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#536458', fontWeight: 600 }}>Approval:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#8B6413' }}>{proj.approvalAuthority || 'DTCP'}</Typography>
                </Box>
              </Box>

              <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 2 }}>
                {proj.description?.slice(0, 90)}...
              </Typography>

              <Chip
                label={`Price: ${formatPriceINR(proj.priceRange?.min || 0)} - ${formatPriceINR(proj.priceRange?.max || 0)}`}
                size="small"
                sx={{ bgcolor: '#FAF8F2', fontWeight: 700, fontSize: '0.75rem' }}
              />
            </Paper>
          ))}
        </Box>
      )}

      {/* Developers Grid */}
      {activeTab === 'developers' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {developers.map((dev) => (
            <Paper
              key={dev.id}
              elevation={1}
              sx={{
                p: 3,
                borderRadius: '18px',
                bgcolor: '#FFFFFF',
                border: '1px solid rgba(24, 36, 27, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
                  {dev.name}
                </Typography>
                {dev.verified && (
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                    label="Verified Partner"
                    size="small"
                    color="success"
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                )}
              </Box>

              <Typography variant="caption" sx={{ color: '#8B6413', fontWeight: 700, display: 'block', mb: 1.5 }}>
                {dev.headquarters} • {dev.experienceYears} Years Track Record
              </Typography>

              <Typography variant="body2" sx={{ color: '#536458', mb: 2 }}>
                {dev.description}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid #F3F4F6' }}>
                <Typography variant="caption" sx={{ color: '#536458' }}>Contact: {dev.contactPhone}</Typography>
                <Typography variant="caption" sx={{ color: '#013E18', fontWeight: 700 }}>{dev.completedProjectsCount} Completed Layouts</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};
