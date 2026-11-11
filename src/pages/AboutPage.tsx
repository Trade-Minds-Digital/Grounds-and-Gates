import React from 'react';
import { LanguageCode } from '../types/property';
import {
  ShieldCheck,
  Compass,
  Building2,
  Users,
  Award,
  CheckCircle2,
  ArrowRight,
  MapPin,
  TrendingUp,
  FileCheck2,
  Scale
} from 'lucide-react';

interface AboutPageProps {
  lang: LanguageCode;
  onNavigate: (view: string, params?: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ lang, onNavigate }) => {
  const leadership = [
    {
      name: 'K. Sundararajan',
      role: 'Founder & Managing Director',
      bio: '25+ years of infrastructure and land acquisition leadership across Coimbatore, Tiruppur, and Western Tamil Nadu.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Priya R. Mohan',
      role: 'Chief Product & Operations Officer',
      bio: 'Former PropTech director dedicated to digital transparency, buyer discovery workflows, and land GIS indexing.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Adv. M. Natarajan',
      role: 'Head of Legal & Title Verification',
      bio: 'Senior property counsel specializing in DTCP, CMDA, patta transfers, and multi-generational land title audits.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Ar. S. Vignesh',
      role: 'Principal Architect & Town Planner',
      bio: 'Master planner focused on gated enclave infrastructure, vaastu orientation, and sustainable green corridors.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const pillars = [
    {
      title: 'Verified Land Titles & Approvals',
      desc: 'Every listing undergoes rigorous parent document validation, DTCP/CMDA order checks, and patta verification before publishing.',
      icon: ShieldCheck
    },
    {
      title: 'True Ground Dimensions',
      desc: 'Transparent reporting of exact cent measurements, square-foot equivalents, approach road widths, and frontage distances.',
      icon: Compass
    },
    {
      title: 'Direct Corporate & Verified Sellers',
      desc: 'Clear separation between Grounds & Gates company-developed inventory and certified third-party owners, builders, and brokers.',
      icon: Building2
    },
    {
      title: 'Zero Hidden Costs or Surprises',
      desc: 'Honest price disclosures, breakdown of registration expenses, and direct communication without unnecessary intermediaries.',
      icon: Scale
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F2E9] pb-24">
      {/* 1. Hero Banner */}
      <section className="relative bg-[#013E18] text-[#F5F2E9] py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C99325_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C99325]/20 text-[#C99325] text-xs font-bold uppercase tracking-widest mb-4 border border-[#C99325]/30">
            About Grounds and Gates
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Property Decisions Simplified.
          </h1>
          <p className="text-sm sm:text-lg text-stone-300 max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
            Founded with a singular mission: to eliminate the opacity, ambiguous measurements, and misleading listings that plague traditional real estate discovery across Tamil Nadu.
          </p>
        </div>
      </section>

      {/* 2. Brand Story Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-stone-200/90 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#C99325]">
              Our Foundation & Philosophy
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#18241B] tracking-tight leading-snug">
              Bridging the Gap Between Land Dreams and Legal Certainty.
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>
                Real estate in Tamil Nadu is deeply personal. Whether securing a 5-cent villa plot in Coimbatore’s growth corridor, an ancestral coconut grove in Pollachi, or an apartment along Chennai’s OMR, property represents generational security and emotional pride.
              </p>
              <p>
                Yet for decades, buyers have battled inaccurate dimension claims, unverified approvals, hidden markups, and pushy middlemen. <strong>Grounds and Gates</strong> was conceived as a premium technology and legal solution: where every boundary is measured in true ground cents, every approval number is verified, and direct dialogue is respected.
              </p>
            </div>

            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-stone-100">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#013E18]">10+</div>
                <div className="text-[11px] text-stone-500 font-semibold mt-0.5">Tamil Nadu Hubs</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#013E18]">100%</div>
                <div className="text-[11px] text-stone-500 font-semibold mt-0.5">Title Transparency</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#C99325]">0%</div>
                <div className="text-[11px] text-stone-500 font-semibold mt-0.5">Brokerage on Direct</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                alt="Grounds and Gates Architecture"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-[#013E18] text-[#F5F2E9] p-4 sm:p-5 rounded-2xl shadow-xl border border-[#C99325]/40 max-w-xs">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#C99325]" />
                <span className="text-xs font-bold text-white">Direct & Trusted</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-tight">
                Designed to combine the accessibility of modern marketplaces with the legal rigor of corporate land desks.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. The 4 Pillars */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#C99325]">
            Our Operating Principles
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18241B] tracking-tight mt-1">
            Built on Four Non-Negotiable Standards
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs hover:shadow-lg hover:border-[#013E18]/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#013E18]/10 text-[#013E18] flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-[#013E18]" />
                  </div>
                  <h3 className="text-base font-bold text-[#18241B] mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Leadership & Advisory Board */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#C99325]">
            Leadership
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18241B] tracking-tight mt-1">
            Steered by Regional Land & Legal Experts
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Combining decades of field land acquisition, urban master planning, and real estate jurisprudence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadership.map((person, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-lg transition-all"
            >
              <div className="h-56 bg-stone-100 overflow-hidden">
                <img
                  src={person.image}
                  alt={person.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h4 className="text-base font-bold text-[#18241B]">{person.name}</h4>
                <div className="text-xs font-bold text-[#C99325] mt-0.5">{person.role}</div>
                <p className="text-xs text-stone-500 mt-2.5 leading-relaxed">
                  {person.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA Strip */}
      <section className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#013E18] text-[#F5F2E9] rounded-3xl p-8 sm:p-12 text-center border-2 border-[#C99325]/40 shadow-2xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ready to Discover Your Next Tamil Nadu Property?
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto mt-2">
            Explore 30+ verified plots, individual houses, farmlands, and luxury villas across key growth hubs.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('properties')}
              className="px-6 py-3 rounded-xl bg-[#C99325] text-white hover:bg-[#d99f2b] font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              Explore All Properties
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all border border-white/20 cursor-pointer"
            >
              Contact Our Desk
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
