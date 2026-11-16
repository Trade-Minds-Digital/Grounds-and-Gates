import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Container,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import { useCurrentUser } from '../query/hooks/useAuthQueries';
import { api } from '../services/api';
import { profileUpdateSchema, ProfileUpdateFormData } from '../schemas/auth.schema';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToast } from '../store/slices/toastSlice';
import { useNavigate } from 'react-router-dom';

const TN_DISTRICTS = [
  'Coimbatore',
  'Chennai',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Erode',
  'Tiruppur',
  'Dindigul',
  'Thanjavur',
  'Vellore',
  'Kanchipuram',
  'Chengalpattu',
];

export const ProfilePage: React.FC = () => {
  const { data: user, isLoading, refetch } = useCurrentUser();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const lang = useAppSelector((state) => state.ui.language);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: '',
      mobile: '',
      address: {
        street: '',
        locality: '',
        city: '',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '',
      },
      sellerDetails: {
        sellerType: 'owner',
        companyName: '',
        reraNumber: '',
        licenseNumber: '',
        preferredContactMethod: 'phone',
      },
      marketingConsent: false,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || user.name || '',
        mobile: user.mobile || user.phone || '',
        address: {
          street: user.address?.street || '',
          locality: user.address?.locality || '',
          city: user.address?.city || '',
          district: user.address?.district || 'Coimbatore',
          state: user.address?.state || 'Tamil Nadu',
          pincode: user.address?.pincode || '',
        },
        sellerDetails: {
          sellerType: user.sellerDetails?.sellerType || 'owner',
          companyName: user.sellerDetails?.companyName || '',
          reraNumber: user.sellerDetails?.reraNumber || '',
          licenseNumber: user.sellerDetails?.licenseNumber || '',
          preferredContactMethod: user.sellerDetails?.preferredContactMethod || 'phone',
        },
        marketingConsent: Boolean(user.consents?.marketingConsent),
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileUpdateFormData) => {
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await api.updateProfile(data);
      await refetch();
      setSuccessMessage(
        lang === 'ta'
          ? 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது.'
          : 'Your profile has been updated successfully.'
      );
      dispatch(
        addToast({
          type: 'success',
          message: 'Profile updated successfully!',
        })
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress sx={{ color: '#013E18' }} />
      </Box>
    );
  }

  const isSeller =
    user?.role === 'seller' ||
    user?.role === 'developer' ||
    user?.role === 'agent' ||
    user?.accountUsage === 'seller' ||
    user?.accountUsage === 'both';

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid rgba(1, 62, 24, 0.08)',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'rgba(1, 62, 24, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#013E18',
            }}
          >
            <PersonIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#013E18' }}>
              {lang === 'ta' ? 'எனது கணக்கு சுயவிவரம்' : 'My Account Profile'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#536458' }}>
              {lang === 'ta'
                ? 'உங்கள் தனிப்பட்ட மற்றும் தொடர்பு விவரங்களை நிர்வகிக்கவும்.'
                : 'Manage your contact details, preferences, and verified identity.'}
            </Typography>
          </Box>
        </Box>

        {/* Identity & Verification Status Pill */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: '16px',
            bgcolor: user?.emailVerified ? 'rgba(1, 62, 24, 0.04)' : 'rgba(201, 147, 37, 0.08)',
            border: `1px solid ${user?.emailVerified ? '#C8E6C9' : '#FFE082'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {user?.emailVerified ? (
              <VerifiedUserIcon sx={{ color: '#013E18', fontSize: 28 }} />
            ) : (
              <WarningAmberIcon sx={{ color: '#C99325', fontSize: 28 }} />
            )}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#18241B' }}>
                {user?.email}
              </Typography>
              <Typography variant="caption" sx={{ color: '#536458', display: 'block' }}>
                {user?.emailVerified
                  ? lang === 'ta'
                    ? 'மின்னஞ்சல் முகவரி Firebase மூலம் உறுதிப்படுத்தப்பட்டது'
                    : 'Email address verified via Firebase Authentication'
                  : lang === 'ta'
                  ? 'மின்னஞ்சல் முகவரி இன்னும் உறுதிப்படுத்தப்படவில்லை'
                  : 'Email address pending confirmation link click'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              size="small"
              label={user?.role?.toUpperCase() || 'CLIENT'}
              sx={{ bgcolor: '#013E18', color: '#FAF8F2', fontWeight: 800, fontSize: '0.7rem' }}
            />
            {!user?.emailVerified && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/verify-email')}
                sx={{
                  borderColor: '#C99325',
                  color: '#8B6413',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              >
                {lang === 'ta' ? 'சரிபார்க்க' : 'Verify Email'}
              </Button>
            )}
          </Box>
        </Paper>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {errorMessage}
          </Alert>
        )}

        {/* Update Form */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#013E18', mb: 2 }}>
            <HomeIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
            {lang === 'ta' ? 'தனிப்பட்ட மற்றும் தொடர்பு விவரங்கள்' : 'Personal & Contact Details'}
          </Typography>

          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={lang === 'ta' ? 'முழுப்பெயர்' : 'Full Name'}
                {...register('fullName')}
                error={Boolean(errors.fullName)}
                helperText={errors.fullName?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={lang === 'ta' ? 'மொபைல் எண்' : 'Mobile Phone Number'}
                {...register('mobile')}
                error={Boolean(errors.mobile)}
                helperText={errors.mobile?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={lang === 'ta' ? 'மாவட்டம்' : 'District'}
                select
                defaultValue="Coimbatore"
                {...register('address.district')}
              >
                {TN_DISTRICTS.map((dist) => (
                  <MenuItem key={dist} value={dist}>
                    {dist}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={lang === 'ta' ? 'நகரம் / பகுதி' : 'City / Town'}
                {...register('address.city')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                label={lang === 'ta' ? 'முகவரி' : 'Street Address'}
                {...register('address.street')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label={lang === 'ta' ? 'அஞ்சல் குறியீடு' : 'Postal Code'}
                {...register('address.pincode')}
              />
            </Grid>
          </Grid>

          {/* Conditional Seller / Business Details */}
          {isSeller && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#013E18', mb: 2 }}>
                <BusinessIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                {lang === 'ta' ? 'விற்பனையாளர் / வணிக விவரங்கள்' : 'Seller & Business Profile'}
              </Typography>

              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={lang === 'ta' ? 'விற்பனையாளர் வகை' : 'Seller Capacity'}
                    select
                    defaultValue="owner"
                    {...register('sellerDetails.sellerType')}
                  >
                    <MenuItem value="owner">{lang === 'ta' ? 'உரிமையாளர் (Owner)' : 'Property Owner'}</MenuItem>
                    <MenuItem value="agent">{lang === 'ta' ? 'முகவர் (Agent)' : 'Real Estate Agent / Broker'}</MenuItem>
                    <MenuItem value="builder">{lang === 'ta' ? 'கட்டுமானர் (Builder)' : 'Builder'}</MenuItem>
                    <MenuItem value="developer">{lang === 'ta' ? 'டெவலப்பர் (Developer)' : 'Developer'}</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={lang === 'ta' ? 'நிறுவனத்தின் பெயர்' : 'Company / Firm Name'}
                    {...register('sellerDetails.companyName')}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={lang === 'ta' ? 'RERA எண்' : 'RERA Registration No. (Optional)'}
                    {...register('sellerDetails.reraNumber')}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={lang === 'ta' ? 'தொடர்பு முறை' : 'Preferred Contact Channel'}
                    select
                    defaultValue="phone"
                    {...register('sellerDetails.preferredContactMethod')}
                  >
                    <MenuItem value="phone">Phone Calls</MenuItem>
                    <MenuItem value="whatsapp">WhatsApp</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Preferences */}
          <Box sx={{ mb: 4 }}>
            <FormControlLabel
              control={<Checkbox {...register('marketingConsent')} defaultChecked={Boolean(user?.consents?.marketingConsent)} />}
              label={
                <Typography variant="body2" sx={{ color: '#536458' }}>
                  {lang === 'ta'
                    ? 'புதிய பிரீமியம் சொத்துக்கள் மற்றும் சிறப்பு அறிவிப்புகளை மின்னஞ்சல் மூலம் பெற ஒப்புக்கொள்கிறேன்.'
                    : 'I agree to receive occasional updates about new premium listings and real estate investment insights in Tamil Nadu.'}
                </Typography>
              }
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{
              bgcolor: '#013E18',
              color: '#FAF8F2',
              fontWeight: 700,
              py: 1.5,
              px: 4,
              borderRadius: '12px',
              border: '1px solid #C99325',
              '&:hover': { bgcolor: '#025824' },
            }}
          >
            {isSaving
              ? lang === 'ta'
                ? 'சேமிக்கிறது...'
                : 'Saving Changes...'
              : lang === 'ta'
              ? 'மாற்றங்களை சேமிக்கவும்'
              : 'Save Profile Changes'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

