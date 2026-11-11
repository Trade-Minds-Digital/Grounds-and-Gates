import React, { useState } from 'react';
import { Property, LanguageCode } from '../types/property';
import { translations } from '../i18n/translations';
import { formatPriceINR, formatArea, findPropertyDifferences } from '../utils/propertyUtils';
import { Badge } from '../components/common/Badge';
import {
  Scale,
  Plus,
  Trash2,
  Check,
  X,
  ArrowRight,
  Sparkles,
  Building2,
  MapPin,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';

interface ComparePageProps {
  comparedProperties: Property[];
  allProperties: Property[];
  lang: LanguageCode;
  onRemoveFromCompare: (id: string) => void;
  onAddToCompare: (id: string) => void;
  onSelectProperty: (id: string) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  comparedProperties,
  allProperties,
  lang,
  onRemoveFromCompare,
  onAddToCompare,
  onSelectProperty,
  onNavigate
}) => {
  const t = translations[lang];
  const [highlightDiffs, setHighlightDiffs] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const diffFields = findPropertyDifferences(comparedProperties);

  // Available properties to add to comparison (up to 4 max)
  const candidateProperties = allProperties.filter(
    p => !comparedProperties.some(cp => cp.id === p.id)
  );

  if (comparedProperties.length === 0) {
    return (
      <div className="bg-[#FAF8F2] min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 text-center border border-stone-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#013E18]/10 text-[#013E18] flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-[#013E18]" />
          </div>
          <h2 className="text-xl font-bold text-[#18241B]">{t.compare.emptyTitle}</h2>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            {t.compare.emptySubtitle}
          </p>

          <button
            onClick={() => onNavigate('properties')}
            className="mt-6 px-6 py-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] font-bold text-xs hover:bg-[#00280f] shadow-md transition-all cursor-pointer"
          >
            {t.compare.browseCta}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C99325] uppercase tracking-wider mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>Side-by-Side Evaluation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18241B] tracking-tight">
              {t.compare.title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
              {t.compare.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Highlight Differences Toggle */}
            <label className="flex items-center gap-2 text-xs font-bold text-stone-700 bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-2xs cursor-pointer">
              <input
                type="checkbox"
                checked={highlightDiffs}
                onChange={(e) => setHighlightDiffs(e.target.checked)}
                className="rounded text-[#013E18] focus:ring-[#013E18]"
              />
              <span>{t.compare.highlightDifferences}</span>
            </label>

            {comparedProperties.length < 4 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#C99325]" />
                <span>{t.compare.addProperty} ({comparedProperties.length}/4)</span>
              </button>
            )}
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70">
                <th className="p-4 sm:p-5 w-48 text-xs font-bold uppercase tracking-wider text-stone-400">
                  Feature / Property
                </th>
                {comparedProperties.map(prop => (
                  <th key={prop.id} className="p-4 sm:p-5 w-72 align-top">
                    <div className="relative group">
                      <div className="relative h-40 rounded-xl overflow-hidden mb-3 bg-stone-100">
                        <img
                          src={prop.images[0]}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => onRemoveFromCompare(prop.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                          title={t.compare.remove}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute top-2 left-2">
                          <Badge type="demo" size="sm" />
                        </div>
                      </div>

                      <h3
                        onClick={() => onSelectProperty(prop.id)}
                        className="text-xs font-bold text-[#18241B] hover:text-[#013E18] line-clamp-2 cursor-pointer transition-colors"
                      >
                        {lang === 'ta' && prop.tamilTitle ? prop.tamilTitle : prop.title}
                      </h3>

                      <div className="text-sm font-black text-[#013E18] mt-1">
                        {formatPriceINR(prop.price, prop.listingType, prop.priceUnit)}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100 text-xs">
              
              {/* Ownership Type */}
              <tr className={highlightDiffs && diffFields.includes('ownershipType') ? 'bg-amber-50/50' : ''}>
                <td className="p-4 font-bold text-stone-600">{t.compare.ownership}</td>
                {comparedProperties.map(prop => (
                  <td key={prop.id} className="p-4">
                    {prop.ownershipType === 'company' ? (
                      <Badge type="company" size="sm" />
                    ) : (
                      <Badge type="third-party" label={prop.seller.badgeTitle} size="sm" />
                    )}
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr className={highlightDiffs && diffFields.includes('category') ? 'bg-amber-50/50' : ''}>
                <td className="p-4 font-bold text-stone-600">{t.compare.category}</td>
                {comparedProperties.map(prop => (
                  <td key={prop.id} className="p-4 capitalize font-semibold text-stone-800">
                    {prop.category.replace('-', ' ')}
                  </td>
                ))}
              </tr>

              {/* Price */}
              <tr className={highlightDiffs && diffFields.includes('price') ? 'bg-amber-50/50' : ''}>
                <td className="p-4 font-bold text-stone-600">{t.compare.price}</td>
                {comparedProperties.map(prop => (
                  <td key={prop.id} className="p-4 font-extrabold text-[#013E18]">
                    {formatPriceINR(prop.price, prop.listingType, prop.priceUnit)}
                    <span className="block text-[10px] font-normal text-stone-500">
                      {prop.negotiable ? 'Negotiable' : 'Fixed Corporate Price'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Location */}
              <tr>
                <td className="p-4 font-bold text-stone-600">{t.compare.locality}</td>
                {comparedProperties.map(prop => (
                  <td key={prop.id} className="p-4 font-medium text-stone-800">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C99325]" />
                      <span>{prop.location}, {prop.district}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Plot Area */}
              <tr className={highlightDiffs && diffFields.includes('plotArea') ? 'bg-amber-50/50' : ''}>
                <td className="p-4 font-bold text-stone-600">{t.compare.plotArea}</td>
                {comparedProperties.map(prop => (
                  <td key={prop.id} className="p-4 font-semibold text-stone-800">
                    {formatArea(prop.plotArea, prop.plotAreaUnit)}
                  </td>
                ))}
              </tr>

              {/* Built-up Area */}
              <tr>
                <td className="p-4 font-bold text-stone-600">{t.compare.builtUpArea}</td>
                {comparedProperties.map(prop => (
                  <td key={prop.id} className="p-4 text-stone-700">
                    {prop.builtUpArea ? `${prop.builtUpArea} sq.ft` : 'N/A (Plot)'}
                  </td>
                ))}
              </tr>

              {/* Bedrooms & Bathrooms */}
              <tr className={highlightDiffs && diffFields.includes('bedrooms') ? 'bg-amber-50/50' : ''}>
                <td className="p-4 font-bold text-stone-600">{t.compare.bedrooms}</td>
                {comparedProperties.map(prop => (
                  <td key={prop.id} className="p-4 text-stone-800 font-semibold">
                    {prop.bedrooms ? `${prop.bedrooms} BHK (${prop.bathrooms || 1} Baths)` : 'N/A (Plot)'}
                  </td>
                ))}
              </tr>

              {/* Facing */}
              <tr className={highlightDiffs && diffFields.includes('facing') ? 'bg-amber-50/50' : ''}>
                <td className="p-4 font-bold text-stone-600">{t.compare.facing}</td>
                {comparedProperties.map(prop => (
                  <td key={prop.id} className="p-4 text-stone-800 font-medium">
                    {prop.facing}
                  </td>
                ))}
              </tr>

              {/* Road Width */}
              <tr>
                <td className="p-4 font-bold text-stone-600">{t.compare.roadWidth}</td>
                {comparedProperties.map(prop => (
                  <td key={prop.id} className="p-4 text-stone-800 font-medium">
                    {prop.roadWidthFeet || 30} Feet Blacktop
                  </td>
                ))}
              </tr>

              {/* Approval Authority */}
              <tr>
                <td className="p-4 font-bold text-stone-600">{t.compare.approval}</td>
                {comparedProperties.map(prop => (
                  <td key={prop.id} className="p-4">
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {prop.approvalAuthority || 'Clear Patta'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Amenities List */}
              <tr>
                <td className="p-4 font-bold text-stone-600">{t.compare.amenities}</td>
                {comparedProperties.map(prop => (
                  <td key={prop.id} className="p-4 space-y-1">
                    {prop.amenities.slice(0, 4).map((a, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-stone-700">
                        <Check className="w-3 h-3 text-[#013E18] shrink-0" />
                        <span className="text-[11px]">{a}</span>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>

              {/* Action Buttons */}
              <tr className="bg-stone-50/50">
                <td className="p-4 font-bold text-stone-600">{t.compare.action}</td>
                {comparedProperties.map(prop => (
                  <td key={prop.id} className="p-4">
                    <button
                      onClick={() => onSelectProperty(prop.id)}
                      className="w-full py-2 px-3 rounded-xl bg-[#013E18] text-[#F5F2E9] hover:bg-[#00280f] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C99325]" />
                    </button>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-base text-[#18241B]">
                Select Property to Compare
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {candidateProperties.map(prop => (
                <div
                  key={prop.id}
                  onClick={() => {
                    onAddToCompare(prop.id);
                    setShowAddModal(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-[#013E18] hover:bg-[#FAF8F2] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img src={prop.images[0]} alt="" className="w-12 h-10 rounded-lg object-cover" />
                    <div>
                      <div className="text-xs font-bold text-[#18241B] line-clamp-1">{prop.title}</div>
                      <div className="text-[11px] text-stone-500">{prop.location}, {prop.district}</div>
                    </div>
                  </div>
                  <div className="text-xs font-black text-[#013E18] shrink-0">
                    {formatPriceINR(prop.price, prop.listingType, prop.priceUnit)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
