import React, { useState, useMemo } from 'react';
import { calculateLoanBreakdown, formatPriceINR } from '../../utils/propertyUtils';
import { LanguageCode } from '../../types/property';
import { Calculator, IndianRupee, Percent, Calendar, ShieldCheck, ArrowRight, X } from 'lucide-react';

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
  isModal = false
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

  const content = (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xl max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between pb-6 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#013E18]/10 text-[#013E18] flex items-center justify-center shrink-0">
            <Calculator className="w-6 h-6 text-[#013E18]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#18241B] tracking-tight">
              {lang === 'ta' ? 'வீட்டுக் கடன் தவணை (EMI) கணக்கீடு' : 'Home Loan EMI Calculator'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {lang === 'ta'
                ? 'உங்கள் மாதத் தவணை மற்றும் மொத்த வட்டி விவரங்களை உடனடியாக கணக்கிடுங்கள்'
                : 'Estimate your monthly installments, down payment, and total interest payout'}
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close calculator"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Grid: Controls Left + Breakdown Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Property Price */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
              <label htmlFor="emi-property-price">
                {lang === 'ta' ? 'சொத்து மதிப்பு (Property Price)' : 'Property Price'}
              </label>
              <span className="text-sm font-extrabold text-[#013E18]">
                {formatPriceINR(price)}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                id="emi-property-price"
                type="number"
                min={500000}
                max={100000000}
                step={50000}
                value={price}
                onChange={(e) => setPrice(Math.max(100000, Number(e.target.value) || 0))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm font-bold text-[#18241B] focus:border-[#013E18] focus:bg-white outline-hidden"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-stone-400 uppercase font-semibold">Presets:</span>
              {quickPrices.map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  onClick={() => setPrice(qp.val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    price === qp.val
                      ? 'bg-[#013E18] text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Down Payment Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
              <label htmlFor="emi-down-payment">
                {lang === 'ta' ? 'முன்பணம் (Down Payment)' : 'Down Payment'} ({downPaymentPercent}%)
              </label>
              <span className="text-xs font-bold text-stone-900">
                {formatPriceINR(downPaymentAmount)}
              </span>
            </div>
            <input
              id="emi-down-payment"
              type="range"
              min={10}
              max={60}
              step={5}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-[#013E18] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-medium mt-1">
              <span>10% (Min)</span>
              <span>20% (Recommended)</span>
              <span>60%</span>
            </div>
          </div>

          {/* Interest Rate & Tenure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Interest Rate */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
                <label htmlFor="emi-interest-rate">
                  {lang === 'ta' ? 'வட்டி விகிதம் (Interest)' : 'Interest Rate'}
                </label>
                <span className="text-xs font-extrabold text-[#013E18]">{interestRate}% p.a.</span>
              </div>
              <input
                id="emi-interest-rate"
                type="range"
                min={6.5}
                max={13}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-[#013E18] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-medium mt-1">
                <span>6.5%</span>
                <span>8.5% (Prime)</span>
                <span>13%</span>
              </div>
            </div>

            {/* Loan Tenure */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
                <label htmlFor="emi-tenure-years">
                  {lang === 'ta' ? 'கால அளவு (Tenure)' : 'Loan Tenure'}
                </label>
                <span className="text-xs font-extrabold text-[#013E18]">{tenureYears} Years</span>
              </div>
              <input
                id="emi-tenure-years"
                type="range"
                min={5}
                max={30}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-[#013E18] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-medium mt-1">
                <span>5 Yrs</span>
                <span>20 Yrs</span>
                <span>30 Yrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Panel (5 cols) */}
        <div className="lg:col-span-5 bg-[#F5F2E9] rounded-2xl p-6 border border-stone-200/70 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C99325]">
              {lang === 'ta' ? 'மதிப்பிடப்பட்ட மாதாந்திர தவணை' : 'Estimated Monthly EMI'}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#013E18] tracking-tight mt-1 mb-4">
              ₹{breakdown.monthlyEmi.toLocaleString('en-IN')}
              <span className="text-xs font-bold text-stone-500 tracking-normal ml-1">/ month</span>
            </div>

            {/* Proportion Bar */}
            <div className="space-y-1.5 mb-6">
              <div className="flex justify-between text-[11px] font-bold text-stone-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#013E18]" />
                  Principal: {breakdown.principalPercentage}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C99325]" />
                  Interest: {breakdown.interestPercentage}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-stone-200 overflow-hidden flex">
                <div
                  style={{ width: `${breakdown.principalPercentage}%` }}
                  className="bg-[#013E18] h-full transition-all duration-300"
                />
                <div
                  style={{ width: `${breakdown.interestPercentage}%` }}
                  className="bg-[#C99325] h-full transition-all duration-300"
                />
              </div>
            </div>

            {/* Detailed Table */}
            <div className="space-y-2.5 text-xs text-stone-700 border-t border-stone-200 pt-4">
              <div className="flex justify-between">
                <span className="text-stone-500">{lang === 'ta' ? 'கடன் தொகை' : 'Principal Loan Amount'}</span>
                <span className="font-bold text-[#18241B]">₹{breakdown.principalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{lang === 'ta' ? 'மொத்த வட்டி' : 'Total Interest Payable'}</span>
                <span className="font-bold text-[#C99325]">₹{breakdown.totalInterest.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200/80">
                <span className="font-bold text-[#18241B]">{lang === 'ta' ? 'மொத்த தொகை (அசல்+வட்டி)' : 'Total Amount Payable'}</span>
                <span className="font-extrabold text-[#013E18] text-sm">₹{breakdown.totalPayment.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 pt-3 border-t border-stone-200 text-[10px] text-stone-500 leading-tight">
            * Illustrative estimate only. Actual rates, processing fees, and eligibility depend on the lending bank and buyer verification.
          </div>
        </div>

      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
        <div className="w-full max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
