import React, { useState } from 'react';
import { LanguageCode } from '../types/property';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ChevronDown,
  Building2,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

interface ContactPageProps {
  lang: LanguageCode;
  onNavigate: (view: string, params?: any) => void;
  onShowToast?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ lang, onNavigate, onShowToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    district: 'Coimbatore',
    inquiryType: 'buying',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
    <div className="min-h-screen bg-[#F5F2E9] pb-24">
      {/* 1. Header Banner */}
      <section className="bg-[#013E18] text-[#F5F2E9] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C99325]/20 text-[#C99325] text-xs font-bold uppercase tracking-widest mb-3 border border-[#C99325]/30">
            Official Contact & Direct Desks
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Connect with Grounds and Gates
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto mt-3 font-medium">
            Reach our headquarters desk in Coimbatore, regional coordination offices, or submit your direct property enquiry.
          </p>
        </div>
      </section>

      {/* 2. Main Grid: Info Cards + Contact Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Info Columns (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Headquarters Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xl space-y-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C99325]">
                  Central Corporate Office
                </span>
                <h3 className="text-xl font-bold text-[#18241B] mt-0.5">
                  Coimbatore Headquarters
                </h3>
              </div>

              <div className="space-y-4 text-xs text-stone-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#013E18]/10 text-[#013E18] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#013E18]" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">Grounds & Gates Towers</div>
                    <div className="text-stone-500 mt-0.5">Avinashi Road, Near Hope College, Coimbatore, Tamil Nadu 641014</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#013E18]/10 text-[#013E18] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#013E18]" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">+91 422 298 7000 (Central Desk)</div>
                    <div className="text-[11px] text-stone-400">Direct Land Consultation</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#013E18]/10 text-[#013E18] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#013E18]" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">direct@groundsandgates.com</div>
                    <div className="text-[11px] text-stone-400">Official Inquiries & Title Desk</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#013E18]/10 text-[#013E18] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-[#013E18]" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">Mon – Sat: 9:00 AM – 7:30 PM</div>
                    <div className="text-[11px] text-stone-400">Sunday by site appointment</div>
                  </div>
                </div>
              </div>

              {/* Chennai Regional Node */}
              <div className="p-4 rounded-2xl bg-[#F5F2E9] border border-stone-200/80">
                <div className="text-[11px] font-bold text-[#013E18] flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-[#C99325]" />
                  <span>Chennai Regional Corridor Desk</span>
                </div>
                <div className="text-[11px] text-stone-600">
                  OMR Tech Corridor, Perungudi, Chennai 600096 • Tel: +91 44 2490 8000
                </div>
              </div>
            </div>

            {/* Trust Banner */}
            <div className="bg-[#013E18] text-[#F5F2E9] rounded-3xl p-6 border border-[#C99325]/40 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-[#C99325]" />
                <h4 className="text-sm font-bold text-white">Title Verification Commitment</h4>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Need verification on an existing Tamil Nadu land parcel? Bring your parent documents to our legal desk for an independent title review.
              </p>
            </div>
          </div>

          {/* Right Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-xl">
              <div className="pb-6 border-b border-stone-100 mb-6">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#C99325]">
                  Direct Inquiry Desk
                </span>
                <h3 className="text-2xl font-bold text-[#18241B] mt-0.5">
                  Send a Message or Request Site Tour
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Fill in your requirements below. Our district coordinator will reach out via call or WhatsApp within 2 hours.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 text-center bg-[#F5F2E9] rounded-2xl border border-stone-200 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#013E18] text-[#C99325] flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#013E18]">Inquiry Received Successfully!</h4>
                    <p className="text-xs text-stone-600 max-w-md mx-auto mt-1 leading-relaxed">
                      Thank you, <strong>{formData.name}</strong>. Your message regarding <strong>{formData.district}</strong> properties has been logged in our demo desk coordinator queue.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        district: 'Coimbatore',
                        inquiryType: 'buying',
                        message: ''
                      });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] font-bold text-xs hover:bg-[#00280f] transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Senthil Kumar"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-[#18241B] focus:border-[#013E18] focus:bg-white outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98422 00000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-[#18241B] focus:border-[#013E18] focus:bg-white outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="senthil@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-[#18241B] focus:border-[#013E18] focus:bg-white outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Target District / Region
                      </label>
                      <select
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-[#18241B] focus:border-[#013E18] focus:bg-white outline-hidden"
                      >
                        <option value="Coimbatore">Coimbatore (கோயம்புத்தூர்)</option>
                        <option value="Chennai">Chennai (சென்னை)</option>
                        <option value="Madurai">Madurai (மதுரை)</option>
                        <option value="Tiruppur">Tiruppur (திருப்பூர்)</option>
                        <option value="Erode">Erode (ஈரோடு)</option>
                        <option value="Salem">Salem (சேலம்)</option>
                        <option value="Trichy">Trichy (திருச்சிராப்பள்ளி)</option>
                        <option value="Pollachi">Pollachi (பொள்ளாச்சி)</option>
                        <option value="Ooty">Ooty / Nilgiris (ஊட்டி)</option>
                        <option value="Hosur">Hosur (ஓசூர்)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Inquiry Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'buying', label: 'Buying a Property' },
                        { id: 'selling', label: 'Listing / Selling' },
                        { id: 'title-check', label: 'Legal Audit' },
                        { id: 'partner', label: 'Channel Partner' },
                      ].map(type => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, inquiryType: type.id })}
                          className={`p-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer border ${
                            formData.inquiryType === type.id
                              ? 'bg-[#013E18] text-white border-[#013E18]'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Message / Requirement Details
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Share your budget, preferred locality, facing, or specific survey queries..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-[#18241B] focus:border-[#013E18] focus:bg-white outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#C99325]" />
                    <span>Submit Direct Inquiry (Demo)</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 3. Frequently Asked Questions (Accordion) */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C99325] uppercase tracking-wider mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Buyer & Owner FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18241B]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Clear answers regarding titles, cent measurements, visits, and direct listing policies.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#18241B] hover:text-[#013E18] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#C99325] transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-100 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
