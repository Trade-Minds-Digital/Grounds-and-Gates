import React, { useState } from 'react';
import { Property, LanguageCode, EnquirySubmission } from '../types/property';
import { translations } from '../i18n/translations';
import { formatPriceINR } from '../utils/propertyUtils';
import { PropertyCard } from '../components/property/PropertyCard';
import {
  Heart,
  Scale,
  Calendar,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Settings,
  ArrowRight,
  Compass
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'enquiries' | 'saved' | 'settings'>('overview');
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  const navItems = [
    { id: 'overview', label: t.buyerDashboard.overview, icon: Sliders },
    { id: 'enquiries', label: `${t.buyerDashboard.myEnquiries} (${enquiries.length})`, icon: MessageSquare },
    { id: 'saved', label: `${t.buyerDashboard.savedListings} (${savedProperties.length})`, icon: Heart },
    { id: 'settings', label: 'Preferences', icon: Settings },
  ];

  const handleSavePrefs = () => {
    setPreferencesSaved(true);
    setTimeout(() => setPreferencesSaved(false), 3000);
  };

  return (
    <div className="bg-[#FAF8F2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Welcome Strip */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#013E18] text-[#C99325] flex items-center justify-center font-black text-xl shadow-md shrink-0">
                MS
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#18241B] tracking-tight">
                    Welcome back, Mohanraj S.
                  </h1>
                  <span className="text-[10px] font-bold bg-[#013E18]/10 text-[#013E18] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Verified Buyer Account
                  </span>
                </div>
                <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span>mohanrajs0410@gmail.com</span>
                  <span>·</span>
                  <span>+91 98422 71000</span>
                  <span>·</span>
                  <span>Coimbatore & Chennai Corridors</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('properties')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#C99325]" />
                <span>Explore Marketplace</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar + Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Refined Desktop Sidebar / Mobile Nav Pills (3 cols) */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-3xl p-3 border border-stone-200/90 shadow-xs">
              <div className="hidden lg:block px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-stone-400">
                Buyer Workspace
              </div>
              <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                {navItems.map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer lg:w-full text-left ${
                        active
                          ? 'bg-[#013E18] text-white shadow-xs'
                          : 'text-stone-600 hover:bg-[#FAF8F2] hover:text-[#013E18]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#C99325]' : 'text-stone-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="hidden lg:block mt-4 pt-4 border-t border-stone-100 px-3">
                <button
                  onClick={() => onNavigate('compare')}
                  className="w-full flex items-center justify-between text-xs font-bold text-[#013E18] hover:text-[#C99325] transition-colors cursor-pointer py-1"
                >
                  <span className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#C99325]" />
                    <span>Compare Tray</span>
                  </span>
                  <span className="bg-[#FAF8F2] px-2 py-0.5 rounded-full border border-stone-200 text-[11px]">
                    {comparedProperties.length}/4
                  </span>
                </button>
              </div>
            </div>

            <div className="hidden lg:flex bg-white p-4 rounded-2xl border border-stone-200/80 text-[11px] text-stone-600 items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#013E18] shrink-0 mt-0.5" />
              <span>{t.buyerDashboard.demoAnalyticsNote}</span>
            </div>
          </aside>

          {/* Main Dashboard Workspace (9 cols) */}
          <div className="lg:col-span-9 min-w-0">

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* KPI Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs border-t-2 border-t-[#013E18]">
                    <div className="text-stone-400 text-[10px] font-extrabold uppercase tracking-wider">{t.buyerDashboard.statsSaved}</div>
                    <div className="text-3xl font-black text-[#013E18] mt-1.5">{savedProperties.length}</div>
                    <div className="text-[11px] text-stone-500 mt-1">Shortlisted estates</div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs border-t-2 border-t-[#C99325]">
                    <div className="text-stone-400 text-[10px] font-extrabold uppercase tracking-wider">{t.buyerDashboard.statsEnquiries}</div>
                    <div className="text-3xl font-black text-[#C99325] mt-1.5">{enquiries.length}</div>
                    <div className="text-[11px] text-stone-500 mt-1">Direct seller requests</div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs border-t-2 border-t-[#013E18]">
                    <div className="text-stone-400 text-[10px] font-extrabold uppercase tracking-wider">{t.buyerDashboard.statsVisits}</div>
                    <div className="text-3xl font-black text-[#013E18] mt-1.5">{enquiries.filter(e => e.visitDate).length}</div>
                    <div className="text-[11px] text-stone-500 mt-1">Walkthroughs booked</div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs border-t-2 border-t-stone-300">
                    <div className="text-stone-400 text-[10px] font-extrabold uppercase tracking-wider">{t.buyerDashboard.statsViewed}</div>
                    <div className="text-3xl font-black text-stone-700 mt-1.5">14</div>
                    <div className="text-[11px] text-stone-500 mt-1">Listings explored</div>
                  </div>
                </div>

                {/* Recent Enquiries Section */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-extrabold text-[#18241B]">
                      Recent Site Visits & Enquiries
                    </h2>
                    <button
                      onClick={() => setActiveTab('enquiries')}
                      className="text-xs font-bold text-[#013E18] hover:text-[#C99325] cursor-pointer flex items-center gap-1"
                    >
                      <span>View All ({enquiries.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {enquiries.length === 0 ? (
                    <div className="p-8 text-center bg-[#FAF8F2] rounded-2xl border border-dashed border-stone-300">
                      <Calendar className="w-8 h-8 text-[#C99325] mx-auto mb-2 opacity-80" />
                      <div className="text-sm font-bold text-[#18241B]">No site visits requested yet</div>
                      <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                        Explore verified listings and schedule a site inspection directly with our property desk.
                      </p>
                      <button
                        onClick={() => onNavigate('properties')}
                        className="mt-4 px-4 py-2 rounded-xl bg-[#013E18] text-white text-xs font-bold cursor-pointer"
                      >
                        Browse Properties
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {enquiries.slice(0, 3).map(enq => (
                        <div
                          key={enq.id}
                          className="p-4 rounded-2xl border border-stone-200/70 bg-[#FAF8F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#18241B]">{enq.propertyTitle}</div>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              {enq.propertyLocation} · {formatPriceINR(enq.propertyPrice)}
                            </div>
                            {enq.visitDate && (
                              <div className="text-[11px] text-[#013E18] font-bold mt-1 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#C99325]" />
                                <span>Visit scheduled for {enq.visitDate} ({enq.preferredTimeSlot})</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                              {enq.status}
                            </span>
                            <button
                              onClick={() => onSelectProperty(enq.propertyId)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 font-bold hover:border-[#013E18] transition-colors cursor-pointer"
                            >
                              View Listing
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saved Properties Preview */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-extrabold text-[#18241B]">
                      Shortlisted Properties ({savedProperties.length})
                    </h2>
                    <button
                      onClick={() => onNavigate('favorites')}
                      className="text-xs font-bold text-[#013E18] hover:text-[#C99325] cursor-pointer flex items-center gap-1"
                    >
                      <span>Manage Saved</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {savedProperties.length === 0 ? (
                    <div className="p-8 text-center bg-[#FAF8F2] rounded-2xl border border-dashed border-stone-300">
                      <Heart className="w-8 h-8 text-rose-400 mx-auto mb-2 opacity-80" />
                      <div className="text-sm font-bold text-[#18241B]">Your shortlist is empty</div>
                      <p className="text-xs text-stone-500 mt-1">Save plots or villas to compare and revisit later.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Enquiries Detailed */}
            {activeTab === 'enquiries' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs animate-in fade-in duration-200">
                <h2 className="text-lg font-extrabold text-[#18241B] mb-5">
                  All Submitted Inquiries & Site Visits
                </h2>

                {enquiries.length === 0 ? (
                  <div className="p-12 text-center bg-[#FAF8F2] rounded-2xl border border-dashed border-stone-300">
                    <Calendar className="w-10 h-10 text-[#C99325] mx-auto mb-3 opacity-80" />
                    <div className="text-sm font-bold text-[#18241B]">No Active Enquiries Logged</div>
                    <p className="text-xs text-stone-500 mt-1">Submit an enquiry or request a walkthrough on any property brochure.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enquiries.map(enq => (
                      <div
                        key={enq.id}
                        className="p-5 rounded-2xl border border-stone-200 bg-[#FAF8F2] text-xs space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="font-extrabold text-sm text-[#013E18]">{enq.propertyTitle}</div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 w-fit">
                            Status: {enq.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-stone-600 pt-2 border-t border-stone-200">
                          <div>Location: <strong>{enq.propertyLocation}</strong></div>
                          <div>Quoted Price: <strong>{formatPriceINR(enq.propertyPrice)}</strong></div>
                          <div>Submitted: <strong>{new Date(enq.submittedAt).toLocaleDateString()}</strong></div>
                        </div>

                        {enq.visitDate && (
                          <div className="bg-white p-2.5 rounded-xl border border-stone-200 font-semibold text-stone-700">
                            Scheduled Visit: <strong>{enq.visitDate}</strong> ({enq.preferredTimeSlot})
                          </div>
                        )}

                        {enq.message && (
                          <div className="text-stone-500 italic">
                            "{enq.message}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Saved */}
            {activeTab === 'saved' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {savedProperties.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-xs">
                    <Heart className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                    <h2 className="text-lg font-extrabold text-[#18241B]">No Saved Properties Yet</h2>
                    <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                      Click the heart icon on any residence, plot, or agricultural tract to keep track of your shortlist.
                    </p>
                    <button
                      onClick={() => onNavigate('properties')}
                      className="mt-5 px-6 py-2.5 rounded-xl bg-[#013E18] text-white font-bold text-xs cursor-pointer"
                    >
                      Explore Properties
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Preferences */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-5 text-xs animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-extrabold text-[#18241B]">Buyer Notifications & Search Preferences</h2>
                  <p className="text-xs text-stone-500 mt-0.5">Manage how Grounds & Gates alerts you for new launches and price adjustments.</p>
                </div>
                
                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FAF8F2] border border-stone-200/70 font-semibold text-stone-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#013E18]" />
                    <span>Receive WhatsApp instant alerts when new DTCP plots in Coimbatore match my budget</span>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FAF8F2] border border-stone-200/70 font-semibold text-stone-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#013E18]" />
                    <span>Email me price reductions and legal status updates on saved properties</span>
                  </label>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSavePrefs}
                    className="px-6 py-2.5 rounded-xl bg-[#013E18] hover:bg-[#00280f] text-[#F5F2E9] font-bold cursor-pointer transition-all"
                  >
                    Save Preferences
                  </button>
                  {preferencesSaved && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xs animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      Preferences updated
                    </span>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
