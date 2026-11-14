import React from 'react';
import { Property, LanguageCode } from '../types/property';
import { PropertyCard } from '../components/property/PropertyCard';
import { translations } from '../i18n/translations';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Chip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import BalanceIcon from '@mui/icons-material/Balance';

interface FavoritesPageProps {
  savedProperties: Property[];
  lang: LanguageCode;
  onToggleSave: (id: string) => void;
  comparedPropertyIds: string[];
  onToggleCompare: (id: string) => void;
  onSelectProperty: (id: string) => void;
  onNavigate: (view: string, params?: any) => void;
  onClearAll: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  savedProperties,
  lang,
  onToggleSave,
  comparedPropertyIds,
  onToggleCompare,
  onSelectProperty,
  onNavigate,
  onClearAll
}) => {
  const t = translations[lang];

  if (savedProperties.length === 0) {
    return (
      <Box sx={{ bgcolor: '#FAF8F2', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper
          elevation={1}
          sx={{
            maxWidth: 450,
            width: '100%',
            p: { xs: 4, sm: 5 },
            textAlign: 'center',
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(225, 29, 72, 0.08)',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <FavoriteIcon sx={{ fontSize: 36, color: '#E11D48' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B', mb: 1 }}>
            {t.favorites.emptyTitle}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', lineHeight: 1.6, mb: 3 }}>
            {t.favorites.emptySubtitle}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => onNavigate('properties')}
            sx={{ borderRadius: '12px', fontWeight: 800, px: 3.5, py: 1.2 }}
          >
            {t.favorites.browseCta}
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#FAF8F2', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl" disableGutters sx={{ maxWidth: '1280px !important', px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            gap: 2,
            mb: 5,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                size="small"
                icon={<FavoriteIcon sx={{ fontSize: 14, color: '#BE123C' }} />}
                label="Shortlisted Listings"
                sx={{
                  bgcolor: 'rgba(225, 29, 72, 0.1)',
                  color: '#BE123C',
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  height: 22,
                }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#18241B', letterSpacing: '-0.02em' }}>
              {t.favorites.title} ({savedProperties.length})
            </Typography>
            <Typography variant="body2" sx={{ color: '#536458', mt: 0.5 }}>
              {t.favorites.subtitle}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DeleteOutlineIcon sx={{ fontSize: 18 }} />}
              onClick={onClearAll}
              sx={{
                borderRadius: '12px',
                borderColor: '#ECE7DA',
                color: '#536458',
                fontWeight: 700,
                fontSize: '0.75rem',
                '&:hover': {
                  borderColor: '#E11D48',
                  color: '#E11D48',
                  bgcolor: 'rgba(225, 29, 72, 0.05)',
                },
              }}
            >
              {t.favorites.clearAll}
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<BalanceIcon sx={{ fontSize: 18, color: '#C99325' }} />}
              onClick={() => onNavigate('compare')}
              sx={{
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.75rem',
                px: 2,
              }}
            >
              Compare Selected ({comparedPropertyIds.length})
            </Button>
          </Box>
        </Box>

        {/* Saved Listings Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3.5,
          }}
        >
          {savedProperties.map(prop => (
            <PropertyCard
              key={prop.id}
              property={prop}
              lang={lang}
              isSaved={true}
              onToggleSave={onToggleSave}
              isCompared={comparedPropertyIds.includes(prop.id)}
              onToggleCompare={onToggleCompare}
              onSelect={onSelectProperty}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};
