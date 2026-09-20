import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ASSETS } from '../assets/images';
import { 
  Award, 
  Sparkles, 
  Clock, 
  Users, 
  Trophy, 
  Target, 
  Zap, 
  ShieldCheck, 
  BadgeCheck, 
  Crown,
  Medal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CoachData {
  id: string;
  number: string;
  role: string;
  roleBadgeBg: string;
  roleIcon: typeof Crown;
  name: string;
  tagline: string;
  description: string;
  image: string;
  imagePosition?: string;
  cardBorder: string;
  topBannerBg: string;
  accentColor: string;
  statsBg: string;
  statsBorder: string;
  statsText: string;
  credentials: string;
  specialties: { icon: typeof Target; label: string }[];
  statPills: {
    icon: typeof Clock;
    label: string;
    value: string;
    color: string;
  }[];
}

const COACHES: CoachData[] = [
  {
    id: 'wilson-mathew',
    number: '01',
    role: 'Founder & Head Coach',
    roleBadgeBg: 'bg-[#D62828] text-white shadow-red-500/20',
    roleIcon: Crown,
    name: 'Wilson Mathew',
    tagline: 'FIVB Certified • Former National Player',
    description: 'Over 35 years of high-performance Volleyball leadership. Dedicated to developing elite technical mechanics, court intelligence, and a championship mindset in every athlete.',
    image: ASSETS.ABOUT.COACH_WILSON_ABOUT,
    imagePosition: 'object-top',
    cardBorder: 'border-red-100 hover:border-red-300/80 hover:shadow-red-500/10',
    topBannerBg: 'from-[#D62828] via-[#E63946] to-[#990D0D]',
    accentColor: 'text-[#D62828]',
    statsBg: 'bg-red-50/90',
    statsBorder: 'border-red-200/80',
    statsText: 'text-red-950',
    credentials: 'FIVB Level 1 & 2 Certified • Junior Indian Camp Attended • 35+ Yrs Exp',
    specialties: [
      { icon: Target, label: 'Advanced Spiking & Blocking' },
      { icon: Zap, label: 'Tactical Match Strategy' },
      { icon: ShieldCheck, label: 'Championship Mentorship' }
    ],
    statPills: [
      { icon: Clock, label: 'Experience', value: '35+ Years', color: 'text-[#D62828]' },
      { icon: Medal, label: 'National Honor', value: 'Former National Player', color: 'text-[#D62828]' },
      { icon: Users, label: 'Athletes Mentored', value: '500+ Players', color: 'text-[#D62828]' },
      { icon: Trophy, label: 'Championship', value: 'MVP 2026', color: 'text-[#D62828]' }
    ]
  },
  {
    id: 'varadha-biju',
    number: '02',
    role: 'Assistant Coach',
    roleBadgeBg: 'bg-[#0284C7] text-white shadow-sky-500/20',
    roleIcon: Medal,
    name: 'Varadha Biju',
    tagline: 'Varsity Decorated • Youth Specialist',
    description: 'Over 5 years of competitive Volleyball excellence across School, College, and Varsity levels. Specializes in youth skill progression, defensive agility, setting mechanics, and match confidence.',
    image: ASSETS.ABOUT.COACH_VARADHA,
    imagePosition: 'object-top',
    cardBorder: 'border-sky-100 hover:border-sky-300/80 hover:shadow-sky-500/10',
    topBannerBg: 'from-[#0284C7] via-[#38BDF8] to-[#0369A1]',
    accentColor: 'text-[#0284C7]',
    statsBg: 'bg-sky-50/90',
    statsBorder: 'border-sky-200/80',
    statsText: 'text-sky-950',
    credentials: 'Varsity Honors • Youth Skill Progression • 5+ Yrs Court Exp',
    specialties: [
      { icon: Target, label: 'Youth Fundamentals' },
      { icon: Zap, label: 'Defensive Agility Drills' },
      { icon: ShieldCheck, label: 'Setting & Form Tactics' }
    ],
    statPills: [
      { icon: Clock, label: 'Experience', value: '5+ Years', color: 'text-[#0284C7]' },
      { icon: Medal, label: 'Accolades', value: 'Varsity Athlete', color: 'text-[#0284C7]' },
      { icon: Users, label: 'Athletes Trained', value: '100+ Players', color: 'text-[#0284C7]' },
      { icon: Trophy, label: 'Specialty', value: 'Youth Drills', color: 'text-[#0284C7]' }
    ]
  },
  {
    id: 'rohit-kumar',
    number: '03',
    role: 'Assistant Coach',
    roleBadgeBg: 'bg-[#D97706] text-white shadow-amber-500/20',
    roleIcon: Trophy,
    name: 'Rohit Kumar',
    tagline: 'SJSU • Mountain House HS • Tournament MVP',
    description: 'San José State University student and Mountain House High School alumnus bringing 7 years of competitive Volleyball and 3 years of Coaching experience. A proven competitor with 2 years of Varsity High School and 1 year of Club Volleyball, earning MVP honors in CBVC 18u at Jimmy George, 1st place finishes at Jimmy George and Lukochan Memorials, and 2nd place at the 2023 Boys Junior Nationals Cup.',
    image: ASSETS.ABOUT.COACH_ROHIT,
    imagePosition: 'object-[center_20%]',
    cardBorder: 'border-amber-100 hover:border-amber-300/80 hover:shadow-amber-500/10',
    topBannerBg: 'from-[#D97706] via-[#F59E0B] to-[#B45309]',
    accentColor: 'text-[#D97706]',
    statsBg: 'bg-amber-50/90',
    statsBorder: 'border-amber-200/80',
    statsText: 'text-amber-950',
    credentials: 'Mountain House HS & SJSU • 2x Champion • CBVC 18u MVP',
    specialties: [
      { icon: Target, label: 'Varsity & Club Mechanics' },
      { icon: Zap, label: 'Tournament Preparation' },
      { icon: ShieldCheck, label: 'Youth & HS Mentorship' }
    ],
    statPills: [
      { icon: Clock, label: 'Experience', value: '7 Yrs Play • 3 Yrs Coach', color: 'text-[#D97706]' },
      { icon: Trophy, label: 'National Honor', value: '2nd Pl Jr Nationals', color: 'text-[#D97706]' },
      { icon: Medal, label: 'Tournament MVP', value: 'CBVC 18u MVP', color: 'text-[#D97706]' },
      { icon: Award, label: 'Championships', value: '2x 1st Place Titles', color: 'text-[#D97706]' }
    ]
  }
];

export default function CoachesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth === 0) return;
    const index = Math.round(scrollLeft / (clientWidth * 0.82));
    setActiveIndex(Math.min(Math.max(index, 0), COACHES.length - 1));
  };

  const scrollToCoach = (index: number) => {
    if (!scrollRef.current) return;
    const cards = scrollRef.current.children;
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setActiveIndex(index);
    }
  };

  return (
    <section className="relative w-full py-16 sm:py-24 bg-[#FAF8F5] text-slate-900 overflow-hidden border-t border-slate-200/70">
      {/* Decorative colorful ambient gradient orbs */}
      <div className="absolute top-[-5%] right-[-5%] w-[450px] h-[450px] bg-red-200/35 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[450px] h-[450px] bg-sky-200/35 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/25 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* ── Section Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 mb-3.5 px-4 py-1.5 rounded-full bg-[#D62828]/10 text-[#D62828] text-[11px] font-black uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Challengers Coaching Staff</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black text-slate-900 tracking-tight leading-tight">
            Meet Our <span className="text-[#D62828] italic">Coaches.</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 font-medium max-w-xl mx-auto leading-relaxed">
            Experienced mentors who coach, inspire, and develop athletes with real court precision, discipline, and passion.
          </p>
        </div>

        {/* ── MOBILE VIEW: SIDE-WISE SCROLLABLE CAROUSEL (Touch/Swipe friendly) ── */}
        <div className="block md:hidden">
          {/* Swipe Indicator & Progress Bar */}
          <div className="flex items-center justify-between px-2 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-[#D62828]" />
              Swipe sideways to explore
            </span>
            <span className="text-[#D62828] font-black text-xs font-mono">
              Coach {activeIndex + 1} of {COACHES.length}
            </span>
          </div>

          {/* Horizontal Scrollable Track */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-2 pb-4 -mx-2 scrollbar-none touch-pan-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {COACHES.map((coach) => {
              const RoleIcon = coach.roleIcon;
              return (
                <div
                  key={coach.id}
                  className={`w-[86vw] max-w-[340px] shrink-0 snap-center bg-white rounded-3xl border-2 ${coach.cardBorder} p-5 shadow-xl flex flex-col justify-between relative overflow-hidden`}
                >
                  {/* Top color gradient accent strip */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${coach.topBannerBg}`} />

                  <div>
                    {/* Header Badge Row */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${coach.roleBadgeBg}`}>
                        <RoleIcon className="w-3 h-3 shrink-0" />
                        <span>{coach.number} • {coach.role}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified</span>
                      </div>
                    </div>

                    {/* Portrait Frame */}
                    <div className="relative w-full aspect-[4/4.5] rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-md bg-slate-100 mb-4">
                      <img
                        src={coach.image}
                        alt={coach.name}
                        className={`w-full h-full object-cover ${coach.imagePosition || 'object-top'}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-center">
                        <span className="inline-block text-[10px] font-condensed font-black uppercase tracking-wider text-white bg-slate-900/90 px-3 py-1 rounded-lg backdrop-blur-md shadow-xs">
                          {coach.name}
                        </span>
                      </div>
                    </div>

                    {/* Bio & Details */}
                    <div>
                      <h3 className="text-2xl font-serif font-black text-slate-900 uppercase tracking-tight leading-tight">
                        {coach.name}
                      </h3>
                      <div className={`text-xs font-bold uppercase tracking-wider ${coach.accentColor} mt-1 mb-2.5`}>
                        {coach.tagline}
                      </div>

                      <p className="text-slate-600 text-xs font-normal leading-relaxed mb-3.5">
                        {coach.description}
                      </p>

                      {/* Credentials Strip */}
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-medium tracking-normal mb-3.5 ${coach.statsBg} ${coach.statsBorder} ${coach.statsText}`}>
                        <Award className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span className="font-semibold leading-tight">{coach.credentials}</span>
                      </div>

                      {/* Focus Specialties */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {coach.specialties.map((spec, sIdx) => {
                          const SpecIcon = spec.icon;
                          return (
                            <span 
                              key={sIdx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200/80 text-[9px] font-bold uppercase tracking-wider text-slate-700"
                            >
                              <SpecIcon className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{spec.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 2x2 Stats Grid with complete visible text (no truncation) */}
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                    {coach.statPills.map((pill, i) => {
                      const PillIcon = pill.icon;
                      return (
                        <div
                          key={i}
                          className="py-2 px-2 rounded-xl bg-slate-50/90 border border-slate-200/80 text-center flex flex-col justify-center items-center"
                        >
                          <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 w-full text-center">
                            <PillIcon className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="leading-tight break-words">{pill.label}</span>
                          </div>
                          <span className={`text-xs font-black font-condensed tracking-tight ${pill.color} text-center leading-tight break-words`}>
                            {pill.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Mobile Carousel Bottom Navigation Dots & Arrows */}
          <div className="flex items-center justify-between px-3 mt-3">
            <button
              onClick={() => scrollToCoach(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              aria-label="Previous coach"
              className="p-2 rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {COACHES.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => scrollToCoach(i)}
                  aria-label={`Go to ${c.name}`}
                  className={`transition-all duration-300 rounded-full ${
                    activeIndex === i 
                      ? 'w-7 h-2 bg-[#D62828]' 
                      : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => scrollToCoach(Math.min(COACHES.length - 1, activeIndex + 1))}
              disabled={activeIndex === COACHES.length - 1}
              aria-label="Next coach"
              className="p-2 rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── DESKTOP VIEW: ONE BY ONE DOWNWARD (Expansive, clean, zero text truncation) ── */}
        <div className="hidden md:flex flex-col gap-8 lg:gap-10 max-w-5xl mx-auto">
          {COACHES.map((coach, index) => {
            const RoleIcon = coach.roleIcon;
            return (
              <motion.div
                key={coach.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-3xl lg:rounded-[2rem] border-2 ${coach.cardBorder} p-7 lg:p-9 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group`}
              >
                {/* Top color gradient accent strip */}
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${coach.topBannerBg}`} />

                {/* Header Badge Row */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${coach.roleBadgeBg}`}>
                    <RoleIcon className="w-4 h-4 shrink-0" />
                    <span>{coach.number} • {coach.role}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  
                  </div>
                </div>

                {/* Main Body: Horizontal Layout (Portrait Image Left + Full Bio Right) */}
                <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
                  
                  {/* Portrait Frame */}
                  <div className="relative w-full md:w-56 lg:w-64 aspect-[3/4] rounded-2xl overflow-hidden shrink-0 border-2 border-slate-100 shadow-md bg-slate-100 group-hover:shadow-lg transition-all duration-500">
                    <img
                      src={coach.image}
                      alt={coach.name}
                      className={`w-full h-full object-cover ${coach.imagePosition || 'object-top'} group-hover:scale-105 transition-transform duration-700 ease-out`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-center">
                      <span className="inline-block text-[11px] font-condensed font-black uppercase tracking-wider text-white bg-slate-900/85 px-3 py-1 rounded-lg backdrop-blur-md shadow-sm">
                        {coach.name}
                      </span>
                    </div>
                  </div>

                  {/* Bio & Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {/* Coach Name & Subtitle */}
                      <div className="mb-3">
                        <h3 className="text-3xl lg:text-4xl font-serif font-black text-slate-900 uppercase tracking-tight leading-tight">
                          {coach.name}
                        </h3>
                        <div className={`text-xs lg:text-sm font-bold uppercase tracking-wider ${coach.accentColor} mt-1.5 flex items-center gap-1.5`}>
                          <span>{coach.tagline}</span>
                        </div>
                      </div>

                      {/* Bio Paragraph */}
                      <p className="text-slate-600 text-sm lg:text-base font-normal leading-relaxed mb-4">
                        {coach.description}
                      </p>

                      {/* Credentials Strip */}
                      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs lg:text-sm font-medium tracking-normal mb-4 ${coach.statsBg} ${coach.statsBorder} ${coach.statsText}`}>
                        <Award className="w-4 h-4 shrink-0 opacity-80" />
                        <span className="font-semibold">{coach.credentials}</span>
                      </div>

                      {/* Focus Specialties with Icons */}
                      <div className="flex flex-wrap gap-2">
                        {coach.specialties.map((spec, sIdx) => {
                          const SpecIcon = spec.icon;
                          return (
                            <span 
                              key={sIdx}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-700"
                            >
                              <SpecIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>{spec.label}</span>
                            </span>
                          );
                        })}
                      </div>

                    </div>
                  </div>
                </div>

                {/* ── Wide 4-Column Stat Highlights Row with No Truncation ── */}
                <div className="pt-6 mt-6 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {coach.statPills.map((pill, i) => {
                    const PillIcon = pill.icon;
                    return (
                      <div
                        key={i}
                        className="py-3 px-3 lg:px-4 rounded-2xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/80 text-center flex flex-col justify-center items-center transition-all duration-200"
                      >
                        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 w-full">
                          <PillIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-center break-words">{pill.label}</span>
                        </div>
                        <span className={`text-sm lg:text-base font-black font-condensed tracking-tight ${pill.color} text-center leading-tight break-words`}>
                          {pill.value}
                        </span>
                      </div>
                    );
                  })}
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}


