import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';

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
              {lang === 'ta' ? 'டவுன்ஷிப் திட்டங்கள் & கட்டுநர்கள்' : 'Projects & Developers Management'}
            </Typography>
            <Chip
              label={`${projects.length} Projects • ${developers.length} Developers`}
              size="small"
              sx={{ bgcolor: '#FAF8F2', color: '#013E18', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.25, fontSize: '0.82rem' }}>
            Manage gated communities, builder partnerships, and linked inventory units.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={activeTab === 'projects' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setActiveTab('projects')}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.80rem',
              py: 0.5,
              px: 1.5,
              bgcolor: activeTab === 'projects' ? '#013E18' : 'transparent',
              borderColor: '#013E18',
              color: activeTab === 'projects' ? '#F5F2E9' : '#013E18',
              '&:hover': { bgcolor: activeTab === 'projects' ? '#00280F' : 'rgba(1, 62, 24, 0.05)' },
            }}
          >
            Projects ({projects.length})
          </Button>

          <Button
            variant={activeTab === 'developers' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setActiveTab('developers')}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.80rem',
              py: 0.5,
              px: 1.5,
              bgcolor: activeTab === 'developers' ? '#013E18' : 'transparent',
              borderColor: '#013E18',
              color: activeTab === 'developers' ? '#F5F2E9' : '#013E18',
              '&:hover': { bgcolor: activeTab === 'developers' ? '#00280F' : 'rgba(1, 62, 24, 0.05)' },
            }}
          >
            Developers ({developers.length})
          </Button>
        </Box>
      </Box>

      {/* Loading State */}
      {isLoading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={32} sx={{ color: '#013E18' }} />
        </Box>
      ) : activeTab === 'projects' ? (
        /* Projects Grid */
        projects.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
            <ApartmentIcon sx={{ fontSize: 44, color: '#9CA3AF', mb: 1.5 }} />
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#18241B', mb: 0.5 }}>
              No township projects recorded
            </Typography>
            <Typography variant="body2" sx={{ color: '#536458' }}>
              Create gated communities or township layouts to link developer inventory.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2.5 }}>
            {projects.map((proj) => (
              <Paper
                key={proj.id}
                elevation={0}
                sx={{
                  p: 2.25,
                  borderRadius: '14px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid rgba(24, 36, 27, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#013E18', fontSize: '0.95rem', lineHeight: 1.25 }}>
                      {proj.name}
                    </Typography>
                    <Chip
                      label={(proj.status || 'active').toUpperCase()}
                      size="small"
                      sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                    />
                  </Box>

                  <Typography variant="caption" sx={{ color: '#536458', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, fontSize: '0.74rem' }}>
                    <LocationOnIcon sx={{ fontSize: 13 }} />
                    {proj.locality}, {proj.district}
                  </Typography>

                  <Box sx={{ p: 1.5, bgcolor: '#FAF8F2', borderRadius: '10px', mb: 1.5, border: '1px solid rgba(201, 147, 37, 0.15)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#536458', fontWeight: 600, fontSize: '0.72rem' }}>Total Units:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.72rem' }}>{proj.totalUnits}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#536458', fontWeight: 600, fontSize: '0.72rem' }}>Available Units:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#013E18', fontSize: '0.72rem' }}>{proj.availableUnits}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ color: '#536458', fontWeight: 600, fontSize: '0.72rem' }}>Approval Authority:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#8B6413', fontSize: '0.72rem' }}>{proj.approvalAuthority || 'DTCP'}</Typography>
                    </Box>
                  </Box>

                  <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1.5, fontSize: '0.74rem', lineHeight: 1.4 }}>
                    {proj.description?.slice(0, 95)}...
                  </Typography>
                </Box>

                <Chip
                  label={`Price: ${formatPriceINR(proj.priceRange?.min || 0)} - ${formatPriceINR(proj.priceRange?.max || 0)}`}
                  size="small"
                  sx={{ bgcolor: '#FAF8F2', fontWeight: 700, fontSize: '0.72rem', alignSelf: 'flex-start', height: 22 }}
                />
              </Paper>
            ))}
          </Box>
        )
      ) : (
        /* Developers Grid */
        developers.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
            <BusinessIcon sx={{ fontSize: 44, color: '#9CA3AF', mb: 1.5 }} />
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#18241B', mb: 0.5 }}>
              No developers registered
            </Typography>
            <Typography variant="body2" sx={{ color: '#536458' }}>
              Add verified real-estate builders and corporate land developers.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
            {developers.map((dev) => (
              <Paper
                key={dev.id}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '14px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid rgba(24, 36, 27, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#18241B', fontSize: '1rem' }}>
                      {dev.name}
                    </Typography>
                    {dev.verified && (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: '13px !important' }} />}
                        label="Verified Partner"
                        size="small"
                        color="success"
                        sx={{ fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                      />
                    )}
                  </Box>

                  <Typography variant="caption" sx={{ color: '#8B6413', fontWeight: 700, display: 'block', mb: 1, fontSize: '0.74rem' }}>
                    {dev.headquarters} • {dev.experienceYears} Years Track Record
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#536458', mb: 2, fontSize: '0.80rem', lineHeight: 1.4 }}>
                    {dev.description}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid rgba(24, 36, 27, 0.06)' }}>
                  <Typography variant="caption" sx={{ color: '#536458', fontSize: '0.72rem' }}>Contact: {dev.contactPhone}</Typography>
                  <Typography variant="caption" sx={{ color: '#013E18', fontWeight: 700, fontSize: '0.72rem' }}>{dev.completedProjectsCount} Completed Layouts</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        )
      )}
    </Box>
  );
};
