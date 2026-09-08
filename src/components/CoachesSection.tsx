import { motion } from 'motion/react';
import { ASSETS } from '../assets/images';

const COACH_SECTIONS = [
  {
    id: 'section1',
    number: '01',
    role: 'FOUNDER & HEAD COACH',
    name: 'Head Coach Wilson Mathew',
    description: 'I started this academy because I believe every player deserves a real coach - someone who shows up, pays attention, and helps them get better in a real way. Over 30 years on the court taught me everything I know.',
    image: ASSETS.ABOUT.COACH_PORTRAIT,
    bgTexture: ASSETS.HERO.ACTION_CARD_4,
    gradient: 'from-[#C1272D] via-[#D62828] to-[#990D0D]',
    badgeBg: '#F9BC00',
    badgeText: '#1A1A1A',
    stats: 'FIVB Level 1 & 2 • Junior India National • 30+ Yrs Exp',
    statPills: [
      { label: 'Athletes Mentored', value: '500+' },
      { label: 'National Honor', value: 'MVP 2026' }
    ]
  },
  {
    id: 'section2',
    number: '02',
    role: 'DEFENSE & LIBERO SPECIALIST',
    name: 'Sarah Jenkins',
    description: 'Stanford-trained and NCAA D1 experienced - Sarah brings sharp defensive skills and a training style that pushes players to react faster, move smarter, and compete at a higher level.',
    image: ASSETS.ABOUT.COACH_SARAH,
    bgTexture: ASSETS.HERO.ACTION_CARD_2,
    gradient: 'from-[#F26627] via-[#F3722C] to-[#D64500]',
    badgeBg: '#FBF9F6',
    badgeText: '#D62828',
    stats: 'NCAA Division I • USAV CAP I Certified',
    statPills: [
      { label: 'Stanford Alumna', value: 'NCAA D1' },
      { label: 'Specialty', value: 'Libero / Defense' }
    ]
  },
  {
    id: 'section3',
    number: '03',
    role: 'SETTING & OFFENSE COORDINATOR',
    name: 'Michael Chen',
    description: 'Michael spent 15+ years playing professional volleyball across Asia. He now puts all of that experience into coaching setters and offense - helping players read the court and make smarter decisions.',
    image: ASSETS.ABOUT.COACH_MICHAEL,
    bgTexture: ASSETS.HERO.ACTION_CARD_3,
    gradient: 'from-[#F9BC00] via-[#E5AB00] to-[#C79300]',
    badgeBg: '#1B1B1D',
    badgeText: '#FFFFFF',
    stats: 'FIVB Level 1 • Former Pro Player (Asia)',
    statPills: [
      { label: 'Pro Experience', value: '15+ Years' },
      { label: 'Focus', value: 'Setting & Offense' }
    ]
  },
  {
    id: 'section4',
    number: '04',
    role: 'YOUTH DEVELOPMENT COACH',
    name: 'Elena Rodriguez',
    description: 'Elena works with our youngest players and loves it. She makes practice fun while building the right habits from day one - footwork, ball control, and a love for the game.',
    image: ASSETS.ABOUT.COACH_ELENA,
    bgTexture: ASSETS.HERO.ACTION_CARD_1,
    gradient: 'from-[#E63946] via-[#D62828] to-[#A01A24]',
    badgeBg: '#F9BC00',
    badgeText: '#1A1A1A',
    stats: 'NFHS Certified • 10+ Years Club Coaching',
    statPills: [
      { label: 'Club Coaching', value: '10+ Years' },
      { label: 'Focus', value: 'Youth Foundations' }
    ]
  }
];

