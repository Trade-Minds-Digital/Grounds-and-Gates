import React, { useState } from 'react';
import { Property, LanguageCode, EnquirySubmission } from '../types/property';
import { translations } from '../i18n/translations';
import { formatPriceINR } from '../utils/propertyUtils';
import { PropertyCard } from '../components/property/PropertyCard';
import {
  User,
  Heart,
  Scale,
  Calendar,
  MessageSquare,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Sliders,
  Settings
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

  return (
    <div className="bg-[#FAF8F2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Buyer Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#013E18] text-[#C99325] flex items-center justify-center font-black text-xl shadow-md">
                MS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#18241B]">
                    Mohanraj S.
                  </h1>
                  <span className="text-[10px] font-bold bg-[#013E18]/10 text-[#013E18] px-2 py-0.5 rounded uppercase">
                    Buyer Account
                  </span>
                </div>
                <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-3">
                  <span>mohanrajs0410@gmail.com</span>
                  <span>•</span>
                  <span>+91 98422 71000</span>
                  <span>•</span>
                  <span>Preferred District: Coimbatore & Chennai</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FAF8F2] px-4 py-2.5 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#013E18]" />
              <span>{t.buyerDashboard.demoAnalyticsNote}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-stone-100 overflow-x-auto">
            {[
              { id: 'overview', label: t.buyerDashboard.overview, icon: Sliders },
              { id: 'enquiries', label: `${t.buyerDashboard.myEnquiries} (${enquiries.length})`, icon: MessageSquare },
              { id: 'saved', label: `${t.buyerDashboard.savedListings} (${savedProperties.length})`, icon: Heart },
              { id: 'settings', label: 'Preferences', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#013E18] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="text-stone-400 text-xs font-bold uppercase">{t.buyerDashboard.statsSaved}</div>
                <div className="text-3xl font-black text-[#013E18] mt-1">{savedProperties.length}</div>
                <div className="text-[11px] text-stone-500 mt-1">Shortlisted for review</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="text-stone-400 text-xs font-bold uppercase">{t.buyerDashboard.statsEnquiries}</div>
                <div className="text-3xl font-black text-[#C99325] mt-1">{enquiries.length}</div>
                <div className="text-[11px] text-stone-500 mt-1">Direct seller requests</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="text-stone-400 text-xs font-bold uppercase">{t.buyerDashboard.statsVisits}</div>
                <div className="text-3xl font-black text-[#013E18] mt-1">{enquiries.filter(e => e.visitDate).length}</div>
                <div className="text-[11px] text-stone-500 mt-1">Site inspections booked</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="text-stone-400 text-xs font-bold uppercase">{t.buyerDashboard.statsViewed}</div>
                <div className="text-3xl font-black text-stone-700 mt-1">14</div>
                <div className="text-[11px] text-stone-500 mt-1">Listings browsed</div>
              </div>
            </div>

            {/* Recent Enquiries Section */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#18241B]">
                  Recent Site Visits & Enquiries
                </h2>
                <button
                  onClick={() => setActiveTab('enquiries')}
                  className="text-xs font-bold text-[#013E18] hover:text-[#C99325] cursor-pointer"
                >
                  View All ({enquiries.length})
                </button>
              </div>

              {enquiries.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500 bg-[#FAF8F2] rounded-2xl">
                  No enquiries logged yet. Browse properties and click "Schedule Site Visit" or "Send Enquiry".
                </div>
              ) : (
                <div className="space-y-3">
                  {enquiries.slice(0, 3).map(enq => (
                    <div
                      key={enq.id}
                      className="p-4 rounded-2xl border border-stone-100 bg-[#FAF8F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#18241B]">{enq.propertyTitle}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {enq.propertyLocation} • {formatPriceINR(enq.propertyPrice)}
                        </div>
                        {enq.visitDate && (
                          <div className="text-[11px] text-[#013E18] font-bold mt-1 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Visit scheduled for {enq.visitDate} ({enq.preferredTimeSlot})</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          {enq.status}
                        </span>
                        <button
                          onClick={() => onSelectProperty(enq.propertyId)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 font-semibold hover:bg-stone-50"
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
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#18241B]">
                  Shortlisted Properties ({savedProperties.length})
                </h2>
                <button
                  onClick={() => onNavigate('favorites')}
                  className="text-xs font-bold text-[#013E18] hover:text-[#C99325] cursor-pointer"
                >
                  Manage Saved
                </button>
              </div>

              {savedProperties.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500 bg-[#FAF8F2] rounded-2xl">
                  You haven't saved any listings yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs animate-in fade-in duration-200">
            <h2 className="text-lg font-bold text-[#18241B] mb-4">
              All Submitted Inquiries & Site Visits
            </h2>

            {enquiries.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-500 bg-[#FAF8F2] rounded-2xl">
                No active enquiries yet. Submit an enquiry on any property detail page.
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
                      <div>Expected Price: <strong>{formatPriceINR(enq.propertyPrice)}</strong></div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div>
        )}

        {/* Tab 4: Preferences */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs max-w-2xl space-y-4 text-xs animate-in fade-in duration-200">
            <h2 className="text-lg font-bold text-[#18241B]">Buyer Notifications & Search Preferences</h2>
            
            <label className="flex items-center gap-2 font-semibold text-stone-700">
              <input type="checkbox" defaultChecked className="rounded text-[#013E18]" />
              <span>Receive WhatsApp instant alerts when new DTCP plots in Coimbatore match my budget</span>
            </label>

            <label className="flex items-center gap-2 font-semibold text-stone-700">
              <input type="checkbox" defaultChecked className="rounded text-[#013E18]" />
              <span>Email me price reductions on saved properties</span>
            </label>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => alert('Demo preferences saved')}
                className="px-5 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] font-bold cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
