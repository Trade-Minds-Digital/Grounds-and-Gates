import React, { useState } from 'react';
import { Property, LanguageCode, ListingStatus } from '../types/property';
import { translations } from '../i18n/translations';
import { formatPriceINR } from '../utils/propertyUtils';
import {
  Building2,
  Users,
  PlusCircle,
  ShieldCheck,
  BarChart3,
  Sliders,
  ArrowUpRight
} from 'lucide-react';

interface SellerDashboardPageProps {
  properties: Property[];
  lang: LanguageCode;
  onNavigate: (view: string, params?: any) => void;
  onSelectProperty: (id: string) => void;
  onUpdatePropertyStatus: (propertyId: string, newStatus: ListingStatus) => void;
}

export const SellerDashboardPage: React.FC<SellerDashboardPageProps> = ({
  properties,
  lang,
  onNavigate,
  onSelectProperty,
  onUpdatePropertyStatus
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'leads' | 'analytics'>('overview');

  const sellerListings = properties.slice(0, 8);

  const totalViews = sellerListings.reduce((sum, p) => sum + (p.viewsCount || 350), 0);
  const totalLeads = sellerListings.reduce((sum, p) => sum + (p.enquiriesCount || 12), 0);
  const activeCount = sellerListings.filter(p => p.status === 'active').length;

  const [leads] = useState([
    {
      id: 'lead-1',
      buyerName: 'Karthik Subramanian',
      phone: '+91 98402 33445',
      propertyTitle: 'DTCP Approved Plot in Saravanampatti',
      propertyId: 'gg-cbe-plot-01',
      date: 'Today, 10:45 AM',
      status: 'Site Visit Requested',
      message: 'Looking for 5 cents plot for immediate villa construction. Want to visit this Saturday.'
    },
    {
      id: 'lead-2',
      buyerName: 'Dr. Meena Ramesh',
      phone: '+91 94432 11990',
      propertyTitle: 'The Royal Gates: 4BHK Ultra-Luxury Smart Villa',
      propertyId: 'gg-cbe-villa-01',
      date: 'Yesterday, 4:20 PM',
      status: 'Direct Call Scheduled',
      message: 'Need video walkthrough of the master bedroom and private plunge pool.'
    },
    {
      id: 'lead-3',
      buyerName: 'Anand & Co Enterprises',
      phone: '+91 98940 77112',
      propertyTitle: 'Scenic 4.5 Acre Coconut Grove with PAP Canal Water',
      propertyId: 'gg-pol-agri-01',
      date: '2 days ago',
      status: 'Offer Received',
      message: 'Interested in organic farm investment. Please share FMB sketch and patta documents.'
    }
  ]);

  const navItems = [
    { id: 'overview', label: t.sellerDashboard.overview, icon: Sliders },
    { id: 'listings', label: `${t.sellerDashboard.myListings} (${sellerListings.length})`, icon: Building2 },
    { id: 'leads', label: `${t.sellerDashboard.leads} (${leads.length})`, icon: Users },
    { id: 'analytics', label: t.sellerDashboard.analytics, icon: BarChart3 },
  ];

  return (
    <div className="bg-[#FAF8F2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#013E18] text-[#C99325] flex items-center justify-center font-black text-xl shadow-md shrink-0">
                GG
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#18241B] tracking-tight">
                    Seller & Developer CRM
                  </h1>
                  <span className="text-[10px] font-bold bg-[#C99325] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Developer Partner
                  </span>
                </div>
                <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span>Grounds & Gates Realty Desk</span>
                  <span>·</span>
                  <span>Tamil Nadu Portfolio</span>
                  <span>·</span>
                  <span>Coimbatore & Chennai Hubs</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('post-property')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#C99325]" />
                <span>{t.sellerDashboard.addNewListing}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar + Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sticky Desktop Sidebar / Mobile Nav Pills */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-3xl p-3 border border-stone-200/90 shadow-xs">
              <div className="hidden lg:block px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-stone-400">
                Partner Console
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
            </div>

            <div className="hidden lg:flex bg-white p-4 rounded-2xl border border-stone-200/80 text-[11px] text-stone-600 items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#013E18] shrink-0 mt-0.5" />
              <span>Demo CRM views showcase illustrative engagement & status workflows.</span>
            </div>
          </aside>

          {/* Main Workspace (9 cols) */}
          <div className="lg:col-span-9 min-w-0">
            
            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* KPI Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs border-t-2 border-t-[#013E18]">
                    <div className="text-stone-400 text-[10px] font-extrabold uppercase tracking-wider">{t.sellerDashboard.statsListings}</div>
                    <div className="text-3xl font-black text-[#013E18] mt-1.5">{sellerListings.length}</div>
                    <div className="text-[11px] text-stone-500 mt-1">Managed on platform</div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs border-t-2 border-t-[#013E18]">
                    <div className="text-stone-400 text-[10px] font-extrabold uppercase tracking-wider">{t.sellerDashboard.statsActive}</div>
                    <div className="text-3xl font-black text-emerald-700 mt-1.5">{activeCount}</div>
                    <div className="text-[11px] text-stone-500 mt-1">Live in marketplace</div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs border-t-2 border-t-[#C99325]">
                    <div className="text-stone-400 text-[10px] font-extrabold uppercase tracking-wider">{t.sellerDashboard.statsViews}</div>
                    <div className="text-3xl font-black text-[#C99325] mt-1.5">{totalViews.toLocaleString()}</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +24% this week (Demo)</div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs border-t-2 border-t-stone-300">
                    <div className="text-stone-400 text-[10px] font-extrabold uppercase tracking-wider">{t.sellerDashboard.statsLeads}</div>
                    <div className="text-3xl font-black text-[#18241B] mt-1.5">{totalLeads}</div>
                    <div className="text-[11px] text-stone-500 mt-1">High-intent inquiries</div>
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-extrabold text-[#18241B]">
                        Weekly Traffic & Buyer Engagements
                      </h2>
                      <p className="text-xs text-stone-500">Illustrative snapshot of listing impressions and buyer inquiries</p>
                    </div>
                    <span className="text-[10px] font-bold bg-[#FAF8F2] border border-stone-200 text-[#013E18] px-2.5 py-1 rounded-full">
                      Demo Telemetry
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-2 sm:gap-4 h-48 items-end pt-6 border-b border-stone-100 text-center">
                    {[
                      { day: 'Mon', views: 420 },
                      { day: 'Tue', views: 680 },
                      { day: 'Wed', views: 890 },
                      { day: 'Thu', views: 740 },
                      { day: 'Fri', views: 1120 },
                      { day: 'Sat', views: 1450 },
                      { day: 'Sun', views: 1680 },
                    ].map((item, i) => {
                      const heightPercent = Math.round((item.views / 1800) * 100);
                      return (
                        <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                          <div className="text-[10px] font-bold text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.views}
                          </div>
                          <div
                            className="w-full max-w-[36px] bg-[#013E18] group-hover:bg-[#C99325] rounded-t-xl transition-all duration-300"
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className="text-xs font-semibold text-stone-600 mt-1">{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Listings Table with Thumbnails */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-extrabold text-[#18241B]">
                      Manage Active Listings
                    </h2>
                    <button
                      onClick={() => setActiveTab('listings')}
                      className="text-xs font-bold text-[#013E18] hover:text-[#C99325] cursor-pointer"
                    >
                      View All ({sellerListings.length})
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider">
                          <th className="pb-3">{t.sellerDashboard.listingName}</th>
                          <th className="pb-3">{t.sellerDashboard.price}</th>
                          <th className="pb-3">{t.sellerDashboard.type}</th>
                          <th className="pb-3">{t.sellerDashboard.views}</th>
                          <th className="pb-3">{t.sellerDashboard.status}</th>
                          <th className="pb-3 text-right">{t.sellerDashboard.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {sellerListings.slice(0, 5).map(listing => (
                          <tr key={listing.id} className="hover:bg-[#FAF8F2]/60 transition-colors">
                            <td className="py-3.5 pr-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={listing.images[0]}
                                  alt=""
                                  className="w-12 h-9 rounded-lg object-cover shrink-0 border border-stone-200"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-[#18241B] line-clamp-1">{listing.title}</div>
                                  <div className="text-[11px] text-stone-400 truncate">{listing.location}, {listing.district}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 font-bold text-[#013E18] whitespace-nowrap">
                              {formatPriceINR(listing.price, listing.listingType, listing.priceUnit)}
                            </td>
                            <td className="py-3.5 capitalize text-stone-600">
                              {listing.category.replace('-', ' ')}
                            </td>
                            <td className="py-3.5 font-semibold text-stone-700">
                              {listing.viewsCount || 340}
                            </td>
                            <td className="py-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                  listing.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : listing.status === 'under-negotiation'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {listing.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-right whitespace-nowrap">
                              <button
                                onClick={() => onSelectProperty(listing.id)}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#013E18] hover:text-white font-bold text-[11px] transition-colors mr-1 cursor-pointer"
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  const nextStatus = listing.status === 'active' ? 'under-negotiation' : 'active';
                                  onUpdatePropertyStatus(listing.id, nextStatus);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                {listing.status === 'active' ? 'Hold' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Full Listings Table */}
            {activeTab === 'listings' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-extrabold text-[#18241B]">
                    All Managed Properties
                  </h2>
                  <button
                    onClick={() => onNavigate('post-property')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#013E18] text-[#F5F2E9] font-bold text-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-[#C99325]" />
                    <span>Add Property</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Property</th>
                        <th className="pb-3">Price</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Views</th>
                        <th className="pb-3">Inquiries</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {sellerListings.map(listing => (
                        <tr key={listing.id} className="hover:bg-[#FAF8F2]/60 transition-colors">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={listing.images[0]}
                                alt=""
                                className="w-12 h-9 rounded-lg object-cover shrink-0 border border-stone-200"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-[#18241B] line-clamp-1">{listing.title}</div>
                                <div className="text-[11px] text-stone-400 truncate">{listing.location}, {listing.district}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 font-bold text-[#013E18] whitespace-nowrap">
                            {formatPriceINR(listing.price, listing.listingType, listing.priceUnit)}
                          </td>
                          <td className="py-3.5 capitalize text-stone-600">
                            {listing.category.replace('-', ' ')}
                          </td>
                          <td className="py-3.5 font-semibold text-stone-700">
                            {listing.viewsCount || 340}
                          </td>
                          <td className="py-3.5 font-semibold text-stone-700">
                            {listing.enquiriesCount || 14}
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                listing.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {listing.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => onSelectProperty(listing.id)}
                              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#013E18] hover:text-white font-bold text-[11px] transition-colors mr-1 cursor-pointer"
                            >
                              View
                            </button>
                            <button
                              onClick={() => {
                                const next = listing.status === 'active' ? 'sold' : 'active';
                                onUpdatePropertyStatus(listing.id, next);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 font-semibold text-[11px] cursor-pointer"
                            >
                              Toggle Sold
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Leads */}
            {activeTab === 'leads' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs animate-in fade-in duration-200">
                <h2 className="text-lg font-extrabold text-[#18241B] mb-4">
                  Buyer Inquiries & Leads (Simulated CRM)
                </h2>

                <div className="space-y-4">
                  {leads.map(lead => (
                    <div key={lead.id} className="p-5 rounded-2xl border border-stone-200 bg-[#FAF8F2] text-xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="font-bold text-sm text-[#18241B]">{lead.buyerName}</div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 w-fit">
                          {lead.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-stone-500 pt-1">
                        <span>Phone: <strong className="text-stone-800">{lead.phone}</strong></span>
                        <button
                          onClick={() => onSelectProperty(lead.propertyId)}
                          className="inline-flex items-center gap-1 text-[#013E18] font-bold hover:text-[#C99325] cursor-pointer"
                        >
                          <span>{lead.propertyTitle}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <span>Received: <strong>{lead.date}</strong></span>
                      </div>

                      <p className="text-stone-700 bg-white p-3 rounded-xl border border-stone-200 mt-2">
                        "{lead.message}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Analytics */}
            {activeTab === 'analytics' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
                <h2 className="text-lg font-extrabold text-[#18241B]">Deep Marketplace Analytics (Demo)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-stone-200">
                    <div className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Click-Through Rate (CTR)</div>
                    <div className="text-2xl font-black text-[#013E18] mt-1">4.8%</div>
                    <div className="text-stone-500 mt-1">Top-decile performance</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-stone-200">
                    <div className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Average Site Visit Booking Time</div>
                    <div className="text-2xl font-black text-[#C99325] mt-1">1.8 Days</div>
                    <div className="text-stone-500 mt-1">From initial listing view</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-stone-200">
                    <div className="text-stone-400 font-bold uppercase text-[10px] tracking-wider">Top Performing Region</div>
                    <div className="text-2xl font-black text-[#18241B] mt-1">Coimbatore</div>
                    <div className="text-stone-500 mt-1">Saravanampatti & Vadavalli</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