export default function CoachesSection() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* ── Dynamic Sports Header ── */}
      <div className="py-14 text-center bg-gradient-to-r from-yellow via-orange to-crimson text-white relative z-10">
        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/90 drop-shadow-sm">
          Challengers Coaching Staff
        </span>
        <h2 className="text-4xl md:text-6xl font-condensed font-black uppercase tracking-tight text-white mt-1 drop-shadow-md">
          MEET OUR <span className="font-serif-italic lowercase italic text-yellow">coaches.</span>
        </h2>
        <p className="text-white/80 text-xs md:text-sm max-w-md mx-auto mt-2 font-medium">
          Scroll to meet the people who coach our players every week.
        </p>
      </div>

      {/* ── Vibrant Pinned Full-Screen Sections ── */}
      <div className="relative">
        {COACH_SECTIONS.map((section, index) => {
          const isDarkText = section.gradient.includes('F9BC00');
          const textColor = isDarkText ? 'text-espresso' : 'text-white';
          const subtextColor = isDarkText ? 'text-espresso/80' : 'text-white/85';

          return (
            <div
              key={section.id}
              id={section.id}
              className={`sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-gradient-to-br ${section.gradient}`}
              style={{ zIndex: index + 1 }}
            >
              {/* Background texture & action overlay */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                  src={section.bgTexture}
                  alt=""
                  className="w-full h-full object-cover opacity-15 mix-blend-overlay scale-110 filter blur-[1px]"
                />
                {/* Decorative dynamic circles */}
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-black/10 blur-3xl pointer-events-none" />
              </div>

              {/* Pin Wrapper Content */}
              <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 md:px-16 flex flex-col md:flex-row items-center justify-between">

                {/* LEFT TEXT BOX (Exact match to .text spec with vibrant styling) */}
                <motion.div
                  initial={{ opacity: 0, x: -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ margin: '-100px' }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full md:w-[50%] text-left pt-6 sm:pt-12 md:pt-0"
                >
                  {/* Number & Role Badge */}
                  <div className="mb-2 sm:mb-4">
                    <span
                      className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-md"
                      style={{
                        backgroundColor: section.badgeBg,
                        color: section.badgeText,
                      }}
                    >
                      {section.number} - {section.role}
                    </span>
                  </div>

                  {/* Coach Name */}
                  <h3 className={`text-3xl sm:text-5xl md:text-7xl font-condensed font-black uppercase tracking-tight ${textColor} mb-2 sm:mb-4 leading-none drop-shadow-sm`}>
                    {section.name}
                  </h3>

                  {/* Description Paragraph */}
                  <p className={`${subtextColor} text-sm sm:text-xl md:text-2xl lg:text-3xl font-extralight leading-[1.3] sm:leading-[1.35] tracking-wide font-sans mb-4 sm:mb-8 drop-shadow-sm line-clamp-3 sm:line-clamp-none`}>
                    "{section.description}"
                  </p>

                  {/* Credentials & Stat Pills Row */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-mono text-[10px] sm:text-xs uppercase tracking-wider shadow-sm">
                      {section.stats}
                    </div>
                    {section.statPills.map((s, i) => (
                      <div
                        key={i}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/90 backdrop-blur-md border border-white/50 text-espresso shadow-md"
                      >
                        <div className="text-xs sm:text-sm font-black font-condensed text-crimson">
                          {s.value}
                        </div>
                        <div className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-espresso/60">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* RIGHT FLOATING IMAGE CARD (Exact match to .image spec with 480px vibrant card) */}
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ margin: '-100px' }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full md:w-auto flex justify-center md:justify-end pb-8 sm:pb-12 md:pb-0 shrink-0"
                >
                  <div className="relative w-[180px] sm:w-[280px] md:w-[440px] lg:w-[480px] h-[180px] sm:h-[280px] md:h-[440px] lg:h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.35)] border-4 border-white/40 group bg-white">
                    <img
                      src={section.image}
                      alt={section.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    {/* Card Bottom Label */}
                    <div className="absolute bottom-5 left-5 right-5 p-3.5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-espresso/40 block">
                          Challengers Volleyball
                        </span>
                        <span className="text-base font-black text-espresso font-condensed uppercase tracking-wider">
                          {section.name}
                        </span>
                      </div>
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shadow-md"
                        style={{
                          backgroundColor: section.badgeBg,
                          color: section.badgeText,
                        }}
                      >
                        {section.number}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Scroll Down Indicator */}
              {index < COACH_SECTIONS.length - 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-20 pointer-events-none opacity-80">
                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${textColor}`}>
                    Scroll
                  </span>
                  <div className={`w-3 h-3 border-b-2 border-r-2 ${isDarkText ? 'border-espresso' : 'border-white'} rotate-45 animate-bounce`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
