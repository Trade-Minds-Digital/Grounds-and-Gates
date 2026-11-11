import React from 'react';
import { Sparkles, PhoneCall, ShieldCheck, ArrowRight } from 'lucide-react';
import { translations } from '../../i18n/translations';
import { LanguageCode } from '../../types/property';

interface AnnouncementBarProps {
  lang: LanguageCode;
  onExploreClick?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  lang,
  onExploreClick
}) => {
  const t = translations[lang];

  return (
    <div className="bg-[#013E18] text-[#F5F2E9] border-b border-[#013E18]/40 text-xs py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left message */}
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="inline-flex items-center gap-1 bg-[#C99325]/20 text-[#C99325] px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Tamil Nadu
          </span>
          <span className="text-[#F5F2E9]/90 font-medium">
            {t.announcement.message}
          </span>
        </div>

        {/* Right quick actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onExploreClick}
            className="inline-flex items-center gap-1 text-[#C99325] hover:text-[#e0aa3e] font-semibold transition-colors cursor-pointer"
          >
            <span>{t.announcement.cta}</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <span className="text-[#F5F2E9]/30">|</span>

          <a
            href="tel:+914222987000"
            className="hidden sm:inline-flex items-center gap-1 text-[#F5F2E9]/80 hover:text-white"
          >
            <PhoneCall className="w-3 h-3 text-[#C99325]" />
            <span>+91 422 298 7000</span>
          </a>
        </div>
      </div>
    </div>
  );
};
