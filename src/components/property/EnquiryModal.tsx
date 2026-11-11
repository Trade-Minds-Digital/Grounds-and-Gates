import React, { useState } from 'react';
import { Property, LanguageCode, EnquirySubmission } from '../../types/property';
import { translations } from '../../i18n/translations';
import { formatPriceINR } from '../../utils/propertyUtils';
import {
  X,
  Calendar,
  Clock,
  Send,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  User,
  MessageSquare
} from 'lucide-react';

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
  onSubmitEnquiry
}) => {
  const t = translations[lang];

  const [fullName, setFullName] = useState('Mohanraj S.');
  const [phone, setPhone] = useState('+91 98422 71000');
  const [email, setEmail] = useState('mohanrajs0410@gmail.com');
  const [visitDate, setVisitDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [preferredSlot, setPreferredSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [message, setMessage] = useState('Hello, I am interested in this property. Please arrange a site visit and share document copies.');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg('Please fill in your name, phone number, and email.');
      return;
    }
    setErrorMsg('');

    onSubmitEnquiry({
      propertyId: property.id,
      propertyTitle: property.title,
      propertyPrice: property.price,
      propertyLocation: `${property.location}, ${property.district}`,
      fullName,
      phone,
      email,
      visitDate,
      preferredTimeSlot: preferredSlot,
      message,
    });

    setSubmitted(true);
  };

  const handleModalClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#013E18] text-[#F5F2E9] p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C99325] text-white px-2 py-0.5 rounded">
                {property.ownershipType === 'company' ? 'Grounds & Gates Direct' : 'Verified Seller'}
              </span>
              <span className="text-xs text-[#F5F2E9]/80 font-medium">Demo Listing Enquiry</span>
            </div>
            <h2 className="text-lg font-bold text-white line-clamp-1">{property.title}</h2>
            <div className="text-sm font-extrabold text-[#C99325] mt-0.5">
              {formatPriceINR(property.price, property.listingType, property.priceUnit)} • {property.location}, {property.district}
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-[#18241B]">{t.propertyDetails.enquirySuccess}</h3>
            <p className="text-xs text-stone-600 max-w-xs mt-2 leading-relaxed">
              {t.propertyDetails.enquirySuccessDesc}
            </p>

            <div className="bg-[#F5F2E9] border border-stone-200 rounded-xl p-3 text-xs text-stone-700 w-full mt-5 text-left">
              <div className="font-bold text-[#013E18] mb-1">Enquiry Summary (Demo):</div>
              <div>• Target Date: <strong>{visitDate}</strong> ({preferredSlot})</div>
              <div>• Contact: <strong>{fullName}</strong> ({phone})</div>
              <div>• Destination: <strong>{property.location}, {property.district}</strong></div>
            </div>

            <button
              onClick={handleModalClose}
              className="mt-6 px-6 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] font-bold text-xs hover:bg-[#00280f] shadow-md transition-all cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            
            {/* Seller Guarantee Note */}
            <div className="p-3 rounded-xl bg-[#F5F2E9] border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#013E18] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {property.ownershipType === 'company'
                  ? t.propertyDetails.companyGuarantee
                  : t.propertyDetails.thirdPartyNotice}
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                {errorMsg}
              </div>
            )}

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.propertyDetails.yourName} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:border-[#013E18] focus:ring-1 focus:ring-[#013E18] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.propertyDetails.yourPhone} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:border-[#013E18] focus:ring-1 focus:ring-[#013E18] outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.propertyDetails.yourEmail} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:border-[#013E18] focus:ring-1 focus:ring-[#013E18] outline-hidden"
                />
              </div>
            </div>

            {/* Visit Schedule Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.propertyDetails.selectDate}
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:border-[#013E18] focus:ring-1 focus:ring-[#013E18] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.propertyDetails.preferredSlot}
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <select
                    value={preferredSlot}
                    onChange={(e) => setPreferredSlot(e.target.value as any)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:border-[#013E18] focus:ring-1 focus:ring-[#013E18] outline-hidden bg-white"
                  >
                    <option value="morning">{t.propertyDetails.morning}</option>
                    <option value="afternoon">{t.propertyDetails.afternoon}</option>
                    <option value="evening">{t.propertyDetails.evening}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Enquiry Note / Questions
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.propertyDetails.messagePlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:border-[#013E18] focus:ring-1 focus:ring-[#013E18] outline-hidden resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#C99325]" />
                <span>{t.propertyDetails.submitEnquiry}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
