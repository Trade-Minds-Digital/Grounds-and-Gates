import React, { useState, useMemo } from 'react';
import { calculateLoanBreakdown, formatPriceINR } from '../../utils/propertyUtils';
import { LanguageCode } from '../../types/property';
import {
  Dialog,
  Box,
  Typography,
  Slider,
  TextField,
  Button,
  IconButton,
  Chip,
  Paper,
  InputAdornment,
  Divider,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';

interface EmiCalculatorProps {
  initialPrice?: number;
  lang?: LanguageCode;
  onClose?: () => void;
  isModal?: boolean;
}

export const EmiCalculator: React.FC<EmiCalculatorProps> = ({
  initialPrice = 5000000,
  lang = 'en',
  onClose,
  isModal = false,
}) => {
  const [price, setPrice] = useState<number>(initialPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);

  const breakdown = useMemo(() => {
    return calculateLoanBreakdown(price, downPaymentPercent, interestRate, tenureYears);
  }, [price, downPaymentPercent, interestRate, tenureYears]);

  const downPaymentAmount = Math.round((price * downPaymentPercent) / 100);

  const quickPrices = [
    { label: '₹25L', val: 2500000 },
    { label: '₹50L', val: 5000000 },
    { label: '₹1 Cr', val: 10000000 },
    { label: '₹2.5 Cr', val: 25000000 },
  ];

  const calculatorBody = (
    <Box sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: '#FFFFFF', borderRadius: '24px' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pb: 3,
          borderBottom: '1px solid #ECE7DA',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '16px',
              bgcolor: 'rgba(1, 62, 24, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#013E18',
              flexShrink: 0,
            }}
          >
            <CalculateIcon sx={{ fontSize: 26, color: '#013E18' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#18241B', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {lang === 'ta' ? 'வீட்டுக் கடன் தவணை (EMI) கணக்கீடு' : 'Home Loan EMI Calculator'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#536458', mt: 0.5 }}>
              {lang === 'ta'
                ? 'உங்கள் மாதத் தவணை மற்றும் மொத்த வட்டி விவரங்களை உடனடியாக கணக்கிடுங்கள்'
                : 'Estimate your monthly installments, down payment, and total interest payout'}
            </Typography>
          </Box>
        </Box>

        {isModal && onClose && (
          <IconButton
            onClick={onClose}
            aria-label="Close calculator"
            sx={{
              color: '#536458',
              borderRadius: '12px',
              '&:hover': { bgcolor: 'rgba(24, 36, 27, 0.06)' },
            }}
          >
            <CloseIcon sx={{ fontSize: 22 }} />
          </IconButton>
        )}
      </Box>

      {/* Main Grid: Controls Left + Breakdown Right */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 4, pt: 3.5 }}>
        
        {/* Left Inputs */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {/* Property Price */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {lang === 'ta' ? 'சொத்து மதிப்பு (Property Price)' : 'Property Price'}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18' }}>
                {formatPriceINR(price)}
              </Typography>
            </Box>
            <TextField
              fullWidth
              type="number"
              value={price}
              onChange={(e) => setPrice(Math.max(100000, Number(e.target.value) || 0))}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CurrencyRupeeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ color: '#536458', fontWeight: 700 }}>PRESETS:</Typography>
              {quickPrices.map((qp) => (
                <Chip
                  key={qp.label}
                  label={qp.label}
                  size="small"
                  clickable
                  onClick={() => setPrice(qp.val)}
                  sx={{
                    bgcolor: price === qp.val ? '#013E18' : '#FAF8F2',
                    color: price === qp.val ? '#F5F2E9' : '#18241B',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: price === qp.val ? '#013E18' : '#E5E0D5',
                    '&:hover': {
                      bgcolor: price === qp.val ? '#00280F' : '#EFEAE0',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Down Payment Slider */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {lang === 'ta' ? 'முன்பணம் (Down Payment)' : 'Down Payment'}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18' }}>
                {downPaymentPercent}% ({formatPriceINR(downPaymentAmount)})
              </Typography>
            </Box>
            <Slider
              value={downPaymentPercent}
              min={10}
              max={50}
              step={5}
              onChange={(_, val) => setDownPaymentPercent(val as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#536458' }}>Min 10%</Typography>
              <Typography variant="caption" sx={{ color: '#536458' }}>Max 50%</Typography>
            </Box>
          </Box>

          {/* Interest Rate */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {lang === 'ta' ? 'வட்டி விகிதம் (Interest Rate % p.a.)' : 'Interest Rate (% p.a.)'}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18' }}>
                {interestRate}%
              </Typography>
            </Box>
            <Slider
              value={interestRate}
              min={7.0}
              max={13.5}
              step={0.1}
              onChange={(_, val) => setInterestRate(val as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#536458' }}>Prime 7.5%</Typography>
              <Typography variant="caption" sx={{ color: '#536458' }}>Max 13.5%</Typography>
            </Box>
          </Box>

          {/* Loan Tenure */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#18241B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {lang === 'ta' ? 'கடன் காலம் (Loan Tenure in Years)' : 'Loan Tenure (Years)'}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#013E18' }}>
                {tenureYears} {lang === 'ta' ? 'ஆண்டுகள்' : 'Years'} ({tenureYears * 12} mos)
              </Typography>
            </Box>
            <Slider
              value={tenureYears}
              min={5}
              max={30}
              step={1}
              onChange={(_, val) => setTenureYears(val as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v} Yrs`}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#536458' }}>5 Years</Typography>
              <Typography variant="caption" sx={{ color: '#536458' }}>30 Years</Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Breakdown Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '20px',
            bgcolor: '#013E18',
            color: '#F5F2E9',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(201, 147, 37, 0.3)',
            boxShadow: '0 8px 30px rgba(1, 62, 24, 0.25)',
          }}
        >
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: '0.1em', color: '#C99325', fontWeight: 800 }}>
              {lang === 'ta' ? 'கணக்கிடப்பட்ட மாதத் தவணை' : 'ESTIMATED MONTHLY INSTALLMENT'}
            </Typography>

            <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', my: 1 }}>
              ₹{breakdown.monthlyEmi.toLocaleString('en-IN')}
              <Typography component="span" variant="body2" sx={{ color: 'rgba(245, 242, 233, 0.7)', ml: 1, fontWeight: 500 }}>
                / {lang === 'ta' ? 'மாதம்' : 'month'}
              </Typography>
            </Typography>

            <Divider sx={{ my: 2.5, borderColor: 'rgba(255, 255, 255, 0.15)' }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'rgba(245, 242, 233, 0.7)' }}>
                  {lang === 'ta' ? 'கடன் தொகை (Principal)' : 'Principal Loan Amount'}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                  {formatPriceINR(breakdown.principalAmount)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'rgba(245, 242, 233, 0.7)' }}>
                  {lang === 'ta' ? 'மொத்த வட்டி (Total Interest)' : 'Total Interest Payable'}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#E0AA3E' }}>
                  {formatPriceINR(breakdown.totalInterest)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'rgba(245, 242, 233, 0.7)' }}>
                  {lang === 'ta' ? 'முன்பணம் (Down Payment)' : 'Down Payment Required'}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                  {formatPriceINR(downPaymentAmount)}
                </Typography>
              </Box>

              <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.15)' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#F5F2E9' }}>
                  {lang === 'ta' ? 'மொத்த திருப்பிச் செலுத்துதல்' : 'Total Amount Payable'}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                  {formatPriceINR(breakdown.totalPayment)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ pt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
              onClick={() => {
                if (isModal && onClose) onClose();
                window.location.hash = '#contact';
              }}
              sx={{ py: 1.4, borderRadius: '14px', fontWeight: 800 }}
            >
              {lang === 'ta' ? 'முன் அங்கீகரிக்கப்பட்ட கடன் பெற' : 'Apply for Pre-Approved Home Loan'}
            </Button>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', mt: 2 }}>
              <VerifiedUserIcon sx={{ fontSize: 18, color: '#C99325' }} />
              <Typography variant="caption" sx={{ color: 'rgba(245, 242, 233, 0.65)' }}>
                {lang === 'ta' ? 'HDFC, SBI, ICICI மற்றும் முன்னணி வங்கிகளுடன் கூட்டு' : 'Partnered with SBI, HDFC, ICICI, Axis Bank'}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );

  if (isModal) {
    return (
      <Dialog
        open={true}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              bgcolor: '#FFFFFF',
              overflow: 'hidden',
            },
          },
        }}
      >
        {calculatorBody}
      </Dialog>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: '24px',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
        border: '1px solid rgba(24, 36, 27, 0.08)',
      }}
    >
      {calculatorBody}
    </Paper>
  );
};
