import React, { useState } from 'react';
import { Property, LanguageCode } from '../types/property';
import { translations } from '../i18n/translations';
import { formatPriceINR, formatArea, findPropertyDifferences } from '../utils/propertyUtils';
import { Badge } from '../components/common/Badge';
import {
  Container,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import BalanceIcon from '@mui/icons-material/Balance';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface ComparePageProps {
  comparedProperties: Property[];
  allProperties: Property[];
  lang: LanguageCode;
  onRemoveFromCompare: (id: string) => void;
  onAddToCompare: (id: string) => void;
  onSelectProperty: (id: string) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  comparedProperties,
  allProperties,
  lang,
  onRemoveFromCompare,
  onAddToCompare,
  onSelectProperty,
  onNavigate
}) => {
  const t = translations[lang];
  const [highlightDiffs, setHighlightDiffs] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const diffFields = findPropertyDifferences(comparedProperties);

  // Available properties to add to comparison (up to 4 max)
  const candidateProperties = allProperties.filter(
    p => !comparedProperties.some(cp => cp.id === p.id)
  );

  if (comparedProperties.length === 0) {
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
              bgcolor: 'rgba(1, 62, 24, 0.1)',
              color: '#013E18',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <BalanceIcon sx={{ fontSize: 36, color: '#013E18' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B', mb: 1 }}>
            {t.compare.emptyTitle}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', lineHeight: 1.6, mb: 3 }}>
            {t.compare.emptySubtitle}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => onNavigate('properties')}
            sx={{ borderRadius: '12px', fontWeight: 800, px: 3.5, py: 1.2 }}
          >
            {t.compare.browseCta}
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#FAF8F2', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl" disableGutters sx={{ maxWidth: '1280px !important', px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Page Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            gap: 2,
            mb: 5,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                size="small"
                icon={<BalanceIcon sx={{ fontSize: 14, color: '#C99325' }} />}
                label="Side-by-Side Evaluation"
                sx={{
                  bgcolor: 'rgba(201, 147, 37, 0.12)',
                  color: '#8B6413',
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  height: 22,
                }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#18241B', letterSpacing: '-0.02em' }}>
              {t.compare.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#536458', mt: 0.5, maxWidth: 600 }}>
              {t.compare.subtitle}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {/* Highlight Differences Toggle */}
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 0.5,
                bgcolor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECE7DA',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={highlightDiffs}
                    onChange={(e) => setHighlightDiffs(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B' }}>
                    {t.compare.highlightDifferences}
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Paper>

            {comparedProperties.length < 4 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon sx={{ fontSize: 18, color: '#C99325' }} />}
                onClick={() => setShowAddModal(true)}
                sx={{ borderRadius: '12px', fontWeight: 800, fontSize: '0.75rem', py: 1, px: 2 }}
              >
                {t.compare.addProperty} ({comparedProperties.length}/4)
              </Button>
            )}
          </Box>
        </Box>

        {/* Comparison Matrix Table */}
        <TableContainer
          component={Paper}
          elevation={1}
          sx={{
            borderRadius: '24px',
            border: '1px solid rgba(24, 36, 27, 0.08)',
            overflowX: 'auto',
            bgcolor: '#FFFFFF',
          }}
        >
          <Table sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FAF8F2' }}>
                <TableCell sx={{ width: 190, fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', color: '#8C9A90', letterSpacing: '0.05em' }}>
                  Feature / Property
                </TableCell>
                {comparedProperties.map(prop => (
                  <TableCell key={prop.id} sx={{ width: 280, verticalAlign: 'top', p: 2.5 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Box sx={{ position: 'relative', height: 160, borderRadius: '12px', overflow: 'hidden', mb: 1.5, bgcolor: '#ECE7DA' }}>
                        <Box
                          component="img"
                          src={prop.images[0]}
                          alt={prop.title}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => onRemoveFromCompare(prop.id)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: '#FFFFFF',
                            p: 0.6,
                            '&:hover': { bgcolor: '#E11D48' },
                          }}
                          title={t.compare.remove}
                        >
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                          <Badge type="demo" size="sm" />
                        </Box>
                      </Box>

                      <Typography
                        variant="subtitle2"
                        onClick={() => onSelectProperty(prop.id)}
                        sx={{
                          fontWeight: 800,
                          color: '#18241B',
                          cursor: 'pointer',
                          lineHeight: 1.3,
                          '&:hover': { color: '#013E18' },
                        }}
                        noWrap
                      >
                        {lang === 'ta' && prop.tamilTitle ? prop.tamilTitle : prop.title}
                      </Typography>

                      <Typography variant="body2" sx={{ fontWeight: 900, color: '#013E18', mt: 0.5 }}>
                        {formatPriceINR(prop.price, prop.listingType, prop.priceUnit)}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Ownership Type */}
              <TableRow sx={{ bgcolor: highlightDiffs && diffFields.includes('ownershipType') ? 'rgba(254, 243, 199, 0.4)' : 'transparent' }}>
                <TableCell sx={{ fontWeight: 700, color: '#536458', fontSize: '0.8rem' }}>{t.compare.ownership}</TableCell>
                {comparedProperties.map(prop => (
                  <TableCell key={prop.id}>
                    {prop.ownershipType === 'company' ? (
                      <Badge type="company" size="sm" />
                    ) : (
                      <Badge type="third-party" label={prop.seller.badgeTitle} size="sm" />
                    )}
                  </TableCell>
                ))}
              </TableRow>

              {/* Category */}
              <TableRow sx={{ bgcolor: highlightDiffs && diffFields.includes('category') ? 'rgba(254, 243, 199, 0.4)' : 'transparent' }}>
                <TableCell sx={{ fontWeight: 700, color: '#536458', fontSize: '0.8rem' }}>{t.compare.category}</TableCell>
                {comparedProperties.map(prop => (
                  <TableCell key={prop.id} sx={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.8rem' }}>
                    {prop.category.replace('-', ' ')}
                  </TableCell>
                ))}
              </TableRow>

              {/* Price */}
              <TableRow sx={{ bgcolor: highlightDiffs && diffFields.includes('price') ? 'rgba(254, 243, 199, 0.4)' : 'transparent' }}>
                <TableCell sx={{ fontWeight: 700, color: '#536458', fontSize: '0.8rem' }}>{t.compare.price}</TableCell>
                {comparedProperties.map(prop => (
                  <TableCell key={prop.id}>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: '#013E18' }}>
                      {formatPriceINR(prop.price, prop.listingType, prop.priceUnit)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8C9A90', display: 'block' }}>
                      {prop.negotiable ? 'Negotiable' : 'Fixed Corporate Price'}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>

              {/* Location */}
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#536458', fontSize: '0.8rem' }}>{t.compare.locality}</TableCell>
                {comparedProperties.map(prop => (
                  <TableCell key={prop.id} sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                    <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                      <LocationOnIcon sx={{ fontSize: 14, color: '#C99325' }} />
                      <span>{prop.location}, {prop.district}</span>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>

              {/* Plot Area */}
              <TableRow sx={{ bgcolor: highlightDiffs && diffFields.includes('plotArea') ? 'rgba(254, 243, 199, 0.4)' : 'transparent' }}>
                <TableCell sx={{ fontWeight: 700, color: '#536458', fontSize: '0.8rem' }}>{t.compare.plotArea}</TableCell>
                {comparedProperties.map(prop => (
                  <TableCell key={prop.id} sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                    {formatArea(prop.plotArea, prop.plotAreaUnit)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Built-up Area */}
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#536458', fontSize: '0.8rem' }}>{t.compare.builtUpArea}</TableCell>
                {comparedProperties.map(prop => (
                  <TableCell key={prop.id} sx={{ fontSize: '0.8rem', color: '#536458' }}>
                    {prop.builtUpArea ? `${prop.builtUpArea} sq.ft` : 'N/A (Plot)'}
                  </TableCell>
                ))}
              </TableRow>

              {/* Bedrooms & Bathrooms */}
              <TableRow sx={{ bgcolor: highlightDiffs && diffFields.includes('bedrooms') ? 'rgba(254, 243, 199, 0.4)' : 'transparent' }}>
                <TableCell sx={{ fontWeight: 700, color: '#536458', fontSize: '0.8rem' }}>{t.compare.bedrooms}</TableCell>
                {comparedProperties.map(prop => (
                  <TableCell key={prop.id} sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
                    {prop.bedrooms ? `${prop.bedrooms} BHK (${prop.bathrooms || 1} Baths)` : 'N/A (Plot)'}
                  </TableCell>
                ))}
              </TableRow>

              {/* Facing */}
              <TableRow sx={{ bgcolor: highlightDiffs && diffFields.includes('facing') ? 'rgba(254, 243, 199, 0.4)' : 'transparent' }}>
                <TableCell sx={{ fontWeight: 700, color: '#536458', fontSize: '0.8rem' }}>{t.compare.facing}</TableCell>
                {comparedProperties.map(prop => (
                  <TableCell key={prop.id} sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {prop.facing}
                  </TableCell>
                ))}
              </TableRow>

              {/* Road Width */}
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#536458', fontSize: '0.8rem' }}>{t.compare.roadWidth}</TableCell>
                {comparedProperties.map(prop => (
                  <TableCell key={prop.id} sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                    {prop.roadWidthFeet || 30} Feet Blacktop
                  </TableCell>
                ))}
              </TableRow>

              {/* Approval Authority */}
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#536458', fontSize: '0.8rem' }}>{t.compare.approval}</TableCell>
                {comparedProperties.map(prop => (
                  <TableCell key={prop.id}>
                    <Chip
                      size="small"
                      label={prop.approvalAuthority || 'Clear Patta'}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        bgcolor: '#ECFDF5',
                        color: '#065F46',
                        height: 24,
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>

              {/* Amenities List */}
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#536458', fontSize: '0.8rem' }}>{t.compare.amenities}</TableCell>
                {comparedProperties.map(prop => (
                  <TableCell key={prop.id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      {prop.amenities.slice(0, 4).map((a, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', fontSize: '0.75rem', color: '#536458' }}>
                          <CheckIcon sx={{ fontSize: 14, color: '#013E18', flexShrink: 0 }} />
                          <span>{a}</span>
                        </Box>
                      ))}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>

              {/* Action Buttons */}
              <TableRow sx={{ bgcolor: '#FAF8F2' }}>
                <TableCell sx={{ fontWeight: 700, color: '#536458', fontSize: '0.8rem' }}>{t.compare.action}</TableCell>
                {comparedProperties.map(prop => (
                  <TableCell key={prop.id}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14, color: '#C99325' }} />}
                      onClick={() => onSelectProperty(prop.id)}
                      sx={{ borderRadius: '10px', fontWeight: 800, py: 0.8 }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Add Property Modal */}
      <Dialog
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              p: 2.5,
              bgcolor: '#FFFFFF',
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
            Select Property to Compare
          </Typography>
          <IconButton onClick={() => setShowAddModal(false)} size="small">
            <CloseIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 1 }}>
          <Box sx={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {candidateProperties.map(prop => (
              <Box
                key={prop.id}
                onClick={() => {
                  onAddToCompare(prop.id);
                  setShowAddModal(false);
                }}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: '14px',
                  border: '1px solid #ECE7DA',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#013E18',
                    bgcolor: '#FAF8F2',
                  },
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={prop.images[0]}
                    alt=""
                    sx={{ width: 50, height: 42, borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#18241B', fontSize: '0.8rem' }} noWrap>
                      {prop.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8C9A90', fontSize: '0.7rem' }}>
                      {prop.location}, {prop.district}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#013E18', fontSize: '0.8rem', flexShrink: 0 }}>
                  {formatPriceINR(prop.price, prop.listingType, prop.priceUnit)}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
