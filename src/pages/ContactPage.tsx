import React, { useState } from 'react';
import { LanguageCode } from '../types/property';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Paper,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface ContactPageProps {
  lang: LanguageCode;
  onNavigate: (view: string, params?: any) => void;
  onShowToast?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ lang: _lang, onNavigate: _onNavigate, onShowToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    district: 'Coimbatore',
    inquiryType: 'buying',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please provide your name and contact phone number.');
      return;
    }

    setSubmitted(true);
    if (onShowToast) {
      onShowToast('Enquiry received! Our desk coordinator will reach out shortly.', 'success');
    }
  };

  const faqs = [
    {
      q: 'What is the difference between Grounds & Gates Direct and Third-Party listings?',
      a: 'Grounds & Gates Direct listings are company-developed or exclusively managed land parcels with zero buyer brokerage, single-point legal accountability, and direct site tour assistance. Third-Party listings are posted by verified private owners, licensed builders, or channel brokers with direct contact information provided.'
    },
    {
      q: 'How does Grounds & Gates verify land approvals (DTCP / CMDA)?',
      a: 'Every direct listing displays its official approval order number and year (e.g. DTCP No, CMDA Planning Permit). Our legal audit team cross-verifies parent title deeds, encumbrance certificates (EC), and patta ownership with local sub-registrar records.'
    },
    {
      q: 'How are land areas calculated in Tamil Nadu (Cents vs Sq.ft)?',
      a: 'In Tamil Nadu, 1 Cent equals exactly 435.6 square feet. Every plot in our marketplace transparently displays both the primary cent measurement and its exact square-foot equivalent so you can compare costs accurately without confusion.'
    },
    {
      q: 'Can I schedule an in-person site visit before making any decision?',
      a: 'Yes! Every property page includes a "Schedule Site Visit" tool. You can pick your preferred date and morning or afternoon time slot, and our local area executive will arrange a guided site walkthrough.'
    },
    {
      q: 'Are there any brokerage fees for property buyers?',
      a: 'Zero brokerage is charged on all Grounds & Gates Direct company-owned inventory. For third-party seller listings, terms are set directly between the respective owner or broker without hidden marketplace markups.'
    },
    {
      q: 'How can an owner or channel partner list a property on Grounds & Gates?',
      a: 'You can use our guided 7-step "Post Property" wizard. Once submitted, our team reviews the documentation, approves the details, and publishes the listing across our Tamil Nadu buyer marketplace.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F2E9', pb: 12 }}>
      {/* 1. Header Banner */}
      <Box sx={{ bgcolor: '#013E18', color: '#F5F2E9', py: { xs: 8, sm: 10 }, textAlign: 'center' }}>
        <Container maxWidth="xl" disableGutters sx={{ maxWidth: '1280px !important', px: { xs: 2, sm: 3, md: 4 } }}>
          <Chip
            size="small"
            label="Corporate Desk & Site Concierge"
            sx={{
              bgcolor: 'rgba(201, 147, 37, 0.2)',
              color: '#E0AA3E',
              fontWeight: 800,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              mb: 2,
              border: '1px solid rgba(201, 147, 37, 0.3)',
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', mb: 1.5 }}>
            Connect with Grounds & Gates
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(245, 242, 233, 0.8)', maxWidth: 650, mx: 'auto', fontSize: '0.95rem' }}>
            Direct assistance for site visits, legal title verifications, developer tie-ups, and land acquisitions across Tamil Nadu.
          </Typography>
        </Container>
      </Box>

      {/* 2. Main Content Grid */}
      <Container maxWidth="xl" disableGutters sx={{ maxWidth: '1280px !important', px: { xs: 2, sm: 3, md: 4 }, mt: -4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' }, gap: 4 }}>
          
          {/* Left: Contact Info Cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper elevation={2} sx={{ p: 4, borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 3 }}>
                <BusinessIcon sx={{ fontSize: 26, color: '#013E18' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#18241B' }}>
                  Headquarters & Central Desk
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, color: '#536458', fontSize: '0.85rem' }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <LocationOnIcon sx={{ fontSize: 20, color: '#C99325', flexShrink: 0, mt: 0.3 }} />
                  <Typography variant="body2" sx={{ color: '#18241B' }}>
                    <strong>Grounds & Gates Towers</strong><br />
                    Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641014
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <PhoneIcon sx={{ fontSize: 20, color: '#C99325', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#18241B' }}>
                    +91 422 298 7000 / +91 98422 71000
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <EmailIcon sx={{ fontSize: 20, color: '#C99325', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#18241B' }}>
                    direct@groundsandgates.com
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ fontSize: 20, color: '#C99325', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#18241B' }}>
                    Monday - Saturday: 9:00 AM – 7:30 PM (IST)
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #ECE7DA', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <VerifiedUserIcon sx={{ fontSize: 20, color: '#013E18' }} />
                <Typography variant="caption" sx={{ color: '#536458', fontWeight: 600 }}>
                  Official RERA & DTCP verification desk available for buyers.
                </Typography>
              </Box>
            </Paper>

            <Paper elevation={1} sx={{ p: 3, borderRadius: '20px', bgcolor: '#FAF8F2', border: '1px solid #ECE7DA' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18', mb: 1 }}>
                Regional Presence:
              </Typography>
              <Typography variant="body2" sx={{ color: '#536458', fontSize: '0.8rem', lineHeight: 1.6 }}>
                Grounds & Gates maintains active site offices and verified channel coordination desks in <strong>Coimbatore, Chennai (OMR & ECR), Madurai, Tiruppur, Erode, and Salem</strong>.
              </Typography>
            </Paper>
          </Box>

          {/* Right: Direct Inquiry Form */}
          <Paper elevation={2} sx={{ p: { xs: 3, sm: 5 }, borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid rgba(24, 36, 27, 0.08)' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B', mb: 0.5 }}>
              Send a Direct Message
            </Typography>
            <Typography variant="body2" sx={{ color: '#536458', mb: 3 }}>
              Fill in your requirement and our regional coordinator will connect within 2 hours.
            </Typography>

            {submitted ? (
              <Alert severity="success" sx={{ borderRadius: '16px', py: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Enquiry Submitted Successfully!
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Thank you, <strong>{formData.name}</strong>. Our senior property advisor will reach out to you at <strong>{formData.phone}</strong> shortly.
                </Typography>
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Full Name *"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Senthil Kumar"
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Phone Number *"
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98422 00000"
                    fullWidth
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="senthil@example.com"
                    fullWidth
                    size="small"
                  />
                  <TextField
                    select
                    label="Target District / Region"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="Coimbatore">Coimbatore (கோயம்புத்தூர்)</MenuItem>
                    <MenuItem value="Chennai">Chennai (சென்னை)</MenuItem>
                    <MenuItem value="Madurai">Madurai (மதுரை)</MenuItem>
                    <MenuItem value="Tiruppur">Tiruppur (திருப்பூர்)</MenuItem>
                    <MenuItem value="Erode">Erode (ஈரோடு)</MenuItem>
                    <MenuItem value="Salem">Salem (சேலம்)</MenuItem>
                    <MenuItem value="Trichy">Trichy (திருச்சிராப்பள்ளி)</MenuItem>
                    <MenuItem value="Pollachi">Pollachi (பொள்ளாச்சி)</MenuItem>
                    <MenuItem value="Ooty">Ooty / Nilgiris (ஊட்டி)</MenuItem>
                    <MenuItem value="Hosur">Hosur (ஓசூர்)</MenuItem>
                  </TextField>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', mb: 1, display: 'block' }}>
                    Inquiry Category:
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1 }}>
                    {[
                      { id: 'buying', label: 'Buying Property' },
                      { id: 'selling', label: 'Listing / Selling' },
                      { id: 'title-check', label: 'Legal Audit' },
                      { id: 'partner', label: 'Channel Partner' },
                    ].map(type => (
                      <Chip
                        key={type.id}
                        label={type.label}
                        clickable
                        onClick={() => setFormData({ ...formData, inquiryType: type.id })}
                        sx={{
                          bgcolor: formData.inquiryType === type.id ? '#013E18' : '#FAF8F2',
                          color: formData.inquiryType === type.id ? '#F5F2E9' : '#18241B',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          border: '1px solid',
                          borderColor: formData.inquiryType === type.id ? '#013E18' : '#ECE7DA',
                          py: 2,
                          '&:hover': {
                            bgcolor: formData.inquiryType === type.id ? '#00280F' : '#EFEAE0',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <TextField
                  label="Message / Requirement Details"
                  multiline
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share your budget, preferred locality, facing, or specific survey queries..."
                  fullWidth
                  size="small"
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<SendIcon sx={{ fontSize: 18, color: '#C99325' }} />}
                  sx={{ py: 1.5, borderRadius: '14px', fontWeight: 800, mt: 1 }}
                >
                  Submit Direct Inquiry (Demo)
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>

      {/* 3. Frequently Asked Questions (Accordion) */}
      <Container maxWidth="md" disableGutters sx={{ mt: 12, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Chip
            size="small"
            icon={<HelpOutlineIcon sx={{ fontSize: 14, color: '#C99325' }} />}
            label="Buyer & Owner FAQ"
            sx={{
              bgcolor: 'rgba(201, 147, 37, 0.15)',
              color: '#8B6413',
              fontWeight: 800,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              mb: 1.5,
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#18241B', letterSpacing: '-0.02em' }}>
            Frequently Asked Questions
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', mt: 0.5 }}>
            Clear answers regarding titles, cent measurements, visits, and direct listing policies.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              elevation={0}
              sx={{
                borderRadius: '16px !important',
                border: '1px solid rgba(24, 36, 27, 0.08)',
                bgcolor: '#FFFFFF',
                overflow: 'hidden',
                '&::before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#C99325' }} />}
                sx={{ px: 3, py: 1 }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#18241B', fontSize: '0.9rem' }}>
                  {faq.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                <Typography variant="body2" sx={{ color: '#536458', lineHeight: 1.7, fontSize: '0.85rem' }}>
                  {faq.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
