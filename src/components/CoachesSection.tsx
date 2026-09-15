import { motion } from 'motion/react';
import { ASSETS } from '../assets/images';
import { Award, Sparkles, Shield, Trophy, CheckCircle2 } from 'lucide-react';

const COACHES = [
  {
    id: 'wilson-mathew',
    number: '01',
    role: 'FOUNDER & HEAD COACH',
    name: 'Wilson Mathew',
    description: 'I started this academy because I believe every player deserves a real coach — someone who shows up, pays attention, and helps them get better in a real way. Over 35 years on the court taught me everything I know.',
    image: ASSETS.ABOUT.COACH_WILSON_ABOUT,
    cardBorder: 'border-red-100 hover:border-red-300',
    topBannerBg: 'from-[#D62828] to-[#990D0D]',
    badgeBg: 'bg-[#D62828] text-white',
    nameColor: 'text-slate-900',
    statsBg: 'bg-red-50/80 border-red-200 text-red-950',
    stats: 'FIVB Level 1 & 2 • Junior India National • 35+ Yrs Exp',
    statPills: [
      { label: 'Athletes Mentored', value: '500+', color: 'text-[#D62828]' },
      { label: 'National Honor', value: 'MVP 2026', color: 'text-amber-600' },
      { label: 'Experience', value: '35+ Yrs', color: 'text-[#D62828]' }
    ]
  },
  {
    id: 'varadha-biju',
    number: '02',
    role: 'ASSISTANT COACH',
    name: 'Varadha Biju',
    description: 'With over five years of volleyball experience, Varadha Biju has represented and earned accolades at the school, college, and varsity levels. Her experience and passion for the sport make her a valuable part of our coaching team.',
    image: ASSETS.ABOUT.COACH_VARADHA,
    cardBorder: 'border-sky-100 hover:border-sky-300',
    topBannerBg: 'from-[#0284C7] to-[#0369A1]',
    badgeBg: 'bg-[#0284C7] text-white',
    nameColor: 'text-slate-900',
    statsBg: 'bg-sky-50/80 border-sky-200 text-sky-950',
    stats: '5+ Yrs Experience • School, College & Varsity Accolades',
    statPills: [
      { label: 'Volleyball Experience', value: '5+ Yrs', color: 'text-[#0284C7]' },
      { label: 'Accolades', value: 'Varsity', color: 'text-sky-700' },
      { label: 'Staff Role', value: 'Assistant Coach', color: 'text-[#0284C7]' }
    ]
  }
];

export default function CoachesSection() {
  return (
    <section className="relative w-full py-16 sm:py-20 bg-[#FAF8F5] text-slate-900 overflow-hidden border-t border-slate-200/70">
      {/* Decorative colorful ambient gradient orbs */}
      <div className="absolute top-[-5%] right-[-5%] w-[450px] h-[450px] bg-red-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[450px] h-[450px] bg-sky-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* ── Crisp Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-3 px-3.5 py-1 rounded-full bg-[#D62828]/10 text-[#D62828] text-[10px] font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Challengers Coaching Staff</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black text-slate-900 tracking-tight leading-tight">
            Meet Our <span className="text-[#D62828] italic">Coaches.</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 font-medium max-w-lg mx-auto leading-relaxed">
            Experienced mentors who coach, inspire, and develop athletes with real court precision and dedication.
          </p>
        </div>

        {/* ── Crisp & Colorful Coach Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {COACHES.map((coach, index) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-[2rem] border-2 ${coach.cardBorder} p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
            >
              {/* Subtle top color gradient bar */}
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${coach.topBannerBg}`} />

              <div>
                {/* Header Badge Row */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <span className={`px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${coach.badgeBg}`}>
                    {coach.number} • {coach.role}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Challengers Academy
                  </span>
                </div>

                {/* Main Body: Portrait Image + Bio */}
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
                  
                  {/* Portrait Card */}
                  <div className="relative w-full sm:w-44 md:w-48 aspect-[4/5] rounded-2xl overflow-hidden shrink-0 border-2 border-slate-100 shadow-md bg-slate-50 group-hover:shadow-lg transition-shadow">
                    <img
                      src={coach.image}
                      alt={coach.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-50" />
                    <span className="absolute bottom-2.5 left-2.5 right-2.5 text-[10px] font-condensed font-black uppercase tracking-wider text-white bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-sm text-center truncate shadow-sm">
                      {coach.name}
                    </span>
                  </div>

                  {/* Coach Bio Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 uppercase tracking-tight mb-2">
                      {coach.name}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed mb-4">
                      {coach.description}
                    </p>
                    
                    {/* Credentials Banner */}
                    <div className={`inline-block w-full px-3.5 py-2 rounded-xl border text-[10px] sm:text-[11px] font-mono font-bold tracking-wide ${coach.statsBg}`}>
                      {coach.stats}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Stat Highlights */}
              <div className="pt-5 mt-6 border-t border-slate-100 grid grid-cols-3 gap-2 sm:gap-3">
                {coach.statPills.map((pill, i) => (
                  <div
                    key={i}
                    className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-center"
                  >
                    <span className={`text-sm sm:text-base font-black font-condensed tracking-tight ${pill.color}`}>
                      {pill.value}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-0.5 truncate">
                      {pill.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
