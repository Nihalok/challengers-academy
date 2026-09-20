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
  Medal
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
  return (
    <section className="relative w-full py-16 sm:py-24 bg-[#FAF8F5] text-slate-900 overflow-hidden border-t border-slate-200/70">
      {/* Decorative colorful ambient gradient orbs */}
      <div className="absolute top-[-5%] right-[-5%] w-[450px] h-[450px] bg-red-200/35 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[450px] h-[450px] bg-sky-200/35 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/25 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* ── Section Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
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

        {/* ── Coach Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {COACHES.map((coach, index) => {
            const RoleIcon = coach.roleIcon;
            return (
              <motion.div
                key={coach.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-3xl sm:rounded-[2rem] border-2 ${coach.cardBorder} p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden h-full ${index === 2 ? 'md:col-span-2 md:max-w-xl md:mx-auto lg:col-span-1 lg:max-w-none w-full' : ''}`}
              >
                {/* Top color gradient accent strip */}
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${coach.topBannerBg}`} />

                <div className="flex-1 flex flex-col">
                  {/* Card Header Badge Row */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm ${coach.roleBadgeBg}`}>
                      <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{coach.number} • {coach.role}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Staff</span>
                    </div>
                  </div>

                  {/* Main Body: Portrait Image + Bio Content */}
                  <div className="flex flex-col gap-5 flex-1">
                    
                    {/* Portrait Frame */}
                    <div className="relative w-full aspect-[4/4.8] rounded-2xl overflow-hidden shrink-0 border-2 border-slate-100 shadow-md bg-slate-100 group-hover:shadow-lg transition-all duration-500">
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
                        <div className="mb-2.5">
                          <h3 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 uppercase tracking-tight leading-tight">
                            {coach.name}
                          </h3>
                          <div className={`text-xs font-bold uppercase tracking-wider ${coach.accentColor} mt-1 flex items-center gap-1.5`}>
                            <span>{coach.tagline}</span>
                          </div>
                        </div>

                        {/* Bio Paragraph */}
                        <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed mb-4">
                          {coach.description}
                        </p>
                      </div>

                      {/* Credentials Strip */}
                      <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-[11px] font-medium tracking-normal mb-4 ${coach.statsBg} ${coach.statsBorder} ${coach.statsText}`}>
                        <Award className="w-4 h-4 shrink-0 opacity-80" />
                        <span className="font-semibold">{coach.credentials}</span>
                      </div>

                      {/* Focus Specialties with Icons */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {coach.specialties.map((spec, sIdx) => {
                          const SpecIcon = spec.icon;
                          return (
                            <span 
                              key={sIdx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-700"
                            >
                              <SpecIcon className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{spec.label}</span>
                            </span>
                          );
                        })}
                      </div>

                    </div>
                  </div>
                </div>

                {/* ── Fully Visible 2x2 Stats Grid with Icons ── */}
                <div className="pt-5 mt-5 border-t border-slate-100 grid grid-cols-2 gap-2.5 sm:gap-3">
                  {coach.statPills.map((pill, i) => {
                    const PillIcon = pill.icon;
                    return (
                      <div
                        key={i}
                        className="py-2.5 px-2 sm:px-3 rounded-2xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/80 text-center flex flex-col justify-center items-center transition-all duration-200"
                      >
                        <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 w-full">
                          <PillIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{pill.label}</span>
                        </div>
                        <span className={`text-xs sm:text-sm font-black font-condensed tracking-tight ${pill.color} text-center leading-tight break-words`}>
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

