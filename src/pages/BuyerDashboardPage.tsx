import React, { useState } from 'react';
import { Property, LanguageCode, EnquirySubmission } from '../types/property';
import { translations } from '../i18n/translations';
import { formatPriceINR } from '../utils/propertyUtils';
import { PropertyCard } from '../components/property/PropertyCard';
import { useAppState } from '../context/AppStateContext';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BalanceIcon from '@mui/icons-material/Balance';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TuneIcon from '@mui/icons-material/Tune';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExploreIcon from '@mui/icons-material/Explore';

interface BuyerDashboardPageProps {
  enquiries: EnquirySubmission[];
  savedProperties: Property[];
  comparedProperties: Property[];
  lang: LanguageCode;
  onNavigate: (view: string, params?: any) => void;
  onSelectProperty: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleCompare: (id: string) => void;
}

export const BuyerDashboardPage: React.FC<BuyerDashboardPageProps> = ({
  enquiries,
  savedProperties,
  comparedProperties,
  lang,
  onNavigate,
  onSelectProperty,
  onToggleSave,
  onToggleCompare
}) => {
  const t = translations[lang];
  const { siteVisits, bookings } = useAppState();
  const [activeTab, setActiveTab] = useState<'overview' | 'enquiries' | 'saved' | 'settings'>('overview');
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  const navItems = [
    { id: 'overview', label: t.buyerDashboard.overview, icon: TuneIcon },
    { id: 'enquiries', label: `${t.buyerDashboard.myEnquiries} (${enquiries.length})`, icon: ChatBubbleOutlinedIcon },
    { id: 'saved', label: `${t.buyerDashboard.savedListings} (${savedProperties.length})`, icon: FavoriteIcon },
    { id: 'settings', label: 'Preferences', icon: SettingsIcon },
  ];

  const handleSavePrefs = () => {
    setPreferencesSaved(true);
    setTimeout(() => setPreferencesSaved(false), 3000);
  };

  return (
    <Box sx={{ bgcolor: '#FAF8F2', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl" disableGutters sx={{ maxWidth: '1280px !important', px: { xs: 2, sm: 3, md: 4 } }}>
        
        {/* Executive Welcome Strip */}
        <Paper
          elevation={1}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(24, 36, 27, 0.08)',
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
              <Box
                sx={{
                  width: { xs: 54, sm: 64 },
                  height: { xs: 54, sm: 64 },
                  borderRadius: '18px',
                  bgcolor: '#013E18',
                  color: '#C99325',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  boxShadow: '0 4px 14px rgba(1, 62, 24, 0.25)',
                  flexShrink: 0,
                }}
              >
                MS
              </Box>
              <Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B' }}>
                    Welcome back, Mohanraj S.
                  </Typography>
                  <Chip
                    size="small"
                    label="Verified Buyer Account"
                    sx={{
                      bgcolor: 'rgba(1, 62, 24, 0.08)',
                      color: '#013E18',
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      height: 22,
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.5, color: '#536458', fontSize: '0.75rem' }}>
                  <span>mohanrajs0410@gmail.com</span>
                  <span>•</span>
                  <span>+91 98422 71000</span>
                  <span>•</span>
                  <span>Coimbatore & Chennai Corridors</span>
                </Box>
              </Box>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<ExploreIcon sx={{ fontSize: 18, color: '#C99325' }} />}
              onClick={() => onNavigate('properties')}
              sx={{ borderRadius: '12px', fontWeight: 800, px: 2.5, py: 1 }}
            >
              Explore Marketplace
            </Button>
          </Box>
        </Paper>

        {/* Sidebar + Workspace Layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 9fr' }, gap: 4, alignItems: 'start' }}>
          
          {/* Sidebar */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
              <Typography variant="caption" sx={{ px: 1.5, py: 1, color: '#8C9A90', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block' }}>
                Buyer Workspace
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'row', lg: 'column' }, gap: 1, overflowX: 'auto', pb: { xs: 1, lg: 0 } }}>
                {navItems.map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      startIcon={<Icon sx={{ fontSize: 18, color: active ? '#C99325' : 'text.secondary' }} />}
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1.2,
                        px: 2,
                        borderRadius: '12px',
                        fontWeight: active ? 800 : 600,
                        fontSize: '0.8rem',
                        bgcolor: active ? '#013E18' : 'transparent',
                        color: active ? '#FFFFFF' : '#536458',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          bgcolor: active ? '#00280F' : '#FAF8F2',
                          color: active ? '#FFFFFF' : '#013E18',
                        },
                      }}
                    >
                      {tab.label}
                    </Button>
                  );
                })}
              </Box>

              <Box sx={{ display: { xs: 'none', lg: 'block' }, mt: 2, pt: 2, borderTop: '1px solid #ECE7DA', px: 1 }}>
                <Box
                  component="button"
                  onClick={() => onNavigate('compare')}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: '10px',
                    color: '#013E18',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    '&:hover': { bgcolor: '#FAF8F2' },
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <BalanceIcon sx={{ fontSize: 18, color: '#C99325' }} />
                    <span>Compare Tray</span>
                  </Box>
                  <Chip label={`${comparedProperties.length}/4`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                </Box>
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #ECE7DA', display: { xs: 'none', lg: 'flex' }, gap: 1.5, alignItems: 'flex-start' }}>
              <VerifiedUserIcon sx={{ fontSize: 18, color: '#013E18', flexShrink: 0, mt: 0.3 }} />
              <Typography variant="caption" sx={{ color: '#536458', fontSize: '0.72rem', lineHeight: 1.5 }}>
                {lang === 'ta'
                  ? 'நேரடி சி.ஆர்.எம் தொடர்பு: உங்கள் தளப் பார்வை கோரிக்கைகள் மற்றும் சேமிக்கப்பட்ட பட்டியல்கள் அனைத்தும் கிரவுண்ட்ஸ் அண்ட் கேட்ஸ் ஆலோசகர் தளத்துடன் இணைக்கப்பட்டுள்ளன.'
                  : 'Live Client Desk: All walkthrough requests and saved properties connect directly with Grounds & Gates property advisors.'}
              </Typography>
            </Paper>
          </Box>

          {/* Main Dashboard Workspace */}
          <Box sx={{ minWidth: 0 }}>
            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* KPI Metric Cards */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                  <Card sx={{ p: 2.5, borderRadius: '18px', borderTop: '3px solid #013E18' }}>
                    <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                      {t.buyerDashboard.statsSaved}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#013E18', my: 0.5 }}>
                      {savedProperties.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#536458' }}>
                      Shortlisted estates
                    </Typography>
                  </Card>

                  <Card sx={{ p: 2.5, borderRadius: '18px', borderTop: '3px solid #C99325' }}>
                    <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                      {t.buyerDashboard.statsEnquiries}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#C99325', my: 0.5 }}>
                      {enquiries.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#536458' }}>
                      Direct seller requests
                    </Typography>
                  </Card>

                  <Card sx={{ p: 2.5, borderRadius: '18px', borderTop: '3px solid #013E18' }}>
                    <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                      {t.buyerDashboard.statsVisits}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#013E18', my: 0.5 }}>
                      {siteVisits.length || enquiries.filter(e => e.visitDate).length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#536458' }}>
                      Walkthroughs booked
                    </Typography>
                  </Card>

                  <Card sx={{ p: 2.5, borderRadius: '18px', borderTop: '3px solid #8C9A90' }}>
                    <Typography variant="caption" sx={{ color: '#8C9A90', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                      {t.buyerDashboard.statsViewed}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#536458', my: 0.5 }}>
                      14
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#536458' }}>
                      Listings explored
                    </Typography>
                  </Card>
                </Box>

                {/* Recent Enquiries Section */}
                <Paper elevation={1} sx={{ p: { xs: 3, sm: 4 }, borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
                      Recent Site Visits & Enquiries
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setActiveTab('enquiries')}
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      sx={{ fontWeight: 700, color: '#013E18', fontSize: '0.75rem' }}
                    >
                      View All ({enquiries.length})
                    </Button>
                  </Box>

                  {enquiries.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#FAF8F2', borderRadius: '16px', border: '1px dashed #ECE7DA' }}>
                      <CalendarTodayIcon sx={{ fontSize: 32, color: '#C99325', mx: 'auto', mb: 1, opacity: 0.8 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#18241B' }}>
                        No site visits requested yet
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#536458', display: 'block', mt: 0.5, mb: 2 }}>
                        Explore verified listings and schedule a site inspection directly with our property desk.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => onNavigate('properties')}
                        sx={{ borderRadius: '10px', fontWeight: 800 }}
                      >
                        Browse Properties
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {enquiries.slice(0, 3).map(enq => (
                        <Box
                          key={enq.id}
                          sx={{
                            p: 2.5,
                            borderRadius: '16px',
                            border: '1px solid #ECE7DA',
                            bgcolor: '#FAF8F2',
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { sm: 'center' },
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#18241B' }}>
                              {enq.propertyTitle}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#536458', display: 'block', mt: 0.2 }}>
                              {enq.propertyLocation} • {formatPriceINR(enq.propertyPrice)}
                            </Typography>
                            {enq.visitDate && (
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.8, color: '#013E18' }}>
                                <CalendarTodayIcon sx={{ fontSize: 14, color: '#C99325' }} />
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                  Visit scheduled for {enq.visitDate} ({enq.preferredTimeSlot})
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexShrink: 0 }}>
                            <Chip
                              label={enq.status}
                              size="small"
                              sx={{
                                bgcolor: '#ECFDF5',
                                color: '#065F46',
                                fontWeight: 700,
                                fontSize: '0.65rem',
                                height: 24,
                              }}
                            />
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => onSelectProperty(enq.propertyId)}
                              sx={{
                                borderRadius: '10px',
                                borderColor: '#ECE7DA',
                                color: '#18241B',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                py: 0.5,
                              }}
                            >
                              View Listing
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>

                {/* Saved Preview */}
                <Paper elevation={1} sx={{ p: { xs: 3, sm: 4 }, borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
                      Shortlisted Properties ({savedProperties.length})
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => onNavigate('favorites')}
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      sx={{ fontWeight: 700, color: '#013E18', fontSize: '0.75rem' }}
                    >
                      Manage Saved
                    </Button>
                  </Box>

                  {savedProperties.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#FAF8F2', borderRadius: '16px', border: '1px dashed #ECE7DA' }}>
                      <FavoriteIcon sx={{ fontSize: 32, color: '#FDA4AF', mx: 'auto', mb: 1, opacity: 0.8 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#18241B' }}>
                        Your shortlist is empty
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#536458' }}>
                        Save plots or villas to compare and revisit later.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 3 }}>
                      {savedProperties.slice(0, 3).map(prop => (
                        <PropertyCard
                          key={prop.id}
                          property={prop}
                          lang={lang}
                          isSaved={true}
                          onToggleSave={onToggleSave}
                          isCompared={comparedProperties.some(c => c.id === prop.id)}
                          onToggleCompare={onToggleCompare}
                          onSelect={onSelectProperty}
                        />
                      ))}
                    </Box>
                  )}
                </Paper>
              </Box>
            )}

            {/* Tab 2: Enquiries Detailed */}
            {activeTab === 'enquiries' && (
              <Paper elevation={1} sx={{ p: { xs: 3, sm: 4 }, borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B', mb: 3 }}>
                  All Submitted Inquiries & Site Visits
                </Typography>

                {enquiries.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#FAF8F2', borderRadius: '16px', border: '1px dashed #ECE7DA' }}>
                    <CalendarTodayIcon sx={{ fontSize: 40, color: '#C99325', mx: 'auto', mb: 1.5, opacity: 0.8 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#18241B' }}>
                      No Active Enquiries Logged
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#536458', mt: 0.5 }}>
                      Submit an enquiry or request a walkthrough on any property brochure.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {enquiries.map(enq => (
                      <Box
                        key={enq.id}
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          border: '1px solid #ECE7DA',
                          bgcolor: '#FAF8F2',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#013E18' }}>
                            {enq.propertyTitle}
                          </Typography>
                          <Chip
                            label={`Status: ${enq.status}`}
                            size="small"
                            sx={{
                              bgcolor: '#ECFDF5',
                              color: '#065F46',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5, py: 1.5, borderTop: '1px solid #ECE7DA', color: '#536458', fontSize: '0.8rem' }}>
                          <div>Location: <strong style={{ color: '#18241B' }}>{enq.propertyLocation}</strong></div>
                          <div>Quoted Price: <strong style={{ color: '#18241B' }}>{formatPriceINR(enq.propertyPrice)}</strong></div>
                          <div>Submitted: <strong style={{ color: '#18241B' }}>{new Date(enq.submittedAt).toLocaleDateString()}</strong></div>
                        </Box>

                        {enq.visitDate && (
                          <Box sx={{ mt: 1, p: 1.5, bgcolor: '#FFFFFF', borderRadius: '10px', border: '1px solid #ECE7DA', fontSize: '0.8rem', fontWeight: 600, color: '#18241B' }}>
                            Scheduled Visit: <strong style={{ color: '#013E18' }}>{enq.visitDate}</strong> ({enq.preferredTimeSlot})
                          </Box>
                        )}

                        {enq.message && (
                          <Typography variant="caption" sx={{ color: '#8C9A90', fontStyle: 'italic', display: 'block', mt: 1 }}>
                            "{enq.message}"
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            )}

            {/* Tab 3: Saved */}
            {activeTab === 'saved' && (
              <Box>
                {savedProperties.length === 0 ? (
                  <Paper elevation={1} sx={{ p: 6, textAlign: 'center', borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
                    <FavoriteIcon sx={{ fontSize: 40, color: '#FDA4AF', mx: 'auto', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
                      No Saved Properties Yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#536458', mt: 0.5, mb: 3 }}>
                      Click the heart icon on any residence, plot, or agricultural tract to keep track of your shortlist.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => onNavigate('properties')}
                      sx={{ borderRadius: '12px', fontWeight: 800, px: 3 }}
                    >
                      Explore Properties
                    </Button>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 3.5 }}>
                    {savedProperties.map(prop => (
                      <PropertyCard
                        key={prop.id}
                        property={prop}
                        lang={lang}
                        isSaved={true}
                        onToggleSave={onToggleSave}
                        isCompared={comparedProperties.some(c => c.id === prop.id)}
                        onToggleCompare={onToggleCompare}
                        onSelect={onSelectProperty}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* Tab 4: Preferences */}
            {activeTab === 'settings' && (
              <Paper elevation={1} sx={{ p: { xs: 3, sm: 4 }, borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
                  Buyer Notifications & Search Preferences
                </Typography>
                <Typography variant="body2" sx={{ color: '#536458', mt: 0.5, mb: 3 }}>
                  Manage how Grounds & Gates alerts you for new launches and price adjustments.
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#FAF8F2', border: '1px solid #ECE7DA', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#013E18', width: 18, height: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#18241B', fontSize: '0.85rem' }}>
                      Receive WhatsApp instant alerts when new DTCP plots in Coimbatore match my budget
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#FAF8F2', border: '1px solid #ECE7DA', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#013E18', width: 18, height: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#18241B', fontSize: '0.85rem' }}>
                      Email me price reductions and legal status updates on saved properties
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSavePrefs}
                    sx={{ borderRadius: '12px', fontWeight: 800, px: 3, py: 1 }}
                  >
                    Save Preferences
                  </Button>
                  {preferencesSaved && (
                    <Alert severity="success" sx={{ py: 0.5, px: 2, borderRadius: '10px' }}>
                      Preferences updated
                    </Alert>
                  )}
                </Box>
              </Paper>
            )}

          </Box>
        </Box>

      </Container>
    </Box>
  );
};
