import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Property, LanguageCode, EnquirySubmission } from '../../types/property';
import { translations } from '../../i18n/translations';
import { useAppState } from '../../context/AppStateContext';
import { formatPriceINR } from '../../utils/propertyUtils';
import { enquiryModalSchema, EnquiryModalFormData } from '../../schemas/enquiry.schema';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Alert,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';

interface EnquiryModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  onSubmitEnquiry: (submission: Omit<EnquirySubmission, 'id' | 'submittedAt' | 'status'>) => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  property,
  isOpen,
  onClose,
  lang,
  onSubmitEnquiry,
}) => {
  const t = translations[lang];
  const { masters } = useAppState();
  const timeSlots = masters['visit_time_slot'] || [];

  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<EnquiryModalFormData | null>(null);

  const defaultVisitDate = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EnquiryModalFormData>({
    resolver: zodResolver(enquiryModalSchema),
    defaultValues: {
      fullName: 'Mohanraj S.',
      phone: '+91 98422 71000',
      email: 'mohanrajs0410@gmail.com',
      visitDate: defaultVisitDate,
      preferredTimeSlot: 'morning',
      message: 'Hello, I am interested in this property. Please arrange a site visit and share document copies.',
    },
  });

  const onSubmit = (data: EnquiryModalFormData) => {
    onSubmitEnquiry({
      propertyId: property.id,
      propertyTitle: property.title,
      propertyPrice: property.price,
      propertyLocation: `${property.location}, ${property.district}`,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      visitDate: data.visitDate,
      preferredTimeSlot: data.preferredTimeSlot as any,
      message: data.message || '',
    });

    setSubmittedData(data);
    setSubmitted(true);
  };

  const handleModalClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleModalClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: '#013E18',
          color: '#F5F2E9',
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ pr: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
            <Chip
              size="small"
              label={property.ownershipType === 'company' ? 'Grounds & Gates Direct' : 'Verified Seller'}
              sx={{
                bgcolor: '#C99325',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                height: 22,
              }}
            />
            <Typography variant="caption" sx={{ color: 'rgba(245, 242, 233, 0.8)', fontWeight: 600 }}>
              Direct Property Enquiry
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.3 }}>
            {property.title}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: '#E0AA3E', fontWeight: 800, mt: 0.5 }}>
            {formatPriceINR(property.price, property.listingType, property.priceUnit)} • {property.location}, {property.district}
          </Typography>
        </Box>

        <IconButton
          onClick={handleModalClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      {submitted ? (
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
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
            <CheckCircleIcon sx={{ fontSize: 40, color: '#013E18' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B', mb: 1 }}>
            {t.propertyDetails.enquirySuccess}
          </Typography>
          <Typography variant="body2" sx={{ color: '#536458', maxWidth: 360, mx: 'auto', mb: 3 }}>
            {t.propertyDetails.enquirySuccessDesc}
          </Typography>

          <Box
            sx={{
              bgcolor: '#FAF8F2',
              border: '1px solid #ECE7DA',
              borderRadius: '16px',
              p: 2.5,
              textAlign: 'left',
              mb: 3,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18', mb: 1 }}>
              Enquiry Summary:
            </Typography>
            <Typography variant="body2" sx={{ color: '#18241B', fontSize: '0.85rem' }}>
              • Target Date: <strong>{submittedData?.visitDate}</strong> ({submittedData?.preferredTimeSlot})
            </Typography>
            <Typography variant="body2" sx={{ color: '#18241B', fontSize: '0.85rem' }}>
              • Contact: <strong>{submittedData?.fullName}</strong> ({submittedData?.phone})
            </Typography>
            <Typography variant="body2" sx={{ color: '#18241B', fontSize: '0.85rem' }}>
              • Destination: <strong>{property.location}, {property.district}</strong>
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={handleModalClose}
            sx={{ px: 4, py: 1.2, borderRadius: '12px', fontWeight: 800 }}
          >
            Done & Close
          </Button>
        </DialogContent>
      ) : (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Guarantee Note */}
              <Alert
                severity="info"
                icon={<VerifiedUserIcon sx={{ fontSize: 20, color: '#013E18' }} />}
                sx={{
                  bgcolor: '#FAF8F2',
                  border: '1px solid #ECE7DA',
                  color: '#18241B',
                  borderRadius: '14px',
                  '& .MuiAlert-message': { fontSize: '0.8rem', lineHeight: 1.5 },
                }}
              >
                {property.ownershipType === 'company'
                  ? t.propertyDetails.companyGuarantee
                  : t.propertyDetails.thirdPartyNotice}
              </Alert>

              {/* Name & Phone */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label={`${t.propertyDetails.yourName} *`}
                  {...register('fullName')}
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label={`${t.propertyDetails.yourPhone} *`}
                  {...register('phone')}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              {/* Email */}
              <TextField
                label={`${t.propertyDetails.yourEmail} *`}
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Date & Slot */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label={t.propertyDetails.selectDate}
                  type="date"
                  {...register('visitDate')}
                  error={!!errors.visitDate}
                  helperText={errors.visitDate?.message}
                  fullWidth
                  size="small"
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Controller
                  name="preferredTimeSlot"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      label={t.propertyDetails.preferredSlot}
                      {...field}
                      error={!!errors.preferredTimeSlot}
                      helperText={errors.preferredTimeSlot?.message}
                      fullWidth
                      size="small"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                    >
                      {timeSlots.length > 0 ? (
                        timeSlots.map(slot => (
                          <MenuItem key={slot.code} value={slot.code}>
                            {lang === 'ta' ? (slot.nameTa || slot.name) : slot.name} {slot.metadata?.timeWindow ? `(${slot.metadata.timeWindow})` : ''}
                          </MenuItem>
                        ))
                      ) : (
                        [
                          <MenuItem key="morning" value="morning">{t.propertyDetails.morning}</MenuItem>,
                          <MenuItem key="afternoon" value="afternoon">{t.propertyDetails.afternoon}</MenuItem>,
                          <MenuItem key="evening" value="evening">{t.propertyDetails.evening}</MenuItem>,
                        ]
                      )}
                    </TextField>
                  )}
                />
              </Box>

              {/* Message */}
              <TextField
                label="Enquiry Note / Questions"
                multiline
                rows={2}
                {...register('message')}
                placeholder={t.propertyDetails.messagePlaceholder}
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3.5, pb: 3, pt: 1, borderTop: '1px solid #ECE7DA' }}>
            <Button onClick={handleModalClose} sx={{ color: '#536458', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              endIcon={<SendIcon sx={{ fontSize: 18, color: '#C99325' }} />}
              sx={{ borderRadius: '12px', px: 3, py: 1, fontWeight: 800 }}
            >
              {t.propertyDetails.submitEnquiry}
            </Button>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  );
};
